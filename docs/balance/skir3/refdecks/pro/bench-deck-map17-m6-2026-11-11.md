# Focused decks: Map 17 Wolfsbane Tundra (2026-11-12)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map m6 --pool alley-cat,arctic-tern,border-collie,boreal-elk,briarback-hedgehog,cataphract-destrier,colossal-squid,cone-cutter-squirrel,cunning-vixen,dhole-matriarch,eagle-owl-quartermaster,elderhorn-monarch,glacier-yak,grave-grin-hyena,harbor-seal,ibex-rockcaller,ice-crevasse-wolf,mountain-hare,polar-bear,ringed-seal,rock-pool-starfish,snow-ermine,snowshoe-hare,stoat-cutthroat,taiga-lynx,upside-down-bat,walrus-icebreaker,warhorse-charger,wolf-spider-mother,wolfsbane-alpha,woodland-caribou --max-unique 6 --max-copies 4 --budget 8000 --final-games 24 --seed skir1-pro --focus family:evasion,family:bleed,big,open --anchor arctic-tern,border-collie,boreal-elk,briarback-hedgehog,cataphract-destrier,cone-cutter-squirrel,elderhorn-monarch,glacier-yak,harbor-seal,ice-crevasse-wolf,polar-bear,ringed-seal,snow-ermine,snowshoe-hare,taiga-lynx,walrus-icebreaker,warhorse-charger,wolfsbane-alpha,woodland-caribou --anchor-min 10 --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 9218 games in 182 s.

- The list (31): Alley Cat, Arctic Tern, Border Collie, Boreal Elk, Briarback Hedgehog, Gilded Roadwarden, Colossal Squid, Cone-cutter Squirrel, Cunning Vixen, Dhole Matriarch, Eagle-Owl Quartermaster, Elderhorn Monarch, Glacier Yak, Grave-Grin Hyena, Harbor Seal, Ibex Rockcaller, Ice-Crevasse Wolf, Mountain Hare, Polar Bear, Ringed Seal, Rock Pool Starfish, Snow Ermine, Snowshoe Hare, Stoat Cutthroat, Taiga Lynx, Upside-Down Bat, Walrus Icebreaker, Warhorse Charger, Wolf Spider Mother, Wolfsbane Alpha, Woodland Caribou.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 17-1 skirmish's deck; 17-2 skirmish's deck; 17-3 skirmish's deck; 17-4 skirmish's deck; 17-5 elite's deck; 17-6 elite's deck; 17-7 elite's deck; 17-8 miniboss's deck; reference starter deck under 17-1's field; reference deck (Map 17) under 17-2's field; expected player deck (expectedPlayerDeck) under 17-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | family:evasion | swarm (16 copies at 0 Lumber); evasion x12 | 93% (90%-95%) | 0.2 | 0: 16, 1: 4 | 4x Alley Cat, 4x Briarback Hedgehog, 4x Mountain Hare, 4x Snow Ermine, 4x Snowshoe Hare | 12 |
| 2 | open | swarm (15 copies at 0 Lumber); flying x10; day x7 | 90% (86%-93%) | 0.25 | 0: 15, 1: 5 | 4x Alley Cat, 4x Arctic Tern, 4x Snow Ermine, 3x Eagle-Owl Quartermaster, 3x Upside-Down Bat, 2x Border Collie | 0 |
| 3 | family:bleed | bleed x9; cold x8 | 87% (83%-90%) | 0.75 | 0: 11, 1: 7, 4: 2 | 4x Alley Cat, 4x Mountain Hare, 4x Woodland Caribou, 3x Cone-cutter Squirrel, 3x Ice-Crevasse Wolf, 2x Colossal Squid | 16 |
| 4 | big | big (8 copies at 3+ Lumber, average 1.4); evasion x10 | 64% (59%-69%) | 1.4 | 0: 12, 3: 4, 4: 4 | 4x Gilded Roadwarden, 4x Elderhorn Monarch, 4x Mountain Hare, 4x Snow Ermine, 2x Arctic Tern, 2x Snowshoe Hare | 14 |

## Per opponent

| Deck | fight:17-1 | fight:17-2 | fight:17-3 | fight:17-4 | fight:17-5 | fight:17-6 | fight:17-7 | fight:17-8 | ref:starter | ref:road17 | ref:expected |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 family:evasion | 100% | 100% | 100% | 100% | 96% | 100% | 100% | 100% | 100% | 48% | 75% |
| 2 open | 100% | 100% | 96% | 100% | 79% | 100% | 92% | 71% | 100% | 58% | 92% |
| 3 family:bleed | 96% | 96% | 96% | 92% | 79% | 92% | 88% | 96% | 100% | 50% | 71% |
| 4 big | 67% | 88% | 67% | 75% | 58% | 75% | 92% | 75% | 63% | 21% | 25% |
