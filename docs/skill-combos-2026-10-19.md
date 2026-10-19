# Skill combos, 2026-10-19

Package DC (owner 08:10: "Have you tested & costed all skills yet? We can do a sample testing with duo-skill combos, 1,000–2,000 times.").

**905 skill pairs** on one unit, each against its two single skills (177 single runs), 919 games per pair on average (400–1800), 1235720 games in all (with the scenarios). Data: `docs/balance/skill-combos-2026-10-19.json`, the sheet `docs/skill-combos-2026-10-19.xlsx`; the scenario results are `measuredS` (with `measuredHow`) in `canonical/skill-costs.json` (`value` unchanged). The hub's 🧮 Skill costs tab has a Combos view.

## Coverage: is every skill costed?

332 entries in canonical/skill-costs.json (270 skills, 28 triggers, 28 actions, 3 modifiers, 3 shorthands); every engine trigger and action key has an entry.

| Status | Entries |
|---|---|
| measured by SW (20-copy decks) | 308 |
| measured here (scenarios, mixed decks) | 15 |
| off the scale (only a bound) | 3 |
| not measured (a reason each) | 6 |

**Measured here** (they had no number, or a number SW flagged):

| Entry | Before | Measured | SE | Conf | How |
|---|---|---|---|---|---|
| trigger `onAllySpawn` | 1.38 | 1.38 | 0.29 | high | scenario: every copy spawns a Bee Swarmling as it is played (On Spawn: Spawn), so the copies already on the field see an ally spawned |
| trigger `onEnemySpawn` | 2.26 | 2.26 | 0.41 | high | scenario: both decks spawn a Bee Swarmling with every unit played (On Spawn: Spawn), so the test unit sees enemies spawned; the bees of its own side keep the two decks even |
| trigger `onMove` | 1.7 | 1.7 | 0.42 | high | scenario: Restless on every copy (it steps toward a column with a foe), so the copies move |
| trigger `onHeal` | 2.73 | 2.73 | 0.59 | high | scenario: Regeneration 1 on every copy (a heal it gives itself counts) |
| trigger `onDiscard` | 0.96 | 0.96 | 2.1 | low | scenario: the CPU pitches a card a turn; On Discard can only pay resources or rebuild, so it runs as Rebuild 12 (the castle has 100 Health; Rebuild 4 moved nothing) and On Spawn: Rebuild 12 for the weight |
| trigger `onSacrifice` | 0.29 | 0.29 | 0.14 | high | scenario: Devour 3/3 on every copy: the CPU feeds it a hand card (40% of turns), which is sacrificed |
| trigger `onExile` | 1.14 | 1.14 | 0.12 | high | scenario: every copy exiles 2 cards from its graveyard as it is played (On Spawn: Exile from graveyard 2); On Exile can only pay resources or draw, so it runs as Draw 1 |
| trigger `onChainBreak` | 0.27 | 0.27 | 0.26 | low | scenario: Chained (breaks when the foe plays a unit) on every copy, so every copy breaks free on the foe's next play (live Chained cards break on damage; that version never broke often enough to measure) |
| trigger `onCharge` | 1.62 | 1.62 | 0.45 | medium | scenario: the Charge skill's own hook: Charge N - deal 2 to a random enemy (N = 1, 2, 3; the weight is at N = 2, as live cards print) — per N: N 1: 3.05, N 2: 1.62, N 3: 1.11 |
| action `exile` | 60.96 | 60.96 (still a bound) | 3.09 | low | damage-equivalent in a mixed deck: 5 copies among 20 vanilla, inverted on 5 copies of On Spawn: Damage D (D 0-48) vs SW's calibrated mix, 800 games a point; S = D × the damage action's measuredS per point (low confidence: the bridge puts this scale at 0.15-2.6x SW's); beyond the ladder on every baseline: more than Damage 48 (a kill a play), so only a bound |
| action `mindControl` | 60.96 | 60.96 (still a bound) | 3.09 | low | damage-equivalent in a mixed deck: 5 copies among 20 vanilla, inverted on 5 copies of On Spawn: Damage D (D 0-48) vs SW's calibrated mix, 800 games a point; S = D × the damage action's measuredS per point (low confidence: the bridge puts this scale at 0.15-2.6x SW's); beyond the ladder on every baseline: more than Damage 48 (a kill a play), so only a bound |
| skill `acidBolt` | 24.39 | 24.39 | 1.24 | low | damage-equivalent in a mixed deck: 5 copies among 20 vanilla, inverted on 5 copies of On Spawn: Damage D (D 0-48) vs SW's calibrated mix, 800 games a point; S = D × the damage action's measuredS per point (low confidence: the bridge puts this scale at 0.15-2.6x SW's) |
| skill `meteor` | 5.37 | 5.37 | 0.28 | low | damage-equivalent in a mixed deck: 5 copies among 20 vanilla, inverted on 5 copies of On Spawn: Damage D (D 0-48) vs SW's calibrated mix, 800 games a point; S = D × the damage action's measuredS per point (low confidence: the bridge puts this scale at 0.15-2.6x SW's); beyond the ladder on b2 (a bound there) |
| skill `tsunami` | 60.96 | 60.96 (still a bound) | 5.02 | low | damage-equivalent in a mixed deck: 5 copies among 20 vanilla, inverted on 5 copies of On Spawn: Damage D (D 0-48) vs SW's calibrated mix, 800 games a point; S = D × the damage action's measuredS per point (low confidence: the bridge puts this scale at 0.15-2.6x SW's); beyond the ladder on every baseline: more than Damage 48 (a kill a play), so only a bound |
| action `gain` | 16.12 | 16.12 | 1.58 | low | damage-equivalent in a mixed deck: 5 copies among 20 vanilla, inverted on 5 copies of On Spawn: Damage D (D 0-48) vs SW's calibrated mix, 800 games a point; S = D × the damage action's measuredS per point (low confidence: the bridge puts this scale at 0.15-2.6x SW's) |
| shorthand `bounty` | 11.52 | 11.52 | 0.76 | low | damage-equivalent in a mixed deck: 5 copies among 20 vanilla, inverted on 5 copies of On Spawn: Damage D (D 0-48) vs SW's calibrated mix, 800 games a point; S = D × the damage action's measuredS per point (low confidence: the bridge puts this scale at 0.15-2.6x SW's) |
| skill `crepuscular` | 3.72 | 3.72 | 0.51 | high | SW's measure in a fixed twilight ({"phase":"twilight"}), b2 |
| skill `crepuscularHp` | 0.22 | 0.22 | 0.51 | low | S(Crepuscular + Crepuscular Hp 1) − S(Crepuscular) in a fixed twilight, b2 |

Trigger scenarios per baseline (S of the trigger with its action, S of On Spawn with the same action and enabler, weight = their ratio):

| Trigger | Baseline | S | S (On Spawn) | Weight |
|---|---|---|---|---|
| `onAllySpawn` | b1 | 3.08 | 1.8 | 1.71 |
| `onAllySpawn` | b2 | 2.91 | 1.8 | 1.618 |
| `onAllySpawn` | b3 | 2.21 | 2.76 | 0.801 |
| `onEnemySpawn` | b1 | 4.21 | 1.42 | 2.962 |
| `onEnemySpawn` | b2 | 4.19 | 2.07 | 2.025 |
| `onEnemySpawn` | b3 | 4.3 | 2.4 | 1.79 |
| `onMove` | b1 | 2.15 | 0.9 | 2.374 |
| `onMove` | b2 | 2.92 | 2.09 | 1.395 |
| `onMove` | b3 | 3.91 | 2.91 | 1.343 |
| `onHeal` | b1 | 3.79 | 1 | 3.798 |
| `onHeal` | b2 | 4.48 | 1.75 | 2.555 |
| `onHeal` | b3 | 7.58 | 4.11 | 1.845 |
| `onDiscard` | b1 | 0.02 | 0.02 | – |
| `onDiscard` | b2 | 0.32 | 0.34 | 0.959 |
| `onDiscard` | b3 | 0.16 | 0.18 | – |
| `onSacrifice` | b1 | 0.66 | 1.88 | 0.355 |
| `onSacrifice` | b2 | 0.8 | 2.05 | 0.391 |
| `onSacrifice` | b3 | 0.26 | 2.39 | 0.11 |
| `onExile` | b1 | 4.22 | 3.19 | 1.323 |
| `onExile` | b2 | 4.06 | 3.85 | 1.053 |
| `onExile` | b3 | 4.91 | 4.74 | 1.037 |
| `onChainBreak` | b1 | 1.18 | 1.48 | 0.798 |
| `onChainBreak` | b2 | 0.04 | 1.85 | 0.021 |
| `onChainBreak` | b3 | 0 | 2.82 | 0 |
| `onCharge` n1 | b1 | 3.85 | 0.84 | 4.611 |
| `onCharge` n2 | b1 | 1.95 | 0.84 | 2.331 |
| `onCharge` n3 | b1 | 1.46 | 0.84 | 1.744 |
| `onCharge` n1 | b2 | 4.65 | 1.83 | 2.539 |
| `onCharge` n2 | b2 | 2.21 | 1.83 | 1.207 |
| `onCharge` n3 | b2 | 1.5 | 1.83 | 0.82 |
| `onCharge` n1 | b3 | 5 | 2.48 | 2.013 |
| `onCharge` n2 | b3 | 3.27 | 2.48 | 1.317 |
| `onCharge` n3 | b3 | 1.92 | 2.48 | 0.772 |

**Damage-equivalent vs 20 copies** (the bridge): entries SW measured with high confidence on 20-copy decks, measured here as a damage-equivalent (5 copies among 20 vanilla). A ratio near 1 means the damage-equivalents above sit on SW's scale; Damage 2 is the ladder's own self-check.

| Entry | Baseline | Damage-equivalent D | S (D × per point) | S, 20 copies (SW) | Ratio |
|---|---|---|---|---|---|
| `damage` | b2 | 2 | 2.54 | 2.52 | 1.01 |
| `damage` | b3 | 2 | 2.54 | 3.46 | 0.73 |
| `armor` | b2 | 0.47 | 0.6 | 2.74 | 0.22 |
| `armor` | b3 | 1.02 | 1.3 | 2.61 | 0.5 |
| `poison` | b2 | 0.72 | 0.92 | 6.54 | 0.14 |
| `poison` | b3 | 1.65 | 2.1 | 5.89 | 0.36 |
| `quick` | b2 | 1.9 | 2.41 | 3.9 | 0.62 |
| `quick` | b3 | 1.39 | 1.77 | 3.71 | 0.48 |
| `sweep` | b2 | 16.41 | 20.84 | 9.07 | 2.3 |
| `sweep` | b3 | 17.14 | 21.77 | 8.27 | 2.63 |

**Still open** (honest gaps):

- skill `hunterVs`: not measured — a parameter of Hunter (which status, no cost of its own); Hunter runs once per status (Poisoned, Bleeding, Exposed, Wet)
- skill `leader`: not measured — Leader only matters for skirmish leaders (a fight setup), not a played unit
- skill `prayer`: not measured — Prayer only pays with cards that need Prayer (prayerReq); a plain deck has none, so its worth is the deck's, not the unit's
- skill `tsunami`: off the scale (a bound) — damage-equivalent in a mixed deck: 5 copies among 20 vanilla, inverted on 5 copies of On Spawn: Damage D (D 0-48) vs SW's calibrated mix, 800 games a point; S = D × the damage action's measuredS per point (low confidence: the bridge puts this scale at 0.15-2.6x SW's); beyond the ladder on every baseline: more than Damage 48 (a kill a play), so only a bound
- skill `weakness`: not measured — Weakness (a damage type) needs a foe that deals that type; the plain decks deal physical damage only
- trigger `onAnyPlayed`: not measured — On Any Played has no engine hook yet (a reference value)
- action `positionBeam`: not measured — added to the table after the measurement runs (no measuredS yet; 2026-10-19 (package EE): per point of damage; the Galactic Condor's beam hits about two things (the unit across and the bramble from the centre, 1 to 4 units from a side, the row from the edge): 2 x Deal damage (1.27). Not measured yet)
- action `mindControl`: off the scale (a bound) — damage-equivalent in a mixed deck: 5 copies among 20 vanilla, inverted on 5 copies of On Spawn: Damage D (D 0-48) vs SW's calibrated mix, 800 games a point; S = D × the damage action's measuredS per point (low confidence: the bridge puts this scale at 0.15-2.6x SW's); beyond the ladder on every baseline: more than Damage 48 (a kill a play), so only a bound
- action `exile`: off the scale (a bound) — damage-equivalent in a mixed deck: 5 copies among 20 vanilla, inverted on 5 copies of On Spawn: Damage D (D 0-48) vs SW's calibrated mix, 800 games a point; S = D × the damage action's measuredS per point (low confidence: the bridge puts this scale at 0.15-2.6x SW's); beyond the ladder on every baseline: more than Damage 48 (a kill a play), so only a bound
- The damage-equivalents (Exile, Mind Control, Tsunami, Acid Bolt, Meteor, Gain, Bounty) are all **low confidence**: the bridge above puts that scale at 0.15–2.6× SW's 20-copy S depending on the kind of skill, so they rank these entries and bound the removals (5 copies of Exile, Mind Control or Tsunami beat 5 copies of Damage 48, a sure kill a play) but do not price them. Pricing a removal needs a removal yardstick (e.g. "Destroy a random enemy" as its own rung), not damage.
- On Discard (Rebuild only: weight 0.96 at b2, too small to divide on b1 and b3) and On Chain Break (0.27, one baseline off its range; and run with Chained breaking on the foe's play, because the live "breaks on damage" version never broke often enough to measure) stay low confidence.
- Cross-field pairs (two skills bound to different fields, e.g. Darksight + Tide on 2 cards) were not run: each needs a merged field and its own calibrated pool. Listed in the JSON (`skipped`).
- Pairs are measured on one baseline (b2, 4/14 Wait 2) at the value live cards print most; a pair's interaction on a 2/8 or a 6/22 can differ (SW's single-skill tables show how much a skill moves with the baseline).

## Method (pairs)

- **Which pairs**: all pairs among the 42 skills live cards print most (flying, tide, armor, nocturnal, poison, evasive, regen, quick, bleed, pounce, sweep, thorns, diurnal, guardian, arrow, onReadyGold, fork, inspiring, rage, scare, shell, stealth, ambush, daunt, fireArrow, onDeathSpawn, revive, supreme, brood, freeze, invisible, onReadyDamage, overwhelm, relic, backstab, explode, gash, immolation, molting, reach, taunt, venomous), every pair live cards print together on 2+ cards, and targeted pairs (the owner's examples: Poison + Proliferate, Flying + Arrow, Taunt + Thorns, and on-hit × multi-hit, Freeze + Frostbite, Remember + On Death: Exile, three null checks). Left out of the 40 (no effect alone and nothing on the same unit can switch them on): darksight (23 cards: bound to a field (dark): its live pairs only); dry (17 cards: bound to a field (heat): its live pairs only); swarm (13 cards: counts allies of its tribe (a test unit has no type)); pierce (10 cards: ignores the foe's Armor (the test opponents have none)); prayer (8 cards: Prayer only pays with cards that need Prayer (prayerReq); a plain deck has none, so its worth is the deck's, not the unit's); mountainClimber (7 cards: bound to a field (frost): its live pairs only); crabClaws (6 cards: changes who it may attack (no effect seen alone)); esprit (6 cards: grows when Kin arrive (a test unit has no type)); frostbite (6 cards: hurts Frozen foes (paired with Freeze below)); demolisher (5 cards: extra damage to the foe's Structures); wave (5 cards: bound to a field (tide): its live pairs only); illuminate (4 cards: bound to a field (night): its live pairs only); keenEye (4 cards: extra damage to Changelings); keenSense (4 cards: bound to a field (dark): its live pairs only); remember (4 cards: pays out of the Removal Zone (paired with On Death: Exile below)); sonar (4 cards: sees in the dark (dark field only)).
- **The unit**: b2 (4/14 Wait 2, Lumber 1, Common; Legendary when a skill is) + both skills at the value live cards print most, in the field a field-bound skill needs (Tide on a perma-tide, Nocturnal at night, Darksight in the dark, Dry in a heatwave, Mountain Climber in the frost).
- **Games**: a deck of 20 copies against SW's calibrated mix (5 glass cannons, 5 tanks, 5 flyers, 5 of the 0-cost swarm, the opponent vanilla wins about half against) with Health, then Attack, added to every foe until the deck wins half (bisection on whole points, then a 1/20 step: m of the 20 foes one point higher); less the vanilla unit's own crossing; S = (ΔHealth + 2 ΔAttack) / 2 (Budget-v3 units). Why not SW's vanilla mirror: 20 copies against 20 copies of one unit play near-deterministic games and Health counts only in whole hits, so small skills all read "one breakpoint"; the mix's four bodies smear the breakpoints. The win rates against the mirror and SW's reference pool are recorded too (the sheet), not averaged in. 40 games per point; every pair and both its singles play the same seeds against the same opponents (common random numbers).
- **Games per pair**: the pair's own run played 880 games (median; 400–1800); its interaction also rests on its two singles' runs (920 games each, median), so ~2720 games behind each interaction. The first 397 pairs searched their crossings from 0 (median 1000 games); the other 508 started from the sum of their singles' crossings (median 840 games): every batch is the same seeds whichever order it is asked in, so the crossing is the same one (checked on two pairs: identical S, 1,520 → 1,280 and 1,160 → 760 games), only fewer batches are played.
- **Interaction** = S(A + B) − S(A) − S(B), all three measured here. **Noise, measured**: 20 pairs and 26 singles were run again on other seeds; one S moves ±0.51 and one interaction ±0.69 between seed sets (the solve's own error formula said ~0.05, far too small). Every interaction's standard error is floored at ±0.69. Confidence: high at |I| ≥ 3 SE (≥ 2.07), medium at ≥ 2 SE, low otherwise or when a solve ran off its range (a pair worth more than 8× the baseline's Health).
- **The comparison asked for** (the sum of single-skill measuredS): the sheet's "Sum SW" column adds SW's own single-skill runs (b2, same field, 40 games a point) and "Interaction vs SW" is the pair against that sum. The singles re-measured here are the fair yardstick (same seeds, same opponent, same solver), so the headline uses them. The two yardsticks differ: over the 75 singles with a SW number the median gap is 1.75 (mean here − SW -1.44, root-mean-square 3.99), and a few skills differ a lot (supreme 7.72 here vs 30.18 SW, sap 3.56 here vs 15.07 SW, shell 2.68 here vs 9.74 SW, proliferate 0 here vs 6.98 SW). SW's S averages a head-to-head against the vanilla mirror with the reference pool, while this one solves against the calibrated mix only (one opponent, so the pair and its singles see the same games); a skill that crushes the mirror (Supreme) reads far higher in SW's. So "Interaction vs SW" mixes two yardsticks and is for reference; the synergy flags use the same-yardstick interaction.

## Top synergies (pair worth ≫ the sum of its singles)

| # | Pair | Field | S pair | S(A) | S(B) | Sum | Interaction | ×Sum | SE | Conf | Cards |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | freeze + rage | plain | 46.61 | 7.57 | 10.19 | 17.76 | **+28.85** | 2.62 | 0.69 | high |  |
| 2 | evasive + onReadyGold | plain | 27.25 | 6.74 | 5.93 | 12.67 | **+14.58** | 2.15 | 0.69 | high |  |
| 3 | evasive + freeze | plain | 26.17 | 6.74 | 7.57 | 14.31 | **+11.86** | 1.83 | 0.69 | high |  |
| 4 | onReadyGold + supreme | plain | 25.42 | 5.93 | 7.72 | 13.65 | **+11.77** | 1.86 | 0.69 | high |  |
| 5 | flying + onReadyGold | plain | 22.84 | 6.6 | 5.93 | 12.53 | **+10.31** | 1.82 | 0.69 | high | 1 |
| 6 | freeze + quick | plain | 20.32 | 7.57 | 2.53 | 10.1 | **+10.22** | 2.01 | 0.69 | high |  |
| 7 | arrow + freeze | plain | 22.49 | 5.71 | 7.57 | 13.28 | **+9.21** | 1.69 | 0.69 | high |  |
| 8 | fireArrow + freeze | plain | 22.49 | 5.71 | 7.57 | 13.28 | **+9.21** | 1.69 | 0.69 | high |  |
| 9 | freeze + sweep | plain | 22.21 | 7.57 | 6.07 | 13.64 | **+8.57** | 1.63 | 0.69 | high |  |
| 10 | freeze + onDeathSpawn | plain | 20.33 | 7.57 | 5.06 | 12.63 | **+7.7** | 1.61 | 0.69 | high |  |
| 11 | freeze + nocturnal | night | 10.43 | 1.51 | 1.38 | 2.89 | **+7.54** | 3.61 | 0.69 | high |  |
| 12 | freeze + venomous | plain | 18.8 | 7.57 | 4.12 | 11.69 | **+7.11** | 1.61 | 0.69 | high |  |
| 13 | arrow + supreme | plain | 20.4 | 5.71 | 7.72 | 13.43 | **+6.97** | 1.52 | 0.69 | high |  |
| 14 | fireArrow + supreme | plain | 20.4 | 5.71 | 7.72 | 13.43 | **+6.97** | 1.52 | 0.69 | high | 1 |
| 15 | supreme + venomous | plain | 18.13 | 7.72 | 4.12 | 11.84 | **+6.29** | 1.53 | 0.69 | high |  |
| 16 | onReadyGold + rage | plain | 22.33 | 5.93 | 10.19 | 16.12 | **+6.21** | 1.39 | 0.69 | high |  |
| 17 | flying + venomous | plain | 16.48 | 6.6 | 4.12 | 10.72 | **+5.76** | 1.54 | 0.69 | high |  |
| 18 | onDeathSpawn + revive | plain | 14.4 | 5.06 | 3.8 | 8.86 | **+5.54** | 1.63 | 0.69 | high |  |
| 19 | rage + supreme | plain | 23.29 | 10.19 | 7.72 | 17.91 | **+5.38** | 1.3 | 0.69 | high |  |
| 20 | rage + shell | plain | 18.24 | 10.19 | 2.68 | 12.87 | **+5.37** | 1.42 | 0.69 | high |  |

## Top anti-synergies (pair worth ≪ the sum)

| # | Pair | Field | S pair | S(A) | S(B) | Sum | Interaction | ×Sum | SE | Conf | Cards |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | backstab + fork | plain | 2.68 | 2.68 | 5.93 | 8.61 | **-5.93** | 0.31 | 0.69 | high |  |
| 2 | guardian + rage | plain | 8.39 | 2 | 10.19 | 12.19 | **-3.8** | 0.69 | 0.69 | high |  |
| 3 | fork + guardian | plain | 4.73 | 5.93 | 2 | 7.93 | **-3.2** | 0.6 | 0.69 | high |  |
| 4 | darksight + keenSense | dark | 3.31 | 3.31 | 3.19 | 6.5 | **-3.19** | 0.51 | 0.69 | high | 3 |
| 5 | armor + freeze | plain | 7.12 | 2.54 | 7.57 | 10.11 | **-2.99** | 0.7 | 0.69 | high | 2 |
| 6 | freeze + scare | plain | 7.12 | 7.57 | 2.54 | 10.11 | **-2.99** | 0.7 | 0.69 | high | 1 |
| 7 | invisible + thorns | plain | 7.23 | 4.34 | 5.51 | 9.85 | **-2.62** | 0.73 | 0.69 | high |  |
| 8 | daunt + freeze | plain | 7.57 | 2.55 | 7.57 | 10.12 | **-2.55** | 0.75 | 0.69 | high |  |
| 9 | brood + guardian | plain | 2.52 | 2.95 | 2 | 4.95 | **-2.43** | 0.51 | 0.69 | high |  |
| 10 | onDeathSpawn + relic | plain | 4.9 | 5.06 | 2.17 | 7.23 | **-2.33** | 0.68 | 0.69 | high |  |
| 11 | daunt + rage | plain | 10.57 | 2.55 | 10.19 | 12.74 | **-2.17** | 0.83 | 0.69 | high |  |
| 12 | invisible + pounce | plain | 5.47 | 4.34 | 3.27 | 7.61 | **-2.14** | 0.72 | 0.69 | high |  |
| 13 | gash + invisible | plain | 5.73 | 3.28 | 4.34 | 7.62 | **-1.89** | 0.75 | 0.69 | medium |  |
| 14 | fork + sweep | plain | 10.17 | 5.93 | 6.07 | 12 | **-1.83** | 0.85 | 0.69 | medium |  |
| 15 | gash + pounce | plain | 4.74 | 3.28 | 3.27 | 6.55 | **-1.81** | 0.72 | 0.69 | medium |  |
| 16 | gash + thorns | plain | 6.99 | 3.28 | 5.51 | 8.79 | **-1.8** | 0.8 | 0.69 | medium |  |
| 17 | daunt + onReadyDamage | plain | 3.14 | 2.55 | 2.36 | 4.91 | **-1.77** | 0.64 | 0.69 | medium | 2 |
| 18 | sweep + thorns | plain | 9.81 | 6.07 | 5.51 | 11.58 | **-1.77** | 0.85 | 0.69 | medium |  |
| 19 | gash + onDeathSpawn | plain | 6.57 | 3.28 | 5.06 | 8.34 | **-1.77** | 0.79 | 0.69 | medium |  |
| 20 | rage + scare | plain | 10.99 | 10.19 | 2.54 | 12.73 | **-1.74** | 0.86 | 0.69 | medium |  |

## The owner's examples and checks

| Pair | S pair | Sum of singles | Interaction | Conf | Reading |
|---|---|---|---|---|---|
| poison + proliferate | 5.89 | 0.98 | +4.91 ± 0.69 | high | synergy |
| arrow + flying | 16.33 | 12.31 | +4.02 ± 0.69 | high | synergy |
| taunt + thorns | 4.31 | 4.88 | -0.57 ± null | low | additive within noise |
| guardian + thorns | 5.86 | 7.51 | -1.65 ± 0.69 | medium | anti-synergy |
| poison + twinStrike | 9.01 | 7.47 | +1.54 ± 0.69 | medium | synergy |
| freeze + frostbite | 7.57 | 7.57 | 0 ± 0.69 | low | additive within noise |
| poison + quick | 4.17 | 3.51 | +0.66 ± 0.69 | low | additive within noise |
| flying + reach | 6.6 | 6.34 | +0.26 ± null | low | additive within noise |
| arrow + pierce | 5.71 | 5.71 | 0 ± 0.69 | low | additive within noise |
| flying + swarm | 6.6 | 6.6 | 0 ± 0.69 | low | additive within noise |
| crabClaws + stealth | -0.91 | 1.51 | -2.42 ± null | low | additive within noise |

**Wet + lightning** (a field that makes the foe Wet: +1 lightning damage per Wet counter; rain gives every unit one, the tide gives non-flyers one): S under the field − S in a plain field, b2.

| Skill | Plain | Rain | Tide | Rain − plain | Tide − plain |
|---|---|---|---|---|---|
| `electricity` | 2.86 | 3.73 | 4.45 | +0.87 | +1.59 |
| `lightning` | 3.37 | 4.17 | 4.05 | +0.8 | +0.68 |
| `shockBolt` | 9.82 | 9.11 | 13.24 | -0.71 | +3.42 |
| `chainLightning` | 6.74 | 7.5 | 8.78 | +0.76 | +2.04 |

## Interaction model

Fitted on the 697 pairs whose solves stayed in range (208 clamped pairs left out). Error of a pair's predicted worth (RMSE, in S; the replicate noise of one S is ±0.51, so ~0.88 of any RMSE here is noise):

| Model | RMSE |
|---|---|
| additive (S(A) + S(B)) | 2.26 |
| one global multiplier (× 1.11) | 2.09 |
| a multiplier per family pair (below; the global one where a family pair has < 3 pairs) | 1.75 |
| family multiplier + the per-pair adjustment table (in-sample: the table is these pairs, shrunk by their noise) | 0.64 |

**How the budget could use it**: S(card with skills A and B) = m(fam A, fam B) × (S(A) + S(B)), and for a pair in the adjustment table use S(A) + S(B) + adj instead. Families: evade (flying, evasive, stealth, invisible, swift, shadow); ranged (arrow, fireArrow, fireBolt, boomerang, volley, twinShot…); dot (poison, bleed, venomous, rabid, toxin, proliferate…); defense (armor, regen, shell, thorns, guardian, revive…); tempo (quick, ambush, pounce, haste, speed, fastForward); offense (sweep, rage, supreme, gash, immolation, twinStrike…); control (scare, daunt, freeze, stunOnHit, shock, sleep…); economy (onReadyGold, bounty, lumberjack, midas); summon (onDeathSpawn, brood, sprout, meiosis); aura (inspiring, rally, kinship, sociable); ready (onReadyDamage, explode, render); field (tide, nocturnal, darksight, dry, mountainClimber, wave…); anything else is "other".

| Family pair | Pairs | Multiplier m | Mean interaction |
|---|---|---|---|
| defense×offense | 30 | 1.049 | +0.48 |
| defense×other | 21 | 1.016 | +0.08 |
| defense×field | 21 | 1.106 | +0.47 |
| defense×dot | 18 | 1.014 | +0.07 |
| defense×evade | 18 | 1.005 | +0.05 |
| defense×tempo | 18 | 0.981 | -0.1 |
| control×defense | 17 | 0.906 | -0.67 |
| dot×offense | 17 | 1.15 | +1.23 |
| defense×defense | 15 | 0.971 | -0.18 |
| evade×offense | 15 | 1.135 | +1.69 |
| field×offense | 15 | 1.139 | +1.1 |
| offense×tempo | 15 | 1.03 | +0.26 |
| offense×other | 15 | 0.964 | -0.3 |
| evade×other | 14 | 1.094 | +0.72 |
| control×offense | 13 | 1.287 | +2.96 |
| defense×ranged | 12 | 1.03 | +0.26 |
| field×other | 12 | 1.213 | +0.68 |
| defense×summon | 12 | 1.007 | +0.05 |
| defense×ready | 12 | 0.916 | -0.54 |
| evade×field | 11 | 1.234 | +1.96 |
| field×tempo | 10 | 1.055 | +0.24 |
| offense×offense | 10 | 1.079 | +1.04 |
| control×other | 10 | 1.153 | +0.92 |
| dot×other | 10 | 1.137 | +0.47 |
| dot×field | 10 | 1.172 | +0.62 |
| control×field | 10 | 1.299 | +1.31 |
| offense×ranged | 10 | 1.139 | +1.71 |
| offense×summon | 10 | 1.015 | +0.16 |
| offense×ready | 10 | 0.952 | -0.48 |
| dot×evade | 9 | 1.346 | +2.64 |
| evade×tempo | 9 | 1.071 | +0.56 |
| dot×tempo | 9 | 1.146 | +0.54 |
| control×dot | 9 | 1.102 | +0.61 |
| control×tempo | 9 | 1.183 | +1.14 |
| other×tempo | 9 | 1.073 | +0.27 |
| other×ranged | 8 | 1.003 | +0.02 |
| control×evade | 8 | 1.152 | +1.38 |
| field×ranged | 7 | 0.958 | -0.27 |
| dot×dot | 7 | 1.546 | +1.04 |
| evade×ready | 7 | 1.037 | +0.35 |
| aura×defense | 6 | 1.055 | +0.24 |
| evade×ranged | 6 | 1.278 | +3.22 |
| evade×summon | 6 | 1.068 | +0.68 |
| control×ready | 6 | 0.884 | -0.87 |
| field×ready | 6 | 1.068 | +0.31 |
| dot×ranged | 6 | 0.962 | -0.28 |
| ranged×tempo | 6 | 1.083 | +0.64 |
| defense×economy | 6 | 1.196 | +1.78 |
| control×ranged | 6 | 1.249 | +2.48 |
| field×summon | 6 | 1.073 | +0.37 |
| dot×summon | 6 | 1 | 0 |
| summon×tempo | 6 | 0.906 | -0.56 |
| control×summon | 6 | 1.073 | +0.6 |
| dot×ready | 6 | 1.013 | +0.06 |
| ready×tempo | 6 | 0.94 | -0.32 |
| other×summon | 6 | 0.977 | -0.13 |
| other×ready | 6 | 1.009 | +0.05 |
| other×other | 5 | 1.132 | +0.54 |
| economy×offense | 5 | 1.456 | +5.74 |
| aura×offense | 5 | 1.203 | +1.59 |
| ranged×summon | 4 | 1.008 | +0.08 |
| ranged×ready | 4 | 0.904 | -0.87 |
| ready×summon | 4 | 0.918 | -0.6 |
| evade×evade | 3 | 1.066 | +0.77 |
| tempo×tempo | 3 | 1.107 | +0.42 |
| field×field | 3 | 0.87 | -0.58 |
| aura×field | 3 | 1.161 | +0.46 |
| economy×evade | 3 | 1.835 | +9.88 |
| economy×field | 3 | 1.132 | +0.95 |
| dot×economy | 3 | 1.271 | +2.07 |
| economy×tempo | 3 | 1.116 | +0.92 |
| aura×evade | 3 | 1.319 | +2.26 |
| aura×dot | 3 | 1.138 | +0.4 |
| aura×tempo | 3 | 1.332 | +1.05 |
| aura×control | 3 | 1.113 | +0.61 |
| control×control | 3 | 0.719 | -2.37 |
| economy×other | 3 | 1.175 | +1.33 |
| aura×other | 3 | 1.217 | +0.61 |

**Per-pair adjustment table** (the 30 largest of 273; adj = interaction × max(0, 1 − 1/z²), so a noisy one shrinks toward 0; all in the JSON):

| Pair | Field | adj | Interaction | SE |
|---|---|---|---|---|
| freeze + rage | plain | +28.83 | +28.85 | 0.69 |
| evasive + onReadyGold | plain | +14.55 | +14.58 | 0.69 |
| evasive + freeze | plain | +11.82 | +11.86 | 0.69 |
| onReadyGold + supreme | plain | +11.73 | +11.77 | 0.69 |
| flying + onReadyGold | plain | +10.26 | +10.31 | 0.69 |
| freeze + quick | plain | +10.17 | +10.22 | 0.69 |
| arrow + freeze | plain | +9.16 | +9.21 | 0.69 |
| fireArrow + freeze | plain | +9.16 | +9.21 | 0.69 |
| freeze + sweep | plain | +8.51 | +8.57 | 0.69 |
| freeze + onDeathSpawn | plain | +7.64 | +7.7 | 0.69 |
| freeze + nocturnal | night | +7.48 | +7.54 | 0.69 |
| freeze + venomous | plain | +7.04 | +7.11 | 0.69 |
| arrow + supreme | plain | +6.9 | +6.97 | 0.69 |
| fireArrow + supreme | plain | +6.9 | +6.97 | 0.69 |
| supreme + venomous | plain | +6.21 | +6.29 | 0.69 |
| onReadyGold + rage | plain | +6.13 | +6.21 | 0.69 |
| backstab + fork | plain | -5.85 | -5.93 | 0.69 |
| flying + venomous | plain | +5.68 | +5.76 | 0.69 |
| onDeathSpawn + revive | plain | +5.45 | +5.54 | 0.69 |
| rage + supreme | plain | +5.29 | +5.38 | 0.69 |
| rage + shell | plain | +5.28 | +5.37 | 0.69 |
| backstab + freeze | plain | +5.22 | +5.31 | 0.69 |
| onReadyGold + venomous | plain | +5.15 | +5.24 | 0.69 |
| poison + proliferate | plain | +4.81 | +4.91 | 0.69 |
| freeze + guardian | plain | +4.71 | +4.81 | 0.69 |
| shell + supreme | plain | +4.69 | +4.79 | 0.69 |
| invisible + onReadyGold | plain | +4.64 | +4.74 | 0.69 |
| T:onSpawn>drawCard + flying | plain | +4.45 | +4.55 | 0.69 |
| flying + fork | plain | +4.25 | +4.36 | 0.69 |
| freeze + relic | plain | +4.2 | +4.31 | 0.69 |

## Reading it

- An interaction is a property of these decks (20 copies of the pair unit against vanilla and the reference pool); a synergy that needs company (tribes, Prayer cards) still reads as additive here.
- Resolution: with 40 games a point a crossing moves in steps, so pairs where one skill decides the games read the same number (several Ambush pairs at 2.87, Freeze + Armor = Freeze + Scare = 7.12, Freeze + Daunt = Freeze alone). A solve that hit its range (8x the baseline's Health or Attack: Freeze + Fork, Taunt, Stealth) is a bound and its interaction is marked low.
- Large negative interactions often mean overlap rather than conflict: two answers to the same problem (two evasions, two ranged openers) are not worth both prices.
- Nothing in the game changed: `value` and every card's S stay as they were; the scenario numbers are `measuredS` the owner applies in the hub.
