# REFIT1 attribution: which FOLD5 card edits moved the road (2026-11-16)

Before: the post-fold decks with the pre-fold cards.json (`measure-prefold-s7300.jsonl`: main 136/149 in band, 142 within 10, 2 beyond 20; side 76/81, 79, 0). After: the post-fold measure (`docs/balance/skirmish-pass-fold5-s7300.jsonl`: main 86/99/25, side 58/60/6). Same decks, seeds 7300 + 37g, 400 games a fight, GitHub runners.
Swap test: each changed card that sits in a fight 10+ off (enemy deck, leader or the Map reference deck) put back at its pre-fold definition alone, everything else post-fold; cards packed into 9 groups that share no fight, one road measure per group (`swap/skirmish-pass-refit1-g1..g9.jsonl`, groups in `swap/groups.jsonl`). A move is the read with the old card minus the post-fold read; "lost" = the edit made fights harder for the player. Single-card moves do not add up exactly (6-5: newt-doctor alone -35 of the -62).
Tools: `tools/refit1/attrib_2026_11_16.js`, `groups_2026_11_16.js`, `swaptable_2026_11_16.js`.

| # | Card | FOLD5 change | Where it sits | Fights moved 5+ | Win % lost (harder) | Win % gained (easier) | Largest: fight, post-fold → with the old card |
|---|---|---|---|---|---|---|---|
| 1 | cricket-drummer | 2/7→1/5, inspiring 1→2 | ref, enemy | 34 | -435.5 | +7 | 5-2: 39 → 68.5 |
| 2 | wolf-spider-mother | 2/7→2/6, +swarm [Arachnid] | enemy, ref | 22 | -5.5 | +262.6 | 11-6: 80.8 → 58.3 |
| 3 | soldier-ant | 2/8→2/7 | enemy, ref | 17 | -101.4 | +11.3 | 0-1: 81.3 → 70 |
| 4 | peak-condor | +breach 2 | enemy, leader | 8 | -110.4 | 0 | 3-3: 40 → 64 |
| 5 | bee-forager | +healing 1, -triggers [{do:heal,on:perTurn,sub:random,who:ally,amount:1,turnOf:self}] | enemy, ref | 8 | -40.9 | +45.4 | 2-4: 60 → 40.8 |
| 6 | moon-jelly | 1/3→4/5, dmgType physical→poison,-poison 4 | enemy | 4 | -54 | 0 | 10-A-3: 33.8 → 64.5 |
| 7 | water-shrew | 1/6→1/4, +pounce 1, +evasive | enemy, enemy+leader | 3 | -46.8 | +6.3 | 4-2: 29.5 → 68.3 |
| 8 | dormouse | nocturnal 1→2 | enemy | 4 | -52.3 | 0 | 1-A-3: 38 → 61.8 |
| 9 | hawthorn-shieldbug | 2/12→1/15, +counterattack, -armor 1 | enemy | 4 | -5.3 | +45.8 | 7-5: 67.5 → 46 |
| 10 | nutria-reedcutter | 2/7→3/8, +foraging 1 | enemy | 4 | -49.2 | 0 | 6-6: 12.5 → 29.5 |
| 11 | red-billed-chough | 3/2→3/5, +foraging 1, -mountainClimber | leader, enemy+leader | 2 | -43.1 | 0 | 11-10: 22.5 → 52.8 |
| 12 | open-ocean-hermit-crab | 2/2→2/3 | enemy+leader, enemy | 4 | -42.9 | 0 | 2-5: 31 → 44 |
| 13 | anhinga-spearbird | 1/12→1/11, +hoard 2, +herbalist 1, -pounce 2 | enemy, enemy+leader | 5 | 0 | +42.3 | 13-7: 70 → 58 |
| 14 | gull-thief | triggers [{do:gain,on:onKill,amount:1,resource:lumber}]→[{do:gain,on:onHit,amount:1,resource:lumber}] | enemy | 3 | -38.6 | 0 | 2-B-2: 47 → 70.3 |
| 15 | field-vole | 1/8→1/4, +cure 1 | leader | 2 | 0 | +38.2 | 1-5: 58.5 → 36.5 |
| 16 | golden-eagle-diver | 2/2→3/5, renamed,wait 0→1,+daunt 2, diurnal→1, -pounce 3 | ref | 6 | -5 | +32.1 | 18-4: 66 → 57.5 |
| 17 | fen-mink | +sentry 2, -hunter {v:2,vs:poison} | enemy+leader | 2 | -37 | 0 | 5-4: 19.8 → 43.8 |
| 18 | newt-doctor | 4/3→2/7, +herbalist 1 | enemy | 1 | -35 | 0 | 6-5: 9.3 → 44.3 |
| 19 | peregrine-stooper | 2/8→2/5, wait 1→0,pounce 2→3 | enemy+leader, enemy | 2 | -23.3 | 0 | 3-4: 18 → 33.5 |
| 20 | rock-pool-starfish | 2/7→1/7 | enemy | 3 | 0 | +22 | 2-5: 31 → 22.8 |
| 21 | puffin-diver | 2/5→2/8, tide→2, -dive 2 | enemy | 2 | -22 | 0 | 3-1: 61.3 → 73.3 |
| 22 | dolphin-knight | 3/9→2/8, tide→2, +breach 2 | enemy+leader | 1 | -19 | 0 | 10-2: 73 → 92 |
| 23 | venomlord-serpent | 1/22→8/24, dmgType -→poison,-poison 3 | enemy | 3 | -7 | +11.8 | 6-6: 12.5 → 19.5 |
| 24 | swamp-alligator | 2/15→2/12, +hemorrhage 2 | enemy+leader, enemy | 2 | -16.7 | 0 | 5-A-3: 47 → 58.5 |
| 25 | lamprey | dmgType physical→shock,+sap | enemy+leader, enemy | 3 | -16.3 | 0 | 6-1: 75 → 80.8 |
| 26 | alligator-gar | 5/5→3/7, bleed 1→3 | enemy+leader | 1 | -15 | 0 | 5-7: 9.3 → 24.3 |
| 27 | box-turtle | +shell 3, -cower shell | leader | 1 | -12.5 | 0 | 5-2: 39 → 51.5 |
| 28 | crocodile-ambusher | 5/17→3/16, +gash 2, +ambush 5 | enemy | 1 | -11 | 0 | 6-7: 48 → 59 |
| 29 | booming-bittern | 1/12→2/10, daunt 1→2, invisible 2→1 | enemy | 1 | -10.2 | 0 | 6-2: 61.8 → 72 |
| 30 | snapstick-turtle | 2/12→4/6, +armor 1 | enemy | 1 | -9.7 | 0 | 4-1: 38.3 → 48 |
| 31 | honey-bee | levelSkills -→{1:{diurnal:1}} | enemy | 1 | -9.5 | 0 | 1-A-1: 69.3 → 78.8 |
| 32 | kittiwake-flock | 1/5→1/4, +brood 1, +guardian, -swarm | enemy | 1 | 0 | +9 | 11-8: 89 → 80 |
| 33 | robin-redbreast | 2/5→1/4, diurnal 1→2 | enemy | 1 | 0 | +6.7 | 1-A-5: 67.5 → 60.8 |
| 34 | bee-sentry | 2/5→1/5 | enemy | 1 | 0 | +6.5 | 0-2: 85.8 → 79.3 |
| 35 | grass-snake | 2/10→2/9, +regen 1 | enemy | 1 | -6.5 | 0 | 0-B-3: 58.3 → 64.8 |
| 36 | constrictor-coil | +strangle 2 | enemy | 1 | -5.8 | 0 | 5-A-3: 47 → 52.8 |
| 37 | platypus-spur | 4/4→4/5, renamed,poison 2→1 | enemy | 1 | -5.5 | 0 | 4-1: 38.3 → 43.8 |

Under 5 points in every fight it sits in: chipmunk-forager, badger-lumberjack, drowned-matriarch, pond-algae, pyrenean-desman, puffball-bombardier, grass-viper, ant-scout, pincushion-urchin, planarian-splitter, river-mink, shoal-shark, sparrow-chick, conch-crawler, cypress-root-lurker, puddle-skimmer.

| Fight | Pre-fold → post-fold (target) | Changed cards in the enemy deck / leader [the edit's win % move] | Changed cards in the reference deck [move] |
|---|---|---|---|
| 6-5 | 71.8 → 9.3 (70) | booming-bittern x3 1/12→2/10, daunt 1→2, invisible 2→1 [-2]; cypress-root-lurker x1 repair 1→2 [+0]; newt-doctor x4 4/3→2/7, +herbalist 1 [-35]; venomlord-serpent x3 1/22→8/24, dmgType -→poison,-poison 3 [-0.7]; water-shrew x1 1/6→1/4, +pounce 1, +evasive [-0.5]; constrictor-coil x1 +strangle 2 [+0]; venomlord-serpent (leader) 1/22→8/24, dmgType -→poison,-poison 3 [-0.7] | cricket-drummer x4 2/7→1/5, inspiring 1→2 [-5.2] |
| 3-4 | 68.8 → 18 (72) | peak-condor x3 +breach 2 [-17.5]; peregrine-stooper x4 2/8→2/5, wait 1→0,pounce 2→3 [-15.5]; peregrine-stooper (leader) 2/8→2/5, wait 1→0,pounce 2→3 [-15.5] | cricket-drummer x4 2/7→1/5, inspiring 1→2 [-8] |
| 5-6 | 57.3 → 7 (60) | fen-mink x4 +sentry 2, -hunter {v:2,vs:poison} [-13]; swamp-alligator x3 2/15→2/12, +hemorrhage 2 [-0.5]; fen-mink (leader) +sentry 2, -hunter {v:2,vs:poison} [-13] | cricket-drummer x4 2/7→1/5, inspiring 1→2 [-11] |
| 6-6 | 62.5 → 12.5 (65) | anhinga-spearbird x1 1/12→1/11, +hoard 2, +herbalist 1, -pounce 2 [+1]; cypress-root-lurker x1 repair 1→2 [+0]; nutria-reedcutter x4 2/7→3/8, +foraging 1 [-17]; pond-algae x1 1/7→1/8, dmgType physical→water [-0.8]; venomlord-serpent x4 1/22→8/24, dmgType -→poison,-poison 3 [-7]; water-shrew x1 1/6→1/4, +pounce 1, +evasive [-1.5] | cricket-drummer x4 2/7→1/5, inspiring 1→2 [-19] |
| 5-4 | 70.8 → 19.8 (72) | fen-mink x2 +sentry 2, -hunter {v:2,vs:poison} [-24]; grass-viper x2 1/8→2/6, +pierce 2, -poison 1 [-2.5]; fen-mink (leader) +sentry 2, -hunter {v:2,vs:poison} [-24] | cricket-drummer x4 2/7→1/5, inspiring 1→2 [-25.2] |
| 4-1 | 85.3 → 38.3 (90) | platypus-spur x4 4/4→4/5, renamed,poison 2→1 [-5.5]; shoal-shark x1 4/11→3/11, tide→3 [-0.5]; snapstick-turtle x2 2/12→4/6, +armor 1 [-9.7]; water-shrew x3 1/6→1/4, +pounce 1, +evasive [-4.2] | cricket-drummer x4 2/7→1/5, inspiring 1→2 [-14] |
| 4-2 | 84.3 → 29.5 (80) | conch-crawler x1 shell 2→1, shield 4→5 [+0]; grass-snake x1 2/10→2/9, +regen 1 [-2.3]; planarian-splitter x3 renamed [+0]; water-shrew x4 1/6→1/4, +pounce 1, +evasive [-38.8]; water-shrew (leader) 1/6→1/4, +pounce 1, +evasive [-38.8] | cricket-drummer x4 2/7→1/5, inspiring 1→2 [-13.3] |
| 20-9 | 99 → 99 (50) | - | - |
| 5-2 | 81.8 → 39 (84) | constrictor-coil x3 +strangle 2 [-2.5]; swamp-alligator x4 2/15→2/12, +hemorrhage 2 [-0.3]; box-turtle (leader) +shell 3, -cower shell [-12.5] | cricket-drummer x4 2/7→1/5, inspiring 1→2 [-29.5] |
| 6-3 | 73.3 → 40.3 (80) | anhinga-spearbird x4 1/12→1/11, +hoard 2, +herbalist 1, -pounce 2 [+4.8]; constrictor-coil x1 +strangle 2 [+0.8]; crocodile-ambusher x4 5/17→3/16, +gash 2, +ambush 5 [-2.2]; lamprey x2 dmgType physical→shock,+sap [-5.5]; nutria-reedcutter x3 2/7→3/8, +foraging 1 [-13]; lamprey (leader) dmgType physical→shock,+sap [-5.5] | cricket-drummer x4 2/7→1/5, inspiring 1→2 [-12.7] |
| 3-6 | 57 → 21.5 (60) | peak-condor x4 +breach 2 [-18.5] | cricket-drummer x4 2/7→1/5, inspiring 1→2 [-7.3] |
| 3-3 | 73.3 → 40 (78) | gull-thief x1 triggers [{do:gain,on:onKill,amount:1,resource:lumber}]→[{do:gain,on:onHit,amount:1,resource:lumber}] [+0.2]; peak-condor x4 +breach 2 [-24] | cricket-drummer x4 2/7→1/5, inspiring 1→2 [-8.8] |
| 10-A-3 | 67.5 → 33.8 (70) | moon-jelly x4 1/3→4/5, dmgType physical→poison,-poison 4 [-30.7] | wolf-spider-mother x4 2/7→2/6, +swarm [Arachnid] [-2.7] |
| 1-A-2 | 75.3 → 45.5 (80) | bee-forager x2 +healing 1, -triggers [{do:heal,on:perTurn,sub:random,who:ally,amount:1,turnOf:self}] [-15.8]; ant-scout x2 1/5→1/4 [-2]; dormouse x3 nocturnal 1→2 [-18] | wolf-spider-mother x3 2/7→2/6, +swarm [Arachnid] [+1.2] |
| 1-A-3 | 68.8 → 38 (70) | ant-scout x1 1/5→1/4 [-1.3]; bee-forager x1 +healing 1, -triggers [{do:heal,on:perTurn,sub:random,who:ally,amount:1,turnOf:self}] [-6.3]; dormouse x3 nocturnal 1→2 [-23.8] | wolf-spider-mother x3 2/7→2/6, +swarm [Arachnid] [+1.2] |
| 3-7 | 33.8 → 8.5 (40) | golden-eagle-diver x1 2/2→3/5, renamed,wait 0→1,+daunt 2, diurnal→1, -pounce 3 [-0.5]; peak-condor x2 +breach 2 [-3.8]; puffin-diver x3 2/5→2/8, tide→2, -dive 2 [-10]; peak-condor (leader) +breach 2 [-3.8] | cricket-drummer x4 2/7→1/5, inspiring 1→2 [-0.5] |
| 5-7 | 43.3 → 9.3 (40) | alligator-gar x3 5/5→3/7, bleed 1→3 [-15]; alligator-gar (leader) 5/5→3/7, bleed 1→3 [-15] | cricket-drummer x4 2/7→1/5, inspiring 1→2 [-14.5] |
| 4-5 | 16.8 → 9.5 (40) | conch-crawler x4 shell 2→1, shield 4→5 [+0]; drowned-matriarch x2 2/13→2/12 [+1]; pyrenean-desman x4 2/10→2/7, +nocturnal 1 [-0.8]; shoal-shark x1 4/11→3/11, tide→3 [-2.8]; shoal-shark (leader) 4/11→3/11, tide→3 [-2.8] | cricket-drummer x4 2/7→1/5, inspiring 1→2 [-8] |
| 3-1 | 86.3 → 61.3 (90) | peak-condor x3 +breach 2 [-14.2]; puffin-diver x3 2/5→2/8, tide→2, -dive 2 [-12] | cricket-drummer x4 2/7→1/5, inspiring 1→2 [-5] |
| 3-5 | 65.5 → 37.5 (66) | golden-eagle-diver x1 2/2→3/5, renamed,wait 0→1,+daunt 2, diurnal→1, -pounce 3 [-2.5]; peregrine-stooper x4 2/8→2/5, wait 1→0,pounce 2→3 [-7.8]; golden-eagle-diver (leader) 2/2→3/5, renamed,wait 0→1,+daunt 2, diurnal→1, -pounce 3 [-2.5] | cricket-drummer x4 2/7→1/5, inspiring 1→2 [-11.3] |
| 5-3 | 67 → 39.5 (68) | constrictor-coil x5 +strangle 2 [-2.8]; swamp-alligator x4 2/15→2/12, +hemorrhage 2 [+0] | cricket-drummer x4 2/7→1/5, inspiring 1→2 [-23.3] |
| 2-B-2 | 80.5 → 47 (75) | gull-thief x4 triggers [{do:gain,on:onKill,amount:1,resource:lumber}]→[{do:gain,on:onHit,amount:1,resource:lumber}] [-23.3]; open-ocean-hermit-crab x2 2/2→2/3 [-1.5] | soldier-ant x4 2/8→2/7 [-5.8] |
| 1-A-5 | 42.8 → 67.5 (40) | puddle-skimmer x4 2/6→2/7 [-1.8]; robin-redbreast x2 2/5→1/4, diurnal 1→2 [+6.7]; field-vole (leader) 1/8→1/4, +cure 1 [+16.2] | wolf-spider-mother x3 2/7→2/6, +swarm [Arachnid] [+0.2] |
| 4-3 | 69.3 → 43 (70) | conch-crawler x4 shell 2→1, shield 4→5 [+0.5]; grass-snake x4 2/10→2/9, +regen 1 [-3.5]; platypus-spur x3 4/4→4/5, renamed,poison 2→1 [-3.3]; river-mink x1 3/9→4/8, +dive 1 [-1.3]; water-shrew x1 1/6→1/4, +pounce 1, +evasive [-3.3]; river-mink (leader) 3/9→4/8, +dive 1 [-1.3] | cricket-drummer x4 2/7→1/5, inspiring 1→2 [-16.5] |
| 6-4 | 73 → 49.8 (75) | cypress-root-lurker x2 repair 1→2 [+0]; pond-algae x1 1/7→1/8, dmgType physical→water [+1]; venomlord-serpent x4 1/22→8/24, dmgType -→poison,-poison 3 [-3.7]; water-shrew x1 1/6→1/4, +pounce 1, +evasive [-8] | cricket-drummer x4 2/7→1/5, inspiring 1→2 [-15.5] |
| 11-8 | 63 → 89 (63.8) | kittiwake-flock x1 1/5→1/4, +brood 1, +guardian, -swarm [+9] | wolf-spider-mother x4 2/7→2/6, +swarm [Arachnid] [+6.5] |
| 6-2 | 85.5 → 61.8 (85) | booming-bittern x4 1/12→2/10, daunt 1→2, invisible 2→1 [-10.2]; cypress-root-lurker x3 repair 1→2 [+0]; pond-algae x1 1/7→1/8, dmgType physical→water [+0]; venomlord-serpent x4 1/22→8/24, dmgType -→poison,-poison 3 [+6.8]; lamprey x4 dmgType physical→shock,+sap [-5]; cypress-root-lurker (leader) repair 1→2 [+0] | cricket-drummer x4 2/7→1/5, inspiring 1→2 [-13.5] |
| 4-4 | 65.5 → 38.5 (60) | grass-snake x4 2/10→2/9, +regen 1 [-1.3]; kittiwake-flock x1 1/5→1/4, +brood 1, +guardian, -swarm [-0.5]; platypus-spur x1 4/4→4/5, renamed,poison 2→1 [-0.5]; shoal-shark x3 4/11→3/11, tide→3 [-3.5]; water-shrew x3 1/6→1/4, +pounce 1, +evasive [-2] | cricket-drummer x4 2/7→1/5, inspiring 1→2 [-12] |
| 2-2 | 67 → 58.8 (80) | open-ocean-hermit-crab x4 2/2→2/3 [-12.2]; rock-pool-starfish x3 2/7→1/7 [+6]; pincushion-urchin x4 +poisonBarbs 2, -thorns 3 [+0]; open-ocean-hermit-crab (leader) 2/2→2/3 [-12.2] | soldier-ant x4 2/8→2/7 [-7.5]; bee-forager x4 +healing 1, -triggers [{do:heal,on:perTurn,sub:random,who:ally,amount:1,turnOf:self}] [+6.3]; cricket-drummer x4 2/7→1/5, inspiring 1→2 [+0.8] |
| 5-5 | 69 → 45 (66) | swamp-alligator x3 2/15→2/12, +hemorrhage 2 [-1.8] | cricket-drummer x4 2/7→1/5, inspiring 1→2 [-21.8] |
| 1-A-1 | 80.5 → 69.3 (90) | ant-scout x2 1/5→1/4 [-2]; honey-bee x2 levelSkills -→{1:{diurnal:1}} [-9.5] | wolf-spider-mother x3 2/7→2/6, +swarm [Arachnid] [-1] |
| 6-8 | 33.3 → 20.3 (40) | anhinga-spearbird x4 1/12→1/11, +hoard 2, +herbalist 1, -pounce 2 [+5.8]; constrictor-coil x1 +strangle 2 [+0.3]; nutria-reedcutter x4 2/7→3/8, +foraging 1 [-14.2]; pond-algae x1 1/7→1/8, dmgType physical→water [+0]; venomlord-serpent x4 1/22→8/24, dmgType -→poison,-poison 3 [+2.8] | cricket-drummer x4 2/7→1/5, inspiring 1→2 [-9.2] |
| 2-B-1 | 87.3 → 70.5 (90) | gull-thief x3 triggers [{do:gain,on:onKill,amount:1,resource:lumber}]→[{do:gain,on:onHit,amount:1,resource:lumber}] [-7.5]; open-ocean-hermit-crab x4 2/2→2/3 [-10]; pincushion-urchin x3 +poisonBarbs 2, -thorns 3 [+0.7] | soldier-ant x4 2/8→2/7 [-6.3] |
| 8-7 | 41.5 → 41.3 (60) | hawthorn-shieldbug x1 2/12→1/15, +counterattack, -armor 1 [+1.3] | soldier-ant x4 2/8→2/7 [-5] |
| 2-A-1 | 83.3 → 71.3 (90) | pond-algae x2 1/7→1/8, dmgType physical→water [+0] | cricket-drummer x4 2/7→1/5, inspiring 1→2 [-11.7] |
| 1-5 | 37 → 58.5 (40) | ant-scout x1 1/5→1/4 [-0.3]; badger-lumberjack x4 2/11→2/10 [+1.5]; dormouse x2 nocturnal 1→2 [-0.3]; puddle-skimmer x4 2/6→2/7 [+0.7]; field-vole (leader) 1/8→1/4, +cure 1 [+22] | soldier-ant x4 2/8→2/7 [-3.8]; bee-forager x4 +healing 1, -triggers [{do:heal,on:perTurn,sub:random,who:ally,amount:1,turnOf:self}] [-0.5] |
| 19-5 | 42.3 → 42.3 (60) | - | - |
| 11-10 | 37 → 22.5 (40) | kittiwake-flock x1 1/5→1/4, +brood 1, +guardian, -swarm [+0.2]; red-billed-chough x4 3/2→3/5, +foraging 1, -mountainClimber [-30.3]; red-billed-chough (leader) 3/2→3/5, +foraging 1, -mountainClimber [-30.3] | wolf-spider-mother x4 2/7→2/6, +swarm [Arachnid] [+13] |
| 19-A-8 | 63.8 → 46.3 (63.8) | peak-condor x2 +breach 2 [-18.2] | wolf-spider-mother x3 2/7→2/6, +swarm [Arachnid] [+2] |
| 10-6 | 64.3 → 85.8 (68.6) | moon-jelly x1 1/3→4/5, dmgType physical→poison,-poison 4 [-0.5] | wolf-spider-mother x4 2/7→2/6, +swarm [Arachnid] [+22.5] |
| 2-A-4 | 67.3 → 55 (72) | shoal-shark x2 4/11→3/11, tide→3 [-1.8]; water-shrew x1 1/6→1/4, +pounce 1, +evasive [+1]; shoal-shark (leader) 4/11→3/11, tide→3 [-1.8] | cricket-drummer x4 2/7→1/5, inspiring 1→2 [-19.3] |
| 1-A-4 | 62 → 43 (60) | ant-scout x2 1/5→1/4 [-1]; bee-forager x2 +healing 1, -triggers [{do:heal,on:perTurn,sub:random,who:ally,amount:1,turnOf:self}] [-10.3]; dormouse x2 nocturnal 1→2 [-5.5] | wolf-spider-mother x3 2/7→2/6, +swarm [Arachnid] [+1.2] |
| 10-8 | 66.8 → 77 (60) | moon-jelly x3 1/3→4/5, dmgType physical→poison,-poison 4 [-4.3] | wolf-spider-mother x4 2/7→2/6, +swarm [Arachnid] [+22] |
| 19-1 | 74.3 → 74.3 (90) | - | - |
| 2-1 | 82.3 → 74.3 (90) | open-ocean-hermit-crab x4 2/2→2/3 [-7.7]; pincushion-urchin x4 +poisonBarbs 2, -thorns 3 [-0.7]; puddle-skimmer x1 2/6→2/7 [-0.2]; rock-pool-starfish x3 2/7→1/7 [+7.8]; open-ocean-hermit-crab (leader) 2/2→2/3 [-7.7] | soldier-ant x4 2/8→2/7 [-5.5]; bee-forager x4 +healing 1, -triggers [{do:heal,on:perTurn,sub:random,who:ally,amount:1,turnOf:self}] [+4.3]; cricket-drummer x4 2/7→1/5, inspiring 1→2 [-6.2] |
| 11-7 | 76 → 83 (67.5) | peak-condor x1 +breach 2 [-2.3]; swamp-alligator x1 2/15→2/12, +hemorrhage 2 [-1.8] | wolf-spider-mother x4 2/7→2/6, +swarm [Arachnid] [+16] |
| 10-A-5 | 38.3 → 24.8 (40) | moon-jelly x3 1/3→4/5, dmgType physical→poison,-poison 4 [-11] | wolf-spider-mother x4 2/7→2/6, +swarm [Arachnid] [-2.7] |
| 2-A-6 | 56.3 → 44.8 (60) | pond-algae x1 1/7→1/8, dmgType physical→water [-0.2] | cricket-drummer x4 2/7→1/5, inspiring 1→2 [-11.2] |
| 6-1 | 91 → 75 (90) | anhinga-spearbird x4 1/12→1/11, +hoard 2, +herbalist 1, -pounce 2 [+9]; crocodile-ambusher x4 5/17→3/16, +gash 2, +ambush 5 [-1.3]; lamprey x4 dmgType physical→shock,+sap [-5.8]; pond-algae x1 1/7→1/8, dmgType physical→water [+0]; water-shrew x1 1/6→1/4, +pounce 1, +evasive [-2.8]; lamprey (leader) dmgType physical→shock,+sap [-5.8] | cricket-drummer x4 2/7→1/5, inspiring 1→2 [-13.8] |
| 7-A-2 | 80 → 84.3 (70) | hawthorn-shieldbug x4 2/12→1/15, +counterattack, -armor 1 [+8.3]; planarian-splitter x3 renamed [+0]; puffball-bombardier x2 renamed [+0] | soldier-ant x4 2/8→2/7 [-2.2] |
| 11-4 | 84.3 → 93 (78.8) | swamp-alligator x1 2/15→2/12, +hemorrhage 2 [+0.2] | wolf-spider-mother x4 2/7→2/6, +swarm [Arachnid] [+9.2] |
| 20-A-4 | 48.8 → 48.8 (35.5) | - | - |
| 5-A-3 | 68.5 → 47 (60) | constrictor-coil x1 +strangle 2 [-5.8]; nutria-reedcutter x1 2/7→3/8, +foraging 1 [-5]; swamp-alligator x3 2/15→2/12, +hemorrhage 2 [-11.5] | - |
| 9-7 | 38.5 → 27.3 (40) | nutria-reedcutter x1 2/7→3/8, +foraging 1 [-1.7] | soldier-ant x4 2/8→2/7 [-9.2] |
| 10-2 | 80.5 → 73 (85.7) | dolphin-knight x1 3/9→2/8, tide→2, +breach 2 [-19]; dolphin-knight (leader) 3/9→2/8, tide→2, +breach 2 [-19] | wolf-spider-mother x4 2/7→2/6, +swarm [Arachnid] [+16] |
| 10-5 | 73.3 → 85.5 (72.9) | - | wolf-spider-mother x4 2/7→2/6, +swarm [Arachnid] [+12.2] |
| 11-9 | 59.3 → 72.5 (60) | kittiwake-flock x1 1/5→1/4, +brood 1, +guardian, -swarm [+3] | wolf-spider-mother x4 2/7→2/6, +swarm [Arachnid] [+9.7] |
| 10-A-1 | 84.3 → 78 (90) | moon-jelly x1 1/3→4/5, dmgType physical→poison,-poison 4 [-6.3] | wolf-spider-mother x4 2/7→2/6, +swarm [Arachnid] [-2] |
| 6-7 | 62 → 48 (60) | anhinga-spearbird x1 1/12→1/11, +hoard 2, +herbalist 1, -pounce 2 [+9.2]; crocodile-ambusher x2 5/17→3/16, +gash 2, +ambush 5 [-11]; venomlord-serpent x4 1/22→8/24, dmgType -→poison,-poison 3 [+5] | cricket-drummer x4 2/7→1/5, inspiring 1→2 [-13.8] |
| 19-A-4 | 94.5 → 90.8 (78.8) | peak-condor x1 +breach 2 [-4.5] | wolf-spider-mother x3 2/7→2/6, +swarm [Arachnid] [+0.8] |
| 17-A-4 | 46.3 → 51.8 (40) | - | wolf-spider-mother x3 2/7→2/6, +swarm [Arachnid] [+5.5] |
| 5-1 | 91 → 78.3 (90) | constrictor-coil x4 +strangle 2 [-1.7]; shoal-shark x1 4/11→3/11, tide→3 [+2.8]; swamp-alligator x4 2/15→2/12, +hemorrhage 2 [-0.5] | cricket-drummer x4 2/7→1/5, inspiring 1→2 [-11.5] |
| 7-A-3 | 69.8 → 81.5 (70) | hawthorn-shieldbug x4 2/12→1/15, +counterattack, -armor 1 [+16] | soldier-ant x4 2/8→2/7 [-0.8] |
| 7-A-5 | 32.5 → 28.5 (40) | puffball-bombardier x3 renamed [+0] | soldier-ant x4 2/8→2/7 [-4] |
| 9-1 | 87 → 79 (90) | crocodile-ambusher x4 5/17→3/16, +gash 2, +ambush 5 [+0]; nutria-reedcutter x1 2/7→3/8, +foraging 1 [-3.8]; crocodile-ambusher (leader) 5/17→3/16, +gash 2, +ambush 5 [+0] | soldier-ant x4 2/8→2/7 [-2.5] |
| 9-2 | 77.8 → 73 (84) | - | soldier-ant x4 2/8→2/7 [-4.8] |
| 9-3 | 71 → 67 (78) | - | soldier-ant x4 2/8→2/7 [-4] |
| 15-2 | 71 → 73 (84) | - | golden-eagle-diver x1 2/2→3/5, renamed,wait 0→1,+daunt 2, diurnal→1, -pounce 3 [+2] |
| 12-7 | 44.8 → 51 (40) | - | wolf-spider-mother x3 2/7→2/6, +swarm [Arachnid] [+6.2] |
| 0-2 | 77.3 → 85.8 (75) | ant-scout x2 1/5→1/4 [+0.5]; bee-sentry x2 2/5→1/5 [+6.5]; chipmunk-forager x4 levelSkills -→{1:{foraging:1}} [+0] | honey-bee x3 levelSkills -→{1:{diurnal:1}} [+0]; sparrow-chick x3 -flying,levelSkills {1:{flying:true,hatchling:true}}→{1:{bleed:1,flying:true,hatchling:true}} [+1.8] |
| 16-2 | 76.3 → 73.5 (84) | - | golden-eagle-diver x1 2/2→3/5, renamed,wait 0→1,+daunt 2, diurnal→1, -pounce 3 [-4]; wolf-spider-mother x1 2/7→2/6, +swarm [Arachnid] [+0.2] |
