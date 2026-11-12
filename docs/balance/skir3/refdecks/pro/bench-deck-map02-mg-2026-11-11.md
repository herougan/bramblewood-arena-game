# Focused decks: Map 2 Smugglers' Grotto (2026-11-12)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map mg --pool alley-cat,bee-forager,glow-worm,gull-thief,kittiwake-flock,limpet-clinger,mudpuppy,newt-doctor,nutria-reedcutter,old-shell,old-sturgeon,oystercatcher,pincushion-urchin,planarian-splitter,puffin-diver,razorbill,rock-pool-starfish,salvager-hermit-crab,the-gannet-queen,trash-panda-trickster --max-unique 6 --max-copies 4 --budget 8000 --final-games 24 --seed skir1-pro --focus economy,family:flying,family:tide,open --anchor glow-worm,gull-thief,limpet-clinger,old-shell,pincushion-urchin,rock-pool-starfish,salvager-hermit-crab,trash-panda-trickster --anchor-min 10 --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 8820 games in 185 s.

- The list (20): Alley Cat, Bee Forager, Glow-worm, Gull Thief, Kittiwake Flock, Limpet Clinger, Mudpuppy, Newt Doctor, Nutria Reedcutter, The Old Shell, Old Sturgeon, Oystercatcher, Pincushion Urchin, Planarian Splitter, Puffin Diver, Razorbill, Rock Pool Starfish, Salvager Hermit Crab, The Gannet Queen, Trash Panda Trickster.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 2-B-1 skirmish's deck; 2-B-2 elite's deck; 2-B-3 elite's deck; 2-B-4 elite's deck; reference starter deck under 2-B-1's field; reference deck (Map 7) under 2-B-2's field; expected player deck (expectedPlayerDeck) under 2-B-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | economy | swarm (18 copies at 0 Lumber); economy (7 resource makers); flying x9; tide x7 | 79% (74%-85%) | 0.1 | 0: 18, 1: 2 | 4x Kittiwake Flock, 4x Pincushion Urchin, 4x Salvager Hermit Crab, 3x Gull Thief, 3x Rock Pool Starfish, 2x Razorbill | 13 |
| 2 | open | big (8 copies at 1+ Lumber, average 0.4); flying x6 | 79% (74%-84%) | 0.4 | 0: 12, 1: 8 | 4x Glow-worm, 4x Planarian Splitter, 4x Razorbill, 3x Pincushion Urchin, 3x Trash Panda Trickster, 2x Kittiwake Flock | 0 |
| 3 | family:tide | swarm (17 copies at 0 Lumber); economy (4 resource makers); tide x8; flying x8 | 73% (67%-79%) | 0.15 | 0: 17, 1: 3 | 4x Glow-worm, 4x Gull Thief, 4x Kittiwake Flock, 3x Old Sturgeon, 3x Rock Pool Starfish, 2x Limpet Clinger | 14 |
| 4 | family:flying | swarm (17 copies at 0 Lumber); economy (8 resource makers); flying x8 | 70% (64%-76%) | 0.15 | 0: 17, 1: 3 | 4x Gull Thief, 4x Kittiwake Flock, 4x Trash Panda Trickster, 3x Nutria Reedcutter, 3x Planarian Splitter, 2x Pincushion Urchin | 10 |

## Per opponent

| Deck | fight:2-B-1 | fight:2-B-2 | fight:2-B-3 | fight:2-B-4 | ref:starter | ref:road7 | ref:expected |
|---|---|---|---|---|---|---|---|
| 1 economy | 96% | 96% | 79% | 50% | 100% | 58% | 75% |
| 2 open | 92% | 96% | 88% | 63% | 100% | 33% | 83% |
| 3 family:tide | 96% | 88% | 75% | 50% | 100% | 33% | 71% |
| 4 family:flying | 92% | 83% | 50% | 58% | 100% | 25% | 79% |
