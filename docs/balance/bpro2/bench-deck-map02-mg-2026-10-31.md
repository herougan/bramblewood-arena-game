# Focused decks: Map 2 Smugglers' Grotto (2026-11-02)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map mg --pool conch-crawler,conch-herald,driftwood-crab,fiddler-crab-swarm,gallery-orb-weaver,grey-seal-bull,gull-thief,octopus-tactician,old-shell,open-ocean-hermit-crab,pelican-diver,pincushion-urchin,rock-pool-starfish,sea-turtle-elder,tide-pool-crab,tidepool-trapper-crab,trash-panda-trickster --max-unique 6 --max-copies 4 --budget 6000 --final-games 24 --seed bpro2 --focus economy,big,swarm,open --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 6846 games in 91 s.

- The list (17): Conch Crawler, Conch Herald, Driftwood Crab, Fiddler Crab Swarm, Gallery Orb-Weaver, Grey Seal Bull, Gull Thief, Octopus Tactician, The Old Shell, Open-Ocean Hermit Crab, Pelican Diver, Pincushion Urchin, Rock Pool Starfish, Sea Turtle Elder, Tide Pool Crab, Tidepool Trapper Crab, Trash Panda Trickster.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 2-B-1 skirmish's deck; 2-B-2 elite's deck; 2-B-3 elite's deck; 2-B-4 elite's deck; reference starter deck under 2-B-1's field; reference deck (Map 7) under 2-B-2's field; expected player deck (expectedPlayerDeck) under 2-B-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | economy | big (8 copies at 1+ Lumber, average 0.4); economy (8 resource makers) | 90% (85%-94%) | 0.4 | 0: 12, 1: 8 | 4x Driftwood Crab, 4x Gallery Orb-Weaver, 4x Pelican Diver, 4x Trash Panda Trickster, 3x Conch Crawler, 1x Tidepool Trapper Crab | 9 |
| 2 | big | big (8 copies at 1+ Lumber, average 0.4); economy (6 resource makers); tide x6 | 86% (81%-91%) | 0.4 | 0: 12, 1: 8 | 4x Fiddler Crab Swarm, 4x Gallery Orb-Weaver, 4x Pelican Diver, 4x Trash Panda Trickster, 2x Driftwood Crab, 2x Pincushion Urchin | 8 |
| 3 | open | big (9 copies at 1+ Lumber, average 0.7); economy (7 resource makers); tide x8 | 81% (75%-87%) | 0.65 | 0: 11, 1: 5, 2: 4 | 4x Gallery Orb-Weaver, 4x Octopus Tactician, 4x Pincushion Urchin, 4x Trash Panda Trickster, 3x Driftwood Crab, 1x The Old Shell | 0 |
| 4 | swarm | swarm (14 copies at 0 Lumber); economy (4 resource makers); armor x10; tide x8 | 73% (66%-79%) | 0.4 | 0: 14, 1: 4, 2: 2 | 4x Gallery Orb-Weaver, 4x Open-Ocean Hermit Crab, 4x Tidepool Trapper Crab, 4x Trash Panda Trickster, 2x Fiddler Crab Swarm, 2x Octopus Tactician | 10 |

## Per opponent

| Deck | fight:2-B-1 | fight:2-B-2 | fight:2-B-3 | fight:2-B-4 | ref:starter | ref:road7 | ref:expected |
|---|---|---|---|---|---|---|---|
| 1 economy | 88% | 79% | 92% | 96% | 92% | 83% | 100% |
| 2 big | 88% | 71% | 83% | 100% | 92% | 67% | 100% |
| 3 open | 63% | 75% | 96% | 83% | 88% | 71% | 92% |
| 4 swarm | 63% | 58% | 88% | 75% | 79% | 58% | 88% |
