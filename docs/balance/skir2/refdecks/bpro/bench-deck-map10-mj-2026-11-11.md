# Focused decks: Map 10 The Sunken Depths (2026-11-11)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map mj --pool abyss-lantern-squid,barnacle-fortress,blue-ringed-octopus,clownfish-scout,colossal-squid,conger-eel,coral-polyp-colony,giant-clam,great-barracuda,hagfish-silencer,humpback-elder,kraken-spawnling,moon-jelly,nautilus-drifter,orca-vanguard,reef-admiral,riptide-eel,whale-shark --max-unique 6 --max-copies 4 --budget 6000 --final-games 24 --seed skir1-bpro --focus family:tide,family:cleave,big,open --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 6704 games in 95 s.

- The list (18): Abyss Lantern Squid, Barnacle Fortress, Blue-ringed Octopus, Clownfish Scout, Colossal Squid, Conger Eel, Coral Polyp Colony, Giant Clam, Great Barracuda, Hagfish Silencer, Humpback Elder, Kraken Spawnling, Moon Jelly, Nautilus Drifter, Orca Vanguard, Reef Admiral, Riptide Eel, Whale Shark.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 10-A-1 skirmish's deck; 10-A-2 skirmish's deck; 10-A-3 skirmish's deck; 10-A-4 elite's deck; 10-A-5 boss's deck; reference starter deck under 10-A-1's field; reference deck (Map 11) under 10-A-2's field; expected player deck (expectedPlayerDeck) under 10-A-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | big | big (8 copies at 3+ Lumber, average 1.6); tide x14 | 93% (89%-96%) | 1.6 | 0: 4, 1: 8, 3: 8 | 4x Abyss Lantern Squid, 4x Coral Polyp Colony, 4x Humpback Elder, 4x Kraken Spawnling, 2x Nautilus Drifter, 2x Whale Shark | 14 |
| 2 | family:cleave | tide x14; cleave x8 | 91% (87%-94%) | 1 | 0: 8, 1: 8, 3: 4 | 4x Clownfish Scout, 4x Conger Eel, 4x Coral Polyp Colony, 4x Kraken Spawnling, 2x Nautilus Drifter, 2x Reef Admiral | 11 |
| 3 | family:tide | tide x17 | 89% (86%-93%) | 0.6 | 0: 8, 1: 12 | 4x Abyss Lantern Squid, 4x Clownfish Scout, 4x Coral Polyp Colony, 4x Riptide Eel, 3x Hagfish Silencer, 1x Reef Admiral | 12 |
| 4 | open | tide x15 | 84% (80%-89%) | 0.8 | 0: 4, 1: 16 | 4x Abyss Lantern Squid, 4x Clownfish Scout, 4x Giant Clam, 3x Blue-ringed Octopus, 3x Conger Eel, 2x Nautilus Drifter | 0 |

## Per opponent

| Deck | fight:10-A-1 | fight:10-A-2 | fight:10-A-3 | fight:10-A-4 | fight:10-A-5 | ref:starter | ref:road11 | ref:expected |
|---|---|---|---|---|---|---|---|---|
| 1 big | 100% | 100% | 100% | 88% | 100% | 96% | 96% | 63% |
| 2 family:cleave | 100% | 100% | 100% | 83% | 98% | 100% | 92% | 54% |
| 3 family:tide | 100% | 100% | 100% | 67% | 100% | 96% | 100% | 52% |
| 4 open | 100% | 100% | 100% | 63% | 92% | 96% | 79% | 46% |
