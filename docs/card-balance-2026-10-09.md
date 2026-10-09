# Card balance report (2026-10-09)

**How it's measured.** Every fieldable card (293) plays 60 matches with the game's own AI (open fights).
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
   | 0 | 117 | 46.7 |
   | 1 | 85 | 70.8 |
   | 2 | 61 | 48.3 |
   | 3+ | 30 | 37.9 |

   1-cost cards are the sweet spot. Cards costing 3 or more lose to the reference deck: a match is usually over in ~17 rounds, and a 3–4 cost card with Wait 4–5 arrives too late to matter.
3. **The five Legendary dragons are among the weakest cards in the game** (about 38%), for the same reason.
   - I tested five fixes in simulation: start each match with 2 Lumber; +1 Lumber every 2 rounds; −1 cost and −1 Wait for every card costing 2+; +15% stats per Lumber of cost; and a start bonus plus stat buff together.
   - None made 3+ cost cards competitive.
   - This needs a design answer, not a number tweak: see decision B4.
4. **Rarity doesn't follow strength yet.** 0 of 293 cards have no rarity.
   - Some free cards win 95–100% (Carrion Fly Swarm, Cave Bat Swarm, Owl Fletcher, Trapdoor Spider, Tusked Vanguard).
   - Several Starters win 80–94% (Duck Paddler, Cobalt Talon Skirmisher, Crimson Wing Duelist Cadet, Otter Guard).
   - The tiny 1/2 Starters (Guppy, Earthworm, Silver Minnow, Worker Ant, Otter Kit) sit at 9–11%.
   - Giving every card a rarity from its measured strength would also fix the "enemy deck Lv 0" badge (decision B3).

| Rarity | Cards | Median win % |
|---|---|---|
| common | 156 | 42.1 |
| rare | 80 | 76.2 |
| starter | 36 | 42.9 |
| uncommon | 16 | 61.2 |
| legendary | 5 | 38.3 |

## Strongest cheap cards (cost 0–1)

| Card | Rarity | Cost / Wait | Stats | Skills | Win % | Suggested rarity |
|---|---|---|---|---|---|---|
| Owl Fletcher | rare | 0 / 1 | 4/4 | flying, arrow, nocturnal | 100 | – |
| Wandering Traveller | rare | 0 / 1 | 6/7 | triggers | 100 | – |
| Lucky Hopper | rare | 1 / 0 | 4/11 | onSpawnGold | 97.5 | – |
| Colony | rare | 0 / 0 | 0/20 | triggers | 95 | – |
| Duck Paddler | starter | 0 / 1 | 3/6 | flying | 95 | – |
| Cobalt Talon Skirmisher | starter | 0 / 1 | 3/6 | flying, diurnal | 95 | – |
| Tusked Vanguard | rare | 0 / 0 | 3/7 | – | 94.2 | – |
| Mallard Marauder | rare | 1 / 0 | 4/10 | flying, triggers | 93.3 | – |
| Ravenous Wolverine | rare | 1 / 0 | 2/12 | triggers | 93.3 | – |
| Ember Jackal | rare | 1 / 0 | 3/8 | frenzy | 93.3 | – |
| Carrion Fly Swarm | rare | 0 / 1 | 3/5 | poison, flying | 92.5 | – |
| Savanna Cheetah | rare | 1 / 0 | 5/7 | quick | 92.5 | – |
| Bee Drone | rare | 0 / 0 | 1/6 | flying, swarm, diurnal, triggers | 91.7 | – |
| Monarch Wingblade | rare | 1 / 1 | 5/9 | poison, bounty, flying | 91.7 | – |
| Beetle Battering-Ram | rare | 1 / 2 | 5/20 | sweep, bounty, nocturnal | 91.7 | – |
| Boar Rampager | rare | 1 / 2 | 6/18 | sweep, bounty | 91.7 | – |
| Pike Lancer | rare | 0 / 1 | 4/7 | – | 90.8 | – |
| Cave Bat Swarm | rare | 0 / 0 | 2/3 | swipe, flying, nocturnal | 90.8 | – |
| Eagle Diver | rare | 1 / 1 | 6/9 | bounty, flying, diurnal, triggers | 90 | – |
| Firetail Trickster | rare | 1 / 0 | 5/9 | bounty, triggers | 90 | – |

## Weakest cards

| Card | Rarity | Cost / Wait | Stats | Win % |
|---|---|---|---|---|
| Dam Wall | common | 1 / 2 | 0/20 | 7.5 |
| Silver Minnow | starter | 0 / 0 | 1/2 | 10 |
| Earthworm | starter | 0 / 0 | 1/2 | 10 |
| Guppy | starter | 0 / 0 | 1/2 | 10 |
| Otter Kit | starter | 0 / 0 | 1/3 | 12.5 |
| Chipmunk Forager | starter | 0 / 0 | 1/3 | 12.5 |
| Harvest Mouse | starter | 0 / 0 | 1/3 | 12.5 |
| Barnacle Fortress | common | 1 / 1 | 0/20 | 13.3 |
| Termite Mound | common | 1 / 1 | 0/22 | 14.2 |
| Meadow Rabbit | starter | 0 / 0 | 1/4 | 14.2 |
| Blessed Avatar | common | 0 / 2 | 6/20 | 15 |
| Trickster Fox | common | 1 / 0 | 2/7 | 15 |
| Worker Ant | starter | 0 / 0 | 1/3 | 15.8 |
| Chipmunk Hoarder | common | 0 / 1 | 1/5 | 17.5 |
| Peak Condor | common | 1 / 1 | 3/8 | 18.3 |
| Pill Bug | starter | 0 / 0 | 1/4 | 18.3 |
| Beaver Lumberjack | common | 0 / 1 | 1/4 | 19.2 |
| Glowworm Cluster | common | 0 / 1 | 2/5 | 20.8 |
| Camouflage Frog | common | 1 / 1 | 2/9 | 20.8 |
| Cobalt Talon Fledgling | starter | 0 / 0 | 1/2 | 20.8 |

## Suggested fixes for cards that have a rarity (0)

Each suggestion is the one stat change (Attack or Health, a few steps at most) that brought the card closest to its rarity's band in re-simulation.
The bands are a first guess, so read these as "which way and how far", not final numbers.
Starters in particular may be meant to be weak or strong; that is your call (decision B5).

| Card | Rarity | Now | Win % | Band | Change | Win % after |
|---|---|---|---|---|---|---|

## Suggested rarities for cards with none

By measured strength, the nearest rarity band: .
The per-card list is in the hub's ⚖️ Balance tab (filter "No rarity").
Many free cards land on Legendary: either they become rarer, or they get weaker and keep a low rarity.

