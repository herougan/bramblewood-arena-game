# Skill worth, 2026-10-19

Package SW (owner 00:19: "defining the N-worth of skills. Only way is to run experiments with test units with each skill ... e.g. arrow does low dmg but allows you a chance to snipe glass cannons").

**1241 runs**, 608480 games (191 min, 40 games per point), engine as shipped today. Data: `docs/balance/skill-worth-2026-10-19.json`, the sheet `docs/skill-worth-2026-10-19.xlsx`, `measuredS` per entry in `canonical/skill-costs.json` (`value` unchanged; compare and apply in the hub's 🧮 Skill costs tab).

## Method

- **Test unit**: a vanilla baseline + one skill. Baselines (Lumber 1, Common): b1 2/8 Wait 1, b2 4/14 Wait 2, b3 6/22 Wait 3. The skill's value is the one live cards print most (pool cards skipped); skills that scale with N also run at 2–3 N on b2. Field-bound skills run in plain fields and under their field on b2 (night = {"phase":"night"}, tide = {"permaTide":true}, dark = {"dark":true}, rain = {"field":"rain"}, heat = {"field":"heatwave"}, frost = {"field":"frozen"}, moon = {"phase":"night","field":"moon"}, spore = {"sporeCloud":true}, thunder = {"thunderstorm":2}, roots = {"tangledRoots":true}).
- **Triggers** run as "deal 2 damage to a random enemy" (weight = S / S of On Spawn with the same action; On Spawn = 1 by construction). **Actions** run under a reference trigger with the parameters live cards use most (value = S / (that trigger's measured weight × the amount)). Modifiers and Bounty as ratios of their plain runs. The 10 trigger entries live cards use most are also measured as printed (trigger × action).
- **Games**: 20 copies of the test unit against 20 vanilla baselines (mirror) and against the reference pool — glass cannons (2A+1 Attack, low Health), tanks (A/2 Attack, high Health), flyers, a 0-cost Wait-0 swarm, a mix of those four (+ swimmers on the tide) — each calibrated so the vanilla baseline wins about half. Both seats the Smart CPU (aiAim), Open battles, the stall rule and round cap of the reference fights. Seeds are shared between the test deck and the vanilla decks (common random numbers); sides alternate.
- **Metrics** per copy that reached the field: damage to units and to the bramble, damage taken, damage avoided (dodges and blinded misses at the attacker's Attack, Armor and Shield soaks), kills, deaths, rounds survived, trigger firings, own misses.
- **Worth**: head-to-head, the Health (then Attack) a vanilla opponent needs for the skilled deck to win 50% (bisection on integers, interpolated); pool, the skilled deck's mean pool win rate inverted on the vanilla + ΔHealth / + ΔAttack curves. In Budget v3 units (2A + H + S < N): S_H = ΔHealth, S_A = 2 ΔAttack, S = (S_H + S_A) / 2, the run's S = mean of head-to-head and pool. A skill's measuredS is fitted in its own units (× N for scale n, × (1 + floor(N/2)) for scale half).
- **Confidence**: high / medium / low from the solve's standard error and the head-to-head vs pool disagreement; low whenever a solve hit its range (a skill worth more than +5× the baseline's stats, or a win rate the curves can't reach). The worth is a property of these decks: a skill that needs company (Prayer cards, resource spenders, tribes) reads near 0 here and says why.
- Rules as shipped: Revive is a true death, triggers stop at 5 layers, Freeze / Confuse, no-op heals, True Strike vs Legendary dodges, Prayer tokens; nothing is copied, the runs call the live engine.

## The 20 biggest gaps (current S vs measured S)

Skills compare S at the typical value; triggers, actions and modifiers compare the entry's own number (weight / value per point). Positive = under-costed today (worth more than it costs). Entries off the scale (below) are left out: their measured S is only a bound.

| # | Entry | Current | Measured | Gap | Confidence | Note |
|---|---|---|---|---|---|---|
| 1 | skill `ghost` | 1 | 46.3 | +45.3 | low |  |
| 2 | skill `twin` | 1 | 41.23 | +40.23 | low |  |
| 3 | skill `iceBolt` | 2 | 35.7 | +33.7 | low | per-N 20.91 |
| 4 | skill `iceArrow` | 1 | 32.15 | +31.15 | low | per-N 27.96 |
| 5 | action `gain` | 1 | 28.85 | +27.85 | low |  |
| 6 | skill `octolash` | 1 | 28.61 | +27.61 | low |  |
| 7 | skill `fireball` | 8 | 34.12 | +26.12 | low | per-N 3.32 |
| 8 | skill `avalanche` | 1 | 24.49 | +23.49 | low | per-N 4.22 |
| 9 | skill `absoluteZero` | 1 | 20.93 | +19.93 | low |  |
| 10 | skill `tideGrant` | 1 | 19.9 | +18.9 | low | under tide |
| 11 | skill `nova` | 2 | 18.89 | +16.89 | low | per-N 5.01 |
| 12 | skill `supreme` | 1 | 17.53 | +16.53 | high |  |
| 13 | skill `sturdy` | 1 | 16.9 | +15.9 | high |  |
| 14 | skill `twinShot` | 2 | 17.68 | +15.68 | low | per-N 9.75 |
| 15 | skill `shockBolt` | 2 | 17.14 | +15.14 | low | per-N 9.43 |
| 16 | skill `rage` | 1 | 16.04 | +15.04 | low |  |
| 17 | skill `poisonBolt` | 2 | 16.38 | +14.38 | low | per-N 7.37 |
| 18 | skill `swift` | 11.33 | 25.17 | +13.84 | low | per-N 9.23 |
| 19 | skill `banana` | 1 | 14.58 | +13.58 | high |  |
| 20 | skill `nocturnalGrant` | 1 | 14.46 | +13.46 | low | under night |

**Off the scale** (5): a deck of 20 still beats vanilla + 5× the baseline's Health and Attack (or loses to vanilla − all of it), so the measured S is only a bound — these want a scenario test, not a number: exile (today 4, ≥ 54.67), mindControl (today 6, ≥ 54.67), tsunami (today 1, ≥ 48), acidBolt (today 2, ≥ 44.09), meteor (today 11, ≥ 44.5).

**The 20 biggest gaps at high or medium confidence**:

| # | Entry | Current | Measured | Gap | Confidence | Note |
|---|---|---|---|---|---|---|
| 1 | skill `supreme` | 1 | 17.53 | +16.53 | high |  |
| 2 | skill `sturdy` | 1 | 16.9 | +15.9 | high |  |
| 3 | skill `banana` | 1 | 14.58 | +13.58 | high |  |
| 4 | skill `sap` | 1 | 13.59 | +12.59 | medium |  |
| 5 | skill `shadow` | 11.33 | -0.04 | -11.37 | high |  |
| 6 | skill `desecrate` | 1 | 10.71 | +9.71 | high |  |
| 7 | skill `dragonLightning` | 1 | 10.51 | +9.51 | high |  |
| 8 | skill `supremeTide` | 1 | 10.33 | +9.33 | high | under tide |
| 9 | skill `fullMoon` | 2 | 10.99 | +8.99 | high | under moon |
| 10 | skill `fragile` | 1 | -7.62 | -8.62 | high |  |
| 11 | skill `scare` | 2 | 10.51 | +8.51 | high |  |
| 12 | skill `sunshy` | 1 | -7.22 | -8.22 | high |  |
| 13 | skill `nursing` | 2 | 10.18 | +8.18 | high |  |
| 14 | skill `purblind` | 1 | -7.17 | -8.17 | high |  |
| 15 | skill `scatterbrained` | 1 | -7.17 | -8.17 | high |  |
| 16 | skill `nightblind` | 1 | -7.04 | -8.04 | high | under night |
| 17 | skill `blind` | 11.33 | 3.41 | -7.92 | high |  |
| 18 | skill `reload` | 1 | -5.91 | -6.91 | high |  |
| 19 | skill `feeble` | 1 | -5.45 | -6.45 | high |  |
| 20 | skill `proliferate` | 2 | 8.36 | +6.36 | high |  |

## Findings

**Most under-costed** (worth more than today's S): ghost (1 → 46.3), twin (1 → 41.23), iceBolt (2 → 35.7), iceArrow (1 → 32.15), gain (1 → 28.85), octolash (1 → 28.61), fireball (8 → 34.12), avalanche (1 → 24.49).

**Most over-costed** (worth less than today's S): shadow (11.33 → -0.04), ritual (1 → -9.37), counterattack (1 → -8.21), chained (1 → -8.1), irradiated (2 → -6.72), friction (2 → -6.63), fragile (1 → -7.62), molting (1 → -7.39).

**Situational value** (win-rate lift vs one opponent minus the mean lift over the pool, typical value, averaged over b1-b3):

- vs glass cannons: chilli +56 pts, immolation +53 pts, earthquake +39 pts, wilting +29 pts, dynamite +28 pts, psychic +23 pts, wither +23 pts, landslide +21 pts
- vs tanks: stealth +67 pts, rainmaker +27 pts, scar +25 pts, predator +24 pts, daunt +23 pts, brittle +23 pts, blind +22 pts, confuse +22 pts
- vs flyers: reach +37 pts, trueStrike +37 pts, web +27 pts, dynamite +23 pts, regen +18 pts, bloom +18 pts, prayerWard +18 pts, armor +17 pts
- vs the 0-cost swarm: converge +23 pts, siege +21 pts, bulwark +20 pts, restless +18 pts, rebuild +16 pts, midas +14 pts, earthquake +13 pts, momentum +12 pts
- vs the mix: drunk +25 pts, crabClaws +24 pts, coffee +22 pts, pounce +21 pts, feeble +20 pts, landslide +19 pts, dynamite +19 pts, cower +18 pts

**Arrow and Snipe** (the owner's example):

Win rate against each opponent (the vanilla unit's in brackets; each opponent is calibrated to about 50% for vanilla). A pool S at the top of its range (5× the baseline's stats) means the deck wins (nearly) every pool game, so the run's S leans on head-to-head.

| Skill | N | Baseline | S head-to-head | S pool | vs glass | vs tank | vs flyer | kills / copy (Δ vs vanilla) | dmg to units (Δ) |
|---|---|---|---|---|---|---|---|---|---|
| arrow | 2 | b1 | 13.9 | 28 | 100% (45%) | 100% (60%) | 100% (45%) | 1.29 (+0.36) | 9.37 (+2.76) |
| snipe | 3 | b1 | 2.87 | 3.16 | 100% (45%) | 88% (60%) | 100% (45%) | 1.28 (+0.35) | 8.27 (+1.66) |
| arrow | 2 | b2 | 8.84 | 51 | 100% (48%) | 100% (53%) | 100% (57%) | 1.2 (+0.36) | 14.55 (+4.13) |
| arrow | 1 | b2 | 5.81 | 51 | 100% (48%) | 100% (53%) | 100% (57%) | 1.19 (+0.35) | 13.76 (+3.34) |
| arrow | 3 | b2 | 11.84 | 51 | 100% (48%) | 100% (53%) | 100% (57%) | 1.23 (+0.39) | 15.89 (+5.47) |
| snipe | 3 | b2 | 1.9 | 2.88 | 50% (48%) | 80% (53%) | 88% (57%) | 1.13 (+0.29) | 13.54 (+3.12) |
| snipe | 1 | b2 | 1.49 | 2.6 | 50% (48%) | 78% (53%) | 88% (57%) | 1.1 (+0.26) | 11.83 (+1.41) |
| snipe | 2 | b2 | 1.81 | 2.88 | 50% (48%) | 80% (53%) | 88% (57%) | 1.12 (+0.28) | 12.52 (+2.1) |
| arrow | 2 | b3 | 7.29 | 60.42 | 100% (50%) | 100% (60%) | 100% (57%) | 1.08 (+0.41) | 18.96 (+5.15) |
| snipe | 3 | b3 | 2.6 | 4.17 | 50% (50%) | 78% (60%) | 80% (57%) | 1.1 (+0.43) | 16.84 (+3.03) |

**Field-bound skills** (costed where they work; plain-field S in brackets): bloomWhen 0 under night (–), darksight 5.12 under dark (-0.04), dry 5.75 under heat (-0.04), fieldBreaker 0.08 under fields (-0.04), fullMoon 10.99 under moon (-0.04), fullMoonGrant 3.48 under moon (–), illuminate -0.1 under night (-0.04), inherentDarkness -0.12 under dark (-0.04), keenSense 4.14 under dark (-0.04), lantern -0.1 under night (-0.04), moonborn 5.98 under moon (-0.04), moonpull -0.1 under tide (-0.04), mountainClimber 8.28 under frost (-0.04), nightblind -7.04 under night (-0.04), nocturnal 2.68 under night (-0.04), nocturnalGrant 14.46 under night (–), nocturnalHp 0.31 under night (–), rainrunner 6.01 under rain (-0.04), supremeTide 10.33 under tide (17.07), swimmer 5.23 under tide (-0.04), swimmerGrant 0 under tide (–), tide 2.79 under tide (-0.04), tideGrant 19.9 under tide (–), trueStrike 6.37 under dark (0.9), tsunami 48 under tide (50), wave 4.11 under tide (3.77).

## Package GI's new skills

Measured with what each needs (S of the skill less S of its enabler alone, same baseline and field): Hunter on a Poison 2 unit (and per status on b2: Bleed 2, Expose 1, Wet in Spring Rain), Detonate / Proliferate with Poison 2, Brittle with Shatter 2, Prayer Ward with Prayer 1, Field Breaker under Thunderstorm, Spore Cloud, Tangled Roots and Scorching; Kin Rally and Pack Howl in tribe decks (Otter, Wolf) less the tribe deck's own S.

| Skill | value today | measuredS | S today | S measured | Detail |
|---|---|---|---|---|---|
| `hunter` | 1 | 0.99 | 2 | 1.88 | by status: bleed 1.05, exposed 3.06, wet 8.1, poison 1.97 (with {"poison":2}) |
| `executioner` | 1 | 0.1 | 2 | 0.55 | per N: 1: 0, 2: 0.55, 4: 1.73 |
| `detonate` | 1 | -1.16 | 1 | -1.16 |  (with {"poison":2}) |
| `proliferate` | 2 | 10.68 | 2 | 8.36 | per N: 1: 8.36, 2: 35.14, 4: 44.46 (with {"poison":2}) |
| `brittle` | 0.5 | 1.14 | 1 | 2.24 | per N: 1: 2.02, 2: 2.24, 4: 2.02 (with {"shatter":2}) |
| `prayerWard` | 0.75 | 2.74 | 0.75 | 2.99 | per N: 1: 2.99, 2: 4.99, 4: 17.64 (with {"prayer":1}) |
| `fieldBreaker` | 1 | -0.03 | 2 | 0.08 | by field: heat -0.15, roots 0.03, spore 0.61, thunder -0.19 |

## Shorthands (S per N)

| Shorthand | S per N today | Measured | Note |
|---|---|---|---|
| `bounty` | 0.5 | 11.65 | S per N |
| `kinRally` | 3.75 | 3.77 | S per N less the Otter tribe deck's own S |
| `packHowl` | 2.5 | 1.97 | S per N less the Wolf tribe deck's own S |

## Triggers (weight; On Spawn = 1)

| Trigger | Current | Measured | Fires / copy | Confidence | Note |
|---|---|---|---|---|---|
| `onSpawn` | 1 | 1 | 1 | high |  |
| `onDeath` | 1 | 0.67 | 0.6 | high |  |
| `onReady` | 1 | 0.82 | 0.89 | high |  |
| `onKill` | 1 | 1.37 | 3.64 | high |  |
| `onAttack` | 3 | 4.77 | 4.8 | low |  |
| `onAttacked` | 2 | 1.21 | 1.46 | high |  |
| `onRoundStart` | 4 | 3.18 | 5.34 | low |  |
| `perTurn` | 3 | 3.18 | 5.34 | low |  |
| `onAllyPlayed` | 2.5 | 1.99 | 2.84 | high |  |
| `onEnemyPlayed` | 2.5 | 1.97 | 3.19 | low |  |
| `onAnyPlayed` | 5 | – | – | – | On Any Played has no engine hook yet (a reference value) |
| `onAllySpawn` | 1 | – | 0 | – | never fired on the plain test decks (needs another card's ability puts an ally in play); kept at its current weight |
| `onEnemySpawn` | 0.5 | – | 0 | – | never fired on the plain test decks (needs an ability puts an enemy in play); kept at its current weight |
| `onColumnSpawn` | 0.5 | 0.59 | 0.68 | high |  |
| `onAllyReady` | 2 | 1.08 | 2.28 | high |  |
| `onEnemyReady` | 2 | 1.47 | 2.61 | high |  |
| `onAllyDie` | 2 | 1.23 | 1.44 | high |  |
| `onMove` | 0.5 | – | 0 | – | never fired on the plain test decks (needs moved by an ability (Swap, a push)); kept at its current weight |
| `onHeal` | 2 | – | 0 | – | never fired on the plain test decks (needs each time it heals something); kept at its current weight |
| `onHealed` | 1.5 | 4.97 | 3.27 | low |  |
| `onAllyHealed` | 1.5 | 2.82 | 6.89 | low |  |
| `onPitch` | 2 | 4.31 | 2.88 | high |  |
| `onDiscard` | 0.5 | – | 0 | – | never fired on the plain test decks (needs only when this card is pitched instead of played); kept at its current weight |
| `onSacrifice` | 0.5 | – | 0 | – | never fired on the plain test decks (needs only when it is given up as fodder or an offering); kept at its current weight |
| `onExile` | 0.25 | – | 0 | – | never fired on the plain test decks (needs only when it is moved to the Removal Zone); kept at its current weight |
| `onChainBreak` | 0.5 | – | 0 | – | never fired on the plain test decks (needs when its Chained breaks); kept at its current weight |
| `onCharge` | 1 | – | 0 | – | never fired on the plain test decks (needs the Charge skill's own hook); kept at its current weight |
| `bounty` | 0.5 | 11.65 | – | low |  |

## Actions (value per point)

| Action | Current | Measured | Reference | Confidence | Note |
|---|---|---|---|---|---|
| `damage` | 1 | 1.27 | onSpawn {"amount":2,"dmgType":"physical","who":"enemy","sub":"random"} | high |  |
| `missile` | 1 | 1.27 | onSpawn {"amount":2} | high |  |
| `fireHit` | 1 | 1.13 | onAttack {"amount":2} | high |  |
| `heal` | 0.5 | 0.82 | onAttack {"amount":2} | medium |  |
| `rebuild` | 0.5 | 0.2 | onSpawn {"amount":3} | high |  |
| `shield` | 0.5 | 1.39 | onSpawn {"who":"ally","sub":"all","amount":2} | high |  |
| `cleanse` | 0.5 | -0.03 | onAttack {"amount":1} | high |  |
| `poison` | 1 | 1.61 | onSpawn {"amount":2,"who":"enemy","sub":"adjacent"} | high |  |
| `bleed` | 1 | 0.78 | onSpawn {"amount":2,"who":"enemy","sub":"random"} | high |  |
| `expose` | 1 | 2.57 | onSpawn {"amount":2,"who":"enemy","sub":"random"} | high |  |
| `buff` | 1 | 3.33 | onSpawn {"who":"self","amount":1} | high |  |
| `buff.amount2` | 0.5 | 0.34 | onSpawn {"who":"self","amount2":2} | high |  |
| `debuff` | 1 | 2.22 | onSpawn {"who":"enemy","sub":"adjacent","amount":1} | high |  |
| `debuff.amount2` | 0.5 | 0.31 | onSpawn {"who":"enemy","sub":"adjacent","amount2":2} | high |  |
| `addWait` | 1.5 | 2.8 | onSpawn {"amount":2,"who":"enemy","sub":"adjacent"} | high |  |
| `reduceWaitOfSpawned` | 1.5 | 3.91 | onAllyPlayed {"amount":1} | high |  |
| `stun` | 2 | 5.6 | onSpawn {"who":"enemy","sub":"adjacent"} | high |  |
| `stunPlayer` | 4 | 1.89 | onSpawn {"count":1} | high |  |
| `mindControl` | 6 | 54.67 | onSpawn {"sub":"random"} | low |  |
| `swapPositions` | 0.5 | -0.06 | onSpawn {} | high |  |
| `drawCard` | 2 | 5.12 | onSpawn {"count":1} | high |  |
| `spawnCard` | 2 | 5.26 | onSpawn {"defId":"bee-swarmling","count":1} | high |  |
| `exileGrave` | 0.5 | -0.11 | onSpawn {"count":2} | high |  |
| `exile` | 4 | 54.67 | onSpawn {"who":"enemy","sub":"random"} | low |  |
| `exileSelf` | 0 | -0.07 | onDeath {} | high |  |
| `gain` | 1 | 28.85 | onSpawn {"amount":1,"resource":"lumber"} | low |  |
| `refine` | 1 | -3.87 | perTurn {"amount":1} | low |  |

## Modifiers

| Modifier | Current | Measured | How |
|---|---|---|---|
| `subAll` | 2 | 4.89 | S(deal 2 to all enemies) / S(deal 2 to a random enemy) |
| `turnOfOne` | 0.5 | 0.65 | S(On Turn Start, own turns) / S(On Turn Start) |
| `onceCap` | 1 | 0.66 | S(On Attack once: deal 2) / S(On Spawn: deal 2) |

## Trigger × action as live cards print them (b2)

| Entry | Cards | S today | S measured |
|---|---|---|---|
| `{"on":"onDeath","do":"exileSelf"}` | 5 | 0 | 0 |
| `{"on":"onKill","do":"gain","amount":1,"resource":"lumber"}` | 4 | 1 | 2.22 |
| `{"on":"onSpawn","do":"addWait","amount":2,"who":"enemy","sub":"adjacent"}` | 4 | 3 | 4.96 |
| `{"on":"onSpawn","do":"drawCard","count":1}` | 3 | 2 | 4.53 |
| `{"do":"heal","on":"onAttack","amount":1}` | 2 | 1.5 | 1.97 |
| `{"do":"spawnCard","on":"onAttacked","count":1,"defId":"bee-swarmling"}` | 1 | 4 | 4.66 |
| `{"on":"onAttacked","do":"spawnCard","defId":"bee-swarmling","count":1,"whenReady":true}` | 1 | 4 | 4.66 |
| `{"on":"onReady","do":"damage","amount":5,"dmgType":"physical","who":"enemy","sub":"random"}` | 1 | 5 | 4.22 |
| `{"on":"onSpawn","do":"addWait","amount":1,"who":"enemy","sub":"all"}` | 1 | 3 | 16.38 |
| `{"on":"onKill","do":"gain","amount":2,"resource":"lumber"}` | 1 | 2 | 2.24 |

## Every skill

S today and measured at the typical value (mean over the runs in its field); measuredS in the entry's own units (what `value` would be).

| Skill | Typical | Scale | value | measuredS | S today | S measured | b1 / b2 / b3 | Conf | Note |
|---|---|---|---|---|---|---|---|---|---|
| `absoluteZero` | `true` | half | 1 | 20.93 | 1 | 20.93 | 8.25 / 16.38 / 38.17 | low |  |
| `acidBolt` | `2` | half | 1 | 22.75 | 2 | 44.09 | 27.24 / 45.25 / 59.79 | low |  |
| `ambush` | `true` | half | 1 | 2.17 | 1 | 2.17 | 2 / 2.02 / 2.48 | high |  |
| `amore` | `true` | half | 1 | -0.04 | 1 | -0.04 | 0 / 0 / -0.11 | high |  |
| `armor` | `1` | n | 1 | 2.74 | 1 | 2.95 | 3.49 / 2.74 / 2.61 | high |  |
| `arrow` | `2` | half | 1 | 5.92 | 2 | 10.01 | 13.9 / 8.84 / 7.29 | low |  |
| `arrowCount` | `2` | half | 1 | 6.7 | – | 13.4 | – / – / – | low |  |
| `arrows` | `2` | n | 1 | 0 | 2 | -0.04 | 0 / 0 / -0.11 | high |  |
| `atheist` | `true` | half | 1 | -0.04 | 1 | -0.04 | 0 / 0 / -0.11 | high |  |
| `avalanche` | `1` | half | 1 | 4.22 | 1 | 24.49 | 2.31 / 5.63 / 65.54 | low |  |
| `backstab` | `2` | half | 1 | 1.79 | 2 | 3.56 | 3.36 / 3.75 / 3.57 | high |  |
| `banana` | `true` | half | 1 | 14.58 | 1 | 14.58 | 23.28 / 8.39 / 12.08 | high |  |
| `bananarang` | `true` | half | 1 | 6.76 | 1 | 6.76 | 7.79 / 5.95 / 6.55 | low |  |
| `berserk` | `2` | half | 1 | 2.51 | 2 | 4.83 | 4.66 / 4.8 / 5.02 | high |  |
| `beware` | `4` | half | 1 | 0 | 3 | -0.04 | 0 / 0 / -0.11 | high |  |
| `bleed` | `2` | n | 1 | 2.7 | 2 | 5.29 | 4.88 / 5.59 / 5.4 | high |  |
| `blind` | `{"chance":50,"duration":2}` | fixed | 0 | -5.28 | 11.33 | 3.41 | 1.94 / 4.08 / 4.21 | high |  |
| `bloodlust` | `true` | half | 1 | -0.96 | 1 | -0.96 | -0.91 / -1.31 / -0.65 | high |  |
| `bloodTithe` | `2` | n | -1 | -1.18 | -2 | -2.66 | -2.31 / -3.3 / -2.36 | high |  |
| `bloom` | `1` | half | 1 | 4.24 | 1 | 4.31 | 4.63 / 3.62 / 4.68 | high |  |
| `bloomWhen` | `1` | half | 1 | 0 | – | 0 | – / – / – | high | under night |
| `bludgeon` | `true` | half | 1 | 2.68 | 1 | 2.68 | 2.06 / 2.88 / 3.1 | low |  |
| `boomerang` | `true` | half | 1 | 4.08 | 1 | 4.08 | 2.68 / 4.82 / 4.75 | low |  |
| `brittle` | `2` | half | 0.5 | 1.14 | 1 | 2.24 | 2.28 / 2.02 / 2.31 | high |  |
| `brood` | `1` | half | 1 | 3.21 | 1 | 2.91 | 1.18 / 3.76 / 3.79 | high |  |
| `bulldoze` | `1` | half | 1 | 5.51 | 1 | 5.8 | 3.31 / 6.2 / 7.89 | high |  |
| `bulwark` | `2` | half | 1 | 0.86 | 2 | 1.84 | 1.13 / 1.69 / 2.7 | high |  |
| `carrion` | `2` | half | 1 | 1.39 | 2 | 2.46 | 2.77 / 2.42 / 2.19 | high |  |
| `castDarkness` | `true` | fixed | 2 | 0.54 | 2 | 0.54 | 0.06 / 0.32 / 1.24 | high |  |
| `chained` | `{"breakOn":"damage","amount":4}` | half | 1 | -8.1 | 1 | -8.1 | -5.12 / -9 / -10.18 | low |  |
| `chainLightning` | `2` | half | 1 | 4.5 | 2 | 7.36 | 5.77 / 8.99 / 7.31 | low |  |
| `changeling` | `true` | half | 1 | -0.04 | 1 | -0.04 | 0 / 0 / -0.11 | high |  |
| `charge` | `{"n":2,"do":{"do":"damage","amount":3,"w` | half | 1 | 4.22 | 1 | 4.22 | 6.1 / 3.15 / 3.4 | high |  |
| `chilli` | `2` | half | 1 | -0.73 | 2 | -0.98 | -1.47 / -2.08 / 0.6 | high |  |
| `coffee` | `1` | half | 1 | 0.22 | 1 | -1.99 | -0.23 / 0.66 / -6.4 | high |  |
| `confuse` | `{"chance":50,"duration":2}` | half | 1 | 3.41 | 1 | 3.41 | 1.94 / 4.08 / 4.21 | high |  |
| `converge` | `"enemy"` | half | 1 | -0.42 | 1 | -0.42 | 0.06 / -0.41 / -0.91 | high |  |
| `coreEvil` | `true` | half | 1 | -0.04 | 1 | -0.04 | 0 / 0 / -0.11 | high |  |
| `corrode` | `2` | half | 1 | 1.34 | 2 | 2.45 | 2.01 / 2.68 / 2.67 | low |  |
| `counterattack` | `true` | half | 1 | -8.21 | 1 | -8.21 | -3.37 / -7.25 / -14 | low |  |
| `cower` | `"shell"` | half | 1 | -0.63 | 1 | -0.63 | -0.72 / -0.16 / -1.02 | high |  |
| `crabClaws` | `true` | fixed | 0 | -0.07 | 0 | -0.07 | -0.27 / 0 / 0.06 | high |  |
| `creative` | `true` | fixed | 0 | 0.01 | 0 | 0.01 | -0.57 / -0.09 / 0.69 | high |  |
| `crepuscular` | – | fixed | 1 | – | – | – | – / – / – | – | Crepuscular acts only at twilight (the realtime clock maps) |
| `crepuscularHp` | `1` | half | 1 | – | – | – | – / – / – | – | Crepuscular acts only at twilight (the realtime clock maps) |
| `crit` | `true` | half | 1 | 6.01 | 1 | 6.01 | 2.43 / 5.33 / 10.28 | high |  |
| `crystallise` | `5` | half | 1 | 0.46 | 3 | 1.05 | 0.37 / 1.28 / 1.49 | high |  |
| `cure` | `2` | half | 1 | 0 | 2 | -0.04 | 0 / 0 / -0.11 | high |  |
| `darksight` | `true` | fixed | 1 | 5.12 | 1 | 5.12 | 0 / 0 / -0.11 | high | under dark (plain -0.04) |
| `daunt` | `1` | half | 1 | 3.29 | 1 | 3.31 | 5.81 / 1.92 / 2.2 | high |  |
| `decay` | `1` | half | 1 | 3.92 | 1 | 4.55 | 3.16 / 5.83 / 4.67 | low |  |
| `defiance` | `["Snake"]` | half | 1 | -0.04 | 1 | -0.04 | 0 / 0 / -0.11 | high |  |
| `defianceN` | `["Snake"]` | half | 1 | 0 | – | 0 | – / – / – | high |  |
| `demolisher` | `2` | half | 1 | 0 | 2 | -0.04 | 0 / 0 / -0.11 | high |  |
| `desecrate` | `1` | half | 1 | 9.41 | 1 | 10.71 | 13.33 / 9.6 / 9.21 | high |  |
| `detonate` | `true` | fixed | 1 | -1.16 | 1 | -1.16 | 4.73 / 4.67 / 5.82 | high |  |
| `devour` | `{"attack":3,"health":3,"grant":{"arrow":` | half | 1 | 14.27 | 1 | 14.27 | 14 / 11.36 / 17.46 | low |  |
| `dictator` | `true` | half | 1 | -0.04 | 1 | -0.04 | 0 / 0 / -0.11 | high |  |
| `diurnal` | `true` | fixed | 1 | 3.43 | 1 | 3.43 | 3.54 / 2.78 / 3.97 | high |  |
| `diurnalGrant` | `true` | half | 1 | 11.72 | – | 11.72 | – / – / – | low |  |
| `diurnalHp` | `1` | half | 1 | 0.47 | – | 0.94 | – / – / – | high |  |
| `dragonLightning` | `1` | half | 1 | 7.5 | 1 | 10.51 | 16.54 / 6 / 9 | high |  |
| `drunk` | `true` | half | 1 | -3.09 | 1 | -3.09 | -1.59 / -3.6 / -4.09 | high |  |
| `dry` | `true` | half | 1 | 5.75 | 1 | 5.75 | 0 / 0 / -0.11 | high | under heat (plain -0.04) |
| `durian` | `true` | half | 1 | 2.11 | 1 | 2.11 | 1.94 / 2.18 / 2.21 | high |  |
| `dynamite` | `3` | fixed | 0 | 1.22 | 0 | 1.22 | 0.12 / 1.6 / 1.93 | high |  |
| `earthquake` | `3` | half | 1 | 0.44 | 2 | 1.56 | 1.51 / 0.87 / 2.3 | high |  |
| `electricity` | `1` | half | 1 | 3.6 | 1 | 3.87 | 2.41 / 4.27 / 4.93 | high |  |
| `esprit` | `1` | half | 1 | 0 | 1 | -0.04 | 0 / 0 / -0.11 | high |  |
| `espritHp` | `2` | half | 1 | 0 | – | 0 | – / – / – | high |  |
| `evasive` | `true` | fixed | 0 | -0.2 | 11.33 | 11.03 | 7.31 / 10.8 / 14.98 | low |  |
| `executioner` | `2` | half | 1 | 0.1 | 2 | 0.55 | 0.2 / 1.38 / 0.08 | high |  |
| `explode` | `{"time":1,"damage":4}` | half | 1 | 5.2 | 1 | 5.2 | 3.37 / 8.35 / 3.87 | high |  |
| `expose` | `2` | half | 1 | 1.82 | 2 | 3.54 | 2.11 / 3.63 / 4.89 | high |  |
| `fastForward` | `1` | half | 1 | 7.17 | 1 | 5.52 | 2.24 / 5.67 / 8.66 | high |  |
| `feeble` | `true` | half | 1 | -5.45 | 1 | -5.45 | -2.73 / -5.31 / -8.31 | high |  |
| `fencing` | `true` | half | 1 | -0.04 | 1 | -0.04 | 0 / 0 / -0.11 | high |  |
| `fester` | `true` | half | 1 | -0.04 | 1 | -0.04 | 0 / 0 / -0.11 | high |  |
| `festering` | `true` | half | 1 | -0.04 | 1 | -0.04 | 0 / 0 / -0.11 | high |  |
| `fieldBreaker` | `2` | half | 1 | -0.03 | 2 | 0.08 | 0 / 0 / -0.11 | high | under fields (plain -0.04) |
| `fireArrow` | `2` | half | 1 | 6.77 | 2 | 10.01 | 13.9 / 8.84 / 7.29 | low |  |
| `fireball` | `15` | half | 1 | 3.32 | 8 | 34.12 | 26.59 / 43.57 / 32.21 | low |  |
| `fireBolt` | `2` | half | 1 | 5.92 | 2 | 10.01 | 13.9 / 8.84 / 7.29 | low |  |
| `fletcher` | `1` | half | 1 | 0 | 1 | -0.04 | 0 / 0 / -0.11 | high |  |
| `flying` | `true` | fixed | 0 | -0.13 | 11.33 | 11.14 | 7.1 / 10.87 / 15.44 | low |  |
| `fork` | `true` | half | 1 | 5.14 | 1 | 5.14 | 2.44 / 4.43 / 8.55 | high |  |
| `fragile` | `true` | half | 1 | -7.62 | 1 | -7.62 | -4.11 / -6.71 / -12.03 | high |  |
| `freeze` | `{"chance":25,"duration":1}` | half | 1 | 1.89 | 1 | 1.89 | 1.17 / 2.08 / 2.43 | high |  |
| `frenzy` | `true` | half | 1 | -0.04 | 1 | -0.04 | 0 / 0 / -0.11 | high |  |
| `friction` | `2` | half | 1 | -3.59 | 2 | -6.63 | -5.25 / -7.44 / -7.19 | low |  |
| `frostbite` | `1` | half | 1 | 0 | 1 | -0.04 | 0 / 0 / -0.11 | high |  |
| `fullMoon` | `3` | half | 1 | 4 | 2 | 10.99 | 0 / 0 / -0.11 | high | under moon (plain -0.04) |
| `fullMoonGrant` | `3` | half | 1 | 3.48 | – | 3.48 | – / – / – | low | under moon |
| `gash` | `3` | half | 1 | 1.07 | 2 | 2.3 | 2.14 / 2.27 / 2.49 | high |  |
| `ghost` | `true` | half | 1 | 46.3 | 1 | 46.3 | 29 / 51 / 58.91 | low |  |
| `grit` | `1` | half | 1 | 0.05 | 1 | 0.09 | 0.32 / 0.07 / -0.11 | high |  |
| `growth` | `true` | half | 1 | -0.04 | 1 | -0.04 | 0 / 0 / -0.11 | high |  |
| `guardian` | `true` | half | 1 | 1.06 | 1 | 1.06 | 1.1 / 0.88 / 1.2 | high |  |
| `haste` | `true` | half | 1 | 3.56 | 1 | 3.56 | 3.08 / 4 / 3.6 | low |  |
| `heal` | `2` | n | 1 | 0 | 2 | -0.04 | 0 / 0 / -0.11 | high |  |
| `healing` | `1` | half | 1 | 5.64 | 1 | 5.36 | 6.34 / 4.94 / 4.81 | high |  |
| `heavyMetal` | `true` | half | 1 | -0.04 | 1 | -0.04 | 0 / 0 / -0.11 | high |  |
| `helmet` | `true` | fixed | 2 | -0.04 | 2 | -0.04 | 0 / 0 / -0.11 | high |  |
| `herbalist` | `1` | half | 1 | 0 | 1 | -0.04 | 0 / 0 / -0.11 | high |  |
| `hiveMind` | `true` | half | 1 | -0.04 | 1 | -0.04 | 0 / 0 / -0.11 | high |  |
| `hoard` | `2` | half | 1 | 0 | 2 | -0.04 | 0 / 0 / -0.11 | high |  |
| `hunter` | `2` | half | 1 | 0.99 | 2 | 1.88 | 7.22 / 8.51 / 8.6 | medium |  |
| `hunterVs` | – | fixed | 0 | – | – | – | – / – / – | – | a parameter of Hunter (which status, no cost of its own); Hunter runs once per status (Poisoned, Bleeding, Exposed, Wet) |
| `iceArrow` | `1` | half | 1 | 27.96 | 1 | 32.15 | 26.79 / 40.54 / 29.13 | low |  |
| `iceBolt` | `2` | half | 1 | 20.91 | 2 | 35.7 | 26.93 / 35.85 / 44.33 | low |  |
| `ichor` | `2` | half | 1 | 3.31 | 2 | 5.92 | 5.77 / 6.62 / 5.38 | low |  |
| `illuminate` | `true` | half | 1 | -0.1 | 1 | -0.1 | 0 / 0 / -0.11 | high | under night (plain -0.04) |
| `immolation` | `1` | half | 1 | -1.56 | 1 | -1.53 | -0.85 / -1.95 / -1.78 | low |  |
| `inherentDarkness` | `1` | half | 1 | -0.09 | 1 | -0.12 | 0 / 0 / -0.11 | high | under dark (plain -0.04) |
| `inspiring` | `2` | half | 1 | 2.16 | 2 | 3.88 | 4.09 / 3.23 / 4.32 | high |  |
| `invincible` | `1` | half | 1 | 1.23 | 1 | 1.38 | 1.08 / 1.83 / 1.24 | high |  |
| `invisible` | `2` | half | 1 | 1.25 | 2 | 2.17 | 1.8 / 2.51 / 2.19 | high |  |
| `ironWill` | `true` | half | 1 | -0.04 | 1 | -0.04 | 0 / 0 / -0.11 | high |  |
| `irradiated` | `2` | half | 1 | -3.6 | 2 | -6.72 | -2.53 / -7.2 / -10.44 | low |  |
| `keenEye` | `true` | half | 1 | -0.04 | 1 | -0.04 | 0 / 0 / -0.11 | high |  |
| `keenSense` | `true` | half | 1 | 4.14 | 1 | 4.14 | 0 / 0 / -0.11 | high | under dark (plain -0.04) |
| `kingSlayer` | `4` | half | 1 | 0 | 3 | -0.04 | 0 / 0 / -0.11 | high |  |
| `kinship` | `{"type":"Bee","atk":1,"hp":0}` | half | 1 | 7.12 | 1 | 7.12 | 5.74 / 6.57 / 9.06 | low |  |
| `landslide` | `2` | half | 1 | 2 | 2 | 3.62 | 2.89 / 3.98 / 3.99 | high |  |
| `lantern` | `true` | half | 1 | -0.1 | 1 | -0.1 | 0 / 0 / -0.11 | high | under night (plain -0.04) |
| `leader` | – | fixed | 0 | – | – | – | – / – / – | – | Leader only matters for skirmish leaders (a fight setup), not a played unit |
| `lightning` | `3` | half | 1 | 2.26 | 2 | 4.63 | 5.85 / 5.12 / 2.92 | low |  |
| `loneWolf` | `[1,1]` | half | 1 | 6.94 | 2 | 6.94 | 9.58 / 6.28 / 4.97 | low |  |
| `loyal` | `[1,3]` | half | 1 | -0.04 | 3 | -0.04 | 0 / 0 / -0.11 | high |  |
| `loyalGrant` | `[1,3]` | half | 1 | 0 | – | 0 | – / – / – | high |  |
| `lumberjack` | `true` | half | 1 | 5.45 | 1 | 5.45 | 2.27 / 4.19 / 9.89 | high |  |
| `magic` | `true` | half | 1 | -0.04 | 1 | -0.04 | 0 / 0 / -0.11 | high |  |
| `meiosis` | `1` | half | 1 | 3.63 | 1 | 4.18 | 5.28 / 4.17 / 3.08 | low |  |
| `meteor` | `20` | half | 1 | 4.03 | 11 | 44.5 | 26.7 / 44.35 / 62.44 | low |  |
| `midas` | `2` | half | 1 | 1.1 | 2 | 2.34 | 1.82 / 2.18 / 3.01 | high |  |
| `mighty` | `true` | half | 1 | 7.15 | 1 | 7.15 | 4.23 / 7.3 / 9.92 | high |  |
| `molting` | `1` | fixed | 1 | -7.39 | 1 | -7.39 | 0.84 / -9 / -14 | low |  |
| `momentum` | `2` | half | 1 | 0.97 | 2 | 1.81 | 1.77 / 1.59 / 2.06 | high |  |
| `moonborn` | `2` | half | 1 | 4 | 2 | 5.98 | 0 / 0 / -0.11 | high | under moon (plain -0.04) |
| `moonpull` | `true` | half | 1 | -0.1 | 1 | -0.1 | 0 / 0 / -0.11 | high | under tide (plain -0.04) |
| `mountainClimber` | `true` | half | 1 | 8.28 | 1 | 8.28 | 0 / 0 / -0.11 | low | under frost (plain -0.04) |
| `natureForce` | `1` | half | 1 | 0 | 1 | -0.04 | 0 / 0 / -0.11 | high |  |
| `nightblind` | `true` | half | 1 | -7.04 | 1 | -7.04 | 0 / 0 / -0.11 | high | under night (plain -0.04) |
| `nocturnal` | `true` | fixed | 1 | 2.68 | 1 | 2.68 | 0 / 0 / -0.11 | high | under night (plain -0.04) |
| `nocturnalGrant` | `true` | half | 1 | 14.46 | – | 14.46 | – / – / – | low | under night |
| `nocturnalHp` | `1` | half | 1 | 0.31 | – | 0.31 | – / – / – | high | under night |
| `nova` | `3` | half | 1 | 5.01 | 2 | 18.89 | 18.41 / 30.12 / 8.15 | low |  |
| `nullify` | `true` | half | 1 | -0.04 | 1 | -0.04 | 0 / 0 / -0.11 | high |  |
| `nursing` | `2` | half | 1 | 5.03 | 2 | 10.18 | 9.78 / 10.71 / 10.05 | high |  |
| `octolash` | `true` | half | 1 | 28.61 | 1 | 28.61 | 10.74 / 35.75 / 39.35 | low |  |
| `onDeathSpawn` | `{"defId":"bat-swarmling","count":2}` | half | 1 | 12.96 | 1 | 12.96 | 24.76 / 8.67 / 5.46 | low |  |
| `onReadyDamage` | `{"amount":3,"dmgType":"physical"}` | half | 1 | 2.36 | 1 | 2.36 | 2.01 / 2.28 / 2.78 | high |  |
| `onReadyGold` | `1` | half | 1 | 6.24 | 1 | 8 | 5.6 / 6.87 / 11.53 | low |  |
| `onSpawnDevilry` | `1` | half | 1 | 0 | 1 | -0.04 | 0 / 0 / -0.11 | high |  |
| `overwhelm` | `true` | half | 1 | 0.28 | 1 | 0.28 | 0.04 / 0.03 / 0.77 | high |  |
| `pack` | `2` | half | 1 | 0 | 2 | -0.04 | 0 / 0 / -0.11 | high |  |
| `packLeader` | `true` | half | 1 | -0.04 | 1 | -0.04 | 0 / 0 / -0.11 | high |  |
| `paralyze` | `{"chance":50,"duration":1}` | half | 1 | 1.8 | 1 | 1.8 | 1.23 / 1.51 / 2.65 | high |  |
| `penance` | `3` | n | -1 | -0.21 | -3 | -0.94 | -0.43 / -0.65 / -1.73 | high |  |
| `perforate` | `2` | half | 1 | 3.72 | 2 | 7.32 | 7.43 / 7.76 / 6.78 | high |  |
| `pierce` | `1` | half | 1 | 0 | 1 | -0.04 | 0 / 0 / -0.11 | high |  |
| `pitchfork` | `true` | half | 1 | 4.1 | 1 | 4.1 | 2.69 / 5.06 / 4.54 | high |  |
| `poison` | `2` | n | 1 | 3.13 | 2 | 6.23 | 6.26 / 6.54 / 5.89 | high |  |
| `poisonBolt` | `2` | half | 1 | 7.37 | 2 | 16.38 | 20.05 / 14.37 / 14.73 | low |  |
| `poisonGas` | `2` | half | 1 | 5.96 | 2 | 12.38 | 15.1 / 11.92 / 10.11 | low |  |
| `pounce` | `2` | half | 1 | 2.4 | 2 | 3.51 | 2.01 / 4.81 / 3.7 | high |  |
| `prayer` | – | half | 1 | – | – | – | – / – / – | – | Prayer only pays with cards that need Prayer (prayerReq); a plain deck has none, so its worth is the deck's, not the unit's |
| `prayerWard` | `1` | n | 0.75 | 2.74 | 0.75 | 2.99 | 3.54 / 2.74 / 2.57 | high |  |
| `predator` | `1` | half | 1 | 0.71 | 1 | 0.72 | 0.74 / 0.73 / 0.69 | high |  |
| `prey` | `true` | half | 1 | -0.04 | 1 | -0.04 | 0 / 0 / -0.11 | high |  |
| `primed` | `true` | half | 1 | -0.04 | 1 | -0.04 | 0 / 0 / -0.11 | high |  |
| `proliferate` | `1` | n | 2 | 10.68 | 2 | 8.36 | 13.69 / 13.52 / 16.57 | high |  |
| `psychic` | `1` | half | 1 | 2.04 | 1 | 2.14 | 2.42 / 2.49 / 1.51 | high |  |
| `puncture` | `2` | half | 1 | 0.74 | 2 | 1.69 | 1.15 / 1.47 / 2.45 | high |  |
| `purblind` | `true` | half | 1 | -7.17 | 1 | -7.17 | -3.84 / -6.79 / -10.88 | high |  |
| `quick` | `true` | fixed | 2 | 7.55 | 2 | 7.55 | 15.03 / 3.9 / 3.71 | high |  |
| `rabid` | `true` | half | 1 | 6.23 | 1 | 6.23 | 6.26 / 6.54 / 5.89 | high |  |
| `rage` | `true` | half | 1 | 16.04 | 1 | 16.04 | 4.6 / 15.5 / 28.03 | low |  |
| `rainmaker` | `3` | half | 1 | -0.09 | 2 | -1.01 | -2.67 / -0.18 / -0.17 | high |  |
| `rainrunner` | `2` | half | 1 | 5.06 | 2 | 6.01 | 0 / 0 / -0.11 | low | under rain (plain -0.04) |
| `rally` | `1` | half | 1 | 6.16 | 1 | 7.12 | 5.74 / 6.57 / 9.06 | low |  |
| `reach` | `true` | half | 1 | 0.9 | 1 | 0.9 | 0.5 / 0.66 / 1.55 | high |  |
| `rebuild` | `2` | n | 1 | 0.55 | 2 | 1.18 | 0.04 / 1.09 / 2.42 | high |  |
| `recoil` | `2` | half | 1 | -3.83 | 2 | -6.08 | -3.48 / -7.71 / -7.04 | low |  |
| `reflect` | `true` | half | 1 | -0.04 | 1 | -0.04 | 0 / 0 / -0.11 | high |  |
| `regen` | `1` | n | 1 | 3.1 | 1 | 3.41 | 3.35 / 2.79 / 4.1 | high |  |
| `relic` | `true` | fixed | 2 | 3.23 | 2 | 3.23 | 2.49 / 3.97 / 3.22 | high |  |
| `reload` | `1` | half | 1 | -4.84 | 1 | -5.91 | -2.97 / -5.5 / -9.27 | high |  |
| `remember` | `2` | half | 1 | 0 | 2 | -0.04 | 0 / 0 / -0.11 | high |  |
| `render` | `{"trigger":"onSpawn","amount":2}` | half | 1 | 3.56 | 1 | 3.56 | 2.95 / 4.65 / 3.08 | low |  |
| `renewal` | `true` | half | 1 | -0.04 | 1 | -0.04 | 0 / 0 / -0.11 | high |  |
| `restless` | `true` | half | 1 | 0.2 | 1 | 0.2 | 0.07 / -0.17 / 0.69 | high |  |
| `retribution` | `2` | half | 1 | 3.36 | 2 | 6.17 | 6.71 / 4.74 / 7.07 | high |  |
| `revive` | `true` | half | 1 | 5.37 | 1 | 5.37 | 3.12 / 6.77 / 6.21 | high |  |
| `ritual` | `{"perished":6,"drawn":6,"castleDamage":6` | half | 1 | -9.37 | 1 | -9.37 | -5.12 / -9 / -14 | low |  |
| `rocket` | `4` | half | 1 | 1.99 | 3 | 4.8 | 4.13 / 5.97 / 4.3 | low |  |
| `rockSolid` | `true` | half | 1 | -0.04 | 1 | -0.04 | 0 / 0 / -0.11 | high |  |
| `rupture` | `true` | half | 1 | -0.04 | 1 | -0.04 | 0 / 0 / -0.11 | high |  |
| `sacrifice` | `1` | half | 1 | 0 | 1 | -0.04 | 0 / 0 / -0.11 | high |  |
| `sap` | `true` | half | 1 | 13.59 | 1 | 13.59 | 8.57 / 15.07 / 17.12 | medium |  |
| `satiety` | `1` | half | 1 | 1.98 | 1 | 1.95 | 1.34 / 2.24 / 2.27 | high |  |
| `scar` | `2` | half | 1 | 1.43 | 2 | 2.65 | 2.49 / 2.6 / 2.85 | high |  |
| `scare` | `2` | half | 1 | 2.74 | 2 | 10.51 | 21.58 / 5.22 / 4.72 | high |  |
| `scatterbrained` | `true` | half | 1 | -7.17 | 1 | -7.17 | -3.84 / -6.79 / -10.88 | high |  |
| `sentry` | `true` | half | 1 | 3.4 | 1 | 3.4 | 3.42 / 4 / 2.77 | high |  |
| `shade` | `true` | half | 1 | -0.04 | 1 | -0.04 | 0 / 0 / -0.11 | high |  |
| `shadow` | `true` | fixed | 0 | -7.58 | 11.33 | -0.04 | 0 / 0 / -0.11 | high |  |
| `shatter` | `2` | half | 1 | 0 | 2 | -0.04 | 0 / 0 / -0.11 | high |  |
| `shedding` | `3` | half | 1 | 3 | 2 | 4.59 | 3.51 / 3.21 / 7.04 | high |  |
| `shell` | `4` | half | 1 | 2.69 | 3 | 7.88 | 3.3 / 9.74 / 10.61 | high |  |
| `shield` | `3` | half | 1 | 1.2 | 2 | 2.57 | 2.66 / 2.67 / 2.39 | high |  |
| `shieldCall` | `true` | half | 1 | -0.04 | 1 | -0.04 | 0 / 0 / -0.11 | high |  |
| `shock` | `{"chance":30,"duration":1}` | half | 1 | 0.93 | 1 | 0.93 | 0.18 / 1.05 / 1.56 | high |  |
| `shockBolt` | `2` | half | 1 | 9.43 | 2 | 17.14 | 18.86 / 14.85 / 17.71 | low |  |
| `siege` | `4` | half | 1 | 0.36 | 3 | 1.58 | 1.09 / 1.13 / 2.52 | high |  |
| `skyfall` | `3` | half | 1 | 1.29 | 2 | 2.83 | 2.09 / 2.57 / 3.84 | high |  |
| `slashBurn` | `3` | half | 1 | 0.45 | 2 | 1.23 | 1.33 / 0.9 / 1.45 | high |  |
| `sleep` | `{"chance":50,"duration":2}` | half | 1 | 5.16 | 1 | 5.16 | 2.87 / 5.39 / 7.23 | high |  |
| `smokeBomb` | `true` | half | 1 | 2.2 | 1 | 2.2 | 1.34 / 2.29 / 2.96 | high |  |
| `snipe` | `3` | n | 1 | 1.13 | 3 | 2.93 | 3.01 / 2.39 / 3.38 | high |  |
| `sociable` | `[1,1]` | half | 1 | 7.2 | 2 | 7.2 | 6.28 / 6.38 / 8.93 | low |  |
| `sonar` | `true` | half | 1 | -0.04 | 1 | -0.04 | 0 / 0 / -0.11 | high |  |
| `speed` | `2` | half | 1 | 1.95 | 2 | 7.55 | 15.03 / 3.9 / 3.71 | high |  |
| `spiteful` | `2` | half | 1 | 3.31 | 2 | 5.92 | 5.77 / 6.62 / 5.38 | low |  |
| `spitfire` | `2` | half | 1 | 6.2 | 2 | 11.09 | 14.83 / 9.68 / 8.75 | low |  |
| `sprout` | `1` | half | 1 | 3.19 | 1 | 3.18 | 2.05 / 3.69 / 3.79 | high |  |
| `stagger` | `{"chance":60,"duration":2}` | half | 1 | 4.39 | 1 | 4.39 | 2.35 / 3.96 / 6.85 | high |  |
| `stealth` | `true` | half | 1 | -3.21 | 1 | -3.21 | -1.51 / -3.35 / -4.77 | low |  |
| `strangle` | `2` | half | 1 | 2.88 | 2 | 4.46 | 3.16 / 5.76 / 4.46 | low |  |
| `stunOnHit` | `1` | half | 1 | 3.04 | 1 | 3.15 | 1.98 / 3.46 / 4.01 | high |  |
| `sturdy` | `true` | half | 1 | 16.9 | 1 | 16.9 | 3.81 / 30.18 / 16.72 | high |  |
| `sunshy` | `true` | half | 1 | -7.22 | 1 | -7.22 | -3.82 / -6.95 / -10.9 | high |  |
| `supreme` | `true` | half | 1 | 17.53 | 1 | 17.53 | 5.68 / 30.18 / 16.72 | high |  |
| `supremeTide` | `true` | half | 1 | 10.33 | 1 | 10.33 | 25.95 / 11.61 / 13.66 | high | under tide (plain 17.07) |
| `swarm` | `true` | half | 1 | -0.04 | 1 | -0.04 | 0 / 0 / -0.11 | high |  |
| `swarmN` | `true` | half | 1 | 0 | – | 0 | – / – / – | high |  |
| `sweep` | `2` | half | 1 | 4.54 | 2 | 7.2 | 4.27 / 9.07 / 8.27 | high |  |
| `swift` | `true` | fixed | 0 | 9.23 | 11.33 | 25.17 | 26.62 / 19.18 / 29.72 | low |  |
| `swimmer` | `true` | fixed | 1 | 5.23 | 1 | 5.23 | 0 / 0 / -0.11 | high | under tide (plain -0.04) |
| `swimmerGrant` | `true` | half | 1 | 0 | – | 0 | – / – / – | high | under tide |
| `swipe` | `1` | half | 1 | 3.19 | 1 | 3.64 | 2.2 / 4.18 / 4.53 | low |  |
| `tangle` | `1` | half | 1 | 3.44 | 1 | 3.96 | 2.36 / 5.43 / 4.1 | low |  |
| `taunt` | `true` | half | 1 | -1.81 | 1 | -1.81 | -1.41 / -2.02 / -2.01 | high |  |
| `thorns` | `1` | n | 1 | 3.23 | 1 | 4.61 | 2.7 / 4.9 / 6.24 | low |  |
| `tide` | `true` | fixed | 1 | 2.79 | 1 | 2.79 | 0 / 0 / -0.11 | high | under tide (plain -0.04) |
| `tideGrant` | `true` | half | 1 | 19.9 | – | 19.9 | – / – / – | low | under tide |
| `timber` | `true` | half | 1 | 3.29 | 1 | 3.29 | 3.71 / 2.52 / 3.65 | high |  |
| `tipsy` | `{"chance":50,"duration":2}` | half | 1 | 1.62 | 1 | 1.62 | 0.81 / 1.56 / 2.5 | high |  |
| `tornado` | `1` | half | 1 | 2.17 | 1 | 2.3 | 1.61 / 2.3 / 2.99 | high |  |
| `toxin` | `1` | half | 1 | 6.21 | 1 | 6.53 | 6.18 / 7.18 / 6.23 | high |  |
| `trap` | `5` | half | 1 | 0.7 | 3 | 1.43 | 1.01 / 2.38 / 0.89 | high |  |
| `trident` | `true` | half | 1 | 8.93 | 1 | 8.93 | 4.05 / 10.12 / 12.63 | low |  |
| `trueStrike` | `true` | fixed | 2 | 6.37 | 2 | 6.37 | 0.5 / 0.66 / 1.55 | high | under dark (plain 0.9) |
| `tsunami` | `1` | half | 1 | 36 | 1 | 48 | 27 / 48 / 75 | low | under tide (plain 50) |
| `twin` | `true` | half | 1 | 41.23 | 1 | 41.23 | 7.83 / 44.45 / 71.4 | low |  |
| `twinShot` | `2` | half | 1 | 9.75 | 2 | 17.68 | 20.58 / 19.5 / 12.95 | low |  |
| `twinStrike` | `true` | half | 1 | 10.95 | 1 | 10.95 | 5.42 / 9.3 / 18.13 | low |  |
| `usurper` | `[3,0]` | half | 1 | -0.04 | 2 | -0.04 | 0 / 0 / -0.11 | high |  |
| `vanguard` | `1` | half | 1 | 1.14 | 1 | 1.11 | 1.36 / 1.43 / 0.54 | high |  |
| `venomMaster` | `1` | half | 1 | 0 | 1 | -0.04 | 0 / 0 / -0.11 | high |  |
| `venomous` | `2` | half | 1 | 3.13 | 2 | 6.23 | 6.26 / 6.54 / 5.89 | high |  |
| `volley` | `1` | half | 1 | 7.94 | 1 | 9.14 | 11.54 / 8.7 / 7.18 | low |  |
| `wave` | `"alternate"` | half | 1 | 4.11 | 1 | 4.11 | 2.55 / 4.52 / 4.23 | high | under tide (plain 3.77) |
| `weaken` | `1` | half | 1 | 2.22 | 1 | 2.37 | 1.91 / 2.52 / 2.67 | low |  |
| `weakness` | – | half | 1 | – | – | – | – / – / – | – | Weakness (a damage type) needs a foe that deals that type; the plain decks deal physical damage only |
| `web` | `1` | half | 1 | 0.34 | 1 | 0.36 | 0.18 / 0.45 / 0.46 | high |  |
| `wilting` | `1` | half | 1 | -4.81 | 1 | -5.67 | -4.27 / -5.34 / -7.4 | low |  |
| `wither` | `1` | half | 1 | 2.97 | 1 | 2.9 | 2.94 / 2.99 / 2.76 | high |  |
| `worship` | `true` | half | 1 | -0.04 | 1 | -0.04 | 0 / 0 / -0.11 | high |  |
| `worthy` | `true` | half | 1 | -0.04 | 1 | -0.04 | 0 / 0 / -0.11 | high |  |

## Engine keywords with no entry in the table

- `antiAir`: measured S 4.82 (b2). Not added to the table (an entry would change every card that has it).

## Reading it

- A measured S is how much Budget-v3 N the skill is worth on these units against these decks; on a 6/22 a flat skill (Armor 1) is a smaller share than on a 2/8, which the per-baseline columns show. Stats per copy, deltas and per-opponent worth are in the JSON and the sheet.
- Noise: each point is 40 seeded games; a head-to-head solve's standard error is shown per run in the sheet. Low-confidence rows want a longer run (`node tools/skill_worth.js --only=<ids> --games=120`) before a cost moves.
- Caveats (2026-10-19, read before moving a cost): the test decks are 20 copies of one unit, so a skill that compounds across copies reads high — Gain 1 Lumber on a Lumber-1 card makes every copy free (Gain, Bounty), and Exile / Mind Control / the big-damage bolts snowball (several are off the scale). Swarm opponents (Wait 0) have a step in their win rate (one more Health takes a hit more to kill), so their calibration lands at 20-90% for vanilla rather than 50%; the curves still invert against the same decks. On Round Start and On Turn Start measure the same here (a test unit is Ready after its first Wait). A skill with no effect in a field still reads about −0.05 (the curve fit at Δ = 0), which is the noise floor.
- Nothing in the game changed: card stats, `value` and every card's S stay as they were. The owner applies a measured value in the hub (Skill costs tab, the "measured" chip → Apply).
