#!/usr/bin/env node
// 2026-10-18 (package V1, the owner's visual notes 1, 2, 3, 9, 12 and 15): static checks that the hooks are in place.
//   1 / 12  the standing Tide: a water layer that rises (in from the left) and recedes, wet sand, waded rings, a small CSS lift per column
//   15      no tide chip over the card; the skill strip's Tide pill is a wave on Flood and a shell on Ebb
//   2       a chilled flyer / swimmer wears its ice frame on the part that hovers, and hovers at half height
//   3       the idle glance of land units
//   9       Gannet Cliffs' gulls at half size
'use strict';
const fs = require('fs'), path = require('path');
const R = f=> fs.readFileSync(path.join(__dirname, '..', f), 'utf8');
const src = R('arena_app.js'), tpl = R('arena_template.html'), fxb = R('bramblewood-fx-b.js'), fxe = R('bramblewood-fx-e.js');
let fail = 0; const ok = (c, m)=>{ if(!c){ fail++; console.log('  ✗', m); } };

// ---- 1 / 12: the standing Tide
ok(/function syncTideScene\(m\)/.test(src) && /function tideSceneSet\(m, k\)/.test(src) && /function tideSceneTarget\(m\)/.test(src), 'syncTideScene / tideSceneSet / tideSceneTarget exist');
ok(/const TIDE_SCENE_Y = \{none:'calc\(100% \+ 40px\)', ebb:'84%', flow:'15%', high:'3%'\}/.test(src), 'water levels: none, Ebb, Flood, High Tide');
ok(/try\{ syncTideScene\(m\); \}catch\(e\)\{\} \/\/ the standing Tide/.test(src), 'renderMatchUI redraws the water');
ok(/try\{ syncTideScene\(matchState\); \}catch\(e\)\{\} \/\/ the standing Tide: waded rings/.test(src), 'renderBoard gives new cards their waded ring');
ok(/function tideWaveVfx\(kind\)\{[\s\S]{0,600}tideSceneSet\(matchState/.test(src), 'a tide event moves the water');
ok(/if\(!\(m\.resolving && m\._tideScene\)\)/.test(src), 'while a round replays, the water waits for the tide event');
ok(/'--tw-skew', \(TIDE_SCENE_RANK\[st\.k\] > TIDE_SCENE_RANK\[st\.from\] \? 5 : -5\)/.test(src), 'the water comes in from the left (skew by direction)');
['.tide-scene{', '.tw-sheet', '.tw-water', '.tw-caus', '.tw-edge', '.tw-wet', '.tw-sheen', '.board-card > .tide-wade', '@keyframes twMoveA', '@keyframes twMoveB', '@keyframes twDryA', '@keyframes twSurgeA', '@keyframes twWadeIn', '@keyframes tideLift{']
  .forEach(k=> ok(tpl.includes(k), 'tide CSS: ' + k));
ok(/@keyframes twMoveA\{from\{transform:translateY\(var\(--tw-from\)\) skewY\(var\(--tw-skew, 0deg\)\);\} to\{transform:translateY\(var\(--tw-to\)\) skewY\(0deg\);\}\}/.test(tpl), 'the rise / recede is one transform, tilted at the start');
ok(/html\[data-fx="low"\] \.tide-scene :is\(\.tw-body, \.tw-edge, \.tw-caus, \.tw-sheen\)/.test(tpl) && /html\[data-fx="none"\] \.tide-scene \*/.test(tpl), 'Low and Minimal effects levels quiet the water');
ok(/@media \(prefers-reduced-motion: reduce\)\{\n    \.tide-scene \*/.test(tpl), 'reduced motion: the water is still');
ok(/html\[data-fx-style="pixel"\] \.tide-scene \.tw-edge\{background-image:url\("data:image\/svg\+xml,/.test(tpl) && /html\[data-fx-style="minimal"\] \.tide-scene/.test(tpl), 'Pixel and Minimal styles have their looks');
ok(/function tideLiftCards\(bf, kind\)/.test(src) && /\(\.25 \+ \(cols\[i\] - c0\)\*\.1\)/.test(src), 'cards lift column by column from the left, 0.1 s apart');
ok(!/SkillFX\.tideSway\(/.test(src), 'the GSAP sway of every card is gone from the game');
ok(/@keyframes tideLift\{0%,100%\{translate:0 0; rotate:0deg;\} 40%\{translate:0 -2px;/.test(tpl), 'the lift is small (2px)');
ok(/else if\(ev\.tide === 'high' && med\) M\.tideHigh\(bf, \{sprayOnly:true\}\);/.test(fxb) && !/else if\(ev\.tide === 'ebb' && med\) M\.tideEbb\(bf\);/.test(fxb), 'batch B no longer draws its own water over the standing Tide');
ok(/if\(opts\.sprayOnly\)\{ w1\.style\.display = w2\.style\.display = 'none'; \}/.test(fxb), 'High Tide keeps its spray');
// ---- 15: the tide chip and the pill
ok(!/<div class="tide-chip tide-\$\{tideNow\}"/.test(src), 'no tide chip over the card');
ok(/\$\{lt && lt\.k === 'ebb' \? iconHTML\('tide-ebb', '🐚'\) : iconHTML\('tide', '🌊'\)\}/.test(src), 'the Tide pill: a wave on Flood, a shell on Ebb');
// ---- 2: chilled flyers and swimmers
ok(/@property --fly-amp\{syntax:'<number>'; inherits:false; initial-value:1;\}/.test(tpl) && /\.board-card\.is-frozen \.fly-body\{--fly-amp:\.5;\}/.test(tpl), 'a frozen hover is at half amplitude, eased');
ok(/@keyframes flySoar\{0%,100%\{translate:calc\(5px\*var\(--fly-amp\)\)/.test(tpl) && /@keyframes tideFloat\{0%,100%\{translate:0 calc\(-5\.2px\*var\(--fly-amp\)\)/.test(tpl), 'flySoar and tideFloat scale with --fly-amp');
ok(/\.board-card\.is-frozen:is\(\.is-flying, \.is-floating\)::after\{content:none;\}/.test(tpl) && /\.board-card\.is-frozen::after, \.board-card\.is-frozen > \.fly-body::after\{content:''/.test(tpl), 'the ice frame rides on the .fly-body');
ok((tpl.match(/\.board-card\.is-frozen > \.fly-body::after/g) || []).length >= 5, 'the frame keeps its mask, Low-effects and reduced-motion rules on the .fly-body too');
// ---- 3: idle glance
ok(/const IdleGlance = \(function\(\)\{/.test(src) && /IdleGlance\.start\(\)/.test(src), 'IdleGlance runs one shared timer');
ok(/m\.resolving \|\| document\.hidden \|\| reducedMotion\(\) \|\| !fxAtLeast\('med'\)/.test(src), 'no glance while a round resolves, at Low effects or with reduced motion');
ok(/const BUSY = '\.is-flying, \.is-floating, \.is-frozen, \.is-stunned/.test(src), 'only land units that are free to look about');
ok(/timer\.unref/.test(src), 'the timer never holds a Node run open');
ok(/\.board-card\.glance-l \.card-tile > \.ico\{--gl:-1; animation:idleGlance/.test(tpl) && /@keyframes idleGlance\{/.test(tpl), 'the glance turns the art only');
// ---- 9: gulls
ok(/cliffs: \{[^\n]*\n\s*parts:\[\{kind:'gull', n:4, c:\[250,250,250\], s:\[\.0175,\.0275\]\}/.test(fxe), 'Gannet Cliffs gulls: half size');
ok(/cliffsB: \{[^\n]*\n[^\n]*\n\s*parts:\[\{kind:'gull', n:2, c:\[250,250,250\], s:\[\.015,\.0225\]\}/.test(fxe), 'the squall look\'s gulls: half size');

console.log(fail ? `visuals-2026-10-18: ${fail} FAILED` : 'visuals-2026-10-18: all passed');
process.exit(fail ? 1 : 0);
