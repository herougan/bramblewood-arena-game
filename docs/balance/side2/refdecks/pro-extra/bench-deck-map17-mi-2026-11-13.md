# Focused decks: Map 17 The Ice Hollow (2026-11-13)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map mi --pool arctic-tern,dhole-matriarch,eagle-owl-quartermaster,frostbitten-wolverine,glacier-yak,grave-grin-hyena,greenland-shark,harbor-seal,harp-seal-pup,ibex-rockcaller,ice-crevasse-wolf,krill-swarm,lone-grey-wolf,magma-wraith,mountain-hare,polar-bear,ringed-seal,snow-ermine,stoat-cutthroat,upside-down-bat,walrus-icebreaker,wolf-spider-mother,wolfsbane-alpha --max-unique 6 --max-copies 4 --budget 6000 --final-games 24 --seed side2-pro-extra --focus family:evasion,family:cold,open --anchor frostbitten-wolverine,glacier-yak,greenland-shark,harbor-seal,harp-seal-pup,ice-crevasse-wolf,polar-bear,ringed-seal,snow-ermine,walrus-icebreaker,wolfsbane-alpha --anchor-min 10 --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 6538 games in 93 s.

- The list (23): Arctic Tern, Dhole Matriarch, Eagle-Owl Quartermaster, Frostbitten Wolverine, Glacier Yak, Grave-Grin Hyena, Greenland Shark, Harbor Seal, Harp Seal Pup, Ibex Rockcaller, Ice-Crevasse Wolf, Krill Swarm, Lone Grey Wolf, Magma Wraith, Mountain Hare, Polar Bear, Ringed Seal, Snow Ermine, Stoat Cutthroat, Upside-Down Bat, Walrus Icebreaker, Wolf Spider Mother, Wolfsbane Alpha.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 17-A-1 skirmish's deck; 17-A-2 skirmish's deck; 17-A-3 skirmish's deck; 17-A-4 boss's deck; reference starter deck under 17-A-1's field; reference deck (Map 21) under 17-A-2's field; expected player deck (expectedPlayerDeck) under 17-A-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | family:evasion | swarm (14 copies at 0 Lumber); evasion x13; tide x8 | 70% (64%-77%) | 0.3 | 0: 14, 1: 6 | 4x Krill Swarm, 4x Ringed Seal, 4x Snow Ermine, 3x Arctic Tern, 3x Mountain Hare, 2x Polar Bear | 11 |
| 2 | open | swarm (14 copies at 0 Lumber); cold x10; evasion x6 | 66% (60%-72%) | 0.3 | 0: 14, 1: 6 | 4x Frostbitten Wolverine, 4x Harp Seal Pup, 4x Krill Swarm, 4x Mountain Hare, 2x Snow Ermine, 2x Walrus Icebreaker | 0 |
| 3 | family:cold | swarm (14 copies at 0 Lumber); evasion x10; cold x8 | 63% (56%-69%) | 0.3 | 0: 14, 1: 6 | 4x Frostbitten Wolverine, 4x Mountain Hare, 4x Snow Ermine, 3x Grave-Grin Hyena, 3x Upside-Down Bat, 2x Polar Bear | 10 |

## Per opponent

| Deck | fight:17-A-1 | fight:17-A-2 | fight:17-A-3 | fight:17-A-4 | ref:starter | ref:road21 | ref:expected |
|---|---|---|---|---|---|---|---|
| 1 family:evasion | 88% | 75% | 88% | 58% | 79% | 46% | 58% |
| 2 open | 75% | 58% | 100% | 29% | 88% | 29% | 83% |
| 3 family:cold | 63% | 63% | 88% | 29% | 96% | 42% | 58% |
