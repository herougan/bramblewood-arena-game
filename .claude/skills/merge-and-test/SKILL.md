---
name: merge-and-test
description: Use when a finished Bramblewood Arena package branch (an agent's worktree branch) must be merged into the batch branch and checked, for example "merge branch X", "merge the packages", or after an agent reports done. Runs tools/merge/merge_pkg.sh, then smoke and the package's own tests, reverts test-written screenshots, and removes the merged worktree. Does not push or deploy: that is the release skill.
---

# Merge a package branch and test it

One branch at a time, in the order the agents finished. Workflow: `docs/workflows/release.md` ("Merge the batch"); tests: `docs/guides/testing.md`.

## 1. Merge
```bash
git status --short                                   # clean tree first
MERGE_TITLE="package XX (what)" COMMIT_TRAILER="<the attribution lines of this session>" bash tools/merge/merge_pkg.sh <branch>
```
The script resolves generated files (takes ours: `index.html`, `version.json`, `assets/lang/*.js`, `docs/game-texts.xlsx`), regenerates `docs/code-map.md` and `docs/guides/arena-app-index.md` with `tools/code_map.py`, merges `lang/*.json` and `canonical/cards.json` by key and field, unions `docs/CHANGELOG.md`, `tests/run-all.sh` and new `TEXT` keys, rebuilds, and checks JSON, unique card ids and the build pair.

| Exit | Meaning | Do |
|---|---|---|
| 0 | merged and committed | go on |
| 1 | another merge is open, or git refused to start | finish or `git merge --abort`; look for untracked files in the way |
| 2 | `NEEDS HAND RESOLUTION: <files>` (a `.js` file, usually) | resolve by hand, `git add`, rerun the same command to resume; or `git merge --abort` and ask the package's agent to run `git merge <batch branch>` itself. Never union `.js` files |
| 3 | build failed | `python3 assemble_arena.py` alone, read the traceback |
| 4 / 5 | bad JSON / duplicate card id or numericId | fix the named file or id (parallel packages collide on ids) |
| 6 | `index.html` and `version.json` come from different builds | rebuild and commit both together; never revert `version.json` alone |
| 7 | `tools/code_map.py` failed | fix the cause, rerun to resume |

## 2. Test (smallest set first)
```bash
node tests/run.js --smoke                            # after every merge
node tests/run.js --list --only '<regex>'            # preview: cached or run
node tests/run.js --only '<package tests>'           # the package's own tests (its new tests/<pkg>-<date>.js, plus affected areas)
```
- Never the full suite between merges; the release runs it once.
- The pass cache is shared by every worktree (`git rev-parse --git-common-dir` + `/bw-test-cache`; `node tests/run.js --cache-dir` prints it). A skipped test is reported as "cached", never "passed".
- A timeout under load is not a failure: `node tests/run.js --only '^tests/<name>'` alone before reporting it.

## 3. Revert test-written screenshots
E2E tests rewrite tracked pictures (`tests/e2e/shots/**`, `docs/screens/**`). Before any commit, or any `git add -A`:
```bash
git status --short | grep -E '\.(png|webp|jpg)$'
git checkout -- tests/e2e/shots docs/screens         # tracked pictures the run rewrote
```
Keep only pictures the package meant to add (its `docs/screens/<pkg>/`); delete new untracked test pictures. Revert only paths you have seen in `git status`.

## 4. Clean up
```bash
git merge-base --is-ancestor <branch> HEAD && git worktree remove --force <worktree path> && git branch -D <branch>
```
Remove only after the merge commit exists. No bare `git stash` (the stack is shared with other sessions): set work aside as a WIP commit.

## Report (under 8 lines)
Branch merged, hand resolutions (file and how), the runner's lines (passed / failed / cached), failures with a one-line cause. Do not push: `release` does that, once per batch, on the owner's approval.
