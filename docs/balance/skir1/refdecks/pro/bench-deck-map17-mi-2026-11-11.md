# Focused decks: Map 17 The Ice Hollow (2026-11-10)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map mi --pool arctic-tern,ashbone-ghoul,beluga,eagle-owl-quartermaster,frost-thistle-lynx,frostbitten-wolverine,grave-grin-hyena,greenland-shark,grey-seal-bull,harp-seal-pup,krill-swarm,lemming-swarm,lone-grey-wolf,magma-wraith,mountain-hare,musk-ox-calf,permafrost-mammoth,polar-bear,ravenous-wolverine,ringed-seal,squires-mount,talus-pika,tide-spirit,walrus-icebreaker,wolf-spider-mother,wolfsbane-alpha,yeti-chieftain --max-unique 6 --max-copies 4 --budget 1200 --final-games 24 --seed skir1-pro --focus family:tide,family:cold,big,open --anchor arctic-tern,beluga,frost-thistle-lynx,frostbitten-wolverine,greenland-shark,harp-seal-pup,lemming-swarm,permafrost-mammoth,polar-bear,ravenous-wolverine,ringed-seal,talus-pika,walrus-icebreaker,wolfsbane-alpha,yeti-chieftain --anchor-min 10 --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 2254 games in 398 s.

- The list (27): Arctic Tern, Ashbone Ghoul, Beluga, Eagle-Owl Quartermaster, Frost Thistle Lynx, Frostbitten Wolverine, Grave-Grin Hyena, Greenland Shark, Grey Seal Bull, Harp Seal Pup, Krill Swarm, Lemming Swarm, Lone Grey Wolf, Magma Wraith, Mountain Hare, Musk Ox Calf, Permafrost Mammoth, Polar Bear, Ravenous Wolverine, Ringed Seal, Squire's Mount, Talus Pika, Tide Seahorse, Walrus Icebreaker, Wolf Spider Mother, Wolfsbane Alpha, Yeti Chieftain.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 17-A-1 skirmish's deck; 17-A-2 skirmish's deck; 17-A-3 skirmish's deck; 17-A-4 boss's deck; reference starter deck under 17-A-1's field; reference deck (Map 21) under 17-A-2's field; expected player deck (expectedPlayerDeck) under 17-A-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | open | swarm x7 | 86% (82%-91%) | 0.4 | 0: 12, 1: 8 | 4x Arctic Tern, 4x Harp Seal Pup, 4x Lemming Swarm, 3x Squire's Mount, 3x Wolf Spider Mother, 2x Ravenous Wolverine | 0 |
| 2 | family:tide | tide x9; swarm x7 | 72% (67%-78%) | 0.75 | 0: 13, 1: 3, 3: 4 | 4x Harp Seal Pup, 4x Krill Swarm, 4x Permafrost Mammoth, 3x Greenland Shark, 3x Lemming Swarm, 2x Tide Seahorse | 13 |
| 3 | family:cold | cold x9 | 67% (60%-73%) | 0.85 | 0: 7, 1: 9, 2: 4 | 4x Arctic Tern, 4x Frost Thistle Lynx, 4x Frostbitten Wolverine, 4x Musk Ox Calf, 3x Krill Swarm, 1x Walrus Icebreaker | 16 |
| 4 | big | big (8 copies at 2+ Lumber, average 1.5); cold x8 | 11% (7%-16%) | 1.5 | 0: 2, 1: 10, 2: 4, 3: 4 | 4x Frost Thistle Lynx, 4x Frostbitten Wolverine, 4x Permafrost Mammoth, 3x Beluga, 3x Eagle-Owl Quartermaster, 2x Harp Seal Pup | 18 |

## Per opponent

| Deck | fight:17-A-1 | fight:17-A-2 | fight:17-A-3 | fight:17-A-4 | ref:starter | ref:road21 | ref:expected |
|---|---|---|---|---|---|---|---|
| 1 open | 100% | 100% | 100% | 92% | 96% | 50% | 67% |
| 2 family:tide | 100% | 88% | 79% | 88% | 88% | 25% | 38% |
| 3 family:cold | 88% | 88% | 79% | 67% | 75% | 25% | 46% |
| 4 big | 38% | 13% | 21% | 4% | 0% | 0% | 4% |
