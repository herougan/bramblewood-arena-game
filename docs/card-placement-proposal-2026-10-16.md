# Card placement, rarity and field effects (2026-10-16)

This replaces `card-placement-proposal-2026-10-15.md` and `field-effects-and-map-gaps-2026-10-15.md`. Unlike those two, most of it is **built**: the rarity rules, the card placement and the field effects are in the game now. The new field effects from "field effects 2" were merged in and placed too; only Leylines and Haunted are just noted, for Map 40+.

The full lists are in `docs/card-placement-proposal-2026-10-16.xlsx`:
- **Placement:** every card (609), where it fights, what it pays, its pack, and why.
- **Rarity economy:** the rules below as tables, the pack odds, the relabels, and the rarity mix of every map's decks.
- **Field curriculum:** map by map, what is on it now and what waits for the new effects.
- **Map gaps:** each map's defining skills and types, and what is missing.
- **Changes made:** every change to the game, fight by fight.

Map numbers are the game's (Map 0 is the Outskirts; side maps are 0-A, 0-B …). The difficulty file counted from 1 until today; it now also carries the game's numbers.

## The short version

- **Rarity is a rule now**, checked by a test: Very Rare can appear in normal skirmishes from Map 16, the odd Super Rare from Map 21, the first Epic at Map 36, Heroic at 41, Unique at 51. Map 1–19 bosses have no Heroics. The dragon lair boss (the Caldera Wyrm, 20-B-4) is the only Legendary in Maps 0–20.
- **Packs lose commons pack by pack**: Pack 1 (Hedgerow Pouch) 50%, Pack 2 (Tidemire Chest) 46%, Pack 3 (Highcrest Case) 42%, Packs 4–6 40/38/36%, Pack 7 on 35% down to the 30% floor.
- **71 of the 94 new cards are on the road**, each as its fight's card reward. 23 wait for maps that don't exist yet (their suggested map is 22 or later, or they are Epic/Legendary).
- **63 more cards that no enemy ever played** (old unplaced cards and pack cards nobody had met) now fight somewhere.
- **Field effects follow your curriculum**, the new ones included:
  - Mist on 0-T; the Tide on Pebble Beach with one Tide-spout fight; River Rapids only on Sunken Hollow.
  - Darkness (not Pitch Black) in Smugglers' Grotto; Pitch Black and Crushing Depths in the Sunken Depths, with no night or First Blood.
  - Landslide in the caves; Rook's Row, Bishop's Path and Mirage on 12; High Canopy on 13; Undergrowth and Tall Grass on 15; Consternation on 16; Hail on 17; Slippery on 17-A; Glass-storm on 18; Lava Spout on 19-A; Scorching III on 20.
- **Difficulty**: Map 0 and Maps 9–20 were retuned toward a smoothly rising curve. The strong deck now wins most fights on Maps 10–16 instead of 7–30% of the elites and bosses.

## 1. Rarity economy

### Packs

Packs are numbered in the order they go on sale: **Pack 1** Hedgerow Pouch (Map 5), **Pack 2** Tidemire Chest (Map 8), **Pack 3** Highcrest Case (Map 13). Those three are the packs of Maps 0–20. Packs 4 and up are the ones that open after Map 20, so "after Map 20, fewer and fewer commons" and your per-pack bands are the same rule.

| Pack | Commons | Your band |
|---|---|---|
| 1 Hedgerow Pouch | 50% | 40–50% |
| 2 Tidemire Chest | 46% | 40–50% |
| 3 Highcrest Case | 42% | 40–50% |
| 4 / 5 / 6 | 40% / 38% / 36% | 35–45% |
| 7 / 8 / 9 / 10 / 11 | 35% / 34% / 33% / 32% / 31% | 30–35% |
| 12 on | 30% | the floor |

How it works: a numbered pack first rolls the rarity of each card (commons at the pack's share), then picks a card of that rarity. The rest is split Uncommon 60 : Rare 32 : Very Rare 5 : Super Rare 2 : Epic 1 between the rarities the pool has. Today's base pool (21 commons, 5 uncommons, 17 rares, 1 Epic) gives Pack 1 about 50% common, 32% uncommon, 17% rare, 0.5% Epic. Before, every pack was about **75% common**.

- The Mystery Booster has no number and keeps its own odds.
- No Legendary from Packs 1–3, and no "jackpot" pack there. Faction packs, Faction Rewards and Faction Growth hold back Legendaries (the Old Willow of the Ford) until you reach Map 21.

### Enemy decks and card rewards

The highest rarity a fight may field or pay. A side map counts as its parent map.

| Maps | Skirmish | Elite | Boss |
|---|---|---|---|
| 0–9 | Rare | Rare | Very Rare |
| 10–15 | Rare | Very Rare | Epic (no Heroic) |
| 16–19 | **Very Rare** | Super Rare | Epic (no Heroic) |
| 20 | Very Rare | Super Rare | Unique; the dragon lair boss **Legendary** |
| 21–35 | **Super Rare** | Epic | Legendary |
| 36–40 | **Epic** | Heroic | Legendary |
| 41–50 | **Heroic** | Unique | Legendary |
| 51+ | **Unique** | Legendary | Legendary |

- Maps 21–40: at least a quarter of every skirmish deck is Rare or better.
- Outside the rule: raid bosses, the tutorials, the Heroic map leaders a boss pays, and the secret.
- The first Very Rare in a skirmish is the Lone Grey Wolf (17-2); the first Super Rare is the Snow Owl Sentinel (21-2).

What broke the rule, and the fix:
- **The Cathedral Eagle (Legendary)** was Map 11's boss reward. It is now the reward of its own boss, 21-6.
  Map 11's boss pays the new **Ibex Rockcaller** (Avalanche) instead, which also joined the Avalanche Colossus's deck.
- **T-4 The Final Exam** fielded the Cathedral Eagle. It now has an Ash-cloud Condor and two Golden Eagle Divers.
- **20-B-3** (a normal skirmish) fielded the Ember Revenant (Epic). A Magma Salamander took its place.

Relabels, so the curve reads true:
- **12 babies and small animals, Rare → Uncommon**: Fox Kit, Bear Cub, Fawn Scout, Stable Colt, Plains Zebra, Dust Hyena, Mountain Goat Climber, Bog Leech, Cave Flitter, Grass Viper, Rockslide Ram, Warren Scout. Cub Clearing (13-1) was 11 rares out of 13.
- **Very Rare**: Ür-Elk and Lone Grey Wolf (both Map 16+).
- **Super Rare**: Snow Owl Sentinel (Map 21). Until today the game had no Super Rare card at all.

The Heroic leaders that Map 0–19 bosses pay (the Thistle Baron, the Old Shell …) are untouched: they are leaders, not deck cards, and they never fight in the boss's deck.

## 2. Card placement

The order of priorities was the same as yesterday: who lives there first, then the skill curriculum, then rarity. A new card mostly went to its suggested map. When that map was the wrong place for the animal, it went to the next map where it lives, so savanna animals went to Map 14, rainforest ones to the Canopy, devil birds to the Foundry.

Each new card fights in one fight (one or two copies) and is that fight's card reward: you see it before you win it.

| Map | New cards (fight) |
|---|---|
| 1-A Clovermead | Paper Wasp (1-A-2) |
| 2-A Lilypad Reach | Lotus Frog (2-A-1), Mayfly Dancer (2-A-4) |
| 4 Sunken Hollow | Jay Pilferer (4-1), Box Turtle (4-2), Platypus Spur (4-3) |
| 5-A The Sunken Grove | Star-nosed Mole (5-A-1) |
| 6 Sable Swampmire | Carrion Beetle (6-5), Lamprey (6-1) |
| 7 The Morel Hollow | Nightjar Drifter (7-4), Leafcutter Gardener (7-2) |
| 7-A The Mycelium Deep | Planarian Splitter (7-A-1) |
| 8 Caves & Alcoves | Vampire Bat Nurse (8-3) |
| 8-A The Glimmer Depths | Oilbird (8-A-2) |
| 9 The Kelp Mangroves | Sunbittern Strider (9-3), Mudflat Godwit (9-1), Archerfish (9-6), Piranha Shoal (9-2) |
| 10 Coral Current | Electric Ray (10-2), Sawfish (10-4), Mantis Shrimp (10-7), Cone Snail (10-3), Cleaner Wrasse (10-1) |
| 10-A The Sunken Depths | Swordfish Spearman (10-A-4), Blue-ringed Octopus (10-A-5) |
| 11 Eyrie Heights | Ibex Rockcaller (11-10) |
| 12 The Briar Maze | Seed-cache Squirrel (12-1), Skunk Gasser (12-2), Lyrebird Mimic (12-5) |
| 13 The Redwood Deep | Swift Fox (13-2), Tasmanian Devil (13-4), Woodpecker Sapper (13-1) |
| 14 Savanna Reaches | Mongoose Duelist (14-2), Hoopoe Herald (14-4), Marula Elephant (14-3), Pangolin Roller (14-1), Spitting Cobra (14-7), Weaver Bird (14-5), Springbok Pronker (14-1), Lovebird (14-2), Marula Monkey (14-3) |
| 14-A The Canopy | Aye-aye Prowler (14-A-2), Kinkajou Lurker (14-A-3), Velvet Worm (14-A-1), Slow Loris (14-A-5), Hercules Beetle (14-A-4), Chilli Parrot (14-A-4), Leaf Chameleon (14-A-1) |
| 15 The Long Grass | Border Collie (15-2), Pronghorn Racer (15-1), Bison Bulldozer (15-4) |
| 16 The Pinewood Taiga | Dhole Runner (16-1), Dhole Matriarch (16-5) |
| 17 Wolfsbane Tundra | Snow Bunting Archer (17-3) |
| 17-A The Ice Hollow | Spitting Spider (17-A-3) |
| 18 The Glass Dunes | Moon Jerboa (18-2), Tarantula Hawk (18-3), Roadrunner Courier (18-1), Armadillo Guard (18-4), Antlion Pit (18-6), Horned Lizard (18-5) |
| 19 Ashen Spurn | Echidna Quillshot (19-1) |
| 19-A Basalt Foundry | Fruit-bat Familiar (19-A-6), Hellbender (19-A-2), Fire Salamander (19-A-3), Flagellant Vulture (19-A-5), Vampire Finch (19-A-7), Chained Binturong (19-A-4) |
| 20 The Sundered Peak | Firefly Swarm (20-1), Fire Hawk (20-2) |
| 21 The Quiet Summit | Pika Hoarder (21-2) |

**Parked new cards (23)**, waiting for their map: Werebadger (Map 24), Glowing Gecko (Map 33), Gloom Gibbon (Map 26), Margay (Map 22), Hagfish Silencer (Map 27), Lichen Tortoise (Map 25), Ice Petrel (Map 23), Electric Catfish (Map 22), Dust-devil Kestrel (Map 28), Sperm Whale Elder (Map 38, Epic), Thunder Lizard (Map 41, Epic), Corpse-flower Beetle (Map 31), Salamander Pyromancer (Map 40, Epic), Starfall Owl (Map 52, Legendary), Elephant-nose Fish (Map 23), Anaconda Coil (Map 24), Tardigrade (Map 30), Ice Fish (Map 36, Epic), Leopard Seal (Map 25), Supernova Jelly (Map 45), Geode Scorpion (Map 27), Snow Leopard (Map 29).
The Glasswing Butterfly (suggested Map 20) waits too: Ghost is an advanced rule, and its home is a rainforest main map.

**Older cards placed today**, among them:
- The **Ent** is the Old Bramble's boss card and pays out there, with the Elder Willow beside it and the Thornwood Palisade at the Root Gate.
- **Babies**: Caiman Hatchling, Baby Horned Capybara, Baby Bat, Bramble Hoglet.
- **Turtles** on the beach, the pond and the reef.
- **Prayer**: the shrine acolytes on 20-4 Shrine Steps.
- **The Sky Scraper Sentinel** finally fields the Scraper of Skies.
- **Pack cards nobody had met** ("seen before sold"): Timber Wolf Pack, Honey Badger Fury, Village Miller, Owl Sentinel, Puddle Changeling, Creeper, Buzzed Chipmunk, Terrier Pup, Parish Sergeant, Dolphin Knight, War Hound, Bramblewood Macaque, Weredog, Shieldbearer Hound and the Truce Heron.
- Traded out again by the retune: Owl Fletcher and Night Watchman and Colossal Squid (their fights came out too hard or too easy with them); the two owls stay pack cards and the squid stays parked.

**Still parked on purpose**:
- The five dragons and the egg (Map 50+).
- The elementals (magic, Map 50+).
- The omen ravens and the insect spawners (they wait for their maps in 22–40).
- The Moon Jelly (Moonpull waits past Map 10–20, as you asked).
- The Mirrorhide Mutant (late Twin).
- The Wandering Mage (Map 51).
- The Gannet Queen, Old Snapjaw and the Triumvirate (see the questions at the end).

## 3. Field curriculum

Everything below is placed, including the new effects from "field effects 2" (merged today). New ones are in bold.

| Map | Field effects |
|---|---|
| 0 Outskirts | Mist |
| 0-T Tutorial | Mist (new) |
| 0-B The Old Bramble | Mist (kept; your "?") |
| 2 Pebble Beach | **Tide** in every fight; Tide-spout once, on 2-4 Pelican Point |
| 2-A Lilypad Reach | **Tide** (Perma-tide removed: it is a still pond) |
| 2-B Smugglers' Grotto | Darkness (was Pitch Black) |
| 3 Gannet Cliffs | Windy |
| 4 Sunken Hollow | River Rapids (the only map that keeps it) |
| 5 Gatorback Swamp | Swamp Fever on every fight |
| 5-A The Sunken Grove | Swamp Fever (25%) |
| 6 Sable Swampmire | always night; Swamp Fever on the elites |
| 8 Caves & Alcoves | Darkness; **Landslide** on 8-4, 8-6 and the 8-7 elite (the bats fly over it); 8-H is Darkness too |
| 9 The Kelp Mangroves | **Tide** in the skirmishes; High Tide in the elites and boss |
| 10 Coral Current | **Tide** in the skirmishes; High Tide in the elites and boss; no Moonpull anywhere up to here |
| 10-A The Sunken Depths | Pitch Black (moved here); **Crushing Depths** in every fight; no night, no First Blood, no day/night |
| 11 Eyrie Heights | Gale |
| 12 The Briar Maze | **Rook's Row** (one-off, 12-2), **Bishop's Path** (one-off, 12-4), **Mirage** (one-off, 12-6) |
| 13 The Redwood Deep | **High Canopy** in every fight |
| 14 Savanna Reaches | First Blood; Scorching I on the elites |
| 15 The Long Grass | **Undergrowth** in every fight; **Tall Grass** on 15-3 and 15-4 |
| 16 Pinewood Taiga | always night; **Consternation** on the 16-6 elite; Frigid on the boss |
| 17 Wolfsbane Tundra | Frigid; Freezing on the elites and boss; **Hail** on 17-3 (on the 17-6 elite it made the fight unwinnable, so it came off) |
| 17-A The Ice Hollow | **Slippery (30%)**, one-off on 17-A-2 |
| 18 Glass Dunes | Windy; Sandstorm on every fight but 18-5; **Glass-storm** one-off on 18-5; Scorching II on the boss |
| 19-A Basalt Foundry | **Lava Spout** on the elites and boss (it replaces Scorching II there) |
| 20 Sundered Peak | Windy, the Volcano; **Scorching III** on the elites and both bosses |

Only noted, for later maps: **Leylines I** (Map 40+), **Leylines II** (50+), **Leylines III** (60+, a guess), **Haunted** (50+, or the undead crater 20-A if you want it sooner).

## 4. Map gaps

The full table is on the "Map gaps" sheet. The biggest holes:
- **Gannet Cliffs** still has no sea birds: no Gannet, Puffin or Peregrine.
- **Sunken Hollow** still holds the whales and the kraken; they belong to the sea maps.
- **Eyrie Heights** has no Volley or Twin Shot mountain birds and no young.
- **The Savanna** has no lions or wild dogs below the boss.
- **Ashen Spurn** is called an ash ridge but is mostly frost animals (yetis, frost hares); Hail would suit them.
- **The rainforest** now has seven new cards on the Canopy. It still deserves a main map in 22–40, and that is where the Glasswing goes.

## 5. Difficulty

Measured with `tools/difficulty_curve.js`, 40 games a fight, using the same three reference decks before and after, so the numbers compare. Tuned with `tools/curve_tune.js` toward a curve rising from index 18 at Map 0 to 56 at Map 21. That is a little gentler than before (62), so a mid deck still wins about a third or more of the Map 10–16 bosses. Strong-deck win % and mid-deck win %:

| Map | Strong: skirmishes | Strong: elites | Strong: boss | Mid: boss | Starter: skirmishes | Difficulty index |
|---|---|---|---|---|---|---|
| 0 Bramblewood Outskirts | 87 → 100% | — | 93 → 95% | 100 → 100% | 33 → 62% | 30 → 15 |
| 9 The Kelp Mangroves | 86 → 90% | 34 → 71% | 30 → 70% | 3 → 68% | 4 → 22% | 59 → 41 |
| 10 Coral Current | 84 → 86% | 60 → 69% | 70 → 70% | 58 → 50% | 15 → 14% | 48 → 41 |
| 10-A The Sunken Depths | 90 → 99% | 98 → 88% | 83 → 90% | 25 → 18% | 22 → 67% | 35 → 42 |
| 11 Eyrie Heights | 92 → 90% | 83 → 82% | 73 → 65% | 78 → 70% | 9 → 9% | 42 → 43 |
| 12 The Briar Maze | 66 → 88% | 41 → 68% | 13 → 63% | 0 → 50% | 1 → 7% | 68 → 46 |
| 13 The Redwood Deep | 53 → 76% | 18 → 59% | 8 → 43% | 0 → 48% | 0 → 14% | 82 → 53 |
| 14 Savanna Reaches | 71 → 81% | 88 → 84% | 45 → 53% | 33 → 60% | 1 → 6% | 50 → 48 |
| 14-A The Canopy | 69 → 74% | 80 → 68% | 50 → 63% | 58 → 68% | 0 → 2% | 56 → 51 |
| 15 The Long Grass | 22 → 74% | 18 → 66% | 10 → 75% | 0 → 45% | 0 → 16% | 89 → 48 |
| 16 The Pinewood Taiga | 65 → 82% | 30 → 76% | 35 → 58% | 5 → 35% | 0 → 1% | 72 → 50 |
| 17 Wolfsbane Tundra | 71 → 91% | 68 → 62% | 40 → 50% | 8 → 15% | 0 → 9% | 62 → 54 |
| 18 The Glass Dunes | 72 → 86% | 63 → 86% | 38 → 68% | 28 → 35% | 1 → 1% | 64 → 47 |
| 19 Ashen Spurn | 59 → 71% | 45 → 57% | 53 → 68% | 13 → 55% | 0 → 4% | 73 → 59 |
| 19-A Basalt Foundry | 85 → 74% | 79 → 73% | 33 → 35% | 20 → 20% | 3 → 0% | 49 → 59 |
| 20 The Sundered Peak | 49 → 73% | 54 → 82% | 68 → 88% | 48 → 23% | 0 → 1% | 72 → 58 |

The other maps (1–8, side maps up to 8-A) are as they were, apart from small HP fixes on 1-A-1 and the Mycelium Deep after their new cards. The world boss (20-B-4) and the 20-A dungeon keep their castle Health: the tuner reads them as skirmishes.

## 6. Questions for you

1. **The Gannet Queen and Old Snapjaw** are Heroic leaders with no home. Should they be the 3-7 and 5-7 leader rewards, like the other bosses' leaders? Bosses still won't field them.
2. **The Triumvirate** (Unique, Dictator) could lead the Map 20 final boss.
3. **0-B The Old Bramble**: keep the Mist?
4. **Landslide on Map 8 and Hail on Map 17**: placed from the coordinator's reading of your notes. Say if you meant other maps. Slippery is set to 30%, not its default 50%, to soften it.
5. **Legendary in normal skirmishes**: not set. The table stops at Unique from Map 51.
