# Focused decks: Map 2 Smugglers' Grotto (2026-11-13)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map mg --pool alley-cat,bee-forager,driftwood-crab,gull-thief,kittiwake-flock,limpet-clinger,mudpuppy,muskrat-lodgekeeper,newt-doctor,nutria-reedcutter,octopus-tactician,old-shell,old-sturgeon,open-ocean-hermit-crab,pincushion-urchin,planarian-splitter,puffin-diver,raccoon-nightcrew,razorbill,rock-pool-starfish,the-gannet-queen,trash-panda-trickster --max-unique 6 --max-copies 4 --budget 8000 --final-games 24 --seed skir1-pro --focus economy,family:tide,family:flying,open --anchor driftwood-crab,gull-thief,limpet-clinger,octopus-tactician,old-shell,open-ocean-hermit-crab,pincushion-urchin,raccoon-nightcrew,rock-pool-starfish,trash-panda-trickster --anchor-min 10 --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 8708 games in 109 s.

- The list (22): Alley Cat, Bee Forager, Driftwood Crab, Gull Thief, Kittiwake Flock, Limpet Clinger, Mudpuppy, Muskrat Lodgekeeper, Newt Doctor, Nutria Reedcutter, Octopus Tactician, The Old Shell, Old Sturgeon, Open-Ocean Hermit Crab, Pincushion Urchin, Planarian Splitter, Puffin Diver, Raccoon Nightcrew, Razorbill, Rock Pool Starfish, The Gannet Queen, Trash Panda Trickster.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 2-B-1 skirmish's deck; 2-B-2 elite's deck; 2-B-3 elite's deck; 2-B-4 elite's deck; reference starter deck under 2-B-1's field; reference deck (Map 7) under 2-B-2's field; expected player deck (expectedPlayerDeck) under 2-B-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | economy | big (10 copies at 1+ Lumber, average 0.5); economy (6 resource makers); flying x12 | 80% (74%-86%) | 0.5 | 0: 10, 1: 10 | 4x Gull Thief, 4x Kittiwake Flock, 4x Raccoon Nightcrew, 4x Razorbill, 2x Driftwood Crab, 2x Pincushion Urchin | 10 |
| 2 | family:flying | swarm (14 copies at 0 Lumber); economy (6 resource makers); flying x10; night x8 | 76% (70%-82%) | 0.3 | 0: 14, 1: 6 | 4x Bee Forager, 4x Kittiwake Flock, 4x Raccoon Nightcrew, 4x Trash Panda Trickster, 2x Gull Thief, 2x Planarian Splitter | 13 |
| 3 | open | big (9 copies at 1+ Lumber, average 0.5); economy (7 resource makers); flying x8 | 76% (69%-82%) | 0.45 | 0: 11, 1: 9 | 4x Driftwood Crab, 4x Kittiwake Flock, 4x Razorbill, 4x Rock Pool Starfish, 3x Trash Panda Trickster, 1x The Old Shell | 0 |
| 4 | family:tide | swarm (17 copies at 0 Lumber); tide x11 | 68% (62%-74%) | 0.15 | 0: 17, 1: 3 | 4x Limpet Clinger, 4x Newt Doctor, 4x Rock Pool Starfish, 3x Pincushion Urchin, 3x Raccoon Nightcrew, 2x Alley Cat | 16 |

## Per opponent

| Deck | fight:2-B-1 | fight:2-B-2 | fight:2-B-3 | fight:2-B-4 | ref:starter | ref:road7 | ref:expected |
|---|---|---|---|---|---|---|---|
| 1 economy | 88% | 83% | 79% | 83% | 92% | 50% | 83% |
| 2 family:flying | 83% | 75% | 83% | 79% | 96% | 33% | 83% |
| 3 open | 71% | 54% | 79% | 75% | 100% | 63% | 88% |
| 4 family:tide | 79% | 75% | 71% | 67% | 83% | 17% | 83% |
