#!/usr/bin/env node
// CONTENT12 (2026-11-06, CONTENT11-1): in-play cards whose line (Lumber, Stone, Metal, Wait, Attack, Health, skills, level skills) is the
// same as another in-play card's. Out-of-play cards (lib_map_pools budgetHold 'unplaced'), tokens and tests are left out.
//   node tools/content12_twins_2026_11_06.js
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..'), LMP = require(path.join(ROOT, 'tools', 'lib_map_pools.js'));
const cards = JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical', 'cards.json'), 'utf8'));
const sortKeys = v=> Array.isArray(v) ? v.map(sortKeys) : v && typeof v === 'object' ? Object.fromEntries(Object.keys(v).sort().map(k=> [k, sortKeys(v[k])])) : v;
const groups = {};
cards.forEach(c=>{ if(!c || c.token || c.test || c.pool || c.field || c.hidden || LMP.budgetHold(c.id) === 'unplaced') return;
  if(c.attack == null || c.health == null) return;
  const e = Object.assign({}, c.effects || {}); delete e.resist;
  const k = JSON.stringify([c.cost || 0, c.stoneCost || 0, c.metalCost || 0, c.wait || 0, c.attack, c.health, sortKeys(e), sortKeys(c.levelSkills || {})]);
  (groups[k] = groups[k] || []).push(c.id + (c.rarity === 'starter' || c.basic ? '*' : '')); });
const twins = Object.entries(groups).filter(([, v])=> v.length > 1);
twins.forEach(([k, v])=> console.log(k, '=>', v.join(', ')));
console.log(twins.length, 'groups,', twins.reduce((a, [, v])=> a + v.length, 0), 'cards (* = starter / basic)');
