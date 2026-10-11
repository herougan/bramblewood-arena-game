#!/usr/bin/env node
// 2026-10-11: a trigger flagged whenReady stays silent while its card is still Waiting
// (Scraper of Skies can't release bees until it's built), and works once it's Ready.
'use strict';
const H = require('./lib/harness.js');
const E = H.Engine;
let fail = 0; const ok = (c, m)=>{ if(!c){ fail++; console.log('  ✗', m); } };
const so = id=> id===1 ? 'A' : 'B';
const defs = H.loadCardDefs();
ok(defs['scraper-of-skies'].effects.triggers[0].whenReady === true, 'Scraper of Skies bee trigger is flagged whenReady');
function run(wait){
  const e = E.makeSimEngine(defs, E.mulberry32(7), {recordEvents:true, battleMode:'open'});
  const P = {1:e.newPlayer(1,{}), 2:e.newPlayer(2,{})};
  e.debugSpawnCard(P, so, 1, 'scraper-of-skies', 'left', {}, []);
  const s = [...P[1].row.left, ...P[1].row.center, ...P[1].row.right][0];
  s.wait = wait;
  e.debugFireTrigger(P, so, s.uid, 'onAttacked', {}, []);
  return e.allBoardCards(P[1]).filter(c=> c.defId==='bee-swarmling').length;
}
ok(run(3) === 0, 'no bees while the Scraper is still Waiting');
ok(run(0) === 1, 'one bee once the Scraper is Ready');
// 2026-10-11: the general rule — reactive triggers are off while Waiting; On Death etc. still fire; whileWaiting opts out.
{
  const d2 = Object.assign({}, defs, {
    'tw-react': {id:'tw-react', name:'T React', attack:1, health:20, wait:2, cost:0, effects:{triggers:[{on:'onAttacked', do:'buff', who:'self', amount:1}]}},
    'tw-react2': {id:'tw-react2', name:'T React2', attack:1, health:20, wait:2, cost:0, effects:{triggers:[{on:'onAttacked', do:'buff', who:'self', amount:1, whileWaiting:true}]}},
  });
  const atkAfter = (id, wait)=>{ const e = E.makeSimEngine(d2, E.mulberry32(9), {recordEvents:true, battleMode:'open'}); const P = {1:e.newPlayer(1,{}), 2:e.newPlayer(2,{})};
    e.debugSpawnCard(P, so, 1, id, 'left', {}, []); const c = e.allBoardCards(P[1])[0]; c.wait = wait; e.debugFireTrigger(P, so, c.uid, 'onAttacked', {}, []); return c.atk; };
  ok(atkAfter('tw-react', 2) === 1, 'a reactive trigger is off while Waiting');
  ok(atkAfter('tw-react', 0) === 2, 'the same trigger works once Ready');
  ok(atkAfter('tw-react2', 2) === 2, 'whileWaiting lets it fire while Waiting');
  const e = E.makeSimEngine(defs, E.mulberry32(4), {recordEvents:true, battleMode:'open'}); const P = {1:e.newPlayer(1,{}), 2:e.newPlayer(2,{})};
  e.debugSpawnCard(P, so, 1, 'willow-o-wisp', 'left', {}, []); const w = e.allBoardCards(P[1])[0]; w.wait = 1;
  P[1].graveyard.push({uid:8001, defId:'bee-drone'}, {uid:8002, defId:'bee-drone'}, {uid:8003, defId:'bee-drone'});
  e.debugFireTrigger(P, so, w.uid, 'onDeath', {}, []);
  ok(P[1].exile.length === 2 && P[1].graveyard.length === 1, `Willow-o'-Wisp's On Death exiles 2 from the graveyard even while Waiting (exile ${P[1].exile.length})`);
}
console.log(fail ? `when-ready: ${fail} failed` : 'when-ready: all passed');
process.exit(fail ? 1 : 0);
