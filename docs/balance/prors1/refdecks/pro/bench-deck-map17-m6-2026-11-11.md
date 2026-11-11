# Focused decks: Map 17 Wolfsbane Tundra (2026-11-11)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map m6 --pool arctic-fox-raider,arctic-tern,cone-cutter-squirrel,cunning-vixen,dhole-matriarch,eagle-owl-quartermaster,frostbitten-wolverine,glacier-yak,grave-grin-hyena,grey-seal-bull,harbor-seal,ibex-rockcaller,ice-crevasse-wolf,krill-swarm,lemming-swarm,mountain-hare,mudflat-godwit,musk-ox-calf,polar-bear,ringed-seal,shepherds-bark,snow-bunting-archer,snow-ermine,taiga-lynx,thorn-shrike,tide-spirit,timber-wolf-pack,tundra-musk-ox,upside-down-bat,walrus-icebreaker,wolf-spider-mother,wolfsbane-alpha,woodland-caribou --max-unique 6 --max-copies 4 --budget 8000 --final-games 24 --seed skir1-pro --focus family:evasion,family:cold,big,open --anchor arctic-fox-raider,arctic-tern,cone-cutter-squirrel,frostbitten-wolverine,glacier-yak,harbor-seal,ice-crevasse-wolf,krill-swarm,lemming-swarm,musk-ox-calf,polar-bear,ringed-seal,shepherds-bark,snow-bunting-archer,snow-ermine,taiga-lynx,timber-wolf-pack,tundra-musk-ox,walrus-icebreaker,wolfsbane-alpha,woodland-caribou --anchor-min 10 --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 9416 games in 144 s.

- The list (33): Arctic Fox Raider, Arctic Tern, Cone-cutter Squirrel, Cunning Vixen, Dhole Matriarch, Eagle-Owl Quartermaster, Frostbitten Wolverine, Glacier Yak, Grave-Grin Hyena, Grey Seal Bull, Harbor Seal, Ibex Rockcaller, Ice-Crevasse Wolf, Krill Swarm, Lemming Swarm, Mountain Hare, Mudflat Godwit, Musk Ox Calf, Polar Bear, Ringed Seal, Shepherd, Snow Bunting Archer, Snow Ermine, Taiga Lynx, Thorn Shrike, Tide Seahorse, Timber Wolf Pack Leader, Tundra Musk Ox, Upside-Down Bat, Walrus Icebreaker, Wolf Spider Mother, Wolfsbane Alpha, Woodland Caribou.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 17-1 skirmish's deck; 17-2 skirmish's deck; 17-3 skirmish's deck; 17-4 skirmish's deck; 17-5 elite's deck; 17-6 elite's deck; 17-7 elite's deck; 17-8 miniboss's deck; reference starter deck under 17-1's field; reference deck (Map 17) under 17-2's field; expected player deck (expectedPlayerDeck) under 17-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | family:cold | economy (4 resource makers); cold x9 | 97% (95%-99%) | 0.6 | 0: 8, 1: 12 | 4x Cone-cutter Squirrel, 4x Musk Ox Calf, 4x Snow Ermine, 3x Wolf Spider Mother, 3x Woodland Caribou, 2x Walrus Icebreaker | 14 |
| 2 | open | economy (4 resource makers); cold x6 | 94% (91%-96%) | 0.6 | 0: 8, 1: 12 | 4x Cone-cutter Squirrel, 4x Frostbitten Wolverine, 4x Krill Swarm, 3x Arctic Fox Raider, 3x Eagle-Owl Quartermaster, 2x Walrus Icebreaker | 0 |
| 3 | family:evasion | swarm (14 copies at 0 Lumber); evasion x11; swarm x7 | 91% (88%-94%) | 0.3 | 0: 14, 1: 6 | 4x Lemming Swarm, 4x Mountain Hare, 4x Snow Ermine, 3x Cunning Vixen, 3x Wolf Spider Mother, 2x Arctic Tern | 20 |
| 4 | big | big (8 copies at 2+ Lumber, average 1.3); cold x10 | 82% (78%-86%) | 1.3 | 0: 6, 1: 6, 2: 4, 3: 4 | 4x Glacier Yak, 4x Musk Ox Calf, 4x Tundra Musk Ox, 4x Upside-Down Bat, 2x Snow Ermine, 2x Walrus Icebreaker | 18 |

## Per opponent

| Deck | fight:17-1 | fight:17-2 | fight:17-3 | fight:17-4 | fight:17-5 | fight:17-6 | fight:17-7 | fight:17-8 | ref:starter | ref:road17 | ref:expected |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 family:cold | 100% | 100% | 96% | 100% | 96% | 100% | 100% | 100% | 100% | 83% | 96% |
| 2 open | 100% | 100% | 96% | 96% | 96% | 92% | 100% | 96% | 88% | 75% | 92% |
| 3 family:evasion | 100% | 100% | 83% | 100% | 92% | 100% | 96% | 96% | 96% | 75% | 67% |
| 4 big | 96% | 88% | 100% | 83% | 63% | 88% | 100% | 92% | 67% | 50% | 79% |
