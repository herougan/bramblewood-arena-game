# Focused decks: Map 16 The Pinewood Taiga (2026-11-05)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map mt --pool alley-cat,alpha-howler,berserker-boar,blue-ringed-octopus,boreal-elk,bramblewood-lynx,cone-cutter-squirrel,cunning-vixen,dhole-matriarch,eagle-owl-quartermaster,grave-grin-hyena,grizzly-vanguard,ibex-rockcaller,lunar-howler,mountain-hare,owl-nightwatch,pronghorn-racer,redwood-woodpecker,snowshoe-hare,springbok-pronker,stoat-cutthroat,swift-fox,taiga-lynx,tasmanian-devil,wolf-spider-mother,woodcock-lookout,woodland-caribou --max-unique 6 --max-copies 4 --budget 6000 --final-games 24 --seed bal16-pro --focus economy,family:evasion,family:cleave,open --anchor alpha-howler,berserker-boar,boreal-elk,bramblewood-lynx,cone-cutter-squirrel,dhole-matriarch,grizzly-vanguard,lunar-howler,owl-nightwatch,redwood-woodpecker,snowshoe-hare,swift-fox,taiga-lynx,tasmanian-devil,woodland-caribou --anchor-min 10 --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 7160 games in 126 s.

- The list (27): Alley Cat, Alpha Howler, Berserker Boar, Blue-ringed Octopus, Boreal Elk, Bramblewood Lynx, Cone-cutter Squirrel, Cunning Vixen, Dhole Matriarch, Eagle-Owl Quartermaster, Grave-Grin Hyena, Grizzly Vanguard, Ibex Rockcaller, Lunar Howler, Mountain Hare, Owl Nightwatch, Pronghorn Racer, Redwood Woodpecker, Snowshoe Hare, Springbok Pronker, Stoat Cutthroat, Swift Fox, Taiga Lynx, Tasmanian Devil, Wolf Spider Mother, Woodcock Lookout, Woodland Caribou.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 16-1 skirmish's deck; 16-2 skirmish's deck; 16-3 skirmish's deck; 16-4 skirmish's deck; 16-5 elite's deck; 16-6 elite's deck; 16-7 miniboss's deck; reference starter deck under 16-1's field; reference deck (Map 16) under 16-2's field; expected player deck (expectedPlayerDeck) under 16-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | open | big (10 copies at 1+ Lumber, average 0.5); economy (4 resource makers); evasion x8 | 85% (82%-89%) | 0.5 | 0: 10, 1: 10 | 4x Cone-cutter Squirrel, 4x Mountain Hare, 4x Owl Nightwatch, 3x Bramblewood Lynx, 3x Wolf Spider Mother, 2x Grave-Grin Hyena | 0 |
| 2 | economy | economy (7 resource makers); evasion x8 | 77% (72%-82%) | 0.35 | 0: 13, 1: 7 | 4x Mountain Hare, 4x Redwood Woodpecker, 4x Snowshoe Hare, 3x Cone-cutter Squirrel, 3x Swift Fox, 2x Alley Cat | 13 |
| 3 | family:evasion | big (12 copies at 1+ Lumber, average 0.8); evasion x12; cold x6 | 68% (63%-74%) | 0.75 | 0: 8, 1: 9, 2: 3 | 4x Mountain Hare, 4x Owl Nightwatch, 4x Snowshoe Hare, 3x Boreal Elk, 3x Springbok Pronker, 2x Woodland Caribou | 12 |
| 4 | family:cleave | big (12 copies at 1+ Lumber, average 0.8); economy (4 resource makers); cleave x8 | 55% (50%-61%) | 0.8 | 0: 8, 1: 8, 2: 4 | 4x Alley Cat, 4x Alpha Howler, 4x Cone-cutter Squirrel, 3x Blue-ringed Octopus, 3x Bramblewood Lynx, 2x Ibex Rockcaller | 13 |

## Per opponent

| Deck | fight:16-1 | fight:16-2 | fight:16-3 | fight:16-4 | fight:16-5 | fight:16-6 | fight:16-7 | ref:starter | ref:road16 | ref:expected |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 open | 92% | 75% | 100% | 100% | 92% | 96% | 88% | 100% | 38% | 75% |
| 2 economy | 67% | 75% | 96% | 100% | 79% | 88% | 83% | 88% | 38% | 54% |
| 3 family:evasion | 75% | 46% | 88% | 96% | 75% | 92% | 75% | 71% | 25% | 42% |
| 4 family:cleave | 58% | 50% | 79% | 79% | 75% | 83% | 46% | 54% | 4% | 25% |
