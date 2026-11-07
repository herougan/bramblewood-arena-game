#!/usr/bin/env node
// 2026-11-07 (package UI32, owner 18:53 / 18:55 / 19:11): the battle log's field lines, the Venom-only float, the Venom tooltip, the hover's counters, the
// "edited since rated" Power marker, the Map cards tile refresh after Save, and the skills section in three groups. Source checks, the translations in the
// 12 packs, and the pure parts run for real (the marker on a fake CARD_POWER). The browser side is tests/e2e/ui32_2026_11_07.py.
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
const read = rel=> fs.readFileSync(path.join(ROOT, rel), 'utf8');
let fail = 0, checks = 0; const ok = (c, m)=>{ checks++; if(!c){ fail++; console.log('  x', m); } };
const app = read('arena_app.js'), texts = read('bramblewood-texts.js'), asm = read('assemble_arena.py');
const CODES = ['de', 'es', 'fr', 'id', 'it', 'ja', 'ko', 'pt', 'ta', 'tl', 'zh-Hans', 'zh-Hant'];

// the new texts: in the table, translated in every pack with the same placeholders
const KEYS = ['ui.ui32-log-tide-soak', 'ui.ui32-log-drain', 'ui.ui32-log-soak', 'ui.ui32-log-dry', 'ui.ui32-log-douse', 'ui.ui32-log-roll', 'ui.ui32-log-ignite', 'ui.ui32-log-glean',
  'ui.ui32-log-feast', 'ui.ui32-log-cross', 'ui.ui32-edited', 'ui.ui32-no-skills', 'ui.ui32-triggers', 'ui.ui32-ctr-thorns', 'ui.ui32-sk-main', 'ui.ui32-sk-other', 'ui.ui32-sk-rec', 'ui.ui7-poison-tip'];
const phs = s=> (s.match(/\{\w+\}/g) || []).sort().join(',');
KEYS.forEach(k=>{
  const m = texts.match(new RegExp('"' + k.replace(/\./g, '\\.') + '": "((?:[^"\\\\]|\\\\.)*)"')); ok(!!m, `TX key ${k} exists`); if(!m) return;
  const en = JSON.parse('"' + m[1] + '"');
  CODES.forEach(c=>{ const d = JSON.parse(read(`lang/${c}.json`)), t = d[en]; ok(t && t !== en, `lang/${c}.json translates ${k}`); if(t) ok(phs(t) === phs(en), `lang/${c}.json keeps the placeholders of ${k} (${phs(en)})`); });
});
ok(/Venom tokens: \{n\}/.test(texts) && !/Envenomed: \{n\}/.test(texts), 'the Venom pip tooltip says "Venom tokens: {n}"');
CODES.forEach(c=>{ ok(!('Envenomed: {n}. It takes damage equal to its stacks each round, then loses 1 stack.' in JSON.parse(read(`lang/${c}.json`))), `lang/${c}.json has no stale Envenomed row`); });

// 1 log: every ENG20 kind has a line; a field line is skipped while the same one was just printed; an unknown kind prints nothing
['en20Soak', 'en20Dry', 'en20Douse', 'en20Ignite', 'en20Roll', 'en20Glean', 'en20LumberFeast', 'crosswind'].forEach(k=> ok(new RegExp("case '" + k + "'").test(app.match(/function ui32FieldLog[\s\S]*?\n\}/)[0]), `ui32FieldLog has a line for ${k}`));
ok(/if\(lt\.fieldKey\)\{ if\(ui32LastFieldKey === lt\.fieldKey\) return; ui32LastFieldKey = lt\.fieldKey; \} else ui32LastFieldKey = null;/.test(app), 'renderLogLine prints a field line once, until another line comes between');
ok(/if\(kindText === ev\.kind\) return null;/.test(app), 'a statusFx kind with no line of its own prints nothing (no "<unit> kind.")');
ok(/ui32LastFieldKey = null; m\.log\.forEach\(renderLogLine\)/.test(app), 'a replayed log starts with no field line pending');

// 2 Venom-only float: the Venom a 0-damage hit added, never a "0"
ok(/const vn = ev\.type === 'hit' \? fightSafe\(\(\)=> ui32VenomOnly\(ev\)/.test(app) && /if\(vn > 0\)\{[^}]*TX\('ui\.en7-float-poison', \{n: vn\}\)[\s\S]{0,120}\n\s*else flashDmg\(/.test(app), 'the hit handler floats ☠N instead of the damage number when ui32VenomOnly > 0');
{ const fn = new Function('matchState', 'getCardDefs', app.match(/function ui32VenomOnly\(ev\)\{[\s\S]*?\n\}/)[0] + '; return ui32VenomOnly;');
  const defs = {jelly: {effects: {poison: 4}}, plain: {effects: {}}, tgt: {archetypes: []}, wall: {archetypes: ['Structure']}};
  const m = {replayCards: {1: {hp: 5, defId: 'tgt'}, 2: {hp: 5, defId: 'wall'}, 3: {hp: 0, defId: 'tgt'}}}, f = fn(m, ()=> defs);
  const hit = o=> Object.assign({type: 'hit', attDefId: 'jelly', targetUid: 1, dmg: 0}, o);
  ok(f(hit({elementalConvert: 'poison', elementalAmount: 1})) === 5, '1 stack from the swing + 4 of Venomous = ☠5');
  ok(f(hit({})) === 0 && f(hit({armorBlocked: true, elementalAmount: 1})) === 0 && f(hit({dmg: 2, elementalAmount: 1})) === 0, 'no venom float without a Venom landing, when blocked, or when the hit does damage');
  ok(f(hit({targetUid: 2, elementalConvert: 'poison', elementalAmount: 1})) === 1 - 1 + 0 || f(hit({targetUid: 2, elementalConvert: 'poison', elementalAmount: 1})) === 0, 'a Structure takes none');
  ok(f(hit({targetUid: 3, elementalConvert: 'poison', elementalAmount: 1})) === 0, 'a unit that died takes none'); }

// 4 hover counters
ok(/try\{ ui32CounterRows\(c\)\.forEach\(r=> rows\.push\(r\)\); \}catch\(e\)\{\}/.test(app), 'liveStatusGlossHTML adds the counter rows');
['water', 'burn', 'ffCounters', 'creativity', 'prayerTokens', 'inspTokens', 'dauntN', 'brittle', 'sk2Berries', 'sk2Scavenge', 'sk2Salvage', 'sk1Atk', 'thornsBonus'].forEach(f=> ok(app.match(/function ui32CounterRows[\s\S]*?\n\}/)[0].includes(f), `the hover lists ${f}`));

// 5 the marker (pure), on a fake CARD_POWER; and the baked fingerprint
ok(/_cp\["fp"\] = _fp/.test(asm) && /_fp\[_id\] = \[_r\.get\("attack"\), _r\.get\("health"\), _fx, _lv/.test(asm), 'assemble_arena.py bakes CARD_POWER.fp (measured attack, health, skill values, level)');
{ const src = ['ui32DefAtLevel', 'ui32FxMap', 'ui32SkillText', 'ui32PowerChange'].map(n=> app.match(new RegExp('function ' + n + '\\([\\s\\S]*?\\n\\}'))[0]).join('\n');
  const mk = (fp)=> new Function('CARD_POWER', 'TX', 'skillDefOf', src + '; return ui32PowerChange;')({fp: {c: fp}}, (k, v)=> k === 'ui.ui32-edited' ? `was ${v.was}, now ${v.now}` : k === 'ui.ui32-no-skills' ? 'none' : 'trig', k=> ({label: k}));
  const card = (a, h, fx, o)=> Object.assign({id: 'c', attack: a, health: h, effects: fx || {}, rarity: 'common'}, o);
  const mark = (fp, c)=> { const r = mk(fp)(c); return r ? r.mark : ''; };
  const fp = [3, 6, {flying: true}, 1, 0];
  ok(mark(fp, card(3, 6, {flying: true})) === '', 'unedited: no marker');
  ok(mark(fp, card(4, 6, {flying: true})) === '^', '+1 Attack: ^');
  ok(mark(fp, card(3, 8, {flying: true})) === '^' && mark(fp, card(3, 7, {flying: true})) === '^', '+1 / +2 Health: ^');
  ok(mark(fp, card(3, 9, {flying: true})) === '^^' && mark(fp, card(5, 6, {flying: true})) === '^^', '+3 Health or +2 Attack: ^^');
  ok(mark(fp, card(4, 7, {flying: true})) === '^^', '+1 Attack and +1 Health together: ^^ (not "exactly +1 Attack")');
  ok(mark(fp, card(3, 6, {flying: true, armor: 1})) === '^^', 'a skill added: ^^');
  ok(mark([3, 6, {poison: 2}, 1, 0], card(3, 6, {poison: 3})) === '^^', 'a skill raised: ^^');
  ok(mark(fp, card(2, 6, {flying: true})) === 'v' && mark(fp, card(3, 4, {flying: true})) === 'v', '-1 Attack, -2 Health: v');
  ok(mark(fp, card(3, 2, {flying: true})) === 'vv' && mark(fp, card(3, 6, {})) === 'vv', 'bigger drop, a skill removed: vv');
  ok(mark(fp, card(5, 3, {flying: true})) === '~', 'up and down: ~');
  ok(mark([3, 6, {}, 1, 0], card(3, 5, {}, {rarity: 'starter'})) === '' && mark([3, 6, {}, 1, 0], card(3, 5, {}, {rarity: 'starter'})) === '', 'a Level 0 starter measured at Level 1 (+10%, 5 -> 6 health? no: 5*1.1 rounds to 6) is unedited');
  ok(mark([3, 5, {}, 0, 0], card(3, 5, {}, {rarity: 'starter'})) === '', 'a Faction-Starter row (measuredAt 0) is read as printed');
  ok(mark(fp, {id: 'zz', attack: 9, health: 9}) === '', 'a card with no baked row: no marker');
  const tip = mk(fp)(card(4, 6, {flying: true})).tip; ok(/was 3\/6 flying, now 4\/6 flying/.test(tip), 'the tooltip says what it was and what it is now'); }
ok(/\$\{ui32PowerMarkHTML\(d\)\} · \$\{escapeHtml\(advTxt\)\}/.test(app) && /ui32PowerMarkHTML\(b0\)/.test(app), 'the editor badge and the Map cards tile badge both carry the marker');

// 6 the tile refresh: saved cards count, not only those walked to with Previous / Next
ok(/ceSavedIds\.add\(c\.id\)/.test(app) && /\.\.\.ceSavedIds\]\)/.test(app) && /const seen = \[\.\.\.new Set\(\[id, \.\.\.\(nav \? \[\.\.\.nav\.visited\] : \[\]\), \.\.\.ceSavedIds\]\)\]/.test(app), 'the Map cards window redraws the tile of the card it opened and of every card saved');

// 7 the skills section in three groups
{ const f = app.match(/function ui19McSkillsHTML[\s\S]*?\n\}\n/)[0];
  ok(/otherIds/.test(f) && /hd\('main'/.test(f) && /hd\('other'/.test(f) && /hd\('rec'/.test(f), 'ui19McSkillsHTML: three groups with a heading each');
  ok(/isNew: isMain && mt\.met/.test(f), 'NEW! only on the main group');
  ok(/\$\{sp\(r\.key\)\}(<small>|<\/span><\/li>)/.test(f) /* ENG35 (2026-11-07): the tile is one line, the text moved to the hover window */, 'the Sugg. Intro pill stays on every group (outside-main skills always carry it; main ones too, UI30: every main map shows one)');
  ok(/!mainKeys\.has\(r\.key\)/.test(f), 'a skill already in the main group is not listed again under Other'); }
ok(/function ui32McSkillIds\(top, mapId, ok\)/.test(app) && /ui32McRefreshSkills\(ov\)/.test(app) && (app.match(/ui32McRefreshSkills\(ov\)/g) || []).length >= 4, 'the section is redrawn after a Cut / Keep toggle, a SPECIAL add / remove and an editor save');

// 8 the medium / low rain: sparse random streaks, no tiled stripes
{ const tpl = read('arena_template.html'), rule = (tpl.match(/\.battlefield\.is-raining:not\(\.has-shader\)::after\{[^}]*\}/) || [''])[0];
  ok(!/repeating-linear-gradient/.test(rule) && (rule.match(/radial-gradient\(ellipse/g) || []).length >= 12, 'the fallback rain is single streaks (radial gradients), not repeating lines');
  const sizes = (rule.match(/background-size:([^;]*);/) || ['', ''])[1].split(',').map(x=> x.trim()); ok(new Set(sizes).size >= 3, 'three layers with different tile sizes, so the repeats never line up');
  ok(/opacity:\.3;/.test(rule) && /transform:skewX\(/.test(rule) && /animation:rainFall 1\.3s linear infinite/.test(rule), 'low opacity, leaned, CSS animation only (no script)');
  ok(/html\[data-fx="high"\] \.board-card \.rain-drops/.test(tpl), 'high quality keeps its own rain'); }

console.log(`ui32: ${checks - fail}/${checks} checks passed`); process.exit(fail ? 1 : 0);
