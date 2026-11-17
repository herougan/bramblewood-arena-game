# SKAUD1 skill audit generator (2026-11-17)
Run from the repo root, in order: `python3 tools/skaud1/sheet.py`, `node tools/skaud1/inv2.js tools/skaud1/out/inv2.json`, `node tools/skaud1/keys.js`,
`node tools/skaud1/cards.js tools/skaud1/out/moves.json`, `python3 tools/skaud1/plan.py`, `python3 tools/skaud1/md.py`.
Writes `docs/design/skaud1-2026-11-17.json` and `.md`. Verdicts live in `plan.py` (V, KEEPWHY); card moves and their budget check in `cards.js` (MOVES).
`out/` is scratch (not committed).
