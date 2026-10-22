#!/usr/bin/env node
// 2026-10-14 (skills for the cards on the maps after Map 20): Speed (swing order), Haste, Rabid, Cower, Ghost and Magic damage,
// Ichor N, Irradiated N, and the Volcano's hazards with odds (Lava Tide, Petrification, Eruption), with the old rules.eruption
// left exactly as it was.
'use strict';
const H = require('./lib/harness.js');
const E = H.Engine;
let fail = 0; const ok = (c, m)=>{ if(!c){ fail++; console.log('  ✗', m); } };
const so = id=> id===1 ? 'A' : 'B';
const defs = Object.assign({}, H.loadCardDefs(), {
  'k4-hit':    {id:'k4-hit', name:'Hit', attack:5, health:50, wait:0, cost:0, effects:{}},
  'k4-one':    {id:'k4-one', name:'One', attack:1, health:50, wait:0, cost:0, effects:{}},
  'k4-wall':   {id:'k4-wall', name:'Wall', attack:0, health:500, wait:0, cost:0, effects:{}},
  'k4-mid':    {id:'k4-mid', name:'Mid', attack:3, health:20, wait:0, cost:0, effects:{}},
  'k4-fast':   {id:'k4-fast', name:'Fast', attack:1, health:50, wait:0, cost:0, effects:{speed:2}},
  'k4-haste':  {id:'k4-haste', name:'Haste', attack:1, health:50, wait:0, cost:0, effects:{haste:true}},
  'k4-rabid':  {id:'k4-rabid', name:'Rabid', attack:2, health:30, wait:0, cost:0, effects:{rabid:true}},
  'k4-swim':   {id:'k4-swim', name:'Swim', attack:3, health:50, wait:0, cost:0, effects:{swimmer:'extraAttack'}},
  'k4-water':  {id:'k4-water', name:'Water', attack:3, health:50, wait:0, cost:0, dmgType:'water', effects:{}},
  'k4-cower':  {id:'k4-cower', name:'Cower', attack:3, health:40, wait:0, cost:0, effects:{cower:'shell'}},
  'k4-flee':   {id:'k4-flee', name:'Flee', attack:3, health:40, wait:0, cost:0, effects:{cower:'flee'}},
  'k4-ghost':  {id:'k4-ghost', name:'Ghost', attack:1, health:20, wait:0, cost:0, effects:{ghost:true}},
  'k4-gharm':  {id:'k4-gharm', name:'Armored Ghost', attack:1, health:20, wait:0, cost:0, effects:{ghost:true, armor:2}},
  'k4-magic':  {id:'k4-magic', name:'Wand', attack:4, health:20, wait:0, cost:0, effects:{magic:true}},
  'k4-bleed':  {id:'k4-bleed', name:'Bleeder', attack:2, health:20, wait:0, cost:0, effects:{bleed:2}},
  'k4-ichor':  {id:'k4-ichor', name:'Ichor', attack:0, health:50, wait:0, cost:0, effects:{ichor:2}},
  'k4-irr':    {id:'k4-irr', name:'Glow', attack:1, health:10, wait:0, cost:0, effects:{irradiated:2}},
  'k4-radres': {id:'k4-radres', name:'Lead', attack:4, health:20, wait:0, cost:0, effects:{resist:['radiation']}},
  'k4-frail':  {id:'k4-frail', name:'Frail', attack:4, health:2, wait:0, cost:0, effects:{}},
  'k4-fly':    {id:'k4-fly', name:'Fly', attack:1, health:20, wait:0, cost:0, effects:{flying:true}},
  'k4-hot':    {id:'k4-hot', name:'Hot', attack:1, health:20, wait:0, cost:0, resist:['heat'], effects:{}},
});
const all = pl=> [...pl.row.left, ...pl.row.center, ...pl.row.right];
const byDef = (pl, id)=> all(pl).find(c=> c.defId===id);
function mk(seed, rules){ const e = E.makeSimEngine(defs, E.mulberry32(seed||5), {recordEvents:true, battleMode:'open', rules: rules || {}}); e.startTide && e.startTide(); return {e, P:{1:e.newPlayer(1,{}), 2:e.newPlayer(2,{})}}; }
const firstSwing = ev=> ev.find(x=> x.type==='hit' || x.type==='hitHQ');

// ---- Speed: a Speed 2 unit on the second side swings before a Speed 0 unit on the side that wins ties
{ const {e, P} = mk(); e.debugSpawnCard(P, so, 1, 'k4-one', 'left', {}, []); e.debugSpawnCard(P, so, 2, 'k4-one', 'left', {}, []);
  const ev = []; e.resolveCombat(P, so, {}, ev, 1); ok(firstSwing(ev).side === 'A', 'baseline: at Speed 0 the side with initiative swings first'); }
{ const {e, P} = mk(); e.debugSpawnCard(P, so, 1, 'k4-one', 'left', {}, []); e.debugSpawnCard(P, so, 2, 'k4-fast', 'left', {}, []);
  ok(byDef(P[2], 'k4-fast').speed === 2, `a Speed 2 card shows c.speed 2 (${byDef(P[2], 'k4-fast').speed})`);
  const ev = []; e.resolveCombat(P, so, {}, ev, 1); const f = firstSwing(ev);
  ok(f.side === 'B' && f.attDefId === 'k4-fast', `Speed 2 on the second side swings first (${f.side} ${f.attDefId})`); }
// Speed beats Quick and Swift order? No: Speed groups first, the old order (Swift, Quick, position) applies inside a group.
{ const {e, P} = mk(); e.debugSpawnCard(P, so, 1, 'k4-one', 'left', {}, []); e.debugSpawnCard(P, so, 1, 'k4-one', 'right', {}, []); e.debugSpawnCard(P, so, 2, 'k4-fast', 'right', {}, []);
  const ev = []; e.resolveCombat(P, so, {}, ev, 1); const sw = ev.filter(x=> x.type==='hit' || x.type==='hitHQ').map(x=> x.attDefId);
  ok(sw[0] === 'k4-fast' && sw.length === 3, `the fast unit goes before every Speed 0 unit (${sw})`); }
// ---- Haste: itself +2, its row neighbours +1, while it lives
{ const {e, P} = mk(); e.debugSpawnCard(P, so, 1, 'k4-haste', 'left', {}, []); e.debugSpawnCard(P, so, 1, 'k4-wall', 'left', {}, []); e.debugSpawnCard(P, so, 1, 'k4-wall', 'right', {}, []); e.debugSpawnCard(P, so, 1, 'k4-mid', 'left', {}, []);
  const Hs = byDef(P[1], 'k4-haste'), W = all(P[1]).filter(c=> c.defId==='k4-wall'), M = byDef(P[1], 'k4-mid');
  ok(Hs.speed === 2 && W.every(c=> c.speed === 1) && !(M.speed > 0), `Haste 2, neighbours 1, the far one 0 (${Hs.speed}, ${W.map(c=> c.speed)}, ${M.speed||0})`);
  Hs.hp = 0; e.removeDeadCards(P, so, {}, {}, []); e.resolveCombat(P, so, {}, [], 1);
  ok(all(P[1]).every(c=> !(c.speed > 0)), `with the Haste unit gone, nobody is fast (${all(P[1]).map(c=> c.speed||0)})`); }
// ---- Rabid: its hits add Poison 2; Swimmers and water hit it for double
{ const {e, P} = mk(); e.debugSpawnCard(P, so, 1, 'k4-rabid', 'left', {}, []); e.debugSpawnCard(P, so, 2, 'k4-wall', 'left', {}, []);
  e.debugAttack(P, so, byDef(P[1], 'k4-rabid').uid, {}, []); ok(byDef(P[2], 'k4-wall').poison === 2, `a Rabid hit adds Poison 2 (${byDef(P[2], 'k4-wall').poison})`); }
{ const {e, P} = mk(); e.debugSpawnCard(P, so, 1, 'k4-rabid', 'left', {}, []); e.debugSpawnCard(P, so, 2, 'k4-swim', 'left', {}, []);
  const R = byDef(P[1], 'k4-rabid'), hp = R.hp; e.debugAttack(P, so, byDef(P[2], 'k4-swim').uid, {}, []); ok(hp - R.hp === 6, `a Swimmer hits it for double (${hp - R.hp}, want 6)`); }
{ const {e, P} = mk(); e.debugSpawnCard(P, so, 1, 'k4-rabid', 'left', {}, []); e.debugSpawnCard(P, so, 2, 'k4-water', 'left', {}, []);
  const R = byDef(P[1], 'k4-rabid'), hp = R.hp; e.debugAttack(P, so, byDef(P[2], 'k4-water').uid, {}, []); ok(hp - R.hp === 6, `water damage is double too (${hp - R.hp}, want 6)`); }
// 2026-10-21 (package TT): 3/5 since the 2026-10-19 card retune (BF3, v5 L/10 + Map term: raised to 65% of N); was 2/3
// 2026-10-21 (BF5): N halved, Rabid's measured worth (S 6.23) kept: 3/5 -> 1/1 (docs/balance/halve-2026-10-19.md)
{ const d = defs['rabid-jackal']; ok(d && d.attack === 1 && d.health === 1 && d.effects.rabid && d.rarity === 'uncommon', 'Rabid Jackal is a 1/1 uncommon with Rabid (BF5; was 3/5)'); }
// ---- Cower: hit last round -> this round it hides (shell: no attack, no damage from attacks) or backs off (flee: no attack, heals 2)
{ const {e, P} = mk(); e.debugSpawnCard(P, so, 1, 'k4-cower', 'left', {}, []); e.debugSpawnCard(P, so, 2, 'k4-hit', 'left', {}, []);
  const C = byDef(P[1], 'k4-cower'), F = byDef(P[2], 'k4-hit');
  e.resolveCombat(P, so, {}, [], 1); ok(C.hp === 35 && F.hp === 47, `round 1: both swing (${C.hp}, ${F.hp})`);
  C.poison = 1; const ev = []; e.resolveCombat(P, so, {}, ev, 1);
  ok(F.hp === 47, `round 2: the cowering unit doesn't attack (${F.hp})`);
  ok(C.hp === 34, `round 2: the attack can't hurt it, but its Poison still ticks (${C.hp}, want 34)`);
  ok(ev.some(x=> x.type==='skipTurn' && x.reason==='cower') && ev.some(x=> x.type==='statusFx' && x.kind==='cower'), 'the cower shows in the log');
  e.resolveCombat(P, so, {}, [], 1); ok(F.hp === 44, `round 3: not hurt last round, so it swings again (${F.hp})`); }
{ const {e, P} = mk(); e.debugSpawnCard(P, so, 1, 'k4-flee', 'left', {}, []); e.debugSpawnCard(P, so, 2, 'k4-hit', 'left', {}, []);
  const C = byDef(P[1], 'k4-flee'), F = byDef(P[2], 'k4-hit');
  e.resolveCombat(P, so, {}, [], 1); const hp1 = C.hp; e.resolveCombat(P, so, {}, [], 1);
  ok(F.hp === 47 && C.hp === hp1 + 2 - 5, `Flee: no attack, heals 2, still takes the hit (${hp1} -> ${C.hp}, foe ${F.hp})`); }
{ const {e, P} = mk(); e.debugSpawnCard(P, so, 1, 'k4-cower', 'left', {}, []); const hq = P[2].hq.hp; e.resolveCombat(P, so, {}, [], 1); e.resolveCombat(P, so, {}, [], 1);
  ok(hq - P[2].hq.hp === 6, 'an unhit Cower unit attacks every round'); }
// ---- Ghost and Magic: physical passes through, magic and fire don't; no Bleed
{ const {e, P} = mk(); e.debugSpawnCard(P, so, 1, 'k4-ghost', 'left', {}, []); e.debugSpawnCard(P, so, 2, 'k4-hit', 'left', {}, []);
  const G = byDef(P[1], 'k4-ghost'); e.debugAttack(P, so, byDef(P[2], 'k4-hit').uid, {}, []); ok(G.hp === 20, `a physical hit does nothing to a Ghost (${G.hp})`);
  e.damageCardFlat(G, 3, 'physical'); ok(G.hp === 20, 'physical arrows pass through too');
  // 2026-10-14 second pass (user: "those creatures that deal elemental damage physically, deal half. Only magic damage deals equal")
  e.damageCardFlat(G, 3, 'heat'); ok(G.hp === 18, `fire burns it for half: 1.5 lands as 2 (FX2, 2026-10-22: one rounding, half up) (${G.hp}, want 18)`); }
{ const {e, P} = mk(); e.debugSpawnCard(P, so, 1, 'k4-ghost', 'left', {}, []); e.debugSpawnCard(P, so, 2, 'k4-magic', 'left', {}, []);
  const G = byDef(P[1], 'k4-ghost'), ev = []; e.debugAttack(P, so, byDef(P[2], 'k4-magic').uid, {}, ev);
  ok(G.hp === 16, `a Magic attack hurts a Ghost (${G.hp})`); ok(ev.some(x=> x.type==='hit' && x.dmgType==='magic'), 'the hit is logged as magic damage'); }
{ const {e, P} = mk(); e.debugSpawnCard(P, so, 1, 'k4-ghost', 'left', {}, []); e.debugSpawnCard(P, so, 2, 'k4-bleed', 'left', {}, []);
  e.debugAttack(P, so, byDef(P[2], 'k4-bleed').uid, {}, []); ok(!(byDef(P[1], 'k4-ghost').bleed > 0), 'a Ghost takes no Bleed'); }
// ---- Ichor 2: the attacker takes 2 acid, loses 1 Armor, and Bleeds 1 even as a Ghost
{ const {e, P} = mk(); e.debugSpawnCard(P, so, 1, 'k4-ichor', 'left', {}, []); e.debugSpawnCard(P, so, 2, 'k4-gharm', 'left', {}, []);
  const I = byDef(P[1], 'k4-ichor'), G = byDef(P[2], 'k4-gharm'), ev = [];
  e.debugAttack(P, so, G.uid, {}, ev);
  ok(I.hp === 49, `the Ghost's hit lands on the Ichor unit... (${I.hp})`);
  ok(G.hp === 19, `...but the splash burns it for 2 acid, halved on a Ghost (2026-10-14) (${G.hp})`);
  ok(G.armorLoss === 1, `and strips 1 Armor (${G.armorLoss})`);
  ok(G.bleed === 1, `and the Ghost bleeds 1 (${G.bleed})`);
  ok(ev.some(x=> x.type==='statusFx' && x.kind==='ichor'), 'the splash is logged');
  e.debugAttack(P, so, G.uid, {}, []); ok(G.hp === 17, `its next attack bleeds it 1 (Bleed stays whole), then the splash again 1 (${G.hp}, want 17)`); }
// ---- Irradiated 2 (reworked 2026-10-14, user: "Irradiation tokens - Irradiated ..."): every upkeep it gives 2 Irradiation tokens to
// the units beside it and the enemy facing it, and 1 to itself; a 'radiation' Resist halves them. The tokens then each take a point and
// drop by 1 (see keywords-2026-10-14b.js for the token rules).
{ const {e, P} = mk(); e.debugSpawnCard(P, so, 1, 'k4-irr', 'left', {}, []); e.debugSpawnCard(P, so, 1, 'k4-mid', 'left', {}, []); e.debugSpawnCard(P, so, 1, 'k4-wall', 'right', {}, []);
  e.debugSpawnCard(P, so, 2, 'k4-radres', 'left', {}, []); e.debugSpawnCard(P, so, 2, 'k4-wall', 'left', {}, []); e.debugSpawnCard(P, so, 2, 'k4-wall', 'right', {}, []);
  const I = byDef(P[1], 'k4-irr'), M = byDef(P[1], 'k4-mid'), R = byDef(P[2], 'k4-radres'), ev = [];
  e.roundStart(P, 2, so, {}, ev);
  const got = uid=> ev.filter(x=> x.type==='fieldTick' && x.field==='irradiated' && x.uid===uid).reduce((t, x)=> t + x.tokens, 0);
  ok(got(I.uid) === 1, `it gives itself 1 token (${got(I.uid)})`);
  ok(got(M.uid) === 2, `the ally beside it gets 2 (${got(M.uid)})`);
  ok(got(R.uid) === 1, `the enemy facing it resists radiation: 1 (${got(R.uid)})`);
  ok(M.irradiation === 1 && I.irradiation === 0 && R.irradiation === 0, `each unit's tokens took their points and dropped by 1 (${M.irradiation}, ${I.irradiation}, ${R.irradiation})`);
  const W1 = all(P[1]).find(c=> c.defId==='k4-wall'); ok(got(W1.uid) === 2, `the ally on its other side gets 2 too (${got(W1.uid)})`);
  const pts = ev.filter(x=> x.type==='irradiation'); ok(pts.length === 4 && pts.find(x=> x.uid===M.uid).points.length === 2 && pts.find(x=> x.uid===I.uid).points.length === 1, `two points on each neighbour, one on itself and the resistant foe (${pts.length})`);
  e.roundStart(P, 3, so, {}, []); ok(M.irradiation === 2, `next upkeep: 1 left + 2 more, then -1 (${M.irradiation})`); }
{ const {e, P} = mk(); e.debugSpawnCard(P, so, 1, 'k4-irr', 'left', {}, []); e.debugSpawnCard(P, so, 2, 'k4-frail', 'left', {}, []);
  for(let r = 2; r < 8 && byDef(P[2], 'k4-frail'); r++) e.roundStart(P, r, so, {}, []); ok(!byDef(P[2], 'k4-frail'), 'a frail unit can wither to death'); }
// ---- Volcano hazards
const lone = (rules, seed)=>{ const m = mk(seed || 7, rules); m.e.debugSpawnCard(m.P, so, 1, 'k4-wall', 'left', {}, []); m.e.debugSpawnCard(m.P, so, 2, 'k4-wall', 'left', {}, []); return m; };
{ const {e, P} = lone({lavaTideChance:100, petrifyChance:0, eruptionChance:0}); const ev = []; e.roundStart(P, 2, so, {}, ev);
  const lt = ev.filter(x=> x.type==='fieldTick' && x.field==='lavaTide');
  ok(lt.length === 2 && all(P[1])[0].hp === 499 && all(P[2])[0].hp === 499, `Lava Tide at 100%: the column's units take 1 (FX2; was 3) (${lt.length}, ${all(P[1])[0].hp})`);
  ok(!ev.some(x=> x.field==='petrify' || x.field==='eruption'), 'the other hazards at 0% never fire'); }
{ const {e, P} = mk(7, {lavaTideChance:100}); e.debugSpawnCard(P, so, 1, 'k4-fly', 'left', {}, []); e.debugSpawnCard(P, so, 2, 'k4-hot', 'left', {}, []);
  e.roundStart(P, 2, so, {}, []); ok(all(P[1])[0].hp === 20, 'a Flyer is above the lava'); ok(all(P[2])[0].hp === 19, `heat-proof halves it (${all(P[2])[0].hp})`); }
{ const {e, P} = mk(7, {petrifyChance:100}); e.debugSpawnCard(P, so, 1, 'k4-hit', 'left', {}, []); e.debugSpawnCard(P, so, 2, 'k4-wall', 'left', {}, []);
  const ev = []; e.roundStart(P, 2, so, {}, ev); const A = all(P[1])[0], W = all(P[2])[0];
  ok(A.petrified && W.petrified && ev.filter(x=> x.field==='petrify').length === 2, 'Petrification at 100%: one unit a side turns to stone');
  e.resolveCombat(P, so, {}, [], 1); ok(W.hp === 500, `a stone unit can't attack (${W.hp})`);
  const hp = A.hp; e.damageCard(A, 5, 'physical', null); ok(hp - A.hp === 3, `and takes half damage: 2.5 lands as 3 (FX2) (${hp - A.hp})`);
  e.roundStart(P, 3, so, {}, []); ok(A.petrified, 'still 100%: petrified again');
  const m2 = lone({petrifyChance:0}); m2.e.roundStart(m2.P, 2, so, {}, []); ok(!all(m2.P[1])[0].petrified, 'at 0% nothing turns to stone'); }
{ const {e, P} = lone({eruptionChance:100, eruption:3}); const ev = []; e.roundStart(P, 2, so, {}, ev);
  ok(ev.filter(x=> x.field==='eruption').length === 2 && all(P[1])[0].hp === 497, 'Eruption at 100% with rules.eruption 3: 3 to one unit a side');
  const m2 = lone({eruptionChance:100}); m2.e.roundStart(m2.P, 2, so, {}, []); ok(all(m2.P[1])[0].hp === 499, 'with no rules.eruption it is 1 (FX2; was 2)'); }
{ const {e, P} = lone({lavaTideChance:0, petrifyChance:0, eruptionChance:0, eruption:5}); let n = 0;
  for(let r = 2; r < 12; r++){ const ev = []; e.roundStart(P, r, so, {}, ev); n += ev.filter(x=> x.type==='fieldTick').length; }
  ok(n === 0 && all(P[1])[0].hp === 500, `every hazard at 0%: nothing ever happens, even with rules.eruption set (${n})`); }
{ const {e} = mk(7, {volcano:'verylow'}); const c = e.volcanoChances(2); ok(c.lavaTide === 1 && c.petrify === 2 && c.eruption === 3, 'Very low is 1/2/3');
  const h = mk(7, {volcano:'high'}).e.volcanoChances(9); ok(h.lavaTide === 60 && h.petrify === 65 && h.eruption === 70, 'High is 60/65/70');
  const ev2 = mk(7, {volcano:'even'}).e; ok(ev2.volcanoChances(2).lavaTide === 45 && ev2.volcanoChances(5).eruption === 61, `'even' climbs 2 a round after round 2 (${ev2.volcanoChances(5).eruption})`);
  const mo = mk(7, {volcano:'medium', petrifyChance:90}).e.volcanoChances(3); ok(mo.lavaTide === 20 && mo.petrify === 90, 'a per-hazard chance overrides the level');
  ok(mk(7, {eruption:2}).e.volcanoChances(3) === null, 'no volcano level: no odds');
  const lo = lone({volcano:'low'}); lo.e.roundStart(lo.P, 2, so, {}, []); const f = lo.e.forecast(); ok(f.volcano && f.volcano.lavaTide === 10 && f.eruption == null, 'the forecast carries the odds'); }
{ // a 'high' volcano is random but seeded: the same seed gives the same fight, and something does happen over ten rounds
  const run = ()=>{ const {e, P} = lone({volcano:'high'}, 11); const out = []; for(let r = 2; r < 12; r++){ const ev = []; e.roundStart(P, r, so, {}, ev); ev.filter(x=> x.type==='fieldTick').forEach(x=> out.push(r + x.field)); } return out.join(','); };
  const a = run(); ok(a && a === run(), `a high volcano is deterministic (${a.slice(0, 60)})`); }
// ---- The old rules.eruption N: from round 2, every round, one unit a side takes N. Renamed Scorched Ground 2026-10-14 (its
// events say field 'scorched' now; the volcano's Eruption hazard keeps 'eruption').
{ const {e, P} = lone({eruption:2}); let per = [];
  for(let r = 1; r < 6; r++){ const ev = []; if(r > 1) e.roundStart(P, r, so, {}, ev); per.push(ev.filter(x=> x.field==='scorched' && x.dmg===2).length); }
  ok(per.join() === '0,2,2,2,2', `Scorched Ground: 2 a round from round 2 (${per})`);
  ok(e.forecast().eruption === 2 && !e.forecast().volcano, 'and the forecast still says Eruption 2'); }
// ---- Comets after an Eruption (2026-10-14, user: "After eruption, the cycle resets, but for the next 3 turns, comets rain down,
// dealing 2-5 (random) fire damage to each unit. The damage dealt to each unit is random.")
{ const R = {lavaTideChance:0, petrifyChance:0, eruptionChance:100}; const {e, P} = mk(13, R);
  ['k4-wall', 'k4-wall', 'k4-hot'].forEach(id=> e.debugSpawnCard(P, so, 1, id, 'left', {}, [])); ['k4-wall', 'k4-wall'].forEach(id=> e.debugSpawnCard(P, so, 2, id, 'left', {}, []));
  const ev2 = []; e.roundStart(P, 2, so, {}, ev2);
  ok(ev2.some(x=> x.field==='eruptionReset') && !ev2.some(x=> x.field==='comet'), 'the Eruption fires and resets; no comets on its own round');
  R.eruptionChance = 0; // no more eruptions, so the three comet rounds can be counted
  ok(e.forecast().comets === 3, `the forecast says 3 comet rounds to come (${e.forecast().comets})`);
  const per = [], rolls = [];
  for(let r = 3; r < 8; r++){ const ev = []; e.roundStart(P, r, so, {}, ev); const cs = ev.filter(x=> x.type==='fieldTick' && x.field==='comet'); per.push(cs.length); cs.forEach(x=> rolls.push(x)); }
  ok(per.join() === '5,5,5,0,0', `comets strike all 5 units for 3 rounds, then stop (${per})`);
  const plain = rolls.filter(x=> x.defId==='k4-wall'), hot = rolls.filter(x=> x.defId==='k4-hot');
  ok(plain.length > 0 && plain.every(x=> x.roll === 1 && x.dmg === 1), `each comet deals 1 to a plain unit (FX2; was a random 2–5) (${plain.map(x=> x.dmg)})`);
  ok(new Set(plain.map(x=> x.dmg)).size === 1, 'every unit takes the same 1 (FX2: the random 2–5 is gone)');
  ok(hot.length === 3 && hot.every(x=> x.dmg === Math.max(1, Math.floor(x.roll / 2))), `a fire-resistant unit takes half (${hot.map(x=> x.roll + '→' + x.dmg)})`);
  const run = ()=>{ const m = mk(13, {lavaTideChance:0, petrifyChance:0, eruptionChance:100}); m.e.debugSpawnCard(m.P, so, 1, 'k4-wall', 'left', {}, []); m.e.debugSpawnCard(m.P, so, 2, 'k4-wall', 'left', {}, []);
    const out = []; for(let r = 2; r < 6; r++){ const ev = []; m.e.roundStart(m.P, r, so, {}, ev); ev.filter(x=> x.field==='comet').forEach(x=> out.push(x.dmg)); } return out.join(); };
  ok(run() === run(), 'the comets are seeded: the same fight rolls the same damage'); }
{ // the cycle resets: a rising ('even') volcano climbs again from its base after an Eruption
  const R = {volcano:'even', lavaTideChance:0, petrifyChance:0}; const {e, P} = lone(R);
  ok(e.volcanoChances(6).eruption === 63, `before an Eruption the odds keep rising (${e.volcanoChances(6).eruption})`);
  R.eruptionChance = 100; e.roundStart(P, 5, so, {}, []); delete R.eruptionChance;
  ok(e.volcanoChances(6).eruption === 55 && e.volcanoChances(8).eruption === 59, `after it, back to the base 55 and rising again (${e.volcanoChances(6).eruption}, ${e.volcanoChances(8).eruption})`); }
console.log(fail ? `keywords-2026-10-14: ${fail} failure(s)` : 'keywords-2026-10-14: all passed');
process.exit(fail ? 1 : 0);
