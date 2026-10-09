# Card balance report (2026-10-09)

**How it's measured.** Every fieldable card (295) plays 80 matches with the game's own AI (open fights).
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
   | 0 | 120 | 49.4 |
   | 1 | 84 | 69.7 |
   | 2 | 61 | 45 |
   | 3+ | 30 | 37.8 |

   1-cost cards are the sweet spot. Cards costing 3 or more lose to the reference deck: a match is usually over in ~17 rounds, and a 3–4 cost card with Wait 4–5 arrives too late to matter.
3. **The five Legendary dragons are among the weakest cards in the game** (about 38%), for the same reason.
   - I tested five fixes in simulation: start each match with 2 Lumber; +1 Lumber every 2 rounds; −1 cost and −1 Wait for every card costing 2+; +15% stats per Lumber of cost; and a start bonus plus stat buff together.
   - None made 3+ cost cards competitive.
   - This needs a design answer, not a number tweak: see decision B4.
4. **Rarity doesn't follow strength yet.** 0 of 295 cards have no rarity.
   - Some free cards win 95–100% (Carrion Fly Swarm, Cave Bat Swarm, Owl Fletcher, Trapdoor Spider, Tusked Vanguard).
   - Several Starters win 80–94% (Duck Paddler, Cobalt Talon Skirmisher, Crimson Wing Duelist Cadet, Otter Guard).
   - The tiny 1/2 Starters (Guppy, Earthworm, Silver Minnow, Worker Ant, Otter Kit) sit at 9–11%.
   - Giving every card a rarity from its measured strength would also fix the "enemy deck Lv 0" badge (decision B3).

| Rarity | Cards | Median win % |
|---|---|---|
| common | 154 | 39.4 |
| rare | 82 | 77.2 |
| starter | 36 | 45.0 |
| uncommon | 18 | 57.5 |
| legendary | 5 | 38.8 |

## Strongest cheap cards (cost 0–1)

| Card | Rarity | Cost / Wait | Stats | Skills | Win % | Suggested rarity |
|---|---|---|---|---|---|---|
| Owl Fletcher | rare | 0 / 1 | 4/4 | flying, arrow, nocturnal | 100 | – |
| Wandering Traveller | rare | 0 / 1 | 6/7 | triggers | 100 | – |
| Lucky Hopper | rare | 1 / 0 | 4/11 | onSpawnGold | 96.9 | – |
| Colony | rare | 0 / 0 | 0/20 | triggers | 95.6 | – |
| Cobalt Talon Skirmisher | starter | 0 / 1 | 3/6 | flying, diurnal | 95 | – |
| Ravenous Wolverine | rare | 1 / 0 | 2/12 | triggers | 95 | – |
| Tusked Vanguard | rare | 0 / 0 | 3/7 | – | 95 | – |
| Duck Paddler | starter | 0 / 1 | 3/6 | flying | 94.4 | – |
| Ember Jackal | rare | 1 / 0 | 3/8 | frenzy | 93.8 | – |
| Cave Bat Swarm | rare | 0 / 0 | 2/3 | swipe, flying, nocturnal | 93.1 | – |
| Savanna Cheetah | rare | 1 / 0 | 5/7 | quick | 93.1 | – |
| Carrion Fly Swarm | rare | 0 / 1 | 3/5 | poison, flying | 92.5 | – |
| Eagle Diver | rare | 1 / 1 | 6/9 | bounty, flying, diurnal, triggers | 92.5 | – |
| Firetail Trickster | rare | 1 / 0 | 5/9 | bounty, triggers | 92.5 | – |
| Beetle Battering-Ram | rare | 1 / 2 | 5/20 | sweep, bounty, nocturnal | 91.9 | – |
| Boar Rampager | rare | 1 / 2 | 6/18 | sweep, bounty | 91.9 | – |
| Mallard Marauder | rare | 1 / 0 | 4/10 | flying, triggers | 91.9 | – |
| Monarch Wingblade | rare | 1 / 1 | 5/9 | poison, bounty, flying | 91.9 | – |
| Pike Lancer | rare | 0 / 1 | 4/7 | – | 91.9 | – |
| Bee Drone | rare | 0 / 0 | 1/6 | flying, swarm, diurnal, triggers | 91.3 | – |

## Weakest cards

| Card | Rarity | Cost / Wait | Stats | Win % |
|---|---|---|---|---|
| Dam Wall | common | 1 / 2 | 0/20 | 6.9 |
| Earthworm | starter | 0 / 0 | 1/2 | 11.3 |
| Guppy | starter | 0 / 0 | 1/2 | 11.3 |
| Silver Minnow | starter | 0 / 0 | 1/2 | 11.3 |
| Barnacle Fortress | common | 1 / 1 | 0/20 | 13.1 |
| Trickster Fox | common | 1 / 0 | 2/7 | 13.1 |
| Blessed Avatar | common | 0 / 2 | 6/20 | 14.4 |
| Termite Mound | common | 1 / 1 | 0/22 | 14.4 |
| Chipmunk Forager | starter | 0 / 0 | 1/3 | 15 |
| Harvest Mouse | starter | 0 / 0 | 1/3 | 15 |
| Otter Kit | starter | 0 / 0 | 1/3 | 15 |
| Chipmunk Hoarder | common | 0 / 1 | 1/5 | 17.5 |
| Meadow Rabbit | starter | 0 / 0 | 1/4 | 18.1 |
| Moray Ambusher | common | 1 / 2 | 6/11 | 18.1 |
| Worker Ant | starter | 0 / 0 | 1/3 | 18.8 |
| Beaver Lumberjack | common | 0 / 1 | 1/4 | 20 |
| Marsh Gas Toad | common | 1 / 1 | 0/10 | 20 |
| Stalactite Golem | common | 2 / 3 | 6/26 | 20.6 |
| Peak Condor | common | 1 / 1 | 3/8 | 21.3 |
| Cobalt Talon Fledgling | starter | 0 / 0 | 1/2 | 22.5 |

## Suggested fixes for cards that have a rarity (145)

Each suggestion is the one stat change (Attack or Health, a few steps at most) that brought the card closest to its rarity's band in re-simulation.
The bands are a first guess, so read these as "which way and how far", not final numbers.
Starters in particular may be meant to be weak or strong; that is your call (decision B5).

| Card | Rarity | Now | Win % | Band | Change | Win % after |
|---|---|---|---|---|---|---|
| Dune Jackal | common | 4/10 | 90.6 | 35–60 | Attack 4 → 3 | 62.5 |
| Dam Wall | common | 0/20 | 6.9 | 35–60 | Attack 0 → 3 | 42.5 |
| Porcupine Roller | common | 1/10 | 86.3 | 35–60 | Attack 1 → 0 | 51.3 |
| Jackrabbit Sprinter | common | 4/8 | 85.6 | 35–60 | Attack 4 → 3 | 55.6 |
| Barnacle Fortress | common | 0/20 | 13.1 | 35–60 | Attack 0 → 2 | 56.3 |
| Trickster Fox | common | 2/7 | 13.1 | 35–60 | Attack 2 → 3 | 31.3 |
| Blessed Avatar | common | 6/20 | 14.4 | 35–60 | Attack 6 → 7 | 14.4 |
| Termite Mound | common | 0/22 | 14.4 | 35–60 | Attack 0 → 2 | 56.3 |
| Chipmunk Hoarder | common | 1/5 | 17.5 | 35–60 | Attack 1 → 3 | 45 |
| Shepherd's Bark | common | 4/16 | 76.9 | 35–60 | Attack 4 → 2 | 47.5 |
| Moray Ambusher | common | 6/11 | 18.1 | 35–60 | Attack 6 → 9 | 37.5 |
| Frost Hare Sprinter | common | 2/5 | 76.3 | 35–60 | Health 5 → 3 | 47.5 |
| Beaver Lumberjack | common | 1/4 | 20 | 35–60 | Attack 1 → 3 | 40.6 |
| Honey Badger Fury | common | 3/10 | 75 | 35–60 | Attack 3 → 2 | 53.1 |
| Marsh Gas Toad | common | 0/10 | 20 | 35–60 | Attack 0 → 2 | 37.5 |
| Stalactite Golem | common | 6/26 | 20.6 | 35–60 | Attack 6 → 10 | 26.9 |
| Peak Condor | common | 3/8 | 21.3 | 35–60 | Attack 3 → 5 | 48.1 |
| Fiddler Crab Swarm | common | 1/3 | 23.1 | 35–60 | Attack 1 → 2 | 45 |
| Glowworm Cluster | common | 2/5 | 23.8 | 35–60 | Health 5 → 7 | 52.5 |
| Old-Growth Tortoise | common | 2/20 | 23.8 | 35–60 | Attack 2 → 5 | 36.9 |
| Bramble Sprout | common | 1/6 | 24.4 | 35–60 | Attack 1 → 2 | 57.5 |
| Nest | common | 0/18 | 24.4 | 35–60 | Health 18 → 26 | 33.8 |
| Puddle Hopper | common | 1/6 | 24.4 | 35–60 | Attack 1 → 2 | 57.5 |
| Shrine Bell-Ringer | common | 2/12 | 24.4 | 35–60 | Attack 2 → 3 | 40 |
| Camouflage Frog | common | 2/9 | 25 | 35–60 | Attack 2 → 3 | 48.1 |
| Field Mouse | common | 1/5 | 25 | 35–60 | Attack 1 → 2 | 51.3 |
| Gull Thief | common | 1/3 | 25 | 35–60 | Attack 1 → 2 | 55 |
| Mouse Sapper | common | 3/9 | 25.6 | 35–60 | Attack 3 → 4 | 44.4 |
| Toucan Courier | common | 1/4 | 25.6 | 35–60 | Attack 1 → 2 | 54.4 |
| Turtle Bastion | common | 3/36 | 26.3 | 35–60 | Attack 3 → 7 | 39.4 |
| Coral Polyp Colony | common | 0/14 | 26.9 | 35–60 | Attack 0 → 1 | 48.1 |
| Meadow Frog | common | 2/3 | 26.9 | 35–60 | Attack 2 → 3 | 45 |
| Slowpoke Sentinel | common | 1/16 | 68.1 | 35–60 | Health 16 → 8 | 60 |
| Hanging Loafer | common | 3/22 | 27.5 | 35–60 | Attack 3 → 4 | 40 |
| Sea Turtle Elder | common | 2/30 | 28.1 | 35–60 | Attack 2 → 4 | 37.5 |
| Beetle Grunt | common | 2/6 | 28.8 | 35–60 | Attack 2 → 3 | 45 |
| Compost Grub | common | 1/8 | 28.8 | 35–60 | Health 8 → 11 | 38.1 |
| Hedgehog Scout | common | 1/4 | 28.8 | 35–60 | Attack 1 → 2 | 53.8 |
| War-Drum Mandrill | common | 3/16 | 28.8 | 35–60 | Attack 3 → 4 | 37.5 |
| Rabbit Kit | common | 2/2 | 29.4 | 35–60 | Attack 2 → 3 | 50.6 |
| Bonebreaker | common | 6/10 | 30 | 35–60 | Attack 6 → 8 | 35.6 |
| Chipmunk Stockpiler | common | 1/6 | 30 | 35–60 | Health 6 → 8 | 38.1 |
| Nightshade Moth | common | 2/7 | 30 | 35–60 | Attack 2 → 4 | 39.4 |
| Poison Dart Frog | common | 1/5 | 30.6 | 35–60 | Health 5 → 7 | 42.5 |
| Tide Pool Crab | common | 1/5 | 30.6 | 35–60 | Health 5 → 7 | 41.9 |
| Armored Mastiff | common | 6/28 | 31.3 | 35–60 | Attack 6 → 7 | 36.9 |
| Pinecone Sapper | common | 0/6 | 31.3 | 35–60 | Attack 0 → 1 | 48.8 |
| Rot-Swollen Carcass | common | 3/20 | 31.3 | 35–60 | Attack 3 → 7 | 35 |
| Elder Tortoise | common | 1/18 | 31.9 | 35–60 | Attack 1 → 5 | 34.4 |
| Migration Leader | common | 3/12 | 63.1 | 35–60 | Attack 3 → 2 | 36.9 |
| Timber Wolf Pack Leader | common | 4/14 | 31.9 | 35–60 | Attack 4 → 5 | 38.8 |
| Courier Pigeon | common | 1/2 | 32.5 | 35–60 | Health 2 → 4 | 47.5 |
| Ancient Sloth Titan | common | 6/58 | 33.1 | 35–60 | Attack 6 → 8 | 34.4 |
| Quarry Mole | common | 2/10 | 61.9 | 35–60 | Health 10 → 9 | 52.5 |
| Vampire Roost | common | 5/18 | 33.8 | 35–60 | Attack 5 → 6 | 35.6 |
| Glacier Yak | common | 4/16 | 34.4 | 35–60 | Attack 4 → 5 | 35.6 |
| Rootworm Colony | common | 3/14 | 60.6 | 35–60 | Attack 3 → 2 | 48.1 |
| Black Dragon | legendary | 10/50 | 38.8 | 70–97 | Attack 10 → 11 | 38.8 |
| Blue Dragon | legendary | 10/44 | 38.8 | 70–97 | Attack 10 → 11 | 38.8 |
| Green Dragon | legendary | 10/50 | 38.8 | 70–97 | Attack 10 → 11 | 38.8 |
| Red Dragon | legendary | 10/44 | 38.8 | 70–97 | Attack 10 → 11 | 38.8 |
| White Dragon | legendary | 10/44 | 38.8 | 70–97 | Attack 10 → 11 | 38.8 |
| Owl Fletcher | rare | 4/4 | 100 | 52–75 | Health 4 → 2 | 76.3 |
| Wandering Traveller | rare | 6/7 | 100 | 52–75 | Attack 6 → 2 | 63.1 |
| Lucky Hopper | rare | 4/11 | 96.9 | 52–75 | Attack 4 → 2 | 64.4 |
| Colony | rare | 0/20 | 95.6 | 52–75 | Health 20 → 12 | 80.6 |
| Ravenous Wolverine | rare | 2/12 | 95 | 52–75 | Health 12 → 8 | 87.5 |
| Tusked Vanguard | rare | 3/7 | 95 | 52–75 | Attack 3 → 2 | 67.5 |
| Ember Jackal | rare | 3/8 | 93.8 | 52–75 | Attack 3 → 2 | 75 |
| Cave Bat Swarm | rare | 2/3 | 93.1 | 52–75 | Attack 2 → 1 | 71.3 |
| Savanna Cheetah | rare | 5/7 | 93.1 | 52–75 | Attack 5 → 3 | 48.1 |
| Voltaic Eel | rare | 3/10 | 34.4 | 52–75 | Attack 3 → 7 | 38.1 |
| Carrion Fly Swarm | rare | 3/5 | 92.5 | 52–75 | Attack 3 → 1 | 63.8 |
| Eagle Diver | rare | 6/9 | 92.5 | 52–75 | Attack 6 → 2 | 60 |
| Firetail Trickster | rare | 5/9 | 92.5 | 52–75 | Attack 5 → 3 | 55 |
| Beetle Battering-Ram | rare | 5/20 | 91.9 | 52–75 | Attack 5 → 2 | 67.5 |
| Boar Rampager | rare | 6/18 | 91.9 | 52–75 | Health 18 → 10 | 71.9 |
| Mallard Marauder | rare | 4/10 | 91.9 | 52–75 | Attack 4 → 2 | 60 |
| Monarch Wingblade | rare | 5/9 | 91.9 | 52–75 | Attack 5 → 3 | 71.3 |
| Pike Lancer | rare | 4/7 | 91.9 | 52–75 | Attack 4 → 3 | 71.3 |
| Bee Drone | rare | 1/6 | 91.3 | 52–75 | Health 6 → 4 | 69.4 |
| Quill Volley | rare | 4/14 | 90.6 | 52–75 | Health 14 → 6 | 66.3 |
| Cave Flitter | rare | 3/3 | 89.4 | 52–75 | Attack 3 → 2 | 69.4 |
| Golden Eagle Diver | rare | 4/6 | 88.8 | 52–75 | Attack 4 → 2 | 66.3 |
| Trapdoor Spider | rare | 4/6 | 88.1 | 52–75 | Attack 4 → 3 | 73.1 |
| River Warden | rare | 5/15 | 40 | 52–75 | Attack 5 → 8 | 58.1 |
| Rockslide Ram | rare | 5/12 | 86.3 | 52–75 | Attack 5 → 3 | 73.1 |
| Barrow Leech | rare | 3/9 | 85.6 | 52–75 | Health 9 → 5 | 65.6 |
| Ent | rare | 3/20 | 85 | 52–75 | Attack 3 → 2 | 61.9 |
| Swarm Matriarch | rare | 2/15 | 85 | 52–75 | Attack 2 → 0 | 67.5 |
| Taiga Lynx | rare | 4/8 | 85 | 52–75 | Attack 4 → 3 | 70 |
| Mountain Goat Climber | rare | 1/7 | 42.5 | 52–75 | Health 7 → 10 | 58.1 |
| Jaguar Stalker | rare | 6/11 | 84.4 | 52–75 | Attack 6 → 4 | 71.9 |
| Badger Berserker | rare | 6/14 | 83.8 | 52–75 | Attack 6 → 4 | 63.8 |
| Ice-Crevasse Wolf | rare | 4/10 | 83.8 | 52–75 | Health 10 → 6 | 56.9 |
| Dust Hyena | rare | 2/8 | 83.1 | 52–75 | Health 8 → 6 | 58.8 |
| Echo Screecher | rare | 4/8 | 83.1 | 52–75 | Health 8 → 5 | 73.8 |
| Shimmerwing Stag | rare | 6/18 | 44.4 | 52–75 | Attack 6 → 8 | 55 |
| Coral Current Eel | rare | 4/7 | 81.9 | 52–75 | Attack 4 → 3 | 59.4 |
| Woodland Brawler | rare | 5/16 | 81.9 | 52–75 | Attack 5 → 4 | 70 |
| Otter Centurion | rare | 3/9 | 80.6 | 52–75 | Health 9 → 7 | 71.3 |
| Quill-Thorn Boar | rare | 3/16 | 80.6 | 52–75 | Attack 3 → 2 | 71.9 |
| Thornvine Lasher | rare | 3/9 | 80.6 | 52–75 | Health 9 → 7 | 71.3 |
| Arctic Fox Raider | rare | 4/6 | 80 | 52–75 | Attack 4 → 3 | 55 |
| Squire's Mount | rare | 5/14 | 80 | 52–75 | Attack 5 → 4 | 63.8 |
| Blizzard | rare | 0/1 | 48.8 | 52–75 | Attack 0 → 1 | 48.8 |
| Grass Viper | rare | 2/5 | 77.5 | 52–75 | Health 5 → 4 | 70.6 |
| Bramblewood Lynx | rare | 6/10 | 76.9 | 52–75 | Health 10 → 9 | 71.9 |
| Obsidian Scorpion | rare | 4/11 | 76.9 | 52–75 | Attack 4 → 3 | 67.5 |
| Plains Zebra | rare | 1/9 | 50.6 | 52–75 | Health 9 → 10 | 58.1 |
| Feral Tuskboar | rare | 3/14 | 76.3 | 52–75 | Attack 3 → 2 | 61.9 |
| Magma Salamander | rare | 4/10 | 76.3 | 52–75 | Attack 4 → 3 | 67.5 |
| Mangrove Kingfisher | rare | 3/6 | 76.3 | 52–75 | Attack 3 → 2 | 56.3 |
| Pond Paddler | rare | 2/5 | 76.3 | 52–75 | Health 5 → 4 | 73.1 |
| Snow Owl Sentinel | rare | 3/10 | 76.3 | 52–75 | Attack 3 → 2 | 59.4 |
| Otter Scout | rare | 2/5 | 51.3 | 52–75 | Health 5 → 6 | 66.3 |
| Bog Leech | rare | 1/5 | 75.6 | 52–75 | Health 5 → 4 | 68.1 |
| Ember Wisp | rare | 3/3 | 75.6 | 52–75 | Health 3 → 2 | 53.8 |
| Cobalt Talon Skirmisher | starter | 3/6 | 95 | 20–48 | Attack 3 → 1 | 43.8 |
| Duck Paddler | starter | 3/6 | 94.4 | 20–48 | Health 6 → 2 | 36.3 |
| Crimson Wing Duelist Cadet | starter | 3/5 | 89.4 | 20–48 | Attack 3 → 1 | 37.5 |
| Violet Vane Fletcher | starter | 2/4 | 84.4 | 20–48 | Attack 2 → 1 | 42.5 |
| Dominion Nestguard | starter | 4/9 | 78.8 | 20–48 | Attack 4 → 2 | 22.5 |
| Otter Guard | starter | 3/8 | 76.9 | 20–48 | Health 8 → 6 | 45 |
| Pond Duck | starter | 2/5 | 76.3 | 20–48 | Attack 2 → 1 | 34.4 |
| Bee Sentry | starter | 2/5 | 73.8 | 20–48 | Attack 2 → 1 | 36.3 |
| Burrow Rabbit | starter | 3/7 | 71.3 | 20–48 | Attack 3 → 2 | 43.8 |
| River Carp | starter | 3/7 | 71.3 | 20–48 | Attack 3 → 2 | 43.8 |
| Voidfeather Scout | starter | 3/4 | 71.3 | 20–48 | Health 4 → 2 | 36.3 |
| Crimson Wing Recruit | starter | 2/3 | 68.1 | 20–48 | Attack 2 → 1 | 32.5 |
| Sunthroat Courier | starter | 2/5 | 68.1 | 20–48 | Attack 2 → 1 | 37.5 |
| Earthworm | starter | 1/2 | 11.3 | 20–48 | Attack 1 → 3 | 30 |
| Guppy | starter | 1/2 | 11.3 | 20–48 | Attack 1 → 3 | 31.3 |
| Silver Minnow | starter | 1/2 | 11.3 | 20–48 | Attack 1 → 3 | 31.3 |
| Chipmunk Forager | starter | 1/3 | 15 | 20–48 | Attack 1 → 2 | 26.9 |
| Harvest Mouse | starter | 1/3 | 15 | 20–48 | Attack 1 → 2 | 26.9 |
| Otter Kit | starter | 1/3 | 15 | 20–48 | Attack 1 → 2 | 26.9 |
| Meadow Rabbit | starter | 1/4 | 18.1 | 20–48 | Attack 1 → 2 | 38.1 |
| Worker Ant | starter | 1/3 | 18.8 | 20–48 | Attack 1 → 2 | 36.3 |
| Ant Scout | starter | 3/6 | 48.8 | 20–48 | Health 6 → 5 | 33.8 |
| Soldier Ant | uncommon | 3/8 | 80 | 45–68 | Health 8 → 6 | 48.8 |
| Tiny Cave Dweller | uncommon | 1/4 | 34.4 | 45–68 | Health 4 → 5 | 53.8 |
| Riptide Eel | uncommon | 7/8 | 36.3 | 45–68 | Attack 7 → 8 | 56.3 |
| Bee Knight | uncommon | 2/3 | 69.4 | 45–68 | Health 3 → 2 | 51.3 |
| Thick Fog | uncommon | 0/1 | 44.4 | 45–68 | Attack 0 → 1 | 44.4 |

## Suggested rarities for cards with none

By measured strength, the nearest rarity band: .
The per-card list is in the hub's ⚖️ Balance tab (filter "No rarity").
Many free cards land on Legendary: either they become rarer, or they get weaker and keep a low rarity.

