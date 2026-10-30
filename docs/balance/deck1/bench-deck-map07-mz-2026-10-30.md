# Focused decks: Map 7 The Mycelium Deep (2026-10-30)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map mz --pool alley-cat,ant-warrior,barkplate-beetle,bombardier-beetle,carrion-beetle,compost-grub,dung-beetle,earthworm,fire-ant-raft,forager-ant,fungal-colossus,hawthorn-shieldbug,leafcutter-gardener,mudpuppy,newt-doctor,nutria-reedcutter,otter-centurion,owl-nightwatch,planarian-splitter,raven-scout,rootworm-colony,sleepless-shrew,truffle-piglet,wolf-spider-mother --max-unique 6 --max-copies 4 --budget 12000 --final-games 24 --seed deck1 --focus economy,big,swarm,open --anchor ant-warrior,bombardier-beetle,compost-grub,dung-beetle,fungal-colossus,hawthorn-shieldbug,leafcutter-gardener,owl-nightwatch,planarian-splitter,rootworm-colony,sleepless-shrew,truffle-piglet,wolf-spider-mother --anchor-min 10 --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 12960 games in 166 s.

- The list (24): Alley Cat, Ant Warrior, Barkplate Beetle, Bombardier Beetle, Carrion Beetle, Compost Grub, Dung Beetle, Earthworm, Fire Ant Raft, Forager Ant, Fungal Colossus, Hawthorn Shieldbug, Leafcutter Gardener, Mudpuppy, Newt Doctor, Nutria Reedcutter, Otter Centurion, Owl Nightwatch, Planarian Splitter, Raven Scout, Rootworm Colony, Sleepless Shrew, Truffle Piglet, Wolf Spider Mother.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 7-A-1 skirmish's deck; 7-A-2 skirmish's deck; 7-A-3 elite's deck; 7-A-4 elite's deck; 7-A-5 boss's deck; reference starter deck under 7-A-1's field; reference deck (Map 8) under 7-A-2's field; expected player deck (expectedPlayerDeck) under 7-A-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | big | big (13 copies at 1+ Lumber, average 0.7); economy (4 resource makers) | 81% (76%-86%) | 0.65 | 0: 7, 1: 13 | 4x Nutria Reedcutter, 4x Owl Nightwatch, 4x Planarian Splitter, 4x Rootworm Colony, 3x Alley Cat, 1x Wolf Spider Mother | 19 |
| 2 | economy | swarm (14 copies at 0 Lumber); economy (8 resource makers) | 79% (73%-84%) | 0.3 | 0: 14, 1: 6 | 4x Leafcutter Gardener, 4x Mudpuppy, 4x Nutria Reedcutter, 4x Owl Nightwatch, 2x Ant Warrior, 2x Wolf Spider Mother | 14 |
| 3 | open | big (10 copies at 1+ Lumber, average 0.5); economy (7 resource makers) | 78% (72%-83%) | 0.5 | 0: 10, 1: 10 | 4x Bombardier Beetle, 4x Leafcutter Gardener, 4x Newt Doctor, 3x Truffle Piglet, 3x Wolf Spider Mother, 2x Compost Grub | 0 |
| 4 | swarm | swarm (14 copies at 0 Lumber); economy (4 resource makers) | 73% (68%-78%) | 0.5 | 0: 14, 1: 2, 2: 4 | 4x Ant Warrior, 4x Barkplate Beetle, 4x Leafcutter Gardener, 3x Alley Cat, 3x Otter Centurion, 2x Owl Nightwatch | 16 |

## Per opponent

| Deck | fight:7-A-1 | fight:7-A-2 | fight:7-A-3 | fight:7-A-4 | fight:7-A-5 | ref:starter | ref:road8 | ref:expected |
|---|---|---|---|---|---|---|---|---|
| 1 big | 100% | 88% | 75% | 42% | 75% | 96% | 75% | 100% |
| 2 economy | 100% | 83% | 67% | 46% | 58% | 96% | 79% | 100% |
| 3 open | 88% | 75% | 67% | 54% | 67% | 100% | 71% | 100% |
| 4 swarm | 100% | 83% | 46% | 29% | 50% | 92% | 83% | 100% |
