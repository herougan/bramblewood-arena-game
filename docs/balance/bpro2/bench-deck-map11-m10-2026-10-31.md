# Focused decks: Map 11 Eyrie Heights (2026-11-02)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map m10 --pool alpine-marmot,alpine-salamander,alpine-swift,apollo-butterfly,chamois-leaper,chipmunk-hoarder,eagle-owl-quartermaster,eyrie-warden,gale-swift,gangrenous-leech,gannet-nestweaver,golden-eagle-diver,ibex-rockcaller,mountain-hare,peak-condor,peregrine-stooper,swamp-alligator,wound-reaver --max-unique 6 --max-copies 4 --budget 6000 --final-games 24 --seed bpro2 --focus economy,big,swarm,open --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 7072 games in 131 s.

- The list (18): Alpine Marmot, Alpine Salamander, Alpine Swift, Apollo Butterfly, Chamois Leaper, Chipmunk Hoarder, Eagle-Owl Quartermaster, Eyrie Warden, Gale Swift, Gangrenous Leech, Gannet Nestweaver, Golden Eagle Diver, Ibex Rockcaller, Mountain Hare, Peak Condor, Peregrine Stooper, Swamp Alligator, Wound Reaver.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 11-1 skirmish's deck; 11-2 skirmish's deck; 11-3 skirmish's deck; 11-4 skirmish's deck; 11-5 elite's deck; 11-6 elite's deck; 11-7 elite's deck; 11-8 elite's deck; 11-9 elite's deck; 11-10 miniboss's deck; reference starter deck under 11-1's field; reference deck (Map 11) under 11-2's field; expected player deck (expectedPlayerDeck) under 11-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | open | flying x16 | 89% (86%-92%) | 0.55 | 0: 9, 1: 11 | 4x Apollo Butterfly, 4x Gale Swift, 4x Peak Condor, 4x Peregrine Stooper, 3x Wound Reaver, 1x Chipmunk Hoarder | 0 |
| 2 | swarm | swarm (14 copies at 0 Lumber); flying x12 | 86% (83%-90%) | 0.3 | 0: 14, 1: 6 | 4x Alpine Marmot, 4x Apollo Butterfly, 4x Gale Swift, 4x Peak Condor, 2x Chipmunk Hoarder, 2x Ibex Rockcaller | 7 |
| 3 | economy | economy (8 resource makers); flying x7 | 77% (72%-81%) | 0.4 | 0: 12, 1: 8 | 4x Alpine Marmot, 4x Chipmunk Hoarder, 4x Gannet Nestweaver, 3x Eagle-Owl Quartermaster, 3x Wound Reaver, 2x Ibex Rockcaller | 16 |
| 4 | big | big (8 copies at 2+ Lumber, average 1.2); economy (4 resource makers); flying x10 | 67% (62%-72%) | 1.2 | 0: 8, 1: 4, 2: 4, 3: 4 | 4x Chipmunk Hoarder, 4x Eyrie Warden, 4x Peak Condor, 4x Swamp Alligator, 2x Alpine Marmot, 2x Apollo Butterfly | 13 |

## Per opponent

| Deck | fight:11-1 | fight:11-2 | fight:11-3 | fight:11-4 | fight:11-5 | fight:11-6 | fight:11-7 | fight:11-8 | fight:11-9 | fight:11-10 | ref:starter | ref:road11 | ref:expected |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 open | 100% | 96% | 100% | 96% | 83% | 100% | 75% | 83% | 88% | 92% | 100% | 54% | 88% |
| 2 swarm | 100% | 88% | 96% | 96% | 75% | 100% | 75% | 88% | 88% | 88% | 100% | 46% | 83% |
| 3 economy | 100% | 71% | 88% | 92% | 58% | 92% | 63% | 71% | 71% | 79% | 100% | 42% | 71% |
| 4 big | 88% | 75% | 79% | 79% | 54% | 75% | 50% | 33% | 88% | 79% | 96% | 17% | 58% |
