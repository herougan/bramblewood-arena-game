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
   | 1 | 84 | 65.0 |
   | 2 | 61 | 45.6 |
   | 3+ | 30 | 37.5 |

   1-cost cards are the sweet spot. Cards costing 3 or more lose to the reference deck: a match is usually over in ~17 rounds, and a 3–4 cost card with Wait 4–5 arrives too late to matter.
3. **The five Legendary dragons are among the weakest cards in the game** (about 38%), for the same reason.
   - I tested five fixes in simulation: start each match with 2 Lumber; +1 Lumber every 2 rounds; −1 cost and −1 Wait for every card costing 2+; +15% stats per Lumber of cost; and a start bonus plus stat buff together.
   - None made 3+ cost cards competitive.
   - This needs a design answer, not a number tweak: see decision B4.
4. **Rarity doesn't follow strength yet.** 0 of 288 cards have no rarity.
   - Some free cards win 95–100% (Carrion Fly Swarm, Cave Bat Swarm, Owl Fletcher, Trapdoor Spider, Tusked Vanguard).
   - Several Starters win 80–94% (Duck Paddler, Cobalt Talon Skirmisher, Crimson Wing Duelist Cadet, Otter Guard).
   - The tiny 1/2 Starters (Guppy, Earthworm, Silver Minnow, Worker Ant, Otter Kit) sit at 9–11%.
   - Giving every card a rarity from its measured strength would also fix the "enemy deck Lv 0" badge (decision B3).

| Rarity | Cards | Median win % |
|---|---|---|
| common | 152 | 39.7 |
| rare | 79 | 76.9 |
| starter | 36 | 41.2 |
| uncommon | 16 | 57.5 |
| legendary | 5 | 38.1 |

## Strongest cheap cards (cost 0–1)

| Card | Rarity | Cost / Wait | Stats | Skills | Win % | Suggested rarity |
|---|---|---|---|---|---|---|
| Wandering Traveller | rare | 0 / 1 | 6/7 | triggers | 100 | – |
| Carrion Fly Swarm | rare | 0 / 1 | 3/5 | poison, flying | 98.1 | – |
| Owl Fletcher | rare | 0 / 1 | 4/4 | flying, arrow | 97.5 | – |
| Tusked Vanguard | rare | 0 / 0 | 3/7 | – | 96.9 | – |
| Cave Bat Swarm | rare | 0 / 0 | 2/3 | swipe, flying | 96.3 | – |
| Cobalt Talon Skirmisher | starter | 0 / 1 | 3/6 | flying | 94.4 | – |
| Colony | rare | 0 / 0 | 0/20 | triggers | 94.4 | – |
| Duck Paddler | starter | 0 / 1 | 3/6 | flying | 94.4 | – |
| Pike Lancer | rare | 0 / 1 | 4/7 | – | 93.8 | – |
| Ent | rare | 0 / 3 | 3/20 | – | 93.1 | – |
| Porcupine Roller | common | 0 / 0 | 1/10 | thorns | 91.3 | – |
| Trapdoor Spider | rare | 0 / 1 | 4/6 | poison | 90.6 | – |
| Cave Flitter | rare | 0 / 0 | 3/3 | flying | 90 | – |
| Crimson Wing Duelist Cadet | starter | 0 / 1 | 3/5 | flying | 90 | – |
| Lucky Hopper | rare | 1 / 0 | 4/11 | onSpawnGold | 90 | – |
| Raven Scout | rare | 0 / 0 | 2/3 | flying, triggers | 90 | – |
| Grass Viper | rare | 0 / 0 | 2/5 | poison | 89.4 | – |
| Ember Jackal | rare | 1 / 0 | 3/8 | frenzy | 88.8 | – |
| Otter Centurion | rare | 0 / 1 | 3/9 | – | 88.8 | – |
| Thornvine Lasher | rare | 0 / 1 | 3/9 | – | 88.8 | – |

## Weakest cards

| Card | Rarity | Cost / Wait | Stats | Win % |
|---|---|---|---|---|
| Dam Wall | common | 1 / 2 | 0/20 | 7.5 |
| Earthworm | starter | 0 / 0 | 1/2 | 8.8 |
| Guppy | starter | 0 / 0 | 1/2 | 8.8 |
| Silver Minnow | starter | 0 / 0 | 1/2 | 8.8 |
| Chipmunk Forager | starter | 0 / 0 | 1/3 | 10.6 |
| Harvest Mouse | starter | 0 / 0 | 1/3 | 10.6 |
| Otter Kit | starter | 0 / 0 | 1/3 | 10.6 |
| Worker Ant | starter | 0 / 0 | 1/3 | 10.6 |
| Barnacle Fortress | common | 1 / 1 | 0/20 | 12.5 |
| Meadow Rabbit | starter | 0 / 0 | 1/4 | 13.8 |
| Termite Mound | common | 1 / 1 | 0/22 | 13.8 |
| Marsh Gas Toad | common | 1 / 1 | 0/10 | 15 |
| Moray Ambusher | common | 1 / 2 | 6/11 | 15 |
| Blessed Avatar | common | 0 / 2 | 6/20 | 15.6 |
| Trickster Fox | common | 1 / 0 | 2/7 | 18.1 |
| Hanging Loafer | common | 1 / 4 | 3/22 | 20 |
| Peak Condor | common | 1 / 1 | 3/8 | 20 |
| Fiddler Crab Swarm | common | 0 / 0 | 1/3 | 20.6 |
| Nest | common | 0 / 0 | 0/18 | 20.6 |
| Shrine Bell-Ringer | common | 1 / 1 | 2/12 | 20.6 |

## Suggested fixes for cards that have a rarity (126)

Each suggestion is the one stat change (Attack or Health, a few steps at most) that brought the card closest to its rarity's band in re-simulation.
The bands are a first guess, so read these as "which way and how far", not final numbers.
Starters in particular may be meant to be weak or strong; that is your call (decision B5).

| Card | Rarity | Now | Win % | Band | Change | Win % after |
|---|---|---|---|---|---|---|
| Porcupine Roller | common | 1/10 | 91.3 | 35–60 | Attack 1 → 0 | 54.4 |
| Dam Wall | common | 0/20 | 7.5 | 35–60 | Attack 0 → 3 | 38.8 |
| Dune Jackal | common | 4/10 | 86.3 | 35–60 | Attack 4 → 3 | 58.1 |
| Jackrabbit Sprinter | common | 4/8 | 83.1 | 35–60 | Attack 4 → 3 | 51.3 |
| Barnacle Fortress | common | 0/20 | 12.5 | 35–60 | Attack 0 → 2 | 46.9 |
| Frost Hare Sprinter | common | 2/5 | 81.3 | 35–60 | Attack 2 → 1 | 48.1 |
| Termite Mound | common | 0/22 | 13.8 | 35–60 | Attack 0 → 2 | 48.1 |
| Marsh Gas Toad | common | 0/10 | 15 | 35–60 | Attack 0 → 2 | 36.3 |
| Moray Ambusher | common | 6/11 | 15 | 35–60 | Attack 6 → 10 | 36.3 |
| Blessed Avatar | common | 6/20 | 15.6 | 35–60 | Attack 6 → 7 | 15.6 |
| Trickster Fox | common | 2/7 | 18.1 | 35–60 | Attack 2 → 3 | 34.4 |
| Hanging Loafer | common | 3/22 | 20 | 35–60 | Attack 3 → 5 | 47.5 |
| Peak Condor | common | 3/8 | 20 | 35–60 | Attack 3 → 5 | 48.1 |
| Fiddler Crab Swarm | common | 1/3 | 20.6 | 35–60 | Attack 1 → 2 | 54.4 |
| Nest | common | 0/18 | 20.6 | 35–60 | Health 18 → 22 | 31.3 |
| Shrine Bell-Ringer | common | 2/12 | 20.6 | 35–60 | Attack 2 → 3 | 36.3 |
| Camouflage Frog | common | 2/9 | 21.3 | 35–60 | Attack 2 → 3 | 45 |
| Feral Tomcat | common | 3/3 | 73.1 | 35–60 | Health 3 → 2 | 50.6 |
| Bramble Sprout | common | 1/6 | 22.5 | 35–60 | Health 6 → 10 | 36.3 |
| Puddle Hopper | common | 1/6 | 22.5 | 35–60 | Health 6 → 10 | 36.3 |
| Glowworm Cluster | common | 2/5 | 23.1 | 35–60 | Health 5 → 7 | 46.9 |
| Shepherd's Bark | common | 4/16 | 70.6 | 35–60 | Health 16 → 12 | 53.1 |
| Mouse Sapper | common | 3/9 | 25.6 | 35–60 | Attack 3 → 4 | 48.8 |
| Meadow Frog | common | 2/3 | 26.9 | 35–60 | Attack 2 → 3 | 50 |
| Compost Grub | common | 1/8 | 27.5 | 35–60 | Health 8 → 10 | 36.3 |
| Hedgehog Scout | common | 1/4 | 27.5 | 35–60 | Health 4 → 6 | 41.9 |
| Slowpoke Sentinel | common | 1/16 | 67.5 | 35–60 | Health 16 → 8 | 56.3 |
| Stalactite Golem | common | 6/26 | 27.5 | 35–60 | Attack 6 → 9 | 31.3 |
| Quarry Mole | common | 2/10 | 66.3 | 35–60 | Health 10 → 8 | 50 |
| Old-Growth Tortoise | common | 2/20 | 29.4 | 35–60 | Attack 2 → 4 | 40.6 |
| Honey Badger Fury | common | 3/10 | 65.6 | 35–60 | Attack 3 → 2 | 57.5 |
| Owl Nightwatch | common | 4/10 | 30.6 | 35–60 | Health 10 → 13 | 43.8 |
| Rabbit Kit | common | 2/2 | 30.6 | 35–60 | Attack 2 → 3 | 50.6 |
| Pinecone Sapper | common | 0/6 | 31.3 | 35–60 | Attack 0 → 1 | 50 |
| Chipmunk Hoarder | common | 1/5 | 31.9 | 35–60 | Attack 1 → 2 | 43.1 |
| Sea Turtle Elder | common | 2/30 | 31.9 | 35–60 | Attack 2 → 3 | 35 |
| Nightshade Moth | common | 2/7 | 33.1 | 35–60 | Attack 2 → 4 | 40 |
| Poison Dart Frog | common | 1/5 | 33.1 | 35–60 | Health 5 → 6 | 38.8 |
| Rootworm Colony | common | 3/14 | 61.9 | 35–60 | Attack 3 → 2 | 52.5 |
| Tide Pool Crab | common | 1/5 | 33.1 | 35–60 | Health 5 → 7 | 44.4 |
| Duckling Squadron | common | 1/3 | 61.3 | 35–60 | Health 3 → 2 | 41.3 |
| Gull Thief | common | 1/3 | 33.8 | 35–60 | Health 3 → 4 | 45 |
| Toucan Courier | common | 1/4 | 33.8 | 35–60 | Health 4 → 5 | 36.9 |
| Turtle Bastion | common | 3/36 | 33.8 | 35–60 | Attack 3 → 4 | 36.9 |
| Beetle Grunt | common | 2/6 | 34.4 | 35–60 | Health 6 → 7 | 49.4 |
| Raccoon Nightcrew | common | 7/12 | 34.4 | 35–60 | Health 12 → 13 | 48.1 |
| Black Dragon | legendary | 10/50 | 38.1 | 70–97 | Attack 10 → 11 | 38.1 |
| Blue Dragon | legendary | 10/44 | 38.1 | 70–97 | Attack 10 → 11 | 38.1 |
| Green Dragon | legendary | 10/50 | 38.1 | 70–97 | Attack 10 → 11 | 38.1 |
| Red Dragon | legendary | 10/44 | 38.1 | 70–97 | Attack 10 → 11 | 38.1 |
| White Dragon | legendary | 10/44 | 38.1 | 70–97 | Attack 10 → 11 | 38.1 |
| Wandering Traveller | rare | 6/7 | 100 | 52–75 | Health 7 → 3 | 70.6 |
| Carrion Fly Swarm | rare | 3/5 | 98.1 | 52–75 | Attack 3 → 1 | 65 |
| Owl Fletcher | rare | 4/4 | 97.5 | 52–75 | Attack 4 → 1 | 73.1 |
| Tusked Vanguard | rare | 3/7 | 96.9 | 52–75 | Health 7 → 4 | 61.9 |
| Cave Bat Swarm | rare | 2/3 | 96.3 | 52–75 | Attack 2 → 1 | 61.3 |
| Colony | rare | 0/20 | 94.4 | 52–75 | Health 20 → 12 | 85.6 |
| Pike Lancer | rare | 4/7 | 93.8 | 52–75 | Health 7 → 6 | 74.4 |
| Ent | rare | 3/20 | 93.1 | 52–75 | Health 20 → 14 | 73.8 |
| Trapdoor Spider | rare | 4/6 | 90.6 | 52–75 | Attack 4 → 2 | 63.1 |
| Voltaic Eel | rare | 3/10 | 36.9 | 52–75 | Attack 3 → 4 | 36.9 |
| Cave Flitter | rare | 3/3 | 90 | 52–75 | Attack 3 → 2 | 56.3 |
| Lucky Hopper | rare | 4/11 | 90 | 52–75 | Attack 4 → 2 | 63.1 |
| Raven Scout | rare | 2/3 | 90 | 52–75 | Health 3 → 2 | 65 |
| Grass Viper | rare | 2/5 | 89.4 | 52–75 | Health 5 → 4 | 70 |
| Ember Jackal | rare | 3/8 | 88.8 | 52–75 | Health 8 → 4 | 63.1 |
| Otter Centurion | rare | 3/9 | 88.8 | 52–75 | Attack 3 → 2 | 61.3 |
| Thornvine Lasher | rare | 3/9 | 88.8 | 52–75 | Attack 3 → 2 | 61.3 |
| Boar Rampager | rare | 6/18 | 88.1 | 52–75 | Attack 6 → 3 | 71.9 |
| Eagle Diver | rare | 6/9 | 88.1 | 52–75 | Attack 6 → 3 | 66.9 |
| Golden Eagle Diver | rare | 4/6 | 88.1 | 52–75 | Attack 4 → 3 | 73.1 |
| Mallard Marauder | rare | 4/10 | 88.1 | 52–75 | Attack 4 → 2 | 54.4 |
| Ravenous Wolverine | rare | 2/12 | 88.1 | 52–75 | Health 12 → 8 | 76.3 |
| Savanna Cheetah | rare | 5/7 | 88.1 | 52–75 | Health 7 → 3 | 80.6 |
| Dust Hyena | rare | 2/8 | 87.5 | 52–75 | Health 8 → 6 | 65.6 |
| Pond Paddler | rare | 2/5 | 86.3 | 52–75 | Health 5 → 4 | 68.1 |
| Firetail Trickster | rare | 5/9 | 85.6 | 52–75 | Health 9 → 5 | 71.9 |
| Beetle Battering-Ram | rare | 5/20 | 85 | 52–75 | Attack 5 → 3 | 75 |
| Rockslide Ram | rare | 5/12 | 84.4 | 52–75 | Attack 5 → 2 | 68.1 |
| Stable Colt | rare | 2/9 | 84.4 | 52–75 | Health 9 → 6 | 60 |
| Quill Volley | rare | 4/14 | 83.8 | 52–75 | Attack 4 → 3 | 69.4 |
| Taiga Lynx | rare | 4/8 | 83.1 | 52–75 | Attack 4 → 3 | 58.8 |
| Shimmerwing Stag | rare | 6/18 | 44.4 | 52–75 | Attack 6 → 8 | 52.5 |
| Badger Berserker | rare | 6/14 | 81.3 | 52–75 | Attack 6 → 4 | 63.1 |
| Jaguar Stalker | rare | 6/11 | 81.3 | 52–75 | Attack 6 → 4 | 66.3 |
| Woodland Brawler | rare | 5/16 | 81.3 | 52–75 | Attack 5 → 4 | 69.4 |
| River Warden | rare | 5/15 | 46.3 | 52–75 | Attack 5 → 8 | 55.6 |
| Echo Screecher | rare | 4/8 | 80.6 | 52–75 | Attack 4 → 3 | 70 |
| Monarch Wingblade | rare | 5/9 | 80.6 | 52–75 | Attack 5 → 3 | 69.4 |
| Octopus Tactician | rare | 6/22 | 46.9 | 52–75 | Attack 6 → 8 | 53.1 |
| Bog Leech | rare | 1/5 | 79.4 | 52–75 | Health 5 → 4 | 73.1 |
| Ember Wisp | rare | 3/3 | 79.4 | 52–75 | Health 3 → 2 | 61.9 |
| Arctic Fox Raider | rare | 4/6 | 78.8 | 52–75 | Health 6 → 5 | 74.4 |
| Ice-Crevasse Wolf | rare | 4/10 | 78.8 | 52–75 | Attack 4 → 3 | 70 |
| Bee Drone | rare | 1/6 | 76.9 | 52–75 | Health 6 → 5 | 67.5 |
| Fox Kit | rare | 3/5 | 76.9 | 52–75 | Health 5 → 4 | 61.9 |
| Quill-Thorn Boar | rare | 3/16 | 76.9 | 52–75 | Attack 3 → 2 | 68.8 |
| Raccoon Bandit | rare | 3/6 | 76.9 | 52–75 | Health 6 → 5 | 60.6 |
| Squire's Mount | rare | 5/14 | 76.9 | 52–75 | Attack 5 → 4 | 63.1 |
| Bear Cub | rare | 2/8 | 76.3 | 52–75 | Health 8 → 6 | 60 |
| Swarm Matriarch | rare | 2/15 | 75.6 | 52–75 | Attack 2 → 1 | 73.8 |
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
| Soldier Ant | uncommon | 3/8 | 81.9 | 45–68 | Health 8 → 6 | 55.6 |
| Riptide Eel | uncommon | 7/8 | 33.8 | 45–68 | Attack 7 → 8 | 46.3 |
| Tiny Cave Dweller | uncommon | 1/4 | 36.9 | 45–68 | Health 4 → 5 | 56.3 |

## Suggested rarities for cards with none

By measured strength, the nearest rarity band: .
The per-card list is in the hub's ⚖️ Balance tab (filter "No rarity").
Many free cards land on Legendary: either they become rarer, or they get weaker and keep a low rarity.

