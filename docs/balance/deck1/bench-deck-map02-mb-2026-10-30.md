# Focused decks: Map 2 Pebble Beach (2026-10-30)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map mb --pool badger-lumberjack,beaver-lumberjack,bee-forager,bramble-sprout,briarback-hedgehog,burrow-rabbit,conch-crawler,conch-herald,cricket-drummer,dormouse,driftwood-crab,duck-paddler,ember-tetra,fiddler-crab-swarm,fleetfootd,garden-snail,grey-seal-bull,gull-thief,open-ocean-hermit-crab,oystercatcher,pincushion-urchin,river-carp,robin-redbreast,sea-turtle-elder,terrier-pup,tide-pool-crab,tidepool-trapper-crab,woodcock-lookout --max-unique 6 --max-copies 4 --budget 12000 --final-games 24 --seed deck1 --focus economy,big,swarm,open --anchor badger-lumberjack,beaver-lumberjack,bramble-sprout,conch-crawler,conch-herald,cricket-drummer,driftwood-crab,fiddler-crab-swarm,grey-seal-bull,gull-thief,open-ocean-hermit-crab,oystercatcher,pincushion-urchin,sea-turtle-elder,tide-pool-crab,tidepool-trapper-crab --anchor-min 10 --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 13248 games in 187 s.

- The list (28): Badger Lumberjack, Beaver Lumberjack, Bee Forager, Bramble Sprout, Briarback Hedgehog, Burrow Rabbit, Conch Crawler, Conch Herald, Cricket Drummer, Dormouse, Driftwood Crab, Duck Paddler, Ember Tetra, Fiddler Crab Swarm, Fleetfoot'd, Garden Snail, Grey Seal Bull, Gull Thief, Open-Ocean Hermit Crab, Oystercatcher, Pincushion Urchin, River Carp, Robin Redbreast, Sea Turtle Elder, Terrier Pup, Tide Pool Crab, Tidepool Trapper Crab, Woodcock Lookout.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 2-1 skirmish's deck; 2-2 skirmish's deck; 2-3 skirmish's deck; 2-4 skirmish's deck; 2-5 elite's deck; reference starter deck under 2-1's field; reference deck (Map 2) under 2-2's field; expected player deck (expectedPlayerDeck) under 2-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | economy | big (9 copies at 1+ Lumber, average 0.5); economy (6 resource makers); tide x10 | 89% (85%-93%) | 0.45 | 0: 11, 1: 9 | 4x Beaver Lumberjack, 4x Briarback Hedgehog, 4x Ember Tetra, 3x Grey Seal Bull, 3x Pincushion Urchin, 2x Badger Lumberjack | 10 |
| 2 | swarm | swarm (17 copies at 0 Lumber); tide x12; armor x7 | 89% (84%-93%) | 0.15 | 0: 17, 1: 3 | 4x Ember Tetra, 4x Pincushion Urchin, 4x Tide Pool Crab, 3x Briarback Hedgehog, 3x Cricket Drummer, 2x Dormouse | 13 |
| 3 | big | big (8 copies at 1+ Lumber, average 0.4); economy (4 resource makers); tide x14; guard x7 | 88% (83%-92%) | 0.4 | 0: 12, 1: 8 | 4x Badger Lumberjack, 4x Ember Tetra, 4x Grey Seal Bull, 3x Conch Crawler, 3x Pincushion Urchin, 2x Duck Paddler | 12 |
| 4 | open | swarm (16 copies at 0 Lumber); tide x17; guard x7 | 85% (81%-90%) | 0.2 | 0: 16, 1: 4 | 4x Ember Tetra, 4x Fleetfoot'd, 4x Grey Seal Bull, 3x Beaver Lumberjack, 3x Tide Pool Crab, 2x Fiddler Crab Swarm | 0 |

## Per opponent

| Deck | fight:2-1 | fight:2-2 | fight:2-3 | fight:2-4 | fight:2-5 | ref:starter | ref:road2 | ref:expected |
|---|---|---|---|---|---|---|---|---|
| 1 economy | 100% | 92% | 96% | 96% | 92% | 96% | 42% | 100% |
| 2 swarm | 100% | 88% | 96% | 100% | 79% | 92% | 63% | 92% |
| 3 big | 100% | 92% | 96% | 100% | 92% | 79% | 54% | 88% |
| 4 open | 100% | 88% | 92% | 100% | 71% | 96% | 50% | 88% |
