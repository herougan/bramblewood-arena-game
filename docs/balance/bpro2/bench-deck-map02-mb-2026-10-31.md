# Focused decks: Map 2 Pebble Beach (2026-10-31)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map mb --pool badger-lumberjack,beaver-lumberjack,bramble-sprout,conch-crawler,conch-herald,cricket-drummer,driftwood-crab,fiddler-crab-swarm,grey-seal-bull,gull-thief,open-ocean-hermit-crab,oystercatcher,pincushion-urchin,sea-turtle-elder,tide-pool-crab,tidepool-trapper-crab --max-unique 6 --max-copies 4 --budget 6000 --final-games 24 --seed bpro2 --focus economy,big,swarm,open --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 7040 games in 95 s.

- The list (16): Badger Lumberjack, Beaver Lumberjack, Bramble Sprout, Conch Crawler, Conch Herald, Cricket Drummer, Driftwood Crab, Fiddler Crab Swarm, Grey Seal Bull, Gull Thief, Open-Ocean Hermit Crab, Oystercatcher, Pincushion Urchin, Sea Turtle Elder, Tide Pool Crab, Tidepool Trapper Crab.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 2-1 skirmish's deck; 2-2 skirmish's deck; 2-3 skirmish's deck; 2-4 skirmish's deck; 2-5 elite's deck; reference starter deck under 2-1's field; reference deck (Map 2) under 2-2's field; expected player deck (expectedPlayerDeck) under 2-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | economy | big (10 copies at 1+ Lumber, average 0.5); economy (6 resource makers); tide x10 | 81% (77%-86%) | 0.5 | 0: 10, 1: 10 | 4x Conch Herald, 4x Cricket Drummer, 4x Driftwood Crab, 4x Grey Seal Bull, 2x Badger Lumberjack, 2x Pincushion Urchin | 16 |
| 2 | swarm | swarm (16 copies at 0 Lumber); economy (4 resource makers); tide x16; armor x10 | 79% (74%-84%) | 0.2 | 0: 16, 1: 4 | 4x Beaver Lumberjack, 4x Conch Herald, 4x Fiddler Crab Swarm, 4x Tide Pool Crab, 2x Conch Crawler, 2x Pincushion Urchin | 8 |
| 3 | big | big (8 copies at 1+ Lumber, average 0.4); economy (4 resource makers); tide x9; armor x7 | 78% (73%-82%) | 0.4 | 0: 12, 1: 8 | 4x Conch Herald, 4x Driftwood Crab, 4x Oystercatcher, 4x Tide Pool Crab, 3x Tidepool Trapper Crab, 1x Pincushion Urchin | 8 |
| 4 | open | big (8 copies at 1+ Lumber, average 0.4); tide x14; armor x10 | 73% (68%-79%) | 0.4 | 0: 12, 1: 8 | 4x Conch Crawler, 4x Conch Herald, 4x Oystercatcher, 4x Tide Pool Crab, 2x Beaver Lumberjack, 2x Open-Ocean Hermit Crab | 0 |

## Per opponent

| Deck | fight:2-1 | fight:2-2 | fight:2-3 | fight:2-4 | fight:2-5 | ref:starter | ref:road2 | ref:expected |
|---|---|---|---|---|---|---|---|---|
| 1 economy | 96% | 83% | 83% | 88% | 67% | 100% | 33% | 100% |
| 2 swarm | 100% | 79% | 83% | 88% | 75% | 96% | 25% | 88% |
| 3 big | 96% | 79% | 83% | 83% | 79% | 100% | 17% | 83% |
| 4 open | 96% | 79% | 75% | 67% | 67% | 83% | 25% | 96% |
