# Focused decks: Map 17 Wolfsbane Tundra (2026-11-10)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map m6 --pool arctic-fox-raider,arctic-tern,cone-cutter-squirrel,cunning-vixen,dhole-matriarch,dhole-runner,eagle-owl-quartermaster,frostbitten-wolverine,glacier-yak,grave-grin-hyena,grey-seal-bull,ibex-rockcaller,ice-crevasse-wolf,krill-swarm,lemming-swarm,mountain-hare,musk-ox-calf,polar-bear,ringed-seal,squires-mount,taiga-lynx,talus-pika,tide-spirit,timber-wolf-pack,tundra-musk-ox,walrus-icebreaker,water-vole,wolf-spider-mother,wolfsbane-alpha,woodland-caribou --max-unique 6 --max-copies 4 --budget 1000 --final-games 24 --seed skir1-pro --focus family:evasion,family:cold,big,open --anchor arctic-fox-raider,arctic-tern,cone-cutter-squirrel,frostbitten-wolverine,glacier-yak,ice-crevasse-wolf,krill-swarm,lemming-swarm,musk-ox-calf,polar-bear,ringed-seal,taiga-lynx,talus-pika,timber-wolf-pack,tundra-musk-ox,walrus-icebreaker,wolfsbane-alpha,woodland-caribou --anchor-min 10 --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 2596 games in 314 s.

- The list (30): Arctic Fox Raider, Arctic Tern, Cone-cutter Squirrel, Cunning Vixen, Dhole Matriarch, Dhole Runner, Eagle-Owl Quartermaster, Frostbitten Wolverine, Glacier Yak, Grave-Grin Hyena, Grey Seal Bull, Ibex Rockcaller, Ice-Crevasse Wolf, Krill Swarm, Lemming Swarm, Mountain Hare, Musk Ox Calf, Polar Bear, Ringed Seal, Squire's Mount, Taiga Lynx, Talus Pika, Tide Seahorse, Timber Wolf Pack Leader, Tundra Musk Ox, Walrus Icebreaker, Water Vole, Wolf Spider Mother, Wolfsbane Alpha, Woodland Caribou.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 17-1 skirmish's deck; 17-2 skirmish's deck; 17-3 skirmish's deck; 17-4 skirmish's deck; 17-5 elite's deck; 17-6 elite's deck; 17-7 elite's deck; 17-8 miniboss's deck; reference starter deck under 17-1's field; reference deck (Map 17) under 17-2's field; expected player deck (expectedPlayerDeck) under 17-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | family:cold | swarm (14 copies at 0 Lumber); economy (4 resource makers); cold x10 | 98% (96%-100%) | 0.3 | 0: 14, 1: 6 | 4x Arctic Tern, 4x Cone-cutter Squirrel, 4x Mountain Hare, 4x Musk Ox Calf, 2x Lemming Swarm, 2x Walrus Icebreaker | 10 |
| 2 | open | evasion x12 | 89% (85%-92%) | 0.35 | 0: 13, 1: 7 | 4x Arctic Tern, 4x Cunning Vixen, 4x Lemming Swarm, 4x Mountain Hare, 3x Arctic Fox Raider, 1x Water Vole | 0 |
| 3 | family:evasion | swarm (18 copies at 0 Lumber); economy (4 resource makers); evasion x9; tide x7 | 77% (73%-82%) | 0.1 | 0: 18, 1: 2 | 4x Cone-cutter Squirrel, 4x Krill Swarm, 4x Mountain Hare, 3x Grave-Grin Hyena, 3x Water Vole, 2x Polar Bear | 15 |
| 4 | big | big (8 copies at 2+ Lumber, average 1.5); cold x8 | 49% (44%-55%) | 1.5 | 0: 2, 1: 10, 2: 4, 3: 4 | 4x Glacier Yak, 4x Musk Ox Calf, 4x Tundra Musk Ox, 3x Arctic Fox Raider, 3x Dhole Runner, 2x Tide Seahorse | 17 |

## Per opponent

| Deck | fight:17-1 | fight:17-2 | fight:17-3 | fight:17-4 | fight:17-5 | fight:17-6 | fight:17-7 | fight:17-8 | ref:starter | ref:road17 | ref:expected |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 family:cold | 100% | 100% | 100% | 100% | 96% | 100% | 100% | 100% | 100% | 83% | 96% |
| 2 open | 100% | 96% | 96% | 88% | 92% | 100% | 100% | 96% | 88% | 67% | 54% |
| 3 family:evasion | 100% | 92% | 96% | 88% | 67% | 83% | 83% | 92% | 83% | 29% | 38% |
| 4 big | 83% | 46% | 58% | 42% | 63% | 58% | 71% | 63% | 38% | 4% | 17% |
