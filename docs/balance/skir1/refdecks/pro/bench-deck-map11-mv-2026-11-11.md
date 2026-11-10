# Focused decks: Map 11 The Aerie Vault (2026-11-10)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map mv --pool alpine-marmot,alpine-salamander,alpine-swift,apollo-butterfly,blue-ringed-octopus,chamois-leaper,chipmunk-hoarder,dust-hyena,eagle-owl-quartermaster,eyrie-warden,gale-swift,gangrenous-leech,grave-grin-hyena,great-horned-owl,hawk-arrowkeeper,ibex-rockcaller,mountain-hare,peregrine-stooper,pika-hoarder,puffin-diver,red-billed-chough,sparrow-chick,stonedrop-vulture,swamp-alligator,the-gannet-queen,tide-spirit,upside-down-bat,wolf-spider-mother,wound-reaver --max-unique 6 --max-copies 4 --budget 1200 --final-games 24 --seed skir1-pro --focus family:flying,family:strike-first,big,open --anchor alpine-salamander,alpine-swift,apollo-butterfly,chamois-leaper,chipmunk-hoarder,eagle-owl-quartermaster,eyrie-warden,gale-swift,gangrenous-leech,great-horned-owl,hawk-arrowkeeper,ibex-rockcaller,red-billed-chough,sparrow-chick,swamp-alligator,the-gannet-queen,wound-reaver --anchor-min 10 --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 1890 games in 362 s.

- The list (29): Alpine Marmot, Alpine Salamander, Alpine Swift, Apollo Butterfly, Blue-ringed Octopus, Chamois Leaper, Chipmunk Hoarder, Dust Hyena, Eagle-Owl Quartermaster, Eyrie Warden, Gale Swift, Gangrenous Leech, Grave-Grin Hyena, Great Horned Owl, Hawk Arrowkeeper, Ibex Rockcaller, Mountain Hare, Peregrine Stooper, Pika Hoarder, Puffin Diver, Red-billed Chough, Sparrow Chick, Stonedrop Vulture, Swamp Alligator, The Gannet Queen, Tide Seahorse, Upside-Down Bat, Wolf Spider Mother, Wound Reaver.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 11-A-1 skirmish's deck; 11-A-2 skirmish's deck; 11-A-3 skirmish's deck; 11-A-4 boss's deck; reference starter deck under 11-A-1's field; reference deck (Map 15) under 11-A-2's field; expected player deck (expectedPlayerDeck) under 11-A-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | big | big (8 copies at 2+ Lumber, average 1.1); flying x14 | 78% (72%-84%) | 1.1 | 0: 6, 1: 6, 2: 8 | 4x Great Horned Owl, 4x Stonedrop Vulture, 4x The Gannet Queen, 3x Dust Hyena, 3x Pika Hoarder, 2x Hawk Arrowkeeper | 15 |
| 2 | family:strike-first | flying x12; strike-first x8 | 76% (70%-82%) | 0.4 | 0: 12, 1: 8 | 4x Alpine Swift, 4x Apollo Butterfly, 4x Chamois Leaper, 4x Pika Hoarder, 4x Stonedrop Vulture | 19 |
| 3 | open | economy (4 resource makers); flying x8 | 67% (62%-73%) | 0.55 | 0: 9, 1: 11 | 4x Alpine Marmot, 4x Dust Hyena, 4x Gangrenous Leech, 4x Hawk Arrowkeeper, 3x Eagle-Owl Quartermaster, 1x Alpine Swift | 0 |
| 4 | family:flying | flying x8 | 61% (55%-68%) | 0.6 | 0: 12, 1: 4, 2: 4 | 4x Alpine Marmot, 4x Alpine Swift, 4x Chipmunk Hoarder, 4x Great Horned Owl, 3x Blue-ringed Octopus, 1x Ibex Rockcaller | 15 |

## Per opponent

| Deck | fight:11-A-1 | fight:11-A-2 | fight:11-A-3 | fight:11-A-4 | ref:starter | ref:road15 | ref:expected |
|---|---|---|---|---|---|---|---|
| 1 big | 83% | 79% | 96% | 81% | 96% | 58% | 54% |
| 2 family:strike-first | 71% | 75% | 100% | 63% | 100% | 63% | 63% |
| 3 open | 83% | 46% | 96% | 83% | 100% | 25% | 38% |
| 4 family:flying | 63% | 42% | 100% | 63% | 92% | 21% | 50% |
