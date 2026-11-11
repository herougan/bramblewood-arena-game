# Focused decks: Map 17 The Ice Hollow (2026-11-11)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map mi --pool arctic-tern,ashbone-ghoul,beluga,eagle-owl-quartermaster,frost-thistle-lynx,frostbitten-wolverine,grave-grin-hyena,greenland-shark,harbor-seal,harp-seal-pup,krill-swarm,lemming-swarm,lone-grey-wolf,mountain-hare,musk-ox-calf,permafrost-mammoth,polar-bear,ravenous-wolverine,ringed-seal,snow-ermine,squires-mount,talus-pika,tide-spirit,walrus-icebreaker,wolf-spider-mother,wolfsbane-alpha,yeti-chieftain --max-unique 6 --max-copies 4 --budget 8000 --final-games 24 --seed skir1-pro --focus family:tide,family:cold,big,open --anchor arctic-tern,beluga,frost-thistle-lynx,frostbitten-wolverine,greenland-shark,harp-seal-pup,lemming-swarm,permafrost-mammoth,polar-bear,ravenous-wolverine,ringed-seal,talus-pika,walrus-icebreaker,wolfsbane-alpha,yeti-chieftain --anchor-min 10 --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 8988 games in 113 s.

- The list (27): Arctic Tern, Ashbone Ghoul, Beluga, Eagle-Owl Quartermaster, Frost Thistle Lynx, Frostbitten Wolverine, Grave-Grin Hyena, Greenland Shark, Harbor Seal, Harp Seal Pup, Krill Swarm, Lemming Swarm, Lone Grey Wolf, Mountain Hare, Musk Ox Calf, Permafrost Mammoth, Polar Bear, Ravenous Wolverine, Ringed Seal, Snow Ermine, Squire's Mount, Talus Pika, Tide Seahorse, Walrus Icebreaker, Wolf Spider Mother, Wolfsbane Alpha, Yeti Chieftain.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 17-A-1 skirmish's deck; 17-A-2 skirmish's deck; 17-A-3 skirmish's deck; 17-A-4 boss's deck; reference starter deck under 17-A-1's field; reference deck (Map 21) under 17-A-2's field; expected player deck (expectedPlayerDeck) under 17-A-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | open | swarm (17 copies at 0 Lumber); swarm x8 | 83% (77%-88%) | 0.15 | 0: 17, 1: 3 | 4x Grave-Grin Hyena, 4x Krill Swarm, 4x Lemming Swarm, 3x Frostbitten Wolverine, 3x Talus Pika, 2x Arctic Tern | 0 |
| 2 | family:tide | swarm x8; tide x8 | 82% (77%-87%) | 0.4 | 0: 12, 1: 8 | 4x Krill Swarm, 4x Lemming Swarm, 4x Ringed Seal, 4x Snow Ermine, 3x Ravenous Wolverine, 1x Musk Ox Calf | 12 |
| 3 | family:cold | cold x8; evasion x7 | 82% (77%-87%) | 0.35 | 0: 13, 1: 7 | 4x Frostbitten Wolverine, 4x Mountain Hare, 4x Talus Pika, 3x Snow Ermine, 3x Squire's Mount, 2x Lemming Swarm | 12 |
| 4 | big | big (8 copies at 2+ Lumber, average 1.3) | 21% (16%-27%) | 1.25 | 0: 7, 1: 5, 2: 4, 3: 4 | 4x Frost Thistle Lynx, 4x Grave-Grin Hyena, 4x Permafrost Mammoth, 3x Harp Seal Pup, 3x Ravenous Wolverine, 2x Yeti Chieftain | 16 |

## Per opponent

| Deck | fight:17-A-1 | fight:17-A-2 | fight:17-A-3 | fight:17-A-4 | ref:starter | ref:road21 | ref:expected |
|---|---|---|---|---|---|---|---|
| 1 open | 96% | 83% | 96% | 75% | 96% | 58% | 75% |
| 2 family:tide | 92% | 75% | 100% | 63% | 100% | 58% | 88% |
| 3 family:cold | 100% | 83% | 100% | 58% | 100% | 63% | 71% |
| 4 big | 33% | 21% | 46% | 13% | 21% | 13% | 4% |
