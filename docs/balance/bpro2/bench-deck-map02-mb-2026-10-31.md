# Focused decks: Map 2 Pebble Beach (2026-11-01)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map mb --pool badger-lumberjack,beaver-lumberjack,bramble-sprout,conch-crawler,conch-herald,cricket-drummer,driftwood-crab,fiddler-crab-swarm,grey-seal-bull,gull-thief,old-shell,open-ocean-hermit-crab,oystercatcher,pincushion-urchin,rock-pool-starfish,sea-turtle-elder,tidepool-trapper-crab --max-unique 6 --max-copies 4 --budget 6000 --final-games 24 --seed bpro2 --focus economy,big,swarm,open --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 7200 games in 401 s.

- The list (17): Badger Lumberjack, Beaver Lumberjack, Bramble Sprout, Conch Crawler, Conch Herald, Cricket Drummer, Driftwood Crab, Fiddler Crab Swarm, Grey Seal Bull, Gull Thief, The Old Shell, Open-Ocean Hermit Crab, Oystercatcher, Pincushion Urchin, Rock Pool Starfish, Sea Turtle Elder, Tidepool Trapper Crab.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 2-1 skirmish's deck; 2-2 skirmish's deck; 2-3 skirmish's deck; 2-4 skirmish's deck; 2-5 elite's deck; reference starter deck under 2-1's field; reference deck (Map 2) under 2-2's field; expected player deck (expectedPlayerDeck) under 2-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | economy | swarm (16 copies at 0 Lumber); economy (6 resource makers); tide x10 | 84% (80%-88%) | 0.2 | 0: 16, 1: 4 | 4x Conch Herald, 4x Cricket Drummer, 4x Driftwood Crab, 4x Pincushion Urchin, 2x Conch Crawler, 2x Gull Thief | 9 |
| 2 | swarm | swarm (14 copies at 0 Lumber); economy (6 resource makers); tide x7 | 82% (78%-86%) | 0.3 | 0: 14, 1: 6 | 4x Beaver Lumberjack, 4x Bramble Sprout, 4x Pincushion Urchin, 3x Conch Herald, 3x Oystercatcher, 2x Driftwood Crab | 14 |
| 3 | big | big (8 copies at 1+ Lumber, average 0.4); tide x13; guard x9 | 77% (72%-82%) | 0.4 | 0: 12, 1: 8 | 4x Bramble Sprout, 4x Conch Herald, 4x Grey Seal Bull, 3x Beaver Lumberjack, 3x Fiddler Crab Swarm, 2x Conch Crawler | 14 |
| 4 | open | swarm (16 copies at 0 Lumber); economy (4 resource makers); tide x13; guard x6 | 76% (71%-81%) | 0.2 | 0: 16, 1: 4 | 4x Driftwood Crab, 4x Grey Seal Bull, 4x Pincushion Urchin, 3x Cricket Drummer, 3x Open-Ocean Hermit Crab, 2x Fiddler Crab Swarm | 0 |

## Per opponent

| Deck | fight:2-1 | fight:2-2 | fight:2-3 | fight:2-4 | fight:2-5 | ref:starter | ref:road2 | ref:expected |
|---|---|---|---|---|---|---|---|---|
| 1 economy | 96% | 100% | 96% | 83% | 79% | 96% | 25% | 96% |
| 2 swarm | 96% | 96% | 92% | 92% | 83% | 92% | 13% | 96% |
| 3 big | 92% | 88% | 96% | 75% | 79% | 83% | 17% | 83% |
| 4 open | 92% | 96% | 75% | 92% | 71% | 83% | 13% | 88% |
