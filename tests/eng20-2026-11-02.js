#!/usr/bin/env node
// 2026-11-02 (package ENG20): the owner's 22:44 notes 1-7, and his 22:47 / 22:49 additions.
//   1  Remember fires once a card; the board strikes its line and drops its pip; a candlestick when it fires.
//   2  Water counters (water damage adds them = damage, the tide fills dry units: Flood 2, Ebb 1); fire dries them 1 a point, then lights Burn.
//   3  Stop, Drop and Roll: it rolls instead of burning (Wait +1).
//   4  Heavy Headwind (-2 Attack, skills twice), Heavy Tailwind (Quick + 1 Fast Forward), Crosswind (+0/2 Flyers), Heavy Crosswind (+0/5).
//   5  A +0/N buff ending never kills, and damage eats the buff's Health first.
//   6  The CPU's Devour (aiDevourPlan).
//   7  King Slayer's bonus hits leaders too.
//   22:47  Glean (Berries -> Shield) and Lumber Feast N (eat Lumber, +1/+1 each).   22:49  the calm wind pill.
'use strict';
const fs = require('fs'), path = require('path');
const H = require('./lib/harness.js');
const E = H.Engine, ROOT = H.ROOT, R = f=> fs.readFileSync(path.join(ROOT, f), 'utf8'), J = f=> JSON.parse(R(f));
let fail = 0, n = 0; const ok = (c, m)=>{ n++; if(!c){ fail++; console.log('  ✗', m); } };
const so = id=> id === 1 ? 'A' : 'B';
const defs = Object.assign({}, H.loadCardDefs(), {
  'x-rem':   {id:'x-rem', name:'Rem', attack:1, health:3, wait:0, cost:0, effects:{remember:1}},
  'x-wall':  {id:'x-wall', name:'Wall', attack:0, health:500, wait:9, cost:0, effects:{}},
  'x-src':   {id:'x-src', name:'Src', attack:0, health:50, wait:9, cost:0, effects:{}},
  'x-land':  {id:'x-land', name:'Land', attack:0, health:40, wait:9, cost:0, effects:{}},
  'x-swim':  {id:'x-swim', name:'Swim', attack:0, health:40, wait:9, cost:0, effects:{swimmer:true}},
  'x-flyw':  {id:'x-flyw', name:'FlyW', attack:0, health:40, wait:9, cost:0, effects:{flying:true}},
  'x-roll':  {id:'x-roll', name:'Roll', attack:0, health:40, wait:0, cost:0, effects:{dropRoll:true}},
  'x-proof': {id:'x-proof', name:'Proof', attack:0, health:40, wait:9, cost:0, resist:['heat'], effects:{}},
  'x-fly3':  {id:'x-fly3', name:'Fly3', attack:3, health:200, wait:0, cost:0, effects:{flying:true}},
  'x-hwfly': {id:'x-hwfly', name:'HwFly', attack:0, health:200, wait:0, cost:0, effects:{flying:true, arrow:1}},
  'x-wallw': {id:'x-wallw', name:'WallW', attack:0, health:500, wait:9, cost:0, effects:{}},
  'x-ks':    {id:'x-ks', name:'KS', attack:3, health:20, wait:0, cost:0, effects:{kingSlayer:4}},
  'x-lead':  {id:'x-lead', name:'Lead', attack:0, health:60, wait:9, cost:0, effects:{leader:true}},
  'x-glean': {id:'x-glean', name:'Glean', attack:0, health:20, wait:0, cost:0, effects:{glean:true}},
  'x-feast': {id:'x-feast', name:'Feast', attack:1, health:1, wait:9, cost:0, effects:{lumberFeast:3}},
  'x-big':   {id:'x-big', name:'Big', attack:6, health:20, wait:1, cost:9, effects:{}},
  'x-weak':  {id:'x-weak', name:'Weak', attack:1, health:1, wait:1, cost:0, effects:{}},
  'x-cheap': {id:'x-cheap', name:'Cheap', attack:5, health:20, wait:1, cost:0, effects:{guardian:true, regen:2}},
});
const all = pl=> [...pl.row.left, ...pl.row.center, ...pl.row.right];
function mk(seed, rules){ const e = E.makeSimEngine(defs, E.mulberry32(seed || 5), {recordEvents:true, battleMode:'open', rules: rules || undefined}); return {e, P:{1: e.newPlayer(1, {}), 2: e.newPlayer(2, {})}}; }
const spawn = (e, P, pid, id, side)=>{ e.debugSpawnCard(P, so, pid, id, side || 'left', {}, []); return all(P[pid]).find(c=> c.defId === id && !c.__t && (c.__t = true)); };
const TXT = require(path.join(ROOT, 'bramblewood-texts.js')).TEXT, app = R('arena_app.js'), eng = R('bramblewood-engine.js');

// ---- 1 Remember: once a card ---------------------------------------------------------------------------------------------
{ const {e, P} = mk(3); spawn(e, P, 2, 'x-wall'); P[1].exile.push({defId:'x-rem'}); P[1].echoes = 5;
  const ev = []; e.roundStart(P, 1, so, {}, ev); const back = all(P[1]).find(c=> c.defId === 'x-rem');
  ok(back && back.rememberSpent && ev.some(x=> x.type === 'remember'), '1: Remember brings the card back and marks it spent');
  back.hasRemovalCounter = true; back.hp = 0; e.removeDeadCards(P, so, {}, {}, []);
  const ent = P[1].exile.find(x=> x.defId === 'x-rem');
  ok(ent && ent.rememberSpent, '1: dying again, its Removal Zone entry carries the spent mark');
  P[1].echoes = 9; const ev2 = []; e.roundStart(P, 2, so, {}, ev2);
  ok(!all(P[1]).some(c=> c.defId === 'x-rem' && c.hp > 0) && !ev2.some(x=> x.type === 'remember'), '1: it never comes back a second time');
  P[1].exile.push({defId:'x-rem'}); const ev3 = []; e.roundStart(P, 3, so, {}, ev3);
  ok(ev3.some(x=> x.type === 'remember'), '1: another copy (not spent) still remembers'); }
ok(/p\.key==='remember' && liveCard\)\{ const lc = currentCardByUidSafe\(liveCard\.uid\) \|\| liveCard; if\(lc && lc\.rememberSpent\)/.test(app), '1: the card text strikes a spent Remember line');
ok(/k === 'remember' && en20RememberSpent\(bopts\)/.test(app), '1: the spent Remember pip is gone from the skill strip');
ok(/function en20CandleVfx/.test(app) && /ev\.type==='remember'[\s\S]{0,500}en20CandleVfx\(el\)/.test(app), '1: a candlestick VFX when Remember fires');

// ---- 2 Water and fire ----------------------------------------------------------------------------------------------------
const hitWith = (e, P, c, amt, type, srcUid)=> e.damageCardFlat(c, amt, type, srcUid != null ? 'x-src' : null, srcUid);
{ const {e, P} = mk(4); const S = spawn(e, P, 1, 'x-src'), T = spawn(e, P, 2, 'x-land');
  hitWith(e, P, T, 2, 'water', S.uid); ok(T.water === 2 && e.wetCountOf(T) === 2, `2: 2 water damage adds 2 water counters (${T.water})`);
  hitWith(e, P, T, 5, 'water', S.uid); ok(T.water === e.EN20.waterMax, `2: water counters cap at ${e.EN20.waterMax} (${T.water})`);
  T.water = 2; hitWith(e, P, T, 3, 'heat', S.uid); ok(T.water === 0 && T.burn === 1, `2: 3 fire on 2 counters dries them and the point left lights Burn 1 (water ${T.water}, burn ${T.burn})`); // 2026-11-07 (ENG28, owner 22:16 #2: + 1 Burn a hit): was Burn 2
  T.burn = 0; T.water = 3; hitWith(e, P, T, 3, 'heat', S.uid); ok(T.water === 0 && !(T.burn > 0), '2: 3 fire on 3 counters only dries them');
  T.water = 0; T.burn = 0; hitWith(e, P, T, 2, 'heat', null); ok(!(T.burn > 0), '2: field fire (no source) lights nothing');
  T.water = 1; hitWith(e, P, T, 2, 'heat', null); ok(T.water === 0, '2: field fire still dries');
  hitWith(e, P, T, 1, 'heat', S.uid); ok(T.burn === 1, '2: a sourced fire hit on a dry unit lights it (Burn 1)'); // 2026-11-07 (ENG28): was 2
  hitWith(e, P, T, 1, 'heat', S.uid); ok(T.burn === 2, '2: a second fire hit stacks (Burn 2)'); // 2026-11-07 (ENG28): Burn stacks (was refreshed to 2)
  hitWith(e, P, T, 1, 'water', S.uid); ok(!(T.burn > 0) && T.water === 1, '2: water puts Burn out (and soaks)'); }
{ const {e, P} = mk(4); const S = spawn(e, P, 1, 'x-src'), T = spawn(e, P, 2, 'x-land'); hitWith(e, P, T, 1, 'heat', S.uid); hitWith(e, P, T, 1, 'heat', S.uid); // 2026-11-07 (ENG28): two hits = Burn 2 (one hit was 2)
  const hp0 = T.hp, ev = []; e.roundStart(P, 1, so, {}, ev); e.resolveCombat(P, so, {}, ev, 1); // the ticks run as the round's combat opens (2026-11-07, ENG28: hp0 is read after both hits)
  ok(T.hp === hp0 - 1 && T.burn === 1 && ev.some(x=> x.type === 'burnTick' && x.uid === T.uid && x.dmg === 1), `2: Burn ticks 1 fire at the round's start (${hp0} -> ${T.hp}, ${T.burn} left)`);
  e.roundStart(P, 2, so, {}, []); e.resolveCombat(P, so, {}, [], 1); ok(T.hp === hp0 - 2 && !(T.burn > 0), '2: two rounds, then it is out');
  const P2 = spawn(e, P, 2, 'x-proof'); hitWith(e, P, P2, 3, 'heat', S.uid); ok(!(P2.burn > 0), '2: a unit that resists fire never burns'); }
{ // the tide's counters: Flood fills a dry unit in the water to 2, a Flyer stays dry; a wet unit gets no more
  const {e, P} = mk(6, {permaTide:true}); const L = spawn(e, P, 1, 'x-land'), F = spawn(e, P, 1, 'x-flyw', 'right'); spawn(e, P, 2, 'x-wall');
  e.roundStart(P, 1, so, {}, []); ok(L.water === 2 && !(F.water > 0), `2: a Flood gives a dry land unit 2 counters, a Flyer none (${L.water}, ${F.water})`);
  // 2026-11-03 (package ENG22, owner 22:02: "Wetness is lost 1 per turn."): the round start takes 1 off first, then the tide fills a dry unit
  L.water = 3; e.roundStart(P, 2, so, {}, []); ok(L.water === 2, `2: a unit that has counters loses 1 and gets none from the tide (3 -> ${L.water})`);
  L.water = 1; e.roundStart(P, 3, so, {}, []); ok(L.water === 2, `2: a unit dried to 0 by the round's loss is filled again by the Flood (1 -> 0 -> ${L.water})`); }
{ const {e, P} = mk(6); const L = spawn(e, P, 1, 'x-land'); spawn(e, P, 2, 'x-wall'); L.water = 3; const got = [];
  for(let r = 1; r <= 4; r++){ e.roundStart(P, r, so, {}, []); got.push(L.water); }
  ok(got.join(',') === '2,1,0,0', `2: with no tide, wetness is lost 1 a round (ENG22; ${got})`); }
{ const {e, P} = mk(6); spawn(e, P, 2, 'x-wall'); e.startTide(); let ebb = false, sw = null, land = null;
  for(let r = 1; r <= 4 && !ebb; r++){ e.roundStart(P, r, so, {}, []); if(e.getTide() === 'flow' && !sw){ /* spawn dry units for the next Ebb */ }
    if(e.getTide() === 'ebb'){ ebb = true; } }
  sw = spawn(e, P, 1, 'x-swim'); land = spawn(e, P, 1, 'x-land', 'right'); // fresh and dry; the next round: flow, then ebb
  let seenEbb = false; for(let r = 5; r <= 8 && !seenEbb; r++){ sw.water = 0; land.water = 0; e.roundStart(P, r, so, {}, []); if(e.getTide() === 'ebb'){ seenEbb = true; ok(sw.water === 1 && !(land.water > 0), `2: an Ebb gives a dry Swimmer 1 counter, a land unit none (${sw.water}, ${land.water})`); } }
  ok(seenEbb, '2: (an Ebb came)'); }
{ const {e, P} = mk(4); const S = spawn(e, P, 1, 'x-src'), T = spawn(e, P, 2, 'x-land'); T.water = 2; const hp0 = T.hp; hitWith(e, P, T, 2, 'shock', S.uid);
  ok(hp0 - T.hp === 4, `2: lightning still gets +1 a Wet counter (2 + 2 = ${hp0 - T.hp})`); }
ok(/function en20StatusBadges/.test(app) && /abadge en20-water/.test(app) && /abadge en20-burn/.test(app), '2: water counters and Burn show as pips');

// ---- 3 Stop, Drop and Roll -------------------------------------------------------------------------------------------------
{ const {e, P} = mk(4); const S = spawn(e, P, 1, 'x-src'), T = spawn(e, P, 2, 'x-roll'); const w0 = T.wait || 0, hp0 = T.hp; hitWith(e, P, T, 3, 'heat', S.uid);
  ok(!(T.burn > 0) && T.wait === w0 + 1 && T.hp === hp0 - 3, `3: it takes the fire (${hp0} -> ${T.hp}), rolls instead of burning, Wait +1 (${w0} -> ${T.wait})`);
  T.water = 3; const w1 = T.wait; hitWith(e, P, T, 2, 'heat', S.uid); ok(T.wait === w1, '3: no roll when the fire only dries it'); }

// ---- 4 Winds -----------------------------------------------------------------------------------------------------------------
function windRound(rules, id, want, wallId){ for(let s = 1; s <= 200; s++){ const {e, P} = mk(s, rules); const F = spawn(e, P, 1, id); spawn(e, P, 2, wallId || 'x-wallw');
    e.roundStart(P, 1, so, {}, []); if(e.windSideOf(1) !== want) continue; const ev = []; e.resolveCombat(P, so, {}, ev, 2); return {e, P, F, ev}; } return null; }
{ const head = windRound({wind:'gale', heavyWind:1}, 'x-fly3', 'head'), tail = windRound({wind:'gale', heavyWind:1}, 'x-fly3', 'tail');
  const dmg = r=> { const h = r && r.ev.filter(x=> x.type === 'hit' && x.attUid === r.F.uid); return h ? h.map(x=> x.dmg) : null; };
  ok(head && head.e.getWindKind() === 'heavy' && JSON.stringify(dmg(head)) === '[1]', `4: a Heavy Headwind cuts a 3-Attack Flyer to 1 (${JSON.stringify(dmg(head))})`);
  ok(tail && JSON.stringify(dmg(tail)) === '[3,3]' && tail.ev.some(x=> x.type === 'statusFx' && x.kind === 'tailwind' && x.heavy), `4: a Heavy Tailwind Flyer is Quick and swings once more (Fast Forward) (${JSON.stringify(dmg(tail))})`);
  const hw = windRound({wind:'gale', heavyWind:1}, 'x-hwfly', 'head'), arrows = hw ? hw.ev.filter(x=> x.type === 'arrow' && x.uid === hw.F.uid).length : -1;
  ok(arrows === 2, `4: a Heavy Headwind doubles a Flyer's Arrow (${arrows})`);
  const nh = windRound({wind:'gale'}, 'x-hwfly', 'head'), a1 = nh ? nh.ev.filter(x=> x.type === 'arrow' && x.uid === nh.F.uid).length : -1;
  ok(a1 === 1 && nh.e.getWindKind() === 'normal', `4: a plain Headwind still doubles nothing (${a1})`); }
{ const {e, P} = mk(2, {wind:'gale', crosswind:1}); const F = spawn(e, P, 1, 'x-flyw'), G = spawn(e, P, 2, 'x-flyw'), L = spawn(e, P, 1, 'x-land', 'right'); const m0 = F.maxHp;
  e.roundStart(P, 1, so, {}, []);
  ok(e.windSideOf(1) === 'cross' && e.windSideOf(2) === 'cross', '4: a Crosswind has no back or face');
  ok(F.maxHp === m0 + 2 && F.hp === m0 + 2 && G.maxHp === m0 + 2 && L.maxHp === 40, `4: Crosswind: every Flyer, both sides, +0/2; ground units none (${F.maxHp}, ${G.maxHp}, ${L.maxHp})`); }
{ const {e, P} = mk(2, {wind:'gale', crosswind:1, heavyWind:1}); const F = spawn(e, P, 1, 'x-flyw'); spawn(e, P, 2, 'x-wall'); e.roundStart(P, 1, so, {}, []);
  ok(e.getWindKind() === 'heavyCross' && F.maxHp === 45, `4: a Heavy Crosswind gives +0/5 (${F.maxHp})`); }
{ // the gust ends: a Flyer hurt into the buff keeps its Health (ENG20-5)
  let done = false; for(let s = 1; s <= 300 && !done; s++){ const {e, P} = mk(s, {wind:'windy', crosswind:1}); const F = spawn(e, P, 1, 'x-flyw'); spawn(e, P, 2, 'x-wall');
    e.roundStart(P, 1, so, {}, []); if(!e.isCrosswind()) continue; F.hp = 1; e.roundStart(P, 2, so, {}, []); if(e.isCrosswind()) continue;
    done = true; ok(F.hp === 1 && F.maxHp === 40, `4/5: the Crosswind dies down: a Flyer at 1 stays at 1, max back to 40 (${F.hp}/${F.maxHp})`); }
  ok(done, '4: (a crosswind round then a calm one)'); }
{ const t = {normal:0, heavy:0, cross:0, heavyCross:0}; const {e, P} = mk(91, {wind:'gale', heavyWind:0.25, crosswind:0.15}); spawn(e, P, 1, 'x-wall'); spawn(e, P, 2, 'x-wall');
  for(let r = 1; r <= 2000; r++){ e.roundStart(P, r, so, {}, []); t[e.getWindKind()]++; }
  ok(Math.abs(t.cross / 2000 - 0.15 * 0.75) < 0.03 && Math.abs(t.heavy / 2000 - 0.85 * 0.25) < 0.03 && t.heavyCross > 0, `4: the rolls follow heavyWind / crosswind (${JSON.stringify(t)})`); }
{ const {e, P} = mk(91, {wind:'gale'}); spawn(e, P, 1, 'x-wall'); spawn(e, P, 2, 'x-wall'); let other = 0; for(let r = 1; r <= 300; r++){ e.roundStart(P, r, so, {}, []); if(e.getWindKind() !== 'normal') other++; }
  ok(other === 0, '4: without the rules a fight never rolls heavy or cross wind (every map up to now)'); }
ok(/heavyWind = ENG20_WIND\.heavy/.test(app) && /ENG20_WIND_FROM_MAP = 30/.test(app), '4: the app sets the heavy / cross odds from Map 30 on a windy map');
['ui.eng20-wind-heavy-head', 'ui.eng20-wind-heavy-tail', 'ui.eng20-wind-cross', 'ui.eng20-wind-heavy-cross', 'ui.eng20-wind-calm', 'ui.eng20-wind-calm-tip'].forEach(k=> ok(TXT[k], `4: text ${k}`));
ok(TXT['ui.eng20-wind-calm-tip'] === 'Calm: no wind' && /wind-ico is-still/.test(app), '22:49: the calm pill has its own still-air icon and says "Calm: no wind"');

// ---- 5 Buff Health -------------------------------------------------------------------------------------------------------------
{ const {e} = mk(1); const f = e.en20HpAfter;
  ok(f(5, 5, 3, 0) === 5, '5: an 8/8 unit hit for 3 (5/8) keeps 5 when its +0/3 ends (the hit took the buff)');
  ok(f(8, 5, 3, 0) === 5, '5: an unhurt 8/8 unit drops to 5/5');
  ok(f(1, 5, 3, 0) === 1 && f(1, 1, 3, 0) === 1, '5: never below 1 from a buff ending');
  ok(f(5, 9, 0, 4) === 9, '5: a growing buff adds its Health');
  ok(f(5, 4, -1, -2) === 4 && f(3, 4, -1, -2) === 2, '5: a drawback deepening (Isolation) still takes Health'); }
ok((eng.match(/en20HpAfter\(/g) || []).length >= 7, '5: the aura Health (Nature, Kinship, Pack, Formation / Isolation, Herald) uses the rule');

// ---- 6 the CPU's Devour ------------------------------------------------------------------------------------------------------
function devourGame(seed, hand, lumber){ const {e, P} = mk(seed); const dv = spawn(e, P, 2, 'hollow-belly-rat'); spawn(e, P, 1, 'x-wall');
  P[2].hand = hand.map((id, i)=> ({uid: 9000 + i, defId: id})); P[2].lumber = lumber; P[2].deck = []; const ev = []; e.aiTakeTurn(P, so, 2, {}, ev); return {e, P, dv, ev}; }
{ let fed = 0; for(let s = 1; s <= 20; s++){ const g = devourGame(s, ['x-big', 'x-big'], 0); if(g.ev.some(x=> x.type === 'devour')) fed++; }
  ok(fed === 20, `6: nothing affordable in hand: the CPU feeds its Devourer every time (${fed}/20; was a 40% coin flip)`); }
{ let fed = 0; for(let s = 1; s <= 20; s++){ const g = devourGame(s, ['x-cheap', 'x-big'], 0); if(g.ev.some(x=> x.type === 'devour')) fed++; }
  ok(fed === 0, `6: a good play waiting and a small hand: it plays the card instead (${fed}/20 fed)`); }
{ const g = devourGame(3, ['x-big', 'x-big', 'x-big', 'x-weak'], 0); const d = g.ev.find(x=> x.type === 'devour');
  ok(d && d.eatenDefId === 'x-big' && g.dv.devoured, '6: with a full-ish hand it eats an unaffordable card, not its playable one'); }
{ const {e, P} = mk(1); const dv = spawn(e, P, 2, 'hollow-belly-rat'); dv.hp = 2; P[2].hand = [{uid:1, defId:'x-big'}, {uid:2, defId:'x-big'}];
  ok(!e.aiDevourPlan(P[2], ()=> 1), '6: a Devourer about to die (2 Health) is not fed'); }

// ---- 7 King Slayer on leaders --------------------------------------------------------------------------------------------------
{ const {e, P} = mk(2); const K = spawn(e, P, 1, 'x-ks'), A = spawn(e, P, 2, 'x-wall'), B = spawn(e, P, 2, 'x-wall', 'right');
  B.isLeader = true; const a = e.damageCard(A, 3, 'physical', K).dmg, b = e.damageCard(B, 3, 'physical', K).dmg;
  ok(a === 3 && b === 7, `7: King Slayer 4 adds 4 on a leader (${a} vs ${b})`);
  const C = spawn(e, P, 2, 'x-lead', 'right'); const c = e.damageCardFlat(C, 2, 'physical', 'x-ks', K.uid); ok(c === 6, `7: on a Leader-skill card, a shot too (${c})`);
  const D = spawn(e, P, 1, 'x-wall', 'right'); D.isLeader = true; ok(e.damageCard(D, 3, 'physical', K).dmg === 7, '7: its own side\'s leader too (both sides)'); }

// ---- 22:47 Glean and Lumber Feast ---------------------------------------------------------------------------------------------
{ const {e, P} = mk(2); const G = spawn(e, P, 1, 'x-glean'), A = spawn(e, P, 1, 'x-wall', 'right'), B = spawn(e, P, 2, 'x-wall'); A.sk2Berries = 2; B.sk2Berries = 3;
  const ev = []; e.endOfRoundUpkeep(P, so, {}, ev);
  ok(G.shield === 5 && !(A.sk2Berries > 0) && !(B.sk2Berries > 0) && ev.some(x=> x.kind === 'en20Glean' && x.amount === 5), `Glean: it takes every Berry on the board, both sides (+${G.shield} Shield)`); }
{ const {e, P} = mk(2); P[1].lumber = 5; const F = spawn(e, P, 1, 'x-feast'); ok(F.atk === 4 && F.maxHp === 4 && P[1].lumber === 2, `Lumber Feast 3: eats 3 of 5 Lumber, +3/+3 (${F.atk}/${F.maxHp}, ${P[1].lumber} left)`);
  P[1].lumber = 1; const F2 = spawn(e, P, 1, 'x-feast', 'right'); ok(F2.atk === 2 && P[1].lumber === 0, '   with 1 Lumber: +1/+1');
  P[1].lumber = 0; const F3 = spawn(e, P, 1, 'x-feast'); ok(F3.atk === 1, '   with none: nothing'); }

// ---- prices, texts, decisions --------------------------------------------------------------------------------------------------
{ const sc = J('canonical/skill-costs.json'), ids = new Set([].concat(...Object.values(sc).filter(Array.isArray)).map(x=> x && x.id));
  ['dropRoll', 'glean', 'lumberFeast'].forEach(k=> ok(ids.has(k), `price: ${k} in canonical/skill-costs.json`)); }
['ui.eng20-droproll-name', 'ui.eng20-droproll', 'ui.eng20-glean-name', 'ui.eng20-glean', 'ui.eng20-feast-name', 'ui.eng20-feast', 'ui.eng20-remember-used', 'ui.eng20-burn-tip', 'ui.eng20-water-tip'].forEach(k=> ok(TXT[k], `text ${k}`));
{ const packs = ['fr', 'de', 'es', 'it', 'pt', 'tl', 'ta', 'id', 'zh-Hans', 'zh-Hant', 'ja', 'ko'];
  const en = ['ui.eng20-droproll', 'ui.eng20-glean', 'ui.eng20-wind-cross', 'ui.eng20-wind-calm-tip'].map(k=> TXT[k]);
  packs.forEach(c=>{ const p = J('lang/' + c + '.json'); ok(en.every(t=> p[t]), `i18n: ${c} has the ENG20 texts`); }); }
{ const d = R('docs/decisions.json'); ['ENG20-1', 'ENG20-2', 'ENG20-3', 'ENG20-4'].forEach(id=> ok(d.includes('"id": "' + id + '"'), `decision ${id}`)); }
ok(/owner 2026-11-02 22:44/.test(R('docs/project-state.md')), 'project-state: the settled rules name the owner note');

console.log(fail ? `eng20-2026-11-02: ${fail}/${n} FAILED` : `eng20-2026-11-02: all ${n} checks passed`);
process.exit(fail ? 1 : 0);
