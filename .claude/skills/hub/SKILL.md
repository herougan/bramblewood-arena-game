---
name: hub
description: Use when the Bramblewood Master Hub artifact (decisions, backlog, cards, balance tabs, Effects Lab, Visual Library, Claude's guide) needs rebuilding, checking or republishing after docs, decisions, cards or effects changed. Builds and checks .hub/ with tools/hub/build.py; the coordinator publishes only the changed files. A release publishes it too (release skill).
---

# Rebuild and check the hub

Hub: https://claude.ai/artifact/45sGJuWwy9T6ocC1D4K99J. Details (sizes, lazy files, caches): `docs/workflows/release.md`, "The hub".

## Build and check
```bash
python3 tools/hub/build.py                 # builds .hub/, then checks; exit 0 is ok
python3 tools/hub/build.py --no-shots      # skip the browser check
python3 tools/hub/build.py --check-only    # re-check an existing .hub/
```
The checks: `index.html` under 15.0 MB, under 495 files (the artifact cap is 511), every main tab renders text, no page error. Two builds of the same inputs are byte-identical.

## Sources
- Tabs read the repo: `canonical/`, `docs/` (`decisions.json`, `action-items.md`, `CHANGELOG.md`), `tools/hub/*_tab.*`; Claude's guide shows `docs/skills/*.md`.
- Three gitignored caches live in the main checkout (`.fxcat` Effects Lab, `.vislib` Visual Library, `.guide-src` project-only docs); a worktree finds them there. Missing ones fall back to `tools/hub/library-fallback.html` and `tools/hub/guide-snapshot.html`. Refresh the guide snapshot from a published hub: `python3 tools/hub/build.py --refresh-guide <that index.html>`.
- Chips and FX tab: `node tools/hub/chips_inventory.js` after chips, statuses or card looks changed (`--check` says if stale). Owner marks: `tools/hub/pull_chip_review.md`. Other owner-edit round trips: `tools/hub/pull_*.md`.
- Effects Lab: `python3 tools/effects-lab/build.py` after the game is built (`add-effect` skill).

## Publish (coordinator only)
Artifact tool: `url` of the hub, `root: ".hub"`, `files` as a list of `{path}`. At most 255 files per publish, so send only what changed: usually `index.html`, plus `cards-thumbs.webp` after art changes, `effects.html`, `search-index.json` or the `lazy/*.html` files whose text changed. Files left out are kept. Run `--check-only` before publishing. Supporting HTML pages need their own doctype, charset and viewport (`build_hub.py` adds them).

## Notes
- Chromium over `http://127.0.0.1:<port>/` with `**/gsap.min.js` routed to the repo's `gsap.min.js` (the CDN is blocked here); the build's check does this for you.
- Project docs are nearly full (about 2 MB): write only canonical docs, and prefer replacing over adding.
