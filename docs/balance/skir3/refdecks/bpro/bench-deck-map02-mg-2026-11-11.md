# Focused decks: Map 2 Smugglers' Grotto (2026-11-12)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map mg --pool glow-worm,gull-thief,limpet-clinger,old-shell,pincushion-urchin,rock-pool-starfish,salvager-hermit-crab,trash-panda-trickster --max-unique 6 --max-copies 4 --budget 6000 --final-games 24 --seed skir1-bpro --focus economy,family:tide,family:armor,open --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 6860 games in 177 s.

- The list (8): Glow-worm, Gull Thief, Limpet Clinger, The Old Shell, Pincushion Urchin, Rock Pool Starfish, Salvager Hermit Crab, Trash Panda Trickster.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 2-B-1 skirmish's deck; 2-B-2 elite's deck; 2-B-3 elite's deck; 2-B-4 elite's deck; reference starter deck under 2-B-1's field; reference deck (Map 7) under 2-B-2's field; expected player deck (expectedPlayerDeck) under 2-B-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | economy | swarm (16 copies at 0 Lumber); economy (12 resource makers) | 76% (71%-82%) | 0.2 | 0: 16, 1: 4 | 4x Glow-worm, 4x Gull Thief, 4x The Old Shell, 4x Salvager Hermit Crab, 4x Trash Panda Trickster | 8 |
| 2 | open | swarm (16 copies at 0 Lumber); economy (4 resource makers); tide x8 | 76% (70%-82%) | 0.2 | 0: 16, 1: 4 | 4x Glow-worm, 4x The Old Shell, 4x Pincushion Urchin, 4x Rock Pool Starfish, 4x Trash Panda Trickster | 0 |
| 3 | family:armor | swarm (16 copies at 0 Lumber); economy (5 resource makers); armor x8; tide x7 | 73% (66%-79%) | 0.2 | 0: 16, 1: 4 | 4x Glow-worm, 4x Limpet Clinger, 4x The Old Shell, 3x Pincushion Urchin, 3x Trash Panda Trickster, 2x Gull Thief | 6 |
| 4 | family:tide | swarm (16 copies at 0 Lumber); tide x10; armor x8 | 65% (60%-71%) | 0.2 | 0: 16, 1: 4 | 4x Limpet Clinger, 4x The Old Shell, 4x Rock Pool Starfish, 3x Glow-worm, 3x Trash Panda Trickster, 2x Pincushion Urchin | 4 |

## Per opponent

| Deck | fight:2-B-1 | fight:2-B-2 | fight:2-B-3 | fight:2-B-4 | ref:starter | ref:road7 | ref:expected |
|---|---|---|---|---|---|---|---|
| 1 economy | 96% | 92% | 75% | 63% | 100% | 33% | 75% |
| 2 open | 96% | 83% | 71% | 71% | 100% | 38% | 75% |
| 3 family:armor | 92% | 88% | 71% | 71% | 83% | 42% | 63% |
| 4 family:tide | 92% | 92% | 54% | 46% | 96% | 13% | 67% |
