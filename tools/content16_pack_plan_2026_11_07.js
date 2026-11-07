#!/usr/bin/env node
// 2026-11-07 (package CONTENT16, owner 09:10: "Make sure the packs ROUGHLY contain what you think they should contain, then maybe up to 20 other
// recommended cards that sound 'basic' that allows build up in later parts of the game, and also thematic to the zones they cover ... Some of the
// cards will be pack-unique ... Some of the cards will be skirmish-unique ... Some cards will be ACHIEVEMENT specific"; ENG27-9: the Crimson Wing
// Drumcaller goes in a Sunfeather faction pack). Writes canonical/pack-plan.json: the zones, each pack's current cards (what the game builds today,
// through tools/lib_bramble.js: packIndex / basicPackTierOf / cardSourceOf), the proposal (adds, removes, moves, achievement cards) and a source for
// every live card, today and under the proposal. A PROPOSAL only: no card, pack, map list or reward is changed.
//   node tools/content16_pack_plan_2026_11_07.js            regenerate the current contents, sources and issues; keep the proposal in the file
//   node tools/content16_pack_plan_2026_11_07.js --reseed   rewrite the proposal from SEED below (first run, or to throw away hand edits)
//   node tools/content16_pack_plan_2026_11_07.js --check    print the summary only, write nothing
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..'), OUT = path.join(ROOT, 'canonical', 'pack-plan.json');
const B = require(path.join(ROOT, 'tools', 'lib_bramble.js')), G = B.G;
const SC = require(path.join(ROOT, 'tools', 'skill_costs.js'));
const T = SC.make(JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical', 'skill-costs.json'), 'utf8')));
const cards = JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical', 'cards.json'), 'utf8')), byId = {}; cards.forEach(c=> byId[c.id] = c);
const review = JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical', 'map-review.json'), 'utf8'));
const args = process.argv.slice(2);

// ---- the live cards (the same rule is written in _about.liveCards and used by tests/content16-2026-11-07.js)
function isLive(c){ return !!c && !c.pool && !c.token && !c.test && !c.field && c.cardType !== 'spell' && c.cardType !== 'materia' && !c.easterEgg && !(c.source && c.source.kind === 'easteregg'); }
const LIVE = cards.filter(isLive).map(c=> c.id);
const defs = B.CARD_DEFS_BASELINE;

// ---- the starting deck, as the game builds it (starterDeckParts for each tutorial pick), and the faction pool's Base cards
const starterFns = new Function('getCardDefs', [
  'const TUTORIAL_SEED = 0;',
  ...['DECK_SIZE', 'STARTER_SHOWN', 'PG_STARTER_TOP_UP', 'STARTER_CFG_DEFAULT', 'TUTORIAL_CFG_DEFAULT', 'TUTORIAL_FACTION_REWARDS', 'starterTopUpList', 'starterDeckTarget', 'starterDeckParts', 'cardBaseLevel'].map(B.grab),
  'return {starterDeckParts, cardBaseLevel, STARTER_CFG_DEFAULT, TUTORIAL_CFG_DEFAULT};'].join('\n'))(()=> defs);
const STARTER = {}; ['otters', 'hummingbirds', 'both'].forEach(p=> STARTER[p] = Object.keys(starterFns.starterDeckParts(p).all));
const STARTER_SET = new Set([].concat(...Object.values(STARTER)));
const TUT_BASE = new Set(); [starterFns.STARTER_CFG_DEFAULT, starterFns.TUTORIAL_CFG_DEFAULT].forEach(cfg=>{
  ['starterShared', 'starterOtters', 'starterHummingbirds', 'starterBoth', 'starterFiller', 'myDeck', 'myDeck2', 'rivalDeck', 'rivalDeck2'].forEach(k=> Object.keys(cfg[k] || {}).forEach(id=> TUT_BASE.add(id)));
  (cfg.starterTopUp || []).forEach(id=> TUT_BASE.add(id)); });
const TUT_REWARD_IDS = new Set(eval(B.grab('TUTORIAL_REWARD_IDS').replace(/^const TUTORIAL_REWARD_IDS = /, '').replace(/;[^]*$/, '')));
// factionPoolBaseIds (arena_app.js): Base source, not a tutorial reward, not Starter rarity, base Level above 0, not the tutorial base
function inFactionPoolAsBase(d){ const s = G.cardSourceOf(d); return s.kind === 'base' && !s.tutorialReward && d.rarity !== 'starter' && starterFns.cardBaseLevel(d) > 0 && !TUT_REWARD_IDS.has(d.id) && !TUT_BASE.has(d.id) && !d.hero && d.cardType !== 'equipment'; }

// ---- the first-clear pack cards (SKIRMISH_FIRST_PACK_CARDS) and the maps
const FIRST = eval('(' + B.grab('SKIRMISH_FIRST_PACK_CARDS').replace(/^const SKIRMISH_FIRST_PACK_CARDS = /, '').replace(/;\s*$/, '') + ')');
const firstClearOf = {}; Object.entries(FIRST).forEach(([k, id])=> (firstClearOf[id] = firstClearOf[id] || []).push(k));
const MAPS = G.CONQUEST_MAPS, mapById = {}; MAPS.forEach(m=> mapById[m.id] = m);
const nodeExists = (mapId, key)=> !!(mapById[mapId] && (mapById[mapId].nodes || []).some(n=> n.key === key));
const idx = G.packIndex();
const listsOf = {}; // every map list (MAP, SUBMAP, SPECIAL) that names a card: [{loc, n}]
{ const pools = JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical', 'map-pools.json'), 'utf8')).maps, LMP = require(path.join(ROOT, 'tools', 'lib_map_pools.js'));
  Object.keys(pools).forEach(top=>{ const e = LMP.normalizeEntry(pools[top]), add = (id, loc)=>{ const n = G.mapUnlockNumberOf(loc === 'mtut12' ? 'mtut' : loc); (listsOf[id] = listsOf[id] || []).push({loc, n}); };
    e.cards.forEach(id=> add(id, top)); e.special.forEach(id=> add(id, top)); Object.keys(e.submaps).forEach(s=> e.submaps[s].forEach(id=> add(id, s))); }); }

// ---- packs today
const SHOP = {1: 'bronze', 2: 'silver', 3: 'gold'};
const PACK_META = {
  bronze: {kind: 'shop', name: 'Hedgerow Pouch', packNo: 1, pool: 1, saleMap: 5, todayRule: 'Pack 1: basic-pack cards whose first map list opens on Maps 0-6 (PACK_MAPS_PER_TIER 7), plus canonical/pack-extras.json "1" (empty)'},
  silver: {kind: 'shop', name: 'Tidemire Chest', packNo: 2, pool: 2, saleMap: 8, todayRule: 'Pack 2: first map list on Maps 7-13, plus pack-extras "2" (empty)'},
  gold: {kind: 'shop', name: 'Highcrest Case', packNo: 3, pool: 3, saleMap: 13, todayRule: 'Pack 3: first map list on Maps 14-20, plus pack-extras "3" (empty)'},
  mystery: {kind: 'shop', name: 'Mystery Booster', pool: 99, saleMap: 13, todayRule: 'cards with source {kind:"pack", tier:99}; sold only by the Wandering Trader'},
  pack4: {kind: 'unsold', name: 'Pack 4 (no shop pack yet)', pool: 4, todayRule: 'first map list on Maps 21-27; no shop pack sells pool 4, its cards come only from the card drop, the base reward track and raid claims (pool "basic"), from Map 21'},
  otters: {kind: 'faction', name: 'Rivergate Pack (Otter side of the faction pool)', pool: 11, side: '', todayRule: 'source {kind:"pack", tier:11} with side "" (Otter); faction pool hand-outs and the Rivergate faction pack'},
  hummingbirds: {kind: 'faction', name: 'Sunfeather Pack (Hummingbird side of the faction pool)', pool: 11, side: 'tribes', todayRule: 'source {kind:"pack", tier:11, side:"tribes"}; faction pool hand-outs and the Sunfeather faction pack'},
  shared: {kind: 'faction', name: 'Faction pool, shared (both sides)', pool: 11, side: 'shared', todayRule: 'source {kind:"pack", tier:11, side:"shared"}'},
  starter: {kind: 'starter', name: 'Starting deck', todayRule: 'starterDeckParts(pick).all for picks otters / hummingbirds / both (one copy each); the tutorial\'s 3 + 3 faction rewards come out of the faction pool'},
  base: {kind: 'base', name: 'Base', todayRule: 'cardSourceOf kind "base" (no source, or unlocked); one copy of each (bar the tutorial base) is in the faction pool'},
};
function packsToday(d){
  const out = [], s = G.cardSourceOf(d), t = G.basicPackTierOf(d);
  if(t >= 1 && t <= 3) out.push(SHOP[t]); else if(t === 4) out.push('pack4');
  if(s.kind === 'pack' && +s.tier === 99) out.push('mystery');
  return out;
}
function factionSideToday(d){ const s = G.cardSourceOf(d); if(s.kind !== 'pack' || +s.tier !== 11) return null; return s.side === 'tribes' ? 'hummingbirds' : s.side === 'shared' ? 'shared' : 'otters'; }

// ---- the proposal seed (CONTENT16). Edit the file afterwards (or the Pack editor, UI29); a plain run keeps those edits.
const SEED = {
  zones: [
    {id: 'A', maps: [0, 7], pack: 'bronze', tierFrom: 0, name: 'Hedgerow and tidewater', theme: 'the outskirts\' fields and villages, the beach and gannet cliffs, the swamps, the pond and the Morel Hollow (fields, hedges, coast, wetland)'},
    {id: 'B', maps: [8, 13], pack: 'silver', tierFrom: 8, name: 'Caves, reefs and the deep wood', theme: 'the caves, the kelp mangroves, the coral current, the eyrie heights, the briar maze and the redwood deep (underground, sea, cliff and old forest)'},
    {id: 'C', maps: [14, 20], pack: 'gold', tierFrom: 14, name: 'The far lands', theme: 'the savanna and long grass, the taiga and tundra, the glass dunes, the ashen spurn and the volcano (open plains, cold, sand and fire)'},
  ],
  zoneSplitWhy: 'Maps 0-7 / 8-13 / 14-20, one pack each (submaps count from the map that unlocks them, as today). It keeps the owner\'s 0-7 (Map 7 joins the Pouch: the Tidemire Chest is first sold on Map 8, so Map 7\'s cards were in a pack nobody could buy yet). The owner\'s 8-15 / 16-20 was changed to 8-13 / 14-20: the Highcrest Case is sold from Map 13 and the map-end pack turns gold at Map 14, so its zone starts there; the savanna and long grass (14-15) are open country like the taiga, tundra and dunes, not caves and reefs; and 8-15 would leave the Case only 5 maps. Today\'s rule is 0-6 / 7-13 / 14-20.',
  packs: {
    bronze: {add: [
      ['village-miller', 'Village mouse, plain 2/7: the outskirts\' supporting folk; a vanilla body to level'],
      ['briarback-hedgehog', 'The hedgerow\'s own hedgehog (Bramble Armor): a sturdy early wall'],
      ['hazel-coppice', 'A coppiced hazel (Coppice): a hedgerow structure that keeps paying later'],
      ['ladybird-guard', 'Field insect with Guardian: a cheap first protector'],
      ['clover-butterfly', 'Meadow butterfly, Flying only: the simplest flyer'],
      ['leopard-slug', 'Damp woodland slug, Regen: a slow, sturdy body for Thistlewood'],
      ['red-backed-salamander', 'Woodland newt, Regen: a forest-floor attacker'],
      ['jackrabbit-sprinter', 'Field rabbit, Quick: a fast field card (also a tutorial example)'],
      ['pigeon-peon', 'Village pigeon, Flying: a plain village flyer'],
      ['limpet-clinger', 'Pebble Beach limpet (Shell, Tide): a rock-pool wall'],
      ['signal-crayfish', 'Pond and river crayfish (Armor, Crab Claws): a steady Lilypad Reach body'],
      ['shallows-fry', 'River fry (Tide): the shallows\' small fish, the kind the Legion trains'],
      ['great-crested-grebe', 'Pond grebe (Tide, Evasive): a Lilypad Reach water bird'],
      ['dam-keeper-beaver', 'Beaver (Rampart): "beavers build for the Legion"; a river builder'],
      ['raft-spider', 'Swamp raft spider (Tide): Gatorback\'s water-walker'],
      ['peat-cutter-vole', 'Swamp vole that cuts peat (Delivery): early Lumber for the build-up'],
      ['marsh-mallow-hare', 'Swamp hare (Cure): a swamp healer\'s body'],
      ['mosquito-cloud', 'Swamp insects (Flying, Bleed): the bog\'s own nuisance'],
      ['bog-shrew', 'The Gnawed (Sap): CONTENT2 proposed the Sable Swampmire as its home; awaiting a source'],
      ['fungus-gnat-cloud', 'Morel Hollow gnats (Flying, Swarm): a fungus-wood swarm'],
    ], remove: []},
    silver: {add: [
      ['cave-pseudoscorpion', 'Cave arachnid (Poison): a small Caves & Alcoves hunter'],
      ['guano-beetle', 'Cave beetle (Carrion): lives off the bat roosts'],
      ['gravel-mole', 'The Hollow Kin\'s gravel digger (Delivery of Stone): the lore\'s Stone maker for the caves'],
      ['ghost-crayfish', 'Blind cave crayfish (Armor, Regen): a deep-cave wall'],
      ['baby-bat', 'Cave bat (Flying, Nocturnal): a plain cave flyer'],
      ['cave-centipede', 'Cave centipede (Poison): a cave-floor attacker'],
      ['kelpborn-otter', 'Tidefolk (Tide): CONTENT2 proposed the Kelp Mangroves as its home; awaiting a source'],
      ['conger-eel', 'Tidefolk eel (Tide, Fork): CONTENT2 proposed Coral Current; awaiting a source'],
      ['archerfish', 'Mangrove archerfish (Acid Bolt): a Kelp Mangroves shooter'],
      ['sea-hare', 'Mangrove sea hare (Smoke Bomb): a soft mangrove body'],
      ['lionfish', 'Coral reef lionfish (Tide, Thorns): a reef defender'],
      ['hammerhead-shark', 'Ocean shark (Tide), 4/13: a plain big body for the reef'],
      ['pufferfish-bulwark', 'Reef pufferfish (Tide), 1/18: a reef wall'],
      ['marmot-stonecutter', 'Mountain marmot (Stonecutter): Eyrie Heights\' rock worker'],
      ['jay-pilferer', 'Forest jay (Swipe): the Briar Maze\'s raiders rob the toll roads (lore)'],
      ['smoke-raccoon', 'Raccoon road-folk (Smoke Bomb): a Briar Maze bandit'],
      ['woodpecker-sapper', 'Redwood woodpecker (Perforate): a Redwood Deep attacker'],
      ['beaver-feller', 'Forest beaver (Felling): Lumber from the great trees'],
      ['bear-cub', 'Bear cub, plain 2/8: the Redwood\'s grizzlies start here; a body to level'],
      ['muntjac-barker', 'Field deer (Sentry): Clovermead\'s meadow deer'],
    ], remove: [
      ['gangrenous-leech', 'A swamp leech first listed on Eyrie Heights (Map 11): it belongs with the swamps (budget fits at Map 0)', null, 'bronze'],
      ['snapper-hatchling', 'A swamp hatchling, in the Chest only because the Sunken Grove (under Gatorback Swamp) opens at Map 13: swamp zone (fits at Map 0)', null, 'bronze'],
      ['caiman-hatchling', 'A swamp hatchling from the Sunken Grove, as above: swamp zone (fits at Map 0)', null, 'bronze'],
      ['tasmanian-devil', 'Map review flag (THEME4): "not a redwood animal"; out of the Chest (it stays a Redwood enemy card). Optional', null, null],
    ]},
    gold: {add: [
      ['meerkat-sentry', 'Savanna meerkat (Sociable): a savanna lookout'],
      ['termite-forager', 'Savanna termite (Delivery): Lumber for the plains'],
      ['termite-mound', 'Savanna termite mound (Armor): a plains structure'],
      ['plains-zebra', 'Plains zebra (Evasive): a Savanna Reaches grazer'],
      ['monitor-rambler', 'Savanna monitor (Armor): a sturdy plains reptile'],
      ['marula-monkey', 'Marula monkey (Tipsy): pairs with the savanna\'s Marula Elephant'],
      ['lovebird', 'Savanna lovebird (Amore): a plains bird'],
      ['timber-wolf-pack', 'Taiga wolves, plain 3/11: a Pinewood Taiga pack to level'],
      ['pinecone-sapper', 'Taiga pinecone (Explode): a taiga structure-trap'],
      ['harp-seal-pup', 'Tundra seal pup (Molting): Wolfsbane Tundra\'s young'],
      ['ringed-seal', 'Tundra seal (Tide, Invisible): an ice-floe body'],
      ['tundra-musk-ox', 'Tundra musk ox (Thorns), 2/20: a cold-land wall'],
      ['musk-ox-calf', 'Taiga and tundra calf (Armor, Frostbite)'],
      ['lemming-swarm', 'Tundra lemmings (Swarm, Brood): small bodies that add up'],
      ['frost-thistle-lynx', 'Tundra lynx (Bleed): a big cat of the cold lands (a beast)'],
      ['pale-oryx', 'Desert oryx (Dry, Pierce): the Glass Dunes\' grazer'],
      ['sandstorm-roc', 'Desert roc (Dry), 4/14: a big desert body'],
      ['glasswing-moth', 'Desert moth (Brittle): a Glass Dunes insect'],
      ['basalt-boar', 'Volcanic boar (Grit): an Ashen Spurn brawler'],
      ['scree-goat', 'Mountain goat (Landslide): the Sundered Peak\'s slopes'],
    ], remove: [
      ['tide-spirit', 'A water spirit first listed in the Volcano Lair: the sea cards are the Chest\'s (Very Rare; budget fits at Map 8)', null, 'silver'],
    ]},
    mystery: {add: [], remove: []},
    pack4: {add: [], remove: [], note: 'Maps 21-27: not tuned now (owner 11-06, BAL17-2: Maps 0-20 only).'},
    otters: {add: [['minnow-skitter', 'A Legion fish companion (Tide), plain 1/9: "They tame and train fish" (lore); in no list today']], remove: []},
    hummingbirds: {add: [['crimson-wing-drumcaller', 'ENG27-9 (owner 11-07 09:10, "put in a for now"): the Hype card goes in the Sunfeather faction pack']], remove: []},
    shared: {add: [], remove: []},
    starter: {add: [], remove: []},
    base: {add: [], remove: []},
  },
  // one card per achievement; budgetMap = the map a player usually reaches it on (for the budget's Map term; no source kind 'achievement' exists yet)
  achievements: {
    first_win:       ['courier-pigeon', 0, 'A pigeon that carries the news of your first win (Flying)'],
    conquest_5:      ['warren-scout', 1, 'A rabbit scout (Keen Eye) for your first steps into the wilds'],
    wins_10:         ['sworn-shieldbearer', 3, 'A village shieldbearer (Loyal) who joins a seasoned warrior'],
    streak_5:        ['ember-wisp', 4, 'A hot streak: the Ember Firefly (Immolation)'],
    collector_50:    ['magpie-collector', 3, 'The Magpie Collector, for the Card Collector'],
    leveler_1:       ['grindstone-boar', 11, 'A boar named for the grindstone (Friction), for your first Forge level'],
    conquest_map:    ['eagle-diver', 2, 'An eagle (Flying, Pounce) that has seen a whole map'],
    conquest_maps_5: ['arctic-tern', 6, 'The arctic tern, the longest traveller, for Five Horizons'],
    collector_100:   ['owl-fletcher', 8, 'A wise owl (Flying, Arrow) for the Bramble Archivist'],
    leveler_10:      ['geode-scorpion', 12, 'A geode scorpion (Crystallise) for the Forge Regular'],
    raid_unlock_1:   ['trebuchet-crew', 13, 'A beaver trebuchet (Volley, Siege) for your first raid'],
    wins_50:         ['stag-beetle', 12, 'A stag beetle (Armor, Sweep), battle-hardened'],
    streak_10:       ['boar-rampager', 12, 'A boar that cannot be stopped (Sweep)'],
    collector_200:   ['heartwood-treant', 16, 'An old treant (Timber) that has seen every card'],
    conquest_road:   ['ashwing-ptarmigan', 20, 'A ptarmigan of ash and snow, for reaching the Caldera'],
    eye_volcano:     ['salamander-pyromancer', 20, 'The Volcano Lair\'s pyromancer (Fireball), for the crater\'s heart'],
    world_boss:      ['thunder-lizard', 21, 'A dragon-kin thunder lizard for the Wyrmslayer'],
  },
};

// ---- the plan file: keep the proposal, regenerate the rest
let plan = null; try{ plan = JSON.parse(fs.readFileSync(OUT, 'utf8')); }catch(e){}
const reseed = args.includes('--reseed') || !plan;
const zones = reseed ? SEED.zones : plan.zones;
const zoneSplitWhy = reseed ? SEED.zoneSplitWhy : plan.zoneSplitWhy;
const asItem = a=> Array.isArray(a) ? {id: a[0], why: a[1]} : a;
const asRemove = a=> Array.isArray(a) ? Object.assign({id: a[0], why: a[1]}, a[3] ? {moveTo: a[3]} : {}) : a;
const proposal = {}; Object.keys(PACK_META).forEach(k=>{ const p = reseed ? SEED.packs[k] || {} : (plan.packs[k] || {}).proposal || {};
  proposal[k] = {add: (p.add || []).map(asItem).map(x=> ({id: x.id, why: x.why})), remove: (p.remove || []).map(asRemove).map(x=> Object.assign({id: x.id, why: x.why}, x.moveTo ? {moveTo: x.moveTo} : {}))}; if(p.note) proposal[k].note = p.note; });
const ACHV = {}; { const src = reseed ? SEED.achievements : plan.achievements; Object.keys(src).forEach(a=>{ const v = src[a]; ACHV[a] = Array.isArray(v) ? {card: v[0], budgetMap: v[1], why: v[2]} : {card: v.card, budgetMap: v.budgetMap, why: v.why}; }); }
const ACHV_DEFS = {}; { const s = B.grab('ACHIEVEMENT_DEFS'); const re = /\{id:'([a-z0-9_]+)', cat:'(\w+)', tier:(\d)[^}]*?title:'([^']+)'/g; let m; while((m = re.exec(s))) ACHV_DEFS[m[1]] = {cat: m[2], tier: +m[3], title: m[4]}; }
const TIER_NAME = {1: 'Bronze', 2: 'Silver', 3: 'Gold', 4: 'Dragon'};
const FACTION_ACHV = eval('(' + /achievements:\s*(\{[^}]*\})/.exec(B.grab('FACTION_REWARD_TRACK'))[1] + ')');

// ---- zones
const zoneOfN = n=> n == null ? null : (zones.find(z=> n >= z.maps[0] && n <= z.maps[1]) || {id: n > 20 ? 'D' : null}).id;
const zoneById = {}; zones.forEach(z=> zoneById[z.id] = z); zoneById.D = {id: 'D', pack: 'pack4', maps: [21, 27], tierFrom: 21};
zones.forEach(z=>{ z.mapNames = MAPS.filter(m=> !m.sub).map((m, i)=> ({n: i, id: m.id, name: m.name})).filter(x=> x.n >= z.maps[0] && x.n <= z.maps[1]).map(x=> `${x.n} ${x.name}`);
  z.submaps = MAPS.filter(m=> m.sub && !G.CONQUEST_MAPS.find(x=> x.id === m.id).reserved).map(m=> ({id: m.id, name: m.name, opensAt: G.mapUnlockNumberOf(m.id)})).filter(s=> s.id !== 'mtut' && s.opensAt != null && s.opensAt >= z.maps[0] && s.opensAt <= z.maps[1]).map(s=> `${s.name} (${s.id}, opens at ${s.opensAt})`); });

// ---- budget of a proposed card at the map it would become obtainable on
function budgetAt(id, map){ const c = byId[id]; if(!c) return {verdict: 'missing'}; const m = Math.max(map, G.rarityIntroMap ? G.rarityIntroMap(c.rarity) || 0 : 0);
  const b = T.budget(Object.assign({}, c, {obtainMap: m}), {}); if(!b || !(b.N > 0)) return {map: m, verdict: 'n/a'}; return {map: m, use: Math.round(100 * b.x1 / b.N), verdict: !b.ok ? 'OVER' : b.wellUnder ? 'under' : 'ok'}; }

// ---- pack contents: today and under the proposal
const basicIds = LIVE.filter(id=> defs[id] && packsToday(defs[id]).length);
const today = {}; Object.keys(PACK_META).forEach(k=> today[k] = []);
LIVE.forEach(id=>{ const d = defs[id]; if(!d) return; packsToday(d).forEach(p=> today[p].push(id)); const f = factionSideToday(d); if(f) today[f].push(id);
  if(STARTER_SET.has(id)) today.starter.push(id); if(G.cardSourceOf(d).kind === 'base') today.base.push(id); });
const firstN = id=> (idx.first[id] || {}).n;
const inZone = {}; ['bronze', 'silver', 'gold', 'pack4'].forEach(k=> inZone[k] = []);
LIVE.forEach(id=>{ const d = defs[id]; if(!d) return; const t = G.basicPackTierOf(d); if(!t) return; const z = zoneOfN(firstN(id)); const pk = z ? zoneById[z].pack : null;
  if(pk) inZone[pk].push(id); else if(t === 4) inZone.pack4.push(id); });
const proposed = {}; Object.keys(PACK_META).forEach(k=> proposed[k] = (inZone[k] || today[k]).slice());
const movedIn = {}; Object.keys(PACK_META).forEach(k=> movedIn[k] = []);
Object.keys(proposal).forEach(k=>{ proposal[k].remove.forEach(r=>{ proposed[k] = proposed[k].filter(x=> x !== r.id); if(r.moveTo){ movedIn[r.moveTo].push({id: r.id, from: k, why: r.why}); } }); });
Object.keys(proposal).forEach(k=>{ movedIn[k].forEach(m=>{ if(!proposed[k].includes(m.id)) proposed[k].push(m.id); }); proposal[k].add.forEach(a=>{ if(!proposed[k].includes(a.id)) proposed[k].push(a.id); }); });
const PACK_KEYS_SHOP = ['bronze', 'silver', 'gold', 'mystery', 'pack4'];
const packOfZone = k=> zones.find(z=> z.pack === k);
// budget notes for every add and move
Object.keys(proposal).forEach(k=>{ const z = packOfZone(k), map = z ? z.tierFrom : (PACK_META[k].kind === 'faction' ? 5 : 0);
  proposal[k].add.forEach(a=> a.budget = budgetAt(a.id, map)); movedIn[k].forEach(m=> m.budget = budgetAt(m.id, map)); });
Object.values(ACHV).forEach(a=> a.budget = budgetAt(a.card, a.budgetMap));

// ---- sources
const SPECIAL_KINDS = new Set(['raid', 'nest', 'smith', 'secret', 'quest']);
function classify(id, mode){
  const d = defs[id] || byId[id], s = G.cardSourceOf(d), where = [];
  const packs = mode === 'proposed' ? PACK_KEYS_SHOP.filter(k=> proposed[k].includes(id)) : packsToday(d);
  const fside = mode === 'proposed' ? ['otters', 'hummingbirds', 'shared'].find(k=> proposed[k].includes(id)) : factionSideToday(d);
  const achv = mode === 'proposed' ? Object.keys(ACHV).filter(a=> ACHV[a].card === id) : [];
  const lists = (listsOf[id] || []).map(l=> `list:${l.loc}@${l.n == null ? '?' : l.n}`);
  const fc = (firstClearOf[id] || []).filter(k=> !G.isUnattainable(d) || mode === 'proposed').map(k=> 'first-clear:' + k);
  Object.keys(STARTER).forEach(p=>{ if(STARTER[p].includes(id)) where.push('starter:' + p); });
  if(s.kind === 'base') where.push(s.tutorialReward ? 'tutorial-reward' : 'base');
  if(inFactionPoolAsBase(d)) where.push('faction-pool:base (1 copy)');
  if(fside) where.push('faction:' + fside);
  if(s.kind === 'map' && s.node) where.push(`skirmish:${s.id} ${s.node}${nodeExists(s.id, s.node) ? '' : ' (NO SUCH FIGHT)'}`);
  packs.forEach(p=> where.push('pack:' + p));
  achv.forEach(a=> where.push('achievement:' + a));
  if(SPECIAL_KINDS.has(s.kind)) where.push(s.kind + (s.id ? ':' + s.id : '') + (s.egg ? ':' + s.egg : ''));
  fc.forEach(x=> where.push(x));
  lists.forEach(x=> where.push(x));
  let source;
  if(STARTER_SET.has(id)) source = 'starter';
  else if(s.kind === 'base') source = s.tutorialReward ? 'reward' : 'base';
  else if(fside) source = 'faction';
  else if(s.kind === 'map' && s.node) source = 'skirmish-unique';
  else if(achv.length && !packs.length) source = 'achievement';
  else if(packs.length){ const met = lists.length || fc.length; source = !met && packs.length === 1 && packs[0] !== 'pack4' ? 'pack-unique' : 'pack'; }
  else if(SPECIAL_KINDS.has(s.kind)) source = 'special';
  else if(fc.length) source = 'reward';
  else source = 'none';
  return {source, where};
}
const sources = {};
LIVE.forEach(id=>{ const now = classify(id, 'today'), pr = classify(id, 'proposed'); const o = {source: now.source, where: now.where};
  if(pr.source !== now.source || JSON.stringify(pr.where) !== JSON.stringify(now.where)) o.proposed = {source: pr.source, where: pr.where};
  if(now.source === 'none') o.flag = (listsOf[id] || []).length ? 'unobtainable: on a map list (an enemy card only)' : 'unobtainable: on no map list';
  if(byId[id].awaitingSource) o.awaitingSource = true;
  sources[id] = o; });

// ---- issues
const count = (mode)=>{ const c = {}; LIVE.forEach(id=>{ const s = mode === 'proposed' ? (sources[id].proposed || sources[id]).source : sources[id].source; c[s] = (c[s] || 0) + 1; }); return c; };
const issues = {
  orphans: {note: 'live cards nothing gives out today (source none)', onAList: LIVE.filter(id=> sources[id].source === 'none' && (listsOf[id] || []).length), onNoList: LIVE.filter(id=> sources[id].source === 'none' && !(listsOf[id] || []).length).length + ' cards (ids under sources, flag "unobtainable: on no map list")', afterProposal: LIVE.filter(id=> (sources[id].proposed || sources[id]).source === 'none').length},
  skirmishUniqueInPack: {today: LIVE.filter(id=> sources[id].source === 'skirmish-unique' && packsToday(defs[id] || byId[id]).length), proposed: LIVE.filter(id=> classify(id, 'today').source === 'skirmish-unique' && PACK_KEYS_SHOP.some(k=> proposed[k].includes(id)))},
  offTheme: Object.keys(proposal).map(k=> proposal[k].remove.map(r=> ({pack: k, id: r.id, why: r.why, moveTo: r.moveTo || null}))).flat(),
  zoneMoves: {note: 'cards that change pack only because of the new zone split', toBronze: inZone.bronze.filter(id=> !today.bronze.includes(id)), toGold: inZone.gold.filter(id=> !today.gold.includes(id)), toSilver: inZone.silver.filter(id=> !today.silver.includes(id))},
  firstClearOutsideItsZone: Object.entries(FIRST).map(([k, id])=>{ const mapId = k.split(':')[0], fn = G.mapUnlockNumberOf(mapId), pk = PACK_KEYS_SHOP.find(p=> proposed[p].includes(id)), z = zoneOfN(fn);
    return {fight: k, id, fightZone: z, pack: pk || null}; }).filter(x=> !x.pack || (zoneById[x.fightZone] && zoneById[x.fightZone].pack !== x.pack)),
  missingFight: LIVE.filter(id=> (sources[id].where || []).some(w=> /NO SUCH FIGHT/.test(w))),
  starterOnly: {note: 'starting-deck cards with no other source: the one starting copy is all a player can ever hold', ids: LIVE.filter(id=> sources[id].source === 'starter' && sources[id].where.every(w=> /^starter:|^list:/.test(w)))},
  unsoldPack4: today.pack4.length,
  awaitingSourceInProposal: Object.keys(proposal).map(k=> proposal[k].add.filter(a=> byId[a.id] && byId[a.id].awaitingSource).map(a=> a.id)).flat().concat(Object.values(ACHV).filter(a=> byId[a.card] && byId[a.card].awaitingSource).map(a=> a.card)),
  budgetOverInProposal: [].concat(...Object.keys(proposal).map(k=> proposal[k].add.concat(movedIn[k]).filter(a=> a.budget && a.budget.verdict === 'OVER').map(a=> `${a.id} (${k}, Map ${a.budget.map}, ${a.budget.use}%)`)), Object.values(ACHV).filter(a=> a.budget.verdict === 'OVER').map(a=> `${a.card} (achievement, Map ${a.budget.map}, ${a.budget.use}%)`)),
  proposalNotOrphan: [].concat(...Object.keys(proposal).map(k=> proposal[k].add.filter(a=> sources[a.id] && sources[a.id].source !== 'none').map(a=> `${a.id} (${k}: today ${sources[a.id].source})`)), Object.values(ACHV).filter(a=> sources[a.card] && sources[a.card].source !== 'none').map(a=> `${a.card} (achievement: today ${sources[a.card].source})`)),
};

// ---- write
const packsOut = {};
Object.keys(PACK_META).forEach(k=>{ const z = packOfZone(k), m = PACK_META[k];
  packsOut[k] = Object.assign({}, m, {zone: z ? z.id : k === 'pack4' ? 'D' : null,
    current: {count: today[k].length, cards: today[k].slice().sort()},
    inProposedZone: inZone[k] ? {count: inZone[k].length, cards: inZone[k].slice().sort()} : undefined,
    proposal: Object.assign({add: proposal[k].add, remove: proposal[k].remove}, movedIn[k].length ? {movedIn: movedIn[k]} : {}, proposal[k].note ? {note: proposal[k].note} : {}),
    proposedCount: proposed[k].length});
  if(k === 'starter') packsOut[k].current.byPick = STARTER; });
const out = {
  _about: {
    what: 'CONTENT16 (2026-11-07): where cards are earned. A PROPOSAL: nothing here is read by the game yet (UI29 builds a Pack editor that reads it). Generated by tools/content16_pack_plan_2026_11_07.js; the proposal parts (zones, packs.*.proposal add/remove, achievements) are kept across runs, the rest is regenerated from the game.',
    zones: 'zones[]: {id, maps:[first, last] main-map numbers, pack: the shop pack that sells the zone, tierFrom: the map its cards count from for the budget, name, theme, mapNames, submaps (a submap belongs to the zone of the map that unlocks it)}.',
    packs: 'packs.<key>: bronze / silver / gold (the three Map 0-20 shop packs), mystery (Mystery Booster, pool 99), pack4 (pool 4: no shop pack), otters / hummingbirds / shared (the faction pool sides), starter, base. Each: kind, name, todayRule, zone, current {count, cards} (what the game builds today), inProposedZone (shop packs: today\'s map-listed cards regrouped by the proposed zones), proposal {add: [{id, why, budget}], remove: [{id, why, moveTo?}], movedIn: [{id, from, why, budget}]}, proposedCount. budget = {map, use: % of N, verdict ok | under | OVER} at the map the card would become obtainable on.',
    achievements: 'achievements.<achievementId>: {card, budgetMap, why, budget, tier, title}: one card per achievement, only from that achievement (one copy); these get the 5% upgrade discount later (not built).',
    sources: 'sources.<cardId>: {source, where: [...], proposed?: {source, where} (only when the proposal changes it), flag? (unobtainable cards), awaitingSource?}. source: starter (in a starting deck) | base (Base: available from the start; one copy in the faction pool) | faction (faction pool side) | skirmish-unique (a fight\'s exclusive reward, never in a pack) | pack (in a pack and also met in fights or paid by a first clear) | pack-unique (in exactly one pack and never met in a fight) | achievement (only from an achievement) | reward (a tutorial reward, or only a first clear) | special (raid, Nest, Blacksmith, secret, quest) | none (nothing gives it out: flagged). Precedence in that order. where: starter:<pick>, base, tutorial-reward, faction:<side>, faction-pool:base, skirmish:<map> <fight>, pack:<key>, achievement:<id>, <special kind>:<id>, first-clear:<map>:<fight>, list:<map list>@<map number>.',
    liveCards: 'Live = canonical/cards.json minus pool, token, test, field, spell (shelved), materia and Easter-egg cards.',
  },
  built: '2026-11-07', generatedBy: 'tools/content16_pack_plan_2026_11_07.js',
  zones, zoneSplitWhy, packs: packsOut,
  achievements: Object.fromEntries(Object.entries(ACHV).map(([a, v])=> [a, Object.assign({title: (ACHV_DEFS[a] || {}).title || a, tier: TIER_NAME[(ACHV_DEFS[a] || {}).tier] || null, factionCardsToday: FACTION_ACHV[a] || 0}, v)])),
  summary: {liveCards: LIVE.length, sourcesToday: count('today'), sourcesProposed: count('proposed'),
    packCounts: Object.fromEntries(Object.keys(PACK_META).map(k=> [k, {now: today[k].length, inProposedZone: inZone[k] ? inZone[k].length : undefined, add: proposal[k].add.length, remove: proposal[k].remove.length, movedIn: movedIn[k].length, proposed: proposed[k].length}]))},
  issues, sources,
};
const sumLine = ()=>{ console.log('live cards', LIVE.length); console.log('sources today   ', JSON.stringify(out.summary.sourcesToday)); console.log('sources proposed', JSON.stringify(out.summary.sourcesProposed));
  Object.entries(out.summary.packCounts).forEach(([k, v])=> console.log(k.padEnd(13), JSON.stringify(v)));
  console.log('skirmish-unique in a pack:', JSON.stringify(issues.skirmishUniqueInPack)); console.log('budget OVER in proposal:', JSON.stringify(issues.budgetOverInProposal)); console.log('proposal cards not orphans today:', JSON.stringify(issues.proposalNotOrphan));
  console.log('first clear outside its zone:', JSON.stringify(issues.firstClearOutsideItsZone)); console.log('starter-only:', issues.starterOnly.ids.length, 'unsold pack4:', issues.unsoldPack4, 'orphans on a list:', issues.orphans.onAList.length, '; on no list:', issues.orphans.onNoList); };
sumLine();
if(!args.includes('--check')){ fs.writeFileSync(OUT, JSON.stringify(out, null, 1) + '\n'); console.log('wrote', path.relative(ROOT, OUT)); }
