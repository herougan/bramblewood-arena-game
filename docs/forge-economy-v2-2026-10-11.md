# Forge economy v2: everything in Materia Units (2026-10-11)

This replaces the Dust tables in [forge-economy-2026-10-11.md](forge-economy-2026-10-11.md). The Tempering Stone and Dragon Scale gates, the Blacksmith, the Nest and the Scale Trail from that note are unchanged.

## The unit

**1 Materia Unit (MU) is what a Common card costs to level from 1 to 10: 675 Dust and 450 Maple Leaves.** Every price and payout below is set in MU, with Dust shown for reference. Code: `MATERIA_UNIT` and `MU()` in `arena_app.js`.

## Levelling costs (to level 10)

| Rarity | × | MU | Dust |
|---|---|---|---|
| Common | 1 | 1 | 675 |
| Uncommon | 2 | 2 | 1,350 |
| Rare | 4 | 4 | 2,700 |
| Very Rare | 6 | 6 | 4,050 |
| Super Rare | 8 | 8 | 5,400 |
| Epic | 11 | 11 | 7,425 |
| Heroic | 14 | 14 | 9,450 |
| Unique | 17 | 17 | 11,475 |
| Legendary | 21 | 21 | 14,175 |
| Mythic | 25 | 25 | 16,875 |
| Ancient | 30 | 30 | 20,250 |
| Beyond Ancient (divine…) | 36 | 36 | 24,300 |

The step price still climbs with level, as before: (15 + 12 × level) Dust × the multiplier.

**Modifiers on top of rarity:**
- **Base, Quest and map-reward cards** (cards you can't get from boosters) cost **×0.5**.
- **Event cards** cost **×1.5**.
- **A hero card** costs **×2**. Today the hero levels by battle XP, and its Dust sink is the Materia crystals, so the ×2 applies once heroes get Forge levels.

Special rarities count as the tier they stand for: Quest = Uncommon, Quest-Unique = Unique, Dev-/Event-Legendary = Legendary, and so on.

**Material gates (unchanged):**
- Epic and up need a 🪨 Tempering Stone for each of levels 7–10.
- Mythic and Ancient also need a 🐉 Dragon Scale for level 10.

**Castles** level to 20 and cost 4× a card of their rarity:
- Levels 0–10 cost what the card would.
- Each step from 10 to 20 costs three times the matching step.
- The plain (Common) Castle costs 2,760 Dust in all; a Rare castle 11,040.

## Duplicates

A spare copy fed to its own card (Forge → 🧩 **Feed a duplicate**) banks 1/N of that card's whole 1→10 cost as credit on the card. The next levels spend that credit before your wallet.

| Rarity | Duplicates for 1→10 (N) | One duplicate (Common-card terms) |
|---|---|---|
| Common to Super Rare | 18.75 | 5.3% of the card's cost |
| Epic, Heroic, Unique | 17.5 | 5.7% |
| Legendary | 15 | 6.7% |
| Mythic | 13 | 7.7% |
| Ancient | 10 | 10% |
| Beyond Ancient | 8.5 | 11.8% |

- A Common duplicate is worth 36 Dust (+24 Leaves).
- A Legendary duplicate is worth 945 Dust (1.4 MU).
- Foil, Shiny and skinned copies are never used up.

## Disenchanting

A copy melts for a share of one MU, by rarity:

| C | U | R | VR | SR | E | H | Unique | L | M | A | A+ |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 0.25% | 0.55% | 1.15% | 1.75% | 2.4% | 3.25% | 4.1% | 5.0% | 6.2% | 7.3% | 8.5% | 10% |

That's 2 Dust for a Common and 50 for a Mythic, against 36 and 1,298 as a duplicate. Duplicates are the better use; disenchanting clears clutter.

**Treatments multiply it** by (1 + bonuses):
- A foil finish adds +1 to +3:
  - +1: pearl, reverse, starlight.
  - +2: rainbow, prism, hex, etched, ice, lattice.
  - +3: cosmos, gold.
- Extended art adds +1.
- An alternate-art skin adds +1.
- Shiny adds +1.

**Melt down** (Forge → 🔥) takes a card back to its starting level:
- 97% of what its levels cost comes back, plus any banked duplicate credit.
- Its spare copies melt too, with their treatments.
- One copy stays, so you still own the card. My reading: a full delete would fight the cloud-synced unlocks.

Base, Quest and Event cards can't be disenchanted or melted.

## Where materia comes from

| Source | MU | Dust |
|---|---|---|
| **Daily notices** (6 a day) | ~0.12 each on average (D 50 · C 60 · B 70 · A 110 · S 300 · SS 600 · SSS 1,200) | ~3,450 a week |
| **Weekly quests** (3 tiers) | 0.77 + 0.51 + 0.25 = 1.5 | 1,035 a week |
| **A week of the minimum** (notices + weeklies; the Arena counts through its notices and weekly tier) | **≈ 6.6** | ≈ 4,480 |
| **A month** | **≈ 28** (almost an Ancient to level 10) | |
| **Achievements** | 0.10 to 0.50 each | 68 to 338 |
| **First clears** | skirmish 0.03 · elite 0.10 · boss 0.25 · raid boss 0.40 · campaign boss 1.0 | 20 · 68 · 169 · 270 · 675 |
| A map's first clears | ≈ 0.5 | ≈ 300–400 |
| **Boosters** (flat, by rank) | Sprout 1.5% · Mystery 2% · Acorn 3% · Golden 4.5% | 10 · 14 · 20 · 30 |
| **Raids** | ~5–15% a run (×3 from before); the kill reward is extra | 25–100 |
| Repeat clears (the Energy grind) | elite 5 · boss 10 · raid boss 15 · campaign boss 25 Dust | |

**Other Dust prices were raised 5×** to match the higher income: Prestige, foil treatments, Blacksmith recipes, Materia crystals and Promotion.

## Battle rating (replaces deck level)

- **Per card:** rating weight × level factor. The weight uses the same ladder as the levelling multiplier (Common 1 … Ancient 30, Base 0.5). The level factor is 0.7 at a Base card's level 0, 1 at level 1 and 3.79 at level 10.
- **Leader:** counts double.

| Deck | Rating |
|---|---|
| A new Otter / Hummingbird starter deck | 29 / 24 |
| Par for Map 20 | 400 |
| A full level-10 Ancient deck with an Ancient leader | ≈ 2,500 |

**Enemy ratings** are the rating a player should bring. Enemy decks are small, and their strength is in the castle.
- **The road's curve:** about 12 at Map 1, rising ~20% a map to 400 at Map 20.
- **Inside a map:**
  - skirmishes run from 85% to 115% of par;
  - an elite is 115%, a boss 130%, the campaign boss 140%;
  - a side map adds 10%.
- **Override:** the skirmish editor's **Battle rating** field sets a fight's own.

## Readings I took (say if any should change)

1. **"First time completions can give …"** was cut off, so I set them myself (table above).
2. **Raids:** "how much raids give" had no number, so I tripled raid Dust to ~5–15% MU a run.
3. **Which cards are "can't get through boosters":** I counted map rewards as well as Base and Quest cards, so they cost half. Blacksmith and secret cards cost full.
4. **Arena:** the Arena's share of the week comes through its daily notices and weekly tier. A win still pays 0–1 Dust, per your earlier rule.
5. **Boosters now pay a little Dust again.** This replaces your earlier "nothing was destroyed" rule.

## Limit break and Base growth (2026-10-12)

**Limit break: Lv 11.**
- Needs a level-10 card that has been fed **5 duplicates** at any time. Melting doesn't take them back.
- Costs what the card's whole road to 10 cost, again: 1 MU for a Common, 0.5 MU for a Base card. Duplicate credit on the card pays first.
- Level 11 is a major step: +10% Attack and Health.
- The Forge shows an 11th pip and a 💥 panel on a level-10 card.

**Castles break 20 → 25.**
- Each step costs 4× the last normal step, rising a quarter per level.
- Each step also needs advanced materia:
  - 🔥 Ember Cores: 1 for each of the first two steps, 2 for the next two, 3 for the last.
  - A 🐉 Dragon Scale for the last step.

**Base cards grow on the road.**
- A boss's first clear raises up to 2 Base cards in your deck by a level, lowest first.
- An elite's first clear gives a spare copy of one, a duplicate to feed.
- With no Base card left that can grow, you get the same value in Dust.
