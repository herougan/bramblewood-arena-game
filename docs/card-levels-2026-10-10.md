# Card levels (2026-10-10)

**Your rule:** "the tutorial cards + starting deck cards start at level 0, but everything starts at level 1. Codify this."

## Base level
- **Level 0:** starter-deck and tutorial cards: every Basic, Starter rarity and the Wandering Traveller. A card with `tutorial: true` also counts.
- **Level 1:** everything else.
- A card's printed stats are its stats at its base level.
- The Forge and every level shown start from the base level. The level badge only appears once a card is above it.
- Enemy deck levels count enemy cards at their base level, so a deck of Basics is Lv 0.

## When stats grow (your schedule)
| Step | Level | Default gain (placeholder) |
|---|---|---|
| Major | 0 → 1, 3, 6, 9 | +10% Attack and Health (rounded) |
| Minor | 10 | +5% |
| None | 2, 4, 5, 7, 8 | — |

- **Big-number cards** can gain on every level: give the card `levelStats`, absolute stats per level, e.g. `{"2": {"attack": 11, "health": 52}, ...}`. Any level listed there overrides the default.
- **The real numbers for higher levels are still to come.** We design from base levels first, as you said.

**In code:** `cardBaseLevel`, `LEVEL_STEPS`, `LEVEL_STEP_GAIN` and `statsAtLevel` in `arena_app.js`. `getCardLevel` never returns less than the base level.
