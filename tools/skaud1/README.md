# SKAUD1 skill audit (2026-11-17 plan, 2026-11-18 applied)
Plan (phase 1), from the repo root: `python3 tools/skaud1/sheet.py`, `node tools/skaud1/inv2.js tools/skaud1/out/inv2.json`, `node tools/skaud1/keys.js`,
`node tools/skaud1/cards.js tools/skaud1/out/moves.json`, `python3 tools/skaud1/plan.py`, `python3 tools/skaud1/md.py`.
Writes `docs/design/skaud1-2026-11-17.json` and `.md`. Verdicts live in `plan.py` (V, KEEPWHY); card moves and their budget check in `cards.js` (MOVES).

Apply (phase 2): the old key -> survivor rules are `retire` in `bramblewood-skillparams.js` (the app runs them on cloud edits and heroes).
`node tools/skaud1/apply.js tools/skaud1/out/changes.json` rewrites each card's retired keys (fused form, the plan's trims, `budget().ok`),
then `python3 tools/skaud1/write_cards.py tools/skaud1/out/changes.json` writes `canonical/cards.json` in its own format. Run again: 0 cards change.
`out/` is scratch (not committed).
