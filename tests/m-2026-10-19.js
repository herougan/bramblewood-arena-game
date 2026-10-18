#!/usr/bin/env node
// 2026-10-18 (package M, owner 20:45).
//   1  the Tide's motion: "The movement during flood should be a bit more obvious during transition. Then during steady state, 70% more
//      movement than now (it moves like 2-3px only right now). In Ebb, it looks like what it is right now, but 20% less."
//      The settled slosh is TIDE_FLOOD_MOTION (x1.7) on Flood / High Tide and TIDE_EBB_MOTION (x0.8) on Ebb, of the old 5px; a Flood
//      coming in tilts more, surges higher and swells down into view at the top; Low effects, Minimal and reduced motion stay still.
//   2  "Pounce doesn't hit Bramble, methinks.": Pounce hits the unit facing it, else the nearest enemy unit, and the enemy bramble when
//      the enemy has no unit it can hit (the 2026-10-15 rule, kept). Checked in the engine (the game and the silent sims share it).
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const H = require('./lib/harness.js');
const E = H.Engine;
const R = f=> fs.readFileSync(path.join(__dirname, '..', f), 'utf8');
const src = R('arena_app.js'), tpl = R('arena_template.html');
let fail = 0, n = 0; const ok = (c, m)=>{ n++; if(!c){ fail++; console.log('  ✗', m); } };

// ---- 1. the Tide's motion
const constLine = name=>{ const m = src.match(new RegExp('^const ' + name + ' = [^\\n]*$', 'm')); return m ? m[0] : null; };
const ctx = {}; vm.createContext(ctx);
['TIDE_MOTION_BASE', 'TIDE_RISE_SKEW'].forEach(k=>{ const l = constLine(k); ok(!!l, k + ' is declared'); if(l) vm.runInContext(l.replace(/^const /, 'var '), ctx); });
const fnM = src.match(/^function tideMotionPx\(k\)\{[^\n]*\}$/m); ok(!!fnM, 'tideMotionPx(k) exists'); if(fnM) vm.runInContext(fnM[0], ctx);
const near = (a, b)=> Math.abs(a - b) < 1e-9;
ok(ctx.TIDE_MOTION_BASE === 5, `the old slosh was 5px (TIDE_MOTION_BASE ${ctx.TIDE_MOTION_BASE})`);
ok(near(ctx.TIDE_FLOOD_MOTION, ctx.TIDE_MOTION_BASE * 1.7), `TIDE_FLOOD_MOTION is x1.7 (${ctx.TIDE_FLOOD_MOTION})`);
ok(near(ctx.TIDE_EBB_MOTION, ctx.TIDE_MOTION_BASE * 0.8), `TIDE_EBB_MOTION is x0.8 (${ctx.TIDE_EBB_MOTION})`);
if(ctx.tideMotionPx){
  ok(ctx.tideMotionPx('flow') === ctx.TIDE_FLOOD_MOTION && ctx.tideMotionPx('high') === ctx.TIDE_FLOOD_MOTION, 'Flood and High Tide slosh TIDE_FLOOD_MOTION');
  ok(ctx.tideMotionPx('ebb') === ctx.TIDE_EBB_MOTION, 'Ebb sloshes TIDE_EBB_MOTION');
}
ok(ctx.TIDE_RISE_SKEW > ctx.TIDE_BASE_SKEW && ctx.TIDE_BASE_SKEW === 5, `a Flood tilts in more (${ctx.TIDE_RISE_SKEW}deg) than before / than the Ebb (${ctx.TIDE_BASE_SKEW}deg)`);
ok(ctx.TIDE_ARRIVE_SWELL >= 20, `the arrival swell clears the top border (${ctx.TIDE_ARRIVE_SWELL}px)`);
ok(/w\.style\.setProperty\('--tw-slosh', tideMotionPx\(st\.k\) \+ 'px'\)/.test(src) && /w\.style\.setProperty\('--tw-swell', TIDE_ARRIVE_SWELL \+ 'px'\)/.test(src), 'syncTideScene hands the knobs to the CSS');
ok(/w\.classList\.toggle\('is-rising', moving && flooding\)/.test(src), 'only a Flood / High Tide coming in is .is-rising');
ok(/@keyframes twSlosh\{0%,100%\{transform:translateY\(0\);\} 50%\{transform:translateY\(var\(--tw-slosh, 5px\)\);\}\}/.test(tpl), 'the slosh reads --tw-slosh');
ok(!/@keyframes twSlosh\{[^}]*translateY\(5px\)/.test(tpl), 'no fixed 5px slosh is left');
ok(/\.tide-scene\.is-moving\.is-rising \.tw-body\{animation:twSlosh 6s ease-in-out infinite, twArriveA /.test(tpl) && /@keyframes twArriveA\{/.test(tpl) && /@keyframes twArriveB\{/.test(tpl), 'the arrival swell (A/B so a new move restarts it)');
ok(/@keyframes twArriveA\{[^\n]*translate:0 var\(--tw-swell/.test(tpl) && !/@keyframes twArrive[AB]\{[^\n]*transform:/.test(tpl), 'the swell uses the independent translate (adds to the slosh), never transform');
ok(/\.tide-scene\.is-moving\.is-rising \.tw-edge\{animation:twEdge 8s linear infinite, twSurgeRA /.test(tpl) && /@keyframes twSurgeRA\{0%\{scale:1 1;\} 18%\{scale:1 2\.9;\}/.test(tpl), 'a Flood\'s crest surges higher (2.9, was 1.9), building up from rest');
ok(/@keyframes twSurgeA\{0%\{scale:1 1;\} 18%\{scale:1 1\.9;\}/.test(tpl), 'the Ebb keeps its old surge height, building up from rest');
// ---- 1 (follow-up, owner 21:59): "1a) The ebb effect should grow into the tide effect; currently they cancel each other. 1b) The ebb effect
//      should move in and out, and a bit side to side. It's too static. And its centre position should be placed a little lower."
['TIDE_EBB_OFFSET'].forEach(k=>{ const l = constLine(k); ok(!!l, k + ' is declared'); if(l) vm.runInContext(l.replace(/^const /, 'var '), ctx); });
ok(ctx.TIDE_EBB_OFFSET > 0 && ctx.TIDE_EBB_OFFSET <= 4, `the Ebb band sits a little lower (${ctx.TIDE_EBB_OFFSET}px, about 10% of its ~28px)`);
ok(ctx.TIDE_EBB_LAP > 0 && ctx.TIDE_EBB_DRIFT > 0 && ctx.TIDE_EBB_DRIFT < 24, `the Ebb laps ${ctx.TIDE_EBB_LAP}px and drifts ${ctx.TIDE_EBB_DRIFT}px (less than the water's 24px overhang)`);
const fnY = src.match(/^function tideSceneY\(k\)\{[^\n]*\}/m); ok(!!fnY, 'tideSceneY(k) exists');
if(fnY){ vm.runInContext('var TIDE_SCENE_Y = {none:"calc(100% + 40px)", ebb:"calc(100% - 12px)", flow:"0%", high:"0%"};' + fnY[0], ctx);
  ok(ctx.tideSceneY('ebb') === `calc(100% - ${12 - ctx.TIDE_EBB_OFFSET}px)` && ctx.tideSceneY('flow') === '0%', `the Ebb level is TIDE_EBB_OFFSET lower (${ctx.tideSceneY('ebb')})`); }
ok(/w\.style\.setProperty\('--tw-from', tideSceneY\(st\.from\)/.test(src) && /w\.style\.setProperty\('--tw-to', tideSceneY\(st\.k\)\)/.test(src), 'the move runs between the offset levels');
ok(/w\.style\.setProperty\('--tw-lap', TIDE_EBB_LAP \+ 'px'\); w\.style\.setProperty\('--tw-drift', TIDE_EBB_DRIFT \+ 'px'\)/.test(src), 'syncTideScene hands the lap and drift to the CSS');
ok(/\.tide-scene \.tw-sheet\{transform-origin:100% 0;\}/.test(tpl) && /\.tide-scene\.is-moving \.tw-sheet\{animation:twMoveA [^}]*, twTiltA 1\.8s/.test(tpl), '1a: one sheet moves (translate) while its tilt ramps in and out about the right edge, so the Ebb band never drops off first');
ok(!/@keyframes twMove[AB]\{from\{[^}]*skewY/.test(tpl), '1a: no tilt at full strength on the first frame');
ok(/@keyframes twSettleA\{0%\{opacity:1;\}/.test(tpl), '1a: the caustics fade (no blink) as a move starts');
ok(/\.tide-scene\[data-k="ebb"\] \.tw-body\{animation:twSlosh 6s ease-in-out infinite, twLap 8\.6s ease-in-out calc\(var\(--tw-delay, 0ms\) \+ 1800ms\) infinite;\}/.test(tpl), '1b: the settled Ebb laps (after the drain, on top of the slosh)');
const lap = (tpl.match(/@keyframes twLap\{[\s\S]*?\}\}/) || [''])[0];
ok(/translate:calc\(var\(--tw-drift/.test(lap) && /calc\(var\(--tw-lap, 6px\)\*-1\)/.test(lap) && (lap.match(/%\{/g) || []).length >= 6 && !/transform:/.test(lap), '1b: twLap moves in / out and side to side in uneven steps, on translate only');
ok(/\.tide-scene \.tw-water\{position:absolute; left:-24px; right:-24px;/.test(tpl) && /\.tide-scene \.tw-edge\{position:absolute; left:-24px; top:-27px; width:calc\(100% \+ 208px\);/.test(tpl), '1b: the water reaches past the sides, so the drift shows no gap');
ok(/html\[data-fx="low"\] \.tide-scene :is\(\.tw-body, \.tw-edge, \.tw-caus, \.tw-sheen\)\{animation:none !important;\}/.test(tpl), 'Low effects: no slosh, swell or surge');
ok(/@media \(prefers-reduced-motion: reduce\)\{\n    \.tide-scene \*, \.board-card \.unit-wet\{animation:none !important;\}/.test(tpl), 'reduced motion: the water is still');
// the twArrive / twSurgeR / twFoamR keyframes animate only translate, scale and opacity (compositor-only)
(tpl.match(/@keyframes tw(?:Arrive|SurgeR|FoamR)[AB]\{[^\n]*\}\}/g) || []).forEach(k=> ok(!/(top|left|height|width|margin|background)\s*:/.test(k), 'compositor-only: ' + k.slice(0, 40)));
ok(/TIDE_FLOOD_MOTION/.test(R('tools/effects-lab/manifest/m19.js')) && /^syncTideScene$/m.test(R('tools/effects-lab/fx-src-extra.txt')), 'the Effects Lab plays the standing Tide (manifest/m19.js)');

// ---- 2. Pounce and the bramble
const so = id=> id===1 ? 'A' : 'B';
const U = (id, effects, o)=> Object.assign({id, name:id, attack:3, health:40, wait:3, cost:0, effects: effects || {}}, o || {});
const defs = Object.assign({}, H.loadCardDefs(), {
  'mp-pouncer': U('mp-pouncer', {pounce:4}),
  'mp-pounce-att': U('mp-pounce-att', {pounce:'attack'}, {attack:6}),
  'mp-wall': U('mp-wall', {}, {attack:0, health:200}),
});
const all = pl=> [...pl.row.left, ...pl.row.center, ...pl.row.right];
function mk(rules, seed){ const e = E.makeSimEngine(defs, E.mulberry32(seed || 7), Object.assign({recordEvents:true}, rules ? {rules} : {})); return {e, P:{1:e.newPlayer(1, {}), 2:e.newPlayer(2, {})}}; }
const hqHit = (ev, uid)=> ev.find(x=> x.type==='hitHQ' && x.attUid===uid);
// a. no enemy unit: the pounce lands on the enemy bramble, as a leap (pounce:true, not a shot)
{ const {e, P} = mk(); const hp0 = P[2].hq.hp, ev = []; e.debugSpawnCard(P, so, 1, 'mp-pouncer', 'center', {}, ev);
  const me = all(P[1])[0], h = hqHit(ev, me && me.uid);
  ok(P[2].hq.hp === hp0 - 4, `a. an empty enemy board: the bramble takes 4 (${hp0} -> ${P[2].hq.hp})`);
  ok(h && h.pounce === true && h.ranged === false && h.dmg === 4, 'a. the bramble hit is the pounce\'s leap (hitHQ pounce:true, not ranged)');
  ok(ev.some(x=> x.type==='pounce' && x.amount===4 && x.targetUid == null), 'a. the pounce event names no unit (the board leaps at the bramble)'); }
// b. Pounce <Att> on an empty board: its Attack, at the bramble
{ const {e, P} = mk(); const hp0 = P[2].hq.hp, ev = []; e.debugSpawnCard(P, so, 1, 'mp-pounce-att', 'center', {}, ev);
  ok(P[2].hq.hp === hp0 - 6, `b. Pounce <Att> hits the bramble for its Attack (${hp0 - P[2].hq.hp}, want 6)`); }
// c. High Canopy's +2 and Tall Grass's x2 reach the bramble too
{ const {e, P} = mk({canopy:true, tallGrass:true}); const hp0 = P[2].hq.hp; e.debugSpawnCard(P, so, 1, 'mp-pouncer', 'center', {}, []);
  ok(P[2].hq.hp === hp0 - 12, `c. Canopy +2 then Tall Grass x2 at the bramble: ${hp0 - P[2].hq.hp} (want 12)`); }
// d. an enemy unit anywhere: the pounce goes to a unit (the 2026-10-15 rule: the one facing it, else the nearest), not the bramble
for(const side of ['left', 'center', 'right']){
  const {e, P} = mk(null, 11); e.debugSpawnCard(P, so, 2, 'mp-wall', side, {}, []); const w = all(P[2])[0], hp0 = P[2].hq.hp, ev = [];
  e.debugSpawnCard(P, so, 1, 'mp-pouncer', 'left', {}, ev); const me = all(P[1])[0];
  ok(P[2].hq.hp === hp0 && w.hp === 200 - 4 && !hqHit(ev, me.uid), `d. a unit on the enemy's ${side}: the pounce hits it (wall ${w.hp}, bramble ${hp0} -> ${P[2].hq.hp})`);
}
// e. only a caged enemy unit (it can't be hit): the bramble
{ const {e, P} = mk(); e.debugSpawnCard(P, so, 2, 'mp-wall', 'center', {}, []); const w = all(P[2])[0]; w.cageOf = 999; const hp0 = P[2].hq.hp;
  e.debugSpawnCard(P, so, 1, 'mp-pouncer', 'center', {}, []);
  ok(P[2].hq.hp === hp0 - 4 && w.hp === 200, `e. only a caged enemy: the pounce hits the bramble (${hp0 - P[2].hq.hp})`); }
// f. the card text says where it goes
// (package D made the card line the TX key ui.sk-pounce, 2026-10-18)
const TEXTS = require(path.join(__dirname, '..', 'bramblewood-texts.js')).TEXT;
ok(/pounce: v=> TX\('ui\.sk-pounce', \{n: pounceWords\(v\)\}\)/.test(src) && /bramble/.test(TEXTS['ui.sk-pounce'] || ''), 'f. the card line names the bramble');
ok(/the enemy bramble, if no units are left/.test(src), 'f. the Codex keyword says so too');

console.log(fail ? `m-2026-10-19: ${fail} of ${n} FAILED` : `m-2026-10-19: all ${n} passed`);
process.exit(fail ? 1 : 0);
