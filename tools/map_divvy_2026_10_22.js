#!/usr/bin/env node
// 2026-10-22 (package DV, the map divvy; owner 00:43: "Assist me to now divvy creatures to each map such that: 1) Each place is roughly
// diverse and interesting to that biome 2) It uses a mix of cards of that region and maybe a short few of cards from previous regions
// ... roughly 6-10 cards per map ... 3) Map 1 has 1 uncommon in the last match 4) Map 2 has 2 uncommons 5) Map 5 introduces our first
// rare 6) Map 10 introduces our first very rare 7) Map 20 introduces our first super rare. 8) Now submaps ... 10) Rearrange our base
// cards so that their rarity is better distributed. Then rearrange our faction cards ... 11) ... decide which (1-2) will be skirmish
// rewards. The rest will be generic pack rewards. 12) The Dragon Lair will actually introduce a Heroic, and the other submap will
// introduce an Epic! 13) Map 21+ ..."). docs/map-divvy-2026-10-22.md.
//   node tools/map_divvy_2026_10_22.js plan     -> docs/balance/map-divvy-2026-10-22.json (rarity changes, source moves in RP's record
//                                                  format, every rebuilt enemy deck, the side-map gates), checked against the rules;
//                                                  apply the cards with python3 tools/map_divvy_apply_2026_10_22.py, the decks with `decks`
//   node tools/map_divvy_2026_10_22.js decks    -> writes the planned decks, showcases and side-map gates into arena_app.js
//   node tools/map_divvy_2026_10_22.js pools    -> canonical/map-pools.json from the plan and the live CONQUEST_MAPS
//   node tools/map_divvy_2026_10_22.js check    -> the rules, on the live files (after apply): exit 1 on any failure
// The ladder itself is the game's (arena_app.js ROAD_RARITY: roadRarityCap, RARITY_INTRO), read through tools/lib_bramble.js.
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
const OUT = path.join(ROOT, 'docs', 'balance', 'map-divvy-2026-10-22.json');
const POOLS_OUT = path.join(ROOT, 'canonical', 'map-pools.json');
const B = require('./lib_bramble.js'), G = B.G, MAPS = G.CONQUEST_MAPS;
const CARDS_RAW = JSON.parse(fs.readFileSync(path.join(ROOT, 'canonical', 'cards.json'), 'utf8'));
// The plan is made from the cards as they were before the pass: once applied, `plan` first puts back (in memory) every rarity and
// source the last record changed, so running it again gives the same plan (as RP's tool does). The decks are planned from the record's
// own `from` decks for the same reason.
const PRIOR = process.argv[2] === 'plan' && fs.existsSync(OUT) ? (()=>{ try{ return JSON.parse(fs.readFileSync(OUT, 'utf8')); }catch(e){ return null; } })() : null;
if(PRIOR){ const byId = Object.fromEntries(CARDS_RAW.map(c=> [c.id, c]));
  (PRIOR.rarityChanges || []).forEach(r=>{ if(byId[r.id]) byId[r.id].rarity = r.from; });
  (PRIOR.moves || []).forEach(m=>{ const c = byId[m.id]; if(!c) return; delete c.awaitingSource; if(m.from === 'awaitingSource'){ delete c.source; c.awaitingSource = true; } else if(m.from === 'base') delete c.source; else c.source = m.from; });
  Object.entries(PRIOR.decks || {}).forEach(([mid, nodes])=>{ const m = MAPS.find(x=> x.id === mid); if(!m) return; Object.entries(nodes).forEach(([k, x])=>{ const n = m.nodes.find(y=> y.key === k); if(n) n.deck = x.from; }); });
  Object.entries(PRIOR.submaps || {}).forEach(([sid, S])=>{ const m = MAPS.find(x=> x.id === sid); if(!m) return; if(S.gateBefore && typeof S.gateBefore === 'object'){ m.entry.afterMapCleared = S.gateBefore.id; } if(S.shieldBefore != null) m.shieldMap = S.shieldBefore; else if(S.shield != null) delete m.shieldMap; }); }
const mains = MAPS.filter(m=> !m.sub && !m.reserved);
const mapNo = id=>{ const m = MAPS.find(x=> x.id === id); if(!m) return null; return mains.indexOf(m.sub ? MAPS.find(x=> x.id === m.parent) : m); };
const STEP = r=> G.roadRarityStep(r);

// ---------------------------------------------------------------- the data
// Rarity changes (rule 10 and the ladder). old -> new; every one is re-fitted by tools/refit_pass_2026_10_21.js.
const RARITY = {
  // Map 0 holds no Uncommon (Map 1's last match brings the first): the owner's Map 0 decks keep their cards, these two step down
  'fox-kit': 'common', 'terrier-pup': 'common',
  // Maps 2-4 hold no Rare (Map 5 brings the first)
  'grey-seal-bull': 'uncommon', 'peregrine-stooper': 'uncommon', 'golden-eagle-diver': 'uncommon', 'old-sturgeon': 'uncommon',
  // a Very Rare for Maps 10-19 (Map 10 brings the first) and Map 21
  'colossal-squid': 'veryrare', 'ibex-rockcaller': 'veryrare', 'shimmerwing-stag': 'veryrare', 'savanna-cheetah': 'veryrare', 'talon-archer': 'veryrare',
  'dhole-matriarch': 'veryrare', 'dust-devil-kestrel': 'veryrare', 'echidna-quillshot': 'veryrare', 'woodland-brawler': 'veryrare', 'snow-leopard': 'veryrare',
  // Map 20 brings the first Super Rare
  'ossuary-lammergeier': 'superrare',
  // rule 12: the Volcano Lair (the Dragon Lair) reveals Heroic, the Eye of the Volcano Epic; Legendary waits for Map 40 (proposal)
  'caldera-wyrm': 'heroic', 'fire-drake-hatchling': 'heroic', 'the-contradiction': 'epic', 'magnate-duck': 'heroic',
  // rule 10, Base: mostly Common, some Uncommon, a few Rare (starter cards stay Starter)
  'soldier-ant': 'common', 'bee-knight': 'common', 'meerkat-wayfarer': 'common', 'dominion-nestguard': 'common', 'sunthroat-courier': 'common', 'bee-drone': 'uncommon',
  // rule 10, faction cards: a smoother pyramid on each side (Otter C8 U6 R4 VR1 SR1 E1 H1; Hummingbird C6 U4 R3 VR1 H1; shared as it was)
  'riverstone-slinger': 'rare', 'optio-of-the-ford': 'veryrare', 'otter-royal-guard': 'superrare', 'hush-wing-spy': 'common', 'swordbill-challenger': 'rare',
};
// Each main map's pool (rule 2: 6-10 creatures, a short few carried over from earlier maps), its 1-2 skirmish rewards (card: fight)
// and its special cards (a card one fight needs outside the pool: the boss it is named for). The rest of the pool are basic-pack
// cards with that map (rule 11). Map 0's decks are the owner's own and stay: its pool is what they hold.
const POOLS = {
  m1:  {rewards: {'chipmunk-skirmisher': '0-1', 'terrier-pup': '0-4'}, extra: ['farm-dog'], ownerDecks: true},
  mf:  {cards: ['cricket-drummer', 'dormouse', 'compost-grub', 'bramble-sprout', 'field-vole', 'field-mouse', 'quarry-mole', 'harvest-mouse', 'meadow-frog', 'badger-lumberjack'],
        rewards: {'cricket-drummer': '1-1', 'badger-lumberjack': '1-5'}},
  mb:  {cards: ['fiddler-crab-swarm', 'pincushion-urchin', 'gull-thief', 'tidepool-trapper-crab', 'tide-pool-crab', 'open-ocean-hermit-crab', 'sea-turtle-elder', 'conch-crawler', 'grey-seal-bull', 'conch-herald'],
        rewards: {'fiddler-crab-swarm': '2-1', 'grey-seal-bull': '2-5'}},
  mc:  {cards: ['puffin-diver', 'hawk-arrowkeeper', 'peak-condor', 'kittiwake-flock', 'red-billed-chough', 'fulmar-spitter', 'razorbill', 'mountain-goat-climber', 'peregrine-stooper', 'golden-eagle-diver'],
        rewards: {'puffin-diver': '3-2', 'golden-eagle-diver': '3-7'}},
  m2:  {cards: ['snapstick-turtle', 'stone-turtle-warden', 'water-vole', 'box-turtle', 'water-shrew', 'river-mink', 'muskrat-lodgekeeper', 'pyrenean-desman', 'platypus-spur', 'old-sturgeon'],
        rewards: {'platypus-spur': '4-3', 'old-sturgeon': '4-5'}},
  mw:  {cards: ['snapper-hatchling', 'constrictor-coil', 'venomlord-serpent', 'crocodile-ambusher', 'swamp-alligator', 'caiman-hatchling', 'grass-viper', 'grass-snake', 'fen-mink', 'alligator-gar'],
        rewards: {'grass-viper': '5-4', 'alligator-gar': '5-7'}},
  m8:  {cards: ['poison-dart-croaker', 'camouflage-frog', 'marsh-wisp', 'mire-witch-heron', 'constrictor-coil', 'bogfire-newt', 'newt-doctor', 'booming-bittern', 'raven-scout', 'adder-ambusher'],
        rewards: {'newt-doctor': '6-5', 'adder-ambusher': '6-8'}, special: {'venomlord-serpent': ['6-5']}},
  mu:  {cards: ['compost-grub', 'dung-beetle', 'leafcutter-gardener', 'hollow-oath-keeper', 'owl-nightwatch', 'fungal-colossus', 'truffle-piglet', 'ant-warrior', 'planarian-splitter', 'wolf-spider-mother'],
        rewards: {'truffle-piglet': '7-1', 'wolf-spider-mother': '7-6'}},
  m4:  {cards: ['blind-cave-fish', 'cave-olm', 'star-nosed-mole', 'sulfur-cinder-moth', 'stalactite-golem', 'nightshade-moth', 'vampire-bat', 'whip-spider', 'giant-cave-huntsman', 'echo-screecher'],
        rewards: {'star-nosed-mole': '8-2', 'echo-screecher': '8-8'}},
  mk:  {cards: ['mangrove-mudskipper', 'minnow-skitter', 'mudpuppy', 'mangrove-monitor', 'reef-shark', 'archerfish', 'sunbittern-strider', 'banded-sea-krait', 'mangrove-kingfisher', 'mangrove-manatee'],
        rewards: {'mangrove-kingfisher': '9-3', 'mangrove-manatee': '9-7'}},
  m7:  {cards: ['clownfish-scout', 'parrotfish', 'kraken-spawnling', 'coral-reef-shark', 'riptide-eel', 'electric-ray', 'lions-mane-jelly', 'swordfish-spearman', 'great-barracuda', 'colossal-squid'],
        rewards: {'electric-ray': '10-2', 'colossal-squid': '10-9'}, special: {'orca-vanguard': ['10-9']}},
  m10: {cards: ['alpine-marmot', 'chipmunk-hoarder', 'eyrie-warden', 'mountain-hare', 'mountain-goat-climber', 'apollo-butterfly', 'balloon-archer', 'chamois-leaper', 'eagle-owl-quartermaster', 'ibex-rockcaller'],
        rewards: {'chamois-leaper': '11-9', 'ibex-rockcaller': '11-10'}},
  mh:  {cards: ['field-mouse', 'hedgehog-scout', 'bramble-hoglet', 'mouse-sapper', 'seed-cache-squirrel', 'cunning-vixen', 'hedge-weasel', 'lyrebird-mimic', 'quillguard', 'thorn-shrike'],
        rewards: {'hedgehog-scout': '12-5', 'quillguard': '12-7'}},
  mr:  {cards: ['fox-kit', 'swift-fox', 'berserker-boar', 'stag-knight', 'grizzly-vanguard', 'tasmanian-devil', 'woodpecker-sapper', 'bramblewood-lynx', 'fawn-scout', 'shimmerwing-stag'],
        rewards: {'fawn-scout': '13-1', 'shimmerwing-stag': '13-8'}},
  m5:  {cards: ['springbok-pronker', 'hoopoe-herald', 'meerkat-burrower', 'weaver-bird', 'dust-hyena', 'grave-grin-hyena', 'pangolin-roller', 'marula-elephant', 'spitting-cobra', 'savanna-cheetah'],
        rewards: {'grave-grin-hyena': '14-2', 'savanna-cheetah': '14-8'}},
  ml:  {cards: ['pronghorn-racer', 'warhorse-charger', 'cataphract-destrier', 'shepherds-bark', 'stable-colt', 'border-collie', 'bison-bulldozer', 'stoat-cutthroat', 'raccoon-bandit', 'talon-archer'],
        rewards: {'border-collie': '15-2', 'talon-archer': '15-7'}},
  mt:  {cards: ['snowshoe-hare', 'frost-hare-sprinter', 'dhole-runner', 'trickster-fox', 'alpha-howler', 'boreal-elk', 'woodland-caribou', 'wolf-pack-runner', 'taiga-lynx', 'dhole-matriarch'],
        rewards: {'woodland-caribou': '16-3', 'dhole-matriarch': '16-7'}},
  m6:  {cards: ['snow-ermine', 'harbor-seal', 'glacial-ape-king', 'snow-bunting-archer', 'spitting-spider', 'frostmoon-howler', 'ravenous-wolverine', 'lone-grey-wolf', 'walrus-icebreaker', 'polar-bear'],
        rewards: {'lone-grey-wolf': '17-2', 'walrus-icebreaker': '17-8'}},
  md:  {cards: ['thorny-devil', 'roadrunner-courier', 'sandfish', 'komodo-warlord', 'caustic-scorpion', 'fennec-fox', 'dromedary', 'antlion-pit', 'obsidian-scorpion', 'dust-devil-kestrel'],
        rewards: {'antlion-pit': '18-6', 'dust-devil-kestrel': '18-7'}, special: {'sand-widow': ['18-7']}},
  m3:  {cards: ['cinder-stoker', 'magma-titan', 'phoenix-fledgling', 'yeti', 'glacier-wolf-pack', 'porcupine-roller', 'scree-goat', 'fire-salamander', 'quill-volley', 'echidna-quillshot'],
        rewards: {'fire-salamander': '19-3', 'echidna-quillshot': '19-6'}},
  m11: {cards: ['pack-mule', 'cinder-skeleton', 'ashbone-ghoul', 'cave-warlord', 'bear-cub', 'magma-wraith', 'ash-cloud-condor', 'magma-salamander', 'woodland-brawler', 'ossuary-lammergeier'],
        rewards: {'magma-wraith': '20-7', 'ossuary-lammergeier': '20-10'}, special: {'ancient-sloth-titan': ['20-9']}},
  m21: {cards: ['pika-hoarder', 'glacier-yak', 'eagle-sharpshooter', 'alpine-marmot', 'mountain-goat-climber', 'scree-goat', 'golden-eagle-diver', 'snow-leopard', 'snow-owl-sentinel'],
        rewards: {'eagle-sharpshooter': '21-4', 'snow-owl-sentinel': '21-6'}},
  m22: {cards: ['cinder-gecko', 'cinder-hornet', 'gorge-wyrm', 'permafrost-mammoth', 'ice-petrel', 'rimefire-salamander', 'badger-berserker', 'fumarole-ibex', 'ur-elk', 'caldera-snow-leopard'],
        rewards: {'rimefire-salamander': '22-2', 'caldera-snow-leopard': '22-8'}, special: {'rimeheart-colossus': ['22-8']}},
  m23: {cards: ['mouse-sapper', 'badger-trench-digger', 'pack-mule', 'balloon-archer', 'howdah-archers', 'siege-rhino', 'trebuchet-crew', 'testudo-tortoise', 'beetle-battering-ram', 'war-elephant'],
        rewards: {'testudo-tortoise': '23-2', 'war-elephant': '23-8'}, special: {'marshal-tuskwell': ['23-8']}},
  m24: {cards: ['duckling-squadron', 'elderhorn-monarch', 'tax-collector-teal', 'lodge-engineer', 'goose-sentry', 'mallard-halberdier', 'mallard-marauder', 'battlement-heron', 'gilded-swan-knight', 'iron-warden'],
        rewards: {'iron-warden': '24-6', 'gilded-swan-knight': '24-8'}, special: {'magnate-duck': ['24-8']}},
};
// The boss cards (owner brief: keep the fights' roles and boss cards): a fight named for a pool card always fields it
const NAMED = {'7-5': 'hollow-oath-keeper', '7-6': 'fungal-colossus', '8-8': 'stalactite-golem', '13-8': 'shimmerwing-stag', '16-7': 'alpha-howler', '17-8': 'glacial-ape-king',
  '19-6': 'yeti', '20-5': 'cave-warlord', '20-10': 'cave-warlord'};
// A pool card's home map (where it is a reward or a pack card) is the first map whose pool holds it; later pools carry it over.
// Side maps (rule 8: open after a later main map, not in order; rule 9: may go past the parent's rarity and count): the gate
// (entry.afterMapCleared), the map its fights count as (shieldMap), and its 1-3 new cards (card: fight); the unique each already has stays.
const SUBMAPS = {
  mq:  {gate: 'mh', shield: 12, cards: {'lucky-hopper': '1-A-5'}},             // Clovermead (off Map 1): after Map 12 (was 5), an early side map opened late
  mp:  {gate: 'm8', shield: 6, cards: {'riverworks-bastion': '2-A-7'}},         // Lilypad Reach (off 2): after 6 (kept)
  mg:  {gate: 'mu', shield: 7, cards: {'octopus-tactician': '2-B-4'}},          // Smugglers' Grotto (off 2): after 7 (owner's own example)
  ms:  {gate: 'mr', shield: 13, cards: {'hedgehog-herbalist': '5-A-4'}},        // The Sunken Grove (off 5): after 13 (was 9)
  mz:  {gate: 'm4', shield: 8, cards: {'rootworm-colony': '7-A-5'}},            // The Mycelium Deep (off 7): after 8, a map after its parent (was 11)
  mn:  {gate: 'mt', shield: 16, cards: {'lantern-spark-fly': '8-A-4'}},         // The Glimmer Depths (off 8): after 16 (was 12)
  mj:  {gate: 'm10', shield: 11, cards: {'blue-ringed-octopus': '10-A-5'}},     // The Sunken Depths (off 10): after 11, a map after its parent (was 14)
  mv:  {gate: 'ml', shield: 15, cards: {'wound-reaver': '11-A-4'}},             // The Aerie Vault (off 11): after 15 (kept)
  my:  {gate: 'md', shield: 18, cards: {'jaguar-stalker': '14-A-5', 'hercules-beetle': '14-A-4', 'kinkajou-lurker': '14-A-3'}}, // The Canopy (off 14): after 18 (kept), + 2 held rainforest cards
  mi:  {gate: 'm21', shield: 21, cards: {'greenland-shark': '17-A-4'}},         // The Ice Hollow (off 17): after 21 (kept)
  mo:  {gate: 'mi', shield: 17, cards: {'ent': '0-B-4'}},                       // The Old Bramble (off 0): after the Ice Hollow (kept)
  mpd: {gate: 'm3', shield: 19, cards: {'quicksand-queen': '18-A-9'}},          // The Pale Desert (off 18): after 19, a map after its parent (was 18 itself)
  m9:  {gate: 'm23', shield: 23, cards: {'ember-revenant': '19-A-10'}},         // The Basalt Foundry (off 19): after 23 (kept)
  me:  {gate: null, cards: {'the-contradiction': '20-A-4'}},                    // Eye of the Volcano (off 20): after 20-10 (kept); reveals Epic (rule 12)
  mx:  {gate: null, cards: {'fire-drake-hatchling': '20-B-4'}},                 // Volcano Lair, the Dragon Lair (off 20): after 20-10 (kept); reveals Heroic (rule 12)
};
// Held (awaitingSource) for a later map: the Legendary Dragon-Turtle the Siege paid (Legendary is revealed on Map 40, proposal)
const HOLD = {'grovebearer-dragon-turtle': {map: 40, why: 'Legendary is revealed on Map 40 (the rarity ladder, proposal): it left 23-8\'s deck and rewards'}};
// Leaders (the Leader archetype: the map leaders a boss pays, the Triumvirate) keep their place: they are outside the ladder, as before.

// ---------------------------------------------------------------- helpers
const deepClone = o=> JSON.parse(JSON.stringify(o));
function cardsAfter(){ // cards.json as it will be (in memory): new rarities; sources from the plan when given
  const cs = deepClone(CARDS_RAW); cs.forEach(c=>{ if(RARITY[c.id]) c.rarity = RARITY[c.id]; }); return cs; }
const isLeader = c=> (c.archetypes || []).includes('Leader');
const byIdOf = cs=> Object.fromEntries(cs.map(c=> [c.id, c]));
const kindOf = n=> G.baseKind ? G.baseKind(n.kind || 'skirmish') : (n.kind || 'skirmish');
const fightNo = (m, n)=>{ G.NODE_MAP_HINT.set(n, m.id); return m.sub ? G.fightMapNumber(n) : mapNo(m.id); };
const isNormalSkirmish = n=> (n.kind || 'skirmish') === 'skirmish';
const isRaid = n=> /^(raidboss|megaraid)$/.test(n.kind || ''); // a raid boss's own deck (baseKind counts a worldboss as one: not here)
const rarOf = (by, id)=> (by[id] && by[id].rarity) || 'common';

// the skirmish fights of a main map in order (raid bosses keep their own decks)
const buildable = m=> (m.nodes || []).filter(n=> n.deck && !isRaid(n) && n.kind !== 'tutorial');

// ---------------------------------------------------------------- the deck builder
const COPY_W = [4, 3, 2.5, 2, 1.5, 1, 1, 1, 1];
const SOFT_CAP = [5, 4, 3, 2, 2, 1, 1, 1, 1]; // copies a card in one deck (under the rarity's own limit), so a deck spreads over its cards
function buildDecks(m, pool, special, by){
  const no = mapNo(m.id), nodes = buildable(m), N = nodes.length, used = {}, out = {};
  pool.forEach(id=> used[id] = 0);
  nodes.forEach((n, i)=>{
    const S = Object.values(n.deck).reduce((a, b)=> a + b, 0), t = N > 1 ? i / (N - 1) : 1, kind = n.kind || 'skirmish';
    const capS = STEP(G.roadRarityCap(no, kind));
    const sp = Object.keys(special || {}).filter(id=> special[id].includes(n.key));
    const avail = pool.filter(id=> STEP(rarOf(by, id)) <= capS);
    const hi = Math.max(...avail.map(id=> STEP(rarOf(by, id))));
    // early skirmishes stay a step lighter than the map's top card (when enough lighter cards exist)
    let use = avail;
    if(isNormalSkirmish(n) && t < 0.4){ const lo = avail.filter(id=> STEP(rarOf(by, id)) < hi); if(lo.length >= 4) use = lo; }
    const must = [...sp];
    if(!isNormalSkirmish(n)){ // the boss card: the old deck's top card when it is in the pool, else the pool's top card
      const old = Object.keys(n.deck).filter(id=> use.includes(id)).sort((a, b)=> STEP(rarOf(by, b)) - STEP(rarOf(by, a)) || n.deck[b] - n.deck[a])[0];
      const top = use.slice().sort((a, b)=> STEP(rarOf(by, b)) - STEP(rarOf(by, a)) || used[a] - used[b] || a.localeCompare(b))[0];
      const boss = old && STEP(rarOf(by, old)) >= STEP(rarOf(by, top)) ? old : top; if(boss && !must.includes(boss)) must.push(boss);
    }
    // the fight's own reward card is met on its enemy deck (meet it, then win it)
    Object.keys(POOLS[m.id].rewards || {}).forEach(id=>{ if(POOLS[m.id].rewards[id] === n.key && use.includes(id) && !must.includes(id)) must.push(id); });
    if(n.showcase && use.includes(n.showcase) && !must.includes(n.showcase)) must.push(n.showcase);
    if(NAMED[n.key] && use.includes(NAMED[n.key]) && !must.includes(NAMED[n.key])) must.push(NAMED[n.key]); // the boss the fight is named for
    const D = Math.max(Math.min(S <= 12 ? 4 : S <= 15 ? 5 : S <= 18 ? 6 : 7, use.length + sp.length), must.length);
    const chosen = [...must];
    // keep TS2's thematic picks: the old deck's cards that are in the pool, most copies first
    Object.keys(n.deck).filter(id=> use.includes(id) && !chosen.includes(id)).sort((a, b)=> n.deck[b] - n.deck[a] || a.localeCompare(b)).forEach(id=>{ if(chosen.length < D) chosen.push(id); });
    // fill: cards not yet seen on this map first, then the rarity this point of the map leans to, then commons
    const target = Math.round(t * hi);
    const rest = use.filter(id=> !chosen.includes(id)).sort((a, b)=> (used[a] > 0) - (used[b] > 0) || Math.abs(STEP(rarOf(by, a)) - target) - Math.abs(STEP(rarOf(by, b)) - target) || used[a] - used[b] || a.localeCompare(b));
    while(chosen.length < D && rest.length) chosen.push(rest.shift());
    // at least one Common card (two copies or more) in every deck
    if(!chosen.some(id=> STEP(rarOf(by, id)) === 0)){ const c = use.filter(id=> STEP(rarOf(by, id)) === 0).sort((a, b)=> used[a] - used[b] || a.localeCompare(b))[0];
      if(c){ const drop = chosen.slice().reverse().find(id=> !must.includes(id)); if(drop && chosen.length >= D) chosen.splice(chosen.indexOf(drop), 1); chosen.push(c); } }
    // the copies: weighted by rarity, inside each rarity's copy limit; more cards when the limits can't fill the deck
    const alloc = ()=>{ const d = {}; chosen.forEach(id=> d[id] = must.includes(id) ? 1 : 0); let left = S - must.length, guard = 0;
      const w = id=> COPY_W[Math.min(STEP(rarOf(by, id)), 8)] * (sp.includes(id) && STEP(rarOf(by, id)) >= 3 ? 0.5 : 1);
      while(left > 0 && guard++ < 500){ const c = chosen.filter(id=> d[id] < Math.min(G.maxCopiesForRarity(rarOf(by, id)), SOFT_CAP[Math.min(STEP(rarOf(by, id)), 8)])).sort((a, b)=> (d[a] + 1) / w(a) - (d[b] + 1) / w(b) || a.localeCompare(b))[0]; if(!c) break; d[c]++; left--; }
      return {d, left}; };
    let r = alloc();
    while(r.left > 0 && rest.length){ chosen.push(rest.shift()); r = alloc(); }
    if(r.left > 0) throw new Error(`${m.id} ${n.key}: can't fill ${S} cards from ${chosen.join(', ')}`);
    const deck = r.d;
    // rule 13 (Maps 21+): the low rarities barely shrink: Common and Uncommon at least 40% of a normal skirmish deck
    if(no >= 21 && isNormalSkirmish(n)){ let guard = 0; const low = ()=> chosen.filter(id=> STEP(rarOf(by, id)) <= 1).reduce((a, id)=> a + deck[id], 0);
      while(low() < Math.ceil(0.4 * S) && guard++ < 50){ const hiC = chosen.filter(id=> STEP(rarOf(by, id)) > 1 && deck[id] > 1 && !must.includes(id)).sort((a, b)=> deck[b] - deck[a])[0];
        const loC = chosen.filter(id=> STEP(rarOf(by, id)) <= 1 && deck[id] < G.maxCopiesForRarity(rarOf(by, id))).sort((a, b)=> deck[a] - deck[b])[0]; if(!hiC || !loC) break; deck[hiC]--; deck[loC]++; } }
    chosen.forEach(id=>{ if(used[id] != null) used[id]++; });
    const showcase = n.showcase && !deck[n.showcase] ? chosen.slice().sort((a, b)=> STEP(rarOf(by, b)) - STEP(rarOf(by, a)) || a.localeCompare(b))[0] : null;
    // tidy order: rarity, then id
    const tidy = {}; Object.keys(deck).sort((a, b)=> STEP(rarOf(by, a)) - STEP(rarOf(by, b)) || a.localeCompare(b)).forEach(id=>{ if(deck[id] > 0) tidy[id] = deck[id]; });
    out[n.key] = {from: n.deck, to: tidy, showcase};
  });
  return {out, used};
}

// ---------------------------------------------------------------- the plan
function homeOf(){ const home = {}; mains.forEach(m=>{ const P = POOLS[m.id]; if(!P) return; (P.cards || []).forEach(id=>{ if(!home[id]) home[id] = m.id; }); Object.keys(P.rewards || {}).forEach(id=>{ if(!home[id] || P.rewards[id]) home[id] = home[id] || m.id; }); (P.extra || []).forEach(id=>{ if(!home[id]) home[id] = m.id; }); }); return home; }
function map0Cards(){ const m = MAPS.find(x=> x.id === 'm1'); const s = new Set(); m.nodes.forEach(n=> Object.keys(n.deck || {}).forEach(id=> s.add(id))); Object.keys(POOLS.m1.rewards).forEach(id=> s.add(id)); (POOLS.m1.extra || []).forEach(id=> s.add(id)); return [...s]; }
function poolOf(mid){ return mid === 'm1' ? map0Cards() : POOLS[mid].cards; }

function plan(){
  const cs = cardsAfter(), by = byIdOf(cs), errs = [];
  const home = homeOf();
  // every card named in the data exists
  [...Object.keys(RARITY), ...Object.values(POOLS).flatMap(P=> [...(P.cards || []), ...Object.keys(P.rewards || {}), ...Object.keys(P.special || {}), ...(P.extra || [])]),
   ...Object.values(SUBMAPS).flatMap(s=> Object.keys(s.cards)), ...Object.keys(HOLD)].forEach(id=>{ if(!by[id]) errs.push('no card ' + id); });
  if(errs.length){ console.error(errs.join('\n')); process.exit(1); }
  // the source moves (RP's record format: id, name, rarity, group, from, to, obtainBefore, obtainAfter)
  const moves = [], to = {}; // id -> new source ({kind:'map'...} | {kind:'pack', tier:1, map} | 'awaitingSource')
  const skirmishReward = {};
  mains.forEach(m=>{ const P = POOLS[m.id]; Object.keys(P.rewards || {}).forEach(id=>{ skirmishReward[id] = {kind: 'map', id: m.id, node: P.rewards[id]}; }); });
  Object.keys(SUBMAPS).forEach(sid=>{ Object.entries(SUBMAPS[sid].cards).forEach(([id, node])=>{ skirmishReward[id] = {kind: 'map', id: sid, node}; }); });
  const keepKinds = new Set(['base', 'raid', 'smith', 'nest', 'quest', 'secret', 'materia', 'easteregg']);
  const srcKind = c=> c.source ? (c.source.kind === 'pack' && +c.source.tier === 11 ? 'faction' : c.source.kind) : (c.awaitingSource ? 'awaitingSource' : G.cardSourceOf(c).kind);
  // 1. skirmish rewards
  Object.entries(skirmishReward).forEach(([id, s])=> to[id] = s);
  // 2. the rest of each pool: a basic-pack card of its home map (Base, faction and the special kinds keep their own source)
  Object.entries(home).forEach(([id, mid])=>{ if(to[id]) return; const c = by[id], k = srcKind(c); if(k === 'faction' || keepKinds.has(k) || isLeader(c)) return; to[id] = {kind: 'pack', tier: 1, map: mid}; });
  // 3. held
  Object.keys(HOLD).forEach(id=> to[id] = 'awaitingSource');
  // 4. every other skirmish reward on a main map (not a leader): a basic-pack card of that map (it keeps its obtain map)
  cs.forEach(c=>{ if(to[c.id] || !c.source || c.source.kind !== 'map' || !c.source.node || isLeader(c) || c.cardType === 'equipment') return;
    const m = MAPS.find(x=> x.id === c.source.id); if(!m || m.sub) return; to[c.id] = {kind: 'pack', tier: 1, map: m.id}; });
  // side-map rewards not in SUBMAPS stay as they are; check none is left over
  cs.forEach(c=>{ if(c.source && c.source.kind === 'map' && !isLeader(c)){ const m = MAPS.find(x=> x.id === c.source.id); if(m && m.sub && m.id !== 'mtut' && !to[c.id] && !SUBMAPS[m.id]) errs.push('side reward with no plan ' + c.id); } });
  const obtainOf = c=> G.cardObtainMap(c);
  Object.entries(to).forEach(([id, s])=>{ const c0 = CARDS_RAW.find(c=> c.id === id), c = by[id];
    const from = c0.source ? deepClone(c0.source) : (c0.awaitingSource ? 'awaitingSource' : 'base');
    const same = JSON.stringify(from) === JSON.stringify(s); if(same) return;
    const after = s === 'awaitingSource' ? Object.assign({}, c, {source: undefined, awaitingSource: true}) : Object.assign({}, c, {source: s, awaitingSource: undefined});
    moves.push({id, name: c.name, rarity: c.rarity, group: s === 'awaitingSource' ? 'held' : s.kind === 'map' ? (MAPS.find(x=> x.id === s.id).sub ? 'side-map' : 'skirmish-reward') : 'pack',
      from, to: s, obtainBefore: obtainOf(c0), obtainAfter: s === 'awaitingSource' ? 0 : obtainOf(after), held: HOLD[id] || undefined}); });
  // the decks
  const decks = {}, coverage = {};
  mains.forEach(m=>{ const P = POOLS[m.id]; if(P.ownerDecks) return; const r = buildDecks(m, P.cards, P.special, by); decks[m.id] = r.out; coverage[m.id] = r.used; });
  // the side-map decks: only cards over the ladder at the side map's (new) count are swapped, for the parent pool's nearest card
  Object.entries(SUBMAPS).forEach(([sid, S])=>{ const m = MAPS.find(x=> x.id === sid); const no = S.shield != null ? Math.max(S.shield, mapNo(m.parent) + 1) : fightNo(m, m.nodes.find(n=> n.deck));
    const ppool = poolOf(m.parent);
    m.nodes.forEach(n=>{ if(!n.deck || n.kind === 'tutorial' || isRaid(n)) return; const cap = STEP(G.roadRarityCap(no, n.kind || 'skirmish', sid)); const d = Object.assign({}, n.deck); let changed = false;
      Object.keys(d).forEach(id=>{ if(STEP(rarOf(by, id)) <= cap) return; const sub = ppool.filter(x=> STEP(rarOf(by, x)) <= cap && !d[x]).sort((a, b)=> STEP(rarOf(by, b)) - STEP(rarOf(by, a)) || a.localeCompare(b))[0];
        if(!sub){ errs.push(`${sid} ${n.key}: ${id} over the cap and nothing to swap`); return; } d[sub] = Math.min(d[id], G.maxCopiesForRarity(rarOf(by, sub))); const lost = d[id] - d[sub]; delete d[id]; changed = true;
        if(lost > 0){ const c = Object.keys(d).find(x=> STEP(rarOf(by, x)) === 0 && d[x] + lost <= G.maxCopiesForRarity(rarOf(by, x))); if(c) d[c] += lost; else errs.push(`${sid} ${n.key}: ${lost} copies lost`); } });
      if(changed){ (decks[sid] = decks[sid] || {})[n.key] = {from: n.deck, to: d, showcase: null}; } }); });
  const submaps = {}; Object.entries(SUBMAPS).forEach(([sid, S])=>{ const m = MAPS.find(x=> x.id === sid); submaps[sid] = {name: m.name, parent: m.parent, parentMap: mapNo(m.parent),
    gateBefore: m.entry && m.entry.afterMapCleared ? {id: m.entry.afterMapCleared, map: mapNo(m.entry.afterMapCleared)} : (m.entry && m.entry.after) || null,
    gate: S.gate ? {id: S.gate, map: S.gate === 'mi' ? 'the Ice Hollow' : mapNo(S.gate)} : (m.entry && m.entry.after) || null, shieldBefore: m.shieldMap != null ? m.shieldMap : null, shield: S.shield != null ? S.shield : null,
    newCards: Object.keys(S.cards).map(id=> ({id, name: by[id].name, rarity: by[id].rarity, node: S.cards[id]}))}; });
  const rarityChanges = Object.keys(RARITY).map(id=>{ const c0 = CARDS_RAW.find(c=> c.id === id); return {id, name: c0.name, from: c0.rarity, to: RARITY[id]}; }).filter(x=> x.from !== x.to);
  if(errs.length){ console.error(errs.join('\n')); process.exit(1); }
  const rec = {about: 'Package DV (2026-10-22): the map divvy. pools: each main map\'s cards (rewards: the 1-2 skirmish rewards; the rest are basic-pack cards with that map); rarityChanges (re-fitted by tools/refit_pass_2026_10_21.js); moves: every card source move in RP\'s format (from/to are sources; "awaitingSource" = held); decks: every rebuilt enemy deck (from/to); submaps: gates and new cards. Made by node tools/map_divvy_2026_10_22.js plan; cards applied by python3 tools/map_divvy_apply_2026_10_22.py, decks by node tools/map_divvy_2026_10_22.js decks.',
    ladder: G.RARITY_INTRO, pools: Object.fromEntries(mains.map(m=> [m.id, {map: mapNo(m.id), name: m.name, cards: poolOf(m.id), rewards: POOLS[m.id].rewards, special: POOLS[m.id].special || {}}])),
    rarityChanges, moves, decks, submaps, held: HOLD};
  fs.writeFileSync(OUT, JSON.stringify(rec, null, 1) + '\n');
  const cnt = {}; moves.forEach(x=> cnt[x.group] = (cnt[x.group] || 0) + 1);
  console.log(`${rarityChanges.length} rarity changes, ${moves.length} source moves ${JSON.stringify(cnt)}, ${Object.values(decks).reduce((a, d)=> a + Object.keys(d).length, 0)} decks`);
  Object.entries(coverage).forEach(([mid, u])=>{ const miss = Object.keys(u).filter(id=> !u[id]); if(miss.length) console.log(`  ${mid}: pool cards in no deck: ${miss.join(', ')}`); });
}

// ---------------------------------------------------------------- writing the decks and gates into arena_app.js
function writeDecks(){
  const rec = JSON.parse(fs.readFileSync(OUT, 'utf8')), APP = path.join(ROOT, 'arena_app.js'); let s = fs.readFileSync(APP, 'utf8');
  const a = s.indexOf('const CONQUEST_MAPS = ['), b = s.indexOf('\nconst TOWER_LEVEL_CAP', a); let region = s.slice(a, b), n = 0;
  const esc = k=> k.replace(/[-]/g, '\\-');
  Object.entries(rec.decks).forEach(([mid, nodes])=> Object.entries(nodes).forEach(([key, x])=>{
    const re = new RegExp(`\\{ ?key:\\s*"${esc(key)}",[^\\n]*`, 'g'); const hits = region.match(re) || [];
    if(hits.length !== 1) throw new Error(`${mid} ${key}: ${hits.length} lines`);
    let line = hits[0]; const old = line;
    line = line.replace(/deck:\{[^}]*\}/, 'deck:' + JSON.stringify(x.to));
    if(x.showcase) line = line.replace(/showcase:"[^"]*"/, `showcase:"${x.showcase}"`);
    if(line !== old){ region = region.replace(old, line); n++; } }));
  // side-map gates (entry.afterMapCleared) and the map they count as (shieldMap)
  let g = 0;
  Object.entries(rec.submaps).forEach(([sid, S])=>{ if(!S.gate || typeof S.gate !== 'object') return;
    const re = new RegExp(`\\{ id:"${sid}", sub:true,[^\\n]*`); const mm = region.match(re); if(!mm) throw new Error('no side map line ' + sid); let line = mm[0]; const old = line;
    line = line.replace(/afterMapCleared:"[^"]*"/, `afterMapCleared:"${S.gate.id}"`);
    if(S.shield != null){ if(/shieldMap:\d+/.test(line)) line = line.replace(/shieldMap:\d+/, 'shieldMap:' + S.shield); else line = line.replace(/sub:true, parent:"([^"]*)",/, `sub:true, parent:"$1", shieldMap:${S.shield},`); }
    if(line !== old){ region = region.replace(old, line); g++; } });
  s = s.slice(0, a) + region + s.slice(b); fs.writeFileSync(APP, s);
  console.log(`wrote ${n} decks, ${g} side-map gates`);
}

// ---------------------------------------------------------------- canonical/map-pools.json (the coordinator's shape, owner 00:51)
function writePools(){
  const rec = JSON.parse(fs.readFileSync(OUT, 'utf8'));
  const deckIds = n=> Object.keys(n.deck || {});
  const out = {_about: 'Per-map card pools (owner 2026-10-22): which cards belong to each map. Skirmish deck editors offer only these. Tiers: cards (the map\'s pool), special (cards added for one unusual skirmish), submaps (each side map\'s own pool and special).', maps: {}};
  mains.forEach(m=>{ const cards = rec.pools[m.id].cards.slice(); const special = Object.keys(rec.pools[m.id].special || {});
    // a raid boss's own deck (11-R, 20-R) is one unusual fight: its cards outside the pool are special
    m.nodes.forEach(n=> deckIds(n).forEach(id=>{ if(!cards.includes(id) && !special.includes(id)) special.push(id); }));
    const subs = {};
    MAPS.filter(x=> x.sub && x.parent === m.id).forEach(sm=>{ const own = [], sp = [];
      const newer = SUBMAPS[sm.id] ? Object.keys(SUBMAPS[sm.id].cards) : []; newer.forEach(id=> own.push(id));
      // the cards its fights use; an endless dungeon's or the tutorial's decks are its own and listed whole
      const use = {}; sm.nodes.forEach(n=> deckIds(n).forEach(id=> use[id] = (use[id] || 0) + 1));
      Object.keys(use).sort().forEach(id=>{ if(own.includes(id) || cards.includes(id)) return; own.push(id); });
      subs[sm.id] = {cards: own, special: sp}; });
    out.maps[m.id] = {cards, special, submaps: subs}; });
  fs.writeFileSync(POOLS_OUT, JSON.stringify(out, null, 2) + '\n');
  console.log('canonical/map-pools.json:', Object.keys(out.maps).length, 'maps');
}

// ---------------------------------------------------------------- the checks (on the live files, after apply)
function check(){
  const cs = CARDS_RAW, by = byIdOf(cs), fails = [], ok = (c, msg)=>{ if(!c) fails.push(msg); };
  const pools = JSON.parse(fs.readFileSync(POOLS_OUT, 'utf8')).maps;
  const R = id=> rarOf(by, id);
  // 1. the ladder, every enemy deck (main and side maps; not raid bosses, tutorials, endless dungeons)
  MAPS.forEach(m=>{ if(m.reserved || m.endless || m.id === 'mtut') return; (m.nodes || []).forEach(n=>{ if(!n.deck || isRaid(n)) return; const no = fightNo(m, n);
    Object.keys(n.deck).forEach(id=> ok(G.roadRarityOk(R(id), no, n.kind, m.id), `ladder: ${m.id} ${n.key} (Map ${no}, ${n.kind}) holds ${id} (${R(id)})`));
    (n.leaders || []).forEach(id=> ok(G.roadRarityOk(R(id), no, n.kind, m.id), `ladder: ${m.id} ${n.key} leader ${id} (${R(id)})`));
    // the copy limits and package DR's caps (Legendary 3 with the leader, Mythic 2, Ancient and up 1 each)
    Object.entries(n.deck).forEach(([id, k])=> ok(k <= G.maxCopiesForRarity(R(id)), `copies: ${m.id} ${n.key} ${id} x${k} over ${G.maxCopiesForRarity(R(id))}`));
    const cnt = r=> Object.entries(n.deck).filter(([id])=> STEP(R(id)) === STEP(r)).reduce((a, [, k])=> a + k, 0) + (n.leaders || []).filter(id=> STEP(R(id)) === STEP(r)).length;
    ok(cnt('legendary') <= 3 && cnt('mythic') <= 2 && ['ancient', 'divine', 'void', 'daemonic'].every(r=> cnt(r) <= 1), `DR caps: ${m.id} ${n.key}`);
    // every normal skirmish deck holds Commons (two copies at least)
    if(isNormalSkirmish(n)) ok(Object.entries(n.deck).filter(([id])=> STEP(R(id)) === 0).reduce((a, [, k])=> a + k, 0) >= 2, `commons: ${m.id} ${n.key} has under 2 Common copies`);
    // rule 13 (Maps 21+): the low rarities barely shrink, Common + Uncommon at least 40% of a normal skirmish deck
    if(!m.sub && mapNo(m.id) >= 21 && isNormalSkirmish(n)){ const S = Object.values(n.deck).reduce((a, b)=> a + b, 0), low = Object.entries(n.deck).filter(([id])=> STEP(R(id)) <= 1).reduce((a, [, k])=> a + k, 0);
      ok(low >= Math.ceil(0.4 * S), `rule 13: ${m.id} ${n.key} Common+Uncommon ${low}/${S}`); }
  }); });
  // 2. every reward (skirmish reward, a pack card with a map) against the ladder at its map; leaders are outside it
  cs.forEach(c=>{ const s = c.source; if(!s || isLeader(c) || c.easterEgg) return;
    if(s.kind === 'map' && s.node){ const m = MAPS.find(x=> x.id === s.id); if(!m) return; const n = m.nodes.find(x=> x.key === s.node); if(!n){ fails.push('reward of a missing fight ' + c.id); return; }
      ok(G.roadRarityOk(c.rarity, fightNo(m, n), n.kind, m.id), `ladder: reward ${c.id} (${c.rarity}) on ${m.id} ${n.key}`); }
    if(s.kind === 'pack' && s.map) ok(G.cardObtainMap(c) >= G.rarityIntroMap(c.rarity), `pack ${c.id}: obtainable before its rarity's reveal`); });
  // 3. the introductions, as a player walks the road: the first map (main or side) where each rarity is met or won
  const firstAt = {}; const note = (r, where, no)=>{ const k = G.ROAD_RARITY_STEPS[STEP(r)]; if(!firstAt[k] || no < firstAt[k].no) firstAt[k] = {no, where}; };
  MAPS.forEach(m=>{ if(m.reserved || m.endless || m.id === 'mtut') return; m.nodes.forEach(n=>{ if(!n.deck || isRaid(n)) return; const no = fightNo(m, n) + (m.sub ? 0.5 : 0); Object.keys(n.deck).forEach(id=> note(R(id), `${m.id} ${n.key}`, no)); }); });
  cs.forEach(c=>{ const s = c.source; if(!s || isLeader(c) || s.kind !== 'map' || !s.node) return; const m = MAPS.find(x=> x.id === s.id); if(!m || m.id === 'mtut') return; const n = m.nodes.find(x=> x.key === s.node); if(n) note(c.rarity, `${m.id} ${n.key} reward`, fightNo(m, n) + (m.sub ? 0.5 : 0)); });
  const want = {uncommon: 1, rare: 5, veryrare: 10, superrare: 20, epic: 21, heroic: 21};
  Object.entries(want).forEach(([r, at])=> ok(firstAt[r] && Math.floor(firstAt[r].no) >= at, `first ${r}: ${JSON.stringify(firstAt[r])} before Map ${at}`));
  ok(firstAt.epic && /^me /.test(firstAt.epic.where), 'first Epic is not the Eye of the Volcano: ' + JSON.stringify(firstAt.epic));
  ok(firstAt.heroic && /^mx /.test(firstAt.heroic.where), 'first Heroic is not the Volcano Lair: ' + JSON.stringify(firstAt.heroic));
  // Map 1: one Uncommon, in its last match only; Map 2: two Uncommons
  const kindsOn = (mid, r)=>{ const m = MAPS.find(x=> x.id === mid), s = new Set(); m.nodes.forEach(n=> Object.keys(n.deck || {}).forEach(id=>{ if(STEP(R(id)) === STEP(r)) s.add(id); }));
    cs.forEach(c=>{ if(c.source && c.source.kind === 'map' && c.source.id === mid && !isLeader(c) && STEP(c.rarity) === STEP(r)) s.add(c.id); }); return s; };
  const u1 = kindsOn('mf', 'uncommon'), m1 = MAPS.find(x=> x.id === 'mf'), last = m1.nodes[m1.nodes.length - 1];
  ok(u1.size === 1 && [...u1].every(id=> last.deck[id] && m1.nodes.every(n=> n === last || !n.deck[id])), `Map 1 Uncommons: ${[...u1].join(', ')} (want 1, in ${last.key} only)`);
  ok(kindsOn('mb', 'uncommon').size === 2, `Map 2 Uncommons: ${[...kindsOn('mb', 'uncommon')].join(', ')} (want 2)`);
  ok(kindsOn('m1', 'uncommon').size === 0, `Map 0 Uncommons: ${[...kindsOn('m1', 'uncommon')].join(', ')}`);
  // 4. the pools: 6-10 a map (Map 0's owner decks aside); 1-2 skirmish rewards a main map (leaders aside), never also a pack card
  mains.forEach((m, i)=>{ const P = pools[m.id]; if(i > 0) ok(P.cards.length >= 6 && P.cards.length <= 10, `pool size ${m.id}: ${P.cards.length}`);
    const rw = cs.filter(c=> c.source && c.source.kind === 'map' && c.source.id === m.id && c.source.node && !isLeader(c) && c.cardType !== 'equipment');
    ok(rw.length >= 1 && rw.length <= 2, `skirmish rewards ${m.id}: ${rw.map(c=> c.id).join(', ')}`); });
  // 5. map-pools.json covers every deck (coordinator 00:51)
  MAPS.forEach(m=>{ if(m.reserved) return; const main = m.sub ? MAPS.find(x=> x.id === m.parent) : m, P = pools[main.id]; if(!P){ fails.push('no pool for ' + main.id); return; }
    const sub = m.sub ? P.submaps[m.id] : null; if(m.sub && !sub){ fails.push(`no submap ${m.id} under ${main.id}`); return; }
    m.nodes.forEach(n=> Object.keys(n.deck || {}).forEach(id=>{ const inPool = P.cards.includes(id) || (!m.sub && P.special.includes(id)) || (sub && (sub.cards.includes(id) || sub.special.includes(id)));
      ok(inPool, `map-pools: ${m.id} ${n.key} uses ${id}, in no pool`); })); });
  // a side map's new cards: not on a main map's deck or reward up to its gate
  Object.entries(SUBMAPS).forEach(([sid, S])=>{ const gateNo = S.gate ? (S.gate === 'mi' ? 21 : mapNo(S.gate)) : 20;
    Object.keys(S.cards).forEach(id=> mains.slice(0, gateNo + 1).forEach(m=> m.nodes.forEach(n=>{ if(!isRaid(n)) ok(!(n.deck || {})[id], `${sid}'s new card ${id} is on ${m.id} ${n.key}`); }))); });
  if(fails.length){ console.log(fails.length + ' FAILED:\n  ' + fails.join('\n  ')); process.exit(1); }
  console.log('all DV checks pass. First met/won:', Object.entries(firstAt).map(([k, v])=> `${k} ${v.where}`).join('; '));
}

module.exports = {RARITY, POOLS, SUBMAPS, HOLD};
if(require.main === module){ const cmd = process.argv[2] || 'plan'; ({plan, decks: writeDecks, pools: writePools, check})[cmd](); }
