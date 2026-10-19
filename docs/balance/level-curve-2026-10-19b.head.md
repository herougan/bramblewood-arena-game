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
