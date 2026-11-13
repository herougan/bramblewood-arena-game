# Focused decks: Map 7 The Mycelium Deep (2026-11-12)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map mz --pool earthworm,fungal-colossus,fungus-gnat-cloud,hawthorn-shieldbug,leopard-slug,planarian-splitter,puffball-bombardier,rootworm-colony,rot-swollen-carcass,sleepless-shrew,tunnel-wyrm --max-unique 6 --max-copies 4 --budget 6000 --final-games 24 --seed skir1-bpro --focus big,swarm,open --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 6544 games in 168 s.

- The list (11): Earthworm, Fungal Colossus, Fungus Gnat Cloud, Hawthorn Shieldbug, Leopard Slug, Planarian Splitter, Puffball Bombardier, Rootworm Colony, Rot-Swollen Carcass, Sleepless Shrew, Tunnel Wyrm.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 7-A-1 skirmish's deck; 7-A-2 skirmish's deck; 7-A-3 elite's deck; 7-A-4 elite's deck; 7-A-5 boss's deck; reference starter deck under 7-A-1's field; reference deck (Map 8) under 7-A-2's field; expected player deck (expectedPlayerDeck) under 7-A-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | swarm | swarm (15 copies at 0 Lumber) | 73% (68%-79%) | 0.25 | 0: 15, 1: 5 | 4x Leopard Slug, 4x Planarian Splitter, 4x Puffball Bombardier, 4x Sleepless Shrew, 3x Fungus Gnat Cloud, 1x Hawthorn Shieldbug | 10 |
| 2 | open | midrange (average 0.4 Lumber) | 70% (65%-76%) | 0.4 | 0: 12, 1: 8 | 4x Fungus Gnat Cloud, 4x Leopard Slug, 4x Rootworm Colony, 4x Tunnel Wyrm, 3x Sleepless Shrew, 1x Earthworm | 0 |
| 3 | big | big (8 copies at 2+ Lumber, average 1.2); swarm x12 | 48% (41%-55%) | 1.2 | 0: 8, 1: 4, 2: 4, 3: 4 | 4x Fungal Colossus, 4x Fungus Gnat Cloud, 4x Hawthorn Shieldbug, 4x Rot-Swollen Carcass, 3x Leopard Slug, 1x Earthworm | 12 |

## Per opponent

| Deck | fight:7-A-1 | fight:7-A-2 | fight:7-A-3 | fight:7-A-4 | fight:7-A-5 | ref:starter | ref:road8 | ref:expected |
|---|---|---|---|---|---|---|---|---|
| 1 swarm | 83% | 71% | 96% | 92% | 79% | 96% | 29% | 42% |
| 2 open | 92% | 79% | 88% | 88% | 58% | 88% | 38% | 33% |
| 3 big | 71% | 46% | 42% | 54% | 71% | 46% | 25% | 29% |
