# Focused decks: Map 2 Pebble Beach (2026-11-12)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map mb --pool alley-cat,beachcomber-sanderling,beaver-lumberjack,bee-forager,bramble-sprout,burrow-rabbit,cricket-drummer,driftwood-crab,duck-paddler,duckling,fleetfootd,gull-thief,hedgerow-shrew,limpet-clinger,meadow-frog,moonlit-hare,old-shell,open-ocean-hermit-crab,oystercatcher,pincushion-urchin,pond-duck,puddle-skimmer,river-carp,robin-redbreast,rock-pool-starfish,slow-worm,terrier-pup --max-unique 6 --max-copies 4 --budget 8000 --final-games 24 --seed skir1-pro --focus economy,family:tide,family:armor,open --anchor beachcomber-sanderling,beaver-lumberjack,driftwood-crab,duck-paddler,gull-thief,hedgerow-shrew,limpet-clinger,moonlit-hare,old-shell,open-ocean-hermit-crab,oystercatcher,pincushion-urchin,puddle-skimmer,robin-redbreast,rock-pool-starfish --anchor-min 10 --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 9088 games in 144 s.

- The list (27): Alley Cat, Beachcomber Sanderling, Beaver Lumberjack, Bee Forager, Bramble Sprout, Burrow Rabbit, Cricket Drummer, Driftwood Crab, Duck Paddler, Duckling, Fleetfoot'd, Gull Thief, Hedgerow Shrew, Limpet Clinger, Meadow Frog, Moonlit Hare, The Old Shell, Open-Ocean Hermit Crab, Oystercatcher, Pincushion Urchin, Pond Duck, Puddle Skimmer, River Carp, Robin Redbreast, Rock Pool Starfish, Slow-worm, Terrier Pup.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 2-1 skirmish's deck; 2-2 skirmish's deck; 2-3 skirmish's deck; 2-4 skirmish's deck; 2-5 elite's deck; reference starter deck under 2-1's field; reference deck (Map 2) under 2-2's field; expected player deck (expectedPlayerDeck) under 2-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | open | swarm (15 copies at 0 Lumber); economy (4 resource makers); tide x7 | 82% (77%-87%) | 0.25 | 0: 15, 1: 5 | 4x Cricket Drummer, 4x Driftwood Crab, 4x Moonlit Hare, 4x Pincushion Urchin, 3x Meadow Frog, 1x The Old Shell | 0 |
| 2 | economy | swarm (16 copies at 0 Lumber); economy (7 resource makers); rally x8 | 76% (70%-81%) | 0.2 | 0: 16, 1: 4 | 4x Cricket Drummer, 4x Gull Thief, 4x The Old Shell, 3x Beachcomber Sanderling, 3x Pond Duck, 2x Alley Cat | 15 |
| 3 | family:tide | swarm (20 copies at 0 Lumber); tide x9 | 72% (66%-78%) | 0 | 0: 20 | 4x Alley Cat, 4x Open-Ocean Hermit Crab, 4x Robin Redbreast, 3x Cricket Drummer, 3x Fleetfoot'd, 2x Pincushion Urchin | 15 |
| 4 | family:armor | swarm (14 copies at 0 Lumber); armor x10; tide x8 | 71% (65%-77%) | 0.3 | 0: 14, 1: 6 | 4x Fleetfoot'd, 4x The Old Shell, 4x Open-Ocean Hermit Crab, 3x Cricket Drummer, 3x Hedgerow Shrew, 2x Driftwood Crab | 14 |

## Per opponent

| Deck | fight:2-1 | fight:2-2 | fight:2-3 | fight:2-4 | fight:2-5 | ref:starter | ref:road2 | ref:expected |
|---|---|---|---|---|---|---|---|---|
| 1 open | 83% | 88% | 100% | 71% | 79% | 100% | 58% | 79% |
| 2 economy | 83% | 75% | 96% | 67% | 71% | 83% | 63% | 67% |
| 3 family:tide | 79% | 71% | 92% | 54% | 58% | 96% | 50% | 79% |
| 4 family:armor | 63% | 71% | 96% | 58% | 67% | 88% | 58% | 71% |
