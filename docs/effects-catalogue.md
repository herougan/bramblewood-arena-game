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
| Bleed (`bleed`) | 12 | `SkillFX.bleedDrip`, red tint pulse | bleedTick |  |
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
| Bloom (`bloom`) | 2 | `SkillFX.bloomPollen` | heal from a Bloom unit | 🆕 |
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
| Bloom (conditions) (`bloomWhen`) | 0 | none (a rule or stat with no moment of its own) |  |  |
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
