# Bramblewood effects catalogue (2026-10-03)

**Purpose:** a menu of visual effects we like, where each one belongs in the game, and how to build it. Pick from here when planning polish batches.

**Status key:** ✅ live · 🧪 experiment chosen · 📝 idea

## The toolbox (how anything here gets built)

Six techniques, cheapest and most compatible first. The tag in brackets is how the tables below refer to each one.

**1. CSS only [CSS]**
- *What it is:* gradients, blend modes, masks, filters, 3D transforms, and `@property`-animated variables.
- *Runs on:* the real card and DOM elements.
- *Browsers:* all.
- *Cost:* very low.

**2. SVG filters on DOM [SVG]**
- *What it is:* `filter:url(#id)` with `feTurbulence`/`feDisplacementMap`/`feSpecularLighting`.
- *Runs on:* the real DOM, so it can *distort* elements.
- *Browsers:* Chrome and Firefox are solid; Safari's support for SVG filters on HTML is patchy (test first).
- *Cost:* medium. It's heavy if animated over large areas.

**3. Canvas overlay [Overlay]**
- *What it is:* a WebGL or 2D canvas laid over or under the DOM. This is what the map effects and Atmosphere use today.
- *Runs on:* its own pixels only. It can't touch the DOM.
- *Browsers:* all.
- *Cost:* low–medium.

**4. Shader on our own art [Art shader]**
- *What it is:* WebGL that samples our images (the splash, map art, card art). This is the splash shader.
- *Runs on:* any image we have as a file.
- *Browsers:* all.
- *Cost:* low–medium.

**5. HTML-in-Canvas [DOM shader]**
- *What it is:* live DOM rendered into a WebGL texture (`texElementSubImage2D`), so real post-processing works on the board and cards.
- *Runs on:* the real DOM, as pixels.
- *Browsers:* Chrome only, as an origin trial.
- *Cost:* medium.

**6. View Transitions [Transitions]**
- *What it is:* `document.startViewTransition` snapshots the old and new screens and animates between them with CSS.
- *Runs on:* whole screens or named elements.
- *Browsers:* Chrome and Safari; Firefox recently.
- *Cost:* low.

**Rule of thumb:** use the cheapest technique that looks right.
- CSS for anything on cards and buttons.
- Overlays and art shaders for scenery.
- HTML-in-Canvas only as a Chrome enhancement, always with a fallback.

---

## Card and collectible effects

| Effect | What it looks like | Where | How | Status |
|---|---|---|---|---|
| **Holo foil** | A rainbow band and fine sparkle texture that slides as the light moves, with a glare spot and a slight 3D tilt toward the pointer or phone tilt | Foil copies in the Nest, Rare+ pack reveals; later the card detail view and alt-art | [CSS] colour-dodge layers driven by pointer variables | ✅ v1 today |
| **Chrome / polished metal** | Mirror-like streaks that slide across a metal frame or lettering, like a chrome emblem | Legendary/Mythic frames, Rank S badge, title text, the "Golden Case" pack | [CSS] stacked linear gradients with hard stops and `background-clip:text` for lettering; the streak position follows the pointer. A truer chrome: [Art shader] with a matcap (a sphere-lit reference image) | 📝 |
| **Shine sweep** | One diagonal glint crossing the card or button | NEW cards, rewards, a button that becomes available | [CSS] moving masked gradient (partly live) | 🟡 partial |
| **Sparkle / glitter** | Tiny four-point stars twinkling at random spots | Foils, Mythic cards, first-clear badge | [CSS] a few pseudo-elements with randomised delays, or [Overlay] particles for many | 📝 |
| **Old paper / aging** | Yellowed parchment with fibre texture, foxing spots, darkened worn edges and torn corners | Name scrolls (✅ drawn), quest scrolls, lore pages, Hall of Fame "Antique" editions | [CSS] an `feTurbulence` noise image as a data URI, radial vignettes, edge masks; a sepia filter for Antique | 🟡 partial |
| **Embossed gold leaf** | Raised, shiny gold lettering and ornaments | Legendary names, Grace/Ecclesia frames | [CSS] layered text-shadows (highlight up-left, shadow down-right) plus a gold gradient fill; [SVG] `feSpecularLighting` for real emboss | 📝 |
| **Iridescent / pearl** | A soft shift between pastel hues by viewing angle, gentler than holo | Uncommon/rare frames, leader cards | [CSS] the holo recipe with a low-saturation conic gradient and `soft-light` | 📝 |
| **Stained glass** | Jewel-tone panes with dark lead lines and light shining through | Ecclesia/Grace cards, the Grace resource | [CSS] clip-path panes, or [Art shader] on the card art: Voronoi cells plus a glow | 📝 |

## Battle effects

| Effect | What it looks like | Where | How | Status |
|---|---|---|---|---|
| **Ripple / shockwave** | A ring of distortion expanding from an impact | Castle hit, big crits, a Swamp splash | Background only: [Overlay]. Real board distortion: [DOM shader] (Chrome) or a short [SVG] displacement pulse | 📝 |
| **Heat haze** | A wavering shimmer of the air | Fire cards, volcano and foundry maps, burning castle | Maps: [Art shader]/[Overlay] (✅ on maps). Over cards: [SVG] animated displacement on a small region, or [DOM shader] | 🟡 maps only |
| **Burn / dissolve** | The card burns away from the edges with glowing embers | Death, discard, "castle destroyed" | [Art shader] on the card art: a noise threshold plus a glowing edge band. Or [CSS] with an animated noise mask (cheaper, less glow) | 📝 |
| **Pixel shatter** | The card breaks into its own pixels, which fall and fade | Token deaths, "Exile" | [Overlay] 2D canvas: draw the card art, then animate blocks | 📝 |
| **Frost creep** | Ice crystals grow in from the edges | Frozen status | [CSS] masked crystal texture with an animated mask size | 📝 |
| **Chromatic split / glitch** | Red and blue edges split apart, with jittering slices | Shock status, Devilry cards, crits | [CSS] offset drop-shadows plus `clip-path` slice animation | 📝 |
| **Rim light / outline glow** | A bright edge around the active card | Selected, playable, the attacker this beat | [CSS] drop-shadow (live); [Art shader] rim on the art's alpha for pixel-perfect outlines | 🟡 |
| **Weather on the felt** | Rain splashes and ripples, drifting leaves, snow settling, a lane glow at your turn start | The battlefield, per map | [Overlay] under the cards (same system as the maps) | 🧪 chosen (#5) |
| **Hit-stop, shake, squash** | A frame freeze on big hits, screen shake, cards squashing on landing | All combat | [CSS]/GSAP (D16 polish) | 🟡 |

## Screens and transitions

| Effect | What it looks like | Where | How | Status |
|---|---|---|---|---|
| **Page curl** | A page turns with a curling corner and a shadow | Codex pages, quest log, lore, Home → map | Simple: [Transitions] plus a CSS 3D rotate with a moving shadow gradient (a "flip", not a true curl). True curl: [DOM shader] mesh (Chrome), or [Art shader] for pages that are images | 📝 |
| **Pixelate transition** | The screen blocks into big pixels, then resolves into the next screen | Entering a battle, map travel | [Transitions] with a stepped `filter`/mask; or [DOM shader] for a real pixelate | 📝 |
| **Ink wash / watercolour bleed** | New screens bloom in like ink on wet paper | Lore, faction choice, the end of the campaign | [Transitions] with an animated noise mask | 📝 |
| **Depth parallax** | A flat painting gains real depth: near things move more than far things as you tilt or move | Home and splash; later raid splash and map headers | [Art shader] plus a greyscale depth map per scene | 🧪 chosen (#2) |
| **God rays, bloom, fireflies** | Light shafts and glowing motes | Splash, Home, maps | [Art shader]/[Overlay] | ✅ |
| **Water, wind, caustics** | Moving water, swaying foliage | Splash, maps | [Art shader] (✅); a water mask image fixes the sky rippling | ✅ (mask 📝) |
| **CRT / film grain / vignette** | Retro screen or old-film looks | Optional "atmosphere packs" | [Overlay] noise plus CSS; [DOM shader] for real CRT curvature | 📝 |
| **Rain on glass** | Droplets running down the screen | The 🌧️ Rain atmosphere | [Overlay] 2D droplets with refraction faked by blur | 📝 |

---

## Chosen experiments (your picks, 2026-10-03)

1. **Holo foil, for ease and immediacy.** ✅ Shipped today, as CSS on the real card rather than WebGL.
   - Why CSS: every card can have it, it works in every browser, and it costs no GPU contexts.
   - Next steps:
     - put it on the card detail popover for foil cards;
     - add a variant per rarity: pearl for Rare, holo for Epic, "cosmos" with glitter for Mythic;
     - add it to alt-art (T6).
2. **Depth-map parallax, for scale.**
   - **Pipeline:** one depth image per painted scene, from a monocular depth model run offline, or painted by hand. Then a shader that offsets each pixel by depth × camera offset, with edge stretching kept small.
   - **Scale:** the same rig then works for every future painted backdrop: raid splashes, map headers, event banners.
3. **Weather on the battlefield (#5, interesting).**
   - Uses the existing map-overlay system, placed under the cards: rain with splash rings on wet maps, embers on fire maps, snow on the tundra, leaves in the forest.
   - Adds a soft lane glow at the start of your turn.
   - It reads the current battlefield background to choose the weather.

**Not chosen yet, but worth a Chrome-only spike later:** a HTML-in-Canvas castle-hit shockwave (the most "wow" per line of code).
