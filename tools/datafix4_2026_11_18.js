#!/usr/bin/env node
// Package DATAFIX (2026-11-18), step 4: canonical/map-review.json follows the Map 22 and 23 lists (tests/content10 item 2): a chosen card that left the MAP
// list (and is not on SPECIAL) is dropped; a MAP card with no entry gets one (CONTENT13's own cards, kept at their source).
//   node tools/datafix4_2026_11_18.js [apply]
'use strict';
const fs = require('fs'), path = require('path'), ROOT = path.join(__dirname, '..');
const RF = path.join(ROOT, 'canonical', 'map-review.json'), review = JSON.parse(fs.readFileSync(RF, 'utf8'));
const pools = JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical', 'map-pools.json'), 'utf8')).maps, by = Object.fromEntries(JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical', 'cards.json'), 'utf8')).map(c => [c.id, c]));
for (const id of ['m22', 'm23']) { const r = review.maps[id], P = pools[id], on = new Set(P.cards.concat(P.special || []));
  const drop = r.chosen.filter(e => !on.has(e.id)).map(e => e.id); r.chosen = r.chosen.filter(e => on.has(e.id));
  const add = P.cards.filter(c => !r.chosen.some(e => e.id === c));
  add.forEach(c => { const s = (by[c] || {}).source || {}; r.chosen.push({ id: c, why: `2026-11-18 (DATAFIX): on the MAP list (CONTENT13${s.kind === 'pack' && s.map === id ? ': a Pack ' + s.tier + ' card of this map' : ''})`, by: 'kept' }); });
  console.log(id, 'dropped', drop.join(','), '| added', add.join(',')); }
if (process.argv.includes('apply')) fs.writeFileSync(RF, JSON.stringify(review, null, 1) + '\n');
