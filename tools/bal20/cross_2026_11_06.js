#!/usr/bin/env node
// 2026-11-06 (package BAL20): The Canopy's decks in a Savanna Reaches fight (Map 14's reference, Lv 3, the savanna field) and Savanna decks in a
// Canopy fight (Map 18's reference at 3.54, enemy Lv 4, High Canopy + Spring Rain): does the gap come from the map's context or from its decks?
// Diagnostics only. Road seeds (9100 + 37g), the Map reference, no leader for your seat. Also the Canopy fights against the Map 14 reference deck.
//   node tools/bal20/cross_2026_11_06.js [--games 100]  -> docs/balance/bal20/cross-2026-11-06.json
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..', '..');
const a = process.argv.slice(2), GAMES = +(a[a.indexOf('--games') + 1] || 100) || 100;
const B = require('../lib_bramble.js'), G = B.G;
const fight = code => { for (const m of G.CONQUEST_MAPS) { const n = (m.nodes || []).find(x => x.key === code && x.deck); if (n) { G.NODE_MAP_HINT.set(n, m.id); return { m, n }; } } };
const win = (m, n, opts) => { const nn = Object.assign({}, n); G.NODE_MAP_HINT.set(nn, m.id); const r = G.simulateReferenceFight(m.id, nn, GAMES, Object.assign({ seed0: 9100 }, opts || {})); return Math.round(r.wins / GAMES * 1000) / 10; };
const host = { sav: fight('14-1'), can: fight('14-A-1') }, rows = [];
const R14 = G.WINRATE_REF_DECKS.road[14];
for (const code of ['14-A-1', '14-A-2', '14-A-3', '14-A-4', '14-A-5', '14-1', '14-3', '14-5', '14-8']) {
  const f = fight(code), carry = { deck: f.n.deck, leaders: f.n.leaders, shieldOverride: f.n.shieldOverride };
  const inSav = Object.assign({}, host.sav.n, carry), inCan = Object.assign({}, host.can.n, carry);
  ['leaders', 'shieldOverride'].forEach(k => { if (carry[k] == null) { delete inSav[k]; delete inCan[k]; } });
  const row = { code, own: win(f.m, f.n), inSavanna14_1: win(host.sav.m, inSav), inCanopy14_A_1: win(host.can.m, inCan) };
  if (/^14-A/.test(code)) { row.vsMap14RefDeckLv3 = win(f.m, f.n, { deck: R14, level: 3 }); row.vsMap14RefDeckLv354 = win(f.m, f.n, { deck: R14, level: 3.54 }); }
  rows.push(row); console.log(JSON.stringify(row));
}
fs.mkdirSync(path.join(ROOT, 'docs/balance/bal20'), { recursive: true });
fs.writeFileSync(path.join(ROOT, 'docs/balance/bal20/cross-2026-11-06.json'), JSON.stringify({ about: 'BAL20: decks swapped between a Savanna (14-1) and a Canopy (14-A-1) fight (tools/bal20/cross_2026_11_06.js)', games: GAMES, refDecks: { map14: R14, map18: G.WINRATE_REF_DECKS.road[18] }, rows }, null, 1) + '\n');
