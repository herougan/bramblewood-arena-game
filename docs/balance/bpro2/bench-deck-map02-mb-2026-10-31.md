# Focused decks: Map 2 Pebble Beach (2026-11-02)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map mb --pool badger-lumberjack,beaver-lumberjack,bramble-sprout,conch-crawler,conch-herald,cricket-drummer,driftwood-crab,fiddler-crab-swarm,grey-seal-bull,gull-thief,old-shell,open-ocean-hermit-crab,oystercatcher,pincushion-urchin,rock-pool-starfish,sea-turtle-elder,tidepool-trapper-crab --max-unique 6 --max-copies 4 --budget 6000 --final-games 24 --seed bpro2 --focus economy,big,swarm,open --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 7344 games in 112 s.

- The list (17): Badger Lumberjack, Beaver Lumberjack, Bramble Sprout, Conch Crawler, Conch Herald, Cricket Drummer, Driftwood Crab, Fiddler Crab Swarm, Grey Seal Bull, Gull Thief, The Old Shell, Open-Ocean Hermit Crab, Oystercatcher, Pincushion Urchin, Rock Pool Starfish, Sea Turtle Elder, Tidepool Trapper Crab.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 2-1 skirmish's deck; 2-2 skirmish's deck; 2-3 skirmish's deck; 2-4 skirmish's deck; 2-5 elite's deck; reference starter deck under 2-1's field; reference deck (Map 2) under 2-2's field; expected player deck (expectedPlayerDeck) under 2-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | open | swarm (15 copies at 0 Lumber); tide x13 | 79% (75%-83%) | 0.25 | 0: 15, 1: 5 | 4x Conch Crawler, 4x Conch Herald, 4x Cricket Drummer, 4x Pincushion Urchin, 3x Beaver Lumberjack, 1x Grey Seal Bull | 0 |
| 2 | swarm | swarm (16 copies at 0 Lumber); tide x7 | 74% (69%-79%) | 0.2 | 0: 16, 1: 4 | 4x Bramble Sprout, 4x Cricket Drummer, 4x Oystercatcher, 4x Pincushion Urchin, 3x Fiddler Crab Swarm, 1x Beaver Lumberjack | 11 |
| 3 | big | big (8 copies at 1+ Lumber, average 0.4); economy (7 resource makers); tide x8 | 69% (64%-75%) | 0.4 | 0: 12, 1: 8 | 4x Bramble Sprout, 4x Conch Herald, 4x Driftwood Crab, 4x Pincushion Urchin, 3x Badger Lumberjack, 1x Oystercatcher | 12 |
| 4 | economy | big (8 copies at 1+ Lumber, average 0.4); economy (6 resource makers); tide x10; guard x8 | 68% (63%-74%) | 0.4 | 0: 12, 1: 8 | 4x Driftwood Crab, 4x Fiddler Crab Swarm, 4x Grey Seal Bull, 4x Oystercatcher, 2x Beaver Lumberjack, 2x Open-Ocean Hermit Crab | 17 |

## Per opponent

| Deck | fight:2-1 | fight:2-2 | fight:2-3 | fight:2-4 | fight:2-5 | ref:starter | ref:road2 | ref:expected |
|---|---|---|---|---|---|---|---|---|
| 1 open | 92% | 96% | 88% | 88% | 75% | 92% | 4% | 96% |
| 2 swarm | 92% | 96% | 75% | 79% | 67% | 83% | 21% | 79% |
| 3 big | 88% | 96% | 71% | 92% | 58% | 71% | 8% | 71% |
| 4 economy | 92% | 83% | 75% | 67% | 71% | 83% | 8% | 67% |
