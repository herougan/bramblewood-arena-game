---
name: ship-change
description: Use when changing Bramblewood Arena game code (arena_app.js, arena_template.html, bramblewood-*.js) and you need the loop to build it, test it, look at it, and commit it on your branch. Covers the build command, the test tiers, tools/shot.py (phone, desktop, one panel, dark mode), animation rules that have bitten before, and the CHANGELOG entry. Does not push or deploy: that is the release skill.
---

# Change game code, build, look, commit

Repo: `herougan/bramblewood-arena-game`. Rules: `CLAUDE.md`. Specialist notes: `.claude/agents/<area>.md`, workflow `docs/workflows/ui.md` or `engine.md`.

## Before editing
1. Find the region without reading the file: `docs/guides/arena-app-index.md` (names only), then `grep -n "function NAME" arena_app.js`, then Read with `offset` / `limit` of about 80. `arena_app.js` is about 66k lines. Cheap ways in: `docs/guides/token-savings.md`.
2. Visual change: `docs/style-guideline.md`. New mechanic: `docs/effects-catalogue.md` and the engine workflow. Walk the ladder in `docs/workflows/code-quality.md` (does it need to exist, is there a helper, does the platform do it) before writing code.
3. Player text goes through TX keys and the 12 packs: the `add-texts` skill.

## Build
```bash
python3 assemble_arena.py && mv bramblewood-arena.html index.html      # about 40 s; once per package, not after doc or test edits
```
Never edit `index.html`, `assets/lang/*.js` or `docs/game-texts.xlsx` by hand. `index.html` and `version.json` are one pair: commit them together, never revert `version.json` alone. `node --check arena_app.js` is the fast syntax check.

## Test
```bash
node tests/run.js --smoke                       # first (1-2 min; cached results are skipped)
node tests/run.js --only '<regex>'              # the package's own and directly affected tests
```
Find tests that name what you changed: `grep -lE "functionName|tx-key|card-id" tests/*.js tests/e2e/*.py`. Add one `tests/<pkg>-<date>.js` if the logic can break, with a `run node ...` line in `tests/run-all.sh`. The full suite is a release step.

## Look at it
```bash
python3 tools/shot.py --screen forge --widths 390                    # phone while iterating; both widths once at the end
python3 tools/shot.py --screen forge --clip ".some-panel" --widths 390   # one element: a fraction of the picture tokens
python3 tools/shot.py --screen codex --dark                          # dark mode check (style guide section 8)
python3 tools/shot.py --js "switchTab('play'); startConquestMatch('m1','0-4')" --wait 2500 --name fight
```
Screens: home map codex deck nest shop profile admin forge fight. Pictures land in `tests/out/shots/` (gitignored); view them. Avoid `--full` on long pages. Keep a picture worth keeping in `docs/screens/<pkg>/`.

## Animation rules that bit us before
- GSAP owns `transform` on cards. Ambient CSS motion uses `translate` / `scale`, with selectors wrapped in `:where()` so real animations win.
- `gsap.delayedCall` (it follows hit-stop time scale), not `setTimeout`, for beats inside an effect.
- Never `body:has(...)` (style recalculation 5x slower): toggle a class.
- After Flip in absolute mode, `clearProps: 'transform'`.
- More guardrails (no per-card `filter`, no full-screen blend layers in fights): `add-effect`.

## Commit on your branch (no push)
- Comments: `// <date> (package XX): <why>`, one line. Add a short entry at the top of `docs/CHANGELOG.md` (`head -30` to see the shape): numbers and names, a few bullets.
- `git status --short` first: revert pictures that tests rewrote (`merge-and-test`, step 3). End the message with the session's attribution lines. `git add` named files.
- Pushing is the release skill's job, once per batch, on the owner's approval.

## Report (under 15 lines)
Player-visible changes, files touched, the runner's lines (passed / failed / cached), open owner calls.
