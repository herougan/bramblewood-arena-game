#!/usr/bin/env node
// Easter eggs (2026-10-19, package EE, owner 09:52: "Easter eggs: Special category, ungettable atm."):
//   1. the category: EASTER_EGG_IDS (arena_app.js, the one list) and the cards' easterEgg flag / source {kind:'easteregg'} agree;
//      the eight cards are there with their rarities, original names, an animal field, placeholder emoji and budget v3 notes;
//   2. no source can produce one: cardObtainableFrom / isUnattainable say no; the pack pools (every pool), the card drop, the
//      skirmish rewards, the reward tracks, the raid cards and the Forge's fuse leave them out even when an egg is given that source;
//      unlockCardForPlayer refuses them from every source but an admin's grant; the engine's egg hatch (the Nest's egg cards) never
//      hatches one;
//   3. seen-gated: the Codex draws an unseen one as a masked "???" tile; the hub's card list masks it too;
//   4. Evomax: the Evolution archetype's player-facing label is Evomax (internal id 'evolution'); Terraumbra is its card.
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const ROOT = path.join(__dirname, '..');
const H = require('./lib/harness.js'), E = H.Engine;
let fail = 0, n = 0; const ok = (c, m)=>{ n++; if(!c){ fail++; console.log('  ✗', m); } };
const read = rel=> fs.readFileSync(path.join(ROOT, rel), 'utf8');
const src = read('arena_app.js'), cards = JSON.parse(read('canonical/cards.json'));
const fnSrc = name=>{ const i = src.indexOf(`\nfunction ${name}(`); if(i < 0) throw new Error('no function ' + name); let d = 0; const j = src.indexOf('{', i);
  for(let k = j; k < src.length; k++){ const ch = src[k]; if(ch === '{') d++; else if(ch === '}'){ d--; if(!d) return src.slice(i, k + 1); } } throw new Error('unbalanced ' + name); };
const constSrc = name=>{ const m = src.match(new RegExp('\\nconst ' + name + ' = [^\\n]*')); if(!m) throw new Error('no const ' + name); return m[0]; };

// ---- 1. the category
const listM = src.match(/const EASTER_EGG_IDS = (\[[^\]]*\]);/); ok(listM, 'EASTER_EGG_IDS is in arena_app.js');
const LIST = listM ? JSON.parse(listM[1].replace(/'/g, '"')) : [];
const flagged = cards.filter(c=> c.easterEgg || (c.source && c.source.kind === 'easteregg')).map(c=> c.id);
ok(LIST.length >= 8 && LIST.every(id=> flagged.includes(id)) && flagged.every(id=> LIST.includes(id)), `the list and the flagged cards agree (list ${LIST.join(', ')}; flagged ${flagged.join(', ')})`);
const byId = Object.fromEntries(cards.map(c=> [c.id, c]));
const WANT = {creeper:'veryrare', terraumbra:'unique', 'exo-podas':'veryrare', 'galactic-condor':'epic', 'pink-maus':'unique', nyoogle:'superrare'};
Object.entries(WANT).forEach(([id, r])=> ok(byId[id] && byId[id].rarity === r, `${id} is ${r} (got ${byId[id] && byId[id].rarity})`));
LIST.forEach(id=>{ const c = byId[id]; if(!c) return ok(false, id + ' exists');
  ok(c.easterEgg === true && c.source && c.source.kind === 'easteregg', `${id}: easterEgg flag and source easteregg`);
  ok(typeof c.animal === 'string' && c.animal, `${id}: has an animal field`);
  ok(c.icon && !c.art, `${id}: a placeholder emoji, no art yet`);
  ok(/package EE/.test(c.creatorNote || '') && /N = [\d.]+; S = /.test(c.creatorNote), `${id}: creatorNote shows the budget`);
  ok(c.locked === true, `${id}: locked`); });
ok(byId.terraumbra && byId.terraumbra.mechanicLine === 'evolution' && byId.terraumbra.cardType === 'equipment', 'Terraumbra: an Evomax (evolution) equipment card');
ok(byId['galactic-condor'] && byId['galactic-condor'].effects.charge.do.do === 'positionBeam', 'the Galactic Condor charges a positionBeam');
// the last cards of the file are the new ones (they go at the end)
ok(cards.slice(-7).every(c=> LIST.includes(c.id)), 'the seven new Easter eggs sit at the end of cards.json');
// names: no source-game names (the internal ids may carry the owner's names)
const BANNED = /terraprisma|colossus|protoss|thor\b|moogle|tonberry|pink bean|tabasco|demoman|minecraft|terraria|starcraft|final fantasy|maplestory|team fortress/i;
ok(LIST.every(id=> !BANNED.test(byId[id].name + ' ' + byId[id].flavor)), 'names and flavour are original (no source game or character named)');
// budget v3
{ const SC = require(path.join(ROOT, 'tools', 'skill_costs.js')), T = SC.make(JSON.parse(read('canonical/skill-costs.json')));
  LIST.forEach(id=>{ const c = Object.assign({}, byId[id]); if(c.cardType === 'equipment') c.effects = Object.assign({}, c.effects, (c.equip || {}).grant); const b = T.budget(c);
    ok(b.ok && !b.missing.length, `${id} fits budget v3 (x1 ${b.x1} < N ${b.N}, x2 ${b.x2} < ${b.N2}${b.missing.length ? '; missing ' + b.missing : ''})`); }); }

// ---- 2. no source can produce one
const defs = {};
cards.filter(c=> !c.pool).forEach(c=>{ defs[c.id] = Object.assign({}, c); delete defs[c.id].art; });
// each egg also gets a twin that pretends to have a real source, so the check is the egg rule itself, not just its source kind
const kinds = [{kind:'pack', tier:1}, {kind:'pack', tier:11}, {kind:'pack', tier:99}, {kind:'map', id:'m1', node:'n1'}, {kind:'raid', id:'r1'}, {kind:'nest'}, {kind:'base'}, {kind:'smith'}];
LIST.forEach((id, i)=>{ defs[id + '~src'] = Object.assign({}, defs[id], {id: id + '~src', derivedFrom: id, source: kinds[i % kinds.length]}); });
const isEggId = id=> LIST.includes(String(id).replace(/~src$/, ''));
const granted = [];
const ctx = {defs, getCardDefs: ()=> defs, liveCards: {}, CARD_DEFS_BASELINE: defs, adminModeEnabled: false, codexShowUnseen: false, TUTORIAL_REWARD_IDS: [],
  pitchingUnlocked: ()=> true, hofBlocked: ()=> false, SPELLS_SHELVED: true, BASIC_PACK_POOLS: [1], baseKind: k=> k, CONQUEST_MAPS: [{id:'m1', nodes:[{key:'n1', deck:Object.fromEntries(LIST.map(id=> [id, 1]))}]}],
  myCardCopies: {}, myUnlockedCardIds: new Set(), copiesOwned: ()=> 0, maxCopiesForRarity: ()=> 4, trackMapReached: ()=> 99, TRACK_STAGES: ['common', 'uncommon', 'rare'], TRACK_LATE: ['veryrare', 'superrare'], TRACK_LATE_MAP: 10,
  unlockCardForPlayer: id=>{ granted.push(id); return true; }, seenCardIds: ()=> new Set(), Math, Object, Set, JSON, String, Number, Array, out: {}};
vm.createContext(ctx);
const pieces = [constSrc('EASTER_EGG_IDS'), constSrc('EASTER_EGG_GRANT_SOURCES'), constSrc('UNATTAINABLE_ADMIN_SOURCES'), constSrc('CARD_DROP_CHANCE'),
  ...['isEasterEgg', 'easterEggSeen', 'easterEggMasked', 'easterEggMaskDef', 'cardSourceOf', 'cardObtainableFrom', 'isUnattainable', 'isEquipmentDef', 'packPoolOf', 'packCardPool', 'cardDropRarity', 'rollCardDrop', 'nodeRewardCardIds', 'trackPick', 'raidCardIds'].map(fnSrc)];
vm.runInContext(pieces.join('\n') + '\nout.f = {isEasterEgg, cardObtainableFrom, isUnattainable, packCardPool, rollCardDrop, nodeRewardCardIds, trackPick, raidCardIds, easterEggMasked, easterEggMaskDef};', ctx);
const F = ctx.out.f;
const eggDefs = Object.keys(defs).filter(isEggId);
ok(eggDefs.length === LIST.length * 2, `every egg and its sourced twin is in play (${eggDefs.length})`);
ok(eggDefs.every(id=> F.isEasterEgg(defs[id])), 'isEasterEgg knows every egg, by list, flag or source');
ok(eggDefs.every(id=> F.cardObtainableFrom(defs[id]) === null && F.isUnattainable(defs[id])), 'cardObtainableFrom: none (so isUnattainable)');
ok(!F.isEasterEgg(defs['musk-ox-calf']) && F.cardObtainableFrom(defs['musk-ox-calf']) === 'pack', 'an ordinary pack card is untouched');
[0, 1, 11, 99].forEach(pool=> [false, true].forEach(exact=>{ const ids = F.packCardPool(defs, pool, exact); ok(ids.length > 0 && !ids.some(isEggId), `pack pool ${pool}${exact ? ' (exact)' : ''}: no Easter egg (${ids.filter(isEggId)})`); }));
{ const node = ctx.CONQUEST_MAPS[0].nodes[0]; let got = 0; const r0 = Math.random; Math.random = ()=> 0; try{ for(let i = 0; i < 20; i++){ const id = F.rollCardDrop(node, 'm1', {kind:'raidWin'}); if(id) got++; } }finally{ Math.random = r0; }
  ok(!granted.some(isEggId) && got === 0, `card drops: an all-egg enemy deck drops nothing (${granted.filter(isEggId)})`); }
ok(!F.nodeRewardCardIds('m1', 'n1').some(isEggId), 'skirmish rewards: none');
{ const pool = eggDefs.concat(['musk-ox-calf']); let bad = 0; for(let i = 0; i < 50; i++){ const id = F.trackPick(pool, ()=> (i % 10) / 10); if(isEggId(id)) bad++; } ok(!bad, 'reward tracks (faction / base / growth): never an egg'); }
ok(!F.raidCardIds({id:'r1'}).some(isEggId), 'raid cards: none');
ok(/!isEasterEgg\(defs\[x\]\)[^\n]*\['pack','map'\]\.includes\(cardSourceOf\(defs\[x\]\)\.kind\)/.test(src), "the Forge's fuse pool leaves them out");
{ const i = src.indexOf('const SMITH_RECIPES = ['), rec = src.slice(i, src.indexOf('\n];', i)); ok(i > 0 && /out:\s*'/.test(rec) && LIST.every(id=> !rec.includes(`'${id}'`)), 'no Blacksmith recipe makes one'); }
// unlockCardForPlayer: refused from every source but an admin's grant
{ const calls = []; const uctx = {CARD_DEFS_BASELINE: defs, liveCards: {}, out: {}, UNATTAINABLE_ADMIN_SOURCES: new Set(), pitchingUnlocked: ()=> true, loadPitchHeld: ()=> [], PITCH_HELD_KEY: 'x', localStorage: {setItem(){}},
    isUnattainable: ()=> false, grantCardCopy: id=> calls.push(id), noteSighted: ()=>{}, noteGainedForSwap: ()=>{}, myUnlockedCardIds: new Set(), saveUnlockedCardIds: ()=>{}, getCardDefs: ()=> defs, logTxn: ()=>{},
    CARD_UNLOCK_SOURCES: {}, canLeadDef: ()=> false, loadDialogueFlags: ()=> ({}), setTimeout: ()=>{}, Set, Object, JSON, String};
  vm.createContext(uctx);
  vm.runInContext([constSrc('EASTER_EGG_IDS'), constSrc('EASTER_EGG_GRANT_SOURCES'), fnSrc('isEasterEgg'), fnSrc('unlockCardForPlayer')].join('\n') + '\nout.u = unlockCardForPlayer;', uctx);
  const SOURCES = ['shopPack', 'factionPack', 'reward', 'conquestReward', 'conquestRareFind', 'bossBaseGift', 'cardDrop', 'raid', 'smith', 'fuse', 'nest', 'egg', 'tavern', 'market', 'progressTrack', 'baseGrowth', 'promotion', 'tutorialReward', 'tutorialBonus', 'secret', 'quest', 'scaleTrail', 'materia', 'errand', 'test', 'sandbox', undefined];
  LIST.forEach(id=> SOURCES.forEach(s=> ok(uctx.out.u(id, s) === false, `unlockCardForPlayer refuses ${id} from ${s}`)));
  ok(!calls.length, `no copy was granted (${calls.join(', ')})`);
  ok(uctx.out.u('galactic-condor', 'adminGrant') === true && calls.includes('galactic-condor'), "an admin's grant still works"); }
// the engine's egg hatch (the Nest's egg cards hatch on the board): never an Easter egg
{ const e = E.makeSimEngine(H.loadCardDefs(), E.mulberry32(1), {});
  const pool = e.eggPoolFor({hatchInto:{any:true}, rarity:'mythic'}); ok(pool.length > 20 && !pool.some(d=> LIST.includes(d.id)), `egg hatch pool: no Easter egg (${pool.filter(d=> LIST.includes(d.id)).map(d=> d.id)})`); }

// ---- 3. seen-gated: "???" until seen
ok(F.easterEggMasked(defs['galactic-condor']), 'an unseen egg is masked');
ctx.myUnlockedCardIds.add('galactic-condor'); ok(!F.easterEggMasked(defs['galactic-condor']), 'once owned (or seen) it shows'); ctx.myUnlockedCardIds.delete('galactic-condor');
ctx.adminModeEnabled = true; ctx.codexShowUnseen = true; ok(!F.easterEggMasked(defs['galactic-condor']), "an admin with 👁 Show unseen sees it whole"); ctx.adminModeEnabled = false; ctx.codexShowUnseen = false;
{ const m = F.easterEggMaskDef(defs['galactic-condor']); ok(m.name === '???' && !Object.keys(m.effects).length && m.id !== 'galactic-condor' && !m.art, 'the mask tile: "???", no skills, no art, not the card id (opens nothing)'); }
{ const g = fnSrc('renderCodexGrid'); ok(/easterEggMasked\(d\)/.test(g) && /easterEggMaskDef\(d\)/.test(g) && /isEasterEgg\(defs\[id\]\)/.test(g), 'the Codex grid draws unseen eggs as the mask, always as a slot');
  ok(/codexFilter\.q \|\| codexSkillsChosen\(\)\.length\) ids = ids\.filter\(id=> !easterEggMasked/.test(g), 'a masked egg never matches a search or skill filter'); }
{ const hub = read('tools/hub/export_decks.py'); ok(/egg/.test(hub) && /'\?\?\?'/.test(hub), "the hub's card list masks Easter eggs as ???"); }

// ---- 4. Evomax
ok(/const MECH_LINE_LABEL = \{[^}]*evolution:TX\('ui\.arch-evomax'\)/.test(src) && /evolution:\[TX\('ui\.arch-evomax'\),'🧬'\]/.test(src), 'MECH_LINE_LABEL and CARD_ARCHETYPE_MARK say Evomax');
const TEXT = require(path.join(ROOT, 'bramblewood-texts.js')).TEXT;
ok(TEXT['ui.arch-evomax'] === 'Evomax', 'TX ui.arch-evomax = Evomax');
ok(!/>Evolution<|'Evolution'\]|evolution:'Evolution'/.test(src), 'no player-facing "Evolution" label is left');

console.log(`easter-eggs: ${n} checks, ${fail} failure(s)`);
process.exit(fail ? 1 : 0);
