#!/usr/bin/env node
// 2026-10-12 (the 00:30 list): the Boomerang's flight home (whiff, castle to and fro, friendly fire when the thrower is gone),
// 0-Attack units re-checked through the round (a Flow tide or a buff lets them swing), Swimmer's Flow list, and Fork prongs
// measured from where the attacker stands (never an enemy 1.5 slots away after the ranks shift).
'use strict';
const H = require('./lib/harness.js');
const E = H.Engine;
let fail = 0; const ok = (c, m)=>{ if(!c){ fail++; console.log('  ✗', m); } };
const so = id=> id===1 ? 'A' : 'B';
const defs = Object.assign({}, H.loadCardDefs(), {
  'n-boom':  {id:'n-boom', name:'Boom', attack:3, health:20, wait:0, cost:0, effects:{boomerang:true}},
  'n-boom2': {id:'n-boom2', name:'Boom2', attack:1, health:20, wait:0, cost:0, effects:{boomerang:true}},
  'n-wall':  {id:'n-wall', name:'Wall', attack:0, health:500, wait:0, cost:0, effects:{}},
  'n-wallr': {id:'n-wallr', name:'WallR', attack:0, health:500, wait:5, cost:0, effects:{}},
  'n-frail': {id:'n-frail', name:'Frail', attack:0, health:2, wait:9, cost:0, effects:{}},
  'n-polyp': {id:'n-polyp', name:'Polyp', attack:0, health:20, wait:0, cost:0, effects:{tide:true}},
  'n-swimg': {id:'n-swimg', name:'SwimG', attack:2, health:20, wait:0, cost:0, effects:{swimmer:'evade', swimmerGrant:{armor:3}}},
  'n-fork':  {id:'n-fork', name:'Fork', attack:2, health:50, wait:0, cost:0, effects:{fork:true}},
  'n-daunt': {id:'n-daunt', name:'Daunter', attack:1, health:100, wait:0, cost:0, effects:{daunt:2}},
  'n-recoil':{id:'n-recoil', name:'Recoiler', attack:3, health:20, wait:0, cost:0, effects:{recoil:2}},
  'n-pois':  {id:'n-pois', name:'Poisoner', attack:1, health:100, wait:0, cost:0, effects:{poison:2}},
  'n-plate': {id:'n-plate', name:'Plate', attack:0, health:100, wait:0, cost:0, effects:{armor:5}},
  'n-hit5':  {id:'n-hit5', name:'Hit5', attack:5, health:100, wait:0, cost:0, effects:{}},
});
const all = pl=> [...pl.row.left, ...pl.row.center, ...pl.row.right];
function mk(mode, seed){ const e = E.makeSimEngine(defs, E.mulberry32(seed||5), {recordEvents:true, battleMode:mode||'open'}); e.startTide && e.startTide(); /* the tide waits for a Tide card since 2026-10-13; these checks start it */ return {e, P:{1:e.newPlayer(1,{}), 2:e.newPlayer(2,{})}}; }
// Boomerang into an empty lane: castle on the way out AND on the way back
{ const {e, P} = mk(); e.debugSpawnCard(P, so, 1, 'n-boom', 'left', {}, []); const hq = P[2].hq.hp;
  e.resolveCombat(P, so, {}, [], 1); ok(hq - P[2].hq.hp === 3 && P[1].boomerangs.length === 1, `the throw hits the castle (${hq - P[2].hq.hp}) and the boomerang is out`);
  const hq2 = P[2].hq.hp; const ev = []; e.resolveCombat(P, so, {}, ev, 1);
  ok(hq2 - P[2].hq.hp === 3, `it hits the castle again on the way back, and that is its swing (${hq2 - P[2].hq.hp})`);
  ok(ev.some(x=> x.type === 'boomerangReturn'), 'a boomerangReturn event'); }
// Throw at a unit that dies before it comes back: a whiff, not the castle
{ const {e, P} = mk(); e.debugSpawnCard(P, so, 1, 'n-boom', 'left', {}, []); e.debugSpawnCard(P, so, 2, 'n-frail', 'left', {}, []);
  const F = all(P[2])[0]; e.resolveCombat(P, so, {}, [], 1); ok(F.hp <= 0 || !all(P[2]).includes(F), 'the throw kills the frail unit');
  const hq = P[2].hq.hp, ev = []; e.resolveCombat(P, so, {}, ev, 1);
  ok(P[2].hq.hp === hq && ev.some(x=> x.type === 'boomerangWhiff'), `the way back is a whiff, the castle untouched (${hq - P[2].hq.hp})`); }
// The thrower dies: the boomerang still hits the enemy, then an ally in its lane without Boomerang takes it home
{ const {e, P} = mk(); e.debugSpawnCard(P, so, 1, 'n-boom', 'left', {}, []); e.debugSpawnCard(P, so, 2, 'n-wallr', 'left', {}, []);
  const B = all(P[1])[0], W = all(P[2])[0]; e.resolveCombat(P, so, {}, [], 1); const w0 = W.hp;
  B.hp = 0; e.removeDeadCards(P, so, {}, {}, []); e.debugSpawnCard(P, so, 1, 'n-wall', 'left', {}, []); const A = all(P[1])[0], a0 = A.hp;
  e.resolveCombat(P, so, {}, [], 1);
  ok(w0 - W.hp === 3, `the orphan boomerang still hits the enemy in its lane (${w0 - W.hp})`);
  ok(a0 - A.hp === 3, `…and the new ally in the lane takes it on the way home (${a0 - A.hp})`); }
// The thrower dies and its lane is empty: your own castle takes it
{ const {e, P} = mk(); e.debugSpawnCard(P, so, 1, 'n-boom', 'left', {}, []); e.resolveCombat(P, so, {}, [], 1);
  all(P[1])[0].hp = 0; e.removeDeadCards(P, so, {}, {}, []); const mine = P[1].hq.hp, theirs = P[2].hq.hp; e.resolveCombat(P, so, {}, [], 1);
  ok(theirs - P[2].hq.hp === 3 && mine - P[1].hq.hp === 3, `castle there and back: theirs -${theirs - P[2].hq.hp}, yours -${mine - P[1].hq.hp}`); }
// 09:11 rules: the way back looks for the SAME target; a newcomer in the lane is not hit, it's a whiff
{ const {e, P} = mk(); e.debugSpawnCard(P, so, 1, 'n-boom', 'left', {}, []); e.debugSpawnCard(P, so, 2, 'n-frail', 'left', {}, []);
  e.resolveCombat(P, so, {}, [], 1); e.removeDeadCards(P, so, {}, {}, []);
  e.debugSpawnCard(P, so, 2, 'n-wallr', 'left', {}, []); const N = all(P[2]).find(c=> c.defId === 'n-wallr'), n0 = N.hp, ev = [];
  e.resolveCombat(P, so, {}, ev, 1);
  ok(n0 - N.hp === 0 && ev.some(x=> x.type === 'boomerangWhiff'), `a newcomer in the lane isn't the boomerang's target: whiff (${n0 - N.hp})`); }
// the thrower is gone and a Boomerang ally stands in its lane: caught, no harm
{ const {e, P} = mk(); e.debugSpawnCard(P, so, 1, 'n-boom', 'left', {}, []); e.resolveCombat(P, so, {}, [], 1);
  all(P[1])[0].hp = 0; e.removeDeadCards(P, so, {}, {}, []); e.debugSpawnCard(P, so, 1, 'n-boom2', 'left', {}, []); const A = all(P[1])[0], a0 = A.hp, mine = P[1].hq.hp, ev = [];
  e.resolveCombat(P, so, {}, ev, 2);
  ok(A.hp === a0 && P[1].hq.hp === mine && ev.some(x=> x.type === 'boomerangCaught' && x.uid === A.uid), 'a Boomerang ally catches an orphan boomerang unharmed'); }
// Daunt: each hit takes N Attack off the target until the end of the next round; marks stack while both are live
{ const {e, P} = mk(); e.debugSpawnCard(P, so, 1, 'n-daunt', 'left', {}, []); e.debugSpawnCard(P, so, 2, 'n-hit5', 'left', {}, []);
  const T = all(P[2])[0], D = all(P[1])[0]; let d0 = D.hp; e.resolveCombat(P, so, {}, [], 1); const r1 = d0 - D.hp;
  d0 = D.hp; e.resolveCombat(P, so, {}, [], 1); const r2 = d0 - D.hp;
  ok(r1 === 3 && r2 === 1, `5-Attack unit, daunted 2 then 2+2: hits for ${r1} then ${r2} (want 3 then 1)`);
  ok((T.daunts||[]).length === 1, `the first mark lifts at the end of the round after it landed (${(T.daunts||[]).length} left)`); }
// Recoil: every swing hurts itself
{ const {e, P} = mk(); e.debugSpawnCard(P, so, 1, 'n-recoil', 'left', {}, []); const R = all(P[1])[0], r0 = R.hp, hq = P[2].hq.hp;
  e.resolveCombat(P, so, {}, [], 1); ok(r0 - R.hp === 2 && hq - P[2].hq.hp === 3, `Recoil 2: the swing lands for 3 and costs it 2 (${r0 - R.hp})`); }
// 0 Attack: an Ocean unit swings on Flow (+1), and stays out of it on Ebb
{ const {e, P} = mk(); e.debugSpawnCard(P, so, 1, 'n-polyp', 'left', {}, []); e.roundStart(P, 1, so, {}, []);
  const t = e.getTide(); const hq = P[2].hq.hp; e.resolveCombat(P, so, {}, [], 1);
  ok(t === 'flow' ? hq - P[2].hq.hp === 1 : P[2].hq.hp === hq, `a 0-Attack Ocean unit hits for 1 on Flow only (${t}, ${hq - P[2].hq.hp})`); }
// Swimmer's Flow list: grants armour on Flow, no Fast Forward when the list doesn't name it
{ const {e, P} = mk(); e.debugSpawnCard(P, so, 1, 'n-swimg', 'left', {}, []); e.roundStart(P, 2, so, {}, []);
  const hq = P[2].hq.hp; e.resolveCombat(P, so, {}, [], 1); const S = all(P[1])[0];
  ok(e.getTide() === 'flow' && (defs[S.defId] || e.derivedDefs[S.defId] || {effects:{}}).effects.armor === 3, `on Flow the Swimmer gets its list (armor ${((defs[S.defId] || e.derivedDefs[S.defId] || {}).effects||{}).armor})`);
  ok(hq - P[2].hq.hp === 2, `…and swings once, no Fast Forward (${hq - P[2].hq.hp})`); }
// Fork after the ranks shift (collapse mode): 3 enemies vs 2 of mine — a straddling Fork hits the two it stands between
{ let far = 0;
  for(let s = 1; s < 25; s++){ const {e, P} = mk('collapse', s);
    ['left','left','right'].forEach(side=> e.debugSpawnCard(P, so, 2, 'n-wall', side, {}, []));
    e.debugSpawnCard(P, so, 1, 'n-fork', 'left', {}, []); e.debugSpawnCard(P, so, 1, 'n-wall', 'right', {}, []);
    const ws = all(P[2]), b = ws.map(c=> c.hp), F = all(P[1]).find(c=> c.defId === 'n-fork');
    e.debugAttack(P, so, F.uid, {}, []);
    const hitIdx = ws.map((c, i)=> b[i] > c.hp ? i : -1).filter(i=> i >= 0);
    if(hitIdx.length === 2 && Math.abs(hitIdx[0] - hitIdx[1]) > 1) far++; }
  ok(far === 0, `a straddling Fork never hits two enemies two slots apart (${far} times)`); }
// Reserve rows (raids as a full game, 3 rows a side): a card goes behind a front unit, doesn't fight, and steps up when the
// column in front of it clears
{ const e = E.makeSimEngine(defs, E.mulberry32(9), {recordEvents:true, battleMode:'open', reserveRows:2}); e.startTide && e.startTide(); /* the tide waits for a Tide card since 2026-10-13; these checks start it */ const P = {1:e.newPlayer(1,{}), 2:e.newPlayer(2,{})};
  e.debugSpawnCard(P, so, 1, 'n-frail', 'left', {}, []); const F = all(P[1])[0];
  ok(e.legalReserveSlots(P[1], 1).includes(F.slot) && !e.legalReserveSlots(P[1], 2).length, 'a reserve slot opens behind a front unit only');
  const h = {uid: 77001, defId:'n-boom'}; P[1].hand.push(h);
  ok(e.placeCard(P, so, 1, h.uid, F.slot, {}, [], {reserve:1}), 'a card can be placed in the middle row');
  ok(P[1].reserve[0][F.slot] && !all(P[1]).some(c=> c.defId==='n-boom'), 'it waits in reserve, not on the field');
  const hq = P[2].hq.hp; e.resolveCombat(P, so, {}, [], 1); ok(P[2].hq.hp === hq, 'a reserve never attacks');
  F.hp = 0; e.removeDeadCards(P, so, {}, {}, []); const ev = []; e.roundStart(P, 2, so, {}, ev);
  ok(all(P[1]).some(c=> c.defId==='n-boom' && c.slot===F.slot) && ev.some(x=> x.type==='advance'), 'with the front unit gone it steps up at the round start');
  ok(e.fillReserve(P[2], 2, 0, 'n-wall') && !e.fillReserve(P[2], 2, 0, 'n-wall'), 'a boss row can be filled, one card a slot'); }
// 09:58: poison needs damage through: a 1-Attack poisoner into 5 Armor poisons nothing; into a bare wall it does
{ const {e, P} = mk(); e.debugSpawnCard(P, so, 1, 'n-pois', 'left', {}, []); e.debugSpawnCard(P, so, 2, 'n-plate', 'left', {}, []);
  e.resolveCombat(P, so, {}, [], 1); const t = all(P[2])[0]; ok(!(t.poison > 0), `no poison through full armour (poison ${t.poison}, hp ${t.hp})`); }
{ const {e, P} = mk(); e.debugSpawnCard(P, so, 1, 'n-pois', 'left', {}, []); e.debugSpawnCard(P, so, 2, 'n-wall', 'left', {}, []);
  e.resolveCombat(P, so, {}, [], 1); const t = all(P[2])[0]; ok(t.poison > 0, `poison lands when damage gets through (poison ${t.poison})`); }
if(fail){ console.log(`night-2026-10-12: ${fail} failure(s)`); process.exit(1); }
console.log('night-2026-10-12: 0 failure(s)');
