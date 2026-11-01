# Focused decks: Map 2 Smugglers' Grotto (2026-11-01)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map mg --pool conch-crawler,conch-herald,driftwood-crab,fiddler-crab-swarm,gallery-orb-weaver,grey-seal-bull,gull-thief,octopus-tactician,old-shell,open-ocean-hermit-crab,pelican-diver,pincushion-urchin,rock-pool-starfish,sea-turtle-elder,tide-pool-crab,tidepool-trapper-crab,trash-panda-trickster --max-unique 6 --max-copies 4 --budget 6000 --final-games 24 --seed bpro2 --focus economy,big,swarm,open --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 7014 games in 435 s.

- The list (17): Conch Crawler, Conch Herald, Driftwood Crab, Fiddler Crab Swarm, Gallery Orb-Weaver, Grey Seal Bull, Gull Thief, Octopus Tactician, The Old Shell, Open-Ocean Hermit Crab, Pelican Diver, Pincushion Urchin, Rock Pool Starfish, Sea Turtle Elder, Tide Pool Crab, Tidepool Trapper Crab, Trash Panda Trickster.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 2-B-1 skirmish's deck; 2-B-2 elite's deck; 2-B-3 elite's deck; 2-B-4 elite's deck; reference starter deck under 2-B-1's field; reference deck (Map 7) under 2-B-2's field; expected player deck (expectedPlayerDeck) under 2-B-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | big | big (8 copies at 1+ Lumber, average 0.4); economy (8 resource makers); tide x8 | 83% (77%-88%) | 0.4 | 0: 12, 1: 8 | 4x Conch Herald, 4x Gallery Orb-Weaver, 4x Gull Thief, 4x Trash Panda Trickster, 3x Pincushion Urchin, 1x Fiddler Crab Swarm | 13 |
| 2 | swarm | swarm (17 copies at 0 Lumber); economy (6 resource makers); tide x10; armor x8 | 81% (76%-86%) | 0.15 | 0: 17, 1: 3 | 4x Tide Pool Crab, 4x Tidepool Trapper Crab, 4x Trash Panda Trickster, 3x Conch Herald, 3x Pincushion Urchin, 2x Driftwood Crab | 13 |
| 3 | open | big (8 copies at 1+ Lumber, average 0.5); economy (4 resource makers); tide x12; armor x9 | 79% (73%-84%) | 0.45 | 0: 12, 1: 7, 2: 1 | 4x Conch Crawler, 4x Open-Ocean Hermit Crab, 4x Pelican Diver, 4x Trash Panda Trickster, 3x Conch Herald, 1x Sea Turtle Elder | 0 |
| 4 | economy | big (11 copies at 1+ Lumber, average 0.7); economy (8 resource makers); flying x8 | 59% (52%-66%) | 0.7 | 0: 9, 1: 8, 2: 3 | 4x Driftwood Crab, 4x Gallery Orb-Weaver, 4x Gull Thief, 4x Pelican Diver, 3x Octopus Tactician, 1x Fiddler Crab Swarm | 16 |

## Per opponent

| Deck | fight:2-B-1 | fight:2-B-2 | fight:2-B-3 | fight:2-B-4 | ref:starter | ref:road7 | ref:expected |
|---|---|---|---|---|---|---|---|
| 1 big | 63% | 88% | 88% | 96% | 100% | 58% | 88% |
| 2 swarm | 63% | 79% | 83% | 100% | 96% | 50% | 96% |
| 3 open | 75% | 83% | 88% | 83% | 83% | 50% | 88% |
| 4 economy | 38% | 65% | 58% | 79% | 79% | 21% | 75% |
