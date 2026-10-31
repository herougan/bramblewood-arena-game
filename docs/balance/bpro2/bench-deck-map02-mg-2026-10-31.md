# Focused decks: Map 2 Smugglers' Grotto (2026-10-31)

Package TOOLS1 (T3). `node tools/bench/bench.js deck --map mg --pool conch-crawler,conch-herald,fiddler-crab-swarm,grey-seal-bull,gull-thief,open-ocean-hermit-crab,pincushion-urchin,sea-turtle-elder,tide-pool-crab,tidepool-trapper-crab,trash-panda-trickster --max-unique 6 --max-copies 4 --budget 6000 --final-games 24 --seed bpro2 --focus economy,big,swarm,open --level 1 --mode map-true` (tools/bench/bench.js deck 1.0.0 (2026-10-28, TOOLS1)), 6986 games in 96 s.

- The list (11): Conch Crawler, Conch Herald, Fiddler Crab Swarm, Grey Seal Bull, Gull Thief, Open-Ocean Hermit Crab, Pincushion Urchin, Sea Turtle Elder, Tide Pool Crab, Tidepool Trapper Crab, Trash Panda Trickster.
- The rule: at most 6 different cards, at most 4 copies (never above a rarity's cap), 20 cards. Level 1.
- The gauntlet (deckopt's, a fair mirror under each fight's field, seats swapped): 2-B-1 skirmish's deck; 2-B-2 elite's deck; 2-B-3 elite's deck; 2-B-4 elite's deck; reference starter deck under 2-B-1's field; reference deck (Map 7) under 2-B-2's field; expected player deck (expectedPlayerDeck) under 2-B-3's field.
- Score: the mean win rate over the gauntlet, 24 games an entry, 95% interval.

| Deck | Focus | Labels | Win rate (95%) | Avg Lumber | Curve (Lumber: copies) | Cards | Apart from open |
|---|---|---|---|---|---|---|---|
| 1 | big | big (8 copies at 1+ Lumber, average 0.4); economy (4 resource makers); tide x16; guard x12 | 80% (74%-85%) | 0.4 | 0: 12, 1: 8 | 4x Conch Crawler, 4x Conch Herald, 4x Grey Seal Bull, 4x Tide Pool Crab, 4x Trash Panda Trickster | 8 |
| 2 | open | swarm (16 copies at 0 Lumber); economy (4 resource makers); tide x16; armor x8 | 77% (72%-83%) | 0.2 | 0: 16, 1: 4 | 4x Conch Herald, 4x Fiddler Crab Swarm, 4x Pincushion Urchin, 4x Tide Pool Crab, 4x Trash Panda Trickster | 0 |
| 3 | swarm | swarm (15 copies at 0 Lumber); economy (7 resource makers); tide x13 | 76% (70%-82%) | 0.25 | 0: 15, 1: 5 | 4x Open-Ocean Hermit Crab, 4x Pincushion Urchin, 4x Trash Panda Trickster, 3x Grey Seal Bull, 3x Gull Thief, 2x Conch Herald | 10 |
| 4 | economy | swarm (16 copies at 0 Lumber); economy (6 resource makers); tide x11; armor x6 | 70% (64%-76%) | 0.2 | 0: 16, 1: 4 | 4x Conch Herald, 4x Gull Thief, 4x Pincushion Urchin, 3x Conch Crawler, 3x Tidepool Trapper Crab, 2x Trash Panda Trickster | 10 |

## Per opponent

| Deck | fight:2-B-1 | fight:2-B-2 | fight:2-B-3 | fight:2-B-4 | ref:starter | ref:road7 | ref:expected |
|---|---|---|---|---|---|---|---|
| 1 big | 63% | 79% | 79% | 92% | 92% | 58% | 96% |
| 2 open | 63% | 75% | 79% | 83% | 96% | 50% | 96% |
| 3 swarm | 63% | 50% | 83% | 96% | 96% | 50% | 96% |
| 4 economy | 67% | 58% | 83% | 88% | 88% | 21% | 88% |
