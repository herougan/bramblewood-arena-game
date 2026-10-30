# Focused decks: Map 0 The Old Bramble (2026-10-30)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map mo --pool alpine-marmot,ashbone-ghoul,bee-forager,dhole-runner,dung-beetle,fox-sharpshot,fungus-gnat-cloud,gannet-nestweaver,hedgehog-scout,hoopoe-herald,jay-pilferer,leafcutter-gardener,leopard-slug,mountain-hare,mudpuppy,nutria-reedcutter,porcupine-roller,red-backed-salamander,seed-cache-squirrel,springtail-hopper,swamp-rabbit,swift-fox,talus-pika,woodcock-lookout --max-unique 6 --max-copies 4 --budget 12000 --final-games 24 --seed deck1 --focus economy,big,swarm,open --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 12908 games in 192 s.

- The list (24): Alpine Marmot, Ashbone Ghoul, Bee Forager, Dhole Runner, Dung Beetle, Fox Sharpshot, Fungus Gnat Cloud, Gannet Nestweaver, Hedgehog Scout, Hoopoe Herald, Jay Pilferer, Leafcutter Gardener, Leopard Slug, Mountain Hare, Mudpuppy, Nutria Reedcutter, Porcupine Roller, Red-backed Salamander, Seed-cache Squirrel, Springtail Hopper, Swamp Rabbit, Swift Fox, Talus Pika, Woodcock Lookout.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 0-B-1 skirmish's deck; 0-B-2 skirmish's deck; 0-B-3 skirmish's deck; 0-B-4 boss's deck; reference starter deck under 0-B-1's field; reference deck (Map 17) under 0-B-2's field; expected player deck (expectedPlayerDeck) under 0-B-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | big | big (8 copies at 1 Lumber, average 0.4); economy (6 resource makers) | 89% (85%-93%) | 0.4 | 0: 12, 1: 8 | 4x Seed-cache Squirrel, 4x Swift Fox, 4x Talus Pika, 3x Hoopoe Herald, 3x Porcupine Roller, 2x Leafcutter Gardener | 14 |
| 2 | economy | swarm (14 copies at 0 Lumber); economy (7 resource makers) | 85% (80%-90%) | 0.3 | 0: 14, 1: 6 | 4x Hoopoe Herald, 4x Swift Fox, 4x Talus Pika, 3x Ashbone Ghoul, 3x Leafcutter Gardener, 2x Fox Sharpshot | 14 |
| 3 | open | swarm (14 copies at 0 Lumber) | 80% (74%-86%) | 0.3 | 0: 14, 1: 6 | 4x Jay Pilferer, 4x Mudpuppy, 4x Porcupine Roller, 3x Ashbone Ghoul, 3x Hoopoe Herald, 2x Dhole Runner | 0 |
| 4 | swarm | swarm (16 copies at 0 Lumber); evasion x8 | 70% (63%-76%) | 0.2 | 0: 16, 1: 4 | 4x Hedgehog Scout, 4x Hoopoe Herald, 4x Jay Pilferer, 4x Mountain Hare, 4x Springtail Hopper | 13 |

## Per opponent

| Deck | fight:0-B-1 | fight:0-B-2 | fight:0-B-3 | fight:0-B-4 | ref:starter | ref:road17 | ref:expected |
|---|---|---|---|---|---|---|---|
| 1 big | 100% | 88% | 100% | 83% | 96% | 58% | 100% |
| 2 economy | 100% | 79% | 88% | 63% | 96% | 71% | 100% |
| 3 open | 88% | 58% | 75% | 71% | 96% | 73% | 100% |
| 4 swarm | 67% | 46% | 79% | 58% | 92% | 50% | 96% |
