# Focused decks: Map 2 Pebble Beach (2026-11-10)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map mb --pool beachcomber-sanderling,beaver-lumberjack,bloodworm,conch-herald,driftwood-crab,duck-paddler,great-skua,gull-thief,hedgerow-shrew,limpet-clinger,moonlit-hare,old-shell,open-ocean-hermit-crab,oystercatcher,pincushion-urchin,puddle-skimmer,robin-redbreast,rock-pool-starfish --max-unique 6 --max-copies 4 --budget 2000 --final-games 24 --seed skir1-bpro --focus economy,family:tide,family:armor,open --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 3264 games in 644 s.

- The list (18): Beachcomber Sanderling, Beaver Lumberjack, Bloodworm, Conch Herald, Driftwood Crab, Duck Paddler, Great Skua, Gull Thief, Hedgerow Shrew, Limpet Clinger, Moonlit Hare, The Old Shell, Open-Ocean Hermit Crab, Oystercatcher, Pincushion Urchin, Puddle Skimmer, Robin Redbreast, Rock Pool Starfish.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 2-1 skirmish's deck; 2-2 skirmish's deck; 2-3 skirmish's deck; 2-4 skirmish's deck; 2-5 elite's deck; reference starter deck under 2-1's field; reference deck (Map 2) under 2-2's field; expected player deck (expectedPlayerDeck) under 2-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | economy | big (8 copies at 1 Lumber, average 0.4); economy (11 resource makers); tide x9; armor x8 | 77% (71%-82%) | 0.4 | 0: 12, 1: 8 | 4x Conch Herald, 4x Driftwood Crab, 4x Gull Thief, 4x Limpet Clinger, 3x Beachcomber Sanderling, 1x Pincushion Urchin | 13 |
| 2 | family:tide | swarm (15 copies at 0 Lumber); tide x8 | 77% (72%-82%) | 0.25 | 0: 15, 1: 5 | 4x The Old Shell, 4x Pincushion Urchin, 4x Puddle Skimmer, 4x Rock Pool Starfish, 3x Duck Paddler, 1x Driftwood Crab | 16 |
| 3 | open | swarm (16 copies at 0 Lumber); economy (4 resource makers); flying x8 | 74% (69%-79%) | 0.2 | 0: 16, 1: 4 | 4x Beachcomber Sanderling, 4x Limpet Clinger, 4x Oystercatcher, 4x Puddle Skimmer, 4x Robin Redbreast | 0 |
| 4 | family:armor | swarm (15 copies at 0 Lumber); economy (4 resource makers); armor x9; tide x7 | 71% (65%-76%) | 0.25 | 0: 15, 1: 5 | 4x Driftwood Crab, 4x Moonlit Hare, 4x Open-Ocean Hermit Crab, 4x Robin Redbreast, 3x Rock Pool Starfish, 1x The Old Shell | 16 |

## Per opponent

| Deck | fight:2-1 | fight:2-2 | fight:2-3 | fight:2-4 | fight:2-5 | ref:starter | ref:road2 | ref:expected |
|---|---|---|---|---|---|---|---|---|
| 1 economy | 88% | 83% | 92% | 83% | 42% | 100% | 54% | 71% |
| 2 family:tide | 96% | 83% | 100% | 88% | 25% | 96% | 54% | 71% |
| 3 open | 71% | 92% | 88% | 75% | 33% | 100% | 46% | 88% |
| 4 family:armor | 88% | 75% | 92% | 54% | 25% | 100% | 71% | 63% |
