# Robust skill test (mono + multi), 2026-10-23

Made by `tools/skill_test_robust.js`; the data is `en4-skill-test-2026-10-23.json`. 3000 games a setup, seed 1.

Units: the live band cards' rarity / Wait / Lumber mix, stats from the budget at Level 1 (the skill priced in). Fields: Day/Night and Tide 20% each, each uncommon field 2%, each rare one 0.2%, and 20% of fights get one more non-common field.

```
vanilla vs the standard enemy: 42.6% (3000 games); mean vanilla unit 2.85/13.78 (19.52 stat points)

setup                                win rate  net (±)   paid  worth  S table   field: worth
shoreUp                                 45.9%   +0.25 ±0.07   2.43   2.68      1.5  rain 5.57, sandstorm 3.77, arrowSlits 1.6
greaterPoison                            0.0%  -3.77< ±0.03   2.99  -0.78        3  rain -5.83, daynight:night 2.99, scorching 2.99
hemorrhage                               0.1%  -3.91< ±0.05      2  -1.91        2  rain -7.15, daynight:night 2, scorching 2
enabler {"bleed":2}                      3.6%      -4 ±0.07   6.13   2.13      5.2  rain 7.28, daynight:night -1.87, scorching -1.87
enabler {"poison":2}                     2.7%    -4.2 ±0.06   6.13   1.93      5.2  rain 6.95, daynight:night -1.87, scorching -1.87
shoreUp + companions                    38.9%   +0.08 ±0.07   2.18   2.26      1.5  rain 4.6, arrowSlits 1.44, sandstorm 3.02
greaterPoison + companions               0.1%  -7.59< ±0.04   8.68   1.09     8.18  daynight:night 1.86, rain 0.52, sandstorm 0.58
hemorrhage + companions                  0.1%  -7.46< ±0.06   7.74   0.28     7.19  wind -0.47, sandstorm -0.47, rain -0.42

net: the deck's gain over the vanilla deck in stat points (2A + H) after the budget took the skill's price off its stats; + = worth more than the price.
paid: the stat points a unit gave up for it; worth = net + paid. --multi rows are marginal (with minus without the skill, same companions). S table: the price in canonical/skill-costs.json.
105000 games, 1295 s, 2 jobs (12.34 ms a game)
```

## Reading (package EN4, 2026-10-23)

- **Shore Up** measures 2.68 alone and 2.26 with companions (±0.07), against the 4-round estimate of 1.5-2 (a front unit survives 2-3 hits,
  about 1.5 neighbours, about half of each Shield soaks). Priced **2.2**, the marginal reading with companions (closest to real decks).
- **Hemorrhage** and **Greater Poison** can't be read here: they need a stack to work on, so they are tested with their enabler (Bleed 2,
  Poison 2), and a unit priced with Bleed 2 or Poison 2 at the S table (5.2) loses nearly every game in this harness (enabler rows: 3.6% and
  2.7%, worth about 2). The payoff rows are censored at the floor (`<`): their worth (-1.91, -0.78 alone; 0.28, 1.09 marginal) is a floor,
  not a price. They keep their 4-round prices: **Hemorrhage 2** (about +1 Bleed a hit on a target already bleeding, nothing without Bleed
  around) and **Greater Poison 3** (beside Poison 2, about 9 more damage over 4 rounds if the target lives, about 3 at a usual 2/3).
- Side finding for the owner: in this harness Bleed 2 and Poison 2 are worth about 2 stat points against their 5.2 price (EN3 raised them a
  tenth). This is the robust test's economy (budget-priced units against the standard enemy), not a re-measure of the keyword; listed, not acted on.
- Later the same night (owner 23:45, "Greater Poison tokens are not removed on every poison tick"): Greater Poison deals 1 a stack and never
  wears down; by the same logic it is re-priced **2.5** (beside Poison 2: 3+5+7 = 15 against 9 in 4 rounds, about 6 more damage). Not re-measured
  (the harness can't read it, above). **Pulse** (Venom Pulse renamed; Poison and Bleed tick): the action 1.3 a tick, Pulse 1 = 2.7, by logic.
