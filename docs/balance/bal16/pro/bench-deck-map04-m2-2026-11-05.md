# Focused decks: Map 4 Sunken Hollow (2026-11-05)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map m2 --pool alley-cat,beaver-lumberjack,bee-forager,bramble-sprout,conch-crawler,driftwood-crab,drowned-matriarch,duck-paddler,duckling,field-vole,fleetfootd,gannet-nestweaver,guppy,lions-mane-jelly,muskrat-lodgekeeper,pincushion-urchin,platypus-spur,pond-algae,pond-duck,puffin-diver,pyrenean-desman,river-carp,shoal-shark,slow-worm,snapstick-turtle,water-shrew --max-unique 6 --max-copies 4 --budget 6000 --final-games 24 --seed bal16-pro --focus family:tide,big,swarm,open --anchor alley-cat,beaver-lumberjack,drowned-matriarch,duck-paddler,field-vole,lions-mane-jelly,muskrat-lodgekeeper,platypus-spur,pond-algae,pyrenean-desman,shoal-shark,slow-worm,snapstick-turtle,water-shrew --anchor-min 10 --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 7088 games in 140 s.

- The list (26): Alley Cat, Beaver Lumberjack, Bee Forager, Bramble Sprout, Conch Crawler, Driftwood Crab, The Drowned Matriarch, Duck Paddler, Duckling, Field Vole, Fleetfoot'd, Gannet Nestweaver, Guppy, Lion's Mane Jelly, Muskrat Lodgekeeper, Pincushion Urchin, Platypus Spur, Pond Algae, Pond Duck, Puffin Diver, Pyrenean Desman, River Carp, Shoal Shark, Slow-worm, Snapstick Turtle, Water Shrew.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 4-1 skirmish's deck; 4-2 skirmish's deck; 4-3 elite's deck; 4-4 elite's deck; 4-5 elite's deck; reference starter deck under 4-1's field; reference deck (Map 4) under 4-2's field; expected player deck (expectedPlayerDeck) under 4-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | family:tide | swarm (16 copies at 0 Lumber); tide x15; cleave x6 | 85% (80%-90%) | 0.2 | 0: 16, 1: 4 | 4x Conch Crawler, 4x The Drowned Matriarch, 4x Pyrenean Desman, 3x Duckling, 3x Fleetfoot'd, 2x Alley Cat | 16 |
| 2 | swarm | swarm (16 copies at 0 Lumber); tide x9 | 75% (70%-80%) | 0.2 | 0: 16, 1: 4 | 4x The Drowned Matriarch, 4x Field Vole, 4x Pincushion Urchin, 4x Pond Algae, 3x Bramble Sprout, 1x Conch Crawler | 17 |
| 3 | big | big (8 copies at 1 Lumber, average 0.4); tide x13 | 74% (69%-80%) | 0.4 | 0: 12, 1: 8 | 4x The Drowned Matriarch, 4x Muskrat Lodgekeeper, 4x Pond Duck, 3x Driftwood Crab, 3x Pincushion Urchin, 2x Pyrenean Desman | 16 |
| 4 | open | big (10 copies at 1 Lumber, average 0.5); tide x10 | 74% (69%-79%) | 0.5 | 0: 10, 1: 10 | 4x Lion's Mane Jelly, 4x Pyrenean Desman, 4x Shoal Shark, 3x Bramble Sprout, 3x Gannet Nestweaver, 2x Muskrat Lodgekeeper | 0 |

## Per opponent

| Deck | fight:4-1 | fight:4-2 | fight:4-3 | fight:4-4 | fight:4-5 | ref:starter | ref:road4 | ref:expected |
|---|---|---|---|---|---|---|---|---|
| 1 family:tide | 88% | 96% | 92% | 92% | 83% | 96% | 54% | 79% |
| 2 swarm | 92% | 88% | 88% | 88% | 71% | 96% | 17% | 63% |
| 3 big | 83% | 88% | 83% | 96% | 71% | 100% | 21% | 54% |
| 4 open | 79% | 96% | 75% | 92% | 83% | 100% | 25% | 42% |
