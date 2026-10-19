#!/usr/bin/env node
// 2026-10-19 (package UT, owner 09:52: "tag an animal to the card. For ghosts and spirits and elementals - they have an animal embodiment,
// see. But subtype ghost or elemental etc." + "The starter cards are not Otters. Just considered as 'Base'. Base cards just mean they come
// from Skirmish rewards, not Card Packs. The tutorial base cards come as Level 0 is the special thing."): checks that
//   1. canonical/cards.json and canonical/animal-tags.json are what python3 tools/animal_tags.py writes now (--check);
//   2. every creature card has `animal`; a `subtype` only from the fixed list; a non-creature only when it embodies one;
//   3. no card has the 'otters' faction any more: the 27 are faction 'base'; the Hummingbirds stay a real faction (12, all hummingbirds);
//   4. the Codex: the animal / subtype / Base chips and the animal filter (TX keys), the build inlines the animal groups;
//   5. the tutorial's copies are Level 0 (the TUTORIAL_LEVEL0_UT block, run on a stubbed copy store).
'use strict';
const fs = require('fs'), path = require('path'), cp = require('child_process'), vm = require('vm');
const ROOT = path.join(__dirname, '..');
const rd = rel=> fs.readFileSync(path.join(ROOT, rel), 'utf8');
let fail = 0, checks = 0; const ok = (c, m)=>{ checks++; if(!c){ fail++; console.log('  ✗', m); } };

// 1. fresh
let fresh = true; try{ cp.execFileSync('python3', [path.join(ROOT, 'tools/animal_tags.py'), '--check'], {stdio: 'pipe'}); }catch(e){ fresh = false; }
ok(fresh, '1. cards.json and animal-tags.json are up to date (python3 tools/animal_tags.py)');

// 2. animals and subtypes
const SUBTYPES = ['ghost', 'spirit', 'elemental', 'undead', 'construct', 'structure', 'fiend', 'conjured', 'plant', 'fungus', 'mythic', 'changeling', 'were', 'mutant', 'glitch'];
const cards = JSON.parse(rd('canonical/cards.json')), R = JSON.parse(rd('canonical/animal-tags.json'));
const creature = c=> !(c.test || c.field || c.eggKind || ['materia', 'equipment', 'spell'].includes(c.cardType) || c.hallOfFame);
ok(JSON.stringify(R.subtypes.map(s=> s.id)) === JSON.stringify(SUBTYPES), '2. the report lists the fixed subtype list');
cards.forEach(c=>{
  // package EE's Easter-egg cards came with their own tags (2026-10-19): left as they are, reported for the owner
  if(c.easterEgg){ ok(R.cards.some(r=> r.id === c.id && r.how === 'ee' && (r.animal || !r.creature)), `2. Easter egg ${c.id} keeps its (aligned) tags and is listed`); return; }
  if(creature(c)) ok(typeof c.animal === 'string' && /^[a-z][a-z' -]*[a-z]$/.test(c.animal), `2. creature ${c.id} has an animal (${c.animal})`);
  else ok(!c.animal || ['egg-otter', 'egg-red-dragon'].includes(c.id), `2. non-creature ${c.id} has an animal only when it embodies one`);
  ok(c.subtype == null || (SUBTYPES.includes(c.subtype) && c.animal), `2. ${c.id} subtype ${c.subtype} is from the fixed list`);
});
const byId = {}; cards.forEach(c=> byId[c.id] = c);
const is = (id, a, st)=> ok(byId[id] && byId[id].animal === a && (byId[id].subtype || null) === (st || null), `2. ${id} is ${a}${st ? ' (' + st + ')' : ''} (got ${byId[id] && byId[id].animal} ${byId[id] && byId[id].subtype || ''})`);
is('otter-kit', 'otter'); is('wolf-spider-mother', 'wolf spider'); is('storm-heron', 'heron', 'elemental'); is('magma-wraith', 'wolf', 'ghost');
is('cinder-skeleton', 'horse', 'undead'); is('tide-spirit', 'seahorse', 'elemental'); is('summoned-shield', 'pangolin', 'construct'); is('red-dragon', 'dragon', 'mythic');
is('cobalt-talon-fledgling', 'hummingbird'); is('moray-ambusher', 'moray eel'); is('shrine-high-priest', 'fox', 'spirit');
// the species field is left as it is
ok(byId['moray-ambusher'].species[0] === 'Cnidarian' && R.speciesNotes.some(n=> n.id === 'moray-ambusher'), '2. species unchanged; the disagreement is reported');
ok(R.counts.creatures === cards.filter(creature).length && R.counts.proposed === R.ownerCalls.length, '2. the report counts match');
// the key sits right after species (cards.json keeps its order and indent)
const raw = rd('canonical/cards.json');
ok(/"species": \[\n\s+"Mustelid"\n\s+\],\n\s+"animal": "otter",\n\s+"basicSet": "otters"/.test(raw), '2. animal sits right after species, indent 2');

// 3. Base and the Hummingbirds
ok(!cards.some(c=> c.faction === 'otters'), '3. no card has the otters faction');
ok(cards.filter(c=> c.faction === 'base').length === 27, '3. 27 Base cards (faction base)');
const hb = cards.filter(c=> c.faction === 'hummingbirds');
ok(hb.length === 12 && hb.every(c=> (c.archetypes || []).includes('Hummingbird') && c.animal === 'hummingbird'), '3. the Hummingbirds stay a faction: 12 cards, all hummingbirds');

// 4. the Codex and the build
const app = rd('arena_app.js'), tx = rd('bramblewood-texts.js');
ok(/CODEX_ANIMAL_UT:BEGIN[\s\S]*const ANIMAL_GROUPS = __ANIMAL_GROUPS__;[\s\S]*CODEX_ANIMAL_UT:END/.test(app), '4. arena_app.js has the animal block and the groups placeholder');
ok(app.includes('id="cxAnimal"') && /codexFilter\.animal\) ids = ids\.filter\(id=> animalGroupOf\(defs\[id\]\.animal\) === codexFilter\.animal\)/.test(app), '4. the Codex filters by animal');
ok(app.includes('.concat(animalChipsHTML(d))'), '4. the card detail shows the animal chips');
['ui.codex-all-animals', 'ui.codex-animal-filter', 'ui.codex-animal-tip', 'ui.codex-subtype-tip', 'ui.codex-base-chip', 'ui.codex-base-tip'].concat(SUBTYPES.map(s=> 'ui.subtype-' + s))
  .forEach(k=> ok(tx.includes('"' + k + '":') && app.includes("TX('" + k + "'"), `4. TX key ${k} exists and is used`));
ok(/sub_once\(app_src, "__ANIMAL_GROUPS__"/.test(rd('assemble_arena.py')), '4. the build inlines the animal groups');
if(fs.existsSync(path.join(ROOT, 'index.html'))) ok(/const ANIMAL_GROUPS = \{"[A-Za-z]/.test(rd('index.html')), '4. index.html carries the animal groups');

// 5. the tutorial's copies at Level 0
const m = app.match(/\/\/ TUTORIAL_LEVEL0_UT:BEGIN[\s\S]*?\/\/ TUTORIAL_LEVEL0_UT:END/);
ok(!!m, '5. the TUTORIAL_LEVEL0_UT block exists');
ok(/if\(isTutorialCopySource\(source\)\) tutorialCopyLevel0\(id\);/.test(app) && /tutorialStarterCopiesLevel0\(deck\);/.test(app), '5. unlockCardForPlayer and claimTutorialWin use it');
if(m){
  const defs = {'otter-kit': {id: 'otter-kit', faction: 'base'}, 'harvest-mouse': {id: 'harvest-mouse'}, 'river-warden': {id: 'river-warden', faction: 'base'}};
  const ctx = {myCardCopies: {'river-warden': [{foil: false, uid: 'a', level: 1}]}, myCardLevels: {'river-warden': 1}, hatch: new Set(), uid: 0};
  const sb = {ctx, copyModelOn: ()=> true, copyBaseDef: id=> defs[id], cardBaseLevel: d=> d && d.faction ? 1 : 0, isUnlimitedCard: id=> id !== 'river-warden',
    newCopyUid: ()=> 'u' + (ctx.uid++), saveCardCopies: ()=>{}, saveCardLevels: ()=>{}, saveHatchlings: ()=>{}, hatchlingIds: ()=> ctx.hatch,
    topCopyLevel: id=>{ let t = -1; (ctx.myCardCopies[id] || []).forEach(c=>{ const L = c.level; if(L > t) t = L; }); return t; }};
  vm.createContext(sb);
  vm.runInContext('var myCardCopies = ctx.myCardCopies, myCardLevels = ctx.myCardLevels;\n' + m[0] + '\nthis.T = {isTutorialCopySource, tutorialCopyLevel0, tutorialStarterCopiesLevel0};', sb);
  const T = sb.T;
  ok(T.isTutorialCopySource('tutorialReward') && T.isTutorialCopySource('starterDeck') && !T.isTutorialCopySource('reward'), '5. tutorial sources');
  T.tutorialCopyLevel0('river-warden');
  const rw = ctx.myCardCopies['river-warden'][0];
  ok(rw.level === 0 && rw.hatch === 1 && rw.tut === 1 && ctx.hatch.has('river-warden') && !('river-warden' in ctx.myCardLevels), '5. a tutorial reward copy of a Level 1 card is a Level 0 hatchling copy');
  T.tutorialStarterCopiesLevel0({'otter-kit': 2, 'harvest-mouse': 1});
  const ok2 = ctx.myCardCopies['otter-kit'];
  ok(ok2.length === 2 && ok2.every(c=> c.level === 0 && c.hatch === 1 && c.m === 1 && c.tut === 1) && ctx.hatch.has('otter-kit'), '5. the starting deck\'s Base copies are Level 0');
  const hm = ctx.myCardCopies['harvest-mouse'];
  ok(hm.length === 1 && hm[0].level === 0 && !hm[0].hatch && !ctx.hatch.has('harvest-mouse'), '5. a card that already starts at Level 0 needs no hatchling mark');
}

console.log(`animal-tags: ${checks - fail}/${checks} passed`);
process.exit(fail ? 1 : 0);
