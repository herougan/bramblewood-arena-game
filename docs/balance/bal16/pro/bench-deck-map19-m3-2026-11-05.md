# Focused decks: Map 19 Ashen Spurn (2026-11-05)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map m3 --pool alpine-salamander,apollo-butterfly,beluga,blue-ringed-octopus,cinder-stoker,dust-hyena,eagle-owl-quartermaster,fire-salamander,glacier-wolf-pack,glimmer-spider,granite-ox-golem,grave-grin-hyena,harbor-seal,hercules-beetle,ibex-rockcaller,lantern-spark-fly,magma-titan,mountain-hare,obsidian-scorpion,pit-glutton,polar-bear,pumice-beetle,snow-bunting-archer,snow-ermine,spitting-spider,stoat-cutthroat,sulfur-cinder-moth,talus-pika,thorn-shrike,walrus-icebreaker,wolf-spider-mother,yeti --max-unique 6 --max-copies 4 --budget 6000 --final-games 24 --seed bal16-pro --focus economy,family:flying,family:evasion,open --anchor apollo-butterfly,beluga,cinder-stoker,eagle-owl-quartermaster,fire-salamander,glacier-wolf-pack,granite-ox-golem,harbor-seal,hercules-beetle,magma-titan,obsidian-scorpion,pit-glutton,pumice-beetle,snow-bunting-archer,snow-ermine,spitting-spider,sulfur-cinder-moth,talus-pika,walrus-icebreaker,yeti --anchor-min 10 --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 7128 games in 114 s.

- The list (32): Alpine Salamander, Apollo Butterfly, Beluga, Blue-ringed Octopus, Cinder Stoker, Dust Hyena, Eagle-Owl Quartermaster, Fire Salamander, Glacier Wolf Pack, Glimmer Spider, Granite Ox Golem, Grave-Grin Hyena, Harbor Seal, Hercules Beetle, Ibex Rockcaller, Lantern Spark Fly, Magma Rhino, Mountain Hare, Obsidian Scorpion, Pit Glutton, Polar Bear, Pumice Beetle, Snow Bunting Archer, Snow Ermine, Spitting Spider, Stoat Cutthroat, Sulfur Cinder Moth, Talus Pika, Thorn Shrike, Walrus Icebreaker, Wolf Spider Mother, Yeti.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 19-1 skirmish's deck; 19-2 skirmish's deck; 19-3 elite's deck; 19-4 elite's deck; 19-5 elite's deck; 19-6 miniboss's deck; reference starter deck under 19-1's field; reference deck (Map 19) under 19-2's field; expected player deck (expectedPlayerDeck) under 19-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | family:evasion | swarm (15 copies at 0 Lumber); evasion x8 | 90% (87%-94%) | 0.25 | 0: 15, 1: 5 | 4x Cinder Stoker, 4x Mountain Hare, 4x Snow Ermine, 3x Dust Hyena, 3x Obsidian Scorpion, 2x Stoat Cutthroat | 10 |
| 2 | open | economy (4 resource makers) | 90% (87%-94%) | 0.4 | 0: 12, 1: 8 | 4x Cinder Stoker, 4x Dust Hyena, 4x Talus Pika, 3x Obsidian Scorpion, 3x Pit Glutton, 2x Polar Bear | 0 |
| 3 | family:flying | swarm (14 copies at 0 Lumber); flying x8 | 89% (86%-93%) | 0.3 | 0: 14, 1: 6 | 4x Apollo Butterfly, 4x Lantern Spark Fly, 3x Cinder Stoker, 3x Hercules Beetle, 3x Mountain Hare, 3x Obsidian Scorpion | 14 |
| 4 | economy | economy (8 resource makers) | 84% (81%-88%) | 0.8 | 0: 4, 1: 16 | 4x Dust Hyena, 4x Pumice Beetle, 3x Beluga, 3x Blue-ringed Octopus, 3x Obsidian Scorpion, 3x Pit Glutton | 10 |

## Per opponent

| Deck | fight:19-1 | fight:19-2 | fight:19-3 | fight:19-4 | fight:19-5 | fight:19-6 | ref:starter | ref:road19 | ref:expected |
|---|---|---|---|---|---|---|---|---|---|
| 1 family:evasion | 100% | 96% | 100% | 100% | 96% | 88% | 96% | 54% | 83% |
| 2 open | 100% | 96% | 96% | 100% | 92% | 83% | 100% | 58% | 88% |
| 3 family:flying | 100% | 96% | 96% | 100% | 96% | 88% | 100% | 54% | 75% |
| 4 economy | 96% | 96% | 96% | 96% | 88% | 100% | 100% | 25% | 63% |
