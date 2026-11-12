# Focused decks: Map 7 The Morel Hollow (2026-11-12)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map mu --pool adder-ambusher,amber-cicada,camouflage-frog,corpse-flower-beetle,cypress-root-lurker,earthworm,fungus-gnat-cloud,hawthorn-shieldbug,lamprey,leopard-slug,planarian-splitter,puffball-bombardier,rot-swollen-carcass,sleepless-shrew,wolf-spider-mother --max-unique 6 --max-copies 4 --budget 6000 --final-games 24 --seed skir1-bpro --focus family:guard,swarm,open --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 6660 games in 129 s.

- The list (15): Adder Ambusher, Amber Cicada, Camouflage Frog, Corpse-flower Beetle, Cypress Root Lurker, Earthworm, Fungus Gnat Cloud, Hawthorn Shieldbug, Lamprey, Leopard Slug, Planarian Splitter, Puffball Bombardier, Rot-Swollen Carcass, Sleepless Shrew, Wolf Spider Mother.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 7-1 skirmish's deck; 7-2 skirmish's deck; 7-3 skirmish's deck; 7-4 skirmish's deck; 7-5 elite's deck; 7-6 miniboss's deck; reference starter deck under 7-1's field; reference deck (Map 7) under 7-2's field; expected player deck (expectedPlayerDeck) under 7-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | swarm | swarm (14 copies at 0 Lumber); swarm x7 | 78% (73%-83%) | 0.3 | 0: 14, 1: 6 | 4x Earthworm, 4x Fungus Gnat Cloud, 4x Sleepless Shrew, 3x Lamprey, 3x Wolf Spider Mother, 2x Leopard Slug | 10 |
| 2 | family:guard | guard x8 | 69% (64%-74%) | 0.45 | 0: 11, 1: 9 | 4x Cypress Root Lurker, 4x Fungus Gnat Cloud, 4x Hawthorn Shieldbug, 4x Sleepless Shrew, 3x Leopard Slug, 1x Adder Ambusher | 10 |
| 3 | open | midrange (average 0.6 Lumber) | 64% (59%-70%) | 0.6 | 0: 8, 1: 12 | 4x Amber Cicada, 4x Fungus Gnat Cloud, 4x Lamprey, 4x Leopard Slug, 3x Hawthorn Shieldbug, 1x Wolf Spider Mother | 0 |

## Per opponent

| Deck | fight:7-1 | fight:7-2 | fight:7-3 | fight:7-4 | fight:7-5 | fight:7-6 | ref:starter | ref:road7 | ref:expected |
|---|---|---|---|---|---|---|---|---|---|
| 1 swarm | 100% | 92% | 75% | 88% | 79% | 54% | 96% | 42% | 75% |
| 2 family:guard | 96% | 96% | 67% | 63% | 58% | 42% | 96% | 29% | 75% |
| 3 open | 100% | 92% | 54% | 71% | 67% | 33% | 75% | 25% | 63% |
