#!/usr/bin/env node
// 2026-10-24 (package N221, owner N22-1, docs/action-items.md "10-22 owner notes": "Maps 21–40: another divvy pass like DV. **Maps 40+:
// build one map at a time**: the idea first, work it through, the owner confirms, then make it concrete, then create art."). The DV divvy
// (tools/map_divvy_2026_10_22.js) stopped at Map 24; this extends it to Maps 21-40 for the cards waiting for a source (cards.json
// awaitingSource). Every waiting card gets exactly one home (HOME below): a pool on a map that exists (applied), a pool on a proposed map
// (Maps 25-40, written as a proposal only; no map is built), a quest-only special, Pack Secrets I, the faction pool, the Blacksmith, an
// owner decision that is still open, or a hold the owner set (Devilry Map 66, Ecclesia Map 77, the shelved spells).
//   node tools/n221_divvy_2026_10_24.js plan    -> docs/balance/n221-divvy-2026-10-24.json + .md (checked against the rules; writes nothing else)
//   node tools/n221_divvy_2026_10_24.js apply   -> the APPLY placements only: canonical/map-pools.json (the map's "cards") and the card's
//                                                source in canonical/cards.json; then run node tools/forge_curve_2026_10_19.js maps and
//                                                node tools/unit_themes.js (card-obtain-maps, unit-themes)
//   node tools/n221_divvy_2026_10_24.js check   -> the rules on the live files: exit 1 on any failure (tests/n221-2026-10-24.js runs it)
// Pack tiers past Map 20 follow the owner's Pack 1-3 pattern of about 7 maps each (PP-1: 0-6 / 7-13 / 14-20): Pack 4 Maps 21-27, Pack 5
// 28-34, Pack 6 35-41 (owner call N221-1). Only tier 4 exists in the game (BASIC_PACK_TIERS; no shop pack sells it yet), so the applied
// placements use tier 4 and tiers 5 / 6 stay in the proposal.
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
const G = require('./lib_bramble.js').G;
const {serialize} = require('./fold_map_pools.js');
const {normalizeEntry} = require('./lib_map_pools.js');
const CARDS_F = path.join(ROOT, 'canonical', 'cards.json'), POOLS_F = path.join(ROOT, 'canonical', 'map-pools.json');
const OUT_JSON = path.join(ROOT, 'docs', 'balance', 'n221-divvy-2026-10-24.json'), OUT_MD = path.join(ROOT, 'docs', 'balance', 'n221-divvy-2026-10-24.md');
const MAPS = G.CONQUEST_MAPS, mains = G.mainConquestMaps ? G.mainConquestMaps() : MAPS.filter(m=> !m.sub && !m.reserved);
const STEP = r=> G.roadRarityStep(r || 'common');

// ---------------------------------------------------------------- pack tiers (owner call N221-1)
const PACK_TIERS = [[1, 0, 6], [2, 7, 13], [3, 14, 20], [4, 21, 27], [5, 28, 34], [6, 35, 41]];
const packTierOf = n=> (PACK_TIERS.find(([, a, b])=> n >= a && n <= b) || [null])[0];
const LIVE_TIERS = [1, 2, 3, 4]; // arena_app.js BASIC_PACK_TIERS

// ---------------------------------------------------------------- placements onto maps that exist (applied)
// Petrified Tree: petrified forests form under volcanic ash; the Rimefire Caldera (Map 22) is the volcano of Maps 21-24 and a Stone maker
// (Gain 1 Stone a turn) beside its fire and ice. A pack card (Pack 4), not a skirmish reward: the Caldera already has 10+ new cards and its
// three skirmish exclusives (DV3), so its reward count is unchanged. (The Quiet Summit, pool 9, was the other choice: there it would be the
// map's 6th new card and DV3 would ask for a third skirmish exclusive, a deck change; owner call N221-3.)
const APPLY = {
  'petrified-tree': {map: 'm22', role: 'pack', why: 'petrified forests form under volcanic ash: the Caldera\'s Stone maker beside its fire and ice'},
};

// ---------------------------------------------------------------- the proposed maps (Maps 25-40): a plan, nothing built
// held: waiting cards homed here; carry: live cards of earlier maps (a short few, DV rule 2); unsorted: live cards with no source today
// (enemy-only), proposed here; ideas: new cards to make (the eras rule: Maps 20-40 are stronger versions of the 0-20 animals and extinct
// look-alikes; no dinosaurs before 40, no magic before 50). base: the skirmish-base (first-clear) cards proposed. features: what the game
// already pins to that map (CONTENT2-4, FACTION_RARITY_GATES, the level gates).
const PLAN = {
  25: {name: 'The Rainforest Floor', biome: 'jungle', idea: 'The rainforest main map the Canopy (14-A) points at; the Canopy\'s held animals live here (RP5).',
       held: ['toucan-courier', 'poison-dart-frog', 'strangler-vine', 'war-drum-mandrill', 'old-growth-tortoise', 'aye-aye-prowler', 'velvet-worm', 'slow-loris', 'chilli-parrot', 'leaf-chameleon'],
       carry: [], unsorted: [], ideas: [], base: ['strangler-vine', 'leaf-chameleon'],
       features: ['Nest 6', 'Strange Materia x2 from the boss', 'Heroic revealed on the main road (bosses field it)']},
  26: {name: 'The Ant Empire', biome: 'caves and burrows', idea: 'A colony the size of a county; the hives\' own territory (lore bible: "We", never "I").',
       held: ['ant-hill', 'swarm-matriarch'], carry: ['ant-warrior', 'leafcutter-gardener', 'termite-mound', 'fire-ant-raft'], unsorted: ['gloom-gibbon'],
       ideas: ['Army Ant Column (a stronger Worker Ant, Pack + Rage)', 'Meganeura (extinct giant dragonfly, Flying + Quick)', 'Arthropleura (extinct giant millipede, Armor + Sweep)'],
       base: ['swarm-matriarch', 'Army Ant Column'], features: ['Dragonfire Forge (tier 4, Lv 9)', 'faction Epic gate (70 received)']},
  27: {name: 'The Carrion Moors', biome: 'moor and bog', idea: 'Bogs and bones; whatever dies here is eaten. The Gnawed\'s second home if CONTENT2-3 goes "other sources".',
       held: ['clinging-leech'], carry: ['skull-vulture', 'carrion-beetle', 'rot-swollen-carcass', 'grave-grin-hyena'], unsorted: ['hagfish-silencer', 'geode-scorpion'],
       ideas: ['Cave Hyena (extinct, a stronger Dust Hyena, Executioner + Pack)', 'Haast\'s Eagle (extinct giant eagle, Flying + Pounce)', 'Bog Body Heron (a stronger Mire Witch-Heron, Poison + Nocturnal)'],
       base: ['Cave Hyena', 'Haast\'s Eagle'], features: ['deck slot 6']},
  28: {name: 'Stormcoast', biome: 'coast in a gale', idea: 'Cliffs in a gale; seals and seabirds. The Tidefolk\'s second home if CONTENT2-3 goes "other sources". Pack 5 starts.',
       held: [], carry: ['grey-seal-bull', 'puffin-diver', 'fulmar-spitter', 'harbor-seal', 'voltaic-eel'], unsorted: ['leopard-seal'],
       ideas: ['Great Auk (extinct flightless seabird, Tide + Armor)', 'Steller\'s Sea Cow (extinct, a stronger Mangrove Manatee, Tide + Regeneration)', 'Storm Petrel Flock (Flying + Quick)', 'Thunder-ray (a stronger Electric Ray, Chain Lightning + Tide)'],
       base: ['Thunder-ray', 'Great Auk'], features: []},
  29: {name: 'The Echo Caverns', biome: 'deep caves', idea: 'Below Caves & Alcoves, where only sound finds the walls (Sonar, the Hollow Kin).',
       held: ['oilbird'], carry: ['echo-screecher', 'vampire-bat', 'cave-olm', 'blind-cave-fish', 'giant-cave-huntsman'], unsorted: [],
       ideas: ['Cave Bear Matron (extinct cave bear, Guardian + Regeneration)', 'Dire Bat Colony (a stronger Vampire Bat, Flying + Swarm)', 'Olm Elder (a stronger Cave Olm, Regeneration + Darksight)'],
       base: ['oilbird', 'Cave Bear Matron'], features: []},
  30: {name: 'The Old Growth', biome: 'ancient forest', idea: 'Trees older than the war; Evomax opens here (owner: Evomax from Map 30): the sloth line climbs its trunks.',
       held: ['slowpoke-sentinel', 'canopy-sloth-guardian', 'hanging-loafer'], carry: ['elder-willow', 'grizzly-vanguard', 'ancient-sloth-titan'], unsorted: [],
       ideas: ['Megatherium (extinct giant ground sloth: the sloth line\'s Omega, docs/evolute-design-2026-10-21.md)', 'Giant Beaver (extinct, the eras list; Lumberjack + Armor)'],
       base: ['canopy-sloth-guardian', 'Megatherium'], features: ['Evomax opens', 'Nest 7', 'Strange Materia x3 from the boss', 'faction Heroic gate', 'Unique revealed', 'enemy Lv 6 introduced']},
  31: {name: 'The Hollow Farmsteads', biome: 'farm country', idea: 'The Long Grass grown old: wild cattle and wild horses. Side map: the Cabbage Patch, the owner\'s Killer Veggies ("people think it\'s just a farm").',
       held: [], carry: ['land-tiller', 'border-collie', 'warhorse-charger', 'bison-bulldozer', 'great-horned-owl'], unsorted: [],
       ideas: ['Aurochs (extinct wild cattle, a stronger Bison Bulldozer)', 'Tarpan (extinct wild horse, a stronger Stable Colt)', 'side map: Turnip Brawler, Pumpkin Knight, Snapjaw Flytrap (the Flora note, Maps 20+)'],
       base: ['Aurochs', 'Tarpan'], features: ['Heartfire Forge (tier 5, Lv 10)', 'the Flea Market']},
  32: {name: 'The Thornwold', biome: 'heath and briar', idea: 'Thistlewood and the Briar Maze grown wild: the Greenhood Band robs its toll roads, and the Thistle Baron comes back.',
       held: ['glintsnatch-magpie'], carry: ['thorn-shrike', 'quillguard', 'cunning-vixen', 'hedgehog-scout', 'rodent-king'], unsorted: [],
       ideas: ['Deinogalerix (extinct giant hedgehog, Thorns + Armor)', 'Greenhood Outlaw Fox (a stronger Cunning Vixen, Evasive + Bounty)'],
       base: ['Deinogalerix', 'Greenhood Outlaw Fox'], quest: ['thistle-baron'], features: []},
  33: {name: 'The Mammoth Steppe', biome: 'cold steppe', idea: 'Open frozen grass between the taiga and the ice; the ice-age herds.',
       held: [], carry: ['permafrost-mammoth', 'boreal-elk', 'woodland-caribou', 'glacier-wolf-pack'], unsorted: [],
       ideas: ['Woolly Rhino (extinct, a stronger Siege Rhino for the cold, Armor + Siege)', 'Cave Lion (extinct, a stronger Pride Queen, Pack Leader + Pounce)', 'Steppe Bison (extinct, Pack + Rage)', 'Irish Elk (extinct Megaloceros, Sweep + Mountain Climber)'],
       base: ['Woolly Rhino', 'Cave Lion'], features: ['deck slot 7']},
  34: {name: 'The Tar Pits', biome: 'tar seeps', idea: 'Black pools that keep what they catch: the predators that came for the trapped. Pack 5 ends.',
       held: [], carry: ['lone-grey-wolf', 'bramblewood-lynx'], unsorted: [],
       ideas: ['Sabre-tooth Stalker (extinct, a stronger Bramblewood Lynx, Pounce + Bleed)', 'Dire Wolf Pack (extinct, Pack + Rage)', 'Ground Sloth Wallower (extinct Paramylodon, Guardian + Armor)', 'Teratorn (extinct giant vulture, Flying + Executioner)'],
       base: ['Sabre-tooth Stalker', 'Dire Wolf Pack'], features: []},
  35: {name: 'The Drowned Reef', biome: 'deep sea', idea: 'Past Coral Current, where the old things swim. Pack 6 starts.',
       held: [], carry: ['colossal-squid', 'whale-shark', 'orca-vanguard', 'reef-shark'], unsorted: [],
       ideas: ['Elder Shark (a megalodon look-alike, a stronger Coral Reef Shark)', 'Serpent Whale (a basilosaurus look-alike, Tide + Pierce)', 'Dunkleosteus (extinct armoured fish, Armor + Crab Claws)', 'Ammonite Drifter (extinct, Tide + Armor)'],
       base: ['Dunkleosteus', 'Elder Shark'], features: []},
  36: {name: 'The Black Bayou', biome: 'deep swamp', idea: 'Gatorback Swamp grown huge and dark; the Gnawed\'s rats run its stilt villages.',
       held: [], carry: ['anaconda-coil', 'alligator-gar', 'crocodile-ambusher', 'swamp-alligator', 'mire-witch-heron'], unsorted: [],
       ideas: ['Titanoboa (extinct giant snake, Ambush + Poison)', 'Terror Croc (a deinosuchus look-alike, Ambush + Armor)'],
       base: ['Titanoboa', 'Terror Croc'], features: []},
  37: {name: 'The Lost Isle', biome: 'island', idea: 'An island where birds grew big and nothing hunted them, until now.',
       held: [], carry: ['elder-tortoise', 'sea-turtle-elder', 'lyrebird-mimic'], unsorted: [],
       ideas: ['Moa Guard (extinct, a stronger Goose Sentry, a Guardian body)', 'Dodo Steward (extinct, a heavy bird with Bounty)', 'Elephant Bird (extinct, Armor + Sweep)', 'Giant Weta (Armor + Pounce)'],
       base: ['Moa Guard', 'Elephant Bird'], features: []},
  38: {name: 'The Fossil Badlands', biome: 'canyon and badlands', idea: 'Bones in the cliffs; the road\'s last look at today\'s world before the dinosaurs (Map 40+).',
       held: [], carry: ['komodo-warlord', 'sand-widow', 'caustic-scorpion'], unsorted: [],
       ideas: ['Terror Bird (extinct phorusrhacid, Pounce + Speed)', 'Glyptodont (extinct cart-sized armadillo, Armor + Shield Call)', 'Megalania (extinct giant monitor, Poison + Rage)'],
       base: ['Terror Bird', 'Glyptodont'], features: []},
  39: {name: 'The Last Savanna', biome: 'savanna', idea: 'Savanna Reaches grown ancient: the giants the hyenas follow.',
       held: [], carry: ['marula-elephant', 'savanna-cheetah', 'springbok-pronker', 'spitting-cobra', 'rabid-jackal'], unsorted: [],
       ideas: ['Deinotherium (extinct tusked elephant, Siege + Armor)', 'Sivatherium (extinct giraffe kin, Sweep + Speed)', 'Chalicotherium (extinct clawed browser, Rage + Armor)'],
       base: ['Deinotherium', 'Sivatherium'], features: []},
  40: {name: 'The Grove of the Dragon-Turtle', biome: 'old grove (owner-led)', idea: 'The boundary: N22-1 builds Maps 40+ one at a time with the owner (idea, work it through, owner confirms, concrete, art). Seed only: the Grovebearer Dragon-Turtle held here (DV5), Legendary revealed, the first world boss of the every-10-maps run, the dinosaur era.',
       held: ['grovebearer-dragon-turtle'], carry: [], unsorted: [], ideas: [], base: ['grovebearer-dragon-turtle'], ownerLed: true,
       features: ['Legendary revealed', 'a world boss every 10 maps from 40 (docs/progression-2026-10-12.md)', 'dungeon slot 3', 'enemy Lv 7 introduced']},
};

// ---------------------------------------------------------------- every waiting card's one home
// kinds: pool (applied, a map that exists) | map (a proposed map, PLAN) | quest | secrets (Pack Secrets I) | faction | smith |
//        decision (an open owner call decides) | hold (an owner hold: Devilry 66, Ecclesia 77, spells shelved)
const HOME = {};
const put = (ids, h)=> ids.forEach(id=>{ if(HOME[id]) throw new Error('two homes: ' + id); HOME[id] = Object.assign({}, h); });
Object.entries(APPLY).forEach(([id, a])=> put([id], {kind: 'pool', map: a.map, role: a.role, why: a.why}));
Object.entries(PLAN).forEach(([no, P])=>{ put(P.held, {kind: 'map', map: +no}); (P.quest || []).forEach(id=> put([id], {kind: 'quest', map: +no, why: 'RP5 held it for Map 21+ (the map recs: an "advanced" Thistle Baron); the Baron\'s return, a quest on the Thornwold'})); });
// a proposed map's card that would bring a skill Maps 21-40 do not teach (owner, 2026-10-21: "Maps 21-40 use the skills already learnt")
const NEW_SKILL_EXCEPTIONS = {'war-drum-mandrill': 'durian', 'aye-aye-prowler': 'sunshy', 'velvet-worm': 'ichor', 'slow-loris': 'feeble', 'chilli-parrot': 'chilli', 'clinging-leech': 'parasite', 'glintsnatch-magpie': 'disarm', 'armory': 'weaponMaster'};
put(['armory'], {kind: 'map', map: 24, existing: true, held: true, why: 'Goldfeather Keep\'s armory (arrows +1, equipped allies +1/+1); not applied: Weapon Master is a skill no earlier card teaches (N221-2)'});
put(['missingno', 'glowing-gecko'], {kind: 'secrets', why: 'esoteric: MissingNo. is a hidden glitch; the Glowing Gecko is Irradiated, like the Mystery Booster\'s Irradiated Axolotl and Glow Wyrm (the map recs\' Map 33 "Irradiated" would bring Irradiated as a new skill)'});
put(['anvilwhisker-otter'], {kind: 'faction', side: 'otters', why: 'an Otter (the Legion\'s smith): faction cards come from the faction pool (progression plan); needs a Stone engine, which Maps 8 / 19 / 22 now give'});
put(['greyplume-fledgling'], {kind: 'faction', side: 'tribes', why: 'a Hummingbird starter ("hasn\'t chosen her plumage colour"); RW5 left it for the owner: the Hummingbird side of the faction pool, or Base'});
// 2026-10-26 (release 10-26c): two cards that arrived awaiting a source after N221 (CONTENT3's OVR fold and E16); their homes are owner calls.
put(['phoenix-mushrooms'], {kind: 'decision', why: "the owner's live card (folded 10-26, CONTENT3 OVR); Epic, Fungi, Undead; its source is his call"});
put(['mother-carrier'], {kind: 'decision', why: 'CONTENT3 E16, the Heroic Hummingbird Platform; its source is CONTENT3-3 (owner call)'});
put(['crowbar'], {kind: 'smith', why: 'equipment (+2/+0, Pry 1): the Blacksmith is its natural home (its creator note); a siege tool, so its art can lean on the Goldfeather Siege'});
put(['bog-shrew', 'mire-rat', 'hollow-belly-rat', 'gnawed-matriarch', 'kelpborn-otter', 'conger-eel', 'selkie-wavebinder'], {kind: 'decision', id: 'CONTENT2-3', why: 'open owner call (default: Maps 6 / 9 / 10 / 18); N221 offers the Carrion Moors (27, the Gnawed) and Stormcoast (28, the Tidefolk) as the "other sources" option (N221-6)'});
put(['frost-slick', 'magma-vent', 'bog-seep', 'miasma', 'rockfall', 'grave-call', 'smoke-screen', 'magnet'], {kind: 'hold', until: 'spells', why: 'SPELLS_SHELVED: no spell is obtainable until spells come back'});
const SPELL_HOMES = {'frost-slick': 'Map 22 (Rimefire Caldera)', 'magma-vent': 'Map 22 (Rimefire Caldera)', 'bog-seep': 'Map 27 (Carrion Moors)', 'miasma': 'Map 27 (Carrion Moors)', 'rockfall': 'Map 21 (Quiet Summit)', 'grave-call': 'Map 27 (Carrion Moors, its boss)', 'smoke-screen': 'Map 23 (Goldfeather Siege)', 'magnet': 'Map 24 (Goldfeather Keep, the most metal)'};
// the owner's era holds (decisions.json rules, 2026-10-21): "Devilry is found on Map 66, Ecclesia on Map 77"
const DEVILRY = ['cinder-imp', 'ash-imp', 'pit-glutton', 'brimstone-hound', 'blackmass-acolyte', 'dread-bell', 'tithe-collector', 'lurking-dread', 'puppeteer-imp', 'the-sixfold', 'fruit-bat-familiar', 'hellbender', 'flagellant-vulture', 'vampire-finch', 'ashmantle-fiend', 'chained-binturong'];
const ECCLESIA = ['shrine-acolyte', 'shrine-high-priest', 'blessed-avatar', 'shrine-bell-ringer', 'chapel-tortoise', 'chapel-sparrow', 'candle-moth', 'hymn-wren', 'abbey-goose', 'golden-magpie', 'friar-badger', 'storm-heron', 'vigil-owl', 'cathedral-eagle', 'glowworm-cluster'];
put(DEVILRY, {kind: 'hold', until: 66, why: 'Devilry (owner 10-21: found on Map 66; RP5 keeps the Basalt Foundry\'s devils held)'});
put(ECCLESIA, {kind: 'hold', until: 77, why: 'Ecclesia (owner 10-21: found on Map 77; DV5 holds the Cathedral Eagle for 77)'});

// ---------------------------------------------------------------- helpers
const readCards = ()=> JSON.parse(fs.readFileSync(CARDS_F, 'utf8'));
const readPools = ()=> JSON.parse(fs.readFileSync(POOLS_F, 'utf8'));
const mapById = id=> MAPS.find(m=> m.id === id);
const mapNo = id=> G.mapUnlockNumberOf(id);
const poolSize = P=> P.held.length + P.carry.length + P.unsorted.length + P.ideas.filter(x=> !/^side map:/.test(x)).length;
// skills a card brings that no live, sourced card with an earlier obtain map has (the curriculum's "taught"); plain flags excluded
const PLAIN = new Set(['triggers', 'diurnal', 'nocturnal', 'flying', 'tide', 'levelSkills']);
function taughtBy(cards, upTo){ const t = new Set(); cards.forEach(c=>{ if(c.awaitingSource || c.easterEgg || c.cardType === 'spell') return; const s = G.cardSourceOf(c);
  if(!c.source || !s || ['easteregg'].includes(s.kind)) return; if(G.cardObtainMap(c) > upTo) return; Object.keys(c.effects || {}).forEach(k=> t.add(k)); }); return t; }
const newSkillsOf = (c, taught)=> Object.keys(c.effects || {}).filter(k=> !PLAIN.has(k) && !taught.has(k));
// RW3 (owner GD2-3, tools/map_divvy_2026_10_22.js RW3_EXTRA_REWARDS): the extra skirmish exclusive a map of 21-40 got on top of DV3
const RW3_EXTRA_REWARDS = {m21: 1};
const roleKind = role=> role === 'boss' ? 'boss' : role === 'elite' ? 'elite' : 'skirmish';

// ---------------------------------------------------------------- the plan (record + report)
function build(){
  const cards = readCards(), by = Object.fromEntries(cards.map(c=> [c.id, c])), pools = readPools().maps, errs = [], notes = [];
  const waiting = cards.filter(c=> c.awaitingSource || HOME[c.id]).map(c=> c.id);
  // 1. every waiting card has one home, every home a card
  cards.filter(c=> c.awaitingSource).forEach(c=>{ if(!HOME[c.id]) errs.push('no home: ' + c.id); });
  Object.keys(HOME).forEach(id=>{ if(!by[id]) errs.push('home for a missing card: ' + id); });
  // 2. the proposed maps: 6-10 a map (Map 40 is a seed), ids exist, no carry card that is still waiting, rarity under the road's caps
  const taught20 = taughtBy(cards, 20), flagged = [];
  const seen = {};
  Object.entries(PLAN).forEach(([no, P])=>{ no = +no;
    const ids = [...P.held, ...P.carry, ...P.unsorted, ...(P.quest || [])]; ids.forEach(id=>{ if(!by[id]) errs.push(`Map ${no}: no card ${id}`); });
    [...P.carry, ...P.unsorted].forEach(id=>{ if(by[id] && by[id].awaitingSource) errs.push(`Map ${no}: ${id} is waiting, list it as held`); if(seen[id]) errs.push(`Map ${no}: ${id} is also on Map ${seen[id]}`); seen[id] = no; });
    if(!P.ownerLed){ const n = poolSize(P); if(n < 6 || n > 10) errs.push(`Map ${no}: pool ${n} (6-10)`); }
    const tier = packTierOf(no); if(!tier) errs.push(`Map ${no}: no pack tier`);
    P.held.forEach(id=>{ const c = by[id]; if(!c) return; const isBase = P.base.includes(id);
      const kind = isBase ? (no === 40 || STEP(c.rarity) > STEP(G.roadRarityCap(no, 'elite')) ? 'boss' : STEP(c.rarity) > STEP(G.roadRarityCap(no, 'skirmish')) ? 'elite' : 'skirmish') : null;
      if(isBase && STEP(c.rarity) > STEP(G.roadRarityCap(no, kind))) errs.push(`Map ${no}: skirmish-base ${id} (${c.rarity}) over the ${kind} cap ${G.roadRarityCap(no, kind)}`);
      if(!isBase && G.rarityIntroMap(c.rarity) > no) errs.push(`Map ${no}: pack card ${id} (${c.rarity}) before its reveal (Map ${G.rarityIntroMap(c.rarity)})`);
      if(G.roadNever(c.rarity)) errs.push(`Map ${no}: ${id} (${c.rarity}) never on the road`);
      if(c.mechanicLine === 'evolution' && no < 30) errs.push(`Map ${no}: Evomax ${id} before Map 30`);
      if(c.mechanicLine === 'devilry' || c.mechanicLine === 'grace') errs.push(`Map ${no}: ${id} is ${c.mechanicLine} (held for 66 / 77)`);
      const ns = newSkillsOf(c, taught20).filter(k=> !(c.mechanicLine === 'evolution' && /^(stem|stemGrant|evolute|evoluteAlpha|evoluteOmega)$/.test(k)));
      if(ns.length){ flagged.push({id, map: no, skills: ns}); if(!NEW_SKILL_EXCEPTIONS[id]) errs.push(`Map ${no}: ${id} brings ${ns.join(', ')}, not taught on Maps 0-20 and not an owner call`); } });
    P.base.forEach(id=>{ if(by[id] && !ids.includes(id)) errs.push(`Map ${no}: skirmish-base ${id} not in its pool`); });
  });
  // 3. the applied placements: a map that exists in Maps 21-24, a pack tier that exists, no new skill, the reveal
  Object.entries(APPLY).forEach(([id, a])=>{ const c = by[id], m = mapById(a.map); if(!c || !m){ errs.push('apply: ' + id + ' / ' + a.map); return; }
    const no = mapNo(a.map); if(no < 21 || no > 40) errs.push(`apply ${id}: Map ${no} is outside 21-40`);
    if(!LIVE_TIERS.includes(packTierOf(no))) errs.push(`apply ${id}: tier ${packTierOf(no)} is not live`);
    if(G.rarityIntroMap(c.rarity) > no) errs.push(`apply ${id}: ${c.rarity} not revealed by Map ${no}`);
    const ns = newSkillsOf(c, taught20); if(ns.length) errs.push(`apply ${id}: brings ${ns.join(', ')}`); });
  // 4. the existing Maps 21-24 (and the side maps that count as them): pools, skirmish rewards against the caps, DV3's count (reported)
  const existing = {};
  mains.filter(m=> { const n = mapNo(m.id); return n >= 21 && n <= 40; }).forEach(m=>{ const no = mapNo(m.id), P = normalizeEntry(pools[m.id] || {cards: []});
    const pending = Object.entries(APPLY).filter(([, a])=> a.map === m.id).map(([id])=> id);
    const cardsAfter = [...P.cards, ...pending.filter(id=> !P.cards.includes(id))];
    const rewards = cards.filter(c=> c.source && c.source.kind === 'map' && c.source.id === m.id && c.source.node && !(c.archetypes || []).includes('Leader') && c.cardType !== 'equipment');
    rewards.forEach(c=>{ const n = m.nodes.find(x=> x.key === c.source.node); if(!n){ errs.push(`${m.id}: reward ${c.id} on a missing fight`); return; }
      if(STEP(c.rarity) > STEP(G.roadRarityCap(no, n.kind || 'skirmish'))) errs.push(`${m.id}: reward ${c.id} (${c.rarity}) over ${n.key}'s cap`); });
    const earlier = new Set(); mains.filter(x=> mapNo(x.id) < no).forEach(x=> (normalizeEntry(pools[x.id] || {cards: []}).cards).forEach(id=> earlier.add(id)));
    const fresh = cardsAfter.filter(id=> !earlier.has(id) && by[id] && !(by[id].archetypes || []).includes('Leader'));
    const want = (fresh.length >= 10 ? 3 : fresh.length >= 6 ? 2 : 1) + (RW3_EXTRA_REWARDS[m.id] || 0); // DV3 + RW3's extra (GD2-3)
    existing[m.id] = {map: no, name: m.name, pool: cardsAfter.length, newCards: fresh.length, dv3Wants: want, rewards: rewards.map(c=> ({id: c.id, rarity: c.rarity, fight: c.source.node})), added: pending,
      sideMaps: MAPS.filter(x=> x.sub && x.parent !== 'mtut' && !x.endless && mapNo(x.id) === no && x.parent !== m.id).map(x=> x.id)};
    if(cardsAfter.length > 13) errs.push(`${m.id}: pool ${cardsAfter.length}`); });
  const homes = {}; Object.entries(HOME).forEach(([id, h])=>{ const c = by[id]; homes[id] = Object.assign({name: c ? c.name : id, rarity: c ? c.rarity : null}, h,
    h.kind === 'map' ? {packTier: packTierOf(h.map), role: (PLAN[h.map] && PLAN[h.map].base.includes(id)) ? 'skirmish-base' : 'pack'} : {},
    h.kind === 'pool' ? {packTier: packTierOf(mapNo(h.map)), mapNo: mapNo(h.map)} : {},
    NEW_SKILL_EXCEPTIONS[id] ? {newSkill: NEW_SKILL_EXCEPTIONS[id]} : {}, SPELL_HOMES[id] ? {thematicHome: SPELL_HOMES[id]} : {}); });
  const counts = {}; Object.values(HOME).forEach(h=>{ const k = h.kind === 'hold' ? 'hold ' + h.until : h.kind; counts[k] = (counts[k] || 0) + 1; });
  return {errs, notes, flagged, existing, homes, counts, waiting: waiting.length, by};
}

function plan(){
  const r = build(); if(r.errs.length){ console.error(r.errs.length + ' plan errors:\n  ' + r.errs.join('\n  ')); process.exit(1); }
  const by = r.by;
  const rec = {about: 'Package N221 (2026-10-24, owner N22-1): the Maps 21-40 divvy. homes: every card that waited for a source and its one home (kind pool = applied onto a map that exists; map = a proposed map; quest, secrets (Pack Secrets I), faction, smith, decision (an open owner call), hold (Devilry 66, Ecclesia 77, spells)). maps: the proposed Maps 25-40 (pool = held + carry + unsorted + new ideas; base = the skirmish-base cards). existing: Maps 21-24 after the pass. packTiers: the owner call N221-1. Made by node tools/n221_divvy_2026_10_24.js plan.',
    packTiers: PACK_TIERS.map(([t, a, b])=> ({tier: t, maps: [a, b], live: LIVE_TIERS.includes(t)})), counts: r.counts, homes: r.homes, existing: r.existing,
    maps: Object.fromEntries(Object.entries(PLAN).map(([no, P])=> [no, Object.assign({}, P, {packTier: packTierOf(+no), poolSize: P.ownerLed ? null : poolSize(P),
      caps: {skirmish: G.roadRarityCap(+no, 'skirmish'), elite: G.roadRarityCap(+no, 'elite'), boss: G.roadRarityCap(+no, 'boss')}})])),
    newSkillFlags: r.flagged};
  fs.writeFileSync(OUT_JSON, JSON.stringify(rec, null, 1) + '\n');
  fs.writeFileSync(OUT_MD, report(rec, by));
  console.log(`${Object.keys(r.homes).length} homes ${JSON.stringify(r.counts)}; ${Object.keys(PLAN).length} proposed maps; wrote ${path.relative(ROOT, OUT_JSON)} and .md`);
}

// ---------------------------------------------------------------- the report (docs/balance/n221-divvy-2026-10-24.md)
const RN = {common: 'C', uncommon: 'U', rare: 'R', veryrare: 'VR', superrare: 'SR', epic: 'E', heroic: 'H', unique: 'Uq', legendary: 'L', starter: 'St'};
function report(rec, by){
  const nm = id=> by[id] ? `${by[id].name} (${RN[by[id].rarity] || by[id].rarity})` : id;
  const L = [];
  L.push('# Maps 21-40: the divvy (package N221, 2026-10-24)', '',
    'Owner N22-1 (10-22): "Maps 21–40: another divvy pass like DV. **Maps 40+: build one map at a time**: the idea first, work it through, the owner confirms, then make it concrete, then create art." This pass gives each of the cards that waited for a source one home, extends the divvy over the Maps 21-24 that exist, and writes Maps 25-40 as a proposal table. Nothing new was built: no map, no deck, no card. Data: `docs/balance/n221-divvy-2026-10-24.json`, tool `tools/n221_divvy_2026_10_24.js` (`plan`, `apply`, `check`).', '');
  L.push('## The rules used', '',
    '- **Pools of 6-10 a map**, mostly the map\'s own cards and a short few carried from earlier maps (DV rule 2). Skirmish-base (first-clear) cards: 3 for 10 new cards, 2 for 6-9, 1 below (DV3); never a pack card.',
    '- **The road\'s rarity caps** (`roadRarityCap`): Maps 21-29 skirmish Super Rare, elite Epic (from 22), boss Heroic (from 25); Maps 30-39 skirmish Epic, elite Heroic, boss Unique; Map 40 skirmish Heroic, elite Unique, boss Legendary. A pack card only once its rarity is revealed (Epic 22, Heroic 25, Unique 30, Legendary 40).',
    '- **The eras** (owner 10-21): Maps 20-40 are stronger versions of the 0-20 animals and extinct look-alikes; dinosaurs from 40, magic from 50; **Devilry Map 66, Ecclesia Map 77, Evomax from Map 30**. **Maps 21-40 teach no new skill.**',
    '- **New ideas use only skills Maps 0-20 teach** (the curriculum in `docs/map-recommendations-2026-10-21.md`); their stats come from the formula once a map is confirmed.',
    '- **Most-thematic only** (progression plan, Tavern cards): a card goes where it fits the biome and people best (`docs/lore-bible.md`, `docs/map-recommendations-2026-10-21.md`), or waits.',
    '- **Pack tiers** (owner call N221-1, from the Pack 1-3 pattern of about 7 maps): ' + rec.packTiers.map(t=> `Pack ${t.tier} Maps ${t.maps[0]}-${t.maps[1]}${t.live ? '' : ' (proposal)'}`).join(', ') + '. Tier 4 exists in the data (no shop pack sells it yet); 5 and 6 are proposals.', '');
  // where every card went
  const groups = {}; Object.entries(rec.homes).forEach(([id, h])=>{ const k = h.kind === 'hold' ? `hold-${h.until}` : h.kind; (groups[k] = groups[k] || []).push(id); });
  const total = Object.keys(rec.homes).length;
  L.push(`## Where the ${total} waiting cards go`, '', '| Home | Cards | Count |', '|---|---|---|');
  const row = (label, k, f)=>{ const ids = groups[k] || []; if(ids.length) L.push(`| ${label} | ${ids.map(f || nm).join(', ')} | ${ids.length} |`); };
  row('**Applied:** a map that exists (pack card)', 'pool', id=> `${nm(id)} -> ${rec.homes[id].map} (Map ${rec.homes[id].mapNo}, Pack ${rec.homes[id].packTier})`);
  row('A proposed map, Maps 25-40 (proposal)', 'map', id=> `${nm(id)} -> Map ${rec.homes[id].map}${rec.homes[id].role === 'skirmish-base' ? ' (skirmish base)' : ''}${rec.homes[id].existing ? ' (exists; held, N221-2)' : ''}`);
  row('Quest-only special', 'quest', id=> `${nm(id)} -> Map ${rec.homes[id].map}`);
  row('Pack Secrets I', 'secrets'); row('Faction pool', 'faction', id=> `${nm(id)} (${rec.homes[id].side})`); row('The Blacksmith', 'smith');
  row('Open owner call CONTENT2-3', 'decision'); row('Held: spells shelved', 'hold-spells', id=> `${nm(id)} (${rec.homes[id].thematicHome})`);
  row('Held: Devilry, Map 66', 'hold-66'); row('Held: Ecclesia, Map 77', 'hold-77');
  L.push('', 'Skipped as already placed by the owner (they stay held where his decisions put them): the Devilry and Ecclesia cards (2026-10-21 rules, RP5, DV5), the Grovebearer Dragon-Turtle (DV5, Map 40: listed as Map 40\'s seed), the Thistle Baron (RP5, Map 21+: a quest on Map 32). The seven Gnawed and Tidefolk cards wait for CONTENT2-3 (its default homes are on Maps 6-18, outside this pass).', '');
  // existing maps
  L.push('## Maps 21-24 (they exist): after the pass', '', '| Map | Pool | New cards | Skirmish-base cards (DV3 asks) | Added now |', '|---|---|---|---|---|');
  Object.entries(rec.existing).forEach(([id, e])=> L.push(`| ${e.map} ${e.name} | ${e.pool} | ${e.newCards} | ${e.rewards.map(r=> `${nm(r.id)} ${r.fight}`).join(', ')} (${e.dv3Wants}${e.rewards.length !== e.dv3Wants ? ', has ' + e.rewards.length : ''}) | ${e.added.map(nm).join(', ') || '-'} |`));
  L.push('', '- **The Rimefire Caldera (22)** takes the Petrified Tree as a Pack 4 card (petrified forests form under volcanic ash; a Stone maker beside the fire and ice). Its skirmish-base count is unchanged (10+ new cards, 3 exclusives).',
    '- The Quiet Summit (21), the Goldfeather Siege (23) and Goldfeather Keep (24) take nothing: no waiting card fits them without a new skill (the Armory, Keep, is N221-2) or an era hold (the Summit\'s shrine birds are Ecclesia, Map 77).',
    '- The Rimefire Caldera (13) and the Goldfeather Siege (12) are over the 6-10 guide (they grew in earlier packages): owner call N221-4. Every skirmish-base card on Maps 21-24 sits under its fight\'s cap (checked).',
    '- Side maps counted on these maps: the Ice Hollow (off 17, counts as 21) and the Basalt Foundry (off 19, counts as 23, its devils held for 66); the Long Burrow (under 22) is an endless dungeon and sets no card\'s map.', '');
  // proposal table
  L.push('## Maps 25-40: the proposal table', '', 'A plan, not built. Each map is made concrete only after the owner\'s yes (N221-5); Map 40 starts the one-at-a-time process (N22-1).', '',
    '| Map | Biome and idea | Pool (held / carried / unsorted / new idea) | Skirmish base | Pack | Caps (skirmish / elite / boss) | Already pinned there |', '|---|---|---|---|---|---|---|');
  Object.entries(rec.maps).forEach(([no, P])=>{ const parts = [];
    if(P.held.length) parts.push('held: ' + P.held.map(nm).join(', ')); if(P.carry.length) parts.push('carried: ' + P.carry.map(nm).join(', '));
    if(P.unsorted.length) parts.push('unsorted: ' + P.unsorted.map(nm).join(', ')); if(P.ideas.length) parts.push('new ideas: ' + P.ideas.join('; '));
    if(P.quest) parts.push('quest-only: ' + P.quest.map(nm).join(', '));
    L.push(`| ${no} **${P.name}** | ${P.biome}. ${P.idea} | ${parts.join('. ')}${P.poolSize != null ? ` (${P.poolSize})` : ''} | ${P.base.map(x=> by[x] ? nm(x) : x).join(', ')} | ${P.packTier} | ${P.caps.skirmish} / ${P.caps.elite} / ${P.caps.boss} | ${P.features.join('; ') || '-'} |`); });
  L.push('', 'Rarity of the held cards against the caps: every held card is under its map\'s cap; the Grovebearer (Legendary) only fits Map 40\'s boss, where it was held (DV5). "Unsorted" cards have no source today and fight only as enemies (Hagfish Silencer, Geode Scorpion, Leopard Seal, Gloom Gibbon: the map recommendations\' homes); a "new idea" is a card to make, by the formula, once the map is confirmed.', '');
  // flags
  L.push('## New-skill flags (owner call N221-2)', '', 'Maps 21-40 teach no new skill (owner 10-21). These held cards carry a skill no card a player can get on Maps 0-20 has:', '');
  Object.entries(NEW_SKILL_EXCEPTIONS).forEach(([id, k])=>{ const h = rec.homes[id]; L.push(`- ${nm(id)}: \`${k}\`, home Map ${h.map}${h.existing ? ' (Goldfeather Keep; not applied)' : ''}.`); });
  L.push('', 'The five rainforest ones were held for Map 25 by the owner\'s RP5 (later and more specific than the 10-21 rule), so the default is to keep them there. Alternatives: Maps 0-20 homes (the Leech to the Mire, off Map 6; the Glintsnatch Magpie to the Briar Maze, Map 12; the Armory to the Forge\'s Map 11), Pack Secrets I, or Map 40+.', '');
  L.push('## Owner calls', '', 'In `docs/decisions.json` as N221-1 .. N221-7.', '');
  return L.join('\n') + '\n';
}

// ---------------------------------------------------------------- apply (onto maps that exist only)
function apply(){
  const r = build(); if(r.errs.length){ console.error(r.errs.join('\n')); process.exit(1); }
  const raw = fs.readFileSync(CARDS_F, 'utf8'), cards = JSON.parse(raw), doc = readPools(); let n = 0;
  Object.entries(APPLY).forEach(([id, a])=>{ const c = cards.find(x=> x.id === id), no = mapNo(a.map);
    const src = {kind: 'pack', tier: packTierOf(no), map: a.map};
    if(c.source && JSON.stringify(c.source) === JSON.stringify(src) && !c.awaitingSource) return;
    delete c.awaitingSource; c.source = src;
    c.creatorNote = (c.creatorNote ? c.creatorNote + ' ' : '') + `2026-10-24 (package N221, owner N22-1, the Maps 21-40 divvy): a Pack ${src.tier} card of ${mapById(a.map).name} (Map ${no}): ${a.why} (owner call N221-3).`;
    const P = normalizeEntry(doc.maps[a.map]); if(!P.cards.includes(id)) P.cards.push(id); doc.maps[a.map] = P; n++; });
  if(!n){ console.log('nothing to apply (already applied)'); return; }
  // cards.json keeps its format (python json.dumps(indent=2), ASCII: non-ASCII as \uXXXX), so the diff is the change only
  fs.writeFileSync(CARDS_F, JSON.stringify(cards, null, 2).replace(/[\u007f-\uffff]/g, ch=> '\\u' + ch.charCodeAt(0).toString(16).padStart(4, '0')) + '\n');
  fs.writeFileSync(POOLS_F, serialize(doc)); JSON.parse(fs.readFileSync(POOLS_F, 'utf8'));
  console.log(`applied ${n}: ${Object.keys(APPLY).join(', ')}. Next: node tools/forge_curve_2026_10_19.js maps && node tools/unit_themes.js`);
}

// ---------------------------------------------------------------- check (live files, after apply)
function check(){
  const r = build(), fails = r.errs.slice(), ok = (c, m)=>{ if(!c) fails.push(m); };
  const cards = readCards(), by = Object.fromEntries(cards.map(c=> [c.id, c])), pools = readPools().maps;
  const obtain = JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical', 'card-obtain-maps.json'), 'utf8')).maps;
  // applied: sourced, out of awaiting, in exactly one main pool's MAP tier (its source map), tier by map, obtain map regenerated
  Object.entries(APPLY).forEach(([id, a])=>{ const c = by[id], no = mapNo(a.map);
    ok(c && !c.awaitingSource && c.source && c.source.kind === 'pack' && c.source.map === a.map && c.source.tier === packTierOf(no), `${id}: source pack tier ${packTierOf(no)} map ${a.map} (${JSON.stringify(c && c.source)})`);
    const homes = Object.entries(pools).filter(([, P])=> (P.cards || []).includes(id)).map(([k])=> k);
    ok(homes.length === 1 && homes[0] === a.map, `${id}: in one map pool, ${a.map} (${homes.join(', ')})`);
    ok(obtain[id] === G.cardObtainMap(c) && obtain[id] === no, `${id}: card-obtain-maps ${obtain[id]} (game ${G.cardObtainMap(c)}, want ${no})`); });
  // no card both waiting and sourced; every waiting card homed (build) and none homed onto an applied pool while still waiting
  cards.forEach(c=>{ if(c.awaitingSource && c.source) fails.push(`${c.id}: awaiting and sourced`); });
  Object.entries(HOME).forEach(([id, h])=>{ if(h.kind !== 'pool' && by[id] && !by[id].awaitingSource) fails.push(`${id}: homed as ${h.kind} (a proposal) but has a source now: re-plan it`); });
  // every pack card of Maps 21-24 sits in its map's pool and carries the tier of its map (consistency of the sources the pass relies on)
  cards.forEach(c=>{ const s = c.source; if(!s || s.kind !== 'pack' || !s.map) return; const m = mapById(s.map); if(!m || m.sub) return; const no = mapNo(s.map); if(no < 21 || no > 40) return;
    const P = pools[s.map] || {}; ok([...(P.cards || []), ...(P.special || [])].includes(c.id), `${c.id}: a pack card of ${s.map} but not in its pool (MAP or SPECIAL: the Magnate Duck is 24-8's SPECIAL card)`);
    ok(+s.tier === packTierOf(no), `${c.id}: tier ${s.tier} on Map ${no} (want ${packTierOf(no)})`); });
  if(fails.length){ console.log(fails.length + ' FAILED:\n  ' + fails.join('\n  ')); process.exit(1); }
  console.log(`all N221 checks pass: ${Object.keys(HOME).length} homes ${JSON.stringify(r.counts)}; ${Object.keys(PLAN).length} proposed maps`);
}

module.exports = {PACK_TIERS, packTierOf, APPLY, PLAN, HOME, NEW_SKILL_EXCEPTIONS, DEVILRY, ECCLESIA, build};
if(require.main === module){ const cmd = process.argv[2] || 'plan'; ({plan, apply, check})[cmd](); }
