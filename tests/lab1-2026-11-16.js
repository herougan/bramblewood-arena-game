#!/usr/bin/env node
// 2026-11-16 (package LAB1): Bramblewood Lab (tools/lab): the store pools two runs (and counts a repeated seed set once), Wilson numbers,
// the importer reads a saved skirmish-pass jsonl, the server serves the dashboard, and a tiny road measure (2 fights, 2 games) and a tiny
// journey (1 player to Map 1) complete from a local copy of this checkout. About a minute on 2 cores. No network: --local mode.
'use strict';
const fs = require('fs'), path = require('path'), os = require('os');
const ROOT = path.join(__dirname, '..');
process.env.LAB_HOME = fs.mkdtempSync(path.join(os.tmpdir(), 'lab1-test-'));
const LAB = path.join(ROOT, 'tools', 'lab');
const S = require(path.join(LAB, 'store.js')), P = require(path.join(LAB, 'pull.js')), I = require(path.join(LAB, 'importer.js')), J = require(path.join(LAB, 'jobs.js'));
let fail = 0, n = 0; const ok = (c, m) => { n++; if (!c) { fail++; console.log('  ✗', m); } else console.log('  ✓', m); };
const near = (a, b, e) => Math.abs(a - b) <= (e || 1e-3);

(async () => {
  // Wilson 95% and games needed
  const w = S.wilson(30, 40); ok(near(w[0], 0.5981) && near(w[1], 0.8579), 'Wilson 30/40 = [0.598, 0.858]');
  const w0 = S.wilson(0, 10); ok(w0[0] === 0 && near(w0[1], 0.2775), 'Wilson 0/10 = [0, 0.278]');
  ok(S.gamesNeeded(20, 40, 0.05) === 385 - 40, 'games for ±5 at 50%: 385 in all');

  // pooling: same data hash pools, a repeated seed set counts once, another data hash is another trend point
  const row = (key, win, games) => ({ map: 'm1', key, code: key, mapNo: 0, side: false, kind: 'skirmish', win, games, wins: Math.round(win * games / 100), target: 90, lo: 82, hi: 98, curve: true });
  const recs = [{ id: 'a', kind: 'road', dataHash: 'h1', seed: 9100, created: '2026-11-01', rows: [row('0-1', 80, 40), row('0-2', 50, 40)] },
    { id: 'b', kind: 'road', dataHash: 'h1', seed: 123457, created: '2026-11-02', rows: [row('0-1', 90, 60)] },
    { id: 'c', kind: 'road', dataHash: 'h1', seed: 9100, created: '2026-11-03', rows: [row('0-1', 80, 40)] },
    { id: 'd', kind: 'road', dataHash: 'h2', seed: 9100, created: '2026-11-04', rows: [row('0-1', 95, 40), row('0-2', 60, 40)] }, { id: 'e', kind: 'road', dataHash: 'h3', seed: 9100, created: '2026-11-05', rows: [row('0-1', 95, 40)] }];
  const G = S.roadGroups(recs), g1 = G.find(g => g.dataHash === 'h1'), f = g1.fights['m1:0-1'];
  ok(G.length === 3 && g1.runs.length === 3, 'three data hashes, three groups');
  ok(f.games === 100 && f.wins === 32 + 54, 'pooled 0-1: 40 + 60 games (the repeated seed set left out), 86 wins');
  ok(near(f.ci[0], 100 * S.wilson(86, 100)[0]), 'pooled interval is Wilson over the summed games');
  const st = S.status(g1, 20); ok(st.main.total === 2 && st.main.inBand === 1 && st.main.beyond20 === 1, 'status: 0-1 in band, 0-2 beyond 20');
  ok(S.trend(G, 20).length === 2, 'trend: one point per data hash, the spot check (1 fight of 2) left out');
  ok(/^fight,/.test(S.csv([{ fight: 'm1:0-1', win: 86 }])), 'CSV export');

  // card lists for the optimiser
  const pc = J.parseCards('otter-kit x4, 3x soldier-ant @2\nbee-forager');
  ok(pc.length === 3 && pc[0].copies === 4 && pc[1].copies === 3 && pc[1].level === 2 && pc[2].copies === null, 'card list: "id x4", "3x id @2", "id"');

  // a local copy of this checkout; the importer reads a saved road measure from it
  const snap = await P.pull({ local: ROOT });
  ok(fs.existsSync(path.join(snap.root, 'arena_app.js')) && fs.existsSync(path.join(snap.root, 'tools', 'skirmish_pass.js')) && !fs.existsSync(path.join(snap.root, 'docs', 'screens')), 'local pull copies the sim files only');
  ok(/^[0-9a-f]{12}$/.test(snap.dataHash) && snap.dataHash === P.dataHash(snap.root), 'data hash of the inputs');
  const saved = fs.readdirSync(path.join(ROOT, 'docs', 'balance')).filter(x => /^skirmish-pass-.*\.jsonl$/.test(x)).sort().reverse().find(x => /"target":\d/.test(fs.readFileSync(path.join(ROOT, 'docs', 'balance', x), 'utf8').slice(0, 2000)));
  const imp = await I.importRoad(snap, { match: new RegExp(saved.replace(/[.]/g, '\\.') + '$') });
  const ir = S.all().find(r => r.source === 'import' && r.kind === 'road');
  ok(imp.added === 1 && ir && ir.rows.length > 10 && ir.headline.main.total > 0, 'importer reads ' + saved + ' (' + (ir ? ir.rows.length : 0) + ' fights)');
  const cat = await I.catalogue(snap); ok(cat.files > 100 && cat.kinds.some(k => k.kind.startsWith('skirmish-pass')), 'catalogue lists docs/balance by kind');

  // the server
  const { server, port } = await require(path.join(LAB, 'server.js')).start({ port: 0, local: ROOT });
  const html = await (await fetch(`http://127.0.0.1:${port}/`)).text(), d = await (await fetch(`http://127.0.0.1:${port}/api/dashboard`)).json();
  ok(/Bramblewood Lab/.test(html) && d.groups.length >= 1 && d.status && d.status.main.total > 0, 'server serves the page and the dashboard (imported results)');
  const forbid = await fetch(`http://127.0.0.1:${port}/api/jobs`, { method: 'POST', headers: { origin: 'https://example.com', 'content-type': 'application/json' }, body: '{}' });
  ok(forbid.status === 403, 'another site cannot start runs');
  server.close();

  // a tiny road measure and a tiny journey, from the local copy
  const log = [], say = t => log.push(t);
  const m = await J.runNow('measure', { local: ROOT, games: 2, only: '0-1,1-2', workers: 2 }, say);
  ok(m && m.kind === 'road' && m.rows.length === 2 && m.rows.every(r => r.games === 2 && r.target != null) && m.seed >= 1e6, 'measure: 2 fights x 2 games on fresh seeds');
  const jr = await J.runNow('journey', { local: ROOT, to: 1, seeds: 1, farmDays: 2, games: 1, workers: 1 }, say);
  ok(jr && jr.kind === 'journey' && jr.summary.length === 2 && jr.summary[1].distinct > jr.summary[0].distinct && jr.players['1'].rows.length > 0, 'journey: 1 player to Map 1, collection grows, measured vs the road');
  ok(!fs.readdirSync(path.join(snap.root, 'docs', 'balance', 'ref')).some(x => /^lab-/.test(x)), 'journey removes its reference-set files');

  // the Lab never writes the game's files
  ['pull.js', 'store.js', 'importer.js', 'jobs.js', 'kit.js', 'server.js', 'lab.js'].forEach(x => ok(!/writeFileSync\([^)]*(ROOT|canonical)/.test(fs.readFileSync(path.join(LAB, x), 'utf8')), x + ': no write to the repo'));
  fs.rmSync(process.env.LAB_HOME, { recursive: true, force: true });
  console.log(`lab1: ${n - fail}/${n} checks passed`); process.exit(fail ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
