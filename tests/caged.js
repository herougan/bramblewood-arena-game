#!/usr/bin/env node
// Caged Fight (2026-10-10): the cage sits on the host's board, never acts, blocks its column, and frees the owner's
// leader (onto the owner's board, nearest the cage's column) when it breaks. Cage HP: L0 5, L1 6, +2/level, L10 25.
'use strict';
const H = require('./lib/harness.js');
const E = H.Engine;
let fail = 0; const ok = (c, m)=>{ if(!c){ fail++; console.log('  ✗', m); } };
const so = id=> id===1 ? 'A' : 'B';
const defs = Object.assign({}, H.loadCardDefs(), {
  'tc-wall': {id:'tc-wall', name:'Wall', attack:0, health:200, wait:0, cost:0, effects:{}},
  'tc-hit':  {id:'tc-hit', name:'Hitter', attack:4, health:200, wait:0, cost:0, effects:{}},
  'tc-lead': {id:'tc-lead', name:'Leader', attack:6, health:7, wait:0, cost:0, effects:{}},
});
const all = pl=> [...pl.row.left, ...pl.row.center, ...pl.row.right];
const e = E.makeSimEngine(defs, E.mulberry32(2), {recordEvents:true, battleMode:'open'});
ok([0,1,2,5,9,10].map(e.cageHpForLevel).join(',') === '5,6,8,14,22,25', `cage HP by level: ${[0,1,2,5,9,10].map(e.cageHpForLevel).join(',')}`);
const P = {1: e.newPlayer(1, {}), 2: e.newPlayer(2, {})};
const cage = e.placeCage(P, so, 2, 1, 4, 'tc-lead', 6, []);
ok(cage && cage.slot === 4 && P[2].row.right.includes(cage), 'the cage sits on the host board at slot 4');
ok(JSON.stringify(e.legalSlots(P[2])) === '[0]', `the cage doesn't open slots beside it (host legal ${JSON.stringify(e.legalSlots(P[2]))})`);
['tc-wall','tc-wall','tc-wall','tc-wall','tc-hit'].forEach(id=> e.debugSpawnCard(P, so, 1, id, 'right', {}, []));
const hitter = all(P[1]).find(c=> c.defId==='tc-hit');
ok(hitter && hitter.slot === 4, `the hitter stands in column 4 (slot ${hitter && hitter.slot})`);
const hq0 = P[2].hq.hp, my0 = P[1].hq.hp; const ev = [];
e.resolveCombat(P, so, {}, ev, 1);
ok(P[2].hq.hp === hq0, `the cage blocks column 4: no castle damage (castle ${hq0}→${P[2].hq.hp})`);
ok(P[1].hq.hp === my0 && !ev.some(x=> x.attUid===cage.uid), 'the cage never attacks');
e.resolveCombat(P, so, {}, ev, 1);
ok(!all(P[2]).some(c=> c.cageOf), 'two hits of 4 break a 6 HP cage');
ok(ev.some(x=> x.type==='cageBroken'), 'a cageBroken event is recorded');
const lead = all(P[1]).find(c=> c.defId==='tc-lead');
ok(!!lead, 'the leader is freed onto its owner\'s board');
ok(lead && Math.abs(lead.slot - 4) <= 1, `freed next to the cage's column (slot ${lead && lead.slot})`);
console.log(`caged: ${fail} failure(s)`); process.exit(fail ? 1 : 0);
