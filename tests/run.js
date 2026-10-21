#!/usr/bin/env node
// Tiered, cached, quiet test runner (2026-10-21, workflow audit). The test LIST stays in tests/run-all.sh (one source of truth);
// this runner reads it and adds what run-all.sh lacks:
//   - quiet output: one summary line, plus the tail of each failing test only
//   - a result cache: a test that passed on byte-identical inputs is skipped and reported as "cached", never as "passed"
//   - tiers: --smoke (about a minute), default (every listed test, cache on), --full (cache off), --e2e (adds the browser tests)
//   - timings: tests/out/test-timings.json, so slow tests are visible
//
//   node tests/run.js --smoke            cheap checks first
//   node tests/run.js                    everything listed in run-all.sh, skipping cached passes
//   node tests/run.js --only 'raid|forge'  tests whose file name matches the regex
//   node tests/run.js --full -j 2        no cache (use before a release), 2 at a time
//   node tests/run.js --e2e              also the Playwright tests listed under --e2e in run-all.sh
//   node tests/run.js --list             print what would run and why, run nothing
//
// A test's inputs are: its own file, every repo file it names (by file name, or a quoted folder name such as 'lang'),
// and the same for any tests/lib helper it requires. If a test names nothing recognisable, all source inputs count.
'use strict';
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { spawn } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'tests', 'out');
const CACHE_FILE = path.join(OUT, 'test-cache.json');
const TIMINGS_FILE = path.join(OUT, 'test-timings.json');

// Fast checks that catch most breakage. Keep it near a minute; add a test here only if it is cheap.
const SMOKE = ['syntax', 'integrity', 'card-pass-2026-10-19', 'i18n-ui-2026-10-18', 'd-2026-10-19', 'scenarios', 'two-player'];

const args = process.argv.slice(2);
const flag = n => args.includes(n);
const opt = (n, d) => { const i = args.indexOf(n); return i >= 0 && args[i + 1] ? args[i + 1] : d; };
const MODE = flag('--smoke') ? 'smoke' : 'all';
const NO_CACHE = flag('--full') || flag('--no-cache');
const ONLY = opt('--only', null);
const JOBS = Math.max(1, parseInt(opt('-j', '2'), 10) || 2);
const LIST = flag('--list');

// ---- the list, read from run-all.sh ----
const runAll = fs.readFileSync(path.join(ROOT, 'tests', 'run-all.sh'), 'utf8');
function parseRuns(text) {
  const out = [];
  const re = /\brun (node|python3) (tests\/[^\s;]+)((?: [^;\n]*?)?)(?=;|\n|$)/g;
  let m;
  while ((m = re.exec(text))) out.push({ cmd: m[1], file: m[2], extra: (m[3] || '').replace(/\s#.*$/, '').trim() }); // a trailing # comment is not an argument
  return out;
}
const lines = runAll.split('\n');
const e2eLine = lines.find(l => l.includes('--e2e') && l.includes('then')) || '';
const unitRuns = parseRuns(lines.filter(l => l !== e2eLine).join('\n'));
// browser tests (tests/e2e/*) only run with --e2e, wherever run-all.sh lists them
const isE2E = r => r.file.startsWith('tests/e2e/');
const e2eRuns = flag('--e2e') ? parseRuns(e2eLine).concat(unitRuns.filter(isE2E)) : [];
let tests = unitRuns.filter(r => !isE2E(r)).concat(e2eRuns).map(r => Object.assign(r, { name: path.basename(r.file).replace(/\.(js|py)$/, '') + (r.extra ? ' ' + r.extra : '') }));
if (MODE === 'smoke') tests = tests.filter(t => SMOKE.includes(path.basename(t.file).replace(/\.js$/, '')) && !t.extra);
if (ONLY) { const re = new RegExp(ONLY); tests = tests.filter(t => re.test(t.file)); }

// ---- inputs and hashes ----
function walk(dir, filter) {
  const abs = path.join(ROOT, dir);
  if (!fs.existsSync(abs)) return [];
  return fs.readdirSync(abs, { withFileTypes: true }).flatMap(e => {
    const rel = path.join(dir, e.name);
    if (e.isDirectory()) return walk(rel, filter);
    return filter(rel) ? [rel] : [];
  });
}
const CANDIDATES = [
  ...fs.readdirSync(ROOT).filter(f => /\.(js|html|py|json)$/.test(f)),
  ...walk('canonical', f => f.endsWith('.json')),
  ...walk('lang', f => f.endsWith('.json')),
  ...walk('assets/lang', f => f.endsWith('.js')),
  ...walk('tests/golden', () => true),
  ...walk('tests/scenarios', () => true),
  ...walk('tools', f => /\.(js|py|json)$/.test(f) && !f.includes('node_modules')),
  ...walk('docs', f => /\.(json|xlsx)$/.test(f)),
].filter(f => !f.startsWith('tests/out'));
const ALL_SOURCES = CANDIDATES.filter(f => !f.startsWith('tools/') && !f.startsWith('docs/'));
const hashCache = new Map();
function fileHash(rel) {
  if (hashCache.has(rel)) return hashCache.get(rel);
  let h = 'missing';
  try { h = crypto.createHash('sha1').update(fs.readFileSync(path.join(ROOT, rel))).digest('hex'); } catch (e) { }
  hashCache.set(rel, h);
  return h;
}
const refMemo = new Map();
function referencedInputs(rel, seen = new Set()) {
  if (refMemo.has(rel)) return refMemo.get(rel);
  if (seen.has(rel)) return new Set();
  seen.add(rel);
  let src = '';
  try { src = fs.readFileSync(path.join(ROOT, rel), 'utf8'); } catch (e) { }
  const refs = new Set([rel]);
  for (const c of CANDIDATES) {
    const base = path.basename(c);
    const dir = path.dirname(c).split(path.sep).pop();
    if (src.includes(base) || (dir && dir !== '.' && new RegExp(`['"\`]${dir}['"\`/]`).test(src))) refs.add(c);
  }
  // local helpers it requires (tests/lib/*, other test files): their inputs count too
  const reqRe = /require\(\s*(?:path\.join\([^)]*?)?['"`]([^'"`]+)['"`]/g;
  let m;
  while ((m = reqRe.exec(src))) {
    const spec = m[1];
    if (!spec.startsWith('.') && !spec.includes('/')) continue;
    for (const cand of [path.join(path.dirname(rel), spec), path.join(path.dirname(rel), spec + '.js'), spec, spec + '.js']) {
      if (fs.existsSync(path.join(ROOT, cand)) && fs.statSync(path.join(ROOT, cand)).isFile()) {
        referencedInputs(cand, seen).forEach(r => refs.add(r));
        break;
      }
    }
  }
  if (refs.size === 1 && rel.startsWith('tests/')) ALL_SOURCES.forEach(s => refs.add(s)); // names nothing we know: depend on everything
  refMemo.set(rel, refs);
  return refs;
}
function inputKey(t) {
  const refs = [...referencedInputs(t.file)].sort();
  const h = crypto.createHash('sha1');
  h.update(process.version + '\n' + t.cmd + ' ' + t.file + ' ' + t.extra + '\n');
  refs.forEach(r => h.update(r + ':' + fileHash(r) + '\n'));
  return { key: h.digest('hex'), refs };
}

// ---- cache ----
fs.mkdirSync(OUT, { recursive: true });
let cache = {};
try { cache = JSON.parse(fs.readFileSync(CACHE_FILE, 'utf8')); } catch (e) { }
let timings = {};
try { timings = JSON.parse(fs.readFileSync(TIMINGS_FILE, 'utf8')); } catch (e) { }

const plan = tests.map(t => { const k = inputKey(t); return Object.assign(t, k, { cached: !NO_CACHE && cache[t.name] === k.key }); });
if (LIST) {
  plan.forEach(t => console.log(`${t.cached ? 'cached' : 'run   '}  ${t.name}  (${t.refs.length} inputs${timings[t.name] ? ', last ' + timings[t.name].toFixed(1) + 's' : ''})`));
  process.exit(0);
}

// ---- run ----
const started = Date.now();
const results = [];
const queue = plan.filter(t => !t.cached).sort((a, b) => (timings[b.name] || 0) - (timings[a.name] || 0)); // slowest first
function runOne(t) {
  return new Promise(resolve => {
    const t0 = Date.now();
    const argv = [t.file, ...(t.extra ? t.extra.split(/\s+/) : [])];
    const p = spawn(t.cmd, argv, { cwd: ROOT, env: process.env });
    let out = '';
    p.stdout.on('data', d => { out += d; if (out.length > 400000) out = out.slice(-200000); });
    p.stderr.on('data', d => { out += d; if (out.length > 400000) out = out.slice(-200000); });
    p.on('close', code => {
      const secs = (Date.now() - t0) / 1000;
      timings[t.name] = secs;
      results.push({ t, code, secs, out });
      if (code === 0) cache[t.name] = t.key; else delete cache[t.name];
      resolve();
    });
  });
}
async function worker() { while (queue.length) await runOne(queue.shift()); }
Promise.all(Array.from({ length: Math.min(JOBS, queue.length || 1) }, worker)).then(() => {
  fs.writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 1));
  fs.writeFileSync(TIMINGS_FILE, JSON.stringify(Object.fromEntries(Object.entries(timings).sort((a, b) => b[1] - a[1])), null, 1));
  const failed = results.filter(r => r.code !== 0);
  for (const r of failed) {
    console.log(`\n✗ ${r.t.name} (exit ${r.code}, ${r.secs.toFixed(1)}s) — last lines:`);
    console.log(r.out.trim().split('\n').slice(-25).map(l => '  ' + l).join('\n'));
  }
  const cachedN = plan.filter(t => t.cached).length;
  const slow = results.slice().sort((a, b) => b.secs - a.secs).slice(0, 3).map(r => `${r.t.name} ${r.secs.toFixed(0)}s`).join(', ');
  console.log(`\n${MODE === 'smoke' ? 'smoke' : 'tests'}: ${results.length - failed.length} passed, ${failed.length} failed, ${cachedN} skipped (passed before on identical inputs)` +
    ` · ${((Date.now() - started) / 1000).toFixed(0)}s${slow ? ' · slowest: ' + slow : ''}`);
  process.exit(failed.length ? 1 : 0);
});
