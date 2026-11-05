# Focused decks: Map 10 Coral Current (2026-11-05)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map m7 --pool banded-sea-krait,clownfish-scout,colossal-squid,coral-reef-shark,dolphin-knight,electric-ray,great-barracuda,horseshoe-crab,kraken-spawnling,mangrove-manatee,open-ocean-hermit-crab,orca-vanguard,parrotfish,reef-admiral,reef-shark,riptide-eel,supernova-jelly --max-unique 6 --max-copies 4 --budget 6000 --final-games 24 --seed bal16-bpro --focus family:tide,family:cleave,big,open --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 7272 games in 74 s.

- The list (17): Banded Sea Krait, Clownfish Scout, Colossal Squid, Coral Reef Shark, Dolphin Outrider, Electric Ray, Great Barracuda, Horseshoe Crab, Kraken Spawnling, Mangrove Manatee, Open-Ocean Hermit Crab, Orca Vanguard, Parrotfish, Reef Admiral, Reef Shark, Riptide Eel, Supernova Jelly.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 10-1 skirmish's deck; 10-2 skirmish's deck; 10-3 skirmish's deck; 10-4 skirmish's deck; 10-5 skirmish's deck; 10-6 elite's deck; 10-7 elite's deck; 10-8 elite's deck; 10-9 boss's deck; reference starter deck under 10-1's field; reference deck (Map 10) under 10-2's field; expected player deck (expectedPlayerDeck) under 10-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | family:tide | swarm (15 copies at 0 Lumber); tide x20 | 92% (89%-94%) | 0.25 | 0: 15, 1: 5 | 4x Clownfish Scout, 4x Open-Ocean Hermit Crab, 4x Parrotfish, 4x Riptide Eel, 3x Dolphin Outrider, 1x Reef Admiral | 10 |
| 2 | family:cleave | tide x14; cleave x8 | 83% (80%-87%) | 1.1 | 0: 10, 1: 2, 2: 4, 3: 4 | 4x Clownfish Scout, 4x Coral Reef Shark, 4x Kraken Spawnling, 4x Parrotfish, 2x Dolphin Outrider, 2x Electric Ray | 15 |
| 3 | open | tide x13; armor x7 | 82% (78%-86%) | 0.5 | 0: 10, 1: 10 | 4x Banded Sea Krait, 4x Open-Ocean Hermit Crab, 3x Clownfish Scout, 3x Dolphin Outrider, 3x Great Barracuda, 3x Horseshoe Crab | 0 |
| 4 | big | big (8 copies at 3+ Lumber, average 1.6); tide x16; cleave x8 | 67% (62%-71%) | 1.65 | 0: 7, 1: 1, 2: 4, 3: 8 | 4x Coral Reef Shark, 4x Kraken Spawnling, 4x Open-Ocean Hermit Crab, 4x Orca Vanguard, 3x Dolphin Outrider, 1x Reef Admiral | 13 |

## Per opponent

| Deck | fight:10-1 | fight:10-2 | fight:10-3 | fight:10-4 | fight:10-5 | fight:10-6 | fight:10-7 | fight:10-8 | fight:10-9 | ref:starter | ref:road10 | ref:expected |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 family:tide | 100% | 96% | 96% | 96% | 100% | 96% | 100% | 100% | 96% | 100% | 54% | 67% |
| 2 family:cleave | 92% | 100% | 96% | 83% | 96% | 79% | 100% | 96% | 88% | 88% | 29% | 54% |
| 3 open | 96% | 100% | 92% | 83% | 96% | 75% | 88% | 88% | 92% | 79% | 63% | 38% |
| 4 big | 92% | 96% | 75% | 54% | 92% | 71% | 75% | 79% | 58% | 58% | 21% | 29% |
