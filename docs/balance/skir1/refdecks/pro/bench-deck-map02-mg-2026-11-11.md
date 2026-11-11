# Focused decks: Map 2 Smugglers' Grotto (2026-11-10)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map mg --pool alley-cat,bee-forager,bloodworm,coffer-mimic,gannet-nestweaver,glow-worm,grey-seal-bull,gull-thief,kittiwake-flock,limpet-clinger,moray-ambusher,mudpuppy,muskrat-lodgekeeper,newt-doctor,nutria-reedcutter,octopus-tactician,old-shell,old-sturgeon,pincushion-urchin,planarian-splitter,puffin-diver,raccoon-nightcrew,rock-pool-starfish,salvager-hermit-crab,signal-crayfish,smuggler-slingrat,tide-pool-crab,trash-panda-trickster --max-unique 6 --max-copies 4 --budget 1200 --final-games 24 --seed skir1-pro --focus economy,family:tide,family:armor,open --anchor bloodworm,coffer-mimic,glow-worm,grey-seal-bull,gull-thief,limpet-clinger,moray-ambusher,octopus-tactician,old-shell,pincushion-urchin,raccoon-nightcrew,rock-pool-starfish,salvager-hermit-crab,smuggler-slingrat,tide-pool-crab,trash-panda-trickster --anchor-min 10 --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 1946 games in 586 s.

- The list (28): Alley Cat, Bee Forager, Bloodworm, Coffer Mimic, Gannet Nestweaver, Glow-worm, Grey Seal Bull, Gull Thief, Kittiwake Flock, Limpet Clinger, Moray Ambusher, Mudpuppy, Muskrat Lodgekeeper, Newt Doctor, Nutria Reedcutter, Octopus Tactician, The Old Shell, Old Sturgeon, Pincushion Urchin, Planarian Splitter, Puffin Diver, Raccoon Nightcrew, Rock Pool Starfish, Salvager Hermit Crab, Signal Crayfish, Smuggler Slingrat, Tide Pool Crab, Trash Panda Trickster.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 2-B-1 skirmish's deck; 2-B-2 elite's deck; 2-B-3 elite's deck; 2-B-4 elite's deck; reference starter deck under 2-B-1's field; reference deck (Map 7) under 2-B-2's field; expected player deck (expectedPlayerDeck) under 2-B-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | family:tide | swarm (16 copies at 0 Lumber); economy (4 resource makers); tide x8 | 71% (65%-77%) | 0.2 | 0: 16, 1: 4 | 4x Glow-worm, 4x Newt Doctor, 4x Old Sturgeon, 4x Pincushion Urchin, 4x Trash Panda Trickster | 16 |
| 2 | economy | big (8 copies at 1+ Lumber, average 0.4); economy (9 resource makers); night x8 | 70% (63%-76%) | 0.4 | 0: 12, 1: 8 | 4x Old Sturgeon, 4x Raccoon Nightcrew, 4x Trash Panda Trickster, 3x Alley Cat, 3x Gannet Nestweaver, 2x Salvager Hermit Crab | 17 |
| 3 | open | big (12 copies at 1+ Lumber, average 0.6); tide x8 | 64% (57%-70%) | 0.6 | 0: 8, 1: 12 | 4x Alley Cat, 4x Coffer Mimic, 4x Glow-worm, 4x Moray Ambusher, 4x Muskrat Lodgekeeper | 0 |
| 4 | family:armor | big (11 copies at 1+ Lumber, average 0.6); tide x15; armor x8 | 41% (34%-48%) | 0.55 | 0: 9, 1: 11 | 4x Limpet Clinger, 4x Moray Ambusher, 4x Mudpuppy, 4x Old Sturgeon, 3x Grey Seal Bull, 1x Newt Doctor | 16 |

## Per opponent

| Deck | fight:2-B-1 | fight:2-B-2 | fight:2-B-3 | fight:2-B-4 | ref:starter | ref:road7 | ref:expected |
|---|---|---|---|---|---|---|---|
| 1 family:tide | 88% | 75% | 38% | 96% | 100% | 33% | 67% |
| 2 economy | 88% | 79% | 38% | 75% | 96% | 38% | 75% |
| 3 open | 92% | 83% | 33% | 75% | 83% | 21% | 58% |
| 4 family:armor | 54% | 63% | 8% | 38% | 63% | 13% | 50% |
