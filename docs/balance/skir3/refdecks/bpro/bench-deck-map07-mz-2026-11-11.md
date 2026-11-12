# Focused decks: Map 7 The Mycelium Deep (2026-11-12)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map mz --pool fungal-colossus,fungus-gnat-cloud,leopard-slug,millipede-hauler,pill-bug,puffball-bombardier,rot-swollen-carcass,sleepless-shrew,wolf-spider-mother --max-unique 6 --max-copies 4 --budget 6000 --final-games 24 --seed skir1-bpro --focus family:armor,big,swarm,open --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 6608 games in 188 s.

- The list (9): Fungal Colossus, Fungus Gnat Cloud, Leopard Slug, Millipede Hauler, Pill Bug, Puffball Bombardier, Rot-Swollen Carcass, Sleepless Shrew, Wolf Spider Mother.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 7-A-1 skirmish's deck; 7-A-2 skirmish's deck; 7-A-3 elite's deck; 7-A-4 elite's deck; 7-A-5 boss's deck; reference starter deck under 7-A-1's field; reference deck (Map 8) under 7-A-2's field; expected player deck (expectedPlayerDeck) under 7-A-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | family:armor | swarm (16 copies at 0 Lumber); armor x8; swarm x8 | 84% (80%-89%) | 0.2 | 0: 16, 1: 4 | 4x Fungus Gnat Cloud, 4x Leopard Slug, 4x Millipede Hauler, 4x Pill Bug, 4x Sleepless Shrew | 10 |
| 2 | swarm | swarm (14 copies at 0 Lumber); swarm x9 | 50% (44%-56%) | 0.5 | 0: 14, 1: 2, 2: 4 | 4x Fungal Colossus, 4x Puffball Bombardier, 4x Sleepless Shrew, 3x Fungus Gnat Cloud, 3x Leopard Slug, 2x Wolf Spider Mother | 11 |
| 3 | big | big (8 copies at 2+ Lumber, average 1.1); swarm x15 | 39% (32%-45%) | 1.15 | 0: 9, 1: 3, 2: 4, 3: 4 | 4x Fungal Colossus, 4x Fungus Gnat Cloud, 4x Pill Bug, 4x Rot-Swollen Carcass, 3x Wolf Spider Mother, 1x Leopard Slug | 10 |
| 4 | open | swarm x10; armor x7 | 23% (18%-28%) | 0.8 | 0: 10, 1: 7, 3: 3 | 4x Millipede Hauler, 4x Puffball Bombardier, 3x Leopard Slug, 3x Pill Bug, 3x Rot-Swollen Carcass, 3x Wolf Spider Mother | 0 |

## Per opponent

| Deck | fight:7-A-1 | fight:7-A-2 | fight:7-A-3 | fight:7-A-4 | fight:7-A-5 | ref:starter | ref:road8 | ref:expected |
|---|---|---|---|---|---|---|---|---|
| 1 family:armor | 100% | 83% | 100% | 100% | 83% | 92% | 54% | 63% |
| 2 swarm | 63% | 42% | 79% | 75% | 42% | 54% | 17% | 29% |
| 3 big | 50% | 46% | 50% | 50% | 25% | 33% | 33% | 21% |
| 4 open | 29% | 13% | 25% | 67% | 13% | 29% | 4% | 4% |
