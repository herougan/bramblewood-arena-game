# Focused decks: Map 2 Pebble Beach (2026-11-10)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map mb --pool alley-cat,beachcomber-sanderling,beaver-lumberjack,bee-forager,bloodworm,bramble-sprout,burrow-rabbit,conch-herald,cricket-drummer,driftwood-crab,duck-paddler,duckling,fleetfootd,great-skua,gull-thief,hedgerow-shrew,limpet-clinger,meadow-frog,moonlit-hare,old-shell,open-ocean-hermit-crab,oystercatcher,pincushion-urchin,pond-duck,puddle-skimmer,river-carp,robin-redbreast,rock-pool-starfish,slow-worm,terrier-pup --max-unique 6 --max-copies 4 --budget 1200 --final-games 24 --seed skir1-pro --focus economy,family:tide,family:flying,open --anchor beachcomber-sanderling,beaver-lumberjack,bloodworm,conch-herald,driftwood-crab,duck-paddler,great-skua,gull-thief,hedgerow-shrew,limpet-clinger,moonlit-hare,old-shell,open-ocean-hermit-crab,oystercatcher,pincushion-urchin,puddle-skimmer,robin-redbreast,rock-pool-starfish --anchor-min 10 --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 2048 games in 315 s.

- The list (30): Alley Cat, Beachcomber Sanderling, Beaver Lumberjack, Bee Forager, Bloodworm, Bramble Sprout, Burrow Rabbit, Conch Herald, Cricket Drummer, Driftwood Crab, Duck Paddler, Duckling, Fleetfoot'd, Great Skua, Gull Thief, Hedgerow Shrew, Limpet Clinger, Meadow Frog, Moonlit Hare, The Old Shell, Open-Ocean Hermit Crab, Oystercatcher, Pincushion Urchin, Pond Duck, Puddle Skimmer, River Carp, Robin Redbreast, Rock Pool Starfish, Slow-worm, Terrier Pup.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 2-1 skirmish's deck; 2-2 skirmish's deck; 2-3 skirmish's deck; 2-4 skirmish's deck; 2-5 elite's deck; reference starter deck under 2-1's field; reference deck (Map 2) under 2-2's field; expected player deck (expectedPlayerDeck) under 2-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | family:tide | swarm (16 copies at 0 Lumber); economy (4 resource makers); tide x8; flying x8 | 79% (74%-85%) | 0.2 | 0: 16, 1: 4 | 4x Bloodworm, 4x Conch Herald, 4x Fleetfoot'd, 4x Gull Thief, 4x Robin Redbreast | 10 |
| 2 | family:flying | swarm (18 copies at 0 Lumber); economy (4 resource makers); flying x10 | 79% (74%-85%) | 0.1 | 0: 18, 1: 2 | 4x Cricket Drummer, 4x Gull Thief, 4x Robin Redbreast, 3x Alley Cat, 3x Bramble Sprout, 2x Oystercatcher | 18 |
| 3 | open | swarm (14 copies at 0 Lumber); economy (4 resource makers); bleed x6; tide x6 | 73% (67%-79%) | 0.3 | 0: 14, 1: 6 | 4x Bloodworm, 4x Driftwood Crab, 4x Duck Paddler, 4x Fleetfoot'd, 2x Alley Cat, 2x Conch Herald | 0 |
| 4 | economy | swarm (14 copies at 0 Lumber); economy (6 resource makers) | 67% (61%-73%) | 0.3 | 0: 14, 1: 6 | 4x Beachcomber Sanderling, 4x Bloodworm, 4x Meadow Frog, 3x Great Skua, 3x The Old Shell, 2x Gull Thief | 16 |

## Per opponent

| Deck | fight:2-1 | fight:2-2 | fight:2-3 | fight:2-4 | fight:2-5 | ref:starter | ref:road2 | ref:expected |
|---|---|---|---|---|---|---|---|---|
| 1 family:tide | 83% | 75% | 100% | 79% | 58% | 100% | 63% | 75% |
| 2 family:flying | 83% | 79% | 100% | 75% | 54% | 96% | 67% | 79% |
| 3 open | 96% | 63% | 92% | 79% | 46% | 100% | 50% | 58% |
| 4 economy | 71% | 67% | 88% | 67% | 63% | 88% | 33% | 63% |
