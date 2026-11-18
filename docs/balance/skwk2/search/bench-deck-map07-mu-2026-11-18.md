# Focused decks: Map 7 The Morel Hollow (2026-11-18)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map mu --pool amber-cicada,camouflage-frog,corpse-flower-beetle,cypress-root-lurker,earthworm,fungus-gnat-cloud,hawthorn-shieldbug,lamprey,leopard-slug,phoenix-mushrooms,planarian-splitter,puffball-bombardier,rot-swollen-carcass,sleepless-shrew,wolf-spider-mother --max-unique 6 --max-copies 4 --budget 6000 --final-games 24 --seed skwk2-bpro --focus family:guard,swarm,open --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 6966 games in 900 s.

- The list (15): Amber Cicada, Camouflage Frog, Corpse-flower Beetle, Cypress Root Lurker, Earthworm, Fungus Gnat Cloud, Hawthorn Shieldbug, Lamprey, Leopard Slug, Phoenix Mushrooms, Planarian, Puffball, Rot-Swollen Carcass, Sleepless Shrew, Wolf Spider Mother.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 7-1 skirmish's deck; 7-2 skirmish's deck; 7-3 skirmish's deck; 7-4 skirmish's deck; 7-5 elite's deck; 7-6 miniboss's deck; reference starter deck under 7-1's field; reference deck (Map 7) under 7-2's field; expected player deck (expectedPlayerDeck) under 7-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | swarm | swarm (15 copies at 0 Lumber) | 71% (66%-76%) | 0.25 | 0: 15, 1: 5 | 4x Fungus Gnat Cloud, 4x Leopard Slug, 4x Planarian, 4x Sleepless Shrew, 3x Earthworm, 1x Amber Cicada | 10 |
| 2 | open | midrange (average 0.5 Lumber) | 66% (61%-72%) | 0.5 | 0: 10, 1: 10 | 4x Camouflage Frog, 4x Fungus Gnat Cloud, 3x Corpse-flower Beetle, 3x Leopard Slug, 3x Planarian, 3x Puffball | 0 |
| 3 | family:guard | guard x8 | 52% (46%-57%) | 0.55 | 0: 11, 1: 8, 3: 1 | 4x Cypress Root Lurker, 4x Hawthorn Shieldbug, 4x Leopard Slug, 4x Puffball, 3x Fungus Gnat Cloud, 1x Rot-Swollen Carcass | 11 |

## Per opponent

| Deck | fight:7-1 | fight:7-2 | fight:7-3 | fight:7-4 | fight:7-5 | fight:7-6 | ref:starter | ref:road7 | ref:expected |
|---|---|---|---|---|---|---|---|---|---|
| 1 swarm | 100% | 67% | 83% | 54% | 92% | 50% | 88% | 17% | 92% |
| 2 open | 100% | 46% | 71% | 46% | 88% | 71% | 83% | 21% | 71% |
| 3 family:guard | 100% | 42% | 42% | 33% | 79% | 29% | 79% | 0% | 63% |
