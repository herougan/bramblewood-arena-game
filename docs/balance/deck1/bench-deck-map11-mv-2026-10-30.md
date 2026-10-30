# Focused decks: Map 11 The Aerie Vault (2026-10-30)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map mv --pool alpine-marmot,alpine-salamander,alpine-swift,anhinga-spearbird,apollo-butterfly,blue-ringed-octopus,caiman-hatchling,chamois-leaper,chipmunk-hoarder,dust-hyena,eagle-owl-quartermaster,eyrie-warden,gale-swift,gangrenous-leech,golden-eagle-diver,grave-grin-hyena,hoopoe-herald,ibex-rockcaller,mountain-hare,otter-centurion,peregrine-stooper,red-billed-chough,seed-cache-squirrel,swamp-alligator,wolf-spider-mother,wound-reaver --max-unique 6 --max-copies 4 --budget 12000 --final-games 24 --seed deck1 --focus economy,big,swarm,open --anchor alpine-marmot,alpine-salamander,alpine-swift,apollo-butterfly,chamois-leaper,chipmunk-hoarder,eagle-owl-quartermaster,eyrie-warden,gale-swift,gangrenous-leech,golden-eagle-diver,ibex-rockcaller,swamp-alligator,wound-reaver --anchor-min 10 --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 12950 games in 235 s.

- The list (26): Alpine Marmot, Alpine Salamander, Alpine Swift, Anhinga Spearbird, Apollo Butterfly, Blue-ringed Octopus, Caiman Hatchling, Chamois Leaper, Chipmunk Hoarder, Dust Hyena, Eagle-Owl Quartermaster, Eyrie Warden, Gale Swift, Gangrenous Leech, Golden Eagle Diver, Grave-Grin Hyena, Hoopoe Herald, Ibex Rockcaller, Mountain Hare, Otter Centurion, Peregrine Stooper, Red-billed Chough, Seed-cache Squirrel, Swamp Alligator, Wolf Spider Mother, Wound Reaver.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 11-A-1 skirmish's deck; 11-A-2 skirmish's deck; 11-A-3 skirmish's deck; 11-A-4 boss's deck; reference starter deck under 11-A-1's field; reference deck (Map 15) under 11-A-2's field; expected player deck (expectedPlayerDeck) under 11-A-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | swarm | swarm (14 copies at 0 Lumber); flying x10 | 90% (85%-94%) | 0.3 | 0: 14, 1: 6 | 4x Gale Swift, 4x Hoopoe Herald, 3x Apollo Butterfly, 3x Chipmunk Hoarder, 3x Eagle-Owl Quartermaster, 3x Wolf Spider Mother | 11 |
| 2 | economy | economy (8 resource makers) | 89% (84%-93%) | 0.4 | 0: 12, 1: 8 | 4x Alpine Marmot, 4x Chipmunk Hoarder, 4x Dust Hyena, 3x Eagle-Owl Quartermaster, 3x Wolf Spider Mother, 2x Golden Eagle Diver | 8 |
| 3 | big | big (8 copies at 2+ Lumber, average 1.4); flying x11 | 88% (83%-92%) | 1.4 | 0: 4, 1: 8, 2: 4, 3: 4 | 4x Eyrie Warden, 4x Gale Swift, 4x Swamp Alligator, 3x Eagle-Owl Quartermaster, 3x Wolf Spider Mother, 2x Anhinga Spearbird | 10 |
| 4 | open | economy (6 resource makers) | 88% (83%-92%) | 0.7 | 0: 10, 1: 6, 2: 4 | 4x Caiman Hatchling, 4x Swamp Alligator, 3x Chipmunk Hoarder, 3x Dust Hyena, 3x Eagle-Owl Quartermaster, 3x Wolf Spider Mother | 0 |

## Per opponent

| Deck | fight:11-A-1 | fight:11-A-2 | fight:11-A-3 | fight:11-A-4 | ref:starter | ref:road15 | ref:expected |
|---|---|---|---|---|---|---|---|
| 1 swarm | 88% | 88% | 88% | 96% | 100% | 75% | 96% |
| 2 economy | 83% | 79% | 88% | 96% | 100% | 75% | 100% |
| 3 big | 83% | 83% | 92% | 96% | 100% | 67% | 92% |
| 4 open | 92% | 88% | 96% | 79% | 96% | 67% | 96% |
