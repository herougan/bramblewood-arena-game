# Skill additivity, 2026-11-09 (package BAL31)

Is a pair of skills worth the sum of the two? 454 pairs covering 113 of 113 skills (each in at least 4 pairs), Level 9 (N(L) 30.16, bodies 3A + H = 30: 1/27, 9/3), 800 paired fights a variant. Worth in 3A + H points (rate 2.25 win-rate points a point, the stat yardstick on the bodies at Level 9; the ladder's L1 3.06, L5 3.09). Interaction = worth(A+B) - worth(A) - worth(B), the mean over the bodies. Measurement only: no price changed.

## Answer first

**A simple per-skill price is good enough.** Pairs of skills are worth close to the sum of the two singles: about 7 pairs in 10 within ±1 point, 94% within ±2, and 85% within ±1 once a flat +0.5 point a second skill is taken out. The rest is mostly a handful of pair-specific combos, not a per-skill pattern. Measurement only: no price was changed.

- **The flat +0.5.** A second skill adds on average about half a point more than its own price. Most of that is the CPU's key count (it rates a card by its number of effect keys): two placebo keys measure +0.36 [-0.28, 1.14] over twice one. It does not grow with the pair's size (slope about 0). It is not worth a rule.
- **What is left after the flat term is pair-specific.** The true spread is about 0.7 points (the observed spread less the sampling noise). Giving each skill its own combination term ("+x when on a card with another skill") does not predict new pairs: tested leave-one-out, it does worse than the flat term alone (`tools/bal31/probe_fit.py`). So there is no case for pairwise or per-skill combination budgeting.
- **Where pairs do interact:** defence + defence (Flying, Evasive, Guardian, Thorns, Armor: 10 pairs, 2 of them within ±1, mean |I| 1.7). Guardian is a team skill: it adds 2-3 points with Thorns, Evasive, Flying or Armor. Then a few known combos: Swarm + Twin Strike +3.5, Poison + Pounce +3.3, Daunt + Sweep +2.8, Fork + Meiosis +2.2. The clashes: Reload + Sweep -4.3 (mostly on the Attack 1 body; why is not checked), Sweep / Avalanche + Thorns -2.4, Berserk + Spitfire -2.3, and Bulwark with Mighty or Nova -2.2 to -2.5 (Bulwark cards are near the win-rate cap, so the pair is squeezed).
- **The body matters more than the partner.** In 45% of pairs the two skills want different bodies (one is best at Attack 1, the other at the most Attack). Then the most the pair is worth on one body (a "best body" price) is up to 5-9 points under the sum of the two best-body prices (Evasive + Thorns -8.4, Fast Forward + Scar -7.7). Mean over the bodies, the sum holds. This argues for pricing a skill on the mean over bodies (as BAL29's proposal does) rather than on its best body: best-body prices overstate cards whose skills pull opposite ways.

**Recommendation:** keep one price a skill (BAL29's mean-over-bodies prices). No pairwise table. Flag the few known combos by hand when a card carries one (Guardian with a defence skill, Swarm + Twin Strike, Reload + Sweep ...).

What a longer run adds: phase 4 (276 more random pairs, about 1.2 h on free cores at 800 fights; `bash tools/bal31/segment.sh` resumes it) brings each skill to about 8 pairs, enough to read a per-skill mean |I| for rare skills (now 3 pairs each, which is noise-level). Interactions are in Level 9 points (the stat yardstick there, 2.25 win-rate points a point); in the ladder's L1 / L5 unit (about 3.1) they are about a quarter smaller.

## Headline

| Measure | Value |
|---|---|
| Pairs within ±1 point of additive | 73% (within ±2: 94%) |
| Pairs whose 95% interval holds 0 | 64% |
| Mean interaction (signed) | 0.52 |
| Mean abs interaction / noise floor (what pure noise would give) | 0.81 / 0.39 |
| Pairs clearly synergistic (95% low end > +1) / clearly clashing (high end < -1) | 15 / 9 |
| Spread of interactions: observed SD / sampling noise SD / true SD (observed less noise) | 0.94 / 0.49 / 0.8 |
| Pairs within ±1 of the mean interaction (a flat per-extra-skill term taken out) | 85% |
| Interaction against the pair's size (worth A + worth B): slope / correlation | -0.02 / -0.08 |
| Two placebo keys against twice one (the CPU's key count; 0 = the cancel holds) | +0.36 [-0.28, 1.14] |
| Price gap (best body of the pair - best body of A - best body of B): within ±1 / mean / mean abs | 61% / -0.34 / 1.33 |
| Pairs whose two skills want different bodies (Attack 1 vs most) | 46% |

Base win rate on the bodies: 1/27 29%, 9/3 45%.

Phases: 1 bodies and singles 0/0; 2 matching rounds 1-3 171/171; 3 every pair among the 20 commonest skills 183/183; 4 matching rounds 4-8 100/276.

## Worst-interacting pairs

| Pair | Interaction (95%) | A + B -> pair, best body | Per body (Attack 1 / most) | Price gap |
|---|---|---|---|---|
| twinShot 1 + weaponMaster 1 | +7.47 [6.42, 8.57] | 11.11 + 0.83 -> 24.67 | 12.72 / 2.22 | +12.72 [11.06, 14.28] |
| reload 1 + sweep 2 | -4.28 [-5.25, -3.03] | -0.67 + 14.25 -> 5.97 | -7.61 / -0.94 | -7.61 [-9.25, -5.72] |
| swarm on + twinStrike on | +3.54 [2.65, 4.82] | 8.94 + 11.5 -> 21.22 | 6.03 / 1.06 | +0.78 [-0.89, 2.44] |
| recoil 2 + reload 1 | +3.4 [2.43, 4.42] | -2.83 + -0.67 -> -2.33 | 1.17 / 5.64 | +1.17 [-0.08, 2.33] |
| poison 2 + pounce 2 | +3.28 [2.21, 4.49] | 11.14 + 3.14 -> 17.81 | 3.53 / 3.03 | +3.53 [1.89, 4.89] |
| guardian on + thorns 2 | +3.22 [2.17, 4.39] | 2.92 + 10.97 -> 19.33 | 5.44 / 1 | +5.44 [3.5, 7.28] |
| herbalist 1 + regen 1 | +3.18 [2.29, 4.24] | 0.39 + 2.22 -> 6.28 | 2.47 / 3.89 | +3.67 [2.33, 5.5] |
| evasive on + guardian on | +3.12 [1.93, 4.33] | 6.94 + 2.92 -> 10.53 | 5.11 / 1.14 | +0.67 [-1.28, 2.69] |
| evasive on + repair 1 | +2.86 [1.87, 3.94] | 6.94 + 5.25 -> 11.08 | 3.33 / 2.39 | -1.11 [-2.5, 1.39] |
| daunt 1 + sweep 2 | +2.81 [1.74, 3.79] | 1.89 + 14.25 -> 20.11 | 3.97 / 1.64 | +3.97 [2.39, 5.11] |
| bulwark 2 + mighty on | -2.47 [-3.43, -1.32] ^ | 17.44 + 6.89 -> 20.11 | -0.72 / -4.22 | -4.22 [-5.67, -2.61] |
| avalanche 1 + thorns 2 | -2.4 [-3.42, -1.39] | 15.75 + 10.97 -> 21.58 | -5.14 / 0.33 | -5.14 [-7.03, -3.39] |
| avalanche 1 + meiosis 1 | -2.4 [-3.43, -1.37] ^ | 15.75 + 7.83 -> 19.97 | -2.44 / -2.36 | -3.61 [-5.28, -1.67] |
| sweep 2 + thorns 2 | -2.39 [-3.51, -1.19] | 14.25 + 10.97 -> 20.17 | -5.06 / 0.28 | -5.06 [-6.92, -3.39] |
| flying on + swarm on | +2.36 [1.43, 3.54] | 7.11 + 8.94 -> 14.69 | 2.94 / 1.78 | -1.36 [-3.31, 0.58] |
| iceArrow 2 + thorns 2 | -2.33 [-3.57, -1.14] | 14.31 + 10.97 -> 20.5 | -4.78 / 0.11 | -4.78 [-6.69, -2.92] |
| berserk 2 + spitfire 1 | -2.32 [-3.42, -1.19] | 9.83 + 15.19 -> 20.78 | -4.25 / -0.39 | -4.25 [-5.83, -2.61] |
| decay 1 + reload 1 | -2.31 [-3.49, -1.1] | 13.47 + -0.67 -> 8.61 | -4.19 / -0.42 | -4.19 [-5.72, -2.58] |
| fork on + meiosis 1 | +2.24 [1.26, 3.44] | 3.56 + 7.83 -> 14.75 | 1.11 / 3.36 | +3.36 [1.75, 5.19] |
| bulwark 2 + nova 3 | -2.21 [-3.17, -1.12] ^ | 17.44 + 5.39 -> 19.94 | -1.53 / -2.89 | -2.89 [-4.5, -1.56] |

## Per skill: price stability

Worth = the most the single is worth on the bodies (Level 9). Mean |I| = the mean absolute interaction over its pairs; within ±1 = the share of its pairs within ±1 point; worst = its two largest interactions.

| Skill | N | Kind | Price | Worth (best body) | Pairs | Mean I | Mean abs I | Within ±1 | Worst partners |
|---|---|---|---|---|---|---|---|---|---|
| reload (2) | 1 | other | -4.2 | -0.67 | 5 | -0.96 | 2.37 | 20% | sweep -4.28, recoil +3.4 |
| twinShot (1) | 1 | attack | 6.63 | 11.11 | 5 | 1 | 2.05 | 60% | weaponMaster +7.47, delivery -1.07 |
| weaponMaster (1) | 1 | onhit | 0.37 | 0.83 | 5 | 1.83 | 1.83 | 80% | twinShot +7.47, repair +0.69 |
| twinStrike (1) | on | attack | 7.75 | 11.5 | 5 | 1.63 | 1.63 | 20% | swarm +3.54, onslaught +1.54 |
| mighty (1) | on | onhit | 4.79 | 6.89 | 5 | -0.28 | 1.46 | 40% | bulwark -2.47, recoil -1.9 |
| poisonBolt (1) | 2 | attack | 7.06 | 16.69 | 5 | 0.33 | 1.44 | 20% | inspiring -1.99, speed +1.83 |
| repair (1) | 1 | other | 2.93 | 5.25 | 5 | 1.31 | 1.31 | 40% | evasive +2.86, tornado +1.33 |
| meiosis (1) | 1 | other | 4.55 | 7.83 | 5 | 0.25 | 1.27 | 40% | avalanche -2.4, fork +2.24 |
| skitter (1) | on | onhit | 3.5 | 4.33 | 5 | 0.21 | 1.27 | 40% | purblind -2.04, relict +1.61 |
| sweep (5) | 2 | attack | 5.08 | 14.25 | 23 | 0.2 | 1.23 | 48% | reload -4.28, daunt +2.81 |
| thorns (5) | 2 | defence | 5.08 | 10.97 | 23 | 0 | 1.2 | 48% | guardian +3.22, avalanche -2.4 |
| bulwark (1) | 2 | other | 9.21 | 17.44 | 5 | -0.82 | 1.16 | 60% | mighty -2.47, nova -2.21 |
| recoil (1) | 2 | other | -5.88 | -2.83 | 5 | 0.23 | 1.14 | 60% | reload +3.4, mighty -1.9 |
| brood (1) | 2 | other | 6.18 | 15.53 | 5 | 0.56 | 1.13 | 40% | weaken +2.01, poison -1.42 |
| iceArrow (1) | 2 | attack | 8.13 | 14.31 | 5 | 0.2 | 1.13 | 60% | thorns -2.33, darksight +1.04 |
| relict (1) | on | other | 1.24 | 3.5 | 5 | 1.09 | 1.13 | 40% | fireArrow +1.64, skitter +1.61 |
| avalanche (1) | 1 | attack | 9.25 | 15.75 | 5 | -0.84 | 1.08 | 60% | thorns -2.4, meiosis -2.4 |
| immolation (1) | 1 | other | 0 | -0.86 | 5 | 1.08 | 1.08 | 40% | riled +1.69, gash +1.36 |
| swarm (4) | on | other | 3.13 | 8.94 | 23 | 0.81 | 1.07 | 48% | twinStrike +3.54, flying +2.36 |
| evasive (12) | on | defence | 0 | 6.94 | 23 | 0.65 | 1.06 | 57% | guardian +3.12, repair +2.86 |
| fork (2) | on | attack | 4.95 | 3.56 | 5 | 1.06 | 1.06 | 60% | meiosis +2.24, carrion +1.47 |
| invisible (2) | 2 | other | 1.64 | 6.25 | 4 | 0.52 | 1.06 | 50% | sweep +1.39, evasive -1.07 |
| herbalist (1) | 1 | other | 0.23 | 0.39 | 5 | 1.04 | 1.04 | 80% | regen +3.18, canopyCover +0.61 |
| haste (1) | on | other | 2.57 | 6.28 | 5 | 1.03 | 1.03 | 60% | relict +1.56, brood +1.18 |
| spitfire (1) | 1 | attack | 7.72 | 15.19 | 5 | 0.02 | 1.02 | 80% | berserk -2.32, shield +0.96 |
| nova (1) | 3 | attack | 3.82 | 5.39 | 5 | 0.11 | 1 | 60% | bulwark -2.21, tally +1.26 |
| shield (1) | 4 | other | 2.53 | 10.94 | 5 | 0.93 | 0.97 | 60% | thorns +2.08, greaterPoison +1.03 |
| inspiring (3) | 1 | other | 3.96 | 10.06 | 4 | -0.47 | 0.96 | 75% | poisonBolt -1.99, greaterPoison -0.87 |
| delivery (5) | 1 | other | 5.25 | 11.69 | 23 | 0.75 | 0.95 | 61% | gash +2.06, armor +1.47 |
| ambush (1) | 4 | attack | 3.42 | 3.11 | 5 | 0.95 | 0.95 | 60% | crepuscular +1.12, swarm +1.1 |
| purblind (1) | on | other | 0 | -1.58 | 4 | -0.7 | 0.95 | 75% | skitter -2.04, arrow -0.85 |
| armor (8) | 1 | defence | 2.33 | 5.44 | 23 | 0.86 | 0.93 | 57% | guardian +2.08, sweep +1.49 |
| requiem (1) | 4 | other | 4.24 | 3.47 | 4 | 0.61 | 0.93 | 50% | overwhelm +1.36, arrow +1.25 |
| foraging (2) | 1 | other | 1.68 | 3.72 | 4 | 0.92 | 0.92 | 75% | twinStrike +1.14, mighty +0.97 |
| carrion (1) | 2 | other | 2.68 | 2.06 | 5 | 0.91 | 0.91 | 60% | fork +1.47, overwhelm +1.31 |
| overwhelm (1) | on | onhit | 1.05 | 2.31 | 5 | 0.91 | 0.91 | 60% | requiem +1.36, carrion +1.31 |
| undead (1) | on | other | 2.27 | 6.33 | 5 | 0.9 | 0.9 | 60% | poisonBolt +1.58, wither +1.39 |
| tally (1) | 3 | other | 1.41 | 2.11 | 5 | 0.89 | 0.89 | 80% | nova +1.26, decay +0.92 |
| flying (31) | on | defence | 0 | 7.11 | 24 | 0.66 | 0.88 | 67% | swarm +2.36, guardian +2.08 |
| fastForward (1) | 1 | other | 4.24 | 11.33 | 6 | 0.29 | 0.88 | 67% | scar +1.86, reload -1.74 |
| decay (1) | 1 | onhit | 5.77 | 13.47 | 5 | -0.32 | 0.86 | 80% | reload -2.31, tally +0.92 |
| carnage (1) | 3 | other | 1.68 | 1.64 | 4 | 0.85 | 0.85 | 75% | evasive +1.18, nova +1 |
| speed (1) | 2 | other | 2.44 | 5.72 | 6 | 0.82 | 0.85 | 50% | poisonBolt +1.83, sweep +1.53 |
| wither (1) | 1 | onhit | 3.57 | 5.33 | 6 | 0.69 | 0.84 | 50% | undead +1.39, nocturnal +1.24 |
| regen (4) | 1 | other | 2.3 | 2.22 | 23 | 0.83 | 0.83 | 78% | herbalist +3.18, armor +1.18 |
| guardian (15) | on | defence | 0 | 2.92 | 23 | 0.57 | 0.81 | 78% | thorns +3.22, evasive +3.12 |
| nightblind (1) | on | other | -2.12 | -0.89 | 5 | -0.3 | 0.79 | 60% | almanac -1.42, injured +1.15 |
| riled (1) | 3 | other | 2.08 | 5.31 | 5 | 0.79 | 0.79 | 80% | immolation +1.69, shield +0.67 |
| taunt (1) | on | other | 0.4 | 4.69 | 5 | 0.74 | 0.79 | 60% | drunk +1.42, backstab +1.14 |
| pounce (7) | 2 | attack | 2.96 | 3.14 | 22 | 0.72 | 0.78 | 68% | poison +3.28, bleed +1.9 |
| daunt (3) | 1 | onhit | 1.72 | 1.89 | 22 | 0.77 | 0.78 | 73% | sweep +2.81, pounce +1.28 |
| arrow (2) | 1 | attack | 4.26 | 5.44 | 5 | 0.43 | 0.77 | 80% | requiem +1.25, keenSense +0.9 |
| scavenge (1) | 1 | other | 2.99 | 4.86 | 5 | 0.61 | 0.77 | 80% | gash +1.87, foeScarcity +0.57 |
| poison (16) | 2 | onhit | 4.75 | 11.14 | 23 | 0.36 | 0.76 | 87% | pounce +3.28, thorns -1.96 |
| nocturnal (6) | 1 | other | 1.59 | 3.5 | 23 | 0.73 | 0.76 | 65% | wither +1.24, armor +1.22 |
| bleed (5) | 1 | onhit | 2.89 | 4.78 | 24 | 0.57 | 0.76 | 67% | pounce +1.9, sweep +1.72 |
| almanac (1) | 4 | other | 6 | 10.97 | 5 | -0.21 | 0.75 | 80% | nightblind -1.42, twinShot -0.97 |
| berserk (1) | 2 | other | 3.68 | 9.83 | 4 | -0.41 | 0.75 | 75% | spitfire -2.32, riled +0.54 |
| thanatosis (1) | on | other | 2 | 5.08 | 5 | 0.75 | 0.75 | 80% | healing +1.11, ambush +0.93 |
| quick (5) | on | other | 2.23 | 6.17 | 21 | 0.55 | 0.74 | 71% | swarm +1.72, sweep +1.42 |
| fireArrow (2) | 1 | attack | 6.56 | 10.58 | 5 | 0.48 | 0.74 | 80% | relict +1.64, frost +0.89 |
| diurnal (5) | 1 | other | 1.14 | 2.47 | 23 | 0.73 | 0.73 | 74% | skitter +1.19, flying +1.18 |
| frost (1) | on | other | 1.12 | 1 | 4 | 0.73 | 0.73 | 100% | fireArrow +0.89, stealth +0.86 |
| onslaught (1) | 3 | other | 1.39 | 1.44 | 5 | 0.73 | 0.73 | 80% | twinStrike +1.54, iceArrow +0.85 |
| foeScarcity (1) | on | other | 3.39 | 5.64 | 5 | 0.54 | 0.72 | 80% | wither +1.15, web +0.93 |
| lumberjack (1) | on | other | 4.85 | 10.47 | 4 | 0.59 | 0.71 | 50% | armor +1.35, crabClaws +1.07 |
| gash (3) | 3 | attack | 2.73 | 2.22 | 24 | 0.68 | 0.68 | 83% | delivery +2.06, scavenge +1.87 |
| timbered (2) | on | other | 0.5 | 0.17 | 5 | 0.67 | 0.67 | 100% | flying +0.85, pickpocket +0.83 |
| darksight (1) | on | other | 3 | 0.44 | 5 | 0.62 | 0.66 | 60% | iceArrow +1.04, stealth +1.03 |
| greaterPoison (1) | 1 | onhit | 4.37 | 10.14 | 5 | 0.31 | 0.66 | 80% | shield +1.03, inspiring -0.87 |
| illuminate (1) | on | other | 0.51 | 0.75 | 5 | 0.66 | 0.66 | 80% | poisonBolt +1.01, flying +0.96 |
| scar (1) | 2 | onhit | 3.41 | 11.83 | 5 | 0.6 | 0.66 | 80% | fastForward +1.86, invisible +0.78 |
| weaken (1) | 1 | onhit | 2.64 | 4.25 | 5 | 0.57 | 0.64 | 80% | brood +2.01, sonar +0.58 |
| bedrock (1) | on | other | 0.3 | 0.06 | 4 | 0.63 | 0.63 | 100% | scare +0.86, flying +0.81 |
| healing (1) | 1 | other | 3.48 | 5.89 | 5 | 0.54 | 0.63 | 80% | thanatosis +1.11, haste +0.71 |
| crabClaws (3) | on | attack | 0.1 | 1.81 | 24 | 0.22 | 0.61 | 83% | armor +1.47, evasive +1.11 |
| pickpocket (1) | 1 | onhit | 4.77 | 13.44 | 5 | 0.61 | 0.61 | 80% | immolation +1.06, timbered +0.83 |
| drunk (1) | on | other | -3.7 | 0.14 | 5 | 0.03 | 0.59 | 60% | taunt +1.42, quick -1.26 |
| keenSense (1) | on | other | 0.66 | 0.5 | 5 | 0.59 | 0.59 | 100% | arrow +0.9, delivery +0.87 |
| reach (1) | on | attack | 1 | -0.39 | 5 | 0.59 | 0.59 | 80% | repair +1.12, haste +0.82 |
| canopyCover (1) | on | defence | 0.07 | 0 | 5 | 0.58 | 0.58 | 100% | crepuscular +0.75, herbalist +0.61 |
| crepuscular (1) | 1 | other | 2.97 | 6 | 5 | 0.53 | 0.58 | 80% | ambush +1.12, delivery +0.87 |
| siege (1) | 1 | other | 1.07 | 1.5 | 4 | 0.58 | 0.58 | 100% | daunt +0.79, packLeader +0.68 |
| backstab (2) | 2 | attack | 0.33 | -0.14 | 5 | 0.57 | 0.57 | 80% | taunt +1.14, haste +0.87 |
| predator (2) | 1 | onhit | 1.12 | 1.36 | 5 | 0.57 | 0.57 | 100% | brood +0.99, scare +0.65 |
| web (1) | 1 | onhit | 0.97 | 0.11 | 5 | 0.52 | 0.52 | 100% | foeScarcity +0.93, heat +0.47 |
| injured (1) | 2 | other | -2 | -0.72 | 4 | 0.08 | 0.51 | 75% | nightblind +1.15, skitter -0.61 |
| scare (1) | 2 | other | 3.76 | 9.39 | 4 | 0.51 | 0.51 | 100% | bedrock +0.86, predator +0.65 |
| sequestration (1) | on | onhit | 0.43 | 0.72 | 5 | 0.35 | 0.51 | 100% | bulwark +0.86, thanatosis +0.49 |
| tornado (1) | 1 | attack | 1.17 | 1.17 | 5 | 0.51 | 0.51 | 80% | repair +1.33, purblind +0.5 |
| executioner (1) | 2 | onhit | 0.2 | 0.25 | 5 | 0.5 | 0.5 | 100% | nocturnal +0.71, immolation +0.65 |
| salt (1) | on | other | 0.38 | 0 | 4 | 0.49 | 0.49 | 100% | skitter +0.89, fork +0.53 |
| stealth (1) | on | attack | 6.88 | 16.72 | 5 | 0.33 | 0.49 | 80% | darksight +1.03, frost +0.86 |
| tide (31) | on | other | 0.5 | 0.56 | 21 | 0.48 | 0.48 | 100% | delivery +0.81, flying +0.72 |
| mountainClimber (4) | on | other | 4 | 1.5 | 22 | 0.41 | 0.46 | 100% | poison +0.75, delivery +0.75 |
| prey (1) | on | other | 0.03 | 0.17 | 5 | 0.44 | 0.44 | 100% | fireArrow +0.53, inspiring +0.5 |
| frostbite (2) | 1 | other | 0.19 | 0.33 | 5 | 0.33 | 0.42 | 100% | iceArrow +0.61, rage +0.53 |
| pierce (2) | 1 | other | 0.23 | 0.11 | 5 | 0.42 | 0.42 | 100% | evasive +0.72, onslaught +0.42 |
| sonar (2) | on | other | 0.66 | 0.61 | 5 | 0.42 | 0.42 | 100% | weaken +0.58, scar +0.49 |
| moonborn (1) | 4 | other | 3.69 | 6.42 | 5 | 0.1 | 0.42 | 100% | foraging +0.82, poisonBolt -0.79 |
| dive (2) | 2 | attack | 0 | 0 | 5 | 0.41 | 0.41 | 100% | almanac +0.72, scavenge +0.53 |
| fletcher (1) | 1 | onhit | 3.19 | 0.83 | 5 | 0.39 | 0.4 | 100% | healing +0.61, thanatosis +0.56 |
| keenEye (2) | on | other | 0.34 | 0 | 5 | 0.37 | 0.37 | 100% | repair +0.56, arrow +0.5 |
| bulldoze (1) | 1 | onhit | 2.23 | 4.17 | 5 | 0.37 | 0.37 | 100% | nocturnal +0.68, almanac +0.47 |
| shatter (1) | 2 | onhit | 0.04 | 0.17 | 5 | 0.36 | 0.36 | 100% | fastForward +0.67, requiem +0.47 |
| dry (1) | on | other | 4 | 0.5 | 5 | 0.35 | 0.35 | 100% | twinStrike +0.83, reach +0.32 |
| heat (1) | on | other | 1.2 | 1.33 | 4 | 0.34 | 0.34 | 100% | web +0.47, avalanche +0.46 |
| trap (1) | 4 | other | 2.25 | 2.14 | 4 | 0.34 | 0.34 | 100% | carrion +0.68, dive +0.42 |
| packLeader (1) | on | other | 0 | 0.33 | 4 | 0.31 | 0.31 | 100% | siege +0.68, shell +0.28 |
| shell (3) | 4 | defence | 0.87 | 1.47 | 5 | 0.28 | 0.29 | 100% | diurnal +0.56, sonar +0.43 |
| immunity (2) | on | other | 0.3 | 1.06 | 5 | 0.29 | 0.29 | 100% | spitfire +0.82, flying +0.26 |
| hibernate (1) | on | other | 1.9 | 0.08 | 5 | 0.22 | 0.26 | 100% | web +0.42, bedrock +0.36 |
| rage (1) | on | other | 3.01 | 3.11 | 5 | 0.05 | 0.23 | 100% | frostbite +0.53, flying -0.25 |

^ = a body over 85% win rate (the cap squeezes the pair). Every pair is in the json (per body, the singles, the gap).

