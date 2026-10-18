#!/usr/bin/env node
// Package X2 (2026-10-18, owner decisions 15:05):
//   12  "Your choice of balance": the Enraged / Thrashing raid stages lose their extra round-start volley (the boss's back rows already
//       strike every round, reserveActs); +Attack, the field and the bramble % stay.
//   13  "No Shocked status on Brambles.": lightning at a bramble deals its damage again (the morning's "grounded" rule is gone), but a
//       bramble is never Shocked and never Wet.
//   15  "Smartest. - if we progressively make a smarter CPU, use that one in the future.": the Babel Spire plays at AI_LEVEL_MAX.
//   16  The Tide: a Flood wets every land unit (not a Swimmer / Tide unit, not Flying), in every row; Swimmers are Wet in Flood and Ebb;
//       the look: Flood fills the whole board, the surface effects wait for it to settle, Ebb is a thin band at the bottom, the wet look
//       replaces the waded ring, Swimmers splash now and then.
'use strict';
const fs = require('fs'), path = require('path');
const H = require('./lib/harness.js');
const E = H.Engine;
const R = require('../bramblewood-raid.js');
let fail = 0, n = 0; const ok = (c, m)=>{ n++; if(!c){ fail++; console.log('  ✗', m); } };
const so = id=> id===1 ? 'A' : 'B';
const ROOT = path.join(__dirname, '..');
const src = fs.readFileSync(path.join(ROOT, 'arena_app.js'), 'utf8'), tpl = fs.readFileSync(path.join(ROOT, 'arena_template.html'), 'utf8');
const U = (id, effects, o)=> Object.assign({id, name:id, attack:0, health:50, wait:0, cost:0, effects: effects || {}}, o || {});
const defs = Object.assign({}, H.loadCardDefs(), {
  'x2-land': U('x2-land'), 'x2-swim': U('x2-swim', {swimmer:true}), 'x2-tide': U('x2-tide', {tide:true}), 'x2-fly': U('x2-fly', {flying:true}),
  'x2-sky': U('x2-sky', {lightning:4}), 'x2-sb': U('x2-sb', {shockBolt:3}),
});
const all = pl=> [...pl.row.left, ...pl.row.center, ...pl.row.right];
function mk(rules, opts){ const e = E.makeSimEngine(defs, E.mulberry32(5), Object.assign({recordEvents:true, battleMode:'open', rules: rules || {}}, opts || {}));
  return {e, P:{1:e.newPlayer(1, {}, {health:200}), 2:e.newPlayer(2, {}, {health:200})}}; }
function put(e, P, pid, id, ev){ e.debugSpawnCard(P, so, pid, id, 'left', {}, ev || []); return all(P[pid]).filter(x=> x.defId === id).reduce((a, x)=> (!a || x.uid > a.uid) ? x : a, null); }
function toTide(e, P, want){ for(let r = 1; r < 9 && e.getTide() !== want; r++) e.roundStart(P, r, so, {}, []); return e.getTide() === want; }

// ---- 16a: the Wet rule
{ const {e, P} = mk({tide:true}); const L = put(e, P, 1, 'x2-land'), S = put(e, P, 1, 'x2-swim'), T = put(e, P, 2, 'x2-tide'), F = put(e, P, 2, 'x2-fly');
  ok(e.getTide() === null && e.wetCountOf(L) === 0 && e.wetCountOf(S) === 1 && e.wetCountOf(F) === 0, 'no tide yet: a land unit is dry, a Swimmer is in the water');
  ok(toTide(e, P, 'flow'), 'the Tide reaches Flood');
  ok(e.wetCountOf(L) === 1, 'Flood: a land unit is Wet');
  ok(e.wetCountOf(S) === 1 && e.wetCountOf(T) === 1, 'Flood: a Swimmer and a Tide unit are Wet (one counter: in the water)');
  ok(e.wetCountOf(F) === 0, 'Flood: a flyer stays dry');
  const N = put(e, P, 1, 'x2-land'); ok(e.wetCountOf(N) === 1, 'a land unit that arrives in a Flood is Wet at once');
  ok(toTide(e, P, 'ebb'), 'then Ebb');
  ok(e.wetCountOf(L) === 0 && e.wetCountOf(N) === 0, 'Ebb: the land units dry out');
  ok(e.wetCountOf(S) === 1 && e.wetCountOf(T) === 1, 'Ebb: Swimmers and Tide units stay Wet');
  e.setField('rain', 3); ok(e.wetCountOf(F) === 1 && e.wetCountOf(S) === 2 && e.wetCountOf(L) === 1, 'Rain still adds a counter for everyone, flyers too');
  ok(e.wetCountOf({kind:'hq'}) === 0, 'a castle is never Wet'); }
{ const {e, P} = mk({highTide:true}); const L = put(e, P, 1, 'x2-land'); ok(toTide(e, P, 'high') && e.wetCountOf(L) === 1, 'High Tide wets land units like a Flood'); }
{ const {e, P} = mk({permaTide:true}); const L = put(e, P, 1, 'x2-land'); ok(e.getTide() === 'flow' && e.wetCountOf(L) === 1, 'Perma-tide (always Flood): land units are Wet'); }
{ const {e, P} = mk({permaTide:true, ashy:true}); const F = put(e, P, 2, 'x2-fly'); ok(e.wetCountOf(F) === 1, 'an Ashy sky grounds a flyer: it wades in too'); }
// every row: a raid's middle / back-row unit is in the Flood too
{ const {e, P} = mk({permaTide:true}, {reserveRows:2}); const M = e.fillReserve(P[2], 1, 0, 'x2-land'), B = e.fillReserve(P[1], 2, 0, 'x2-fly');
  ok(M && e.wetCountOf(M) === 1 && B && e.wetCountOf(B) === 0, 'reserve rows: a middle-row land unit is Wet in a Flood, a back-row flyer is not'); }
// the Wet bonus on a lightning hit follows it
{ const {e, P} = mk({permaTide:true}); const L = put(e, P, 2, 'x2-land'); e.debugSpawnCard(P, so, 1, 'x2-sky', 'left', {}, []); ok(L.hp === 50 - 5, `Lightning 4 at a land unit in a Flood: 4 + 1 Wet (${50 - L.hp})`); }

// ---- 13: lightning at a bramble lands, but no Shocked and no Wet bonus
{ const {e, P} = mk({permaTide:true}); e.setField('rain', 3); const h = P[2].hq.hp, ev = []; e.debugSpawnCard(P, so, 1, 'x2-sky', 'left', {}, ev);
  ok(h - P[2].hq.hp === 4, `Lightning 4 with no unit to strike: the bramble takes 4, no Wet bonus in Flood and Rain (${h - P[2].hq.hp})`);
  ok(!(P[2].hq.shocked > 0) && !ev.some(x=> x.type === 'grounded') && !ev.some(x=> x.type === 'statusFx' && x.kind === 'shock'), 'the bramble is not Shocked; no grounded event'); }
{ const {e, P} = mk(); put(e, P, 1, 'x2-sb'); const h = P[2].hq.hp, ev = []; e.resolveCombat(P, so, {}, ev, 1);
  ok(P[2].hq.hp < h && !(P[2].hq.shocked > 0) && !ev.some(x=> x.type === 'statusFx' && x.kind === 'shock'), `a Shock Bolt at the bramble lands (${h - P[2].hq.hp}), no Shocked`); }
{ const {e, P} = mk(); const T = put(e, P, 2, 'x2-land'); put(e, P, 1, 'x2-sb'); e.resolveCombat(P, so, {}, [], 1); ok(T.shocked === 1, 'a Shock Bolt still Shocks a unit'); }
ok(!/type:'grounded'/.test(fs.readFileSync(path.join(ROOT, 'bramblewood-engine.js'), 'utf8')) && !/ev\.type === 'grounded'/.test(src), 'the grounded event, its log line and float are gone');
ok(/With no enemy unit it strikes the bramble, which is never Shocked\./.test(src), 'the Lightning skill text');

// ---- 12: raid stages
{ const g = JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical', 'raids.json'), 'utf8')); const raids = Array.isArray(g) ? g : (g.raids || Object.values(g));
  const stages = []; (Array.isArray(raids) ? raids : []).forEach(r=> (r.stages || []).forEach(s=> stages.push(s)));
  const en = stages.find(s=> s.name === 'Enraged'), th = stages.find(s=> s.name === 'Thrashing');
  ok(en && th, 'the Enraged and Thrashing stages are there');
  const re = R.stageRules(en), rt = R.stageRules(th);
  ok(!re.extraVolley && !rt.extraVolley, 'no extra round-start volley in either stage');
  ok(re.bossAtk === 2 && rt.bossAtk === 4 && rt.field && rt.field.landslide && rt.castleHpPct === -10, 'their +Attack, Landslide and the bramble -10% stay');
  ok(!/back two rows/.test(R.describeStage(en)) && !/back two rows/.test(R.describeStage(th)), `the stage lines no longer mention the volley (${R.describeStage(en)} / ${R.describeStage(th)})`);
  ok(/extra time as each round starts/.test(R.describeStage({rules:{extraVolley:1}})), 'a custom stage can still set one (the editor field stays)'); }

// ---- 12b (owner 15:37: "A. The tentacle slams hit them 1/3 of the time."): the Tentacle Smack reaches your back rows 1 time in 3
{ const seedSrc = src.slice(src.indexOf('function seededRng(seed){'), src.indexOf('let currentMatchSeed'));
  const body = src.slice(src.indexOf('function raidPickColumn(m){'), src.indexOf('function raidTelegraphCols(m)'));
  const F = new Function(seedSrc + body + '; return {raidSpecials, raidSmackBack, RAID_SMACK_BACK_CHANCE};')();
  ok(F.RAID_SMACK_BACK_CHANCE === 1/3, 'the chance is 1 in 3');
  const smack = (seed, round, opts)=>{ opts = opts || {};
    const {e, P} = mk({}, {reserveRows:2}); const fr = opts.noFront ? null : put(e, P, 1, 'x2-land'); const col = fr ? fr.slot : 0;
    const m1 = opts.noBack ? null : e.fillReserve(P[1], 1, col, 'x2-land'), b2 = opts.noBack ? null : e.fillReserve(P[1], 2, col, 'x2-land');
    const m = {engine:e, players:P, sideOf:so, stats:{}, round, raidSeed:seed, raidAttacks:[{name:'Tentacle Smack', pattern:'column', dmg:6, every:1}], raidPending:{0:col}};
    const ev = []; const hq = P[1].hq.hp; F.raidSpecials(m, ev); return {ev: ev.find(x=> x.type === 'raidSmack'), fr, m1, b2, hqLost: hq - P[1].hq.hp, back: F.raidSmackBack(m, round, 0)}; };
  let backs = 0, okFront = true, okBack = true, det = true; const N = 300;
  for(let r = 1; r <= N; r++){ const x = smack(12345, r);
    if(x.back){ backs++; if(!(x.ev.back && x.fr.hp === 50 && x.m1.hp === 44 && x.b2.hp === 44 && x.ev.hits === 2)) okBack = false; }
    else if(!(!x.ev.back && x.fr.hp === 44 && x.m1.hp === 50 && x.b2.hp === 50 && x.ev.hits === 1)) okFront = false;
    if(smack(12345, r).back !== x.back) det = false; }
  ok(backs / N > .25 && backs / N < .42, `about 1 smack in 3 reaches the back rows (${backs} of ${N})`);
  ok(okFront, 'a front smack hits only your front-row unit in that column (it used to hit every row)');
  ok(okBack, 'a back-row smack hits your middle and back rows in that column, not the front');
  ok(det, 'seeded: the same fight and round always roll the same');
  let fellFront = false, fellBack = false, wall = false;
  for(let r = 1; r <= 40; r++){ const a = smack(777, r, {noBack:true}); if(a.back && a.fr.hp === 44 && !a.ev.back) fellFront = true;
    const b = smack(777, r, {noFront:true}); if(!b.back && b.m1.hp === 44 && b.ev.back) fellBack = true;
    const c = smack(777, r, {noFront:true, noBack:true}); if(c.hqLost === 6 && !c.ev.hits) wall = true; }
  ok(fellFront, 'a back-row smack on a column with no back-row units lands on the front row');
  ok(fellBack, 'a front smack on a column with no front-row unit lands on the back rows');
  ok(wall, 'a column empty in every row hits your bramble');
  ok(/case 'raidSmack': return \{cls:'', text: ev\.back \? TX\('ui\.raid-smack-back-rows', \{name: ev\.name, dmg: ev\.dmg, hits: ev\.hits\}\)/.test(src), 'its log line says it hit the back rows (a TX key)');
  const TXT = require('../bramblewood-texts.js'); ok(/slams your back rows/.test(TXT.TEXT['ui.raid-smack-back-rows'] || ''), 'the text is in the TEXT table');
  ok(/M\.tentacleSmack\(ev\.back \? reserve :/.test(fs.readFileSync(path.join(ROOT, 'bramblewood-fx-f.js'), 'utf8')), 'the smack VFX lands on the back rows only'); }

// ---- 15: the Babel Spire plays at the highest CPU level
ok(E.AI_LEVEL_MAX === 2, 'the engine names its highest CPU level (AI_LEVEL_MAX = 2, Smartest)');
{ const e = E.makeSimEngine(defs, E.mulberry32(1), {recordEvents:true, aiLevel:99}); ok(e.getAiLevel() === E.AI_LEVEL_MAX, 'aiLevel is capped at AI_LEVEL_MAX');
  e.setAiLevel(99); ok(e.getAiLevel() === E.AI_LEVEL_MAX, 'setAiLevel too'); }
{ const i = src.indexOf('const CPU_AI_KEYS'), j = src.indexOf('function cpuAiPillHTML');
  const run = max=> new Function('mapNumberOf', 'AI_LEVEL_MAX', src.slice(i, j) + '; return {cpuAiAutoLevel, cpuAiLevelForNode};')(()=> 30, max);
  ok(run(2).cpuAiAutoLevel('tw', {tower:true, floor:1, kind:'skirmish'}) === 2, 'the Spire: Smartest on floor 1');
  ok(run(3).cpuAiAutoLevel('tw', {tower:true, floor:1, kind:'skirmish'}) === 3, 'a smarter level added later (AI_LEVEL_MAX 3) applies to the Spire by itself');
  ok(run(2).cpuAiLevelForNode('tw', {tower:true, ai:'basic'}) === 0, "Edit skirmish's pick still overrides it");
  ok(/const cpuAiKeyOf = lv=>/.test(src) && /cpuAiPillHTML\(level\)\{ const k = level == null \? 'smart' : cpuAiKeyOf\(level\)/.test(src), 'a level past the named ones shows the top name'); }

// ---- 16a texts
ok(/\{k:'wet'[^\n]*while the Tide is in, Flood or High Tide, so is every unit that isn’t Flying/.test(src), 'the Codex Wet entry explains the Flood rule');
ok(/tide: +\{icon:'🌊', name:'Tide'[^\n]*A Flood fills the whole board: every unit that isn’t Flying is Wet; Swimmers and Tide units are Wet in Ebb too\./.test(src), 'the Tide field text explains Wet');

// ---- 16b: the look
ok(/const TIDE_SCENE_Y = \{none:'calc\(100% \+ 40px\)', ebb:'calc\(100% - 12px\)', flow:'0%', high:'0%'\}/.test(src), 'Flood and High Tide fill the whole board; Ebb is a thin band at the bottom');
ok(/const TIDE_BOARD_CARDS = '#battlefieldInner \.board-row > \.board-card'/.test(src) && !/#rowMine \.board-card, #rowEnemy \.board-card/.test(src.slice(src.indexOf('function syncTideScene'), src.indexOf('const IdleGlance'))), 'every board row (the raid\'s reserve rows too) gets the wet look and the lift');
ok(/<div class="tw-surf"><i class="tw-caus"><\/i><i class="tw-caus c2"><\/i><i class="tw-sheen"><\/i><\/div>/.test(src), 'the caustics and sheen sit in .tw-surf');
ok(/\.tide-scene\.is-moving \.tw-surf\{animation:twSettleA \.9s ease-out calc\(var\(--tw-delay, 0ms\) \+ 1800ms\) both;\}/.test(tpl), '...which fades in only once the water has settled');
ok(!/tide-wade/.test(src) && !/tide-wade/.test(tpl), 'the waded ring is gone');
ok(/\.battlefield:is\(\[data-tide="flow"\], \[data-tide="high"\]\) \.board-card \.unit-wet, \.battlefield\[data-tide="ebb"\] \.board-card\.is-floating \.unit-wet\{opacity:1;/.test(tpl)
  && /\.battlefield\[data-tide\] \.board-card:not\(\.is-flying\) \.unit-wet\{display:block;\}/.test(tpl), 'the wet look: land units in Flood, Swimmers in Flood and Ebb, never flyers');
ok(/const SwimSplash = \(function\(\)\{/.test(src) && /reducedMotion\(\) \|\| !fxAtLeast\('med'\) \|\| fxStyle\(\) === 'minimal'/.test(src) && /SwimSplash\.start\(\)/.test(src), 'Swimmers splash now and then (Medium effects and up, no reduced motion, not Minimal)');
ok(/@media \(prefers-reduced-motion: reduce\)\{ \.board-card > \.swim-splash\{display:none;\} \}/.test(tpl) && /html\[data-fx-style="pixel"\] \.board-card > \.swim-splash::before/.test(tpl), 'the splash: hidden under reduced motion, stepped in Pixel');
{ const m = tpl.match(/@keyframes ssDrops\{[^\n]*/); ok(m && !/(left|top|width|height|margin)\s*:/.test(m[0]), 'the splash animates only transform and opacity'); }

console.log(fail ? `x2-2026-10-18: ${fail} of ${n} failed` : `x2-2026-10-18: all ${n} passed`);
process.exit(fail ? 1 : 0);
