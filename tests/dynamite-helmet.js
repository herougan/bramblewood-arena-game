#!/usr/bin/env node
// Dynamite N and Helmet (2026-10-13).
'use strict';
const H = require('./lib/harness.js');
const E = H.Engine;
let fail = 0; const ok = (c, m)=>{ if(!c){ fail++; console.log('  ✗', m); } };
const so = id=> id===1 ? 'A' : 'B';
const U = (id, effects, o)=> Object.assign({id, name:id, attack:1, health:20, wait:0, cost:0, effects:effects||{}}, o||{});
const defs = Object.assign({}, H.loadCardDefs(), {
  'x-dyn': U('x-dyn', {dynamite:3}, {health:18}), 'x-wall': U('x-wall', {}, {attack:0}), 'x-helm': U('x-helm', {helmet:true}, {attack:0}), 'x-archer': U('x-archer', {arrow:2}, {attack:0}),
});
const all = pl=> [...pl.row.left, ...pl.row.center, ...pl.row.right];
const mk = ()=>{ const e = E.makeSimEngine(defs, E.mulberry32(11), {recordEvents:true, battleMode:'open'}); return {e, P:{1:e.newPlayer(1,{}), 2:e.newPlayer(2,{})}}; };
{ const {e, P} = mk(); e.debugSpawnCard(P, so, 1, 'x-dyn', 'left', {}, []); ['left','right'].forEach(l=> e.debugSpawnCard(P, so, 1, 'x-wall', l, {}, [])); ['left','left','right'].forEach(l=> e.debugSpawnCard(P, so, 2, 'x-wall', l, {}, []));
  const d = all(P[1]).find(c=> c.defId==='x-dyn'); ok(d.fuse === 3, 'fuse starts at 3');
  const hp0 = all(P[2]).map(c=> c.hp).reduce((a,b)=> a+b, 0);
  e.roundStart(P, 2, so, {}, []); e.roundStart(P, 3, so, {}, []); ok(all(P[2]).every(c=> c.hp === 20), 'no blast before the fuse runs out');
  const ev = []; e.roundStart(P, 4, so, {}, ev); const hp1 = all(P[2]).map(c=> c.hp).reduce((a,b)=> a+b, 0);
  ok(ev.some(x=> x.type==='dynamite') && hp1 < hp0, `the blast hits the enemies facing it (${hp0} → ${hp1})`); ok(d.hp === 18, 'the dynamiter survives its own blast'); }
{ const {e, P} = mk(); e.debugSpawnCard(P, so, 1, 'x-dyn', 'left', {}, []); const d = all(P[1])[0]; e.roundStart(P, 2, so, {}, []); d.hp = 0; e.removeDeadCards(P, so, {}, {}, []);
  const ev = []; e.roundStart(P, 3, so, {}, ev); e.roundStart(P, 4, so, {}, ev); ok(!ev.some(x=> x.type==='dynamite'), 'dead before the fuse ends: no blast'); }
{ let deflected = 0, hit = 0; for(let s = 1; s <= 40; s++){ const e = E.makeSimEngine(defs, E.mulberry32(s), {recordEvents:true, battleMode:'open'}); const P = {1:e.newPlayer(1,{}), 2:e.newPlayer(2,{})};
    e.debugSpawnCard(P, so, 1, 'x-archer', 'left', {}, []); e.debugSpawnCard(P, so, 2, 'x-helm', 'left', {}, []); const ev = []; e.resolveCombat(P, so, {}, ev);
    if(ev.some(x=> x.type==='deflect')) deflected++; if(all(P[2])[0].hp < 20) hit++; }
  ok(deflected > 8 && deflected < 32, `Helmet deflects about half the arrows (${deflected}/40)`); ok(hit > 0, 'some arrows still land'); }
console.log(`dynamite-helmet: ${fail} failure(s)`); process.exit(fail ? 1 : 0);
