#!/usr/bin/env node
// 2026-11-22 (package BLEED1, owner 09:56 #2: "Bleed: It gets to do the action still, and gets hit with bleed damage after ... This means, even
// if the bleed would kill, the creature can perform its action first."): a Bleeding unit bleeds before it acts, and a unit that bleeds out does
// nothing: no swing, no On Action / On Attack, no skill, no Archer shot. A Bleed that does not kill still lets it act, after the tick.
'use strict';
const H = require('./lib/harness.js');
const E = H.Engine;
let fail = 0, n = 0; const ok = (c, m)=>{ n++; if(!c){ fail++; console.log('  ✗', m); } };
const so = id=> id === 1 ? 'A' : 'B';
const U = (id, effects, o)=> Object.assign({id, name: id, attack: 0, health: 500, wait: 0, cost: 0, effects: effects || {}}, o || {});
const defs = Object.assign({}, H.loadCardDefs(), {
  'b1-wall': U('b1-wall', {}, {wait: 9}),
  'b1-swing': U('b1-swing', {triggers: [{on: 'onAction', do: 'gainLumber', amount: 2}]}, {attack: 3, health: 2}),
  'b1-archer': U('b1-archer', {archer: 2}, {attack: 0, health: 2}),
  'b1-zap': U('b1-zap', {triggers: [{on: 'perTurn', do: 'damage', amount: 4, who: 'enemy'}, {on: 'perTurn', do: 'gainLumber', amount: 2}]}, {attack: 0, health: 2}),
});
const all = pl=> [...pl.row.left, ...pl.row.center, ...pl.row.right];
function fight(id, bleed){
  const e = E.makeSimEngine(defs, E.mulberry32(11), {recordEvents: true, battleMode: 'open'}), P = {1: e.newPlayer(1, {}), 2: e.newPlayer(2, {})};
  e.debugSpawnCard(P, so, 1, id, 'left', {}, []); e.debugSpawnCard(P, so, 2, 'b1-wall', 'left', {}, []);
  const u = all(P[1]).find(c=> c.defId === id), w = all(P[2]).find(c=> c.defId === 'b1-wall'); u.bleed = bleed; u.wait = 0;
  const l0 = P[1].lumber || 0, wh0 = w.hp, ev = []; e.resolveCombat(P, so, {}, ev, 1);
  const tick = ev.findIndex(x=> x.type === 'bleedTick' && x.uid === u.uid);
  const acts = ev.map((x, i)=> ({x, i})).filter(({x})=> x.uid !== undefined && (x.attUid === u.uid || x.uid === u.uid) && x.type !== 'bleedTick' && /hit|arrow|missile|damage|shot/i.test(x.type));
  return {u, w, hurt: wh0 - w.hp, lumber: (P[1].lumber || 0) - l0, tick, firstAct: acts.length ? acts[0].i : -1};
}
for(const [id, what] of [['b1-swing', 'a swing (and its On Action)'], ['b1-archer', 'an Archer shot'], ['b1-zap', 'a Deal damage skill (and the next skill)']]){
  const d = fight(id, 5);
  ok(d.u.hp <= 0 && d.tick >= 0, `${what}: Bleed 5 on 2 Health bleeds it out (hp ${d.u.hp})`);
  ok(d.hurt === 0, `${what}: it bled out first, so the enemy takes nothing (took ${d.hurt})`);
  ok(d.lumber === 0, `${what}: no later skill of the unit goes off (Lumber +${d.lumber})`);
  const s = fight(id, 1);
  ok(s.u.hp > 0 && s.tick >= 0, `${what}: Bleed 1 does not kill (hp ${s.u.hp})`);
  ok(s.hurt > 0 && (s.firstAct < 0 || s.tick < s.firstAct), `${what}: it still acts, after the tick (enemy took ${s.hurt}; tick event ${s.tick}, first action event ${s.firstAct})`);
}
console.log(`\n${n - fail}/${n} passed`); process.exit(fail ? 1 : 0);
