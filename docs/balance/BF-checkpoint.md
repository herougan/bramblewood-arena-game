# Package BF checkpoint (2026-10-19)

Owner directions 09:52: (1) budget N formula (Base-1+L)(1+L/20); (2) Forge level curve from N(L), majors 4/7/10, minor 2;
(3) Forge stays at Map 11 (decision); (4) side maps at least one map ahead; (5) re-measure level / road curves, retune.

## Done
- 0. baseline: docs/balance/skirmish-pass-bf-before.jsonl (271 fights, 120 games, pre-BF code at 5ec913a)
- 1. bramblewood-budget.js (N v4 + forge curve), skill_costs.js, Test Lab, hub, assemble, tests; queue refreshed (28);
  docs/balance/budget-v4-2026-10-19.json (`node tools/forge_curve_2026_10_19.js budget`)
- 2. statsAtLevel via forgeCurveOf; LEVEL_STAT_STEPS all levels; FORGE_MEAN_GAIN; enemy keeps pace deck by deck
  (enemyLevelKeepingPace, (A+1)xH metric, old whole-level semantics); Forge anvil strip; tests/forge-curve-2026-10-19.js
- 3. decision B7, decisions.md regenerated
- 4. side maps (sideMapAhead / fightMapNumber, side curve targets); tests/side-maps-2026-10-19.js
- merged main (RC, EE, UT) at the WIP; unit_themes regenerated
- 5. measures bf-mid (mean-gain pace), bf-mid2 (sum 2A+H), bf-mid3 (final pace, after merge); curve tune -> bf-curve-fixes.jsonl
  (54 fights; 20-A-4 not applied; 16-6 retuned with --shieldx=2); applied

- 5 (cont). round 2 (bf-curve-fixes-2), round 3 on measure seeds (bf-curve-fixes-3); final bf-after 178/179 main, 76/77 side; bf-fresh 154/179;
  yardsticks bf-abs + level-curve-fit-bf.json (0.266 DR a map, r2 0.87)
- docs/balance/level-curve-2026-10-19b.md, CHANGELOG; merged main twice; tests forge-curve, side-maps, level-curve, game-texts pass

- BF2 (13:52-14:25): budget v5 (Base + L/5)(1 + L/30), L0 Base - 1; divisor check (L/5), squared terms check (no change);
  budget panel through TX with Base; decision B8; road retune on v5 + BU (bf2-curve-fixes; bf-after 178/179, 76/77; fresh 151/179);
  docs/balance/level-curve-2026-10-19c.md; SW positionBeam reason; stale lang/ui rows (RB, U3) out

- BF2 map term (15:25): committed (WIP 'Base's map term'), canonical/card-obtain-maps.json, B9 + docs/balance/limit-break-waves.md
- BF3 A (15:48): levelLinDiv 10 committed
- BF3 C: full card retune applied (tools/card_retune_2026_10_19.js; 418 cards; Caldera Wyrm owner call); golden card matrix updated;
  card-pass / d tests accept the retune; Pale Desert invariants restored (rule bramble, one Queen), tuner guarded

## Next
- D: bf4-mid measure (running) -> curve tune (bf4-curve-fixes) -> apply -> bf-after + bf-fresh; pale-desert --measure; docs; CHANGELOG; commit "Package BF3"
