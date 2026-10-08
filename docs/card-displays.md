# Card displays: inventory and reuse (2026-10-08)

Question from the owner: *"What kind of card displays do we have... As much as possible, we want to reuse code."*

## The one shared face: `cardTileHTML(d, opts)`

Almost every card picture in the game is this one function (52 call sites). It draws the frame, art, name banner, rarity band, cost/wait badges and the attack/health stats. Its options are:

- `inPlay`
- `editable`
- `magnetic` (tilt on hover)
- `extraClass` (foil finish, Shiny, skin)
- `extraAttrs`

Size comes from the container's CSS, not from the function. Because everything shares this function, a new finish, Shiny or skin works everywhere at once.

| Where | Container | Notes |
|---|---|---|
| Hand | `#handStrip` | live card; drag ghost via `handDragGhost` |
| Codex grid, Codex detail | `.codex-grid`, `.cd-*` | |
| Card editor preview | `#cePreview` | flashes once, then the glint follows the pointer |
| Card inspector (big, spinning) | `.ci-front` | finishes, skins, ▶ Attack preview |
| Deck editor pool | `#myDeckPool` | magnetic tilt |
| Deck list strips | `.dm-cards` (`deckCardsStripHTML`) | |
| Deck hero banner / showcase | `.dt-smear`, `.deck-showcase` | leader tile |
| Nest | `nestCardHTML` | stack depth, best copy's finish/Shiny (`bestCopyClass`) |
| Pack reveal + summary | `.po2-front`, `.po2-sum-card` | real foil finish of each pull (`pullClass`) |
| Discovered pop-up | `.discover-card` | |
| Hall of Fame | `.hof-tile` | |
| Market | `.mk-item` | |
| Auto-battle offers | `.ab-offer` | |
| Starter-deck step, leader picker | `.lp-tile` | |
| Board card | `boardCardHTML` → `cardTileHTML(d, {live})` | Since 2026-10-08 the wrapper adds HP bars, statuses, fly shadow and Flip hooks around the shared face. |
| Hand card | `renderHand` → `cardTileHTML(d, {hand})` | Since 2026-10-08. |

## Displays that are *not* `cardTileHTML`

| Display | Function | Why separate | Plan |
|---|---|---|---|
| Hover pop-over | `fullCardHTML` | Text-heavy rules card (abilities, tags, pitch yield); not a picture | Keep. |
| Castle tiles | `castleTileHTML`, `matchCastleTileHTML` | Castles are not cards | Keep. |
| Trench | `trenchTileHTML` | Compact row cell for the Trench mode | Could become `cardTileHTML` at mini size. |
| Chips (deck list, reward lines, pack editor) | `.dchip`, `.pe-chip` | Text chips, not pictures | Keep. |
| Deleted-card ghost | `deletedTileHTML` | Admin tombstone | Keep. |

## Layers that sit on top of any tile

These are all classes, so they work on every display above:

- Foil finishes: `is-holo holo-<finish>`, via `holoClass` / `copyFinishClass`. `holo-starlight` (star sparkles) is a separate layer that can sit on any finish; Legendary and up wear Cosmos + Starlight.
- Shiny hue shift: `is-shiny` plus `--shiny-hue`.
- Skins: `skin-<id>`, from `UnitFX.SKINS`.
- Rarity frame: `rarity-tier-*`.

## Clean-up done today

Removed:

- `nodeRewardCardsLineHTML`
- `cnpRewardsPreviewHTML`
- `packUnlockCandidates`
- `toggleCardCopyFoil`
- The unreachable resume-offer body and its CSS.
