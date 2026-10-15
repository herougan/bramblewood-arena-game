# Effects batch C — status (2026-10-15)

Batch C of the effects pass (docs/effects-lab-contract.md): status wear-offs and lost turns, deaths, castle, summons / spawns / hatch.
Code: `bramblewood-fx-c.js` (`FX.C`). Lab: `tools/effects-lab/manifest/c.js` (castle cracks/crumble are in `_existing.js`). Every id below is registered in the lab with a working demo.

**119 entries** · 30 done-existing · 9 future (lab concept) · 1 future (lab concept) + variants · 46 new · 33 variants · 160 lab variants (plus G/H on `sk-exile-board`).

Status: **done-existing** = the game already had a good look, demoed in the lab with the live function; **new** = built in FX.C and hooked in the game; **variants** = new with 2–3 looks side by side (A plays in the game unless the note says otherwise); **future** = lab concept, no game hook yet.

## Game hooks

- Battle events → `FX.C.onEvent` (via `fxBatchVfx`): `statusEnd`, `skipTurn`, `hit` (wake jolt, castle bolt/brew timing), `hitHQ` (oops, shield), `castleRegen`, `lumber`, `statusFx` (castleBolt, herbBane, castleThorns, herbHeal, logjam, castleSpawn), `sacrifice`, `play`, `advance`, `waitTick`, `spawn` (meiosis, twin, sprout, skyfall), `mindControl`, `remember`; cause tracking from `hit`/ticks/`tsunami`/`avalanche`/`explode`/`dynamite`/`fieldTick`/`death`.
- `deathVfx` → `fxHook('deathLook', el, info)` → `FX.C.hooks.deathLook`: picks the cause look (`FX.C.deathPlan`), the boss and leader deaths, egg / structure / petrified / exile, and the add-ons (leader crown, foil peel, KO stamp). When it handles the death the old look is skipped.
- `maybeSpeakHQ` → `fxHook('castleSpeech', …)` → the castle's own stone bubble.
- Match end, defeat → `fxHook('castleFallMine', hqTileEl('A'), h)` → your castle sinks (SkillFX.castleCrumble 'sink'), awaited `h.wait` ms before the end sign (2026-10-15, this pass).
- Engine (log only, no rule change; `tests/keywords-2026-10-15d.js`): `{type:'statusEnd', status}` when a status runs out, `{statusEnd, woke:true}` when a sleeper is hit awake, and `death` events now carry `nullified` / `exiled` (Nullify kill, Removal Counter, On Death exile).
- Gating: everything is skipped under reduced motion / Effects "none" (fxBatchVfx / fxHook) and needs Effects ≥ Medium; nothing awaits inside the replay; repeating looks use per-unit maps.

## Extra beyond the inventory

- **Exile / Nullify death** (user: "exile/nullify" among the deaths): `FX.C.deathExile` (A, game) and `deathExile_B`, registered as **G/H on `sk-exile-board`** (batch A owns that id; G/H avoid its keys). Batch A: if your exile-from-board look also animates the dying card, skip it when the death event has `nullified`/`exiled`.
- **King / leader death** (`FX.C.kingFall`): its own whole death — gold flash, kneels, the crown lifts and cracks in two, the royal pennant (red for the enemy, blue for yours) is lowered, "👑 The King falls".

## Entries


### Status wear-offs and lost turns

| id | name | status | lab variants | in game |
|---|---|---|---|---|
| `st-poison-expire` | Poison: wears off | new | A: ☠ cured | onEvent: statusEnd {status:'poison'} (new engine event, pushed when the status runs out) |
| `st-bleed-expire` | Bleed: wears off | new | A: 🩸 stopped | onEvent: statusEnd {status:'bleed'} (new engine event, pushed when the status runs out) |
| `st-decay-expire` | Decay: wears off | new | A: 🍄 cleared | onEvent: statusEnd {status:'decay'} (new engine event, pushed when the status runs out) |
| `st-freeze-expire` | Freeze: wears off | variants | A: Ice cracks off in shards / B: Before: the thaw float | onEvent: statusEnd {status:'frozen'} (the last freeze counter melts) — B is the old thaw float, for comparison |
| `st-freeze-skip` | Frozen unit skips its turn | new | A: ❄ Frozen | onEvent: skipTurn {reason:'frozen'} |
| `st-sleep-expire` | Sleep: wears off | new | A: 💤 awake | onEvent: statusEnd {status:'asleep'} (new engine event, pushed when the status runs out) |
| `st-sleep-skip` | Asleep unit skips its turn | new | A: 💤 Asleep | onEvent: skipTurn {reason:'asleep'} |
| `st-sleep-wake` | Woken by damage | new | A: Jolt, "!" and the Zs scatter | onEvent: statusEnd {status:'asleep', woke:true} → plays when the waking blow lands |
| `st-paralyze-expire` | Paralyze: wears off | new | A: ⚡ free | onEvent: statusEnd {status:'paralyzed'} (new engine event, pushed when the status runs out) |
| `st-paralyze-coinflip` | Paralyze coin flip fails | variants | A: Tails: sparks and a jolt / B: Heads: it acts | onEvent: skipTurn {reason:'paralyzed'} (the engine only reports failed flips) — the engine only logs failed flips, so the game shows A (tails); B (heads) is for comparison |
| `st-stun-expire` | Stun: wears off | new | A: 💫 steady | onEvent: statusEnd {status:'stunned'} (new engine event, pushed when the status runs out) |
| `st-stun-skip` | Stunned unit skips its turn | new | A: 💫 Stunned | onEvent: skipTurn {reason:'stunned'} |
| `st-stagger-expire` | Stagger: wears off | new | A: 💢 steady | onEvent: statusEnd {status:'staggered'} (new engine event, pushed when the status runs out) |
| `st-blind-expire` | Blind: wears off | new | A: 👁 sees | onEvent: statusEnd {status:'blind'} (new engine event, pushed when the status runs out) |
| `st-tipsy-expire` | Tipsy: wears off | new | A: 🍺 sober | onEvent: statusEnd {status:'tipsy'} (new engine event, pushed when the status runs out) |
| `st-confuse-expire` | Confuse: wears off | new | A: ❓ clear | onEvent: statusEnd {status:'confused'} (new engine event, pushed when the status runs out) |
| `st-shock-expire` | Shock: wears off | new | A: 🌩 grounded | onEvent: statusEnd {status:'shocked'} (new engine event, pushed when the status runs out) |
| `st-corrode-expire` | Corrode: wears off | new | A: 🧪 clean | onEvent: statusEnd {status:'corrode'} (new engine event, pushed when the status runs out) |
| `st-expose-expire` | Expose: wears off | new | A: 🎯 hidden | onEvent: statusEnd {status:'exposed'} (new engine event, pushed when the status runs out) |
| `st-daunt-expire` | Daunt: wears off | new | A: 😤 bold again | onEvent: statusEnd {status:'daunt'} (new engine event, pushed when the status runs out) |
| `st-wither-expire` | Wither: wears off | new | A: 🥀 wither ends | onEvent: statusEnd {status:'wither'} (new engine event, pushed when the status runs out) |
| `st-irradiation-expire` | Irradiation tokens: wears off | new | A: ☢ clean | onEvent: statusEnd {status:'irradiation'} (new engine event, pushed when the status runs out) |
| `st-smoke-expire` | Smoke (Smoke Bomb on an ally): wears off | new | A: 🌫 clears | onEvent: statusEnd {status:'smoke'} (new engine event, pushed when the status runs out) |
| `st-scar-expire` | Scar: wears off | new | A: 🗡 healed | onEvent: statusEnd {status:'scar'} (new engine event, pushed when the status runs out) — scars never time out; the statusEnd fires only if something clears one (cleanse) |
| `st-chained-skip` | Chained unit skips its turn | new | A: ⛓ Chained | onEvent: skipTurn {reason:'chained'} |
| `st-petrified-skip` | Petrified unit skips its turn | new | A: 🗿 Stone | onEvent: skipTurn {reason:'petrified'} |
| `st-petrified-end` | Petrification wears off | new | A: The stone cracks off | onEvent: statusEnd {status:'petrified'} (round start, volcano) |
| `st-cower-skip` | Cowering unit skips its turn | done-existing | A: Now: shiver and "🫣 Hides" (live) | existing: statusFx cower → SkillFX.fearShiver |
| `st-shell-skip` | Shelled unit skips its turn | new | A: 🐚 In its shell | onEvent: skipTurn {reason:'shell'} |
| `st-ritual-skip` | Ritual unit skips its turn | new | A: 🕯 Chanting | onEvent: skipTurn {reason:'ritual'} |
| `st-zero-attack-skip` | Unit with 0 Attack skips | new | A: 0 ⚔ | onEvent: skipTurn {reason:'zeroAttack'} |

### Deaths

| id | name | status | lab variants | in game |
|---|---|---|---|---|
| `death-fall` | Normal death (topple) | done-existing | A: Topple, leaves and dust (live) | deathVfx → fallDeathVfx (physical / unknown cause) |
| `death-flyer-fall` | Flyer falls out of the sky | done-existing | A: Drops out of the sky, feathers burst (live) | deathVfx → fallDeathVfx → flyerFallVfx (is-flying) |
| `death-burn` | Burned away (heat) | done-existing | A: Burns away from a ragged edge (live) | deathVfx → burnAwayVfx (heat) |
| `death-poison` | Poison death | done-existing | A: Green wash and drips (live) | deathVfx → bleedOutVfx(poison) + SkillFX.elementDeath |
| `death-acid` | Acid death | variants | A: Melts with a yellow-green fizz / B: Before: the poison drip | deathVfx → hooks.deathLook: last hurt by acid — B is the old borrowed poison drip, for comparison |
| `death-decay` | Decay death | variants | A: Mould blooms, it crumbles, mushrooms pop / B: Before: the poison drip | deathVfx → hooks.deathLook: last hurt by decay — B is the old borrowed poison drip, for comparison |
| `death-cold` | Frozen shatter | done-existing | A: Ice shards fly (live) | deathVfx → ProcFX.shatter + SkillFX.elementDeath cold |
| `death-bleed` | Bleed-out | done-existing | A: Red wash and drops (live) | deathVfx → bleedOutVfx(bleed) |
| `death-token` | Token pixel shatter | done-existing | A: Pixel shatter (live) | deathVfx → pixelShatterVfx (token) |
| `death-lightning` | Electrocuted (Electricity / Dragon Lightning / Shock Bolt) | variants | A: Struck, charred and crackling / B: X-ray flash, crumbles to cinders / C: Electric bats: arcs crawl, pops into sparks | deathVfx → hooks.deathLook: last hurt by Electricity, Dragon Lightning, Shock bolts |
| `death-magic` | Killed by magic | variants | A: Dissolves into rising arcane motes / B: Rune seal folds it into a star | deathVfx → hooks.deathLook: last hurt by magic damage (Map 50+) |
| `death-psychic` | Mind shattered (Psychic) | variants | A: Violet glass cracks, the face splits / B: Mind blown: ripples, blur, spiral | deathVfx → hooks.deathLook: last hurt by Psychic |
| `death-wither` | Withered away | variants | A: Black ash crumble with a skull / B: Wilts and browns, dry leaves fall | deathVfx → hooks.deathLook: last hurt by Wither ticks |
| `death-irradiation` | Irradiated to death | variants | A: Green glow to a dark silhouette / B: Meltdown flicker, ☢ flash, collapse | deathVfx → hooks.deathLook: last hurt by Irradiation |
| `death-water` | Drowned / washed away (Tsunami, Tide-spout) | variants | A: A wave carries it off / B: The water rises and it sinks | deathVfx → hooks.deathLook: last hurt by Tsunami / Tide-spout / water damage |
| `death-crushed` | Crushed (Earthquake, Landslide, Avalanche, Meteor, Comet) | variants | A: Rocks flatten it into the dust / B: Buried under an avalanche | deathVfx → hooks.deathLook: last hurt by Earthquake, Landslide, Meteor, Comet (A); Avalanche (B) — game: A for Earthquake/Landslide/Meteor/Comet, B for Avalanche |
| `death-explode` | Blown up (Explode, Dynamite) | variants | A: Blast, shockwave, scorched scraps / B: Cartoon kaboom, spins away | deathVfx → hooks.deathLook: last hurt by Explode, Dynamite |
| `death-petrified` | Shattered while petrified | variants | A: Cracks spread, breaks into stone / B: The statue topples into rubble | deathVfx → hooks.deathLook: last hurt by any death while petrified |
| `death-curse` | Killed on cursed ground (Desecrate) | variants | A: A black sigil swallows it / B: Shadow hands drag it under | deathVfx → hooks.deathLook: last hurt by curse ticks (Desecrate) |
| `death-true` | True / ichor damage | variants | A: Golden ichor drains it pale / B: Gilded, then blown away as gold dust | deathVfx → hooks.deathLook: last hurt by true / ichor damage |
| `death-sacrificed` | Sacrificed for a Dark Summon | variants | A: Red sigil, burns to ash upward / B: Before: jaws, then the topple | deathVfx → hooks.deathLook: sacrifice / statusFx sacrificed — B is the old jaws + topple, for comparison |
| `death-leader` | Leader / King dies | variants | A: Add-on: crown tumbles off, banner tears / B: The King falls: gold flash, kneels, crown cracks, banner lowered / C: Your leader falls (blue banner) | deathVfx → hooks.deathLook: the leader / King. B (its own whole death) plays in fights; when a cause look applies (lightning, water…) A's crown tumbles over that instead — game: B (kingFall) is the leader/King death; A (crown add-on) rides on a cause death (lightning, water…) instead |
| `death-boss` | Boss unit dies | new | A: Freeze-frame, gold shockwaves, shatter, "Defeated!" | deathVfx → hooks.deathLook: enemy leader of a boss node / boss def; the round waits (noteMatchFx) — boss def / raid boss / enemy leader of a boss node; ~2.3 s, plays at 1x and holds the round (noteMatchFx) |
| `death-egg` | Egg card destroyed before hatching | new | A: Shell cracks in two, a sad puff | deathVfx → hooks.deathLook: a hatchInto card |
| `death-structure` | Structure destroyed | variants | A: Slumps, planks tumble, dust / B: Tips over sideways and breaks | deathVfx → hooks.deathLook: a Structure card (A) — game uses A |
| `death-shiny-foil` | Shiny / foil unit dies | new | A: The finish peels off in a sparkle | deathVfx → hooks.deathLook add-on: tile is-shiny / is-holo — plays over the normal death |
| `death-skull` | Skull float on death | done-existing | A: Skull floats up over a bleed-out | deathVfx (.death-skull) on every death but falls, tokens and ice |
| `death-kill-emote` | Killer emote | done-existing | A: The killer gloats (live bubble) | maybeEmote(killer, 'kill') |
| `death-speech` | Death line | done-existing | A: A last line (live bubble) | maybeSpeak(uid, 'onDeath') |
| `death-bounty` | Bounty drop | done-existing | A: A log bounces out (live) | bounty → itemDropVfx |
| `death-collapse-in` | Row closes the gap | done-existing | A: The row closes the gap (Flip) | collapseIn → Flip glide + .collapse-landed |
| `death-revive-save` | Revive saves it from death | done-existing | A: Pillar of light lifts it back (live) | revive → SkillFX.reviveRise |
| `death-lethal-number` | Killing blow number | variants | A: Number slammed with ✖ / B: "KO!" burst / C: A red ✖ alone | deathVfx → hooks.deathLook add-on: the last blow's number (A) — game uses A; B and C are alternatives |
| `death-ghost` | Ghost fades out | future (lab concept) | A: Turns see-through and drifts up | future |
| `death-dragon` | Dragon falls | future (lab concept) | A: Crashes down, scales scatter, a scale drops | future |
| `death-supreme` | Supreme beast defeated | future (lab concept) | A: Prismatic burst in slow motion | future |
| `death-slime-split` | Slime splits on death | future (lab concept) | A: Sags into a blob that splits in two | future |

### Castle

| id | name | status | lab variants | in game |
|---|---|---|---|---|
| `castle-hit` | Castle hit | done-existing | A: Shake, burst, rumble (live) | existing: hitHQ → hqHitBigVfx |
| `castle-hp-number` | Castle HP number tick | done-existing | A: The HP number ticks (game CSS) | existing: displayHqDamage → .bf-hp.is-hit |
| `castle-crack-1` | Castle crack stage 1 (≤66% HP) | variants | A: Drunken-miner cracks (ProcFX) / B: CSS crack overlay (older look) / C: Hummingbird nest: woven twigs snap (FX.C) |  — A (ProcFX cracks, live) and B registered by _existing.js; C (Hummingbird nest snaps) is a lab concept for faction castles |
| `castle-crack-2` | Castle crack stage 2 (≤33% HP) | done-existing | A: Second stage (ProcFX) |  — registered by _existing.js |
| `castle-crack-3` | Castle crack stage 3 (≤15% HP) | done-existing | A: Third stage (ProcFX) |  — registered by _existing.js |
| `castle-danger` | Castle in danger (<25%) | done-existing | A: Red edge pulse and heartbeat (game CSS) | existing: body.castle-danger (DangerPulse) + heartbeat |
| `castle-crumble` | Castle destroyed | done-existing | A: Cellular-automaton crumble (live) | castleCrumble(hqTileEl('B')) at match end — registered by _existing.js (ProcFX crumble, live at victory) |
| `castle-crumble-variants` | Castle crumble variants (collapse / sink / topple) | variants | A: Collapse / B: Sink / C: Topple |  — registered by _existing.js (SkillFX.castleCrumble A collapse / B sink / C topple); B now plays in fights when YOUR castle falls (hooks.castleFallMine) |
| `castle-regen` | Castle regenerates | new | A: Green mortar stitches knit the wall | onEvent: castleRegen {amount, perk} |
| `castle-lumber` | Castle produces Lumber (castle passive / Everbloom perk) | variants | A: A log pops out and hops to the pill / B: Everbloom perk: a blossom instead | onEvent: lumber {castle | perk} |
| `castle-ballista` | Castle ballista bolt | new | A: Bronze bolt from the fort wall | onEvent: statusFx castleBolt, then the castle's hit → the bolt lands with it |
| `castle-thorns` | Thorn Cage cuts an attacker | new | A: A bramble lashes the attacker | onEvent: statusFx castleThorns |
| `castle-herb-heal` | Herb Refinery heals | new | A: Green steam drifts to the hurt ally | onEvent: statusFx herbHeal |
| `castle-herb-bane` | Herb Refinery bitter brew | new | A: A bitter flask splashes the enemy | onEvent: statusFx herbBane, then the castle's poison hit → the flask lands with it |
| `castle-spawn` | Units pour out of the castle | new | A: The gate swings open, a unit marches out | onEvent: statusFx castleSpawn (+ the plays just before it) |
| `castle-logjam` | Logjam holds up a unit | new | A: Logs tumble and stack in front | onEvent: statusFx logjam (after the play lands) |
| `castle-speech` | Castle speech bubble | variants | A: Stone-framed bubble, the castle hops / B: Before: the units' bubble | maybeSpeakHQ → fxHook('castleSpeech') replaces the units' bubble |
| `castle-friendly-hit` | Your own boomerang hits your castle | new | A: Sheepish wobble, sweat drop, "Oops!" | onEvent: hitHQ {friendly} (your own boomerang) |
| `castle-shield` | Castle shield (raid Core / skirmish Shield) | variants | A: Hex dome flickers and ripples / B: The dome shatters | onEvent: hitHQ on a castle with Skirmish Armour (B when that hit breaks it) |
| `castle-enemy-leader-banner` | Enemy leader banner | variants | A: The callout unfurls like a banner / B: Before: it just appears | onEvent: play {leader} → the game's .leader-callout unfurls |
| `castle-skin-future` | Castle looks per faction | future (lab concept) + variants | A: Otter river fort (palisade, river) / B: Hummingbird cliff nest / C: Hive mound | future — concept skins A otter fort / B hummingbird nest / C hive |

### Summons, spawns and hatching

| id | name | status | lab variants | in game |
|---|---|---|---|---|
| `sum-hand-play` | Card played from hand | done-existing | A: Lands with a gold ring and sparks (game CSS) | existing: play → entrance + playLandingImpact + playHandSummonGlow |
| `sum-enemy-play` | Enemy plays a card | variants | A: Flies in face down, flips face up / B: Before: the fly-in only | onEvent: play {side:'B'} (not leader / reserve) — a card back flips off as it flies in |
| `sum-reserve` | Played into a reserve row | new | A: Settles in behind the line, dimmed | onEvent: play {reserve} |
| `sum-advance` | Reserve unit steps up | new | A: Dust kick, speed lines, a hop and a squash | onEvent: advance {from, to} |
| `sum-big-arrival` | Huge unit arrives (>20 HP) | done-existing | A: The field shakes as it lands (live shake) | existing: battlefieldShake on play/spawn/hatch with maxHp > 20 |
| `sum-leader` | Leader summoned | done-existing | A: Pillar, crown, ring shockwave (live) | existing: play {leader} → leaderThroneVfx |
| `sum-enemy-leader` | Enemy leader summoned | done-existing | A: Crimson pillar, drum (live) | existing: play {leader} side B → leaderThroneVfx {enemy} |
| `sum-gladiator` | Gladiator leader enters | new | A: Arena sand burst, petals, the crowd roars | onEvent: play {leader, gladiator} |
| `sum-boss-entrance` | Boss entrance | done-existing | A: Quake, dust ring, "BOSS" title (live) | existing: versus opener closes on a boss node → bossEntrance |
| `sum-trigger-spawn` | Spawned by a trigger / action | variants | A: Green rune portal (live) / B: Ashen Choir red rune / C: Otter teal and bronze rune | existing: spawn {cause:'triggerSpawn'} → SkillFX.summonPortal (A) — A is the live green portal; B/C archetype colours (FX.C.runePortal), lab only |
| `sum-on-death-spawn` | Progeny / On Death spawn | done-existing | A: Jumps out of the fallen card (live portal) | existing: spawn {cause:'onDeathSpawn'} → entrance from the dying card + summonPortal |
| `sum-meiosis` | Meiosis split | variants | A: One cell pinches into two / B: Before: a portal on each half | onEvent: spawn {kind:'meiosis'} (the green portal is skipped for it) |
| `sum-on-attacked` | Spawn on being attacked (Bee Drone) | done-existing | A: Bouncy bee landing (game CSS) | existing: spawn {cause:'onAttackedSpawn'} → playBeeSpawnLanding |
| `sum-twin` | Twin appears beside it | variants | A: A mirror copy peels off / B: Before: the green portal | onEvent: spawn {kind:'twin'} (the green portal is skipped for it) |
| `sum-brood` | Brood | done-existing | A: Green rune portal (live) | existing: spawn {kind:'brood'} → SkillFX.summonPortal |
| `sum-skyfall` | Skyfall crash-down | new | A: Shadow grows, crash, dust ring | onEvent: play / spawn of a Skyfall card → SkillFX.skyDrop |
| `sum-castle-spawn` | Units come out of the castle | variants | A: Out through the gate / B: Before: a portal on each | onEvent: statusFx castleSpawn → gate opens, each new unit marches out |
| `sum-remember` | Returns from Exile (Remember) | variants | A: Rises out of candle smoke / B: Before: the "+N/+N" float | onEvent: remember {uid} |
| `sum-hatch-battle` | Egg card hatches in battle | done-existing | A: Shell halves fly, "🐣 Hatched!" (live) | existing: hatch → eggCrackVfx + .egg-hatched + unlockChime |
| `sum-egg-idle` | Egg card waiting on the board | new | A: Wobbles; cracks grow each tick | onEvent: play / waitTick of an egg card (cracks grow as Wait drops) |
| `sum-structure` | Structure placed | variants | A: Beaver timber scaffold rises / B: Ant mound heaps up, acid lamps | onEvent: play of a Structure card (B for ant/insect structures) — game: A for beaver/timber structures, B for ant/insect structures |
| `sum-mind-control-arrive` | Stolen unit lands on your side | new | A: Violet spiral, it becomes yours | onEvent: mindControl (after the re-render) |
| `sum-devilry-drop` | Dark Summon dropped onto a unit | new | A: A hellish crack opens under it | onEvent: sacrifice (a Dark Summon dropped onto a unit) |
| `sum-seen-new` | New enemy card first seen | done-existing | A: "New" tag on a first-seen enemy (game CSS) | existing: .seen-new tag (matchState.newSeenUntil) |
| `sum-sprout-token` | Sprout N: Growth Sprout tokens sprout | variants | A: A seed pops from the soil, two leaves unfurl / B: Before: the green portal | onEvent: spawn {kind:'sprout'} (the green portal is skipped for it) |
| `sum-rooted-veggie` | Rooted Wild Veggie takes root | future (lab concept) | A: Roots burrow into the felt | future |
| `sum-dragon` | Dragon summoned | future (lab concept) | A: Sky darkens, wing shadow, roar, crash | future |
| `sum-supreme` | Supreme beast arrives | future (lab concept) | A: Prismatic shockwave | future |
| `sum-wandering-mage` | Wandering Mage joins (Map 51) | future (lab concept) | A: A wizard-cat in a puff of stars | future |
| `sum-drones-enemy-field` | Drones / golems summoned onto the enemy field | future (lab concept) | A: Drones drop onto their field | future |

## Quality pass (2026-10-15)

Watched in Playwright (frames every ~40–150 ms at 0.25–0.35×, contact sheets in the scratchpad `fx-c/`). Fixed after watching:
- lightning A charred the card to a black slab → scorched brown with an ember rim; wither A / irradiation A went fully black → readable dark washes;
- drowning A: the CSS wave read as a blue box → an SVG curling wave with a white foam lip that rolls over and carries the card off;
- coin flip: the 3D rotateX smeared into a diagonal streak → a flat flip (scaleY follows the spin), lands on ⚡ / ★;
- foil peel: the sheet swung toward the viewer and skewed across the row → it lifts, tips back and flutters away;
- castle gate doors and the foil sheet were skewed (perspective applied after a page-sized translate) → placed by left/top;
- mirror/sheen sweeps (twin, gilded, acid fizz) slid outside the card → the gradient moves inside the face;
- chips are clamped on screen (castles sit in the corners); the boss title scales down at phone width;
- the boss and King deaths now animate a fixed copy, so the replay removing the slot (0.9 s) can't cut them short.
- All 162 batch-C variants play with 0 console errors and leave nothing behind (checked at 2× and 1×).

