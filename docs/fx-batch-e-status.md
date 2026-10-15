# FX batch E status: conquest map and world ambience (2026-10-15)

Batch E of the effects sweep (`docs/effects-lab-contract.md`, `docs/effects-inventory-2026-10-15.json`): **168 entries, all 168 registered in the Effects Lab with a working demo, 214 variants in all.**
Code: `bramblewood-fx-e.js` (`window.FX.E`). Lab registrations: `tools/effects-lab/manifest/e.js`.

| Status | Count | Meaning |
|---|---|---|
| done-existing | 82 | the game's own effect (shader, CSS, existing function) was already good; the lab demos it as the game plays it |
| new | 49 | built in this batch, one look |
| variants | 26 | built in this batch with 2–3 (up to 5) takes side by side; the game uses A unless noted |
| future | 11 | `future: true`: a lab concept, no game hook yet |

## What the game now does (hooks)

All gated by `fxHook` / `fxBatchVfx` (skipped under reduced motion or Effects "none"); heavy looks need Effects Medium or High.

- `renderConquestSubTab` → `fxHook('mapShown', host, map, canvas, progress)` → `FX.E.hooks.mapShown`:
  - **Map ambience** for the ten maps that needed a look of their own (canvas layer over the map art, ~30 fps, pauses off screen):
    Bramblewood Outskirts / Map 0 (`m1`) gets drifting **mist banks and dew** instead of the savanna heat shimmer (old shader layer hidden there);
    Gannet Cliffs (`mc`) gets **gulls riding the wind, sea spray thrown up the cliff and wind streaks** instead of the beach foam;
    and the eight maps that had nothing: The Old Bramble (`mo`, moss beams and spores), Clovermead (`mq`, bees and petals), The Sunken Grove (`ms`, water fog, fireflies, rings),
    The Mycelium Deep (`mz`, glowing threads, spores, breathing caps), The Glimmer Depths (`mn`, prism crystal glints and the campfire's warm pool),
    The Ice Hollow (`mi`, blue refraction, drips, frost), The Aerie Vault (`mv`, wind streaks, tumbling feathers) and Volcano Lair (`mx`, breathing lava light, embers, red lightning).
    Every other map keeps its shader (it already fit), so all 37 maps and side maps have ambience.
  - **Time of day** grading (dusk / night / dawn from the player's clock; dark maps keep their own look); **weather fronts** now and then on open-sky maps (Effects High, at most every 4 min).
  - **Node states**: every open fight beckons (soft ring), locked fights are held by brambles, boss nodes breathe red with a heartbeat (world bosses smoke), raid nodes sway tentacles, dungeon nodes swirl a dark doorway between torches, elite nodes get a laurel ring; curiosities get an idle of their own.
  - **Coming back from a fight** (compared with what this map showed last view this session, deferred until the map is actually in front): the cleared fight is **stamped with a wax seal** (rank in the wax, leaf burst) and its rank chip pops, the **trail to the next fight draws itself** with a bright nib, a newly found chance fight pops out of rustling bushes, a Dragon Scale glints, a late side map surfaces, the **whole map cleared** celebration plays (art brightens, banner, the biome's critters gather, petals), and the next map's edge opens with a dotted trail and "New map!". Big jumps (more than 4 new clears at once, e.g. admin unlocks) are skipped.
- `activateSpot` (first visit) → `fxHook('mapSpotUnlock', spotEl, key)`: each feature spot opens its own way: the spot's icon lifts off the map, then its opener plays (Camp: tent flaps part; Nest on Map 4: twigs fly out and down drifts in; the Forge: a hearth flare and sparks; Notices: papers pinned up one by one; the Cart: the awning rolls and a bell rings; books, compasses, banners, a gate, mugs, ghost cards and so on for all 20 spots). It plays over the next screen, since the game switches to the new place at once.
- `visitCuriosity` (first visit) → `fxHook('mapCurioVisit')`: the "found!" hop and sparkle.
- `placeMapPawn` → `fxHook('mapPawnWalk', pawn, legs)`: footprints and dust on every hop of the pawn's walk.
- `renderConquestWorld` → `fxHook('mapWorldShown')`: fog peels off a newly reachable map on the world atlas.
- `rollDragonScale` → `fxHook('dragonScaleFound')`: the scale flips up over the results (n/10).
- `openQuestsModal` → `fxHook('questBoardOpen')`: pinned notices lift in the draught, corners curl.
- `openTavern` → `fxHook('tavernOpen')`: hearth glow, two mugs clink.

## Future lands (the roadmap by biome, lab concepts)

Abyssal Plains (Map 29: pitch black, bioluminescence, a lure / jellyfish), the Dragonic Spire (red lightning, wither smoke / wyverns), the Floodplains (rise and recede; C: the
roadmap's full Flooded → Receded → Parched loop), Wild Veggies (Maps 20+), Maps 40+ dinosaurs (fern steam, a far volcano, pterosaurs, footfalls ringing the puddles),
Maps 45+ aliens (a saucer beam sweeping the fields), Maps 50+ magic (rune circles, arcane aurora) and Maps 50–60 Syzygy (an eclipse over a high tide). Plus ant
acid-battery lampposts, otter roads and forts, hummingbird cliffs, the Arena as a real arena, the raid splash parallax, atmosphere packs (grain / CRT / rain on glass) and
an ink-wash transition.

## Checks

- Lab: all 168 ids registered, 0 catalogue problems; every variant played at 4× with 0 console errors and nothing left on `<body>` (one shader demo, `amb-battle-map-terrain`, runs to the lab's 12 s cap under software GL).
- Frames watched at 1280 px and 390 px; representative frames in the session scratchpad `fx-e/`.
- Game: `tests/card-matrix.js --update` 0 failures, 0 golden diffs. `tests/run-all.sh`: every suite passes except autobattle's speed floor
  ("fights are too slow", 3–4.9 fights/s against 9) on a 2-core box at load average 11–16 with five other batches running; batch E does not touch the
  engine or the autobattler. `tests/e2e/ui_smoke.py`: 0 failures once the page could load (its 30 s `goto` timed out under the same load; the main
  checkout's page took as long, ~45–50 s with software WebGL).

## Every entry

| id | name | status | lab variants | where it fires in the game |
|---|---|---|---|---|
| `map-amb-m1` | Map ambience: Bramblewood Outskirts (m1) | variants | A: Misty meadow: mist banks and dew; B: Thick fog that thins and thickens; C: Before: the shared shader (savanna heat shimmer) | hooks.mapShown → FX.E.mapAmbience(host, 'm1') (a canvas layer on the map frame; hides the old shader layer) |
| `map-amb-mtut` | Map ambience: Tutorial (mtut) | done-existing | A: The map shader on its art (live) | renderConquestSubTab → mountMapShader(host, 'mtut') (shader kind 4) |
| `map-amb-mo` | Map ambience: The Old Bramble (mo) | variants | A: Old wood: moss-green beams and drifting spores; B: Ancient fireflies and falling leaves | hooks.mapShown → FX.E.mapAmbience(host, 'mo') (a canvas layer on the map frame) |
| `map-amb-mf` | Map ambience: Thistlewood (mf) | done-existing | A: The map shader on its art (live) | renderConquestSubTab → mountMapShader(host, 'mf') (shader kind 0) |
| `map-amb-mq` | Map ambience: Clovermead (mq) | variants | A: Clover meadow: bees and drifting petals; B: Clover leaves and golden pollen | hooks.mapShown → FX.E.mapAmbience(host, 'mq') (a canvas layer on the map frame) |
| `map-amb-mb` | Map ambience: Pebble Beach (mb) | done-existing | A: The map shader on its art (live) | renderConquestSubTab → mountMapShader(host, 'mb') (shader kind 12) |
| `map-amb-mp` | Map ambience: Lilypad Reach (mp) | done-existing | A: The map shader on its art (live) | renderConquestSubTab → mountMapShader(host, 'mp') (shader kind 1) |
| `map-amb-mg` | Map ambience: Smugglers' Grotto (mg) | done-existing | A: The map shader on its art (live) | renderConquestSubTab → mountMapShader(host, 'mg') (shader kind 3) |
| `map-amb-mc` | Map ambience: Gannet Cliffs (mc) | variants | A: Sea cliffs: gulls, spray, wind; B: Squall: driving spray and white caps of mist; C: Before: the shared shader (beach foam) | hooks.mapShown → FX.E.mapAmbience(host, 'mc') (a canvas layer on the map frame; hides the old shader layer) |
| `map-amb-m2` | Map ambience: Sunken Hollow (m2) | done-existing | A: The map shader on its art (live) | renderConquestSubTab → mountMapShader(host, 'm2') (shader kind 1) |
| `map-amb-mw` | Map ambience: Gatorback Swamp (mw) | done-existing | A: The map shader on its art (live) | renderConquestSubTab → mountMapShader(host, 'mw') (shader kind 7) |
| `map-amb-ms` | Map ambience: The Sunken Grove (ms) | variants | A: Sunken grove: water fog, fireflies, rings; B: Moonlit grove: blue wash and glints | hooks.mapShown → FX.E.mapAmbience(host, 'ms') (a canvas layer on the map frame) |
| `map-amb-m8` | Map ambience: Sable Swampmire (m8) | done-existing | A: The map shader on its art (live) | renderConquestSubTab → mountMapShader(host, 'm8') (shader kind 7) |
| `map-amb-mu` | Map ambience: The Morel Hollow (mu) | done-existing | A: The map shader on its art (live) | renderConquestSubTab → mountMapShader(host, 'mu') (shader kind 0) |
| `map-amb-mz` | Map ambience: The Mycelium Deep (mz) | variants | A: Mycelium: glowing threads, spores, breathing caps; B: Spore puffs from the caps | hooks.mapShown → FX.E.mapAmbience(host, 'mz') (a canvas layer on the map frame) |
| `map-amb-m4` | Map ambience: Caves & Alcoves (m4) | done-existing | A: The map shader on its art (live) | renderConquestSubTab → mountMapShader(host, 'm4') (shader kind 3) |
| `map-amb-mn` | Map ambience: The Glimmer Depths (mn) | variants | A: Crystal glints and a campfire pool; B: Cold crystal hum: violet and cyan pulses | hooks.mapShown → FX.E.mapAmbience(host, 'mn') (a canvas layer on the map frame) |
| `map-amb-mk` | Map ambience: The Kelp Mangroves (mk) | done-existing | A: The map shader on its art (live) | renderConquestSubTab → mountMapShader(host, 'mk') (shader kind 6) |
| `map-amb-m7` | Map ambience: Coral Current (m7) | done-existing | A: The map shader on its art (live) | renderConquestSubTab → mountMapShader(host, 'm7') (shader kind 6) |
| `map-amb-mj` | Map ambience: The Sunken Depths (mj) | done-existing | A: The map shader on its art (live) | renderConquestSubTab → mountMapShader(host, 'mj') (shader kind 6) |
| `map-amb-m10` | Map ambience: Eyrie Heights (m10) | done-existing | A: The map shader on its art (live) | renderConquestSubTab → mountMapShader(host, 'm10') (shader kind 9) |
| `map-amb-mv` | Map ambience: The Aerie Vault (mv) | variants | A: Eyrie: wind streaks and tumbling feathers; B: Gusts and eagles circling high | hooks.mapShown → FX.E.mapAmbience(host, 'mv') (a canvas layer on the map frame) |
| `map-amb-mh` | Map ambience: The Briar Maze (mh) | done-existing | A: The map shader on its art (live) | renderConquestSubTab → mountMapShader(host, 'mh') (shader kind 4) |
| `map-amb-mr` | Map ambience: The Redwood Deep (mr) | done-existing | A: The map shader on its art (live) | renderConquestSubTab → mountMapShader(host, 'mr') (shader kind 0) |
| `map-amb-m5` | Map ambience: Savanna Reaches (m5) | done-existing | A: The map shader on its art (live) | renderConquestSubTab → mountMapShader(host, 'm5') (shader kind 4) |
| `map-amb-my` | Map ambience: The Canopy (my) | done-existing | A: The map shader on its art (live) | renderConquestSubTab → mountMapShader(host, 'my') (shader kind 0) |
| `map-amb-ml` | Map ambience: The Long Grass (ml) | done-existing | A: The map shader on its art (live) | renderConquestSubTab → mountMapShader(host, 'ml') (shader kind 4) |
| `map-amb-mt` | Map ambience: The Pinewood Taiga (mt) | done-existing | A: The map shader on its art (live) | renderConquestSubTab → mountMapShader(host, 'mt') (shader kind 5) |
| `map-amb-m6` | Map ambience: Wolfsbane Tundra (m6) | done-existing | A: The map shader on its art (live) | renderConquestSubTab → mountMapShader(host, 'm6') (shader kind 5) |
| `map-amb-mi` | Map ambience: The Ice Hollow (mi) | variants | A: Ice cave: blue refraction, drips, frost; B: Frost dust swirling and ice glints | hooks.mapShown → FX.E.mapAmbience(host, 'mi') (a canvas layer on the map frame) |
| `map-amb-md` | Map ambience: The Glass Dunes (md) | done-existing | A: The map shader on its art (live) | renderConquestSubTab → mountMapShader(host, 'md') (shader kind 4) |
| `map-amb-m3` | Map ambience: Ashen Spurn (m3) | done-existing | A: The map shader on its art (live) | renderConquestSubTab → mountMapShader(host, 'm3') (shader kind 2) |
| `map-amb-m9` | Map ambience: Basalt Foundry (m9) | done-existing | A: The map shader on its art (live) | renderConquestSubTab → mountMapShader(host, 'm9') (shader kind 8) |
| `map-amb-m11` | Map ambience: The Sundered Peak (m11) | done-existing | A: The map shader on its art (live) | renderConquestSubTab → mountMapShader(host, 'm11') (shader kind 10) |
| `map-amb-me` | Map ambience: Eye of the Volcano (me) | done-existing | A: The map shader on its art (live) | renderConquestSubTab → mountMapShader(host, 'me') (shader kind 10) |
| `map-amb-mx` | Map ambience: Volcano Lair (mx) | variants | A: Dragon lair: breathing lava light, red lightning; B: Dragon breath sweeps the roof, heat haze | hooks.mapShown → FX.E.mapAmbience(host, 'mx') (a canvas layer on the map frame) |
| `map-amb-m21` | Map ambience: The Quiet Summit (m21) | done-existing | A: The map shader on its art (live) | renderConquestSubTab → mountMapShader(host, 'm21') (shader kind 9) |
| `map-movers-forest` | Map critters: forest | done-existing | A: 🦋 butterflys hop from plant to plant (as startMapMovers) | startMapMovers(canvas, map, decor): biome forest |
| `map-movers-water` | Map critters: water | done-existing | A: 🐟 fishs hop from plant to plant (as startMapMovers) | startMapMovers(canvas, map, decor): biome water |
| `map-movers-ash` | Map critters: ash | done-existing | A: 🔥 fireflys hop from plant to plant (as startMapMovers) | startMapMovers(canvas, map, decor): biome ash |
| `map-movers-cave` | Map critters: cave | done-existing | A: 🦇 bats hop from plant to plant (as startMapMovers) | startMapMovers(canvas, map, decor): biome cave |
| `map-movers-savanna` | Map critters: savanna | done-existing | A: 🦋 butterflys hop from plant to plant (as startMapMovers) | startMapMovers(canvas, map, decor): biome savanna |
| `map-movers-tundra` | Map critters: tundra | done-existing | A: 🐦 birds hop from plant to plant (as startMapMovers) | startMapMovers(canvas, map, decor): biome tundra |
| `map-movers-reef` | Map critters: reef | done-existing | A: 🐠 fishs hop from plant to plant (as startMapMovers) | startMapMovers(canvas, map, decor): biome reef |
| `map-movers-swamp` | Map critters: swamp | done-existing | A: ✨ fireflys hop from plant to plant (as startMapMovers) | startMapMovers(canvas, map, decor): biome swamp |
| `map-movers-forge` | Map critters: forge | done-existing | A: 🔥 fireflys hop from plant to plant (as startMapMovers) | startMapMovers(canvas, map, decor): biome forge |
| `map-movers-alpine` | Map critters: alpine | done-existing | A: 🦅 birds hop from plant to plant (as startMapMovers) | startMapMovers(canvas, map, decor): biome alpine |
| `map-movers-meadow` | Map critters: meadow | done-existing | A: 🐝 butterflys hop from plant to plant (as startMapMovers) | startMapMovers(canvas, map, decor): biome meadow |
| `map-movers-beach` | Map critters: beach | done-existing | A: 🦀 fishs hop from plant to plant (as startMapMovers) | startMapMovers(canvas, map, decor): biome beach |
| `map-decor-static` | Living decor (trees, plants, props) | done-existing | A: Seeded trees and plants, clear of fights and trails | generatedMapDecor (drawn when a map has no painted art) |
| `map-snails` | Snails creep on cave maps | done-existing | A: A snail creeps, leaving faint blue trails (sped up 20×) | startMapAdornments on cave maps |
| `map-crystal-sparkle` | Crystals in the art sparkle | done-existing | A: Crystals in the art sparkle now and then | startMapAdornments (crystal pixels found by colour) |
| `map-predator-eyes` | Predator eyes in the dark | done-existing | A: Eyes glint in the dark and blink | startMapAdornments on dark maps, away from the lantern |
| `map-cave-dark` | Cave map darkness + pointer lantern | done-existing | A: Dark veil with a lantern that follows the pointer | mountCaveDark (cave maps) |
| `map-cave-light-spread` | Cave cleared: the light spreads | done-existing | A: Light spreads out, then settles into the lantern | caveLightSpread after the loading card lifts on a cave map |
| `map-dark-cleared` | Dark map cleared tint | done-existing | A: A cleared dark map lifts and glows warm | renderConquestSubTab: .conquest-layout.dark-cleared |
| `map-veil` | Map loading veil | done-existing | A: The map's name card, then it lifts | showMapVeil until the shader draws its first frame |
| `map-nodes-drop` | Skirmishes drop in from the sky (first view) | done-existing | A: Fights drop in from the sky |  |
| `map-node-available` | Next fight available | variants | A: A soft ring beckons outward; B: A bobbing gold chevron above it | hooks.mapShown → FX.E.decorateNodes: every open fight |
| `map-node-locked` | Locked fight | variants | A: Brambles hold it shut; the padlock glints; B: Mist wisps drift round it | hooks.mapShown → FX.E.decorateNodes: locked fights |
| `map-node-cleared` | Fight cleared (returning to the map) | variants | A: Wax seal stamps it (rank in the wax), leaf burst; B: An ink tick, quickly drawn, with a spatter | hooks.mapShown: a fight that turned .done since the last view (deferred until the map is in front) |
| `map-node-rank` | Rank shown on a cleared node | variants | A: S rank: gold chip pops and shines; B: SSS: prismatic; C: A: silver, quieter | hooks.mapShown: after the seal, the rank you earned (progress.ranks) |
| `map-trail-unlock` | Trail to the next fight unlocks | variants | A: Ink line draws itself, a bright nib leads; B: Footprints walk the new path; C: A firefly flies it and lights the fight | hooks.mapShown: a fight newly visible since the last view → the trail line into it |
| `map-pawn-hop` | Pawn hops node to node | done-existing | A: Hops to the next fight (as placeMapPawn) | placeMapPawn on picking another fight |
| `map-pawn-walk` | Pawn walks the dotted path | new | A: Walks the trail, leaving footprints and dust | placeMapPawn → fxHook('mapPawnWalk', pawn, legs): footprints and dust on every hop of the walk |
| `map-pawn-dropin` | Pawn drops in on a new map | done-existing | A: Grows out of a point, hops down with a squash (as mapPawnDropIn) | mapPawnDropIn on arriving at a map |
| `map-travel` | Map-to-map travel | done-existing | A: Slides in from the next map | conquestPanTo → .conquest-main.world-in-left/right |
| `map-world-zoom` | Map ↔ World zoom | done-existing | A: Zooms out to the world, back in to a map | openConquestWorld (.world-zoom-out / .world-zoom-in) |
| `map-world-here` | World map: you are here | done-existing | A: "You are here" ring breathes on the current map | renderConquestWorld: .world-stop.is-here |
| `map-world-fog` | World map: unseen map in fog | new | A: Fog peels back, the diamond unrolls | hooks.mapWorldShown: a map open since the last world view |
| `map-world-compass` | World home compass | done-existing | A: The Home compass turns (60 s a turn; sped up here) | renderConquestWorld: .world-home .wh-compass |
| `map-submap-enter` | Zoom into a sub-map (cave mouth) | done-existing | A: The map dives into the entrance, the side map grows out | enterSubMap (map zooms into the entrance; a dark side map closes an iris) |
| `map-submap-leave` | Leave a sub-map | done-existing | A: Quick pull-back to the parent map | leaveSubMap |
| `map-submap-emblem` | Sub-map entrance emblem | done-existing | A: Side-map emblem bobs and glows | subMapEntrancesHTML (.map-subemblem / .map-subcave) |
| `map-cleared` | Whole map cleared | variants | A: Art brightens, banner unfurls, critters gather, petals fly; B: Paper lanterns rise off every fight | hooks.mapShown: conquestMapCleared(map) became true since the last view |
| `map-next-unlocked` | Next map unlocked | new | A: A dotted trail runs to the edge; "New map!" | hooks.mapShown: the right-hand world edge opened since the last view |
| `map-ambush-node` | Ambush node appears | done-existing | A: An ambush pops onto the map (game CSS) | applyAmbushNode → .map-node.ambush-pop |
| `map-chance-node` | Chance fight found | new | A: Bushes rustle, the fight pops up | hooks.mapShown: a chance fight found since the last view |
| `map-late-side-map` | Late side map arrives (days later / after a quest) | new | A: The entrance surfaces with a dust ring | hooks.mapShown: a side-map entrance opened since the last view (afterDays / quest) |
| `map-boss-node` | Boss / final boss / world boss node | variants | A: Red breath and a heartbeat, embers rising; B: Smoke curls off it (world bosses); C: War pennants either side | hooks.mapShown → FX.E.decorateNodes (boss kinds; world/final bosses take B) |
| `map-raid-node` | Raid boss node | new | A: Tentacles sway behind it, a glint | hooks.mapShown → FX.E.decorateNodes (raidboss, megaraid, worldboss) |
| `map-dungeon-node` | Dungeon / endless node | new | A: A dark doorway swirls, two torches flicker | hooks.mapShown → FX.E.decorateNodes (dungeon kind, endless maps) |
| `map-elite-node` | Elite / champion node | new | A: A slow laurel ring and a star glint | hooks.mapShown → FX.E.decorateNodes (elite, champion) |
| `map-tutorial-reveal` | Tutorial node reveal | done-existing | A: Tutorial beacon; trail and camp fade in | tutorial-solo.is-next + .tut-reveal |
| `map-leaves-reveal` | Leaves part to reveal the map (end of the tutorial) | done-existing | A: A gust of leaves sweeps the map open | leavesRevealToMap (end of the tutorial) |
| `map-dragon-scale-node` | Dragon Scale glint on a node | done-existing | A: Something glints on the fight (game CSS) | renderConquestSubTab: .map-node-scale on a node that hides a scale |
| `map-dragon-scale-found` | Dragon Scale found | new | A: The scale flips up, red glint, 2/10 → 3/10 | rollDragonScale → fxHook('dragonScaleFound', {index, total}) over the results |
| `map-spot-deck` | Feature spot unlock: Camp (Armoury) | variants | A: ⛺ lifts off the map and opens (tent); B: The same, played on the spot itself (smaller) | activateSpot (first visit) → fxHook('mapSpotUnlock', spotEl, 'deck') |
| `map-spot-nest` | Feature spot unlock: Nest | new | A: 🪺 lifts off the map and opens (nest) | activateSpot (first visit) → fxHook('mapSpotUnlock', spotEl, 'nest') |
| `map-spot-quests` | Feature spot unlock: Notices | new | A: 📜 lifts off the map and opens (papers) | activateSpot (first visit) → fxHook('mapSpotUnlock', spotEl, 'quests') |
| `map-spot-shop` | Feature spot unlock: Traveller's Cart | new | A: 🛒 lifts off the map and opens (awning) | activateSpot (first visit) → fxHook('mapSpotUnlock', spotEl, 'shop') |
| `map-spot-forge` | Feature spot unlock: The Forge | new | A: 🔨 lifts off the map and opens (forge) | activateSpot (first visit) → fxHook('mapSpotUnlock', spotEl, 'forge') |
| `map-spot-codex` | Feature spot unlock: Codex | new | A: 📖 lifts off the map and opens (book) | activateSpot (first visit) → fxHook('mapSpotUnlock', spotEl, 'codex') |
| `map-spot-arena` | Feature spot unlock: The Arena | new | A: 🏟️ lifts off the map and opens (banners) | activateSpot (first visit) → fxHook('mapSpotUnlock', spotEl, 'arena') |
| `map-spot-questboard` | Feature spot unlock: Quest Board (errands) | new | A: 📌 lifts off the map and opens (pin) | activateSpot (first visit) → fxHook('mapSpotUnlock', spotEl, 'questboard') |
| `map-spot-raid` | Feature spot unlock: Raid Banner | new | A: 🐲 lifts off the map and opens (raidbanner) | activateSpot (first visit) → fxHook('mapSpotUnlock', spotEl, 'raid') |
| `map-spot-wanderer` | Feature spot unlock: Wanderer's Camp | new | A: 🧭 lifts off the map and opens (compass) | activateSpot (first visit) → fxHook('mapSpotUnlock', spotEl, 'wanderer') |
| `map-spot-tavern` | Feature spot unlock: The Tavern | new | A: 🍺 lifts off the map and opens (mugs) | activateSpot (first visit) → fxHook('mapSpotUnlock', spotEl, 'tavern') |
| `map-spot-gauntlet` | Feature spot unlock: Gauntlet Gate | new | A: 🏅 lifts off the map and opens (gate) | activateSpot (first visit) → fxHook('mapSpotUnlock', spotEl, 'gauntlet') |
| `map-spot-autobattle` | Feature spot unlock: Whisper's Game | new | A: 🧩 lifts off the map and opens (ghostcards) | activateSpot (first visit) → fxHook('mapSpotUnlock', spotEl, 'autobattle') |
| `map-spot-skillcodex` | Feature spot unlock: Skill Codex | new | A: 📘 lifts off the map and opens (book) | activateSpot (first visit) → fxHook('mapSpotUnlock', spotEl, 'skillcodex') |
| `map-spot-mapcodex` | Feature spot unlock: Map Codex | new | A: 🗺️ lifts off the map and opens (compass) | activateSpot (first visit) → fxHook('mapSpotUnlock', spotEl, 'mapcodex') |
| `map-spot-stomp` | Feature spot unlock: Stomping Grounds | new | A: 🐾 lifts off the map and opens (stomp) | activateSpot (first visit) → fxHook('mapSpotUnlock', spotEl, 'stomp') |
| `map-spot-testlab` | Feature spot unlock: Test Lab | new | A: 🧪 lifts off the map and opens (flask) | activateSpot (first visit) → fxHook('mapSpotUnlock', spotEl, 'testlab') |
| `map-spot-market` | Feature spot unlock: Flea Market (Map 31) | new | A: 🧺 lifts off the map and opens (bunting) | activateSpot (first visit) → fxHook('mapSpotUnlock', spotEl, 'market') |
| `map-spot-fieldkit` | Feature spot unlock: The traveller's kit | new | A: 🧰 lifts off the map and opens (kit) | activateSpot (first visit) → fxHook('mapSpotUnlock', spotEl, 'fieldkit') |
| `map-spot-backpack` | Feature spot unlock: A note in your pack | new | A: 🎒 lifts off the map and opens (note) | activateSpot (first visit) → fxHook('mapSpotUnlock', spotEl, 'backpack') |
| `map-spot-new-bang` | "!" on a new spot fades after a look | done-existing | A: The "!" fades once you have looked (game CSS) | fadeNewBang |
| `map-curio-signpost` | Curiosity: signpost | new | A: Its own idle, then the "found!" hop on the first look | hooks.mapShown → FX.E.curioIdle; visitCuriosity (first visit) → fxHook('mapCurioVisit') |
| `map-curio-scarecrow` | Curiosity: scarecrow | new | A: Its own idle, then the "found!" hop on the first look | hooks.mapShown → FX.E.curioIdle; visitCuriosity (first visit) → fxHook('mapCurioVisit') |
| `map-curio-beehive` | Curiosity: beehive | new | A: Its own idle, then the "found!" hop on the first look | hooks.mapShown → FX.E.curioIdle; visitCuriosity (first visit) → fxHook('mapCurioVisit') |
| `map-curio-bottle` | Curiosity: bottle | new | A: Its own idle, then the "found!" hop on the first look | hooks.mapShown → FX.E.curioIdle; visitCuriosity (first visit) → fxHook('mapCurioVisit') |
| `map-curio-crab` | Curiosity: crab | new | A: Its own idle, then the "found!" hop on the first look | hooks.mapShown → FX.E.curioIdle; visitCuriosity (first visit) → fxHook('mapCurioVisit') |
| `map-curio-lantern` | Curiosity: lantern | new | A: Its own idle, then the "found!" hop on the first look | hooks.mapShown → FX.E.curioIdle; visitCuriosity (first visit) → fxHook('mapCurioVisit') |
| `map-curio-ashcairn` | Curiosity: ashcairn | new | A: Its own idle, then the "found!" hop on the first look | hooks.mapShown → FX.E.curioIdle; visitCuriosity (first visit) → fxHook('mapCurioVisit') |
| `map-curio-peddler` | Curiosity: peddler | new | A: Its own idle, then the "found!" hop on the first look | hooks.mapShown → FX.E.curioIdle; visitCuriosity (first visit) → fxHook('mapCurioVisit') |
| `map-curio-echo` | Curiosity: echo | new | A: Its own idle, then the "found!" hop on the first look | hooks.mapShown → FX.E.curioIdle; visitCuriosity (first visit) → fxHook('mapCurioVisit') |
| `map-curio-glowpool` | Curiosity: glowpool | new | A: Its own idle, then the "found!" hop on the first look | hooks.mapShown → FX.E.curioIdle; visitCuriosity (first visit) → fxHook('mapCurioVisit') |
| `map-curio-baobab` | Curiosity: baobab | new | A: Its own idle, then the "found!" hop on the first look | hooks.mapShown → FX.E.curioIdle; visitCuriosity (first visit) → fxHook('mapCurioVisit') |
| `map-curio-drum` | Curiosity: drum | new | A: Its own idle, then the "found!" hop on the first look | hooks.mapShown → FX.E.curioIdle; visitCuriosity (first visit) → fxHook('mapCurioVisit') |
| `map-curio-icefish` | Curiosity: icefish | new | A: Its own idle, then the "found!" hop on the first look | hooks.mapShown → FX.E.curioIdle; visitCuriosity (first visit) → fxHook('mapCurioVisit') |
| `map-curio-shell` | Curiosity: shell | new | A: Its own idle, then the "found!" hop on the first look | hooks.mapShown → FX.E.curioIdle; visitCuriosity (first visit) → fxHook('mapCurioVisit') |
| `map-curio-wreck` | Curiosity: wreck | new | A: Its own idle, then the "found!" hop on the first look | hooks.mapShown → FX.E.curioIdle; visitCuriosity (first visit) → fxHook('mapCurioVisit') |
| `map-curio-wisp` | Curiosity: wisp | new | A: Its own idle, then the "found!" hop on the first look | hooks.mapShown → FX.E.curioIdle; visitCuriosity (first visit) → fxHook('mapCurioVisit') |
| `map-curio-anvil` | Curiosity: anvil | new | A: Its own idle, then the "found!" hop on the first look | hooks.mapShown → FX.E.curioIdle; visitCuriosity (first visit) → fxHook('mapCurioVisit') |
| `map-curio-eyrie` | Curiosity: eyrie | new | A: Its own idle, then the "found!" hop on the first look | hooks.mapShown → FX.E.curioIdle; visitCuriosity (first visit) → fxHook('mapCurioVisit') |
| `map-curio-banner` | Curiosity: banner | new | A: Its own idle, then the "found!" hop on the first look | hooks.mapShown → FX.E.curioIdle; visitCuriosity (first visit) → fxHook('mapCurioVisit') |
| `map-well` | The old well | done-existing | A: Bucket swings, the water ripples (game CSS) | mapWellHTML / visitOldWell |
| `map-campfire` | Glimmer Depths campfire | done-existing | A: Flickering glow, sparks drifting up (game CSS) | mapCampfireHTML (the Glimmer Depths) |
| `map-courier` | Courier mouse with a free pack | done-existing | A: Bramble the courier mouse bobs with a pack (game CSS) | freePackCourierHTML |
| `map-wanderer` | Wandering merchant on the map | done-existing | A: A wanderer with a barrow rocks on the road (game CSS) | wandererMapHTML (some days) |
| `map-seasonal` | Seasonal vignette | done-existing | A: Spring, summer, autumn, winter vignettes | renderConquestSubTab: .season-veil.season-<month> |
| `map-day-night-tint` | Map time-of-day grading | variants | A: Dusk: amber light, lanterns lit; B: Night: blue, stars, lantern pools at the fights; C: Dawn: a rose-gold blush | hooks.mapShown → FX.E.dayNight(host, canvas, todNow()): the clock, or the Atmosphere setting (golden = dusk, moonlit = night) |
| `map-weather-fronts` | Map weather fronts (rain/snow/fog tweened) | variants | A: Rain front (green and wet maps); B: Snow front (tundra, alpine); C: Fog bank rolls through (swamp, reef); D: Ash flurry (burnt maps); E: Sand gust (savanna) | hooks.mapShown: about one map view in three (at most every 4 min, Effects High), the biome's front |
| `map-water-shimmer` | Water shimmer on map ponds/rivers | done-existing | A: Caustics and glints (live shader, Lilypad Reach) | water / coral / beach shader kinds (1, 6, 12) |
| `map-fog-misty` | Mist drifting over Map 0 | variants | A: Low mist banks drift between the fights, dew winks; B: Thick fog that breathes thick and thin | hooks.mapShown on m1 → mist ambience (the savanna shader is hidden there) |
| `map-chaos-returns` | Chaos returns (Map 40+ respawn) | future: lab concept (5 variants) | A: Map pulls back; advanced fights land with ripples; B: Concept: Map 50+ magic lands, fights rise out of rune circles; C: Concept: Maps 40+: fern steam, pterosaurs, footfalls ring the puddles; D: Concept: Maps 45+: a saucer beam sweeps the fields, green lights blink; E: Concept: Maps 50+: Syzygy, an eclipse over a high tide | future |
| `map-headline-ghost` | Map title banner ghosting | done-existing | A: The title banner steps aside when touched | GHOST_BANNERS pointer watcher (.is-away / .is-ghost) |
| `map-shader-new-fungal` | New map shader look: fungal | variants | A: Mycelium: glowing threads, spores, breathing caps; B: Spore puffs from the caps | hooks.mapShown → FX.E.mapAmbience on mz |
| `map-shader-new-dragon-lair` | New map shader look: dragon-lair | variants | A: Dragon lair: breathing lava light, red lightning; B: Dragon breath sweeps the roof, heat haze | hooks.mapShown → FX.E.mapAmbience on mx |
| `map-shader-new-ice-cave` | New map shader look: ice-cave | variants | A: Ice cave: blue refraction, drips, frost; B: Frost dust swirling and ice glints | hooks.mapShown → FX.E.mapAmbience on mi |
| `map-shader-new-crystal-cave` | New map shader look: crystal-cave | variants | A: Crystal glints and a campfire pool; B: Cold crystal hum: violet and cyan pulses | hooks.mapShown → FX.E.mapAmbience on mn |
| `map-shader-new-misty-meadow` | New map shader look: misty-meadow | variants | A: Misty meadow: mist banks and dew; B: Thick fog that thins and thickens | hooks.mapShown → FX.E.mapAmbience on m1 |
| `map-shader-new-abyssal` | New map shader look: abyssal | future: lab concept (2 variants) | A: Abyss: pitch black, bioluminescence, a lure; B: Jellyfish drift up through the dark | future |
| `map-shader-new-dragonic-spire` | New map shader look: dragonic-spire | future: lab concept (2 variants) | A: Dragonic Spire: red lightning, wither smoke; B: Wyverns circle the spires | future |
| `map-shader-new-floodplains` | New map shader look: floodplains | future: lab concept (3 variants) | A: Floodplains: the water rises and recedes; B: Concept: Wild Veggies: soil steam, pollen, seeds popping; C: Floodplains loop: Flooded, Receded, Parched, Flooded | future |
| `amb-home-splash` | Splash / entrance | done-existing | A: The painted splash through the scene shader (sway, ripple, bloom, shafts, fireflies) | entrance: mountSceneShader |
| `amb-home` | Home screen | done-existing | A: The scene shader with tonight's tint (clock) | Home: depth parallax + live clock tint + CalmMusic |
| `amb-leaf-sweep` | In-world transition leaf sweep | done-existing | A: A gust of leaves sweeps across (game CSS) | tab change: .leaf-sweep |
| `amb-armoury` | Armoury Tent (deck builder) | done-existing | A: Tent flaps part (game CSS) | enter Deck: .tent-flaps |
| `amb-shop` | Traveller's Cart (Shop) | done-existing | A: The awning rolls up (game CSS) | enter Shop: .cart-awning |
| `amb-nest` | Old Nest | done-existing | A: Down drifts in (game CSS) | enter Nest: .nest-down |
| `amb-forge` | Forge | done-existing | A: Hearth flares, sparks rise (game CSS) | enter Forge: .forge-flare + .forge-sparks |
| `amb-codex` | Codex | done-existing | A: The page swings in like a book (as the Codex) | Codex section change: page turn |
| `amb-quests` | Notice Board (Quests) | new | A: Pinned papers lift in the draught; corners curl | openQuestsModal → fxHook('questBoardOpen', modal, opening) |
| `amb-arena` | The Arena as a real arena | future: lab concept | A: Concept: a sand floor, full stands, banners in the wind | future |
| `amb-tavern` | The Tavern | new | A: Hearth glow underneath, two mugs clink | openTavern → fxHook('tavernOpen', modal) |
| `amb-battle-felt` | Lit felt on the battlefield | done-existing | A: Lit felt with card shadows (live shader) | every battle: felt shader (lamp, impact lights, card shadows) |
| `amb-battle-map-terrain` | Fight on the map's own terrain | done-existing | A: The Outskirts terrain under the cards (live shader) | battle background: the map's terrain + its shader kind |
| `amb-sound-places` | Place soundscapes | done-existing | A: The Outskirts bed: breeze and birds (Ambience) | Ambience.play(kind, mapId) per place |
| `amb-music` | Songbook / Battle music | done-existing | A: The victory sting (Songbook) | Songbook / BattleMusic |
| `amb-motes` | Floating motes / fireflies | done-existing | A: Fireflies and motes (forest shader) | scene and map shaders |
| `amb-raid-splash` | Raid splash parallax | future: lab concept | A: Concept: silhouettes in layers slide against each other, the beast nearest | future |
| `amb-crt-grain` | Atmosphere packs (film grain, CRT, rain on glass) | future: lab concept (3 variants) | A: Concept: film grain; B: Concept: an old CRT (scanlines, flicker, vignette); C: Concept: rain running down the glass | future |
| `amb-ink-transition` | Ink-wash transition | future: lab concept (2 variants) | A: Concept: ink blooms out and covers, then washes away; B: Concept: one brush stroke wipes across | future |
| `amb-ant-lampposts` | Ant acid-battery lampposts | future: lab concept | A: Concept: acid-battery lamps along the road at night, ants marching | future |
| `amb-otter-roads` | Otter territory scenery (roads, forts, bridges) | future: lab concept | A: Concept: teal-and-bronze forts, a patrol marches the road | future |
| `amb-hummingbird-cliffs` | Hummingbird territory (painted cliffs, totems, blossoms) | future: lab concept | A: Concept: hummingbirds flit between blossoms, totems glow in turn | future |
