# Robust skill test (mono + multi), 2026-10-23

Made by `tools/skill_test_robust.js`; the data is `en3-skill-test-2026-10-23.json`. 3000 games a setup, 600 a curve point, seed 1.

Units: the live band cards' rarity / Wait / Lumber mix, stats from the budget at Level 1 (the skill priced in). Fields: Day/Night and Tide 20% each, each uncommon field 2%, each rare one 0.2%, and 20% of fights get one more non-common field.

```
vanilla vs the standard enemy: 42.6% (3000 games); mean vanilla unit 2.85/13.78 (19.52 stat points)

setup                                win rate  net (±)   paid  worth  S table   field: worth
guardian                                34.9%   -0.54 ±0.06   1.99   1.45     1.06  rain 2.58, wet 2.15, swampFever 0.8
brambleArmor                            24.5%   -1.28 ±0.06   2.43   1.15      1.5  rain 3.27, sandstorm 2.43, wind -0.13
rampart                                  9.4%   -2.49 ±0.13   2.93   0.44        2  rain 2.53, wind -0.71, daynight:night -0.55
guardian + companions                   28.7%   -0.55 ±0.06   1.74   1.19     1.06  fog -0.3, sandstorm -0.02, rain 0.15
brambleArmor + companions               20.6%   -1.12 ±0.05   2.18   1.06      1.5  rain 2.77, daynight:night -0.26, wet 1.75
rampart + companions                     6.9%    -2.8 ±0.11   2.67  -0.13        2  wind -2.35, eruption 1.07, scorching -1.22

net: the deck's gain over the vanilla deck in stat points (2A + H) after the budget took the skill's price off its stats; + = worth more than the price.
paid: the stat points a unit gave up for it; worth = net + paid. --multi rows are marginal (with minus without the skill, same companions). S table: the price in canonical/skill-costs.json.
43800 games, 337 s, 2 jobs (7.7 ms a game)
```
