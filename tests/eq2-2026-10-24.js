#!/usr/bin/env node
// 2026-10-24 (package EQ2): equipment durability (EQ-1), Dive (N21-5), Bolster and the bonus / temporary Health bar (N21-7), Parasite (the
// owner's 10-21 note), the Goliath's single-target Beak Strike that a raid Guardian intercepts and the two tanky guardian raiders (N22-12).
//   1. durability: the defaults by rarity (engine = budget), a hit wears 1, acid 2, Corrode 2, a status tick 0; at 0 the piece breaks (its
//      stats and grant come off, the graveyard has it); a dropped / picked-up / stolen piece keeps its wear; a card's own equip.durability;
//      the killing blow that wears it out breaks it (no drop); the budget's life multiplier;
//   2. Dive: once a fight, the weakest unit of the row, +N, only an eligible unit; the diving Flyer is exposed (no Flying dodge) that round;
//   3. Bolster: N temporary Health set afresh each round, spent first; Crepuscular – {+1/+0}{Bolster 2} (the owner's example) by braces;
//   4. Parasite: the reach, one a host, no Structure; it hooks on (no slot), waits, feeds (its Attack, heals), drops onto a free slot when the
//      host dies (else the graveyard); still a plain unit in your own slot; the CPU hooks it on;
//   5. the raid: raidSpecials' 'single' attack aims at the most Attack and a Guardian (front / behind) takes it; the Core carries it;
//   6. the cards, prices, texts in 12 packs, the board's marks.
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const H = require('./lib/harness.js');
const E = H.Engine, ROOT = H.ROOT || path.join(__dirname, '..');
const BB = require(path.join(ROOT, 'bramblewood-budget.js'));
let fail = 0, n = 0; const ok = (c, m)=>{ n++; if(!c){ fail++; console.log('  ✗', m); } };
const so = id=> id === 1 ? 'A' : 'B';
const U = (id, effects, o)=> Object.assign({id, name:id, attack:1, health:100, wait:0, cost:0, effects}, o || {});
const EQ = (id, rarity, o)=> Object.assign({id, name:id, cardType:'equipment', attack:1, health:2, cost:0, rarity, effects:{}, equip:{grant:{reach:true}, turns:0}}, o || {});
const defs = Object.assign({}, H.loadCardDefs(), {
  'x-hit': U('x-hit', {}), 'x-acid': U('x-acid', {}, {dmgType:'acid'}), 'x-cor': U('x-cor', {corrode:1}), 'x-poi': U('x-poi', {poison:3}, {attack:0}),
  'x-wall': U('x-wall', {}, {attack:0, health:500, wait:9}), 'x-big': U('x-big', {}, {attack:9, health:500, wait:0}),
  'x-eq-c': EQ('x-eq-c', 'common'), 'x-eq-r': EQ('x-eq-r', 'rare'), 'x-eq-l': EQ('x-eq-l', 'legendary'), 'x-eq-own': EQ('x-eq-own', 'common', {equip:{grant:{}, turns:0, durability:7}}),
  'x-dive': U('x-dive', {flying:true, dive:2}, {attack:3, health:50}), 'x-dive1': U('x-dive1', {flying:true, dive:true}, {attack:3, health:50}),
  'x-dive-ground': U('x-dive-ground', {dive:2}, {attack:3, health:50}), 'x-weak': U('x-weak', {}, {attack:0, health:5, wait:9}), 'x-taunt': U('x-taunt', {taunt:true}, {attack:0, health:40, wait:9}),
  'x-fly': U('x-fly', {flying:true}, {attack:1, health:500, wait:9}),
  'x-bol': U('x-bol', {bolster:2}, {attack:0, health:50, wait:9}), 'x-bol3': U('x-bol3', {bolster:3}, {attack:0, health:50, wait:9}),
  'x-crep': U('x-crep', {crepuscular:true, crepuscularGrant:{day:{attack:1}, night:{bolster:2}}}, {attack:1, health:30, wait:9}),
  'x-par': U('x-par', {parasite:true}, {attack:2, health:4, wait:0}), 'x-par-w': U('x-par-w', {parasite:true}, {attack:2, health:4, wait:1}),
  'x-struct': U('x-struct', {}, {attack:0, health:50, wait:9, archetypes:['Structure']}),
  'x-guard': U('x-guard', {guardian:true}, {attack:0, health:500, wait:9}),
});
const all = pl=> [...pl.row.left, ...pl.row.center, ...pl.row.right];
function mk(seed, opts){ const e = E.makeSimEngine(defs, E.mulberry32(seed || 5), Object.assign({recordEvents:true, battleMode:'open', rules:{}}, opts || {}));
  return {e, P:{1: e.newPlayer(1, {}, {id:'st-hq', health:60, effects:{}}), 2: e.newPlayer(2, {}, {id:'st-hq', health:60, effects:{}})}}; }
function put(e, P, pid, id, slot){ const pl = P[pid]; e.debugSpawnCard(P, so, pid, id, 'left', {}, []);
  const c = all(pl).reduce((a, x)=> (!a || x.uid > a.uid) ? x : a, null); c.slot = slot;
  const cs = all(pl); pl.row.center = cs.filter(x=> x.slot === 0); pl.row.left = cs.filter(x=> x.slot < 0).sort((a, b)=> b.slot - a.slot); pl.row.right = cs.filter(x=> x.slot > 0).sort((a, b)=> a.slot - b.slot);
  e.syncSlots(pl); e.syncPhaseStats(P, so, []); return c; }
const round = (e, P, first)=>{ const ev = []; e.resolveCombat(P, so, {}, ev, first || 1); return ev; };
let huid = 70000; const give = (P, pid, defId)=>{ const uid = huid++; P[pid].hand.push({uid, defId}); P[pid].lumber = 9; P[pid].playedThisTurn = false; return uid; };
const wear = ev=> ev.filter(x=> x.type === 'equipWear');

// ---- 1. durability -----------------------------------------------------------------------------------------------------------
{ const {e} = mk(); const D = e.EQ2_DEF;
  ok(JSON.stringify(D.durByRarity) === JSON.stringify(BB.EQUIP_DUR_BY_RARITY) && D.durDefault === BB.EQUIP_DUR_DEFAULT, 'the durability table: the engine and the budget agree');
  ok(e.eqDurMaxOf('x-eq-c') === 3 && e.eqDurMaxOf('x-eq-r') === 4 && e.eqDurMaxOf('x-eq-l') === 5 && e.eqDurMaxOf('x-eq-own') === 7, `defaults by rarity: Common 3, Rare 4, Legendary 5; a card's own durability 7 (${['x-eq-c', 'x-eq-r', 'x-eq-l', 'x-eq-own'].map(e.eqDurMaxOf)})`);
  ok(D.hitWear === 1 && D.acidWear === 2 && D.corrodeWear === 2, 'wear: 1 a hit, 2 an acid hit, 2 a Corrode'); }
{ const {e, P} = mk(); put(e, P, 1, 'x-hit', 0); const W = put(e, P, 2, 'x-wall', 0); const h = give(P, 2, 'x-eq-c');
  ok(e.equip(P, so, 2, W.uid, h, {}, []) && W.equipDur === 3 && W.equipOn, `a Common piece goes on with durability 3 (${W.equipDur})`);
  const hp0 = W.maxHp; let ev = round(e, P); ok(W.equipDur === 2 && wear(ev).length === 1 && wear(ev)[0].why === 'hit' && wear(ev)[0].dur === 2 && wear(ev)[0].max === 3, `a hit on the wearer: 3 -> 2 (${W.equipDur})`);
  round(e, P); ev = round(e, P); const br = ev.find(x=> x.type === 'equipBreak');
  ok(br && !W.equipment && W.equipDur == null && W.maxHp === hp0 - 2 && !(e.effectsOf(W).reach) && P[2].graveyard.some(g=> g.defId === 'x-eq-c'), `at 0 it breaks: off the unit (Health -2, its Reach gone), into the graveyard (${br && br.why})`); }
{ const {e, P} = mk(); put(e, P, 1, 'x-acid', 0); const W = put(e, P, 2, 'x-wall', 0); e.equip(P, so, 2, W.uid, give(P, 2, 'x-eq-l'), {}, []);
  const ev = round(e, P); ok(W.equipDur === 3 && wear(ev)[0].why === 'acid', `an acid hit takes 2 (5 -> ${W.equipDur})`); }
{ const {e, P} = mk(); put(e, P, 1, 'x-cor', 0); const W = put(e, P, 2, 'x-wall', 0); e.equip(P, so, 2, W.uid, give(P, 2, 'x-eq-l'), {}, []);
  const ev = round(e, P); ok(W.equipDur === 2 && wear(ev).map(x=> x.why).join() === 'hit,corrode', `a hit that Corrodes: 1 for the hit, 2 for the Corrode (5 -> ${W.equipDur}: ${wear(ev).map(x=> x.why)})`); }
{ const {e, P} = mk(); put(e, P, 1, 'x-poi', 0); const W = put(e, P, 2, 'x-wall', 0); e.equip(P, so, 2, W.uid, give(P, 2, 'x-eq-l'), {}, []); W.poison = 4;
  for(let i = 0; i < 3; i++) round(e, P);
  ok(W.equipDur === 5 && W.hp < W.maxHp, `a Poison tick is no hit: no wear (durability ${W.equipDur}, Health ${W.hp}/${W.maxHp})`); }
{ const {e, P} = mk(); put(e, P, 1, 'x-hit', 0); const W = put(e, P, 2, 'x-wall', 0); e.equip(P, so, 2, W.uid, give(P, 2, 'x-eq-l'), {}, []); round(e, P); round(e, P);
  W.hp = 1; const ev = round(e, P); const lone = e.loneEquipAt(P[2], 0);
  ok(lone && lone.defId === 'x-eq-l' && lone.dur === 2, `its unit dies: the piece lies in the slot with its wear (durability ${lone && lone.dur} of 5)`);
  const N = put(e, P, 2, 'x-wall', 0); e.floorScan(P, so, {}, []); ok(N.equipment === 'x-eq-l' && N.equipDur === 2, `picked up again: it keeps durability 2 (${N.equipDur})`); void ev; }
{ const {e, P} = mk(); put(e, P, 1, 'x-big', 0); const W = put(e, P, 2, 'x-weak', 0); W.hp = 5; e.equip(P, so, 2, W.uid, give(P, 2, 'x-eq-c'), {}, []); W.equipDur = 1;
  const ev = round(e, P); const br = ev.find(x=> x.type === 'equipBreak');
  ok(br && br.dropped && !e.loneEquipAt(P[2], 0) && P[2].graveyard.some(g=> g.defId === 'x-eq-c'), 'the killing blow wears it to 0: it breaks, nothing lies in the slot'); }
{ ok(BB.equipLifeMult({rarity:'common'}) === 0.75 && BB.equipLifeMult({rarity:'rare'}) === 1 && BB.equipLifeMult({rarity:'common', equip:{durability:2}}) === 0.5, 'the budget: a piece counts min(durability, 4) / 4 (Common 0.75, Rare 1, durability 2: 0.5)');
  const rep = JSON.parse(fs.readFileSync(path.join(ROOT, 'docs', 'balance', 'eq2-equipment-2026-10-24.json'), 'utf8'));
  ok(rep.rows.length >= 10 && rep.rows.every(r=> r.useAfter <= r.useBefore && r.useAfter <= 100), `docs/balance/eq2-equipment-2026-10-24.json: every piece within its N after durability (${rep.rows.length} pieces)`); }

// ---- 2. Dive -----------------------------------------------------------------------------------------------------------------
{ const {e, P} = mk(); const A = put(e, P, 1, 'x-dive', 0); put(e, P, 2, 'x-wall', 0); const wk = put(e, P, 2, 'x-weak', 1);
  let ev = round(e, P); const dv = ev.find(x=> x.type === 'dive'), hit = ev.find(x=> x.type === 'hit' && x.attUid === A.uid);
  ok(dv && dv.targetUid === wk.uid && dv.bonus === 2 && hit && hit.targetUid === wk.uid && hit.dmg === 5 && hit.dive === 2, `Dive 2: past the unit in front onto the weakest (5 Health) for 3 + 2 (${hit && hit.dmg})`);
  ev = round(e, P); ok(!ev.some(x=> x.type === 'dive') && ev.some(x=> x.type === 'hit' && x.attUid === A.uid && x.targetDefId === 'x-wall'), 'once a fight: the next swing goes at the unit in front'); }
{ const {e, P} = mk(); put(e, P, 1, 'x-dive1', 0); put(e, P, 2, 'x-wall', 0); put(e, P, 2, 'x-weak', -1); const ev = round(e, P); const dv = ev.find(x=> x.type === 'dive');
  ok(dv && dv.bonus === 1, 'plain Dive is Dive 1'); }
{ const {e, P} = mk(); put(e, P, 1, 'x-dive', 0); const T = put(e, P, 2, 'x-taunt', 0); const wk = put(e, P, 2, 'x-weak', 1); const ev = round(e, P);
  ok(ev.some(x=> x.type === 'dive' && x.targetUid === wk.uid), 'the dive goes past a Taunt unit'); void T; }
{ const {e, P} = mk(); put(e, P, 1, 'x-dive-ground', 0); put(e, P, 2, 'x-wall', 0); put(e, P, 2, 'x-weak', 1); const ev = round(e, P);
  ok(!ev.some(x=> x.type === 'dive') && e.diveEligible(defs['x-dive-ground']) === false, 'a unit that can\'t take Dive (not a Flyer, Tide unit or Sprinter) never dives'); }
{ let exposedDodges = 0, laterDodges = 0;
  for(let s = 1; s <= 60; s++){ const {e, P} = mk(s); put(e, P, 1, 'x-dive', 0); put(e, P, 2, 'x-hit', 0); put(e, P, 2, 'x-weak', 1);
    // the diver swings first (side A first) onto the weak unit; the ground unit facing it swings back in the same round
    const r1 = round(e, P, 1); exposedDodges += r1.filter(x=> x.type === 'evaded' && x.reason === 'flying' && x.targetDefId === 'x-dive').length;
    for(let k = 0; k < 3; k++) laterDodges += round(e, P, 1).filter(x=> x.type === 'evaded' && x.reason === 'flying' && x.targetDefId === 'x-dive').length; }
  ok(exposedDodges === 0 && laterDodges > 20, `the diving Flyer is exposed: no Flying dodge in the round it dives (${exposedDodges}), as usual after (${laterDodges} in 3 later rounds x 60)`); }

// ---- 3. Bolster and the Health bar -------------------------------------------------------------------------------------------
{ const {e, P} = mk(); put(e, P, 1, 'x-hit', 0); const B = put(e, P, 2, 'x-bol', 0);
  let ev = round(e, P); const bo = ev.find(x=> x.type === 'statusFx' && x.kind === 'bolster'), ts = ev.find(x=> x.type === 'tempSoak');
  ok(bo && bo.amount === 2 && ts && ts.soaked === 1 && ts.left === 1 && B.hp === 50 && B.tempHpR === 1, `Bolster 2: 2 temporary Health as the fight begins, the hit spends 1 of it, Health untouched (${B.hp}, ${B.tempHpR} left)`);
  ev = round(e, P); ok(B.tempHpR === 1 && B.hp === 50, `next round it is set afresh to 2 (not 3), the hit spends 1 (${B.tempHpR})`); }
{ const {e, P} = mk(); put(e, P, 1, 'x-big', 0); const B = put(e, P, 2, 'x-bol3', 0); round(e, P); ok(B.hp === 50 - 6 && B.tempHpR === 0, `a big hit: the 3 temporary first, the rest from Health (9 -> ${50 - B.hp})`); }
{ const {e, P} = mk(1, {rules:{phase:'night'}}); put(e, P, 1, 'x-hit', 0); const C = put(e, P, 2, 'x-crep', 0); const ev = round(e, P);
  ok(ev.some(x=> x.kind === 'bolster' && x.targetUid === C.uid && x.amount === 2) && C.hp === 30, `Crepuscular – {+1/+0}{Bolster 2} at night: 2 temporary Health, the hit soaked (${C.hp})`); }
{ const {e, P} = mk(1, {rules:{phase:'day'}}); put(e, P, 1, 'x-hit', 0); const C = put(e, P, 2, 'x-crep', 0); const ev = round(e, P);
  ok(!ev.some(x=> x.kind === 'bolster') && (C.phaseAtk || 0) === 1 && C.hp === 29, `... by day: +1 Attack and no temporary Health (phase Attack ${C.phaseAtk}, Health ${C.hp})`); }
{ const W = mk().e.makeBoardCard ? null : null; void W; const {e} = mk(); const c = e.makeBoardCard('x-wall'); ok(c.baseHp === 500 && c.tempHpR === 0, 'a unit remembers its printed Health (baseHp: the bar\'s green part) and starts with no temporary Health'); }

// ---- 4. Parasite -------------------------------------------------------------------------------------------------------------
{ const {e, P} = mk(); put(e, P, 1, 'x-hit', 0); const a = put(e, P, 2, 'x-wall', 1), b = put(e, P, 2, 'x-wall', 3), s = put(e, P, 2, 'x-struct', -1);
  const t = e.parasiteTargets(P, 1).map(c=> c.uid); ok(t.includes(a.uid) && !t.includes(b.uid) && !t.includes(s.uid), 'reach: the enemy unit in a column beside yours is a target; two columns away is not; never a Structure'); }
{ const {e, P} = mk(); put(e, P, 1, 'x-hit', 0); const W = put(e, P, 2, 'x-wall', 0); const h = give(P, 1, 'x-par'); const live0 = all(P[1]).length;
  ok(e.placeCard(P, so, 1, h, 0, {}, [], {parasiteOn: W.uid}) && W.parasite && W.parasite.defId === 'x-par' && all(P[1]).length === live0 && !P[1].hand.some(x=> x.uid === h), 'it hooks on: no slot of yours taken, out of the hand');
  ok(!e.parasiteTargets(P, 1).some(c=> c.uid === W.uid), 'one Parasite a host');
  W.parasite.hp = 2; const hp0 = W.hp; const ev = round(e, P); const dr = ev.find(x=> x.type === 'parasiteDrain');
  ok(dr && dr.dmg === 2 && W.parasite.hp === 4 && W.hp === hp0 - 2 - 1, `it feeds as the fight begins: its Attack (2) to the host, and heals as much (${W.parasite.hp}/4)`);
  ok(!ev.some(x=> (x.type === 'hit' || x.type === 'evaded') && x.targetUid === W.parasite.uid), 'nothing hits it while it rides'); }
{ const {e, P} = mk(); put(e, P, 1, 'x-hit', 0); const W = put(e, P, 2, 'x-wall', 0); e.placeCard(P, so, 1, give(P, 1, 'x-par-w'), 0, {}, [], {parasiteOn: W.uid});
  const r1 = round(e, P), r2 = round(e, P); ok(!r1.some(x=> x.type === 'parasiteDrain') && r2.some(x=> x.type === 'parasiteDrain'), 'it waits its own Wait (1) first'); }
{ const {e, P} = mk(); put(e, P, 1, 'x-hit', 0); const W = put(e, P, 2, 'x-wall', 1); const h = give(P, 1, 'x-par'); e.placeCard(P, so, 1, h, 1, {}, [], {parasiteOn: W.uid}); const pu = W.parasite.uid;
  W.hp = 2; const ev = round(e, P); const drop = ev.find(x=> x.type === 'parasiteDrop'); const now = all(P[1]).find(c=> c.uid === pu);
  ok(drop && drop.placed && now && now.slot === 1 && !now.parasiteOf && ev.some(x=> x.type === 'spawn' && x.cause === 'parasite'), `the host dies: it drops onto your side in that column, a unit again (slot ${now && now.slot})`); }
{ const {e, P} = mk(); put(e, P, 1, 'x-hit', 0); const W = put(e, P, 2, 'x-wall', 0); e.placeCard(P, so, 1, give(P, 1, 'x-par'), 0, {}, [], {parasiteOn: W.uid});
  W.hp = 2; const ev = round(e, P); const drop = ev.find(x=> x.type === 'parasiteDrop');
  ok(drop && !drop.placed && P[1].graveyard.some(g=> g.defId === 'x-par'), 'its column is taken on your side: it is lost to the graveyard'); }
{ const {e, P} = mk(); put(e, P, 1, 'x-hit', 0); put(e, P, 2, 'x-wall', 0); const h = give(P, 1, 'x-par');
  ok(e.placeCard(P, so, 1, h, 'right', {}, []) && all(P[1]).some(c=> c.defId === 'x-par' && Number.isInteger(c.slot)), 'played into your own slot it is a plain unit'); }
{ const {e, P} = mk(); put(e, P, 1, 'x-hit', 0); const W = put(e, P, 2, 'x-wall', 3); const h = give(P, 1, 'x-par');
  ok(!e.placeCard(P, so, 1, h, 3, {}, [], {parasiteOn: W.uid}) && P[1].hand.some(x=> x.uid === h), 'out of reach: refused, the card stays in the hand'); }
{ const {e, P} = mk(); put(e, P, 2, 'x-hit', 0); const W = put(e, P, 1, 'x-big', 0); P[2].hand = []; give(P, 2, 'x-par'); P[2].lumber = 9;
  const pick = e.eq2ParasitePick(P, 2, 'x-par'); ok(pick && pick.uid === W.uid, 'the CPU picks the enemy unit in reach worth the most'); }

// ---- 5. the raid: the Beak Strike and the Guardians -----------------------------------------------------------------------------
{ const B = require(path.join(ROOT, 'tools', 'lib_bramble.js'));
  const names = ['seededRng', 'raidSmackRoll', 'RAID_SMACK_BACK_CHANCE', 'raidSmackBack', 'raidSmackKind', 'raidRowUnits', 'raidColUnits', 'raidPickColumn', 'raidAtkRange', 'raidSmackDmg', 'raidAtkDmgText', 'raidSmackRow', 'raidSmackTarget', 'raidSpecials'];
  const ctx = {console}; vm.createContext(ctx); vm.runInContext(names.map(B.grab).join('\n') + '\nthis.raidSpecials = raidSpecials;', ctx);
  const mkR = seed=>{ const e = E.makeSimEngine(defs, E.mulberry32(seed || 5), {recordEvents:true, battleMode:'open', reserveRows:2, reserveActs:true});
    const P = {1: e.newPlayer(1, {}, {health:200}), 2: e.newPlayer(2, {}, {health:200})}; return {e, P}; };
  const strike = {id:'beak', name:'Beak Strike', pattern:'single', dmg:3, every:2};
  { const {e, P} = mkR(); const big = put(e, P, 1, 'x-big', 0), g = e.fillReserve(P[1], 1, 0, 'x-guard'); const ev = [];
    const m = {players:P, engine:e, round:2, raidAttacks:[strike], raidPending:{}, raidSeed:7, sideOf:so, stats:{}}; ctx.raidSpecials(m, ev);
    const s = ev.find(x=> x.type === 'raidStrike'); ok(s && s.guard && s.uid === g.uid && s.aimUid === big.uid && g.hp === 497 && big.hp === 500, `the Beak Strike aims at the most Attack; the Guardian behind it (middle row) takes it (${s && s.defId}, ${g.hp})`); }
  { const {e, P} = mkR(); const big = put(e, P, 1, 'x-big', 0); put(e, P, 1, 'x-wall', 1); const ev = [];
    ctx.raidSpecials({players:P, engine:e, round:2, raidAttacks:[strike], raidPending:{}, raidSeed:7, sideOf:so, stats:{}}, ev);
    const s = ev.find(x=> x.type === 'raidStrike'); ok(s && !s.guard && s.uid === big.uid && big.hp === 497, 'no Guardian beside it: the unit with the most Attack takes it'); }
  { const {e, P} = mkR(); const ev = [], hq0 = P[1].hq.hp; ctx.raidSpecials({players:P, engine:e, round:2, raidAttacks:[strike], raidPending:{}, raidSeed:7, sideOf:so, stats:{}}, ev);
    ok(ev.some(x=> x.type === 'raidStrike' && x.uid == null) && P[1].hq.hp === hq0 - 3, 'no unit at all: the bramble takes it'); }
  { const {e, P} = mkR(); put(e, P, 1, 'x-big', 0); const ev = []; ctx.raidSpecials({players:P, engine:e, round:3, raidAttacks:[strike], raidPending:{}, raidSeed:7, sideOf:so, stats:{}}, ev);
    ok(!ev.some(x=> x.type === 'raidStrike'), 'every 2 turns: not on turn 3'); }
  const raids = JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical', 'raids.json'), 'utf8')), core = raids[0].parts.find(p=> p.id === 'core');
  ok(core.trench.attacks.some(a=> a.pattern === 'single' && a.name === 'Beak Strike' && a.dmg === 3 && a.every === 2), 'the Goliath Core carries the Beak Strike (3 every 2 turns)'); }

// ---- 6. the cards, prices, texts, the board ----------------------------------------------------------------------------------
{ const cards = JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical', 'cards.json'), 'utf8')), by = id=> cards.find(c=> c.id === id);
  const L = by('clinging-leech'), Bb = by('barnacle-bulwark'), R = by('reefback-turtle');
  ok(L && L.effects.parasite && L.awaitingSource === true && !L.source, 'Clinging Leech: Parasite, awaiting a source');
  ok(Bb && Bb.effects.guardian && Bb.effects.armor === 1 && Bb.source.kind === 'raid' && Bb.raid === 'goliath' && Bb.health >= 15, `Barnacle Bulwark: a tanky Guardian raider (Goliath; ${Bb && Bb.attack}/${Bb && Bb.health})`);
  ok(R && R.effects.guardian && R.effects.shell === 2 && R.source.kind === 'raid' && R.health >= 15, `Reefback Turtle: a tanky Guardian raider (Goliath; ${R && R.attack}/${R && R.health})`);
  if(!process.argv.includes('--world=half')) process.argv.push('--world=half');
  const SC = require(path.join(ROOT, 'tools', 'skill_costs.js')), costs = JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical', 'skill-costs.json'), 'utf8')), T = SC.make(costs);
  const sk = id=> costs.skills.find(r=> r.id === id);
  ok(sk('dive') && sk('dive').value === 0.75 && sk('bolster') && sk('bolster').value === 2.5 && sk('bolster').payDefault === 2 && sk('parasite') && sk('parasite').value === 1, 'prices: Dive 0.75 a point, Bolster 2.5 a point (plain = 2), Parasite 1');
  [L, Bb, R].forEach(c=>{ const b = T.budget(c, {level: 1}); ok(b.ok && !(b.missing || []).length, `${c.id} fits its budget at Level 1 (2A+H+S ${b.x1} <= N ${b.N})`); });
  const obt = JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical', 'card-obtain-maps.json'), 'utf8')).maps; ok(obt['barnacle-bulwark'] === 13 && obt['reefback-turtle'] === 13, 'the raiders obtain on Map 13 (the Goliath, as its other cards)'); }
{ const TXT = require(path.join(ROOT, 'bramblewood-texts.js')).TEXT; const strip = s=> String(s).replace(/^[\p{Extended_Pictographic}✀-➿️‍\s]+/u, '');
  const keys = Object.keys(TXT).filter(k=> /^ui\.(eq2-|skn?-(dive|bolster|parasite))|^toast\.eq2-/.test(k)); ok(keys.length >= 32, `the package's texts are keyed (${keys.length})`);
  const CODES = ['de', 'es', 'fr', 'id', 'it', 'ja', 'ko', 'pt', 'ta', 'tl', 'zh-Hans', 'zh-Hant'];
  CODES.forEach(c=>{ const p = Object.assign({}, JSON.parse(fs.readFileSync(path.join(ROOT, 'lang', c + '.json'), 'utf8')), JSON.parse(fs.readFileSync(path.join(ROOT, 'lang', 'ui', c + '.json'), 'utf8'))), cp = JSON.parse(fs.readFileSync(path.join(ROOT, 'lang', 'cards', c + '.json'), 'utf8'));
    const miss = keys.filter(k=> !p[strip(TXT[k])] && !p[TXT[k]]); ok(!miss.length, `${c}: every EQ2 text translated (${miss.slice(0, 3)})`);
    ok(['Clinging Leech', 'Barnacle Bulwark', 'Reefback Turtle'].every(nm=> cp[nm]), `${c}: the three card names`); }); }
{ const app = fs.readFileSync(path.join(ROOT, 'arena_app.js'), 'utf8');
  ['function eq2MarksHTML', 'function eq2HpBarHTML', 'function eq2Vfx', 'function eq2LogText', 'function eq2Shatter', "try{ eq2Vfx(ev); }catch(e){}", '{ const q = eq2LogText(ev, nm); if(q) return q; }', '...eq2Snap(c)', '...eq2Snap(rc)',
   "a.pattern === 'single'", "{key:'dive', category:'passive'", "{key:'bolster', category:'passive'", "{key:'parasite', category:'passive'", 'popts.parasiteOn!=null ? {parasiteOn: popts.parasiteOn}', "TX('ui.eq2-dur-line'"].forEach(s=> ok(app.includes(s), 'arena_app.js: ' + s));
  const html = fs.existsSync(path.join(ROOT, 'index.html')) ? fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8') : ''; ok(html.includes('function eq2MarksHTML') && html.includes('EQ2_DEF'), 'the build carries the package (index.html)'); }

console.log(`eq2-2026-10-24: ${n - fail}/${n} checks passed`);
process.exit(fail ? 1 : 0);
