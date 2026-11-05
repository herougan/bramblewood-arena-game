# Focused decks: Map 10 The Sunken Depths (2026-11-05)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map mj --pool alley-cat,alligator-gar,banded-sea-krait,blue-ringed-octopus,clownfish-scout,colossal-squid,coral-polyp-colony,coral-reef-shark,electric-ray,giant-cave-huntsman,great-barracuda,grey-seal-bull,hagfish-silencer,horseshoe-crab,kraken-spawnling,lions-mane-jelly,mangrove-manatee,nautilus-drifter,newt-doctor,orca-vanguard,otter-centurion,parrotfish,pincushion-urchin,planarian-splitter,reef-admiral,riptide-eel,wolf-spider-mother --max-unique 6 --max-copies 4 --budget 6000 --final-games 24 --seed bal16-pro --focus family:tide,family:cleave,big,open --anchor blue-ringed-octopus,clownfish-scout,colossal-squid,coral-polyp-colony,coral-reef-shark,electric-ray,great-barracuda,hagfish-silencer,kraken-spawnling,mangrove-manatee,nautilus-drifter,orca-vanguard,parrotfish,reef-admiral,riptide-eel --anchor-min 10 --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 7184 games in 96 s.

- The list (27): Alley Cat, Alligator Gar, Banded Sea Krait, Blue-ringed Octopus, Clownfish Scout, Colossal Squid, Coral Polyp Colony, Coral Reef Shark, Electric Ray, Giant Cave Huntsman, Great Barracuda, Grey Seal Bull, Hagfish Silencer, Horseshoe Crab, Kraken Spawnling, Lion's Mane Jelly, Mangrove Manatee, Nautilus Drifter, Newt Doctor, Orca Vanguard, Otter Centurion, Parrotfish, Pincushion Urchin, Planarian Splitter, Reef Admiral, Riptide Eel, Wolf Spider Mother.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 10-A-1 skirmish's deck; 10-A-2 skirmish's deck; 10-A-3 skirmish's deck; 10-A-4 elite's deck; 10-A-5 boss's deck; reference starter deck under 10-A-1's field; reference deck (Map 11) under 10-A-2's field; expected player deck (expectedPlayerDeck) under 10-A-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | family:tide | tide x11 | 90% (87%-92%) | 0.35 | 0: 13, 1: 7 | 4x Clownfish Scout, 4x Lion's Mane Jelly, 4x Parrotfish, 3x Mangrove Manatee, 3x Otter Centurion, 2x Newt Doctor | 16 |
| 2 | open | tide x8 | 89% (86%-92%) | 0.75 | 0: 5, 1: 15 | 4x Coral Polyp Colony, 4x Electric Ray, 4x Horseshoe Crab, 4x Planarian Splitter, 3x Mangrove Manatee, 1x Clownfish Scout | 0 |
| 3 | family:cleave | tide x15; cleave x8 | 84% (81%-88%) | 0.85 | 0: 11, 1: 5, 3: 4 | 4x Grey Seal Bull, 4x Newt Doctor, 4x Orca Vanguard, 4x Parrotfish, 3x Clownfish Scout, 1x Planarian Splitter | 18 |
| 4 | big | big (8 copies at 3+ Lumber, average 1.7); tide x10; cleave x8 | 72% (68%-77%) | 1.7 | 0: 2, 1: 10, 3: 8 | 4x Banded Sea Krait, 4x Grey Seal Bull, 4x Kraken Spawnling, 4x Orca Vanguard, 2x Mangrove Manatee, 2x Newt Doctor | 18 |

## Per opponent

| Deck | fight:10-A-1 | fight:10-A-2 | fight:10-A-3 | fight:10-A-4 | fight:10-A-5 | ref:starter | ref:road11 | ref:expected |
|---|---|---|---|---|---|---|---|---|
| 1 family:tide | 100% | 100% | 100% | 100% | 100% | 100% | 96% | 21% |
| 2 open | 100% | 96% | 100% | 96% | 96% | 96% | 100% | 25% |
| 3 family:cleave | 96% | 88% | 100% | 96% | 100% | 85% | 94% | 17% |
| 4 big | 92% | 88% | 96% | 92% | 96% | 63% | 50% | 4% |
