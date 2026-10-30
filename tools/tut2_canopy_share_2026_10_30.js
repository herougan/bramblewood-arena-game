#!/usr/bin/env node
// 2026-10-30 (package TUT2, owner ENG13-3: "just use logic and reduce it, no need to remeasure."). Canopy Cover now dodges only shots,
// skills and Flying / thrown swings (ENG13; bramblewood-engine.js en5FromAbove + the shot check), not a ground unit's melee swing. Its price
// (bramblewood-budget.js canopyMultOf) is scaled by the share of single-target attacks a unit meets that are of those kinds, counted over the
// live cards on the map lists (canonical/map-pools.json, every tier), each card weighted by how many lists it is on.
// Per card: a swing (Attack > 0, not an Archer) is one attack, covered when the card is Flying or thrown (Boomerang, Bananarang); each
// single-target shot skill or damage trigger is one more attack, always covered. Run: node tools/tut2_canopy_share_2026_10_30.js [--json]
'use strict';
const path = require('path'), ROOT = path.join(__dirname, '..');
const pools = require(path.join(ROOT, 'canonical', 'map-pools.json')).maps;
const cards = Object.fromEntries(require(path.join(ROOT, 'canonical', 'cards.json')).map(c=> [c.id, c]));
// single-target shots and damage skills on the listed cards (Volley and Twin Shot count once: one skill)
const SHOTS = ['arrow', 'fireArrow', 'iceArrow', 'acidBolt', 'poisonBolt', 'iceBolt', 'fireBolt', 'shockBolt', 'rocket', 'spitfire', 'twinShot', 'volley', 'snipe', 'missile', 'trident', 'onReadyDamage'];
const THROWN = ['boomerang', 'bananarang'];
function share(){
  const w = {};
  Object.values(pools).forEach(m=> [m.cards || [], ...Object.values(m.submaps || {}), m.special || []].forEach(l=> l.forEach(id=> { w[id] = (w[id] || 0) + 1; })));
  let all = 0, cov = 0, n = 0; const rows = [];
  Object.entries(w).forEach(([id, k])=>{ const c = cards[id]; if(!c || c.unattainable) return; const e = c.effects || {};
    const swing = (c.attack || 0) > 0 && !e.archer ? 1 : 0, above = swing && (e.flying || THROWN.some(x=> e[x])) ? 1 : 0;
    const shots = SHOTS.filter(x=> e[x]).length + (e.archer ? 1 : 0) + (Array.isArray(e.triggers) ? e.triggers.filter(t=> t && t.do === 'damage' && t.sub !== 'all').length : 0);
    const a = swing + shots, cv = above + shots; if(!a) return;
    n++; all += k * a; cov += k * cv; rows.push({id, lists: k, swing, above, shots}); });
  return {cards: n, attacks: all, covered: cov, share: Math.round(cov / all * 1000) / 1000, rows};
}
module.exports = {share, SHOTS, THROWN};
if(require.main === module){ const r = share();
  if(process.argv.includes('--json')) console.log(JSON.stringify(r, null, 1));
  else console.log(`${r.cards} attacking cards on the lists; weighted single-target attacks ${r.attacks}, of them shots / skills / Flying or thrown swings ${r.covered}: share ${r.share}`); }
