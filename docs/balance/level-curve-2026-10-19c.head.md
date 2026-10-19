# Budget v5 and the softer Forge curve, 2026-10-19 (package BF2)

This replaces budget v4 and the Forge curve built on it (`docs/balance/level-curve-2026-10-19b.md`, package BF).

What the owner said:
- 13:52: "Oh shit to the balance. That's too much. ... maybe instead: (Base + L/3) * (1 + L/30) -> this should weaken Level's contribution significantly. Level 0 gives an additional minus 1. So if Base = 14, then at L1, N = (14+1/3) x (1+1/30) = 14.8 and at level 10, N = (14+10/3) x (1+10/30) = 23.1"
- 13:54: "if you think it favours weak cards too much (low rarity, wait, or resource count), then change it to L/4 or L/5."
- 13:57: the budget panel: "simplify this text. ... Say 5 < N = 20."
- 14:07: "There should be a Base = ..."
- 14:25: the Wait² and Lumber² terms may over-reward; "decrease either within the squaring or the 0.5 and 0.4 coeffs."

## Budget v5

| Part | Value |
|---|---|
| Base | 20 + Rarity + 6×Wait + 0.5×Wait² + 4×Lumber + 0.4×Lumber² + Ritual points (unchanged) |
| N(L), Level 1 and up | (Base + L/`levelLinDiv`) × (1 + L/`levelDiv`) |
| N(0) | Base − `zeroPenalty` |
| Numbers | `levelLinDiv` 5, `levelDiv` 30, `zeroPenalty` 1 |

- All the numbers live in `bramblewood-budget.js` and in `canonical/skill-costs.json` "budget". The game, the tools and the hub all read them from there.
- **The owner's example checks out.** With L/3, Base 14 gives (14 + 1/3)(1 + 1/30) = **14.81** at Level 1 and (14 + 10/3)(1 + 10/30) = **23.11** at Level 10. `tests/forge-curve-2026-10-19.js` checks both.

### L/3, L/4 or L/5 (the 13:54 check)

- **The two groups:**
  - Weak: Common, Wait 0–1, Lumber 0–1 (199 cards).
  - Strong: Rare or better with Wait 3+ and Lumber 3+ (16 cards).
  - The "Strong (or)" column is Rare or better with Wait 3+ or Lumber 3+ (43 cards).
- **How growth is measured:** mean 2A+H growth from Level 1 to Level 10, with the absolute conversion the game ships.

| Divisor | Weak cards' growth | Strong cards' growth | Weak / strong | Strong (or) | Weak / strong (or) |
|---|---|---|---|---|---|
| L/3 | +108% | +59% | 1.82 | +74% | 1.46 |
| L/4 | +99% | +57% | 1.74 | +71% | 1.40 |
| L/5 | +90% | +55% | **1.65** | +69% | **1.31** |

- **Win rate against the fixed card yardstick** (`card_balance.js`'s filler decks; 12 cards a group, 100 games, Level 1 → Level 10):
  - Weak cards go from 42.7% to 90.6% with L/3, 89.9% with L/4 and 89.8% with L/5 (+3.9 / +3.8 / +3.8 logits).
  - Strong cards stay at 31.6% → 31.8% with every divisor. That is the yardstick's known floor for 3+ Lumber cards (`docs/card-pass-2026-10-19.md`), so the win rate can't separate the divisors.
- **The choice: L/5.** No divisor meets the 1.3× rule on the strict grouping, and L/5 is the closest. On the wider grouping it is 1.31.
  - Most of the gap comes from the absolute conversion: a weak card sits far under its budget, so the same budget points are a bigger share of its stats.
  - The proportional conversion, Δstats = ΔN × (2A+H)/N(1), would give weak / strong 1.32 / 1.25 / 1.20 for L/3 / 4 / 5.
- `levelLinDiv` is the single constant to change.

### The squared Wait and Lumber terms (the 14:25 check)

**Are cards with a high Wait or Lumber given too much Base?** Each card's measured win rate (`docs/balance/card-balance.json`, the card-pass yardstick) is compared with the centre of its rarity band, and its budget use is 2A+H+S over v5's N:

| Group | Cards | Win rate minus band centre | Budget use |
|---|---|---|---|
| Wait 0–1 | 533 | −2.4 | 0.58 |
| Wait 2 | 116 | −6.3 | 0.69 |
| Wait 3+ | 84 | −18.0 | 0.75 |
| Lumber 0–1 | 611 | −2.1 | 0.57 |
| Lumber 2 | 79 | −13.8 | 0.80 |
| Lumber 3+ | 43 | −26.5 | 0.89 |

- High-Wait and high-Lumber cards use more of their budget and still win **less** than their rarity asks.
- **So the squared terms don't over-reward them: no change needed.** The coefficients stay 0.5×Wait² and 0.4×Lumber², named `perWait2` and `perLumber2` in the helper and in `skill-costs.json`.
- Lowering them would also widen the weak / strong growth gap above.

### Every measured card at Level 1

`docs/balance/budget-v5-2026-10-19.json`, `node tools/forge_curve_2026_10_19.js budget`:

| | Pass |
|---|---|
| v3 | 709 of 744 |
| v4 | 710 |
| v5 | 708 |

- **Against v3:** in, the Grovebearer Dragon-Turtle (N 95.9 → 97.24). Out, Sand Widow (46.6 → 46.29, 2A+H+S 46.51) and Barnacle Fortress (33.9 → 33.17, 2A+H+S 33.7).
- **Against v4:** none in. Out, Sand Widow and Bone Diviner (47.88 → 47.33, 2A+H+S 47.61).
- **N moves:**
  - v5 − v3 at Level 1 is −1.13 to +3.97 (the big Bases gain).
  - v5 − v4 is −2.68 to −0.13: v5 is a little under v4 everywhere at Level 1.
- **The post-balance queue** has 30 cards (was 28; `--check` passes). Two of them, Great Gate and Colony, fail even under the old skill costs: the formula put them over. No card's stats changed.

## The Forge curve on v5

- **The rules are unchanged:**
  - Each level banks v5's ΔN in 2A+H points.
  - The majors (4, 7, 10) and the limit break (11) spend the bank, always at least 1.
  - The minor (2) spends its bank.
  - Other levels spend a third.
  - Attack grows where it keeps the shape.
  - No level loses a stat.
  - Every level stays inside N(L).

  The game ships the absolute conversion. "Proportional" is the comparison the coordinator asked for: the printed stats × N(L)/N(1).

| Level | Otter Centurion (starts Lv 0) | proportional | Bramblewood Lynx | proportional | Quillguard | proportional |
|---|---|---|---|---|---|---|
| 1 | 3/5 | 3/5 | 6/6 | 6/6 | 3/22 | 3/22 |
| 2 (minor) | 4/6 | 3/5 | 6/7 | 6/6 | 3/23 | 3/23 |
| 4 (major) | 4/8 | 3/6 | 7/8 | 7/7 | 3/26 | 3/24 |
| 7 (major) | 5/10 | 4/6 | 9/8 | 7/7 | 4/29 | 4/27 |
| 10 (major) | 6/12 | 4/7 | 10/10 | 8/8 | 5/32 | 4/30 |
| 11 (limit) | 6/13 | 4/7 | 11/10 | 8/8 | 5/34 | 4/30 |

**The mean live card's 2A+H growth over Level 1:**

| Level | v5, L/5 | v5 with L/3 | v4 (BF) | The old steps |
|---|---|---|---|---|
| 2 | +5.7% | +8.9% | +19% | 0% |
| 4 | +27% | +33% | +65% | +10% |
| 10 | +96% | +110% | +228% | +35% |

## The budget panel (card editor, Test Lab, hub)

The owner's screenshot showed v3's text ("N = 20 + 2×Level …", "34.5 < N 39.9"), which was never updated. It now reads, for a Heroic Wait 1 Lumber 1 card at Level 1:

- **⚖️ Within budget · N = 39.4 (Base = 37.9)**
- Level 1 · Heroic · Wait 1 · Lumber 1
- Stats: (2×3 + 15 + 2 skills) × 1.5 = 34.5 < N = 39.4 ✓
- Product: (3×15 + 2) × 1.5 = 70.5 < (N/3)² = 172.2 ✓
- × 1.5: Flying makes about half the attacks at it miss, so its stats count half again. (This is the half-miss multiplier: Evasive, Swift, Flying, Shadow and Blind each ×1.5.)
- Base = 20 + Heroic 7 + Wait 6.5 + Lumber 4.4 = 37.9
- N = (Base + Level/5) × (1 + Level/30); Level 0: Base − 1. Base = 20 + Rarity + 6×Wait + 0.5×Wait² + 4×Lumber + 0.4×Lumber² + Ritual. (pink: under 60% of N, with a tooltip)

How it is built:
- **One source:** the numbers and the Base parts come from the shared helper (`BramblewoodBudget.nAt`, `baseParts`), so they always add up.
- **Translated:** every line is a TX key (`ui.budget-*`), translated in the 12 packs.
- **The Test Lab** has the same rule and formula lines and inputs for Level ÷ (5), Level growth ÷ (30) and Level 0 −.
- **Its settings start fresh:** saves are kept under a new key, so an old saved v4 or v3 formula can't come back. Saved skill costs carry over.
- **The hub's Skill costs tab** writes "34.5 < N = 39.4" in its cells and shows the formula line from the helper.
