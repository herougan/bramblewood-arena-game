# Focused decks: Map 17 The Ice Hollow (2026-11-11)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map mi --pool arctic-tern,ashbone-ghoul,beluga,eagle-owl-quartermaster,frost-thistle-lynx,frostbitten-wolverine,grave-grin-hyena,greenland-shark,harbor-seal,harp-seal-pup,ibex-rockcaller,krill-swarm,lemming-swarm,lone-grey-wolf,mountain-hare,musk-ox-calf,permafrost-mammoth,polar-bear,ravenous-wolverine,ringed-seal,snow-ermine,talus-pika,tide-spirit,walrus-icebreaker,wolf-spider-mother,wolfsbane-alpha,yeti-chieftain --max-unique 6 --max-copies 4 --budget 8000 --final-games 24 --seed skir1-pro --focus family:tide,family:cold,big,open --anchor arctic-tern,beluga,frost-thistle-lynx,frostbitten-wolverine,greenland-shark,harp-seal-pup,lemming-swarm,permafrost-mammoth,polar-bear,ravenous-wolverine,ringed-seal,talus-pika,walrus-icebreaker,wolfsbane-alpha,yeti-chieftain --anchor-min 10 --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 8806 games in 126 s.

- The list (27): Arctic Tern, Ashbone Ghoul, Beluga, Eagle-Owl Quartermaster, Frost Thistle Lynx, Frostbitten Wolverine, Grave-Grin Hyena, Greenland Shark, Harbor Seal, Harp Seal Pup, Ibex Rockcaller, Krill Swarm, Lemming Swarm, Lone Grey Wolf, Mountain Hare, Musk Ox Calf, Permafrost Mammoth, Polar Bear, Ravenous Wolverine, Ringed Seal, Snow Ermine, Talus Pika, Tide Seahorse, Walrus Icebreaker, Wolf Spider Mother, Wolfsbane Alpha, Yeti Chieftain.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 17-A-1 skirmish's deck; 17-A-2 skirmish's deck; 17-A-3 skirmish's deck; 17-A-4 boss's deck; reference starter deck under 17-A-1's field; reference deck (Map 21) under 17-A-2's field; expected player deck (expectedPlayerDeck) under 17-A-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | family:tide | tide x10; swarm x8 | 80% (75%-86%) | 0.4 | 0: 12, 1: 8 | 4x Krill Swarm, 4x Lemming Swarm, 4x Snow Ermine, 3x Beluga, 3x Greenland Shark, 2x Walrus Icebreaker | 13 |
| 2 | open | tide x7 | 67% (60%-73%) | 0.45 | 0: 11, 1: 9 | 4x Lemming Swarm, 4x Ringed Seal, 4x Talus Pika, 3x Greenland Shark, 3x Harp Seal Pup, 2x Ravenous Wolverine | 0 |
| 3 | family:cold | cold x8 | 61% (54%-67%) | 0.75 | 0: 13, 1: 3, 3: 4 | 4x Lemming Swarm, 4x Mountain Hare, 4x Permafrost Mammoth, 3x Greenland Shark, 3x Talus Pika, 2x Tide Seahorse | 10 |
| 4 | big | big (8 copies at 2+ Lumber, average 1.1); swarm x8; tide x6 | 60% (53%-67%) | 1.1 | 0: 10, 1: 2, 2: 4, 3: 4 | 4x Frost Thistle Lynx, 4x Krill Swarm, 4x Lemming Swarm, 4x Permafrost Mammoth, 2x Polar Bear, 2x Tide Seahorse | 16 |

## Per opponent

| Deck | fight:17-A-1 | fight:17-A-2 | fight:17-A-3 | fight:17-A-4 | ref:starter | ref:road21 | ref:expected |
|---|---|---|---|---|---|---|---|
| 1 family:tide | 79% | 75% | 100% | 71% | 92% | 79% | 67% |
| 2 open | 79% | 58% | 96% | 50% | 83% | 50% | 50% |
| 3 family:cold | 75% | 63% | 92% | 33% | 79% | 46% | 38% |
| 4 big | 75% | 54% | 79% | 38% | 75% | 38% | 58% |
