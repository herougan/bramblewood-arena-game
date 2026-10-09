# Card balance report (2026-10-09)

**How it's measured.** Every fieldable card (288) plays 80 matches with the game's own AI (open fights).
- **Test deck:** the card (8 copies; 6, 4 or 3 if it costs 1, 2 or 3+ Lumber) plus a reference mix.
- **Opponent:** 20 cards of the same reference mix (warren-scout, fawn-scout, bee-sentry, mouse-sapper, poison-dart-croaker).
- A card that adds nothing scores about 50%.
- Each rarity has a target band. A card above its band is "strong", below is "weak".
- Re-run any time with `node tools/card_balance.js 80 --suggest && python3 tools/card_balance_report.py`. The full sortable table is in the hub's ⚖️ Balance tab.

## What it found

1. **The computer opponent never saved Lumber** (fixed today).
   - It only discarded for Lumber when it had nothing free to play, so cards that cost Lumber were almost never played: by enemies, in every simulation and in every tuning number so far.
   - Now it pitches its weakest free card when a costly card is within two turns of reach, and plays the costly card once it can.
   - In testing, a 1-cost card went from a 23% to an 84% win rate, and a 2-cost card from 8% to 40%.
2. **Cost decides strength more than anything.** Median win rate by Lumber cost:

   | Cost | Cards | Median win % |
   |---|---|---|
   | 0 | 113 | 56.3 |
   | 1 | 84 | 67.5 |
   | 2 | 61 | 45.6 |
   | 3+ | 30 | 37.5 |

   1-cost cards are the sweet spot. Cards costing 3 or more lose to the reference deck: a match is usually over in ~17 rounds, and a 3–4 cost card with Wait 4–5 arrives too late to matter.
3. **The five Legendary dragons are among the weakest cards in the game** (about 38%), for the same reason.
   - I tested five fixes in simulation: start each match with 2 Lumber; +1 Lumber every 2 rounds; −1 cost and −1 Wait for every card costing 2+; +15% stats per Lumber of cost; and a start bonus plus stat buff together.
   - None made 3+ cost cards competitive.
   - This needs a design answer, not a number tweak: see decision B4.
4. **Rarity doesn't follow strength yet.** 199 of 288 cards have no rarity.
   - Some free cards win 95–100% (Carrion Fly Swarm, Cave Bat Swarm, Owl Fletcher, Trapdoor Spider, Tusked Vanguard).
   - Several Starters win 80–94% (Duck Paddler, Cobalt Talon Skirmisher, Crimson Wing Duelist Cadet, Otter Guard).
   - The tiny 1/2 Starters (Guppy, Earthworm, Silver Minnow, Worker Ant, Otter Kit) sit at 9–11%.
   - Giving every card a rarity from its measured strength would also fix the "enemy deck Lv 0" badge (decision B3).

| Rarity | Cards | Median win % |
|---|---|---|
| not set | 199 | 47.5 |
| common | 38 | 51.9 |
| starter | 36 | 41.2 |
| uncommon | 5 | 58.1 |
| legendary | 5 | 38.1 |
| rare | 5 | 46.3 |

## Strongest cheap cards (cost 0–1)

| Card | Rarity | Cost / Wait | Stats | Skills | Win % | Suggested rarity |
|---|---|---|---|---|---|---|
| Carrion Fly Swarm | – | 0 / 1 | 3/7 | poison, flying | 100 | legendary |
| Cave Bat Swarm | – | 0 / 0 | 2/5 | swipe, flying | 100 | legendary |
| Wandering Traveller | – | 0 / 1 | 6/7 | triggers | 100 | legendary |
| Owl Fletcher | – | 0 / 1 | 4/6 | flying, arrow | 99.4 | legendary |
| Trapdoor Spider | – | 0 / 1 | 4/8 | poison | 98.1 | legendary |
| Tusked Vanguard | – | 0 / 0 | 3/9 | – | 98.1 | legendary |
| Thornvine Lasher | – | 0 / 1 | 4/9 | – | 97.5 | legendary |
| Ent | – | 0 / 3 | 4/20 | – | 96.9 | legendary |
| Feral Tomcat | common | 0 / 0 | 3/5 | quick | 95 | – |
| Open-Ocean Hermit Crab | common | 0 / 0 | 2/8 | armor | 95 | – |
| Pike Lancer | – | 0 / 1 | 4/8 | – | 95 | legendary |
| Plains Zebra | – | 0 / 0 | 2/9 | evasive | 95 | legendary |
| Cobalt Talon Skirmisher | starter | 0 / 1 | 3/6 | flying | 94.4 | – |
| Colony | – | 0 / 0 | 0/20 | triggers | 94.4 | legendary |
| Duck Paddler | starter | 0 / 1 | 3/6 | flying | 94.4 | – |
| Ember Jackal | – | 1 / 0 | 5/8 | frenzy | 94.4 | legendary |
| Bramblewood Macaque | – | 0 / 1 | 3/10 | – | 93.8 | legendary |
| Dolphin Knight | – | 0 / 1 | 4/7 | – | 93.8 | legendary |
| Raven Scout | – | 0 / 0 | 2/4 | flying, triggers | 93.8 | legendary |
| Sulfur Vent Crab | uncommon | 0 / 1 | 2/9 | thorns | 93.1 | – |

## Weakest cards

| Card | Rarity | Cost / Wait | Stats | Win % |
|---|---|---|---|---|
| Trickster Fox | – | 1 / 0 | 1/7 | 6.9 |
| Dam Wall | – | 1 / 2 | 0/20 | 7.5 |
| Earthworm | starter | 0 / 0 | 1/2 | 8.8 |
| Guppy | starter | 0 / 0 | 1/2 | 8.8 |
| Silver Minnow | starter | 0 / 0 | 1/2 | 8.8 |
| Chipmunk Forager | starter | 0 / 0 | 1/3 | 10.6 |
| Harvest Mouse | starter | 0 / 0 | 1/3 | 10.6 |
| Moray Ambusher | – | 1 / 2 | 6/9 | 10.6 |
| Otter Kit | starter | 0 / 0 | 1/3 | 10.6 |
| Worker Ant | starter | 0 / 0 | 1/3 | 10.6 |
| Barnacle Fortress | – | 1 / 1 | 0/20 | 12.5 |
| Forager Ant | common | 0 / 0 | 1/4 | 13.8 |
| Glowworm Cluster | – | 0 / 1 | 1/5 | 13.8 |
| Meadow Rabbit | starter | 0 / 0 | 1/4 | 13.8 |
| Termite Mound | – | 1 / 1 | 0/22 | 13.8 |
| Mangrove Mudskipper | – | 0 / 0 | 1/4 | 15 |
| Marsh Gas Toad | – | 1 / 1 | 0/10 | 15 |
| Blessed Avatar | – | 0 / 2 | 6/20 | 15.6 |
| Raccoon Nightcrew | common | 1 / 1 | 5/12 | 17.5 |
| Dormouse | common | 0 / 0 | 1/5 | 18.1 |

## Suggested fixes for cards that have a rarity (61)

Each suggestion is the one stat change (Attack or Health, a few steps at most) that brought the card closest to its rarity's band in re-simulation.
The bands are a first guess, so read these as "which way and how far", not final numbers.
Starters in particular may be meant to be weak or strong; that is your call (decision B5).

| Card | Rarity | Now | Win % | Band | Change | Win % after |
|---|---|---|---|---|---|---|
| Feral Tomcat | common | 3/5 | 95 | 35–60 | Health 5 → 2 | 50.6 |
| Open-Ocean Hermit Crab | common | 2/8 | 95 | 35–60 | Attack 2 → 1 | 48.8 |
| Frost Hare Sprinter | common | 2/7 | 91.9 | 35–60 | Health 7 → 3 | 56.3 |
| Porcupine Roller | common | 1/10 | 91.3 | 35–60 | Attack 1 → 0 | 54.4 |
| Dune Jackal | common | 5/10 | 88.1 | 35–60 | Attack 5 → 3 | 58.1 |
| Jackrabbit Sprinter | common | 5/8 | 88.1 | 35–60 | Attack 5 → 3 | 51.3 |
| Chipmunk Cavalry | common | 4/9 | 86.3 | 35–60 | Attack 4 → 3 | 55.6 |
| Honey Badger Fury | common | 5/10 | 85.6 | 35–60 | Attack 5 → 2 | 57.5 |
| Forager Ant | common | 1/4 | 13.8 | 35–60 | Attack 1 → 2 | 40.6 |
| Raccoon Nightcrew | common | 5/12 | 17.5 | 35–60 | Attack 5 → 8 | 41.3 |
| Dormouse | common | 1/5 | 18.1 | 35–60 | Attack 1 → 2 | 47.5 |
| Pack Rat Looter | common | 3/10 | 76.3 | 35–60 | Attack 3 → 2 | 41.3 |
| Beetle Grunt | common | 2/4 | 19.4 | 35–60 | Health 4 → 7 | 49.4 |
| Duckling Squadron | common | 1/4 | 75.6 | 35–60 | Health 4 → 2 | 41.3 |
| Trash Panda Trickster | common | 2/6 | 75.6 | 35–60 | Attack 2 → 1 | 38.8 |
| Shrine Bell-Ringer | common | 2/12 | 20.6 | 35–60 | Attack 2 → 3 | 36.3 |
| Camouflage Frog | common | 2/9 | 21.3 | 35–60 | Attack 2 → 3 | 45 |
| Shepherd's Bark | common | 4/16 | 70.6 | 35–60 | Health 16 → 12 | 53.1 |
| Meadow Frog | common | 2/3 | 26.9 | 35–60 | Attack 2 → 3 | 50 |
| Hedgehog Scout | common | 1/4 | 27.5 | 35–60 | Health 4 → 6 | 41.9 |
| Slowpoke Sentinel | common | 1/16 | 67.5 | 35–60 | Health 16 → 8 | 56.3 |
| Quarry Mole | common | 2/10 | 66.3 | 35–60 | Health 10 → 8 | 50 |
| Owl Nightwatch | common | 4/10 | 30.6 | 35–60 | Health 10 → 13 | 43.8 |
| Rabbit Kit | common | 2/2 | 30.6 | 35–60 | Attack 2 → 3 | 50.6 |
| Chipmunk Hoarder | common | 1/5 | 31.9 | 35–60 | Attack 1 → 2 | 43.1 |
| Rootworm Colony | common | 3/14 | 61.9 | 35–60 | Attack 3 → 2 | 52.5 |
| Black Dragon | legendary | 10/50 | 38.1 | 70–97 | Attack 10 → 11 | 38.1 |
| Blue Dragon | legendary | 10/44 | 38.1 | 70–97 | Attack 10 → 11 | 38.1 |
| Green Dragon | legendary | 10/50 | 38.1 | 70–97 | Attack 10 → 11 | 38.1 |
| Red Dragon | legendary | 10/44 | 38.1 | 70–97 | Attack 10 → 11 | 38.1 |
| White Dragon | legendary | 10/44 | 38.1 | 70–97 | Attack 10 → 11 | 38.1 |
| Voltaic Eel | rare | 3/10 | 36.9 | 52–75 | Attack 3 → 4 | 36.9 |
| Shimmerwing Stag | rare | 6/18 | 44.4 | 52–75 | Attack 6 → 8 | 52.5 |
| River Warden | rare | 5/15 | 46.3 | 52–75 | Attack 5 → 8 | 55.6 |
| Octopus Tactician | rare | 6/22 | 46.9 | 52–75 | Attack 6 → 8 | 53.1 |
| Cobalt Talon Skirmisher | starter | 3/6 | 94.4 | 20–48 | Health 6 → 2 | 38.8 |
| Duck Paddler | starter | 3/6 | 94.4 | 20–48 | Health 6 → 2 | 38.8 |
| Crimson Wing Duelist Cadet | starter | 3/5 | 90 | 20–48 | Attack 3 → 1 | 29.4 |
| Pond Duck | starter | 2/5 | 86.3 | 20–48 | Attack 2 → 1 | 41.9 |
| Otter Guard | starter | 3/8 | 81.9 | 20–48 | Health 8 → 5 | 43.8 |
| Burrow Rabbit | starter | 3/7 | 80 | 20–48 | Health 7 → 5 | 43.8 |
| River Carp | starter | 3/7 | 80 | 20–48 | Health 7 → 5 | 43.8 |
| Dominion Nestguard | starter | 4/9 | 75 | 20–48 | Attack 4 → 2 | 27.5 |
| Voidfeather Scout | starter | 3/4 | 70.6 | 20–48 | Health 4 → 2 | 38.8 |
| Violet Vane Fletcher | starter | 2/4 | 68.1 | 20–48 | Attack 2 → 1 | 34.4 |
| Bee Sentry | starter | 2/5 | 63.8 | 20–48 | Attack 2 → 1 | 33.8 |
| Sunthroat Courier | starter | 2/5 | 63.8 | 20–48 | Attack 2 → 1 | 29.4 |
| Earthworm | starter | 1/2 | 8.8 | 20–48 | Attack 1 → 3 | 29.4 |
| Guppy | starter | 1/2 | 8.8 | 20–48 | Attack 1 → 3 | 33.1 |
| Silver Minnow | starter | 1/2 | 8.8 | 20–48 | Attack 1 → 3 | 33.1 |
| Chipmunk Forager | starter | 1/3 | 10.6 | 20–48 | Attack 1 → 2 | 26.9 |
| Harvest Mouse | starter | 1/3 | 10.6 | 20–48 | Attack 1 → 2 | 26.9 |
| Otter Kit | starter | 1/3 | 10.6 | 20–48 | Attack 1 → 2 | 26.9 |
| Worker Ant | starter | 1/3 | 10.6 | 20–48 | Attack 1 → 2 | 26.9 |
| Crimson Wing Recruit | starter | 2/3 | 56.3 | 20–48 | Attack 2 → 1 | 24.4 |
| Ant Scout | starter | 3/6 | 55.6 | 20–48 | Attack 3 → 2 | 34.4 |
| Meadow Rabbit | starter | 1/4 | 13.8 | 20–48 | Attack 1 → 2 | 40.6 |
| Sulfur Vent Crab | uncommon | 2/9 | 93.1 | 45–68 | Attack 2 → 1 | 56.9 |
| Riptide Eel | uncommon | 5/8 | 20.6 | 45–68 | Attack 5 → 8 | 46.3 |
| Soldier Ant | uncommon | 3/8 | 81.9 | 45–68 | Health 8 → 6 | 55.6 |
| Tiny Cave Dweller | uncommon | 1/4 | 36.9 | 45–68 | Health 4 → 5 | 56.3 |

## Suggested rarities for cards with none

By measured strength, the nearest rarity band: 74 starter, 40 common, 39 legendary, 11 uncommon, 8 rare, 7 epic, 6 veryrare, 6 heroic, 5 unique, 3 superrare.
The per-card list is in the hub's ⚖️ Balance tab (filter "No rarity").
Many free cards land on Legendary: either they become rarer, or they get weaker and keep a low rarity.

