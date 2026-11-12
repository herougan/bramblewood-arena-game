# Focused decks: Map 11 Eyrie Heights (2026-11-12)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map m10 --pool alley-cat,anhinga-spearbird,anvil-thrush,beaver-lumberjack,burrow-rabbit,chamois-leaper,chipmunk-hoarder,eagle-owl-quartermaster,eagle-sharpshooter,eyrie-warden,gangrenous-leech,gannet-nestweaver,giant-cave-huntsman,golden-eagle-diver,kittiwake-flock,mountain-hare,mudpuppy,newt-doctor,otter-centurion,oystercatcher,peak-condor,peregrine-stooper,pika-hoarder,puffin-diver,razorbill,robin-redbreast,stonedrop-vulture,swamp-alligator,the-gannet-queen,wolf-spider-mother,wound-reaver --max-unique 6 --max-copies 4 --budget 8000 --final-games 24 --seed skir1-pro --focus family:flying,family:strike-first,big,open --anchor anvil-thrush,beaver-lumberjack,chamois-leaper,chipmunk-hoarder,eagle-owl-quartermaster,eagle-sharpshooter,eyrie-warden,gangrenous-leech,gannet-nestweaver,golden-eagle-diver,kittiwake-flock,mountain-hare,peak-condor,peregrine-stooper,pika-hoarder,stonedrop-vulture,swamp-alligator,the-gannet-queen,wound-reaver --anchor-min 10 --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 9568 games in 130 s.

- The list (31): Alley Cat, Anhinga Spearbird, Anvil Thrush, Beaver Lumberjack, Burrow Rabbit, Chamois Leaper, Chipmunk Hoarder, Eagle-Owl Quartermaster, Eagle Sharpshooter, Eyrie Warden, Gangrenous Leech, Gannet Nestweaver, Giant Cave Huntsman, Golden Eagle Diver, Kittiwake Flock, Mountain Hare, Mudpuppy, Newt Doctor, Otter Centurion, Oystercatcher, Peak Condor, Peregrine Stooper, Pika Hoarder, Puffin Diver, Razorbill, Robin Redbreast, Stonedrop Vulture, Swamp Alligator, The Gannet Queen, Wolf Spider Mother, Wound Reaver.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 11-1 skirmish's deck; 11-2 skirmish's deck; 11-3 skirmish's deck; 11-4 skirmish's deck; 11-5 elite's deck; 11-6 elite's deck; 11-7 elite's deck; 11-8 elite's deck; 11-9 elite's deck; 11-10 miniboss's deck; reference starter deck under 11-1's field; reference deck (Map 11) under 11-2's field; expected player deck (expectedPlayerDeck) under 11-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | family:flying | flying x16; day x8 | 95% (92%-97%) | 0.5 | 0: 12, 1: 6, 2: 2 | 4x Kittiwake Flock, 4x Mountain Hare, 4x Robin Redbreast, 4x Stonedrop Vulture, 2x Eagle Sharpshooter, 2x Golden Eagle Diver | 10 |
| 2 | family:strike-first | flying x15; strike-first x9 | 94% (92%-97%) | 0.8 | 0: 4, 1: 16 | 4x Burrow Rabbit, 4x Golden Eagle Diver, 4x Peregrine Stooper, 4x Stonedrop Vulture, 3x Eagle-Owl Quartermaster, 1x Giant Cave Huntsman | 13 |
| 3 | open | flying x15; ranged x7 | 88% (85%-91%) | 0.7 | 0: 6, 1: 14 | 4x Kittiwake Flock, 4x Puffin Diver, 4x Stonedrop Vulture, 3x Eagle-Owl Quartermaster, 3x Wolf Spider Mother, 2x Mountain Hare | 0 |
| 4 | big | big (8 copies at 2+ Lumber, average 0.9); flying x8; ranged x7 | 83% (79%-86%) | 0.95 | 0: 9, 1: 3, 2: 8 | 4x Alley Cat, 4x Eagle Sharpshooter, 4x Pika Hoarder, 4x Swamp Alligator, 3x Stonedrop Vulture, 1x Robin Redbreast | 17 |

## Per opponent

| Deck | fight:11-1 | fight:11-2 | fight:11-3 | fight:11-4 | fight:11-5 | fight:11-6 | fight:11-7 | fight:11-8 | fight:11-9 | fight:11-10 | ref:starter | ref:road11 | ref:expected |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 family:flying | 96% | 100% | 96% | 100% | 100% | 96% | 92% | 92% | 92% | 96% | 100% | 83% | 88% |
| 2 family:strike-first | 96% | 100% | 100% | 100% | 96% | 100% | 96% | 100% | 92% | 96% | 100% | 71% | 79% |
| 3 open | 71% | 96% | 92% | 92% | 88% | 96% | 100% | 100% | 88% | 100% | 96% | 42% | 83% |
| 4 big | 96% | 96% | 92% | 100% | 67% | 100% | 96% | 79% | 71% | 75% | 96% | 58% | 50% |
