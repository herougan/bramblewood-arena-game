#!/usr/bin/env node
// 2026-11-18 (package ENG52). Two owner items:
// 1. (21:04) "If I indicate a skill as L1 but the card's base level is 1, it still doesn't show up in the budget calculations or the card preview."
//    A card at level L has its effects plus every levelSkills[k] for k <= L, at its base level too: getCardDefs (buildCardDefs), the editor's
//    preview, the reference fights (referenceFightSetup) and the tools (lib_bramble getCardDefs, eng52AtBaseLevel). TUT3 / ENG25 hold: a Level 0
//    copy has no Level 1 skill, no Hatchling / Regeneration. The budget prices Level 1 with its Level 0 / 1 skills (bramblewood-budget.js budgetDef,
//    tools/skill_costs.js budget, the editor's box); a Level 2+ skill counts only when it is in effects too (as before).
// 2. (21:06) "Remove Heal as a skill. Just leave Nursing ... The action will be called Nurse ... Nurse heals a random *hurt* ally, not lowest
//    current health." Nursing N and the Nurse N action (key 'heal') heal a random hurt ally (not itself; nothing when none is hurt); an old
//    healing / heal key reads as Nursing; Heal is off "+ Add Skill", Nursing is in it; the texts, the log line and the 12 packs.
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
const R = f=> fs.readFileSync(path.join(ROOT, f), 'utf8');
const H = require('./lib/harness.js'), E = H.Engine;
const BB = require(path.join(ROOT, 'bramblewood-budget.js'));
const SC = require(path.join(ROOT, 'tools', 'skill_costs.js'));
const SPL = require(path.join(ROOT, 'bramblewood-skillparams.js'));
const L = require(path.join(ROOT, 'tools', 'lib_bramble.js')), G = L.G;
let fail = 0, n = 0; const ok = (c, m)=>{ n++; if(!c){ fail++; console.log('  ✗', m); } };
const app = R('arena_app.js'), cards = JSON.parse(R('canonical/cards.json')), byId = Object.fromEntries(cards.map(c=> [c.id, c]));
function fnSrc(name){ const a = app.indexOf('\nfunction ' + name + '('); if(a < 0) return ''; let i = app.indexOf('{', a), d = 0; for(; i < app.length; i++){ const ch = app[i]; if(ch === '{') d++; else if(ch === '}'){ d--; if(!d) break; } } return app.slice(a + 1, i + 1); }
const A = new Function(['cardBaseLevel', 'effectsAtLevel', 'eng52AtBaseLevel'].map(fnSrc).join('\n') + '\nreturn {cardBaseLevel, effectsAtLevel, eng52AtBaseLevel};')();

// ---- 1a. the builders: a base Level 1 card has its levelSkills "1"; a Level 0 card has none (TUT3, ENG25)
const bee = byId['bee-knight'], chick = byId['sparrow-chick'], snap = byId['snapper-hatchling'];
ok(bee && A.cardBaseLevel(bee) === 1 && !(bee.effects || {}).flying && bee.levelSkills[1].flying, '1. fixture: the Bee Knight is base Level 1 with Flying in levelSkills "1" only');
const at = A.eng52AtBaseLevel({'bee-knight': bee, 'sparrow-chick': chick, 'snapper-hatchling': snap});
ok(at['bee-knight'].effects.flying && at['bee-knight'].effects.swarm && at['bee-knight'].effects.diurnal, `1. eng52AtBaseLevel: the Bee Knight at its base level has Flying, Swarm, Diurnal (${JSON.stringify(at['bee-knight'].effects)})`);
ok(A.cardBaseLevel(chick) === 0 && !at['sparrow-chick'].effects.flying && !at['sparrow-chick'].effects.bleed && !at['sparrow-chick'].effects.hatchling, '1. TUT3 / ENG25: the Sparrow Chick (base 0) has none of its Level 1 skills at Level 0');
ok(!at['snapper-hatchling'].effects.tide && A.effectsAtLevel(snap, 1).tide, '1. a Level 1 skill in effects AND levelSkills (the other shape) is off at Level 0, on at Level 1');
ok(/if\(lvl < 1 \|\| base\.levelSkills\) out\[id\] = Object\.assign\(\{\}, out\[id\] \|\| base, \{effects: effectsAtLevel\(base, lvl\)\}\)/.test(app), '1. getCardDefs (buildCardDefs): the base-level branch lays the level skills on (was Level 0 only)');
ok(/const defs = Object\.assign\(eng52AtBaseLevel\(base\), overlay\);/.test(app), '1. referenceFightSetup: base-level cards fight with their base-level skills');
ok(/effectsAtLevel\(d0, cardBaseLevel\(d0\)\)/.test(app) && /ceBudgetRefresh\(d0\)/.test(app), '1. the editor preview shows the card at its base level; the budget box gets the draft');
ok(/BramblewoodBudget\.budgetDef\(d\)/.test(fnSrc('ceBudgetRefresh')), '1. the editor budget box prices the Level 1 skills (budgetDef)');
ok(G.getCardDefs()['bee-knight'].effects.flying && !G.getCardDefs()['sparrow-chick'].effects.flying, '1. the tools (lib_bramble getCardDefs) build the same');
ok(H.loadCardDefs()['bee-knight'].effects.swarm, '1. the test harness fields a card with its Level 1 skills');

// ---- 1b. the budget: Level 1 with its Level 0 / 1 skills; Level 2+ as before (only when in effects)
const T = SC.make(JSON.parse(R('canonical/skill-costs.json')));
const bNow = T.budget(bee), bRaw = T.budget(Object.assign({}, bee, {levelSkills: undefined}));
ok(bRaw.S === 0 && bNow.S > 0 && bNow.x1 > bRaw.x1, `1. the Bee Knight's budget counts its Level 1 skills (S ${bRaw.S} -> ${bNow.S})`);
ok(BB.budgetDef(bee).effects.flying && BB.budgetDef(bee) !== bee && (c0=> BB.budgetDef(c0) === c0)(cards.find(c=> !c.levelSkills)), '1. budgetDef: + levelSkills 0 / 1; the same object without them');
const rw = byId['rootworm-colony'];
ok(rw && rw.levelSkills[2] && !BB.budgetDef(rw).effects.bloomCopy && T.budget(rw).S === T.budget(Object.assign({}, rw, {levelSkills: undefined})).S, '1. a Level 2 skill (Rootworm Colony\'s Bloom) is not priced, as before');
const editorLike = {id: 'x', attack: 2, health: 3, rarity: 'common', wait: 1, effects: {}, levelSkills: {1: {armor: 1}}}, bothShape = Object.assign({}, editorLike, {effects: {armor: 1}});
ok(T.budget(editorLike).S > 0 && T.budget(editorLike).S === T.budget(bothShape).S, '1. both shapes price the same: levelSkills only (what the editor saves) and effects + levelSkills');
ok(/c\._skillRows = rows\.filter\(r=> r\.lv != null \|\| !lvKeys\.has\(r\.key\)\)/.test(app), '1. the editor shows a skill in effects + levelSkills as one level row (saves levelSkills only)');

// ---- 2a. the rule: Nursing / Nurse heal a random hurt ally
const so = id=> id === 1 ? 'A' : 'B';
const U = (id, effects, o)=> Object.assign({id, name: id, attack: 0, health: 30, wait: 9, cost: 0, effects: effects || {}}, o || {});
const defs = Object.assign({}, H.loadCardDefs(), {
  'e52-nurse': U('e52-nurse', {nursing: 2}), 'e52-old': U('e52-old', {healing: {v: 2, who: 'weakest'}}), 'e52-heal': U('e52-heal', {heal: 2}),
  'e52-trig': U('e52-trig', {triggers: [{on: 'onRoundStart', do: 'heal', amount: 2, who: 'self'}]}, {wait: 0}) /* a trigger goes off once it is Ready */, 'e52-wall': U('e52-wall'),
});
const all = pl=> [...pl.row.left, ...pl.row.center, ...pl.row.right];
function board(seed, healer, hurt){ const e = E.makeSimEngine(defs, E.mulberry32(seed), {recordEvents: true, battleMode: 'open'}); const P = {1: e.newPlayer(1, {}), 2: e.newPlayer(2, {})};
  ['left', 'center', 'right'].forEach((side, i)=> e.debugSpawnCard(P, so, 1, i === 1 ? healer : 'e52-wall', side, {}, []));
  const us = all(P[1]), h = us.find(x=> x.defId === healer), walls = us.filter(x=> x.defId === 'e52-wall');
  if(hurt){ walls[0].hp = 10; walls[1].hp = 20; h.hp = 5; }
  const ev = []; e.resolveCombat(P, so, {}, ev, 1); return {h, walls, ev}; }
['e52-nurse', 'e52-old', 'e52-heal', 'e52-trig'].forEach(id=>{
  const hit = new Set(); let self = 0, other = 0;
  for(let s = 1; s <= 40; s++){ const r = board(s, id, true); if(r.h.hp > 5) self++; if(r.walls[0].hp > 10) hit.add('low'); if(r.walls[1].hp > 20) hit.add('high');
    if(r.walls[0].hp === 10 && r.walls[1].hp === 20) other++; }
  ok(hit.has('low') && hit.has('high') && !self && !other, `2. ${id}: a random hurt ally, both picked over 40 seeds (${[...hit].join('+')}), never itself (${self}), never no one (${other})`);
  const z = board(3, id, false); ok(z.walls.every(w=> w.hp === 30) && !z.ev.some(x=> x.type === 'heal'), `2. ${id}: nobody hurt, nothing happens`);
});
{ const r = board(5, 'e52-nurse', true), t = board(5, 'e52-trig', true);
  ok(r.ev.filter(x=> x.type === 'heal').length === 1 && r.ev.some(x=> x.type === 'heal' && x.cause === 'nursing'), '2. Nursing: one heal event, cause nursing');
  ok(t.ev.some(x=> x.type === 'heal' && x.cause === 'nurse'), '2. Nurse N: its heal event says nurse'); }
{ const a = board(11, 'e52-nurse', true), b = board(11, 'e52-nurse', true); ok(a.walls.map(w=> w.hp).join() === b.walls.map(w=> w.hp).join(), '2. seeded: the same seed heals the same ally'); }

// ---- 2b. the data, the params, saves
ok(!cards.some(c=> (c.effects || {}).healing !== undefined || Object.values(c.levelSkills || {}).some(o=> o && o.healing !== undefined)), '2. canonical/cards.json: no Heal key left');
ok(byId['abbey-goose'].effects.nursing === 2 && byId['unicorn'].effects.nursing === 3, '2. the Heal cards carry Nursing N (Abbey Goose 2, Unicorn 3)');
const P = JSON.parse(R('canonical/skill-params.json'));
ok(!P.families.healing && !/\(Heal\)/.test(P.fields.who), '2. skill-params.json: no Heal family (Nursing is its own skill)');
ok(JSON.stringify(SPL.fuse({nursing: 2})) === '{"nursing":2}', '2. Nursing is not folded into anything on save');
ok(JSON.stringify(SPL.retireDef({effects: {healing: {v: 2, who: 'weakest'}}}).effects) === '{"nursing":2}' && JSON.stringify(SPL.retireDef({effects: {heal: 3}}).effects) === '{"nursing":3}', '2. an old healing / heal key reads as Nursing (saves, cloud edits)');

// ---- 2c. the app: the list, the action, the texts
ok(/sk1Patch\(PASSIVE_DEFS, 'healing', \{hidden:true, retired:true,/.test(app) && /sk1Patch\(PASSIVE_DEFS, 'nursing', \{label:TX\('ui\.skn-nursing'\)/.test(app), '2. "+ Add Skill": Heal hidden, Nursing listed');
ok(/sk1Patch\(ACTION_DEFS, 'heal', \{label:TX\('ui\.eng52-act-nurse'\), fields:\['amount'\]/.test(app) && /case 'heal': doText = TX\('ui\.eng52-act-nurse-text'/.test(app), '2. the action reads Nurse N (no target fields)');
ok(/ev\.cause === 'nurse' \|\| ev\.cause === 'nursing'\) return \{cls:'heal', text:TX\('ui\.eng52-log-nurse'/.test(app), '2. the log says nursed');
ok(/grant:\{nursing:1\}, +sig:'Nursing 1'/.test(app), '2. Open Meadow grants Nursing 1 (was Heal 1)');
const texts = R('bramblewood-texts.js'), KEYS = ['ui.skn-nursing', 'ui.sk-nursing', 'ui.sk-nursing-codex', 'ui.eng52-act-nurse', 'ui.eng52-act-nurse-desc', 'ui.eng52-act-nurse-text', 'ui.eng52-log-nurse', 'ui.eng52-chip-nursing'];
const en = {}; KEYS.forEach(k=>{ const m = texts.match(new RegExp('"' + k.replace(/[.-]/g, '\\$&') + '": "([^"]*)"')); en[k] = m && m[1]; });
ok(KEYS.every(k=> en[k]), '2. the TX keys: ' + KEYS.filter(k=> !en[k]).join(', '));
['fr', 'de', 'es', 'it', 'pt', 'tl', 'ta', 'id', 'zh-Hans', 'zh-Hant', 'ja', 'ko'].forEach(c=>{ const pk = JSON.parse(R('lang/' + c + '.json')); const miss = KEYS.filter(k=> en[k] && !pk[en[k].replace(/^[^\w{]+/u, '')] && !pk[en[k]]); ok(!miss.length, `2. ${c}: every ENG52 text translated (${miss.join(', ')})`); });

console.log(`eng52-2026-11-18: ${n - fail}/${n} passed`);
process.exit(fail ? 1 : 0);
