# Skill additivity, 2026-11-09 (package BAL31)

Is a pair of skills worth the sum of the two? 630 pairs covering 113 of 113 skills (each in at least 8 pairs), Level 9 (N(L) 30.16, bodies 3A + H = 30: 1/27, 9/3), 800 paired fights a variant. Worth in 3A + H points (rate 2.25 win-rate points a point, the stat yardstick on the bodies at Level 9; the ladder's L1 3.06, L5 3.09). Interaction = worth(A+B) - worth(A) - worth(B), the mean over the bodies. Measurement only: no price changed.

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
| Pairs within ±1 point of additive | 75% (within ±2: 94%) |
| Pairs whose 95% interval holds 0 | 65% |
| Mean interaction (signed) | 0.48 |
| Mean abs interaction / noise floor (what pure noise would give) | 0.79 / 0.38 |
| Pairs clearly synergistic (95% low end > +1) / clearly clashing (high end < -1) | 18 / 14 |
| Spread of interactions: observed SD / sampling noise SD / true SD (observed less noise) | 0.93 / 0.49 / 0.8 |
| Pairs within ±1 of the mean interaction (a flat per-extra-skill term taken out) | 84% |
| Interaction against the pair's size (worth A + worth B): slope / correlation | -0.01 / -0.07 |
| Two placebo keys against twice one (the CPU's key count; 0 = the cancel holds) | +0.36 [-0.28, 1.14] |
| Price gap (best body of the pair - best body of A - best body of B): within ±1 / mean / mean abs | 62% / -0.35 / 1.33 |
| Pairs whose two skills want different bodies (Attack 1 vs most) | 48% |

Base win rate on the bodies: 1/27 29%, 9/3 45%.

Phases: 1 bodies and singles 0/0; 2 matching rounds 1-3 171/171; 3 every pair among the 20 commonest skills 183/183; 4 matching rounds 4-8 276/276.

## Worst-interacting pairs

| Pair | Interaction (95%) | A + B -> pair, best body | Per body (Attack 1 / most) | Price gap |
|---|---|---|---|---|
| twinShot 1 + weaponMaster 1 | +7.47 [6.42, 8.57] | 11.11 + 0.83 -> 24.67 | 12.72 / 2.22 | +12.72 [11.06, 14.28] |
| drunk on + twinStrike on | -4.56 [-5.65, -3.11] | 0.14 + 11.5 -> 3.78 | -2.61 / -6.5 | -7.86 [-9.81, -5.83] |
| reload 1 + sweep 2 | -4.28 [-5.25, -3.03] | -0.67 + 14.25 -> 5.97 | -7.61 / -0.94 | -7.61 [-9.25, -5.72] |
| drunk on + stealth on | +4.04 [3.01, 4.94] | 0.14 + 16.72 -> 17.5 | 0.64 / 7.44 | +0.64 [-0.64, 1.83] |
| swarm on + twinStrike on | +3.54 [2.65, 4.82] | 8.94 + 11.5 -> 21.22 | 6.03 / 1.06 | +0.78 [-0.89, 2.44] |
| recoil 2 + reload 1 | +3.4 [2.43, 4.42] | -2.83 + -0.67 -> -2.33 | 1.17 / 5.64 | +1.17 [-0.08, 2.33] |
| poison 2 + pounce 2 | +3.28 [2.21, 4.49] | 11.14 + 3.14 -> 17.81 | 3.53 / 3.03 | +3.53 [1.89, 4.89] |
| guardian on + thorns 2 | +3.22 [2.17, 4.39] | 2.92 + 10.97 -> 19.33 | 5.44 / 1 | +5.44 [3.5, 7.28] |
| herbalist 1 + regen 1 | +3.18 [2.29, 4.24] | 0.39 + 2.22 -> 6.28 | 2.47 / 3.89 | +3.67 [2.33, 5.5] |
| evasive on + guardian on | +3.12 [1.93, 4.33] | 6.94 + 2.92 -> 10.53 | 5.11 / 1.14 | +0.67 [-1.28, 2.69] |
| bulwark 2 + spitfire 1 | -3.12 [-4.31, -1.68] ^ | 17.44 + 15.19 -> 22.28 | -5.39 / -0.86 | -10.36 [-12.47, -8.03] |
| evasive on + repair 1 | +2.86 [1.87, 3.94] | 6.94 + 5.25 -> 11.08 | 3.33 / 2.39 | -1.11 [-2.5, 1.39] |
| daunt 1 + sweep 2 | +2.81 [1.74, 3.79] | 1.89 + 14.25 -> 20.11 | 3.97 / 1.64 | +3.97 [2.39, 5.11] |
| brood 2 + pickpocket 1 | -2.58 [-3.85, -1.29] | 15.53 + 13.44 -> 22.36 | -6.61 / 1.44 | -6.61 [-8.36, -4.92] |
| rage on + thanatosis on | +2.57 [1.57, 3.67] | 3.11 + 5.08 -> 11.5 | 1.33 / 3.81 | +3.31 [1.39, 5.03] |
| bulwark 2 + mighty on | -2.47 [-3.43, -1.32] ^ | 17.44 + 6.89 -> 20.11 | -0.72 / -4.22 | -4.22 [-5.67, -2.61] |
| keenSense on + nightblind on | +2.47 [1.56, 3.5] | 0.5 + -0.89 -> 0.47 | 1.22 / 3.72 | +0.86 [-0.08, 2.44] |
| avalanche 1 + thorns 2 | -2.4 [-3.42, -1.39] | 15.75 + 10.97 -> 21.58 | -5.14 / 0.33 | -5.14 [-7.03, -3.39] |
| avalanche 1 + meiosis 1 | -2.4 [-3.43, -1.37] ^ | 15.75 + 7.83 -> 19.97 | -2.44 / -2.36 | -3.61 [-5.28, -1.67] |
| sweep 2 + thorns 2 | -2.39 [-3.51, -1.19] | 14.25 + 10.97 -> 20.17 | -5.06 / 0.28 | -5.06 [-6.92, -3.39] |

## Per skill: price stability

Worth = the most the single is worth on the bodies (Level 9). Mean |I| = the mean absolute interaction over its pairs; within ±1 = the share of its pairs within ±1 point; worst = its two largest interactions.

| Skill | N | Kind | Price | Worth (best body) | Pairs | Mean I | Mean abs I | Within ±1 | Worst partners |
|---|---|---|---|---|---|---|---|---|---|
| reload (2) | 1 | other | -4.2 | -0.67 | 8 | -0.81 | 1.71 | 38% | sweep -4.28, recoil +3.4 |
| twinStrike (1) | on | attack | 7.75 | 11.5 | 8 | 0.52 | 1.71 | 38% | drunk -4.56, swarm +3.54 |
| drunk (1) | on | other | -3.7 | 0.14 | 8 | -0.19 | 1.59 | 38% | twinStrike -4.56, stealth +4.04 |
| weaponMaster (1) | 1 | onhit | 0.37 | 0.83 | 8 | 1.36 | 1.36 | 88% | twinShot +7.47, repair +0.69 |
| brood (1) | 2 | other | 6.18 | 15.53 | 8 | 0.34 | 1.34 | 25% | pickpocket -2.58, weaken +2.01 |
| spitfire (1) | 1 | attack | 7.72 | 15.19 | 8 | -0.63 | 1.34 | 63% | bulwark -3.12, berserk -2.32 |
| bulwark (1) | 2 | other | 9.21 | 17.44 | 8 | -0.69 | 1.33 | 63% | spitfire -3.12, mighty -2.47 |
| twinShot (1) | 1 | attack | 6.63 | 11.11 | 9 | 0.75 | 1.33 | 78% | weaponMaster +7.47, delivery -1.07 |
| mighty (1) | on | onhit | 4.79 | 6.89 | 8 | 0.21 | 1.3 | 50% | bulwark -2.47, recoil -1.9 |
| skitter (1) | on | onhit | 3.5 | 4.33 | 8 | 0.11 | 1.22 | 50% | purblind -2.04, haste -1.76 |
| fork (2) | on | attack | 4.95 | 3.56 | 9 | 1.18 | 1.18 | 44% | meiosis +2.24, shield +1.74 |
| thorns (5) | 2 | defence | 5.08 | 10.97 | 26 | 0.02 | 1.16 | 54% | guardian +3.22, avalanche -2.4 |
| sweep (5) | 2 | attack | 5.08 | 14.25 | 26 | 0.23 | 1.14 | 54% | reload -4.28, daunt +2.81 |
| iceArrow (1) | 2 | attack | 8.13 | 14.31 | 8 | -0.15 | 1.14 | 63% | thorns -2.33, recoil -2.33 |
| haste (1) | on | other | 2.57 | 6.28 | 8 | 0.67 | 1.11 | 50% | skitter -1.76, relict +1.56 |
| shield (1) | 4 | other | 2.53 | 10.94 | 8 | 1.08 | 1.1 | 38% | thorns +2.08, fork +1.74 |
| meiosis (1) | 1 | other | 4.55 | 7.83 | 8 | 0.28 | 1.09 | 63% | avalanche -2.4, fork +2.24 |
| repair (1) | 1 | other | 2.93 | 5.25 | 8 | 1.08 | 1.08 | 63% | evasive +2.86, tornado +1.33 |
| swarm (4) | on | other | 3.13 | 8.94 | 27 | 0.64 | 1.06 | 48% | twinStrike +3.54, flying +2.36 |
| poisonBolt (1) | 2 | attack | 7.06 | 16.69 | 8 | 0.3 | 1.06 | 38% | inspiring -1.99, speed +1.83 |
| stealth (1) | on | attack | 6.88 | 16.72 | 8 | 0.96 | 1.06 | 63% | drunk +4.04, speed +1.75 |
| purblind (1) | on | other | 0 | -1.58 | 8 | -0.9 | 1.04 | 63% | swarm -2.21, skitter -2.04 |
| evasive (12) | on | defence | 0 | 6.94 | 26 | 0.64 | 1.02 | 58% | guardian +3.12, repair +2.86 |
| inspiring (3) | 1 | other | 3.96 | 10.06 | 8 | 0.29 | 1.01 | 50% | poisonBolt -1.99, fork +1.65 |
| recoil (1) | 2 | other | -5.88 | -2.83 | 8 | -0.15 | 1.01 | 63% | reload +3.4, iceArrow -2.33 |
| tally (1) | 3 | other | 1.41 | 2.11 | 8 | 1.01 | 1.01 | 63% | flying +1.31, fireArrow +1.29 |
| invisible (2) | 2 | other | 1.64 | 6.25 | 8 | 0.4 | 0.98 | 63% | sweep +1.39, purblind -1.24 |
| almanac (1) | 4 | other | 6 | 10.97 | 8 | -0.35 | 0.98 | 63% | spitfire -2.26, nightblind -1.42 |
| overwhelm (1) | on | onhit | 1.05 | 2.31 | 8 | 0.97 | 0.97 | 63% | scare +1.49, requiem +1.36 |
| requiem (1) | 4 | other | 4.24 | 3.47 | 8 | 0.81 | 0.97 | 50% | bleed +1.44, overwhelm +1.36 |
| ambush (1) | 4 | attack | 3.42 | 3.11 | 8 | 0.66 | 0.96 | 63% | drunk -1.19, crepuscular +1.12 |
| thanatosis (1) | on | other | 2 | 5.08 | 8 | 0.78 | 0.95 | 75% | rage +2.57, healing +1.11 |
| delivery (5) | 1 | other | 5.25 | 11.69 | 26 | 0.75 | 0.94 | 62% | gash +2.06, fork +1.5 |
| pickpocket (1) | 1 | onhit | 4.77 | 13.44 | 8 | 0.08 | 0.93 | 75% | brood -2.58, immolation +1.06 |
| relict (1) | on | other | 1.24 | 3.5 | 8 | 0.9 | 0.93 | 63% | fireArrow +1.64, skitter +1.61 |
| armor (8) | 1 | defence | 2.33 | 5.44 | 26 | 0.83 | 0.91 | 54% | guardian +2.08, sweep +1.49 |
| nova (1) | 3 | attack | 3.82 | 5.39 | 8 | 0.33 | 0.88 | 75% | bulwark -2.21, tally +1.26 |
| speed (1) | 2 | other | 2.44 | 5.72 | 9 | 0.86 | 0.88 | 56% | poisonBolt +1.83, stealth +1.75 |
| flying (31) | on | defence | 0 | 7.11 | 26 | 0.67 | 0.87 | 65% | swarm +2.36, guardian +2.08 |
| herbalist (1) | 1 | other | 0.23 | 0.39 | 8 | 0.87 | 0.87 | 88% | regen +3.18, twinStrike +0.81 |
| nightblind (1) | on | other | -2.12 | -0.89 | 8 | 0.11 | 0.86 | 63% | keenSense +2.47, almanac -1.42 |
| avalanche (1) | 1 | attack | 9.25 | 15.75 | 8 | -0.55 | 0.84 | 75% | thorns -2.4, meiosis -2.4 |
| regen (4) | 1 | other | 2.3 | 2.22 | 25 | 0.83 | 0.83 | 80% | herbalist +3.18, armor +1.18 |
| guardian (15) | on | defence | 0 | 2.92 | 25 | 0.6 | 0.82 | 76% | thorns +3.22, evasive +3.12 |
| fireArrow (2) | 1 | attack | 6.56 | 10.58 | 8 | 0.5 | 0.81 | 75% | relict +1.64, tally +1.29 |
| keenSense (1) | on | other | 0.66 | 0.5 | 8 | 0.81 | 0.81 | 88% | nightblind +2.47, arrow +0.9 |
| decay (1) | 1 | onhit | 5.77 | 13.47 | 8 | -0.28 | 0.8 | 75% | reload -2.31, lumberjack -1.01 |
| undead (1) | on | other | 2.27 | 6.33 | 8 | 0.8 | 0.8 | 75% | poisonBolt +1.58, wither +1.39 |
| bleed (5) | 1 | onhit | 2.89 | 4.78 | 27 | 0.62 | 0.79 | 63% | pounce +1.9, sweep +1.72 |
| immolation (1) | 1 | other | 0 | -0.86 | 8 | 0.74 | 0.79 | 63% | riled +1.69, gash +1.36 |
| wither (1) | 1 | onhit | 3.57 | 5.33 | 9 | 0.69 | 0.79 | 67% | undead +1.39, nocturnal +1.24 |
| daunt (3) | 1 | onhit | 1.72 | 1.89 | 25 | 0.77 | 0.78 | 76% | sweep +2.81, pounce +1.28 |
| foraging (2) | 1 | other | 1.68 | 3.72 | 8 | 0.78 | 0.78 | 88% | twinStrike +1.14, mighty +0.97 |
| carnage (1) | 3 | other | 1.68 | 1.64 | 8 | 0.77 | 0.77 | 75% | mighty +1.6, evasive +1.18 |
| carrion (1) | 2 | other | 2.68 | 2.06 | 8 | 0.77 | 0.77 | 75% | fork +1.47, overwhelm +1.31 |
| pounce (7) | 2 | attack | 2.96 | 3.14 | 25 | 0.7 | 0.75 | 72% | poison +3.28, bleed +1.9 |
| nocturnal (6) | 1 | other | 1.59 | 3.5 | 25 | 0.72 | 0.75 | 68% | wither +1.24, armor +1.22 |
| arrow (2) | 1 | attack | 4.26 | 5.44 | 8 | 0.34 | 0.75 | 88% | requiem +1.25, keenSense +0.9 |
| poison (16) | 2 | onhit | 4.75 | 11.14 | 25 | 0.33 | 0.74 | 88% | pounce +3.28, thorns -1.96 |
| fastForward (1) | 1 | other | 4.24 | 11.33 | 9 | 0.3 | 0.73 | 78% | scar +1.86, reload -1.74 |
| lumberjack (1) | on | other | 4.85 | 10.47 | 8 | 0.36 | 0.73 | 63% | armor +1.35, crabClaws +1.07 |
| crepuscular (1) | 1 | other | 2.97 | 6 | 8 | 0.69 | 0.72 | 63% | ambush +1.12, moonborn +1.12 |
| foeScarcity (1) | on | other | 3.39 | 5.64 | 8 | 0.61 | 0.72 | 75% | swarm +1.4, wither +1.15 |
| taunt (1) | on | other | 0.4 | 4.69 | 8 | 0.43 | 0.72 | 63% | drunk +1.42, backstab +1.14 |
| diurnal (5) | 1 | other | 1.14 | 2.47 | 25 | 0.71 | 0.71 | 76% | skitter +1.19, flying +1.18 |
| quick (5) | on | other | 2.23 | 6.17 | 25 | 0.46 | 0.7 | 72% | swarm +1.72, sweep +1.42 |
| riled (1) | 3 | other | 2.08 | 5.31 | 8 | 0.64 | 0.69 | 75% | immolation +1.69, requiem +1.19 |
| scavenge (1) | 1 | other | 2.99 | 4.86 | 8 | 0.59 | 0.69 | 88% | gash +1.87, wither +0.9 |
| onslaught (1) | 3 | other | 1.39 | 1.44 | 8 | 0.67 | 0.67 | 88% | twinStrike +1.54, iceArrow +0.85 |
| healing (1) | 1 | other | 3.48 | 5.89 | 8 | 0.33 | 0.65 | 75% | thanatosis +1.11, taunt -1.06 |
| gash (3) | 3 | attack | 2.73 | 2.22 | 26 | 0.64 | 0.64 | 85% | delivery +2.06, scavenge +1.87 |
| web (1) | 1 | onhit | 0.97 | 0.11 | 8 | 0.64 | 0.64 | 88% | almanac +1.17, foeScarcity +0.93 |
| scare (1) | 2 | other | 3.76 | 9.39 | 8 | 0.49 | 0.63 | 88% | overwhelm +1.49, tide +0.97 |
| timbered (2) | on | other | 0.5 | 0.17 | 8 | 0.61 | 0.61 | 100% | flying +0.85, pickpocket +0.83 |
| illuminate (1) | on | other | 0.51 | 0.75 | 8 | 0.6 | 0.6 | 88% | poisonBolt +1.01, flying +0.96 |
| crabClaws (3) | on | attack | 0.1 | 1.81 | 25 | 0.21 | 0.59 | 84% | armor +1.47, evasive +1.11 |
| moonborn (1) | 4 | other | 3.69 | 6.42 | 8 | 0.39 | 0.59 | 88% | crepuscular +1.12, daunt +0.9 |
| rage (1) | on | other | 3.01 | 3.11 | 8 | 0.48 | 0.59 | 75% | thanatosis +2.57, armor +1.01 |
| darksight (1) | on | other | 3 | 0.44 | 8 | 0.56 | 0.58 | 75% | iceArrow +1.04, stealth +1.03 |
| scar (1) | 2 | onhit | 3.41 | 11.83 | 8 | 0.32 | 0.58 | 88% | fastForward +1.86, invisible +0.78 |
| canopyCover (1) | on | defence | 0.07 | 0 | 8 | 0.57 | 0.57 | 100% | crepuscular +0.75, carnage +0.69 |
| berserk (1) | 2 | other | 3.68 | 9.83 | 8 | -0.15 | 0.56 | 88% | spitfire -2.32, skitter +0.64 |
| frost (1) | on | other | 1.12 | 1 | 8 | 0.56 | 0.56 | 100% | fireArrow +0.89, stealth +0.86 |
| greaterPoison (1) | 1 | onhit | 4.37 | 10.14 | 8 | 0.34 | 0.55 | 88% | shield +1.03, inspiring -0.87 |
| salt (1) | on | other | 0.38 | 0 | 8 | 0.55 | 0.55 | 100% | delivery +0.99, skitter +0.89 |
| weaken (1) | 1 | onhit | 2.64 | 4.25 | 8 | 0.44 | 0.55 | 88% | brood +2.01, illuminate +0.6 |
| executioner (1) | 2 | onhit | 0.2 | 0.25 | 9 | 0.52 | 0.52 | 89% | shield +1.03, healing +0.86 |
| trap (1) | 4 | other | 2.25 | 2.14 | 8 | 0.52 | 0.52 | 100% | invisible +0.99, carrion +0.68 |
| siege (1) | 1 | other | 1.07 | 1.5 | 8 | 0.43 | 0.51 | 100% | daunt +0.79, decay +0.75 |
| frostbite (2) | 1 | other | 0.19 | 0.33 | 8 | 0.44 | 0.5 | 100% | lumberjack +0.75, nova +0.67 |
| bedrock (1) | on | other | 0.3 | 0.06 | 8 | 0.5 | 0.5 | 100% | scare +0.86, flying +0.81 |
| fletcher (1) | 1 | onhit | 3.19 | 0.83 | 8 | 0.49 | 0.5 | 100% | bulwark +1, invisible +0.68 |
| reach (1) | on | attack | 1 | -0.39 | 8 | 0.42 | 0.5 | 88% | repair +1.12, haste +0.82 |
| tornado (1) | 1 | attack | 1.17 | 1.17 | 8 | 0.5 | 0.5 | 88% | repair +1.33, relict +0.58 |
| backstab (2) | 2 | attack | 0.33 | -0.14 | 8 | 0.43 | 0.49 | 88% | taunt +1.14, haste +0.87 |
| tide (31) | on | other | 0.5 | 0.56 | 25 | 0.48 | 0.48 | 100% | scare +0.97, delivery +0.81 |
| shatter (1) | 2 | onhit | 0.04 | 0.17 | 8 | 0.48 | 0.48 | 88% | brood +1.28, fastForward +0.67 |
| mountainClimber (4) | on | other | 4 | 1.5 | 24 | 0.42 | 0.47 | 96% | poisonBolt +1.01, poison +0.75 |
| dive (2) | 2 | attack | 0 | 0 | 8 | 0.46 | 0.46 | 100% | meiosis +0.75, almanac +0.72 |
| immunity (2) | on | other | 0.3 | 1.06 | 8 | 0.44 | 0.44 | 100% | mighty +0.85, spitfire +0.82 |
| keenEye (2) | on | other | 0.34 | 0 | 8 | 0.43 | 0.43 | 100% | greaterPoison +0.58, repair +0.56 |
| predator (2) | 1 | onhit | 1.12 | 1.36 | 8 | 0.39 | 0.43 | 100% | brood +0.99, scare +0.65 |
| sonar (2) | on | other | 0.66 | 0.61 | 8 | 0.4 | 0.4 | 100% | weaken +0.58, wither +0.53 |
| heat (1) | on | other | 1.2 | 1.33 | 8 | 0.4 | 0.4 | 100% | wither +0.61, carrion +0.56 |
| bulldoze (1) | 1 | onhit | 2.23 | 4.17 | 8 | 0.39 | 0.39 | 100% | nocturnal +0.68, diurnal +0.58 |
| injured (1) | 2 | other | -2 | -0.72 | 8 | 0.07 | 0.39 | 88% | nightblind +1.15, skitter -0.61 |
| prey (1) | on | other | 0.03 | 0.17 | 8 | 0.38 | 0.38 | 100% | fireArrow +0.53, inspiring +0.5 |
| sequestration (1) | on | onhit | 0.43 | 0.72 | 8 | 0.29 | 0.38 | 100% | bulwark +0.86, thanatosis +0.49 |
| dry (1) | on | other | 4 | 0.5 | 8 | 0.35 | 0.36 | 100% | twinStrike +0.83, mighty +0.64 |
| hibernate (1) | on | other | 1.9 | 0.08 | 8 | 0.31 | 0.34 | 100% | nova +0.72, web +0.42 |
| shell (3) | 4 | defence | 0.87 | 1.47 | 8 | 0.32 | 0.33 | 100% | repair +0.65, diurnal +0.56 |
| pierce (2) | 1 | other | 0.23 | 0.11 | 8 | 0.3 | 0.31 | 100% | evasive +0.72, onslaught +0.42 |
| packLeader (1) | on | other | 0 | 0.33 | 8 | 0.11 | 0.3 | 100% | siege +0.68, iceArrow -0.51 |

^ = a body over 85% win rate (the cap squeezes the pair). Every pair is in the json (per body, the singles, the gap).

