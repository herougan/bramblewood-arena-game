# Focused decks: Map 2 Smugglers' Grotto (2026-11-05)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map mg --pool conch-crawler,conch-herald,driftwood-crab,gallery-orb-weaver,grey-seal-bull,gull-thief,octopus-tactician,old-shell,open-ocean-hermit-crab,pelican-diver,pincushion-urchin,rock-pool-starfish,sea-turtle-elder,tide-pool-crab,tidepool-trapper-crab,trash-panda-trickster --max-unique 6 --max-copies 4 --budget 6000 --final-games 24 --seed bal16-bpro --focus economy,family:tide,family:armor,open --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 6790 games in 135 s.

- The list (16): Conch Crawler, Conch Herald, Driftwood Crab, Gallery Orb-Weaver, Grey Seal Bull, Gull Thief, Octopus Tactician, The Old Shell, Open-Ocean Hermit Crab, Pelican Diver, Pincushion Urchin, Rock Pool Starfish, Sea Turtle Elder, Tide Pool Crab, Tidepool Trapper Crab, Trash Panda Trickster.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 2-B-1 skirmish's deck; 2-B-2 elite's deck; 2-B-3 elite's deck; 2-B-4 elite's deck; reference starter deck under 2-B-1's field; reference deck (Map 7) under 2-B-2's field; expected player deck (expectedPlayerDeck) under 2-B-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | economy | swarm (14 copies at 0 Lumber); economy (8 resource makers); tide x7 | 84% (79%-89%) | 0.3 | 0: 14, 1: 6 | 4x Conch Herald, 4x Gull Thief, 4x Trash Panda Trickster, 3x Conch Crawler, 3x Driftwood Crab, 2x Gallery Orb-Weaver | 10 |
| 2 | open | big (8 copies at 1+ Lumber, average 0.4); tide x12 | 79% (73%-84%) | 0.4 | 0: 12, 1: 8 | 4x Conch Herald, 4x Driftwood Crab, 4x Pelican Diver, 4x Rock Pool Starfish, 3x Conch Crawler, 1x Open-Ocean Hermit Crab | 0 |
| 3 | family:tide | big (8 copies at 1+ Lumber, average 0.4); economy (5 resource makers); tide x11; flying x6 | 78% (72%-84%) | 0.4 | 0: 12, 1: 8 | 4x Conch Herald, 4x Pelican Diver, 4x Pincushion Urchin, 3x Open-Ocean Hermit Crab, 3x Trash Panda Trickster, 2x Gull Thief | 11 |
| 4 | family:armor | big (12 copies at 1+ Lumber, average 0.8); tide x12; armor x8 | 73% (67%-80%) | 0.8 | 0: 8, 1: 8, 2: 4 | 4x Conch Crawler, 4x Conch Herald, 4x Gallery Orb-Weaver, 4x Octopus Tactician, 4x Tidepool Trapper Crab | 13 |

## Per opponent

| Deck | fight:2-B-1 | fight:2-B-2 | fight:2-B-3 | fight:2-B-4 | ref:starter | ref:road7 | ref:expected |
|---|---|---|---|---|---|---|---|
| 1 economy | 100% | 75% | 88% | 100% | 100% | 54% | 71% |
| 2 open | 88% | 83% | 92% | 96% | 100% | 50% | 42% |
| 3 family:tide | 96% | 92% | 83% | 92% | 79% | 63% | 42% |
| 4 family:armor | 96% | 75% | 75% | 75% | 83% | 58% | 50% |
