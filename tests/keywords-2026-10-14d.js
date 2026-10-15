#!/usr/bin/env node
// 2026-10-14, fourth pass: Crab claws, Sacrifice - {} (the onSacrifice trigger), Charge N - {}, freeze counters and the stun
// halo, Meiosis N, Nullify, and Restless.
'use strict';
const fs = require('fs'), path = require('path');
const H = require('./lib/harness.js');
const E = H.Engine;
let fail = 0; const ok = (c, m)=>{ if(!c){ fail++; console.log('  ✗', m); } };
const so = id=> id===1 ? 'A' : 'B';
const base = H.loadCardDefs();
const defs = Object.assign({}, base, {
  'kd-wall':  {id:'kd-wall', name:'Wall', attack:0, health:500, wait:0, cost:0, effects:{}},
  'kd-hit':   {id:'kd-hit', name:'Hit', attack:5, health:500, wait:0, cost:0, effects:{}},
  'kd-crab':  {id:'kd-crab', name:'Crab', attack:3, health:500, wait:0, cost:0, effects:{crabClaws:true}},
  // Sacrifice - {}: a Dark Summon fodder that bites back when it is sacrificed, and a hand card that pays when it is eaten or offered
  'kd-sacimp':  {id:'kd-sacimp', name:'Grinning Imp', attack:1, health:3, wait:0, cost:0, darkSummon:true, effects:{sacrifice:2, triggers:[{on:'onSacrifice', do:'damage', amount:3, who:'enemy', sub:'random'}]}},
  'kd-sacfood': {id:'kd-sacfood', name:'Willing Morsel', attack:1, health:1, wait:0, cost:0, effects:{triggers:[{on:'onSacrifice', do:'gainLumber', amount:2}]}},
  'kd-big':   {id:'kd-big', name:'Big Devil', attack:5, health:9, wait:0, cost:0, devilryCost:2, darkSummon:true, effects:{}},
  'kd-glut':  {id:'kd-glut', name:'Glutton', attack:2, health:8, wait:0, cost:0, effects:{devour:{attack:1, health:1}}},
  // Charge 2 - deal 4 damage to a random enemy
  'kd-charge':  {id:'kd-charge', name:'Coil', attack:0, health:50, wait:0, cost:0, effects:{charge:{n:2, do:{do:'damage', amount:4, who:'enemy', sub:'adjacent'}}}},
  'kd-chargeW': {id:'kd-chargeW', name:'Slow Coil', attack:0, health:50, wait:2, cost:0, effects:{charge:{n:1, do:{do:'damage', amount:4, who:'enemy', sub:'adjacent'}}}},
  'kd-freezer': {id:'kd-freezer', name:'Freezer', attack:1, health:500, wait:0, cost:0, effects:{freeze:{chance:100, duration:2}}},
  'kd-waiter':  {id:'kd-waiter', name:'Waiter', attack:1, health:500, wait:3, cost:0, effects:{}},
  'kd-cell':  {id:'kd-cell', name:'Cell', attack:6, health:9, wait:0, cost:0, effects:{meiosis:2, poison:3, armor:1, flying:true}},
  'kd-cell1': {id:'kd-cell1', name:'Blob', attack:2, health:2, wait:0, cost:0, effects:{meiosis:true}},
  'kd-null':  {id:'kd-null', name:'Voidblade', attack:50, health:500, wait:0, cost:0, effects:{nullify:true}},
  'kd-nullS': {id:'kd-nullS', name:'Voidpin', attack:1, health:500, wait:0, cost:0, effects:{nullify:true}},
  'kd-spiky': {id:'kd-spiky', name:'Spiky', attack:0, health:20, wait:0, cost:0, effects:{thorns:5, shell:2, spiteful:2, counterattack:true, triggers:[{on:'onAttacked', do:'buffAttack', amount:3, who:'self'}]}},
  'kd-mourn': {id:'kd-mourn', name:'Mourner', attack:0, health:20, wait:0, cost:0, effects:{revive:true, landslide:3, triggers:[{on:'onDeath', do:'damage', amount:9, who:'enemy', sub:'random'}]}},
  'kd-rest':  {id:'kd-rest', name:'Wanderer', attack:1, health:50, wait:0, cost:0, effects:{restless:true}},
});
const all = pl=> [...pl.row.left, ...pl.row.center, ...pl.row.right];
const byDef = (pl, id)=> all(pl).find(c=> c.defId===id);
function mk(rules, seed, mode){ const e = E.makeSimEngine(defs, E.mulberry32(seed||7), {recordEvents:true, battleMode: mode || 'open', rules: rules || {}}); return {e, P:{1:e.newPlayer(1,{}), 2:e.newPlayer(2,{})}}; }
function put(e, P, pid, id, slot){ const pl = P[pid]; e.debugSpawnCard(P, so, pid, id, 'left', {}, []);
  const c = all(pl).reduce((a, x)=> (!a || x.uid > a.uid) ? x : a, null); c.slot = slot;
  const cs = all(pl); pl.row.center = cs.filter(x=> x.slot === 0); pl.row.left = cs.filter(x=> x.slot < 0).sort((a, b)=> b.slot - a.slot); pl.row.right = cs.filter(x=> x.slot > 0).sort((a, b)=> a.slot - b.slot);
  e.syncPhaseStats(P, so, []); return c; }
const give = (P, pid, id)=>{ const h = {uid: 70000 + P[pid].hand.length + pid*100, defId:id}; P[pid].hand.push(h); return h; };
const src = fs.readFileSync(path.join(__dirname, '..', 'arena_app.js'), 'utf8');
const css = fs.readFileSync(path.join(__dirname, '..', 'arena_template.html'), 'utf8');

// ---- 1. Crab claws (2026-10-15 rework, user: "Crab claws can be, attack a random unit L or R."; was: alternating, a wasted pinch)
{ let L0 = 0, R0 = 0, F0 = 0;
  for(let seed = 1; seed <= 30; seed++){ const {e, P} = mk(null, seed); const F = put(e, P, 2, 'kd-wall', 0), L = put(e, P, 2, 'kd-wall', -1), R = put(e, P, 2, 'kd-wall', 1); const C = put(e, P, 1, 'kd-crab', 0);
    const ev = []; e.debugAttack(P, so, C.uid, {}, ev); if(L.hp < 500) L0++; if(R.hp < 500) R0++; if(F.hp < 500) F0++;
    if(seed === 1) ok(ev.some(x=> x.type==='crabClaw' && (x.dir==='left' || x.dir==='right')), 'a crabClaw event is logged'); }
  ok(F0 === 0 && L0 > 0 && R0 > 0 && L0 + R0 === 30, `each pinch goes left or right at random, never ahead (L ${L0}, R ${R0}, front ${F0})`); }
{ const {e, P} = mk(); const F = put(e, P, 2, 'kd-wall', 0), R = put(e, P, 2, 'kd-wall', 1); const C = put(e, P, 1, 'kd-crab', 0);
  e.debugAttack(P, so, C.uid, {}, []); ok(R.hp === 497 && F.hp === 500, 'only a unit on the right: it pinches right');
  e.debugAttack(P, so, C.uid, {}, []); ok(R.hp === 494, 'and keeps to the side that has a unit'); }
{ const {e, P} = mk(); const F = put(e, P, 2, 'kd-wall', 0); const C = put(e, P, 1, 'kd-crab', 0); const hq = P[2].hq.hp;
  const ev = []; e.debugAttack(P, so, C.uid, {}, ev);
  ok(F.hp === 497 && P[2].hq.hp === hq && !ev.some(x=> x.type==='crabClaw'), 'a unit in front, none beside it: it attacks straight ahead as normal'); }
{ const {e, P} = mk(); put(e, P, 2, 'kd-wall', 4); const C = put(e, P, 1, 'kd-crab', 0); const hq = P[2].hq.hp;
  e.debugAttack(P, so, C.uid, {}, []); ok(P[2].hq.hp === hq - 3, 'nothing in front or beside: it walks through to the castle'); }
{ const cl = Object.keys(base).filter(id=> base[id].effects && base[id].effects.crabClaws).sort();
  // 2026-10-14 (seventh pass, user: "Ignore Crab claws. Crabs have fork"): no card carries Crab Claws now; those two crabs Fork.
  ok(!cl.length && base['open-ocean-hermit-crab'].effects.fork && base['sulfur-vent-crab'].effects.fork, `Crab Claws is off every card; the two crabs Fork (${cl})`); }

// ---- 2. Sacrifice - {} (user: "Sacrifice - {} aka On Sacrifice -> Do {}. But it's framed as Sacrifice - { }")
{ const {e, P} = mk(); const W = put(e, P, 2, 'kd-wall', 0); const imp = give(P, 1, 'kd-sacimp'); e.placeCard(P, so, 1, imp.uid, 'left', {}, []); e.resolveCombat(P, so, {}, [], 1);
  const fod = byDef(P[1], 'kd-sacimp'); const big = give(P, 1, 'kd-big'); P[1].devilry = 0; const h0 = W.hp, ev = [];
  ok(e.sacrificeSummon(P, so, 1, big.uid, fod.uid, {}, ev), 'sacrifice-summon works');
  ok(W.hp === h0 - 3, `Sacrifice - deal 3 damage to a random enemy: it bites as it goes (${h0 - W.hp})`);
  ok(ev.some(x=> x.type==='triggerFired' && x.hook==='onSacrifice'), 'the trigger is announced'); }
{ const {e, P} = mk(); const G = put(e, P, 1, 'kd-glut', 0); const food = give(P, 1, 'kd-sacfood'); const l0 = P[1].lumber;
  ok(e.devour(P, so, 1, G.uid, food.uid, {}, []), 'devour works'); ok(P[1].lumber === l0 + 2, `a hand card eaten by Devour is sacrificed: +2 Lumber (${P[1].lumber - l0})`);
  ok(!byDef(P[1], 'kd-sacfood'), 'the stand-in never touches the board'); }
{ const {e, P} = mk(); const l0 = P[1].lumber; e.fireOnSacrifice(P, so, 1, null, 'kd-wall', {}, [], 'offering'); ok(P[1].lumber === l0, 'a card with no Sacrifice trigger: nothing'); }
{ ok(/key:'onSacrifice', label:'On Sacrifice'/.test(src), 'On Sacrifice is in the trigger editor list');
  ok(/onSacrifice'\) return `Sacrifice - /.test(src) || /Sacrifice - \$\{/.test(src), 'its card text reads "Sacrifice - <effect>"');
  ok(/sac-teeth/.test(src) && /\.sac-teeth/.test(css), 'in hand, a Sacrifice card shows the teeth'); }

// ---- 3. Charge N - {} (user: "A yellow wait timer = N starts on the top right. Charge only starts when the card is ready.")
{ const {e, P} = mk(); const W = put(e, P, 2, 'kd-wall', 0); const C = put(e, P, 1, 'kd-charge', 0);
  ok(C.chargeLeft === 2, `Ready on arrival: the charge clock starts at 2 (${C.chargeLeft})`);
  e.resolveCombat(P, so, {}, [], 1); ok(C.chargeLeft === 1 && W.hp === 500, `upkeep: 2 -> 1 (${C.chargeLeft})`);
  const ev = []; e.resolveCombat(P, so, {}, ev, 1); ok(W.hp === 496 && C.chargeLeft === 2, `at 0 the effect happens (4 damage) and the clock winds back to 2 (${W.hp}, ${C.chargeLeft})`);
  ok(ev.some(x=> x.type==='charge' && x.fired), 'a charge event marks the firing');
  e.resolveCombat(P, so, {}, [], 1); e.resolveCombat(P, so, {}, [], 1); ok(W.hp === 492, 'it repeats every 2 rounds'); }
{ const {e, P} = mk(); const W = put(e, P, 2, 'kd-wall', 0); const C = put(e, P, 1, 'kd-chargeW', 0);
  ok(C.chargeLeft == null, 'Waiting: no charge clock yet');
  e.resolveCombat(P, so, {}, [], 1); ok(C.chargeLeft == null && C.wait === 1, 'still Waiting');
  e.resolveCombat(P, so, {}, [], 1); ok(C.wait === 0 && C.chargeLeft === 1 && W.hp === 500, `Ready: the clock starts at 1 (${C.chargeLeft})`);
  e.resolveCombat(P, so, {}, [], 1); ok(W.hp === 496, 'Charge 1: next upkeep it goes off'); }
{ ok(/function chargeBadgeHTML/.test(src) && /\.chargebadge/.test(css), 'the yellow charge clock is drawn on the card');
  ok(/Charge \$\{/.test(src), 'its card text reads "Charge N - <effect>"'); }

// ---- 4. Freeze counters (user: "Freeze - instead of giving a +Wait, it gives a freeze counter. The clock DOES +1.")
{ const {e, P} = mk({field:'frozen', frostWait:1}); const R = put(e, P, 1, 'kd-hit', 0), W = put(e, P, 2, 'kd-wall', 0);
  e.roundStart(P, 2, so, {}, []); ok(R.frozen === 1 && R.wait === 0, `the frost lays a freeze counter, not Wait (${R.frozen}, ${R.wait})`);
  const ev = []; e.resolveCombat(P, so, {}, ev, 1); ok(W.hp === 500, 'a frozen unit does not swing'); ok(R.frozen === 0 && R.wait === 0, 'upkeep: the counter melts');
  ok(ev.some(x=> x.type==='statusFx' && x.kind==='thaw'), 'a thaw event (the snowflakes fade)');
  e.resolveCombat(P, so, {}, [], 1); ok(W.hp === 495, 'next round it swings: the same timing as +1 Wait'); }
{ const {e, P} = mk({field:'frozen', frostWait:1}); const R = put(e, P, 1, 'kd-waiter', 0); put(e, P, 2, 'kd-wall', 0);
  e.roundStart(P, 2, so, {}, []); ok(R.frozen === 1 && R.wait === 3, 'a Waiting unit: Wait 3 and a counter (the clock shows 4)');
  e.resolveCombat(P, so, {}, [], 1); ok(R.frozen === 0 && R.wait === 3, 'upkeep removes the counter instead of ticking the Wait');
  e.resolveCombat(P, so, {}, [], 1); ok(R.wait === 2, 'then the Wait ticks again'); }
{ const {e, P} = mk(); const T = put(e, P, 2, 'kd-waiter', 0); const F = put(e, P, 1, 'kd-freezer', 0);
  e.debugAttack(P, so, F.uid, {}, []); ok(T.frozen === 2, `Freeze 2 on hit: two counters (${T.frozen})`); F.hp = 0; e.removeDeadCards(P, so, {}, {}, []);
  const clock = ()=> T.wait + T.frozen; const seq = [];
  for(let r = 0; r < 4; r++){ e.resolveCombat(P, so, {}, [], 2); seq.push(T.wait + '/' + T.frozen); }
  ok(seq.join(' ') === '2/2 2/1 2/0 1/0', `the counters melt one an upkeep in place of the Wait, as long as before (${seq.join(' ')})`); void clock; }
{ ok(/is-icy/.test(src) && /\.waitbadge\.is-icy/.test(css), 'the clock looks icy while frozen'); ok(/frost-flakes/.test(src) && /\.frost-flakes/.test(css) && /is-thawing/.test(src), 'snowflakes on the card, fading out as it thaws'); }

// ---- 5. Stun (user: "A cartoony stun effect plays above its head.")
{ ok(/stun-halo/.test(src) && /\.stun-halo/.test(css) && /@keyframes stunHaloSpin/.test(css), 'a stunned unit has circling stars above its head'); }

// ---- 6. Meiosis N (user: "breaks into 2 smaller parts when it dies, with half the stats, and skill numbers. Their Meiosis count drops by 1.")
{ const {e, P} = mk(); const C = put(e, P, 1, 'kd-cell', 0); put(e, P, 1, 'kd-wall', 1);
  const ev = []; C.hp = 0; e.removeDeadCards(P, so, {}, {}, ev); const halves = all(P[1]).filter(c=> /~half$/.test(c.defId));
  ok(halves.length === 2, `it splits in two (${halves.length})`); const d = halves[0] && defs[halves[0].defId];
  ok(d && d.attack === 3 && d.health === 5 && d.token, `half the stats, rounded up (${d && d.attack}/${d && d.health})`);
  ok(d && d.effects.poison === 1 && !('armor' in d.effects) && d.effects.flying === true && d.effects.meiosis === 1, `skill numbers halved (Poison 3 -> 1, Armor 1 -> gone), Flying kept, Meiosis 2 -> 1 (${JSON.stringify(d && d.effects)})`);
  ok(halves.some(h=> h.slot === 0) && halves.some(h=> h.slot === -1), `one half in its place, one in the nearest free slot (${halves.map(h=> h.slot)})`);
  ok(ev.some(x=> x.type==='spawn' && x.kind==='meiosis' && x.cause==='onDeathSpawn'), 'logged as a spawn (it pops out where the unit fell)');
  halves[0].hp = 0; e.removeDeadCards(P, so, {}, {}, []); const q = all(P[1]).filter(c=> /~half~half$/.test(c.defId)); const dq = q[0] && defs[q[0].defId];
  ok(q.length === 2 && dq.attack === 2 && dq.health === 3 && !dq.effects.meiosis && !dq.effects.poison, `a half splits once more into quarters with no Meiosis left (${q.length}, ${dq && JSON.stringify(dq.effects)})`);
  q[0].hp = 0; const n0 = all(P[1]).length; e.removeDeadCards(P, so, {}, {}, []); ok(all(P[1]).length === n0 - 1, 'a quarter just dies'); }
{ const {e, P} = mk(); const B = put(e, P, 1, 'kd-cell1', 0); B.hp = 0; e.removeDeadCards(P, so, {}, {}, []); const h = all(P[1]); ok(h.length === 2 && h.every(c=> c.atk === 1 && c.maxHp === 1), 'Meiosis (true = 1) on a 2/2: two 1/1s'); }
{ const m = src.match(/function meiosisWarning\(e\)\{[\s\S]*?\n\}/); const w = m ? eval('(' + m[0] + ')') : null;
  ok(w && w({meiosis:1, poison:1, armor:1, flying:true}) && !w({meiosis:1, poison:1, armor:1}), 'the editor warns when a Meiosis card has more than 2 other skills ("Simple units only")'); }

// ---- 7. Nullify (user: "when this card hits the enemy, ignore all triggers and effects that would result from that hit from that unit")
{ const {e, P} = mk(); const S = put(e, P, 2, 'kd-spiky', 0); const N = put(e, P, 1, 'kd-nullS', 0); const nh = N.hp;
  const ev = []; e.debugAttack(P, so, N.uid, {}, ev);
  ok(S.hp === 19 && N.hp === nh, `no Thorns, Spiteful or Counterattack back at it (${nh - N.hp})`);
  ok(S.atk === 0 && S.shellUntil == null, 'no On Attacked trigger, and no Shell'); ok(ev.some(x=> x.type==='statusFx' && x.kind==='nullify'), 'a nullify event is logged');
  const H2 = put(e, P, 1, 'kd-hit', 1); S.slot = 1; e.syncSlots(P[2]); P[2].row.center = []; P[2].row.right = [S]; const hh = H2.hp; e.debugAttack(P, so, H2.uid, {}, []);
  ok(H2.hp < hh && S.atk === 3, 'an ordinary hit still gets them'); }
{ const {e, P} = mk(); const M = put(e, P, 2, 'kd-mourn', 0); put(e, P, 2, 'kd-wall', 1); const N = put(e, P, 1, 'kd-null', 0); const W1 = put(e, P, 1, 'kd-wall', 1);
  const ev = []; e.debugAttack(P, so, N.uid, {}, ev);
  ok(!all(P[2]).includes(M) && !ev.some(x=> x.type==='revive'), 'killed by Nullify: no Revive');
  ok(W1.hp === 500 && N.hp === 500 && !ev.some(x=> x.type==='landslide'), 'no On Death trigger, no Landslide');
  ok(P[2].exile.some(x=> x.defId==='kd-mourn') && !P[2].graveyard.some(x=> x.defId==='kd-mourn'), 'it goes straight to the Removal Zone (Exile), not the graveyard'); }
{ const {e, P} = mk(); const C = put(e, P, 2, 'kd-cell', 0); const N = put(e, P, 1, 'kd-null', 0); e.debugAttack(P, so, N.uid, {}, []);
  ok(!all(P[2]).some(c=> /~half$/.test(c.defId)), 'no Meiosis after a Nullify kill'); void C; }
{ ok(/const EXILE_ZONE_NAME = /.test(src), "the Exile zone's display name lives in one constant (EXILE_ZONE_NAME)"); }

// ---- 8. Restless (user: "Some cards have abilities that make them keep moving — I didn't like this, but good to have this option.")
{ const {e, P} = mk(); put(e, P, 2, 'kd-wall', 3); const R = put(e, P, 1, 'kd-rest', 0); const A = put(e, P, 1, 'kd-wall', 1);
  const ev = []; e.roundStart(P, 1, so, {}, ev); ok(R.slot === 1 && A.slot === 0, `round start: one column toward the nearest enemy, swapping with the ally there (${R.slot}, ${A.slot})`);
  ok(ev.some(x=> x.type==='restless'), 'logged'); e.roundStart(P, 2, so, {}, []); e.roundStart(P, 3, so, {}, []); ok(R.slot === 3, `until it faces it (${R.slot})`);
  e.roundStart(P, 4, so, {}, []); ok(R.slot === 3, 'then it stays put'); }
{ const cards = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'canonical', 'cards.json'), 'utf8')); ok(!cards.some(c=> c.effects && c.effects.restless), 'no card has Restless'); }

// ---- the app knows every new skill
{ ['crabClaws','meiosis','nullify','restless','charge'].forEach(k=> ok(new RegExp(`key:'${k}'`).test(src), `${k} is in the skill list`));
  ok(/crabClaws:'🦞'/.test(src) && /meiosis:'🧫'/.test(src) && /nullify:'🚫'/.test(src) && /restless:'👣'/.test(src), 'and has its icon'); }

console.log(fail ? `keywords-2026-10-14d: ${fail} failure(s)` : 'keywords-2026-10-14d: all passed');
process.exit(fail ? 1 : 0);
