# Focused decks: Map 11 Eyrie Heights (2026-11-10)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map m10 --pool alley-cat,alpine-marmot,anhinga-spearbird,anvil-thrush,beaver-lumberjack,burrow-rabbit,chamois-leaper,chipmunk-hoarder,eagle-owl-quartermaster,eagle-sharpshooter,eyrie-warden,gangrenous-leech,gannet-nestweaver,golden-eagle-diver,hawk-arrowkeeper,kittiwake-flock,mountain-hare,mudpuppy,nautilus-drifter,otter-centurion,oystercatcher,peak-condor,peregrine-stooper,pika-hoarder,puffin-diver,razorbill,robin-redbreast,stonedrop-vulture,swamp-alligator,the-gannet-queen,tide-spirit,wolf-spider-mother,wound-reaver --max-unique 6 --max-copies 4 --budget 1200 --final-games 24 --seed skir1-pro --focus family:flying,family:ranged,big,open --anchor alpine-marmot,anvil-thrush,beaver-lumberjack,chamois-leaper,chipmunk-hoarder,eagle-owl-quartermaster,eagle-sharpshooter,eyrie-warden,gangrenous-leech,gannet-nestweaver,golden-eagle-diver,hawk-arrowkeeper,kittiwake-flock,mountain-hare,peak-condor,peregrine-stooper,pika-hoarder,stonedrop-vulture,swamp-alligator,the-gannet-queen,wound-reaver --anchor-min 10 --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 2990 games in 780 s.

- The list (33): Alley Cat, Alpine Marmot, Anhinga Spearbird, Anvil Thrush, Beaver Lumberjack, Burrow Rabbit, Chamois Leaper, Chipmunk Hoarder, Eagle-Owl Quartermaster, Eagle Sharpshooter, Eyrie Warden, Gangrenous Leech, Gannet Nestweaver, Golden Eagle Diver, Hawk Arrowkeeper, Kittiwake Flock, Mountain Hare, Mudpuppy, Nautilus Drifter, Otter Centurion, Oystercatcher, Peak Condor, Peregrine Stooper, Pika Hoarder, Puffin Diver, Razorbill, Robin Redbreast, Stonedrop Vulture, Swamp Alligator, The Gannet Queen, Tide Seahorse, Wolf Spider Mother, Wound Reaver.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 11-1 skirmish's deck; 11-2 skirmish's deck; 11-3 skirmish's deck; 11-4 skirmish's deck; 11-5 elite's deck; 11-6 elite's deck; 11-7 elite's deck; 11-8 elite's deck; 11-9 elite's deck; 11-10 miniboss's deck; reference starter deck under 11-1's field; reference deck (Map 11) under 11-2's field; expected player deck (expectedPlayerDeck) under 11-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | family:flying | swarm (16 copies at 0 Lumber); flying x14 | 95% (93%-97%) | 0.2 | 0: 16, 1: 4 | 4x Kittiwake Flock, 4x Robin Redbreast, 4x Stonedrop Vulture, 3x Alley Cat, 3x Mudpuppy, 2x Gannet Nestweaver | 10 |
| 2 | family:ranged | ranged x8; flying x8 | 92% (89%-95%) | 0.5 | 0: 10, 1: 10 | 4x Alpine Marmot, 4x Peak Condor, 4x Pika Hoarder, 4x Stonedrop Vulture, 2x Burrow Rabbit, 2x Nautilus Drifter | 20 |
| 3 | open | flying x10; strike-first x7 | 88% (85%-92%) | 0.5 | 0: 10, 1: 10 | 4x Chamois Leaper, 4x Kittiwake Flock, 3x Alley Cat, 3x Anhinga Spearbird, 3x Hawk Arrowkeeper, 3x Robin Redbreast | 0 |
| 4 | big | big (8 copies at 2+ Lumber, average 1.0); flying x14; ranged x8 | 83% (79%-87%) | 1 | 0: 8, 1: 4, 2: 8 | 4x Eagle Sharpshooter, 4x Pika Hoarder, 4x Stonedrop Vulture, 4x The Gannet Queen, 2x Robin Redbreast, 2x Tide Seahorse | 18 |

## Per opponent

| Deck | fight:11-1 | fight:11-2 | fight:11-3 | fight:11-4 | fight:11-5 | fight:11-6 | fight:11-7 | fight:11-8 | fight:11-9 | fight:11-10 | ref:starter | ref:road11 | ref:expected |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 family:flying | 100% | 100% | 96% | 100% | 100% | 100% | 100% | 100% | 100% | 100% | 100% | 73% | 71% |
| 2 family:ranged | 96% | 96% | 96% | 92% | 100% | 100% | 100% | 88% | 100% | 96% | 100% | 54% | 79% |
| 3 open | 96% | 92% | 88% | 94% | 92% | 100% | 96% | 83% | 88% | 100% | 100% | 58% | 63% |
| 4 big | 75% | 96% | 96% | 79% | 96% | 100% | 92% | 88% | 75% | 88% | 96% | 46% | 54% |
