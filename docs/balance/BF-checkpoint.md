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

- BF3 owner 16:22: inclusive rules (committed); B10 printed = obtained (committed); Thorns re-measured 3.23 (applied);
  retune re-run (412 cards; Wyrm kept); FORGE_MEAN_GAIN re-derived; step C committed f53eebb; merged main RB2 (44d83d2), unit-themes
  test checks each raid part's elder against the game's own pick (tail = Orca Warlord after the retune)
- D (honest levers): owner's enemy schedule (Lv1 Maps 1-4, 1->2 Maps 5-9, 2 + 0.2/map from 10), Very Rare from Map 10, tuner --decks-only;
  bf4-curve-fixes (with shields) set aside unapplied (scratchpad/bf4-curve-fixes.unapplied.jsonl)
- Shield overrides above the rule: 26 fights (19 below, 171 hqHp); scratchpad/count_ov.js; measure --drop-above-rule added

- D round 1: bf5-mid 50/179 main, 26/92 side -> bf5-curve-fixes (decks only, 172 applied, 11 not: no gain / 20-A-4) -> bf5-mid2 128/179, 58/92 (commit 4ea476a)
- known failures from main, not BF: d test galactic-condor 27-word line (EE), pale-desert 7. mpd ambient arrive:[] 

- D rounds 2-4 (round 4: the gap fights at 120 games, 41 applied); final bf-after main 150/179, side 63/77; fresh 131/179;
  gaps 43 (20 easy = cheat field, 23 hard) in docs/balance/road-gaps-2026-10-19.json; Shield overrides above the rule 26, on the rule main 147;
  tests read the gaps; docs + CHANGELOG; merged main (HB); Package BF3 committed

- BF4 (coordinator 19:34 relay of owner): 72 live card overrides folded (tools/fold_server_overrides_2026_10_19.js; dump in
  docs/balance/server-overrides/), retuned (1 owner call: cave-bat-swarm), Map 0 / tutorial node edits folded (bee-knight-classic -> bee-knight),
  road re-checked 150 -> 146 main, gaps 47; SQL proposed (not applied); doc docs/balance/server-overrides-fold-2026-10-19.md

- BF4 committed a22857e (merged to main; live overrides cleared 20:45)
- BF5 (owner 21:36 "HALF everything" = the total N): A. scale 0.5 in bramblewood-budget.js (nAt), skill-costs.json budget,
  Test Lab sbScale, hub Budget & stats 'scale', ui.budget-scale (+12 packs, tools/i18n_2026_10_19_bf5.py); B. Bounty 0.5 -> 1

- BF5 C (ad55224): tools/halve_2026_10_19.js applied (708 live: 678 band, 29 owner calls halved in proportion, Cave Bat 1/2; 31 proportion)
- BF5 D (305d2c6): BRAMBLE_SCALE 0.5 (arena_app brambleHp/brambleChar/raidDefScaled at every fight builder); probe JSON
- tests updated (a77be17); reference decks rebuilt (decks --keep); bf6-mid2: 28/179 green (141 easy)
- E round 1: tune4.sh 30 bf6-mid2t bf6-curve-fixes "--decks-only --wide" (bf6-mid2t = bf6-mid2 without Map 0's owner decks)

- BF5 10-21 rulings: fold of the owner's later edits (d491a05; SQL 20261021_clear_folded_overrides_2.sql proposed, not applied);
  N multipliers plain 1.05 / light 1.02 / Fragile 0.75, Vulnerable -1.5 (c7612cc); two skills at most, 99 cut, ants (16ed1e9);
  re-derive from halve-ref-2026-10-21.json (d51977e); huntsman Poison+Pounce, Moon Jelly Tide+Moonpull (c7922a7);
  Easter eggs in the band, Terraumbra measured with its grant 3/3 -> 1/1 (53c65cf); plan 719 rows: 702 band, 17 owner, 24 prop
- owner-edits evaluation: docs/balance/owner-edits-bf5-2026-10-21.json (6 of 13 over v5 at the owner's stats); halve doc sections
  (10-21 rulings, owner edits, two-skill list, limit-break note, Map x 0.2 kept)
- reference decks rebuilt (0344198); merged main SK2b / MX / U4 (a05c3bf: raid Shield at BRAMBLE_SCALE, 2 new cards re-derived)
- raid re-measured: docs/balance/raid-balance-bf5-fights.json, completion 100% 30+ (day 6.54), breaks ~50%; 410 probe; halve-raid json
- decisions B11 / B12 / B13; tests/bf5-2026-10-21.js (34 checks)
- road: bf7-mid 15/179 green (159 easy) -> bf7-curve-fixes (189 applied) -> bf-after 49/179, side 15/77 (BF4 finals moved to *-bf4.jsonl);
  round 2 running: tune4.sh 60 bf8-midt bf8-curve-fixes (196 off-target fights)

- merged main again (f75567e: TT, BX, RP...): cards merged field by field; archerStyle a parameter; 122 cards whose N moved re-derived (9 changed);
  road round 3 on the too-hard fights (bf9-curve-fixes, 16 applied); final bf-after 60/179 main, side 27/77, fresh 58/179; gaps 169 (160 easy, 9 hard);
  raid re-measured (day 6.53, breaks ~50%); tests patched for the halved tokens / stats and the two-skill cuts (shield-call, keywords-*, equipment-hazards,
  raid-fixes, skills-sk1 Soldier Ant exception, skill-combos estimates); main-side: skill-worth (SK3/BX entries unplanned), shields tooltip

## Next (done when the package commit lands)
- mark_apply (apply:false for 0-1..0-4), apply, measure bf6-mid3, round 2 at 60, final bf-after / bf-fresh, road_gaps, tests floors
- raid: raid_completion_model measure --n 20 --out docs/balance/raid-balance-bf5-fights.json, cycle; doc halve-raid json
- docs (halve doc doc cmd), CHANGELOG, merge main, tests, commit "Package BF5: ..."
