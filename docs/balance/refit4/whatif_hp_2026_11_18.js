#!/usr/bin/env node
// 2026-11-18 (package REFIT4): what-if only, for decision REFIT4-1: a fight's re-fitted deck with Shield 0 and a lower bramble Health, in the
// Health the fight shows (hqHp is stored at full size, BRAMBLE_SCALE 0.5: shown 10 = hqHp 20). 200 games, seed 85300. Nothing is applied.
//   node docs/balance/refit4/whatif_hp_2026_11_18.js CODE... [--hp=12,10,8]   -> appends to whatif-hp-2026-11-18.jsonl
'use strict';
const fs = require('fs'), path = require('path');
const X = require(path.join(__dirname, '..', '..', '..', 'tools', 'legal1', 'lib_legal_2026_11_15.js')), G = X.G;
const a = process.argv.slice(2), HP = ((a.find(x => x.startsWith('--hp=')) || '--hp=12,10,8').slice(5)).split(',').map(Number);
for (const c of a.filter(x => !x.startsWith('--'))) { const { m, n } = X.byCode[c]; const w = o => { const nn = Object.assign({}, n, o); G.NODE_MAP_HINT.set(nn, m.id); return Math.round(G.simulateReferenceFight(m.id, nn, 200, { seed0: 85300 }).win * 1000) / 10; };
  G.NODE_MAP_HINT.set(n, m.id); const cs = G.skirmishCastle(n), row = { key: c, now: { health: cs.hp, shield: cs.shield, win: w({}) }, shield0: w({ shieldOverride: 0 }), hp: {} };
  HP.filter(h => h < cs.hp).forEach(h => { row.hp[h] = w({ shieldOverride: 0, hqHp: h * 2 }); });
  fs.appendFileSync(path.join(__dirname, 'whatif-hp-2026-11-18.jsonl'), JSON.stringify(row) + '\n'); console.log(JSON.stringify(row)); }
