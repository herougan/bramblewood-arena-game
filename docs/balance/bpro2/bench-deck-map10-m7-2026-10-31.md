# Focused decks: Map 10 Coral Current (2026-11-02)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map m7 --pool banded-sea-krait,clownfish-scout,colossal-squid,coral-polyp-colony,coral-reef-shark,electric-ray,great-barracuda,kraken-spawnling,mangrove-manatee,open-ocean-hermit-crab,orca-vanguard,parrotfish,reef-admiral,reef-shark,riptide-eel,swordfish-spearman --max-unique 6 --max-copies 4 --budget 6000 --final-games 24 --seed bpro2 --focus big,swarm,family:tide,open --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 7512 games in 67 s.

- The list (16): Banded Sea Krait, Clownfish Scout, Colossal Squid, Coral Polyp Colony, Coral Reef Shark, Electric Ray, Great Barracuda, Kraken Spawnling, Mangrove Manatee, Open-Ocean Hermit Crab, Orca Vanguard, Parrotfish, Reef Admiral, Reef Shark, Riptide Eel, Swordfish Spearman.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 10-1 skirmish's deck; 10-2 skirmish's deck; 10-3 skirmish's deck; 10-4 skirmish's deck; 10-5 skirmish's deck; 10-6 elite's deck; 10-7 elite's deck; 10-8 elite's deck; 10-9 boss's deck; reference starter deck under 10-1's field; reference deck (Map 10) under 10-2's field; expected player deck (expectedPlayerDeck) under 10-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | open | economy (4 resource makers); tide x13; cleave x6 | 84% (80%-87%) | 0.8 | 0: 10, 1: 7, 3: 3 | 4x Coral Polyp Colony, 4x Electric Ray, 3x Clownfish Scout, 3x Kraken Spawnling, 3x Parrotfish, 3x Swordfish Spearman | 0 |
| 2 | swarm | swarm (15 copies at 0 Lumber); tide x20 | 81% (76%-85%) | 0.25 | 0: 15, 1: 5 | 4x Clownfish Scout, 4x Open-Ocean Hermit Crab, 4x Parrotfish, 3x Coral Polyp Colony, 3x Mangrove Manatee, 2x Reef Admiral | 11 |
| 3 | family:tide | tide x16 | 80% (76%-84%) | 0.45 | 0: 11, 1: 9 | 4x Electric Ray, 4x Open-Ocean Hermit Crab, 4x Parrotfish, 3x Clownfish Scout, 3x Riptide Eel, 2x Reef Admiral | 10 |
| 4 | big | big (8 copies at 3+ Lumber, average 1.4); economy (4 resource makers); tide x15; cleave x8 | 52% (47%-58%) | 1.4 | 0: 8, 1: 4, 3: 8 | 4x Clownfish Scout, 4x Coral Polyp Colony, 4x Kraken Spawnling, 4x Orca Vanguard, 3x Swordfish Spearman, 1x Banded Sea Krait | 7 |

## Per opponent

| Deck | fight:10-1 | fight:10-2 | fight:10-3 | fight:10-4 | fight:10-5 | fight:10-6 | fight:10-7 | fight:10-8 | fight:10-9 | ref:starter | ref:road10 | ref:expected |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 open | 83% | 100% | 96% | 92% | 71% | 92% | 79% | 94% | 79% | 100% | 54% | 63% |
| 2 swarm | 71% | 100% | 92% | 83% | 92% | 83% | 79% | 83% | 75% | 100% | 38% | 71% |
| 3 family:tide | 83% | 96% | 96% | 100% | 92% | 83% | 71% | 79% | 75% | 96% | 29% | 58% |
| 4 big | 63% | 96% | 58% | 50% | 50% | 50% | 33% | 46% | 50% | 67% | 38% | 29% |
