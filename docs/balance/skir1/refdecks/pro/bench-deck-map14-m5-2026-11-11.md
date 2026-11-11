# Focused decks: Map 14 Savanna Reaches (2026-11-10)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map m5 --pool acacia-giraffe,adder-ambusher,alpine-swift,banded-sea-krait,blue-ringed-octopus,caiman-hatchling,chamois-leaper,crocodile-ambusher,cunning-vixen,dust-hyena,eagle-owl-quartermaster,golden-eagle-diver,grave-grin-hyena,hoopoe-herald,ibex-rockcaller,mangrove-monitor,marula-elephant,meerkat-sentry,peregrine-stooper,plains-zebra,pride-queen,savanna-cheetah,springbok-pronker,stonedrop-vulture,termite-forager,tide-spirit,upside-down-bat,wolf-spider-mother --max-unique 6 --max-copies 4 --budget 1200 --final-games 24 --seed skir1-pro --focus family:strike-first,family:flying,big,open --anchor acacia-giraffe,adder-ambusher,crocodile-ambusher,dust-hyena,golden-eagle-diver,grave-grin-hyena,hoopoe-herald,mangrove-monitor,marula-elephant,meerkat-sentry,plains-zebra,pride-queen,savanna-cheetah,springbok-pronker,stonedrop-vulture,termite-forager --anchor-min 10 --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 2684 games in 402 s.

- The list (28): Acacia Giraffe, Adder Ambusher, Alpine Swift, Banded Sea Krait, Blue-ringed Octopus, Caiman Hatchling, Chamois Leaper, Crocodile Ambusher, Cunning Vixen, Dust Hyena, Eagle-Owl Quartermaster, Golden Eagle Diver, Grave-Grin Hyena, Hoopoe Herald, Ibex Rockcaller, Mangrove Monitor, Marula Elephant, Meerkat Sentry, Peregrine Stooper, Plains Zebra, Pride Queen, Savanna Cheetah, Springbok Pronker, Stonedrop Vulture, Termite Forager, Tide Seahorse, Upside-Down Bat, Wolf Spider Mother.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 14-1 skirmish's deck; 14-2 skirmish's deck; 14-3 skirmish's deck; 14-4 skirmish's deck; 14-5 elite's deck; 14-6 elite's deck; 14-7 elite's deck; 14-8 miniboss's deck; reference starter deck under 14-1's field; reference deck (Map 14) under 14-2's field; expected player deck (expectedPlayerDeck) under 14-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | family:strike-first | big (12 copies at 1+ Lumber, average 0.6); strike-first x8; flying x8 | 83% (79%-87%) | 0.6 | 0: 8, 1: 12 | 4x Alpine Swift, 4x Banded Sea Krait, 4x Hoopoe Herald, 4x Stonedrop Vulture, 2x Pride Queen, 2x Savanna Cheetah | 10 |
| 2 | open | big (12 copies at 1+ Lumber, average 0.6); strike-first x6 | 83% (79%-87%) | 0.6 | 0: 8, 1: 12 | 4x Banded Sea Krait, 4x Caiman Hatchling, 4x Golden Eagle Diver, 4x Hoopoe Herald, 2x Blue-ringed Octopus, 2x Savanna Cheetah | 0 |
| 3 | big | big (9 copies at 1+ Lumber, average 0.5); evasion x7 | 80% (76%-84%) | 0.45 | 0: 11, 1: 9 | 4x Grave-Grin Hyena, 4x Plains Zebra, 4x Springbok Pronker, 3x Banded Sea Krait, 3x Caiman Hatchling, 2x Savanna Cheetah | 12 |
| 4 | family:flying | big (16 copies at 1+ Lumber, average 0.8); flying x11; ranged x7 | 78% (74%-82%) | 0.8 | 0: 4, 1: 16 | 4x Alpine Swift, 4x Mangrove Monitor, 4x Meerkat Sentry, 4x Stonedrop Vulture, 3x Eagle-Owl Quartermaster, 1x Savanna Cheetah | 19 |

## Per opponent

| Deck | fight:14-1 | fight:14-2 | fight:14-3 | fight:14-4 | fight:14-5 | fight:14-6 | fight:14-7 | fight:14-8 | ref:starter | ref:road14 | ref:expected |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 family:strike-first | 92% | 100% | 96% | 92% | 71% | 79% | 96% | 92% | 92% | 54% | 50% |
| 2 open | 92% | 100% | 96% | 83% | 50% | 92% | 96% | 92% | 92% | 50% | 67% |
| 3 big | 96% | 96% | 100% | 88% | 67% | 83% | 96% | 92% | 92% | 29% | 42% |
| 4 family:flying | 100% | 96% | 92% | 79% | 67% | 88% | 83% | 83% | 88% | 38% | 46% |
