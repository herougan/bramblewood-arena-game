#!/usr/bin/env node
// Package UI2 (2026-10-29, owner notes 22:23 R1-R3, R5, R7, R8). Static checks and the pure parts run on the real source:
//   R2 the pack opener draws every card through defOf / poTile (a missing or throwing card is a fallback tile), its stages fall through
//      (poGuard), its timers recover, closing never throws; the first pack pops in (CSS, none with reduced motion / low effects)
//   R1 slot rows size for the columns the units stand in (ui2UnitSpan / ui2SetRowSpan, .ui2-span), the zoom counts the same; the phone too
//   R3 a card that dies as it lands is held (holdArrivalDead finds its play in the whole list), Ambush's strike is a short jab
//   R5 the capsule's sparks and the pill's pulse; R7 Shift+click pitches; R8 PRO / BPRO decks always shown; texts in 12 packs
// The browser run (the Morel Hollow packs with a broken card, Skip / Open all, the zoom at five window sizes, the Ambush, the capsule,
// Shift+click, the PRO panel) is tests/e2e/ui2_2026_10_29.py; this suite starts it unless --no-browser.
'use strict';
const fs = require('fs'), path = require('path'), cp = require('child_process');
const ROOT = path.join(__dirname, '..');
const rd = rel=> fs.readFileSync(path.join(ROOT, rel), 'utf8');
let fail = 0, checks = 0; const ok = (c, m)=>{ checks++; if(!c){ fail++; console.log('  ✗', m); } };
const app = rd('arena_app.js'), css = rd('arena_template.html');
const fnSrc = n=>{ const i = app.indexOf('function ' + n + '('); if(i < 0) return ''; let d = 0, j = app.indexOf('{', i); for(let k = j; k < app.length; k++){ if(app[k] === '{') d++; else if(app[k] === '}'){ d--; if(!d) return app.slice(i, k + 1); } } return ''; };
// ---- R2
{ const op = fnSrc('openPackAnimation');
  ok(/const defOf = id=> defs\[id\] \|\| \{id, name:/.test(op) && /const poTile = \(d, o\)=>\{ try\{ return cardTileHTML\(d, o\); \}catch\(e\)\{ console\.error\('\[Bramblewood\] pack opener: card face'/.test(op), 'R2: defOf and poTile (a missing card, a card face that throws)');
  ok(!/defs\[r\.id\]|defs\[id\]|defs\[did\(a\)\]/.test(op.replace('const defOf = id=> defs[id]', '')), 'R2: no bare defs[...] lookup of a pulled card left in the opener');
  ok(!/[^.]cardTileHTML\(/.test(op.replace(/return cardTileHTML\(d, o\)/, '')), 'R2: every card in the opener is drawn through poTile');
  ok(/showSummary = poGuard\('summary', showSummary, poClose\)/.test(op) && /showReveal = poGuard\('reveal', showReveal,/.test(op) && /showPack = poGuard\('pack', showPack,/.test(op) && /showAll = poGuard\('all', showAll, poClose\)/.test(op), 'R2: the stages fall through (pack / reveal -> summary -> close; Open all -> close)');
  ok(/if\(poFailed\.has\(name\)\)\{ return next \? next\(\) : close\(\); \}/.test(op), 'R2: a stage that threw is not tried again (the fall-through ends)');
  ok(/const later = \(fn, ms\)=> timers\.push\(setTimeout\(\(\)=>\{ try\{ fn\(\); \}catch\(e\)\{[^}]*poRecover\(\)/.test(op) && /autoT = setTimeout\(\(\)=>\{ if\(phase==='reveal' && !overlay\.hidden\)\{ try\{ fn\(\); \}catch\(e\)\{[^}]*poRecover\(\)/.test(op), 'R2: timers and the card auto-advance recover');
  ok(/try\{ if\(currentTab==='shop'\) renderShop\(\); \}catch\(e\)/.test(op), 'R2: closing never throws');
  ok(/let poPopped = !!reduce;/.test(op) && /ui2-popin/.test(op), 'R2: the first pack pops in, not with reduced motion');
  ok(/\.po2-pile-wrap\.ui2-popin\{animation:ui2PackPop/.test(css) && /@keyframes ui2PackPop\{0%\{scale:\.8/.test(css) && /html\[data-fx="none"\] \.po2-pile-wrap\.ui2-popin, html\[data-fx="low"\] \.po2-pile-wrap\.ui2-popin\{animation:none;\}/.test(css) && /prefers-reduced-motion: reduce\)\{ \.po2-pile-wrap\.ui2-popin\{animation:none;\}/.test(css), 'R2: pop-in CSS, off for reduced motion and Effects Off / Low');
  const fl = fnSrc('floatRewardPackUp'); ok(/scale:sc \* 0\.8, rotation:-2, duration:1\.05, ease:'sine\.inOut'/.test(fl) && /reducedMotion\(\)/.test(fl), 'R2: the reward pack glides to the centre growing to 80% (gentler), skipped with reduced motion');
  // the stub def a missing id gets is drawable by the helpers the opener calls with it
  const m = /const defOf = id=> (defs\[id\] \|\| \{[^;]*\});/.exec(op); const defOf = m && new Function('defs', 'return id=> ' + m[1])({});
  const st = defOf && defOf('gone-card'); ok(st && st.id === 'gone-card' && st.name === 'gone-card' && st.rarity === 'common' && st.effects, 'R2: an unknown id becomes a stub card with its id as its name'); }
// ---- R1
{ const span = new Function(fnSrc('ui2UnitSpan') + '\nreturn ui2UnitSpan;')();
  const rows = slots=> ({left: slots.filter(s=> s < 0).map(slot=> ({slot})), center: slots.filter(s=> s === 0).map(slot=> ({slot})), right: slots.filter(s=> s > 0).map(slot=> ({slot}))});
  ok(span([rows([-3, -2, -1, 0, 1, 2, 3]), rows([])]) === 7, 'R1: seven units (-3..3) need 7 columns (the row draws 9)');
  ok(span([rows([-4, -3, -2, -1, 0, 1, 2, 3, 4]), rows([0])]) === 9 && span([rows([-6, 5]), rows([1])]) === 13, 'R1: the widest unit on either row, both sides of the centre');
  ok(span([rows([]), rows([])]) === 1 && span([null, rows([2])]) === 5, 'R1: no units -> 1; one row missing is fine');
  const set = fnSrc('ui2SetRowSpan'); ok(/el\.style\.setProperty\('--row-n', String\(n\)\)/.test(set) && /el\.classList\.toggle\('ui2-span', on\)/.test(set), 'R1: the row gets --row-n and .ui2-span when it draws more columns than its units need');
  ok(/if\(slotView\) ui2SetRowSpan\(m, \[p1Rows, p2Rows\], \[rowEnemy, rowMine\]\);/.test(app), 'R1: renderBoard sets it after the rows are drawn');
  ok(/\.board-row\.ui2-span > \.board-card\{flex-shrink:0;\}/.test(css), 'R1: the spare edge columns keep the cards\' size (no flex squeeze)');
  ok(/const ui2Span = !mb2Span && !raidCols && matchState && isSlotMatch\(matchState\) && matchState\._ui2Span/.test(app) && /: ui2Span \? widthForCount\(ui2Span\) :/.test(app), 'R1: fitBattlefieldZoom counts the same columns (no early zoom-out)');
  const ph = fnSrc('mb2FitPhoneBoard'); ok(/const occ = mb2OccupiedSlots\(m\);/.test(ph) && /Math\.max\(cols\.wV, wU\)/.test(ph) && /cols: all \? cols\.N : winFits \? cols\.V : nU/.test(ph), 'R1: the phone sizes for the units\' columns too'); }
// ---- R3
{ const src = fnSrc('holdArrivalDead'); const hold = new Function('getCardDefs', src + '\nreturn holdArrivalDead;')(()=> ({'meadow-rabbit': {health: 2, attack: 4, wait: 0}, 'fox-kit': {health: 3, attack: 2}}));
  const play = {type:'play', side:'A', defId:'meadow-rabbit', uid:9, boardSide:'center', slot:0}, later = [{type:'ambush', uid:7}, {type:'hit', targetUid:9, dmg:2, ambush:true}, {type:'death', side:'A', uid:9}];
  const m = {}; hold(m, new Map(), later, [play].concat(later)); const h = m._arrivalHold && m._arrivalHold.get('9');
  ok(h && h.pid === 1 && h.card.slot === 0 && h.card.hp === 2 && h.card.maxHp === 2, 'R3: the card killed as it lands is held (its play is looked up in the whole list), at full Health until the blow');
  const m2 = {}; hold(m2, new Map(), later); ok(!(m2._arrivalHold && m2._arrivalHold.size), 'R3: (without the whole list there is no play to find: the old bug)');
  const m3 = {}; const p3 = {type:'play', side:'B', defId:'fox-kit@lv0', uid:10, slot:1}; hold(m3, new Map(), [{type:'death', uid:10}], [p3, {type:'death', uid:10}]); ok(m3._arrivalHold.get('10').card.maxHp === 3, 'R3: a leveled id falls back to its card');
  ok(/holdArrivalDead\(m, prePos, later, events\)/.test(app) && /holdArrivalDead\(m, prePos, deferred, events\)/.test(app), 'R3: both callers (your play, the CPU\'s) pass the whole list');
  ok(/short: !!ev\.ambush/.test(app) && /if\(opts\.short\)\{\s*if\(reducedMotion\(\)\)\{ tl\.kill\(\);/.test(fnSrc('animateAttacker')) && /\.to\(tile, \{y:dir\*-8,/.test(fnSrc('animateAttacker')), 'R3: Ambush\'s strike is a short jab (8 px, the attack goes 15), none with reduced motion');
  ok(/base = ev\.ranged \? 1260 : ev\.ambush \? 640/.test(app) && /\(ev\.ambush && !ev\.ranged && quickAt == null\) \? Math\.round\(windup\*0\.5 \+ impactPad\*0\.5\)/.test(app), 'R3: the jab lands sooner and paces faster than an attack (Ambush < Attack < Pounce)');
  const eng = rd('bramblewood-engine.js'); ok(/events\.push\(\{type:'ambush', side:sideOf\(foeId\)/.test(eng), 'R3: the engine\'s Ambush is unchanged (its events)'); }
// ---- R5
{ const z = fnSrc('ui2EnergyZap'); ok(/const calm = reducedMotion\(\) \|\| !fxAtLeast\('med'\)/.test(z) && /ui2EnergyPulse\(pill\)/.test(z) && /s\.className = 'ui2-zap'; s\.textContent = '⚡'/.test(z), 'R5: sparks fly to the pill and pulse it; calm = one pulse');
  ok(/const from = cb\.getBoundingClientRect\(\); if\(useEnergyCapsule\(\)\)\{[^\n]*ui2EnergyZap\(from\)/.test(app), 'R5: the capsule button sends them');
  ok(/\.ui2-zap\{position:fixed;/.test(css) && /\.energy-pill\.ui2-energy-pulse\{animation:ui2EnergyPulse/.test(css) && /prefers-reduced-motion: reduce\)\{ \.energy-pill\.ui2-energy-pulse\{animation:none;/.test(css), 'R5: CSS, calm with reduced motion'); }
// ---- R7 / R8
ok(/if\(e && e\.shiftKey && !e\.ctrlKey && !e\.metaKey && !e\.altKey\)\{ e\.preventDefault\(\); if\(m\.selectedUid === uid\) m\.selectedUid = null; discardCardByUid\(uid\); return; \}/.test(app), 'R7: Shift+click on a hand card pitches it (discardCardByUid: its own rules, no confirmation)');
ok(/pitchAllowedIn\(matchState\) \? ' ' \+ TX\('ui\.ui2-pitch-shift'\)/.test(fnSrc('discardZoneTitle')), 'R7: the Graveyard\'s tooltip names the shortcut once pitching is open');
ok(/if\(node && node\.pro\) return true;/.test(fnSrc('conquestDeckRevealed')), 'R8: a PRO / BPRO / X-REF fight always shows its deck');
// ---- texts
{ const T = require(path.join(ROOT, 'bramblewood-texts.js')).TEXT, k = 'ui.ui2-pitch-shift';
  ok(T[k] === 'Shift+click a card in your hand to pitch it.', 'texts: ' + k);
  const codes = ['fr', 'de', 'es', 'it', 'pt', 'tl', 'ta', 'id', 'zh-Hans', 'zh-Hant', 'ja', 'ko'];
  ok(codes.every(c=> JSON.parse(rd('lang/' + c + '.json'))[T[k]]), 'texts: a row in all 12 packs');
  const idx = rd('index.html'); ok(idx.includes('function ui2UnitSpan(') && idx.includes('ui2PackPop') && idx.includes("'ui.ui2-pitch-shift'"), 'build: index.html has UI2 (run the build after edits)'); }
ok(/ui2-2026-10-29\.js/.test(rd('tests/run-all.sh')), 'registered in tests/run-all.sh');
if(!process.argv.includes('--no-browser') && fs.existsSync(path.join(__dirname, 'e2e', 'ui2_2026_10_29.py'))){
  const r = cp.spawnSync('python3', [path.join(__dirname, 'e2e', 'ui2_2026_10_29.py'), '--sizes', '1366x768,820x1180,390x844'] /* the full five sizes: run the e2e on its own */, {cwd: ROOT, encoding: 'utf8', timeout: 540000});
  const out = (r.stdout || '') + (r.stderr || '');
  ok(r.status === 0 && /all passed/.test(out), 'browser run (tests/e2e/ui2_2026_10_29.py): ' + (r.status === 0 ? 'all passed' : out.split('\n').filter(l=> /FAIL|Error/.test(l)).slice(0, 4).join(' | ')));
}
console.log(`ui2: ${checks - fail}/${checks} checks passed`);
process.exit(fail ? 1 : 0);
