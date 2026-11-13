# Focused decks: Map 2 Smugglers' Grotto (2026-11-13)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map mg --pool alley-cat,bee-forager,driftwood-crab,gull-thief,kittiwake-flock,limpet-clinger,mudpuppy,muskrat-lodgekeeper,newt-doctor,nutria-reedcutter,octopus-tactician,old-shell,open-ocean-hermit-crab,oystercatcher,pincushion-urchin,planarian-splitter,puffin-diver,raccoon-nightcrew,razorbill,rock-pool-starfish,salvager-hermit-crab,the-gannet-queen --max-unique 6 --max-copies 4 --budget 8000 --final-games 24 --seed skir1-pro --focus economy,family:flying,family:tide,open --anchor driftwood-crab,gull-thief,limpet-clinger,octopus-tactician,old-shell,open-ocean-hermit-crab,pincushion-urchin,raccoon-nightcrew,rock-pool-starfish,salvager-hermit-crab --anchor-min 10 --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 8820 games in 276 s.

- The list (22): Alley Cat, Bee Forager, Driftwood Crab, Gull Thief, Kittiwake Flock, Limpet Clinger, Mudpuppy, Muskrat Lodgekeeper, Newt Doctor, Nutria Reedcutter, Octopus Tactician, The Old Shell, Open-Ocean Hermit Crab, Oystercatcher, Pincushion Urchin, Planarian Splitter, Puffin Diver, Raccoon Nightcrew, Razorbill, Rock Pool Starfish, Salvager Hermit Crab, The Gannet Queen.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 2-B-1 skirmish's deck; 2-B-2 elite's deck; 2-B-3 elite's deck; 2-B-4 elite's deck; reference starter deck under 2-B-1's field; reference deck (Map 7) under 2-B-2's field; expected player deck (expectedPlayerDeck) under 2-B-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | family:flying | big (8 copies at 1+ Lumber, average 0.4); economy (7 resource makers); flying x9 | 80% (74%-85%) | 0.4 | 0: 12, 1: 8 | 4x Driftwood Crab, 4x Kittiwake Flock, 4x Raccoon Nightcrew, 3x Gull Thief, 3x Nutria Reedcutter, 2x Bee Forager | 13 |
| 2 | economy | economy (6 resource makers) | 77% (72%-83%) | 0.35 | 0: 13, 1: 7 | 4x Driftwood Crab, 4x Kittiwake Flock, 4x Rock Pool Starfish, 3x Alley Cat, 3x Planarian Splitter, 2x Salvager Hermit Crab | 13 |
| 3 | open | big (9 copies at 1+ Lumber, average 0.5); heal x7; tide x6 | 74% (69%-79%) | 0.45 | 0: 11, 1: 9 | 4x Newt Doctor, 4x Raccoon Nightcrew, 4x Rock Pool Starfish, 3x Driftwood Crab, 3x Mudpuppy, 2x Muskrat Lodgekeeper | 0 |
| 4 | family:tide | tide x11; flying x8 | 64% (58%-71%) | 0.35 | 0: 13, 1: 7 | 4x Kittiwake Flock, 4x Pincushion Urchin, 4x Puffin Diver, 3x Driftwood Crab, 3x Limpet Clinger, 2x Mudpuppy | 15 |

## Per opponent

| Deck | fight:2-B-1 | fight:2-B-2 | fight:2-B-3 | fight:2-B-4 | ref:starter | ref:road7 | ref:expected |
|---|---|---|---|---|---|---|---|
| 1 family:flying | 96% | 92% | 71% | 54% | 100% | 54% | 92% |
| 2 economy | 96% | 96% | 71% | 50% | 100% | 42% | 88% |
| 3 open | 96% | 92% | 88% | 42% | 100% | 21% | 83% |
| 4 family:tide | 83% | 75% | 75% | 29% | 92% | 25% | 71% |
