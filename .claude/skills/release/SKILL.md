---
name: release
description: Use only when the owner or coordinator has approved a finished Bramblewood Arena batch for release ("release it", "push and deploy", "ship the batch"). Pushes main (Vercel deploys the live site), builds and publishes the hub, then runs the full suite and card matrix in the background. Once per finished batch, never per package. Never run on your own initiative.
---

# Release a batch

Workflow: `docs/workflows/release.md` (hub details, build stamp). Owner 2026-11-09: deploy first, test after; testing runs off-Claude in the background and never leaves the machine idle.

## Before the push
1. All packages merged (`merge-and-test`), tree clean, on `main` as the owner approved.
2. `node tests/run.js --smoke` and the batch's package tests (`--only '<their names>'`). Report skipped tests as "cached".
3. `bash tools/merge/check_build_pair.sh`: `index.html` and `version.json` must come from one build. Commit both together.

## Ship
```bash
git push origin main                                  # deploys https://bramblewood-arena.vercel.app
```
Check the deploy finished: Vercel `list_deployments` / `get_deployment` (read-only).

## Hub (the Master Hub artifact, https://claude.ai/artifact/45sGJuWwy9T6ocC1D4K99J)
1. `python3 tools/hub/build.py`: builds `.hub/`, then checks the size (fails above 15.0 MB), the file count (under 495) and that every tab renders. Exit 0 is ok; `--check-only` re-checks an existing `.hub/`.
2. Publish with the Artifact tool: `url` of the hub, `root: ".hub"`, `files` as a list of `{path}`, **only files that changed** (usually `index.html`, plus `cards-thumbs.webp` after art changes, `effects.html`, `search-index.json` or `lazy/*.html` when their text changed). Never the whole folder; at most 255 files per publish. Files left out are kept.
3. If the game's chips, statuses or card looks changed, run `node tools/hub/chips_inventory.js` first. If effects changed, see the `add-effect` skill.

## After the push, in the background (`run_in_background`)
```bash
node tests/run.js --full                              # the one full unit run of the batch
node tests/card-matrix.js                             # review golden diffs, then --update once and commit tests/golden/card-matrix.json
node tests/run.js --e2e --only e2e                    # or at least ui_smoke, flows and the batch's e2e scripts
```
Wait for the completion notice; do not poll with `tail`. Failures are fixed in the next batch. Revert test-written screenshots before committing (see `merge-and-test`, step 3). Then `python3 tools/shot.py` on the changed screens.

## Close the batch
- `docs/CHANGELOG.md`: the entry names the package ids that shipped. Move their items to done in `docs/action-items.md` (`grep -n "<ID>"`).
- Project docs (`project_write`): only canonical docs that changed. Every write clears the cache of every chat in the Project.
- Decisions the batch raised go into `docs/decisions.json` (body and options under 100 words).

## Never
Push without approval, push per package, force-push `main`, edit generated files by hand, buy or upgrade anything (Vercel, Supabase, GitHub), print tokens, apply SQL (needs the owner's "apply it").

## Report (under 12 lines)
Commit pushed and deploy state, the runner's lines, hub built (size) and what was published, what runs in the background, failures with a one-line cause, then the balancing status line (road fights in band / within 10 / beyond 20, worst maps, open balance decisions, what runs next).
