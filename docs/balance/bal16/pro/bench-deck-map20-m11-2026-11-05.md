# Focused decks: Map 20 The Sundered Peak (2026-11-05)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map m11 --pool alpine-marmot,alpine-swift,ancient-sloth-titan,apollo-butterfly,ash-cloud-condor,ash-moth,ashbone-ghoul,beaver-lumberjack,blue-ringed-octopus,cave-warlord,chamois-leaper,cinder-skeleton,cinder-stoker,deep-cave-troll,eagle-owl-quartermaster,ember-centipede,eyrie-warden,fire-salamander,fumarole-ibex,granite-ox-golem,grave-grin-hyena,ibex-rockcaller,magma-salamander,magma-titan,magma-wraith,obsidian-scorpion,ossuary-lammergeier,pack-mule,peregrine-stooper,pumice-beetle,red-billed-chough,skull-vulture,stalactite-golem,stoat-cutthroat,talus-pika,vampire-roost,walrus-icebreaker,wolf-spider-mother --max-unique 6 --max-copies 4 --budget 6000 --final-games 24 --seed bal16-pro --focus economy,family:flying,family:strike-first,open --anchor alpine-marmot,alpine-swift,ancient-sloth-titan,apollo-butterfly,ash-cloud-condor,ashbone-ghoul,beaver-lumberjack,cave-warlord,chamois-leaper,cinder-skeleton,cinder-stoker,deep-cave-troll,eagle-owl-quartermaster,eyrie-warden,fumarole-ibex,granite-ox-golem,magma-salamander,magma-titan,magma-wraith,obsidian-scorpion,ossuary-lammergeier,pack-mule,pumice-beetle,stalactite-golem,talus-pika,vampire-roost --anchor-min 10 --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 7410 games in 207 s.

- The list (38): Alpine Marmot, Alpine Swift, Ancient Sloth Titan, Apollo Butterfly, Ash Cloud Condor, Ash Moth, Ashbone Ghoul, Beaver Lumberjack, Blue-ringed Octopus, Cave Warlord, Chamois Leaper, Cinder Skeleton, Cinder Stoker, Cave Bear, Eagle-Owl Quartermaster, Ember Centipede, Eyrie Warden, Fire Salamander, Fumarole Ibex, Granite Ox Golem, Grave-Grin Hyena, Ibex Rockcaller, Magma Salamander, Magma Rhino, Magma Wraith, Obsidian Scorpion, Ossuary Lammergeier, Pack Mule, Peregrine Stooper, Pumice Beetle, Red-billed Chough, Skull Vulture, Stalactite Pill Bug, Stoat Cutthroat, Talus Pika, Vampire Roost, Walrus Icebreaker, Wolf Spider Mother.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 20-1 skirmish's deck; 20-2 skirmish's deck; 20-3 skirmish's deck; 20-4 skirmish's deck; 20-5 elite's deck; 20-6 elite's deck; 20-7 elite's deck; 20-8 elite's deck; 20-9 boss's deck; 20-10 worldboss's deck; reference starter deck under 20-1's field; reference deck (Map 20) under 20-2's field; expected player deck (expectedPlayerDeck) under 20-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | economy | economy (6 resource makers) | 75% (70%-79%) | 0.75 | 0: 9, 1: 7, 2: 4 | 4x Cinder Stoker, 4x Pumice Beetle, 4x Stalactite Pill Bug, 3x Ashbone Ghoul, 3x Wolf Spider Mother, 2x Pack Mule | 13 |
| 2 | open | midrange (average 0.6 Lumber) | 63% (59%-68%) | 0.6 | 0: 8, 1: 12 | 4x Alpine Marmot, 4x Cinder Stoker, 3x Ash Cloud Condor, 3x Blue-ringed Octopus, 3x Chamois Leaper, 3x Wolf Spider Mother | 0 |
| 3 | family:strike-first | strike-first x10 | 62% (57%-66%) | 0.8 | 0: 4, 1: 16 | 4x Beaver Lumberjack, 4x Peregrine Stooper, 3x Fumarole Ibex, 3x Magma Wraith, 3x Stoat Cutthroat, 3x Wolf Spider Mother | 17 |
| 4 | family:flying | swarm (16 copies at 0 Lumber); flying x9 | 49% (45%-54%) | 0.5 | 0: 16, 1: 1, 3: 3 | 4x Apollo Butterfly, 4x Cinder Stoker, 4x Grave-Grin Hyena, 4x Red-billed Chough, 3x Cave Bear, 1x Ossuary Lammergeier | 16 |

## Per opponent

| Deck | fight:20-1 | fight:20-2 | fight:20-3 | fight:20-4 | fight:20-5 | fight:20-6 | fight:20-7 | fight:20-8 | fight:20-9 | fight:20-10 | ref:starter | ref:road20 | ref:expected |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 economy | 67% | 83% | 88% | 71% | 96% | 75% | 83% | 79% | 83% | 79% | 92% | 17% | 58% |
| 2 open | 67% | 96% | 67% | 46% | 92% | 33% | 42% | 58% | 75% | 67% | 100% | 8% | 75% |
| 3 family:strike-first | 54% | 88% | 71% | 42% | 83% | 63% | 29% | 42% | 75% | 54% | 96% | 33% | 71% |
| 4 family:flying | 38% | 67% | 42% | 21% | 79% | 50% | 4% | 58% | 71% | 42% | 100% | 13% | 58% |
