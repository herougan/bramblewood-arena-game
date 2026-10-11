#!/usr/bin/env node
// 2026-10-12 (the 22:40 list): Fork prongs miss independently, Shell N (armour + temporary Health on any hit, no attack while
// shelled), Rage doubles against castles, Swimmer (Flow) and Tailwind (Flyers) speed, Inspiring N, Friction N, Worthy N,
// Lumberjack, Heavy Metal, Timber / Rock-solid / Iron-will, Loyal / Usurper (with a granted skill), Stone/Metal/Uranium costs.
'use strict';
const H = require('./lib/harness.js');
const E = H.Engine;
let fail = 0; const ok = (c, m)=>{ if(!c){ fail++; console.log('  ✗', m); } };
const so = id=> id===1 ? 'A' : 'B';
const defs = Object.assign({}, H.loadCardDefs(), {
  'k2-hit':   {id:'k2-hit', name:'Hit', attack:5, health:50, wait:0, cost:0, effects:{}},
  'k2-wall':  {id:'k2-wall', name:'Wall', attack:0, health:500, wait:0, cost:0, effects:{}},
  'k2-fork':  {id:'k2-fork', name:'Fork', attack:3, health:50, wait:0, cost:0, effects:{fork:true}},
  'k2-shell': {id:'k2-shell', name:'Shell', attack:4, health:30, wait:0, cost:0, effects:{shell:3}},
  'k2-rage':  {id:'k2-rage', name:'Rage', attack:4, health:20, wait:0, cost:0, effects:{rage:true}},
  'k2-swim':  {id:'k2-swim', name:'Swim', attack:2, health:50, wait:0, cost:0, effects:{swimmer:true}},
  'k2-fly':   {id:'k2-fly', name:'Fly', attack:2, health:50, wait:0, cost:0, effects:{flying:true}},
  'k2-insp':  {id:'k2-insp', name:'Insp', attack:1, health:50, wait:0, cost:0, effects:{inspiring:2}},
  'k2-fric':  {id:'k2-fric', name:'Fric', attack:1, health:50, wait:0, cost:0, effects:{friction:2}},
  'k2-worthy':{id:'k2-worthy', name:'Worthy', attack:1, health:5, wait:0, cost:0, effects:{worthy:2}},
  'k2-jack':  {id:'k2-jack', name:'Jack', attack:0, health:50, wait:0, cost:0, effects:{lumberjack:true}},
  'k2-metal': {id:'k2-metal', name:'Smith', attack:0, health:50, wait:0, cost:0, effects:{heavyMetal:true}},
  'k2-timber':{id:'k2-timber', name:'Timber', attack:1, health:10, wait:0, cost:0, effects:{timber:true}},
  'k2-rock':  {id:'k2-rock', name:'Rock', attack:1, health:10, wait:0, cost:0, effects:{rockSolid:true}},
  'k2-iron':  {id:'k2-iron', name:'Iron', attack:1, health:10, wait:0, cost:0, effects:{ironWill:true}},
  'k2-loyal': {id:'k2-loyal', name:'Loyal', attack:1, health:10, wait:0, cost:0, effects:{loyal:[2,3], loyalGrant:{armor:2}}},
  'k2-usurp': {id:'k2-usurp', name:'Usurp', attack:1, health:10, wait:0, cost:0, effects:{usurper:[4,0]}},
  'k2-lead':  {id:'k2-lead', name:'Lead', attack:1, health:10, wait:0, cost:0, effects:{leader:true}},
  'k2-mal':   {id:'k2-mal', name:'Malachite', attack:8, health:30, wait:0, cost:0, stoneCost:1, effects:{}},
  'k2-uran':  {id:'k2-uran', name:'Glow', attack:8, health:30, wait:0, cost:0, uraniumCost:2, effects:{}},
  'k2-trident': {id:'k2-trident', name:'Trident', attack:3, health:50, wait:0, cost:0, effects:{trident:true}},
  'k2-pitch': {id:'k2-pitch', name:'Pitch', attack:3, health:50, wait:0, cost:0, effects:{pitchfork:true}},
  'k2-octo':  {id:'k2-octo', name:'Octo', attack:2, health:50, wait:0, cost:0, effects:{octolash:true}},
  'k2-armor': {id:'k2-armor', name:'Armor', attack:0, health:500, wait:0, cost:0, effects:{armor:2}},
  'k2-quick': {id:'k2-quick', name:'Quick', attack:2, health:50, wait:0, cost:0, effects:{quick:true}},
  'k2-rainmk': {id:'k2-rainmk', name:'RainMk', attack:0, health:10, wait:0, cost:0, effects:{rainmaker:3}},
  'k2-rainrun': {id:'k2-rainrun', name:'RainRun', attack:2, health:10, wait:0, cost:0, effects:{rainrunner:2}},
  'k2-moon': {id:'k2-moon', name:'Moon', attack:1, health:10, wait:0, cost:0, effects:{moonborn:4}},
  'k2-tundra': {id:'k2-tundra', name:'Tundra', attack:0, health:50, wait:5, cost:0, archetypes:['Tundra'], effects:{}},
  'k2-tail':  {id:'k2-tail', name:'Tailwind', attack:0, health:0, wait:0, cost:0, cardType:'spell', spell:{do:'tailwind', amount:1}, effects:{}},
});
const all = pl=> [...pl.row.left, ...pl.row.center, ...pl.row.right];
function mk(seed){ const e = E.makeSimEngine(defs, E.mulberry32(seed||5), {recordEvents:true, battleMode:'open'}); return {e, P:{1:e.newPlayer(1,{}), 2:e.newPlayer(2,{})}}; }
const give = (P, pid, id)=>{ const h = {uid: 90000 + Math.floor(Math.random()*9999), defId:id}; P[pid].hand.push(h); return h; };
// Fork: a blind Fork rolls each prong on its own (over many tries, sometimes exactly one prong lands)
{ let one = 0;
  for(let s=1; s<40; s++){ const {e, P} = mk(s); e.debugSpawnCard(P, so, 2, 'k2-wall', 'left', {}, []); e.debugSpawnCard(P, so, 2, 'k2-wall', 'right', {}, []); e.debugSpawnCard(P, so, 2, 'k2-wall', 'left', {}, []);
    e.debugSpawnCard(P, so, 1, 'k2-fork', 'left', {}, []); const F = all(P[1])[0]; F.blind = 5; const ws = all(P[2]); const b = ws.map(c=> c.hp), hq = P[2].hq.hp;
    e.debugAttack(P, so, F.uid, {}, []); const hits = ws.filter((c, i)=> c.hp < b[i]).length + (P[2].hq.hp < hq ? 1 : 0); if(hits === 1) one++; }
  ok(one > 0, `a blind Fork can still land one prong (${one} of 39)`); }
// Shell: an arrow-type flat hit raises it; armour + temp Health soak; it skips its attack; it drops at the next round's end
{ const {e, P} = mk(); e.debugSpawnCard(P, so, 1, 'k2-shell', 'left', {}, []); e.debugSpawnCard(P, so, 2, 'k2-hit', 'left', {}, []);
  const S = all(P[1])[0], hq = P[2].hq.hp; e.damageCardFlat(S, 1, 'physical', 'k2-hit');
  ok(S.shellUntil != null && S.shellArmor === 3 && S.tempHp === 3, `a flat (arrow) hit raises the shell (armour ${S.shellArmor}, temp ${S.tempHp})`);
  const hp = S.hp; const r = e.damageCard(S, 5, 'physical', all(P[2])[0]); ok(hp - S.hp === 0 && S.tempHp === 1, `5 damage: 3 armour, then 2 temp Health (hp ${hp}→${S.hp}, temp ${S.tempHp})`);
  all(P[2])[0].hp = 0; e.removeDeadCards(P, so, {}, {}, []);
  e.resolveCombat(P, so, {}, [], 1); ok(P[2].hq.hp === hq && S.shellUntil != null, 'a shelled unit does not attack, and is still shelled after this round');
  e.resolveCombat(P, so, {}, [], 1); ok(S.shellUntil == null && S.tempHp === 0 && S.shellArmor === 0, 'the shell drops at the end of the next round'); }
{ const {e, P} = mk(); e.debugSpawnCard(P, so, 1, 'k2-shell', 'left', {}, []); const hq = P[2].hq.hp; e.resolveCombat(P, so, {}, [], 1);
  ok(P[2].hq.hp < hq, 'an unhit Shell unit attacks as normal'); }
// Rage doubles against the castle
{ const {e, P} = mk(); e.debugSpawnCard(P, so, 1, 'k2-rage', 'left', {}, []); const R = all(P[1])[0]; R.hp = 5; const hq = P[2].hq.hp;
  e.debugAttack(P, so, R.uid, {}, []); ok(hq - P[2].hq.hp === 8, `a raging unit hits the castle for double (${hq - P[2].hq.hp}, want 8)`); }
// Swimmer: an extra turn on Flow
{ const {e, P} = mk(); e.debugSpawnCard(P, so, 1, 'k2-swim', 'left', {}, []); e.roundStart(P, 2, so, {}, []);
  ok(e.getTide() === 'flow', 'round 2 is Flow'); const hq = P[2].hq.hp; const ev = []; e.resolveCombat(P, so, {}, ev, 1);
  ok(hq - P[2].hq.hp === 4, `a Swimmer swings twice on Flow (${hq - P[2].hq.hp}, want 4)`); }
// Tailwind: Flyers get the extra turn
{ const {e, P} = mk(); e.debugSpawnCard(P, so, 1, 'k2-fly', 'left', {}, []); const t = give(P, 1, 'k2-tail'); ok(e.placeCard(P, so, 1, t.uid, 'left', {}, []), 'Tailwind is cast');
  const hq = P[2].hq.hp; e.resolveCombat(P, so, {}, [], 1); ok(hq - P[2].hq.hp === 4, `a Flyer swings twice under a Tailwind (${hq - P[2].hq.hp}, want 4)`); }
// Inspiring 2: the ally beside it hits for +2 on its next swing
{ const {e, P} = mk(); e.debugSpawnCard(P, so, 1, 'k2-insp', 'left', {}, []); e.debugSpawnCard(P, so, 1, 'k2-hit', 'right', {}, []);
  const [I, A] = all(P[1]); e.debugAttack(P, so, I.uid, {}, []); ok(A.inspired === 2, `the neighbour is Inspired (+${A.inspired})`);
  const hq = P[2].hq.hp; e.debugAttack(P, so, A.uid, {}, []); ok(hq - P[2].hq.hp === 7 && !A.inspired, `its next swing is +2 and spends it (${hq - P[2].hq.hp})`); }
// Friction 2: hurts the allies beside it when it attacks
{ const {e, P} = mk(); e.debugSpawnCard(P, so, 1, 'k2-fric', 'left', {}, []); e.debugSpawnCard(P, so, 1, 'k2-wall', 'right', {}, []);
  const W = all(P[1]).find(c=> c.defId==='k2-wall'), hp = W.hp; e.debugAttack(P, so, all(P[1]).find(c=> c.defId==='k2-fric').uid, {}, []); ok(hp - W.hp === 2, `Friction 2 hurts the ally beside it (${hp - W.hp})`); }
// Worthy 2 + Lumberjack: +2 (+1 Lumberjack) on arrival; its death gives the other side 1
{ const {e, P} = mk(); e.debugSpawnCard(P, so, 1, 'k2-jack', 'left', {}, []); const l0 = P[1].lumber; const w = give(P, 1, 'k2-worthy'); e.placeCard(P, so, 1, w.uid, 'right', {}, []);
  ok(P[1].lumber - l0 === 3, `Worthy 2 with a Lumberjack gives 3 (${P[1].lumber - l0})`);
  const W = all(P[1]).find(c=> c.defId==='k2-worthy'); W.hp = 0; const f0 = P[2].lumber; e.removeDeadCards(P, so, {}, {}, []); ok(P[2].lumber - f0 === 1, 'its death gives the opponent 1 Lumber'); }
// Heavy Metal + Iron-will / Rock-solid / Timber
{ const {e, P} = mk(); e.debugSpawnCard(P, so, 1, 'k2-metal', 'left', {}, []); e.debugSpawnCard(P, so, 1, 'k2-iron', 'right', {}, []); e.debugSpawnCard(P, so, 1, 'k2-rock', 'right', {}, []); e.debugSpawnCard(P, so, 1, 'k2-timber', 'right', {}, []);
  P[1].lumber = 2; P[1].stone = 1; P[1].metal = 1; e.resolveCombat(P, so, {}, [], 1);
  const g = id=> all(P[1]).find(c=> c.defId===id);
  ok(g('k2-iron').phaseAtk === 3 && g('k2-iron').maxHp === 13, `Iron-will +3/+3 per Metal (${g('k2-iron').phaseAtk}, ${g('k2-iron').maxHp})`);
  ok(g('k2-rock').phaseAtk === 2, `Rock-solid +2/+2 per Stone (${g('k2-rock').phaseAtk})`);
  ok(g('k2-timber').phaseAtk === 2, `Timber +1/+1 per Lumber (${g('k2-timber').phaseAtk})`); }
// Loyal / Usurper
{ const {e, P} = mk(); e.debugSpawnCard(P, so, 1, 'k2-loyal', 'left', {}, []); e.debugSpawnCard(P, so, 2, 'k2-usurp', 'left', {}, []); e.resolveCombat(P, so, {}, [], 1);
  const L = all(P[1])[0], U = all(P[2])[0]; ok(!L.phaseAtk && !U.phaseAtk, 'no leaders: nothing'); e.debugSpawnCard(P, so, 1, 'k2-lead', 'right', {}, []); e.resolveCombat(P, so, {}, [], 1);
  ok(L.phaseAtk === 2 && defs[L.defId].effects.armor === 2, `Loyal: +2 Attack and Armor 2 with its leader out (${L.phaseAtk}, ${L.defId})`);
  ok(U.phaseAtk === 4, `Usurper: +4 Attack facing the enemy leader (${U.phaseAtk})`);
  all(P[1]).find(c=> c.defId==='k2-lead').hp = 0; e.removeDeadCards(P, so, {}, {}, []); e.resolveCombat(P, so, {}, [], 1);
  ok(!L.phaseAtk && L.defId === 'k2-loyal', `the leader falls: Loyal goes quiet (${L.phaseAtk}, ${L.defId})`); }
// Stone and Uranium costs
{ const {e, P} = mk(); const m = give(P, 1, 'k2-mal'); ok(!e.canPlay(P[1], 'k2-mal', m.uid), 'Malachite needs 1 Stone'); P[1].stone = 1;
  ok(e.placeCard(P, so, 1, m.uid, 'left', {}, []) && P[1].stone === 0, 'with 1 Stone it is played and the Stone spent');
  const u = give(P, 2, 'k2-uran'); P[2].uranium = 1; ok(!e.canPlay(P[2], 'k2-uran', u.uid), '2 Uranium needed'); P[2].uranium = 2; ok(e.canPlay(P[2], 'k2-uran', u.uid), 'with 2 Uranium it can be played'); }
// Trident: front + both sides; an empty side goes to the castle
{ const {e, P} = mk(); e.debugSpawnCard(P, so, 1, 'k2-trident', 'left', {}, []); e.debugSpawnCard(P, so, 2, 'k2-wall', 'left', {}, []);
  const W = all(P[2])[0], hp = W.hp, hq = P[2].hq.hp; e.debugAttack(P, so, all(P[1])[0].uid, {}, []);
  ok(hp - W.hp === 3 && hq - P[2].hq.hp === 6, `Trident: 3 to the unit in front, both empty sides to the castle (unit ${hp - W.hp}, castle ${hq - P[2].hq.hp})`); }
// Pitchfork ignores Armour on every prong
{ const {e, P} = mk(); e.debugSpawnCard(P, so, 1, 'k2-pitch', 'left', {}, []); ['left','right','left'].forEach(s=> e.debugSpawnCard(P, so, 2, 'k2-armor', s, {}, []));
  const ws = all(P[2]), b = ws.map(c=> c.hp); e.debugAttack(P, so, all(P[1])[0].uid, {}, []);
  ok(ws.every((c, i)=> b[i] - c.hp === 3), `Pitchfork pierces Armour 2 on all three (${ws.map((c, i)=> b[i] - c.hp)})`); }
// Octolash: 8 nearest units, never the castle
{ const {e, P} = mk(); e.debugSpawnCard(P, so, 1, 'k2-octo', 'left', {}, []); for(let i=0; i<10; i++) e.debugSpawnCard(P, so, 2, 'k2-wall', i%2 ? 'left' : 'right', {}, []);
  const ws = all(P[2]), b = ws.map(c=> c.hp), hq = P[2].hq.hp; e.debugAttack(P, so, all(P[1])[0].uid, {}, []);
  const n = ws.filter((c, i)=> c.hp < b[i]).length; ok(n === 8 && P[2].hq.hp === hq, `Octolash hits 8 of 10 units and not the castle (${n})`); }
// Frost rules: frostResist keeps enemy Tundra units warm; frostWait/frostCount/frostbite
{ const e = E.makeSimEngine(defs, E.mulberry32(3), {recordEvents:true, battleMode:'open', rules:{field:'frozen', frostResist:['Tundra'], frostWait:3, frostCount:2, frostbite:1}}); const P = {1:e.newPlayer(1,{}), 2:e.newPlayer(2,{})};
  e.debugSpawnCard(P, so, 2, 'k2-tundra', 'left', {}, []); e.debugSpawnCard(P, so, 2, 'k2-wall', 'right', {}, []); e.debugSpawnCard(P, so, 1, 'k2-wall', 'left', {}, []); e.debugSpawnCard(P, so, 1, 'k2-wall', 'right', {}, []);
  const T = all(P[2]).find(c=> c.defId==='k2-tundra'), W = all(P[2]).find(c=> c.defId==='k2-wall'); const tw = T.wait, ww = W.wait, wa = W.atk; e.roundStart(P, 2, so, {}, []);
  ok(T.wait === tw, 'a Tundra enemy resists the frost'); ok(W.wait === ww + 3 && W.atk === wa + 1, `the frost adds 3 Wait and Frostbite +1 to the other enemy (wait ${W.wait}, atk ${W.atk})`);
  ok(all(P[1]).every(c=> c.wait >= 3), 'frostCount 2 chills both of yours'); }
// First blood: the first Quick swing of a round hits +1, the next one doesn't
{ const e = E.makeSimEngine(defs, E.mulberry32(4), {recordEvents:true, battleMode:'open', rules:{firstBlood:1}}); const P = {1:e.newPlayer(1,{}), 2:e.newPlayer(2,{})};
  e.debugSpawnCard(P, so, 1, 'k2-quick', 'left', {}, []); e.debugSpawnCard(P, so, 1, 'k2-quick', 'right', {}, []); const hq = P[2].hq.hp; e.resolveCombat(P, so, {}, [], 1);
  ok(hq - P[2].hq.hp === 5, `two Quick swings: 3 + 2 (castle took ${hq - P[2].hq.hp})`); }
// Rainmaker brings rain; Rainrunner gets +2/+2 and goes straight for the castle
{ const {e, P} = mk(); e.debugSpawnCard(P, so, 2, 'k2-wall', 'left', {}, []); const h = give(P, 1, 'k2-rainmk'); e.placeCard(P, so, 1, h.uid, 'left', {}, []);
  ok(e.getField() && e.getField().id === 'rain', 'Rainmaker: it rains'); e.debugSpawnCard(P, so, 1, 'k2-rainrun', 'right', {}, []); const R = all(P[1]).find(c=> c.defId==='k2-rainrun');
  e.syncPhaseStats(P, so, []); const hq = P[2].hq.hp, wall = all(P[2])[0].hp; e.debugAttack(P, so, R.uid, {}, []);
  ok(R.phaseAtk === 2 && hq - P[2].hq.hp === 4 && all(P[2])[0].hp === wall, `Rainrunner hits the castle for 4 past the wall (${hq - P[2].hq.hp}, bonus ${R.phaseAtk})`); }
// Moonborn: full moon field = all of it at night
{ const e = E.makeSimEngine(defs, E.mulberry32(5), {recordEvents:true, battleMode:'open', rules:{phase:'night', field:'moon'}}); const P = {1:e.newPlayer(1,{}), 2:e.newPlayer(2,{})};
  e.debugSpawnCard(P, so, 1, 'k2-moon', 'left', {}, []); e.syncPhaseStats(P, so, []); const M = all(P[1])[0];
  ok(e.moonPhase() === 4 && M.phaseAtk === 4, `Moonborn 4 under a full moon at night (+${M.phaseAtk})`); }
console.log(`keywords-2026-10-12: ${fail} failure(s)`); process.exit(fail ? 1 : 0);
