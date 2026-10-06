---
name: bramblewood-ship
description: Use when changing the Bramblewood Arena game code (arena_app.js, arena_template.html, bramblewood-*.js) and you need to build, test, screenshot, commit and deploy it.
---

# Ship a Bramblewood change

The repo is `herougan/bramblewood-arena-game`, cloned at `/home/claude/bramblewood-arena-game`. Pushing to `main` deploys to https://bramblewood-arena.vercel.app automatically.

## Before editing
1. Read the context doc for the area you are touching (list in the hub's "Claude's guide" tab). For any visual change, read `claude/style-guideline.md`. For any new mechanic, read `claude/mechanics-guideline.md`.
2. Search with `grep -n` first. `arena_app.js` is over 20k lines, so read only the region you need.

## Build
```bash
python3 assemble_arena.py && mv bramblewood-arena.html index.html
```
Never edit `index.html` by hand; it is generated.

## Test (all must pass before committing)
```bash
bash tests/run-all.sh                     # unit suites + card-data integrity
for t in ui_smoke flows snaps; do python3 tests/e2e/$t.py | tail -2; done
```
Also run `hero.py` or `i18n.py` when touching those areas.

## Look at it
- Serve over http, not file:// (fonts need it): `setsid nohup python3 -m http.server 8765 >/dev/null 2>&1 &` in the repo.
- Playwright Chromium: `/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell`. WebGL needs `--enable-unsafe-swiftshader --use-angle=swiftshader --ignore-gpu-blocklist`.
- Skip the splash and tutorial with init script: `localStorage.setItem('bramblewood_arena_tutorial_done','1'); sessionStorage.setItem('bramblewood_seen_splash','1')`.
- Start a fight: `FEATURE_SPOTS.forEach(sp=>unlockFeature(sp.key)); switchTab('play'); startConquestMatch('m1','1-4')`.
- Check desktop (1280×800) and phone (390×844), light and dark.

## Animation rules that bit us before
- GSAP owns `transform` on cards. Ambient CSS motion uses the separate `translate`/`scale` properties, and selectors wrapped in `:where()` so real animations win.
- Use `gsap.delayedCall` (respects hit-stop time scale), not `setTimeout`, for beats inside an effect.
- Never use `body:has(...)`: it made style recalculation 5× slower. Toggle a class instead.
- After Flip in absolute mode, clear the GSAP transform cache with `clearProps:'transform'`.

## Commit and push
End the message with the session's attribution trailer, then `git push origin main`.

## After shipping
- Update `docs/MASTER.md` (the item's status, plus the "Last updated" line) and add a headline to `docs/CHANGELOG.md` if it is user-visible.
- Sync changed docs to the project with `project_write` (local_path), and end with `project_write claude/MASTER.md` and `present_to_user: true`.
