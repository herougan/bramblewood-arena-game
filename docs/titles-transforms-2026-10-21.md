# Titles, transforms and the Crown (owner, 2026-10-21 18:23)

Status: specified by the owner; built by package TR on 2026-10-21 (see "Built by package TR" at the end). Package TR builds it after package EV (Evolute), because Matured uses Evolute's Stem stats and both touch the engine. The transform format comes from package CX2: "under {condition} → gain {…} for the rest of the game".

## Two-skill rule (decision HB2-1)
- Flying, Tide (plain), Diurnal (plain) and Nocturnal (plain) **do not count as skills** for the two-skill limit. Having several of them counts as **1** skill. "Plain" means without braces; a {…} version counts like any skill.
- Consequence: cards that BF5 or BF6 cut because one of these counted toward the limit get the cut skill back (docs/balance/two-skills-2026-10-21.json lists the cuts), and are then re-fitted by formula.
- The Swordbill Challenger (Flying + Taunt + Counterattack) is within the rule.

## Transforms (the condition first holds → gain {…} until the end of the game)
| Name | Condition | Default {…} |
|---|---|---|
| **Gilded** | Your resources are worth more than 25, counting Lumber 1, Stone 2, Metal 3, Gold 5 each | +5/+10 |
| **Championed** | It wins a duel: its own attack kills the enemy it is fighting (owner 18:24: no "no ally beside it" condition) | +3/+3 |
| **Veteran** | It survives 3 rounds | +2/+4 |
| **Enraged** | It has Rage | none: the card sets it |
| **Matured** | It survives N rounds | +2/+4 fodder (Stem) stats, which an evolute placed over it inherits |
| Lycanthropy | Full Moon (already built, CX2) | per card |

Not now: Worthy ("IDK"), Ascended / Descended / Corrupted ("no comment for now").

## The Crown (King)
- **King** is a card skill. The first King to come into play takes **the Crown** (one Crown on the whole battlefield) and gains **Kingly** {…}. Default Kingly: **Tribute 1** (gain 1 Gold each turn, when ready) and **+2 Armor**. A crowned unit shows a 👑.
- Playing a King card while another King is on the battlefield (either side) does nothing extra: it is a King, but uncrowned.
- **The crowned King dies with no source unit** (poison, a spell, the bramble…): the Crown visibly drops to the ground. An allied King on that side takes it. If there is none, it fades into **+1 Gold** for that side.
- **A unit kills the enemy's crowned King:** the liege gives the Crown to a random King on the killer's side. If the killer's side has no King, the Crown is taken and fades into **+1 Gold** for the killer's side.
- **The crowned unit dies and no Kings are left anywhere:** the Crown fades away (+1 Gold for its side).
- **Steal the Crown:** a skill lets a non-King unit take the Crown, by killing the crowned King. It is not a King, so the Crown never falls into its lap any other way (drops and liege grants skip it). Check the existing **Usurper** skill first, and extend it if it fits; otherwise name a new one.
- **King Slayer** (existing) gets its bonus against Royalty, Kings and Crowned units.
- **New Gold ability:** **Tribute N**: gain N Gold each turn (when ready). Used by Kingly's default.

## Parasite (note only: do not build)
"Hooks onto enemy units? Not just leech-attacking from our side. So you place onto an enemy such that their column would be in reach. (In reach is defined as the columns you could have placed your units on anyway, cause you had a creature nearby.)"

## CX1–CX5 (owner 18:23: "Seems okay"): the defaults, applied in package TR
- **CX1:** keep both: Diurnal and Nocturnal still apply in Twilight, and the Leylines I map rule still turns the plain +1 into +3/+3.
- **CX2:** price plain Crepuscular at 1.6. Re-fit Nightjar Drifter and Woodcock Lookout by formula (`--only=`).
- **CX3:** keep as is: half-miss skills inside braces cost 0.
- **CX4:** keep the rarity toggles one at a time.
- **CX5:** switch the editor's budget panel and the Test Lab to price skills from canonical/skill-costs.json, not the in-page SB_DEFAULT_SKILLS.
- Mark CX1–CX5 and HB2-1 DONE in docs/decisions.json, one line each, without reformatting.

## Built by package TR (2026-10-21)

### The rules (bramblewood-engine.js: the Package TR block, `TRANSFORM_PRESETS` / `unitCond`, `condStatsOf`, the death pass)
- **Two skills.** `bramblewood-budget.js` `skillCountOf(effects)`: abilities, with plain Flying / Tide / Diurnal / Nocturnal left out and
  +1 when a card has two or more of them. The braces forms (tideGrant, diurnalGrant, nocturnalGrant) count. Used by
  `tools/two_skills_2026_10_21.js`, `tests/bf5-2026-10-21.js` and the editor's budget panel (a warning line above two).
- **Transforms.** `effects.transform = {name, when?, gain?, rounds?}`. A preset brings its condition and, when `gain` is empty, its default
  braces (`TRANSFORM_GAIN`):

  | Preset | Condition key | Holds when | Default |
  |---|---|---|---|
  | gilded | `rich` | Lumber + 2 Stone + 3 Metal + 5 Gold > 25 | +5/+10 |
  | championed | `duel` | `c.duelWon`: its swing or Counterattack killed the unit it fought | +3/+3 |
  | veteran | `rounds3` | `c.roundsSurvived` ≥ 3 (counted at each round's start) | +2/+4 |
  | enraged | `rage` | its Rage is on (Rage, below half Health) | none |
  | matured | `rounds` | `c.roundsSurvived` ≥ `rounds` (2) | +2/+4 Stem stats |

  - Checked in `syncPhaseStats` (round start, plays, combat start, and after a kill or a Crown move). Once on, `c.transformed` for the fight.
  - **Matured** gives the unit nothing. `evoluteMerge` adds its braces to the evolute placed over it, as a Stem's are.
- **Gold.** `pl.gold`, `addGold`. **Tribute N** pays N in the Ready upkeep (`tributeTick`). Event `{type:'gold', why:'tribute'}`.
- **The Crown.** `effects.king`; braces `effects.kinglyGrant` (default `{tribute: 1, armor: 2}`). The holder is the unit with `c.crowned`.
  - `crownOnArrive` (in `applyOnSpawnEffects`): the first King takes it unless one holds it or it faded (`pl.crownGone`).
  - `condStatsOf` gives the holder Kingly. A number adds to the card's own (Armor 1 + 2 = 3).
  - `crownOnDeath` (in `removeDeadCardsPass`): the killer is `killedBy` / the kill-credit book.
    - Enemy killer: a living Usurper killer steals it. Else a random King of the killer's side gets it (`liege`). Else it fades into +1 Gold
      for the killer's side.
    - Otherwise it drops: a random King of that side picks it up, else it fades into +1 Gold for that side.
  - `crownSweep`: a holder gone without a death drops it.
  - Events `{type:'crown', kind: take | drop | pickup | liege | steal | fade, uid, fromUid, gold}`.
- **King Slayer** (`isRoyalTarget`): the King type, the Royalty type, the King skill or `c.crowned`.

### The UI (arena_app.js, arena_template.html)
- Skills in the registry, "+ Add Skill" and the Codex: 👑 King (with its Kingly braces as the "Gives" pick, like Stem), 🪙 Tribute. The
  Transform row lists the six presets and the unit's own conditions.
- A crowned unit wears a 👑 badge (tooltip: what Kingly gives). Crown events fly, drop and fade a crown sprite (`trCrownVfx`). A named
  Transform keeps a look (`.tf-gilded`, with a moving gold sheen and falling leaf on the moment; `.tf-championed` and the others are rings).
- A 🪙 Gold pill per side once it has some. Log lines for the Crown, Tribute and named transforms.
- Screens: `docs/screens/tr/` (a crowned King, a Gilded unit; 390 and 1366).

### Cards and prices
See the CHANGELOG entry (2026-10-21, package TR) and owner calls TR-1 to TR-6 in `docs/decisions.json`. Prices are theoretical (B15 style):
King 2.39 (0.4 × Kingly 5.98), Tribute 0.5 a point, Gilded 8, Championed 3.6, Veteran 3.2, Matured 3.2, Enraged 0.4 × its braces.

### Not built
- Parasite (note only), Worthy, Ascended / Descended / Corrupted.
- The editor does not set Matured's N (data only: `transform.rounds`).
- Nothing spends Gold yet.
