#!/usr/bin/env node
// 2026-11-11 (package THEME8, owner: a Sea Bass for Map 10): fit the proposed Sea Bass by the budget (bramblewood-budget.js N(L) through
// tools/skill_costs.js budget(), the same check the game's card editor runs). Level 1 (a reward card), obtainMap 10 (Coral Current).
// Prints, per cost / wait line, the largest Attack / Health that passes both caps near the best use of N. Writes nothing; the card is not added
// to cards.json (a later package does).   node tools/theme8/sea_bass_budget_2026_11_11.js
'use strict';
const path = require('path');
const SC = require(path.join(__dirname, '..', 'skill_costs.js'));
const T = SC.make(require(path.join(__dirname, '..', '..', 'canonical', 'skill-costs.json')));
const base = {id: 'sea-bass', name: 'Sea Bass', rarity: 'common', obtainMap: 10, species: ['Fish'], archetypes: ['Ocean', 'Coral Reef'],
  effects: {tide: true, wave: 1, swarm: ['Fish']}};
for (const [cost, wait] of [[1, 1], [1, 2], [2, 2], [0, 1]]) {
  let best = null;
  for (let A = 1; A <= 8; A++) for (let H = 1; H <= 30; H++) {
    const b = T.budget(Object.assign({}, base, {cost, wait, attack: A, health: H}));
    if (!b.ok) continue;
    const use = b.x1 / b.N;
    if (!best || use > best.use || (use === best.use && A > best.A)) best = {A, H, use, b};
  }
  const b = best.b;
  console.log(`cost ${cost} wait ${wait}: best ${best.A}/${best.H} (cap1 ${b.x1} / N ${b.N} = ${Math.round(best.use * 100)}%, cap2 ${b.x2} / ${b.N2}, S ${b.S})`);
  for (const [A, H] of [[2, 9], [3, 7], [3, 8], [2, 10], [3, 6]]) {
    const c = T.budget(Object.assign({}, base, {cost, wait, attack: A, health: H}));
    console.log(`   ${A}/${H}: ${c.ok ? 'ok' : 'OVER'} cap1 ${c.x1}/${c.N} (${Math.round(c.x1 / c.N * 100)}%), cap2 ${c.x2}/${c.N2}`);
  }
}
const s = T.budget(Object.assign({}, base, {cost: 1, wait: 1, attack: 3, health: 7})); // the proposal: 1 Lumber, Wait 1, 3/7
console.log('S parts:', JSON.stringify(s.parts), 'missing:', JSON.stringify(s.missing));
