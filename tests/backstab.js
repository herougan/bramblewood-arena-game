#!/usr/bin/env node
// Backstab N (D21, 2026-10-10): always attacks the nearest enemy unit, never the castle; +N damage when that unit isn't
// the one directly in front of it.
'use strict';
const H = require('./lib/harness.js');
const E = H.Engine;
let fail = 0; const ok = (c, m)=>{ if(!c){ fail++; console.log('  ✗', m); } };
const defs = Object.assign({}, H.loadCardDefs(), {
  'bs-knife': {id:'bs-knife', name:'Knife', attack:3, health:50, wait:0, cost:0, effects:{backstab:3}},
  'bs-fill':  {id:'bs-fill', name:'Filler', attack:0, health:50, wait:0, cost:0, effects:{}},
  'bs-wall':  {id:'bs-wall', name:'Wall', attack:0, health:500, wait:0, cost:0, effects:{}},
});
ok(H.loadCardDefs()['stoat-cutthroat'], 'Stoat Cutthroat exists');
const so = id=> id===1 ? 'A' : 'B';
function setup(mode, mine, theirs){
  const e = E.makeSimEngine(defs, E.mulberry32(5), {recordEvents:true, battleMode:mode});
  const P = {1: e.newPlayer(1, {}), 2: e.newPlayer(2, {})};
  mine.forEach(([id, side])=> e.debugSpawnCard(P, so, 1, id, side, {}, []));
  theirs.forEach(([id, side])=> e.debugSpawnCard(P, so, 2, id, side, {}, []));
  const knife = e.allBoardCards(P[1]).find(c=> c.defId==='bs-knife');
  const ev = []; e.debugAttack(P, so, knife.uid, {}, ev);
  return ev;
}
for(const mode of ['open', 'classic']){
  // directly in front: plain hit
  let ev = setup(mode, [['bs-knife','left']], [['bs-wall','left']]);
  let h = ev.find(x=> x.type==='hit');
  ok(h && h.dmg === 3 && !h.backstab, `[${mode}] the unit in front takes a plain 3 (got ${h && h.dmg})`);
  // nothing in front: reaches the nearest unit for 3 + 3
  ev = setup(mode, [['bs-fill','left'], ['bs-fill','right'], ['bs-knife','right']], [['bs-wall','left']]);
  h = ev.find(x=> x.type==='hit' && x.attDefId==='bs-knife');
  ok(h && h.dmg === 6 && h.backstab === 3, `[${mode}] a unit off to the side takes 3 + 3 Backstab (got ${h && h.dmg}, backstab ${h && h.backstab})`);
  ok(!ev.some(x=> x.type==='hitHQ'), `[${mode}] it never hits the castle when a unit exists`);
  // no enemy units: holds its swing
  ev = setup(mode, [['bs-knife','left']], []);
  ok(!ev.some(x=> x.type==='hitHQ' || x.type==='hit'), `[${mode}] with no enemy units it doesn't attack the castle`);
}
console.log(`backstab: ${fail} failure(s)`);
process.exit(fail ? 1 : 0);
