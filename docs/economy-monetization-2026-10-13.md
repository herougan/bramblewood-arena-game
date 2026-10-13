# Economy and monetization (D35, draft 2026-10-13)

**Status:** proposal. Nothing here is built or priced in a store yet. Numbers are starting points for the balance pass that comes later (your call on D45).

## 1. Currencies today

| Currency | Glyph | Kind | Earned from | Spent on |
|---|---|---|---|---|
| Maple Leaves | 🍁 | Soft | Fights, sweeps, dailies, selling cards | Packs, Forge, Market |
| Gold Leaves | 🍂 | **Premium** | Real money; small amounts from achievements, weeklies and events | Bigger packs, cosmetics, convenience |
| Magic Dust | ✨ | Crafting | Fusing duplicates, rewards | Forge levels and upgrades |
| Metal | 🔩 | Crafting | Packs, map rewards | Forge, castles |
| Krooni | 👑 | Special | Highcrest Case | Still open (proposal: cosmetic shop) |
| Laurels | 🌿 | PvP | Arena fights (3 a win, 2 a draw, 1 a loss) | Proposal: Arena-only cosmetics, card frames |
| Kibble | 🦴 | Pets | Fights | Nest and babies |

**Rule of thumb:** Gold Leaves are the only currency you can buy. Everything bought with them must also be reachable through play, just slower, except cosmetics.

## 2. Real money → Gold Leaves

Stores set the local price from a price tier, so SGD prices come from the store's own SGD tier for each USD price. The SGD column is an estimate (about 1.35× USD) to show the shape; the real number is whatever Apple, Google or Steam's SGD tier says.

| Bundle | USD | SGD (est.) | Gold Leaves | Bonus | Per USD |
|---|---|---|---|---|---|
| Handful | 0.99 | ~1.38 | 60 | – | 61 |
| Pouch | 4.99 | ~6.98 | 330 | +10% | 66 |
| Satchel | 9.99 | ~13.98 | 700 | +17% | 70 |
| Chest | 19.99 | ~27.98 | 1,450 | +21% | 73 |
| Hoard | 49.99 | ~68.98 | 3,800 | +27% | 76 |
| Treasury | 99.99 | ~138.98 | 8,000 | +33% | 80 |

- **First purchase:** double Gold Leaves on each bundle, once.
- **Bramble Pass** (subscription, 4.99 USD / 30 days): 330 Gold Leaves up front, then 15 Gold Leaves and one Hedgerow Pouch every day you log in (about 780 Gold Leaves and 30 pouches of value). It's the best value per dollar on purpose, the way most card games anchor spending on a pass.
- **Web build:** card payments through a processor (Stripe or similar) need a business entity, tax handling and refunds. Steam's build must sell through Steam's own in-game purchase system (see the Steam plan).

## 3. Packs per player

Pack prices today: Hedgerow Pouch 50 🍁 (3 cards), Tidemire Chest 120 🍁 + 10 🍂 (5 cards), Highcrest Case 250 🍁 + 30 🍂 (8 cards), Mystery Booster 80 🍁 (3 cards, trader only).

Proposed Gold Leaves prices so a pack can be bought with premium alone:

| Pack | Maple price | Gold Leaves price | Cards |
|---|---|---|---|
| Hedgerow Pouch | 50 🍁 | 25 🍂 | 3 |
| Tidemire Chest | 120 🍁 + 10 🍂 | 60 🍂 | 5 |
| Highcrest Case | 250 🍁 + 30 🍂 | 120 🍂 | 8 |

**Targets per player (to tune in the balance pass):**

| Player | Packs a week | Where they come from |
|---|---|---|
| Free, plays daily | 5–7 | Dailies (1 pouch a day), weeklies (1 chest), map first-clears, Maple Leaves from fights |
| Bramble Pass | 12–14 | Free income plus a pouch a day |
| Spender (~20 USD a month) | 15–20 | Above plus about 2 chests a week |

A free daily player should finish the Map 0–20 collection (the 163 map cards plus packs 1–4) in about 3–4 months; a Pass player in about 2.

## 4. Monthly pack-purchase bonuses

Counts packs **opened** in a calendar month (bought with any currency, so free players reach the first steps too). Resets on the 1st.

| Packs this month | Bonus |
|---|---|
| 10 | 1 Tidemire Chest |
| 25 | 1 Highcrest Case + 100 ✨ |
| 50 | A guaranteed Epic from the current band |
| 80 | A foil of any card you own (pick) |
| 120 | Monthly card back (cosmetic) |

Plus a **pity timer** that already fits the pack data: a guaranteed new card while any remain (`newGuaranteed`), and a guaranteed Epic or better every 30 packs.

## 5. Two progressions

**Game progression** (how far you are): maps cleared, rank, Wildpath points, Forge tier, Tavern Energy upgrades. It can't be bought. Money only speeds up resources, never skips a gate (Forge tiers still wait for their maps; card rewards still need rank B/A/S on later maps).

**Collection progression** (what you own): cards, levels, foils, castles, cosmetics. Packs, the Market and the Forge drive it. The collection screen should show both: "Map 0–20 cards 112/163" and "Pack 2 complete 18/28".

Standard PvP (built 2026-10-13) sits outside both: every card at Level 1, so the spinoff and playtests need neither.

## 6. Guardrails

- **Publish pack odds** in the Shop (the pack editor already stores rarity weights and foil chances). Some countries regulate paid random items, so odds disclosure and the pity timer should ship from day one.
- **No pay-to-win in ranked PvP:** levels already count, so Ranked Live should use a level cap or the Standard format.
- **Spending limits:** an optional monthly cap in Settings, and age-gated purchases where the store requires it.
- **Refund-safe:** Gold Leaves bought with money are tracked separately from earned ones, so a refund claws back the right amount.

## Decisions for you

1. Do the bundle sizes and the 4.99 USD Bramble Pass look right?
2. Should Krooni and Laurels buy cosmetics only?
3. Ranked Live: level cap or Standard format?
