# Workflow: testing, debugging and releases

A release is one push to `main`, which deploys the live site, plus one hub republish. Release once per finished batch.

## Merge the batch (one branch at a time)
1. For each finished package: `bash tools/merge/merge_pkg.sh <branch>`. If it stops on a `.js` conflict, resolve it by hand or `git merge --abort` and ask that package's agent to merge `main` itself.
2. After each merge: `node tests/run.js --smoke` and the package's own test (`--only`). Don't run the full suite between merges.
3. Remove the merged worktree: `git worktree remove --force <path> && git branch -D <branch>`.

## Release checks (once, after the last merge)
1. `node tests/run.js --full`. This is the one full unit run of the batch.
2. `node tests/card-matrix.js`: review the golden diffs. Then `node tests/card-matrix.js --update` and commit the golden file.
3. `node tests/run.js --e2e --only e2e`, or at least `ui_smoke`, `flows` and the e2e scripts of the packages in the batch.
4. Look at the changed screens with `python3 tools/shot.py`.

## Ship
1. `git push origin main`, then check that Vercel finished the deploy.
2. Hub: rebuild and publish (`docs/skills/bramblewood-hub.md`). Publish only the files that changed.
3. Project: write only the canonical docs that changed (the backlog, decisions, and a release note if needed). Each write clears every chat's cache in the Project.
4. Record the package IDs that shipped in the CHANGELOG entry and move their items to "done" in `docs/action-items.md`.

## Debugging
- Start with the smallest repro: one test file (`node tests/run.js --only <name>`), a harness board scenario, or a `tools/shot.py --js` call.
- The test runner records timings (`tests/out/test-timings.json`) and caches passes. `--full` ignores the cache.
- A slow or timed-out test under load is not a failure. Rerun it alone before you report it.
