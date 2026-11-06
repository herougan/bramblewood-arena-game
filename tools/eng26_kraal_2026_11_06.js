#!/usr/bin/env node
// 2026-11-06 (package ENG26, owner 09:29 #5, BAL19-2: "Resources are scary. So maybe instead, Lumber 1, Attack +3 (first unit)"): every
// fight of The Canopy and Savanna Reaches (the maps whose enemy defends Acacia Kraal) re-measured with the bramble as it was (start
// Lumber 3) and as it is now (start Lumber 1), first unit +3 Attack both times: 200 games each on the road measure's seeds (seed0 9100,
// as tools/bal19/confirm_2026_11_06.js), the Map reference, no leader for your seat.
//   node tools/eng26_kraal_2026_11_06.js [--games 200]  -> docs/balance/eng26-kraal-2026-11-06.json
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..');
const a = process.argv.slice(2), arg = (k, d) => { const i = a.indexOf(k); return i >= 0 ? a[i + 1] : d; };
const GAMES = +arg('--games', 200);
const B = require('./lib_bramble.js'), G = B.G, K = B.CHARACTER_DEFS['acacia-kraal'];
if (!K) throw new Error('no acacia-kraal in canonical/characters.json');
const NOW = K.effects.startGold;
const maps = G.CONQUEST_MAPS.filter(m => !m.reserved && !m.tower && !m.endless && /^(The Canopy|Savanna Reaches)$/.test(m.name));
const rows = [];
maps.forEach(m => (m.nodes || []).filter(n => n.deck).forEach(n => {
  G.NODE_MAP_HINT.set(n, m.id);
  const band = G.skirmishTargetBand(m.id, n), t = Math.round(band.t * 1000) / 10;
  const w = sg => { K.effects.startGold = sg; const r = G.simulateReferenceFight(m.id, n, GAMES, { seed0: 9100 }); return Math.round(r.wins / GAMES * 1000) / 10; };
  const before = w(3), after = w(NOW); K.effects.startGold = NOW;
  const castle = (() => { try { return G.skirmishCastle(n); } catch (e) { return {}; } })();
  rows.push({ code: n.key, map: m.id, mapName: m.name, kind: n.kind, name: n.name, castle: castle.id || castle.castle || null, target: t, lo: Math.round(band.lo * 1000) / 10, hi: Math.round(band.hi * 1000) / 10, before, after, gapBefore: Math.round((before - t) * 10) / 10, gapAfter: Math.round((after - t) * 10) / 10 });
  console.log(m.name.padEnd(16), n.key.padEnd(8), 'target', t, ' Lumber 3:', before, ' Lumber', NOW + ':', after);
}));
const mean = (k, f) => { const r = rows.filter(f); return r.length ? Math.round(r.reduce((s, x) => s + x[k], 0) / r.length * 10) / 10 : null; };
const summary = ['The Canopy', 'Savanna Reaches'].map(nm => ({ map: nm, fights: rows.filter(r => r.mapName === nm).length, meanGapBefore: mean('gapBefore', r => r.mapName === nm), meanGapAfter: mean('gapAfter', r => r.mapName === nm),
  inBandBefore: rows.filter(r => r.mapName === nm && r.before >= r.lo && r.before <= r.hi).length, inBandAfter: rows.filter(r => r.mapName === nm && r.after >= r.lo && r.after <= r.hi).length }));
const out = { tool: 'tools/eng26_kraal_2026_11_06.js', generated: new Date().toISOString(), games: GAMES, seed0: 9100, startLumber: { before: 3, after: NOW }, summary, rows };
fs.writeFileSync(path.join(ROOT, 'docs/balance/eng26-kraal-2026-11-06.json'), JSON.stringify(out, null, 1) + '\n');
console.log(JSON.stringify(summary));
