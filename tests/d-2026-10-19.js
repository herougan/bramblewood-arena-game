#!/usr/bin/env node
// 2026-10-18 (package D, the owner's 19:54 and 20:01 requests). Covers:
//   1. Cast Darkness: a castDarkness unit brings Darkness (level 1) while it stands on the board, on either side; the dark lifts when
//      it dies ('darkCast' on / off events); a fight already dark of its own (Darkness, Pitch Black) keeps its own level; misses
//      come out near 1 in 4 for a dark-blind unit; Darksight and True Strike units don't miss; the CPU weighs it (aiDarkCastWorth).
//   2. The Pall Wraith (canonical/cards.json): Cast Darkness + Darksight, in the 20-A-2 Wraith Vents deck and its card reward,
//      inside budget v3 with the new skill cost.
//   3. True Strike: never misses (Absolute darkness, Blind, Evasive / Swift / Flying), can't be Blinded, still can't hit Invisible;
//      the White Dragon has it.
//   4. Sleep N stacks up to N+1 (the owner's example: Sleep 2 on a unit asleep for 2 makes 3, and caps there); a deeper sleep stays.
//   5. The look: Blind shows the eye VFX and the 🕶️ pill; the field's Darkness shows the eye and a "misses 1/4" line on the unit's
//      card detail; the Darkness card says "Dark-blind creatures miss 1/4 the time."
//   6. Terse descriptions: no player-facing short description reaches 20 words (numbers count as words): every card's lines,
//      every skill's line at its default, the status and keyword glosses, the live status lines and every Environment card's face
//      and detail. Prayer / Ecclesia lines are another package's (they are listed, not failed).
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const H = require('./lib/harness.js');
const E = H.Engine;
const ROOT = path.join(__dirname, '..');
const {TEXT, TX} = require(path.join(ROOT, 'bramblewood-texts.js'));
const src = fs.readFileSync(path.join(ROOT, 'arena_app.js'), 'utf8');
let fail = 0, n = 0; const ok = (c, m)=>{ n++; if(!c){ fail++; console.log('  ✗', m); } };
const so = id=> id === 1 ? 'A' : 'B';
const base = H.loadCardDefs();
const U = (id, effects, o)=> Object.assign({id, name:id, attack:3, health:100000, wait:0, cost:0, effects: effects || {}}, o || {});
const defs = Object.assign({}, base, {
  'dk-caster': U('dk-caster', {castDarkness:true, darksight:true}, {attack:0}),
  'dk-frail': U('dk-frail', {castDarkness:true, darksight:true}, {attack:0, health:1}),
  'dk-swing': U('dk-swing', {}, {attack:1}),
  'dk-eye': U('dk-eye', {darksight:true}, {attack:1}),
  'dk-true': U('dk-true', {trueStrike:true}, {attack:1}),
  'dk-killer': U('dk-killer', {}, {attack:50}),
  'dk-wall': U('dk-wall', {}, {attack:0}),
  'dk-dodger': U('dk-dodger', {evasive:true, swift:true, flying:true}, {attack:0}),
  'dk-blinder': U('dk-blinder', {blind:{chance:100, duration:2}}, {attack:1}),
  'sl-sleeper': U('sl-sleeper', {sleep:{chance:100, duration:2}}, {attack:1}),
  'sl-target': U('sl-target', {}, {attack:0}),
});
function mk(rules, seed){
  const engine = E.makeSimEngine(defs, E.mulberry32(seed || 7), {recordEvents:true, rules: rules || {}});
  return {engine, P: {1: engine.newPlayer(1, {}), 2: engine.newPlayer(2, {})}};
}
const liveOf = pl=> [...pl.row.left, ...pl.row.center, ...pl.row.right].filter(c=> c && !c.gap);
function spawn(k, pid, id){ const ev = []; ok(k.engine.debugSpawnCard(k.P, so, pid, id, 'left', {}, ev), `spawn ${id}`); return {ev, card: liveOf(k.P[pid]).find(c=> c.defId === id)}; }
function round(k, first){ const ev = []; k.engine.resolveCombat(k.P, so, {}, ev, first || 1); return ev; }

// ---- 1. Cast Darkness
{ const k = mk({});
  ok(!k.engine.darkCastNow(k.P) && !k.engine.darkRule(k.P), 'no darkness before the caster');
  const sw = spawn(k, 1, 'dk-swing').card;
  ok(k.engine.darkMissOf(sw, 1, k.P) === 0, 'a plain unit sees in a lit fight');
  const c = spawn(k, 2, 'dk-caster');
  ok(c.ev.some(e=> e.type === 'darkCast' && e.on === true && e.defId === 'dk-caster'), 'On Play: a darkCast on event');
  ok(k.engine.darkCastNow(k.P) && k.engine.darkRule(k.P) === 'dark', 'the caster brings Darkness (level 1)');
  ok(k.engine.darkMissOf(sw, 1, k.P) === 0.25, 'a dark-blind unit misses 1 in 4');
  ok(k.engine.darkMissOf(c.card, 2, k.P) === 0, 'the caster has Darksight');
  const tr = spawn(k, 1, 'dk-true').card; ok(k.engine.darkMissOf(tr, 1, k.P) === 0, 'a True Strike unit never misses for the dark');
  // the miss rate, over many swings of the plain unit at the caster
  let swings = 0, miss = 0;
  for(let r = 0; r < 240; r++){ const ev = round(k, r % 2 ? 1 : 2);
    ev.forEach(e=>{ if(e.attUid !== sw.uid) return; if(e.type === 'blindMiss'){ swings++; if(e.night) miss++; } else if(e.type === 'hit' || e.type === 'evaded') swings++; }); }
  ok(swings >= 200 && miss / swings > 0.17 && miss / swings < 0.33, `about 1 in 4 swings miss in the cast dark (${miss}/${swings})`);
}
{ const k = mk({}, 11);
  spawn(k, 2, 'dk-frail'); spawn(k, 1, 'dk-killer');
  ok(k.engine.darkCastNow(k.P), 'the frail caster casts');
  let ev = []; for(let r = 0; r < 4 && liveOf(k.P[2]).length; r++) ev = ev.concat(round(k, 1));
  ok(!liveOf(k.P[2]).some(c=> c.defId === 'dk-frail' && c.hp > 0), 'the frail caster dies');
  ok(!k.engine.darkCastNow(k.P) && !k.engine.darkRule(k.P), 'its Darkness is gone when it dies');
  ok(ev.some(e=> e.type === 'darkCast' && e.on === false), 'a darkCast off event when the dark lifts');
}
for(const lvl of ['dark', 'pitch']){ const k = mk({dark: lvl}, 13);
  const sw = spawn(k, 1, 'dk-swing').card, c = spawn(k, 2, 'dk-frail');
  ok(!c.ev.some(e=> e.type === 'darkCast'), `${lvl}: no cast event on a map dark already`);
  ok(k.engine.darkRule(k.P) === lvl && !k.engine.darkCastNow(k.P), `${lvl}: the map's own level stands (no second level)`);
  ok(k.engine.darkMissOf(sw, 1, k.P) === (lvl === 'pitch' ? 0.5 : 0.25), `${lvl}: the miss share is the map's`);
  spawn(k, 1, 'dk-killer'); for(let r = 0; r < 4; r++) round(k, 1);
  ok(!liveOf(k.P[2]).some(x=> x.defId === 'dk-frail' && x.hp > 0) && k.engine.darkRule(k.P) === lvl, `${lvl}: the environment's darkness stays after the caster dies`);
}
// the CPU's view: worth more when your side would miss and its own wouldn't
{ const k = mk({}); spawn(k, 1, 'dk-swing'); spawn(k, 1, 'dk-killer'); spawn(k, 2, 'dk-eye');
  ok(k.engine.aiDarkCastWorth(k.P, 2, 'dk-caster') > 0, 'the CPU (player 2) values the dark when your units are dark-blind');
  ok(k.engine.aiDarkCastWorth(k.P, 1, 'dk-caster') < 0, 'and not when its own units would miss');
  const kd = mk({dark:'dark'}); ok(kd.engine.aiDarkCastWorth(kd.P, 2, 'dk-caster') === 0, 'worth nothing in a fight dark already'); }
ok(/v \+= aiDarkCastWorth\(players, aiId, id\);/.test(fs.readFileSync(path.join(ROOT, 'bramblewood-engine.js'), 'utf8')), 'the CPU card choice adds aiDarkCastWorth');

// ---- 2. the Pall Wraith
const cards = JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical', 'cards.json'), 'utf8'));
const pw = cards.find(c=> c.id === 'pall-wraith');
ok(!!pw && pw.effects.castDarkness === true && pw.effects.darksight === true && !pw.test, 'the Pall Wraith: Cast Darkness + Darksight');
// 2026-10-21 (package RP, owner: "submaps get 1 unique card each"): the Wraith Vents keep only their boss card, so the Pall Wraith moved to 20-5
ok(pw && pw.source && pw.source.kind === 'map' && pw.source.id === 'm11' && pw.source.node === '20-5', 'its card reward: 20-5 (moved off the Wraith Vents by package RP)');
ok(/name:"The Wraith Vents", icon:"👻"/.test(src), 'the Wraith Vents side map is still there (its Pall Wraith reward moved to 20-5, package RP)');
ok(cards.filter(c=> c.numericId === (pw && pw.numericId)).length === 1, 'its numericId is unique');
{ // budget v3 (SB_V3_DEFAULTS + SB_DEFAULT_SKILLS, as the Test Lab reads them)
  const line = src.match(/^const SB_DEFAULT_SKILLS = (\{[^\n]*\});/m), costs = line ? new Function('return ' + line[1].replace(/\/\*[\s\S]*?\*\//g, ''))() : {};
  ok(costs.castDarkness === 2 && costs.trueStrike === 2, 'skill costs: Cast Darkness 2, True Strike 2');
  const sc = JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical', 'skill-costs.json'), 'utf8')), flat = JSON.stringify(sc);
  // 2026-10-19 (package TC): Cast Darkness now carries its applied measured worth (prevValue 2); True Strike stays the owner's 2
  const scE = id=> sc.skills.find(x=> x.id === id) || {}, cd = scE('castDarkness'), ts = scE('trueStrike');
  // 2026-10-31 (package BUDGET2): True Strike was re-priced by the owner on 10-21 (1.5, "relative skill, shifted x0.78"; prevValue 2), so the
  // check takes the table's convention for both: the package-D price, or an applied price that keeps it as prevValue
  const priced2 = e=> e.scale === 'fixed' && (e.value === 2 || (!!e.appliedAt && e.prevValue === 2 && typeof e.value === 'number'));
  ok(priced2(cd) && priced2(ts),
    `canonical/skill-costs.json (the balance tools and the hub): Cast Darkness 2 or its applied price (${cd.value}), True Strike 2 or its applied price (${ts.value})`);
  const rank = {starter:0, common:1, uncommon:2, rare:3, veryrare:4, superrare:5, epic:6, heroic:7, unique:8, legendary:9};
  const N = (d, L)=> require(require('path').join(__dirname, '..', 'bramblewood-budget.js')).nOf(d, L); // 2026-10-19 (package BF): budget v4, the shared helper
  const S = d=> Object.keys(d.effects).reduce((t, k)=> t + (typeof costs[k] === 'number' ? costs[k] : 1), 0);
  // 2026-10-31 (package BUDGET2, owner RECOST1-6): today's budget, the one the game and the hub use (tools/skill_costs.js: 3A + H, N x 1.13, cap 2),
  // at Level 1 (was a hand copy of budget v3, 2A+H+S < Base + 2L with S from the 10-18 table, which the BF / BF6 N no longer matched)
  const SCb = require(require('path').join(__dirname, '..', 'tools', 'skill_costs.js')).make(sc), bP = SCb.budget(pw, {level: 1});
  // a card on no map list is out of play: the budget checks skip it as 'unplaced' (LISTFIX1's rule, tools/lib_map_pools.js budgetHold); the Pall
  // Wraith is (its reward moved off the Wraith Vents, check 1), so it is reported, not failed
  const hold = require(require('path').join(__dirname, '..', 'tools', 'lib_map_pools.js')).budgetHold(pw.id);
  ok(bP.ok || hold === 'unplaced', `the Pall Wraith fits today's budget at Level 1 or is out of play (cap 1 (3A+H)×m+S ${bP.x1} <= N ${bP.N}, cap 2 ${bP.x2} <= ${bP.N2}${hold ? '; ' + hold : ''})`);
}
ok(/\{key:'castDarkness', category:'passive', label:'Cast Darkness'/.test(src) && /\{key:'trueStrike', category:'passive', label:'True Strike'/.test(src), 'both skills are in the skill list (keywords, Codex, editor)');

// ---- 3. True Strike
{ const wd = cards.find(c=> c.id === 'white-dragon'); ok(wd && wd.effects.trueStrike === true && ((wd.attack === 10 && wd.health === 44) || /2026-10-19 retune \((v5 L\/10|server override folded)\): was 10\/44 /.test(wd.creatorNote || '')), 'the White Dragon has True Strike (stats unchanged, or the 10-19 retune from 10/44; BF4: the server\'s Divine 10/44 folded)'); }
{ const k = mk({dark:'absolute'}, 17), t = spawn(k, 1, 'dk-true').card; spawn(k, 2, 'dk-dodger');
  t.blind = 3; let miss = 0, hits = 0;
  for(let r = 0; r < 60; r++) round(k, r % 2 ? 1 : 2).forEach(e=>{ if(e.attUid !== t.uid) return; if(e.type === 'blindMiss' || e.type === 'evaded') miss++; if(e.type === 'hit') hits++; });
  ok(hits >= 55 && miss === 0, `True Strike: no miss in Absolute darkness, Blind, at an Evasive Swift Flyer (${hits} hits, ${miss} misses)`);
  const d = liveOf(k.P[2])[0]; d.invisible = 5; const ev = round(k, 1);
  ok(ev.some(e=> e.attUid === t.uid && e.type === 'evaded' && e.reason === 'invisible') && !ev.some(e=> e.attUid === t.uid && e.type === 'hit'), 'it still can\'t hit an Invisible unit');
}
{ const k = mk({}, 19); spawn(k, 1, 'dk-blinder'); const t = spawn(k, 2, 'dk-true').card;
  for(let r = 0; r < 4; r++) round(k, 1); ok(!(t.blind > 0), 'a True Strike unit is never Blinded (it would do nothing)'); }

// ---- 4. Sleep N stacks up to N+1
{ const k = mk({}, 23); spawn(k, 1, 'sl-sleeper'); const t = spawn(k, 2, 'sl-target').card;
  round(k, 1); ok(t.asleep === 2, `Sleep 2 on an awake unit: 2 (got ${t.asleep})`);
  t._asleepJustSet = false; t.asleep = 2; round(k, 1); ok(t.asleep === 3, `Sleep 2 on a unit asleep for 2: 3 (got ${t.asleep})`);
  t._asleepJustSet = false; round(k, 1); ok(t.asleep === 3, `and it caps at 3 (got ${t.asleep})`);
  t._asleepJustSet = false; t.asleep = 5; round(k, 1); ok(t.asleep === 5, `a deeper sleep (5) isn't cut short (got ${t.asleep})`);
}
ok(TX('ui.sk-sleep-chance', {c: 50, n: 2, s: 's', m: 3}) === 'Its hits have a 50% chance to put the target to Sleep for 2 rounds, stacking to 3.', 'the Sleep line says it stacks to N+1');
ok(/Sleep N stacks up to N\+1/.test(TEXT['ui.st-sleep']), 'the Asleep gloss says so');
ok(/left: kind === 'sleep' \? defCard\.asleep : undefined/.test(fs.readFileSync(path.join(ROOT, 'bramblewood-engine.js'), 'utf8')) && /rc\.asleep = ev\.left != null \? ev\.left/.test(src), 'the board shows the capped stack (statusFx left)');

// ---- 5. the look
ok((src.match(/<span class="abadge blind" title="\$\{escapeAttr\(TX\('ui\.blind-pill', \{n: c\.blind\}\)\)\}">\$\{iconHTML\('blind-now', '🕶️'\)\}\$\{c\.blind\}<\/span>/g) || []).length === 2, 'Blind: the 🕶️ pill, fresh render and live patch'); // 2026-10-30 (package UI5, W12): the pill's glyph goes through iconHTML('blind-now', '🕶️') (one icon key for every Blind chip); still the spectacles
ok(!/abadge blind">👁/.test(src), 'no 👁 pill for Blind any more');
const fxb = fs.readFileSync(path.join(ROOT, 'bramblewood-fx-b.js'), 'utf8'), tpl = fs.readFileSync(path.join(ROOT, 'arena_template.html'), 'utf8');
ok(/c\.classList\.contains\('is-blind'\)[^\n]*k = 'blind'/.test(fxb), 'Blind: the eye VFX hook (FX B sightSync, kind blind)');
ok(/rules\.dark\)[^\n]*'dark'/.test(fxb) && /typeof matchFieldRules === 'function' \? matchFieldRules\(m\)/.test(fxb), 'the field Darkness: the eye VFX from the fight\'s rules');
ok(/function matchFieldRules\(m\)\{ const r = matchFieldRulesBase\(m\);[\s\S]{0,200}darkCastNow\(m\.players\)/.test(src), 'a Cast Darkness unit\'s dark reaches the board (matchFieldRules)');
ok(/\.board-card\.fxb-why-blind \.blind-overlay\{display:none;\}/.test(tpl), 'one eye on a Blind unit when FX B draws it');
ok(/\{ const dl = darkMissLine\(liveCard\); if\(dl\) lines\.push\(dl\); \}/.test(src) && /TX\('ui\.dark-miss-share', \{share:/.test(src), 'a dark-blind unit\'s card detail says it misses');
ok(TX('ui.dark-miss-share', {share: '1/4'}) === '🌘 Darkness: it misses 1/4 the time.', 'the line: misses 1/4 the time');
ok(TEXT['ui.field-dark'] === 'Dark-blind creatures miss 1/4 the time.' && /const DARK_LEVEL_TEXT = \{dark:TX\('ui\.field-dark'\)/.test(src), 'the Darkness card says the owner\'s line');
ok(/add\('dark', '🌘', DARK_LEVEL_NAME\.dark, DARK_LEVEL_TEXT\.dark \+ darkCast, '', DARK_LEVEL_TEXT\.dark, DARK_CODEX_TEXT\)/.test(src), 'its face and detail; Illuminate is in the Codex line');

// ---- 6. terse descriptions (fewer than 20 words, numbers counting)
const words = s=> String(s).replace(/<[^>]*>/g, ' ').replace(/&[a-z]+;|&#\d+;/g, ' ').split(/\s+/).filter(w=> /[\p{L}\p{N}]/u.test(w)).length;
const body = l=>{ const t = String(l).replace(/<[^>]*>/g, ''); const i = t.indexOf(' — '); return i >= 0 && words(t.slice(0, i)) <= 6 ? t.slice(i + 3) : t; }; // "🐾 Pounce 2 — …": the label isn't the description
const SKIP = /Prayer|Ecclesia/; // another package is reworking Prayer / Ecclesia (2026-10-18)
const L = src.split('\n');
const lineOf = (re, from)=> L.findIndex((l, i)=> i >= (from || 0) && re.test(l));
const stub = new Proxy(function(){ return ''; }, {get:(t, k)=> k === Symbol.toPrimitive ? ()=> '' : stub, apply:()=> ''});
const cardDefs = {}; cards.forEach(c=>{ const d = Object.assign({effects:{}}, c); delete d.art; cardDefs[c.id] = d; });
const g0 = {TX, console, Math, JSON, Object, Array, String, Number, Set, Map, RegExp, Date, Symbol, Boolean, Error, parseInt, parseFloat, isNaN, Infinity, NaN, undefined,
  getCardDefs: ()=> cardDefs, escapeHtml: s=> String(s), escapeAttr: s=> String(s), adminModeEnabled: false, EXILE_ZONE_NAME: 'Removal Zone'};
// 2026-10-21 (package TX merge): the real type hierarchy, not the catch-all stub (the stub made TAXO.ancestors() return '' and every description throw)
g0.BramblewoodTaxonomy = require(path.join(ROOT, 'bramblewood-taxonomy.js'));
const constLine = nm=> (L.find(l=> l.startsWith('const ' + nm + ' = ')) || '');
const ctx = vm.createContext(new Proxy(g0, {has: ()=> true, get: (t, k)=> k in t ? t[k] : (typeof k === 'string' && /^[A-Z_]+$/.test(k) ? {} : stub), set: (t, k, v)=>{ t[k] = v; return true; }}));
const fnSrc = nm=>{ const a = src.indexOf('\nfunction ' + nm + '('); if(a < 0) return ''; let i = src.indexOf('{', a), d = 0; for(; i < src.length; i++){ const ch = src[i]; if(ch === '{') d++; else if(ch === '}'){ d--; if(!d) break; } } return src.slice(a + 1, i + 1); };
const a1 = lineOf(/^const SKILL_ICON = /), b1 = lineOf(/^function cardName\(/, a1);
const a2 = lineOf(/^const LIVE_STATUS_ROWS = \[/), b2 = lineOf(/^\];/, a2);
const a3 = lineOf(/^const SCORCHED_NAME = /), b3 = lineOf(/^function simulateSkirmishVsDeckSeeded\(/, a3);
let code = L.slice(a1, b1).join('\n').replace(/\/\* ---- Skill reveal[\s\S]*?\[SKILL_REVEAL_END\] \*\//, 'function maskHiddenSkills(d){ return d; } function hiddenSkillsOf(){ return []; } function skillHiddenNow(){ return false; }')
  + '\n' + L.slice(a2, b2 + 1).join('\n') + '\n' + L.slice(a3, b3).join('\n') + '\n' + ['triggerPreviewText', 'eggKindLabel', 'bountyN', 'exposedTip'].map(fnSrc).join('\n') + '\n' + ['TRIGGER_ALWAYS_ON', 'EGG_HATCH_LABEL'].map(constLine).join('\n')
  + '\n;this.__X = {SKILL_DEFS, skillText, STATUS_KEYWORDS, KEYWORD_TERMS, describeEffects, LIVE_STATUS_ROWS, fieldConditionRows, FIELD2, exposedTip};';
let X = null; try{ vm.runInContext(code, ctx); X = ctx.__X; }catch(e){ ok(false, 'the description tables load in a sandbox: ' + e.message); }
const long = [], skipped = new Set();
const check = (where, text)=>{ if(text == null || text === '') return; const t = String(text); if(words(t) < 20) return; if(SKIP.test(t)){ skipped.add(t.slice(0, 60)); return; } long.push(`${where} (${words(t)}): ${t.replace(/<[^>]*>/g, '').slice(0, 140)}`); };
if(X){
  let cardLines = 0;
  cards.filter(c=> !c.test).forEach(c=>{ let lines = []; try{ lines = X.describeEffects(cardDefs[c.id]) || []; }catch(e){ lines = []; long.push(`${c.id}: describeEffects threw ${e.message}`); }
    lines.forEach(l=>{ cardLines++; check(c.id, body(l)); }); });
  ok(cardLines > 1500, `every card's lines were read (${cardLines})`);
  X.SKILL_DEFS.forEach(p=>{ if(p.retired || p.hidden || p.reserved) return;
    const v = p.kind === 'number' ? (p.defaultValue || 2) : p.kind === 'twoNumber' ? [50, 2] : p.kind === 'types' ? ['Undead'] : p.kind === 'select' ? ((p.selectOptions && p.selectOptions()[0]) || {}).value : true;
    let t = ''; try{ t = X.skillText(p, v, {}); }catch(e){ t = ''; } check('skill ' + p.key, t); });
  X.STATUS_KEYWORDS.forEach(k=> check('status ' + k.name, k.name + ': ' + k.text));
  X.KEYWORD_TERMS.forEach(k=>{ if(k.text) check('term ' + k.name, k.name + ': ' + k.text); });
  X.LIVE_STATUS_ROWS.forEach(([f, k, name, text, showN])=>{ let t = ''; try{ t = text(3, {witherLeft: 2}); }catch(e){ t = ''; } check('live ' + f, `${name}${showN ? ' 3' : ''}: ${t}`); });
  check('exposed tip', X.exposedTip(3));
  const F2 = Object.keys(X.FIELD2), all = Object.fromEntries(F2.map(k=> [k, true]));
  const RULES = [Object.assign({}, all, {dark:'dark', darkCast:true, wind:'windy', cloudy:true, misty:true, phase:'night', twilight:true, swampFever:true, freezing:true, sandstorm:true, highTide:true, tideSpout:true, frostCount:2, frostbite:1, frostResist:['Bird', 'Fish'], eruption:2}),
    {dark:'pitch', wind:'gale', volcano:'even', ashyAfterEruption:true, phase:'cycle', phaseDay:4, phaseNight:2, bossSurge:{atk:2, hp:2}, enemyOre:true, crushingDepths:2, hail:5},
    {dark:'absolute', permaTide:true, rapids:true, tide:true}, {permaTide:true}];
  let rows = 0; RULES.forEach((r, i)=>{ let rs = []; try{ rs = X.fieldConditionRows(r); }catch(e){ long.push(`fieldConditionRows #${i} threw ${e.message}`); }
    rs.forEach(row=>{ rows++; check(`field ${row.key} (detail)`, row.text); check(`field ${row.key} (card face)`, row.short); }); });
  ok(rows >= 40, `the Environment cards were read (${rows} rows)`);
}
ok(!long.length, `no short description reaches 20 words (${long.length}):\n      ` + long.slice(0, 30).join('\n      '));
if(skipped.size) console.log(`  (left for the Prayer / Ecclesia package: ${skipped.size} line${skipped.size === 1 ? '' : 's'}: ${[...skipped].join(' | ')})`);

console.log(`d-2026-10-19: ${n - fail}/${n} checks passed`);
process.exit(fail ? 1 : 0);
