# The level curve after the budget Forge curve, 2026-10-19 (package BF)

Owner, 09:52:
- "L should scale. So this is my new formula. (Base-1 + L) * (1+L/20) e.g. (Base-1 + 5) * (1.25)."
- "Forge curve out - Use our N formula below, and change majors to 4, 7, 10, minor to 2. Then divvy out strength updates at all levels. If there is no space for minor, then all are minor OR potentially still 0, then majors expect SOME improvement."
- "No Forge is fine. The player has to deck build to win."
- "Submap's difficulty floor varies. But at least 1 map ahead of difficulty."

This note follows `docs/level-curve-2026-10-19.md` (package LV) and `docs/road-curve-2026-10-19.md` (package R2). The numbers come from `node tools/forge_curve_2026_10_19.js report` and `node tools/skirmish_pass.js measure 120` (seeds 9100 + 37g; fresh seeds 5100 + 37g).

## Budget v4

- **Base** = 20 + Rarity + 6×Wait + 0.5×Wait² + 4×Lumber + 0.4×Lumber² + Ritual points. This is v3's N without its 2×Level term.
- **N(L) = (Base − 1 + L) × (1 + L/20).** The rules are unchanged: 2A+H+S < N and A·H+S < (N/3)², each ×1.5 per half-miss skill.
- **The formula lives in one place:** `bramblewood-budget.js` (`BramblewoodBudget.nAt`, `baseOf`). The game inlines it (the Test Lab, the card editor and the Forge use it). `tools/skill_costs.js`, and through it every balance tool and the hub's Skill costs tab, read it too. The numbers are in `canonical/skill-costs.json` "budget" (`levelDiv` 20; `perLevel` is kept only for v3 comparisons).
- **At Level 1, v4 is 1.05×Base against v3's Base + 2.** The difference is 0.05×Base − 2:
  - −0.95 at Base 21 (a 0-Lumber Common);
  - 0 at Base 40;
  - +1 at Base 60;
  - +6.65 for the Dragons (Base about 173).
- **At Level 0, v4 is Base − 1** (v3: Base).
- **Every measured card at Level 1** (`docs/balance/budget-v4-2026-10-19.json`; the same at each card's own starting level):

| | Cards | Pass v3 | Pass v4 | Into budget | Out of budget |
|---|---|---|---|---|---|
| At Level 1 | 744 | 709 | 710 | 2: Bone Diviner (N 47.6 → 47.88), Grovebearer Dragon-Turtle (95.9 → 98.6) | 1: Barnacle Fortress (33.9 → 33.49 against 2A+H+S 33.7) |

- **The post-balance queue** (`docs/balance/post-balance-queue.json`, `--check` passes) has 28 cards, down from 29. Bone Diviner and the Dragon-Turtle left it, and Barnacle Fortress joined it. **No card's stats changed.**

## The Forge curve

- **A card's stats at level L follow N(L).** Each level above the card's starting level banks its budget gain, ΔN = N(L) − N(L−1), counted in 2A+H points (1 Health = 1, 1 Attack = 2; divided by the half-miss multiplier).
- **Who spends the bank:**
  - **Majors (4, 7, 10)** and the limit break (11) spend everything banked, and always at least 1 point.
  - **The minor (2)** spends its bank too. That is only a level or two of gain, so it is a smaller step.
  - **Every other level** spends a third, often 0 on a small card. The rest waits for the next major.
- **So 2A+H never rises by more than N(L) − N(start).** A card inside the budget at its start stays inside at every level. A card over it never loses room.
- **Which stat grows:** Attack where that keeps the card's A:H shape, the rest Health. No level ever takes a stat back, and a 0-Attack wall only grows Health. A step that would shrink the card's A·H room goes to the cheaper stat.
- **It is the same for a card everywhere:** the game (`statsAtLevel`, `forgeCurveOf`), the enemy's levels and the tools. A level the designer set by hand (`levelStats`) still wins.
- **The anvil** shows it under **📈 What each level gives**: what each level adds, with the big and small steps marked (TX keys `ui.forge-curve-*`, in the 12 packs).
- **Tests:** `tests/forge-curve-2026-10-19.js` checks every live card with stats:
  - no level loses a stat;
  - majors always give something;
  - every level stays inside N(L).

### Three examples

| Level | Kind | Otter Centurion (Rare, Base 29.5, starts Lv 0) | Bramblewood Lynx (Rare, Base 33.9) | Quillguard (Rare, Base 41.4) |
|---|---|---|---|---|
| 0 | start | 3/5 | – | – |
| 1 | | 3/5 | 6/6 (start) | 3/22 (start) |
| 2 | minor | 4/8 | 7/6 | 3/25 |
| 3 | | 4/8 | 7/7 | 3/26 |
| 4 | **major** | 6/9 | 9/8 | 4/29 |
| 5 | | 6/10 | 9/9 | 4/30 |
| 6 | | 6/11 | 9/10 | 4/32 |
| 7 | **major** | 8/14 | 12/12 | 5/38 |
| 8 | | 8/15 | 12/13 | 5/39 |
| 9 | | 8/16 | 13/13 | 5/41 |
| 10 | **major** | 11/18 | 15/16 | 6/48 |
| 11 | limit break | 12/19 | 17/16 | 7/50 |

**The size of it:** on the mean live card, 2A+H gains:

| Level | Mean 2A+H gain |
|---|---|
| 2 | +19% |
| 3 | +23% |
| 4 | +65% |
| 7 | +144% |
| 10 | +228% |

The old curve gave +10% / +20% / +35% at Levels 3 / 6 / 10. N gains the same number of points whatever the card's size, so a small card that sits well under its budget (the Otter Centurion, 2A+H 11 against N 28.5) gains far more in proportion than a big one.

## The Forge stays at Map 11

**Decision B7** (`docs/decisions.json`): before Map 11 the reference player is at Lv 0 (every card at its own starting level) and the road is won by deck building alone. From Map 11 the player is at Lv 3, rising a little each map from Map 16, as before (`ROAD_LEVEL_CURVE`).

## The enemy keeps pace

The R2 / LV road curves were tuned when every card grew by the same +10% steps. Under the BF curve, your Lv 3 deck is about +23% (it was +10%), and Lv 3.9 at Map 20 is about +60% (it was +13%).

So the enemy's level is now worked out on the two decks themselves (`enemyLevelKeepingPace`). It keeps the strength ratio that fight had to your reference deck under the old steps:
- A deck's strength is the mean over its copies of (A+1)×H at the level, against its printed (A+1)×H.
- A fractional level mixes its two whole levels, per copy.
- The old steps are counted the way the old `levelMix` played them: a whole Lv 2 had Lv 1's stats, so Map 8's enemy had none of its +5%.

Two simpler versions were measured first and dropped:
- **The mean card's gain** (`FORGE_MEAN_GAIN`): 117 of 179 main fights green. Maps 8–10 got too hard and 21–24 too easy, because small-card decks gain far more than the mean.
- **The deck's summed 2A+H:** 122 green. It underweights small cards.

The (A+1)×H version gave 144 green before any per-fight retune.

## Side maps a map ahead

- **Every side map's fights count at least one map past their parent** (`fightMapNumber` = max(its own number, parent + `sideMapAhead`)). This applies to the enemy's level and the Shield rule.
  - `sideMapAhead` is 1, or the map's `aheadMaps`, which is never under 1.
  - The endless dungeons count too: a floor is parent + 1 + half a map per floor.
  - Maps that already count as a later one keep their number: the Old Bramble (17), Lilypad Reach (6), and the Tutorial's T-2 / T-3 / T-4.
- **Your reference deck and level stay the parent's.** So a side map is a step harder for the player who reaches it.
- **Its road-curve targets sit one map's step lower** (`roadCurveTarget`, `ROAD_CURVE_SIDE_DR` 0.19 logits a map: the LV yardsticks' 0.19 DR a map):

| Fight | Main-map target | Side-map target |
|---|---|---|
| First fight | 90% | 88% |
| Last fight before the boss | 60% | 55% |
| Boss band | 30–49% | 26–44% |

- **Tests:** `tests/side-maps-2026-10-19.js` checks every side-map fight for the rule, its level and Shield against its parent's, its targets, and the measure.

## The curves, before and after

Your level is unchanged. "Your stats" is the mean card's 2A+H gain at that level, under the old steps and under the BF curve.

The enemy columns show the road's line for a map's skirmish:
- **before:** the old line's level;
- **BF:** the level that keeps the old ratio to your deck, on the mean card. Each fight's own level comes from its own deck (`enemyLevelKeepingPace`), so it varies around this.

<!-- bf:curves -->
| Map | Your level | Your stats, old steps | Your stats, BF curve | Enemy skirmish level, before | Enemy stats, before | Enemy skirmish level, BF | Enemy stats, BF |
|---|---|---|---|---|---|---|---|
| 0 | 0 | +0% | +0% | 0 | +0% | 0 | +0% |
| 1 | 0 | +0% | +0% | 0 | +0% | 0 | +0% |
| 2 | 0 | +0% | +0% | 0 | +0% | 0 | +0% |
| 3 | 0 | +0% | +0% | 0 | +0% | 0 | +0% |
| 4 | 0 | +0% | +0% | 0 | +0% | 0 | +0% |
| 5 | 0 | +0% | +0% | 1.25 | +1.3% | 1.07 | +1.3% |
| 6 | 0 | +0% | +0% | 1.5 | +2.5% | 1.13 | +2.5% |
| 7 | 0 | +0% | +0% | 1.75 | +3.8% | 1.2 | +3.8% |
| 8 | 0 | +0% | +0% | 2 | +5% | 1.26 | +5% |
| 9 | 0 | +0% | +0% | 2.25 | +6.3% | 1.33 | +6.3% |
| 10 | 0 | +0% | +0% | 2.5 | +7.5% | 1.39 | +7.5% |
| 11 | 3 | +10% | +23.1% | 2.75 | +8.8% | 2.69 | +21.9% |
| 12 | 3 | +10% | +23.1% | 3 | +10% | 3 | +23.1% |
| 13 | 3 | +10% | +23.1% | 3.38 | +11.3% | 3.03 | +24.4% |
| 14 | 3 | +10% | +23.1% | 3.75 | +12.5% | 3.06 | +25.6% |
| 15 | 3 | +10% | +23.1% | 4.13 | +13.8% | 3.09 | +26.9% |
| 16 | 3.18 | +10.6% | +30.7% | 4.5 | +15% | 3.28 | +35.1% |
| 17 | 3.36 | +11.2% | +38.3% | 4.88 | +16.3% | 3.48 | +43.4% |
| 18 | 3.54 | +11.8% | +45.9% | 5.25 | +17.5% | 3.67 | +51.6% |
| 19 | 3.72 | +12.4% | +53.6% | 5.63 | +18.8% | 3.87 | +59.9% |
| 20 | 3.9 | +13% | +61.2% | 6 | +20% | 4.43 | +68.2% |
| 21 | 4.08 | +13.6% | +65.9% | 6.38 | +21.3% | 5.15 | +73.6% |
| 22 | 4.26 | +14.2% | +67.1% | 6.75 | +22.5% | 5.32 | +75.4% |
| 23 | 4.44 | +14.8% | +68.3% | 7.13 | +23.8% | 5.48 | +77.2% |
| 24 | 4.62 | +15.4% | +69.4% | 7.5 | +25% | 5.65 | +79% |

## The road curve, before and after

- **Before:** the pre-BF code (`5ec913a`), `docs/balance/skirmish-pass-bf-before.jsonl`.
- **Untuned:** the BF curve with the enemy keeping pace, after merging main (RC, EE, UT), with no per-fight change (`bf-mid3`).
- **After:** the three tune rounds (`bf-after`).

All three are 120 games on the measure seeds. Targets are R2's: 90% → 60% before the boss, the boss 30–49%.

<!-- bf:maps -->
| Map | Name | Fights | Green before | Mean win before | Green, new curve untuned | Mean win untuned | Green after | Mean win after | Mean target |
|---|---|---|---|---|---|---|---|---|---|
| 0 | Bramblewood Outskirts | 4 | 4 | 66.1 | 4 | 66.1 | 4 | 66.1 | 67.5 |
| 1 | Thistlewood | 5 | 5 | 71 | 5 | 71 | 5 | 71 | 68 |
| 2 | Pebble Beach | 5 | 5 | 67.7 | 5 | 67.7 | 5 | 67.7 | 68 |
| 3 | Gannet Cliffs | 7 | 7 | 72.3 | 7 | 72.3 | 7 | 72.3 | 70 |
| 4 | Sunken Hollow | 5 | 5 | 65.7 | 5 | 65.7 | 5 | 65.7 | 68 |
| 5 | Gatorback Swamp | 7 | 7 | 69 | 7 | 68.2 | 7 | 68.2 | 70 |
| 6 | Sable Swampmire | 8 | 8 | 72 | 8 | 70.4 | 8 | 70.4 | 70.6 |
| 7 | The Morel Hollow | 6 | 6 | 66.4 | 6 | 69.2 | 6 | 69.2 | 69.2 |
| 8 | Caves & Alcoves | 8 | 8 | 69.2 | 8 | 68.5 | 8 | 68.5 | 70.6 |
| 9 | The Kelp Mangroves | 7 | 7 | 67.2 | 6 | 65.9 | 7 | 67.1 | 70 |
| 10 | Coral Current | 9 | 9 | 69.1 | 8 | 71.3 | 9 | 72.2 | 71.1 |
| 11 | Eyrie Heights | 10 | 10 | 73.6 | 8 | 73.7 | 10 | 71.3 | 71.5 |
| 12 | The Briar Maze | 7 | 7 | 68.2 | 4 | 72.6 | 7 | 73 | 70 |
| 13 | The Redwood Deep | 8 | 8 | 70.3 | 7 | 68.7 | 8 | 70 | 70.6 |
| 14 | Savanna Reaches | 8 | 8 | 69.5 | 5 | 64.7 | 8 | 68.7 | 70.6 |
| 15 | The Long Grass | 7 | 7 | 67.6 | 4 | 78 | 7 | 70 | 70 |
| 16 | The Pinewood Taiga | 7 | 7 | 73 | 5 | 75.2 | 6 | 74.9 | 70 |
| 17 | Wolfsbane Tundra | 8 | 8 | 71.4 | 6 | 70.7 | 8 | 71.3 | 70.6 |
| 18 | The Glass Dunes | 7 | 7 | 71.8 | 5 | 72.1 | 7 | 70 | 70 |
| 19 | Ashen Spurn | 6 | 6 | 73.3 | 6 | 67.4 | 6 | 67.4 | 69.2 |
| 20 | The Sundered Peak | 10 | 10 | 68.8 | 7 | 72.3 | 10 | 70.3 | 69 |
| 21 | The Quiet Summit | 6 | 6 | 68 | 2 | 56.8 | 6 | 65.6 | 69.2 |
| 22 | The Rimefire Caldera | 8 | 8 | 70.5 | 4 | 63.9 | 8 | 68.8 | 70.6 |
| 23 | The Goldfeather Siege | 8 | 8 | 70.2 | 5 | 65.8 | 8 | 70 | 70.6 |
| 24 | Goldfeather Keep | 8 | 8 | 72.8 | 7 | 70.7 | 8 | 69.9 | 70.6 |
| | **Main maps** | 179 | **179** | | **144** | | **178** | | |

| | Before | Untuned | After | After, fresh seeds (5100) |
|---|---|---|---|---|
| Main-map fights green (179) | 179 | 144 | **178** | 154 |
| Side-map fights on the curve green (77) | 76 | 57 | **76** | 63 |

**Off the curve after the retune:**
- **16-6 Reaver's Hollow** (an elite, Map 16): 74% against a 52–68% band. It sits at its 2× Shield cap (47), and no deck move made it harder; every bigger-card swap made it easier. This is an owner call.
- **20-A-4 Heart of the Mountain** (the Eye of the Volcano's four-wave dungeon): 97.5%, as before. LV notes that the tool can't simulate it as one fight. The tuner wanted 12 card moves and a 144 Shield, so the change was not applied.

**Earlier attempts** (kept for the record):
- `bf-mid` (the mean card's gain): 117 green.
- `bf-mid2` (the deck's summed 2A+H): 122 green.

## Side maps

The side maps' targets are a map's step lower (the main-map line's place, shifted 0.19 logits). The "after" means are against those lower targets. Every side fight counts as the map shown here for its enemy and Shield.

<!-- bf:side -->
| Side map | Parent | Counts as (enemy, Shield) | Fights on the curve | Green before | Mean win / target before | Green after | Mean win / target after |
|---|---|---|---|---|---|---|---|
| Clovermead | Thistlewood (Map 1) | Map 2 (your deck Map 1) | 5 | 5 | 68.7 / 68 | 5 | 66.1 / 64.4 |
| Lilypad Reach | Pebble Beach (Map 2) | Map 6 (your deck Map 6) | 7 | 7 | 68.9 / 70 | 7 | 69 / 70 |
| Basalt Foundry | Ashen Spurn (Map 19) | Map 20 (your deck Map 19) | 10 | 10 | 72.7 / 71.5 | 10 | 69.8 / 67.9 |
| The Sunken Depths | Coral Current (Map 10) | Map 11 (your deck Map 10) | 5 | 5 | 71.2 / 68 | 5 | 65.7 / 64.4 |
| Smugglers' Grotto | Pebble Beach (Map 2) | Map 3 (your deck Map 2) | 4 | 4 | 68.5 / 66.3 | 4 | 67.3 / 62.6 |
| The Mycelium Deep | The Morel Hollow (Map 7) | Map 8 (your deck Map 7) | 5 | 5 | 67.8 / 68 | 5 | 66.2 / 64.4 |
| The Canopy | Savanna Reaches (Map 14) | Map 15 (your deck Map 14) | 5 | 5 | 65.8 / 68 | 5 | 61.7 / 64.4 |
| Eye of the Volcano | The Sundered Peak (Map 20) | Map 21 (your deck Map 20) | 7 | 6 | 81.2 / 70 | 6 | 77.4 / 66.4 |
| The Sunken Grove | Gatorback Swamp (Map 5) | Map 6 (your deck Map 5) | 4 | 4 | 64.8 / 66.3 | 4 | 64.1 / 62.6 |
| The Glimmer Depths | Caves & Alcoves (Map 8) | Map 9 (your deck Map 8) | 4 | 4 | 66.5 / 66.3 | 4 | 64.4 / 62.6 |
| The Aerie Vault | Eyrie Heights (Map 11) | Map 12 (your deck Map 11) | 4 | 4 | 69 / 66.3 | 4 | 64.6 / 62.6 |
| The Ice Hollow | Wolfsbane Tundra (Map 17) | Map 18 (your deck Map 17) | 4 | 4 | 66.5 / 66.3 | 4 | 65.6 / 62.6 |
| The Old Bramble | Bramblewood Outskirts (Map 0) | Map 17 (your deck Map 17) | 4 | 4 | 67.3 / 66.3 | 4 | 69.4 / 66.3 |
| The Pale Desert | The Glass Dunes (Map 18) | Map 19 (your deck Map 18) | 9 | 9 | 71 / 71.1 | 9 | 68.3 / 67.5 |

## What the retune changed

**54 fights changed:** 35 on main maps (Maps 9–24) and 19 on side maps. 45 got CPU deck moves, mostly one swap or add of 1–2 copies, inside the map's theme and the road's rarity cap. 13 got a Shield override; none is over 2× the rule. No Health was lowered and no card's stats changed.

The rounds:
- **Round 1:** 60 games, tune seeds 7300.
- **Round 2:** 90 games, seeds 7300, the Shield capped at 2× the rule.
- **Round 3:** 120 games on the measure seeds 9100, for the fights the first two left a few points off.

The fixes are in `docs/balance/bf-curve-fixes*.jsonl`.

Main maps retuned:

| Map | Fights |
|---|---|
| 9 | 9-4 |
| 10 | 10-1 |
| 11 | 11-3, 11-8 |
| 12 | 12-3, 12-5, 12-7 |
| 13 | 13-1 |
| 14 | 14-3, 14-5, 14-7 |
| 15 | 15-4, 15-5, 15-6 |
| 16 | 16-4, 16-6 |
| 17 | 17-6, 17-7 |
| 18 | 18-5, 18-6 |
| 20 | 20-4, 20-8, 20-9 |
| 21 | 21-2, 21-3, 21-4, 21-6 |
| 22 | 22-2, 22-3, 22-7, 22-8 |
| 23 | 23-2, 23-3, 23-4 |
| 24 | 24-8 |

Maps 0–8 needed nothing, because the Forge is shut there and the enemy's old line is reproduced on its own deck.

<!-- bf:fixes -->
| Round | Fight | Kind | Target | Before the round | Tuned to | Moves | Shield | Health |
|---|---|---|---|---|---|---|---|---|
| 1 | 10-1 Clownfish Shoal | skirmish | 90 | 81.7 | 86.7 | swap nautilus-drifter → glass-octopus ×1 | – | – |
| 1 | 9-4 Kelp Curtains | skirmish | 72 | 61.7 | 71.7 | – | 4 | – |
| 1 | 12-5 Quillback Hold | elite | 66 | 78.3 | 66.7 | swap badger-sapper → quillguard ×2 | – | – |
| 1 | 14-5 Giraffe Vanguard | elite | 70 | 60 | 68.3 | swap savanna-cheetah → termite-mound ×2 | – | – |
| 1 | 12-3 Warren Run | skirmish | 78 | 63.3 | 78.3 | swap buck-brawler → harvest-mouse ×2 | – | – |
| 1 | 15-6 The Kennels | elite | 60 | 79.2 | 60 | swap shieldbearer-hound → stable-colt ×2 | – | – |
| 1 | 17-7 Alpha Howler's Den | elite | 60 | 70.8 | 63.3 | swap ice-crevasse-wolf → arctic-fox-raider ×2 | – | – |
| 1 | 14-3 Howler Canopy | skirmish | 80 | 70.8 | 81.7 | swap marula-monkey → termite-mound ×2 | – | – |
| 1 | 20-8 The Iron Cataphract | elite | 60 | 80 | 60 | swap blessed-avatar → magma-salamander ×2 | – | – |
| 1 | 15-5 Charge of the Warhorses | elite | 66 | 89.2 | 65 | add raccoon-nightcrew ×1 | – | – |
| 1 | 21-4 The Avalanche's Wake | elite | 67.5 | 51.7 | 70 | swap mountain-goat-climber → glacier-yak ×2 | – | – |
| 1 | 22-7 The Steam Wall | elite | 60 | 45.8 | 56.7 | swap glacier-wolf-pack → magma-titan ×2 | – | – |
| 1 | 19-A-8 Titan's Shadow | elite | 59.3 | 73.3 | 60 | swap magma-titan → tide-spirit ×1 | – | – |
| 1 | 14-A-3 Sloth Boughs | skirmish | 65.9 | 75 | 65 | swap ancient-sloth-titan → savanna-cheetah ×2 | – | – |
| 1 | 17-6 Glacier Herd | elite | 65 | 55.8 | 65 | swap harp-seal-pup → glacial-ape-king ×1; swap krill-swarm → permafrost-mammoth ×2 | – | – |
| 1 | 21-3 Cloud Ledge | skirmish | 75 | 59.2 | 76.7 | swap scree-goat → glacier-yak ×1 | – | – |
| 1 | 20-A-6 The Vent Crabs | elite | 61.6 | 73.3 | 61.7 | – | 48 | – |
| 1 | 22-3 Frozen Lava Flow | skirmish | 80 | 67.5 | 76.7 | – | 14 | – |
| 1 | 11-A-4 The Roost Mother | boss | 35.5 | 48.3 | 36.7 | add mountain-goat-climber ×2 | – | – |
| 1 | 18-A-6 The Salt Pan | skirmish | 64.4 | 76.7 | 63.3 | swap fennec-fox → komodo-warlord ×2 | – | – |
| 1 | 23-3 Elephant Road | skirmish | 80 | 60 | 78.3 | swap pack-mule → mouse-sapper ×2; swap stable-colt → mouse-sapper ×1 | – | – |
| 1 | 19-A-3 Slag Runners | skirmish | 79.6 | 88.3 | 76.7 | add cinder-imp ×2 | – | – |
| 1 | 7-A-2 Glowcap Grotto | skirmish | 76.8 | 89.2 | 73.3 | add trapdoor-spider ×2 | – | – |
| 1 | 20-A-5 Scorched Boars | elite | 68 | 83.3 | 71.7 | swap gorge-wyrm → cinder-imp ×2 | – | – |
| 1 | 11-A-2 Feather Drifts | skirmish | 71.3 | 87.5 | 71.7 | add eagle-owl-quartermaster ×2 | – | – |
| 1 | 0-B-2 The Briar Ring | skirmish | 75 | 54.2 | 73.3 | swap trash-panda-trickster → otter-kit ×2; swap burrow-rabbit → otter-kit ×1 | – | – |
| 1 | 11-8 Summit Approach | elite | 63.8 | 75.8 | 65 | swap alpine-avalanche → wound-reaver ×1 | – | – |
| 1 | 12-7 The Briar Queen | miniboss | 40 | 49.2 | 40 | – | 31 | – |
| 1 | 13-1 Cub Clearing | skirmish | 90 | 79.2 | 88.3 | swap bear-cub → swift-fox ×2; swap fawn-scout → swift-fox ×1 | – | – |
| 1 | 18-5 Obsidian Nest | elite | 66 | 75.8 | 70 | swap dust-hyena → komodo-warlord ×2 | – | – |
| 1 | 15-4 Archer Hill | skirmish | 72 | 84.2 | 71.7 | swap shieldbearer-hound → war-hound ×2 | – | – |
| 1 | 20-9 The Ancient Sloth Titan | boss | 50 | 67.5 | 53.3 | add cinder-stoker ×2 | – | – |
| 1 | 21-6 The Cathedral Eagle | miniboss | 40 | 18.3 | 36.7 | remove ur-elk ×2; swap alpine-avalanche → snow-owl-sentinel ×1 | – | – |
| 1 | 24-8 The Magnate Duck | miniboss | 40 | 54.2 | 43.3 | swap goose-sentry → battlement-heron ×1 | – | – |
| 1 | 10-A-3 Cargo Hold | skirmish | 65.9 | 76.7 | 65 | – | 17 | – |
| 1 | 20-A-1 The Ash Ossuary | elite | 88.2 | 80 | 85 | – | 15 | – |
| 1 | 20-A-7 Ash Condor Roost | elite | 55.4 | 71.7 | 56.7 | add gorge-wyrm ×2 | – | – |
| 1 | 17-A-3 The Rime Hall | skirmish | 55.4 | 69.2 | 53.3 | swap krill-swarm → ravenous-wolverine ×1 | – | – |
| 1 | 21-2 Tarn Shore | skirmish | 82.5 | 69.2 | 80 | swap peak-condor → glacier-yak ×2; swap pika-hoarder → snowshoe-hare ×2 | – | – |
| 1 | 22-2 Steam Vents | skirmish | 85 | 73.3 | 81.7 | swap ember-centipede → magma-titan ×2 | – | – |
| 1 | 23-2 Trench Works | skirmish | 85 | 75 | 81.7 | swap beetle-battering-ram → mouse-sapper ×1 | – | – |
| 1 | 1-A-2 Bee Lines | skirmish | 76.8 | 93.3 | 80 | add burrow-rabbit ×2 | – | – |
| 1 | 10-A-5 The Ferry's Last Passenger | boss | 35.5 | 48.3 | 38.3 | add tide-pool-crab ×2 | – | – |
| 1 | 8-A-1 Crystal Stair | skirmish | 88.2 | 69.2 | 85 | swap cave-olm → glowworm-cluster ×2; remove echo-screecher ×2 | – | – |
| 1 | 17-A-4 The Hollow King | boss | 35.5 | 51.7 | 35 | – | 81 | – |
| 1 | 16-6 Reaver's Hollow | elite | 60 | 70.8 | 66.7 (off) | swap tundra-musk-ox → ravenous-wolverine ×2; swap wolf-pack-runner → tundra-musk-ox ×2 | 47 | – |
| 2 | 16-4 Lynx Shadow | skirmish | 72 | 82.5 | 74.4 | – | 28 | – |
| 2 | 17-7 Alpha Howler's Den | elite | 60 | 69.2 | 60 | – | 47 | – |
| 2 | 18-6 Komodo Wallow | elite | 60 | 69.2 | 63.3 | swap antlion-pit → fennec-fox ×1 | – | – |
| 2 | 1-A-2 Bee Lines | skirmish | 76.8 | 87.5 | 78.9 | swap harvest-mouse → burrow-rabbit ×2 | – | – |
| 2 | 17-A-3 The Rime Hall | skirmish | 55.4 | 75 | 58.9 | add harp-seal-pup ×2 | – | – |
| 2 | 20-4 Shrine Steps | skirmish | 77.1 | 67.5 | 76.7 | – | 1 | – |
| 2 | 24-8 The Magnate Duck | miniboss | 40 | 55 | 43.3 | add mallard-halberdier ×2 | – | – |
| 2 | 7-A-2 Glowcap Grotto | skirmish | 76.8 | 66.7 | 78.9 | swap nightshade-moth → garden-snail ×2 | – | – |
| 3 | 14-7 The Cheetah Matriarch | elite | 60 | 50.8 | 59.2 | swap spitting-cobra → termite-mound ×2 | – | – |
| 3 | 18-5 Obsidian Nest | elite | 66 | 75.8 | 66.7 | swap glasswing-moth → quicksand-queen ×2 | – | – |
| 3 | 11-3 Cliffside Herd | skirmish | 82.5 | 92.5 | 80 | swap rockslide-ram → wound-reaver ×2 | – | – |
| 3 | 21-2 Tarn Shore | skirmish | 82.5 | 73.3 | 81.7 | – | 12 | – |
| 3 | 23-4 Siege Camp | skirmish | 75 | 65.8 | 71.7 | swap siege-rhino → mouse-sapper ×2 | – | – |
| 3 | 17-A-3 The Rime Hall | skirmish | 55.4 | 72.5 | 55.8 | add krill-swarm ×2 | 19 | – |
| 3 | 18-6 Komodo Wallow | elite | 60 | 71.7 | 63.3 | add rabid-jackal ×2 | – | – |
| 3 | 22-8 The Rimeheart Colossus | miniboss | 40 | 25.8 | 42.5 | remove snow-owl-sentinel ×2 | – | – |
| 3 | 1-A-2 Bee Lines | skirmish | 76.8 | 85.8 | 75.8 | swap harvest-mouse → ash-cloud-condor ×1 | – | – |
| 3 | 18-A-9 The Quicksand Queen | boss | 35.5 | 49.2 | 35 | swap sand-widow → quicksand-queen ×2 | – | – |

## Absolute difficulty (the LV yardsticks)

The four frozen yardstick decks played every main-map fight again: 48 games each, seeds 6100 + 37g (`docs/balance/bf-abs.jsonl`, `docs/balance/level-curve-fit-bf.json`).

Their decks are frozen, but their levels now mean the BF curve:
- Y16 is Lv 3 and rates 2.79 (LV: 2.52).
- Y24 is Lv 6 and rates 5.79 (LV: 4.23).

So the scale stretches at the top. From Map 1, the road's map level rises **0.266 DR a map with r² 0.87** (LV after: 0.189, r² 0.8): still one straight climb, a little steeper.

The same two bumps stay:
- Map 13 (reference decks that counter their own map; LV's owner call);
- Map 20.

| Map | Map level, LV after | Map level, BF after |
|---|---|---|
| 0 | -3.43 | -3.52 |
| 1 | 0.64 | 0.87 |
| 2 | 0.27 | 0.43 |
| 3 | -0.03 | 0.11 |
| 4 | -0.35 | -0.17 |
| 5 | 0.46 | 0.75 |
| 6 | 0.54 | 0.64 |
| 7 | 0.23 | 0.4 |
| 8 | -0.26 | -0.01 |
| 9 | 1.64 | 1.64 |
| 10 | 2.04 | 2.2 |
| 11 | 2.13 | 2.86 |
| 12 | 2.55 | 3.31 |
| 13 | 3.89 | 4.45 |
| 14 | 2.34 | 2.46 |
| 15 | 2.08 | 2.77 |
| 16 | 2.72 | 3.09 |
| 17 | 2.71 | 3.49 |
| 18 | 2.86 | 4.1 |
| 19 | 2.43 | 3.68 |
| 20 | 4.42 | 5.43 |
| 21 | 3.82 | 5.52 |
| 22 | 3.59 | 5.56 |
| 23 | 3.59 | 5.14 |
| 24 | 3.97 | 6.02 |

## Owner calls

1. **The size of the new curve.** Each level adds the budget gain in points, whatever the card's size, so a small card gains far more in proportion: the Otter Centurion goes 3/5 → 11/18 by Lv 10, and the mean card gains +228% by Lv 10. The alternative is to scale the gain by how much of its budget the card already uses (2A+H+S over N). That would give every card about +90% by Lv 10.
2. **Base is read as the level-independent part** (20 + Rarity + Wait, Lumber and Ritual terms), as the brief said. If you meant Base to be v3's Level 1 N, every card's N rises by about 2 × 1.05.
3. **Level 1 of a Lv 0 card gains nothing** on most Base cards. Its bank (about 2.3 points) is a third short of a point, so the Nest's Lv 0 → 1 training shows no stat change until Lv 2 (which then takes about 5). Making Level 1 a minor would fix it.
4. **16-6 Reaver's Hollow** stays easy at its 2× Shield cap. You can raise the cap for it, or accept it.
5. **The old curve's whole-Lv-2 gap.** Under the old steps, a whole Lv 2 had Lv 1's stats, so Map 8's enemy had none of its +5%. The pace rule keeps that ratio, so an enemy counted at exactly Map 8 is a hair weaker than at Map 7.75. One case is Murgle Mayhem floor 3 (Lv 1 against 1.13 for the same deck on Map 6). Dropping the gap would make Map 8 a little harder and need a retune there.
6. **Side maps' `aheadMaps`** is 1 on every side map today. A map can be set to 2 or more (for example the post-boss Volcano Lair or the Eye) if it should sit further ahead.
