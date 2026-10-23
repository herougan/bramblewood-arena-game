# Robust skill test (mono + multi), 2026-10-23

Made by `tools/skill_test_robust.js`; the data is `en5-bleed-poison-2026-10-24.json`. 3000 games a setup, seed 1.

Units: the live band cards' rarity / Wait / Lumber mix, stats from the budget at Level 1 (the skill priced in). Fields: Day/Night and Tide 20% each, each uncommon field 2%, each rare one 0.2%, and 20% of fights get one more non-common field.

```
vanilla vs the standard enemy: 42.6% (3000 games); mean vanilla unit 2.85/13.78 (19.52 stat points)

setup                                win rate  net (±)   paid  worth  S table   field: worth
bleed 3                                 83.0%    +3.45 ±0.1   3.93   7.38        3  rain 18.88, scorching 3.65, eruption 5.54
bleed 4                                 70.5%   +2.13 ±0.07   4.93   7.06        4  rain 18.97, scorching 4.07, swampFever 4.9
poison 3                                76.6%   +2.76 ±0.08   3.93   6.69        3  rain 17.97, scorching 3.18, swampFever 4.51
bleed 2                                 84.6%   +3.74 ±0.14   2.93   6.67        2  rain 14.5, scorching 4.19, swampFever 4.42
poison 4                                60.6%   +1.34 ±0.07   4.93   6.27        4  rain 15.85, scorching 3.52, swampFever 4.14
poison 2                                80.5%   +3.18 ±0.08   2.93   6.11        2  rain 13.2, scorching 2.93, fog 7.89
bleed 1                                 66.5%   +1.81 ±0.07   1.93   3.74        1  rain 6.22, scorching 1.85, swampFever 1.9
poison 1                                58.1%   +1.16 ±0.07   1.93   3.09        1  rain 4.84, scorching 1.63, wind 2.29
bleed 3 + companions                    74.4%   +2.94 ±0.09   3.66    6.6        3  rain 15.88, scorching 3.66, swampFever 4.39
bleed 4 + companions                    59.2%   +1.65 ±0.07   4.64   6.29        4  rain 14.91, scorching 3.73, swampFever 4.4
bleed 2 + companions                    79.7%    +3.5 ±0.08   2.67   6.17        2  rain 14.89, scorching 3.25, fog 7.91
poison 3 + companions                   67.1%   +2.27 ±0.07   3.65   5.92        3  rain 14.44, scorching 3.13, daynight:night 7.46
poison 2 + companions                   75.0%   +2.99 ±0.09   2.67   5.66        2  rain 12.16, scorching 2.87, eruption 4.24
poison 4 + companions                   47.7%   +0.79 ±0.07   4.64   5.43        4  rain 13.6, scorching 3.54, swampFever 3.97
bleed 1 + companions                    61.4%   +1.82 ±0.07   1.69   3.51        1  rain 5.84, scorching 1.91, swampFever 2.16
poison 1 + companions                   52.9%   +1.18 ±0.07   1.69   2.87        1  rain 5.05, scorching 1.78, sandstorm 3.62

net: the deck's gain over the vanilla deck in stat points (2A + H) after the budget took the skill's price off its stats; + = worth more than the price.
paid: the stat points a unit gave up for it; worth = net + paid. --multi rows are marginal (with minus without the skill, same companions). S table: the price in canonical/skill-costs.json.
144000 games, 794 s, 2 jobs (5.52 ms a game)
```

## Reading (package EN5, 2026-10-24)

- Run: `node tools/skill_test_robust.js --mono --multi --games 3000 --jobs 2 --skills bleed=1/2/3/4,poison=1/2/3/4 --table <trial>`, where the
  trial table is canonical/skill-costs.json with Bleed and Poison at 1 a point (`--table`, new in EN5), so the test decks are not priced into
  the floor. EN4's reading of "about 2" for Bleed 2 / Poison 2 came from decks priced at 5.2 that won 3% of their games, where the curves
  cannot tell skills apart.
- Worth with companions (the marginal rows, closest to real decks) at N 1 / 2 / 3 / 4: Bleed 3.51 / 6.17 / 6.60 / 6.29, Poison 2.87 / 5.66 /
  5.92 / 5.43. Total worth rises to N 3 and flattens: each extra point is worth less (a 4/11 standard enemy dies before a big stack runs out).
- Priced (owner BP-1, "bigger numbers make them stronger"): a power curve through N 1-3, S(N) = 3.6 x N^0.6 (Bleed) and 3.0 x N^0.7
  (Poison): 3.6 / 5.46 / 6.96 and 3.0 / 4.87 / 6.47 (were 2.6 a point). Call EN5-5.
