# Robust skill test (mono), 2026-10-24

Made by `tools/skill_test_robust.js`; the data is `skill-test-robust-bounty-2026-10-24.json`. 10000 games a setup, 2000 a curve point, seed 1.

Units: the live band cards' rarity / Wait / Lumber mix, stats from the budget at Level 1 (the skill priced in). Fields: Day/Night and Tide 20% each, each uncommon field 2%, each rare one 0.2%, and 20% of fights get one more non-common field.

```
vanilla vs the standard enemy: 40.5% (10000 games); mean vanilla unit 2.85/13.78 (19.51 stat points)

setup                                win rate  net (±)   paid  worth  S table   field: worth
bounty 1                                33.1%   -0.58 ±0.04   3.93   3.35        3  rain 7.24, sporeCloud 6.16, consternation 5.84
bounty 2                                 2.0%   -4.45 ±0.15   6.93   2.48        6  sulphurFumes -2.07, quietContemplation -1.63, daynight:night -1.07
bounty 3                                 0.0%  -7.97< ±0.02   9.88   1.91        9  rain 5.54, slippery 4.46, doubleTime 4.22

net: the deck's gain over the vanilla deck in stat points (2A + H) after the budget took the skill's price off its stats; + = worth more than the price.
paid: the stat points a unit gave up for it; worth = net + paid. --multi rows are marginal (with minus without the skill, same companions). S table: the price in canonical/skill-costs.json.
86000 games, 797 s, 2 jobs (9.26 ms a game)
```
