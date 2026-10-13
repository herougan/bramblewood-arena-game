#!/usr/bin/env node
// Darkness levels (D67/D73) and the heat/cold rework (D66), 2026-10-13.
'use strict';
const H = require('./lib/harness.js');
const E = H.Engine;
let fail = 0; const ok = (c, m)=>{ if(!c){ fail++; console.log('  ✗', m); } };
const so = id=> id===1 ? 'A' : 'B';
const U = (id, effects, o)=> Object.assign({id, name:id, attack:2, health:30, wait:0, cost:0, effects:effects||{}}, o||{});
const defs = Object.assign({}, H.loadCardDefs(), {
  'd-plain': U('d-plain'), 'd-see': U('d-see', {darksight:true}), 'd-noc': U('d-noc', {nocturnal:[1,0]}), 'd-lamp': U('d-lamp', {lantern:true}),
  'd-coldweak': U('d-coldweak', {weakness:['cold']}), 'd-hotweak': U('d-hotweak', {weakness:['heat']}), 'd-dry': U('d-dry', {dry:true}),
});
const all = pl=> [...pl.row.left, ...pl.row.center, ...pl.row.right];
const mk = rules=>{ const e = E.makeSimEngine(defs, E.mulberry32(9), {recordEvents:true, battleMode:'open', rules}); const P = {1:e.newPlayer(1,{}), 2:e.newPlayer(2,{})}; return {e, P}; };
const missOf = (rules, id, extra)=>{ const {e, P} = mk(rules); e.debugSpawnCard(P, so, 1, id, 'left', {}, []); if(extra) e.debugSpawnCard(P, so, 1, extra, 'right', {}, []); e.roundStart(P, 2, so, {}, []); return e.sightMiss(all(P[1]).find(c=> c.defId===id), 1); };
ok(missOf({dark:'dark', phase:'day'}, 'd-plain') === 0.25, 'Darkness: 1 in 4');
ok(missOf({dark:'pitch', phase:'day'}, 'd-plain') === 0.5, 'Pitchblack: 1 in 2');
ok(missOf({dark:'absolute', phase:'day'}, 'd-plain') === 1, 'Absolute darkness: always misses');
ok(missOf({dark:'absolute', phase:'day'}, 'd-see') === 0, 'Darksight sees in absolute darkness');
ok(missOf({dark:'absolute', phase:'day'}, 'd-plain', 'd-lamp') === 0.5, 'a Lantern brings absolute down to 1 in 2');
ok(missOf({dark:'pitch', phase:'day'}, 'd-plain', 'd-lamp') === 0, 'a Lantern lights Pitchblack');
ok(missOf({phase:'night'}, 'd-plain') === 0.25, 'night is Darkness: 1 in 4');
ok(missOf({phase:'night'}, 'd-noc') === 0, 'Nocturnal sees at night');
ok(missOf({phase:'day'}, 'd-plain') === 0, 'day: no miss');
{ const {e, P} = mk({field:'frozen', frostWait:1}); e.debugSpawnCard(P, so, 1, 'd-coldweak', 'left', {}, []); const c = all(P[1])[0], h = c.hp, w = c.wait;
  e.roundStart(P, 2, so, {}, []); ok(c.wait === w + 1 && c.hp === h - 2, `cold-weak unit: +1 Wait and ice damage (wait ${c.wait - w}, dmg ${h - c.hp})`); }
{ const {e, P} = mk({field:'heatwave', heatLevel:2}); ['d-plain','d-hotweak','d-dry'].forEach((id, i)=> e.debugSpawnCard(P, so, 1, id, i ? 'right' : 'left', {}, []));
  e.roundStart(P, 2, so, {}, []); const g = id=> all(P[1]).find(c=> c.defId===id);
  ok(g('d-plain').hp === 28, `Scorching level 2: 2 fire damage (${30 - g('d-plain').hp})`); ok(g('d-hotweak').hp === 26, `heat-weak takes double (${30 - g('d-hotweak').hp})`); ok(g('d-dry').hp === 30, 'Dry is spared'); }
// Zeitgebers: the first Nocturnal unit played starts the day/night cycle in a day-by-default fight
{ const e = E.makeSimEngine(defs, E.mulberry32(2), {recordEvents:true, battleMode:'open', rules:{phase:'day', zeitgeber:true, phaseLen:2}}); const P = {1:e.newPlayer(1,{'d-noc':10}), 2:e.newPlayer(2,{})};
  e.roundStart(P, 1, so, {}, []); e.roundStart(P, 2, so, {}, []); ok(e.getPhase() === 'day' && e.getZeitStart() === null, 'no cycle before a Zeitgeber');
  e.draw(P[1], 1, 'A', {}, []); e.placeCard(P, so, 1, P[1].hand[0].uid, 'left', {}, []); ok(e.getZeitStart() === 2, `the Nocturnal unit starts the cycle (${e.getZeitStart()})`);
  const seq = []; for(let r = 3; r <= 7; r++){ e.roundStart(P, r, so, {}, []); seq.push(e.getPhase()); }
  ok(seq.join() === 'day,night,night,day,day', `Day, then Night, 2 rounds each (${seq})`); }
{ const e = E.makeSimEngine(defs, E.mulberry32(2), {recordEvents:true, battleMode:'open', rules:{phase:'day'}}); const P = {1:e.newPlayer(1,{'d-noc':10}), 2:e.newPlayer(2,{})};
  e.roundStart(P, 1, so, {}, []); e.draw(P[1], 1, 'A', {}, []); e.placeCard(P, so, 1, P[1].hand[0].uid, 'left', {}, []); ok(e.getZeitStart() === null, 'a designer-set Day stays Day'); }
console.log(`darkness-1013: ${fail} failure(s)`); process.exit(fail ? 1 : 0);
