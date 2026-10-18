#!/usr/bin/env node
// 2026-10-19 (package L, the owner's rules answers, 20:31):
//   1. "Loop cap: okay — layers, not count." A trigger chain nests at most TRIGGER_LAYER_CAP (5) layers deep: the original event's
//      triggers are layer 1, a trigger set off while another resolves is one layer deeper, a 6th-layer trigger does not fire.
//      Siblings at one layer are not limited. Each pass of a death sweep is one layer deeper (the 6th pass fires nothing).
//   2. "Tokens fire On Death and On Ally Die: okay" (pinned here).
//   3. "Evasive: both" — Evasive dodges half of single-target attacks AND skills (pinned here, with its glossary line).
//   + the stated rules in docs/decisions.md: no On Ally Die between units dying in one sweep, a unit's own death is not an ally
//     death, a spawned unit fires On Ally Spawn (not On Ally Played), 0 healing fires no heal trigger.
'use strict';
const fs = require('fs'), path = require('path');
const H = require('./lib/harness.js');
const E = H.Engine;
let fail = 0, n = 0; const ok = (c, m)=>{ n++; if(!c){ fail++; console.log('  ✗', m); } };
const so = id=> id===1 ? 'A' : 'B';
const U = (id, effects, o)=> Object.assign({id, name:id, attack:0, health:50, wait:0, cost:0, effects: effects || {}}, o || {});
const base = H.loadCardDefs();
const defs = Object.assign({}, base);
const add = (id, effects, o)=> { defs[id] = U(id, effects, o); };

// ---- a 7-deep direct chain: T0 is played; watcher Wk sees Tk-1 arrive and spawns Tk (k = 1..7)
for(let k = 0; k <= 7; k++) add('tl-t' + k, {}, {token:true, archetypes:['TL' + k], health:5});
add('tl-w1', {triggers:[{on:'onAllyPlayed', filterArchetype:'TL0', do:'spawnCard', defId:'tl-t1', count:1}]});
for(let k = 2; k <= 7; k++) add('tl-w' + k, {triggers:[{on:'onAllySpawn', filterArchetype:'TL' + (k - 1), do:'spawnCard', defId:'tl-t' + k, count:1}]});
// wide siblings at layer 5 (the arrival of T4): eight more watchers each gain 1 Lumber, plus one card with six triggers on that hook
for(let k = 0; k < 8; k++) add('tl-sib' + k, {triggers:[{on:'onAllySpawn', filterArchetype:'TL4', do:'gainLumber', amount:1}]});
add('tl-six', {triggers:Array.from({length:6}, ()=> ({on:'onAllySpawn', filterArchetype:'TL4', do:'gainGrace', amount:1}))});
// ---- a 7-deep death chain: Dk's On Death deals 1 to its live Kin, which is only Dk+1 (Dk shares type DLk with Dk-1 and DLk+1
//      with Dk+1), so each death kills the next link and that death settles in the sweep's next pass
for(let k = 1; k <= 7; k++) add('tl-d' + k, {triggers:[{on:'onDeath', do:'damage', who:'kin', sub:'all', amount:1}]}, {health:1, archetypes:['DL' + k, 'DL' + (k + 1)]});
// ---- an endless ping-pong (each On Attacked hits the unit facing it back); it used to run until a unit died
add('tl-ping', {triggers:[{on:'onAttacked', do:'damage', who:'enemy', sub:'adjacent', amount:1}]}, {health:500});
// ---- tokens and death triggers
add('tl-tok', {triggers:[{on:'onDeath', do:'gainLumber', amount:3}]}, {token:true, health:2});
add('tl-tokmourn', {triggers:[{on:'onAllyDie', do:'gainGrace', amount:2}]}, {token:true});
add('tl-mourn', {triggers:[{on:'onAllyDie', do:'gainGrace', amount:1}]}, {health:2});
add('tl-tokmaker', {onDeathSpawn:{defId:'tl-tok', count:1}}, {health:2});
// ---- On Ally Spawn vs On Ally Played; 0 healing
add('tl-ears', {triggers:[{on:'onAllySpawn', do:'gainLumber', amount:1}, {on:'onAllyPlayed', do:'gainGrace', amount:1}]});
add('tl-spawner', {triggers:[{on:'onSpawn', do:'spawnCard', defId:'tl-tok', count:1}]});
add('tl-healee', {triggers:[{on:'onHealed', do:'gainLumber', amount:1}]}, {health:10});
// ---- Evasive
add('tl-eva', {evasive:true}, {health:100000});
add('tl-plain', {}, {health:100000});
add('tl-hitter', {}, {attack:1});
add('tl-zapper', {triggers:[{on:'onRoundStart', do:'damage', who:'enemy', sub:'adjacent', amount:1}]});

const all = pl=> [...pl.row.left, ...pl.row.center, ...pl.row.right];
const count = (pl, id)=> all(pl).filter(c=> c.defId === id).length;
function mk(o){ o = o || {}; const e = E.makeSimEngine(defs, E.mulberry32(o.seed || 11), {recordEvents:true, battleMode:o.mode || 'gravity'});
  return {e, P:{1:e.newPlayer(1, {}), 2:e.newPlayer(2, {})}}; }
const spawn = (e, P, pid, id, ev, side)=> { e.debugSpawnCard(P, so, pid, id, side || 'left', {}, ev); return all(P[pid]).find(c=> c.defId === id); };

ok(E.TRIGGER_LAYER_CAP === 5, 'TRIGGER_LAYER_CAP is 5 (' + E.TRIGGER_LAYER_CAP + ')');

// ---- 1a. the 7-deep direct chain stops after 5 layers; siblings at layer 5 all resolve
{ const {e, P} = mk(); const ev = [];
  for(let k = 1; k <= 7; k++) spawn(e, P, 1, 'tl-w' + k, ev);
  for(let k = 0; k < 8; k++) spawn(e, P, 1, 'tl-sib' + k, ev);
  spawn(e, P, 1, 'tl-six', ev);
  const l0 = P[1].lumber, g0 = P[1].grace; ev.length = 0;
  spawn(e, P, 1, 'tl-t0', ev, 'right');
  const made = k=> count(P[1], 'tl-t' + k);
  ok([1, 2, 3, 4, 5].every(k=> made(k) === 1), 'direct chain: layers 1-5 resolve (T1..T5 spawned: ' + [1,2,3,4,5,6,7].map(made).join(',') + ')');
  ok(made(6) === 0 && made(7) === 0, 'direct chain: the 6th layer does not fire (no T6, no T7)');
  ok(ev.some(x=> x.type === 'triggerCapped' && x.layer === 6 && x.defId === 'tl-w6'), 'direct chain: the capped trigger is logged (triggerCapped, layer 6, W6)');
  ok(P[1].lumber - l0 === 8, 'siblings: all eight layer-5 watchers resolve (+' + (P[1].lumber - l0) + ' Lumber)');
  ok(P[1].grace - g0 === 6, 'siblings: a card\'s six triggers on one hook all resolve at layer 5 (+' + (P[1].grace - g0) + ' Grace)'); }

// ---- 1b. the same chain started from inside a trigger begins one layer deeper (T4 is the last to arrive)
{ const {e, P} = mk(); const ev = [];
  for(let k = 1; k <= 7; k++) spawn(e, P, 1, 'tl-w' + k, ev);
  defs['tl-start'] = U('tl-start', {triggers:[{on:'onRoundStart', do:'spawnCard', defId:'tl-t0', count:1}]});
  // a trigger spawn is "spawned", not "played", so W1 (On Ally Played) would not see it: point W1 at On Ally Spawn for this run
  defs['tl-w1'].effects.triggers[0].on = 'onAllySpawn';
  const s = spawn(e, P, 1, 'tl-start', ev);
  e.debugFireTrigger(P, so, s.uid, 'onRoundStart', {}, ev);
  defs['tl-w1'].effects.triggers[0].on = 'onAllyPlayed';
  const got = [1,2,3,4,5,6].map(k=> count(P[1], 'tl-t' + k)).join(',');
  ok(got === '1,1,1,1,0,0', 'nested start: T0 arrives at layer 1, so T1..T4 follow and T5 is capped (' + got + ')'); }

// ---- 1c. the death sweep: each pass is one layer deeper, the 6th pass clears the body and fires nothing
{ const {e, P} = mk(); const ev = [];
  const d = [0, 1, 2, 3, 4, 5, 6, 7].map(k=> k ? spawn(e, P, 1, 'tl-d' + k, ev) : null);
  e.debugDamage(P, so, d[1].uid, 1, {}, ev);
  const deaths = ev.filter(x=> x.type === 'death').map(x=> x.defId);
  ok(['tl-d1','tl-d2','tl-d3','tl-d4','tl-d5','tl-d6'].every(id=> deaths.includes(id)), 'death chain: D1..D6 all die (' + deaths.join(' ') + ')');
  ok(count(P[1], 'tl-d7') === 1 && d[7].hp === 1 && !deaths.includes('tl-d7'), 'death chain: D6 dies on the 6th pass (layer 6), its On Death does not fire, D7 is untouched');
  ok(!all(P[1]).some(c=> c.hp <= 0), 'death chain: nothing is left on the board at 0 Health');
  ok(ev.some(x=> x.type === 'triggerCapped' && x.defId === 'tl-d6' && x.hook === 'onDeath'), 'death chain: D6\'s On Death is logged as capped'); }

// ---- 1d. an endless ping-pong is cut at 5 layers instead of running until a unit dies
{ const {e, P} = mk({mode:'open'}); const ev = [];
  const a = spawn(e, P, 1, 'tl-ping', ev); const b = spawn(e, P, 2, 'tl-ping', ev);
  e.debugDamage(P, so, a.uid, 1, {}, ev);
  const fired = ev.filter(x=> x.type === 'triggerFired' && x.hook === 'onAttacked').length;
  ok(fired === 5, 'ping-pong: five On Attacked layers resolve (' + fired + ')');
  ok(a.hp > 400 && b.hp > 400, 'ping-pong: both units live (' + a.hp + ', ' + b.hp + ')'); }

// ---- 2. tokens fire On Death and On Ally Die (and a token's death is an ally death for the others)
{ const {e, P} = mk(); const ev = [];
  const t = spawn(e, P, 1, 'tl-tok', ev); spawn(e, P, 1, 'tl-tokmourn', ev); spawn(e, P, 1, 'tl-mourn', ev);
  const l0 = P[1].lumber, g0 = P[1].grace;
  e.debugDamage(P, so, t.uid, 5, {}, ev);
  ok(P[1].lumber - l0 === 3, 'token: its own On Death fires (+' + (P[1].lumber - l0) + ' Lumber)');
  ok(P[1].grace - g0 === 3, 'token: allies (a token and a card) fire On Ally Die for it (+' + (P[1].grace - g0) + ' Grace)'); }
{ const {e, P} = mk(); const ev = [];
  const m = spawn(e, P, 1, 'tl-tokmaker', ev); const tm = spawn(e, P, 1, 'tl-tokmourn', ev);
  e.debugDamage(P, so, m.uid, 5, {}, ev);
  const tok = all(P[1]).find(c=> c.defId === 'tl-tok'); ok(!!tok, 'token: an On Death token arrives');
  const l0 = P[1].lumber, g0 = P[1].grace;
  if(tok) e.debugDamage(P, so, tok.uid, 5, {}, ev);
  ok(P[1].lumber - l0 === 3 && P[1].grace - g0 === 2, 'token: a spawned token\'s On Death and its ally\'s On Ally Die fire (+' + (P[1].lumber - l0) + ' L, +' + (P[1].grace - g0) + ' G)'); }

// ---- stated rules: no On Ally Die between units dying in one sweep; a unit's own death is not an ally death
{ const {e, P} = mk(); const ev = [];
  const a = spawn(e, P, 1, 'tl-mourn', ev); const b = spawn(e, P, 1, 'tl-mourn', ev);
  const g0 = P[1].grace; a.hp = 0; b.hp = 0; e.removeDeadCards(P, so, {}, {}, ev);
  ok(P[1].grace === g0, 'same sweep: two units dying together fire no On Ally Die for each other (+' + (P[1].grace - g0) + ')'); }
{ const {e, P} = mk(); const ev = [];
  const a = spawn(e, P, 1, 'tl-mourn', ev); const g0 = P[1].grace;
  e.debugDamage(P, so, a.uid, 5, {}, ev);
  ok(P[1].grace === g0, 'own death: a unit\'s own death is not an ally death (+' + (P[1].grace - g0) + ')'); }
// a spawned unit fires On Ally Spawn, not On Ally Played; a played one the reverse
{ const {e, P} = mk(); const ev = [];
  spawn(e, P, 1, 'tl-ears', ev); const l0 = P[1].lumber, g0 = P[1].grace;
  spawn(e, P, 1, 'tl-spawner', ev); // played (Grace +1), its On Spawn spawns a token (Lumber +1)
  ok(P[1].grace - g0 === 1 && P[1].lumber - l0 === 1, 'spawned vs played: one On Ally Played for the play, one On Ally Spawn for the token (+' + (P[1].grace - g0) + ' G, +' + (P[1].lumber - l0) + ' L)'); }
// 0 healing fires no heal trigger
{ const {e, P} = mk(); const ev = [];
  const h = spawn(e, P, 1, 'tl-healee', ev); const l0 = P[1].lumber;
  const got = e.debugHeal(P, so, h.uid, 5, {}, ev);
  ok(got === 0 && P[1].lumber === l0, 'heal 0: healing a unit at full Health fires no On Healed (' + got + ', +' + (P[1].lumber - l0) + ')');
  h.hp = 7; e.debugHeal(P, so, h.uid, 2, {}, ev);
  ok(P[1].lumber - l0 === 1, 'heal: a real heal does fire On Healed (+' + (P[1].lumber - l0) + ')'); }

// ---- 3. Evasive dodges half of single-target attacks AND skills
const TRIES = 400;
function dodges(targetId, how){
  const {e, P} = mk({mode:'open', seed:how === 'attack' ? 23 : 29}); const ev = [];
  const src = spawn(e, P, 1, how === 'attack' ? 'tl-hitter' : 'tl-zapper', ev); spawn(e, P, 2, targetId, ev);
  for(let i = 0; i < TRIES; i++){ if(how === 'attack') e.debugAttack(P, so, src.uid, {}, ev); else e.debugFireTrigger(P, so, src.uid, 'onRoundStart', {}, ev); }
  return ev.filter(x=> x.type === 'evaded' && x.reason === 'evasive').length;
}
{ const da = dodges('tl-eva', 'attack'), ds = dodges('tl-eva', 'skill'), pa = dodges('tl-plain', 'attack'), ps = dodges('tl-plain', 'skill');
  ok(da > TRIES * 0.4 && da < TRIES * 0.6, 'Evasive: dodges about half of attacks (' + da + '/' + TRIES + ')');
  ok(ds > TRIES * 0.4 && ds < TRIES * 0.6, 'Evasive: dodges about half of skills (' + ds + '/' + TRIES + ')');
  ok(pa === 0 && ps === 0, 'a plain unit dodges neither (' + pa + ', ' + ps + ')'); }
// its glossary / Codex line says attacks and skills, tersely
{ const app = fs.readFileSync(path.join(H.ROOT, 'arena_app.js'), 'utf8');
  const m = app.match(/\n  evasive: \(\)=> `([^`]*)`/); const line = m ? m[1] : '';
  ok(/attacks and skills/.test(line), 'Evasive glossary text says attacks and skills ("' + line + '")');
  ok(line && line.split(/\s+/).length < 20, 'Evasive glossary text is under 20 words (' + line.split(/\s+/).length + ')'); }

console.log(`trigger-layers-2026-10-19: ${n - fail}/${n} passed`);
process.exit(fail ? 1 : 0);
