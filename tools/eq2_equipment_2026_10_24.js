#!/usr/bin/env node
// Package EQ2 (2026-10-24): what durability does to the equipment budgets. Each equipment card is measured as package EQ priced it
// (tools/eq_cards_2026_10_19.js: its own Attack / Health plus its grant counted as skills, through tools/skill_costs.js at Level 1), then
// with bramblewood-budget.js equipLifeMult (min(durability, 4) / 4 on the whole left side of cap 1: the piece now lasts about its
// durability in rounds). Nothing is changed: the table is the input to owner call EQ2-1 (keep the stats, or raise the Common /
// Uncommon pieces into the room durability frees).
//   node tools/eq2_equipment_2026_10_24.js   -> the table and docs/balance/eq2-equipment-2026-10-24.json
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
if(!process.argv.includes('--world=half')) process.argv.push('--world=half');
const SC = require('./skill_costs.js'), BB = require('../bramblewood-budget.js');
const costs = JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical', 'skill-costs.json'), 'utf8')), T = SC.make(costs);
const cards = JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical', 'cards.json'), 'utf8')).filter(c=> c.cardType === 'equipment');
const r2 = v=> Math.round(v * 100) / 100;
const rows = cards.map(c=>{
  const d = Object.assign({}, c, {effects: (c.equip && c.equip.grant) || {}}), b = T.budget(d, {level: 1});
  const dur = BB.equipDurOf(c), m = BB.equipLifeMult(c), x1 = r2(b.x1 * m);
  // the stats that fill the room again at the same use (2A+H points, all into Health for a pure armor piece, else shape kept)
  const room = r2(b.x1 - x1);
  return {id: c.id, rarity: c.rarity, cost: c.cost, attack: c.attack || 0, health: c.health || 0, grant: (c.equip && c.equip.grant) || {}, durability: dur, lifeMult: m,
    N: b.N, S: b.S, x1Before: b.x1, x1After: x1, useBefore: r2(b.x1 / b.N * 100), useAfter: r2(x1 / b.N * 100), roomFreed: room};
});
rows.forEach(r=> console.log(`${r.id.padEnd(18)} ${r.rarity.padEnd(10)} ${r.attack}/${r.health} dur ${r.durability} x${r.lifeMult}: 2A+H+S ${r.x1Before} -> ${r.x1After} of N ${r.N} (${r.useBefore}% -> ${r.useAfter}%), ${r.roomFreed} points freed`));
fs.mkdirSync(path.join(ROOT, 'docs', 'balance'), {recursive: true});
fs.writeFileSync(path.join(ROOT, 'docs', 'balance', 'eq2-equipment-2026-10-24.json'), JSON.stringify({_about: 'Package EQ2 (2026-10-24): equipment budgets before and after durability (tools/eq2_equipment_2026_10_24.js; bramblewood-budget.js equipLifeMult). No card changed: owner call EQ2-1.', rows}, null, 1) + '\n');
