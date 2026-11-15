#!/usr/bin/env node
// 2026-11-16 (package LAB1, owner: "an exe programme i can run on my macbook that summarises ALL simulation & optimisation runs"):
// Bramblewood Lab. No command: opens the web UI. Commands run headless (see `lab help`). README.md has the owner's guide.
'use strict';
const path = require('path'), cp = require('child_process');
// Behind an HTTPS proxy (a CI or a company network) Node's fetch needs NODE_USE_ENV_PROXY, read at start: run once more with it.
if ((process.env.HTTPS_PROXY || process.env.https_proxy) && !process.env.NODE_USE_ENV_PROXY) {
  const r = cp.spawnSync(process.execPath, process.argv.slice(1), { stdio: 'inherit', env: Object.assign({}, process.env, { NODE_USE_ENV_PROXY: '1', NODE_NO_WARNINGS: '1' }) });
  process.exit(r.status == null ? 1 : r.status);
}
const P = require('./pull.js'), S = require('./store.js'), J = require('./jobs.js'), I = require('./importer.js');
const VERSION = require('./package.json').version;

const HELP = `Bramblewood Lab ${VERSION}
  lab                         open the Lab in your browser (same as: lab serve)
  lab serve [--port 47800] [--no-open]
  lab pull                    fetch main's newest game data (only the files the sims read)
  lab status [--maxmap 20]    road status of the newest pooled results (main / side: in band, within 10, beyond 20)
  lab measure [--games 40] [--only 0-1,1-2] [--seed K] [--maxmap 20] [--main] [--ref ref2]
  lab optimise --map 3 --cards "otter-kit x4, bee-forager, 3x soldier-ant @2" [--budget 2000]
  lab journey [--to 10] [--seeds 5] [--farm 30] [--profile casual|dedicated] [--deck quick|optimise] [--games 10] [--side]
  lab econ                    the ECON2 economy players, day by day
  lab whatif --card ID [--attack 3] [--health 5] [--cost 2] [--wait 1] [--games 40]
  lab tool <preset> [key=value ...]   a repo tool as it is (lab tool list)
  lab import                  read every saved road result in docs/balance into the store
  lab runs                    the stored runs, newest first
  lab export <run id | group key>     CSV on stdout
  lab queue add <command> [options] | lab queue run | lab queue list
  lab selftest                store and Wilson checks, then the server serves the dashboard
Every command takes --local DIR (use a checkout, no GitHub), --live (lay live Supabase card_overrides over the cards, read only) and --workers N.
Data: ${P.home()}`;

function parse(argv) {
  const o = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]; if (!a.startsWith('--')) { o._.push(a); continue; }
    const eq = a.indexOf('='); if (eq > 0) { o[a.slice(2, eq)] = a.slice(eq + 1); continue; }
    const k = a.slice(2), n = argv[i + 1]; if (n != null && !n.startsWith('--')) { o[k] = n; i++; } else o[k] = true;
  }
  return o;
}
const fmt = (s, name) => `${name.padEnd(5)} ${s.inBand}/${s.total} in band, ${s.within10} within 10, ${s.beyond20} beyond 20 (${s.games} games)`;
function openBrowser(u) { const c = process.platform === 'darwin' ? ['open', [u]] : process.platform === 'win32' ? ['cmd', ['/c', 'start', '', u]] : ['xdg-open', [u]]; try { cp.spawn(c[0], c[1], { stdio: 'ignore', detached: true }).unref(); } catch (e) { /* no browser */ } }
async function ping(port) { try { const r = await fetch(`http://127.0.0.1:${port}/api/ping`); const j = await r.json(); return j && j.lab; } catch (e) { return false; } }

const PARAMS = { measure: ['games', 'only', 'seed', 'maxmap', 'main', 'ref', 'label'], optimise: ['map', 'cards', 'budget', 'seed', 'leader', 'extra'], journey: ['to', 'seeds', 'seedFrom', 'farm', 'profile', 'deck', 'optEvery', 'budget', 'games', 'side', 'extra'],
  econ: [], whatif: ['card', 'attack', 'health', 'cost', 'wait', 'rarity', 'effects', 'games', 'seed', 'maxmap'], import: ['maxDates'] };
function params(type, o) {
  const p = {}; (PARAMS[type] || []).forEach(k => { if (o[k] != null) p[k === 'farm' ? 'farmDays' : k] = o[k]; });
  ['local', 'live', 'workers'].forEach(k => { if (o[k] != null) p[k] = o[k]; });
  return p;
}
function toolParams(o) { const args = {}; o._.slice(2).forEach(kv => { const m = /^(\w+)=(.*)$/.exec(kv); if (m) args[m[1]] = m[2]; }); return Object.assign(params('tool', o), { preset: o._[1], args }); }

async function main() {
  const o = parse(process.argv.slice(2)), cmd = o._[0] || 'serve';
  if (o.version || cmd === 'version') return console.log(VERSION);
  if (cmd === 'help' || o.help) return console.log(HELP);
  if (o.local) o.local = path.resolve(o.local);
  if (cmd === 'serve') {
    const port = o.port == null ? 47800 : +o.port;
    if (port && await ping(port)) { console.log('Lab already running: http://127.0.0.1:' + port); if (!o['no-open']) openBrowser('http://127.0.0.1:' + port); return; }
    const { port: p } = await require('./server.js').start({ port, local: o.local });
    console.log(`Bramblewood Lab ${VERSION}: http://127.0.0.1:${p}  (data: ${P.home()})`);
    if (!o['no-open']) openBrowser('http://127.0.0.1:' + p);
    return;
  }
  if (cmd === 'pull') { const m = await P.pull({ local: o.local, log: console.log }); (m.warnings || []).forEach(w => console.log('warning: ' + w)); return console.log(`game ${m.sha} (${m.date || ''}) data ${m.dataHash}: ${m.files} files, ${m.fetched} downloaded -> ${m.root}`); }
  if (cmd === 'status') {
    const G = S.roadGroups(), g = G.find(x => x.source === 'lab' && S.full(x, 20, G)) || G.find(x => x.date && S.full(x, 20, G)) || G[0]; if (!g) return console.log('no road results yet: lab measure, or lab import for the saved ones');
    const s = S.status(g, +o.maxmap || 20);
    console.log(`${g.label || g.dataHash} (${g.source}, data ${g.dataHash}, ${g.runs.length} run(s), game ${g.shas.map(x => String(x).slice(0, 7)).join(' ')})`);
    console.log(fmt(s.main, 'main')); console.log(fmt(s.side, 'side'));
    console.log('worst:'); s.worst.slice(0, 8).forEach(w => console.log(`  ${String(w.code).padEnd(8)} ${w.win.toFixed(0).padStart(3)}% [${w.ci[0].toFixed(0)}-${w.ci[1].toFixed(0)}] target ${w.target} gap ${w.gap > 0 ? '+' : ''}${w.gap.toFixed(0)}  ${w.games} games${w.need5 ? ', +' + w.need5 + ' for ±5' : ''}`));
    return;
  }
  if (cmd === 'runs') { S.all().filter(r => r.kind !== 'file').slice(-40).reverse().forEach(r => console.log(`${r.id.padEnd(14)} ${r.kind.padEnd(9)} ${(r.created || '').slice(0, 16)} ${r.label || ''}`)); return; }
  if (cmd === 'export') { const id = o._[1], r = S.get(id), g = S.roadGroups().find(x => x.key === id);
    if (g) return process.stdout.write(S.csv(Object.values(g.fights).map(f => ({ fight: S.fightId(f), code: f.code || f.key, map: f.mapNo, side: !!f.side, win: f.win, ci_lo: f.ci[0], ci_hi: f.ci[1], target: f.target, lo: f.lo, hi: f.hi, games: f.games }))));
    if (r) return process.stdout.write(S.csv(r.kind === 'journey' ? r.summary : r.rows || [])); throw new Error('no run or group ' + id); }
  if (cmd === 'tool' && (o._[1] === 'list' || !o._[1])) { Object.entries(J.PRESETS).forEach(([k, v]) => console.log(`${k.padEnd(18)} ${v.label}: node ${v.cmd}`)); return; }
  if (cmd === 'queue') {
    const q = new J.Queue();
    if (o._[1] === 'add') { const type = o._[2]; const p = type === 'tool' ? toolParams(Object.assign({}, o, { _: o._.slice(2) })) : params(type, o); const j = q.add(type, p); q.paused = true; return console.log('queued ' + j.id + ' ' + type); }
    if (o._[1] === 'list') { q.jobs.slice(-30).forEach(j => console.log(`${j.id} ${j.type.padEnd(9)} ${j.status.padEnd(9)} ${JSON.stringify(j.params)}`)); return; }
    if (o._[1] === 'run') { let shown = {}; q.listeners.push(() => { const j = q.ctx && q.ctx.job; if (!j) return; for (let i = shown[j.id] || 0; i < j.log.length; i++) console.log(j.id + ' ' + j.log[i]); shown[j.id] = j.log.length; }); await new Promise(done => { q.onIdle = done; q.kick(); }); console.log('queue empty'); return; }
    return console.log(HELP);
  }
  if (cmd === 'selftest') return selftest();
  if (cmd === 'import') { const snap = await P.pull({ local: o.local, log: console.log }); const r = await I.importRoad(snap, { log: console.log, maxDates: o.maxDates != null ? +o.maxDates : undefined }); return console.log(`road history: ${r.added} new, ${r.skipped} already in, of ${r.files} .jsonl files`); }
  if (J.RUN[cmd]) {
    const rec = await J.runNow(cmd, cmd === 'tool' ? toolParams(o) : params(cmd, o), t => console.log(t));
    if (rec) { console.log(`saved run ${rec.id} (${rec.kind}, game ${String(rec.sha).slice(0, 7)}, data ${rec.dataHash})`); const h = rec.headline || {};
      if (h.main) { console.log(fmt(h.main, 'main')); console.log(fmt(h.side, 'side')); } else console.log(JSON.stringify(h).slice(0, 600)); }
    return;
  }
  console.log(HELP); process.exitCode = 2;
}

// quick checks that need no game data (the Mac build's smoke test)
async function selftest() {
  process.env.LAB_HOME = require('fs').mkdtempSync(path.join(require('os').tmpdir(), 'lab-selftest-'));
  let bad = 0; const ok = (c, m) => { console.log((c ? 'ok   ' : 'FAIL ') + m); if (!c) bad++; };
  const w = S.wilson(30, 40); ok(Math.abs(w[0] - 0.5981) < 0.002 && Math.abs(w[1] - 0.8579) < 0.002, 'Wilson 30/40 = [59.8, 85.8]');
  const row = (win, games, seed) => ({ kind: 'road', dataHash: 'h', seed, rows: [{ map: 'm1', key: '0-1', mapNo: 0, win, games, wins: win * games / 100, target: 90, lo: 82, hi: 98, curve: true }] });
  const g = S.roadGroups([row(80, 40, 9100), row(90, 40, 5100), row(80, 40, 9100)])[0].fights['m1:0-1'];
  ok(g.games === 80 && g.wins === 68, 'pooling sums two seed sets and counts a repeated seed set once');
  const { server, port } = await require('./server.js').start({ port: 0 });
  const html = await (await fetch(`http://127.0.0.1:${port}/`)).text(), d = await (await fetch(`http://127.0.0.1:${port}/api/dashboard`)).json();
  ok(/Bramblewood Lab/.test(html) && Array.isArray(d.groups), 'server serves the UI and the dashboard');
  server.close(); console.log(bad ? bad + ' failure(s)' : 'selftest passed'); process.exit(bad ? 1 : 0);
}
main().catch(e => { console.error(e && e.message || e); process.exit(1); });
