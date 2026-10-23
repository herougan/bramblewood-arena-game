#!/usr/bin/env node
// Package RW5 (2026-10-23, owner notes 19:27 items 10, 11, 13, 14, 15, 16, 18 and the 19:36 addendum; PP-1..3 defaults):
//   1. packs by map: every live basic-pack card has a map and the tier of the map where it is first found (Pack 1 Maps 0-6, 2 7-13, 3 14-20,
//      4 after; a side map from the map that unlocks it), no volcanic card in Pack 1, the three packs read pools 1 / 2 / 3, the data
//      mistakes HUB3 listed are fixed (the hub's JSON marks them), the 8 Hummingbirds in the faction pool, ember-tetra-3caj renamed;
//   2. the faction pool and the standard pattern: factionPatternRarity (C,C,C,U,C,C,U,C,U,R; R skipped before Map 14, PP-2; climbs when a
//      rarity runs out), both sides + 1 of each Base card, copies = the deck cap, set vs random rewards, the tutorial's 3 + 3;
//   3. the pacing check (tools/rw5_faction_pacing_2026_10_23.js) is current and the first Rare comes no earlier than Map 14;
//   4. PP-3: only tutorial base + babies start at Level 0 (Bee Knight, Forager Ant at 1; the Sparrow Chick at 0); TU2's faction Level 0 off;
//   5. Collector packs, Refine +10%, the Raid Ticket's price (more Leaves + Gold Leaves), the guild items for owners only and the guild shop,
//      2× from Map 0 kept across fights with its banner, 3/4/5× at 20/40/60, the admin resource buttons, the pack summary's named level-ups,
//      the end-of-map pack of 3 + faction pack and new cards first;
//   6. the texts are TX keys with a row in all 12 language packs.
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
const rd = rel=> fs.readFileSync(path.join(ROOT, rel), 'utf8');
let fail = 0, checks = 0; const ok = (c, m)=>{ checks++; if(!c){ fail++; console.log('  ✗', m); } };
const app = rd('arena_app.js');
const B = require(path.join(ROOT, 'tools', 'lib_bramble.js')), G = B.G;
const cards = JSON.parse(rd('canonical/cards.json')), byId = {}; cards.forEach(c=> byId[c.id] = c);
const pools = JSON.parse(rd('canonical/map-pools.json')).maps;
const UT = JSON.parse(rd('canonical/unit-themes.json')), BIO = {}; UT.units.forEach(u=> BIO[u.id] = u.biomes || []);

// ---- 1. packs by map
const live = c=> !c.pool && !c.token && !c.test && !c.unattainable && !c.awaitingSource && !c.easterEgg;
const basic = cards.filter(c=> live(c) && c.source && c.source.kind === 'pack' && +c.source.tier >= 1 && +c.source.tier <= 4);
const mapById = {}; G.CONQUEST_MAPS.forEach(m=> mapById[m.id] = m);
const unlock = id=>{ const m = mapById[id]; if(!m) return null; if(!m.sub) return G.mapNumberOf(id); const a = m.entry && m.entry.afterMapCleared; return Math.max(G.mapNumberOf(id) || 0, a ? unlock(a) || 0 : 0); };
const tierOf = n=> n <= 6 ? 1 : n <= 13 ? 2 : n <= 20 ? 3 : 4;
ok(basic.length > 150, `1. live basic-pack cards (${basic.length})`);
const noMap = basic.filter(c=> !c.source.map); ok(!noMap.length, '1. every live basic-pack card has a map: ' + noMap.slice(0, 5).map(c=> c.id).join(', '));
const badTier = basic.filter(c=> c.source.map && tierOf(unlock(c.source.map)) !== +c.source.tier); ok(!badTier.length, '1. every card\'s tier is its map\'s (0-6 / 7-13 / 14-20 / later): ' + badTier.slice(0, 5).map(c=> c.id + ' ' + c.source.tier + '@' + c.source.map).join(', '));
const lava1 = basic.filter(c=> +c.source.tier === 1 && (BIO[c.id] || []).includes('volcanic-ash') && c.id !== 'ember-tetra' /* 2026-10-23 (EN4, owner 23:45: "Ember Tetra can be a pack 1."): a small fish of the Sunken Hollow; its 'ember' name reads volcanic */); ok(!lava1.length, '1. no volcanic card in Pack 1: ' + lava1.map(c=> c.id).join(', '));
ok(G.mapUnlockNumberOf && G.mapUnlockNumberOf('mo') === 21 && G.mapUnlockNumberOf('m3') === 19 && G.mapUnlockNumberOf('ms') === 13, '1. mapUnlockNumberOf: a side map counts from its unlock (the Old Bramble 21, the Sunken Grove 13)');
const shop = (()=>{ const s = B.grab('SHOP_PACKS_DEFAULT'); return eval('(' + s.slice(s.indexOf('=') + 1).trim().replace(/;\s*$/, '') + ')'); })(); // eslint-disable-line no-eval
ok(JSON.stringify(['bronze', 'silver', 'gold'].map(id=> (shop.find(p=> p.id === id) || {}).pool)) === '[1,2,3]', '1. the Hedgerow Pouch, Tidemire Chest and Highcrest Case read pools 1 / 2 / 3');
ok(/const PACK_TIER_POOL = \{bronze:1, silver:2, gold:3\};/.test(app) && /if\(PACK_TIER_POOL\[o\.id\] && \(\+o\.pool \|\| 1\) === 1\) o\.pool = PACK_TIER_POOL\[o\.id\];/.test(app), '1. an old pack edit that says pool 1 reads as the pack\'s own pool (normalizePack)');
ok(/const BASIC_PACK_TIERS = \[1, 2, 3, 4\];/.test(app) && /function baseTrackPool\(\)\{ return packCardPool\(getCardDefs\(\), 'basic', true, true\); \}/.test(app) && /packCardPool\(defs, 'basic', false, true \/\* RW3: a drop keeps/.test(app), '1. the base track and the drop read every pack tier (pool \'basic\', gated)');
['gold-throated-acolyte', 'violet-vane-fletcher', 'sunthroat-courier', 'voidfeather-scout', 'crimson-wing-duelist-cadet', 'cobalt-talon-skirmisher', 'dominion-nestguard'].forEach(id=> ok(byId[id] && byId[id].source && byId[id].source.tier === 11 && byId[id].source.side === 'tribes', `1. ${id} is in the faction pool (Hummingbird side)`));
ok(!byId['cobalt-talon-fledgling'].source, '1. the Cobalt-talon Fledgling stays Base (the Hummingbird starting deck)');
ok(!byId['greyplume-fledgling'].source && byId['greyplume-fledgling'].awaitingSource, '1. the Greyplume Fledgling still awaits the owner (awaitingSource)');
ok(byId['ember-tetra'] && !byId['ember-tetra-3caj'] && /'ember-tetra-3caj': 'ember-tetra'/.test(app), '1. ember-tetra-3caj is ember-tetra (the live row skipped: CARD_ID_RENAMED)');
ok(fs.existsSync(path.join(ROOT, 'supabase/proposed/20261023_rw5_clear_ember_tetra.sql')), '1. the clearing SQL is proposed, not applied');
const inSomePool = new Set(); Object.values(pools).forEach(e=>{ (e.cards || []).concat(e.special || [], ...Object.values(e.submaps || {})).forEach(id=> inSomePool.add(id)); });
const notInPool = basic.filter(c=> !inSomePool.has(c.id));
ok(!notInPool.length, '1. every live pack card is in a map pool: ' + notInPool.slice(0, 5).map(c=> c.id + '@' + c.source.map).join(', '));
const PP = JSON.parse(rd('docs/balance/progression-plan-2026-10-23.json'));
const fixed = PP.mistakes.filter(m=> m.fixed).length, open = PP.mistakes.filter(m=> !m.fixed).map(m=> m.what.slice(0, 50));
ok(fixed >= 12 && open.length <= 3, `1. the hub's mistakes list marks RW5's fixes (${fixed} fixed; open: ${open.join(' | ')})`);
ok((PP.outsideFaction || []).filter(c=> c.kind === 'otter').length <= 2 && (PP.outsideFaction || []).filter(c=> c.kind === 'hummingbird').length <= 2, '1. outside the faction pool: at most 2 otters and 2 hummingbirds');
const hold = /const BUDGET_HOLD = new Set\(\[([^\]]*)\]\)/.exec(rd('tools/rw5_pack_tiers_2026_10_23.js')); ok(hold && (hold[1].match(/'[a-z-]+'/g) || []).length === 10, '1. ten cards held at their source map (re-pointing puts six over budget; four are a map\'s first-clear pack card): listed for the owner');

// ---- 2. the faction pool and the standard pattern
const slice = (a, b)=>{ const i = app.indexOf(a), j = app.indexOf(b, i); return app.slice(i, j); };
const defs = {}; cards.filter(c=> !c.pool).forEach(c=> defs[c.id] = c);
const T = new Function('getCardDefs', 'isEquipmentDef', 'isEasterEgg', 'copiesOwned', 'trackMapReached', 'loadFactionPool', 'saveFactionPool', 'factionReward', 'conquestMapCleared',
  slice('// ROAD_RARITY:BEGIN', '// ROAD_RARITY:END') + slice('// FACTION_REWARD_TRACK:BEGIN', '// FACTION_REWARD_TRACK:END') + '\nreturn {FACTION_STANDARD_PATTERN, FACTION_PATTERN_RARE_FROM_MAP, factionPatternRarity, FACTION_SIDE_WEIGHT, factionClimbWant};')(
  ()=> defs, ()=> false, ()=> false, ()=> 0, ()=> 0, ()=> ({received: 0}), ()=>{}, ()=> null, ()=> false);
ok(T.FACTION_STANDARD_PATTERN.join(',') === 'common,common,common,uncommon,common,common,uncommon,common,uncommon,rare', '2. the standard pattern is C,C,C,U,C,C,U,C,U,R');
ok(T.FACTION_PATTERN_RARE_FROM_MAP === 14, '2. PP-2: the pattern\'s R waits for Map 14');
const full = {common: 50, uncommon: 40, rare: 10, veryrare: 2};
const seq = (map, n, left)=>{ const out = []; let step = 0; for(let i = 0; i < n; i++){ const r = T.factionPatternRarity(step, map, left || full, {sides: []}); out.push(r.rarity); step += r.steps; } return out; };
ok(seq(0, 10).join(',') === 'common,common,common,uncommon,common,common,uncommon,common,uncommon,common', '2. before Map 14 the 10th step (R) is skipped: ' + seq(0, 10).join(','));
ok(seq(14, 10)[9] === 'rare' && seq(14, 10).slice(0, 9).every(r=> r === 'common' || r === 'uncommon'), '2. from Map 14 the 10th reward is a Rare');
ok(seq(14, 4, {common: 0, uncommon: 9, rare: 9, veryrare: 0}).join(',') === 'uncommon,uncommon,uncommon,rare', '2. no Commons left: the block climbs one rarity (C->U, U->R)');
ok(seq(5, 3, {common: 0, uncommon: 0, rare: 9}).every(r=> r === null), '2. before Map 14 a pool with only Rares left gives nothing by the pattern (the gated random draw takes over)');
ok(seq(15, 2, {common: 0, uncommon: 0, rare: 0, veryrare: 4}).every(r=> r === null), '2. Very Rare still waits for its gate (Map 20 and the Volcano Lair)');
ok(T.factionClimbWant('own', 0, 5) === 2 && T.factionClimbWant('own', 2, 3) === 0 && T.factionClimbWant('other', 0, 5) === 1 && T.factionClimbWant('base', 0, 1) === 1 && T.factionClimbWant('own', 1, 0) === 0, '2. factionClimbWant: 2 of your side, 1 of the other side and of Base, never past the copies left');
ok(/const FACTION_POOL_RW5 = true;/.test(app) && /return fac\.concat\(factionPoolBaseIds\(defs\)/.test(app) && /maxCopiesForRarity\(d\.rarity === 'starter' \? 'common' : d\.rarity\)/.test(app), '2. the pool: both sides + shared + 1 of each Base card; copies = the deck cap');
ok(/run:\(\)=> factionRandomReward\(\)/.test(app) && /factionPackPoolPick\(list, rnd, got\.length\)/.test(app), '2. random faction rewards: the 🎁 token and a faction pack\'s own cards (out of the pool)');
ok(/const FACTION_CLIMB_HOLD = \{own:2, shared:2, other:1, base:1\};/.test(app) && /factionClimbWant\(factionSideOf\(defs\[id\]\)/.test(app), '2. climbing the rarity tree: the pattern moves on once you hold 2 of your side\'s cards (1 of the other side\'s)');
ok(/const TUTORIAL_FACTION_REWARDS = \[3, 3\];/.test(app) && /return tutorialFactionRewards\(1, forGrant\)/.test(app) && /return tutorialFactionRewards\(2, forGrant\)/.test(app), '2. the tutorial pays faction rewards x3, then x3 again');

// ---- 3. pacing
const PC = JSON.parse(rd('docs/balance/rw5-faction-pacing-2026-10-23.json'));
ok(PC.results && PC.results.length === 6, '3. the pacing check ran for both sides: as built, without the end-of-map faction pack, and with the released cards only');
const built = PC.results.filter(r=> r.endPacks && !r.releasedOnly);
ok(built.length === 2 && built.every(r=> r.median.lastUncommonSet != null && r.median.lastUncommonSet < 17 && (r.median.firstVeryRarePlus == null || r.median.firstVeryRarePlus > 15)), '3. as built the standard rewards land in the owner\'s window (past Uncommons by Map 17, below Very Rare at 15): ' + built.map(r=> r.side + ' last U ' + r.median.lastUncommonSet + ', first VR+ ' + r.median.firstVeryRarePlus).join('; '));
ok(PC.results.every(r=> r.median.firstRare == null || r.median.firstRare >= 14), '3. the first Rare comes no earlier than Map 14 (PP-2): ' + PC.results.map(r=> r.median.firstRare).join(', '));
ok(PC.results.every(r=> r.median.firstVeryRarePlus == null || r.median.firstVeryRarePlus > 15), '3. no Very Rare or higher by Map 15');
ok((PP.pacing || []).some(p=> p.live), '3. the hub\'s pacing table has the as-built rows');

// ---- 4. PP-3
ok(G.cardBaseLevel(byId['bee-knight']) === 1 && G.cardBaseLevel(byId['forager-ant']) === 1, '4. the Bee Knight and Forager Ant start at Level 1');
ok(G.cardBaseLevel(byId['sparrow-chick']) === 0 && G.cardBaseLevel(byId['earthworm']) === 0, '4. the Sparrow Chick (a baby) and the tutorial base stay at Level 0');
ok(/const FACTION_COPY_LEVEL0 = false;/.test(app) && /if\(!FACTION_COPY_LEVEL0 \|\| !copyModelOn\(\)\) return;/.test(app), '4. TU2\'s faction Level 0 copies are off');
ok(/tutorialCopyKeepsLevel\(id\)\) return; \/\/ 2026-10-23 \(package RW5, PP-3\)/.test(app), '4. a faction card from the tutorial keeps its level');

// ---- 5. the rest
ok(/name: TX\('ui\.rw5-collector-pack', \{name: p\.name\}\)/.test(app), '5. Collector packs');
const refine = /const REFINE_COST_MULT = ([\d.]+);/.exec(app); ok(refine && +refine[1] === 1.1, '5. Refine (the foil ladder) costs 10% more');
const rt = /const RAID_TICKET_ITEM_COST = \{gold:(\d+), gems:(\d+)\};/.exec(app); ok(rt && +rt[1] > 300 && +rt[2] > 0, '5. the Raid Ticket costs more Maple Leaves and some Gold Leaves');
ok(/function shopTicketOnShelf\(\)\{ return adminModeEnabled \|\| \(tabOpen\('guild'\) && ownsGuild\(\)\); \}/.test(app), '5. the Rename Ticket (guild management) is on the Shop only for a guild owner');
ok(/guildShopPanelHTML\(\) \/\* 2026-10-23 \(RW5\) \*\//.test(app) && /function wireGuildShop\(root\)/.test(app), '5. the guild page has its own guild shop');
const sp = new Function(B.grab('SPEED_GATES') + '\nconst SPEED_2X_MAP = 0;\n' + B.grab('speedStepsFor') + '\nreturn speedStepsFor;')();
ok(JSON.stringify(sp({firstWin: true, firstElite: false, cleared: n=> n <= 0})) === '[1,1.5,2,0.5]', '5. 2× opens with Map 0 cleared (one map earlier than the first elite)');
ok(JSON.stringify(sp({firstWin: true, firstElite: false, cleared: ()=> false})) === '[1,1.5,0.5]', '5. not before');
ok(JSON.stringify(sp({firstWin: true, cleared: n=> n <= 40})) === '[1,1.5,2,3,4,0.5]', '5. 3× and 4× at Maps 20 and 40');
ok(/const SPEED_2X_MAP = 0, SPEED_KEEP_ALWAYS = true/.test(app) && /function speedKeeps\(\)\{ if\(SPEED_KEEP_ALWAYS\) return true;/.test(app), '5. the chosen speed is kept from fight to fight');
ok(/try\{ speedUnlockBanner\(m, ffBtn\); \}catch\(e\)\{\}/.test(app) && /TX\('ui\.rw5-speed-unlocked', \{speed: sp\}\)/.test(app), '5. "2× unlocked!" in the next fight');
ok(/const ADMIN_RESOURCE_MAX = 99999;/.test(app) && /id="adminResMax"/.test(app) && /id="adminResZero"/.test(app), '5. Admin: every resource to 99,999, and to 0');
ok(/bits\.push\(packLevelUpsHTML\(levels, defs\)\)/.test(app), '5. the pack summary names the cards its free level-ups went to');
ok(/const MAP_END_PACKS = true, MAP_END_PACK_CARDS = 3;/.test(app) && /function grantMapEndPacks\(idx\)/.test(app) && /const REWARD_NEW_FIRST = true;/.test(app), '5. the end of each map: a pack of 3 (new cards first) + a faction pack (owner call, on)');
ok(/if\(opts && opts\.newFirst\)\{ const fresh = left\.filter/.test(app) && !/rollPackCards\(pack, \{/.test(app.slice(app.indexOf('function buyPack'), app.indexOf('function buyPack') + 4000)), '5. new cards first only in reward packs (a bought pack stays random)');
const dec = JSON.parse(rd('docs/decisions.json')), ids = dec.items.map(x=> x.id);
ok(['PP-1', 'PP-2', 'PP-3'].every(id=> { const x = dec.items.find(x=> x.id === id) || {}; return x.built || x.status === 'DONE'; }), '5. PP-1..3 say their defaults are built (or the owner decided; PP-2 owner 10-23 22:23)');
ok(dec.items.some(x=> /^RW5-/.test(x.id) && /end of each map|end-of-map/i.test(x.title || '')), '5. the end-of-map packs are an owner call in decisions.json');

// ---- 6. texts
const TXT = rd('bramblewood-texts.js');
const keys = ['ui.rw5-collector-pack', 'ui.rw5-end-pack', 'ui.rw5-speed-unlocked', 'ui.rw5-speed-unlocked-tip', 'ui.rw5-admin-res-max', 'ui.rw5-admin-res-zero', 'ui.rw5-guild-shop', 'ui.rw5-pack-levels', 'ui.rw5-cx-pack', 'ui.rw5-shop-sub', 'ui.rw5-need-gold-leaves'];
const en = {}; keys.forEach(k=>{ const m = new RegExp('"' + k.replace(/[.]/g, '\\.') + '": "((?:[^"\\\\]|\\\\.)*)"').exec(TXT); en[k] = m ? JSON.parse('"' + m[1] + '"') : null; ok(!!en[k], '6. ' + k + ' is a TX key'); });
['fr', 'de', 'es', 'it', 'pt', 'tl', 'ta', 'id', 'zh-Hans', 'zh-Hant', 'ja', 'ko'].forEach(code=>{ const pk = JSON.parse(rd('lang/' + code + '.json')), miss = keys.filter(k=> en[k] && !pk[en[k].replace(/^(💰|🧹) /u, '')]); /* a leading emoji is peeled in the packs */ ok(!miss.length, `6. lang/${code}.json has the RW5 texts: ` + miss.join(', ')); });

console.log(`rw5-2026-10-23: ${checks - fail}/${checks} checks passed`);
process.exit(fail ? 1 : 0);
