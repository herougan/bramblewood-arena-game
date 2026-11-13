# Focused decks: Map 11 The Aerie Vault (2026-11-12)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map mv --pool anvil-thrush,chamois-leaper,eagle-owl-quartermaster,eyrie-warden,gangrenous-leech,golden-eagle-diver,great-horned-owl,peak-condor,peregrine-stooper,swamp-alligator,the-gannet-queen,wound-reaver --max-unique 6 --max-copies 4 --budget 6000 --final-games 24 --seed skir1-bpro --focus family:flying,family:strike-first,big,open --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 6776 games in 162 s.

- The list (12): Anvil Thrush, Chamois Leaper, Eagle-Owl Quartermaster, Eyrie Warden, Gangrenous Leech, Golden Eagle Diver, Great Horned Owl, Peak Condor, Peregrine Stooper, Swamp Alligator, The Gannet Queen, Wound Reaver.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 11-A-1 skirmish's deck; 11-A-2 skirmish's deck; 11-A-3 skirmish's deck; 11-A-4 boss's deck; reference starter deck under 11-A-1's field; reference deck (Map 15) under 11-A-2's field; expected player deck (expectedPlayerDeck) under 11-A-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | family:flying | flying x13; strike-first x10 | 90% (86%-95%) | 1 | 1: 20 | 4x Chamois Leaper, 4x Peak Condor, 4x Peregrine Stooper, 3x Eagle-Owl Quartermaster, 3x Wound Reaver, 2x Golden Eagle Diver | 11 |
| 2 | family:strike-first | big (8 copies at 2+ Lumber, average 1.4); flying x17; strike-first x9 | 76% (70%-82%) | 1.4 | 1: 12, 2: 8 | 4x Golden Eagle Diver, 4x Great Horned Owl, 4x Peak Condor, 4x The Gannet Queen, 3x Wound Reaver, 1x Peregrine Stooper | 12 |
| 3 | big | big (8 copies at 2+ Lumber, average 1.4); flying x15; siege x8 | 60% (54%-67%) | 1.45 | 0: 3, 1: 9, 2: 4, 3: 4 | 4x Eyrie Warden, 4x Gangrenous Leech, 4x Great Horned Owl, 4x Peak Condor, 3x Anvil Thrush, 1x Chamois Leaper | 10 |
| 4 | open | flying x14; strike-first x11 | 59% (52%-65%) | 1 | 0: 3, 1: 14, 2: 3 | 4x Golden Eagle Diver, 4x Peregrine Stooper, 3x Anvil Thrush, 3x Chamois Leaper, 3x Gangrenous Leech, 3x Great Horned Owl | 0 |

## Per opponent

| Deck | fight:11-A-1 | fight:11-A-2 | fight:11-A-3 | fight:11-A-4 | ref:starter | ref:road15 | ref:expected |
|---|---|---|---|---|---|---|---|
| 1 family:flying | 88% | 83% | 100% | 100% | 100% | 75% | 88% |
| 2 family:strike-first | 67% | 83% | 88% | 92% | 92% | 58% | 54% |
| 3 big | 67% | 79% | 67% | 71% | 96% | 8% | 35% |
| 4 open | 63% | 50% | 88% | 67% | 96% | 15% | 33% |
