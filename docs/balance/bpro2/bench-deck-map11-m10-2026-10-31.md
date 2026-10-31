# Focused decks: Map 11 Eyrie Heights (2026-10-31)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map m10 --pool alpine-marmot,alpine-salamander,alpine-swift,apollo-butterfly,chamois-leaper,chipmunk-hoarder,eagle-owl-quartermaster,eyrie-warden,gale-swift,gangrenous-leech,gannet-nestweaver,golden-eagle-diver,ibex-rockcaller,mountain-hare,peak-condor,peregrine-stooper,swamp-alligator,wound-reaver --max-unique 6 --max-copies 4 --budget 6000 --final-games 24 --seed bpro2 --focus economy,big,swarm,open --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 7280 games in 93 s.

- The list (18): Alpine Marmot, Alpine Salamander, Alpine Swift, Apollo Butterfly, Chamois Leaper, Chipmunk Hoarder, Eagle-Owl Quartermaster, Eyrie Warden, Gale Swift, Gangrenous Leech, Gannet Nestweaver, Golden Eagle Diver, Ibex Rockcaller, Mountain Hare, Peak Condor, Peregrine Stooper, Swamp Alligator, Wound Reaver.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 11-1 skirmish's deck; 11-2 skirmish's deck; 11-3 skirmish's deck; 11-4 skirmish's deck; 11-5 elite's deck; 11-6 elite's deck; 11-7 elite's deck; 11-8 elite's deck; 11-9 elite's deck; 11-10 miniboss's deck; reference starter deck under 11-1's field; reference deck (Map 11) under 11-2's field; expected player deck (expectedPlayerDeck) under 11-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | open | flying x11 | 96% (95%-98%) | 0.65 | 0: 7, 1: 13 | 4x Alpine Salamander, 4x Gale Swift, 4x Golden Eagle Diver, 3x Alpine Marmot, 3x Eagle-Owl Quartermaster, 2x Ibex Rockcaller | 0 |
| 2 | economy | swarm (14 copies at 0 Lumber); economy (6 resource makers); flying x9 | 88% (84%-91%) | 0.3 | 0: 14, 1: 6 | 4x Alpine Marmot, 4x Chipmunk Hoarder, 4x Gale Swift, 3x Alpine Salamander, 3x Eagle-Owl Quartermaster, 2x Gannet Nestweaver | 7 |
| 3 | swarm | swarm (14 copies at 0 Lumber); flying x10 | 85% (81%-88%) | 0.3 | 0: 14, 1: 6 | 4x Alpine Marmot, 4x Gale Swift, 4x Golden Eagle Diver, 4x Mountain Hare, 2x Apollo Butterfly, 2x Wound Reaver | 9 |
| 4 | big | big (8 copies at 2+ Lumber, average 1.3); flying x10 | 73% (69%-78%) | 1.3 | 0: 6, 1: 6, 2: 4, 3: 4 | 4x Eyrie Warden, 4x Gale Swift, 4x Swamp Alligator, 3x Alpine Salamander, 3x Wound Reaver, 2x Apollo Butterfly | 13 |

## Per opponent

| Deck | fight:11-1 | fight:11-2 | fight:11-3 | fight:11-4 | fight:11-5 | fight:11-6 | fight:11-7 | fight:11-8 | fight:11-9 | fight:11-10 | ref:starter | ref:road11 | ref:expected |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 open | 100% | 96% | 96% | 100% | 100% | 100% | 100% | 100% | 92% | 100% | 96% | 75% | 100% |
| 2 economy | 100% | 100% | 88% | 88% | 88% | 96% | 96% | 79% | 79% | 83% | 100% | 63% | 83% |
| 3 swarm | 92% | 100% | 75% | 96% | 77% | 88% | 83% | 96% | 63% | 88% | 100% | 46% | 100% |
| 4 big | 100% | 92% | 83% | 67% | 79% | 92% | 67% | 63% | 67% | 88% | 83% | 17% | 58% |
