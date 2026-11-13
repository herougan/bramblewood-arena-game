# Focused decks: Map 2 Smugglers' Grotto (2026-11-12)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map mg --pool driftwood-crab,gull-thief,limpet-clinger,octopus-tactician,old-shell,open-ocean-hermit-crab,pincushion-urchin,raccoon-nightcrew,rock-pool-starfish,salvager-hermit-crab --max-unique 6 --max-copies 4 --budget 6000 --final-games 24 --seed skir1-bpro --focus economy,family:tide,family:armor,open --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 6706 games in 181 s.

- The list (10): Driftwood Crab, Gull Thief, Limpet Clinger, Octopus Tactician, The Old Shell, Open-Ocean Hermit Crab, Pincushion Urchin, Raccoon Nightcrew, Rock Pool Starfish, Salvager Hermit Crab.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 2-B-1 skirmish's deck; 2-B-2 elite's deck; 2-B-3 elite's deck; 2-B-4 elite's deck; reference starter deck under 2-B-1's field; reference deck (Map 7) under 2-B-2's field; expected player deck (expectedPlayerDeck) under 2-B-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | economy | big (10 copies at 1+ Lumber, average 0.7); economy (6 resource makers); tide x10 | 66% (60%-72%) | 0.7 | 0: 10, 1: 6, 2: 4 | 4x Gull Thief, 4x Octopus Tactician, 4x Pincushion Urchin, 4x Raccoon Nightcrew, 2x Driftwood Crab, 2x Limpet Clinger | 12 |
| 2 | open | big (8 copies at 1+ Lumber, average 0.4); economy (7 resource makers); tide x8; armor x6 | 65% (60%-71%) | 0.4 | 0: 12, 1: 8 | 4x Pincushion Urchin, 4x Rock Pool Starfish, 4x Salvager Hermit Crab, 3x Driftwood Crab, 3x The Old Shell, 2x Raccoon Nightcrew | 0 |
| 3 | family:tide | big (11 copies at 1+ Lumber, average 0.6); armor x15; tide x9 | 64% (58%-70%) | 0.55 | 0: 9, 1: 11 | 4x Limpet Clinger, 4x The Old Shell, 4x Open-Ocean Hermit Crab, 4x Raccoon Nightcrew, 3x Driftwood Crab, 1x Pincushion Urchin | 11 |
| 4 | family:armor | big (11 copies at 1+ Lumber, average 0.8); economy (5 resource makers); tide x12; armor x8 | 59% (53%-65%) | 0.75 | 0: 9, 1: 7, 2: 4 | 4x Driftwood Crab, 4x Octopus Tactician, 4x Open-Ocean Hermit Crab, 4x Rock Pool Starfish, 3x Raccoon Nightcrew, 1x Gull Thief | 11 |

## Per opponent

| Deck | fight:2-B-1 | fight:2-B-2 | fight:2-B-3 | fight:2-B-4 | ref:starter | ref:road7 | ref:expected |
|---|---|---|---|---|---|---|---|
| 1 economy | 75% | 96% | 75% | 33% | 92% | 29% | 63% |
| 2 open | 92% | 83% | 71% | 38% | 92% | 13% | 71% |
| 3 family:tide | 92% | 88% | 63% | 29% | 96% | 21% | 63% |
| 4 family:armor | 75% | 79% | 46% | 33% | 100% | 17% | 63% |
