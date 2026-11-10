#!/usr/bin/env node
// 2026-11-07 (package UI31, owner 10:25): Daunt's text says when it triggers, a per-emoji pip nudge table (Shell centred, Shield and Tide up),
// the Shell turtle pop-up, the frost played once / in reverse / a short fade when frozen again, the coloured "?" on higher-level skill tiles.
// Source checks plus the pure parts run for real (the frost state machine and the nudge helper on a tiny fake DOM).
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
const read = rel=> fs.readFileSync(path.join(ROOT, rel), 'utf8');
let fail = 0, checks = 0; const ok = (c, m)=>{ checks++; if(!c){ fail++; console.log('  x', m); } };
const app = read('arena_app.js'), tpl = read('arena_template.html'), eng = read('bramblewood-engine.js'), texts = read('bramblewood-texts.js');
const CODES = ['de', 'es', 'fr', 'id', 'it', 'ja', 'ko', 'pt', 'ta', 'tl', 'zh-Hans', 'zh-Hant'];

// 1 Daunt: the engine applies it on every landed hit; the text says so, in one TX key used by the card line and the editor, translated in 12 packs
ok(/if\((?:e40M && )?attDef\.effects && Number\(attDef\.effects\.daunt\) > 0 && defCard\.hp>0(?: && eng36Lands\(defCard, 'daunt'\) \/\* ENG36 \(2026-11-08\) \*\/)?\)\{\s*\(defCard\.daunts = defCard\.daunts \|\| \[\]\)\.push/.test(eng), 'engine: Daunt pushes one mark for each landed hit'); // 2026-11-08 (ENG36): + the status-Resist gate (eng36Lands) on the same line; FIX12 (2026-11-10): + ENG40's melee-swing gate (e40M: a thrown Boomerang / Bananarang swing carries no melee rider, Daunt rides 'melee'); not ENG39
const m = texts.match(/"ui\.ui31-daunt": "([^"]+)"/); ok(m && /every (melee )?hit/i.test(m[1]) /* 2026-11-07 (ENG34 merge): now "every melee hit" */ && m[1].includes('{n}'), 'TX key ui.ui31-daunt says "every hit" and takes {n}');
ok(/daunt: v=> TX\('ui\.ui31-daunt'/.test(app) && /key:'daunt'[^\n]*desc:v=> TX\('ui\.ui31-daunt'/.test(app), 'the card line and the skill editor both use the key');
CODES.forEach(c=>{ const d = JSON.parse(read(`lang/${c}.json`)); const t = m && d[m[1]]; ok(t && t !== m[1] && t.includes('{n}'), `lang/${c}.json translates the Daunt text with {n}`);
  const u = JSON.parse(read(`lang/ui/${c}.json`)); ok(!('Its hits lower the target\'s Attack by {v1} until the end of next round. Stacks.' in u) && !('On hit, the target loses {v1} Attack until the end of the next round. It stacks.' in u), `lang/ui/${c}.json: no stale rows for the two old Daunt texts`); });

// 2 the emoji nudge table
const tbl = app.match(/const EMOJI_NUDGE = (\{[^}]*\});/); ok(!!tbl, 'EMOJI_NUDGE table exists');
const NUDGE = tbl ? eval('(' + tbl[1] + ')') : {};
ok(NUDGE['🐢'] && NUDGE['🐢'][1] < 0, 'Shell 🐢 is lifted (its ink sits low in its cell)'); ok(NUDGE['💠'] && NUDGE['💠'][1] < 0 && NUDGE['💠'][1] >= -0.0625, 'Shield 💠 up by at most 1 px (1/16 em)'); ok(NUDGE['🌊'] && NUDGE['🌊'][1] < 0 && NUDGE['🌊'][1] >= -0.0625, 'Tide 🌊 up by at most 1 px');
ok(/const nz = emojiNudgeStyle\(fb\);/.test(app) && /ico-nudge/.test(app) && /\.ico\.ico-nudge\{position:relative; left:var\(--enx,0\); top:var\(--eny,0\);\}/.test(tpl), 'iconHTML writes the nudge; CSS applies it without moving the layout');
{ const fn = new Function('EmojiStyle', 'EMOJI_NUDGE', app.match(/function emojiNudgeStyle\(fb\)\{[\s\S]*?\n\}/)[0] + '; return emojiNudgeStyle;');
  const f = fn({active: ()=> 'fluent'}, NUDGE), g = fn({active: ()=> 'noto'}, NUDGE);
  ok(/--eny:-0\.15em/.test(f('🐢')) && f('🐢').includes('--enx:0em'), 'turtle gets its offsets on the Fluent set'); ok(f('🏊') === '', 'an emoji not in the table gets none'); ok(g('🐢') === '', 'another emoji set gets none'); ok(/--eny:-0\.05em/.test(f('💠️')), 'a trailing variation selector is ignored'); }

// 3 Shell pop-up
ok(/function ui31ShellPop\(el\)\{\s*if\(!el \|\| ui27Away\(\)/.test(app), 'the pop-up is skipped while the tab is hidden (UI27)');
ok(/kind==='shellUp'[^\n]*if\(!ui27Away\(\)\) SoundKit\.shellUp\(\)[^\n]*ui31ShellPop\(el\)/.test(app), 'the shellUp event plays the existing shellUp cue (not while hidden) and the pop-up');
ok(/\.ui31-shell-pop\{[^}]*animation:ui31ShellPop/.test(tpl) && /@keyframes ui31ShellPop/.test(tpl), 'pop-up CSS and keyframes exist');

// 4 frost: static at rest, grows once, melts in reverse, a short blue fade when frozen again
ok(!/\.board-card\.is-frozen::after, \.board-card\.is-frozen > \.fly-body::after\{[^}]*animation:frostCreep/.test(tpl.replace(/url\("[^"]*"\)/g, 'url()')), 'the resting ice has no animation (a rebuilt card does not replay it)');
ok(/\.board-card\.frost-in::after[^}]*animation:frostCreep/.test(tpl) && /\.board-card\.frost-thaw::after[^}]*animation:frostCreep[^}]*reverse/.test(tpl) && /\.board-card\.frost-refresh::after[^}]*animation:frostRefresh 1000ms/.test(tpl), 'frost-in plays, frost-thaw plays it in reverse, frost-refresh is a 1 s fade');
{ const cls = new Set(); const timers = [];
  const el = {classList: {contains: c=> cls.has(c), add: (...a)=> a.forEach(c=> cls.add(c)), remove: (...a)=> a.forEach(c=> cls.delete(c))}, offsetWidth: 0};
  const src = app.match(/function ui31FrostSync\(el, now\)\{[\s\S]*?\n\}/)[0] + app.match(/function ui31FrostRefresh\(el\)\{[\s\S]*?\n\}/)[0];
  let away = false;
  const run = new Function('ui27Away', 'fxLevel', 'setTimeout', 'clearTimeout', src + '; return {ui31FrostSync, ui31FrostRefresh};')(()=> away, ()=> 'high', (f, t)=>{ timers.push({f, t}); return timers.length; }, ()=>{});
  const has = (...c)=> c.every(x=> cls.has(x)), flush = ()=>{ while(timers.length) timers.shift().f(); };
  run.ui31FrostSync(el, true); ok(has('is-frozen', 'frost-in'), 'frozen: is-frozen + frost-in'); flush(); ok(has('is-frozen') && !has('frost-in'), 'frost-in is dropped after the play');
  run.ui31FrostSync(el, true); ok(!has('frost-in') && !has('frost-thaw'), 'the same state again plays nothing');
  run.ui31FrostRefresh(el); ok(has('frost-refresh') && !has('frost-in'), 'frozen again: only frost-refresh'); flush();
  run.ui31FrostSync(el, false); ok(has('is-frozen', 'frost-thaw'), 'unfrozen: frost-thaw keeps is-frozen for the reverse play'); flush(); ok(!has('is-frozen') && !has('frost-thaw'), 'both gone after the reverse play');
  away = true; run.ui31FrostSync(el, true); ok(has('is-frozen') && !has('frost-in'), 'hidden tab: the state changes, no animation'); run.ui31FrostRefresh(el); ok(!has('frost-refresh'), 'hidden tab: no fade'); run.ui31FrostSync(el, false); ok(!has('is-frozen') && !has('frost-thaw'), 'hidden tab: unfreezing is immediate'); }
ok(/ui31WasFrozen\(ev, rc, el\)\) ui31FrostRefresh\(el\); else \{ SoundKit\.freezeChime\(\)/.test(app), 'the freeze event: a frozen unit gets the fade, no chime, shake or text');
ok(/else if\(k === 'freeze' && t\)\{ if\(!ui31WasFrozen/.test(app), 'the skill FX skips the full ice for a unit already frozen');
ok(/ui31FrostSync\(el, c\.frozen > 0\)/.test(app), 'updateCardStatusDisplay drives the frost through ui31FrostSync');

// 5 coloured "?" on the Map cards window's higher-level skill tiles
ok(/function ui31GreyQHTML\(lvl\)/.test(app) && /skill-q\$\{lvl > 0 \? ' eng28-later' : ''\}/.test(app), 'ui31GreyQHTML: gold "?" (eng28-later) for a higher-level skill, plain "?" for a hidden one');
ok(/\$\{r\.grey && typeof ui31GreyQHTML === 'function' \? ui31GreyQHTML\(r\.greyLvl\) : ''\}/.test(app), 'grey tiles in ui19McSkillsHTML wear it');

console.log(`ui31: ${checks - fail}/${checks} checks passed`); process.exit(fail ? 1 : 0);
