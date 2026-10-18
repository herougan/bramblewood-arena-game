#!/usr/bin/env node
// Ecclesia (2026-10-10, D23): Prayer value, the Prayer threshold, the once-a-turn offering, and the six keywords.
// 2026-10-19 (package E): Prayer is now the Prayer tokens on the field (tests/prayer-2026-10-19.js has the full rework).
'use strict';
const H = require('./lib/harness.js');
const E = H.Engine;
let fail = 0; const ok = (c, m)=>{ if(!c){ fail++; console.log('  ✗', m); } };
const so = id=> id===1 ? 'A' : 'B';
const T = (id, o)=> Object.assign({id, name:id, attack:2, health:10, wait:0, cost:0, effects:{}}, o);
const defs = Object.assign({}, H.loadCardDefs(), {
  'ec-pray': T('ec-pray', {effects:{prayer:2}}),
  'ec-need3': T('ec-need3', {prayerReq:3, mechanicLine:'grace'}),
  'ec-filler': T('ec-filler'),
  'ec-worship': T('ec-worship', {attack:1, effects:{worship:true}}),
  'ec-heal': T('ec-heal', {attack:0, effects:{healing:3}}),
  'ec-sat': T('ec-sat', {attack:0, effects:{satiety:2}}),
  'ec-bolt': T('ec-bolt', {attack:0, effects:{lightning:2}}),
  'ec-midas': T('ec-midas', {attack:20, effects:{midas:2}}),
  'ec-ret': T('ec-ret', {attack:0, health:30, effects:{retribution:4}}),
  'ec-weak': T('ec-weak', {attack:0, health:1}),
  'ec-wall': T('ec-wall', {attack:0, health:50}),
});
const all = pl=> [...pl.row.left, ...pl.row.center, ...pl.row.right];
const fresh = ()=>{ const e = E.makeSimEngine(defs, E.mulberry32(5), {recordEvents:true}); return {e, P:{1: e.newPlayer(1, {}), 2: e.newPlayer(2, {})}}; };
const give = (pl, id)=>{ const h = {uid: 9000 + pl.hand.length + Math.floor(Math.random()*1e6), defId:id}; pl.hand.push(h); return h; };
{ // Prayer = the Prayer tokens on the field (2026-10-19, package E: the Removal Zone no longer counts); threshold; offering
  const {e, P} = fresh(); const me = P[1];
  ok(e.prayerOf(me) === 0, 'no prayer at the start');
  e.debugSpawnCard(P, so, 1, 'ec-pray', 'left', {}, []);
  me.exile.push({defId:'ec-filler'});
  ok(e.prayerOf(me) === 0, `a Prayer 2 unit enters with no tokens, and the Removal Zone doesn't count (got ${e.prayerOf(me)})`);
  e.debugSpawnCard(P, so, 2, 'ec-wall', 'left', {}, []);
  e.resolveCombat(P, so, {}, [], 1);
  ok(e.prayerOf(me) === 2, `after its first upkeep it has 2 tokens (got ${e.prayerOf(me)})`);
  me.exile.length = 0;
  const need = give(me, 'ec-need3'), food = give(me, 'ec-filler');
  ok(!e.canPlay(me, 'ec-need3', need.uid), 'Prayer 2 is not enough for a Prayer 3 card');
  ok(e.canPlay(me, 'ec-need3', need.uid, 0, 1), 'with the offering (+1) it is');
  ok(e.placeCard(P, so, 1, need.uid, 'right', {}, [], {prayerOffer: food.uid}), 'played with an offering');
  ok(me.exile.length === 1 && !me.hand.some(h=> h.uid===food.uid), 'the offered card is in the Removal Zone');
  ok(me.prayerTokens === 1 && e.prayerOf(me) === 3, `the offering's +1 is a Prayer token on the player (Prayer ${e.prayerOf(me)})`);
  ok(!e.prayerOfferReady(me) && me.discardUsedThisTurn, 'the offering is used for this turn, and it was the turn\'s pitch');
}
{ // Worship: +1 Attack per 3 Prayer, read at the round's start (two Prayer 2 units: 0 tokens in round 1, 4 by round 2)
  const {e, P} = fresh(); const me = P[1];
  e.debugSpawnCard(P, so, 1, 'ec-worship', 'left', {}, []); e.debugSpawnCard(P, so, 1, 'ec-pray', 'right', {}, []); e.debugSpawnCard(P, so, 1, 'ec-pray', 'right', {}, []);
  e.debugSpawnCard(P, so, 2, 'ec-wall', 'left', {}, []);
  const w = all(me).find(c=> c.defId==='ec-worship');
  e.resolveCombat(P, so, {}, [], 1);
  ok(w.worshipBonus === 0, `round 1: no tokens yet, Worship +0 (got ${w.worshipBonus})`);
  e.resolveCombat(P, so, {}, [], 1);
  ok(w.worshipBonus === 1, `round 2: Prayer 4 gives Worship +1 (got ${w.worshipBonus})`);
}
{ // Healing + Satiety
  const {e, P} = fresh(); const me = P[1];
  e.debugSpawnCard(P, so, 1, 'ec-heal', 'left', {}, []); e.debugSpawnCard(P, so, 1, 'ec-filler', 'right', {}, []); e.debugSpawnCard(P, so, 1, 'ec-sat', 'right', {}, []);
  const f = all(me).find(c=> c.defId==='ec-filler'), sat = all(me).find(c=> c.defId==='ec-sat'); f.hp = 4;
  e.resolveCombat(P, so, {}, [], 1);
  ok(f.hp >= 7, `Healing 3 heals the most wounded ally (4 → ${f.hp})`);
  ok(sat.maxHp === 12, `Satiety 2 at full health: max HP 10 → ${sat.maxHp}`);
}
{ // Lightning
  const {e, P} = fresh();
  e.debugSpawnCard(P, so, 2, 'ec-wall', 'left', {}, []); const wall = all(P[2])[0];
  e.debugSpawnCard(P, so, 1, 'ec-bolt', 'left', {}, []);
  ok(wall.hp <= 48, `Lightning 2 on arrival (wall ${wall.hp})`);
}
{ // Midas + Retribution
  const {e, P} = fresh(); const me = P[1], foe = P[2];
  e.debugSpawnCard(P, so, 1, 'ec-midas', 'left', {}, []); e.debugSpawnCard(P, so, 2, 'ec-weak', 'left', {}, []); e.debugSpawnCard(P, so, 2, 'ec-ret', 'right', {}, []); e.debugSpawnCard(P, so, 2, 'ec-wall', 'left', {}, []); // three across, so the midas card faces the centre one
  const l0 = me.lumber||0, m = all(me)[0], hp0 = m.hp;
  e.debugAttack(P, so, m.uid, {}, []);
  const weakDead = !all(foe).some(c=> c.defId==='ec-weak');
  if(weakDead){ ok((me.lumber||0) === l0 + 2, `Midas Touch 2 pays on a kill (+${(me.lumber||0)-l0})`); ok(m.hp === hp0 - 4, `Divine Retribution 4 strikes back when an ally falls (${hp0} → ${m.hp})`); }
  else ok(false, 'the midas card should kill the 1 HP unit facing it');
}
console.log(`ecclesia: ${fail} failure(s)`); process.exit(fail ? 1 : 0);
