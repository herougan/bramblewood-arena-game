# Focused decks: Map 15 The Long Grass (2026-11-02)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map ml --pool armory,bison-bulldozer,border-collie,carrion-crow,cataphract-destrier,hedge-weasel,hedgehog-herbalist,lodge-engineer,pronghorn-racer,raccoon-bandit,shepherds-bark,squires-mount,stoat-cutthroat,talon-archer,warhorse-charger --max-unique 6 --max-copies 4 --budget 6000 --final-games 24 --seed bpro2 --focus economy,family:strike-first,open --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 6680 games in 92 s.

- The list (15): Armory, Bison Bulldozer, Border Collie, Carrion Crow, Gilded Roadwarden, Hedge Weasel, Hedgehog Herbalist, Lodge Engineer, Pronghorn Racer, Raccoon Bandit, Shepherd, Squire's Mount, Stoat Cutthroat, Talon Archer, Warhorse Charger.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 15-1 skirmish's deck; 15-2 skirmish's deck; 15-3 skirmish's deck; 15-4 skirmish's deck; 15-5 elite's deck; 15-6 elite's deck; 15-7 boss's deck; reference starter deck under 15-1's field; reference deck (Map 15) under 15-2's field; expected player deck (expectedPlayerDeck) under 15-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | open | economy (7 resource makers); flying x6 | 70% (64%-75%) | 0.65 | 0: 7, 1: 13 | 4x Border Collie, 4x Carrion Crow, 4x Shepherd, 3x Raccoon Bandit, 3x Stoat Cutthroat, 2x Talon Archer | 0 |
| 2 | economy | economy (6 resource makers) | 69% (64%-75%) | 0.5 | 0: 10, 1: 10 | 4x Border Collie, 4x Carrion Crow, 4x Hedge Weasel, 3x Hedgehog Herbalist, 3x Stoat Cutthroat, 2x Raccoon Bandit | 7 |
| 3 | family:strike-first | economy (4 resource makers); strike-first x9 | 65% (60%-70%) | 0.9 | 0: 8, 1: 10, 4: 2 | 4x Carrion Crow, 4x Hedge Weasel, 4x Pronghorn Racer, 3x Squire's Mount, 3x Stoat Cutthroat, 2x Gilded Roadwarden | 13 |

## Per opponent

| Deck | fight:15-1 | fight:15-2 | fight:15-3 | fight:15-4 | fight:15-5 | fight:15-6 | fight:15-7 | ref:starter | ref:road15 | ref:expected |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 open | 100% | 67% | 58% | 79% | 50% | 71% | 63% | 96% | 25% | 88% |
| 2 economy | 100% | 79% | 46% | 75% | 63% | 63% | 58% | 100% | 46% | 63% |
| 3 family:strike-first | 100% | 71% | 71% | 83% | 54% | 63% | 38% | 79% | 21% | 71% |
