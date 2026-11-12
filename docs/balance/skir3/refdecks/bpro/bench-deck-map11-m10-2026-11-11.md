# Focused decks: Map 11 Eyrie Heights (2026-11-12)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map m10 --pool anvil-thrush,beaver-lumberjack,chamois-leaper,chipmunk-hoarder,eagle-owl-quartermaster,eagle-sharpshooter,eyrie-warden,gangrenous-leech,gannet-nestweaver,golden-eagle-diver,kittiwake-flock,mountain-hare,peak-condor,peregrine-stooper,pika-hoarder,stonedrop-vulture,swamp-alligator,the-gannet-queen,wound-reaver --max-unique 6 --max-copies 4 --budget 6000 --final-games 24 --seed skir1-bpro --focus family:flying,family:ranged,big,open --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 7722 games in 127 s.

- The list (19): Anvil Thrush, Beaver Lumberjack, Chamois Leaper, Chipmunk Hoarder, Eagle-Owl Quartermaster, Eagle Sharpshooter, Eyrie Warden, Gangrenous Leech, Gannet Nestweaver, Golden Eagle Diver, Kittiwake Flock, Mountain Hare, Peak Condor, Peregrine Stooper, Pika Hoarder, Stonedrop Vulture, Swamp Alligator, The Gannet Queen, Wound Reaver.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 11-1 skirmish's deck; 11-2 skirmish's deck; 11-3 skirmish's deck; 11-4 skirmish's deck; 11-5 elite's deck; 11-6 elite's deck; 11-7 elite's deck; 11-8 elite's deck; 11-9 elite's deck; 11-10 miniboss's deck; reference starter deck under 11-1's field; reference deck (Map 11) under 11-2's field; expected player deck (expectedPlayerDeck) under 11-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | family:ranged | flying x16; ranged x8 | 92% (89%-94%) | 0.6 | 0: 8, 1: 12 | 4x Golden Eagle Diver, 4x Kittiwake Flock, 4x Peak Condor, 4x Stonedrop Vulture, 3x Chipmunk Hoarder, 1x Pika Hoarder | 11 |
| 2 | open | flying x16; strike-first x8 | 88% (85%-91%) | 0.6 | 0: 8, 1: 12 | 4x Golden Eagle Diver, 4x Peak Condor, 4x Peregrine Stooper, 4x Pika Hoarder, 3x Anvil Thrush, 1x Gannet Nestweaver | 0 |
| 3 | big | big (8 copies at 2+ Lumber, average 1.0); economy (4 resource makers); flying x20; ranged x8 | 88% (84%-91%) | 1 | 0: 8, 1: 4, 2: 8 | 4x Eagle Sharpshooter, 4x Gannet Nestweaver, 4x Kittiwake Flock, 4x Stonedrop Vulture, 4x The Gannet Queen | 19 |
| 4 | family:flying | ranged x8; flying x8 | 87% (83%-90%) | 0.75 | 0: 7, 1: 11, 2: 2 | 4x Peak Condor, 4x Pika Hoarder, 4x Stonedrop Vulture, 3x Mountain Hare, 3x Wound Reaver, 2x Swamp Alligator | 12 |

## Per opponent

| Deck | fight:11-1 | fight:11-2 | fight:11-3 | fight:11-4 | fight:11-5 | fight:11-6 | fight:11-7 | fight:11-8 | fight:11-9 | fight:11-10 | ref:starter | ref:road11 | ref:expected |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 family:ranged | 96% | 100% | 100% | 100% | 92% | 96% | 100% | 96% | 83% | 96% | 100% | 50% | 83% |
| 2 open | 100% | 100% | 100% | 100% | 92% | 100% | 92% | 92% | 71% | 96% | 96% | 33% | 75% |
| 3 big | 96% | 100% | 92% | 96% | 75% | 96% | 100% | 75% | 88% | 100% | 100% | 60% | 63% |
| 4 family:flying | 100% | 100% | 96% | 96% | 92% | 92% | 92% | 83% | 92% | 79% | 92% | 29% | 83% |
