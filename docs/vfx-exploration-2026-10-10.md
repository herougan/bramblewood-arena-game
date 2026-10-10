# GSAP, textures, shaders and VFX: where to take them (2026-10-10)

Live sketches for everything below are in the **VFX Playground** (hub → Effects Lab → Playground, built by `tools/effects-lab/build_playground.py`).

## What changed in the toolbox

- **Every GSAP plugin is free now.** Since 3.13 (April 2025), SplitText, MorphSVG, DrawSVG, Physics2D, MotionPath, CustomWiggle, CustomBounce, ScrambleText and Inertia ship in the public package under the no-charge licence. The game runs **3.12.5** with Flip only. Upgrading the core to 3.13 is a drop-in (same API) and unlocks the rest. The playground vendors 3.13.0 in `tools/effects-lab/vendor/`.
- **We already have three layers to build on:**
  - `bramblewood-shaders.js`: WebGL map overlays, one look per terrain.
  - `bramblewood-skillfx.js`: GSAP skill choreography (bow shots, volleys, lightning).
  - `bramblewood-unitfx.js`: hit styles and skins.

  Nothing new needs a framework; everything below slots into one of these three.

## Three rules so it stays readable

1. **Effects explain the rules.** A curved throw says "this hits fliers", a shield that morphs into spikes says "Thorns came from the shield". If an effect doesn't teach something, it should be short.
2. **One big moment at a time.** Callouts, hit-stop and screen-wide light are for rare beats (phase change, leader, crit, boss). Everyday hits stay small.
3. **Budget by surface.** Board: one shared WebGL canvas plus DOM/SVG. Menus: CSS and SVG only. Maps: one shader layer (as today). Browsers allow about 16 WebGL contexts, so a canvas per card only works for short-lived effects (a death) or a handful of showcase cards (the Forge, pack opening).

## Card treatments

| Idea | How | Where it would show | Size |
|---|---|---|---|
| **Cream pearl foil** (and Brushed gold, Galaxy) | Fragment shader: cream base, fibre grain, rainbow band and light-catching specks that follow tilt | Booster packs (your cream foil request), Foil/Prestige finishes in the Forge and Codex | M |
| **Living ink frame** | SVG `feTurbulence` + displacement, GSAP steps the seed | Legendary/Epic borders on the board, so rarity is on the border, not a gradient | S |
| **Burn-away / frost shatter / poison melt deaths** | Noise-threshold dissolve shader on the dying card + Physics2D particles | Death by element: heat, cold, poison, bleed | M |
| **Tilt and glare** on hover | `gsap.quickTo` on rotationX/Y + the foil uniforms | Hand cards, collection, pack reveal | S |
| **Breathing art** | Split the art into 2–3 parallax layers (PixelLab can export them), tiny idle drift | Leaders, heroes, Legendary cards only | L (art) |
| **Texture library** | Paper grain, brushed metal, cracked stone, bark and moss as small tiling PNGs in `assets/tex/` | Card backs, frames, shop shelves (the bakery/medicine-shop redesign), tape labels | S each |

## Skill effects

| Idea | How | Skills it fits | Size |
|---|---|---|---|
| **Curved throws and arcs** | MotionPathPlugin with `curviness` and `autoRotate` | Anti-Air (boomerang), Arrow, Volley, Reach, Ricochet | S |
| **Drawn hit marks** | DrawSVGPlugin strokes + CustomWiggle shake | Claw/bite/sting/peck hit styles, Sweep, Swipe, Rend | S |
| **Shape morphs** | MorphSVGPlugin | Shield → spikes (Thorns), egg → crack, bud → bloom (Bloom), moon → sun (phase flip) | S |
| **Physics particles** | Physics2DPlugin (velocity, angle, gravity) | Feathers, leaves, embers, shell chips, gold coins from Bounty | S |
| **Shield Call** | A shield drops (CustomBounce) into the slot while the ally slides aside (Flip) | The new Shieldbearer Hound | S |
| **Board light** | The existing battlefield point light, flashed from impact positions | Crits, fire, lightning, Night falls | already there |

## Map effects

| Idea | How | Where | Size |
|---|---|---|---|
| **Time of day** | Grade the map art in the shader (day → dusk → night), lantern pools at nodes, stars, fireflies | Arena day/night phases, night-only skirmishes, a boss approaching | M |
| **Weather fronts** | Rain/snow/fog as shader uniforms tweened by GSAP | Map-wide events, field cards (Thick Fog, Spring Rain) | M |
| **Chaos returns** | Zoom-out, then advanced nodes land one by one with a ripple and a scrambled X-Y label | Your Map 40+ respawn idea | S |
| **Loading veil** | Hold a painted veil until the shader layer reports its first frame, then dissolve it with the same noise shader | The map loading screen you asked for (no half-loaded VFX) | S |
| **Path drawing** | DrawSVG along the route between cleared nodes | Map progress, unlocking the next skirmish | S |

## Suggested order

1. Upgrade GSAP to 3.13 in the game (vendor files are ready; check Flip still behaves).
2. Map loading veil (fixes a real problem, reuses the dissolve shader).
3. Hit marks + curved throws (small, used in every fight).
4. Cream pearl foil on boosters and pack opening (it's one of the 21:29 items).
5. Element deaths (burn, frost, melt), then the shared board canvas so several can run at once.
6. Time of day on maps and in the Arena.
