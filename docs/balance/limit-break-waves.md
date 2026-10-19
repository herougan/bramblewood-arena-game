# Limit break in waves (design only, 2026-10-19, package BF2)

Owner, 15:25: "There will be waves of balance during limit break. (Older cards get a bigger step than newer cards.)" This is decision B9. Nothing here is built.

## Today

- A Lv 10 card can limit-break to **Lv 11** (`LIMIT_BREAK_LEVEL`).
- Its Lv 11 step is the Forge curve's: everything banked from v5's ΔN(11), at least 1 point. That comes to +1 to +4 points of 2A+H on a typical card.
- Every card gets the same rule, whatever its age.

## The proposal

1. **A card's age is its Map:** the map where it becomes obtainable, the same `cardObtainMap` number the budget's map term uses.
2. **The newest wave is W:** the last map of the newest content released (24 today).
3. **The limit-break step scales with age:** step = the curve's Lv 11 points × (1 + (W − Map) / 20), rounded, at least the plain step.

   | Map | Step at W = 24 | Example: a 4-point Lv 11 step |
   |---|---|---|
   | 0 (Base cards) | ×2.2 | 9 |
   | 12 | ×1.6 | 6 |
   | 20 | ×1.2 | 5 |
   | 24 | ×1.0 | 4 |

   The extra points go in through the same shape rule as the curve: Attack where it keeps A:H, the rest Health.
4. **A wave raises the cap for older cards.** When a release moves W by 10 or more maps, each card with Map ≤ W − 10 gets one more limit-break level (Lv 12, then 13, …). Each new level is priced like Lv 11: the road to Lv 10 again, plus duplicates.
   - **Its step:** the same age formula. Its budget is N(L) for the new level, so the stats stay inside N.
   - **Example:** at W = 34, cards from Maps 0–24 can reach Lv 12. At W = 44, cards from Maps 0–34 can reach Lv 12 and cards from Maps 0–24 can reach Lv 13.
5. **Over-budget guard:** a wave step never takes a card over N(L) at its new level. Where it would, the step stops at the budget, as the Forge curve's room check already does.

## The numbers to decide

| Knob | Proposed |
|---|---|
| Age divisor | 20 (a card 20 maps older gets double) |
| Wave size | 10 maps |
| Cap rise per wave | 1 level |
| Floor | The plain Lv 11 step |

All four are one constant each, next to `LIMIT_BREAK_LEVEL`.
