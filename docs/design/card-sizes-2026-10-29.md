# Card sizes: audit and proposal (package CARDSIZE1, 2026-10-29)

Owner, 2026-10-29 19:14: "Currently we have like 10 sizes. Can we reduce to just 3 or 4? It's too much. One huge blown up one for detail, and 'tacit', you can spin it around etc."

This is an audit and a proposal. No game code changed. The mock page is `docs/design/card-sizes-2026-10-29.html`: open it locally, or publish it as a page (the two card images are inlined).

## Summary

- **The game draws cards at about 20 different sizes on the screens we measured, not 10.** The CSS has 132 rules that set a card tile's width, with 56 different values, and 42 definitions of the in-match size `--match-card-w/h`. About 25 more sizes exist only in CSS, for screens this audit did not open (Stomping Grounds, Arena, editor and admin tools, tutorial steps).
- **Proposal: four sizes, all drawn by `cardTileHTML(d, {size})`.**
  - **Detail** is one large card that can be tilted and spun, with its text beside it and lore and levels on the back.
  - **Full** is the standard card for every browsing screen.
  - **Compact** is the board card, sized by the board as it is today.
  - **Chip** is a small token with an art disc and the name, for lists and mentions.
- **Riskiest parts:** the battle board at 390 (GSAP Flip and the hand fan depend on the current sizes), the pack-opening flight, and the win screen's height-based fit.
- **Effort:** about 9 to 11 agent-days across 5 packages. In-match changes go last.

## 1. What exists today

Measured with `tools/cardsize1_shots.py` (Playwright, admin mode, maps unlocked, onboarding skipped). The script opens each screen at 1366×860 and 390×844 and measures every `.card-tile` and card-like element with `getBoundingClientRect`. Sizes are in CSS px. The raw data is in `tests/out/cardsize1-<w>.json` (not committed). Crops are in `docs/screens/cardsize1/`. Every crop is a real screenshot, so a few include an overlay or an animation frame. Where a crop is poor, the full-screen shot is linked instead.

True-scale sheets (each card at its real pixel size, side by side):
- 1366: ![1366](../screens/cardsize1/sheet-true-scale-1366.jpg)
- 390: ![390](../screens/cardsize1/sheet-true-scale-390.jpg)

Legend for "Shows": A art, N name (legible), S Attack and Health, C cost, W Wait, K skill icons, T skill text, F flavour, R rarity frame (every variant has R).

| # | Variant | Rendered by (CSS) | 1366 | 390 | Where | Shows | Crop | Proposed |
|---|---|---|---|---|---|---|---|---|
| 1 | Card Inspector (spin) | `openCardInspector` · `.ci-spin` `min((100vh-190px)*.8, 80vw, 400px)` | 400×500 | 312×392 | 🔍 Inspect in the detail, pack results | A N S W K, drag to turn, finish picker (admin) | [1366](../screens/cardsize1/inspector--ci-face-ci-spin-1366.jpg) · [390](../screens/cardsize1/inspector--ci-face-ci-spin-390.jpg) | **Detail** |
| 2 | Card Detail overlay | `openCardDetail` · `.card-detail-card` (820 / 100%) with a card visual | card 258×323 in an 820×870 panel | card 200×250 in a 358 panel | tap a card in the Codex and other screens | A N S W K + T F tags, admin tools | [1366](../screens/cardsize1/detail--card-pop-visual-cd-grid-1366.jpg) · [panel](../screens/cardsize1/detail-full-1366.jpg) · [390](../screens/cardsize1/detail-full-390.jpg) | **Detail** |
| 3 | Pack reveal | `openPackAnimation` · `.po2-front` | 360×450 | 312×390 | pack opening, one card at a time | A N S W K | [390](../screens/cardsize1/pack-card-full-390.jpg) · [1366](../screens/cardsize1/pack-card-full-1366.jpg) | **Detail** (no text panel) |
| 4 | Hover popover | `fullCardHTML` in `#cardPop` (264px panel, `.card-pop-visual-tile`) | card 192×240 in a 264 panel | card 204×255 in a 272 panel | hover or long-press anywhere, including the board | A N S W K + T | [1366](../screens/cardsize1/codex-hover--card-pop-visual-cardpop-1366.jpg) · [390 panel](../screens/cardsize1/codex-hover--hover-popover-cardpop-390.jpg) | **Full + text** (decision D1) |
| 5 | In-match card | `boardCardHTML` / hand strip / leader / HQ tiles, all `--match-card-w/h` | 114–131 × 142–164 (raid 73–80 × 91–99) | 49–75 × 61–93 | board, hand, leader, both Brambles, deck stacks | A N(desktop) S W K, live status | [board](../screens/cardsize1/fight--board-card-board-row-1366.jpg) · [hand](../screens/cardsize1/fight--hand-strip-bottom-play-row-1366.jpg) · [390](../screens/cardsize1/fight-full-390.jpg) · [raid](../screens/cardsize1/raid-fight-full-1366.jpg) | **Compact** |
| 6 | Environment / field cards | `envCardHTML`, `matchFieldTileHTML` · `.env-card` (fanned) | 117–142 × 144–173; raid 64–70 × 142–145 | 77–81 × 95–98; raid 52–55 × 65–67 | top row of a fight | A N + one rule line | [1366](../screens/cardsize1/fight--env-card-1366.jpg) · [raid](../screens/cardsize1/raid-fight--env-card-1366.jpg) | **Compact** |
| 7 | Deck builder: pool | `renderMyDeckPanels` · `.pool-grid .card-tile` (`width:100%`) | 175×219 | 105×131 | Camp › deck › the cards you own | A N S K | [1366](../screens/cardsize1/deck--pool-stack-pool-grid-1366.jpg) · [390](../screens/cardsize1/deck--pool-stack-pool-grid-390.jpg) | **Full** |
| 8 | Deck builder: loadout | `.dchip .card-tile` | 101×126 | 74×93 | Camp › deck › Your Loadout | A N S K | [full](../screens/cardsize1/deck-full-1366.jpg) · [390](../screens/cardsize1/deck--pool-stack-dchip-390.jpg) | **Full** |
| 9 | Deck builder: Bramble and leader | `.dt-tile` (120×150, 104×130, 96×120) | 96×120 | 96×120 | top of the deck builder | A N S | [390](../screens/cardsize1/deck--dt-tile-dt-slot-390.jpg) | **Full** |
| 10 | Deck picker popup (skirmish decks) | `openDeckBuilderPopup` · `.dbp-stack` | 84×105 | 88×110 | skirmish and test decks | A S C W K | [1366](../screens/cardsize1/deck-popup--pool-stack-dbp-stack-1366.jpg) · [390](../screens/cardsize1/deck-popup--pool-stack-dbp-stack-390.jpg) | **Full** |
| 11 | Codex album | `renderCodexGrid` · `.cx-tile-wrap` | 93×116 (name 8px) | 61×77 | Codex › Browse | A S W K (name too small to read) | [1366](../screens/cardsize1/codex--cx-tile-wrap-al-sleeve-1366.jpg) · [390](../screens/cardsize1/codex--cx-tile-wrap-al-sleeve-390.jpg) | **Full** |
| 12 | Forge pool | `.forge-tile` | 94×118 | 106×133 | Forge | A N S K | [1366](../screens/cardsize1/forge--forge-tile-pool-grid-1366.jpg) · [390](../screens/cardsize1/forge--forge-tile-pool-grid-390.jpg) | **Full** |
| 13 | Match deck view | `openMatchDeckView` · `.mdv-card` | 105×132 | 96×120 | a fight › a deck pile | A N S C K | [1366](../screens/cardsize1/fight-deckview--mdv-card-pool-grid-1366.jpg) · [390](../screens/cardsize1/fight-deckview--mdv-card-pool-grid-390.jpg) | **Full** |
| 14 | Profile showcase | `.ds-tile` (92×115) | 92×115 | – | Profile | A N S | [full](../screens/cardsize1/profile-full-1366.jpg) | **Full** |
| 15 | Win screen: cards won / seen | `.rw-card` (12 clamp rules, 54–170px by vh and vw) | about 125×155 when settled | 82×102 won · 62×78 seen | Victory panel | A S C W K | [390](../screens/cardsize1/rewards--rw-card-res3-g-390.jpg) · [full](../screens/cardsize1/rewards-full-390.jpg) | **Full** (won) · **Compact** (seen) |
| 16 | Pack summary | `.po2-front` in slots, `.po2-mini` | 65×81, minis 53×66 | 56×70, minis 42×53 | pack opening, last step | A S W K | [1366](../screens/cardsize1/pack-summary-full-1366.jpg) · [390](../screens/cardsize1/pack-summary-full-390.jpg) | **Full** (cards) · **Chip** (minis) |
| 17 | Map fight panel: leader showcase | `.cnp-showcase` | 79×96 | 79×96 | map › a fight's panel | A S C W K | [1366](../screens/cardsize1/map--cnp-showcase-cnp-head-1366.jpg) | **Compact** |
| 18 | Map fight panel: enemy squad | `.cnp-sq-card` | 62×78 | 62×78 | map › a fight's panel | A S C W K, ×copies | [1366](../screens/cardsize1/map--cnp-sq-card-cnp-sq-wrap-1366.jpg) · [390](../screens/cardsize1/map--cnp-sq-card-cnp-sq-wrap-390.jpg) | **Compact** |
| 19 | Map fight panel: first-clear reward | `.cnp-rw-card` (+ 150px `.cnp-rw-zoom` on hover) | 52×65 | 52×65 | map › a fight's panel | A S C W K | [1366](../screens/cardsize1/map--cnp-rw-card-cnp-rw-items-1366.jpg) | **Compact** (hover › Full) |
| 20 | Map card chips (VIS4, PACK1) | `vis4MapCardTilesHTML` · `.vis4-mc-card` | 44×55 | 38×48 | map panel "This map's cards", Map cards dialog | A S W (all text unreadable) | [1366](../screens/cardsize1/map--vis4-mc-card-vis4-mc-row-1366.jpg) · [390](../screens/cardsize1/map--vis4-mc-card-vis4-mc-row-390.jpg) | **Chip** |
| 21 | Map review tile (REVIEW1, admin) | `rv1TilesHTML` · `.rv1-tile` 92 wide (a 44×55 chip + caption) | 92×139–163 | 92×132–156 | Map cards dialog, admin review | chip + who/why caption + Cut button | [1366](../screens/cardsize1/map-cards--review-rv1-tile-1366.jpg) · [full](../screens/cardsize1/map-cards-full-1366.jpg) | **Chip** + caption |

Card-like elements outside `.card-tile` that the audit also met: graveyard peek `.gpk-mini` (art + name row), Bramble codex `.char-card`, trench `.tr-card`, castle `.ab-castle-tile`. All of these become **Chip** or **Full**.

Sizes found only in the CSS, for screens not opened here (each is a separate hard-coded width): hero card 150×188, Stomping Grounds plinth 168×210 and hp cards 120×150 / 84×105, entrance fan 168 and 184, raid reward flip 220×275, card decorator 180, card editor preview 150×196 / 110×144, Discover 78×108, Forge bulk 62×78, deck mini `.dm-card` 52, tutorial deal `.ss-card` 82, lumber lesson 96×120, first pick 70, deck-swap thumbs 36 / 46 / 72 / 86 / 112, group dungeon hand 84 / 100, Arena offers 150 / 104 and slots 130, faction showcase `min(9vw,112px)`, Codex full-art grid 168, admin grid `scale(.8)`, inventory `.fc-tile` `zoom:.62`. All of these map onto the same four sizes: big, one-at-a-time views become Detail; browsing grids become Full; dense previews become Compact; thumbnails become Chip.

Findings along the way:
- **Six separate 3D flip implementations**: `.ci-*` (Inspector), `.po-*`, `.po2-*` (packs), `.ef-*` (entrance fan), `.rr-*` (raid reward), `.pl1-fsf-*` (faction showcase), plus `.flip3d-*` (Forge anvil). Detail would replace them with one.
- **Names are unreadable on most browsing tiles.** The Codex tile's name renders at 8px at 1366 and is hidden at 390. The map chips and squad cards show no name.
- **The raid's top row is squeezed.** Its Bramble and environment tiles measure 64–70×142–145 at 1366 (aspect 0.45, not 0.8).
- **The in-match size varies between runs at the same width** (114 vs 131 px at 1366), because it follows the viewport height (`100dvh`). This is intended, but every test of the board must state its viewport height.
- **The same 1366 screen can hold four sizes at once.** Example: the map panel shows the leader at 79, the squad at 62, the reward at 52 and the chips at 44.

## 2. Proposal: four sizes

One renderer, `cardTileHTML(d, {size})`, adds `data-size="detail|full|compact"` to `.card-tile`. Each size is one CSS custom property. The tile is already a size container (`container-type:inline-size`, text in `cqw`), so the card's own container queries decide what fits. The calling screen chooses the size and never sets a pixel width. `cardChipHTML(d)` is the one separate renderer, because a chip is not a card.

| Size | Token | 1366 | 390 | Shows | Motion |
|---|---|---|---|---|---|
| **Detail** | `--card-detail-w: min(400px, 86vw, (100dvh - 190px) * .8)` | 400 | about 335 | everything: A N S C W K, skill names and text, flavour; the back has lore, the level table and where to get it | tilt with parallax on the art, drag to spin, tap or Enter to flip; reduced motion swaps faces with no rotation |
| **Full** | `--card-full-w: clamp(84px, 22vw, 120px)` | 120 | 86 | A N (2 lines, about 13px at 120) S C W K, rarity frame | hover tilt (`.card-tile-magnetic`) in browsing screens only, as the style guide says |
| **Compact** | in a match `--match-card-w` (fluid 49–131), elsewhere `--card-compact-w: 64px` | 64 / board | 64 / board | A S C W K; the name only when the card is 70px or wider (container query) | combat animation only (unchanged) |
| **Chip** | `--chip-h: 30px` | 30 tall | 30 tall | art disc with a rarity ring, name; optional ⚔/❤ | none; a tap opens Detail |

**Detail is the tactile card the owner asked for.** It merges the Card Inspector (the spin stage) with the Card Detail overlay (the text). On desktop the card sits left and the text right; on a phone the text sits below. The back face carries lore, the level table and where to get the card, instead of today's plain crest. The mock shows a working tilt, parallax, drag-to-spin and flip, and it respects `prefers-reduced-motion`.

### Where each current variant goes

| Current | Becomes | Loses | Gains |
|---|---|---|---|
| Inspector, Card Detail, pack reveal, raid reward flip, hero card, Stomping plinth, entrance fan, decorator / editor previews | **Detail** | the 820px two-column panel's fixed width (the text panel stays, at a fluid width); the separate admin finish picker moves under the card | one flip and tilt everywhere; the pack reveal can be spun; the back face has content |
| Codex, Forge, Nest, deck builder pool / loadout / top slots, deck picker popup, match deck view, profile showcase, cards won, pack summary cards, shop, Arena offers, Discover, tutorial picks | **Full** | the deck builder pool shrinks 175→120 at 1366 (more cards per row); Forge 106→86 at 390 | the Codex grows 93→120 at 1366 and 61→86 at 390, so names become readable; one grid size everywhere |
| Hover popover's card visual | **Full** + its text block (D1) | the larger 192–204px picture | the same look as the card you hovered |
| Board, hand, leader, HQ tiles, environment cards | **Compact** (`--match-card-w`, unchanged lever) | the 8px name on a phone board (hidden below 70px; tap for Detail) | the stats can use the space the name took |
| Map leader / squad / reward previews, "cards seen" on the win screen | **Compact** 64px | the leader showcase shrinks 79→64 | the three previews match each other |
| Map card chips (VIS4, PACK1), REVIEW1 tiles, pack summary minis, graveyard peek, deck mini, deck-swap thumbs, log mentions, drop lines | **Chip** | Attack / Health / Wait on the map chips (unreadable today; optional ⚔/❤ suffix) | a readable name; one token for logs and inline mentions |

### Risky spots

1. **Board fit at 390.** The board already shrinks to 49×61 with five units per lane. Compact keeps `--match-card-w` and its fluid formula, and adds only the container query that hides the name below 70px. The mock's phone board shows 5+5 units and a 4-card hand at 62px. The style guide forbids per-context board sizes, and this proposal keeps that rule.
2. **Lane layout and GSAP Flip.** Flip diffs element boxes, and the play animation reads board uids from the DOM. Do not restructure `boardCardHTML` (the style guide calls it "separate, on purpose"). Only add `data-size="compact"` to the inner tile. Move in-match last, in its own package with an owner playtest.
3. **Pack opening.** `.po2-front` flies from the 360px reveal into 65px summary slots, and the flight measures both boxes. When the reveal becomes Detail and the slots become Full, test the flight (`tests/e2e/bv_2026_10_24.py` checks for stray cards in the air), the bonus-copy slot and the Shiny/foil layers at the new sizes.
4. **The win screen fits by height.** Twelve `clamp(…)` rules fit it into short windows. A fixed Full width can overflow at `max-height:720px`. Keep a `min(var(--card-full-w), 19vh)` cap there.
5. **Performance.** The Codex can draw several hundred tiles, in chunks (`codexChunkSizes`). Full at 120px draws the same number of tiles, a bit larger. Container queries are cheap; avoid `backdrop-filter` and per-tile `will-change`. 3D, parallax and the glare layer run on the one open Detail card only, never on grids.
6. **Foils and holo layers** (`holo-*`, `foil-fx`) use their own px sizes in places (molten drips, sakura petals). Check them at 400px (Detail) and at 64px (Compact).
7. **Long names and other languages.** Full uses a 2-line clamp, Compact a single line with ellipsis. Re-check the longest name in the roster, and German and Russian (`lang/`).
8. **Touch.** Detail's drag-to-spin must not fight the overlay's scroll: use `touch-action: pan-y` on the stage, as the mock does. Today's Inspector uses `touch-action:none`.

## 3. Migration plan

| Step | What | Effort | Test |
|---|---|---|---|
| 0 | **Done 2026-10-30 (CS-A).** Tokens on `:root`: `--card-detail-w`, `--card-full-w`, `--card-compact-w`, `--chip-h`. `cardTileHTML(d, {size})` writes `data-size`, default `full`. Base rules `.card-tile[data-size=…]{width:var(…)}` plus the name/stat container queries. No call site changes yet. | 0.5 d | `node --check`, smoke, codex e2e (nothing should move) |
| 1 | **Done 2026-10-30 (CS-A, with step 0; see below).** Browsing screens (low risk): Codex, Forge, Nest, deck builder (pool, loadout, top), deck picker popup, match deck view, profile showcase, shop. Delete each screen's width override as it moves. | 1.5 d | `tests/e2e/codex_cx_2026_10_19.py`, `codex_perf.py`, `filters_2026_10_19.py`, `mobile_layout_2026_10_19.py`, deck builder tests; shots at 390 and 1366 |
| 2 | **Done 2026-10-30 (CS-B, with step 3; see below).** Previews: the map fight panel (leader, squad, reward → Compact 64), win screen (won → Full, seen → Compact), pack summary (→ Full). | 1.5 d | `rw4/rw5/rw6`, `pl2_2026_10_25.py` (pack summary, rewards), `bv_2026_10_24.py` (pack flight), `map_2026_10_24.py`, `res3/res4` |
| 3 | **Done 2026-10-30 (CS-B), except the deck-swap thumbs.** `cardChipHTML(d, {stat})` replaces `zonePeekMiniHTML`, the VIS4 chips, `.po2-mini`, `.dm-card`, the deck-swap thumbs, and card mentions in the log and drop lines. | 1 d | `review1_2026_10_29.py`, `pl1`, `tt_2026_10_24.py`, a11y (chips need an `aria-label`) |
| 4 | **Done 2026-10-30 (CS-C, with step 5; see below).** **Detail**: one overlay from `openCardInspector`'s stage and `openCardDetail`'s text. Tilt, parallax, drag-to-spin, the back face, reduced motion. Pack reveal and the raid reward flip reuse the Detail card. Retire the other flip implementations as their screens move. | 2.5 d | `a11y.py`, `flows.py`, `ne_2026_10_24.py` (pack card detail), `pl2` (popover over the opener), a new check: open, tilt, flip, Esc closes, reduced-motion has no transform |
| 5 | **Done 2026-10-30 (CS-C).** Hover popover: show the Full card plus text (or text only, per D1). | 0.5 d | `tt_2026_10_24.py`, `battle_ui_2026_10_19.py` |
| 6 | In-match (separate package, owner playtest): board, hand, leader, HQ and environment tiles get `data-size="compact"`. Fold the 42 `--match-card` definitions into one formula where the breakpoints allow. Hide the name below 70px. Fix the raid's squeezed top row. | 1.5–2 d | smoke, `battle_ui`, `mobile_layout`, `en2`–`en8`, `fx4`, `live_two_player.py`, `coop2`, raid e2e, full `--e2e` at 390 and 1366 at two viewport heights |
| 7 | Cleanup: delete dead width rules. Add a static test that fails on a new px `width` for `.card-tile` outside the four tokens (the allowed list lives in the test). | 0.5 d | the new test, `tests/run.js` |

### Step 0–1 done (package CS-A, 2026-10-30)

Owner decisions 2026-10-30 10:34: CS-1 (D1) hover shows the Full card plus text; CS-2 (D2) Detail keeps the **decorative back** (no lore or levels on the back); CS-3 (D3) Full on a phone is 86px, 4 a row; CS-4 (D4) map card lists become Chips; CS-5 (D5) hide the board's name under 70px.

What shipped: the four tokens on `:root` (the `CS-A:BEGIN` block in `arena_template.html`), `cardTileHTML(d, {size})` writing `data-size`, and the Full size on: Codex (album and grid view), Forge pool, Nest Younglings picker, deck builder (pool, loadout, Bramble and leader slots), deck picker popup (pool), match deck view and an opponent's deck, profile showcase (also the deck menu's showcase), cards won (with the 15vh / 17vh / 19vh caps kept for short windows), pack summary, Flea Market (browse and the Sell preview), Arena offers and slots, the Discovered! pop. Guard: `tests/cs-a-2026-10-30.js`. Shots: `docs/screens/cs-a/` (`<screen>-before|after-<width>.jpg`).

Deviations from the plan:
- **No default size.** `cardTileHTML` writes `data-size` only when the caller names a size (the plan said default `full`). A default would have moved every unmigrated screen and the in-match cards at once.
- **Grids use `--card-full-col`**, `min(var(--card-full-w), (100% - 3 gaps) / 4)`, re-declared on each grid so it reads that grid's `--cs-gap`. So a phone always shows 4 a row, but a card is 86px only where the grid is about 370px wide. Measured at 390: pack summary, cards won, Arena, Discover, deck slots, showcase 86; Codex 81-85; deck view, deck picker, Flea Market 77-81; deck pool and loadout 72-73 (the Camp's wooden frame), Forge 74, Nest 72. To reach 86 everywhere the frames (Camp curtain, Forge panel, modals) have to thin further: a layout call, not a card one.
- **Width of the content column.** The column is `max-width:80%` everywhere, which left 292px for a phone grid (4 cards of 68px, and names hidden under 70px). On a phone the Codex, Camp, Nest and Flea Market now use the full width with 10px panel padding, and the deck picker, Nest picker and deck view modals are near full width (`:has()` rules in the CS-A block). At ≥1100px the Codex column widens to `min(1330px, 98vw)` so two album pages fit 4 Full cards a row.
- **A Full card always shows its name**, even under 70px (the 70px container query that hides it stays for the board, CS-5).
- **Not moved yet:** the deck picker's deck strip (`.dbp-deck .dbp-stack`, 66px), the pickers' "large cards" pool view (`.is-pooled`, 150px, owner package MP), the Codex's full-art view (168px), the Arena's castle offers (`.ab-castle-tile`, not a card tile), cards seen on the win screen (Compact, step 2), the pack reveal and its tray (`.po2-deck`, `.po2-slot`, step 2 / 4), and the Forge's anvil and bulk previews. The guard's `LATER` list names the first two.

Risks for the next steps: the pack summary is Full but the tray the flight lands in is not, so step 2 must check the flight (`bv_2026_10_24.py`) when the tray moves; the win screen's cards won are Full with vh caps (step 2 only has to move cards seen); the Codex's wider column at ≥1100px and the phone `:has()` rules are layout and may meet other packages' layout work.

### Steps 2–3 done (package CS-B, 2026-10-30)

What shipped:
- **Compact** (`size:'compact'`, `--card-compact-w` 64px): the map fight panel's leader (and a paired boss's two), enemy squad and first-clear reward card (its token and pack chips take the same width; packs stay `auto`), the cards seen on the win screen, the deck picker's deck strip (`.dbp-deck`), the Forge's Disenchant / Fuse-all preview (`.fbulk`). The reward zoom (`wireRewardZoom`, also used by every chip with `data-zoom`) shows the Full card (was 150px).
- **Chip**: `cardChipHTML(d, {stat, n, mystery, noDefid, extraClass})` and `cardChipEl` (the same as an element). 30px tall, the art in a disc ringed by `--rarity-a/b`, the name (ellipsis past about 192px), an optional ⚔/❤ and ×N. The disc's emoji comes from `data-ico` in CSS, so a chip's text is only its name. With `data-defid` the page's one popover opens it (hover 1 s, hold); `noDefid` when the wrapper zooms (`data-zoom`). Used by: VIS4's strip and a no-review list in the 🃏 Map cards overlay (`vis4MapCardTilesHTML`), the Camp deck's card list (`deckCardsStripHTML`), the graveyard peek (`zonePeekMiniHTML`), the drop line (`cnpDropsLineHTML`), the battle log (`logChipify`, inline at 1.6em), the pack pile.
- **Full**: the pack tray (`.po2-got.has-slots`), the Forge's anvil (every `forge-preview`), the review tiles in the 🃏 Map cards overlay.
- Guard: `tests/cs-b-2026-10-30.js` (CS-A's guard with these screens' selectors; `--chip-h`, `--po2-slot-w` and `--cc-h` count as tokens). Shots: `docs/screens/cs-b/<screen>-before|after-<width>.jpg` (map-panel, map-strip, map-cards, map-cards-review, rewards-seen, pack-tray, pack-summary, deck-popup, deck-menu, forge-anvil, grave-peek, battle-log).

Deviations from the plan and the brief:
- **The pack tray is Full, not Chips.** The plan listed `.po2-mini` under Chip, and CS-A flagged the flight landing in 46px slots. The tray now has one Full slot a card (a row up to 6, else two), capped by the row (`(92vw - gaps) / per`) and the window (`22vh / rows * .8`): 120px at 1366, 86px at 390 for a 3-card pack. While the tray shows, the reveal card is `min(50vh * .8, 80vw, 360px)` (was 58vh), so both fit at 1366×768. The flight now aims at the slot itself: before, it aimed at the mini while the mini's pop animation had it at 30% of its size, so the copy landed small and the mini popped up under it. A pile (big sets, no slots) lists Chips; its flight lands on the chip's disc.
- **The Forge's anvil is Full, not Compact.** The brief listed "the Forge's anvil previews" under Compact; the anvil shows the one card being forged, with its level line under it, so a 64px card with no name would be smaller than the pool beside it. Full (120px; was 140px, 150px at the Blacksmith). The bulk preview (62px, many cards) is the Compact one.
- **The 🃏 Map cards overlay keeps large cards for the review** (owner 10-29 19:14, large cards in the review gallery): Chosen / Maybe / Cut tiles are the Full card (was 128px). Only a list with no review yet and VIS4's strip in the skirmish panel are Chips, as CS-4 says.
- **The log's chips are inline**, at the line's height (1.6em, about 20px), not 30px: a 30px chip would double every log line. Same chip, `--cc-h` overridden.
- **Not moved:** the deck-swap thumbs (36 / 46 / 72 / 86 / 112px; not in this brief), the reveal itself (step 4), the drop lines of the results screen (they are text, no card).
- A Compact card hides its name under 70px (CS-5; the container query from CS-A), so the map previews and the cards seen show no name; hover or tap for it.

Risks for the next steps: chips in VIS4's strip take more rows than the 44px tiles (2 a row on a phone; the panel scrolls); step 4 should make the reveal the Detail card and keep the tray's slot measure (`--po2-slot-w`) so the flight still lands on a Full slot.

### Steps 4–5 done (package CS-C, 2026-10-30)

Owner decisions 2026-10-30 10:34: CS-1 (D1) the hover popover shows the Full card plus text; CS-2 (D2) the Detail card keeps the **decorative card back**.

What shipped:
- **One Detail card** (`detailCardHTML(d, o)` for the markup, `mountDetailCard(el, o)` for handling it, `dcSetFace` for a screen that only turns it over; the `CS-C` blocks in `arena_app.js` and `arena_template.html`). Size `--card-detail-w`: 400px at 1366×860, 86vw (335px) on a 390 phone. It tilts under a mouse or pen with a little parallax on the art and a light that follows the pointer; a sideways drag turns it (a flick turns it further) and it settles on a face; a tap, Enter or Space flips it to its back, the arrows turn it half a turn; ↻ Spin turns it once round. With `prefers-reduced-motion` or Effects Low / None (`detailStill`) there is no rotation and no tilt: the back simply replaces the front.
- **Touch:** the stage is `touch-action:pan-y` (was `none` on the Inspector). A drag only turns the card once it has moved more than 8px sideways and 1.3× more sideways than down; a vertical drag is let go at once and the page or the overlay scrolls. The pointer is captured only after that sideways intent. The tap after a spin is swallowed, so a spin never also flips or moves on.
- **The seven flips are one** (the audit counted six plus the Forge's): the Inspector (`.ci-*`), the pack reveal (`.po2-*`), the reward reveal after a fight, a raid's card included (`.rr-*`), the entrance fan (`.ef-*`), the faction showcase (`.pl1-fsf-*`) and the Forge's before / after (`.flip3d-*`) all draw `detailCardHTML`; the old class names ride along as aliases, so their own effects and tests still find them. The Hero's plinth had no flip; it is the Detail card now.
- **Screens:** the Card Detail overlay's card is the Detail card, with the Inspector's controls under it (Spin, Flip, an admin's finishes, skins, ▶ Attack); the modal is 1000px wide (was 820). The pack-results viewer (`openCardInspector` with a pull, over the pack opener) shows the same card and controls with the card's details beside it. The pack reveal is the Detail card face down, turned up on reveal; once up a drag turns it and it settles face up. The reward reveal turns the card over as the shine flashes (it faded before). The Hero on its plinth (Stomping Grounds, the Camp's Hero Hall) is the Detail card.
- **Hover popover (CS-1):** `#cardPop` shows the Full card (was 150px, 204px in the parchment theme) plus its text; a caller can add a line with `data-pop-line`. The gallery popover beside a preview or a chip (`wireRewardZoom`, the Map cards review) shows the Full card plus the card's skills and flavour and the review's reason (`data-zoom-why`), above a modal (z 900; UI3's fix kept). Both stay on screen: with no room beside the card the page popover goes above or below it, and the gallery popover beside it when there is no room above or below.
- **Kept:** CS-B's tray (`--po2-slot-w`) and the flight's aim at the slot; the reveal is the Detail size, capped at `50vh × .8` while the tray is under it (344px at 1366×860, as before; 335px at 390, was 312). `tests/e2e/bv_2026_10_24.py`'s pack checks pass at both widths.
- Guard: `tests/cs-c-2026-10-30.js` (CS-A's guard on the Detail screens, with `--dc-w` / `--cw` declarations checked too). Browser checks: `tests/e2e/cs_c_2026_10_30.py`. Shots: `docs/screens/cs-c/<screen>-before|after-<width>.jpg` (inspector, detail, pack, raidflip, plinth, hover, zoom).

Deviations from the plan and the brief:
- **The back is the card's decorative backing** (CS-2), not lore, levels and where to get it. The texts the plan expected for the back were not needed; three new keys (`ui.csc-flip`, `ui.csc-hint`, `ui.csc-card-aria`) are for the Flip button, the hint and the stage's accessible name.
- **The Card Detail overlay is the inspector.** Its 🔍 Inspect button and the second overlay it opened are gone; `openCardInspector` without a pull (the Nest's viewer) opens the Card Detail overlay. Only the pack-results viewer keeps a full-screen overlay of its own, because it sits over the pack opener (z 9500).
- **The Inspector's idle sway and its free-coasting flick are gone**: tilt and a drag that settles on a face replace them (the mock's behaviour). The light and the edge-on dimming are drawn only while the card is handled (a filter and a blend layer only then).
- **Not every one is the Detail size.** The entrance fan (five cards fanned on the splash, 168 / 184px), the faction showcase (`min(9vw, 112px)`) and the Forge's anvil (Full, CS-B) turn over the same markup but keep their own sizes; the guard lists the fan and the showcase. On a phone the Hero is `min(Detail, 100vw − 110px)` (280px at 390) so its badges stay inside the plinth's panel. The reward reveal is not spun by a drag, since any tap skips it; it tilts.
- **Not moved:** the card decorator and the card editor's previews (not in this brief).

Risks for the in-match step (6): the board's hover / hold popover is now the Full card (120px at 1366, 81-86px on a phone, was 204px) and on a narrow window it goes above or below the card instead of beside it, so check the phone board's hold-to-peek over the hand (`tt_2026_10_24.py`, `battle_ui_2026_10_19.py`); the headless renderer here draws only a few frames a second while the home screen or the pack opener is up, so GSAP's lag smoothing stretches timelines (the CS-C browser checks turn it off, or wait on states, not times); in-match cards must not use `mountDetailCard` (its sideways drag would fight the hand's drag-to-play).

### Steps 6–7 done (package CS-D, 2026-10-30)

What shipped:
- **Compact in a match.** `size:'compact'` on the board's inner tile (`boardCardHTML`; the live face now writes `data-size` too), the hand (`renderHand`), the leader (summonable and caged), both Brambles (`matchCastleTileHTML`) and the Environment / field cards (`matchFieldTileHTML`, also the Arena's rule cards, which `.arena2` sizes). The `.board-card` wrapper and its `data-uid` are untouched. In a match a Compact card is `--match-card-w` wide (the CS-D block); outside one it stays `--card-compact-w` (64px). No in-match renderer uses `detailCardHTML` / `mountDetailCard`.
- **One formula.** `#appWrap.in-match, #appWrap.in-match .battlefield{--match-card-h: calc(clamp(var(--mc-min), min((100dvh - var(--mc-top)) / 4.55 * var(--mc-fit), (100vw - 110px) / 6.72), var(--mc-max) * var(--mc-fit)) * var(--mc-k, 1)); --match-card-w: calc(var(--match-card-h) * .8)}` at ≥701px. Parameters: a computer 104 / 214 / 149 / fit 1; a tablet `--mc-min:92px` and the field `--mc-k:1.15`; a big screen `--mc-top:250px; --mc-max:240px`; a desktop window `--mc-fit: var(--res3-fit, 1)`. Five copies of the formula (tablet, tablet field, big screen, two desktop-window ones) became parameter lines.
- **`@property --match-card-w/h`** (`<length>`, inherited): a calc in them is computed to px where it is declared, so `mb2FitPhoneBoard`'s `parseFloat(getComputedStyle(app).getPropertyValue('--match-card-w'))` keeps reading px.
- **Step 7 cleanup:** the phone's `#appWrap .battlefield{75x93 / 62x78}` pair (dead in a match: MB2's `:not(.mb2-raid)` and `.mb2-raid` battlefield rules always won, and a battlefield only shows in a match) and UI1's raid repeat after the desktop-window rules (with those rules setting only `--mc-fit`, the raid's own pair wins). Guard: `tests/cs-d-2026-10-30.js` fails on a new px `width` / `min-width` / `max-width` on any `.card-tile` outside the tokens; 41 existing ones are on its allow list, each with the screen it belongs to, and an entry that disappears must leave the list.
- Browser checks: `tests/e2e/cs_d_2026_10_30.py`. Shots: `docs/screens/cs-d/` (`skirmish-`, `raid-`, `raid-admin-`, `peek-hand-`, `peek-board-` × `before|after` × viewport).

Measured (CSS px, card width; before = after unless noted): 390×844 board 70, hand / leader / Brambles 75, Environment 77; 390×667 62 / 62 / 64; 768×1024 board 90, hand 78; 1024×768 board 112, hand 97; 1366×768 97, 1366×860 114, 1920×1080 146 with the desktop fit pinned at 1 (at 1.15: 112 / 131 / 168, both builds). Raid: 390×844 board 66–68, hand 68, top row 51×64; 1366×768 board 62–64, hand 74, top row 64×80; 1366×860 board 74–76, hand 76, top row 64×80; with Admin Mode the same.

Deviations from the plan and the brief:
- **Phones keep their step at 700px tall** (75×93, 62×78), not a fluid formula: a height formula on a phone would use `svh` / `dvh`, and on an iPhone with Safari's bars showing that would give a short-phone card on most phones (and change size as the bars hide). Breakpoints don't allow it there.
- **The name hides under about 90px, not 70px, of card width.** The CS-5 container query reads the tile's content box (inside the border and the 7px side padding), so "70px" is the inside. Kept as it was: every phone card hides it, the 768 tablet's board hides it, 1024 and up shows it. Changing it would show an 8px name on phone hands, which D5 wanted gone.
- **The raid's squeezed top row** was already fixed by UI1 (10-29, O1): measured card-shaped (0.8) at 390 and 1366 at both heights, with and without Admin Mode. CS-D removes the cause (no rule sets the height alone; the registered pair) rather than adding a fix. Left as is: on a phone the fanned Environment cards cut each other's "ENVIRONMENT" ribbon, and the raid's top row is ¾ of the hand's size by design (MB2b).
- **Not deleted (on the allow list):** `.rw-card .card-tile{width:84px / 118px}` — their widths are dead (every reward tile has `data-size`), but the same rules set the cards' height; the win screen's vh caps; and the screens no step moved (deck-swap thumbs, Stomping Grounds, group dungeon, Forge refine, card editor / decorator, Lumber lesson, Codex full-art, tavern, VIS5 leader art…).
- **Measuring at 1366:** the desktop window's `--res3-fit` loop (`centreFieldInFs`) see-saws and stops wherever its 12 passes end, so the same 1366×768 window gives 97 to 117px between loads, before and after this package. The e2e's `--fit` pins it to compare builds. A fix belongs to the RES3 owner (a damped step, or reset `_fitN` only on resize).

Risks / for the playtest: the hand's hold-to-peek popover is see-through (opacity about .6 while the finger is down, before and after); the popover over the hand on a 390×667 phone sits over the board's top half; `@property` needs Safari 16.4+; an older browser treats the pair as before this package (the phone values the JS reads are plain px either way).

Total: about 9 to 11 agent-days, as 5 packages: steps 0–1, 2–3, 4–5, 6 and 7. Each package touches `arena_app.js` and `arena_template.html`, so run them in sequence. Texts: Detail's back face needs a few new TX keys (for example "Where to get it"), which also need translations.

## 4. Decisions for the owner

- **D1. Hover popover**: show the Full-size card with its text (as today, slightly smaller), or text only, since the hovered card is already on screen? Proposed: Full card plus text on the board, where the cards are small, and text only in browsing grids.
- **D2. Detail's back face**: lore, the level table and where to get the card (proposed), or keep the decorative card back?
- **D3. Full on a phone**: 86px (4 per row in the Codex) or 96px (3 per row, larger art)? Proposed: 86px.
- **D4. Map card lists** (VIS4, PACK1, REVIEW1) as Chips: they lose the tiny Attack / Health numbers but gain readable names. Agree?
- **D5. The board's name below 70px wide** (most phone boards): hide it and let the stats grow (proposed), or keep the 8px name?

## Files

- `docs/design/card-sizes-2026-10-29.html`: the mock page (four sizes, a working tilt and spin, the phone board).
- `docs/screens/cardsize1/`: crops (`<screen>--<context>-<width>.jpg`), full screens (`<screen>-full-<width>.jpg`), true-scale sheets.
- `tools/cardsize1_shots.py`: the audit script (throwaway; `python3 tools/cardsize1_shots.py --widths 1366 --only codex,fight`). A full run takes about 20 minutes per width.
