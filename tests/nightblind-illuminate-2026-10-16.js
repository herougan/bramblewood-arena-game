#!/usr/bin/env node
// 2026-10-16 (user: "Illuminate, paradoxically also helps nightblindness for the directly opposing creature."): a Night-blind unit
// whose directly facing enemy (the same combat column) has Illuminate (or an old Lantern) doesn't miss for night-blindness.
// An enemy Illuminate unit elsewhere doesn't help, and your own Illuminate still lights your whole side as before.
'use strict';
const H = require('./lib/harness.js'), E = H.Engine;
let fail = 0; const ok = (c, m)=>{ if(!c){ fail++; console.log('  ✗', m); } };
const so = id=> id===1 ? 'A' : 'B';
const U = (id, effects)=> ({id, name:id, attack:2, health:30, wait:0, cost:0, effects:effects||{}});
const defs = Object.assign({}, H.loadCardDefs(), {
  'ni-nb': U('ni-nb', {nightblind:true}), 'ni-lamp': U('ni-lamp', {illuminate:true}), 'ni-oldlamp': U('ni-oldlamp', {lantern:true}), 'ni-plain': U('ni-plain'),
});
const all = pl=> [...pl.row.left, ...pl.row.center, ...pl.row.right];
// mine: [{id, side}] for player 1; foes: the same for player 2. Returns the Night-blind unit's miss chance at night.
function missOf(mine, foes){
  const e = E.makeSimEngine(defs, E.mulberry32(3), {recordEvents:true, battleMode:'open', rules:{phase:'night'}});
  const P = {1:e.newPlayer(1,{}), 2:e.newPlayer(2,{})};
  mine.forEach(x=> e.debugSpawnCard(P, so, 1, x.id, x.side, {}, []));
  foes.forEach(x=> e.debugSpawnCard(P, so, 2, x.id, x.side, {}, []));
  e.roundStart(P, 2, so, {}, []);
  return e.sightMiss(all(P[1]).find(c=> c.defId === 'ni-nb'), 1);
}
ok(missOf([{id:'ni-nb', side:'left'}], []) === 0.5, 'a Night-blind unit alone misses 1 in 2 at night');
ok(missOf([{id:'ni-nb', side:'left'}], [{id:'ni-lamp', side:'left'}]) === 0, 'an enemy Illuminate unit directly facing it lights it: no night-blind misses');
ok(missOf([{id:'ni-nb', side:'left'}], [{id:'ni-oldlamp', side:'left'}]) === 0, 'an old Lantern facing it does the same');
ok(missOf([{id:'ni-nb', side:'left'}], [{id:'ni-plain', side:'left'}, {id:'ni-lamp', side:'right'}]) === 0.5, 'an enemy Illuminate unit that is not facing it does not help');
ok(missOf([{id:'ni-nb', side:'left'}, {id:'ni-lamp', side:'right'}], []) === 0, 'its own side\'s Illuminate still lights it, as before');
console.log(fail ? `nightblind-illuminate: ${fail} failure(s)` : 'nightblind-illuminate: all passed'); process.exit(fail ? 1 : 0);
