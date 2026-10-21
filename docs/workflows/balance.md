# Workflow: balance analysis and simulations

For the budget formula, card retunes, the road and difficulty curves, raid tuning and win-rate measurement. The owner wants the strongest model for balance work.

## Files you need
- `bramblewood-budget.js`: N(L) and the stat checks. It is the source of truth for the formula.
- `bramblewood-engine.js`: simulations run the real engine headless through `tests/lib/harness.js`.
- Tools:
  - `tools/card_balance.js` and `tools/card_balance_report.py`: win rate per card.
  - `tools/difficulty_curve.js`, `tools/curve_tune.js` and `tools/autotune_map.js`: the road and difficulty curves.
  - `tools/forge_curve_2026_10_19.js`: Forge costs and map placement.
  - `tools/cpu_levels.js`.
- Data and outputs: `docs/balance/*.json` (difficulty curve, post-balance queue, checkpoints). The owner's live tweaks are in the hub's Budget & stats tab (db `budgetEdits`, `cardEdits`, `monsterEdits`); fold them with `tools/hub/apply_balance_edits.js`.

## How to work
- Measure, then change. Simulations are expensive. Run them on the smallest card set that answers the question, save the raw results to `docs/balance/`, and reuse them while the engine and cards haven't changed.
- Run simulations alone on the machine (2 cores). Never run them alongside other agents' builds or test suites.
- Every number in a report comes from a run in this session or a saved result file named in the report.
- Changes to card stats follow `card-data.md`. Changes to the formula update `bramblewood-budget.js` and its test (`tests/level-curve-2026-10-19.js`, `tests/forge-curve-2026-10-19.js`).

## Measuring a skill's worth: the standard test (owner, 2026-10-21 16:33)
Use this setup for any new skill-worth measurement. It is fast and every result is comparable.
- **Test side:** a deck of 3/10 units. Each unit has either:
  - one random skill;
  - the skill being measured at different values;
  - no skill (the vanilla control).
- **Standard enemy:** a deck of 4/11 units with no abilities. Each turn, the enemy bramble gives one random creature of theirs +1/+0 or +0/+1.
- **Brambles:** both have 35 Health and no abilities.
- **Mono-test:** every test card has exactly 1 skill. **Duo-test:** every test card has exactly 2 skills, which measures how pairs of skills work together.
- **Runs:** 10,000 fights per setup. A skill's worth is its win-rate gain over the vanilla 3/10 deck against the same standard enemy, converted to budget points the way tools/skill_worth.js converts its deltas.
- Fixed-number skills (damage, heals, armor, +N stats) are priced by the amount they deal. Relative skills (that multiply or copy the unit's own stats, speed or odds) scale with stats. When stats change scale, re-measure the relative ones first.

## Checks
`node tests/run.js --only 'level-curve|forge-curve|card-pass|raid-rb|raid-br|card-pool'`, then the card matrix. Reviewed golden changes are accepted at release.

## Done when
There is a short report: what moved, by how much, and why, with the data file named. Owner calls go to `docs/decisions.json`. Only the result doc goes to the Project, not the working notes.
