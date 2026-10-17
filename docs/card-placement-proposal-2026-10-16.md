# Card placement, rarity and field effects (2026-10-16)

This replaces `card-placement-proposal-2026-10-15.md` and `field-effects-and-map-gaps-2026-10-15.md`. Unlike those two, most of it is **built**: the rarity rules, the card placement and the existing field effects are in the game now. Only the field effects another agent is still building are left as names.

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
- **{{NEWPLACED}} of the 94 new cards are on the road**, each as its fight's card reward. {{NEWPARKED}} wait for maps that don't exist yet (their suggested map is 22 or later, or they are Epic/Legendary).
- **{{OTHERPLACED}} more cards that no enemy ever played** (old unplaced cards and pack cards nobody had met) now fight somewhere.
- **Field effects follow your curriculum**: Mist on 0-T, plain Tide on Pebble Beach with one Tide-spout fight, River Rapids only on Sunken Hollow, Darkness (not Pitch Black) in Smugglers' Grotto, Pitch Black moved to the Sunken Depths, no night or First Blood down there.
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
{{NEWTABLE}}

**Parked new cards ({{NEWPARKED}})**, waiting for their map: {{PARKEDLIST}}.
The Glasswing Butterfly (suggested Map 20) waits too: Ghost is an advanced rule, and its home is a rainforest main map.

**Older cards placed today**, among them:
- The **Ent** is the Old Bramble's boss card and pays out there, with the Elder Willow beside it and the Thornwood Palisade at the Root Gate.
- **Babies**: Caiman Hatchling, Baby Horned Capybara, Baby Bat, Bramble Hoglet.
- **Turtles** on the beach, the pond and the reef.
- **Prayer**: the shrine acolytes on 20-4 Shrine Steps.
- **The Sky Scraper Sentinel** finally fields the Scraper of Skies.
- **Pack cards nobody had met** ("seen before sold"): Timber Wolf Pack, Honey Badger Fury, Village Miller, Owl Sentinel, Puddle Changeling, Creeper, Buzzed Chipmunk, Terrier Pup, Parish Sergeant, Dolphin Knight, War Hound, Bramblewood Macaque, Weredog, Shieldbearer Hound and the Truce Heron.
- {{TRADED}}

**Still parked on purpose**:
- The five dragons and the egg (Map 50+).
- The elementals (magic, Map 50+).
- The omen ravens and the insect spawners (they wait for their maps in 22–40).
- The Moon Jelly (Moonpull waits past Map 10–20, as you asked).
- The Mirrorhide Mutant (late Twin).
- The Wandering Mage (Map 51).
- The Gannet Queen, Old Snapjaw and the Triumvirate (see the questions at the end).

## 3. Field curriculum

**Built and placed now** (existing effects only):

| Map | Field effects |
|---|---|
| 0 Outskirts | Mist |
| 0-T Tutorial | **Mist** (new) |
| 0-B The Old Bramble | Mist (kept; your "?") |
| 2 Pebble Beach | **plain Tide**; **Tide-spout once, on 2-4 Pelican Point** |
| 2-A Lilypad Reach | plain Tide (Perma-tide removed: it is a still pond) |
| 2-B Smugglers' Grotto | **Darkness** (was Pitch Black) |
| 3 Gannet Cliffs | Windy |
| 4 Sunken Hollow | **River Rapids** (the only map that keeps it) |
| 5 Gatorback Swamp | **Swamp Fever** on every fight |
| 5-A The Sunken Grove | **Swamp Fever (25%)** |
| 6 Sable Swampmire | always night; **Swamp Fever on the elites** |
| 8 Caves & Alcoves | Darkness (8-H, the hidden Spark-fly Hollow, is Darkness now too) |
| 10 Coral Current | no Moonpull anywhere up to here |
| 10-A The Sunken Depths | **Pitch Black** (moved here); **no night, no First Blood, no day/night** |
| 11 Eyrie Heights | Gale |
| 14 Savanna Reaches | First Blood; **Scorching I on the elites** |
| 16 Pinewood Taiga | always night; **Frigid on the boss** |
| 17 Wolfsbane Tundra | Frigid; **Freezing on the elites and boss** |
| 18 Glass Dunes | Windy; **Sandstorm on every fight**; **Scorching II on the boss** |
| 19-A Basalt Foundry | **Scorching II on the elites and boss** |
| 20 Sundered Peak | Windy, the Volcano |

**Waiting for the new effects** (the other agent's work; key names as I expect them, so I can place them in a follow-up):

| Map | Effect (expected key) | Where |
|---|---|---|
| 3 Gannet Cliffs | Landslide (`rules.landslide`) | one-off: 3-3 Rockfall |
| 7-A The Mycelium Deep | Consternation (`rules.consternation`) | 7-A-5 The Mycelium Mind (unsure where you meant it) |
| 10-A The Sunken Depths | Crushing Depths (`rules.crushingDepths`) | every fight |
| 11 Eyrie Heights | Landslide (`rules.landslide`) | 11-2 Avalanche Ridge |
| 12 The Briar Maze | chess lines (`rules.chessLines`), Mirage (`rules.mirage`) | lines on every fight; Mirage one-off on 12-6 |
| 13 The Redwood Deep | Canopy, "treetops" (`rules.canopy`) | every fight |
| 15 The Long Grass | Undergrowth (`rules.undergrowth`), Tall Grass (`rules.tallGrass`) | Undergrowth everywhere; Tall Grass on 15-3, 15-4 |
| 17-A The Ice Hollow | Slippery (`rules.slippery`) | one-off: 17-A-2 |
| 18 The Glass Dunes | Glass-storm (`rules.glassStorm`) | one-off: 18-5 Obsidian Nest |
| 19 Ashen Spurn | Hail (`rules.hail`) | elites and boss (the cold ridge; unsure) |
| 19-A Basalt Foundry | Lava Spout (`rules.lavaSpout`) | elites and boss |
| 20 The Sundered Peak | Scorching III (`rules.field: heatwave, heatLevel 3`) | elites and bosses |
| 20-A or 50+ | Haunted (`rules.haunted`) | the undead crater, or later |
| 40+ / 50+ / 60+ | Leylines I / II / III (`rules.leylines` 1 / 2 / 3) | the late maps |

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

{{DIFFICULTY}}

## 6. Questions for you

1. **The Gannet Queen and Old Snapjaw** are Heroic leaders with no home. Should they be the 3-7 and 5-7 leader rewards, like the other bosses' leaders? Bosses still won't field them.
2. **The Triumvirate** (Unique, Dictator) could lead the Map 20 final boss.
3. **0-B The Old Bramble**: keep the Mist?
4. **Consternation and Hail**: I guessed where they go. Tell me if you meant other maps.
5. **Legendary in normal skirmishes**: not set. The table stops at Unique from Map 51.
