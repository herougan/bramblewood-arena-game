# Package RP checkpoint (rewards and sources pass, 2026-10-21)

Scope: card SOURCE / placement / reward fields only (never attack, health or effects; BF5 re-derives stats in parallel).

## Done
- [x] Audit: every card in one category, no overlaps (`node tools/rewards_pass_2026_10_21.js audit`).
- [x] Faction reward track: `FACTION_REWARD_TRACK` region in arena_app.js (gates 25 / 40 & Map 14 / 50 & Map 25 ...; lowest first; plain first on
      Maps 0-1; hand-outs: 0-2 pack, map milestones, every 8th first clear, ambush, 8 achievements). Sim: `tools/faction_track_sim_2026_10_21.js`.
- [x] 158 source moves: plan `docs/balance/rewards-pass-2026-10-21.json` (made from the pre-pass sources, idempotent), applied by
      `tools/rewards_pass_apply_2026_10_21.py` (format byte-identical); `canonical/card-obtain-maps.json` regenerated.
- [x] Maps 0-1 plain, Map 1 Lumber (Badger Lumberjack 1-4); teaching extra cards off on Maps 0-1.
- [x] Devilry / Ecclesia held (31); side maps one unique + gates (10 re-gated, shieldMap = gate).
- [x] Tests: tests/rewards-pass-2026-10-21.js (161 checks); card-pass, card-pool, thematic, pale-desert, maps-2026-10-18 follow the moves.
- [x] Docs: docs/balance/rewards-pass-2026-10-21.md, docs/map-recommendations-2026-10-21.md, decisions (rules entry + RP1-RP6), CHANGELOG.
- [x] Merged main (SK2b etc.), rebuilt.

## Notes for the merge with BF5
- 71 cards changed obtain map and 52 are held (record: obtainBefore / obtainAfter): re-run BF5's derivation on them after merging.
- If BF5 regenerates card-obtain-maps.json, run `node tools/forge_curve_2026_10_19.js maps` after the merge.
- Re-running `node tools/rewards_pass_2026_10_21.js plan && python3 tools/rewards_pass_apply_2026_10_21.py` is safe (no-op when applied).
