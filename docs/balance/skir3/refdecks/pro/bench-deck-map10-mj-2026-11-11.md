# Focused decks: Map 10 The Sunken Depths (2026-11-12)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map mj --pool abyss-lantern-squid,alley-cat,clownfish-scout,colossal-squid,coral-polyp-colony,crown-of-thorns-star,giant-cave-huntsman,giant-clam,great-barracuda,humpback-elder,krill-swarm,mangrove-manatee,moon-jelly,mudpuppy,newt-doctor,orca-vanguard,otter-centurion,pincushion-urchin,reef-admiral,riptide-eel,wolf-spider-mother --max-unique 6 --max-copies 4 --budget 8000 --final-games 24 --seed skir1-pro --focus family:tide,family:cleave,big,open --anchor abyss-lantern-squid,clownfish-scout,coral-polyp-colony,giant-clam,humpback-elder,moon-jelly,orca-vanguard,reef-admiral,riptide-eel --anchor-min 10 --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 8688 games in 134 s.

- The list (21): Abyss Lantern Squid, Alley Cat, Clownfish Scout, Colossal Squid, Coral Polyp Colony, Crown-of-thorns Star, Giant Cave Huntsman, Giant Clam, Great Barracuda, Humpback Elder, Krill Swarm, Mangrove Manatee, Moon Jelly, Mudpuppy, Newt Doctor, Orca Vanguard, Otter Centurion, Pincushion Urchin, Reef Admiral, Riptide Eel, Wolf Spider Mother.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 10-A-1 skirmish's deck; 10-A-2 skirmish's deck; 10-A-3 skirmish's deck; 10-A-4 elite's deck; 10-A-5 boss's deck; reference starter deck under 10-A-1's field; reference deck (Map 11) under 10-A-2's field; expected player deck (expectedPlayerDeck) under 10-A-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | open | swarm (16 copies at 0 Lumber); tide x18 | 95% (92%-98%) | 0.2 | 0: 16, 1: 4 | 4x Abyss Lantern Squid, 4x Clownfish Scout, 4x Krill Swarm, 4x Moon Jelly, 2x Coral Polyp Colony, 2x Otter Centurion | 0 |
| 2 | family:tide | swarm (18 copies at 0 Lumber); tide x14 | 94% (91%-97%) | 0.3 | 0: 18, 3: 2 | 4x Clownfish Scout, 4x Coral Polyp Colony, 4x Krill Swarm, 3x Alley Cat, 3x Mudpuppy, 2x Humpback Elder | 10 |
| 3 | family:cleave | tide x14; cleave x8 | 92% (89%-96%) | 0.85 | 0: 11, 1: 5, 3: 4 | 4x Alley Cat, 4x Krill Swarm, 4x Orca Vanguard, 3x Abyss Lantern Squid, 3x Coral Polyp Colony, 2x Giant Cave Huntsman | 11 |
| 4 | big | big (8 copies at 3+ Lumber, average 1.4); tide x13; heal x7 | 70% (64%-75%) | 1.35 | 0: 9, 1: 3, 3: 8 | 4x Humpback Elder, 4x Mudpuppy, 4x Orca Vanguard, 3x Newt Doctor, 3x Riptide Eel, 2x Krill Swarm | 18 |

## Per opponent

| Deck | fight:10-A-1 | fight:10-A-2 | fight:10-A-3 | fight:10-A-4 | fight:10-A-5 | ref:starter | ref:road11 | ref:expected |
|---|---|---|---|---|---|---|---|---|
| 1 open | 100% | 100% | 100% | 96% | 100% | 92% | 100% | 71% |
| 2 family:tide | 100% | 100% | 100% | 100% | 100% | 96% | 100% | 54% |
| 3 family:cleave | 100% | 100% | 100% | 96% | 96% | 92% | 96% | 58% |
| 4 big | 100% | 79% | 92% | 83% | 67% | 79% | 46% | 13% |
