#!/usr/bin/env node
// 2026-11-18 (package REFIT5): what-if only, for the decision on the fights no legal deck brings into band. Too hard (win under target):
// Shield 0, then Shield 0 with a lower bramble Health (shown values; hqHp is stored at full size, shown 10 = hqHp 20; skirmishCastle only
// lowers Health). Too easy: a Shield above the rule (shown values, BAL19-1 a: an owner call) or more Health (node.brambleHealth, the
// admin-set Health the fight panel saves). 200 games, seed 95300. Nothing is applied.
//   node docs/balance/refit5/whatif_2026_11_18.js CODE... [--hp=12,10,8] [--shield=3,6,10] [--target-file=<measure.jsonl>]
'use strict';
const fs = require('fs'), path = require('path'), ROOT = path.join(__dirname, '..', '..', '..');
const X = require(path.join(ROOT, 'tools', 'legal1', 'lib_legal_2026_11_15.js')), G = X.G;
const a = process.argv.slice(2), lst = (k, d) => ((a.find(x => x.startsWith(k)) || k + d).slice(k.length)).split(',').map(Number);
const HP = lst('--hp=', '12,10,8'), SH = lst('--shield=', '3,6,10');
const tf = (a.find(x => x.startsWith('--target-file=')) || '--target-file=docs/balance/skirmish-pass-refit5-before-s9100.jsonl').slice(14);
const T = {}; fs.readFileSync(path.resolve(ROOT, tf), 'utf8').trim().split('\n').map(JSON.parse).forEach(r => { T[r.key] = r.target; });
for (const c of a.filter(x => !x.startsWith('--'))) { const { m, n } = X.byCode[c]; const w = o => { const nn = Object.assign({}, n, o); G.NODE_MAP_HINT.set(nn, m.id); return Math.round(G.simulateReferenceFight(m.id, nn, 200, { seed0: 95300 }).win * 1000) / 10; };
  G.NODE_MAP_HINT.set(n, m.id); const cs = G.skirmishCastle(n), now = w({}), row = { key: c, target: T[c], now: { health: cs.hp, shield: cs.shield, win: now } };
  if (now < T[c]) { row.shield0 = w({ shieldOverride: 0 }); row.hp = {}; HP.filter(h => h < cs.hp).forEach(h => { row.hp[h] = w({ shieldOverride: 0, hqHp: h * 2 }); }); }
  else { row.shield = {}; SH.forEach(s => { const sv = cs.shield + s; row.shield[sv] = w({ shieldOverride: sv * 2 }); });
    row.health = {}; SH.forEach(s => { row.health[cs.hp + s] = w({ brambleHealth: cs.hp + s }); }); } // node.brambleHealth: the admin-set Health, shown value (may raise it)
  fs.appendFileSync(path.join(__dirname, 'whatif-2026-11-18.jsonl'), JSON.stringify(row) + '\n'); console.log(JSON.stringify(row)); }
