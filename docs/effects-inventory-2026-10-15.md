# Master effects inventory (2026-10-15)

Every visual-effect moment in Bramblewood Arena, built and planned, in one checklist. The machine-readable contract is `docs/effects-inventory-2026-10-15.json` (one object per moment); this page is the readable version. Build agents work from the JSON; ids are stable.

**How it was made.** Swept `bramblewood-engine.js` (every `events.push`, every `statusFx` kind, every `skipTurn` reason, `lastMissReason`, `rules.*`, fields, phases, tide, wind, volcano), `arena_app.js` (the skill registry, `renderVfxForEvent` and its pass functions, `deathVfx`/`deathStyleFor`, statuses on board cards, pack opener, forge, nest, rewards, conquest map, dialogue, raid), `bramblewood-skillfx.js`, `bramblewood-procfx.js`, `bramblewood-unitfx.js`, `bramblewood-shaders.js`, `arena_template.html` (all 423 `@keyframes`), `tools/effects-lab/build.py`, and the design docs (lore bible, late-game, ideas, world roadmap, weather and time, raid, co-op, economy, Steam, pack plan, immersion, VFX exploration, effects catalogue, SFX cue sheet) plus `docs/skills-by-map-2026-10-15.xlsx` (Recommended sheet).

**Quality key.** `good` = a real look that reads well. `basic` = a floating word, a sound, a static CSS class or a reused look that doesn't say what happened. `missing` = nothing on screen (often only a battle-log line). `broken` = the visual says the wrong thing. **Priority** 1 = seen every session / big moment, 3 = rare. **future** = planned, not built. **variantsSuggested** = the right look is uncertain, so build 2–3 variants for the designer to pick.

**Totals (2026-10-15):** 933 entries · good 416 · basic 279 · missing 237 · broken 1 · of which future (planned) 96.

## 2026-10-18: status from the Effects Lab (refresh_inventory.py)

Every row now has a `status`, filled by `tools/effects-lab/refresh_inventory.py` from the lab manifests (`tools/effects-lab/manifest/*.js`; the batch docs `docs/fx-batch-*-status.md` as a second source): **live** the game plays it · **lab-only** built in the Effects Lab, not wired in the game · **future** planned, not built · **missing** nothing on screen and nothing in the lab · **retired** kept from before. Each row also carries `lab` (the manifest that registers it) and `inGameHook`. Rerun the script after a lab change; it rewrites this section, the counts and the entry tables.

**Now:** 1035 entries · live 946 · lab-only 56 · future 22 · missing 0 · retired 11. Of the 142 rows the 10-15 sweep rated "missing", 140 are built now (140 live, 0 lab-only).

## 2026-10-17: the Effects Lab catches up (batch L17)

Everything visual or audible the game gained on 2026-10-16 and 2026-10-17 (docs/CHANGELOG.md from "2026-10-16 (02:00)" up), checked against the lab. **56 entries added** (batch `L17`, `status: built`, `added: 2026-10-17`), **28 updated** (`updated: 2026-10-17`: the new look, or the game's own function now plays it), **8 retired** (`status: retired` with the reason; their old demos stay playable). The inventory now holds **1029 entries** (good 503 · basic 290 · missing 235 · broken 1); with the lab's own map-title, grandeur and fun entries every one of them is built. The lab entries live in `tools/effects-lab/manifest/x17.js` and `fe2.js` (map titles in `w4.js`); `manifest/_game.js` stands in for the fight around the stage so the lab plays the game's functions (`field2Vfx`, `s17SkillVfx`, `devilPayVfx`, `skills2Vfx`, `killMarkVfx`, `triggerFiredVfx`, `enemyPitchSlotFx`, `skyStepApply`, `skyPhaseLayers` …, listed in `tools/effects-lab/fx-src-extra.txt`). The JSON also renormalised three stray areas (`weather` → `weather-time`, `map` → `conquest-map`, `darkness` → `darkness-light`).

### Added

| id | Moment | Trigger | Now in the game | Quality | P |
|---|---|---|---|---|---|
| `fld2-canopy` | High Canopy / Undergrowth | a fight with rules.canopy (Map 13) or rules.undergrowth (Map 15): a Swift / Quick unit dodges (evaded {reason:canopy}); Pounce +2 | the Environment card; the ordinary Evasive dodge (SkillFX.evasiveDodge); Pounce's bigger number | basic — the Environment card and the numbers; no look of its own | 2 |
| `fld2-tall-grass` | Tall Grass | hit {tallGrass} (Backstab hits and Pounce deal double); Stealth attacks first | field2Vfx: "🌾 ×2" over the target | good — has its own look that plays at the right moment | 2 |
| `fld2-leylines-1` | Leylines I (zeitgebers stronger) | rules.leylines1: Diurnal / Nocturnal / Crepuscular / Tide / Full Moon bonuses grow | the Environment card; the phase bonus number | basic — the Environment card and the numbers; no look of its own | 2 |
| `fld2-leylines-2` | Leylines II (+1 Lumber a round) | lumber {leylines} for each side from round 2 | resourceGainVfx into each side's Lumber pill | good — has its own look that plays at the right moment | 2 |
| `fld3-sulphur-fumes` | Sulphur Fumes (Choking) | fieldTick sulphurFumes; statusFx choking on each unit that breathes them in (not fire-resistant, Dry or Flying) | field2Vfx: a soft yellow sweep (boardSweepVfx glass, from the right) + "💨 −1" on each choking unit | good — has its own look that plays at the right moment | 2 |
| `fld3-ash-rain` | Ash Rain | fieldTick ashRain (both castles −1, day bonuses halved); ashRainCastle | field2Vfx: the grey hail band and a boom; the castle loss has no number of its own | basic — the sweep; the castle loss only ticks the HP bars | 2 |
| `fld3-ashy` | Ashy (and Ashy after an Eruption) | fieldTick ashy (an Eruption on a volcano map leaves it Ashy for 4 rounds); evaded {reason:ashy} | field2Vfx: the board rumbles (erupt-rumble) + boom; a miss in the ash floats "🌫️ Lost in ash" on the attacker | good — has its own look that plays at the right moment | 2 |
| `fld3-arrow-slits` | Arrow Slits | fieldTick arrowSlits then arrowSlitHit on a random unit of yours (2; a Helmet can turn it) | field2Vfx: a twang, then "🏹 -2" and a shake on the unit hit | good — has its own look that plays at the right moment | 2 |
| `wt-volcano-glow` | Volcano Glow: Day 4, Night 2 | a volcano map with day and night (20, 20-A, 22) or phaseDay / phaseNight on the fight | phasePillHTML counts "2/4" by day and "1/2" by night (engine.phaseStepInfo); the Environment card's Volcano Glow row | basic — the pill and the card row | 2 |
| `sk-penance` | Penance (Devilry payment) | penance {side, dmg} when the card is played | devilPayVfx → devilPulse: a dark ⛧ sinks into your own castle + "⛧ -N" | good — has its own look that plays at the right moment | 2 |
| `sk-blood-tithe` | Blood Tithe (Devilry payment) | bloodTithe {targetUid \| castle, dmg} when the card is played | devilPayVfx → devilPulse on the ally that pays (your castle with none) + "⛧ -N" | good — has its own look that plays at the right moment | 2 |
| `sk-amore` | Amore: a pair falls in love | amore {uid, mateUid, hp, regen}: two Amore units of yours sharing a Type | skills2Vfx: hearts drift both ways (floatGlyphs) + "💕 +0/+3" on each | good — has its own look that plays at the right moment | 2 |
| `sk-amore-broken` | Amore: heartbroken | amoreBroken {uid} when its partner dies | skills2Vfx: "🤎 Heartbroken" + a brown heart and a broken one rise | good — has its own look that plays at the right moment | 2 |
| `sk-scavenge` | On Pitch trigger ("Scavenge") | triggerFired {hook:onPitch} on each of your On Pitch units when you pitch a card | triggerFiredVfx: the unit's ♻️ badge glows, then the action | good — has its own look that plays at the right moment | 2 |
| `sk-lumber-burn` | Burn 1 Lumber (a trigger's cost) | lumberBurn {side, uid} | skills2Vfx: "🔥 -1" on your Lumber pill and an ember flies to the unit | good — has its own look that plays at the right moment | 2 |
| `sk-fire-on-hit` | Fire on hit (trigger action) | fireHit {targetUid \| castle, dmg} with the attack's hit | skills2Vfx: "🔥 -N" and two flames on what it hit, at the impact | good — has its own look that plays at the right moment | 2 |
| `sk-pounce-stat` | Pounce <Att> / <Hp> | a Pounce whose amount is the card's Attack or Health | the Pounce leap (SkillFX.pounceOnto) with that number; the card text's live number is blue | good — has its own look that plays at the right moment | 2 |
| `sk-vanguard` | Vanguard | statusFx vanguard (first card of the game: +N/+N); vanguard (opening hand) is a log line | s17SkillVfx: "🎖️ +N/+N" 0.38 s after the play | basic — the buff float; the opening-hand move is only a battle-log line | 2 |
| `sk-web` | Web (Webbed status) | statusFx webbed on the unit its hit lands on; statusEnd webbed | s17SkillVfx: "🕸️ Webbed" + SkillFX.vineBind; the 🕸️N status badge (w2StatusBadges) | good — has its own look that plays at the right moment | 2 |
| `sk-bloodlust-leap` | Bloodlust leap | bloodlustLeap {uid, from, to} after it kills the unit facing it | s17SkillVfx: the unit moves to its new slot, "🩸 Leap!", a red push (.wave-pushed) and SkillFX.bloodlustPulse({full}) | good — has its own look that plays at the right moment | 2 |
| `sk-sentry` | Sentry | sentry {uid, targetUid} when an enemy enters one of the 3 slots facing it (once a round, while Ready) | s17SkillVfx: "🗼 Sentry!" + ambushTone, then its strike | good — has its own look that plays at the right moment | 2 |
| `sk-carrion` | Carrion | statusFx carrion when another unit dies | s17SkillVfx: "🦴 +N" (heal) | good — has its own look that plays at the right moment | 2 |
| `sk-hoard` | Hoard (passive) | Hoard N: +1 Attack per N Lumber you hold (no event of its own) | its chip on the skill strip (CHIP_FALLBACK_SKILLS) and the bigger number | basic — the chip and the number; no look of its own | 3 |
| `sk-venom-master` | Venom Master (passive) | Venom Master N: your units' Poison and Bleed hits add N more (no event of its own) | its chip on the skill strip (CHIP_FALLBACK_SKILLS) and the bigger number | basic — the chip and the number; no look of its own | 3 |
| `sk-fletcher` | Fletcher (passive) | Fletcher N: your units' arrows deal N more (no event of its own) | its chip on the skill strip (CHIP_FALLBACK_SKILLS) and the bigger number | basic — the chip and the number; no look of its own | 3 |
| `sk-herbalist` | Herbalist (passive) | Herbalist N: every heal on your units heals N more (no event of its own) | its chip on the skill strip (CHIP_FALLBACK_SKILLS) and the bigger number | basic — the chip and the number; no look of its own | 3 |
| `sk-shatter` | Shatter (passive) | Shatter N: +N damage to Frozen units (no event of its own) | its chip on the skill strip (CHIP_FALLBACK_SKILLS) and the bigger number | basic — the chip and the number; no look of its own | 3 |
| `sk-atheist` | Atheist | leylinesHit {atheist} (the Leylines' burn skips it); half damage from magic, Devilry and Ecclesia | field2Vfx: "✴️ Atheist" instead of a number; its 🚫✨ chip | good — has its own look that plays at the right moment | 3 |
| `atk-arrow-count` | Arrow ×N (War Elephant's two arrows) | the shots at Speed 1: one Arrow shot per arrowCount | SkillFX.bowShot per arrow, one after the other; its card shows two Arrow 2 lines | good — has its own look that plays at the right moment | 2 |
| `death-kill-mark` | Killing blow ✖ into the killer | a killing blow from a unit with an On Kill trigger (or Momentum, Midas Touch, Slash & Burn) | killMarkVfx: a ✖ pops on the target and darts into the killer (.kill-gain); its On Kill trigger plays as it lands (pullKillTrigger) | good — has its own look that plays at the right moment | 2 |
| `st-revive-mark` | Revive mark: phoenix, Angel wings, used | a unit with Revive on the board (!revivedOnce); revive event | .revive-mark (ember ring + flame feather) or .angel-wings (isAngelDef); "↺ Revive" chip; used: is-spending + the chip struck in red | good — has its own look that plays at the right moment | 2 |
| `ui-enemy-pitch` | Opponent pitches a card | discard by the opponent → enemyPitchVfx | enemyPitchSlotFx: the card drops into a slot under their pills, settles, fades; "+1 🪵 Lumber" rises; their pill bings | good — has its own look that plays at the right moment | 1 |
| `ui-enemy-hand-count` | Enemy hand counter | the opponent's hand size changes | "N 🃏" pill on their Deck, .ehc-bump on change, .is-zero at 0 | good — a small, clear counter | 1 |
| `ui-upkeep-chip` | Upkeep lock | the round-start effects play before your turn opens | html.bw-upkeep (hand dims, play / pitch / Pass wait) + "⏳ Upkeep" chip (showUpkeepChip) | good — has its own look that plays at the right moment | 1 |
| `ui-voice-bark` | Voice bark and babble | maybeBark on play / kill / death / skill (leaders and bosses always) | showSpeechBubble(.is-bark, 1.6 s) + SoundKit.barkBabble in the species' voice (barkVoiceFor) | good — has its own look that plays at the right moment | 1 |
| `wt-sky-step` | Day / night steps (10 s) | the step inside a phase changes (Day 1→2→3, Night 1→2→3) | skyStepApply: the sky tint eases over SKY_STEP_MS (10 s); a redraw carries on | good — has its own look that plays at the right moment | 2 |
| `wt-night-cursor` | Night pointer light | Night in any fight (not Pitch Black, which has its lantern) | .battlefield.bf-night-cursor + .night-cursor-light under the pointer (wireNightCursorLight) | good — has its own look that plays at the right moment | 2 |
| `tr-frame-kinds` | Card front frames by kind (unit, structure, castle, field) | every card face (board, hand, Codex, deck editor, big views) | cardFrameClasses → fr-<kind> + .cframe (art/frames/*.png) | good — has its own look that plays at the right moment | 1 |
| `tr-frame-arch-devilry` | Archetype frame: Devilry | a unit or structure of the Devilry archetype | ar-devilry: art/frames/a-devilry.png (unit) / s-devilry.png (structure) | good — has its own look that plays at the right moment | 2 |
| `tr-frame-arch-grace` | Archetype frame: Ecclesia | a unit or structure of the Ecclesia archetype | ar-grace: art/frames/a-grace.png (unit) / s-grace.png (structure) | good — has its own look that plays at the right moment | 2 |
| `tr-frame-arch-exile` | Archetype frame: Scrappers | a unit or structure of the Scrappers archetype | ar-exile: art/frames/a-exile.png (unit) / s-exile.png (structure) | good — has its own look that plays at the right moment | 2 |
| `tr-frame-arch-evolution` | Archetype frame: Evolution | a unit or structure of the Evolution archetype | ar-evolution: art/frames/a-evolution.png (unit) / s-evolution.png (structure) | good — has its own look that plays at the right moment | 3 |
| `tr-frame-arch-exiled` | Archetype frame: Exiled Ones | a unit or structure of the Exiled Ones archetype | ar-exiled: art/frames/a-exiled.png (unit) / s-exiled.png (structure) | good — has its own look that plays at the right moment | 3 |
| `tr-frame-arch-forgotten` | Archetype frame: Forgotten Ones | a unit or structure of the Forgotten Ones archetype | ar-forgotten: art/frames/a-forgotten.png (unit) / s-forgotten.png (structure) | good — has its own look that plays at the right moment | 3 |
| `tr-frame-arch-ancient` | Archetype frame: Ancient Ones | a unit or structure of the Ancient Ones archetype | ar-ancient: art/frames/a-ancient.png (unit) / s-ancient.png (structure) | good — has its own look that plays at the right moment | 3 |
| `tr-frame-arch-outer` | Archetype frame: Outer Ones | a unit or structure of the Outer Ones archetype | ar-outer: art/frames/a-outer.png (unit) / s-outer.png (structure) | good — has its own look that plays at the right moment | 3 |
| `tr-frame-arch-void` | Archetype frame: Void | a unit or structure of the Void archetype | ar-void: art/frames/a-void.png (unit) / s-void.png (structure) | good — has its own look that plays at the right moment | 3 |
| `tr-card-backing` | Card backs by kind | every face-down card (pack opener, draw flip, enemy card, pitch, reward reveals, home fan, deck piles) | cardBackClass → .bw-back.bk-<unit\|structure\|castle\|field> (art/backings/*.png) | good — has its own look that plays at the right moment | 1 |
| `tr-rarity-zoom` | Top rarity frame on a zoomed card | the card detail / inspector of a Mythic (or Ancient, Divine, Void, Daemonic) card | FX.D FRAMES_CSS rSel matches "--rarity-a:#…" and "--rarity-a: #…", so the big card wears the same frame | good — has its own look that plays at the right moment | 2 |
| `pack-bonus-copy` | Bonus copy ("Bonus!") | a pack card that rolls a bonus copy (Common 5% … halving from Epic) | .po2-bonus-copy slides out from behind the card, "Bonus! +1 copy" tag, unlockChime and a burst | good — has its own look that plays at the right moment | 2 |
| `pack-count-down` | Pile count counts down | opening a big pile of packs | #poPileCount "N cards" counts down as each card is revealed | basic — the number counts down | 2 |
| `map-trails-one-by-one` | New trails ink in one by one | coming back to the map after a clear that opens new fights | FX.E playReturn: the new trails and fights are hidden, then each trail inks in (trailDraw) and its fight fades in | good — has its own look that plays at the right moment | 1 |
| `map-title-frostfire` | Map title: Frostfire (Map 22) | entering the Rimefire Caldera (m22) for the first time in a session | FX.G.mapTitle, theme frostfire (ribbon banner) | good — has its own look that plays at the right moment | 2 |
| `map-title-castle` | Map title: Fortress (Maps 23-24) | entering the Goldfeather Siege (m23) or Goldfeather Keep (m24) for the first time in a session | FX.G.mapTitle, theme castle (ribbon banner) | good — has its own look that plays at the right moment | 2 |
| `map-grand-silhouettes-2` | Distant silhouettes (II): battlements, the ice volcano | the Frostfire and Fortress titles | FX.G.silhouettes {sil:battlements} / the frostfire volcano | good — has its own look that plays at the right moment | 2 |
| `map-cave-fires` | Cave fire pits light up | a cave map: fire pits along the trail (at most 3) light as you win | .cave-fire.is-igniting / .is-lit | good — has its own look that plays at the right moment | 2 |

### Updated

| id | Moment | Now in the game |
|---|---|---|
| `fld2-landslide` | Landslide | field2Vfx (the game's own function now plays in the lab): the rumble, a band of rocks across the board, chips off each grounded unit |
| `fld2-crushing` | Crushing Depths | field2Vfx: the press (crush-press) and water rings, "🫧 -N" (Swimmers half) |
| `fld2-hail` | Hail | field2Vfx: the hail band across the board, ice chips, "🌨️ -3" |
| `fld2-glass-storm` | Glass-storm | field2Vfx: the glass band (either way), "💎 -1…3" with zaps |
| `fld2-lava-spout` | Lava Spout | field2Vfx: lavaSpoutHit → eruptionGeyserVfx in the column, "♨️ -3" |
| `fld2-leylines` | Leylines III burn | field2Vfx: the violet band, "✴️ -3" and violet rings; an Atheist shows "✴️ Atheist" |
| `fld2-mirage` | Mirage | field2Vfx: the Illusion shimmers in (.mirage-shimmer) with "🪞 Illusion" |
| `fld2-haunted` | Haunted: Frightened | field2Vfx: "👻 Frightened" + SkillFX.fearShiver; the 👻 badge |
| `fld2-slippery` | Slippery | field2Vfx: "⛸️ Slip!" on the attacker; "⛸️ Slipped" on a failed skill |
| `fld2-lanes` | Rook's Row / Bishop's Path | field2Vfx: "♜ +2" / "♝ +2" over the target |
| `fld2-consternation` | Consternation | field2Vfx: "😰 −1/−1" over the hand; a played card keeps the 😰 badge |
| `atk-reflect` | Reflect (a shot bounces back) | 2026-10-17 rework: a shot bounces off (s17SkillVfx reflectShot: "🪞 Reflect!" + mirrorFlash) and hits a unit on the shooter's side, or their castle; the melee "Reflect N%" is gone |
| `sk-electricity` | Electricity arc (the bolt is the hit) | SkillFX.lightning; 2026-10-16: the bolt is the hit: a yellow ⚡ number as it lands, a ⚡ burst and a pale-blue flash |
| `atk-quick` | Quick strike | SkillFX.quickStrike: the dash lands the hit (~0.15 s); 2026-10-16 on every Quick hit and at the castle (quickStrikeCastle), 2026-10-17 on misses too |
| `sk-trigger-fired` | Custom trigger fires | 2026-10-16: only the trigger's own ⚡ badge glows (triggerFiredVfx, .ab-trig.is-firing); no rune ring, card glow, aura or bolt |
| `castle-hp-number` | Castle HP number tick | 2026-10-16: floatText(hqRibbonFloatAnchor(side), "-N", "hq-big") on the HP bar where its fill ends |
| `castle-herb-bane` | Herb Refinery bitter brew | 2026-10-16: castleThrowVfx: a 🧪 on a shallow arc that lands in 0.44 s (every castle shot) |
| `dark-night-veil-in` | Night falls on the battlefield | 2026-10-16: the whole board darkens over 10 s (skyPhaseLayers + the veil) while the night creeps in from the left at 40% |
| `dark-night-veil-out` | Night lifts | 2026-10-16/17: the board lights up over 10 s, the light creeps in from the left at 40%, soft streaks (FX.E.nightRetreat), a barely-there sun (FX.B.dayBreaks) |
| `map-hidden-skirmish-pop` | Hidden skirmish appears | 2026-10-17: the hidden skirmish pops in with its trail from the fight beside it (.trail-pop); it opens once that fight is cleared |
| `death-fall` | Normal death (smooth topple) | 2026-10-16 (voices and feel): the topple is back as one smooth motion that starts slow and speeds up, fading as it lands (fallDeathVfx) |
| `wt-day-breaks` | Day breaks | 2026-10-17: FX.B.dayBreaks: no hard disc, a soft blurred glow 60% fainter, rays a third fainter; birds sing on about 1 in 3 daybreaks (SoundKit.dawnChime) |
| `sk-regen` | Regeneration | 2026-10-17: SkillFX.regen about 40% faster (motes, stagger, pluses, glow) |
| `st-stun-apply` | Stun: applied | 2026-10-16: Stun N: each landed hit has a 1 in 3 chance to Stun for N rounds (the old % values read as Stun 1); same look |
| `sk-sap` | Leech (Sap) drain | 2026-10-17: the engine's Sap is the Leech skill ("+ Add Skill", a card line, the 🧛 chip); SkillFX.lifeDrain with half-size drops (10-16) |
| `wt-rain-start-stop` | Rain starts / stops while you look at the map | 2026-10-16: rain coming in (on the map and a Spring Rain field arriving) is 90% more transparent (RAIN_ONSET_OPACITY); rain stopping unchanged |
| `atk-ambush` | Ambush strike | 2026-10-16/17: Ambush N strikes any enemy entering the slot facing it (played, spawned, moved in); FX.A.ambushStrike |
| `st-strangle-tick` | Strangle: squeeze | SkillFX.squeeze + "🪢 -N" |

### Retired

| id | Moment | Why |
|---|---|---|
| `death-shiny-foil` | Shiny / foil unit dies | 2026-10-17: shiny and foil units die like anyone else; the sheen is the Prism death (death-prism) |
| `pack-duplicate` | Duplicate (×N) pull | 2026-10-17: the "×2" with two blank cards (fired on any card you already owned) is gone; a real bonus copy is pack-bonus-copy |
| `death-lethal-number` | Killing blow number | 2026-10-16: the "−N ✖" killing-blow stamp is gone; a killer that feeds on kills gets the ✖ (death-kill-mark) |
| `sk-bloodlust` | Bloodlust grows | 2026-10-17: Bloodlust no longer grows (no statusFx bloodlust); it leaps on a kill (sk-bloodlust-leap) |
| `sk-worthy` | Worthy loot | 2026-10-16: Worthy is Bounty everywhere (an empty, hidden slot); its loot is Bounty's +🪵 |
| `res-rank-lesson` | Rank lesson | 2026-10-16: the results no longer show the rank lesson box; the rank hex says it |
| `res-xp-line` | XP and level on results | 2026-10-16: the "+3 XP" gold bar with its glow over the results is gone; an account level-up plays after the results close |
| `tut-lumber-lesson` | Lumber lesson | 2026-10-16: the big Lumber lesson window is gone; the spotlighted Pitching lesson teaches Lumber |

## Counts by area and quality

Quality is the inventory's rating of the look (the 10-15 sweep, kept); status is where it stands now (2026-10-18, `tools/effects-lab/refresh_inventory.py`). "missing now" counts rows with nothing on screen and nothing in the lab.

| Area | Batch | good | basic | missing | broken | live | lab-only | future | missing now | retired | total | P1 |
|---|---|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|
| combat-attack | A | 51 | 36 | 4 | 0 | 91 | 0 | 0 | 0 | 0 | 91 | 2 |
| combat-skill | A | 80 | 37 | 15 | 0 | 130 | 0 | 0 | 0 | 2 | 132 | 4 |
| status | B | 41 | 23 | 43 | 0 | 105 | 2 | 0 | 0 | 0 | 107 | 4 |
| field | B | 31 | 17 | 13 | 0 | 51 | 10 | 0 | 0 | 0 | 61 | 1 |
| weather-time | B | 16 | 11 | 5 | 1 | 31 | 2 | 0 | 0 | 0 | 33 | 1 |
| darkness-light | B | 8 | 8 | 13 | 0 | 26 | 3 | 0 | 0 | 0 | 29 | 8 |
| death | C | 18 | 3 | 18 | 0 | 36 | 1 | 0 | 0 | 2 | 39 | 3 |
| castle | C | 8 | 6 | 7 | 0 | 20 | 1 | 0 | 0 | 0 | 21 | 2 |
| summon-spawn | C | 13 | 12 | 5 | 0 | 27 | 3 | 0 | 0 | 0 | 30 | 5 |
| card-treatment | D | 30 | 17 | 14 | 0 | 57 | 4 | 0 | 0 | 0 | 61 | 2 |
| foil | D | 20 | 2 | 22 | 0 | 22 | 0 | 22 | 0 | 0 | 44 | 0 |
| pack-card-open | D | 25 | 6 | 8 | 0 | 37 | 1 | 0 | 0 | 1 | 39 | 5 |
| rewards-results | F | 15 | 9 | 0 | 0 | 21 | 0 | 0 | 0 | 3 | 24 | 4 |
| meta-progression | D | 17 | 20 | 17 | 0 | 45 | 9 | 0 | 0 | 0 | 54 | 4 |
| conquest-map | E | 74 | 52 | 25 | 0 | 147 | 4 | 0 | 0 | 0 | 151 | 4 |
| world-ambience | E | 13 | 4 | 5 | 0 | 15 | 7 | 0 | 0 | 0 | 22 | 0 |
| ui-feedback | F | 36 | 8 | 4 | 0 | 45 | 1 | 0 | 0 | 2 | 48 | 4 |
| tutorial-dialogue | F | 12 | 4 | 1 | 0 | 16 | 0 | 0 | 0 | 1 | 17 | 1 |
| raid-dungeon-pvp | F | 6 | 12 | 11 | 0 | 21 | 8 | 0 | 0 | 0 | 29 | 1 |
| map-grandeur | L17 | 3 | 0 | 0 | 0 | 3 | 0 | 0 | 0 | 0 | 3 | 0 |
| **all** | | **517** | **287** | **230** | **1** | **946** | **56** | **22** | **0** | **11** | **1035** | **55** |

Areas `future` items live in their natural area with `future: true` (so a planned dragon death sits under **death**); "Future effects by theme" below gathers them.

## Top 25 most visible gaps

1. **Twilight begins (Day, Night, Day, Night, Twilight)** (`wt-twilight`, broken, P1) — Twilight is announced as "☀️ Day breaks." (no twilight branch in the phase toast).
2. **A unit can't see in the dark (no Darksight, no Lantern)** (`dark-unit-blind`, missing, P1) — A unit that can't see in Darkness / Pitch Black / Absolute looks exactly like one that can.
3. **Pitch Black (level 2, miss 1 in 2): fight opens in it** (`dark-pitch-enter`, basic, P1) — The three darkness levels are a static veil: no lights-going-out moment, no level difference in motion (also dark-dark-enter, dark-absolute-enter).
4. **Darkness (level 1, miss 1 in 4): a unit swings blind and misses** (`dark-dark-miss`, basic, P1) — Every darkness miss (any level) and Night-blind/Sun-shy miss shows the same "🌙 Miss!" float.
5. **Resisted / Weak-to hit** (`st-resist-weak-hit`, missing, P1) — Resisted (½) and weakness (×2) hits are unexplained numbers.
6. **Foil pull reveal** (`pack-reveal-foil`, missing, P1) — A foil pull has no reveal moment at all; the finish is just there.
7. **Mythic pull gets its own reveal** (`pack-reveal-mythic`, missing, P1) — Mythic, Ancient, Divine, Void and Daemonic share one "legend" reveal.
8. **Fight cleared (returning to the map)** (`map-node-cleared`, missing, P1) — Coming back to the map after a win: the node just becomes "done", no stamp.
9. **Trail to the next fight unlocks** (`map-trail-unlock`, missing, P1) — The trail to the next fight never draws itself.
10. **Whole map cleared** (`map-cleared`, missing, P1) — Clearing a whole map has no celebration on the map (only an XP toast).
11. **Exile a unit from the board** (`sk-exile-board`, missing, P1) — A unit exiled from the board just vanishes (sound only).
12. **Player Stun (enemy skips their turn)** (`sk-stun-player`, missing, P1) — Player Stun (a whole skipped turn) is log-only.
13. **Leader / King dies** (`death-leader`, missing, P1) — Your leader / a King dies like any token.
14. **Boss unit dies** (`death-boss`, missing, P1) — Boss units die like any unit.
15. **Electrocuted (Electricity / Dragon Lightning / Shock Bolt)** (`death-lightning`, missing, P2) — Element deaths beyond burn/poison/cold/bleed are generic: lightning, wither, crushed, explosion, drowning, magic, psychic, irradiation (death-* entries).
16. **Paralyze coin flip fails** (`st-paralyze-coinflip`, missing, P1) — Turns lost to Paralyze (coin flip), Freeze, Sleep, Stun, Chained, Petrified, Shell, Ritual and 0 Attack are log-only (st-*-skip).
17. **Poison: wears off** (`st-poison-expire`, missing, P3) — Every status wears off silently (19 st-*-expire entries).
18. **Castle regenerates** (`castle-regen`, missing, P2) — Castle regeneration (and the Wildpath castle perks) has no render and no log text.
19. **Raid stage change (Enraged 75%, Exposed <1%)** (`raid-stage-change`, missing, P1) — Raid stage changes (Enraged, Exposed) have no moment.
20. **Damage type look: magic** (`atk-dmgtype-magic`, missing, P2) — Magic, water and "true" damage have no light colour (fall back to physical).
21. **Lightning (passive) charges** (`sk-lightning-passive`, missing, P2) — statusFx `lightning` is pushed by the engine and ignored by the renderer.
22. **Map ambience: The Mycelium Deep (mz)** (`map-amb-mz`, missing, P2) — Eight maps have no shader kind (mz, mx, mn, mi, mv, ms, mq, mo); m1 (misty Map 0) wears the savanna shimmer.
23. **Desecrate curses a cell** (`sk-desecrate`, missing, P2) — Desecrated (cursed) ground is invisible until it ticks.
24. **Field card ends** (`fld-end`, missing, P2) — A field card ending is log-only; the tile just disappears.
25. **Account level-up** (`meta-account-level`, basic, P1) — Account level-up is a toast.

## Entries by area

### Combat: attacks and hits (`combat-attack`, 91)

| id | name | trigger | current | quality | status | P |
|---|---|---|---|---|---|--:|
| `atk-melee-lunge` | Melee lunge (windup + strike) 🎨 | hit / evaded with !ev.ranged → animateAttacker(attUid) at the start of the beat | animateAttacker + @keyframes windup-mine/strike-mine/windup-enemy/strike-enemy | good — anticipation lean, lunge toward target, ±16px lean | live (a.js) | 2 |
| `atk-castle-lunge` | Lunge at the castle | hitHQ (melee) → animateAttacker(..., {toCastle:true}), leanX 0 | animateAttacker toCastle | good — straight-ahead swing, reads clearly | live (a.js) | 3 |
| `atk-impact` | Hit impact on a unit | hit → impactDelay timer → flashDmg + impactSquash + battleLightAt + SoundKit.hitAt | flashDmg, impactSquash, battleLightAt (shader point light), dmgBounceFall number | good — squash, typed number, lit felt | live (a.js) | 1 |
| `atk-heavy-hitstop` | Heavy blow hit-stop | hit with dmg>=8, or any hitHQ → hitStop(70) + Ambience.duck + big battleLightAt with shockwave | hitStop, Ambience.duck, battleWeather.wave | good — frame freeze + felt shockwave | live (a.js) | 2 |
| `atk-big-blow-shake` | Huge hit screen shake (>15 dmg) | hit/hitHQ with dmg>15 → bigBlowShake → battlefieldShake(strength 16..100) | battlefieldShake (GSAP jitter) | good — scales with damage, rate-limited | live (a.js) | 2 |
| `atk-crit` | Critical hit | hit/hitHQ with ev.crit (not ambush) → flashDmg(crit) + critTone | .dmg-float .df-burst (critBurst), CRIT stamp, SoundKit.critTone | good — gold starburst number | live (a.js) | 2 |
| `atk-armor-block-full` | Armor fully blocks a hit | hit with ev.armorBlocked → SoundKit.clang + SkillFX.armorBlock(full) | SkillFX.armorBlock + clang | good — steel plate + sparks + 🛡️ | live (a.js) | 2 |
| `atk-armor-block-partial` | Armor soaks part of a hit | hit on a unit with Armor>0 (once a round) → SkillFX.armorBlock(partial) | SkillFX.armorBlock partial | good — has its own look that plays at the right moment | live (a.js, p1.js) | 3 |
| `atk-dmgtype-physical` | Damage type look: physical | any hit/hitHQ with dmgType:'physical' → battleLightAt(LIGHT_COLORS[dmgType]) + dmgGlyph(dmgType) projectile | LIGHT_COLORS.physical / dmgGlyph | good — warm-white light, ➶ projectile glyph | live (a.js) | 3 |
| `atk-dmgtype-heat` | Damage type look: heat | any hit/hitHQ with dmgType:'heat' → battleLightAt(LIGHT_COLORS[dmgType]) + dmgGlyph(dmgType) projectile | LIGHT_COLORS.heat / dmgGlyph | good — orange light, 🔥 glyph, burn death, heat haze on fiery units | live (a.js) | 3 |
| `atk-dmgtype-cold` | Damage type look: cold | any hit/hitHQ with dmgType:'cold' → battleLightAt(LIGHT_COLORS[dmgType]) + dmgGlyph(dmgType) projectile | LIGHT_COLORS.cold / dmgGlyph | good — blue light, ❄ glyph, ice-shard death | live (a.js) | 3 |
| `atk-dmgtype-acid` | Damage type look: acid | any hit/hitHQ with dmgType:'acid' → battleLightAt(LIGHT_COLORS[dmgType]) + dmgGlyph(dmgType) projectile | LIGHT_COLORS.acid / dmgGlyph | basic — acid light colour + 🧪 glyph only; no fizz on impact | live (a.js) | 2 |
| `atk-dmgtype-poison` | Damage type look: poison | any hit/hitHQ with dmgType:'poison' → battleLightAt(LIGHT_COLORS[dmgType]) + dmgGlyph(dmgType) projectile | LIGHT_COLORS.poison / dmgGlyph | basic — green light + ☠ glyph only | live (a.js) | 2 |
| `atk-dmgtype-decay` | Damage type look: decay | any hit/hitHQ with dmgType:'decay' → battleLightAt(LIGHT_COLORS[dmgType]) + dmgGlyph(dmgType) projectile | LIGHT_COLORS.decay / dmgGlyph | basic — violet light + 🦠 glyph only | live (a.js) | 2 |
| `atk-dmgtype-magic` | Damage type look: magic 🎨 | any hit/hitHQ with dmgType:'magic' → battleLightAt(LIGHT_COLORS[dmgType]) + dmgGlyph(dmgType) projectile | LIGHT_COLORS.magic / dmgGlyph | missing — LIGHT_COLORS has no magic entry (falls back to physical); only 🪄 glyph | live (a.js) | 2 |
| `atk-dmgtype-water` | Damage type look: water 🎨 | any hit/hitHQ with dmgType:'water' → battleLightAt(LIGHT_COLORS[dmgType]) + dmgGlyph(dmgType) projectile | LIGHT_COLORS.water / dmgGlyph | missing — LIGHT_COLORS has no water entry; only 💧 glyph | live (a.js) | 2 |
| `atk-dmgtype-true` | Damage type look: true 🎨 | any hit/hitHQ with dmgType:'true' → battleLightAt(LIGHT_COLORS[dmgType]) + dmgGlyph(dmgType) projectile | LIGHT_COLORS.true / dmgGlyph | missing — dmgType "true" has no glyph or light colour | live (a.js) | 2 |
| `atk-ranged-projectile` | Generic ranged / triggered missile | hit with ev.ranged and no pending arrow/bolt → spawnProjectile(from, to, dmgGlyph) after windup | spawnProjectile (an emoji glyph flies) | basic — an emoji sliding across; no arc, trail or impact flash of its own | live (a.js) | 1 |
| `atk-arrow` | Arrow shot | arrow event (pendingArrow) then ranged hit → SkillFX.bowShot (draw, release, flight, thunk) | SkillFX.bowShot + bowDraw/arrowLoose/arrowThunk | good — full bow choreography | live (_existing.js) | 2 |
| `atk-fire-arrow` | Fire Arrow | arrow {fire:true} + hit → SkillFX.bowShot({fire}) | bowShot fire: flame tip, ember trail, ignite ring | good — has its own look that plays at the right moment | live (_existing.js) | 2 |
| `atk-ice-arrow` | Ice Arrow | arrow (ice) + cold hit, 1 in 2 statusFx freeze | bowShot (plain) then freezeEncase | basic — the arrow itself is a normal arrow: no frost tip, no rime trail | live (a.js) | 2 |
| `atk-twin-shot` | Twin Shot | two arrow events + hits in quick succession | bowShot ×2 | good — has its own look that plays at the right moment | live (a.js) | 3 |
| `atk-volley` | Volley (arrow at every enemy) | Volley N on 1st/3rd/5th Ready round: arrow+hit per enemy unit | bowShot per arrow, one after another | basic — reads as many single shots; SkillFX.volley (a real arrow rain prototype) is not wired | live (_existing.js, a.js) | 2 |
| `atk-snipe` | Snipe | arrow {snipe:true} + hit | bowShot | good — has its own look that plays at the right moment | live (a.js) | 3 |
| `atk-bolt-fire` | Fire Bolt | bolt event {element:'fire'} → ninthPassVfx → SkillFX.boltGlob, then ranged hit / statusFx | SkillFX.boltGlob (ember splat) | good — spit squash, lobbed glob, coloured splat | live (a.js) | 2 |
| `atk-bolt-acid` | Acid Bolt | bolt event {element:'acid'} → ninthPassVfx → SkillFX.boltGlob, then ranged hit / statusFx | SkillFX.boltGlob (acid drip splat) | good — spit squash, lobbed glob, coloured splat | live (a.js) | 2 |
| `atk-bolt-poison` | Poison Bolt | bolt event {element:'poison'} → ninthPassVfx → SkillFX.boltGlob, then ranged hit / statusFx | SkillFX.boltGlob (green glob + 🐍 +N ☠) | good — spit squash, lobbed glob, coloured splat | live (a.js) | 2 |
| `atk-bolt-ice` | Ice Bolt | bolt event {element:'ice'} → ninthPassVfx → SkillFX.boltGlob, then ranged hit / statusFx | SkillFX.boltGlob (ice-shard splat) | good — spit squash, lobbed glob, coloured splat | live (a.js) | 2 |
| `atk-bolt-shock` | Shock Bolt | bolt event {element:'shock'} → ninthPassVfx → SkillFX.boltGlob, then ranged hit / statusFx | SkillFX.boltGlob (spark splat) | good — spit squash, lobbed glob, coloured splat | live (a.js) | 2 |
| `atk-cleave` | Cleave (Sweep) | hit with ev.sweep → SkillFX.cleave (once a round) | SkillFX.cleave | good — has its own look that plays at the right moment | live (a.js, p1.js) | 2 |
| `atk-sweep-whiff` | Cleave hits empty air | sweepWhiff → .sweep-whiff arc + "whoosh" label | .sweep-whiff (@keyframes sweepWhiff) | good — has its own look that plays at the right moment | live (a.js, p1.js) | 3 |
| `atk-prong-fork` | Fork (2 tines) | hit with ev.fork, ev.prong='fork' (each prong beyond the first) → SkillFX.forkProngs | SkillFX.forkProngs | good — steel tines thrust in | live (a.js) | 3 |
| `atk-prong-trident` | Trident (3 tines) | hit with ev.fork, ev.prong='trident' (each prong beyond the first) → SkillFX.forkProngs | SkillFX.forkProngs | good — steel tines thrust in | live (a.js) | 3 |
| `atk-prong-pitchfork` | Pitchfork (4 tines) | hit with ev.fork, ev.prong='pitchfork' (each prong beyond the first) → SkillFX.forkProngs | SkillFX.forkProngs | good — steel tines thrust in | live (a.js) | 3 |
| `atk-prong-castle` | Fork prong hits the castle | hitHQ {fork:true, prong} (flank damage) | hqHitBigVfx only | basic — the tine look never reaches the castle | live (a.js) | 3 |
| `atk-octolash` | Octolash | hit with prong octolash + statusFx octolash | forkProngs (purple tentacles) + "🐙 Octolash ×N" float | good — has its own look that plays at the right moment | live (a.js) | 3 |
| `atk-crab-claw` | Crab Claws pinch | crabClaw {dir} before the hit | .crab-pinch + "🦞 ←/→" float | basic — no claw shape snapping; retired from the editor but still plays | live (a.js) | 3 |
| `atk-backstab` | Backstab | hit with ev.backstab | SkillFX.backstab dagger flash + slash, backstabSlice | good — has its own look that plays at the right moment | live (_existing.js) | 2 |
| `atk-ambush` | Ambush strike | hit/hitHQ with ev.ambush | 2026-10-16/17: Ambush N strikes any enemy entering the slot facing it (played, spawned, moved in); FX.A.ambushStrike | basic — float text only | live (a.js, x17.js) | 2 |
| `atk-quick` | Quick strike | hit by a Quick unit | SkillFX.quickStrike: the dash lands the hit (~0.15 s); 2026-10-16 on every Quick hit and at the castle (quickStrikeCastle), 2026-10-17 on misses too | good — has its own look that plays at the right moment | live (a.js, x17.js) | 3 |
| `atk-swift` | Swift strike | hit by a Swift unit | "💨 Swift!" float + SoundKit.quick | basic — float only | live (a.js) | 3 |
| `atk-frenzy` | Frenzy / Twin Strike second swing | frenzy {twin} (requeued attack) | SkillFX.rageFlare + "🔥 Frenzy!" / "⚔⚔ Twin Strike!" | good — has its own look that plays at the right moment | live (a.js) | 3 |
| `atk-swarm` | Swarm mobbing | hit by a Swarm unit with a live swarm bonus | SkillFX.swarm (buzzing cloud converges) | good — has its own look that plays at the right moment | live (a.js) | 3 |
| `atk-flying-swoop` | Flying swoop | melee hit by a Flying unit (once a round) | SkillFX.swoop air-trail dive + featherBurst when hit | good — has its own look that plays at the right moment | live (a.js) | 3 |
| `atk-scared-lunge` | Attack on a Scare unit | hit whose target has Scare | animateAttacker {scared} wobbly line (.facing-scared scaredShake) | basic — subtle; no fear tell on the attacker | live (a.js) | 3 |
| `atk-unitfx-claw` | Unit hit style: claw | hit by a unit whose UnitFX style is claw → UnitFX.hitMark('claw') | UnitFX.claw (claw rake marks) | good — has its own look that plays at the right moment | live (a.js) | 3 |
| `atk-unitfx-bite` | Unit hit style: bite | hit by a unit whose UnitFX style is bite → UnitFX.hitMark('bite') | UnitFX.bite (jaw crunch) | good — has its own look that plays at the right moment | live (a.js) | 3 |
| `atk-unitfx-sting` | Unit hit style: sting | hit by a unit whose UnitFX style is sting → UnitFX.hitMark('sting') | UnitFX.sting (stinger dot) | good — has its own look that plays at the right moment | live (a.js) | 3 |
| `atk-unitfx-peck` | Unit hit style: peck | hit by a unit whose UnitFX style is peck → UnitFX.hitMark('peck') | UnitFX.peck (beak dents) | good — has its own look that plays at the right moment | live (a.js) | 3 |
| `atk-unitfx-burn` | Unit hit style: burn | hit by a unit whose UnitFX style is burn → UnitFX.hitMark('burn') | UnitFX.burn (scorch star) | good — has its own look that plays at the right moment | live (a.js) | 3 |
| `atk-unitfx-firebreath` | Unit special attack: fire breath | hit by a unit with ufx.attack (fireBreath) → UnitFX.attackFx | UnitFX.fireBreath | good — has its own look that plays at the right moment | live (a.js) | 3 |
| `atk-counter-parry` | Counterattack parry | statusFx counter (+ hit back) | SkillFX.parry | good — has its own look that plays at the right moment | live (a.js) | 3 |
| `atk-guardian-redirect` | Guardian takes the hit | hit with ev.guardianRedirect | flashShield on the guardian | basic — no line showing the blow being pulled across | live (a.js) | 2 |
| `atk-thorns` | Thorns sting the attacker | thorns {fromUid,targetUid,dmg} | SkillFX.thorns + clang + flashDmg | good — has its own look that plays at the right moment | live (a.js) | 3 |
| `atk-reflect` | Reflect (a shot bounces back) | reflectShot {uid, targetUid \| castle}: a shot aimed at a Reflect unit | 2026-10-17 rework: a shot bounces off (s17SkillVfx reflectShot: "🪞 Reflect!" + mirrorFlash) and hits a unit on the shooter's side, or their castle; the melee "Reflect N%" is gone | good — has its own look that plays at the right moment | live (a.js, x17.js) | 3 |
| `atk-recoil` | Recoil from own swing | statusFx recoil | "💢 −N" float + recoilEl | basic — float only | live (a.js) | 3 |
| `atk-spite` | Spiteful lash-back on death | statusFx spite (victim lashes the killer) | none (battle log only) | missing — no on-board cue at all | live (a.js) | 2 |
| `atk-evade-evasive` | Evade: evasive | evaded {reason:'evasive'} → flashDodge / evasiveDodge | flashDodge + missCallout + SkillFX.evasiveDodge | good — SkillFX.evasiveDodge blink sidestep | live (a.js, p1.js) | 3 |
| `atk-evade-swift` | Evade: swift | evaded {reason:'swift'} → flashDodge / evasiveDodge | flashDodge + missCallout + SkillFX.evasiveDodge | good — evasiveDodge (shared) | live (a.js) | 3 |
| `atk-evade-flying` | Evade: flying | evaded {reason:'flying'} → flashDodge / evasiveDodge | flashDodge + missCallout | basic — flashDodge hop + "Miss" callout only | live (a.js) | 2 |
| `atk-evade-fog` | Evade: fog | evaded {reason:'fog'} → flashDodge / evasiveDodge | flashDodge + missCallout | basic — generic hop; the fog itself never swallows the swing | live (a.js) | 2 |
| `atk-evade-illusory` | Evade: illusory 🎨 | evaded {reason:'illusory'} → flashDodge / evasiveDodge | flashDodge + missCallout | basic — generic hop; raid boss units dodge 67% | live (a.js) | 2 |
| `atk-evade-shadow` | Evade: shadow 🎨 | evaded {reason:'shadow'} → flashDodge / evasiveDodge | flashDodge + missCallout | basic — generic hop; Shadow (night/dark) has no look | live (a.js) | 2 |
| `atk-evade-smoke` | Evade: smoke | evaded {reason:'smoke'} → flashDodge / evasiveDodge | flashDodge + missCallout | basic — generic hop | live (a.js) | 2 |
| `atk-blind-miss` | Blind unit misses | blindMiss (no night flag) — unit with Blind/Purblind | animateAttacker + "👁 Miss!" float + blindTone | basic — float text only | live (a.js, p1.js) | 2 |
| `atk-confused-whiff` | Confused fizzle | confusedWhiff (on-hit skill or trigger fizzles) | "❓ Fizzle" float | basic — float only | live (a.js) | 3 |
| `atk-tipsy-swing` | Tipsy lurching swing | tipsySwing {drift, miss} | .tipsy-lurch (@keyframes tipsyLurch) | basic — a generic or reused look that does not say what happened | live (a.js) | 3 |
| `atk-boomerang-throw` | Boomerang / Anti-Air throw | hit by a boomerang/bananarang/antiAir unit | SkillFX.boomerang curve out and back + boomerangWhirr | good — has its own look that plays at the right moment | live (_existing.js) | 3 |
| `atk-boomerang-castle` | Boomerang at the castle | hitHQ by a boomerang unit | SkillFX.boomerangCastle | good — has its own look that plays at the right moment | live (a.js) | 3 |
| `atk-boomerang-return` | Boomerang returns (next round) | boomerangReturn {speed} | One flight, SkillFX.boomerangReturn on the return's hit / hitHQ / whiff: it retraces the throw (straight back in along the line it left on, the hit, the throw's curve home) and ends in the catch. FX.A.boomerangInbound no longer plays in fights; FX.A.catchSnap / whiffPast skip while it flies (SkillFX.boomerangInFlight). | good — has its own look that plays at the right moment | live (a.js, wave17.js) | 2 |
| `atk-boomerang-caught` | Boomerang caught | boomerangCaught (thrower or the unit in its home slot) | "🪃 Caught!" float | basic — float only | live (a.js) | 3 |
| `atk-boomerang-whiff` | Boomerang misses | boomerangWhiff | missCallout whiff + whirr | basic — a generic or reused look that does not say what happened | live (a.js) | 3 |
| `atk-boomerang-friendly` | Boomerang hits your own side | hit / hitHQ {boomerang, friendly:true} on the way home | plain hit / castle hit | basic — no "oops" read; looks like an enemy hit | live (a.js) | 3 |
| `atk-king-slayer` | King Slayer bonus | kingSlayer {amount} | SkillFX.crownCrack + kingSlayerTone + float | good — has its own look that plays at the right moment | live (a.js) | 3 |
| `atk-pierce-rend` | Pierce / Puncture through Armor | hit with ev.rend | SkillFX.pierceThrough + "🗡 Pierced!" | good — has its own look that plays at the right moment | live (a.js) | 3 |
| `atk-pierce-hq` | Pierce spills to the castle | pierceHQ {dmg} | SkillFX.pierceThrough on the castle + flashHqDamage | good — has its own look that plays at the right moment | live (a.js) | 3 |
| `atk-overwhelm-hq` | Stampede (Overwhelm) spill to the castle | overwhelmHQ {dmg} | shakeEl + flashHqDamage + "💥 -N" | basic — no trample/stampede motion | live (a.js) | 2 |
| `atk-siege` | Siege bonus on the castle | hitHQ with ev.siege | "🏰 Siege!" float + siegeTone | basic — float only | live (a.js) | 3 |
| `atk-bulwark` | Bulwark blocks castle damage | hitHQ with ev.bulwark>0 | "🛡 -N blocked" float + bulwarkTone | basic — float only | live (a.js) | 3 |
| `atk-stealth-slip` | Stealth unit slips past to the castle | hitHQ by a Stealth unit | SkillFX.stealthSlip + "👻 Stealth!" | good — has its own look that plays at the right moment | live (a.js) | 3 |
| `atk-fester` | Fester bonus damage | hit with ev.festerBonus | "+N☠ Fester" float + festerBite | basic — float only | live (a.js) | 3 |
| `atk-rupture` | Rupture bonus damage | hit with ev.ruptureBonus | "+N🩸 Rupture" float + ruptureBite | basic — float only | live (a.js) | 3 |
| `atk-quake-hit` | Earthquake / Landslide jolt per unit | hit/evaded with ev.quake (0.1 s apart) | .quake-jolt + flashDmg | good — has its own look that plays at the right moment | live (a.js) | 3 |
| `atk-retribution` | Divine Retribution | hit with ev.retribution (ranged) | plain projectile | basic — no holy light | live (a.js) | 3 |
| `atk-reload` | Reload after firing | hit by a Reload unit; skipTurn reason reload while reloading | "🔄 Reloading" float + reloadTone | basic — float only; no reloading pose while it waits | live (a.js) | 3 |
| `atk-friction` | Friction (ally rubs) | friction {dmg} on an ally | shakeEl + "⚙️ -N" | basic — a generic or reused look that does not say what happened | live (a.js) | 3 |
| `atk-pounce` | Pounce | pounce {amount} on play | crouch-and-spring GSAP + float | basic — no leap trail | live (a.js, p1.js) | 3 |
| `atk-swipe-lumber` | Swipe steals Lumber | swipeLumber {amount} | 🪵 projectile castle → swiper + float | basic — a generic or reused look that does not say what happened | live (a.js) | 3 |
| `atk-charge-fire` | Charge fires | charge {fired:true} | updateChargeBadge + "⏲️ Charge!" + .chargebadge.charge-fire | basic — badge pulse only; no wind-up release | live (a.js) | 3 |
| `atk-castle-bolt-shot` | Castle ballista bolt | statusFx castleBolt then fireDamageAction from 'castle' | plain projectile from the castle tile (no own look) | basic — log text only for the bolt itself | live (a.js) | 2 |
| `atk-arrow-count` | Arrow ×N (War Elephant's two arrows) | the shots at Speed 1: one Arrow shot per arrowCount | SkillFX.bowShot per arrow, one after the other; its card shows two Arrow 2 lines | good — has its own look that plays at the right moment | live (x17.js) | 2 |

### Combat: skills (`combat-skill`, 132)

| id | name | trigger | current | quality | status | P |
|---|---|---|---|---|---|--:|
| `sk-trigger-fired` | Custom trigger fires | triggerFired {hook, action} | 2026-10-16: only the trigger's own ⚡ badge glows (triggerFiredVfx, .ab-trig.is-firing); no rune ring, card glow, aura or bolt | good — has its own look that plays at the right moment | live (a.js, x17.js) | 2 |
| `sk-earthquake` | Earthquake cast | earthquake {amount} | playEarthquake + SkillFX.earthquake cracks + earthquakeTone | good — has its own look that plays at the right moment | live (a.js) | 2 |
| `sk-landslide` | Landslide | earthquake {landslide:true} | same as Earthquake | basic — no falling rocks; indistinguishable from Earthquake | live (a.js) | 2 |
| `sk-tornado` | Tornado | tornado {moves, swaps, hits} | boardSweepVfx(tornado) + spins + 🌪️ floats | good — has its own look that plays at the right moment | live (a.js) | 2 |
| `sk-avalanche` | Avalanche | avalanche {hits} + statusFx avalancheWait | boardSweepVfx(avalanche) + frost rings/bursts | good — has its own look that plays at the right moment | live (a.js) | 2 |
| `sk-tsunami` | Tsunami | tsunami {pushed, hits} + wash {tsunami} | boardSweepVfx(tsunami) + elastic push + washSplashVfx | good — has its own look that plays at the right moment | live (a.js) | 2 |
| `sk-wave` | Wave push | wave {dir, moves, cols, swapUid, awash} | SkillFX.waveRide: the card rides a crest from its old slot to its new one (lifted, leaning into the push), the crest runs on and breaks in a spray, the card drops in and bobs; a swapped unit rocks. The geyser and the .wave-pushed nudge (which made it teleport) are gone. | good — has its own look that plays at the right moment | live (a.js, wave17.js) | 3 |
| `sk-dragon-lightning` | Dragon Lightning | dragonLightning {uids} | red SkillFX.lightning + .dragon-struck | good — has its own look that plays at the right moment | live (a.js, x17.js) | 2 |
| `sk-electricity` | Electricity arc (the bolt is the hit) | electricity {targetUid, arcUid, wetTarget} | SkillFX.lightning; 2026-10-16: the bolt is the hit: a yellow ⚡ number as it lands, a ⚡ burst and a pale-blue flash | good — has its own look that plays at the right moment | live (a.js, x17.js) | 2 |
| `sk-chain-lightning` | Chain Lightning (the jumps) | chainLightning event, then each jump's hit {chainLightning, jump, viaUid} | lightningBoltOf → SkillFX.lightning (plain bolt) per jump; "⚡ -N" pops as each jump lands | good — has its own look that plays at the right moment | live (x17.js) | 2 |
| `sk-shock-bolt` | Shock bolt (a lightning shot) | bolt {element:shock}: its hit | a straight bolt shooter → target (lightningBoltOf), no glob; "⚡ -N" as it lands | good — has its own look that plays at the right moment | live (x17.js) | 2 |
| `sk-lightning-passive` | Lightning (passive) charges | statusFx lightning {amount} | none (no renderer branch) | missing — engine pushes it, front end ignores it | live (a.js, x17.js) | 2 |
| `sk-fireball` | Fireball | fireball {targetUid\|castle, uids} | SkillFX.fireball + burnAway sound | good — has its own look that plays at the right moment | live (a.js) | 2 |
| `sk-meteor` | Meteor | meteor {targetUid\|castle, sideUids} | SkillFX.meteor + battlefieldShake + .meteor-crater | good — has its own look that plays at the right moment | live (a.js) | 2 |
| `sk-meteor-burn` | Meteor crater burns | meteorBurn {uid, dmg, left} | SkillFX.scorch + "☄️🔥-N"; crater removed at 0 | basic — crater is a CSS class only | live (a.js) | 3 |
| `sk-psychic` | Psychic mind-wave | psychic {dmg, immune} | SkillFX.mindWave + "💭 -N" / "💭 No mind" | good — has its own look that plays at the right moment | live (a.js) | 2 |
| `sk-smoke-bomb` | Smoke Bomb | smokeBomb {effect: smoke\|blind\|none} | SkillFX.smokeBomb lob + cloud | good — has its own look that plays at the right moment | live (a.js) | 3 |
| `sk-banana-throw` | Banana throw | banana {action:'throw'} | SkillFX.bananaThrow | good — has its own look that plays at the right moment | live (a.js) | 3 |
| `sk-banana-eat` | Banana / Bananarang munch | banana {action:'eat'} | SkillFX.munch + "🍌 Munch!" | good — has its own look that plays at the right moment | live (a.js) | 3 |
| `sk-durian` | Durian thorns up | durian {thorns, bonus} | SkillFX.munch (durian glyph) + "🌵 Thorns +1" | basic — a generic or reused look that does not say what happened | live (a.js) | 3 |
| `sk-chilli` | Chilli eaten | statusFx chilli | SkillFX.chilliHeat (red flush, steam) | good — has its own look that plays at the right moment | live (a.js) | 3 |
| `sk-bloodlust` | Bloodlust grows | statusFx bloodlust (its attack drew blood: +N Attack, up to +3N) | retired 2026-10-17: Bloodlust no longer grows (no statusFx bloodlust); it leaps on a kill (sk-bloodlust-leap) | good — has its own look that plays at the right moment | retired | 3 |
| `sk-coffee` | Coffee rush | statusFx coffee (−Wait) | SkillFX.clockTick fast + "☕ −N ⏳" | good — has its own look that plays at the right moment | live (a.js) | 3 |
| `sk-dynamite` | Dynamite blast | dynamite {amount, hits} | .dyn-blast + #battlefieldEl.dyn-shake + siegeTone | basic — CSS blast; SkillFX.dynamite (lobbed stick, fireball, debris) exists but is not used | live (a.js) | 2 |
| `sk-dynamite-fuse` | Dynamite fuse ticks | fuse {left} each round start | .fuse-badge text update; .is-last (fuseLast) on 1 | basic — no fizzing spark on the card | live (a.js) | 3 |
| `sk-explode` | Explode (lit fuse ends) | explode {uid} (Explode N skill) | shakeEl + "💥 Boom!" + SoundKit.boom | basic — a small shake for a self-destruct | live (a.js) | 1 |
| `sk-rocket` | Rocket | statusFx rocket | "🚀 Rocket!" float | basic — float only | live (a.js) | 3 |
| `sk-rally` | Rally | rally {amount} | .rally-pulse + "🚩 Rally!" + rallyTone | basic — SkillFX.rally (prototype banner) not wired | live (a.js) | 2 |
| `sk-inspired` | Inspiring (+Attack next swing) | statusFx inspired | SkillFX.espritAura + "📯 +N⚔ next swing" | good — has its own look that plays at the right moment | live (a.js) | 3 |
| `sk-esprit` | Esprit | statusFx esprit | SkillFX.espritAura + "🤝" float | good — has its own look that plays at the right moment | live (a.js) | 3 |
| `sk-grit` | Grit | statusFx grit | SkillFX.espritAura + gritUp | good — has its own look that plays at the right moment | live (a.js) | 3 |
| `sk-momentum` | Momentum | statusFx momentum | "🔥 +N⚔" float + momentumTone | basic — float only | live (a.js) | 3 |
| `sk-berserk` | Berserk | statusFx berserk | SkillFX.rageFlare + shake + float | good — has its own look that plays at the right moment | live (a.js) | 3 |
| `sk-hive-mind` | Hive Mind (retired) | statusFx berserk {hiveMind:true} | rageFlare | good — retired 2026-10-15; keep working for old cards | live (a.js) | 3 |
| `sk-pack` | Pack bonus | statusFx pack | statChangeVfx + "🐺 Pack!" | basic — float only | live (a.js) | 3 |
| `sk-heal-generic` | Heal (Healing passive / Heal action) | heal {amount, cause} | healTone + "+N❤" float | basic — number only for most heals | live (_existing.js, a.js, w2.js) | 2 |
| `sk-regen` | Regeneration | heal where attUid===targetUid | 2026-10-17: SkillFX.regen about 40% faster (motes, stagger, pluses, glow) | good — has its own look that plays at the right moment | live (a.js) | 3 |
| `sk-bloom` | Bloom heals an ally 🎨 | heal from a Bloom unit to another | SkillFX.bloomPollen + bloomTone | good — has its own look that plays at the right moment | live (a.js) | 3 |
| `sk-sap` | Leech (Sap) drain | sap {amount} | 2026-10-17: the engine's Sap is the Leech skill ("+ Add Skill", a card line, the 🧛 chip); SkillFX.lifeDrain with half-size drops (10-16) | good — has its own look that plays at the right moment | live (a.js) | 3 |
| `sk-render` | Render (Attack drain) | render {amount} | SkillFX.curseDrain + float | good — has its own look that plays at the right moment | live (a.js) | 3 |
| `sk-gash` | Gash opening cut | gash {amount} | SkillFX.bleedDrip + "+N🩸" | good — has its own look that plays at the right moment | live (a.js) | 3 |
| `sk-revive` | Revivificated | revive | SkillFX.reviveRise + "✨ Revived!" | good — has its own look that plays at the right moment | live (a.js) | 2 |
| `sk-shield-up` | Shield gained | statusFx unitShield {amount,total} | SkillFX.shieldUp + "💠 +N" | good — has its own look that plays at the right moment | live (_existing.js) | 3 |
| `sk-shield-soak` | Shield soaks damage | shieldSoak {soaked, left} | "💠 -N" float | basic — no shield flare on impact | live (a.js) | 2 |
| `sk-shield-break` | Shield breaks | shieldSoak with left 0 | "💠 Shield breaks" float | basic — should shatter visibly | live (a.js) | 2 |
| `sk-shell-up` | Shell up | statusFx shellUp | .shell-sweep + .shell-up glow + shellUp tone | good — has its own look that plays at the right moment | live (a.js) | 3 |
| `sk-shell-down` | Shell ends | statusFx shellDown | none (snapshot only) | missing — shell vanishes silently | live (a.js) | 3 |
| `sk-shield-call` | Shield Call | spawn {cause:'shieldCall'} | SkillFX.shieldDrop + shieldDrop sound | good — has its own look that plays at the right moment | live (_existing.js) | 3 |
| `sk-helmet` | Helmet deflects | deflect | SkillFX.helmetDeflect + "🪖 Deflect!" | good — has its own look that plays at the right moment | live (a.js) | 3 |
| `sk-nullify` | Nullify | statusFx nullify | .nullify-flash + "🚫 Nullified" | basic — a generic or reused look that does not say what happened | live (a.js) | 3 |
| `sk-cleanse` | Cleanse | statusFx cleanse | cleanseVfx (rising band + motes) + float | good — has its own look that plays at the right moment | live (a.js) | 3 |
| `sk-stanch` | Stanch bleeding | statusFx stanch | cleanseVfx + "🩹 -N 🩸" | good — has its own look that plays at the right moment | live (a.js) | 3 |
| `sk-buff-action` | Buff action (namedBuff) | namedBuff {amount, amount2} | statChangeVfx + SkillFX.espritAura + buffUp | good — has its own look that plays at the right moment | live (a.js) | 3 |
| `sk-debuff-action` | Debuff Attack | statusFx debuffAttack | SkillFX.curseDrain + statChangeVfx | good — has its own look that plays at the right moment | live (a.js) | 3 |
| `sk-mind-control` | Mind Control | mindControl {targetUid, slot} | SkillFX.mindWave (reused) then board re-render | basic — the unit just reappears on your side; no crossing / puppet strings | live (a.js) | 1 |
| `sk-swap` | Swap / Scurry | swapPositions {aUid,bUid} | "🔀 Scurry!" floats + re-render (Flip glide) | basic — a generic or reused look that does not say what happened | live (a.js) | 3 |
| `sk-converge` | Converge pulls a line together | converge {moves} | "🧲 Converge!" + glide | basic — a generic or reused look that does not say what happened | live (a.js) | 3 |
| `sk-restless` | Restless move | restless {from,to,swapUid} | "👣" float + glide | basic — a generic or reused look that does not say what happened | live (a.js) | 3 |
| `sk-stun-player` | Player Stun (enemy skips their turn) | stunPlayer {turns} | none (battle log only) | missing — a whole skipped turn has no on-screen cue | live (a.js) | 1 |
| `sk-exile-board` | Exile a unit from the board | statusFx exile → exile {zone:'board'} | SoundKit.exile only; the card just disappears | missing — no banish visual for a removal | live (a.js, c.js) | 1 |
| `sk-exile-zone` | Exile from hand / graveyard (Prayer, Exile Grave) | exile {zone:'hand'\|'graveyard', prayer} | SoundKit.exile only | missing — nothing on screen | live (a.js) | 3 |
| `sk-echo-gain` | Echo 🕯️ gained (card exiled) | pl.echoes += 1 on exile (no event) | none | missing — the Exile zone counter grows silently | live (f.js) | 3 |
| `sk-remember` | Remember (returns from Exile) | remember {spent, uid} | "🕯️ +N/+N" float (plus spawn entrance) | basic — a generic or reused look that does not say what happened | live (a.js) | 2 |
| `sk-gain-resource` | Gain resource (Lumber/Grace/Devilry/Stone/Metal/Uranium) 🎨 | lumber / grace / devilry / stone / metal / uranium events with uid | floatResourceGain (float + .hud-pill.bing); Lumber also SkillFX.lootArc | basic — only Lumber has a travelling arc | live (f.js) | 2 |
| `sk-elemental-energy` | Elemental Energy gain | elementalEnergy {amount} | floatResourceGain ✨ | basic — a generic or reused look that does not say what happened | live (f.js) | 3 |
| `sk-refine-action` | Refine action | trigger action refine (ore) | floatResourceGain | basic — a generic or reused look that does not say what happened | live (f.js) | 3 |
| `sk-spell-card` | Spell card cast (Hasten / Tailwind / Mend / Sap) | spell {action, targets} | toast + per-target floats + trigger sound | basic — no cast animation from the hand | live (a.js) | 2 |
| `sk-devour` | Devour | devour {eatenDefId, attack, health} | float on play (+ battle log) | basic — no gulp | live (a.js) | 2 |
| `sk-equip` | Equip an Equipment card | equip {equipDefId, attack, health} | none (battle log only) | missing — nothing on screen | live (a.js) | 2 |
| `sk-sacrifice` | Dark Summon sacrifice | sacrifice + statusFx sacrificed | .sac-chomp jaws (+ "🦷 Sacrifice") | basic — sacrifice event itself is log-only | live (a.js) | 2 |
| `sk-fast-forward` | Fast Forward extra turn | fastForward {n} | .ff-blur afterimages + "⏩ ×N" | good — has its own look that plays at the right moment | live (a.js) | 3 |
| `sk-midas` | Midas Touch | lumber {cause:'midas'} on kill | floatResourceGain | basic — a generic or reused look that does not say what happened | live (f.js) | 3 |
| `sk-worthy` | Worthy loot | lumber {cause:'worthy'\|'worthyDeath'} | retired 2026-10-16: Worthy is Bounty everywhere (an empty, hidden slot); its loot is Bounty's +🪵 | good — has its own look that plays at the right moment | retired | 3 |
| `sk-resource-passive` | Resource passives (Lumberjack, Timber, Heavy Metal, Rock-solid, Iron-will) | pitch/gain rules with no event | none | missing — no moment shown when the bonus applies | live (f.js) | 3 |
| `sk-satiety` | Satiety | statusFx satiety | none (log only) | missing — nothing on screen | live (a.js) | 3 |
| `sk-shed` | Shedding / Molting | statusFx shed {molt} | "🐍 +1/+1" float | basic — no skin peeling; statuses drop silently | live (a.js, w2.js) | 2 |
| `sk-first-blood` | First Blood | statusFx firstBlood | "🩸 First blood +N" float | basic — a generic or reused look that does not say what happened | live (a.js) | 3 |
| `sk-bludgeon` | Bludgeon breaks a trait | statusFx bludgeon {broke} | "🔨 X broken" float | basic — a generic or reused look that does not say what happened | live (a.js, w2.js) | 3 |
| `sk-immolation-src` | Immolation source pulse | fieldTick immolation (srcUid) | .immolate-pulse + SkillFX.scorch on victims | good — has its own look that plays at the right moment | live (a.js) | 3 |
| `sk-irradiated-src` | Irradiated source pulse | fieldTick irradiated (srcUid) | .irradiate-pulse + geiger | basic — a generic or reused look that does not say what happened | live (a.js) | 3 |
| `sk-wither` | Wither applied | statusFx wither | "💀 Wither" + witherSmokeVfx | good — has its own look that plays at the right moment | live (a.js) | 2 |
| `sk-ichor` | Ichor | statusFx ichor | SkillFX.acidCorrode + "🧪 −N" + recoilEl | good — has its own look that plays at the right moment | live (a.js) | 3 |
| `sk-frostbite` | Frostbite grows a chilled unit | statusFx frostbite | SkillFX.frostChill + float | good — has its own look that plays at the right moment | live (a.js) | 3 |
| `sk-keen-eye-unmask` | Keen Eye reveals a Changeling | changeling hidden while a Keen Eye ally is on the viewer's side | disguise simply not applied | missing — no reveal moment | live (a.js) | 3 |
| `sk-changeling-unmask` | Changeling unmasked | unmaskChangeling on first hit/attack | .changeling-unmask (clUnmask) | good — has its own look that plays at the right moment | live (a.js) | 3 |
| `sk-desecrate` | Desecrate curses a cell | curse {cell, total} | none (battle log only) | missing — the cursed ground is invisible | live (a.js) | 2 |
| `sk-curse-tick` | Cursed ground deals damage | curseTick {dmg} | SkillFX.curseDrain (once/round) + "🜏-N" | good — has its own look that plays at the right moment | live (a.js) | 3 |
| `sk-conditional-stats` | Conditional stat skills (Kinship, Loyal, Usurper, Lone Wolf, Sociable, Defiance, Pack chain) | statusFx phaseGrow/phaseFade via condStatsOf in syncPhaseStats | phase aura/burst (day-night look reused) + statChangeVfx | basic — reads as day/night, not as the condition | live (a.js) | 3 |
| `sk-dry-spared` | Dry / heat-resistant unit spared by Scorching | heatwave fieldTick skips resistant units (no event) | none | missing — no "spared" cue | live (a.js) | 3 |
| `sk-demolisher` | Demolisher bonus vs structures | damage multiplier vs Structure (no event) | none | missing — nothing on screen | live (a.js) | 3 |
| `sk-supreme-strike` | Supreme beast strike (magic, crushes Armor/Ward) | hit by a Supreme unit | none distinct | missing — design says Supreme attacks sparkle | live (a.js) | 2 |
| `sk-armor-shred` | Perforate shreds Armor for good | statusFx armorShred | SkillFX.armorBlock {shatter} + "−N🛡 for good" + rendTone | good — has its own look that plays at the right moment | live (a.js) | 3 |
| `sk-prayer` | Prayer card arrives / Grace from a card | play of a Prayer card; grace {uid} | SkillFX.prayerLight (beam + dove) | good — has its own look that plays at the right moment | live (a.js) | 3 |
| `sk-rainrunner` | Rainrunner charges past the line in the rain | Rainrunner unit while it rains: +N/+N and unblockable (goes straight for the castle) | normal castle hit | missing — nothing says why it ignored the blocker | live (a.js) | 3 |
| `sk-venom` | Venomous bite | statusFx venom | SkillFX.venomBite (fangs, venom drips) + "🦂 +N☠" | good — has its own look that plays at the right moment | live (w2.js) | 2 |
| `sk-toxin` | Toxin applied | statusFx toxin | SkillFX.toxinMark (closing toxic ring, ☣️) + .is-toxic inner glow | good — has its own look that plays at the right moment | live (w2.js) | 2 |
| `sk-weaken` | Weaken | statusFx weaken | SkillFX.weakenDrain (a ⚔ cracks and sinks) + "💔 −N⚔" | good — has its own look that plays at the right moment | live (w2.js) | 2 |
| `sk-wilting` | Wilting | statusFx wilting | SkillFX.wilt (petals drop, the card sags) + "🥀 −N⚔" | good — has its own look that plays at the right moment | live (w2.js) | 2 |
| `sk-bulldoze` | Bulldoze shove | statusFx bulldoze | SkillFX.bulldozeShove (shoved back, dust) + "🚜 ⏪ +N Wait" | good — has its own look that plays at the right moment | live (w2.js) | 2 |
| `sk-bind` | Tangleweed / Strangle bind | statusFx bound | SkillFX.vineBind (vines whip round) + .is-bound vines while Bound | good — has its own look that plays at the right moment | live (w2.js) | 2 |
| `sk-invincible` | Invincible | hit for 0 on an Invincible unit; .is-invincible | gold aura (.is-invincible) + SkillFX.invincibleBlock | good — has its own look that plays at the right moment | live (w2.js) | 2 |
| `sk-invisible` | Invisible | .is-invisible; statusEnd invisible {attacked} | faint shimmer (.is-invisible) + SkillFX.unveil when it attacks | good — has its own look that plays at the right moment | live (w2.js) | 2 |
| `sk-poison-gas` | Poison Gas | poisonGas (on arrival) | SkillFX.gasCloud over every enemy unit + "+N☠" | good — has its own look that plays at the right moment | live (w2.js) | 2 |
| `sk-absolute-zero` | Absolute Zero | absoluteZero (on arrival) | SkillFX.absoluteZero: a field-wide frost flash, frost blooms; then the Frozen look | good — has its own look that plays at the right moment | live (w2.js) | 2 |
| `sk-spitfire` | Spitfire | bolt {element fire, key spitfire} | SkillFX.boltGlob fire at a random enemy (shared with Fire Bolt) | good — has its own look that plays at the right moment | live (w2.js) | 2 |
| `sk-trap-set` | Trap / burning ground set | hazardSet | SkillFX.trapSet on the empty slot; the slot keeps a 🪤 / 🔥 mark | good — has its own look that plays at the right moment | live (w2.js) | 2 |
| `sk-trap-snap` | Trap / burning ground sprung | hazardSprung | SkillFX.trapSnap (jaws / embers) + "🪤 -N" | good — has its own look that plays at the right moment | live (w2.js) | 2 |
| `sk-nova` | Nova | nova (on death) | SkillFX.nova: a violet ring, orbs to every enemy unit | good — has its own look that plays at the right moment | live (w2.js) | 2 |
| `sk-crystallise` | Crystallise | spawn {kind crystal} | SkillFX.crystalForm + the .is-crystal tint | good — has its own look that plays at the right moment | live (w2.js) | 2 |
| `sk-cure` | Cure | statusFx cure | SkillFX.cure (💊 and sparkles) + "💊 Cured N" | good — has its own look that plays at the right moment | live (w2.js) | 2 |
| `sk-taunt` | Taunt | statusFx taunted | SkillFX.tauntCall (gold calls, the attacker turns) | good — has its own look that plays at the right moment | live (w2.js) | 2 |
| `sk-penance` | Penance (Devilry payment) | penance {side, dmg} when the card is played | devilPayVfx → devilPulse: a dark ⛧ sinks into your own castle + "⛧ -N" | good — has its own look that plays at the right moment | live (x17.js) | 2 |
| `sk-blood-tithe` | Blood Tithe (Devilry payment) 🎨 | bloodTithe {targetUid \| castle, dmg} when the card is played | devilPayVfx → devilPulse on the ally that pays (your castle with none) + "⛧ -N" | good — has its own look that plays at the right moment | live (x17.js) | 2 |
| `sk-amore` | Amore: a pair falls in love | amore {uid, mateUid, hp, regen}: two Amore units of yours sharing a Type | skills2Vfx: hearts drift both ways (floatGlyphs) + "💕 +0/+3" on each | good — has its own look that plays at the right moment | live (x17.js) | 2 |
| `sk-amore-broken` | Amore: heartbroken | amoreBroken {uid} when its partner dies | skills2Vfx: "🤎 Heartbroken" + a brown heart and a broken one rise | good — has its own look that plays at the right moment | live (x17.js) | 2 |
| `sk-scavenge` | On Pitch trigger ("Scavenge") | triggerFired {hook:onPitch} on each of your On Pitch units when you pitch a card | triggerFiredVfx: the unit's ♻️ badge glows, then the action | good — has its own look that plays at the right moment | live (x17.js) | 2 |
| `sk-lumber-burn` | Burn 1 Lumber (a trigger's cost) | lumberBurn {side, uid} | skills2Vfx: "🔥 -1" on your Lumber pill and an ember flies to the unit | good — has its own look that plays at the right moment | live (x17.js) | 2 |
| `sk-fire-on-hit` | Fire on hit (trigger action) | fireHit {targetUid \| castle, dmg} with the attack's hit | skills2Vfx: "🔥 -N" and two flames on what it hit, at the impact | good — has its own look that plays at the right moment | live (x17.js) | 2 |
| `sk-pounce-stat` | Pounce <Att> / <Hp> 🎨 | a Pounce whose amount is the card's Attack or Health | the Pounce leap (SkillFX.pounceOnto) with that number; the card text's live number is blue | good — has its own look that plays at the right moment | live (x17.js) | 2 |
| `sk-vanguard` | Vanguard 🎨 | statusFx vanguard (first card of the game: +N/+N); vanguard (opening hand) is a log line | s17SkillVfx: "🎖️ +N/+N" 0.38 s after the play | basic — the buff float; the opening-hand move is only a battle-log line | live (x17.js) | 2 |
| `sk-web` | Web (Webbed status) 🎨 | statusFx webbed on the unit its hit lands on; statusEnd webbed | s17SkillVfx: "🕸️ Webbed" + SkillFX.vineBind; the 🕸️N status badge (w2StatusBadges) | good — has its own look that plays at the right moment | live (x17.js) | 2 |
| `sk-bloodlust-leap` | Bloodlust leap | bloodlustLeap {uid, from, to} after it kills the unit facing it | s17SkillVfx: the unit moves to its new slot, "🩸 Leap!", a red push (.wave-pushed) and SkillFX.bloodlustPulse({full}) | good — has its own look that plays at the right moment | live (x17.js) | 2 |
| `sk-sentry` | Sentry | sentry {uid, targetUid} when an enemy enters one of the 3 slots facing it (once a round, while Ready) | s17SkillVfx: "🗼 Sentry!" + ambushTone, then its strike | good — has its own look that plays at the right moment | live (x17.js) | 2 |
| `sk-carrion` | Carrion | statusFx carrion when another unit dies | s17SkillVfx: "🦴 +N" (heal) | good — has its own look that plays at the right moment | live (x17.js) | 2 |
| `sk-hoard` | Hoard (passive) | Hoard N: +1 Attack per N Lumber you hold (no event of its own) | its chip on the skill strip (CHIP_FALLBACK_SKILLS) and the bigger number | basic — the chip and the number; no look of its own | live (x17.js) | 3 |
| `sk-venom-master` | Venom Master (passive) | Venom Master N: your units' Poison and Bleed hits add N more (no event of its own) | its chip on the skill strip (CHIP_FALLBACK_SKILLS) and the bigger number | basic — the chip and the number; no look of its own | live (x17.js) | 3 |
| `sk-fletcher` | Fletcher (passive) | Fletcher N: your units' arrows deal N more (no event of its own) | its chip on the skill strip (CHIP_FALLBACK_SKILLS) and the bigger number | basic — the chip and the number; no look of its own | live (x17.js) | 3 |
| `sk-herbalist` | Herbalist (passive) | Herbalist N: every heal on your units heals N more (no event of its own) | its chip on the skill strip (CHIP_FALLBACK_SKILLS) and the bigger number | basic — the chip and the number; no look of its own | live (x17.js) | 3 |
| `sk-shatter` | Shatter (passive) | Shatter N: +N damage to Frozen units (no event of its own) | its chip on the skill strip (CHIP_FALLBACK_SKILLS) and the bigger number | basic — the chip and the number; no look of its own | live (x17.js) | 3 |
| `sk-atheist` | Atheist | leylinesHit {atheist} (the Leylines' burn skips it); half damage from magic, Devilry and Ecclesia | field2Vfx: "✴️ Atheist" instead of a number; its 🚫✨ chip | good — has its own look that plays at the right moment | live (x17.js) | 3 |
| `sk-wave-bob` | Wave / Awash: boxed in (it bobs) | wave {blocked, bob, touchUids} | SkillFX.waveBob: the crest rolls in from behind, under the card and past it; the card rises and settles back; the units beside it rock a little as the water reaches them | good — has its own look that plays at the right moment | live (wave17.js) | 2 |
| `sk-rebuild` | Rebuild N (passive) / Rebuild castle N (trigger action) | rebuild {side, uid, defId, amount, n, trigger}: the passive every upkeep while Ready (endOfRoundUpkeep, beside onReadyGold), the action whenever its trigger fires | rebuildVfx: planks and stones (🪵🧱🪨) fly from the builder into its castle (floatGlyphs), the castle thunks, a green "🔨 +N" pops on that side's HP bar (hqRibbonFloatAnchor) as the bar fills (displayHqHp during the replay); woodKnock + healTone; log "🔨🏰 X rebuilds your castle: +N Health" | good — has its own look that plays at the right moment | live (rebuild17.js) | 2 |

### Statuses (`status`, 107)

| id | name | trigger | current | quality | status | P |
|---|---|---|---|---|---|--:|
| `st-poison-apply` | Poison: applied | statusFx poison (on-hit Poison, Poison action, Poison Bolt) | "+N☠" float + poisonApply | basic — number only; poisonCloud plays only on the tick | live (b.js) | 1 |
| `st-poison-active` | Poison: while active (on the card) | board card has the Poison status (updateCardStatusDisplay / boardCardHTML classes) | .is-poisoned + ☠N badge | basic — badge and tint only | live (d.js) | 2 |
| `st-poison-tick` | Poison: tick | poisonTick {dmg, decay} | shakeEl + poison-tint-pulse + poisonBubbleBurstVfx + SkillFX.poisonCloud (once/round) | good — bubbles, green cloud | live (b.js, p1.js) | 2 |
| `st-poison-expire` | Poison: wears off | endOfRoundUpkeep counter reaches 0 (no event pushed) | none (overlay disappears on the next status sync) | missing — stacks decay one by one with no cue; reaching 0 is silent | live (c.js) | 3 |
| `st-bleed-apply` | Bleed: applied | statusFx bleed / gash | "+N🩸" float + bleedApply | basic — number only | live (b.js) | 1 |
| `st-bleed-active` | Bleed: while active (on the card) | board card has the Bleed status (updateCardStatusDisplay / boardCardHTML classes) | .is-bled + 🩸N badge + bleed tint | basic — a generic or reused look that does not say what happened | live (d.js) | 2 |
| `st-bleed-tick` | Bleed: tick | bleedTick {dmg, cause, decay} | shakeEl + bleed-tint-pulse + SkillFX.bleedDrip | good — has its own look that plays at the right moment | live (b.js) | 2 |
| `st-bleed-expire` | Bleed: wears off | endOfRoundUpkeep counter reaches 0 (no event pushed) | none (overlay disappears on the next status sync) | missing — nothing on screen | live (c.js) | 3 |
| `st-decay-apply` | Decay: applied | hit by a Decay unit (card.decay += N; no statusFx event) | none | missing — Decay stacks land silently | live (b.js) | 2 |
| `st-decay-active` | Decay: while active (on the card) | board card has the Decay status (updateCardStatusDisplay / boardCardHTML classes) | no badge/tint | missing — nothing on screen | live (d.js) | 2 |
| `st-decay-tick` | Decay: tick | decayTick {dmg, atk} | shakeEl + bleed-tint-pulse + "🦠 N! (−A⚔)" | basic — reuses the bleed tint | live (b.js) | 2 |
| `st-decay-expire` | Decay: wears off | endOfRoundUpkeep counter reaches 0 (no event pushed) | none (overlay disappears on the next status sync) | missing — nothing on screen | live (c.js) | 3 |
| `st-freeze-apply` | Freeze: applied | statusFx freeze (on-hit Freeze, Ice Bolt, Ice Arrow) | SkillFX.freezeEncase + shakeEl + "❄ Frozen" + freezeChime | good — ice grows over the card | live (_existing.js, b.js) | 2 |
| `st-freeze-active` | Freeze: while active (on the card) | board card has the Freeze status (updateCardStatusDisplay / boardCardHTML classes) | .is-frozen frost creep ::after + .frost-flakes + icy Wait clock | good — has its own look that plays at the right moment | live (d.js) | 2 |
| `st-freeze-tick` | Freeze: tick | statusFx thaw {left} (a freeze counter melts each upkeep) | "❄ Thawed" float at 0 only | basic — no per-counter melt drip | live (b.js) | 2 |
| `st-freeze-expire` | Freeze: wears off | endOfRoundUpkeep counter reaches 0 (no event pushed) | none (overlay disappears on the next status sync) | basic — thaw float exists but the ice never cracks off | live (c.js) | 3 |
| `st-freeze-skip` | Frozen unit skips its turn | skipTurn {reason:'frozen'} | none (log only) | missing — no "can't move" cue | live (c.js) | 2 |
| `st-freeze-field` | Frigid field adds a freeze counter | fieldTick {field:'frozen', freeze:1} | coldWave + icePulseVfx + SkillFX.frostChill | good — has its own look that plays at the right moment | live (b.js, p1.js) | 2 |
| `st-sleep-apply` | Sleep: applied | statusFx sleep (poison-type on-hit Sleep) | SkillFX.sleepZzz + "💤 Asleep" | good — has its own look that plays at the right moment | live (_existing.js, b.js) | 2 |
| `st-sleep-active` | Sleep: while active (on the card) | board card has the Sleep status (updateCardStatusDisplay / boardCardHTML classes) | .sleep-overlay (sleepBob) + 💤N badge | good — has its own look that plays at the right moment | live (d.js) | 2 |
| `st-sleep-expire` | Sleep: wears off | endOfRoundUpkeep counter reaches 0 (no event pushed) | none (overlay disappears on the next status sync) | missing — nothing on screen | live (c.js) | 3 |
| `st-sleep-skip` | Asleep unit skips its turn | skipTurn {reason:'asleep'} | none (log only) | missing — nothing on screen | live (c.js) | 2 |
| `st-sleep-wake` | Woken by damage | damage breaks sleep (no event) | none | missing — the Zzz just vanish; should startle awake | live (c.js) | 2 |
| `st-paralyze-apply` | Paralyze: applied | statusFx paralyze | SkillFX.paralyzeSpark + shake + "⚡ Paralyzed" | good — has its own look that plays at the right moment | live (b.js) | 2 |
| `st-paralyze-active` | Paralyze: while active (on the card) | board card has the Paralyze status (updateCardStatusDisplay / boardCardHTML classes) | .paralyze-overlay (paralyzeJitter) | good — has its own look that plays at the right moment | live (d.js) | 2 |
| `st-paralyze-expire` | Paralyze: wears off | endOfRoundUpkeep counter reaches 0 (no event pushed) | none (overlay disappears on the next status sync) | missing — nothing on screen | live (c.js) | 3 |
| `st-paralyze-coinflip` | Paralyze coin flip fails | skipTurn {reason:'paralyzed'} | none (log only) | missing — the coin flip itself is never shown | live (c.js) | 1 |
| `st-stun-apply` | Stun: applied | statusFx stun: a landed hit of a Stun N unit (1 in 3) | 2026-10-16: Stun N: each landed hit has a 1 in 3 chance to Stun for N rounds (the old % values read as Stun 1); same look | good — has its own look that plays at the right moment | live (_existing.js, b.js) | 2 |
| `st-stun-active` | Stun: while active (on the card) | board card has the Stun status (updateCardStatusDisplay / boardCardHTML classes) | .stun-overlay.stun-halo (stunHaloSpin) | good — has its own look that plays at the right moment | live (d.js) | 2 |
| `st-stun-expire` | Stun: wears off | endOfRoundUpkeep counter reaches 0 (no event pushed) | none (overlay disappears on the next status sync) | missing — nothing on screen | live (c.js) | 3 |
| `st-stun-skip` | Stunned unit skips its turn | skipTurn {reason:'stunned'} | none (log only) | missing — nothing on screen | live (c.js) | 2 |
| `st-stagger-apply` | Stagger: applied | statusFx stagger (physical on-hit) | SkillFX.stunStars ✦ + "💢 Staggered" | good — has its own look that plays at the right moment | live (b.js) | 2 |
| `st-stagger-active` | Stagger: while active (on the card) | board card has the Stagger status (updateCardStatusDisplay / boardCardHTML classes) | .stagger-overlay (staggerWobble) | basic — a generic or reused look that does not say what happened | live (d.js) | 2 |
| `st-stagger-expire` | Stagger: wears off | endOfRoundUpkeep counter reaches 0 (no event pushed) | none (overlay disappears on the next status sync) | missing — nothing on screen | live (c.js) | 3 |
| `st-stagger-weak-hit` | Staggered unit deals half damage | hit by a staggered attacker (no flag on the event) | none | missing — the halved number is unexplained | live (b.js) | 3 |
| `st-blind-apply` | Blind: applied | statusFx blind (Blind on-hit, Smoke Bomb on an enemy) | SkillFX.blindInk + "👁 Blinded" | good — has its own look that plays at the right moment | live (b.js) | 2 |
| `st-blind-active` | Blind: while active (on the card) | board card has the Blind status (updateCardStatusDisplay / boardCardHTML classes) | .blind-overlay (blindDim) + 👁N badge | basic — overlay icon only | live (d.js) | 2 |
| `st-blind-expire` | Blind: wears off | endOfRoundUpkeep counter reaches 0 (no event pushed) | none (overlay disappears on the next status sync) | missing — nothing on screen | live (c.js) | 3 |
| `st-blind-keen-sense` | Keen Sense ignores Blind | rollStatusOnHit returns early (no event) | none | missing — nothing on screen | live (b.js) | 3 |
| `st-tipsy-apply` | Tipsy: applied | statusFx tipsy | SkillFX.stunStars 🫧 + "🍺 Tipsy" | good — has its own look that plays at the right moment | live (b.js) | 2 |
| `st-tipsy-active` | Tipsy: while active (on the card) | board card has the Tipsy status (updateCardStatusDisplay / boardCardHTML classes) | .is-tipsy (tipsySway) | good — has its own look that plays at the right moment | live (d.js) | 2 |
| `st-tipsy-expire` | Tipsy: wears off | endOfRoundUpkeep counter reaches 0 (no event pushed) | none (overlay disappears on the next status sync) | missing — nothing on screen | live (c.js) | 3 |
| `st-confuse-apply` | Confuse: applied | statusFx confuse | SkillFX.stunStars ❓ + "❓ Confused" | good — has its own look that plays at the right moment | live (b.js) | 2 |
| `st-confuse-active` | Confuse: while active (on the card) | board card has the Confuse status (updateCardStatusDisplay / boardCardHTML classes) | .is-confused (confusedHue) | basic — a generic or reused look that does not say what happened | live (d.js) | 2 |
| `st-confuse-expire` | Confuse: wears off | endOfRoundUpkeep counter reaches 0 (no event pushed) | none (overlay disappears on the next status sync) | missing — nothing on screen | live (c.js) | 3 |
| `st-shock-apply` | Shock: applied | statusFx shock (Shock on-hit, Shock Bolt) | glitchVfx + shake + "🌩 Shocked" | good — has its own look that plays at the right moment | live (b.js) | 2 |
| `st-shock-active` | Shock: while active (on the card) | board card has the Shock status (updateCardStatusDisplay / boardCardHTML classes) | .is-shocked + .shock-overlay + .shock-arcs | good — has its own look that plays at the right moment | live (d.js) | 2 |
| `st-shock-expire` | Shock: wears off | endOfRoundUpkeep counter reaches 0 (no event pushed) | none (overlay disappears on the next status sync) | missing — nothing on screen | live (c.js) | 3 |
| `st-shock-bonus-dmg` | Shocked unit takes +50% damage | hit on a shocked target (no flag on the event) | none | missing — the bigger number is unexplained | live (b.js) | 2 |
| `st-corrode-apply` | Corrode: applied | statusFx corrode (Corrode passive, Acid Bolt) | SkillFX.acidCorrode + "-N⚔ 🧪" | good — has its own look that plays at the right moment | live (b.js) | 2 |
| `st-corrode-active` | Corrode: while active (on the card) | board card has the Corrode status (updateCardStatusDisplay / boardCardHTML classes) | .is-corroded tint | basic — a generic or reused look that does not say what happened | live (d.js) | 2 |
| `st-corrode-expire` | Corrode: wears off | endOfRoundUpkeep counter reaches 0 (no event pushed) | none (overlay disappears on the next status sync) | missing — nothing on screen | live (c.js) | 3 |
| `st-expose-apply` | Expose: applied | statusFx expose (Expose action / passive) | SkillFX.targetMark + "🎯 Exposed" | good — has its own look that plays at the right moment | live (b.js) | 2 |
| `st-expose-active` | Expose: while active (on the card) | board card has the Expose status (updateCardStatusDisplay / boardCardHTML classes) | none (c.exposed has no class or badge) | missing — an exposed unit looks normal | live (d.js) | 2 |
| `st-expose-expire` | Expose: wears off | endOfRoundUpkeep counter reaches 0 (no event pushed) | none (overlay disappears on the next status sync) | missing — nothing on screen | live (c.js) | 3 |
| `st-expose-bonus-hit` | Hit on an Exposed unit | hit on a target with exposed>0 (no flag) | none | missing — nothing on screen | live (b.js) | 3 |
| `st-daunt-apply` | Daunt: applied | statusFx daunt (−Attack until end of next round) | SkillFX.fearShiver + "😨 −N⚔" | good — has its own look that plays at the right moment | live (b.js) | 2 |
| `st-daunt-active` | Daunt: while active (on the card) | board card has the Daunt status (updateCardStatusDisplay / boardCardHTML classes) | none (rc.daunts only) | missing — nothing on screen | live (d.js) | 2 |
| `st-daunt-expire` | Daunt: wears off | endOfRoundUpkeep counter reaches 0 (no event pushed) | none (overlay disappears on the next status sync) | missing — nothing on screen | live (c.js) | 3 |
| `st-wither-apply` | Wither: applied | statusFx wither | witherSmokeVfx + "💀 Wither" | good — has its own look that plays at the right moment | live (b.js) | 2 |
| `st-wither-active` | Wither: while active (on the card) | board card has the Wither status (updateCardStatusDisplay / boardCardHTML classes) | none | missing — no lingering black veins between ticks | live (d.js) | 2 |
| `st-wither-tick` | Wither: tick | witherTick {n, left} | witherSmokeVfx + "💀 −N" (max HP drops) | good — has its own look that plays at the right moment | live (b.js) | 2 |
| `st-wither-expire` | Wither: wears off | endOfRoundUpkeep counter reaches 0 (no event pushed) | none (overlay disappears on the next status sync) | missing — nothing on screen | live (c.js) | 3 |
| `st-irradiation-apply` | Irradiation tokens: applied | fieldTick irradiated {tokens,total} / irradiation event | "☢️ +N" float + geiger; source .irradiate-pulse | basic — a generic or reused look that does not say what happened | live (b.js) | 2 |
| `st-irradiation-active` | Irradiation tokens: while active (on the card) | board card has the Irradiation tokens status (updateCardStatusDisplay / boardCardHTML classes) | ☢ count in status badges only | basic — no glow on an irradiated unit | live (d.js) | 2 |
| `st-irradiation-tick` | Irradiation tokens: tick | irradiation {points, left} (each token eats HP/Atk/a skill) | .irradiate-pulse + "☢️ −N❤ −N⚔ −skill" + radSizzle | basic — skill loss is a word | live (b.js) | 2 |
| `st-irradiation-expire` | Irradiation tokens: wears off | endOfRoundUpkeep counter reaches 0 (no event pushed) | none (overlay disappears on the next status sync) | missing — nothing on screen | live (c.js) | 3 |
| `st-smoke-apply` | Smoke (Smoke Bomb on an ally): applied | smokeBomb {effect:'smoke'} | SkillFX.smokeBomb cloud + "🌫️ Smoke" | good — has its own look that plays at the right moment | live (b.js) | 2 |
| `st-smoke-active` | Smoke (Smoke Bomb on an ally): while active (on the card) | board card has the Smoke (Smoke Bomb on an ally) status (updateCardStatusDisplay / boardCardHTML classes) | .smoke-overlay (smokeDrift) + 🌫️ badge | good — has its own look that plays at the right moment | live (d.js) | 2 |
| `st-smoke-expire` | Smoke (Smoke Bomb on an ally): wears off | endOfRoundUpkeep counter reaches 0 (no event pushed) | none (overlay disappears on the next status sync) | missing — nothing on screen | live (c.js) | 3 |
| `st-scar-apply` | Scar: applied | statusFx scar | SkillFX.scarMark claw marks + "+N🗡" | good — has its own look that plays at the right moment | live (b.js) | 2 |
| `st-scar-active` | Scar: while active (on the card) | board card has the Scar status (updateCardStatusDisplay / boardCardHTML classes) | 🗡N badge | basic — a generic or reused look that does not say what happened | live (d.js) | 2 |
| `st-scar-expire` | Scar: wears off | endOfRoundUpkeep counter reaches 0 (no event pushed) | none (overlay disappears on the next status sync) | basic — scars are permanent (no expire); listed for completeness | live (c.js) | 3 |
| `st-chained-active` | Chained (starts chained) | card.chained (Chained skill) on the board | .chain-overlay (chainRattle) ⛓ | basic — a generic or reused look that does not say what happened | live (d.js) | 3 |
| `st-chained-skip` | Chained unit skips its turn | skipTurn {reason:'chained'} | none (log only) | missing — nothing on screen | live (c.js) | 3 |
| `st-chain-break` | Chain breaks | chainBreak {cause} | playChainBreakFlourish (chainSnap) + "⛓ Chain broken!" + chainBreak sound | good — has its own look that plays at the right moment | live (b.js) | 2 |
| `st-petrified-apply` | Petrification (volcano hazard) | fieldTick {field:'petrify'} | .is-petrified grey + "🪨 Stone" + thud | basic — instant grey; no stone creeping over | live (b.js) | 2 |
| `st-petrified-skip` | Petrified unit skips its turn | skipTurn {reason:'petrified'} | none (log only) | missing — nothing on screen | live (c.js) | 3 |
| `st-petrified-end` | Petrification wears off | round end (no event) | none (class removed on re-render) | missing — stone should crack off | live (c.js) | 3 |
| `st-cower-skip` | Cowering unit skips its turn | skipTurn {reason:'cower'} / statusFx cower | SkillFX.fearShiver + "🫣 Hides/Backs off" | good — has its own look that plays at the right moment | live (c.js) | 3 |
| `st-shell-skip` | Shelled unit skips its turn | skipTurn {reason:'shell'} | none (log only) | missing — nothing on screen | live (c.js) | 3 |
| `st-ritual-skip` | Ritual unit skips its turn | skipTurn {reason:'ritual'} | none (log only) | missing — nothing on screen | live (c.js) | 3 |
| `st-zero-attack-skip` | Unit with 0 Attack skips | skipTurn {reason:'zeroAttack'} | none (log only) | missing — nothing on screen | live (c.js) | 3 |
| `st-coffee-crash` | Coffee crash (stunned after the rush) | statusFx coffeeCrash | SkillFX.sleepZzz + "😴 Crash" | good — has its own look that plays at the right moment | live (b.js) | 3 |
| `st-chilli-burn` | Chilli sting each round | statusFx chilliBurn | SkillFX.chilliHeat {burn} + "🌶️ −N" | good — has its own look that plays at the right moment | live (b.js) | 3 |
| `st-inspired-spent` | Inspired bonus spent on the swing | next attack consumes c.inspired (no event) | none | missing — nothing on screen | live (b.js) | 3 |
| `st-rage-enter` | Rage turns on (<50% Health) | raging = rage && hp/maxHp<0.5 (render-time) | .board-card.raging (rage-pulse) + growl on hit | basic — no moment when it flips on | live (d.js) | 2 |
| `st-low-hp` | Low Health tremble (≤25%) | isLowHp(c) | .is-low-hp lowHpTremble + red number | good — has its own look that plays at the right moment | live (d.js) | 3 |
| `st-phase-grow` | Day/night bonus switches on (Nocturnal, Diurnal, Crepuscular, Moonborn) | statusFx phaseGrow {phase} | statChangeVfx + .phase-aura + .phase-burst + growthSwell (+ spores at night) | good — has its own look that plays at the right moment | live (d.js) | 2 |
| `st-phase-fade` | Day/night bonus switches off | statusFx phaseFade | statChangeVfx (stat-down float) and aura removed | basic — no fade-out look | live (d.js) | 3 |
| `st-stat-change` | Stat up/down float | statChangeVfx (namedBuff, debuffAttack, phase, pack...) | gold/debuff float + statPillPulse (statPump/statDrain) | good — has its own look that plays at the right moment | live (d.js) | 3 |
| `st-mind-controlled` | Mind-controlled unit (while on your side) | after mindControl the unit belongs to the other side | none | missing — no tell that it is a stolen unit | live (d.js) | 2 |
| `st-caged-leader` | Caged leader on the board | cage {hp, slot} (a host carries the cage) | cage tile class (cageCls) + log line | basic — no cage-drop moment | live (d.js) | 2 |
| `st-cage-broken` | Caged leader freed | cageBroken | unlock sound + toast "🔓 Your leader is free!" | basic — toast only | live (b.js) | 2 |
| `st-ward-crush` | Supreme crushes Armor / Shell / Stone / temporary Health / Ward | hit by a Supreme attacker (crush flag inside damageCard; no event flag) | none | missing — the crushed defence just fails silently | live (b.js) | 2 |
| `st-resist-weak-hit` | Resisted / Weak-to hit 🎨 | hit whose damage was halved (resist) or doubled (weakness) — no flag on the event | none | missing — players can't see why a number is small or big | live (b.js) | 1 |
| `st-status-badges` | Status badge row (abadge) | updateCardStatusDisplay badges | .abadge poison/bleed/scar/sleep/paralyze/blind/smoke/tipsy | basic — static chips; new badge has no pop | live (d.js) | 3 |
| `st-burn-d65` | Burn (Scorch side effect, D65 proposal) 🔮 | planned: 1 heat hit in 3 leaves Burn 1 | none | missing — not built | lab-only (b.js) | 3 |
| `st-chill-d65` | Chill (Cold side effect, D65 proposal) 🔮 | planned: 1 cold hit in 3 adds +1 Wait | none | missing — not built | lab-only (b.js) | 3 |
| `st-toxin-tick` | Toxin: tick | toxinTick | green shake + "☣️ -N" | good — has its own look that plays at the right moment | live (w2.js) | 2 |
| `st-strangle-tick` | Strangle: squeeze | strangleTick | SkillFX.squeeze + "🪢 -N" | good — has its own look that plays at the right moment | live (x17.js) | 2 |
| `fld2-haunted` | Haunted: Frightened | statusFx {kind:'frightened'} | field2Vfx: "👻 Frightened" + SkillFX.fearShiver; the 👻 badge | good — has its own look that plays at the right moment | live (fe2.js) | 2 |
| `st-expose-crit` | Expose: a counter used by a crit | statusFx exposedHit (counters left), at the impact of the hit that used it | FX.D.exposeCritFlash: the crosshair shines deep dark red | good — has its own look that plays at the right moment | live (d.js) | 2 |
| `st-expose-last` | Expose: the last counter used | statusFx exposedHit {amount:0}, at the impact of the hit that used it | FX.D.exposeMagnify: dark red flash, then the crosshair magnifies as it fades | good — has its own look that plays at the right moment | live (d.js) | 2 |
| `st-expose-fade` | Expose fades (no enemy units left) | statusFx exposeFade (engine exposeLonely) / any Expose turning off | FX.D.statusLook fades the crosshair out (FX.D.exposeFadeOut) | good — has its own look that plays at the right moment | live (d.js) | 3 |
| `st-revive-mark` | Revive mark: phoenix, Angel wings, used 🎨 | a unit with Revive on the board (!revivedOnce); revive event | .revive-mark (ember ring + flame feather) or .angel-wings (isAngelDef); "↺ Revive" chip; used: is-spending + the chip struck in red | good — has its own look that plays at the right moment | live (x17.js) | 2 |
| `st-hover-height` | Flyers hover; Tide units and Swimmers float | a .board-card with .is-flying or .is-floating (always on the board) | CSS flySoar: flyers lifted 10.4px (15% higher since 2026-10-17) with a ground shadow; tideFloat: Tide units and Swimmers at half that (5.2px) with a wet shadow | good — has its own look that plays at the right moment | live (wave17.js) | 2 |

### Fields and environment rules (`field`, 61)

| id | name | trigger | current | quality | status | P |
|---|---|---|---|---|---|--:|
| `fld-set` | Field card played | fieldSet {field, rounds} (field card or Rainmaker) | toast + match field tile landing (.match-field-tile.is-landing fieldLand) | basic — no board-wide wash announcing the new field | live (b.js) | 1 |
| `fld-end` | Field card ends | fieldEnd {field, back} | none (battle log only) | missing — the field tile just vanishes | live (b.js) | 2 |
| `fld-base-returns` | Map field returns after a played field ends | fieldEnd {back} | none | missing — nothing on screen | live (b.js) | 3 |
| `fld-frigid-tick` | Frigid (frozen) round start chill | fieldTick {field:'frozen'} | coldWaveVfx (.cold-wave frost-lvN) + icePulseVfx + SkillFX.frostChill | good — has its own look that plays at the right moment | live (b.js) | 2 |
| `fld-frigid-weak` | Frigid: unit weak to cold takes 1 | fieldTick frozen {dmg:1} | float + same chill | basic — a generic or reused look that does not say what happened | live (b.js) | 3 |
| `fld-frost-resist` | Frost can't touch the enemy's native types | rules.frostResist filter (no event) | none | missing — nothing on screen | live (b.js) | 3 |
| `fld-scorching-tick` | Scorching (heatwave) burns units | fieldTick {field:'heatwave', dmg} | SkillFX.scorch (once/round) + "🔥-N" | good — has its own look that plays at the right moment | live (b.js, p1.js) | 2 |
| `fld-rain-tick` | Spring Rain heals every unit | fieldTick {field:'rain', heal} | "🌧️+N" float per unit | basic — no rain falling on the board for the field card itself (only on wet maps) | live (b.js) | 2 |
| `fld-fog-active` | Thick Fog on the field | field fog active | .field-fog on the field tile only | basic — board not fogged | live (b.js) | 2 |
| `fld-moon-active` | Full Moon field | field moon active | .field-moon on the field tile | basic — a generic or reused look that does not say what happened | live (b.js, p1.js) | 3 |
| `fld-field-tile-looks` | Field tile looks (snow, rain, fog, heat, moon) | field card tile in the field slot | .field-snow/.field-rain/.field-fog/.field-heat/.field-moon | good — has its own look that plays at the right moment | live (b.js) | 3 |
| `fld-env-cards` | Environment cards stack | fieldCondCardHTML (one env card per rule row) | .env-stack (fanned) + .env-card biome-* | good — has its own look that plays at the right moment | live (b.js) | 3 |
| `fld-env-reveal` | "?" environment effect revealed the first time it happens (Map 0) | markFieldRow on first trigger | .has-new / "New!" chip | basic — no flip from "?" to the real card | live (b.js) | 2 |
| `fld-misty` | Misty (sun and moon hidden) | rules.misty → syncSkyFx tone misty | .sky-fx.tone-misty (mistyTint drift) | good — has its own look that plays at the right moment | live (b.js) | 3 |
| `fld-terrain-banner` | Terrain intro banner | first appearance of a terrain in a match (maybeTerrainIntro) | .terrain-banner (terrainIn) | basic — a generic or reused look that does not say what happened | live (b.js) | 3 |
| `fld-lava-tide` | Lava Tide floods a column | fieldTick {field:'lavaTide'} | .lava-tide-hit + eruptionGeyserVfx + boom | good — has its own look that plays at the right moment | live (b.js) | 2 |
| `fld-eruption` | Eruption hits a unit | fieldTick {field:'eruption'} | .battlefield.erupt-rumble + .erupt-hit + geyser | good — has its own look that plays at the right moment | live (b.js) | 2 |
| `fld-scorched` | Scorched Ground burns a unit | fieldTick {field:'scorched'} | .erupt-hit + SkillFX.scorch + boom | good — has its own look that plays at the right moment | live (b.js) | 3 |
| `fld-comet-rain` | Comet rain begins | fieldTick {field:'cometRain', left} | cometRainVfx (.comet-sky) | good — has its own look that plays at the right moment | live (b.js) | 2 |
| `fld-comet-strike` | Comet strikes a unit | fieldTick {field:'comet'} | cometStrikeVfx (.bw-comet cometFall, .comet-hit) | good — has its own look that plays at the right moment | live (b.js) | 2 |
| `fld-eruption-reset` | Mountain settles (odds reset) | fieldTick {field:'eruptionReset'} | toast only | basic — a generic or reused look that does not say what happened | live (b.js) | 3 |
| `fld-volcanic-ambient` | Volcanic battlefield glow | battlefieldMapClass volcanic | .battlefield.volcanic::after lavaBreath | good — has its own look that plays at the right moment | live (b.js) | 3 |
| `fld-tide-spout` | Tide-spout bursts in a column | fieldTick {field:'tideSpout', col, tideIn} | splash sound + tideWaveVfx(flow) if the tide comes in | basic — no geyser column of its own | live (b.js) | 2 |
| `fld-tide-spout-wash` | Tide-spout pushes / soaks units | wash {spout:true, dmg} | washPushVfx + HP update | good — has its own look that plays at the right moment | live (b.js) | 3 |
| `fld-boss-surge` | Boss surge on cast | statusFx surge {atk,hp} | .surge-glow + rageRoar + float | good — has its own look that plays at the right moment | live (b.js) | 2 |
| `fld-deep-mines` | Deep mines: enemy digs ore | rules.enemyOre → enemy stone/metal gain | floatResourceGain on enemy side | basic — a generic or reused look that does not say what happened | live (b.js) | 3 |
| `fld-first-blood-rule` | First Blood rule | rules.firstBlood → statusFx firstBlood | float | basic — a generic or reused look that does not say what happened | live (b.js) | 3 |
| `fld-lumber-every` | Arena rule: +1 Lumber every N rounds | lumber {rule:true} | pill bing + float | basic — a generic or reused look that does not say what happened | live (b.js) | 3 |
| `fld-forecast` | Next-round forecast pill | forecastPillHTML (engine.forecast) | .forecast-pill chips | basic — static text pill | live (b.js) | 3 |
| `fld-arena-ruleset` | Arena ruleset pill | m.arenaRuleset | bf-pill | basic — a generic or reused look that does not say what happened | live (b.js) | 3 |
| `fld-wet-raindrops` | Raindrops on cards (wet maps) | rules.wet / rain weather, High effects | .rain-drops ::before cardRain | good — has its own look that plays at the right moment | live (b.js) | 3 |
| `fld-water-ripple` | Card landing ripple on water | waterRippleAt on landing (wet battlefields) | shader ripple ring | good — has its own look that plays at the right moment | live (b.js) | 3 |
| `fld-felt-material` | Battlefield floor material per biome | battleWeatherKind / felt shader u_material | shader: wet glints, ash cracks, frost bloom, sand ripples | good — has its own look that plays at the right moment | live (b.js) | 3 |
| `fld-biome-puff` | Ground kick-up by biome (landing / falls) | biomePuff on falls and landings | biomePuff (leaves, spray, ash, grit, snow, bubbles, mud, embers, feathers, sand) | good — has its own look that plays at the right moment | live (b.js) | 3 |
| `fld-future-monsoon` | Monsoon (rain every round, fire halved, Swimmers Flow) 🔮 | planned field / map rule | none | missing — planned, not built | lab-only (b.js) | 3 |
| `fld-future-wildfire` | Wildfire front moving a column a round 🔮 | planned field / map rule | none | missing — planned, not built | lab-only (b.js) | 3 |
| `fld-future-migration` | Migration herd crosses the middle 🔮 | planned field / map rule | none | missing — planned, not built | lab-only (b.js) | 3 |
| `fld-future-fogbanks` | Fog banks (no targeting beyond 1 column) 🔮 | planned field / map rule | none | missing — planned, not built | lab-only (b.js) | 3 |
| `fld-future-pollen` | Pollen season (Insects +1, Flora heal) 🔮 | planned field / map rule | none | missing — planned, not built | lab-only (b.js) | 3 |
| `fld-future-permafrost` | Permafrost thaw (Frigid eases every 3 rounds) 🔮 | planned field / map rule | none | missing — planned, not built | lab-only (b.js) | 3 |
| `fld-future-volcanicwinter` | Volcanic winter (whole fight Night) 🔮 | planned field / map rule | none | missing — planned, not built | lab-only (b.js) | 3 |
| `fld-future-floodplains` | Floodplains loop (Flooded / Receded / Parched) 🔮 | planned field / map rule | none | missing — planned, not built | lab-only (b.js) | 3 |
| `fld-future-abyssal-pressure` | Abyssal pressure (non-Swimmers take 1 a round) 🔮 | planned field / map rule | none | missing — planned, not built | lab-only (b.js) | 3 |
| `fld-future-hurricane` | Hurricane (one-off skill idea) 🔮 | planned field / map rule | none | missing — planned, not built | lab-only (b.js) | 3 |
| `fld2-landslide` | Landslide | fieldTick {field:'landslide'} + landslideHit per unit | field2Vfx (the game's own function now plays in the lab): the rumble, a band of rocks across the board, chips off each grounded unit | good — has its own look that plays at the right moment | live (fe2.js) | 2 |
| `fld2-crushing` | Crushing Depths | fieldTick {field:'crushingDepths'} + crushingHit | field2Vfx: the press (crush-press) and water rings, "🫧 -N" (Swimmers half) | good — has its own look that plays at the right moment | live (fe2.js) | 2 |
| `fld2-lava-spout` | Lava Spout | fieldTick {field:'lavaSpout', col} + lavaSpoutHit | field2Vfx: lavaSpoutHit → eruptionGeyserVfx in the column, "♨️ -3" | good — has its own look that plays at the right moment | live (fe2.js) | 2 |
| `fld2-leylines` | Leylines III burn | fieldTick {field:'leylines'} + leylinesHit / leylinesCastle | field2Vfx: the violet band, "✴️ -3" and violet rings; an Atheist shows "✴️ Atheist" | good — has its own look that plays at the right moment | live (fe2.js) | 2 |
| `fld2-mirage` | Mirage | fieldTick {field:'mirage', illusionUid} + spawn {kind:'mirage'} | field2Vfx: the Illusion shimmers in (.mirage-shimmer) with "🪞 Illusion" | good — has its own look that plays at the right moment | live (fe2.js) | 2 |
| `fld2-slippery` | Slippery | evaded {reason:'slippery'} / slipFizzle | field2Vfx: "⛸️ Slip!" on the attacker; "⛸️ Slipped" on a failed skill | good — has its own look that plays at the right moment | live (fe2.js) | 2 |
| `fld2-lanes` | Rook's Row / Bishop's Path | hit {laneBonus, lane} | field2Vfx: "♜ +2" / "♝ +2" over the target | good — has its own look that plays at the right moment | live (fe2.js) | 2 |
| `fld2-consternation` | Consternation | fieldTick {field:'consternation'} | field2Vfx: "😰 −1/−1" over the hand; a played card keeps the 😰 badge | good — has its own look that plays at the right moment | live (fe2.js) | 2 |
| `fld2-canopy` | High Canopy / Undergrowth | a fight with rules.canopy (Map 13) or rules.undergrowth (Map 15): a Swift / Quick unit dodges (evaded {reason:canopy}); Pounce +2 | the Environment card; the ordinary Evasive dodge (SkillFX.evasiveDodge); Pounce's bigger number | basic — the Environment card and the numbers; no look of its own | live (fe2.js) | 2 |
| `fld2-tall-grass` | Tall Grass | hit {tallGrass} (Backstab hits and Pounce deal double); Stealth attacks first | field2Vfx: "🌾 ×2" over the target | good — has its own look that plays at the right moment | live (fe2.js) | 2 |
| `fld2-leylines-1` | Leylines I (zeitgebers stronger) | rules.leylines1: Diurnal / Nocturnal / Crepuscular / Tide / Full Moon bonuses grow | the Environment card; the phase bonus number | basic — the Environment card and the numbers; no look of its own | live (fe2.js) | 2 |
| `fld2-leylines-2` | Leylines II (+1 Lumber a round) | lumber {leylines} for each side from round 2 | resourceGainVfx into each side's Lumber pill | good — has its own look that plays at the right moment | live (fe2.js) | 2 |
| `fld3-sulphur-fumes` | Sulphur Fumes (Choking) | fieldTick sulphurFumes; statusFx choking on each unit that breathes them in (not fire-resistant, Dry or Flying) | field2Vfx: a soft yellow sweep (boardSweepVfx glass, from the right) + "💨 −1" on each choking unit | good — has its own look that plays at the right moment | live (fe2.js) | 2 |
| `fld3-ash-rain` | Ash Rain | fieldTick ashRain (both castles −1, day bonuses halved); ashRainCastle | field2Vfx: the grey hail band and a boom; the castle loss has no number of its own | basic — the sweep; the castle loss only ticks the HP bars | live (fe2.js) | 2 |
| `fld3-ashy` | Ashy (and Ashy after an Eruption) | fieldTick ashy (an Eruption on a volcano map leaves it Ashy for 4 rounds); evaded {reason:ashy} | field2Vfx: the board rumbles (erupt-rumble) + boom; a miss in the ash floats "🌫️ Lost in ash" on the attacker | good — has its own look that plays at the right moment | live (fe2.js) | 2 |
| `fld3-arrow-slits` | Arrow Slits | fieldTick arrowSlits then arrowSlitHit on a random unit of yours (2; a Helmet can turn it) | field2Vfx: a twang, then "🏹 -2" and a shake on the unit hit | good — has its own look that plays at the right moment | live (fe2.js) | 2 |
| `fld2-awash` | Awash | fieldTick {field:'awash', uid, n} then wave {awash:true} | field2Vfx: "〰️ Awash N" on the unit, then the wave event rides it (SkillFX.waveRide) or bobs it (SkillFX.waveBob); the Environment card (〰️) | good — has its own look that plays at the right moment | live (wave17.js) | 2 |

### Weather and time of day (`weather-time`, 33)

| id | name | trigger | current | quality | status | P |
|---|---|---|---|---|---|--:|
| `wt-day-breaks` | Day breaks | phase {phase:'day'} (cycle maps) | 2026-10-17: FX.B.dayBreaks: no hard disc, a soft blurred glow 60% fainter, rays a third fainter; birds sing on about 1 in 3 daybreaks (SoundKit.dawnChime) | basic — a generic or reused look that does not say what happened | live (b.js, p1.js) | 2 |
| `wt-dawn-draw` | Dawn: both sides draw | dawn {round} | sky tone dawn (rosy) + draw flips; log line | basic — no dawn moment of its own | live (b.js) | 2 |
| `wt-dusk` | Dusk tone (last round of the day) | skyToneOf → 'dusk' | .sky-fx.tone-dusk | basic — a generic or reused look that does not say what happened | live (b.js) | 3 |
| `wt-twilight` | Twilight begins (Day, Night, Day, Night, Twilight) | phase {phase:'twilight'} | sky tone dusk; toast reads "☀️ Day breaks." (wrong text) | broken — the phase toast has no twilight branch, so Twilight is announced as day | live (b.js) | 1 |
| `wt-realtime-phase` | Realtime clock flips day/night | phase {realtime:true} | same as day/night | basic — a generic or reused look that does not say what happened | live (b.js) | 3 |
| `wt-moon-phase` | Moon phase changes (8 phases) 🎨 | moon {phase:0..7} when night falls and Moonborn cards are in play | toast "🌕 Full moon tonight." etc. | basic — toast only; moon pill icon changes | live (b.js) | 2 |
| `wt-tide-flow` | Tide comes in (Flow) | tide {tide:'flow'} | tideWaveVfx (.tide-wave.is-flow) + .tide-line + SkillFX.tideSway: every card rocks a little as the Flood rises from the foot of the board; floating Tide units and Swimmers lift more | good — has its own look that plays at the right moment | live (b.js, wave17.js) | 2 |
| `wt-tide-ebb` | Tide goes out (Ebb) | tide {tide:'ebb'} | .tide-wave.is-ebb (tideOut) + SkillFX.tideSway {kind:'ebb'}: the cards settle a little as the water drains from the top down | good — has its own look that plays at the right moment | live (b.js, wave17.js) | 3 |
| `wt-tide-high` | High tide | tide {tide:'high'} (rules.highTide) | reuses the Flow wave | basic — high tide looks the same as Flow | live (b.js) | 2 |
| `wt-perma-tide` | Perma-tide (River maps) | rules.permaTide | tide line always on; pill | basic — a generic or reused look that does not say what happened | live (b.js) | 3 |
| `wt-moonpull` | Moonpull brings the tide in | tide {moonpull:true} | tideWaveVfx | basic — no moon pull visual | live (b.js) | 3 |
| `wt-wind-gust` | Strong wind blows (Windy / Gale) | wind {windy:true, from} | #battlefieldEl.is-windy::after windDrift + wind pill | basic — no direction-aware gust burst at the moment it starts | live (b.js, p1.js) | 2 |
| `wt-wind-calm` | Wind drops for a round | wind {windy:false} | pill switches to Calm | missing — no settling moment | live (b.js, p1.js) | 3 |
| `wt-wind-swap` | Wind changes direction | consecutive gusts from opposite sides | none | missing — nothing on screen | live (b.js) | 3 |
| `wt-tailwind` | Tailwind: a Flyer gets a quick turn | statusFx tailwind | SkillFX.gust + "🪁 Tailwind!" | good — has its own look that plays at the right moment | live (b.js) | 3 |
| `wt-headwind` | Headwind: Flyer skills and triggers go off twice | headwindDouble(card) (no event) | none | missing — the doubled trigger is unexplained | live (b.js) | 2 |
| `wt-swimmer-flow` | Swimmer quick turn on Flow | statusFx swimmer | SkillFX.splash + "🏊 Quick!" | good — has its own look that plays at the right moment | live (b.js) | 3 |
| `wt-battle-rain` | Rain on the battlefield | battleWeatherKind 11 (world rain / rain atmosphere / wet map) | shader rain streaks + splash rings; .battlefield.is-raining fallback rainFall | good — has its own look that plays at the right moment | live (b.js) | 3 |
| `wt-lightning-strike` | Storm lightning | scheduleLightning on storm/rain battlefields (9–40 s) | lightningStrike double flicker + thunder | good — has its own look that plays at the right moment | live (b.js) | 3 |
| `wt-world-rain` | World rain roll (10% per hour) | worldRaining() hourly | map + battle rain | good — has its own look that plays at the right moment | live (b.js) | 3 |
| `wt-rain-start-stop` | Rain starts / stops while you look at the map | hour rolls over while the map is open | 2026-10-16: rain coming in (on the map and a Spring Rain field arriving) is 90% more transparent (RAIN_ONSET_OPACITY); rain stopping unchanged | good — has its own look that plays at the right moment | live (b.js) | 3 |
| `wt-live-clock` | Live clock atmosphere (Home) | Settings → Atmosphere Live (dawn/day/dusk/night tint) | multiply-blend cast + motes/fireflies | good — has its own look that plays at the right moment | live (b.js) | 3 |
| `wt-seasons` | Seasonal map vignette | calendar month (?season= preview) | autumn/winter/spring/summer vignette | good — has its own look that plays at the right moment | live (b.js) | 3 |
| `wt-sudden-death` | Sudden death (turn 20) | showSuddenDeathBanner + suddenDeathSky | .battlefield.sudden-death::before sdSky + banner + sting | good — has its own look that plays at the right moment | live (b.js) | 2 |
| `wt-first-field-flash` | Who goes first this round | roundStart → flagFirstFieldFlash | .goes-first-flash (red wash + autumn leaves) | good — has its own look that plays at the right moment | live (b.js) | 3 |
| `wt-initiative-coin` | Initiative coin | syncInitiativeCoin | .init-coin flip (initFlip) | basic — a generic or reused look that does not say what happened | live (b.js) | 3 |
| `wt-syzygy` | Syzygy (High tide + Full Moon + Eclipse at once) 🔮 | planned Map 35+ world event | none | missing — planned | lab-only (b.js) | 2 |
| `wt-eclipse-phase` | Eclipse phase pill / sky 🔮 | planned | none | missing — planned | lab-only (b.js) | 3 |
| `field-cloudy` | Cloudy | rules.cloudy | SkillFX.cloudShadows: soft cloud shadows drift over the board | good — has its own look that plays at the right moment | live (w2.js) | 2 |
| `fld2-hail` | Hail | fieldTick {field:'hail'} + hailHit | field2Vfx: the hail band across the board, ice chips, "🌨️ -3" | good — has its own look that plays at the right moment | live (fe2.js) | 2 |
| `fld2-glass-storm` | Glass-storm | fieldTick {field:'glassStorm'} + glassHit (roll 1–3) | field2Vfx: the glass band (either way), "💎 -1…3" with zaps | good — has its own look that plays at the right moment | live (fe2.js) | 2 |
| `wt-volcano-glow` | Volcano Glow: Day 4, Night 2 | a volcano map with day and night (20, 20-A, 22) or phaseDay / phaseNight on the fight | phasePillHTML counts "2/4" by day and "1/2" by night (engine.phaseStepInfo); the Environment card's Volcano Glow row | basic — the pill and the card row | live (fe2.js) | 2 |
| `wt-sky-step` | Day / night steps (10 s) 🎨 | the step inside a phase changes (Day 1→2→3, Night 1→2→3) | skyStepApply: the sky tint eases over SKY_STEP_MS (10 s); a redraw carries on | good — has its own look that plays at the right moment | live (x17.js) | 2 |

### Darkness and light (`darkness-light`, 29)

| id | name | trigger | current | quality | status | P |
|---|---|---|---|---|---|--:|
| `dark-dark-enter` | Darkness (level 1, miss 1 in 4): fight opens in it 🎨 | match start with rules.dark='dark' → syncDarkVeil adds .dark-veil.lvl-dark | .dark-veil.lvl-dark (static CSS veil) | basic — the veil is just there; no lights-going-out moment | live (b.js) | 1 |
| `dark-dark-miss` | Darkness (level 1, miss 1 in 4): a unit swings blind and misses | blindMiss {night:true} from sightMiss (rules.dark, no Darksight) | animateAttacker + "🌙 Miss!" float | basic — same float for every darkness level and for night-blind | live (b.js) | 1 |
| `dark-pitch-enter` | Pitch Black (level 2, miss 1 in 2): fight opens in it 🎨 | match start with rules.dark='pitch' → syncDarkVeil adds .dark-veil.lvl-pitch | .dark-veil.lvl-pitch (static CSS veil) | basic — the veil is just there; no lights-going-out moment | live (b.js) | 1 |
| `dark-pitch-miss` | Pitch Black (level 2, miss 1 in 2): a unit swings blind and misses | blindMiss {night:true} from sightMiss (rules.dark, no Darksight) | animateAttacker + "🌙 Miss!" float | basic — same float for every darkness level and for night-blind | live (b.js) | 1 |
| `dark-absolute-enter` | Absolute darkness (every swing misses): fight opens in it 🎨 | match start with rules.dark='absolute' → syncDarkVeil adds .dark-veil.lvl-absolute | .dark-veil.lvl-absolute (static CSS veil) | basic — the veil is just there; no lights-going-out moment | live (b.js) | 1 |
| `dark-absolute-miss` | Absolute darkness (every swing misses): a unit swings blind and misses | blindMiss {night:true} from sightMiss (rules.dark, no Darksight) | animateAttacker + "🌙 Miss!" float | basic — same float for every darkness level and for night-blind | live (b.js) | 1 |
| `dark-leave` | Darkness lifts (match over) | syncDarkVeil with m.over → veil removed | veil removed instantly | missing — no light-returns moment | live (b.js) | 3 |
| `dark-unit-blind` | A unit can't see in the dark (no Darksight, no Lantern) | sightBlind(card) true for the whole fight (no event) | none | missing — the user explicitly asked: units that are blind in darkness should look it | live (b.js) | 1 |
| `dark-sunshy-blind` | Sun-shy unit blind by day | sightMiss: phase day + effects.sunshy | none (only the blindMiss float when it misses) | missing — nothing on screen | live (b.js) | 2 |
| `dark-nightblind` | Night-blind unit blind at night | sightMiss: phase night + effects.nightblind and no Lantern | none (only the miss float) | missing — nothing on screen | live (b.js) | 2 |
| `dark-keen-sense` | Keen Sense unit senses in the dark | keenSense ignores darkness for non-flying targets | none | missing — nothing on screen | live (b.js) | 3 |
| `dark-lantern-lit` | Lantern lights its side | a living Lantern on your board (lit()) | .battlefield.bf-lantern (bfLanternFlicker) + SkillFX.lanternGlow on play | good — has its own look that plays at the right moment | live (b.js) | 2 |
| `dark-lantern-out` | Lantern carrier dies: the dark returns | lantern unit death (no event) | none | missing — nothing on screen | live (b.js) | 2 |
| `dark-lantern-save` | Lantern saves a swing (no miss thanks to the light) | sightMiss returns 0 with lit() | none | missing — nothing on screen | live (b.js) | 3 |
| `dark-darksight-play` | Darksight unit arrives | play of a Darksight card | SkillFX.darksight (eyes open, foes marked) | good — has its own look that plays at the right moment | live (b.js) | 3 |
| `dark-darksight-idle` | Darksight eyes glint in the dark | while rules.dark and the unit has Darksight | none | missing — nothing on screen | live (b.js) | 3 |
| `dark-cave-lamp` | Cave fight lamp follows the pointer | cave battlefield → mountCaveLamp (cards outside the light dim ~30%) | mountCaveLamp (shader fog + dim) | good — has its own look that plays at the right moment | live (b.js) | 2 |
| `dark-night-veil-in` | Night falls on the battlefield | phase {phase:'night'} → syncNightVeil .night-veil.is-on | 2026-10-16: the whole board darkens over 10 s (skyPhaseLayers + the veil) while the night creeps in from the left at 40% | good — has its own look that plays at the right moment | live (b.js, p1.js, x17.js) | 1 |
| `dark-night-veil-out` | Night lifts | phase {phase:'day'} → .night-veil.is-leaving | 2026-10-16/17: the board lights up over 10 s, the light creeps in from the left at 40%, soft streaks (FX.E.nightRetreat), a barely-there sun (FX.B.dayBreaks) | good — has its own look that plays at the right moment | live (b.js, p1.js, w3.js, x17.js) | 2 |
| `dark-shade-night` | Shade halves non-magic hits at night / in the dark 🔮 | damage halved for Shade (no flag) | none | missing — nothing on screen | live (b.js) | 2 |
| `dark-shadow-night` | Shadow: half the hits miss at night / in the dark 🔮 | evaded {reason:'shadow'} | generic dodge hop | basic — a generic or reused look that does not say what happened | live (b.js) | 2 |
| `dark-beware` | Removal-zone crawler at Darkness N (Devilry) | beware {darkness} | none (battle log only) | missing — nothing on screen | live (b.js) | 2 |
| `dark-inherent` | Inherent Darkness / Devilry ★ gain | devilry {amount} (onSpawn/onReady/inherentDarkness) | floatResourceGain ★ + devilryTone | basic — a generic or reused look that does not say what happened | live (b.js) | 3 |
| `dark-devilry-aura` | Devilry card aura | is-devilry card tile | .is-devilry::after devilAura | good — has its own look that plays at the right moment | live (b.js) | 3 |
| `dark-bioluminescent` | Bioluminescent units glow in pitch black (Abyssal Plains) 🔮 | planned: Map 29 natives (anglerfish Lantern for its side) | none | missing — planned | lab-only (b.js) | 2 |
| `dark-pitchblack-fish` | Pitch-black fish strikes in the dark 🔮 | planned: 0/2 fish deals 5 to a random enemy each round in pitch black | none | missing — planned | lab-only (b.js) | 3 |
| `dark-eclipse` | Eclipse (day turns to night mid-round) 🔮 | planned Map 35+ | none | missing — planned | lab-only (b.js) | 2 |
| `fld-unit-light` | Leader and Light Aura glow (night and dark fields) | render: .board-card .unit-light (leaders: ul-leader; Illuminate: ul-aura; Immolation: ul-fire) shown while .battlefield.is-dark-scene (night or rules.dark); Pitch Black / Absolute: a mask hole in the darkness overlay (syncUnitLightPools) | CSS warm pools in arena_template.html + syncUnitLightPools in arena_app.js | good — faint for leaders, bright for Light Aura units | live (q.js) | 3 |
| `wt-night-cursor` | Night pointer light | Night in any fight (not Pitch Black, which has its lantern) | .battlefield.bf-night-cursor + .night-cursor-light under the pointer (wireNightCursorLight) | good — has its own look that plays at the right moment | live (x17.js) | 2 |

### Deaths (`death`, 39)

| id | name | trigger | current | quality | status | P |
|---|---|---|---|---|---|--:|
| `death-fall` | Normal death (smooth topple) | death → deathVfx → deathStyleFor 'fall' (physical / unknown cause) | 2026-10-16 (voices and feel): the topple is back as one smooth motion that starts slow and speeds up, fading as it lands (fallDeathVfx) | good — has its own look that plays at the right moment | live (c.js) | 1 |
| `death-flyer-fall` | Flyer falls out of the sky | death of an is-flying unit | flyerFallVfx | good — has its own look that plays at the right moment | live (c.js) | 2 |
| `death-burn` | Burned away (heat) | death with lastHurtBy heat, or a fiery card | burnAwayVfx (ragged mask, embers) + battleLightAt heat | good — has its own look that plays at the right moment | live (c.js) | 2 |
| `death-poison` | Poison death | lastHurtBy poison | bleedOutVfx(poison tone) + SkillFX.elementDeath poison drips | good — has its own look that plays at the right moment | live (c.js, p1.js) | 2 |
| `death-acid` | Acid death | lastHurtBy acid (mapped to the poison style) | poison drip look | basic — acid reads as poison; no dissolving / pitting | live (c.js) | 3 |
| `death-decay` | Decay death | lastHurtBy decay (poison style) | poison drip look | basic — no mould crumble | live (c.js) | 3 |
| `death-cold` | Frozen shatter | lastHurtBy cold | ProcFX.shatter ice shards + elementDeath cold + iceShatter | good — has its own look that plays at the right moment | live (c.js) | 2 |
| `death-bleed` | Bleed-out | lastHurtBy bleed | bleedOutVfx red wash + drips | good — has its own look that plays at the right moment | live (c.js, p1.js) | 2 |
| `death-token` | Token pixel shatter | death of a token card (not burned) | pixelShatterVfx 4×5 grid + pixelShatter chiptune | good — has its own look that plays at the right moment | live (c.js) | 3 |
| `death-lightning` | Electrocuted (Electricity / Dragon Lightning / Shock Bolt) 🎨 | death after this damage source (deathStyleFor has no style for it → falls to fall/burn/poison) | fall/topple (generic) | missing — no death look of its own | live (c.js) | 2 |
| `death-magic` | Killed by magic 🎨 | death after this damage source (deathStyleFor has no style for it → falls to fall/burn/poison) | fall/topple (generic) | missing — no death look of its own | live (c.js) | 3 |
| `death-psychic` | Mind shattered (Psychic) 🎨 | death after this damage source (deathStyleFor has no style for it → falls to fall/burn/poison) | fall/topple (generic) | missing — no death look of its own | live (c.js) | 3 |
| `death-wither` | Withered away 🎨 | death after this damage source (deathStyleFor has no style for it → falls to fall/burn/poison) | fall/topple (generic) | missing — no death look of its own | live (c.js) | 2 |
| `death-irradiation` | Irradiated to death 🎨 | death after this damage source (deathStyleFor has no style for it → falls to fall/burn/poison) | fall/topple (generic) | missing — no death look of its own | live (c.js) | 3 |
| `death-water` | Drowned / washed away (Tsunami, Tide-spout) 🎨 | death after this damage source (deathStyleFor has no style for it → falls to fall/burn/poison) | fall/topple (generic) | missing — no death look of its own | live (c.js) | 2 |
| `death-crushed` | Crushed (Earthquake, Landslide, Avalanche, Meteor, Comet) 🎨 | death after this damage source (deathStyleFor has no style for it → falls to fall/burn/poison) | fall/topple (generic) | missing — no death look of its own | live (c.js) | 2 |
| `death-explode` | Blown up (Explode, Dynamite) 🎨 | death after this damage source (deathStyleFor has no style for it → falls to fall/burn/poison) | fall/topple (generic) | missing — no death look of its own | live (c.js) | 2 |
| `death-petrified` | Shattered while petrified 🎨 | death after this damage source (deathStyleFor has no style for it → falls to fall/burn/poison) | fall/topple (generic) | missing — no death look of its own | live (c.js) | 3 |
| `death-curse` | Killed on cursed ground (Desecrate) 🎨 | death after this damage source (deathStyleFor has no style for it → falls to fall/burn/poison) | fall/topple (generic) | missing — no death look of its own | live (c.js) | 3 |
| `death-true` | True / ichor damage 🎨 | death after this damage source (deathStyleFor has no style for it → falls to fall/burn/poison) | fall/topple (generic) | missing — no death look of its own | live (c.js) | 3 |
| `death-sacrificed` | Sacrificed for a Dark Summon | statusFx sacrificed then death | .sac-chomp jaws then normal death | basic — a generic or reused look that does not say what happened | live (c.js) | 2 |
| `death-leader` | Leader / King dies | death of the leader unit (m.leaderUid) or a King | normal death | missing — the most important unit dies like any other | live (c.js) | 1 |
| `death-boss` | Boss unit dies | death of a boss-node enemy unit / world boss | normal death | missing — nothing on screen | live (c.js) | 1 |
| `death-egg` | Egg card destroyed before hatching | death of a hatchInto card | normal death | missing — nothing on screen | live (c.js) | 3 |
| `death-structure` | Structure destroyed | death of a Structure card | normal death | missing — buildings topple like animals | live (c.js) | 2 |
| `death-shiny-foil` | Shiny / foil unit dies | death of a shiny or foil unit | retired 2026-10-17: shiny / foil units die like anyone else; the sheen is death-prism | missing — nothing on screen | retired | 3 |
| `death-skull` | Skull float on death | every death | .death-skull deathSkullFloat (hidden for falls/tokens/ice) | good — has its own look that plays at the right moment | live (c.js) | 3 |
| `death-kill-emote` | Killer emote | death of a unit last hit this round | maybeEmote(killer, 'kill') | good — has its own look that plays at the right moment | live (c.js) | 3 |
| `death-speech` | Death line | death | maybeSpeak(uid, 'onDeath') bubble | good — has its own look that plays at the right moment | live (c.js) | 3 |
| `death-bounty` | Bounty drop | bounty {fromDefId, uid} | itemDropVfx 🪵 bounce + itemDrop | good — has its own look that plays at the right moment | live (c.js, p1.js) | 3 |
| `death-collapse-in` | Row closes the gap | collapseIn {fromSide} | SoundKit.shift + Flip glide + .collapse-landed squash | good — has its own look that plays at the right moment | live (c.js) | 3 |
| `death-revive-save` | Revive saves it from death | revive (instead of death) | SkillFX.reviveRise | good — has its own look that plays at the right moment | live (c.js) | 3 |
| `death-lethal-number` | Killing blow number | hit that drops hp to 0 | retired 2026-10-16: the "−N ✖" killing-blow stamp is gone; a killer that feeds on kills gets the ✖ (death-kill-mark) | missing — no "KO" emphasis on the final blow | retired | 2 |
| `death-ghost` | Ghost fades out | death of a Ghost unit (effects.ghost, e.g. Glasswing Butterfly) → hooks.deathLook | FX.C.deathGhost via hooks.deathLook: a Ghost (effects.ghost / Ghost archetype) turns see-through and drifts up | good — has its own look that plays at the right moment | live (c.js) | 3 |
| `death-dragon` | Dragon falls | death of a Dragon (the five Dragons, Thunder Lizard) → hooks.deathLook; the round waits | FX.C.deathDragon via hooks.deathLook: a Dragon (archetype Dragon / creatureRank 1) crashes down, the field quakes (High), scales scatter | good — has its own look that plays at the right moment | live (c.js) | 2 |
| `death-supreme` | Supreme beast defeated | death of another Supreme unit or a rank-2 great beast (Fathom Leviathan, Grovebearer Dragon-Turtle) → hooks.deathLook | FX.C.deathSupreme via hooks.deathLook: another Supreme unit or a rank-2 great beast, a prismatic burst | good — has its own look that plays at the right moment | live (c.js) | 2 |
| `death-slime-split` | Slime splits on death 🔮 | planned card idea | none | missing — planned | lab-only (c.js) | 3 |
| `death-prism` | Prism death (light / rainbow skills) | death of a unit with Illuminate, Lantern or Reflect (FX.C.PRISM_SKILLS; reserved: prism, rainbow, radiant, dazzle, refract) | FX.C.deathPrism: the rainbow sheet lifts off and flutters away in sparkles (the old shiny / foil death) | good — has its own look that plays at the right moment | live (c.js) | 3 |
| `death-kill-mark` | Killing blow ✖ into the killer | a killing blow from a unit with an On Kill trigger (or Momentum, Midas Touch, Slash & Burn) | killMarkVfx: a ✖ pops on the target and darts into the killer (.kill-gain); its On Kill trigger plays as it lands (pullKillTrigger) | good — has its own look that plays at the right moment | live (x17.js) | 2 |

### Castle (HQ) (`castle`, 21)

| id | name | trigger | current | quality | status | P |
|---|---|---|---|---|---|--:|
| `castle-hit` | Castle hit | hitHQ {dmg} | hqHitBigVfx (shake, burst, rumble) + "−N" hq-big float + displayHqDamage + castle line | good — has its own look that plays at the right moment | live (c.js) | 1 |
| `castle-hp-number` | Castle HP number tick | displayHqDamage | 2026-10-16: floatText(hqRibbonFloatAnchor(side), "-N", "hq-big") on the HP bar where its fill ends | good — has its own look that plays at the right moment | live (c.js, p1.js, x17.js) | 3 |
| `castle-crack-1` | Castle crack stage 1 (≤66% HP) 🎨 | updateCastleCracks after a castle hit | ProcFX.cracks / pfxCastleCracks + jolt + masonry dust (crackJolt) | good — has its own look that plays at the right moment | live (_existing.js, c.js) | 2 |
| `castle-crack-2` | Castle crack stage 2 (≤33% HP) | updateCastleCracks after a castle hit | ProcFX.cracks / pfxCastleCracks + jolt + masonry dust (crackJolt) | good — has its own look that plays at the right moment | live (_existing.js) | 2 |
| `castle-crack-3` | Castle crack stage 3 (≤15% HP) | updateCastleCracks after a castle hit | ProcFX.cracks / pfxCastleCracks + jolt + masonry dust (crackJolt) | good — has its own look that plays at the right moment | live (_existing.js) | 2 |
| `castle-danger` | Castle in danger (<25%) | DangerPulse: heartbeat + red edge (faster <10%) | body.castle-danger::after dangerPulse + heartbeat | good — has its own look that plays at the right moment | live (c.js) | 2 |
| `castle-crumble` | Castle destroyed | match end, a castle at 0 → castleCrumble | castleCrumble (shudder, dust, burn) + castleCollapse | good — has its own look that plays at the right moment | live (_existing.js) | 1 |
| `castle-crumble-variants` | Castle crumble variants (collapse / sink / topple) 🎨 | SkillFX.castleCrumble {variant} (Lab only) | Effects Lab only | basic — not used in fights | live (_existing.js) | 3 |
| `castle-regen` | Castle regenerates | castleRegen {amount, perk} | none — no renderer and no log text | missing — the HP just goes up | live (c.js) | 2 |
| `castle-lumber` | Castle produces Lumber (castle passive / Everbloom perk) | lumber {castle:true} / {perk:true} | pill bing + "+1" on the pill | basic — nothing on the castle tile | live (c.js) | 3 |
| `castle-ballista` | Castle ballista bolt | statusFx castleBolt | log line; the hit follows as a plain projectile | basic — a generic or reused look that does not say what happened | live (c.js) | 2 |
| `castle-thorns` | Thorn Cage cuts an attacker | statusFx castleThorns | none (log only) | missing — nothing on screen | live (c.js) | 2 |
| `castle-herb-heal` | Herb Refinery heals | statusFx herbHeal | log line only | missing — nothing on screen | live (c.js) | 3 |
| `castle-herb-bane` | Herb Refinery bitter brew | statusFx herbBane (+ poison hit) | 2026-10-16: castleThrowVfx: a 🧪 on a shallow arc that lands in 0.44 s (every castle shot) | good — has its own look that plays at the right moment | live (c.js, x17.js) | 3 |
| `castle-spawn` | Units pour out of the castle | statusFx castleSpawn (+ spawn events) | log line; units get the generic summonPortal | missing — no gate-opening moment | live (c.js) | 2 |
| `castle-logjam` | Logjam holds up a unit | statusFx logjam {amount} | log line only | missing — nothing on screen | live (c.js) | 3 |
| `castle-speech` | Castle speech bubble | maybeSpeakHQ(side, 'castleOnHit') | speech bubble on the HQ tile | basic — a generic or reused look that does not say what happened | live (c.js) | 3 |
| `castle-friendly-hit` | Your own boomerang hits your castle | hitHQ {boomerang, friendly} | normal castle hit | basic — a generic or reused look that does not say what happened | live (c.js) | 3 |
| `castle-shield` | Castle shield (raid Core / skirmish Shield) | raid part castle shield; castle can't be hit while stumps live | none | missing — nothing on screen | live (c.js) | 2 |
| `castle-enemy-leader-banner` | Enemy leader banner | enemy leader on the board | .enemy-leader-banner (elBanner) | basic — a generic or reused look that does not say what happened | live (c.js) | 3 |
| `castle-skin-future` | Castle looks per faction 🔮 | planned castle art per people | castle tiles | missing — planned | lab-only (c.js) | 3 |

### Summons, spawns, hatching (`summon-spawn`, 30)

| id | name | trigger | current | quality | status | P |
|---|---|---|---|---|---|--:|
| `sum-hand-play` | Card played from hand | play {uid} (player) → renderBoard entrance from pendingEntranceOrigins | entrance tween + playLandingImpact + playHandSummonGlow (gold ring + sparks) | good — has its own look that plays at the right moment | live (c.js) | 1 |
| `sum-enemy-play` | Enemy plays a card | play {side:'B'} | generic fall-in + SoundKit.play | basic — no hand-origin; enemy cards appear from above | live (c.js) | 2 |
| `sum-reserve` | Played into a reserve row | play {reserve} | reserve row entrance | basic — a generic or reused look that does not say what happened | live (c.js) | 3 |
| `sum-advance` | Reserve unit steps up | advance {from,to} | re-render + "⬆" float | basic — a generic or reused look that does not say what happened | live (c.js) | 3 |
| `sum-big-arrival` | Huge unit arrives (>20 HP) | play/spawn/hatch with maxHp>20 | battlefieldShake (21→200 HP); ready of a huge card plays playEarthquake | good — has its own look that plays at the right moment | live (c.js) | 2 |
| `sum-leader` | Leader summoned | play {leader:true} | leaderThroneVfx (pillar, crown, ring shockwave, banner) + leaderFanfare | good — has its own look that plays at the right moment | live (c.js) | 1 |
| `sum-enemy-leader` | Enemy leader summoned | play {leader:true} side B | leaderThroneVfx {enemy:true} (crimson pillar, drum) | good — has its own look that plays at the right moment | live (c.js) | 1 |
| `sum-gladiator` | Gladiator leader enters | play {leader:true, gladiator:true} | no throne (skipped for gladiators) | basic — a generic or reused look that does not say what happened | live (c.js) | 3 |
| `sum-boss-entrance` | Boss entrance | versus opener closes on a boss node → bossEntrance | quake + dust ring + shader shockwave + "BOSS · name" title + bossRumble | good — has its own look that plays at the right moment | live (c.js) | 1 |
| `sum-trigger-spawn` | Spawned by a trigger / action 🎨 | spawn {cause:'triggerSpawn'} | SkillFX.summonPortal (green rune circle) | good — has its own look that plays at the right moment | live (c.js) | 2 |
| `sum-on-death-spawn` | Progeny / On Death spawn | spawn {cause:'onDeathSpawn'} | entrance from the dying card's spot (lastDeathOrigin) + summonPortal | good — has its own look that plays at the right moment | live (c.js) | 2 |
| `sum-meiosis` | Meiosis split | spawn {kind:'meiosis'} | summonPortal on each half | basic — not a split; two portals | live (c.js) | 3 |
| `sum-on-attacked` | Spawn on being attacked (Bee Drone) | spawn {cause:'onAttackedSpawn'} | playBeeSpawnLanding (bouncy squash, bee buzz-off) | good — has its own look that plays at the right moment | live (c.js) | 3 |
| `sum-twin` | Twin appears beside it | spawn of a Twin token (Puddle Changeling, Mirrorhide Mutant) | summonPortal | basic — should read as a mirror copy | live (c.js) | 2 |
| `sum-brood` | Brood | spawn from Brood | summonPortal | good — has its own look that plays at the right moment | live (c.js) | 3 |
| `sum-skyfall` | Skyfall crash-down | Skyfall N: On Spawn damage to a random enemy (ranged hit from fireDamageAction) | generic triggered projectile; SkillFX.skyDrop (shadow grows, squash, dust ring) exists but is Lab-only | basic — the card should crash down, not lob a glyph | live (c.js) | 2 |
| `sum-castle-spawn` | Units come out of the castle | statusFx castleSpawn | summonPortal on each | basic — a generic or reused look that does not say what happened | live (c.js) | 3 |
| `sum-remember` | Returns from Exile (Remember) | remember + spawn | entrance + float | basic — a generic or reused look that does not say what happened | live (c.js) | 2 |
| `sum-hatch-battle` | Egg card hatches in battle | hatch {fromDefId, defId} | eggCrackVfx (shell halves fly) + .egg-hatched + "🐣 Hatched!" + unlockChime | good — has its own look that plays at the right moment | live (c.js) | 2 |
| `sum-egg-idle` | Egg card waiting on the board | egg (hatchInto) card on the board | normal card | missing — eggWobble exists only in the Nest | live (c.js) | 3 |
| `sum-structure` | Structure placed | play of a Structure card | normal landing | missing — no build-up | live (c.js) | 2 |
| `sum-mind-control-arrive` | Stolen unit lands on your side | mindControl → re-render | re-render only | basic — a generic or reused look that does not say what happened | live (c.js) | 2 |
| `sum-devilry-drop` | Dark Summon dropped onto a unit | devilryDropOnto (drag a Dark Summon card onto a unit) | sac-chomp + play entrance | basic — a generic or reused look that does not say what happened | live (c.js) | 2 |
| `sum-seen-new` | New enemy card first seen | matchState.newSeenUntil[defId] | .seen-new tag (seenNew) | good — has its own look that plays at the right moment | live (c.js) | 3 |
| `sum-sprout-token` | Sprout N: Growth Sprout tokens sprout | spawn {cause:'triggerSpawn'} of growth-sprout tokens (Sprout N) | SkillFX.summonPortal (generic rune circle) | basic — a sprout should grow out of the soil, not a rune portal | live (c.js) | 2 |
| `sum-rooted-veggie` | Rooted Wild Veggie takes root 🔮 | planned (Rafflesia, Venus Fly Trap) | none | missing — planned | lab-only (c.js) | 3 |
| `sum-dragon` | Dragon summoned | play of a Dragon (not a leader, reserve, egg or skyfall card) → FX.C.onEvent | FX.C.dragonArrive on play: the sky darkens, a wing shadow sweeps over, a roar, it lands with a quake (High) | good — has its own look that plays at the right moment | live (c.js) | 1 |
| `sum-supreme` | Supreme beast arrives | play of another Supreme unit or a rank-2 great beast → FX.C.onEvent | FX.C.supremeArrive on play: a prismatic shockwave | good — has its own look that plays at the right moment | live (c.js) | 2 |
| `sum-wandering-mage` | Wandering Mage joins (Map 51) 🔮 | planned free leader | none | missing — planned | lab-only (c.js) | 3 |
| `sum-drones-enemy-field` | Drones / golems summoned onto the enemy field 🔮 | planned (area control idea) | none | missing — planned | lab-only (c.js) | 3 |

### Card treatments (`card-treatment`, 61)

| id | name | trigger | current | quality | status | P |
|---|---|---|---|---|---|--:|
| `tr-rarity-low` | Starter / Common frame | cardTileHTML → rarityTierClass(d.rarity) | .rarity-tier-low grey band | good — rarity colour band | live (d.js) | 2 |
| `tr-rarity-uncommon` | Uncommon / Quest frame | cardTileHTML → rarityTierClass(d.rarity) | .rarity-tier-uncommon green band | good — rarity colour band | live (d.js) | 2 |
| `tr-rarity-mid` | Rare – Epic frame (Rare, Very Rare, Super Rare, Epic) | cardTileHTML → rarityTierClass(d.rarity) | .rarity-tier-mid coloured band + rarityBandDrift | good — rarity colour band | live (d.js) | 2 |
| `tr-rarity-high` | Heroic – Legendary frame | cardTileHTML → rarityTierClass(d.rarity) | .rarity-tier-high | good — rarity colour band | live (d.js) | 2 |
| `tr-rarity-top` | Mythic and up frame | cardTileHTML → rarityTierClass(d.rarity) | .rarity-tier-top::before goldStreak | good — gold-leaf rim with a sliding streak | live (d.js) | 2 |
| `tr-rarity-mythic` | Mythic frame of its own 🎨 | rarity:'mythic' (RARITY_DEFS colour red) | shares .rarity-tier-top with every Mythic+ rarity | basic — five top rarities look almost the same apart from the colour | live (d.js) | 2 |
| `tr-rarity-ancient` | Ancient frame of its own 🎨 | rarity:'ancient' (RARITY_DEFS colour deep blue) | shares .rarity-tier-top with every Mythic+ rarity | basic — five top rarities look almost the same apart from the colour | live (d.js) | 2 |
| `tr-rarity-divine` | Divine frame of its own 🎨 | rarity:'divine' (RARITY_DEFS colour white) | shares .rarity-tier-top with every Mythic+ rarity | basic — five top rarities look almost the same apart from the colour | live (d.js) | 2 |
| `tr-rarity-void` | Void frame of its own 🎨 | rarity:'void' (RARITY_DEFS colour purple-grey) | shares .rarity-tier-top with every Mythic+ rarity | basic — five top rarities look almost the same apart from the colour | live (d.js) | 2 |
| `tr-rarity-daemonic` | Daemonic frame of its own 🎨 | rarity:'daemonic' (RARITY_DEFS colour black) | shares .rarity-tier-top with every Mythic+ rarity | basic — five top rarities look almost the same apart from the colour | live (d.js) | 2 |
| `tr-rarity-special` | Special / Event / Dev rarities 🎨 | rarity quest, questunique, special, devlegendary, devancient, eventlegendary, eventrare | wear their 'as' tier's colour | basic — events have no event mark | lab-only (d.js) | 3 |
| `tr-elite-polish` | Elite enemy polish | fightTreatmentClass(pid 2) on elite nodes | .card-tile.elite-polish::after elitePolish | good — has its own look that plays at the right moment | live (d.js) | 3 |
| `tr-boss-extended` | Boss enemy extended art | fightTreatedDef on boss nodes | artExtended:true (full-bleed art) | basic — a generic or reused look that does not say what happened | live (d.js) | 3 |
| `tr-prestige-gold` | Prestige Gold ring | getCardPrestige(defId) tier on the tile | .card-tile.prestige-gold | basic — static gold ring | live (d.js) | 3 |
| `tr-prestige-rainbow` | Prestige Rainbow ring | getCardPrestige(defId) tier on the tile | .card-tile.prestige-rainbow prestigeRainbowHue | good — has its own look that plays at the right moment | live (d.js) | 3 |
| `tr-prestige-extended` | Prestige Extended Art double frame | getCardPrestige(defId) tier on the tile | .card-tile.prestige-extended prestigeRainbowHue | good — has its own look that plays at the right moment | live (d.js) | 3 |
| `tr-shiny` | Shiny hue shift | is-shiny + --shiny-hue (owned shiny copy) | hue-rotated art | good — has its own look that plays at the right moment | live (d.js) | 2 |
| `tr-shiny-mark` | Shiny mark | pack pull / nest shiny | .shiny-mark ✦ (shinyTwinkle) | basic — a generic or reused look that does not say what happened | live (d.js) | 3 |
| `tr-shiny-spawn` | Shiny spawner passes shine to its spawns | noteShinySpawn | spawns inherit is-shiny | good — has its own look that plays at the right moment | live (d.js) | 3 |
| `tr-leader-frame` | Leader on the board | board card is matchState.leaderUid | .board-card.is-leader::before leaderGlowSpin | good — has its own look that plays at the right moment | live (d.js) | 2 |
| `tr-hero-frame` | Hero card | Hero card in hall / deck | .hero-card-big + heroRing/heroLift on level-up | good — has its own look that plays at the right moment | live (d.js) | 3 |
| `tr-supreme` | Supreme card | effects.supreme | .card-tile.is-supreme stats supremeGlint | basic — small glint on the numbers only | live (d.js) | 2 |
| `tr-devilry` | Devilry card | isDevilryDef | .card-tile.is-devilry::after devilAura | good — has its own look that plays at the right moment | live (d.js) | 3 |
| `tr-antique` | Antique edition (Hall of Fame) | hallOfFame.variant antique | ed-badge / hof ribbon | basic — badge only; no aged look on the card itself | live (d.js) | 2 |
| `tr-classic` | Classic edition | hallOfFame.variant classic | ed-badge | basic — a generic or reused look that does not say what happened | live (d.js) | 3 |
| `tr-cards-of-old` | Cards of old (aged paper, foxing, creases) | holo-old finish → ProcFX.decorateOld | ProcFX.oldCardTexture | good — has its own look that plays at the right moment | live (d.js) | 3 |
| `tr-field-card` | Field card tile | is-field | .field-card .fc-ico fcSpin | good — has its own look that plays at the right moment | live (d.js) | 3 |
| `tr-token` | Token card look | is-token | token frame | basic — a generic or reused look that does not say what happened | live (d.js) | 3 |
| `tr-nest-born` | Nest-born (spawn-only) marker | spawn-only card | tooltip + marker | basic — a generic or reused look that does not say what happened | live (d.js) | 3 |
| `tr-locked` | Locked card (padlock) | card not owned in Codex / rewards | grey + padlock; reward unlock lockBreak | basic — SkillFX.unlockSparkle (padlock springs open) is Lab-only | live (d.js) | 2 |
| `tr-magnetic` | Magnetic hover tilt + shimmer | .card-tile-magnetic hover | ctShimmerSweep + tilt (wireCardTileFlourish) | good — has its own look that plays at the right moment | live (d.js) | 3 |
| `tr-atk-heat` | Hot Attack number (big attack) | atk amp tiers | .atk-amp-3/4 atkHeat | good — has its own look that plays at the right moment | live (d.js) | 3 |
| `tr-skins` | Unit skins | UnitFX.SKINS equipped skin | skin-<id> class | basic — a generic or reused look that does not say what happened | live (d.js) | 3 |
| `tr-card-back` | Card back | po2-back crest 🌰, deck piles, draw flip | single acorn crest | basic — one generic back everywhere | live (d.js) | 2 |
| `tr-card-inspect` | Card inspector spin | Codex → View large | .card-inspect (ciIn) 3D spin with finish light | good — has its own look that plays at the right moment | live (d.js) | 3 |
| `tr-future-backing-faction` | Card backings by faction / card type 🔮 🎨 | planned | none | missing — planned | live (d.js) | 2 |
| `tr-future-backing-monthly` | Monthly card back (pack-bonus reward) 🔮 🎨 | planned | none | missing — planned | lab-only (d.js) | 3 |
| `tr-future-frame-otter` | Otter (Rivergate Legion) frame 🔮 🎨 | planned | none | missing — planned | live (d.js) | 2 |
| `tr-future-frame-hummingbird` | Hummingbird (Sunfeather Tribes) frame 🔮 🎨 | planned | none | missing — planned | live (d.js) | 2 |
| `tr-future-frame-roadfolk` | Road-folk frame 🔮 🎨 | planned | none | missing — planned | live (d.js) | 3 |
| `tr-future-frame-beast` | Beast frame 🔮 🎨 | planned | none | missing — planned | live (d.js) | 3 |
| `tr-future-frame-hive` | Hive (ants, bees) frame 🔮 🎨 | planned | none | missing — planned | live (d.js) | 3 |
| `tr-future-folktale` | Folktale / "Legends" style variant 🔮 🎨 | planned | none | missing — planned | live (d.js) | 3 |
| `tr-future-oriental` | Oriental painting theme set 🔮 🎨 | planned | none | missing — planned | live (d.js) | 3 |
| `tr-future-spy` | Spy theme set 🔮 🎨 | planned | none | missing — planned | live (d.js) | 3 |
| `tr-future-veggies` | Flora frame (Maps 20+) 🔮 🎨 | planned | none | missing — planned | live (d.js) | 3 |
| `tr-future-breathing-art` | Breathing art (parallax layers) 🔮 🎨 | planned | none | missing — planned | lab-only (d.js) | 3 |
| `tr-future-living-ink` | Living ink frame (SVG turbulence) 🔮 🎨 | planned | none | missing — planned | live (d.js) | 3 |
| `tr-future-hero-portraits` | Hero portrait changes at Lv 25/50/100 🔮 🎨 | planned | none | missing — planned | lab-only (d.js) | 3 |
| `tr-frame-kinds` | Card front frames by kind (unit, structure, castle, field) 🎨 | every card face (board, hand, Codex, deck editor, big views) | cardFrameClasses → fr-<kind> + .cframe (art/frames/*.png) | good — has its own look that plays at the right moment | live (x17.js) | 1 |
| `tr-frame-arch-devilry` | Archetype frame: Devilry 🎨 | a unit or structure of the Devilry archetype | ar-devilry: art/frames/a-devilry.png (unit) / s-devilry.png (structure) | good — has its own look that plays at the right moment | live (x17.js) | 2 |
| `tr-frame-arch-grace` | Archetype frame: Ecclesia 🎨 | a unit or structure of the Ecclesia archetype | ar-grace: art/frames/a-grace.png (unit) / s-grace.png (structure) | good — has its own look that plays at the right moment | live (x17.js) | 2 |
| `tr-frame-arch-exile` | Archetype frame: Scrappers 🎨 | a unit or structure of the Scrappers archetype | ar-exile: art/frames/a-exile.png (unit) / s-exile.png (structure) | good — has its own look that plays at the right moment | live (x17.js) | 2 |
| `tr-frame-arch-evolution` | Archetype frame: Evolution 🎨 | a unit or structure of the Evolution archetype | ar-evolution: art/frames/a-evolution.png (unit) / s-evolution.png (structure) | good — has its own look that plays at the right moment | live (x17.js) | 3 |
| `tr-frame-arch-exiled` | Archetype frame: Exiled Ones 🎨 | a unit or structure of the Exiled Ones archetype | ar-exiled: art/frames/a-exiled.png (unit) / s-exiled.png (structure) | good — has its own look that plays at the right moment | live (x17.js) | 3 |
| `tr-frame-arch-forgotten` | Archetype frame: Forgotten Ones 🎨 | a unit or structure of the Forgotten Ones archetype | ar-forgotten: art/frames/a-forgotten.png (unit) / s-forgotten.png (structure) | good — has its own look that plays at the right moment | live (x17.js) | 3 |
| `tr-frame-arch-ancient` | Archetype frame: Ancient Ones 🎨 | a unit or structure of the Ancient Ones archetype | ar-ancient: art/frames/a-ancient.png (unit) / s-ancient.png (structure) | good — has its own look that plays at the right moment | live (x17.js) | 3 |
| `tr-frame-arch-outer` | Archetype frame: Outer Ones 🎨 | a unit or structure of the Outer Ones archetype | ar-outer: art/frames/a-outer.png (unit) / s-outer.png (structure) | good — has its own look that plays at the right moment | live (x17.js) | 3 |
| `tr-frame-arch-void` | Archetype frame: Void 🎨 | a unit or structure of the Void archetype | ar-void: art/frames/a-void.png (unit) / s-void.png (structure) | good — has its own look that plays at the right moment | live (x17.js) | 3 |
| `tr-card-backing` | Card backs by kind 🎨 | every face-down card (pack opener, draw flip, enemy card, pitch, reward reveals, home fan, deck piles) | cardBackClass → .bw-back.bk-<unit\|structure\|castle\|field> (art/backings/*.png) | good — has its own look that plays at the right moment | live (x17.js) | 1 |
| `tr-rarity-zoom` | Top rarity frame on a zoomed card 🎨 | the card detail / inspector of a Mythic (or Ancient, Divine, Void, Daemonic) card | FX.D FRAMES_CSS rSel matches "--rarity-a:#…" and "--rarity-a: #…", so the big card wears the same frame | good — has its own look that plays at the right moment | live (x17.js) | 2 |

### Foils (`foil`, 44)

| id | name | trigger | current | quality | status | P |
|---|---|---|---|---|---|--:|
| `foil-pearl` | Foil finish: Pearl | card tile with is-holo holo-pearl (pack pull / owned copy / workbench) → decorateHolo + pointer --hx/--hy | .card-tile.holo-pearl | good — soft pastel sheen | live (d.js) | 3 |
| `foil-rainbow` | Foil finish: Rainbow holo | card tile with is-holo holo-rainbow (pack pull / owned copy / workbench) → decorateHolo + pointer --hx/--hy | .card-tile.holo-rainbow | good — classic rainbow band | live (d.js) | 3 |
| `foil-cosmos` | Foil finish: Cosmos | card tile with is-holo holo-cosmos (pack pull / owned copy / workbench) → decorateHolo + pointer --hx/--hy | .card-tile.holo-cosmos | good — deep-space band | live (_existing.js) | 3 |
| `foil-starlight` | Foil finish: Starlight sparkle layer | card tile with is-holo holo-starlight (pack pull / owned copy / workbench) → decorateHolo + pointer --hx/--hy | .card-tile.holo-starlight | good — twinkling .holo-glitter | live (d.js) | 3 |
| `foil-hex` | Foil finish: Hex | card tile with is-holo holo-hex (pack pull / owned copy / workbench) → decorateHolo + pointer --hx/--hy | .card-tile.holo-hex | good — honeycomb lattice | live (d.js) | 3 |
| `foil-etched` | Foil finish: Etched | card tile with is-holo holo-etched (pack pull / owned copy / workbench) → decorateHolo + pointer --hx/--hy | .card-tile.holo-etched | good — engraved frame lines | live (d.js) | 3 |
| `foil-ice` | Foil finish: Cracked ice | card tile with is-holo holo-ice (pack pull / owned copy / workbench) → decorateHolo + pointer --hx/--hy | .card-tile.holo-ice | good — ice shards flash on tilt | live (d.js) | 3 |
| `foil-gold` | Foil finish: Gold leaf | card tile with is-holo holo-gold (pack pull / owned copy / workbench) → decorateHolo + pointer --hx/--hy | .card-tile.holo-gold | good — warm gold sheen + rim | live (d.js) | 3 |
| `foil-reverse` | Foil finish: Reverse holo | card tile with is-holo holo-reverse (pack pull / owned copy / workbench) → decorateHolo + pointer --hx/--hy | .card-tile.holo-reverse | good — rainbow frame, plain art | live (d.js) | 3 |
| `foil-prism` | Foil finish: Prism | card tile with is-holo holo-prism (pack pull / owned copy / workbench) → decorateHolo + pointer --hx/--hy | .card-tile.holo-prism | good — prismatic facets | live (d.js) | 3 |
| `foil-lattice` | Foil finish: Lattice | card tile with is-holo holo-lattice (pack pull / owned copy / workbench) → decorateHolo + pointer --hx/--hy | .card-tile.holo-lattice | basic — not rollable | live (d.js) | 3 |
| `foil-aurora` | Foil finish: Aurora | card tile with is-holo holo-aurora (pack pull / owned copy / workbench) → decorateHolo + pointer --hx/--hy | .card-tile.holo-aurora | good — animated finish | live (_existing.js, d.js) | 3 |
| `foil-galaxy` | Foil finish: Galaxy swirl | card tile with is-holo holo-galaxy (pack pull / owned copy / workbench) → decorateHolo + pointer --hx/--hy | .card-tile.holo-galaxy | good — animated finish | live (d.js) | 3 |
| `foil-molten` | Foil finish: Molten gold | card tile with is-holo holo-molten (pack pull / owned copy / workbench) → decorateHolo + pointer --hx/--hy | .card-tile.holo-molten | good — animated finish | live (d.js) | 3 |
| `foil-frost` | Foil finish: Frost crystal | card tile with is-holo holo-frost (pack pull / owned copy / workbench) → decorateHolo + pointer --hx/--hy | .card-tile.holo-frost | good — animated finish | live (d.js) | 3 |
| `foil-oilslick` | Foil finish: Oil slick | card tile with is-holo holo-oilslick (pack pull / owned copy / workbench) → decorateHolo + pointer --hx/--hy | .card-tile.holo-oilslick | good — animated finish | live (d.js) | 3 |
| `foil-sakura` | Foil finish: Sakura petals | card tile with is-holo holo-sakura (pack pull / owned copy / workbench) → decorateHolo + pointer --hx/--hy | .card-tile.holo-sakura | good — animated finish | live (d.js) | 3 |
| `foil-sparkle` | Foil finish: Glitter field | card tile with is-holo holo-sparkle (pack pull / owned copy / workbench) → decorateHolo + pointer --hx/--hy | .card-tile.holo-sparkle | good — animated finish | live (d.js) | 3 |
| `foil-scanline` | Foil finish: Holo scanlines | card tile with is-holo holo-scanline (pack pull / owned copy / workbench) → decorateHolo + pointer --hx/--hy | .card-tile.holo-scanline | good — animated finish | live (d.js) | 3 |
| `foil-old` | Foil finish: Cards of old | card tile with is-holo holo-old (pack pull / owned copy / workbench) → decorateHolo + pointer --hx/--hy | .card-tile.holo-old | good — animated finish | live (_existing.js) | 3 |
| `foil-splash` | Legacy splashEffect foil (shimmer ring) | d.splashEffect==='foil' → .card-tile-foil | foilShimmer + foilRingShift | good — has its own look that plays at the right moment | live (d.js) | 3 |
| `foil-tilt-board` | Foil light on the board / in hand | foil units in a fight | finish shows, light only drifts (holoDrift) | basic — no light response in fights; hand tilt on hold | live (d.js) | 2 |
| `foil-new-ember` | New foil idea: Ember crackle 🔮 🎨 | planned new finish | none | missing — idea | future | 3 |
| `foil-new-tide` | New foil idea: Tide caustics 🔮 🎨 | planned new finish | none | missing — idea | future | 3 |
| `foil-new-bramble` | New foil idea: Bramble vine 🔮 🎨 | planned new finish | none | missing — idea | future | 3 |
| `foil-new-firefly` | New foil idea: Firefly night 🔮 🎨 | planned new finish | none | missing — idea | future | 3 |
| `foil-new-feather` | New foil idea: Hummingbird iridescence 🔮 🎨 | planned new finish | none | missing — idea | future | 3 |
| `foil-new-bronze` | New foil idea: Legion bronze 🔮 🎨 | planned new finish | none | missing — idea | future | 3 |
| `foil-new-inkwash` | New foil idea: Ink wash 🔮 🎨 | planned new finish | none | missing — idea | future | 3 |
| `foil-new-redacted` | New foil idea: Redacted 🔮 🎨 | planned new finish | none | missing — idea | future | 3 |
| `foil-new-stainedglass` | New foil idea: Stained glass 🔮 🎨 | planned new finish | none | missing — idea | future | 3 |
| `foil-new-void` | New foil idea: Void static 🔮 🎨 | planned new finish | none | missing — idea | future | 3 |
| `foil-new-hellfire` | New foil idea: Hellfire 🔮 🎨 | planned new finish | none | missing — idea | future | 3 |
| `foil-new-radioactive` | New foil idea: Radioactive glow 🔮 🎨 | planned new finish | none | missing — idea | future | 3 |
| `foil-new-ghostmist` | New foil idea: Ghost mist 🔮 🎨 | planned new finish | none | missing — idea | future | 3 |
| `foil-new-dragonscale` | New foil idea: Dragon scale 🔮 🎨 | planned new finish | none | missing — idea | future | 3 |
| `foil-new-mycelium` | New foil idea: Mycelium 🔮 🎨 | planned new finish | none | missing — idea | future | 3 |
| `foil-new-bioluminescent` | New foil idea: Bioluminescent 🔮 🎨 | planned new finish | none | missing — idea | future | 3 |
| `foil-new-mirage` | New foil idea: Desert mirage 🔮 🎨 | planned new finish | none | missing — idea | future | 3 |
| `foil-new-storm` | New foil idea: Storm 🔮 🎨 | planned new finish | none | missing — idea | future | 3 |
| `foil-new-autumn` | New foil idea: Autumn leaf 🔮 🎨 | planned new finish | none | missing — idea | future | 3 |
| `foil-new-moonphase` | New foil idea: Moon phase 🔮 🎨 | planned new finish | none | missing — idea | future | 3 |
| `foil-new-constellation` | New foil idea: Constellation 🔮 🎨 | planned new finish | none | missing — idea | future | 3 |
| `foil-new-cream-pearl` | New foil idea: Cream pearl (booster foil) 🔮 🎨 | planned new finish | none | missing — idea | future | 3 |

### Pack and card opening (`pack-card-open`, 39)

| id | name | trigger | current | quality | status | P |
|---|---|---|---|---|---|--:|
| `pack-idle` | Pack waiting to be opened | po2 stage 1 | .po2-pack.is-idle po2Float / po2GlowPulse, po2Sheen | good — has its own look that plays at the right moment | live (d.js) | 2 |
| `pack-glow` | Pack glows with a hint of the best card | rollPackGlow (sometimes ±1–2 tiers off) | --glow leak colour + .po2-leak | good — has its own look that plays at the right moment | live (d.js) | 2 |
| `pack-jackpot` | Jackpot pack | opened pack has o.jackpot | .po2-pack.is-jackpot po2Jackpot + 👑 burst + rareRise | good — has its own look that plays at the right moment | live (d.js) | 2 |
| `pack-stack` | Several packs layered | multiple reward packs queued | layered pile behind the current pack | good — has its own look that plays at the right moment | live (d.js) | 3 |
| `pack-tear` | Tear the strip | drag across .po2-strip | --tear progress, pageTurn ticks, po2Snip/po2StripOff | good — has its own look that plays at the right moment | live (d.js) | 1 |
| `pack-burst` | Pack bursts open | tear() complete | .is-open + burst(pack.icon, ✨) + swipeTone + gold | good — has its own look that plays at the right moment | live (d.js) | 1 |
| `pack-legacy-shake` | Legacy pack shake + light leak | old pack opener (.pack-open-pack) | poShake + leakRays | basic — older opener path | lab-only (d.js) | 3 |
| `pack-deal` | Cards deal out | showReveal | .po2-card po2DealIn fan | good — has its own look that plays at the right moment | live (_existing.js) | 2 |
| `pack-tease-rare` | Rare tease (Rare – Super Rare) | current card is tease-rare → po2Tease (+ po2Rattle and sparks for legend) + rareRise | .po2-card.tease-rare | good — has its own look that plays at the right moment | live (d.js) | 2 |
| `pack-tease-epic` | Epic tease (Epic – Legendary) | current card is tease-epic → po2Tease (+ po2Rattle and sparks for legend) + rareRise | .po2-card.tease-epic | good — has its own look that plays at the right moment | live (d.js) | 2 |
| `pack-tease-legend` | Legend tease (tier 11+) | current card is tease-legend → po2Tease (+ po2Rattle and sparks for legend) + rareRise | .po2-card.tease-legend | good — has its own look that plays at the right moment | live (d.js) | 2 |
| `pack-rays` | Light rays on reveal (Rare+) | reveal() tier ≥4 or new → .po2-reveal.is-rays | po2Rays in rarity colour | good — has its own look that plays at the right moment | live (d.js) | 2 |
| `pack-rays-big` | Big fast rays (Epic+) | tier ≥7 → .is-rays-big | po2Rays big | good — has its own look that plays at the right moment | live (d.js) | 2 |
| `pack-spark` | Spark / Superspark | sparkChance(rarity) roll on reveal | .is-spark / .is-superspark + emoji bursts | good — has its own look that plays at the right moment | live (d.js) | 3 |
| `pack-reveal-mythic` | Mythic pull gets its own reveal 🎨 | reveal() of a mythic card | same as every tier 11+ (legend tease + big rays) | missing — top rarities share one reveal | live (d.js) | 1 |
| `pack-reveal-ancient` | Ancient pull gets its own reveal 🎨 | reveal() of a ancient card | same as every tier 11+ (legend tease + big rays) | missing — top rarities share one reveal | live (d.js) | 2 |
| `pack-reveal-divine` | Divine pull gets its own reveal 🎨 | reveal() of a divine card | same as every tier 11+ (legend tease + big rays) | missing — top rarities share one reveal | live (d.js) | 2 |
| `pack-reveal-void` | Void pull gets its own reveal 🎨 | reveal() of a void card | same as every tier 11+ (legend tease + big rays) | missing — top rarities share one reveal | live (d.js) | 2 |
| `pack-reveal-daemonic` | Daemonic pull gets its own reveal 🎨 | reveal() of a daemonic card | same as every tier 11+ (legend tease + big rays) | missing — top rarities share one reveal | live (d.js) | 2 |
| `pack-reveal-foil` | Foil pull reveal 🎨 | reveal() of a card with a foil finish (pullClass) | finish shows on the face, nothing more | missing — a foil is a big moment with no moment | live (d.js) | 1 |
| `pack-reveal-shiny` | Shiny pull reveal | reveal() of r.shiny | .shiny-mark ✦ | basic — a generic or reused look that does not say what happened | live (d.js) | 2 |
| `pack-new-card` | NEW! card | reveal() of r.isNew | is-new-moment po2NewBorder + po2Stamp NEW! + unlockChime + burst + po2-flash | good — has its own look that plays at the right moment | live (d.js) | 1 |
| `pack-duplicate` | Duplicate (×N) pull | r.count>1 | retired 2026-10-17: the "×2" with two blank cards (fired on any card you already owned) is gone; a real bonus copy is pack-bonus-copy | basic — no dust/level progress cue | retired | 3 |
| `pack-collect` | Card flies to the row | collect() | po2-fly ghost arc + mini pop | good — has its own look that plays at the right moment | live (d.js) | 3 |
| `pack-sweep-reveal` | Sweep across to reveal | pointer sweep >60% of the card | reveal() | good — has its own look that plays at the right moment | live (d.js) | 3 |
| `pack-summary` | Pack summary | showSummary | summary grid + ProcFX.ripple wave + pointer lean | good — has its own look that plays at the right moment | live (d.js) | 3 |
| `pack-open-all-table` | Open all: slash table (10+ packs) | Open-all with 10+ packs | packs laid out, each opens when the slash crosses it; next ten slide in | good — has its own look that plays at the right moment | live (d.js) | 2 |
| `pack-crate` | 100+ packs: crate | opening 100+ | .po2-crate.is-open po2CrateShake | good — has its own look that plays at the right moment | live (d.js) | 3 |
| `pack-pile` | Huge pile reveal | pile mode | .po2-pile-count | good — has its own look that plays at the right moment | live (d.js) | 3 |
| `pack-faction` | Faction pack (Rivergate / Sunfeather) | openFactionPack | same opener | basic — no faction dressing | live (d.js) | 2 |
| `pack-mystery` | Mystery Booster | buy from the wandering trader | mysteryBoing + same opener | basic — a generic or reused look that does not say what happened | live (d.js) | 3 |
| `pack-free-courier` | Free pack courier hands it over | tap Bramble the courier mouse | courier bob → opener | good — has its own look that plays at the right moment | live (d.js) | 3 |
| `pack-purchase` | Buy a pack | buyPack | coinRegister + counter | good — has its own look that plays at the right moment | live (d.js) | 3 |
| `pack-discover` | Discovered pop-up (first time a card is seen) | discover-card | .discover-burst + discoverShine | good — has its own look that plays at the right moment | live (d.js) | 3 |
| `pack-reward-unlock` | Card unlocked on the results screen | rewardCardsReveal | padlock shakes and breaks (lockBreak) + shine + NEW! | good — has its own look that plays at the right moment | live (d.js) | 2 |
| `pack-pity` | Pity guarantee (new card / Epic every 30 packs) 🔮 | planned | none | missing — planned | live (d.js) | 3 |
| `pack-odds` | Pack odds shown in the Shop 🔮 | planned guardrail | none | missing — planned | live (d.js) | 3 |
| `pack-bonus-copy` | Bonus copy ("Bonus!") | a pack card that rolls a bonus copy (Common 5% … halving from Epic) | .po2-bonus-copy slides out from behind the card, "Bonus! +1 copy" tag, unlockChime and a burst | good — has its own look that plays at the right moment | live (x17.js) | 2 |
| `pack-count-down` | Pile count counts down | opening a big pile of packs | #poPileCount "N cards" counts down as each card is revealed | basic — the number counts down | live (x17.js) | 2 |

### Rewards and results (`rewards-results`, 24)

| id | name | trigger | current | quality | status | P |
|---|---|---|---|---|---|--:|
| `res-victory` | Victory card | match won → winloss-card.is-glory | .wl-rays (wlRays) + win fanfare | good — has its own look that plays at the right moment | live (f.js) | 1 |
| `res-defeat` | Defeat card | match lost → is-fallen | .wl-dusk ashFall | good — has its own look that plays at the right moment | live (f.js) | 1 |
| `res-draw` | Draw result | match drawn | plain result card | basic — a generic or reused look that does not say what happened | live (f.js) | 3 |
| `res-victory-toss` | Victory toss | victoryParade | winners launched, spin, bump | good — has its own look that plays at the right moment | live (f.js) | 2 |
| `res-loss-scatter` | Units scatter on loss/draw | opts.scatter | .is-scattering cardScatter | good — has its own look that plays at the right moment | live (f.js) | 3 |
| `res-first-clear` | First clear | first clear of a node | .wl-firstclear::after wlShine | good — has its own look that plays at the right moment | live (f.js) | 2 |
| `res-rank-stamp` | Rank earned (B/A/S/SS/SSS) | m.conquestRankEarned | .rank-hex.wl-rank + rankFoil/sssPulse | good — has its own look that plays at the right moment | live (f.js) | 2 |
| `res-rank-lesson` | Rank lesson | first ranks | retired 2026-10-16: the results no longer show the rank lesson box; the rank hex says it | basic — a generic or reused look that does not say what happened | retired | 3 |
| `res-reward-reveal` | Reward reveal (cards / unlock tokens) | playRewardReveal | dark card back, shine builds, flash, NEW!; tokens drop with a slight shake | good — has its own look that plays at the right moment | live (f.js) | 1 |
| `res-reward-cards` | Reward cards unlocked | rewardCardsReveal | "Card unlocked!" splash + padlock break + shine + NEW! | good — has its own look that plays at the right moment | live (f.js) | 1 |
| `res-coin-shower` | Currency lands | rewardsCheer | glyphs rain into pills, pills pop | good — has its own look that plays at the right moment | live (f.js) | 2 |
| `res-count-up` | Reward numbers count up | wireWinLossRewardAnim | staggered spring pills + countPop | good — has its own look that plays at the right moment | live (f.js) | 3 |
| `res-pack-won` | Pack won | floatRewardPackUp | .rw-pack-art rwPackBob/rwPackGlow | good — has its own look that plays at the right moment | live (f.js) | 2 |
| `res-held-packs` | Packs won before the Armoury released | releaseHeldPacks | queued reveal | basic — a generic or reused look that does not say what happened | live (f.js) | 3 |
| `res-achv-on-results` | Achievement earned on the results screen | winloss achievements | .winloss-achv waPop | good — has its own look that plays at the right moment | live (f.js) | 3 |
| `res-star-fall` | Star fall celebration | worthCelebrating wins / forge | starFallVfx.celebrate | good — has its own look that plays at the right moment | live (f.js) | 3 |
| `res-dragon-scale` | Dragon Scale found on the results | rollDragonScale (S rank) | line / unlock | basic — a generic or reused look that does not say what happened | live (f.js) | 2 |
| `res-boss-leader` | Boss leader granted | grantClearedBossLeaders | listed | basic — a generic or reused look that does not say what happened | live (f.js) | 2 |
| `res-faction-crown` | Map 20 faction crown (Epic + Heroic) | grantMap20FactionCrown | listed | basic — a generic or reused look that does not say what happened | retired | 2 |
| `res-materia-drop` | Materia / ore drops | rollMateriaDrops | chips | basic — a generic or reused look that does not say what happened | live (f.js) | 3 |
| `res-card-drop` | Card drop from a fight | rollCardDrop | reward reveal | good — has its own look that plays at the right moment | live (f.js) | 3 |
| `res-xp-line` | XP and level on results | results | retired 2026-10-16: the "+3 XP" gold bar with its glow over the results is gone; an account level-up plays after the results close | basic — a generic or reused look that does not say what happened | retired | 3 |
| `res-tutorial-result` | Tutorial win/loss | tutorialWinLossTitle | result card | basic — a generic or reused look that does not say what happened | live (f.js) | 3 |
| `res-castle-falls` | Castle falls under the sign | castleCrumble at match end | shudder, dust, burn | good — has its own look that plays at the right moment | live (f.js) | 2 |

### Meta progression (level, forge, nest, inventory, shop, achievements, quests, energy) (`meta-progression`, 54)

| id | name | trigger | current | quality | status | P |
|---|---|---|---|---|---|--:|
| `meta-forge-temper` | Forge: temper (card level-up) | forgeTemper | forgeTemperAnimation (ProcFX.forge heat → hammer → quench → shine) + SkillFX.levelUp burst | good — has its own look that plays at the right moment | live (d.js, r.js) | 1 |
| `meta-forge-limit-break` | Forge: limit break (Lv 10 → 11) | forgeLimitBreak | forgeSmithAnimation(heavy) flip + starFall | basic — shares the generic smith flip; no limit-break moment of its own | live (d.js) | 1 |
| `meta-forge-promote` | Forge: promote (to the next rarity) | forgePromote | forgeSmithAnimation(heavy) | basic — no rarity-up colour change moment | live (d.js) | 2 |
| `meta-forge-prestige` | Forge: prestige (Gold / Rainbow / Extended) | forgePrestige | forgeSmithAnimation(heavy) + prestigeTone | basic — a generic or reused look that does not say what happened | live (d.js) | 2 |
| `meta-forge-refine` | Forge: refine (finish step: prism, gold...) | forgeRefine | forgeSmithAnimation(heavy for prism/gold) | basic — new finish not showcased | live (d.js) | 2 |
| `meta-forge-enchant` | Forge: enchant / craft Materia | forgeEnchant / craftMateria | materiaBurstVfx (crystal forms, spins, drops) + materiaForm | good — has its own look that plays at the right moment | live (d.js) | 2 |
| `meta-forge-melt` | Forge: melt duplicates for Dust | forgeMeltBtn / disenchantAllExtras | toast | missing — nothing on screen | live (d.js) | 2 |
| `meta-forge-fuse` | Blacksmith: fuse 3 copies into a higher card / craft equipment | blacksmith recipes | smithBurst + starFall | basic — a generic or reused look that does not say what happened | live (d.js) | 2 |
| `meta-forge-tier-up` | Forge tier upgrade | upgradeForge | toast | missing — nothing on screen | live (d.js) | 3 |
| `meta-forge-entrance` | Forge flare-up on entering | forgeOnScreen → forgeFlareUp | .forge-flareup ffTongue | good — has its own look that plays at the right moment | live (d.js) | 3 |
| `meta-castle-temper` | Castle temper / level-up | temperCastle | castle level text | basic — a generic or reused look that does not say what happened | live (d.js) | 2 |
| `meta-castle-drop` | Castle won from a pack / map | grantDropCastle / rollPackCastle | listed | basic — a generic or reused look that does not say what happened | live (f.js) | 3 |
| `meta-hero-level` | Hero level-up | heroGainXp level-up (+ Hall opens next time) | heroHallLevelFlourish ring + heroLevel bell | good — has its own look that plays at the right moment | live (f.js) | 2 |
| `meta-hero-skill-pick` | Hero skill pick (Lv 5/15/30/50/75/100) | renderHeroHall skill slot | choice UI | missing — picking a new skill has no reward moment | live (f.js) | 2 |
| `meta-hero-stat-spend` | Hero stat point spent | Hall +1 Attack/Health/Wait | numbers update | missing — nothing on screen | live (f.js) | 3 |
| `meta-nest-egg-place` | Place an egg in the Nest | placeEggInNest | re-render | missing — nothing on screen | live (f.js) | 2 |
| `meta-nest-egg-idle` | Eggs in the Nest | nest egg waiting | .nest-egg eggWobble | good — has its own look that plays at the right moment | live (f.js) | 3 |
| `meta-nest-hatch` | Egg hatches (Nest) | hatchEgg → hatchRevealVfx | hatch overlay: rock, crack stages, burst, beams (hatch-uncommon / hatch-rare / is-shining) + unlockChime | good — has its own look that plays at the right moment | live (f.js) | 1 |
| `meta-nest-kibble-train` | Train a Level-0 card with Kibble | nest picker → train | re-render + .hay-nest.is-baby babyBob | basic — a generic or reused look that does not say what happened | live (f.js) | 3 |
| `meta-nest-trained` | Kibble training done (Level 1) | training finished | .hay-nest.is-ready readyHop + metaFx levelUp LEVEL 1! | good — has its own look that plays at the right moment | live (f.js) | 2 |
| `meta-nest-egg-drop` | Egg dropped from a win | rollEggDrop / grantEgg | results line | basic — a generic or reused look that does not say what happened | live (f.js) | 2 |
| `meta-inventory-new` | New item in the Inventory | loadItems change | .inv-new invNewPop/invNewBob | basic — a generic or reused look that does not say what happened | live (f.js) | 3 |
| `meta-shop-buy` | Shop purchase | buyPack / shelf buy | coinRegister + shelfPick + counter (counterSlide) | good — has its own look that plays at the right moment | live (f.js) | 3 |
| `meta-shop-wanderer-deal` | Wandering merchant deal | openWandererDeal | modal | basic — a generic or reused look that does not say what happened | live (f.js) | 3 |
| `meta-energy-spend` | Energy spent on a fight | spendEnergy | HUD number | basic — a generic or reused look that does not say what happened | live (f.js) | 3 |
| `meta-energy-short` | Not enough Energy | energyShortToast | .energy-short-toast energyToastIn | good — has its own look that plays at the right moment | live (f.js) | 3 |
| `meta-energy-tick` | Energy refills (+1 every 5 min) / full | settleEnergy tick | countdown text | missing — nothing on screen | live (f.js) | 3 |
| `meta-energy-capsule` | Energy capsule used | useEnergyCapsule | toast + number | basic — a generic or reused look that does not say what happened | live (f.js) | 3 |
| `meta-energy-free` | Free daily Energy claimed | #epFree click | toast | basic — a generic or reused look that does not say what happened | live (f.js) | 3 |
| `meta-energy-upgrade` | Max Energy upgrade (Camp / Forge) | buyEnergyUpgrade | number | missing — nothing on screen | live (f.js) | 3 |
| `meta-stamina` | Stamina bought (Tavern) | buyStamina | pips (mseBob ready) | basic — a generic or reused look that does not say what happened | live (f.js) | 3 |
| `meta-achv-ready` | Achievement ready to claim | achievementStatus claimable | .achv-tile.is-ready achvGlow | good — has its own look that plays at the right moment | live (f.js) | 3 |
| `meta-achv-claim` | Achievement claimed | claimAchievement → rewardRush | rewardRush (reward chips fly to the wallet) | good — has its own look that plays at the right moment | live (f.js) | 2 |
| `meta-achv-unlocked-live` | Achievement unlocked (the moment it happens) | achievement condition met during play | new-achievements chip only | missing — no pop when it happens | live (f.js) | 2 |
| `meta-quest-ready` | Quest ready to claim | claimableQuestCount | .qn-note.is-ready qnPulse | good — has its own look that plays at the right moment | live (f.js) | 3 |
| `meta-quest-claim` | Quest claimed | claimQuest → questRewardFlight + rewardRush | reward flight + starFall | good — has its own look that plays at the right moment | live (f.js) | 2 |
| `meta-quest-progress` | Quest progress ticks | bumpQuestCounter | badge count | basic — a generic or reused look that does not say what happened | live (f.js) | 3 |
| `meta-errand-offer` | Errand offered after a win | maybeOfferErrand (30% from Map 9) | npc prompt | basic — a generic or reused look that does not say what happened | live (f.js) | 3 |
| `meta-errand-claim` | Errand completed | claimErrand | rewardRush | good — has its own look that plays at the right moment | live (f.js) | 3 |
| `meta-daily-notice-swap` | Daily notice swaps | swapDailyNotice | re-render | basic — a generic or reused look that does not say what happened | live (f.js) | 3 |
| `meta-account-level` | Account level-up | awardXp crosses a level | toast "⭐ Level N!" | basic — toast only for a player level-up | live (f.js) | 1 |
| `meta-xp-gain` | XP gained | awardXp | toast + level bar | basic — a generic or reused look that does not say what happened | live (f.js) | 3 |
| `meta-wildpath-learn` | Wildpath perk learned | wp tree learn | .wp-draw .wp-ink (wpInk) + wpNodeIn + wpPulse | good — has its own look that plays at the right moment | live (f.js) | 3 |
| `meta-card-unlock` | Card unlocked for the player | unlockCardForPlayer | discover pop-up / rewards reveal | good — has its own look that plays at the right moment | live (f.js) | 3 |
| `meta-card-level-codex` | Card level shown in Codex / pips | forge pips | .forge-pips i.next pipPulse + forgeLvlPop | good — has its own look that plays at the right moment | live (f.js) | 3 |
| `meta-daily-login` | Daily login reward / streak 🔮 | planned (not built) | none | missing — no daily login system exists | lab-only (f.js) | 2 |
| `meta-monthly-bonus` | Monthly pack-opening bonus steps 🔮 | planned | none | missing — planned | lab-only (f.js) | 3 |
| `meta-bramble-pass` | Bramble Pass daily pouch 🔮 | planned | none | missing — planned | lab-only (f.js) | 3 |
| `meta-steam-achv` | Steam achievements / overlay 🔮 | planned (Steam build) | none | missing — planned | lab-only (f.js) | 3 |
| `meta-attunement` | Attunement instead of levels (every 100 maps) 🔮 | planned | none | missing — planned | lab-only (f.js) | 3 |
| `meta-alchemy` | Alchemy free top-ups (Map 65+) 🔮 | planned | none | missing — planned | lab-only (f.js) | 3 |
| `meta-dragon-egg-craft` | Craft a dragon egg 🔮 | planned (Map 50+, a month of farming) | none | missing — planned | lab-only (f.js) | 2 |
| `meta-materia-socket` | Socket Materia into the Hero (v2) 🔮 | planned | none | missing — planned | lab-only (f.js) | 3 |
| `meta-bring-effect` | Bring your own effect (Map 80+) 🔮 | planned | none | missing — planned | lab-only (f.js) | 3 |

### Conquest map (`conquest-map`, 151)

| id | name | trigger | current | quality | status | P |
|---|---|---|---|---|---|--:|
| `map-amb-m1` | Map ambience: Bramblewood Outskirts (m1) 🎨 | conquest map m1 shown → mountMapShader(host, 'm1') + startMapMovers + generatedMapDecor | shader kind 4: savanna (heat shimmer, dust, sun shafts); decor biome meadow with 🐝 bees | basic — shader look does not match the place (e.g. savanna shimmer on a misty meadow) | live (e.js) | 2 |
| `map-amb-mtut` | Map ambience: Tutorial (mtut) | conquest map mtut shown → mountMapShader(host, 'mtut') + startMapMovers + generatedMapDecor | shader kind 4: savanna (heat shimmer, dust, sun shafts); decor biome meadow with 🐝 bees | good — shader + moving critters | live (e.js) | 3 |
| `map-amb-mo` | Map ambience: The Old Bramble (mo) 🎨 | conquest map mo shown → mountMapShader(host, 'mo') + startMapMovers + generatedMapDecor | no shader kind in MAP_KIND (no map overlay; battle ambience/shader fall back to forest); decor biome forest with 🦋 butterflies | missing — map has no weather/light layer of its own | live (e.js) | 2 |
| `map-amb-mf` | Map ambience: Thistlewood (mf) | conquest map mf shown → mountMapShader(host, 'mf') + startMapMovers + generatedMapDecor | shader kind 0: forest (canopy dapple, light shafts, fireflies); decor biome forest with 🦋 butterflies | good — shader + moving critters | live (e.js) | 3 |
| `map-amb-mq` | Map ambience: Clovermead (mq) 🎨 | conquest map mq shown → mountMapShader(host, 'mq') + startMapMovers + generatedMapDecor | no shader kind in MAP_KIND (no map overlay; battle ambience/shader fall back to forest); decor biome meadow with 🐝 bees | missing — map has no weather/light layer of its own | live (e.js) | 2 |
| `map-amb-mb` | Map ambience: Pebble Beach (mb) | conquest map mb shown → mountMapShader(host, 'mb') + startMapMovers + generatedMapDecor | shader kind 12: beach (warm sun, foam lines, spray); decor biome beach with 🦀 crabs | good — shader + moving critters | live (e.js) | 3 |
| `map-amb-mp` | Map ambience: Lilypad Reach (mp) | conquest map mp shown → mountMapShader(host, 'mp') + startMapMovers + generatedMapDecor | shader kind 1: water (caustics, glints); decor biome water with 🐟 fish | good — shader + moving critters | live (e.js) | 3 |
| `map-amb-mg` | Map ambience: Smugglers' Grotto (mg) | conquest map mg shown → mountMapShader(host, 'mg') + startMapMovers + generatedMapDecor | shader kind 3: caves (fog, spores, pointer lantern); decor biome cave with 🦇 bats | good — shader + moving critters | live (e.js) | 3 |
| `map-amb-mc` | Map ambience: Gannet Cliffs (mc) 🎨 | conquest map mc shown → mountMapShader(host, 'mc') + startMapMovers + generatedMapDecor | shader kind 12: beach (warm sun, foam lines, spray); decor biome alpine with 🦅 birds | basic — shader look does not match the place (e.g. savanna shimmer on a misty meadow) | live (e.js) | 2 |
| `map-amb-m2` | Map ambience: Sunken Hollow (m2) | conquest map m2 shown → mountMapShader(host, 'm2') + startMapMovers + generatedMapDecor | shader kind 1: water (caustics, glints); decor biome water with 🐟 fish | good — shader + moving critters | live (e.js) | 3 |
| `map-amb-mw` | Map ambience: Gatorback Swamp (mw) | conquest map mw shown → mountMapShader(host, 'mw') + startMapMovers + generatedMapDecor | shader kind 7: swamp (low fog, murk, green fireflies); decor biome swamp with ✨ fireflies | good — shader + moving critters | live (e.js) | 3 |
| `map-amb-ms` | Map ambience: The Sunken Grove (ms) 🎨 | conquest map ms shown → mountMapShader(host, 'ms') + startMapMovers + generatedMapDecor | no shader kind in MAP_KIND (no map overlay; battle ambience/shader fall back to forest); decor biome swamp with ✨ fireflies | missing — map has no weather/light layer of its own | live (e.js) | 2 |
| `map-amb-m8` | Map ambience: Sable Swampmire (m8) | conquest map m8 shown → mountMapShader(host, 'm8') + startMapMovers + generatedMapDecor | shader kind 7: swamp (low fog, murk, green fireflies); decor biome swamp with ✨ fireflies | good — shader + moving critters | live (e.js) | 3 |
| `map-amb-mu` | Map ambience: The Morel Hollow (mu) | conquest map mu shown → mountMapShader(host, 'mu') + startMapMovers + generatedMapDecor | shader kind 0: forest (canopy dapple, light shafts, fireflies); decor biome forest with 🦋 butterflies | good — shader + moving critters | live (e.js) | 3 |
| `map-amb-mz` | Map ambience: The Mycelium Deep (mz) 🎨 | conquest map mz shown → mountMapShader(host, 'mz') + startMapMovers + generatedMapDecor | no shader kind in MAP_KIND (no map overlay; battle ambience/shader fall back to forest); decor biome forest (default) with 🦋 butterflies | missing — map has no weather/light layer of its own | live (e.js) | 2 |
| `map-amb-m4` | Map ambience: Caves & Alcoves (m4) | conquest map m4 shown → mountMapShader(host, 'm4') + startMapMovers + generatedMapDecor | shader kind 3: caves (fog, spores, pointer lantern); decor biome cave with 🦇 bats | good — shader + moving critters | live (e.js) | 3 |
| `map-amb-mn` | Map ambience: The Glimmer Depths (mn) 🎨 | conquest map mn shown → mountMapShader(host, 'mn') + startMapMovers + generatedMapDecor | no shader kind in MAP_KIND (no map overlay; battle ambience/shader fall back to forest); decor biome cave with 🦇 bats | missing — map has no weather/light layer of its own | live (e.js) | 2 |
| `map-amb-mk` | Map ambience: The Kelp Mangroves (mk) | conquest map mk shown → mountMapShader(host, 'mk') + startMapMovers + generatedMapDecor | shader kind 6: coral (caustics + bubbles); decor biome reef with 🐠 fish | good — shader + moving critters | live (e.js) | 3 |
| `map-amb-m7` | Map ambience: Coral Current (m7) | conquest map m7 shown → mountMapShader(host, 'm7') + startMapMovers + generatedMapDecor | shader kind 6: coral (caustics + bubbles); decor biome reef with 🐠 fish | good — shader + moving critters | live (e.js) | 3 |
| `map-amb-mj` | Map ambience: The Sunken Depths (mj) | conquest map mj shown → mountMapShader(host, 'mj') + startMapMovers + generatedMapDecor | shader kind 6: coral (caustics + bubbles); decor biome reef with 🐠 fish | good — shader + moving critters | live (e.js, r.js) | 3 |
| `map-amb-m10` | Map ambience: Eyrie Heights (m10) | conquest map m10 shown → mountMapShader(host, 'm10') + startMapMovers + generatedMapDecor | shader kind 9: sky (clouds, wind); decor biome alpine with 🦅 birds | good — shader + moving critters | live (e.js) | 3 |
| `map-amb-mv` | Map ambience: The Aerie Vault (mv) 🎨 | conquest map mv shown → mountMapShader(host, 'mv') + startMapMovers + generatedMapDecor | no shader kind in MAP_KIND (no map overlay; battle ambience/shader fall back to forest); decor biome alpine with 🦅 birds | missing — map has no weather/light layer of its own | live (e.js) | 2 |
| `map-amb-mh` | Map ambience: The Briar Maze (mh) | conquest map mh shown → mountMapShader(host, 'mh') + startMapMovers + generatedMapDecor | shader kind 4: savanna (heat shimmer, dust, sun shafts); decor biome meadow with 🐝 bees | good — shader + moving critters | live (e.js) | 3 |
| `map-amb-mr` | Map ambience: The Redwood Deep (mr) | conquest map mr shown → mountMapShader(host, 'mr') + startMapMovers + generatedMapDecor | shader kind 0: forest (canopy dapple, light shafts, fireflies); decor biome forest with 🦋 butterflies | good — shader + moving critters | live (e.js) | 3 |
| `map-amb-m5` | Map ambience: Savanna Reaches (m5) | conquest map m5 shown → mountMapShader(host, 'm5') + startMapMovers + generatedMapDecor | shader kind 4: savanna (heat shimmer, dust, sun shafts); decor biome savanna with 🦋 butterflies | good — shader + moving critters | live (e.js) | 3 |
| `map-amb-my` | Map ambience: The Canopy (my) | conquest map my shown → mountMapShader(host, 'my') + startMapMovers + generatedMapDecor | shader kind 0: forest (canopy dapple, light shafts, fireflies); decor biome forest with 🦋 butterflies | good — shader + moving critters | live (e.js) | 3 |
| `map-amb-ml` | Map ambience: The Long Grass (ml) | conquest map ml shown → mountMapShader(host, 'ml') + startMapMovers + generatedMapDecor | shader kind 4: savanna (heat shimmer, dust, sun shafts); decor biome meadow with 🐝 bees | good — shader + moving critters | live (e.js) | 3 |
| `map-amb-mt` | Map ambience: The Pinewood Taiga (mt) | conquest map mt shown → mountMapShader(host, 'mt') + startMapMovers + generatedMapDecor | shader kind 5: tundra (aurora, snowfall); decor biome tundra with 🐦 birds | good — shader + moving critters | live (e.js) | 3 |
| `map-amb-m6` | Map ambience: Wolfsbane Tundra (m6) | conquest map m6 shown → mountMapShader(host, 'm6') + startMapMovers + generatedMapDecor | shader kind 5: tundra (aurora, snowfall); decor biome tundra with 🐦 birds | good — shader + moving critters | live (e.js) | 3 |
| `map-amb-mi` | Map ambience: The Ice Hollow (mi) 🎨 | conquest map mi shown → mountMapShader(host, 'mi') + startMapMovers + generatedMapDecor | no shader kind in MAP_KIND (no map overlay; battle ambience/shader fall back to forest); decor biome tundra with 🐦 birds | missing — map has no weather/light layer of its own | live (e.js) | 2 |
| `map-amb-md` | Map ambience: The Glass Dunes (md) | conquest map md shown → mountMapShader(host, 'md') + startMapMovers + generatedMapDecor | shader kind 4: savanna (heat shimmer, dust, sun shafts); decor biome savanna with 🦋 butterflies | good — shader + moving critters | live (e.js) | 3 |
| `map-amb-m3` | Map ambience: Ashen Spurn (m3) | conquest map m3 shown → mountMapShader(host, 'm3') + startMapMovers + generatedMapDecor | shader kind 2: fire (lava glow, smoke, embers); decor biome ash with 🔥 fireflies | good — shader + moving critters | live (e.js) | 3 |
| `map-amb-m9` | Map ambience: Basalt Foundry (m9) | conquest map m9 shown → mountMapShader(host, 'm9') + startMapMovers + generatedMapDecor | shader kind 8: foundry (embers, forge glow); decor biome forge with 🔥 fireflies | good — shader + moving critters | live (e.js) | 3 |
| `map-amb-m11` | Map ambience: The Sundered Peak (m11) | conquest map m11 shown → mountMapShader(host, 'm11') + startMapMovers + generatedMapDecor | shader kind 10: storm (embers + lightning); decor biome ash with 🔥 fireflies | good — shader + moving critters | live (e.js) | 3 |
| `map-amb-me` | Map ambience: Eye of the Volcano (me) | conquest map me shown → mountMapShader(host, 'me') + startMapMovers + generatedMapDecor | shader kind 10: storm (embers + lightning); decor biome ash with 🔥 fireflies | good — shader + moving critters | live (e.js) | 3 |
| `map-amb-mx` | Map ambience: Volcano Lair (mx) 🎨 | conquest map mx shown → mountMapShader(host, 'mx') + startMapMovers + generatedMapDecor | no shader kind in MAP_KIND (no map overlay; battle ambience/shader fall back to forest); decor biome ash with 🔥 fireflies | missing — map has no weather/light layer of its own | live (e.js) | 2 |
| `map-amb-m21` | Map ambience: The Quiet Summit (m21) | conquest map m21 shown → mountMapShader(host, 'm21') + startMapMovers + generatedMapDecor | shader kind 9: sky (clouds, wind); decor biome alpine with 🦅 birds | good — shader + moving critters | live (e.js) | 3 |
| `map-movers-forest` | Map critters: forest | generatedMapDecor/startMapMovers for biome forest | 🦋 butterflies hopping between plants / looping rosettes (facing direction) | good — has its own look that plays at the right moment | live (e.js) | 3 |
| `map-movers-water` | Map critters: water | generatedMapDecor/startMapMovers for biome water | 🐟 fish hopping between plants / looping rosettes (facing direction) | good — has its own look that plays at the right moment | live (e.js) | 3 |
| `map-movers-ash` | Map critters: ash | generatedMapDecor/startMapMovers for biome ash | 🔥 fireflies hopping between plants / looping rosettes (facing direction) | good — has its own look that plays at the right moment | live (e.js) | 3 |
| `map-movers-cave` | Map critters: cave | generatedMapDecor/startMapMovers for biome cave | 🦇 bats hopping between plants / looping rosettes (facing direction) | good — has its own look that plays at the right moment | live (e.js) | 3 |
| `map-movers-savanna` | Map critters: savanna | generatedMapDecor/startMapMovers for biome savanna | 🦋 butterflies hopping between plants / looping rosettes (facing direction) | good — has its own look that plays at the right moment | live (e.js) | 3 |
| `map-movers-tundra` | Map critters: tundra | generatedMapDecor/startMapMovers for biome tundra | 🐦 birds hopping between plants / looping rosettes (facing direction) | good — has its own look that plays at the right moment | live (e.js) | 3 |
| `map-movers-reef` | Map critters: reef | generatedMapDecor/startMapMovers for biome reef | 🐠 fish hopping between plants / looping rosettes (facing direction) | good — has its own look that plays at the right moment | live (e.js) | 3 |
| `map-movers-swamp` | Map critters: swamp | generatedMapDecor/startMapMovers for biome swamp | ✨ fireflies hopping between plants / looping rosettes (facing direction) | good — has its own look that plays at the right moment | live (e.js) | 3 |
| `map-movers-forge` | Map critters: forge | generatedMapDecor/startMapMovers for biome forge | 🔥 fireflies hopping between plants / looping rosettes (facing direction) | good — has its own look that plays at the right moment | live (e.js) | 3 |
| `map-movers-alpine` | Map critters: alpine | generatedMapDecor/startMapMovers for biome alpine | 🦅 birds hopping between plants / looping rosettes (facing direction) | good — has its own look that plays at the right moment | live (e.js) | 3 |
| `map-movers-meadow` | Map critters: meadow | generatedMapDecor/startMapMovers for biome meadow | 🐝 bees hopping between plants / looping rosettes (facing direction) | good — has its own look that plays at the right moment | live (e.js) | 3 |
| `map-movers-beach` | Map critters: beach | generatedMapDecor/startMapMovers for biome beach | 🦀 crabs hopping between plants / looping rosettes (facing direction) | good — has its own look that plays at the right moment | live (e.js) | 3 |
| `map-decor-static` | Living decor (trees, plants, props) | generatedMapDecor seeded per map | emoji decor clear of nodes and trails | good — has its own look that plays at the right moment | live (e.js) | 3 |
| `map-snails` | Snails creep on cave maps | startMapAdornments (cave maps) | .snail-trail faint blue trails | good — has its own look that plays at the right moment | live (e.js) | 3 |
| `map-crystal-sparkle` | Crystals in the art sparkle | startMapAdornments (found by colour) | .crystal-sparkle crystalTwinkle | good — has its own look that plays at the right moment | live (e.js) | 3 |
| `map-predator-eyes` | Predator eyes in the dark | startMapAdornments on dark maps, away from the lantern | .pred-eyes predEyes/predBlink | good — has its own look that plays at the right moment | live (e.js) | 3 |
| `map-cave-dark` | Cave map darkness + pointer lantern | mountCaveDark (cave maps) | dark veil with a lantern following the pointer | good — has its own look that plays at the right moment | live (e.js, r.js) | 2 |
| `map-cave-light-spread` | Cave cleared: the light spreads | caveLightSpread after clearing a cave map | light grows out then settles (+30% torch, −10% dark) | good — has its own look that plays at the right moment | live (e.js) | 2 |
| `map-dark-cleared` | Dark map cleared tint | .conquest-layout.dark-cleared | darkClearedIn | good — has its own look that plays at the right moment | live (e.js, r.js) | 3 |
| `map-veil` | Map loading veil | showMapVeil until the shader reports its first frame | .map-veil mvBob/mvDot + mapUnroll | good — has its own look that plays at the right moment | live (e.js) | 3 |
| `map-nodes-drop` | Skirmishes drop in from the sky (first view) | first view of a map after its name card lifts | .map-node.map-drop-wait → .map-drop (mapDrop, mapDropShadow) | good — has its own look that plays at the right moment | live (_existing.js) | 2 |
| `map-node-available` | Next fight available | node whose requires are met | tutorial beacon only on tutorial nodes; others static | basic — no "go here" pulse on normal next nodes | live (e.js) | 2 |
| `map-node-locked` | Locked fight | node whose requires are not met | hidden / dimmed | basic — a generic or reused look that does not say what happened | live (e.js) | 3 |
| `map-node-cleared` | Fight cleared (returning to the map) | completeConquestNode then map re-render | node gets .done | missing — no stamp / check animation the moment you come back | live (e.js) | 1 |
| `map-node-rank` | Rank shown on a cleared node | progress.ranks[id] (B/A/S/SS/SSS) | rank chip | basic — a generic or reused look that does not say what happened | live (e.js) | 3 |
| `map-trail-unlock` | Trail to the next fight unlocks | a new node becomes reachable | trail SVG just re-renders | missing — no path drawing | live (e.js) | 1 |
| `map-pawn-hop` | Pawn hops node to node | placeMapPawn on picking another node | hop + pawnStep footfalls | good — has its own look that plays at the right moment | live (e.js) | 2 |
| `map-pawn-walk` | Pawn walks the dotted path | A6 idea: walk the trail instead of hopping | hop only | basic — a generic or reused look that does not say what happened | live (e.js) | 3 |
| `map-pawn-dropin` | Pawn drops in on a new map | mapPawnDropIn | grows out of a point, hops down with a squash | good — has its own look that plays at the right moment | live (e.js) | 3 |
| `map-travel` | Map-to-map travel | world travel (mapTravelMs: +0.3 s per map, decaying) | .conquest-main.world-out/in-left/right | good — has its own look that plays at the right moment | live (e.js) | 2 |
| `map-world-zoom` | Map ↔ World zoom | openConquestWorld | .world-zoom-out / .world-zoom-in | good — has its own look that plays at the right moment | live (e.js) | 2 |
| `map-world-here` | World map: you are here | world-stop.is-here | .world-diamond::after hereRing | good — has its own look that plays at the right moment | live (e.js) | 3 |
| `map-world-fog` | World map: unseen map in fog | world-stop.is-fog | fogged stop | basic — no reveal when the fog lifts | live (e.js) | 2 |
| `map-world-compass` | World home compass | world-home | .wh-compass whSpin | good — has its own look that plays at the right moment | live (e.js) | 3 |
| `map-submap-enter` | Zoom into a sub-map (cave mouth) | enterSubMap | parent map zooms into the entrance, goes dark, sub-map grows out (subMapIris) | good — has its own look that plays at the right moment | live (e.js) | 2 |
| `map-submap-leave` | Leave a sub-map | leaveSubMap | quick pull-back | good — has its own look that plays at the right moment | live (e.js) | 3 |
| `map-submap-emblem` | Sub-map entrance emblem | map-subemblem / map-subcave / map-subexit | mseBob, mscGlow, mseShine, mseFlicker, mnShine on done | good — has its own look that plays at the right moment | live (e.js) | 3 |
| `map-cleared` | Whole map cleared | conquestMapCleared(mapId) becomes true | XP milestone toast only | missing — finishing a map has no celebration on the map | live (e.js) | 1 |
| `map-next-unlocked` | Next map unlocked | isMapUnlocked flips after a boss | world stop opens next time | missing — nothing on screen | live (e.js) | 2 |
| `map-ambush-node` | Ambush node appears | applyAmbushNode | .map-node.ambush-pop | good — has its own look that plays at the right moment | live (e.js) | 3 |
| `map-chance-node` | Chance fight found | completeConquestNode rolls a hidden chance node | appears on next render | missing — no "found!" moment | live (e.js) | 2 |
| `map-late-side-map` | Late side map arrives (days later / after a quest) | entry.afterDays / entry.quest | appears on next render | missing — nothing on screen | live (e.js) | 3 |
| `map-boss-node` | Boss / final boss / world boss node | kind boss\|finalboss\|worldboss\|subboss\|miniboss | .map-node.kind-* styling | basic — static; no menace | live (e.js) | 2 |
| `map-raid-node` | Raid boss node | kind raidboss / megaraid | .map-node.kind-raidboss | basic — a generic or reused look that does not say what happened | live (e.js) | 2 |
| `map-dungeon-node` | Dungeon / endless node | kind dungeon, map.endless | .map-node.kind-dungeon | basic — a generic or reused look that does not say what happened | live (e.js) | 3 |
| `map-elite-node` | Elite / champion node | kind elite / champion | .map-node.kind-elite | basic — a generic or reused look that does not say what happened | live (e.js) | 3 |
| `map-tutorial-reveal` | Tutorial node reveal | tutorial-solo.is-next + tut-reveal | tutorialBeacon + tutReveal | good — has its own look that plays at the right moment | live (e.js) | 3 |
| `map-leaves-reveal` | Leaves part to reveal the map (end of the tutorial) | leavesRevealToMap | leaf sweep + tutBgZoom | good — has its own look that plays at the right moment | live (e.js) | 2 |
| `map-dragon-scale-node` | Dragon Scale glint on a node | scaleNodeAt (S-rank a node to find a scale) | .map-node-scale scaleGlint | good — has its own look that plays at the right moment | live (e.js) | 3 |
| `map-dragon-scale-found` | Dragon Scale found | rollDragonScale on an S rank | unlockCardForPlayer + line | basic — no scale-collected moment on the map | live (e.js) | 2 |
| `map-spot-deck` | Feature spot unlock: Camp (Armoury) | activateSpot('deck') first visit → unlockFeature + toast + dialogue | toast "unlocked!" + SoundKit.unlock + dialogue; map-spot + tent flaps (flapL/flapR); .map-spot.is-new spotPulse/spotShake | basic — unlock is a toast; the spot itself has no opening moment | live | 2 |
| `map-spot-nest` | Feature spot unlock: Nest | activateSpot('nest') first visit → unlockFeature + toast + dialogue | toast "unlocked!" + SoundKit.unlock + dialogue; map-spot; nest entrance down (downFall); .map-spot.is-new spotPulse/spotShake | basic — unlock is a toast; the spot itself has no opening moment | live | 2 |
| `map-spot-quests` | Feature spot unlock: Notices | activateSpot('quests') first visit → unlockFeature + toast + dialogue | toast "unlocked!" + SoundKit.unlock + dialogue; map-spot + quest board entrance; .map-spot.is-new spotPulse/spotShake | basic — unlock is a toast; the spot itself has no opening moment | live | 3 |
| `map-spot-shop` | Feature spot unlock: Traveller's Cart | activateSpot('shop') first visit → unlockFeature + toast + dialogue | toast "unlocked!" + SoundKit.unlock + dialogue; map-spot + awning (awningUp); .map-spot.is-new spotPulse/spotShake | basic — unlock is a toast; the spot itself has no opening moment | live | 2 |
| `map-spot-forge` | Feature spot unlock: The Forge | activateSpot('forge') first visit → unlockFeature + toast + dialogue | toast "unlocked!" + SoundKit.unlock + dialogue; map-spot + forge flare-up (ffTongue); .map-spot.is-new spotPulse/spotShake | basic — unlock is a toast; the spot itself has no opening moment | live | 2 |
| `map-spot-codex` | Feature spot unlock: Codex | activateSpot('codex') first visit → unlockFeature + toast + dialogue | toast "unlocked!" + SoundKit.unlock + dialogue; map-spot; .map-spot.is-new spotPulse/spotShake | basic — unlock is a toast; the spot itself has no opening moment | live | 3 |
| `map-spot-arena` | Feature spot unlock: The Arena | activateSpot('arena') first visit → unlockFeature + toast + dialogue | toast "unlocked!" + SoundKit.unlock + dialogue; map-spot; .map-spot.is-new spotPulse/spotShake | basic — unlock is a toast; the spot itself has no opening moment | live | 3 |
| `map-spot-questboard` | Feature spot unlock: Quest Board (errands) | activateSpot('questboard') first visit → unlockFeature + toast + dialogue | toast "unlocked!" + SoundKit.unlock + dialogue; map-spot; .map-spot.is-new spotPulse/spotShake | basic — unlock is a toast; the spot itself has no opening moment | live | 3 |
| `map-spot-raid` | Feature spot unlock: Raid Banner | activateSpot('raid') first visit → unlockFeature + toast + dialogue | toast "unlocked!" + SoundKit.unlock + dialogue; map-spot; .map-spot.is-new spotPulse/spotShake | basic — unlock is a toast; the spot itself has no opening moment | live | 3 |
| `map-spot-wanderer` | Feature spot unlock: Wanderer's Camp | activateSpot('wanderer') first visit → unlockFeature + toast + dialogue | toast "unlocked!" + SoundKit.unlock + dialogue; map-spot + .map-wanderer (wanderBob); .map-spot.is-new spotPulse/spotShake | basic — unlock is a toast; the spot itself has no opening moment | live | 3 |
| `map-spot-tavern` | Feature spot unlock: The Tavern | activateSpot('tavern') first visit → unlockFeature + toast + dialogue | toast "unlocked!" + SoundKit.unlock + dialogue; map-spot; .map-spot.is-new spotPulse/spotShake | basic — unlock is a toast; the spot itself has no opening moment | live | 3 |
| `map-spot-gauntlet` | Feature spot unlock: Gauntlet Gate | activateSpot('gauntlet') first visit → unlockFeature + toast + dialogue | toast "unlocked!" + SoundKit.unlock + dialogue; map-spot; .map-spot.is-new spotPulse/spotShake | basic — unlock is a toast; the spot itself has no opening moment | live | 3 |
| `map-spot-autobattle` | Feature spot unlock: Whisper's Game | activateSpot('autobattle') first visit → unlockFeature + toast + dialogue | toast "unlocked!" + SoundKit.unlock + dialogue; map-spot; .map-spot.is-new spotPulse/spotShake | basic — unlock is a toast; the spot itself has no opening moment | live | 3 |
| `map-spot-skillcodex` | Feature spot unlock: Skill Codex | activateSpot('skillcodex') first visit → unlockFeature + toast + dialogue | toast "unlocked!" + SoundKit.unlock + dialogue; map-spot; .map-spot.is-new spotPulse/spotShake | basic — unlock is a toast; the spot itself has no opening moment | live | 3 |
| `map-spot-mapcodex` | Feature spot unlock: Map Codex | activateSpot('mapcodex') first visit → unlockFeature + toast + dialogue | toast "unlocked!" + SoundKit.unlock + dialogue; map-spot; .map-spot.is-new spotPulse/spotShake | basic — unlock is a toast; the spot itself has no opening moment | live | 3 |
| `map-spot-stomp` | Feature spot unlock: Stomping Grounds | activateSpot('stomp') first visit → unlockFeature + toast + dialogue | toast "unlocked!" + SoundKit.unlock + dialogue; map-spot; .map-spot.is-new spotPulse/spotShake | basic — unlock is a toast; the spot itself has no opening moment | live | 3 |
| `map-spot-testlab` | Feature spot unlock: Test Lab | activateSpot('testlab') first visit → unlockFeature + toast + dialogue | toast "unlocked!" + SoundKit.unlock + dialogue; map-spot; .map-spot.is-new spotPulse/spotShake | basic — unlock is a toast; the spot itself has no opening moment | live | 3 |
| `map-spot-market` | Feature spot unlock: Flea Market (Map 31) | activateSpot('market') first visit → unlockFeature + toast + dialogue | toast "unlocked!" + SoundKit.unlock + dialogue; map-spot; .map-spot.is-new spotPulse/spotShake | basic — unlock is a toast; the spot itself has no opening moment | live | 3 |
| `map-spot-fieldkit` | Feature spot unlock: The traveller's kit | activateSpot('fieldkit') first visit → unlockFeature + toast + dialogue | toast "unlocked!" + SoundKit.unlock + dialogue; map-spot; .map-spot.is-new spotPulse/spotShake | basic — unlock is a toast; the spot itself has no opening moment | live | 3 |
| `map-spot-backpack` | Feature spot unlock: A note in your pack | activateSpot('backpack') first visit → unlockFeature + toast + dialogue | toast "unlocked!" + SoundKit.unlock + dialogue; map-spot; .map-spot.is-new spotPulse/spotShake | basic — unlock is a toast; the spot itself has no opening moment | live | 3 |
| `map-spot-new-bang` | "!" on a new spot fades after a look | fadeNewBang | fade | good — has its own look that plays at the right moment | live (e.js) | 3 |
| `map-curio-signpost` | Curiosity: signpost | visitCuriosity('signpost') (first time plays a dialogue; after that a speech bubble) | .map-curio.is-new + unlock sound + dialogue; later showSpeechBubble | basic — static emoji; no idle life of its own | live (e.js) | 3 |
| `map-curio-scarecrow` | Curiosity: scarecrow | visitCuriosity('scarecrow') (first time plays a dialogue; after that a speech bubble) | .map-curio.is-new + unlock sound + dialogue; later showSpeechBubble | basic — static emoji; no idle life of its own | live (e.js) | 3 |
| `map-curio-beehive` | Curiosity: beehive | visitCuriosity('beehive') (first time plays a dialogue; after that a speech bubble) | .map-curio.is-new + unlock sound + dialogue; later showSpeechBubble | basic — static emoji; no idle life of its own | live (e.js) | 3 |
| `map-curio-bottle` | Curiosity: bottle | visitCuriosity('bottle') (first time plays a dialogue; after that a speech bubble) | .map-curio.is-new + unlock sound + dialogue; later showSpeechBubble | basic — static emoji; no idle life of its own | live (e.js) | 3 |
| `map-curio-crab` | Curiosity: crab | visitCuriosity('crab') (first time plays a dialogue; after that a speech bubble) | .map-curio.is-new + unlock sound + dialogue; later showSpeechBubble | basic — static emoji; no idle life of its own | live (e.js) | 3 |
| `map-curio-lantern` | Curiosity: lantern | visitCuriosity('lantern') (first time plays a dialogue; after that a speech bubble) | .map-curio.is-new + unlock sound + dialogue; later showSpeechBubble | basic — static emoji; no idle life of its own | live (e.js) | 3 |
| `map-curio-ashcairn` | Curiosity: ashcairn | visitCuriosity('ashcairn') (first time plays a dialogue; after that a speech bubble) | .map-curio.is-new + unlock sound + dialogue; later showSpeechBubble | basic — static emoji; no idle life of its own | live (e.js) | 3 |
| `map-curio-peddler` | Curiosity: peddler | visitCuriosity('peddler') (first time plays a dialogue; after that a speech bubble) | .map-curio.is-new + unlock sound + dialogue; later showSpeechBubble | basic — static emoji; no idle life of its own | live (e.js) | 3 |
| `map-curio-echo` | Curiosity: echo | visitCuriosity('echo') (first time plays a dialogue; after that a speech bubble) | .map-curio.is-new + unlock sound + dialogue; later showSpeechBubble | basic — static emoji; no idle life of its own | live (e.js) | 3 |
| `map-curio-glowpool` | Curiosity: glowpool | visitCuriosity('glowpool') (first time plays a dialogue; after that a speech bubble) | .map-curio.is-new + unlock sound + dialogue; later showSpeechBubble | basic — static emoji; no idle life of its own | live (e.js) | 3 |
| `map-curio-baobab` | Curiosity: baobab | visitCuriosity('baobab') (first time plays a dialogue; after that a speech bubble) | .map-curio.is-new + unlock sound + dialogue; later showSpeechBubble | basic — static emoji; no idle life of its own | live (e.js) | 3 |
| `map-curio-drum` | Curiosity: drum | visitCuriosity('drum') (first time plays a dialogue; after that a speech bubble) | .map-curio.is-new + unlock sound + dialogue; later showSpeechBubble | basic — static emoji; no idle life of its own | live (e.js) | 3 |
| `map-curio-icefish` | Curiosity: icefish | visitCuriosity('icefish') (first time plays a dialogue; after that a speech bubble) | .map-curio.is-new + unlock sound + dialogue; later showSpeechBubble | basic — static emoji; no idle life of its own | live (e.js) | 3 |
| `map-curio-shell` | Curiosity: shell | visitCuriosity('shell') (first time plays a dialogue; after that a speech bubble) | .map-curio.is-new + unlock sound + dialogue; later showSpeechBubble | basic — static emoji; no idle life of its own | live (e.js) | 3 |
| `map-curio-wreck` | Curiosity: wreck | visitCuriosity('wreck') (first time plays a dialogue; after that a speech bubble) | .map-curio.is-new + unlock sound + dialogue; later showSpeechBubble | basic — static emoji; no idle life of its own | live (e.js) | 3 |
| `map-curio-wisp` | Curiosity: wisp | visitCuriosity('wisp') (first time plays a dialogue; after that a speech bubble) | .map-curio.is-new + unlock sound + dialogue; later showSpeechBubble | basic — static emoji; no idle life of its own | live (e.js) | 3 |
| `map-curio-anvil` | Curiosity: anvil | visitCuriosity('anvil') (first time plays a dialogue; after that a speech bubble) | .map-curio.is-new + unlock sound + dialogue; later showSpeechBubble | basic — static emoji; no idle life of its own | live (e.js) | 3 |
| `map-curio-eyrie` | Curiosity: eyrie | visitCuriosity('eyrie') (first time plays a dialogue; after that a speech bubble) | .map-curio.is-new + unlock sound + dialogue; later showSpeechBubble | basic — static emoji; no idle life of its own | live (e.js) | 3 |
| `map-curio-banner` | Curiosity: banner | visitCuriosity('banner') (first time plays a dialogue; after that a speech bubble) | .map-curio.is-new + unlock sound + dialogue; later showSpeechBubble | basic — static emoji; no idle life of its own | live (e.js) | 3 |
| `map-well` | The old well | mapWellHTML / visitOldWell | .map-well bucket swing (mwSwing) + ripple (mwRipple) | good — has its own look that plays at the right moment | live (e.js) | 3 |
| `map-campfire` | Glimmer Depths campfire | mapCampfireHTML | .map-campfire mcfGlow/mcfFlick/mcfSpark | good — has its own look that plays at the right moment | live (e.js) | 3 |
| `map-courier` | Courier mouse with a free pack | freePackCourierHTML | .map-courier courierBob | good — has its own look that plays at the right moment | live (e.js) | 3 |
| `map-wanderer` | Wandering merchant on the map | wandererMapHTML (some days) | .map-wanderer wanderBob + .wander-card.is-fresh | good — has its own look that plays at the right moment | live (e.js) | 3 |
| `map-seasonal` | Seasonal vignette | calendar month | vignette | good — has its own look that plays at the right moment | live (e.js) | 3 |
| `map-day-night-tint` | Map time-of-day grading | planned (time of day on maps) | live clock tint only on Home | missing — maps never go to dusk or night | live (e.js) | 2 |
| `map-weather-fronts` | Map weather fronts (rain/snow/fog tweened) | planned | world rain only (shader kind 11) | basic — a generic or reused look that does not say what happened | live (e.js) | 3 |
| `map-water-shimmer` | Water shimmer on map ponds/rivers | water/coral/beach shader caustics | caustics + glints | good — has its own look that plays at the right moment | live (e.js) | 3 |
| `map-fog-misty` | Mist drifting over Map 0 | misty map (Outskirts / Old Bramble) | none on the map itself (savanna shader on m1) | missing — the misty map is not misty | live (e.js) | 2 |
| `map-chaos-returns` | Chaos returns (Map 40+ respawn) 🔮 | planned | none | missing — planned | lab-only (e.js) | 3 |
| `map-headline-ghost` | Map title banner ghosting | pointer over the headline | .is-away / .is-ghost | good — has its own look that plays at the right moment | live (e.js) | 3 |
| `map-shader-new-fungal` | New map shader look: fungal | planned shader kind | none | missing — no shader kind exists for this biome | live (e.js) | 2 |
| `map-shader-new-dragon-lair` | New map shader look: dragon-lair | planned shader kind | none | missing — no shader kind exists for this biome | live (e.js) | 2 |
| `map-shader-new-ice-cave` | New map shader look: ice-cave | planned shader kind | none | missing — no shader kind exists for this biome | live (e.js) | 3 |
| `map-shader-new-crystal-cave` | New map shader look: crystal-cave | planned shader kind | none | missing — no shader kind exists for this biome | live (e.js) | 3 |
| `map-shader-new-misty-meadow` | New map shader look: misty-meadow | planned shader kind | none | missing — no shader kind exists for this biome | live (e.js) | 2 |
| `map-shader-new-abyssal` | New map shader look: abyssal 🔮 | planned shader kind | none | missing — no shader kind exists for this biome | lab-only (e.js) | 3 |
| `map-shader-new-dragonic-spire` | New map shader look: dragonic-spire 🔮 | planned shader kind | none | missing — no shader kind exists for this biome | lab-only (e.js) | 3 |
| `map-shader-new-floodplains` | New map shader look: floodplains 🔮 | planned shader kind | none | missing — no shader kind exists for this biome | lab-only (e.js) | 3 |
| `map-hidden-skirmish-pop` | Hidden skirmish appears | renderConquestSubTab: a hidden skirmish shown for the first time (hiddenPopNow) -> .map-node.is-secret.secret-pop + toast | 2026-10-17: the hidden skirmish pops in with its trail from the fight beside it (.trail-pop); it opens once that fight is cleared | good | live (q.js, x17.js) | 3 |
| `map-jumper-arrive` | Jumper lands on the trail (hidden skirmish, Type 2) 🎨 | jumperArrivals (arena_app.js): a jumper's `after` fight is cleared → fxHook('mapJumperArrive', node, entrance, {canvas, from, to}), once per save | FX.E.jumperArrive: the old link starts inking, the jumper lands across it (meteor / splash / psychic / ghost), the trail redraws through it | good | live (w3.js) | 2 |
| `map-night-retreat` | Night gives way to day on the map | FX.E.dayNight when the phase changes from night to dawn or day (the clock or the Atmosphere setting) | FX.E.nightRetreat: the night tint fades from the whole map while soft, uneven light streaks drift across | good | live (w3.js) | 3 |
| `map-trails-one-by-one` | New trails ink in one by one | coming back to the map after a clear that opens new fights | FX.E playReturn: the new trails and fights are hidden, then each trail inks in (trailDraw) and its fight fades in | good — has its own look that plays at the right moment | live (x17.js) | 1 |
| `map-cave-fires` | Cave fire pits light up | a cave map: fire pits along the trail (at most 3) light as you win | .cave-fire.is-igniting / .is-lit | good — has its own look that plays at the right moment | live (r.js) | 2 |

### World ambience (`world-ambience`, 22)

| id | name | trigger | current | quality | status | P |
|---|---|---|---|---|---|--:|
| `amb-home-splash` | Splash / entrance | entrance screen | scene shader (sway, ripple, bloom, light shafts, fireflies) + depth parallax + titleDrop/ribbonClash/efFloat | good — has its own look that plays at the right moment | live (e.js) | 2 |
| `amb-home` | Home screen | Home | depth parallax + live clock tint + CalmMusic + ambience | good — has its own look that plays at the right moment | live (e.js) | 2 |
| `amb-leaf-sweep` | In-world transition leaf sweep | tab change between Home/Play/Codex/menus | leaf sweep (.leaf-sweep lsVeil) | good — has its own look that plays at the right moment | live (e.js) | 3 |
| `amb-armoury` | Armoury Tent (deck builder) | enter Deck | tent flaps part, lantern light, canvas ambience | good — has its own look that plays at the right moment | live (e.js) | 3 |
| `amb-shop` | Traveller's Cart (Shop) | enter Shop | awning rolls up, bell, lantern hum; shelves | good — has its own look that plays at the right moment | live (e.js) | 3 |
| `amb-nest` | Old Nest | enter Nest | down drifts in (downFall), breeze, birds | good — has its own look that plays at the right moment | live (e.js) | 3 |
| `amb-forge` | Forge | enter Forge | sparks rise, ember flare (forgeFlare, forgeSpark, emberRise), hearth roar | good — has its own look that plays at the right moment | live (e.js) | 3 |
| `amb-codex` | Codex | enter Codex | page turn between sections, Margins harp theme | good — has its own look that plays at the right moment | live (e.js) | 3 |
| `amb-quests` | Notice Board (Quests) | open quests | questBoardEntrance | basic — a generic or reused look that does not say what happened | live (e.js) | 3 |
| `amb-arena` | The Arena as a real arena 🔮 | planned | menu only | missing — planned (immersion "next round") | lab-only (e.js) | 3 |
| `amb-tavern` | The Tavern | enter Tavern (stamina) | tavernStaminaHTML | basic — a generic or reused look that does not say what happened | live (e.js) | 3 |
| `amb-battle-felt` | Lit felt on the battlefield | every battle | felt shader: lamp, impact lights, card shadows | good — has its own look that plays at the right moment | live (e.js) | 2 |
| `amb-battle-map-terrain` | Fight on the map's own terrain | battle background | map pixel terrain under a scrim + map shader kind | good — has its own look that plays at the right moment | live (e.js) | 3 |
| `amb-sound-places` | Place soundscapes | Ambience by place / map kind | Ambience beds + events (breeze, frogs, drips, wind, rumble...) | good — has its own look that plays at the right moment | live (e.js) | 3 |
| `amb-music` | Songbook / Battle music | place themes and battle bands | Songbook + BattleMusic (3 intensities) | good — has its own look that plays at the right moment | live (e.js) | 3 |
| `amb-motes` | Floating motes / fireflies | scene/map shaders | shader motes | good — has its own look that plays at the right moment | live (e.js) | 3 |
| `amb-raid-splash` | Raid splash parallax 🔮 | planned (depth rig reuse) | none | missing — planned | lab-only (e.js) | 3 |
| `amb-crt-grain` | Atmosphere packs (film grain, CRT, rain on glass) 🔮 | planned optional atmospheres | 🌧️ Rain atmosphere only | missing — planned | lab-only (e.js) | 3 |
| `amb-ink-transition` | Ink-wash transition 🔮 | planned (lore, faction choice, campaign end) | none | missing — planned | lab-only (e.js) | 3 |
| `amb-ant-lampposts` | Ant acid-battery lampposts 🔮 | planned faction scenery (ants as builders) | none | missing — planned | lab-only (e.js) | 3 |
| `amb-otter-roads` | Otter territory scenery (roads, forts, bridges) 🔮 | map art direction | art only | basic — no animated legion life (patrols, banners) | lab-only (e.js) | 3 |
| `amb-hummingbird-cliffs` | Hummingbird territory (painted cliffs, totems, blossoms) 🔮 | map art direction | art only | basic — a generic or reused look that does not say what happened | lab-only (e.js) | 3 |

### UI feedback (`ui-feedback`, 48)

| id | name | trigger | current | quality | status | P |
|---|---|---|---|---|---|--:|
| `ui-deny` | Deny shake (can't afford / can't pitch) | playCardByUid / discardCardByUid refuse | .deny-shake (denyShakeAnim) red | good — has its own look that plays at the right moment | live (f.js) | 3 |
| `ui-toast` | Toast | showToast | toast slide | basic — plain toast for many big moments | live (_existing.js, f.js) | 3 |
| `ui-hud-pill-bing` | Resource pill bing | floatResourceGain → .hud-pill.bing | hudPillBing | good — has its own look that plays at the right moment | live (f.js) | 3 |
| `ui-pill-gain` | Pill gain pulse | pill-gain-pulse | pillGainPulse | good — has its own look that plays at the right moment | live (f.js) | 3 |
| `ui-tab-emoji` | Tab emoji spin on hover | .tab-btn:hover | tabEmojiSpin | good — has its own look that plays at the right moment | live (f.js) | 3 |
| `ui-home-buttons` | Home menu buttons dazzle | hover / click | menuBtnDazzle + menuBtnClickPop | good — has its own look that plays at the right moment | live (f.js) | 3 |
| `ui-chestnut-knock` | Chestnut knock on Home | click the logo chestnut | knockVibrate + knock sound | good — has its own look that plays at the right moment | live (f.js) | 3 |
| `ui-codex-page` | Codex page turn | switch Codex section | codexPageTurn (pageTurnFwd/Back + pageShade) | good — has its own look that plays at the right moment | live (f.js) | 3 |
| `ui-pixel-reveal` | Pixel reveal into a battle | battle without a versus opener | pixelReveal | good — has its own look that plays at the right moment | live (_existing.js) | 3 |
| `ui-versus` | Versus opener | Conquest skirmish start | .vs-opener (vsIn, vsFromLeft/Right, vsTaunt, vsRays, vsSeam) + babble | good — has its own look that plays at the right moment | live (f.js) | 1 |
| `ui-fight-sign` | "Fight!" sign | combat starts | .fight-sign fightSignIn/Out | good — has its own look that plays at the right moment | live (f.js) | 2 |
| `ui-next-turn` | Next turn banner | wait-tick phase with at least one waitTick | showNextTurnBanner (nextTurnSignIn/Pulse/Out) | good — has its own look that plays at the right moment | live (f.js) | 2 |
| `ui-turn-glow` | Your turn lane glow | your play phase | #rowMine.turn-glow | good — has its own look that plays at the right moment | live (f.js) | 3 |
| `ui-wait-tick` | Wait ticks down | waitTick {waitRemaining} | updateCardWaitDisplay + waitTickFlash/Pulse + hourglass waitFlip + waitTickTone | good — has its own look that plays at the right moment | live (f.js) | 2 |
| `ui-ready` | Unit becomes Ready | ready | playReadyFlourish (spin, red ring, number pop) + .ready-pulse + readyChime | good — has its own look that plays at the right moment | live (f.js) | 2 |
| `ui-drag-trail` | Hand card drag trail | dragging a hand card | .drag-spark (dragSpark) | good — has its own look that plays at the right moment | live (f.js) | 3 |
| `ui-drop-highlight` | Slot highlight while dragging | highlightSlotTarget | slot glow | good — has its own look that plays at the right moment | live (f.js) | 3 |
| `ui-attack-preview` | Attack preview lines | hovering / dragging a card | .facing-svg lines (facingFlow), prong lines | good — has its own look that plays at the right moment | live (f.js) | 3 |
| `ui-pitch-preview` | Pitch preview | dragging over the discard zone | .discardzone.pitch-ready (pitchReady) + .pitch-callout | good — has its own look that plays at the right moment | live (f.js) | 3 |
| `ui-pitch` | Card pitched for Lumber | discard (player) | pitch fly + pitchChime + "+1 🪵" | good — has its own look that plays at the right moment | live (f.js) | 2 |
| `ui-overdraw` | Full-hand auto-pitch | overdraw {lumber} | animateOverdraw (face-down card flies to the graveyard, +1 🪵) | good — has its own look that plays at the right moment | live (f.js) | 3 |
| `ui-draw` | Card drawn into hand | draw | drawFlipVfx (flies face down, flips) | good — has its own look that plays at the right moment | live (f.js) | 2 |
| `ui-deck-shuffle` | Deck shuffle at match start | maybeDeckShuffle | deckShuffleVfx riffle + riffle sound | good — has its own look that plays at the right moment | live (f.js, p1.js) | 3 |
| `ui-deck-riffle` | Deck riffle (pile) | deckRiffleFx | ProcFX.flipShuffle fan | good — has its own look that plays at the right moment | live (_existing.js) | 3 |
| `ui-lumber-nudge` | Lumber nudge on a card you can't afford | hand card cost check | .lumber-nudge (lnudge) | good — has its own look that plays at the right moment | live (f.js) | 3 |
| `ui-card-hover` | Card hover pop-over | hover a card | fullCardHTML pop-over | basic — a generic or reused look that does not say what happened | live (f.js) | 3 |
| `ui-bf-pill-tip` | Battlefield pill tooltip | hover a phase/tide/wind pill | .bf-tip-float (bfTipIn) | good — has its own look that plays at the right moment | live (f.js) | 3 |
| `ui-tip-ticker` | Tip ticker | loading / idle tips | .tip-ticker tipIn/tipOut/tipDrift | good — has its own look that plays at the right moment | live (f.js) | 3 |
| `ui-modal-dialog` | Centre dialog in/out | bwTextDialog / bw-centre-dialog | bwDimIn/Out + bwPopIn/Out | good — has its own look that plays at the right moment | live (f.js) | 3 |
| `ui-deck-add` | Card added to a deck | deck editor add | none | missing — the card just appears in the list | live (f.js) | 2 |
| `ui-deck-remove` | Card removed from a deck | deck editor remove | none | missing — nothing on screen | live (f.js) | 2 |
| `ui-deck-full` | Deck full / copy limit reached | editionCapReached / 20-card limit | toast | basic — a generic or reused look that does not say what happened | live (f.js) | 3 |
| `ui-deck-swap` | Deck swap prompt (new card to swap in) | pendingDeckSwap → ds2 overlay | .ds2-overlay ds2In + "Nice!" ds2Nice + ssBump | good — has its own look that plays at the right moment | live (f.js) | 2 |
| `ui-deck-hero-banner` | Deck hero banner / showcase | deck tab | retired 2026-10-18: the deck banner no longer plays it (refreshDeckHeroBanner only redraws the banner); the look stays in the Effects Lab | basic — a generic or reused look that does not say what happened | retired | 3 |
| `ui-codex-new` | Codex: newly seen card | codex grid | new marker | basic — a generic or reused look that does not say what happened | live (f.js) | 3 |
| `ui-skill-reveal` | Skill "?" lifts (first time a skill is shown) | skillRevealState / noteMapEnteredForReveal | text swap | missing — a skill name reveal has no moment | live (f.js) | 2 |
| `ui-rank-hex` | Rank hex S/SS/SSS | rank badges | rankFoil + sssPulse | good — has its own look that plays at the right moment | live (f.js) | 3 |
| `ui-avatar-unlock` | Avatar / title unlocked | diffUnlocks after a match | listed on results | basic — a generic or reused look that does not say what happened | live (f.js) | 3 |
| `ui-cloud-sync` | Cloud sync pill | setCloudPill | retired 2026-10-18: the cloud sync pill (#cloudSyncPill) is gone and the account chip shows the account state; the look stays in the Effects Lab | basic — a generic or reused look that does not say what happened | retired | 3 |
| `ui-banners` | Sign-in / invite / version banners | showSignInBanner / showInviteBanner / versionBanner | plain banners | basic — a generic or reused look that does not say what happened | live (f.js) | 3 |
| `ui-fx-level` | Effects level + reduced motion | fxLevel / reducedMotion | data-fx attribute gates; reduced motion skips motion | good — every new effect must respect both | live (f.js) | 2 |
| `ui-emoji-set` | Emoji / icon set swap (Twemoji, OpenMoji, Noto, Fluent) via icon(key) 🔮 | planned | system emoji + iconHTML | missing — planned | lab-only (f.js) | 3 |
| `ui-emote` | Unit emoji shout-outs | maybeEmote (attack, hurt, dodge, kill, healed, rage...) | emote bubble (rare, one at a time) | good — has its own look that plays at the right moment | live (f.js) | 3 |
| `ui-speech` | Unit speech bubbles | maybeSpeak (onSpawn/onAttack/onHit/onDeath/onSkill) | .speech-bubble + voiceTone | good — has its own look that plays at the right moment | live (f.js) | 3 |
| `ui-log-row` | Battle log row | pushLog | .log-row logpop | good — has its own look that plays at the right moment | live (f.js) | 3 |
| `ui-enemy-pitch` | Opponent pitches a card | discard by the opponent → enemyPitchVfx | enemyPitchSlotFx: the card drops into a slot under their pills, settles, fades; "+1 🪵 Lumber" rises; their pill bings | good — has its own look that plays at the right moment | live (x17.js) | 1 |
| `ui-enemy-hand-count` | Enemy hand counter | the opponent's hand size changes | "N 🃏" pill on their Deck, .ehc-bump on change, .is-zero at 0 | good — a small, clear counter | live (x17.js) | 1 |
| `ui-upkeep-chip` | Upkeep lock | the round-start effects play before your turn opens | html.bw-upkeep (hand dims, play / pitch / Pass wait) + "⏳ Upkeep" chip (showUpkeepChip) | good — has its own look that plays at the right moment | live (x17.js) | 1 |

### Tutorial and dialogue (`tutorial-dialogue`, 17)

| id | name | trigger | current | quality | status | P |
|---|---|---|---|---|---|--:|
| `tut-coach-tip` | Coach tip | showCoachTip | .coach-tip coachIn + coachNudge | good — has its own look that plays at the right moment | live (f.js) | 2 |
| `tut-coach-pointer` | Coach pointer (ring + hand) | coach pointer | .coach-pointer cpRing/cpBob/cpTargetIn/cpTargetPulse | good — has its own look that plays at the right moment | live (f.js) | 2 |
| `tut-coach-phantom` | Phantom card drag demo | syncCoachPhantom | looping phantom drag | good — has its own look that plays at the right moment | live (f.js) | 3 |
| `tut-highlight` | Tutorial highlight | tut-highlight | tutGlow | good — has its own look that plays at the right moment | live (f.js) | 3 |
| `tut-lumber-lesson` | Lumber lesson | first pitch lesson | retired 2026-10-16: the big Lumber lesson window is gone; the spotlighted Pitching lesson teaches Lumber | good — has its own look that plays at the right moment | retired | 3 |
| `tut-faction-pick` | Faction pick → first fight | factionToBattleFx | cards arc to the deck, zoom, battlefield fades in | good — has its own look that plays at the right moment | live (f.js) | 2 |
| `tut-faction-showcase` | Faction showcase | faction picker | .faction-showcase fsBob + .faction-btn.fs-appear | good — has its own look that plays at the right moment | live (f.js) | 3 |
| `tut-leader-join` | Leader joins (Tutorial II) | tutorialLeaderJoin | leader slot in (leaderSlotIn) | good — has its own look that plays at the right moment | live (f.js) | 3 |
| `tut-dialogue-dock` | Dialogue dock opens | playDialogue | .npc-prompt npcIn | good — has its own look that plays at the right moment | live (f.js) | 2 |
| `tut-dialogue-question` | Dialogue waiting on your answer (collapsed) | dialogue-dock.is-collapsed.has-question | dlgChipPulse | good — has its own look that plays at the right moment | live (f.js) | 3 |
| `tut-dialogue-portrait` | NPC portrait expression change | dialogue line with a mood | static portrait art | missing — no talking / emotion cue | live (f.js) | 2 |
| `tut-dialogue-act` | Dialogue act opens a menu / shows a place | performDialogueAct | menu opens | basic — a generic or reused look that does not say what happened | live (f.js) | 3 |
| `tut-faction-warning` | Faction general warns you | playFactionWarning | dialogue | basic — a generic or reused look that does not say what happened | live (f.js) | 3 |
| `tut-curio-bubble` | Curiosity speech bubble (repeat visit) | visitCuriosity | showSpeechBubble | basic — a generic or reused look that does not say what happened | live (f.js) | 3 |
| `tut-rival-babble` | Rival babble voice | versus opener taunt | SoundKit.babble | good — has its own look that plays at the right moment | live (f.js) | 3 |
| `tut-afk` | Dialogue AFK line | dialogue timeout | AFK_LINES text | basic — a generic or reused look that does not say what happened | live (f.js) | 3 |
| `ui-voice-bark` | Voice bark and babble 🎨 | maybeBark on play / kill / death / skill (leaders and bosses always) | showSpeechBubble(.is-bark, 1.6 s) + SoundKit.barkBabble in the species' voice (barkVoiceFor) | good — has its own look that plays at the right moment | live (x17.js) | 1 |

### Raid, dungeon, PvP, co-op (`raid-dungeon-pvp`, 29)

| id | name | trigger | current | quality | status | P |
|---|---|---|---|---|---|--:|
| `raid-telegraph` | Raid column telegraph | raidTelegraphCols (next column smack) | .board-card.raid-tele raidTele + red lane + ⬇ | good — has its own look that plays at the right moment | live (f.js) | 2 |
| `raid-trench-danger` | Trench danger cells / aim | trench replay | .tr-cell.is-danger trDanger, .is-aim trAim, .is-charging trCharge, .tr-tele trPulse | good — has its own look that plays at the right moment | live (f.js) | 2 |
| `raid-trench-hit` | Trench replay hits | trench replay | .rp-card.is-hit rpShake + rpDmg | basic — a generic or reused look that does not say what happened | live (f.js, p1.js) | 3 |
| `raid-boss-roar` | Raid fight start roar | raid fight start | bossRumble / versus | basic — a generic or reused look that does not say what happened | live (f.js) | 2 |
| `raid-tentacle-smack` | Tentacle Smack (whole column) | special attack column | telegraph + hits | basic — no tentacle | live (f.js) | 2 |
| `raid-tail-sweep` | Tail Sweep (every front-row card) | special attack front row | hits | basic — a generic or reused look that does not say what happened | live (f.js) | 2 |
| `raid-stage-change` | Raid stage change (Enraged 75%, Exposed <1%) | global raid stage crossed | stage name chip | missing — nothing on screen | live (f.js) | 1 |
| `raid-part-down` | Raid part defeated | ps.defeated | .r2-part.is-down | basic — a generic or reused look that does not say what happened | live (f.js) | 2 |
| `raid-bars` | Raid HP bars | raidBarsHTML | bars | basic — a generic or reused look that does not say what happened | live (f.js, r.js) | 3 |
| `raid-feed` | Raid feed entry | renderOnlineRaidFeed | rows | basic — a generic or reused look that does not say what happened | live (f.js) | 3 |
| `raid-claim` | Raid reward claim | claimRaidReward | rewardRush? | basic — a generic or reused look that does not say what happened | live (f.js) | 3 |
| `raid-core-stumps` | Core stumps armour each other | trench Core | numbers | missing — nothing on screen | live (f.js) | 3 |
| `dng-wave` | Dungeon wave arrives | advanceDungeonWave → dungeonWaveVfx | dungeonWaveVfx + chip | good — has its own look that plays at the right moment | live (f.js) | 2 |
| `dng-floor` | Dungeon floor / endless climb | endless map next floor | re-render | basic — a generic or reused look that does not say what happened | live (f.js) | 3 |
| `pvp-ticket` | PvP ticket used | usePvpTicket | number | basic — a generic or reused look that does not say what happened | live (f.js) | 3 |
| `pvp-portent` | PvP daily portent | pvpPortentHTML | .pvp-portent ppStrange | good — has its own look that plays at the right moment | live (f.js) | 3 |
| `pvp-rating` | Rating change after PvP / ranked | settlePvpAfterMatch / updateRating | numbers | missing — no rating swing animation | live (f.js) | 2 |
| `pvp-queue` | Live ranked queue | live queue | .live-queue-status liveQueuePulse | good — has its own look that plays at the right moment | live (f.js) | 3 |
| `pvp-rejoin` | Rejoin a live match | rejoin button | rejoinPulse | good — has its own look that plays at the right moment | live (f.js) | 3 |
| `pvp-gauntlet-streak` | Gauntlet streak | gauntlet win streak | "🔥 N / goal" text | basic — a generic or reused look that does not say what happened | live (f.js) | 3 |
| `pvp-autobattle` | Whisper's Game (autobattler) buffs and triggers | autobattle buff/dup/passive | .ab-trig trigSpent, boltWake, .ab-bloom bloomPulse | basic — a generic or reused look that does not say what happened | live (f.js) | 3 |
| `coop-shared-cell` | Co-op: partner hovering a shared cell 🔮 | planned D49 | none | missing — planned | lab-only (f.js) | 2 |
| `coop-lock` | Co-op: player locks in (Ready) 🔮 | planned | none | missing — planned | lab-only (f.js) | 2 |
| `coop-resolve` | Co-op: four plays land together 🔮 | planned | none | missing — planned | lab-only (f.js) | 2 |
| `coop-cell-clash` | Co-op: two players pick the same cell 🔮 | planned | none | missing — planned | lab-only (f.js) | 3 |
| `coop-floor-mechanic` | Co-op floor mechanic (cursed shared cells, row-target) 🔮 | planned | none | missing — planned | lab-only (f.js) | 2 |
| `dng-murgle` | Murgle daily dungeons 🔮 | planned | none | missing — planned | lab-only (f.js) | 2 |
| `pvp-map60` | Collection PvP gets wild (Map 60+) 🔮 | planned | none | missing — planned | lab-only (f.js) | 3 |
| `world-event` | World events (community stage rally horn) 🔮 | planned | none | missing — planned | lab-only (f.js) | 2 |

### map-grandeur (`map-grandeur`, 3)

| id | name | trigger | current | quality | status | P |
|---|---|---|---|---|---|--:|
| `map-title-frostfire` | Map title: Frostfire (Map 22) | entering the Rimefire Caldera (m22) for the first time in a session | FX.G.mapTitle, theme frostfire (ribbon banner) | good — has its own look that plays at the right moment | live (w4.js) | 2 |
| `map-title-castle` | Map title: Fortress (Maps 23-24) | entering the Goldfeather Siege (m23) or Goldfeather Keep (m24) for the first time in a session | FX.G.mapTitle, theme castle (ribbon banner) | good — has its own look that plays at the right moment | live (w4.js) | 2 |
| `map-grand-silhouettes-2` | Distant silhouettes (II): battlements, the ice volcano | the Frostfire and Fortress titles | FX.G.silhouettes {sil:battlements} / the frostfire volcano | good — has its own look that plays at the right moment | live (w4.js) | 2 |

🔮 = future (planned). 🎨 = build variants for the designer to choose. Status (manifest file): where it is built in the Effects Lab.

## Future effects by theme

Palette anchors from the lore bible: **Otters** bronze, oxblood red, river blue, cream; **Hummingbirds** saturated crimson, cobalt, gold, violet, emerald on warm cliff stone; **Road-folk** dusty brown, faded indigo, lantern amber; **Beasts** shadowed green-brown with one hot accent (eye glow, blood, ember); **Hives** honeycomb wax, acid-battery green-yellow (ants build lampposts). Magic (Map 50+) gets its own violet-gold arcane language; radiation is sickly green; Wither is black smoke.

### Dragons and Supreme beasts (Map 50, a new dragon every 25 maps)

- `death-dragon` **Dragon falls** — Ground-shaking crash, scales scatter (Dragon Scale drop).
- `death-supreme` **Supreme beast defeated** — Prismatic burst, slow-mo.
- `sum-dragon` **Dragon summoned** — Sky darkens, wing shadow sweeps over, roar.
- `sum-supreme` **Supreme beast arrives** — Prismatic shockwave.

### Magic and weird stuff (Map 50+: Ghost, Shade, Shadow, Psychic, Irradiated, Ichor, Wither; Wandering Mage)

- `dark-shade-night` **Shade halves non-magic hits at night / in the dark** — Map 50+: the blow passes through a dark silhouette.
- `dark-shadow-night` **Shadow: half the hits miss at night / in the dark** — Map 50+: smoke-body flicker.
- `death-ghost` **Ghost fades out** — Translucent wisp drifting up.
- `sum-wandering-mage` **Wandering Mage joins (Map 51)** — Wizard-cat arrives in a puff of stars.

### Flora (Maps 20+), slimes, sprouts

- `death-slime-split` **Slime splits on death** — Gooey split into two blobs.
- `sum-rooted-veggie` **Rooted Wild Veggie takes root** — Roots burrow into the felt.
- `sum-drones-enemy-field` **Drones / golems summoned onto the enemy field** — planned (area control idea)

### Abyssal Plains and pitch-black creatures (Map 29)

- `dark-bioluminescent` **Bioluminescent units glow in pitch black (Abyssal Plains)** — Teal/cyan glow motes, anglerfish lure.
- `dark-pitchblack-fish` **Pitch-black fish strikes in the dark** — A pale shape lunges out of the black.

### Time and sky (Eclipse, Syzygy)

- `dark-eclipse` **Eclipse (day turns to night mid-round)** — Black disc slides over the sun, corona ring, stars pop out.
- `wt-syzygy` **Syzygy (High tide + Full Moon + Eclipse at once)** — Sun, moon and earth align: a single blazing ring over the board.
- `wt-eclipse-phase` **Eclipse phase pill / sky** — planned

### Weather fronts and field ideas

- `st-burn-d65` **Burn (Scorch side effect, D65 proposal)** — Embers clinging to the card.
- `st-chill-d65` **Chill (Cold side effect, D65 proposal)** — planned: 1 cold hit in 3 adds +1 Wait
- `fld-future-monsoon` **Monsoon (rain every round, fire halved, Swimmers Flow)** — Grey sheets of rain, puddles
- `fld-future-wildfire` **Wildfire front moving a column a round** — A wall of flame crossing the board
- `fld-future-migration` **Migration herd crosses the middle** — Dust and silhouettes of a herd
- `fld-future-fogbanks` **Fog banks (no targeting beyond 1 column)** — Thick white columns between lanes
- `fld-future-pollen` **Pollen season (Insects +1, Flora heal)** — Golden motes drifting
- `fld-future-permafrost` **Permafrost thaw (Frigid eases every 3 rounds)** — Ice cracking, drips
- `fld-future-volcanicwinter` **Volcanic winter (whole fight Night)** — Ash snow, dim orange sky
- `fld-future-floodplains` **Floodplains loop (Flooded / Receded / Parched)** — Water rises, drains, ground cracks
- `fld-future-abyssal-pressure` **Abyssal pressure (non-Swimmers take 1 a round)** — Crushing vignette, bubbles squeezed out
- `fld-future-hurricane` **Hurricane (one-off skill idea)** — Spiral wind tearing across

### Factions (Otters, Hummingbirds, Road-folk, Beasts, ants and bees)

- `castle-skin-future` **Castle looks per faction** — Otter river fort (palisade), Hummingbird cliff nest, Road-folk caravan, Hive mound.
- `amb-ant-lampposts` **Ant acid-battery lampposts** — Green-yellow glowing lamps along roads on ant maps.
- `amb-otter-roads` **Otter territory scenery (roads, forts, bridges)** — Banners flap, a patrol marches along a road.
- `amb-hummingbird-cliffs` **Hummingbird territory (painted cliffs, totems, blossoms)** — Hummingbirds flit between blossoms, totems glow.

### Card treatments, frames and backings (Folktale, oriental painting, spy)

- `tr-future-backing-faction` **Card backings by faction / card type** — Otter bronze-oxblood weave, Hummingbird jewel feathers, Road-folk patched cloth, Beasts claw-scratched, Hive honeycomb, Structure blueprint
- `tr-future-backing-monthly` **Monthly card back (pack-bonus reward)** — A new back each month
- `tr-future-frame-otter` **Otter (Rivergate Legion) frame** — Bronze, oxblood, river blue, cream; wave emblem
- `tr-future-frame-hummingbird` **Hummingbird (Sunfeather Tribes) frame** — Jewel tones on cliff stone, feather fringe
- `tr-future-frame-roadfolk` **Road-folk frame** — Dusty brown, faded indigo, lantern amber
- `tr-future-frame-beast` **Beast frame** — Shadow green-brown with one ember accent, claw marks
- `tr-future-frame-hive` **Hive (ants, bees) frame** — Honeycomb wax, acid-battery lamp glow
- `tr-future-folktale` **Folktale / "Legends" style variant** — Painted storybook border
- `tr-future-oriental` **Oriental painting theme set** — Ink-wash border, red seal stamp
- `tr-future-spy` **Spy theme set** — Redacted bars, dossier paper, red TOP SECRET stamp
- `tr-future-veggies` **Flora frame (Maps 20+)** — Vine-wrapped border, soil smudges
- `tr-future-breathing-art` **Breathing art (parallax layers)** — Leaders / heroes / Legendary only
- `tr-future-living-ink` **Living ink frame (SVG turbulence)** — Legendary/Epic borders that slowly writhe
- `tr-future-hero-portraits` **Hero portrait changes at Lv 25/50/100** — planned

### New foils

- `foil-new-ember` **New foil idea: Ember crackle** — Ashen Spurn: glowing cracks breathe under the art
- `foil-new-tide` **New foil idea: Tide caustics** — River / reef: water light dances across
- `foil-new-bramble` **New foil idea: Bramble vine** — Thorny vines grow in from the edges and bloom
- `foil-new-firefly` **New foil idea: Firefly night** — Dark sheen with drifting fireflies
- `foil-new-feather` **New foil idea: Hummingbird iridescence** — Feather barbs shift green-violet with tilt
- `foil-new-bronze` **New foil idea: Legion bronze** — Hammered bronze with a wave emblem glint
- `foil-new-inkwash` **New foil idea: Ink wash** — Oriental-painting ink bleeds and settles
- `foil-new-redacted` **New foil idea: Redacted** — Spy theme: black bars slide to reveal the art
- `foil-new-stainedglass` **New foil idea: Stained glass** — Ecclesia: lead lines, light through jewel panes
- `foil-new-void` **New foil idea: Void static** — Edges crawl with dark static and stars
- `foil-new-hellfire` **New foil idea: Hellfire** — Daemonic: red flame along the border
- `foil-new-radioactive` **New foil idea: Radioactive glow** — Uranium green pulse, geiger flicker
- `foil-new-ghostmist` **New foil idea: Ghost mist** — Translucent card, mist drifting through
- `foil-new-dragonscale` **New foil idea: Dragon scale** — Overlapping scales catching red light
- `foil-new-mycelium` **New foil idea: Mycelium** — Glowing fungal threads spread over the art
- `foil-new-bioluminescent` **New foil idea: Bioluminescent** — Abyssal teal dots pulse in the dark
- `foil-new-mirage` **New foil idea: Desert mirage** — Heat shimmer warps the art
- `foil-new-storm` **New foil idea: Storm** — Lightning forks across behind the art
- `foil-new-autumn` **New foil idea: Autumn leaf** — Gold leaves drift down the card
- `foil-new-moonphase` **New foil idea: Moon phase** — A moon crosses the card through its phases
- `foil-new-constellation` **New foil idea: Constellation** — Stars connect into the creature's outline
- `foil-new-cream-pearl` **New foil idea: Cream pearl (booster foil)** — Cream base, fibre grain, light specks (VFX exploration)

### New map looks

- `map-shader-new-abyssal` **New map shader look: abyssal** — Abyssal Plains (Map 29): pitch black, bioluminescence
- `map-shader-new-dragonic-spire` **New map shader look: dragonic-spire** — Dragonic Spire: red lightning never stops falling, Wither smoke
- `map-shader-new-floodplains` **New map shader look: floodplains** — Floodplains: water rises and recedes

### Places and screens

- `amb-arena` **The Arena as a real arena** — Sand floor, banners, crowd murmur.
- `amb-raid-splash` **Raid splash parallax** — planned (depth rig reuse)
- `amb-crt-grain` **Atmosphere packs (film grain, CRT, rain on glass)** — planned optional atmospheres
- `amb-ink-transition` **Ink-wash transition** — Oriental painting theme.

### Raid, co-op, dungeons, PvP, world events

- `coop-shared-cell` **Co-op: partner hovering a shared cell** — Faint hand icon in the partner's colour.
- `coop-lock` **Co-op: player locks in (Ready)** — Seal stamps on their half.
- `coop-resolve` **Co-op: four plays land together** — Cards drop A, B, C, D in a ripple.
- `coop-cell-clash` **Co-op: two players pick the same cell** — Second card bounces back to hand.
- `coop-floor-mechanic` **Co-op floor mechanic (cursed shared cells, row-target)** — Cursed cells glow red.
- `dng-murgle` **Murgle daily dungeons** — Murky swamp-goblin dungeon gate.
- `pvp-map60` **Collection PvP gets wild (Map 60+)** — planned
- `world-event` **World events (community stage rally horn)** — Horn banner across every screen.

### Economy and long-term progression

- `pack-pity` **Pity guarantee (new card / Epic every 30 packs)** — "Guaranteed!" seal on the pack.
- `pack-odds` **Pack odds shown in the Shop** — planned guardrail
- `meta-daily-login` **Daily login reward / streak** — Calendar acorn cracks open each day.
- `meta-monthly-bonus` **Monthly pack-opening bonus steps** — planned
- `meta-bramble-pass` **Bramble Pass daily pouch** — planned
- `meta-steam-achv` **Steam achievements / overlay** — planned (Steam build)
- `meta-attunement` **Attunement instead of levels (every 100 maps)** — planned
- `meta-alchemy` **Alchemy free top-ups (Map 65+)** — Bubbling flask.
- `meta-dragon-egg-craft` **Craft a dragon egg** — Egg forms from scales in a red glow.
- `meta-materia-socket` **Socket Materia into the Hero (v2)** — Crystal clicks into a slot.
- `meta-bring-effect` **Bring your own effect (Map 80+)** — planned

### Late road (Map 40+)

- `map-chaos-returns` **Chaos returns (Map 40+ respawn)** — Zoom out, advanced nodes land one by one with ripples.

### UI

- `ui-emoji-set` **Emoji / icon set swap (Twemoji, OpenMoji, Noto, Fluent) via icon(key)** — planned

## Gaps that are easy to miss (nothing on screen today)

Built mechanics whose moment shows nothing, or only a battle-log line / toast / sound. Planned items are excluded.

### Engine events with no renderer (log-only or nothing) (18)

- P1 `sk-stun-player` Player Stun (enemy skips their turn) — trigger: stunPlayer {turns}; today: none (battle log only)
- P2 `atk-spite` Spiteful lash-back on death — trigger: statusFx spite (victim lashes the killer); today: none (battle log only)
- P2 `sk-lightning-passive` Lightning (passive) charges — trigger: statusFx lightning {amount}; today: none (no renderer branch)
- P2 `sk-equip` Equip an Equipment card — trigger: equip {equipDefId, attack, health}; today: none (battle log only)
- P2 `sk-desecrate` Desecrate curses a cell — trigger: curse {cell, total}; today: none (battle log only)
- P2 `dark-sunshy-blind` Sun-shy unit blind by day — trigger: sightMiss: phase day + effects.sunshy; today: none (only the blindMiss float when it misses)
- P2 `dark-nightblind` Night-blind unit blind at night — trigger: sightMiss: phase night + effects.nightblind and no Lantern; today: none (only the miss float)
- P2 `dark-beware` Removal-zone crawler at Darkness N (Devilry) — trigger: beware {darkness}; today: none (battle log only)
- P2 `fld-end` Field card ends — trigger: fieldEnd {field, back}; today: none (battle log only)
- P2 `castle-regen` Castle regenerates — trigger: castleRegen {amount, perk}; today: none — no renderer and no log text
- P2 `castle-thorns` Thorn Cage cuts an attacker — trigger: statusFx castleThorns; today: none (log only)
- P2 `castle-spawn` Units pour out of the castle — trigger: statusFx castleSpawn (+ spawn events); today: log line; units get the generic summonPortal
- P3 `sk-shell-down` Shell ends — trigger: statusFx shellDown; today: none (snapshot only)
- P3 `sk-satiety` Satiety — trigger: statusFx satiety; today: none (log only)
- P3 `wt-rain-start-stop` Rain starts / stops while you look at the map — trigger: hour rolls over while the map is open; today: none (only on re-render)
- P3 `castle-herb-heal` Herb Refinery heals — trigger: statusFx herbHeal; today: log line only
- P3 `castle-herb-bane` Herb Refinery bitter brew — trigger: statusFx herbBane (+ poison hit); today: log line only
- P3 `castle-logjam` Logjam holds up a unit — trigger: statusFx logjam {amount}; today: log line only

### Statuses: hidden applies, lost turns, wear-offs, unexplained numbers (41)

- P1 `st-paralyze-coinflip` Paralyze coin flip fails — trigger: skipTurn {reason:'paralyzed'}; today: none (log only)
- P1 `st-resist-weak-hit` Resisted / Weak-to hit — trigger: hit whose damage was halved (resist) or doubled (weakness) — no flag on the event; today: none
- P2 `st-decay-apply` Decay: applied — trigger: hit by a Decay unit (card.decay += N; no statusFx event); today: none
- P2 `st-decay-active` Decay: while active (on the card) — trigger: board card has the Decay status (updateCardStatusDisplay / boardCardHTML classes); today: no badge/tint
- P2 `st-freeze-skip` Frozen unit skips its turn — trigger: skipTurn {reason:'frozen'}; today: none (log only)
- P2 `st-sleep-skip` Asleep unit skips its turn — trigger: skipTurn {reason:'asleep'}; today: none (log only)
- P2 `st-sleep-wake` Woken by damage — trigger: damage breaks sleep (no event); today: none
- P2 `st-stun-skip` Stunned unit skips its turn — trigger: skipTurn {reason:'stunned'}; today: none (log only)
- P2 `st-shock-bonus-dmg` Shocked unit takes +50% damage — trigger: hit on a shocked target (no flag on the event); today: none
- P2 `st-expose-active` Expose: while active (on the card) — trigger: board card has the Expose status (updateCardStatusDisplay / boardCardHTML classes); today: none (c.exposed has no class or badge)
- P2 `st-daunt-active` Daunt: while active (on the card) — trigger: board card has the Daunt status (updateCardStatusDisplay / boardCardHTML classes); today: none (rc.daunts only)
- P2 `st-wither-active` Wither: while active (on the card) — trigger: board card has the Wither status (updateCardStatusDisplay / boardCardHTML classes); today: none
- P2 `st-mind-controlled` Mind-controlled unit (while on your side) — trigger: after mindControl the unit belongs to the other side; today: none
- P2 `st-ward-crush` Supreme crushes Armor / Shell / Stone / temporary Health / Ward — trigger: hit by a Supreme attacker (crush flag inside damageCard; no event flag); today: none
- P3 `st-poison-expire` Poison: wears off — trigger: endOfRoundUpkeep counter reaches 0 (no event pushed); today: none (overlay disappears on the next status sync)
- P3 `st-bleed-expire` Bleed: wears off — trigger: endOfRoundUpkeep counter reaches 0 (no event pushed); today: none (overlay disappears on the next status sync)
- P3 `st-decay-expire` Decay: wears off — trigger: endOfRoundUpkeep counter reaches 0 (no event pushed); today: none (overlay disappears on the next status sync)
- P3 `st-sleep-expire` Sleep: wears off — trigger: endOfRoundUpkeep counter reaches 0 (no event pushed); today: none (overlay disappears on the next status sync)
- P3 `st-paralyze-expire` Paralyze: wears off — trigger: endOfRoundUpkeep counter reaches 0 (no event pushed); today: none (overlay disappears on the next status sync)
- P3 `st-stun-expire` Stun: wears off — trigger: endOfRoundUpkeep counter reaches 0 (no event pushed); today: none (overlay disappears on the next status sync)
- P3 `st-stagger-expire` Stagger: wears off — trigger: endOfRoundUpkeep counter reaches 0 (no event pushed); today: none (overlay disappears on the next status sync)
- P3 `st-stagger-weak-hit` Staggered unit deals half damage — trigger: hit by a staggered attacker (no flag on the event); today: none
- P3 `st-blind-expire` Blind: wears off — trigger: endOfRoundUpkeep counter reaches 0 (no event pushed); today: none (overlay disappears on the next status sync)
- P3 `st-blind-keen-sense` Keen Sense ignores Blind — trigger: rollStatusOnHit returns early (no event); today: none
- P3 `st-tipsy-expire` Tipsy: wears off — trigger: endOfRoundUpkeep counter reaches 0 (no event pushed); today: none (overlay disappears on the next status sync)
- P3 `st-confuse-expire` Confuse: wears off — trigger: endOfRoundUpkeep counter reaches 0 (no event pushed); today: none (overlay disappears on the next status sync)
- P3 `st-shock-expire` Shock: wears off — trigger: endOfRoundUpkeep counter reaches 0 (no event pushed); today: none (overlay disappears on the next status sync)
- P3 `st-corrode-expire` Corrode: wears off — trigger: endOfRoundUpkeep counter reaches 0 (no event pushed); today: none (overlay disappears on the next status sync)
- P3 `st-expose-expire` Expose: wears off — trigger: endOfRoundUpkeep counter reaches 0 (no event pushed); today: none (overlay disappears on the next status sync)
- P3 `st-expose-bonus-hit` Hit on an Exposed unit — trigger: hit on a target with exposed>0 (no flag); today: none
- P3 `st-daunt-expire` Daunt: wears off — trigger: endOfRoundUpkeep counter reaches 0 (no event pushed); today: none (overlay disappears on the next status sync)
- P3 `st-wither-expire` Wither: wears off — trigger: endOfRoundUpkeep counter reaches 0 (no event pushed); today: none (overlay disappears on the next status sync)
- P3 `st-irradiation-expire` Irradiation tokens: wears off — trigger: endOfRoundUpkeep counter reaches 0 (no event pushed); today: none (overlay disappears on the next status sync)
- P3 `st-smoke-expire` Smoke (Smoke Bomb on an ally): wears off — trigger: endOfRoundUpkeep counter reaches 0 (no event pushed); today: none (overlay disappears on the next status sync)
- P3 `st-chained-skip` Chained unit skips its turn — trigger: skipTurn {reason:'chained'}; today: none (log only)
- P3 `st-petrified-skip` Petrified unit skips its turn — trigger: skipTurn {reason:'petrified'}; today: none (log only)
- P3 `st-petrified-end` Petrification wears off — trigger: round end (no event); today: none (class removed on re-render)
- P3 `st-shell-skip` Shelled unit skips its turn — trigger: skipTurn {reason:'shell'}; today: none (log only)
- P3 `st-ritual-skip` Ritual unit skips its turn — trigger: skipTurn {reason:'ritual'}; today: none (log only)
- P3 `st-zero-attack-skip` Unit with 0 Attack skips — trigger: skipTurn {reason:'zeroAttack'}; today: none (log only)
- P3 `st-inspired-spent` Inspired bonus spent on the swing — trigger: next attack consumes c.inspired (no event); today: none

### Deaths without their own look (17)

- P1 `death-leader` Leader / King dies — trigger: death of the leader unit (m.leaderUid) or a King; today: normal death
- P1 `death-boss` Boss unit dies — trigger: death of a boss-node enemy unit / world boss; today: normal death
- P2 `death-lightning` Electrocuted (Electricity / Dragon Lightning / Shock Bolt) — trigger: death after this damage source (deathStyleFor has no style for it → falls to fall/burn/poison); today: fall/topple (generic)
- P2 `death-wither` Withered away — trigger: death after this damage source (deathStyleFor has no style for it → falls to fall/burn/poison); today: fall/topple (generic)
- P2 `death-water` Drowned / washed away (Tsunami, Tide-spout) — trigger: death after this damage source (deathStyleFor has no style for it → falls to fall/burn/poison); today: fall/topple (generic)
- P2 `death-crushed` Crushed (Earthquake, Landslide, Avalanche, Meteor, Comet) — trigger: death after this damage source (deathStyleFor has no style for it → falls to fall/burn/poison); today: fall/topple (generic)
- P2 `death-explode` Blown up (Explode, Dynamite) — trigger: death after this damage source (deathStyleFor has no style for it → falls to fall/burn/poison); today: fall/topple (generic)
- P2 `death-structure` Structure destroyed — trigger: death of a Structure card; today: normal death
- P2 `death-lethal-number` Killing blow number — trigger: hit that drops hp to 0; today: normal damage number
- P3 `death-magic` Killed by magic — trigger: death after this damage source (deathStyleFor has no style for it → falls to fall/burn/poison); today: fall/topple (generic)
- P3 `death-psychic` Mind shattered (Psychic) — trigger: death after this damage source (deathStyleFor has no style for it → falls to fall/burn/poison); today: fall/topple (generic)
- P3 `death-irradiation` Irradiated to death — trigger: death after this damage source (deathStyleFor has no style for it → falls to fall/burn/poison); today: fall/topple (generic)
- P3 `death-petrified` Shattered while petrified — trigger: death after this damage source (deathStyleFor has no style for it → falls to fall/burn/poison); today: fall/topple (generic)
- P3 `death-curse` Killed on cursed ground (Desecrate) — trigger: death after this damage source (deathStyleFor has no style for it → falls to fall/burn/poison); today: fall/topple (generic)
- P3 `death-true` True / ichor damage — trigger: death after this damage source (deathStyleFor has no style for it → falls to fall/burn/poison); today: fall/topple (generic)
- P3 `death-egg` Egg card destroyed before hatching — trigger: death of a hatchInto card; today: normal death
- P3 `death-shiny-foil` Shiny / foil unit dies — trigger: death of a shiny or foil unit; today: normal death; finish just disappears

### Maps and world (21)

- P1 `map-node-cleared` Fight cleared (returning to the map) — trigger: completeConquestNode then map re-render; today: node gets .done
- P1 `map-trail-unlock` Trail to the next fight unlocks — trigger: a new node becomes reachable; today: trail SVG just re-renders
- P1 `map-cleared` Whole map cleared — trigger: conquestMapCleared(mapId) becomes true; today: XP milestone toast only
- P2 `map-amb-mo` Map ambience: The Old Bramble (mo) — trigger: conquest map mo shown → mountMapShader(host, 'mo') + startMapMovers + generatedMapDecor; today: no shader kind in MAP_KIND (no map overlay; battle ambience/shader fall back to forest); …
- P2 `map-amb-mq` Map ambience: Clovermead (mq) — trigger: conquest map mq shown → mountMapShader(host, 'mq') + startMapMovers + generatedMapDecor; today: no shader kind in MAP_KIND (no map overlay; battle ambience/shader fall back to forest); …
- P2 `map-amb-ms` Map ambience: The Sunken Grove (ms) — trigger: conquest map ms shown → mountMapShader(host, 'ms') + startMapMovers + generatedMapDecor; today: no shader kind in MAP_KIND (no map overlay; battle ambience/shader fall back to forest); …
- P2 `map-amb-mz` Map ambience: The Mycelium Deep (mz) — trigger: conquest map mz shown → mountMapShader(host, 'mz') + startMapMovers + generatedMapDecor; today: no shader kind in MAP_KIND (no map overlay; battle ambience/shader fall back to forest); …
- P2 `map-amb-mn` Map ambience: The Glimmer Depths (mn) — trigger: conquest map mn shown → mountMapShader(host, 'mn') + startMapMovers + generatedMapDecor; today: no shader kind in MAP_KIND (no map overlay; battle ambience/shader fall back to forest); …
- P2 `map-amb-mv` Map ambience: The Aerie Vault (mv) — trigger: conquest map mv shown → mountMapShader(host, 'mv') + startMapMovers + generatedMapDecor; today: no shader kind in MAP_KIND (no map overlay; battle ambience/shader fall back to forest); …
- P2 `map-amb-mi` Map ambience: The Ice Hollow (mi) — trigger: conquest map mi shown → mountMapShader(host, 'mi') + startMapMovers + generatedMapDecor; today: no shader kind in MAP_KIND (no map overlay; battle ambience/shader fall back to forest); …
- P2 `map-amb-mx` Map ambience: Volcano Lair (mx) — trigger: conquest map mx shown → mountMapShader(host, 'mx') + startMapMovers + generatedMapDecor; today: no shader kind in MAP_KIND (no map overlay; battle ambience/shader fall back to forest); …
- P2 `map-next-unlocked` Next map unlocked — trigger: isMapUnlocked flips after a boss; today: world stop opens next time
- P2 `map-chance-node` Chance fight found — trigger: completeConquestNode rolls a hidden chance node; today: appears on next render
- P2 `map-day-night-tint` Map time-of-day grading — trigger: planned (time of day on maps); today: live clock tint only on Home
- P2 `map-fog-misty` Mist drifting over Map 0 — trigger: misty map (Outskirts / Old Bramble); today: none on the map itself (savanna shader on m1)
- P2 `map-shader-new-fungal` New map shader look: fungal — trigger: planned shader kind; today: none
- P2 `map-shader-new-dragon-lair` New map shader look: dragon-lair — trigger: planned shader kind; today: none
- P2 `map-shader-new-misty-meadow` New map shader look: misty-meadow — trigger: planned shader kind; today: none
- P3 `map-late-side-map` Late side map arrives (days later / after a quest) — trigger: entry.afterDays / entry.quest; today: appears on next render
- P3 `map-shader-new-ice-cave` New map shader look: ice-cave — trigger: planned shader kind; today: none
- P3 `map-shader-new-crystal-cave` New map shader look: crystal-cave — trigger: planned shader kind; today: none

### Cards, packs, foils (6)

- P1 `pack-reveal-mythic` Mythic pull gets its own reveal — trigger: reveal() of a mythic card; today: same as every tier 11+ (legend tease + big rays)
- P1 `pack-reveal-foil` Foil pull reveal — trigger: reveal() of a card with a foil finish (pullClass); today: finish shows on the face, nothing more
- P2 `pack-reveal-ancient` Ancient pull gets its own reveal — trigger: reveal() of a ancient card; today: same as every tier 11+ (legend tease + big rays)
- P2 `pack-reveal-divine` Divine pull gets its own reveal — trigger: reveal() of a divine card; today: same as every tier 11+ (legend tease + big rays)
- P2 `pack-reveal-void` Void pull gets its own reveal — trigger: reveal() of a void card; today: same as every tier 11+ (legend tease + big rays)
- P2 `pack-reveal-daemonic` Daemonic pull gets its own reveal — trigger: reveal() of a daemonic card; today: same as every tier 11+ (legend tease + big rays)

### Meta, UI, rewards, raid (42)

- P1 `sk-exile-board` Exile a unit from the board — trigger: statusFx exile → exile {zone:'board'}; today: SoundKit.exile only; the card just disappears
- P1 `dark-unit-blind` A unit can't see in the dark (no Darksight, no Lantern) — trigger: sightBlind(card) true for the whole fight (no event); today: none
- P1 `wt-twilight` Twilight begins (Day, Night, Day, Night, Twilight) — trigger: phase {phase:'twilight'}; today: sky tone dusk; toast reads "☀️ Day breaks." (wrong text)
- P1 `raid-stage-change` Raid stage change (Enraged 75%, Exposed <1%) — trigger: global raid stage crossed; today: stage name chip
- P2 `atk-dmgtype-magic` Damage type look: magic — trigger: any hit/hitHQ with dmgType:'magic' → battleLightAt(LIGHT_COLORS[dmgType]) + dmgGlyph(dmgType) projectile; today: LIGHT_COLORS.magic / dmgGlyph
- P2 `atk-dmgtype-water` Damage type look: water — trigger: any hit/hitHQ with dmgType:'water' → battleLightAt(LIGHT_COLORS[dmgType]) + dmgGlyph(dmgType) projectile; today: LIGHT_COLORS.water / dmgGlyph
- P2 `atk-dmgtype-true` Damage type look: true — trigger: any hit/hitHQ with dmgType:'true' → battleLightAt(LIGHT_COLORS[dmgType]) + dmgGlyph(dmgType) projectile; today: LIGHT_COLORS.true / dmgGlyph
- P2 `sk-supreme-strike` Supreme beast strike (magic, crushes Armor/Ward) — trigger: hit by a Supreme unit; today: none distinct
- P2 `dark-lantern-out` Lantern carrier dies: the dark returns — trigger: lantern unit death (no event); today: none
- P2 `wt-headwind` Headwind: Flyer skills and triggers go off twice — trigger: headwindDouble(card) (no event); today: none
- P2 `castle-shield` Castle shield (raid Core / skirmish Shield) — trigger: raid part castle shield; castle can't be hit while stumps live; today: none
- P2 `sum-structure` Structure placed — trigger: play of a Structure card; today: normal landing
- P2 `ui-deck-add` Card added to a deck — trigger: deck editor add; today: none
- P2 `ui-deck-remove` Card removed from a deck — trigger: deck editor remove; today: none
- P2 `ui-skill-reveal` Skill "?" lifts (first time a skill is shown) — trigger: skillRevealState / noteMapEnteredForReveal; today: text swap
- P2 `meta-forge-melt` Forge: melt duplicates for Dust — trigger: forgeMeltBtn / disenchantAllExtras; today: toast
- P2 `meta-hero-skill-pick` Hero skill pick (Lv 5/15/30/50/75/100) — trigger: renderHeroHall skill slot; today: choice UI
- P2 `meta-nest-egg-place` Place an egg in the Nest — trigger: placeEggInNest; today: re-render
- P2 `meta-achv-unlocked-live` Achievement unlocked (the moment it happens) — trigger: achievement condition met during play; today: new-achievements chip only
- P2 `tut-dialogue-portrait` NPC portrait expression change — trigger: dialogue line with a mood; today: static portrait art
- P2 `pvp-rating` Rating change after PvP / ranked — trigger: settlePvpAfterMatch / updateRating; today: numbers
- P3 `sk-exile-zone` Exile from hand / graveyard (Prayer, Exile Grave) — trigger: exile {zone:'hand'\|'graveyard', prayer}; today: SoundKit.exile only
- P3 `sk-echo-gain` Echo 🕯️ gained (card exiled) — trigger: pl.echoes += 1 on exile (no event); today: none
- P3 `sk-resource-passive` Resource passives (Lumberjack, Timber, Heavy Metal, Rock-solid, Iron-will) — trigger: pitch/gain rules with no event; today: none
- P3 `sk-keen-eye-unmask` Keen Eye reveals a Changeling — trigger: changeling hidden while a Keen Eye ally is on the viewer's side; today: disguise simply not applied
- P3 `sk-dry-spared` Dry / heat-resistant unit spared by Scorching — trigger: heatwave fieldTick skips resistant units (no event); today: none
- P3 `sk-demolisher` Demolisher bonus vs structures — trigger: damage multiplier vs Structure (no event); today: none
- P3 `sk-rainrunner` Rainrunner charges past the line in the rain — trigger: Rainrunner unit while it rains: +N/+N and unblockable (goes straight for the castle); today: normal castle hit
- P3 `dark-leave` Darkness lifts (match over) — trigger: syncDarkVeil with m.over → veil removed; today: veil removed instantly
- P3 `dark-keen-sense` Keen Sense unit senses in the dark — trigger: keenSense ignores darkness for non-flying targets; today: none
- P3 `dark-lantern-save` Lantern saves a swing (no miss thanks to the light) — trigger: sightMiss returns 0 with lit(); today: none
- P3 `dark-darksight-idle` Darksight eyes glint in the dark — trigger: while rules.dark and the unit has Darksight; today: none
- P3 `fld-base-returns` Map field returns after a played field ends — trigger: fieldEnd {back}; today: none
- P3 `fld-frost-resist` Frost can't touch the enemy's native types — trigger: rules.frostResist filter (no event); today: none
- P3 `wt-wind-calm` Wind drops for a round — trigger: wind {windy:false}; today: pill switches to Calm
- P3 `wt-wind-swap` Wind changes direction — trigger: consecutive gusts from opposite sides; today: none
- P3 `sum-egg-idle` Egg card waiting on the board — trigger: egg (hatchInto) card on the board; today: normal card
- P3 `meta-forge-tier-up` Forge tier upgrade — trigger: upgradeForge; today: toast
- P3 `meta-hero-stat-spend` Hero stat point spent — trigger: Hall +1 Attack/Health/Wait; today: numbers update
- P3 `meta-energy-tick` Energy refills (+1 every 5 min) / full — trigger: settleEnergy tick; today: countdown text
- P3 `meta-energy-upgrade` Max Energy upgrade (Camp / Forge) — trigger: buyEnergyUpgrade; today: number
- P3 `raid-core-stumps` Core stumps armour each other — trigger: trench Core; today: numbers

## Build batches

Six batches of roughly equal work. Work points: missing/broken 3, basic 2, good 0.5 (keep, check it still plays, polish if cheap), future 1 (design sketch or variant only). Every entry carries its batch in the JSON (`batch`).

To even the load, four small groups sit outside their area's default batch: status wear-offs and lost turns (`st-*-expire`, `st-*-skip`, `st-paralyze-coinflip`, `st-sleep-wake`, `st-petrified-end`) go to **C** with the other "unit leaves the action" moments; the on-card status looks (`st-*-active`, badges, stat pills, rage, phase aura, mind-controlled, caged) and the Forge upgrade moments (`meta-forge-*`, `meta-castle-temper`) go to **D** with the card surface work; resource gains that fly into the HUD pills (`sk-gain-resource` and friends) go to **F** with the HUD.

**Rules for every batch:** respect `fxLevel()` (None/Low/Med/High) and `reducedMotion()`; additive changes only inside `renderVfxForEvent` (see `context-vfx-animation.md`); repeating looks at most once per unit per round (`skillFxOnce`); one big moment at a time; build the `variantsSuggested` items as 2–3 switchable variants and add each to the Effects Lab so the designer can pick.

| Batch | Scope | entries | missing+broken | basic | good | future | work points |
|---|---|--:|--:|--:|--:|--:|--:|
| A | Combat attacks & skills | 174 | 17 | 65 | 92 | 0 | 227 |
| B | Statuses (apply/tick), darkness/light, fields, weather & time | 139 | 25 | 40 | 55 | 19 | 202 |
| C | Deaths, castle, summons/spawns/hatch (+ status wear-offs and lost turns) | 119 | 54 | 23 | 32 | 10 | 234 |
| D | Card treatments & foils (incl. new fun foils), pack/card opening (+ on-card status looks, Forge upgrade moments) | 169 | 13 | 43 | 75 | 38 | 200 |
| E | Conquest map & world ambience | 168 | 21 | 54 | 82 | 11 | 223 |
| F | UI / meta / rewards / tutorial / raid-dungeon-PvP (+ resource gains into the HUD pills) | 164 | 15 | 51 | 80 | 18 | 205 |

### Batch A: Combat attacks & skills (174 entries)

- **combat-attack** (90): `atk-melee-lunge`, `atk-castle-lunge`, `atk-impact`, `atk-heavy-hitstop`, `atk-big-blow-shake`, `atk-crit`, `atk-armor-block-full`, `atk-armor-block-partial`, `atk-dmgtype-physical`, `atk-dmgtype-heat`, `atk-dmgtype-cold`, `atk-dmgtype-acid`, `atk-dmgtype-poison`, `atk-dmgtype-decay`, `atk-dmgtype-magic`, `atk-dmgtype-water`, `atk-dmgtype-true`, `atk-ranged-projectile`, `atk-arrow`, `atk-fire-arrow`, `atk-ice-arrow`, `atk-twin-shot`, `atk-volley`, `atk-snipe`, `atk-bolt-fire`, `atk-bolt-acid`, `atk-bolt-poison`, `atk-bolt-ice`, `atk-bolt-shock`, `atk-cleave`, `atk-sweep-whiff`, `atk-prong-fork`, `atk-prong-trident`, `atk-prong-pitchfork`, `atk-prong-castle`, `atk-octolash`, `atk-crab-claw`, `atk-backstab`, `atk-ambush`, `atk-quick`, `atk-swift`, `atk-frenzy`, `atk-swarm`, `atk-flying-swoop`, `atk-scared-lunge`, `atk-unitfx-claw`, `atk-unitfx-bite`, `atk-unitfx-sting`, `atk-unitfx-peck`, `atk-unitfx-burn`, `atk-unitfx-firebreath`, `atk-counter-parry`, `atk-guardian-redirect`, `atk-thorns`, `atk-reflect`, `atk-recoil`, `atk-spite`, `atk-evade-evasive`, `atk-evade-swift`, `atk-evade-flying`, `atk-evade-fog`, `atk-evade-illusory`, `atk-evade-shadow`, `atk-evade-smoke`, `atk-blind-miss`, `atk-confused-whiff`, `atk-tipsy-swing`, `atk-boomerang-throw`, `atk-boomerang-castle`, `atk-boomerang-return`, `atk-boomerang-caught`, `atk-boomerang-whiff`, `atk-boomerang-friendly`, `atk-king-slayer`, `atk-pierce-rend`, `atk-pierce-hq`, `atk-overwhelm-hq`, `atk-siege`, `atk-bulwark`, `atk-stealth-slip`, `atk-fester`, `atk-rupture`, `atk-quake-hit`, `atk-retribution`, `atk-reload`, `atk-friction`, `atk-pounce`, `atk-swipe-lumber`, `atk-charge-fire`, `atk-castle-bolt-shot`
- **combat-skill** (84): `sk-trigger-fired`, `sk-earthquake`, `sk-landslide`, `sk-tornado`, `sk-avalanche`, `sk-tsunami`, `sk-wave`, `sk-dragon-lightning`, `sk-electricity`, `sk-lightning-passive`, `sk-fireball`, `sk-meteor`, `sk-meteor-burn`, `sk-psychic`, `sk-smoke-bomb`, `sk-banana-throw`, `sk-banana-eat`, `sk-durian`, `sk-chilli`, `sk-coffee`, `sk-dynamite`, `sk-dynamite-fuse`, `sk-explode`, `sk-rocket`, `sk-rally`, `sk-inspired`, `sk-esprit`, `sk-grit`, `sk-momentum`, `sk-berserk`, `sk-hive-mind`, `sk-pack`, `sk-heal-generic`, `sk-regen`, `sk-bloom`, `sk-sap`, `sk-render`, `sk-gash`, `sk-revive`, `sk-shield-up`, `sk-shield-soak`, `sk-shield-break`, `sk-shell-up`, `sk-shell-down`, `sk-shield-call`, `sk-helmet`, `sk-nullify`, `sk-cleanse`, `sk-stanch`, `sk-buff-action`, `sk-debuff-action`, `sk-mind-control`, `sk-swap`, `sk-converge`, `sk-restless`, `sk-stun-player`, `sk-exile-board`, `sk-exile-zone`, `sk-remember`, `sk-spell-card`, `sk-devour`, `sk-equip`, `sk-sacrifice`, `sk-fast-forward`, `sk-satiety`, `sk-shed`, `sk-first-blood`, `sk-bludgeon`, `sk-immolation-src`, `sk-irradiated-src`, `sk-wither`, `sk-ichor`, `sk-frostbite`, `sk-keen-eye-unmask`, `sk-changeling-unmask`, `sk-desecrate`, `sk-curse-tick`, `sk-conditional-stats`, `sk-dry-spared`, `sk-demolisher`, `sk-supreme-strike`, `sk-armor-shred`, `sk-prayer`, `sk-rainrunner`

### Batch B: Statuses (apply/tick), darkness/light, fields, weather & time (139 entries)

- **status** (40): `st-poison-apply`, `st-poison-tick`, `st-bleed-apply`, `st-bleed-tick`, `st-decay-apply`, `st-decay-tick`, `st-freeze-apply`, `st-freeze-tick`, `st-freeze-field`, `st-sleep-apply`, `st-paralyze-apply`, `st-stun-apply`, `st-stagger-apply`, `st-stagger-weak-hit`, `st-blind-apply`, `st-blind-keen-sense`, `st-tipsy-apply`, `st-confuse-apply`, `st-shock-apply`, `st-shock-bonus-dmg`, `st-corrode-apply`, `st-expose-apply`, `st-expose-bonus-hit`, `st-daunt-apply`, `st-wither-apply`, `st-wither-tick`, `st-irradiation-apply`, `st-irradiation-tick`, `st-smoke-apply`, `st-scar-apply`, `st-chain-break`, `st-petrified-apply`, `st-coffee-crash`, `st-chilli-burn`, `st-inspired-spent`, `st-cage-broken`, `st-ward-crush`, `st-resist-weak-hit`, `st-burn-d65`, `st-chill-d65`
- **field** (44): `fld-set`, `fld-end`, `fld-base-returns`, `fld-frigid-tick`, `fld-frigid-weak`, `fld-frost-resist`, `fld-scorching-tick`, `fld-rain-tick`, `fld-fog-active`, `fld-moon-active`, `fld-field-tile-looks`, `fld-env-cards`, `fld-env-reveal`, `fld-misty`, `fld-terrain-banner`, `fld-lava-tide`, `fld-eruption`, `fld-scorched`, `fld-comet-rain`, `fld-comet-strike`, `fld-eruption-reset`, `fld-volcanic-ambient`, `fld-tide-spout`, `fld-tide-spout-wash`, `fld-boss-surge`, `fld-deep-mines`, `fld-first-blood-rule`, `fld-lumber-every`, `fld-forecast`, `fld-arena-ruleset`, `fld-wet-raindrops`, `fld-water-ripple`, `fld-felt-material`, `fld-biome-puff`, `fld-future-monsoon`, `fld-future-wildfire`, `fld-future-migration`, `fld-future-fogbanks`, `fld-future-pollen`, `fld-future-permafrost`, `fld-future-volcanicwinter`, `fld-future-floodplains`, `fld-future-abyssal-pressure`, `fld-future-hurricane`
- **weather-time** (28): `wt-day-breaks`, `wt-dawn-draw`, `wt-dusk`, `wt-twilight`, `wt-realtime-phase`, `wt-moon-phase`, `wt-tide-flow`, `wt-tide-ebb`, `wt-tide-high`, `wt-perma-tide`, `wt-moonpull`, `wt-wind-gust`, `wt-wind-calm`, `wt-wind-swap`, `wt-tailwind`, `wt-headwind`, `wt-swimmer-flow`, `wt-battle-rain`, `wt-lightning-strike`, `wt-world-rain`, `wt-rain-start-stop`, `wt-live-clock`, `wt-seasons`, `wt-sudden-death`, `wt-first-field-flash`, `wt-initiative-coin`, `wt-syzygy`, `wt-eclipse-phase`
- **darkness-light** (27): `dark-dark-enter`, `dark-dark-miss`, `dark-pitch-enter`, `dark-pitch-miss`, `dark-absolute-enter`, `dark-absolute-miss`, `dark-leave`, `dark-unit-blind`, `dark-sunshy-blind`, `dark-nightblind`, `dark-keen-sense`, `dark-lantern-lit`, `dark-lantern-out`, `dark-lantern-save`, `dark-darksight-play`, `dark-darksight-idle`, `dark-cave-lamp`, `dark-night-veil-in`, `dark-night-veil-out`, `dark-shade-night`, `dark-shadow-night`, `dark-beware`, `dark-inherent`, `dark-devilry-aura`, `dark-bioluminescent`, `dark-pitchblack-fish`, `dark-eclipse`

### Batch C: Deaths, castle, summons/spawns/hatch (+ status wear-offs and lost turns) (119 entries)

- **status** (31): `st-poison-expire`, `st-bleed-expire`, `st-decay-expire`, `st-freeze-expire`, `st-freeze-skip`, `st-sleep-expire`, `st-sleep-skip`, `st-sleep-wake`, `st-paralyze-expire`, `st-paralyze-coinflip`, `st-stun-expire`, `st-stun-skip`, `st-stagger-expire`, `st-blind-expire`, `st-tipsy-expire`, `st-confuse-expire`, `st-shock-expire`, `st-corrode-expire`, `st-expose-expire`, `st-daunt-expire`, `st-wither-expire`, `st-irradiation-expire`, `st-smoke-expire`, `st-scar-expire`, `st-chained-skip`, `st-petrified-skip`, `st-petrified-end`, `st-cower-skip`, `st-shell-skip`, `st-ritual-skip`, `st-zero-attack-skip`
- **death** (37): `death-fall`, `death-flyer-fall`, `death-burn`, `death-poison`, `death-acid`, `death-decay`, `death-cold`, `death-bleed`, `death-token`, `death-lightning`, `death-magic`, `death-psychic`, `death-wither`, `death-irradiation`, `death-water`, `death-crushed`, `death-explode`, `death-petrified`, `death-curse`, `death-true`, `death-sacrificed`, `death-leader`, `death-boss`, `death-egg`, `death-structure`, `death-shiny-foil`, `death-skull`, `death-kill-emote`, `death-speech`, `death-bounty`, `death-collapse-in`, `death-revive-save`, `death-lethal-number`, `death-ghost`, `death-dragon`, `death-supreme`, `death-slime-split`
- **castle** (21): `castle-hit`, `castle-hp-number`, `castle-crack-1`, `castle-crack-2`, `castle-crack-3`, `castle-danger`, `castle-crumble`, `castle-crumble-variants`, `castle-regen`, `castle-lumber`, `castle-ballista`, `castle-thorns`, `castle-herb-heal`, `castle-herb-bane`, `castle-spawn`, `castle-logjam`, `castle-speech`, `castle-friendly-hit`, `castle-shield`, `castle-enemy-leader-banner`, `castle-skin-future`
- **summon-spawn** (30): `sum-hand-play`, `sum-enemy-play`, `sum-reserve`, `sum-advance`, `sum-big-arrival`, `sum-leader`, `sum-enemy-leader`, `sum-gladiator`, `sum-boss-entrance`, `sum-trigger-spawn`, `sum-on-death-spawn`, `sum-meiosis`, `sum-on-attacked`, `sum-twin`, `sum-brood`, `sum-skyfall`, `sum-castle-spawn`, `sum-remember`, `sum-hatch-battle`, `sum-egg-idle`, `sum-structure`, `sum-mind-control-arrive`, `sum-devilry-drop`, `sum-seen-new`, `sum-sprout-token`, `sum-rooted-veggie`, `sum-dragon`, `sum-supreme`, `sum-wandering-mage`, `sum-drones-enemy-field`

### Batch D: Card treatments & foils (incl. new fun foils), pack/card opening (+ on-card status looks, Forge upgrade moments) (169 entries)

- **status** (28): `st-poison-active`, `st-bleed-active`, `st-decay-active`, `st-freeze-active`, `st-sleep-active`, `st-paralyze-active`, `st-stun-active`, `st-stagger-active`, `st-blind-active`, `st-tipsy-active`, `st-confuse-active`, `st-shock-active`, `st-corrode-active`, `st-expose-active`, `st-daunt-active`, `st-wither-active`, `st-irradiation-active`, `st-smoke-active`, `st-scar-active`, `st-chained-active`, `st-rage-enter`, `st-low-hp`, `st-phase-grow`, `st-phase-fade`, `st-stat-change`, `st-mind-controlled`, `st-caged-leader`, `st-status-badges`
- **card-treatment** (49): `tr-rarity-low`, `tr-rarity-uncommon`, `tr-rarity-mid`, `tr-rarity-high`, `tr-rarity-top`, `tr-rarity-mythic`, `tr-rarity-ancient`, `tr-rarity-divine`, `tr-rarity-void`, `tr-rarity-daemonic`, `tr-rarity-special`, `tr-elite-polish`, `tr-boss-extended`, `tr-prestige-gold`, `tr-prestige-rainbow`, `tr-prestige-extended`, `tr-shiny`, `tr-shiny-mark`, `tr-shiny-spawn`, `tr-leader-frame`, `tr-hero-frame`, `tr-supreme`, `tr-devilry`, `tr-antique`, `tr-classic`, `tr-cards-of-old`, `tr-field-card`, `tr-token`, `tr-nest-born`, `tr-locked`, `tr-magnetic`, `tr-atk-heat`, `tr-skins`, `tr-card-back`, `tr-card-inspect`, `tr-future-backing-faction`, `tr-future-backing-monthly`, `tr-future-frame-otter`, `tr-future-frame-hummingbird`, `tr-future-frame-roadfolk`, `tr-future-frame-beast`, `tr-future-frame-hive`, `tr-future-folktale`, `tr-future-oriental`, `tr-future-spy`, `tr-future-veggies`, `tr-future-breathing-art`, `tr-future-living-ink`, `tr-future-hero-portraits`
- **foil** (44): `foil-pearl`, `foil-rainbow`, `foil-cosmos`, `foil-starlight`, `foil-hex`, `foil-etched`, `foil-ice`, `foil-gold`, `foil-reverse`, `foil-prism`, `foil-lattice`, `foil-aurora`, `foil-galaxy`, `foil-molten`, `foil-frost`, `foil-oilslick`, `foil-sakura`, `foil-sparkle`, `foil-scanline`, `foil-old`, `foil-splash`, `foil-tilt-board`, `foil-new-ember`, `foil-new-tide`, `foil-new-bramble`, `foil-new-firefly`, `foil-new-feather`, `foil-new-bronze`, `foil-new-inkwash`, `foil-new-redacted`, `foil-new-stainedglass`, `foil-new-void`, `foil-new-hellfire`, `foil-new-radioactive`, `foil-new-ghostmist`, `foil-new-dragonscale`, `foil-new-mycelium`, `foil-new-bioluminescent`, `foil-new-mirage`, `foil-new-storm`, `foil-new-autumn`, `foil-new-moonphase`, `foil-new-constellation`, `foil-new-cream-pearl`
- **pack-card-open** (37): `pack-idle`, `pack-glow`, `pack-jackpot`, `pack-stack`, `pack-tear`, `pack-burst`, `pack-legacy-shake`, `pack-deal`, `pack-tease-rare`, `pack-tease-epic`, `pack-tease-legend`, `pack-rays`, `pack-rays-big`, `pack-spark`, `pack-reveal-mythic`, `pack-reveal-ancient`, `pack-reveal-divine`, `pack-reveal-void`, `pack-reveal-daemonic`, `pack-reveal-foil`, `pack-reveal-shiny`, `pack-new-card`, `pack-duplicate`, `pack-collect`, `pack-sweep-reveal`, `pack-summary`, `pack-open-all-table`, `pack-crate`, `pack-pile`, `pack-faction`, `pack-mystery`, `pack-free-courier`, `pack-purchase`, `pack-discover`, `pack-reward-unlock`, `pack-pity`, `pack-odds`
- **meta-progression** (11): `meta-forge-temper`, `meta-forge-limit-break`, `meta-forge-promote`, `meta-forge-prestige`, `meta-forge-refine`, `meta-forge-enchant`, `meta-forge-melt`, `meta-forge-fuse`, `meta-forge-tier-up`, `meta-forge-entrance`, `meta-castle-temper`

### Batch E: Conquest map & world ambience (168 entries)

- **conquest-map** (146): `map-amb-m1`, `map-amb-mtut`, `map-amb-mo`, `map-amb-mf`, `map-amb-mq`, `map-amb-mb`, `map-amb-mp`, `map-amb-mg`, `map-amb-mc`, `map-amb-m2`, `map-amb-mw`, `map-amb-ms`, `map-amb-m8`, `map-amb-mu`, `map-amb-mz`, `map-amb-m4`, `map-amb-mn`, `map-amb-mk`, `map-amb-m7`, `map-amb-mj`, `map-amb-m10`, `map-amb-mv`, `map-amb-mh`, `map-amb-mr`, `map-amb-m5`, `map-amb-my`, `map-amb-ml`, `map-amb-mt`, `map-amb-m6`, `map-amb-mi`, `map-amb-md`, `map-amb-m3`, `map-amb-m9`, `map-amb-m11`, `map-amb-me`, `map-amb-mx`, `map-amb-m21`, `map-movers-forest`, `map-movers-water`, `map-movers-ash`, `map-movers-cave`, `map-movers-savanna`, `map-movers-tundra`, `map-movers-reef`, `map-movers-swamp`, `map-movers-forge`, `map-movers-alpine`, `map-movers-meadow`, `map-movers-beach`, `map-decor-static`, `map-snails`, `map-crystal-sparkle`, `map-predator-eyes`, `map-cave-dark`, `map-cave-light-spread`, `map-dark-cleared`, `map-veil`, `map-nodes-drop`, `map-node-available`, `map-node-locked`, `map-node-cleared`, `map-node-rank`, `map-trail-unlock`, `map-pawn-hop`, `map-pawn-walk`, `map-pawn-dropin`, `map-travel`, `map-world-zoom`, `map-world-here`, `map-world-fog`, `map-world-compass`, `map-submap-enter`, `map-submap-leave`, `map-submap-emblem`, `map-cleared`, `map-next-unlocked`, `map-ambush-node`, `map-chance-node`, `map-late-side-map`, `map-boss-node`, `map-raid-node`, `map-dungeon-node`, `map-elite-node`, `map-tutorial-reveal`, `map-leaves-reveal`, `map-dragon-scale-node`, `map-dragon-scale-found`, `map-spot-deck`, `map-spot-nest`, `map-spot-quests`, `map-spot-shop`, `map-spot-forge`, `map-spot-codex`, `map-spot-arena`, `map-spot-questboard`, `map-spot-raid`, `map-spot-wanderer`, `map-spot-tavern`, `map-spot-gauntlet`, `map-spot-autobattle`, `map-spot-skillcodex`, `map-spot-mapcodex`, `map-spot-stomp`, `map-spot-testlab`, `map-spot-market`, `map-spot-fieldkit`, `map-spot-backpack`, `map-spot-new-bang`, `map-curio-signpost`, `map-curio-scarecrow`, `map-curio-beehive`, `map-curio-bottle`, `map-curio-crab`, `map-curio-lantern`, `map-curio-ashcairn`, `map-curio-peddler`, `map-curio-echo`, `map-curio-glowpool`, `map-curio-baobab`, `map-curio-drum`, `map-curio-icefish`, `map-curio-shell`, `map-curio-wreck`, `map-curio-wisp`, `map-curio-anvil`, `map-curio-eyrie`, `map-curio-banner`, `map-well`, `map-campfire`, `map-courier`, `map-wanderer`, `map-seasonal`, `map-day-night-tint`, `map-weather-fronts`, `map-water-shimmer`, `map-fog-misty`, `map-chaos-returns`, `map-headline-ghost`, `map-shader-new-fungal`, `map-shader-new-dragon-lair`, `map-shader-new-ice-cave`, `map-shader-new-crystal-cave`, `map-shader-new-misty-meadow`, `map-shader-new-abyssal`, `map-shader-new-dragonic-spire`, `map-shader-new-floodplains`
- **world-ambience** (22): `amb-home-splash`, `amb-home`, `amb-leaf-sweep`, `amb-armoury`, `amb-shop`, `amb-nest`, `amb-forge`, `amb-codex`, `amb-quests`, `amb-arena`, `amb-tavern`, `amb-battle-felt`, `amb-battle-map-terrain`, `amb-sound-places`, `amb-music`, `amb-motes`, `amb-raid-splash`, `amb-crt-grain`, `amb-ink-transition`, `amb-ant-lampposts`, `amb-otter-roads`, `amb-hummingbird-cliffs`

### Batch F: UI / meta / rewards / tutorial / raid-dungeon-PvP (+ resource gains into the HUD pills) (164 entries)

- **combat-skill** (7): `sk-echo-gain`, `sk-gain-resource`, `sk-elemental-energy`, `sk-refine-action`, `sk-midas`, `sk-worthy`, `sk-resource-passive`
- **rewards-results** (24): `res-victory`, `res-defeat`, `res-draw`, `res-victory-toss`, `res-loss-scatter`, `res-first-clear`, `res-rank-stamp`, `res-rank-lesson`, `res-reward-reveal`, `res-reward-cards`, `res-coin-shower`, `res-count-up`, `res-pack-won`, `res-held-packs`, `res-achv-on-results`, `res-star-fall`, `res-dragon-scale`, `res-boss-leader`, `res-faction-crown`, `res-materia-drop`, `res-card-drop`, `res-xp-line`, `res-tutorial-result`, `res-castle-falls`
- **meta-progression** (43): `meta-castle-drop`, `meta-hero-level`, `meta-hero-skill-pick`, `meta-hero-stat-spend`, `meta-nest-egg-place`, `meta-nest-egg-idle`, `meta-nest-hatch`, `meta-nest-kibble-train`, `meta-nest-trained`, `meta-nest-egg-drop`, `meta-inventory-new`, `meta-shop-buy`, `meta-shop-wanderer-deal`, `meta-energy-spend`, `meta-energy-short`, `meta-energy-tick`, `meta-energy-capsule`, `meta-energy-free`, `meta-energy-upgrade`, `meta-stamina`, `meta-achv-ready`, `meta-achv-claim`, `meta-achv-unlocked-live`, `meta-quest-ready`, `meta-quest-claim`, `meta-quest-progress`, `meta-errand-offer`, `meta-errand-claim`, `meta-daily-notice-swap`, `meta-account-level`, `meta-xp-gain`, `meta-wildpath-learn`, `meta-card-unlock`, `meta-card-level-codex`, `meta-daily-login`, `meta-monthly-bonus`, `meta-bramble-pass`, `meta-steam-achv`, `meta-attunement`, `meta-alchemy`, `meta-dragon-egg-craft`, `meta-materia-socket`, `meta-bring-effect`
- **ui-feedback** (45): `ui-deny`, `ui-toast`, `ui-hud-pill-bing`, `ui-pill-gain`, `ui-tab-emoji`, `ui-home-buttons`, `ui-chestnut-knock`, `ui-codex-page`, `ui-pixel-reveal`, `ui-versus`, `ui-fight-sign`, `ui-next-turn`, `ui-turn-glow`, `ui-wait-tick`, `ui-ready`, `ui-drag-trail`, `ui-drop-highlight`, `ui-attack-preview`, `ui-pitch-preview`, `ui-pitch`, `ui-overdraw`, `ui-draw`, `ui-deck-shuffle`, `ui-deck-riffle`, `ui-lumber-nudge`, `ui-card-hover`, `ui-bf-pill-tip`, `ui-tip-ticker`, `ui-modal-dialog`, `ui-deck-add`, `ui-deck-remove`, `ui-deck-full`, `ui-deck-swap`, `ui-deck-hero-banner`, `ui-codex-new`, `ui-skill-reveal`, `ui-rank-hex`, `ui-avatar-unlock`, `ui-cloud-sync`, `ui-banners`, `ui-fx-level`, `ui-emoji-set`, `ui-emote`, `ui-speech`, `ui-log-row`
- **tutorial-dialogue** (16): `tut-coach-tip`, `tut-coach-pointer`, `tut-coach-phantom`, `tut-highlight`, `tut-lumber-lesson`, `tut-faction-pick`, `tut-faction-showcase`, `tut-leader-join`, `tut-dialogue-dock`, `tut-dialogue-question`, `tut-dialogue-portrait`, `tut-dialogue-act`, `tut-faction-warning`, `tut-curio-bubble`, `tut-rival-babble`, `tut-afk`
- **raid-dungeon-pvp** (29): `raid-telegraph`, `raid-trench-danger`, `raid-trench-hit`, `raid-boss-roar`, `raid-tentacle-smack`, `raid-tail-sweep`, `raid-stage-change`, `raid-part-down`, `raid-bars`, `raid-feed`, `raid-claim`, `raid-core-stumps`, `dng-wave`, `dng-floor`, `pvp-ticket`, `pvp-portent`, `pvp-rating`, `pvp-queue`, `pvp-rejoin`, `pvp-gauntlet-streak`, `pvp-autobattle`, `coop-shared-cell`, `coop-lock`, `coop-resolve`, `coop-cell-clash`, `coop-floor-mechanic`, `dng-murgle`, `pvp-map60`, `world-event`

## Appendix A: engine event types and where the front end handles them

Every `type` the engine pushes (`bramblewood-engine.js`), the first line that pushes it, and the `arena_app.js` lines that branch on it. "log" = only the battle-log text (`logText`), no visual.

| event type | first push | handled at (arena_app.js) | inventory ids |
|---|---|---|---|
| `converge` | 277 | 29183, 31505 | `sk-converge` |
| `advance` | 326 | 31453 | `sum-advance` |
| `play` | 370 | 6084, 20081, 20841, 22285, 25670, 25674 (+6) | `sk-prayer`, `dark-darksight-play`, `sum-hand-play`, `sum-enemy-play`, `sum-reserve`, `sum-big-arrival` |
| `overdraw` | 450 | 31945 | `ui-overdraw` |
| `draw` | 455 | 31944 | `ui-overdraw`, `ui-draw` |
| `chainBreak` | 538 | 31981 | `st-chain-break` |
| `statusFx` | 699 | 13300, 29173, 30975, 30987, 31046, 31111 (+4) | `atk-counter-parry`, `atk-recoil`, `atk-spite`, `atk-castle-bolt-shot`, `sk-lightning-passive`, `sk-chilli` |
| `wind` | 808 | 13303, 31914 | `wt-wind-gust`, `wt-wind-calm` |
| `lumber` | 871 | 31102, 31874, 32273 | `sk-gain-resource`, `sk-midas`, `sk-worthy`, `fld-lumber-every`, `castle-lumber` |
| `phase` | 890 | 13307, 31912, 31917 | `dark-night-veil-in`, `dark-night-veil-out`, `wt-day-breaks`, `wt-twilight`, `wt-realtime-phase` |
| `castleRegen` | 893 | **none** | `castle-regen` |
| `fuse` | 900 | 31772 | `sk-dynamite-fuse` |
| `moon` | 914 | 31916 | `wt-moon-phase` |
| `dawn` | 917 | log only (29662) | `wt-dawn-draw` |
| `remember` | 935 | 31907 | `sk-remember`, `sum-remember` |
| `tide` | 943 | 13305, 31106, 31452 | `wt-tide-flow`, `wt-tide-ebb`, `wt-tide-high`, `wt-moonpull` |
| `fieldTick` | 962 | 13299, 13301, 13302, 13306, 27868, 31882 (+4) | `sk-immolation-src`, `sk-irradiated-src`, `st-freeze-field`, `st-irradiation-apply`, `st-petrified-apply`, `fld-frigid-tick` |
| `fieldEnd` | 980 | log only (29683) | `fld-end`, `fld-base-returns` |
| `wash` | 1022 | 30980, 31910 | `sk-tsunami`, `fld-tide-spout-wash` |
| `curse` | 1110 | log only (29672) | `sk-desecrate` |
| `wave` | 1164 | 31704 | `sk-wave` |
| `devour` | 1224 | 25475 | `sk-devour` |
| `equip` | 1247 | log only (29666) | `sk-equip` |
| `sacrifice` | 1259 | log only (29668) | `sk-sacrifice` |
| `cage` | 1288 | log only (29664) | `st-caged-leader` |
| `beware` | 1296 | log only (29669) | `dark-beware` |
| `shieldSoak` | 1375 | 31050 | `sk-shield-soak`, `sk-shield-break` |
| `psychic` | 1469 | 31034 | `sk-psychic` |
| `irradiation` | 1569 | 31884 | `st-irradiation-tick` |
| `spawn` | 1891 | 27334, 27356, 30921, 31100, 31835 | `sk-shield-call`, `sum-trigger-spawn`, `sum-on-death-spawn`, `sum-meiosis`, `sum-on-attacked`, `sum-twin` |
| `evaded` | 1989 | 27299, 29180, 31216, 31220, 31232, 31333 | `atk-evade-evasive`, `atk-evade-swift`, `atk-evade-flying`, `atk-evade-fog`, `atk-evade-illusory`, `atk-evade-shadow` |
| `bleedTick` | 2205 | 4347, 27288, 31802, 32271 | `st-bleed-tick` |
| `confusedWhiff` | 2231 | 31766 | `atk-confused-whiff` |
| `hit` | 2483 | 4313, 27252, 27278, 27280, 27281, 27286 (+19) | `atk-melee-lunge`, `atk-impact`, `atk-heavy-hitstop`, `atk-big-blow-shake`, `atk-crit`, `atk-armor-block-full` |
| `grace` | 2544 | 31109, 31871 | `sk-prayer` |
| `devilry` | 2545 | 31872 | `dark-inherent` |
| `exile` | 2559 | 31943 | `sk-exile-board`, `sk-exile-zone` |
| `spell` | 2599 | 31929 | `sk-spell-card` |
| `fieldSet` | 2639 | 25802, 31936 | `fld-set` |
| `restless` | 2774 | 31724 | `sk-restless` |
| `hitHQ` | 2902 | 4313, 21072, 27252, 27278, 27305, 28347 (+18) | `atk-castle-lunge`, `atk-prong-castle`, `atk-boomerang-castle`, `atk-boomerang-friendly`, `atk-siege`, `atk-bulwark` |
| `tornado` | 2917 | 30964 | `sk-tornado` |
| `avalanche` | 2942 | 30971 | `sk-avalanche` |
| `tsunami` | 2952 | 30976 | `sk-tsunami` |
| `dragonLightning` | 2962 | 30981 | `sk-dragon-lightning` |
| `witherTick` | 2982 | 30988 | `st-wither-tick` |
| `hatch` | 3006 | 27245, 30922, 30990 | `sum-hatch-battle` |
| `fireball` | 3043 | 31007 | `sk-fireball` |
| `meteor` | 3056 | 31012 | `sk-meteor` |
| `meteorBurn` | 3072 | 31019 | `sk-meteor-burn` |
| `banana` | 3090 | 31024 | `sk-banana-throw`, `sk-banana-eat` |
| `durian` | 3097 | 31029 | `sk-durian` |
| `smokeBomb` | 3115 | 31039 | `sk-smoke-bomb`, `st-smoke-apply` |
| `electricity` | 3133 | 31054 | `sk-electricity` |
| `rally` | 3206 | 31412 | `sk-rally` |
| `pounce` | 3228 | 29186, 31408 | `atk-pounce` |
| `deflect` | 3278 | 31771 | `sk-helmet` |
| `dynamite` | 3291 | 31767 | `sk-dynamite` |
| `earthquake` | 3323 | 31428 | `sk-earthquake`, `sk-landslide` |
| `arrow` | 3422 | 29177, 31149, 31427 | `atk-arrow`, `atk-fire-arrow`, `atk-ice-arrow`, `atk-snipe` |
| `bolt` | 3434 | 29177, 31140 | `atk-bolt-fire`, `atk-bolt-acid`, `atk-bolt-poison`, `atk-bolt-ice`, `atk-bolt-shock` |
| `gash` | 3484 | 4320, 31098, 31754 | `sk-gash` |
| `render` | 3497 | 4323, 29185, 31095, 31395 | `sk-render` |
| `triggerFired` | 3542 | 29187, 29201, 31213 | `sk-trigger-fired` |
| `stone` | 3555 | 31873 | `sk-gain-resource`, `fld-deep-mines` |
| `elementalEnergy` | 3575 | 31937 | `sk-elemental-energy` |
| `namedBuff` | 3630 | 31110, 31655 | `sk-buff-action` |
| `heal` | 3707 | 31093, 31617 | `sk-heal-generic`, `sk-regen`, `sk-bloom` |
| `mindControl` | 3842 | 31099 | `sk-mind-control`, `sum-mind-control-arrive` |
| `stunPlayer` | 3848 | log only (5419, 7506) | `sk-stun-player` |
| `swapPositions` | 3886 | 31731 | `sk-swap` |
| `discard` | 4040 | 31993 | `ui-pitch` |
| `poisonTick` | 4143 | 4339, 27287, 31783, 32271 | `st-poison-tick` |
| `curseTick` | 4149 | 31096, 31909 | `sk-curse-tick` |
| `decayTick` | 4174 | 4344, 31813, 32271 | `st-decay-tick` |
| `explode` | 4288 | 31650 | `sk-explode` |
| `waitTick` | 4359 | 27245, 29896, 31948 | `ui-wait-tick` |
| `ready` | 4364 | 24417, 27245, 31957 | `ui-ready` |
| `charge` | 4446 | 31722 | `atk-charge-fire` |
| `revive` | 4487 | 31094, 31820 | `sk-revive`, `death-revive-save` |
| `death` | 4497 | 14530, 27243, 27291, 27309, 27317, 27792 (+3) | `death-fall`, `death-flyer-fall`, `death-burn`, `death-token`, `death-lightning`, `death-magic` |
| `bounty` | 4519 | 31942 | `death-bounty` |
| `cageBroken` | 4587 | 31908 | `st-cage-broken` |
| `collapseIn` | 4656 | 27328, 31834 | `death-collapse-in` |
| `fastForward` | 4671 | 29182, 31492 | `sk-fast-forward` |
| `boomerangReturn` | 4728 | 31449 | `atk-boomerang-return` |
| `boomerangWhiff` | 4739 | 31454 | `atk-boomerang-whiff` |
| `boomerangCaught` | 4747 | 31455 | `atk-boomerang-caught` |
| `skipTurn` | 4834 | 11555 | `st-freeze-skip`, `st-sleep-skip`, `st-paralyze-coinflip`, `st-stun-skip`, `st-chained-skip`, `st-petrified-skip` |
| `crabClaw` | 5091 | 31720 | `atk-crab-claw` |
| `tipsySwing` | 5119 | 31765 | `atk-tipsy-swing` |
| `friction` | 5136 | 31878 | `atk-friction` |
| `sweepWhiff` | 5158 | 29181, 31475 | `atk-sweep-whiff` |
| `kingSlayer` | 5190 | 31090, 31456 | `atk-king-slayer` |
| `sap` | 5204 | 4317, 31092, 31640 | `sk-sap` |
| `blindMiss` | 5232 | 13304, 31773 | `atk-blind-miss`, `dark-dark-miss`, `dark-pitch-miss`, `dark-absolute-miss` |
| `pierceHQ` | 5265 | 4326, 31089, 31678 | `atk-pierce-hq` |
| `thorns` | 5281 | 4332, 28347, 31659, 32268 | `atk-thorns` |
| `reflect` | 5300 | 4336, 31091, 31668 | `atk-reflect` |
| `overwhelmHQ` | 5393 | 4329, 31688 | `atk-overwhelm-hq` |
| `swipeLumber` | 5527 | 31498 | `atk-swipe-lumber` |
| `frenzy` | 5552 | 31097, 31467 | `atk-frenzy` |
| `roundStart` | 5652 | 31209 | `wt-first-field-flash` |

## Appendix B: `statusFx` kinds

| kind | engine line | renderer branches (arena_app.js) | inventory ids |
|---|---|---|---|
| `castleBolt` | 873 | **none** (log text only) | `atk-castle-bolt-shot`, `castle-ballista` |
| `herbHeal` | 877 | 29749 | `castle-herb-heal` |
| `herbBane` | 878 | **none** (log text only) | `castle-herb-bane` |
| `castleSpawn` | 884 | **none** (log text only) | `castle-spawn`, `sum-castle-spawn` |
| `frostbite` | 964 | 13300, 30881, 31556 | `sk-frostbite` |
| `bludgeon` | 1145 | 31548 | `sk-bludgeon` |
| `sacrificed` | 1272 | 31539 | `sk-sacrifice`, `death-sacrificed` |
| `firstBlood` | 1355 | 31557 | `sk-first-blood`, `fld-first-blood-rule` |
| `shellUp` | 1369 | 31544 | `sk-shell-up` |
| `cower` | 1417 | 31119, 31573 | `st-cower-skip` |
| `ichor` | 1482 | 31117, 31572 | `sk-ichor` |
| `shieldCall` | 1890 | **none** (log text only) | `sk-shield-call` |
| `stanch` | 2176 | 31577 | `sk-stanch` |
| `spite` | 2471 | **none** (log text only) | `atk-spite` |
| `counter` | 2484 | 31126 | `atk-counter-parry` |
| `tailwind` | 2596 | 31127, 31547 | `wt-tailwind` |
| `logjam` | 2673 | **none** (log text only) | `castle-logjam` |
| `surge` | 2856 | 31541 | `fld-boss-surge` |
| `avalancheWait` | 2943 | 30975 | `sk-avalanche` |
| `wither` | 2973 | 30987 | `sk-wither`, `st-wither-apply` |
| `unitShield` | 3123 | 31046 | `sk-shield-up` |
| `lightning` | 3151 | **none** (log text only) | `sk-lightning-passive` |
| `coffee` | 3260 | 31125, 31551 | `sk-coffee`, `st-coffee-crash` |
| `chilli` | 3300 | 31150, 31552 | `sk-chilli`, `st-chilli-burn` |
| `rocket` | 3306 | 31550 | `sk-rocket` |
| `debuffAttack` | 3657 | 31120, 31561 | `sk-debuff-action` |
| `exile` | 3825 | **none** (log text only) | `sk-exile-board` |
| `cleanse` | 3857 | 29820, 31576, 31613 | `sk-cleanse` |
| `esprit` | 3941 | 29820, 31129, 31186, 31188, 31612 | `sk-esprit` |
| `chilliBurn` | 4135 | 31150, 31152, 31153, 31553 | `st-chilli-burn` |
| `satiety` | 4225 | **none** (log text only) | `sk-satiety` |
| `shellDown` | 4262 | 31545 | `sk-shell-down` |
| `shed` | 4320 | 31549 | `sk-shed` |
| `coffeeCrash` | 4326 | 31115, 31554 | `st-coffee-crash` |
| `thaw` | 4347 | 31537 | `st-freeze-tick` |
| `grit` | 4506 | 29820, 31129, 31578 | `sk-grit` |
| `berserk` | 4564 | 29820, 31131, 31598 | `sk-berserk`, `sk-hive-mind` |
| `inspired` | 5135 | 31130, 31555 | `sk-inspired` |
| `scar` | 5199 | 31123, 31575, 31613 | `st-scar-apply` |
| `nullify` | 5273 | 31538 | `sk-nullify` |
| `daunt` | 5321 | 31119, 31569 | `st-daunt-apply` |
| `armorShred` | 5328 | 31118, 31574 | `sk-armor-shred` |
| `corrode` | 5338 | 29820, 31117, 31594, 31613 | `st-corrode-apply` |
| `momentum` | 5402 | 29820, 31599 | `sk-momentum` |
| `octolash` | 5477 | 31558 | `atk-octolash` |
| `castleThorns` | 5493 | **none** (log text only) | `castle-thorns` |
| `recoil` | 5520 | 31570 | `atk-recoil` |
| `poison` | 190 | 29820, 31535, 31613 | `st-poison-apply` |
| `bleed` | 190 | 29820, 31611, 31613 | `st-bleed-apply` |
| `expose` | 190 | 31121, 31559 | `st-expose-apply` |
| `stun` | 190 | 31560, 31613 | `st-stun-apply` |
| `addWait` | 190 | 31124, 31565 |  |
| `freeze` | 2235 | 31114, 31581, 31613 | `atk-ice-arrow`, `st-freeze-apply` |
| `sleep` | 2236 | 31115, 31582, 31613 | `st-sleep-apply` |
| `paralyze` | 2237 | 31116, 31583, 31613 | `st-paralyze-apply` |
| `stunOnHit` | 2238 | 31584, 31613 | `st-stun-apply` |
| `blind` | 2187 | 31122, 31590, 31613 | `st-blind-apply` |
| `tipsy` | 2240 | 31591 | `st-tipsy-apply` |
| `confuse` | 2241 | 31592 | `st-confuse-apply` |
| `shock` | 2242 | 31593, 31613 | `st-shock-apply` |
| `stagger` | 2243 | 31597, 31613 | `st-stagger-apply` |
| `swimmer` | 578 | 31128, 31546 | `wt-swimmer-flow` |
| `phaseGrow` | 699 | 31922, 31923 | `sk-conditional-stats`, `st-phase-grow` |
| `phaseFade` | 699 | 31922 | `sk-conditional-stats`, `st-phase-fade` |

## Appendix C: the skill registry, every entry

All `PASSIVE_DEFS` and the extra `SKILL_DEFS` entries (`arena_app.js`), then the trigger hooks (`TRIGGER_DEFS`) and actions (`ACTION_DEFS`). Flags: hidden / retired / one-off (`ONE_OFF_SKILLS`). "Effect ids" are the inventory entries that cover the skill's moment; "static" means the skill has no moment of its own (a rule or stat).

| key | label | category | kind | flags | line | effect ids |
|---|---|---|---|---|--:|---|
| `poison` | Poison | passive | number |  | 444 | `atk-dmgtype-poison`, `atk-bolt-poison`, `st-poison-apply`, `st-poison-active` |
| `decay` | Decay | passive | number |  | 451 | `atk-dmgtype-decay`, `st-decay-apply`, `st-decay-active`, `st-decay-tick` |
| `armor` | Armor | passive | number |  | 452 | `atk-armor-block-full`, `atk-armor-block-partial`, `atk-pierce-rend`, `sk-supreme-strike` |
| `counterattack` | Counterattack | passive | boolean |  | 453 | `atk-counter-parry` |
| `spiteful` | Spiteful | passive | number |  | 454 | `atk-spite` |
| `thorns` | Thorns | passive | number |  | 455 | `atk-thorns`, `sk-durian` |
| `fork` | Fork | passive | boolean |  | 463 | `atk-prong-fork`, `atk-prong-trident`, `atk-prong-pitchfork`, `atk-prong-castle` |
| `swipe` | Swipe | passive | number |  | 465 | `atk-swipe-lumber` |
| `twinStrike` | Twin Strike | passive | boolean |  | 467 | `atk-frenzy` |
| `converge` | Converge | evergreen | select |  | 468 | `sk-converge` |
| `defiance` | Defiance | passive | types |  | 471 | `sk-conditional-stats` |
| `pack` | Pack | passive | number |  | 477 | `sk-pack`, `sk-conditional-stats` |
| `packLeader` | Pack Leader | passive | boolean |  | 478 | static |
| `sweep` | Cleave | passive | number |  | 483 | `atk-cleave`, `atk-sweep-whiff`, `raid-tail-sweep` |
| `rage` | Rage | passive | boolean |  | 484 | `st-rage-enter` |
| `immolation` | Immolation | passive | number |  | 485 | `sk-immolation-src` |
| `swarm` | Swarm | passive | types |  | 488 | `atk-swarm` |
| `hiveMind` | Hive Mind | passive | boolean | hidden, retired | 494 | `sk-hive-mind` |
| `crepuscular` | Crepuscular | passive | twoNumber | oneOff | 499 | `st-phase-grow`, `wt-twilight` |
| `sunshy` | Sun-shy | passive | boolean |  | 502 | `dark-sunshy-blind` |
| `nightblind` | Night-blind | passive | boolean |  | 503 | `dark-nightblind` |
| `nocturnal` | Nocturnal | passive | twoNumber |  | 504 | `st-phase-grow` |
| `diurnal` | Diurnal | passive | twoNumber |  | 507 | `st-phase-grow` |
| `reach` | Reach | passive | boolean |  | 512 | static |
| `festering` | Festering | passive | boolean |  | 513 | static |
| `leader` | Natural Leader | passive | boolean |  | 514 | `sum-leader`, `death-leader`, `tr-leader-frame` |
| `dictator` | Dictator | passive | boolean |  | 516 | static |
| `changeling` | Changeling | passive | boolean |  | 517 | `sk-changeling-unmask` |
| `drunk` | Drunk | passive | boolean |  | 518 | static |
| `purblind` | Purblind | passive | boolean |  | 519 | `atk-blind-miss` |
| `scatterbrained` | Scatterbrained | passive | boolean | oneOff | 520 | static |
| `primed` | Primed | passive | boolean |  | 521 | static |
| `keenEye` | Keen Eye | passive | boolean |  | 522 | `sk-keen-eye-unmask` |
| `demolisher` | Demolisher | passive | number |  | 523 | `sk-demolisher` |
| `lantern` | Lantern | passive | boolean |  | 524 | `dark-lantern-lit`, `dark-lantern-out`, `dark-lantern-save` |
| `backstab` | Backstab | passive | number |  | 525 | `atk-backstab` |
| `shieldCall` | Shield Call | passive | boolean |  | 526 | `sk-shield-call` |
| `boomerang` | Boomerang | evergreen | boolean |  | 528 | `atk-boomerang-throw`, `atk-boomerang-castle`, `atk-boomerang-return`, `atk-boomerang-caught` |
| `trident` | Trident | passive | boolean |  | 531 | `atk-prong-trident` |
| `pitchfork` | Pitchfork | passive | boolean |  | 532 | `atk-prong-pitchfork` |
| `octolash` | Octolash | passive | boolean |  | 533 | `atk-octolash` |
| `speed` | Speed | passive | number |  | 537 | `sk-fast-forward` |
| `haste` | Haste | passive | boolean |  | 538 | static |
| `rabid` | Rabid | passive | boolean | oneOff | 540 | static |
| `cower` | Cower | passive | select |  | 542 | `st-cower-skip` |
| `ghost` | Ghost | passive | boolean |  | 549 | `death-ghost` |
| `magic` | Magic | passive | boolean |  | 550 | `atk-dmgtype-magic`, `death-magic` |
| `ichor` | Ichor | passive | number |  | 553 | `sk-ichor` |
| `irradiated` | Irradiated | passive | number |  | 557 | `sk-irradiated-src`, `st-irradiation-apply`, `death-irradiation` |
| `shade` | Shade | passive | boolean |  | 559 | `dark-shade-night` |
| `shadow` | Shadow | passive | boolean |  | 560 | `atk-evade-shadow`, `dark-shadow-night` |
| `supreme` | Supreme | passive | boolean |  | 563 | `sk-supreme-strike`, `st-ward-crush`, `death-supreme`, `sum-supreme` |
| `twin` | Twin | evergreen | boolean |  | 565 | `sum-twin` |
| `sprout` | Sprout | evergreen | number |  | 566 | `sum-sprout-token` |
| `growth` | Growth | passive | boolean |  | 567 | `sum-sprout-token` |
| `moonpull` | Moonpull | evergreen | boolean |  | 569 | `wt-moonpull` |
| `bloomWhen` | Bloom (conditions) | passive | text |  | 571 | static |
| `wave` | Wave | passive | select |  | 575 | `sk-wave` |
| `crabClaws` | Crab Claws | passive | boolean |  | 584 | `atk-crab-claw` |
| `meiosis` | Meiosis | passive | number |  | 587 | `sum-meiosis` |
| `nullify` | Nullify | evergreen | boolean |  | 591 | `sk-nullify` |
| `restless` | Restless | passive | boolean |  | 593 | `sk-restless` |
| `charge` | Charge | evergreen | text |  | 595 | `atk-charge-fire` |
| `supremeTide` | Supreme Tide | passive | boolean | oneOff | 598 | `wt-tide-flow` |
| `brood` | Brood | evergreen | number |  | 600 | `sum-brood` |
| `rainmaker` | Rainmaker | evergreen | number |  | 602 | `fld-set` |
| `rainrunner` | Rainrunner | passive | number |  | 603 | `sk-rainrunner` |
| `moonborn` | Moonborn | passive | number |  | 604 | `st-phase-grow`, `wt-moon-phase` |
| `frostbite` | Frostbite | passive | number |  | 605 | `sk-frostbite` |
| `swimmer` | Swimmer | passive | select |  | 609 | `wt-tide-flow`, `wt-swimmer-flow` |
| `swimmerGrant` | Swimmer: on Flow | passive | text |  | 615 | `wt-swimmer-flow` |
| `inspiring` | Inspiring | passive | number |  | 617 | `sk-inspired` |
| `friction` | Friction | passive | number |  | 618 | `atk-friction` |
| `worthy` | Worthy | passive | number |  | 619 | `sk-worthy` |
| `lumberjack` | Lumberjack | passive | boolean |  | 620 | `sk-resource-passive` |
| `heavyMetal` | Heavy Metal | passive | boolean |  | 621 | `sk-resource-passive` |
| `timber` | Timber | passive | boolean |  | 622 | `sk-resource-passive` |
| `rockSolid` | Rock-solid | passive | boolean |  | 623 | `sk-resource-passive` |
| `ironWill` | Iron-will | passive | boolean |  | 624 | `sk-resource-passive` |
| `loyal` | Loyal | passive | twoNumber |  | 625 | `sk-conditional-stats` |
| `usurper` | Usurper | passive | twoNumber |  | 627 | `sk-conditional-stats` |
| `sacrifice` | Sacrifice | passive | number |  | 629 | `sk-sacrifice` |
| `scare` | Scare | passive | number |  | 630 | `atk-scared-lunge` |
| `prayer` | Prayer | passive | number |  | 632 | `sk-prayer`, `sk-exile-zone` |
| `worship` | Worship | passive | boolean |  | 633 | static |
| `healing` | Healing | passive | number |  | 634 | `sk-heal-generic` |
| `dynamite` | Dynamite | passive | number |  | 641 | `sk-dynamite`, `sk-dynamite-fuse`, `death-explode` |
| `helmet` | Helmet | passive | boolean |  | 642 | `sk-helmet` |
| `molting` | Molting | passive | number |  | 643 | `sk-shed` |
| `shedding` | Shedding | passive | number |  | 644 | `sk-shed` |
| `bludgeon` | Bludgeon | passive | boolean |  | 645 | `sk-bludgeon` |
| `snipe` | Snipe | evergreen | number |  | 647 | `atk-snipe` |
| `kinship` | Kinship | passive | typeTwoNumber |  | 648 | `sk-conditional-stats` |
| `rocket` | Rocket | evergreen | number |  | 651 | `sk-rocket` |
| `loneWolf` | Lone Wolf | passive | twoNumber |  | 652 | `sk-conditional-stats` |
| `sociable` | Sociable | passive | twoNumber |  | 655 | `sk-conditional-stats` |
| `coffee` | Coffee | passive | number | oneOff | 658 | `sk-coffee`, `st-coffee-crash` |
| `dry` | Dry | passive | boolean |  | 659 | `sk-dry-spared` |
| `darksight` | Darksight | passive | boolean |  | 660 | `dark-darksight-play`, `dark-darksight-idle`, `dark-unit-blind` |
| `landslide` | Landslide | evergreen | number |  | 661 | `atk-quake-hit`, `sk-landslide`, `death-crushed` |
| `natureForce` | Nature's Force | passive | number |  | 662 | static |
| `lightning` | Lightning | passive | number |  | 663 | `sk-lightning-passive` |
| `midas` | Midas Touch | passive | number |  | 664 | `sk-midas` |
| `retribution` | Divine Retribution | passive | number |  | 665 | `atk-retribution` |
| `satiety` | Satiety | passive | number |  | 666 | `sk-satiety` |
| `desecrate` | Desecrate | passive | number |  | 667 | `sk-desecrate`, `death-curse` |
| `tide` | Tide | passive | boolean |  | 668 | `wt-tide-flow`, `wt-tide-high`, `wt-perma-tide` |
| `remember` | Remember | passive | number |  | 670 | `sk-remember`, `sum-remember` |
| `expose` | Expose | evergreen | number |  | 672 | `st-expose-apply`, `st-expose-active`, `st-expose-expire` |
| `guardian` | Guardian | passive | boolean |  | 673 | `atk-guardian-redirect` |
| `quick` | Quick | passive | boolean |  | 674 | `atk-quick` |
| `fastForward` | Fast Forward | passive | number |  | 675 | `sk-fast-forward` |
| `swift` | Swift | passive | boolean |  | 676 | `atk-swift`, `atk-evade-swift` |
| `reload` | Reload | evergreen | number |  | 677 | `atk-reload` |
| `shell` | Shell | passive | number |  | 678 | `sk-shell-up`, `sk-shell-down`, `st-shell-skip` |
| `stealth` | Stealth | passive | boolean |  | 679 | `atk-stealth-slip` |
| `evasive` | Evasive | passive | boolean |  | 680 | `atk-evade-evasive` |
| `feeble` | Feeble | passive | boolean |  | 685 | static |
| `mighty` | Mighty | passive | boolean |  | 686 | static |
| `fragile` | Fragile | passive | boolean |  | 687 | static |
| `sturdy` | Sturdy | passive | boolean |  | 688 | static |
| `crit` | Crit | passive | boolean |  | 689 | `atk-crit` |
| `fester` | Fester | passive | boolean |  | 690 | `atk-fester` |
| `rupture` | Rupture | passive | boolean |  | 691 | `atk-rupture` |
| `bleed` | Bleed | passive | number |  | 692 | `st-bleed-apply`, `st-bleed-active`, `st-bleed-tick`, `st-bleed-expire` |
| `esprit` | Esprit | passive | twoNumber |  | 703 | `sk-esprit` |
| `regen` | Regeneration | evergreen | number |  | 709 | `sk-regen` |
| `stunOnHit` | Stun | passive | number |  | 710 | `st-stun-apply`, `st-stun-active`, `st-stun-skip` |
| `puncture` | Puncture | passive | number |  | 714 | `atk-pierce-rend` |
| `gash` | Gash | evergreen | number |  | 715 | `sk-gash`, `st-bleed-apply` |
| `overwhelm` | Stampede | passive | boolean |  | 718 | `atk-overwhelm-hq` |
| `berserk` | Berserk | evergreen | number |  | 719 | `sk-berserk`, `sk-hive-mind` |
| `bulwark` | Bulwark | passive | number |  | 720 | `atk-bulwark` |
| `reflect` | Reflect | passive | number |  | 721 | `atk-reflect` |
| `momentum` | Momentum | evergreen | number |  | 722 | `sk-momentum` |
| `bloom` | Bloom | evergreen | number |  | 723 | `sk-bloom` |
| `ambush` | Ambush | passive | boolean |  | 724 | `atk-ambush` |
| `siege` | Siege | passive | number |  | 725 | `atk-siege` |
| `corrode` | Corrode | passive | number |  | 728 | `st-corrode-apply`, `st-corrode-active`, `st-corrode-expire` |
| `daunt` | Daunt | passive | number |  | 730 | `st-daunt-apply`, `st-daunt-active`, `st-daunt-expire` |
| `recoil` | Recoil | passive | number |  | 731 | `atk-recoil` |
| `inherentDarkness` | Inherent Darkness | evergreen | number |  | 750 | `dark-inherent` |
| `coreEvil` | Core Evil | evergreen | boolean |  | 751 | static |
| `frenzy` | Frenzy | passive | boolean |  | 761 | `atk-frenzy` |
| `pierce` | Pierce | passive | number |  | 762 | `atk-pierce-rend`, `atk-pierce-hq` |
| `perforate` | Perforate | passive | number |  | 765 | `sk-armor-shred` |
| `flying` | Flying | passive | boolean |  | 770 | `atk-flying-swoop`, `atk-evade-flying`, `death-flyer-fall` |
| `earthquake` | Earthquake | evergreen | number | oneOff | 778 | `atk-quake-hit`, `sk-earthquake`, `sk-landslide`, `death-crushed` |
| `pounce` | Pounce | evergreen | number |  | 786 | `atk-pounce` |
| `skyfall` | Skyfall | evergreen | number |  | 787 | `sum-skyfall` |
| `arrow` | Arrow | evergreen | number |  | 799 | `atk-ranged-projectile`, `atk-arrow`, `atk-fire-arrow`, `atk-ice-arrow` |
| `fireArrow` | Fire Arrow | evergreen | number |  | 800 | `atk-fire-arrow` |
| `iceArrow` | Ice Arrow | evergreen | number |  | 803 | `atk-ice-arrow`, `st-freeze-apply` |
| `twinShot` | Twin Shot | evergreen | number |  | 804 | `atk-twin-shot` |
| `volley` | Volley | evergreen | number |  | 805 | `atk-volley` |
| `fireBolt` | Fire Bolt | evergreen | number |  | 810 | `atk-bolt-fire` |
| `acidBolt` | Acid Bolt | evergreen | number |  | 811 | `atk-bolt-acid`, `st-corrode-apply` |
| `poisonBolt` | Poison Bolt | evergreen | number |  | 812 | `atk-bolt-poison`, `st-poison-apply` |
| `iceBolt` | Ice Bolt | evergreen | number |  | 813 | `atk-bolt-ice`, `st-freeze-apply` |
| `shockBolt` | Shock Bolt | evergreen | number |  | 814 | `atk-bolt-shock`, `st-shock-apply`, `death-lightning` |
| `kingSlayer` | King Slayer | passive | number |  | 815 | `atk-king-slayer` |
| `tornado` | Tornado | evergreen | number | oneOff | 818 | `sk-tornado` |
| `avalanche` | Avalanche | evergreen | number | oneOff | 819 | `sk-avalanche`, `death-crushed` |
| `tsunami` | Tsunami | evergreen | number |  | 820 | `sk-tsunami`, `death-water` |
| `dragonLightning` | Dragon Lightning | passive | number |  | 821 | `sk-dragon-lightning`, `death-lightning` |
| `wither` | Wither | passive | number |  | 822 | `sk-wither`, `st-wither-apply`, `st-wither-active`, `st-wither-tick` |
| `fencing` | Fencing | passive | boolean |  | 831 | static |
| `fireball` | Fireball | evergreen | number |  | 832 | `sk-fireball` |
| `meteor` | Meteor | evergreen | number | oneOff | 833 | `sk-meteor`, `sk-meteor-burn`, `death-crushed` |
| `banana` | Banana | evergreen | number | oneOff | 834 | `sk-banana-throw`, `sk-banana-eat` |
| `bananarang` | Bananarang | evergreen | number | oneOff | 835 | `atk-boomerang-throw`, `sk-banana-eat` |
| `durian` | Durian | passive | boolean | oneOff | 836 | `sk-durian` |
| `shield` | Shield | passive | number |  | 837 | `sk-shield-up`, `sk-shield-soak`, `sk-shield-break`, `sk-shield-call` |
| `electricity` | Electricity | passive | number |  | 838 | `sk-electricity`, `death-lightning` |
| `keenSense` | Keen Sense | passive | boolean |  | 839 | `st-blind-keen-sense`, `dark-keen-sense` |
| `psychic` | Psychic | passive | number |  | 844 | `sk-psychic`, `death-psychic` |
| `chilli` | Chilli | evergreen | number | oneOff | 847 | `sk-chilli`, `st-chilli-burn` |
| `smokeBomb` | Smoke Bomb | evergreen | boolean | oneOff | 848 | `sk-smoke-bomb`, `st-blind-apply`, `st-smoke-apply`, `st-smoke-active` |

**Trigger hooks** (`TRIGGER_DEFS`): `onSpawn` (On Spawn), `onReady` (On Ready), `onDeath` (On Death), `onAttacked` (On Attacked), `onAttack` (On Attack), `onKill` (On Kill), `onRoundStart` (On Round Start), `onExile` (On Exile), `onAllySpawn` (On Ally Spawn), `onAllyPlayed` (On Ally Played), `onEnemyPlayed` (On Enemy Played), `onAllyReady` (On Ally Ready), `onEnemyReady` (On Enemy Ready), `onMove` (On Move), `perTurn` (On Turn Start), `onEnemySpawn` (On Enemy Spawn), `onColumnSpawn` (On Column Spawn), `onAllyDie` (On Ally Die), `onHeal` (On Heal), `onHealed` (On Healed), `onAllyHealed` (On Ally Healed), `onDiscard` (On Discard), `onSacrifice` (On Sacrifice). A trigger firing always plays `sk-trigger-fired` (the rune ring and electric back glow); what it *does* plays the action's own effect below.

**Actions** (`ACTION_DEFS`):

| action | label | effect ids |
|---|---|---|
| `damage` | Deal damage | `atk-ranged-projectile` |
| `gain` | Gain | `sk-gain-resource` |
| `refine` | Refine | `sk-refine-action` |
| `drawCard` | Draw | `ui-draw` |
| `exileGrave` | Exile from graveyard | `sk-exile-zone` |
| `spawnCard` | Spawn | `sum-trigger-spawn` |
| `buff` | Buff | `sk-buff-action` |
| `debuff` | Debuff | `sk-debuff-action` |
| `poison` | Poison | `st-poison-apply` |
| `bleed` | Bleed | `st-bleed-apply` |
| `expose` | Expose | `st-expose-apply` |
| `stun` | Stun | `st-stun-apply` |
| `reduceWaitOfSpawned` | Reduce Wait | `sk-coffee` |
| `missile` | Missile | `atk-ranged-projectile` |
| `exile` | Exile | `sk-exile-board` |
| `swapPositions` | Swap | `sk-swap` |
| `heal` | Heal | `sk-heal-generic` |
| `mindControl` | Mind Control | `sk-mind-control` |
| `stunPlayer` | Player Stun | `sk-stun-player` |
| `cleanse` | Cleanse | `sk-cleanse` |
| `shield` | Shield | `sk-shield-up` |
| `addWait` | Increase Wait | `sk-debuff-action` |

Note: `reduceWaitOfSpawned` and `addWait` play `SkillFX.clockTick` (fast / slow); see `sk-coffee` and the `addWait` row in Appendix B. Retired keys with no card left: Hive Mind (`hiveMind`, hidden + retired), Crab Claws (`crabClaws`, hidden from the editor), Wash (removed 2026-10-14), the old Tailwind/Headwind passives (now map wind).

## Appendix D: effect libraries and whether the game calls them

**`window.SkillFX`** (88 functions in `bramblewood-skillfx.js`). Called from the game: `burst`, `ring`, `bowShot`, `lightning`, `shieldUp`, `boomerang`, `boomerangThrow`, `boomerangCastle`, `boomerangReturn`, `shieldDrop`, `backstab`, `elementDeath`, `swarm`, `regen`, `poisonCloud`, `bleedDrip`, `thorns`, `earthquake`, `quickStrike`, `evasiveDodge`, `cleave`, `guardian`, `helmetDeflect`, `darksight`, `frostChill`, `scorch`, `lanternGlow`, `levelUp`, `setImages`, `fireball`, `meteor`, `bananaThrow`, `munch`, `smokeBomb`, `mindWave`, `swoop`, `gust`, `splash`, `armorBlock`, `forkProngs`, `pierceThrough`, `stunStars`, `freezeEncase`, `sleepZzz`, `paralyzeSpark`, `acidCorrode`, `lifeDrain`, `bloomPollen`, `fearShiver`, `curseDrain`, `targetMark`, `blindInk`, `mirrorFlash`, `reviveRise`, `summonPortal`, `lootArc`, `prayerLight`, `espritAura`, `rageFlare`, `scarMark`, `clockTick`, `parry`, `crownCrack`, `stealthSlip`, `boltGlob`, `chilliHeat`.

Not called from any fight or screen (Effects Lab only, ready to wire): `volley`, `pierce`, `dart`, `frostBolt`, `heal`, `rally`, `feathers`, `dynamite`, `shockwave`, `castleCrumble`, `unlockSparkle`, `skyDrop`, `smokePuff`. Helpers: `aimPoint`, `eighthCss`, `ghostOf`, `knock`, `moreCss`, `ninthCss`, `over`, `seventhCss`, `sixthCss`.

**`window.ProcFX`** exports: `cracks` (not called), `clearCracks` (not called), `castleDamage`, `crumble`, `oldCardTexture` (not called), `decorateOld`, `observeOld` (not called), `shatter`, `flipShuffle`, `lantern` (not called), `forge`, `ripple`, `rng` (not called), `css` (not called). Internal: `hashSeed`, `noise2`, `genStage`, `mine`, `chipAt`, `crackState`, `drawCracks`, `jolt`, `sampleColours`, `bgImage`, `paint`, `chip`, `dust`, `tick`, `drive`, `genOld`, `applyOld`, `pumpOld`, `ghost`, `voronoi`.

**`window.UnitFX`**: `guessHit`, `skinsFor`, `grantSkin`, `equipSkin`, `equippedSkin`, `resolve`, `overlay`, `path`, `claw`, `bite`, `sting`, `peck`, `burn`, `hitMark`, `fireBreath`, `attackFx`. Hit styles claw/bite/sting/peck/burn and the fireBreath special play in fights (`atk-unitfx-*`).

**`BramblewoodShaders`** (`bramblewood-shaders.js`): a scene layer (splash/home) and a map layer with kinds 0 forest, 1 water, 2 fire, 3 caves, 4 savanna, 5 tundra, 6 coral, 7 swamp, 8 foundry, 9 sky, 10 storm, 11 rain, 12 beach; the battlefield felt (lamp, impact lights, shockwave, card shadows, per-biome material). `MAP_KIND` covers 29 map ids; see `map-amb-*`.

**`arena_app.js` effect functions**: `renderVfxForEvent` (central dispatcher) → `noteFieldEvent`, `bigBlowShake`, `fifthPassVfx`, `sixthPassVfx`, `labSkillFx`, `ninthPassVfx`, `eighthPassVfx`; plus `animateAttacker`, `flashDmg`, `flashDodge`, `impactSquash`, `hitStop`, `battleLightAt`, `hqHitBigVfx`, `deathVfx` (`deathStyleFor`, `burnAwayVfx`, `fallDeathVfx`, `flyerFallVfx`, `bleedOutVfx`, `pixelShatterVfx`), `triggerFiredVfx`, `statChangeVfx`, `floatText`, `floatResourceGain`, `itemDropVfx`, `resourceGainVfx`, `poisonBubbleBurstVfx`, `cleanseVfx`, `glitchVfx`, `featherBurst`, `washPushVfx`, `washSplashVfx`, `cometRainVfx`, `cometStrikeVfx`, `eruptionGeyserVfx`, `coldWaveVfx`, `tideWaveVfx`, `icePulseVfx`, `boardSweepVfx`, `eggCrackVfx`, `witherSmokeVfx`, `leaderThroneVfx`, `bossEntrance`, `dungeonWaveVfx`, `deckShuffleVfx`, `deckRiffleFx`, `drawFlipVfx`, `playLandingImpact`, `playHandSummonGlow`, `playBeeSpawnLanding`, `playReadyFlourish`, `playChainBreakFlourish`, `animateOverdraw`, `syncDarkVeil`, `syncNightVeil`, `syncSkyFx`, `castleCrumble`, `updateCastleCracks`, `victoryParade`, `playRewardReveal`, `rewardCardsReveal`, `rewardsCheer`, `rewardRush`, `questRewardFlight`, `materiaBurstVfx`, `heroHallLevelFlourish`, `forgeSmithAnimation`, `forgeTemperAnimation`, `smithBurst`, `forgeFlareUp`, `hatchRevealVfx`, `metaFx`, `decorateHolo`, `openPackAnimation`, `codexPageTurn`, `pixelReveal`, `factionToBattleFx`, `mapPawnDropIn`, `placeMapPawn`, `enterSubMap`/`leaveSubMap`/`subMapIris`, `mountCaveDark`, `caveLightSpread`, `showMapVeil`, `mountMapShader`, `startMapMovers`, `startMapAdornments`, `mountBattleWeather`, `lightningStrike`, `waterRippleAt`, `biomePuff`, `impactDust`, `denyShake`, `maybeEmote`, `maybeSpeak`.

## Appendix E: what the hub Effects Lab shows today

- **Combat skills**: More skills; Even more skills; Arrows, Bolts and prongs
- **Procedural damage & GSAP experiments**: Drunken-miner cracks; Cellular-automaton crumble; Cards of old; Voronoi shatter; Flip riffle; Lantern light; Forge timeline; Ripple from click
- **Card ideas**: Summon slam; Hourglass flip on Wait; Idle breathing; Shine sweep; Ready pulse; Low-HP tremble; Castle cracks; Card drag trail; Leader throne; Deck shuffle; Draw flip; Victory toss; Card emotes; Heat haze; Shockwave ripple; Castle crumble; Level-up burst; Card unlock sparkle; Skirmish sky-drop; Critical hit
- **Coming next**: 🔗 Combo counter; 🧭 Card tilt in hand
- **Foils**
- **Card displays**: Sizes; In a battle; Parts
- **Damage numbers**: Enemy card; Your card
- **Cards**: Holo foil — three looks; Legibility pills and stat chips; Hero card and level-up ring
- **Combat**: Damage numbers; Impact squash and recoil; Deaths: bleed-out and burn-away; Frost, shock, feathers, shatter; Victory dance; Attack preview; Pitch preview
- **Battlefield shaders**
- **Screens and atmosphere**: Weather and atmosphere; Low-castle danger pulse; Pack light leak; Floating motes; Pixel reveal and page turn; Leaf sweep transition
- **Sound effects**: Rival voices
- **Music**: Songbook: place themes; Battle music: one band per people; Home
- **Ambience**
- **Full list**

Plus the Admin → 🔬 Effects library (`fxl*` functions in `arena_app.js`, `FXL_SKILL_SETUPS`), which runs the real replay for each skill.

## Appendix F: every `@keyframes` in `arena_template.html` and what uses it

| keyframes | line | used by (selector) |
|---|--:|---|
| `tabEmojiSpin` | 319 | .tab-btn:hover .tab-emoji |
| `overdrawGain` | 428 | .overdraw-gain |
| `energyToastIn` | 457 | .energy-short-toast |
| `goldStreak` | 647 | .card-tile.rarity-tier-top::before |
| `rarityBandDrift` | 720 | .card-tile .rarity-band · .card-tile-foil .rarity-band |
| `elitePolish` | 789 | .card-tile.elite-polish::after |
| `waitTickFlash` | 813 | .waitbadge.tick-pulse .wait-ring-fg |
| `waitTickPulse` | 814 | .waitbadge.tick-pulse .wait-num · .chargebadge.tick-pulse |
| `waitReadySpin` | 822 | .waitbadge.ready-flourish |
| `waitReadyRingColor` | 827 | .waitbadge.ready-flourish .wait-ring-fg, .waitbadge.ready-flourish .wait-ring-bg |
| `waitReadyNumberPop` | 832 | .waitbadge.ready-flourish .wait-num |
| `wispGlow` | 910 | .ico-shadow |
| `trigSpent` | 919 | .ab-trig.is-spent |
| `badgesAllSpent` | 922 | .badges.is-all-spent |
| `boltWake` | 926 | .ab-trig.is-waking .ab-bolt |
| `foilRingShift` | 995 | .card-tile-foil .rarity-band |
| `foilShimmer` | 1001 | .card-tile-foil::after |
| `ctShimmerSweep` | 1024 | .card-tile-magnetic:hover::after |
| `prestigeRainbowHue` | 1059 | .card-tile.prestige-rainbow · .card-tile.prestige-extended |
| `discoverShine` | 1125 | .discover-title |
| `discoverBurst` | 1126 | .discover-burst |
| `bwDimIn` | 1246 | .bw-centre-dialog |
| `bwDimOut` | 1247 | .bw-centre-dialog.is-out |
| `bwPopIn` | 1248 | .bw-centre-dialog .modal |
| `bwPopOut` | 1249 | .bw-centre-dialog.is-out .modal |
| `hudPillBing` | 1434 | .hud-pill.bing |
| `quakeJolt` | 1516 | .card-tile.quake-jolt |
| `bfTipIn` | 1545 | .bf-tip-float |
| `fieldLand` | 1583 | .match-field-tile.is-landing · .env-stack.is-landing |
| `washPush` | 1590 | .board-card.wash-pushed .card-tile |
| `washPushUp` | 1591 | .board-card.wash-pushed.push-up .card-tile |
| `waitBump` | 1593 | .waitbadge.wait-bump |
| `cometFall` | 1600 | .bw-comet |
| `cometHit` | 1602 | .board-card.comet-hit .card-tile |
| `cometSky` | 1604 | .battlefield.comet-sky::after |
| `terrainIn` | 1654 | .terrain-banner |
| `lavaBreath` | 1656 | .battlefield.volcanic::after |
| `geyser` | 1661 | .lava-geyser .lg-col |
| `ember` | 1662 | .lava-geyser b |
| `fightSignIn` | 1903 | .fight-sign |
| `fightSignOut` | 1904 | .fight-sign.fight-sign-out |
| `nextTurnSignIn` | 1923 | .next-turn-sign |
| `nextTurnPulse` | 1924 | .next-turn-sign |
| `nextTurnSignOut` | 1925 | .next-turn-sign.next-turn-sign-out |
| `earthquakeShake` | 1932 | .battlefield.earthquake |
| `hqHitFlash` | 1982 | .hq-hit-flash |
| `hqHitFlashBig` | 1987 | .hq-hit-flash-big |
| `centerSlotAppear` | 2065 | .center-slot-empty |
| `rage-pulse` | 2078 | .board-card.raging |
| `clUnmask` | 2141 | .board-card.changeling-unmask |
| `dmgBounceFall` | 2177 | .dmg-float |
| `itemDropFall` | 2192 | .item-drop |
| `burst` | 2198 | .fx-burst · .bee-land-burst |
| `summonGlowRing` | 2203 | .summon-glow-ring |
| `summonSparkPop` | 2209 | .summon-spark |
| `shakeit` | 2216 | .shake |
| `denyShakeAnim` | 2225 | .deny-shake |
| `poisonTintPulseAnim` | 2244 | .poison-tint-pulse |
| `bleedTintPulseAnim` | 2251 | .bleed-tint-pulse |
| `readyPulseAnim` | 2274 | .board-card.ready-pulse |
| `burnMask` | 2287 | .board-card.burning, .card-tile.burning |
| `burnGlow` | 2290 | .burn-glow |
| `burnEmber` | 2293 | .burn-glow i |
| `bleedDrain` | 2296 | .board-card.bleeding |
| `bleedRun` | 2301 | .bleed-tint |
| `bleedDrop` | 2304 | .bleed-wash i |
| `crackJolt` | 2316 | .card-tile.crack-new |
| `flySoar` | 2341 | #appWrap.in-match .board-card.is-flying .fly-body |
| `flyShadow` | 2342 | #appWrap.in-match .board-card.is-flying .fly-shadow |
| `lowHpTremble` | 2346 | :where(.board-card.is-low-hp) .card-tile · :where(html[data-fx="med"]) :where(.board-card.is-low-hp) .card-tile |
| `idleBreathe` | 2347 | :where(#appWrap.in-match .board-card) .card-tile |
| `sdSky` | 2358 | .battlefield.sudden-death::before |
| `bfLightning` | 2363 | .bf-lightning |
| `waitFlip` | 2370 | .waitbadge .wait-flip |
| `triggerRing` | 2378 | .trigger-rune i |
| `triggerGlyph` | 2379 | .trigger-rune b |
| `rwShine` | 2394 | .rw-card.shining .card-tile::after |
| `rwFlash` | 2399 | .rw-card.shown .rw-new::before |
| `dragSpark` | 2404 | .drag-spark |
| `frostCreep` | 2413 | .board-card.is-frozen::after |
| `rgbGlitch` | 2418 | .card-tile.glitch .ico |
| `glitchJitter` | 2419 | .card-tile.glitch |
| `heatRise` | 2463 | .board-card .heat-haze i |
| `pageTurnFwd` | 2472 | #codexBody.page-turn-fwd, #codexBody.page-turn-back |
| `pageTurnBack` | 2473 | #codexBody.page-turn-back |
| `pageShade` | 2477 | #codexBody.page-turn-fwd::after, #codexBody.page-turn-back::after |
| `rpIn` | 2543 | .rp-card.is-new |
| `rpShake` | 2544 | .rp-card.is-hit |
| `rpDmg` | 2545 | .rp-dmg |
| `bossTitle` | 2563 | .boss-title |
| `cardRain` | 2579 | html[data-fx="high"] .board-card .rain-drops::before |
| `castleDust` | 2593 | .castle-dust |
| `cardDance` | 2611 | — |
| `cardScatter` | 2630 | .board-card.is-scattering .card-tile |
| `collapseSquash` | 2640 | .board-card.collapse-landed .card-tile |
| `landingThud` | 2648 | .board-card.landing-impact .card-tile |
| `rallyPulse` | 2672 | .board-card.rally-pulse .card-tile |
| `beeLandingSquash` | 2681 | .board-card.bee-landing .card-tile |
| `beeWiggle` | 2683 | .bee-land-burst |
| `deathSkullFloat` | 2685 | .death-skull |
| `windup-mine` | 2697 | .board-card.windup-mine, .card-tile.windup-mine |
| `windup-enemy` | 2698 | .board-card.windup-enemy, .card-tile.windup-enemy |
| `strike-mine` | 2699 | .board-card.strike-mine, .card-tile.strike-mine |
| `strike-enemy` | 2700 | .board-card.strike-enemy, .card-tile.strike-enemy |
| `dodge-hop` | 2707 | .board-card.dodge |
| `shieldpop` | 2710 | .shield-flash |
| `drawpop` | 2808 | .draw-flash |
| `npcIn` | 2967 | .npc-prompt · .wl-rank-lesson |
| `leaderSlotIn` | 2969 | #leaderWidgetWrap.is-new-slot |
| `dlgChipPulse` | 2984 | .dialogue-dock.is-collapsed.has-question .dlg-chip |
| `spotPulse` | 3017 | .map-spot.is-new .map-spot-ico |
| `spotShake` | 3030 | .map-spot:not(.is-unknown) .map-spot-ico |
| `tipDrift` | 3042 | .tip-ticker .tip-line |
| `tipOutZoom` | 3043 | .tip-ticker .tip-line.tip-out |
| `tipOut` | 3043 | — |
| `tipIn` | 3045 | .tip-ticker .tip-line |
| `trPulse` | 3146 | .trench-replay .tr-tele span.on |
| `cpTargetIn` | 3212 | .coach-pointer.is-ring .cp-target |
| `cpTargetPulse` | 3213 | .coach-pointer.is-ring .cp-target |
| `cpRing` | 3217 | .coach-pointer .cp-ring |
| `cpBob` | 3218 | .coach-pointer .cp-hand |
| `llIn` | 3234 | .lumber-lesson |
| `llPop` | 3236 | .lumber-lesson .ll-box |
| `llPulse` | 3240 | .lumber-lesson .ll-cost |
| `llToss` | 3244 | .lumber-lesson .ll-spare |
| `lnudge` | 3246 | .hand-strip .card-tile .lumber-nudge |
| `crumbleStone` | 3266 | .crumble-layer .crumble-stone |
| `crumbleDust` | 3269 | .crumble-layer .crumble-dust |
| `crumbleCrack` | 3272 | .crumble-layer .crumble-crack |
| `crumbleShake` | 3274 | .is-crumbling |
| `crumbleSink` | 3275 | .is-crumbling |
| `coachIn` | 3280 | .sudden-death-sign · .draw-offer · .coach-tip |
| `raidTele` | 3473 | .board-card.raid-tele |
| `logpop` | 3487 | .log-row |
| `statRainbowShift` | 3602 | .stat-rainbow |
| `splashFall` | 3621 | .splash-fx .leaf |
| `goesFirstRowGlow` | 3665 | .board-row.goes-first-flash |
| `goesFirstWash` | 3670 | .board-row.goes-first-flash::before |
| `fieldFirstLeafPop` | 3678 | .field-first-leaf |
| `cardStarPopFall` | 3699 | .card-star-pop |
| `weatherLeafFall` | 3704 | .weather-leaf |
| `fireworkBurstFall` | 3724 | .firework-particle |
| `splashIn` | 3732 | .splash-inner |
| `splashBob` | 3735 | .splash-mark · .home-menu-mark · .home-menu-mark.chestnut-knock |
| `splashPulse` | 3742 | .splash-enter |
| `fsBob` | 3807 | .faction-showcase .fs-char |
| `ribbonClash` | 3892 | .entrance-ribbon b |
| `titleDrop` | 3895 | .splash-title .tl |
| `titleSheen` | 3897 | .splash-title.is-wordmark |
| `efFloat` | 3919 | .entrance-fan .ef-card |
| `logoMajesticFade` | 3955 | .entrance.leaving #entranceLogoMark |
| `logoMajesticFadeTitle` | 3960 | .entrance.leaving #entranceLogoTitle |
| `knockVibrate` | 3988 | .home-menu-mark.chestnut-knock |
| `menuBtnDazzle` | 4085 | .home-menu-btn:hover::before, .home-menu-btn-small:hover::before · .home-menu-btn.btn-dazzle::before, .home-menu-btn-small.btn-dazzle::before |
| `menuBtnClickPop` | 4089 | .home-menu-btn.btn-dazzle, .home-menu-btn-small.btn-dazzle |
| `achvGlow` | 4290 | .achv-tile.is-ready .achv-medal |
| `tutorialBeacon` | 4554 | .map-node.tutorial-solo.is-next |
| `guardSheen` | 4588 | .board-card .guard-plates i::after |
| `shellSweep` | 4600 | .board-card.shell-sweep .card-tile::after |
| `shellGlowIn` | 4602 | .board-card .shell-up |
| `wingFlap` | 4616 | .board-card .angel-wings i |
| `wingFlapR` | 4617 | .board-card .angel-wings .aw-r |
| `rankFoil` | 4698 | .rank-hex.rank-S i · .rank-hex.rank-SS i, .rank-hex.rank-SSS i |
| `ppStrange` | 4961 | .pvp-portent .pp-fx.pp-w4 |
| `liveQueuePulse` | 4976 | .live-queue-status .amb-ico |
| `leaderGlowSpin` | 5080 | .board-card.is-leader::before |
| `stunSpin` | 5157 | .stun-overlay |
| `freezeShimmer` | 5168 | .freeze-overlay |
| `frostFall` | 5183 | .frost-flakes i |
| `stunHaloSpin` | 5189 | .stun-halo i |
| `chargeFire` | 5201 | .chargebadge.charge-fire |
| `sacJawTop` | 5207 | .sac-teeth .st-top |
| `sacJawBot` | 5208 | .sac-teeth .st-bot |
| `sacChomp` | 5210 | .board-card.sac-chomp .card-tile |
| `nullifyFlash` | 5213 | .board-card.nullify-flash .card-tile |
| `crabPinch` | 5215 | .board-card.crab-pinch .card-tile |
| `sleepBob` | 5219 | .sleep-overlay |
| `paralyzeJitter` | 5221 | .paralyze-overlay · .shock-overlay |
| `tipsySway` | 5232 | .board-card.is-tipsy .card-tile |
| `confusedHue` | 5234 | .board-card.is-confused .card-tile |
| `tipsyLurch` | 5236 | .board-card.tipsy-lurch |
| `blindDim` | 5241 | .blind-overlay |
| `staggerWobble` | 5253 | .stagger-overlay |
| `chainRattle` | 5261 | .chain-overlay |
| `chainSnap` | 5265 | .chain-overlay.chain-breaking |
| `rejoinPulse` | 5442 | .home-play.is-rejoin · .cq-rejoin |
| `poShake` | 5481 | .pack-open-pack.is-shaking |
| `poDeal` | 5486 | .po-card |
| `poGlow` | 5495 | .po-card.is-new.is-flipped .po-front · .po2-card.is-new-moment .po2-front |
| `trDanger` | 5503 | .trench-match .tr-cell.is-danger |
| `trCharge` | 5507 | .trench-match .is-boss-wrap.is-charging .tr-card |
| `trAim` | 5511 | .trench-match .tr-cell.is-aim::after |
| `worldOutL` | 5536 | .conquest-main.world-out-right |
| `worldOutR` | 5536 | .conquest-main.world-out-left |
| `worldInR` | 5537 | .conquest-main.world-in-right |
| `worldInL` | 5537 | .conquest-main.world-in-left |
| `hsBob` | 5552 | .hs-otter |
| `hsHover` | 5553 | .hs-bird |
| `hereRing` | 5620 | .world-stop.is-here .world-diamond::after |
| `worldZoomOut` | 5635 | .conquest-main.world-zoom-out |
| `worldZoomIn` | 5636 | .conquest-main.world-zoom-in |
| `darkClearedIn` | 5654 | .conquest-layout.dark-cleared::after |
| `bfHpHit` | 5669 | .bf-hp.is-hit .bf-hp-num |
| `initFlip` | 5687 | .init-coin.is-flip |
| `sweepWhiff` | 5695 | .sweep-whiff |
| `sweepWhiffL` | 5696 | .sweep-whiff.is-left |
| `sweepWhiffLbl` | 5698 | .sweep-whiff-label |
| `ffBlur` | 5701 | .board-card.ff-blur .card-tile |
| `devilAura` | 5785 | .card-tile.is-devilry::after · .removal-badge[data-can-cast="1"] |
| `scaredShake` | 5796 | .facing-svg path.facing-scared |
| `cleanseSweep` | 5801 | .cleanse-fx::before |
| `cleanseMote` | 5802 | .cleanse-fx i |
| `surgeGlow` | 5884 | .board-card.surge-glow .card-tile |
| `eruptRumble` | 5887 | .battlefield.erupt-rumble |
| `eruptHit` | 5889 | .board-card.erupt-hit .card-tile · .board-card.lava-tide-hit .card-tile |
| `immolatePulse` | 5891 | .board-card.immolate-pulse .card-tile |
| `wlShine` | 5909 | .wl-firstclear::after |
| `wlRays` | 5913 | .winloss-card.is-glory .wl-rays |
| `qnPulse` | 6003 | .qn-note.is-ready .qn-claim |
| `fcSpin` | 6025 | .field-card .fc-ico |
| `coldWave` | 6034 | .cold-wave::before |
| `tideIn` | 6041 | .tide-wave.is-flow span |
| `tideOut` | 6042 | .tide-wave.is-ebb span |
| `tideBob` | 6047 | .tide-is-flow > .tide-line |
| `fieldSnow` | 6051 | .field-snow i |
| `icePulse` | 6056 | .ice-pulse |
| `fieldRain` | 6061 | .field-rain i |
| `fieldFog` | 6066 | .field-fog span |
| `fieldHeat` | 6069 | .field-heat i |
| `fieldHeatGlow` | 6070 | .field-heat |
| `fieldMoon` | 6073 | .field-moon .fm-moon |
| `ufxCrunchTop` | 6127 | .ufx-top |
| `ufxCrunchBot` | 6128 | .ufx-bot |
| `ufxCrunchFlash` | 6129 | .ufx-crunch |
| `ufxDraw` | 6134 | .ufx-gash, .ufx-gash-under |
| `ufxFade` | 6135 | .ufx-gash, .ufx-gash-under · .ufx-star · .ufx-dot |
| `ufxPop` | 6136 | .ufx-star · .ufx-dent |
| `ufxBiteTop` | 6137 | — |
| `ufxBiteBot` | 6138 | — |
| `ssFrame` | 6173 | .ss-otter · .ss-shake · .ss-hover |
| `ssHop` | 6174 | .ss-otter |
| `ssShake` | 6181 | .ss-shake |
| `ssHover` | 6182 | .ss-hover |
| `ssJab` | 6185 | .ss-spear |
| `ssOrb` | 6188 | .ss-staff::before |
| `tutGlow` | 6226 | #handStrip .card-tile.tut-highlight, .leader-widget.tut-highlight |
| `invNewPop` | 6257 | .inv-new · .inv-new.is-inline |
| `invNewBob` | 6258 | .inv-new |
| `hatchSpin` | 6274 | .hatch-rare .hatch-rays · .hatch-ov.is-shining .hatch-beams |
| `hatchRock` | 6279 | .hatch-egg.rock |
| `hatchShinePulse` | 6289 | .hatch-egg.shine |
| `hatchBeam` | 6295 | .hatch-ov.is-shining .hatch-beams i |
| `hatchFromLight` | 6300 | .hatch-card.from-light |
| `hatchSpark` | 6303 | .hatch-uncommon .hatch-egg.crack2::after, .hatch-uncommon .hatch-egg.crack3::after |
| `hatchBurst` | 6305 | .hatch-egg.burst |
| `rrGlaze` | 6404 | .rr-token::after |
| `rrDust` | 6407 | .rr-dust |
| `po2GlowPulse` | 6421 | .po2-pack.has-glow.is-idle |
| `po2Jackpot` | 6423 | .po2-pack.is-jackpot .po2-body · .po2-tpack.is-jackpot |
| `po2NewBorder` | 6431 | .po2-card.is-new-moment .po2-front · .po2-sum-card.is-new .card-tile |
| `po2SparkFlash` | 6433 | .po2-card.is-spark .po2-front |
| `po2Spark` | 6433 | .po2-sparks i |
| `po2SuperSpark` | 6434 | .po2-card.is-superspark .po2-front |
| `po2MiniNew` | 6438 | .po2-mini.is-new |
| `po2Rays` | 6449 | .po2-reveal::before |
| `po2Sheen` | 6460 | .po2-back::after · .po2-tpack-sheen |
| `po2TOpen` | 6499 | .po2-tpack.is-open |
| `viewTurnFwd` | 6510 | .view-turn-fwd, .view-turn-back |
| `viewTurnBack` | 6511 | .view-turn-back |
| `eggWobble` | 6517 | .nest-egg .ne-ico · .hay-nest .nest-thing |
| `courierBob` | 6523 | .map-courier |
| `mseBob` | 6551 | .wp-stam-pips i.ready · .map-subemblem .mse-ico |
| `mscGlow` | 6608 | .map-subcave .msc-ico |
| `shinyTwinkle` | 6651 | .shiny-mark |
| `mwSwing` | 6661 | .map-well .mw-bucket |
| `mwRipple` | 6665 | .map-well.is-rippling .mw-ring::after |
| `ssBump` | 6681 | .ss-deckbox.is-bump |
| `boltFlicker` | 6687 | .bf-bolt |
| `boltHit` | 6690 | .bf-bolt-hit |
| `boltLit` | 6694 | .bolt-lit |
| `ffTongue` | 6719 | .forge-flareup .ff-tongue |
| `po2Flash` | 6729 | .po2.po2-flash::after |
| `po2Float` | 6748 | .po2-pack.has-glow.is-idle · .po2-pack.is-idle |
| `po2Nudge` | 6749 | .po2-pack.is-nudge |
| `po2Foil` | 6756 | .po2-foil |
| `po2Snip` | 6776 | .po2-strip::after |
| `po2StripOff` | 6779 | .po2-strip.is-gone .po2-strip-face |
| `po2Sink` | 6783 | .po2-pack.is-rising |
| `rwPackBob` | 6808 | .rw-pack-art .booster |
| `rwPackGlow` | 6809 | .rw-pack-art::before |
| `po2DealIn` | 6824 | .po2-card |
| `po2Tease` | 6845 | .po2-card.is-current:not(.is-revealed)::before |
| `po2Rattle` | 6846 | .po2-card.tease-legend.is-current:not(.is-revealed) .po2-back |
| `po2Stamp` | 6859 | .po2-card.is-new-moment .po2-new |
| `po2Pop` | 6862 | .po2-mini.is-new · .po2-tpack · .po2-mini |
| `ciIn` | 6890 | .card-inspect |
| `holoDrift` | 6923 | .card-tile.is-holo:not(.holo-active):not(.holo-tilt) |
| `foilAurora` | 7003 | .card-tile.holo-aurora .holo-layer |
| `foilAuroraB` | 7004 | .card-tile.holo-aurora .holo-layer::before |
| `foilSpin` | 7018 | .card-tile.holo-galaxy .holo-layer::before |
| `foilDrip` | 7028 | .card-tile.holo-molten .foil-fx i |
| `foilHeat` | 7029 | .card-tile.holo-molten |
| `foilFrost` | 7043 | .card-tile.holo-frost .foil-fx |
| `foilPetal` | 7061 | .card-tile.holo-sakura .foil-fx i |
| `foilGlint` | 7076 | .card-tile.holo-sparkle .holo-layer |
| `foilScan` | 7092 | .card-tile.holo-scanline .holo-layer::before |
| `foilFlicker` | 7093 | .card-tile.holo-scanline .holo-layer |
| `foilJitter` | 7094 | .card-tile.holo-scanline .ico |
| `holoTwinkle` | 7120 | .card-tile.holo-sparkle .foil-fx i · .holo-glitter i |
| `flapL` | 7180 | .tent-flaps i:first-child |
| `flapR` | 7181 | .tent-flaps i:last-child |
| `awningUp` | 7209 | .cart-awning |
| `downFall` | 7226 | .nest-down i |
| `forgeSpark` | 7252 | .forge-sparks i |
| `forgeFlare` | 7254 | .forge-flare |
| `lsVeil` | 7262 | .leaf-sweep .ls-veil |
| `heroDot` | 7289 | .hero-dot |
| `dangerPulse` | 7345 | body.castle-danger::after · .danger-warn .dw-sign |
| `mbGem` | 7354 | .materia-burst .mb-gem |
| `mbSpark` | 7356 | .materia-burst i |
| `heroRing` | 7363 | .hero-card-big.is-levelling::before |
| `heroLift` | 7364 | .hero-card-big.is-levelling .card-tile |
| `vsIn` | 7389 | .vs-opener |
| `vsOut` | 7390 | .vs-opener.is-leaving |
| `vsFromLeft` | 7393 | .vs-me |
| `vsFromRight` | 7394 | .vs-them |
| `vsTaunt` | 7403 | .vs-taunt |
| `vsPop` | 7407 | .vs-mark |
| `vsRays` | 7419 | .vs-opener::before, .vs-screen::before |
| `vsSeam` | 7423 | .vs-opener::after, .vs-screen::after |
| `pitchCallout` | 7469 | .pitch-callout |
| `pillGainPulse` | 7471 | .pill-gain-pulse |
| `turnGlow` | 7474 | #rowMine.turn-glow |
| `emberRise` | 7487 | .forge-embers i |
| `forgeFlicker` | 7514 | .anvil-stage.is-hot .forge-glow |
| `forgeLvlPop` | 7522 | .forge-level-label.pop |
| `pipPulse` | 7541 | .forge-pips i.next |
| `coachNudge` | 7562 | .coach-tip.nudge |
| `critBurst` | 7678 | .dmg-float .df-burst |
| `leakRays` | 7774 | .pack-open-pack.is-shaking[class*="leak-"]::after |
| `chargePulse` | 7779 | .po-card.is-charging .po-back |
| `facingFlow` | 7810 | .facing-svg line |
| `pitchReady` | 7816 | .discardzone.pitch-ready |
| `rainFall` | 7922 | .battlefield.is-raining:not(.has-shader)::after |
| `tipFlicker` | 7934 | .sfx-tipflame |
| `bfLanternFlicker` | 8011 | .battlefield.bf-lantern::after |
| `bwlBob` | 8030 | .bwl-acorn |
| `shockFlicker` | 8185 | .card-tile .shock-arcs i |
| `shockJitter` | 8187 | .card-tile.shock-jitter |
| `hqHitFlashSmall` | 8194 | .hq-hit-flash-small |
| `earthquakeShakeBig` | 8197 | .battlefield.earthquake-big |
| `countPop` | 8246 | .reward-count.is-counted |
| `bountyBob` | 8272 | body.bw-holding .bounty-bubble, body.bounty-peek .bounty-bubble |
| `wanderBob` | 8283 | .map-wanderer |
| `wanderFresh` | 8292 | .wander-card.is-fresh |
| `mseShine` | 8307 | .map-subexit .mse-rays |
| `mseFlicker` | 8314 | .map-subexit .mse-lamp |
| `sssPulse` | 8332 | .rank-hex.rank-SSS |
| `elBanner` | 8358 | .enemy-leader-banner |
| `leaderRing` | 8366 | .leader-ring |
| `leaderFlash` | 8369 | .leader-flash |
| `statPump` | 8378 | .card-tile .stats .stat-pump |
| `statDrain` | 8379 | .card-tile .stats .stat-drain |
| `triggerAura` | 8385 | .board-card > .trigger-aura |
| `ashFall` | 8399 | .winloss-card.is-fallen .wl-dusk i |
| `windDrift` | 8501 | #battlefieldEl.is-windy::after |
| `dangerIn` | 8509 | .danger-warn |
| `phaseAuraPulse` | 8582 | .board-card.phase-aura > .card-tile, .board-card.phase-aura .fly-body > .card-tile |
| `sporeRise` | 8588 | .board-card .phase-spores i |
| `phaseBurst` | 8591 | .board-card.phase-burst > .card-tile, .board-card.phase-burst .fly-body > .card-tile |
| `tkUpgrade` | 8605 | .board-card.tk-upgrade > .card-tile, .board-card.tk-upgrade .fly-body > .card-tile |
| `tkDowngrade` | 8607 | .board-card.tk-downgrade > .card-tile, .board-card.tk-downgrade .fly-body > .card-tile |
| `seenNew` | 8643 | .board-card .seen-new |
| `seenNewFade` | 8644 | .board-card .seen-new |
| `po2CrateShake` | 8659 | .po2-crate.is-open |
| `mistyTint` | 8684 | #battlefieldEl > .sky-fx.tone-misty |
| `tideFloat` | 8695 | #appWrap.in-match .board-card.is-floating .fly-body |
| `supremeGlint` | 8701 | .card-tile.is-supreme .stats .atk::after, .card-tile.is-supreme .stats .hp::after |
| `bloomPulse` | 8707 | .ab-bloom.is-on |
| `wavePush` | 8710 | .board-card.wave-pushed |
| `counterSlide` | 8794 | .shop-counter.is-new .counter-goods |
| `mvBob` | 8881 | .map-veil .mv-ico |
| `mvDot` | 8881 | .map-veil .mv-dots i |
| `mapDropShadow` | 8947 | .conquest-map-canvas .map-node.map-drop::after |
| `mapDrop` | 8947 | .conquest-map-canvas .map-node.map-drop |
| `tutReveal` | 8949 | .conquest-map-canvas .tut-reveal |
| `fsZoom` | 8956 | .splash.fs-zoom |
| `bfFadeIn` | 8958 | #view-play.bf-fade-in |
| `ambushPop` | 9000 | .map-node.ambush-pop |
| `fuseLast` | 9006 | .fuse-badge.is-last |
| `dynBlast` | 9008 | .dyn-blast |
| `dynShake` | 9010 | #battlefieldEl.dyn-shake |
| `fsAppear` | 9013 | .faction-btn.fs-appear |
| `whSpin` | 9051 | .world-home .wh-compass |
| `snailTrail` | 9067 | .snail-trail |
| `crystalTwinkle` | 9071 | .crystal-sparkle |
| `predEyes` | 9075 | .pred-eyes |
| `predBlink` | 9076 | .pred-eyes i |
| `mcfGlow` | 9135 | .map-campfire .mcf-glow |
| `mcfFlick` | 9136 | .map-campfire .mcf-fire |
| `mcfSpark` | 9137 | .map-campfire .mcf-spark |
| `mnShine` | 9142 | .map-subemblem.is-done[data-submap="mn"]::after |
| `rrRing` | 9241 | .rr-ring |
| `rrBump` | 9253 | .rr-row.is-bump |
| `qfRibbon` | 9258 | .qf-ribbon |
| `qfBump` | 9263 | .qf-bag.is-bump span |
| `castlePop` | 9284 | .castle-pop |
| `atkHeat` | 9336 | .card-tile .atk .atk-amp-3 · .card-tile .atk .atk-amp-4 |
| `wpInk` | 9382 | .wp-draw .wp-ink |
| `wpNodeIn` | 9394 | .wp-draw .wp-node |
| `wpPulse` | 9395 | .wp-node.is-start .wp-halo |
| `waPop` | 9409 | .winloss-achv |
| `smSpark` | 9429 | .sm-sparks i |
| `scaleGlint` | 9459 | .map-node-scale |
| `windGust` | 9468 | .hatch-sky .wind |
| `leafDrift` | 9470 | .hatch-sky .leaf |
| `babyBob` | 9479 | .hay-nest.is-baby .nest-thing |
| `readyHop` | 9484 | .hay-nest.is-ready .nest-thing |
| `smokeDrift` | 9537 | .smoke-overlay |
| `npNeed` | 9607 | .np-need-toast |
| `npNeedFade` | 9608 | .np-need-toast |
| `ds2Nice` | 9614 | .ds2-say .ds2-nice |
| `ds2In` | 9615 | .ds2-overlay |

## Sources

Code: `bramblewood-engine.js`, `arena_app.js`, `arena_template.html`, `bramblewood-skillfx.js`, `bramblewood-procfx.js`, `bramblewood-unitfx.js`, `bramblewood-shaders.js`, `tools/effects-lab/build.py`, `tools/effects-lab/effects-lab.js`. Docs: `docs/effects-catalogue.md`, `docs/sfx-cue-sheet.md`, `docs/vfx-exploration-2026-10-10.md`, `docs/lore-bible.md`, `docs/design-2026-10-14-late-game.md`, `docs/design-notes-2026-10-14-ideas.md`, `docs/raid-design.md`, `docs/coop-dungeon-design-2026-10-13.md`, `docs/economy-monetization-2026-10-13.md`, `docs/steam-launch-plan-2026-10-13.md`, `docs/pack-plan-2026-10-12.md`, `docs/hero-design.md`, `docs/design-pushback-2026-10-13.md`, `docs/immersion-2026-10-05.md`, `docs/card-displays.md`, `docs/map-schedule-2026-10-12.md`, `docs/skills-by-map-2026-10-15.xlsx` (Recommended), and the project docs `world-roadmap-2026-10-13.md`, `weather-and-time-2026-10-13.md`, `context-vfx-animation.md`.