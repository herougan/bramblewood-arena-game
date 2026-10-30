# Focused decks: Map 2 Smugglers' Grotto (2026-10-30)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map mg --pool bee-forager,conch-crawler,conch-herald,driftwood-crab,fiddler-crab-swarm,gannet-nestweaver,garden-snail,grey-seal-bull,gull-thief,kittiwake-flock,moat-snapper,mudpuppy,newt-doctor,nutria-reedcutter,open-ocean-hermit-crab,pincushion-urchin,puffin-diver,rock-pool-starfish,sea-turtle-elder,tide-pool-crab,tidepool-trapper-crab,trash-panda-trickster --max-unique 6 --max-copies 4 --budget 12000 --final-games 24 --seed deck1 --focus economy,big,swarm,open --anchor conch-crawler,conch-herald,fiddler-crab-swarm,grey-seal-bull,gull-thief,open-ocean-hermit-crab,pincushion-urchin,sea-turtle-elder,tide-pool-crab,tidepool-trapper-crab,trash-panda-trickster --anchor-min 10 --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 13020 games in 248 s.

- The list (22): Bee Forager, Conch Crawler, Conch Herald, Driftwood Crab, Fiddler Crab Swarm, Gannet Nestweaver, Garden Snail, Grey Seal Bull, Gull Thief, Kittiwake Flock, Moat Snapper, Mudpuppy, Newt Doctor, Nutria Reedcutter, Open-Ocean Hermit Crab, Pincushion Urchin, Puffin Diver, Rock Pool Starfish, Sea Turtle Elder, Tide Pool Crab, Tidepool Trapper Crab, Trash Panda Trickster.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 2-B-1 skirmish's deck; 2-B-2 elite's deck; 2-B-3 elite's deck; 2-B-4 elite's deck; reference starter deck under 2-B-1's field; reference deck (Map 7) under 2-B-2's field; expected player deck (expectedPlayerDeck) under 2-B-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | open | big (9 copies at 1+ Lumber, average 0.5); economy (4 resource makers); tide x9; flying x6 | 86% (81%-91%) | 0.45 | 0: 11, 1: 9 | 4x Grey Seal Bull, 4x Kittiwake Flock, 4x Trash Panda Trickster, 3x Conch Herald, 3x Mudpuppy, 2x Puffin Diver | 0 |
| 2 | swarm | swarm (14 copies at 0 Lumber); economy (8 resource makers); tide x10; guard x8 | 85% (80%-89%) | 0.3 | 0: 14, 1: 6 | 4x Conch Crawler, 4x Grey Seal Bull, 4x Nutria Reedcutter, 4x Trash Panda Trickster, 2x Conch Herald, 2x Mudpuppy | 8 |
| 3 | big | big (8 copies at 1+ Lumber, average 0.4); tide x9 | 84% (79%-89%) | 0.4 | 0: 12, 1: 8 | 4x Conch Herald, 4x Grey Seal Bull, 4x Kittiwake Flock, 4x Newt Doctor, 3x Trash Panda Trickster, 1x Rock Pool Starfish | 6 |
| 4 | economy | swarm (16 copies at 0 Lumber); economy (9 resource makers); tide x8 | 83% (78%-88%) | 0.2 | 0: 16, 1: 4 | 4x Driftwood Crab, 4x Grey Seal Bull, 4x Pincushion Urchin, 4x Trash Panda Trickster, 3x Mudpuppy, 1x Nutria Reedcutter | 9 |

## Per opponent

| Deck | fight:2-B-1 | fight:2-B-2 | fight:2-B-3 | fight:2-B-4 | ref:starter | ref:road7 | ref:expected |
|---|---|---|---|---|---|---|---|
| 1 open | 88% | 71% | 96% | 92% | 92% | 63% | 100% |
| 2 swarm | 88% | 88% | 96% | 96% | 88% | 42% | 96% |
| 3 big | 79% | 90% | 96% | 88% | 83% | 54% | 100% |
| 4 economy | 88% | 75% | 96% | 92% | 92% | 38% | 100% |
