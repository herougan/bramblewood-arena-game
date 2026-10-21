# Resources as a strategic choice (2026-10-19, package SK2b)

The owner (23:43): *"In our balancing, do we have 3 simple skills -> to generate lumber every turn, stone every turn, and metal every turn? Maybe for metal, it's 2 lumber + 2 stone = 1 metal. For stone, it's possible to harvest it, but it usually takes lumber. Lumber usually comes from millers or trees themselves or bounty. I want to make resources really a strategic move. Not a simple - just put. Strong creatures can be low costed - and their power is that they are low costed."*

## What exists today

Counts are of the 758 live cards (no pool, test or token cards).

| Resource | Where it comes from |
|---|---|
| **Lumber** | **Pitching** a card: 1 a turn. This is the main source.<br>**Bounty N:** 86 cards. You get N when it is played; the foe gets N when it dies.<br>**onReadyGold:** 12 cards, every turn while Ready.<br>**onSpawnGold.**<br>**On Kill → Gain:** 5 cards. **On Ready → Gain:** 1 card.<br>**Midas Touch:** 2 cards.<br>**Swipe N:** 3 cards. Steals from the foe.<br>**Rules:** the Leylines II / III fields, the castle's Lumber every N rounds, Lumber Rush.<br>**Lumberjack:** +1 on every gain (1 card).<br>**SK2 (no card yet):** Milling N (every turn, free), Harvest (half its swings), Scavenge N, M (deaths nearby). |
| **Stone** | **Petrified Tree:** On Turn Start × Gain 1 Stone. Expensive, with nothing to pay.<br>**Leylines III:** +1 a round to both sides.<br>**The CPU's Deep Mines rule** (`enemyOre`).<br>**Salvage N, M:** Structures dying nearby.<br>**Heavy Metal:** +1 on every Stone or Metal gain (1 card).<br>**New: Quarry N.** |
| **Metal** | **Ore-Smelter Mole:** On Ready → Gain 1 Metal, once.<br>**The CPU's Deep Mines rule.**<br>Nothing gives Metal every turn. **New: Smelter N.** |
| **Uranium** | **Irradiated Axolotl:** On Ready → Gain 1. |

What costs it:

| Resource | Cards that cost it |
|---|---|
| Lumber | Lumber 0: 288 cards. 1: 341. 2: 84. 3: 29. 4: 15. 5: 1. |
| Stone | 3 cards (Malachite Golem, Dynamite Packrat, Caldera Wyrm). |
| Metal | 1 card (Caldera Wyrm). |
| Uranium | 2 cards. |

So today Stone and Metal hardly matter: almost nothing needs them, and almost nothing makes them.

## The three tiers

All three are **On Turn Start × Gain** in the engine's trigger layer (`trigsOf`). They fire every turn while the unit is Ready. The new price condition (`t.pay`) makes the upper tiers cost the lower ones.

| Tier | Skill | Each turn while Ready | Default ratio (`SK2_DEFAULTS`) |
|---|---|---|---|
| Lumber | **Milling N** | +N Lumber, free | N = 1 |
| Stone | **Quarry N** | pay 1 Lumber, gain N Stone | `quarryLumber` 1, N = 1 |
| Metal | **Smelter N** | pay 2 Lumber + 2 Stone, gain 1 Metal, up to N times | `smelterLumber` 2, `smelterStone` 2, `smelterMetal` 1 |

The Petrified Tree stays as the no-input Stone source. It is expensive: Lumber 5 and Wait 3 for a 0/45 wall.

Rules of the price:
- A trigger with a price goes off only if its player holds all of it. It pays as it goes off, after every other gate: Waiting, Stunned, Frozen or Asleep, a Confused fumble, Slippery, the filters, and SK3's gates. A fizzle never costs anything.
- A Smelter's conversion is paid whole or not at all.
- If it can't pay, nothing happens, and the log says so.
- Units act in the upkeep's order. On each side that is the left flank from the centre out, then the centre, then the right flank. A Quarry that acts before a Smelter can feed it the same turn; placed the other way round, the Smelter waits a turn.
- Any trigger can carry a price, for example "On Turn Start: pay 1 Metal, heal 5". It is a general condition, not a Quarry special.

**Name:** I chose **Smelter** over "Forge-works". The Forge is already the card-upgrade screen, so "Forge-works" would read as part of it. "Smelter" also echoes the Ore-Smelter Mole, the one Metal card.

### Why this makes resources a choice, not a given

- **Every tier costs a slot, a play and tempo.** A Quarry or Smelter on the board is a unit that isn't fighting well. The upper tiers also eat the tier below: Stone costs Lumber, and Metal costs both. A deck that wants Metal commits to an engine of 2–3 units and gives up Lumber it could have spent on plays.
- **Engines are fragile on purpose.** Arson, Sabotage and Pickpocket all hit the lowest rank first. Killing the Quarry starves the Smelter. Order and positioning matter, so the engine is a board puzzle, not a timer.
- **Lumber stays the common currency.** Pitching gives everyone 1 a turn. Milling and Bounty speed it up. Only decks that build for it reach Stone and Metal.
- **Costly cards need an economy.** A card costing 2 Stone + 1 Metal is out of reach for a deck without the engine. That is its real price, more than any stat line.

### Weapons from Stone (owner, Oct 21)

A fourth use for the tiers is equipment.

- **Anvilwhisker Otter** is the owner's "Otter Smith". The owner asked for cool names only, so I named it; "Otter Smith" works as its title if he prefers. It is On Turn Start (once Ready) with a price: pay 1 Stone, then **Forge Weapon 1**. That lays a +1/+0 Forged Blade, an equipment token, in your free slot nearest it. Package EQ's rules then apply: a unit played, spawned or moved onto the blade picks it up and gets the bonus a round later. With no free slot, nothing is laid and no Stone is paid. Without a Stone source (a Quarry or a Petrified Tree) the smith does nothing.
- **Disarm** ("weapon stealer") is On Play × Disarm plus On Hit × Disarm.
  - On play, it takes the foe's lone piece in the slot facing it, else the nearest one.
  - On a hit, it takes the hit unit's piece, with that piece's Attack, Health and skills.
  - It takes nothing if it already carries a piece, and it equips the stolen piece for a round, as with any piece.
  - The card is **Glintsnatch Magpie**.
- Both cards are at the end of `canonical/cards.json` with `awaitingSource`.

**Equipment checks (owner item 17)**, run in `tests/skills-sk2b-2026-10-19.js` on top of EQ's own tests:
- Equipment goes under a unit.
- A unit played, spawned or moved onto a lone piece picks it up. A unit that already carries a piece walks over it and leaves it.
- The bonus comes after one round.
- When its unit dies, the piece stays in the slot. On a packed (gravity) row, which has no slots, it goes to the graveyard.
- A piece moves with its unit (Restless).

All of these hold.

## Lumber from the first maps (owner, Oct 21: "I want lumber to be naturally introduced in Map 1")

Maps count from 0, so Map 1 is **Thistlewood** (`mf`). Recommendations only; rewards belong to another package.
- **Village Miller** is already in Thistlewood's Burrow Line deck (1-3) and is a pack tier-1 card. It is literally a miller, so give it **Milling 1**. Because Milling costs S 3, lower it from 4/7 to about 2/7 to stay in budget. Make it the reward for winning 1-3, so the player meets a free Lumber source on the map where the CPU shows it off.
- **Harvest Mouse** is a starter card in the 1-1, 1-2 and 1-3 decks. Give it **Harvest**: half its swings become Lumber, and a mouse in an empty lane always harvests. That teaches the choice between "hit, or bank Lumber" in the first fights.
- **Land Tiller** has `onReadyGold 1`, which is the same rule as Milling in an older form. Re-key it as Milling 1, so the Codex shows one skill instead of two names for one rule.
- **Later, not Map 1:** Badger Lumberjack (+1 on every gain, pack tier 1, Map 5) as the "speed it up" step. Quarry Mole is a Base card that is already in Thistlewood's 1-3 deck; give it **Quarry** when Stone cards start to matter (around Map 5–10), so the second tier arrives with the cards that need it.

## The owner's principle: cheap strong cards

> "Strong creatures can be low costed - and their power is that they are low costed."

A cheap strong card is a design tool, not a balance error. Its strength is the tempo it buys: it comes down early, needs no engine, and leaves the turn's resources for something else. The other end of the curve is the reverse. Costly cards are strong *because* they need an economy, and the economy is what the opponent can attack.

## What it means for the budget (recommendations only; nothing changed)

1. **The Lumber term.** The budget gives a card more stats per Lumber of cost (perLumber 4 + 0.4 L²). That term assumes Lumber is hard to come by: 1 a turn from pitching. With Milling (and Bounty), engine decks reach high costs sooner, so each Lumber of cost buys less real delay. **Recommend:** after Milling / Quarry / Smelter are on real cards, measure the win rate of 3+ Lumber cards in decks with and without a mill. If it climbs, lower perLumber2 rather than perLumber.
2. **Stone and Metal have no budget term yet.** The budget only reads Lumber, Wait, rarity, Ritual and the map. The raid's leader cap already counts Stone 2 and Metal 3 points. **Recommend** budget terms perStone ≈ 2 × perLumber and perMetal ≈ 3 × perLumber, plus a small tier tax for the engine a deck must build. Add them once Stone and Metal cards exist (today 3 and 1).
3. **Cheap strong cards.** The budget's N rises with cost, so a strong 0–1 Lumber card reads as over budget. **Recommend:** don't bend the curve for them. Mark such cards as a deliberate class (a `tempo` note in `creatorNote`, or a flag the budget check skips), and keep it to a few cards a map.
4. **The skill-cost table.** Its Gain action is worth 1 a point whatever the resource, and it can't see a price. That is why Quarry and Smelter are keyword estimates (Quarry n 2.5, Smelter n 1.5, low confidence), while Milling is a plain shorthand (On Turn Start × Gain). **Recommend:**
   - Weight Gain by rank: Stone ×2, Metal ×3.
   - Subtract a trigger's price at the same weights.
   - Then Quarry and Smelter become shorthands like Milling.
5. **The CPU** doesn't value Milling, Quarry or Smelter when it picks cards, and doesn't order them on the board. It should learn both before these skills go on road cards.
