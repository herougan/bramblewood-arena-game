#!/usr/bin/env node
// 2026-11-13 (package SIDE2): the side-map fights SKIR1's builder left unbuilt on SIDE1's thin lists get a second try with the builder's own fill
// (tools/skir1/build_2026_11_11.js fill: the fight's pool, size, caps, K14, kept cards, showcase leader), without the map-wide soft rules
// (a card in at most half the map's fights; two cards of a family the list has only two of never together): The Ice Hollow's 20-card fights
// hold Lone Grey Wolf (kept) and the list's other wolf and two seals, so the family rule left 18 cards at most. A fight still unbuildable keeps
// its deck and is reported (The Canopy: K14 leaves 10 own copies + 1 copy each of up to 4 carried cards for decks of 14-20).
//   node tools/side2/fallback_2026_11_13.js          rewrites docs/balance/side2/build-plan-2026-11-13.json's unbuilt fights (apply with the builder)
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..', '..'), PLAN = path.join(ROOT, 'docs', 'balance', 'side2', 'build-plan-2026-11-13.json');
process.argv[2] = 'fallback'; // the builder runs its own command line on load (default 'plan'): give it none of its commands
require('./holds_2026_11_13.js').patch(); // round 2: LIST1's held cards stay out of side fights' pools
const L = require('../skir1/lib_fight_2026_11_11.js'), G = L.G, BLD = require('../skir1/build_2026_11_11.js');
const plan = JSON.parse(fs.readFileSync(PLAN, 'utf8')); const out = [];
for (const p of plan.maps) for (const x of p.fights) {
  if (x.role !== 'unbuilt') continue;
  const m = L.maps().find(mm => mm.id === p.id), n = L.fightsOf(m).find(nn => nn.key === x.code), f = L.fight(m, n);
  let t = 0.6; try { t = G.skirmishTargetBand(m.id, n).t; } catch (e) {}
  let s = 7; const R = () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };
  let d = null; for (let k = 0; k < 30 && !d; k++) { const ids = f.pool.slice().sort(() => R() - 0.5).slice(0, f.dMax); [...f.keep.keys()].forEach(id => { if (!ids.includes(id)) ids.unshift(id); });
    d = BLD.fill(f, BLD.spread(ids.slice(0, f.dMax), f.S, t), () => 1, R, null); }
  if (d) { Object.assign(x, { role: 'blend', deck: d, problems: [], fallback: 'SIDE2: built without the map-wide soft rules (usage line, two-card families)' }); out.push(x.code + ' built ' + JSON.stringify(d)); }
  else { x.unbuildable = (BLD.fill.last || []).join('; '); out.push(x.code + ' still unbuildable: ' + x.unbuildable); }
}
fs.writeFileSync(PLAN, JSON.stringify(plan, null, 1) + '\n'); out.forEach(l => console.log(l));
