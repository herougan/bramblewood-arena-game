# Focused decks: Map 2 Smugglers' Grotto (2026-11-13)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map mg --pool driftwood-crab,gull-thief,limpet-clinger,octopus-tactician,old-shell,open-ocean-hermit-crab,pincushion-urchin,raccoon-nightcrew,rock-pool-starfish,trash-panda-trickster --max-unique 6 --max-copies 4 --budget 6000 --final-games 24 --seed skir1-bpro --focus economy,family:tide,family:armor,open --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 6678 games in 119 s.

- The list (10): Driftwood Crab, Gull Thief, Limpet Clinger, Octopus Tactician, The Old Shell, Open-Ocean Hermit Crab, Pincushion Urchin, Raccoon Nightcrew, Rock Pool Starfish, Trash Panda Trickster.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 2-B-1 skirmish's deck; 2-B-2 elite's deck; 2-B-3 elite's deck; 2-B-4 elite's deck; reference starter deck under 2-B-1's field; reference deck (Map 7) under 2-B-2's field; expected player deck (expectedPlayerDeck) under 2-B-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | economy | big (11 copies at 1+ Lumber, average 0.7); economy (8 resource makers); tide x8; night x8 | 82% (77%-88%) | 0.7 | 0: 9, 1: 8, 2: 3 | 4x Driftwood Crab, 4x Pincushion Urchin, 4x Raccoon Nightcrew, 4x Trash Panda Trickster, 3x Octopus Tactician, 1x Rock Pool Starfish | 10 |
| 2 | family:armor | economy (8 resource makers); armor x8; night x8 | 68% (62%-75%) | 0.35 | 0: 13, 1: 7 | 4x Gull Thief, 4x Limpet Clinger, 4x Raccoon Nightcrew, 4x Trash Panda Trickster, 3x The Old Shell, 1x Open-Ocean Hermit Crab | 10 |
| 3 | family:tide | big (12 copies at 1+ Lumber, average 0.8); armor x12; tide x12 | 61% (54%-68%) | 0.8 | 0: 8, 1: 8, 2: 4 | 4x Limpet Clinger, 4x Octopus Tactician, 4x Open-Ocean Hermit Crab, 4x Raccoon Nightcrew, 3x Driftwood Crab, 1x The Old Shell | 15 |
| 4 | open | swarm (15 copies at 0 Lumber); economy (4 resource makers); tide x12; armor x7 | 50% (43%-57%) | 0.3 | 0: 15, 1: 4, 2: 1 | 4x The Old Shell, 4x Pincushion Urchin, 4x Rock Pool Starfish, 4x Trash Panda Trickster, 3x Limpet Clinger, 1x Octopus Tactician | 0 |

## Per opponent

| Deck | fight:2-B-1 | fight:2-B-2 | fight:2-B-3 | fight:2-B-4 | ref:starter | ref:road7 | ref:expected |
|---|---|---|---|---|---|---|---|
| 1 economy | 92% | 79% | 83% | 75% | 100% | 54% | 92% |
| 2 family:armor | 67% | 67% | 67% | 67% | 92% | 42% | 79% |
| 3 family:tide | 71% | 63% | 63% | 50% | 88% | 25% | 71% |
| 4 open | 58% | 25% | 54% | 38% | 92% | 21% | 63% |
