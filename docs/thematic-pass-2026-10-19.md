# The thematic pass, 2026-10-19 (package TH)

Owner (00:19, the overnight plan): **"reassign skirmishes based on thematics"**, with **"5–10 new cards per map — from skirmish-only rewards and pack"** taken from the candidate pool (`docs/card-pool-2026-10-19.md`). You said you'd pick and asked for the overnight pass, so the choices below are made and written down. Each one can be reverted (see "Reverting a choice").

The spreadsheet is `docs/thematic-pass-2026-10-19.xlsx`:
- **Fights:** every changed fight: the off-theme cards taken out, the cards put in, new rewards, new fields, the curve retune, and the win rate before and after.
- **All fights:** every measured fight, before and after.
- **Placed:** the 96 pool cards placed and where each comes from.
- **Pool:** the 4 cards left in the pool.
- **Decks:** the reference decks before and after the rebuild.

## In short

- **{{CHANGED}} fights changed**: {{THEMED}} for their theme and {{TUNED}} by the curve retune that followed. The audit now finds **no off-theme card in any of the 260 fights** (main maps 0–24 and the side maps). Before, 103 fights had one.
- **96 of the 100 pool cards are live**: {{SKIRMISH}} are skirmish-only rewards on a fight of their map, and {{PACK}} are in the basic pack pool. That is 5–9 new cards on each of Maps 0–12, both of Map 16's, 9 for Wolfsbane Tundra and the Ice Hollow, and package GI's 10 examples where their notes put them. 4 stay in the pool.
- **The new fields are on their maps**, a few fights each: 🍄 Spore Cloud on The Morel Hollow's elite and boss, 🪢 Tangled Roots on the Kelp Mangroves' two elites, 🌩️ Thunderstorm on Coral Current's Eel Nest and boss, and 🌋 Ash Rain on two Ashen Spurn elites with 🌫️ Ashy on its boss.
- **The road curve** was re-measured with the rebuilt reference decks: **{{GREEN}} of 179 main-map fights are green** on the measure seeds (120 games each). The changed side fights: {{SIDEGREEN}}.
- **Package GI's examples were far too strong**, measuring 88–100% at their printed stats. Each was stepped down into its rarity band before it was placed (table below).

## How "on theme" is decided

Each map has an identity: its biome, its creatures, its factions and its field. The identities come from the gameplay-ideas sheet's **Maps** rows (Codex's design intent and our notes), the lore bible's factions, and the fights' own names. They live in `tools/thematic_pass_2026_10_19.js` (`THEMES`). A card in a fight is on theme when:

- it is a reward of that map's family (the map and its side maps);
- or it has one of the map's theme types (archetype or species);
- or the map allows it by id.

A map can also **ban** a card whatever its types (the Badger Berserker anywhere but the badger maps), or **cap** it: Gannet Cliffs allows its Pelican Divers in at most 2 fights, 2 copies each.

The curve tuner (`tools/skirmish_pass.js curve`) now asks the same rules before it moves a card into a fight. So a later retune can't bring the drift back. In R2 the tuner had used, for example, Badger Berserkers on nine maps.

<!-- themes -->
<!-- /themes -->

## The drift that was fixed

| Off-theme card | Where it was | What replaced it |
|---|---|---|
| **Badger Berserker** | 0-4, 1-3, 1-5, 1-A-2, five Quiet Summit fights, four Rimefire Caldera fights | the map's own: Pine Marten (0), Stag Beetle (1, 1-A), Caldera Snow Leopard / Fumarole Ibex / Chapel Tortoise (21), Ice-Crevasse Wolf / Magma Salamander / Fumarole Ibex (22). It is now only on Ashen Spurn (it went *in* for the Battering-Ram beetles at the badger bastions) and the Long Burrow. |
| **Pelican Diver** | 4 copies in 6 of Gannet Cliffs' 7 fights | the cliff's seabirds (Puffin Diver, Razorbill, Fulmar Spitter, Kittiwake Flock, Red-billed Chough, Peregrine Stooper). 2 copies stay in 3-5 and 3-7. |
| **Mallard Marauder** (Goldfeather's mallards) | Pebble Beach, Gatorback Swamp, Sable Swampmire, the Sunken Grove | Grey Seal Bull, Alligator Gar, Fen Mink, Booming Bittern, Marsh Harrier, Giant Water Bug, Anhinga Spearbird |
| **Open-Ocean Hermit Crab** | the two swamps and the Sunken Grove | Plague Gnat Cloud, Mosquito Cloud, Fire Ant Raft, Raft Spider, Swamp Rabbit |
| **Beaver Builder** | Sable Swampmire (5 fights), Gatorback's boss, Wolfsbane Tundra (6), the Ice Hollow, Ashen Spurn | swamp cards (Greater Siren, Bogfire Newt, Marsh Wisp, Giant Water Bug), the polar set (Harp Seal Pup, Beluga, Polar Bear, Greenland Shark), Badger Trench Diggers |
| **Ducklings** (R2's filler) | Thistlewood 1-2, 1-3, 1-4 | Harvest Mice and Field Voles |
| **Honey Bee, Swarm Matriarch, Beetle Grunt** | Caves & Alcoves (6 fights) | the cave pool (Guano Beetle, Cave Swiftlet, Cave Cricket, Cave Pseudoscorpion, Whip Spider, Giant Cave Huntsman) and Cave Bat Swarms |
| **Narwhal Lancer** (arctic) | the warm Kelp Mangroves (3 fights) | Horseshoe Crab, Banded Sea Krait, Mangrove Manatee |
| **Village dogs, chipmunks, sergeants; pack macaques** | the Redwood Deep (all 8 fights) | bears, boars, deer and foxes: Stag Knight, Shimmerwing Stag, Bear Cub, Grizzly Vanguard, Feral Tuskboar, Bramblewood Lynx, Badger Sapper (13-5's own reward), Honey Badger Fury, foxes |
| **Village / war dogs, the Redwood's Firetail Trickster, Warren Scouts, a Weredog** | the Pinewood Taiga | Trickster Fox, Woodland Caribou, Musk Ox Calf, Timber Wolf Pack, Snowshoe Hare, the Pack Wolf Reaver (16-6's own reward) |
| **Golden Eagle Divers, chipmunks, porcupines, mice, packrats, moles, war hounds** | Wolfsbane Tundra (all 8) and the Ice Hollow | the polar set and wolves: Arctic Tern, Lemming Swarm, Krill Swarm, Harp Seal Pup, Ringed Seal, Beluga, Polar Bear, Greenland Shark, Frostmoon Howler, Snow Ermine. 17-5 Musk Ox Bulwark and 17-6 Glacier Herd now have musk oxen. |
| **Echo Keeper** (a swamp card) | Eyrie Heights' boss, the Aerie Vault, the Basalt Foundry, the Eye of the Volcano | Alpine Salamander, Alpine Swift, Fire Salamander, Cinder Gecko, Cinder Skeleton |
| **Quill Volley / Quillguard** (Briar Maze porcupines) | Eyrie Heights, Lilypad Reach, Smugglers' Grotto, the Ice Hollow | Chamois Leaper, Alpine Swift, Great Crested Grebe, Muskrat Lodgekeeper, Water Shrew, Pincushion Urchin |
| **Snapper Hatchling, Grass Viper** (swamp) | the Glass Dunes | Thorny Devil, Horned Lizard |
| Smaller ones | 7-6 raccoons, 14-x Alley Cat and macaques, 15-5 Plains Zebras, 18-5 Trapdoor Spiders, 19-x Battering-Ram beetles, beavers and a chipmunk, 20-9's beaver, 24-5's Howdah Archers | spiders and a Truffle Piglet; Grave-Grin Hyena, Spitting Cobra and Marching Elephants; Warhorse Chargers; Glasswing Moths; Badger Berserkers and Trench Diggers; 20-9 got its Ancient Sloth Titan back (R2 had taken out the fight's only copy of its namesake); the Keep's own Goose Sentries |

What I left alone on purpose:

- **The Tutorial's come-back fights** (T-2 "The Odd Lot", T-3, T-4) are a mix by design.
- **The Old Bramble's Glacier Wolf Packs** stay. It is a come-back fight for after Map 17, and the tundra wolves that came south are its story.
- **Sunken Hollow's sea creatures** stay (orcas, krakens, the Cetacean Pod). The flooded hollow's fights are named for them.
- **Coral Current** had no drift.

## The pool cards placed

- **Placed the way the Admin placement does it:** the card drops `pool`, `poolMap` and `poolSlot`, and takes the next live card number (#1235 to #1330, in map order).
- **Its source:**
  - a skirmish-only reward, `{kind:'map', id, node}`, on a fitting fight of its map. Fights that had no reward got one first: 0-2, 10-5, 10-6, 10-8, 11-9, 17-5 and 17-7.
  - or the basic pack pool, `{kind:'pack', tier:1}`.
- **"That map's pack":** the game has one basic pack pool, which the Hedgerow Pouch, Tidemire Chest and Highcrest Case all draw from. Per-map band packs are only a proposal (`docs/pack-plan-2026-10-12.md`), so a "pack" card went into that shared pool.
- **The reference decks:** pack cards never enter them (they assume no packs), but rewards do.
- **The record:** each card's note says where it was placed and why, and `docs/balance/thematic-placed-2026-10-19.json` keeps its old pool number, map and slot.
- **In the fights:** most placed cards also fight in their map's enemy decks, usually where an off-theme card came out.

<!-- cards -->
<!-- /cards -->

### Left in the pool (4)

| Card | Map | Why |
|---|---|---|
| Sanderling | Pebble Beach | a fourth small "Tide, Evasive" card (with the Water Vole, Swamp Rabbit and Great Crested Grebe); at 59% it was also at the top of the Common band |
| Roseate Spoonbill | Gatorback Swamp | the weakest of the swamp set (39%); the map already gets seven |
| Water Scorpion | Sable Swampmire | weak (37%), and the Giant Water Bug covers the same idea |
| Wallcreeper | Eyrie Heights | the weakest of the heights set (38%) |

### Package GI's examples, measured and stepped into band

They had never been played ("the balance phase does that"). On `card_balance.js`'s yardstick (8 copies plus filler, 120 games) every one won 88–100% at its printed stats. Before placing them, each stepped down: Attack first while the next step stayed inside the band, then Health in about 8% steps (`tools/thematic_pass_2026_10_19.js tunegi`; `docs/balance/thematic-gi-tune-2026-10-19.json`). Budget v3 still passes. GI's test now checks "measured in band" instead of "not far under budget".

{{GITABLE}}

## The fields

| Field | Fights | Why |
|---|---|---|
| 🍄 Spore Cloud | 7-5 The Oath Ring (elite), 7-6 The Morel Monarch (boss) | GI's note: The Morel Hollow's elites and boss |
| 🪢 Tangled Roots | 9-5 Moray Den, 9-6 Drifting Shell (the two elites) | GI's note: Kelp Mangroves elites; it counters the map's Wave cards |
| 🌩️ Thunderstorm 2 | 10-7 Eel Nest, 10-9 The Orca Vanguard King (boss) | GI's note: Coral Current elites / boss; the eels' nest, and Coral's Tide makes everyone Wet |
| 🌋 Ash Rain | 19-3 Porcupine Bastion, 19-5 Sky Scraper Sentinel | Codex: Ashen Spurn's signature, "Ash Rain on the elites, Ashy on the boss". 19-4 is left clear |
| 🌫️ Ashy | 19-6 The Frost Yeti King (boss) | the same |

None of these fights had a field before, so each has one field, within your two-fields-a-fight rule.

## The reference decks and the curve

- **The rebuild:** the reference decks (`tools/skirmish_pass.js decks`, Maps 1–24) are built from the earlier maps' rewards, so they were rebuilt after the placement.
- **What it did:** most maps' decks changed, and some got much stronger. A deck such as Map 21's now wins 100% of its own fights before any retune. The new rewards play a part: Old Sturgeon, Grey Seal Bull, Fen Mink, Mangrove Manatee and the Giant Cave Huntsman all made decks. The hill-climb's own randomness is the other part: a bigger pool reshuffles its search.
- **Before the retune:** with the rebuilt decks and the thematic swaps, {{MIDGREEN}} of the 179 main fights were green (R2 had all 179).
- **The retune:** `curve` then ran within the themes, in {{ROUNDS}} rounds, as R2 did: CPU deck moves first, then the Shield, then Health. The **Fights** sheet shows each move under "Curve retune".

{{CURVE}}

## Decisions for you

1. **Placement.** I placed 96 of the 100. If you'd rather keep fewer per map, the list above says where each one is. Revert one by deleting it from `tools/thematic_plan_2026_10_19.js` (see below).
2. **"That map's pack."** Pack cards went into the one shared basic pool. If you want the band packs of the pack plan, the record keeps each card's map.
3. **The GI examples' new stats** (above). Fen Mink 5/12 → 2/9, Rivergate Drummer 3/13 → 1/7 and so on. Their skills now carry most of their worth, and that is what the yardstick measures.
4. **Shields.** The retune used Shields again where a themed deck swap couldn't pull a fight down far enough (the **Fights** sheet).
5. **Side maps.** R2 only tuned the main maps. The side fights I changed were tuned onto their curve too. The other side fights, which I didn't touch, are as they were.

## Reverting a choice

- The choices are data:
  - `tools/thematic_plan_2026_10_19.js` writes `docs/balance/thematic-pass-2026-10-19.json` (the placements and the per-fight swaps and fields);
  - `node tools/thematic_pass_2026_10_19.js apply` puts that plan into `canonical/cards.json` and `arena_app.js`.
- To undo one card: give it back `"pool": true`, its `poolMap`, `poolSlot` and pool number (from `docs/balance/thematic-placed-2026-10-19.json`), and remove its `source`.
- To undo a fight: take its deck from `docs/balance/road-curve-nodes-after.json` (R2's final) and re-measure it with `node tools/skirmish_pass.js measure 120 --only=<code>`.

## Files

- `tools/thematic_pass_2026_10_19.js`: `THEMES`; `audit`; `apply`; `tunegi`; `offThemeFor`, which the curve tuner asks.
- `tools/thematic_plan_2026_10_19.js`: the choices.
- `tools/thematic_pass_xlsx.py`: the workbook and this doc's tables.
- `tools/skirmish_pass.js`:
  - `themedPool` and the curve's moves skip off-theme and capped cards;
  - the placed cards' strengths come from the pool reports;
  - measured rows carry the deck they measured.
- Data in `docs/balance/`:
  - `thematic-pass-2026-10-19.json` (the plan);
  - `thematic-placed-2026-10-19.json`;
  - `thematic-gi-tune-2026-10-19.json`;
  - `thematic-decks-before.json`;
  - the measures `skirmish-pass-th-mid*.jsonl` (after the swaps and the rebuild), `-th-r*` (the retune rounds), `-th-after*.jsonl` (final) and `-th-side-before.jsonl` (the side fights on main);
  - the retunes `thematic-curve-fixes*.jsonl`;
  - the snapshot `thematic-nodes-after.json`.
- `canonical/cards.json`: 96 cards placed, 10 GI stat lines.
- `arena_app.js`: the fights' decks, Shields, Health and fields, and the reference decks (`WINRATE_REF_DECKS`).
- Tests:
  - `tests/thematic-2026-10-19.js` (new);
  - `tests/card-pool-2026-10-19.js` and `tests/gi-2026-10-19.js` now read the placed cards as placed.

## Every changed fight

"Before" is main (R2's final measure; the side fights measured on main); "After" is the final measure. Both are 120 games on the measure seeds. "(blue)" means too easy and "(red)" too hard.

<!-- fights -->
<!-- /fights -->
