# FX batch A status — combat attacks and combat skills (2026-10-15)

Batch A owns the 174 inventory entries in the `combat-attack` (90) and `combat-skill` (84) areas of
`docs/effects-inventory-2026-10-15.json`. Effect code: `bramblewood-fx-a.js` (`window.FX.A`). Lab demos:
`tools/effects-lab/manifest/a.js` (plus the worked examples in `manifest/_existing.js`). Contract: `docs/effects-lab-contract.md`.

## Summary

| | Count |
|---|---|
| Entries in the batch | 174 |
| Registered in the lab with a working demo (read from `FXLAB.registry` at runtime) | 174 |
| Lab variants in total | 279 |
| **new**: was basic or missing, now has its own look and a game hook in `FX.A.onEvent` | 82 |
| **done-existing**: the existing look was already good; the lab demos the game's own function | 92 |
| Entries with 2–4 real alternatives to choose from (A/B/C/D) | 25 |
| Left undone | 0 |

Checks (2026-10-15): every variant of every batch A entry played in the built lab at 390 px wide, 3× speed: 0 console errors,
nothing left on `<body>` afterwards. A synthetic run of `FX.A.onEvent` over ~95 battle events (every case it handles) on the lab
board: 0 errors, every effect called. Frames captured at 0.25× for ~45 effects and looked at; fixes below.

## How the game uses it

- **Battle events** go through `FX.A.onEvent(ev, env)` (called by `fxBatchVfx`), so there are no new lines in `arena_app.js`.
  Everything is gated on Effects Medium and up (heavy looks on High), skipped under reduced motion, fired and forgotten (never awaited),
  and repeating looks are limited to once per unit per round with `env.once`. Readable "why" cues (½ Resist, ×2 Weak, Immune,
  Player Stun, Exile, Shield soak or break, Desecrate) play from Low up.
- Where a new look replaces an old one the game still draws (the emoji missile, the lava-shaped wave geyser, the CSS dynamite blast,
  the 🪵 swipe glyph), the old node is hidden as it appears (`hideNext`, a short MutationObserver) instead of editing `arena_app.js`.
  The old looks stay in the lab as the "Old:" variant.
- In the game, the **A** variant plays wherever there is a choice; B–D are proposals to pick from in the lab (the exception:
  `atk-heavy-hitstop` B, the shockwave, is wired on top of the existing hit-stop on High).

### Damage types (every type has a colour now)

| Type | Battle light | Number colour | Hit-burst glyph | Impact look (Medium+) | Missile |
|---|---|---|---|---|---|
| physical | existing | existing (white) | 💥 | lab proposal (dust, splinters) | stone |
| heat | existing | existing | 🔥 | lab proposal (embers) | ember |
| cold | existing | existing | ❄ | lab proposal (frost glints) | SkillFX.frostBolt |
| acid | existing | **new** yellow-green (was poison green) | 🧪 | **fizz, pits, bubbles** | SkillFX.boltGlob acid |
| poison | existing | existing | ☠ | **toxic puff, drips** | SkillFX.dart |
| decay | existing | **new** violet (was poison green) | 🦠 | **mould, spores** | spore ball |
| magic | **new** violet | **new** violet-gold, 🪄 | **new** 🪄 | **rune circle** (B prism, C glyph motes) | star |
| water | **new** blue | **new** blue, 💧 | **new** 💧 | **splash crown, drops, ripple** (B curl, C puddle) | droplet |
| true | **new** white | **new** white, ✧ | **new** ✧ | **white crack** (B negative flash, C void ring) | white streak |

`LIGHT_COLORS`, `DMG_ICON` and `ELEMENTAL_BURST_GLYPH` (arena_app.js) are extended in place once from `FX.A` (`ensureDmgTypes`,
`ensureLights`); the number colours are CSS in the module's own style block.

### SkillFX functions that were built and never called, now used

| Function | Where it plays now |
|---|---|
| `SkillFX.volley` | Volley: the lead arrows of the first Volley shot of a round, under the arrow rain (`atk-volley`, High) |
| `SkillFX.rally` | Rally event (`sk-rally` A) |
| `SkillFX.dynamite` | Dynamite event, replacing the CSS blast (`sk-dynamite` A) |
| `SkillFX.shockwave` | Charge fires (`atk-charge-fire`); heavy blows of 8+ (`atk-heavy-hitstop` B, High) |
| `SkillFX.heal` | Heal from another card (not Regen or Bloom), once a round per unit (`sk-heal-generic`) |
| `SkillFX.pierce` | pierceHQ: the shot carries on through the unit into the castle (`atk-pierce-hq` B) |
| `SkillFX.dart` | Poison ranged missile (`atk-ranged-projectile` D, `atk-dmgtype-poison`) |
| `SkillFX.frostBolt` | Cold ranged missile (`atk-ranged-projectile` C) |
| `SkillFX.feathers` | Flying evade (`atk-evade-flying`) |
| `SkillFX.smokePuff` | Smoke evade (`atk-evade-smoke`) |
| `SkillFX.unlockSparkle`, `skyDrop`, `castleCrumble` | not batch A (tr-locked is D; sum-skyfall, castle-crumble are C) |

The new bolts (fire, acid, poison, ice, shock), Ice Arrow, Twin Shot, Volley, the Fork / Trident / Pitchfork prongs (and the
prong on the castle), Octolash and Chilli all have lab demos; Ice Arrow, Volley and the castle prong got new in-game looks.

## Fixes made while resuming (2026-10-15)

- **Lab: no damage numbers showed in any demo.** The lab's synced `floatText` reads the game's `floatDetachDepth`, which
  `sync_fx_src.py` doesn't copy, so every `ctx.float` threw (silently). `manifest/a.js` now defines `window.floatDetachDepth = 0`
  before anything else, which fixes the numbers for every batch. The proper fix belongs in `sync_fx_src.py` (framework).
- Damage numbers for magic / water / true (and acid / decay) get their own colour and icon (above); the lab's typed-hit demos show them.
- Scorching "spared" cue (`sk-dry-spared`) never fired: the engine's field id is `heatwave`, the hook matched `heat`. It now also uses
  the same Resist test as the engine (`hitFactor`).
- Pack (`sk-pack`): the engine no longer emits `statusFx pack` (Pack chains are live since 2026-10-14). A Pack / Pack Leader unit whose
  chain grows (its `phaseGrow` with `packChain > 1`) now howls, and the paw prints run only to its chain mates.
- New `FX.A.heavyShock` (atk-heavy-hitstop B) and its hook: hits of 8+ on High, once a round per target.
- Player Stun bell was clipped above the top edge (the enemy castle sits on it); it now hangs inside the window and is centred on the castle.
- Missiles were hard to see on the felt at phone width: bigger, outlined, fatter trail. Water A got a splash crown and bigger drops.
- Reload dial and the Prayer exile wisp resolved a little before their last particle faded; their durations match now.
- Five entries demoed in `_existing.js` had no in-game hook note (fire arrow, backstab, boomerang throw, shield up, Shield Call); added.

## Left / notes for the merge

- Nothing in the batch is left unbuilt. Proposals to choose from in the lab: melee lunge B–D (faction lunges), physical / heat / cold
  impact B, Bloom B–D (biomes), Heal C/D, Rally B, damage-type B/C, evade illusory / shadow B/C.
  (Crit B/C are not proposals: they are wired by the attacker's faction.) When one is picked, swap the call in `FX.A.onEvent` (or `animateAttacker` for lunges).
- `sync_fx_src.py` should copy `floatDetachDepth` (and `afterSettle` / `fxHostAt` if upkeep floats are ever demoed); then the shim in
  `manifest/a.js` can go.
- `tests/fx-a-resist.js` (in `tests/run-all.sh`) keeps `FX.A.hitFactor` (Resist / Weak / Immune) in step with the engine.

## Every entry

Status: **new** = was basic or missing; a new look with a game hook in `FX.A.onEvent`. **done-existing** = the existing look was
good; the lab plays the game's own function (or replays its in-file look). **+ variants** = 2+ real alternatives in the lab.
Quality is the inventory's rating before this batch.

| id | status | quality before | lab variants | in-game hook |
|---|---|---|---|---|
| `atk-melee-lunge` | done-existing + variants | good | **A** Now: lean back, lunge, settle; **B** Otters: a straight drilled jab, bronze streak; **C** Hummingbirds: dart in on an arc, jewel trail; **D** Beasts: crouch and pounce low, dust kick | animateAttacker (A is the live lunge; B–D are faction takes to choose from) |
| `atk-castle-lunge` | done-existing | good | **A** Now: a straight swing at the castle | animateAttacker(…, {toCastle:true}) |
| `atk-impact` | done-existing + variants | good | **A** Now: squash, typed number; **B** Resisted ½: a ward ring soaks it, "½ Resist"; **C** Weak ×2: red starburst and crack, "×2 Weak"; **D** Immune: it bounces off a bubble | flashDmg + impactSquash (A); B–D: onEvent hit, from the cards' Resist / Weakness / Immune |
| `atk-heavy-hitstop` | done-existing + new B (wired, High) | good | **A** Now: the blow freezes a beat, then lands; **B** Freeze, then a shockwave ring shoves the neighbours (SkillFX.shockwave) | hitStop(70) + battleLightAt big (A); B: onEvent hit for 8+ (High effects): SkillFX.shockwave rolls out and shoves the neighbours |
| `atk-big-blow-shake` | done-existing | good | **A** Now: the battlefield jitters (scaled to damage) | bigBlowShake → battlefieldShake |
| `atk-crit` | done-existing + variants | good | **A** Now: gold starburst number; **B** Otter crit: bronze and teal sparks; **C** Hummingbird crit: jewel prism sparks | flashDmg crit (A); B/C: onEvent crit hit by an Otter / Hummingbird (also ants, bees, volcanic) |
| `atk-armor-block-full` | done-existing | good | **A** Now: steel plate, sparks, 🛡️ | SkillFX.armorBlock + clang |
| `atk-armor-block-partial` | done-existing | good | **A** Now: partial soak | SkillFX.armorBlock partial |
| `atk-dmgtype-physical` | done-existing + variants | good | **A** Now: warm light, ➶ glyph; **B** Dust and splinters on impact | battleLightAt + dmgGlyph (A); B is a proposal |
| `atk-dmgtype-heat` | done-existing + variants | good | **A** Now: orange light, 🔥 glyph; **B** Embers fly up on impact | battleLightAt + dmgGlyph (A); B is a proposal |
| `atk-dmgtype-cold` | done-existing + variants | good | **A** Now: blue light, ❄ glyph; **B** Frost glints and breath vapour | battleLightAt + dmgGlyph (A); B is a proposal |
| `atk-dmgtype-acid` | new | basic | **A** It fizzes: bubbles and smoking pit marks; **B** Old: acid light, 🧪 glyph | onEvent: hit with dmgType acid (Medium+) |
| `atk-dmgtype-poison` | new | basic | **A** Toxic green puff, dripping; **B** Old: green light, ☠ glyph | onEvent: hit with dmgType poison (Medium+) |
| `atk-dmgtype-decay` | new | basic | **A** Violet mould blooms, spores drift; **B** Old: violet light, 🦠 glyph | onEvent: hit with dmgType decay (Medium+) |
| `atk-dmgtype-magic` | new + variants | missing | **A** Rune circle spins down and bursts; **B** Prism starburst; **C** Glyph motes orbit and collapse | onEvent: hit with dmgType magic (A); the battle light gets a violet magic colour |
| `atk-dmgtype-water` | new + variants | missing | **A** Spray and a caustic ripple; **B** A wave curls over and slaps it; **C** Drop burst, puddle ripple below | onEvent: hit with dmgType water (A); the battle light gets a water colour |
| `atk-dmgtype-true` | new + variants | missing | **A** A white crack across the card; **B** Negative flash, hairline slash; **C** A white void ring folds in, then out | onEvent: hit with dmgType true (A); white battle light |
| `atk-ranged-projectile` | new + variants | basic | **A** Stone (physical); **B** Ember (heat); **C** Ice shard (cold, SkillFX.frostBolt); **D** Dart (poison, SkillFX.dart); **E** Spore ball (decay) and star (magic); **F** Droplet (water) and white streak (true); **G** Old: the emoji glyph sliding across | onEvent: ranged hit with no arrow or bolt: a real missile per type (the emoji glyph is hidden) |
| `atk-arrow` | done-existing | good | **A** Bow shot (live) | renderVfxForEvent → ranged hit (matchState.pendingArrow) |
| `atk-fire-arrow` | done-existing | good | **A** Fire Arrow (live) | renderVfxForEvent → ranged hit with matchState.pendingArrow {fire}: SkillFX.bowShot({fire}) |
| `atk-ice-arrow` | new | basic | **A** Frost-blue arrow, snowflake trail, rime burst; **B** Old: a plain arrow, then the ice block | onEvent: arrow {ice} + its hit: frost tint, snowflake trail, rime burst |
| `atk-twin-shot` | done-existing | good | **A** Now: two quick bow shots | two arrow events → SkillFX.bowShot ×2 |
| `atk-volley` | new + variants | basic | **A** One bow shot per arrow; **B** Dark cloud of arrows rains on the line | onEvent: first Volley arrow of a round: SkillFX.volley lead arrows + a rain of arrows over the whole line (High effects) |
| `atk-snipe` | done-existing | good | **A** Now: a long, flat bow shot | arrow {snipe} → SkillFX.bowShot |
| `atk-bolt-fire` | done-existing | good | **A** Now: orange glob, ember splat | ninthPassVfx → SkillFX.boltGlob |
| `atk-bolt-acid` | done-existing | good | **A** Now: acid glob, drip splat | ninthPassVfx → SkillFX.boltGlob |
| `atk-bolt-poison` | done-existing | good | **A** Now: green glob | ninthPassVfx → SkillFX.boltGlob |
| `atk-bolt-ice` | done-existing | good | **A** Now: ice-shard splat | ninthPassVfx → SkillFX.boltGlob |
| `atk-bolt-shock` | done-existing | good | **A** Now: spark splat | ninthPassVfx → SkillFX.boltGlob |
| `atk-cleave` | done-existing | good | **A** Now: the blade sweeps the row | labSkillFx → SkillFX.cleave |
| `atk-sweep-whiff` | done-existing | good | **A** Now: a crescent cuts the empty air | sweepWhiff → .sweep-whiff |
| `atk-prong-fork` | done-existing | good | **A** Now: two steel tines | eighthPassVfx → SkillFX.forkProngs |
| `atk-prong-trident` | done-existing | good | **A** Now: three tines | eighthPassVfx → SkillFX.forkProngs |
| `atk-prong-pitchfork` | done-existing | good | **A** Now: four tines | eighthPassVfx → SkillFX.forkProngs |
| `atk-prong-castle` | new | basic | **A** The tines thrust into the wall, stone chips fly; **B** Old: the plain castle hit | onEvent: hitHQ {fork} |
| `atk-octolash` | done-existing | good | **A** Now: purple tentacles lash | SkillFX.forkProngs (octolash) + float |
| `atk-crab-claw` | new | basic | **A** A coral claw snaps shut on the side; **B** Old: .crab-pinch slide + 🦞 float | onEvent: crabClaw {dir} |
| `atk-backstab` | done-existing | good | **A** Dagger flash and slash | renderVfxForEvent → hit {backstab}: SkillFX.backstab (dagger flash from the side it came from) |
| `atk-ambush` | new | basic | **A** Shadow, glinting eyes, it springs out of smoke; **B** Old: "🗡 Ambush!" float | onEvent: hit/hitHQ with ev.ambush |
| `atk-quick` | done-existing | good | **A** Now: speed lines, afterimages | labSkillFx → SkillFX.quickStrike |
| `atk-swift` | new | basic | **A** Hummingbird blur: jewel afterimages; **B** Old: "💨 Swift!" float | onEvent: hit by a Swift unit (once a round) |
| `atk-frenzy` | done-existing | good | **A** Now: rage flare, "🔥 Frenzy!" | SkillFX.rageFlare + float |
| `atk-swarm` | done-existing | good | **A** Now: a buzzing cloud converges | labSkillFx → SkillFX.swarm |
| `atk-flying-swoop` | done-existing | good | **A** Now: an air-trail dive | eighthPassVfx → SkillFX.swoop |
| `atk-scared-lunge` | new | basic | **A** Sweat, a wobbling "!", it shrinks back, then swings; **B** Old: a wobbly lunge and 😨 | onEvent: hit whose target has Scare (once a round) |
| `atk-unitfx-claw` | done-existing | good | **A** Now: claw rake marks | UnitFX.hitMark(claw) |
| `atk-unitfx-bite` | done-existing | good | **A** Now: jaw crunch | UnitFX.hitMark(bite) |
| `atk-unitfx-sting` | done-existing | good | **A** Now: stinger dot | UnitFX.hitMark(sting) |
| `atk-unitfx-peck` | done-existing | good | **A** Now: beak dents | UnitFX.hitMark(peck) |
| `atk-unitfx-burn` | done-existing | good | **A** Now: scorch star | UnitFX.hitMark(burn) |
| `atk-unitfx-firebreath` | done-existing | good | **A** Now: fire breath | UnitFX.attackFx(fireBreath) |
| `atk-counter-parry` | done-existing | good | **A** Now: crossed blades, a ping | SkillFX.parry |
| `atk-guardian-redirect` | new | basic | **A** A bronze shield slides into the line, the blow bends to it; **B** Old: a 🛡 flash on the guardian | onEvent: hit with ev.guardianRedirect |
| `atk-thorns` | done-existing | good | **A** Now: brambles sting the attacker | labSkillFx → SkillFX.thorns |
| `atk-reflect` | done-existing | good | **A** Now: a mirror flash, "🪞 -N" | eighthPassVfx → SkillFX.mirrorFlash |
| `atk-recoil` | new | basic | **A** A red 💢 jolt with impact lines; **B** Old: "💢 −N" and a recoil | onEvent: statusFx recoil |
| `atk-spite` | new | missing | **A** A thorny vine whips from the dying unit to its killer | onEvent: statusFx spite (victim lashes its killer) |
| `atk-evade-evasive` | done-existing | good | **A** Now: blink sidestep, leaves | flashDodge + labSkillFx → SkillFX.evasiveDodge |
| `atk-evade-swift` | done-existing | good | **A** Now: shared blink sidestep, 💨 | flashDodge + SkillFX.evasiveDodge |
| `atk-evade-flying` | new | basic | **A** Lifts out of reach, feathers drift (SkillFX.feathers); **B** Old: the hop and "Miss" | onEvent: evaded {reason:flying} |
| `atk-evade-fog` | new | basic | **A** Fog curls round the blade and swallows it; **B** Old: the hop and "Miss" | onEvent: evaded {reason:fog} |
| `atk-evade-illusory` | new + variants | basic | **A** Mirror images split, the struck one pops; **B** Heat-shimmer wobble, rainbow edges; **C** The illusion shatters like glass; **D** Old: the hop and "Miss" | onEvent: evaded {reason:illusory} (A) |
| `atk-evade-shadow` | new + variants | basic | **A** The strike passes through dark smoke; **B** It sinks into its own shadow and rises; **C** Black silhouette, two blinking eyes; **D** Old: the hop and "Miss" | onEvent: evaded {reason:shadow} (A) |
| `atk-evade-smoke` | new | basic | **A** The cloud swallows the swing (SkillFX.smokePuff); **B** Old: the hop and "🌫️ Miss" | onEvent: evaded {reason:smoke} |
| `atk-blind-miss` | new + variants | basic | **A** Blindfold slides on, it swings at empty air; **B** At night; **C** Old: the lunge and "👁 Miss!" | onEvent: blindMiss (night: a moon) |
| `atk-confused-whiff` | new | basic | **A** A dud spark sputters out, ❓ spins; **B** Old: "❓ Fizzle" | onEvent: confusedWhiff |
| `atk-tipsy-swing` | new | basic | **A** Bubbles, "hic!", a sway; **B** Old: the lurch only | onEvent: tipsySwing {drift, miss} |
| `atk-boomerang-throw` | done-existing | good | **A** Out on a low curve, back on a high one | renderVfxForEvent → hit by a Boomerang / Bananarang / Anti-Air unit: SkillFX.boomerang |
| `atk-boomerang-castle` | done-existing | good | **A** Now: bounces off the castle and away | SkillFX.boomerangCastle |
| `atk-boomerang-return` | new | basic | **A** It swings back in from the edge of the field; **B** Old: the float only | onEvent: boomerangReturn (the next round) |
| `atk-boomerang-caught` | new | basic | **A** It slaps into the thrower's hand; **B** Old: "🪃 Caught!" | onEvent: boomerangCaught |
| `atk-boomerang-whiff` | new | basic | **A** It whooshes past through empty air; **B** Old: the whiff callout | onEvent: boomerangWhiff |
| `atk-boomerang-friendly` | new | basic | **A** Bonk: a star, a sweat drop, "Oops!"; **B** Old: a plain hit | onEvent: hit/hitHQ {boomerang, friendly} |
| `atk-king-slayer` | done-existing | good | **A** Now: the crown cracks in two | SkillFX.crownCrack + float |
| `atk-pierce-rend` | done-existing | good | **A** Now: the blade punches through Armor | eighthPassVfx → SkillFX.pierceThrough |
| `atk-pierce-hq` | done-existing + variants | good | **A** Now: pierce-through on the castle; **B** SkillFX.pierce: an arrow through the unit into the castle | SkillFX.pierceThrough on the castle (A); onEvent pierceHQ: SkillFX.pierce carries the shot on into the castle (B) |
| `atk-overwhelm-hq` | new | basic | **A** A dust cloud and hoof prints charge into the wall; **B** Old: a shake and "💥 -N" | onEvent: overwhelmHQ |
| `atk-siege` | new | basic | **A** A battering ram slams the castle; **B** Old: "🏰 Siege!" | onEvent: hitHQ with ev.siege |
| `atk-bulwark` | new | basic | **A** A stone rampart rises and the blow sparks off; **B** Old: "🛡 -N blocked" | onEvent: hitHQ with ev.bulwark > 0 |
| `atk-stealth-slip` | done-existing | good | **A** Now: melts into shadow and slips to the castle | eighthPassVfx → SkillFX.stealthSlip |
| `atk-fester` | new | basic | **A** Sickly boils swell and pop; **B** Old: "+N☠ Fester" | onEvent: hit with ev.festerBonus |
| `atk-rupture` | new | basic | **A** A red crack splits and blood sprays; **B** Old: "+N🩸 Rupture" | onEvent: hit with ev.ruptureBonus |
| `atk-quake-hit` | done-existing | good | **A** Now: each unit jolts in turn | .quake-jolt + flashDmg (0.1 s apart) |
| `atk-retribution` | new | basic | **A** A gold beam strikes from above, ⚖️; **B** Old: a plain projectile | onEvent: hit with ev.retribution (the glyph missile is hidden) |
| `atk-reload` | new + variants | basic | **A** A reload dial winds round after the shot; **B** Waiting to reload (skipped turn); **C** Old: "🔄 Reloading" | onEvent: hit by a Reload unit (full dial); skipTurn reload (part dial) |
| `atk-friction` | new | basic | **A** Grinding sparks and a gear between the two; **B** Old: shake and "⚙️ -N" | onEvent: friction {dmg} on an ally |
| `atk-pounce` | new | basic | **A** A leap trail out and back, dust on landing; **B** Old: crouch-and-spring + float | onEvent: pounce {amount} on play |
| `atk-swipe-lumber` | new | basic | **A** Logs hop out of the castle into the swiper's hands; **B** Old: one 🪵 glyph slides across | onEvent: swipeLumber (the old 🪵 glyph is hidden) |
| `atk-charge-fire` | new | basic | **A** The clock winds round and lets go as a shockwave; **B** Old: "⏲️ Charge!" | onEvent: charge {fired}: the clock winds, then SkillFX.shockwave |
| `atk-castle-bolt-shot` | new | basic | **A** The fort's ballista fires a bronze bolt; **B** Old: a plain projectile from the castle | onEvent: statusFx castleBolt, then its hit from the castle (the glyph is hidden) |
| `sk-trigger-fired` | done-existing | good | **A** Now: glyph ring and electric back glow | triggerFiredVfx (.trigger-rune + .trigger-aura) |
| `sk-earthquake` | done-existing | good | **A** Now: cracks run across, cards jolt | labSkillFx → SkillFX.earthquake |
| `sk-landslide` | new | basic | **A** Boulders tumble in from the top edge; **B** Old: same as Earthquake | onEvent: earthquake {landslide} (High effects) |
| `sk-tornado` | done-existing | good | **A** Now: a band sweeps, cards spin | boardSweepVfx(tornado) + spins |
| `sk-avalanche` | done-existing | good | **A** Now: a white band falls, frost rings | boardSweepVfx(avalanche) + frost |
| `sk-tsunami` | done-existing | good | **A** Now: a wave band, cards pushed back | boardSweepVfx(tsunami) + elastic push |
| `sk-wave` | new | basic | **A** A rolling crest sweeps over it; **B** Old: the water geyser | onEvent: wave {dir} (the water geyser is hidden) |
| `sk-dragon-lightning` | done-existing | good | **A** Now: red lightning chains | fifthPassVfx → red SkillFX.lightning |
| `sk-electricity` | done-existing | good | **A** Now: an arc jumps to the next unit | sixthPassVfx → SkillFX.lightning |
| `sk-lightning-passive` | new | missing | **A** A storm bolt strikes the card, sparks crawl over it | onEvent: statusFx lightning |
| `sk-fireball` | done-existing | good | **A** Now: a fireball and splash | sixthPassVfx → SkillFX.fireball |
| `sk-meteor` | done-existing | good | **A** Now: a meteor and its crater | sixthPassVfx → SkillFX.meteor + crater |
| `sk-meteor-burn` | new | basic | **A** A glowing crater with lava cracks and smoke; **B** Old: scorch + the crater class | onEvent: meteorBurn (once a round per crater) |
| `sk-psychic` | done-existing | good | **A** Now: violet rings of thought | sixthPassVfx → SkillFX.mindWave |
| `sk-smoke-bomb` | done-existing | good | **A** Now: a lit bomb lobbed, a grey cloud | sixthPassVfx → SkillFX.smokeBomb |
| `sk-banana-throw` | done-existing | good | **A** Now: a banana thrown | sixthPassVfx → SkillFX.bananaThrow |
| `sk-banana-eat` | done-existing | good | **A** Now: munch | sixthPassVfx → SkillFX.munch |
| `sk-durian` | new | basic | **A** Spikes burst out all round the card; **B** Old: munch + float | onEvent: durian {thorns} |
| `sk-chilli` | done-existing | good | **A** Now: red flush and steam | ninthPassVfx → SkillFX.chilliHeat |
| `sk-coffee` | done-existing | good | **A** Now: the clock spins fast | eighthPassVfx → SkillFX.clockTick |
| `sk-dynamite` | new | basic | **A** SkillFX.dynamite: a lit stick tossed up, fizzes, blows; **B** Old: the CSS blast and shake | onEvent: dynamite: SkillFX.dynamite (the CSS blast is hidden) |
| `sk-dynamite-fuse` | new + variants | basic | **A** The fuse fizzes sparks; **B** Last round: it throbs red | onEvent: fuse {left} |
| `sk-explode` | new | basic | **A** It swells, flashes faster, bursts green; **B** Old: a small shake and "💥 Boom!" | onEvent: explode |
| `sk-rocket` | new | basic | **A** A rocket launches with a smoke trail; **B** Old: "🚀 Rocket!" | onEvent: statusFx rocket |
| `sk-rally` | new + variants | basic | **A** SkillFX.rally: a banner pops, chevrons through the allies; **B** Otter standard: the bronze fish raised, teal pennant; **C** Old: .rally-pulse + float | onEvent: rally: SkillFX.rally (A) |
| `sk-inspired` | done-existing | good | **A** Now: an aura, "📯 +N⚔ next swing" | eighthPassVfx → SkillFX.espritAura |
| `sk-esprit` | done-existing | good | **A** Now: aura and "🤝" | eighthPassVfx → SkillFX.espritAura |
| `sk-grit` | done-existing | good | **A** Now: aura and grit | eighthPassVfx → SkillFX.espritAura |
| `sk-momentum` | new | basic | **A** Flame chevrons stream behind, dust kicks; **B** Old: "🔥 +N⚔" | onEvent: statusFx momentum (once a round) |
| `sk-berserk` | done-existing | good | **A** Now: rage flare, shake | eighthPassVfx → SkillFX.rageFlare |
| `sk-hive-mind` | done-existing | good | **A** Now: rage flare | rageFlare (retired 2026-10-15; still plays for old cards) |
| `sk-pack` | new | basic | **A** A howl rings out, paw prints run to the pack; **B** Old: "🐺 Pack!" | onEvent: statusFx phaseGrow of a Pack / Pack Leader unit whose chain grows (once a round; old replays: statusFx pack) |
| `sk-heal-generic` | new + variants | basic | **A** Now: the number and a chime; **B** Green rings and rising pluses; **C** Motes spiral in and knit it closed; **D** Swamp medicine: herbal steam and leaves | onEvent: heal from another card (not Regen or Bloom): SkillFX.heal (B), once a round per unit |
| `sk-regen` | done-existing | good | **A** Now: green motes knit it closed | labSkillFx → SkillFX.regen |
| `sk-bloom` | done-existing + variants | good | **A** Now: pollen drifts to the ally; **B** Algae bloom: teal bubbles; **C** Fungal bloom: spores and caps; **D** Coral bloom: coral branches | eighthPassVfx → SkillFX.bloomPollen (A); B–D are biome takes from the ideas doc |
| `sk-sap` | done-existing | good | **A** Now: life drains across | eighthPassVfx → SkillFX.lifeDrain |
| `sk-render` | done-existing | good | **A** Now: a curse drains its Attack | eighthPassVfx → SkillFX.curseDrain |
| `sk-gash` | done-existing | good | **A** Now: an opening cut that drips | eighthPassVfx → SkillFX.bleedDrip |
| `sk-revive` | done-existing | good | **A** Now: it rises again | eighthPassVfx → SkillFX.reviveRise |
| `sk-shield-up` | done-existing | good | **A** Shield dome | sixthPassVfx → statusFx unitShield: SkillFX.shieldUp |
| `sk-shield-soak` | new | basic | **A** The dome flares where the blow lands; **B** Old: "💠 -N" | onEvent: shieldSoak with shield left |
| `sk-shield-break` | new | basic | **A** The dome cracks and bursts into hex shards; **B** Old: "💠 Shield breaks" | onEvent: shieldSoak with 0 left |
| `sk-shell-up` | done-existing | good | **A** Now: a pale shell sweeps up the card | statusFx shellUp → .shell-sweep |
| `sk-shell-down` | new | missing | **A** The shell cracks and its halves fall away | onEvent: statusFx shellDown |
| `sk-shield-call` | done-existing | good | **A** Shield drops into the slot | renderVfxForEvent → spawn {cause:shieldCall}: SkillFX.shieldDrop |
| `sk-helmet` | done-existing | good | **A** Now: the blow glances off a helmet | labSkillFx → SkillFX.helmetDeflect |
| `sk-nullify` | new | basic | **A** A red seal stamps on, the card greys out; **B** Old: .nullify-flash | onEvent: statusFx nullify |
| `sk-cleanse` | done-existing | good | **A** Now: a rising band of light and motes | cleanseVfx |
| `sk-stanch` | done-existing | good | **A** Now: the same band, "🩹 -N 🩸" | cleanseVfx |
| `sk-buff-action` | done-existing | good | **A** Now: an aura and the stat pop | eighthPassVfx → SkillFX.espritAura + statChangeVfx |
| `sk-debuff-action` | done-existing | good | **A** Now: a curse drains it | eighthPassVfx → SkillFX.curseDrain |
| `sk-mind-control` | new | basic | **A** Puppet strings drop, tug it across, snap to your colour; **B** Old: the mind-wave only | onEvent: mindControl |
| `sk-swap` | new | basic | **A** Curved arrows cross, ghosts slide over; **B** Old: "🔀 Scurry!" floats | onEvent: swapPositions |
| `sk-converge` | new | basic | **A** A magnet pulls the line in: field lines, specks; **B** Old: "🧲 Converge!" | onEvent: converge |
| `sk-restless` | new | basic | **A** Footprints step to its new place; **B** Old: "👣" | onEvent: restless |
| `sk-stun-player` | new | missing | **A** A bell tolls, their side greys, chains rattle | onEvent: stunPlayer (Low effects and up) |
| `sk-exile-board` | new | missing | **A** A violet rift pulls it in; a candle echo stays | onEvent: statusFx exile (Low effects and up) |
| `sk-exile-zone` | new + variants | missing | **A** From the graveyard: a ghost card unravels into violet smoke; **B** A Prayer from the hand (gold motes too) | onEvent: exile {zone: hand \| graveyard} |
| `sk-remember` | new | basic | **A** A candle, rising smoke, the card condenses out of it; **B** Old: "🕯️ +N/+N" | onEvent: remember {uid} |
| `sk-spell-card` | new + variants | basic | **A** Hasten: the card flies from the hand, flips, motes to each target; **B** Sap (violet); **C** Old: a toast and floats | onEvent: spell {action, targets} |
| `sk-devour` | new | basic | **A** Jaws snap shut over the card, a gulp; **B** Old: the float only | onEvent: devour (at play) |
| `sk-equip` | new | missing | **A** The item flies on and locks with a clank | onEvent: equip (at play) |
| `sk-sacrifice` | new | basic | **A** A red sigil burns in, the offering sinks into it; **B** Old: .sac-chomp jaws | onEvent: sacrifice (at play) |
| `sk-fast-forward` | done-existing | good | **A** Now: a blur of afterimages, "⏩ ×N" | fastForward → .ff-blur |
| `sk-satiety` | new | missing | **A** A honey pot pops up, a warm contented glow | onEvent: statusFx satiety |
| `sk-shed` | new | basic | **A** A translucent skin peels off and drifts away; **B** Old: "🐍 +1/+1" | onEvent: statusFx shed {molt} |
| `sk-first-blood` | new | basic | **A** A red splash star, drops, a "1st" tag; **B** Old: "🩸 First blood +N" | onEvent: statusFx firstBlood |
| `sk-bludgeon` | new + variants | basic | **A** A hammer slams; the trait icon cracks in two; **B** Flying broken; **C** Old: "🔨 X broken" | onEvent: statusFx bludgeon {broke} |
| `sk-immolation-src` | done-existing | good | **A** Now: the source pulses, victims scorch | fieldTick immolation → .immolate-pulse + SkillFX.scorch |
| `sk-irradiated-src` | new | basic | **A** Sickly green rings, a spinning ☢, geiger flicker; **B** Old: .irradiate-pulse | onEvent: fieldTick irradiated (srcUid, once a round) |
| `sk-wither` | done-existing | good | **A** Now: black smoke and a skull | fifthPassVfx → witherSmokeVfx |
| `sk-ichor` | done-existing | good | **A** Now: golden acid corrodes | eighthPassVfx → SkillFX.acidCorrode |
| `sk-frostbite` | done-existing | good | **A** Now: mist and flakes, then frost | labSkillFx → SkillFX.frostChill |
| `sk-keen-eye-unmask` | new | missing | **A** An eye opens, a beam sweeps, the disguise peels | onEvent: a Keen Eye unit arrives while enemy Changelings are on the board |
| `sk-changeling-unmask` | done-existing | good | **A** Now: the mirage clears | unmaskChangeling → .changeling-unmask |
| `sk-desecrate` | new | missing | **A** A black sigil burns into the felt under the slot | onEvent: curse {cell} (Low effects and up) |
| `sk-curse-tick` | done-existing | good | **A** Now: the cursed ground drains it | eighthPassVfx → SkillFX.curseDrain |
| `sk-conditional-stats` | new + variants | basic | **A** Loyal: 💛 circles in gold; **B** Kinship 🤝, Lone Wolf 🐺, Usurper 👑; **C** The condition lapses: the glyph greys and drops | onEvent: statusFx phaseGrow/phaseFade on a unit with a condition skill |
| `sk-dry-spared` | new | missing | **A** Heat ripples bend round it, a cool glint, "Dry" | onEvent: the first Scorching (fieldTick heatwave) tick of a round: every Dry / heat-resistant unit |
| `sk-demolisher` | new | missing | **A** Hammer-crack and bricks knocked out | onEvent: hit by a Demolisher on a Structure |
| `sk-supreme-strike` | new | missing | **A** Prismatic sparkle shards, armour shattering | onEvent: hit by a Supreme unit (once a round per target) |
| `sk-armor-shred` | done-existing | good | **A** Now: the plate shatters | eighthPassVfx → SkillFX.armorBlock {shatter} |
| `sk-prayer` | done-existing | good | **A** Now: a soft gold beam and a dove | eighthPassVfx → SkillFX.prayerLight |
| `sk-rainrunner` | new | missing | **A** It skims the puddles straight to the castle | onEvent: hitHQ by a Rainrunner while it rains |