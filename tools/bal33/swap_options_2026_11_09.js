#!/usr/bin/env node
// 2026-11-09 (package BAL33, decision BAL28-2 b): which later Canopy slot 14-A-1 (Dart Frogs) should take. A slot keeps its key, kind,
// position (so its road-curve target) and requires; the fight (deck, leaders, name) moves. For each later slot k: Dart Frogs in slot k and
// slot k's fight in slot 1, 200 games each on the road seeds (9100 + 37g), the Map reference, BAL28-1 a in force (the CPU's Bower muted).
//   node tools/bal33/swap_options_2026_11_09.js [games=200] -> docs/balance/bal33/swap-options-2026-11-09.json
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..', '..');
const L = require(path.join(ROOT, 'tools', 'lib_bramble.js')), G = L.G;
const N = +(process.argv.slice(2).find(x => /^\d+$/.test(x)) || 200), map = G.CONQUEST_MAPS.find(m => m.id === 'my');
const byKey = k => map.nodes.find(n => n.key === k);
const FIGHT = ['name', 'icon', 'flavor', 'deck', 'leaders', 'shieldOverride'];
function into(slotKey, fromKey) { const s = byKey(slotKey), f = byKey(fromKey), n = Object.assign({}, s); FIGHT.forEach(k => { if (f[k] !== undefined) n[k] = f[k]; else delete n[k]; }); G.NODE_MAP_HINT.set(n, 'my'); return n; }
const run = n => Math.round(G.simulateReferenceFight('my', n, N, { seed0: 9100 }).wins / N * 1000) / 10;
const tgt = n => Math.round(G.skirmishTargetBand('my', n).t * 100);
const rows = [];
for (const k of ['14-A-3', '14-A-4', '14-A-5']) {
  const df = into(k, '14-A-1'), other = into('14-A-1', k);
  const r = { slot: k, slotKind: byKey(k).kind, dartFrogsThere: run(df), dartFrogsTarget: tgt(df), other: byKey(k).name, otherInSlot1: run(other), slot1Target: tgt(other) };
  r.gapSum = Math.round((Math.abs(r.dartFrogsThere - r.dartFrogsTarget) + Math.abs(r.otherInSlot1 - r.slot1Target)) * 10) / 10;
  rows.push(r); console.log(JSON.stringify(r));
}
fs.mkdirSync(path.join(ROOT, 'docs', 'balance', 'bal33'), { recursive: true });
fs.writeFileSync(path.join(ROOT, 'docs', 'balance', 'bal33', 'swap-options-2026-11-09.json'), JSON.stringify({ tool: 'tools/bal33/swap_options_2026_11_09.js', games: N, seed0: 9100, rows }, null, 1) + '\n');
