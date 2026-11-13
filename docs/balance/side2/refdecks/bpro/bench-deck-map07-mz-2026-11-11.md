# Focused decks: Map 7 The Mycelium Deep (2026-11-13)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map mz --pool bombardier-beetle,earthworm,fungal-colossus,fungus-gnat-cloud,hawthorn-shieldbug,leopard-slug,millipede-hauler,planarian-splitter,puffball-bombardier,rootworm-colony,rot-swollen-carcass,sleepless-shrew --max-unique 6 --max-copies 4 --budget 6000 --final-games 24 --seed skir1-bpro --focus family:armor,big,swarm,open --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 6800 games in 147 s.

- The list (12): Bombardier Beetle, Earthworm, Fungal Colossus, Fungus Gnat Cloud, Hawthorn Shieldbug, Leopard Slug, Millipede Hauler, Planarian Splitter, Puffball Bombardier, Rootworm Colony, Rot-Swollen Carcass, Sleepless Shrew.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 7-A-1 skirmish's deck; 7-A-2 skirmish's deck; 7-A-3 elite's deck; 7-A-4 elite's deck; 7-A-5 boss's deck; reference starter deck under 7-A-1's field; reference deck (Map 8) under 7-A-2's field; expected player deck (expectedPlayerDeck) under 7-A-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | swarm | swarm (17 copies at 0 Lumber) | 79% (73%-84%) | 0.15 | 0: 17, 1: 3 | 4x Fungus Gnat Cloud, 4x Puffball Bombardier, 4x Sleepless Shrew, 3x Bombardier Beetle, 3x Earthworm, 2x Leopard Slug | 10 |
| 2 | family:armor | armor x8; swarm x8 | 70% (64%-75%) | 0.4 | 0: 12, 1: 8 | 4x Fungus Gnat Cloud, 4x Hawthorn Shieldbug, 4x Leopard Slug, 4x Millipede Hauler, 4x Sleepless Shrew | 10 |
| 3 | open | midrange (average 0.6 Lumber) | 68% (62%-74%) | 0.6 | 0: 8, 1: 12 | 4x Bombardier Beetle, 4x Hawthorn Shieldbug, 4x Planarian Splitter, 3x Fungus Gnat Cloud, 3x Leopard Slug, 2x Puffball Bombardier | 0 |
| 4 | big | big (8 copies at 2+ Lumber, average 1.1); swarm x12 | 42% (35%-48%) | 1.15 | 0: 9, 1: 3, 2: 4, 3: 4 | 4x Fungal Colossus, 4x Fungus Gnat Cloud, 4x Leopard Slug, 4x Rot-Swollen Carcass, 3x Bombardier Beetle, 1x Puffball Bombardier | 10 |

## Per opponent

| Deck | fight:7-A-1 | fight:7-A-2 | fight:7-A-3 | fight:7-A-4 | fight:7-A-5 | ref:starter | ref:road8 | ref:expected |
|---|---|---|---|---|---|---|---|---|
| 1 swarm | 96% | 63% | 79% | 54% | 100% | 100% | 58% | 79% |
| 2 family:armor | 100% | 54% | 88% | 54% | 88% | 92% | 42% | 42% |
| 3 open | 96% | 46% | 67% | 58% | 79% | 92% | 46% | 63% |
| 4 big | 88% | 29% | 25% | 25% | 63% | 54% | 29% | 21% |
