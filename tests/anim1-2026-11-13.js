#!/usr/bin/env node
// 2026-11-13 (package ANIM1, owner 2026-11-12 23:47 notes 9, 13, 19). Reads arena_app.js; runs the pure parts in a vm.
//   9   layoutSpeedFor: game 0.5 / 1 / 1.5 / 2 / 3 / 4 / 5 -> 0.75 / 1 / 1.2 / 1.4 / 1.6 / 2.0 / 2.5 (straight lines between, clamped);
//       the camera / layout moves use it (zoom, camera pan, recentre, phone re-frame, raid zoom, re-layout glides); a new units' span
//       re-lays the slot board out with a glide even when the column range stays the same
//   19  a row redrawn mid-flight keeps the flying card hidden; a cut-short flight entrance doesn't land a second time; 4x / 5x go straight in
//   13  the landing thud, the ready pulse, a shove and an entrance put the card and its face back at rest when they end (settleRestPose)
// Browser run (the race reproduced at 1x / 1.5x / 2x / 4x / 5x, the resting shape, the span glide): tests/e2e/anim1_2026_11_13.py
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const src = fs.readFileSync(path.join(__dirname, '..', 'arena_app.js'), 'utf8');
let fail = 0, n = 0; const ok = (c, m)=>{ n++; if(!c){ fail++; console.log('  ✗', m); } };
function fnSrc(name){ const i = src.indexOf('\nfunction ' + name + '('); if(i < 0) return null; let d = 0;
  for(let k = src.indexOf('{', i); k < src.length; k++){ const ch = src[k]; if(ch === '{') d++; else if(ch === '}'){ d--; if(!d) return src.slice(i + 1, k + 1); } } return null; }
const constLine = name=>{ const m = src.match(new RegExp('^const ' + name + ' = [^\\n]*$', 'm')); return m ? m[0] : null; };

// ---- 9: the speed table
{ const ctx = {matchState: {speedMult: 1}}; vm.createContext(ctx);
  vm.runInContext([constLine('LAYOUT_SPEEDS'), fnSrc('layoutSpeedFor'), fnSrc('layoutSec')].join('\n').replace(/^const /gm, 'var '), ctx);
  const want = {0.5: 0.75, 1: 1, 1.5: 1.2, 2: 1.4, 3: 1.6, 4: 2.0, 5: 2.5};
  Object.entries(want).forEach(([g, k])=> ok(Math.abs(ctx.layoutSpeedFor(+g) - k) < 1e-9, `game ${g}x -> layout ${k}x (got ${ctx.layoutSpeedFor(+g)})`));
  ok(Math.abs(ctx.layoutSpeedFor(2.5) - 1.5) < 1e-9 && Math.abs(ctx.layoutSpeedFor(0.75) - 0.875) < 1e-9, 'straight lines between the owner\'s points (2.5x -> 1.5, 0.75x -> 0.875)');
  ok(ctx.layoutSpeedFor(0.25) === 0.75 && ctx.layoutSpeedFor(8) === 2.5 && ctx.layoutSpeedFor(undefined) === 1, 'clamped outside the table; no speed = 1x');
  ctx.matchState.speedMult = 5; ok(Math.abs(ctx.layoutSec(.75) - .3) < 1e-9, 'layoutSec: a 0.75 s camera move takes 0.3 s at 5x');
  ctx.matchState = null; ok(ctx.layoutSec(.3) === .3, 'outside a match: the base duration'); }

// ---- 9: who uses it
{ const uses = {fitBattlefieldZoomNowCore: /transform \$\{layoutSec\(\.75\)\.toFixed\(3\)\}s/, panCameraToShowUid: /transform \$\{layoutSec\(\.35\)\.toFixed\(3\)\}s/,
    recenterBattlefieldPan: /transform \$\{layoutSec\(\.6\)\.toFixed\(3\)\}s/, mb2FlipReframe: /transform \$\{layoutSec\(\.3\)\.toFixed\(3\)\}s/, rzTo: /ms = layoutSec\(ms \/ 1000\) \* 1000/,
    glideBoardCardFrom: /duration:layoutSec\(/, glideFromRect: /duration: layoutSec\(/};
  Object.entries(uses).forEach(([f, re])=>{ const s = fnSrc(f); ok(!!s && re.test(s), `${f} runs at the layout speed`); });
  ok(!/transform \.75s|transform \.35s|transform \.6s|transform \.3s/.test(fnSrc('fitBattlefieldZoomNowCore') + fnSrc('panCameraToShowUid') + fnSrc('recenterBattlefieldPan') + fnSrc('mb2FlipReframe')), 'no fixed camera transition left in them');
  ok(/Math\.round\(layoutSec\(\.75\) \* 1000\) \+ 30\);/.test(fnSrc('fitBattlefieldZoomNowCore')), 'the zoom\'s transition is cleared after its own (scaled) length');
  const rb = fnSrc('renderBoard');
  ok(/span = ui2UnitSpan\(\[p1Rows, p2Rows\]\)/.test(rb) && /m\._flipRange === slotRange && m\._flipSpan === span/.test(rb), 'a new units\' span (the cards\' size) counts as a re-layout: the cards glide'); }

// ---- 19: the flicker
{ const rb = fnSrc('renderBoard');
  const hide = rb.indexOf("handFlightsLive.forEach(u=>{ const c = boardCardEl(u); if(c) c.style.visibility = 'hidden'; });"), rows = rb.indexOf('rowMine.innerHTML = h;'), entr = rb.indexOf('const flightOk = ');
  ok(hide > rows && hide < entr, 'renderBoard re-hides a card whose flight is in the air, after the rows are redrawn and before the new entrances');
  ok(/if\(!handFlightsLive\.has\(String\(uid\)\) && !tl\._byFlight\) setTimeout/.test(rb) && /entranceTl\._byFlight = flightOk;/.test(rb), 'a redraw that cuts a flight\'s entrance short doesn\'t land it a second time');
  ok(/const goTo = isHandPlay && playGoTo\(\);/.test(rb) && /const flightOk = !goTo && /.test(rb) && /\} else if\(goTo\)\{\n\s*entranceTl\.to\(\{\}, \{duration: \.05\}\);/.test(rb), '4x / 5x: a hand play has no travel (no flight, no fall)');
  ok(/else if\(!flightOk && !goTo\)\{ playLandingImpact\(uid\)/.test(rb), '... and no landing thud');
  ok(/PLAY_GOTO_SPEED = 4;/.test(src) && /reducedMotion\(\) \|\| playGoTo\(\)\) return false;/.test(fnSrc('handFlightProxy')), 'handFlightProxy declines at 4x and up (an ally\'s or a boss\'s row play goes straight in too)');
  const ctx = {matchState: {speedMult: 3}}; vm.createContext(ctx); vm.runInContext([constLine('PLAY_GOTO_SPEED'), fnSrc('playGoTo')].join('\n').replace(/^const /gm, 'var '), ctx);
  ok(!ctx.playGoTo(), '3x still flies'); ctx.matchState.speedMult = 4; ok(ctx.playGoTo(), '4x goes straight in'); ctx.matchState.speedMult = 5; ok(ctx.playGoTo(), '5x goes straight in'); }

// ---- 13: the resting shape
{ const s = fnSrc('settleRestPose');
  ok(!!s && /gsap\.set\(x, \{clearProps:'transform,translate,rotate,scale'\}\)/.test(s), 'settleRestPose clears what GSAP left on the card and its face');
  ok(/\.falling, \.burning, \.bleeding, \.dying, \.is-scattering'\)\) return;/.test(s) && /gsap\.isTweening\(x\)/.test(s) && /setTimeout\(\(\)=> settleRestPose\(el, \(n \|\| 0\) \+ 1\), 120\)/.test(s), '... never a dying card; waits while anything still moves it');
  ok(/el\.classList\.remove\('landing-impact'\); settleRestPose\(el\);/.test(fnSrc('playLandingImpact')), 'the landing thud ends at rest');
  ok(/settleRestPose\(target\);/.test(fnSrc('pushNeighborCards')), 'a shoved neighbour ends at rest');
  ok(/readyEl\.classList\.remove\('ready-pulse'\); settleRestPose\(readyEl\);/.test(src), 'the ready pulse ends at rest');
  ok(/if\(!flightOk\) settleRestPose\(el\);/.test(fnSrc('renderBoard')), 'an entrance that lands without the flight ends at rest');
  ok(/clearProps:'transform,translate,rotate,scale'\}\);/.test(fnSrc('glideBoardCardFrom')), 'a re-layout glide leaves no transform behind'); }

console.log(`anim1-2026-11-13: ${n - fail}/${n} passed`);
process.exit(fail ? 1 : 0);
