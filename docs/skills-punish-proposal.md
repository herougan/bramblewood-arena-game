# Punish: three designs (package SK1, 2026-10-19)

The owner (21:36): "Punish: an advanced skill for Map 40+", what it does is open. Maps 21–40 are mostly about the skills already
learnt, so Punish is one of the first skills held for after Map 40. Three designs, a recommendation, and what is built.

## A. Punish N: answer a skill (Retribution)

When an enemy **skill** targets this unit (a status, a debuff, a push, a swap, Mind Control, a skill's damage; not a plain melee
swing), the caster takes N.

- For: it answers the status-heavy, control-heavy decks the late maps lean on. It is unlike anything on the board today.
- Against: "a skill used against it" has to be caught in many places (every targeted action, every on-hit status, shots, pushes,
  the field's effects that have no caster). Hard to explain on a card at a glance; area effects need a ruling each.

## B. Punish N: answer every hitter at the round's end (recommended)

At the end of the round, **each enemy unit that hit this unit that round takes N** (once each, however many times it hit), if both
are still standing.

- For: one sentence on the card; one place in the engine (a hit notes its attacker; the upkeep pays them back). It is not Thorns:
  it counts shots, bolts and skill hits as well as melee, it lands later (it can finish off a unit the fight left hurt), and it hits
  each attacker once, so it punishes being focused by many units rather than being hit hard by one.
- Against: on a big wall it can tax a whole side every round, so N should stay small (2 by default, halved to 1 if the owner halves).
- Ties in with the late maps' wide boards (raids with three rows: many hitters a round).

## C. Punish N: +N against the strong

Its hits deal **N more to a unit carrying a buff** (Attack or Health above its printed stats: a Rally, a Kinship, a Formation, a
day/night bonus...).

- For: very easy to read; counters the buff-stacking decks.
- Against: close to Executioner / Hunter (package SK3's area), and "buffed" is fiddly to see on the board.

## Built (behind a flag)

**B** is in the engine (`bramblewood-engine.js`, the Package SK1 block: `sk1NotePunish`, `sk1PunishTick`). It is **off** unless
the fight's `rules.punishSkill` is true or the engine is made with `{flags:{punish:true}}`. It is on **no card**, hidden in the
card editor (`hidden`, `reserved`), and has a low-confidence cost estimate (`punish`, scale n, 2 per N). Tests:
`tests/skills-sk1-2026-10-19.js` (§11).

Owner call: pick A, B or C (or another). If B: the default N (2), whether a Waiting Punish unit still pays back (it does now),
and whether it should count the bramble's attackers too.
