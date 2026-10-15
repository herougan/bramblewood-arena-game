#!/usr/bin/env node
// 2026-10-16 (W2, skills and combat rules). The user's list:
//   "Cleave N: Default 1."  ·  "Skill: When hit, its attack decreases by 1." (Wilting)  ·  "Molting N - Every 2 turns, gain +1 wait.
//   But +N/+N."  ·  "Bludgeon also removes skills! remember. and attack."  ·  "Add a sheep card (basic) - it has taunt."  ·  "Bulldoze"
//   ·  "Add: Toxin, and Venomous skills; Add a skill that permanently weakens the enemy's attack by 1. Invincibility, Invisibility. Skills
//   that apply debuffs like Blind and Paralysed and Confusion. Sonar skill ... Poison gas - does mass poison. Spitfire - ?. Tangleweed or
//   Bind ... OO Strangle is a skill too. Long Grass map: Slash & Burn, Predator & Prey skills. Nova ... Absolute zero - powerful evergreen.
//   Mountain climber. Crystallise. Rupture. Cure. Trap ..."  ·  "Cloudy - cloud shadows floating above the battlefield."
//   ·  "For all skirmishes that lose upon deck out - change it to deck out AND no creatures AND player has at least one creature.
//   Otherwise, fight to the death."  ·  the normal death, the Poisoned look, the heal's ➕.
'use strict';
const fs = require('fs'), path = require('path');
const H = require('./lib/harness.js');
const E = H.Engine;
let fail = 0; const ok = (c, m)=>{ if(!c){ fail++; console.log('  ✗', m); } };
const so = id=> id===1 ? 'A' : 'B';
const U = (id, effects, o)=> Object.assign({id, name:id, attack:3, health:500, wait:0, cost:0, effects: effects || {}}, o || {});
const base = H.loadCardDefs();
const defs = Object.assign({}, base, {
  'w2-wall': U('w2-wall', {}, {attack:0}), 'w2-hit': U('w2-hit'), 'w2-weak': U('w2-weak', {}, {attack:1}),
  'w2-venom': U('w2-venom', {venomous:2}), 'w2-poison': U('w2-poison', {poison:2}), 'w2-armor': U('w2-armor', {armor:10}, {attack:0}),
  'w2-toxin': U('w2-toxin', {toxin:1}), 'w2-weaken': U('w2-weaken', {weaken:true}), 'w2-wilt': U('w2-wilt', {wilting:true}, {attack:5}),
  'w2-bull': U('w2-bull', {bulldoze:true}), 'w2-tangle': U('w2-tangle', {tangle:true}), 'w2-strangle': U('w2-strangle', {strangle:3}),
  'w2-inv': U('w2-inv', {invincible:true}, {attack:0, health:10}), 'w2-invis': U('w2-invis', {invisible:2}, {attack:0}),
  'w2-invis-att': U('w2-invis-att', {invisible:2}), 'w2-sonar': U('w2-sonar', {sonar:true}), 'w2-smoked': U('w2-smoked', {}, {attack:0}),
  'w2-gas': U('w2-gas', {poisonGas:true}, {attack:0}), 'w2-az': U('w2-az', {absoluteZero:true}, {attack:0}),
  'w2-spit': U('w2-spit', {spitfire:true}, {attack:0}), 'w2-slash': U('w2-slash', {slashBurn:true}, {attack:50}),
  'w2-pred': U('w2-pred', {predator:2}), 'w2-prey': U('w2-prey', {prey:true}, {attack:0}),
  'w2-nova': U('w2-nova', {nova:4}, {attack:0, health:1}), 'w2-crys': U('w2-crys', {crystallise:true}, {attack:0, health:1}),
  'w2-cure': U('w2-cure', {cure:true}, {attack:0}), 'w2-trap': U('w2-trap', {trap:true}, {attack:0}),
  'w2-climb': U('w2-climb', {mountainClimber:true}, {attack:0}), 'w2-aval': U('w2-aval', {avalanche:2}, {attack:0}),
  'w2-taunt': U('w2-taunt', {taunt:true}, {attack:0}), 'w2-guard': U('w2-guard', {guardian:true}, {attack:0}),
  'w2-molt': U('w2-molt', {molting:2}, {attack:1, health:5}), 'w2-blud': U('w2-blud', {bludgeon:true, reach:true}),
  'w2-thorny': U('w2-thorny', {thorns:2, flying:true}, {attack:4}), 'w2-day': U('w2-day', {diurnal:2}, {attack:1}),
  'w2-blind-att': U('w2-blind-att', {blind:{chance:100, duration:1}}),
});
const all = pl=> [...pl.row.left, ...pl.row.center, ...pl.row.right];
function mk(rules, seed){ const e = E.makeSimEngine(defs, E.mulberry32(seed||7), {recordEvents:true, battleMode:'open', rules: rules || undefined}); return {e, P:{1:e.newPlayer(1,{}), 2:e.newPlayer(2,{})}}; }
function put(e, P, pid, id, slot, ev){ const pl = P[pid]; e.debugSpawnCard(P, so, pid, id, 'left', {}, ev || []);
  const c = all(pl).reduce((a, x)=> (!a || x.uid > a.uid) ? x : a, null); c.slot = slot;
  const cs = all(pl); pl.row.center = cs.filter(x=> x.slot === 0); pl.row.left = cs.filter(x=> x.slot < 0).sort((a, b)=> b.slot - a.slot); pl.row.right = cs.filter(x=> x.slot > 0).sort((a, b)=> a.slot - b.slot);
  e.syncSlots(pl); return c; }
const fight = (e, P, ev, first)=> e.resolveCombat(P, so, {}, ev || [], first || 1);

// ---- Venomous vs Poison: Venomous gets through Armor, plain Poison doesn't
{ const {e, P} = mk(); put(e, P, 1, 'w2-venom', 0); const t = put(e, P, 2, 'w2-armor', 0); fight(e, P, [], 1);
  ok(t.poison === 2, `Venomous 2 injects 2 Poison through Armor 10 (${t.poison})`); }
{ const {e, P} = mk(); put(e, P, 1, 'w2-poison', 0); const t = put(e, P, 2, 'w2-armor', 0); fight(e, P, [], 1);
  ok(!(t.poison > 0), `plain Poison still needs damage through (${t.poison})`); }
// ---- Toxin: stacks, never wears off, Cure leaves it
{ const {e, P} = mk(); const a = put(e, P, 1, 'w2-toxin', 0); const t = put(e, P, 2, 'w2-wall', 0); put(e, P, 2, 'w2-cure', 1);
  fight(e, P, [], 1); ok(t.toxin === 1, `Toxin 1 lands (${t.toxin})`);
  const hp0 = t.hp; const ev = []; fight(e, P, ev, 1);
  ok(t.toxin === 2 && ev.some(x=> x.type === 'toxinTick' && x.uid === t.uid && x.dmg === 1), `it ticks its stack and keeps stacking (${t.toxin})`);
  ok(hp0 - t.hp >= 4, `toxin tick + the hit (${hp0 - t.hp})`); void a; }
// ---- Weaken / Wilting
{ const {e, P} = mk(); put(e, P, 1, 'w2-weaken', 0); const t = put(e, P, 2, 'w2-hit', 0); fight(e, P, [], 1);
  ok(t.atk === 2 && t.baseAtk === 2, `Weaken takes 1 Attack for good (${t.atk})`); }
{ const {e, P} = mk(); put(e, P, 1, 'w2-hit', 0); const t = put(e, P, 2, 'w2-wilt', 0); fight(e, P, [], 1);
  ok(t.atk === 4, `Wilting: hit once, 1 Attack gone (${t.atk})`); fight(e, P, [], 1); ok(t.atk === 3, `...and again (${t.atk})`); }
// ---- Bulldoze: +1 Wait
{ const {e, P} = mk(); put(e, P, 1, 'w2-bull', 0); const t = put(e, P, 2, 'w2-hit', 0); const ev = []; fight(e, P, ev, 1);
  ok(ev.some(x=> x.type === 'statusFx' && x.kind === 'bulldoze' && x.targetUid === t.uid), 'Bulldoze shoves (event)');
  ok(t.wait === 1, `the +1 Wait survives the round's upkeep (${t.wait})`);
  const ev2 = []; fight(e, P, ev2, 2); ok(!ev2.some(x=> x.type === 'hit' && x.attUid === t.uid) && t.wait === 0, `so it misses the next round's swing, and can't be shoved again while it waits (${t.wait})`);
  const ev3 = []; fight(e, P, ev3, 2); ok(ev3.some(x=> x.type === 'hit' && x.attUid === t.uid), 'it swings again the round after'); }
{ const {e, P} = mk(); put(e, P, 1, 'w2-bull', 0); const t = put(e, P, 2, 'w2-wall', 0); t.wait = 2; fight(e, P, [], 1); ok(t.wait === 1, `Bulldoze leaves a waiting unit alone (${t.wait})`); }
// ---- Tangleweed: Bound for a round, can't attack; Strangle: squeezes
{ const {e, P} = mk(); put(e, P, 1, 'w2-tangle', 0); const t = put(e, P, 2, 'w2-hit', 0); fight(e, P, [], 1);
  ok(t.bound === 1, `Tangleweed binds (${t.bound})`); const ev = []; fight(e, P, ev, 2);
  ok(ev.some(x=> x.type === 'skipTurn' && x.reason === 'bound' && x.uid === t.uid), 'a Bound unit skips its swing');
  ok(!ev.some(x=> x.type === 'hit' && x.attUid === t.uid), 'and deals no hit'); }
{ const {e, P} = mk(); put(e, P, 1, 'w2-strangle', 0); const t = put(e, P, 2, 'w2-wall', 0); fight(e, P, [], 1); const ev = []; fight(e, P, ev, 1);
  ok(ev.some(x=> x.type === 'strangleTick' && x.uid === t.uid && x.dmg === 3), 'Strangle 3 squeezes the Bound unit for 3 at round start'); }
// ---- Invincible / Invisible
{ const {e, P} = mk(); put(e, P, 1, 'w2-hit', 0); const t = put(e, P, 2, 'w2-inv', 0); fight(e, P, [], 1);
  ok(t.hp === 10, `Invincible 1: no damage on its first round (${t.hp})`); fight(e, P, [], 1); ok(t.hp === 7, `then it is hurt (${t.hp})`); }
{ const {e, P} = mk(); put(e, P, 1, 'w2-hit', 0); const t = put(e, P, 2, 'w2-invis', 0); const ev = []; fight(e, P, ev, 1);
  ok(t.hp === 500 && ev.some(x=> x.type === 'evaded' && x.reason === 'invisible'), 'Invisible: the swing finds nothing');
  fight(e, P, [], 1); ok(t.hp === 500, 'Invisible 2: two rounds'); fight(e, P, [], 1); ok(t.hp < 500, `then it can be hit (${t.hp})`); }
{ const {e, P} = mk(); put(e, P, 1, 'w2-hit', 0); const t = put(e, P, 2, 'w2-invis-att', 0); const ev = []; fight(e, P, ev, 2);
  ok(t.invisible === 0 && ev.some(x=> x.type === 'statusEnd' && x.status === 'invisible' && x.attacked), 'attacking gives an Invisible unit away'); }
// ---- Sonar: never Blinded, hears through Smoke
{ const {e, P} = mk(); put(e, P, 2, 'w2-blind-att', 0); const s = put(e, P, 1, 'w2-sonar', 0); fight(e, P, [], 2); ok(!(s.blind > 0), 'Sonar: never Blinded'); }
{ const {e, P} = mk(); put(e, P, 1, 'w2-sonar', 0); const t = put(e, P, 2, 'w2-smoked', 0); let miss = 0;
  for(let r = 0; r < 12; r++){ t.smoke = 2; const ev = []; fight(e, P, ev, 1); if(ev.some(x=> x.type === 'evaded' && x.reason === 'smoke')) miss++; }
  ok(miss === 0, `Sonar hears through Smoke (${miss} misses)`); }
// ---- Poison Gas, Absolute Zero
{ const {e, P} = mk(); const f1 = put(e, P, 2, 'w2-hit', 0), f2 = put(e, P, 2, 'w2-hit', 1); const ev = []; put(e, P, 1, 'w2-gas', 0, ev);
  ok(f1.poison === 2 && f2.poison === 2 && ev.some(x=> x.type === 'poisonGas'), `Poison Gas: every enemy unit gets 2 Poison (${f1.poison}, ${f2.poison})`); }
{ const {e, P} = mk(); const f1 = put(e, P, 2, 'w2-hit', 0), f2 = put(e, P, 2, 'w2-hit', 1); const ev = []; put(e, P, 1, 'w2-az', 0, ev);
  ok(f1.frozen === 1 && f2.frozen === 1 && ev.some(x=> x.type === 'absoluteZero'), 'Absolute Zero freezes every enemy unit');
  const ev2 = []; fight(e, P, ev2, 2); ok(!ev2.some(x=> x.type === 'hit' && (x.attUid === f1.uid || x.attUid === f2.uid)), 'they skip that round');
  ok(f1.frozen === 0, `...and thaw at its end (one round, ${f1.frozen})`); }
// ---- Spitfire: a random enemy unit, fire
{ const {e, P} = mk(); put(e, P, 1, 'w2-spit', 0); put(e, P, 2, 'w2-wall', 3); const ev = []; fight(e, P, ev, 1);
  ok(ev.some(x=> x.type === 'bolt' && x.key === 'spitfire') && ev.some(x=> x.type === 'hit' && x.dmgType === 'heat' && x.dmg === 2), 'Spitfire 2 spits fire at a unit not in front of it'); }
// ---- Slash & Burn and Trap: hazards on an empty slot
{ const {e, P} = mk(); put(e, P, 1, 'w2-slash', 0); put(e, P, 2, 'w2-hit', 1); const v = put(e, P, 2, 'w2-hit', 0); v.hp = 5; fight(e, P, [], 1);
  ok(e.getHazards()['2:s0'] && e.getHazards()['2:s0'].scorch === 3, `Slash & Burn: the slot burns (${JSON.stringify(e.getHazards())})`);
  const ev = []; e.debugSpawnCard(P, so, 2, 'w2-hit', 0, {}, ev); const nc = all(P[2]).find(x=> x.slot === 0);
  ok(nc && nc.hp === 497 && ev.some(x=> x.type === 'hazardSprung' && x.kind === 'scorch'), `the next card played there burns for 3 (${nc && nc.hp})`);
  ok(!e.getHazards()['2:s0'], 'and the fire is out'); }
{ const {e, P} = mk(); put(e, P, 2, 'w2-hit', 1); const ev = []; put(e, P, 1, 'w2-trap', 0, ev);
  // the trap card was placed at slot 0 by debugSpawnCard (centre on an empty board), and the enemy's slot 0 was empty
  ok(e.getHazards()['2:s0'] && e.getHazards()['2:s0'].trap === 5, `Trap: set on the empty slot facing it (${JSON.stringify(e.getHazards())})`);
  const ev2 = []; e.debugSpawnCard(P, so, 2, 'w2-hit', 0, {}, ev2); const nc = all(P[2]).find(x=> x.slot === 0);
  ok(nc && nc.hp === 495, `the next enemy card played there takes 5 (${nc && nc.hp})`); }
{ const {e, P} = mk(); put(e, P, 2, 'w2-hit', 0); const ev = []; put(e, P, 1, 'w2-trap', 0, ev); ok(!Object.keys(e.getHazards()).length, 'no trap when the slot facing it is taken'); }
// ---- Predator / Prey
{ const {e, P} = mk(); put(e, P, 1, 'w2-pred', 0); const t = put(e, P, 2, 'w2-weak', 0); fight(e, P, [], 1); ok(t.hp === 495, `Predator 2 vs a weaker unit: 3+2 (${500 - t.hp})`); }
{ const {e, P} = mk(); put(e, P, 1, 'w2-pred', 0); const t = put(e, P, 2, 'w2-hit', 0); fight(e, P, [], 1); ok(t.hp === 497, `no bonus vs an equal (${500 - t.hp})`); }
{ const {e, P} = mk(null, 3); put(e, P, 1, 'w2-pred', 0); const t = put(e, P, 2, 'w2-prey', 0); let dodged = 0;
  for(let r = 0; r < 20; r++){ const ev = []; fight(e, P, ev, 1); if(ev.some(x=> x.type === 'evaded' && x.targetUid === t.uid)) dodged++; }
  ok(dodged >= 4 && dodged <= 16, `Prey dodges about half while a Predator is out (${dodged}/20)`); }
{ const {e, P} = mk(null, 3); put(e, P, 1, 'w2-hit', 0); const t = put(e, P, 2, 'w2-prey', 0); let dodged = 0;
  for(let r = 0; r < 12; r++){ const ev = []; fight(e, P, ev, 1); if(ev.some(x=> x.type === 'evaded' && x.targetUid === t.uid)) dodged++; }
  ok(dodged === 0, 'no Predator, no dodging'); }
// ---- Nova / Crystallise
{ const {e, P} = mk(); put(e, P, 1, 'w2-hit', 0); const n = put(e, P, 2, 'w2-nova', 0); const f = put(e, P, 1, 'w2-wall', 1); const ev = []; fight(e, P, ev, 1);
  ok(ev.some(x=> x.type === 'nova') && f.hp === 496, `Nova 4: every enemy unit takes 4 as it dies (${f.hp})`); void n; }
{ const {e, P} = mk(); put(e, P, 1, 'w2-hit', 0); put(e, P, 2, 'w2-crys', 0); const ev = []; fight(e, P, ev, 1);
  const cr = all(P[2]).find(x=> x.slot === 0); ok(cr && /~crystal5$/.test(cr.defId) && cr.hp === 5 && cr.atk === 0, `Crystallise: a 0/5 crystal holds the slot (${cr && cr.defId})`);
  ok(ev.some(x=> x.type === 'spawn' && x.kind === 'crystal'), 'the spawn says it is a crystal'); }
// ---- Cure
{ const {e, P} = mk(); put(e, P, 1, 'w2-cure', 0); const a = put(e, P, 1, 'w2-wall', 1); a.poison = 3; a.bleed = 1; a.toxin = 2; const ev = []; fight(e, P, ev, 1);
  ok(a.toxin === 2 && ev.some(x=> x.type === 'statusFx' && x.kind === 'cure' && x.targetUid === a.uid && x.amount === 2), `Cure 2: two Poison off, Toxin stays (${a.poison} poison, ${a.toxin} toxin)`); }
// ---- Mountain Climber
{ const {e, P} = mk(); const c = put(e, P, 2, 'w2-climb', 0), w = put(e, P, 2, 'w2-wall', 1); put(e, P, 1, 'w2-aval', 0);
  ok(c.hp === 500 && c.wait === 0 && w.hp === 498, `Avalanche passes a Mountain Climber by (${c.hp}, wall ${w.hp})`); }
{ const {e, P} = mk({field:'heatwave', heatLevel:3}); const c = put(e, P, 2, 'w2-climb', 0); for(let r = 2; r < 6; r++) e.roundStart(P, r, so, {}, []); ok(c.hp === 500, 'Scorching never touches it'); }
// ---- Taunt (the Sheep)
{ const {e, P} = mk(); const a = put(e, P, 1, 'w2-hit', 0); const s = put(e, P, 2, 'w2-taunt', 1); const ev = []; fight(e, P, ev, 1);
  ok(ev.some(x=> x.type === 'hit' && x.attUid === a.uid && x.targetUid === s.uid) && P[2].hq.hp === P[2].hq.maxHp, 'Taunt: the swing at the empty column goes to the Taunt unit beside it, not the castle'); }
{ const {e, P} = mk(); const a = put(e, P, 1, 'w2-hit', 0); const g = put(e, P, 2, 'w2-guard', 1); const ev = []; fight(e, P, ev, 1);
  ok(ev.some(x=> x.type === 'hitHQ' && x.attUid === a.uid) && g.hp === 500, 'Guardian is not Taunt: an empty column still goes to the castle'); }
{ const sheep = base['sheep']; ok(sheep && sheep.rarity === 'starter' && sheep.cost === 0 && sheep.wait === 0 && sheep.attack === 1 && sheep.health === 5 && sheep.effects.taunt === true, 'the Sheep: starter, 0 cost, Wait 0, 1/5, Taunt'); }
// ---- Molting: every 2 rounds, +N/+N and +1 Wait
{ const {e, P} = mk(); const m = put(e, P, 1, 'w2-molt', 0); put(e, P, 2, 'w2-wall', 0); fight(e, P, [], 1); ok(m.atk === 1 && m.wait === 0, 'Molting: nothing after round 1');
  const ev = []; fight(e, P, ev, 1); ok(m.atk === 3 && m.maxHp === 7 && m.wait === 1, `round 2: +2/+2 and +1 Wait (${m.atk}/${m.maxHp}, Wait ${m.wait})`);
  const ev3 = []; fight(e, P, ev3, 1); ok(!ev3.some(x=> x.type === 'hit' && x.attUid === m.uid) && m.wait === 0, 'it sits round 3 out while the shell hardens'); }
// ---- Bludgeon: -1 Attack and a skill (any) knocked out
{ const {e, P} = mk(); put(e, P, 1, 'w2-blud', 0); const t = put(e, P, 2, 'w2-thorny', 0); t.hp = 500; let n = 0;
  const ev = []; fight(e, P, ev, 1); const fx = e.effectsOf(t); n = (fx.thorns ? 1 : 0) + (fx.flying ? 1 : 0);
  ok(t.atk === 3, `Bludgeon takes 1 Attack (${t.atk})`); ok(n === 1, `and knocks out one of its skills (Thorns or Flying; ${n} left)`);
  ok(ev.some(x=> x.type === 'statusFx' && x.kind === 'bludgeon' && x.atkLost === 1 && x.broke), 'the event says what broke'); }
// ---- Cloudy: the day bonus is halved
{ const {e, P} = mk({phase:'day', cloudy:true}); const d = put(e, P, 1, 'w2-day', 0); e.syncPhaseStats(P, so, []); ok(d.phaseAtk === 1, `Cloudy: Diurnal 2 gives +1 by day (${d.phaseAtk})`); }
{ const {e, P} = mk({phase:'day'}); const d = put(e, P, 1, 'w2-day', 0); e.syncPhaseStats(P, so, []); ok(d.phaseAtk === 2, `clear day: +2 (${d.phaseAtk})`); }

// ---- the app side
const src = fs.readFileSync(path.join(__dirname, '..', 'arena_app.js'), 'utf8');
ok(/\{key:'sweep', category:'passive', label:'Cleave', kind:'number', min:1, defaultValue:1,/.test(src), 'Cleave N defaults to 1 in the editor');
['venomous','toxin','weaken','wilting','bulldoze','tangle','strangle','invincible','invisible','sonar','poisonGas','absoluteZero','spitfire','slashBurn','predator','prey','nova','crystallise','cure','trap','mountainClimber','taunt']
  .forEach(k=> ok(new RegExp(`\\{key:'${k}', category:'(passive|evergreen)'`).test(src), `${k} is in the skill registry`));
ok(/function enemySurrendersNow\(m\)/.test(src) && /no creatures/.test(src), 'deck-out: the surrender needs no enemy creatures and at least one of yours');
ok(/\{id:'cloudy',\s*group:'cloudy'/.test(src), 'Cloudy is a field effect (skirmish editor list)');
console.log(`keywords-2026-10-16a: ${fail ? fail + ' failure(s)' : 'all passed'}`); process.exit(fail ? 1 : 0);
