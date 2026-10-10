#!/usr/bin/env node
// Shield Call (2026-10-10): the first enemy skill that targets an ally drops a 0/10 Guardian shield into that ally's place
// (the ally steps to the nearest slot) and the skill hits the shield. Once per hound. +1 shield Health per level.
'use strict';
const H = require('./lib/harness.js');
const E = H.Engine;
let fail = 0; const ok = (c, m)=>{ if(!c){ fail++; console.log('  ✗', m); } };
const base = H.loadCardDefs();
ok(base['summoned-shield'] && base['shieldbearer-hound'], 'the shield token and the Shieldbearer Hound exist');
function run(mode, houndLevel){
  const defs = Object.assign({}, base, {
    'sc-zap':   {id:'sc-zap', name:'Zap', attack:0, health:5, wait:9, cost:0, effects:{triggers:[{on:'onSpawn', do:'damage', amount:3, dmgType:'physical', who:'enemy', sub:'furthest'}]}},
    'sc-pal':   {id:'sc-pal', name:'Pal', attack:0, health:20, wait:9, cost:0, effects:{}},
  });
  if(houndLevel) defs['shieldbearer-hound'] = Object.assign({}, defs['shieldbearer-hound'], {level: houndLevel + 1, baseLevel: 1});
  const e = E.makeSimEngine(defs, E.mulberry32(3), {recordEvents:true, battleMode:mode});
  const so = id=> id===1 ? 'A' : 'B';
  const P = {1: e.newPlayer(1, {}), 2: e.newPlayer(2, {})};
  const ev = [];
  e.debugSpawnCard(P, so, 2, 'shieldbearer-hound', 'left', {}, ev);
  e.debugSpawnCard(P, so, 2, 'sc-pal', 'right', {}, ev);
  const before = e.allBoardCards(P[2]).map(c=> c.hp);
  e.debugSpawnCard(P, so, 1, 'sc-zap', 'left', {}, ev);
  const cards = e.allBoardCards(P[2]);
  const shield = cards.find(c=> c.defId==='summoned-shield');
  return {e, P, so, ev, cards, shield, before};
}
for(const mode of ['open', 'classic']){
  const r = run(mode, 0);
  ok(r.shield, `[${mode}] a shield is summoned`);
  if(r.shield){
    ok(r.shield.hp === 7 && r.shield.maxHp === 10, `[${mode}] the shield took the 3 damage (hp ${r.shield.hp}/${r.shield.maxHp})`);
    ok(r.cards.filter(c=> c.defId!=='summoned-shield').every(c=> c.hp === c.maxHp), `[${mode}] the real units are untouched`);
    ok(r.ev.some(x=> x.type==='spawn' && x.cause==='shieldCall'), `[${mode}] a shieldCall spawn event is logged`);
    ok(r.ev.some(x=> x.type==='statusFx' && x.kind==='shieldCall'), `[${mode}] a shieldCall statusFx is logged`);
    if(mode==='open'){ const slots = r.cards.map(c=> c.slot); ok(new Set(slots).size === slots.length, `[open] no two units share a slot (${slots})`); }
  }
  // Once only: a second zap hits a real unit.
  const ev2 = []; r.e.debugSpawnCard(r.P, r.so, 1, 'sc-zap', 'left', {}, ev2);
  ok(r.e.allBoardCards(r.P[2]).filter(c=> c.defId==='summoned-shield').length === 1, `[${mode}] only one shield per hound`);
}
const lv = run('open', 3);
ok(lv.shield && lv.shield.maxHp === 13, `a level-3-above-base hound calls a 0/13 shield (got ${lv.shield && lv.shield.maxHp})`);
console.log(`shield-call: ${fail} failure(s)`);
process.exit(fail ? 1 : 0);
