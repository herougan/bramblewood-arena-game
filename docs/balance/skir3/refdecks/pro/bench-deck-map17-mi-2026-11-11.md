# Focused decks: Map 17 The Ice Hollow (2026-11-12)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map mi --pool arctic-tern,ashbone-ghoul,dhole-matriarch,eagle-owl-quartermaster,glacier-yak,grave-grin-hyena,greenland-shark,harbor-seal,harp-seal-pup,ibex-rockcaller,ice-crevasse-wolf,krill-swarm,lemming-swarm,lone-grey-wolf,magma-wraith,mountain-hare,polar-bear,ringed-seal,snow-ermine,stoat-cutthroat,talus-pika,walrus-icebreaker,wolf-spider-mother,wolfsbane-alpha --max-unique 6 --max-copies 4 --budget 8000 --final-games 24 --seed skir1-pro --focus family:evasion,family:tide,swarm,open --anchor arctic-tern,glacier-yak,greenland-shark,harp-seal-pup,ice-crevasse-wolf,lemming-swarm,polar-bear,ringed-seal,snow-ermine,talus-pika,walrus-icebreaker,wolfsbane-alpha --anchor-min 10 --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 8960 games in 146 s.

- The list (24): Arctic Tern, Ashbone Ghoul, Dhole Matriarch, Eagle-Owl Quartermaster, Glacier Yak, Grave-Grin Hyena, Greenland Shark, Harbor Seal, Harp Seal Pup, Ibex Rockcaller, Ice-Crevasse Wolf, Krill Swarm, Lemming Swarm, Lone Grey Wolf, Magma Wraith, Mountain Hare, Polar Bear, Ringed Seal, Snow Ermine, Stoat Cutthroat, Talus Pika, Walrus Icebreaker, Wolf Spider Mother, Wolfsbane Alpha.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 17-A-1 skirmish's deck; 17-A-2 skirmish's deck; 17-A-3 skirmish's deck; 17-A-4 boss's deck; reference starter deck under 17-A-1's field; reference deck (Map 21) under 17-A-2's field; expected player deck (expectedPlayerDeck) under 17-A-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | family:evasion | swarm (15 copies at 0 Lumber); evasion x8; swarm x7 | 83% (78%-88%) | 0.25 | 0: 15, 1: 5 | 4x Lemming Swarm, 4x Mountain Hare, 4x Snow Ermine, 3x Greenland Shark, 3x Krill Swarm, 2x Ice-Crevasse Wolf | 14 |
| 2 | swarm | swarm (16 copies at 0 Lumber); swarm x8 | 83% (77%-88%) | 0.2 | 0: 16, 1: 4 | 4x Ashbone Ghoul, 4x Harp Seal Pup, 4x Krill Swarm, 4x Lemming Swarm, 2x Ice-Crevasse Wolf, 2x Walrus Icebreaker | 14 |
| 3 | family:tide | swarm (14 copies at 0 Lumber); tide x8; evasion x7 | 76% (70%-82%) | 0.3 | 0: 14, 1: 6 | 4x Arctic Tern, 4x Krill Swarm, 4x Ringed Seal, 3x Grave-Grin Hyena, 3x Snow Ermine, 2x Ibex Rockcaller | 13 |
| 4 | open | swarm (14 copies at 0 Lumber); evasion x8 | 74% (68%-80%) | 0.3 | 0: 14, 1: 6 | 4x Arctic Tern, 4x Ashbone Ghoul, 4x Magma Wraith, 4x Snow Ermine, 2x Lemming Swarm, 2x Lone Grey Wolf | 0 |

## Per opponent

| Deck | fight:17-A-1 | fight:17-A-2 | fight:17-A-3 | fight:17-A-4 | ref:starter | ref:road21 | ref:expected |
|---|---|---|---|---|---|---|---|
| 1 family:evasion | 88% | 92% | 100% | 75% | 96% | 50% | 79% |
| 2 swarm | 92% | 88% | 100% | 75% | 92% | 58% | 75% |
| 3 family:tide | 83% | 96% | 92% | 54% | 96% | 54% | 58% |
| 4 open | 79% | 96% | 75% | 50% | 92% | 63% | 63% |
