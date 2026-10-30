#!/usr/bin/env node
// Package UI5 (2026-10-30; owner 21:35 W5, 21:53 W12). Static and function-level checks; the browser run is tests/e2e/ui5_2026_10_30.py (shots in docs/screens/ui5/).
//   W5  Tide / Swimmer chips: left out of a fight on a map that can never have Tide (hand and board); a hand card's chip is lit / out with the Tide and
//       fades red (out) or green (in) when that changes; board cards keep their lit / unlit chip; no flash on reduced motion / Effects Low.
//   W12 Blind / Purblind: the closing eye plays once and is gone, the tile is darkened ~7% (5-10%), the chip symbol is the spectacles.
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
const rd = rel=> fs.readFileSync(path.join(ROOT, rel), 'utf8');
let fail = 0, checks = 0; const ok = (c, m)=>{ checks++; if(!c){ fail++; console.log('  ✗', m); } };
const app = rd('arena_app.js'), css = rd('arena_template.html');
function fnSrc(name){
  const a = app.indexOf('\nfunction ' + name + '('); if(a < 0) return '';
  let i = app.indexOf('{', a), depth = 0;
  for(; i < app.length; i++){ const ch = app[i]; if(ch === '{') depth++; else if(ch === '}'){ depth--; if(!depth) break; } }
  return app.slice(a + 1, i + 1);
}

// ---- W5: abilityBadges builds the Tide chips by map and place
{ const ab = fnSrc('abilityBadges');
  ok(/ui5Fight/.test(ab) && /matchHasTide\(matchState\)/.test(ab) && /e\.tide && ui5Map/.test(ab) && /e\.swimmer && ui5Map/.test(ab), 'W5 Tide and Swimmer chips are only built when the fight can have Tide (or outside a fight)');
  ok(/bopts && \(bopts\.live \|\| bopts\.hand\)/.test(ab), 'W5 board and hand cards count as "in a fight"; the Codex and detail (no live / hand) show the chips as before');
  ok(/tide-hand-off/.test(ab) && /data-tide-on/.test(ab), 'W5 a hand chip carries tide-hand, tide-hand-off while the Tide is out, and data-tide-on');
  ok(/hand: !!hand/.test(app), 'W5 the card face tells abilityBadges it is a hand card'); }
// run abilityBadges on stubs: the chips by map / place / tide state
{ const src = fnSrc('abilityBadges');
  const run = (m, d, bopts, tide)=>{
    const known = {matchState: m, matchHasTide: x=> !!(x && x._has), liveTideState: ()=> tide ? {k: tide, name: 'Flood', bonus: '+1 Attack'} : null, maskHiddenSkills: x=> x, escapeAttr: x=> String(x),
      iconHTML: k=> `[${k}]`, swimmerLine: ()=> 'Swimmer', TX: k=> k, STATUS_KEYWORDS: [], ui3SightBlindNow: ()=> false, zeitLitNow: ()=> false, currentCardByUidSafe: ()=> null, escapeHtml: x=> String(x)};
    // only the Tide block of abilityBadges runs here (from its ui5Fight line to the Swimmer chip), on the stubs above
    const a = src.indexOf('  { const ui5Fight'), b = src.indexOf('// 2026-10-15: titled Swimmer, not Tide');
    const block = src.slice(a, b);
    const env = new Proxy(known, {has: (t, k)=> typeof k === 'string' && k in t});
    const f = new Function('env', 'e', 'bopts', 'with(env){ const out = []; ' + block + '\n return out.join(""); }');
    try{ return f(env, d.effects, bopts); }catch(err){ return 'THROW ' + err.message; }
  };
  const crab = {effects: {tide: true}}, fish = {effects: {swimmer: true}};
  const fightNo = {over: false, _has: false}, fightYes = {over: false, _has: true};
  const hasChip = h=> /ab-tide|\[tide\]|\[swimmer\]/.test(h);
  ok(!hasChip(String(run(fightNo, crab, {compact: true, live: {wait: 0}}, null))), 'W5 board Tide card on a no-Tide map: no chip');
  ok(!hasChip(String(run(fightNo, fish, {compact: true, hand: true}, null))), 'W5 hand Swimmer on a no-Tide map: no chip');
  ok(hasChip(String(run(null, crab, {compact: true}, null))), 'W5 outside a fight (no match): the chip shows');
  ok(hasChip(String(run(fightNo, crab, {compact: true}, null))), 'W5 a card shown without live / hand (Codex) keeps its chip even with a match behind it');
  { const h = String(run(fightYes, crab, {compact: true, hand: true}, null));
    ok(/tide-hand tide-hand-off/.test(h) && /data-tide-on="0"/.test(h) && !/tide-live/.test(h), 'W5 hand Tide card, Tide out: chip present, marked out (' + h.slice(0, 120) + ')'); }
  { const h = String(run(fightYes, crab, {compact: true, hand: true}, 'flow'));
    ok(/tide-live tide-flow tide-hand"/.test(h) && /data-tide-on="1"/.test(h) && !/tide-hand-off/.test(h), 'W5 hand Tide card, Tide in: lit, not marked out'); }
  { const h = String(run(fightYes, fish, {compact: true, hand: true}, null));
    ok(/tide-hand-off/.test(h) && /data-tide-on="0"/.test(h), 'W5 hand Swimmer, Tide out: marked out'); }
  { const h = String(run(fightYes, crab, {compact: true, live: {wait: 0}}, null));
    ok(/ab-tide/.test(h) && !/tide-hand/.test(h), 'W5 board card, Tide out: today\'s unlit chip (not a hand chip)'); }
  { const h = String(run(fightYes, crab, {compact: true, live: {wait: 0}}, 'flow'));
    ok(/tide-live/.test(h) && !/tide-hand/.test(h), 'W5 board card, Tide in: today\'s lit chip'); } }
// the hand fx: red out when drawn without Tide / when it goes out, green in when it comes in, carried through a re-render
{ const src = fnSrc('ui5TideHandFx');
  const mk = (m, cards)=>{ const strip = {querySelectorAll: sel=> sel === '[data-handuid]' ? cards.map(c=> c.el) : []};
    new Function('m', 'strip', 'Date', src + '\nui5TideHandFx(m, strip);')(m, strip, Date); };
  const card = (uid, on)=>{ const cls = new Set(), pill = {classList: {add: c=> pill.cls.add(c), contains: c=> c === 'abadge'}, cls: new Set(), style: {}};
    const chip = {classList: {add: c=> cls.add(c)}, getAttribute: a=> a === 'data-tide-on' ? (on ? '1' : '0') : null, parentElement: pill, closest: ()=> null, style: {}, cls};
    return {uid, chip, pill, el: {getAttribute: a=> a === 'data-handuid' ? String(uid) : null, querySelectorAll: s=> s === '.tide-hand' ? [chip] : []}}; };
  const m = {};
  let c1 = card(1, false); mk(m, [c1]);
  ok(c1.chip.cls.has('tide-fade-out') && c1.pill.cls.has('tide-fade-out'), 'W5 a card drawn with no Tide: the chip and its pill fade out (red)');
  let c2 = card(1, false); mk(m, [c2]);
  ok(c2.chip.cls.has('tide-fade-out') && c2.chip.style.animationDelay === undefined || /^-\d+ms$/.test(c2.chip.style.animationDelay || ''), 'W5 a re-render inside the fade carries it on (negative delay), it is not restarted');
  let c3 = card(1, true); mk(m, [c3]);
  ok(c3.chip.cls.has('tide-fade-in') && !c3.chip.cls.has('tide-fade-out'), 'W5 Tide comes in: the chip fades in (green)');
  let c4 = card(1, false); mk(m, [c4]);
  ok(c4.chip.cls.has('tide-fade-out'), 'W5 Tide goes out again: the chip fades out');
  const m2 = {}; mk(m2, [card(7, true)]); const c5 = card(7, true); mk(m2, [c5]);
  ok(!c5.chip.cls.has('tide-fade-in') && !c5.chip.cls.has('tide-fade-out'), 'W5 a card with the Tide in and unchanged: no flash'); }
ok(/ui5TideHandFx\(m, strip\)/.test(fnSrc('renderHand')), 'W5 renderHand runs the Tide fade');
ok(/ev\.type==='tide' && matchState && matchHasTide\(matchState\)\) setTimeout\(\(\)=>\{ try\{ if\(matchState && !matchState\.over\) renderHand/.test(app), 'W5 a tide event re-renders the hand');
ok(/\.tide-hand\.tide-hand-off\{opacity:0; visibility:hidden;\}/.test(css) && /\.abadge:has\(> \.tide-hand-off\), \.badges:has\(> \.abadge:only-child > \.tide-hand-off\)\{opacity:0/.test(css), 'W5 an out chip, its pill and a strip holding only it are invisible');
ok(/\.tide-hand\.tide-fade-out\{animation:ui5TideOut/.test(css) && /\.tide-hand\.tide-fade-in\{animation:ui5TideIn/.test(css) && /@keyframes ui5TideOut\{0%\{[^}]*rgba\(235,60,60/.test(css) && /@keyframes ui5TideIn\{0%\{[^}]*rgba\(80,210,100/.test(css), 'W5 red flash out, green flash in');
ok(/prefers-reduced-motion: reduce\)\{ \.tide-hand\.tide-fade-out[^}]*animation:none/.test(css) && /html\[data-fx="low"\], html\[data-fx="none"\]\) :is\(\.tide-hand, \.abadge, \.badges\)\.tide-fade-out/.test(css), 'W5 reduced motion and Effects Low / None: no flash, only show / hide');

// ---- W12: Blind / Purblind
ok(/\.board-card\.is-blind \.card-tile\{filter:brightness\(\.93\);\}/.test(css), 'W12 a Blind tile is darkened 7% (brightness .93, inside 5-10%), on the tile and not the popover');
ok(!/\.board-card\.is-blind \.card-tile\{[^}]*grayscale/.test(css), 'W12 the old grey wash and .88 darkening are gone');
ok(/\.board-card\.is-blind \.blind-overlay\{display:none;\}/.test(css), 'W12 no standing 👁 overlay');
ok(/\.board-card\.fxb-why-blind \.fxb-shut\{opacity:0;\}/.test(css) && /\.fxb-shut\.is-blink\{animation:ui5EyeOnce 1\.9s/.test(css) && /@keyframes ui5EyeOnce\{0%\{opacity:0;\} 10%\{opacity:1;\} 78%\{opacity:1;\} 100%\{opacity:0;\}\}/.test(css), 'W12 the shut eye shows only while its one blink plays (is-blink, set when the unit first goes blind), then fades out');
ok(/\.board-card\.fxb-why-blind \.fxb-shade\{display:none;\}/.test(css) && /fxb-why-blind\.fxb-look-A \.card-tile \.ico\{filter:none;\}/.test(css) && /\.fxd-st\.fxd-st-blind\{display:none;\}/.test(css), 'W12 no standing shade, art dimming or ink splat on a Blind card');
ok(/prefers-reduced-motion: reduce\)\{ \.board-card\.fxb-why-blind \.fxb-shut\.is-blink\{animation:none;\}/.test(css), 'W12 reduced motion: no eye animation');
ok((app.match(/class="abadge blind"[^`]*iconHTML\('blind-now', '🕶️'\)/g) || []).length === 2, 'W12 both Blind status chips (new tile and live patch) use the spectacles');
ok(/ab-blindnow[^`]*iconHTML\('blind-now', '🕶️'\)/.test(app) && /purblind', '🕶️'\)/.test(app), 'W12 the sun-shy / night-blind "blind now" pip and the Purblind skill chip are the spectacles too');

console.log(fail ? `ui5: ${fail} of ${checks} checks FAILED` : `ui5: ${checks} checks passed`);
process.exit(fail ? 1 : 0);
