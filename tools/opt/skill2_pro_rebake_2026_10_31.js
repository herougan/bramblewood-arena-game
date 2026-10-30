#!/usr/bin/env node
// 2026-10-31 (package SKILL2, decision BUDGET2-7: "re-bake the PRO leaders and stored fields, after SKILL2's re-pricing"): every entry of
// canonical/pro-skirmishes.json gets its stored average field re-computed (tools/opt/pro_skirmishes.js averageField: since BUDGET2 the sims
// see the maps' biome flags, hotMap / coldMap / saltMap / weatherMap, so a stored field without them played a hot, cold, salt or dry map's
// PRO without its Heat / Frost / Salt / Drought skills) and every PRO / BPRO deck its showcase leader (leadersFor: rarity, then Attack +
// Health / 2, from Map 2) under the current cards. The decks are not searched again. What changed goes under the entry's `history`.
//   node tools/opt/skill2_pro_rebake_2026_10_31.js [--dry]
'use strict';
const path = require('path'), fs = require('fs');
const ROOT = path.resolve(__dirname, '..', '..');
const O = require('./deckopt.js'), P = require('./pro_skirmishes.js');
const FILE = path.join(ROOT, 'canonical', 'pro-skirmishes.json'), DATE = '2026-10-31';
function main(argv) {
  const dry = argv.includes('--dry'), gm = O.loadGame(ROOT), G = gm.G, file = JSON.parse(fs.readFileSync(FILE, 'utf8'));
  let nField = 0, nLead = 0;
  Object.keys(file.maps).forEach(id => {
    const ent = file.maps[id], map = G.CONQUEST_MAPS.find(m => m.id === id); if (!map) { console.log(id + ': no such map (left)'); return; }
    const f = P.averageField(gm, map), field = f ? Object.assign({}, f, { summary: P.fieldSummary(gm, f) }) : null, h = { package: 'SKILL2', on: DATE };
    if (field && (JSON.stringify(field.rules) !== JSON.stringify((ent.field || {}).rules) || JSON.stringify(field.terrain) !== JSON.stringify((ent.field || {}).terrain))) {
      h.field = ent.field; ent.field = field; nField++; console.log(`${id}: field ${h.field ? h.field.summary : '-'} -> ${field.summary}`); }
    const leaders = {};
    ['pro', 'bpro'].forEach(list => (ent[list] || []).forEach(e => { const L = P.leadersFor(gm, map, e.deck);
      if (JSON.stringify(L) !== JSON.stringify(e.leaders || [])) { leaders[e.id] = e.leaders || []; console.log(`${e.id}: leader ${(e.leaders || []).join(',') || '-'} -> ${L.join(',') || '-'}`); e.leaders = L; nLead++; } }));
    if (Object.keys(leaders).length) h.leaders = leaders;
    if (h.field || h.leaders) { h.why = 're-baked after BUDGET2 / SKILL2 (decision BUDGET2-7): ' + [h.field ? 'the stored average field (the maps\' biome flags)' : '', h.leaders ? 'the showcase leaders under the re-fit cards' : ''].filter(Boolean).join(' and ') + '; the previous values are here';
      ent.history = (ent.history || []).concat([h]); }
  });
  console.log(`${nField} fields, ${nLead} leaders re-baked`);
  if (dry) return;
  file.updated = DATE; fs.writeFileSync(FILE, JSON.stringify(file, null, 1) + '\n'); console.log('-> ' + path.relative(ROOT, FILE) + ' (rebuild the game to bake it in)');
}
main(process.argv.slice(2));
