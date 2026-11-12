# Focused decks: Map 19 Ashen Spurn (2026-11-12)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map m3 --pool armadillo-guard,caustic-scorpion,dune-jackal,eagle-owl-quartermaster,elderhorn-monarch,fire-salamander,gallery-orb-weaver,glacier-yak,grave-grin-hyena,honey-badger-fury,horned-lizard,ibex-rockcaller,kinkajou-lurker,lantern-spark-fly,mountain-hare,obsidian-scorpion,pinecone-sapper,polar-bear,quillback-elder,quillguard,smoke-raccoon,snow-ermine,stalactite-golem,stoat-cutthroat,sulfur-cinder-moth,thorny-devil,upside-down-bat,walrus-icebreaker,wolf-spider-mother --max-unique 6 --max-copies 4 --budget 8000 --final-games 24 --seed skir1-pro --focus family:evasion,family:flying,big,open --anchor armadillo-guard,caustic-scorpion,dune-jackal,elderhorn-monarch,fire-salamander,glacier-yak,honey-badger-fury,horned-lizard,obsidian-scorpion,pinecone-sapper,polar-bear,quillback-elder,quillguard,smoke-raccoon,stalactite-golem,sulfur-cinder-moth,walrus-icebreaker --anchor-min 10 --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 9252 games in 128 s.

- The list (29): Armadillo Guard, Caustic Scorpion, Dune Jackal, Eagle-Owl Quartermaster, Elderhorn Monarch, Fire Salamander, Gallery Orb-Weaver, Glacier Yak, Grave-Grin Hyena, Honey Badger Fury, Horned Lizard, Ibex Rockcaller, Kinkajou Lurker, Lantern Spark Fly, Mountain Hare, Obsidian Scorpion, Pinecone Sapper, Polar Bear, Quillback Elder, Quillguard, Smokescreen Raccoon, Snow Ermine, Stalactite Pill Bug, Stoat Cutthroat, Sulfur Cinder Moth, Thorny Devil, Upside-Down Bat, Walrus Icebreaker, Wolf Spider Mother.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 19-1 skirmish's deck; 19-2 skirmish's deck; 19-3 elite's deck; 19-4 elite's deck; 19-5 elite's deck; 19-6 miniboss's deck; reference starter deck under 19-1's field; reference deck (Map 19) under 19-2's field; expected player deck (expectedPlayerDeck) under 19-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | family:flying | guard x8; flying x8 | 94% (91%-97%) | 0.8 | 0: 4, 1: 16 | 4x Armadillo Guard, 4x Lantern Spark Fly, 4x Sulfur Cinder Moth, 4x Thorny Devil, 2x Ibex Rockcaller, 2x Walrus Icebreaker | 14 |
| 2 | family:evasion | evasion x9; guard x7 | 92% (88%-95%) | 0.65 | 0: 7, 1: 13 | 4x Armadillo Guard, 4x Horned Lizard, 4x Snow Ermine, 3x Mountain Hare, 3x Thorny Devil, 2x Polar Bear | 12 |
| 3 | open | midrange (average 1.0 Lumber) | 90% (87%-94%) | 1 | 1: 20 | 4x Armadillo Guard, 4x Caustic Scorpion, 4x Horned Lizard, 3x Stoat Cutthroat, 3x Wolf Spider Mother, 2x Walrus Icebreaker | 0 |
| 4 | big | big (8 copies at 2+ Lumber, average 1.1); armor x8; guard x8 | 81% (76%-85%) | 1.05 | 0: 7, 1: 5, 2: 8 | 4x Pinecone Sapper, 4x Quillback Elder, 4x Stalactite Pill Bug, 4x Thorny Devil, 3x Upside-Down Bat, 1x Dune Jackal | 20 |

## Per opponent

| Deck | fight:19-1 | fight:19-2 | fight:19-3 | fight:19-4 | fight:19-5 | fight:19-6 | ref:starter | ref:road19 | ref:expected |
|---|---|---|---|---|---|---|---|---|---|
| 1 family:flying | 100% | 96% | 100% | 100% | 96% | 92% | 100% | 83% | 79% |
| 2 family:evasion | 100% | 100% | 96% | 100% | 100% | 100% | 100% | 67% | 63% |
| 3 open | 100% | 100% | 96% | 96% | 92% | 88% | 100% | 63% | 79% |
| 4 big | 100% | 81% | 100% | 92% | 92% | 75% | 92% | 52% | 42% |
