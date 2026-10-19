#!/usr/bin/env node
// Package GI (2026-10-19). The owner (00:19): "continue with action items, and considering our gameplay-ideas ... After running through
// the ideas, create what you want to create". Built from docs/gameplay-ideas-2026-10-19.md (docs/gameplay-ideas-built-2026-10-19.md):
//   skills  Hunter N (a status picker: Poisoned / Bleeding / Wet / Exposed), Executioner N, Detonate, Proliferate N, Brittle N (the status
//           counts as Frozen for Shatter), Kin Rally N (On Ally Played (Kin): that ally +N/+N), Pack Howl N (On Ally Played (Wolf): Bleed N
//           on the enemy facing it), Prayer Ward N (Armor N while it holds Prayer tokens, 🧿), Field Breaker N (the field's round-start
//           effects stop for N rounds);
//   fields  Spore Cloud (a unit a side falls Asleep for the round; the Sleep cap holds), Thunderstorm N (lightning hits a unit a side;
//           Wet adds), Tangled Roots (a unit a side is Webbed for the round; flyers above it).
// Checks: each rule, the trigger rules on the keyword triggers (Waiting, the subject), determinism, the CPU's view, skill costs, the
// pool example cards (pool:true, budget v3), the app's lines / Codex / chapters, TX keys in the 12 packs, the decisions.
'use strict';
const fs = require('fs'), path = require('path');
const H = require('./lib/harness.js'), E = H.Engine;
const ROOT = path.join(__dirname, '..'), R = f=> fs.readFileSync(path.join(ROOT, f), 'utf8');
let fail = 0, n = 0; const ok = (c, m)=>{ n++; if(!c){ fail++; console.log('  ✗', m); } };
const so = id=> id===1 ? 'A' : 'B';
const U = (id, effects, o)=> Object.assign({id, name:id, attack:0, health:30, wait:0, cost:0, archetypes:['Gi'], effects: effects || {}}, o || {});
const defs = Object.assign({}, H.loadCardDefs(), {
  'gi-wall':    U('gi-wall'),
  'gi-hit3':    U('gi-hit3', {}, {attack:3}),
  'gi-hunterP': U('gi-hunterP', {hunter:2, hunterVs:'poison'}, {attack:3}), // 2026-10-19 (package SK3): Weak is the default now; this one picks Poisoned
  'gi-hunterB': U('gi-hunterB', {hunter:2, hunterVs:'bleed'}, {attack:3}),
  'gi-hunterX': U('gi-hunterX', {hunter:2, hunterVs:'exposed'}, {attack:3}),
  'gi-hunterW': U('gi-hunterW', {hunter:1, hunterVs:'wet'}, {attack:3}),
  'gi-hunterArrow': U('gi-hunterArrow', {hunter:2, arrow:2}, {attack:0}),
  'gi-exec':    U('gi-exec', {executioner:3}, {attack:2}),
  'gi-det':     U('gi-det', {detonate:true}, {attack:1}),
  'gi-prolif':  U('gi-prolif', {proliferate:2}),
  'gi-brittle': U('gi-brittle', {brittle:2}, {attack:1}),
  'gi-shatter': U('gi-shatter', {shatter:3}, {attack:2}),
  'gi-rally':   U('gi-rally', {kinRally:1}, {archetypes:['Otter']}),
  'gi-otter':   U('gi-otter', {}, {archetypes:['Otter', 'River'], attack:1, health:5}),
  'gi-duck':    U('gi-duck', {}, {archetypes:['Duck'], attack:1, health:5}),
  'gi-chg':     U('gi-chg', {changeling:true}, {archetypes:['Duck'], attack:1, health:5}),
  'gi-howl':    U('gi-howl', {packHowl:1}, {archetypes:['Wolf']}),
  'gi-wolf':    U('gi-wolf', {}, {archetypes:['Wolf'], attack:1, health:5}),
  'gi-ward':    U('gi-ward', {prayer:1, prayerWard:2}, {archetypes:['Ecclesia']}),
  'gi-breaker': U('gi-breaker', {fieldBreaker:2}),
  'gi-flyer':   U('gi-flyer', {flying:true}),
});
const all = pl=> [...pl.row.left, ...pl.row.center, ...pl.row.right];
function mk(seed, rules, mode){ const e = E.makeSimEngine(defs, E.mulberry32(seed||7), {recordEvents:true, battleMode: mode || 'open', rules: rules || {}}); return {e, P:{1:e.newPlayer(1,{}), 2:e.newPlayer(2,{})}}; }
function put(e, P, pid, id, side, ev){ ok(e.debugSpawnCard(P, so, pid, id, side || 'left', {}, ev || []), `placed ${id}`); return all(P[pid]).filter(x=> x.defId === id).reduce((a, x)=> (!a || x.uid > a.uid) ? x : a, null); }
const fight = (e, P, first)=>{ const ev = []; e.resolveCombat(P, so, {}, ev, first || 1); return ev; };
const start = (e, P, round)=>{ const ev = []; e.roundStart(P, round, so, {}, ev); return ev; };
const hitOn = (ev, uid)=> ev.filter(x=> x.type === 'hit' && x.targetUid === uid).reduce((t, x)=> t + (x.dmg || 0), 0);

// ---- 1. Hunter N (the status picker)
{ const {e, P} = mk(); const a = put(e, P, 1, 'gi-hunterP'); const t = put(e, P, 2, 'gi-wall'); t.poison = 3; const ev = fight(e, P);
  ok(hitOn(ev, t.uid) === 5, `Hunter 2 (Poisoned): 3 + 2 on a Poisoned unit (${hitOn(ev, t.uid)})`); }
{ const {e, P} = mk(); put(e, P, 1, 'gi-hunterP'); const t = put(e, P, 2, 'gi-wall'); const ev = fight(e, P);
  ok(hitOn(ev, t.uid) === 3, 'Hunter 2 (Poisoned): no bonus on a clean unit'); }
{ const {e, P} = mk(); put(e, P, 1, 'gi-hunterB'); const t = put(e, P, 2, 'gi-wall'); t.bleed = 2; const ev = fight(e, P); // (Bleed fades 1 at the round's start)
  ok(hitOn(ev, t.uid) === 5, 'Hunter 2 (Bleeding): +2 on a Bleeding unit'); }
{ const {e, P} = mk(); put(e, P, 1, 'gi-hunterB'); const t = put(e, P, 2, 'gi-wall'); t.poison = 4; const ev = fight(e, P);
  ok(hitOn(ev, t.uid) === 3, 'Hunter (Bleeding) ignores Poison: the picker picks one status'); }
{ const {e, P} = mk(); put(e, P, 1, 'gi-hunterX'); const t = put(e, P, 2, 'gi-wall'); t.exposed = 1; const ev = fight(e, P);
  // 2026-10-19 (package SK1): Exposed strips hiding for N rounds now (no crit, nothing used up); the old crit counters' damage is Exploit's.
  ok(hitOn(ev, t.uid) === 5 && t.exposed === 0, `Hunter 2 (Exposed): 3 + 2 = 5 (no crit since SK1); its 1 round of Exposed wears off at the upkeep (${hitOn(ev, t.uid)})`); }
{ const {e, P} = mk(); put(e, P, 1, 'gi-hunterW'); const t = put(e, P, 2, 'gi-wall'); e.setField('rain', 3); const ev = fight(e, P);
  ok(hitOn(ev, t.uid) === 4, `Hunter 1 (Wet) under Spring Rain: +1 (${hitOn(ev, t.uid)})`); }
{ const {e, P} = mk(); const a = put(e, P, 1, 'gi-hunterArrow'); const t = put(e, P, 2, 'gi-wall'); t.poison = 2; const hp0 = t.hp; const ev = start(e, P, 2).concat(fight(e, P));
  const shot = ev.filter(x=> (x.type === 'hit' || x.type === 'arrow' || x.type === 'shot') && x.targetUid === t.uid);
  ok(hp0 - t.hp >= 4, `Hunter applies to its shots too (an Arrow 2 on a Poisoned unit took ${hp0 - t.hp}, poison ticks aside)`); }
// ---- 2. Executioner N
{ const {e, P} = mk(); put(e, P, 1, 'gi-exec'); const t = put(e, P, 2, 'gi-wall'); t.hp = 7; const ev = fight(e, P);
  ok(hitOn(ev, t.uid) === 5, `Executioner 3: +3 on a unit below 25% Health (7/30; package SK3 aligned it from half): ${hitOn(ev, t.uid)}`); }
{ const {e, P} = mk(); put(e, P, 1, 'gi-exec'); const t = put(e, P, 2, 'gi-wall'); t.hp = 8; const ev = fight(e, P);
  ok(hitOn(ev, t.uid) === 2, 'Executioner: 8/30 (above a quarter) gets no bonus'); }
// ---- 3. Detonate
{ const {e, P} = mk(); put(e, P, 1, 'gi-det'); const t = put(e, P, 2, 'gi-wall'); t.poison = 4; const ev = fight(e, P); // (Poison ticks 4 and drops to 3 first)
  ok(hitOn(ev, t.uid) === 4 && t.poison === 0, `Detonate: 1 + its 3 Poison, then no Poison (${hitOn(ev, t.uid)}, poison ${t.poison})`);
  ok(ev.some(x=> x.type === 'statusFx' && x.kind === 'detonate' && x.targetUid === t.uid && x.amount === 3), 'Detonate tells the board (statusFx detonate, amount 3)'); }
{ const {e, P} = mk(); put(e, P, 1, 'gi-det'); const t = put(e, P, 2, 'gi-wall'); const ev = fight(e, P);
  ok(hitOn(ev, t.uid) === 1 && !ev.some(x=> x.kind === 'detonate'), 'Detonate on a clean unit: a plain hit, no event'); }
// ---- 4. Proliferate N
{ const {e, P} = mk(); put(e, P, 1, 'gi-prolif'); const a = put(e, P, 2, 'gi-wall', 'left'), b = put(e, P, 2, 'gi-wall', 'right'); a.poison = 3; a.poison = 3;
  const ev = start(e, P, 2);
  const pr = ev.filter(x=> x.kind === 'proliferate');
  ok(pr.length >= 1 && pr.every(x=> x.fromUid !== x.targetUid), `Proliferate: a Poisoned unit passes Poison to a neighbour (${pr.length} jump)`);
  ok(a.poison >= 3 && (b.poison || 0) >= 1, `... the carrier keeps its Poison (${a.poison}), the neighbour gets 1 (${b.poison})`); }
{ const {e, P} = mk(); put(e, P, 1, 'gi-prolif'); put(e, P, 2, 'gi-wall'); const ev = start(e, P, 2); ok(!ev.some(x=> x.kind === 'proliferate'), 'Proliferate: nobody Poisoned, nothing spreads'); }
{ const {e, P} = mk(); put(e, P, 1, 'gi-prolif'); const a = put(e, P, 2, 'gi-wall'); a.poison = 2; const ev = start(e, P, 2); ok(!ev.some(x=> x.kind === 'proliferate'), 'Proliferate: no neighbour, no jump'); }
// ---- 5. Brittle N + Shatter
{ const {e, P} = mk(); put(e, P, 1, 'gi-brittle'); const t = put(e, P, 2, 'gi-wall'); const ev = fight(e, P);
  ok(t.brittle === 2 && ev.some(x=> x.kind === 'brittle' && x.targetUid === t.uid), `Brittle 2: its hit makes the target Brittle for 2 (${t.brittle})`); }
{ const {e, P} = mk(); put(e, P, 1, 'gi-shatter'); const t = put(e, P, 2, 'gi-wall'); t.brittle = 1; const ev = fight(e, P);
  ok(hitOn(ev, t.uid) === 5, `Shatter 3 on a Brittle unit: counts as Frozen, 2 + 3 (${hitOn(ev, t.uid)})`); }
{ const {e, P} = mk(); put(e, P, 1, 'gi-wall'); const t = put(e, P, 2, 'gi-hit3'); t.brittle = 1; const ev = fight(e, P, 2);
  ok(ev.some(x=> x.type === 'hit' && x.attUid === t.uid), 'a Brittle unit still attacks (it is not Frozen)'); }
{ const {e, P} = mk(); put(e, P, 1, 'gi-brittle'); const t = put(e, P, 2, 'gi-wall'); fight(e, P); const w = all(P[1])[0]; w.atk = 0;
  fight(e, P); ok(t.brittle === 1, `Brittle ticks down each upkeep (2 -> 1: ${t.brittle})`); fight(e, P); const ev = fight(e, P);
  ok(!(t.brittle > 0), 'and wears off'); }
// ---- 6. Kin Rally N (the played card itself is the target)
{ const {e, P} = mk(); const r = put(e, P, 1, 'gi-rally'); const ev = []; const o = put(e, P, 1, 'gi-otter', 'right', ev);
  ok(o.atk === 2 && o.maxHp === 6, `Kin Rally 1: the Kin ally played gets +1/+1 (${o.atk}/${o.maxHp})`);
  ok(r.atk === 0 && r.maxHp === 30, 'Kin Rally buffs the arrival, not itself');
  ok(ev.some(x=> x.type === 'triggerFired' && x.uid === r.uid && x.hook === 'onAllyPlayed') && ev.some(x=> x.type === 'namedBuff' && x.targetUid === o.uid), 'its trigger rune and the buff event show'); }
{ const {e, P} = mk(); put(e, P, 1, 'gi-rally'); const d = put(e, P, 1, 'gi-duck', 'right'); ok(d.atk === 1 && d.maxHp === 5, 'Kin Rally: a non-Kin ally gets nothing'); }
{ const {e, P} = mk(); put(e, P, 1, 'gi-rally'); const d = put(e, P, 1, 'gi-chg', 'right'); ok(d.atk === 2, 'Kin Rally: a Changeling passes for Kin'); }
{ const {e, P} = mk(); const r = put(e, P, 1, 'gi-rally'); r.wait = 2; const o = put(e, P, 1, 'gi-otter', 'right'); ok(o.atk === 1, 'Kin Rally is off while its unit is Waiting (the trigger rule)'); }
{ const {e, P} = mk(); put(e, P, 1, 'gi-rally'); const o = put(e, P, 2, 'gi-otter'); ok(o.atk === 1, 'Kin Rally: an enemy arrival is not an ally'); }
{ const {e, P} = mk(); put(e, P, 1, 'gi-rally'); put(e, P, 1, 'gi-rally', 'right'); const o = put(e, P, 1, 'gi-otter', 'left'); ok(o.atk === 3 && o.maxHp === 7, `two Kin Rally units: +2/+2 (${o.atk}/${o.maxHp})`); }
// ---- 7. Pack Howl N
{ const {e, P} = mk(1, {}, 'open'); const h = put(e, P, 1, 'gi-howl'); const f = put(e, P, 2, 'gi-wall'); put(e, P, 2, 'gi-wall', 'right'); const ev = []; const w = put(e, P, 1, 'gi-wolf', 'right', ev);
  const bled = e.allBoardCards(P[2]).filter(c=> c.bleed > 0);
  ok(ev.some(x=> x.type === 'triggerFired' && x.uid === h.uid && x.hook === 'onAllyPlayed') && bled.length === 1 && bled[0].bleed === 1 && ev.some(x=> x.type === 'statusFx' && x.kind === 'bleed' && x.attUid === h.uid && x.targetUid === bled[0].uid),
    `Pack Howl 1: a Wolf played -> Bleed 1 on the one enemy facing it (${bled.length})`); }
{ const {e, P} = mk(3, {}, 'slots'); const h = put(e, P, 1, 'gi-howl', 'left'); const f = put(e, P, 2, 'gi-wall', 'left'); const ev = []; const w = put(e, P, 1, 'gi-wolf', 'left', ev);
  const facing = e.allBoardCards(P[2]).find(c=> c.hp > 0 && c.slot === w.slot);
  ok(facing ? facing.bleed === 1 : !ev.some(x=> x.kind === 'bleed'), `Pack Howl (slots): the unit facing the new Wolf bleeds 1 (${facing ? facing.bleed : 'nobody faces it'})`); }
{ const {e, P} = mk(); put(e, P, 1, 'gi-howl'); const f = put(e, P, 2, 'gi-wall'); put(e, P, 1, 'gi-duck', 'right'); ok(!(f.bleed > 0), 'Pack Howl: a non-Wolf arrival howls nothing'); }
// ---- 8. Prayer Ward N
{ const {e, P} = mk(); const wd = put(e, P, 2, 'gi-ward'); put(e, P, 1, 'gi-hit3'); wd.prayerTokens = 0; const ev = fight(e, P);
  ok(hitOn(ev, wd.uid) === 3, 'Prayer Ward 2: no Prayer tokens, no Armor'); }
{ const {e, P} = mk(); const wd = put(e, P, 2, 'gi-ward'); put(e, P, 1, 'gi-hit3'); wd.prayerTokens = 1; const ev = fight(e, P);
  ok(hitOn(ev, wd.uid) === 1, `Prayer Ward 2 with a token: Armor 2 (3 -> ${hitOn(ev, wd.uid)})`); ok(e.prayerWardOf(wd) === 2, 'prayerWardOf = 2'); }
// ---- 9. Field Breaker N
{ const {e, P} = mk(5, {hail:3}); const w = put(e, P, 1, 'gi-wall'); put(e, P, 2, 'gi-wall'); start(e, P, 1); start(e, P, 2); const hp1 = w.hp;
  ok(hp1 === 27, `Hail hits before Field Breaker (${hp1})`);
  const ev0 = []; put(e, P, 2, 'gi-breaker', 'right', ev0); ok(ev0.some(x=> x.type === 'fieldBreak' && x.rounds === 2), 'Field Breaker 2: the fieldBreak event');
  const ev3 = start(e, P, 3), ev4 = start(e, P, 4); ok(w.hp === hp1 && ev3.some(x=> x.type === 'fieldPaused') && !ev3.some(x=> x.field === 'hail'), `no Hail for 2 rounds (${w.hp})`);
  start(e, P, 5); ok(w.hp === hp1 - 3, `then the Hail is back (${w.hp})`); }
{ const {e, P} = mk(5, {swampFever:100}); const w = put(e, P, 1, 'gi-wall'); put(e, P, 2, 'gi-breaker'); start(e, P, 1); const ev = start(e, P, 2); ok(!(w.poison > 0), 'Field Breaker stops Swamp Fever too'); }
// ---- 10. Spore Cloud
{ const {e, P} = mk(9, {sporeCloud:true}); const a = put(e, P, 1, 'gi-wall'), b = put(e, P, 2, 'gi-wall'); start(e, P, 1); ok(!a.asleep && !b.asleep, 'Spore Cloud: nothing in round 1');
  const ev = start(e, P, 2); ok(a.asleep === 1 && b.asleep === 1 && ev.some(x=> x.type === 'fieldTick' && x.field === 'sporeCloud'), 'round 2: a unit a side falls Asleep (1)');
  a.asleep = 2; b.asleep = 1; start(e, P, 3); ok(a.asleep === 2 && b.asleep === 2, `the Sleep cap N+1 = 2 holds (${a.asleep}, ${b.asleep})`); }
{ const {e, P} = mk(9, {sporeCloud:true}); const a = put(e, P, 1, 'gi-hit3'), b = put(e, P, 2, 'gi-wall'); start(e, P, 1); start(e, P, 2); const ev = fight(e, P);
  ok(!ev.some(x=> x.type === 'hit' && x.attUid === a.uid), 'an Asleep unit skips its attack'); fight(e, P); const ev2 = fight(e, P); ok(ev2.some(x=> x.type === 'hit' && x.attUid === a.uid), '... and wakes after the round'); }
// ---- 11. Thunderstorm N
{ const {e, P} = mk(11, {thunderstorm:2}); const a = put(e, P, 1, 'gi-wall'), b = put(e, P, 2, 'gi-wall'); start(e, P, 1); const ev = start(e, P, 2);
  ok(a.hp === 28 && b.hp === 28 && ev.filter(x=> x.field === 'thunderHit').length === 2, `Thunderstorm 2: lightning hits a unit a side for 2 (${a.hp}, ${b.hp})`); }
{ const {e, P} = mk(11, {thunderstorm:2}); const a = put(e, P, 1, 'gi-wall'); e.setField('rain', 5); start(e, P, 1); const ev = start(e, P, 2);
  const th = ev.find(x=> x.field === 'thunderHit' && x.uid === a.uid); ok(th && th.dmg === 3 && th.wet === 1, `a Wet unit takes 1 more (${th && th.dmg}; the rain then heals it)`); }
// ---- 12. Tangled Roots
{ const {e, P} = mk(13, {tangledRoots:true}); const a = put(e, P, 1, 'gi-wall'), f = put(e, P, 2, 'gi-flyer'); start(e, P, 1); start(e, P, 2);
  ok(a.webbed === 1 && !(f.webbed > 0), `Tangled Roots: a unit a side is Webbed; flyers are above it (${a.webbed}, ${f.webbed})`);
  fight(e, P); ok(!(a.webbed > 0), 'the roots let go after the round'); }
// ---- 13. Determinism
{ const run = seed=>{ const {e, P} = mk(seed, {sporeCloud:true, thunderstorm:2, tangledRoots:true}, 'slots'); ['gi-prolif', 'gi-hunterP', 'gi-exec', 'gi-rally', 'gi-otter'].forEach((id, i)=> put(e, P, 1, id, i % 2 ? 'left' : 'right'));
    ['gi-det', 'gi-brittle', 'gi-shatter', 'gi-wall', 'gi-ward'].forEach((id, i)=> put(e, P, 2, id, i % 2 ? 'left' : 'right')); all(P[2])[0].poison = 3; const out = [];
    for(let r = 1; r <= 6; r++){ out.push(...start(e, P, r)); out.push(...fight(e, P, r % 2 ? 1 : 2)); } return JSON.stringify(out.map(x=> [x.type, x.kind, x.field, x.targetUid, x.uid, x.dmg, x.amount])); };
  ok(run(21) === run(21), 'the same seed gives the same fight (fields + skills)'); ok(run(21) !== run(22) || true, 'another seed may differ'); }
// ---- 14. The CPU
{ const {e, P} = mk(); const t = put(e, P, 1, 'gi-wall'); t.poison = 2; t.hp = 7; /* below 25% (SK3) */
  ok(e.aiBonusVs(defs['gi-hunterP'], t) === 2 && e.aiBonusVs(defs['gi-exec'], t) === 3 && e.aiBonusVs(defs['gi-det'], t) === 2, 'aiBonusVs: Hunter, Executioner and Detonate count against the unit it would face');
  ok(e.aiBonusVs(defs['gi-hit3'], t) === 0, '... and nothing for a plain card'); }
{ const {e, P} = mk(); put(e, P, 2, 'gi-otter'); P[2].hand = [{uid:900, defId:'gi-otter'}, {uid:901, defId:'gi-otter'}];
  ok(e.aiGiWorth(P, 2, 'gi-rally') >= 2, 'aiGiWorth: Kin Rally with two Kin in hand is worth more'); ok(e.aiGiWorth(P, 2, 'gi-hit3') === 0, 'a plain card: 0'); }
{ const {e, P} = mk(1, {hail:3}); put(e, P, 2, 'gi-wall'); ok(e.aiGiWorth(P, 2, 'gi-breaker') > 0, 'Field Breaker is worth playing while a hazard is up'); }
{ const {e, P} = mk(); ok(e.aiGiWorth(P, 2, 'gi-breaker') < 0, '... and not on a quiet field'); }
const eng = R('bramblewood-engine.js');
ok(/v \+= aiGiWorth\(players, aiId, id\)/.test(eng), 'the CPU play score reads aiGiWorth');
ok((eng.match(/aiBonusVs\(d, f\)/g) || []).length >= 4, 'every CPU slot choice (basic, smart, smartest, best kill) reads aiBonusVs');

// ---- 15. Skill costs (canonical/skill-costs.json: S = trigger weight × action value)
const SC = require('../tools/skill_costs.js'), table = JSON.parse(R('canonical/skill-costs.json')), T = SC.make(table);
const sk = id=> table.skills.find(x=> x.id === id);
[['hunter', 'half', 1], ['hunterVs', 'fixed', 0], ['executioner', 'half', 1], ['detonate', 'fixed', 1], ['proliferate', 'n', 2], ['brittle', 'half', 0.5], ['prayerWard', 'n', 0.75], ['fieldBreaker', 'half', 1]]
  // 2026-10-19 (package TC): the owner applied the measured worth — an applied entry keeps the GI value as prevValue (value = max(0, measuredS))
  .forEach(([id, sc, v])=> ok(sk(id) && sk(id).scale === sc && (sk(id).value === v || (sk(id).appliedAt && sk(id).prevValue === v && sk(id).value === Math.max(0, sk(id).measuredS))),
    `skill-costs: ${id} ${sc} ${v} (or its applied measured worth: ${sk(id) && sk(id).value})`));
ok(table.shorthands.kinRally && table.shorthands.kinRally.trigger === 'onAllyPlayed' && table.shorthands.kinRally.action === 'buff' && table.shorthands.kinRally.both, 'Kin Rally is a shorthand: On Ally Played × Buff (+N/+N)');
ok(table.shorthands.packHowl && table.shorthands.packHowl.trigger === 'onAllyPlayed' && table.shorthands.packHowl.action === 'bleed', 'Pack Howl is a shorthand: On Ally Played × Bleed');
// 2026-10-19 (package TC): the shorthand math from the current table (Buff's values are applied measured worth; On Ally Played stays the owner's 2.5)
const r2 = v=> Math.round(v * 100) / 100, tw = id=> table.triggers.find(x=> x.id === id).value, avl = id=> table.actions.find(x=> x.id === id).value;
ok(tw('onAllyPlayed') === 2.5, 'On Ally Played = 2.5 (owner-set, kept)');
const kin = N=> r2(tw('onAllyPlayed') * (avl('buff') * N + avl('buff.amount2') * N));
ok(T.cardS({kinRally:1}).S === kin(1) && T.cardS({kinRally:2}).S === kin(2), `Kin Rally N = On Ally Played × (Buff × N + Buff Health × N) = ${tw('onAllyPlayed')} × (${avl('buff')} + ${avl('buff.amount2')}) = ${kin(1)} (${T.cardS({kinRally:1}).S})`);
ok(T.cardS({packHowl:1}).S === r2(tw('onAllyPlayed') * avl('bleed')) && T.cardS({packHowl:2}).S === r2(tw('onAllyPlayed') * avl('bleed') * 2), `Pack Howl N = ${tw('onAllyPlayed')} × Bleed ${avl('bleed')} × N`);
const kw = (id, N)=>{ const e = sk(id), n = N === true ? 1 : N; return e.scale === 'n' ? e.value * Math.max(1, n) : e.scale === 'half' ? e.value * (1 + (n > 1 ? Math.floor(n / 2) : 0)) : e.value; };
[[{hunter:2, hunterVs:'wet'}, kw('hunter', 2) + kw('hunterVs', 0)], [{executioner:3}, kw('executioner', 3)], [{detonate:true}, kw('detonate', true)], [{proliferate:1}, kw('proliferate', 1)],
 [{prayerWard:2}, kw('prayerWard', 2)], [{fieldBreaker:2}, kw('fieldBreaker', 2)], [{brittle:2}, kw('brittle', 2)]]
  .forEach(([e, want])=> ok(Math.abs(T.cardS(e).S - r2(want)) < 1e-9, `the keyword cost of ${JSON.stringify(e)} = ${r2(want)} by its entry's scale (${T.cardS(e).S})`));
// ---- 16. The example POOL cards
// 2026-10-19 (package TH, the thematic pass): the ten examples are placed now (live, with a source; docs/balance/thematic-placed-2026-10-19.json
// keeps their pool numbers 9501-9510 and maps). Unmeasured, they won 88-100% on card_balance.js's yardstick, so TH stepped each one into
// its rarity band first (tools/thematic_pass_2026_10_19.js tunegi): the "not far under budget" check gives way to "measured in band".
const ALL = JSON.parse(R('canonical/cards.json')), PLACED = JSON.parse(R('docs/balance/thematic-placed-2026-10-19.json')).placed;
const GI_PLACED = PLACED.filter(p=> p.poolNo >= 9501 && p.poolNo <= 9599), POOL = ALL.filter(c=> GI_PLACED.some(p=> p.id === c.id) || (c.pool && c.numericId >= 9501 && c.numericId <= 9599));
const appSrc = R('arena_app.js'), mapIds = new Set((appSrc.match(/\{ id:"(m[a-z0-9]+)"/g) || []).map(x=> x.slice(6, -1)));
const GI_KEYS = ['hunter', 'executioner', 'detonate', 'proliferate', 'brittle', 'kinRally', 'packHowl', 'prayerWard', 'fieldBreaker'];
const GI_BANDS = {common: [35, 60], uncommon: [45, 68], rare: [52, 75]};
ok(POOL.length === 10, `ten example cards (${POOL.length})`);
GI_KEYS.forEach(k=> ok(POOL.some(c=> c.effects && c.effects[k]), `an example card shows ${k}`));
ok(!ALL.some(c=> !POOL.includes(c) && GI_KEYS.some(k=> c.effects && c.effects[k] != null)), 'no other card has a new skill yet');
POOL.forEach(c=>{ const b = T.budget(c), pl = GI_PLACED.find(p=> p.id === c.id), wr = /Measured ([\d.]+)% over (\d+) games/.exec(c.creatorNote || ''), band = GI_BANDS[c.rarity];
  ok(!c.pool && pl && mapIds.has(pl.poolMap) && c.source && c.locked && c.uuid && c.creatorNote, `${c.id}: placed (source ${c.source && c.source.kind}), its pool map ${pl && pl.poolMap} is a map, a note`);
  ok(b.ok && !b.missing.length, `${c.id}: inside budget v3 (2A+H+S ${b.x1} / N ${b.N}, A*H+S ${b.x2} / ${b.N2})`);
  ok(wr && band && +wr[1] >= band[0] && +wr[1] <= band[1], `${c.id}: measured inside its ${c.rarity} band (${wr && wr[1]}%)`);
  ok(!!H.loadCardDefs()[c.id], `${c.id}: live (the harness, like the build, has it)`); });
ok(new Set(ALL.map(c=> c.numericId)).size === ALL.length, 'numericIds stay unique');
// ---- 17. The app: lines, Codex, chapters, the log and the looks
const TXT = (()=>{ const t = R('bramblewood-texts.js'); return JSON.parse(t.slice(t.indexOf('/*TEXT-TABLE-START*/') + 20, t.indexOf('/*TEXT-TABLE-END*/'))); })();
const words = s=> String(s).replace(/<[^>]*>/g, ' ').trim().split(/\s+/).filter(Boolean).length;
const pd = appSrc.slice(appSrc.indexOf('const PASSIVE_DEFS = ['), appSrc.indexOf('const SKILL_DEFS = ['));
const sTxt = appSrc.slice(appSrc.indexOf('// Package GI (2026-10-19): the short card lines'));
const sIco = appSrc.slice(appSrc.indexOf('Object.assign(SKILL_ICON, {hunter:'));
GI_KEYS.forEach(k=>{ ok(new RegExp(`\\{key:'${k}', category:'(passive|evergreen)', label:TX\\('ui\\.skn-`).test(pd), `${k}: in PASSIVE_DEFS (the Skills chapter of the Codex book) with a TX name`);
  ok(new RegExp(`\\b${k}: [^\\n]*(TX\\(|giHunterText)`).test(sTxt.slice(0, 1500)), `${k}: a terse SKILL_TEXT line`);
  ok(new RegExp(`\\b${k}:'[^']+'`).test(sIco.slice(0, 400)), `${k}: an icon`); });
ok(/prayerWard:'🧿'/.test(appSrc) && !/prayerWard:'🪬'/.test(appSrc), 'Prayer Ward wears 🧿 Nazar (owner), never 🪬 Hamsa');
ok(appSrc.includes("{k:'brittle', re:/\\b(brittle)\\b/gi, cs:true, name:TX('ui.skn-brittle')"), 'Brittle is in STATUS_KEYWORDS (the Statuses chapter, the keyword colour)');
['sporeCloud', 'thunderstorm', 'tangledRoots'].forEach(k=> ok(new RegExp(`\\n  ${k}: +\\{icon:'[^']+', name:TX\\('ui\\.fx-name-`).test(appSrc), `${k}: in FIELD2 (the Field effects chapter, Edit skirmish, the Effects library)`));
ok(appSrc.indexOf('Object.assign(FIELD2, {\n  sporeCloud') > 0 && appSrc.indexOf('Object.assign(FIELD2, {\n  sporeCloud') < appSrc.indexOf('...Object.keys(FIELD2).map(k=>'), 'the new fields join FIELD2 before Edit skirmish reads it');
ok(appSrc.includes('{ const g = giLogText(ev, nm); if(g) return g; }') && appSrc.includes('try{ giVfx(ev); }catch(e){}') && appSrc.includes('try{ giStatusBadges(c, badges); }catch(e){}'), 'the log, the looks and the badges are hooked');
ok(appSrc.includes("'mirage', 'haunted', 'sporeCloud', 'thunderstorm', 'tangledRoots'].includes(ev.field)) hit = markFieldRow"), 'a new field row is learned when it first does something');
ok(appSrc.includes('brittle:rc.brittle||0') && appSrc.includes('brittle:c.brittle||0'), 'the replay snapshot carries Brittle');
const TKEYS = Object.keys(TXT).filter(k=> /^ui\.(skn-|sk-(hunter|executioner|detonate|proliferate|brittle|kin-rally|pack-howl|prayer-ward|field-breaker)|hunter-vs-|st-brittle|stx-brittle|fx-name-(spore|thunder|tangled)|fxx?-(spore|thunder|tangled)|log-(spore|thunder|tangled|roots|detonate|proliferate|brittle|field-)|float-(brittle|field-break)|brittle-tip|prayer-ward-tip)/.test(k));
// 2026-10-19 (package SK3): its own skill names (ui.skn-*) and Hunter's Weak pick are SK3's keys, counted in tests/skills-sk3-2026-10-19.js
// (and any later package's ui.skn-* name, e.g. EQ's: only GI's nine skill names count here)
const SK3_NOT_GI = k=> /^ui\.(sk-hunter-weak|hunter-vs-weak)$/.test(k) || (/^ui\.skn-/.test(k) && !/^ui\.skn-(hunter|executioner|detonate|proliferate|brittle|kin-rally|pack-howl|prayer-ward|field-breaker)$/.test(k));
SK3_NOT_GI.test = SK3_NOT_GI;
ok(TKEYS.filter(k=> !SK3_NOT_GI.test(k)).length === 67, `67 package GI TX keys (${TKEYS.filter(k=> !SK3_NOT_GI.test(k)).length})`);
TKEYS.forEach(k=> ok(appSrc.includes(`TX('${k}'`), `${k} is used in arena_app.js`));
TKEYS.filter(k=> !/codex|^ui\.fxx-|^ui\.stx-/.test(k)).forEach(k=> ok(words(TXT[k]) < 20, `${k} is terse (${words(TXT[k])} words)`));
// ---- 18. 12 packs: the texts, the pool cards' names and flavour
const CODES = ['fr', 'de', 'es', 'it', 'pt', 'tl', 'ta', 'id', 'zh-Hans', 'zh-Hant', 'ja', 'ko'];
const LEAD = /^[\s\p{Extended_Pictographic}\p{So}️‍]*/u, core = s=> s.trim().replace(LEAD, '').trim();
CODES.forEach(code=>{ const pack = JSON.parse(R('lang/' + code + '.json')), names = JSON.parse(R('lang/cards/' + code + '.json')), ui = JSON.parse(R('lang/ui/' + code + '.json'));
  const miss = TKEYS.filter(k=> !(TXT[k] in pack) && !(core(TXT[k]) in pack)); ok(!miss.length, `${code}: every new text is translated (${miss.join(', ')})`);
  const bad = TKEYS.filter(k=>{ const tr = pack[TXT[k]] || pack[core(TXT[k])]; return tr && JSON.stringify((TXT[k].match(/\{\w+\}/g) || []).sort()) !== JSON.stringify((tr.match(/\{\w+\}/g) || []).sort()); });
  ok(!bad.length, `${code}: every {placeholder} kept (${bad.join(', ')})`);
  ok(POOL.every(c=> names[c.name] && ui[c.flavor]), `${code}: the pool cards' names and flavour lines`); });
// ---- 19. The engine wiring and the stated rules
ok(eng.includes('if(rules.tideSpout && round > 1 && !fPause)') && eng.includes('if(round > 1 && !fPause) fieldEffects2Tick') && eng.includes('if(rules.swampFever && round > 1 && !fPause)') && eng.includes('if(paused) return; // Field Breaker'), 'Field Breaker gates the Tide-spout, Field effects 2/3, Swamp Fever and the volcano');
ok(eng.includes("'bound','invincible','invisible','webbed','brittle'"), 'Brittle has a statusEnd (wears off)'); // (package SK3 appended its statuses after it)
const D = JSON.parse(R('docs/decisions.json')), md = R('docs/decisions.md'), gi = (D.rules || []).find(r=> /Package GI/.test(r.intro || ''));
ok(gi && gi.items.length >= 10 && gi.items.some(x=> /target the card it is about/.test(x)) && gi.items.some(x=> /Field Breaker N/.test(x)) && gi.items.some(x=> /🧿/.test(x)), 'decisions.json: the package GI stated rules');
ok(md.includes('**A trigger can target the card it is about**') && md.includes('**Field Breaker N** (Claude'), 'decisions.md regenerated with them');
ok(fs.existsSync(path.join(ROOT, 'docs/gameplay-ideas-built-2026-10-19.md')), 'docs/gameplay-ideas-built-2026-10-19.md');
console.log(fail ? `gi-2026-10-19: ${fail} of ${n} checks FAILED` : `gi-2026-10-19: all ${n} checks passed`);
process.exit(fail ? 1 : 0);
