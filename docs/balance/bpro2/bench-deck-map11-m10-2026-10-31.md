# Focused decks: Map 11 Eyrie Heights (2026-11-01)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map m10 --pool alpine-marmot,alpine-salamander,alpine-swift,apollo-butterfly,chamois-leaper,chipmunk-hoarder,eagle-owl-quartermaster,eyrie-warden,gale-swift,gangrenous-leech,gannet-nestweaver,golden-eagle-diver,ibex-rockcaller,mountain-hare,peak-condor,peregrine-stooper,swamp-alligator,wound-reaver --max-unique 6 --max-copies 4 --budget 6000 --final-games 24 --seed bpro2 --focus economy,big,swarm,open --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 7358 games in 115 s.

- The list (18): Alpine Marmot, Alpine Salamander, Alpine Swift, Apollo Butterfly, Chamois Leaper, Chipmunk Hoarder, Eagle-Owl Quartermaster, Eyrie Warden, Gale Swift, Gangrenous Leech, Gannet Nestweaver, Golden Eagle Diver, Ibex Rockcaller, Mountain Hare, Peak Condor, Peregrine Stooper, Swamp Alligator, Wound Reaver.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 11-1 skirmish's deck; 11-2 skirmish's deck; 11-3 skirmish's deck; 11-4 skirmish's deck; 11-5 elite's deck; 11-6 elite's deck; 11-7 elite's deck; 11-8 elite's deck; 11-9 elite's deck; 11-10 miniboss's deck; reference starter deck under 11-1's field; reference deck (Map 11) under 11-2's field; expected player deck (expectedPlayerDeck) under 11-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | open | flying x11 | 96% (93%-98%) | 0.65 | 0: 7, 1: 13 | 4x Alpine Salamander, 4x Gale Swift, 4x Peregrine Stooper, 3x Alpine Marmot, 3x Eagle-Owl Quartermaster, 2x Wound Reaver | 0 |
| 2 | economy | economy (6 resource makers); flying x14 | 89% (86%-92%) | 0.55 | 0: 9, 1: 11 | 4x Golden Eagle Diver, 4x Peak Condor, 3x Chipmunk Hoarder, 3x Gale Swift, 3x Gannet Nestweaver, 3x Wound Reaver | 15 |
| 3 | swarm | swarm (14 copies at 0 Lumber); flying x14; ranged x6 | 86% (82%-89%) | 0.3 | 0: 14, 1: 6 | 4x Apollo Butterfly, 4x Gale Swift, 4x Mountain Hare, 4x Peak Condor, 2x Alpine Marmot, 2x Eagle-Owl Quartermaster | 12 |
| 4 | big | big (8 copies at 2+ Lumber, average 1.1); flying x13 | 72% (68%-77%) | 1.1 | 0: 10, 1: 2, 2: 4, 3: 4 | 4x Eyrie Warden, 4x Gale Swift, 4x Swamp Alligator, 3x Alpine Marmot, 3x Apollo Butterfly, 2x Peregrine Stooper | 11 |

## Per opponent

| Deck | fight:11-1 | fight:11-2 | fight:11-3 | fight:11-4 | fight:11-5 | fight:11-6 | fight:11-7 | fight:11-8 | fight:11-9 | fight:11-10 | ref:starter | ref:road11 | ref:expected |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 open | 100% | 96% | 96% | 96% | 100% | 96% | 100% | 96% | 100% | 100% | 100% | 63% | 100% |
| 2 economy | 100% | 92% | 92% | 88% | 96% | 100% | 83% | 92% | 83% | 88% | 100% | 46% | 100% |
| 3 swarm | 100% | 90% | 96% | 79% | 96% | 88% | 92% | 81% | 71% | 92% | 100% | 42% | 92% |
| 4 big | 96% | 83% | 79% | 83% | 71% | 79% | 54% | 63% | 63% | 88% | 79% | 17% | 83% |
