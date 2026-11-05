# Focused decks: Map 24 Goldfeather Keep (2026-11-05)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map m24 --pool acacia-giraffe,alley-cat,ashbone-ghoul,badger-berserker,badger-trench-digger,balloon-archer,battlement-heron,beetle-battering-ram,border-collie,duckling-squadron,eagle-owl-quartermaster,elderhorn-monarch,gilded-swan-knight,grave-grin-hyena,house-cat,howdah-archers,iron-warden,land-tiller,lodge-engineer,magnate-duck,mallard-halberdier,marula-elephant,meerkat-burrower,ore-smelter-mole,pangolin-roller,raccoon-bandit,siege-rhino,spitting-cobra,stoat-cutthroat,tax-collector-teal,testudo-tortoise,tide-spirit,war-elephant,wolf-spider-mother --max-unique 6 --max-copies 4 --budget 6000 --final-games 24 --seed bal16-pro --focus economy,family:ranged,family:armor,open --anchor acacia-giraffe,alley-cat,badger-trench-digger,balloon-archer,battlement-heron,beetle-battering-ram,border-collie,duckling-squadron,elderhorn-monarch,gilded-swan-knight,howdah-archers,iron-warden,land-tiller,lodge-engineer,magnate-duck,mallard-halberdier,ore-smelter-mole,raccoon-bandit,siege-rhino,stoat-cutthroat,tax-collector-teal,testudo-tortoise --anchor-min 10 --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 5808 games in 82 s.

- The list (34): Acacia Giraffe, Alley Cat, Ashbone Ghoul, Badger Berserker, Badger Trench Digger, Balloon Archer, Battlement Heron, Beetle Battering-Ram, Border Collie, Duckling Squadron, Eagle-Owl Quartermaster, Elderhorn Monarch, Gilded Swan Knight, Grave-Grin Hyena, House Cat, Howdah Archers, Iron Badger, Land Tiller, Lodge Engineer, The Magnate Duck, Mallard Halberdier, Marula Elephant, Meerkat Burrower, Ore-Smelter Mole, Pangolin Roller, Raccoon Bandit, Siege Rhino, Spitting Cobra, Stoat Cutthroat, Tax-Collector Teal, Testudo Tortoise, Tide Seahorse, War Elephant, Wolf Spider Mother.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 24-1 skirmish's deck; 24-2 skirmish's deck; 24-3 skirmish's deck; 24-4 skirmish's deck; 24-5 skirmish's deck; 24-6 elite's deck; 24-7 elite's deck; 24-8 miniboss's deck; reference starter deck under 24-1's field; reference deck (Map 24) under 24-2's field; expected player deck (expectedPlayerDeck) under 24-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | economy | economy (7 resource makers); economy x7 | 83% (79%-88%) | 0.45 | 0: 11, 1: 9 | 4x House Cat, 4x Tax-Collector Teal, 3x Badger Berserker, 3x Howdah Archers, 3x Raccoon Bandit, 3x Stoat Cutthroat | 12 |
| 2 | family:ranged | ranged x9 | 82% (78%-86%) | 0.6 | 0: 8, 1: 12 | 4x Grave-Grin Hyena, 4x Land Tiller, 3x Battlement Heron, 3x Eagle-Owl Quartermaster, 3x Howdah Archers, 3x Wolf Spider Mother | 14 |
| 3 | open | economy (4 resource makers); flying x7 | 78% (73%-82%) | 0.45 | 0: 11, 1: 9 | 4x House Cat, 4x Tax-Collector Teal, 3x Battlement Heron, 3x Border Collie, 3x Duckling Squadron, 3x Wolf Spider Mother | 0 |

## Per opponent

| Deck | fight:24-1 | fight:24-2 | fight:24-3 | fight:24-4 | fight:24-5 | fight:24-6 | fight:24-7 | fight:24-8 | ref:starter | ref:road24 | ref:expected |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 economy | 100% | 92% | 100% | 88% | 71% | 83% | 75% | 54% | 100% | 75% | 79% |
| 2 family:ranged | 100% | 100% | 96% | 96% | 63% | 67% | 83% | 71% | 92% | 79% | 54% |
| 3 open | 100% | 88% | 96% | 96% | 58% | 54% | 79% | 71% | 92% | 63% | 58% |
