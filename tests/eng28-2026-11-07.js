#!/usr/bin/env node
// Package ENG28 (2026-11-07, owner notes 11-06 22:16 #2-#7 and 11-06 23:35 #4 #5 #6 #9 #11 #13 #17).
//   22:16 #2  poison damage only adds Poison stacks (the Herb Refinery's brew included); fire damage + 1 Burn (Burn stacks); frost + 1 Freeze
//   22:16 #3  shots miss in the dark as a swing would (Darkness 1 in 4, Pitch Black 1 in 2, Absolute all), seeded
//   22:16 #4  the hover shows the printed card; a spent one-shot stays listed, marked used (printedFrom on a patched unit's card)
//   22:16 #5  the purple edited pencil: admins only;  #6 a skill learnt at a higher level: a gold "?";  #7 death triggers: 💀
//   23:35 #4  Mulligan;  #5 Devour in the card editor;  #6 Pickpocket falls back to the bramble's resources;  #9 every skill has a pip by default
//   23:35 #11 Sonar / Keen Sense "?" until the first dark map, pips only in the dark;  #13 Offspring N;  #17 Brood tokens: Swarm (Species)
//   node tests/eng28-2026-11-07.js
'use strict';
const fs = require('fs'), path = require('path');
const H = require('./lib/harness.js');
const ROOT = H.ROOT, E = H.Engine;
const rd = rel=> fs.readFileSync(path.join(ROOT, rel), 'utf8');
const app = rd('arena_app.js'), tpl = rd('arena_template.html'), eng = rd('bramblewood-engine.js');
const T = require(path.join(ROOT, 'bramblewood-texts.js')).TEXT;
const B = require(path.join(ROOT, 'bramblewood-budget.js'));
let fail = 0, n = 0; const ok = (c, m)=>{ n++; if(!c){ fail++; console.log('  ✗', m); } };
const so = id=> id === 1 ? 'A' : 'B';
const U = (id, effects, o)=> Object.assign({id, name:id, attack:1, health:20, wait:0, cost:0, effects}, o || {});
const defs = Object.assign({}, H.loadCardDefs(), {
  'x-arrow': U('x-arrow', {arrow:3}, {attack:0}),
  'x-arrow-ds': U('x-arrow-ds', {arrow:3, darksight:true}, {attack:0}),
  'x-fire': U('x-fire', {fireBolt:2}, {attack:0}),
  'x-ice': U('x-ice', {iceArrow:2}, {attack:0}),
  'x-dummy': U('x-dummy', {}, {attack:0, health:50}),
  'x-coldproof': U('x-coldproof', {resist:['cold']}, {attack:0, health:50}),
  'x-mul': U('x-mul', {mulligan:true}),
  'x-off': U('x-off', {offspring:1, thorns:1}, {attack:5, health:9}),
  'x-off2': U('x-off2', {offspring:2}, {attack:1, health:1}),
  'x-pp': U('x-pp', {pickpocket:2}, {attack:1}),
  'x-rocket': U('x-rocket', {rocket:3}, {attack:1, health:20}),
  'x-crab': U('x-crab', {}, {attack:0, health:30, archetypes:['Desert'], species:['Crustacean']}),
  'x-mouse': U('x-mouse', {}, {attack:0, health:30, archetypes:['Coastal', 'Cave'], species:['Rodent']}),
});
const all = pl=> [...pl.row.left, ...pl.row.center, ...pl.row.right];
function mk(opts, ch1){ const e = E.makeSimEngine(defs, E.mulberry32((opts && opts.seed) || 28), Object.assign({recordEvents:true, battleMode:'open'}, opts || {}));
  return {e, P:{1: e.newPlayer(1, {}, ch1 || {id:'st-hq', health:500, effects:{}}), 2: e.newPlayer(2, {}, {id:'st-hq', health:500, effects:{}})}}; }
function put(e, P, pid, id, slot){ const pl = P[pid]; e.debugSpawnCard(P, so, pid, id, 'left', {}, []);
  const c = all(pl).reduce((a, x)=> (!a || x.uid > a.uid) ? x : a, null); c.slot = slot;
  const cs = all(pl); pl.row.center = cs.filter(x=> x.slot === 0); pl.row.left = cs.filter(x=> x.slot < 0).sort((a, b)=> b.slot - a.slot); pl.row.right = cs.filter(x=> x.slot > 0).sort((a, b)=> a.slot - b.slot);
  e.syncPhaseStats(P, so, []); return c; }
const dv = (e, id)=> e.derivedDefs[id] || defs[id];

// ---- 22:16 #2: poison, fire, frost ---------------------------------------------------------------------------------------------
{ const {e, P} = mk(); const d = put(e, P, 2, 'x-dummy', 0);
  const r = e.damageCardFlat(d, 2, 'poison', 'castle');
  ok(r === 0 && d.hp === 50 && d.poison === 2, `a bramble's / skill's 2 poison damage: 2 Poison stacks, no Health lost (${r}, ${d.hp}, ${d.poison})`);
  const t = e.damageCardFlat(d, 2, 'poison');
  ok(t === 2 && d.hp === 48, `a Poison tick (no attacker) still hurts (${t}, ${d.hp})`); }
{ // the Herb Refinery's brew: Poison, no damage (its rounds roll 1 in 3; over 12 rounds it brews at least once on this seed)
  const {e, P} = mk({seed: 5}, {id:'st-herb', health:500, effects:{herbRefinery:true}}); const d = put(e, P, 2, 'x-dummy', 0); const ev = [];
  for(let r = 2; r <= 13; r++) e.roundStart(P, r, so, {}, ev);
  const banes = ev.filter(x=> x.type === 'statusFx' && x.kind === 'herbBane');
  ok(banes.length > 0 && d.hp === 50 && d.poison > 0, `the Herb Refinery's brew (${banes.length}x): Poison ${d.poison}, Health untouched (${d.hp})`);
  ok(ev.some(x=> x.type === 'statusFx' && x.kind === 'poison' && x.eng28 && x.targetUid === d.uid), 'the brew shows as Poison on the board (statusFx poison)'); }
{ const {e, P} = mk(); put(e, P, 1, 'x-fire', 0); const d = put(e, P, 2, 'x-dummy', 0); e.resolveCombat(P, so, {}, [], 1);
  ok(d.hp === 48 && d.burn === 1, `a 2 fire bolt: 2 damage plus 1 Burn (${d.hp}, Burn ${d.burn})`);
  const ev = []; e.resolveCombat(P, so, {}, ev, 2);
  ok(d.burn === 1 && ev.some(x=> x.type === 'burnTick' && x.uid === d.uid), `the next round it ticks once (Burn 1 -> 0) and the new bolt adds 1 (Burn ${d.burn})`); }
ok(/burnPerHit:1/.test(eng) && /card\.burn = b0 \+ EN20\.burnPerHit/.test(eng), 'Burn stacks: + EN20.burnPerHit a fire hit (was: set to 2, refreshed)');
{ const {e, P} = mk(); put(e, P, 1, 'x-ice', 0); const d = put(e, P, 2, 'x-dummy', 0); const ev = []; e.resolveCombat(P, so, {}, ev, 1);
  ok(d.hp === 48 && ev.some(x=> x.type === 'statusFx' && x.kind === 'freeze' && x.eng28 && x.targetUid === d.uid), 'an Ice Arrow 2: 2 damage plus 1 Freeze counter, every time');
  const {e: e2, P: P2} = mk(); put(e2, P2, 1, 'x-ice', 0); const c = put(e2, P2, 2, 'x-coldproof', 0); const ev2 = []; e2.resolveCombat(P2, so, {}, ev2, 1);
  ok(!ev2.some(x=> x.kind === 'freeze' && x.targetUid === c.uid), 'a unit that resists cold is not frozen'); }
{ // field cold freezes nobody (only a unit's hit does)
  const {e, P} = mk(); const d = put(e, P, 2, 'x-dummy', 0); e.damageCardFlat(d, 1, 'cold');
  ok(!(d.frozen > 0), 'field / no-attacker cold lays no Freeze'); }

// ---- 22:16 #3: the dark and the shots ------------------------------------------------------------------------------------------
function darkRun(dark, shooter){ let miss = 0, runs = 0;
  for(let s = 1; s <= 40; s++){ const {e, P} = mk({seed: s, rules: dark ? {dark, phase:'off'} : {phase:'off'}}); put(e, P, 1, shooter || 'x-arrow', 0); put(e, P, 2, 'x-dummy', 0);
    const ev = []; e.resolveCombat(P, so, {}, ev, 1); runs++; if(ev.some(x=> x.type === 'blindMiss' && x.ranged)) miss++; }
  return miss; }
{ const none = darkRun(null), pitch = darkRun('pitch'), abs = darkRun('absolute'), dk = darkRun('dark'), ds = darkRun('absolute', 'x-arrow-ds');
  ok(none === 0, `a lit fight: no shot misses for the dark (${none}/40)`);
  ok(pitch >= 10 && pitch <= 30, `Pitch Black: about 1 in 2 shots miss (${pitch}/40)`);
  ok(dk >= 3 && dk <= 18, `Darkness: about 1 in 4 (${dk}/40)`);
  ok(abs === 40, `Absolute darkness: every shot misses (${abs}/40)`);
  ok(ds === 0, `Darksight sees: no miss in Absolute darkness (${ds}/40)`); }
ok(/function eng28DarkShotMiss\(c, pid, target\)/.test(eng) && /sightMiss\(c, pid, true\)/.test(eng), 'the shots use the swing\'s dark rule (sightMiss, its dark share)');

// ---- 22:16 #4: the printed card on a patched unit ------------------------------------------------------------------------------
{ const {e, P} = mk(); const r = put(e, P, 1, 'x-rocket', 0); put(e, P, 2, 'x-dummy', 0); e.resolveCombat(P, so, {}, [], 1);
  const d = dv(e, r.defId);
  ok(r.defId !== 'x-rocket' && d && !d.effects.rocket && d.printedFrom === 'x-rocket', `a fired Rocket: the unit's card drops it, printedFrom keeps the printed card (${r.defId}, ${d && d.printedFrom})`); }
ok(/function eng28HoverDef\(d, liveCard\)/.test(app) && /const visualDef = hv \? hv\.full : d;/.test(app) && /sk-used-tag">\$\{escapeHtml\(TX\('ui\.eng20-used'\)\)\}/.test(app), 'the hover: the printed card, a spent one-shot struck with "used"');
ok(/ENG28_ONE_SHOT = new Set\(\['onReadyDamage', 'rocket'/.test(app), 'the one-shots it marks used are spendOnReady\'s');

// ---- 22:16 #5 #6 #7 ------------------------------------------------------------------------------------------------------------
ok(/\$\{isCustom&&!hand&&adminModeEnabled /.test(app), '#5 the edited pencil shows only in Admin Mode');
ok(/function eng28LaterSkillsHTML\(d\)/.test(app) && /\$\{abilityHTML\}\$\{eng28LaterSkillsHTML\(d\)\}/.test(app) && /\.skill-q\.eng28-later\{/.test(tpl) && T['ui.eng28-later'] === 'Learnt at a higher level', '#6 a gold "?" for a skill learnt at a higher level, tooltip "Learnt at a higher level"');
ok(/function eng28DeathTrig\(t\)/.test(app) && (app.match(/eng28DeathTrig\(t\) \? '💀' : '⚡'/g) || []).length === 2, '#7 a death trigger\'s chip leads with 💀 (live and spent)');

// ---- 23:35 #4 Mulligan ---------------------------------------------------------------------------------------------------------
{ const {e, P} = mk(); P[1].deck = ['x-dummy', 'x-dummy', 'x-dummy', 'x-dummy', 'x-dummy', 'x-dummy', 'x-mul']; const ev = [];
  e.draw(P[1], 3, 'A', {}, ev);
  const m = ev.filter(x=> x.type === 'mulligan');
  ok(m.length === 1 && P[1].hand.length === 3 && P[1].deck.length === 4 && P[1].deck.includes('x-mul') === (m[0].drewDefId !== 'x-mul'), `the opening hand: Mulligan goes back, a card comes in (${P[1].hand.map(h=> h.defId)})`);
  const ev2 = []; P[1].hand = P[1].hand.filter(h=> h.defId !== 'x-mul'); P[1].deck.push('x-mul'); e.draw(P[1], 1, 'A', {}, ev2);
  ok(!ev2.some(x=> x.type === 'mulligan') && P[1].hand.some(h=> h.defId === 'x-mul'), 'a later draw keeps it (only the opening hand)'); }
// 2026-11-07 (BAL21 item 5): the price moved from the budget's ENG28_SKILL_PRICES fallback to canonical/skill-costs.json; the app's literal fallback stays
{ const sct = JSON.parse(require('fs').readFileSync(require('path').join(__dirname, '..', 'canonical', 'skill-costs.json'), 'utf8')), mr = sct.skills.find(s=> s.id === 'mulligan');
  ok(mr && mr.value === -0.1 && B.ENG28_SKILL_PRICES === undefined && /Object\.assign\(SB_DEFAULT_SKILLS, \(typeof BramblewoodBudget/.test(app) && /\{mulligan:-0\.1, offspring:0\}/.test(app), 'Mulligan is priced -0.1 (the owner\'s price), in canonical/skill-costs.json and the game\'s literal fallback'); }

// ---- 23:35 #5 Devour in the editor ---------------------------------------------------------------------------------------------
ok(/\{key:'devour', category:'passive', label:TX\('ui\.eng28-devour-name'\), kind:'twoNumber'/.test(app), 'Devour has a card editor row (pick, edit, remove)');
ok(/newEffects\.devour\.grant = c\.effects\.devour\.grant/.test(app) && /if\(p\.key==='devour'\) return;/.test(app), 'a Save keeps its granted skills; its card line is not doubled');

// ---- 23:35 #6 Pickpocket -------------------------------------------------------------------------------------------------------
{ const {e, P} = mk(); put(e, P, 1, 'x-pp', 0); put(e, P, 2, 'x-dummy', 0); P[2].lumber = 1; P[2].stone = 3; P[1].lumber = 0; P[1].stone = 0;
  const ev = []; e.resolveCombat(P, so, {}, ev, 1);
  ok(P[1].lumber === 1 && P[1].stone === 1 && P[2].lumber === 0 && P[2].stone === 2, `a token-less unit hit: 2 resources from the bramble, Lumber first (me ${P[1].lumber}/${P[1].stone}, them ${P[2].lumber}/${P[2].stone})`);
  ok(ev.some(x=> x.type === 'sk2' && x.kind === 'pickpocketRes' && x.fallback), 'its event: pickpocketRes (fallback)'); }
{ const {e, P} = mk(); put(e, P, 1, 'x-pp', 0); const t = put(e, P, 2, 'x-dummy', 0); t.sk2Berries = 3; P[2].lumber = 5; P[1].lumber = 0;
  e.resolveCombat(P, so, {}, [], 1);
  ok(t.sk2Berries === 1 && P[2].lumber === 5, `a unit with tokens: it takes the tokens, not resources (berries ${t.sk2Berries}, their Lumber ${P[2].lumber})`); }

// ---- 23:35 #9 pips by default --------------------------------------------------------------------------------------------------
{ const a = app.indexOf('\nfunction abilityBadges('), b = app.indexOf('\n// Badge cycling ticker', a), ta = app.indexOf('\nfunction triggerBadges('), tb = app.indexOf('\nconst CHIP_FALLBACK_SKILLS', ta);
  const src = app.slice(a, b) + app.slice(ta, tb) + JSON.stringify((app.match(/const CHIP_FALLBACK_SKILLS = \[[^\]]*\]/) || [''])[0]);
  const handled = k=> new RegExp('\\be\\.' + k + '\\b|[\'"]' + k + '[\'"]').test(src);
  ok(!handled('poisonBarbs') && handled('thorns') && handled('pounce') && handled('sonar'), 'Poison Barbs had no pip (it gets the default one); Thorns, Pounce, Sonar keep their own');
  ok(/eng28GenericPips\(e, out, bopts, n1\);/.test(app) && /const ENG28_PIP_OPT_OUT = new Set\(\['mulligan', 'leader', 'archerStyle', 'hatchling', 'fodder'\]\);/.test(app), 'every other skill gets a pip; the opt-outs are listed'); }

// ---- 23:35 #11 Sonar / Keen Sense ----------------------------------------------------------------------------------------------
ok(/sonar:       \{from:8, darkMap:true\}/.test(app) && /keenSense:   \{from:8, darkMap:true\}/.test(app) && /SKILL_REVEAL_MAP\[k\]\.darkMap/.test(app), 'Sonar and Keen Sense read "?" until Map 8 or a dark map');
ok(/if\(e\.keenSense && !eng28DarkPipOff\(bopts\)\)/.test(app) && /if\(k === 'sonar' && eng28DarkPipOff\(bopts\)\) return;/.test(app), 'their pips show in a fight only while it is dark');

// ---- 23:35 #13 Offspring -------------------------------------------------------------------------------------------------------
{ const {e, P} = mk(); P[1].hand.push({uid:99281, defId:'x-off'}); P[1].lumber = 10; e.placeCard(P, so, 1, 99281, 'center', {}, []);
  const kids = all(P[1]).filter(c=> /~offspring~/.test(c.defId)), k = kids[0], kd = k && dv(e, k.defId);
  ok(kids.length === 1 && k.atk === 2 && k.maxHp === 4 && kd.token && kd.wait === 1, `a 5/9 Offspring 1: one 2/4 token, Wait 1 (${kids.map(c=> c.atk + '/' + c.maxHp)})`);
  ok(kd && !kd.effects.offspring && kd.effects.thorns === 1, 'the copy keeps its other skills, not Offspring (no chain)'); }
{ const {e, P} = mk(); P[1].hand.push({uid:99282, defId:'x-off2'}); P[1].lumber = 10; e.placeCard(P, so, 1, 99282, 'center', {}, []);
  const kids = all(P[1]).filter(c=> /~offspring~/.test(c.defId));
  ok(kids.length === 2 && kids.every(c=> c.atk === 0 && c.maxHp === 1), `a 1/1 Offspring 2: two 0/1 copies (Health at least 1) (${kids.map(c=> c.atk + '/' + c.maxHp)})`); }
ok(B.OFFSPRING_COPY === 0.32 && B.bloomBodyMult({offspring:1}) === 1.32 && B.bloomBodyMult({offspring:2}) === 1.64 && B.capScores(2, 4, 0, {offspring:1}).k === 1.32, 'its price: k = 1 + 0.32 N on cap 1\'s stat terms (0.5 x 0.85 x 0.75)');

// ---- 23:35 #17 Brood: Swarm (Species) ------------------------------------------------------------------------------------------
{ const {e, P} = mk(); P[1].hand.push({uid:99283, defId:'grotto-lobster'}); P[1].lumber = 30; e.placeCard(P, so, 1, 99283, 'center', {}, []);
  const tok = all(P[1]).find(c=> /~brood$/.test(c.defId)), td = tok && dv(e, tok.defId);
  // 2026-11-07 (ENG32, owner 09:47 #15: "Brood: no Swarm"): #17 undone: the token is a 1/1 copy of the parent (Crab claws) with no Swarm
  ok(td && !td.effects.swarm && !td.effects.swarmSpecies && td.effects.crabClaws && !td.effects.brood, 'a Grotto Lobster brood token: a 1/1 copy (Crab claws), no Swarm (ENG32 undid Swarm (Species))');
  put(e, P, 1, 'x-crab', 2); put(e, P, 1, 'x-mouse', -2); const after = e.swarmBonusOf(P, tok);
  ok(after === 0, `no Swarm, so no Swarm bonus (${after})`); }
ok(B.PARAMS.includes('swarmSpecies') && T['ui.eng28-swarm-species'], 'swarmSpecies is a parameter (not a skill of its own); its text says "of its own species"');

// ---- texts, translations, docs ---------------------------------------------------------------------------------------------------
const NEWK = ['ui.eng28-herb-line', 'ui.eng28-herb-log', 'ui.eng28-mulligan-name', 'ui.eng28-mulligan', 'ui.eng28-mulligan-log', 'ui.eng28-offspring-name', 'ui.eng28-offspring', 'ui.eng28-devour-name', 'ui.eng28-swarm-species', 'ui.eng28-later', 'ui.sk-ice-bolt', 'ui.sk-ice-arrow', 'ui.eng20-burn-tip'];
ok(NEWK.every(k=> T[k]), 'every ENG28 text is a TX key');
for(const c of ['de', 'es', 'fr', 'id', 'it', 'ja', 'ko', 'pt', 'ta', 'tl', 'zh-Hans', 'zh-Hant']){ const L = JSON.parse(rd('lang/' + c + '.json')); const miss = NEWK.filter(k=> !L[T[k]] && !L[T[k].replace(/^⚗️ /, '')]); // a leading emoji is not part of the pack's key
  ok(!miss.length, `lang/${c}.json translates every ENG28 text (${miss})`); }
ok(!/1 in 2 Freezes/.test(T['ui.sk-ice-bolt'] + T['ui.sk-ice-arrow']) && /Poison/.test(T['ui.eng28-herb-line']) && !/damage to a random enemy unit/.test(app.slice(app.indexOf('if(e.herbRefinery){ const hb'), app.indexOf('if(e.herbRefinery){ const hb') + 400)), 'the texts that said otherwise are fixed (Ice, Herb Refinery)');
{ const dec = JSON.parse(rd('docs/decisions.json')), list = dec.items || dec.decisions || dec, ids = list.filter(x=> /^ENG28-/.test(x.id));
  ok(ids.length >= 4 && ids.every(x=> (x.body || '').split(/\s+/).length < 100), `decisions ENG28-n filed, each under 100 words (${ids.map(x=> x.id)})`); }
ok(/ENG28/.test(rd('docs/CHANGELOG.md').slice(0, 16000)), 'a CHANGELOG entry at the top'); // 2026-11-07 (ENG32): 16000, ENG32's entry sits above; // 2026-11-07 (UI26): window widened, newer packages' entries sit above ENG28's
ok(/## 11-07: Package ENG28 \(on its branch, not released\)/.test(rd('docs/action-items.md')), 'the action-items section');
ok(/poison damage only adds Poison stacks/i.test(rd('docs/project-state.md')), 'project-state: the settled rule');
ok(/run node tests\/eng28-2026-11-07\.js/.test(rd('tests/run-all.sh')), 'listed in tests/run-all.sh');

console.log(`eng28: ${n - fail}/${n} checks passed`);
process.exit(fail ? 1 : 0);
