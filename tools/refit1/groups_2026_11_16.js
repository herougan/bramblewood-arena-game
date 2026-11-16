#!/usr/bin/env node
// 2026-11-16 (package REFIT1): packs the FOLD5-changed cards found in off-band fights into swap groups whose fight sets do not overlap (a
// fight's enemy deck, leaders and reference deck), so one road measure per group gives each card's own move. Also writes a cards.json per
// group (the post-fold file with the group's cards put back at their pre-fold definition) for a scratch branch.
//   node tools/refit1/groups_2026_11_16.js --attr attr.json --pre <prefold cards.json> --outdir <dir>
'use strict';
const fs = require('fs'), path = require('path'), ROOT = path.resolve(__dirname, '..', '..');
const B = require(path.join(ROOT, 'tools', 'lib_bramble.js')), G = B.G;
const a = process.argv.slice(2), arg = (k, d) => { const i = a.indexOf(k); return i >= 0 ? a[i + 1] : d; };
const attr = JSON.parse(fs.readFileSync(arg('--attr'), 'utf8')), outdir = arg('--outdir');
const suspects = [...new Set([].concat(...attr.fights.map(f => f.enemy.map(e => e.id).concat(f.mine.map(e => e.id)))))];
// every curve fight of Maps 0-20 (main and side) and the cards it holds
const rows = fs.readFileSync(path.join(ROOT, 'docs/balance/skirmish-pass-fold5-s7300.jsonl'), 'utf8').trim().split('\n').map(JSON.parse).filter(r => r.curve);
const holds = {};
for (const r of rows) { const m = B.MAPS.find(x => x.id === r.map), n = m.nodes.find(x => x.key === r.key); G.NODE_MAP_HINT.set(n, m.id);
  const ids = new Set(Object.keys(n.deck || {}).concat(G.skirmishLeadersOf(n, m.id) || [], Object.keys(G.referenceDeckFor(m.id, n).deck)));
  holds[r.key] = ids; }
const fightsOf = id => Object.keys(holds).filter(k => holds[k].has(id));
const order = suspects.map(id => ({ id, fs: fightsOf(id) })).sort((x, y) => y.fs.length - x.fs.length);
const groups = [];
for (const s of order) { let g = groups.find(g => s.fs.every(k => !g.fights.has(k))); if (!g) { g = { cards: [], fights: new Set() }; groups.push(g); } g.cards.push(s.id); s.fs.forEach(k => g.fights.add(k)); }
const post = JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical/cards.json'), 'utf8')), pre = {}; JSON.parse(fs.readFileSync(arg('--pre'), 'utf8')).forEach(c => { pre[c.id] = c; });
fs.mkdirSync(outdir, { recursive: true });
groups.forEach((g, i) => { const set = new Set(g.cards), file = post.map(c => set.has(c.id) ? pre[c.id] : c);
  fs.writeFileSync(path.join(outdir, `g${i + 1}-cards.json`), JSON.stringify(file, null, 1));
  console.log(JSON.stringify({ g: i + 1, cards: g.cards, fights: [...g.fights] })); });
