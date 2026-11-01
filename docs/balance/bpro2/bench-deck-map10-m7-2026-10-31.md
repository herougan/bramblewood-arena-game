# Focused decks: Map 10 Coral Current (2026-11-01)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map m7 --pool banded-sea-krait,clownfish-scout,colossal-squid,coral-polyp-colony,coral-reef-shark,electric-ray,great-barracuda,kraken-spawnling,mangrove-manatee,open-ocean-hermit-crab,orca-vanguard,parrotfish,reef-admiral,reef-shark,riptide-eel,swordfish-spearman --max-unique 6 --max-copies 4 --budget 6000 --final-games 24 --seed bpro2 --focus big,swarm,family:tide,open --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 7680 games in 71 s.

- The list (16): Banded Sea Krait, Clownfish Scout, Colossal Squid, Coral Polyp Colony, Coral Reef Shark, Electric Ray, Great Barracuda, Kraken Spawnling, Mangrove Manatee, Open-Ocean Hermit Crab, Orca Vanguard, Parrotfish, Reef Admiral, Reef Shark, Riptide Eel, Swordfish Spearman.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 10-1 skirmish's deck; 10-2 skirmish's deck; 10-3 skirmish's deck; 10-4 skirmish's deck; 10-5 skirmish's deck; 10-6 elite's deck; 10-7 elite's deck; 10-8 elite's deck; 10-9 boss's deck; reference starter deck under 10-1's field; reference deck (Map 10) under 10-2's field; expected player deck (expectedPlayerDeck) under 10-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | open | economy (4 resource makers); tide x16; strike-first x6 | 88% (85%-91%) | 0.8 | 0: 8, 1: 8, 2: 4 | 4x Clownfish Scout, 4x Coral Polyp Colony, 4x Coral Reef Shark, 4x Electric Ray, 2x Great Barracuda, 2x Reef Admiral | 0 |
| 2 | swarm | swarm (16 copies at 0 Lumber); economy (4 resource makers); tide x20 | 86% (83%-90%) | 0.4 | 0: 16, 2: 4 | 4x Clownfish Scout, 4x Coral Polyp Colony, 4x Coral Reef Shark, 4x Open-Ocean Hermit Crab, 4x Parrotfish | 8 |
| 3 | family:tide | swarm (14 copies at 0 Lumber); economy (4 resource makers); tide x18 | 82% (78%-86%) | 0.3 | 0: 14, 1: 6 | 4x Coral Polyp Colony, 4x Parrotfish, 4x Riptide Eel, 3x Clownfish Scout, 3x Open-Ocean Hermit Crab, 2x Banded Sea Krait | 13 |
| 4 | big | big (8 copies at 3+ Lumber, average 1.4); economy (4 resource makers); tide x16; cleave x12 | 66% (61%-71%) | 1.4 | 0: 8, 1: 4, 3: 8 | 4x Coral Polyp Colony, 4x Kraken Spawnling, 4x Orca Vanguard, 4x Parrotfish, 3x Riptide Eel, 1x Reef Admiral | 15 |

## Per opponent

| Deck | fight:10-1 | fight:10-2 | fight:10-3 | fight:10-4 | fight:10-5 | fight:10-6 | fight:10-7 | fight:10-8 | fight:10-9 | ref:starter | ref:road10 | ref:expected |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 open | 88% | 100% | 92% | 100% | 88% | 96% | 96% | 100% | 96% | 88% | 58% | 56% |
| 2 swarm | 79% | 100% | 100% | 100% | 100% | 96% | 79% | 96% | 92% | 79% | 54% | 63% |
| 3 family:tide | 79% | 100% | 96% | 96% | 83% | 92% | 79% | 88% | 79% | 88% | 33% | 67% |
| 4 big | 54% | 100% | 67% | 83% | 83% | 96% | 63% | 75% | 63% | 63% | 4% | 42% |
