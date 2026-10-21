# Evolute: the Evomax archetype (owner, 2026-10-21 17:42)

Status: built by package EV (2026-10-21). The owner's rules and answers are below as he gave them; what was built, the defaults taken
and the cards follow them ("Built by package EV"). Owner calls EV-1 to EV-7 are in `docs/decisions.json`.

## The owner's rules
- **Evolute.** Most Evomax cards have it. You place the card over one of your units that shares a type with it: a habitat (geo), an animal class (animalia) or a phylum.
  - The evolute adds the base unit's remaining stat lines to its own, and inherits every counter the base unit carried, negative ones included.
  - Example: a 2/2 evolutes over a unit at 5/8 (printed 4/20). It becomes 7/10.
  - Why: it discourages sending a unit out for a one-time effect and then evoluting over it just before it dies.
- **Evolute Alpha** can only evolute over a creature that has Evolute.
- **Evolute Omega** can only evolute over a creature that has Evolute Alpha.
- ~~The deck-building escape hatch~~: superseded by the owner at 17:49, wrong evolutions are banned (see below).
- **Fodder** (needs a name; not "accelerant", which is saved for the chemistry biomes, Maps 60–80): fodder cards empower the evolutes placed over them.
  - Some fodders let an Evolute Alpha ride over them directly, skipping the Evolute stage.
- "MOST of the time, the point of this archetype is the evolute."
- **DNA points:** an idea for collecting DNA points; not designed yet.
- **Gate:** Evomax cards are obtainable from Map 30 (package RP).

## Owner's answers (17:49): these settle the open questions
- **Shared type:** any shared type at all counts, e.g. both are birds, or both are river creatures (habitat, class or phylum, anywhere in the hierarchy).
- **Names:** plain fodder is a **Stem**. A fodder an Evolute Alpha can ride over directly is a **Chrysalis**.
- **How a Stem empowers:** by its own {…} (skills it hands to the evolute), or +1/+2 by default.
- **The unit underneath** does not die and does not go to the graveyard. The cards stay together as a card stack and move as one stack. A unit leaving play this way triggers no On Death, Bounty or grave effects.
- **Wrong evolutions are banned.** No escape hatch: an evolute can only be placed over a legal base (Evolute over a shared-type creature, Alpha over an Evolute, Omega over an Alpha; Alpha also over a Chrysalis). "I also don't want accidental wrong evolutions": the UI only highlights legal bases.
- **Parasite:** a skill the owner has in mind; not formally defined yet. Don't build it.
- **DNA points:** parked.

## Still open (defaults the builder may take, flagged in its report)
- **Pricing Evolute:** a theoretical price in the style of B15. Suggested: Evolute 3, Alpha 4, Omega 5, plus the evolute's own stats fitted to its N; a Stem's {} at 0.4 × S like a context skill.
  Taken as suggested (see Pricing below; owner call EV-5).

## Built by package EV (2026-10-21)

### The rules (bramblewood-engine.js, the "Package EV" block)
- **Card data.** `effects.evolute`, `effects.evoluteAlpha`, `effects.evoluteOmega` (true). `effects.stem` (true: +1/+2) with optional
  braces `effects.stemGrant` ({skill: value, attack?, health?}, the format of Diurnal – {…}). `effects.chrysalis` (true), with the same
  optional braces.
- **Legal bases** (`evoLegalBase`, `evoBasesFor`). A base is one of your live front-row creatures. Structures, cages and a pinned
  Gladiator leader are never bases. It must share a type with the evolute (`evoShares`). Any shared node of the taxonomy counts:
  archetypes, species, the animal, every ancestor of those (both birds, both river creatures, both mammals) or the same phylum. A
  Changeling shares with everything.
  - **Evolute:** over a shared-type unit that is not an evolute itself. A Stem or Chrysalis is a fine base.
  - **Evolute Alpha:** over a shared-type unit with Evolute, or over a Chrysalis.
  - **Evolute Omega:** over a shared-type unit with Evolute Alpha.
  - **Nothing else is legal.** With no legal base, `canPlay` is false, so the card shows greyed with the reason "Needs a unit of yours it
    can evolve over". `placeCard` refuses an empty slot, a flank side, a reserve row or an illegal unit.
  - The base is named with `popts.onto` (its uid) or by its slot as the numeric `side`.
- **The evolve** (`evoluteMerge`). The evolute takes over the base's own board unit: same uid, same slot, same object.
  - **Stats.** Its printed stats, with the usual arrival bonuses (castle passives, Vanguard, perks), are added to the base's current
    ones. The owner's example works: a 2/2 over a 5/8 (printed 4/20) is 7/10, max Health 22, so the damage stays.
  - **What it keeps.** Everything on the unit stays: every counter and status (poison, bleed, exposed, shields, Prayer tokens, Irradiation,
    its equipment, its Rally) and the skills the base had been granted for good (what its derived card has beyond its printed card: an
    equipment's grant, a Stem's braces, Bark Skin).
  - **Wait and Lumber** are as usual: the cost is paid, and the stack waits the evolute's own printed Wait.
  - **A new card.** Its once-a-unit skills start fresh (On Spawn triggers, Mimic, Transform, Devour, Revive).
  - **Its arrival is a play.** On Play / On Spawn skills fire, as do On Ally Played and On Enemy Played, an enemy's Ambush and chains
    breaking.
- **The stack** (`c.evoStack`: the printed card ids, bottom first).
  - The base never dies: no On Death, Bounty, Darkness, Ritual count or grave.
  - The stack moves as one, since it is one unit.
  - When the evolute goes to the graveyard, the whole stack goes there with it. When it goes to the Removal Zone, the stack goes to the
    Removal Zone. A Revive keeps the stack. Tokens under it vanish.
  - The cards under it fire nothing when it dies (EV-2).
- **Stem.** An evolute placed over a Stem gains the braces' skills and any +A/+H in them, or +1/+2 with no braces. A number adds to a
  number (Armor 2 + Stem {Armor 1} = Armor 3). A Chrysalis is a Stem that an Alpha may also ride directly.
- **The CPU** (`aiEvoluteBase`, used by `aiTakeTurnOnce`).
  - It only ever plays an evolute onto a legal base.
  - **Which base.** The one with the most current stats (Attack counts double, a bigger stack and a Stem a little more), less what its
    statuses will take. A Ready base loses a little, because the evolute waits again.
  - **A dying base.** A base the stack could not outlive (its poison, bleed, toxin, chilli or strangle at least the stack's Health) is
    never chosen. A nearly dead base is still chosen when the evolute's own Health keeps the stack alive (it saves the value).
  - **No base worth it:** the card is held.
  - All randomness is the fight's seeded `rnd`. The evolve itself has none.
- **Events.** A play onto a base sends `evolve` {uid, defId, cardId, fromDefId, stage, stack, atk, hp, maxHp, wait, stem} in place of a
  `play` event.

### The UI (arena_app.js, arena_template.html)
- **Holding an evolute** (pressed, dragged or tap-armed):
  - only its legal bases light up, with a pulsing violet ring and a 🧬 mark;
  - the other units of yours dim;
  - the empty-slot "+" targets are hidden (`body.bw-evo-holding`, `.evo-target`).
- **Playing it.** A drop or tap on a lit unit plays it there. Anywhere else nothing is played: the card shakes, and the hint says "Play
  <card> onto one of your lit units." (`evolvePlayOnto`; `playCardByUid` refuses an evolute without `popts.onto`). The live-ranked
  intent carries the base.
- **A stack on the board.**
  - Up to three violet card edges peek out past the unit's top-left corner, and a ×N badge sits at its top right.
  - The badge's tooltip names the stack bottom first: "Stack of 3: Speckled Egg → Raven Harbinger → Raven Hexcaller".
  - The card's statuses show as usual.
- **The evolve** plays a pop, FX.A's prismatic sparkle (`supremeSparkle`, reused), a "🧬 Evolute / Evolute Alpha / Evolute Omega"
  float, the unlock chime and the log line "🧬 {name} evolves over {base}: now {atk}/{hp}."
- **Skill chips and texts.** The skills are 🧬, 🧬α, 🧬Ω, 🌱 Stem and 🐛 Chrysalis. Their names and short lines (each under 20 words)
  are TX keys in the 12 packs (`tools/i18n_2026_10_21_ev.py`).
- **Registry.** They are in the skill registry (PASSIVE_DEFS: the editor's "+ Add Skill" and the Codex's Skills chapter).
  - Evolute, Alpha and Omega are offered on Evomax cards only (mechLineGate `evolution`).
  - Stem pairs with its braces in the editor ("Gives: Stat bonus / Skills"), as Diurnal does.
  - The editor's in-page budget table knows the five costs.
- Screens: `docs/screens/ev/` (ev-place: the Raven Harbinger held, its two legal bases lit; ev-stack: a three-card stack with its badge,
  poison carried), at 390 and 1366.

### Pricing (canonical/skill-costs.json, ownerSet false, theoretical, in the style of B15)
- Evolute 3, Evolute Alpha 4, Evolute Omega 5.
- Stem and Chrysalis 1.6 without braces. That is 0.4 × (2·1 + 2), CX2's `CONTEXT_MULT` on the +1/+2 it hands over.
- With braces, `stemGrant` costs 0.4 × their S (`bramblewood-budget.js` CONTEXT.stemGrant), and the plain flag beside the braces then
  costs 0 (CONTEXT_FLAG).
- These are not measured: what an evolute is worth rides on what the player stacks it over. Its printed stats are fitted to its own N as
  usual (owner call EV-5).

### Defaults taken (flagged)
- **EV-1, which cards are Evomax.** No Evomax unit existed: Terraumbra, the line's one card, is an equipment Easter egg. The lines below
  are made of cards no player can get yet (awaitingSource, or enemy-only "unsorted"), so the Map 30 gate holds and no reward moved.
  - The evolutes and the Slowpoke Sentinel are now `mechanicLine: evolution`.
  - The Nest eggs stay on their own line.
- **EV-2, the cards under a dead evolute** fire nothing (no On Death, no Bounty). They go to the evolute's zone with it.
- **EV-3, the bases.**
  - Alpha and Omega need a shared type too: the owner's text named it for Evolute only.
  - A plain Evolute can't go over an evolute (no sideways or downward evolving).
  - Structures, cages and the Gladiator leader are never bases.
  - Only the front row counts (a raid's middle and back rows: no).
- **EV-4, Wait.** The stack waits the evolute's own printed Wait, even over a Ready base.
- **EV-5, the prices** above.
- **EV-6, the eggs as fodder.** The Speckled Egg became a Stem and the Cocoon a Chrysalis. Each egg got a species (Bird, Insect) so it
  shares a type with an evolute: an egg had no type at all. By formula both went 0/2 → 0/1.
- **EV-7, the ravens at their floor.** The owner's HB2-1 answer (18:23, merged from main mid-package) says Flying does not count toward
  the two-skill rule. So the ravens keep every skill: Harbinger Flying + Poison 2, Hexcaller Flying + Render, Bone Diviner Flying + On
  Kill Lumber, each beside its stage skill. With Flying's ×1.5 the formula puts all three at their 1/1 floor (flagged). In a stack they
  add to the base's stats anyway. The alternative is cutting Flying on the Hexcaller and the Bone Diviner (they were 1/7).

### The lines and the cards changed
| Line | Stage | Card | Skills now | Stats (was → now, by formula) |
|---|---|---|---|---|
| Sloth | Stem | Slowpoke Sentinel | Armor 2, Stem – {Armor 1} | 1/1 → 1/1 (at its floor, flagged as before) |
| Sloth | Evolute | Canopy Sloth Guardian | Guardian, Evolute | 2/18 → 2/15 |
| Sloth | Alpha | Hanging Loafer | Bounty 1, Evolute Alpha | 3/23 → 2/21 |
| Raven mystics | Evolute (over any bird) | Raven Harbinger | Flying, Poison 2, Evolute | 1/2 → 1/1 (floor, flagged) |
| Raven mystics | Alpha | Raven Hexcaller | Flying, Render, Evolute Alpha | 1/8 → 1/1 (floor, flagged) |
| Raven mystics | Omega | Bone Diviner | Flying, On Kill +2 Lumber, Evolute Omega; its graveyard cost kept | 2/9 → 1/1 (floor, flagged) |
| Storm | Evolute (over any Elemental) | Gale Sprite | Evolute | 2/10 → 1/8 |
| Storm | Alpha | Stormcaller | On Ready 5 damage, Evolute Alpha | 6/17 → 1/23 (cap 2: S² leaves little room for A·H) |
| fodder (birds) | Stem | Speckled Egg (egg-bird) | Stem; species Bird | 0/2 → 0/1 |
| fodder (insects) | Chrysalis | Cocoon (egg-bug) | Chrysalis; species Insect | 0/2 → 0/1 |

- Re-fit with `node tools/bf6_rederive_2026_10_21.js plan` and then `apply --only=<the ten>`. The tool's drift on other cards was not
  applied.
- The two-skill tool knows `stemGrant` as Stem's parameter.

### Cards to make (lines missing a stage)
- **Sloth Omega.** The natural one is the Ancient Sloth Titan. It is the Map 20 boss's reward, though, so making it Evomax means holding
  it to Map 30 (owner call).
- **Storm Omega:** a tempest Elemental over the Stormcaller.
- **Insect line.** The Cocoon is a Chrysalis with no insect Alpha yet.
  - Missing: an insect Evolute (a caterpillar) and an insect Alpha (a butterfly or moth that rides the Cocoon).
  - The butterflies we have (Clover Butterfly, Monarch Wingblade, Apollo Butterfly, Glasswing Butterfly) are obtainable before Map 30.
- **Beetle line:** a grub Stem → a beetle Evolute → a great beetle Alpha.
  - The Compost Grub is a Map 1 reward and must stay plain.
  - The Hercules Beetle was left alone: it is Mighty's only card, and three Map 14/19 enemy decks field it with no insect base.
- **Frog line:** a tadpole Stem → a frog Evolute → a toad Alpha. No tadpole card exists.
- **Dragon line:** Red Dragon Egg (Chrysalis?) → Fire Drake Hatchling (Evolute) → Red Dragon (Alpha). These are special monsters and
  rewards today (owner call).
- **Hummingbird line:** the Greyplume Fledgling ("hasn't chosen her plumage colour") as a Stem for the coloured hummingbirds. These are
  faction cards (owner call).
- **Raven mystics:** complete (Harbinger → Hexcaller → Bone Diviner). A raven Stem (a fledgling) would round it out.

### Not built
- Parasite and DNA points (the owner: don't build).
- No scenario test file was added, since the owner said no test runs.
- Checks: `node --check`, the build, and a headless run in scratch. The scratch run covered the example (7/10 of 22, statuses carried),
  the bans, Stem / braces / Chrysalis, the CPU's base choice and 30 AI-vs-AI matches with no broken state.
