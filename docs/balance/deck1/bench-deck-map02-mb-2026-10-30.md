# Focused decks: Map 2 Pebble Beach (2026-11-02)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map mb --pool alley-cat,badger-lumberjack,beaver-lumberjack,bee-forager,bramble-sprout,burrow-rabbit,conch-crawler,conch-herald,cricket-drummer,driftwood-crab,duck-paddler,fiddler-crab-swarm,fleetfootd,garden-snail,grey-seal-bull,gull-thief,guppy,old-shell,open-ocean-hermit-crab,oystercatcher,pincushion-urchin,river-carp,robin-redbreast,rock-pool-starfish,sea-turtle-elder,terrier-pup,tidepool-trapper-crab,woodcock-lookout --max-unique 6 --max-copies 4 --budget 6000 --final-games 24 --seed deck1 --focus economy,big,swarm,open --anchor badger-lumberjack,beaver-lumberjack,bramble-sprout,conch-crawler,conch-herald,cricket-drummer,driftwood-crab,fiddler-crab-swarm,grey-seal-bull,gull-thief,old-shell,open-ocean-hermit-crab,oystercatcher,pincushion-urchin,rock-pool-starfish,sea-turtle-elder,tidepool-trapper-crab --anchor-min 10 --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 7312 games in 112 s.

- The list (28): Alley Cat, Badger Lumberjack, Beaver Lumberjack, Bee Forager, Bramble Sprout, Burrow Rabbit, Conch Crawler, Conch Herald, Cricket Drummer, Driftwood Crab, Duck Paddler, Fiddler Crab Swarm, Fleetfoot'd, Garden Snail, Grey Seal Bull, Gull Thief, Guppy, The Old Shell, Open-Ocean Hermit Crab, Oystercatcher, Pincushion Urchin, River Carp, Robin Redbreast, Rock Pool Starfish, Sea Turtle Elder, Terrier Pup, Tidepool Trapper Crab, Woodcock Lookout.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 2-1 skirmish's deck; 2-2 skirmish's deck; 2-3 skirmish's deck; 2-4 skirmish's deck; 2-5 elite's deck; reference starter deck under 2-1's field; reference deck (Map 2) under 2-2's field; expected player deck (expectedPlayerDeck) under 2-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | open | swarm (16 copies at 0 Lumber); tide x10 | 81% (76%-86%) | 0.2 | 0: 16, 1: 4 | 4x Conch Herald, 4x Cricket Drummer, 4x Open-Ocean Hermit Crab, 4x River Carp, 2x Driftwood Crab, 2x Fleetfoot'd | 0 |
| 2 | big | big (8 copies at 1+ Lumber, average 0.4); economy (8 resource makers); tide x10 | 76% (71%-81%) | 0.4 | 0: 12, 1: 8 | 4x Badger Lumberjack, 4x Beaver Lumberjack, 4x Conch Herald, 4x Pincushion Urchin, 2x Duck Paddler, 2x Fleetfoot'd | 14 |
| 3 | economy | swarm (14 copies at 0 Lumber); economy (6 resource makers); tide x12 | 76% (70%-81%) | 0.3 | 0: 14, 1: 6 | 4x Conch Herald, 4x Fleetfoot'd, 4x Gull Thief, 4x Pincushion Urchin, 2x Badger Lumberjack, 2x Bramble Sprout | 14 |
| 4 | swarm | swarm (14 copies at 0 Lumber); tide x16; armor x8 | 67% (61%-73%) | 0.3 | 0: 14, 1: 6 | 4x Fiddler Crab Swarm, 4x Fleetfoot'd, 4x Grey Seal Bull, 4x Open-Ocean Hermit Crab, 2x Bee Forager, 2x Oystercatcher | 14 |

## Per opponent

| Deck | fight:2-1 | fight:2-2 | fight:2-3 | fight:2-4 | fight:2-5 | ref:starter | ref:road2 | ref:expected |
|---|---|---|---|---|---|---|---|---|
| 1 open | 92% | 92% | 88% | 83% | 83% | 83% | 33% | 92% |
| 2 big | 100% | 83% | 92% | 83% | 50% | 96% | 25% | 79% |
| 3 economy | 92% | 88% | 75% | 83% | 75% | 96% | 17% | 79% |
| 4 swarm | 88% | 67% | 71% | 58% | 50% | 100% | 21% | 79% |
