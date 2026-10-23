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
- **Robust mode** (package ST, owner 2026-10-22 18:20: "lumber, wait, multi-skill ... Field effects of various types"): `tools/skill_test_robust.js --mono|--duo|--multi`. Each unit of both decks draws a rarity / Wait 0-3 / Lumber 0-3 profile from the live band cards and gets its stats from the budget (Level 1, the skill's S priced in; the enemy 0.8x a vanilla unit's points, `--foe-ratio`, since at the owner's 19/16 the vanilla deck never wins). Each fight rolls its field from `FIELD_CONFIG` at the top of the tool: Day/Night and Tide 20% each, each uncommon field 2%, each rare one 0.2%, and 20% of fights get one more non-common field (classes from `--census`, `docs/balance/field-census-2026-10-22.json`). `--multi`: each unit carries the skill and 0-2 live companions, read as the marginal worth (with minus without). The report gives per skill its net (+ = under-priced), the stat points paid, the worth, and the worth per field condition. `--seed`, `--games` (10,000), `--jobs 2`, `--skills`, `--quick` (smoke). Output: `docs/balance/skill-test-robust-<modes>-<date>.json` + `.md`. The full sweep takes most of a day on 2 cores; run it alone.
- Fixed-number skills (damage, heals, armor, +N stats) are priced by the amount they deal. Relative skills (that multiply or copy the unit's own stats, speed or odds) scale with stats. When stats change scale, re-measure the relative ones first.

<<<<<<< HEAD
## Pricing by logic: the owner's 4-round rule (owner, 2026-10-23 20:44)
"balancing - just logic is sufficient. To me, in my head, i compare to the effect of 1 attack or health across 4 rounds to estimate. On play arrow is equivalent to only N damage across 4 rounds but it has the advantage of on play!"
- Yardstick: +1 Attack or +1 Health held over a typical 4-round life. Price a skill by what it does over those 4 rounds in that currency, then adjust for timing (on play, first strike, Wait) and reliability (conditions, odds).
- Example: On Play Arrow N deals N once, so it is worth less than +N Attack over 4 rounds, plus a premium for landing at once.
- Measurement (the robust skill test) is optional: use it when cheap; otherwise price by this logic and say so in the cost entry's note.
=======
## Deck optimizer (package OPT, owner 2026-10-23 20:44)
The strongest deck per map, for building skirmishes of rising difficulty, with no Claude tokens: `tools/opt/deckopt.js`.
- Run: `node tools/opt/deckopt.js --map 3 --minutes 20 --workers 2` (or `--maps 0-3`; `--help` lists every option). Output: `docs/balance/opt/deckopt-map<NN>-<id>-<date>.json` and `deckopt-summary-<date>.md`.
- Phase 1 searches the map's own cards (`canonical/map-pools.json` MAP + submap tiers, not SPECIAL) plus what a player owns by then (the HUB3 plan's advancement). Phase 2 screens every other obtainable card as a swap into that deck, then searches the whole list. `--cross-share` (default 0.3) is phase 2's share of the search time (owner call OPT-1).
- The gauntlet: each fight deck and the reference decks in a fair mirror under that fight's field (your level and bramble on both sides, CPU skill 1, seats swapped), plus the fights as the game builds them (`--road-weight` 0.25). "Points below the optimum": the optimum's head-to-head score against each fight's deck as Elo, and each fight deck's own score as your deck.
- Deterministic: `--gens1 / --gens2 / --final-games / --screen-max` (the output's `reproduce` line) give the same result on any machine and any worker count. Checkpoints after every generation; `--resume`.
- Without Claude: `bash tools/opt/build-exe.sh` builds one executable (Node SEA) that runs from a game checkout; `.github/workflows/deckopt.yml` runs it on GitHub's free runners by hand (Actions → Deck optimizer → Run workflow) and uploads the results as an artifact.
- Like every sim, run it alone on the machine; its games/s fall when other agents' builds or browser tests share the 2 cores.
>>>>>>> worktree-agent-a027551f913388ec0

## Checks
`node tests/run.js --only 'level-curve|forge-curve|card-pass|raid-rb|raid-br|card-pool'`, then the card matrix. Reviewed golden changes are accepted at release.

## Done when
There is a short report: what moved, by how much, and why, with the data file named. Owner calls go to `docs/decisions.json`. Only the result doc goes to the Project, not the working notes.
