# Focused decks: Map 14 Savanna Reaches (2026-11-12)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map m5 --pool alley-cat,alpine-marmot,badger-lumberjack,balloon-archer,blue-ringed-octopus,bramble-sprout,bramblewood-macaque,cunning-vixen,dust-hyena,eagle-owl-quartermaster,fishing-cat,grizzly-vanguard,harvest-mouse,hedgehog-herbalist,hollow-belly-rat,hoopoe-herald,ibex-rockcaller,marula-elephant,meerkat-sentry,meerkat-wayfarer,otter-centurion,pine-marten,plains-zebra,pride-queen,river-mink,savanna-cheetah,sergeant-bramblefox,stoat-cutthroat,tasmanian-devil,wolf-spider-mother --max-unique 6 --max-copies 4 --budget 8000 --final-games 24 --seed skir1-pro --focus economy,family:strike-first,family:guard,open --anchor badger-lumberjack,balloon-archer,bramble-sprout,bramblewood-macaque,cunning-vixen,dust-hyena,grizzly-vanguard,hollow-belly-rat,hoopoe-herald,marula-elephant,meerkat-sentry,plains-zebra,pride-queen,river-mink,savanna-cheetah,sergeant-bramblefox,stoat-cutthroat,tasmanian-devil --anchor-min 10 --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 8800 games in 113 s.

- The list (30): Alley Cat, Alpine Marmot, Badger Lumberjack, Balloon Archer, Blue-ringed Octopus, Bramble Sprout, Bramblewood Macaque, Cunning Vixen, Dust Hyena, Eagle-Owl Quartermaster, Fishing Cat, Grizzly Vanguard, Harvest Mouse, Hedgehog Herbalist, Hollow-belly Rat, Hoopoe Herald, Ibex Rockcaller, Marula Elephant, Meerkat Sentry, Meerkat Wayfarer, Otter Centurion, Pine Marten, Plains Zebra, Pride Queen, River Mink, Savanna Cheetah, Sergeant Bramblefox, Stoat Cutthroat, Tasmanian Devil, Wolf Spider Mother.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 14-1 skirmish's deck; 14-2 skirmish's deck; 14-3 skirmish's deck; 14-4 skirmish's deck; 14-5 elite's deck; 14-6 elite's deck; 14-7 elite's deck; 14-8 miniboss's deck; reference starter deck under 14-1's field; reference deck (Map 14) under 14-2's field; expected player deck (expectedPlayerDeck) under 14-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | family:guard | big (9 copies at 1+ Lumber, average 0.5); economy (4 resource makers); guard x8 | 91% (87%-94%) | 0.45 | 0: 11, 1: 9 | 4x Alpine Marmot, 4x Badger Lumberjack, 4x Plains Zebra, 3x Blue-ringed Octopus, 3x Bramblewood Macaque, 2x Ibex Rockcaller | 14 |
| 2 | open | swarm (14 copies at 0 Lumber) | 91% (87%-94%) | 0.3 | 0: 14, 1: 6 | 4x Alley Cat, 4x Hoopoe Herald, 3x Alpine Marmot, 3x Plains Zebra, 3x Sergeant Bramblefox, 3x Stoat Cutthroat | 0 |
| 3 | family:strike-first | big (8 copies at 1+ Lumber, average 0.4); economy (4 resource makers); strike-first x8 | 90% (87%-93%) | 0.4 | 0: 12, 1: 8 | 4x Alpine Marmot, 4x Dust Hyena, 4x Hoopoe Herald, 3x Fishing Cat, 3x Stoat Cutthroat, 2x Pride Queen | 10 |
| 4 | economy | big (9 copies at 1+ Lumber, average 0.5); economy (8 resource makers) | 89% (86%-93%) | 0.45 | 0: 11, 1: 9 | 4x Alley Cat, 4x Badger Lumberjack, 4x Dust Hyena, 3x Plains Zebra, 3x Wolf Spider Mother, 2x Savanna Cheetah | 13 |

## Per opponent

| Deck | fight:14-1 | fight:14-2 | fight:14-3 | fight:14-4 | fight:14-5 | fight:14-6 | fight:14-7 | fight:14-8 | ref:starter | ref:road14 | ref:expected |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 family:guard | 100% | 100% | 100% | 96% | 88% | 96% | 100% | 83% | 100% | 67% | 67% |
| 2 open | 100% | 100% | 100% | 96% | 96% | 100% | 88% | 96% | 88% | 50% | 83% |
| 3 family:strike-first | 96% | 96% | 100% | 100% | 100% | 92% | 96% | 92% | 100% | 58% | 58% |
| 4 economy | 100% | 100% | 100% | 100% | 92% | 79% | 100% | 79% | 100% | 63% | 71% |
