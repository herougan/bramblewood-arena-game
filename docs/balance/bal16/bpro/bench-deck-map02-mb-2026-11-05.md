# Focused decks: Map 2 Pebble Beach (2026-11-05)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map mb --pool badger-lumberjack,beaver-lumberjack,bramble-sprout,conch-herald,cricket-drummer,driftwood-crab,gull-thief,moon-jelly,old-shell,open-ocean-hermit-crab,oystercatcher,pincushion-urchin,rock-pool-starfish --max-unique 6 --max-copies 4 --budget 6000 --final-games 24 --seed bal16-bpro --focus economy,family:tide,family:rally,open --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 6976 games in 97 s.

- The list (13): Badger Lumberjack, Beaver Lumberjack, Bramble Sprout, Conch Herald, Cricket Drummer, Driftwood Crab, Gull Thief, Moon Jelly, The Old Shell, Open-Ocean Hermit Crab, Oystercatcher, Pincushion Urchin, Rock Pool Starfish.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 2-1 skirmish's deck; 2-2 skirmish's deck; 2-3 skirmish's deck; 2-4 skirmish's deck; 2-5 elite's deck; reference starter deck under 2-1's field; reference deck (Map 2) under 2-2's field; expected player deck (expectedPlayerDeck) under 2-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | family:rally | tide x12; rally x8 | 84% (80%-89%) | 0.35 | 0: 13, 1: 7 | 4x Conch Herald, 4x Cricket Drummer, 4x Pincushion Urchin, 4x Rock Pool Starfish, 3x Oystercatcher, 1x Driftwood Crab | 10 |
| 2 | family:tide | swarm (16 copies at 0 Lumber); tide x9; rally x8 | 77% (72%-82%) | 0.2 | 0: 16, 1: 4 | 4x Conch Herald, 4x Cricket Drummer, 4x Driftwood Crab, 4x Open-Ocean Hermit Crab, 3x Beaver Lumberjack, 1x Rock Pool Starfish | 12 |
| 3 | economy | big (8 copies at 1 Lumber, average 0.4); economy (8 resource makers); rally x8 | 76% (71%-81%) | 0.4 | 0: 12, 1: 8 | 4x Badger Lumberjack, 4x Bramble Sprout, 4x Conch Herald, 4x Cricket Drummer, 4x Gull Thief | 14 |
| 4 | open | big (10 copies at 1 Lumber, average 0.5); tide x10 | 68% (63%-73%) | 0.5 | 0: 10, 1: 10 | 4x Conch Herald, 4x Driftwood Crab, 4x Moon Jelly, 4x Oystercatcher, 2x Badger Lumberjack, 2x Pincushion Urchin | 0 |

## Per opponent

| Deck | fight:2-1 | fight:2-2 | fight:2-3 | fight:2-4 | fight:2-5 | ref:starter | ref:road2 | ref:expected |
|---|---|---|---|---|---|---|---|---|
| 1 family:rally | 100% | 96% | 96% | 88% | 63% | 100% | 54% | 79% |
| 2 family:tide | 88% | 88% | 92% | 71% | 67% | 96% | 38% | 79% |
| 3 economy | 92% | 83% | 96% | 71% | 63% | 96% | 38% | 71% |
| 4 open | 100% | 92% | 92% | 75% | 38% | 92% | 13% | 46% |
