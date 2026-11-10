---
name: add-effect
description: Use when adding or changing a Bramblewood Arena visual effect, animation, shader or sound cue so that it matches house style, stays within the performance guardrails, and appears in the Effects Lab and the effects catalogue.
---

# Add a Bramblewood effect

How effects reach the lab: `docs/effects-lab-contract.md`. Style: `docs/style-guideline.md` sections 3 to 5 (motion, skill VFX, sound).

## Design
- Effects are bubbly, obvious and distinct per mechanic. They queue; they never play at the same time.
- Every new mechanic gets its own `SoundKit` cue, built only from `tone()`, `noise()` and the sweep primitives.
- Think contextually: no labels or popups that repeat what the position already says (style guide section 6).

## Where code goes
- Skill and projectile choreography: `bramblewood-skillfx.js` (`SkillFX.*`), shared by the game and the lab.
- Battlefield WebGL: `bramblewood-shaders.js` (one canvas per surface, never one per card).
- Card and board CSS: `arena_template.html`, next to related rules, with a one-line dated comment saying why.
- Event wiring: `renderVfxForEvent()` in `arena_app.js` (`grep -n "function renderVfxForEvent" arena_app.js`).
- Other effect files: `bramblewood-fx-*.js`, `bramblewood-unitfx.js`, `bramblewood-procfx.js` (`docs/guides/arena-app-index.md`, `docs/code-map.md`).

## Performance guardrails
- No per-card `filter` on board or hand cards (each forces its own offscreen layer): use `box-shadow` or overlays.
- No full-screen `mix-blend-mode` layer during fights.
- Ambient loops at 30 fps; pause anything decorative while `matchState` is live.
- Respect `prefers-reduced-motion`.
- GSAP owns `transform` on cards; ambient CSS uses `translate` / `scale` (see `ship-change`).

## Show it
1. Add a demo card to the right section of `tools/effects-lab/build.py` (status `live`, `part`, or `idea` / TBC), a handler in `tools/effects-lab/effects-lab.js`, and a row in its `ALL` table.
2. Add a dated entry to `docs/effects-catalogue.md`.
3. Build the game (`ship-change`), then `python3 tools/effects-lab/build.py` (it first copies each effect function the lab plays from the game's source).
4. Look at it in both themes and both widths (`python3 tools/shot.py --js "<call>" --dark`), then the hub: `hub` skill.
