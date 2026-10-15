#!/usr/bin/env node
// 2026-10-15 (effects batch A): the battle effects explain Resisted (½), Weak (×2) and Immune (0) hits by reading the two cards'
// data the same way the engine does (FX.A.hitFactor in bramblewood-fx-a.js). This keeps that copy honest: for each case the
// factor the effect reads must match the damage the engine actually deals.
'use strict';
const H = require('./lib/harness.js');
const E = H.Engine;
// a bare-bones DOM so the effect module loads under node (it only needs to inject its <style> block)
const el = ()=> ({style:{}, setAttribute(){}, appendChild(){}, querySelector(){ return null; }, querySelectorAll(){ return []; }, textContent:'', classList:{add(){}, remove(){}, contains(){ return false; }}});
global.document = {getElementById(){ return null; }, createElement:el, head:el(), body:el()};
global.window = global;
require('../bramblewood-fx-a.js');
const FXA = global.FX && global.FX.A;
let fail = 0; const ok = (c, m)=>{ if(!c){ fail++; console.log('  ✗', m); } };
ok(FXA && typeof FXA.hitFactor === 'function', 'FX.A.hitFactor is exported');
const so = id=> id === 1 ? 'A' : 'B';
const defs = Object.assign({}, H.loadCardDefs(), {
  'tk-att': {id:'tk-att', name:'Att', attack:10, health:50, wait:0, cost:0, archetypes:['Insect'], effects:{}},
  'tk-fire': {id:'tk-fire', name:'Fire', attack:10, health:50, wait:0, cost:0, archetypes:['Volcanic'], dmgType:'heat', effects:{}},
  'tk-plain': {id:'tk-plain', name:'Plain', attack:0, health:200, wait:0, cost:0, effects:{}},
  'tk-res-heat': {id:'tk-res-heat', name:'ResHeat', attack:0, health:200, wait:0, cost:0, resist:['heat'], effects:{}},
  'tk-res-insect': {id:'tk-res-insect', name:'ResInsect', attack:0, health:200, wait:0, cost:0, effects:{resist:['Insect']}},
  'tk-weak-heat': {id:'tk-weak-heat', name:'WeakHeat', attack:0, health:200, wait:0, cost:0, effects:{weakness:['heat']}},
  'tk-immune-heat': {id:'tk-immune-heat', name:'ImmHeat', attack:0, health:200, wait:0, cost:0, effects:{immune:['heat']}},
  'tk-dry': {id:'tk-dry', name:'Dry', attack:0, health:200, wait:0, cost:0, effects:{dry:true}},
  'tk-ghost': {id:'tk-ghost', name:'Ghost', attack:0, health:200, wait:0, cost:0, effects:{ghost:true}},
});
const cases = [['tk-att', 'tk-plain', 'physical', 1], ['tk-fire', 'tk-res-heat', 'heat', .5], ['tk-att', 'tk-res-insect', 'physical', .5], ['tk-fire', 'tk-weak-heat', 'heat', 2],
  ['tk-fire', 'tk-immune-heat', 'heat', 0], ['tk-fire', 'tk-dry', 'heat', .5], ['tk-att', 'tk-ghost', 'physical', 0], ['tk-att', 'tk-weak-heat', 'physical', 1]];
cases.forEach(([a, t, type, want])=>{
  const e = E.makeSimEngine(defs, E.mulberry32(5), {recordEvents:true, battleMode:'open'});
  const P = {1:e.newPlayer(1, {}), 2:e.newPlayer(2, {})};
  e.debugSpawnCard(P, so, 1, a, 'left', {}, []); e.debugSpawnCard(P, so, 2, t, 'left', {}, []);
  const att = e.allBoardCards(P[1])[0], tgt = e.allBoardCards(P[2])[0];
  const dealt = e.damageCard(tgt, 10, type, att).dmg;
  const f = FXA.hitFactor({attDefId:a, targetDefId:t, dmgType:type}, defs);
  ok(f === want, `${a} → ${t} (${type}): the effect reads ×${f}, expected ×${want}`);
  ok(Math.round(10*f) === dealt, `${a} → ${t} (${type}): the engine dealt ${dealt} for 10, the effect explains ×${f}`);
});
console.log(fail ? `fx-a-resist: ${fail} failed` : 'fx-a-resist: all passed');
process.exit(fail ? 1 : 0);
