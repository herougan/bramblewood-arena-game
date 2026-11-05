# Focused decks: Map 2 Smugglers' Grotto (2026-11-05)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map mg --pool alley-cat,bee-forager,box-turtle,conch-crawler,conch-herald,driftwood-crab,gallery-orb-weaver,gannet-nestweaver,garden-snail,grey-seal-bull,gull-thief,kittiwake-flock,newt-doctor,nutria-reedcutter,octopus-tactician,old-shell,open-ocean-hermit-crab,oystercatcher,pelican-diver,pincushion-urchin,puffin-diver,razorbill,rock-pool-starfish,sea-turtle-elder,tide-pool-crab,tidepool-trapper-crab,trash-panda-trickster --max-unique 6 --max-copies 4 --budget 6000 --final-games 24 --seed bal16-pro --focus economy,family:tide,family:flying,open --anchor conch-crawler,conch-herald,driftwood-crab,gallery-orb-weaver,grey-seal-bull,gull-thief,octopus-tactician,old-shell,open-ocean-hermit-crab,pelican-diver,pincushion-urchin,rock-pool-starfish,sea-turtle-elder,tide-pool-crab,tidepool-trapper-crab,trash-panda-trickster --anchor-min 10 --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 6804 games in 139 s.

- The list (27): Alley Cat, Bee Forager, Box Turtle, Conch Crawler, Conch Herald, Driftwood Crab, Gallery Orb-Weaver, Gannet Nestweaver, Garden Snail, Grey Seal Bull, Gull Thief, Kittiwake Flock, Newt Doctor, Nutria Reedcutter, Octopus Tactician, The Old Shell, Open-Ocean Hermit Crab, Oystercatcher, Pelican Diver, Pincushion Urchin, Puffin Diver, Razorbill, Rock Pool Starfish, Sea Turtle Elder, Tide Pool Crab, Tidepool Trapper Crab, Trash Panda Trickster.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 2-B-1 skirmish's deck; 2-B-2 elite's deck; 2-B-3 elite's deck; 2-B-4 elite's deck; reference starter deck under 2-B-1's field; reference deck (Map 7) under 2-B-2's field; expected player deck (expectedPlayerDeck) under 2-B-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | family:flying | big (9 copies at 1+ Lumber, average 0.5); flying x11 | 89% (85%-94%) | 0.45 | 0: 11, 1: 9 | 4x Driftwood Crab, 4x Kittiwake Flock, 4x Pelican Diver, 3x Newt Doctor, 3x Oystercatcher, 2x Conch Herald | 10 |
| 2 | open | swarm (14 copies at 0 Lumber); economy (6 resource makers); flying x10; tide x6 | 87% (82%-92%) | 0.4 | 0: 14, 1: 4, 2: 2 | 4x Conch Herald, 4x Driftwood Crab, 4x Gannet Nestweaver, 4x Kittiwake Flock, 2x Gull Thief, 2x Sea Turtle Elder | 0 |
| 3 | economy | big (8 copies at 1+ Lumber, average 0.4); economy (6 resource makers); flying x10 | 84% (79%-89%) | 0.4 | 0: 12, 1: 8 | 4x Gallery Orb-Weaver, 4x Kittiwake Flock, 4x Pelican Diver, 4x Trash Panda Trickster, 2x Gull Thief, 2x Tidepool Trapper Crab | 14 |
| 4 | family:tide | swarm (16 copies at 0 Lumber); armor x12; tide x12 | 76% (70%-81%) | 0.2 | 0: 16, 1: 4 | 4x Conch Crawler, 4x Conch Herald, 4x Garden Snail, 4x Open-Ocean Hermit Crab, 2x Box Turtle, 2x Nutria Reedcutter | 16 |

## Per opponent

| Deck | fight:2-B-1 | fight:2-B-2 | fight:2-B-3 | fight:2-B-4 | ref:starter | ref:road7 | ref:expected |
|---|---|---|---|---|---|---|---|
| 1 family:flying | 100% | 92% | 96% | 100% | 96% | 71% | 71% |
| 2 open | 100% | 83% | 88% | 96% | 96% | 75% | 71% |
| 3 economy | 96% | 79% | 77% | 100% | 100% | 71% | 67% |
| 4 family:tide | 92% | 88% | 92% | 88% | 88% | 46% | 38% |
