#!/usr/bin/env node
// 2026-10-24 (package BV, the battle-visual pass; owner notes 13:16, 17:01, 17:34, 19:27, 19:30, 19:39). Reads arena_app.js,
// arena_template.html, bramblewood-fx-b.js, bramblewood-fx-c.js and tools/effects-lab/manifest/bv.js; runs the pure parts in a vm.
//   17:34 #1   the wind turns (FX.B.windTurn) instead of windSwap's swirl; syncWindField hands a change of direction to it
//   17:34 #16  the enemy leader falls in once (the throne moment skips its own drop: opts.landed)
//   17:01 #2   the Flood picks a tilt in [-10, 10] deg, no arrival swell, gentler surge; the Ebb leans a few px
//   17:01 #4   a Flyer's wing and its Tailwind boot / Headwind ×2 share one pip (flyerWindPips)
//   17:01 #6   the snap guard reads positions in the board's own px (no jump and rubber band on a zoom); no lean or turn
//   19:30      both brambles drop into the ground with dust (FX.C.castleSink) and stay down after the fight (.castle-fallen)
//   19:39      FX.C.smokeBomb and the Smoke billows
//   19:27 #1   the pack summary clears the last card's flight (no stray shine); no dangling "·"
//   19:27 #20  the river current is soft random streaks at low opacity; dusk bars at half; the day/night change is gentle
//   13:16 #1   a cut-off squash can't stick: animateAttacker kills scaleX/scaleY too; the watchdog settles a face left off rest
//   13:16 #21  Armor 1-4 an even stack inside its pip, 5+ one shield with a number
//   13:16 #23  a unit joining mid-round keeps its Shield (replayGuardSnap)
//   13:16 #24  the enemy hand count sits inside their Deck on a phone
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const R = f=> fs.readFileSync(path.join(__dirname, '..', f), 'utf8');
const src = R('arena_app.js'), tpl = R('arena_template.html'), fxb = R('bramblewood-fx-b.js'), fxc = R('bramblewood-fx-c.js'), lab = R('tools/effects-lab/manifest/bv.js');
let fail = 0, n = 0; const ok = (c, m)=>{ n++; if(!c){ fail++; console.log('  ✗', m); } };
function fnSrc(name, from){ const s = from || src, i = s.indexOf('\nfunction ' + name + '('); if(i < 0) return null; let d = 0, j = s.indexOf('{', i);
  for(let k = j; k < s.length; k++){ const ch = s[k]; if(ch === '{') d++; else if(ch === '}'){ d--; if(!d) return s.slice(i + 1, k + 1); } } return null; }
const constLine = (name, from)=>{ const m = (from || src).match(new RegExp('^const ' + name + ' = [^\\n]*$', 'm')); return m ? m[0] : null; };
const between = (s, a, b)=>{ const i = s.indexOf(a); if(i < 0) return ''; const j = s.indexOf(b, i + a.length); return s.slice(i, j < 0 ? i + 4000 : j); };

// ---- 17:34 #1 the wind turns
{ const ev = between(fxb, "case 'wind': {", 'mo.windFrom = from; break; }');
  ok(ev && !/M\.windSwap\(bf\)/.test(ev), 'the wind event no longer plays the swirl (windSwap)');
  ok(/M\.windTurn = function\(host, opts\)/.test(fxb) && /S\.windFieldClear\(host\)/.test(between(fxb, 'M.windTurn = function', 'Headwind: a Flyer')), 'FX.B.windTurn exists and fades the rest of the old layer');
  ok(/M\.windSwap = function/.test(fxb), 'windSwap stays for the Effects Lab\'s before');
  const sw = fnSrc('syncWindField'); ok(!!sw && /if\(bf\.dataset\.windTurning\) return;/.test(sw) && /B\.windTurn\(bf, \{strength: want\[0\], dir: want\[1\]\}\)/.test(sw), 'syncWindField hands a change of direction to windTurn and waits while it turns');
  ok(/curDir !== want\[1\]/.test(sw), '... only when the direction changes (a change of strength swaps the layer as before)');
  const wt = between(fxb, 'const WIND_TURN = ', '\n');
  ok(/shrink:\.5\d?, rest:\.1\d?, grow:\.5\d?, fade:\.4\d?/.test(wt), `the turn's timing: draw in ~0.5 s, rest, draw out ~0.5 s, fade (${wt.trim().slice(0, 80)})`); }

// ---- 17:34 #16 one leader arrival
{ ok(/leaderThroneVfx\(ev\.uid, \{enemy:true, defId:ev\.defId, landed:true\}\), at\)/.test(src) && /const at = enemyLeaderLandMs\(\)/.test(src), 'the enemy leader\'s throne moment starts as its fall lands and is told it has landed');
  const lt = fnSrc('leaderThroneVfx'); ok(!!lt && /const landed = !!\(opts\.fromHand \|\| opts\.landed\)/.test(lt) && /if\(!landed\)\{ const t0 = el\.querySelector\('\.card-tile'\)/.test(lt), 'leaderThroneVfx drops the card only when it has not already arrived');
  const el = fnSrc('enemyLeaderLandMs'); const ctx = {matchState:{speedMult:1}, entranceCardTweenDur: m=> 0.6/m}; vm.createContext(ctx); vm.runInContext(el, ctx);
  const ms = ctx.enemyLeaderLandMs(); ok(ms >= 120 && ms <= 600, `the land time follows the entrance's first leg (${ms} ms)`);
  ctx.matchState.speedMult = 2; ok(ctx.enemyLeaderLandMs() < ms, 'faster at 2x'); }

// ---- 17:01 #2 the tide
{ const ctx = {}; vm.createContext(ctx); vm.runInContext([constLine('TIDE_RISE_TILT_MAX'), fnSrc('tideRiseTilt')].join('\n').replace(/^const /gm, 'var '), ctx);
  let lo = 99, hi = -99, left = 0, right = 0, mid = 0; for(let i = 0; i < 3000; i++){ const t = ctx.tideRiseTilt(); lo = Math.min(lo, t); hi = Math.max(hi, t); if(t > 3) left++; else if(t < -3) right++; else mid++; }
  ok(lo >= -10 && hi <= 10 && lo < -9 && hi > 9, `a Flood's tilt is in [-10, 10] (${lo}..${hi})`);
  ok(left > 600 && right > 600 && mid > 400, `the left, the right and the middle all come up (${left} / ${right} / ${mid} of 3000)`);
  const ss = fnSrc('tideSceneSet'); ok(/tilt: tideRiseTilt\(\)/.test(ss), 'each tide move picks its tilt once (a redraw resumes the same wave)');
  const st = fnSrc('syncTideScene'); ok(/const tilt = flooding \? \(st\.tilt != null \? st\.tilt : tideRiseTilt\(\)\) : \(rising \? ebbDeg : -ebbDeg\);/.test(st), 'a Flood uses its tilt; an Ebb leans by ebbDeg');
  ok(/ebbDeg = Math\.atan\(TIDE_EBB_TILT_PX \/ bw\)/.test(st) && /TIDE_EBB_TILT_PX = 10/.test(src), 'the Ebb\'s lean is at most 10 px end to end, whatever the board\'s width');
  ok(/'--tw-origin', tilt >= 0 \? '100% 0' : '0 0'/.test(st) && /\.tide-scene \.tw-sheet\{transform-origin:var\(--tw-origin, 100% 0\);\}/.test(tpl), 'the tilt turns about the far edge from the side that leads');
  ok(/TIDE_ARRIVE_SWELL_BV = 0;/.test(src) && /flooding \? TIDE_ARRIVE_SWELL_BV : TIDE_ARRIVE_SWELL/.test(st), 'no arrival swell on a Flood (it bounced the front wave below then above the top border)');
  { const c2 = {}; vm.createContext(c2); vm.runInContext([constLine('TIDE_SCENE_Y'), constLine('TIDE_EBB_OFFSET'), constLine('TIDE_FLOOD_LIFT'), constLine('TIDE_MOTION_BASE'), fnSrc('tideSceneY')].join('\n').replace(/^const /gm, 'var '), c2);
    ok(c2.tideSceneY('flow') === '-12px' && c2.tideSceneY('high') === '-12px' && c2.TIDE_FLOOD_LIFT > c2.TIDE_FLOOD_MOTION, `a settled Flood rests ${c2.TIDE_FLOOD_LIFT}px up, past its ${c2.TIDE_FLOOD_MOTION}px slosh (the front wave never sloshes into view)`); }
  ok(/@keyframes twSurgeRA\{0%\{scale:1 1;\} 22%\{scale:1 2;\} 100%\{scale:1 1;\}\}/.test(tpl) && /@keyframes twSurgeA\{0%\{scale:1 1;\} 22%\{scale:1 1\.4;\} 100%\{scale:1 1;\}\}/.test(tpl), 'the crest rises once and settles (no second lift), lower than before'); }

// ---- 17:01 #4 one wind pip
{ const f = fnSrc('flyerWindPips'); ok(!!f, 'flyerWindPips exists');
  const ctx = {TX: k=> k, escapeAttr: s=> s, iconHTML: (k, e)=> e}; vm.createContext(ctx); vm.runInContext(f, ctx);
  const tail = ctx.flyerWindPips({flying:true}, {k:'tail'}), head = ctx.flyerWindPips({flying:true}, {k:'head'}), headQ = ctx.flyerWindPips({flying:true, quick:true}, {k:'head'}), tailQ = ctx.flyerWindPips({flying:true, quick:true}, {k:'tail'}), calm = ctx.flyerWindPips({flying:true, quick:true}, null);
  ok(tail.length === 1 && /ab-windpair wind-live wind-tail/.test(tail[0]) && /🪽/.test(tail[0]) && /👢/.test(tail[0]), 'Tailwind: wing + boot in one lit pip');
  ok(head.length === 1 && /wind-head/.test(head[0]) && /🪽/.test(head[0]) && /×2/.test(head[0]), 'Headwind: wing + ×2 in one lit pip');
  ok(tailQ.length === 1, 'a Quick Flyer\'s own boot joins the Tailwind pair (no second boot)');
  ok(headQ.length === 2 && /class="ab-quick"/.test(headQ[1]), 'Headwind: its own Quick keeps a plain pip');
  ok(calm.length === 2 && !/wind-live/.test(calm.join('')), 'no wind: wing and boot as before');
  ok(/out\.push\(\.\.\.flyerWindPips\(e, lw\)\)/.test(fnSrc('abilityBadges')) && /flyerWindPips\(e, lw\)/.test(fnSrc('syncWindBadges')), 'the card and the mid-replay sync draw the same pips');
  ok(/\.ab-windpair\{display:inline-flex;/.test(tpl), 'the pair is one inline pill'); }

// ---- 17:01 #6 the camera
{ const guard = between(src, '(function boardSnapGuard(){', 'function settleStrayBoardCards');
  ok(/const csc = inner && inner\.offsetWidth > 0 \? \(rr\.width \/ inner\.offsetWidth\) \|\| 1 : 1;/.test(guard) && /x:\(r\.left - rr\.left\)\/csc, y:\(r\.top - rr\.top\)\/csc, w:r\.width\/csc/.test(guard), 'the snap guard measures cards in the board\'s own px (a zoom is not a snap)');
  ok(/gsap\.fromTo\(el, \{x:dx\}, \{x:0,/.test(guard) && !/battlefieldScale > 0\) \? battlefieldScale : 1;\n\s*gsap\.fromTo\(el, \{x:dx\/sc\}/.test(guard), '... and glides a real snap back in those px');
  const f = fnSrc('setBoardLean'); const ctx = {}; vm.createContext(ctx); vm.runInContext('var battlefieldLeanX = 0, battlefieldTilt = 0, battlefieldPanLo = 0, battlefieldPanHi = 0;\n' + f, ctx);
  const L = (c, minX, maxX, W)=> ({c, minX, maxX, W, colW: 100});
  // 2026-10-29 UI1: the camera rests on the mean of the units now (owner O3), so these three cases expect -mean (kept in frame) instead of "no move / just enough to bring a card in".
  ctx.setBoardLean(L(150, -100, 400, 1200), 1, 0); ok(ctx.battlefieldLeanX === -150 && ctx.battlefieldTilt === 0, `cards that all fit: the camera moves to the cards' mean, no turn (${ctx.battlefieldLeanX}, ${ctx.battlefieldTilt})`);
  ctx.setBoardLean(L(300, 100, 700, 1200), 1, 0); ok(Math.abs(ctx.battlefieldLeanX - (-300)) < 1 && ctx.battlefieldTilt === 0, `a mass right of the middle: the camera centres on it (${ctx.battlefieldLeanX})`);
  ctx.setBoardLean(L(-300, -800, 100, 1200), 1, 0); ok(Math.abs(ctx.battlefieldLeanX - 300) < 1, `a mass left of the middle: the other way (${ctx.battlefieldLeanX})`); }

// ---- 19:30 the bramble falls
{ ok(/M\.castleSink = function\(el, opts\)/.test(fxc) && /CASTLE_SINK_MS = 1900/.test(fxc), 'FX.C.castleSink exists');
  ok(/M\.hooks\.castleFallMine = function[\s\S]{0,400}M\.castleSink\(el/.test(fxc), 'your bramble falls with castleSink');
  const cc = between(src, 'async function castleCrumble(el){', '// 2026-10-14: the cellular-automaton crumble');
  ok(/FX\.C\.castleSink\(el, \{host: document\.querySelector\('\.battlefield'\)\}\)/.test(cc) && /noteCastleGone/.test(cc), 'theirs too (castleCrumble), and it is noted as gone');
  const es = between(src, 'async function showEndSign(m){', 'const el = document.createElement'); ok(/FX\.C\.castleSink\(tile, \{host: battlefield\}\)/.test(es) && /noteCastleGone\(side\)/.test(es), 'a fall without its own sink (a draw, a forced end) sinks the same way');
  const cf = fnSrc('castleFallenNow'); const ctx = {matchState:null}; vm.createContext(ctx); vm.runInContext(cf, ctx);
  ctx.matchState = {over:true, mode:'conquest'}; ok(ctx.castleFallenNow('B', 0) === true && ctx.castleFallenNow('B', 5) === false, 'after the fight a bramble at 0 is drawn fallen (one with Health is not)');
  ctx.matchState = {over:false, mode:'conquest', _castleGone:{A:true}}; ok(ctx.castleFallenNow('A', 0) && !ctx.castleFallenNow('B', 0), 'during the end sequence: once it has sunk');
  ctx.matchState = {over:true, mode:'sandbox'}; ok(!ctx.castleFallenNow('B', 0), 'not in the sandbox');
  ok(/\+ \(castleFallenNow\(hqSide, hp\) \? ' castle-fallen' : ''\)/.test(fnSrc('matchCastleTileHTML')), 'every redraw of the tile keeps it down');
  ok(/\.match-castle-tile\.castle-fallen\{visibility:hidden !important;/.test(tpl), '.castle-fallen hides it, keeping its spot'); }

// ---- 19:39 smoke
{ ok(/M\.smokeBomb = function\(thrower, target, opts\)/.test(fxc) && /const SMOKE_LOOK = \{smoke:/.test(fxc) && /blind:\{/.test(fxc) && /none:\{/.test(fxc), 'FX.C.smokeBomb with a look per outcome');
  ok(/C\.smokeBomb\(me, t, \{onImpact: land, effect: ev\.effect\}\)/.test(src), 'the game plays it on a smokeBomb event (SkillFX\'s as the fallback)');
  ok(/const SMOKE_BILLOWS_HTML = '<i class="sb1"><\/i><i class="sb2"><\/i><i class="sb3"><\/i><i class="sb4"><\/i>';/.test(src) && /smoke-overlay" aria-hidden="true">\$\{SMOKE_BILLOWS_HTML\}/.test(src), 'Smoke on a unit is four billows');
  ok(/@keyframes smokeBillowA/.test(tpl) && /\.smoke-overlay\.is-lifting\{animation:smokeOut/.test(tpl) && !/\.smoke-overlay > i\{[^}]*filter:/.test(tpl), 'they curl, thicken in, thin away; no filter on the card'); }

// ---- 19:27 #1 the pack summary
{ ok(/const poClearFlights = \(\)=>/.test(src) && (src.match(/poClearFlights\(\);/g) || []).length >= 2, 'the summary and Open all clear any flight still in the air');
  ok(/if\(!reduce && mini\.animate && cur \+ 1 < cards\.length\)\{/.test(src), 'the last card no longer flies to the pile the summary replaces');
  ok(!/new card\$\{nNew===1\?'':'s'\}!<\/b> · ` : ''\}/.test(src), 'no dangling "·" after "3 new cards!"'); }

// ---- 19:27 #20 night water, dusk bars, the day/night change
{ const pt = between(fxb, '// Perma-tide (wt-perma-tide, a pill)', '// Moonpull');
  ok(/const CURRENT_STREAKS = \d+, CURRENT_ALPHA = \.3;/.test(pt), 'the current: separate streaks at a third of the old strength (.85 -> .3)');
  ok(/--h:\$\{\(100\*rnd\(\.9, 1\.1\)\)/.test(pt) && /left:0; bottom:0; width:var\(--w/.test(pt) && /--dl:\$\{\(-rnd\(0, d\)\)/.test(pt), 'each its own height (x0.9-1.1), width, slant and place in time');
  ok(!/repeating-linear-gradient/.test(between(pt, 'css(\'current\'', 'function currentStreaksHTML')), 'no evenly spaced stripe pattern any more (kept only as permaTide_A for the Lab)');
  ok(/const DUSK_BAR_ALPHA = \.175;/.test(fxb) && /rgba\(40,20,50,\$\{DUSK_BAR_ALPHA\}\)/.test(fxb), 'dusk\'s shadow bars are 50% more transparent (.35 -> .175)');
  const sp = fnSrc('skyPhaseLayers'); ok(/const C = SKY_CREEP_BV/.test(sp) && /SKY_CREEP_BV = \{ms: 8500, peak: \.1/.test(src), 'the creep is slow (8.5 s) and faint (10%)');
  ok(/\{opacity:1, offset:\.25, easing:ease\}/.test(sp) && /\{opacity:1, offset:\.8\}/.test(sp), 'the old tint holds while the new one comes in over it (no washed-out middle)');
  ok(/easing:SKY_PHASE_EASE, fill:'forwards'/.test(fnSrc('syncNightVeil')), 'the night veil follows the same gentle curve'); }

// ---- 13:16 #1 squashed / stretched faces
{ ok(/gsap\.killTweensOf\(tile, 'y,x,rotation,scale,scaleX,scaleY'\);/.test(fnSrc('animateAttacker') || src), 'animateAttacker cuts a squash off whole (scaleX/scaleY too)');
  const wd = fnSrc('playAnimWatchdog'); ok(/tileRestSeen/.test(wd) && /gsap\.to\(t, \{scaleX:1, scaleY:1, x:0, y:0, rotation:0, duration:\.18/.test(wd) && /if\(n < 2\) return;/.test(wd), 'the watchdog eases back a face left off its rest pose with nothing animating it (after two checks)'); }

// ---- 13:16 #21 armor pips
{ const ab = fnSrc('abilityBadges'); ok(/na >= 5 \? `<span class="ab-shields is-num" data-n="\$\{na\}"/.test(ab) && /`<span class="ab-shields ab-stack" data-n="\$\{na\}">\$\{'<i>🛡<\/i>'\.repeat\(na\)\}<\/span>`/.test(ab), 'Armor 1-4: a stack; 5+: one shield with its number');
  ok(/\.ab-shields\.ab-stack > i\{display:inline-block; width:\.5em !important;/.test(tpl) && /\.ab-shields\.is-num > b\{position:absolute; left:50%;/.test(tpl), 'the stack overlaps evenly inside its pip; the number sits on the shield'); }

// ---- 13:16 #23 Shield through a mid-round arrival
{ const g = fnSrc('replayGuardSnap'); ok(!!g && /shield:c\.shield\|\|0/.test(g), 'replayGuardSnap carries the Shield');
  ok((src.match(/\.\.\.replayGuardSnap\(liveCard\)\}/g) || []).length === 2 && /shield: \(\(sd\.effects\|\|\{\}\)\.shield \?/.test(src), 'both live backfills and the card-built one keep it'); }

// ---- 13:16 #24
ok(/@media \(max-width:640px\)\{ #deckWidgetTop \.enemy-hand-count\{top:3px; font-size:8\.5px;/.test(tpl), 'on a phone the pill sits inside their Deck, smaller');

// ---- the Effects Lab
['wt-wind-swap', 'wt-tide-flow', 'castle-crumble', 'sk-smoke-bomb', 'st-smoke-apply', 'wt-perma-tide'].forEach(id=> ok(lab.includes(`R({id:'${id}'`), 'lab entry ' + id));
ok(/label:'BV · Before/.test(lab) && /label:'BV · After/.test(lab) && !/key:'[^A-H]'/.test(lab), 'the lab entries have before / after, on free letters A-H');

console.log(`bv-2026-10-24: ${n - fail}/${n} passed`);
process.exit(fail ? 1 : 0);
