# Focused decks: Map 2 Pebble Beach (2026-11-12)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map mb --pool beachcomber-sanderling,beaver-lumberjack,driftwood-crab,duck-paddler,gull-thief,hedgerow-shrew,limpet-clinger,moonlit-hare,old-shell,open-ocean-hermit-crab,oystercatcher,pincushion-urchin,puddle-skimmer,robin-redbreast,rock-pool-starfish --max-unique 6 --max-copies 4 --budget 6000 --final-games 24 --seed skir1-bpro --focus economy,family:armor,family:tide,open --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 7120 games in 138 s.

- The list (15): Beachcomber Sanderling, Beaver Lumberjack, Driftwood Crab, Duck Paddler, Gull Thief, Hedgerow Shrew, Limpet Clinger, Moonlit Hare, The Old Shell, Open-Ocean Hermit Crab, Oystercatcher, Pincushion Urchin, Puddle Skimmer, Robin Redbreast, Rock Pool Starfish.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 2-1 skirmish's deck; 2-2 skirmish's deck; 2-3 skirmish's deck; 2-4 skirmish's deck; 2-5 elite's deck; reference starter deck under 2-1's field; reference deck (Map 2) under 2-2's field; expected player deck (expectedPlayerDeck) under 2-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | open | swarm (16 copies at 0 Lumber) | 85% (80%-90%) | 0.2 | 0: 16, 1: 4 | 4x Moonlit Hare, 4x The Old Shell, 4x Pincushion Urchin, 4x Robin Redbreast, 3x Hedgerow Shrew, 1x Beachcomber Sanderling | 0 |
| 2 | economy | swarm (15 copies at 0 Lumber); economy (6 resource makers); armor x9; tide x8 | 84% (79%-89%) | 0.25 | 0: 15, 1: 5 | 4x Limpet Clinger, 4x Robin Redbreast, 4x Rock Pool Starfish, 3x Beachcomber Sanderling, 3x Driftwood Crab, 2x The Old Shell | 13 |
| 3 | family:armor | swarm (16 copies at 0 Lumber); tide x12; armor x8 | 84% (80%-89%) | 0.2 | 0: 16, 1: 4 | 4x Duck Paddler, 4x Limpet Clinger, 4x The Old Shell, 4x Pincushion Urchin, 4x Rock Pool Starfish | 12 |
| 4 | family:tide | swarm (16 copies at 0 Lumber); economy (4 resource makers); armor x8; tide x8 | 76% (70%-82%) | 0.2 | 0: 16, 1: 4 | 4x Driftwood Crab, 4x Open-Ocean Hermit Crab, 4x Rock Pool Starfish, 3x Moonlit Hare, 3x Robin Redbreast, 2x Duck Paddler | 14 |

## Per opponent

| Deck | fight:2-1 | fight:2-2 | fight:2-3 | fight:2-4 | fight:2-5 | ref:starter | ref:road2 | ref:expected |
|---|---|---|---|---|---|---|---|---|
| 1 open | 88% | 88% | 100% | 75% | 83% | 92% | 67% | 88% |
| 2 economy | 88% | 88% | 100% | 75% | 79% | 100% | 67% | 79% |
| 3 family:armor | 96% | 92% | 92% | 79% | 96% | 100% | 46% | 75% |
| 4 family:tide | 75% | 79% | 96% | 50% | 67% | 100% | 67% | 75% |
