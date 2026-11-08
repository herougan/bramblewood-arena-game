# Skill additivity, 2026-11-08 (package BAL31)

Is a pair of skills worth the sum of the two? 357 pairs covering 113 of 113 skills (each in at least 3 pairs), Level 9 (N(L) 30.16, bodies 3A + H = 30: 1/27, 9/3), 800 paired fights a variant. Worth in 3A + H points (rate 2.25 win-rate points a point, the stat yardstick on the bodies at Level 9; the ladder's L1 3.06, L5 3.09). Interaction = worth(A+B) - worth(A) - worth(B), the mean over the bodies. Measurement only: no price changed.

## Answer first

**A simple per-skill price is good enough.** Pairs of skills are worth close to the sum of the two singles: about 7 pairs in 10 within ±1 point, 94% within ±2, and almost 9 in 10 within ±1 once a flat +0.5 point a second skill is taken out. The rest is mostly a handful of pair-specific combos, not a per-skill pattern. Measurement only: no price was changed.

- **The flat +0.5.** A second skill adds on average about half a point more than its own price. Most of that is the CPU's key count (it rates a card by its number of effect keys): two placebo keys measure +0.36 [-0.28, 1.14] over twice one. It does not grow with the pair's size (slope about 0). It is not worth a rule.
- **What is left after the flat term is pair-specific.** The true spread is about 0.7 points (the observed spread less the sampling noise). Giving each skill its own combination term ("+x when on a card with another skill") does not predict new pairs: tested leave-one-out, it does worse than the flat term alone (`tools/bal31/probe_fit.py`). So there is no case for pairwise or per-skill combination budgeting.
- **Where pairs do interact:** defence + defence (Flying, Evasive, Guardian, Thorns, Armor: 10 pairs, 2 of them within ±1, mean |I| 1.7). Guardian is a team skill: it adds 2-3 points with Thorns, Evasive, Flying or Armor. Then a few known combos: Swarm + Twin Strike +3.5, Poison + Pounce +3.3, Daunt + Sweep +2.8, Fork + Meiosis +2.2. The clashes: Reload + Sweep -4.3 (Reload's drawback stops the sweep), Sweep / Avalanche + Thorns -2.4, Berserk + Spitfire -2.3, and Bulwark with Mighty or Nova -2.2 to -2.5 (Bulwark cards are near the win-rate cap, so the pair is squeezed).
- **The body matters more than the partner.** In 45% of pairs the two skills want different bodies (one is best at Attack 1, the other at the most Attack). Then the most the pair is worth on one body (a "best body" price) is up to 5-9 points under the sum of the two best-body prices (Evasive + Thorns -8.4, Fast Forward + Scar -7.7). Mean over the bodies, the sum holds. This argues for pricing a skill on the mean over bodies (as BAL29's proposal does) rather than on its best body: best-body prices overstate cards whose skills pull opposite ways.

**Recommendation:** keep one price a skill (BAL29's mean-over-bodies prices). No pairwise table. Flag the few known combos by hand when a card carries one (Guardian with a defence skill, Swarm + Twin Strike, Reload + Sweep ...).

What a longer run adds: phase 4 (276 more random pairs, about 1.2 h on free cores at 800 fights; `bash tools/bal31/segment.sh` resumes it) brings each skill to about 8 pairs, enough to read a per-skill mean |I| for rare skills (now 3 pairs each, which is noise-level). Interactions are in Level 9 points (the stat yardstick there, 2.25 win-rate points a point); in the ladder's L1 / L5 unit (about 3.1) they are about a quarter smaller.

## Headline

| Measure | Value |
|---|---|
| Pairs within ±1 point of additive | 73% (within ±2: 94%) |
| Pairs whose 95% interval holds 0 | 64% |
| Mean interaction (signed) | 0.51 |
| Mean abs interaction / noise floor (what pure noise would give) | 0.79 / 0.39 |
| Pairs clearly synergistic (95% low end > +1) / clearly clashing (high end < -1) | 10 / 6 |
| Spread of interactions: observed SD / sampling noise SD / true SD (observed less noise) | 0.87 / 0.5 / 0.71 |
| Pairs within ±1 of the mean interaction (a flat per-extra-skill term taken out) | 85% |
| Interaction against the pair's size (worth A + worth B): slope / correlation | -0.01 / -0.04 |
| Two placebo keys against twice one (the CPU's key count; 0 = the cancel holds) | +0.36 [-0.28, 1.14] |
| Price gap (best body of the pair - best body of A - best body of B): within ±1 / mean / mean abs | 60% / -0.37 / 1.33 |
| Pairs whose two skills want different bodies (Attack 1 vs most) | 45% |

Base win rate on the bodies: 1/27 29%, 9/3 45%.

Phases: 1 bodies and singles 0/0; 2 matching rounds 1-3 171/171; 3 every pair among the 20 commonest skills 183/183; 4 matching rounds 4-8 3/276.

## Worst-interacting pairs

| Pair | Interaction (95%) | A + B -> pair, best body | Per body (Attack 1 / most) | Price gap |
|---|---|---|---|---|
| reload 1 + sweep 2 | -4.28 [-5.25, -3.03] | -0.67 + 14.25 -> 5.97 | -7.61 / -0.94 | -7.61 [-9.25, -5.72] |
| swarm on + twinStrike on | +3.54 [2.65, 4.82] | 8.94 + 11.5 -> 21.22 | 6.03 / 1.06 | +0.78 [-0.89, 2.44] |
| poison 2 + pounce 2 | +3.28 [2.21, 4.49] | 11.14 + 3.14 -> 17.81 | 3.53 / 3.03 | +3.53 [1.89, 4.89] |
| guardian on + thorns 2 | +3.22 [2.17, 4.39] | 2.92 + 10.97 -> 19.33 | 5.44 / 1 | +5.44 [3.5, 7.28] |
| evasive on + guardian on | +3.12 [1.93, 4.33] | 6.94 + 2.92 -> 10.53 | 5.11 / 1.14 | +0.67 [-1.28, 2.69] |
| evasive on + repair 1 | +2.86 [1.87, 3.94] | 6.94 + 5.25 -> 11.08 | 3.33 / 2.39 | -1.11 [-2.5, 1.39] |
| daunt 1 + sweep 2 | +2.81 [1.74, 3.79] | 1.89 + 14.25 -> 20.11 | 3.97 / 1.64 | +3.97 [2.39, 5.11] |
| bulwark 2 + mighty on | -2.47 [-3.43, -1.32] ^ | 17.44 + 6.89 -> 20.11 | -0.72 / -4.22 | -4.22 [-5.67, -2.61] |
| avalanche 1 + thorns 2 | -2.4 [-3.42, -1.39] | 15.75 + 10.97 -> 21.58 | -5.14 / 0.33 | -5.14 [-7.03, -3.39] |
| sweep 2 + thorns 2 | -2.39 [-3.51, -1.19] | 14.25 + 10.97 -> 20.17 | -5.06 / 0.28 | -5.06 [-6.92, -3.39] |
| flying on + swarm on | +2.36 [1.43, 3.54] | 7.11 + 8.94 -> 14.69 | 2.94 / 1.78 | -1.36 [-3.31, 0.58] |
| berserk 2 + spitfire 1 | -2.32 [-3.42, -1.19] | 9.83 + 15.19 -> 20.78 | -4.25 / -0.39 | -4.25 [-5.83, -2.61] |
| fork on + meiosis 1 | +2.24 [1.26, 3.44] | 3.56 + 7.83 -> 14.75 | 1.11 / 3.36 | +3.36 [1.75, 5.19] |
| bulwark 2 + nova 3 | -2.21 [-3.17, -1.12] ^ | 17.44 + 5.39 -> 19.94 | -1.53 / -2.89 | -2.89 [-4.5, -1.56] |
| evasive on + thorns 2 | -2.18 [-3.21, -0.85] | 6.94 + 10.97 -> 9.5 | -3.97 / -0.39 | -8.42 [-10, -6.5] |
| flying on + guardian on | +2.08 [1.04, 3.37] | 7.11 + 2.92 -> 9.64 | 3.92 / 0.25 | -0.39 [-2.22, 1.5] |
| armor 1 + guardian on | +2.08 [1.06, 3.15] | 5.44 + 2.92 -> 7.14 | 2.83 / 1.33 | -1.22 [-2.78, 0.25] |
| delivery 1 + gash 3 | +2.06 [1, 3.15] | 11.69 + 2.22 -> 15.33 | 1.42 / 2.69 | +1.42 [-0.11, 2.39] |
| purblind on + skitter on | -2.04 [-3.06, -0.92] | -1.58 + 4.33 -> 0.53 | -1.47 / -2.61 | -2.22 [-3.5, -0.94] |
| brood 2 + weaken 1 | +2.01 [0.97, 3.06] | 15.53 + 4.25 -> 21.36 | 1.58 / 2.44 | +1.58 [0.06, 3.17] |

## Per skill: price stability

Worth = the most the single is worth on the bodies (Level 9). Mean |I| = the mean absolute interaction over its pairs; within ±1 = the share of its pairs within ±1 point; worst = its two largest interactions.

| Skill | N | Kind | Price | Worth (best body) | Pairs | Mean I | Mean abs I | Within ±1 | Worst partners |
|---|---|---|---|---|---|---|---|---|---|
| twinStrike (1) | on | attack | 6.38 | 11.5 | 3 | 2.07 | 2.07 | 0% | swarm +3.54, onslaught +1.54 |
| reload (2) | 1 | other | -4.2 | -0.67 | 3 | -1.97 | 2.05 | 33% | sweep -4.28, fastForward -1.74 |
| poisonBolt (1) | 2 | attack | 7.06 | 16.69 | 3 | 0.28 | 1.61 | 0% | inspiring -1.99, speed +1.83 |
| bulwark (1) | 2 | other | 7 | 17.44 | 3 | -1.58 | 1.58 | 33% | mighty -2.47, nova -2.21 |
| repair (1) | 1 | other | 0.5 | 5.25 | 3 | 1.56 | 1.56 | 33% | evasive +2.86, reach +1.12 |
| brood (1) | 2 | other | 6.18 | 15.53 | 3 | 0.59 | 1.54 | 0% | weaken +2.01, poison -1.42 |
| mighty (1) | on | onhit | 4.79 | 6.89 | 3 | -0.16 | 1.48 | 33% | bulwark -2.47, meiosis +1.19 |
| skitter (1) | on | onhit | 1.44 | 4.33 | 3 | 0.01 | 1.37 | 33% | purblind -2.04, diurnal +1.19 |
| spitfire (1) | 1 | attack | 7.72 | 15.19 | 3 | -0.18 | 1.37 | 67% | berserk -2.32, shield +0.96 |
| meiosis (1) | 1 | other | 4.55 | 7.83 | 3 | 1.26 | 1.26 | 33% | fork +2.24, mighty +1.19 |
| sweep (5) | 2 | attack | 5.08 | 14.25 | 21 | 0.1 | 1.23 | 48% | reload -4.28, daunt +2.81 |
| haste (1) | on | other | 2.57 | 6.28 | 3 | 1.2 | 1.2 | 33% | relict +1.56, brood +1.18 |
| invisible (2) | 2 | other | 0.96 | 6.25 | 3 | 0.44 | 1.15 | 33% | sweep +1.39, evasive -1.07 |
| fastForward (1) | 1 | other | 3.02 | 11.33 | 4 | 0.28 | 1.15 | 50% | scar +1.86, reload -1.74 |
| fork (2) | on | attack | 3.89 | 3.56 | 3 | 1.11 | 1.11 | 67% | meiosis +2.24, herbalist +0.56 |
| thorns (5) | 2 | defence | 4.48 | 10.97 | 21 | 0.01 | 1.1 | 52% | guardian +3.22, avalanche -2.4 |
| evasive (12) | on | defence | 0 | 6.94 | 22 | 0.65 | 1.08 | 55% | guardian +3.12, repair +2.86 |
| swarm (4) | on | other | 3.13 | 8.94 | 22 | 0.79 | 1.07 | 50% | twinStrike +3.54, flying +2.36 |
| inspiring (3) | 1 | other | 3 | 10.06 | 3 | -0.34 | 0.99 | 67% | poisonBolt -1.99, prey +0.5 |
| immolation (1) | 1 | other | 0 | -0.86 | 3 | 0.99 | 0.99 | 67% | riled +1.69, executioner +0.65 |
| delivery (5) | 1 | other | 2.59 | 11.69 | 22 | 0.74 | 0.95 | 59% | gash +2.06, armor +1.47 |
| avalanche (1) | 1 | attack | 6.63 | 15.75 | 3 | -0.65 | 0.95 | 67% | thorns -2.4, heat +0.46 |
| onslaught (1) | 3 | other | 2.8 | 1.44 | 3 | 0.95 | 0.95 | 67% | twinStrike +1.54, iceArrow +0.85 |
| purblind (1) | on | other | 0 | -1.58 | 4 | -0.7 | 0.95 | 75% | skitter -2.04, arrow -0.85 |
| armor (8) | 1 | defence | 2.33 | 5.44 | 21 | 0.84 | 0.93 | 57% | guardian +2.08, sweep +1.49 |
| nova (1) | 3 | attack | 4.48 | 5.39 | 4 | -0.17 | 0.93 | 75% | bulwark -2.21, carnage +1 |
| flying (31) | on | defence | 0 | 7.11 | 22 | 0.69 | 0.91 | 64% | swarm +2.36, guardian +2.08 |
| foraging (2) | 1 | other | 1.68 | 3.72 | 3 | 0.91 | 0.91 | 67% | twinStrike +1.14, moonborn +0.82 |
| ambush (1) | 4 | attack | 3.48 | 3.11 | 3 | 0.91 | 0.91 | 67% | crepuscular +1.12, invisible +1 |
| carrion (1) | 2 | other | 2.68 | 2.06 | 3 | 0.91 | 0.91 | 67% | overwhelm +1.31, wither +0.75 |
| riled (1) | 3 | other | 2.4 | 5.31 | 3 | 0.91 | 0.91 | 67% | immolation +1.69, canopyCover +0.53 |
| weaken (1) | 1 | onhit | 3.39 | 4.25 | 3 | 0.9 | 0.9 | 67% | brood +2.01, sonar +0.58 |
| nightblind (1) | on | other | -2.12 | -0.89 | 3 | -0.06 | 0.88 | 33% | almanac -1.42, injured +1.15 |
| wither (1) | 1 | onhit | 3.47 | 5.33 | 4 | 0.86 | 0.86 | 50% | undead +1.39, nocturnal +1.24 |
| pounce (7) | 2 | attack | 2.96 | 3.14 | 20 | 0.79 | 0.85 | 65% | poison +3.28, bleed +1.9 |
| carnage (1) | 3 | other | 1.68 | 1.64 | 4 | 0.85 | 0.85 | 75% | evasive +1.18, nova +1 |
| overwhelm (1) | on | onhit | 0.52 | 2.31 | 3 | 0.85 | 0.85 | 67% | carrion +1.31, carnage +0.64 |
| guardian (15) | on | defence | 0 | 2.92 | 22 | 0.58 | 0.84 | 77% | thorns +3.22, evasive +3.12 |
| iceArrow (1) | 2 | attack | 8.13 | 14.31 | 3 | 0.83 | 0.83 | 67% | darksight +1.04, onslaught +0.85 |
| backstab (2) | 2 | attack | 0.33 | -0.14 | 3 | 0.82 | 0.82 | 67% | taunt +1.14, haste +0.87 |
| berserk (1) | 2 | other | 3.6 | 9.83 | 3 | -0.73 | 0.81 | 67% | spitfire -2.32, bulldoze +0.11 |
| relict (1) | on | other | 1.24 | 3.5 | 3 | 0.74 | 0.81 | 67% | haste +1.56, foraging +0.76 |
| daunt (3) | 1 | onhit | 2.31 | 1.89 | 21 | 0.79 | 0.8 | 71% | sweep +2.81, pounce +1.28 |
| scar (1) | 2 | onhit | 3.38 | 11.83 | 3 | 0.8 | 0.8 | 67% | fastForward +1.86, sonar +0.49 |
| taunt (1) | on | other | 0.4 | 4.69 | 3 | 0.8 | 0.8 | 67% | backstab +1.14, crabClaws +1 |
| bleed (5) | 1 | onhit | 2.57 | 4.78 | 22 | 0.66 | 0.79 | 64% | pounce +1.9, sweep +1.72 |
| requiem (1) | 4 | other | 4.24 | 3.47 | 3 | 0.36 | 0.79 | 67% | arrow +1.25, guardian -0.65 |
| tally (1) | 3 | other | 3.28 | 2.11 | 3 | 0.78 | 0.78 | 100% | decay +0.92, spitfire +0.83 |
| thanatosis (1) | on | other | 2 | 5.08 | 3 | 0.78 | 0.78 | 67% | healing +1.11, pickpocket +0.67 |
| poison (16) | 2 | onhit | 4.69 | 11.14 | 21 | 0.34 | 0.77 | 86% | pounce +3.28, thorns -1.96 |
| almanac (1) | 4 | other | 4 | 10.97 | 3 | -0.18 | 0.77 | 67% | nightblind -1.42, dive +0.72 |
| nocturnal (6) | 1 | other | 1.59 | 3.5 | 22 | 0.73 | 0.76 | 64% | wither +1.24, armor +1.22 |
| diurnal (5) | 1 | other | 1.14 | 2.47 | 21 | 0.75 | 0.75 | 71% | skitter +1.19, flying +1.18 |
| quick (5) | on | other | 2.23 | 6.17 | 21 | 0.55 | 0.74 | 71% | swarm +1.72, sweep +1.42 |
| regen (4) | 1 | other | 2.3 | 2.22 | 21 | 0.74 | 0.74 | 81% | armor +1.18, delivery +1.11 |
| arrow (2) | 1 | attack | 4.26 | 5.44 | 4 | 0.31 | 0.74 | 75% | requiem +1.25, purblind -0.85 |
| timbered (2) | on | other | 0.5 | 0.17 | 3 | 0.72 | 0.72 | 100% | flying +0.85, mighty +0.79 |
| crepuscular (1) | 1 | other | 2.97 | 6 | 3 | 0.62 | 0.7 | 67% | ambush +1.12, delivery +0.87 |
| frost (1) | on | other | 1.12 | 1 | 3 | 0.7 | 0.7 | 100% | fireArrow +0.89, stealth +0.86 |
| shield (1) | 4 | other | 2.53 | 10.94 | 3 | 0.63 | 0.7 | 67% | greaterPoison +1.03, spitfire +0.96 |
| bedrock (1) | on | other | 0.3 | 0.06 | 3 | 0.68 | 0.68 | 100% | scare +0.86, flying +0.81 |
| foeScarcity (1) | on | other | 3.39 | 5.64 | 3 | 0.67 | 0.67 | 100% | web +0.93, scavenge +0.57 |
| illuminate (1) | on | other | 0.51 | 0.75 | 3 | 0.67 | 0.67 | 67% | poisonBolt +1.01, overwhelm +0.61 |
| undead (1) | on | other | 2.27 | 6.33 | 3 | 0.66 | 0.66 | 67% | wither +1.39, sequestration +0.44 |
| crabClaws (3) | on | attack | 0.1 | 1.81 | 22 | 0.24 | 0.65 | 82% | armor +1.47, evasive +1.11 |
| greaterPoison (1) | 1 | onhit | 3.69 | 10.14 | 3 | 0.64 | 0.64 | 67% | shield +1.03, keenSense +0.5 |
| speed (1) | 2 | other | 2.04 | 5.72 | 4 | 0.57 | 0.63 | 75% | poisonBolt +1.83, siege +0.49 |
| scare (1) | 2 | other | 3.58 | 9.39 | 3 | 0.62 | 0.62 | 100% | bedrock +0.86, predator +0.65 |
| healing (1) | 1 | other | 3.48 | 5.89 | 3 | 0.47 | 0.61 | 67% | thanatosis +1.11, mountainClimber +0.5 |
| reach (1) | on | attack | 0.52 | -0.39 | 3 | 0.61 | 0.61 | 67% | repair +1.12, swarm +0.53 |
| twinShot (1) | 1 | attack | 6.63 | 11.11 | 3 | -0.5 | 0.6 | 67% | delivery -1.07, swarm -0.57 |
| web (1) | 1 | onhit | 0.37 | 0.11 | 3 | 0.6 | 0.6 | 100% | foeScarcity +0.93, heat +0.47 |
| gash (3) | 3 | attack | 2.3 | 2.22 | 22 | 0.59 | 0.59 | 91% | delivery +2.06, pounce +1.35 |
| siege (1) | 1 | other | 1.07 | 1.5 | 3 | 0.55 | 0.55 | 100% | daunt +0.79, speed +0.49 |
| frostbite (2) | 1 | other | 0.5 | 0.33 | 3 | 0.54 | 0.54 | 100% | iceArrow +0.61, rage +0.53 |
| darksight (1) | on | other | 3 | 0.44 | 3 | 0.47 | 0.54 | 67% | iceArrow +1.04, inspiring +0.47 |
| salt (1) | on | other | 0.38 | 0 | 3 | 0.53 | 0.53 | 100% | skitter +0.89, fork +0.53 |
| fireArrow (2) | 1 | attack | 6.56 | 10.58 | 3 | 0.08 | 0.52 | 100% | frost +0.89, purblind -0.42 |
| decay (1) | 1 | onhit | 6.13 | 13.47 | 3 | 0.38 | 0.52 | 100% | tally +0.92, prey +0.43 |
| scavenge (1) | 1 | other | 2.27 | 4.86 | 3 | 0.52 | 0.52 | 100% | foeScarcity +0.57, dive +0.53 |
| canopyCover (1) | on | defence | 0.07 | 0 | 3 | 0.51 | 0.51 | 100% | nocturnal +0.56, riled +0.53 |
| executioner (1) | 2 | onhit | 0.2 | 0.25 | 3 | 0.5 | 0.5 | 100% | immolation +0.65, riled +0.5 |
| sonar (2) | on | other | 0.66 | 0.61 | 3 | 0.49 | 0.49 | 100% | weaken +0.58, scar +0.49 |
| lumberjack (1) | on | other | 3.29 | 10.47 | 3 | 0.33 | 0.49 | 67% | crabClaws +1.07, fireArrow -0.24 |
| tide (31) | on | other | 0.5 | 0.56 | 20 | 0.48 | 0.48 | 100% | delivery +0.81, flying +0.72 |
| predator (2) | 1 | onhit | 1.12 | 1.36 | 3 | 0.48 | 0.48 | 100% | scare +0.65, keenEye +0.47 |
| mountainClimber (4) | on | other | 4 | 1.5 | 20 | 0.42 | 0.47 | 100% | poison +0.75, delivery +0.75 |
| drunk (1) | on | other | -3.7 | 0.14 | 3 | -0.47 | 0.47 | 67% | quick -1.26, darksight -0.11 |
| herbalist (1) | 1 | other | 0.58 | 0.39 | 3 | 0.47 | 0.47 | 100% | fork +0.56, weaponMaster +0.47 |
| injured (1) | 2 | other | -2 | -0.72 | 3 | 0.31 | 0.47 | 67% | nightblind +1.15, armor -0.24 |
| weaponMaster (1) | 1 | onhit | 0.37 | 0.83 | 3 | 0.43 | 0.43 | 100% | repair +0.69, herbalist +0.47 |
| dive (2) | 2 | attack | 0 | 0 | 3 | 0.42 | 0.42 | 100% | almanac +0.72, scavenge +0.53 |
| prey (1) | on | other | 0.03 | 0.17 | 3 | 0.41 | 0.41 | 100% | inspiring +0.5, decay +0.43 |
| sequestration (1) | on | onhit | 0.43 | 0.72 | 3 | 0.14 | 0.4 | 100% | undead +0.44, recoil -0.39 |
| keenSense (1) | on | other | 0.66 | 0.5 | 3 | 0.39 | 0.39 | 100% | greaterPoison +0.5, backstab +0.44 |
| pickpocket (1) | 1 | onhit | 1 | 13.44 | 3 | 0.39 | 0.39 | 100% | thanatosis +0.67, onslaught +0.47 |
| bulldoze (1) | 1 | onhit | 2.28 | 4.17 | 3 | 0.35 | 0.35 | 100% | nocturnal +0.68, pierce +0.26 |
| fletcher (1) | 1 | onhit | 3.19 | 0.83 | 3 | 0.33 | 0.35 | 100% | thanatosis +0.56, scavenge +0.46 |
| stealth (1) | on | attack | 6.88 | 16.72 | 3 | 0.35 | 0.35 | 100% | frost +0.86, hibernate +0.1 |
| heat (1) | on | other | 1.2 | 1.33 | 4 | 0.34 | 0.34 | 100% | web +0.47, avalanche +0.46 |
| shell (3) | 4 | defence | 0.87 | 1.47 | 3 | 0.33 | 0.33 | 100% | diurnal +0.56, packLeader +0.28 |
| keenEye (2) | on | other | 0.34 | 0 | 3 | 0.33 | 0.33 | 100% | arrow +0.5, predator +0.47 |
| pierce (2) | 1 | other | 0.23 | 0.11 | 3 | 0.32 | 0.32 | 100% | shatter +0.39, predator +0.31 |
| moonborn (1) | 4 | other | 3.69 | 6.42 | 3 | 0.32 | 0.32 | 100% | foraging +0.82, thorns +0.13 |
| tornado (1) | 1 | attack | 1.96 | 1.17 | 4 | 0.31 | 0.31 | 100% | purblind +0.5, heat +0.39 |
| trap (1) | 4 | other | 2.9 | 2.14 | 3 | 0.31 | 0.31 | 100% | carrion +0.68, poison +0.25 |
| shatter (1) | 2 | onhit | 0.04 | 0.17 | 3 | 0.3 | 0.3 | 100% | requiem +0.47, pierce +0.39 |
| rage (1) | on | other | 3.01 | 3.11 | 3 | 0.24 | 0.24 | 100% | frostbite +0.53, twinShot +0.15 |
| dry (1) | on | other | 4 | 0.5 | 3 | 0.2 | 0.2 | 100% | prey +0.31, bleed +0.22 |
| hibernate (1) | on | other | 1.9 | 0.08 | 3 | 0.12 | 0.19 | 100% | bedrock +0.36, relict -0.1 |
| packLeader (1) | on | other | 0 | 0.33 | 3 | 0.19 | 0.19 | 100% | shell +0.28, reach +0.18 |
| immunity (2) | on | other | 0.3 | 1.06 | 3 | 0.16 | 0.16 | 100% | flying +0.26, weaken +0.12 |
| recoil (1) | 2 | other | 2 | -2.83 | 3 | -0.12 | 0.14 | 100% | sequestration -0.39, keenEye +0.03 |

^ = a body over 85% win rate (the cap squeezes the pair). Every pair is in the json (per body, the singles, the gap).

