# Skill additivity, 2026-11-08 (package BAL31)

Is a pair of skills worth the sum of the two? 171 pairs covering 113 of 113 skills (each in at least 3 pairs), Level 9 (N(L) 30.16, bodies 3A + H = 30: 1/27, 9/3), 400 paired fights a variant. Worth in 3A + H points (rate 2.28 win-rate points a point, the stat yardstick on the bodies at Level 9; the ladder's L1 3.06, L5 3.09). Interaction = worth(A+B) - worth(A) - worth(B), the mean over the bodies. Measurement only: no price changed.

## Headline

| Measure | Value |
|---|---|
| Pairs within ±1 point of additive | 51% (within ±2: 91%) |
| Pairs whose 95% interval holds 0 | 58% |
| Mean interaction (signed) | 0.89 |
| Mean abs interaction / noise floor (what pure noise would give) | 1.11 / 0.5 |
| Pairs clearly synergistic (95% low end > +1) / clearly clashing (high end < -1) | 6 / 1 |
| Spread of interactions: observed SD / sampling noise SD / true SD (observed less noise) | 0.95 / 0.64 / 0.71 |
| Pairs within ±1 of the mean interaction (a flat per-extra-skill term taken out) | 79% |
| Interaction against the pair's size (worth A + worth B): slope / correlation | 0 / 0 |
| Two placebo keys against twice one (the CPU's key count; 0 = the cancel holds) | +0.6 [-0.27, 1.7] |
| Price gap (best body of the pair - best body of A - best body of B): within ±1 / mean / mean abs | 54% / 0.11 / 1.32 |
| Pairs whose two skills want different bodies (Attack 1 vs most) | 45% |

Base win rate on the bodies: 1/27 31%, 9/3 47%.

Phases: 1 bodies and singles 0/0; 2 matching rounds 1-3 171/171; 3 every pair among the 20 commonest skills 0/183; 4 matching rounds 4-8 0/276.

## Worst-interacting pairs

| Pair | Interaction (95%) | A + B -> pair, best body | Per body (Attack 1 / most) | Price gap |
|---|---|---|---|---|
| reload 1 + sweep 2 | -4.19 [-5.42, -3.04] | -1.37 + 14.08 -> 4.22 | -8.49 / 0.11 | -8.49 [-11.18, -6.3] |
| swarm on + twinStrike on | +3.75 [2.36, 5.04] | 9.04 + 9.75 -> 20.33 | 5.64 / 1.86 | +1.53 [-0.99, 4.05] |
| fork on + meiosis 1 | +3.21 [1.62, 4.55] | 2.85 + 6.58 -> 14.14 | 1.7 / 4.71 | +4.71 [1.86, 6.3] |
| evasive on + repair 1 | +3.07 [1.73, 4.77] | 6.25 + 4.55 -> 10.74 | 3.73 / 2.41 | -0.05 [-1.92, 3.07] |
| fastForward 1 + scar 2 | +2.77 [1.23, 4.03] | 10.96 + 10.68 -> 15.84 | 4.33 / 1.21 | -5.81 [-8.71, -3.29] |
| injured 2 + nightblind on | +2.44 [1.23, 3.34] | -1.15 + -2.08 -> -1.97 | 1.26 / 3.62 | +1.26 [-0.27, 2.63] |
| crabClaws on + taunt on | +2.36 [0.63, 4.03] | 0.77 + 3.4 -> 5.48 | 1.32 / 3.4 | +1.32 [-0.93, 3.78] |
| immolation 1 + riled 3 | +2.33 [0.96, 3.42] | -1.32 + 5.21 -> 6.25 | 3.18 / 1.48 | +2.36 [0.11, 4.16] |
| brood 2 + weaken 1 | +2.22 [0.63, 3.67] | 14.14 + 4.05 -> 19.45 | 1.26 / 3.18 | +1.26 [-0.93, 3.01] |
| nocturnal 1 + wither 1 | +2.22 [0.77, 3.59] | 3.34 + 4.38 -> 10.36 | 2.63 / 1.81 | +2.63 [0.71, 4.6] |
| onslaught 3 + twinStrike on | +2.19 [0.99, 3.29] | 1.21 + 9.75 -> 11.84 | 2.3 / 2.08 | +0.88 [-0.82, 2.74] |
| arrow 1 + requiem 4 | +2.14 [0.9, 3.56] | 4.77 + 3.45 -> 10.47 | 2.25 / 2.03 | +2.25 [0.49, 4.16] |
| berserk 2 + spitfire 1 | -2.11 [-3.64, -0.36] | 9.7 + 14.41 -> 19.34 | -4.77 / 0.55 | -4.77 [-7.01, -2.52] |
| undead on + wither 1 | +2.08 [1.04, 3.4] | 5.04 + 4.38 -> 9.1 | 1.59 / 2.58 | -0.33 [-2.47, 1.92] |
| ambush 4 + crepuscular 1 | +2.03 [0.68, 3.32] | 2.85 + 5.7 -> 10.03 | 3.07 / 0.99 | +1.48 [-0.6, 3.51] |
| greaterPoison 1 + shield 4 | +1.97 [0.55, 3.51] | 9.26 + 8.88 -> 13.21 | 1.1 / 2.85 | -4.93 [-7.01, -1.92] |
| diurnal 1 + skitter on | +1.95 [0.55, 3.23] | 2.36 + 3.29 -> 6.63 | 1.64 / 2.25 | +0.99 [-0.66, 3.01] |
| meiosis 1 + mighty on | +1.95 [0.55, 3.34] | 6.58 + 5.92 -> 15.78 | 0.6 / 3.29 | +3.29 [1.21, 5.26] |
| backstab 2 + taunt on | +1.92 [0.74, 3.01] | -1.21 + 3.4 -> 3.78 | 1.59 / 2.25 | +1.59 [-0.38, 3.34] |
| shield 4 + spitfire 1 | +1.89 [0.33, 3.45] | 8.88 + 14.41 -> 15.73 | 0.6 / 3.18 | -7.56 [-9.42, -5.04] |

## Per skill: price stability

Worth = the most the single is worth on the bodies (Level 9). Mean |I| = the mean absolute interaction over its pairs; within ±1 = the share of its pairs within ±1 point; worst = its two largest interactions.

| Skill | N | Kind | Price | Worth (best body) | Pairs | Mean I | Mean abs I | Within ±1 | Worst partners |
|---|---|---|---|---|---|---|---|---|---|
| twinStrike (1) | on | attack | 6.38 | 9.75 | 3 | 2.47 | 2.47 | 0% | swarm +3.75, onslaught +2.19 |
| sweep (5) | 2 | attack | 5.08 | 14.08 | 3 | -0.49 | 2.3 | 0% | reload -4.19, invisible +1.48 |
| meiosis (1) | 1 | other | 4.55 | 6.58 | 3 | 2.07 | 2.07 | 0% | fork +3.21, mighty +1.95 |
| reload (2) | 1 | other | -4.2 | -1.37 | 3 | -1.79 | 1.92 | 33% | sweep -4.19, fastForward -1.37 |
| taunt (1) | on | other | 0.4 | 3.4 | 3 | 1.89 | 1.89 | 0% | crabClaws +2.36, backstab +1.92 |
| evasive (12) | on | defence | 0 | 6.25 | 3 | 1.05 | 1.86 | 0% | repair +3.07, carnage +1.29 |
| repair (1) | 1 | other | 0.5 | 4.55 | 3 | 1.8 | 1.8 | 0% | evasive +3.07, weaponMaster +1.18 |
| spitfire (1) | 1 | attack | 7.72 | 14.41 | 3 | 0.37 | 1.78 | 0% | berserk -2.11, shield +1.89 |
| wither (1) | 1 | onhit | 3.47 | 4.38 | 4 | 1.73 | 1.73 | 0% | nocturnal +2.22, undead +2.08 |
| fork (2) | on | attack | 3.89 | 2.85 | 3 | 1.72 | 1.72 | 33% | meiosis +3.21, herbalist +1.04 |
| nocturnal (6) | 1 | other | 1.59 | 3.34 | 3 | 1.71 | 1.71 | 0% | wither +2.22, bulldoze +1.75 |
| crabClaws (3) | on | attack | 0.1 | 0.77 | 3 | 1.69 | 1.69 | 0% | taunt +2.36, lumberjack +1.64 |
| crepuscular (1) | 1 | other | 2.97 | 5.7 | 3 | 1.65 | 1.65 | 0% | ambush +2.03, delivery +1.86 |
| onslaught (1) | 3 | other | 2.8 | 1.21 | 3 | 1.64 | 1.64 | 33% | twinStrike +2.19, iceArrow +1.75 |
| poisonBolt (1) | 2 | attack | 7.06 | 15.62 | 3 | 0.64 | 1.63 | 0% | illuminate +1.81, speed +1.59 |
| immolation (1) | 1 | other | 0 | -1.32 | 3 | 1.59 | 1.59 | 0% | riled +2.33, pounce +1.4 |
| iceArrow (1) | 2 | attack | 8.13 | 13.86 | 3 | 1.58 | 1.58 | 0% | onslaught +1.75, darksight +1.62 |
| brood (1) | 2 | other | 6.18 | 14.14 | 3 | 1.17 | 1.57 | 33% | weaken +2.22, haste +1.89 |
| haste (1) | on | other | 2.57 | 5.7 | 3 | 1.55 | 1.55 | 0% | brood +1.89, backstab +1.67 |
| mighty (1) | on | onhit | 4.79 | 5.92 | 3 | 0.53 | 1.55 | 0% | meiosis +1.95, bulwark -1.53 |
| nightblind (1) | on | other | -2.12 | -2.08 | 3 | 1.17 | 1.54 | 33% | injured +2.44, stealth +1.62 |
| swarm (4) | on | other | 3.13 | 9.04 | 3 | 1.5 | 1.5 | 67% | twinStrike +3.75, reach +0.63 |
| backstab (2) | 2 | attack | 0.33 | -1.21 | 3 | 1.46 | 1.46 | 33% | taunt +1.92, haste +1.67 |
| ambush (1) | 4 | attack | 3.48 | 2.85 | 3 | 1.45 | 1.45 | 33% | crepuscular +2.03, delivery +1.37 |
| scar (1) | 2 | onhit | 3.38 | 10.68 | 3 | 1.44 | 1.44 | 67% | fastForward +2.77, sonar +0.99 |
| healing (1) | 1 | other | 3.48 | 4.93 | 3 | 1.43 | 1.43 | 0% | thanatosis +1.86, mountainClimber +1.32 |
| carrion (1) | 2 | other | 2.68 | 1.32 | 3 | 1.42 | 1.42 | 0% | overwhelm +1.64, wither +1.48 |
| shield (1) | 4 | other | 2.53 | 8.88 | 3 | 1.4 | 1.4 | 33% | greaterPoison +1.97, spitfire +1.89 |
| fastForward (1) | 1 | other | 3.02 | 10.96 | 4 | 0.69 | 1.37 | 50% | scar +2.77, reload -1.37 |
| diurnal (5) | 1 | other | 1.14 | 2.36 | 3 | 1.36 | 1.36 | 33% | skitter +1.95, thorns +1.23 |
| greaterPoison (1) | 1 | onhit | 3.69 | 9.26 | 3 | 1.35 | 1.35 | 33% | shield +1.97, keenSense +1.1 |
| arrow (2) | 1 | attack | 4.26 | 4.77 | 3 | 1.32 | 1.32 | 33% | requiem +2.14, meiosis +1.04 |
| nova (1) | 3 | attack | 4.48 | 3.95 | 3 | 0.46 | 1.32 | 0% | foeScarcity +1.53, bulwark -1.29 |
| riled (1) | 3 | other | 2.4 | 5.21 | 3 | 1.32 | 1.32 | 67% | immolation +2.33, canopyCover +0.82 |
| delivery (5) | 1 | other | 2.59 | 10.36 | 3 | 0.84 | 1.31 | 33% | crepuscular +1.86, ambush +1.37 |
| decay (1) | 1 | onhit | 6.13 | 12.27 | 3 | 1.3 | 1.3 | 33% | tally +1.86, healing +1.12 |
| tally (1) | 3 | other | 3.28 | 1.86 | 3 | 1.3 | 1.3 | 33% | decay +1.86, spitfire +1.34 |
| weaken (1) | 1 | onhit | 3.39 | 4.05 | 3 | 1.3 | 1.3 | 67% | brood +2.22, sonar +0.96 |
| foeScarcity (1) | on | other | 3.39 | 5.75 | 3 | 1.29 | 1.29 | 33% | nova +1.53, scavenge +1.42 |
| skitter (1) | on | onhit | 1.44 | 3.29 | 3 | 0.88 | 1.28 | 33% | diurnal +1.95, salt +1.29 |
| poison (16) | 2 | onhit | 4.69 | 10.25 | 3 | 0.87 | 1.27 | 33% | mountainClimber +1.64, trap +1.56 |
| stealth (1) | on | attack | 6.88 | 14.47 | 3 | 1.24 | 1.24 | 33% | nightblind +1.62, frost +1.32 |
| invisible (2) | 2 | other | 0.96 | 5.53 | 3 | 0.41 | 1.22 | 33% | sweep +1.48, evasive -1.21 |
| injured (1) | 2 | other | -2 | -1.15 | 3 | 1.22 | 1.22 | 33% | nightblind +2.44, armor +1.01 |
| thanatosis (1) | on | other | 2 | 4 | 3 | 1.22 | 1.22 | 33% | healing +1.86, fletcher +1.01 |
| inspiring (3) | 1 | other | 3 | 9.64 | 3 | 0.2 | 1.19 | 33% | poisonBolt -1.48, darksight +1.21 |
| overwhelm (1) | on | onhit | 0.52 | 1.81 | 3 | 1.19 | 1.19 | 67% | carrion +1.64, illuminate +0.99 |
| quick (5) | on | other | 2.23 | 6.03 | 3 | 0.17 | 1.16 | 33% | drunk -1.48, sweep +1.23 |
| undead (1) | on | other | 2.27 | 5.04 | 3 | 1.16 | 1.16 | 67% | wither +2.08, sequestration +0.71 |
| illuminate (1) | on | other | 0.51 | 0.44 | 3 | 1.15 | 1.15 | 67% | poisonBolt +1.81, overwhelm +0.99 |
| frost (1) | on | other | 1.12 | 0.44 | 3 | 1.12 | 1.12 | 33% | stealth +1.32, fireArrow +1.26 |
| trap (1) | 4 | other | 2.9 | 2.03 | 3 | 1.12 | 1.12 | 33% | poison +1.56, carrion +1.15 |
| daunt (3) | 1 | onhit | 2.31 | 1.81 | 3 | 1.11 | 1.11 | 33% | siege +1.37, regen +1.32 |
| foraging (2) | 1 | other | 1.68 | 3.45 | 3 | 1.11 | 1.11 | 67% | twinStrike +1.48, moonborn +0.96 |
| mountainClimber (4) | on | other | 4 | 0.99 | 3 | 1.1 | 1.1 | 33% | poison +1.64, healing +1.32 |
| thorns (5) | 2 | defence | 4.48 | 9.7 | 3 | 0.47 | 1.09 | 33% | diurnal +1.23, moonborn +1.12 |
| regen (4) | 1 | other | 2.3 | 1.32 | 3 | 1.08 | 1.08 | 33% | daunt +1.32, nova +1.15 |
| scavenge (1) | 1 | other | 2.27 | 4.16 | 3 | 1.07 | 1.07 | 67% | foeScarcity +1.42, dive +0.99 |
| frostbite (2) | 1 | other | 0.5 | 0.11 | 3 | 1.04 | 1.04 | 67% | iceArrow +1.37, rage +0.88 |
| requiem (1) | 4 | other | 4.24 | 3.45 | 3 | 0.75 | 1.04 | 67% | arrow +2.14, shatter +0.55 |
| darksight (1) | on | other | 3 | 0.33 | 3 | 0.87 | 1.02 | 33% | iceArrow +1.62, inspiring +1.21 |
| timbered (2) | on | other | 0.5 | 0.44 | 3 | 1.01 | 1.01 | 33% | mighty +1.18, flying +1.07 |
| tornado (1) | 1 | attack | 1.96 | 0.22 | 3 | 0.99 | 0.99 | 33% | taunt +1.4, purblind +1.23 |
| gash (3) | 3 | attack | 2.3 | 1.48 | 3 | 0.98 | 0.98 | 67% | keenSense +1.04, dry +0.96 |
| sonar (2) | on | other | 0.66 | 0.55 | 3 | 0.98 | 0.98 | 100% | greaterPoison +0.99, scar +0.99 |
| keenSense (1) | on | other | 0.66 | 0.55 | 3 | 0.98 | 0.98 | 33% | greaterPoison +1.1, gash +1.04 |
| bulwark (1) | 2 | other | 7 | 15.89 | 3 | -0.97 | 0.97 | 33% | mighty -1.53, nova -1.29 |
| armor (8) | 1 | defence | 2.33 | 4.27 | 3 | 0.95 | 0.95 | 67% | injured +1.01, tide +0.96 |
| bulldoze (1) | 1 | onhit | 2.28 | 3.73 | 3 | 0.95 | 0.95 | 67% | nocturnal +1.75, pierce +0.63 |
| flying (31) | on | defence | 0 | 6.58 | 3 | 0.91 | 0.91 | 33% | bedrock +1.1, timbered +1.07 |
| berserk (1) | 2 | other | 3.6 | 9.7 | 3 | -0.5 | 0.91 | 67% | spitfire -2.11, bulldoze +0.47 |
| canopyCover (1) | on | defence | 0.07 | 0.11 | 3 | 0.91 | 0.91 | 67% | nocturnal +1.15, riled +0.82 |
| scare (1) | 2 | other | 3.58 | 7.45 | 3 | 0.9 | 0.9 | 67% | predator +1.07, bedrock +0.99 |
| siege (1) | 1 | other | 1.07 | 1.32 | 3 | 0.9 | 0.9 | 67% | daunt +1.37, speed +0.79 |
| lumberjack (1) | on | other | 3.29 | 9.59 | 3 | 0.89 | 0.89 | 67% | crabClaws +1.64, almanac +0.6 |
| avalanche (1) | 1 | attack | 6.63 | 13.81 | 3 | 0.26 | 0.88 | 67% | heat +1.04, thorns -0.93 |
| bedrock (1) | on | other | 0.3 | 0.11 | 3 | 0.88 | 0.88 | 67% | flying +1.1, scare +0.99 |
| carnage (1) | 3 | other | 1.68 | 1.26 | 3 | 0.88 | 0.88 | 67% | evasive +1.29, overwhelm +0.93 |
| executioner (1) | 2 | onhit | 0.2 | 0.16 | 3 | 0.88 | 0.88 | 67% | immolation +1.04, riled +0.82 |
| relict (1) | on | other | 1.24 | 3.07 | 3 | 0.84 | 0.84 | 67% | haste +1.1, foraging +0.9 |
| predator (2) | 1 | onhit | 1.12 | 0.93 | 3 | 0.8 | 0.8 | 67% | scare +1.07, pierce +0.66 |
| prey (1) | on | other | 0.03 | 0.22 | 3 | 0.8 | 0.8 | 100% | decay +0.93, inspiring +0.88 |
| reach (1) | on | attack | 0.52 | -0.16 | 3 | 0.8 | 0.8 | 67% | repair +1.15, swarm +0.63 |
| herbalist (1) | 1 | other | 0.58 | 0.22 | 3 | 0.79 | 0.79 | 67% | fork +1.04, weaponMaster +0.66 |
| salt (1) | on | other | 0.38 | 0 | 3 | 0.77 | 0.77 | 67% | skitter +1.29, fork +0.9 |
| web (1) | 1 | onhit | 0.37 | 0.33 | 3 | 0.77 | 0.77 | 100% | foeScarcity +0.93, regen +0.77 |
| speed (1) | 2 | other | 2.04 | 5.37 | 4 | 0.76 | 0.76 | 75% | poisonBolt +1.59, siege +0.79 |
| shell (3) | 4 | defence | 0.87 | 1.53 | 3 | 0.75 | 0.75 | 100% | diurnal +0.9, undead +0.68 |
| dry (1) | on | other | 4 | 0.44 | 3 | 0.74 | 0.74 | 100% | gash +0.96, bleed +0.66 |
| moonborn (1) | 4 | other | 3.69 | 6.63 | 3 | 0.74 | 0.74 | 67% | thorns +1.12, foraging +0.96 |
| heat (1) | on | other | 1.2 | 1.21 | 3 | 0.73 | 0.73 | 67% | avalanche +1.04, web +0.6 |
| pounce (7) | 2 | attack | 2.96 | 2.58 | 3 | 0.72 | 0.72 | 67% | immolation +1.4, tide +0.44 |
| almanac (1) | 4 | other | 4 | 10.96 | 3 | 0.35 | 0.71 | 100% | dive +0.99, lumberjack +0.6 |
| tide (31) | on | other | 0.5 | 0.77 | 3 | 0.7 | 0.7 | 100% | armor +0.96, tally +0.71 |
| dive (2) | 2 | attack | 0 | 0 | 3 | 0.7 | 0.7 | 100% | scavenge +0.99, almanac +0.99 |
| weaponMaster (1) | 1 | onhit | 0.37 | 0.66 | 3 | 0.68 | 0.68 | 67% | repair +1.18, herbalist +0.66 |
| pickpocket (1) | 1 | onhit | 1 | 12.71 | 3 | 0.53 | 0.66 | 100% | onslaught +0.99, thanatosis +0.79 |
| purblind (1) | on | other | 0 | -2.25 | 3 | 0.17 | 0.65 | 67% | tornado +1.23, skitter -0.6 |
| pierce (2) | 1 | other | 0.23 | 0.05 | 3 | 0.63 | 0.63 | 100% | predator +0.66, bulldoze +0.63 |
| fletcher (1) | 1 | onhit | 3.19 | 0.66 | 3 | 0.58 | 0.62 | 67% | thanatosis +1.01, scavenge +0.79 |
| hibernate (1) | on | other | 1.9 | 0.11 | 3 | 0.62 | 0.62 | 100% | stealth +0.79, bedrock +0.55 |
| fireArrow (2) | 1 | attack | 6.56 | 9.92 | 3 | 0.53 | 0.6 | 67% | frost +1.26, lumberjack +0.44 |
| drunk (1) | on | other | -3.7 | -0.44 | 3 | -0.58 | 0.58 | 67% | quick -1.48, darksight -0.22 |
| guardian (15) | on | defence | 0 | 1.86 | 3 | 0.27 | 0.57 | 67% | wither +1.15, requiem -0.44 |
| packLeader (1) | on | other | 0 | -0.11 | 3 | 0.56 | 0.56 | 100% | shell +0.68, reach +0.63 |
| immunity (2) | on | other | 0.3 | 0.99 | 3 | 0.55 | 0.55 | 100% | weaken +0.71, flying +0.55 |
| bleed (5) | 1 | onhit | 2.57 | 4.71 | 3 | 0.46 | 0.51 | 100% | timbered +0.79, dry +0.66 |
| keenEye (2) | on | other | 0.34 | 0 | 3 | 0.51 | 0.51 | 100% | arrow +0.77, predator +0.66 |
| rage (1) | on | other | 3.01 | 3.62 | 3 | 0.37 | 0.49 | 100% | frostbite +0.88, twinShot +0.41 |
| sequestration (1) | on | onhit | 0.43 | 0.66 | 3 | 0.37 | 0.47 | 100% | undead +0.71, siege +0.55 |
| shatter (1) | 2 | onhit | 0.04 | 0 | 3 | 0.46 | 0.46 | 100% | pierce +0.6, requiem +0.55 |
| twinShot (1) | 1 | attack | 6.63 | 10.79 | 3 | -0.06 | 0.41 | 100% | delivery -0.71, rage +0.41 |
| recoil (1) | 2 | other | 2 | -3.34 | 3 | 0.02 | 0.13 | 100% | sequestration -0.16, keenEye +0.11 |

^ = a body over 85% win rate (the cap squeezes the pair). Every pair is in the json (per body, the singles, the gap).

