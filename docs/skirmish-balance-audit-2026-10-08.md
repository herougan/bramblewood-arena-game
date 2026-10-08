# Skirmish balance audit (2026-10-08)

Owner request: "Audit the balancing of the Skirmishes now."

This checks every Conquest node (84 fights, Maps 1 to 11) in **Open** mode with the new castle rules: castle Health from the chosen castle, the rest as **Skirmish Armour**. Nothing in the game was changed. All numbers are AI-vs-AI simulations, so read them for the **shape** of the curve, not exact human odds.

## Summary

**Biggest problems**
1. **The curve zig-zags on every map.** 15 nodes are walls (under 35% for the expected deck) and 19 are trivial (over 95%). Most maps put a free win right after a wall.
2. **Armour stops mattering once the enemy runs out of cards.** Enemy decks hold only 8 to 12 cards, against your 20. From round 20, Sudden Death makes any castle hit end the fight. So on nodes like 7-5, 8-2, 9-7, 10-9 and 11-7, even 300+ total HP leaves the player winning 90% or more. Those nodes need a deck change, not more Armour.
3. **Big walls:** Map 2's two elites and its boss (18 to 27%), the Frost Yeti King (2%), Echo Chamber 4-4 (28%), The Roost Above 4-7 (21%), the start of Map 9 (23 to 36%), and the final boss (5%).
4. **Free wins in boss and elite slots:** Porcupine Bastion 3-3 (97%), Pyroclast Wyrm 9-7 (100%), Phoenix Ember King 9-8 (95%), Condor Sovereign 10-9 (99%), Ancient Sloth Titan 11-7 (99%).
5. **Enemy deck level reads 0 on every node.** Almost no enemy card has a rarity above Common, so the new formula gives Lv 0 everywhere. It can't tell players which fight is harder.

**Fixes (all simulated, see "Proposed tweaks")**
- Change castle HP or Armour on 72 nodes, and swap decks on 33. 4 nodes stay as they are. After the changes, each map runs about 90% → 70% across its skirmishes, about 60% → 52% across its elites, and about 47% for its boss. The final boss lands near 40%.
- Where Armour can't bite, use a stronger deck from the same map instead (examples: 9-7 and 9-8 use the Basalt Vanguard core plus one signature card).
- Give enemy cards rarities, or show a different difficulty number (see "Other findings").

## How the numbers were made

- **Base tool:** `tools/difficulty_curve.js 100 <faction> open` was re-run as asked. Its starter-only numbers match the 2026-10-03 and 2026-10-08 reports.
- **Extended copy:** to model a real player, an extended copy of the tool was used (scratch script, not in the repo). It:
  - **Splits the enemy castle the same way `skirmishCastle()` does:** Health up to the castle's own value (30, or 20 for Plains Terrace and Collapsed Mine), and the rest as Armour. Armour soaks damage first (engine `damageHQ`). A check on 1-4 Frost Vanguard (20 HP castle + 10 Armour) gave exactly the same result as the old 30 HP castle. **Totals are unchanged, so the old tool still measures the same thing.** Only the HP readout differs.
  - **Plays enemy behaviour like the real game.** Bosses never surrender and fall back on 1/1 Frog and Fly Imps. Other enemies surrender when spent 70% of the time, offer a draw 20% of the time (we assume you keep fighting), or keep going 10% of the time. **The old tool instead gives every enemy endless 4/4 flying Bee Tanks once its deck runs out.** That makes late-map nodes look much harder than they are. For example, The Roost Above 4-7 is 1% with Bee Tanks but 21% with real behaviour.
  - **Applies Sudden Death (round 20) and the stall draw** as the game does.
- **Player decks (Otters, castle 30 HP, all cards at level 0):**
  - **Starter only:** the 20 Otter Basics you get after the tutorial. This is the floor: a player who never edits their deck.
  - **Expected deck:** the starter deck plus everything earned so far, slotted in 2 copies at a time over the weakest cards. "Everything earned" means the tutorial rewards (River Warden, Quarry Mole) and every earlier node's reward card. From Map 5 on, it also includes the Pack 1 pool: Maps 1 to 4 pay about 1,700 gold on first clears, which buys about 34 Sprout Pouches (102 cards from a 33-card pool). Maps 5 to 11 give no reward cards. This is "expected power" in the tables.
- **Forge levels are left out.** Their effect is tiny: +6% stats at level 5, +15% at level 10.
- **Games:** 200 seeded games per node, so expect about ±7 points of noise. Hummingbird starter decks win 5 to 30 points more than Otters on Maps 1 to 4 (old tool).
- **Energy** is from `ENERGY_COST`: skirmish 1, elite 2, boss 3, raid boss 4, final boss 5. Raid nodes on maps still use Sudden Death in Conquest.

**Flags used below:** **wall** = under 35%. **trivial** = over 95%. **dip** = at least 10 points easier than the node before it in list order. Some branch nodes (4-5/4-6, 7-6/7-7, 10-5/10-6/10-7) are alternatives, so a dip there can be fine.

## Current state, per map

"Starter only" and "Expected deck" are win rates. "Rounds" and "Your HP left" are for the expected deck (your castle out of 30, on wins). Enemy Lv uses the new `deckLevelFrom` formula.

### M1 Bramblewood Outskirts

| Node | Kind | Energy | Castle + Armour now | Enemy Lv | Cards | Starter only | Expected deck | Rounds | Your HP left | Flag |
|---|---|---:|---|---:|---:|---:|---:|---:|---:|---|
| 1-1 Otter Patrol | skirmish | 1 | 16 | 0 | 12 | 99% | **100%** | 7.1 | 25 | trivial |
| 1-2 Scorpion Ambush | skirmish | 1 | 20 | 0 | 11 | 93% | **100%** | 7.0 | 25 | trivial |
| 1-3 Raccoon Heist | skirmish | 1 | 20 | 0 | 11 | 54% | **93%** | 7.7 | 18 |  |
| 1-4 Frost Vanguard | boss | 3 | 20 + 10 | 0 | 9 | 18% | **67%** | 10.0 | 14 |  |

### M2 Sunken Hollow

| Node | Kind | Energy | Castle + Armour now | Enemy Lv | Cards | Starter only | Expected deck | Rounds | Your HP left | Flag |
|---|---|---:|---|---:|---:|---:|---:|---:|---:|---|
| 2-1 Reef Skirmishers | skirmish | 1 | 26 | 0 | 11 | 43% | **87%** | 9.2 | 16 |  |
| 2-2 Tidal Ring | skirmish | 1 | 28 | 0 | 10 | 34% | **92%** | 9.8 | 15 |  |
| 2-3 Cetacean Pod | elite | 2 | 30 + 4 | 0 | 11 | 2% | **23%** | 9.5 | 10 | wall |
| 2-4 The Kraken's Maw | elite | 2 | 30 + 8 | 0 | 11 | 1% | **27%** | 9.8 | 9 | wall |
| 2-5 The Drowned Colossus | boss | 3 | 30 + 10 | 0 | 10 | 2% | **18%** | 9.3 | 7 | wall |

### M3 The Ashen Peak

| Node | Kind | Energy | Castle + Armour now | Enemy Lv | Cards | Starter only | Expected deck | Rounds | Your HP left | Flag |
|---|---|---:|---|---:|---:|---:|---:|---:|---:|---|
| 3-1 Badger Warband | skirmish | 1 | 16 | 0 | 10 | 81% | **86%** | 6.7 | 25 |  |
| 3-2 Quill Line | skirmish | 1 | 16 | 0 | 10 | 65% | **69%** | 7.1 | 23 |  |
| 3-3 Porcupine Bastion | elite | 2 | 20 + 20 | 0 | 10 | 57% | **97%** | 10.8 | 18 | trivial, dip (+28 vs 3-2) |
| 3-4 Sky Marks | elite | 2 | 30 + 14 | 0 | 10 | 49% | **67%** | 9.8 | 20 |  |
| 3-5 Sky Scraper Sentinel | elite | 2 | 30 + 15 | 0 | 10 | 53% | **65%** | 9.9 | 19 |  |
| 3-6 The Frost Yeti King | boss | 3 | 30 + 100 | 0 | 10 | 0% | **2%** | 11.6 | 13 | wall |

### M4 Caves & Alcoves

| Node | Kind | Energy | Castle + Armour now | Enemy Lv | Cards | Starter only | Expected deck | Rounds | Your HP left | Flag |
|---|---|---:|---|---:|---:|---:|---:|---:|---:|---|
| 4-1 Roost Flurry | skirmish | 1 | 17 | 0 | 12 | 23% | **57%** | 7.4 | 17 |  |
| 4-2 Glowworm Grotto | skirmish | 1 | 30 + 10 | 0 | 10 | 71% | **94%** | 10.7 | 17 | dip (+37 vs 4-1) |
| 4-3 Cinder Vents | skirmish | 1 | 17 | 0 | 10 | 30% | **63%** | 7.8 | 15 |  |
| 4-4 Echo Chamber | skirmish | 1 | 30 + 15 | 0 | 9 | 3% | **28%** | 9.3 | 14 | wall |
| 4-5 Sulfur Vent Path | skirmish | 1 | 19 | 0 | 10 | 26% | **57%** | 8.1 | 15 | dip (+28 vs 4-4) |
| 4-6 Glowworm Deep | skirmish | 1 | 30 + 17 | 0 | 10 | 61% | **94%** | 12.0 | 16 | dip (+37 vs 4-5) |
| 4-7 The Roost Above | elite | 2 | 20 + 68 | 0 | 9 | 0% | **21%** | 11.9 | 12 | wall |
| 4-8 The Stalactite Warden | boss | 3 | 30 + 62 | 0 | 8 | 12% | **53%** | 13.9 | 18 | dip (+32 vs 4-7) |
| m4-raid The Deep Troll King | raidboss | 4 | 30 + 120 | 0 | 9 | 68% | **75%** | 16.0 | 23 | dip (+22 vs 4-8) |

### M5 Savanna Reaches

| Node | Kind | Energy | Castle + Armour now | Enemy Lv | Cards | Starter only | Expected deck | Rounds | Your HP left | Flag |
|---|---|---:|---|---:|---:|---:|---:|---:|---:|---|
| 5-1 Zebra Stampede | skirmish | 1 | 30 + 14 | 0 | 10 | 0% | **80%** | 10.3 | 16 |  |
| 5-2 Hyena Chorus | skirmish | 1 | 30 + 16 | 0 | 10 | 1% | **67%** | 9.7 | 17 |  |
| 5-3 Howler Canopy | skirmish | 1 | 30 + 20 | 0 | 10 | 48% | **100%** | 9.0 | 25 | trivial, dip (+33 vs 5-2) |
| 5-4 Toucan Watch | skirmish | 1 | 30 + 23 | 0 | 10 | 1% | **41%** | 10.4 | 16 |  |
| 5-5 Giraffe Vanguard | elite | 2 | 20 + 36 | 0 | 10 | 1% | **49%** | 10.6 | 16 |  |
| 5-6 Jaguar Run | elite | 2 | 30 + 40 | 0 | 10 | 0% | **55%** | 10.7 | 18 |  |
| 5-7 The Cheetah Matriarch | elite | 2 | 30 + 70 | 0 | 10 | 0% | **39%** | 11.5 | 17 |  |
| 5-8 The Savanna Warlord | boss | 3 | 30 + 140 | 0 | 10 | 0% | **32%** | 12.9 | 15 | wall |

### M6 Wolfsbane Tundra

| Node | Kind | Energy | Castle + Armour now | Enemy Lv | Cards | Starter only | Expected deck | Rounds | Your HP left | Flag |
|---|---|---:|---|---:|---:|---:|---:|---:|---:|---|
| 6-1 Ice Fang Patrol | skirmish | 1 | 30 + 18 | 0 | 10 | 7% | **94%** | 9.3 | 22 |  |
| 6-2 Frostbitten Pack | skirmish | 1 | 30 + 20 | 0 | 10 | 13% | **97%** | 9.1 | 24 | trivial |
| 6-3 Snowshoe Line | skirmish | 1 | 30 + 24 | 0 | 10 | 22% | **98%** | 9.6 | 24 | trivial |
| 6-4 Lynx Ambush | skirmish | 1 | 30 + 28 | 0 | 10 | 3% | **96%** | 10.2 | 22 | trivial |
| 6-5 Musk Ox Bulwark | elite | 2 | 20 + 40 | 0 | 9 | 7% | **84%** | 10.3 | 16 |  |
| 6-6 Glacier Herd | elite | 2 | 30 + 50 | 0 | 10 | 30% | **95%** | 10.4 | 22 | dip (+11 vs 6-5) |
| 6-7 Alpha Howler's Den | elite | 2 | 30 + 78 | 0 | 10 | 1% | **64%** | 12.6 | 15 |  |
| 6-8 The Glacial Ape-King | boss | 3 | 30 + 160 | 0 | 8 | 0% | **39%** | 15.6 | 11 |  |

### M7 Coral Current

| Node | Kind | Energy | Castle + Armour now | Enemy Lv | Cards | Starter only | Expected deck | Rounds | Your HP left | Flag |
|---|---|---:|---|---:|---:|---:|---:|---:|---:|---|
| 7-1 Clownfish Shoal | skirmish | 1 | 30 + 22 | 0 | 12 | 87% | **100%** | 9.0 | 27 | trivial |
| 7-2 Moray Ambush | skirmish | 1 | 30 + 24 | 0 | 10 | 32% | **85%** | 8.5 | 21 |  |
| 7-3 Tide Pool Line | skirmish | 1 | 30 + 26 | 0 | 10 | 90% | **100%** | 9.1 | 26 | trivial, dip (+16 vs 7-2) |
| 7-4 Riptide Channel | skirmish | 1 | 30 + 28 | 0 | 10 | 23% | **90%** | 9.3 | 18 |  |
| 7-5 Current Split | skirmish | 1 | 30 + 32 | 0 | 9 | 100% | **100%** | 9.6 | 27 | trivial |
| 7-6 Reef Shark Pack | elite | 2 | 20 + 45 | 0 | 9 | 9% | **45%** | 8.1 | 16 |  |
| 7-7 Eel Nest | elite | 2 | 30 + 35 | 0 | 10 | 20% | **87%** | 9.8 | 18 | dip (+42 vs 7-6) |
| 7-8 Sea Turtle Elder's Court | elite | 2 | 30 + 86 | 0 | 9 | 1% | **14%** | 10.4 | 21 | wall |
| 7-9 The Orca Vanguard King | boss | 3 | 30 + 180 | 0 | 9 | 11% | **56%** | 13.1 | 19 | dip (+42 vs 7-8) |

### M8 Sable Swampmire

| Node | Kind | Energy | Castle + Armour now | Enemy Lv | Cards | Starter only | Expected deck | Rounds | Your HP left | Flag |
|---|---|---:|---|---:|---:|---:|---:|---:|---:|---|
| 8-1 Leech Bog | skirmish | 1 | 30 + 26 | 0 | 10 | 21% | **99%** | 10.4 | 23 | trivial |
| 8-2 Mire Ambush | skirmish | 1 | 30 + 28 | 0 | 10 | 51% | **100%** | 9.5 | 28 | trivial |
| 8-3 Toad Chorus | skirmish | 1 | 30 + 32 | 0 | 10 | 34% | **100%** | 10.3 | 23 | trivial |
| 8-4 Root Snare | skirmish | 1 | 30 + 35 | 0 | 10 | 10% | **98%** | 10.2 | 23 | trivial |
| 8-5 Venomlord's Coil | elite | 2 | 20 + 48 | 0 | 9 | 1% | **86%** | 10.4 | 17 |  |
| 8-6 Crocodile Run | elite | 2 | 30 + 60 | 0 | 10 | 4% | **76%** | 11.5 | 21 |  |
| 8-7 Adder Gauntlet | elite | 2 | 30 + 75 | 0 | 10 | 1% | **63%** | 12.2 | 16 |  |
| 8-8 The Alligator King | boss | 3 | 30 + 94 | 0 | 9 | 2% | **65%** | 13.5 | 16 |  |
| m8-raid Wound Reaver's Domain | raidboss | 4 | 30 + 200 | 0 | 10 | 0% | **54%** | 16.7 | 13 |  |

### M9 Basalt Foundry

| Node | Kind | Energy | Castle + Armour now | Enemy Lv | Cards | Starter only | Expected deck | Rounds | Your HP left | Flag |
|---|---|---:|---|---:|---:|---:|---:|---:|---:|---|
| 9-1 Cinder Swarm | skirmish | 1 | 30 + 30 | 0 | 10 | 0% | **23%** | 8.1 | 14 | wall |
| 9-2 Salamander Vents | skirmish | 1 | 30 + 32 | 0 | 10 | 0% | **60%** | 10.6 | 17 | dip (+37 vs 9-1) |
| 9-3 Vent Skitter | skirmish | 1 | 30 + 36 | 0 | 10 | 0% | **51%** | 11.7 | 10 |  |
| 9-4 Ashfall Line | skirmish | 1 | 30 + 40 | 0 | 10 | 0% | **36%** | 10.0 | 14 |  |
| 9-5 Basalt Vanguard | elite | 2 | 20 + 52 | 0 | 8 | 0% | **35%** | 8.6 | 15 | wall |
| 9-6 Titan's Shadow | elite | 2 | 30 + 70 | 0 | 9 | 0% | **39%** | 9.9 | 18 |  |
| 9-7 The Pyroclast Wyrm | elite | 2 | 30 + 102 | 0 | 8 | 48% | **100%** | 12.3 | 25 | trivial, dip (+62 vs 9-6) |
| 9-8 The Phoenix Ember King | boss | 3 | 30 + 220 | 0 | 8 | 12% | **95%** | 17.4 | 24 |  |

### M10 Eyrie Heights

| Node | Kind | Energy | Castle + Armour now | Enemy Lv | Cards | Starter only | Expected deck | Rounds | Your HP left | Flag |
|---|---|---:|---|---:|---:|---:|---:|---:|---:|---|
| 10-1 Goat Trail Runners | skirmish | 1 | 30 + 34 | 0 | 10 | 3% | **89%** | 11.4 | 18 |  |
| 10-2 Avalanche Ridge | skirmish | 1 | 30 + 36 | 0 | 10 | 0% | **43%** | 10.5 | 18 |  |
| 10-3 Cliffside Herd | skirmish | 1 | 30 + 38 | 0 | 10 | 1% | **60%** | 11.3 | 19 | dip (+17 vs 10-2) |
| 10-4 Ridge Fork | skirmish | 1 | 30 + 42 | 0 | 10 | 19% | **97%** | 10.9 | 21 | trivial, dip (+37 vs 10-3) |
| 10-5 West Ledge | elite | 2 | 30 + 46 | 0 | 10 | 2% | **84%** | 11.8 | 19 |  |
| 10-6 East Ledge | elite | 2 | 30 + 46 | 0 | 10 | 0% | **43%** | 10.7 | 17 |  |
| 10-7 Eyrie Wardens | elite | 2 | 20 + 56 | 0 | 9 | 16% | **96%** | 10.9 | 23 | trivial, dip (+53 vs 10-6) |
| 10-8 Summit Approach | elite | 2 | 30 + 60 | 0 | 10 | 0% | **34%** | 10.8 | 18 | wall |
| 10-9 The Condor Sovereign | elite | 2 | 30 + 110 | 0 | 10 | 18% | **99%** | 13.7 | 22 | trivial, dip (+65 vs 10-8) |
| 10-10 The Avalanche Colossus | boss | 3 | 30 + 240 | 0 | 10 | 0% | **21%** | 12.6 | 20 | wall |

### M11 The Sundered Peak

| Node | Kind | Energy | Castle + Armour now | Enemy Lv | Cards | Starter only | Expected deck | Rounds | Your HP left | Flag |
|---|---|---:|---|---:|---:|---:|---:|---:|---:|---|
| 11-1 Silverback Watch | skirmish | 1 | 30 + 50 | 0 | 10 | 6% | **77%** | 10.7 | 22 |  |
| 11-2 Grizzly Frontier | skirmish | 1 | 30 + 52 | 0 | 10 | 1% | **70%** | 11.5 | 18 |  |
| 11-3 Cave Warlord's Guard | elite | 2 | 20 + 72 | 0 | 8 | 1% | **28%** | 12.0 | 11 | wall |
| 11-4 The Constrictor Sovereign | elite | 2 | 30 + 116 | 0 | 10 | 0% | **23%** | 14.0 | 9 | wall |
| 11-5 The Blessed Avatar | elite | 2 | 30 + 122 | 0 | 10 | 7% | **84%** | 13.7 | 20 | dip (+61 vs 11-4) |
| 11-6 The Iron Cataphract | elite | 2 | 30 + 128 | 0 | 10 | 1% | **65%** | 13.9 | 18 |  |
| 11-7 The Ancient Sloth Titan | boss | 3 | 30 + 134 | 0 | 8 | 42% | **99%** | 14.1 | 27 | trivial, dip (+35 vs 11-6) |
| 11-8 The Cave Warlord | finalboss | 5 | 30 + 320 | 0 | 10 | 0% | **5%** | 13.7 | 9 | wall |

## B1 compared

B1 (2026-10-08 report) proposed raising 3-1 and 3-2 to 22 HP and dropping the Frost Yeti King to 90.

| Node | Now | B1 | B1 result (expected deck) | This audit |
|---|---|---|---:|---|
| 3-1 Badger Warband | 16 | 22 | 76% (starter 69%) | keep 16 (86%) |
| 3-2 Quill Line | 16 | 22 | 59% (starter 46%) | keep 16 (69%) |
| 3-6 Frost Yeti King | 130 | 90 | **6%** (starter 0%) | 30 + 12 Armour (46%) |

- **B1 was right for a starter-only player, wrong for the expected player.** With reward cards, Map 2 skirmishes sit at 87 to 92%. The real dent is that **Map 2's elites and boss are walls** (18 to 27%), so Map 3's 86% opener feels easy only by contrast. Fix Map 2's back half instead of making Map 3's opener harder. At 22 HP, 3-1 would fall below the 85 to 95% band for a map's first skirmish.
- **B1's Yeti King at 90 is still a wall** (6%). The Yeti deck (4 Yeti, 4 Glacier Wolf Pack) is strong. Total HP has to fall to about 42 to reach the boss band. Making it a Gravity "special" fight is still an option, but it wasn't simulated here.

## Proposed tweaks (all verified)

Every row was re-simulated with the change applied, 200 games each.
- **Castle + Armour** is the new split: the castle's own Health, plus Armour on top.
- **Target** is the aim for that slot: skirmishes run from 90% (first) down to about 68% (last), elites from 62% down to 54%, bosses 47%, raid bosses and the final boss 40%.
- **Deck** lines list copies added (+) or removed (−) against today's deck. Where a deck is "from" another node, it reuses that node's cards, so the map's theme stays the same.
- Nodes with a total under 30 (for example 3-1 at 16) can only stay that way as old-style `hqHp` nodes. See "Other findings".

**M1 Bramblewood Outskirts**

| Node | Change | Castle + Armour | Expected deck now → after | Target | Starter only after |
|---|---|---|---:|---:|---:|
| 1-1 | none | 16 | 100% → **100%** | 90% | 99% |
| 1-2 | Deck: -2 worker-ant, +3 ant-scout; castle 20 → 30 | 30 | 100% → **92%** | 88% | 46% |
| 1-3 | Armour 0 → 10 (castle 20 → 30) | 30 + 10 | 93% → **72%** | 68% | 25% |
| 1-4 | Armour 10 → 20 | 20 + 20 | 67% → **48%** | 47% | 10% |

**M2 Sunken Hollow**

| Node | Change | Castle + Armour | Expected deck now → after | Target | Starter only after |
|---|---|---|---:|---:|---:|
| 2-1 | none | 26 | 87% → **87%** | 90% | 43% |
| 2-2 | Armour 0 → 14 (castle 28 → 30) | 30 + 14 | 92% → **73%** | 68% | 14% |
| 2-3 | Deck: +1 reef-manta-glider, -2 open-ocean-hermit-crab, +1 pond-trout | 30 + 4 | 23% → **61%** | 62% | 10% |
| 2-4 | Deck: -2 open-ocean-hermit-crab, +2 pond-trout | 30 + 8 | 27% → **54%** | 54% | 8% |
| 2-5 | Deck: +1 humpback-elder, -2 open-ocean-hermit-crab | 30 + 10 | 18% → **49%** | 47% | 6% |

**M3 The Ashen Peak**

| Node | Change | Castle + Armour | Expected deck now → after | Target | Starter only after |
|---|---|---|---:|---:|---:|
| 3-1 | none | 16 | 86% → **86%** | 90% | 81% |
| 3-2 | none | 16 | 69% → **69%** | 68% | 65% |
| 3-3 | Armour 20 → 66 | 20 + 66 | 97% → **64%** | 62% | 16% |
| 3-4 | Armour 14 → 23 | 30 + 23 | 67% → **57%** | 58% | 33% |
| 3-5 | Armour 15 → 21 | 30 + 21 | 65% → **54%** | 54% | 41% |
| 3-6 | Armour 100 → 12 | 30 + 12 | 2% → **46%** | 47% | 21% |

**M4 Caves & Alcoves**

| Node | Change | Castle + Armour | Expected deck now → after | Target | Starter only after |
|---|---|---|---:|---:|---:|
| 4-1 | Deck: +1 cave-flitter, +1 bat-swarmling, -3 cave-bat-swarm | 17 | 57% → **92%** | 90% | 58% |
| 4-2 | Armour 10 → 24 | 30 + 24 | 94% → **87%** | 86% | 53% |
| 4-3 | Deck: +1 sulfur-cinder-moth, -1 cave-bat-swarm | 17 | 63% → **85%** | 81% | 60% |
| 4-4 | Deck: -3 cave-flitter; Armour 15 → 0 | 30 | 28% → **78%** | 77% | 30% |
| 4-5 | Deck: +1 sulfur-cinder-moth, -1 cave-bat-swarm | 19 | 57% → **80%** | 72% | 57% |
| 4-6 | Armour 17 → 55 | 30 + 55 | 94% → **68%** | 68% | 23% |
| 4-7 | Armour 68 → 9 | 20 + 9 | 21% → **62%** | 62% | 12% |
| 4-8 | Armour 62 → 76 | 30 + 76 | 53% → **49%** | 47% | 11% |
| m4-raid | Deck: +2 deep-cave-troll; Armour 120 → 130 | 30 + 130 | 75% → **40%** | 40% | 32% |

**M5 Savanna Reaches**

| Node | Change | Castle + Armour | Expected deck now → after | Target | Starter only after |
|---|---|---|---:|---:|---:|
| 5-1 | Armour 14 → 0 | 30 | 80% → **87%** | 90% | 1% |
| 5-2 | Armour 16 → 0 | 30 | 67% → **80%** | 83% | 4% |
| 5-3 | Deck: -2 howler-monkey, -4 toucan-courier, +2 dust-hyena, +4 plains-zebra; Armour 20 → 22 | 30 + 22 | 100% → **77%** | 75% | 0% |
| 5-4 | Armour 23 → 2 | 30 + 2 | 41% → **67%** | 68% | 2% |
| 5-5 | Armour 36 → 12 | 20 + 12 | 49% → **65%** | 62% | 2% |
| 5-6 | Armour 40 → 42 | 30 + 42 | 55% → **54%** | 58% | 0% |
| 5-7 | Armour 70 → 34 | 30 + 34 | 39% → **52%** | 54% | 0% |
| 5-8 | Armour 140 → 35 | 30 + 35 | 32% → **48%** | 47% | 0% |

**M6 Wolfsbane Tundra**

| Node | Change | Castle + Armour | Expected deck now → after | Target | Starter only after |
|---|---|---|---:|---:|---:|
| 6-1 | Armour 18 → 29 | 30 + 29 | 94% → **90%** | 90% | 4% |
| 6-2 | Armour 20 → 59 | 30 + 59 | 97% → **84%** | 83% | 1% |
| 6-3 | Deck: -4 snowshoe-hare, -2 arctic-fox-raider, +2 ice-crevasse-wolf, +4 alpha-howler; Armour 24 → 41 | 30 + 41 | 98% → **76%** | 75% | 2% |
| 6-4 | Deck: -4 taiga-lynx, -3 boreal-elk, -3 timber-wolf-pack, +4 alpha-howler, +4 ice-crevasse-wolf, +2 arctic-fox-raider; Armour 28 → 57 | 30 + 57 | 96% → **70%** | 68% | 2% |
| 6-5 | Armour 40 → 57 | 20 + 57 | 84% → **61%** | 62% | 4% |
| 6-6 | Armour 50 → 111 | 30 + 111 | 95% → **56%** | 58% | 7% |
| 6-7 | Armour 78 → 179 | 30 + 179 | 64% → **54%** | 54% | 0% |
| 6-8 | Armour 160 → 140 | 30 + 140 | 39% → **46%** | 47% | 0% |

**M7 Coral Current**

| Node | Change | Castle + Armour | Expected deck now → after | Target | Starter only after |
|---|---|---|---:|---:|---:|
| 7-1 | Deck: -4 clownfish-scout, -4 tide-pool-crab, -4 gull-thief, +4 moray-ambusher, +4 riptide-eel, +2 coral-current-eel; Armour 22 → 17 | 30 + 17 | 100% → **87%** | 90% | 39% |
| 7-2 | Armour 24 → 36 | 30 + 36 | 85% → **81%** | 85% | 25% |
| 7-3 | Deck: -4 tide-pool-crab, -4 gull-thief, -2 clownfish-scout, +4 riptide-eel, +4 coral-current-eel, +2 moray-ambusher; Armour 26 → 45 | 30 + 45 | 100% → **82%** | 79% | 19% |
| 7-4 | Armour 28 → 67 | 30 + 67 | 90% → **76%** | 74% | 14% |
| 7-5 | Deck: -3 coral-polyp-colony, -3 clownfish-scout, -3 tide-pool-crab, +4 orca-vanguard, +3 coral-reef-shark, +2 moray-ambusher; Armour 32 → 49 | 30 + 49 | 100% → **66%** | 68% | 26% |
| 7-6 | Armour 45 → 18 | 20 + 18 | 45% → **60%** | 62% | 21% |
| 7-7 | Deck: -4 riptide-eel, -4 coral-current-eel, +1 moray-ambusher, +4 coral-reef-shark, +2 orca-vanguard; Armour 35 → 143 | 30 + 143 | 87% → **54%** | 58% | 21% |
| 7-8 | Deck: +1 sea-turtle-elder, -1 coral-polyp-colony; Armour 86 → 11 | 30 + 11 | 14% → **56%** | 54% | 17% |
| 7-9 | Deck: +2 orca-vanguard; Armour 180 → 143 | 30 + 143 | 56% → **44%** | 47% | 1% |

**M8 Sable Swampmire**

| Node | Change | Castle + Armour | Expected deck now → after | Target | Starter only after |
|---|---|---|---:|---:|---:|
| 8-1 | Deck: -4 bog-leech, -4 gangrenous-leech, -2 marsh-gas-toad, +4 adder-ambusher, +3 venomlord-serpent, +3 constrictor-coil | 30 + 26 | 99% → **91%** | 90% | 6% |
| 8-2 | Deck: -3 swamp-alligator, -4 mire-witch-heron, -3 cypress-root-lurker, +2 venomlord-serpent, +3 constrictor-coil, +4 adder-ambusher; Armour 28 → 41 | 30 + 41 | 100% → **84%** | 83% | 5% |
| 8-3 | Deck: -4 marsh-gas-toad, -4 bog-leech, -2 gangrenous-leech, +4 adder-ambusher, +3 venomlord-serpent, +3 constrictor-coil; Armour 32 → 51 | 30 + 51 | 100% → **77%** | 75% | 2% |
| 8-4 | Deck: -4 cypress-root-lurker, -3 mire-witch-heron, +1 adder-ambusher, +2 venomlord-serpent, +3 constrictor-coil; Armour 35 → 72 | 30 + 72 | 98% → **69%** | 68% | 2% |
| 8-5 | Armour 48 → 101 | 20 + 101 | 86% → **62%** | 62% | 1% |
| 8-6 | Armour 60 → 87 | 30 + 87 | 76% → **54%** | 58% | 1% |
| 8-7 | Armour 75 → 108 | 30 + 108 | 63% → **55%** | 54% | 1% |
| 8-8 | Armour 94 → 119 | 30 + 119 | 65% → **46%** | 47% | 0% |
| m8-raid | Deck: +2 swamp-alligator | 30 + 200 | 54% → **41%** | 40% | 0% |

**M9 Basalt Foundry**

| Node | Change | Castle + Armour | Expected deck now → after | Target | Starter only after |
|---|---|---|---:|---:|---:|
| 9-1 | Deck: +3 cinder-hornet, -3 ember-jackal; Armour 30 → 0 | 30 | 23% → **87%** | 90% | 25% |
| 9-2 | Armour 32 → 15 | 30 + 15 | 60% → **85%** | 83% | 1% |
| 9-3 | Armour 36 → 15 | 30 + 15 | 51% → **76%** | 75% | 0% |
| 9-4 | Armour 40 → 3 | 30 + 3 | 36% → **70%** | 68% | 4% |
| 9-5 | Armour 52 → 2 | 20 + 2 | 35% → **59%** | 62% | 10% |
| 9-6 | Armour 70 → 14 | 30 + 14 | 39% → **57%** | 58% | 1% |
| 9-7 | Deck: -2 pyroclast-wyrm, +3 ember-jackal; Armour 102 → 22 | 30 + 22 | 100% → **52%** | 54% | 1% |
| 9-8 | Deck: -2 phoenix-fledgling, -2 pyroclast-wyrm, +3 basalt-boar, +3 ember-jackal; Armour 220 → 38 | 30 + 38 | 95% → **45%** | 47% | 0% |

**M10 Eyrie Heights**

| Node | Change | Castle + Armour | Expected deck now → after | Target | Starter only after |
|---|---|---|---:|---:|---:|
| 10-1 | Armour 34 → 26 | 30 + 26 | 89% → **91%** | 90% | 5% |
| 10-2 | Armour 36 → 0 | 30 | 43% → **80%** | 83% | 4% |
| 10-3 | Armour 38 → 12 | 30 + 12 | 60% → **79%** | 75% | 1% |
| 10-4 | Deck: -2 golden-eagle-diver, -4 peak-condor, -2 eyrie-warden, +3 alpine-avalanche, +4 rockslide-ram, +3 mountain-goat-climber; Armour 42 → 14 | 30 + 14 | 97% → **71%** | 68% | 0% |
| 10-5 | Deck: +2 rockslide-ram; Armour 46 → 67 | 30 + 67 | 84% → **65%** | 62% | 0% |
| 10-6 | Armour 46 → 15 | 30 + 15 | 43% → **61%** | 60% | 0% |
| 10-7 | Deck: -2 eyrie-warden, +1 golden-eagle-diver, +3 rockslide-ram; Armour 56 → 158 | 20 + 158 | 96% → **60%** | 58% | 0% |
| 10-8 | Armour 60 → 32 | 30 + 32 | 34% → **55%** | 56% | 0% |
| 10-9 | Deck: -2 peak-condor, -2 eyrie-warden, -3 golden-eagle-diver, +4 rockslide-ram, +3 mountain-goat-climber, +2 alpine-avalanche; Armour 110 → 54 | 30 + 54 | 99% → **56%** | 54% | 1% |
| 10-10 | Armour 240 → 41 | 30 + 41 | 21% → **45%** | 47% | 0% |

**M11 The Sundered Peak**

| Node | Change | Castle + Armour | Expected deck now → after | Target | Starter only after |
|---|---|---|---:|---:|---:|
| 11-1 | Armour 50 → 33 | 30 + 33 | 77% → **89%** | 90% | 19% |
| 11-2 | Armour 52 → 65 | 30 + 65 | 70% → **67%** | 68% | 0% |
| 11-3 | Armour 72 → 47 | 20 + 47 | 28% → **64%** | 62% | 3% |
| 11-4 | Armour 116 → 65 | 30 + 65 | 23% → **54%** | 59% | 1% |
| 11-5 | Deck: -3 blessed-avatar, -3 shrine-high-priest, -3 hollow-oath-keeper, +4 grizzly-vanguard, +4 woodland-brawler, +1 bear-cub; Armour 122 → 68 | 30 + 68 | 84% → **56%** | 57% | 1% |
| 11-6 | Deck: -2 cataphract-destrier, -4 warhorse-charger, -2 stable-colt, +4 grizzly-vanguard, +3 woodland-brawler, +1 bear-cub; Armour 128 → 75 | 30 + 75 | 65% → **53%** | 54% | 1% |
| 11-7 | Deck: -2 ancient-sloth-titan, -3 hanging-loafer, -2 cave-warlord, +4 grizzly-vanguard, +4 woodland-brawler, +2 bear-cub; Armour 134 → 98 | 30 + 98 | 99% → **44%** | 47% | 0% |
| 11-8 | Armour 320 → 81 | 30 + 81 | 5% → **37%** | 40% | 1% |

**Notes on the proposals**
- **Swapped decks:**
  - 1-2 Scorpion Ambush uses more Ant Scouts.
  - 2-3 to 2-5 trade Open-Ocean Hermit Crabs (the card that makes Map 2's back half a wall) for Pond Trout, Reef Manta or Humpback Elder.
  - 4-1, 4-3 and 4-5 lose Cave Bat Swarms.
  - 4-4 Echo Chamber drops 3 Cave Flitters.
  - 9-1 swaps Ember Jackals for Cinder Hornets.
  - **Reused decks:**
    - 5-3 uses 5-1's deck.
    - 6-3 and 6-4 use 6-7's.
    - 7-1 uses 7-2's, 7-3 uses 7-4's, 7-5 uses 7-9's, and 7-7 uses 7-6's.
    - 8-1 and 8-3 use 8-7's, and 8-2 and 8-4 use 8-5's.
  - **Signature-card mixes:**
    - 9-7 and 9-8 keep one signature card on the Basalt Vanguard core.
    - 10-4, 10-5, 10-7 and 10-9 mix in Rockslide Rams and Golden Eagle Divers.
    - 11-5, 11-6 and 11-7 keep one signature card on the Grizzly Frontier core.
  - Reusing a deck makes some fights look alike. Treat those rows as "this strength of deck", and pick cards with the same feel if variety matters.
- **Very large Armour:** 6-7 (179), 7-7 and 7-9 (143), 10-7 (158) and m8-raid (200). These work in the simulation but make fights long. A better fix for each is 2 to 4 more enemy cards, so the enemy doesn't run dry before round 20.
- **1-1 Otter Patrol stays at 100%.** It is the first fight after the tutorial, so a sure win is fine there. Raising its castle to 30 still gives 100%.
- **The starter-only player falls behind.** With these changes, a player who never adds reward cards drops to 25% on 1-3, 10% on the first boss, and under 15% on Map 2's back half. That is the intended pressure to use rewards. It works only if the reward screen clearly says "add this to your deck". If that feels too harsh, use 1-3 at 30 + 5 Armour instead of 30 + 10.
- **Maps 5 to 11 depend on the Pack 1 assumption.** If players buy fewer packs, Maps 5, 9, 10 and 11 get harder. Without pack cards, Map 5's skirmishes are 2 to 11% and its boss 4%. Players also get **no new reward cards after Map 4**, so their power stops growing from fights after that point. Adding reward cards on Maps 5 to 11 would make the late curve depend less on packs.

## Other findings

1. **Armour is capped in practice by Sudden Death.** From round 20, any castle hit ends the game. Armour only matters for damage dealt in rounds 1 to 19. Once an 8 to 12 card enemy deck is spent, more Armour just makes a long, one-sided fight. Two options:
   - Give enemy decks 14 to 16 cards.
   - Have the Skirmish editor warn when Armour is above about 3 times the castle's Health.
2. **Enemy deck level is 0 on all 84 nodes.** Enemy cards have no rarity, or Common, so `rarityWeight × (1 + 0) − 1 = 0` for each one. Players' own decks also read Lv 0 unless they include a rare (for example River Warden +2 per copy). Two options:
   - Tag enemy cards with rarities.
   - Show a "threat" number built from the castle total and the deck's attack and health.
3. **Totals under the castle's Health can't be made in the editor.** `skirmishCastle()` keeps an old `hqHp` of 16 as a 16 HP castle. But once a node has `armour` set, its castle is always the full 30 (or 20). The early nodes at 16 to 28 (1-1, 1-2, 1-3, 2-1, 2-2, 3-1, 3-2, 4-1, 4-3, 4-5) would jump to 30 if edited and saved. Two options:
   - Add a small castle character (16 to 20 HP, no effect).
   - Let Armour go negative.
4. **Duplicate enemy decks today:** these pairs have identical decks: 3-4 and 3-5, 4-2 and 4-6, 4-3 and 4-5, 7-4 and 7-7, 10-2 and 10-6, 10-8 and 10-10. Only Armour sets each pair apart. This is fine for branch choices, but it is part of why the curve zig-zags.
5. **The old tool understates late maps.** `tools/difficulty_curve.js` gives every enemy endless Bee Tanks once its deck runs out. Before trusting it past Map 3, it should set `loopCards` the way `setupEnemyBehaviour` does.

## Reproduce

- `node tools/difficulty_curve.js 100 otters open` gives the base, starter-only numbers.
- The extended scripts are in this session's scratch folder: `skirmish_audit.js` (variants: starter, casual, collector; enemy loop: real or bee), `tune2.js` and `final.js`, plus `proposal.json` (the exact deck and HP values above). They read `arena_app.js` and `canonical/` and never write to the repo. To keep them, copy them into `tools/` next to `difficulty_curve.js`.
