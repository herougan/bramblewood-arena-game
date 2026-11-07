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
2. Hub: `python3 tools/hub/build.py` (see "The hub" below), then the coordinator publishes it with the Artifact tool. Publish only the files that changed.
3. Project: write only the canonical docs that changed (the backlog, decisions, and a release note if needed). Each write clears every chat's cache in the Project.
4. Record the package IDs that shipped in the CHANGELOG entry and move their items to "done" in `docs/action-items.md`.

## Debugging
- Start with the smallest repro: one test file (`node tests/run.js --only <name>`), a harness board scenario, or a `tools/shot.py --js` call.
- The test runner records timings (`tests/out/test-timings.json`) and caches passes. `--full` ignores the cache.
- A slow or timed-out test under load is not a failure. Rerun it alone before you report it.

## The hub (any agent can build it; the coordinator publishes it)
The Master Hub is one page, `.hub/index.html` (gitignored), plus a few files beside it (`effects.html`, `library.html`, `cards-thumbs.webp`, `assets/`, `fonts/`). The artifact is https://claude.ai/artifact/45sGJuWwy9T6ocC1D4K99J.
- **Build and check, one command** (2026-11-07, package HUB3): `python3 tools/hub/build.py`. It runs `tools/hub/build_hub.py` (with `HUB_URL` set and `PYTHONHASHSEED=0`, so two builds of the same inputs are byte-identical), builds twice if `docs/decisions.md` was regenerated, splices Claude's guide docs, then checks: `index.html` under 16 MiB, under 495 files, every main tab renders text, no page error (Playwright). `--no-shots` skips the browser; `--check-only` re-checks an existing `.hub/`. Exit code 0 means ok. **HUB4 (2026-11-07): the size check now fails above 15.0 MB (15,000,000 bytes), not 16 MiB** (the publisher adds a ~0.6 MB code-highlight runtime and refuses the page over 16 MiB). The check serves `.hub/` on localhost and opens it there, because the page fetches files (below); a page opened as `file://` shows "Could not load" in the moved tabs.
- **Where things come from.** Tabs read the repo (`canonical/`, `docs/`, `tools/hub/*_tab.*`). Three gitignored caches live in the main checkout (`.fxcat` Effects Lab, `.vislib` Visual Library, `.guide-src` project-only docs); a worktree finds them there. Missing ones fall back to committed copies: `tools/hub/library-fallback.html` (the Visual Library page) and `tools/hub/guide-snapshot.html` (the guide docs that exist only in the claude.ai Project: the 10 `claude/*.md` ones under "Claude's guide"). After the Project copies change, refresh the snapshot from a published hub: `python3 tools/hub/build.py --refresh-guide <that index.html>`. There is no separate "previous published copy" to keep. The snapshot replaces it.
- **Size** (HUB4, 2026-11-07). `index.html` is now about 5.7 MB; the check fails above 15.0 MB. The big blocks are files beside it that the page fetches the first time they are needed (they do not count toward the page limit, are published with it, and are re-published only when their text changes):
  - `search-index.json` (3.0 MB): the search text, fetched when the search box is first used (`hub_app.js`, `loadIdx`). Cards are still searched from the page.
  - `lazy/<id>.html` (about 40 files, 7 MB): every `<template class="lazy">` over 25 KB (`LAZY_MIN` at the end of `build_hub.py`) is written there and replaced by a `data-src` stub; `stamp()` fetches it (synchronously, same origin) when its tab or sub-tab opens. Names are the nearest `id` (`p-changelog`, `p-deckopt`, `p-guide`, `lib-...`). Nothing else changes: add a lazy panel as before with `lazy(html)`.
  - What stays inside: the page chrome, Home, Decisions data (1 MB), Cards data and the other tab data (about 2.5 MB), styles, small panels.
  - The guide splice and `--refresh-guide` read the lazy file that holds Claude's guide (`lazy/p-guide.html`); `--refresh-guide` also accepts an older, inline published copy.
  - If the page grows back toward 15 MB: the data constants (`UT_DATA`, `HB_DATA`, `CT_*`, `MC_DATA`) can move to `.js` files the same way. Beside the page also: `effects.html` 6 MB and `cards-thumbs.webp` 2.2 MB.
  - The publisher adds its syntax-highlight runtime when the page has rendered fenced code (`<pre><code class="language-...">`; the page has no literal triple backticks). Moving the docs out removed most of those blocks (5 left in `index.html`, from small panels). Not verified against the publisher; at this size it does not matter.
- **Publish** (coordinator only): Artifact tool, `url` of the hub, `root: ".hub"`, `files` as a list of `{path}`. At most 255 files per publish, so send what changed (usually `index.html`, plus `cards-thumbs.webp` when art changed). Files left out are kept. Spot-check with `python3 tools/hub/build.py --check-only` before publishing.
- **Cards art** (HUB3): `cards-thumbs.webp` is a sheet of 96 px tiles built from `assets/cards/` and `canonical/cards.json` art. It keeps the alpha of cut-out sprites; the page paints the game's art plate under it (rarity colour mixed into brown, as `.card-tile.art-framed`). Small pixel sprites are enlarged with nearest-neighbour, as the game's `image-rendering: pixelated` does.

## Build stamp (2026-11-07, UI27-1)
- `version.json` and `index.html` are one pair: never discard or revert `version.json` after a build. Commit both together.
- Before every push to `main`, run `bash tools/merge/check_build_pair.sh`; it fails when the two builds differ (that mismatch made every page ask to update forever). `merge_pkg.sh` runs it too.

