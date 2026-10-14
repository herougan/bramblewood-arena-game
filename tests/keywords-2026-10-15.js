#!/usr/bin/env node
// 2026-10-15: Tide cards no longer bring the tide (user: "Tide shouldn't occur even if you play a card with Tide."), Swimmer reads as
// its own skill (user: "It should be Swimmer - On tide, { ... }"), night no longer makes anyone miss (user: "Remove nightblindness
// causing 1/4 miss. It should only be for dark environments only. It will be an explicit field effect called 'Darkness'. 'Pitch
// Black' is the level 2 variant."), the stone cost sits top-left (user: "The stone cost should be on the top left."), Map 0 shows
// its field effects plainly and Misty says what it does, the replay waits for the killing blow before a death, "Check the whole
// map" is quicker, and the Admin showcase picker.
'use strict';
const fs = require('fs'), path = require('path');
const H = require('./lib/harness.js');
const E = H.Engine;
let fail = 0; const ok = (c, m)=>{ if(!c){ fail++; console.log('  ✗', m); } };
const so = id=> id===1 ? 'A' : 'B';
const U = (id, effects, o)=> Object.assign({id, name:id, attack:2, health:30, wait:0, cost:0, effects: effects || {}}, o || {});
const defs = Object.assign({}, H.loadCardDefs(), {
  'k5-tide': U('k5-tide', {tide:true}), 'k5-swim': U('k5-swim', {swimmer:true}), 'k5-moon': U('k5-moon', {moonpull:true}),
  'k5-tsu': U('k5-tsu', {tsunami:1}), 'k5-plain': U('k5-plain'), 'k5-see': U('k5-see', {darksight:true}),
  'k5-nb': U('k5-nb', {nightblind:true}), 'k5-lamp': U('k5-lamp', {lantern:true}),
});
const all = pl=> [...pl.row.left, ...pl.row.center, ...pl.row.right];
const mk = rules=>{ const e = E.makeSimEngine(defs, E.mulberry32(11), {recordEvents:true, battleMode:'open', rules: rules || {}}); return {e, P:{1:e.newPlayer(1,{}), 2:e.newPlayer(2,{})}}; };

// ---- 2. A Tide or Swimmer card no longer brings the tide; Moonpull, Tsunami and the field still do
for(const id of ['k5-tide', 'k5-swim']){ const {e, P} = mk(); e.roundStart(P, 1, so, {}, []); e.debugSpawnCard(P, so, 1, id, 'left', {}, []);
  for(let r = 2; r <= 5; r++) e.roundStart(P, r, so, {}, []);
  ok(e.getTide() === null, `${id}: no tide after four rounds (${e.getTide()})`); }
{ const {e, P} = mk(); e.roundStart(P, 1, so, {}, []); e.roundStart(P, 2, so, {}, []); e.debugSpawnCard(P, so, 1, 'k5-moon', 'left', {}, []);
  ok(e.getTide() === 'flow', `Moonpull still brings the tide in (${e.getTide()})`); }
{ const {e, P} = mk(); e.roundStart(P, 1, so, {}, []); e.debugSpawnCard(P, so, 2, 'k5-plain', 'left', {}, []); e.debugSpawnCard(P, so, 1, 'k5-tsu', 'left', {}, []);
  e.roundStart(P, 2, so, {}, []); ok(e.getTide() !== null, `a Tsunami still starts the tide (${e.getTide()})`); }
{ const {e, P} = mk({highTide:true}); const seen = []; for(let r = 2; r <= 5; r++){ e.roundStart(P, r, so, {}, []); seen.push(e.getTide()); }
  ok(seen.join(',') === 'ebb,flow,ebb,high', `High Tide (a field effect) runs its cycle on its own (${seen.join(',')})`); }
{ const {e, P} = mk({permaTide:true}); e.roundStart(P, 2, so, {}, []); ok(e.getTide() === 'flow', 'Perma-tide is always in'); }
{ const {e, P} = mk({tideSpout:true}); e.debugSpawnCard(P, so, 1, 'k5-plain', 'left', {}, []); e.roundStart(P, 2, so, {}, []); ok(e.getTide() !== null, 'the Tide-spout brings the tide'); }
// a Swimmer still gets its bonus once the field brings the tide
{ const {e, P} = mk({permaTide:true}); e.debugSpawnCard(P, so, 1, 'k5-swim', 'left', {}, []); e.roundStart(P, 2, so, {}, []); ok(e.isTide(all(P[1])[0]), 'a Swimmer is still a Tide unit for the tide\'s bonuses'); }

// ---- 5. Night alone: no miss. Darkness (level 1) 1 in 4, Pitch Black (level 2) 1 in 2
const missOf = (rules, id, extra)=>{ const {e, P} = mk(rules); e.debugSpawnCard(P, so, 1, id, 'left', {}, []); if(extra) e.debugSpawnCard(P, so, 1, extra, 'right', {}, []); e.roundStart(P, 2, so, {}, []); return e.sightMiss(all(P[1]).find(c=> c.defId===id), 1); };
ok(missOf({phase:'night'}, 'k5-plain') === 0, 'night: a plain unit never misses from the dark');
ok(missOf({phase:'night'}, 'k5-nb') === 0.5, 'a Night-blind unit still misses 1 in 2 at night (its own trait)');
ok(missOf({phase:'night'}, 'k5-nb', 'k5-lamp') === 0, 'a Lantern lights a Night-blind unit');
ok(missOf({dark:'dark', phase:'off'}, 'k5-plain') === 0.25, 'Darkness: 1 in 4');
ok(missOf({dark:'pitch', phase:'off'}, 'k5-plain') === 0.5, 'Pitch Black: 1 in 2');
ok(missOf({dark:'dark', phase:'off'}, 'k5-see') === 0, 'Darksight sees in Darkness');
{ // over many swings at night, nobody plain misses
  const {e, P} = mk({phase:'night'}); e.debugSpawnCard(P, so, 1, 'k5-plain', 'left', {}, []); e.debugSpawnCard(P, so, 2, 'k5-plain', 'left', {}, []);
  const ev = []; for(let r = 2; r <= 8; r++){ e.roundStart(P, r, so, {}, ev); e.resolveCombat(P, so, {}, ev, r % 2 ? 2 : 1); }
  ok(!ev.some(x=> x.type === 'blindMiss' && x.night), 'no night misses in a night fight'); }

// ---- the app side (source checks; the browser tests cover the screens)
const src = fs.readFileSync(path.join(__dirname, '..', 'arena_app.js'), 'utf8');
ok(/if\(d\.stoneCost>0\) parts\.push\(pipsHTML\('🪨', d\.stoneCost, 'stone'\)\);/.test(src), '1. the Stone cost is in the top-left cost badge (costBadgeParts)');
ok(/if\(bopts && bopts\.oreCostBadges\)\{ if\(d\.stoneCost\)/.test(src), '1. ...and no longer among the skill badges');
ok(/function swimmerLine\(e\)\{ return `Swimmer – On Tide, /.test(src), '3. Swimmer reads "Swimmer – On Tide, ..."');
ok(/if\(p\.key==='swimmer'\)\{ lines\.push\(/.test(src), '3. the card text gives a Swimmer its own line');
ok(/const DARK_MAPS = new Map\(\[\['mg','pitch'\], \['m4','dark'\], \['mz','dark'\], \['mj','dark'\]\]\);/.test(src), '5. the caves and dark places carry Darkness / Pitch Black');
ok(/DARK_LEVEL_NAME = \{dark:'Darkness', pitch:'Pitch Black'/.test(src) && !/'Pitchblack'/.test(src), '5. Pitchblack is now Pitch Black');
ok(/function fieldPlainMap\(mapId\)\{ try\{ return mapId != null && mapNumberOf\(mapId\) === 0;/.test(src), '8. Map 0 shows its field effects plainly');
ok(/const MISTY_TEXT = 'Mist hides the sun and moon/.test(src) && !/No day or night; the mist shifts/.test(src), '8. Misty says what it does');
ok(/gsap\.globalTimeline\.timeScale\(1\); gsap\.ticker\.lagSmoothing\(m && m\.resolving \? 0 : 500, 33\)/.test(src), '4. the fight speed is applied once (no GSAP slow-down on top)');
ok(/if\(ev\.type==='death' && ev\.uid!=null && m\._pendingImpacts && m\._pendingImpacts\[String\(ev\.uid\)\]\)/.test(src), '4. a death waits for its killing blow to land');
ok(/if\(!m\.replayCards\[u\] && !\['left','center','right'\]\.some\(ln=> \(m\.players\[pid\]\.row\[ln\]\|\|\[\]\)\.some\(c=> c\.uid===u\)\)\)\{/.test(src), '4. a token spawned and killed in one round still shows (so the blow that kills it lands on something)');
ok(/const SKIRMISH_CURVE_SIMS = 30;/.test(src) && /skirmishCurveSimCache\.get\(sig\)/.test(src), '7. Check the whole map: 30 fights a skirmish, cached, a skirmish per tick');
ok(/function openShowcasePicker\(\)/.test(src) && /id="adminShowcaseBtn"/.test(src) && /async function saveNodeShowcase\(mapId, key, id\)/.test(src), '6. the Admin showcase picker');
console.log(`keywords-2026-10-15: ${fail ? fail + ' failure(s)' : 'all passed'}`); process.exit(fail ? 1 : 0);
