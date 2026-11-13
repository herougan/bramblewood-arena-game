# Focused decks: Map 17 The Ice Hollow (2026-11-13)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map mi --pool arctic-tern,beluga,cormorant,dormouse,eagle-owl-quartermaster,giant-clam,glacier-yak,grave-grin-hyena,greenland-shark,ibex-rockcaller,ice-crevasse-wolf,krill-swarm,lemming-swarm,limpet-clinger,lone-grey-wolf,moon-jelly,mountain-hare,pincushion-urchin,polar-bear,ringed-seal,riptide-eel,rock-pool-starfish,shoal-shark,snow-ermine,stoat-cutthroat,tide-spirit,walrus-icebreaker,wolf-spider-mother,wolfsbane-alpha --max-unique 6 --max-copies 4 --budget 8000 --final-games 24 --seed skir1-pro --focus family:tide,family:evasion,swarm,open --anchor beluga,cormorant,dormouse,giant-clam,glacier-yak,greenland-shark,ice-crevasse-wolf,lemming-swarm,limpet-clinger,moon-jelly,pincushion-urchin,ringed-seal,riptide-eel,rock-pool-starfish,shoal-shark,snow-ermine,wolfsbane-alpha --anchor-min 10 --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 8778 games in 216 s.

- The list (29): Arctic Tern, Beluga, Cormorant, Dormouse, Eagle-Owl Quartermaster, Giant Clam, Glacier Yak, Grave-Grin Hyena, Greenland Shark, Ibex Rockcaller, Ice-Crevasse Wolf, Krill Swarm, Lemming Swarm, Limpet Clinger, Lone Grey Wolf, Moon Jelly, Mountain Hare, Pincushion Urchin, Polar Bear, Ringed Seal, Riptide Eel, Rock Pool Starfish, Shoal Shark, Snow Ermine, Stoat Cutthroat, Tide Seahorse, Walrus Icebreaker, Wolf Spider Mother, Wolfsbane Alpha.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 17-A-1 skirmish's deck; 17-A-2 skirmish's deck; 17-A-3 skirmish's deck; 17-A-4 boss's deck; reference starter deck under 17-A-1's field; reference deck (Map 21) under 17-A-2's field; expected player deck (expectedPlayerDeck) under 17-A-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | family:tide | swarm (17 copies at 0 Lumber); tide x12; evasion x8 | 90% (86%-94%) | 0.15 | 0: 17, 1: 3 | 4x Krill Swarm, 4x Mountain Hare, 4x Snow Ermine, 3x Beluga, 3x Moon Jelly, 2x Limpet Clinger | 14 |
| 2 | swarm | swarm (17 copies at 0 Lumber); tide x7 | 89% (85%-93%) | 0.15 | 0: 17, 1: 3 | 4x Arctic Tern, 4x Lemming Swarm, 4x Moon Jelly, 4x Snow Ermine, 3x Greenland Shark, 1x Grave-Grin Hyena | 16 |
| 3 | family:evasion | swarm (14 copies at 0 Lumber); evasion x8; tide x6 | 88% (83%-92%) | 0.3 | 0: 14, 1: 6 | 4x Dormouse, 4x Lemming Swarm, 4x Mountain Hare, 4x Ringed Seal, 2x Ibex Rockcaller, 2x Tide Seahorse | 18 |
| 4 | open | tide x10; armor x8 | 76% (72%-80%) | 0.35 | 0: 13, 1: 7 | 4x Giant Clam, 4x Limpet Clinger, 4x Snow Ermine, 3x Cormorant, 3x Wolf Spider Mother, 2x Tide Seahorse | 0 |

## Per opponent

| Deck | fight:17-A-1 | fight:17-A-2 | fight:17-A-3 | fight:17-A-4 | ref:starter | ref:road21 | ref:expected |
|---|---|---|---|---|---|---|---|
| 1 family:tide | 100% | 100% | 100% | 100% | 96% | 54% | 79% |
| 2 swarm | 100% | 100% | 100% | 100% | 92% | 54% | 75% |
| 3 family:evasion | 100% | 100% | 100% | 100% | 96% | 58% | 58% |
| 4 open | 100% | 100% | 100% | 96% | 88% | 8% | 38% |
