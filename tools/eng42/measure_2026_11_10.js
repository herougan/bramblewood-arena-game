#!/usr/bin/env node
// 2026-11-10 (package ENG42): the road fights that carry one of the four boons whose theme was a skill (Rising Tide, Wild Rage, Siege Train,
// Sky Ambush), with the boon's count (on the expanded defs, as tests/bal3-2026-10-24.js reads it) and 200 games on the road seeds
// (9100 + 37g, the BAL35 / BAL40 road measure: referenceFightSetup + playReferenceGame, the Map reference). Run once on the old engine
// (--label before) and once on the new (--label after); --games N to change the count.
//   node tools/eng42/measure_2026_11_10.js --label before   -> docs/balance/eng42/before-2026-11-10.json
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..', '..');
const B = require('../lib_bramble.js'), G = B.G, D = B.CARD_DEFS_BASELINE, E = require(path.join(ROOT, 'bramblewood-engine.js'));
const a = process.argv.slice(2), arg = (k, d) => { const i = a.indexOf(k); return i >= 0 ? a[i + 1] : d; };
const LABEL = arg('--label', 'after'), GAMES = +arg('--games', 200), SEED0 = 9100;
const BOONS = ['risingTide', 'wildRage', 'siegeTrain', 'skyAmbush'];
const DX = JSON.parse(JSON.stringify(D)); if (E.SKILL_PARAMS_LIB) E.SKILL_PARAMS_LIB.expandDefsInPlace(DX);
const rows = [];
for (const m of G.CONQUEST_MAPS) {
  if (m.reserved || m.tower || m.endless) continue; const no = G.mapNumberOf(m.id);
  for (const n of m.nodes || []) {
    const id = n.rules && n.rules.boon; if (!id || !BOONS.includes(id) || !n.deck) continue;
    const st = E.selfishBoonCount(DX, n.deck, id), road = no != null && no <= 20; let win = null;
    if (road || a.includes('--all')) { G.NODE_MAP_HINT.set(n, m.id); const ctx = G.referenceFightSetup(m.id, n, { seed0: SEED0 }); let w = 0;
      for (let g = 0; g < GAMES; g++) if (G.playReferenceGame(ctx, g).win) w++; win = Math.round(w / GAMES * 1000) / 10; }
    let band = null; try { const b = G.skirmishTargetBand(m.id, n); band = b && b.t != null ? Math.round(b.t * 1000) / 10 - (n.challenge && b.curve ? 10 : 0) : null; } catch (e) {}
    const r = { code: n.key, map: m.id, mapNo: no, name: n.name, boon: id, have: st.have, total: st.total, need: st.need, on: st.on, win200: win, target: band };
    rows.push(r); console.log(n.key.padEnd(8), (n.name || '').padEnd(18), id.padEnd(11), `${st.have}/${st.total}`, st.on ? 'ON ' : 'off', win == null ? '(not measured: past Map 20)' : win + '%', band == null ? '' : 'target ' + band);
  }
}
const OUT = path.join(ROOT, 'docs', 'balance', 'eng42', LABEL + '-2026-11-10.json'); fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify({ about: `ENG42 ${LABEL} (tools/eng42/measure_2026_11_10.js): ${GAMES} games on the road seeds (${SEED0} + 37g), the Map reference`, rows }, null, 1) + '\n');
