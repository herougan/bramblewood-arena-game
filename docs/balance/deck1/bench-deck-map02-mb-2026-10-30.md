# Focused decks: Map 2 Pebble Beach (2026-11-02)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map mb --pool alley-cat,badger-lumberjack,beaver-lumberjack,bee-forager,bramble-sprout,briarback-hedgehog,burrow-rabbit,conch-crawler,conch-herald,cricket-drummer,driftwood-crab,duck-paddler,ember-tetra,fiddler-crab-swarm,fleetfootd,garden-snail,grey-seal-bull,gull-thief,old-shell,open-ocean-hermit-crab,oystercatcher,pincushion-urchin,river-carp,robin-redbreast,rock-pool-starfish,sea-turtle-elder,terrier-pup,tidepool-trapper-crab,woodcock-lookout --max-unique 6 --max-copies 4 --budget 6000 --final-games 24 --seed deck1 --focus economy,big,swarm,open --anchor badger-lumberjack,beaver-lumberjack,bramble-sprout,conch-crawler,conch-herald,cricket-drummer,driftwood-crab,fiddler-crab-swarm,grey-seal-bull,gull-thief,old-shell,open-ocean-hermit-crab,oystercatcher,pincushion-urchin,rock-pool-starfish,sea-turtle-elder,tidepool-trapper-crab --anchor-min 10 --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 7104 games in 113 s.

- The list (29): Alley Cat, Badger Lumberjack, Beaver Lumberjack, Bee Forager, Bramble Sprout, Briarback Hedgehog, Burrow Rabbit, Conch Crawler, Conch Herald, Cricket Drummer, Driftwood Crab, Duck Paddler, Ember Tetra, Fiddler Crab Swarm, Fleetfoot'd, Garden Snail, Grey Seal Bull, Gull Thief, The Old Shell, Open-Ocean Hermit Crab, Oystercatcher, Pincushion Urchin, River Carp, Robin Redbreast, Rock Pool Starfish, Sea Turtle Elder, Terrier Pup, Tidepool Trapper Crab, Woodcock Lookout.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 2-1 skirmish's deck; 2-2 skirmish's deck; 2-3 skirmish's deck; 2-4 skirmish's deck; 2-5 elite's deck; reference starter deck under 2-1's field; reference deck (Map 2) under 2-2's field; expected player deck (expectedPlayerDeck) under 2-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | open | swarm (16 copies at 0 Lumber); economy (4 resource makers); tide x10 | 92% (88%-95%) | 0.2 | 0: 16, 1: 4 | 4x Burrow Rabbit, 4x Conch Herald, 4x Driftwood Crab, 4x Ember Tetra, 2x Alley Cat, 2x Conch Crawler | 0 |
| 2 | big | big (8 copies at 1+ Lumber, average 0.4); tide x12 | 91% (87%-94%) | 0.4 | 0: 12, 1: 8 | 4x Briarback Hedgehog, 4x Conch Herald, 4x Ember Tetra, 4x Pincushion Urchin, 2x Beaver Lumberjack, 2x Bee Forager | 12 |
| 3 | economy | swarm (16 copies at 0 Lumber); economy (6 resource makers); tide x12 | 87% (83%-91%) | 0.2 | 0: 16, 1: 4 | 4x Conch Herald, 4x Ember Tetra, 4x Gull Thief, 4x Pincushion Urchin, 2x Beaver Lumberjack, 2x Terrier Pup | 12 |
| 4 | swarm | swarm (20 copies at 0 Lumber); economy (4 resource makers); tide x12 | 85% (81%-90%) | 0 | 0: 20 | 4x Driftwood Crab, 4x Ember Tetra, 4x Fiddler Crab Swarm, 4x Pincushion Urchin, 3x Burrow Rabbit, 1x Terrier Pup | 9 |

## Per opponent

| Deck | fight:2-1 | fight:2-2 | fight:2-3 | fight:2-4 | fight:2-5 | ref:starter | ref:road2 | ref:expected |
|---|---|---|---|---|---|---|---|---|
| 1 open | 100% | 100% | 100% | 92% | 88% | 100% | 54% | 100% |
| 2 big | 100% | 96% | 96% | 100% | 88% | 100% | 50% | 96% |
| 3 economy | 96% | 100% | 100% | 79% | 79% | 100% | 50% | 92% |
| 4 swarm | 100% | 92% | 96% | 88% | 54% | 100% | 54% | 100% |
