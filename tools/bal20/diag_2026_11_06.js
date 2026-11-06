#!/usr/bin/env node
// 2026-11-06 (package BAL20): what walls The Canopy (14-A-*) and Savanna Reaches (14-*)? Each fight is played with one factor changed at a time
// (diagnostics only; the bramble and the field are not levers of this package): the enemy at the Map reference's level, one level lower,
// no CPU leader, no Shield, the forest field off (woods / canopy / the map field), a plain 30-Health bramble, and all of these at once.
// The Map reference, road seeds (9100 + 37g), no leader for your seat.
//   node tools/bal20/diag_2026_11_06.js [--games 100] [--codes 14-A-1,...]  -> docs/balance/bal20/diag-2026-11-06.json
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..', '..');
const a = process.argv.slice(2), arg = (k, d) => { const i = a.indexOf(k); return i >= 0 ? a[i + 1] : d; };
const GAMES = +arg('--games', 100), CODES = (arg('--codes', '') || '').split(',').filter(Boolean);
const B = require('../lib_bramble.js'), G = B.G;
const rows = [];
for (const m of G.CONQUEST_MAPS) { if (m.reserved || m.tower || m.endless) continue;
  for (const n of (m.nodes || []).filter(x => x.deck && /^14-/.test(x.key) && (!CODES.length || CODES.includes(x.key)))) {
    G.NODE_MAP_HINT.set(n, m.id);
    const band = G.skirmishTargetBand(m.id, n), t = Math.round(band.t * 1000) / 10, ref = G.referenceDeckFor(m.id, n), eL = G.roadEnemyLevelExact(n);
    const mf = m.mapField || {}, fieldOff = Object.assign({ woods: false, canopy: false }, Object.fromEntries(Object.keys(mf).map(k => [k, false])));
    const V = {
      base: {},
      enemyAtRefLevel: { enemyLevel: ref.level },
      enemyRefMinus1: { enemyLevel: Math.max(0, ref.level - 1) },
      noCpuLeader: { leaders: [] },
      shield0: { shieldOverride: 0 },
      fieldOff: { rules: Object.assign({}, n.rules || {}, fieldOff) },
      plainBramble: { characterId: 'castle' },
      levelAndBramble: { enemyLevel: ref.level, characterId: 'castle' },
      // with a plain bramble, one part of the field off at a time (the forest's woods + canopy, High Canopy, Spring Rain) and no CPU leader
      plainNoCanopy: { characterId: 'castle', rules: Object.assign({}, n.rules || {}, { canopy: false, woods: false }) },
      plainNoRain: { characterId: 'castle', rules: Object.assign({}, n.rules || {}, { field: false }) },
      plainFieldOff: { characterId: 'castle', rules: Object.assign({}, n.rules || {}, fieldOff) },
      plainNoLeader: { characterId: 'castle', leaders: [] },
      all: { enemyLevel: ref.level, leaders: [], shieldOverride: 0, rules: Object.assign({}, n.rules || {}, fieldOff), characterId: 'castle' },
    };
    const row = { code: n.key, map: m.id, mapName: m.name, kind: n.kind, target: t, enemyLevel: eL, refLevel: ref.level, refDeckMap: ref.deckMap, win: {} };
    for (const [k, v] of Object.entries(V)) { const nn = Object.assign({}, n, v); G.NODE_MAP_HINT.set(nn, m.id);
      const r = G.simulateReferenceFight(m.id, nn, GAMES, { seed0: 9100 }); row.win[k] = Math.round(r.wins / GAMES * 1000) / 10; }
    rows.push(row); console.log(n.key.padEnd(8), 't', t, 'eLv', eL, 'refLv', ref.level, JSON.stringify(row.win));
  } }
const out = path.join(ROOT, 'docs', 'balance', 'bal20', 'diag-2026-11-06' + (CODES.length ? '-part' : '') + '.json');
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, JSON.stringify({ about: 'BAL20: one factor at a time on The Canopy and Savanna Reaches (tools/bal20/diag_2026_11_06.js)', games: GAMES, seed0: 9100, rows }, null, 1) + '\n');
