# ENG18: adjacency audit (2026-11-02)

Owner, 2026-11-02 19:56: "Adjacent in front, behind, left, right. Surrounding includes corners."

This is a dated snapshot. The engine (`bramblewood-engine.js`) decides; the texts (`bramblewood-texts.js`) say what it decides. Read from the code on this date; behaviour was not changed by this package. The behaviour changes the definition would imply are calls in `docs/decisions.json` (ENG18-1 to ENG18-5).

## The words

| Word | Owner's definition | Engine helper | Where front / behind count |
|---|---|---|---|
| **Adjacent** | front, behind, left, right (4) | `adjacentOf` (left / right in the unit's own row, plus `frontBehindOf`) | Only where every row fights (`RESERVE_ACTS`): raids, and group dungeons (`bramblewood-coop.js` builds its table with `reserveActs: true`). On a one-row fight it is left / right; a waiting reserve row is never adjacent. |
| **Surrounding** | adjacent plus the 4 corners (8) | `surroundingOwnOf` (Dynamite also adds the 3 enemies facing it), `sk2Near` (Scavenge, Salvage) | The own side's rows in front / behind on raid and group-dungeon boards; off them, "in front" is the enemy line across. |

Both are Codex glossary terms (`KEYWORD_TERMS` in `arena_app.js`): Adjacent is now TX `ui.eng18-term-adjacent` (it was a hard-coded string that named raids only), Surrounding is `ui.term-surrounding` (now names group dungeons too).

Engine column key: **4** = adjacent (4 directions), **8** = surrounding, **L/R** = left and right in its row only, **cols** = a column shape across the board (the target's column and the ones beside it), **near** = the nearest free slot in its row.

## Every skill, aura and rule that reads neighbours

| # | Skill / rule | Engine (function) | Engine now | Text says (key) | Matches the owner's words? |
|---|---|---|---|---|---|
| 1 | Guardian | `redirectToGuardian` -> `adjacentOf` | 4 | "an adjacent ally (beside it; in a raid, in front or behind)" (`ui.eng9-guardian`) | Yes. Text said "in a raid" only: **reworded** "in a raid or group dungeon, in front or behind too". |
| 2 | Spellward | `spellwardFor` -> `adjacentOf` | 4 | "aimed at an adjacent ally" (`ui.sk-spellward`) | Yes |
| 3 | Formation | sk1 aura (row +-1 column; column +-1 row with `RESERVE_ACTS`) | 4 | "for each adjacent ally" (`ui.sk-formation`) | Yes |
| 4 | Haste | `computeSpeeds` -> `adjacentOf` | 4 | "adjacent allies Speed +1" | Yes |
| 5 | Shieldwall | `sk3Beside` | 4 | "Its adjacent allies" (`ui.sk3-shieldwall`) | Yes |
| 6 | Amplifier | `sk3Beside` | 4 | "Its adjacent allies" (`ui.sk3-amplifier`) | Yes |
| 7 | Immolation | upkeep -> `adjacentOf` + the facing enemy | 4 + facing enemy | "the units adjacent to it and the enemy facing it" | Yes |
| 8 | Irradiated | upkeep -> `adjacentOf` + the facing enemy | 4 + facing enemy | "adjacent units and the enemy facing it" | Yes |
| 9 | Inspiring | swing: own row's columns +-1 + `frontBehindOf` | 4 | "its adjacent allies" | Yes |
| 10 | Friction | same as Inspiring | 4 | "each adjacent ally" | Yes |
| 11 | Proliferate | `proliferateTick` -> `adjacentOf(foe, carrier)` | 4 | "a unit adjacent to it / them" (`ui.sk-proliferate*`) | Yes |
| 12 | Electricity | `adjacentFoesOf` | 4 | "one enemy unit adjacent to the target" | Yes |
| 13 | Chain Lightning | `adjacentFoesOf` (each jump) | 4 | "an enemy unit adjacent to it" | Yes |
| 14 | Dragon Lightning | `dragonLightningStrike` -> `adjacentOf` | 4 | "a unit adjacent to it" | Yes |
| 15 | Spitfire (its splash) | `adjacentFoesOf` | 4 | "1 to an adjacent unit" (`ui.sk-spitfire`) | Yes |
| 16 | Trigger target: Adjacent Ally / Adjacent Kin | `resolveGeneralTarget` sub `adjacent` (ally) | 4 | "an adjacent Kin unit" | Yes |
| 17 | Trigger target: Adjacent Enemy | `resolveGeneralTarget` sub `adjacent` (enemy) -> `opposingCardOf` | the enemy directly in front | "an adjacent enemy" | Yes ("in front"; the enemy has no left / right of yours) |
| 18 | Bloom (where the copy grows) | `bloomSlotOf` | 4 (a free slot) | "Beside it means left or right, or in front or behind on a board with more rows" (`ui.bl-codex`) | Yes |
| 19 | Parasite with Bloom (riding a host) | `en7ParasiteBloomHosts` -> `adjacentOf(foe, host)` | 4 | Codex | Yes |
| 20 | Beak Strike (the Goliath Core) | `arena_app.js` raid attack -> `redirectToGuardian` | 4 | "A Guardian beside it takes the blow" (`ui.eq2-strike-desc`) | Loose: **reworded** "A Guardian adjacent to it". |
| 21 | Stench (and any SK3 `area` target) | `sk3Targets` area: the facing enemy + `sk3Beside` of it | 4 around the facing enemy (raid / group dungeon: also the enemy behind it) | "the enemy facing it and those beside it" (`ui.sk3-stench`) | Loose: **reworded** "and the units adjacent to that one". GD2-5 listed Stench among the shapes that keep their form, but GD2 moved `sk3Beside` to 4: call **ENG18-3**. No card has Stench today. |
| 22 | Co-op / group-dungeon cells | `ownedCells` | 4 of your own units, plus your own row's centre; never another row's centre (ENG17) | COOP3-2 / COOP3-3 | **Yes, confirmed** (test: a lone unit at 1:2 opens 1:1, 1:3, 0:2, no diagonal). |
| 23 | Dynamite | `fireDynamite` -> `surroundingOwnOf` + the 3 enemies facing | 8 | "every surrounding unit" (`ui.sk-dynamite`) | Yes. The long Codex line ("the units beside it and the three enemy units facing it (a 3x3 around it)") reads the one-row board; fine. |
| 24 | Scavenge, Salvage | `sk2Near` (rows +-1, columns +-1) | 8 | "a surrounding unit / structure" (`ui.sk2-scavenge`, `ui.sk2-salvage`) | Yes |
| 25 | Shore Up | `en4ShoreUp` -> `rowOrderOf` +-1 | L/R | "the allies beside it"; Codex "left and right of it in its row, not in front or behind" | Matches its text (owner EN4 option B). Not "adjacent" by the new word: call **ENG18-2**. |
| 26 | Pack (chains) | `packChainsOf` -> `physicalRowOrder` | L/R, front row only (middle / back rows never chain) | "side by side" (`ui.sk-pack`, `ui.skx-pack`) | Matches its text; "adjacent" would add front / behind: call **ENG18-1**. |
| 27 | Pack placement (CPU) | `packPlacementFor` | L/R slots of front-row Pack kin | (AI) | Follows ENG18-1. |
| 28 | Fireball | `besideOf` | cols (target + left / right in its row) | "3 columns wide ... the units beside it" | Yes (a shape; GD2-5 keeps it) |
| 29 | Meteor | `besideOf` | cols | "({m} beside it)" | Yes (shape) |
| 30 | Rocket | front row slot +-1 | cols | "1 to its neighbours" | Yes (shape, GD2-5) |
| 31 | Cleave, Swipe | target column +-1 | cols | "the units beside its target" | Yes (shape) |
| 32 | Fork, Trident, Pitchfork, the pinch | combat columns | cols | lines L / C / R | Yes (shape) |
| 33 | Taunt | facing column +-1 | cols | "facing it, or one column to either side" | Yes |
| 34 | Sentry | `sentryWatches` (slot +-1) | cols | "the 3 slots facing it" | Yes |
| 35 | Landslide (skill and field) | `fireLandslide`, `columnBurst` | cols | "the enemy facing it and the enemy on each side" / "three neighbouring columns" | Yes |
| 36 | Rampart | `rampartShare` (attacker's column +-1) | cols | "from its column or beside it" | Yes |
| 37 | Pounce | facing, else one beside it | cols | "the foe facing it, else one beside it" | Yes |
| 38 | Parasite reach, Fog of War reach | your units' columns +-1 | cols | "beside one of your units" | Yes |
| 39 | Isolation | units within 2 columns, any row | (distance) | "no ally within 2 columns" | Yes (not adjacency) |
| 40 | Twin, Sprout, Brood, Revive N, Duplicate, death tokens, Relic, Meiosis | `spawnBeside` -> `nearestFreeSlot` / `rowFreeSlotNear` (BF6) | near (its own row; any distance) | "beside it" | Loose but the owner's BF6 rule ("closest slot"); call **ENG18-4**. |
| 41 | Spawner | `sk3SpawnAdjacent` -> `nearestFreeSlot` | near, but always the **front** row (a middle / back-row Spawner in a raid spawns into the front row; from the code, not run) | "into a free slot beside it ... No free slot beside it, no spawn" (`ui.sk3-spawner*`) | Text wrong (BF6 made it the nearest slot): **reworded** "the free slot nearest it" / "No free slot left, no spawn". The row: call **ENG18-5**. No card has Spawner today. |
| 42 | Fortification | `sk2Fortify` (only with slot -1 or +1 free) | L/R, front row | "an empty slot beside it" | Yes |
| 43 | Mirage (field) | a free slot right beside the unit, in its row | L/R | "beside one of their units" | Yes |

## Text changes in this package

`ui.eng18-term-adjacent` (new; the Codex term), `ui.term-surrounding`, `ui.eng9-guardian`, `ui.sk3-spawner`, `ui.sk3-spawner-codex`, `ui.sk3-stench`, `ui.eq2-strike-desc`, in all 12 packs (`tools/i18n_2026_11_02_eng18.py`). The dead hard-coded Guardian line in `PASSIVE_DEFS` (overridden by `ui.eng9-guardian` via `sk1Patch`) was left alone.

## Calls for the owner (docs/decisions.json)

- **ENG18-1** Pack chains: left / right in the front row only, or adjacent (front / behind too, and the middle / back rows chain) on raid and group-dungeon boards.
- **ENG18-2** Shore Up: left / right (EN4 option B), or adjacent.
- **ENG18-3** Stench / SK3 area targets: keep the facing enemy plus its adjacent units (as built), or go back to the GD2-5 shape (left / right only).
- **ENG18-4** Spawned tokens: the nearest free slot in the row (BF6), or an adjacent free slot first (front / behind too), then the nearest.
- **ENG18-5** Spawner in a raid's middle / back row: into the front row (as the code does), or its own row like Brood and Twin.

All five only change raids and group dungeons (one-row fights have no front / behind of your own), so road fights and the road balance are not touched.
