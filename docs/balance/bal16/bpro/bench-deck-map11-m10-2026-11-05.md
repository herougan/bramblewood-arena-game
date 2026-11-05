# Focused decks: Map 11 Eyrie Heights (2026-11-05)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map m10 --pool alpine-marmot,alpine-salamander,alpine-swift,beaver-lumberjack,chamois-leaper,chipmunk-hoarder,eagle-owl-quartermaster,eyrie-warden,gangrenous-leech,gannet-nestweaver,golden-eagle-diver,ibex-rockcaller,kittiwake-flock,mountain-hare,peak-condor,peregrine-stooper,red-billed-chough,swamp-alligator,wound-reaver --max-unique 6 --max-copies 4 --budget 6000 --final-games 24 --seed bal16-bpro --focus family:flying,family:strike-first,big,open --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 7368 games in 144 s.

- The list (19): Alpine Marmot, Alpine Salamander, Alpine Swift, Beaver Lumberjack, Chamois Leaper, Chipmunk Hoarder, Eagle-Owl Quartermaster, Eyrie Warden, Gangrenous Leech, Gannet Nestweaver, Golden Eagle Diver, Ibex Rockcaller, Kittiwake Flock, Mountain Hare, Peak Condor, Peregrine Stooper, Red-billed Chough, Swamp Alligator, Wound Reaver.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 11-1 skirmish's deck; 11-2 skirmish's deck; 11-3 skirmish's deck; 11-4 skirmish's deck; 11-5 elite's deck; 11-6 elite's deck; 11-7 elite's deck; 11-8 elite's deck; 11-9 elite's deck; reference starter deck under 11-1's field; reference deck (Map 11) under 11-2's field; expected player deck (expectedPlayerDeck) under 11-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | family:strike-first | flying x12; strike-first x8 | 96% (94%-98%) | 0.9 | 0: 2, 1: 18 | 4x Alpine Salamander, 4x Golden Eagle Diver, 4x Peak Condor, 4x Peregrine Stooper, 2x Alpine Marmot, 2x Ibex Rockcaller | 10 |
| 2 | family:flying | flying x9 | 83% (80%-87%) | 0.5 | 0: 10, 1: 10 | 4x Alpine Marmot, 4x Beaver Lumberjack, 4x Golden Eagle Diver, 3x Eagle-Owl Quartermaster, 3x Wound Reaver, 2x Red-billed Chough | 12 |
| 3 | open | strike-first x12; flying x12 | 81% (77%-85%) | 0.6 | 0: 8, 1: 12 | 4x Alpine Marmot, 4x Alpine Swift, 4x Chamois Leaper, 4x Golden Eagle Diver, 4x Peak Condor | 0 |
| 4 | big | big (8 copies at 2+ Lumber, average 1.4); flying x7 | 76% (72%-80%) | 1.4 | 0: 4, 1: 8, 2: 4, 3: 4 | 4x Alpine Marmot, 4x Eyrie Warden, 4x Swamp Alligator, 3x Eagle-Owl Quartermaster, 3x Wound Reaver, 2x Ibex Rockcaller | 16 |

## Per opponent

| Deck | fight:11-1 | fight:11-2 | fight:11-3 | fight:11-4 | fight:11-5 | fight:11-6 | fight:11-7 | fight:11-8 | fight:11-9 | ref:starter | ref:road11 | ref:expected |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 family:strike-first | 100% | 100% | 100% | 96% | 100% | 100% | 100% | 100% | 100% | 100% | 71% | 83% |
| 2 family:flying | 88% | 96% | 88% | 88% | 96% | 96% | 85% | 88% | 92% | 92% | 21% | 71% |
| 3 open | 88% | 100% | 63% | 92% | 92% | 100% | 96% | 92% | 67% | 100% | 29% | 54% |
| 4 big | 83% | 92% | 88% | 88% | 83% | 100% | 96% | 79% | 71% | 79% | 4% | 46% |
