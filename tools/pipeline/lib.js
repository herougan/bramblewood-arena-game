'use strict';
// SPEED1 (2026-10-31): shared helpers of the balance pipeline (tools/pipeline/run.sh <step>).
const fs = require('fs'), path = require('path'), cp = require('child_process'), crypto = require('crypto');
const ROOT = path.resolve(__dirname, '..', '..');
const OUTDIR = process.env.PIPELINE_OUT ? path.resolve(process.env.PIPELINE_OUT) : path.join(ROOT, 'docs', 'balance', 'pipeline'), STATE = path.join(OUTDIR, 'state'); // PIPELINE_OUT: a test's own folder
const CONFIG = JSON.parse(fs.readFileSync(path.join(__dirname, 'config.json'), 'utf8'));
const SCHEMA = CONFIG.schema;
const r2 = v => Math.round(v * 100) / 100;
const pad = n => String(n).padStart(2, '0');
function stamp(d) { d = d || new Date(); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}`; }
function sha(file, n) { try { return crypto.createHash('sha1').update(fs.readFileSync(path.join(ROOT, file))).digest('hex').slice(0, n || 10); } catch (e) { return null; } }
function readJson(f, dflt) { try { return JSON.parse(fs.readFileSync(f, 'utf8')); } catch (e) { if (dflt !== undefined) return dflt; throw e; } }
function writeJson(f, j) { fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, JSON.stringify(j, null, 1) + '\n'); }
// argv -> { _: [positional], flag: value | true }; `valued` lists the flags that take the next word
function parseArgs(argv, valued) {
  const o = { _: [] }; valued = new Set(valued || []);
  for (let i = 0; i < argv.length; i++) { const a = argv[i];
    if (a.startsWith('--')) { const k = a.slice(2), eq = k.indexOf('=');
      if (eq > 0) o[k.slice(0, eq)] = k.slice(eq + 1); else if (valued.has(k)) o[k] = argv[++i]; else o[k] = true; }
    else o._.push(a); }
  return o;
}
// run a command to the end, capture its output, time it. opts.log: a file to also write the full output to
function run(cmd, args, opts) {
  opts = opts || {}; const t0 = Date.now();
  const r = cp.spawnSync(cmd, args, { cwd: ROOT, encoding: 'utf8', maxBuffer: 512 << 20, env: Object.assign({}, process.env, opts.env || {}), stdio: ['ignore', 'pipe', 'pipe'], timeout: opts.timeoutMs });
  const out = (r.stdout || '') + (r.stderr || '');
  if (opts.log) { fs.mkdirSync(path.dirname(opts.log), { recursive: true }); fs.writeFileSync(opts.log, out); }
  return { code: r.status == null ? 1 : r.status, out, sec: (Date.now() - t0) / 1000, signal: r.signal };
}
function vcsHead() { const r = run('git', ['rev-parse', '--short', 'HEAD']); return r.code === 0 ? r.out.trim() : null; }
function fingerprint() { return require(path.join(ROOT, 'tools', 'bench', 'lib.js')).fingerprint(); }
// the summary every step writes: docs/balance/pipeline/<step>-<YYYY-MM-DD-HHMM>.json
function newSummary(step, args) {
  return { schema: SCHEMA, step, status: 'ok', started: new Date().toISOString(), finished: null, durationSec: null, args: args || [], head: vcsHead(),
    inputs: {}, counts: {}, changed: [], flagged: [], cached: { hits: 0, played: 0 }, notes: [], files: [], tests: null, stages: null };
}
function finish(S, t0) {
  S.finished = new Date().toISOString(); S.durationSec = Math.round((Date.now() - t0) / 100) / 10;
  const f = path.join(OUTDIR, `${S.step}-${stamp(new Date(t0))}.json`); S.file = path.relative(ROOT, f); writeJson(f, S); return S;
}
function fmtDur(s) { if (s == null) return '-'; if (s < 90) return s.toFixed(0) + 's'; if (s < 5400) return (s / 60).toFixed(1) + 'min'; return (s / 3600).toFixed(1) + 'h'; }
// at most 20 lines
function printSummary(S) {
  const L = [];
  L.push(`pipeline ${S.step}: ${S.status.toUpperCase()} in ${fmtDur(S.durationSec)}  -> ${S.file}`);
  const cs = Object.keys(S.counts).map(k => `${k} ${Array.isArray(S.counts[k]) ? S.counts[k].length : S.counts[k]}`).join(', '); if (cs) L.push('counts: ' + cs);
  if (S.cached && (S.cached.hits || S.cached.played)) L.push(`cache: ${S.cached.hits} reused, ${S.cached.played} measured`);
  if (S.tests) L.push(`tests: ${S.tests.passed} passed, ${S.tests.failed} failed (${S.tests.newFailures.length} new, ${S.tests.knownFailures.length} known), ${S.tests.cached} cached`);
  if (S.stages) S.stages.forEach(s => L.push(`  ${s.step.padEnd(10)} ${String(s.status).padEnd(5)} ${fmtDur(s.durationSec).padStart(7)}  ${s.file || ''}`));
  const room = () => 19 - L.length;
  if (S.changed.length) { L.push(`changed ${S.changed.length}:`); const k = Math.max(1, Math.min(S.changed.length, room() - (S.flagged.length ? 3 : 1) - (S.notes.length ? 1 : 0)));
    S.changed.slice(0, k).forEach(c => L.push(`  ${c.id} ${c.field ? c.field + ' ' : ''}${c.old} -> ${c.new}`)); if (S.changed.length > k) L.push(`  ... ${S.changed.length - k} more in the file`); }
  if (S.flagged.length) { L.push(`FLAGGED ${S.flagged.length}:`); const k = Math.max(1, Math.min(S.flagged.length, room() - (S.notes.length ? 1 : 0)));
    S.flagged.slice(0, k).forEach(c => L.push(`  ${c.id}: ${c.why}`)); if (S.flagged.length > k) L.push(`  ... ${S.flagged.length - k} more in the file`); }
  if (S.notes.length && room() > 0) L.push('notes: ' + S.notes.slice(0, 2).join(' | ').slice(0, 200));
  console.log(L.slice(0, 20).join('\n'));
}
module.exports = { ROOT, OUTDIR, STATE, CONFIG, SCHEMA, r2, stamp, sha, readJson, writeJson, parseArgs, run, vcsHead, fingerprint, newSummary, finish, printSummary, fmtDur };
