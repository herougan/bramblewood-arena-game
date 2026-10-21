#!/usr/bin/env node
// 2026-10-19 (package BU, battle UI fixes; owner on an iPhone, 12:23):
//   4. "Fast forward - 3x, 4x, 5x should only be unlocked at Map 20, 40, and 60." -> speedStepsFor (arena_app.js), the cycle for a
//      player's progress: 3x once Map 20 is cleared, 4x at Map 40, 5x at Map 60; locked speeds are left out; Admin Mode has them all.
//   1. "You should always be able to play a card in the centre column." -> the engine's legalSlots: slot 0 is legal whenever it is
//      empty (a row thinned to one side, units at 2..4, could not play there before).
//   + the static shape of the other fixes (castle numbers on the HP bar, the Cleave crescent on the target row, the tentacle).
//   (2026-10-19, package U3: the castle numbers moved from the bar's centre to its fill's end, the owner's 13:45 call.)
// The browser half: tests/e2e/battle_ui_2026_10_19.py (Playwright, 430/390 phones and 1366).
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
const src = fs.readFileSync(path.join(ROOT, 'arena_app.js'), 'utf8');
const sfx = fs.readFileSync(path.join(ROOT, 'bramblewood-skillfx.js'), 'utf8');
const fxf = fs.readFileSync(path.join(ROOT, 'bramblewood-fx-f.js'), 'utf8');
const {TEXT} = require(path.join(ROOT, 'bramblewood-texts.js'));
let fail = 0, n = 0; const ok = (c, m)=>{ n++; if(!c){ fail++; console.log('  ✗', m); } };

// ---- 4. the speed gates (speedStepsFor and SPEED_GATES lifted out of arena_app.js and run as they are)
const grab = re=>{ const m = src.match(re); return m ? m[0] : ''; };
const gates = grab(/const SPEED_GATES = \[[^\]]*\];/), fnStart = src.indexOf('function speedStepsFor(p){');
let fnSrc = '';
if(fnStart >= 0){ let depth = 0, i = src.indexOf('{', fnStart); for(; i < src.length; i++){ if(src[i] === '{') depth++; else if(src[i] === '}' && --depth === 0) break; } fnSrc = src.slice(fnStart, i + 1); }
ok(gates && fnSrc, 'speedStepsFor and SPEED_GATES are in arena_app.js');
const speedStepsFor = new Function(gates + '\n' + fnSrc + '\nreturn speedStepsFor;')();
const upTo = k=> (n=> n <= k);
const S = (o)=> JSON.stringify(speedStepsFor(o));
ok(S({}) === '[1,0.5]', `a new player: 1x and 0.5x only (${S({})})`);
ok(S({firstWin:true}) === '[1,1.5,0.5]', `after a first win: + 1.5x (${S({firstWin:true})})`);
ok(S({firstWin:true, firstElite:true, cleared:upTo(19)}) === '[1,1.5,2,0.5]', `Map 19 cleared: no 3x yet (${S({firstWin:true, firstElite:true, cleared:upTo(19)})})`);
ok(S({firstWin:true, firstElite:true, cleared:upTo(20)}) === '[1,1.5,2,3,0.5]', `Map 20 cleared: 3x (${S({firstWin:true, firstElite:true, cleared:upTo(20)})})`);
ok(S({firstWin:true, firstElite:true, cleared:upTo(39)}) === '[1,1.5,2,3,0.5]', 'Map 39 cleared: still no 4x');
ok(S({firstWin:true, firstElite:true, cleared:upTo(40)}) === '[1,1.5,2,3,4,0.5]', 'Map 40 cleared: 4x');
ok(S({firstWin:true, firstElite:true, cleared:upTo(59)}) === '[1,1.5,2,3,4,0.5]', 'Map 59 cleared: still no 5x');
ok(S({firstWin:true, firstElite:true, cleared:upTo(60)}) === '[1,1.5,2,3,4,5,0.5]', 'Map 60 cleared: 5x');
ok(S({firstWin:true, firstElite:true, cleared:upTo(2)}) === '[1,1.5,2,0.5]', 'the old gates are gone (Map 2 no longer opens 3x)');
ok(S({cleared:n=> n === 40}) === '[1,4,0.5]', 'each gate reads its own map (a cleared Map 40 alone opens 4x)');
ok(S({admin:true}) === '[1,1.5,2,3,4,5,0.5]', 'Admin Mode: every speed');
ok(/function speedSteps\(\)\{[^]*?p\.cleared = n=> !!\(mains\[n\] && conquestMapCleared\(mains\[n\]\.id\)\);[^]*?return speedStepsFor\(p\);/.test(src), 'the game reads "Map N cleared" as the Forge\'s Map 11 does (mainConquestMaps()[N], conquestMapCleared)');
ok(/const st = speedSteps\(\); if\(st\.length < 2\)[^]*?m\.speedMult = st\[/.test(src), 'the button cycles speedSteps() (a locked speed is skipped)');
ok(TEXT['ui.speed-locked'] === '{speed}×: Clear Map {n}' && /TX\('ui\.speed-locked', \{speed: g\.speed, n: g\.map\}\)/.test(src), 'the lock hint is a TX key ("3×: Clear Map 20")');
ok(/mapIsCharted\(g\.map\)/.test(src), 'a lock only names a map that exists on the road');
for(const c of ['de', 'es', 'fr', 'id', 'it', 'ja', 'ko', 'pt', 'ta', 'tl', 'zh-Hans', 'zh-Hant']){
  const pack = JSON.parse(fs.readFileSync(path.join(ROOT, 'lang', c + '.json'), 'utf8')), t = pack['{speed}×: Clear Map {n}'];
  ok(typeof t === 'string' && t.includes('{speed}') && t.includes('{n}'), `lang/${c}.json translates the lock hint`);
}

// ---- 1. the centre column is always legal when empty (the engine)
const H = require('./lib/harness.js'), E = H.Engine;
const defs = Object.assign({}, H.loadCardDefs(), {'bu-u': {id:'bu-u', name:'U', attack:1, health:50, wait:0, cost:0, effects:{}}});
const e = E.makeSimEngine(defs, E.mulberry32(7), {recordEvents:false, battleMode:'open'});
const P = {1: e.newPlayer(1, {}), 2: e.newPlayer(2, {})};
const put = (pid, slot)=>{ const c = e.makeBoardCard('bu-u'); c.slot = slot; const pl = P[pid]; (slot === 0 ? pl.row.center : slot < 0 ? pl.row.left : pl.row.right).push(c); e.syncSlots(pl); return c; };
ok(JSON.stringify(e.legalSlots(P[1])) === '[0]', 'an empty row: only the centre');
[2, 3, 4].forEach(s=> put(1, s));
ok(JSON.stringify(e.legalSlots(P[1])) === '[0,1,5]', `a row at 2..4: the centre is legal too (${JSON.stringify(e.legalSlots(P[1]))})`);
put(1, 0);
ok(JSON.stringify(e.legalSlots(P[1])) === '[-1,1,5]', `the centre taken: not offered (${JSON.stringify(e.legalSlots(P[1]))})`);
const Q = {1: e.newPlayer(1, {}), 2: e.newPlayer(2, {})}; [-4, -3].forEach(s=>{ const c = e.makeBoardCard('bu-u'); c.slot = s; Q[1].row.left.push(c); }); e.syncSlots(Q[1]);
ok(JSON.stringify(e.legalSlots(Q[1])) === '[-5,-2,0]', `a row at -4..-3: the centre is legal (${JSON.stringify(e.legalSlots(Q[1]))})`);

// ---- 1. the framing always holds column 0 (mb2SpanWindow lifted out and run)
const winStart = src.indexOf('function mb2SpanWindow(m){'); let winSrc = '';
if(winStart >= 0){ let depth = 0, i = src.indexOf('{', winStart); for(; i < src.length; i++){ if(src[i] === '{') depth++; else if(src[i] === '}' && --depth === 0) break; } winSrc = src.slice(winStart, i + 1); }
const slack = grab(/const MB2_CENTRE_SLACK = \d+;/);
ok(winSrc && slack, 'mb2SpanWindow and MB2_CENTRE_SLACK are in arena_app.js');
const occ = {v:null};
const mb2SpanWindow = new Function('mb2OccupiedSlots', slack + '\n' + winSrc + '\nreturn mb2SpanWindow;')(()=> occ.v);
const W = (lo, hi, R, raid)=>{ occ.v = [lo, hi]; const w = mb2SpanWindow({_slotRange:R, raidFull:!!raid}); return w.lo + '..' + w.hi; };
ok(W(2, 4, 5) === '0..5', `units at 2..4: the window reaches column 0 (${W(2, 4, 5)})`);
ok(W(-3, 2, 5) === '-4..4', `units at -3..2: centred on column 0 at the cost of one column (${W(-3, 2, 5)})`);
ok(W(-2, 2, 5) === '-3..3', `units at -2..2: centred (${W(-2, 2, 5)})`);
ok(W(0, 0, 3) === '-1..1', `one unit in the centre: three columns (${W(0, 0, 3)})`);
ok(W(0, 0, 3, true) === '-2..2', `a raid: at least five, centred (${W(0, 0, 3, true)})`);
for(let lo = -6; lo <= 6; lo++) for(let hi = lo; hi <= 6; hi++){ const [a, b] = W(lo, hi, 7).split('..').map(Number); if(!(a <= 0 && b >= 0)) ok(false, `units at ${lo}..${hi}: column 0 outside the window ${a}..${b}`); }

// ---- 2. castle numbers on the HP bar they hit
// 2026-10-19 (package U3, owner 13:45: "It comes out at where the health bar% is currently at. We could do that for all games."): no
// longer the bar's centre: the fill's end (hqFillEndX, from the bar's screen rect and the fill's width %), kept on screen (u3ClampOnBar).
ok(/function hqRibbonFloatAnchor\(side\)\{[^]*?const track = rib\.querySelector\('\.bf-hp-track'\)[^]*?const x = hqFillEndX\(rib, bar\)/.test(src), 'the castle number sits where the HP bar\'s fill ends (its screen rect)');
ok(/function hqFillEndX\(rib, bar\)\{[^]*?parseFloat\(fill\.style\.width\)[^]*?return fromRight \? bar\.right - bar\.width\*pct : bar\.left \+ bar\.width\*pct;/.test(src), 'the fill\'s end: the bar\'s left edge plus the fill %, mirrored for a fill from the right');
ok(/const barShift = onBar \? u3ClampOnBar\(el, f, big\) : 0;/.test(src) && /function u3ClampOnBar\(anchor, f, big\)/.test(src), 'and the number is kept fully on screen at very low or full Health');
ok(/const onBar = !!\(el\.classList && el\.classList\.contains\('hq-float-anchor'\)\);\s*const dx = onBar \? 0 :/.test(src), 'and does not drift sideways');

// ---- 3. Cleave: the crescent on the target's row, sized to the card
ok(/function cleaveSlots\(evL, evM, evR\)\{[^]*?\(t && t\.parentElement === row\) \? t : sib\(d\)/.test(src), 'a side point is used only when its element is in the target\'s row (the 10-19 loop came from a point in the other row)');
ok(/function crescentSlash\(pts, away, t0, tipEnd, o\)/.test(sfx) && /thick = Math\.max\(4, Math\.min\(14, cw\*0\.18\)\)/.test(sfx) && !/Math\.max\(34, Math\.abs\(P2\.x - P0\.x\)\*0\.16\)/.test(sfx), 'the crescent is sized to the card (no 34 px minimum bow)');
ok(/crescentSlash\(P\.map\(/.test(sfx), 'cleaveSwing draws the crescent');

// ---- 5. the tentacle strike
ok(/function tentacleSVG\(B, T, w, dir\)/.test(fxf) && /const TENT = \{slam:220, squash:110, back:350\};/.test(fxf), 'the Tentacle Smack: a drawn SVG tentacle, slam 220 ms, pull back 350 ms');
// 2026-10-21 (package TT): since package TF (2026-10-19, owner 22:09) reduced motion shows the tentacle lying still (fade in, hold, fade) with the flash, not the flash alone
ok(/function smokePuff\(/.test(fxf) && /if\(reduced\)\{ \/\/ 2026-10-19 \(package TF\): reduced motion: the tentacle lies still/.test(fxf) && /reduced \? ' is-still' : ''/.test(fxf), 'a smoke puff at impact; reduced motion: the tentacle lies still, with a flash');
ok(/\(reducedMotion\(\) && ev\.type !== 'raidSmack'\)/.test(src), 'the smack reaches FX.F under reduced motion (for its flash)');

console.log(fail ? `bu-2026-10-19: ${fail} of ${n} failed` : `bu-2026-10-19: all ${n} passed`);
process.exit(fail ? 1 : 0);
