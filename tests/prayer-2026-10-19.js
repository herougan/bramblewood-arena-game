#!/usr/bin/env node
// 2026-10-19 (package E, the Prayer rework). Owner: "Prayer - prayer cards give prayer per turn and it gets added as tokens onto it -
// depending on Prayer N value. Your Prayer value = number of tokens on the field. If a Prayer card dies, all its tokens are gone. An
// effect like 'remnant' or something better named - when an ecclesia card with this ecclesia specific skill dies, it leaves a 1/1
// with basic effects of the card that died."
// Covers: tokens gained per turn by Prayer N (none on arrival; N at every upkeep after); Prayer = the tokens on the field (not the
// Removal Zone, not the other side's); tokens gone with the unit (death, Sacrifice); thresholds turn by turn; the offering's token
// on the card it summons; Worship and Lightning reading the tokens; Relic (a 1/1 in the same slot, plain keywords only, no Prayer,
// no Relic, no counters or buffs, no loop; not on Revive or Sacrifice); the card data (relic cards are Ecclesia and inside budget v3);
// the CPU (its offering gives the token the player's does, it builds Prayer for an Ecclesia card it can't reach, it keeps a Prayer
// unit out of a deadly slot, it won't sacrifice a unit holding tokens), and the UI / texts / 12 language packs.
'use strict';
const fs = require('fs'), path = require('path');
const H = require('./lib/harness.js');
const E = H.Engine;
let fail = 0, n = 0; const ok = (c, m)=>{ n++; if(!c){ fail++; console.log('  ✗', m); } };
const so = id=> id===1 ? 'A' : 'B';
const T = (id, o)=> Object.assign({id, name:id, attack:0, health:50, wait:0, cost:0, effects:{}}, o);
const base = H.loadCardDefs();
const defs = Object.assign({}, base, {
  'pr-1': T('pr-1', {mechanicLine:'grace', effects:{prayer:1}}), 'pr-2': T('pr-2', {mechanicLine:'grace', effects:{prayer:2}}),
  'pr-t': T('pr-t', {mechanicLine:'grace', effects:{prayer:true}}),
  'pr-need3': T('pr-need3', {prayerReq:3, mechanicLine:'grace', attack:1, health:5}), 'pr-need1': T('pr-need1', {prayerReq:1, mechanicLine:'grace', attack:1, health:5}),
  'pr-fill': T('pr-fill', {attack:1, health:3}), 'pr-big': T('pr-big', {attack:6, health:12}),
  'pr-small': T('pr-small', {attack:1, health:4, mechanicLine:'grace', effects:{prayer:1}}), 'pr-mid': T('pr-mid', {attack:3, health:8}),
  'pr-wall': T('pr-wall', {health:500}), 'pr-killer': T('pr-killer', {attack:40, health:500}),
  'pr-worship': T('pr-worship', {attack:1, mechanicLine:'grace', effects:{worship:true}}),
  'pr-bolt': T('pr-bolt', {mechanicLine:'grace', effects:{lightning:2}}),
  'pr-relic': T('pr-relic', {name:'Saint Test', attack:5, health:9, wait:1, mechanicLine:'grace', archetypes:['Ecclesia'],
    effects:{relic:true, prayer:2, flying:true, guardian:true, pierce:2, nocturnal:2, worship:true, healing:3, armor:2, retribution:2, triggers:[{on:'onDeath', do:'gainLumber', amount:3}]}}),
  'pr-relic-rev': T('pr-relic-rev', {mechanicLine:'grace', health:5, effects:{relic:true, revive:true}}),
  'pr-relic-sac': T('pr-relic-sac', {mechanicLine:'grace', health:5, effects:{relic:true, sacrifice:2}}),
  'pr-dark': T('pr-dark', {attack:4, health:4, devilryCost:2, darkSummon:true}),
  'pr-relic-b': T('pr-relic-b', {mechanicLine:'grace', health:5, effects:{relic:true, bounty:2, flying:true}}),
  'pr-watch': T('pr-watch', {health:500, effects:{triggers:[{on:'onAllySpawn', do:'gainLumber', amount:5}, {on:'onAllyDie', do:'gainLumber', amount:1}]}}),
  'pr-foewatch': T('pr-foewatch', {attack:0, health:500, effects:{ambush:3, triggers:[{on:'onEnemySpawn', do:'gainLumber', amount:7}]}}),
});
const all = pl=> [...pl.row.left, ...pl.row.center, ...pl.row.right];
const mk = o=>{ o = o || {}; const e = E.makeSimEngine(defs, E.mulberry32(o.seed || 11), {recordEvents: o.record !== false, battleMode: o.mode || 'open', aiAim: o.aiAim, aiLevel: o.level});
  return {e, P:{1: e.newPlayer(1, {}), 2: e.newPlayer(2, {})}}; };
function put(e, P, pid, id, slot){ const pl = P[pid]; const c = e.makeBoardCard(id); c.slot = slot; c._seenAt = slot;
  const cs = all(pl).concat(c); pl.row.center = cs.filter(x=> x.slot === 0); pl.row.left = cs.filter(x=> x.slot < 0).sort((a, b)=> b.slot - a.slot); pl.row.right = cs.filter(x=> x.slot > 0).sort((a, b)=> a.slot - b.slot);
  e.syncSlots(pl); return c; }
let uidN = 50000; const give = (pl, id)=>{ const h = {uid: uidN++, defId:id}; pl.hand.push(h); return h; };
const round = (e, P, ev)=> e.resolveCombat(P, so, {}, ev || [], 1);
const kill = (e, P, c, ev)=>{ c.hp = 0; e.removeDeadCards(P, so, {}, {}, ev || []); };

// ---- 1. tokens per turn, by Prayer N
{ const {e, P} = mk(); const a = put(e, P, 1, 'pr-1', 0), b = put(e, P, 1, 'pr-2', 1), t = put(e, P, 1, 'pr-t', -1); put(e, P, 2, 'pr-wall', 0);
  ok(!(a.prayerTokens > 0) && !(b.prayerTokens > 0) && e.prayerOf(P[1]) === 0, '1. a Prayer unit arrives with no tokens');
  ok(e.prayerRateOf(P[1]) === 4, `1. the side gains 1 + 2 + 1 a turn (prayerRateOf ${e.prayerRateOf(P[1])})`);
  const ev = []; round(e, P, ev);
  ok(a.prayerTokens === 1 && b.prayerTokens === 2 && t.prayerTokens === 1, `1. after its first upkeep: Prayer 1 → 1, Prayer 2 → 2, Prayer (true) → 1 (${a.prayerTokens}, ${b.prayerTokens}, ${t.prayerTokens})`);
  const pe = ev.filter(x=> x.type === 'statusFx' && x.kind === 'prayer');
  ok(pe.length === 3 && pe.some(x=> x.targetUid === b.uid && x.amount === 2 && x.total === 2), '1. one statusFx prayer event per unit, with amount and total');
  round(e, P); round(e, P);
  ok(a.prayerTokens === 3 && b.prayerTokens === 6 && e.prayerOf(P[1]) === 12, `1. three turns: 3 + 6 + 3 = 12 (${e.prayerOf(P[1])})`);
  ok(e.prayerOf(P[2]) === 0, "1. the other side's Prayer is its own");
}
// ---- 2. Prayer = tokens on the field: not the Removal Zone; gone with the unit
{ const {e, P} = mk(); const me = P[1]; const a = put(e, P, 1, 'pr-2', 0); put(e, P, 2, 'pr-wall', 0);
  me.exile.push({defId:'pr-fill'}, {defId:'pr-fill'});
  ok(e.prayerOf(me) === 0, '2. the Removal Zone no longer counts');
  round(e, P); round(e, P);
  ok(e.prayerOf(me) === 4, `2. 4 tokens after two turns (${e.prayerOf(me)})`);
  const b = put(e, P, 1, 'pr-1', 1); round(e, P);
  ok(e.prayerOf(me) === 7, `2. a second Prayer unit adds its own tokens (${e.prayerOf(me)})`);
  kill(e, P, a);
  ok(e.prayerOf(me) === 1 && b.prayerTokens === 1, `2. the dead unit's 6 tokens are gone, the other's stay (${e.prayerOf(me)})`);
  // Sacrifice takes them too
  const s2 = mk(); const f = put(s2.e, s2.P, 1, 'pr-relic-sac', 0); f.prayerTokens = 5; s2.P[1].devilry = 5;
  const h = give(s2.P[1], 'pr-dark');
  ok(s2.e.prayerOf(s2.P[1]) === 5 && s2.e.sacrificeSummon(s2.P, so, 1, h.uid, f.uid, {}, []), '2. a Sacrifice N unit holding 5 tokens is given up');
  ok(s2.e.prayerOf(s2.P[1]) === 0, `2. its tokens left with it (${s2.e.prayerOf(s2.P[1])})`);
  ok(!all(s2.P[1]).some(c=> (s2.e.getField && false) || /~relic$/.test(c.defId)), '2. and a sacrificed Relic unit leaves no Relic (the Dark Summon card takes its slot)');
}
// ---- 3. thresholds turn by turn, and the offering's token
{ const {e, P} = mk(); const me = P[1]; put(e, P, 1, 'pr-1', 0); put(e, P, 2, 'pr-wall', 0);
  const need = give(me, 'pr-need3'), food = give(me, 'pr-fill');
  const can = ()=> e.canPlay(me, 'pr-need3', need.uid), canOffer = ()=> e.canPlay(me, 'pr-need3', need.uid, 0, 1);
  ok(!can() && !canOffer(), '3. turn 1: Prayer 0, a Prayer 3 card is out of reach even with the offering');
  round(e, P); ok(!can() && !canOffer(), '3. turn 2: Prayer 1');
  round(e, P); ok(!can() && canOffer(), '3. turn 3: Prayer 2, reachable with the offering');
  { const ev = []; ok(e.placeCard(P, so, 1, need.uid, 'right', {}, ev, {prayerOffer: food.uid}), '3. played with the offering');
    ok(ev.some(x=> x.type === 'statusFx' && x.kind === 'prayer' && x.player && x.offering && x.total === 1), '3. a statusFx prayer event for the player\'s token'); }
  const nc = all(me).find(c=> c.defId === 'pr-need3');
  ok(me.prayerTokens === 1 && !(nc.prayerTokens > 0) && e.prayerOf(me) === 3, `3. the offering's +1 is a Prayer token attached to the player (Prayer ${e.prayerOf(me)})`);
  ok(me.exile.some(x=> x.defId === 'pr-fill') && !me.hand.some(h=> h.uid === food.uid), '3. the offered card went to the Removal Zone');
  ok(!e.prayerOfferReady(me) && me.discardUsedThisTurn, '3. one offering a turn, and it is the turn\'s pitch');
  kill(e, P, nc); ok(me.prayerTokens === 1 && e.prayerOf(me) === 3, `3. the player's token isn't lost when a unit dies (${e.prayerOf(me)})`);
  me.playedThisTurn = false; me.playsThisTurn = 0;
  ok(e.prayerOf(me) >= 3 && e.canPlay(me, 'pr-need3', give(me, 'pr-need3').uid), '3. the threshold is never spent: still playable at Prayer 3');
  // pitched already: no offering this turn
  { const t = mk(); const q = t.P[1]; put(t.e, t.P, 1, 'pr-1', 0).prayerTokens = 2; const nd = give(q, 'pr-need3'), f2 = give(q, 'pr-fill'), f3 = give(q, 'pr-fill');
    t.e.pitchCard(t.P, so, 1, f3, {}, []);
    ok(q.discardUsedThisTurn && !t.e.prayerOfferReady(q) && !t.e.placeCard(t.P, so, 1, nd.uid, 'left', {}, [], {prayerOffer: f2.uid}) && !(q.prayerTokens > 0), '3. after a pitch, no offering this turn (and the card can\'t be played short)'); }
  // removePrayerTokens: units first (the fewest-held first), the player's own last
  { const t = mk(); const q = t.P[1]; const u1 = put(t.e, t.P, 1, 'pr-1', 0), u2 = put(t.e, t.P, 1, 'pr-2', 1); u1.prayerTokens = 2; u2.prayerTokens = 3; q.prayerTokens = 2;
    ok(t.e.removePrayerTokens(q, 4) === 4 && u1.prayerTokens === 0 && u2.prayerTokens === 1 && q.prayerTokens === 2, '3. removing 4: the units\' tokens go first, the player\'s stay');
    ok(t.e.removePrayerTokens(q, 9) === 3 && t.e.prayerOf(q) === 0, '3. then the player\'s own, last'); }
  // a Prayer-1 card with no Prayer units at all: only through the offering
  const s = mk(); const h1 = give(s.P[1], 'pr-need1'), f1 = give(s.P[1], 'pr-fill');
  ok(!s.e.canPlay(s.P[1], 'pr-need1', h1.uid) && s.e.placeCard(s.P, so, 1, h1.uid, 'left', {}, [], {prayerOffer: f1.uid}), '3. a Prayer 1 card with no Prayer on the field: the offering lets it in');
}
// ---- 4. Worship and Lightning read the tokens
{ const {e, P} = mk(); const me = P[1]; const w = put(e, P, 1, 'pr-worship', 0), p = put(e, P, 1, 'pr-2', 1); put(e, P, 2, 'pr-wall', 0);
  round(e, P); ok(w.worshipBonus === 0, `4. Worship: no tokens during the first round (+${w.worshipBonus})`);
  round(e, P); ok(w.worshipBonus === 0, `4. 2 tokens: +0 (+${w.worshipBonus})`);
  round(e, P); ok(w.worshipBonus === 1, `4. 4 tokens: +1 (+${w.worshipBonus})`);
  round(e, P); round(e, P); ok(e.prayerOf(me) === 10 && w.worshipBonus === 2, `4. tokens keep building: 8 at the round's start → +2 (+${w.worshipBonus}, Prayer ${e.prayerOf(me)})`);
  kill(e, P, p); round(e, P); ok(w.worshipBonus === 0, `4. the Prayer unit dies: its tokens and the Worship bonus go (+${w.worshipBonus})`);
  // Lightning N: +1 for every 4 Prayer
  const s = mk(); const pp = put(s.e, s.P, 1, 'pr-2', 0); pp.prayerTokens = 8; const wall = put(s.e, s.P, 2, 'pr-wall', 0);
  s.e.debugSpawnCard(s.P, so, 1, 'pr-bolt', 'left', {}, []);
  ok(wall.hp === 500 - 4, `4. Lightning 2 with 8 Prayer tokens strikes for 4 (${500 - wall.hp})`);
}
// ---- 5. Relic
{ const {e, P} = mk(); const me = P[1]; const r = put(e, P, 1, 'pr-relic', 2); put(e, P, 1, 'pr-fill', 0); put(e, P, 2, 'pr-wall', 2);
  r.prayerTokens = 6; r.atk += 5; r.baseAtk += 5; r.poison = 3; r.creativity = 2;
  const l0 = me.lumber || 0, ev = []; kill(e, P, r, ev);
  const rel = all(me).find(c=> /~relic$/.test(c.defId)), rd = rel && defs[rel.defId];
  ok(!!rel, '5. a Relic unit leaves its Relic when it dies');
  ok(rel && rel.slot === 2, `5. in the same slot (${rel && rel.slot})`);
  ok(rel && rel.hp === 1 && rel.maxHp === 1 && rel.atk === 1 && (rel.wait || 0) === 0, `5. a 1/1, Wait 0 (${rel && rel.atk}/${rel && rel.hp})`);
  ok(rd && rd.name === 'Saint Test Relic' && rd.relicOf === 'pr-relic' && rd.token, `5. named "<Card> Relic", a token, relicOf the card (${rd && rd.name})`);
  const re = (rd && rd.effects) || {};
  ok(re.flying === true && re.guardian === true && re.pierce === 2 && re.nocturnal === true, `5. keeps the plain keywords: Flying, Guardian, Pierce 2, Nocturnal (${JSON.stringify(re)})`);
  ok(!re.prayer && !re.relic && !re.worship && !re.healing && !re.armor && !re.retribution && !re.triggers, '5. no Prayer, no Relic, no Worship / Healing / Armor / Retribution, no triggers');
  ok(rel && !(rel.prayerTokens > 0) && !(rel.poison > 0) && !(rel.creativity > 0), '5. no tokens, counters or buffs carried over');
  ok((me.lumber || 0) === l0 + 3, '5. the dead card\'s own On Death still fired (once)');
  ok(ev.some(x=> x.type === 'spawn' && x.kind === 'relic' && x.fromUid === r.uid), '5. a spawn event, kind relic');
  ok(e.prayerOf(me) === 0, '5. the dead card\'s 6 tokens are gone');
  const ev2 = []; kill(e, P, rel, ev2);
  ok(!all(me).some(c=> /~relic/.test(c.defId)) && !ev2.some(x=> x.type === 'spawn'), '5. the Relic dies for good: no Relic of a Relic (no loop)');
  round(e, P); ok(!(all(me)[0].prayerTokens > 0), '5. (and a plain unit never prays)');
  // owner 20:31: the leftover is not a spawn, and pays nothing extra
  { const t = mk(); const me = t.P[1], foe = t.P[2]; const rb = put(t.e, t.P, 1, 'pr-relic-b', 0); put(t.e, t.P, 1, 'pr-watch', 1); put(t.e, t.P, 2, 'pr-foewatch', 0);
    t.e.removeDeadCards(t.P, so, {}, {}, []); // (nothing dead: lets watchScan-free state settle)
    const l1 = me.lumber || 0, l2 = foe.lumber || 0, d1 = me.devilry || 0, ev = [];
    kill(t.e, t.P, rb, ev); const rl = all(me).find(c=> c.defId === 'pr-relic-b~relic');
    ok(!!rl && rl.slot === 0 && rl.relicLeftover, '5. the Relic stands in the dead unit\'s slot at once, in the same death sweep');
    ok((me.lumber || 0) === l1 + 1, `5. no On Ally Spawn for the Relic (the ally's On Ally Die fired once: +${(me.lumber || 0) - l1})`);
    ok((foe.lumber || 0) === l2 + 2, `5. the dead unit's own Bounty 2 is paid once, none for the Relic (+${(foe.lumber || 0) - l2})`);
    ok((me.devilry || 0) === d1 + 1, `5. one Darkness for the unit that perished, none for the Relic (+${(me.devilry || 0) - d1})`);
    ok(!ev.some(x=> x.type === 'triggerFired' && x.hook === 'onEnemySpawn'), '5. no On Enemy Spawn for the Relic');
    const h0 = rl.hp; round(t.e, t.P);
    ok(!ev.concat([]).some(x=> x.type === 'ambush') && (rl.hp === h0 || rl.hp <= 0) && (foe.lumber || 0) === l2 + 2, '5. no Ambush springs on it, no On Enemy Spawn pays the foe');
    const l3 = me.lumber || 0, l4 = foe.lumber || 0, d3 = me.devilry || 0, ev2 = [];
    if(rl.hp > 0) kill(t.e, t.P, rl, ev2);
    ok(ev2.some(x=> x.type === 'death' && x.uid === rl.uid) && (me.lumber || 0) === l3 + 1, '5. the Relic\'s own death is a token death: On Ally Die still fires');
    ok((foe.lumber || 0) === l4 && (me.devilry || 0) === d3, '5. and it gives no Bounty and no Darkness');
    ok(!all(me).some(c=> /~relic/.test(c.defId)), '5. and leaves nothing behind'); }
  // the Ambush check, on its own: an Ambush unit facing the slot the Relic takes doesn't strike
  { const t = mk(); const rb = put(t.e, t.P, 1, 'pr-relic-b', 0); const am = put(t.e, t.P, 2, 'pr-foewatch', 0); round(t.e, t.P);
    const ev = []; kill(t.e, t.P, rb, ev); round(t.e, t.P, ev); const rl = all(t.P[1]).find(c=> c.defId === 'pr-relic-b~relic');
    ok(rl && !ev.some(x=> x.type === 'ambush' && x.targetUid === rl.uid), '5. Ambush ignores the Relic (it never "enters" the slot)'); }
  // Revive answers the first death: no Relic then
  const s = mk(); const rv = put(s.e, s.P, 1, 'pr-relic-rev', 0); kill(s.e, s.P, rv);
  ok(all(s.P[1]).length === 1 && all(s.P[1])[0] === rv && rv.hp === 1, '5. Revive: it comes back, no Relic');
  kill(s.e, s.P, rv); ok(all(s.P[1]).some(c=> c.defId === 'pr-relic-rev~relic'), '5. its real death leaves the Relic');
  // a fight with Relic cards keeps the invariants
  const m = E.simulateOneMatch(defs, {'pr-relic':10, 'pr-1':10}, {'pr-killer':4, 'pr-fill':16}, {rnd: E.mulberry32(3), maxRounds: 40, recordEvents: true});
  ok(H.checkInvariants(m.players, 'end').length === 0 && m.events.some(x=> x.type === 'spawn' && x.kind === 'relic'), '5. a whole match with Relic cards: relics appear, invariants hold');
}
// ---- 6. the card data
{ const cards = JSON.parse(fs.readFileSync(path.join(H.ROOT, 'canonical', 'cards.json'), 'utf8'));
  const relics = cards.filter(c=> c.effects && c.effects.relic);
  ok(['shrine-high-priest', 'shrine-bell-ringer', 'friar-badger', 'vigil-owl', 'cathedral-eagle'].every(id=> relics.some(c=> c.id === id)) && relics.length === 5, `6. the five Relic cards (${relics.map(c=> c.id).join(', ')})`);
  const eng = E.makeSimEngine(base, E.mulberry32(1), {});
  ok(relics.every(c=> eng.isEcclesiaDef(c.id)), '6. Relic is an Ecclesia skill: every card with it is Ecclesia');
  const table = JSON.parse(fs.readFileSync(path.join(H.ROOT, 'canonical', 'skill-costs.json'), 'utf8'));
  const SC = require(path.join(H.ROOT, 'tools', 'skill_costs.js')).make(table);
  const ecc = cards.filter(c=> eng.isEcclesiaDef(c.id));
  const over = ecc.filter(c=> !SC.budget(c).ok);
  ok(ecc.length >= 14 && !over.length, `6. every Ecclesia card fits budget v3 (over: ${over.map(c=> c.id).join(', ') || 'none'})`);
  const rel = table.skills.find(x=> x.id === 'relic');
  ok(rel && rel.scale === 'fixed' && rel.value === 2 && SC.cardS({relic:true}, {}).S === 2 && /relic:2 \/\* 2026-10-19/.test(fs.readFileSync(path.join(H.ROOT, 'arena_app.js'), 'utf8')), '6. Relic costs 2 (canonical/skill-costs.json and the Test Lab default)');
  const eagle = cards.find(c=> c.id === 'cathedral-eagle'); ok(eagle.attack === 4 && eagle.health === 12 && eagle.prayerReq === 4, '6. Cathedral Eagle 4/12, Prayer 4');
  ok(ecc.filter(c=> c.prayerReq).every(c=> c.prayerReq >= 1 && c.prayerReq <= 5), '6. every Prayer need is 1..5');
  const req = id=> (cards.find(c=> c.id === id) || {}).prayerReq;
  ok(req('golden-magpie') === 3 && req('blessed-avatar') === 5 && req('vigil-owl') === 4 && req('cathedral-eagle') === 4 && req('hymn-wren') === 1 && req('storm-heron') === 3, '6. the retuned Prayer needs (Magpie 3, Avatar 5, Owl 4, Eagle 4)');
  ok((cards.find(c=> c.id === 'shrine-high-priest') || {}).health === 12, '6. Shrine High Priest 3/12 (Relic)');
}
// ---- 7. the CPU
{ // its offering summons with the same token as the player's
  const {e, P} = mk({aiAim:false}); const ai = P[2]; const pp = put(e, P, 2, 'pr-2', 0); pp.prayerTokens = 2; put(e, P, 1, 'pr-wall', 0);
  ai.hand = []; give(ai, 'pr-need3'); give(ai, 'pr-fill'); give(ai, 'pr-fill');
  let played = null; for(let s = 0; s < 12 && !played; s++){ const t = mk({aiAim:false, seed: 100 + s}); const q = put(t.e, t.P, 2, 'pr-2', 0); q.prayerTokens = 2; put(t.e, t.P, 1, 'pr-wall', 0);
    t.P[2].hand = []; give(t.P[2], 'pr-need3'); give(t.P[2], 'pr-fill'); give(t.P[2], 'pr-fill'); t.e.aiTakeTurn(t.P, so, 2, {}, []);
    const nc = all(t.P[2]).find(c=> c.defId === 'pr-need3'); if(nc) played = {nc, e: t.e, P: t.P}; }
  ok(played && played.P[2].prayerTokens === 1 && played.e.prayerOf(played.P[2]) === 3 && played.P[2].exile.length === 1 && played.P[2].discardUsedThisTurn, '7. the CPU\'s offering: 1 Prayer token on the CPU player, as the player\'s, and it is its pitch');
}
{ // it builds Prayer for an Ecclesia card it can't reach yet
  let pray = 0, tries = 0;
  for(let s = 0; s < 20; s++){ const {e, P} = mk({aiAim:false, seed: 300 + s}); const ai = P[2]; put(e, P, 1, 'pr-wall', 0);
    ai.hand = []; give(ai, 'pr-need3'); give(ai, 'pr-small'); give(ai, 'pr-mid'); tries++;
    e.aiTakeTurn(P, so, 2, {}, []); if(all(ai).some(c=> c.defId === 'pr-small')) pray++; }
  ok(pray === tries, `7. with a Prayer 3 card out of reach it plays its 1/4 Prayer unit over a plain 3/8 (${pray}/${tries})`);
  let plain = 0; for(let s = 0; s < 20; s++){ const {e, P} = mk({aiAim:false, seed: 300 + s}); const ai = P[2]; put(e, P, 1, 'pr-wall', 0);
    ai.hand = []; give(ai, 'pr-small'); give(ai, 'pr-mid'); e.aiTakeTurn(P, so, 2, {}, []); if(all(ai).some(c=> c.defId === 'pr-mid')) plain++; }
  ok(plain === 20, `7. with nothing to pray for, it plays the stronger plain 3/8 (${plain}/20)`);
}
{ // it keeps a Prayer unit out of a slot where it dies this round (every level)
  [0, 1, 2].forEach(level=>{ let safe = 0;
    for(let s = 0; s < 12; s++){ const {e, P} = mk({aiAim:true, level, seed: 500 + s}); const ai = P[2];
      put(e, P, 2, 'pr-wall', 0); put(e, P, 2, 'pr-wall', 1); put(e, P, 1, 'pr-killer', -1); put(e, P, 1, 'pr-fill', 2); // its legal slots: -1 (a killer across) and 2
      ai.hand = []; give(ai, 'pr-small'); e.aiTakeTurn(P, so, 2, {}, []);
      const c = all(ai).find(x=> x.defId === 'pr-small'); if(c && c.slot === 2) safe++; }
    ok(safe === 12, `7. CPU level ${level}: its Prayer unit takes the safe slot, not the killer's column (${safe}/12)`); });
}
{ // it won't sacrifice a unit holding Prayer tokens (unless it is doomed anyway)
  const {e, P} = mk({aiAim:false}); const ai = P[2]; const f = put(e, P, 2, 'pr-relic-sac', 0); f.prayerTokens = 4; ai.devilry = 2; ai.hand = []; give(ai, 'pr-dark');
  e.aiTakeTurn(P, so, 2, {}, []);
  ok(all(ai).includes(f) && f.prayerTokens === 4, '7. a Sacrifice unit with 4 Prayer tokens is kept (the Dark Summon is paid in full instead)');
}
{ // the CPU seats and the sims run the same engine: a simulated match is deterministic
  const deck = {'shrine-acolyte':4, 'shrine-high-priest':3, 'shrine-bell-ringer':3, 'hymn-wren':3, 'storm-heron':2, 'vigil-owl':2, 'cathedral-eagle':1, 'blessed-avatar':2};
  const opp = {'fawn-scout':5, 'warren-scout':5, 'bee-sentry':5, 'mouse-sapper':5};
  const sig = seed=>{ const m = E.simulateOneMatch(base, deck, opp, {rnd: E.mulberry32(seed), maxRounds: 60, recordEvents: true}); return [m.winner, m.rounds, m.events.filter(x=> x.kind === 'prayer').length, m.events.filter(x=> x.kind === 'relic').length].join('/'); };
  const a = sig(42), b = sig(42);
  ok(a === b && Number(a.split('/')[2]) > 0, `7. an Ecclesia deck's sim: deterministic, prays (${a})`);
}
// ---- 8. the UI and the texts
{ const src = fs.readFileSync(path.join(H.ROOT, 'arena_app.js'), 'utf8'), tpl = fs.readFileSync(path.join(H.ROOT, 'arena_template.html'), 'utf8');
  const {TEXT} = require(path.join(H.ROOT, 'bramblewood-texts.js'));
  const keys = ['ui.prayer-desc', 'ui.prayer-codex-note', 'ui.prayer-text', 'ui.prayer-req', 'ui.prayer-hud-tip', 'ui.prayer-per-turn', 'ui.prayer-offer-sub', 'ui.prayer-token-tip', 'ui.prayer-offer-log',
    'ui.relic-desc', 'ui.relic-text', 'ui.relic-codex-note', 'ui.relic-name', 'ui.relic-log'];
  ok(keys.every(k=> TEXT[k] && src.includes(`TX('${k}'`)), `8. every new text is a TX key the app uses (${keys.filter(k=> !(TEXT[k] && src.includes(`TX('${k}'`))).join(', ') || 'all'})`);
  ok(!/every Prayer on your board \+ the cards in your Removal Zone/.test(src.replace(/\/\/[^\n]*/g, '')), '8. the old rule text is gone');
  ok(/\{key:'relic', category:'passive', label:'Relic', kind:'boolean', desc:\(\)=> TX\('ui\.relic-desc'\), codexNote:TX\('ui\.relic-codex-note'\)\}/.test(src), '8. PASSIVE_DEFS: Relic, with its Codex note');
  ok(/relic:'🏺'/.test(src) && /'relic' \/\* 2026-10-19 \*\//.test(src), '8. Relic: icon and skill chip');
  ok((src.match(/if\(c\.prayerTokens>0\) badges\.push\(`<span class="abadge prayer"/g) || []).length === 2 && /\.abadge\.prayer\{/.test(tpl), '8. the 📿 token badge, on both card renderers, styled');
  ok(/prayerTokens:rc\.prayerTokens\|\|0/.test(src) && /prayerTokens:c\.prayerTokens\|\|0/.test(src) && /ev\.kind==='prayer'\)\{ if\(el\) floatText/.test(src), '8. the replay carries the tokens and follows each upkeep\'s gain');
  ok(/d\.relicOf \? 'is-relic' : ''/.test(src) && /\.board-card\.is-relic \.card-tile\{filter:grayscale/.test(tpl), '8. the Relic shows its card\'s art faded and ghostly');
  ok(/m\.engine\.prayerRateOf/.test(src) && /RESOURCE_TOOLTIP[\s\S]{0,4000}prayer: TX\('ui\.prayer-hud-tip'\)/.test(src), '8. the Prayer pill: tokens on the field, + a turn, its tooltip');
  ok(/r\.relicOf && !r\._relicNamed/.test(src), '8. the Relic\'s shown name comes from the text table');
  ok(/p\.prayerTokens > 0 \? `<small class="dark-left"> · 📿\$\{p\.prayerTokens\}/.test(src), '8. the Prayer pill shows the player\'s own tokens');
  ['ui.prayer-desc', 'ui.prayer-text', 'ui.prayer-req', 'ui.relic-desc', 'ui.relic-text'].forEach(k=> ok(TEXT[k].split(/\s+/).length < 20, `8. ${k}: card / skill text under 20 words`));
  const CODES = ['fr', 'de', 'es', 'it', 'pt', 'tl', 'ta', 'id', 'zh-Hans', 'zh-Hant', 'ja', 'ko'];
  const core = s=> s.trim().replace(/^[\s\p{Extended_Pictographic}\p{So}\p{Sk}️‍]*/u, '').replace(/[\s:]+$/, '');
  CODES.forEach(code=>{ const pack = JSON.parse(fs.readFileSync(path.join(H.ROOT, 'lang', code + '.json'), 'utf8'));
    const miss = keys.filter(k=> !pack[core(TEXT[k])] && !pack[TEXT[k]]);
    ok(!miss.length, `8. ${code}: every new text translated (missing: ${miss.join(', ')})`);
    ok(pack.Relic && pack.Relic !== 'Relic' || code === 'tl', `8. ${code}: the skill's name`); });
}
console.log(`prayer-2026-10-19: ${fail ? fail + ' failure(s)' : 'all ' + n + ' passed'}`); process.exit(fail ? 1 : 0);
