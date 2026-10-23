# Robust skill test (mono), 2026-10-23

Made by `tools/skill_test_robust.js`; the data is `en5-breach-states-2026-10-24.json`. 3000 games a setup, seed 1.

Units: the live band cards' rarity / Wait / Lumber mix, stats from the budget at Level 1 (the skill priced in). Fields: Day/Night and Tide 20% each, each uncommon field 2%, each rare one 0.2%, and 20% of fights get one more non-common field.

```
vanilla vs the standard enemy: 42.6% (3000 games); mean vanilla unit 2.85/13.78 (19.52 stat points)

setup                                win rate  net (±)   paid  worth  S table   field: worth
breach 2                                53.7%   +0.83 ±0.07   2.93   3.76        2  rain 10.03, scorching 1.85, swampFever 2.05
puncture 2                              61.4%    +1.4 ±0.07   2.33   3.73      1.4  rain 11.94, scorching 1.81, sandstorm 5.15
puncture 1                              45.6%   +0.23 ±0.07   1.63   1.86      0.7  rain 5.56, swampFever 0.99, scorching 1
breach 1                                41.1%   -0.11 ±0.07   1.93   1.82        1  rain 4.96, fog 3.05, swampFever 0.7
lastStand                               24.7%   -1.31 ±0.06   1.93   0.62        1  rain 2.09, sandstorm 1.53, wet 1.23
timbered                                21.4%   -1.55 ±0.05   1.93   0.38        1  rain 1.93, sandstorm 1.27, highTide -0.17

net: the deck's gain over the vanilla deck in stat points (2A + H) after the budget took the skill's price off its stats; + = worth more than the price.
paid: the stat points a unit gave up for it; worth = net + paid. --multi rows are marginal (with minus without the skill, same companions). S table: the price in canonical/skill-costs.json.
90000 games, 388 s, 2 jobs (4.31 ms a game)
```

## Reading (package EN5, 2026-10-24)

- Same trial table as `en5-bleed-poison-2026-10-24.md` (units priced off the floor), `--mono`, 3000 games a setup.
- Breach 1 / 2: worth 1.82 / 3.76; Puncture 1 / 2 (the same rule): 1.86 / 3.73. Priced Breach 1.9 a point (the owner's estimate). Puncture,
  priced 0.7 / 1.4, is under-priced by the same reading (call EN5-2).
- Plain Last Stand (+1/+1 at a third of the bramble): 0.62; plain Timbered (+0/+2 at 3+ Lumber): 0.38 (the CPU spends its Lumber). Priced
  0.6 and 0.5 (bramblewood-budget.js EN5_UPTIME; call EN5-4).
