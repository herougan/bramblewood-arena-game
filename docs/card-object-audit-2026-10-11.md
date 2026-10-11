# Card object audit (2026-10-11)

The request: "audit the card objects: parenting, number of elements, children of hidden parents, tooltip fade hooks (e.g. OnFade → Tooltip.Fade()). Use best practice rather than following this one-to-one."

## What a card is made of

These counts were measured in a live Conquest match (headless Chromium, 1366×860).

| Card | Elements | Deepest nesting | Inline styles | Hidden parents with children |
|---|---|---|---|---|
| Board card (a flyer) | 20 | 6 | 3 | none |
| Hand card | 16 | 4 | 2 | none |
| Whole battlefield, 4 cards on it | 104 | | | |
| Whole page in a match | ~650 | | | |

The board card's parents run in this order:
- `.board-card` is the slot. It owns the position, the Flip/GSAP transforms and the death classes.
- `.fly-shadow` and `.fly-body` are present for flyers only.
- `.card-tile` is the face. It owns the art, the name, the stats and the badges, plus the foil layers when the card has them.

The tree is lean. Nothing heavy is kept hidden inside a card:
- There are no `display:none` parents carrying children.
- There are no zero-size leaves.
- There are no ids, so cloned or re-rendered cards cannot collide.

The emoji fallback next to the art image costs one extra node. It shows only when the image fails, so it stays.

## Problems found

1. **Tooltips outlived their card.** These three tips only closed on `mouseleave`/`mouseout`:
   - the 1-second detail popover (`#cardPop`);
   - the delayed button tooltip (`attachDelayedTooltip`);
   - the tiered deck tooltip (`attachTieredHoverReveal`).

   A re-rendered or removed element never fires those events. If the pointer stayed still while the card re-rendered, died or faded, the tip stayed up. The popover had a partial guard that only ran on mouse movement.
2. **A delayed tooltip could open for an element that was already gone.** The timer fired after a re-render.
3. **Tips didn't fade with their card.** A dying card faded out while its tip stayed fully opaque.
4. **A shattering token left its slot frame behind.** Only the inner tile was hidden. Fixed in `pixelShatterVfx`, which now hides the whole slot.
5. **The bleed-out colour wash was drawn over the whole slot,** not on the card. It is now a `.bleed-tint` inside the tile, clipped to the card's frame and moving with it. Only the falling drops stay on the slot.

## Fix: one lifecycle for every floating tip

Per-element fade callbacks (`OnFade → Tooltip.Fade()`) would have to be wired into every place a card can fade, die, re-render or be hidden. There are dozens of such places, and each new effect would need remembering. Instead, `TipWatch` in arena_app.js inverts it:
- A tip registers the element it describes when it opens: `TipWatch.track(tip, anchor, hide)`.
- While any tip is open, one `requestAnimationFrame` loop follows its anchor. With nothing open, nothing runs.
- The tip takes on the anchor's effective opacity (the product of its own opacity and its parents'), so it fades with the card.
- The tip closes as soon as the anchor is removed, hidden (`checkVisibility`, which covers hidden parents), shrunk to nothing, or faded below 3%.
- Tips that close normally simply stop being tracked.

`#cardPop`, `attachDelayedTooltip` and `attachTieredHoverReveal` use it now. The delayed tooltip also checks `isConnected` before opening. The coach tips already follow a re-rendered anchor, and stay put when the anchor is lost, by design (2026-10-05), so they are left as they are. The drag-time Lumber tip is driven by the drag itself, so it is not tracked.

New floating UI that points at a card should call `TipWatch.track` when it opens, and should not add fade or remove hooks to the card.
