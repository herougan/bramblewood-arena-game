# Focused decks: Map 23 The Goldfeather Siege (2026-11-05)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map m23 --pool acacia-giraffe,alley-cat,badger-trench-digger,beetle-battering-ram,bison-bulldozer,border-collie,eagle-owl-quartermaster,hoopoe-herald,howdah-archers,lodge-engineer,marshal-tuskwell,meerkat-burrower,mouse-sapper,pack-mule,pangolin-roller,pronghorn-racer,raccoon-bandit,siege-rhino,stoat-cutthroat,testudo-tortoise,triumvirate,war-elephant --max-unique 6 --max-copies 4 --budget 6000 --final-games 24 --seed bal16-bpro --focus economy,family:armor,family:night,open --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 5698 games in 89 s.

- The list (22): Acacia Giraffe, Alley Cat, Badger Trench Digger, Beetle Battering-Ram, Bison Bulldozer, Border Collie, Eagle-Owl Quartermaster, Hoopoe Herald, Howdah Archers, Lodge Engineer, Marshal Tuskwell, Meerkat Burrower, Mouse Sapper, Pack Mule, Pangolin Roller, Pronghorn Racer, Raccoon Bandit, Siege Rhino, Stoat Cutthroat, Testudo Tortoise, Triumphvirate, War Elephant.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 23-1 skirmish's deck; 23-2 skirmish's deck; 23-3 skirmish's deck; 23-4 skirmish's deck; 23-5 skirmish's deck; 23-6 elite's deck; 23-7 elite's deck; 23-8 miniboss's deck; reference starter deck under 23-1's field; reference deck (Map 23) under 23-2's field; expected player deck (expectedPlayerDeck) under 23-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | economy | economy (7 resource makers); economy x7; armor x6 | 86% (82%-89%) | 1 | 0: 7, 1: 6, 2: 7 | 4x Acacia Giraffe, 4x Pack Mule, 3x Pangolin Roller, 3x Raccoon Bandit, 3x Stoat Cutthroat, 3x Testudo Tortoise | 16 |
| 2 | family:night | economy (7 resource makers); night x9; economy x7 | 81% (77%-85%) | 0.65 | 0: 7, 1: 13 | 4x Meerkat Burrower, 4x Mouse Sapper, 4x Pack Mule, 3x Raccoon Bandit, 3x Stoat Cutthroat, 2x Beetle Battering-Ram | 16 |
| 3 | open | economy (4 resource makers); ranged x6 | 81% (76%-85%) | 0.4 | 0: 12, 1: 8 | 4x Alley Cat, 4x Hoopoe Herald, 4x Pack Mule, 3x Eagle-Owl Quartermaster, 3x Howdah Archers, 2x Siege Rhino | 0 |

## Per opponent

| Deck | fight:23-1 | fight:23-2 | fight:23-3 | fight:23-4 | fight:23-5 | fight:23-6 | fight:23-7 | fight:23-8 | ref:starter | ref:road23 | ref:expected |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 economy | 96% | 96% | 92% | 75% | 96% | 100% | 96% | 100% | 88% | 42% | 63% |
| 2 family:night | 100% | 92% | 88% | 67% | 88% | 83% | 92% | 92% | 100% | 33% | 58% |
| 3 open | 96% | 88% | 71% | 83% | 83% | 92% | 83% | 79% | 100% | 42% | 71% |
