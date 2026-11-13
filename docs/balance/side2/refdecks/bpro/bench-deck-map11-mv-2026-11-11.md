# Focused decks: Map 11 The Aerie Vault (2026-11-13)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map mv --pool anvil-thrush,apollo-butterfly,chamois-leaper,eagle-owl-quartermaster,eyrie-warden,gale-swift,gangrenous-leech,golden-eagle-diver,peak-condor,peregrine-stooper,swamp-alligator,the-gannet-queen --max-unique 6 --max-copies 4 --budget 6000 --final-games 24 --seed skir1-bpro --focus family:flying,family:strike-first,big,open --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 6776 games in 95 s.

- The list (12): Anvil Thrush, Apollo Butterfly, Chamois Leaper, Eagle-Owl Quartermaster, Eyrie Warden, Gale Swift, Gangrenous Leech, Golden Eagle Diver, Peak Condor, Peregrine Stooper, Swamp Alligator, The Gannet Queen.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 11-A-1 skirmish's deck; 11-A-2 skirmish's deck; 11-A-3 skirmish's deck; 11-A-4 boss's deck; reference starter deck under 11-A-1's field; reference deck (Map 15) under 11-A-2's field; expected player deck (expectedPlayerDeck) under 11-A-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | family:flying | flying x16; strike-first x12 | 95% (91%-98%) | 0.8 | 0: 4, 1: 16 | 4x Chamois Leaper, 4x Gale Swift, 4x Golden Eagle Diver, 4x Peak Condor, 4x Peregrine Stooper | 10 |
| 2 | open | flying x16; ranged x7 | 85% (80%-89%) | 0.7 | 0: 6, 1: 14 | 4x Gangrenous Leech, 4x Peak Condor, 3x Apollo Butterfly, 3x Eagle-Owl Quartermaster, 3x Gale Swift, 3x Peregrine Stooper | 0 |
| 3 | family:strike-first | big (7 copies at 2+ Lumber, average 1.2); flying x16; strike-first x8 | 65% (58%-71%) | 1.2 | 0: 6, 1: 7, 2: 4, 3: 3 | 4x Chamois Leaper, 4x The Gannet Queen, 3x Apollo Butterfly, 3x Eyrie Warden, 3x Gale Swift, 3x Peak Condor | 11 |
| 4 | big | big (8 copies at 2+ Lumber, average 1.2); flying x12; strike-first x9 | 57% (51%-64%) | 1.2 | 0: 4, 1: 8, 2: 8 | 4x Apollo Butterfly, 4x Golden Eagle Diver, 4x Swamp Alligator, 4x The Gannet Queen, 3x Gangrenous Leech, 1x Chamois Leaper | 14 |

## Per opponent

| Deck | fight:11-A-1 | fight:11-A-2 | fight:11-A-3 | fight:11-A-4 | ref:starter | ref:road15 | ref:expected |
|---|---|---|---|---|---|---|---|
| 1 family:flying | 100% | 100% | 100% | 96% | 100% | 83% | 83% |
| 2 open | 96% | 100% | 92% | 92% | 100% | 42% | 71% |
| 3 family:strike-first | 58% | 79% | 83% | 67% | 92% | 25% | 50% |
| 4 big | 63% | 96% | 54% | 67% | 79% | 21% | 21% |
