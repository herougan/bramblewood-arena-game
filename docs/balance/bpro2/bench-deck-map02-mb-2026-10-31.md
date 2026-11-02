# Focused decks: Map 2 Pebble Beach (2026-11-02)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map mb --pool badger-lumberjack,beaver-lumberjack,bramble-sprout,conch-crawler,conch-herald,cricket-drummer,driftwood-crab,fiddler-crab-swarm,grey-seal-bull,gull-thief,moon-jelly,old-shell,open-ocean-hermit-crab,oystercatcher,pincushion-urchin,rock-pool-starfish,sea-turtle-elder,tidepool-trapper-crab --max-unique 6 --max-copies 4 --budget 6000 --final-games 24 --seed bpro2 --focus economy,big,swarm,open --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 7328 games in 185 s.

- The list (18): Badger Lumberjack, Beaver Lumberjack, Bramble Sprout, Conch Crawler, Conch Herald, Cricket Drummer, Driftwood Crab, Fiddler Crab Swarm, Grey Seal Bull, Gull Thief, Moon Jelly, The Old Shell, Open-Ocean Hermit Crab, Oystercatcher, Pincushion Urchin, Rock Pool Starfish, Sea Turtle Elder, Tidepool Trapper Crab.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 2-1 skirmish's deck; 2-2 skirmish's deck; 2-3 skirmish's deck; 2-4 skirmish's deck; 2-5 elite's deck; reference starter deck under 2-1's field; reference deck (Map 2) under 2-2's field; expected player deck (expectedPlayerDeck) under 2-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | economy | swarm (16 copies at 0 Lumber); economy (6 resource makers); tide x11 | 85% (82%-89%) | 0.2 | 0: 16, 1: 4 | 4x Conch Crawler, 4x Conch Herald, 4x Driftwood Crab, 3x Cricket Drummer, 3x Pincushion Urchin, 2x Beaver Lumberjack | 9 |
| 2 | open | swarm (16 copies at 0 Lumber); tide x16 | 81% (77%-86%) | 0.2 | 0: 16, 1: 4 | 4x Bramble Sprout, 4x Conch Crawler, 4x Conch Herald, 4x Moon Jelly, 4x Pincushion Urchin | 0 |
| 3 | swarm | swarm (15 copies at 0 Lumber); economy (4 resource makers); tide x13 | 74% (69%-79%) | 0.3 | 0: 15, 1: 4, 2: 1 | 4x Conch Herald, 4x Fiddler Crab Swarm, 4x Gull Thief, 4x Pincushion Urchin, 3x Bramble Sprout, 1x Sea Turtle Elder | 9 |
| 4 | big | big (8 copies at 1+ Lumber, average 0.4); economy (5 resource makers); tide x12; guard x8 | 71% (66%-76%) | 0.4 | 0: 12, 1: 8 | 4x Conch Herald, 4x Fiddler Crab Swarm, 4x Grey Seal Bull, 3x Beaver Lumberjack, 3x Cricket Drummer, 2x Driftwood Crab | 16 |

## Per opponent

| Deck | fight:2-1 | fight:2-2 | fight:2-3 | fight:2-4 | fight:2-5 | ref:starter | ref:road2 | ref:expected |
|---|---|---|---|---|---|---|---|---|
| 1 economy | 100% | 92% | 100% | 100% | 71% | 100% | 21% | 100% |
| 2 open | 100% | 92% | 96% | 92% | 79% | 88% | 21% | 83% |
| 3 swarm | 96% | 96% | 79% | 83% | 63% | 83% | 13% | 83% |
| 4 big | 96% | 92% | 88% | 67% | 50% | 96% | 8% | 75% |
