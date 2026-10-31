# Focused decks: Map 10 Coral Current (2026-10-31)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map m7 --pool banded-sea-krait,clownfish-scout,colossal-squid,coral-polyp-colony,coral-reef-shark,electric-ray,great-barracuda,kraken-spawnling,mangrove-manatee,open-ocean-hermit-crab,orca-vanguard,parrotfish,reef-shark,riptide-eel,swordfish-spearman --max-unique 6 --max-copies 4 --budget 6000 --final-games 24 --seed bpro2 --focus big,swarm,family:tide,open --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 7608 games in 68 s.

- The list (15): Banded Sea Krait, Clownfish Scout, Colossal Squid, Coral Polyp Colony, Coral Reef Shark, Electric Ray, Great Barracuda, Kraken Spawnling, Mangrove Manatee, Open-Ocean Hermit Crab, Orca Vanguard, Parrotfish, Reef Shark, Riptide Eel, Swordfish Spearman.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 10-1 skirmish's deck; 10-2 skirmish's deck; 10-3 skirmish's deck; 10-4 skirmish's deck; 10-5 skirmish's deck; 10-6 elite's deck; 10-7 elite's deck; 10-8 elite's deck; 10-9 boss's deck; reference starter deck under 10-1's field; reference deck (Map 10) under 10-2's field; expected player deck (expectedPlayerDeck) under 10-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | swarm | swarm (14 copies at 0 Lumber); tide x20 | 87% (83%-90%) | 0.3 | 0: 14, 1: 6 | 4x Clownfish Scout, 4x Open-Ocean Hermit Crab, 4x Parrotfish, 4x Riptide Eel, 2x Coral Polyp Colony, 2x Swordfish Spearman | 10 |
| 2 | open | tide x16 | 82% (79%-86%) | 0.85 | 0: 7, 1: 9, 2: 4 | 4x Electric Ray, 4x Parrotfish, 4x Reef Shark, 3x Coral Polyp Colony, 3x Swordfish Spearman, 2x Riptide Eel | 0 |
| 3 | family:tide | swarm (14 copies at 0 Lumber); economy (4 resource makers); tide x17 | 80% (76%-84%) | 0.3 | 0: 14, 1: 6 | 4x Coral Polyp Colony, 4x Open-Ocean Hermit Crab, 3x Banded Sea Krait, 3x Clownfish Scout, 3x Mangrove Manatee, 3x Parrotfish | 14 |
| 4 | big | big (8 copies at 3+ Lumber, average 1.4); economy (4 resource makers); tide x16; cleave x8 | 71% (66%-76%) | 1.45 | 0: 7, 1: 5, 3: 8 | 4x Coral Polyp Colony, 4x Kraken Spawnling, 4x Orca Vanguard, 3x Clownfish Scout, 3x Swordfish Spearman, 2x Riptide Eel | 12 |

## Per opponent

| Deck | fight:10-1 | fight:10-2 | fight:10-3 | fight:10-4 | fight:10-5 | fight:10-6 | fight:10-7 | fight:10-8 | fight:10-9 | ref:starter | ref:road10 | ref:expected |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 swarm | 92% | 100% | 100% | 100% | 83% | 92% | 83% | 100% | 71% | 96% | 38% | 88% |
| 2 open | 92% | 100% | 98% | 96% | 83% | 92% | 88% | 100% | 79% | 83% | 13% | 67% |
| 3 family:tide | 71% | 100% | 96% | 92% | 92% | 92% | 71% | 100% | 67% | 71% | 38% | 71% |
| 4 big | 75% | 100% | 83% | 79% | 92% | 88% | 71% | 67% | 67% | 58% | 21% | 50% |
