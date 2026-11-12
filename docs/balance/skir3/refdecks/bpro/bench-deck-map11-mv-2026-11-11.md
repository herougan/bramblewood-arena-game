# Focused decks: Map 11 The Aerie Vault (2026-11-12)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map mv --pool alpine-swift,apollo-butterfly,chamois-leaper,chipmunk-hoarder,eagle-owl-quartermaster,eyrie-warden,gangrenous-leech,great-horned-owl,swamp-alligator,the-gannet-queen,wound-reaver --max-unique 6 --max-copies 4 --budget 6000 --final-games 24 --seed skir1-bpro --focus family:flying,family:strike-first,big,open --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 6622 games in 156 s.

- The list (11): Alpine Swift, Apollo Butterfly, Chamois Leaper, Chipmunk Hoarder, Eagle-Owl Quartermaster, Eyrie Warden, Gangrenous Leech, Great Horned Owl, Swamp Alligator, The Gannet Queen, Wound Reaver.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 11-A-1 skirmish's deck; 11-A-2 skirmish's deck; 11-A-3 skirmish's deck; 11-A-4 boss's deck; reference starter deck under 11-A-1's field; reference deck (Map 15) under 11-A-2's field; expected player deck (expectedPlayerDeck) under 11-A-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | family:flying | big (6 copies at 2+ Lumber, average 1.2); flying x9; siege x6 | 70% (65%-75%) | 1.2 | 0: 4, 1: 10, 2: 4, 3: 2 | 4x Chamois Leaper, 4x Chipmunk Hoarder, 4x Great Horned Owl, 3x Eagle-Owl Quartermaster, 3x Wound Reaver, 2x Eyrie Warden | 11 |
| 2 | big | big (8 copies at 2+ Lumber, average 1.1); flying x10 | 65% (59%-71%) | 1.1 | 0: 6, 1: 6, 2: 8 | 4x Chipmunk Hoarder, 4x Gangrenous Leech, 4x Great Horned Owl, 4x The Gannet Queen, 2x Apollo Butterfly, 2x Wound Reaver | 12 |
| 3 | family:strike-first | flying x11; strike-first x8 | 61% (55%-67%) | 0.85 | 0: 8, 1: 7, 2: 5 | 4x Alpine Swift, 4x Apollo Butterfly, 4x Chamois Leaper, 3x Great Horned Owl, 3x Wound Reaver, 2x Swamp Alligator | 10 |
| 4 | open | flying x6 | 54% (47%-61%) | 0.85 | 0: 7, 1: 9, 2: 4 | 4x Apollo Butterfly, 4x Chamois Leaper, 4x Swamp Alligator, 3x Chipmunk Hoarder, 3x Gangrenous Leech, 2x Eagle-Owl Quartermaster | 0 |

## Per opponent

| Deck | fight:11-A-1 | fight:11-A-2 | fight:11-A-3 | fight:11-A-4 | ref:starter | ref:road15 | ref:expected |
|---|---|---|---|---|---|---|---|
| 1 family:flying | 63% | 83% | 92% | 100% | 100% | 21% | 33% |
| 2 big | 63% | 83% | 79% | 88% | 83% | 25% | 33% |
| 3 family:strike-first | 42% | 54% | 79% | 96% | 100% | 29% | 25% |
| 4 open | 40% | 75% | 58% | 63% | 83% | 21% | 38% |
