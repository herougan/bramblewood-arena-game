# Skill worth vs price (global, 2026-10-30)

Package TOOLS1 (T2). `node tools/bench/bench.js skill --all --games 200` (tools/bench/bench.js skill 1.0.0 (2026-10-28, TOOLS1)); game fingerprint `b791b784613a`. Suggested prices: `docs/balance/bench-skill-prices-2026-10-30-remeasure.json` (nothing written to canonical/skill-costs.json).

## How it is measured

- Per skill, up to 4 cards that carry it; a skill on fewer than 2 cards also gets vanilla carriers (beaver-builder, squires-mount) given the skill as its card has it. Each carrier plays 200 paired fights (the bench's slot of 6 copies, Level 1, the global field pool, Smart CPU both sides, 30-Health brambles): with the skill, without it at the same stats, and as printed with +1 Attack and with +1 Health.
- **The yardstick** (pooled over 283 carriers): +1 Attack on 6 copies = +9.5 points, +1 Health = +3.0 points (1 Attack = 3.2033 Health measured; the budget says 2). One budget point (2A + H) = **4.17 ± 0.67 win-rate points**.
- **Measured worth** = the skill's paired gain / the yardstick, in budget points; **Attack-eq** = worth / 2. **Price now** = the carrier's cap-1 left side (2A + H) x m + S with the skill minus without it, as printed (`bramblewood-budget.js`). **Net** = worth - price: + under-priced (it gives more than it costs), - over-priced. z = net / its standard error; confidence high |z| >= 2.5, medium >= 1.5.
- Read a low-confidence row as "not measurably mispriced at this many fights", not as "fair". Random decks: a skill that needs partners (a tribe, Lumber makers, a field) reads low.
- The interval and z count the fights' noise on these carriers only, not how typical the carriers are: with 2-3 carriers a skill whose worth depends on the card (its Attack, its Lumber, a partner) can read far from its average. Re-measure a flagged skill with more carriers (`--carriers 4 --games 200`) before changing its price.
- Across all 74 skills: median worth +1.1, median price +3.0, median net -1.5. Price rules that zero a stat (an Archer's Attack) show as a negative price: the skill's row then measures swinging against shooting.

## The 15 most mispriced (medium or high confidence first, by |net|)

| Rank | Skill | Verdict | Confidence | Measured worth (95%) | Attack-eq | Price now | Net | z | Carriers | Per N (worth / price) |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | tsunami | over-priced | high | +5.2 ± 1.2 | +2.6 | +22.5 | -17.3 | -27.33 | Sperm Whale Elder, Fathom Leviathan | 1: +8.9 / +15.0; 2: +1.5 / +30.0 |
| 2 | sturdy | over-priced | high | +0.7 ± 0.6 | +0.3 | +8.0 | -7.3 | -23.64 | Pangolin Roller, Grovebearer Dragon-Turtle | 1: +0.7 / +8.0 |
| 3 | loneWolf | over-priced | high | +5.2 ± 1.2 | +2.6 | +12.0 | -6.8 | -11.27 | Lone Grey Wolf, Beaver Builder (vanilla), Squire's Mount (vanilla) | 2: +5.2 / +12.0 |
| 4 | sweep | over-priced | high | +1.1 ± 0.6 | +0.5 | +7.8 | -6.7 | -23.15 | Alpha Howler, Boar Rampager, Boreal Elk, Fox Warchief | 2: +0.4 / +7.8; 3: +1.8 / +7.8 |
| 5 | acidBolt | under-priced | high | +7.2 ± 1.5 | +3.6 | +1.0 | +6.2 | 8.32 | Archerfish, Beaver Builder (vanilla), Squire's Mount (vanilla) | 1: +7.2 / +1.0 |
| 6 | quarry | over-priced | high | -3.2 ± 1.0 | -1.6 | +2.5 | -5.7 | -11.57 | Badger Stonemason, Beaver Builder (vanilla), Squire's Mount (vanilla) | 1: -3.2 / +2.5 |
| 7 | immolation | over-priced | high | -0.6 ± 0.5 | -0.3 | +5.0 | -5.6 | -20.98 | Magma Titan, Rimeheart Colossus, Ember Wisp, Ashmantle Fiend | 1: -0.6 / +4.0; 2: -0.7 / +8.0 |
| 8 | spitfire | under-priced | high | +6.1 ± 1.3 | +3.1 | +1.0 | +5.1 | 7.59 | Fire Salamander, Beaver Builder (vanilla), Squire's Mount (vanilla) | 1: +6.1 / +1.0 |
| 9 | sacrifice | over-priced | high | -0.1 ± 0.3 | -0.0 | +4.5 | -4.6 | -33.92 | Cinder Imp, Ash Imp | 1: -0.2 / +3.0; 2: +0.1 / +6.0 |
| 10 | avalanche | under-priced | high | +8.3 ± 1.7 | +4.1 | +4.0 | +4.3 | 4.94 | Ibex Rockcaller, Beaver Builder (vanilla), Squire's Mount (vanilla) | 1: +8.3 / +4.0 |
| 11 | regen | over-priced | high | +1.0 ± 0.5 | +0.5 | +5.2 | -4.2 | -17.69 | Grovebearer Dragon-Turtle, Alpine Salamander, Bog Behemoth, Bramble Hoglet | 1: +1.7 / +2.6; 3: +0.2 / +7.8 |
| 12 | expose | over-priced | high | +0.1 ± 0.6 | +0.0 | +4.2 | -4.1 | -13.78 | Narwhal Lancer, Snow Owl Sentinel | 2: +0.1 / +4.2 |
| 13 | venomous | over-priced | high | +1.3 ± 0.7 | +0.6 | +5.4 | -4.1 | -11.91 | Platypus Spur, Water Shrew, Banded Sea Krait, Giant Water Bug | 1: +1.4 / +3.1; 2: +1.2 / +6.2 |
| 14 | scare | over-priced | high | +0.3 ± 0.3 | +0.2 | +4.4 | -4.1 | -29.89 | Ashmantle Fiend, White Dragon, Yeti, Amber Cicada | 1: +1.1 / +2.5; 2: +0.1 / +5.0; 3: +0.0 / +5.0 |
| 15 | rage | over-priced | high | +1.0 ± 0.5 | +0.5 | +5.0 | -4.0 | -16.85 | Berserker Boar, Honey Badger Fury, Ant Warrior, Cave Bear | 1: +1.0 / +5.0 |

## Every skill

| Rank | Skill | Verdict | Confidence | Measured worth (95%) | Attack-eq | Price now | Net | z | Carriers | Per N (worth / price) |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | tsunami | over-priced | high | +5.2 ± 1.2 | +2.6 | +22.5 | -17.3 | -27.33 | Sperm Whale Elder, Fathom Leviathan | 1: +8.9 / +15.0; 2: +1.5 / +30.0 |
| 2 | sturdy | over-priced | high | +0.7 ± 0.6 | +0.3 | +8.0 | -7.3 | -23.64 | Pangolin Roller, Grovebearer Dragon-Turtle | 1: +0.7 / +8.0 |
| 3 | loneWolf | over-priced | high | +5.2 ± 1.2 | +2.6 | +12.0 | -6.8 | -11.27 | Lone Grey Wolf, Beaver Builder (vanilla), Squire's Mount (vanilla) | 2: +5.2 / +12.0 |
| 4 | sweep | over-priced | high | +1.1 ± 0.6 | +0.5 | +7.8 | -6.7 | -23.15 | Alpha Howler, Boar Rampager, Boreal Elk, Fox Warchief | 2: +0.4 / +7.8; 3: +1.8 / +7.8 |
| 5 | acidBolt | under-priced | high | +7.2 ± 1.5 | +3.6 | +1.0 | +6.2 | 8.32 | Archerfish, Beaver Builder (vanilla), Squire's Mount (vanilla) | 1: +7.2 / +1.0 |
| 6 | quarry | over-priced | high | -3.2 ± 1.0 | -1.6 | +2.5 | -5.7 | -11.57 | Badger Stonemason, Beaver Builder (vanilla), Squire's Mount (vanilla) | 1: -3.2 / +2.5 |
| 7 | immolation | over-priced | high | -0.6 ± 0.5 | -0.3 | +5.0 | -5.6 | -20.98 | Magma Titan, Rimeheart Colossus, Ember Wisp, Ashmantle Fiend | 1: -0.6 / +4.0; 2: -0.7 / +8.0 |
| 8 | spitfire | under-priced | high | +6.1 ± 1.3 | +3.1 | +1.0 | +5.1 | 7.59 | Fire Salamander, Beaver Builder (vanilla), Squire's Mount (vanilla) | 1: +6.1 / +1.0 |
| 9 | sacrifice | over-priced | high | -0.1 ± 0.3 | -0.0 | +4.5 | -4.6 | -33.92 | Cinder Imp, Ash Imp | 1: -0.2 / +3.0; 2: +0.1 / +6.0 |
| 10 | avalanche | under-priced | high | +8.3 ± 1.7 | +4.1 | +4.0 | +4.3 | 4.94 | Ibex Rockcaller, Beaver Builder (vanilla), Squire's Mount (vanilla) | 1: +8.3 / +4.0 |
| 11 | regen | over-priced | high | +1.0 ± 0.5 | +0.5 | +5.2 | -4.2 | -17.69 | Grovebearer Dragon-Turtle, Alpine Salamander, Bog Behemoth, Bramble Hoglet | 1: +1.7 / +2.6; 3: +0.2 / +7.8 |
| 12 | expose | over-priced | high | +0.1 ± 0.6 | +0.0 | +4.2 | -4.1 | -13.78 | Narwhal Lancer, Snow Owl Sentinel | 2: +0.1 / +4.2 |
| 13 | venomous | over-priced | high | +1.3 ± 0.7 | +0.6 | +5.4 | -4.1 | -11.91 | Platypus Spur, Water Shrew, Banded Sea Krait, Giant Water Bug | 1: +1.4 / +3.1; 2: +1.2 / +6.2 |
| 14 | scare | over-priced | high | +0.3 ± 0.3 | +0.2 | +4.4 | -4.1 | -29.89 | Ashmantle Fiend, White Dragon, Yeti, Amber Cicada | 1: +1.1 / +2.5; 2: +0.1 / +5.0; 3: +0.0 / +5.0 |
| 15 | rage | over-priced | high | +1.0 ± 0.5 | +0.5 | +5.0 | -4.0 | -16.85 | Berserker Boar, Honey Badger Fury, Ant Warrior, Cave Bear | 1: +1.0 / +5.0 |
| 16 | onReadyGold | over-priced | high | +2.3 ± 0.7 | +1.2 | +6.2 | -3.9 | -10.47 | Chipmunk Hoarder, Elder Willow, Elderhorn Monarch, Land Tiller | 1: +2.3 / +6.2 |
| 17 | quick | over-priced | high | +1.1 ± 1.0 | +0.6 | +5.0 | -3.9 | -7.72 | Caiman Hatchling, Chipmunk Cavalry, Tomcat, Hedgerow Shrew | 1: +1.1 / +5.0 |
| 18 | undead | over-priced | high | +0.5 ± 0.5 | +0.3 | +4.3 | -3.8 | -14.35 | Phoenix Mushrooms, Grass Snake, Slow-worm, Cinder Skeleton | 1: +0.5 / +4.3 |
| 19 | healing | over-priced | high | +1.6 ± 0.7 | +0.8 | +5.3 | -3.7 | -11.13 | Abbey Goose, Newt Doctor, Nectar Vintner | 1: +2.4 / +4.0; 2: +0.0 / +8.0 |
| 20 | shell | over-priced | high | +1.0 ± 0.5 | +0.5 | +4.5 | -3.5 | -13.44 | Malachite Golem, Shellwright Apprentice, Stalactite Golem, Limpet Clinger | 1: +3.9 / +2.0; 2: +0.1 / +4.0; 4: +0.1 / +6.0 |
| 21 | strangle | under-priced | high | +4.6 ± 1.3 | +2.3 | +1.2 | +3.4 | 5.25 | Anaconda Coil, Birdlime Dauber | 1: +5.5 / +0.8; 2: +3.8 / +1.6 |
| 22 | fastForward | over-priced | high | +2.3 ± 0.8 | +1.2 | +5.6 | -3.3 | -8.12 | Swift Fox, Beaver Builder (vanilla), Squire's Mount (vanilla) | 1: +2.3 / +5.6 |
| 23 | speed | over-priced | high | +0.7 ± 0.6 | +0.4 | +3.9 | -3.2 | -9.54 | Pronghorn Racer, Beaver Builder (vanilla), Squire's Mount (vanilla) | 2: +0.7 / +3.9 |
| 24 | milling | under-priced | high | +6.1 ± 1.4 | +3.1 | +3.0 | +3.1 | 4.43 | Redwood Woodpecker, Beaver Builder (vanilla), Squire's Mount (vanilla) | 1: +6.1 / +3.0 |
| 25 | rocket | under-priced | high | +6.1 ± 1.3 | +3.0 | +3.0 | +3.1 | 4.57 | Bombardier Beetle, Beaver Builder (vanilla), Squire's Mount (vanilla) | 4: +6.1 / +3.0 |
| 26 | fork | over-priced | high | +1.3 ± 0.5 | +0.6 | +4.0 | -2.7 | -10.33 | Kraken Spawnling, Colossal Squid, Alpine Avalanche, Pack Wolf Reaver | 1: +1.3 / +4.0 |
| 27 | gash | over-priced | high | +0.5 ± 0.3 | +0.2 | +3.2 | -2.7 | -19.03 | Komodo Warlord, Kraken Spawnling, Colossal Squid | 3: +0.5 / +3.2 |
| 28 | daunt | over-priced | high | +0.4 ± 0.4 | +0.2 | +3.1 | -2.7 | -12.39 | Booming Bittern, Cave Warlord, Eyrie Warden, Skull Vulture | 1: +0.6 / +2.5; 2: +0.0 / +5.0 |
| 29 | taunt | over-priced | high | +0.4 ± 0.8 | +0.2 | +3.0 | -2.6 | -6.36 | Swordbill Challenger, Sheep, Goose Sentry, Proboscis Monkey | 1: +0.4 / +3.0 |
| 30 | hunter | over-priced | high | +0.4 ± 1.0 | +0.2 | +3.0 | -2.6 | -5.24 | Fen Mink, Tidepool Trapper Crab | 1: +0.3 / +2.0; 2: +0.5 / +4.0 |
| 31 | charge | under-priced | high | +5.6 ± 1.3 | +2.8 | +3.0 | +2.6 | 3.86 | Electric Ray, Beaver Builder (vanilla), Squire's Mount (vanilla) | - |
| 32 | iceBolt | under-priced | high | +8.4 ± 1.6 | +4.2 | +6.0 | +2.4 | 2.88 | Ice Petrel, Beaver Builder (vanilla), Squire's Mount (vanilla) | 2: +8.4 / +6.0 |
| 33 | twinShot | over-priced | high | +6.6 ± 1.4 | +3.3 | +9.0 | -2.4 | -3.45 | Spitting Cobra, Beaver Builder (vanilla), Squire's Mount (vanilla) | 1: +6.6 / +9.0 |
| 34 | volley | under-priced | high | +6.8 ± 1.6 | +3.4 | +4.5 | +2.3 | 2.81 | Echidna Quillshot, Trebuchet Crew | 1: +7.7 / +3.0; 2: +6.0 / +6.0 |
| 35 | ambush | over-priced | high | +1.7 ± 0.8 | +0.9 | +4.0 | -2.3 | -5.5 | Polar Bear, Subterraneaner, Tunnel Ant | 1: +0.2 / +2.0; 2: +2.3 / +4.0; 4: +2.7 / +6.0 |
| 36 | swipe | under-priced | high | +5.2 ± 1.4 | +2.6 | +3.0 | +2.2 | 3.11 | Jay Pilferer, Tax-Collector Teal | 1: +5.2 / +3.0 |
| 37 | lumberjack | over-priced | high | +2.8 ± 0.9 | +1.4 | +5.0 | -2.2 | -5.16 | Badger Lumberjack, Beaver Builder (vanilla), Squire's Mount (vanilla) | 1: +2.8 / +5.0 |
| 38 | iceArrow | under-priced | high | +5.9 ± 1.6 | +3.0 | +3.8 | +2.2 | 2.76 | Snow Bunting Archer, Rimefire Salamander | 1: +6.4 / +2.5; 2: +5.5 / +5.0 |
| 39 | berserk | under-priced | high | +6.2 ± 1.3 | +3.1 | +4.0 | +2.2 | 3.16 | Tasmanian Devil, Beaver Builder (vanilla), Squire's Mount (vanilla) | 2: +6.2 / +4.0 |
| 40 | bleed | over-priced | high | +2.8 ± 0.9 | +1.4 | +5.0 | -2.1 | -4.92 | Wound Reaver, Bog Leech, Frost Thistle Lynx, Glacier Wolf Pack | 1: +2.9 / +3.6; 2: +2.8 / +5.5 |
| 41 | greaterPoison | over-priced | high | +0.4 ± 0.5 | +0.2 | +2.5 | -2.1 | -8.2 | Cane Toad, Inland Taipan | 1: +0.4 / +2.5 |
| 42 | onDeathSpawn | over-priced | high | +0.9 ± 0.5 | +0.5 | +3.0 | -2.1 | -8.98 | Fungal Colossus, Goliath Broodmother, Millipede Hauler, Rot-Swollen Carcass | - |
| 43 | counterattack | over-priced | high | -0.2 ± 0.8 | -0.1 | +1.9 | -2.1 | -5.05 | Thornwood Palisade, Swordbill Challenger | 1: -0.2 / +1.9 |
| 44 | pounce | over-priced | high | +1.5 ± 0.7 | +0.8 | +3.6 | -2.1 | -5.55 | Anhinga Spearbird, Caldera Snow Leopard, Firetail Trickster, Fishing Cat | 2: +0.9 / +3.6; 3: +3.5 / +3.6 |
| 45 | corrode | over-priced | high | -0.1 ± 0.1 | -0.0 | +2.0 | -2.1 | -34.25 | Glass Octopus, Black Dragon | 2: -0.1 / +2.0; 3: +0.0 / +2.0 |
| 46 | midas | over-priced | high | +0.1 ± 0.1 | +0.0 | +2.0 | -1.9 | -32.25 | Golden Magpie, The Magnate Duck | 2: +0.1 / +2.0; 3: +0.0 / +2.0 |
| 47 | stockpile | under-priced | high | +3.3 ± 1.3 | +1.6 | +1.4 | +1.9 | 2.91 | Beaver Lumberjack, Muskrat Reedgatherer | 1: +1.7 / +0.9; 2: +4.8 / +1.8 |
| 48 | relic | over-priced | high | +0.1 ± 0.4 | +0.0 | +2.0 | -1.9 | -8.81 | Friar Badger, Shrine Bell-Ringer, Shrine High Priest, Vigil Owl | 1: +0.1 / +2.0 |
| 49 | drunk | under-priced | high | -1.1 ± 0.8 | -0.6 | -3.0 | +1.9 | 4.5 | Marula Elephant, Beaver Builder (vanilla), Squire's Mount (vanilla) | 1: -1.1 / -3.0 |
| 50 | remember | under-priced | high | +3.6 ± 1.0 | +1.8 | +1.8 | +1.9 | 3.76 | Ashbone Ghoul, Bog Revenant, Marsh Wisp, The Unremembered | 1: +8.8 / +1.0; 2: +3.7 / +2.0; 3: +1.0 / +2.0 |
| 51 | meiosis | under-priced | high | +2.8 ± 0.9 | +1.4 | +1.0 | +1.8 | 3.73 | Planarian Splitter, Phoenix Mushrooms | 1: +2.8 / +1.0 |
| 52 | scavenge | under-priced | high | +3.3 ± 1.0 | +1.6 | +1.5 | +1.8 | 3.47 | Carrion Crow, Beaver Builder (vanilla), Squire's Mount (vanilla) | 1: +3.3 / +1.5 |
| 53 | bulldoze | over-priced | high | +2.5 ± 0.8 | +1.2 | +4.0 | -1.5 | -3.77 | Bison Bulldozer, Beaver Builder (vanilla), Squire's Mount (vanilla) | 1: +2.5 / +4.0 |
| 54 | inspiring | over-priced | high | +2.9 ± 0.8 | +1.4 | +4.4 | -1.5 | -3.67 | Goliath Broodmother, Otter Flag Bearer, Conch Herald, Gilded Swan Knight | 1: +3.6 / +3.5; 2: +0.8 / +7.0 |
| 55 | pierce | over-priced | high | +0.3 ± 0.4 | +0.1 | +1.8 | -1.5 | -7.1 | Anvil Thrush, Ember Revenant, Mallard Halberdier, Oystercatcher | 1: +0.7 / +1.0; 2: +0.2 / +2.0 |
| 56 | siege | over-priced | high | +0.9 ± 0.5 | +0.4 | +2.3 | -1.4 | -6.01 | Cave Bear, Trebuchet Crew, Mouse Sapper, Siege Rhino | 1: +1.1 / +1.0; 2: +0.7 / +2.0; 4: +0.8 / +3.0 |
| 57 | stunOnHit | over-priced | high | +1.7 ± 0.8 | +0.8 | +3.0 | -1.3 | -3.31 | Cinder Hornet, Beaver Builder (vanilla), Squire's Mount (vanilla) | 1: +1.7 / +3.0 |
| 58 | freeze | over-priced | high | +0.6 ± 0.4 | +0.3 | +1.8 | -1.2 | -6.26 | Glacier Yak, Walrus Icebreaker, Rimeheart Colossus, White Dragon | - |
| 59 | guardian | over-priced | high | -0.2 ± 0.5 | -0.1 | +1.0 | -1.2 | -4.71 | Grovebearer Dragon-Turtle, Alpine Marmot, Cypress Root Lurker, Great Gate | 1: -0.2 / +1.0 |
| 60 | prayerWard | over-priced | high | +1.3 ± 0.6 | +0.6 | +2.5 | -1.2 | -3.75 | Chapel Tortoise, Beaver Builder (vanilla), Squire's Mount (vanilla) | 1: +1.3 / +2.5 |
| 61 | keenEye | over-priced | high | +0.3 ± 0.5 | +0.2 | +1.5 | -1.2 | -4.9 | Warren Scout, Fawn Scout, Woodcock Lookout, Owl Sentinel | 1: +0.3 / +1.5 |
| 62 | reflect | under-priced | high | +1.0 ± 0.6 | +0.5 | +0.0 | +1.0 | 3.56 | Mirror Moth, Beaver Builder (vanilla), Squire's Mount (vanilla) | 1: +1.0 / +0.0 |
| 63 | prospector | over-priced | high | +0.2 ± 0.6 | +0.1 | +1.2 | -1.0 | -3.36 | Prospector Mole, Beaver Builder (vanilla), Squire's Mount (vanilla) | 1: +0.2 / +1.2 |
| 64 | changeling | under-priced | high | +1.0 ± 0.5 | +0.5 | +0.1 | +0.9 | 3.13 | Glass Changeling, Hedge Changeling, Puddle Changeling | 1: +1.0 / +0.1 |
| 65 | frenzy | under-priced | high | +0.9 ± 0.6 | +0.4 | +0.1 | +0.8 | 2.59 | Ember Jackal, Beaver Builder (vanilla), Squire's Mount (vanilla) | 1: +0.9 / +0.1 |
| 66 | arrow | under-priced | medium | +7.2 ± 1.6 | +3.6 | +5.8 | +1.4 | 1.65 | Howdah Archers, Otter Guard, Balloon Archer, Battlement Heron | 2: +7.2 / +5.8 |
| 67 | scatterbrained | under-priced | medium | -4.9 ± 1.1 | -2.4 | -6.0 | +1.1 | 1.89 | Pika Hoarder, Beaver Builder (vanilla), Squire's Mount (vanilla) | 1: -4.9 / -6.0 |
| 68 | rupture | under-priced | medium | +0.7 ± 0.5 | +0.3 | +0.0 | +0.7 | 2.49 | Wound Reaver, Beaver Builder (vanilla), Squire's Mount (vanilla) | 1: +0.7 / +0.0 |
| 69 | herbalist | under-priced | medium | +0.6 ± 0.5 | +0.3 | +0.0 | +0.6 | 2.39 | Hedgehog Herbalist, Beaver Builder (vanilla), Squire's Mount (vanilla) | 1: +0.6 / +0.0 |
| 70 | frostbite | under-priced | medium | +0.9 ± 0.5 | +0.5 | +0.5 | +0.4 | 1.93 | Rimeheart Colossus, Frostbitten Wolverine, Mountain Hare, Musk Ox Calf | 1: +0.9 / +0.5 |
| 71 | rampart | over-priced | medium | -0.2 ± 0.4 | -0.1 | +0.2 | -0.4 | -2.16 | Dam-Keeper Beaver, Riverworks Bastion, Moat Snapper | 1: -0.2 / +0.2 |
| 72 | boomerang | within noise | low | +2.6 ± 0.9 | +1.3 | +1.9 | +0.7 | 1.47 | Net Thrower, Otter Centurion, Royal Guard | 1: +2.6 / +1.9 |
| 73 | cower | within noise | low | -0.1 ± 0.8 | -0.0 | -0.5 | +0.4 | 1.07 | Box Turtle, Beaver Builder (vanilla), Squire's Mount (vanilla) | - |
| 74 | scar | within noise | low | +3.6 ± 0.9 | +1.8 | +4.0 | -0.4 | -0.84 | Magma Titan, Beaver Builder (vanilla), Squire's Mount (vanilla) | 2: +3.6 / +4.0 |

