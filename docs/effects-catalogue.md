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

## Battle effects

| Effect | What it looks like | Where | How | Status |
|---|---|---|---|---|
| **Ripple / shockwave** | A ring of distortion expanding from an impact | Castle hit, big crits, a Swamp splash | Background only: [Overlay]. Real board distortion: [DOM shader] (Chrome) or a short [SVG] displacement pulse | 📝 |
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
| A7 | **Wait countdown flip:** the ⏳ ring flips like an hourglass when Wait ticks down | It teaches the Wait rule without any text | S |

### Shaders ("OpenGL": textures and lighting)

| # | Add | Why it matters | Effort |
|---|---|---|---|
| G1 | ✅ **Shockwave on the felt:** castle hits and blows of 8+ send a ring of light, with a dark trough behind it, rolling across the battlefield in the damage colour (`layer.wave`, `u_wave`) | It's the "wow" moment of combat, and it reuses the light pipeline | Built |
| G2 ✅ | **Card shadows on the felt:** the shader gets the card rectangles (up to 12 as uniforms) and draws soft shadows away from the lamp, which moves with the pointer | This is what makes the felt read as a table with objects on it rather than a backdrop. The biggest depth win available | M |
| G3 ✅ | **A material per map:** a wet sheen with specular highlights on Swamp and Coral, charred ash cracks glowing on Ashen Peak and the Foundry, frost on the Tundra, sand ripples on the Savanna. It's one `u_material` switch in the felt code | Every map currently has the same cloth or plain light. A material makes each map feel like a place you're standing on | M |
| G4 | **Noise dissolve for deaths:** an art-shader burn that eats the actual card art along noise, replacing the CSS ragged mask | Richer than today's burn, but the CSS version already works | M–L |
| G5 | **Volumetric lamp in the caves:** the fog thickens away from the pointer lamp, and cards outside the light go dim | The caves would feel like a dungeon. It fits the lore | S |
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
| S7 | **Music, at last:** a generative loop per people (Legion: frame drum and low brass drone; Sunfeathers: pan flute, shakers and claps; Road-folk: plucked strings and an accordion-like reed), which gets busier as the castles drop | It's the one big audio gap. It waits on your D17 call (cosy, chiptune or mixed) | L |
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

**Coming next (TBC in the Effects Lab), list two:** raindrops on cards on wet maps; a boss entrance with a quake and a title card; a coin shower on rewards; a combo counter; card tilt in hand; seasonal map palettes.
