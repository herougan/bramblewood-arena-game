# FX batch B status (2026-10-15)

Batch B: statuses (part), darkness & light, fields, weather & time. 139 inventory entries
(`docs/effects-inventory-2026-10-15.json`, `batch: "B"`). Code: `bramblewood-fx-b.js` (`window.FX.B`); lab demos:
`tools/effects-lab/manifest/b.js`. Every entry is registered in the Effects Lab catalogue with a working demo (139 / 139 built,
0 console errors on a full play-through of every variant).

Counts: **48 done-existing** (the game's look was already good; the lab demos the live look),
**74 new** (built in this batch; 19 of them are planned/future rules shown as lab concepts with no game hook yet),
**17 with variants** (2–3 looks registered side by side; the game uses A). Where a look replaced an old one, the
old look is kept as the last variant ("Now in the game (before this pass)") for comparison.

## Game hooks (2026-10-15)

- `FX.B.onEvent` (battle events through `fxBatchVfx`): statusFx poison / bleed / thaw / expose / inspired / firstBlood / blind,
  decayTick, cageBroken, irradiation, hit (Inspired spent, Lantern / Keen Sense saves in the dark, Staggered ½ hit, Shocked +50%,
  Exposed cashed in, Shade at night, Supreme ward crush, Resist ½ / Weak ×2, Decay landing, Keen Sense vs Blind), evaded (Shadow),
  blindMiss (per darkness level), death (Lantern carrier), beware, devilry, phase (day / twilight / realtime), dawn, moon, tide
  (ebb / high / Moonpull), wind (gust / calm / direction swap), triggerFired (Headwind echo), fieldSet, fieldEnd (+ the map field
  returning), fieldTick (Frigid weak / frost resist, Spring Rain, irradiation, petrify, mountain settles, tide-spout), wash,
  lumber (arena rule), roundStart (Deep Mines).
- One-line `fxHook` calls added to `arena_app.js`: `matchUI` (renderMatchUI: lights go out when a dark fight opens, light returns
  when it ends, perma-tide current, lasting Fog / Moon field layers, dusk, arena ruleset seal), `boardRendered` (renderBoard:
  who can't see in the dark, Sun-shy / Night-blind, Blind status badge, Darksight eyes, Lantern light pool, forecast pill),
  `fieldReveal` (noteFieldEvent), `terrainBanner` (maybeTerrainIntro), `initCoin` (syncInitiativeCoin), `mapRain` (mountMapShader).
- Fixes in `arena_app.js`: the Twilight phase toast said "☀️ Day breaks." — it now says "🌆 Twilight: …" (and plays the night
  swell, not the rooster); the blind-miss float asks `FX.B.missText` so each darkness level reads differently
  ("🌑 Dark miss" / "⬛ Pitch miss!" / "🕳️ Void miss!", "🌙 Night-blind!", "☀️ Dazzled!").
- Gating: everything is skipped under reduced motion / Effects "none" (fxBatchVfx / fxHook); heavy looks need `fxAtLeast('med')`;
  repeating looks use `env.once` (once per unit per round); nothing is awaited in the replay.

## Entries

| area | id | status | was | lab variants | in-game hook |
|---|---|---|---|---|---|
| status | `st-poison-apply` | new | basic | A: Glop splats on, ooze rises, bubbles pop / B: Now in the game (before this pass): the number only | onEvent: statusFx poison |
| status | `st-poison-tick` | done-existing | good | A: Shake, green tint, bubbles and a cloud (live look) | existing game code (renderVfxForEvent / eighthPassVfx / CSS) |
| status | `st-bleed-apply` | new | basic | A: A gash opens, drops fall from it / B: Now in the game (before this pass): the number only | onEvent: statusFx bleed |
| status | `st-bleed-tick` | done-existing | good | A: Shake, red tint and a drip (live look) | existing game code (renderVfxForEvent / eighthPassVfx / CSS) |
| status | `st-decay-apply` | new | missing | A: Grey-violet mould creeps in from the corners | onEvent: hit by a unit with Decay (the engine has no event; inferred from the attacker's Decay skill) |
| status | `st-decay-tick` | new | basic | A: Mould flares, spores burst, a grey sword crumbles / B: Now in the game (before this pass): shake and the bleed tint | onEvent: decayTick |
| status | `st-freeze-apply` | variants | good | A: Ice block grows over the card / B: With the float and chime, as in a fight |  |
| status | `st-freeze-tick` | variants | basic | A: A counter melts: chips break off, water drips / B: The last counter: the crust breaks away in steam / C: Now in the game (before this pass): "❄ Thawed" at 0 only | onEvent: statusFx thaw (every counter; left 0 = the last) |
| status | `st-freeze-field` | done-existing | good | A: Cold wave, ice pulse and chill (live look) | existing game code (renderVfxForEvent / eighthPassVfx / CSS) |
| status | `st-sleep-apply` | variants | good | A: Dims, sways, three Z’s / B: With the float, as in a fight |  |
| status | `st-paralyze-apply` | done-existing | good | A: Yellow sparks crackle (live look) | existing game code (renderVfxForEvent / eighthPassVfx / CSS) |
| status | `st-stun-apply` | variants | good | A: Stars wheel round its head / B: With the shake and float, as in a fight |  |
| status | `st-stagger-apply` | done-existing | good | A: ✦ stars wheel round (live look) | existing game code (renderVfxForEvent / eighthPassVfx / CSS) |
| status | `st-stagger-weak-hit` | new | missing | A: Dull dusty thump, attacker wobbles, "½ hit" chip | onEvent: hit by a Staggered attacker (replayCards.staggered) |
| status | `st-blind-apply` | variants | good | A: Ink splat, then the lasting inked-eye badge / B: Ink splat, then a blindfold while it lasts / C: Now in the game (before this pass): the ink splat only | eighthPassVfx statusFx blind (ink); then onEvent statusFx blind → FX.B.sightSync puts the lasting ink-eye badge on while Blind lasts |
| status | `st-blind-keen-sense` | new | missing | A: Ink bounces off, whisker ripples spread | onEvent: a Blind-on-hit attacker hits a Keen Sense unit (once a round) |
| status | `st-tipsy-apply` | done-existing | good | A: 🫧 bubbles wheel round (live look) | existing game code (renderVfxForEvent / eighthPassVfx / CSS) |
| status | `st-confuse-apply` | done-existing | good | A: ❓ marks wheel round (live look) | existing game code (renderVfxForEvent / eighthPassVfx / CSS) |
| status | `st-shock-apply` | done-existing | good | A: Glitch flicker (live look) | existing game code (renderVfxForEvent / eighthPassVfx / CSS) |
| status | `st-shock-bonus-dmg` | new | missing | A: Arcs jump on impact, "+50%" chip | onEvent: hit on a Shocked target (replayCards.shocked), at impact |
| status | `st-corrode-apply` | done-existing | good | A: Acid fizz (live look) | existing game code (renderVfxForEvent / eighthPassVfx / CSS) |
| status | `st-expose-apply` | done-existing | good | A: Red crosshair (live look) | existing game code (renderVfxForEvent / eighthPassVfx / CSS) |
| status | `st-expose-bonus-hit` | new | missing | A: Crosshair snaps shut and shatters | onEvent: the next hit on a unit after statusFx expose |
| status | `st-daunt-apply` | done-existing | good | A: Cold purple shiver (live look) | existing game code (renderVfxForEvent / eighthPassVfx / CSS) |
| status | `st-wither-apply` | done-existing | good | A: Black smoke rolls up (live look) | existing game code (renderVfxForEvent / eighthPassVfx / CSS) |
| status | `st-wither-tick` | done-existing | good | A: Black smoke, max Health drops (live look) | existing game code (renderVfxForEvent / eighthPassVfx / CSS) |
| status | `st-irradiation-apply` | new | basic | A: Green hex tokens arc in from the source and stick / B: Now in the game (before this pass): the float and a pulse | onEvent: fieldTick irradiated (source → unit) |
| status | `st-irradiation-tick` | new | basic | A: Each lost stat glows green and dissolves into pixels / B: Now in the game (before this pass): "−skill" as a word | onEvent: irradiation {points} |
| status | `st-smoke-apply` | done-existing | good | A: Smoke bomb on an ally (live look) | existing game code (renderVfxForEvent / eighthPassVfx / CSS) |
| status | `st-scar-apply` | done-existing | good | A: Claw marks (live look) | existing game code (renderVfxForEvent / eighthPassVfx / CSS) |
| status | `st-chain-break` | done-existing | good | A: The chain snaps and falls (live look) | existing game code (renderVfxForEvent / eighthPassVfx / CSS) |
| status | `st-petrified-apply` | new | basic | A: Stone creeps up from the foot and cracks / B: Now in the game (before this pass): instant grey | onEvent: fieldTick petrify |
| status | `st-coffee-crash` | done-existing | good | A: Dims and dozes (live look) | existing game code (renderVfxForEvent / eighthPassVfx / CSS) |
| status | `st-chilli-burn` | done-existing | good | A: Chilli sting (live look) | existing game code (renderVfxForEvent / eighthPassVfx / CSS) |
| status | `st-inspired-spent` | new | missing | A: The gold flares and streaks into the swing | onEvent: the next hit by a unit after statusFx inspired |
| status | `st-cage-broken` | new | basic | A: Bars burst outward, the padlock springs open / B: Now in the game (before this pass): a toast | onEvent: cageBroken |
| status | `st-ward-crush` | new | missing | A: A hex ward cracks with prismatic light and shatters | onEvent: hit by a Supreme attacker on an armoured / shelled / stone / shielded target |
| status | `st-resist-weak-hit` | variants | missing | A: A chip beside the number / B: A stamp on the card: glancing dome / red cracks / C: A "½" / "×2" badge pops from the corner | onEvent: hit whose target resists or is weak to it (worked out from the card defs, like resistFactor) |
| status | `st-burn-d65` | new (future: lab concept) | missing | A: Embers cling to the foot, the edge chars | future |
| status | `st-chill-d65` | new (future: lab concept) | missing | A: Frost creeps in, the hourglass frosts over | future |
| darkness-light | `dark-dark-enter` | variants | basic | A: Torches gutter out / B: A black curtain drops / C: A candle is snuffed, the dark floods out / D: Now in the game (before this pass): the veil is just there | fxHook('matchUI') once per fight with rules.dark (look A; FX.B.darkLook picks B/C) |
| darkness-light | `dark-dark-miss` | new | basic | A: A faint whiff into grey and a "?" / B: Now in the game (before this pass): the same "🌙 Miss!" at every level | onEvent: blindMiss {night} on a dark field (level from rules.dark) |
| darkness-light | `dark-pitch-enter` | variants | basic | A: Torches gutter out / B: A black curtain drops / C: A candle is snuffed, the dark floods out / D: Now in the game (before this pass): the veil is just there | fxHook('matchUI') once per fight with rules.dark (look A; FX.B.darkLook picks B/C) |
| darkness-light | `dark-pitch-miss` | new | basic | A: The swing is swallowed by an inky cloud / B: Now in the game (before this pass): the same "🌙 Miss!" at every level | onEvent: blindMiss {night} on a dark field (level from rules.dark) |
| darkness-light | `dark-absolute-enter` | variants | basic | A: Torches gutter out / B: A black curtain drops / C: A candle is snuffed, the dark floods out / D: Now in the game (before this pass): the veil is just there | fxHook('matchUI') once per fight with rules.dark (look A; FX.B.darkLook picks B/C) |
| darkness-light | `dark-absolute-miss` | new | basic | A: Black but for its eyes; the swing vanishes into a void / B: Now in the game (before this pass): the same "🌙 Miss!" at every level | onEvent: blindMiss {night} on a dark field (level from rules.dark) |
| darkness-light | `dark-leave` | new | missing | A: The dark lifts as warm light spills in | fxHook('matchUI') when the fight ends in the dark |
| darkness-light | `dark-unit-blind` | variants | missing | A: Dimmed art and a closed-eye badge / B: A blindfold across the art / C: Fog swirling over the art | fxHook('boardRendered'): FX.B.sightSync marks every unit after each render (look A) |
| darkness-light | `dark-sunshy-blind` | new | missing | A: Sun glare sweeps the art, a squinting badge | fxHook('boardRendered') + phase: Sun-shy units by day |
| darkness-light | `dark-nightblind` | new | missing | A: A moonlit cloud over the eyes, a cloudy-eye badge | fxHook('boardRendered') + phase: Night-blind units at night (no Lantern) |
| darkness-light | `dark-keen-sense` | new | missing | A: Whisker ripples as it smells out the target | onEvent: hit by a Keen Sense unit in the dark (once a round) |
| darkness-light | `dark-lantern-lit` | variants | good | A: Lantern flicker and glow (live look) / B: Light radius: a warm pool round the carrier | B: fxHook('boardRendered') (sightSync) in dark fights |
| darkness-light | `dark-lantern-out` | new | missing | A: The lantern gutters, smoke rises, the dark closes in | onEvent: death of a Lantern unit in the dark or at night |
| darkness-light | `dark-lantern-save` | new | missing | A: An amber mote leads the swing | onEvent: hit by a unit on a Lantern-lit side in Darkness / Pitch Black (once a round) |
| darkness-light | `dark-darksight-play` | done-existing | good | A: Eyes open, foes marked (live look) | existing game code (renderVfxForEvent / eighthPassVfx / CSS) |
| darkness-light | `dark-darksight-idle` | new | missing | A: Two glowing eyes that blink now and then | fxHook('boardRendered'): Darksight units on a dark board |
| darkness-light | `dark-cave-lamp` | done-existing | good | A: The lamp follows the pointer (live look; swept here) | existing game code (renderVfxForEvent / eighthPassVfx / CSS) |
| darkness-light | `dark-night-veil-in` | done-existing | good | A: Night slides over the board (live look) | existing game code (renderVfxForEvent / eighthPassVfx / CSS) |
| darkness-light | `dark-night-veil-out` | done-existing | good | A: Night lifts (live look) | existing game code (renderVfxForEvent / eighthPassVfx / CSS) |
| darkness-light | `dark-shade-night` | new (future: lab concept) | missing | A: The blow passes through a dark double | future (also wired: onEvent hit on a Shade unit at night or in the dark, non-magic) |
| darkness-light | `dark-shadow-night` | new (future: lab concept) | basic | A: Breaks into smoke and re-forms / B: Now in the game (before this pass): the generic dodge hop | future (also wired: onEvent evaded {reason:'shadow'}) |
| darkness-light | `dark-beware` | new | missing | A: Red eyes rise from the Removal Zone | onEvent: beware {darkness} |
| darkness-light | `dark-inherent` | new | basic | A: Ember motes swirl into a dark star / B: Now in the game (before this pass): the resource float | onEvent: devilry |
| darkness-light | `dark-devilry-aura` | done-existing | good | A: Devilry card aura (live look) | existing game code (renderVfxForEvent / eighthPassVfx / CSS) |
| darkness-light | `dark-bioluminescent` | new (future: lab concept) | missing | A: Teal motes glow, an anglerfish lure bobs | future |
| darkness-light | `dark-pitchblack-fish` | new (future: lab concept) | missing | A: A pale fish lunges out of the black | future |
| darkness-light | `dark-eclipse` | new (future: lab concept) | missing | A: A disc slides over the sun, corona, stars | future |
| field | `fld-set` | variants | basic | A: Frigid: frost crystals spread from the edges / B: Spring Rain: a rain sheet sweeps over / C: Thick Fog: banks roll in from both sides / D: Scorching: heat rises, the sun flares / E: Full Moon: silver light pours down / F: Now in the game (before this pass): a toast and the tile landing | onEvent: fieldSet {field} (then the lasting layer for Fog / Moon) |
| field | `fld-end` | variants | missing | A: Frigid melts away / B: The rain clears, light breaks through / C: The fog lifts / D: The heat cools / E: The moon sets | onEvent: fieldEnd {field} |
| field | `fld-base-returns` | new | missing | A: The map's own field card flips back in with a leaf burst | onEvent: fieldEnd {back} |
| field | `fld-frigid-tick` | done-existing | good | A: Cold wave, ice pulse, chill (live look) | existing game code (renderVfxForEvent / eighthPassVfx / CSS) |
| field | `fld-frigid-weak` | new | basic | A: Icicles drop onto it and crack / B: Now in the game (before this pass): the float and the same chill | onEvent: fieldTick frozen {dmg} |
| field | `fld-frost-resist` | new | missing | A: The cold splits around it; a warm outline | onEvent: the first fieldTick frozen of a round, on enemy units of the rules.frostResist types |
| field | `fld-scorching-tick` | done-existing | good | A: Heat haze scorch (live look) | existing game code (renderVfxForEvent / eighthPassVfx / CSS) |
| field | `fld-rain-tick` | new | basic | A: Drizzle crosses the felt, a drop heals each unit / B: Now in the game (before this pass): a float per unit | onEvent: fieldTick rain (once a round) |
| field | `fld-fog-active` | new | basic | A: Low fog banks roll over the rows / B: Now in the game (before this pass): the faint haze overlay | fxHook('matchUI') + onEvent fieldSet / fieldEnd: the layer lasts while Thick Fog is up |
| field | `fld-moon-active` | new | basic | A: Moonlight from above and twinkling stars / B: Now in the game (before this pass): the moon overlay | fxHook('matchUI') + onEvent fieldSet / fieldEnd: the layer lasts while the Full Moon is up |
| field | `fld-field-tile-looks` | done-existing | good | A: The five field tiles (live CSS) | existing game code (renderVfxForEvent / eighthPassVfx / CSS) |
| field | `fld-env-cards` | done-existing | good | A: The environment cards fan up (live look) | existing game code (renderVfxForEvent / eighthPassVfx / CSS) |
| field | `fld-env-reveal` | new | basic | A: The "?" card flips over with a leaf burst | fxHook('fieldReveal') from noteFieldEvent when a "?" row is learned |
| field | `fld-misty` | done-existing | good | A: The fog tint drifts (live CSS) | existing game code (renderVfxForEvent / eighthPassVfx / CSS) |
| field | `fld-terrain-banner` | new | basic | A: A shine sweeps it, the title pops, embers fly / B: Now in the game (before this pass): the banner alone | fxHook('terrainBanner') from maybeTerrainIntro |
| field | `fld-lava-tide` | done-existing | good | A: Lava geyser in the column (live look) | existing game code (renderVfxForEvent / eighthPassVfx / CSS) |
| field | `fld-eruption` | done-existing | good | A: Rumble, lit from below, geyser (live look) | existing game code (renderVfxForEvent / eighthPassVfx / CSS) |
| field | `fld-scorched` | done-existing | good | A: Scorch from the ground (live look) | existing game code (renderVfxForEvent / eighthPassVfx / CSS) |
| field | `fld-comet-rain` | done-existing | good | A: The sky glows ember-red (live CSS) | existing game code (renderVfxForEvent / eighthPassVfx / CSS) |
| field | `fld-comet-strike` | done-existing | good | A: A comet falls onto a card (live CSS) | existing game code (renderVfxForEvent / eighthPassVfx / CSS) |
| field | `fld-eruption-reset` | new | basic | A: The plume sinks, ash settles, the rumble fades / B: Now in the game (before this pass): a toast | onEvent: fieldTick eruptionReset |
| field | `fld-volcanic-ambient` | done-existing | good | A: Lava breathing at the board's foot (live CSS) | existing game code (renderVfxForEvent / eighthPassVfx / CSS) |
| field | `fld-tide-spout` | new | basic | A: A water column bursts up the whole board / B: Now in the game (before this pass): a splash and the Flow wave | onEvent: fieldTick tideSpout, drawn at the first washed card's column |
| field | `fld-tide-spout-wash` | done-existing | good | A: Pushed back and soaked (live look) | existing game code (renderVfxForEvent / eighthPassVfx / CSS) |
| field | `fld-boss-surge` | done-existing | good | A: The boss surges (live CSS) | existing game code (renderVfxForEvent / eighthPassVfx / CSS) |
| field | `fld-deep-mines` | new | basic | A: A pickaxe strikes their castle, ore pops out / B: Now in the game (before this pass): the resource float | onEvent: roundStart (round 2+) with rules.enemyOre |
| field | `fld-first-blood-rule` | new | basic | A: A red splash and a "First Blood" stamp / B: Now in the game (before this pass): a float | onEvent: statusFx firstBlood |
| field | `fld-lumber-every` | new | basic | A: A log rolls out of the castle into the Lumber pill / B: Now in the game (before this pass): a bing and a float | onEvent: lumber {rule:true} |
| field | `fld-forecast` | new | basic | A: The chips slide in, the weather icon wobbles / B: Now in the game (before this pass): static | fxHook('boardRendered') when the forecast pill's text changes |
| field | `fld-arena-ruleset` | new | basic | A: A shine sweeps the pill, a wax seal stamps | fxHook('matchUI') once at the start of an Arena fight |
| field | `fld-wet-raindrops` | done-existing | good | A: Raindrops run down the cards (live CSS, High effects) | existing game code (renderVfxForEvent / eighthPassVfx / CSS) |
| field | `fld-water-ripple` | done-existing | good | A: A ripple ring where a card lands (live shader) | existing game code (renderVfxForEvent / eighthPassVfx / CSS) |
| field | `fld-felt-material` | done-existing | good | A: Wet, ash, frost and sand floors (live shader) | existing game code (renderVfxForEvent / eighthPassVfx / CSS) |
| field | `fld-biome-puff` | done-existing | good | A: Leaves, spray, ash, snow kicked up (live look) | existing game code (renderVfxForEvent / eighthPassVfx / CSS) |
| field | `fld-future-monsoon` | new (future: lab concept) | missing | A: Grey sheets of rain, puddles spread | future |
| field | `fld-future-wildfire` | new (future: lab concept) | missing | A: A wall of flame crosses the board | future |
| field | `fld-future-migration` | new (future: lab concept) | missing | A: A herd crosses the middle in a dust cloud | future |
| field | `fld-future-fogbanks` | new (future: lab concept) | missing | A: White columns rise between the lanes | future |
| field | `fld-future-pollen` | new (future: lab concept) | missing | A: Golden motes drift on a warm tint | future |
| field | `fld-future-permafrost` | new (future: lab concept) | missing | A: The ice cracks and drips | future |
| field | `fld-future-volcanicwinter` | new (future: lab concept) | missing | A: Ash snow under a dim orange sky | future |
| field | `fld-future-floodplains` | new (future: lab concept) | missing | A: Water rises, drains, the ground cracks | future |
| field | `fld-future-abyssal-pressure` | new (future: lab concept) | missing | A: A crushing vignette squeezes bubbles out | future |
| field | `fld-future-hurricane` | new (future: lab concept) | missing | A: A spiral wind tears across | future |
| weather-time | `wt-day-breaks` | new | basic | A: A golden wash sweeps in from the east / B: Now in the game (before this pass): toast and the sky tone | onEvent: phase {phase:'day'} |
| weather-time | `wt-dawn-draw` | new | basic | A: Rosy light rises, birds take off / B: Now in the game (before this pass): the rosy tone only | onEvent: dawn |
| weather-time | `wt-dusk` | new | basic | A: The sun sinks, long shadows stretch / B: Now in the game (before this pass): the amber tone only | fxHook('matchUI'): the sky tone turns to dusk |
| weather-time | `wt-twilight` | new | broken | A: Sun and moon cross overhead, stars twinkle / B: Now in the game (before this pass) (broken): announced as "Day breaks" | onEvent: phase {phase:'twilight'}; the toast now says Twilight (arena_app.js) |
| weather-time | `wt-realtime-phase` | variants | basic | A: Clock spins and flips to the moon / B: Clock spins and flips to the sun | onEvent: phase {realtime:true} |
| weather-time | `wt-moon-phase` | variants | basic | A: A moon disc rises at the top of the felt / B: A big moon with its name / C: The eight phases in an arc, tonight's swells / D: Now in the game (before this pass): a toast | onEvent: moon {phase} (look A) |
| weather-time | `wt-tide-flow` | done-existing | good | A: The wave rolls in, Swimmers splash (live look) | existing game code (renderVfxForEvent / eighthPassVfx / CSS) |
| weather-time | `wt-tide-ebb` | new | basic | A: The water drains away, leaving glints and shells / B: Now in the game (before this pass): the ebb wave | onEvent: tide {tide:'ebb'} |
| weather-time | `wt-tide-high` | new | basic | A: A double crest past the middle, spray over the top row / B: Now in the game (before this pass): the Flow wave | onEvent: tide {tide:'high'} |
| weather-time | `wt-perma-tide` | new | basic | A: A river current runs along the tide line / B: Now in the game (before this pass): the tide line only | fxHook('matchUI') with rules.permaTide (lasts the fight) |
| weather-time | `wt-moonpull` | new | basic | A: The Moon Jelly glows, the water rises toward it / B: Now in the game (before this pass): the Flow wave | onEvent: tide {moonpull:true} |
| weather-time | `wt-wind-gust` | variants | basic | A: Leaves and feathers streak up from your side / B: The same, blowing down from theirs / C: Now in the game (before this pass): the steady drift | onEvent: wind {windy:true} |
| weather-time | `wt-wind-calm` | new | missing | A: Leaves drift down and settle | onEvent: wind {windy:false} |
| weather-time | `wt-wind-swap` | new | missing | A: A swirl turns about, then the new gust | onEvent: wind from the other side than the last gust |
| weather-time | `wt-tailwind` | done-existing | good | A: A gust lifts the Flyer (live look) | existing game code (renderVfxForEvent / eighthPassVfx / CSS) |
| weather-time | `wt-headwind` | new | missing | A: A ×2 rune echo is blown off the card | onEvent: triggerFired by a Flyer on the Headwind side |
| weather-time | `wt-swimmer-flow` | done-existing | good | A: A splash (live look) | existing game code (renderVfxForEvent / eighthPassVfx / CSS) |
| weather-time | `wt-battle-rain` | done-existing | good | A: Shader rain (live look; CSS rain where WebGL is off) | existing game code (renderVfxForEvent / eighthPassVfx / CSS) |
| weather-time | `wt-lightning-strike` | done-existing | good | A: A bolt strikes open ground (live look) | existing game code (renderVfxForEvent / eighthPassVfx / CSS) |
| weather-time | `wt-world-rain` | new | good | A: Rain over the map (stand-in) |  |
| weather-time | `wt-rain-start-stop` | variants | missing | A: Rain starts: first drops, then the downpour / B: Rain stops: it thins, the last drops fall | fxHook('mapRain') from mountMapShader when the rain state changed since this map was last drawn |
| weather-time | `wt-live-clock` | new | good | A: Dawn, day, dusk, night tints (stand-in) |  |
| weather-time | `wt-seasons` | done-existing | good | A: Autumn, winter, spring, summer vignettes (live CSS) | existing game code (renderVfxForEvent / eighthPassVfx / CSS) |
| weather-time | `wt-sudden-death` | done-existing | good | A: The red sky and the banner (live look) | existing game code (renderVfxForEvent / eighthPassVfx / CSS) |
| weather-time | `wt-first-field-flash` | done-existing | good | A: Red wash and autumn leaves on the row (live look) | existing game code (renderVfxForEvent / eighthPassVfx / CSS) |
| weather-time | `wt-initiative-coin` | new | basic | A: A glint trail follows the roll; it lands with a clink of sparks / B: Now in the game (before this pass): the plain roll | fxHook('initCoin') from syncInitiativeCoin when the coin rolls sides |
| weather-time | `wt-syzygy` | new (future: lab concept) | missing | A: Sun, moon and earth line up into one blazing ring | future |
| weather-time | `wt-eclipse-phase` | new (future: lab concept) | missing | A: The phase pill eclipses, the board tints red-violet | future |

## Notes

- Darkness enter (three levels) has three looks: A torches gutter out (in the game), B a black curtain drops, C a candle is
  snuffed. `FX.B.darkLook = 'B'|'C'` switches the game to another.
- Units that can't see (dark-unit-blind): A shadowed art with a big shut eye that strains open now and then (in the game),
  B a blindfold, C fog over the art; `FX.B.sightLook` switches. The same look marks Sun-shy (glare), Night-blind (moon cloud)
  and the Blind status (inked eye) while they last.
- Lab stand-ins: `wt-world-rain` and `wt-live-clock` show the batch's CSS rain / a tint cycle instead of the WebGL / Home
  atmosphere layers; `fld-water-ripple` and `fld-felt-material` need WebGL in the lab.
- Wear-offs and lost turns are batch C's.

