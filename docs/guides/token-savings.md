# Token and time savings (2026-11-11, GUIDE1)

Rough costs: about 4 characters per token for prose and code; a picture costs about width x height / 750 tokens. Sizes measured 2026-11-11.

## The expensive files and the cheap way in
| File | Size | Naive cost | Cheap way | Cost |
|---|---|---|---|---|
| `arena_app.js` | 65.7k lines, 110 chars a line | a default Read (2,000 lines) ≈ 55k tokens | `grep -n "function NAME" arena_app.js`, then Read `offset` / `limit` 80 | ≈ 2k |
| `arena_template.html` | 15.6k lines, 216 chars a line | 2,000 lines ≈ 108k | grep the selector (cut to 200 chars), read 30 lines | ≈ 1.5k |
| `bramblewood-engine.js` | 12.4k lines, its header alone 120 lines | 2,000 lines ≈ 52k | grep the function, read 80 | ≈ 2k |
| `docs/code-map.md` | 43 KB | ≈ 11k | `docs/guides/arena-app-index.md` (7.6 KB, names only) | ≈ 2k |
| `canonical/cards.json` | 49.5 MB (art inlined) | impossible | jq, one card without `art` (command 1 below) | ≈ 300 |
| `docs/CHANGELOG.md` | 1.27 MB | | `head -30` to add an entry; `grep -n "Package XX"` to find one | small |
| `docs/decisions.json` | 0.9 MB | | jq select (command 2 below) | small |
| `docs/action-items.md` | 223 KB | ≈ 55k | `grep -n "ITEM-ID" docs/action-items.md` | small |
| `lang/<code>.json`, `lang/ui/<code>.json` | 420-520 KB each, x12 | | jq one key per file (command 3 below) | tiny |
| `index.html`, `assets/lang/*.js` | 17 MB, generated | | never read; grep the source instead | 0 |

```
jq -c '.[] | select(.id=="ID") | del(.art)' canonical/cards.json                         # 1
jq -r '.items[] | select(.status=="YET") | "\(.id) \(.title)"' docs/decisions.json        # 2
for f in lang/*.json; do printf '%s ' "$f"; jq -r --arg k "English text" '.[$k] // "MISSING"' "$f"; done   # 3
grep -n "\.my-class" arena_template.html | cut -c1-200
```

- 25% of `arena_app.js` characters and 39% of the engine's are full-line comments, mostly history. Every region read pays for them; new comments follow the one-line rule (`docs/workflows/code-quality.md`).
- 478 lines of `arena_app.js` are over 500 characters (39 over 2,000). Pipe grep output through `cut -c1-200`.
- A large tool result (tens of KB) is saved to a file and only previewed: narrow the command instead of reading the saved file.

## Practices, with rough savings
1. **Grep anchors, never read from the top.** Index → `grep -n` → 80-line read. A UI package's discovery drops from about 150-250k tokens (a few default reads of `arena_app.js` and the template) to about 15-25k.
2. **No re-reading after an edit.** Edit fails loudly when it does not apply; reading the file back costs the region again. Saves one region read per edit.
3. **Smallest test set first.** `node tests/run.js --list --only 'RE'`, then run it. The cache is shared by every worktree (`docs/guides/testing.md`), so the smoke tier's two slow tests (about 150 s together) come up cached in a fresh worktree when their inputs are unchanged. The runner's quiet output (one line plus failure tails) instead of `bash tests/run-all.sh` (a line per test, about 400) saves several thousand tokens a run.
4. **Build once per package**, not after doc or test edits (about 40 s each). Tests that read `index.html` need it; engine-only tests do not.
5. **Screenshots: only what you must see.** `tools/shot.py` gives 390 px (≈ 440 tokens) and 1366 px (≈ 1,570) shots. Use `--widths 390` while iterating and both widths once at the end; `--clip "<selector>"` crops one panel (a fraction of the tokens) and `--dark` is the dark-mode check; avoid `--full` on long pages (downscaled, unreadable, still paid). For many images build one contact sheet and look once.
6. **Explore or `qa-explorer` for questions, a worker for edits.** "Where is X / how does Y work" in a subagent keeps the file reads out of the main context and comes back as a 10-line answer.
7. **Balance runs as automation.** `tools/pipeline/run.sh <step>` and the BAL13 summary print at most 20 lines; read those and the flagged items, not the tools' logs. Long runs go in the background (`run_in_background`), and you wait for the completion notice instead of polling with `tail`.
8. **One translation table per package** (`python3 tools/i18n_add.py`, `docs/guides/i18n.md`), with all 12 languages in one table, not a file edit per language and not a copied script.
9. **Short reports.** Player-visible change, files touched, the runner's test line, open owner calls. No recap of code you read, no pasted logs.
10. **Project docs only when canonical.** Every write to the claude.ai Project clears the cache for every chat in it.
11. **Publish only changed hub files** (`docs/workflows/release.md`), never the whole `.hub/` folder.
12. **Don't paste CLAUDE.md into briefs.** Every agent loads it; name the workflow, the agent file and the anchors instead.

## Which file first
| Task | Open first |
|---|---|
| Any code change | `docs/guides/arena-app-index.md`, then the agent file for the area (`.claude/agents/<name>.md`) |
| How the page is built, where state lives | `docs/guides/architecture.md` |
| Libraries, browsers, what not to add | `docs/guides/frameworks.md` |
| Supabase, saves, RPCs | `docs/guides/networking-api.md` |
| Which tests, how long | `docs/guides/testing.md` |
| Texts and the 12 packs | `docs/guides/i18n.md` |
| Writing code or player text | `docs/workflows/code-quality.md` |

## Agent brief template
```
Run `git fetch -q origin && git merge -q origin/<batch-branch>` first.   (only while a batch is unpushed)
Package <ID> (<date>), <one-line goal>. Agent: .claude/agents/<name>.md. Workflow: docs/workflows/<file>.md.
Items:
  1. <exact item> (owner <date time>: "<quote>")
Files you may touch: <list>. Not: <list>.
Anchors: <function names, TX keys, card ids, CSS classes>.
Tests: node tests/run.js --only '<regex>'; new test tests/<pkg>-<date>.js if logic can break.
Done when: <observable result, e.g. "390 and 1366 shots viewed; the pill shows N">.
Report, under 15 lines: player-visible changes; files; the runner's line (passed / failed / cached); owner calls.
Commit on your branch; do not push.
```

## Recommendations (status 2026-11-11)
Done in TOOLS1 (2026-11-11): 1, 3, 4, 5, 10. Done in the stale-numbers fix: 11. Open: 2, 6, 7, 8, 9, 12.

1. **DONE (TOOLS1).** **Share the test cache across worktrees** in `tests/run.js`: one file in the git common dir (`bw-test-cache/`), several passing keys per test, written with a temp file and a rename; `electron/` and `.github/` files a test names are inputs. Saves a cold unit run (up to about 30 min) per fresh worktree.
2. **Hooks** in `.claude/settings.json`: after an Edit of a `.js` file run `node --check` on it; before a Read of `canonical/cards.json`, `index.html` or `assets/lang/*`, block it and print the jq / grep alternative; warn on edits to generated files. Check the hook format in the Claude Code docs first.
3. **DONE (TOOLS1).** **Real skills** in `.claude/skills/<name>/SKILL.md`: `merge-and-test`, `release`, `add-texts`, `ship-change`, `add-effect`, `hub`. The three old `docs/skills/*.md` stay (the hub's guide tab reads them) with a pointer line after their frontmatter.
4. **DONE (TOOLS1).** **`tools/i18n_add.py`**: one tool that takes a JSON (or Python) table of keys and 12 translations (`docs/guides/i18n.md`). The 172 older dated scripts stay as history.
5. **DONE (TOOLS1).** **`tools/shot.py --clip <selector> --dark`**: a crop of one panel (a fraction of the tokens) and the dark-mode check the style guide asks for.
6. **Comment diet**: a one-time pass that moves history narration out of `arena_app.js`, the engine and the template (keeping the `NAME:BEGIN/END` markers and the one-line reason). Cuts the cost of every later region read by up to a quarter.
7. **Split `arena_app.js`** into area files that `assemble_arena.py` concatenates in order (same global scope, no modules). Fewer merge conflicts and smaller reads. Blocker: about 290 test files and `tools/lib_bramble.js` read `arena_app.js` by name; they would read the concatenation through one helper.
8. **Slow tests off the package path**: `flows`, `qa1_2026_11_02`, `bv_2026_10_24`, `qa2_2026_11_03` (e2e) and `pr-2026-10-23` (unit) take about 47 min between them; run them at release only, or on GitHub's runners like `deckopt.yml` (owner 2026-11-09: testing off-Claude).
9. **Faster build**: the build is about 40 s wall but about 13 s of CPU; cache unchanged asset conversions (WebP, emoji) by content hash.
10. **DONE (TOOLS1).** **Merge tool**: `tools/merge/merge_pkg.sh` treats `docs/code-map.md` and `docs/guides/arena-app-index.md` as generated: when either conflicts it reruns `python3 tools/code_map.py` after the rest is merged, instead of stopping.
11. **DONE** (commit 863c25c2). **CLAUDE.md numbers**: `arena_app.js` is about 66k lines; the smoke tier is 1-2 minutes.
12. **Ponytail for local sessions**: the ruleset is already in `docs/workflows/code-quality.md`. It is not in the org's plugin catalog (searched 2026-11-11); install it on a local machine only if the owner wants it.
