# Focused decks: Map 23 The Goldfeather Siege (2026-11-05)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map m23 --pool acacia-giraffe,alley-cat,ashbone-ghoul,badger-berserker,badger-trench-digger,beetle-battering-ram,bison-bulldozer,border-collie,eagle-owl-quartermaster,grave-grin-hyena,hoopoe-herald,house-cat,howdah-archers,ibex-rockcaller,lodge-engineer,marshal-tuskwell,marula-elephant,meerkat-burrower,meerkat-wayfarer,mouse-sapper,pack-mule,pangolin-roller,pronghorn-racer,raccoon-bandit,siege-rhino,spitting-cobra,springbok-pronker,stoat-cutthroat,testudo-tortoise,tide-spirit,triumvirate,war-elephant,weaver-bird,wolf-spider-mother --max-unique 6 --max-copies 4 --budget 6000 --final-games 24 --seed bal16-pro --focus economy,family:armor,family:ranged,open --anchor acacia-giraffe,alley-cat,badger-trench-digger,beetle-battering-ram,bison-bulldozer,border-collie,eagle-owl-quartermaster,hoopoe-herald,howdah-archers,lodge-engineer,marshal-tuskwell,meerkat-burrower,mouse-sapper,pack-mule,pangolin-roller,pronghorn-racer,raccoon-bandit,siege-rhino,stoat-cutthroat,testudo-tortoise,triumvirate,war-elephant --anchor-min 10 --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 5632 games in 76 s.

- The list (34): Acacia Giraffe, Alley Cat, Ashbone Ghoul, Badger Berserker, Badger Trench Digger, Beetle Battering-Ram, Bison Bulldozer, Border Collie, Eagle-Owl Quartermaster, Grave-Grin Hyena, Hoopoe Herald, House Cat, Howdah Archers, Ibex Rockcaller, Lodge Engineer, Marshal Tuskwell, Marula Elephant, Meerkat Burrower, Meerkat Wayfarer, Mouse Sapper, Pack Mule, Pangolin Roller, Pronghorn Racer, Raccoon Bandit, Siege Rhino, Spitting Cobra, Springbok Pronker, Stoat Cutthroat, Testudo Tortoise, Tide Seahorse, Triumphvirate, War Elephant, Weaver Bird, Wolf Spider Mother.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 23-1 skirmish's deck; 23-2 skirmish's deck; 23-3 skirmish's deck; 23-4 skirmish's deck; 23-5 skirmish's deck; 23-6 elite's deck; 23-7 elite's deck; 23-8 miniboss's deck; reference starter deck under 23-1's field; reference deck (Map 23) under 23-2's field; expected player deck (expectedPlayerDeck) under 23-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | economy | economy (7 resource makers); economy x7 | 94% (91%-96%) | 0.55 | 0: 9, 1: 11 | 4x Border Collie, 4x Pack Mule, 4x Weaver Bird, 3x Badger Berserker, 3x Raccoon Bandit, 2x Tide Seahorse | 10 |
| 2 | open | economy (4 resource makers) | 84% (80%-88%) | 0.75 | 0: 8, 1: 9, 2: 3 | 4x House Cat, 4x Pack Mule, 4x Weaver Bird, 3x Acacia Giraffe, 3x Howdah Archers, 2x Badger Berserker | 0 |
| 3 | family:ranged | ranged x9 | 79% (75%-83%) | 0.8 | 0: 4, 1: 16 | 4x Border Collie, 4x Hoopoe Herald, 3x Badger Berserker, 3x Eagle-Owl Quartermaster, 3x Howdah Archers, 3x Spitting Cobra | 15 |

## Per opponent

| Deck | fight:23-1 | fight:23-2 | fight:23-3 | fight:23-4 | fight:23-5 | fight:23-6 | fight:23-7 | fight:23-8 | ref:starter | ref:road23 | ref:expected |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 economy | 100% | 100% | 92% | 83% | 92% | 100% | 100% | 96% | 100% | 75% | 92% |
| 2 open | 96% | 96% | 83% | 71% | 83% | 88% | 92% | 88% | 96% | 63% | 71% |
| 3 family:ranged | 100% | 96% | 79% | 58% | 88% | 96% | 92% | 92% | 88% | 33% | 50% |
