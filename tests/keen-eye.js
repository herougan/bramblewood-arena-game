#!/usr/bin/env node
// 2026-10-11: Keen Eye hits Changelings 2 harder (and nothing else); the three Keen Eye cards carry the flag.
'use strict';
const H = require('./lib/harness.js');
const E = H.Engine;
let fail = 0; const ok = (c, m)=>{ if(!c){ fail++; console.log('  ✗', m); } };
const so = id=> id===1 ? 'A' : 'B';
const base = H.loadCardDefs();
['owl-sentinel','fawn-scout','warren-scout'].forEach(id=> ok(base[id].effects.keenEye === true, id+' has Keen Eye'));
const defs = Object.assign({}, base, {
  'tk-eye': {id:'tk-eye', name:'T Eye', attack:3, health:30, wait:0, cost:0, effects:{keenEye:true}},
  'tk-plain': {id:'tk-plain', name:'T Plain', attack:0, health:40, wait:0, cost:0, effects:{}},
});
const e = E.makeSimEngine(defs, E.mulberry32(3), {recordEvents:true, battleMode:'open'});
const P = {1:e.newPlayer(1,{}), 2:e.newPlayer(2,{})};
e.debugSpawnCard(P, so, 1, 'tk-eye', 'left', {}, []);
e.debugSpawnCard(P, so, 2, 'puddle-changeling', 'left', {}, []);
e.debugSpawnCard(P, so, 2, 'tk-plain', 'right', {}, []);
const eye = e.allBoardCards(P[1])[0];
const ch = e.allBoardCards(P[2]).find(c=> c.defId==='puddle-changeling'), plain = e.allBoardCards(P[2]).find(c=> c.defId==='tk-plain');
ok(e.damageCard(ch, eye.atk, 'physical', eye).dmg === 5, 'Keen Eye deals 3 + 2 to a Changeling');
ok(e.damageCard(plain, eye.atk, 'physical', eye).dmg === 3, 'Keen Eye deals its plain 3 to anything else');
console.log(fail ? `keen-eye: ${fail} failed` : 'keen-eye: all passed');
process.exit(fail ? 1 : 0);
