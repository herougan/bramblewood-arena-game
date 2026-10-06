---
name: bramblewood-hub
description: Use when the Bramblewood Effects Lab, Visual Library, Master doc, changelog or Claude's guide changed and the Master hub artifact needs rebuilding and republishing.
---

# Rebuild and publish the Master hub

The hub is one artifact with tabs: Master, Changelog, Effects Lab, Visual Library and Claude's guide.
URL: https://claude.ai/artifact/45sGJuWwy9T6ocC1D4K99J

## Sources
- Effects Lab: `.fxcat/` (gitignored), built by `tools/effects-lab/build.py`, with the copy at `.fxcat/build.py`. Lab demos run the game's own CSS, shaders and `bramblewood-skillfx.js`.
- Visual Library: `.vislib/` (images plus `visual-library.html`).
- Guide docs: `.guide-src/` holds project-only docs fetched with `project_read`; `docs/skills/` holds the skill texts.
- Master and changelog: `docs/MASTER.md`, `docs/CHANGELOG.md`.

## Steps
1. If game CSS or effects changed, rebuild the game first (`bramblewood-ship`), then `python3 .fxcat/build.py && cp .fxcat/build.py .fxcat/effects-lab.js tools/effects-lab/`.
2. `HUB_URL=https://claude.ai/artifact/45sGJuWwy9T6ocC1D4K99J python3 tools/hub/build_hub.py`. It prints the file count, which must stay ≤ 495 (the artifact cap is 511). It prunes near-duplicate screenshots to fit.
3. Spot-check with Playwright over `http://127.0.0.1:8765/.hub/index.html#<tab>`. Route `**/gsap.min.js` to the repo's local `gsap.min.js`, because the CDN is blocked here.
4. Publish `.hub/index.html` with `root: ".hub"` and `files` as a list of `{path}`. Each publish takes at most 255 files, so send only what changed. Usually that is `index.html` plus `effects.html`, `effects-lab.js` or `library.html`, plus new `img/*.webp`. Files left out are kept.
5. The Master doc's links to the hub become in-page tab links automatically when `HUB_URL` is set.

## Notes
- Supporting HTML pages need their own doctype, charset and viewport; `build_hub.py` adds them.
- The project knowledge store is nearly full (about 1.99 MB of 2 MB). Prefer replacing docs over adding new ones.
