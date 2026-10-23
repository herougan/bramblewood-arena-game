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
| **Holo foil** | A rainbow band and fine sparkle texture that slides as the light moves, with a glare spot and a slight 3D tilt toward the pointer or phone tilt | Foil copies in the Nest and the card detail view, Rare+ pack reveals; later alt-art | [CSS] colour-dodge layers driven by pointer variables | ✅ v2: three rarity looks (pearl for Rare–Super Rare, rainbow for Epic–Quest Unique and foil commons, cosmos with twinkling glitter for Legendary+) |
| **Chrome / polished metal** | Mirror-like streaks that slide across a metal frame or lettering, like a chrome emblem | Legendary/Mythic frames, Rank S badge, title text, the "Golden Case" pack | [CSS] stacked linear gradients with hard stops and `background-clip:text` for lettering; the streak position follows the pointer. A truer chrome: [Art shader] with a matcap (a sphere-lit reference image) | ✅ gold-leaf rim with a sliding streak on Legendary+ cards (2026-10-04); badges and lettering 📝 |
| **Shine sweep** | One diagonal glint crossing the card or button | NEW cards, rewards, a button that becomes available | [CSS] moving masked gradient (partly live) | 🟡 partial |
| **Sparkle / glitter** | Tiny four-point stars twinkling at random spots | Foils, Mythic cards, first-clear badge | [CSS] a few pseudo-elements with randomised delays, or [Overlay] particles for many | 🟡 on cosmos foils |
| **Old paper / aging** | Yellowed parchment with fibre texture, foxing spots, darkened worn edges and torn corners | Name scrolls (✅ drawn), quest scrolls, lore pages, Hall of Fame "Antique" editions | [CSS] an `feTurbulence` noise image as a data URI, radial vignettes, edge masks; a sepia filter for Antique | 🟡 partial |
| **Embossed gold leaf** | Raised, shiny gold lettering and ornaments | Legendary names, Grace/Ecclesia frames | [CSS] layered text-shadows (highlight up-left, shadow down-right) plus a gold gradient fill; [SVG] `feSpecularLighting` for real emboss | 📝 |
| **Iridescent / pearl** | A soft shift between pastel hues by viewing angle, gentler than holo | Uncommon/rare frames, leader cards | [CSS] the holo recipe with a low-saturation conic gradient and `soft-light` | 📝 |
| **Stained glass** | Jewel-tone panes with dark lead lines and light shining through | Ecclesia/Grace cards, the Grace resource | [CSS] clip-path panes, or [Art shader] on the card art: Voronoi cells plus a glow | 📝 |

### Card treatment centre (2026-10-08)
The Effects Lab's **Card treatment centre** shows every print finish on the same card (pick the card, hover or auto-tilt to move the light). Classes are `is-holo holo-<name>` in `arena_template.html`; `decorateHolo()` adds the layers and the pointer drives `--hx --hy --hbx --hby`.

| Finish | Look | Status |
|---|---|---|
| Pearl | soft pastel sheen | ✅ live (Rare–Super Rare foils) |
| Rainbow holo | classic rainbow band | ✅ live (Epic–Quest Unique, foil commons) |
| Cosmos | deep-space band and twinkling glitter | ✅ live (Legendary and up) |
| Hex | honeycomb lattice that lights up in rainbow | 🆕 ready to assign |
| Etched | engraved metal lines on the frame only; the art stays clean | 🆕 ready to assign |
| Cracked ice | shattered-ice shards that flash as you tilt | 🆕 ready to assign |
| Gold leaf | warm gold sheen and gold rim (prestige/event) | 🆕 ready to assign |
| Reverse holo | rainbow foil on the frame, art left plain | 🆕 ready to assign |
| Prism | sharp prismatic facets that turn with the light | 🆕 ready to assign |
| Aurora (`holo-aurora`) | slow northern-lights curtains of green, teal and violet | 🧪 Lab only (2026-10-14) |
| Galaxy swirl (`holo-galaxy`) | violet and blue spiral arms turning around the light over a star field | 🧪 Lab only |
| Molten gold (`holo-molten`) | hot gold sheen, glowing rim, liquid gold dripping from the top edge | 🧪 Lab only |
| Frost crystal (`holo-frost`) | fern-like ice crystals grow in from the corners and thaw, over a cold sheen | 🧪 Lab only |
| Oil slick (`holo-oilslick`) | thin-film rainbow in organic blotches that slide with the light | 🧪 Lab only |
| Sakura (`holo-sakura`) | pink sheen with cherry petals drifting down the card | 🧪 Lab only |
| Glitter field (`holo-sparkle`) | dense multicolour glitter flashing where the light falls, plus glints | 🧪 Lab only |
| Holo scanlines (`holo-scanline`) | fine scanlines, a rolling bright bar and the odd flicker | 🧪 Lab only |

The Lab-only finishes live in `tools/effects-lab/lab-foils.css`. Molten gold, Sakura, Glitter field and Frost crystal also need a `.foil-fx` child layer, which the Lab's `decorateLabFoils()` adds; to ship one, copy its CSS block into `arena_template.html` and have `decorateHolo()` add the same `.foil-fx` markup.

The same finishes can be previewed in game from **Codex → 🔍 View large** (admins see all of them; players see Plain and the foil they own). There the light is driven by the card's turn (trig on the spin angle) rather than the pointer.

## Battle effects

| Effect | What it looks like | Where | How | Status |
|---|---|---|---|---|
| **Ripple / shockwave** | A ring of distortion expanding from an impact | Castle hit, big crits, a Swamp splash | Background only: [Overlay]. Real board distortion: [DOM shader] (Chrome) or a short [SVG] displacement pulse | ✅ floor ring (`layer.wave`); 🧪 DOM ring that blurs and brightens what's under it and shoves nearby cards (`SkillFX.shockwave`, Lab, 2026-10-14) |
| **Heat haze** | A wavering shimmer of the air | Fire cards, volcano and foundry maps, burning castle | Maps: [Art shader]/[Overlay] (✅ on maps). Over cards: [SVG] animated displacement on a small region, or [DOM shader] | 🟡 maps only |
| **Burn / dissolve** | The card burns away from the edges with glowing embers | Death, discard, "castle destroyed" | [CSS]: a ragged-edge SVG mask slides up through the card, a matching glow line rides the edge, embers lift off (`burnAwayVfx`). An [Art shader] noise version would look richer | ✅ card deaths and the falling castle (shudder + dust + burn under the Victory/Defeat sign), 2026-10-04. Discards keep their fly-to-pile animation (a pitch isn't a death) |
| **Pixel shatter** | The card breaks into its own pixels, which fall and fade | Token deaths, "Exile" | [Overlay] 2D canvas: draw the card art, then animate blocks | 📝 |
| **Frost creep** | Ice crystals grow in from the edges | Frozen status | [CSS] masked crystal texture with an animated mask size | 📝 |
| **Chromatic split / glitch** | Red and blue edges split apart, with jittering slices | Shock status, Devilry cards, crits | [CSS] offset drop-shadows plus `clip-path` slice animation | 📝 |
| **Rim light / outline glow** | A bright edge around the active card | Selected, playable, the attacker this beat | [CSS] drop-shadow (live); [Art shader] rim on the art's alpha for pixel-perfect outlines | 🟡 |
| **Weather on the felt** | Rain splashes and ripples, drifting leaves, snow settling, a lane glow at your turn start | The battlefield, per map | [Overlay] under the cards (same system as the maps) | ✅ v1 (rain + splash rings on wet maps, map looks elsewhere, your-turn lane glow) |
| **Lit felt (texture + lighting)** | The battlefield cloth has a woven surface with real normals, lit by a warm lamp that drifts and leans toward the pointer | Every battle | [Overlay] shader: a procedural height field → normal → diffuse light (`u_felt`) | ✅ v1 (2026-10-05) |
| **Impact lights** | Each hit briefly lights the felt around the target, coloured by damage type (warm/orange/blue/green), bigger for castle hits and heavy blows | All combat, fire deaths | [Overlay] shader point lights (`layer.flash`, up to 4 at once) | ✅ v1 (2026-10-05) |
| **Hit-stop, shake, squash** | A frame freeze on big hits, screen shake, cards squashing on landing | All combat | [CSS]/GSAP (D16 polish) | 🟡 |

## Screens and transitions

| Effect | What it looks like | Where | How | Status |
|---|---|---|---|---|
| **Page curl** | A page turns with a curling corner and a shadow | Codex pages, quest log, lore, Home → map | Simple: [Transitions] plus a CSS 3D rotate with a moving shadow gradient (a "flip", not a true curl). True curl: [DOM shader] mesh (Chrome), or [Art shader] for pages that are images | 📝 |
| **Pixelate transition** | The screen blocks into big pixels, then resolves into the next screen | Entering a battle, map travel | [Transitions] with a stepped `filter`/mask; or [DOM shader] for a real pixelate | 📝 |
| **Ink wash / watercolour bleed** | New screens bloom in like ink on wet paper | Lore, faction choice, the end of the campaign | [Transitions] with an animated noise mask | 📝 |
| **Depth parallax** | A flat painting gains real depth: near things move more than far things as you tilt or move | Home and splash; later raid splash and map headers | [Art shader] plus a greyscale depth map per scene | ✅ v1 on the splash and Home (hand-authored depth map) |
| **God rays, bloom, fireflies** | Light shafts and glowing motes | Splash, Home, maps | [Art shader]/[Overlay] | ✅ |
| **Water, wind, caustics** | Moving water, swaying foliage | Splash, maps | [Art shader]; the splash's water mask (green channel of `art/splash_depth.png`, from `tools/make_splash_depth.py`) keeps the ripples and glints on the river only, so blue birds and flowers stay still | ✅ (mask ✅ 2026-10-04) |
| **CRT / film grain / vignette** | Retro screen or old-film looks | Optional "atmosphere packs" | [Overlay] noise plus CSS; [DOM shader] for real CRT curvature | 📝 |
| **Rain on glass** | Droplets running down the screen | The 🌧️ Rain atmosphere | [Overlay] 2D droplets with refraction faked by blur | 📝 |

---

## Chosen experiments (your picks, 2026-10-03)

1. **Holo foil, for ease and immediacy.** ✅ Shipped today, as CSS on the real card rather than WebGL.
   - Why CSS: every card can have it, it works in every browser, and it costs no GPU contexts.
   - ✅ 2026-10-04: on the card detail view for foil cards (with a ✨ Foil chip), and one look per rarity band: pearl, rainbow, cosmos (`holoClass(d)`).
   - Next: add it to alt-art (T6).
2. **Depth-map parallax, for scale.**
   - **Pipeline:** one depth image per painted scene, from a monocular depth model run offline, or painted by hand. Then a shader that offsets each pixel by depth × camera offset, with edge stretching kept small.
   - **Scale:** the same rig then works for every future painted backdrop: raid splashes, map headers, event banners.
3. **Weather on the battlefield (#5, interesting).**
   - Uses the existing map-overlay system, placed under the cards: rain with splash rings on wet maps, embers on fire maps, snow on the tundra, leaves in the forest.
   - Adds a soft lane glow at the start of your turn.
   - It reads the current battlefield background to choose the weather.

**Not chosen yet, but worth a Chrome-only spike later:** a HTML-in-Canvas castle-hit shockwave (the most "wow" per line of code).

---

## Recommendations: what to add next (Claude's opinion, 2026-10-05)

**The principle behind the order:** spend effort where the player's eyes and ears already are. That means:
- **the board during combat**, where they spend about 70% of their time;
- **reward moments** (packs, levels, the Hero);
- **the cards themselves**, not menus.

Each list is ranked by payoff for effort. ✅ marks the ones built today as a first taste of each list.

### Animation (GSAP and CSS)

| # | Add | Why it matters | Effort |
|---|---|---|---|
| A1 ✅ | **Anticipation and follow-through on attacks:** a 90 ms lean back before the lunge; the target squashes about 6% and recoils; on heavy hits, a 50–70 ms hit-stop (both cards freeze) | This is the single biggest thing that makes hits feel heavy. Today the lunge starts and ends cleanly, which reads as "moved", not "struck" | S. It lives in `animateAttacker`; the hit-stop is a GSAP timeline pause |
| A2 ✅ | **Better damage numbers:** they arc up and away from the attacker, scale with damage, a crit stamps in with a slight rotation, and poison ticks are smaller and green | The numbers carry the outcome; right now they're readable but flat | S |
| A3 | **Idle life on the board:** each card breathes about 1 px, out of phase with the others, and blinks its Wait ring when it's about to act | A still board looks paused. This must animate the *inner* `.card-tile` only, so the snap guard isn't fooled | S |
| A4 | ✅ **Hero moments:** a crystal forms over the craft button, spins and drops (tinted by kind); the Hero card lifts inside a rotating gold ring the next time you open the Hall after a level-up | It's the newest feature and the only progress the player built themselves. It should feel like a ceremony | Built |
| A5 ✅ | **Pack reveal build-up by rarity:** light leaks from the pack's seams before it bursts (gold for Legendary+), with a half-second "held breath" for Rare+ | Gacha feel is mostly the wait before the reveal | M |
| A6 | **The map pawn walks:** your token walks the dotted path to the next node and does a little hop on arrival | The Conquest map currently teleports you between nodes | M |
| A7 ✅ | **Wait countdown flip:** the ⏳ ring flips like an hourglass when Wait ticks down | It teaches the Wait rule without any text | S |

### Shaders ("OpenGL": textures and lighting)

| # | Add | Why it matters | Effort |
|---|---|---|---|
| G1 | ✅ **Shockwave on the felt:** castle hits and blows of 8+ send a ring of light, with a dark trough behind it, rolling across the battlefield in the damage colour (`layer.wave`, `u_wave`) | It's the "wow" moment of combat, and it reuses the light pipeline | Built |
| G2 ✅ | **Card shadows on the felt:** the shader gets the card rectangles (up to 12 as uniforms) and draws soft shadows away from the lamp, which moves with the pointer | This is what makes the felt read as a table with objects on it rather than a backdrop. The biggest depth win available | M |
| G3 ✅ | **A material per map:** a wet sheen with specular highlights on Swamp and Coral, charred ash cracks glowing on Ashen Peak and the Foundry, frost on the Tundra, sand ripples on the Savanna. It's one `u_material` switch in the felt code | Every map currently has the same cloth or plain light. A material makes each map feel like a place you're standing on | M |
| G4 | **Noise dissolve for deaths:** an art-shader burn that eats the actual card art along noise, replacing the CSS ragged mask | Richer than today's burn, but the CSS version already works | M–L |
| G5 ✅ | **Volumetric lamp in the caves:** the fog thickens away from the pointer lamp, and cards outside the light go dim | The caves would feel like a dungeon. It fits the lore | S |
| G6 | **Heat haze over fire cards:** an SVG displacement over a small region while a heat card is on the board | Lovely, but Safari is unreliable and it costs more | M |

**Performance guard:** every item stays inside the existing single overlay canvas (no new WebGL contexts) and switches off under the low-memory default.

### Sound (Web Audio, then real samples)

| # | Add | Why it matters | Effort |
|---|---|---|---|
| S1 | ✅ **Stereo position:** hits and deaths are panned to where they happen on screen (`SoundKit.at(el, fn)`) | You can *hear* which lane took the hit. A cheap, big gain on headphones | Built |
| S2 | ✅ **Richer hits:** a thwack with ±8% random pitch so exchanges don't sound looped; heavy blows add a low boom and a crack (`SoundKit.hitAt`) | The old hit was a single square-wave beep, the most-played and weakest cue we had | Built |
| S3 | **Swap the top 5 cues for CC0 samples:** card play, draw, light hit, heavy hit and death, from Kenney's Impact and Casino packs, each with 2–3 variants | Synthesis has hit its ceiling for "physical" sounds. Real recordings of card on felt and wood on wood will sound better than any oscillator. **Needs you to drop the files into `audio/`;** I can't download from this workspace | S once the files are in |
| S4 ✅ | **Ducking:** ambience dips about 6 dB under castle hits, deaths and fanfares, then breathes back | Makes the big moments land without making them louder | S |
| S5 ✅ | **Danger layer:** a soft heartbeat under 25% castle HP, and a sudden-death stinger at turn 20 | It signals tension without the UI having to shout it | S |
| S6 ✅ | **Rival voices:** a short Animal-Crossing-style babble per people (clipped and low for the Legion, chirpy and fast for the Sunfeathers, sly and nasal for the road-folk) under the taunt bubbles and opener | It gives rivals presence (immersion #3) cheaply, and it builds on the existing `voiceTone` | M |
| S7 ✅ | **Music, at last:** a generative loop per people (Legion: frame drum and low brass drone; Sunfeathers: pan flute, shakers and claps; Road-folk: plucked strings and an accordion-like reed), which gets busier as the castles drop | It's the one big audio gap. It waits on your D17 call (cosy, chiptune or mixed) | L |
| ✅ | **Hero cues:** a glassy crystal forming for Materia (`materiaForm`), a rising bell arpeggio for a level-up (`heroLevel`) | They go with A4 | Built |

**Built 2026-10-05, later:**
- A1: struck cards squash and recoil; heavy blows get a 70 ms hit-stop, skipped at fast speed.
- A2: chunky gradient damage numbers.
- G2: card shadows on the felt.
- S4: ambience ducking.
- S5: a heartbeat and a red edge under 25% castle HP, faster under 10%, plus a sudden-death sting.

**Built 2026-10-05, night:**
- G3: terrain floors get a material. Wet maps have slow specular glints; fire, foundry and storm maps have ember cracks that breathe; the tundra has frost bloom with glittering crystals; the savanna has faint sand ripples.
- A5: light rays leak from the pack before it bursts, coloured by the best card inside (blue Rare, violet Epic, gold Legendary+). Each Rare+ card glows and holds for 0.5–0.75 s with a rising shimmer before it flips. Reveal all skips the wait.
- S6: rivals babble their taunt in the versus opener, with a voice per people (`SoundKit.babble`). It's seeded by the line and rides the Voice slider.

**Built 2026-10-07, evening:**
- A7: a small ⏳ turns over above the Wait badge each time Wait ticks down (Low effects and up).
- G5: in cave fights the dark closes in away from your pointer and cards outside the lamplight dim by about 30% (Medium and up; `mountCaveLamp`).
- S7: battle music (`BattleMusic`), synthesised live. The rival's people picks the band: Legion frame drum and brass drone, Sunfeather pan flute, shaker and claps, Road-folk plucked strings over a reed; beasts, the Deep, the hive and plain folk borrow the nearest band. It builds in three steps (percussion from round 5 or a castle under 60%; bass and a busier tune in sudden death or under 30%), rides the 🎵 slider, ducks under big moments, and has its own Settings switch (🎼 Battle music).

### What I'd do next, in order (original list)
1. A1 (anticipation and hit-stop).
2. G2 (card shadows).
3. S4 + S5 (ducking and the danger layer).
4. S3, as soon as you add sample files.
5. G3 (map materials).
6. S6 (rival voices).

That covers about two sessions. A1, G2 and S4 together will change how a fight *feels* more than anything else on these lists.


---

## 2026-10-06 additions

**Skill effects:** `bramblewood-skillfx.js` is shared by the game and the Effects Lab.
- **Arrow and Fire Arrow (live).** The full sequence:
  - **Draw:** the archer leans back while the arrow is pulled along the line of fire, with a bow creak; fire arrows light a flickering flame at the tip.
  - **Release:** the archer snaps forward and recoils, and a bowstring ring pops.
  - **Flight:** an arcing, accelerating arrow; fire arrows leave an ember trail.
  - **Impact:** the arrow sticks and quivers, the target is knocked back and splinters fly. Fire arrows add a flame burst, an ignite ring and a scorched edge. The battlefield floor lights up at the impact.
- **Prototypes, not wired into skills yet:** Volley, Pierce, Poison dart, Frost bolt, Chain lightning, Heal, Shield up, Rally.

**Cards (live):**
- **Crits:** the number is bigger and hotter on a spinning gold starburst, and a CRIT! stamp lands on the card. This replaces the separate "💥 Crit!" text.
- **Typed damage:** the icon sits beside the number, so the gradient no longer washes it out: ☠️ poison, 🩸 bleed, 🔥 fire, ❄️ cold, 🧪 acid, 🛡 blocked.
- **Normal death:** the card topples back, greys out and crumbles into leaves and dust. The red bleed-out is now only for bleed deaths.
- **Heal sound v2:** a warm rising chord with a sparkle on top.
- **Card face:** names sit at the top of the card; ability badges sit between the Attack and Health chips; the 🪽 wing is 20% larger; cost and Wait show as pips (one log per Lumber, one hourglass per turn), with a number only past 4.

**Card prototypes (Lab only):** summon slam, hourglass flip on Wait, idle breathing, shine sweep, ready pulse.

**Board ambience (live, late morning):**
- **Castle cracks:** three crack layers at ≤66%, ≤33% and ≤15% castle Health. Each new crack lands with a jolt and a puff of masonry dust (`crackStage`, `updateCastleCracks`).
- **Low-HP tremble:** a unit at ≤25% Health shivers every couple of seconds, and its Health number turns red (`isLowHp`, `.is-low-hp`).
- **Idle breathing:** board units bob 1.5px, out of step with each other. Stunned, frozen and sleeping units hold still.
- **Ready pulse:** already live as the gold `readyPulse` when Wait reaches 0; the Lab now marks it live.
- All three use the CSS `translate` property and `:where()` selectors. That way they never fight GSAP's `transform` tweens, and they never override other card animations.

**Battle atmosphere (live, afternoon):**
- **Sudden-death red sky:** from turn 20 the battlefield's sky bleeds red and pulses slowly, so the rule change stays visible after the banner (`suddenDeathSky`).
- **Storm lightning:** on storm and rain battlefields, a bolt lights the field every 9–22 s (storm) or 18–40 s (rain). It's a soft double flicker plus a white shader light up high, and thunder follows half a second later. Ambience no longer rolls its own thunder during a fight. It's deliberately gentle (two flickers, low peak, flicker off with reduced motion), so it never strobes (`lightningStrike`).
- **Card drag trail:** a faint gold sparkle trail follows a dragged hand card (`dragTrail`).

**Status and death touches (live, late afternoon):**
- **Frost creep:** ice crystals grow in from the corners of a frozen unit, with a cold rim light. This is CSS on the board card's `::after`, so it follows the `is-frozen` class.
- **Chromatic glitch:** a 380 ms RGB split and jitter when Shock lands (`glitchVfx`).
- **Feather burst:** a flying unit sheds a few 🪶 when hit, with a soft papery `featherFlutter` cue (`featherBurst`).
- **Pixel shatter:** a token breaks into a 4×5 grid of clipped copies of itself that scatter and fade. It has its own chiptune `pixelShatter` cue. Fire still burns tokens away (`pixelShatterVfx`).
- **Tool:** `tools/effects-lab/sync_fx_src.py [--add fnA,fnB]` refreshes the Lab's copy of game functions.

**Match moments (live, evening):**
- **Deck shuffle:** at the start of a match, both decks split and riffle together twice after the versus opener closes. It has its own `riffle` cue (`maybeDeckShuffle`, `deckShuffleVfx`).
- **Leader throne:** a summoned leader rises on a pillar of light, a crown drops onto it, and a `leaderFanfare` plays (`leaderThroneVfx`).
- **Water ripples:** on water and rain battlefields, a card that lands sends a soft blue ring across the shader floor (`waterRippleAt`).
- **Snap fix (night):** a just-landed card sometimes jumped about one slot sideways. The cause: its pin was released while a neighbour in the same row was still pinned mid-Flip. The card measured its slot with that neighbour out of flow, glided there, and then jumped when the neighbour landed. Both pin releases (`releaseNewElRects`, `settleStrayBoardCards`) now wait, frame by frame and for up to about 1.2 s, until no card in the row is still pinned and moving. A card whose pin is waiting and already at rest is released together with the others. Before the fix the phone Map 2 run failed about 1 in 3; after it, 8 of 8 runs were clean. `tests/e2e/snaps_debug.py` prints a per-frame history for any future jump.

**Hand and finish (live, past midnight):**
- **Draw flip:** a card that comes into your hand flies out of your deck face down and flips face up in its slot. The opening hand deals one by one after the shuffle (`drawFlipNewHandCards`, `drawFlipVfx`).
- **Victory parade:** under the Victory sign, the winning side's survivors hop in a wave from left to right, each raising a 🚩, before the dance (`victoryParade`).

**Heat haze (live, 2026-10-07):** fire and volcanic units have hot air shimmering up off the card: two faint wavy bands drifting upward, using transform and opacity only (`isFieryDef`, `.heat-haze`).

**Map and raid (live, 2026-10-07 morning):**
- **Walking map pawn:** your avatar stands on the Conquest map at the skirmish you last picked (or your next one) and hops node to node when you pick another, with soft `pawnStep` footfalls (`placeMapPawn`).
- **Raid telegraph glow:** in the trench, the boss tile glows red and a pulsing ⬇ points down the lane its column attack will hit, on top of the existing red lane.

**Transitions (live, 2026-10-07):**
- **Codex page turn:** switching Codex sections swings the new page in from the right (forward) or the left (back), with a sweeping shadow and a papery `pageTurn` swish.
- **Pixel reveal:** a battle without a versus opener appears through a grid of dark squares cleared in a random, centre-first order. It's one tiny canvas scaled up with `image-rendering: pixelated` (`pixelReveal`).

**Leaf sweep, third pass (2026-10-07):** each leaf travels at an even pace from 20% past the left edge to 10% past the right. Its height rides its own sine wave (random amplitude, wavelength and phase). Leaves start at random moments over about 0.7 s, at heights spread down the screen, and each tumbles at its own rate. The leaves no longer converge on a mid-screen point. Played with the Web Animations API on transform and opacity.

**List two, built (2026-10-07 afternoon):**
- **Raindrops on cards:** on water and rain fields, droplets slide slowly down each card's art. It's a `.rain-drops` layer moved by transform, with a different speed for each card. High effects only.
- **Boss entrance:** as a boss's versus opener closes, a ground quake plays, dust rings the enemy castle, a shader shockwave fires, a "BOSS · name" title card sweeps across, and a new `bossRumble` cue plays (`bossEntrance`).
- **Coin shower:** on the results screen, each currency's glyph rains into its pill one at a time, and the pill pops as each lands (`rewardsCheer`).
- **Seasonal maps:** a soft seasonal vignette on the Conquest map (autumn warm, winter frost, spring blossom, summer haze), chosen by calendar month. `?season=winter` previews one.
- **On hold:** card tilt in hand, because the style guide keeps the magnetic tilt out of the hand strip, where it fights drag and selection. The combo counter waits on your decision.

## 2026-10-10 additions: sound, music and skill library

**Music: the Songbook (live).** Composed place themes, played by synthesised instruments (reed, fife, brass, music box, flute, harp, pluck, bass, drone, anvil, snare tap), so the whole library is royalty-free by construction: no samples, no licences. Each theme loops its written melody over a chord plan with small variations on repeats (an octave lift on the last phrase, the odd grace note), takes a breath between loops, and crossfades when you change place. Volume rides the Menu music bar. `Songbook.render(key, secs)` renders any theme offline (the Effects Lab and previews use it).

| Theme | Place | Feel |
|---|---|---|
| Flour and Copper | Shop, Flea Market | 3/4 accordion waltz, oom-pah-pah, 132 bpm, D major |
| Tent Pegs | Armoury | Fife-and-drum march, 104 bpm, G mixolydian |
| Bellows | Forge | Low brass over a drone; the anvil rings on 1 and 3; 84 bpm, D dorian |
| Down Feather | Nest | Music-box lullaby, 66 bpm, F major |
| Margins | Codex | Harp arpeggios under a slow flute, 76 bpm, A minor |

Home keeps CalmMusic's endless improvising piano; battles keep BattleMusic's seven bands (one per people) at three intensities. The Effects Lab's new **Music** tab previews all of it (battle bands at any intensity).

**Sound effects (12 new, all synthesised):** Shield Call drop (thud + ring), Backstab (sidestep whoosh + slice), Boomerang whirr (out and back), Shelf pick (wood tap + jar clink), Pay at the counter (coins + bell), Map unrolls (parchment), Mystery Booster boing, Tape rip, Bow creak, Burn away, Ice shatter, Night swell. Wired: Shield Call, Backstab, Anti-Air hits, shelf clicks, every purchase, the Mystery Booster, the map veil, nightfall and cold deaths.

**Skill effects (SkillFX, live in battle and in the Lab's Skills tab):**
- **Anti-Air boomerang:** a hit on a flier from an Anti-Air unit throws a spinning boomerang on a low curve; feathers fly; it swings back on a higher one.
- **Shield Call:** a big shield drops from above into the slot, squashes on landing with a dust ring.
- **Backstab:** a dagger flashes in from the attacker's side and leaves a thin red slash.
- **Element deaths:** cold deaths shed ice shards, poison deaths drip green (on top of the existing burn-away for heat).

**Still sketches (VFX Playground):** cream pearl foil shader on cards, living ink rarity frame, DrawSVG claw/bite marks, shield-to-thorns morph, SplitText titles, time-of-day map grading, chaos-returns map sketch.

## 2026-10-14 additions: more skill effects, foils and general effects (Effects Lab)

User: "on our effects lab, add more effects, more skill effects, more foil vfx." Everything below is playable in the Effects Lab and not wired into battles yet. The skill and general effects are new functions in `bramblewood-skillfx.js` (shared with the game), each named after a real skill key. They inject their own small stylesheet once (`#sfx-more-css`, classes `sfx-*`), so the game can call them without template changes. Every layer is removed when the effect ends. With reduced motion (or without GSAP) the motion is skipped and the callbacks still fire.

**Skill effects (16, Skills tab → "More skills"):**

| Skill (key) | Function | Look |
|---|---|---|
| 🐜 Swarm (`swarm`) | `SkillFX.swarm(attacker, target)` | A buzzing cloud lifts off the attacker, converges on the target, mobs it, then scatters |
| 💚 Regeneration (`regen`) | `SkillFX.regen(target)` | Green motes spiral in from around the card; a glowing stitch knits it closed |
| ☠ Poison (`poison`) | `SkillFX.poisonCloud(target)` | Green puffs billow up around the card, bubbles rise, the card sickens for a beat |
| 🩸 Bleed (`bleed`) | `SkillFX.bleedDrip(target)` | A quick red cut; drops swell on the lower edge, fall and splat |
| 🌵 Thorns (`thorns`) | `SkillFX.thorns(defender, attacker)` | Spikes burst toward the attacker, who is stung and knocked back |
| 🌎💥 Earthquake (`earthquake`) | `SkillFX.earthquake(cards, {host})` | The board rumbles; cracks tear open under each card and they jump in dust |
| 👢 Quick (`quick`) | `SkillFX.quickStrike(attacker, target)` | Speed lines and afterimages as the attacker darts in, strikes and darts back |
| 🍃 Evasive (`evasive`) | `SkillFX.evasiveDodge(target, {fromLeft})` | A blink sidestep with an afterimage; leaves flutter and "Miss!" pops |
| 🪓 Cleave (`sweep`) | `SkillFX.cleave(attacker, targets)` | One wide glowing arc swept across the row; each card is hit as the blade passes |
| 🛡 Guardian (`guardian`) | `SkillFX.guardian(target, {dir})` | A hex shield wall rises in front of the card and pulses twice |
| 🧨 Dynamite (`dynamite`) | `SkillFX.dynamite(thrower, target, {host})` | A lit stick is lobbed and fizzes, then blows: flash, fireball, smoke, debris, a rumble |
| 🪖 Helmet (`helmet`) | `SkillFX.helmetDeflect(target, {from})` | A helmet flashes up; a bright ping, sparks, a chip skips away |
| 👁️ Darksight (`darksight`) | `SkillFX.darksight(target, {targets})` | The card darkens, two glowing eyes open and glance about, and foes are marked |
| 🥶 Frostbite (`frostbite`) | `SkillFX.frostChill(target)` | An icy breath rolls across, flakes settle, rime creeps in from the edges |
| 🔥 Immolation (`immolation`) | `SkillFX.scorch(target)` | Flames lick up from the lower edge in a heat shimmer; embers rise, the edge chars |
| 🏮 Lantern (`lantern`) | `SkillFX.lanternGlow(target, {cards})` | A lantern swings above the card and casts a warm, flickering pool; moths circle |

**General effects (5, Card ideas tab):**
- **Shockwave ripple** (`SkillFX.shockwave(xOrEl, y, {cards})`): a ring of rippled, brightened air (a `backdrop-filter` ring) rolls out, and cards in its path are shoved outward as it passes. For castle hits and big crits.
- **Castle crumble** (`SkillFX.castleCrumble(castle, {variant})`), three variants. *Collapse:* the tower breaks into three bands that tumble down. *Sink:* it shudders and sinks into the ground in dust. *Topple:* it leans over its foot and crashes.
- **Level-up burst** (`SkillFX.levelUp(target, {text})`): gold rays turn behind the card (a card-shaped hole keeps the art clear), it pops, a LEVEL UP! ribbon stamps on and stars rise.
- **Card unlock sparkle** (`SkillFX.unlockSparkle(target)`): a greyed card's padlock shakes and springs open, colour floods back with a glint, and sparkles burst out.
- **Skirmish sky-drop** (`SkillFX.skyDrop(cards, {onEachLand})`): cards fall from the sky one after another, their shadows growing on the ground, and land with a squash and a dust ring.

**Foils (8, Foils tab, marked Lab):** Aurora, Galaxy swirl, Molten gold, Frost crystal, Oil slick, Sakura, Glitter field, Holo scanlines. See the treatment table above.


## 2026-10-15 additions: 29 more skill effects, wired into fights (eighth pass)

User: "widen the effects list we have." An audit of every skill in the registry (182) and every replay event the engine
pushes found that most skills on real cards still showed only a floating word. This pass adds 29 new `SkillFX` functions
(`bramblewood-skillfx.js`, section "eighth pass", own stylesheet `#sfx-eighth-css`, classes `sfx-*`) and wires every one
into the fight replay through `eighthPassVfx(ev)` in `arena_app.js` (called from `renderVfxForEvent`, next to `labSkillFx`).

Rules they follow: each lasts about a second or less; they play on Medium effects and up, never with reduced motion; the
ones that can repeat play at most once per unit per round (`skillFxOnce`); they are fire-and-forget and never hold up the
replay. On-hit looks are timed to land with the damage number (`eighthHitAtMs`, the same windup/projectile/arrow timing the
hit itself uses). The Admin → 🔬 Effects library shows them on its live stage (it runs the same replay); Prayer and Esprit
got stage setups so their moment happens there. The hub's Effects Lab has a button for each (Skills tab → "Even more
skills", grouped Air & water / Weapons / Defence / Statuses / Support), plus buttons for the 2026-10-14 sixth/seventh-pass
effects that had none (Fireball, Meteor, Banana, Munch, Smoke Bomb, Psychic).

**Coverage (skills in the registry, 182):** before, 61 had their own effect, 81 only a floating word or sound, 40 have no
moment to show (a static rule or stat). After: **105** own effect, 37 floating word only, 40 none. Weighted by how many
cards carry each skill (effects keys in `canonical/cards.json`): own effect 437 → **633**, word-only 251 → **55**.

**The new effects:**

| Effect | Function | Look | Plays on (replay event) |
|---|---|---|---|
| 🦅 Flying swoop | `swoop(attacker, target, {flight})` | A bright air-trail climbs over the field and dives onto the target; feathers fly | `hit`, melee, attacker has Flying (not Quick/Swarm, which have their own); once a round |
| 🪁 Tailwind gust | `gust(target, {dir})` | Wind streaks across the card; it leans with them | `statusFx` `tailwind` |
| 🏊 Swimmer splash | `splash(target)` | Blue rings at its foot, droplets thrown up and falling back, a bob | `tide` (flow): every Swimmer on the board; `statusFx` `swimmer` |
| 🛡️ Armor block | `armorBlock(target, {from, partial, shatter})` | A steel plate flashes over the card with a glint; sparks off the struck edge; a 🛡️ on a full block | `hit` with `armorBlocked` (full), or on an Armored unit (partial, once a round) |
| 🪓 Armor shred | `armorBlock(.., {shatter})` | The plate breaks into chips that fall away | `statusFx` `armorShred` (Perforate) |
| 🔱 Fork prongs | `forkProngs(attacker, targets, {kind})` | Steel tines (2 for Fork, 3 for Trident, 4 for Pitchfork, purple tentacles for Octolash) thrust in and pull back | `hit` with `fork` (Fork, Trident, Pitchfork, Octolash) |
| ➹ Pierce through | `pierceThrough(target, {from})` | A lance of light punches through; chips fly from the exit | `hit` with `rend` (Pierce/Puncture through Armor); `pierceHQ` on the castle |
| 💫 Stun stars | `stunStars(target, {glyph})` | Glyphs wheel round the card's head while it wobbles | `statusFx` `stun`, `stunOnHit` (★), `stagger` (✦), `confuse` (❓), `tipsy` (🫧) |
| 🧊 Freeze | `freezeEncase(target)` | Ice grows up over the card, cracks spider across, it glazes away | `statusFx` `freeze` |
| 💤 Sleep | `sleepZzz(target)` | The card dims and sways; three Z's float up | `statusFx` `sleep`, `coffeeCrash` |
| ⚡ Paralyze | `paralyzeSpark(target)` | Yellow sparks crackle round the edges, redrawn each flicker; it twitches | `statusFx` `paralyze` |
| 🧪 Corrode | `acidCorrode(target)` | Acid runs down the card, fizzing, yellow-green tint | `statusFx` `corrode`, `ichor` |
| 🖤 Blind | `blindInk(target)` | Ink splats across the card's eyes and drips away | `statusFx` `blind` |
| 😨 Daunt | `fearShiver(target)` | A cold purple pall; it shivers; a bead of sweat flies off | `statusFx` `daunt`, `cower` |
| 🜏 Weaken / curse | `curseDrain(target)` | Dark tendrils climb the card and wring the colour out | `statusFx` `debuffAttack`; `render`; `curseTick` |
| 🎯 Expose | `targetMark(target)` | A red crosshair spins in, locks on, flashes | `statusFx` `expose`; `hit` by an Expose unit (once a round per target) |
| ⏳ Wait clock | `clockTick(target, {dir})` | A clock pops up; the hands drag round (more Wait) or race (less) | `statusFx` `addWait` (slow), `coffee` (fast) |
| ⚔️ Counter parry | `parry(defender, attacker)` | Blades cross with a ping; the riposte shoves the attacker | `statusFx` `counter` (Counterattack) |
| 🪞 Reflect | `mirrorFlash(defender, attacker)` | A mirror sheen sweeps the defender; a beam snaps back | `reflect` |
| 👑 King Slayer | `crownCrack(target)` | A crown pops over the King and cracks in two | `kingSlayer` |
| 👻 Stealth slip | `stealthSlip(attacker, castle)` | It melts into shadow; a dark afterimage slips to the castle | `hitHQ` by a Stealth unit |
| 🐾 Scar claws | `scarMark(target, {fromLeft})` | Three claw marks rake across and glow red | `statusFx` `scar` (once a round per target) |
| 🩸 Sap drain | `lifeDrain(from, to)` | Red motes are pulled out of the unit it hit and stream into it | `sap` (from the last unit that attacker hit) |
| 🌸 Bloom pollen | `bloomPollen(src, target)` | Petals and pollen drift from the flowering card to the healed ally | `heal` from a Bloom unit to another |
| 🤝 Esprit aura | `espritAura(target)` | Golden chevrons rise up through the card in a gold ring | `statusFx` `esprit`, `grit`, `inspired`; `namedBuff` (Buff action) |
| 😡 Berserk | `rageFlare(target)` | Red steam vents, an anger mark pops, the card shudders | `statusFx` `berserk` (Berserk, Hive Mind); `frenzy` (Frenzy, Twin Strike) |
| ✨ Revive | `reviveRise(target)` | A pillar of light falls; the card lifts out of grey with sparkles | `revive` |
| 🥚 Summon | `summonPortal(target)` | A green rune circle spins open under the new card and it pops in | `spawn` (Brood, Twin, Progeny/On Death spawns, Meiosis, Spawn action), not Shield Call |
| 🪵 Lumber gain | `lootArc(from, to, {glyph, n})` | Logs hop from the card to your Lumber pill (or the enemy castle) | `lumber` with a source card (On Ready/Spawn Lumber, Worthy) |
| 🕊️ Prayer | `prayerLight(target)` | A beam of light falls on the card and a dove rises | `play` of a Prayer card; `grace` from a card |

Also wired (existing effects, newly used): Gash → `bleedDrip` on its opening cut (`gash`); Mind Control → `mindWave`
(`mindControl`).

**Still word-only (37), and why:** most are small number tweaks that already float a clear label at the right moment and
have no physical action to animate (Momentum, Fester, Rupture, Siege, Bulwark, Overwhelm, Ambush, Swift, Reload, Remember,
Growth, Satiety, Midas, Molting/Shedding, Healing, Worship, Lumberjack, Rocket, Fencing, Friction, Charge's clock badge), retired or unused
keys with no card (Drunk, Purblind, Scatterbrained, Sunshy, Nightblind, Pack, Pack Leader, Recoil, Restless), and a few with
one card each that are good candidates for a next pass (Explode, Bludgeon, Chained, Decay, Landslide, Lightning).
The 40 "none" are static rules (Reach, Keen Eye, Demolisher, Changeling, the Mighty/Sturdy/Feeble/Fragile stat tags,
resource passives like Timber, Rock-solid, Iron-will...).

**Full skill list (182), by how many cards carry it.** 🆕 = new this pass; — = floating word or sound only.

| Skill (key) | Cards | Effect | Trigger (replay event) | |
|---|---:|---|---|---|
| Flying (`flying`) | 112 | feather burst when hit; **new:** `SkillFX.swoop` on its own melee hits | hit | 🆕+ |
| Swimmer (`swimmer`) | 38 | `SkillFX.splash` | tide flow / statusFx swimmer | 🆕 |
| Nocturnal (`nocturnal`) | 36 | phase aura | statusFx phaseGrow |  |
| Armor (`armor`) | 32 | `SkillFX.armorBlock` | hit on an Armored unit | 🆕 |
| Evasive (`evasive`) | 25 | `SkillFX.evasiveDodge` | evaded |  |
| Poison (`poison`) | 25 | `SkillFX.poisonCloud` + bubble burst, green tint | poisonTick |  |
| Diurnal (`diurnal`) | 22 | phase aura | statusFx phaseGrow |  |
| Tide (`tide`) | 19 | tide wave across the field | tide |  |
| Quick (`quick`) | 18 | `SkillFX.quickStrike` | hit |  |
| Cleave (`sweep`) | 18 | `SkillFX.cleave` | hit with ev.sweep |  |
| Worthy (`worthy`) | 17 | `SkillFX.lootArc` | lumber (worthy / worthyDeath) | 🆕 |
| Darksight (`darksight`) | 15 | `SkillFX.darksight` | play |  |
| Fork (`fork`) | 14 | `SkillFX.forkProngs` (2 tines since 2026-10-15) | hit with ev.fork (each prong beyond the first) | 🆕 |
| Thorns (`thorns`) | 14 | `SkillFX.thorns` | thorns |  |
| Regeneration (`regen`) | 13 | `SkillFX.regen` | heal (self) |  |
| Bleed (`bleed`) | 12 | `SkillFX.bleedDrip`, red tint pulse; a grey 🩸 drops from the pip as a stack fades (`bleedFadeDropVfx`, BL) | bleedTick; bleedFade |  |
| Dry (`dry`) | 12 | none (a rule or stat with no moment of its own) |  |  |
| Swarm (`swarm`) | 12 | `SkillFX.swarm` | hit with a live Swarm bonus |  |
| Guardian (`guardian`) | 11 | `SkillFX.guardian` | play |  |
| Pounce (`pounce`) | 10 | crouch-and-spring | pounce |  |
| Rage (`rage`) | 8 | `.raging` aura + growl | hit by a raging unit |  |
| Arrow (`arrow`) | 7 | `SkillFX.bowShot` | arrow + hit |  |
| Prayer (`prayer`) | 7 | `SkillFX.prayerLight` | play of a Prayer card, grace | 🆕 |
| Stealth (`stealth`) | 7 | `SkillFX.stealthSlip` | hitHQ by a Stealth unit | 🆕 |
| Esprit (`esprit`) | 6 | `SkillFX.espritAura` | statusFx esprit | 🆕 |
| Inspiring (`inspiring`) | 6 | `SkillFX.espritAura` | statusFx inspired | 🆕 |
| Progeny (`onDeathSpawn`) | 6 | `SkillFX.summonPortal` | spawn | 🆕 |
| Pierce (`pierce`) | 6 | `SkillFX.pierceThrough` | hit with ev.rend, pierceHQ | 🆕 |
| Fire Arrow (`fireArrow`) | 5 | `SkillFX.bowShot` (fire) | arrow + hit |  |
| Shell (`shell`) | 5 | `.shell-sweep` | statusFx shellUp |  |
| Supreme (`supreme`) | 5 | none (a rule or stat with no moment of its own) |  |  |
| Ambush (`ambush`) | 4 | floating text / sound only |  | — |
| Demolisher (`demolisher`) | 4 | none (a rule or stat with no moment of its own) |  |  |
| Electricity (`electricity`) | 4 | `SkillFX.lightning` | electricity |  |
| Gash (`gash`) | 4 | `SkillFX.bleedDrip` (reused) | gash | 🆕 |
| Stampede (`overwhelm`) | 4 | floating text / sound only |  | — |
| Remember (`remember`) | 4 | floating text / sound only |  | — |
| Revivificated (`revive`) | 4 | `SkillFX.reviveRise` | revive | 🆕 |
| Scare (`scare`) | 4 | attacker flinches (scared lunge) | hit on a Scare unit |  |
| Swift (`swift`) | 4 | floating text / sound only |  | — |
| Wave (`wave`) | 4 | geyser + slide | wave |  |
| Backstab (`backstab`) | 3 | `SkillFX.backstab` | hit with ev.backstab |  |
| Brood (`brood`) | 3 | `SkillFX.summonPortal` | spawn | 🆕 |
| Changeling (`changeling`) | 3 | none (a rule or stat with no moment of its own) |  |  |
| Corrode (`corrode`) | 3 | `SkillFX.acidCorrode` | statusFx corrode | 🆕 |
| Daunt (`daunt`) | 3 | `SkillFX.fearShiver` | statusFx daunt | 🆕 |
| Earthquake (`earthquake`) | 3 | `SkillFX.earthquake`, quake jolts | earthquake |  |
| Explode (`explode`) | 3 | floating text / sound only |  | — |
| Expose (`expose`) | 3 | `SkillFX.targetMark` | hit by an Expose unit, statusFx expose | 🆕 |
| Freeze (`freeze`) | 3 | `SkillFX.freezeEncase` | statusFx freeze | 🆕 |
| Hive Mind (`hiveMind`) | 3 | `SkillFX.rageFlare` | statusFx berserk (hiveMind) | 🆕 |
| Keen Eye (`keenEye`) | 3 | none (a rule or stat with no moment of its own) |  |  |
| Keen Sense (`keenSense`) | 3 | none (a rule or stat with no moment of its own) |  |  |
| Lantern (`lantern`) | 3 | `SkillFX.lanternGlow` | play |  |
| Molting (`molting`) | 3 | floating text / sound only |  | — |
| Reload (`reload`) | 3 | floating text / sound only |  | — |
| Render (`render`) | 3 | `SkillFX.curseDrain` | render | 🆕 |
| Shock (`shock`) | 3 | glitch flicker | statusFx shock |  |
| Siege (`siege`) | 3 | floating text / sound only |  | — |
| Stun (`stunOnHit`) | 3 | `SkillFX.stunStars` | statusFx stunOnHit | 🆕 |
| Bloom, the old heal (`bloom`, retired 2026-10-23) | 1 | `SkillFX.bloomPollen` | heal from a Bloom unit |  |
| Bloom – {conditions} (`bloomCopy`) | 4 | `bloomCopyVfx`: petals / spores / a green film drift into the free slot, the copy opens out of a ring of light; "🌸 +1/+1" on the copy | bloom, then spawn (kind bloom) | 🆕 |
| Boomerang (`boomerang`) | 2 | `SkillFX.boomerang*` | hit / hitHQ by a boomerang unit |  |
| Bulwark (`bulwark`) | 2 | floating text / sound only |  | — |
| Coffee (`coffee`) | 2 | `SkillFX.clockTick` fast | statusFx coffee / coffeeCrash | 🆕 |
| Crit (`crit`) | 2 | gold starburst number | hit with ev.crit |  |
| Fester (`fester`) | 2 | floating text / sound only |  | — |
| Frenzy (`frenzy`) | 2 | `SkillFX.rageFlare` | frenzy | 🆕 |
| Frostbite (`frostbite`) | 2 | `SkillFX.frostChill` | statusFx frostbite |  |
| Healing (`healing`) | 2 | floating text / sound only |  | — |
| Immolation (`immolation`) | 2 | `SkillFX.scorch`, `.immolate-pulse` | fieldTick immolation |  |
| King Slayer (`kingSlayer`) | 2 | `SkillFX.crownCrack` | kingSlayer | 🆕 |
| Kinship (`kinship`) | 2 | none (a rule or stat with no moment of its own) |  |  |
| Natural Leader (`leader`) | 2 | none (a rule or stat with no moment of its own) |  |  |
| Lightning (`lightning`) | 2 | floating text / sound only |  | — |
| Momentum (`momentum`) | 2 | floating text / sound only |  | — |
| Moonborn (`moonborn`) | 2 | phase aura | statusFx phaseGrow |  |
| Paralyze (`paralyze`) | 2 | `SkillFX.paralyzeSpark` | statusFx paralyze | 🆕 |
| Puncture (`puncture`) | 2 | `SkillFX.pierceThrough` | hit with ev.rend | 🆕 |
| Reach (`reach`) | 2 | none (a rule or stat with no moment of its own) |  |  |
| Reflect (`reflect`) | 2 | `SkillFX.mirrorFlash` | reflect | 🆕 |
| Rupture (`rupture`) | 2 | floating text / sound only |  | — |
| Sacrifice (`sacrifice`) | 2 | `.sac-chomp` | statusFx sacrificed |  |
| Shedding (`shedding`) | 2 | floating text / sound only |  | — |
| Skyfall (`skyfall`) | 2 | sky drop | spawn |  |
| Sleep (`sleep`) | 2 | `SkillFX.sleepZzz` | statusFx sleep | 🆕 |
| Stagger (`stagger`) | 2 | `SkillFX.stunStars` ✦ | statusFx stagger | 🆕 |
| Twin (`twin`) | 2 | `SkillFX.summonPortal` | spawn | 🆕 |
| Worship (`worship`) | 2 | floating text / sound only |  | — |
| Banana (`banana`) | 1 | `SkillFX.bananaThrow` / `munch` | banana |  |
| Bananarang (`bananarang`) | 1 | `SkillFX.boomerang` / `munch` | banana, hit |  |
| Berserk (`berserk`) | 1 | `SkillFX.rageFlare` | statusFx berserk | 🆕 |
| Blind (`blind`) | 1 | `SkillFX.blindInk` | statusFx blind | 🆕 |
| Bludgeon (`bludgeon`) | 1 | floating text / sound only |  | — |
| Chained (`chained`) | 1 | floating text / sound only |  | — |
| Core Evil (`coreEvil`) | 1 | none (a rule or stat with no moment of its own) |  |  |
| Counterattack (`counterattack`) | 1 | `SkillFX.parry` | statusFx counter | 🆕 |
| Decay (`decay`) | 1 | floating text / sound only |  | — |
| Desecrate (`desecrate`) | 1 | none (a rule or stat with no moment of its own) |  |  |
| Dictator (`dictator`) | 1 | none (a rule or stat with no moment of its own) |  |  |
| Durian (`durian`) | 1 | `SkillFX.munch` | durian |  |
| Dynamite (`dynamite`) | 1 | `.dyn-blast` + board shake | dynamite |  |
| Fencing (`fencing`) | 1 | floating text / sound only |  | — |
| Friction (`friction`) | 1 | floating text / sound only |  | — |
| Growth (`growth`) | 1 | floating text / sound only |  | — |
| Heavy Metal (`heavyMetal`) | 1 | none (a rule or stat with no moment of its own) |  |  |
| Helmet (`helmet`) | 1 | `SkillFX.helmetDeflect` | deflect |  |
| Inherent Darkness (`inherentDarkness`) | 1 | none (a rule or stat with no moment of its own) |  |  |
| Iron-will (`ironWill`) | 1 | none (a rule or stat with no moment of its own) |  |  |
| Landslide (`landslide`) | 1 | floating text / sound only |  | — |
| Lone Wolf (`loneWolf`) | 1 | none (a rule or stat with no moment of its own) |  |  |
| Loyal (`loyal`) | 1 | none (a rule or stat with no moment of its own) |  |  |
| Lumberjack (`lumberjack`) | 1 | floating text / sound only |  | — |
| Magic (`magic`) | 1 | none (a rule or stat with no moment of its own) |  |  |
| Midas Touch (`midas`) | 1 | floating text / sound only |  | — |
| Moonpull (`moonpull`) | 1 | tide wave | tide (moonpull) |  |
| Pitchfork (`pitchfork`) | 1 | `SkillFX.forkProngs` | prong pitchfork | 🆕 |
| Rabid (`rabid`) | 1 | none (a rule or stat with no moment of its own) |  |  |
| Rainmaker (`rainmaker`) | 1 | rain weather | fieldSet |  |
| Rainrunner (`rainrunner`) | 1 | none (a rule or stat with no moment of its own) |  |  |
| Divine Retribution (`retribution`) | 1 | projectile volley | hit (retribution) |  |
| Rock-solid (`rockSolid`) | 1 | none (a rule or stat with no moment of its own) |  |  |
| Rocket (`rocket`) | 1 | floating text / sound only |  | — |
| Satiety (`satiety`) | 1 | floating text / sound only |  | — |
| Shield Call (`shieldCall`) | 1 | `SkillFX.shieldDrop` | spawn (shieldCall) |  |
| Smoke Bomb (`smokeBomb`) | 1 | `SkillFX.smokeBomb` | smokeBomb |  |
| Snipe (`snipe`) | 1 | `SkillFX.bowShot` | arrow (snipe) |  |
| Sociable (`sociable`) | 1 | none (a rule or stat with no moment of its own) |  |  |
| Spiteful (`spiteful`) | 1 | none (a rule or stat with no moment of its own) |  |  |
| Supreme Tide (`supremeTide`) | 1 | tide wave | tide |  |
| Timber (`timber`) | 1 | none (a rule or stat with no moment of its own) |  |  |
| Twin Strike (`twinStrike`) | 1 | `SkillFX.rageFlare` | frenzy (twin) | 🆕 |
| Usurper (`usurper`) | 1 | none (a rule or stat with no moment of its own) |  |  |
| Avalanche (`avalanche`) | 0 | board sweep + frost rings | avalanche |  |
| Bloom When, retired 2026-10-23 (`bloomWhen`) | 0 | none (a rule or stat with no moment of its own) |  |  |
| Charge (`charge`) | 0 | floating text / sound only |  | — |
| Confuse (`confuse`) | 0 | `SkillFX.stunStars` ❓ | statusFx confuse | 🆕 |
| Converge (`converge`) | 0 | cards glide to new slots | converge |  |
| Cower (`cower`) | 0 | `SkillFX.fearShiver` | statusFx cower | 🆕 |
| Crab Claws (`crabClaws`) | 0 | `.crab-pinch` + 🦞 ←/→ | crabClaw (random side since 2026-10-15) |  |
| Crepuscular (`crepuscular`) | 0 | phase aura (`.phase-aura`) | statusFx phaseGrow |  |
| Defiance (`defiance`) | 0 | none (a rule or stat with no moment of its own) |  |  |
| Dragon Lightning (`dragonLightning`) | 0 | red `SkillFX.lightning` | dragonLightning |  |
| Drunk (`drunk`) | 0 | floating text / sound only |  | — |
| Fast Forward (`fastForward`) | 0 | `.ff-blur` afterimages | fastForward |  |
| Feeble (`feeble`) | 0 | none (a rule or stat with no moment of its own) |  |  |
| Festering (`festering`) | 0 | none (a rule or stat with no moment of its own) |  |  |
| Fireball (`fireball`) | 0 | `SkillFX.fireball` | fireball |  |
| Fragile (`fragile`) | 0 | none (a rule or stat with no moment of its own) |  |  |
| Ghost (`ghost`) | 0 | none (a rule or stat with no moment of its own) |  |  |
| Haste (`haste`) | 0 | none (a rule or stat with no moment of its own) |  |  |
| Ichor (`ichor`) | 0 | `SkillFX.acidCorrode` | statusFx ichor | 🆕 |
| Irradiated (`irradiated`) | 0 | `.irradiate-pulse` | fieldTick irradiated / irradiation |  |
| Meiosis (`meiosis`) | 0 | `SkillFX.summonPortal` | spawn | 🆕 |
| Meteor (`meteor`) | 0 | `SkillFX.meteor` + crater | meteor / meteorBurn |  |
| Mighty (`mighty`) | 0 | none (a rule or stat with no moment of its own) |  |  |
| Nature's Force (`natureForce`) | 0 | none (a rule or stat with no moment of its own) |  |  |
| Night-blind (`nightblind`) | 0 | floating text / sound only |  | — |
| Nullify (`nullify`) | 0 | `.nullify-flash` | statusFx nullify |  |
| Octolash (`octolash`) | 0 | `SkillFX.forkProngs` (ink) | prong octolash | 🆕 |
| Pack (`pack`) | 0 | floating text / sound only |  | — |
| Pack Leader (`packLeader`) | 0 | floating text / sound only |  | — |
| Perforate (`perforate`) | 0 | `SkillFX.armorBlock` shatter | statusFx armorShred | 🆕 |
| Primed (`primed`) | 0 | none (a rule or stat with no moment of its own) |  |  |
| Psychic (`psychic`) | 0 | `SkillFX.mindWave` | psychic |  |
| Purblind (`purblind`) | 0 | floating text / sound only |  | — |
| Recoil (`recoil`) | 0 | floating text / sound only |  | — |
| Restless (`restless`) | 0 | floating text / sound only |  | — |
| Scatterbrained (`scatterbrained`) | 0 | floating text / sound only |  | — |
| Shade (`shade`) | 0 | none (a rule or stat with no moment of its own) |  |  |
| Shadow (`shadow`) | 0 | none (a rule or stat with no moment of its own) |  |  |
| Shield (`shield`) | 0 | `SkillFX.shieldUp` | statusFx unitShield |  |
| Speed (`speed`) | 0 | none (a rule or stat with no moment of its own) |  |  |
| Sprout (`sprout`) | 0 | none (a rule or stat with no moment of its own) |  |  |
| Sturdy (`sturdy`) | 0 | none (a rule or stat with no moment of its own) |  |  |
| Sun-shy (`sunshy`) | 0 | floating text / sound only |  | — |
| Swimmer: on Flow (`swimmerGrant`) | 0 | `SkillFX.splash` | statusFx swimmer | 🆕 |
| Swipe (`swipe`) | 0 | 🪵 projectile castle → swiper | swipeLumber |  |
| Make Tipsy (`tipsy`) | 0 | `SkillFX.stunStars` 🫧 | statusFx tipsy | 🆕 |
| Tornado (`tornado`) | 0 | board sweep + spins | tornado |  |
| Trident (`trident`) | 0 | `SkillFX.forkProngs` | hit with ev.fork, prong trident | 🆕 |
| Tsunami (`tsunami`) | 0 | board sweep + push | tsunami |  |
| Wither (`wither`) | 0 | black smoke + skull | statusFx wither / witherTick |  |

## 2026-10-15 additions: arrows, bolts, prongs and Chilli

User (2026-10-15): "New skill Chilli."; "Trident, Fork, Pitchfork ... we can make the first 3 more similar - attack the nearest
2/3/4 enemies within 1/1/2 range. Crab claws can be, attack a random unit L or R."; "We need more creatures with 'Arrow'. Volley,
Arrow, Twin Shot, Fire Arrow, Ice Arrow etc."; "We need bolts ... All elemental or status-y. They just represents 'spits' of
something at the enemy." New `SkillFX` functions in `bramblewood-skillfx.js` (section "ninth pass", stylesheet
`#sfx-ninth-css`), played in fights by `ninthPassVfx(ev)` in `arena_app.js`; each has a stage setup in the Admin → 🔬 Effects
library (`FXL_SKILL_SETUPS`) and a button in the hub's Effects Lab (Skills tab → "Arrows, Bolts and prongs").

| Skill | Function | Look | Plays on (replay event) |
|---|---|---|---|
| 🔥🧪🐍❄️⚡ Fire / Acid / Poison / Ice / Shock Bolt | `boltGlob(shooter, target, {element, flight, onImpact})` | The shooter squashes as it spits; a wobbling glob in the element's colours lobs over in an arc, shedding droplets, then splats in a coloured flash with a burst (fire embers, acid/poison drips, ice shards, sparks). One row per element in `BOLT_LOOK`, so a new element is one line. Plays at every FX level above None (it is the only cue a Poison Bolt has, which deals no damage); the hit that follows skips its plain projectile (`matchState.pendingBolt`). The status after it plays its own look: Corrode → `acidCorrode`, Freeze → `freezeEncase`, Shock → the shock glitch, Poison → a 🐍 +N ☠ number | `bolt`, then `hit` (ranged) and `statusFx` corrode / freeze / shock / poison |
| 🌶️ Chilli | `chilliHeat(target, {burn})` | A chilli pops up over the card and is gobbled; the card flushes red, shakes and puffs steam. Each round-start sting: a smaller red flash and a wisp, and the Health drops in the replay | `statusFx` `chilli` (eaten) and `chilliBurn` (the sting); Medium FX and up |
| 🧊🏹 Ice Arrow | `bowShot` | The bow shot; when it freezes (1 in 2), the ice block grows over the unit | `arrow` (ice) + `hit`; `statusFx` freeze |
| 🏹🏹 Twin Shot · 🎯🏹 Volley | `bowShot` | One bow shot per arrow, in quick succession | `arrow` (twin / volley) + `hit` |
| 🔱 Fork · Trident · Pitchfork | `forkProngs` | Steel tines (2 / 3 / 4) into each unit hit beyond the first. The attack-line preview now draws thin red lines to every enemy unit near enough to be a prong | `hit` with `fork`, `prong` fork / trident / pitchfork |
| 🦞 Crab Claws | `.crab-pinch` + 🦞 ←/→ | As before; the side is now random | `crabClaw` |

The rules as built (engine: `prongSpecOf`/`PRONG_SPECS`, `fireArrowVolley`, `BOLT_ELEMENTS`, `applyShotStatus`, `eatChilli`):

- **Fork / Trident / Pitchfork**: hits the 2 / 3 / 4 nearest enemy units no more than 1 / 1 / 2 columns away (ties at random), full
  Attack each. The first is its normal swing (the unit in front when there is one: Evade, Guardian, Pierce and every on-hit
  effect); the others are prongs (every on-hit effect, no Evade roll, each rolls its own Blind/dark miss). **No enemy unit in
  range: it attacks straight ahead as normal** (the castle when nothing is in front). Empty sides never go to the castle.
- **Crab Claws**: each swing pinches one random enemy unit in the column to its left or right; neither side has one: straight
  ahead as normal.
- **Ice Arrow N**: N cold at the nearest enemy; 1 in 2 a Freeze counter on a unit that has none (it holds that round's attack and
  melts at the round's end). **Twin Shot N**: two arrows of N at two different random enemy units (both at one if only one).
  **Volley N**: on its 1st, 3rd, 5th... Ready round, an arrow of N at every enemy unit.
- **Bolts** (every round while Ready, before melee; at the enemy opposite, else the nearest enemy unit, else the castle):
  Fire Bolt N = N fire; Acid Bolt N = N acid + 1 Corrode; Poison Bolt N = no damage, N Poison; Ice Bolt N = N cold + 1 in 2 a
  Freeze counter; Shock Bolt N = N damage + Shocked for a round. Helmet deflects them half the time.
- **Chilli N** (default 2): when it first becomes Ready, +N Attack and fire attacks for the rest of the fight, 1 damage to itself
  at the start of every round. Once a fight.

## 2026-10-15 additions: Bloodlust, Exposed, and Pounce's leap

User (2026-10-15): "New Skill: Bloodlust - ability idk, but I assume when it draws blood, it gets stronger."; "I like expose. It
should give a debuff 'exposed'. This unit takes +1 damage and attacks on this unit don't miss."; "I noticed pounce does a line of
damage to the enemy. Is this because of Windy instead?"

| Skill | Function | Look | Plays on (replay event) |
|---|---|---|---|
| 🩸⚔️ Bloodlust | `SkillFX.bloodlustPulse(card, {full})` (`bramblewood-skillfx.js`) | A red heartbeat: two red rings throb out of the card while it flushes red and swells twice; at its cap (+3N) one deeper throb. "🩸 Bloodlust +N⚔" floats up | `statusFx` `bloodlust` (`ninthPassVfx`) |
| 🎯 Exposed | `SkillFX.targetMark` (applied) and `FX.B.exposeCash` (each hit) | The red crosshair locks on when it is Exposed; on every Exposed hit it snaps shut and shatters with a "🎯 +1" chip. A red "🎯N" status badge counts the hits left | `statusFx` `expose`; `statusFx` `exposedHit` then the `hit` |
| 🐾 Pounce | `FX.A.pounceKick` + the normal attack lunge | A dust kick where it pushes off, then it leaps at the unit it really hits (the hit is `pounce:true`, not ranged, so no stone is thrown and it no longer draws a column of ghost cards up the board) | `pounce`, then its `hit` |

The rules as built (engine: `bloodlustGain`, `useExposed`, `dodgeCheck` / `combatHitLands`):

- **Bloodlust N** (default 1): when its attack lands damage on an enemy unit that is Bleeding (it already was, or this hit made it
  bleed), +N Attack for the rest of the fight, up to +3N in all. Its main swing only (not Cleave / Fork side hits or shots).
- **Expose N / the Expose action**: the target is Exposed for its next N hits. Each hit on it deals +1 (before Armor) and uses one;
  while it is Exposed, attacks at it can't miss (no Evasive, Swift, Flying, Smoke, Fog or Shadow dodge, no Blind or darkness miss).
  Poison, Bleed, Decay, curse and Chilli ticks aren't hits.
- **Pounce N**: unchanged in the engine: one hit of N on one random enemy unit (the castle with none). Windy / Gale never doubled it
  (Headwind doubles a Flyer's active skills, and Pounce is not one; since EN2, 2026-10-23, its other triggers go once: see the EN2 section).

## 2026-10-17 additions: the Effects Lab catches up with 10-16 and 10-17

User (2026-10-17, 21:47): "continue, build out the effects lab too." Everything visual or audible from the 10-16 and 10-17
changelog is now in the Effects Lab catalogue (hub tab "🧪 Effects Lab"): 56 entries added, 28 updated, 8 retired. Where the game has
a function for the look, the lab plays that function with the event a fight sends (`manifest/_game.js` stands in for the fight; the
functions are copied from `arena_app.js` by `sync_fx_src.py`, listed in `tools/effects-lab/fx-src-extra.txt`). The stages were
re-captured from today's game, so every tile wears its card front frame and every face-down card its card back.

**Field effects** (`manifest/fe2.js`, all through the game's `field2Vfx`):

| Effect | What you see | Lab id |
|---|---|---|
| 💨 Sulphur Fumes | a soft yellow band from the right; "💨 −1" on each unit that chokes | `fld3-sulphur-fumes` |
| 🌋 Ash Rain | the grey hail band and a dull boom (the castles' −1 only ticks their HP bars) | `fld3-ash-rain` |
| 🌫️ Ashy / after an Eruption | the board rumbles; a miss in the ash floats "🌫️ Lost in ash" on the attacker | `fld3-ashy` (A, B) |
| 🏹 Arrow Slits | a twang, then "🏹 -2" and a shake on one of your units | `fld3-arrow-slits` |
| 🌋 Volcano Glow | the phase pill counts Day 1/4 … 4/4, Night 1/2, 2/2 | `wt-volcano-glow` |
| 🌳 High Canopy / 🌿 Undergrowth | the ordinary Evasive dodge for Swift / Quick units; Pounce's +2 in its number | `fld2-canopy` |
| 🌾 Tall Grass | "🌾 ×2" over a Pounce or Backstab target | `fld2-tall-grass` |
| ✴️ Leylines I / II / III | I: a bigger day / night bonus; II: +1 🪵 into each side's pill; III: the violet burn, "✴️ Atheist" on an Atheist | `fld2-leylines-1`, `-2`, `fld2-leylines` |
| Landslide, Crushing Depths, Hail, Glass-storm, Lava Spout, Mirage, Haunted, Slippery, Rook's Row / Bishop's Path, Consternation | as before, now the game's own function (the hail and landslide bands run across the board, not down it) | `fld2-*` |

**Skills** (`manifest/x17.js`):

| Skill | What you see | Function | Lab id |
|---|---|---|---|
| ⛧🏰 Penance / ⛧🩸 Blood Tithe | a dark ⛧ sinks into your castle / the ally that pays, "⛧ -N" | `devilPayVfx`, `devilPulse` | `sk-penance`, `sk-blood-tithe` |
| 💕 Amore | hearts drift between the pair, "💕 +0/+3"; heartbroken: "🤎", a brown and a broken heart | `skills2Vfx`, `floatGlyphs` | `sk-amore`, `sk-amore-broken` |
| ♻️ On Pitch ("Scavenge") | each unit's ♻️ badge glows as you pitch | `triggerFiredVfx` | `sk-scavenge` |
| 🔥 Burn 1 Lumber / Fire on hit | an ember leaves the Lumber pill; "🔥 -N" and two flames at the hit | `skills2Vfx` | `sk-lumber-burn`, `sk-fire-on-hit` |
| 🐾 Pounce <Att> / <Hp> | the leap deals the card's Attack or Health | `SkillFX.pounceOnto` | `sk-pounce-stat` |
| 👀 Ambush N | also strikes a unit that moves in | `FX.A.ambushStrike` | `atk-ambush` C |
| 🪞 Reflect | the shot bounces off ("🪞 Reflect!") to a unit on the shooter's side, or their castle | `s17SkillVfx` | `atk-reflect` G, H |
| 🎖️ Vanguard | "🎖️ +1/+1" on the first card (the opening-hand move is only a log line; B sketches it) | `s17SkillVfx` | `sk-vanguard` |
| 🕸️ Web | "🕸️ Webbed", the threads bind it, the 🕸️N badge | `s17SkillVfx`, `SkillFX.vineBind` | `sk-web` |
| 🩸 Bloodlust | the kill, then the leap to its new slot with a red push and throb | `s17SkillVfx` | `sk-bloodlust-leap` |
| 🗼 Sentry / 🦴 Carrion | "🗼 Sentry!" and its strike / "🦴 +N" when a unit dies | `s17SkillVfx` | `sk-sentry`, `sk-carrion` |
| 🐿️ Hoard, ⚗️ Venom Master, 🪶 Fletcher, 🌿 Herbalist, 💥 Shatter, 🚫✨ Atheist | no look of their own: the chip and the bigger number | | `sk-hoard` … `sk-atheist` |
| 🏹 Arrow ×2 | the War Elephant's two arrows, one after the other | `SkillFX.bowShot` | `atk-arrow-count` |
| ⚡ Electricity | the bolt is the hit: a yellow ⚡ number, a ⚡ burst | `hitExplosionVfx` | `sk-electricity` C |
| ⚡ Quick | the dash on a miss, and at the castle's HP bar | `quickStrikeCastle` | `atk-quick` B, C |
| ⚡ Triggers | only the trigger's own badge glows | `triggerFiredVfx` | `sk-trigger-fired` B |
| ✖ Killing blow | the ✖ darts into a killer that feeds on kills; its On Kill badge fires | `killMarkVfx` | `death-kill-mark` |
| 🪢 Strangle | the squeeze at round start | `w2SkillVfx` | `st-strangle-tick` |

**Deaths and marks:** the phoenix Revive mark, the Angel's wings and the used state (`st-revive-mark` A–D); the smooth topple
(`death-fall`); the Prism death was already in (`death-prism`).

**Board and UI:** the opponent's pitch into a slot and "+1 🪵 Lumber" (`ui-enemy-pitch`, `enemyPitchSlotFx`), the enemy hand
counter (`ui-enemy-hand-count`), castle numbers on the HP bar (`castle-hp-number` H, `hqRibbonFloatAnchor`), the upkeep lock
(`ui-upkeep-chip`), the Refinery's 🧪 throw (`castle-herb-bane` H, `castleThrowVfx`), voice barks with their babble
(`ui-voice-bark` A–D: an otter, a bear, a hummingbird, a *hiss*), the 10 s sky steps (`wt-sky-step`), nightfall and daybreak with the
whole-board fade, the left-to-right creep, the streaks and the faint sun (`dark-night-veil-in` B, `dark-night-veil-out` B,
`skyPhaseLayers`), and the night pointer light (`wt-night-cursor`).

**Cards:** the four front frames (`tr-frame-kinds` A–D, E the frameless tile before), the nine archetype frames
(`tr-frame-arch-*`, A unit and B structure each), the four card backs (`tr-card-backing`), the top rarity frames on a zoomed card
(`tr-rarity-zoom`), the bonus copy (`pack-bonus-copy`) and the pile count counting down (`pack-count-down`).

**Maps:** the Frostfire (Map 22) and Fortress (Maps 23-24) titles and the battlements silhouette (`map-title-frostfire`,
`map-title-castle`, `map-grand-silhouettes-2`; the swamp, mist and fungal titles now say they carry the ink shade), new trails inking
in one by one (`map-trails-one-by-one`), and a hidden skirmish popping in with its trail (`map-hidden-skirmish-pop` B).

**Retired** (kept playable, marked in the catalogue): the shiny / foil death sheen, the "×2" duplicate, the "−N ✖" stamp, Bloodlust
growing, Worthy's loot, the rank lesson box, the "+3 XP" line and the Lumber lesson window.


## Smoke and war (2026-10-21)

Package FX-WAR. Owner: "add smoke effects if we haven't yet, and others related to war, that we can pick and choose and use. Flag the
effect used if it's already used in game, so we know in the future."

**Where to pick:** the Effects Lab's **Smoke & war** tab (`tools/effects-lab/fxlab-war.js`, built by `tools/effects-lab/build.py`). The new
effects live in `bramblewood-fx-war.js` as `window.WarFX`. Every card there, and every row of the Lab's Catalogue tab, carries a badge:
green **In game: where** or brown **Lab only (not used yet)**. The Catalogue tab also has an "In game or not" filter and a count.

**Not wired.** `WarFX` is not in `FX_BATCHES` (`arena_app.js` calls only `FX.A` to `FX.G`) and nothing in the game calls it. The file is
loaded by the Lab only; `assemble_arena.py` is untouched, so it is not in the game bundle yet. To use one: add the file to the bundle,
then call `WarFX.<name>(...)` from the event that should show it. Every function takes the DOM nodes (or a point) and `{onImpact, onDone}`,
returns a Promise, and in reduced motion shows one still glyph and still fires both callbacks.

How they are made: GSAP only (one tween per group of particles, so the Lab's slow-motion and the game's hit-stop apply), transform and
opacity only, soft edges from radial gradients, SVG data-URI shapes for flames, stars and caltrops. No CSS filter, no blend-mode layer, no
blood. Overlays are fixed nodes on `<body>` with the class `fxw-*`, removed when done.

### Already in the game (audit, 2026-10-21)

| Effect | Where it is called | In game |
|---|---|---|
| Smoke Bomb cloud | the Smoke Bomb skill: `arena_app.js` `smokeBomb` event, `SkillFX.smokeBomb` | yes |
| Evade in smoke | a swing that misses a Smoked unit: `FX.A` `onEvent` `evaded {smoke}` | yes |
| Evade in fog | a swing that misses in Thick Fog: `FX.A` `onEvent` `evaded {fog}` | yes |
| Poison gas cloud | the `poisonGas` event: `w2SkillVfx`, `SkillFX.gasCloud` | yes |
| Stampede dust roll | Overwhelm hitting the Bramble: `FX.A` `overwhelmHQ` | yes |
| Dynamite blast | the Dynamite skill: `FX.A` `dynamite`, `SkillFX.dynamite` | yes |
| Fireball | the Fireball skill: `SkillFX.fireball` | yes |
| Fire arrow | a ranged hit with a fire arrow: `SkillFX.bowShot {fire}` | yes |
| Volley arrow rain | the first Volley arrow of a round: `FX.A.arrowRain` | yes |
| Siege ram | a hit on the Bramble with a Siege bonus: `FX.A` `hitHQ` | yes |
| Ballista bolt | the `castleBolt` skill: `FX.A` | yes |
| Rocket launch | the Rocket skill: `FX.A` | yes |
| Rally | the Rally skill: `FX.A` `rally`, `SkillFX.rally` | yes |
| Shockwave ring | hits of 8+ at Effects High, and Charge firing: `FX.A` `heavyShock` | yes |
| Scorch (heat burn) | Heat, Immolation and Lava Tide ticks: `SkillFX.scorch` | yes |
| Crater burn | a Meteor crater, once a round: `FX.A` `meteorBurn` | yes |
| Burning ground set / sprung | `hazardSet` and `hazardSprung`: `SkillFX.trapSet` / `trapSnap {scorch}` | yes |
| Blown-up death | a unit killed by Explode or Dynamite: `FX.C` `deathExplode` | yes |
| Friction sparks | the Friction skill: `FX.A` `friction` | yes |
| Crit sparks | a critical hit: `FX.A` | yes |
| Rally standard (banner) | `FX.A.rallyStandard` | **Lab only** (nothing calls it) |
| Wildfire front | the Wildfire Front field effect's line of fire (FX3, 2026-10-23; its own field since FX4): `scorchSweepVfx`, `FX.B.wildfire` | yes |
| Ground boil | Scorched Ground's hit on one unit a side (FX4, 2026-10-23): `groundBoilVfx` | yes |
| Fog banks | `FX.B.fogBanks` | **Lab only** |

The ambient looks (Thick Fog, Ashy and the weather and sky layers) belong to the field and weather code and are described in the sections
above; this audit covers the event effects. The Lab's Smoke & war tab plays the 23 rows above as reference, so the old and new can be
compared on one stage.

### New in this package (all Lab only)

| Name | Call | What it looks like | In game |
|---|---|---|---|
| Puff | `WarFX.puff(target, {dark, dust, size})` | a cartoon "poof": cloud blobs and a thin ring pop out of a card (light, gunpowder or dust) | Lab only (not used yet) |
| Smoke bomb burst | `WarFX.smokeBurst(from, to, {dark, size})` | a lit bomb is lobbed in, then bursts into a ring of big clouds that linger as a haze | Lab only (not used yet) |
| Smoke screen | `WarFX.smokeScreen(lane, {from, hold, dark})` | a wall of cloud rolls along a lane, hides it, holds, then lifts | Lab only (not used yet) |
| Drifting battlefield smoke | `WarFX.battlefieldSmoke(host, {duration, dir, dark})` (has `.stop()`) | faint low smoke banks drift over the field; cards stay readable | Lab only (not used yet) |
| Smoke column | `WarFX.smokeColumn(target, {duration, height, flame, dark})` | a twisting column with a small flame at its foot, over a burning card or castle | Lab only (not used yet) |
| Battle dust | `WarFX.dustKick(target, {dir})` | dust and pebbles kicked up behind a charging card, with speed lines | Lab only (not used yet) |
| Cannon blast | `WarFX.cannonBlast(from, to, {flight})` | muzzle flash and smoke, a ball that trails puffs, then a crash with debris and sparks | Lab only (not used yet) |
| Catapult lob | `WarFX.catapultLob(from, to, {host, flight})` | a boulder in a high arc, a growing landing shadow, a crash with a ground ring and bouncing rocks | Lab only (not used yet) |
| Explosion | `WarFX.explosion(target, {size, cards})` | white flash, a bubbly fireball, a ring that shoves neighbours, a star burst, sparks, debris, smoke | Lab only (not used yet) |
| Flaming arrow volley | `WarFX.flamingVolley(from, targets, {n, onHit})` (up to 8) | fire arrows arc over, shed embers and land as small flame pops | Lab only (not used yet) |
| Burning ground | `WarFX.burningGround(target, {duration, width, slot, smoke})` | a scorch mark with a row of cartoon flames and embers, then it burns out | Lab only (not used yet) |
| Sword clash | `WarFX.swordClash(a, b)` | two cards lunge together: starburst, sparks, a ring and a crossed-swords glyph | Lab only (not used yet) |
| War horn | `WarFX.warHorn(source, allies, {radius})` | a horn sounds three gold rings; reached allies hop and a note floats up | Lab only (not used yet) |
| Siege ram slam | `WarFX.ramSlam(target, {from, host, shake})` | a ram drawn back and swung in: splinters, stone chips, ground ring, squash, a board shake | Lab only (not used yet) |
| Caltrops | `WarFX.caltrops(from, lane, {n, hit})` | four-point jacks thrown across a lane, bounce twice, settle, glint, fade | Lab only (not used yet) |
| Signal flare | `WarFX.signalFlare(source, {color, height})` | a flare climbs with a spark trail and bursts into a drifting star shell (red, green or gold) | Lab only (not used yet) |

Nearest existing looks, for choosing: the Puff and the Smoke bomb burst sit next to `SkillFX.smokePuff` and `smokeBomb`; Smoke screen has
no game twin (the Smoke status only blurs one card); the Cannon blast, Explosion and Flaming volley sit next to `FX.A.ballista`,
`SkillFX.dynamite` and `FX.A.arrowRain`; the Ram slam sits next to `FX.A.siegeRam`; the War horn is the cartoon cousin of Rally and the
unused `FX.A.rallyStandard`; Caltrops and the Smoke column have no twin.

**How to keep this honest:** when an effect from this list is wired, change its row to "In game: <where>" here and in
`NEW` in `tools/effects-lab/fxlab-war.js`. The Catalogue tab's badges come from `docs/effects-inventory-2026-10-15.json`
(`python3 tools/effects-lab/refresh_inventory.py`); the Smoke & war tab's from its own two lists.

## Effects Lab, 2026-10-21 (package LAB2): the pinned field, the "Built 10-21" tab, the "Ideas 10-21" tab

Owner: "Update the effects lab with all the new effects. (I also like a lot of the existing effects. I don't mind spending some time here to
add more effects for me to judge.)" and "For all tabs of the effects lab, please make the 'field' sticky to the top! So I can always see the
field when clicking on a skill."

**The field is pinned on every tab that has one.** `tools/effects-lab/fxlab-lab2.js` (`LAB2.initSticky`): Skills, Battlefield and Damage
numbers pin the field itself; Procedural FX, Card ideas, Cards, Combat and Screens lift the stage of the tile you press into a pinned bar
(press in another tile, or "Put back", to send it home); Card displays and Foils pin the card picker and toggles; the Catalogue's stage dock
is a strip under the tab bar on a phone (no longer a sheet at the bottom). The new tabs have the pinned field in the right column (desktop)
or a strip at the top (phone). At 390 px wide the pinned field is 21% to 31% of the screen (Built and Ideas 28-29%). Sound, Music,
Ambience, Coming next and Full list have no field to pin.

**Built 10-21** (`tools/effects-lab/fxlab-built.js`): every visual effect built today that the Lab did not show, played with the game's own
code (functions copied from `arena_app.js` by `sync_fx_src.py`; the evolve and hatch entries make the same calls as the inline handlers in
`renderVfxForEvent`, with a tile swap standing in for `renderBoard`). Every entry carries its "In game: <where>" badge. 21 entries, 48 looks.
Packages ED, HC, TS2, CX2, CX5 and HB2 added no effect of their own (rules, editor and data), and Lycanthropy has no look in the game.

| Package | Effect | Where it is called | In game |
|---|---|---|---|
| EV | Evolute lands on its base (3 looks) | engine event `evolve`, `renderVfxForEvent` | yes |
| EV | Evolute stack edges and ×N (3) | `evoStackHTML`, drawn by `renderBoard` | yes |
| MT | Mimic copies an ally (2) | engine event `mimic`: `FX.C.twinPeel`, then a floating "Mimic" | yes |
| TR | Crown settles on a unit (3) | engine event `crown` take / pickup, `trCrownVfx` | yes |
| TR | Crown flies between units (2) | `crown` liege / steal, `trCrownVfx` | yes |
| TR | Crown falls off a dead King | `crown` drop, `trCrownVfx` | yes |
| TR | Crown fades into Gold | `crown` fade (pays +1 Gold) | yes |
| TR | Gilded (2) | `statusFx` transform gilded, `trTransformVfx` | yes |
| TR | Championed, Veteran, Enraged, Matured (5 rings) | `statusFx` transform, `trTransformVfx` | yes |
| UI3 | Shield layers fill the Health bar (3) | `ribbonShieldSync` (a raid's Shield 50, Skirmish Armour, a dungeon wave) | yes |
| UI3 | A Shield layer breaks (3) | `ribbonShieldSync`, `ribShieldBreakVfx` | yes |
| UI3 | Shielded Health is blue (2) | `.board-card.has-shield`, `updateCardHpDisplay` | yes |
| EL | Element attack plates (3 galleries) | `cardTileHTML` / `updateCardAtkDisplay`: `atkPlateCls`, `atkGlyphOf` | yes |
| RK | Total raid rank badge (3) | `raidTotalRankBadgeHTML` on the Raid hub, result and claim screen | yes |
| RK | Rank stamps in on the claim screen (2) | `FX.F` `raidClaimScreen` | yes |
| BX | Archer drops a stone (2) | `effects.archerStyle "drop"`, `bxDropStone` (Stonedrop Vulture) | yes |
| FG | Fuse: spares fly into the card (2) | `forgeFuse`: `forgeCentreStage` + `fuseStageAnimation` | yes |
| FG | Reinforce: stones drop onto the Bramble | `forgeReinforce`: `reinforceStageAnimation` | yes |
| FG | Raid Craft: shards stream into the card | `forgeRaidCraft`: `raidCraftAnimation` | yes |
| FG | Hatching: the egg opens in close-up (3 rarities) | `hatchRevealVfx` | yes |
| FG | An egg hatches on the board | engine event `hatch`, `renderVfxForEvent` | yes |

**Ideas 10-21** (`tools/effects-lab/fxlab-ideas.js`, effects in `bramblewood-fx-ideas.js` as `window.IdeasFX`): 29 candidates for the owner
to judge, each with two or three looks, all **Lab only (not used yet)**. Not wired: `IdeasFX` is loaded by the Lab only, and
`assemble_arena.py` is untouched. Rules for all of them: GSAP only, transform and opacity, no CSS filter, no blend layer, no full-screen
layer (sky effects cover the field's own box), 40 nodes at most, the idle aura 7 motes at 30 fps, and one still glyph under reduced motion.
Every function takes a DOM node (or the field box) and `{v, ...}`, and returns a Promise (the aura returns a handle).

| Name | Call | What it looks like | In game |
|---|---|---|---|
| Fire hit | `IdeasFX.hitFire(t, {v:0..2})` | flames lick up the card, an ember shower, or a fireball pop | Lab only (not used yet) |
| Ice hit | `IdeasFX.hitIce(t, {v})` | ice shards and a snowflake, frost that covers the card, or icicles dropping | Lab only (not used yet) |
| Acid hit | `IdeasFX.hitAcid(t, {v})` | a green splat, sizzling bubbles, or slime dripping down | Lab only (not used yet) |
| Poison hit | `IdeasFX.hitPoison(t, {v})` | a skull puff, purple bubbles, or a toxic cloud | Lab only (not used yet) |
| Decay hit | `IdeasFX.hitDecay(t, {v})` | brown leaves fall, crumbs fall, or it wilts and puffs spores | Lab only (not used yet) |
| Magic hit | `IdeasFX.hitMagic(t, {v, from})` | a star burst, a spinning rune circle, or stars flying in from a wand unit | Lab only (not used yet) |
| Water hit | `IdeasFX.hitWater(t, {v})` | a splash and ground ring, rising bubbles, or a wave washing across | Lab only (not used yet) |
| Stone hit | `IdeasFX.hitStone(t, {v})` | rock chips and dust, a boulder dropping, or pebbles | Lab only (not used yet) |
| Metal hit | `IdeasFX.hitMetal(t, {v})` | clang sparks and a star, spinning gears, or a glint sweeping across | Lab only (not used yet) |
| Lightning hit | `IdeasFX.hitLightning(t, {v, chain})` | a bolt from above, arcs jumping to neighbours, or crackles round the edge | Lab only (not used yet) |
| Attacks-with-an-element aura | `IdeasFX.elementAura(t, {element, ms})` | up to 7 slow motes for each of ten elements (embers, snow glints, bubbles, leaves, runes, drops, pebbles, a glint, sparks) | Lab only (not used yet) |
| Crowning | `IdeasFX.crowning(t, {v})` | the Crown drops and bounces, lowers in a spotlight, or lands with a coin shower | Lab only (not used yet) |
| Gilding | `IdeasFX.gilding(t, {v})` | a gold wipe, gold dust that settles, or a spinning coin | Lab only (not used yet) |
| Veteran stripes | `IdeasFX.veteranStripes(t, {v})` | three chevrons stamp in, a medal drops, or three star pips pop | Lab only (not used yet) |
| Champion's laurel | `IdeasFX.championLaurel(t, {v})` | a laurel wreath grows, a trophy and confetti, or a banner unfurls | Lab only (not used yet) |
| Evolve: cocoon burst | `IdeasFX.cocoonBurst(t)` | a silk cocoon wobbles and bursts into silk bits and stars | Lab only (not used yet) |
| Evolve: helix swirl | `IdeasFX.helixSwirl(t)` | two strands of glowing dots spiral up and close with a flash | Lab only (not used yet) |
| Evolve: molt shed | `IdeasFX.moltShed(t)` | a pale copy of the old skin slips off and flakes away | Lab only (not used yet) |
| Dawn break | `IdeasFX.dawnBreak(fieldBox)` | warm light rises, a sun climbs, soft rays turn | Lab only (not used yet) |
| Dusk glow | `IdeasFX.duskGlow(fieldBox)` | orange and violet, the sun sinks, stars come out | Lab only (not used yet) |
| Moonrise | `IdeasFX.moonrise(fieldBox)` | a cool tint, a haloed moon climbs in an arc, stars twinkle | Lab only (not used yet) |
| Rain starts | `IdeasFX.rainStart(fieldBox)` | a cloud slides in, drops fall and get heavier, rings on the ground | Lab only (not used yet) |
| Snowfall | `IdeasFX.snowfall(fieldBox, {cards})` | flakes sway down, little white caps on the cards, then it melts | Lab only (not used yet) |
| Stench status | `IdeasFX.stenchStatus(t, {mode})` | apply: green wavy lines and two flies; expire: a breeze blows it away | Lab only (not used yet) |
| Brittle status | `IdeasFX.brittleStatus(t, {mode})` | apply: hairline cracks and glass chips; expire: the cracks seal with a shimmer | Lab only (not used yet) |
| Exposed status | `IdeasFX.exposedStatus(t, {mode})` | apply: a red reticle zooms in and locks on; expire: it spins smaller and fades | Lab only (not used yet) |
| Shield 50 cracks | `IdeasFX.shieldCrack(castle, {v})` | a blue dome gets one crack, or breaks into hexagon shards | Lab only (not used yet) |
| Tentacle slam warning | `IdeasFX.slamWarning(t, {v})` | a red danger spot and a bouncing "!", then a purple tentacle slams down | Lab only (not used yet) |
| The raid falls | `IdeasFX.raidFalls(fieldBox, {boss})` | the boss shakes and sinks under bubbles, then confetti and a trophy | Lab only (not used yet) |

Statuses: Stench and Brittle have no look in the game's code today. Exposed has `SkillFX.targetMark` on apply and `FX.B.exposeCash` per hit, but nothing when it expires; the idea's apply is an alternative to compare, its expire is new.

**How to keep this honest:** when one of the ideas is wired, change its row to "In game: <where>" here and its `add(...)` entry in
`fxlab-ideas.js` (the badge is `Lab only` for every entry in that tab until then).

## Position Beam: the Galactic Condor turns to fire (2026-10-22, package CB)

Owner (07:42): "Condor: okay. It must animate to look like it turns and manoeuvres to fire the beam." In game: `positionBeamVfx(ev)` in `arena_app.js`
(called from the `positionBeam` branch of `renderVfxForEvent`; `delayForEvent` holds the replay for `ev._pbMs` so the first bolt is drawn as the pose is
reached). GSAP transforms on the Condor's inner `.card-tile` only (rotate, translate, scale; no filter, no blend layer), the card lifted above its
neighbours with `.is-attacking` while it turns, and `clearProps:'transform'` at the end so it returns exactly to its slot. Sound: `SoundKit.beamTurn`
(a rising whoosh and a two-note hum). Effects Low and below, and reduced motion: no manoeuvre, the beam as before.

| Case | Manoeuvre (before the beam) | Aim time at 1x |
|---|---|---|
| Centre | rears up (stretches tall, tips back), then dips its head forward and aims straight across | 620 ms |
| Side (1 to 4 out) | banks and turns toward the angle it fires at (15 to 27 degrees by column), a small lift, then a gentle sway while it fires | 520 ms |
| Edge (5 out) | coils the other way, then swings right round to face along the row (about 62 degrees, overshoot) and keeps turning to about 74 as the beam sweeps across, nearest first | 760 ms |

All three: a short recoil as the beam fires, then it settles back (0.45 s). The direction is read from where the units hit are on screen, so it works
from either side and for an enemy Condor. Effects Lab: **Built 10-21/22** tab, group "Galactic Condor: Position Beam" (7 looks: Centre, Side from the
right and the left, Edge left and right, Enemy Condor, Effects Low). In game: yes.

## EN2 (2026-10-23): Guardian vs Taunt, Boomerang, the wind, Swarm, the Ironclaw's looks

The engine decides (`bramblewood-engine.js`); this describes it.

**Guardian and Taunt reach different units, in different ways.**

| | Guardian | Taunt |
|---|---|---|
| What it changes | Where a blow lands: a plain attack aimed at an ally next to it hits the Guardian instead (`redirectToGuardian`). The attacker still aims at the ally. | Who the attacker aims at: enemy units facing it, or one column to either side, must attack it (even ones that would hit the bramble). |
| Reach | Its neighbours: left and right in its row; in a raid, also the unit in front and behind (`adjacentOf`). Never itself. | Enemies in the three columns facing it (its own and one either side). |
| What it covers | Plain swings only (a unit's main swing and its Fork / Trident / Pitchfork / Octolash prongs). Not skills, arrows, Bolts, shots, areas or Cleave's spread (Spellward covers skills). | Swings. Stealth slips past. |
| Several | One of them at random (seeded). | The nearest to the attacker (ties at random, `tauntTargetOf`). |
| On the board | The Guardian slides over in front of the ally it guards a beat before the blow lands, takes the hit there and slides home; if the blow kills it, it flinches and dies on that spot (`en2GuardStepIn`, from the hit's `guardedUid`). | The attacker turns to it. |

**Boomerang.** The throw swings at Speed 0 (its old base of 1 is gone; Speed and Haste still add). A throw at the bramble flies on past it at the
same speed (`en2BoomCastleThrow`); next round it comes back the same way: it strikes the bramble again, then the unit now in its lane on that
side (`boomCastleLaneUnit`; the `hitHQ` carries `thenUid`, the unit's own `hit` carries `viaCastle`), then flies home (`en2BoomCastleReturn`).
With the thrower dead it still flies home: it hits its far target again, then the unit standing in the thrower's slot (a Boomerang unit catches
it), else the side's own bramble; the `boomerangReturn` event names `homeUid` / `homeCastle` / `farUid` and the board draws one flight
(`en2BoomOrphanFlight`). Price: 3 → 1.9 (Bananarang too).

**Wind.** Tailwind: the side's Flyers are Quick for the round (their swing at Speed 2, `_windQuick`); no Fast Forward turn, so a Waiting Flyer
still waits. Headwind: a Flyer's active skills go off twice: its Speed-1 shots (Arrow, Fire / Ice Arrow, Twin Shot, Volley, the Bolts,
Spitfire), Snipe, and its On Action skills (Archer). Its swing, passives and other triggers (On Hit, On Death, On Play, On Round Start ...) go
once (`HEADWIND_HOOKS`).

**Swarm** counts allies by Type only: the archetypes a card lists and the wider Types above them (Coral Reef is Ocean is Aquatic), never its
species or animal (`swarmTypeShares`). Structures never count. The board's Attack follows the replay: as an ally dies mid-round the Swarm
unit's number drops at once (`liveSwarmBonus` reads the replay's living units), and each swing puts the Attack the engine used on the
attacker's plate (`liveAtk` on its hit).

**Ironclaw Fiddler** (card `fx`): `play: 'crabClack'`: on arrival the card sways side to side four times in 1 s while its one big claw snaps
beside it ("🦀 Clack!"); `attack: 'crabClaw'`: the claw closes on the target as the blow lands.

## 2026-10-23 additions (package BL): Bloom – {conditions}, Bleed's fade

The rules as built (engine: `bloomCopyPass`, `bloomCond`, `applyPoisonTicks`):

- **Bloom – {conditions}** (`effects.bloomCopy = {when, mode, lumber}`; owner 11:23: "define bloom as +1/+1, then make a copy of this
  card (only bring over the damage, don't bring over counters)"). At each round's start, after the upkeep heals and On Round Start, a unit
  whose conditions all hold (or any, with `mode: 'or'`) and whose side has the Lumber it asks for blooms, once: it pays the Lumber and a copy
  of it grows in a free slot right beside it, the copy with +1/+1 (owner 19:30: "bloom only gives the new one +1/+1, not itself"; the unit
  itself is unchanged) (a coin flip when both are free; on a packed row its flank; in a
  raid's middle / back row, beside it in that row). The copy is the same card with the unit's Attack and its Health without the day /
  night / pack bonus (every stat change made without counters comes along), plus 1/+1, minus the damage the unit has taken, and none
  of its counters or statuses. It arrives with its printed Wait, can't bloom itself, and leaves no card in the graveyard when it dies.
  No free slot beside it: no bloom yet; it tries again next round. Stunned or caged: no bloom that round.
  Conditions: Bloom's (Tide, Ebb, Night, Day, Twilight, Wind, Wet, Dark, Heat, Frost, Full Moon, Rain), **Sunny** (day or Twilight,
  with no Rain, Fog or darkness) and **Killed an enemy** (`kill`: this unit has killed an enemy unit this fight; marked as its On Kill
  would fire). Cards: Fungal Colossus (Wet & Sunny + 1 Lumber), Puffball Bombardier (Wet & Killed an enemy), Pond Algae (Wet & Sunny,
  new), Lotus Frog (Tide & Night, was Bloom When +2/+2). The old Bloom N heal and Bloom When are retired names (the engine still runs them
  for an old custom card); Nectar Vintner has Healing 1, the Open Meadow grants Healing 1, Pollen Drift adds to Healing.
- **Bleed's fade**: a Bleeding unit takes its stack as damage each time it attacks or uses a skill (not when it is hit, not while it
  Waits); the stack drops by 1 at the start of every round, whether it bled that round or not (Festering holds it). Cleanse removes it;
  heals don't. *(Superseded by EN3, below: the stack now drops at the round's END, after it bled.)* As a stack fades (`bleedFade`), one greyed-out 🩸 drops from the card's Bleed pip to the ground under the card.

| Look | Function | What you see | Event |
|---|---|---|---|
| 🌸 Bloom | `bloomCopyVfx(srcUid, copyUid)` (`arena_app.js`) | Ten petals (spores for a fungus, a green film for an alga) drift from the unit into the free slot; the copy opens out of a soft ring of light, a circle widening from its centre, with a pink-green glow; "🌸 +1/+1" floats on the copy. Reduced motion: the copy fades in | `bloom`, then `spawn` with `kind: 'bloom'` |
| 🩸 Bleed fades | `bleedFadeDropVfx(uid)` (`arena_app.js`) | One grey 🩸 falls from the Bleed pip to just below the card, bounces once and sinks away (1.1 s). Reduced motion: it fades in place | `bleedFade` |

## 2026-10-23 additions (package EN3): Bleed takes its damage first, a Boomerang thrown on a miss, a Guardian for a Guardian, Rampart, Bramble Armor

The rules as built (engine: `bleedFadeAtEnd`, `redirectToGuardian`, `rampartShare`, `brambleArmorCut` in `damageHQ`; owner 19:27 #2-#9, #19):

- **Bleed's fade, at the round's end** (#5: "They should take the damage first"): a Bleeding unit loses 1 stack at the END of a round in
  which it started Bleeding or bled (was: each round's start, before it acted, so Bleed 3 dealt 2 + 1). A stack that lands after the unit's
  last action that round waits for the next round's end. Bleed 3 on a unit that acts every round: 3, 2, 1. A Waiting unit still loses 1 a
  round from its second round on. Festering holds it. `bleedFade` carries `atEnd: true`; the grey drop (BL) plays after the round's swings.
  Poison's tick was already damage then -1 in the engine; on the board the badge drop and the grey ☠−1 now come `EN3_STACK_DROP_MS` (about
  half a second) after the damage float, so the damage reads first. (Call EN3-2.)
- **Boomerang on a miss** (#7): a Blind or dark miss and a dodge (Evasive and the rest) throw too; the boomerang flies just past the unit or
  bramble it aimed at and comes back next round as any throw does. Event `boomerangThrow {miss: true, uid, targetUid | castle}` after the
  miss's own event; a landed throw has no extra event (its hit plays the throw).
- **A Guardian for a Guardian** (#8): when a Guardian steps in, a Guardian adjacent to it (not the unit first aimed at) steps in for it
  and takes the swing; one hop at most (call EN3-3). The hit names the unit first aimed at (`guardedUid`) and the Guardian it hopped
  through (`guardChain: [uid]`). *(Reverted by EN4, below: owner 22:23 #9, "Guardian shouldn't intercept an intercepting guardian." One
  Guardian steps in; no `guardChain`.)* **No guard line** (#19): the dashed line from the attacker to the Guardian (`FX.A.guardPull`) is gone; the
  shield still pops in on the side the blow comes from (`en3PatchGuardPull` swaps it once in `arena_app.js`).
- **Guardian and the bramble** (#2): Guardian never guards the bramble (as before; now said in its text; call EN3-1).
- **Rampart 🚧** (`effects.rampart`, #3; price 0.5): every hit on its own bramble that reaches `damageHQ` (a unit's swing, shot, skill,
  Pierce, an Overwhelm spill, a boomerang) is split: one Rampart unit takes ceil(half) (5: 3 and 2; 1: 1 and 0), the bramble the rest.
  The field's own bramble damage (Ley Lines, Ash Rain) doesn't come through `damageHQ` and isn't split. Which unit: the live one (any row)
  nearest the attacker's column; a tie or no attacker, the first listed. Its share is plain damage (`applyDamage`: its Shield and Shell
  soak first; no Armor, Thorns or On Attacked). Supreme crushes it. Event `rampart {uid, dmg, share, bramble}`, pushed inside `damageHQ`,
  so before the hit's own `hitHQ` (which keeps the bramble's part).
- **Bramble Armor 🌿🛡️** (`effects.brambleArmor`, #3; price 1.1): the bramble's part of each such hit is 1 less, after Rampart; two or
  more still 1 (call EN3-5). Supreme crushes it. Event `brambleArmor {uid, blocked: 1}`.
- Cards: Rampart on Riverworks Bastion (0/32 -> 0/30) and the new Dam-Keeper Beaver and Moat Snapper; Bramble Armor on the new Briarback Hedgehog
  and Barkplate Beetle (all four awaiting their source, call EN3-8).

| Look | Function | What you see | Event |
|---|---|---|---|
| 🪃 Thrown on a miss | `en3BoomMissThrow(ev)` (`arena_app.js`) | The boomerang curves out from the thrower to a point just beside its target (a stand-in tile, so nothing is knocked), flies on off the field; "🪃 Thrown!" floats on the thrower | `boomerangThrow` (`miss`) |
| 🛡 Guard, no line | `FX.A.guardPull` (swapped by `en3PatchGuardPull`) | Only the shield pops in on the side the blow comes from, with a ring; no dashed line | `hit` with `guardianRedirect` |
| 🚧 Rampart | `en3RampartVfx(ev)` (`arena_app.js`) | As the blow lands, a gold streak runs from the bramble to the Rampart unit; the unit flinches, its share floats on it with 🚧 | `rampart` |
| 🌿🛡️ Bramble Armor | `en3BrambleArmorVfx(ev)` (`arena_app.js`) | A small 🛡️ pops on the bramble with a ring and an armour ting; "🛡️ −1" floats | `brambleArmor` |
| ☠ Poison's stack | the `poisonTick` replay (`arena_app.js`) | The damage floats first; the badge drops and the grey ☠−1 falls about half a second later | `poisonTick` |

## 2026-10-23 additions (package EN4): no Guardian for a Guardian, Hemorrhage, Greater Poison, Shore Up

The rules as built (engine: `redirectToGuardian`, `en4Hemorrhage`, `en4GreaterPoison`, `GP_PER_STACK`, `applyPoisonTicks`, `en4ShoreUp`; owner
22:23 #7, #9 and 19:27 #4 option B; follow-ups 23:45). Already in the game and not duplicated: Hunter (Bleeding) = +N damage to a Bleeding unit;
Venom Pulse, now **Pulse** (below).

- **Guardian** (#9: "Guardian shouldn't intercept an intercepting guardian."): EN3's one hop is reverted. When a plain swing is aimed at a unit,
  one adjacent Guardian (at random if several) steps in and takes it; no other Guardian covers that Guardian. A Guardian aimed at directly can
  still be covered by a Guardian beside it (it wasn't intercepting). Kept from EN3: no guard line, never the bramble. The hit has no `guardChain`.
- **Hemorrhage 🩸²** (`effects.hemorrhage`, true; name: call EN4-1; price 2): its swing that lands on a Bleeding unit doubles the Bleed the unit
  already has; then its own Bleed (if any) adds as usual. A target with no Bleed gets nothing from it. Ghosts don't bleed. Swings and their
  prongs only (as the Bleed passive). Event `statusFx` `hemorrhage {from, total}` after the hit's Bleed.
- **Greater Poison 💀 N** (`effects.greaterPoison`, N 1 by default; price 2.5, scale half): its swing that gets through (damage dealt or
  converted, as Poison) turns ALL the Poison the target had before the hit into Greater Poison and adds N; the swing's own Poison then lands
  as plain Poison, for the next hit to turn. The status (`card.gpoison`): each round's tick deals `GP_PER_STACK` (1) a stack and the stack
  never wears down (owner 23:45: "Greater Poison tokens are not removed on every poison tick"; plain Poison still loses 1). It ticks after the
  unit's plain Poison. Cure takes Poison first, then Greater Poison; Pulse ticks both; Hunter (Poisoned) counts it; Shed and a Revive clear it;
  Structures and poison-immune units take none. Events: `statusFx` `greaterPoison {converted, amount, total, poison}` after the hit's Poison;
  `greaterPoisonTick {dmg, stack, decay: false}` at the round's start.
- **Pulse 💉 N** (owner 23:45: "Venom maybe can just be called pulse ... why not pulse affects both bleeding and poison units alike! No need
  for Poison Tick, cause you can just do Pulse N, default 1."): was Venom Pulse (the key stays `effects.venomPulse`, so saved cards read as
  before). Its landed swing makes the target's Poison (and Greater Poison) AND its Bleed tick N more times at once, each tick the whole stack;
  no stack wears down. The trigger action is **Pulse** (`do: 'pulse'`, the same); the **Poison Tick** action is retired (hidden in the editor,
  `retired: true`): the engine reads it as Pulse, and `en4MigrateCard` moves a saved card off it (an On Hit one aimed at the unit hit becomes
  Pulse N, any other the Pulse action, same N). Events: `poisonTick {pulse: true}` and `bleedTick {pulse: true, cause: 'pulse'}`. Price: the
  Pulse action 1.3 a tick, so Pulse 1 = On Hit 2.1 x 1.3 = 2.7 (Venom Pulse was 2.1). No card carries it.
- **Shore Up 🛡️↔️** (`effects.shoreUp`, true; option B of call EN3-7; price 1.5): when it is hit and lives (any hit that fires On Attacked: a
  swing, a shot, a damage or status skill), each live ally beside it in its row (left and right, not in front or behind) gets Shield 1
  (`grantShield`). One hit, one brace. A passive: it braces while Waiting; not from a cage. Event `shoreUp {uid, targets}`, then each
  Shield's `statusFx` `unitShield`.
- Cards (call EN4-4 for the placements): Great Skua (Hemorrhage, Map 3), Bloodscent Shark (Hemorrhage, Map 10), Cane Toad (Poison 1 + Greater
  Poison 1, Map 6), Inland Taipan (Poison 2 + Greater Poison 1, Map 18), Oyster Bank (Shore Up, 0 Attack, Map 2), Musk Ox Matriarch (Shore Up +
  Armor 1, Map 17).

| Look | Function | What you see | Event |
|---|---|---|---|
| 🩸² Hemorrhage | `en4HemorrhageVfx(ev)` (`arena_app.js`) | As the blow lands, the card pulses red twice, two 🩸 drops split off it, "🩸×2" floats and the Bleed pip shows the doubled stack | `statusFx` `hemorrhage` |
| 💀 Greater Poison | `en4GreaterPoisonVfx(ev)` | A violet 💀 pops on the card with a violet pulse; "☠→💀 N" (what it turned) or "💀 +N" floats; the green ☠ pip drops what turned and a violet 💀 pip shows the Greater Poison | `statusFx` `greaterPoison` |
| 💀 Its tick | `en4GreaterPoisonTickVfx(ev)` | Like Poison's: a shake, a violet pulse, the poison number; the 💀 pip stays (an old replay's `decay` still drops it) | `greaterPoisonTick` |
| 🛡️ Shore Up | `en4ShoreUpVfx(ev)` | "🛡️ Shore Up" on the unit hit; a small 🛡️ hops in an arc from it to each ally beside it and lands with a ring; their Shield shows | `shoreUp` |
