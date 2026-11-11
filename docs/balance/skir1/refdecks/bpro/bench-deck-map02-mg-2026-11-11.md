# Focused decks: Map 2 Smugglers' Grotto (2026-11-10)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map mg --pool bloodworm,coffer-mimic,glow-worm,grey-seal-bull,gull-thief,limpet-clinger,moray-ambusher,octopus-tactician,old-shell,pincushion-urchin,raccoon-nightcrew,rock-pool-starfish,salvager-hermit-crab,smuggler-slingrat,tide-pool-crab,trash-panda-trickster --max-unique 6 --max-copies 4 --budget 1500 --final-games 24 --seed skir1-bpro --focus economy,family:tide,family:armor,open --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 2324 games in 548 s.

- The list (16): Bloodworm, Coffer Mimic, Glow-worm, Grey Seal Bull, Gull Thief, Limpet Clinger, Moray Ambusher, Octopus Tactician, The Old Shell, Pincushion Urchin, Raccoon Nightcrew, Rock Pool Starfish, Salvager Hermit Crab, Smuggler Slingrat, Tide Pool Crab, Trash Panda Trickster.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 2-B-1 skirmish's deck; 2-B-2 elite's deck; 2-B-3 elite's deck; 2-B-4 elite's deck; reference starter deck under 2-B-1's field; reference deck (Map 7) under 2-B-2's field; expected player deck (expectedPlayerDeck) under 2-B-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | family:armor | big (12 copies at 1+ Lumber, average 0.6); armor x8; evasion x8 | 82% (77%-87%) | 0.6 | 0: 8, 1: 12 | 4x Limpet Clinger, 4x The Old Shell, 4x Raccoon Nightcrew, 4x Smuggler Slingrat, 2x Glow-worm, 2x Trash Panda Trickster | 18 |
| 2 | economy | swarm (14 copies at 0 Lumber); economy (12 resource makers); evasion x6; night x6 | 71% (65%-77%) | 0.3 | 0: 14, 1: 6 | 4x Gull Thief, 4x Salvager Hermit Crab, 4x Smuggler Slingrat, 4x Trash Panda Trickster, 2x Bloodworm, 2x Raccoon Nightcrew | 13 |
| 3 | family:tide | swarm (18 copies at 0 Lumber); economy (8 resource makers); armor x10; tide x8 | 71% (65%-77%) | 0.1 | 0: 18, 1: 2 | 4x Gull Thief, 4x Limpet Clinger, 4x Tide Pool Crab, 4x Trash Panda Trickster, 2x Glow-worm, 2x The Old Shell | 17 |
| 4 | open | swarm (16 copies at 0 Lumber); economy (5 resource makers); tide x8 | 70% (64%-76%) | 0.4 | 0: 16, 2: 4 | 4x Glow-worm, 4x Octopus Tactician, 4x Pincushion Urchin, 4x Salvager Hermit Crab, 3x Bloodworm, 1x Gull Thief | 0 |

## Per opponent

| Deck | fight:2-B-1 | fight:2-B-2 | fight:2-B-3 | fight:2-B-4 | ref:starter | ref:road7 | ref:expected |
|---|---|---|---|---|---|---|---|
| 1 family:armor | 100% | 88% | 90% | 96% | 92% | 42% | 67% |
| 2 economy | 100% | 67% | 92% | 50% | 92% | 33% | 63% |
| 3 family:tide | 100% | 67% | 75% | 75% | 96% | 17% | 67% |
| 4 open | 88% | 67% | 79% | 83% | 96% | 17% | 63% |
