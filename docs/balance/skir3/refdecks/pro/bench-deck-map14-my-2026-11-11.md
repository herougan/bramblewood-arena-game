# Focused decks: Map 14 The Canopy (2026-11-12)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map my --pool alpine-swift,amber-cicada,barkplate-beetle,eagle-owl-quartermaster,fishing-cat,fungus-gnat-cloud,grave-grin-hyena,hoopoe-herald,howler-monkey,ibex-rockcaller,lyrebird-mimic,mosquito-cloud,pride-queen,proboscis-monkey,slow-loris,stoat-cutthroat,sunbittern-strider,toucan-courier,upside-down-bat,wolf-spider-mother --max-unique 6 --max-copies 4 --budget 8000 --final-games 24 --seed skir1-pro --focus family:flying,family:strike-first,big,open --anchor amber-cicada,fishing-cat,hoopoe-herald,howler-monkey,mosquito-cloud,pride-queen,slow-loris,toucan-courier --anchor-min 10 --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 9072 games in 221 s.

- The list (20): Alpine Swift, Amber Cicada, Barkplate Beetle, Eagle-Owl Quartermaster, Fishing Cat, Fungus Gnat Cloud, Grave-Grin Hyena, Hoopoe Herald, Howler Monkey, Ibex Rockcaller, Lyrebird Mimic, Mosquito Cloud, Pride Queen, Proboscis Monkey, Slow Loris, Stoat Cutthroat, Sunbittern Strider, Toucan Courier, Upside-Down Bat, Wolf Spider Mother.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 14-A-1 skirmish's deck; 14-A-2 skirmish's deck; 14-A-3 skirmish's deck; 14-A-4 elite's deck; 14-A-5 boss's deck; reference starter deck under 14-A-1's field; reference deck (Map 18) under 14-A-2's field; expected player deck (expectedPlayerDeck) under 14-A-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | big | big (9 copies at 1+ Lumber, average 0.5) | 83% (78%-88%) | 0.45 | 0: 11, 1: 9 | 4x Hoopoe Herald, 4x Howler Monkey, 4x Lyrebird Mimic, 3x Slow Loris, 3x Stoat Cutthroat, 2x Wolf Spider Mother | 10 |
| 2 | open | swarm (14 copies at 0 Lumber) | 77% (72%-82%) | 0.5 | 0: 14, 1: 2, 2: 4 | 4x Barkplate Beetle, 4x Grave-Grin Hyena, 4x Hoopoe Herald, 3x Howler Monkey, 3x Slow Loris, 2x Ibex Rockcaller | 0 |
| 3 | family:strike-first | swarm (15 copies at 0 Lumber); strike-first x8 | 77% (72%-81%) | 0.25 | 0: 15, 1: 5 | 4x Grave-Grin Hyena, 4x Hoopoe Herald, 4x Toucan Courier, 3x Alpine Swift, 3x Stoat Cutthroat, 2x Fishing Cat | 12 |
| 4 | family:flying | swarm (14 copies at 0 Lumber); flying x8 | 71% (65%-77%) | 0.3 | 0: 14, 1: 6 | 4x Lyrebird Mimic, 4x Mosquito Cloud, 4x Slow Loris, 4x Upside-Down Bat, 2x Howler Monkey, 2x Ibex Rockcaller | 13 |

## Per opponent

| Deck | fight:14-A-1 | fight:14-A-2 | fight:14-A-3 | fight:14-A-4 | fight:14-A-5 | ref:starter | ref:road18 | ref:expected |
|---|---|---|---|---|---|---|---|---|
| 1 big | 96% | 88% | 92% | 79% | 75% | 96% | 88% | 50% |
| 2 open | 79% | 96% | 92% | 63% | 58% | 96% | 88% | 46% |
| 3 family:strike-first | 88% | 92% | 96% | 63% | 88% | 100% | 77% | 13% |
| 4 family:flying | 63% | 67% | 75% | 67% | 79% | 96% | 73% | 50% |
