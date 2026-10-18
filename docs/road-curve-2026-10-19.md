# The road curve, 2026-10-19 (package R2)

Owner (20:39): "The balance should be such that the constructed deck wins in the green zone for every map it's in. Maybe if there are 10 skirmishes, it starts at 90%, and drops to 60%. Then at the boss fight, <50%. (The deck consists of cards earned from the previous map)."

Every main-map fight on Maps 0–24 (179 fights) was retuned to this curve. The Tutorial was left untouched. No card's stats changed. The spreadsheet is `docs/road-curve-2026-10-19.xlsx`, with five sheets:
- **Fights:** every fight, with its map, place, kind, target, before, after, fresh seeds and what changed.
- **Changes:** only the fights that changed.
- **Outliers:** fights outside green after the retune (none on the measure seeds).
- **Maps:** green fights per map.
- **Decks:** the reference decks.

## The curve

These are the targets the skirmish editor's win-rate panel now colours by (`roadCurveTarget` / `skirmishTargetBand` in `arena_app.js`). Each map's fights are taken in road order:

| Fight | Target | Green |
|---|---|---|
| Skirmishes and elites before the boss | a straight line from **90%** (the first fight) down to **60%** (the last before the boss). Elites sit on the line at their place. | target ±8 |
| A boss that isn't the map's last fight (only 20-9 The Ancient Sloth Titan) | **50%** (a mini-boss) | 42–58% |
| The map's boss fight (its last fight, whatever kind the game gives it) | **40%**; Map 0's Frost Vanguard **45%** | **30–49%** |

- On the panel, green means on the curve, blue too easy and red too hard. A pill's tooltip gives the target and its band.
- The WIP version of this package put elites 5 points under the line. The brief says "elites on the curve at their position", so they are on it now.

**"Your deck"** is the map's reference deck: Base cards plus every earlier main map's rewards, no packs (`docs/winrate-reference-decks-2026-10-19.md`). It plays at the road's card level against the CPU at its real level, using the game's own `simulateReferenceFight`.

## How it was measured

- **Before:** main as of 2026-10-19 00:30, with Freeze/Confuse (FZ), the no-op heals (HN), the raid changes and the new cards, so the numbers reflect today's rules. The CPU decks were main's, unchanged.
- **Fresh measurement:** all 179 fights were measured again on the current engine. Each fight played 120 games on the measure seeds (9100 + 37g), the same seeds whose first 30 games the in-game panel plays.
- **Fresh seeds:** every fight's final version was also played for another 120 games on a second seed set (5100 + 37g). Nothing was tuned on those seeds.
- The WIP's rounds 1–3 were tuned on the old engine (before FZ / HN), so they were re-measured. 30 fights had drifted off the curve or were never fixed.

## Results

| | Before | After |
|---|---|---|
| Green on the measure seeds (120 games) | **38** of 179 (80 too easy, 61 too hard) | **179** of 179 |
| Green on fresh seeds (120 games) | n/a | **157** of 179 (19 blue, 3 red, all within 1–8 points of their band) |
| Green on the mean of both (240 games) | n/a | **178** of 179 (8-7 The Roost Above, 68.3% against a 68% ceiling) |

- **144 fights changed:**
  - 138 had CPU deck moves, mostly 1–2 copies each;
  - 53 had their Shield changed, 38 up and 15 down;
  - 2 had a lower Health: 6-7 Adder Gauntlet 29 → 22, and 10-5 Current Split 22 → 16.
- **Moves stayed inside the map's theme and the road's rarity rules.** A move could use:
  - the map's own fights' cards;
  - same-biome maps up to two either side;
  - the map's three main types.

  Rarity followed the road's cap, and the Rare quarter applied on Maps 21+. A fight's Epic-or-better namesake and its showcase card were kept.

| Map | Name | Fights | Green before | Green after | Green on fresh seeds |
|---|---|---|---|---|---|
| 0 | Bramblewood Outskirts | 4 | 2 | 4 | 3 |
| 1 | Thistlewood | 5 | 2 | 5 | 4 |
| 2 | Pebble Beach | 5 | 3 | 5 | 5 |
| 3 | Gannet Cliffs | 7 | 1 | 7 | 5 |
| 4 | Sunken Hollow | 5 | 1 | 5 | 5 |
| 5 | Gatorback Swamp | 7 | 3 | 7 | 7 |
| 6 | Sable Swampmire | 8 | 1 | 8 | 7 |
| 7 | The Morel Hollow | 6 | 2 | 6 | 6 |
| 8 | Caves & Alcoves | 8 | 1 | 8 | 7 |
| 9 | The Kelp Mangroves | 7 | 0 | 7 | 7 |
| 10 | Coral Current | 9 | 0 | 9 | 8 |
| 11 | Eyrie Heights | 10 | 4 | 10 | 10 |
| 12 | The Briar Maze | 7 | 3 | 7 | 7 |
| 13 | The Redwood Deep | 8 | 0 | 8 | 6 |
| 14 | Savanna Reaches | 8 | 4 | 8 | 7 |
| 15 | The Long Grass | 7 | 0 | 7 | 7 |
| 16 | The Pinewood Taiga | 7 | 1 | 7 | 6 |
| 17 | Wolfsbane Tundra | 8 | 2 | 8 | 6 |
| 18 | The Glass Dunes | 7 | 0 | 7 | 7 |
| 19 | Ashen Spurn | 6 | 0 | 6 | 2 |
| 20 | The Sundered Peak | 10 | 1 | 10 | 8 |
| 21 | The Quiet Summit | 6 | 0 | 6 | 6 |
| 22 | The Rimefire Caldera | 8 | 3 | 8 | 8 |
| 23 | The Goldfeather Siege | 8 | 2 | 8 | 8 |
| 24 | Goldfeather Keep | 8 | 2 | 8 | 5 |

### Notable changes

- **The Quiet Summit (Map 21) was 93–100% at any Shield.** Its fights were flocks of birds: Eagle Divers, Peak Condors, Snow Owls. They barely scratched the Map 21 deck, at about 2% of its Health a game. A Shield of 190 still left the boss at 75%.
  - Map 22's goat deck (Mountain Goat Climbers, Scree Goats, Fumarole Ibex, Badger Berserkers, an Alpine Marmot) won only 70–80% of the time on 21-3.
  - So by hand, 21-3 Cloud Ledge, 21-5 Snow Owl Parliament and 21-6 The Cathedral Eagle now mix the Summit's goats and ibex with Badger Berserkers. Each keeps its birds' namesakes: the condors and vultures, the Snow Owls, and the Cathedral Eagle with its Sharpshooters.
  - The tuner then set their Shields. 21-2 and 21-4 also took Badger Berserkers.
  - The Summit now runs 93 / 82 / 75 / 68 / 60 / 41%.
- **Elites moved up to the line.** The WIP tuned elites 5 points under it. The 11 elites left that way were eased back, mostly with one copy swap or a lighter Shield: for example 4-3 Cetacean Pod Shield 6 → 1, and 11-5 West Ledge Shield 17 → 4.
- **Map enders that were 50% or more** came down to 37–43%. The changes below are the total over all rounds, WIP rounds included:

  | Boss | Before | After | What changed |
  |---|---|---|---|
  | 11-10 The Avalanche Colossus | 61% | 43% | +4 Eagle-Owl Quartermaster, +2 Echo Keeper, −2 Eyrie Warden |
  | 16-7 The Howling Alpha | 69% | 42% | Lone Grey Wolves, Ravenous Wolverines and Snowshoe Hares in for Shieldbearer Hounds and Tundra Musk Oxen; Shield 32 → 49 |
  | 17-8 The Glacial Ape-King | 83% | 42% | Beaver Builders, Ravenous Wolverines and Star-nosed Moles in for Arctic Fox Raiders and Harvest Mice; Shield 34 → 77 |
  | 20-10 The Cave Warlord | 82% | 43% | Cinder Imps, Magma Salamanders and an Ashbone Ghoul in for Cataphract Destriers, Pack Mules and one Cave Warlord copy |
  | 24-8 The Magnate Duck | 87% | 37% | Mallard Marauders, a Gilded Swan Knight and a Tax-Collector Teal in for Battlement Herons, Goose Sentries and Mallard Halberdiers |
- **4-5 The Drowned Colossus** went the other way. It sat at 31% on the measure seeds and 22% on fresh seeds. One Orca Vanguard became a Pond Trout, and it is now 45% / 42%.

Every fight's change is in the tables below, and in the xlsx's **Changes** sheet.

## Big Shields: a decision for the owner

The Shield rule is: map number × 1 for a skirmish, × 1.5 for an elite, × 2 for a mini-boss, × 3 for a boss. Where a deck swap within the theme couldn't bring a fight down far enough, the tuner raised the Shield past three times the map number. Eight fights are like that:

| Fight | Rule Shield | Now |
|---|---|---|
| 11-6 East Ledge | 17 | 68 |
| 11-8 Summit Approach | 17 | 68 |
| 13-3 Antler Grove | 13 | 52 |
| 15-5 Charge of the Warhorses | 23 | 90 |
| 16-6 Reaver's Hollow | 24 | 105 |
| 17-2 Frostbitten Pack | 17 | 65 |
| 19-5 Sky Scraper Sentinel | 29 | 103 |
| 24-2 The Bailey | 24 | 96 |

3-7 The Gannet Queen also has Shield 40, against a rule of 5.

They are all inside the editor's override, which the brief allowed after deck swaps. If the owner wants the Shield rule kept tight, these fights need stronger themed cards, which means new cards or card changes.

## Outliers and why they stay

- **On the measure seeds:** none.
- **On fresh seeds:** 22 fights fall just outside their band:
  - 19 blue, e.g. 19-1 Badger Warband 98% against a 98% ceiling, 3-3 Rockfall 90 / 86, 16-6 Reaver's Hollow 70 / 68, 20-7 The Blessed Avatar 78 / 72;
  - 3 red: 0-3 Raccoon Heist 47 / 52, 6-7 Adder Gauntlet 48 / 52, 19-3 Porcupine Bastion 66 / 67.

  At 120 games one seed set's win rate has a spread of about ±4.5 points. Two sets differ by about 6, so a fight tuned to its target still lands outside ±8 on the other set about 1 time in 10. On the mean of both sets (240 games) only 8-7 The Roost Above is outside, by 0.3 points. A 240-game re-run of 8-7 on the measure seeds gave 59%. It was not tuned further, so it isn't fitted to noise.
- **Map 19 Ashen Spurn** is the weakest map across seeds: 2 of 6 green on fresh seeds. Its fights sit near their band edges.
- **The panel plays 30 games a fight** (`SKIRMISH_CURVE_SIMS`), so its pills swing about ±9 points. A pill a little outside green is not a failed fight. "📊 vs a new player's deck" plays 200.

## Files

- `arena_app.js`:
  - the road curve, with elites on the line: `roadCurveTarget`, `skirmishTargetBand`, the panel chips and their legend;
  - the 144 fights' decks, Shields and Health.
- `tools/skirmish_pass.js`:
  - `curve` tunes a fight toward the curve;
  - `snapshot` saves every fight's deck;
  - `measure --main`;
  - round 4 added "the map's own cards it lacks" moves.
- `tools/road_curve_bands.js` re-stamps measured rows with today's bands.
- `tools/road_curve_merge.js` merges re-measures into one file.
- `tools/road_curve_xlsx.py` writes the workbook and the tables below.
- Data in `docs/balance/`:
  - measures: `skirmish-pass-r3-before.jsonl`, `-r3-after.jsonl`, `-r3-fresh.jsonl`;
  - tune rounds: `road-curve-fixes*.jsonl` (rounds 1–3 from the WIP, 4, 4b by hand, 5, 6);
  - deck snapshots: `road-curve-nodes-before.json`, `-after.json`.
- `tests/winrate-panel-2026-10-19.js` checks the curve's line, with elites on it, plus the boss band, the mini-boss, the side maps and the chip colours.

## Every fight

The **Place** column gives a fight's position on the line before the boss. **Before** and **After** are on the measure seeds; **Fresh seeds** is the second set. "(blue)" means too easy and "(red)" too hard.

<!-- fights -->
### Map 0: Bramblewood Outskirts

| Fight | Kind | Place | Target (green) | Before | After | Fresh seeds | What changed |
|---|---|---|---|---|---|---|---|
| 0-1 Otter Patrol | skirmish | 1 of 3 | 90% (82–98) | 92% | 92% | 91% | – |
| 0-2 Scorpion Ambush | skirmish | 2 of 3 | 75% (67–83) | 59% (red) | 69% | 69% | −1 Caustic Scorpion; +1 Earthworm |
| 0-3 Raccoon Heist | skirmish | 3 of 3 | 60% (52–68) | 62% | 62% | 47% | – |
| 0-4 Frost Vanguard | skirmish | last (boss) | 45% (30–49) | 53% (blue) | 36% | 38% | +2 Badger Berserker |

### Map 1: Thistlewood

| Fight | Kind | Place | Target (green) | Before | After | Fresh seeds | What changed |
|---|---|---|---|---|---|---|---|
| 1-1 Hedgerow Scouts | skirmish | 1 of 4 | 90% (82–98) | 86% | 86% | 87% | – |
| 1-2 Cricket Chorus | skirmish | 2 of 4 | 80% (72–88) | 60% (red) | 82% | 86% | −3 Antler Skirmisher; +3 Duckling |
| 1-3 Burrow Line | skirmish | 3 of 4 | 70% (62–78) | 47% (red) | 70% | 79% | −4 Burrow Rabbit; +2 Duckling; +2 Harvest Mouse |
| 1-4 Sapper Hedge | skirmish | 4 of 4 | 60% (52–68) | 31% (red) | 59% | 59% | −3 Badger Berserker; +3 Duckling |
| 1-5 The Thistle Baron | elite | last (boss) | 40% (30–49) | 40% | 40% | 38% | – |

### Map 2: Pebble Beach

| Fight | Kind | Place | Target (green) | Before | After | Fresh seeds | What changed |
|---|---|---|---|---|---|---|---|
| 2-1 Rock Pool Raiders | skirmish | 1 of 4 | 90% (82–98) | 85% | 85% | 86% | – |
| 2-2 Gull Gang | skirmish | 2 of 4 | 80% (72–88) | 79% | 79% | 82% | – |
| 2-3 Hermit Row | skirmish | 3 of 4 | 70% (62–78) | 64% | 64% | 67% | – |
| 2-4 Pelican Point | skirmish | 4 of 4 | 60% (52–68) | 82% (blue) | 62% | 58% | +2 Mallard Marauder |
| 2-5 The Old Shell | elite | last (boss) | 40% (30–49) | 64% (blue) | 39% | 36% | −2 Otter Riverguard; +2 Sulfur Vent Crab |

### Map 3: Gannet Cliffs

| Fight | Kind | Place | Target (green) | Before | After | Fresh seeds | What changed |
|---|---|---|---|---|---|---|---|
| 3-1 Goat Ledge | skirmish | 1 of 6 | 90% (82–98) | 82% (red) | 91% | 90% | −2 Hawk Arrowkeeper; +2 Sparrow Chick |
| 3-2 Hawk Watch | skirmish | 2 of 6 | 84% (76–92) | 75% (red) | 80% | 87% | −1 Rockslide Ram; +1 Sparrow Chick |
| 3-3 Rockfall | skirmish | 3 of 6 | 78% (70–86) | 77% | 77% | 90% | – |
| 3-4 Condor Thermals | skirmish | 4 of 6 | 72% (64–80) | 86% (blue) | 72% | 79% | Shield 3 → 16 (override) |
| 3-5 Eagle Stoop | elite | 5 of 6 | 66% (58–74) | 77% (blue) | 70% | 75% | +2 Gull Thief; −2 Pelican Diver; +2 Sparrow Chick; +2 Stonedrop Vulture |
| 3-6 Avalanche Pass | elite | 6 of 6 | 60% (52–68) | 75% (blue) | 60% | 58% | Shield 5 → 22 (override) |
| 3-7 The Gannet Queen | elite | last (boss) | 40% (30–49) | 76% (blue) | 32% | 40% | −1 Eyrie Warden; +1 Golden Eagle Diver; +2 Pelican Diver; Shield 5 → 40 (override) |

### Map 4: Sunken Hollow

| Fight | Kind | Place | Target (green) | Before | After | Fresh seeds | What changed |
|---|---|---|---|---|---|---|---|
| 4-1 Reef Skirmishers | skirmish | 1 of 4 | 90% (82–98) | 44% (red) | 88% | 91% | −2 Coral Current Eel; −2 Jay Pilferer; −2 Open-Ocean Hermit Crab; +2 Reef Manta Glider; −2 Snapstick Turtle; +4 Stone Turtle Warden |
| 4-2 Tidal Ring | skirmish | 2 of 4 | 80% (72–88) | 22% (red) | 82% | 87% | −2 Box Turtle; −2 Humpback Elder; −2 Kraken Spawnling; −3 Open-Ocean Hermit Crab; +1 Pond Trout; +4 Reef Manta Glider; +4 Stone Turtle Warden |
| 4-3 Cetacean Pod | elite | 3 of 4 | 70% (62–78) | 24% (red) | 68% | 62% | −2 Kraken Spawnling; −4 Open-Ocean Hermit Crab; +2 Reef Manta Glider; +4 Stone Turtle Warden; Shield 6 → 1 (override) |
| 4-4 The Kraken's Maw | elite | 4 of 4 | 60% (52–68) | 16% (red) | 54% | 55% | −4 Open-Ocean Hermit Crab; +4 Stone Turtle Warden |
| 4-5 The Drowned Colossus | elite | last (boss) | 40% (30–49) | 31% | 45% | 42% | −1 Orca Vanguard; +1 Pond Trout |

### Map 5: Gatorback Swamp

| Fight | Kind | Place | Target (green) | Before | After | Fresh seeds | What changed |
|---|---|---|---|---|---|---|---|
| 5-1 Leech Pools | skirmish | 1 of 6 | 90% (82–98) | 85% | 85% | 94% | – |
| 5-2 Toad Hollow | skirmish | 2 of 6 | 84% (76–92) | 76% (red) | 83% | 84% | +2 Bog Behemoth; −2 Mangrove Mudskipper |
| 5-3 Cypress Roots | skirmish | 3 of 6 | 78% (70–86) | 68% (red) | 78% | 73% | +1 Bog Behemoth; −1 Mangrove Mudskipper; Shield 5 → 2 (override) |
| 5-4 Snapping Reeds | skirmish | 4 of 6 | 72% (64–80) | 80% | 80% | 75% | – |
| 5-5 Gator Slide | elite | 5 of 6 | 66% (58–74) | 54% (red) | 71% | 71% | +2 Bog Behemoth; −2 Snapper Hatchling |
| 5-6 Behemoth Bog | elite | 6 of 6 | 60% (52–68) | 58% | 58% | 52% | – |
| 5-7 Old Snapjaw | boss | last (boss) | 40% (30–49) | 28% (red) | 38% | 41% | +1 Bog Behemoth; −1 Mallard Marauder |

### Map 6: Sable Swampmire

| Fight | Kind | Place | Target (green) | Before | After | Fresh seeds | What changed |
|---|---|---|---|---|---|---|---|
| 6-1 Leech Bog | skirmish | 1 of 7 | 90% (82–98) | 69% (red) | 91% | 95% | −2 Echo Keeper; −2 Gangrenous Leech; +2 Lamprey; +2 Marsh Wisp |
| 6-2 Mire Ambush | skirmish | 2 of 7 | 85% (77–93) | 84% | 84% | 85% | – |
| 6-3 Toad Chorus | skirmish | 3 of 7 | 80% (72–88) | 28% (red) | 78% | 76% | −4 Bog Leech; −2 Echo Keeper; +4 Lamprey; +2 Mallard Marauder; +4 Swamp Alligator; −2 Vampire Bat |
| 6-4 Root Snare | skirmish | 4 of 7 | 75% (67–83) | 42% (red) | 74% | 76% | −3 Adder Ambusher; −1 Beaver Builder; −2 Echo Keeper; +4 Marsh Wisp; +2 Swamp Alligator; Shield 6 → 2 (override) |
| 6-5 Venomlord's Coil | elite | 5 of 7 | 70% (62–78) | 52% (red) | 71% | 69% | −2 Bog Leech; +2 Marsh Wisp; Shield 9 → 4 (override) |
| 6-6 Crocodile Run | elite | 6 of 7 | 65% (57–73) | 49% (red) | 60% | 62% | −2 Crocodile Ambusher; +2 Lamprey; −2 Mallard Marauder; +2 Marsh Wisp |
| 6-7 Adder Gauntlet | elite | 7 of 7 | 60% (52–68) | 45% (red) | 56% | 48% | +2 Caiman Hatchling; Shield 9 → 0 (override); Health 29 → 22 |
| 6-8 The Alligator King | miniboss | last (boss) | 40% (30–49) | 65% (blue) | 45% | 46% | +2 Bog Leech; +2 Caiman Hatchling |

### Map 7: The Morel Hollow

| Fight | Kind | Place | Target (green) | Before | After | Fresh seeds | What changed |
|---|---|---|---|---|---|---|---|
| 7-1 Spore Drift | skirmish | 1 of 5 | 90% (82–98) | 31% (red) | 91% | 92% | −2 Beetle Battering-Ram; +3 Garden Snail; +2 Honey Bee; −1 Raccoon Nightcrew; +2 Swarm Matriarch; −2 Trapdoor Spider |
| 7-2 Grub Tunnels | skirmish | 2 of 5 | 82% (74–90) | 41% (red) | 90% | 86% | −2 Beetle Battering-Ram; +2 Compost Grub |
| 7-3 Web Hollow | skirmish | 3 of 5 | 75% (67–83) | 22% (red) | 75% | 76% | −1 Cricket Drummer; +3 Garden Snail; +2 Monarch Wingblade; −2 Raccoon Nightcrew; Shield 7 → 1 (override) |
| 7-4 Moonlit Gills | skirmish | 4 of 5 | 68% (60–76) | 70% | 70% | 68% | – |
| 7-5 The Oath Ring | elite | 5 of 5 | 60% (52–68) | 34% (red) | 62% | 63% | −3 Bramble Sprout; +2 Compost Grub; +3 Garden Snail; +1 Honey Bee; −1 Swarm Matriarch; −2 Trapdoor Spider |
| 7-6 The Morel Monarch | miniboss | last (boss) | 40% (30–49) | 47% | 47% | 48% | – |

### Map 8: Caves & Alcoves

| Fight | Kind | Place | Target (green) | Before | After | Fresh seeds | What changed |
|---|---|---|---|---|---|---|---|
| 8-1 Roost Flurry | skirmish | 1 of 7 | 90% (82–98) | 39% (red) | 90% | 92% | −1 Beetle Battering-Ram; −2 Cave Bat Swarm; −2 Cave Flitter; +4 Glowworm Cluster; +1 Stalactite Golem |
| 8-2 Glowworm Grotto | skirmish | 2 of 7 | 85% (77–93) | 70% (red) | 80% | 82% | −2 Baby Bat; +2 Stalactite Golem |
| 8-3 Cinder Vents | skirmish | 3 of 7 | 80% (72–88) | 59% (red) | 72% | 72% | −2 Cave Flitter; +2 Honey Bee |
| 8-4 Echo Chamber | skirmish | 4 of 7 | 75% (67–83) | 18% (red) | 78% | 82% | −1 Echo Screecher; +4 Glowworm Cluster; −2 Subterraneaner |
| 8-5 Sulfur Vent Path | skirmish | 5 of 7 | 70% (62–78) | 78% (blue) | 72% | 75% | −2 Cave Flitter; +2 Honey Bee; +2 Swarm Matriarch |
| 8-6 Glowworm Deep | skirmish | 6 of 7 | 65% (57–73) | 77% (blue) | 62% | 70% | −2 Barrow Leech; +2 Swarm Matriarch; Shield 8 → 0 (override) |
| 8-7 The Roost Above | elite | 7 of 7 | 60% (52–68) | 18% (red) | 65% | 72% | +2 Glowworm Cluster; −2 Stalactite Golem; −2 Subterraneaner; +2 Swarm Matriarch; Shield 0 → 18 (override) |
| 8-8 The Stalactite Warden | miniboss | last (boss) | 40% (30–49) | 37% | 37% | 44% | – |

### Map 9: The Kelp Mangroves

| Fight | Kind | Place | Target (green) | Before | After | Fresh seeds | What changed |
|---|---|---|---|---|---|---|---|
| 9-1 Mudflat Skippers | skirmish | 1 of 6 | 90% (82–98) | 44% (red) | 92% | 91% | −2 Gull Thief; +2 Guppy; −2 Mudflat Godwit; +4 Silver Minnow; −2 Tide Pool Crab |
| 9-2 Monitor Roots | skirmish | 2 of 6 | 84% (76–92) | 41% (red) | 83% | 88% | −2 Moray Ambusher; +2 Silver Minnow |
| 9-3 Kingfisher Dive | skirmish | 3 of 6 | 78% (70–86) | 56% (red) | 81% | 79% | −2 Gull Thief; −2 Pike Lancer; +2 Silver Minnow; Shield 9 → 0 (override) |
| 9-4 Kelp Curtains | skirmish | 4 of 6 | 72% (64–80) | 46% (red) | 79% | 76% | −2 Coral Current Eel; −2 Gull Thief; +4 Silver Minnow |
| 9-5 Moray Den | elite | 5 of 6 | 66% (58–74) | 38% (red) | 66% | 71% | −2 Nautilus Drifter |
| 9-6 Drifting Shell | elite | 6 of 6 | 60% (52–68) | 21% (red) | 58% | 67% | −2 Archerfish; +4 Guppy; −2 Nautilus Drifter; Shield 14 → 21 (override) |
| 9-7 The Kelp Witch | miniboss | last (boss) | 40% (30–49) | 56% (blue) | 30% | 38% | +2 Electric Ray; −2 Silver Minnow; Shield 18 → 29 (override) |

### Map 10: Coral Current

| Fight | Kind | Place | Target (green) | Before | After | Fresh seeds | What changed |
|---|---|---|---|---|---|---|---|
| 10-1 Clownfish Shoal | skirmish | 1 of 8 | 90% (82–98) | 54% (red) | 92% | 92% | +4 Abyss Lantern Squid; −1 Coral Polyp Colony; −4 Gull Thief; +1 Silver Minnow |
| 10-2 Moray Ambush | skirmish | 2 of 8 | 86% (78–94) | 72% (red) | 81% | 83% | −2 Coral Current Eel; +2 Silver Minnow |
| 10-3 Tide Pool Line | skirmish | 3 of 8 | 81% (73–89) | 58% (red) | 82% | 82% | +2 Abyss Lantern Squid; −2 Gull Thief; −2 Riptide Eel; +2 Silver Minnow |
| 10-4 Riptide Channel | skirmish | 4 of 8 | 77% (69–85) | 68% (red) | 77% | 74% | −2 Sawfish; +2 Silver Minnow |
| 10-5 Current Split | skirmish | 5 of 8 | 73% (65–81) | 45% (red) | 69% | 72% | Shield 10 → 0 (override); Health 22 → 16 |
| 10-6 Reef Shark Pack | elite | 6 of 8 | 69% (61–77) | 58% (red) | 70% | 68% | −1 Coral Polyp Colony; +1 Silver Minnow |
| 10-7 Eel Nest | elite | 7 of 8 | 64% (56–72) | 56% (red) | 64% | 58% | +2 Abyss Lantern Squid; −2 Riptide Eel |
| 10-8 Sea Turtle Elder's Court | elite | 8 of 8 | 60% (52–68) | 26% (red) | 62% | 68% | −1 Coral Reef Shark; +1 Glass Octopus |
| 10-9 The Orca Vanguard King | boss | last (boss) | 40% (30–49) | 50% (blue) | 38% | 39% | +2 Nautilus Drifter |

### Map 11: Eyrie Heights

| Fight | Kind | Place | Target (green) | Before | After | Fresh seeds | What changed |
|---|---|---|---|---|---|---|---|
| 11-1 Goat Trail Runners | skirmish | 1 of 9 | 90% (82–98) | 88% | 88% | 87% | – |
| 11-2 Avalanche Ridge | skirmish | 2 of 9 | 86% (78–94) | 96% (blue) | 91% | 90% | +2 Eagle-Owl Quartermaster |
| 11-3 Cliffside Herd | skirmish | 3 of 9 | 82% (74–90) | 93% (blue) | 86% | 84% | +2 Eagle-Owl Quartermaster |
| 11-4 Ridge Fork | skirmish | 4 of 9 | 79% (71–87) | 72% | 72% | 81% | – |
| 11-5 West Ledge | elite | 5 of 9 | 75% (67–83) | 54% (red) | 72% | 71% | −2 Chipmunk Stockpiler; +2 Eyrie Warden; Shield 17 → 4 (override) |
| 11-6 East Ledge | elite | 6 of 9 | 71% (63–79) | 87% (blue) | 66% | 66% | −1 Alpine Avalanche; +4 Eagle-Owl Quartermaster; +1 Quillguard; Shield 17 → 68 (override) |
| 11-7 Eyrie Wardens | elite | 7 of 9 | 68% (60–76) | 78% (blue) | 64% | 71% | +2 Eagle-Owl Quartermaster; +2 Quill Volley; Shield 17 → 12 (override) |
| 11-8 Summit Approach | elite | 8 of 9 | 64% (56–72) | 69% | 62% | 57% | Shield 17 → 68 (override) |
| 11-9 The Condor Sovereign | elite | 9 of 9 | 60% (52–68) | 62% | 62% | 66% | – |
| 11-10 The Avalanche Colossus | miniboss | last (boss) | 40% (30–49) | 61% (blue) | 43% | 38% | +4 Eagle-Owl Quartermaster; +2 Echo Keeper; −2 Eyrie Warden |

### Map 12: The Briar Maze

| Fight | Kind | Place | Target (green) | Before | After | Fresh seeds | What changed |
|---|---|---|---|---|---|---|---|
| 12-1 Hedge Mice | skirmish | 1 of 6 | 90% (82–98) | 87% | 87% | 90% | – |
| 12-2 Quill Path | skirmish | 2 of 6 | 84% (76–92) | 72% (red) | 84% | 88% | Shield 12 → 0 (override) |
| 12-3 Warren Run | skirmish | 3 of 6 | 78% (70–86) | 97% (blue) | 79% | 86% | +2 Puddle Changeling |
| 12-4 Thornvine Arch | skirmish | 4 of 6 | 72% (64–80) | 88% (blue) | 75% | 79% | −2 Quillback Elder; +2 Thornvine Lasher |
| 12-5 Quillback Hold | elite | 5 of 6 | 66% (58–74) | 70% | 62% | 67% | +2 Quill Volley |
| 12-6 Rodent Court | elite | 6 of 6 | 60% (52–68) | 54% | 54% | 66% | – |
| 12-7 The Briar Queen | miniboss | last (boss) | 40% (30–49) | 61% (blue) | 46% | 45% | −2 Harvest Mouse; +2 Puddle Changeling |

### Map 13: The Redwood Deep

| Fight | Kind | Place | Target (green) | Before | After | Fresh seeds | What changed |
|---|---|---|---|---|---|---|---|
| 13-1 Cub Clearing | skirmish | 1 of 7 | 90% (82–98) | 72% (red) | 86% | 88% | +2 Berserker Boar; −2 Firetail Trickster; +2 Shieldbearer Hound; −2 Silverback Brawler |
| 13-2 Fox Run | skirmish | 2 of 7 | 85% (77–93) | 66% (red) | 86% | 87% | −1 Firetail Trickster; −1 Fox Kit; +2 Shieldbearer Hound |
| 13-3 Antler Grove | skirmish | 3 of 7 | 80% (72–88) | 98% (blue) | 79% | 83% | +4 Bramblewood Macaque; Shield 13 → 52 (override) |
| 13-4 Boar Wallow | skirmish | 4 of 7 | 75% (67–83) | 44% (red) | 71% | 78% | −2 Boar Rampager; +2 Shieldbearer Hound; Shield 13 → 15 (override) |
| 13-5 Badger Setts | elite | 5 of 7 | 70% (62–78) | 81% (blue) | 69% | 77% | +2 Bramblewood Macaque |
| 13-6 Grizzly Ridge | elite | 6 of 7 | 65% (57–73) | 79% (blue) | 66% | 78% | +4 Bramblewood Macaque; −2 Shieldbearer Hound |
| 13-7 The King's Den | elite | 7 of 7 | 60% (52–68) | 75% (blue) | 63% | 68% | +2 Bramblewood Macaque; Shield 20 → 60 (override) |
| 13-8 The Stag-Lord | miniboss | last (boss) | 40% (30–49) | 75% (blue) | 33% | 40% | +2 Boar Rampager; −2 Shieldbearer Hound |

### Map 14: Savanna Reaches

| Fight | Kind | Place | Target (green) | Before | After | Fresh seeds | What changed |
|---|---|---|---|---|---|---|---|
| 14-1 Zebra Stampede | skirmish | 1 of 7 | 90% (82–98) | 95% | 95% | 94% | – |
| 14-2 Hyena Chorus | skirmish | 2 of 7 | 85% (77–93) | 82% | 82% | 86% | – |
| 14-3 Howler Canopy | skirmish | 3 of 7 | 80% (72–88) | 85% | 85% | 77% | – |
| 14-4 Toucan Watch | skirmish | 4 of 7 | 75% (67–83) | 91% (blue) | 77% | 80% | +2 Dust Hyena; −2 Marula Elephant |
| 14-5 Giraffe Vanguard | elite | 5 of 7 | 70% (62–78) | 96% (blue) | 62% | 67% | +1 Marching Elephant; −1 Termite Mound; Shield 21 → 49 (override) |
| 14-6 Jaguar Run | elite | 6 of 7 | 65% (57–73) | 66% | 66% | 59% | – |
| 14-7 The Cheetah Matriarch | elite | 7 of 7 | 60% (52–68) | 83% (blue) | 58% | 57% | +2 Bramblewood Macaque |
| 14-8 The Savanna Warlord | miniboss | last (boss) | 40% (30–49) | 62% (blue) | 46% | 49% | +2 Bramblewood Macaque |

### Map 15: The Long Grass

| Fight | Kind | Place | Target (green) | Before | After | Fresh seeds | What changed |
|---|---|---|---|---|---|---|---|
| 15-1 Colt Meadow | skirmish | 1 of 6 | 90% (82–98) | 79% (red) | 95% | 91% | −2 Raccoon Bandit; +2 Shieldbearer Hound |
| 15-2 Squire Road | skirmish | 2 of 6 | 84% (76–92) | 96% (blue) | 92% | 91% | −2 Shieldbearer Hound; +2 Squire's Mount |
| 15-3 Stoat Ambush | skirmish | 3 of 6 | 78% (70–86) | 60% (red) | 77% | 77% | +3 Shieldbearer Hound; −1 Squire's Mount; −2 Stable Colt; Shield 15 → 2 (override) |
| 15-4 Archer Hill | skirmish | 4 of 6 | 72% (64–80) | 96% (blue) | 72% | 75% | −2 Shieldbearer Hound; +2 Squire's Mount; +2 War Hound; Shield 15 → 51 (override) |
| 15-5 Charge of the Warhorses | elite | 5 of 6 | 66% (58–74) | 88% (blue) | 66% | 58% | −2 Bison Bulldozer; +2 Cataphract Destrier; −1 Parish Sergeant; +3 Plains Zebra; Shield 23 → 90 (override) |
| 15-6 The Kennels | elite | 6 of 6 | 60% (52–68) | 92% (blue) | 58% | 60% | −2 Armored Mastiff; −2 Shieldbearer Hound; +2 Squire's Mount; +2 War Hound; Shield 23 → 30 (override) |
| 15-7 The Horse-Lord | boss | last (boss) | 40% (30–49) | 81% (blue) | 38% | 32% | −2 Armored Mastiff; +2 Raccoon Bandit; −2 Shieldbearer Hound; +4 Squire's Mount; Shield 45 → 61 (override) |

### Map 16: The Pinewood Taiga

| Fight | Kind | Place | Target (green) | Before | After | Fresh seeds | What changed |
|---|---|---|---|---|---|---|---|
| 16-1 Snowshoe Tracks | skirmish | 1 of 6 | 90% (82–98) | 94% | 94% | 94% | – |
| 16-2 Pinecone Drop | skirmish | 2 of 6 | 84% (76–92) | 99% (blue) | 79% | 89% | +2 Lone Grey Wolf; −2 Shieldbearer Hound; Shield 16 → 51 (override) |
| 16-3 Elk Crossing | skirmish | 3 of 6 | 78% (70–86) | 91% (blue) | 83% | 81% | +2 War Hound; Shield 16 → 52 (override) |
| 16-4 Lynx Shadow | skirmish | 4 of 6 | 72% (64–80) | 94% (blue) | 77% | 78% | +1 Arctic Fox Raider; −1 Dhole Matriarch; +1 Lone Grey Wolf; Shield 16 → 36 (override) |
| 16-5 The Running Pack | elite | 5 of 6 | 66% (58–74) | 81% (blue) | 63% | 72% | Shield 24 → 49 (override) |
| 16-6 Reaver's Hollow | elite | 6 of 6 | 60% (52–68) | 80% (blue) | 58% | 70% | +2 Lone Grey Wolf; Shield 24 → 105 (override) |
| 16-7 The Howling Alpha | miniboss | last (boss) | 40% (30–49) | 69% (blue) | 42% | 39% | +2 Lone Grey Wolf; +2 Ravenous Wolverine; −2 Shieldbearer Hound; +2 Snowshoe Hare; −2 Tundra Musk Ox; Shield 32 → 49 (override) |

### Map 17: Wolfsbane Tundra

| Fight | Kind | Place | Target (green) | Before | After | Fresh seeds | What changed |
|---|---|---|---|---|---|---|---|
| 17-1 Ice Fang Patrol | skirmish | 1 of 7 | 90% (82–98) | 94% | 94% | 98% | – |
| 17-2 Frostbitten Pack | skirmish | 2 of 7 | 85% (77–93) | 98% (blue) | 85% | 88% | +2 Arctic Fox Raider; Shield 17 → 65 (override) |
| 17-3 Snowshoe Line | skirmish | 3 of 7 | 80% (72–88) | 79% | 79% | 81% | – |
| 17-4 Lynx Ambush | skirmish | 4 of 7 | 75% (67–83) | 98% (blue) | 78% | 78% | +2 Dynamite Packrat; +2 Golden Eagle Diver; +2 Lone Grey Wolf; +2 Ravenous Wolverine |
| 17-5 Musk Ox Bulwark | elite | 5 of 7 | 70% (62–78) | 83% (blue) | 71% | 70% | +3 Lone Grey Wolf |
| 17-6 Glacier Herd | elite | 6 of 7 | 65% (57–73) | 93% (blue) | 66% | 66% | −2 Glacial Ape-King; +3 Lone Grey Wolf; +4 Ravenous Wolverine; Shield 26 → 49 (override) |
| 17-7 Alpha Howler's Den | elite | 7 of 7 | 60% (52–68) | 92% (blue) | 60% | 68% | +2 Alpha Howler; −2 Arctic Fox Raider; +2 Dynamite Packrat; −1 Glacial Ape-King; +1 Lone Grey Wolf; +2 Snow Ermine; +2 Walrus Icebreaker; Shield 26 → 43 (override) |
| 17-8 The Glacial Ape-King | miniboss | last (boss) | 40% (30–49) | 83% (blue) | 42% | 49% | −2 Arctic Fox Raider; +2 Beaver Builder; −2 Harvest Mouse; +2 Ravenous Wolverine; +2 Star-nosed Mole; Shield 34 → 77 (override) |

### Map 18: The Glass Dunes

| Fight | Kind | Place | Target (green) | Before | After | Fresh seeds | What changed |
|---|---|---|---|---|---|---|---|
| 18-1 Dune Jackals | skirmish | 1 of 6 | 90% (82–98) | 72% (red) | 91% | 89% | −2 Caustic Scorpion; +2 Dromedary |
| 18-2 Scorpion Flats | skirmish | 2 of 6 | 84% (76–92) | 98% (blue) | 84% | 90% | +2 Caustic Scorpion; Shield 18 → 36 (override) |
| 18-3 Widow's Web | skirmish | 3 of 6 | 78% (70–86) | 94% (blue) | 78% | 84% | +2 Caustic Scorpion; −2 Komodo Warlord |
| 18-4 Sandstorm | skirmish | 4 of 6 | 72% (64–80) | 84% (blue) | 78% | 80% | +1 Dust Hyena; −1 Komodo Warlord |
| 18-5 Obsidian Nest | elite | 5 of 6 | 66% (58–74) | 94% (blue) | 66% | 62% | +2 Caustic Scorpion; −2 Horned Lizard; −2 Meerkat Burrower; +2 Trapdoor Spider; Shield 27 → 44 (override) |
| 18-6 Komodo Wallow | elite | 6 of 6 | 60% (52–68) | 89% (blue) | 62% | 63% | −1 Antlion Pit; +2 Caustic Scorpion; −1 Komodo Warlord; +1 Meerkat Sentry; +3 Obsidian Scorpion; −2 Snapper Hatchling; −2 Thorny Devil |
| 18-7 The Sand Widow Queen | miniboss | last (boss) | 40% (30–49) | 69% (blue) | 39% | 44% | +2 Dust Hyena; −2 Komodo Warlord |

### Map 19: Ashen Spurn

| Fight | Kind | Place | Target (green) | Before | After | Fresh seeds | What changed |
|---|---|---|---|---|---|---|---|
| 19-1 Badger Warband | skirmish | 1 of 5 | 90% (82–98) | 100% (blue) | 92% | 98% | +2 Quill Volley |
| 19-2 Quill Line | skirmish | 2 of 5 | 82% (74–90) | 97% (blue) | 79% | 91% | +2 Quill Volley; Shield 19 → 66 (override) |
| 19-3 Porcupine Bastion | elite | 3 of 5 | 75% (67–83) | 93% (blue) | 70% | 66% | −2 Beaver Builder; +1 Beetle Battering-Ram; −1 Lodge Engineer; +2 Pit Glutton; −2 Porcupine Roller; +2 Quill Volley |
| 19-4 Sky Marks | elite | 4 of 5 | 68% (60–76) | 93% (blue) | 62% | 78% | −2 Ashbone Ghoul; −2 Beaver Builder; +2 Beetle Battering-Ram; Shield 29 → 23 (override) |
| 19-5 Sky Scraper Sentinel | elite | 5 of 5 | 60% (52–68) | 92% (blue) | 58% | 68% | +2 Cinder Imp; Shield 29 → 103 (override) |
| 19-6 The Frost Yeti King | miniboss | last (boss) | 40% (30–49) | 81% (blue) | 44% | 44% | +2 Beetle Battering-Ram; +2 Cinder Imp; −2 Land Tiller; +2 Magma Salamander; Shield 38 → 79 (override) |

### Map 20: The Sundered Peak

| Fight | Kind | Place | Target (green) | Before | After | Fresh seeds | What changed |
|---|---|---|---|---|---|---|---|
| 20-1 Silverback Watch | skirmish | 1 of 8 | 90% (82–98) | 88% | 88% | 86% | – |
| 20-2 Grizzly Frontier | skirmish | 2 of 8 | 86% (78–94) | 70% (red) | 82% | 84% | +2 Blessed Avatar; −2 Woodland Brawler |
| 20-3 Panther Ledge | skirmish | 3 of 8 | 81% (73–89) | 59% (red) | 86% | 84% | +1 Blessed Avatar; −1 Bramblewood Lynx |
| 20-4 Shrine Steps | skirmish | 4 of 8 | 77% (69–85) | 99% (blue) | 80% | 82% | +1 Magma Salamander; −1 Shrine Bell-Ringer; +2 Woodland Brawler |
| 20-5 Cave Warlord's Guard | elite | 5 of 8 | 73% (65–81) | 17% (red) | 65% | 69% | +3 Blessed Avatar; −1 Cave Warlord; −2 Grizzly Vanguard; Shield 30 → 20 (override) |
| 20-6 The Constrictor Sovereign | elite | 6 of 8 | 69% (61–77) | 84% (blue) | 69% | 72% | +1 Ashbone Ghoul; −1 Cataphract Destrier; −1 Cave Warlord; +1 Magma Salamander |
| 20-7 The Blessed Avatar | elite | 7 of 8 | 64% (56–72) | 77% (blue) | 64% | 78% | +2 Ashbone Ghoul; −2 Pack Mule |
| 20-8 The Iron Cataphract | elite | 8 of 8 | 60% (52–68) | 47% (red) | 65% | 63% | −2 Ashbone Ghoul; +2 Blessed Avatar |
| 20-9 The Ancient Sloth Titan | boss | mini-boss | 50% (42–58) | 1% (red) | 47% | 48% | −1 Ancient Sloth Titan; +4 Blessed Avatar; −2 Cave Warlord; −1 Pack Mule |
| 20-10 The Cave Warlord | worldboss | last (boss) | 40% (30–49) | 82% (blue) | 43% | 52% | +1 Ashbone Ghoul; −2 Cataphract Destrier; −1 Cave Warlord; +2 Cinder Imp; +2 Magma Salamander; −2 Pack Mule |

### Map 21: The Quiet Summit

| Fight | Kind | Place | Target (green) | Before | After | Fresh seeds | What changed |
|---|---|---|---|---|---|---|---|
| 21-1 Thaw Path | skirmish | 1 of 5 | 90% (82–98) | 98% (blue) | 93% | 96% | +2 Snow Owl Sentinel |
| 21-2 Tarn Shore | skirmish | 2 of 5 | 82% (74–90) | 100% (blue) | 82% | 78% | +1 Alpine Avalanche; +2 Badger Berserker; −1 Eagle Diver; +2 Eagle Sharpshooter; Shield 21 → 31 (override) |
| 21-3 Cloud Ledge | skirmish | 3 of 5 | 75% (67–83) | 100% (blue) | 75% | 78% | +1 Alpine Marmot; −1 Ash Cloud Condor; +2 Badger Berserker; −2 Eagle Diver; +2 Fumarole Ibex; −1 Golden Eagle Diver; −2 Hawk Arrowkeeper; +3 Mountain Goat Climber; −3 Peak Condor; +3 Scree Goat; +2 Snow Owl Sentinel |
| 21-4 The Avalanche's Wake | elite | 4 of 5 | 68% (60–76) | 98% (blue) | 68% | 72% | −2 Alpine Avalanche; +1 Badger Berserker; +2 Eagle Diver; −2 Glacier Yak; +3 Snow Owl Sentinel; Shield 32 → 55 (override) |
| 21-5 Snow Owl Parliament | elite | 5 of 5 | 60% (52–68) | 98% (blue) | 60% | 64% | +1 Alpine Marmot; +2 Badger Berserker; −2 Eagle Diver; −1 Golden Eagle Diver; +3 Mountain Goat Climber; +1 Scree Goat; Shield 32 → 56 (override) |
| 21-6 The Cathedral Eagle | miniboss | last (boss) | 40% (30–49) | 100% (blue) | 41% | 39% | +2 Alpine Marmot; +4 Badger Berserker; −2 Eagle Diver; +3 Fumarole Ibex; −2 Golden Eagle Diver; +4 Mountain Goat Climber; −2 Peak Condor; +3 Scree Goat; −2 Snow Owl Sentinel; Shield 42 → 78 (override) |

### Map 22: The Rimefire Caldera

| Fight | Kind | Place | Target (green) | Before | After | Fresh seeds | What changed |
|---|---|---|---|---|---|---|---|
| 22-1 Snowmelt Switchbacks | skirmish | 1 of 7 | 90% (82–98) | 86% | 86% | 87% | – |
| 22-2 Steam Vents | skirmish | 2 of 7 | 85% (77–93) | 85% | 85% | 85% | – |
| 22-3 Frozen Lava Flow | skirmish | 3 of 7 | 80% (72–88) | 92% (blue) | 77% | 83% | +2 Badger Berserker |
| 22-4 Hailstone Ridge | skirmish | 4 of 7 | 75% (67–83) | 19% (red) | 73% | 80% | +4 Badger Berserker; −2 Snow Owl Sentinel; −2 Ür-Elk |
| 22-5 The Geyser Field | skirmish | 5 of 7 | 70% (62–78) | 72% | 72% | 72% | – |
| 22-6 Ashfall Cornice | elite | 6 of 7 | 65% (57–73) | 83% (blue) | 64% | 70% | +2 Magma Salamander; −2 Phoenix Fledgling; Shield 33 → 57 (override) |
| 22-7 The Steam Wall | elite | 7 of 7 | 60% (52–68) | 18% (red) | 62% | 63% | −2 Badger Berserker; +4 Tundra Musk Ox; −2 Ür-Elk |
| 22-8 The Rimeheart Colossus | miniboss | last (boss) | 40% (30–49) | 25% (red) | 32% | 37% | −2 Badger Berserker; −2 Magma Titan; +2 Tundra Musk Ox |

### Map 23: The Goldfeather Siege

| Fight | Kind | Place | Target (green) | Before | After | Fresh seeds | What changed |
|---|---|---|---|---|---|---|---|
| 23-1 The Picket Line | skirmish | 1 of 7 | 90% (82–98) | 92% | 92% | 92% | – |
| 23-2 Trench Works | skirmish | 2 of 7 | 85% (77–93) | 98% (blue) | 92% | 91% | +2 Beetle Battering-Ram |
| 23-3 Elephant Road | skirmish | 3 of 7 | 80% (72–88) | 83% | 83% | 85% | – |
| 23-4 Siege Camp | skirmish | 4 of 7 | 75% (67–83) | 97% (blue) | 72% | 77% | +2 Beetle Battering-Ram; +2 Marching Elephant; −2 Mouse Sapper |
| 23-5 Under the Walls | skirmish | 5 of 7 | 70% (62–78) | 82% (blue) | 68% | 69% | +2 Beetle Battering-Ram; −2 Howdah Archers; +2 Mouse Sapper |
| 23-6 The Elephant Line | elite | 6 of 7 | 65% (57–73) | 47% (red) | 68% | 61% | −2 Beetle Battering-Ram; +2 Mouse Sapper; Shield 35 → 45 (override) |
| 23-7 The Barbican | elite | 7 of 7 | 60% (52–68) | 36% (red) | 59% | 61% | +1 Beetle Battering-Ram; −2 Goose Sentry; −1 Great Gate; −2 Marching Elephant; +4 Mouse Sapper |
| 23-8 Marshal Tuskwell | miniboss | last (boss) | 40% (30–49) | 68% (blue) | 34% | 42% | +2 Marching Elephant; −2 War Elephant |

### Map 24: Goldfeather Keep

| Fight | Kind | Place | Target (green) | Before | After | Fresh seeds | What changed |
|---|---|---|---|---|---|---|---|
| 24-1 Breach the Gate | skirmish | 1 of 7 | 90% (82–98) | 98% (blue) | 93% | 99% | +1 Gilded Swan Knight; −1 Great Gate |
| 24-2 The Bailey | skirmish | 2 of 7 | 85% (77–93) | 98% (blue) | 84% | 92% | +1 Gilded Swan Knight; −1 Goose Sentry; +2 Mallard Marauder; Shield 24 → 96 (override) |
| 24-3 The Counting House | skirmish | 3 of 7 | 80% (72–88) | 74% | 74% | 79% | – |
| 24-4 The Courtyard Fountain | skirmish | 4 of 7 | 75% (67–83) | 98% (blue) | 78% | 81% | −2 Mallard Halberdier; +2 Mallard Marauder; −2 Pond Paddler; +2 Tax-Collector Teal |
| 24-5 The Battlements | skirmish | 5 of 7 | 70% (62–78) | 92% (blue) | 77% | 79% | −2 Balloon Archer; +2 Gilded Swan Knight; −2 Goose Sentry; +2 Mallard Marauder |
| 24-6 The Gilded Guard | elite | 6 of 7 | 65% (57–73) | 100% (blue) | 65% | 74% | +1 Gilded Swan Knight; −3 Goose Sentry; −2 Mallard Halberdier; +4 Mallard Marauder; +4 Tax-Collector Teal |
| 24-7 The Treasury | elite | 7 of 7 | 60% (52–68) | 58% | 58% | 55% | – |
| 24-8 The Magnate Duck | miniboss | last (boss) | 40% (30–49) | 87% (blue) | 37% | 36% | −2 Battlement Heron; +1 Gilded Swan Knight; −2 Goose Sentry; −2 Mallard Halberdier; +4 Mallard Marauder; +1 Tax-Collector Teal |
<!-- /fights -->
