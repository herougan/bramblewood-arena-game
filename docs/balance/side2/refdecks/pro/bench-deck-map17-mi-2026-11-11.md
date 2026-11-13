# Focused decks: Map 17 The Ice Hollow (2026-11-13)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map mi --pool arctic-tern,dhole-matriarch,eagle-owl-quartermaster,frostbitten-wolverine,glacier-yak,grave-grin-hyena,greenland-shark,harbor-seal,harp-seal-pup,ibex-rockcaller,ice-crevasse-wolf,krill-swarm,lone-grey-wolf,magma-wraith,mountain-hare,polar-bear,ringed-seal,snow-ermine,stoat-cutthroat,upside-down-bat,walrus-icebreaker,wolf-spider-mother,wolfsbane-alpha --max-unique 6 --max-copies 4 --budget 8000 --final-games 24 --seed skir1-pro --focus family:evasion,family:cold,swarm,open --anchor frostbitten-wolverine,glacier-yak,greenland-shark,harbor-seal,harp-seal-pup,ice-crevasse-wolf,polar-bear,ringed-seal,snow-ermine,walrus-icebreaker,wolfsbane-alpha --anchor-min 10 --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 8918 games in 130 s.

- The list (23): Arctic Tern, Dhole Matriarch, Eagle-Owl Quartermaster, Frostbitten Wolverine, Glacier Yak, Grave-Grin Hyena, Greenland Shark, Harbor Seal, Harp Seal Pup, Ibex Rockcaller, Ice-Crevasse Wolf, Krill Swarm, Lone Grey Wolf, Magma Wraith, Mountain Hare, Polar Bear, Ringed Seal, Snow Ermine, Stoat Cutthroat, Upside-Down Bat, Walrus Icebreaker, Wolf Spider Mother, Wolfsbane Alpha.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 17-A-1 skirmish's deck; 17-A-2 skirmish's deck; 17-A-3 skirmish's deck; 17-A-4 boss's deck; reference starter deck under 17-A-1's field; reference deck (Map 21) under 17-A-2's field; expected player deck (expectedPlayerDeck) under 17-A-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | swarm | swarm (17 copies at 0 Lumber) | 70% (64%-76%) | 0.15 | 0: 17, 1: 3 | 4x Harp Seal Pup, 4x Snow Ermine, 3x Grave-Grin Hyena, 3x Ice-Crevasse Wolf, 3x Krill Swarm, 3x Upside-Down Bat | 6 |
| 2 | open | swarm (15 copies at 0 Lumber) | 68% (62%-74%) | 0.25 | 0: 15, 1: 5 | 4x Harp Seal Pup, 4x Snow Ermine, 4x Upside-Down Bat, 3x Grave-Grin Hyena, 3x Stoat Cutthroat, 2x Walrus Icebreaker | 0 |
| 3 | family:cold | swarm (14 copies at 0 Lumber); evasion x8; cold x8 | 67% (61%-73%) | 0.3 | 0: 14, 1: 6 | 4x Frostbitten Wolverine, 4x Grave-Grin Hyena, 4x Mountain Hare, 4x Snow Ermine, 2x Ice-Crevasse Wolf, 2x Upside-Down Bat | 11 |
| 4 | family:evasion | swarm (14 copies at 0 Lumber); evasion x11; tide x7 | 63% (57%-69%) | 0.3 | 0: 14, 1: 6 | 4x Harbor Seal, 4x Harp Seal Pup, 4x Snow Ermine, 3x Krill Swarm, 3x Mountain Hare, 2x Ibex Rockcaller | 12 |

## Per opponent

| Deck | fight:17-A-1 | fight:17-A-2 | fight:17-A-3 | fight:17-A-4 | ref:starter | ref:road21 | ref:expected |
|---|---|---|---|---|---|---|---|
| 1 swarm | 83% | 88% | 100% | 42% | 79% | 38% | 63% |
| 2 open | 58% | 83% | 100% | 33% | 92% | 46% | 63% |
| 3 family:cold | 79% | 88% | 96% | 29% | 92% | 42% | 46% |
| 4 family:evasion | 63% | 79% | 96% | 25% | 92% | 33% | 54% |
