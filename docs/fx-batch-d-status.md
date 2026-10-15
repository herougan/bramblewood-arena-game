# Effects batch D — status (2026-10-15)

Batch D = card treatments and foils (incl. new foils), pack / card opening (every rarity tier's reveal, the foil pull,
sparks), on-card status looks and the Forge upgrade moments. **169 inventory entries, all 169 registered in the
Effects Lab with a playable demo (288 variants), 0 console errors when every variant is played.**

Code: `bramblewood-fx-d.js` (`window.FX.D`, CSS injected into `<style id="fx-d-style">`). Lab: `tools/effects-lab/manifest/d.js`
(four ids — `foil-cosmos`, `foil-aurora` A, `foil-old`, `pack-deal` — are demoed by the framework's `manifest/_existing.js`).
Contract: `docs/effects-lab-contract.md`.

| Status | Count | Meaning |
|---|---|---|
| done-existing | 68 | the game already had a good look; the lab demos the live code/CSS |
| new | 38 | built or rebuilt in this batch (where an older look existed, a "Before" variant keeps it playable) |
| new + variants | 9 | rebuilt, with 2–3 takes to choose from plus the Before |
| variants | 16 | new, 2–3 takes to choose from (A is what the game plays) |
| future concept | 38 | `future: true` entries: a working concept in the lab, no game hook yet |

## Game hooks (one line each in `arena_app.js`, handled in `FX.D.hooks` / `FX.D.onEvent`)

| Hook | Where | What batch D plays |
|---|---|---|
| `cardStatusShown(el, c)` | end of `updateCardStatusDisplay` | persistent status looks (poison ooze, bleed drips, blind ink, chains…), new-chip pop, Rage turning on |
| `boardRowsBuilt(battlefield)` | `renderBoard` after rows rebuild | puts the looks back on rebuilt rows; boss tiles get `.fxd-boss`; fresh cage drop / rage |
| `packShown`, `packTorn` | `openPackAnimation` | faction / mystery pack dressing; per-pack tear flair |
| `packCardUp(card, r, d)` | the card comes up face down | themed card backs; top-rarity build-up (heartbeat, runes, light, static, smoke); stops the last reveal cleanly |
| `packCardRevealed(card, r, d)` | the card flips | **Mythic / Ancient / Divine / Void / Daemonic each their own reveal (A)**, Heroic and Legendary flourishes, **the foil pull's own beat (rainbow sweep + FOIL stamp)**, shiny hue cycle, duplicate thunk |
| `forgeUpgrade(kind, stage, info)` | `forgeRefine`, `forgeLimitBreak`, `forgePromote`, `forgePrestige` | refine finish sweep, limit-break chains, promote recolour, prestige ring paint |
| `forgeMelt`, `forgeFuse`, `forgeTierUp`, `castleTempered` | melt button, Blacksmith fuse, `upgradeForge`, `temperCastle` | dust stream to the pill, copies fold into one, hearth roar, stones fit the wall |
| `onEvent` | battle replay | foil / Legendary+ / Supreme / Shiny glint as the unit lands; mind-control strings; day/night bonus fading |

All hooks are fire-and-forget, gated by `fxAtLeast('med')` (status looks at `'low'`), skipped under reduced motion / Effects
"none". The top-rarity frames (Mythic…Daemonic) are plain CSS keyed off the tile's rarity colour, injected at load.

Notes from the 2026-10-15 pass (resumed on the final framework):
- The opener (`.po2`) sits at z-index 9500, so batch D's reveal overlays now go inside it while it's open (they were under it).
- Reveal dims cut a hole round the card; the blood moon, halo rays, rune circle and black flame sit *behind* the card.
- The rarity word is stamped across the lower art (above the card it collided with NEW!).
- Each reveal runs in a GSAP context; the next card coming up reverts it, so nothing lingers over the next card.
- Card backs no longer collapse to a band in the opener; Void's rip is speckled static on dark; Daemonic's flood is black
  with red-hot flecks; autumn foil leaves are bigger.
- No real Mythic+ cards exist in the current card data, so the in-game reveals were checked by forcing a card's rarity.

## Entries

| id | area | status | lab variants | in game |
|---|---|---|---|---|
| `st-poison-active` | status | new (Before kept) | A: Ooze pools at the bottom, bubbles rise and pop, B: Before: tint and ☠ badge only | cardStatusShown (end of updateCardStatusDisplay) + boardRowsBuilt (renderBoard) |
| `st-bleed-active` | status | new (Before kept) | A: Blood runs from the top edge; edges throb like a heartbeat, B: Before: tint and 🩸 badge only | cardStatusShown + boardRowsBuilt |
| `st-decay-active` | status | new | A: Grey-violet mould creeps from the corners, spores lift | cardStatusShown + boardRowsBuilt (unit.decay > 0) |
| `st-freeze-active` | status | done-existing | A: Frost creep, falling flakes (live CSS) | already live in the game (existing CSS/code) |
| `st-sleep-active` | status | done-existing | A: 💤 bobs over the dimmed card (live CSS) | already live in the game (existing CSS/code) |
| `st-paralyze-active` | status | done-existing | A: Electric jitter (live CSS) | already live in the game (existing CSS/code) |
| `st-stun-active` | status | done-existing | A: Stars and a chick wheel round its head (live CSS) | already live in the game (existing CSS/code) |
| `st-stagger-active` | status | new (Before kept) | A: Dent rings throb from the middle, a beat of double vision, B: Before: 💢 wobble and tint | cardStatusShown + boardRowsBuilt |
| `st-blind-active` | status | new (Before kept) | A: Hollow Kin ink splat over the eyes, slowly running, B: Before: dim and 👁 icon | cardStatusShown + boardRowsBuilt |
| `st-tipsy-active` | status | done-existing | A: Tipsy sway (live CSS) | already live in the game (existing CSS/code) |
| `st-confuse-active` | status | new (Before kept) | A: Dizzy swirl, question marks circle its head, B: Before: hue drift only | cardStatusShown + boardRowsBuilt |
| `st-shock-active` | status | done-existing | A: Storm icon and tint (live CSS) | already live in the game (existing CSS/code) |
| `st-corrode-active` | status | new (Before kept) | A: Ant acid pits the card, fizz at the edges, B: Before: tint and 🧪 badge | cardStatusShown + boardRowsBuilt |
| `st-expose-active` | status | new | A: A red crosshair stays faintly, turning | cardStatusShown + boardRowsBuilt (unit.exposed > 0) |
| `st-daunt-active` | status | new | A: A cold purple pall settles; cold drops fall | cardStatusShown + boardRowsBuilt (unit.daunts) |
| `st-wither-active` | status | new | A: Black smoke rolls down; dark veins in the edges | cardStatusShown + boardRowsBuilt (unit.wither > 0) |
| `st-irradiation-active` | status | new (Before kept) | A: Green inner glow, geiger flicker, sparks (3 tokens), B: Before: ☢ count only | cardStatusShown + boardRowsBuilt (glow grows with tokens) |
| `st-smoke-active` | status | done-existing | A: Smoke drifts over it (live CSS) | already live in the game (existing CSS/code) |
| `st-scar-active` | status | new (Before kept) | A: Three claw marks stay cut across the art, B: Before: 🗡 badge only | cardStatusShown + boardRowsBuilt |
| `st-chained-active` | status | new (Before kept) | A: Crossed chains and a padlock that rattle, B: Before: ⛓ icon rattling | cardStatusShown + boardRowsBuilt |
| `st-rage-enter` | status | new (Before kept) | A: Red steam bursts off it, the frame flares, a growl, B: Before: the rage pulse just starts | cardStatusShown (Health drops below half on a Rage unit) / boardRowsBuilt |
| `st-low-hp` | status | done-existing | A: Low-Health tremble, red number (live CSS) | already live in the game (existing CSS/code) |
| `st-phase-grow` | status | done-existing | A: Aura and burst (live CSS) | already live in the game (existing CSS/code) |
| `st-phase-fade` | status | new + variants (Before kept) | A: Day: the aura drains, gold motes lift away, B: Night: silver motes, C: Before: the stat-down float only | onEvent statusFx kind:phaseFade |
| `st-stat-change` | status | done-existing | A: Stat up and down floats (live) | already live in the game (existing CSS/code) |
| `st-mind-controlled` | status | new | A: Faint violet puppet strings run up to a control bar | onEvent mindControl (+ kept by cardStatusShown / boardRowsBuilt) |
| `st-caged-leader` | status | new (Before kept) | A: The bars slam down, bounce, dust kicks out, B: Before: the cage is just there | boardRowsBuilt (first render of an .is-caged card) |
| `st-status-badges` | status | new (Before kept) | A: A new status chip pops in with a ring, B: Before: chips simply appear | cardStatusShown: a chip that wasn’t there last time pops |
| `tr-rarity-low` | card-treatment | done-existing | A: Common: grey band (live) | already live in the game (existing CSS/code) |
| `tr-rarity-uncommon` | card-treatment | done-existing | A: Uncommon: green band (live) | already live in the game (existing CSS/code) |
| `tr-rarity-mid` | card-treatment | done-existing | A: Rare: blue band with drift (live) | already live in the game (existing CSS/code) |
| `tr-rarity-high` | card-treatment | done-existing | A: Epic: brighter, faster band (live) | already live in the game (existing CSS/code) |
| `tr-rarity-top` | card-treatment | done-existing | A: Legendary: gold-leaf rim, sliding streak (live) | already live in the game (existing CSS/code) |
| `tr-rarity-mythic` | card-treatment | new + variants (Before kept) | A: Living ember frame, heat shimmer, B: Blood crystal facets, C: Heartbeat ring, D: Before: the shared gold-leaf rim | CSS on .card-tile.rarity-tier-top with --rarity-a #dc2626 (bramblewood-fx-d.js FRAMES_CSS, loaded with the game) |
| `tr-rarity-ancient` | card-treatment | new + variants (Before kept) | A: Rune stone: blue runes glow in the rim, B: Deep-blue tablet, carved inner line, C: Rune circle turning behind the art, D: Before: the shared gold-leaf rim | CSS on .card-tile.rarity-tier-top with --rarity-a #1e3a8a (bramblewood-fx-d.js FRAMES_CSS, loaded with the game) |
| `tr-rarity-divine` | card-treatment | new + variants (Before kept) | A: White-gold rim, halo rays from above, B: Ecclesia stained-glass rim, C: A halo floats at the top, D: Before: the shared gold-leaf rim | CSS on .card-tile.rarity-tier-top with --rarity-a #f8fafc (bramblewood-fx-d.js FRAMES_CSS, loaded with the game) |
| `tr-rarity-void` | card-treatment | new + variants (Before kept) | A: Static rim, stars at the edges, B: Unravelling rim (gaps turn round), C: Hollow: the edges show inverted, D: Before: the shared gold-leaf rim | CSS on .card-tile.rarity-tier-top with --rarity-a #7c6f8f (bramblewood-fx-d.js FRAMES_CSS, loaded with the game) |
| `tr-rarity-daemonic` | card-treatment | new + variants (Before kept) | A: Hellfire licks up the rim, B: Black horns, red eyes that blink, C: Smoulder: embers rise from the bottom, D: Before: the shared gold-leaf rim | CSS on .card-tile.rarity-tier-top with --rarity-a #111111 (bramblewood-fx-d.js FRAMES_CSS, loaded with the game) |
| `tr-rarity-special` | card-treatment | variants | A: Corner ribbon: EVENT / DEV / SPECIAL, B: Rubber stamp, C: A twinkling gem at the top | in-game n/a: the tile needs its rarity key (data-rarity) for the game to place it |
| `tr-elite-polish` | card-treatment | done-existing | A: Elite polish sheen (live CSS) | already live in the game (existing CSS/code) |
| `tr-boss-extended` | card-treatment | new (Before kept) | A: Black-iron frame, red under-glow, rivets, B: Before: full-bleed art only | boardRowsBuilt: enemy art-extended tiles in a boss fight get .fxd-boss |
| `tr-prestige-gold` | card-treatment | new (Before kept) | A: Gold ring with a glint travelling round it, B: Before: static gold ring | CSS on .card-tile.prestige-gold (everywhere) |
| `tr-prestige-rainbow` | card-treatment | done-existing | A: Rainbow ring (live CSS) | already live in the game (existing CSS/code) |
| `tr-prestige-extended` | card-treatment | done-existing | A: Double frame (live CSS) | already live in the game (existing CSS/code) |
| `tr-shiny` | card-treatment | done-existing | A: Hue-shifted art (live CSS) | already live in the game (existing CSS/code) |
| `tr-shiny-mark` | card-treatment | new (Before kept) | A: ✦ cycles colour and flashes, B: Before: soft twinkle | CSS on .shiny-mark (everywhere) |
| `tr-shiny-spawn` | card-treatment | done-existing | A: A spawn arrives already shiny (live CSS) | already live in the game (existing CSS/code) |
| `tr-leader-frame` | card-treatment | done-existing | A: Leader glow spinning round the frame (live CSS) | already live in the game (existing CSS/code) |
| `tr-hero-frame` | card-treatment | done-existing | A: Hero card lifts, ring (live CSS classes) | already live in the game (existing CSS/code) |
| `tr-supreme` | card-treatment | new (Before kept) | A: A prismatic edge turns round it; the stat glints stay, B: Before: glints on the numbers only | CSS on .card-tile.is-supreme (everywhere) |
| `tr-devilry` | card-treatment | done-existing | A: Devil aura (live CSS) | already live in the game (existing CSS/code) |
| `tr-antique` | card-treatment | new (Before kept) | A: Sepia art, foxing spots, a fold crease, darker edges, B: Before: ribbon only | CSS on .card-tile.hof-antique (Hall of Fame) |
| `tr-classic` | card-treatment | new (Before kept) | A: Cream print border, halftone dots, B: Before: ribbon only | CSS on .card-tile.hof-classic (Hall of Fame) |
| `tr-cards-of-old` | card-treatment | done-existing | A: Aged paper, foxing, creases (ProcFX) | already live in the game (existing CSS/code) |
| `tr-field-card` | card-treatment | done-existing | A: Field card icon spin (live CSS) | already live in the game (existing CSS/code) |
| `tr-token` | card-treatment | new (Before kept) | A: Printed token: perforated edge, B: Before: dashed border | CSS on .card-tile.is-token / .board-card.is-token |
| `tr-nest-born` | card-treatment | new (Before kept) | A: An egg badge that wobbles now and then, B: Before: plain 🔁 chip | CSS on .spawnbadge |
| `tr-locked` | card-treatment | variants | A: Locked: grey and padlock (live CSS), B: Unlock: padlock shakes, shackle springs, colour floods back | A live; B lab: proposed for the Codex when a card unlocks |
| `tr-magnetic` | card-treatment | done-existing | A: Hover tilt and shimmer (live CSS) | already live in the game (existing CSS/code) |
| `tr-atk-heat` | card-treatment | done-existing | A: Hot Attack number (live CSS) | already live in the game (existing CSS/code) |
| `tr-skins` | card-treatment | variants | A: Ember skin (live CSS), B: Skin swap: a shimmer sweeps and leaves the new skin | A live CSS; B lab: proposed for the skin picker |
| `tr-card-back` | card-treatment | new (Before kept) | A: Acorn crest embossed on a woven board, light sweeps, B: Before: one plain acorn back | packCardUp: the opener’s backs (faction packs get their own) |
| `tr-card-inspect` | card-treatment | new | A: 3D spin with the finish catching light | already live in the game (existing CSS/code) |
| `tr-future-backing-faction` | card-treatment | future concept (variants) | A: Rivergate: bronze and oxblood weave, B: Sunfeather: jewel feathers, C: Hive: honeycomb wax, D: Road-folk: stitched patchwork, E: Beasts: claw-scored hide | live for faction packs via packCardUp; a deck-wide backing is planned |
| `tr-future-backing-monthly` | card-treatment | future concept (variants) | A: October: harvest moon, B: November: first frost, C: December: lantern night | future (lab concept) |
| `tr-future-frame-otter` | card-treatment | future concept (variants) | A: Bronze and oxblood, wave crest, B: River banner | future (lab concept) — FX.D.frame(tile, 'otter-a' |
| `tr-future-frame-hummingbird` | card-treatment | future concept (variants) | A: Jewel studs on cliff stone, B: Feather fringe | future (lab concept) — FX.D.frame(tile, 'hummingbird-a' |
| `tr-future-frame-roadfolk` | card-treatment | future concept (variants) | A: Dusty patchwork, stitched, B: Lantern amber corners | future (lab concept) — FX.D.frame(tile, 'road-a' |
| `tr-future-frame-beast` | card-treatment | future concept (variants) | A: Claw-scored, one ember, B: Shaggy edge | future (lab concept) — FX.D.frame(tile, 'beast-a' |
| `tr-future-frame-hive` | card-treatment | future concept (variants) | A: Honeycomb wax, B: Riveted plate, acid lamp | future (lab concept) — FX.D.frame(tile, 'hive-a' |
| `tr-future-folktale` | card-treatment | future concept (variants) | A: Painted storybook border, B: Gilded page, illuminated corner | future (lab concept) — FX.D.frame(tile, 'folktale-a' |
| `tr-future-oriental` | card-treatment | future concept (variants) | A: Ink-wash border, red seal, B: Red lacquer and gold clouds | future (lab concept) — FX.D.frame(tile, 'oriental-a' |
| `tr-future-spy` | card-treatment | future concept (variants) | A: Dossier edge, redaction bars, B: Night-vision scope | future (lab concept) — FX.D.frame(tile, 'spy-a' |
| `tr-future-veggies` | card-treatment | future concept (variants) | A: Vine-wrapped, soil smudges, B: Garden crate slats | future (lab concept) — FX.D.frame(tile, 'veggies-a' |
| `tr-future-breathing-art` | card-treatment | future concept (variants) | A: Parallax: art and haze slide against each other, B: Slow breath: the art swells and settles | future (lab concept) |
| `tr-future-living-ink` | card-treatment | future concept (variants) | A: Living ink border (writhes), B: Ink tendrils creep from the corners | future (lab concept) — FX.D.frame(tile, 'living-a' |
| `tr-future-hero-portraits` | card-treatment | future concept (variants) | A: A ring of light closes, the portrait swaps, Lv banner, B: The frame steps up: bronze, silver, gold | future (lab concept) |
| `foil-pearl` | foil | done-existing | A: Pearl (live) | already live in the game (existing CSS/code) |
| `foil-rainbow` | foil | done-existing | A: Rainbow holo (live) | already live in the game (existing CSS/code) |
| `foil-cosmos` | foil | done-existing | A: Cosmos band with glitter | already live in the game (existing CSS/code); demo in manifest/_existing.js |
| `foil-starlight` | foil | done-existing | A: Starlight sparkles (live) | already live in the game (existing CSS/code) |
| `foil-hex` | foil | variants | A: Hex lattice (live), B: Honeycomb (bees): amber cells, honey drips | already live in the game (existing CSS/code) |
| `foil-etched` | foil | done-existing | A: Etched frame (live) | already live in the game (existing CSS/code) |
| `foil-ice` | foil | done-existing | A: Cracked ice (live) | already live in the game (existing CSS/code) |
| `foil-gold` | foil | done-existing | A: Gold leaf (live) | already live in the game (existing CSS/code) |
| `foil-reverse` | foil | done-existing | A: Reverse holo (live) | already live in the game (existing CSS/code) |
| `foil-prism` | foil | done-existing | A: Prism (live) | already live in the game (existing CSS/code) |
| `foil-lattice` | foil | done-existing | A: Lattice (live) | already live in the game (existing CSS/code) |
| `foil-aurora` | foil | variants | A: Northern-lights curtains, B: Aurora borealis rays (new) | already live in the game (existing CSS/code); demo in manifest/_existing.js (+ B in d.js) |
| `foil-galaxy` | foil | done-existing | A: Galaxy swirl (live) | already live in the game (existing CSS/code) |
| `foil-molten` | foil | done-existing | A: Molten gold (live) | already live in the game (existing CSS/code) |
| `foil-frost` | foil | done-existing | A: Frost crystal (live) | already live in the game (existing CSS/code) |
| `foil-oilslick` | foil | done-existing | A: Oil slick (live) | already live in the game (existing CSS/code) |
| `foil-sakura` | foil | done-existing | A: Sakura petals (live) | already live in the game (existing CSS/code) |
| `foil-sparkle` | foil | done-existing | A: Glitter field (live) | already live in the game (existing CSS/code) |
| `foil-scanline` | foil | done-existing | A: Holo scanlines (live) | already live in the game (existing CSS/code) |
| `foil-old` | foil | done-existing | A: Cards of old (ProcFX.decorateOld) | already live in the game (existing CSS/code); demo in manifest/_existing.js |
| `foil-splash` | foil | done-existing | A: Legacy foil shimmer ring (live CSS) | already live in the game (existing CSS/code) |
| `foil-tilt-board` | foil | new + variants (Before kept) | A: A specular band sweeps the card once, B: The card rocks once so its finish shows the light moving, C: Before: the finish only drifts | onEvent play: a foil / Legendary+ / Supreme / Shiny unit catches the light as it lands |
| `foil-new-ember` | foil | future concept (variants) | A: Ember crackle, B: Volcanic glass | future (lab concept) — a finish for pack rolls (FX.D.applyFoil(tile, key), or class "is-holo fxd-foil fxd-f-ember" + FX.D.decorateFoils |
| `foil-new-tide` | foil | future concept (variants) | A: Tide caustics, B: Tide shimmer | future (lab concept) — a finish for pack rolls (FX.D.applyFoil(tile, key), or class "is-holo fxd-foil fxd-f-caustics" + FX.D.decorateFoils |
| `foil-new-bramble` | foil | future concept (variants) | A: Bramble vine, B: Pollen drift | future (lab concept) — a finish for pack rolls (FX.D.applyFoil(tile, key), or class "is-holo fxd-foil fxd-f-bramble" + FX.D.decorateFoils |
| `foil-new-firefly` | foil | future concept (variants) | A: Firefly night, B: Firefly meadow | future (lab concept) — a finish for pack rolls (FX.D.applyFoil(tile, key), or class "is-holo fxd-foil fxd-f-firefly" + FX.D.decorateFoils |
| `foil-new-feather` | foil | future concept (variants) | A: Hummingbird iridescence, B: Jewel feather fringe | future (lab concept) — a finish for pack rolls (FX.D.applyFoil(tile, key), or class "is-holo fxd-foil fxd-f-feather" + FX.D.decorateFoils |
| `foil-new-bronze` | foil | future concept (variants) | A: Legion bronze, B: Bronze filigree | future (lab concept) — a finish for pack rolls (FX.D.applyFoil(tile, key), or class "is-holo fxd-foil fxd-f-bronze" + FX.D.decorateFoils |
| `foil-new-inkwash` | foil | future concept (variants) | A: Ink wash, B: Sumi brush stroke | future (lab concept) — a finish for pack rolls (FX.D.applyFoil(tile, key), or class "is-holo fxd-foil fxd-f-inkwash" + FX.D.decorateFoils |
| `foil-new-redacted` | foil | future concept (variants) | A: Redacted, B: Dossier | future (lab concept) — a finish for pack rolls (FX.D.applyFoil(tile, key), or class "is-holo fxd-foil fxd-f-redacted" + FX.D.decorateFoils |
| `foil-new-stainedglass` | foil | future concept (variants) | A: Stained glass, B: Sunfeather tribes glass | future (lab concept) — a finish for pack rolls (FX.D.applyFoil(tile, key), or class "is-holo fxd-foil fxd-f-stainedglass" + FX.D.decorateFoils |
| `foil-new-void` | foil | future concept (variants) | A: Void static, B: Event horizon | future (lab concept) — a finish for pack rolls (FX.D.applyFoil(tile, key), or class "is-holo fxd-foil fxd-f-voidstatic" + FX.D.decorateFoils |
| `foil-new-hellfire` | foil | future concept (variants) | A: Hellfire border, B: Black flame, C: Brimstone | future (lab concept) — a finish for pack rolls (FX.D.applyFoil(tile, key), or class "is-holo fxd-foil fxd-f-hellfire" + FX.D.decorateFoils |
| `foil-new-radioactive` | foil | future concept (variants) | A: Radioactive glow, B: Acid-battery circuit | future (lab concept) — a finish for pack rolls (FX.D.applyFoil(tile, key), or class "is-holo fxd-foil fxd-f-uranium" + FX.D.decorateFoils |
| `foil-new-ghostmist` | foil | future concept (variants) | A: Ghost mist, B: Will-o’-wisps | future (lab concept) — a finish for pack rolls (FX.D.applyFoil(tile, key), or class "is-holo fxd-foil fxd-f-ghostmist" + FX.D.decorateFoils |
| `foil-new-dragonscale` | foil | future concept (variants) | A: Holographic dragon scale, B: Red dragon scale | future (lab concept) — a finish for pack rolls (FX.D.applyFoil(tile, key), or class "is-holo fxd-foil fxd-f-dragonscale" + FX.D.decorateFoils |
| `foil-new-mycelium` | foil | future concept (variants) | A: Mycelium, B: Spore glow | future (lab concept) — a finish for pack rolls (FX.D.applyFoil(tile, key), or class "is-holo fxd-foil fxd-f-mycelium" + FX.D.decorateFoils |
| `foil-new-bioluminescent` | foil | future concept (variants) | A: Bioluminescent, B: Jellyfish drift | future (lab concept) — a finish for pack rolls (FX.D.applyFoil(tile, key), or class "is-holo fxd-foil fxd-f-biolum" + FX.D.decorateFoils |
| `foil-new-mirage` | foil | future concept (variants) | A: Desert mirage, B: Dune gold | future (lab concept) — a finish for pack rolls (FX.D.applyFoil(tile, key), or class "is-holo fxd-foil fxd-f-mirage" + FX.D.decorateFoils |
| `foil-new-storm` | foil | future concept (variants) | A: Storm, B: Rain on glass | future (lab concept) — a finish for pack rolls (FX.D.applyFoil(tile, key), or class "is-holo fxd-foil fxd-f-storm" + FX.D.decorateFoils |
| `foil-new-autumn` | foil | future concept (variants) | A: Autumn leaf, B: Ginkgo gold | future (lab concept) — a finish for pack rolls (FX.D.applyFoil(tile, key), or class "is-holo fxd-foil fxd-f-autumn" + FX.D.decorateFoils |
| `foil-new-moonphase` | foil | future concept (variants) | A: Moon phase, B: Moonlit silver | future (lab concept) — a finish for pack rolls (FX.D.applyFoil(tile, key), or class "is-holo fxd-foil fxd-f-moonphase" + FX.D.decorateFoils |
| `foil-new-constellation` | foil | future concept (variants) | A: Constellation, B: Zodiac wheel | future (lab concept) — a finish for pack rolls (FX.D.applyFoil(tile, key), or class "is-holo fxd-foil fxd-f-constellation" + FX.D.decorateFoils |
| `foil-new-cream-pearl` | foil | future concept (variants) | A: Cream pearl, B: Rose pearl | future (lab concept) — a finish for pack rolls (FX.D.applyFoil(tile, key), or class "is-holo fxd-foil fxd-f-creampearl" + FX.D.decorateFoils |
| `pack-idle` | pack-card-open | done-existing | A: Floats and glows, sheen runs (live CSS) | already live in the game (existing CSS/code) |
| `pack-glow` | pack-card-open | done-existing | A: Glows in the best card’s colour (live CSS) | already live in the game (existing CSS/code) |
| `pack-jackpot` | pack-card-open | done-existing | A: Jackpot spin and blink (live CSS) | already live in the game (existing CSS/code) |
| `pack-stack` | pack-card-open | done-existing | A: Packs still to open pile up behind (live markup) | already live in the game (existing CSS/code) |
| `pack-tear` | pack-card-open | variants | A: Drag the strip off (live CSS), B: + Gold pack: coins spill as it rips, C: + Rivergate: a river splash, D: + Sunfeather: feathers burst out | B: packTorn (the strip rips), per pack type |
| `pack-burst` | pack-card-open | done-existing | A: Bursts open and rises (live CSS) | already live in the game (existing CSS/code) |
| `pack-legacy-shake` | pack-card-open | new (Before kept) | A: Before: the old poShake, B: Building shake, light leaking from the seams | in-game n/a: the old opener path is no longer used |
| `pack-deal` | pack-card-open | done-existing | A: Cards deal out face down, then flip | already live in the game (existing CSS/code); demo in manifest/_existing.js |
| `pack-tease-rare` | pack-card-open | done-existing | A: Rare: blue tease, soft rays (live CSS) | already live in the game (existing CSS/code) |
| `pack-tease-epic` | pack-card-open | variants | A: Epic: purple tease, big rays (live CSS), B: Heroic: + orange flare and HEROIC (new) | B: packCardRevealed for Heroic / Unique |
| `pack-tease-legend` | pack-card-open | variants | A: Legend tease, sparks (live CSS), B: Legendary: + coin shower and a crown (new) | B: packCardRevealed for Legendary |
| `pack-rays` | pack-card-open | done-existing | A: Rays in the rarity colour (live CSS) | already live in the game (existing CSS/code) |
| `pack-rays-big` | pack-card-open | done-existing | A: Big fast rays (live CSS) | already live in the game (existing CSS/code) |
| `pack-spark` | pack-card-open | variants | A: Spark, B: Superspark | already live in the game (existing CSS/code) |
| `pack-reveal-mythic` | pack-card-open | variants | A: Red flare, the screen dims, a heartbeat, B: A blood moon rises behind it, C: Shockwave and an ember fountain | packCardUp (build-up while face down) + packCardRevealed (A plays in the game) |
| `pack-reveal-ancient` | pack-card-open | variants | A: A stone tablet cracks open, blue runes flare, B: A rune circle draws itself and spins, C: Deep water: blue light from below, bubbles | packCardUp (build-up while face down) + packCardRevealed (A plays in the game) |
| `pack-reveal-divine` | pack-card-open | variants | A: A white pillar of light comes down, B: A golden halo settles, rays turn, C: White wings unfold behind it | packCardUp (build-up while face down) + packCardRevealed (A plays in the game) |
| `pack-reveal-void` | pack-card-open | variants | A: The card tears the screen open; static in the rip, B: Implosion, then it pops out, C: Glitch: RGB slices and static bars | packCardUp (build-up while face down) + packCardRevealed (A plays in the game) |
| `pack-reveal-daemonic` | pack-card-open | variants | A: Black flame floods the stage; red eyes open, B: A hell-gate: two black doors swing open, C: Brimstone rain and a red flash | packCardUp (build-up while face down) + packCardRevealed (A plays in the game) |
| `pack-reveal-foil` | pack-card-open | variants | A: Rainbow sweep, the finish flares, FOIL stamp, B: Prism shards burst, the card tilts into the light, C: Three quick shines, a holo ring of sparkles | packCardRevealed (r.foil): A |
| `pack-reveal-shiny` | pack-card-open | new (Before kept) | A: Hues cycle, settle on its shiny colour, ✦ SHINY, B: Before: the ✦ mark only | packCardRevealed (r.shiny) |
| `pack-new-card` | pack-card-open | done-existing | A: NEW! border, stamp, flash (live CSS) | already live in the game (existing CSS/code) |
| `pack-duplicate` | pack-card-open | new (Before kept) | A: Copies slam in behind with a thunk, ×2, dust motes, B: Before: ×N chip only | packCardRevealed (not new) |
| `pack-collect` | pack-card-open | done-existing | A: The card flies down to its slot (as the opener does) | already live in the game (existing CSS/code) |
| `pack-sweep-reveal` | pack-card-open | done-existing | A: A sweep across flips it (live CSS) | already live in the game (existing CSS/code) |
| `pack-summary` | pack-card-open | done-existing | A: The haul in a grid, a wave runs across it (ProcFX.ripple) | already live in the game (existing CSS/code) |
| `pack-open-all-table` | pack-card-open | new | A: Packs on the table open as the slash crosses them | already live in the game (existing CSS/code) |
| `pack-crate` | pack-card-open | done-existing | A: A crate for 100+ packs, pried open (live CSS) | already live in the game (existing CSS/code) |
| `pack-pile` | pack-card-open | done-existing | A: A huge pile with its count (live CSS) | already live in the game (existing CSS/code) |
| `pack-faction` | pack-card-open | variants | A: Rivergate: a wax seal stamps on, a river band, B: Sunfeather: a wrap of hummingbird feathers, C: Hive bundle: seal and honey band | packShown (A plays in the game) |
| `pack-mystery` | pack-card-open | new (Before kept) | A: Question marks circle the wobbling wrapper, B: Before: boing and the plain opener | packShown (pool 99 / id "mystery") |
| `pack-free-courier` | pack-card-open | done-existing | A: The courier bobs in with the pack (approximation of the live CSS) | already live in the game (existing CSS/code) |
| `pack-purchase` | pack-card-open | done-existing | A: Coin register and the counter ticks (live sound) | already live in the game (existing CSS/code) |
| `pack-discover` | pack-card-open | done-existing | A: Discovered! burst and shine (live CSS) | already live in the game (existing CSS/code) |
| `pack-reward-unlock` | pack-card-open | done-existing | A: Padlock sparkle and break (SkillFX.unlockSparkle) | already live in the game (existing CSS/code) |
| `pack-pity` | pack-card-open | future concept | A: A “Guaranteed!” seal stamps onto the pack | future (lab concept) — FX.D.pitySeal(packEl |
| `pack-odds` | pack-card-open | future concept | A: The odds card unfolds; each bar fills | future (lab concept) — FX.D.packOdds(host |
| `meta-forge-temper` | meta-progression | done-existing | A: Heat, hammer, quench, shine (ProcFX.forge) | already live in the game (existing CSS/code) |
| `meta-forge-limit-break` | meta-progression | new (Before kept) | A: Red-hot chains bind it, snap at the flip, dragon scales glow, B: Before: the shared smithing flip | fxHook forgeUpgrade "limitBreak" (forgeLimitBreak) |
| `meta-forge-promote` | meta-progression | new (Before kept) | A: The frame recolours Rare → Epic with a sweep, B: Before: the shared smithing flip | fxHook forgeUpgrade "promote" (forgePromote) |
| `meta-forge-prestige` | meta-progression | new + variants (Before kept) | A: Gold: the ring paints itself on, B: Rainbow ring paints on, C: Extended: a double frame paints on, D: Before: the shared smithing flip | fxHook forgeUpgrade "prestige" (forgePrestige) |
| `meta-forge-refine` | meta-progression | new + variants (Before kept) | A: Rainbow: the finish sweeps across as it lands, B: Gold leaf, C: Prism, D: Before: the shared smithing flip | fxHook forgeUpgrade "refine" (forgeRefine) |
| `meta-forge-enchant` | meta-progression | done-existing | A: A Materia crystal forms, spins and drops (materiaBurstVfx) | already live in the game (existing CSS/code) |
| `meta-forge-melt` | meta-progression | new | A: The card droops and streams as dust into the Dust pill | fxHook forgeMelt (the Melt button) |
| `meta-forge-fuse` | meta-progression | new | A: Three copies fly in and fold into one, sparks, a flash | fxHook forgeFuse (Blacksmith: fuse copies) |
| `meta-forge-tier-up` | meta-progression | new | A: The hearth roars up, an anvil drops in, the new name | fxHook forgeTierUp (upgradeForge) |
| `meta-forge-entrance` | meta-progression | done-existing | A: The forge flares up on entering (live CSS) | already live in the game (existing CSS/code) |
| `meta-castle-temper` | meta-progression | new | A: Stones fly in and fit into the wall | fxHook castleTempered (temperCastle) |
