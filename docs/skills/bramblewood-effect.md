---
name: bramblewood-effect
description: Use when adding or changing a Bramblewood visual effect, animation, shader or sound cue, so that it matches house style and appears in the Effects Lab and catalogue.
---

# Add a Bramblewood effect

## Design
- Read `claude/style-guideline.md` sections 3–5 and `claude/context-vfx-animation.md`. Effects are bubbly, obvious and distinct per mechanic. They queue; they never play simultaneously.
- Every new mechanic gets its own `SoundKit` cue, built only from `tone()`/`noise()`/the sweep primitives.
- Think contextually: don't add labels or popups that repeat what the position already says.

## Where code goes
- Skill and projectile choreography: `bramblewood-skillfx.js` (`SkillFX.*`). It is shared by the game and the lab.
- Battlefield WebGL: `bramblewood-shaders.js` (one canvas per surface, never one per card).
- Card and board CSS: `arena_template.html`, near related rules, with a dated comment saying why.
- Event wiring: `renderVfxForEvent()` in `arena_app.js`.

## Performance guardrails
- No per-card `filter` on board or hand cards (each one forces its own offscreen layer). Use `box-shadow` or overlays.
- No full-screen `mix-blend-mode` layer during fights.
- Ambient loops at 30 fps; pause anything decorative while `matchState` is live.
- Respect `prefers-reduced-motion`.

## Show it
1. Add a demo card to the right section of `tools/effects-lab/build.py` (status `live`, `part` or `idea`/TBC), plus a handler in `effects-lab.js`, and a row in its `ALL` table.
2. Add a dated entry to `docs/effects-catalogue.md`.
3. Rebuild and republish the hub (`bramblewood-hub`), then ship the game (`bramblewood-ship`).
