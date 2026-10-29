#!/usr/bin/env node
// 2026-10-29 (package SKL0). The owner's notes: 10-28 23:35 (L2) "Carry over Crossed-Eyes and Bee Knight and Cottontail (with their skills
// unlocked - all should be locked in T1/T2 except flying)" and 10-29 13:07 "Regarding T1-T2, all skills to be "?" until Map 0. But we can also
// make the lvl 0 <-> lvl 1 skills trick".
// Covers, on the real arena_app.js code: in a T-1 / T-2 fight (matchState.mode 'tutorial') every skill but Flying reads "?" (maskHiddenSkills,
// skillHiddenNow, the battle log's tut12LogMask), the same card in a Map 0 fight shows its skills, Admin Mode is unaffected; Bee Knight's
// Swarm arrives at Level 1 (canonical/cards.json levelSkills), so its T-1 / T-2 Level 0 copy (tutorialLevel0Def) has Flying only and Level 1
// has both; both stay within bramblewood-budget.js at Level 0 and Level 1. The browser side: docs/screens/skl0/ (a T-1 fight at 390 and 1366).
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const ROOT = path.join(__dirname, '..');
const app = fs.readFileSync(path.join(ROOT, 'arena_app.js'), 'utf8');
let fail = 0, n = 0; const ok = (c, m)=>{ n++; if(!c){ fail++; console.log('  ✗', m); } };
function fnSrc(name){ const a = app.indexOf('\nfunction ' + name + '('); if(a < 0) return ''; let i = app.indexOf('{', a), d = 0; for(; i < app.length; i++){ const ch = app[i]; if(ch === '{') d++; else if(ch === '}'){ d--; if(!d) break; } } return app.slice(a + 1, i + 1); }
const cards = JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical/cards.json'), 'utf8')), byId = Object.fromEntries(cards.map(c=> [c.id, c]));
const bee = byId['bee-knight'];

// ---- 1. the reveal: T-1 / T-2 vs Map 0 vs Admin
{ const a = app.indexOf('[SKILL_REVEAL_BEGIN]'), b = app.indexOf('/* [SKILL_REVEAL_END] */'); const blk = app.slice(app.lastIndexOf('/*', a), b);
  const store = {}; let completed = [];
  const MAPNUM = {m1: 0, mtut: 0, mf: 1};
  const c = {localStorage: {getItem: k=> (k in store ? store[k] : null), setItem: (k, v)=>{ store[k] = String(v); }}, loadConquestProgress: ()=> ({completed}), mapNumberOf: id=> (id in MAPNUM ? MAPNUM[id] : null),
    escapeAttr: s=> String(s), adminModeEnabled: false, matchState: null, SKILL_DEFS: [{key: 'swarm', label: 'Swarm'}, {key: 'flying', label: 'Flying'}, {key: 'thorns', label: 'Thorns'}],
    Date, JSON, Number, Object, Array, Set, String};
  vm.createContext(c);
  vm.runInContext(blk + '\n' + fnSrc('tut12LogMask') + '\n;this.R = {skillHiddenNow, maskHiddenSkills, hiddenSkillSet, noteMapEnteredForReveal, revealTut12, tut12LogMask, TUT12_SHOWN, reset: ()=>{ skillRevealMemo = null; }};', c);
  const V = c.R;
  const lark = {id: 'lark', effects: {diurnal: 1, diurnalHp: 1, flying: true}}, thorny = {id: 'thorny', effects: {thorns: 2, triggers: [{on: 'onPlay', do: 'draw'}]}}, plain = {id: 'plain', effects: {}};
  // T-1 / T-2 fight (both sides' cards go through the same maskHiddenSkills)
  c.matchState = {mode: 'tutorial', tutorialStage: 1}; V.reset();
  const mb = V.maskHiddenSkills(bee), ml = V.maskHiddenSkills(lark), mt = V.maskHiddenSkills(thorny);
  ok(V.revealTut12(), '1. a T-1 fight is the T-1 / T-2 reveal');
  ok(JSON.stringify(mb.effects) === '{"flying":true}' && mb._hiddenSkills === 1, `1. T-1: Bee Knight shows Flying and one "?" for Swarm (${JSON.stringify(mb.effects)}, ${mb._hiddenSkills})`);
  ok(JSON.stringify(ml.effects) === '{"flying":true}' && ml._hiddenSkills === 2, '1. T-1: Diurnal (a reveal-map skill the old tutorials showed) is "?" too');
  ok(JSON.stringify(mt.effects) === '{}' && mt._hiddenSkills === 2, '1. T-1: a number skill and a trigger read "?"');
  ok(V.maskHiddenSkills(plain) === plain && V.maskHiddenSkills({id: 'hb', effects: {flying: true}}).effects.flying === true, '1. T-1: a vanilla card and a Flying-only card are as they are');
  ok(V.skillHiddenNow('swarm') && V.skillHiddenNow('thorns') && V.skillHiddenNow('diurnal') && V.skillHiddenNow('anyNewSkill') && !V.skillHiddenNow('flying'), '1. T-1: skillHiddenNow says "?" for every skill but Flying (coach, codex book)');
  ok(V.hiddenSkillSet().has('swarm') && !V.hiddenSkillSet().has('flying'), '1. T-1: the hidden set (tile cache key) holds Swarm, not Flying');
  ok(V.tut12LogMask({cls: '', text: '🐝 Bee Knight calls its Swarm! Thorns cut it. It is Flying.'}).text === '🐝 Bee Knight calls its ?! ? cut it. It is Flying.', '1. T-1: the battle log names no skill but Flying');
  c.matchState = {mode: 'tutorial', tutorialStage: 2, over: true, winner: 1}; V.reset();
  ok(V.maskHiddenSkills(bee).effects.swarm === undefined, '1. T-2, its results screen too');
  // Map 0 (and T-3 to T-5: conquest fights)
  c.matchState = {mode: 'conquest'}; V.noteMapEnteredForReveal('m1'); V.reset();
  ok(!V.revealTut12() && V.maskHiddenSkills(bee) === bee && !V.skillHiddenNow('swarm'), '1. Map 0: the same Bee Knight shows Flying and Swarm');
  ok(V.skillHiddenNow('diurnal') && V.maskHiddenSkills(lark)._hiddenSkills === 1, '1. Map 0: the reveal map holds as before (Diurnal "?" until Map 1)');
  c.matchState = null; V.reset();
  ok(V.maskHiddenSkills(bee) === bee, '1. outside a fight (codex, collection): unchanged');
  // Admin Mode
  c.adminModeEnabled = true; c.matchState = {mode: 'tutorial', tutorialStage: 1}; V.reset();
  ok(!V.revealTut12() && V.maskHiddenSkills(bee) === bee && V.maskHiddenSkills(lark) === lark && !V.skillHiddenNow('swarm'), '1. Admin Mode: a T-1 fight shows every skill');
  c.adminModeEnabled = false; }
ok(/if\(ev && !ev\.__t12 && revealTut12\(\)\) return tut12LogMask\(logText\(/.test(fnSrc('logText')), '1. logText masks the line in T-1 / T-2');

// ---- 2. Bee Knight's levels
ok(bee && JSON.stringify(bee.effects) === '{"swarm":true,"flying":true}' && JSON.stringify(bee.levelSkills) === '{"1":{"swarm":true}}', '2. cards.json: Bee Knight as printed (Level 1) has Swarm + Flying; levelSkills: Swarm arrives at Level 1');
ok(cards.filter(c=> c.levelSkills).every(c=> Object.keys(c.levelSkills).every(k=> +k > 0)), '2. no levelSkills at Level 0');
const L = require(path.join(ROOT, 'tools', 'lib_bramble.js')), G = L.G;
{ const overlay = {}, defs = Object.assign({}, L.CARD_DEFS_BASELINE);
  const c = {getCardDefs: ()=> defs, copyBaseDef: id=> L.CARD_DEFS_BASELINE[id] || null, cardBaseLevel: G.cardBaseLevel, statsAtLevel: G.statsAtLevel, matchDefsOverlay: overlay, Number, Object};
  vm.createContext(c); vm.runInContext(fnSrc('tutorialLevel0Def') + '\n' + fnSrc('tutorialPlainDeck') + '\n;this.R = {tutorialLevel0Def, tutorialPlainDeck};', c);
  const z = c.R.tutorialLevel0Def('bee-knight');
  ok(G.cardBaseLevel(defs['bee-knight']) === 1, '2. Bee Knight\'s own level is 1 (PP3_LEVEL1_BASE)');
  ok(z && z.id === 'bee-knight~tut0' && z.derivedFrom === 'bee-knight' && z.level === 0 && JSON.stringify(z.effects) === '{"flying":true}', `2. its T-1 / T-2 copy is Level 0 with Flying only (${z && JSON.stringify(z.effects)})`);
  const lv1 = (()=>{ const fx = Object.assign({}, bee.effects); Object.keys(bee.levelSkills).map(Number).filter(k=> k <= 1).forEach(k=> Object.assign(fx, bee.levelSkills[k])); return fx; })();
  ok(lv1.swarm && lv1.flying, '2. at Level 1 (copyDefAt / referencePlayerDeck merge levelSkills <= L) it has Flying + Swarm');
  ok(['earthworm', 'pond-trout', 'silver-minnow', 'duckling', 'cottontail', 'crossed-eyes'].every(id=> c.R.tutorialLevel0Def(id) === null), '2. the other six T-1 / T-2 cards have no skills: dealt as they are (their level unchanged)');
  const deck = c.R.tutorialPlainDeck({'bee-knight': 2, duckling: 3}, 1);
  ok(deck['bee-knight~tut0'] === 2 && deck.duckling === 3 && !deck['bee-knight'] && overlay['bee-knight~tut0'], '2. the tutorial deck (either side) deals the Level 0 copy');
  ok(/rivalCounts = tutorialPlainDeck\(tutDecks\.rival, st\)/.test(app) && /deckCounts = tutorialPlainDeck\(tutDecks\.mine, st\)/.test(app), '2. both T-1 / T-2 decks go through it');
  // the budget at each level
  const SC = require(path.join(ROOT, 'tools', 'skill_costs.js')), T = SC.make(JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical/skill-costs.json'), 'utf8')));
  const s0 = G.statsAtLevel(bee, 0), s1 = G.statsAtLevel(bee, 1);
  const b0 = T.budget(Object.assign({}, bee, {attack: s0.attack, health: s0.health, effects: z.effects}), {level: 0}), b1 = T.budget(Object.assign({}, bee, {attack: s1.attack, health: s1.health, effects: lv1}), {level: 1});
  ok(b0.ok && b1.ok, `2. within budget: Level 0 ${s0.attack}/${s0.health} Flying (2A+H+S ${b0.x1} <= N ${b0.N}; cap 2 ${b0.x2} <= ${b0.N2}), Level 1 ${s1.attack}/${s1.health} Flying + Swarm (${b1.x1} <= ${b1.N}; ${b1.x2} <= ${b1.N2})`); }

console.log(`skl0-2026-10-29: ${n - fail}/${n} passed, ${fail} failure(s)`);
process.exit(fail ? 1 : 0);
