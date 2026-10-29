# Skill worth vs price (global, 2026-10-29)

Package TOOLS1 (T2). `node tools/bench/bench.js skill --all --games 80` (tools/bench/bench.js skill 1.0.0 (2026-10-28, TOOLS1)); game fingerprint `ee1919c76116`. Suggested prices: `docs/balance/bench-skill-prices-2026-10-28.json` (nothing written to canonical/skill-costs.json).

## How it is measured

- Per skill, up to 3 cards that carry it; a skill on fewer than 2 cards also gets vanilla carriers (beaver-builder, squires-mount) given the skill as its card has it. Each carrier plays 80 paired fights (the bench's slot of 6 copies, Level 1, the global field pool, Smart CPU both sides, 30-Health brambles): with the skill, without it at the same stats, and as printed with +1 Attack and with +1 Health.
- **The yardstick** (pooled over 402 carriers): +1 Attack on 6 copies = +9.4 points, +1 Health = +3.0 points (1 Attack = 3.0977 Health measured; the budget says 2). One budget point (2A + H) = **4.15 ± 0.67 win-rate points**.
- **Measured worth** = the skill's paired gain / the yardstick, in budget points; **Attack-eq** = worth / 2. **Price now** = the carrier's cap-1 left side (2A + H) x m + S with the skill minus without it, as printed (`bramblewood-budget.js`). **Net** = worth - price: + under-priced (it gives more than it costs), - over-priced. z = net / its standard error; confidence high |z| >= 2.5, medium >= 1.5.
- Read a low-confidence row as "not measurably mispriced at this many fights", not as "fair". Random decks: a skill that needs partners (a tribe, Lumber makers, a field) reads low.
- The interval and z count the fights' noise on these carriers only, not how typical the carriers are: with 2-3 carriers a skill whose worth depends on the card (its Attack, its Lumber, a partner) can read far from its average. Re-measure a flagged skill with more carriers (`--carriers 4 --games 200`) before changing its price.
- Across all 317 skills: median worth +1.2, median price +2.0, median net -0.2. Price rules that zero a stat (an Archer's Attack) show as a negative price: the skill's row then measures swinging against shooting.

## The 15 most mispriced (medium or high confidence first, by |net|)

| Rank | Skill | Verdict | Confidence | Measured worth (95%) | Attack-eq | Price now | Net | z | Carriers | Per N (worth / price) |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | tsunami | over-priced | high | +6.3 ± 1.9 | +3.2 | +22.5 | -16.2 | -16.97 | Sperm Whale Elder, Fathom Leviathan | 1: +10.5 / +15.0; 2: +2.1 / +30.0 |
| 2 | meteor | over-priced | high | +6.2 ± 1.7 | +3.1 | +22.0 | -15.8 | -18 | Starfall Owl, Beaver Builder (vanilla), Squire's Mount (vanilla) | 20: +6.2 / +22.0 |
| 3 | archer | under-priced | high | +2.2 ± 1.1 | +1.1 | -10.7 | +12.9 | 22.26 | Stonedrop Vulture, Beaver Builder (vanilla), Squire's Mount (vanilla) | 3: +2.2 / -10.7 |
| 4 | bulwark | over-priced | high | +1.2 ± 1.2 | +0.6 | +10.8 | -9.6 | -15.1 | Ancient Sloth Titan, Muskrat Lodgekeeper | 1: +1.8 / +7.2; 2: +0.6 / +14.4 |
| 5 | T:onSpawn>stun | over-priced | high | +0.0 ± 1.3 | +0.0 | +9.4 | -9.4 | -13.96 | Ash Cloud Condor, Granite Ox Golem | 1: +0.0 / +9.4 |
| 6 | evoluteOmega | over-priced | high | -5.7 ± 1.8 | -2.9 | +3.0 | -8.7 | -9.43 | Bone Diviner, Beaver Builder (vanilla), Squire's Mount (vanilla) | 1: -5.7 / +3.0 |
| 7 | moonborn | over-priced | high | +1.4 ± 1.1 | +0.7 | +10.0 | -8.6 | -14.98 | Lunar Howler, Moonlit Hare | 2: +1.8 / +8.0; 4: +0.9 / +12.0 |
| 8 | loneWolf | over-priced | high | +3.9 ± 1.4 | +2.0 | +12.0 | -8.1 | -11.56 | Lone Grey Wolf, Beaver Builder (vanilla), Squire's Mount (vanilla) | 2: +3.9 / +12.0 |
| 9 | sturdy | over-priced | high | +0.3 ± 0.9 | +0.2 | +8.0 | -7.7 | -16.1 | Grovebearer Dragon-Turtle, Pangolin Roller | 1: +0.3 / +8.0 |
| 10 | fullMoon | over-priced | high | +0.9 ± 0.9 | +0.5 | +8.0 | -7.1 | -14.82 | Moon Jerboa, Beaver Builder (vanilla), Squire's Mount (vanilla) | 3: +0.9 / +8.0 |
| 11 | friction | over-priced | high | -9.0 ± 2.1 | -4.5 | -2.0 | -7.0 | -6.45 | Grindstone Boar, Beaver Builder (vanilla), Squire's Mount (vanilla) | 2: -9.0 / -2.0 |
| 12 | absoluteZero | under-priced | high | +7.8 ± 2.2 | +3.9 | +1.0 | +6.8 | 6.11 | Ice Fish, Beaver Builder (vanilla), Squire's Mount (vanilla) | 1: +7.8 / +1.0 |
| 13 | sweep | over-priced | high | +1.1 ± 0.9 | +0.5 | +7.8 | -6.7 | -14.73 | Gorge Wyrm, Alpha Howler, Boar Rampager | 2: +0.2 / +7.8; 3: +1.5 / +7.8 |
| 14 | immolation | over-priced | high | -1.4 ± 1.0 | -0.7 | +5.3 | -6.7 | -12.88 | Magma Titan, Ashmantle Fiend, Ember Wisp | 1: -1.5 / +4.0; 2: -1.2 / +8.0 |
| 15 | shadow | over-priced | high | +2.3 ± 1.0 | +1.2 | +8.8 | -6.5 | -12.71 | Margay, Beaver Builder (vanilla), Squire's Mount (vanilla) | 1: +2.3 / +8.8 |

## Every skill

| Rank | Skill | Verdict | Confidence | Measured worth (95%) | Attack-eq | Price now | Net | z | Carriers | Per N (worth / price) |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | tsunami | over-priced | high | +6.3 ± 1.9 | +3.2 | +22.5 | -16.2 | -16.97 | Sperm Whale Elder, Fathom Leviathan | 1: +10.5 / +15.0; 2: +2.1 / +30.0 |
| 2 | meteor | over-priced | high | +6.2 ± 1.7 | +3.1 | +22.0 | -15.8 | -18 | Starfall Owl, Beaver Builder (vanilla), Squire's Mount (vanilla) | 20: +6.2 / +22.0 |
| 3 | archer | under-priced | high | +2.2 ± 1.1 | +1.1 | -10.7 | +12.9 | 22.26 | Stonedrop Vulture, Beaver Builder (vanilla), Squire's Mount (vanilla) | 3: +2.2 / -10.7 |
| 4 | bulwark | over-priced | high | +1.2 ± 1.2 | +0.6 | +10.8 | -9.6 | -15.1 | Ancient Sloth Titan, Muskrat Lodgekeeper | 1: +1.8 / +7.2; 2: +0.6 / +14.4 |
| 5 | T:onSpawn>stun | over-priced | high | +0.0 ± 1.3 | +0.0 | +9.4 | -9.4 | -13.96 | Ash Cloud Condor, Granite Ox Golem | 1: +0.0 / +9.4 |
| 6 | evoluteOmega | over-priced | high | -5.7 ± 1.8 | -2.9 | +3.0 | -8.7 | -9.43 | Bone Diviner, Beaver Builder (vanilla), Squire's Mount (vanilla) | 1: -5.7 / +3.0 |
| 7 | moonborn | over-priced | high | +1.4 ± 1.1 | +0.7 | +10.0 | -8.6 | -14.98 | Lunar Howler, Moonlit Hare | 2: +1.8 / +8.0; 4: +0.9 / +12.0 |
| 8 | loneWolf | over-priced | high | +3.9 ± 1.4 | +2.0 | +12.0 | -8.1 | -11.56 | Lone Grey Wolf, Beaver Builder (vanilla), Squire's Mount (vanilla) | 2: +3.9 / +12.0 |
| 9 | sturdy | over-priced | high | +0.3 ± 0.9 | +0.2 | +8.0 | -7.7 | -16.1 | Grovebearer Dragon-Turtle, Pangolin Roller | 1: +0.3 / +8.0 |
| 10 | fullMoon | over-priced | high | +0.9 ± 0.9 | +0.5 | +8.0 | -7.1 | -14.82 | Moon Jerboa, Beaver Builder (vanilla), Squire's Mount (vanilla) | 3: +0.9 / +8.0 |
| 11 | friction | over-priced | high | -9.0 ± 2.1 | -4.5 | -2.0 | -7.0 | -6.45 | Grindstone Boar, Beaver Builder (vanilla), Squire's Mount (vanilla) | 2: -9.0 / -2.0 |
| 12 | absoluteZero | under-priced | high | +7.8 ± 2.2 | +3.9 | +1.0 | +6.8 | 6.11 | Ice Fish, Beaver Builder (vanilla), Squire's Mount (vanilla) | 1: +7.8 / +1.0 |
| 13 | sweep | over-priced | high | +1.1 ± 0.9 | +0.5 | +7.8 | -6.7 | -14.73 | Gorge Wyrm, Alpha Howler, Boar Rampager | 2: +0.2 / +7.8; 3: +1.5 / +7.8 |
| 14 | immolation | over-priced | high | -1.4 ± 1.0 | -0.7 | +5.3 | -6.7 | -12.88 | Magma Titan, Ashmantle Fiend, Ember Wisp | 1: -1.5 / +4.0; 2: -1.2 / +8.0 |
| 15 | shadow | over-priced | high | +2.3 ± 1.0 | +1.2 | +8.8 | -6.5 | -12.71 | Margay, Beaver Builder (vanilla), Squire's Mount (vanilla) | 1: +2.3 / +8.8 |
| 16 | quarry | over-priced | high | -3.9 ± 1.4 | -1.9 | +2.5 | -6.4 | -8.69 | Badger Stonemason, Beaver Builder (vanilla), Squire's Mount (vanilla) | 1: -3.9 / +2.5 |
| 17 | acidBolt | under-priced | high | +7.3 ± 1.8 | +3.6 | +1.0 | +6.3 | 6.65 | Archerfish, Beaver Builder (vanilla), Squire's Mount (vanilla) | 1: +7.3 / +1.0 |
| 18 | chained | over-priced | high | -6.3 ± 1.9 | -3.1 | +0.0 | -6.3 | -6.39 | Chained Binturong, Beaver Builder (vanilla), Squire's Mount (vanilla) | - |
| 19 | pack | under-priced | high | +6.0 ± 2.2 | +3.0 | +0.0 | +6.0 | 5.28 | Dhole Runner, Mire Rat | 1: +6.6 / +0.0; 2: +5.4 / +0.0 |
| 20 | bloomCopy | over-priced | high | +0.2 ± 0.7 | +0.1 | +6.1 | -5.9 | -16.73 | Phoenix Mushrooms, Lotus Frog, Pond Algae | - |
| 21 | regen | over-priced | high | +0.2 ± 0.6 | +0.1 | +6.1 | -5.9 | -18.4 | Grovebearer Dragon-Turtle, Alpine Salamander, Bog Behemoth | 1: +0.3 / +2.6; 3: +0.2 / +7.8 |
| 22 | proliferate | over-priced | high | +0.3 ± 0.6 | +0.2 | +6.1 | -5.8 | -19.21 | Plague Gnat Cloud, Beaver Builder (vanilla), Squire's Mount (vanilla) | 1: +0.3 / +6.1 |
| 23 | nursing | over-priced | high | +4.4 ± 1.5 | +2.2 | +10.0 | -5.6 | -7.59 | Vampire Bat Nurse, Beaver Builder (vanilla), Squire's Mount (vanilla) | 2: +4.4 / +10.0 |
| 24 | fireball | over-priced | high | +10.4 ± 2.4 | +5.2 | +16.0 | -5.6 | -4.56 | Salamander Pyromancer, Beaver Builder (vanilla), Squire's Mount (vanilla) | 15: +10.4 / +16.0 |
| 25 | T:onSpawn>addWait | over-priced | high | +0.4 ± 0.6 | +0.2 | +5.9 | -5.5 | -17.25 | Elder Tortoise, Glacier Yak, Rot-Swollen Carcass | 2: +0.4 / +5.9 |
| 26 | ghost | under-priced | high | +6.1 ± 1.8 | +3.1 | +1.0 | +5.1 | 5.7 | Glasswing Butterfly, Beaver Builder (vanilla), Squire's Mount (vanilla) | 1: +6.1 / +1.0 |
| 27 | T:perTurn>spawnCard | over-priced | high | +4.0 ± 1.7 | +2.0 | +9.0 | -5.0 | -5.67 | Ant Hill, Mother Carrier | 1: +4.0 / +9.0 |
| 28 | lightning | over-priced | high | +0.0 ± 0.4 | +0.0 | +5.0 | -5.0 | -23.35 | Blue Dragon, Storm Heron | 3: +0.0 / +4.0; 4: +0.0 / +6.0 |
| 29 | supreme | over-priced | high | +0.1 ± 0.2 | +0.1 | +5.0 | -4.9 | -48.68 | Black Dragon, Blue Dragon, Fathom Leviathan | 1: +0.1 / +5.0 |
| 30 | quick | over-priced | high | +0.3 ± 1.2 | +0.2 | +5.0 | -4.7 | -7.82 | Frillneck Duelist, Caiman Hatchling, Chipmunk Cavalry | 1: +0.3 / +5.0 |
| 31 | sacrifice | over-priced | high | -0.2 ± 0.3 | -0.1 | +4.5 | -4.7 | -30.81 | Ash Imp, Cinder Imp | 1: -0.3 / +3.0; 2: +0.0 / +6.0 |
| 32 | ichor | under-priced | high | +6.6 ± 1.8 | +3.3 | +2.0 | +4.6 | 4.98 | Velvet Worm, Beaver Builder (vanilla), Squire's Mount (vanilla) | 2: +6.6 / +2.0 |
| 33 | healing | over-priced | high | +0.8 ± 1.0 | +0.4 | +5.3 | -4.5 | -8.87 | Abbey Goose, Newt Doctor, Nectar Vintner | 1: +1.2 / +4.0; 2: +0.0 / +8.0 |
| 34 | amore | under-priced | high | +4.5 ± 1.5 | +2.3 | +0.0 | +4.5 | 5.72 | Lovebird, Beaver Builder (vanilla), Squire's Mount (vanilla) | 1: +4.5 / +0.0 |
| 35 | fletcher | under-priced | high | +4.5 ± 1.6 | +2.3 | +0.0 | +4.5 | 5.38 | Mother Carrier, Eagle-Owl Quartermaster | 1: +4.5 / +0.0 |
| 36 | wilting | over-priced | high | -3.5 ± 1.4 | -1.8 | +1.0 | -4.5 | -6.33 | Paper Wasp, Beaver Builder (vanilla), Squire's Mount (vanilla) | 1: -3.5 / +1.0 |
| 37 | evolute | over-priced | high | -1.5 ± 1.2 | -0.8 | +3.0 | -4.5 | -7.47 | Gale Sprite, Canopy Sloth Guardian, Raven Harbinger | 1: -1.5 / +3.0 |
| 38 | mountainClimber | over-priced | high | -0.5 ± 1.0 | -0.3 | +4.0 | -4.5 | -8.95 | Snow Leopard, Chamois Leaper, Fumarole Ibex | 1: -0.5 / +4.0 |
| 39 | decay | under-priced | high | +5.6 ± 1.7 | +2.8 | +1.1 | +4.5 | 5.06 | Dung Beetle, Beaver Builder (vanilla), Squire's Mount (vanilla) | 1: +5.6 / +1.1 |
| 40 | T:onDeath>exileSelf | under-priced | high | +4.4 ± 1.7 | +2.2 | -0.1 | +4.5 | 5.22 | Ashbone Ghoul, Bog Revenant, Marsh Wisp | 1: +4.4 / -0.1 |
| 41 | avalanche | under-priced | high | +8.4 ± 2.2 | +4.2 | +4.0 | +4.4 | 3.87 | Ibex Rockcaller, Beaver Builder (vanilla), Squire's Mount (vanilla) | 1: +8.4 / +4.0 |
| 42 | spitfire | under-priced | high | +5.4 ± 1.7 | +2.7 | +1.0 | +4.4 | 5.2 | Fire Salamander, Beaver Builder (vanilla), Squire's Mount (vanilla) | 1: +5.4 / +1.0 |
| 43 | electricity | over-priced | high | -0.3 ± 1.4 | -0.2 | +4.0 | -4.3 | -6.22 | Arc Bat, Static Bat, Voltwing Bat | 1: +0.3 / +3.0; 2: -1.5 / +6.0 |
| 44 | T:onAttacked>spawnCard | over-priced | high | +3.3 ± 1.4 | +1.7 | +7.6 | -4.3 | -6.23 | Colony, Scraper of Skies, Bee Drone | 1: +3.3 / +7.6 |
| 45 | evoluteAlpha | over-priced | high | -1.3 ± 1.6 | -0.6 | +3.0 | -4.3 | -5.17 | Stormcaller, Raven Hexcaller, Hanging Loafer | 1: -1.3 / +3.0 |
| 46 | onReadyGold | over-priced | high | +2.0 ± 1.0 | +1.0 | +6.2 | -4.2 | -8.28 | Lodge Engineer, Chipmunk Hoarder, Elder Willow | 1: +2.0 / +6.2 |
| 47 | T:perTurn>forgeWeapon | over-priced | high | +0.1 ± 0.4 | +0.1 | +4.2 | -4.1 | -18.17 | Anvilwhisker Otter, Beaver Builder (vanilla), Squire's Mount (vanilla) | 1: +0.1 / +4.2 |
| 48 | pounce | over-priced | high | +0.7 ± 1.1 | +0.4 | +4.8 | -4.1 | -7.1 | Gilded Roadwarden, Chamois Leaper, Fumarole Ibex | 2: +0.9 / +3.6; 6: +0.3 / +7.2 |
| 49 | brood | under-priced | high | +7.0 ± 2.1 | +3.5 | +2.9 | +4.1 | 3.87 | Carrion Fly Swarm, Wolf Spider Mother, Grotto Lobster | 1: +5.7 / +2.2; 2: +9.6 / +4.4 |
| 50 | recoil | over-priced | high | -2.0 ± 1.1 | -1.0 | +2.0 | -4.0 | -7.07 | Granite Ox Golem, Mantis Shrimp | 2: -2.0 / +2.0 |
| 51 | inspiring | over-priced | high | +1.8 ± 1.0 | +0.9 | +5.8 | -4.0 | -8.13 | Goliath Broodmother, Marshal Tuskwell, Otter Flag Bearer | 1: +4.2 / +3.5; 2: +0.6 / +7.0 |
| 52 | undead | over-priced | high | +0.3 ± 1.0 | +0.2 | +4.3 | -4.0 | -7.93 | Cinder Skeleton, Phoenix Mushrooms, Grass Snake | 1: +0.3 / +4.3 |
| 53 | rage | over-priced | high | +1.0 ± 0.8 | +0.5 | +5.0 | -4.0 | -9.49 | Berserker Boar, Honey Badger Fury, Ant Warrior | 1: +1.0 / +5.0 |
| 54 | molting | over-priced | high | -0.9 ± 1.2 | -0.5 | +3.0 | -3.9 | -6.23 | Harp Seal Pup, Beaver Builder (vanilla), Squire's Mount (vanilla) | 1: -0.9 / +3.0 |
| 55 | dry | over-priced | high | +0.1 ± 0.8 | +0.1 | +4.0 | -3.9 | -9.37 | Dromedary, Static Fennec, Fennec Fox | 1: +0.1 / +4.0 |
| 56 | T:onRoundStart>debuff | over-priced | high | +3.5 ± 1.4 | +1.7 | +7.3 | -3.9 | -5.55 | Rafflesia, Beaver Builder (vanilla), Squire's Mount (vanilla) | 1: +3.5 / +7.3 |
| 57 | twin | over-priced | high | +6.1 ± 1.8 | +3.1 | +10.0 | -3.9 | -4.22 | Puddle Changeling, Beaver Builder (vanilla), Squire's Mount (vanilla) | 1: +6.1 / +10.0 |
| 58 | natureForce | under-priced | high | +3.8 ± 1.3 | +1.9 | +0.0 | +3.8 | 5.86 | Lichen Tortoise, Beaver Builder (vanilla), Squire's Mount (vanilla) | 1: +3.8 / +0.0 |
| 59 | strangle | under-priced | high | +5.0 ± 1.9 | +2.5 | +1.2 | +3.8 | 3.9 | Anaconda Coil, Birdlime Dauber | 1: +5.4 / +0.8; 2: +4.5 / +1.6 |
| 60 | venomous | over-priced | high | +1.4 ± 1.3 | +0.7 | +5.2 | -3.8 | -5.83 | Platypus Spur, Water Shrew, Banded Sea Krait | 1: +1.8 / +3.1; 2: +1.2 / +6.2 |
| 61 | expose | over-priced | high | +0.5 ± 1.0 | +0.2 | +4.2 | -3.7 | -7.48 | Narwhal Lancer, Snow Owl Sentinel | 2: +0.5 / +4.2 |
| 62 | arrow | under-priced | high | +7.6 ± 2.3 | +3.8 | +4.0 | +3.6 | 3.05 | Battlement Heron, Gatling Hog, Eagle-Owl Quartermaster | 1: +7.1 / +3.0; 2: +8.7 / +6.0 |
| 63 | rainrunner | over-priced | high | +0.4 ± 0.7 | +0.2 | +4.0 | -3.6 | -10.33 | Puddle Skimmer, Beaver Builder (vanilla), Squire's Mount (vanilla) | 2: +0.4 / +4.0 |
| 64 | dragonLightning | over-priced | high | +3.9 ± 1.3 | +2.0 | +7.5 | -3.6 | -5.48 | Thunder Lizard, Beaver Builder (vanilla), Squire's Mount (vanilla) | 1: +3.9 / +7.5 |
| 65 | twinShot | over-priced | high | +5.5 ± 1.6 | +2.8 | +9.0 | -3.5 | -4.21 | Spitting Cobra, Beaver Builder (vanilla), Squire's Mount (vanilla) | 1: +5.5 / +9.0 |
| 66 | scare | over-priced | high | +0.8 ± 0.9 | +0.4 | +4.2 | -3.4 | -7.17 | Amber Cicada, Lurking Dread, Ashmantle Fiend | 1: +1.2 / +2.5; 2: +0.6 / +5.0 |
| 67 | venomMaster | over-priced | high | +1.8 ± 0.9 | +0.9 | +5.1 | -3.3 | -7.28 | Cottonmouth Matriarch, Beaver Builder (vanilla), Squire's Mount (vanilla) | 1: +1.8 / +5.1 |
| 68 | fastForward | over-priced | high | +2.4 ± 1.1 | +1.2 | +5.6 | -3.2 | -5.7 | Swift Fox, Beaver Builder (vanilla), Squire's Mount (vanilla) | 1: +2.4 / +5.6 |
| 69 | rocket | under-priced | high | +6.1 ± 1.8 | +3.1 | +3.0 | +3.1 | 3.39 | Bombardier Beetle, Beaver Builder (vanilla), Squire's Mount (vanilla) | 4: +6.1 / +3.0 |
| 70 | puncture | under-priced | high | +4.5 ± 1.5 | +2.3 | +1.4 | +3.1 | 4.01 | Sawfish, Beaver Builder (vanilla), Squire's Mount (vanilla) | 2: +4.5 / +1.4 |
| 71 | irradiated | over-priced | high | -7.1 ± 2.0 | -3.5 | -4.0 | -3.1 | -2.95 | Glowing Gecko, Beaver Builder (vanilla), Squire's Mount (vanilla) | 2: -7.1 / -4.0 |
| 72 | daunt | over-priced | high | +0.3 ± 0.6 | +0.2 | +3.3 | -3.0 | -10.04 | Booming Bittern, Cave Warlord, Eyrie Warden | 1: +0.5 / +2.5; 2: +0.0 / +5.0 |
| 73 | weaken | under-priced | high | +4.0 ± 1.4 | +2.0 | +1.0 | +3.0 | 4.11 | Lamprey, Beaver Builder (vanilla), Squire's Mount (vanilla) | 1: +4.0 / +1.0 |
| 74 | T:onSpawn>drawCard | over-priced | high | +2.8 ± 1.4 | +1.4 | +5.7 | -3.0 | -4.15 | Courier Pigeon, Daily Post, Snail Mail | 1: +1.4 / +4.3; 2: +5.4 / +8.6 |
| 75 | speed | over-priced | high | +1.0 ± 0.9 | +0.5 | +3.9 | -2.9 | -6.26 | Pronghorn Racer, Beaver Builder (vanilla), Squire's Mount (vanilla) | 2: +1.0 / +3.9 |
| 76 | devour | over-priced | high | +1.1 ± 1.7 | +0.5 | +4.0 | -2.9 | -3.4 | Hollow-belly Rat, Pit Glutton | - |
| 77 | fork | over-priced | high | +1.1 ± 0.7 | +0.5 | +4.0 | -2.9 | -7.92 | Kraken Spawnling, Colossal Squid, Alpine Avalanche | 1: +1.1 / +4.0 |
| 78 | kinRally | over-priced | high | +3.6 ± 1.3 | +1.8 | +6.5 | -2.9 | -4.5 | Rivergate Drummer, Beaver Builder (vanilla), Squire's Mount (vanilla) | 1: +3.6 / +6.5 |
| 79 | weaponMaster | over-priced | high | +0.1 ± 0.5 | +0.1 | +3.0 | -2.9 | -10.86 | Armory, Beaver Builder (vanilla), Squire's Mount (vanilla) | 1: +0.1 / +3.0 |
| 80 | ambush | over-priced | high | +1.1 ± 1.3 | +0.6 | +4.0 | -2.9 | -4.41 | Polar Bear, Subterraneaner, Tunnel Ant | 1: +0.9 / +2.0; 2: +1.2 / +4.0; 4: +1.2 / +6.0 |
| 81 | swarm | under-priced | high | +5.3 ± 1.6 | +2.7 | +2.5 | +2.8 | 3.37 | Ant Warrior, Hedge Changeling, Tunnel Ant | 1: +5.3 / +2.5 |
| 82 | taunt | over-priced | high | +0.2 ± 1.6 | +0.1 | +3.0 | -2.8 | -3.41 | Goose Sentry, Swordbill Challenger, Sheep | 1: +0.2 / +3.0 |
| 83 | onDeathSpawn | over-priced | high | +0.2 ± 0.4 | +0.1 | +3.0 | -2.8 | -13.91 | Rot-Swollen Carcass, Fungal Colossus, Goliath Broodmother | - |
| 84 | chainLightning | over-priced | high | +5.2 ± 1.5 | +2.6 | +8.0 | -2.8 | -3.73 | Voltaic Eel, Beaver Builder (vanilla), Squire's Mount (vanilla) | 2: +5.2 / +8.0 |
| 85 | T:perTurn>gain | over-priced | high | +0.3 ± 0.4 | +0.2 | +3.0 | -2.7 | -12.02 | Petrified Tree, Beaver Builder (vanilla), Squire's Mount (vanilla) | 1: +0.3 / +3.0 |
| 86 | gash | over-priced | high | +0.5 ± 0.4 | +0.3 | +3.2 | -2.7 | -12.14 | Komodo Warlord, Kraken Spawnling, Colossal Squid | 3: +0.5 / +3.2 |
| 87 | foeScarcity | under-priced | high | +4.2 ± 1.4 | +2.1 | +1.5 | +2.7 | 3.76 | Stoat Cutthroat, Beaver Builder (vanilla), Squire's Mount (vanilla) | 1: +4.2 / +1.5 |
| 88 | remember | under-priced | high | +4.3 ± 1.7 | +2.2 | +1.7 | +2.6 | 3.13 | Ashbone Ghoul, Bog Revenant, Marsh Wisp | 1: +6.6 / +1.0; 2: +4.8 / +2.0; 3: +1.5 / +2.0 |
| 89 | pearlBed | under-priced | high | +3.5 ± 1.7 | +1.7 | +0.9 | +2.6 | 2.99 | Oyster Bank, Giant Clam | 1: +3.5 / +0.9 |
| 90 | grit | under-priced | high | +2.6 ± 1.2 | +1.3 | +0.1 | +2.6 | 4.22 | Basalt Boar, Beaver Builder (vanilla), Squire's Mount (vanilla) | 1: +2.6 / +0.1 |
| 91 | T:onDeath>poison | over-priced | high | +3.1 ± 1.2 | +1.5 | +5.6 | -2.5 | -4.04 | Blister Beetle, Beaver Builder (vanilla), Squire's Mount (vanilla) | 5: +3.1 / +5.6 |
| 92 | lumberjack | over-priced | high | +2.5 ± 1.2 | +1.3 | +5.0 | -2.5 | -3.94 | Badger Lumberjack, Beaver Builder (vanilla), Squire's Mount (vanilla) | 1: +2.5 / +5.0 |
| 93 | transform | over-priced | high | +0.6 ± 0.6 | +0.3 | +3.1 | -2.5 | -7.85 | Werebadger, Beaver Builder (vanilla), Squire's Mount (vanilla) | - |
| 94 | milling | under-priced | high | +5.4 ± 1.7 | +2.7 | +3.0 | +2.4 | 2.77 | Redwood Woodpecker, Beaver Builder (vanilla), Squire's Mount (vanilla) | 1: +5.4 / +3.0 |
| 95 | fog | over-priced | high | +0.3 ± 0.4 | +0.2 | +2.7 | -2.4 | -10.69 | Ent, Beaver Builder (vanilla), Squire's Mount (vanilla) | 1: +0.3 / +2.7 |
| 96 | darksight | over-priced | high | +0.6 ± 0.9 | +0.3 | +3.0 | -2.4 | -5.09 | Pall Wraith, Quarry Troll, Black Dragon | 1: +0.6 / +3.0 |
| 97 | sprout | over-priced | high | +2.1 ± 1.4 | +1.1 | +4.5 | -2.4 | -3.46 | Seed-cache Squirrel, Grovebearer Dragon-Turtle | 1: +3.3 / +3.0; 2: +0.9 / +6.0 |
| 98 | hemorrhage | over-priced | high | -0.3 ± 0.8 | -0.2 | +2.0 | -2.3 | -5.38 | Bloodscent Shark, Great Skua | 1: -0.3 / +2.0 |
| 99 | hunter | over-priced | high | +0.8 ± 1.6 | +0.4 | +3.0 | -2.2 | -2.67 | Fen Mink, Tidepool Trapper Crab | 1: +0.3 / +2.0; 2: +1.2 / +4.0 |
| 100 | T:onReady>shield | under-priced | high | +3.6 ± 1.4 | +1.8 | +1.4 | +2.2 | 3.03 | Amber Cicada, Beaver Builder (vanilla), Squire's Mount (vanilla) | 2: +3.6 / +1.4 |
| 101 | disarm | over-priced | high | -0.1 ± 0.6 | -0.1 | +2.0 | -2.1 | -6.94 | Glintsnatch Magpie, Beaver Builder (vanilla), Squire's Mount (vanilla) | 1: -0.1 / +2.0 |
| 102 | drunk | under-priced | high | -0.9 ± 1.2 | -0.5 | -3.0 | +2.1 | 3.44 | Marula Elephant, Beaver Builder (vanilla), Squire's Mount (vanilla) | 1: -0.9 / -3.0 |
| 103 | shell | over-priced | high | +2.6 ± 1.2 | +1.3 | +4.7 | -2.1 | -3.31 | Conch Crawler, Giant Clam, Malachite Golem | 2: +3.9 / +4.0; 4: +0.0 / +6.0 |
| 104 | sunshy | over-priced | high | -2.0 ± 1.2 | -1.0 | +0.0 | -2.0 | -3.24 | Aye-aye Prowler, Beaver Builder (vanilla), Squire's Mount (vanilla) | 1: -2.0 / +0.0 |
| 105 | rabid | over-priced | high | +3.1 ± 1.2 | +1.6 | +5.1 | -2.0 | -3.32 | Rabid Jackal, Beaver Builder (vanilla), Squire's Mount (vanilla) | 1: +3.1 / +5.1 |
| 106 | T:onDeath>drawCard | over-priced | high | +1.3 ± 1.0 | +0.7 | +3.3 | -2.0 | -3.7 | Magpie Collector, Beaver Builder (vanilla), Squire's Mount (vanilla) | 1: +1.3 / +3.3 |
| 107 | relic | over-priced | high | +0.1 ± 0.7 | +0.1 | +2.0 | -1.9 | -5.22 | Cathedral Eagle, Friar Badger, Shrine Bell-Ringer | 1: +0.1 / +2.0 |
| 108 | midas | over-priced | high | +0.2 ± 0.3 | +0.1 | +2.0 | -1.8 | -12.25 | The Magnate Duck, Golden Magpie | 2: +0.3 / +2.0; 3: +0.0 / +2.0 |
| 109 | coreEvil | over-priced | high | +0.2 ± 0.5 | +0.1 | +2.0 | -1.8 | -7.29 | Hellbender, Beaver Builder (vanilla), Squire's Mount (vanilla) | 1: +0.2 / +2.0 |
| 110 | packHowl | over-priced | high | +0.7 ± 0.7 | +0.4 | +2.5 | -1.8 | -5 | Frostmoon Howler, Beaver Builder (vanilla), Squire's Mount (vanilla) | 1: +0.7 / +2.5 |
| 111 | chilli | over-priced | high | +2.2 ± 1.2 | +1.1 | +4.0 | -1.8 | -2.91 | Chilli Parrot, Beaver Builder (vanilla), Squire's Mount (vanilla) | 2: +2.2 / +4.0 |
| 112 | greaterPoison | over-priced | high | +0.8 ± 0.8 | +0.4 | +2.5 | -1.7 | -4.41 | Cane Toad, Inland Taipan | 1: +0.8 / +2.5 |
| 113 | nocturnal | over-priced | high | -0.4 ± 1.2 | -0.2 | +1.4 | -1.7 | -2.9 | Banded Sea Krait, Howler Monkey, Arc Bat | 1: -0.4 / +1.4 |
| 114 | stonecutter | over-priced | high | +0.1 ± 0.8 | +0.1 | +1.8 | -1.7 | -4.35 | Marmot Stonecutter, Beaver Builder (vanilla), Squire's Mount (vanilla) | 1: +0.1 / +1.8 |
| 115 | pierce | over-priced | high | +0.0 ± 0.7 | +0.0 | +1.7 | -1.7 | -4.77 | Anvil Thrush, Ember Revenant, Mallard Halberdier | 1: +0.3 / +1.0; 2: -0.2 / +2.0 |
| 116 | breach | over-priced | high | +1.2 ± 0.8 | +0.6 | +2.9 | -1.6 | -3.94 | Badger Sapper, Beetle Battering-Ram | 1: +0.3 / +1.9; 2: +2.1 / +3.8 |
| 117 | canopyCover | over-priced | high | +0.7 ± 0.7 | +0.4 | +2.3 | -1.6 | -4.5 | Fawn Scout, Beaver Builder (vanilla), Squire's Mount (vanilla) | 1: +0.7 / +2.3 |
| 118 | bleed | over-priced | high | +2.6 ± 1.3 | +1.3 | +4.2 | -1.6 | -2.52 | Alley Cat, Whip Spider, Wound Reaver | 1: +0.6 / +3.6; 2: +6.6 / +5.5 |
| 119 | stunOnHit | over-priced | high | +1.4 ± 1.1 | +0.7 | +3.0 | -1.6 | -2.85 | Cinder Hornet, Beaver Builder (vanilla), Squire's Mount (vanilla) | 1: +1.4 / +3.0 |
| 120 | penance | over-priced | high | -2.3 ± 1.2 | -1.2 | -0.8 | -1.6 | -2.51 | Flagellant Vulture, Beaver Builder (vanilla), Squire's Mount (vanilla) | 3: -2.3 / -0.8 |
| 121 | render | over-priced | high | -0.5 ± 1.1 | -0.2 | +1.1 | -1.6 | -2.85 | Mire Witch-Heron, Raven Hexcaller | - |
| 122 | chrysalis | over-priced | high | +0.1 ± 0.4 | +0.1 | +1.6 | -1.5 | -6.65 | Cocoon, Beaver Builder (vanilla), Squire's Mount (vanilla) | 1: +0.1 / +1.6 |
| 123 | brittle | over-priced | high | +0.5 ± 0.8 | +0.3 | +2.0 | -1.5 | -3.85 | Glasswing Moth, Beaver Builder (vanilla), Squire's Mount (vanilla) | 2: +0.5 / +2.0 |
| 124 | inherentDarkness | over-priced | high | +0.5 ± 0.6 | +0.3 | +2.0 | -1.5 | -4.99 | Fruit-bat Familiar, Beaver Builder (vanilla), Squire's Mount (vanilla) | 1: +0.5 / +2.0 |
| 125 | siege | over-priced | high | +0.5 ± 0.5 | +0.3 | +2.0 | -1.5 | -5.67 | Badger Sapper, Trebuchet Crew, Beetle Battering-Ram | 2: +0.3 / +2.0; 3: +0.9 / +2.0 |
| 126 | fester | over-priced | high | +1.3 ± 0.9 | +0.7 | +2.8 | -1.5 | -3.31 | Gangrenous Leech, Beaver Builder (vanilla), Squire's Mount (vanilla) | 1: +1.3 / +2.8 |
| 127 | stagger | over-priced | high | +1.5 ± 1.0 | +0.8 | +3.0 | -1.5 | -2.92 | Bonebreaker, Beaver Builder (vanilla), Squire's Mount (vanilla) | - |
| 128 | felling | under-priced | high | +2.2 ± 1.0 | +1.1 | +0.8 | +1.4 | 2.78 | Beaver Feller, Beaver Builder (vanilla), Squire's Mount (vanilla) | 1: +2.2 / +0.8 |
| 129 | reflect | under-priced | high | +1.4 ± 0.9 | +0.7 | +0.0 | +1.4 | 3.2 | Mirror Moth, Beaver Builder (vanilla), Squire's Mount (vanilla) | 1: +1.4 / +0.0 |
| 130 | keenEye | over-priced | high | +0.2 ± 1.0 | +0.1 | +1.5 | -1.3 | -2.77 | Fawn Scout, Woodcock Lookout, Warren Scout | 1: +0.2 / +1.5 |
| 131 | nullify | under-priced | high | +1.3 ± 0.7 | +0.7 | +0.0 | +1.3 | 3.45 | Hagfish Silencer, Beaver Builder (vanilla), Squire's Mount (vanilla) | 1: +1.3 / +0.0 |
| 132 | tide | over-priced | high | +0.2 ± 0.8 | +0.1 | +1.5 | -1.3 | -3.22 | Abyss Lantern Squid, Elder Tortoise, Fiddler Crab Swarm | 1: +0.2 / +1.5 |
| 133 | freeze | over-priced | high | +0.5 ± 0.9 | +0.3 | +1.8 | -1.3 | -2.96 | Glacier Yak, Walrus Icebreaker, White Dragon | - |
| 134 | T:onKill>gain | over-priced | high | +0.6 ± 0.8 | +0.3 | +1.9 | -1.3 | -2.97 | Dust Hyena, Bone Diviner, Gull Thief | 1: +1.1 / +1.4; 2: -0.3 / +2.8 |
| 135 | heat | over-priced | high | +0.0 ± 0.9 | +0.0 | +1.2 | -1.2 | -2.53 | Cinder Stoker, Beaver Builder (vanilla), Squire's Mount (vanilla) | 1: +0.0 / +1.2 |
| 136 | prospector | over-priced | high | +0.0 ± 0.6 | +0.0 | +1.2 | -1.2 | -3.76 | Prospector Mole, Beaver Builder (vanilla), Squire's Mount (vanilla) | 1: +0.0 / +1.2 |
| 137 | keenSense | over-priced | high | +0.6 ± 0.8 | +0.3 | +1.6 | -1.0 | -2.56 | Quarry Mole, Beaver Builder (vanilla), Squire's Mount (vanilla) | 1: +0.6 / +1.6 |
| 138 | guardian | over-priced | high | +0.0 ± 0.7 | +0.0 | +1.0 | -1.0 | -2.86 | Badger Trench Digger, Canopy Sloth Guardian, Grovebearer Dragon-Turtle | 1: +0.0 / +1.0 |
| 139 | rampart | over-priced | high | -0.6 ± 0.5 | -0.3 | +0.2 | -0.8 | -3.1 | Dam-Keeper Beaver, Riverworks Bastion, Moat Snapper | 1: -0.6 / +0.2 |
| 140 | driftwood | over-priced | high | +0.2 ± 0.4 | +0.1 | +0.8 | -0.5 | -2.73 | Beachcomber Sanderling, Beaver Builder (vanilla), Squire's Mount (vanilla) | 1: +0.2 / +0.8 |
| 141 | iceArrow | under-priced | medium | +6.5 ± 2.3 | +3.2 | +3.8 | +2.7 | 2.36 | Snow Bunting Archer, Rimefire Salamander | 1: +6.6 / +2.5; 2: +6.3 / +5.0 |
| 142 | fireBolt | under-priced | medium | +7.4 ± 2.0 | +3.7 | +5.0 | +2.4 | 2.38 | Firefly Swarm, Beaver Builder (vanilla), Squire's Mount (vanilla) | 2: +7.4 / +5.0 |
| 143 | volley | under-priced | medium | +6.7 ± 2.2 | +3.3 | +4.5 | +2.2 | 1.96 | Echidna Quillshot, Trebuchet Crew | 1: +7.5 / +3.0; 2: +5.9 / +6.0 |
| 144 | berserk | under-priced | medium | +6.1 ± 1.7 | +3.1 | +4.0 | +2.1 | 2.42 | Tasmanian Devil, Beaver Builder (vanilla), Squire's Mount (vanilla) | 2: +6.1 / +4.0 |
| 145 | banner | under-priced | medium | +7.0 ± 1.8 | +3.5 | +5.0 | +2.0 | 2.14 | Parish Sergeant, Beaver Builder (vanilla), Squire's Mount (vanilla) | 1: +7.0 / +5.0 |
| 146 | charge | under-priced | medium | +5.0 ± 1.7 | +2.5 | +3.0 | +2.0 | 2.3 | Electric Ray, Beaver Builder (vanilla), Squire's Mount (vanilla) | - |
| 147 | kinship | under-priced | medium | +5.0 ± 1.6 | +2.5 | +3.0 | +2.0 | 2.43 | Honeyjoe Brewer, Rivergate Tribune | - |
| 148 | poisonGas | under-priced | medium | +8.1 ± 2.2 | +4.1 | +6.2 | +1.9 | 1.72 | Skunk Gasser, Beaver Builder (vanilla), Squire's Mount (vanilla) | 2: +8.1 / +6.2 |
| 149 | swipe | under-priced | medium | +4.8 ± 2.0 | +2.4 | +3.0 | +1.8 | 1.77 | Tax-Collector Teal, Jay Pilferer | 1: +4.8 / +3.0 |
| 150 | stockpile | under-priced | medium | +3.2 ± 1.8 | +1.6 | +1.4 | +1.8 | 1.93 | Beaver Lumberjack, Muskrat Reedgatherer | 1: +1.5 / +0.9; 2: +4.8 / +1.8 |
| 151 | evasive | over-priced | medium | +2.9 ± 1.5 | +1.4 | +4.7 | -1.8 | -2.32 | Cunning Vixen, Mountain Hare, Snow Ermine | 1: +2.9 / +4.7 |
| 152 | flying | over-priced | medium | +2.7 ± 1.5 | +1.4 | +4.5 | -1.8 | -2.32 | Anvil Thrush, Arctic Tern, Ash Cloud Condor | 1: +2.7 / +4.5 |
| 153 | T:onAttack>heal | under-priced | medium | +2.0 ± 1.4 | +1.0 | +0.3 | +1.8 | 2.47 | Forager Ant, Bee Forager | 1: +2.0 / +0.3 |
| 154 | meiosis | under-priced | medium | +2.6 ± 1.4 | +1.3 | +1.0 | +1.6 | 2.23 | Planarian Splitter, Phoenix Mushrooms | 1: +2.6 / +1.0 |
| 155 | toxin | over-priced | medium | +3.5 ± 1.4 | +1.7 | +5.0 | -1.5 | -2.2 | Cone Snail, Beaver Builder (vanilla), Squire's Mount (vanilla) | 1: +3.5 / +5.0 |
| 156 | iceBolt | under-priced | medium | +7.5 ± 1.9 | +3.8 | +6.0 | +1.5 | 1.61 | Ice Petrel, Beaver Builder (vanilla), Squire's Mount (vanilla) | 2: +7.5 / +6.0 |
| 157 | banana | under-priced | medium | +6.5 ± 1.9 | +3.3 | +5.0 | +1.5 | 1.59 | Bramblewood Macaque, Beaver Builder (vanilla), Squire's Mount (vanilla) | 1: +6.5 / +5.0 |
| 158 | psychic | under-priced | medium | +3.5 ± 1.3 | +1.8 | +2.0 | +1.5 | 2.21 | Elephant-nose Fish, Beaver Builder (vanilla), Squire's Mount (vanilla) | 1: +3.5 / +2.0 |
| 159 | sonar | over-priced | medium | +0.5 ± 1.2 | +0.3 | +2.0 | -1.5 | -2.45 | Oilbird, Cave Swiftlet, Whip Spider | 1: +0.5 / +2.0 |
| 160 | counterattack | over-priced | medium | +0.5 ± 1.2 | +0.2 | +1.9 | -1.4 | -2.32 | Thornwood Palisade, Swordbill Challenger | 1: +0.5 / +1.9 |
| 161 | T:onSpawn>stunPlayer | under-priced | medium | +3.4 ± 1.3 | +1.7 | +2.0 | +1.4 | 2.11 | Dread Bell, Beaver Builder (vanilla), Squire's Mount (vanilla) | 1: +3.4 / +2.0 |
| 162 | T:onReady>gain | under-priced | medium | +2.9 ± 1.4 | +1.5 | +1.5 | +1.4 | 2.01 | Ore-Smelter Mole, Driftwood Crab, Dune Packrat | 1: +0.9 / +0.9; 3: +6.9 / +2.7 |
| 163 | smokeBomb | over-priced | medium | +0.6 ± 1.5 | +0.3 | +2.0 | -1.4 | -1.81 | Sea Hare, Smokescreen Raccoon | 1: +0.6 / +2.0 |
| 164 | sleep | over-priced | medium | +2.6 ± 1.1 | +1.3 | +4.0 | -1.4 | -2.44 | Nightshade Moth, Beaver Builder (vanilla), Squire's Mount (vanilla) | - |
| 165 | scatterbrained | under-priced | medium | -4.7 ± 1.5 | -2.3 | -6.0 | +1.3 | 1.73 | Pika Hoarder, Beaver Builder (vanilla), Squire's Mount (vanilla) | 1: -4.7 / -6.0 |
| 166 | T:onAttack>drawCard | over-priced | medium | +4.2 ± 1.5 | +2.1 | +5.5 | -1.3 | -1.76 | Worker Ant, Beaver Builder (vanilla), Squire's Mount (vanilla) | 1: +4.2 / +5.5 |
| 167 | trident | under-priced | medium | +5.3 ± 1.7 | +2.7 | +4.0 | +1.3 | 1.51 | Swordfish Spearman, Beaver Builder (vanilla), Squire's Mount (vanilla) | 1: +5.3 / +4.0 |
| 168 | boomerang | under-priced | medium | +3.2 ± 1.3 | +1.6 | +1.9 | +1.3 | 1.96 | Net Thrower, Otter Centurion, Royal Guard | 1: +3.2 / +1.9 |
| 169 | coppice | under-priced | medium | +2.4 ± 1.1 | +1.2 | +1.1 | +1.3 | 2.27 | Hazel Coppice, Beaver Builder (vanilla), Squire's Mount (vanilla) | 1: +2.4 / +1.1 |
| 170 | bulldoze | over-priced | medium | +2.7 ± 1.1 | +1.4 | +4.0 | -1.3 | -2.24 | Bison Bulldozer, Beaver Builder (vanilla), Squire's Mount (vanilla) | 1: +2.7 / +4.0 |
| 171 | landslide | over-priced | medium | +2.7 ± 1.1 | +1.4 | +4.0 | -1.3 | -2.24 | Scree Goat, Beaver Builder (vanilla), Squire's Mount (vanilla) | 2: +2.7 / +4.0 |
| 172 | T:onSpawn>gain | under-priced | medium | +3.0 ± 1.4 | +1.5 | +1.8 | +1.3 | 1.79 | Cone-cutter Squirrel, Pumice Beetle, Gannet Nestweaver | 1: +3.3 / +1.1; 2: +2.9 / +2.1 |
| 173 | shade | under-priced | medium | +1.2 ± 1.0 | +0.6 | +0.0 | +1.2 | 2.33 | Gloom Gibbon, Ashmantle Fiend | 1: +1.2 / +0.0 |
| 174 | cower | under-priced | medium | +0.7 ± 1.2 | +0.4 | -0.5 | +1.2 | 1.97 | Box Turtle, Beaver Builder (vanilla), Squire's Mount (vanilla) | - |
| 175 | nightblind | under-priced | medium | -1.8 ± 1.3 | -0.9 | -3.0 | +1.2 | 1.74 | Hoopoe Herald, Beaver Builder (vanilla), Squire's Mount (vanilla) | 1: -1.8 / -3.0 |
| 176 | thorns | over-priced | medium | +0.9 ± 1.1 | +0.5 | +2.1 | -1.2 | -2.05 | Barkplate Beetle, Coffer Mimic, Fulmar Spitter | 1: +1.2 / +1.3; 2: +0.8 / +2.5 |
| 177 | diurnal | under-priced | medium | +1.8 ± 1.1 | +0.9 | +0.7 | +1.1 | 1.99 | Sunbittern Strider, Toucan Courier, Arctic Tern | 1: +1.8 / +0.7 |
| 178 | durian | under-priced | medium | +2.6 ± 1.2 | +1.3 | +1.5 | +1.1 | 1.83 | War-Drum Mandrill, Beaver Builder (vanilla), Squire's Mount (vanilla) | 1: +2.6 / +1.5 |
| 179 | scavenge | under-priced | medium | +2.6 ± 1.4 | +1.3 | +1.5 | +1.1 | 1.55 | Carrion Crow, Beaver Builder (vanilla), Squire's Mount (vanilla) | 1: +2.6 / +1.5 |
| 180 | frostbite | under-priced | medium | +1.6 ± 0.9 | +0.8 | +0.5 | +1.1 | 2.31 | Frostbitten Wolverine, Mountain Hare, Musk Ox Calf | 1: +1.6 / +0.5 |
| 181 | shock | over-priced | medium | -0.2 ± 1.2 | -0.1 | +0.9 | -1.1 | -1.76 | Voltaic Eel, Abyss Lantern Squid | - |
| 182 | T:onAllyPlayed>reduceWaitOfSpawned | over-priced | medium | +0.9 ± 0.9 | +0.5 | +2.0 | -1.1 | -2.29 | Nest, Beaver Builder (vanilla), Squire's Mount (vanilla) | 1: +0.9 / +2.0 |
| 183 | prayerWard | over-priced | medium | +1.5 ± 1.0 | +0.8 | +2.5 | -1.0 | -2.03 | Chapel Tortoise, Beaver Builder (vanilla), Squire's Mount (vanilla) | 1: +1.5 / +2.5 |
| 184 | slashBurn | under-priced | medium | +1.8 ± 0.9 | +0.9 | +0.9 | +0.9 | 1.91 | Fire Hawk, Beaver Builder (vanilla), Squire's Mount (vanilla) | 3: +1.8 / +0.9 |
| 185 | changeling | under-priced | medium | +1.0 ± 1.0 | +0.5 | +0.1 | +0.9 | 1.85 | Puddle Changeling, Glass Changeling, Hedge Changeling | 1: +1.0 / +0.1 |
| 186 | converge | under-priced | medium | +0.8 ± 1.0 | +0.4 | +0.0 | +0.8 | 1.64 | Border Collie, Beaver Builder (vanilla), Squire's Mount (vanilla) | - |
| 187 | T:onSpawn>magnet | under-priced | medium | +1.2 ± 0.9 | +0.6 | +0.4 | +0.8 | 1.64 | Clap-net Trapper, Beaver Builder (vanilla), Squire's Mount (vanilla) | 1: +1.2 / +0.4 |
| 188 | frenzy | under-priced | medium | +0.8 ± 0.7 | +0.4 | +0.1 | +0.7 | 1.89 | Ember Jackal, Beaver Builder (vanilla), Squire's Mount (vanilla) | 1: +0.8 / +0.1 |
| 189 | kingSlayer | under-priced | medium | +0.7 ± 0.6 | +0.4 | +0.0 | +0.7 | 2.36 | King Maker, Beaver Builder (vanilla), Squire's Mount (vanilla) | 4: +0.7 / +0.0 |
| 190 | rupture | under-priced | medium | +0.7 ± 0.6 | +0.4 | +0.0 | +0.7 | 2.13 | Wound Reaver, Beaver Builder (vanilla), Squire's Mount (vanilla) | 1: +0.7 / +0.0 |
| 191 | T:onDeath>damage | under-priced | medium | +1.3 ± 0.8 | +0.7 | +0.6 | +0.7 | 1.55 | Sulfur Cinder Moth, Beaver Builder (vanilla), Squire's Mount (vanilla) | 2: +1.3 / +0.6 |
| 192 | fencing | under-priced | medium | +0.6 ± 0.6 | +0.3 | +0.0 | +0.6 | 1.91 | Frillneck Duelist, Beaver Builder (vanilla), Squire's Mount (vanilla) | 1: +0.6 / +0.0 |
| 193 | herbalist | under-priced | medium | +0.6 ± 0.6 | +0.3 | +0.0 | +0.6 | 2.14 | Hedgehog Herbalist, Beaver Builder (vanilla), Squire's Mount (vanilla) | 1: +0.6 / +0.0 |
| 194 | onSpawnDevilry | under-priced | medium | +0.5 ± 0.5 | +0.3 | +0.0 | +0.5 | 1.9 | Ash Imp, Beaver Builder (vanilla), Squire's Mount (vanilla) | 1: +0.5 / +0.0 |
| 195 | primed | under-priced | medium | +0.5 ± 0.6 | +0.3 | +0.0 | +0.5 | 1.67 | Tarantula Hawk, Beaver Builder (vanilla), Squire's Mount (vanilla) | 1: +0.5 / +0.0 |
| 196 | usurper | under-priced | medium | +0.5 ± 0.7 | +0.3 | +0.0 | +0.5 | 1.51 | Crown Pretender, Beaver Builder (vanilla), Squire's Mount (vanilla) | 3: +0.5 / +0.0 |
| 197 | corrode | within noise | low | +0.0 ± 0.0 | +0.0 | +2.0 | -2.0 | null | Glass Octopus, Black Dragon | 2: +0.0 / +2.0; 3: +0.0 / +2.0 |
| 198 | perforate | within noise | low | +5.9 ± 1.8 | +3.0 | +7.2 | -1.3 | -1.4 | Woodpecker Sapper, Beaver Builder (vanilla), Squire's Mount (vanilla) | 2: +5.9 / +7.2 |
| 199 | T:onSpawn>mindControl | within noise | low | +8.6 ± 2.2 | +4.3 | +7.3 | +1.3 | 1.15 | Puppeteer Imp, Beaver Builder (vanilla), Squire's Mount (vanilla) | 1: +8.6 / +7.3 |
| 200 | octolash | within noise | low | +7.7 ± 2.0 | +3.9 | +6.5 | +1.2 | 1.23 | Blue-ringed Octopus, Beaver Builder (vanilla), Squire's Mount (vanilla) | 1: +7.7 / +6.5 |
| 201 | desecrate | within noise | low | +4.9 ± 1.6 | +2.4 | +6.0 | -1.1 | -1.41 | Blackmass Acolyte, Beaver Builder (vanilla), Squire's Mount (vanilla) | 1: +4.9 / +6.0 |
| 202 | stealth | within noise | low | +0.4 ± 1.7 | +0.2 | +1.5 | -1.1 | -1.27 | Glass Octopus, Subterraneaner, Moray Ambusher | 1: +0.4 / +1.5 |
| 203 | beset | within noise | low | +2.8 ± 1.4 | +1.4 | +1.8 | +1.0 | 1.45 | Ravenous Wolverine, Beaver Builder (vanilla), Squire's Mount (vanilla) | 6: +2.8 / +1.8 |
| 204 | tangle | within noise | low | +2.4 ± 1.5 | +1.2 | +1.4 | +1.0 | 1.34 | Weaver Bird, Quicksand Queen | 1: +2.4 / +1.4 |
| 205 | dive | within noise | low | +2.7 ± 1.9 | +1.4 | +1.8 | +0.9 | 0.98 | Harbor Seal, Puffin Diver | 2: +2.7 / +1.8 |
| 206 | supremeTide | within noise | low | +4.9 ± 1.5 | +2.5 | +4.0 | +0.9 | 1.22 | Blue Dragon, Beaver Builder (vanilla), Squire's Mount (vanilla) | 1: +4.9 / +4.0 |
| 207 | invisible | within noise | low | +1.8 ± 1.5 | +0.9 | +2.7 | -0.9 | -1.19 | Booming Bittern, Leaf Chameleon, Sandfish | 2: +1.8 / +2.7 |
| 208 | storm | within noise | low | +0.9 ± 1.2 | +0.5 | +1.8 | -0.9 | -1.47 | Gale Swift, Static Fennec, Fulmar Spitter | 1: +0.9 / +1.8 |
| 209 | twinStrike | within noise | low | +4.1 ± 1.7 | +2.0 | +3.2 | +0.9 | 1.03 | Alley Cat, Gatling Hog | 1: +4.1 / +3.2 |
| 210 | parasite | within noise | low | +0.2 ± 2.4 | +0.1 | +1.0 | -0.8 | -0.71 | Gangrenous Leech, Clinging Leech | 1: +0.2 / +1.0 |
| 211 | sap | within noise | low | +1.8 ± 1.7 | +0.9 | +1.0 | +0.8 | 0.95 | Bog Shrew, Vampire Bat | 1: +1.8 / +1.0 |
| 212 | T:onAllyDie>buff | within noise | low | +3.9 ± 1.4 | +2.0 | +3.1 | +0.8 | 1.13 | Willow-o'-Wisp, Beaver Builder (vanilla), Squire's Mount (vanilla) | 1: +3.9 / +3.1 |
| 213 | feeble | within noise | low | -3.2 ± 1.1 | -1.6 | -4.0 | +0.8 | 1.38 | Slow Loris, Beaver Builder (vanilla), Squire's Mount (vanilla) | 1: -3.2 / -4.0 |
| 214 | scar | within noise | low | +3.2 ± 1.2 | +1.6 | +4.0 | -0.8 | -1.34 | Magma Titan, Beaver Builder (vanilla), Squire's Mount (vanilla) | 2: +3.2 / +4.0 |
| 215 | backstab | within noise | low | +2.2 ± 1.2 | +1.1 | +1.4 | +0.8 | 1.19 | Stoat Cutthroat, Wrong-Way Salmon, Cunning Vixen | 2: +1.7 / +1.2; 3: +3.0 / +1.8 |
| 216 | shield | within noise | low | +3.4 ± 1.4 | +1.7 | +2.7 | +0.7 | 1.07 | Armadillo Guard, Conch Crawler, Tide Pool Crab | 3: +1.8 / +2.4; 4: +6.6 / +3.2 |
| 217 | pitchfork | within noise | low | +3.3 ± 1.3 | +1.6 | +4.0 | -0.7 | -1.14 | Brimstone Hound, Beaver Builder (vanilla), Squire's Mount (vanilla) | 1: +3.3 / +4.0 |
| 218 | bloodlust | within noise | low | +0.7 ± 1.1 | +0.4 | +0.0 | +0.7 | 1.29 | Piranha Shoal, Beaver Builder (vanilla), Squire's Mount (vanilla) | 1: +0.7 / +0.0 |
| 219 | tornado | within noise | low | +1.8 ± 1.5 | +0.9 | +2.5 | -0.7 | -0.94 | Dust-devil Kestrel, Beaver Builder (vanilla), Squire's Mount (vanilla) | 1: +1.8 / +2.5 |
| 220 | timber | within noise | low | +2.3 ± 1.2 | +1.2 | +3.0 | -0.7 | -1.15 | Heartwood Treant, Beaver Builder (vanilla), Squire's Mount (vanilla) | 1: +2.3 / +3.0 |
| 221 | invincible | within noise | low | +1.9 ± 0.9 | +1.0 | +1.2 | +0.7 | 1.4 | Tardigrade, Beaver Builder (vanilla), Squire's Mount (vanilla) | 1: +1.9 / +1.2 |
| 222 | purblind | within noise | low | -5.7 ± 1.7 | -2.8 | -5.0 | -0.7 | -0.78 | Star-nosed Mole, Beaver Builder (vanilla), Squire's Mount (vanilla) | 1: -5.7 / -5.0 |
| 223 | crabClaws | within noise | low | +0.8 ± 1.5 | +0.4 | +0.1 | +0.7 | 0.88 | Grotto Lobster, Tidepool Trapper Crab, Fiddler Crab Swarm | 1: +0.8 / +0.1 |
| 224 | hoard | within noise | low | +1.4 ± 1.1 | +0.7 | +0.8 | +0.6 | 1.13 | The Magnate Duck, Tax-Collector Teal | 1: +2.7 / +0.5; 3: +0.0 / +1.0 |
| 225 | reach | within noise | low | +1.1 ± 1.0 | +0.6 | +0.5 | +0.6 | 1.21 | Birdlime Dauber, Mist-net Otter, Riverstone Slinger | 1: +1.1 / +0.5 |
| 226 | rainmaker | within noise | low | +0.6 ± 1.6 | +0.3 | +0.0 | +0.6 | 0.75 | Rainmaker Frog, Beaver Builder (vanilla), Squire's Mount (vanilla) | 3: +0.6 / +0.0 |
| 227 | T:onAttacked>stun | within noise | low | +2.4 ± 1.2 | +1.2 | +3.0 | -0.6 | -0.94 | Sea Cucumber, Beaver Builder (vanilla), Squire's Mount (vanilla) | 1: +2.4 / +3.0 |
| 228 | T:onSpawn>swapPositions | within noise | low | +0.8 ± 1.2 | +0.4 | +0.2 | +0.6 | 0.96 | Trickster Fox, Beaver Builder (vanilla), Squire's Mount (vanilla) | 1: +0.8 / +0.2 |
| 229 | mimic | within noise | low | +4.4 ± 1.7 | +2.2 | +5.0 | -0.6 | -0.68 | Mirrorhide Mutant, Beaver Builder (vanilla), Squire's Mount (vanilla) | 1: +4.4 / +5.0 |
| 230 | wither | within noise | low | +3.5 ± 1.2 | +1.7 | +2.9 | +0.6 | 0.9 | Corpse-flower Beetle, Beaver Builder (vanilla), Squire's Mount (vanilla) | 1: +3.5 / +2.9 |
| 231 | trap | within noise | low | +3.0 ± 1.6 | +1.5 | +2.5 | +0.6 | 0.7 | Quicksand Queen, Antlion Pit | 5: +3.9 / +2.1; 6: +2.1 / +2.8 |
| 232 | brambleArmor | within noise | low | +1.7 ± 1.2 | +0.8 | +1.1 | +0.6 | 0.91 | Briarback Hedgehog, Barkplate Beetle | 1: +1.7 / +1.1 |
| 233 | predator | within noise | low | +1.3 ± 1.0 | +0.6 | +0.7 | +0.6 | 1.05 | Hedge Weasel, Leopard Seal, Marsh Harrier | 1: +1.3 / +0.7 |
| 234 | cure | within noise | low | +0.3 ± 0.8 | +0.2 | +0.8 | -0.5 | -1.28 | Phoenix Fledgling, Cleaner Wrasse, Marsh-mallow Hare | 1: +0.0 / +0.5; 2: +0.5 / +1.0 |
| 235 | vanguard | within noise | low | +1.7 ± 1.1 | +0.9 | +1.2 | +0.5 | 0.87 | Marshal Tuskwell, Beaver Builder (vanilla), Squire's Mount (vanilla) | 1: +1.7 / +1.2 |
| 236 | fireArrow | within noise | low | +4.2 ± 1.5 | +2.1 | +4.7 | -0.5 | -0.67 | Rimefire Salamander, Fire Drake Hatchling, Magma Salamander | 1: +5.0 / +3.5; 2: +2.4 / +7.0 |
| 237 | executioner | within noise | low | +0.7 ± 0.7 | +0.4 | +0.2 | +0.5 | 1.4 | Grave-Grin Hyena, Beaver Builder (vanilla), Squire's Mount (vanilla) | 2: +0.7 / +0.2 |
| 238 | moonpull | within noise | low | +0.6 ± 1.2 | +0.3 | +0.1 | +0.5 | 0.83 | Moon Jelly, Beaver Builder (vanilla), Squire's Mount (vanilla) | 1: +0.6 / +0.1 |
| 239 | blind | within noise | low | +2.0 ± 1.2 | +1.0 | +2.5 | -0.5 | -0.78 | Horned Lizard, Beaver Builder (vanilla), Squire's Mount (vanilla) | - |
| 240 | T:onAttack>buff | within noise | low | +3.8 ± 1.8 | +1.9 | +4.3 | -0.5 | -0.53 | Ravenous Wolverine, Rockslide Ram | 1: +3.6 / +2.8; 2: +3.9 / +5.7 |
| 241 | ritual | within noise | low | -8.5 ± 1.9 | -4.3 | -9.0 | +0.5 | 0.48 | The Sixfold, Beaver Builder (vanilla), Squire's Mount (vanilla) | - |
| 242 | muster | within noise | low | +3.4 ± 1.3 | +1.7 | +2.9 | +0.5 | 0.73 | Wolf Pack Runner, Beaver Builder (vanilla), Squire's Mount (vanilla) | 6: +3.4 / +2.9 |
| 243 | shoreUp | within noise | low | +1.7 ± 1.1 | +0.9 | +2.2 | -0.5 | -0.85 | Oyster Bank, Musk Ox Matriarch | 1: +1.7 / +2.2 |
| 244 | rain | within noise | low | +0.6 ± 0.9 | +0.3 | +0.1 | +0.5 | 1.01 | Puddle Hopper, Beaver Builder (vanilla), Squire's Mount (vanilla) | 1: +0.6 / +0.1 |
| 245 | salvage | within noise | low | +0.3 ± 0.7 | +0.2 | +0.8 | -0.4 | -1.34 | Salvager Hermit Crab, Beaver Builder (vanilla), Squire's Mount (vanilla) | 1: +0.3 / +0.8 |
| 246 | T:onReady>damage | within noise | low | +0.8 ± 1.1 | +0.4 | +1.3 | -0.4 | -0.76 | Pelican Diver, Stormcaller | 2: +1.7 / +0.7; 5: +0.0 / +1.8 |
| 247 | sociable | within noise | low | +6.4 ± 1.8 | +3.2 | +6.0 | +0.4 | 0.46 | Meerkat Sentry, Beaver Builder (vanilla), Squire's Mount (vanilla) | 2: +6.4 / +6.0 |
| 248 | frost | within noise | low | +0.7 ± 0.6 | +0.4 | +1.1 | -0.4 | -1.4 | Snow Ermine, Beaver Builder (vanilla), Squire's Mount (vanilla) | 1: +0.7 / +1.1 |
| 249 | bounty | within noise | low | +2.9 ± 1.4 | +1.5 | +2.5 | +0.4 | 0.56 | The Magnate Duck, Chipmunk Stockpiler, Pack Mule | 1: +2.9 / +2.5 |
| 250 | bloodTithe | within noise | low | -2.8 ± 1.6 | -1.4 | -2.4 | -0.4 | -0.51 | Vampire Finch, Beaver Builder (vanilla), Squire's Mount (vanilla) | 2: -2.8 / -2.4 |
| 251 | prayer | within noise | low | +1.3 ± 0.9 | +0.7 | +0.9 | +0.4 | 0.89 | Chapel Tortoise, Shrine Bell-Ringer, Cathedral Eagle | 1: +1.3 / +0.9 |
| 252 | defiance | within noise | low | +0.4 ± 0.8 | +0.2 | +0.0 | +0.4 | 0.94 | Mongoose Duelist, Beaver Builder (vanilla), Squire's Mount (vanilla) | 0: +0.4 / +0.0 |
| 253 | festering | within noise | low | +0.4 ± 0.7 | +0.2 | +0.0 | +0.4 | 1.15 | Carrion Beetle, Beaver Builder (vanilla), Squire's Mount (vanilla) | 1: +0.4 / +0.0 |
| 254 | heavyMetal | within noise | low | +0.4 ± 0.6 | +0.2 | +0.0 | +0.4 | 1.26 | Ore-Smelter Mole, Beaver Builder (vanilla), Squire's Mount (vanilla) | 1: +0.4 / +0.0 |
| 255 | prey | within noise | low | +0.4 ± 0.6 | +0.2 | +0.0 | +0.4 | 1.26 | Springbok Pronker, Beaver Builder (vanilla), Squire's Mount (vanilla) | 1: +0.4 / +0.0 |
| 256 | tipsy | within noise | low | +1.1 ± 1.3 | +0.6 | +1.5 | -0.4 | -0.6 | Marula Monkey, Beaver Builder (vanilla), Squire's Mount (vanilla) | - |
| 257 | hibernate | within noise | low | +0.1 ± 0.5 | +0.1 | -0.3 | +0.4 | 1.47 | Polar Bear, Beaver Builder (vanilla), Squire's Mount (vanilla) | 1: +0.1 / -0.3 |
| 258 | shockBolt | within noise | low | +8.5 ± 2.0 | +4.3 | +8.1 | +0.4 | 0.37 | Electric Catfish, Beaver Builder (vanilla), Squire's Mount (vanilla) | 2: +8.5 / +8.1 |
| 259 | requiem | within noise | low | +2.8 ± 1.2 | +1.4 | +3.2 | -0.4 | -0.6 | Cinder Skeleton, Beaver Builder (vanilla), Squire's Mount (vanilla) | 5: +2.8 / +3.2 |
| 260 | dynamite | within noise | low | +1.5 ± 1.2 | +0.7 | +1.1 | +0.4 | 0.6 | Dynamite Packrat, Beaver Builder (vanilla), Squire's Mount (vanilla) | 3: +1.5 / +1.1 |
| 261 | plenty | within noise | low | +0.1 ± 0.7 | +0.1 | +0.5 | -0.3 | -1.04 | Seed-cache Squirrel, Beaver Builder (vanilla), Squire's Mount (vanilla) | 1: +0.1 / +0.5 |
| 262 | web | within noise | low | +0.0 ± 1.0 | +0.0 | +0.3 | -0.3 | -0.65 | Gallery Orb-Weaver, Mist-net Otter | 1: +0.0 / +0.3 |
| 263 | crepuscular | within noise | low | +2.8 ± 1.8 | +1.4 | +2.5 | +0.3 | 0.34 | Nightjar Drifter, Woodcock Lookout | 1: +2.8 / +2.5 |
| 264 | bananarang | within noise | low | +2.2 ± 1.3 | +1.1 | +1.9 | +0.3 | 0.46 | Howler Monkey, Beaver Builder (vanilla), Squire's Mount (vanilla) | 1: +2.2 / +1.9 |
| 265 | detonate | within noise | low | +0.5 ± 0.7 | +0.3 | +0.2 | +0.3 | 0.91 | Bogfire Newt, Beaver Builder (vanilla), Squire's Mount (vanilla) | 1: +0.5 / +0.2 |
| 266 | T:onSpawn>exileGrave | within noise | low | +0.3 ± 1.4 | +0.2 | +0.0 | +0.3 | 0.41 | Echo Keeper, Beaver Builder (vanilla), Squire's Mount (vanilla) | 2: +0.3 / +0.0 |
| 267 | drought | within noise | low | +0.7 ± 0.7 | +0.4 | +1.0 | -0.3 | -0.83 | Dromedary, Beaver Builder (vanilla), Squire's Mount (vanilla) | 1: +0.7 / +1.0 |
| 268 | confuse | within noise | low | +2.7 ± 1.2 | +1.4 | +3.0 | -0.3 | -0.46 | Lyrebird Mimic, Beaver Builder (vanilla), Squire's Mount (vanilla) | - |
| 269 | mighty | within noise | low | +4.7 ± 1.5 | +2.4 | +5.0 | -0.3 | -0.38 | Hercules Beetle, Beaver Builder (vanilla), Squire's Mount (vanilla) | 1: +4.7 / +5.0 |
| 270 | armor | within noise | low | +2.4 ± 1.2 | +1.2 | +2.6 | -0.3 | -0.45 | Horseshoe Crab, Marching Elephant, Moat Snapper | 1: +1.9 / +1.7; 2: +3.3 / +4.5 |
| 271 | esprit | within noise | low | +2.9 ± 1.3 | +1.5 | +3.2 | -0.3 | -0.38 | Riverwing Envoy, Sunspire Envoy, Sunspire Sky-Sovereign | 1: +3.2 / +2.6; 2: +2.4 / +4.2 |
| 272 | king | within noise | low | +1.7 ± 1.0 | +0.8 | +1.4 | +0.3 | 0.5 | The Magnate Duck, Beaver Builder (vanilla), Squire's Mount (vanilla) | 1: +1.7 / +1.4 |
| 273 | earthquake | within noise | low | +1.4 ± 1.1 | +0.7 | +1.1 | +0.3 | 0.44 | Glacial Ape-King, Gorge Wyrm | 3: +1.5 / +0.9; 4: +1.2 / +1.3 |
| 274 | helmet | within noise | low | +0.3 ± 0.6 | +0.1 | +0.0 | +0.3 | 0.82 | Helmeted Otter, Beaver Builder (vanilla), Squire's Mount (vanilla) | 1: +0.3 / +0.0 |
| 275 | poison | within noise | low | +2.8 ± 1.2 | +1.4 | +3.0 | -0.2 | -0.38 | Bogfire Newt, Cane Toad, Cottonmouth Matriarch | 1: +2.8 / +3.0 |
| 276 | explode | within noise | low | +3.8 ± 1.9 | +1.9 | +4.0 | -0.2 | -0.25 | Marsh Gas Toad, Pinecone Sapper | - |
| 277 | coffee | within noise | low | +1.4 ± 1.3 | +0.7 | +1.1 | +0.2 | 0.35 | Buzzed Chipmunk, Honeyjoe Brewer | 1: +1.8 / +1.5; 2: +0.9 / +0.8 |
| 278 | throng | within noise | low | +3.6 ± 1.2 | +1.8 | +3.8 | -0.2 | -0.38 | Carrion Fly Swarm, Beaver Builder (vanilla), Squire's Mount (vanilla) | 10: +3.6 / +3.8 |
| 279 | T:onAttacked>buff | within noise | low | +4.2 ± 1.4 | +2.1 | +4.0 | +0.2 | 0.3 | Feral Tuskboar, Beaver Builder (vanilla), Squire's Mount (vanilla) | 1: +4.2 / +4.0 |
| 280 | crystallise | within noise | low | +1.4 ± 1.1 | +0.7 | +1.2 | +0.2 | 0.36 | Geode Scorpion, Beaver Builder (vanilla), Squire's Mount (vanilla) | 5: +1.4 / +1.2 |
| 281 | bludgeon | within noise | low | +1.2 ± 1.2 | +0.6 | +1.0 | +0.2 | 0.34 | Ironback Gorilla, Ironclaw Fiddler | 1: +1.2 / +1.0 |
| 282 | T:onReady>buff | within noise | low | +1.1 ± 1.0 | +0.6 | +0.9 | +0.2 | 0.41 | Old-Growth Tortoise, Beaver Builder (vanilla), Squire's Mount (vanilla) | 1: +1.1 / +0.9 |
| 283 | timbered | within noise | low | +0.7 ± 0.5 | +0.4 | +0.5 | +0.2 | 0.77 | Lodge Engineer, Beaver Builder (vanilla), Squire's Mount (vanilla) | 1: +0.7 / +0.5 |
| 284 | foePlenty | within noise | low | +0.3 ± 0.7 | +0.2 | +0.1 | +0.2 | 0.6 | Gull Thief, Beaver Builder (vanilla), Squire's Mount (vanilla) | 1: +0.3 / +0.1 |
| 285 | magicArmor | within noise | low | +0.3 ± 0.7 | +0.2 | +0.1 | +0.2 | 0.6 | Moonshell Snail, Beaver Builder (vanilla), Squire's Mount (vanilla) | 1: +0.3 / +0.1 |
| 286 | shapeshifter | within noise | low | +0.3 ± 0.6 | +0.2 | +0.1 | +0.2 | 0.67 | Coffer Mimic, Beaver Builder (vanilla), Squire's Mount (vanilla) | 1: +0.3 / +0.1 |
| 287 | ironWill | within noise | low | +0.2 ± 0.4 | +0.1 | +0.0 | +0.2 | 1 | Iron Warden, Beaver Builder (vanilla), Squire's Mount (vanilla) | 1: +0.2 / +0.0 |
| 288 | renewal | within noise | low | +0.2 ± 0.5 | +0.1 | +0.0 | +0.2 | 0.81 | Phoenix Fledgling, Beaver Builder (vanilla), Squire's Mount (vanilla) | 1: +0.2 / +0.0 |
| 289 | lastStand | within noise | low | +0.4 ± 0.6 | +0.2 | +0.6 | -0.2 | -0.7 | Badger Trench Digger, Beaver Builder (vanilla), Squire's Mount (vanilla) | 1: +0.4 / +0.6 |
| 290 | onReadyDamage | within noise | low | +1.0 ± 0.8 | +0.5 | +1.2 | -0.2 | -0.47 | Cave Warlord, Eyrie Warden, Echo Screecher | - |
| 291 | wave | within noise | low | +1.8 ± 1.0 | +0.9 | +2.0 | -0.2 | -0.36 | Fathom Leviathan, Selkie Wavebinder, Moray Ambusher | 1: +5.1 / +2.0; alternate: +0.3 / +2.0; right: +0.0 / +2.0 |
| 292 | carrion | within noise | low | +2.4 ± 1.1 | +1.2 | +2.6 | -0.2 | -0.33 | Guano Beetle, Ossuary Lammergeier, Greenland Shark | 2: +2.4 / +2.6 |
| 293 | snipe | within noise | low | +2.8 ± 1.2 | +1.4 | +3.0 | -0.2 | -0.31 | Fox Sharpshot, Beaver Builder (vanilla), Squire's Mount (vanilla) | 3: +2.8 / +3.0 |
| 294 | overwhelm | within noise | low | +0.1 ± 0.3 | +0.1 | +0.3 | -0.2 | -1.03 | Marshal Tuskwell, Gilded Roadwarden, Marching Elephant | 1: +0.1 / +0.3 |
| 295 | worship | within noise | low | +0.2 ± 0.7 | +0.1 | +0.0 | +0.2 | 0.44 | Hymn Wren, Cathedral Eagle | 1: +0.2 / +0.0 |
| 296 | castDarkness | within noise | low | +0.4 ± 1.3 | +0.2 | +0.5 | -0.1 | -0.2 | Pall Wraith, Beaver Builder (vanilla), Squire's Mount (vanilla) | 1: +0.4 / +0.5 |
| 297 | reload | within noise | low | -5.9 ± 2.1 | -2.9 | -6.0 | +0.1 | 0.12 | Peak Condor, Riptide Eel | 1: -5.9 / -6.0 |
| 298 | packLeader | within noise | low | -0.1 ± 1.0 | -0.1 | +0.0 | -0.1 | -0.2 | Dhole Matriarch, Beaver Builder (vanilla), Squire's Mount (vanilla) | 1: -0.1 / +0.0 |
| 299 | shatter | within noise | low | +0.1 ± 0.5 | +0.1 | +0.0 | +0.1 | 0.38 | Walrus Icebreaker, Beaver Builder (vanilla), Squire's Mount (vanilla) | 2: +0.1 / +0.0 |
| 300 | illuminate | within noise | low | +0.1 ± 0.7 | +0.1 | +0.2 | -0.1 | -0.3 | Sulfur Cinder Moth, Otter Lantern Bearer, Lantern Bearer | 1: +0.1 / +0.2 |
| 301 | bedrock | within noise | low | +0.2 ± 0.6 | +0.1 | +0.3 | -0.1 | -0.31 | Quarry Mole, Beaver Builder (vanilla), Squire's Mount (vanilla) | 1: +0.2 / +0.3 |
| 302 | beware | within noise | low | +0.2 ± 0.6 | +0.1 | +0.3 | -0.1 | -0.31 | Lurking Dread, Beaver Builder (vanilla), Squire's Mount (vanilla) | 4: +0.2 / +0.3 |
| 303 | wakeful | within noise | low | +0.4 ± 0.6 | +0.2 | +0.5 | -0.1 | -0.35 | Sleepless Shrew, Beaver Builder (vanilla), Squire's Mount (vanilla) | 1: +0.4 / +0.5 |
| 304 | haste | within noise | low | +2.9 ± 1.2 | +1.5 | +3.0 | -0.1 | -0.15 | Roadrunner Courier, Beaver Builder (vanilla), Squire's Mount (vanilla) | 1: +2.9 / +3.0 |
| 305 | sentry | within noise | low | +2.9 ± 1.5 | +1.5 | +3.0 | -0.1 | -0.12 | Muntjac Barker, Battlement Heron, Goose Sentry | 1: +2.9 / +3.0 |
| 306 | salt | within noise | low | +0.3 ± 0.6 | +0.2 | +0.4 | -0.1 | -0.26 | Horseshoe Crab, Beaver Builder (vanilla), Squire's Mount (vanilla) | 1: +0.3 / +0.4 |
| 307 | loyal | within noise | low | +0.6 ± 0.7 | +0.3 | +0.7 | -0.1 | -0.18 | Sworn Shieldbearer, Beaver Builder (vanilla), Squire's Mount (vanilla) | 4: +0.6 / +0.7 |
| 308 | carnage | within noise | low | +2.4 ± 1.2 | +1.2 | +2.5 | -0.1 | -0.09 | Dust Hyena, Beaver Builder (vanilla), Squire's Mount (vanilla) | 3: +2.4 / +2.5 |
| 309 | stem | within noise | low | +0.7 ± 0.8 | +0.4 | +0.7 | +0.0 | 0.08 | Slowpoke Sentinel, Beaver Builder (vanilla), Squire's Mount (vanilla) | 1: +0.7 / +0.7 |
| 310 | poisonBolt | within noise | low | +6.2 ± 1.9 | +3.1 | +6.2 | -0.0 | -0.03 | Spitting Spider, Beaver Builder (vanilla), Squire's Mount (vanilla) | 2: +6.2 / +6.2 |
| 311 | fragile | within noise | low | -5.0 ± 1.6 | -2.5 | -5.0 | -0.0 | -0.02 | Mayfly Dancer, Beaver Builder (vanilla), Squire's Mount (vanilla) | 1: -5.0 / -5.0 |
| 312 | nova | within noise | low | +5.0 ± 1.6 | +2.5 | +5.0 | +0.0 | 0.02 | Supernova Jelly, Beaver Builder (vanilla), Squire's Mount (vanilla) | 3: +5.0 / +5.0 |
| 313 | spiteful | within noise | low | +5.0 ± 1.5 | +2.5 | +5.0 | +0.0 | 0.02 | Thornwood Palisade, Beaver Builder (vanilla), Squire's Mount (vanilla) | 2: +5.0 / +5.0 |
| 314 | trueStrike | within noise | low | +1.5 ± 0.8 | +0.8 | +1.5 | +0.0 | 0.01 | White Dragon, Beaver Builder (vanilla), Squire's Mount (vanilla) | 1: +1.5 / +1.5 |
| 315 | T:onDeath>exileGrave | within noise | low | +0.0 ± 1.0 | +0.0 | +0.0 | +0.0 | 0 | Willow-o'-Wisp, Beaver Builder (vanilla), Squire's Mount (vanilla) | 2: +0.0 / +0.0 |
| 316 | fieldBreaker | within noise | low | +0.0 ± 1.1 | +0.0 | +0.0 | +0.0 | 0 | Weathervane Swift, Beaver Builder (vanilla), Squire's Mount (vanilla) | 2: +0.0 / +0.0 |
| 317 | rockSolid | within noise | low | +0.0 ± 0.6 | +0.0 | +0.0 | +0.0 | 0 | Quarry Troll, Beaver Builder (vanilla), Squire's Mount (vanilla) | 1: +0.0 / +0.0 |

