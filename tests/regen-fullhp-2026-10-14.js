#!/usr/bin/env node
// 2026-10-14 (user: "Do not regenerate when the unit is at full health"): a full-health Regen unit neither heals nor stanches,
// and a wounded one still heals.
'use strict';
const H = require('./lib/harness.js'), E = H.Engine;
let fail = 0; const ok = (c, m)=>{ if(!c){ fail++; console.log('  ✗', m); } };
const so = id=> id===1 ? 'A' : 'B';
const defs = Object.assign({}, H.loadCardDefs(), {'rg-troll': {id:'rg-troll', name:'Troll', attack:0, health:20, wait:0, cost:0, effects:{regen:3}}});
const all = pl=> [...pl.row.left, ...pl.row.center, ...pl.row.right];
function run(setup){
  const e = E.makeSimEngine(defs, E.mulberry32(5), {recordEvents:true, battleMode:'open', rules:{}});
  const P = {1:e.newPlayer(1,{}), 2:e.newPlayer(2,{})}; e.debugSpawnCard(P, so, 1, 'rg-troll', 'left', {}, []);
  const c = all(P[1]).find(x=> x.defId === 'rg-troll'); setup(c);
  const ev = []; e.resolveCombat(P, so, {}, ev, 1); return {c, ev};
}
{ const {c, ev} = run(c=>{ c.bleed = 2; });
  ok(!ev.some(x=> x.kind === 'stanch' && x.targetUid === c.uid), 'full health: Regen does not stanch Bleed');
  ok(!ev.some(x=> x.type === 'heal' && x.targetUid === c.uid), 'full health: no heal event'); }
{ const {c, ev} = run(c=>{ c.hp = 10; });
  ok(c.hp > 10 || ev.some(x=> x.type === 'heal' && x.targetUid === c.uid), 'wounded: Regen still heals'); }
console.log(fail ? `regen-fullhp: ${fail} failure(s)` : 'regen-fullhp: all passed'); process.exit(fail ? 1 : 0);
