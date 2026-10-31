# Focused decks: Map 15 The Long Grass (2026-10-31)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map ml --pool bison-bulldozer,border-collie,carrion-crow,cataphract-destrier,hedge-weasel,hedgehog-herbalist,lodge-engineer,pronghorn-racer,raccoon-bandit,shepherds-bark,squires-mount,stable-colt,stoat-cutthroat,talon-archer,warhorse-charger --max-unique 6 --max-copies 4 --budget 6000 --final-games 24 --seed bpro2 --focus economy,swarm,family:strike-first,open --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 7080 games in 97 s.

- The list (15): Bison Bulldozer, Border Collie, Carrion Crow, Gilded Roadwarden, Hedge Weasel, Hedgehog Herbalist, Lodge Engineer, Pronghorn Racer, Raccoon Bandit, Shepherd, Squire's Mount, Stable Colt, Stoat Cutthroat, Talon Archer, Warhorse Charger.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 15-1 skirmish's deck; 15-2 skirmish's deck; 15-3 skirmish's deck; 15-4 skirmish's deck; 15-5 elite's deck; 15-6 elite's deck; 15-7 boss's deck; reference starter deck under 15-1's field; reference deck (Map 15) under 15-2's field; expected player deck (expectedPlayerDeck) under 15-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | open | midrange (average 0.7 Lumber) | 81% (77%-86%) | 0.65 | 0: 7, 1: 13 | 4x Shepherd, 4x Stable Colt, 3x Hedgehog Herbalist, 3x Raccoon Bandit, 3x Squire's Mount, 3x Stoat Cutthroat | 0 |
| 2 | swarm | swarm (14 copies at 0 Lumber); economy (6 resource makers) | 75% (70%-80%) | 0.3 | 0: 14, 1: 6 | 4x Hedge Weasel, 4x Stable Colt, 3x Carrion Crow, 3x Hedgehog Herbalist, 3x Raccoon Bandit, 3x Squire's Mount | 7 |
| 3 | economy | economy (6 resource makers) | 70% (65%-76%) | 0.5 | 0: 10, 1: 10 | 4x Bison Bulldozer, 4x Carrion Crow, 4x Stable Colt, 3x Border Collie, 3x Hedgehog Herbalist, 2x Raccoon Bandit | 11 |
| 4 | family:strike-first | strike-first x9 | 63% (57%-68%) | 1.1 | 0: 4, 1: 14, 4: 2 | 4x Border Collie, 4x Pronghorn Racer, 4x Stable Colt, 3x Squire's Mount, 3x Stoat Cutthroat, 2x Gilded Roadwarden | 10 |

## Per opponent

| Deck | fight:15-1 | fight:15-2 | fight:15-3 | fight:15-4 | fight:15-5 | fight:15-6 | fight:15-7 | ref:starter | ref:road15 | ref:expected |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 open | 100% | 92% | 71% | 71% | 79% | 88% | 63% | 96% | 58% | 96% |
| 2 swarm | 100% | 75% | 67% | 79% | 71% | 75% | 42% | 100% | 50% | 92% |
| 3 economy | 100% | 83% | 58% | 46% | 71% | 75% | 46% | 96% | 50% | 79% |
| 4 family:strike-first | 100% | 54% | 58% | 50% | 71% | 71% | 33% | 92% | 29% | 71% |
