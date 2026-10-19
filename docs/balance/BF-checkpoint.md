# Package BF checkpoint (2026-10-19)

Owner directions 09:52: (1) budget N formula (Base-1+L)(1+L/20); (2) Forge level curve from N(L), majors 4/7/10, minor 2;
(3) Forge stays at Map 11 (decision); (4) side maps at least one map ahead; (5) re-measure level / road curves, retune.

## Done
- 0. baseline measure: docs/balance/skirmish-pass-bf-before.jsonl (271 fights, 120 games, old code)
- 1. bramblewood-budget.js (N v4, forge curve); tools/skill_costs.js, Test Lab (sbBudgetAt), hub inline, assemble, tests
  (decisions-2026-10-18, skill-costs-2026-10-19, d-2026-10-19), post-balance queue refreshed (28), docs/balance/budget-v4-2026-10-19.json
  via `node tools/forge_curve_2026_10_19.js budget` (L1: 2 in, 1 out)
- 2. statsAtLevel / curveStatsAtLevel use forgeCurveOf; LEVEL_STAT_STEPS all levels; FORGE_MEAN_GAIN / levelForGain; enemyKeepsPace
  (forgeGainShift); Forge anvil strip (forgeCurveStripHTML, TX keys, tools/i18n_2026_10_19_bf.py); tests/forge-curve-2026-10-19.js passes
- 3. decision B7 in docs/decisions.json, decisions.md regenerated
- 4. sideMapAhead / fightMapNumber (enemy level + Shield), side road-curve targets shifted 0.19 logit a map (roadCurveTarget)

## Next
- 5. measure bf-mid (running), tune off-curve fights (`skirmish_pass.js curve --from=bf-mid --fixes=bf-curve-fixes`), apply, measure bf-after
- tests/side-maps-2026-10-19.js; update tests/level-curve-2026-10-19.js (levelForGain values, bands file); run-all.sh
- docs/balance/level-curve-2026-10-19b.md, CHANGELOG top section, merge main, final commit "Package BF: ..."
