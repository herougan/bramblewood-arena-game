#!/usr/bin/env node
// Wildpath perks (2026-10-13): Sap Mending, Heart of the Wood, Everbloom and Unmoving, carried as plain data on the player.
'use strict';
const H = require('./lib/harness.js');
const E = H.Engine;
let fail = 0; const ok = (c, m)=>{ if(!c){ fail++; console.log('  ✗', m); } };
const so = id=> id===1 ? 'A' : 'B';
const U = (id, o)=> Object.assign({id, name:id, attack:5, health:20, wait:0, cost:0, effects:{}}, o||{});
const defs = Object.assign({}, H.loadCardDefs(), {'k-hit': U('k-hit'), 'k-fill': U('k-fill', {attack:1})});
const mk = ()=>{ const e = E.makeSimEngine(defs, E.mulberry32(3), {recordEvents:true, battleMode:'open'}); return {e, P:{1: e.newPlayer(1, {'k-fill':10}), 2: e.newPlayer(2, {})}}; };
{ const {e, P} = mk(); P[1].hq.hp -= 5; P[1].perks = {sapMending:true};
  const h0 = P[1].hq.hp; e.roundStart(P, 2, so, {}, []); ok(P[1].hq.hp === h0, 'Sap Mending: nothing on round 2');
  e.roundStart(P, 4, so, {}, []); ok(P[1].hq.hp === h0 + 1, `Sap Mending: +1 on round 4 (${P[1].hq.hp - h0})`); }
{ const {e, P} = mk(); P[1].perks = {everbloom:true}; const n0 = P[1].hand.length, l0 = P[1].lumber||0;
  e.roundStart(P, 6, so, {}, []); ok(P[1].hand.length === n0 + 1 && (P[1].lumber||0) === l0 + 1, 'Everbloom: round 6 draws 1 and gives 1 Lumber'); }
{ const {e, P} = mk(); P[1].hq.hp -= 5; P[1].perks = {heartwood:true}; const h0 = P[1].hq.hp;
  e.roundStart(P, 2, so, {}, []); ok(P[1].hq.hp === h0 + 1, 'Heart of the Wood: +1 when not hit'); }
{ const {e, P} = mk(); P[1].perks = {ward:true}; e.debugSpawnCard(P, so, 2, 'k-hit', 'left', {}, []);
  const h0 = P[1].hq.hp; e.roundStart(P, 2, so, {}, []); e.resolveCombat(P, so, {}, []); const h1 = P[1].hq.hp;
  ok(h1 === h0 && P[1].perks.ward === false, `Unmoving: the first castle hit does nothing (${h0} → ${h1})`);
  e.roundStart(P, 3, so, {}, []); e.resolveCombat(P, so, {}, []); ok(P[1].hq.hp < h1, 'Unmoving: later hits land'); }
console.log(`wildpath-perks: ${fail} failure(s)`); process.exit(fail ? 1 : 0);
