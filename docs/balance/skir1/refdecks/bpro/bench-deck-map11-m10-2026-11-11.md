# Focused decks: Map 11 Eyrie Heights (2026-11-10)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map m10 --pool alpine-marmot,anvil-thrush,beaver-lumberjack,chamois-leaper,chipmunk-hoarder,eagle-owl-quartermaster,eagle-sharpshooter,eyrie-warden,gangrenous-leech,gannet-nestweaver,golden-eagle-diver,hawk-arrowkeeper,kittiwake-flock,mountain-hare,peak-condor,peregrine-stooper,pika-hoarder,stonedrop-vulture,swamp-alligator,the-gannet-queen,wound-reaver --max-unique 6 --max-copies 4 --budget 2000 --final-games 24 --seed skir1-bpro --focus family:flying,family:ranged,big,open --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 3614 games in 761 s.

- The list (21): Alpine Marmot, Anvil Thrush, Beaver Lumberjack, Chamois Leaper, Chipmunk Hoarder, Eagle-Owl Quartermaster, Eagle Sharpshooter, Eyrie Warden, Gangrenous Leech, Gannet Nestweaver, Golden Eagle Diver, Hawk Arrowkeeper, Kittiwake Flock, Mountain Hare, Peak Condor, Peregrine Stooper, Pika Hoarder, Stonedrop Vulture, Swamp Alligator, The Gannet Queen, Wound Reaver.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 11-1 skirmish's deck; 11-2 skirmish's deck; 11-3 skirmish's deck; 11-4 skirmish's deck; 11-5 elite's deck; 11-6 elite's deck; 11-7 elite's deck; 11-8 elite's deck; 11-9 elite's deck; 11-10 miniboss's deck; reference starter deck under 11-1's field; reference deck (Map 11) under 11-2's field; expected player deck (expectedPlayerDeck) under 11-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | family:flying | swarm (16 copies at 0 Lumber); flying x8 | 92% (89%-94%) | 0.2 | 0: 16, 1: 4 | 4x Kittiwake Flock, 4x Mountain Hare, 4x Pika Hoarder, 4x Stonedrop Vulture, 2x Alpine Marmot, 2x Chipmunk Hoarder | 12 |
| 2 | open | flying x16; strike-first x8 | 90% (87%-93%) | 0.75 | 0: 8, 1: 9, 2: 3 | 4x Golden Eagle Diver, 4x Kittiwake Flock, 4x Peregrine Stooper, 4x Pika Hoarder, 3x Eagle Sharpshooter, 1x Eagle-Owl Quartermaster | 0 |
| 3 | big | big (9 copies at 2+ Lumber, average 1.3); flying x13; day x8 | 82% (79%-86%) | 1.25 | 0: 4, 1: 7, 2: 9 | 4x Eagle Sharpshooter, 4x Hawk Arrowkeeper, 4x Kittiwake Flock, 4x Swamp Alligator, 3x Wound Reaver, 1x The Gannet Queen | 13 |
| 4 | family:ranged | ranged x11; flying x11 | 81% (77%-85%) | 0.95 | 0: 5, 1: 11, 2: 4 | 4x Beaver Lumberjack, 4x Chamois Leaper, 4x Eagle Sharpshooter, 4x Peak Condor, 3x Eagle-Owl Quartermaster, 1x Mountain Hare | 16 |

## Per opponent

| Deck | fight:11-1 | fight:11-2 | fight:11-3 | fight:11-4 | fight:11-5 | fight:11-6 | fight:11-7 | fight:11-8 | fight:11-9 | fight:11-10 | ref:starter | ref:road11 | ref:expected |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 family:flying | 96% | 100% | 96% | 96% | 100% | 100% | 92% | 92% | 92% | 100% | 96% | 54% | 79% |
| 2 open | 100% | 96% | 92% | 83% | 100% | 100% | 92% | 92% | 92% | 100% | 100% | 54% | 71% |
| 3 big | 100% | 92% | 92% | 83% | 88% | 96% | 100% | 83% | 92% | 96% | 92% | 38% | 21% |
| 4 family:ranged | 92% | 88% | 92% | 75% | 88% | 96% | 88% | 79% | 71% | 96% | 92% | 38% | 58% |
