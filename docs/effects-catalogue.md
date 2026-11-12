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
| Inspiring (`inspiring`) | 9 | the horn burst (`pl2InspireBurst`); ENG21: the 📯N Inspiration pip and the beat on the Attack number (`eng21InspNumFx`) | statusFx inspired, inspiredSpent | 🆕 |
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
| True Sight, was Keen Eye (`keenEye`) | 4 | none (a rule or stat with no moment of its own) |  |  |
| Keen Sense (`keenSense`) | 3 | none (a rule or stat with no moment of its own) |  |  |
| Lantern (`lantern`) | 3 | `SkillFX.lanternGlow` | play |  |
| Molting (`molting`) | 3 | floating text / sound only |  | — |
| Reload (`reload`) | 3 | floating text / sound only |  | — |
| Render (`render`) | 3 | `SkillFX.curseDrain` | render | 🆕 |
| Shock (`shock`) | 3 | glitch flicker | statusFx shock |  |
| Siege (`siege`) | 3 | floating text / sound only |  | — |
| Stun (`stunOnHit`) | 3 | `SkillFX.stunStars` | statusFx stunOnHit | 🆕 |
| Bloom, the old heal (`bloom`, retired 2026-10-23) | 1 | `SkillFX.bloomPollen` | heal from a Bloom unit |  |
| Bloom – {conditions} (`bloomCopy`) | 4 | `bloomCopyVfx`: petals / spores / a green film drift into the free slot, the copy opens out of a ring of light; "🌸 +N/+N" on the copy (ENG26: the Nth bloom of the side) | bloom, then spawn (kind bloom) | 🆕 |
| Boomerang (`boomerang`) | 2 | `SkillFX.boomerang*` | hit / hitHQ by a boomerang unit |  |
| Bulwark (`bulwark`) | 2 | floating text / sound only |  | — |
| Coffee (`coffee`) | 2 | `SkillFX.clockTick` fast, "☕ ×2" (ENG11: acts twice every N turns) | statusFx coffee / coffeeCrash | 🆕 |
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
| Reach (`reach`) | 2 | "↗ Reach" float on the striker + its log line | statusFx reachAim (ENG37, 2026-11-08: with nothing opposite it strikes an enemy in the lane beside it) |  |
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
| 🧊🏹 Ice Arrow | `bowShot` | The bow shot; when it freezes (every landed shot since ENG28; was 1 in 2), the ice block grows over the unit | `arrow` (ice) + `hit`; `statusFx` freeze |
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
- **Ice Arrow N**: N cold at the nearest enemy and a Freeze counter on a unit that has none (ENG28, 2026-11-07: every time, was 1 in 2; it holds that round's attack and
  melts at the round's end). **Twin Shot N**: two arrows of N at two different random enemy units (both at one if only one).
  **Volley N**: on its 1st, 3rd, 5th... Ready round, an arrow of N at every enemy unit.
- **Bolts** (every round while Ready, before melee; at the enemy opposite, else the nearest enemy unit, else the castle):
  Fire Bolt N = N fire + 1 Burn (ENG28); Acid Bolt N = N acid + 1 Corrode; Poison Bolt N = no damage, N Poison; Ice Bolt N = N cold + a
  Freeze counter (ENG28; was 1 in 2); Shock Bolt N = N damage + Shocked for a round. Helmet deflects them half the time.
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
  (since WIND-2 a, 2026-11-02, a Headwind doubles nothing: it is -1 Attack for the Flyers; see Wind in the EN2 section).

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
| 👀 Ambush N | also strikes a unit that moves in; at once, the round's start too, and never while its unit is Asleep, Stunned, Frozen, Chained or stone (ENG12, 2026-10-28) | `FX.A.ambushStrike` | `atk-ambush` C |
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

**Guardian and dodges (ENG29, 2026-11-07).** The Guardian steps in for the attempt, before any dodge roll (`redirectToGuardian`, then `combatHitLands` on the Guardian). The ward's Flying, Evasive, Swift, Mach, Invisible, Shadow, Smoke and other dodges don't roll; the Guardian's own dodges and the field's misses do. A Guardian that dodges: nobody takes the swing; the `evaded` event is on the Guardian with `guardianRedirect` / `guardedUid`, and the board plays the step-in and the dodge together (`en2GuardStepIn`, without the block pulse). The attacker's own Blind / dark miss rolls first, as before. Main swings and Fork prongs; shots already did this (ENG22).

**Boomerang.** The throw swings at Speed 0 (its old base of 1 is gone; Speed and Haste still add). A throw at the bramble flies on past it at the
same speed (`en2BoomCastleThrow`); next round it comes back the same way: it strikes the bramble again, then the unit now in its lane on that
side (`boomCastleLaneUnit`; the `hitHQ` carries `thenUid`, the unit's own `hit` carries `viaCastle`), then flies home (`en2BoomCastleReturn`).
With the thrower dead it still flies home: it hits its far target again, then the unit standing in the thrower's slot (a Boomerang unit catches
it), else the side's own bramble; the `boomerangReturn` event names `homeUid` / `homeCastle` / `farUid` and the board draws one flight
(`en2BoomOrphanFlight`). Price: 3 → 1.9 (Bananarang too).

**Wind.** Tailwind: the side's Flyers are Quick for the round (their swing at Speed 2, `_windQuick`); no Fast Forward turn, so a Waiting Flyer
still waits. Headwind: the side's Flyers get -1 Attack for the round (`headwindAtkCut`, read live by `effAtk`, never baked into the card; the
board floats "Headwind: −1⚔" on the `statusFx` `headwind` event). Nothing goes off twice (`headwindTwice` is always false). While Ashy grounds the
Flyers there is no Tailwind or Headwind. 2026-11-02 (FIX4, decision WIND-2 a, built in ENG16; was: a Headwind Flyer's active skills went off twice).

**Swarm** counts allies by Type only: the archetypes a card lists and the wider Types above them (Coral Reef is Ocean is Aquatic), never its
species or animal (`swarmTypeShares`). Structures that share a Type count (ENG19, 2026-11-02; EN to ENG19 they didn't). The board's Attack follows the replay: as an ally dies mid-round the Swarm
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
  of its counters or statuses. It arrives with its printed Wait, can't bloom itself (until EN5: a copy blooms once too, see above), and leaves no card in the graveyard when it dies.
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
- **Fortify 🌿🛡️** (was Bramble Armor; renamed 2026-10-26, FIN2-a, owner: "Bramble Armor: Fortify instead."; key `effects.brambleArmor` kept, #3; price 1.1): the bramble's part of each such hit is 1 less, after Rampart; two or
  more still 1 (call EN3-5). Supreme crushes it. Event `brambleArmor {uid, blocked: 1}`.
- Cards: Rampart on Riverworks Bastion (0/32 -> 0/30) and the new Dam-Keeper Beaver and Moat Snapper; Fortify (then Bramble Armor) on the new Briarback Hedgehog
  and Barkplate Beetle (all four awaiting their source, call EN3-8).

| Look | Function | What you see | Event |
|---|---|---|---|
| 🪃 Thrown on a miss | `en3BoomMissThrow(ev)` (`arena_app.js`) | The boomerang curves out from the thrower to a point just beside its target (a stand-in tile, so nothing is knocked), flies on off the field; "🪃 Thrown!" floats on the thrower | `boomerangThrow` (`miss`) |
| 🛡 Guard, no line | `FX.A.guardPull` (swapped by `en3PatchGuardPull`) | Only the shield pops in on the side the blow comes from, with a ring; no dashed line | `hit` with `guardianRedirect` |
| 🚧 Rampart | `en3RampartVfx(ev)` (`arena_app.js`) | As the blow lands, a gold streak runs from the bramble to the Rampart unit; the unit flinches, its share floats on it with 🚧 | `rampart` |
| 🌿🛡️ Fortify (was Bramble Armor) | `en3BrambleArmorVfx(ev)` (`arena_app.js`) | A small 🛡️ pops on the bramble with a ring and an armour ting; "🛡️ −1" floats | `brambleArmor` |
| ☠ Poison's stack | the `poisonTick` replay (`arena_app.js`) | The damage floats first; the badge drops and the grey ☠−1 falls about half a second later | `poisonTick` |

## 2026-10-24 additions (package EN5): Deadly Poison, Breach, Canopy Cover, the state skills, Hemorrhage N, Bloom's chain

The rules as built (engine: the EN5 block, `en5HemoN`, `en5Breach`, `en5Woods`, `en5CanopyCover`, `EN5_STATES` read in `condStatsOf`,
`bloomSlotOf`; owner 02:59 and 03:12).

- **Deadly Poison 💀** (was Greater Poison; owner 02:59 #3): the name players see in every pack, the Codex and the log. The key stays
  `effects.greaterPoison` (the status `card.gpoison`), so saved cards read as before. The rule is EN4's (below).
- **Breach 🧱 N** (`effects.breach`, N 1 by default; owner 02:59 #6, name EN5-1; price 1.9 a point): every melee swing of its that lands on a
  unit (the On Hit moment, whatever the hit did) also deals N to the enemy bramble through `damageHQ` (Rampart and Bramble Armor see it). A
  dodged swing, or a swing at the bramble itself, gives none. Event `breachHQ {dmg, n}`. Puncture is the same rule under an older name and
  price (call EN5-2).
- **Canopy Cover 🌳** (`effects.canopyCover`; owner FLY-1): a ground unit (no Flying now; a grounded or ash-grounded flyer counts) dodges 1 in 2
  of the single-target shots and skills aimed at it and of the swings of Flying or throwing (Boomerang, Bananarang) attackers (since ENG13,
  2026-10-29, owner: "Canopy cover only blocks 50% attacks from ranged and flying attacks"; a ground unit's melee swing is no longer dodged;
  `en5FromAbove`), one roll like Evasive (never a second roll on top of Evasive), while the field
  has trees over it: rules.woods (every fight on a forest-biome map, set by `fightRules`, the first skirmish too), the Old Woods terrain
  (rules.terrain.biome 'forest'), High Canopy (rules.canopy) or the Undergrowth (rules.undergrowth). A hiding dodge: Exposed and True Strike
  see through it. Miss reason `canopyCover`. Priced as a half-miss skill conditioned on the field: Evasive's 1.37 x uptime 0.4 on the stats.
- **Timbered 🪵 / Bedrock 🪨 / Forged 🔩 / Last Stand 🏳️ – {…}** (owner 03:12 / 03:12b): state skills like Tide: while the side's state holds,
  the braces (`effects.<k>Grant`), or the default when the card prints the plain skill: Timbered (you hold 3+ Lumber) +0/+2; Bedrock (2+
  Stone) Armor 1; Forged (1+ Metal) +1/+0; Last Stand (your bramble at a third of its Health or less) +1/+1. Lumber, Stone and Metal are the
  side's counts in the fight (`pl.lumber`, `pl.stone`, `pl.metal`). They turn on and off at each stat sync (a play, a pitch, a round's
  start, after combat); event `statusFx` `stateSkill {name, on}`. Priced: the default x uptime (0.25 / 0.2 / 0.5 / 0.2), the braces x the same.
- **Hemorrhage N** (owner EN4-1: "It adds 0 bleed by default (N=0)"): the doubling is unchanged; N more Bleed lands after it, beside the card's
  own Bleed. Plain Hemorrhage (true) is N 0. Price 2 + Bleed N.
- **Bloom** (owner BL-1 / BL-2, 03:12): the copy can bloom too, once (each unit once: `c.bloomed`), so a chain can grow. Beside it: left or
  right in its row, and on a board with more rows (a raid, the Group Dungeon) the cell in front of it or behind it; one free neighbour at
  random. Priced with the chain: p x (1 + q + q²), q 0.43 (`bloomChainOdds`).
- **Bleed / Poison prices** (owner BP-1): S(N) = 3.6 x N^0.6 and 3.0 x N^0.7 (fitted to the robust skill test's worth at N 1-3).

| Look | Function | What you see | Event |
|---|---|---|---|
| 🧱 Breach | `en5BreachVfx(ev)` (`arena_app.js`) | A 🧱 chip spins from the unit to the enemy bramble, which knocks back; the number on the bramble's bar; its Health drops | `breachHQ` |
| 🌳 Canopy Cover | `en5CanopyVfx(ev)` | Leaves spray off the unit with a green pulse, over the usual dodge and its "Evaded!" | `evaded` reason `canopyCover` |
| ✨ A state skill | `en5StateVfx(ev)` | On: its icon pops on the card in a ring, "🪵 Timbered" floats, a lit gold pip stays on the card while it holds; off: the pip goes | `statusFx` `stateSkill` |
| 👤 People | `gdPeopleHTML` | The Group Dungeon card: 👤👤 and two lighter, "2 to 4 players"; the lobby: a lit 👤 per player, 🤖 per CPU ally, a dim one per free seat, "N / M" | (page) |

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

## 2026-10-24 additions (package DF3): the selfish boons

A selfish boon is a field effect that helps the enemy only, on while at least half the enemy deck as dealt shares its theme (the rules:
`SELFISH_BOONS` in `bramblewood-engine.js`; the library and its worth: `docs/balance/df3-boons-2026-10-24.md`).

| Look | Where | When |
|---|---|---|
| A red-framed Environment card (red frame and corners, red "Theirs" ribbon, a dark red line with the count "On: 11 of 16 enemy cards share the theme"); dimmed while off | `fieldCondCardHTML` (`.env-card.is-selfish`, `.is-boon-on` / `.is-boon-off`) | every fight with a boon |
| The card straightens and shines (FX4's `envCardsFire`), the helped unit glows red (`.boon-touched`) and floats the boon's icon and name | `boonFireVfx`, the `boonFire` event (one a unit a round) | Blind Fury's doubled swing, Hive Chorus's doubled Swarm, Wild Rage's early Rage, a Quick swing from Rising Tide or Sky Ambush, Snow / Sand Veil's dodge, Second Burrow's return, Restless Dead's revive, a unit arriving with Siege Train / Venom Glands / Ember-born / Sky Ambush |
| A "⚔️ Challenge" pill and the boon's red pill in the fight panel | `skirmishFieldHTML` | a challenge skirmish |
| The log line "Blind Fury helps the enemy: Cave Olm." | `logText` case `boonFire` | as above |

## 2026-10-24 additions (package EQ2): durability, Dive, Bolster and the Health bar, Parasite, the Beak Strike

The rules as built (engine: the Package EQ2 block in `bramblewood-engine.js`, `EQ2_DEF`; board: the Package EQ2 block in `arena_app.js`).
- **Durability** (owner EQ-1): every equipment piece has durability (`equip.durability`, else by rarity: Common / Uncommon 3, Rare to Super
  Rare 4, Epic and up 5). A hit on the wearer takes 1 (a swing, shot, bolt, raid smack or floor burn; a status tick is no hit), an acid
  hit 2, each Corrode applied 2. At 0 the piece breaks: it leaves play (the graveyard) and its Attack, Health (never below 1) and granted
  skills come off. A loose or stolen piece keeps its wear; one worn out by the blow that fells its unit breaks instead of dropping.
- **Dive ⤵️ N** (`effects.dive`, N 1; owner N21-5, call EQ2-2): once a fight its swing dives on the weakest unit (least Health, nearest on a
  tie) of the row it faces, past any Taunt, for N more; a Guardian beside the target still steps in. A diving Flyer is exposed: no Flying
  dodge against it for the rest of that round. Only a Flyer, a Tide unit or a Sprinter dives (`diveEligible`).
- **Bolster 🫧 N** (`effects.bolster`, N 2; owner N21-7): N temporary Health as each round's fight begins (`c.tempHpR`), spent before Shell's
  temporary Health, a Shield and Health; what is left is gone when the next round's fight begins (set afresh, never stacked).
- **Parasite 🪱** (`effects.parasite`; call EQ2-4): may be played onto an enemy unit in reach (`parasiteTargets`); it rides its host
  (`host.parasite`), can't be hit, waits its Wait, then feeds as each round's fight begins (its Attack as a flat hit, healing as much); when
  the host dies it drops onto your side in that column if the slot is free, else into your graveyard.
- **Beak Strike** (the Goliath Core's `pattern: 'single'` attack; owner N22-12): 3 to your unit with the most Attack every 2 turns; a
  Guardian adjacent to it (left, right, in front, behind) takes it instead.

| Look | Where | When |
|---|---|---|
| The carried piece's icon on the card's left edge with a column of durability pips (lit = left; the last one red) | `eq2MarksHTML` (`.eq-under`, `.eq2-pip`) | a unit carrying a piece; a loose piece shows its pips too |
| The pip column pops on a hit; an acid or Corrode wear floats "🧪 −2🛡️" | `eq2Vfx` `equipWear` | each wear |
| The piece shatters off the card (its icon spins away with five shards), "💥 Broken!" floats, a lock-break sound; the stats drop | `eq2Shatter`, `eq2Vfx` `equipBreak` | a break |
| The Health bar along the foot of the art: printed Health green, bonus Health gold, temporary Health pale blue | `eq2HpBarHTML` (`.eq2-hpbar`) | a unit with bonus or temporary Health |
| "🫧 +2" floats as Bolster comes up; the pale blue end shrinks as it soaks | `eq2Vfx` `statusFx` `bolster`, `tempSoak` | each round |
| The diver rises and swoops (`.eq2-diving`), "⤵️ Dive +2" floats, a feather flutter | `eq2Vfx` `dive` | a dive |
| Held Parasite: the enemy units in reach get a pink dashed drop target | `eq2SyncHolding` (`body.eq2-para-holding`, `.eq2-para-drop.is-ok`) | holding a Parasite card |
| The host flashes pink as it is hooked; a 🪱 badge with the Parasite's Attack on its right edge; the badge throbs as it feeds, the damage number on the host | `eq2Vfx` `parasiteAttach`, `parasiteDrain` | a hook-on, each feed |
| A 🦑 flies from the boss's bramble to the struck unit; "🦺" on the Guardian and "🦺 Guarded" on the unit it covered; the damage number | `eq2Vfx` `raidStrike` | the Beak Strike |

## 2026-10-24 additions (package EN6): the hand, heat and frost, the weather and the seasons, Full Hand / Lean, Hibernate, – bramble

The rules as built (engine: the EN6 block, `EN6_STATES` and `en6StatesOn` read in `condStatsOf` beside EN5's, `en6HandAtk`,
`en6HibernateSync`, `en6RoundStart`; owner 03:17, all approved 12:02 #11). Prices: `canonical/skill-costs.json` (`tools/en6_skill_costs_2026_10_24.py`)
and `bramblewood-budget.js` `EN6_UPTIME`; uptimes measured by `tools/en6_state_uptime_2026_10_24.js` (`docs/balance/en6-state-uptime-2026-10-24.json`).

- **State skills – {…}** (EN5's pattern: the braces `effects.<k>Grant` while the state holds, the default when the card prints the plain name;
  they share EN5's `stateSkill` event, the lit gold pip and the float; turned on and off at every stat sync):
  - **Plenty 🃏** you hold 4+ cards (default +1/+1) · **Scarcity 🫗** you hold 1 or none (+1/+0) · **Foe's Plenty 🎴** the opponent holds 4+
    (+0/+2) · **Foe's Scarcity 🪹** the opponent holds 1 or none (+1/+0). The hand is read as it stands (combat starts after the plays).
  - **Heat 🌡️** the field is hot (+1/+0): Scorching (field `heatwave`), a hot map (`rules.hotMap`: the ash, forge, frostfire and pale-desert
    biomes, set by `fightRules`), the volcano's fires (`rules.eruption`, `volcano`, `wildfire`, `lavaSpout`, `ashRain`), Summer.
  - **Frost ❄️** the field is cold (+0/+2): Frigid (field `frozen`), Hail, Freezing, the map's frost (`rules.frostbite` / `frostWait` /
    `frostCount`), a cold map (`rules.coldMap`: tundra and frostfire), Winter. Both sit beside heat / cold resistance, which is unchanged.
  - **Rain ☔** Spring Rain (field `rain`: the map or a Rain card, a Rainmaker) or a Thunderstorm (+1/+1) · **Storm ⛈️** a Thunderstorm or a
    strong-wind round (`isWindy`: Windy, Gale, a Sandstorm's wind) (+2/+0) · **Fog 🌁** Thick Fog (field `fog`) or the Mist (`rules.misty`)
    ({Evasive}).
  - **Salt 🧂** a salt-water map (`rules.saltMap`: beach and reef) while the tide is out (`getTide() === 'ebb'`) (Armor 1). No tide, no salt;
    Perma-tide never ebbs.
  - **Drought 🔆** after 3 rounds in a row without rain (`en6DryRun`, counted at each round's start) on a dry fight with weather
    (`rules.weatherMap`: savanna and pale desert; or wind, a Thunderstorm, Mist, Hail, Seasons, or rain earlier in the fight); never on a wet
    map, Perma-tide, dark or the depths (+1/+0).
  - **Season (X) – {…}** `effects.season` names the season (spring / summer / autumn / winter; Winter when unset), `seasonGrant` its braces
    (+1/+1): on in that season of the **Seasons** field option (`rules.seasons`: true = 3 rounds a season, a number = that many;
    `rules.seasonStart`, Spring by default). Summer counts as hot and Winter as cold. Event `season {season, round}` as it turns. On no map yet.
- **Full Hand N ✋ / Lean N 🫳** (and **Foe's Full Hand / Foe's Lean**): +N Attack per card in the hand / per empty slot below the hand limit
  (MAX_HAND 5), yours or the opponent's, on the same situational bonus as day and night.
- **Hibernate N 🛌** (plain 2): while `en6HibernateCond()` (a cold field: Frigid, Hail, Freezing, the map's frost, Winter; or night / twilight
  on a cold map) the unit hibernates (`c.hibernating`): its Asleep is held on (no swing, shot or trigger; its Wait does not tick), a hit does
  not wake it, its Taunt and Guardian are off; at each round's start it heals N (a `heal` event, cause `hibernate`). It wakes as the
  condition ends (`statusFx hibernate {on}`). Priced 0.95 a point, and its Attack counts x (1 - 0.47) in the budget.
- **– bramble** (owner 03:17 #2): `effects.arrowBramble` / `fireArrowBramble` / `fireBoltBramble` aim that skill's shot at the enemy bramble
  every round (card text "Arrow 2 – bramble"); a trigger's `t.bramble` does it for the Arrow and Missile actions and for Deal damage at one
  opponent (the trigger editor's "– bramble" box). The arrows are `arrow` events at the bramble (no target unit); Missile and Deal damage
  add a `brambleShot` event (its 🏹 look and log line). Through `fireDamageAction`'s bramble path: Rampart and Bramble Armor
  still cut it. Priced x0.9 of the shot or action (the modifier `bramble`).

| Look | Where |
|---|---|
| A state skill on: EN5's ring, its icon float and the lit gold pip (🃏 🫗 🎴 🪹 🌡️ ❄️ ☔ ⛈️ 🌁 🧂 🔆 🍂) | `EN6_STATE_KEYS` joins `EN5_STATE_KEYS` (`en5StateVfx`, `en5StatusBadges`) |
| Hibernate: a pale blue 🛌 pip beside the 💤, "🛌 Hibernating" / "Awake" floats, a cold tint; the heal's motes are the plain heal's | `en6StatusBadges`, `en6Vfx` (`.abadge.en6-hib`, `.en6-hib-pulse`) |
| A – bramble action: a 🏹 flies from the unit into the enemy bramble | `en6Vfx` (`.sfx.en6-bramble-arrow`) |
| The season turning: a float over the board and a gold log line | `en6Vfx`, `en6LogText` |

## 2026-10-24 additions (package EN7): Dive in two turns, Poison / Bleed on extra hits and – poison / – bleed, Parasite x Bloom

The rules as built (engine: the EN7 blocks in `bramblewood-engine.js`, beside `eq2DivePick` and `en4Hemorrhage`; board: the Package EN7 block
in `arena_app.js`, the Poison look in `bramblewood-fx-d.js`). **Replaces EQ2's one-swing Dive** (above).
- **Dive ⤵️ N** (`effects.dive`, N 1; owner 13:12 #3, calls EN7-1, EN7-4): once a fight (`effects.diveUses` N for more), at its swing, with an
  enemy unit in the row it faces, it rises instead of swinging: a Flyer (and a Sprinter) goes aloft, a Tide unit without wings goes under
  (`c.diveAloft`, `c.diveMode`). Until its next swing nothing can find or hit it (`isInvisible`, `dodgeCheck`, `combatHitLands`; a Spotter
  neither) and it can't step in as a Guardian (`isLiveGuardian`); area damage and its own status ticks still reach it. Its next swing strikes
  the weakest unit of that row (least Health, nearest on a tie; `eq2DivePick`), past any Taunt, for Attack + N; a Guardian beside the target
  still steps in. That round it is Exposed (`c.diveExposed`): no Flying dodge, no Tide evade (`tideEvades`). A diver that could not strike
  comes down at the round's end (`diveLand`). Only a Flyer, a Tide unit or a Sprinter dives (`diveEligible`). On Puffin Diver and Harbor Seal.
- **Poison / Bleed on the unit's own hits** (owner 13:12 #5, call EN7-3; `en7HitStatuses`): Poison N / Bleed N (Rabid, Greater Poison,
  Hemorrhage, Venom Master, Thornbite) ride on every landed hit of its own attack damage: the swing, Frenzy / Twin Strike swings, Fork /
  Trident / Pitchfork prongs and Octolash lashes (as before), and now Pounce and the Ambush strike (Cleave's side damage is a spread, an area: none). A shot or action (Arrow, Fire
  Arrow, a Bolt, Missile, Deal damage, Volley, Snipe ...) carries none unless the card says **– poison** / **– bleed** on it:
  `effects.arrowPoison` / `arrowBleed` / `fireArrowPoison` / `fireArrowBleed` / `fireBoltPoison` / `fireBoltBleed`, or `t.withPoison` /
  `t.withBleed` on an Arrow, Missile or Deal damage (one enemy) action. It gives the unit's own N, at least 1. Card text "Arrow 2 – poison".
- **Parasite x Bloom** (owner 13:12 #2, call EN7-2; `en7ParasiteBloom`): a Parasite's bloom copy (+1/+1, its printed Wait) hooks onto an enemy
  unit beside its host (left, right, in front, behind; no parasite, not a Structure or a cage; one at random); played as a plain unit, onto
  an enemy facing it or one column beside that. None: it waits and tries again next round. Events `bloom {parasite}`, `parasiteAttach {bloom}`.
- Prices (4-round rule, `tools/en7_skill_costs_2026_10_24.py`): Dive 1.25 x N^0.5 (was 0.75 N); – poison / – bleed on a shot 0.9 x the
  status's price at the unit's N (modifier `tip`); on an action + 0.9 x the Poison / Bleed action's value; Pounce / Ambush on a Poison / Bleed
  card + 0.33 / 0.3 x that status's price (`bramblewood-budget.js` `EN7_EXTRA_HIT`).

| Look | Where | When |
|---|---|---|
| Aloft: the card lifts off its slot and bobs, its shadow left on the board below, a ☁️ tag; "☁️ Aloft" floats, a feather flutter | `en7Vfx` `diveRise`, `.en7-aloft`, `en7DiveMarksHTML` (`.en7-shadow`, `.en7-dive-tag`) | a Flyer's rise, and while aloft |
| Under: the card sinks and fades under a band of moving water, a 🌊 tag; "🌊 Under" floats, a splash ring | `en7Vfx` `diveRise`, `.en7-under` (`.en7-water`) | a Tide unit's dive, and while under |
| A swing or shot at it: "☁️ Out of reach" | `en7Vfx` `evaded` (reason `aloft` / `under`) | while aloft / under |
| The strike: it plunges back (from the water with a splash) and lunges, "⤵️ Dive +N", then "🎯 Exposed" | `en7Strike` (from `eq2Vfx` `dive`) | the strike |
| A diver that couldn't strike comes down: "🪶 Lands" | `en7Vfx` `diveLand` | a missed strike round |
| The Guardian that steps in tilts 10° toward the attacker while it takes the hit, then settles as it slides home | `en2GuardStepIn` (`EN7_GUARD_TILT`, the rotate property) | a Guardian intercept |
| Poison runs out: the pool sinks below the card's foot as it fades (its last bubbles still rise) | `bramblewood-fx-d.js` `psnSink` (`M.poisonSink`) | Poison reaching 0 |
| Applied Poison / Bleed / Deadly Poison float "🤢N" / "🩸N" / "💀N" (was "🤢 💀 +N", "+N🩸", "💀 +N") | `ui.en7-float-poison`, `ui.en7-float-bleed`, `ui.en4-float-gp` | each application that floats |
| A Parasite's bloom: a 🪱 flies from the parent's host to the new host, "🌸 +1/+1" there | `en7Vfx` `parasiteAttach {bloom}` | the bloom |

## 2026-10-24 additions (package EN8): the CPU's pitch and guard, Guardian vs Thorns, Armor vs magic, brambles mend allies, Rampart's columns, the resource skills and Pearls

The rules as built (engine: the EN8 block after `trigsOf`, `aiUsefulNow` / `aiLethalBlock` beside `aiTakeTurn`, `computeHitDamage`,
`damageCardFlat`, `redirectToGuardian`, `rampartShare`, `roundStart`; owner 21:20 #4 #7, 21:41 #5, 22:28 #1-#3 #10, P24-7 / 15 / 16 / 17, LUM-1):
- **The CPU's pitch** (every level, the game and the sims alike: `aiTakeTurn`): the pitch now comes before the play, once a turn. Nothing
  useful to play (`aiUsefulNow`: payable, and not a spell with nothing to do, an evolute with no base, a field card or a Dark Summon) -> it
  pitches its least valuable card, keeping the one nearest to affordable. Holding a card it can't afford (short only of Lumber / Stone / Metal,
  Pearls counted: `aiResourceGap`) with 3+ cards in hand -> it pitches a spare card (not that card, not the best card it can play) and still
  plays. A turn with no card down and no pitch yet ends in a pitch (a held useless spell no longer passes the turn).
- **The lethal guard** (P24-7; `rules.aiGuardLethal`, set by `fightRules` on Conquest fights from Map 1): when your Ready units' swings into
  open columns (`aiIncomingOnBramble`) would take its bramble's Health and Shield, and it can't win this round itself, the CPU plays the unit
  that stops the most of it into the attacker's column (a legal slot; ties: the sturdier unit). It blocks what it can even when it is not enough.
- **Guardian vs Thorns** (P24-15): a Guardian never steps in for a unit with Thorns (printed or Durian's): the Thorns unit takes the swing
  and its Thorns answer. Thorns damage is never redirected.
- **Armor vs magic** (P24-16): Armor (and all it sums: Shell, the tide's, Prayer Ward, Shieldwall) stops only physical hits; magic and every
  element (fire / heat, frost / cold, shock, poison, acid, water, decay ...) go past it. **Magic Armor N** 🔮 (`effects.magicArmor`; price
  0.4 a point) is the other half: N off each magic or elemental swing, shot or skill, never a physical one and never a status tick. Supreme
  crushes it. The hit's `mods` carry `magicArmor`.
- **Brambles mend allies** (P24-17): a bramble's healing passive (`castleRegen N`) heals one random wounded ally unit N at each round start
  (never a Structure, never the bramble); event `heal {cause: 'brambleMend', castle: true}`. `applyHeal` and the Mend spell never heal a
  Structure: Repair N and Rebuild put Health back on Structures and brambles.
- **Rampart's columns** (21:41 #5): a Rampart unit covers only a hit whose attacker stands in its column or the one on either side
  (|slot difference| <= 1); a hit with no attacker in a column isn't covered. Price 0.5 -> 0.25.
- **The resource skills** (LUM-1, default 1 each; prices by the 4-round rule, `tools/en8_skill_costs_2026_10_24.py`):

| Skill | Key | Rule | Price |
|---|---|---|---|
| ⛏️ Stonecutter N | `stonecutter` | every 2nd Ready turn: +N Stone (On Turn Start x Gain with `t.every 2`) | 1.8 / N |
| 🪙 Prospector N | `prospector` | On Kill: +N Metal | 1.2 / N |
| 🪓 Felling N | `felling` | On Kill: +N Lumber | 0.8 / N |
| ⚪ Pearl N | `pearl` | On Ready, once (a Wait 0 card: On Play): +N Pearl (ENG19; Pearl Bed's rule before) | 0.9 / N |
| 🦪 Pearl Bed N | `pearlBed` | every turn while Ready (On Turn Start): +N Pearl (ENG19; On Ready once before) | 0.9 / N (re-price: ENG19-3) |
| 🌳 Coppice N | `coppice` | a round it took no damage: +N Lumber at the next round's start (from its 2nd round) | 1.1 / N |
| 🪵 Driftwood N | `driftwood` | at an Ebb round's start on a beach map (`rules.beachMap`): +N Lumber | 0.75 / N |
| 🦝 Scavenge N | `scavenge` | another of your units dies: +N Lumber (always on) | 1.5 / N |
| 🏚️ Salvage N | `salvage` | another of your Structures dies: +2N Lumber (always on) | 0.75 / N |
| 🍃 Windfall (field) | `rules.windfall` | after a Storm round (a Thunderstorm or a strong-wind round), both sides +1 Lumber; on the windy maps up to Map 20 | - |

  (Scavenge and Salvage were SK2's point counters, on no card; their names now carry LUM-1's plain rules.)
- **Pearls** ⚪ (`pl.pearls`): Shellfish grow them (Pearl, Pearl Bed). When a card's Lumber or Stone can't be met, Pearls make up the rest
  (`canPlay` counts them, `pearlSettle` pays them after the Lumber / Stone). The CPU counts them too. Event `pearl {amount}`.
- **Render N → Daunt counters** (owner 00:02 #2, 2026-10-25; `fireRender`, `en8DauntUse`): Render N now puts N Daunt counters on the enemy
  facing it (`card.dauntN`; was: it lost N Attack for good). Each counter is -1 Attack (`dauntOf`, with Daunt N's on-hit marks) and -1 on
  each of its skill hits (`damageCardFlat`). One falls off at each round's end, one each time it swings (its action) and one each time it
  uses a skill (a trigger that ran an action; its On Action / On Attack hooks are the swing's). Cleanse takes them, one a point. Price 0.8 a point (was half-scale 2). Event `render {daunt: true, amount, total}`, `statusFx dauntFade {left, why}`; the 😨N
  badge, "😨 N" float and log line.
- **"?" skills** (21:20 #7): a card's `mysterySkills` read "❓ ?" on its face and in its detail (the Cocoon's Chrysalis until the Evomax maps).

| Look | Where | When |
|---|---|---|
| ⚪ N pill beside the Lumber / Stone pills; "+N ⚪" floats to it | `sideResourcePillsHTML` (`hudPearlPill`), `floatResourceGain` | Pearls held / a `pearl` event |
| "+N 🪵" from the unit to the Lumber pill (the usual Lumber float), a log line per cause | `en8LogText` (`ui.en8-log-*`) | Scavenge, Salvage, Coppice, Driftwood, Windfall |
| The heal's motes and number on the ally the bramble mends | the plain `heal` look | `heal {cause: 'brambleMend'}` |
| A gold streak to the Rampart unit (EN3's look) | `en3RampartVfx` | only a hit from its reach now |

## 2026-10-26 additions (package ENG9): Undead and Revive, Poison Barbs, status-only shots, Armor vs magic, Ready blockers, Bound and Tangled, Fork's lines, one-shot skills

The rules as built (engine: `isMagicDmg` in `computeHitDamage` / `damageCardFlat`, `reviveFromGrave`, the Undead branch of `removeDeadCardsPass`, `en7StatusOnly`, `blockerReady`, `tangleUnit`, `bloomFail`, `spendOnReady`, `chargeTick`, the Fork block of `resolveCombatInner`; budget: `chainedMult`; owner 10-25 17:53 / 22:36, OWN-Q1):
- **Undead** (`effects.undead`, the old self-Revive): a true death, then back once at 1 Health as a token (`card.undeadToken`); its next death leaves no card in the graveyard or the Removal Zone. Event `revive {undead, token}`.
- **Revive N** (`effects.revive` N = On Play: Revive N; the trigger action `revive {count}`): N random creature cards from the owner's graveyard come back beside the source as real cards. Events `spawn {kind:'revive'}`, `reviveGrave`.
- **Poison Barbs N** (`effects.poisonBarbs`): every swing it takes gives the attacker N Poison (no damage); never redirected, and a Guardian doesn't step in for it. Event `statusFx poison {via:'barbs'}`.
- **Status-only shots:** a "– poison / – bleed" Arrow, Fire Arrow, Ember Spit, Missile or Deal damage (one unit) deals 0 damage at a unit and gives its N as counters (both when it says both); at a bramble it deals its N.
- **Armor** stops every hit but magic (magic, dark, holy) and true damage, on swings as before; **Magic Armor** stops magic only, on swings and shots. The five elemental spits are named Ember / Acid / Venom / Frost / Spark Spit (keys `fireBolt` ... unchanged).
- **Guardian** (and **Rampart**) step in only while Ready and not Bound (`blockerReady`); a Guardian now takes a counter-attack too (the hit carries `guardianRedirect` / `guardedUid`).
- **Daunt counters** (Render) fall off only on a damage action: a swing, a shot round (`fireShotsOf`), a trigger that dealt damage (`_dauntDmg`). No round-end fade.
- **Bloom:** tests only while Ready; with no free slot (a Parasite: no host) it fails: +1/+1 on the unit, no Lumber. Event `bloom {failed:true, atk:1, hp:1}`; the board plays `SkillFX.bloomFail` (two ghost copies pull apart, blush red, fall back; the card swells).
- **Cleave** side hits that get through carry the unit's Poison / Bleed (`en7HitStatuses`, via `cleave`).
- **Dive** is open to Quick units; a unit aloft or under has no Quick (`swingSpeedOf`). A Bound unit can't dive.
- **Bound** (Strangle): swings and counters at half (`computeHitDamage`, mod `bound`), shots and damage actions at half (`fireDamageAction`), no Guardian / Rampart / Dive / Charge countdown, no Flying dodge. It no longer skips the swing.
- **Tangled** (Tangleweed N, `c.tangled` rounds): the Confused coin for every swing, shot, action and trigger (`confusedFumbles`; event `confusedWhiff {tangled}`); event `statusFx tangled`.
- **Fork:** two adjacent lines of L / C / R (C + a side; never L + R; interlocked ranks: the two it stands between); the bramble only when L, C and R are empty. **Trident / Pitchfork:** the bramble only when none of their lines holds a unit; with the middle empty a side line is the swing proper.
- **Sleep and the swing order:** a unit found Ready earlier in the round that is asleep, stunned, frozen, chained or petrified when its turn comes loses the swing (`pickNextAttacker`).
- **Chained:** the damage it takes adds up (`card.chainDmg`); the chain breaks at N. Priced as N x (1 + 0.25 a held round), skill price 0. No ⛓ glyph on the board.
- **One-shot On Ready:** a front-row unit Ready at an upkeep without its Wait running out there (Wait 0, Hasten) gets its On Ready then, once (`c.readyDone`). Rocket, Fireball, Meteor, Chilli, Converge, Stockpile, On Ready damage / Missile / Render, an On Ready Pearl Bed and On Ready triggers leave the unit's card once fired (`spendOnReady`, event `skillSpent {keys}`). **Charge** goes off once and leaves the card.
- **Stockpile N** (`effects.stockpile`): On Ready, +N Lumber, once. **Seasons:** 6 rounds each, from round 1.

| Effect | Function | Look | Event |
|---|---|---|---|
| 🥀 Bloom fails | `SkillFX.bloomFail(el, {onDone})` (`bramblewood-skillfx.js`) | Two ghost copies slide apart, turn reddish, stall and fall back; the card swells; "🥀 +1/+1" | `bloom {failed}` |
| 🌿 Tangled | the Bound vine (`SkillFX.vineBind`) | "🌿 Tangled" float | `statusFx tangled` |
| 🪦 Revive | the spawn's own entrance | log line | `reviveGrave` |


## 2026-10-26 additions (package CONTENT3): Wakeful, Detonate N, Pulverise, Tamper-proof and Equip Time, the Platform, the golem's stun, the blinding Sandstorm, Socket N and gem fusion

The rules as built (engine: `rollStatusOnHit` and the Spore Cloud pick, `detonateBonus`, `pulveriseHit` and `computeHitDamage`, `eqTamperProof` in the Disarm action, the `stun` action's `everyone`, `sandBlinds` / `en6Storm`; app: the MATERIA_SOCKET_H1 block, `equipTimeBadgeHTML`). The engine decides; this describes.
- **Wakeful** (`effects.wakeful`): it never falls Asleep: a Sleep hit fizzles on it (event `statusFx wakeful`), the Spore Cloud never picks it.
- **Detonate N** (`effects.detonate`, true = 1): its hit (or shot) makes the target's Poison tick N times at once, before the hit: each tick deals the stack and takes one counter off, stopping when the Poison runs out. Status damage (no Armor). One event, `statusFx detonate {amount, ticks:[...], left}`; the board floats each tick in turn ("🎆 N", 240 ms apart) and drops the counter badge to `left`.
- **Pulverise** (`effects.pulverise`): its swings ignore Armor and deal double damage to a Structure (mod `pulverise`); a landed swing breaks the target's Armor and Magic Armor for the fight (`armorLoss`, `magicArmorLoss`) and the equipment it carries (to the graveyard, event `equipBreak {why:'pulverise'}`). Event `statusFx pulverise {broke}`.
- **Equip Time N** (`equip.turns`, default 1, EQ's existing field): the rounds a unit takes to equip the piece. An equipment card's tile wears a top-right badge: ⚔️ N, the sword slowly circling (still under reduced motion), 🔒 when Tamper-proof. The card editor sets both.
- **Tamper-proof** (`equip.tamperProof`): Disarm can't take the piece, on a unit (event `sk2 disarmBlocked`) or lying loose (skipped).
- **Platform** (type): a card that carries `Platform` and `Structure`; every Structure rule applies (no swing at 0 Attack, Pulverise and Siege, poison-proof, no equipment). The Mother Carrier.
- **The golem's stun** (trigger action `stun {everyone:true}`): every live unit on both sides is stunned, but the source and the enemy's last-played unit (`pl.lastPlayedUid`, set by `placeCard`).
- **Blinding Sandstorm** (`rules.sandstorm: 'blind'`): every unit swings Blind (1 in 2, `sightMiss`) unless it is Dry, has Keen Sense, Sonar or True Strike; the plain Sandstorm's 1 in 4 at a unit is off. Any Sandstorm is now a Storm for Storm cards (`en6Storm`).
- **Socket N** (`effects.socket`): N more gem sockets on each copy (a Unique-or-rarer card's one, plus N; a lower card with Socket N gets N). The copy's gems are one joined key ("ember+tide2"); the tile shows one diamond per socket; taking out takes the last gem set.
- **Gem fusion** (Forge, 💎 Socket tab): two gems of one kind -> one Greater gem of that kind (twice the bonus, the same effect) for `GEM_FUSE_COST` (30 Dust, a placeholder).

| Effect | Function | Look | Event |
|---|---|---|---|
| 🎆 Detonate N | `giVfx` (arena_app.js) | each tick's number floats in turn; the Poison badge drops to what is left | `statusFx detonate {ticks}` |
| 🔨 Pulverise | log line; `equipBreak` shows the piece leaving | — | `statusFx pulverise`, `equipBreak` |
| 👁️ Wakeful | log line | — | `statusFx wakeful` |
| ⚔️ Equip Time | `equipTimeBadgeHTML` | top-right badge, circling sword | — |
| 🌪️ Blinding Sandstorm | the field row (`fieldRowsFor`) | 🌪️ "Everyone Blind" | `evaded` (blind) |

## 2026-10-26 additions (package ENG10): shots meet Armor, Charge recharges, On Ready at Wait 0, Grasping Briars, Hardy / Sunder / Dismantle, Gorge, the threshold skills

The rules as built (engine: `damageCardFlat`'s `fo.armor` and `fireDamageAction`'s `armored`, `chargeTick`, `fireReadyFor` / `readyOnArrival`, the Grasping Briars pick in the GI field block, `eqLivesMaxOf` / `eqBreakLife` / `eqSunderHit` / `eqDismantle`, `eq2ParasiteTick(..., gorge)`, `THR_DEFAULT_N` with `EN6_STATES` and `pl.diedThisFight`; budget: `thrS`, `equipLifeMult`; app: the ENG10 block after CONTENT3's registry rows).
- **The spits** read by their element alone: Cinder, Acid, Venom, Ice, Spark (keys `fireBolt`, `acidBolt`, `poisonBolt`, `iceBolt`, `shockBolt`). "Ember" is a Materia gem and "Frost" a state skill, so those two took the nearest clean word.
- **Armor and shots:** an arrow (Arrow, Fire / Ice Arrow, Twin Shot, Volley, Snipe, an Archer's, the Arrow action) or a spit (the five, Spitfire) now loses the target's Armor (with Shell, the tide's, Prayer Ward, Shieldwall; Pierce cuts it), as a swing does. Magic and true damage pass; Missiles, Fireballs and the other damage skills still pass too. Mod `armor` on the `hit`.
- **Armor's price:** 1.68 x N^1.43 (Armor 5 = 10x Armor 1). `tools/eng10_armor_hits_2026_10_26.js` measured the hits Armor meets (`docs/balance/eng10-armor-hits-2026-10-26.json`).
- **Charge N – {…}** recharges again: at 0 the effect goes off and the clock winds back to N (ENG9's one-shot is undone).
- **On Ready at Wait 0:** a unit that lands Ready (played, a leader summoned, a debug spawn; not frozen, front row) gets its On Ready at once (`readyOnArrival`); a unit with Wait still gets it at the upkeep its Wait runs out. Once a unit (`readyDone`).
- **Grasping Briars** (`rules.graspingBriars`): from round 2, one random unit a side (not a Flyer or a Structure) is Tangled for the round. Event `fieldTick graspingBriars`, then `statusFx tangled {field}`. On 12-4 Thornvine Arch and 12-7 the Briar Queen.
- **Hardy N** (`equip.hardy`, default 1): a break takes one life; the durability reaching 0 takes a life and refills it; at 0 lives the piece is destroyed. A dropped, picked-up or stolen piece keeps its lives. **Sunder** (On Hit, swings and shots): 50% to take a life. **Dismantle** (On Play): one 50% roll at the facing enemy's piece, else the nearest loose enemy piece. **Pulverise** takes one life for sure. Events `equipCrack {lives, livesMax, why}` (a life lost), `equipBreak` (the last), `statusFx sunder`, `statusFx dismantle {ok}`. Dragonscale Mail has Hardy 2.
- **Gorge** (the `fester` key; was "Fester: extra damage equal to its own Poison"): a hooked Parasite done waiting feeds a second time as the round ends, at ceil(Attack / 2), healing as much. Event `parasiteDrain {gorge:true}`. The Gangrenous Leech is a Parasite with Gorge.
- **Threshold skills**, Name N – {…}, plain {+2/+2}: **Requiem** (N units died this fight, both sides; default 5), **Dirge** (yours died; 3), **Carnage** (enemies died; 3), **Muster** (your units, itself included; 6), **Beset** (the enemy's units; 6), **Throng** (units on the field; 10). On and off at every stat sync (a play, a death sweep, a round's start); the state chip and its float are EN5's (`statusFx stateSkill`).

| Effect | Function | Look | Event |
|---|---|---|---|
| 💍 Hardy N | `e10HardyBadgeHTML`, the rings in `eq2MarksHTML` | a gold 💍N badge on the equipment card; one gold ring per life above the durability pips | — |
| 💔 a life lost | `eq2Vfx` (`equipCrack`) | the piece shakes, "💔 −1 life" floats, a lock-break sound | `equipCrack` |
| 🪓💥 Sunder / 🔧💥 Dismantle | `giVfx` | 🪓 on the target / 🧰✓ or 🧰✗ on the dismantler | `statusFx sunder` / `dismantle` |
| 🌹 Grasping Briars | the field row (`FIELD2.graspingBriars`), `giVfx` | the 🌹 row lights, the Tangled float on the caught unit | `fieldTick graspingBriars`, `statusFx tangled` |
| ⚰️🎻🥩🏴🆘🐜🐜 threshold on | EN5's state chip | the chip lights while it holds | `statusFx stateSkill` |

## 2026-10-27 additions (package ENG11): Coffee N, the dark places as night, Scorching by day

The rules as built (engine: `coffeeN` / `coffeeRound` / `coffeeStill`, the Coffee block after Frenzy / Twin Strike in the swing loop, the shot doubling in `fireShotsOf`, the crash in `endOfRoundUpkeep`; `zeitPhase`, `nocturnalE` in `sightMiss` / `aiSightMissAt`; `scorchingOn` in the field block; app: the ENG11 block after the ENG10 patches, `SKILL_TEXT.coffee`, `DARK_CODEX_TEXT`, the Scorching rows):
- **Coffee N** (owner K2: "Double Actions every N turns. Stunned after."; replaces the 2026-10-13 Coffee, Wait −N on play and a nap N rounds later): every Nth round in which the unit acts (rounds it waits or is Stunned, Frozen or asleep don't count; decided at its first action of the round), it acts twice: its shots go twice and it swings once more straight after its swing (after any Twin Strike / Frenzy swing; one extra a round). At that round's end it is Stunned for the next round. Quiet Contemplation stills the second action, and then there is no crash. A cycle of N + 1 rounds holds N + 1 actions, as many as without it: Coffee moves an action a round earlier. Price 1.5 / N (scale n, pow −1; 4-round rule). Not a one-off any more. Events: `statusFx coffee {twice:true}` (float "☕ ×2", log "is wired on coffee"), the second swing's `frenzy {twin, coffee}`, `statusFx coffeeCrash` (😴).
- **The dark places are night for the time-givers** (owner K6: "Why is the vampire bat blind in the cave map(s)?"): the caves have no day or night (`MAP_DAYNIGHT` off), so a Nocturnal unit there never had its night, and their Darkness made it miss 1 in 4 like any unit without Darksight. Now a fight with its own darkness (`rules.dark`: Darkness, Pitch Black, Absolute; a Cast Darkness unit doesn't count) is night for Nocturnal, Diurnal and Crepuscular (`zeitPhase`): Nocturnal units get their night bonus and see in the dark (no dark miss, as Darksight); Diurnal units get no day bonus and stay dark-blind. The pill, the dawn draw, the moon, Night-blind and Sun-shy still read the real phase. Dark maps (`DARK_MAPS`): Map 8 Caves & Alcoves (m4), 2-B Smugglers' Grotto (mg) and 7-A the Mycelium Deep (mz) in Darkness, 10-A the Sunken Depths (mj) in Pitch Black; also any fight, Arena ruleset or editor field that sets its own darkness. The other places with no day or night (the Mist of Map 0, the Glimmer Depths, the Ice Hollow, the Volcano Lair, Crushing Depths) are lit and stay without a phase.
- **Scorching by day** (owner K10: "Scorching - only in the day. In places without night/day - scorching is perma-on."): the `heatwave` field burns at the start of a Day round (Twilight counts as day) and rests at night; where the fight has no day or night it burns every round. Its texts say so in 12 languages (`ui.e11-scorching1..3`). The heat state (Heat {…}, Bloom's Heat) still reads the field as hot at night.

## 2026-10-29 additions (package ENG13): Slow, Canopy Cover narrowed, the optional Ambush

The rules as built (engine: `slowRank` in `pickNextAttacker`; `en5FromAbove` in `combatHitLands`; app: `ambushLocksNode`, `AMBUSH_DECKS`, `AMBUSH_HARD`).
- **Slow 🐌** (`effects.slow`; owner 10-29 21:36: "New ability: Slow - loses tie when same speed."): the combat order goes by Speed, highest first;
  inside one Speed a Slow unit's swing, shot or action goes after every non-Slow one, whatever its column or side. Two Slow units order as usual
  (column, then the side that wins ties this round). Speed itself is unchanged: a Slow unit with Speed 1 still goes before a Speed 0 one. A drawback
  priced -0.8 (`canonical/skill-costs.json`, measured with `bench.js skill slow`). On no live card yet.
- **Canopy Cover** now covers only ranged attacks (shots, skills) and Flying or throwing attackers' swings, still 1 in 2 on the fight's seeded roll (above).
- **The Map 3 Ambush is optional** (owner: "Ambushes - no need to be completed to progress - but typically very hard."): it locks no fight and the
  next map does not wait on it; it fields each faction's strongest Common / Uncommon cards on a Smart CPU at a raised Enemy level.

| Effect | Function | Look | Event |
|---|---|---|---|
| 🐌 Slow | `SKILL_ICON.slow`, the passive row | the keyword icon and its line on the card | — (the order only) |

## 2026-10-30 additions (package ENG14): Bola N and Pinned, Anadromous, Mirage for each player, 8-8 Pitch Black, elite opening hand, the CPU's save plan

The rules as built (engine: the Bola shot in `fireShotsOf`, `applyShotStatus('pin')`, `bolaPinnable` / `bolaPinSpend`, the Pin check in
`discoverEligibleAttackers`, `pickNextAttacker` and `rowSwingReady`, `stuckFast`; `anadromousOf` in `condStatsOf`; `mirageOwnerKey` and the Mirage
tick; `draw`'s `openingExtra`; `AI_PLAN_*`, `aiSavePlan`, `aiLosingBadly`, `aiFreeCard`; app: `applySkirmishSetup`, 8-8's `rules.dark`).
- **Bola N 🪀** (`effects.bola`; owner X26: "Bola! Works like arrow, but pins targets down somehow... maybe they can't move and attack? but can
  use skills?"): Arrow N's shot (Speed 1, the enemy facing it, else the nearest, else the bramble; Fletcher N adds). A unit it hits is
  **Pinned 📌** (`c.pinDown`) for its next turn: that swing is lost (a Pin laid before it swung this round costs this round's swing) and it
  can't move or be moved; its skills, shots and triggers still work. An unspent Pin runs out at the end of the next round. A unit that broke
  free (spent or ran out) last round or this one can't be Pinned again, so one Bola costs a unit at most every other swing; no Pin on a
  Structure or a cage. Priced by logic: Arrow N + 2 (`canonical/skill-costs.json`). On no card yet (decision ENG14-3).
- **Anadromous 🐟** (`effects.anadromous`; owner X20 / ANAD-1: "Get tide benefits +2 Health in non-sea, +1 attack in sea."): +1 Attack on a
  salt-water fight (`rules.saltMap`: the beach and reef biomes, today maps `mb`, `mk`, `m7` and `mj`,
  or a fight that sets it), +2 Health anywhere else. The map never changes mid-fight, so one half is always on; its pip shows 🌊 or 🏞️.
  Priced 2 (either half is 2 stat points under 2A + H). On no card yet (decision ENG14-4).
- **Mirage, each player** (owner X10): every round from round 2, each player gets one Illusion beside one of their own units (was one unit
  of either side). A side's units are grouped by who played them: a co-op seat (`coopSeat`), a raid ally (`allyOf`), else the side's own
  player; a middle / back-row unit's Illusion goes into its own row and is that player's.
- **8-8 (The Stalactite Warden, Map 8's final elite) is Pitch Black**: 1 in 2 misses for units without Darksight, Nocturnal or a light.
- **Elite-kind fights deal the CPU a 4-card opening hand** (elite, champion, mini-boss; not dungeons or bosses; owner X25).
- **The CPU saves for a big card** (owner X24): with a card worth 1.5x its best paying play, short only of Lumber / Stone / Metal and within 3
  pitches, it plays only free cards and pitches for it, at most 2 turns held back for one card, never while losing badly (bramble under 40%,
  your open swings at least half its bramble, or 2+ more units and 4+ more Attack). It gathers for the most valuable card in reach, and pitches
  its best free play when that makes the big card payable at once.

| Effect | Function | Look | Event |
|---|---|---|---|
| 🪀 Bola | `SKILL_ICON.bola`, the evergreen row | the shot (an `arrow` event with `bola`) | `arrow` (bola) |
| 📌 Pinned | `en4StatusBadges` neighbour badge, `LIVE_STATUS_ROWS`, `s17SkillVfx` | 📌 badge, "📌 Pinned" float, its status line | `statusFx pinDown`, `skipTurn pinned`, `statusEnd pinDown` |
| 🐟 Anadromous | EN5's state chip (`anadromousSea` 🌊 / `anadromousRiver` 🏞️) | the chip lit for the fight | `statusFx stateSkill` |
| 🪞 Mirage | the field row | one Illusion per player | `fieldTick mirage` (row), `spawn` |


## 2026-10-31 additions (package ENG15): True Sight, Bloom keeps trying, Cower N, Poison past the Shield, Bola / Lasso holds, Anadromous rework, Pounce in reach
- **True Sight** (`keenEye`, was Keen Eye; owner FF4, call AA4): its swings, shots and skills find and hit Invisible units (`isInvisible(c, viewer)`, `trueSightOf`); it lifts the fog (`FOG_REVEAL_KEYS`). No more +2 against a Changeling. A diver aloft or under is still out of reach.
- **Bloom** (owner FF5, options a + b): the original tests at every round start while Ready and tries again whenever its conditions hold; it is never spent and gets nothing on a failed split (no room, a Parasite with no host: it waits; `bloomFail` is no longer called). A copy is a token (`c.token`, the token frame), has no Bloom, and arrives with the parent's printed Wait. At most one copy a Ready round.
- **Cower N** (`cower: N`, owner FF6): a third mode beside Shell and Flee: hit last round, it cowers this round (no swing) with +N Armor (`cowerArmorOf`, in both Armor sums); `statusFx cower {mode:'armor', armor}`; `c.cowering` lights its pip (`eng15CowerChip`: lit like Tide's, 🛡N). Priced Cower + Armor N x 0.4 (tools/skill_costs.js).
- **Poison ticks** (Poison, Toxin, Greater Poison: `damageCardFlat(..., 'poison')` with no attacker) pass Bolster, Shell's temporary Health and the Shield (`applyDamage` `poisonTick`). A poison-typed swing or shot still soaks into them.
- **Bola's Pin** also strips the Flying and Evasive dodges (`heldFast`). **Lasso N** (new): once, on its first Ready round, Arrow N's shot (`SHOT_KEYS`; `c.lassoUsed`); a unit it hits is Lassoed (`c.lassoed`, `c.lassoBy`; the thrower's `c.lassoing`): neither end swings (`skipTurn lassoed`) or moves (`stuckFast`), the target has no Flying / Evasive dodge; either one dying frees the other (checked live, swept at each upkeep: `statusEnd lassoed`). `lassoed` is in `HELD_STATUSES` (the struggle wriggle).
- **Anadromous** (owner Y2, decision ENG14-4): a Tide fight on a salty map: +1/+1 and the Tide skill (`anadromousSea`); a Tide fight that is not salty: a 1/1 Tide Fry (`anadromous-fry`) takes its place when it dies (`anadromousRiver`); no Tide: +0/+1 (`anadromousDry` 🏜️).
- **Pounce** (owner Z5): only the enemy facing it, else one in the column beside it (a coin flip when both), else the bramble.

| Effect | Look | What plays | Events |
|---|---|---|---|
| ➰ Lasso | the arrow flight, then `SkillFX.vineBind` on the target | "➰ Lassoed", the ➰ status badge | `arrow {lasso}`, `statusFx lasso`, `skipTurn lassoed`, `statusEnd lassoed` |
| 🫣 Cower N | `SkillFX.fearShiver`, the lit cower pip | "🫣 +N🛡" | `statusFx cower {mode:'armor'}` |


## 2026-11-02 additions (package ENG17): Hatchling, the co-op starting slot
- **Hatchling** 🐣 (`hatchling`, owner BABY-2: "It just does what we wanted Fodder to do."): every Baby card (card group Baby, `kind: 'baby'`,
  the eggs too) carries it from Level 1 (`levelSkills {"1": {"hatchling": true}}`; a Level 0 copy has none). It is EV-6's Fodder: a plain
  Stem (`isStemDef`), so an Evomax evolute played onto it gains +1/+2 (`evoluteMerge`), and the CPU's evolute base pick counts it as a Stem.
  It only matters when an evolute is in play (Map 20+). Name and help "?" until Map 15, the name only until Map 20 (`SKILL_REVEAL_MAP`, as
  Stem). Not the egg's Hatch / Stay (ENG16: that is the egg copy's level-up choice). An older card whose Baby carries Stem at Level 1, or a
  `fodder` key, reads as Hatchling (`eng17MigrateHatchling`). Price: a Stem's (skill-costs `hatchling` 2, theoretical); the stat budget does
  not read `levelSkills`, so no card moved. The evolve look is the Stem's (`evolve {stem}`).
- **Co-op starting slot** (owner COOP3-3): in the duo dungeon each player's row centre is that player's alone (`ownedCells(..., homeRow,
  otherHomes)`: the other players' row centres are never a cell). An ally or a CPU ally can't play there, the "+" targets don't show it, and
  every other free cell follows W10's rule. Raids are unchanged (each player plays into their own row).

## 2026-11-02 additions (package ENG19): Pearl and Pearl Bed, Swarm counts Structures, On Attack after the swing, Majesty, Grant Shield, the live 💠 number, Bloom's tooltip

- **Pearl N / Pearl Bed N** (owner 22:15 #5): `pearl` is On Ready, once (+N Pearl; a Wait 0 card: as it is played), the rule Pearl Bed had.
  `pearlBed` now pays +N Pearl at the start of every turn the unit is Ready (`perTurn` trigger, `en8Trigs`). Spent chip: Pearl (`spendOnReady`).
- **Swarm** (#6): an allied Structure that shares a Type counts (the `isStructureCard` filter in `swarmBonus` is gone). Power change: ENG19-4.
- **On Attack** (#12): the triggers go off right after the swing (and its answers: Thorns, a counter, Sweep / Fork prongs), not as the unit
  commits to it (`onAttackPhase`, `runOnAttackPost`). Fire on hit stays before the blow (it loads that swing). A swing that finds nothing
  still fires them. A unit that died in its own swing still draws / gains / hits, but gives itself nothing (heal, buff, shield, cleanse).
  A draw lands in the hand at once: the page holds the round's drawn cards out of the hand strip until their `draw {uid}` event plays.
- **Majesty N** (`majesty`, #13, decision ENG19-1 option a; on no card): while it is Ready, the enemy units facing it (its column and the
  columns beside it) swing at −N Attack (`majestyCut`, inside `chokeOf`); several do not stack (the biggest N). Price 3.4 / N.
- **Grant Shield** (action `grantShield`, #15; on no card, candidates in ENG19-2): `amount` N to itself, `adjacent` N to each adjacent ally
  (front, behind, left, right: `adjacentOf`), `surrounding` N to each ally around it, corners too (`surroundingOwnOf`), `allies` N to every
  ally, itself included. Any together; a unit gets the biggest one. Prices: 0.4 / 0.56 / 0.64 / 1.2 a point (skill-costs `grantShield*`).
  On Play, +3 to every ally: 3.78 S.
- **The 💠 number** (#14): Shield + Shell's and Bolster's temporary Health (`vis3ShieldAmount`). It now steps down as Shell's temporary
  Health soaks a blow (engine `tempSoak {pool:'shell'}`), and as Bolster's does; before, only a Shield soak moved it mid-round. Shell's
  crystals over the Health are its +Armor (flat, they don't break).
- **Bloom's tooltip** (owner 22:26): the 🌸 chip and the skill line say what fills it, from the card's own conditions
  (`eng19BloomFillText`: "Blooms when all of these hold: Wet: rain, the tide coming in, or a beach, river or sea map; Killed an enemy ...").

## 2026-11-02 additions (package ENG18): Adjacent and Surrounding, the CPU ally re-plans
- **Adjacent** (owner 19:56: "Adjacent in front, behind, left, right. Surrounding includes corners."): the 4 places directly left, right, in
  front of and behind a unit (`adjacentOf`). In front / behind count only where every row fights: raids and group dungeons (both built with
  `reserveActs`); a one-row fight's adjacent is left / right. **Surrounding**: those plus the 4 diagonals (`surroundingOwnOf`, `sk2Near`).
  Both are Codex terms (`ui.eng18-term-adjacent`, `ui.term-surrounding`). Every skill that reads neighbours, what it does and whether its
  text matches: `docs/eng18-adjacency-2026-11-02.md`. Not adjacent by design or pending a call: Shore Up and Pack (left / right), the splash
  shapes (Fireball, Meteor, Rocket, Cleave: columns), tokens "beside it" (the nearest free slot, BF6), calls ENG18-1..5.
- **CPU ally re-plans** (COOP3-1): a CPU ally in a group dungeon picks its play when its timer fires (`CoopM.cpuChoice`), from the board as
  it is then, so a play you make first is always taken into account (a cell you took: it picks another one of its own network).

## 2026-11-02 additions (package ENG20): Remember's candlestick, water and Burn, Stop Drop and Roll, Glean, Lumber Feast, heavy and cross winds
- **Remember** fires once a card (`rememberSpent` on the unit and its zone entry); the board strikes its line, drops its pip, and a candlestick rises (`en20CandleVfx`).
- **Water counters** (`c.water`, 💧N pip) and **Burn** (`c.burn`, 🔥N pip): `en20Elements` in `applyDamage`, the tide's `en20TideWater`, Burn's `en20BurnTicks` (event `burnTick`).
- **Stop, Drop and Roll** (`dropRoll`): the unit spins once (GSAP rotation) with "🤸 Stop, drop and roll!".
- **Glean** (`glean`): "🫐−N" off each unit it takes from, "🫐→💠N" on itself, then the Shield's own look. **Lumber Feast** (`lumberFeast`): "🪵−N +N/+N".
- **Winds**: the field's wind streaks as before; floats "🌬️ Heavy Headwind: −2⚔", "🪁 Heavy Tailwind!", "🌬️ +0/N" (Crosswind). Pill: ⇈ / ⇊ heavy, ↔ / ⇔ across, still-air lines when calm.

| Effect | Look | What plays | Events |
|---|---|---|---|
| 🕯️ Remember | `en20CandleVfx` (drawn candlestick, flame flicker, warm wash) | "🕯️ +N/+N" | `remember` |
| 💧 Soak / dry | floating number | "💧+N" / "💧−N", the 💧 pip | `statusFx en20Soak`, `en20Dry` |
| 🔥 Burn | floating text, the 🔥 pip | "🔥 Burning", each tick "🔥1" | `statusFx en20Ignite`, `burnTick`, `statusFx en20Douse` |
| 🤸 Stop, Drop and Roll | a full spin of the card | "🤸 Stop, drop and roll!" | `statusFx en20Roll` |
| 🫐 Glean | floats on the givers and the gleaner | "🫐→💠N" | `statusFx en20Glean`, `statusFx unitShield` |
| 🪵 Lumber Feast | floating text | "🪵−N +N/+N" | `statusFx en20LumberFeast` |
| 🌬️ Heavy / cross wind | the wind pill | the floats above | `wind {kind}`, `statusFx headwind {heavy}`, `tailwind {heavy}`, `crosswind` |

## 2026-11-03 additions (package ENG22): Build / Fortify, Delivery, Taunt and Guardian on shots, Carnage that sees, four counters

The rules as built (engine: `buildSizeOf`, `fortifyBramble`, `deliveryEveryTick` / `en8Trigs` Delivery, `shotRedirect`, `thrSeeDeath`, `thrRoundMark`; owner 2026-11-03 21:10 / 21:13, `docs/decisions.json`):
- **Build { A/H Palisade }** (key `fortification`, was Fortification; SKILL-BUILD-1): on play a Palisade of that size in an empty slot beside it; true = 0/6.
- **Fortify { X }** (key `fortify`; on no card): on play your bramble gets X for the fight (+N Health and its top, Thorns N, Regen N, Bolt N, +N Shield). Event `fortify {parts}`, log line "🏯 … fortifies its bramble". Bramble Armor (`brambleArmor`) reads Bramble Armor again (call ENG22-2).
- **Delivery { Lumber xN }** (key `delivery`, resource `deliveryRes`): On Ready, once (Stockpile's rule); **Delivery { Lumber xN }, every turn** (`deliveryEvery`): every upkeep while Ready (onReadyGold's). Lumber events carry `cause:'delivery'` for the every-turn form. Stockpile, onReadyGold and On Ready gain triggers still play; no card carries them.
- **Taunt / Guardian on shots** (DESIGN1-4): an aimed shot (Arrow, Archer, Arrow action, Fire / Ice Arrow, Twin Shot, Bola, Lasso, Snipe, Bolts, Spitfire) goes to an enemy Taunt unit around a front-row shooter, else to a Ready Guardian beside its target. The `arrow` / `bolt` event carries `taunted` or `guardianRedirect`; a pulled shot also logs `statusFx taunted {shot:true}`. Not Volley, not bramble-aimed shots.
- **Carnage N** counts `c.carnageSeen` (enemy deaths while it is on the board); **Tally N** is the old count; **Almanac N** reads `pl.drawnAfterOpening`; **Onslaught N** `pl._siegeLast` (bramble damage dealt last round); **Riled N** `c._riledLast` (damage it took last round). The four new ones are on no card (call ENG22-1).
- **Wetness, -1 a round** (owner 22:02): `en20WaterDrain` at each round start, before `en20TideWater`; event `statusFx en20Dry {drain:true}`.
- **Hatchling - ?** until Map 20; Map 0's untaught abilities read "?" (`SKILL_REVEAL_MAP`); base Level 0 cards get their abilities at Level 1 (levelSkills "1").

| Effect | Where | What you see | Engine event |
|---|---|---|---|
| 🏯 Fortify | the log | "🏯 {name} fortifies its bramble: Thorns 1, +1 Health." | `fortify` |
| 📦 Delivery | the Lumber / resource float | as the old Lumber pings | `lumber` / `stone` / `metal` / `uranium` / `pearl` / `grace` |
| Taunt / Guardian pull a shot | the arrow flies to the puller | the shot's target | `arrow` / `bolt` with `taunted` / `guardianRedirect` |

## 2026-11-04 additions (package ENG24): Bramble Armor as a Fortify form, Relict, Meld, Immunity, Sequestration, brambles +2

The rules as built (engine: `relictOf` and `climbs`, `fieldUnits`, `immunityOf` / `eng24Cleanse`, `eng24MeldFrom` in `condStatsOf`, `eng24Sequester` / `eng24SeqExpire`, `eng24HerbCfg`; owner 2026-11-04 22:34, decisions ENG22-2, RELICT-1, RELICT-2, IDEA-BRAMBLES). The four new skills are on no card.

- **Fortify { Armor N }, while it lives** (key `brambleArmor`, was shown as Bramble Armor): the same rule (its bramble takes 1 less from each unit-dealt hit; several don't add up); only the name moved into Fortify's form. Price 1.1, unchanged.
- **Relict** (`relict`): the map's field passes it by, good and bad: the dark (Darkness, Pitch Black, Absolute) and a blinding Sandstorm never make it miss; fog, ash and the Sandstorm neither hide it nor blind it (either side of the swing); no Headwind cut, Tailwind Quick, heavy-wind doubling or Crosswind +0/N; no tide water counters, no Rain wetness or Rain heal; no Rook's Row / Bishop's Path bonus; Freezing, Swamp Fever and every round-start field tick (`fieldEffects2Tick`: Leylines, Hail, Glass-storm, Crushing Depths, Landslide, Lava Spout, Spore Cloud, Thunderstorm, Tangled Roots, Grasping Briars, Haunted, Awash...) skip it; it counts as a Mountain Climber for Frigid, Scorching, the volcano and comets. The field-wide skills pass it by too: Earthquake, Landslide, Avalanche, Tsunami (no push, no soak), Tornado, Poison Gas, Absolute Zero, Nova. Single-target and normal skills (a shot, Missile, a Deal damage trigger, even "every enemy" triggers) still reach it. Its own Diurnal / Nocturnal are its skills and still read the clock.
- **Immunity** (`immunity`): no disease counters. The statuses it stops: **Poison** (plain, Venomous, Rabid, Poison Gas, a "– poison" shot, Poison damage's stacks), **Greater Poison**, **Toxin**, **Decay** (the Decay skill's stacks and Decay damage's Attack loss), **Swamp Fever** (its Poison) and **Spore Cloud** (it breathes nothing in, as a poison-proof unit). Poison or decay damage itself still hurts. Counters that reach it another way are cleared at upkeep before they tick.
- **Meld { X }** (`meld`: braces, e.g. `{quick: true}`): every other live Meld unit of its side has X while this one lives (a grant through `condStatsOf`, like Skitter's); its own X is not its own. When a Meld unit dies the others lose its braces at once.
- **Sequestration** (`sequestration`) — built reading of RELICT-2 ("Steal status effects from opposing unit it hits (for one turn)"): when its melee swing lands on an enemy unit that lives, it takes that unit's status skills (`ENG24_SEQ_KEYS`: Poison, Rabid, Venomous, Toxin, Greater Poison, Bleed, Hemorrhage, Decay, Corrode, Scar, Expose, Exploit, Venom Pulse, Freeze, Sleep, Paralyze, Stun, Blind, Tipsy, Confuse, Shock, Stagger, Weaken, Tangleweed, Strangle, Web, Brittle, Wither, Daunt; never Arrow-like shots or damage skills). Until the end of the next round the target has none of them and the thief has them as well (numbers add). Then both go back. One loot at a time on each side of it.
- **Brambles +2** (IDEA-BRAMBLES): every amount on a bramble +2 (`canonical/characters.json`, tools/eng24_brambles_plus2_2026_11_04.py): start Lumber, first unit Attack, unit Health, Flyer Attack, the heal (castleRegen), the enemy's Wait, the bolt, Thorns, Aimed Bolt 4 -> 6, Feed Repair 3 -> 5 and +1 -> +3 Attack, a spawn's count, `castleLumberAmount` (new: +3 Lumber every N rounds, was a fixed 1), the Herb Refinery's {heal 5, damage 4, lumber 3} (was a fixed 3 / 2 / 1). Intervals, first rounds and three feeds a fight are unchanged. No bramble ability scales by level (Health does).

| Effect | Where | What you see | Engine event |
|---|---|---|---|
| 🫳 Sequestration | the log | (no look of its own yet) | `statusFx` `sequester` {skills, until}; `sequesterEnd` / `sequesterBack` when they go home |

## 2026-11-04 additions (package ENG23)

The rules as built (engine: `crepuscularParts`, `eng23SkitterOn` / `eng23SkitterMark`, `eng23GrantFF` and the `grantFastForward` action, `feedBramble`, `aimedBolt`, `eng23AiBramble`; owner 2026-11-03 23:01 / 23:12, `docs/decisions.json` ENG23-1 to ENG23-7):

- **Crepuscular**: a day part and a night part. Plain (`crepuscular: true`) is +0/+1 at night; `crepuscularDay` / `crepuscularNight` set each part; an old card's `crepuscular` N / `crepuscularHp` M is +N/+M in both. **Crepuscular {day} → {night}** (`crepuscularGrant`): a stat change or skills in each brace. Twilight brings both.
- **Skitter** (`skitter`): after its melee hit lands on a unit (a killing hit too), Haste and Evasive for the next round (a grant through `condStatsOf`); another hit renews it.
- **Fast-forward tokens**: the Fast Forward counters (`ffCounters`); N tokens are N extra turns at the start of the next combat, before the main order (`fastForwardPass`). **Grant Fast-forward N** (`grantFastForward`: who self / ally, sub adjacent / random / all) adds them.
- **Feed** (bramble effect `feed`: {feeds 3, repair 3, attack 1}, the Gnawed Larder): instead of the turn's pitch, a hand card goes to the Graveyard (as Devour's food), Repair N, your units on the field +A Attack.
- **Aimed Bolt** (bramble effect `aimedBolt` N, Ballista Keep): once a fight, on your turn, N to the enemy unit in the column you pick, else their bramble. Not your play.

| Effect | Where | What you see | Engine event |
|---|---|---|---|
| 🐾 Skitter | the unit, the log | "🐾 Skitter" float; "🐾 {name} skitters: Haste and Evasive next turn." | `statusFx` `skitter` |
| ⏩ Fast-forward tokens | the unit's badges | ⏩N with a tooltip; "⏩ +N" when granted | `statusFx` `grantFastForward`; spent at `fastForward` |
| 🍖 Feed | the HUD button, your bramble, the units | "🍖 +3❤" on the bramble, "🍖 +1⚔" on each unit; a log line | `feed` |
| 🎯 Aimed Bolt | the HUD button and its column picker | a 🏹 shot from your bramble; a log line | `statusFx` `aimedBolt` |

## 2026-11-03 additions (package ENG21): Inspiration tokens, Pounce's pip
- **Inspiring N** (owner 20:28: "Inspiring - +2 attack to adjacent creatures. It stacks! Once unit attacks and hits something, the inspiring tokens are expended for N damage."): as the Inspiring unit attacks, each adjacent ally (left / right, and front / behind where the rows fight) gains N Inspiration tokens (`c.inspTokens`), +2 Attack each (`c.inspired` holds the Attack, `INSPIRE_TOKEN_ATK`); they stack. The ally spends them all when its attack lands a hit (a unit or the bramble; the extra Attack applies to every hit of that swing); a miss, a dodge or a swing with no target keeps them. The engine says when (`statusFx inspiredSpent`). The rule is the engine's; this describes it.
- **The look**: the Inspiration pip `📯N` on the unit's status strip (tip: "Inspiration N: +A Attack, spent on its next attack that hits."); as tokens are gained the Attack number glows gold and a 📯 rises off it (`eng21-insp-gain`), as they are spent it flares and drains (`eng21-insp-spend`); PL2's bounce still plays the number changing. Effects None: nothing; reduced motion: a still gold tint for 0.7 s.
- **Pounce**: once it has fired (`pounceSpent`) the 🐾 pip leaves the strip and its line reads used, as Remember's.

| Effect | Look | What plays | Events |
|---|---|---|---|
| 📯 Inspiration gained | `eng21InspNumFx(uid, 'gain')` on `.stats .atk` (CSS) | the horn burst over the inspirer, the 📯N pip | `statusFx inspired` {amount, tokens, total} |
| 📯 Inspiration spent | `eng21InspNumFx(uid, 'spend')` | the Attack number back down, the pip gone | `statusFx inspiredSpent` {amount, tokens} |

## 2026-11-05 additions (package FIX9): Shell reworked, water pips on Shift
- **Shell N** (`shell: N`, owner 2026-11-05 22:18, FIX9-1): each round, the first hit of any kind (swings, prongs, arrows, spits, flat skill damage) gives N Armor (`c.shellArmor`, in both Armor sums) for the rest of that round; the round's upkeep drops it (`statusFx shellDown`) and the next round's first hit raises it again. The raising hit is not reduced. A hit between rounds raises it for the coming round. Nullify and Supreme work as before. No temporary Health and no lost swing any more (was: N Armor + N temporary Health until the next round's end, no attack). Event: `statusFx shellUp {amount, armorOnly:true}`; the `.shell-up` crystals over the Health show it.
- **Water pips** (FIX9 #4): the 💧N pips (`.abadge.en20-water`) and their 💧+N / 💧−N floats show only while Shift is held (`html.fix9-show-wet`). The rule is unchanged.

| Effect | Look | What plays | Events |
|---|---|---|---|
| 🐢 Shell up | `.shell-sweep`, "🐢 Shell!" float, crystals over the Health (tip: "Shell: +N Armor until this round ends") | Armor N until the round ends | `statusFx shellUp` {amount, armorOnly} / `shellDown` |

## 2026-11-05 additions (package ENG25): Tide N, Moonpull, Immortal, Hydra, Tribe Delivery, Forage, Berries, Level 1 skills, categories
The rules as built (engine: `tideNOf` / `tideMultOf` / `moonpullAuraOn` / `tideScaleGrant`, `immortalRespawn`, `hydraSplit`, `en8Trigs` Tribe Delivery and Felling, `en5Breach`, `sk2BerryGather`, case `forage`, `condStatsOf` `c._ctxOn`; app: `effectsAtLevel`, `zeitLitNow`, `ENG25_STATE_CHIPS`, `ENG25_EVERGREEN`; owner notes 2026-11-05 23:35, `docs/decisions.json` ENG25-*):
- **Tide N** (`tide: N`, true = 1): every Tide bonus x N: Flood +N Attack, Ebb +N Armor, High Tide +2N / +2N, Supreme Tide and Leylines I's numbers, and the numbers in a Tide – {…} facet (Armor 2 -> 4 at Tide 2). The 🌊 chip shows N when it is 2 or more.
- **Moonpull** (`moonpull`): on arrival the Tide comes in (Flood this round, an Ebb turns to Flood; as before), and while it lives every Tide unit of its side counts its Tide double (x2 once, however many Moonpulls; Tide 2 under it counts 4). Itself included.
- **Immortal** ♾️ (`immortal`): when it dies, a token copy (its Attack, Health and skills, Immortal too) takes its slot (the nearest free one if taken) at Wait 2, so it misses its next round. A copy that dies in the round it came back stays dead; a Nullify kill, a cage, a sacrifice or an Undead return makes none; the round cap ends the rest. Event `spawn` kind `immortal`.
- **Hydra** 🐍 (`hydra`): when it dies, two token copies (its skills, Hydra too) in the free slots nearest it, never its own slot; Attack and Health halved, rounded up, but Attack 1 halves to 0; a unit with Health 1 makes none (8 -> 4 -> 2 -> 1: a line of heads always ends). Copies keep the card's Wait. Event `spawn` kind `hydra`.
- **<Tribe> Delivery { Resource }** 📦 (`tribeDelivery: 'Bee'`, `tribeDeliveryRes` Delivery's list, default Lumber): each time you play an ally of that tribe (the taxonomy: a Changeling counts; not itself), +1 of the resource. An On Ally Played trigger, off while it is Waiting, Stunned, Frozen or Asleep. Bee Drone: Bee Delivery { Lumber }.
- **Berries**: one basket rule for every gatherer: at most 3; a full basket is eaten at once to heal the most damaged other ally 3 (nobody hurt: kept). **Foraging N** gathers N a turn while Ready (was 1 a turn, N the heal). **Forage N** is a trigger action: the unit gathers N Berries.
- **Duplicates merged**: Midas Touch N reads as Felling N (an On Kill gain; Midas's own kill-credit payout is gone), Puncture N as Breach N, Stockpile N as Delivery { Lumber xN }; the cards carry the kept names. A skill and its braced form (Timbered and Timbered – {…}, Tally and Tally – {…}, …) are one "+ Add Skill" entry, as Diurnal and Tide were.
- **Level 1 skills**: Hatchling and Regeneration are off on any Level 0 copy (`effectsAtLevel`); the Baby cards' Hatchling is in levelSkills "1".
- **Lit context pips**: the state skills (Timbered, Bedrock, Forged, Last Stand, Plenty / Scarcity / the foe's, Heat, Frost, Rain, Storm, Fog, Salt, Drought, Season, the threshold skills) have a chip on the card face that lights gold while the condition holds (the engine's `en5On`), as Tide's lights blue; Loyal, Usurper and Liege light from `ctxOn`. The separate gold state badge is gone for these (Anadromous keeps it).
- **Categories**: Evergreen keeps the field- and board-wide skills only: Converge, Moonpull, Earthquake, Tornado, Avalanche, Tsunami, Absolute Zero, Poison Gas, Rainmaker, Nova, Volley, Field Breaker, Warcry. Every other former evergreen (63: the shots and bolts, Boomerang, Twin, Sprout, Brood, Pounce, Skyfall, Gash, Regeneration, Reload, Berserk, Momentum, Expose, Exploit, Nullify, Charge, Rocket, Landslide, Fireball, Meteor, Banana, Bananarang, Bloodlust, Chilli, Smoke Bomb, Spitfire, Slash & Burn, Penance, Blood Tithe, Trap, Crystallise, Cure, Spawner, Corpsefeeder, Stench, Archer, Explode, Paralyze, Render, Progeny, Revive, Inherent Darkness, Core Evil, Bola, Lasso and the shot add-ons) is a passive.

| Effect | Look | What plays | Events |
|---|---|---|---|
| ♾️ Immortal | the summon portal on the copy, its Wait badge | a token copy in its slot | `spawn` {kind: 'immortal'} |
| 🐍 Hydra | the summon portal on each head | two halved copies beside it | `spawn` {kind: 'hydra', count} |
| 📦 Tribe Delivery | the Lumber / resource float | as Delivery's pings | `lumber` / `stone` / … (cause trigger) |
| 🫐 Forage | the 🫐 +N float, the 🫐 → 💚 heal | Berries on the unit, then the heal | `statusFx sk2Berry` / `sk2BerryEat`, `heal` cause `forage` |
| 🪵 lit state chip | `.ab-sk.zeit-live` gold ring | the chip lights / dims as the state turns | `statusFx stateSkill` {name, on} |

## 2026-11-06 additions (package ENG26): escalating Bloom, Undead heals and cures, Banner Knoll, paged context pips
The rules as built (engine: `eng26BloomStep`, `eng26IsUndead` / `eng26UndeadHeal` / `eng26UndeadCure`, `eng26ApplyLeaderBoon`):
- **Bloom – {conditions}** escalates (owner 2026-11-06 09:29: "first copy, becomes 2/8, next 3/9"): each bloom that lands for a side in a fight (a copy beside its parent, or a Parasite's copy on an enemy) adds 1 to that side's count; the Nth copy gets +N/+N. The side's Bloom units share the count; a bloom that waits for room does not count. Call ENG26-1.
- **Undead** (species Undead or subtype undead, not a Changeling's every-type; a unit back as a token by its Undead skill): a heal aimed at it (the Heal action, Healing, Regeneration, Spring Rain, Herbalist's extra included) deals that much true damage instead, even at full Health; no heal triggers; its own Regeneration still heals it (Obsidian Lich). A Cure N, Cleanse N, the Cleanse action or Renewal that would take something off it takes nothing off and gives Bleed N instead (1 for a Cleanse or Renewal with no number); with nothing to take off, nothing happens. Sap (a drain on its own hit) is unchanged. Call ENG26-2.
- **Banner Knoll** 🚩 (`leaderBoon {atk 2, hp 3}`): your Leader gets +2 Attack / +3 Health as it takes the field (a summoned Leader, or a Leader card from the hand). Health, not Armor (call ENG26-4). Open to every player; on no road fight yet (ENG26-5).
- **Context pips** (owner 09:29 #1): a strip with more pips than its slots pages through all its slots together, one page every 3 s (was: only the last slot cycled, every 2 s); one shared tick (`BADGE_CYCLE_TICK`), so a re-rendered card stays in step.
- **Crowded rows** (#2): a row of 9+ units with tiles under about 120px hides the name scroll.

| Effect | Look | What plays | Events |
|---|---|---|---|
| 🌸 Bloom +N | "🌸 +N/+N" on the copy (as before, with the step) | the copy grows | `bloom` {step, copyAtk, copyHp} |
| 🧟 heal hurts | "🧟 Heal hurts", a damage number, the bleed tint | Health down | `undeadHeal` {uid, amount, dmg} |
| 🧟 cure bleeds | "🧟 🩸N", the bleed tint | Bleed N on | `undeadCure` {uid, bleed, kind} |
| 🚩 Leader boon | "🚩 +2/+3" and the surge glow on the Leader | its stats up | `statusFx leaderBoon` {atk, hp} |

## 2026-11-06 additions (package ENG27): Fortify (X) and Unfortify, speed and the flying meter, Double Time, Encore, Grant, Hype, Rage (N%), the helmet that falls off, two brambles
The rules as built (engine: `fortifyBramble` (Armor, Unfortify), `shotSpeedOf` / `BLITZ_SPEED`, `flyLevelOf` in `combatHitLands` / `dodgeCheck`, `eng27EncoreOn`, `eng27Grant`, `eng27Hype`, `rageAtOf`, `helmetDeflects`, `unitAtkBonus`); the engine decides, `docs/project-state.md` lists them with their calls.
- **Fortify (X)**: the short form; its parts gain Armor N. **Unfortify (X)**: Vulnerable N / -N Health on your own bramble (bare: Vulnerable 1). Both show as pips on the bramble tile (`eng27FortPipsHTML`, from `pl.eng27Fort` and the replayed `fortify` events).
- **Speed**: Blitz 10 (swing and shots), Bolts 1, Arrows and arrow-likes 0 after the swings, Quick 2 on the swing only.
- **Flying meter**: Mach (2) dodges every ground swing and half the flying / ranged attacks; Anti-air hits only flyers and the bramble.
- **Double Time** (two swings, shots twice), **Encore {Kill / field}** (one more swing a round), **Grant {skill} N** (the N nearest allies), **Hype N** (the N strongest Ready allies act at once), **Rage {N%}**, **Helmet** (gone after one block), **Inspiration** +1 a token, brambles **Whetstone Rise** (+1 Attack to every unit you play) and **Mossbed Hollow** (+3 Health).

| Effect | Look | What plays | Events |
|---|---|---|---|
| 🏰 Fortify / 🏚️ Unfortify | the parts' text floats on the bramble; pips 🛡️N 🌵N 💚N 🏹N 💔N above its Health | the bramble's state | `fortify` {parts, neg, fort} |
| 🛡️ Fortify armor | EN3's 🛡️ ting on the bramble | the hit is N less | `brambleArmor` {fortify, blocked} |
| 💔 Vulnerable bramble | "💔 +N" on the bramble | the hit is N more | `brambleVulnerable` {extra} |
| 🛩️ Mach dodge | "🛩️ Mach" on the target | a miss | `evaded` {reason: 'mach'} |
| 🎯 Anti-air on the ground | "🎯 Flyers only" on the swinger | a miss | `evaded` {reason: 'antiAir'} |
| 🔁 Encore | "🔁 Encore" on the unit | a second swing | `frenzy` {encore} |
| 🎁 Grant | "🎁 <skills>" on each ally | the skills on them | `statusFx eng27Grant` {targets, skills} |
| 📣 Hype | "📣 Hype" on the ally | its action now | `statusFx eng27Hype` {ff} |
| 🪖 Helmet gone | "🪖 Helmet gone", the pip goes | no more blocks | `deflect` {helmetGone} |

## 2026-11-07 additions: Package ENG28 (describes; the engine decides)
| What | Look | Engine event |
|---|---|---|
| ☠️ Poison damage as stacks (the Herb Refinery's brew, any skill's or shot's poison) | the Poison float on the target, no hit number | `hit` {dmg 0, dmgType poison} + `statusFx poison` {eng28} |
| 🔥 Burn +1 a fire hit, stacking | the 🔥N badge counts up | `statusFx en20Ignite` {amount 1, total} |
| ❄️ Freeze on a frost hit | the icy clock and snowflakes (existing) | `statusFx freeze` {eng28} |
| 🌑 A shot lost in the dark | "Miss!" on the target, no lunge (the arrow already flew) | `blindMiss` {ranged, night} |
| 🔀 Mulligan | a log line at the opening hand | `mulligan` {defId, drewDefId} |
| 👶 Offspring | the copies hop out beside it (Brood's spawn look) | `spawn` {kind: 'offspring'} |
| 👛 Pickpocket from the bramble | the resource line (existing) | `sk2` {kind: 'pickpocketRes', fallback} |
| ? (gold) | a skill learnt at a higher level, in the hover | display only |
| 💀 | a death trigger's chip leads with the skull | display only |

## 2026-11-07 additions (package ENG30): Consecration, Desecration; the Blind pip while attacking; sight look A only

The rules as built (engine: `eng30Ground`, `eng30ExaltTick`, the curse tick in `applyPoisonTicks`; owner 11-07 08:54 #1, #2, #13; decision ENG30-1):
- **Consecration N** (`consecration`): while a unit with it stands (Waiting too, not caged), its own side's ground is **Exalted**: at each round start, right after the poison and curse ticks, every unit on that side heals N (`applyHeal`: Herbalist adds; an Undead unit takes it as damage; Structures and Relict units are not healed). Event `exaltTick` {side, uid, defId, heal}; a ✨ N mark on the units standing on it.
- **Desecration N** (`desecration`): while a unit with it stands, the **enemy** side's ground is **Cursed**: at each round start every enemy unit (not Relict) takes N curse damage, in the same `curseTick` as its cell's Desecrate curse (`ground: true` when Desecration is part of it). The 🜏 mark on enemy units adds it. Cleanse takes only Desecrate's cell curse off; the ground stays while its carrier stands.
- Several carriers on one side: the largest N. **Cancel:** while any Consecration unit and any Desecration unit stand anywhere on the field (either side, or both on one side), neither ground applies, on the whole field; the carriers show a ⊘ mark. Desecrate's own cell curses are not cancelled.
- On no card; "?" until Map 70 (`SKILL_REVEAL_MAP`). Prices 3.5 and 5.9 a point (scale n, theoretical): Regeneration's 2.3 x 3 units x 0.5 (heals wasted on full Health) / x 0.85 (damage).

| Icon | Moment | Event |
|---|---|---|
| 😇 Consecration | ✨ +N heal float on each unit healed; log line | `exaltTick` {side, uid, defId, heal} |
| 👿 Desecration | the curse drain (existing) | `curseTick` {ground: true} |
| 🕶️ Blind / Dark-blind pip | glows while its unit lunges (`.is-attacking`); steady at Effects Low, none at None | display only |
| 😴 shut eye (sight look A) | its first blink plays 1 time in 2; looks B (blindfold) and C (fog) are removed | display only |

## 2026-11-07 changes (package ENG32): Dive reworked, Brood copies

The rules as built (engine: the ENG32 block beside `en7DiveRise` and `broodDefOf` in `bramblewood-engine.js`; owner 11-07 09:47 #11, #15). **Replaces** the target rule of EN7's Dive and the token of Brood above.
- **Dive ⤵️** (`effects.dive`: `true` = plain, N = + N): once a fight, at its swing, only when an enemy unit stands opposite it (`resolveLiveTarget`), it goes aloft (a Flyer, Tide or not: mode `fly`), under (Tide, no Flying: `tide`) or low (neither, a Sprinter or Quick unit: `ground`). While dived nothing can find or hit it and **it blocks nothing**: `resolveLiveTarget` skips it, so the unit opposite swings at its bramble. Its next swing strikes the unit opposite it (past Taunt; a Guardian beside that unit still steps in), or the bramble when nothing is there, for Attack (+ N for Dive N, `eng32DiveBonus`, at the bramble too). Exposed that round as before.
- **Brood N** (`effects.brood`): N tokens, each a 1/1 copy of the parent card (Wait 1, a token, its types and every skill but Brood, `ENG32_BROOD_SKIP`); no Swarm added.

| What | Look | Engine event |
|---|---|---|
| Flying + Dive: aloft | the card rises higher (-30px, was -16px), bobs at Effects High, a wider shadow below, ☁️ tag | `diveRise` {mode: 'fly'}, `.en7-aloft` |
| Tide + Dive: under | the card sinks lower, tinted blue under a band of water whose gradient drifts (Effects High), 🌊 tag | `diveRise` {mode: 'tide'}, `.en7-under` |
| Plain Dive: low | the card lies on the ground with a tight shadow, tilted -5 / -3 / 3 / 5 degrees (from its uid), ⤵️ tag; "⤵️ Out of reach" floats | `diveRise` {mode: 'ground'}, `.eng32-ground .eng32-t0..3` |
| The strike | as EN7's; plain Dive floats "⤵️ Dive" (no + N); at the bramble the log says "dives on the bramble" | `dive` {strike, bonus, bramble?} |


## 2026-11-07 additions (package ENG33): Venom, Poisonous, Thanatosis, Log Walls, Timbered's two forms

The rules as built (engine: `poisonOn`, `eng33PlayDead` / `eng33Wake`, `eng33PoisonousDeath`, `eng33Envenom` in `devour`, `bulwarkRaise`; the engine decides, this describes):
- **Venomous N** (key `poison`): the skill once called Poison N; its counters are **Venom** (☠, the same chip), the damage type is **venomous** (key `poison`). The old Venomous (`venomous`, through Armor) is retired; an old `venomous` reads as Venomous N. Poison Bolt's label is **Venom Spit**.
- **Poisonous N** (`poisonous`, plain 2): when an enemy unit's blow kills it, or a Devour unit eats it from the hand, that unit gets N Venom. Event `statusFx` kind `poisonous`; the board floats "🤢 +N☠". On no card.
- **Thanatosis** (`thanatosis`, 😵): its first fall to 0 Health is no death (no death event, kill credit, On Death, Bounty, graveyard). It plays dead at 1 Health, statuses cleared: no acting (`dozing`), single-target swings, shots and skills miss it (reason `playingDead`), area skills still hit it. It gets up at the next round start. Once a fight. Board: the card tips over greyed (`.is-playing-dead`) with a 😵 chip; events `statusFx` kinds `thanatosis` / `thanatosisWake`; skip reason `playingDead`.
- **Undead** (`undead`): unchanged comeback (once, as a token) and now also the undead status (heals hurt, cures Bleed) for any unit with the skill.
- **Bulwark N**: N Log Walls (`bulwark-wall`, 🪵, 0/4 Structure with Guardian (owner 11-07 22:13; was 0/8)) in the free front-row slots nearest it; was two 0/4N shields. Art prompt: `docs/art-style-prompts.md` (Log Wall).
- **Timbered 🪵🪵 / Bedrock 🪨🪨 / Forged 🔩🔩 / Last Stand 🏳️**: the editor's "Gives" field picks a Stat bonus (Attack / Health; Bedrock: Armor N) or Skills (the braces). Both are stored in `<k>Grant`.

## 2026-11-07 ENG34: melee and ranged
The engine decides; this only describes. Every skill is melee, ranged or none (`canonical/skill-delivery.json`, shown in the workbook's Skills tab). On-hit effects that ride melee hits (Bleed, Venomous, Daunt, Breach, Leech, Decay, Corrode, Toxin and the rest listed there) now land on every melee hit: the swing, Cleave's side hits, prongs and lashes, Pounce, Ambush, Counterattack and a Parasite's feed; their events carry `via` ('cleave', 'prong', 'pounce', 'ambush', 'counter', 'feed', 'gorge') and `eng34: true`, so a skill hit's Bleed / Venom / Daunt pip plays as the swing's does. Thorns now answers those hits too (`thorns` event with `via`). Fletcher and Weapon Master add to every ranged shot (a Cinder or a Snipe now hits for 1 more beside Fletcher). A Reach swing is a ranged swing: Canopy Cover dodges it 1 in 2 (`evaded` reason `canopyCover`). ENG40 (2026-11-09) changed both: see below.

## 2026-11-07 (package ENG35): one skill per idea, its variants are parameters

The engine decides; this describes. `canonical/skill-params.json` lists 53 skill families and the parameters each takes. A card's key holds `true` (the default), a plain value, or an object `{v, <param>...}`: `v` the plain value (left out when true; `null` when the card has only a part), `gives` the braces (what used to be `<k>Grant`), `hp` the Health beside an Attack number (`<k>Hp`), `day` / `night` (Crepuscular's parts), `who` (Esprit), `n` and `species` (Swarm, Defiance), `res` (the Deliveries), `bramble` / `poison` / `bleed` / `count` (Arrow, Fire Arrow, Fire Bolt), `uses` (Dive), `vs` (Hunter), `style` (Archer's look). The table names the internal key each parameter becomes. Every entry also says what plain `true` means (`default`), the plain value's default (`number`), and one example each of the stat version and the ability version; the admin Map cards window shows them in each skill's hover window, with its delivery (melee / ranged / none, `canonical/skill-delivery.json`, which now lists the fused keys only). Examples: `"crepuscular": {"day": [1, 0], "night": [0, 2]}` (stat version), `"crepuscular": {"gives": {"day": {"evasive": true}, "night": {"regen": 2}}}` (ability version); `"loyal": {"v": [1, 2], "gives": {"armor": 1}}` (both).

## 2026-11-09 (package ENG39): duplicate skills as kinds of one family; Exploit shown as Vulnerable, the SK3 action as Shock

The engine decides; this describes. Decision DES2-3 a (docs/design/skill-plan-maps-0-20-2026-11-08.md section 3). A family in `canonical/skill-params.json` may list **kinds**: `"kinds": {"<selector>": {"<value>": "<old key>"}}`. A kind is an old skill with its own rule and price, written on a card as its family key plus the selector; `bramblewood-skillparams.js` (and `tools/skill_params.py`) expand it back into the old key, so the engine and the budget read what they read before.

| Family (key) | Selector: value = old key (old name) |
|---|---|
| Arrow (`arrow`), one shot family (owner 23:05 on ENG35-2) | type: fire = `fireArrow`; type: ice = `iceArrow`; type + form: bolt = `fireBolt`, `iceBolt`, `acidBolt`, `poisonBolt`, `shockBolt` (Speed 1); swings: never = `archer` (its `style` part rides along). The bramble / poison / bleed riders sit beside type: `"arrow": {"v": 2, "type": "fire", "form": "bolt", "bramble": true}` (ENG35-4) |
| Keen Sense (`keenSense`) | sees: dark = `darksight` (Darksight) |
| Speed (`speed`) | kind: blitz = `blitz`; kind: swift = `swift` (on no card; left "+ Add Skill") |
| Delivery (`delivery`) | kind: stockpile = `stockpile`; kind: pearl = `pearl`; every: round = `deliveryEvery` (its `res` rides along; ENG35-2) |
| Daunt (`daunt`) | lasts: lasting = `weaken`; lasts: washed = `stench` |
| Strangle (`strangle`) | hold: full = `constrict`; hold: bind = `tangle` (Tangleweed) |
| Vulnerable (`exploit`) | lasts: lasting = `scar` |
| Heal (`healing`) | who: weakest = `nursing`; who: random = `bloom` (the retired healing Bloom) |
| Harbinger (`harbinger`) | who: ally = `berserk` |
| Twin Strike (`twinStrike`) | shots: true = `doubleTime` |
| Puncture (`puncture`) | kind: breach = `breach` |
| Momentum (`momentum`) | stat: hp = `spoils` |
| Felling (`felling`) | kind: midas = `midas`; res: metal = `prospector` |
| Hoard (`hoard`) | kind: timber = `timber`; res (ENG40): lumber (default, every 3) / stone (every 2) / metal (every 1), a parameter (`hoardRes`), not a kind |
| Carnage (`carnage`) | who: any = `requiem`; who: yours = `dirge`; who: foes = `tally` (its `gives` part rides along) |
| Throng (`throng`) | who: yours = `muster`; who: theirs = `beset` |
| Formation (`formation`) | range: 2 = `sociable` |

Examples: `"weaken": 1` is `"daunt": {"v": 1, "lasts": "lasting"}`; `"requiem": 5` + `"requiemGrant"` is `"carnage": {"v": 5, "who": "any", "gives": {...}}`; `"doubleTime": true` is `"twinStrike": {"shots": true}`. A kind named by two selectors is listed in `kindSets` ({match, key}). A card that holds two versions of one family keeps the second as its old key: Rimefire Salamander's Ice Arrow beside its Fire Arrow (decision ENG39-2). Evolute / Evolute Alpha / Omega and Supreme / Supreme Tide stay separate (owner 23:05). The card editor shows a shot's bramble rider as a Bramble box on the shot's row. `canonical/skill-costs.json` marks each kind's entry `kindOf` (family.selector=value; prices unchanged); `canonical/skill-delivery.json` keeps each kind's entry (the same as its family's; the engine falls back to the family for a key not listed). Quick stays its own skill (the Speed 2 name); Fire Arrow / Fire Bolt, Echolocation, True Sight, Illuminate, Stagger, Corrode, Web, Bola, Lasso, Expose, Carrion, Scavenge, Frenzy, Encore and Perforate stay separate (section 3's proposal; Twin Shot, Volley and Chilli are not arrows or bolts).

Names: Exploit's tokens are shown as **Vulnerable** (`ui.skn-exploit`, the status line, the battle log, the custom action; the key stays `exploit`). The SK3 status action that makes units Shocked (+50% damage taken) is shown as **Shock** (`ui.act3-vulnerable`; log "is Shocked"). The bramble's Unfortify part keeps its name, Vulnerable N.

## 2026-11-08 (package ENG36): status resistances, summon levels, Thanatosis, Constrict, Hoard N

The engine decides; this describes.
- **Status Resist / Weakness / Immune** (`'status:<key>'` in `effects.resist` / `weakness` / `immune`; the list is `ENG36_STATUS`, 30 statuses). Damage over time (Venom, Toxin, Bleed, Burn, Decay, Strangle's squeeze, Wither): Resist halves each tick (rounded down), Weakness doubles, Immune: no tick, counters cleared. Other statuses: Resist -50 points on the landing chance, Weakness +50, Immune never. Held off: `statusFx` kind `eng36Resist` {status, immune}, a 🛡️ float. Decision ENG36-2.
- **Summons at the summoner's level**: `eng36SummonDefId` makes `<token>~lv<L>` on the Forge curve for Log Walls, Spawn actions, Spawner tokens, On Death / On Attacked spawns. A Log Wall is 0/4 at Level 1, 0/8 at Level 10. Decision ENG36-3. ENG40: half the growth, 0/6 at Level 10 (below).
- **Thanatosis** (rework): while it plays dead, swings pass through to its bramble (`resolveLiveTarget`), aimed skills miss it, a random pick can hit it (`eng36RandUid`). It floats up at the next round start (`.eng36-floatup`, not under reduced motion). The 😵 chip greys as used.
- **Constrict N** (`constrict`, 🐍): its melee hits Bind and squeeze (N) for a round, and the held unit skips its turn and loses its skills and triggers (Silence through `sk3Apply`). Status `constricted`, skip reason `constricted`, `statusFx` kind `constrict`. Actions `strangle` / `constrict` (amount = squeeze, who / sub / targets).
- **Hoard N**: +N/+N for each Lumber held, floor(Lumber x N), N may be a fraction (in `condStatsOf`, like Timber). Decision ENG36-1. ENG40: every 3 Lumber (below).

## 2026-11-09 (package ENG38): targeting picks at random

The engine decides; this describes (owner 2026-11-09 21:36 on ENG37-1: "Never have prioritised targeting, alwayes default to randomign"; `docs/project-state.md`).
- **Reach**: with nothing opposite and a unit in both lanes beside it, a coin flip (`eng37ReachPick`; was the one with less Health). Taunt still draws it.
- **Named rules kept, ties random** (`eng38Best` / `eng38TopN`, the fight's seeded RNG, a roll only on a real tie): Healing and the Herb Refinery (most wounded), Cure (most envenomed), Repair (most damaged structure), Berries (most hurt), Hype (most Attack), Grant (the N nearest), Rampart (the nearest), Disarm (the nearest lying weapon), a "furthest" ally, the bosses' Thistle Prick / Undertow / Root Grip / Lodge Repairs, Trident / Pitchfork with the middle line empty (one of the two side lines), Octolash's 7 nearest. Was: left first, first listed, or the newest.
- **No rule in the text, now random** (`eng38Pick`): Amore's mate (was the nearest), Dismantle's loose piece (was the nearest).
- Already random before: Arrow / Bolts / Bola / Lasso "facing, else nearest" ties, Bloodlust's leap, Restless, Guardian, Spellward, Taunt ties, Nursing ties, Rocket ties, Missile, Snipe, Spitfire.
- Not changed: the CPU's choices (where it plays, Equipment, hazards, Parasites, Devour, its Aimed Bolt) are strategy; the old row ("gravity") board's left-hand facing convention; the raid file's own picks. Call ENG38-1: whether the named rules go random too.

## 2026-11-09 (package ENG40): Hoard by resource, gentler summons, ranged swings, arrows-only Fletcher, Flora

The engine decides; this describes (owner decisions 2026-11-09 23:05 / 23:07; `docs/project-state.md`).
- **Hoard N**: +N/+N for every 3 Lumber you hold (`HOARD_PER`, `hoardStatsOf`: N x floor(held / per), the product rounded down); `"hoard": {"v": N, "res": "stone"}` counts every 2 Stone, `"res": "metal"` every Metal (`effects.hoardRes`). Timber (`hoard {kind: timber}`) keeps +1/+1 a Lumber. Card line: `ui.eng36-hoard` ("+{n}/+{n} for every 3 Lumber you hold."); `ui.eng40-hoard-stone` / `ui.eng40-hoard-metal` are ready for the app's Stone / Metal line (no card uses them yet). Priced 1 x N (Lumber), x0.8 (Stone), x2 (Metal): `bramblewood-budget.js` `hoardS` / `HOARD_RES_MULT`.
- **Summons**: half the normal level curve's growth, each stat rounded down (`ENG40_SUMMON_GROWTH` in `eng36StatsAt`): Log Wall 0/4 at Levels 1-6, 0/5 at 7-9, 0/6 at 10-11.
- **Ranged swings**: a Boomerang / Bananarang swing (the `swing` list in `canonical/skill-delivery.json`) carries no melee rider: `eng40MeleeSwing` gates the swing's Bleed, Venom, Greater Poison, Hemorrhage, Decay, Daunt, Corrode, Scar, Perforate, Breach, Pry, Pulverise, Desecrate, Bludgeon, Toxin / Weaken / Bulldoze / Tangleweed / Strangle, Web, Brittle, Wither, Psychic, Sequestration, Leech, the status rolls and On Hit triggers (Expose, Exploit, Skitter ...). Wave, the lightning arcs, Swipe, Overwhelm, Momentum, Sunder, Crit and King Slayer stay. Thorns, Poison Barbs, Ichor and Spiteful still answer the swing (unchanged).
- **Reach** is melee again (off the `swing` list): its swing carries the melee riders; Canopy Cover no longer dodges it. It stays Flying level 1 on the flying meter (ENG37): a Flyer never dodges it, a Mach unit 1 in 2.
- **Fletcher and Weapon Master**: arrows only (`eng40ArrowShot` marks the hit, `fireDamageAction` reads the mark once): Arrow, Fire Arrow, Ice Arrow, Twin Shot, Volley, an Archer's shot and the Arrow action (`bxArrowShot`), Barrage's physical arrows. Not the Bolts (the bolt form), Spitfire, Bola, Lasso, Snipe, Rocket, Missile, Deal damage.
- **Flora**: Ent, Bramble Sprout, Thornvine Lasher, Elder Willow, Strangler Vine, Cypress Root Lurker and Pinecone Sapper are species Plant (Flora phylum), no longer Elemental: Nature's Force (+N/+N to Elementals) and any Elemental type match (Kinship Elemental, an Elemental filter, Esprit kin with Elementals) stop counting them; they were already Flora through their Tree / Vine / Flora types, and Psychic still can't hurt them (Plant is mindless too).
- **Esprit {v: 0, hp: N}**: +0/+N per kin; priced as its Health part only (`zeroFree`). Sunthroat Courier is written that way.

## Effects Lab, 2026-11-11 (package LAB3): the "Ideas 11-11" tab

Owner: "add much more vfx we can consider adding to our game in the master hub."

**Where to pick:** the hub's ✨ Effects Lab, tab **💡 Ideas 11-11** (`tools/effects-lab/fxlab-ideas2.js`, on LAB2's tab engine). 47 candidate
effects, three looks each (the crit has three looks for each of the 11 damage types), grouped by category with filter chips, each with a ▶ per
look, its one-line "Used for" and the badge **Lab only (not used yet)**. The effects are `window.IdeasFX2` in `bramblewood-fx-ideas2.js`.
**Not wired:** the file is loaded by the Lab only (`tools/effects-lab/build.py`); `assemble_arena.py` and `arena_app.js` do not know it.
To use one: add the file to the bundle, call `IdeasFX2.<name>(target, {v, ...})` where the moment happens (an `onEvent` or `fxHook` line, as
in `docs/effects-lab-contract.md`), and change its row below and its `add(...)` line in `fxlab-ideas2.js` to "In game: <where>".
`python3 tools/hub/build.py` now rebuilds the Lab first, so the hub shows this tab (its check fails if the tab is missing).

Rules for all of them (as Ideas 10-21): GSAP only, transform and opacity, no CSS filter, no blend mode, no full-screen layer (field and map
looks cover the box they are given), at most 38 overlay nodes alive (`node()` hands back a detached node past that), battle and UI beats 2 s
at most, big moments 3 s at most, one still glyph under reduced motion. Every function takes a node, a list of nodes or a box, honours
`onImpact` / `onDone`, resolves once every node it added is gone, and puts back a card it moved (`clearProps`). No words on screen: glyphs and
numbers only (`bossIntro` shows a name the caller passes, translated).

### What the game already has, and the gaps (audit, 2026-11-11)

- **Libraries:** `docs/effects-inventory-2026-10-15.json` (1041 moments: 957 live, 51 Lab only); `FX.A` to `FX.G` (about 400 functions),
  `SkillFX` (about 110), `UnitFX` (hit styles and skins), `ProcFX` (cracks, crumble, shatter), `WarFX` (16, Lab only), `IdeasFX` (29, Lab only).
- **Skills with no look of their own:** the skill table above lists 39 as "none (a rule or stat with no moment of its own)"; later packages
  left Sequestration (the log), Hoard / Timber / Venom Master / Fletcher / Herbalist (the chip), Majesty, Meld, Lone Wolf, Ghost, Mulligan
  (the log), Encore (a float) and Consecration (the heal float) without a moment of their own.
- **One look for many moments:** every crit shares `critBurst` and the CRIT stamp whatever the damage type; every ordinary unit lands the same way
  whatever it is (`playLandingImpact`: a squash-thud, a ripple on water maps; `SkillFX.summonPortal` for spawns; only dragons, bosses, huge
  units and Skyfall have their own); a unit sent back to the hand just vanishes; buffs and debuffs that stack show
  only a bigger number; the forecast is a pill, never on the field.
- **Nothing yet:** a rainbow after rain, an aurora on cold nights, road progress as a bar, a boss phase beyond the stage chip, a button press
  outside the home menu, a "hand full" warning before the auto-pitch, a notification ping, idle visitors on the board.

### The 47 (all Lab only, not used yet)

| Group | Name | Call | Used for | Looks (v 0 / 1 / 2) | Nearest look in the game |
|---|---|---|---|---|---|
| Skills | Sequestration | `IdeasFX2.sequesterGrab(victim, {from, icons, v})` | Sequestration takes the hit unit's status skills for a turn | a paw grabs the chips / a jar scoops them / they fly home (expire) | none (a log line) |
| Skills | Hoard and Timber | `IdeasFX2.hoardStash(unit, {n, v})` | Hoard N and Timber growing with the stash | acorns heap up / a sack swells with coins / logs stack | none (the chip) |
| Skills | Venom Master, Fletcher, Herbalist | `IdeasFX2.masteryOrbit(unit, {v})` | the "master" passives boosting | vials orbit and dive in / feathers fletch an arrow / leaves | none |
| Skills | Lone Wolf | `IdeasFX2.loneWolfHowl(unit, {v})` | Lone Wolf alone in its row | a moon and howl rings / a lone spotlight / a leaf on the breeze | none (`FX.A.packHowl` is the Pack bonus) |
| Skills | Ghost | `IdeasFX2.ghostDrift(unit, {from, v})` | Ghost: see-through, swings pass through | a sheet rises and sways / a swing passes through / "boo!" with puffs | `FX.A.shadowPass`, `FX.C.deathGhost` (other moments) |
| Skills | Majesty | `IdeasFX2.majestyBow(unit, {foes, v})` | Majesty N: the facing enemies swing weaker | golden rays and the foes bow / a bell and gold rings / a red carpet rolls to them | none |
| Skills | Consecration | `IdeasFX2.exaltedGround(sideUnits, {v})` | Consecration: its side's ground is Exalted | a golden glow under each unit / halos settle / petals and a bell | the ✨ heal float |
| Skills | Encore | `IdeasFX2.encoreCurtain(unit, {v})` | Encore: one more swing | a curtain call with roses / a spotlight and claps / a replay arrow and a second lunge | the "🔁 Encore" float |
| Skills | Meld | `IdeasFX2.meldLink(meldUnits, {v})` | Meld units sharing the grant | beads run between them / puzzle pieces click / rings pulse in turn | none |
| Crits | Crit by damage type | `IdeasFX2.critElement(target, {element, v})` | a crit, in its damage type's colours, glyph and bits (all 11: physical, fire, cold, acid, venomous, decay, magic, water, stone, metal, lightning) | a starburst with the element's glyph / two crossing slashes / three rings and a squash | `critBurst` + CRIT stamp, `FX.A.critSparks` (one look for all) |
| Heal | Heal | `IdeasFX2.healHearts(unit, {v})` | heals (Healing, Heal, Regeneration) | hearts in bubbles / a flower blooms / a plaster slaps on and peels off | `SkillFX.heal`, `healPlus`, the "+N❤" float |
| Heal | Heal from a healer | `IdeasFX2.lifeLink(target, {from, v})` | one unit healing another (Bloom, Herb Refinery, heal actions) | hearts arc over / a green orb hops over / a little cloud rains on it | `SkillFX.bloomPollen` |
| Heal | Shield | `IdeasFX2.shieldBubble(unit, {v})` | Shield gained, Shield breaks | a soap bubble forms / it pops (breaks) / a leaf curls in front | `SkillFX.shieldUp`, `FX.A.shieldFlare` / `shieldShatter` |
| Heal | Cleanse | `IdeasFX2.cleanseWash(unit, {v})` | Cleanse and Cure | a foamy rinse sweeps across / soap bubbles scrub / a sunburst dries the grime | `cleanseVfx` (a rising band), `SkillFX.cure` |
| Arrivals | Birds and flyers | `IdeasFX2.arriveSwoop(unit, {v})` | a Flyer or bird played or summoned | an arc swoop and feathers / a dive from high / a spiral glide | the shared landing; `SkillFX.swoop` is an attack |
| Arrivals | Burrowers | `IdeasFX2.arriveBurrow(unit, {v})` | a digger played or summoned | a mound pops / a tunnel of bumps runs to the slot / a sand swirl | the shared landing |
| Arrivals | Swimmers | `IdeasFX2.arriveSplash(unit, {v})` | a Swimmer, fish or Tide unit arriving | it leaps out of a splash / it floats up in a bubble / a wave carries it in | "Card landing ripple on water" |
| Arrivals | Hatchlings | `IdeasFX2.arriveHatch(unit, {v})` | a Hatchling or egg-laid token arriving | the shell halves fall apart / it hops twice and the top flies off / a popcorn pop | `eggCrackVfx` (the board egg) |
| Arrivals | Insects | `IdeasFX2.arriveSkitter(unit, {v})` | an insect, spider or Swarm unit arriving | a swarm runs together / it lowers on a silk thread / a leaf lifts off it | the shared landing |
| Leaving | Return to hand | `IdeasFX2.returnToHand(unit, {to, v})` | a unit bounced back to its owner's hand | a boing arc / a rewind / a string yanks it down | none (it vanishes) |
| Leaving | Exile | `IdeasFX2.exileFold(unit, {v})` | Exile from the board | it folds into a paper star / a vortex and a lock / it floats off in a bubble | `FX.C.deathExile`, `FX.A.exileWisp` |
| Leaving | Cute death | `IdeasFX2.deathPoof(unit, {v})` | an ordinary death (gentler options: Tutorial, low Effects, tokens) | a poof and a halo / it squashes flat and sees stars / it sinks and a flower grows | the smooth topple (`fallDeathVfx`) |
| Stacks | Buff stacks | `IdeasFX2.buffStack(unit, {n, v})` | a buff stacking again (Inspired, Momentum, Grit, Swarm, Rally) | a chevron tower / an orb per stack in orbit / a corner badge counts up | the gold float and `statPillPulse` |
| Stacks | Debuff stacks | `IdeasFX2.debuffStack(unit, {n, v})` | a debuff stacking again (Weaken, Vulnerable, Scar, Daunt) | chain links hang down / a raincloud grows and drips / rocks pile on and squash it | the debuff float |
| Field | Lane surge | `IdeasFX2.laneSurge(columnCards, {v})` | a column that matters (column skills, Rook's Row, Arrow Slits, Rampart, a lane hit's wind-up) | runway lights / a glowing seam / wind streaks | `#rowMine.turn-glow` (a whole row) |
| Field | Rainbow | `IdeasFX2.fieldRainbow(fieldBox, {v})` | rain stops, Spring Rain ends | a rainbow arc / puddles shine and dry / clouds part and the sun peeks out | `FX.B.rainStartStop` |
| Field | Aurora | `IdeasFX2.fieldAurora(fieldBox, {v})` | night on a cold map (Frigid, tundra, Hail at night) | green ribbons / pink and violet / a quick shimmering curtain | none |
| Field | Field omen | `IdeasFX2.fieldOmen(fieldBox, {v})` | the forecast on the field a round ahead (quake, storm, flood) | pebbles hop and cracks flicker / dark clouds gather / the water rises | `FX.B.forecastPop` (the pill) |
| Map | Road progress | `IdeasFX2.roadProgress(box, {from, to, v})` | progress along the road (fights won, the level track) | a hedgehog walks the bar / flags pop at milestones / lanterns light | `FX.E.trailDraw`, `pawnTrail` |
| Map | Map transition | `IdeasFX2.mapTransition(mapBox, {at, v})` | map to map, into a sub-map and back | a circle wipe / clouds roll over and part / the map folds like paper | the leaf sweep, `inkWash`, the slide |
| Packs | Rarity climb | `IdeasFX2.rarityClimb(card, {rarity, v})` | before a pack card flips | the glow climbs colour by colour / its stars pop / its gem drops in | `FX.D.packTease`, the rarity teases |
| Packs | Shiny | `IdeasFX2.shinyGlint(card, {v})` | a Shiny pull | corner glints / a rainbow ring of dots / a wand tap and rainbow sparks | `FX.D.revealShiny` (a hue sweep) |
| Packs | Legendary | `IdeasFX2.legendaryWings(card, {v})` | a Legendary pull | golden wings unfold / a pillar of light / a ring of stars becomes a crown | `FX.D.revealLegendary` (coins and a crown) |
| Results | Victory cheer | `IdeasFX2.victoryCheer(yourUnits, {v})` | a win, on your units | a wave hop with confetti / balloons / poppers | the Victory toss |
| Results | Defeat droop | `IdeasFX2.defeatDroop(yourUnits, {v})` | a loss, gently | a little raincloud / a white flag / a wilted flower | the scatter, `.wl-dusk` ash |
| Results | Level up | `IdeasFX2.levelUpSpring(card, {level, v})` | a card levelling up (temper, Kibble, a summon's level) | it springs up trailing chevrons / a star climbs steps / balloons lift the number | `SkillFX.levelUp`, `FX.F.accountLevel` |
| Results | Map cleared | `IdeasFX2.mapClearFlag(mapBoxOrNode, {v})` | a whole map cleared | a flag planted / a gold seal stamps down / the sun rises with birds | `FX.E.mapCleared` (a banner) |
| Boss | Boss intro | `IdeasFX2.bossIntro(boss, {box, name, v})` | a boss or raid boss entering | letterbox bars and a name plate / a silhouette whose eyes glint / spotlights lock on | the quake and "BOSS" title, `FX.F.bossRoar` |
| Boss | Boss phase | `IdeasFX2.bossPhase(boss, {phase, v})` | a boss's next phase (Enraged, a raid stage) | a glowing seam and shed bits / rage steam and red pulses / an hourglass flips | the stage-name chip, `FX.F.raidStageChange` |
| UI | Button press | `IdeasFX2.buttonSquish(button, {at, v})` | any button press | a jelly squash and ripple / an ink ring and stars / a confetti pop | `menuBtnClickPop` (home menu only) |
| UI | Lumber lands | `IdeasFX2.lumberGain(pill, {from, n, v})` | Lumber or any resource gained | logs hop onto a woodpile that slides in / an axe chops and a log rolls over / a beaver carries it | `hudPillBing`, `FX.F.resourceGain` |
| UI | Card drawn | `IdeasFX2.cardDraw(handCard, {from, hand, v})` | a card drawn into the hand | a sparkle swish (the hand makes room) / it springs out of the deck / a bird drops it in | `drawFlipVfx` (a face-down flip) |
| UI | Hand full | `IdeasFX2.handFull(handCards, {v})` | the hand is full: the next draw is pitched | they jostle and sweat / a gate shuts / a ghost card puffs away | `animateOverdraw` (after the fact) |
| UI | Something new | `IdeasFX2.notifyPing(button, {v})` | a button or tab with something new | a red dot and ripples / an envelope hops / a bell jingles | the "!" on a map spot |
| UI | Mulligan | `IdeasFX2.mulliganSwap(handCard, {v})` | the opening-hand swap | it slides out and back / a shuffle flip in a spinning arrow / a die tumbles | none (a log line) |
| Idle | Visitor | `IdeasFX2.idleVisitor(card, {v})` | now and then on a calm board or menu (decor, never on a control) | a butterfly lands / a ladybird walks the edge / a leaf drifts and slides off | the map critters (maps only) |
| Idle | Yawn | `IdeasFX2.idleYawn(card, {v})` | a unit that has waited a long time (long Wait, Hibernate) | a stretch and yawn / it nods off and jolts awake / a cat stretch | the idle breathing |

Checks: `tests/lab3-2026-11-11.js` (every look in a fake DOM: resolves, callbacks once, nodes gone, 38 at most, the card put back, reduced
motion one still node) and `tests/e2e/lab3_2026_11_11.py` (every look played in the built Lab at 1366, the first of each at 390, and under
reduced motion: no page error, fewer than 40 overlays on any frame, none left).

## 2026-11-12 (package FX6): High Tide's wave, Bulwark's rise, bugs, the spore puff
All four are cheap by design: one element or a handful of spans (WAAPI, transform and opacity, no per-frame reads), removed when done, nothing running after, no motion under reduced motion.

| Effect | Where | Look | Code |
|---|---|---|---|
| ✅ High Tide's second layer | the standing tide scene while the tide is High | one `.tw-wave` over the settled water: the tide's blue wash, a breaking crest (long back, curled lip) with the same soft white crest line, drifting 9 s a tile; fades and rises in after the tide arrives; still on Low effects / reduced motion, gone on None | `.tw-wave` in `arena_template.html`, `syncTideScene` |
| ✅ Bulwark: walls rise | spawn `kind:'bulwark'` | the Log Wall is revealed bottom-up behind a clip while it lifts 34 px into its slot, dust at its foot, a hammer-knock cue (`constructTone`, cue 40); no flight from the card, no summon portal; reduced motion / Low: a fade | `riseUpFx`, renderBoard `riseUp` branch, origin kind `rise` |
| ✅ Swarm, Spawn on death: bugs | Swarm hit; spawn `cause:'onDeathSpawn'` | 9-10 small bug silhouettes scatter from the unit, crawl through two turns, fade by 0.9 s; the game's Swarm now uses this instead of the 26-bug steered cloud (`SkillFX.swarm` stays in the Lab) | `bugCrawlVfx` |
| ✅ Spore puff | Spore Cloud's sleep tick (`statusFx` `field:'sporeCloud'`); a Puffball Bombardier's hit | five dark lime-green puffs billow up off the card and thin out in under 1 s; reduced motion: one soft fade | `sporePuffVfx(el)` (reusable) |

Lab entries: `tools/effects-lab/manifest/fx6.js` (variant key `FX6`). Check: `tests/fx6-2026-11-12.js`.

## 2026-11-13 (package UIFX2): the world as a journey (map seasons, travel, ambient weather)
Owner 00:03: "season changes when moving from certain maps etc." Every map has a season or biome (`MAP_SEASON` in `bramblewood-ui-world.js`; Maps 0-21 meet all eight). One hook line in `renderConquestSubTab` calls `BramblewoodWorld.arrive(map)` on every map render: a new map travels from the last one, the same map keeps its season in the new frame. Effects None: nothing; Low or reduced motion: the vignette only, at once; Medium: + ambient (8 spans), the change and the travel beat; High: 14 spans.

| Effect | Where | Look | Code |
|---|---|---|---|
| ✅ Season vignette by place | every map render | the game's `.season-veil` now follows the place, not the calendar month: the four season looks plus desert (warm ochre rim), ash (ember-red floor glow, dark rim), coast (aqua rim); none in the dark | `setSeason`, `veilSet` |
| ✅ Season change | moving to a map of another season | ~0.95 s: the vignette crossfades, a wash of the season's colour crosses from the side you came from, and its flourish: petals on a gust over a greening floor (spring), a sun flare and rising heat bands (summer), leaves tumbling as the light turns amber (autumn), the first snow and a frost rim closing in (winter), a sand gust (desert), embers off a glowing floor (ash), a tide line: a foam crest washing up the pane and back with glints (coast), darkness closing in (deep) | `change`, `flourish` |
| ✅ Travel beat | moving between maps (list, edge arrows, swipe) | ≤ 1.15 s: the pane's edges dim, a soft lit route draws in from the side you travel from to where your pawn lands, seven paw prints walk along it (three quiet `pawnStep`s), then it fades as the new season arrives. A side map and its parent zoom (no route). No route while the map's title card is due (the title is the arrival). Any tap, key or wheel finishes it at once and still goes through | `travel`, `road`, `route` |
| ✅ Season ambient | while the map is open | 8-14 small spans on CSS keyframes (transform and opacity only, no canvas, no timers): petals, haze bands and pollen, leaves, snow, sand streaks and a drifting sand haze, embers and ash, sea spray and glints at the coast (the tide itself washes in with the change: the coast art puts the sea on different sides). Placed under the time-of-day tint, so dawn, dusk and night grade it; half the spans where the map's shader or FX.E ambience already shows that weather; gone in a fight | `mountAmb`, `lanes` |

Lab entries: `tools/effects-lab/manifest/world.js`, the group "World (UIFX2)" (ids `map-grand-uifx2-*`: A the change, B the ambient; travel A / B / C). Frames: `docs/screens/uifx2/`, `python3 tools/uifx2_frames.py`. Check: `tests/uifx2-2026-11-13.js` (`--browser` for the real map).
