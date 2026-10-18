# Skirmish pass, 2026-10-18 (package SKB)

> 2026-10-19 (W2): the reference decks for Maps 10–24, the card levels and the map enders' kinds have changed since this pass; see `docs/winrate-reference-decks-2026-10-19.md`. The skirmish editor's win-rate panel now plays the same fights as `tools/skirmish_pass.js`.

Owner (15:56): "Have you done a card balance pass for all cards, then a skirmish rough balancing pass. as long it's not auto winnable or always loseable."

The card pass is `docs/balance-pass-2026-10-18.md`. This is the fight pass that follows it. Every Conquest fight was played with the deck a player would have at that point of the road. The CPU played at its real level, against the enemy bramble the game builds today. Each fight with a win rate above 92% (auto-winnable) or below 12% (always losable) was then fixed with the lightest touch available.

Spreadsheet: `docs/skirmish-pass-2026-10-18.xlsx`, with four sheets:
- **Fights:** all 262 fights, before and after.
- **Changes:** the fights this pass changed.
- **Outliers:** the fights still outside the band.
- **Decks:** the stage decks.

## Summary

| | Before | After |
|---|---|---|
| Fights measured | 262 (254 road fights + 8 endless-dungeon floors) | 262 |
| Outside 12–92% (60 games, the measure seeds) | **63** (39 auto-winnable, 24 always losable; 5 of them endless floors) | **7** (2 road fights + 5 endless floors) |
| Outside 12–92% over 120 games (both seed sets) | n/a | **8** (3 road fights: 21-3, 24-6, 24-1 at 92.5%; 5 endless floors) |
| Maps where the elites or the boss are easier than the skirmishes (on average) | 13 | 1 (the Sunken Depths) |

- **90 fights changed:**
  - 85 got CPU deck moves only;
  - 4 got a deck move plus a `shieldOverride`: 3-1 Shield 5, 3-5 Shield 31, 10-7 Shield 13, 18-4 Shield 34;
  - 1 got a lower Health: 8-7 The Roost Above, Shield 0 and Health 19.
- **No card changed** except the Dromedary (below).
- **Biggest swings:**
  - **Map 3 Gannet Cliffs:** every fight was 95–100% for the Map 3 Road deck (Burrow Rabbit, Otter Centurion, Pelican Diver, Hedgehog Scout, Bee Drone). Its fights trade Alpine Avalanche, Peak Condor and Hawk Arrowkeeper copies for Pelican Divers and Rockslide Rams, and now sit at 70–85%.
  - **Map 22 Rimefire Caldera:** six fights were at 93–98% for the Strong deck. Badger Berserker, Ur-Elk and Magma Salamander copies came in. The map is now 45–72%.
  - **Map 17 Wolfsbane Tundra:**
    - Its elites were 80–97%, easier than its skirmishes. Arctic Fox Raiders and Lone Grey Wolves came in, and they are now 22–30%.
    - 17-3 Snowshoe Line and the boss went the other way: 0% → 17% and 10% → 35%.
  - **Map 10 Coral Current and The Sunken Depths:** ten fights were at 3–12% for the Mid-road deck. Their strongest sea creatures each gave up 1–2 copies to Silver Minnows. They are now 15–35%.
  - **Bosses that were the easiest fight on their map:**

    | Boss | Before | After |
    |---|---|---|
    | 20-9 The Ancient Sloth Titan | 97% | 45% |
    | 8-8 The Stalactite Warden | 73% | 25% |
    | 7-A-5 The Mycelium Mind | 80% | 27% |
    | 1-5 The Thistle Baron | 67% | 32% |
    | 0-4 Frost Vanguard | 70% | 35% |

## How it was measured

New tool: `tools/skirmish_pass.js`. It uses the shared `tools/lib_bramble.js`, which reads the game's own functions out of `arena_app.js`, so the sim builds a fight the way `startConquestMatch` does:

- **Enemy bramble:** built by `skirmishCastle`:
  - the map's castle with its passive and its level by kind;
  - Map 0's Lv 0 base bramble;
  - Health is the bramble's own (`hqHp` only lowers it);
  - Shield by rule (`ruleShieldOf`) or the node's `shieldOverride`.
- **Fight rules:** from `fightRules`: day and night, Mist, Tide, wind, darkness, the volcano and terrain. Leaders and leader grants are included.
- **Enemy deck:** at its road level (`levelledEnemyDeck`: Lv 2 from Map 5, +1 every 5 maps, bosses +1). Endless-dungeon floors get +4% a floor.
- **CPU:** at its real level (`cpuAiLevelForNode`: Map 21+ Smartest, Map 5+ elite and boss Smart, else Basic), with `aiAim` on. Your seat plays at Smart, as the skirmish editor's Simulate does.
- **Your side:**
  - your cards at **Level 1** (the card pass's assumption: a Level 0 card gets its first +10% step);
  - your bramble is the plain 30-Health castle;
  - no leader.
- **Games:**
  - 60 games a fight on seeds 9100 + 37g, before and after;
  - after the last change, every fight was played again on fresh seeds (5100 + 37g);
  - the tune trials ran on other seeds again (7300, and 3100 for the last round).
- **Band:** 12–92%. A fix aims inside 15–88%, so it doesn't sit on the edge.

**Your deck by stage** ("the reference deck appropriate for that point of progression"):

| Stage | Used on | Deck |
|---|---|---|
| Starter | Map 0 | The curve's Otter starter: 2× Duck Paddler, 2× Pond Trout, 1× Meadow Frog, 1× Otter Kit, 1× Otter Centurion, 1× Fleetfoot'd, 3× Honey Bee, 3× Silver Minnow, 3× Sparrow Chick, 1× Rabbit Kit |
| Road | Maps 1–9 and their side maps | New: built per map from what the game says you own arriving there (see below) |
| Mid-road | Maps 10–17 and their side maps | The curve's Mid-road deck (Base + rewards up to Map 9): 4× Echo Screecher, 4× Eagle Diver, 4× Gull Thief, 4× Nautilus Drifter, 4× Cave Centipede |
| Strong | Maps 18–24 and their side maps | The curve's Strong deck (everything obtainable): 4× Sulfur Vent Crab, 4× Puppeteer Imp, 4× Owl Fletcher, 4× Cave Bat Swarm, 4× Inside-Out Hedgehog |

A come-back-later fight uses the stage of the map it counts as (`nodeMapNumber`): T-2 counts as Map 1, T-3 as Map 8, T-4 as Map 18, and the Old Bramble as Map 17.

**The Road decks are new.** The game's own "new player's deck" (`expectedPlayerDeck`, the one the editor's 🎯 tunes against) is the 20 top cards by stat score. That is all 0-Lumber chaff, and it does not get better after Map 3: it won 0% almost everywhere from Map 5 on. So the Road decks are built the way `tools/difficulty_curve.js` builds Mid-road and Strong, from `expectedPlayerDeck`'s own pool (Base + every earlier map's rewards, no packs):
- cards are ranked by their card-pass win rate;
- Lumber makers go in when the deck has 2+ Lumber cards;
- a 40-step hill-climb keeps a swap only if the deck wins more across that map's own fights, starting from the better of the fresh deck and the previous map's deck.

They are in `docs/balance/skirmish-pass-decks.json` and the workbook's Decks sheet:

| Map | Pool | Its own fights | Deck |
|---|---|---|---|
| 1 | 54 cards | 65% | 4× Burrow Rabbit, 4× Crimson Recruit, 4× Riverwing Envoy, 4× Otter Guard, 4× Otter Centurion |
| 2 | 58 cards | 85% | 4× Burrow Rabbit, 4× Otter Guard, 4× Otter Centurion, 4× Meadow Frog, 4× Bee Drone |
| 3 | 63 cards | 100% | 4× Burrow Rabbit, 4× Otter Centurion, 4× Pelican Diver, 4× Hedgehog Scout, 4× Bee Drone |
| 4 | 70 cards | 31.7% | 4× Burrow Rabbit, 4× Otter Centurion, 4× Pelican Diver, 4× Bee Drone, 4× Gold-throated Acolyte |
| 5 | 78 cards | 72.6% | 4× Burrow Rabbit, 4× Otter Centurion, 4× Box Turtle, 4× Chipmunk Cavalry, 4× Courier Pigeon |
| 6 | 85 cards | 67.7% | 4× Burrow Rabbit, 4× Otter Centurion, 4× Courier Pigeon, 4× Pelican Diver, 4× Fleetfoot'd |
| 7 | 94 cards | 40.3% | 4× Otter Centurion, 4× Courier Pigeon, 4× Pelican Diver, 4× Rockslide Ram, 4× Meerkat Wayfarer |
| 8 | 103 cards | 60.4% | 4× Rockslide Ram, 4× Meerkat Wayfarer, 4× Gull Thief, 4× Mountain Goat Climber, 4× Migration Leader |
| 9 | 111 cards | 46.4% | 4× Crimson Recruit, 4× Otter Centurion, 4× Eagle Diver, 4× Rockslide Ram, 4× Mountain Goat Climber |

**How a fix was found** (`node tools/skirmish_pass.js tune`), in the order the brief asked:
1. **CPU deck moves**, up to 2 copies at a time:
   - too easy: up to 4 moves. The weakest card makes way for a stronger themed one, or the strongest card gets more copies; a deck under 16 cards grows first, since the CPU gets no loop cards on the road;
   - too hard: up to 3 moves. The strongest card makes way for a weaker one from the map's own fights, or loses copies;
   - "themed" means cards from this map's family of fights, same-biome maps two either side, or the map's three main types from maps two back to one ahead;
   - all within the road's rarity cap (`roadRarityOk`, and Maps 21+ skirmishes keep a quarter Rare);
   - a fight's Epic+ namesake, its showcase card and the Dromedary are never taken out;
   - a move is kept only if it moves the win rate 2+ points the right way, and not past the far side of the curve (not below 50% for an easy fight, not above 65% for a hard one).
2. **`shieldOverride`**: searched from 0 to 5× the rule.
3. **Health**: a lower `hqHp`, only for a fight still too hard with no Shield.

**Rounds:**
- Two rounds of the band.
- An **order** round (`node tools/skirmish_pass.js order`): an elite or boss that the stage deck beats more often than its map's skirmishes on average got the same tune, with its ceiling at that average − 5 (never below 40%). This puts bosses and elites "harder than skirmishes", per the curve doc.
- A last round on the fights that were still outliers over both seed sets.

The log of every trial is in `docs/balance/skirmish-pass-tune-log.jsonl`. The first rounds' trials fought the enemy deck at Level 0 instead of its road level (a trial copy of a node isn't found by `roadEnemyLevel`). That was fixed for the later rounds. Every number in this doc comes from the plain measurement, never from a trial.

## The Dromedary

The owner's new card measured 25% at 2 Lumber (Uncommon band 45–68%). It now costs **1 Lumber**, refit to budget v3:
- At 1 Lumber, N = 20 + 2 + 2 + 12 + 2 + 4 + 0.4 = **42.4**.
- **5/26 measured 88%:** too strong.
- **Any 4/x measured 76–83%,** whatever its Health.
- **So Attack goes 5 → 3, Health stays 26:**
  - 2A+H+S = 34 < 42.4;
  - A·H+S = 80 < 199.75;
  - **65.8%** over 120 games (`tools/card_balance.js`), inside the band.

Its creatorNote says so. It still walks in 18-4 Sandstorm and is the reward of 18-3. The card matrix golden moved by 96 of 25,720 fights, all of them with a Dromedary in them (91 duels, 5 random matches), with no winner changes.

## What changed, fight by fight

Win rates are the stage deck's: 60 games on the measure seeds before and after, and the fresh seeds after.

| Fight | Kind | Your deck | CPU | Before | After | Fresh seeds | What changed |
|---|---|---|---|---|---|---|---|
| 0-4 Frost Vanguard | boss | Starter | Basic | 70% | 35% | 41.7% | +2 Royal Guard |
| 1-1 Hedgerow Scouts | skirmish | Road | Basic | 95% | 88.3% | 85% | −2 Beetle Grunt, +2 Burrow Rabbit |
| 1-5 The Thistle Baron | boss | Road | Basic | 66.7% | 31.7% | 33.3% | +2 Burrow Rabbit, +2 Badger Berserker |
| 2-5 The Old Shell | boss | Road | Basic | 83.3% | 65% | 50% | +2 Mallard Marauder |
| 3-1 Goat Ledge | skirmish | Road | Basic | 100% | 78.3% | 86.7% | +1 Mountain Goat Climber, +4 Pelican Diver; Shield rule → 5 |
| 3-2 Hawk Watch | skirmish | Road | Basic | 100% | 76.7% | 80% | −1 Hawk Arrowkeeper, −2 Sparrow Chick, −2 Alpine Avalanche, +4 Pelican Diver, +1 Rockslide Ram |
| 3-3 Rockfall | skirmish | Road | Basic | 100% | 83.3% | 88.3% | −2 Hawk Arrowkeeper, −2 Alpine Avalanche, +4 Pelican Diver |
| 3-4 Condor Thermals | skirmish | Road | Basic | 96.7% | 85% | 90% | −3 Peak Condor, +2 Pelican Diver, +2 Rockslide Ram, +1 Golden Eagle Diver |
| 3-5 Eagle Stoop | elite | Road | Basic | 100% | 71.7% | 80% | −2 Peak Condor, −2 Alpine Avalanche, +4 Pelican Diver; Shield rule → 31 |
| 3-6 Avalanche Pass | elite | Road | Basic | 95% | 70% | 70% | −3 Alpine Avalanche, −2 Hawk Arrowkeeper, +1 Rockslide Ram, +4 Pelican Diver |
| 3-7 The Gannet Queen | boss | Road | Basic | 96.7% | 75% | 71.7% | −2 Peak Condor, −2 Alpine Avalanche, +2 Pelican Diver, +2 Rockslide Ram |
| 4-5 The Drowned Colossus | boss | Road | Basic | 5% | 28.3% | 16.7% | −1 Kraken Spawnling, −2 Open-Ocean Hermit Crab, +3 Pond Trout |
| 6-2 Mire Ambush | skirmish | Road | Basic | 91.7% | 86.7% | 90% | +2 Mallard Marauder |
| 7-6 The Morel Monarch | boss | Road | Smart | 5% | 21.7% | 21.7% | −2 Beetle Battering-Ram, +2 Garden Snail |
| 8-7 The Roost Above | elite | Road | Smart | 10% | 21.7% | 13.3% | Shield rule → 0; hqHp 29 → 19 |
| 8-8 The Stalactite Warden | boss | Road | Smart | 73.3% | 25% | 31.7% | +2 Swarm Matriarch |
| 9-5 Moray Den | elite | Road | Smart | 68.3% | 40% | 33.3% | +2 Nautilus Drifter |
| 9-7 The Kelp Witch | boss | Road | Smart | 6.7% | 33.3% | 30% | −2 Nautilus Drifter, +2 Silver Minnow |
| 10-5 Current Split | skirmish | Mid-road | Basic | 5% | 18.3% | 21.7% | −1 Tide Pool Crab, −1 Dolphin Knight, +2 Silver Minnow |
| 10-6 Reef Shark Pack | elite | Mid-road | Smart | 3.3% | 16.7% | 10% | −3 Coral Reef Shark, −2 Orca Vanguard, −1 Moray Ambusher, +4 Abyss Lantern Squid, +2 Silver Minnow, +2 Nautilus Drifter |
| 10-7 Eel Nest | elite | Mid-road | Smart | 5% | 16.7% | 28.3% | −2 Coral Current Eel, −1 Moray Ambusher, −2 Blue-ringed Octopus, +3 Silver Minnow, +2 Abyss Lantern Squid; Shield rule → 13 |
| 10-8 Sea Turtle Elder's Court | elite | Mid-road | Smart | 10% | 16.7% | 11.7% | −2 Coral Reef Shark, +2 Silver Minnow |
| 10-9 The Orca Vanguard King | boss | Mid-road | Smart | 10% | 35% | 30% | −1 Coral Reef Shark, +1 Glass Octopus |
| 11-8 Summit Approach | elite | Mid-road | Smart | 73.3% | 40% | 31.7% | +2 Eagle-Owl Quartermaster |
| 12-7 The Briar Queen | boss | Mid-road | Smart | 8.3% | 23.3% | 30% | −2 Quillguard, +2 Harvest Mouse |
| 13-6 Grizzly Ridge | elite | Mid-road | Smart | 8.3% | 35% | 45% | −2 Boar Rampager, +2 Shieldbearer Hound |
| 13-8 The Stag-Lord | boss | Mid-road | Smart | 5% | 15% | 18.3% | −2 Boar Rampager, −2 Bear Cub, +4 Shieldbearer Hound |
| 14-5 Giraffe Vanguard | elite | Mid-road | Smart | 61.7% | 41.7% | 58.3% | +2 Dust Hyena |
| 14-8 The Savanna Warlord | boss | Mid-road | Smart | 3.3% | 16.7% | 15% | −2 Savanna Cheetah, +2 Termite Mound |
| 15-5 Charge of the Warhorses | elite | Mid-road | Smart | 88.3% | 41.7% | 25% | −2 Cataphract Destrier, −1 Shieldbearer Hound, −2 Buzzed Chipmunk, +2 Squire's Mount, +3 War Hound, +2 Talon Archer |
| 17-3 Snowshoe Line | skirmish | Mid-road | Basic | 0% | 16.7% | 15% | −2 Quill Volley, +2 Harvest Mouse |
| 17-5 Musk Ox Bulwark | elite | Mid-road | Smart | 83.3% | 21.7% | 33.3% | −1 Glacial Ape-King, +3 Arctic Fox Raider |
| 17-6 Glacier Herd | elite | Mid-road | Smart | 80% | 30% | 38.3% | −2 Beaver Builder, +4 Arctic Fox Raider, +2 War Hound |
| 17-7 Alpha Howler's Den | elite | Mid-road | Smart | 96.7% | 30% | 35% | −2 Beaver Builder, +4 Arctic Fox Raider, +2 Lone Grey Wolf |
| 17-8 The Glacial Ape-King | boss | Mid-road | Smart | 10% | 35% | 51.7% | −1 Ür-Elk, +1 Harvest Mouse, +2 Arctic Fox Raider |
| 18-1 Dune Jackals | skirmish | Strong | Basic | 95% | 63.3% | 55% | +4 Caustic Scorpion |
| 18-4 Sandstorm | skirmish | Strong | Basic | 96.7% | 85% | 80% | −2 Komodo Warlord, +2 Caustic Scorpion; Shield rule → 34 |
| 18-5 Obsidian Nest | elite | Strong | Smart | 85% | 73.3% | 60% | −2 Komodo Warlord, +2 Dust Hyena |
| 18-6 Komodo Wallow | elite | Strong | Smart | 91.7% | 68.3% | 88.3% | −2 Komodo Warlord, +4 Dust Hyena |
| 19-3 Porcupine Bastion | elite | Strong | Smart | 70% | 58.3% | 51.7% | −2 Yeti, +4 Cinder Imp, +4 Ashbone Ghoul |
| 19-4 Sky Marks | elite | Strong | Smart | 76.7% | 63.3% | 61.7% | +4 Cinder Imp, +2 Ashbone Ghoul |
| 19-6 The Frost Yeti King | boss | Strong | Smart | 78.3% | 60% | 65% | +2 Cinder Imp |
| 20-5 Cave Warlord's Guard | elite | Strong | Smart | 95% | 63.3% | 70% | +2 Cinder Imp, +2 Ashbone Ghoul |
| 20-6 The Constrictor Sovereign | elite | Strong | Smart | 91.7% | 65% | 80% | +2 Woodland Brawler, +4 Cinder Imp |
| 20-7 The Blessed Avatar | elite | Strong | Smart | 78.3% | 60% | 70% | +2 Cinder Imp |
| 20-8 The Iron Cataphract | elite | Strong | Smart | 83.3% | 48.3% | 40% | −2 Cave Warlord, −2 Pack Mule, +2 Woodland Brawler, +4 Cinder Imp, +2 Ashbone Ghoul |
| 20-9 The Ancient Sloth Titan | boss | Strong | Smart | 96.7% | 45% | 35% | −2 Blessed Avatar, +4 Ashbone Ghoul, +4 Cinder Imp |
| 21-4 The Avalanche's Wake | elite | Strong | Smartest | 91.7% | 83.3% | 91.7% | +2 Eagle Diver |
| 21-5 Snow Owl Parliament | elite | Strong | Smartest | 93.3% | 81.7% | 86.7% | −2 Hawk Arrowkeeper, −2 Eagle Sharpshooter, −1 Golden Eagle Diver, −1 Shrine High Priest, +4 Eagle Diver, +2 Fumarole Ibex |
| 22-1 Snowmelt Switchbacks | skirmish | Strong | Smartest | 96.7% | 50% | 60% | −2 Glacier Yak, +2 Badger Berserker |
| 22-3 Frozen Lava Flow | skirmish | Strong | Smartest | 93.3% | 63.3% | 58.3% | −2 Frostbitten Wolverine, +2 Badger Berserker |
| 22-4 Hailstone Ridge | skirmish | Strong | Smartest | 98.3% | 71.7% | 63.3% | −2 Glacier Yak, +2 Ür-Elk |
| 22-5 The Geyser Field | skirmish | Strong | Smartest | 98.3% | 71.7% | 65% | −2 Fire Drake Hatchling, +2 Ür-Elk |
| 22-6 Ashfall Cornice | elite | Strong | Smartest | 98.3% | 53.3% | 40% | −2 Cinder Hornet, +4 Badger Berserker |
| 22-7 The Steam Wall | elite | Strong | Smartest | 68.3% | 45% | 56.7% | +2 Magma Salamander, +2 Badger Berserker |
| 22-8 The Rimeheart Colossus | boss | Strong | Smartest | 95% | 53.3% | 58.3% | −2 Yeti, +2 Ür-Elk, +2 Badger Berserker |
| 23-5 Under the Walls | skirmish | Strong | Smartest | 100% | 70% | 86.7% | −2 Badger Trench Digger, +2 Beetle Battering-Ram |
| 23-6 The Elephant Line | elite | Strong | Smartest | 78.3% | 45% | 28.3% | +4 Beetle Battering-Ram |
| 23-7 The Barbican | elite | Strong | Smartest | 91.7% | 41.7% | 36.7% | −2 Trebuchet Crew, +2 Beetle Battering-Ram, +2 Marching Elephant |
| 23-8 Marshal Tuskwell | boss | Strong | Smartest | 73.3% | 50% | 55% | +2 Beetle Battering-Ram |
| 24-2 The Bailey | skirmish | Strong | Smartest | 93.3% | 80% | 88.3% | −2 Migration Leader, +2 Gilded Swan Knight |
| 24-4 The Courtyard Fountain | skirmish | Strong | Smartest | 98.3% | 90% | 80% | −2 Migration Leader, +2 Gilded Swan Knight |
| 0-B-2 The Briar Ring | skirmish | Mid-road | Basic | 100% | 80% | 75% | −2 Otter Kit, −2 Pond Duck, +2 Thornwood Palisade, +2 Burrow Rabbit |
| 0-B-4 The Old Bramble | boss | Mid-road | Basic | 70% | 53.3% | 53.3% | +4 Burrow Rabbit |
| T-3 Ranks and Challenges | skirmish | Road | Basic | 100% | 76.7% | 71.7% | −2 Otter Kit, +2 Badger Berserker |
| T-4 The Final Exam | elite | Strong | Basic | 93.3% | 43.3% | 30% | −2 Alpine Avalanche, −2 Glacier Yak, −2 Peak Condor, +4 Burrow Rabbit, +4 Badger Berserker |
| 1-A-1 Clover Patch | skirmish | Road | Basic | 100% | 71.7% | 76.7% | −2 Harvest Mouse, +2 Beetle Battering-Ram |
| 1-A-2 Bee Lines | skirmish | Road | Basic | 100% | 66.7% | 73.3% | −2 Honey Bee, +2 Badger Berserker |
| 1-A-3 Puddle Hop | skirmish | Road | Basic | 98.3% | 85% | 76.7% | −2 Garden Snail, +2 Burrow Rabbit |
| 1-A-4 Harvest Mice | skirmish | Road | Basic | 100% | 80% | 80% | −2 Harvest Mouse, −2 Chipmunk Forager, +4 Burrow Rabbit |
| 2-A-2 Duck Row | skirmish | Road | Basic | 96.7% | 68.3% | 71.7% | −2 Silver Minnow, +2 Mallard Marauder |
| 2-B-1 Drip Tunnel | skirmish | Road | Basic | 100% | 88.3% | 81.7% | −2 Blind Cave Fish, +4 Mallard Marauder |
| 2-B-2 Smugglers' Stash | elite | Road | Basic | 91.7% | 66.7% | 53.3% | +2 Mallard Marauder |
| 2-B-3 The Glowing Pool | elite | Road | Basic | 96.7% | 83.3% | 86.7% | −2 Reef Manta Glider, −2 Otter Riverguard, +2 Mallard Marauder, +2 Quill Volley |
| 5-A-1 Rotting Roots | skirmish | Road | Basic | 100% | 78.3% | 78.3% | −2 Star-nosed Mole, +2 Mallard Marauder |
| 7-A-1 Root Cellar | skirmish | Road | Basic | 93.3% | 55% | 43.3% | −2 Honey Bee, +2 Beetle Battering-Ram |
| 7-A-2 Glowcap Grotto | skirmish | Road | Basic | 93.3% | 43.3% | 45% | +2 Beetle Battering-Ram |
| 7-A-3 Silk Gallery | elite | Road | Smart | 70% | 30% | 18.3% | +2 Beetle Battering-Ram |
| 7-A-4 The Rot Heart | elite | Road | Smart | 63.3% | 36.7% | 36.7% | −2 Fungal Colossus, +4 Swarm Matriarch |
| 7-A-5 The Mycelium Mind | boss | Road | Smart | 80% | 26.7% | 15% | +2 Trapdoor Spider, +2 Beetle Battering-Ram |
| 10-A-1 Bubble Trail | skirmish | Mid-road | Basic | 10% | 15% | 16.7% | −2 Tide Pool Crab, −2 Mangrove Mudskipper, +4 Silver Minnow |
| 10-A-2 The Drowned Deck | skirmish | Mid-road | Basic | 3.3% | 16.7% | 11.7% | −2 Inkcloud Squid, +2 Silver Minnow |
| 10-A-3 Cargo Hold | skirmish | Mid-road | Basic | 3.3% | 26.7% | 21.7% | −1 Open-Ocean Hermit Crab, −2 Blind Cave Fish, +3 Silver Minnow |
| 10-A-4 The Undertow | elite | Mid-road | Smart | 5% | 31.7% | 21.7% | −2 Voltaic Eel, −1 Swordfish Spearman, +3 Silver Minnow |
| 10-A-5 The Ferry's Last Passenger | boss | Mid-road | Smart | 11.7% | 33.3% | 18.3% | −2 Inkcloud Squid, −1 Tide Pool Crab, −1 Blind Cave Fish, +4 Silver Minnow |
| 14-A-5 The Jaguar's Path | boss | Mid-road | Smart | 13.3% | 13.3% | 18.3% | −2 Jaguar Stalker, +2 Termite Mound |
| 17-A-4 The Hollow King | boss | Mid-road | Smart | 75% | 55% | 50% | +2 Arctic Fox Raider |
| 19-A-7 Basalt Vanguard | elite | Strong | Smart | 63.3% | 58.3% | 50% | +2 Ashbone Ghoul |
| 19-A-8 Titan's Shadow | elite | Strong | Smart | 81.7% | 51.7% | 46.7% | −1 Basalt Boar, +3 Cinder Imp, +4 Ashbone Ghoul |
| 20-A-7 Ash Condor Roost | elite | Strong | Smart | 91.7% | 88.3% | 85% | +2 Sulfur Vent Crab |

## Every map, before → after

| Map | Fights | Your deck | Before: mean · outliers | After: mean · outliers | Skirmish / elite / boss mean, after |
|---|---|---|---|---|---|
| Map 0 Bramblewood Outskirts | 4 | Starter | 70% · 0 | 61% · 0 | 70 / – / 35 |
| Map 1 Thistlewood | 5 | Road | 60% · 1 | 52% · 0 | 57 / – / 32 |
| Map 2 Pebble Beach | 5 | Road | 81% · 0 | 78% · 0 | 81 / – / 65 |
| Map 3 Gannet Cliffs | 7 | Road | 98% · 7 | 77% · 0 | 81 / 71 / 75 |
| Map 4 Sunken Hollow | 5 | Road | 23% · 1 | 27% · 0 | 34 / 20 / 28 |
| Map 5 Gatorback Swamp | 7 | Road | 65% · 0 | 65% · 0 | 78 / 56 / 28 |
| Map 6 Sable Swampmire | 8 | Road | 52% · 0 | 52% · 0 | 57 / 46 / 48 |
| Map 7 The Morel Hollow | 6 | Road | 36% · 1 | 39% · 0 | 44 / 35 / 22 |
| Map 8 Caves & Alcoves | 8 | Road | 52% · 1 | 48% · 0 | 56 / 22 / 25 |
| Map 9 The Kelp Mangroves | 7 | Road | 40% · 1 | 40% · 0 | 48 / 27 / 33 |
| Map 10 Coral Current | 9 | Mid-road | 22% · 5 | 30% · 0 | 36 / 17 / 35 |
| Map 11 Eyrie Heights | 10 | Mid-road | 54% · 0 | 50% · 0 | 67 / 41 / 30 |
| Map 12 The Briar Maze | 7 | Mid-road | 49% · 1 | 51% · 0 | 65 / 36 / 23 |
| Map 13 The Redwood Deep | 8 | Mid-road | 25% · 2 | 29% · 0 | 33 / 30 / 15 |
| Map 14 Savanna Reaches | 8 | Mid-road | 41% · 1 | 41% · 0 | 58 / 26 / 17 |
| Map 15 The Long Grass | 7 | Mid-road | 53% · 0 | 46% · 0 | 54 / 39 / 32 |
| Map 16 The Pinewood Taiga | 7 | Mid-road | 43% · 0 | 43% · 0 | 53 / 36 / 13 |
| Map 17 Wolfsbane Tundra | 8 | Mid-road | 58% · 3 | 41% · 0 | 52 / 27 / 35 |
| Map 18 The Glass Dunes | 7 | Strong | 87% · 2 | 76% · 0 | 82 / 71 / 60 |
| Map 19 Ashen Spurn | 6 | Strong | 71% · 0 | 64% · 0 | 73 / 59 / 60 |
| Map 20 The Sundered Peak | 10 | Strong | 80% · 2 | 63% · 0 | 72 / 59 / 55 |
| Map 21 The Quiet Summit | 6 | Strong | 90% · 2 | 86% · 1 | 90 / 83 / 83 |
| Map 22 The Rimefire Caldera | 8 | Strong | 88% · 6 | 58% · 0 | 63 / 49 / 53 |
| Map 23 The Goldfeather Siege | 8 | Strong | 72% · 1 | 55% · 0 | 61 / 43 / 50 |
| Map 24 Goldfeather Keep | 8 | Strong | 83% · 3 | 80% · 1 | 86 / 83 / 48 |
| Tutorial (side of Map 0) | 3 | Strong, Road | 78% · 2 | 54% · 0 | 59 / 43 / – |
| The Old Bramble (side of Map 0) | 4 | Mid-road | 72% · 1 | 62% · 0 | 66 / – / 53 |
| Clovermead (side of Map 1) | 5 | Road | 93% · 4 | 74% · 0 | 76 / – / 67 |
| Lilypad Reach (side of Map 2) | 7 | Road | 61% · 1 | 57% · 0 | 72 / 33 / 43 |
| Smugglers' Grotto (side of Map 2) | 4 | Road | 91% · 2 | 78% · 0 | 88 / 75 / – |
| The Sunken Grove (side of Map 5) | 4 | Road | 77% · 1 | 71% · 0 | 74 / – / 63 |
| Murgle Mayhem (side of Map 6) | 4 | Road | 13% · 3 | 13% · 3 | 26 / – / 0 |
| The Mycelium Deep (side of Map 7) | 5 | Road | 80% · 2 | 38% · 0 | 49 / 33 / 27 |
| The Glimmer Depths (side of Map 8) | 4 | Road | 63% · 0 | 63% · 0 | 68 / – / 47 |
| The Sunken Depths (side of Map 10) | 5 | Mid-road | 7% · 5 | 25% · 0 | 19 / 32 / 33 |
| The Aerie Vault (side of Map 11) | 4 | Mid-road | 68% · 0 | 68% · 0 | 69 / – / 62 |
| The Canopy (side of Map 14) | 5 | Mid-road | 29% · 0 | 29% · 0 | 38 / 17 / 13 |
| The Ice Hollow (side of Map 17) | 4 | Mid-road | 69% · 0 | 64% · 0 | 67 / – / 55 |
| Basalt Foundry (side of Map 19) | 10 | Strong | 64% · 0 | 61% · 0 | 66 / 54 / 48 |
| Eye of the Volcano (side of Map 20) | 7 | Strong | 83% · 0 | 82% · 0 | – / 82 / – |
| Volcano Lair (side of Map 20) | 4 | Strong | 68% · 0 | 68% · 0 | 76 / – / 47 |
| The Long Burrow (side of Map 22) | 4 | Strong | 40% · 2 | 40% · 2 | 61 / – / 18 |

Fight by fight (win % on the measure seeds; an arrow where the pass changed it):

- **Map 0 Bramblewood Outskirts:** 0-1 90 · 0-2 63.3 · 0-3 56.7 · 0-4 70→35
- **Map 1 Thistlewood:** 1-1 95→88.3 · 1-2 63.3 · 1-3 43.3 · 1-4 31.7 · 1-5 66.7→31.7
- **Map 2 Pebble Beach:** 2-1 85 · 2-2 85 · 2-3 66.7 · 2-4 86.7 · 2-5 83.3→65
- **Map 3 Gannet Cliffs:** 3-1 100→78.3 · 3-2 100→76.7 · 3-3 100→83.3 · 3-4 96.7→85 · 3-5 100→71.7 · 3-6 95→70 · 3-7 96.7→75
- **Map 4 Sunken Hollow:** 4-1 45 · 4-2 23.3 · 4-3 21.7 · 4-4 18.3 · 4-5 5→28.3
- **Map 5 Gatorback Swamp:** 5-1 83.3 · 5-2 76.7 · 5-3 71.7 · 5-4 81.7 · 5-5 53.3 · 5-6 58.3 · 5-7 28.3
- **Map 6 Sable Swampmire:** 6-1 66.7 · 6-2 91.7→86.7 · 6-3 31.7 · 6-4 41.7 · 6-5 48.3 · 6-6 48.3 · 6-7 41.7 · 6-8 48.3
- **Map 7 The Morel Hollow:** 7-1 35 · 7-2 46.7 · 7-3 20 · 7-4 75 · 7-5 35 · 7-6 5→21.7
- **Map 8 Caves & Alcoves:** 8-1 45 · 8-2 65 · 8-3 56.7 · 8-4 18.3 · 8-5 80 · 8-6 70 · 8-7 10→21.7 · 8-8 73.3→25
- **Map 9 The Kelp Mangroves:** 9-1 41.7 · 9-2 41.7 · 9-3 60 · 9-4 48.3 · 9-5 68.3→40 · 9-6 13.3 · 9-7 6.7→33.3
- **Map 10 Coral Current:** 10-1 38.3 · 10-2 53.3 · 10-3 35 · 10-4 36.7 · 10-5 5→18.3 · 10-6 3.3→16.7 · 10-7 5→16.7 · 10-8 10→16.7 · 10-9 10→35
- **Map 11 Eyrie Heights:** 11-1 68.3 · 11-2 76.7 · 11-3 66.7 · 11-4 56.7 · 11-5 31.7 · 11-6 60 · 11-7 50 · 11-8 73.3→40 · 11-9 21.7 · 11-10 30
- **Map 12 The Briar Maze:** 12-1 73.3 · 12-2 55 · 12-3 81.7 · 12-4 51.7 · 12-5 38.3 · 12-6 33.3 · 12-7 8.3→23.3
- **Map 13 The Redwood Deep:** 13-1 16.7 · 13-2 23.3 · 13-3 75 · 13-4 15 · 13-5 33.3 · 13-6 8.3→35 · 13-7 21.7 · 13-8 5→15
- **Map 14 Savanna Reaches:** 14-1 70 · 14-2 50 · 14-3 38.3 · 14-4 71.7 · 14-5 61.7→41.7 · 14-6 15 · 14-7 21.7 · 14-8 3.3→16.7
- **Map 15 The Long Grass:** 15-1 38.3 · 15-2 66.7 · 15-3 35 · 15-4 75 · 15-5 88.3→41.7 · 15-6 36.7 · 15-7 31.7
- **Map 16 The Pinewood Taiga:** 16-1 51.7 · 16-2 73.3 · 16-3 56.7 · 16-4 31.7 · 16-5 23.3 · 16-6 48.3 · 16-7 13.3
- **Map 17 Wolfsbane Tundra:** 17-1 61.7 · 17-2 60 · 17-3 0→16.7 · 17-4 70 · 17-5 83.3→21.7 · 17-6 80→30 · 17-7 96.7→30 · 17-8 10→35
- **Map 18 The Glass Dunes:** 18-1 95→63.3 · 18-2 91.7 · 18-3 88.3 · 18-4 96.7→85 · 18-5 85→73.3 · 18-6 91.7→68.3 · 18-7 60
- **Map 19 Ashen Spurn:** 19-1 80 · 19-2 65 · 19-3 70→58.3 · 19-4 76.7→63.3 · 19-5 55 · 19-6 78.3→60
- **Map 20 The Sundered Peak:** 20-1 68.3 · 20-2 71.7 · 20-3 61.7 · 20-4 85 · 20-5 95→63.3 · 20-6 91.7→65 · 20-7 78.3→60 · 20-8 83.3→48.3 · 20-9 96.7→45 · 20-10 65
- **Map 21 The Quiet Summit:** 21-1 85 · 21-2 85 · 21-3 100 · 21-4 91.7→83.3 · 21-5 93.3→81.7 · 21-6 83.3
- **Map 22 The Rimefire Caldera:** 22-1 96.7→50 · 22-2 56.7 · 22-3 93.3→63.3 · 22-4 98.3→71.7 · 22-5 98.3→71.7 · 22-6 98.3→53.3 · 22-7 68.3→45 · 22-8 95→53.3
- **Map 23 The Goldfeather Siege:** 23-1 48.3 · 23-2 83.3 · 23-3 40 · 23-4 65 · 23-5 100→70 · 23-6 78.3→45 · 23-7 91.7→41.7 · 23-8 73.3→50
- **Map 24 Goldfeather Keep:** 24-1 90 · 24-2 93.3→80 · 24-3 85 · 24-4 98.3→90 · 24-5 83.3 · 24-6 98.3 · 24-7 66.7 · 24-8 48.3
- **Tutorial (side of Map 0):** T-2 41.7 · T-3 100→76.7 · T-4 93.3→43.3
- **The Old Bramble (side of Map 0):** 0-B-1 33.3 · 0-B-2 100→80 · 0-B-3 83.3 · 0-B-4 70→53.3
- **Clovermead (side of Map 1):** 1-A-1 100→71.7 · 1-A-2 100→66.7 · 1-A-3 98.3→85 · 1-A-4 100→80 · 1-A-5 66.7
- **Lilypad Reach (side of Map 2):** 2-A-1 55 · 2-A-2 96.7→68.3 · 2-A-3 81.7 · 2-A-4 83.3 · 2-A-5 21.7 · 2-A-6 45 · 2-A-7 43.3
- **Smugglers' Grotto (side of Map 2):** 2-B-1 100→88.3 · 2-B-2 91.7→66.7 · 2-B-3 96.7→83.3 · 2-B-4 75
- **The Sunken Grove (side of Map 5):** 5-A-1 100→78.3 · 5-A-2 63.3 · 5-A-3 80 · 5-A-4 63.3
- **Murgle Mayhem (side of Map 6):** 6-MM-1 51.7 · 6-MM-10 0 · 6-MM-25 0 · 6-MM-50 0
- **The Mycelium Deep (side of Map 7):** 7-A-1 93.3→55 · 7-A-2 93.3→43.3 · 7-A-3 70→30 · 7-A-4 63.3→36.7 · 7-A-5 80→26.7
- **The Glimmer Depths (side of Map 8):** 8-A-1 71.7 · 8-A-2 70 · 8-A-3 63.3 · 8-A-4 46.7
- **The Sunken Depths (side of Map 10):** 10-A-1 10→15 · 10-A-2 3.3→16.7 · 10-A-3 3.3→26.7 · 10-A-4 5→31.7 · 10-A-5 11.7→33.3
- **The Aerie Vault (side of Map 11):** 11-A-1 68.3 · 11-A-2 83.3 · 11-A-3 56.7 · 11-A-4 61.7
- **The Canopy (side of Map 14):** 14-A-1 53.3 · 14-A-2 33.3 · 14-A-3 28.3 · 14-A-4 16.7 · 14-A-5 13.3
- **The Ice Hollow (side of Map 17):** 17-A-1 75 · 17-A-2 90 · 17-A-3 35 · 17-A-4 75→55
- **Basalt Foundry (side of Map 19):** 19-A-1 88.3 · 19-A-2 46.7 · 19-A-3 46.7 · 19-A-4 71.7 · 19-A-5 70 · 19-A-6 75 · 19-A-7 63.3→58.3 · 19-A-8 81.7→51.7 · 19-A-9 51.7 · 19-A-10 48.3
- **Eye of the Volcano (side of Map 20):** 20-A-1 80 · 20-A-2 85 · 20-A-3 78.3 · 20-A-4 81.7 · 20-A-5 80 · 20-A-6 81.7 · 20-A-7 91.7→88.3
- **Volcano Lair (side of Map 20):** 20-B-1 75 · 20-B-2 91.7 · 20-B-3 60 · 20-B-4 46.7
- **The Long Burrow (side of Map 22):** 22-LB-1 95 · 22-LB-10 28.3 · 22-LB-25 26.7 · 22-LB-50 8.3

## Still outside the band

| Fight | After (fresh seeds) | Why it stays |
|---|---|---|
| 21-3 Cloud Ledge (skirmish, Strong) | 100% (100%) | The Strong deck's Owl Fletchers and Cave Bat Swarms shoot down a deck of 12 flyers; the Mid-road deck wins 73%. No themed card under the Map 21 cap moved it, and Shield does not matter in a fight where the CPU cannot hurt you. It needs a ground attacker or anti-air chosen by hand, or it can stay as the Strong deck's soft counter. |
| 24-6 The Gilded Guard (elite, Strong) | 98% (100%) | 11 defensive cards (Goose Sentry, Mallard Halberdier, Truce Heron, Iron Warden) that run dry; the Mid-road deck also wins 98%. No deck move within the cap, and no Shield up to 180, moved it. It needs a real attacker added by hand (the Gilded Swan Knight is already in). |
| 24-1 Breach the Gate (skirmish, Strong) | 90% (95%) | On the edge: 92.5% over 120 games. Left alone as within noise. |
| 6-MM-10 / 25 / 50 Murgle Mayhem floors | 0% / 0% / 0% | Endless dungeon. Floor 1 is 52% for the Map 6 Road deck and 73% for Strong, and each floor adds 4% to the frogs' stats. Since X3, `hqHp` (40 + 3 a floor) no longer adds Shield, so the floors scale by stats alone. Floor 10's King is 0% (Road) / 28% (Strong). Not tuned: an endless climb is meant to wall a deck. |
| 22-LB-1 / 22-LB-50 The Long Burrow | 95% / 8% | The same: an easy first sett, a wall at 50. Not tuned. |

Within a few points of the edge on one seed set but inside the band over both: 0-1, 5-1, 10-6, 10-8, 16-7, 18-3 and 10-A-2.

**Elites and bosses not harder than their skirmishes:** only the Sunken Depths (skirmishes 19% on average, against an elite at 32% and a boss at 33%). Its fights were all at 3–12% before; the band came first, and its skirmishes are the ones that stayed lower.

## Not covered

- **Tutorial and raid fights:** as asked.
- **Babel Spire floors:** their decks are rated and levelled to 11–20 when the game loads (`towerFloorDeck`), and neither the old tools nor this one cover them.
- **The dungeon kind (20-A-4 Heart of the Mountain):** played as one bramble, as the editor's Simulate does, not as its three waves.
- **Gladiator nodes:** played as the editor plays them (no gladiator leader).

## The old tuning tools

X3 noted that `tools/curve_tune.js`, `tools/retune_all.js` and `tools/autotune_map.js` still tuned `hqHp` as Health + Shield. They now read the bramble's total from `tools/lib_bramble.js`. On `--apply`, they write the result under the rule (`lib_bramble.retotal`): a `shieldOverride`, or, below the bramble's own Health, a lower `hqHp` with no Shield. A total that lands on the rule's own Shield writes nothing. Their sims are still their old approximations (plain castle, `aiAim` off). `tools/skirmish_pass.js` is the one that plays the real fight build.

`tests/shields-2026-10-18.js` now allows a node's `shieldOverride`: it checks that the Shield shown is the override and that the rule still stands under it. Its per-map rule checks read `.rule`.

## Decisions for the owner

1. **0-4 Frost Vanguard** (Map 0's boss) is now 35% for the starter deck (was 70%), so it reads harder than Map 0's skirmishes (57–90%). If the first boss should stay gentle, revert its +2 Royal Guard.
2. **Badger Berserker** (Rare) now appears in nine fights it wasn't in before, as the strongest themed card the tune could reach: 1-5, 1-A-2, T-3, T-4, 22-1, 22-3, 22-6, 22-7 and 22-8. **Pelican Divers** fill Map 3. Swap in your own picks if they read as off-theme.
3. **21-3 and 24-6** need a hand-picked card (above).
4. **Endless dungeons:** since X3, floors scale only by the 4%-a-floor stat bonus, and the Murgle King on floor 10 is already 0% for a Map 6 deck. Do you want the floors to scale the Shield too, or a gentler step?
5. **The Strong deck** was built on 10-17, before the card pass. Rebuilding it (`node tools/difficulty_curve.js`) would move Maps 18–24 a little.

Re-run:
- `node tools/skirmish_pass.js measure 60 0 2 --tag=now` and `… 1 2 --tag=now`: about 3 minutes on two cores.
- `node tools/skirmish_pass.js decks` rebuilds the Road decks: about 4 minutes.
