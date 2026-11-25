#!/usr/bin/env node
// 2026-11-25 (package ROADFIX4): which card change moved a road fight. For each card whose canonical/cards.json entry differs from --rev
// (default 24aceba7b, the post1124d measure) and that sits in the fight's enemy deck or its map reference deck, the fight is played with that
// one card back at its old entry (a child process reads cards.json through a patched fs.readFileSync, so the game itself is untouched), and
// with every such card back ("all"); the rest of the move is the engine (DAUNT2). Seeds 9100 + 37g, as the road measure.
//   node docs/balance/roadfix4/cause_2026_11_25.js CODE [CODE ...] [--games 400] [--rev 24aceba7b] [--json out.json]
'use strict';
const fs = require('fs'), path = require('path'), cp = require('child_process'), ROOT = path.resolve(__dirname, '..', '..', '..');
const a = process.argv.slice(2), arg = (k, d) => { const i = a.indexOf(k); return i >= 0 ? a[i + 1] : d; };
const GAMES = +arg('--games', 400), REV = arg('--rev', '24aceba7b');
if (process.env.RF4_CHILD) { // child: REVERT=<ids>, CODES=<codes>; prints one JSON line {code: win}
  const ids = (process.env.REVERT || '').split(',').filter(Boolean), old = JSON.parse(fs.readFileSync(process.env.RF4_OLD, 'utf8')), rd = fs.readFileSync;
  fs.readFileSync = function (p, o) { const s = rd.apply(fs, arguments); if (String(p).endsWith(path.join('canonical', 'cards.json')) && ids.length) {
    const arr = JSON.parse(s.toString()); ids.forEach(id => { const i = arr.findIndex(c => c.id === id); if (i >= 0 && old[id]) arr[i] = Object.assign({}, old[id], { art: arr[i].art }); });
    const out = JSON.stringify(arr); return o ? out : Buffer.from(out); } return s; };
  const B = require(path.join(ROOT, 'tools', 'lib_bramble.js')), G = B.G, out = {};
  for (const code of process.env.CODES.split(',')) { let hit = null; for (const m of B.MAPS) for (const n of (m.nodes || [])) if (n.key === code) hit = { m, n };
    G.NODE_MAP_HINT.set(hit.n, hit.m.id); const r = G.simulateReferenceFight(hit.m.id, hit.n, GAMES, { seed0: 9100 }); out[code] = Math.round(r.wins / GAMES * 1000) / 10; }
  console.log(JSON.stringify(out)); process.exit(0);
}
const codes = a.filter((x, i) => !x.startsWith('--') && !(a[i - 1] || '').startsWith('--'));
const now = {}, old = {}; JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical', 'cards.json'), 'utf8')).forEach(c => { now[c.id] = c; });
JSON.parse(cp.execSync(`git show ${REV}:canonical/cards.json`, { cwd: ROOT, maxBuffer: 1 << 30 }).toString()).forEach(c => { old[c.id] = c; });
const strip = c => { const o = Object.assign({}, c); ['art', 'name', 'flavor', 'flavour', 'species', 'artReview', 'animal'].forEach(k => delete o[k]); return JSON.stringify(o); };
const changed = new Set(Object.keys(now).filter(id => old[id] && strip(old[id]) !== strip(now[id])));
const OLDF = path.join(require('os').tmpdir(), 'rf4-old-' + process.pid + '.json'); fs.writeFileSync(OLDF, JSON.stringify(old)); process.on('exit', () => { try { fs.unlinkSync(OLDF); } catch (e) {} });
const B = require(path.join(ROOT, 'tools', 'lib_bramble.js')), G = B.G;
const run = (ids, cs) => JSON.parse(cp.execFileSync(process.execPath, [__filename, '--games', String(GAMES)], { cwd: ROOT, maxBuffer: 1 << 26,
  env: Object.assign({}, process.env, { RF4_CHILD: '1', REVERT: ids.join(','), CODES: cs.join(','), RF4_OLD: OLDF }) }).toString().trim().split('\n').pop());
const res = {};
for (const code of codes) { let hit = null; for (const m of B.MAPS) for (const n of (m.nodes || [])) if (n.key === code) hit = { m, n };
  G.NODE_MAP_HINT.set(hit.n, hit.m.id); const ref = G.referenceDeckFor(hit.m.id, hit.n).deck || {};
  const ids = [...new Set(Object.keys(hit.n.deck || {}).concat(Object.keys(ref)))].filter(id => changed.has(id));
  const base = run([], [code])[code], row = { code, now: base, cards: {} };
  ids.forEach(id => { row.cards[id + (ref[id] ? ' (ref x' + ref[id] + ')' : '') + (hit.n.deck[id] ? ' (enemy x' + hit.n.deck[id] + ')' : '')] = run([id], [code])[code]; });
  if (ids.length > 1) row.all = run(ids, [code])[code];
  res[code] = row; console.log(code, 'now', base, '| old card back:', Object.entries(row.cards).map(([k, w]) => `${k} ${w}`).join('; '), ids.length > 1 ? '| all back ' + row.all : '');
}
if (arg('--json')) fs.writeFileSync(path.resolve(ROOT, arg('--json')), JSON.stringify(res, null, 1) + '\n');
