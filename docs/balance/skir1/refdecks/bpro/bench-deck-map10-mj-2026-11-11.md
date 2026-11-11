# Focused decks: Map 10 The Sunken Depths (2026-11-10)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map mj --pool abyss-lantern-squid,barnacle-fortress,blue-ringed-octopus,clownfish-scout,colossal-squid,conger-eel,coral-polyp-colony,giant-clam,great-barracuda,hagfish-silencer,humpback-elder,kraken-spawnling,moon-jelly,nautilus-drifter,orca-vanguard,reef-admiral,riptide-eel,whale-shark --max-unique 6 --max-copies 4 --budget 1500 --final-games 24 --seed skir1-bpro --focus family:tide,family:cleave,big,open --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 2384 games in 299 s.

- The list (18): Abyss Lantern Squid, Barnacle Fortress, Blue-ringed Octopus, Clownfish Scout, Colossal Squid, Conger Eel, Coral Polyp Colony, Giant Clam, Great Barracuda, Hagfish Silencer, Humpback Elder, Kraken Spawnling, Moon Jelly, Nautilus Drifter, Orca Vanguard, Reef Admiral, Riptide Eel, Whale Shark.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 10-A-1 skirmish's deck; 10-A-2 skirmish's deck; 10-A-3 skirmish's deck; 10-A-4 elite's deck; 10-A-5 boss's deck; reference starter deck under 10-A-1's field; reference deck (Map 11) under 10-A-2's field; expected player deck (expectedPlayerDeck) under 10-A-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | family:tide | tide x17 | 92% (88%-95%) | 0.6 | 0: 8, 1: 12 | 4x Clownfish Scout, 4x Coral Polyp Colony, 4x Riptide Eel, 3x Abyss Lantern Squid, 3x Hagfish Silencer, 2x Conger Eel | 13 |
| 2 | open | tide x14; armor x8 | 91% (88%-95%) | 0.8 | 0: 4, 1: 16 | 4x Abyss Lantern Squid, 4x Barnacle Fortress, 4x Coral Polyp Colony, 4x Giant Clam, 2x Nautilus Drifter, 2x Reef Admiral | 0 |
| 3 | family:cleave | big (8 copies at 3+ Lumber, average 1.6); tide x11; cleave x8 | 87% (83%-91%) | 1.6 | 0: 4, 1: 8, 3: 8 | 4x Coral Polyp Colony, 4x Kraken Spawnling, 4x Orca Vanguard, 3x Great Barracuda, 3x Hagfish Silencer, 2x Nautilus Drifter | 14 |
| 4 | big | big (8 copies at 3+ Lumber, average 1.4); tide x20 | 84% (81%-88%) | 1.4 | 0: 8, 1: 4, 3: 8 | 4x Clownfish Scout, 4x Coral Polyp Colony, 4x Humpback Elder, 4x Orca Vanguard, 3x Whale Shark, 1x Riptide Eel | 16 |

## Per opponent

| Deck | fight:10-A-1 | fight:10-A-2 | fight:10-A-3 | fight:10-A-4 | fight:10-A-5 | ref:starter | ref:road11 | ref:expected |
|---|---|---|---|---|---|---|---|---|
| 1 family:tide | 100% | 100% | 100% | 100% | 100% | 92% | 92% | 50% |
| 2 open | 100% | 100% | 100% | 100% | 100% | 92% | 90% | 50% |
| 3 family:cleave | 100% | 100% | 98% | 100% | 96% | 83% | 81% | 38% |
| 4 big | 100% | 96% | 96% | 96% | 96% | 96% | 79% | 17% |
