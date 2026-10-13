#!/usr/bin/env node
// Wildpath perks (2026-10-13): Sap Mending, Heart of the Wood, Everbloom and Unmoving, carried as plain data on the player.
'use strict';
const H = require('./lib/harness.js');
const E = H.Engine;
let fail = 0; const ok = (c, m)=>{ if(!c){ fail++; console.log('  ✗', m); } };
const so = id=> id===1 ? 'A' : 'B';
const U = (id, o)=> Object.assign({id, name:id, attack:5, health:20, wait:0, cost:0, effects:{}}, o||{});
const defs = Object.assign({}, H.loadCardDefs(), {'k-hit': U('k-hit'), 'k-fill': U('k-fill', {attack:1}), 'k-small': U('k-small', {attack:2}), 'k-slow': U('k-slow', {attack:4, wait:2}), 'k-guard': U('k-guard', {attack:4, effects:{guardian:true}}), 'k-quick': U('k-quick', {attack:4, wait:2, effects:{quick:true}})});
const all = pl=> [...pl.row.left, ...pl.row.center, ...pl.row.right];
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
{ const {e, P} = mk(); P[1].perks = {briars:1, barkSkin:true, oldGrowth:true, hedgeWall:2, lightFeet:true};
  e.debugSpawnCard(P, so, 1, 'k-small', 'left', {}, []); const a = all(P[1])[0];
  ok(a.atk === 3, `Sharpened Briars: 2 → 3 Attack (${a.atk})`); ok((defs[a.defId].effects||{}).armor === 1, 'Bark Skin: the first unit has Armor 1');
  e.debugSpawnCard(P, so, 1, 'k-slow', 'right', {}, []); const b = all(P[1]).find(c=> c.defId==='k-slow');
  ok(b.atk === 5 && b.maxHp === 22, `Old Growth: Wait 2 unit +1/+2 (${b.atk}/${b.maxHp})`); ok(!(defs[b.defId].effects||{}).armor, 'Bark Skin only once');
  e.debugSpawnCard(P, so, 1, 'k-guard', 'left', {}, []); ok(all(P[1]).find(c=> c.defId==='k-guard').maxHp === 24, 'Hedge Wall 2: Guardian +4 Health');
  e.debugSpawnCard(P, so, 1, 'k-quick', 'left', {}, []); ok(all(P[1]).find(c=> c.defId==='k-quick').wait === 0, 'Light Feet: first Quick unit has no Wait');
  e.debugSpawnCard(P, so, 2, 'k-small', 'left', {}, []); ok(all(P[2])[0].atk === 2, 'the enemy side gets no perks'); }
{ const {e, P} = mk(); P[1].perks = {crown:true}; e.debugSpawnCard(P, so, 1, 'k-hit', 'left', {}, []); e.debugSpawnCard(P, so, 2, 'k-small', 'left', {}, []);
  const k = all(P[1])[0], a0 = k.atk; all(P[2])[0].hp = 3; e.roundStart(P, 2, so, {}, []); e.resolveCombat(P, so, {}, []);
  ok(all(P[2]).length === 0 && k.atk === a0 + 1, `Crown of Thorns: a kill gives +1 Attack (${a0} → ${k.atk})`); }
{ const {e, P} = mk(); P[1].perks = {echo:true}; const sp = defs['fungal-colossus'].effects.onDeathSpawn;
  e.debugSpawnCard(P, so, 1, 'fungal-colossus', 'left', {}, []); const fc = all(P[1])[0]; e.debugDamage(P, so, fc.uid, 999, {}, []);
  const n = all(P[1]).length, want = (sp.count||1) + 1; ok(n === want, `Echoing Wood: the first tokens come with a copy (${n} vs ${want})`); ok(P[1].perks.echo === false, 'Echoing Wood is used up'); }
console.log(`wildpath-perks: ${fail} failure(s)`); process.exit(fail ? 1 : 0);
