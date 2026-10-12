#!/usr/bin/env node
// Pounce (2026-10-12): the evergreen keyword for on-play damage. When the card lands it hits a random enemy unit for N
// (the castle if no units are left), whether it is Waiting or not.
'use strict';
const H = require('./lib/harness.js');
const E = H.Engine;
let fail = 0; const ok = (c, m)=>{ if(!c){ fail++; console.log('  ✗', m); } };
const so = id=> id===1 ? 'A' : 'B';
const defs = Object.assign({}, H.loadCardDefs(), {
  'pc-pouncer': {id:'pc-pouncer', name:'P', attack:0, health:5, wait:3, cost:0, effects:{pounce:4}},
  'pc-target':  {id:'pc-target', name:'T', attack:0, health:20, wait:0, cost:0, effects:{}},
});
const e = E.makeSimEngine(defs, E.mulberry32(5), {recordEvents:true});
const P = {1: e.newPlayer(1, {}), 2: e.newPlayer(2, {})};
e.debugSpawnCard(P, so, 2, 'pc-target', 'center', {}, []);
const t = P[2].row.center[0]; const before = t.hp;
const ev = [];
e.debugSpawnCard(P, so, 1, 'pc-pouncer', 'left', {}, ev);
ok(before - t.hp === 4, `the target took ${before - t.hp} (want 4) though the pouncer is still Waiting`);
ok(ev.some(x=> x.type==='pounce' && x.amount===4), 'a pounce event is recorded');
// every card that still dealt on-play damage through a trigger now uses the keyword instead
const left = Object.values(H.loadCardDefs()).filter(d=> !String(d.id).startsWith('test-') && ((d.effects||{}).triggers||[]).some(x=> x.on==='onSpawn' && x.do==='damage'));
ok(left.length === 0, `cards with an on-play damage trigger left: ${left.map(d=> d.id).join(', ')}`);
console.log(`pounce: ${fail} failure(s)`); process.exit(fail ? 1 : 0);
