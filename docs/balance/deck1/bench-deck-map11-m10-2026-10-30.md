# Focused decks: Map 11 Eyrie Heights (2026-10-30)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map m10 --pool alley-cat,alpine-marmot,alpine-salamander,alpine-swift,anhinga-spearbird,apollo-butterfly,chamois-leaper,chipmunk-hoarder,eagle-owl-quartermaster,eyrie-warden,fulmar-spitter,gale-swift,gangrenous-leech,gannet-nestweaver,golden-eagle-diver,ibex-rockcaller,mountain-hare,mudpuppy,newt-doctor,otter-centurion,peak-condor,peregrine-stooper,puffin-diver,razorbill,red-billed-chough,seed-cache-squirrel,swamp-alligator,swordfish-spearman,wolf-spider-mother,wound-reaver --max-unique 6 --max-copies 4 --budget 12000 --final-games 24 --seed deck1 --focus economy,big,swarm,open --anchor alpine-marmot,alpine-salamander,alpine-swift,apollo-butterfly,chamois-leaper,chipmunk-hoarder,eagle-owl-quartermaster,eyrie-warden,gale-swift,gangrenous-leech,gannet-nestweaver,golden-eagle-diver,ibex-rockcaller,mountain-hare,peak-condor,peregrine-stooper,swamp-alligator,wound-reaver --anchor-min 10 --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 13390 games in 224 s.

- The list (30): Alley Cat, Alpine Marmot, Alpine Salamander, Alpine Swift, Anhinga Spearbird, Apollo Butterfly, Chamois Leaper, Chipmunk Hoarder, Eagle-Owl Quartermaster, Eyrie Warden, Fulmar Spitter, Gale Swift, Gangrenous Leech, Gannet Nestweaver, Golden Eagle Diver, Ibex Rockcaller, Mountain Hare, Mudpuppy, Newt Doctor, Otter Centurion, Peak Condor, Peregrine Stooper, Puffin Diver, Razorbill, Red-billed Chough, Seed-cache Squirrel, Swamp Alligator, Swordfish Spearman, Wolf Spider Mother, Wound Reaver.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 11-1 skirmish's deck; 11-2 skirmish's deck; 11-3 skirmish's deck; 11-4 skirmish's deck; 11-5 elite's deck; 11-6 elite's deck; 11-7 elite's deck; 11-8 elite's deck; 11-9 elite's deck; 11-10 miniboss's deck; reference starter deck under 11-1's field; reference deck (Map 11) under 11-2's field; expected player deck (expectedPlayerDeck) under 11-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | open | economy (4 resource makers); flying x11 | 94% (91%-96%) | 0.7 | 0: 8, 1: 10, 2: 2 | 4x Anhinga Spearbird, 4x Gale Swift, 4x Gannet Nestweaver, 3x Eagle-Owl Quartermaster, 3x Wolf Spider Mother, 2x Swamp Alligator | 0 |
| 2 | economy | economy (8 resource makers); flying x13 | 88% (85%-92%) | 0.6 | 0: 8, 1: 12 | 4x Chipmunk Hoarder, 4x Gannet Nestweaver, 4x Peregrine Stooper, 3x Eagle-Owl Quartermaster, 3x Wolf Spider Mother, 2x Fulmar Spitter | 10 |
| 3 | swarm | swarm (17 copies at 0 Lumber); flying x7 | 88% (85%-91%) | 0.15 | 0: 17, 1: 3 | 4x Alpine Marmot, 4x Gale Swift, 3x Alley Cat, 3x Apollo Butterfly, 3x Newt Doctor, 3x Wolf Spider Mother | 13 |
| 4 | big | big (8 copies at 2+ Lumber, average 1.4); economy (4 resource makers); flying x11 | 88% (84%-91%) | 1.4 | 0: 4, 1: 8, 2: 4, 3: 4 | 4x Eyrie Warden, 4x Gannet Nestweaver, 4x Swamp Alligator, 3x Eagle-Owl Quartermaster, 3x Wolf Spider Mother, 2x Alpine Salamander | 8 |

## Per opponent

| Deck | fight:11-1 | fight:11-2 | fight:11-3 | fight:11-4 | fight:11-5 | fight:11-6 | fight:11-7 | fight:11-8 | fight:11-9 | fight:11-10 | ref:starter | ref:road11 | ref:expected |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 open | 100% | 79% | 92% | 96% | 96% | 96% | 100% | 96% | 92% | 100% | 100% | 75% | 100% |
| 2 economy | 100% | 88% | 88% | 83% | 75% | 100% | 88% | 92% | 79% | 100% | 96% | 63% | 100% |
| 3 swarm | 96% | 88% | 92% | 88% | 92% | 96% | 96% | 92% | 67% | 92% | 100% | 50% | 100% |
| 4 big | 96% | 67% | 88% | 88% | 88% | 100% | 96% | 88% | 92% | 100% | 96% | 52% | 92% |
