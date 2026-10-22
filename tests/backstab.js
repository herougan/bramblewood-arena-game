#!/usr/bin/env node
// Backstab N (D21, 2026-10-10): always attacks the nearest enemy unit, never the castle.
// 2026-10-23 (package EN, owner D21: "if the enemy has a status that makes them less effective at combat or YOU have a skill that makes
// you MORE effective at combat (blind vs evade e.g.)"): +N damage when the unit it strikes is worse at combat (Blind, Stunned, Frozen,
// Asleep, Confused ...), no longer for a unit off to the side.
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
function setup(mode, mine, theirs, status){
  const e = E.makeSimEngine(defs, E.mulberry32(5), {recordEvents:true, battleMode:mode});
  const P = {1: e.newPlayer(1, {}), 2: e.newPlayer(2, {})};
  mine.forEach(([id, side])=> e.debugSpawnCard(P, so, 1, id, side, {}, []));
  theirs.forEach(([id, side])=> e.debugSpawnCard(P, so, 2, id, side, {}, []));
  if(status) e.allBoardCards(P[2]).forEach(c=> Object.assign(c, status));
  const knife = e.allBoardCards(P[1]).find(c=> c.defId==='bs-knife');
  const ev = []; e.debugAttack(P, so, knife.uid, {}, ev);
  return ev;
}
for(const mode of ['open', 'classic']){
  // directly in front, nothing wrong with it: plain hit
  let ev = setup(mode, [['bs-knife','left']], [['bs-wall','left']]);
  let h = ev.find(x=> x.type==='hit');
  ok(h && h.dmg === 3 && !h.backstab, `[${mode}] a unit in good shape takes a plain 3 (got ${h && h.dmg})`);
  // off to the side, in good shape: the nearest unit, but no bonus now
  ev = setup(mode, [['bs-fill','left'], ['bs-fill','right'], ['bs-knife','right']], [['bs-wall','left']]);
  h = ev.find(x=> x.type==='hit' && x.attDefId==='bs-knife');
  ok(h && h.dmg === 3 && !h.backstab, `[${mode}] a unit off to the side in good shape takes a plain 3 (got ${h && h.dmg}, backstab ${h && h.backstab})`);
  ok(!ev.some(x=> x.type==='hitHQ'), `[${mode}] it never hits the castle when a unit exists`);
  // worse at combat: each status gives the +3
  for(const st of [{blind:2}, {stunned:true}, {frozen:2}, {asleep:2}, {confused:2}, {staggered:2}, {webbed:2}, {paralyzed:2}]){
    ev = setup(mode, [['bs-knife','left']], [['bs-wall','left']], st);
    h = ev.find(x=> x.type==='hit' && x.attDefId==='bs-knife');
    ok(h && h.dmg === 6 && h.backstab === 3, `[${mode}] ${Object.keys(st)[0]}: 3 + 3 Backstab (got ${h && h.dmg}, backstab ${h && h.backstab})`);
  }
  // no enemy units: holds its swing
  ev = setup(mode, [['bs-knife','left']], []);
  ok(!ev.some(x=> x.type==='hitHQ' || x.type==='hit'), `[${mode}] with no enemy units it doesn't attack the castle`);
}
console.log(`backstab: ${fail} failure(s)`);
process.exit(fail ? 1 : 0);
