# Focused decks: Map 11 The Aerie Vault (2026-11-05)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map mv --pool alpine-marmot,alpine-salamander,alpine-swift,anhinga-spearbird,apollo-butterfly,blue-ringed-octopus,caiman-hatchling,chamois-leaper,chipmunk-hoarder,dust-hyena,eagle-owl-quartermaster,eyrie-warden,gale-swift,gangrenous-leech,golden-eagle-diver,grave-grin-hyena,hoopoe-herald,ibex-rockcaller,marsh-harrier,mountain-hare,otter-centurion,peregrine-stooper,red-billed-chough,swamp-alligator,vigil-owl,wolf-spider-mother,wound-reaver --max-unique 6 --max-copies 4 --budget 6000 --final-games 24 --seed bal16-pro --focus family:flying,family:strike-first,big,open --anchor alpine-marmot,alpine-salamander,alpine-swift,apollo-butterfly,chamois-leaper,chipmunk-hoarder,eagle-owl-quartermaster,eyrie-warden,gale-swift,gangrenous-leech,golden-eagle-diver,ibex-rockcaller,swamp-alligator,vigil-owl,wound-reaver --anchor-min 10 --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 6776 games in 129 s.

- The list (27): Alpine Marmot, Alpine Salamander, Alpine Swift, Anhinga Spearbird, Apollo Butterfly, Blue-ringed Octopus, Caiman Hatchling, Chamois Leaper, Chipmunk Hoarder, Dust Hyena, Eagle-Owl Quartermaster, Eyrie Warden, Gale Swift, Gangrenous Leech, Golden Eagle Diver, Grave-Grin Hyena, Hoopoe Herald, Ibex Rockcaller, Marsh Harrier, Mountain Hare, Otter Centurion, Peregrine Stooper, Red-billed Chough, Swamp Alligator, Vigil Owl, Wolf Spider Mother, Wound Reaver.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 11-A-1 skirmish's deck; 11-A-2 skirmish's deck; 11-A-3 skirmish's deck; 11-A-4 boss's deck; reference starter deck under 11-A-1's field; reference deck (Map 15) under 11-A-2's field; expected player deck (expectedPlayerDeck) under 11-A-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | open | swarm (15 copies at 0 Lumber); economy (4 resource makers) | 89% (84%-93%) | 0.25 | 0: 15, 1: 5 | 4x Dust Hyena, 4x Gale Swift, 4x Hoopoe Herald, 3x Alpine Marmot, 3x Alpine Salamander, 2x Ibex Rockcaller | 0 |
| 2 | family:flying | flying x10; strike-first x6 | 80% (75%-86%) | 0.45 | 0: 11, 1: 9 | 4x Gale Swift, 4x Mountain Hare, 3x Alpine Salamander, 3x Alpine Swift, 3x Golden Eagle Diver, 3x Wound Reaver | 13 |
| 3 | family:strike-first | economy (4 resource makers); strike-first x9 | 71% (65%-76%) | 1 | 0: 4, 1: 12, 2: 4 | 4x Chamois Leaper, 4x Dust Hyena, 4x Golden Eagle Diver, 4x Swamp Alligator, 3x Blue-ringed Octopus, 1x Anhinga Spearbird | 16 |
| 4 | big | big (8 copies at 2+ Lumber, average 1.0); flying x8 | 70% (64%-77%) | 1 | 0: 12, 2: 4, 3: 4 | 4x Eyrie Warden, 4x Grave-Grin Hyena, 4x Hoopoe Herald, 4x Swamp Alligator, 2x Gale Swift, 2x Red-billed Chough | 14 |

## Per opponent

| Deck | fight:11-A-1 | fight:11-A-2 | fight:11-A-3 | fight:11-A-4 | ref:starter | ref:road15 | ref:expected |
|---|---|---|---|---|---|---|---|
| 1 open | 92% | 100% | 92% | 96% | 100% | 67% | 75% |
| 2 family:flying | 73% | 81% | 88% | 100% | 96% | 54% | 71% |
| 3 family:strike-first | 92% | 81% | 75% | 83% | 100% | 21% | 42% |
| 4 big | 90% | 81% | 67% | 75% | 88% | 33% | 58% |
