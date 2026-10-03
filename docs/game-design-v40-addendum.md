# Game design v40 addendum (2026-10-03, evening)

Covers your D1–D11 answers and the three new questions: alt-art, iPad card sizes and card levels. Also covers the shaders idea.

## Built this batch

**Cards**
- **Card sizes scale.** Every card is its own size container, so its name, stats and badges size from the card's own width. This replaces fixed pixel font sizes.
  - Floors keep text legible on small cards; ceilings keep it from going cartoonish on large ones.
  - Size tokens: `--card-xs 64px`, `--card-sm 88px`, `--card-md 110px`, `--card-lg 168px`, `--card-xl 260px`.
  - Tiles under ~70px drop the name rather than cram it.
  - The detail view (`clamp(180px, 34vmin, 300px)`) and Full-Art Codex grid scale with the screen.
  - This fixes the iPad squeeze (e.g. "⚔10❤50" running together in the hand).
- **Card levels** show only:
  - in the Nest (your collection);
  - in the Forge (crafting);
  - in the deck builder, while its new **level filter** is on (Lv 1+/3+/5+/10+, or sort by level).

  Hidden everywhere else: Codex, hand, board and popovers. Deck level stays.
- **Parchment name scroll** (D3): original SVG art with a rolled left end, a torn paper middle with stains and cracks, and a curled right corner. Three layers, so it never distorts.

**Home and navigation (D1, D4, D5)**
- **Home:** Play hero (full width), with Deck/Codex/Shop/Nest as a 2×2 grid. Quests and Community are the only extras. The header (energy, profile chip, ⚙) now shows on Home too.
- **Settings** holds Workshop and Admin. Admin shows only for admins: cloud admin, dev mode, or a local build.
- **Arena:** Practice (Quick Battle, Pass & Play), Challenges (Gauntlet, Dungeon), Online (PvP, Ranked Live), then **Recent opponents** with names. Click one to see the deck.
- **Simulator** is admin-only (Deck → Simulator).

**Shop (D2)**
- **Pack 1 = 33 cards:** interesting but not advanced (0–1 keyword, cost ≤ 2), all with art. Set as `source:{kind:'pack', tier:1}` in `canonical/cards.json`.
- **Packs give real cards:** 3 / 5 / 8, rarity-weighted. The two bigger packs guarantee one card you don't own yet. Dust and Metal are still included, plus a smaller level-up chance.
- **Pack opening:** the pack shakes and bursts, cards deal out face-down and flip one by one. Tap to flip early, or "Reveal all". NEW ribbons and a gold glow mark new cards. Ends with "See them in the Nest".
- **Guests** get one banner ("Sign in to open packs — it's free"). If no cards are assigned, the shop says "coming soon" instead of selling empty packs.

**Conquest world (D6)**
- The map list shows unlocked maps with progress ("3/5 cleared"), plus one "Next: … 🔒" teaser. On phones it's a horizontal chip strip.
- Maps are joined edge to edge:
  - the previous and next maps peek in at the bottom corners;
  - clicking an edge, swiping, or clicking a tab pans the world to that map (slide out, slide in from that side).
- Only the current map is built (lazy). See D13 for the bigger "one giant canvas" option.

**Raid trench, played (D7, D8)**
- **You play your row turn by turn:**
  - pick a card, then drop it in a lit slot, or discard it for +1 🪵;
  - then End turn.
  - The turn resolves with a short animation: specials, then combat.
- **Allies:** the most recent other raiders' decks from this week's raid (live, `raid_week_attempts`), else the raid's **default ally decks**: Riverguard Line, Hive Wall, Talon Sky, Tundra Pack (`canonical/raids.json → allyDecks`).
- **Telegraphs:** columns a Tentacle Smack will hit this turn glow soft red across every row (the front row when a Tail Sweep is due). A warning line says so.
- **Leaving early** banks the damage done so far; the fight is scored once.
- **Over-damage counts (D7):**
  - damage to stumps and guards counts;
  - a part's global pool can go past 0, and the excess still counts toward your total and tier.
- **Engine:** `createTrench()` is a turn stepper (`playMine`, `discardMine`, `endTurn`); `runTrench()` is the all-CPU loop over it, used by tests and the editor's "Simulate".

**Atmosphere (shaders v0)**
- Settings → Atmosphere: Off / 🌅 Golden hour / 🌙 Moonlit / 🌧️ Rain / 🍂 Autumn.
- Each is a colour grade over everything plus a light/particle layer (dust motes, fireflies, rain, falling leaves). Per device, off by default; reduced motion keeps only the grade.

**Home 2.5D (D11)**
- The splash scene sits far back, faded. A foreground otter (left) and hummingbird (right) stand in front.
- Layers drift at different speeds with the pointer (or device tilt), so the screen has depth.
- The sprites are PixelLab transparent PNGs in `art/home/`; the build embeds them when present.

## Alt-art: proposal (T6)

- **What:** cosmetic art variants for a card, never stat changes. Examples: "Winter" Otter Guard, "Night Market" Raccoon Nightcrew, a Raid-tier "Kraken-Ink" Narwhal.
- **Data:**
  - Each card can list `arts: [{id, name, src, source, rarity}]`.
  - Each owned copy can carry an `artId`, exactly like `foil` today.
  - A per-card preference, `myArtChoice[cardId]`, says which variant shows in your deck, hand and board. Opponents see your choice in live matches; the deck already travels with the match.
- **Where they come from** (fits "low raw rewards; recognition for grinders"):
  - a small chance per pack card (e.g. 1 in 40);
  - Raid Top 1% / Top 10% tiers (the raid design already pays tiers in cosmetics);
  - seasonal events;
  - medal and achievement milestones;
  - later, crafting with raid materials (P4).
- **Display:** Nest stacks show a small "🎨 2" badge when you own variants; click to pick. Foil and alt-art combine.
- **Pipeline:** the same PixelLab flow, with job ids `<card>@<variant>`, a theme suffix on the prompt, crop and wire.
- **Admin:** the card editor gets an "Alt arts" list (add, name, source, preview).
- **Open questions:** trade alt-art on the Market? Show an "alt-art" filter in the Codex?

## Atmosphere packs: where to take the shaders idea (T7)

Your point: Minecraft stays alive through shaders and replayability rather than gameplay alone. For us:
1. **v0 (built):** colour grades plus particles over the whole UI.
2. **v1:** real WebGL on the **art layers we own**: map backgrounds, the battlefield, the Home scene.
   - Effects: water ripple on rivers and sea maps, wind sway on grass and trees (displacement maps), light shafts, bloom on bright pixels, rain splashes on the battlefield.
   - The DOM can't be shader-processed directly, so effects apply to the backgrounds we render, and the overlay handles the rest.
3. **Time and weather:** day/night follows your local clock; weather rotates daily. A rainy day in the Sunken Hollow should feel different.
4. **Moddable packs:** an atmosphere pack is a small JSON (grade, particles, uniforms) plus optional GLSL snippets. Admin-published at first, through the same `card_overrides` `__cfg:` route, then player-made and shareable. That's the "blank slate / moddable" half of the Minecraft lesson.
5. **Cheap first:** keep it off by default on low-power devices, and cap particles. A per-pack performance budget lives in the pack JSON.

## Late evening batch (2026-10-03)

**🧭 World atlas (D13)**
- Conquest has a "World" chip and a 🧭 button.
- Every map shows as a compass diamond (gold rim, N mark, map icon), distinct from round skirmish nodes, on one winding trail.
- Locked maps are grey; maps past the next locked one are fogged as "Uncharted".
- Each stop's card (mini-map dots, progress bar, "you are here") is built only when it scrolls near view, using IntersectionObserver.
- Click a diamond: the atlas zooms toward it, then the map zooms in.
- Code: `renderConquestWorld()` and `compassDiamondSVG()`.

**⛶ Immersive Conquest**
- The map fills the screen; header and sub-tabs are hidden; the Fullscreen API is used where available.
- Esc or ✕ leaves.
- Conquest now uses the same content column as Arena.

**Shaders v1 (T7)**
- `bramblewood-shaders.js`: `mount(host, {preset:'scene'|'map'})`.
- **Scene preset:** samples the splash art and decides motion per pixel by colour: foliage sways, water ripples and glints, bright areas bloom. It adds light shafts and fireflies.
- **Map preset:** a premultiplied overlay per terrain kind (`MAP_KIND`).
- Settings → 🌊 Shader effects.

**Card-data fingerprint (T3)**
- `bramblewood-integrity.js`: `cardDataHash()` (a synchronous SHA-256 over a stable JSON of the gameplay fields).
- Shown in Admin.
- Tests: `tests/integrity.js`.

**UI review (D16):** see `ui-review-2026-10-03.md`.
