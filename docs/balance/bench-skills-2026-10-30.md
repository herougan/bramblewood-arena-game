# Skill worth vs price (global, 2026-10-30)

Package TOOLS1 (T2). `node tools/bench/bench.js skill --all --games 80` (tools/bench/bench.js skill 1.0.0 (2026-10-28, TOOLS1)); game fingerprint `b791b784613a`. Suggested prices: `docs/balance/bench-skill-prices-2026-10-30.json` (nothing written to canonical/skill-costs.json).

## How it is measured

- Per skill, up to 3 cards that carry it; a skill on fewer than 2 cards also gets vanilla carriers (beaver-builder, squires-mount) given the skill as its card has it. Each carrier plays 80 paired fights (the bench's slot of 6 copies, Level 1, the global field pool, Smart CPU both sides, 30-Health brambles): with the skill, without it at the same stats, and as printed with +1 Attack and with +1 Health.
- **The yardstick** (pooled over 283 carriers): +1 Attack on 6 copies = +9.5 points, +1 Health = +3.0 points (1 Attack = 3.2033 Health measured; the budget says 2). One budget point (2A + H) = **4.17 ± 0.67 win-rate points**.
- **Measured worth** = the skill's paired gain / the yardstick, in budget points; **Attack-eq** = worth / 2. **Price now** = the carrier's cap-1 left side (2A + H) x m + S with the skill minus without it, as printed (`bramblewood-budget.js`). **Net** = worth - price: + under-priced (it gives more than it costs), - over-priced. z = net / its standard error; confidence high |z| >= 2.5, medium >= 1.5.
- Read a low-confidence row as "not measurably mispriced at this many fights", not as "fair". Random decks: a skill that needs partners (a tribe, Lumber makers, a field) reads low.
- The interval and z count the fights' noise on these carriers only, not how typical the carriers are: with 2-3 carriers a skill whose worth depends on the card (its Attack, its Lumber, a partner) can read far from its average. Re-measure a flagged skill with more carriers (`--carriers 4 --games 200`) before changing its price.
- Across all 191 skills: median worth +1.1, median price +2.0, median net -0.3. Price rules that zero a stat (an Archer's Attack) show as a negative price: the skill's row then measures swinging against shooting.

## The 15 most mispriced (medium or high confidence first, by |net|)

| Rank | Skill | Verdict | Confidence | Measured worth (95%) | Attack-eq | Price now | Net | z | Carriers | Per N (worth / price) |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | tsunami | over-priced | high | +6.1 ± 1.9 | +3.0 | +22.5 | -16.4 | -17.4 | Sperm Whale Elder, Fathom Leviathan | 1: +10.3 / +15.0; 2: +1.8 / +30.0 |
| 2 | T:onSpawn>stun | over-priced | high | +0.0 ± 1.3 | +0.0 | +9.4 | -9.4 | -14.02 | Ash Cloud Condor, Granite Ox Golem | 1: +0.0 / +9.4 |
| 3 | bulwark | over-priced | high | +1.0 ± 1.3 | +0.5 | +9.7 | -8.7 | -13.3 | Ancient Sloth Titan, Muskrat Lodgekeeper | 1: +1.8 / +7.2; 2: +0.3 / +12.2 |
| 4 | loneWolf | over-priced | high | +3.9 ± 1.4 | +1.9 | +12.0 | -8.1 | -11.68 | Lone Grey Wolf, Beaver Builder (vanilla), Squire's Mount (vanilla) | 2: +3.9 / +12.0 |
| 5 | sturdy | over-priced | high | +0.3 ± 0.9 | +0.1 | +8.0 | -7.7 | -16.18 | Pangolin Roller, Grovebearer Dragon-Turtle | 1: +0.3 / +8.0 |
| 6 | sweep | over-priced | high | +1.0 ± 0.9 | +0.5 | +7.8 | -6.8 | -14.81 | Gorge Wyrm, Alpha Howler, Boar Rampager | 2: +0.1 / +7.8; 3: +1.5 / +7.8 |
| 7 | quarry | over-priced | high | -3.8 ± 1.4 | -1.9 | +2.5 | -6.3 | -8.91 | Badger Stonemason, Beaver Builder (vanilla), Squire's Mount (vanilla) | 1: -3.8 / +2.5 |
| 8 | acidBolt | under-priced | high | +7.3 ± 1.8 | +3.7 | +1.0 | +6.3 | 6.79 | Archerfish, Beaver Builder (vanilla), Squire's Mount (vanilla) | 1: +7.3 / +1.0 |
| 9 | pack | under-priced | high | +6.0 ± 2.2 | +3.0 | +0.0 | +6.0 | 5.3 | Dhole Runner, Mire Rat | 1: +6.6 / +0.0; 2: +5.4 / +0.0 |
| 10 | bloomCopy | over-priced | high | +0.1 ± 0.7 | +0.1 | +6.1 | -5.9 | -16.81 | Phoenix Mushrooms, Lotus Frog, Pond Algae | - |
| 11 | regen | over-priced | high | +0.2 ± 0.6 | +0.1 | +6.1 | -5.9 | -18.49 | Grovebearer Dragon-Turtle, Alpine Salamander, Bog Behemoth | 1: +0.3 / +2.6; 3: +0.1 / +7.8 |
| 12 | T:onSpawn>addWait | over-priced | high | +0.4 ± 0.6 | +0.2 | +5.9 | -5.5 | -17.33 | Elder Tortoise, Glacier Yak, Rot-Swollen Carcass | 2: +0.4 / +5.9 |
| 13 | immolation | over-priced | high | -1.1 ± 0.9 | -0.5 | +4.0 | -5.1 | -11.27 | Magma Titan, Rimeheart Colossus, Ember Wisp | 1: -1.1 / +4.0 |
| 14 | T:perTurn>spawnCard | over-priced | high | +4.0 ± 1.7 | +2.0 | +9.0 | -5.0 | -5.73 | Ant Hill, Mother Carrier | 1: +4.0 / +9.0 |
| 15 | supreme | over-priced | high | +0.1 ± 0.2 | +0.0 | +5.0 | -4.9 | -48.92 | Black Dragon, Fathom Leviathan, Green Dragon | 1: +0.1 / +5.0 |

## Every skill

| Rank | Skill | Verdict | Confidence | Measured worth (95%) | Attack-eq | Price now | Net | z | Carriers | Per N (worth / price) |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | tsunami | over-priced | high | +6.1 ± 1.9 | +3.0 | +22.5 | -16.4 | -17.4 | Sperm Whale Elder, Fathom Leviathan | 1: +10.3 / +15.0; 2: +1.8 / +30.0 |
| 2 | T:onSpawn>stun | over-priced | high | +0.0 ± 1.3 | +0.0 | +9.4 | -9.4 | -14.02 | Ash Cloud Condor, Granite Ox Golem | 1: +0.0 / +9.4 |
| 3 | bulwark | over-priced | high | +1.0 ± 1.3 | +0.5 | +9.7 | -8.7 | -13.3 | Ancient Sloth Titan, Muskrat Lodgekeeper | 1: +1.8 / +7.2; 2: +0.3 / +12.2 |
| 4 | loneWolf | over-priced | high | +3.9 ± 1.4 | +1.9 | +12.0 | -8.1 | -11.68 | Lone Grey Wolf, Beaver Builder (vanilla), Squire's Mount (vanilla) | 2: +3.9 / +12.0 |
| 5 | sturdy | over-priced | high | +0.3 ± 0.9 | +0.1 | +8.0 | -7.7 | -16.18 | Pangolin Roller, Grovebearer Dragon-Turtle | 1: +0.3 / +8.0 |
| 6 | sweep | over-priced | high | +1.0 ± 0.9 | +0.5 | +7.8 | -6.8 | -14.81 | Gorge Wyrm, Alpha Howler, Boar Rampager | 2: +0.1 / +7.8; 3: +1.5 / +7.8 |
| 7 | quarry | over-priced | high | -3.8 ± 1.4 | -1.9 | +2.5 | -6.3 | -8.91 | Badger Stonemason, Beaver Builder (vanilla), Squire's Mount (vanilla) | 1: -3.8 / +2.5 |
| 8 | acidBolt | under-priced | high | +7.3 ± 1.8 | +3.7 | +1.0 | +6.3 | 6.79 | Archerfish, Beaver Builder (vanilla), Squire's Mount (vanilla) | 1: +7.3 / +1.0 |
| 9 | pack | under-priced | high | +6.0 ± 2.2 | +3.0 | +0.0 | +6.0 | 5.3 | Dhole Runner, Mire Rat | 1: +6.6 / +0.0; 2: +5.4 / +0.0 |
| 10 | bloomCopy | over-priced | high | +0.1 ± 0.7 | +0.1 | +6.1 | -5.9 | -16.81 | Phoenix Mushrooms, Lotus Frog, Pond Algae | - |
| 11 | regen | over-priced | high | +0.2 ± 0.6 | +0.1 | +6.1 | -5.9 | -18.49 | Grovebearer Dragon-Turtle, Alpine Salamander, Bog Behemoth | 1: +0.3 / +2.6; 3: +0.1 / +7.8 |
| 12 | T:onSpawn>addWait | over-priced | high | +0.4 ± 0.6 | +0.2 | +5.9 | -5.5 | -17.33 | Elder Tortoise, Glacier Yak, Rot-Swollen Carcass | 2: +0.4 / +5.9 |
| 13 | immolation | over-priced | high | -1.1 ± 0.9 | -0.5 | +4.0 | -5.1 | -11.27 | Magma Titan, Rimeheart Colossus, Ember Wisp | 1: -1.1 / +4.0 |
| 14 | T:perTurn>spawnCard | over-priced | high | +4.0 ± 1.7 | +2.0 | +9.0 | -5.0 | -5.73 | Ant Hill, Mother Carrier | 1: +4.0 / +9.0 |
| 15 | supreme | over-priced | high | +0.1 ± 0.2 | +0.0 | +5.0 | -4.9 | -48.92 | Black Dragon, Fathom Leviathan, Green Dragon | 1: +0.1 / +5.0 |
| 16 | avalanche | under-priced | high | +8.7 ± 2.2 | +4.3 | +4.0 | +4.7 | 4.14 | Ibex Rockcaller, Beaver Builder (vanilla), Squire's Mount (vanilla) | 1: +8.7 / +4.0 |
| 17 | sacrifice | over-priced | high | -0.1 ± 0.3 | -0.1 | +4.5 | -4.6 | -30.94 | Ash Imp, Cinder Imp | 1: -0.3 / +3.0; 2: +0.0 / +6.0 |
| 18 | T:onDeath>exileSelf | under-priced | high | +4.5 ± 1.7 | +2.2 | -0.1 | +4.6 | 5.34 | Ashbone Ghoul, Bog Revenant, Marsh Wisp | 1: +4.5 / -0.1 |
| 19 | decay | under-priced | high | +5.7 ± 1.8 | +2.8 | +1.1 | +4.6 | 5.11 | Dung Beetle, Beaver Builder (vanilla), Squire's Mount (vanilla) | 1: +5.7 / +1.1 |
| 20 | mountainClimber | over-priced | high | -0.5 ± 1.0 | -0.2 | +4.0 | -4.5 | -8.98 | Snow Leopard, Chamois Leaper, Fumarole Ibex | 1: -0.5 / +4.0 |
| 21 | fletcher | under-priced | high | +4.5 ± 1.6 | +2.2 | +0.0 | +4.5 | 5.4 | Mother Carrier, Eagle-Owl Quartermaster | 1: +4.5 / +0.0 |
| 22 | spitfire | under-priced | high | +5.5 ± 1.7 | +2.7 | +1.0 | +4.5 | 5.32 | Fire Salamander, Beaver Builder (vanilla), Squire's Mount (vanilla) | 1: +5.5 / +1.0 |
| 23 | brood | under-priced | high | +7.4 ± 2.1 | +3.7 | +2.9 | +4.5 | 4.25 | Wolf Spider Mother, Grotto Lobster, Lemming Swarm | 1: +6.3 / +2.2; 2: +9.6 / +4.4 |
| 24 | healing | over-priced | high | +0.9 ± 1.0 | +0.4 | +5.3 | -4.4 | -8.92 | Abbey Goose, Newt Doctor, Nectar Vintner | 1: +1.3 / +4.0; 2: +0.0 / +8.0 |
| 25 | evolute | over-priced | high | -1.2 ± 1.1 | -0.6 | +3.0 | -4.2 | -7.68 | Gale Sprite, Canopy Sloth Guardian, Raven Harbinger | 1: -1.2 / +3.0 |
| 26 | onReadyGold | over-priced | high | +2.0 ± 1.0 | +1.0 | +6.2 | -4.2 | -8.35 | Lodge Engineer, Chipmunk Hoarder, Elder Willow | 1: +2.0 / +6.2 |
| 27 | T:onAttacked>spawnCard | over-priced | high | +3.4 ± 1.3 | +1.7 | +7.6 | -4.2 | -6.11 | Colony, Scraper of Skies, Bee Drone | 1: +3.4 / +7.6 |
| 28 | quick | over-priced | high | +0.8 ± 1.8 | +0.4 | +5.0 | -4.2 | -4.52 | Caiman Hatchling, Chipmunk Cavalry, Tomcat | 1: +0.8 / +5.0 |
| 29 | T:perTurn>forgeWeapon | over-priced | high | +0.0 ± 0.5 | +0.0 | +4.2 | -4.2 | -17.06 | Anvilwhisker Otter, Beaver Builder (vanilla), Squire's Mount (vanilla) | 1: +0.0 / +4.2 |
| 30 | inspiring | over-priced | high | +1.7 ± 0.9 | +0.8 | +5.8 | -4.1 | -8.54 | Goliath Broodmother, Marshal Tuskwell, Otter Flag Bearer | 1: +3.9 / +3.5; 2: +0.6 / +7.0 |
| 31 | pounce | over-priced | high | +0.7 ± 1.1 | +0.3 | +4.8 | -4.1 | -7.14 | Gilded Roadwarden, Chamois Leaper, Fumarole Ibex | 2: +0.9 / +3.6; 6: +0.3 / +7.2 |
| 32 | rage | over-priced | high | +1.0 ± 0.8 | +0.5 | +5.0 | -4.0 | -9.55 | Berserker Boar, Honey Badger Fury, Ant Warrior | 1: +1.0 / +5.0 |
| 33 | undead | over-priced | high | +0.3 ± 1.0 | +0.1 | +4.3 | -4.0 | -7.97 | Cinder Skeleton, Phoenix Mushrooms, Grass Snake | 1: +0.3 / +4.3 |
| 34 | dry | over-priced | high | +0.1 ± 0.8 | +0.0 | +4.0 | -3.9 | -9.42 | Dromedary, Static Fennec, Fennec Fox | 1: +0.1 / +4.0 |
| 35 | venomous | over-priced | high | +1.3 ± 1.2 | +0.6 | +5.2 | -3.9 | -6.09 | Platypus Spur, Water Shrew, Banded Sea Krait | 1: +1.5 / +3.1; 2: +1.2 / +6.2 |
| 36 | expose | over-priced | high | +0.4 ± 1.0 | +0.2 | +4.2 | -3.8 | -7.52 | Narwhal Lancer, Snow Owl Sentinel | 2: +0.4 / +4.2 |
| 37 | strangle | under-priced | high | +4.9 ± 1.9 | +2.5 | +1.2 | +3.7 | 3.91 | Anaconda Coil, Birdlime Dauber | 1: +5.4 / +0.8; 2: +4.5 / +1.6 |
| 38 | arrow | under-priced | high | +7.6 ± 2.3 | +3.8 | +4.0 | +3.6 | 3.1 | Battlement Heron, Gatling Hog, Eagle-Owl Quartermaster | 1: +7.1 / +3.0; 2: +8.7 / +6.0 |
| 39 | twinShot | over-priced | high | +5.6 ± 1.6 | +2.8 | +9.0 | -3.4 | -4.15 | Spitting Cobra, Beaver Builder (vanilla), Squire's Mount (vanilla) | 1: +5.6 / +9.0 |
| 40 | scare | over-priced | high | +0.8 ± 0.9 | +0.4 | +4.2 | -3.4 | -7.21 | Yeti, Amber Cicada, Lurking Dread | 1: +1.2 / +2.5; 2: +0.6 / +5.0 |
| 41 | darksight | over-priced | high | -0.3 ± 0.7 | -0.1 | +3.0 | -3.3 | -9.13 | Black Dragon, Meerkat Burrower, Cave Bat Swarm | 1: -0.3 / +3.0 |
| 42 | fastForward | over-priced | high | +2.4 ± 1.1 | +1.2 | +5.6 | -3.2 | -5.76 | Swift Fox, Beaver Builder (vanilla), Squire's Mount (vanilla) | 1: +2.4 / +5.6 |
| 43 | kinRally | over-priced | high | +3.4 ± 1.3 | +1.7 | +6.5 | -3.1 | -4.64 | Rivergate Drummer, Beaver Builder (vanilla), Squire's Mount (vanilla) | 1: +3.4 / +6.5 |
| 44 | speed | over-priced | high | +0.8 ± 0.9 | +0.4 | +3.9 | -3.1 | -6.36 | Pronghorn Racer, Beaver Builder (vanilla), Squire's Mount (vanilla) | 2: +0.8 / +3.9 |
| 45 | daunt | over-priced | high | +0.3 ± 0.6 | +0.1 | +3.3 | -3.0 | -10.09 | Booming Bittern, Cave Warlord, Eyrie Warden | 1: +0.4 / +2.5; 2: +0.0 / +5.0 |
| 46 | T:onSpawn>drawCard | over-priced | high | +2.7 ± 1.4 | +1.4 | +5.7 | -3.0 | -4.19 | Courier Pigeon, Daily Post, Snail Mail | 1: +1.6 / +4.3; 2: +5.1 / +8.6 |
| 47 | rocket | under-priced | high | +6.0 ± 1.8 | +3.0 | +3.0 | +3.0 | 3.25 | Bombardier Beetle, Beaver Builder (vanilla), Squire's Mount (vanilla) | 4: +6.0 / +3.0 |
| 48 | fork | over-priced | high | +1.0 ± 0.7 | +0.5 | +4.0 | -3.0 | -7.97 | Kraken Spawnling, Colossal Squid, Alpine Avalanche | 1: +1.0 / +4.0 |
| 49 | taunt | over-priced | high | +0.0 ± 1.6 | +0.0 | +3.0 | -3.0 | -3.55 | Goose Sentry, Swordbill Challenger, Sheep | 1: +0.0 / +3.0 |
| 50 | onDeathSpawn | over-priced | high | +0.1 ± 0.4 | +0.0 | +3.0 | -2.9 | -12.92 | Rot-Swollen Carcass, Fungal Colossus, Goliath Broodmother | - |
| 51 | ambush | over-priced | high | +1.2 ± 1.3 | +0.6 | +4.0 | -2.8 | -4.25 | Polar Bear, Subterraneaner, Tunnel Ant | 1: +0.9 / +2.0; 2: +1.2 / +4.0; 4: +1.5 / +6.0 |
| 52 | remember | under-priced | high | +4.4 ± 1.7 | +2.2 | +1.7 | +2.7 | 3.24 | Ashbone Ghoul, Bog Revenant, Marsh Wisp | 1: +6.9 / +1.0; 2: +4.8 / +2.0; 3: +1.5 / +2.0 |
| 53 | gash | over-priced | high | +0.5 ± 0.4 | +0.2 | +3.2 | -2.7 | -12.21 | Komodo Warlord, Kraken Spawnling, Colossal Squid | 3: +0.5 / +3.2 |
| 54 | lumberjack | over-priced | high | +2.4 ± 1.2 | +1.2 | +5.0 | -2.6 | -4.18 | Badger Lumberjack, Beaver Builder (vanilla), Squire's Mount (vanilla) | 1: +2.4 / +5.0 |
| 55 | foeScarcity | under-priced | high | +4.1 ± 1.4 | +2.0 | +1.5 | +2.6 | 3.64 | Stoat Cutthroat, Beaver Builder (vanilla), Squire's Mount (vanilla) | 1: +4.1 / +1.5 |
| 56 | fog | over-priced | high | +0.2 ± 0.5 | +0.1 | +2.7 | -2.5 | -10.18 | Ent, Beaver Builder (vanilla), Squire's Mount (vanilla) | 1: +0.2 / +2.7 |
| 57 | swarm | under-priced | high | +5.0 ± 1.6 | +2.5 | +2.5 | +2.5 | 3.13 | Ant Warrior, Hedge Changeling, Lemming Swarm | 1: +5.0 / +2.5 |
| 58 | milling | under-priced | high | +5.4 ± 1.7 | +2.7 | +3.0 | +2.4 | 2.76 | Redwood Woodpecker, Beaver Builder (vanilla), Squire's Mount (vanilla) | 1: +5.4 / +3.0 |
| 59 | hunter | over-priced | high | +0.7 ± 1.6 | +0.4 | +3.0 | -2.3 | -2.69 | Fen Mink, Tidepool Trapper Crab | 1: +0.3 / +2.0; 2: +1.2 / +4.0 |
| 60 | corrode | over-priced | high | -0.1 ± 0.3 | -0.1 | +2.0 | -2.1 | -14.31 | Glass Octopus, Black Dragon | 2: -0.3 / +2.0; 3: +0.0 / +2.0 |
| 61 | drunk | under-priced | high | -0.9 ± 1.2 | -0.4 | -3.0 | +2.1 | 3.46 | Marula Elephant, Beaver Builder (vanilla), Squire's Mount (vanilla) | 1: -0.9 / -3.0 |
| 62 | kinship | under-priced | high | +5.1 ± 1.6 | +2.5 | +3.0 | +2.1 | 2.58 | Honeyjoe Brewer, Rivergate Tribune | - |
| 63 | shell | over-priced | high | +2.0 ± 1.2 | +1.0 | +4.0 | -2.0 | -3.25 | Conch Crawler, Malachite Golem, Shellwright Apprentice | 1: +3.3 / +2.0; 2: +2.7 / +4.0; 4: +0.0 / +6.0 |
| 64 | relic | over-priced | high | +0.1 ± 1.0 | +0.0 | +2.0 | -1.9 | -3.78 | Friar Badger, Shrine Bell-Ringer, Shrine High Priest | 1: +0.1 / +2.0 |
| 65 | midas | over-priced | high | +0.1 ± 0.3 | +0.1 | +2.0 | -1.9 | -12.31 | The Magnate Duck, Golden Magpie | 2: +0.3 / +2.0; 3: +0.0 / +2.0 |
| 66 | greaterPoison | over-priced | high | +0.7 ± 0.8 | +0.4 | +2.5 | -1.8 | -4.44 | Cane Toad, Inland Taipan | 1: +0.7 / +2.5 |
| 67 | stunOnHit | over-priced | high | +1.3 ± 1.1 | +0.6 | +3.0 | -1.7 | -3 | Cinder Hornet, Beaver Builder (vanilla), Squire's Mount (vanilla) | 1: +1.3 / +3.0 |
| 68 | breach | over-priced | high | +1.2 ± 0.8 | +0.6 | +2.9 | -1.7 | -3.97 | Badger Sapper, Beetle Battering-Ram | 1: +0.3 / +1.9; 2: +2.1 / +3.8 |
| 69 | bleed | over-priced | high | +2.6 ± 1.2 | +1.3 | +4.2 | -1.6 | -2.56 | Alley Cat, Whip Spider, Wound Reaver | 1: +0.6 / +3.6; 2: +6.6 / +5.5 |
| 70 | fester | over-priced | high | +1.2 ± 0.9 | +0.6 | +2.8 | -1.6 | -3.47 | Gangrenous Leech, Beaver Builder (vanilla), Squire's Mount (vanilla) | 1: +1.2 / +2.8 |
| 71 | chrysalis | over-priced | high | +0.0 ± 0.5 | +0.0 | +1.6 | -1.6 | -6.5 | Cocoon, Beaver Builder (vanilla), Squire's Mount (vanilla) | 1: +0.0 / +1.6 |
| 72 | pierce | over-priced | high | +0.1 ± 0.7 | +0.0 | +1.7 | -1.6 | -4.33 | Anvil Thrush, Ember Revenant, Mallard Halberdier | 1: +0.6 / +1.0; 2: -0.1 / +2.0 |
| 73 | siege | over-priced | high | +0.5 ± 0.5 | +0.2 | +2.0 | -1.5 | -5.71 | Badger Sapper, Trebuchet Crew, Beetle Battering-Ram | 2: +0.3 / +2.0; 3: +0.9 / +2.0 |
| 74 | keenEye | over-priced | high | +0.1 ± 0.9 | +0.1 | +1.5 | -1.4 | -2.79 | Fawn Scout, Woodcock Lookout, Warren Scout | 1: +0.1 / +1.5 |
| 75 | T:onAllyPlayed>reduceWaitOfSpawned | over-priced | high | +0.7 ± 1.0 | +0.3 | +2.0 | -1.3 | -2.61 | Nest, Beaver Builder (vanilla), Squire's Mount (vanilla) | 1: +0.7 / +2.0 |
| 76 | tide | over-priced | high | +0.2 ± 0.8 | +0.1 | +1.5 | -1.3 | -3.24 | Abyss Lantern Squid, Elder Tortoise, Fiddler Crab Swarm | 1: +0.2 / +1.5 |
| 77 | prospector | over-priced | high | -0.1 ± 0.7 | -0.0 | +1.2 | -1.3 | -3.9 | Prospector Mole, Beaver Builder (vanilla), Squire's Mount (vanilla) | 1: -0.1 / +1.2 |
| 78 | reflect | under-priced | high | +1.3 ± 0.9 | +0.6 | +0.0 | +1.3 | 2.89 | Mirror Moth, Beaver Builder (vanilla), Squire's Mount (vanilla) | 1: +1.3 / +0.0 |
| 79 | freeze | over-priced | high | +0.6 ± 0.8 | +0.3 | +1.8 | -1.2 | -2.83 | Glacier Yak, Walrus Icebreaker, Rimeheart Colossus | - |
| 80 | heat | over-priced | high | +0.0 ± 0.9 | +0.0 | +1.2 | -1.2 | -2.55 | Cinder Stoker, Beaver Builder (vanilla), Squire's Mount (vanilla) | 1: +0.0 / +1.2 |
| 81 | keenSense | over-priced | high | +0.5 ± 0.8 | +0.2 | +1.6 | -1.1 | -2.74 | Quarry Mole, Beaver Builder (vanilla), Squire's Mount (vanilla) | 1: +0.5 / +1.6 |
| 82 | guardian | over-priced | high | +0.0 ± 0.7 | +0.0 | +1.0 | -1.0 | -2.87 | Badger Trench Digger, Canopy Sloth Guardian, Grovebearer Dragon-Turtle | 1: +0.0 / +1.0 |
| 83 | rampart | over-priced | high | -0.5 ± 0.5 | -0.3 | +0.2 | -0.8 | -3.11 | Dam-Keeper Beaver, Riverworks Bastion, Moat Snapper | 1: -0.5 / +0.2 |
| 84 | iceArrow | under-priced | medium | +6.4 ± 2.2 | +3.2 | +3.8 | +2.7 | 2.35 | Snow Bunting Archer, Rimefire Salamander | 1: +6.6 / +2.5; 2: +6.3 / +5.0 |
| 85 | berserk | under-priced | medium | +6.1 ± 1.7 | +3.0 | +4.0 | +2.1 | 2.41 | Tasmanian Devil, Beaver Builder (vanilla), Squire's Mount (vanilla) | 2: +6.1 / +4.0 |
| 86 | charge | under-priced | medium | +5.0 ± 1.7 | +2.5 | +3.0 | +2.0 | 2.4 | Electric Ray, Beaver Builder (vanilla), Squire's Mount (vanilla) | - |
| 87 | volley | under-priced | medium | +6.5 ± 2.1 | +3.3 | +4.5 | +2.0 | 1.86 | Echidna Quillshot, Trebuchet Crew | 1: +7.5 / +3.0; 2: +5.5 / +6.0 |
| 88 | swipe | under-priced | medium | +4.9 ± 2.0 | +2.4 | +3.0 | +1.9 | 1.81 | Tax-Collector Teal, Jay Pilferer | 1: +4.9 / +3.0 |
| 89 | evasive | over-priced | medium | +2.8 ± 1.5 | +1.4 | +4.7 | -1.8 | -2.35 | Cunning Vixen, Mountain Hare, Snow Ermine | 1: +2.8 / +4.7 |
| 90 | stockpile | under-priced | medium | +3.1 ± 1.8 | +1.6 | +1.4 | +1.8 | 1.92 | Beaver Lumberjack, Muskrat Reedgatherer | 1: +1.5 / +0.9; 2: +4.8 / +1.8 |
| 91 | T:onAttack>heal | under-priced | medium | +2.0 ± 1.4 | +1.0 | +0.3 | +1.8 | 2.47 | Forager Ant, Bee Forager | 1: +2.0 / +0.3 |
| 92 | flying | over-priced | medium | +2.9 ± 1.4 | +1.4 | +4.5 | -1.6 | -2.18 | Anvil Thrush, Arctic Tern, Ash Cloud Condor | 1: +2.9 / +4.5 |
| 93 | stealth | over-priced | medium | +0.4 ± 1.7 | +0.2 | +2.0 | -1.6 | -1.8 | Glass Octopus, Subterraneaner, Moray Ambusher | 1: +0.4 / +2.0 |
| 94 | T:onReady>gain | under-priced | medium | +3.1 ± 1.4 | +1.5 | +1.5 | +1.6 | 2.22 | Ore-Smelter Mole, Driftwood Crab, Dune Packrat | 1: +1.2 / +0.9; 3: +6.9 / +2.7 |
| 95 | iceBolt | under-priced | medium | +7.6 ± 1.8 | +3.8 | +6.0 | +1.6 | 1.7 | Ice Petrel, Beaver Builder (vanilla), Squire's Mount (vanilla) | 2: +7.6 / +6.0 |
| 96 | meiosis | under-priced | medium | +2.5 ± 1.4 | +1.3 | +1.0 | +1.5 | 2.23 | Planarian Splitter, Phoenix Mushrooms | 1: +2.5 / +1.0 |
| 97 | thorns | under-priced | medium | +3.2 ± 1.4 | +1.6 | +1.7 | +1.5 | 2.11 | Fulmar Spitter, Baby Horned Capybara, Hedgehog Scout | 1: +4.8 / +1.3; 2: +0.0 / +2.5 |
| 98 | sonar | over-priced | medium | +0.5 ± 1.2 | +0.2 | +2.0 | -1.5 | -2.46 | Oilbird, Cave Swiftlet, Whip Spider | 1: +0.5 / +2.0 |
| 99 | scavenge | under-priced | medium | +3.0 ± 1.5 | +1.5 | +1.5 | +1.5 | 2.02 | Carrion Crow, Beaver Builder (vanilla), Squire's Mount (vanilla) | 1: +3.0 / +1.5 |
| 100 | counterattack | over-priced | medium | +0.4 ± 1.2 | +0.2 | +1.9 | -1.5 | -2.34 | Thornwood Palisade, Swordbill Challenger | 1: +0.4 / +1.9 |
| 101 | scatterbrained | under-priced | medium | -4.6 ± 1.5 | -2.3 | -6.0 | +1.4 | 1.85 | Pika Hoarder, Beaver Builder (vanilla), Squire's Mount (vanilla) | 1: -4.6 / -6.0 |
| 102 | bulldoze | over-priced | medium | +2.6 ± 1.1 | +1.3 | +4.0 | -1.4 | -2.4 | Bison Bulldozer, Beaver Builder (vanilla), Squire's Mount (vanilla) | 1: +2.6 / +4.0 |
| 103 | boomerang | under-priced | medium | +3.3 ± 1.3 | +1.6 | +1.9 | +1.4 | 2.08 | Net Thrower, Otter Centurion, Royal Guard | 1: +3.3 / +1.9 |
| 104 | T:onAttack>drawCard | over-priced | medium | +4.2 ± 1.5 | +2.1 | +5.5 | -1.3 | -1.8 | Worker Ant, Beaver Builder (vanilla), Squire's Mount (vanilla) | 1: +4.2 / +5.5 |
| 105 | T:onSpawn>gain | under-priced | medium | +2.9 ± 1.4 | +1.5 | +1.8 | +1.2 | 1.72 | Cone-cutter Squirrel, Pumice Beetle, Gannet Nestweaver | 1: +3.1 / +1.1; 2: +2.8 / +2.1 |
| 106 | diurnal | under-priced | medium | +1.8 ± 1.1 | +0.9 | +0.7 | +1.1 | 1.99 | Sunbittern Strider, Toucan Courier, Arctic Tern | 1: +1.8 / +0.7 |
| 107 | nightblind | under-priced | medium | -1.9 ± 1.3 | -0.9 | -3.0 | +1.1 | 1.6 | Hoopoe Herald, Beaver Builder (vanilla), Squire's Mount (vanilla) | 1: -1.9 / -3.0 |
| 108 | prayerWard | over-priced | medium | +1.4 ± 1.0 | +0.7 | +2.5 | -1.1 | -2.2 | Chapel Tortoise, Beaver Builder (vanilla), Squire's Mount (vanilla) | 1: +1.4 / +2.5 |
| 109 | shock | over-priced | medium | -0.1 ± 1.2 | -0.1 | +0.9 | -1.1 | -1.77 | Abyss Lantern Squid, Voltaic Eel | - |
| 110 | beset | under-priced | medium | +2.9 ± 1.4 | +1.4 | +1.8 | +1.1 | 1.58 | Ravenous Wolverine, Beaver Builder (vanilla), Squire's Mount (vanilla) | 6: +2.9 / +1.8 |
| 111 | storm | over-priced | medium | +0.8 ± 1.2 | +0.4 | +1.8 | -1.0 | -1.67 | Gale Swift, Static Fennec, Fulmar Spitter | 1: +0.8 / +1.8 |
| 112 | cower | under-priced | medium | +0.5 ± 1.2 | +0.2 | -0.5 | +1.0 | 1.64 | Box Turtle, Beaver Builder (vanilla), Squire's Mount (vanilla) | - |
| 113 | scar | over-priced | medium | +3.1 ± 1.2 | +1.5 | +4.0 | -0.9 | -1.52 | Magma Titan, Beaver Builder (vanilla), Squire's Mount (vanilla) | 2: +3.1 / +4.0 |
| 114 | changeling | under-priced | medium | +1.0 ± 1.0 | +0.5 | +0.1 | +0.9 | 1.85 | Glass Changeling, Hedge Changeling, Puddle Changeling | 1: +1.0 / +0.1 |
| 115 | frostbite | under-priced | medium | +1.2 ± 0.8 | +0.6 | +0.5 | +0.7 | 1.79 | Rimeheart Colossus, Frostbitten Wolverine, Mountain Hare | 1: +1.2 / +0.5 |
| 116 | slow | under-priced | medium | -0.3 ± 0.8 | -0.1 | -0.9 | +0.6 | 1.61 | Ancient Sloth Titan, Garden Snail, Old-Growth Tortoise | 1: -0.3 / -0.9 |
| 117 | rupture | under-priced | medium | +0.6 ± 0.7 | +0.3 | +0.0 | +0.6 | 1.74 | Wound Reaver, Beaver Builder (vanilla), Squire's Mount (vanilla) | 1: +0.6 / +0.0 |
| 118 | frenzy | under-priced | medium | +0.7 ± 0.8 | +0.3 | +0.1 | +0.6 | 1.55 | Ember Jackal, Beaver Builder (vanilla), Squire's Mount (vanilla) | 1: +0.7 / +0.1 |
| 119 | frost | over-priced | medium | +0.6 ± 0.6 | +0.3 | +1.1 | -0.5 | -1.66 | Snow Ermine, Beaver Builder (vanilla), Squire's Mount (vanilla) | 1: +0.6 / +1.1 |
| 120 | herbalist | under-priced | medium | +0.5 ± 0.6 | +0.2 | +0.0 | +0.5 | 1.67 | Hedgehog Herbalist, Beaver Builder (vanilla), Squire's Mount (vanilla) | 1: +0.5 / +0.0 |
| 121 | octolash | within noise | low | +7.9 ± 2.0 | +3.9 | +6.5 | +1.4 | 1.39 | Blue-ringed Octopus, Beaver Builder (vanilla), Squire's Mount (vanilla) | 1: +7.9 / +6.5 |
| 122 | perforate | within noise | low | +5.9 ± 1.8 | +2.9 | +7.2 | -1.3 | -1.44 | Woodpecker Sapper, Beaver Builder (vanilla), Squire's Mount (vanilla) | 2: +5.9 / +7.2 |
| 123 | parasite | within noise | low | +0.0 ± 2.4 | +0.0 | +1.0 | -1.0 | -0.83 | Gangrenous Leech, Clinging Leech | 1: +0.0 / +1.0 |
| 124 | trident | within noise | low | +5.0 ± 1.7 | +2.5 | +4.0 | +1.0 | 1.16 | Swordfish Spearman, Beaver Builder (vanilla), Squire's Mount (vanilla) | 1: +5.0 / +4.0 |
| 125 | invisible | within noise | low | +1.8 ± 1.5 | +0.9 | +2.7 | -0.9 | -1.21 | Booming Bittern, Leaf Chameleon, Sandfish | 2: +1.8 / +2.7 |
| 126 | twinStrike | within noise | low | +4.0 ± 1.7 | +2.0 | +3.2 | +0.9 | 1.02 | Alley Cat, Gatling Hog | 1: +4.0 / +3.2 |
| 127 | tangle | within noise | low | +2.2 ± 1.5 | +1.1 | +1.4 | +0.8 | 1.11 | Weaver Bird, Quicksand Queen | 1: +2.2 / +1.4 |
| 128 | shield | within noise | low | +3.5 ± 1.4 | +1.7 | +2.7 | +0.8 | 1.2 | Armadillo Guard, Conch Crawler, Tide Pool Crab | 3: +1.8 / +2.4; 4: +6.9 / +3.2 |
| 129 | poison | within noise | low | +2.2 ± 1.2 | +1.1 | +3.0 | -0.8 | -1.31 | Bogfire Newt, Cane Toad, Gallery Orb-Weaver | 1: +2.2 / +3.0 |
| 130 | sap | within noise | low | +1.8 ± 1.6 | +0.9 | +1.0 | +0.8 | 0.95 | Bog Shrew, Vampire Bat | 1: +1.8 / +1.0 |
| 131 | backstab | within noise | low | +2.2 ± 1.2 | +1.1 | +1.4 | +0.8 | 1.27 | Stoat Cutthroat, Wrong-Way Salmon, Cunning Vixen | 2: +1.8 / +1.2; 3: +3.0 / +1.8 |
| 132 | dive | within noise | low | +2.5 ± 1.9 | +1.3 | +1.8 | +0.8 | 0.82 | Harbor Seal, Puffin Diver | 2: +2.5 / +1.8 |
| 133 | tornado | within noise | low | +1.8 ± 1.4 | +0.9 | +2.5 | -0.7 | -0.95 | Dust-devil Kestrel, Beaver Builder (vanilla), Squire's Mount (vanilla) | 1: +1.8 / +2.5 |
| 134 | converge | within noise | low | +0.7 ± 1.0 | +0.3 | +0.0 | +0.7 | 1.4 | Border Collie, Beaver Builder (vanilla), Squire's Mount (vanilla) | - |
| 135 | reach | within noise | low | +1.2 ± 1.0 | +0.6 | +0.5 | +0.7 | 1.39 | Birdlime Dauber, Mist-net Otter, Riverstone Slinger | 1: +1.2 / +0.5 |
| 136 | T:onSpawn>magnet | within noise | low | +1.1 ± 0.9 | +0.5 | +0.4 | +0.7 | 1.39 | Clap-net Trapper, Beaver Builder (vanilla), Squire's Mount (vanilla) | 1: +1.1 / +0.4 |
| 137 | purblind | within noise | low | -5.6 ± 1.7 | -2.8 | -5.0 | -0.6 | -0.76 | Star-nosed Mole, Beaver Builder (vanilla), Squire's Mount (vanilla) | 1: -5.6 / -5.0 |
| 138 | hoard | within noise | low | +1.3 ± 1.0 | +0.7 | +0.8 | +0.6 | 1.12 | The Magnate Duck, Tax-Collector Teal | 1: +2.7 / +0.5; 3: +0.0 / +1.0 |
| 139 | vanguard | within noise | low | +1.8 ± 1.1 | +0.9 | +1.2 | +0.6 | 1.05 | Marshal Tuskwell, Beaver Builder (vanilla), Squire's Mount (vanilla) | 1: +1.8 / +1.2 |
| 140 | T:onDeath>damage | within noise | low | +1.2 ± 0.9 | +0.6 | +0.6 | +0.6 | 1.27 | Sulfur Cinder Moth, Beaver Builder (vanilla), Squire's Mount (vanilla) | 2: +1.2 / +0.6 |
| 141 | crabClaws | within noise | low | +0.6 ± 1.5 | +0.3 | +0.1 | +0.5 | 0.74 | Grotto Lobster, Tidepool Trapper Crab, Fiddler Crab Swarm | 1: +0.6 / +0.1 |
| 142 | trap | within noise | low | +3.0 ± 1.6 | +1.5 | +2.5 | +0.5 | 0.69 | Quicksand Queen, Antlion Pit | 5: +3.9 / +2.1; 6: +2.1 / +2.8 |
| 143 | cure | within noise | low | +0.3 ± 0.8 | +0.1 | +0.8 | -0.5 | -1.29 | Phoenix Fledgling, Cleaner Wrasse, Marsh-mallow Hare | 1: +0.0 / +0.5; 2: +0.4 / +1.0 |
| 144 | fireArrow | within noise | low | +4.1 ± 1.5 | +2.1 | +4.7 | -0.5 | -0.7 | Rimefire Salamander, Fire Drake Hatchling, Magma Salamander | 1: +5.0 / +3.5; 2: +2.4 / +7.0 |
| 145 | nocturnal | within noise | low | +0.9 ± 1.0 | +0.4 | +1.4 | -0.5 | -0.89 | Banded Sea Krait, Beetle Battering-Ram, Echo Screecher | 1: +0.9 / +1.4 |
| 146 | muster | within noise | low | +3.4 ± 1.3 | +1.7 | +2.9 | +0.5 | 0.68 | Wolf Pack Runner, Beaver Builder (vanilla), Squire's Mount (vanilla) | 6: +3.4 / +2.9 |
| 147 | predator | within noise | low | +1.1 ± 1.1 | +0.6 | +0.7 | +0.4 | 0.84 | Hedge Weasel, Leopard Seal, Marsh Harrier | 1: +1.1 / +0.7 |
| 148 | T:onReady>damage | within noise | low | +0.8 ± 1.1 | +0.4 | +1.3 | -0.4 | -0.77 | Pelican Diver, Stormcaller | 2: +1.6 / +0.7; 5: +0.0 / +1.8 |
| 149 | confuse | within noise | low | +2.6 ± 1.2 | +1.3 | +3.0 | -0.4 | -0.64 | Lyrebird Mimic, Beaver Builder (vanilla), Squire's Mount (vanilla) | - |
| 150 | T:onKill>gain | within noise | low | +1.0 ± 1.1 | +0.5 | +1.4 | -0.4 | -0.71 | Dust Hyena, Gull Thief, Ferry Toll-Frog | 1: +1.0 / +1.4 |
| 151 | onSpawnDevilry | within noise | low | +0.4 ± 0.6 | +0.2 | +0.0 | +0.4 | 1.41 | Ash Imp, Beaver Builder (vanilla), Squire's Mount (vanilla) | 1: +0.4 / +0.0 |
| 152 | executioner | within noise | low | +0.6 ± 0.7 | +0.3 | +0.2 | +0.4 | 1.07 | Grave-Grin Hyena, Beaver Builder (vanilla), Squire's Mount (vanilla) | 2: +0.6 / +0.2 |
| 153 | bounty | within noise | low | +2.9 ± 1.4 | +1.4 | +2.5 | +0.4 | 0.55 | The Magnate Duck, Chipmunk Stockpiler, Pack Mule | 1: +2.9 / +2.5 |
| 154 | requiem | within noise | low | +2.8 ± 1.2 | +1.4 | +3.2 | -0.4 | -0.63 | Cinder Skeleton, Beaver Builder (vanilla), Squire's Mount (vanilla) | 5: +2.8 / +3.2 |
| 155 | T:onAttack>buff | within noise | low | +3.9 ± 1.8 | +1.9 | +4.3 | -0.4 | -0.39 | Ravenous Wolverine, Rockslide Ram | 1: +3.6 / +2.8; 2: +4.2 / +5.7 |
| 156 | web | within noise | low | +0.0 ± 1.0 | +0.0 | +0.3 | -0.3 | -0.65 | Gallery Orb-Weaver, Mist-net Otter | 1: +0.0 / +0.3 |
| 157 | mighty | within noise | low | +4.7 ± 1.5 | +2.3 | +5.0 | -0.3 | -0.41 | Hercules Beetle, Beaver Builder (vanilla), Squire's Mount (vanilla) | 1: +4.7 / +5.0 |
| 158 | wave | within noise | low | +1.7 ± 1.0 | +0.8 | +2.0 | -0.3 | -0.58 | Fathom Leviathan, Selkie Wavebinder, Moray Ambusher | 1: +5.1 / +2.0; alternate: +0.0 / +2.0; right: +0.0 / +2.0 |
| 159 | onReadyDamage | within noise | low | +0.9 ± 0.8 | +0.4 | +1.2 | -0.3 | -0.74 | Cave Warlord, Eyrie Warden, Echo Screecher | - |
| 160 | drought | within noise | low | +0.7 ± 0.7 | +0.3 | +1.0 | -0.3 | -0.84 | Dromedary, Beaver Builder (vanilla), Squire's Mount (vanilla) | 1: +0.7 / +1.0 |
| 161 | lastStand | within noise | low | +0.3 ± 0.6 | +0.1 | +0.6 | -0.3 | -1 | Badger Trench Digger, Beaver Builder (vanilla), Squire's Mount (vanilla) | 1: +0.3 / +0.6 |
| 162 | heavyMetal | within noise | low | +0.3 ± 0.7 | +0.1 | +0.0 | +0.3 | 0.9 | Ore-Smelter Mole, Beaver Builder (vanilla), Squire's Mount (vanilla) | 1: +0.3 / +0.0 |
| 163 | packLeader | within noise | low | -0.3 ± 1.0 | -0.1 | +0.0 | -0.3 | -0.57 | Dhole Matriarch, Beaver Builder (vanilla), Squire's Mount (vanilla) | 1: -0.3 / +0.0 |
| 164 | prey | within noise | low | +0.3 ± 0.7 | +0.1 | +0.0 | +0.3 | 0.9 | Springbok Pronker, Beaver Builder (vanilla), Squire's Mount (vanilla) | 1: +0.3 / +0.0 |
| 165 | crepuscular | within noise | low | +2.8 ± 1.8 | +1.4 | +2.5 | +0.3 | 0.33 | Nightjar Drifter, Woodcock Lookout | 1: +2.8 / +2.5 |
| 166 | hibernate | within noise | low | +0.0 ± 0.6 | +0.0 | -0.3 | +0.3 | 0.92 | Polar Bear, Beaver Builder (vanilla), Squire's Mount (vanilla) | 1: +0.0 / -0.3 |
| 167 | esprit | within noise | low | +2.9 ± 1.3 | +1.4 | +3.2 | -0.3 | -0.4 | Riverwing Envoy, Sunspire Envoy, Sunspire Sky-Sovereign | 1: +3.1 / +2.6; 2: +2.4 / +4.2 |
| 168 | explode | within noise | low | +3.7 ± 1.8 | +1.9 | +4.0 | -0.3 | -0.27 | Marsh Gas Toad, Pinecone Sapper | - |
| 169 | coffee | within noise | low | +1.3 ± 1.3 | +0.7 | +1.1 | +0.2 | 0.33 | Buzzed Chipmunk, Honeyjoe Brewer | 1: +1.8 / +1.5; 2: +0.9 / +0.8 |
| 170 | haste | within noise | low | +2.8 ± 1.2 | +1.4 | +3.0 | -0.2 | -0.32 | Roadrunner Courier, Beaver Builder (vanilla), Squire's Mount (vanilla) | 1: +2.8 / +3.0 |
| 171 | carrion | within noise | low | +2.4 ± 1.1 | +1.2 | +2.6 | -0.2 | -0.36 | Guano Beetle, Ossuary Lammergeier, Greenland Shark | 2: +2.4 / +2.6 |
| 172 | wakeful | within noise | low | +0.3 ± 0.6 | +0.1 | +0.5 | -0.2 | -0.67 | Sleepless Shrew, Beaver Builder (vanilla), Squire's Mount (vanilla) | 1: +0.3 / +0.5 |
| 173 | bedrock | within noise | low | +0.1 ± 0.7 | +0.0 | +0.3 | -0.2 | -0.6 | Quarry Mole, Beaver Builder (vanilla), Squire's Mount (vanilla) | 1: +0.1 / +0.3 |
| 174 | detonate | within noise | low | +0.4 ± 0.7 | +0.2 | +0.2 | +0.2 | 0.58 | Bogfire Newt, Beaver Builder (vanilla), Squire's Mount (vanilla) | 1: +0.4 / +0.2 |
| 175 | overwhelm | within noise | low | +0.1 ± 0.3 | +0.0 | +0.3 | -0.2 | -1.04 | Marshal Tuskwell, Gilded Roadwarden, Marching Elephant | 1: +0.1 / +0.3 |
| 176 | reload | within noise | low | -5.8 ± 2.2 | -2.9 | -6.0 | +0.2 | 0.14 | Peak Condor, Riptide Eel | 1: -5.8 / -6.0 |
| 177 | helmet | within noise | low | +0.1 ± 0.6 | +0.1 | +0.0 | +0.1 | 0.47 | Helmeted Otter, Beaver Builder (vanilla), Squire's Mount (vanilla) | 1: +0.1 / +0.0 |
| 178 | king | within noise | low | +1.5 ± 1.0 | +0.8 | +1.4 | +0.1 | 0.28 | The Magnate Duck, Beaver Builder (vanilla), Squire's Mount (vanilla) | 1: +1.5 / +1.4 |
| 179 | sentry | within noise | low | +2.9 ± 1.4 | +1.4 | +3.0 | -0.1 | -0.14 | Muntjac Barker, Battlement Heron, Goose Sentry | 1: +2.9 / +3.0 |
| 180 | prayer | within noise | low | +1.1 ± 1.0 | +0.5 | +1.2 | -0.1 | -0.21 | Chapel Tortoise, Shrine Bell-Ringer, Shrine High Priest | 1: +1.9 / +0.9; 2: -0.6 / +1.8 |
| 181 | illuminate | within noise | low | +0.1 ± 0.7 | +0.0 | +0.2 | -0.1 | -0.3 | Sulfur Cinder Moth, Otter Lantern Bearer, Lantern Bearer | 1: +0.1 / +0.2 |
| 182 | ironWill | within noise | low | +0.1 ± 0.4 | +0.0 | +0.0 | +0.1 | 0.44 | Iron Warden, Beaver Builder (vanilla), Squire's Mount (vanilla) | 1: +0.1 / +0.0 |
| 183 | renewal | within noise | low | +0.1 ± 0.5 | +0.0 | +0.0 | +0.1 | 0.38 | Phoenix Fledgling, Beaver Builder (vanilla), Squire's Mount (vanilla) | 1: +0.1 / +0.0 |
| 184 | foePlenty | within noise | low | +0.2 ± 0.7 | +0.1 | +0.1 | +0.1 | 0.29 | Gull Thief, Beaver Builder (vanilla), Squire's Mount (vanilla) | 1: +0.2 / +0.1 |
| 185 | timbered | within noise | low | +0.6 ± 0.5 | +0.3 | +0.5 | +0.1 | 0.35 | Lodge Engineer, Beaver Builder (vanilla), Squire's Mount (vanilla) | 1: +0.6 / +0.5 |
| 186 | earthquake | within noise | low | +1.2 ± 1.1 | +0.6 | +1.1 | +0.1 | 0.18 | Glacial Ape-King, Gorge Wyrm | 3: +1.5 / +0.9; 4: +0.9 / +1.3 |
| 187 | carnage | within noise | low | +2.4 ± 1.2 | +1.2 | +2.5 | -0.1 | -0.1 | Dust Hyena, Beaver Builder (vanilla), Squire's Mount (vanilla) | 3: +2.4 / +2.5 |
| 188 | armor | within noise | low | +1.5 ± 1.0 | +0.8 | +1.6 | -0.0 | -0.1 | Garden Snail, Marching Elephant, Moat Snapper | 1: +1.5 / +1.6 |
| 189 | poisonBolt | within noise | low | +6.2 ± 1.9 | +3.1 | +6.2 | +0.0 | 0.04 | Spitting Spider, Beaver Builder (vanilla), Squire's Mount (vanilla) | 2: +6.2 / +6.2 |
| 190 | canopyCover | within noise | low | +0.5 ± 0.7 | +0.2 | +0.5 | -0.0 | -0.03 | Fawn Scout, Beaver Builder (vanilla), Squire's Mount (vanilla) | 1: +0.5 / +0.5 |
| 191 | shatter | within noise | low | +0.0 ± 0.6 | +0.0 | +0.0 | +0.0 | 0 | Walrus Icebreaker, Beaver Builder (vanilla), Squire's Mount (vanilla) | 2: +0.0 / +0.0 |

## Skipped

- dictator: on no card of the pool
- dirge: on no card of the pool
- leader: on no card of the pool
