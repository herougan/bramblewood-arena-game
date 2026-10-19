#!/usr/bin/env node
// Package EQ's new cards (2026-10-19, owner 21:36): their budget under today's helper (bramblewood-budget.js through tools/skill_costs.js and
// canonical/skill-costs.json), so the coming halving pass can re-derive them like every other card.
//   creature  (the Bucketknee Wolf, the Armory): stats in the card's shape, raised until 2A+H+S reaches 65% of N at Level 1 (the retune's
//             RAISE_TO), both rules passing at Level 1 and at its start level (card_retune_2026_10_19.js check()).
//   equipment (Crowbar): its own stats plus its grant counted as its skills (the Easter-egg test's rule for Terraumbra), within N.
//   hazard    (Frost Slick, Magma Vent, Bog Seep, Miasma, Rockfall): no stats. Its effect is triggers and actions where they fit (owner
//             21:56): S = sum over hazard.triggers of (times it fires) x the action's value (skill_costs actionValue): On Round Start fires
//             once a round (rounds), On Enter Slot about once (ENTER_FIRES). Ice and Rubble have no action for what they do: S = the
//             table's hazardIce / hazardRubble value x n x rounds. Lumber: the least that keeps S <= 50% of N (a card that takes the
//             turn's play and leaves no body is worth about half a unit).
//   node tools/eq_cards_2026_10_19.js          -> the table (and docs/balance/eq-cards-2026-10-19.json for the apply step)
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
const RT = require('./card_retune_2026_10_19.js'), T = RT.T, SC = RT.SC;
const table = JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical', 'skill-costs.json'), 'utf8'));
const HZ = {}; (table.skills || []).forEach(s=>{ if(/^hazard[A-Z]/.test(s.id)) HZ[s.id] = +s.value || 0; });
const HAZ_SHARE = 0.5, RAISE_TO = RT.RAISE_TO, ENTER_FIRES = 1;
const CARDS = Object.fromEntries(JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical', 'cards.json'), 'utf8')).map(c=> [c.id, c]));
const r2 = v=> Math.round(v * 100) / 100;
// the designs (stats here are the shape; the creature's are scaled to the band)
const CREATURES = [
  {id:'bucketknee-wolf', rarity:'veryrare', cost:1, wait:2, shape:[5, 12], effects:{armor:1, helmet:true}},
  {id:'armory', rarity:'rare', cost:1, wait:1, shape:[0, 20], effects:{weaponMaster:1}},
];
const EQUIPMENT = [{id:'crowbar', rarity:'rare', cost:1, wait:0, attack:2, health:0, grant:{pry:1}}];
const HAZARDS = [
  {id:'frost-slick', rarity:'uncommon', kind:'ice', n:1, rounds:3},
  {id:'magma-vent', rarity:'rare', kind:'lava', n:2, rounds:3},
  {id:'bog-seep', rarity:'uncommon', kind:'poison', n:2, rounds:3},
  {id:'miasma', rarity:'rare', kind:'gas', n:1, rounds:4},
  {id:'rockfall', rarity:'uncommon', kind:'rubble', n:1, rounds:3},
];
function fitCreature(c){
  const [A0, H0] = c.shape; let best = null;
  for(let f = 0.3; f <= 4; f += 0.01){ const A = A0 > 0 ? Math.max(1, Math.round(A0 * f)) : 0, H = Math.max(1, Math.round(H0 * f));
    const k = RT.check(Object.assign({}, c, {attack:A, health:H}), A, H); if(!k.ok) break; best = {A, H, k}; if(k.use >= RAISE_TO) break; }
  const b = best.k.b1;
  return {id:c.id, kind:'creature', attack:best.A, health:best.H, N:b.N, S:b.S, x1:b.x1, x2:b.x2, N2:b.N2, use:r2(b.x1 / b.N * 100), parts:b.parts.map(p=> p[1] + ' ' + r2(p[2]))};
}
function equipBudget(c){
  const d = Object.assign({}, c, {effects: c.grant}), b = T.budget(d, {level:1});
  return {id:c.id, kind:'equipment', attack:c.attack, health:c.health, N:b.N, S:b.S, x1:b.x1, x2:b.x2, N2:b.N2, ok:b.ok, use:r2(b.x1 / b.N * 100), missing:b.missing, parts:b.parts.map(p=> p[1] + ' ' + r2(p[2]))};
}
function hazardBudget(c){
  const card = CARDS[c.id], trigs = (card && card.hazard && card.hazard.triggers) || c.triggers || null; let S, how;
  if(trigs && trigs.length){ const parts = trigs.map(t=>{ const fires = t.on === 'onRoundStart' ? c.rounds : t.on === 'onEnterSlot' ? ENTER_FIRES : 1, v = T.actionValue(t, {}).value;
      return {fires, v, txt: `${t.on} ${t.do} ${t.amount}: ${fires} x ${r2(v)}`}; });
    S = r2(parts.reduce((a, p)=> a + p.fires * p.v, 0)); how = parts.map(p=> p.txt).join(' + '); }
  else { const key = 'hazard' + c.kind[0].toUpperCase() + c.kind.slice(1), per = HZ[key] || 0; S = r2(per * c.n * c.rounds); how = `${key} ${per} x ${c.n} x ${c.rounds}`; }
  let cost = 0, N = 0; for(; cost <= 3; cost++){ N = T.budgetN({rarity:c.rarity, cost, wait:0}, 1); if(S <= HAZ_SHARE * N) break; }
  return {id:c.id, kind:'hazard', hazard:{kind:c.kind, n:c.n, rounds:c.rounds}, cost, N, S, how, use:r2(S / N * 100)};
}
const rows = [...CREATURES.map(fitCreature), ...EQUIPMENT.map(equipBudget), ...HAZARDS.map(hazardBudget)];
rows.forEach(r=> console.log(r.kind === 'hazard'
  ? `${r.id}: ${r.hazard.kind} ${r.hazard.n} for ${r.hazard.rounds} rounds, S = ${r.how} = ${r.S}; ${r.cost} Lumber: N ${r.N} (${r.use}%)`
  : `${r.id}: ${r.attack}/${r.health}, N ${r.N}, S ${r.S} (${r.parts.join(', ')}); 2A+H+S ${r.x1} (${r.use}%), A*H+S ${r.x2} <= ${r.N2}`));
fs.mkdirSync(path.join(ROOT, 'docs', 'balance'), {recursive:true});
fs.writeFileSync(path.join(ROOT, 'docs', 'balance', 'eq-cards-2026-10-19.json'), JSON.stringify({_about:'Package EQ new cards, budget under the 2026-10-19 helper (tools/eq_cards_2026_10_19.js)', rows}, null, 1) + '\n');
