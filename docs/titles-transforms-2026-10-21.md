# Titles, transforms and the Crown (owner, 2026-10-21 18:23)

Status: specified by the owner. Package TR builds it after package EV (Evolute), because Matured uses Evolute's Stem stats and both touch the engine. The transform format comes from package CX2: "under {condition} → gain {…} for the rest of the game".

## Two-skill rule (decision HB2-1)
- Flying, Tide (plain), Diurnal (plain) and Nocturnal (plain) **do not count as skills** for the two-skill limit. Having several of them counts as **1** skill. "Plain" means without braces; a {…} version counts like any skill.
- Consequence: cards that BF5 or BF6 cut because one of these counted toward the limit get the cut skill back (docs/balance/two-skills-2026-10-21.json lists the cuts), and are then re-fitted by formula.
- The Swordbill Challenger (Flying + Taunt + Counterattack) is within the rule.

## Transforms (the condition first holds → gain {…} until the end of the game)
| Name | Condition | Default {…} |
|---|---|---|
| **Gilded** | Your resources are worth more than 25, counting Lumber 1, Stone 2, Metal 3, Gold 5 each | +5/+10 |
| **Championed** | It wins a duel. Default definition: it kills the enemy facing it while no ally stands beside it. Flag if a better one exists. | +3/+3 |
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
