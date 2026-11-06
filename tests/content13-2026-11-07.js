#!/usr/bin/env node
// Package CONTENT13 (2026-11-07, owner 11-06 23:35 #8: "Below the tutorial, add a sub-map (admin only). It has 2 SK decks, one having a random
// assortment of optimised otter faction cards, the other hummingbird faction cards."): the Drill Grounds (arena_app.js C13_ADMIN_SUBMAPS).
//   1. hidden for non-admins: out of CONQUEST_MAPS while Admin Mode is off (the block run in a sandbox with a stand-in map list), and a map
//      left selected goes back to its parent; in it while Admin Mode is on, at the end (no other side map's letter moves); out again after
//   2. its entrance sits under the Tutorial's (belowSub mtut, where the Tutorial's entrance is drawn); a 🛠️ badge marks it
//   3. two skirmish decks, legal (20 cards, at most 6 different, at most 4 copies and the rarity cap) and faction-pure (every card carries
//      the faction's archetype in canonical/cards.json and not the other's; no token, test or unsourced card), as the optimiser's run recorded
//   4. no rewards: no reward fields on the map or its fights; the fight is a test fight (adminTest: no rewards, drops, XP, rank, progress),
//      free, refused outside Admin Mode, kept unpaid when resumed; completeConquestNode refuses it; the panel shows no rewards / drops /
//      Edit rewards / Mark cleared; no skill reveal from entering it
//   5. the words are TX keys, in all 12 language packs; the map art is derived in the build
//   node tests/content13-2026-11-07.js
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const ROOT = path.join(__dirname, '..');
const rd = rel=> fs.readFileSync(path.join(ROOT, rel), 'utf8');
const app = rd('arena_app.js'), tpl = rd('arena_template.html'), asm = rd('assemble_arena.py');
const T = require(path.join(ROOT, 'bramblewood-texts.js')).TEXT;
const C13 = require(path.join(ROOT, 'tools', 'content13_faction_decks_2026_11_07.js'));
let fail = 0, n = 0; const ok = (c, m)=>{ n++; if(!c){ fail++; console.log('  ✗', m); } };

// ---- 1. the block in a sandbox
const b = app.indexOf('// C13_ADMIN_SUBMAPS:BEGIN'), e = app.indexOf('// C13_ADMIN_SUBMAPS:END');
ok(b > 0 && e > b, 'the C13_ADMIN_SUBMAPS block is in arena_app.js');
ok(b > app.indexOf('const CONQUEST_MAPS_BASELINE = '), '1. it runs after the baseline copy (the map is never in CONQUEST_MAPS_BASELINE)');
const block = app.slice(b, e);
const ctx = {CONQUEST_MAPS: [{id:'m1', nodes:[]}, {id:'mtut', sub:true, parent:'m1', entry:{x:7, y:80}, nodes:[]}, {id:'mo', sub:true, parent:'m1', nodes:[]}],
  adminModeEnabled: false, conquestSelectedMap: 'm1', conquestSelectedNodeKey: null, TX: k=> Object.prototype.hasOwnProperty.call(T, k) ? T[k] : '??' + k};
vm.createContext(ctx);
vm.runInContext(block + '\nthis.__c13 = {C13_ADMIN_SUBMAPS, c13SyncAdminSubMaps, c13NodeIsAdminTest, c13IsAdminMap};', ctx);
const X = ctx.__c13, ids = ()=> ctx.CONQUEST_MAPS.map(m=> m.id).join(',');
ok(X.C13_ADMIN_SUBMAPS.length === 1 && X.C13_ADMIN_SUBMAPS[0].id === 'mdg', '1. one admin side map, the Drill Grounds (mdg)');
const DG = X.C13_ADMIN_SUBMAPS[0];
ok(ids() === 'm1,mtut,mo', '1. Admin Mode off at load: the Drill Grounds are not in CONQUEST_MAPS (players never see it): ' + ids());
ctx.adminModeEnabled = true; X.c13SyncAdminSubMaps();
ok(ids() === 'm1,mtut,mo,mdg', '1. Admin Mode on: in CONQUEST_MAPS, at the end (the Old Bramble stays 0-B): ' + ids());
X.c13SyncAdminSubMaps(); ok(ids() === 'm1,mtut,mo,mdg', '1. a second sync adds it once');
ok(DG.name === T['map.c13-name'] && DG.nodes[0].name === T['map.c13-1-name'] && DG.nodes[1].flavor === T['map.c13-2-flavor'], '5. its words come from TX when it comes in');
ctx.conquestSelectedMap = 'mdg'; ctx.adminModeEnabled = false; X.c13SyncAdminSubMaps();
ok(ids() === 'm1,mtut,mo', '1. Admin Mode off again: out of CONQUEST_MAPS: ' + ids());
ok(ctx.conquestSelectedMap === 'm1' && ctx.conquestSelectedNodeKey === null, '1. a Drill Grounds left open goes back to the Outskirts');
ok(X.c13NodeIsAdminTest('mdg') && !X.c13NodeIsAdminTest('m1') && !X.c13NodeIsAdminTest('mtut'), '4. only its fights are admin test fights');
ok(DG.sub === true && DG.parent === 'm1' && DG.adminOnly === true && DG.sequential === false, '1. a side map of the Outskirts, adminOnly, both fights open');
ok(/function setAdminMode\(on\)\{[\s\S]{0,600}c13SyncAdminSubMaps\(\)/.test(app) && /function syncAdminModeToAccount\(\)\{[\s\S]{0,400}c13SyncAdminSubMaps\(\)/.test(app), '1. setAdminMode and syncAdminModeToAccount bring it in and take it out');
ok(/c13SyncAdminSubMaps\(\);\n\/\/ C13_ADMIN_SUBMAPS:END/.test(app), '1. synced once at load');
ok(/if\(!hid && c13IsAdminMap\(conquestSelectedMap\)\) conquestSelectedMap = 'm1';/.test(app), '1. renderConquestSubTab: a saved selection of it with Admin Mode off falls back to the Outskirts');
ok(/c13IsAdminMap\(map\) \? C13_ADMIN_BASE\.find/.test(app), '1. applyNodeEdits rebuilds its fights from its own baseline (it sits past CONQUEST_MAPS_BASELINE)');

// ---- 2. the entrance
ok(DG.entry && DG.entry.belowSub === 'mtut' && DG.entry.dy > 0, '2. the entrance is anchored under the Tutorial\'s (belowSub mtut, dy ' + (DG.entry && DG.entry.dy) + ')');
ok(/const below = sm\.entry\.belowSub \?[\s\S]{0,400}anchor\.y \+ \(sm\.entry\.dy \|\| 12\)/.test(app), '2. subMapEntrancesHTML places it under the Tutorial\'s drawn position');
ok(/const adminTag = sm\.adminOnly \?/.test(app) && /\$\{adminTag\}/.test(app) && /\.c13-admin-tag\{/.test(tpl), '2. a 🛠️ badge on its emblem');

// ---- 3. the decks
const fights = DG.nodes;
ok(fights.length === 2 && fights.every(f=> f.kind === 'skirmish'), '3. two skirmish fights');
const facs = fights.map(f=> f.faction).sort().join(',');
ok(facs === 'hummingbirds,otters', '3. one Otter deck, one Hummingbird deck: ' + facs);
const cards = JSON.parse(rd('canonical/cards.json')), byId = Object.fromEntries(cards.map(c=> [c.id, c]));
for(const f of fights){
  const p = C13.problems(f.faction, f.deck);
  ok(!p.length, `3. ${f.key} (${f.faction}) is legal and faction-pure: ${p.join('; ')}`);
  const tag = f.faction === 'otters' ? 'Otter' : 'Hummingbird', other = f.faction === 'otters' ? 'Hummingbird' : 'Otter';
  ok(Object.keys(f.deck).every(id=> byId[id] && (byId[id].archetypes || []).includes(tag) && !(byId[id].archetypes || []).includes(other) && !byId[id].token && !byId[id].test && !byId[id].unattainable && !byId[id].awaitingSource),
    `3. ${f.key}: every card is a ${tag} card in cards.json (and not ${other})`);
  ok(Object.keys(f.deck).length >= 5 && Object.keys(f.deck).length <= 7, `3. ${f.key}: 5-7 different cards (SK-3), ${Object.keys(f.deck).length}`);
  ok(f.enemyLevel === 1, `3. ${f.key}: a fixed Level 1`);
}
{ const rec = path.join(ROOT, 'docs', 'balance', 'content13', 'faction-decks-2026-11-07.json');
  ok(fs.existsSync(rec), '3. the optimiser run is recorded (docs/balance/content13/faction-decks-2026-11-07.json)');
  if(fs.existsSync(rec)){ const j = JSON.parse(fs.readFileSync(rec, 'utf8'));
    for(const f of fights){ const r = j.decks[f.faction] || {};
      ok(JSON.stringify(Object.entries(r.deck || {}).sort()) === JSON.stringify(Object.entries(f.deck).sort()), `3. ${f.key}: the game's deck is the optimiser's best (${f.faction})`);
      ok(r.seed === 'content13-' + f.faction && /--seed content13-/.test(r.reproduce || '') && /tools\/bench\/bench\.js deck/.test(r.reproduce || ''), `3. ${f.key}: its seed and reproduce command are recorded`); } } }

// ---- 4. no rewards
const REWARD_KEYS = ['firstCard', 'firstCards', 'rewardCards', 'rewards', 'rewardTokens', 'firstPack', 'firstFactionPack', 'firstOneCard', 'grantsItem', 'drops', 'reward', 'cardReward', 'eggChance', 'showcase'];
ok(fights.every(f=> REWARD_KEYS.every(k=> f[k] == null)), '4. no reward field on either fight');
ok(!DG.entry.after && !DG.entry.afterMapCleared && !DG.shieldMap, '4. no unlock gate tied to progress');
ok(/const c13Test = c13NodeIsAdminTest\(mapId\); if\(c13Test\)\{ if\(!c13AdminOn\(\)\) return false; if\(!\(opts && opts\.skipEnergyCost\)\) opts = Object\.assign\(\{\}, opts, \{skipEnergyCost: true\}\); \}/.test(app),
  '4. startConquestMatch: refused outside Admin Mode, no Energy');
ok(/if\(c13Test\) matchState\.adminTest = true;/.test(app), '4. startConquestMatch: a test fight (adminTest: no rewards, drops, XP, rank, progress)');
ok(/try\{ if\(!c13Test\) noteMapEnteredForReveal\(mapId\); \}/.test(app), '4. entering it reveals no skills');
ok(/matchState\.conquestNode && c13NodeIsAdminTest\(matchState\.conquestNode\.mapId\)\)\) matchState\.adminTest = true;/.test(app), '4. a resumed fight is still a test fight');
ok(/function completeConquestNode\(node, rank\)\{\n  if\(node && c13NodeIsAdminTest\(node\.mapId\)\) return;/.test(app), '4. completeConquestNode keeps no progress for it');
ok(/selectedNode\.pro \|\| c13NodeIsAdminTest\(map\.id\)/.test(app), '4. the panel\'s Fight costs 0 Energy');
ok(/c13NodeIsAdminTest\(map\.id\) \? `<p class="cnp-c13-note">/.test(app), '4. the panel shows the test-fight note instead of the reward strip');
ok(/function cnpDropsLineHTML\(mapId, node, done\)\{\n  if\(!node \|\| node\.kind === 'tutorial' \|\| node\.virtual \|\| c13NodeIsAdminTest\(mapId\)/.test(app), '4. no drop line');
ok(/c13NodeIsAdminTest\(map\.id\) \? '' \/\* 2026-11-07 \(CONTENT13\): the Drill Grounds pay nothing and keep no progress: no Edit rewards, no Mark cleared \*\/ : `<button type="button" class="btn small ghost" id="cnpEditRewards">/.test(app), '4. no Edit rewards / Mark cleared on its fights');
// adminTest is what the results code reads to pay nothing (unchanged): spot-check the guards are still there
ok(/m\.mode==='conquest' && m\.winner===1 && m\.conquestNode && !m\.adminTest && !m\.towerReplay\)/.test(app) && /heroAwardBattle\(m\)/.test(app), '4. the win path still skips progress and XP for adminTest fights');

// ---- 5. words and art
const KEYS = ['map.c13-name', 'map.c13-blurb', 'map.c13-entry', 'map.c13-1-name', 'map.c13-1-flavor', 'map.c13-2-name', 'map.c13-2-flavor', 'ui.c13-admin-tag', 'ui.c13-panel-note'];
ok(KEYS.every(k=> typeof T[k] === 'string' && T[k].length), '5. its TX keys: ' + KEYS.filter(k=> !T[k]).join(', '));
const CODES = ['fr', 'de', 'es', 'it', 'pt', 'tl', 'ta', 'id', 'zh-Hans', 'zh-Hant', 'ja', 'ko'];
for(const c of CODES){ const pack = JSON.parse(rd('lang/' + c + '.json')), miss = KEYS.map(k=> T[k]).filter(en=> !pack[en]);
  ok(!miss.length, `5. lang/${c}.json has every Drill Grounds text: ${miss.join(' | ')}`); }
ok(/"mdg": \("mtut",/.test(asm) && /"dg", "lb", "uc"/.test(asm) && /"muc","mdg"\]\)/.test(app), '5. its map art is derived in the build (MAP_ART_DERIVED) and listed in MAP_ART_IDS');

console.log(fail ? `content13: ${fail} of ${n} checks FAILED` : `content13: all ${n} checks passed`);
process.exit(fail ? 1 : 0);
