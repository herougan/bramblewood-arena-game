#!/usr/bin/env node
// Package X2 (2026-10-18, owner decisions 15:05):
//   12  "Your choice of balance": the Enraged / Thrashing raid stages lose their extra round-start volley (the boss's back rows already
//       strike every round, reserveActs); +Attack, the field and the bramble % stay.
//   13  "No Shocked status on Brambles.": lightning at a bramble deals its damage again (the morning's "grounded" rule is gone), but a
//       bramble is never Shocked and never Wet.
//   12b The Tentacle Smack (owner 15:56): row smacks and column smacks, alternating; a column weighted by your units in it.
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

// ---- 12b: the Tentacle Smack, row smacks and column smacks (2026-10-18, owner 15:56: "there are row-based smacks and column-based
// smacks. Column-based smacks weight columns by number of units in that column."; the row smack keeps 15:37's "A. The tentacle slams
// hit them 1/3 of the time.": the front row, 1 time in 3 the middle or back row). They alternate, a column smack first.
{ const seedSrc = src.slice(src.indexOf('function seededRng(seed){'), src.indexOf('let currentMatchSeed'));
  const body = src.slice(src.indexOf('function raidSmackRoll('), src.indexOf('// The raid\'s last turn'));
  const F = new Function(seedSrc + body + '; return {raidSpecials, raidSmackBack, raidSmackKind, raidSmackTarget, raidPickColumn, raidTelegraph, RAID_SMACK_BACK_CHANCE};')();
  ok(F.RAID_SMACK_BACK_CHANCE === 1/3, 'the row smack leaves the front row 1 time in 3');
  ok(['column', 'row', 'column', 'row'].every((k, j)=> F.raidSmackKind(3 * (j + 1), {every:3}) === k), 'every 3 rounds: column, row, column, row');
  ok(F.raidSmackKind(1, {every:1}) === 'column' && F.raidSmackKind(2, {every:1}) === 'row', 'every round: they alternate too');
  const at = (e, P, sl)=>{ e.debugSpawnCard(P, so, 1, 'x2-land', sl, {}, []); return all(P[1]).filter(x=> x.defId === 'x2-land').reduce((a, x)=> (!a || x.uid > a.uid) ? x : a, null); };
  // a board: front units in columns 0 and -1 (the first card stands in the centre), the middle row's unit in column -1, the back row's in -1 and 0
  const board = (layout)=>{ const {e, P} = mk({}, {reserveRows:2}); const u = {};
    (layout.front || []).forEach(sl=> u['f' + sl] = at(e, P, sl));
    (layout.mid || []).forEach(sl=> u['m' + sl] = e.fillReserve(P[1], 1, sl, 'x2-land'));
    (layout.back || []).forEach(sl=> u['b' + sl] = e.fillReserve(P[1], 2, sl, 'x2-land'));
    return {e, P, u}; };
  const run = (seed, round, layout, pending)=>{ const b = board(layout);
    const m = {engine:b.e, players:b.P, sideOf:so, stats:{}, round, raidSeed:seed, raidAttacks:[{name:'Tentacle Smack', pattern:'column', dmg:6, every:1}], raidPending: pending ? {0: pending} : {}};
    const hq = b.P[1].hq.hp, ev = []; F.raidSpecials(m, ev); return Object.assign(b, {m, ev: ev.find(x=> x.type === 'raidSmack'), hqLost: hq - b.P[1].hq.hp}); };
  const L = {front:[0, -1], mid:[-1], back:[-1, 0]};
  const hp = (b, ks)=> ks.map(k=> b.u[k].hp);
  // row smacks (even rounds)
  const rows = [0, 0, 0]; let rowOk = true, det = true;
  for(let r = 2; r <= 600; r += 2){ const b = run(4242, r, L);
    if(!b.ev || b.ev.kind !== 'row'){ rowOk = false; continue; } rows[b.ev.row]++;
    const want = {0:['f-1', 'f0'], 1:['m-1'], 2:['b-1', 'b0']}[b.ev.row], keys = ['f-1', 'f0', 'm-1', 'b-1', 'b0'];
    if(!keys.every(k=> b.u[k].hp === (want.includes(k) ? 44 : 50)) || b.ev.hits !== want.length || b.hqLost) rowOk = false;
    if(run(4242, r, L).ev.row !== b.ev.row) det = false; }
  const N = rows[0] + rows[1] + rows[2];
  ok(rowOk, 'a row smack hits every unit in its row and nothing else');
  ok(rows[0] / N > .58 && rows[0] / N < .75, `about 2 in 3 row smacks hit the front row (${rows.join(' / ')})`);
  ok(rows[1] > N * .1 && rows[2] > N * .1, `the other third is split between the middle and back rows (${rows[1]} / ${rows[2]})`);
  ok(det, 'seeded: the same fight and round always pick the same row');
  // column smacks (odd rounds): column -1 holds 3 units, column 0 holds 2, column 1 none
  const cols = {}; let colOk = true, cdet = true;
  for(let r = 1; r <= 999; r += 2){ const b = run(9001, r, L);
    if(!b.ev || b.ev.kind !== 'column'){ colOk = false; continue; } cols[b.ev.col] = (cols[b.ev.col] || 0) + 1;
    const want = b.ev.col === -1 ? ['f-1', 'm-1', 'b-1'] : b.ev.col === 0 ? ['f0', 'b0'] : null, keys = ['f-1', 'f0', 'm-1', 'b-1', 'b0'];
    if(!want || !keys.every(k=> b.u[k].hp === (want.includes(k) ? 44 : 50)) || b.ev.hits !== want.length || b.hqLost) colOk = false;
    if(run(9001, r, L).ev.col !== b.ev.col) cdet = false; }
  const CN = (cols[-1] || 0) + (cols[0] || 0);
  ok(colOk, 'a column smack hits every unit in its column, front, middle and back');
  ok(!cols[1] && !cols[-2] && !cols[2], 'an empty column is never picked');
  ok(cols[-1] / CN > .52 && cols[-1] / CN < .68, `columns are weighted by their units: 3 to 2 (${cols[-1]} / ${cols[0]})`);
  ok(cdet, 'seeded: the same fight and round always pick the same column');
  { const a = run(5, 1, {}), b = run(5, 2, {});
    ok(a.ev.kind === 'column' && a.ev.col == null && !a.ev.hits && a.hqLost === 6, 'a column smack with no units on the board hits your bramble');
    ok(b.ev.kind === 'row' && !b.ev.hits && b.hqLost === 6, 'a row smack with no units on the board hits your bramble'); }
  { const b = run(5, 2, {front:[0]}, {kind:'row', row:2}); ok(b.ev.row === 0 && b.u.f0.hp === 44 && b.ev.hits === 1, 'a row smack aimed at an empty back row lands on the front row');
    const c = run(5, 1, {front:[0]}, {kind:'column', col:-1}); ok(c.ev.col === -1 && !c.ev.hits && c.hqLost === 6 && c.u.f0.hp === 50, 'a telegraphed column that has emptied since hits your bramble'); }
  // the telegraph: the round before a smack, its target is picked and shown
  { const b = board(L), m = {engine:b.e, players:b.P, sideOf:so, stats:{}, round:2, raidSeed:77, raidAttacks:[{name:'Tentacle Smack', pattern:'column', dmg:6, every:3}], raidPending:{}};
    F.raidSpecials(m, []); const p = m.raidPending[0], tg = F.raidTelegraph(m);
    ok(p && p.kind === 'column' && (p.col === -1 || p.col === 0) && tg.cols.length === 1 && tg.cols[0] === p.col && !tg.rows.length, 'round 2: the round-3 column smack is telegraphed (its column)');
    m.round = 3; const ev = []; F.raidSpecials(m, ev); ok(ev[0] && ev[0].col === p.col, 'round 3: it lands on the telegraphed column');
    m.round = 5; F.raidSpecials(m, []); const q = m.raidPending[0], tq = F.raidTelegraph(m);
    ok(q && q.kind === 'row' && [0, 1, 2].includes(q.row) && tq.rows[0] === q.row && !tq.cols.length, 'round 5: the round-6 row smack is telegraphed (its row)'); }
  ok(/matchState\.raidPending\[i\] = raidSmackTarget\(matchState, 2, i, a\)/.test(src), 'a smack on round 2 is telegraphed from the start');
  ok(/const tg = raidTelegraph\(m\)/.test(src) && /tg\.rows\.forEach/.test(src), 'the board glows the telegraphed row or column');
  // its log lines, VFX and translations
  ok(/TX\('ui\.raid-smack-column', \{name, dmg, hits, s\}\)/.test(src) && /TX\('ui\.raid-smack-row-middle'/.test(src) && /TX\('ui\.raid-smack-bramble', \{name, dmg\}\)/.test(src), 'its log lines are TX keys');
  const TXT = require('../bramblewood-texts.js'); const keys = ['ui.raid-smack-column', 'ui.raid-smack-row-front', 'ui.raid-smack-row-middle', 'ui.raid-smack-row-back', 'ui.raid-smack-bramble', 'ui.raid-attacks-telegraph-title'];
  ok(keys.every(k=> TXT.TEXT[k]) && !TXT.TEXT['ui.raid-smack-back-rows'], 'the texts are in the TEXT table (the old back-rows line is gone)');
  ok(/TX\('ui\.raid-smack-row-back', \{name, dmg, hits, s\}\)/.test(src) && TXT.TX('ui.raid-smack-row-back', {name:'Smack', dmg:6, hits:1, s:''}) === '💥 Smack reaches past your front rows and sweeps your back row: 6 damage to each of your 1 unit there.', 'the row lines fill in');
  const peel = s=> s.replace(/^[^\w{]+/u, '');
  ['fr', 'de', 'es', 'it', 'pt', 'tl', 'ta', 'id', 'zh-Hans', 'zh-Hant', 'ja', 'ko'].forEach(code=>{ const pack = JSON.parse(fs.readFileSync(path.join(ROOT, 'lang', code + '.json'), 'utf8'));
    ok(keys.every(k=> pack[peel(TXT.TEXT[k])]), `the ${code} pack translates them`); });
  const fxf = fs.readFileSync(path.join(ROOT, 'bramblewood-fx-f.js'), 'utf8');
  ok(/if\(ev\.kind === 'row'\)\{/.test(fxf) && /horizontal:true\}\); return;/.test(fxf), 'a row smack plays the tentacle sweeping along the row');
  ok(/const horiz = !!opts\.horizontal;/.test(fxf) && /ctx\.setTransform\(0, dpr, dpr, 0, 0, 0\)/.test(fxf), 'the tentacle VFX turns on its side for a row');
  ok(/M\.tentacleSmack\(\[all\[i\]\]\.concat\(resRows\.map/.test(fxf), 'a column smack slams down the column through every row'); }

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
