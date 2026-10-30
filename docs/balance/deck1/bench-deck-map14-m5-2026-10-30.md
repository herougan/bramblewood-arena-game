# Focused decks: Map 14 Savanna Reaches (2026-10-30)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map m5 --pool alpine-marmot,banded-sea-krait,blue-ringed-octopus,dust-hyena,eagle-owl-quartermaster,grave-grin-hyena,hoopoe-herald,house-cat,ibex-rockcaller,leafcutter-gardener,lodge-engineer,lyrebird-mimic,margay,marula-elephant,meerkat-burrower,mouse-sapper,otter-centurion,pangolin-roller,pigeon-peon,plains-zebra,robin-redbreast,savanna-cheetah,spitting-cobra,springbok-pronker,thorn-shrike,weaver-bird,wolf-spider-mother --max-unique 6 --max-copies 4 --budget 12000 --final-games 24 --seed deck1 --focus economy,big,swarm,open --anchor dust-hyena,grave-grin-hyena,hoopoe-herald,house-cat,leafcutter-gardener,lodge-engineer,marula-elephant,meerkat-burrower,mouse-sapper,pangolin-roller,plains-zebra,savanna-cheetah,spitting-cobra,springbok-pronker,weaver-bird --anchor-min 10 --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 13508 games in 200 s.

- The list (27): Alpine Marmot, Banded Sea Krait, Blue-ringed Octopus, Dust Hyena, Eagle-Owl Quartermaster, Grave-Grin Hyena, Hoopoe Herald, House Cat, Ibex Rockcaller, Leafcutter Gardener, Lodge Engineer, Lyrebird Mimic, Margay, Marula Elephant, Meerkat Burrower, Mouse Sapper, Otter Centurion, Pangolin Roller, Pigeon Peon, Plains Zebra, Robin Redbreast, Savanna Cheetah, Spitting Cobra, Springbok Pronker, Thorn Shrike, Weaver Bird, Wolf Spider Mother.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 14-1 skirmish's deck; 14-2 skirmish's deck; 14-3 skirmish's deck; 14-4 skirmish's deck; 14-5 elite's deck; 14-6 elite's deck; 14-7 elite's deck; 14-8 miniboss's deck; reference starter deck under 14-1's field; reference deck (Map 14) under 14-2's field; expected player deck (expectedPlayerDeck) under 14-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | swarm | swarm (14 copies at 0 Lumber); economy (7 resource makers) | 89% (85%-92%) | 0.3 | 0: 14, 1: 6 | 4x Dust Hyena, 4x Grave-Grin Hyena, 4x Weaver Bird, 3x Hoopoe Herald, 3x Leafcutter Gardener, 2x Ibex Rockcaller | 11 |
| 2 | economy | big (8 copies at 1+ Lumber, average 0.4); economy (8 resource makers) | 88% (85%-92%) | 0.4 | 0: 12, 1: 8 | 4x Dust Hyena, 4x Grave-Grin Hyena, 4x Leafcutter Gardener, 4x Pangolin Roller, 2x Ibex Rockcaller, 2x Savanna Cheetah | 10 |
| 3 | open | big (12 copies at 1+ Lumber, average 0.6) | 88% (84%-91%) | 0.6 | 0: 8, 1: 12 | 4x Grave-Grin Hyena, 4x Hoopoe Herald, 4x Pangolin Roller, 3x Blue-ringed Octopus, 3x Lyrebird Mimic, 2x Ibex Rockcaller | 0 |
| 4 | big | big (8 copies at 1+ Lumber, average 0.4) | 85% (81%-89%) | 0.4 | 0: 12, 1: 8 | 4x Grave-Grin Hyena, 4x Hoopoe Herald, 4x Robin Redbreast, 4x Springbok Pronker, 3x Wolf Spider Mother, 1x Pangolin Roller | 11 |

## Per opponent

| Deck | fight:14-1 | fight:14-2 | fight:14-3 | fight:14-4 | fight:14-5 | fight:14-6 | fight:14-7 | fight:14-8 | ref:starter | ref:road14 | ref:expected |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 swarm | 100% | 100% | 100% | 96% | 71% | 96% | 71% | 79% | 92% | 75% | 96% |
| 2 economy | 96% | 100% | 92% | 96% | 83% | 100% | 79% | 67% | 96% | 79% | 83% |
| 3 open | 92% | 100% | 96% | 96% | 83% | 100% | 92% | 67% | 92% | 50% | 100% |
| 4 big | 92% | 100% | 88% | 79% | 75% | 96% | 79% | 71% | 96% | 71% | 92% |
