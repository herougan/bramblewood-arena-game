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
console.log(fail ? `when-ready: ${fail} failed` : 'when-ready: all passed');
process.exit(fail ? 1 : 0);
