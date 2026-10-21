# Workflow: engine and backend

For battle rules, keywords, skills (trigger × action), statuses, AI, raid and trench rules, and Supabase (saves, overrides, server rewards).

## Files you need
- `bramblewood-engine.js` (headless rules), `bramblewood-raid.js`, `bramblewood-trench.js`, `bramblewood-autobattle.js`, `bramblewood-ghosts.js`.
- Skill costs: `canonical/skill-costs.json`. Skill texts are TX keys in `bramblewood-texts.js`.
- Tests: `tests/lib/harness.js` (board scenarios, seeded), `tests/scenarios/*.json`, `tests/card-matrix.js`, and its golden file `tests/golden/card-matrix.json`.
- Supabase: `supabase/migrations/` (applied), `supabase/proposed/` (waiting for "apply it"), `supabase/oneoff/`.

## Rules
- A new mechanic gets a scenario test that proves it does something. The matrix's "every effect does something" check must stay green.
- Golden diffs: 0 failures is required. Changed results must be explained in the CHANGELOG. They are accepted with `--update` once per release batch, after review.
- Supabase: inspect the tables first and keep RLS on. Never write live data without "apply it". Backups of rows you change go into a backup table with RLS on and anon/authenticated access revoked.
- Engine changes affect everything: run the full unit tier before the package is called done (`node tests/run.js`).

## Checks
`node --check bramblewood-engine.js`, then the package test, then `node tests/run.js --only 'scenarios|card-matrix|two-player|async-raid|raid|keywords'`, then `node tests/run.js`.

## Done when
The tests are green or the golden diffs are explained, proposed SQL is filed (not applied), and owner calls are in `docs/decisions.json`.
