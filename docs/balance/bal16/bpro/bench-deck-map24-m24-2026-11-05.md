# Focused decks: Map 24 Goldfeather Keep (2026-11-05)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map m24 --pool acacia-giraffe,alley-cat,badger-trench-digger,balloon-archer,battlement-heron,beetle-battering-ram,border-collie,duckling-squadron,elderhorn-monarch,gilded-swan-knight,howdah-archers,iron-warden,land-tiller,lodge-engineer,magnate-duck,mallard-halberdier,ore-smelter-mole,raccoon-bandit,siege-rhino,stoat-cutthroat,tax-collector-teal,testudo-tortoise --max-unique 6 --max-copies 4 --budget 6000 --final-games 24 --seed bal16-bpro --focus economy,family:cleave,swarm,open --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 7238 games in 103 s.

- The list (22): Acacia Giraffe, Alley Cat, Badger Trench Digger, Balloon Archer, Battlement Heron, Beetle Battering-Ram, Border Collie, Duckling Squadron, Elderhorn Monarch, Gilded Swan Knight, Howdah Archers, Iron Badger, Land Tiller, Lodge Engineer, The Magnate Duck, Mallard Halberdier, Ore-Smelter Mole, Raccoon Bandit, Siege Rhino, Stoat Cutthroat, Tax-Collector Teal, Testudo Tortoise.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 24-1 skirmish's deck; 24-2 skirmish's deck; 24-3 skirmish's deck; 24-4 skirmish's deck; 24-5 skirmish's deck; 24-6 elite's deck; 24-7 elite's deck; 24-8 miniboss's deck; reference starter deck under 24-1's field; reference deck (Map 24) under 24-2's field; expected player deck (expectedPlayerDeck) under 24-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | family:cleave | economy (4 resource makers); cleave x8; ranged x6 | 78% (74%-83%) | 0.4 | 0: 12, 1: 8 | 4x Alley Cat, 4x Land Tiller, 4x Tax-Collector Teal, 3x Battlement Heron, 3x Howdah Archers, 2x Siege Rhino | 10 |
| 2 | open | ranged x6 | 73% (69%-78%) | 1 | 0: 7, 1: 6, 2: 7 | 4x Acacia Giraffe, 4x Land Tiller, 3x Battlement Heron, 3x Howdah Archers, 3x Raccoon Bandit, 3x Testudo Tortoise | 0 |
| 3 | swarm | swarm (15 copies at 0 Lumber); economy (7 resource makers); flying x11; economy x7 | 69% (64%-74%) | 0.25 | 0: 15, 1: 5 | 4x Duckling Squadron, 4x Land Tiller, 4x Tax-Collector Teal, 3x Balloon Archer, 3x Raccoon Bandit, 2x Border Collie | 13 |
| 4 | economy | economy (11 resource makers); flying x8; economy x7 | 69% (64%-74%) | 0.65 | 0: 7, 1: 13 | 4x Balloon Archer, 4x Ore-Smelter Mole, 4x Tax-Collector Teal, 3x Mallard Halberdier, 3x Raccoon Bandit, 2x Howdah Archers | 15 |

## Per opponent

| Deck | fight:24-1 | fight:24-2 | fight:24-3 | fight:24-4 | fight:24-5 | fight:24-6 | fight:24-7 | fight:24-8 | ref:starter | ref:road24 | ref:expected |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 family:cleave | 100% | 96% | 100% | 92% | 71% | 63% | 71% | 46% | 96% | 63% | 67% |
| 2 open | 100% | 96% | 92% | 83% | 63% | 63% | 67% | 46% | 100% | 33% | 67% |
| 3 swarm | 96% | 92% | 92% | 71% | 42% | 79% | 50% | 50% | 92% | 42% | 58% |
| 4 economy | 100% | 100% | 88% | 71% | 46% | 63% | 38% | 46% | 96% | 42% | 71% |
