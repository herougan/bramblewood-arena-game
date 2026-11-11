# Focused decks: Map 17 Wolfsbane Tundra (2026-11-11)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map m6 --pool arctic-fox-raider,arctic-tern,cone-cutter-squirrel,cunning-vixen,dhole-matriarch,dhole-runner,eagle-owl-quartermaster,frostbitten-wolverine,glacier-yak,grave-grin-hyena,grey-seal-bull,harbor-seal,ibex-rockcaller,ice-crevasse-wolf,krill-swarm,lemming-swarm,mountain-hare,musk-ox-calf,polar-bear,ringed-seal,shepherds-bark,snow-bunting-archer,snow-ermine,squires-mount,taiga-lynx,talus-pika,tide-spirit,timber-wolf-pack,tundra-musk-ox,walrus-icebreaker,water-vole,wolf-spider-mother,wolfsbane-alpha,woodland-caribou --max-unique 6 --max-copies 4 --budget 8000 --final-games 24 --seed skir1-pro --focus family:evasion,family:cold,big,open --anchor arctic-fox-raider,arctic-tern,cone-cutter-squirrel,frostbitten-wolverine,glacier-yak,harbor-seal,ice-crevasse-wolf,krill-swarm,lemming-swarm,musk-ox-calf,polar-bear,ringed-seal,shepherds-bark,snow-bunting-archer,snow-ermine,taiga-lynx,talus-pika,timber-wolf-pack,tundra-musk-ox,walrus-icebreaker,wolfsbane-alpha,woodland-caribou --anchor-min 10 --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 9526 games in 120 s.

- The list (34): Arctic Fox Raider, Arctic Tern, Cone-cutter Squirrel, Cunning Vixen, Dhole Matriarch, Dhole Runner, Eagle-Owl Quartermaster, Frostbitten Wolverine, Glacier Yak, Grave-Grin Hyena, Grey Seal Bull, Harbor Seal, Ibex Rockcaller, Ice-Crevasse Wolf, Krill Swarm, Lemming Swarm, Mountain Hare, Musk Ox Calf, Polar Bear, Ringed Seal, Shepherd, Snow Bunting Archer, Snow Ermine, Squire's Mount, Taiga Lynx, Talus Pika, Tide Seahorse, Timber Wolf Pack Leader, Tundra Musk Ox, Walrus Icebreaker, Water Vole, Wolf Spider Mother, Wolfsbane Alpha, Woodland Caribou.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 17-1 skirmish's deck; 17-2 skirmish's deck; 17-3 skirmish's deck; 17-4 skirmish's deck; 17-5 elite's deck; 17-6 elite's deck; 17-7 elite's deck; 17-8 miniboss's deck; reference starter deck under 17-1's field; reference deck (Map 17) under 17-2's field; expected player deck (expectedPlayerDeck) under 17-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | family:evasion | swarm (18 copies at 0 Lumber); tide x8; evasion x8 | 97% (94%-99%) | 0.1 | 0: 18, 1: 2 | 4x Arctic Tern, 4x Krill Swarm, 4x Snow Ermine, 4x Water Vole, 2x Lemming Swarm, 2x Walrus Icebreaker | 20 |
| 2 | family:cold | cold x12 | 93% (90%-96%) | 0.4 | 0: 12, 1: 8 | 4x Grave-Grin Hyena, 4x Krill Swarm, 4x Mountain Hare, 4x Musk Ox Calf, 2x Frostbitten Wolverine, 2x Walrus Icebreaker | 16 |
| 3 | open | economy (4 resource makers) | 87% (83%-90%) | 0.5 | 0: 10, 1: 10 | 4x Cone-cutter Squirrel, 4x Grave-Grin Hyena, 4x Woodland Caribou, 3x Squire's Mount, 3x Taiga Lynx, 2x Tide Seahorse | 0 |
| 4 | big | big (8 copies at 2+ Lumber, average 1.3); economy (4 resource makers) | 79% (75%-84%) | 1.25 | 0: 7, 1: 5, 2: 4, 3: 4 | 4x Cone-cutter Squirrel, 4x Glacier Yak, 4x Tundra Musk Ox, 3x Arctic Fox Raider, 3x Grave-Grin Hyena, 2x Ibex Rockcaller | 13 |

## Per opponent

| Deck | fight:17-1 | fight:17-2 | fight:17-3 | fight:17-4 | fight:17-5 | fight:17-6 | fight:17-7 | fight:17-8 | ref:starter | ref:road17 | ref:expected |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 family:evasion | 100% | 100% | 96% | 100% | 83% | 96% | 100% | 100% | 100% | 96% | 92% |
| 2 family:cold | 96% | 96% | 100% | 96% | 83% | 96% | 100% | 96% | 92% | 79% | 88% |
| 3 open | 100% | 96% | 96% | 92% | 67% | 96% | 96% | 88% | 92% | 54% | 79% |
| 4 big | 96% | 96% | 96% | 96% | 67% | 88% | 88% | 83% | 58% | 50% | 54% |
