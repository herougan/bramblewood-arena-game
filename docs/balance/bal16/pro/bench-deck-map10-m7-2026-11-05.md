# Focused decks: Map 10 Coral Current (2026-11-05)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map m7 --pool alley-cat,alligator-gar,banded-sea-krait,clownfish-scout,colossal-squid,coral-reef-shark,dolphin-knight,electric-ray,giant-cave-huntsman,great-barracuda,grey-seal-bull,horseshoe-crab,kraken-spawnling,lions-mane-jelly,mangrove-manatee,newt-doctor,old-sturgeon,open-ocean-hermit-crab,orca-vanguard,otter-centurion,parrotfish,pincushion-urchin,planarian-splitter,proboscis-monkey,reef-admiral,reef-shark,riptide-eel,supernova-jelly,wolf-spider-mother --max-unique 6 --max-copies 4 --budget 6000 --final-games 24 --seed bal16-pro --focus family:tide,family:cleave,big,open --anchor banded-sea-krait,clownfish-scout,colossal-squid,coral-reef-shark,dolphin-knight,electric-ray,great-barracuda,horseshoe-crab,kraken-spawnling,mangrove-manatee,open-ocean-hermit-crab,orca-vanguard,parrotfish,reef-admiral,reef-shark,riptide-eel,supernova-jelly --anchor-min 10 --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 7224 games in 78 s.

- The list (29): Alley Cat, Alligator Gar, Banded Sea Krait, Clownfish Scout, Colossal Squid, Coral Reef Shark, Dolphin Outrider, Electric Ray, Giant Cave Huntsman, Great Barracuda, Grey Seal Bull, Horseshoe Crab, Kraken Spawnling, Lion's Mane Jelly, Mangrove Manatee, Newt Doctor, Old Sturgeon, Open-Ocean Hermit Crab, Orca Vanguard, Otter Centurion, Parrotfish, Pincushion Urchin, Planarian Splitter, Proboscis Monkey, Reef Admiral, Reef Shark, Riptide Eel, Supernova Jelly, Wolf Spider Mother.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 10-1 skirmish's deck; 10-2 skirmish's deck; 10-3 skirmish's deck; 10-4 skirmish's deck; 10-5 skirmish's deck; 10-6 elite's deck; 10-7 elite's deck; 10-8 elite's deck; 10-9 boss's deck; reference starter deck under 10-1's field; reference deck (Map 10) under 10-2's field; expected player deck (expectedPlayerDeck) under 10-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | family:cleave | tide x8; cleave x8 | 89% (86%-92%) | 0.4 | 0: 12, 1: 8 | 4x Alley Cat, 4x Open-Ocean Hermit Crab, 4x Parrotfish, 3x Giant Cave Huntsman, 3x Lion's Mane Jelly, 2x Supernova Jelly | 14 |
| 2 | open | tide x11; armor x8 | 82% (78%-86%) | 0.5 | 0: 10, 1: 10 | 4x Clownfish Scout, 4x Horseshoe Crab, 4x Open-Ocean Hermit Crab, 3x Grey Seal Bull, 3x Wolf Spider Mother, 2x Alley Cat | 0 |
| 3 | family:tide | tide x17; strike-first x6 | 80% (76%-85%) | 0.7 | 0: 12, 1: 6, 4: 2 | 4x Clownfish Scout, 4x Open-Ocean Hermit Crab, 4x Pincushion Urchin, 3x Electric Ray, 3x Great Barracuda, 2x Colossal Squid | 12 |
| 4 | big | big (8 copies at 3+ Lumber, average 1.6); tide x16; cleave x8 | 56% (51%-61%) | 1.55 | 0: 5, 1: 7, 3: 8 | 4x Clownfish Scout, 4x Grey Seal Bull, 4x Kraken Spawnling, 4x Orca Vanguard, 3x Alligator Gar, 1x Open-Ocean Hermit Crab | 12 |

## Per opponent

| Deck | fight:10-1 | fight:10-2 | fight:10-3 | fight:10-4 | fight:10-5 | fight:10-6 | fight:10-7 | fight:10-8 | fight:10-9 | ref:starter | ref:road10 | ref:expected |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 family:cleave | 96% | 100% | 100% | 96% | 100% | 100% | 96% | 92% | 100% | 88% | 46% | 58% |
| 2 open | 88% | 100% | 79% | 88% | 96% | 88% | 100% | 79% | 83% | 79% | 46% | 54% |
| 3 family:tide | 88% | 100% | 69% | 71% | 92% | 96% | 96% | 75% | 92% | 92% | 46% | 50% |
| 4 big | 42% | 92% | 42% | 33% | 92% | 83% | 83% | 38% | 50% | 71% | 13% | 33% |
