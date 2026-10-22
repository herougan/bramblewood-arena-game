# Robust skill test (mono), 2026-10-22

Made by `tools/skill_test_robust.js`; the data is `skill-test-robust-mono-2000-2026-10-22.json`. 2000 games a setup, seed 1.

Units: the live band cards' rarity / Wait / Lumber mix, stats from the budget at Level 1 (the skill priced in). Fields: Day/Night and Tide 20% each, each uncommon field 2%, each rare one 0.2%, and 20% of fights get one more non-common field.

```
vanilla vs the standard enemy: 41.1% (2000 games); mean vanilla unit 2.85/13.78 (19.54 stat points)

setup                                win rate  net (±)   paid  worth  S table   field: worth
absoluteZero                            99.5% +42.67> ±1.22   1.93   44.6        1  sandstorm 12.93, scorching 16.56, rain 39.26
acidBolt 2                              98.1% +38.31> ±10.94   2.93  41.24        2  eruption 7.01, scorching 9.43, swampFever 12.43
ghost                                   98.0% +35.91 ±11.65   1.93  37.84        1  eruption 9.43, swampFever 9.93, fog 11.43
avalanche 1                             97.8% +17.26 ±12.39   4.93  22.19        4  daynight:night 50.43, fog 50.43, wet 50.43
fireball 15                             75.9%     +2.8 ±0.1  15.16  17.96       16  rain 25.49, fog 24.66, dark 22.41
meteor 20                               50.2%   +0.67 ±0.08  17.11  17.78       22  rain 20.66, fog 19.65, dark 19.23
twinShot 2                              29.7%   -0.91 ±0.08  16.04  15.13       18  scorching 9.74, eruption 10.49, swampFever 12.51
supremeTide                             94.5%   +7.72 ±0.46   4.93  12.65        4  fog 43.43, rain 39.1, wet 18.1
iceBolt 2                               88.4%   +4.81 ±0.17   6.93  11.74        6  fog 44.43, sandstorm 16.13, scorching 7.96
shockBolt 2                             85.9%   +4.22 ±0.18   6.93  11.15        6  rain 43.6, dark 18.68, sandstorm 17.03
iceArrow 1                              93.0%   +6.67 ±0.26   3.43   10.1      2.5  firstBlood 48.93, fog 41.43, rain 35.21
strangle 2                              93.7%   +7.06 ±0.38   2.93   9.99        2  firstBlood 41.43, daynight:night 40.93, rain 39.93
tsunami 1                                2.1%   -4.98 ±0.31   14.6   9.62       15  none 6.6, daynight:night 6.6, rain 6.6
spitfire 2                              92.8%   +6.56 ±0.25   2.93   9.49        2  fog 48.43, daynight:night 16.43, dark 14.68
poisonBolt 2                            69.3%   +2.13 ±0.09   6.93   9.06        6  fog 13.16, sandstorm 12.91, scorching 5.65
tangle 1                                89.4%   +5.11 ±0.26   2.93   8.04        2  rain 34.71, scorching 3.73, eruption 4.36
fireBolt 2                              67.5%   +1.98 ±0.08   5.93   7.91        5  fog 12.73, dark 10.84, sandstorm 9.68
rocket 4                                84.3%   +3.85 ±0.17   3.93   7.78        3  sandstorm 13.13, fog 11.5, arrowSlits 5.81
decay 1                                 91.0%   +5.82 ±0.27   1.93   7.75        1  rain 36.1, dark 12.68, scorching 3.18
corrode 2                               87.0%    +4.5 ±0.18   2.93   7.43        2  rain 37.1, scorching 3.39, wet 10.43
volley 1                                81.8%   +3.43 ±0.11   3.93   7.36        3  fog 12.26, wet 11.43, dark 10.31
arrow 2                                 46.8%   +0.42 ±0.08   6.93   7.35        6  dark 10.9, fog 10.71, sandstorm 9.71
fireArrow 2                             33.7%   -0.59 ±0.08   7.93   7.34        7  rain -0.07, dark 9.9, fog 9.76
banana                                  59.9%   +1.38 ±0.08   5.93   7.31        5  fog 11.58, dark 11.43, rain 9.48
swift                                   39.8%   -0.11 ±0.09   7.14   7.03        0  canopy 11.19, scorching 3.27, dark 5
poisonGas 2                             42.1%   +0.07 ±0.08   6.93      7        6  fog 10.34, dark 9.5, sandstorm 8.81
loneWolf [1,1]                           1.6%   -5.54 ±0.46  12.51   6.97       12  rain 4.51, fog 4.51, highTide 4.51
sociable [1,1]                          38.6%    -0.2 ±0.09   6.93   6.73        6  rain 9.64, fog 8.76, dark 8.45
ichor 2                                 82.5%   +3.53 ±0.13   2.93   6.46        2  wind 9.6, fog 9.44, dark 9.31
twinStrike                              65.5%   +1.82 ±0.08    4.1   5.92     3.17  rain 12.49, scorching 3.27, arrowSlits 4.56
flying                                  28.4%   -1.01 ±0.08   6.89   5.88        0  fog 9.81, wind 9.08, sandstorm 9.04
nova 3                                  39.8%   -0.11 ±0.09   5.93   5.82        5  rain 2.96, fog 7.51, dark 7.39
evasive                                 23.8%   -1.37 ±0.08   7.14   5.77        0  scorching 1.92, dark 4.16, rain 7.37
banner 1                                38.7%   -0.19 ±0.09   5.93   5.74        5  rain 9.32, fog 7.85, scorching 3.82
formation 1                             69.0%    +2.1 ±0.08   3.43   5.53      2.5  rain 9.28, scorching 3.54, wind 7.25
bludgeon                                82.0%   +3.45 ±0.12   1.93   5.38        1  rain 13.1, scorching 1.93, canopy 7.43
weaken 1                                82.0%   +3.45 ±0.12   1.93   5.38        1  rain 13.1, scorching 1.93, canopy 7.43
devour {"attack":3,"health":3,"grant    46.3%   +0.38 ±0.08   4.93   5.31        4  rain 10.23, scorching 3.08, sandstorm 6.95
meiosis 1                               81.0%   +3.34 ±0.09   1.93   5.27        1  fog 8.16, canopy 7.43, firstBlood 7.36
onDeathSpawn {"defId":"bat-swarmling    57.6%   +1.22 ±0.08   3.93   5.15        3  fog 8.72, swampFever 2.35, scorching 3.55
berserk 2                               40.7%   -0.03 ±0.09   4.93    4.9        4  rain 7.84, scorching 3.65, eruption 4.11
swipe 1                                 54.0%   +0.95 ±0.08   3.93   4.88        3  rain 9.41, scorching 3.8, eruption 3.82
earthquake 3                            70.8%   +2.26 ±0.11   1.81   4.07     0.88  scorching 1.36, arrowSlits 1.39, fog 5.83
mimic                                   17.6%   -1.87 ±0.07   5.93   4.06        5  wind 2.17, rain 5.23, sandstorm 2.95
render {"trigger":"onSpawn","amount"    56.4%   +1.13 ±0.08   2.93   4.06        2  rain 7.3, scorching 2.67, swampFever 2.69
brittle 2                               50.0%   +1.96 ±0.08      2   3.96        2  rain 7.59, scorching 0.91, swampFever 2.05
sap                                     67.3%   +1.97 ±0.08   1.93    3.9        1  scorching 6.93, rain 6.86, sandstorm 3.24
puncture 2                              60.3%   +1.41 ±0.08   2.33   3.74      1.4  rain 8.18, scorching 2.44, eruption 2.53
brood 1                                 48.1%   +0.51 ±0.08   3.13   3.64      2.2  rain 6.52, scorching 0.77, swampFever 1.26
rally 1                                 23.4%   -1.41 ±0.08   4.93   3.52        4  rain 6.1, fog 2.04, dark 2.54
arson 2                                 40.9%   -0.02 ±0.08   3.43   3.41      2.5  rain 6.66, fog 5.1, swampFever 2.62
armor 1                                 54.3%   +0.97 ±0.08   2.43    3.4      1.5  rain 5.14, scorching 1.79, wind 1.86
psychic 1                               47.5%   +0.47 ±0.08   2.93    3.4        2  rain 6.16, swampFever 1.73, scorching 2.23
stealth                                 52.9%   +0.87 ±0.08   2.43    3.3      1.5  rain 14.71, fog 9.23, scorching 0.32
bulwark 1                               59.2%   +1.34 ±0.08   1.93   3.27        1  rain 6.67, fog 6.07, sandstorm 5.08
charge {"n":2,"do":{"do":"damage","a    32.7%   -0.67 ±0.08   3.93   3.26        3  fog 5.12, rain 4.87, dark 4.72
sprout 1                                32.6%   -0.68 ±0.08   3.93   3.25        3  fog 5.93, rain 5.84, scorching 1.7
trap 5                                  43.9%    +0.2 ±0.08   3.03   3.23      2.1  rain 4.74, scorching 1.95, fog 4.28
onReadyGold 1                            4.5%   -3.95 ±0.09   7.17   3.22     6.24  rain 7.4, arrowSlits -0.83, canopy 0.76
healing 1                               19.1%   -1.75 ±0.07   4.93   3.18        4  rain 7.44, sandstorm 4.75, firstBlood 1.77
dynamite 3                              56.0%    +1.1 ±0.08   2.03   3.13      1.1  rain 6.06, scorching 0.43, firstBlood 4.54
pickpocket 2                            43.8%   +0.19 ±0.08   2.93   3.12        2  sandstorm 4.68, fog 4.6, rain 4.1
lightning 3                             17.6%   -1.87 ±0.07   4.93   3.06        4  rain 5.63, fog 4.64, daynight:night 2.07
snipe 3                                 30.1%   -0.87 ±0.08   3.93   3.06        3  rain 4.16, daynight:night 2.27, highTide 2.4
onReadyDamage {"amount":3,"dmgType":    52.7%   +0.85 ±0.08   2.13   2.98      1.2  fog 4.13, rain 4.04, wet 3.58
trident                                 16.6%   -1.95 ±0.07   4.93   2.98        4  rain 5.87, scorching 1.06, arrowSlits 1.67
shield 3                                41.6%   +0.04 ±0.08   2.93   2.97        2  dark 1.62, swampFever 2.07, scorching 3.61
spiteful 2                               9.2%      -3 ±0.13   5.93   2.93        5  rain 5.23, scorching 1.61, wet 4.13
explode {"time":1,"damage":4}           15.8%   -2.01 ±0.06   4.93   2.92        4  eruption 4.33, wind 1.93, dark 2.12
grit 1                                  66.1%   +1.87 ±0.08   0.98   2.85     0.05  rain 5.35, scorching 1.78, swampFever 1.79
twin                                     0.3%  -7.98< ±0.05  10.83   2.85       10  rain 7, scorching 4.83, eruption 4.47
blind {"chance":50,"duration":2}        33.7%   -0.59 ±0.08   3.43   2.84      2.5  rain 5.34, dark 0.96, scorching 1.26
nursing 2                                0.1%        -8< ±0  10.83   2.83       10  canopy 4.42, scorching 4.33, swampFever 3.58
rage                                     8.6%   -3.12 ±0.13   5.93   2.81        5  scorching 0.26, rain 5.23, swampFever 1.03
wither 1                                28.2%   -1.02 ±0.08   3.83   2.81      2.9  rain 13.89, scorching 1.24, fog 3.95
backstab 2                              26.9%   -1.13 ±0.08   3.93    2.8        3  swampFever 1.29, rain 4.16, scorching 1.95
shedding                                26.8%   -1.14 ±0.08   3.93   2.79        3  rain 6.24, scorching 1.63, arrowSlits 1.68
bananarang                              25.9%   -1.21 ±0.08   3.93   2.72        3  fog 4.55, sandstorm 4.09, rain 3.93
poison 1                                32.2%   -0.71 ±0.08   3.43   2.72      2.5  rain 5.94, dark 1.12, scorching 1.13
sabotage 2                              25.9%   -1.21 ±0.08   3.93   2.72        3  rain 6.64, fog 3.93, daynight:night 3.72
inspiring 1                             17.1%   -1.91 ±0.07   4.43   2.52      3.5  rain 5.13, canopy 1.48, eruption 1.64
carrion 2                               28.2%   -1.03 ±0.08   3.53    2.5      2.6  scorching 4.33, rain 3.53, daynight:night 1.87
durian                                  42.1%   +0.07 ±0.08   2.43    2.5      1.5  rain 5.14, scorching 0.83, swampFever 0.95
crit                                    11.9%   -2.45 ±0.15   4.93   2.48        4  rain 6.64, scorching -0.29, sandstorm 1.21
thorns 2                                 5.0%    -3.85 ±0.1   6.33   2.48      5.4  swampFever 0.63, wet 4.13, highTide 1.16
scavenge 2                              41.3%   +0.01 ±0.08   2.43   2.44      1.5  fog 3.56, wind 1.35, eruption 3.38
relic                                   34.6%   -0.52 ±0.08   2.93   2.41        2  swampFever 1.11, fog 3.68, sandstorm 3.09
sentry                                  21.9%   -1.52 ±0.07   3.93   2.41        3  rain 4.16, daynight:night 1.07, swampFever 1.62
invisible 2                             24.7%    -1.3 ±0.08   3.65   2.35     2.72  dark 1.01, rain 3.65, wet 3.19
scar 2                                  11.2%   -2.59 ±0.14   4.93   2.34        4  rain 8.64, scorching -0.74, fog 0.8
regen 1                                 25.4%   -1.25 ±0.08   3.53   2.28      2.6  rain 5.24, dark 3.06, sandstorm 2.98
invincible 1                            42.3%   +0.08 ±0.08   2.16   2.24     1.23  dark 1.22, rain 3.1, wind 1.48
daunt 1                                 26.1%    -1.2 ±0.08   3.43   2.23      2.5  rain 5.94, dark 0.79, scorching 1.26
vanguard 1                              42.4%   +0.09 ±0.08   2.13   2.22      1.2  rain 4.84, scorching 1.11, sandstorm 3.11
rebuild 2                               43.1%   +0.15 ±0.08   2.03   2.18      1.1  rain 4.94, sandstorm 3.78, fog 3.22
electricity 1                           18.9%   -1.77 ±0.07   3.93   2.16        3  rain 5.64, scorching -0.62, tide 2.99
freeze {"chance":25,"duration":1}       33.8%   -0.58 ±0.08   2.73   2.15      1.8  rain 3.9, fog 3.35, daynight:night 1.28
bloom 1                                 10.1%   -2.82 ±0.14   4.93   2.11        4  rain 5.87, scorching 0.83, fog 3.02
rabid                                    5.2%    -3.82 ±0.1   5.93   2.11        5  rain 6.16, arrowSlits -0.74, eruption -0.43
confuse {"chance":50,"duration":2}      18.1%   -1.83 ±0.07   3.93    2.1        3  rain 4.87, scorching 0.06, arrowSlits 0.92
stunOnHit 1                             18.1%   -1.83 ±0.07   3.93    2.1        3  scorching -0.17, dark 0.1, rain 3.93
midas 2                                 30.5%   -0.84 ±0.08   2.93   2.09        2  rain 3.63, swampFever 1.02, fog 3.05
pounce 2                                12.0%   -2.44 ±0.15   4.53   2.09      3.6  canopy 4.53, rain 3.83, firstBlood 0.43
smokeBomb                               30.5%   -0.84 ±0.08   2.93   2.09        2  rain 3.63, dark 0.71, fog 3.12
chilli 2                                 9.9%   -2.87 ±0.13   4.93   2.06        4  rain 6.1, dark -0.64, scorching 0.61
timber                                  17.5%   -1.88 ±0.07   3.93   2.05        3  rain 4.4, dark 1.12, swampFever 1.29
tipsy {"chance":50,"duration":2}        36.3%   -0.39 ±0.09   2.43   2.04      1.5  rain 3.6, daynight:night 0.56, firstBlood 3.06
satiety                                 29.6%   -0.92 ±0.08   2.93   2.01        2  swampFever 0.78, fog 3.18, wind 0.89
shell 2                                  9.5%   -2.94 ±0.13   4.93   1.99        4  rain 6.64, daynight:night -0.57, dark 0.93
stagger {"chance":60,"duration":2}      16.7%   -1.94 ±0.07   3.93   1.99        3  rain 4.87, scorching -0.62, swampFever 0.8
scare 2                                  4.4%   -3.97 ±0.09   5.93   1.96        5  daynight:night -2.07, fog -2.07, rain 3.83
wave "alternate"                        29.0%   -0.97 ±0.08   2.93   1.96        2  rain 3.87, swampFever 0.87, scorching 0.89
shadow                                   1.8%    -5.2 ±0.34   7.14   1.94        0  daynight:night 5.48, rain -0.86, fog -0.86
pitchfork                                9.2%      -3 ±0.13   4.93   1.93        4  daynight:night -0.57, scorching 0.61, wet 0.63
foraging 2                              40.3%   -0.06 ±0.09   1.93   1.87        1  rain 4.24, highTide 0.91, canopy 2.76
mighty                                   3.9%   -4.06 ±0.09   5.93   1.87        5  daynight:night -2.07, rain 5.23, arrowSlits -0.74
supreme                                  3.7%   -4.12 ±0.08   5.93   1.81        5  daynight:night -2.07, dark -1.12, rain 3.83
swimmer                                 14.4%   -2.12 ±0.06   3.93   1.81        3  highTide 5.83, tide 4.67, rain 4.63
gash 3                                  14.1%   -2.15 ±0.06   3.93   1.78        3  daynight:night -0.07, swampFever 0.4, wind 0.64
retribution                             14.0%   -2.16 ±0.06   3.93   1.77        3  rain 3.23, wind 0.83, fog 2.61
tornado 1                               20.1%   -1.67 ±0.07   3.43   1.76      2.5  rain 2.73, sandstorm 0.94, dark 1.12
bleed 1                                 19.5%   -1.72 ±0.07   3.43   1.71      2.5  rain 4.6, scorching 0.01, daynight:night 0.57
octolash                                 1.5%    -5.7 ±0.49   7.41   1.71     6.48  rain 5.31, daynight:night -0.59, wind -0.59
toxin 1                                  3.2%   -4.22 ±0.08   5.93   1.71        5  rain 6.16, daynight:night -2.07, arrowSlits -2.07
crystallise 5                           35.2%   -0.47 ±0.08   2.13   1.66      1.2  rain 3.3, fog 2.75, sandstorm 2.62
siege 2                                 25.1%   -1.27 ±0.08   2.93   1.66        2  rain 3.4, dark 0.03, fog 3.18
skyfall                                 37.7%   -0.28 ±0.09   1.93   1.65        1  rain 2.63, fog 2.55, swampFever 0.78
fullMoon 3                               0.7%   -7.33 ±0.37   8.92   1.59        8  daynight:night 5.49, daynight 3.87, scorching 2.42
proliferate 1                            0.0%      -4.2< ±0   5.79   1.59        6  rain -2.44, arrowSlits 4.46, eruption 4.15
boomerang                               12.4%   -2.35 ±0.14   3.93   1.58        3  fog 4.18, scorching -0.17, firstBlood 0.77
haste                                   12.4%   -2.36 ±0.14   3.93   1.57        3  wind 0.08, fog 0.22, dark 0.27
desecrate 1                              1.6%   -5.39 ±0.43   6.93   1.54        6  rain 4.83, daynight:night -1.07, dark -1.07
tide                                    30.0%   -0.89 ±0.08   2.43   1.54      1.5  highTide 6.98, rain 4.14, tide 3.82
momentum                                29.7%   -0.91 ±0.08   2.43   1.52      1.5  fog 2.87, rain 2.66, wind 0.39
sleep {"chance":50,"duration":2}         6.7%   -3.51 ±0.11   4.93   1.42        4  rain 4.93, scorching -0.74, wet -0.24
landslide 2                              6.5%   -3.56 ±0.11   4.93   1.37        4  daynight:night -0.57, scorching 2.82, eruption 2.68
repair 2                                34.0%   -0.57 ±0.08   1.93   1.36        1  rain 2.87, fog 2.49, canopy 0.48
bulldoze 1                               5.9%   -3.66 ±0.11   4.93   1.27        4  rain 5.63, daynight:night -3.07, swampFever -0.77
shock {"chance":30,"duration":1}        33.2%   -0.63 ±0.08   1.86   1.23     0.93  sandstorm -0.88, rain 3.03, dark -0.01
trueStrike                              24.9%   -1.29 ±0.08   2.43   1.14      1.5  fog 5.72, dark 4.63, sandstorm 4.04
nocturnal                               35.7%   -0.43 ±0.09   1.56   1.13        1  daynight:night 3.99, daynight 3.05, rain 2.73
slashBurn 3                             32.1%   -0.72 ±0.08   1.83   1.11      0.9  dark -0.14, fog 2.33, rain 2.3
guardian                                29.9%   -0.89 ±0.08   1.99    1.1     1.06  rain 2.46, scorching -0.05, fog 0.22
sonar                                   16.8%   -1.93 ±0.07   2.93      1        2  fog 4.43, dark 4.27, sandstorm 2.93
diurnal                                 33.7%   -0.59 ±0.08   1.56   0.97        1  daynight:night -0.73, daynight 2.32, fog 2.06
sturdy                                   0.3%  -7.96< ±0.07   8.92   0.96        8  scorching 3.02, eruption 2.56, wet 2.34
keenSense                               20.8%   -1.61 ±0.07   2.56   0.95     1.63  dark 4.45, fog 4.23, sandstorm 3.54
lumberjack                               2.0%       -5 ±0.3   5.93   0.93        5  rain 4.53, wind -2.07, tide -0.89
chainLightning 2                         0.1%        -8< ±0   8.92   0.92        8  scorching 1.67, none 0.92, daynight 0.92
moonborn 2                               0.2%        -8< ±0   8.92   0.92        8  daynight:night 3.42, dark 2.82, scorching 2.52
gilded                                   0.1%        -8< ±0   8.92   0.92        8  scorching 1.67, none 0.92, daynight 0.92
rainrunner 2                             4.1%   -4.03 ±0.09   4.93    0.9        4  rain 41.93, arrowSlits -3.07, dark -1.17
demolisher                              40.6%   -0.04 ±0.09   0.93   0.89        0  rain -0.47, scorching 2.18, wind 0.08
fork                                     3.9%   -4.08 ±0.09   4.93   0.85        4  rain 4.23, scorching -0.29, wet -0.24
esprit 1                                13.2%   -2.22 ±0.09   3.03   0.81      2.1  rain 2.33, scorching -0.62, dark -0.46
keenEye                                 20.5%   -1.64 ±0.07   2.43   0.79      1.5  rain 2.66, wind -0.48, dark -0.04
spotter                                 30.1%   -0.88 ±0.08   1.65   0.77     0.72  dark 4.66, fog 4.57, sandstorm 3.67
disarm                                  13.6%   -2.18 ±0.07   2.93   0.75        2  dark -0.48, wind -0.17, highTide -0.17
prayerWard 1                             7.9%   -1.75 ±0.12    2.5   0.75      2.5  scorching -1.19, fog -1.17, rain 2.5
coreEvil                                13.6%   -2.19 ±0.07   2.93   0.74        2  dark -0.48, wind -0.17, highTide -0.17
inherentDarkness 1                      13.6%   -2.19 ±0.07   2.93   0.74        2  dark -0.48, wind -0.17, highTide -0.17
remember 2                              13.6%   -2.19 ±0.07   2.93   0.74        2  dark -0.48, wind -0.17, highTide -0.17
stem                                    13.6%   -2.19 ±0.07   2.93   0.74        2  dark -0.48, wind -0.17, highTide -0.17
championed                              13.6%   -2.19 ±0.07   2.93   0.74        2  dark -0.48, wind -0.17, highTide -0.17
veteran                                 13.6%   -2.19 ±0.07   2.93   0.74        2  dark -0.48, wind -0.17, highTide -0.17
chrysalis                               18.5%    -1.8 ±0.07   2.53   0.73      1.6  rain 2.76, fog -1.18, swampFever 0.05
paralyze                                13.5%    -2.2 ±0.08   2.93   0.73        2  arrowSlits -0.58, sandstorm -0.17, rain 1.53
sweep 3                                  0.0%        -8< ±0   8.72   0.72      7.8  none 0.72, daynight 0.72, daynight:night 0.72
ambush 2                                 3.1%    -4.24 ±0.1   4.93   0.69        4  dark -3.07, rain 3.53, arrowSlits -1.74
detonate                                11.1%   +1.18 ±0.14   -0.5   0.68     -0.5  daynight:night 3.13, highTide -0.75, eruption 2.09
king                                     3.0%   -4.26 ±0.14   4.93   0.67        4  daynight:night -3.07, dark -3.07, wind -3.07
predator 1                              28.5%      -1 ±0.08   1.63   0.63      0.7  rain 2.57, fog 1.75, dark -0.06
speed 2                                  3.3%    -4.2 ±0.08   4.83   0.63      3.9  daynight:night -3.17, wind -3.17, eruption -1.53
shieldwall 1                             1.7%   -5.32 ±0.39   5.93   0.61        5  daynight:night -2.07, dark -2.07, fog -2.07
castDarkness                            29.8%    -0.9 ±0.08   1.47   0.57     0.54  fog 1.72, rain 1.47, dark -0.22
hoard 2                                 23.2%   -1.43 ±0.07   1.93    0.5        1  rain 2.16, fog 1.05, swampFever 0.06
frostbite 1                             28.9%   -0.97 ±0.08   1.43   0.46      0.5  wind -0.38, fog -0.34, daynight:night -0.23
reach                                   28.9%   -0.97 ±0.08   1.43   0.46      0.5  wind -0.38, fog -0.34, daynight:night -0.23
cure 2                                  22.5%   -1.48 ±0.07   1.93   0.45        1  rain 2.16, fog 1.05, highTide -0.11
pierce 1                                22.5%   -1.48 ±0.07   1.93   0.45        1  rain 2.16, fog 1.05, highTide -0.11
salvage 2                               22.5%   -1.48 ±0.07   1.93   0.45        1  rain 2.16, fog 1.05, highTide -0.11
stemGrant {"armor":1}                   39.2%   -0.15 ±0.09    0.6   0.45      0.6  firstBlood -0.95, rain 1.3, swampFever -0.31
hazardIce 1                             22.5%   -1.48 ±0.07   1.93   0.45        1  rain 2.16, fog 1.05, highTide -0.11
hazardRubble 1                          22.5%   -1.48 ±0.07   1.93   0.45        1  rain 2.16, fog 1.05, highTide -0.11
anchor                                  28.8%   -0.98 ±0.08   1.43   0.45      0.5  wind -0.38, fog -0.34, daynight:night -0.23
tribute 2                               22.5%   -1.48 ±0.07   1.93   0.45        1  rain 2.16, fog 1.05, highTide -0.11
crabClaws                               33.7%   -0.59 ±0.08   1.03   0.44      0.1  rain 1.5, swampFever -0.4, wind -0.33
pry 1                                   28.7%   -0.99 ±0.08   1.43   0.44      0.5  wind -0.38, fog -0.34, daynight:night -0.23
dragonLightning 1                        0.2%     -8< ±0.02   8.43   0.43      7.5  scorching 2.13, sandstorm 1.1, none 0.43
swarm                                    9.1%   -3.03 ±0.13   3.43    0.4      2.5  rain 2.03, scorching -1.12, dark -1.1
spellshield                             24.0%   -1.36 ±0.08   1.73   0.37      0.8  rain 2.2, fog 1.85, arrowSlits 1.16
shade                                   33.6%    -0.6 ±0.08   0.93   0.33        0  dark 6.31, daynight:night 6.03, daynight 2.64
overwhelm                               29.9%   -0.89 ±0.08   1.21   0.32     0.28  fog 1.83, wind -0.6, arrowSlits -0.42
mountainClimber                          2.4%   -4.62 ±0.33   4.93   0.31        4  scorching 4.04, daynight:night -3.07, arrowSlits -2.4
restless                                30.5%   -0.85 ±0.08   1.13   0.28      0.2  fog 1.88, rain 1.13, dark -0.46
web 1                                   28.3%   -1.02 ±0.08   1.27   0.25     0.34  fog 1.27, wind -0.54, arrowSlits -0.5
perforate 2                              0.5%   -7.69 ±0.27   7.93   0.24        7  rain 4.96, scorching 1.73, eruption 1.57
beware 4                                27.4%   -1.09 ±0.08   1.23   0.14      0.3  wind -0.7, arrowSlits -0.68, fog 0.94
executioner 2                           28.6%      -1 ±0.08   1.13   0.13      0.2  rain 1.13, fog 1.13, canopy 0.65
dry                                      2.2%   -4.81 ±0.32   4.93   0.12        4  scorching 4.04, daynight:night -3.07, arrowSlits -2.4
darksight                                4.9%    -3.87 ±0.1   3.93   0.06        3  dark 3.18, sandstorm -2.07, rain 1.83
illuminate                              27.7%   -1.07 ±0.08   1.13   0.06      0.2  fog 1.13, canopy 0.65, wet 0.61
salvageEvery                            41.1%      +0 ±0.08      0      0        0  none 0, daynight 0, daynight:night 0
scavengeEvery                           41.1%      +0 ±0.08      0      0        0  none 0, daynight 0, daynight:night 0
kinship {"type":"Bee","atk":1,"hp":0     4.2%      -4 ±0.09   3.93  -0.07        3  arrowSlits -2.74, dark -2.17, rain 1.83
frenzy                                  27.0%   -1.13 ±0.08   1.03   -0.1      0.1  scorching 0.46, fog 0.44, daynight:night -0.63
changeling                              26.6%   -1.15 ±0.08   1.03  -0.12      0.1  fog 0.44, daynight:night -0.63, highTide 0.35
moonpull                                26.6%   -1.15 ±0.08   1.03  -0.12      0.1  fog 0.44, daynight:night -0.63, highTide 0.35
worthy                                  26.6%   -1.15 ±0.08   1.03  -0.12      0.1  fog 0.44, daynight:night -0.63, highTide 0.35
broodkeeper 1                            3.9%   -4.08 ±0.09   3.93  -0.15        3  arrowSlits -2.74, dark -2.17, sandstorm -2.07
sacrifice 1                              3.7%   -4.12 ±0.08   3.93  -0.19        3  arrowSlits -2.74, dark -2.17, sandstorm -2.07
smelter 2                                3.7%   -4.12 ±0.08   3.93  -0.19        3  arrowSlits -2.74, dark -2.17, sandstorm -2.07
weaponMaster 1                           3.7%   -4.12 ±0.08   3.93  -0.19        3  arrowSlits -2.74, dark -2.17, sandstorm -2.07
amplifier 1                              3.7%   -4.12 ±0.08   3.93  -0.19        3  arrowSlits -2.74, dark -2.17, sandstorm -2.07
matured                                  3.7%   -4.12 ±0.08   3.93  -0.19        3  arrowSlits -2.74, dark -2.17, sandstorm -2.07
herbalist 1                             26.8%   -1.14 ±0.08   0.93  -0.21        0  rain 11.54, dark 0.56, scorching 0.42
hunter 2                                 0.0%      -4.2< ±0   3.95  -0.25        4  rain -4.28, arrowSlits 2.62, eruption 2.31
venomous 2                               0.7%   -7.23 ±0.39   6.93   -0.3        6  rain 5.53, firstBlood 2.83, scorching 0.63
taunt                                    3.0%   -4.25 ±0.13   3.93  -0.32        3  rain -4.07, firstBlood -4.07, arrowSlits -4.07
atheist                                 25.0%   -1.28 ±0.08   0.93  -0.35        0  dark 0.56, scorching 0.42, sandstorm -0.71
creative                                25.0%   -1.28 ±0.08   0.93  -0.35        0  fog 0.93, sandstorm -1.56, eruption 0.33
coffee 1                                22.1%   -1.51 ±0.07   1.15  -0.36     0.22  rain -2.68, eruption 0.88, dark -1.32
helmet                                  24.8%    -1.3 ±0.08   0.93  -0.37        0  dark 0.56, scorching 0.42, sandstorm -1.07
revive                                   1.4%    -5.8 ±0.51   5.43  -0.37      4.5  daynight:night -2.57, rain -2.57, fog -2.57
rockSolid                               24.8%    -1.3 ±0.08   0.93  -0.37        0  dark 0.56, scorching 0.42, sandstorm -0.89
shatter 2                               24.8%    -1.3 ±0.08   0.93  -0.37        0  dark 0.56, scorching 0.42, sandstorm -0.89
amore                                   24.7%   -1.31 ±0.08   0.93  -0.38        0  dark 0.56, scorching 0.42, sandstorm -0.89
arrows 2                                24.7%   -1.31 ±0.08   0.93  -0.38        0  dark 0.56, scorching 0.42, sandstorm -0.89
defiance ["Snake"]                      24.7%   -1.31 ±0.08   0.93  -0.38        0  dark 0.56, scorching 0.42, sandstorm -0.89
dictator                                24.7%   -1.31 ±0.08   0.93  -0.38        0  dark 0.56, scorching 0.42, sandstorm -0.89
fencing                                 24.7%   -1.31 ±0.08   0.93  -0.38        0  dark 0.56, scorching 0.42, sandstorm -0.89
fester                                  24.7%   -1.31 ±0.08   0.93  -0.38        0  dark 0.56, scorching 0.42, sandstorm -0.89
festering                               24.6%   -1.31 ±0.08   0.93  -0.38        0  fog 0.34, scorching 0.29, sandstorm -0.89
fletcher 1                              24.7%   -1.31 ±0.08   0.93  -0.38        0  dark 0.56, scorching 0.42, sandstorm -0.89
growth                                  24.7%   -1.31 ±0.08   0.93  -0.38        0  dark 0.56, scorching 0.42, sandstorm -0.89
heal 2                                  24.7%   -1.31 ±0.08   0.93  -0.38        0  dark 0.56, scorching 0.42, sandstorm -0.89
heavyMetal                              24.7%   -1.31 ±0.08   0.93  -0.38        0  dark 0.56, scorching 0.42, sandstorm -0.89
hiveMind                                24.7%   -1.31 ±0.08   0.93  -0.38        0  dark 0.56, scorching 0.42, sandstorm -0.89
ironWill                                24.7%   -1.31 ±0.08   0.93  -0.38        0  dark 0.56, scorching 0.42, sandstorm -0.89
kingSlayer 4                            24.7%   -1.31 ±0.08   0.93  -0.38        0  dark 0.56, scorching 0.42, sandstorm -0.89
loyal [1,3]                             24.7%   -1.31 ±0.08   0.93  -0.38        0  dark 0.56, scorching 0.42, sandstorm -0.89
magic                                   24.7%   -1.31 ±0.08   0.93  -0.38        0  dark 0.56, scorching 0.42, sandstorm -0.89
natureForce 1                           24.7%   -1.31 ±0.08   0.93  -0.38        0  dark 0.56, scorching 0.42, sandstorm -0.89
nullify                                 24.7%   -1.31 ±0.08   0.93  -0.38        0  dark 0.56, scorching 0.42, sandstorm -0.89
onSpawnDevilry 1                        24.7%   -1.31 ±0.08   0.93  -0.38        0  dark 0.56, scorching 0.42, sandstorm -0.89
pack 2                                  24.7%   -1.31 ±0.08   0.93  -0.38        0  dark 0.56, scorching 0.42, sandstorm -0.89
packLeader                              24.7%   -1.31 ±0.08   0.93  -0.38        0  dark 0.56, scorching 0.42, sandstorm -0.89
prey                                    24.7%   -1.31 ±0.08   0.93  -0.38        0  dark 0.56, scorching 0.42, sandstorm -0.89
primed                                  24.7%   -1.31 ±0.08   0.93  -0.38        0  dark 0.56, scorching 0.42, sandstorm -0.89
reflect                                 24.7%   -1.31 ±0.08   0.93  -0.38        0  dark 0.56, scorching 0.42, sandstorm -0.89
renewal                                 24.7%   -1.31 ±0.08   0.93  -0.38        0  dark 0.56, scorching 0.42, sandstorm -0.89
rupture                                 24.7%   -1.31 ±0.08   0.93  -0.38        0  dark 0.56, scorching 0.42, sandstorm -0.89
shieldCall                              24.7%   -1.31 ±0.08   0.93  -0.38        0  dark 0.56, scorching 0.42, sandstorm -0.89
usurper [3,0]                           24.7%   -1.31 ±0.08   0.93  -0.38        0  dark 0.56, scorching 0.42, sandstorm -0.89
worship                                 24.7%   -1.31 ±0.08   0.93  -0.38        0  dark 0.56, scorching 0.42, sandstorm -0.89
enraged                                 24.7%   -1.31 ±0.08   0.93  -0.38        0  dark 0.56, scorching 0.42, sandstorm -0.89
lantern                                 24.3%   -1.34 ±0.08   0.93  -0.41        0  scorching 0.48, rain -1.17, sandstorm -0.89
fieldBreaker 2                          23.2%   -1.42 ±0.07   0.93  -0.49        0  scorching 0.42, eruption -1.16, wet 0.12
converge "enemy"                        22.7%   -1.46 ±0.07   0.93  -0.53        0  scorching 1.27, fog 0.05, dark -0.01
punish 2                                 1.4%    -5.9 ±0.53   4.93  -0.97        4  rain 1.96, daynight:night -3.07, dark -3.07
sunshy                                  20.8%   -1.61 ±0.07   0.56  -1.05        0  daynight -3.07, arrowSlits -0.08, rain -0.14
bloodlust                               13.9%   -2.16 ±0.06   0.93  -1.23        0  dark -2.22, daynight:night -1.93, eruption -0.55
quick                                    0.8%   -7.18 ±0.39   5.93  -1.25        5  canopy 2.98, firstBlood 1.83, wet 0.76
fastForward 1                            0.4%   -7.9< ±0.14   6.52  -1.38     5.59  scorching 0.32, wet -0.06, sandstorm -0.81
cower "shell"                           17.3%   -1.89 ±0.07   0.43  -1.46     -0.5  rain -0.27, dark -2.55, sandstorm -0.48
nightblind                              52.2%   +0.82 ±0.08  -2.44  -1.62       -3  daynight:night -6.44, daynight -4.58, scorching 0.32
venomMaster 1                            0.3%  -7.94< ±0.08   5.93  -2.01        5  eruption -0.43, scorching -0.47, swampFever -1.32
kingly                                   0.3%  -7.94< ±0.08   5.93  -2.01        5  eruption -0.43, scorching -0.47, swampFever -1.32
evoluteOmega                             0.0%        -8< ±0   5.93  -2.07        5  none -2.07, daynight -2.07, daynight:night -2.07
quarry 2                                 0.1%        -8< ±0   5.93  -2.07        5  scorching -0.47, none -2.07, daynight -2.07
expose 2                                 0.7%   -7.33 ±0.37   5.13   -2.2      4.2  rain 1.3, highTide 1.3, dark 0.6
rainmaker 3                              7.6%   -3.32 ±0.12   0.93  -2.39        0  scorching -5.27, rain -0.47, fog -4.24
wilting 1                                2.4%   -4.67 ±0.33   1.93  -2.74        1  firstBlood -6.07, none -4.41, highTide -1.17
immolation 1                             0.5%   -7.74 ±0.25   4.93  -2.81        4  scorching 0.38, fog -0.24, wind -0.75
evoluteAlpha                             0.0%        -8< ±0   4.93  -3.07        4  none -3.07, daynight -3.07, daynight:night -3.07
injured 2                               13.8%   -2.17 ±0.06  -1.07  -3.24       -2  firstBlood -4.23, scorching -2.35, rain -4.04
bloodTithe 2                            17.2%    -1.9 ±0.07  -1.47  -3.37     -2.4  rain -5.3, firstBlood -5.1, eruption -2.13
molting 1                                0.5%   -7.64 ±0.29   3.93  -3.71        3  scorching -1.07, dark -1.91, eruption -2.43
penance 3                                4.3%   -3.99 ±0.09   0.18  -3.81    -0.75  firstBlood -7.82, wind -5.5, highTide -2.19
feeble                                  29.0%   -0.96 ±0.08  -3.07  -4.03       -4  rain -6.9, scorching -1.49, canopy -5.01
evolute                                  0.0%        -8< ±0   3.93  -4.07        3  none -4.07, daynight -4.07, daynight:night -4.07
drunk                                   14.5%   -2.11 ±0.06  -2.07  -4.18       -3  eruption -3.17, dark -5.05, fog -4.96
harvest                                  1.1%   -6.41 ±0.48   1.93  -4.48        1  scorching -1.27, rain -1.9, arrowSlits -2.21
recoil 2                                 0.3%  -7.92< ±0.11   2.93  -4.99        2  eruption -1.81, scorching -3.37, canopy -3.48
counterattack                            0.2%        -8< ±0   2.93  -5.07        2  scorching -3.27, canopy -3.48, swampFever -4.32
scatterbrained                          26.6%   -1.16 ±0.08  -5.07  -6.23       -6  scorching -4.5, rain -4.6, eruption -5.34
reload 1                                 5.6%    -3.73 ±0.1  -3.07   -6.8       -4  scorching -4.15, arrowSlits -4.91, eruption -5.05
irradiated 2                             2.6%   -4.47 ±0.27  -3.07  -7.54       -4  rain -11.07, fog -11.07, sandstorm -10.4
friction 2                               0.7%   -7.23 ±0.39  -1.07   -8.3       -2  scorching -4.49, wet -5.37, eruption -6.62
isolation                                0.5%   -7.69 ±0.27  -2.07  -9.76       -3  firstBlood -6.17, daynight:night -7.57, dark -8.17
chained {"breakOn":"damage","amount"     0.5%   -7.79 ±0.23  -2.07  -9.86       -3  scorching -6.85, wind -7.75, eruption -8.43
purblind                                 2.6%   -4.42 ±0.26  -7.04 -11.46        0  none -15.04, rain -15.04, wet -15.04
fragile                                  1.9%   -5.12 ±0.31  -7.04 -12.16        0  daynight:night -15.04, rain -15.04, wind -15.04
ritual {"perished":6,"drawn":6,"cast     0.4%  -7.84< ±0.21 -17.37 -25.21       -9  scorching -22.15, eruption -22.92, swampFever -23.07
enabler {"poison":2}                     5.3%     -3.8 ±0.1   5.93   2.13        5  rain 6.16, arrowSlits -0.74, eruption -0.43
enabler {"prayer":1}                    22.0%   -1.52 ±0.07   1.83   0.31      0.9  fog 2.2, rain 1.83, dark -0.56
enabler {"shatter":2}                   24.8%    -1.3 ±0.08   0.93  -0.37        0  dark 0.56, scorching 0.42, sandstorm -0.89

net: the deck's gain over the vanilla deck in stat points (2A + H) after the budget took the skill's price off its stats; + = worth more than the price.
paid: the stat points a unit gave up for it; worth = net + paid. --multi rows are marginal (with minus without the skill, same companions). S table: the price in canonical/skill-costs.json.
642000 games, 3897 s, 2 jobs (6.07 ms a game)
```
