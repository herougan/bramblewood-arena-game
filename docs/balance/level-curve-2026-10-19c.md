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

## The road on v5 and BU's engine

- **Before:** v4's tuned road, re-measured on main's engine after package BU's centre-column rule (`skirmish-pass-bf-after-v4-bu.jsonl`).
- **Untuned:** v5 with no per-fight change (`bf2-mid`).
- **After:** the BF2 retune (`bf-after`; fresh seeds 5100 in `bf-fresh`).

Each run is 120 games a fight. The targets are unchanged: 90% → 60% before the boss, and the boss at 30–49%. Side maps sit a map's step lower.

| | v4 on BU's engine | v5 untuned | v5 after the retune | After, fresh seeds |
|---|---|---|---|---|
| Main-map fights green (179) | 176 | 154 | **178** | 151 |
| Side-map fights on the curve green (77) | 72 | 63 | **76** | 62 |

**The retune:** 38 fights were tuned in one round, at 90 games on the measure seeds, with the Shield capped at 2× the rule.
- 25 were on main maps: 9-2, 11-4, 11-6, 15-4, 1-5, 10-1, 15-6, 11-5, 14-3, 15-5, 16-4, 17-4, 20-6, 21-4, 21-6, 22-5, 23-3, 24-6, 16-6, 17-7, 20-8, 21-5, 22-2, 22-8, 24-2.
- 13 were on side maps: 19-A-4, 20-A-5, 8-A-1, 0-B-2, 18-A-5, 2-A-2, 18-A-7, 7-A-3, 5-A-4, 8-A-4, 18-A-4, 18-A-6, 18-A-8.
- Shield overrides: 18-A-5 32, 5-A-4 34, 18-A-4 4. None is over 2× the rule.
- No Health was lowered and no card's stats changed.

**Still off:**
- **16-6 Reaver's Hollow:** easy at its 2× Shield cap, as after BF.
- **20-A-4:** the four-wave dungeon fight, which can't be simulated; not tuned.

**Tests:** the card-pass re-measures are allowed 3 points against their record, because BU's engine rule nudges every simulated game. The road measures above are re-recorded on main's engine, so the level-curve test's live replays (5-3, 17-4) match their file exactly.

<!-- bf:maps -->
| Map | Name | Fights | Green before | Mean win before | Green, new curve untuned | Mean win untuned | Green after | Mean win after | Mean target |
|---|---|---|---|---|---|---|---|---|---|
| 0 | Bramblewood Outskirts | 4 | 4 | 66.7 | 4 | 66.7 | 4 | 66.7 | 67.5 |
| 1 | Thistlewood | 5 | 4 | 71 | 4 | 71 | 5 | 68.5 | 68 |
| 2 | Pebble Beach | 5 | 5 | 67.7 | 5 | 67.7 | 5 | 67.7 | 68 |
| 3 | Gannet Cliffs | 7 | 7 | 71.3 | 7 | 71.3 | 7 | 71.3 | 70 |
| 4 | Sunken Hollow | 5 | 5 | 66 | 5 | 66 | 5 | 66 | 68 |
| 5 | Gatorback Swamp | 7 | 7 | 69 | 7 | 70.5 | 7 | 70.5 | 70 |
| 6 | Sable Swampmire | 8 | 8 | 70.5 | 8 | 71.7 | 8 | 71.7 | 70.6 |
| 7 | The Morel Hollow | 6 | 6 | 69.7 | 6 | 69.3 | 6 | 69.3 | 69.2 |
| 8 | Caves & Alcoves | 8 | 8 | 67.7 | 8 | 67.8 | 8 | 67.8 | 70.6 |
| 9 | The Kelp Mangroves | 7 | 7 | 66.8 | 6 | 67.5 | 7 | 69.3 | 70 |
| 10 | Coral Current | 9 | 9 | 72.6 | 8 | 71.3 | 9 | 70.8 | 71.1 |
| 11 | Eyrie Heights | 10 | 10 | 71.8 | 7 | 72.4 | 10 | 74.3 | 71.5 |
| 12 | The Briar Maze | 7 | 7 | 73.2 | 7 | 70.8 | 7 | 70.8 | 70 |
| 13 | The Redwood Deep | 8 | 8 | 70.2 | 8 | 69.8 | 8 | 69.8 | 70.6 |
| 14 | Savanna Reaches | 8 | 8 | 68.6 | 7 | 70 | 8 | 69 | 70.6 |
| 15 | The Long Grass | 7 | 7 | 70.1 | 4 | 61.6 | 7 | 67.6 | 70 |
| 16 | The Pinewood Taiga | 7 | 6 | 74.9 | 5 | 69.8 | 6 | 69.8 | 70 |
| 17 | Wolfsbane Tundra | 8 | 8 | 71.5 | 6 | 69 | 8 | 70.9 | 70.6 |
| 18 | The Glass Dunes | 7 | 7 | 69.9 | 7 | 70.4 | 7 | 70.4 | 70 |
| 19 | Ashen Spurn | 6 | 6 | 67.4 | 6 | 70.1 | 6 | 70.1 | 69.2 |
| 20 | The Sundered Peak | 10 | 9 | 71.3 | 8 | 67.2 | 10 | 68.6 | 69 |
| 21 | The Quiet Summit | 6 | 6 | 65.7 | 3 | 80.7 | 6 | 71.3 | 69.2 |
| 22 | The Rimefire Caldera | 8 | 8 | 69.9 | 5 | 78.3 | 8 | 72.9 | 70.6 |
| 23 | The Goldfeather Siege | 8 | 8 | 70 | 7 | 71.8 | 8 | 69.9 | 70.6 |
| 24 | Goldfeather Keep | 8 | 8 | 69.9 | 6 | 66.7 | 8 | 69.2 | 70.6 |
| | **Main maps** | 179 | **176** | | **154** | | **178** | | |

## Side maps

<!-- bf:side -->
| Side map | Parent | Counts as (enemy, Shield) | Fights on the curve | Green before | Mean win / target before | Green after | Mean win / target after |
|---|---|---|---|---|---|---|---|
| Clovermead | Thistlewood (Map 1) | Map 2 (your deck Map 1) | 5 | 5 | 66.3 / 64.4 | 5 | 66.3 / 64.4 |
| Lilypad Reach | Pebble Beach (Map 2) | Map 6 (your deck Map 6) | 7 | 7 | 68.7 / 70 | 7 | 71 / 70 |
| Basalt Foundry | Ashen Spurn (Map 19) | Map 20 (your deck Map 19) | 10 | 10 | 69.7 / 67.9 | 10 | 67.9 / 67.9 |
| The Sunken Depths | Coral Current (Map 10) | Map 11 (your deck Map 10) | 5 | 5 | 65.3 / 64.4 | 5 | 67.5 / 64.4 |
| Smugglers' Grotto | Pebble Beach (Map 2) | Map 3 (your deck Map 2) | 4 | 4 | 67.5 / 62.6 | 4 | 67.5 / 62.6 |
| The Mycelium Deep | The Morel Hollow (Map 7) | Map 8 (your deck Map 7) | 5 | 4 | 67.5 / 64.4 | 5 | 63.3 / 64.4 |
| The Canopy | Savanna Reaches (Map 14) | Map 15 (your deck Map 14) | 5 | 5 | 61.5 / 64.4 | 5 | 63.7 / 64.4 |
| Eye of the Volcano | The Sundered Peak (Map 20) | Map 21 (your deck Map 20) | 7 | 6 | 77.5 / 66.4 | 6 | 78.5 / 66.4 |
| The Sunken Grove | Gatorback Swamp (Map 5) | Map 6 (your deck Map 5) | 4 | 3 | 64.4 / 62.6 | 4 | 64.4 / 62.6 |
| The Glimmer Depths | Caves & Alcoves (Map 8) | Map 9 (your deck Map 8) | 4 | 3 | 65.2 / 62.6 | 4 | 60 / 62.6 |
| The Aerie Vault | Eyrie Heights (Map 11) | Map 12 (your deck Map 11) | 4 | 4 | 64.8 / 62.6 | 4 | 64.2 / 62.6 |
| The Ice Hollow | Wolfsbane Tundra (Map 17) | Map 18 (your deck Map 17) | 4 | 4 | 65.6 / 62.6 | 4 | 61.3 / 62.6 |
| The Old Bramble | Bramblewood Outskirts (Map 0) | Map 17 (your deck Map 17) | 4 | 3 | 69.6 / 66.3 | 4 | 68.8 / 66.3 |
| The Pale Desert | The Glass Dunes (Map 18) | Map 19 (your deck Map 18) | 9 | 9 | 68.2 / 67.5 | 9 | 67.1 / 67.5 |

## The fights changed

<!-- bf:fixes -->
| Round | Fight | Kind | Target | Before the round | Tuned to | Moves | Shield | Health |
|---|---|---|---|---|---|---|---|---|
| 1 | 9-2 Monitor Roots | skirmish | 84 | 74.2 | 85.6 | swap swordfish-spearman → guppy ×2 | – | – |
| 1 | 11-4 Ridge Fork | skirmish | 78.8 | 66.7 | 78.9 | swap chipmunk-stockpiler → eyrie-warden ×1 | – | – |
| 1 | 11-6 East Ledge | elite | 71.3 | 81.7 | 72.2 | swap mountain-goat-climber → alpine-marmot ×1 | – | – |
| 1 | 15-4 Archer Hill | skirmish | 72 | 54.2 | 73.3 | swap squires-mount → shieldbearer-hound ×2 | – | – |
| 1 | 1-5 The Thistle Baron | elite | 40 | 49.2 | 37.8 | add hedgehog-scout ×2 | – | – |
| 1 | 10-1 Clownfish Shoal | skirmish | 90 | 98.3 | 93.3 | add mangrove-manatee ×2 | – | – |
| 1 | 15-6 The Kennels | elite | 60 | 51.7 | 57.8 | swap squires-mount → shieldbearer-hound ×2 | – | – |
| 1 | 11-5 West Ledge | elite | 75 | 59.2 | 72.2 | swap alpine-marmot → eyrie-warden ×2 | – | – |
| 1 | 14-3 Howler Canopy | skirmish | 80 | 90 | 82.2 | add slow-loris ×2 | – | – |
| 1 | 15-5 Charge of the Warhorses | elite | 66 | 45.8 | 67.8 | swap raccoon-nightcrew → trash-panda-trickster ×1 | – | – |
| 1 | 16-4 Lynx Shadow | skirmish | 72 | 62.5 | 68.9 | swap owl-sentinel → dhole-matriarch ×2 | – | – |
| 1 | 17-4 Lynx Ambush | skirmish | 75 | 66.7 | 76.7 | swap lone-grey-wolf → glacial-ape-king ×2 | – | – |
| 1 | 20-6 The Constrictor Sovereign | elite | 68.6 | 79.2 | 71.1 | swap blessed-avatar → ash-cloud-condor ×2 | – | – |
| 1 | 21-4 The Avalanche's Wake | elite | 67.5 | 84.2 | 67.8 | swap glacier-yak → chapel-tortoise ×2 | – | – |
| 1 | 21-6 The Cathedral Eagle | miniboss | 40 | 72.5 | 40 | swap mountain-goat-climber → ur-elk ×2 | – | – |
| 1 | 22-5 The Geyser Field | skirmish | 70 | 81.7 | 71.1 | swap permafrost-mammoth → snow-owl-sentinel ×1 | – | – |
| 1 | 23-3 Elephant Road | skirmish | 80 | 93.3 | 78.9 | add stable-colt ×2 | – | – |
| 1 | 24-6 The Gilded Guard | elite | 65 | 50 | 65.6 | swap gilded-swan-knight → golden-magpie ×2 | – | – |
| 1 | 19-A-4 Vent Skitter | skirmish | 75.5 | 65 | 72.2 | remove tide-spirit ×2 | – | – |
| 1 | 16-6 Reaver's Hollow | elite | 60 | 75.8 | 72.2 (off) | swap snowshoe-hare → walrus-icebreaker ×2 | – | – |
| 1 | 17-7 Alpha Howler's Den | elite | 60 | 50 | 56.7 | swap lone-grey-wolf → glacial-ape-king ×2 | – | – |
| 1 | 20-8 The Iron Cataphract | elite | 60 | 36.7 | 57.8 | swap fumarole-ibex → blessed-avatar ×2 | – | – |
| 1 | 21-5 Snow Owl Parliament | elite | 60 | 68.3 | 57.8 | swap glacier-yak → eagle-diver ×2 | – | – |
| 1 | 22-2 Steam Vents | skirmish | 85 | 95 | 85.6 | add cinder-gecko ×2 | – | – |
| 1 | 20-A-5 Scorched Boars | elite | 68 | 78.3 | 68.9 | add silverback-brawler ×2; swap magma-salamander → blessed-avatar ×2 | – | – |
| 1 | 8-A-1 Crystal Stair | skirmish | 88.2 | 74.2 | 88.9 | swap echo-screecher → glowworm-cluster ×2 | – | – |
| 1 | 22-8 The Rimeheart Colossus | miniboss | 40 | 65.8 | 43.3 | swap glacial-ape-king → ur-elk ×1 | – | – |
| 1 | 0-B-2 The Briar Ring | skirmish | 75 | 84.2 | 77.8 | add burrow-rabbit ×2 | – | – |
| 1 | 24-2 The Bailey | skirmish | 85 | 76.7 | 82.2 | remove gilded-swan-knight ×2 | – | – |
| 1 | 18-A-5 Vulture Road | skirmish | 69 | 60.8 | 68.9 | swap sand-widow → komodo-warlord ×2 | 32 | – |
| 1 | 2-A-2 Duck Row | skirmish | 84 | 73.3 | 85.6 | swap pond-duck → guppy ×2 | – | – |
| 1 | 18-A-7 Oryx Crossing | skirmish | 59.8 | 71.7 | 63.3 | add quicksand-queen ×2 | – | – |
| 1 | 7-A-3 Silk Gallery | elite | 65.9 | 74.2 | 65.6 | add ant-warrior ×2 | – | – |
| 1 | 5-A-4 The Grove Warden | boss | 35.5 | 47.5 | 41.1 (off) | swap caiman-hatchling → mangrove-mudskipper ×2 | 34 | – |
| 1 | 8-A-4 The Gem Hoarder | boss | 35.5 | 47.5 | 37.8 | swap blind-cave-fish → tunnel-ant ×2 | – | – |
| 1 | 18-A-4 Meerkat Warrens | skirmish | 73.6 | 64.2 | 73.3 | – | 4 | – |
| 1 | 18-A-6 The Salt Pan | skirmish | 64.4 | 81.7 | 62.2 | add rabid-jackal ×2 | – | – |
| 1 | 18-A-8 The Dry Well | elite | 55.4 | 65 | 58.9 | swap komodo-warlord → fennec-fox ×2 | – | – |

## Base's map term (owner 15:25)

> "Once its finished balancing, note that there is a Map * 0.2 number there."

**Base = 20 + Rarity + 6×Wait + 0.5×Wait² + 4×Lumber + 0.4×Lumber² + Ritual + 0.2 × Map.** This was committed on its own, after the v5 retune.

**Map** is the map where the card becomes obtainable (`cardObtainMap` in `arena_app.js`, the shared `mapCoef` 0.2):

| Source | Map |
|---|---|
| A map reward or a map's secret card | That map's number (a side map counts as its parent) |
| Pack cards, pool 1 and the Factions pool | 5 (the Hedgerow Pouch at the Traveller's Cart) |
| The Mystery Booster | 13 (the Wanderer's Camp) |
| Raid cards | 13 (the Raid Banner) |
| Nest egg cards | 3 |
| The Blacksmith's equipment | 11 (with the Forge) |
| Base, tutorial and quest cards, Easter eggs and unsorted cards | 0 |

- The tools and the hub read `canonical/card-obtain-maps.json` (`node tools/forge_curve_2026_10_19.js maps`; the test checks it is current). The pack, raid, Nest and Forge maps are checked against the unlock schedule (`FEATURE_SPOTS`).
- **The budget panel** shows it in the Base line: "Base = 20 + Rare 3 + Wait 6.5 + Lumber 4.4 + Map 12 × 0.2 = 2.4 = 36.3".

**At Level 1** (`docs/balance/budget-v5-map-term-2026-10-19.json`):
- 708 of 744 pass without the map term, and 718 pass with it. **10 move in, 0 move out.**
- At each card's own start level: Great Horned Owl (Map 15, N 55.08 → 58.18, 2A+H+S 57.81), Gorge Wyrm (Map 20, N 71.09 → 75.23, 2A+H+S 73.46), Cave Warlord (Map 20, N 88.97 → 93.1, 2A+H+S 91.44), Venomlord Serpent (Map 5, N 61.28 → 62.31, 2A+H+S 62.06), Sand Widow (Map 18, N 46.29 → 50.01, 2A+H+S 46.51), Permafrost Mammoth (Map 22, N 61.28 → 65.82, 2A+H+S 63.76), Barnacle Fortress (Map 9, N 33.17 → 35.03, 2A+H+S 33.7), Ember Revenant (Map 19, N 43.71 → 47.64, 2A+H+S 46.85), Sea Cucumber (Map 10, N 34.2 → 36.27, 2A+H+S 35.52), Giant Cave Huntsman (Map 8, N 42.99 → 44.64, 2A+H+S 43.47).
- **The post-balance queue** drops from 30 to 20 cards.

**What doesn't change:**
- **No card's stats changed.** The extra room is largest for late-map cards (Base +4.8 at Map 24, about +5 N), so more of them sit further under their budget. As the owner expected, that is room, not a fault.
- **The Forge curve barely moves.** The map term adds 0.2 × Map × L/30 to a level's gain: for a Map 20 card, 0.13 points a level. The mean card's Lv 10 gain is +99%, from +96%. The road was not re-measured for it.

## Owner calls

1. **L/5 instead of L/3.** No divisor reaches the 1.3× rule, because the absolute conversion favours cards that sit well under their budget. If that matters more than simplicity, use the proportional conversion (the side column above).
2. **16-6 Reaver's Hollow** stays easy at its 2× Shield cap.
3. **The old curve's whole-level gap** (Maps 8, 16 and 18 kept the stats of the step below) is still kept by the enemy's pace rule. Murgle Mayhem floor 3 is now Lv 1, against 1.56 for the same deck on its parent. Dropping the gap needs a retune of Maps 8, 16 and 18.
4. **Squared Wait and Lumber:** no change. The data shows high-Wait and high-Lumber cards under their bands, not over.
