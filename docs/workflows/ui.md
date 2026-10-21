# Workflow: UI and frontend

For screens, layout, the deck editor, Codex, Forge, map, raid UI, filters, animation and CSS.

## Files you need
- `arena_app.js` (UI and meta-game) and `arena_template.html` (CSS). Find the region in `docs/code-map.md` first, then `grep -n`.
- Texts: every player-facing string is a TX key in `bramblewood-texts.js`, translated in `lang/<code>.json`. Literal UI strings in `arena_app.js` go in `lang/ui/<code>.json`. `tests/i18n-ui-2026-10-18.js` fails on stale rows.
- Style: `docs/style-guideline.md`. Effects and perf guardrails: `docs/skills/bramblewood-effect.md`.

## How to work
- Phone (390) and desktop (1366) both matter. Check both with `python3 tools/shot.py --screen <name>` (or `--js "<call that opens it>"`), and view the PNGs.
- Keep edits inside a named, dated block where you can (`// 2026-10-21 (package XX): reason`). Small call-site edits are marked the same way.
- After text edits, run `python3 tools/text/keyify.py && python3 tools/text/export_texts.py`.
- Labels leave out what their position already says. Confirmations are on-page (tap twice), never browser dialogs.

## Checks
- Run the build and `node --check arena_app.js`, then `node tests/run.js --smoke`.
- Then the area's tests: `node tests/run.js --only '<area>'`, plus that area's e2e script in `tests/e2e/` when interaction changed.
- `tests/game-texts.js` times out when the machine is loaded. If it does, run `python3 tools/text/selftest.py` on its own.

## Done when
Shots at both widths have been viewed, the texts are translated, there is a CHANGELOG entry, and screenshots that are worth keeping are in `docs/screens/<pkg>/`.
