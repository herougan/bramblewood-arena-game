#!/usr/bin/env node
// 2026-10-23 (package HUB3, owner 19:27 + 19:36: "So what's our plan for, at the high level, how many base, how many skirmish exclusives,
// how many pack 1, pack 2, pack 3? ... Help me remember my definitions and log it in the master hub"): the data behind the hub's
// 📚 Progression plan tab. Reads the game itself (tools/lib_bramble.js evaluates arena_app.js: cardSourceOf, cardObtainMap,
// cardBaseLevel, CONQUEST_MAPS ...), canonical/cards.json, canonical/map-pools.json and canonical/unit-themes.json, and writes
//   docs/balance/progression-plan-2026-10-23.json
// with: every live card in the owner's buckets (tutorial base, base, skirmish base by pack tier, Pack 1/2/3, faction pool sides,
// Pack Secrets I candidates, quest specials ...) sorted by advancement (the map where it first becomes obtainable), the target vs
// actual counts (targets: docs/progression-plan.md), the leftover mistakes with a proposed fix (nothing is changed here; package RW5
// fixes data), the eggs / babies audit, the skills a player meets in Maps 0-1, the Ant cards by map, the faction cards outside the
// faction pool, the collection by Map 3 / 7 / 13 / 20 today and with "a pack of 3 + 1 faction pack at the end of each map", and the
// standard faction-reward pattern placed on the road (tools/faction_track_sim_2026_10_21.js --json gives where hand-outs happen).
//   node tools/progression_plan_2026_10_23.js [--out <file>] [--quiet]
'use strict';
const fs = require('fs'), path = require('path'), cp = require('child_process');
const ROOT = path.join(__dirname, '..');
const B = require(path.join(ROOT, 'tools', 'lib_bramble.js')), G = B.G, D = B.CARD_DEFS_BASELINE;
const args = process.argv.slice(2), opt = k=>{ const i = args.indexOf('--' + k); return i >= 0 ? args[i + 1] : null; };
const OUT = opt('out') || path.join(ROOT, 'docs', 'balance', 'progression-plan-2026-10-23.json');
const rd = rel=> JSON.parse(fs.readFileSync(path.join(ROOT, rel), 'utf8'));
// a literal const of arena_app.js (TX() calls answered with their key)
// eslint-disable-next-line no-eval
const ev = name=>{ const s = B.grab(name); const TX = k=> k; void TX; return eval('(' + s.slice(s.indexOf('=') + 1).trim().replace(/;\s*$/, '') + ')'); };

const RAW = rd('canonical/cards.json'), RAWBY = {}; RAW.forEach(c=> RAWBY[c.id] = c);
const POOLS = rd('canonical/map-pools.json').maps;
const UT = rd('canonical/unit-themes.json'), UTBY = {}; UT.units.forEach(u=> UTBY[u.id] = u);
const HUBC = fs.existsSync(path.join(ROOT, 'docs/balance/hub-cards.json')) ? rd('docs/balance/hub-cards.json') : {skills: []};
const SKL = {}; (HUBC.skills || []).forEach(s=> SKL[s.key] = s.label || s.key);
const STARTER = ev('STARTER_CFG_DEFAULT'), FIRST_PACK = ev('SKIRMISH_FIRST_PACK_CARDS'), REVEAL = ev('SKILL_REVEAL_MAP');
const FREE_PACKS = ev('MAP_FREE_PACKS'), POOL_COPIES = ev('FACTION_POOL_COPIES'), MAX_COPIES = ev('RARITY_MAX_COPIES');
const TUT_REWARDS = ev('TUTORIAL_REWARD_IDS');
const PACK_CARDS = {bronze: 3, silver: 5, gold: 8, mystery: 3}; // SHOP_PACKS_DEFAULT `cards`
const RARITY_ORDER = ['starter', 'common', 'uncommon', 'rare', 'veryrare', 'superrare', 'epic', 'heroic', 'unique', 'legendary', 'mythic', 'ancient'];
const rIdx = r=> { const i = RARITY_ORDER.indexOf(r || 'common'); return i < 0 ? 99 : i; };

// ---------- maps ----------
const ALL = G.CONQUEST_MAPS, MAIN = ALL.filter(m=> !m.sub && !m.reserved), byId = {}; ALL.forEach(m=> byId[m.id] = m);
const num = id=> G.mapNumberOf(id);
const unlockCache = {};
// A side map opens after its gate fight AND entry.afterMapCleared; its "unlock map" is the later of its parent and that map's own unlock.
function unlockNo(id, seen){
  if(unlockCache[id] != null) return unlockCache[id];
  const m = byId[id]; if(!m) return null; if(!m.sub) return (unlockCache[id] = num(id));
  seen = seen || new Set(); if(seen.has(id)) return num(m.parent); seen.add(id);
  const after = m.entry && m.entry.afterMapCleared, p = num(m.parent) || 0;
  return (unlockCache[id] = Math.max(p, after ? (unlockNo(after, seen) || 0) : p));
}
const maps = ALL.filter(m=> !m.reserved).map(m=> ({id: m.id, num: num(m.id), name: m.name, sub: !!m.sub, parent: m.parent || null, unlock: unlockNo(m.id),
  fights: (m.nodes || []).filter(n=> n.kind !== 'tutorial').length}));

// ---------- owner's pack tiers (item 15: Maps 0-6 Pack 1, 7-13 Pack 2, 13-20 Pack 3; 13 counted in Pack 2, see the plan's open question) ----------
const TIERS = [{key: 'p1', label: 'Pack 1', from: 0, to: 6}, {key: 'p2', label: 'Pack 2', from: 7, to: 13}, {key: 'p3', label: 'Pack 3', from: 14, to: 20}, {key: 'p4', label: 'After Map 20', from: 21, to: 999}];
const tierOf = n=> n == null ? null : (TIERS.find(t=> n >= t.from && n <= t.to) || TIERS[3]).key;

// where each card sits in the map pools: the earliest map (a side map counts from its unlock map)
const poolAt = {}, poolWhere = {};
const NOT_TIERING = new Set(['mtut', ...ALL.filter(m=> m.endless || m.tower).map(m=> m.id)]); // 2026-10-23 (RW5): the Tutorial side map (T-2/3/4 on Maps 1/8/18) and the endless dungeons hold every map's cards
Object.entries(POOLS).forEach(([mid, e])=>{
  const n = num(mid); if(n == null) return;
  const note = (id, at, where)=>{ if(NOT_TIERING.has(where)) return; if(poolAt[id] == null || at < poolAt[id]){ poolAt[id] = at; poolWhere[id] = where; } };
  (e.cards || []).forEach(id=> note(id, n, mid)); (e.special || []).forEach(id=> note(id, n, mid)); // + the map's SPECIAL list (RW5: a fight draws MAP + SPECIAL)
  Object.entries(e.submaps || {}).forEach(([sid, ids])=> ids.forEach(id=> note(id, unlockNo(sid) != null ? unlockNo(sid) : n, sid)));
});

// ---------- the tutorial's and the starting deck's cards ----------
const tutorialSet = new Set();
['starterShared', 'starterOtters', 'starterHummingbirds', 'starterBoth', 'starterFiller'].forEach(k=> Object.keys(STARTER[k] || {}).forEach(id=> tutorialSet.add(id)));
(STARTER.starterTopUp || []).forEach(id=> tutorialSet.add(id));
// 2026-10-23 (RW5): + the tutorial config the game ships (TUTORIAL_CFG_DEFAULT: the owner's live config folded in, e.g. the Cobalt-talon Fledgling in the Hummingbird deck)
const STARTER_CFG_DEFAULT = STARTER, TUTORIAL_SEED = 0; // what TUTORIAL_CFG_DEFAULT spreads
{ let TC = null; try{ TC = ev('TUTORIAL_CFG_DEFAULT'); }catch(e){ TC = null; } if(TC) ['starterShared', 'starterOtters', 'starterHummingbirds', 'starterBoth', 'starterFiller', 'myDeck', 'myDeck2', 'rivalDeck', 'rivalDeck2'].forEach(k=> Object.keys(TC[k] || {}).forEach(id=> tutorialSet.add(id))); }
const tutRewards = new Set([...(TUT_REWARDS || []), ...(STARTER.rewards || []), ...Object.values(STARTER.rewards2 || {}).flat(), STARTER.bothBonus].filter(Boolean));
let tutDecks = {}; try{ tutDecks = rd('docs/balance/decks.json').tutorial || {}; }catch(e){}
Object.values(tutDecks).forEach(parts=> parts.forEach(p=> [...(p.mine || []), ...(p.rival || [])].forEach(c=> tutorialSet.add(c.id))));

// ---------- cards ----------
const isLive = d=> d && !d.token && !d.test && !d.hidden && !d.field && !d.hallOfFame && !d.baseId;
const skillsOf = d=> Object.keys(d.effects || {}).filter(k=> SKL[k] || k === 'triggers').map(k=> k === 'triggers' ? 'trigger' : k);
const biomesOf = id=> (UTBY[id] && UTBY[id].biomes) || [];
const isLava = id=> biomesOf(id).includes('volcanic-ash');
const isAnt = d=> (d.archetypes || []).includes('Ants'); // the Ant type (the deck tools' Swarm-by-type reads archetypes)
const otterish = d=> (d.archetypes || []).includes('Otter') || d.animal === 'otter';
const hummingish = d=> (d.archetypes || []).includes('Hummingbird') || d.faction === 'hummingbirds';
const cards = [];
Object.values(D).forEach(d=>{
  if(!isLive(d)) return;
  const s = G.cardSourceOf(d) || {}, un = !!d.unattainable || G.isUnattainable && false;
  const raw = RAWBY[d.id] || {}, unatt = !!raw.unattainable, egg = !!(d.easterEgg || s.kind === 'easteregg');
  const tier = Number(s.tier) || (s.kind === 'pack' ? 1 : null);
  let first = null; try{ first = G.cardObtainMap(d); }catch(e){}
  const pm = poolAt[d.id] != null ? poolAt[d.id] : null;
  let bucket, adv;
  if(egg){ bucket = 'easteregg'; adv = null; }
  else if(s.kind === 'base'){ const tut = tutorialSet.has(d.id) || tutRewards.has(d.id) || d.rarity === 'starter'; bucket = d.id === 'wandering-traveller' ? 'base' : tut ? 'tutorialBase' : 'base'; adv = tut ? -1 : 0; }
  else if(s.kind === 'map'){ const at = num(s.id) != null ? Math.max(num(s.id), unlockNo(s.id) || 0) : first; bucket = 'skirmish-' + tierOf(at); adv = at; }
  else if(s.kind === 'pack' && tier === 11){ bucket = s.side === 'tribes' ? 'factionHummingbird' : s.side === 'shared' ? 'factionShared' : 'factionOtter'; adv = null; }
  else if(s.kind === 'pack' && tier === 99){ bucket = 'secrets'; adv = 13; }
  else if(s.kind === 'pack'){ const at = pm != null ? pm : (s.map ? num(s.map) : null); bucket = at == null ? 'pack-nomap' : 'pack-' + tierOf(at); adv = at != null ? at : first; }
  else if(s.kind === 'quest' || s.kind === 'secret'){ bucket = 'quest'; adv = s.id && num(s.id) != null ? num(s.id) : first; }
  else if(s.kind === 'nest'){ bucket = 'nest'; adv = 3; }
  else if(s.kind === 'raid'){ bucket = 'raid'; adv = 13; }
  else if(s.kind === 'smith' || s.kind === 'materia'){ bucket = s.kind; adv = 11; }
  else { bucket = 'unsorted'; adv = null; }
  cards.push({id: d.id, name: d.name, r: d.rarity || 'common', a: d.attack, h: d.health, w: d.wait || 0, c: d.cost || 0, sk: skillsOf(d),
    src: s.kind || '', tier, side: s.side != null ? s.side : undefined, sm: s.map || s.id || '', node: s.node || '', first, pool: pm, poolWhere: poolWhere[d.id] || '',
    bucket, adv, un: unatt, lvl: G.cardBaseLevel(d), fac: d.faction || '', biome: biomesOf(d.id), ant: isAnt(d) || undefined, lava: isLava(d.id) || undefined,
    otter: otterish(d) || undefined, hum: hummingish(d) || undefined});
});
const liveC = cards.filter(c=> !c.un && c.bucket !== 'easteregg');
const count = (b, list)=> (list || liveC).filter(c=> c.bucket === b).length;

// ---------- targets vs actual ----------
const T = [
  {key: 'factionOtter', label: 'Faction pool: Otter side', target: '~16', lo: 14, hi: 18},
  {key: 'factionHummingbird', label: 'Faction pool: Hummingbird side', target: '~16', lo: 14, hi: 18},
  {key: 'factionShared', label: 'Faction pool: shared', target: '10-20', lo: 10, hi: 20},
  {key: 'base', label: 'Base (not Tutorial base; incl. Wandering Traveller)', target: '≤ ~10', lo: 0, hi: 10},
  {key: 'tutorialBase', label: 'Tutorial base', target: 'no number (the tutorial and half of Map 0)', lo: null, hi: null},
  {key: 'pack-p1', label: 'Pack 1 (Maps 0-6)', target: '30', lo: 27, hi: 33},
  {key: 'skirmish-p1', label: 'Skirmish base, Maps 0-6', target: '15', lo: 13, hi: 17},
  {key: 'pack-p2', label: 'Pack 2 (Maps 7-13)', target: '30', lo: 27, hi: 33},
  {key: 'skirmish-p2', label: 'Skirmish base, Maps 7-13', target: '15', lo: 13, hi: 17},
  {key: 'pack-p3', label: 'Pack 3 (Maps 14-20)', target: '30', lo: 27, hi: 33},
  {key: 'skirmish-p3', label: 'Skirmish base, Maps 14-20', target: '15', lo: 13, hi: 17},
  {key: 'tavern', label: 'Tavern-unique', target: '15', lo: 15, hi: 15},
  {key: 'secrets', label: 'Pack Secrets I (Mystery Booster pool)', target: 'no number', lo: null, hi: null},
  {key: 'quest', label: 'Quest-only specials (10 / 15, Map 20)', target: 'no number', lo: null, hi: null},
  {key: 'pack-nomap', label: 'Pack pool cards with no map (no pack tier yet)', target: '0', lo: 0, hi: 0},
  {key: 'pack-p4', label: 'Pack cards after Map 20', target: '(Pack 4+, later)', lo: null, hi: null},
  {key: 'skirmish-p4', label: 'Skirmish base after Map 20', target: '(later)', lo: null, hi: null},
];
const targets = T.map(t=>{ const actual = count(t.key), planned = cards.filter(c=> c.un && c.bucket === t.key).length;
  const gap = t.lo == null ? null : actual < t.lo ? actual - t.lo : actual > t.hi ? actual - t.hi : 0;
  return Object.assign({}, t, {actual, unplaced: planned, gap}); });

// ---------- mistakes (proposed fixes only) ----------
// 2026-10-23 (package RW5): each mistake is re-checked against the files; `fixed` names the package that fixed it (the hub shows it ticked).
const mistakes = [], APP = B.src;
const add = (kind, what, fix, ids, fixed)=> mistakes.push({kind, what, fix, ids: ids || [], fixed: fixed || null});
const RW5 = 'RW5 (2026-10-23)';
const packAll = liveC.filter(c=> c.src === 'pack' && c.tier >= 1 && c.tier <= 4);
const SHOP = ev('SHOP_PACKS_DEFAULT'), shopPools = [...new Set(SHOP.filter(p=> ['bronze', 'silver', 'gold'].includes(p.id)).map(p=> p.pool || 1))];
const p1Lava = packAll.filter(c=> c.tier === 1 && c.lava), lateInP1 = packAll.filter(c=> c.tier === 1 && c.adv != null && c.adv > 6);
const tierNo = k=> ({p1: 1, p2: 2, p3: 3, p4: 4})[k];
const wrongTier = packAll.filter(c=> c.adv != null && c.bucket.startsWith('pack-p') && c.tier !== tierNo(c.bucket.slice(5)));
if(shopPools.length < 3 || p1Lava.length || lateInP1.length) add('packs', `The packs do not have their own pools by map: shop pools ${JSON.stringify(shopPools)}; ${lateInP1.length} Pack 1 cards belong to Maps 7+, ${p1Lava.length} of them volcanic.`, 'Give each pack its own pool by the owner tiers (Maps 0-6 → Pack 1, 7-13 → Pack 2, 14-20 → Pack 3; tools/rw5_pack_tiers_2026_10_23.js) and point SHOP_PACKS_DEFAULT pool at 1 / 2 / 3.', p1Lava.concat(wrongTier).map(c=> c.id));
else add('packs', `Each pack has its own pool by map (Pack 1 Maps 0-6: ${packAll.filter(c=> c.tier === 1).length} cards, Pack 2 Maps 7-13: ${packAll.filter(c=> c.tier === 2).length}, Pack 3 Maps 14-20: ${packAll.filter(c=> c.tier === 3).length}, after Map 20: ${packAll.filter(c=> c.tier === 4).length}); no volcanic card in Pack 1.`, 'Done: tools/rw5_pack_tiers_2026_10_23.js set source.tier; SHOP_PACKS_DEFAULT pools 1 / 2 / 3.', [], RW5);
const srcVsPool = packAll.filter(c=> c.sm && c.pool != null && unlockNo(c.sm) != null && tierOf(unlockNo(c.sm)) !== tierOf(c.pool));
add('packs', srcVsPool.length ? `${srcVsPool.length} pack cards name a source map whose pack tier differs from where map-pools.json first puts them (held by RW5: re-pointing them puts them over budget; re-fit them or take them out of the early side map's pool) (a side map counts from the map that unlocks it, owner: "Submap cards are found in the Pack tier following the maps that unlock them").` : 'Every pack card\'s source map and its first map pool agree on the pack tier (the Tutorial side map and the endless dungeons do not place cards).',
  'Re-point source.map to the pool map (or move the card in map-pools.json), then re-tier.', srcVsPool.map(c=> c.id), srcVsPool.length ? null : RW5);
const noPool = packAll.filter(c=> c.bucket === 'pack-nomap');
add('packs', noPool.length ? `${noPool.length} live pack-pool cards are in no map pool and name no map, so they have no pack tier.` : 'Every live pack card has a map (the 39 without one got a map by theme: tools/rw5_pack_tiers_2026_10_23.js NOMAP).', 'Place each in a map pool (canonical/map-pools.json) and give it source.map, or retire it.', noPool.map(c=> c.id), noPool.length ? null : RW5);
const poolOnlySrc = packAll.filter(c=> c.bucket !== 'pack-nomap' && c.pool == null);
add('packs', poolOnlySrc.length ? `${poolOnlySrc.length} live pack cards name a source map but are in no map pool (map-pools.json), so no fight of that map uses them.` : 'Every live pack card that names a map is in that map\'s pool.', 'Add them to their map\'s pool, or re-point source.map.', poolOnlySrc.map(c=> c.id), poolOnlySrc.length ? null : RW5);
const humBase = liveC.filter(c=> c.src === 'base' && c.fac === 'hummingbirds' && !tutorialSet.has(c.id) && !tutRewards.has(c.id) && !(RAWBY[c.id] || {}).awaitingSource); // RW5: a card awaiting the owner's placement is not one
add('faction', humBase.length ? `${humBase.length} Hummingbird faction cards come "from the start" as Base (no source, unlocked), outside the faction pool.` : 'The Hummingbird faction cards that came "from the start" as Base are in the faction pool (side tribes); the Cobalt-talon Fledgling stays Base (the Hummingbird starting deck).', 'Give them source {kind:pack, tier:11, side:tribes} (faction pool) unless they are the Hummingbird starter cards.', humBase.map(c=> c.id), humBase.length ? null : RW5);
const baseNonTut = liveC.filter(c=> c.bucket === 'base');
const junkId = c=> /-[a-z0-9]{4}$/.test(c.id) && /\d/.test(c.id.slice(-4));
add('base', `Base (not tutorial) holds ${baseNonTut.length} cards; the owner's target is about 10 or fewer.`, 'Move the non-starter Base cards with skills (and the Rare/Uncommon ones) to the faction pool, a skirmish reward or Pack 1; keep the plain Map 0 animals as Tutorial base.', baseNonTut.map(c=> c.id), baseNonTut.length <= 10 && !baseNonTut.some(junkId) ? RW5 : null);
const outside = liveC.filter(c=> (c.otter || c.hum) && !c.bucket.startsWith('faction') && c.bucket !== 'tutorialBase' && c.bucket !== 'unsorted'); // RW5: an unsorted card (awaiting a source) is not obtainable
const outO = outside.filter(c=> c.otter).length, outH = outside.filter(c=> c.hum).length;
add('faction', `Outside the faction pool there are ${outO} Otter-type and ${outH} Hummingbird-type cards (owner 19:36: only 1-2 neutral otters and 1-2 traitor / neutral hummingbirds).`, 'Keep 1-2 of each as named neutrals / traitors; move the rest into the faction pool (or rename them out of the faction).', outside.map(c=> c.id), outO <= 2 && outH <= 2 ? RW5 : null);
const rw5Pool = /const FACTION_POOL_RW5 = true;/.test(APP), rw5Pattern = /const FACTION_STANDARD_PATTERN = \[/.test(APP);
add('faction', 'The faction pool held your side + shared cards only (factionCardsOfMine); the owner\'s pool holds both sides ("that\'s how you would get the other faction\'s cards").', rw5Pool ? 'Done: factionPoolCardIds (both sides + shared; your side weighted x3, shared x2, the other side x1).' : 'factionCardsOfMine: both sides + shared, the other side\'s cards weighted lower or later on the pattern.', [], rw5Pool ? RW5 : null);
add('faction', `Pool copies per card were FACTION_POOL_COPIES ${JSON.stringify(POOL_COPIES)}; the owner's rule is "pool size = the most duplicates you can hold in a deck" (RARITY_MAX_COPIES: common ${MAX_COPIES.common}, uncommon ${MAX_COPIES.uncommon}, rare ${MAX_COPIES.rare}, very rare ${MAX_COPIES.veryrare}, super rare ${MAX_COPIES.superrare}).`, rw5Pool ? 'Done: factionPoolCopiesOf reads maxCopiesForRarity.' : 'Read the copies from maxCopiesForRarity (Super Rare 2 → 1).', [], rw5Pool ? RW5 : null);
add('faction', 'No Base cards were in the faction pool ("add 1 of each base card inside as well").', rw5Pool ? 'Done: factionPoolBaseIds, 1 copy of each Base card.' : 'loadFactionPool: 1 copy of each Base card in the pool too.', [], rw5Pool ? RW5 : null);
add('faction', 'The standard faction reward was a weighted random draw behind rarity gates, not the fixed C, C, C, U, C, C, U, C, U, R ... pattern.', rw5Pattern ? 'Done: set rewards follow FACTION_STANDARD_PATTERN (factionPatternRarity; R skipped before Map 14, PP-2); random rewards (tokens, faction packs) keep the gates.' : 'A fixed pattern table (see the pacing check) and "set" vs "random" faction rewards as two hand-out kinds.', [], rw5Pattern ? RW5 : null);
const sec = cards.filter(c=> c.bucket === 'secrets');
if(sec.length && sec.every(c=> c.un)) add('packs', `All ${sec.length} Mystery Booster (pool 99) cards are unattainable, so the Mystery Booster / future Pack Secrets I pool is empty in play.`, 'Clear `unattainable` on the ones ready, then make it the Pack Secrets I pool (a <1% slot in Packs 1-6).', sec.map(c=> c.id));
const isBaby = c=> /baby|hatchling|chick|kit$|-kit\b|pup|cub|fledgling|duckling|calf/i.test(c.id) && !/^egg-/.test(c.id);
const lvl0Bad = liveC.filter(c=> c.lvl === 0 && c.bucket !== 'tutorialBase' && !isBaby(c)), tu2Off = /const FACTION_COPY_LEVEL0 = false;/.test(APP);
add('level', lvl0Bad.length || !tu2Off ? `${lvl0Bad.length} cards outside Tutorial base and the babies start at Level 0 (${lvl0Bad.map(c=> c.name).join(', ')})${tu2Off ? '' : ', and since TU2 every new faction copy comes at Level 0'}; the owner (PP-3): only the tutorial base units and the baby cards start at 0.` : 'Only the tutorial base and the babies start at Level 0 (PP-3: the Bee Knight and Forager Ant start at 1; the Sparrow Chick is a baby); TU2\'s faction Level 0 copies are off (FACTION_COPY_LEVEL0).', 'cardBaseLevel: 0 only for tutorial base (and babies); undo TU2\'s faction Level 0 copies.', lvl0Bad.map(c=> c.id), lvl0Bad.length || !tu2Off ? null : RW5);
const collector = /ui\.rw5-collector-pack/.test(APP);
add('naming', 'The advanced packs were "Advanced <pack>" (advancedPackOf); the owner calls them Collector packs.', 'Rename to "Collector <pack>" (TX key + 12 language packs).', [], collector ? RW5 : null);
add('naming', 'The game calls faction:"base" cards and skirmish rewards "Base" (UT, 2026-10-19: "Base cards just mean they come from Skirmish rewards"); the owner now says Skirmish base for skirmish rewards and Base for the starting cards.', 'Rename the Codex sections and cardWhereToGetText lines.', []);
const junk = liveC.filter(junkId);
add('naming', junk.length ? `${junk.length} cards carry a junk id suffix from a live card (${junk.map(c=> c.id).join(', ')}).` : 'No card id carries a junk suffix (ember-tetra-3caj is ember-tetra, a Pack 3 card of the Ashen Spurn).', 'Rename the id (and skip the old live row).', junk.map(c=> c.id), junk.length ? null : RW5);

// ---------- eggs and babies ----------
const eggCards = cards.filter(c=> /^egg-/.test(c.id)).map(c=> Object.assign({}, c, {hatch: RAWBY[c.id].hatchInto || null}));
const babyCards = cards.filter(c=> /baby|hatchling|chick|kit$|-kit\b|pup|cub|fledgling|duckling|calf/i.test(c.id) && !/^egg-/.test(c.id));
const eggs = {
  eggCards: eggCards.map(c=> ({id: c.id, name: c.name, r: c.r, src: c.src, un: c.un, lvl: c.lvl, wait: c.w, hatchInto: c.hatch})),
  babyCards: babyCards.map(c=> ({id: c.id, name: c.name, r: c.r, src: c.src, bucket: c.bucket, un: c.un, lvl: c.lvl})),
  facts: [
    'Egg items (EGG_KINDS, 7 kinds) drop from first clears (2-20% by fight kind), 0.1% per Energy on repeats, 1% from raids; Map 1\'s 1-3 and Map 3 each guarantee one. They sit in "🥚 Eggs in your pack" (the Nest picker\'s first section) until set in a nest; they hatch in 6-10 h into a random Common-Rare map or pack card of their type, at Level 0 (a "hatchling"), and the 🌱 Train section raises it to Level 1 for Kibble, Dust and Maple Leaves.',
    'Egg cards (egg-woodland ... egg-beast) are different: a collection card given once when you first set that kind of egg in a nest (grantEggCardFor). They are playable (0 Attack, Wait 5-10) and crack open in battle into a random card of their type when Ready (engine hatchEggCard). They start at Level 1 and level like any card. They never show in the Nest\'s first section (that lists egg items and Level-0 cards).',
    'Babies today are Nest items, not cards: a 6% "rescue" after any won Conquest fight (rollBabyRescue) gives a baby of the deck\'s main type; it grows in 4 h into a random card of that type at Level 0 (+2 Kibble), which the Nest then trains to Level 1.',
    'The "baby" cards in the card list (Baby Bat, Baby Horned Capybara, Caiman Hatchling, Duckling, Otter Kit, Fox Kit, Rabbit Kit, Terrier Pup ...) are ordinary pack, skirmish or base cards: they do not hatch or change, start at Level 1 (pack) or 0 (base) and Forge to 10.',
  ],
  inconsistencies: [
    'Owner: babies drop like eggs, hatch / change into something else, and can never reach Level 1. Today no card behaves like that: the baby cards are normal cards that level to 10, and the Nest\'s "hatchlings" (Level 0 cards from eggs and rescued babies) are exactly what the Nest trains to Level 1.',
    'Owner: "I don\'t see them in Raise or Hatch, the first section." Egg cards and baby cards never appear in the Nest picker: its first section lists egg ITEMS, its second only Level-0 copies. An egg card is Level 1 at once; a baby card is Level 1 (pack) or a base card at 0.',
    'Owner: "you can play Eggs and babies". Egg cards: yes (they crack open in battle). Baby cards: yes, as ordinary units. Rescued babies and egg items: no (items).',
    'Two of the egg-like cards are unattainable (Snapper Hatchling, Fire Drake Hatchling; the Red Dragon Egg is the Scale Trail quest\'s and unattainable), and Nest Hatchling has no source.',
  ],
  proposal: 'A "Baby" card kind (cardType baby): dropped like an egg (same rates), shown in the Nest\'s first section next to egg items, playable at Level 0, cannot be trained or Forged, and grows into a named card (hatchInto.defId) or a random card of its type after N hours in a nest. Rename the Nest\'s two sections "Hatch" (eggs and babies) and "Raise" (Level-0 tutorial base cards to Level 1).',
};

// ---------- skills a player meets in Maps 0-1 ----------
const sides = ['otters', 'hummingbirds', 'both'];
function skillUse(ids){ const m = {}; ids.forEach(id=>{ const d = D[id]; if(!d) return; skillsOf(d).forEach(k=> (m[k] = m[k] || new Set()).add(d.name)); }); return m; }
const enemyIds = mid=> [...new Set((byId[mid].nodes || []).filter(n=> n.kind !== 'tutorial').flatMap(n=> Object.keys(n.deck || {})))];
const rewardIds = mid=> (byId[mid].nodes || []).flatMap(n=> [...G.nodeRewardCardIds(mid, n.key), FIRST_PACK[mid + ':' + n.key]].filter(Boolean));
let starterDecks = {}; try{ const EB = require(path.join(ROOT, 'tools', 'eb_early_road_2026_10_23.js')); sides.forEach(s=> starterDecks[s] = EB.starterDeck(s)); }catch(e){ starterDecks = {}; }
const tutIds = [...new Set(Object.values(tutDecks).flatMap(parts=> parts.flatMap(p=> [...(p.mine || []), ...(p.rival || [])].map(c=> c.id))))];
const groups = {tutorial: tutIds, starter: [...new Set(Object.values(starterDecks).flatMap(o=> Object.keys(o)))], map0enemy: enemyIds('m1'), map0rewards: rewardIds('m1'), map1enemy: enemyIds('mf'), map1rewards: rewardIds('mf')};
const seen = {}; Object.entries(groups).forEach(([g, ids])=> Object.entries(skillUse(ids)).forEach(([k, names])=>{ seen[k] = seen[k] || {key: k, label: SKL[k] || (k === 'trigger' ? 'Triggered ability' : k), where: {}}; seen[k].where[g] = [...names]; }));
const skillsSeen = Object.values(seen).map(s=> Object.assign(s, {hidden: REVEAL[s.key] ? `"?" until Map ${REVEAL[s.key].from}${REVEAL[s.key].tutorials ? ' (shown in the tutorials)' : ''}` : ''})).sort((a, b)=> Object.keys(b.where).length - Object.keys(a.where).length);

// ---------- Ant cards by map ----------
const ants = liveC.filter(c=> c.ant).map(c=> ({id: c.id, name: c.name, r: c.r, bucket: c.bucket, adv: c.adv, sk: c.sk})).sort((a, b)=> (a.adv == null ? 99 : a.adv) - (b.adv == null ? 99 : b.adv));
const antsUnplaced = cards.filter(c=> c.ant && c.un).map(c=> ({id: c.id, name: c.name, r: c.r, bucket: c.bucket}));

// ---------- faction-reward hand-outs on the road and the standard pattern ----------
let track = null; try{ track = JSON.parse(cp.execFileSync('node', [path.join(ROOT, 'tools', 'faction_track_sim_2026_10_21.js'), '--json'], {encoding: 'utf8', maxBuffer: 1 << 26})); }catch(e){ track = null; }
const PATTERN = ['common', 'common', 'common', 'uncommon', 'common', 'common', 'uncommon', 'common', 'uncommon', 'rare']; // owner: C, C, C, U, C, C, U, C, U, R, ...
// The pattern read two ways. A: the 10-step block repeats with the whole block one rarity up once that rarity's copies run out (pool-driven).
// B: the literal block repeats as written, the 10th step of block k one rarity higher each time (R, VR, SR ...).
function poolModel(pool){ // pool: {rarity: copies}; returns the reward number at which each rarity first comes out
  const ladder = ['common', 'uncommon', 'rare', 'veryrare', 'superrare', 'epic'], left = {}, first = {}, seq = [];
  ladder.forEach(r=> left[r] = pool[r] || 0); // higher rarities (held back on the road) are left out
  let n = 0, shift = 0, guard = 0; const total = Object.values(left).reduce((a, b)=> a + b, 0);
  while(n < total && n < 400 && guard++ < 200){ for(const p of PATTERN){ let i = Math.min(ladder.length - 1, ladder.indexOf(p) + shift); while(i < ladder.length && !(left[ladder[i]] > 0)) i++; if(i >= ladder.length){ i = ladder.findIndex(r=> left[r] > 0); if(i < 0) break; }
      const r = ladder[i]; left[r]--; n++; seq.push(r); if(first[r] == null) first[r] = n; }
    if(!(left[ladder[shift]] > 0)) shift++; if(Object.values(left).every(v=> !(v > 0))) break; }
  return {first, total, seq};
}
function literalModel(n){ const ladder = ['rare', 'veryrare', 'superrare', 'epic', 'heroic']; const first = {}; for(let i = 1; i <= n; i++){ const k = Math.floor((i - 1) / 10), p = PATTERN[(i - 1) % 10]; const r = p === 'rare' ? ladder[Math.min(k, ladder.length - 1)] : p; if(first[r] == null) first[r] = i; } return first; }
const recvByMap = track ? track.perMap.concat(track.projected || []).map(x=> ({map: x.map, received: x.received})) : [];
const mapAt = k=> { const r = recvByMap.find(x=> x.received >= k); return r ? r.map : null; };
const poolNow = side=>{ const o = {}; liveC.filter(c=> c.bucket === 'factionShared' || c.bucket === (side === 'otters' ? 'factionOtter' : 'factionHummingbird') || c.bucket === (side === 'otters' ? 'factionHummingbird' : 'factionOtter'))
  .forEach(c=>{ const r = c.r === 'starter' ? 'common' : c.r; o[r] = (o[r] || 0) + (MAX_COPIES[r] || 1); }); return o; };
const poolTarget = ()=>{ const o = {common: 0, uncommon: 0, rare: 0, veryrare: 0, superrare: 0}; // 16 + 16 + 15 shared, an assumed split per 16: 7 C, 5 U, 3 R, 1 VR (shared 6 / 5 / 3 / 1)
  [[7, 5, 3, 1], [7, 5, 3, 1], [6, 5, 3, 1]].forEach(([c, u, r, v])=>{ o.common += c * MAX_COPIES.common; o.uncommon += u * MAX_COPIES.uncommon; o.rare += r * MAX_COPIES.rare; o.veryrare += v * MAX_COPIES.veryrare; }); return o; };
const pacing = [], BEYOND = 99; // a reward number past the road's projection (Map 60) counts as "never"
const mapOr = k=> { const m = mapAt(k); return m == null ? BEYOND : m; };
const verdictOf = (first, lastUMap, dryMap)=>{ const hi = Object.keys(first).filter(r=> rIdx(r) >= rIdx('veryrare')).map(r=> first[r].map).filter(m=> m != null && m < BEYOND);
  const early = hi.length ? Math.min(...hi) : null, v = [];
  if(early != null && early <= 15) v.push('too few cards: Very Rare or higher by Map ' + early);
  if(lastUMap != null && lastUMap >= 17) v.push('too many: Uncommons still come at Map ' + (lastUMap >= BEYOND ? '60+' : lastUMap));
  if(dryMap != null && dryMap < BEYOND && dryMap <= 20) v.push('the pool runs dry at Map ' + dryMap);
  return v.join('; ') || 'inside the owner\'s window (no Very Rare by 15, past Uncommon by 17)'; };
const poolOwner = (own, other)=>{ const o = {}; [[7, 5, 3, 1, own], [7, 5, 3, 1, other], [6, 5, 3, 1, own]].forEach(([c, u, r, v, k])=>{ o.common = (o.common || 0) + c * k; o.uncommon = (o.uncommon || 0) + u * k; o.rare = (o.rare || 0) + r * k; o.veryrare = (o.veryrare || 0) + v * Math.min(k, 2); }); return o; };
[['today\'s live faction cards (both sides + shared), copies = deck cap', poolNow('otters')],
 ['owner target pool (16 + 16 + 15 shared; assumed 7 C / 5 U / 3 R / 1 VR per 16), copies = deck cap', poolTarget()],
 ['owner target pool, "1-2x of each": 2 of your side and shared, 1 of the other side', poolOwner(2, 1)]].forEach(([label, pool])=>{
  const m = poolModel(pool), at = {}; Object.entries(m.first).forEach(([r, k])=> at[r] = {reward: k, map: mapOr(k)});
  const lastU = m.seq.lastIndexOf('uncommon') + 1, lastUMap = lastU ? mapOr(lastU) : null, dry = mapOr(m.total);
  pacing.push({label, pool, copies: m.total, first: at, lastUncommon: lastU ? {reward: lastU, map: lastUMap} : null, dryAt: {reward: m.total, map: dry}, verdict: verdictOf(at, lastUMap, dry)}); });
const lit = literalModel(80), litAt = {}; Object.entries(lit).forEach(([r, k])=> litAt[r] = {reward: k, map: mapOr(k)});
pacing.push({label: 'literal pattern (the block of 10 repeats, its 10th step one rarity up each block: R, VR, SR ...)', first: litAt, verdict: verdictOf(litAt, null, null)});
// 2026-10-23 (package RW5): the rules as built, walked on the road (tools/rw5_faction_pacing_2026_10_23.js: the game's factionPatternRarity and
// factionTrackPick, median of 20 seeds), with and without the end-of-map faction pack (MAP_END_PACKS, an owner call).
let rw5Pacing = null; try{ rw5Pacing = require(path.join(ROOT, 'tools', 'rw5_faction_pacing_2026_10_23.js')); }catch(e){ rw5Pacing = null; }
if(rw5Pacing) ['otters', 'hummingbirds'].forEach(side=> [true, false].forEach(endPacks=>{ const r = rw5Pacing.summary({side, seeds: 20, endPacks});
  pacing.push({label: `RW5 as built, ${side}${endPacks ? ', end-of-map faction packs on' : ', without the end-of-map faction packs'} (median of 20 seeds)`, live: true, side, endPacks, pool: r.pool.byRarity, copies: r.pool.copies,
    first: {rare: {map: r.median.firstRare}, veryrare: {map: r.median.firstVeryRarePlus}}, lastUncommon: {map: r.median.lastUncommonSet}, dryAt: {map: r.median.dryAt}, receivedBy: r.receivedBy, verdict: r.verdict}); }));
// how many hand-outs a map the window needs: the 20th reward (the literal pattern's first Very Rare) after Map 15
const handoutsByMap15 = (recvByMap.find(x=> x.map === 15) || {}).received || null;

// ---------- the collection by Map 3 / 7 / 13 / 20, today and with a pack of 3 + 1 faction pack after each map ----------
const DROP = {skirmish: 0.01, elite: 0.03, champion: 0.03, miniboss: 0.03, dungeon: 0.03, subboss: 0.05, boss: 0.06, finalboss: 0.09};
const starterN = starterDecks.otters ? Object.values(starterDecks.otters).reduce((a, b)=> a + b, 0) : 20, starterU = starterDecks.otters ? Object.keys(starterDecks.otters).length : 20;
const collection = [];
let acc = {reward: 0, firstPack: 0, freePack: 0, faction: 0, bossGift: 0, drop: 0, fights: 0}, prop = 0;
MAIN.forEach((m, i)=>{
  const ns = (m.nodes || []).filter(n=> n.kind !== 'tutorial' && n.deck);
  ns.forEach(n=>{ acc.fights++; acc.reward += G.nodeRewardCardIds(m.id, n.key).length; if(FIRST_PACK[m.id + ':' + n.key]) acc.firstPack++; acc.drop += DROP[G.baseKind(n.kind || 'skirmish')] || 0.01; });
  if(FREE_PACKS[i]) acc.freePack += PACK_CARDS[FREE_PACKS[i]] || 3;
  acc.bossGift += 1; prop += 3 + 3;
  const rec = (recvByMap.find(x=> x.map === i) || {}).received || 0;
  if([3, 7, 13, 20].includes(i)){ const today = starterN + acc.reward + acc.firstPack + acc.freePack + rec + acc.bossGift + Math.round(acc.drop);
    collection.push({map: i, name: m.name, fights: acc.fights, starter: starterN, starterUnique: starterU, skirmishRewards: acc.reward, firstClearPackCards: acc.firstPack, freePackCards: acc.freePack, factionRewards: rec, bossBaseGifts: acc.bossGift, drops: Math.round(acc.drop * 10) / 10,
      today, notStarter: today - starterN, withProposal: today + prop, proposalAdds: prop}); }
});

// ---------- by advancement ----------
const byAdv = liveC.slice().sort((a, b)=> (a.adv == null ? 999 : a.adv) - (b.adv == null ? 999 : b.adv) || rIdx(a.r) - rIdx(b.r) || a.name.localeCompare(b.name))
  .map(c=> ({id: c.id, name: c.name, r: c.r, bucket: c.bucket, adv: c.adv, first: c.first, pool: c.pool, where: c.poolWhere || c.sm, sk: c.sk, lvl: c.lvl, lava: c.lava, ant: c.ant}));

const out = {generated: new Date().toISOString().slice(0, 10), tool: 'node tools/progression_plan_2026_10_23.js', doc: 'docs/progression-plan.md',
  about: 'Owner\'s progression plan (2026-10-23 19:27 / 19:36): targets vs today, by advancement, leftover mistakes, eggs and babies, Map 0-1 skills, Ants, faction pacing, collection by map. Nothing in the game was changed.',
  tiers: TIERS, maps, targets, mistakes, eggs, skillsSeen, groups: Object.fromEntries(Object.entries(groups).map(([k, v])=> [k, v.length])),
  ants: {live: ants, unplaced: antsUnplaced, byTier: Object.fromEntries(['tutorialBase', 'base', 'p1', 'p2', 'p3', 'p4', 'faction'].map(t=> [t, ants.filter(a=> a.bucket === t || a.bucket.endsWith('-' + t) || (t === 'faction' && a.bucket.startsWith('faction'))).length]))},
  outsideFaction: outside.map(c=> ({id: c.id, name: c.name, r: c.r, bucket: c.bucket, kind: c.otter ? 'otter' : 'hummingbird', src: c.src})),
  factionTrack: track ? {everyWins: track.everyWins, receivedByMap15: handoutsByMap15, perMap: recvByMap.filter(x=> x.map <= 30)} : null, pacing, collection,
  cards: byAdv};
fs.writeFileSync(OUT, JSON.stringify(out, null, 1) + '\n');
if(!args.includes('--quiet')){
  console.log('targets:'); targets.forEach(t=> console.log(' ', t.label.padEnd(52), String(t.target).padEnd(10), 'now', String(t.actual).padStart(3), t.unplaced ? `(+${t.unplaced} unplaced)` : '', t.gap ? 'gap ' + t.gap : ''));
  console.log('mistakes:', mistakes.length); mistakes.forEach(m=> console.log(' -', m.what.slice(0, 150)));
  console.log('pacing:'); pacing.forEach(p=> console.log(' ', p.label, JSON.stringify(p.first), p.lastUncommon ? 'lastU ' + JSON.stringify(p.lastUncommon) : '', '->', p.verdict));
  console.log('collection:'); collection.forEach(c=> console.log(' ', JSON.stringify(c)));
  console.log('ants:', ants.length, JSON.stringify(out.ants.byTier), 'unplaced', antsUnplaced.length);
  console.log('skills seen Maps 0-1:', skillsSeen.map(s=> s.label + (s.hidden ? '*' : '') + '[' + Object.keys(s.where).join(',') + ']').join('; '));
  console.log('->', path.relative(ROOT, OUT));
}
