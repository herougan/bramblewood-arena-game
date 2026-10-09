# Archetypes: design sheet (2026-10-09)

**Status:** 📝 Designed, not built. Only the flat costs exist in the engine today (`prayerCost`, `devilryCost`, `exileCost`) plus Dark Points income, the Lumber and Elemental Energy resources, and (new) card Promotion and Nest eggs outside battle.

**Where this comes from**
- **Yours:** the 2026-09-14 and 2026-09-18 design talks ([`game-design-v31-addendum.md`](game-design-v31-addendum.md), "Future design vision" in [`game-design.md`](game-design.md)). Your ideas are marked **(yours)**.
- **New on 2026-10-09:**
  - your request for the Elder / Outer / Forgotten Ones trio;
  - Claude's proposals to reach 10+ distinct mechanics, marked **(proposal)**.
- Nothing here is final. Each archetype lists the open questions that block building it.

**Rule of thumb for every archetype.** It needs:
- one resource or zone it cares about;
- one decision it asks of the player each turn;
- a clear weakness the opponent can play against.

If an idea can't name all three, it's a keyword, not an archetype.

---

## The 10 core archetypes

| # | Archetype | Hook (what it cares about) | The decision it asks | Weakness |
|---|---|---|---|---|
| 1 | **Ecclesia** (yours) | Noble and Ignoble coins | which side to feed; the coins cancel each other | slow; disrupted by early pressure |
| 2 | **Devilry** (yours) | Dark Points, paid with your own castle HP | how much life to spend | burns its own HP; punished by aggro |
| 3 | **Scrapper** (yours) | Scrap from the graveyard and kills; Wait timers | when to cash in the graveyard | weak board early; long Waits |
| 4 | **Evolution** (yours) | stacking units (ride) and the Evo-Timer | which unit to build on | the stack is one big target |
| 5 | **Spawn / Hatchery** (yours) | eggs that hatch into stronger cards | protect eggs or spend them | eggs are 0-attack and fragile |
| 6 | **Mechanica** (yours, a one-liner; filled in by Claude) | Parts: robots assemble from pieces | build now or wait for the full robot | parts alone are weak |
| 7 | **Swarm** (proposal; ants, bees, hives) | count of allies on the board | wide board or tall board | sweep and swipe |
| 8 | **Tide** (proposal; the Deep, reef) | a shared Ebb/Flow phase that flips each round | play on Flow, hold on Ebb | predictable; the enemy plays around it |
| 9 | **Pack Bond** (proposal; wolves, otters) | pairs of linked units | which two to bond | kill one, the other weakens |
| 10 | **Trickster** (proposal; foxes, raccoons, crows) | the opponent's hand and board | steal, swap or delay | low stats; poor in a race |

Plus the special trio: **Elder Ones · Outer Ones · Forgotten Ones** (below). Plus **Splash** (yours; archetype still unknown, kept as an open item).

---

### 1. Ecclesia (yours)
- **Resource:** Noble 🕊️ and Ignoble 🗝️ coins. Each one cancels one of the other, so you lean one way at a time.
- **Gaining coins:**
  - when your unit dies, it gives +1 Noble or +1 Ignoble (set per card);
  - **Exalt** / **Pray** give Noble;
  - **Sacrifice** gives Ignoble;
  - you can exile cards from your hand to pay either cost.
- **Top tier:** needs both coins and an event "in its name" this turn (e.g. a unit hit the enemy castle). The condition expires after a turn. When it's met, the card skips its normal cost.
- **Fun:** a balancing act with a big payoff turn you set up on purpose.
- **Open:** is Revel a different keyword from Exalt/Pray, or just flavour? Does exiling 1 card give 1 coin?

### 2. Devilry (yours)
- **Resource:** Dark Points ★. You get +1 each turn and +1 per kill. You can also buy them with castle HP.
- **Gateways:** high-tier "Devil" cards need a **summoning circle**: exact board or hand states, e.g. "exactly 5 cards on the field". Some cards unlock the summoning of others.
- **Support:** digs into the deck (extra draws). Can convert Ignoble coins 1:1 (shared with Ecclesia).
- **Fun:** solving the circle like a puzzle while your life is the price.
- **Open:** is the circle checked only when you cast, or must it hold? Is there a cap on how much HP you can spend per turn?

### 3. Scrapper (yours)
- **Resource:** Scrap. You get 1 per card in your graveyard plus 1 per kill. The graveyard part is only exiled when you actually spend it.
- **Builders:** **Build N**: once per turn, lowers a random friendly structure's Wait by N.
- **Scrap a unit:** scrap your own unit to speed up another card. **Scrap Quality** = full Wait − current Wait; higher quality gives a bigger boost.
- **Enemy delay:** effects that push enemy Wait back up.
- **Fun:** long timers that you crunch down; the board explodes late.
- **Open:** is Scrap stored, or computed when you cast? Does the boost always go to stats, always to Wait, or is it set per card?

### 4. Evolution (yours)
- **Ride:**
  - a Stage 2 card is played on top of a normal unit;
  - a Stage 3 card goes on top of a Stage 2;
  - the stack has both cards' abilities;
  - damage and statuses carry over.
- **Evo-Timer:** a second countdown. It starts once Wait reaches 0. At 0 the unit transforms (a new face, not just stats).
- **The everyday version** (your 2026-09-14 note): "placing a card on top of another evolves/replaces it, keeping only status effects". This is the base rule for all cards; the Evolution archetype is the deep end.
- **Fun:** investing in one unit and watching it grow; the opponent must decide when to kill it.
- **Engine need:** a board slot that holds a stack. This is the biggest build of all ten.
- **Open:** does riding cost anything? When the stack dies, does it die whole or peel off a layer at a time?

### 5. Spawn / Hatchery (yours)
- **Eggs in battle:**
  - eggs are 0-attack cards;
  - when one hatches, the card you play next from your hand comes in with less Wait and bonus stats taken from the egg.
- **Hatchery:** speeds up Evo-Timers, and sometimes normal Wait.
- **Link to the Nest:** the new Nest eggs (outside battle; 🥚 hatch into a random card after a timer) are the collection-side cousin. Same art language, different rule.
- **Fun:** a clutch of eggs is a threat the opponent must answer before it hatches.

### 6. Mechanica (yours as a name; mechanics proposed)
- **Parts:** Mechanica cards are **Parts** (Chassis, Arm, Core).
- **Assemble:** when your board holds a Chassis plus N Parts, you may **Assemble**. They merge into one robot with summed stats and every Part's skill.
- **Overclock:** spend Elemental Energy ✨ for +attack this round; the unit takes 1 self-damage.
- **Fun:** a jigsaw. The opponent picks off Parts before assembly.
- **Fits:** Elemental Energy (already in the engine, nothing spends it yet), and Scrapper (scrap a broken robot back into Parts).

### 7. Swarm (proposal: ants, bees, hives) — ✅ built 2026-10-09
- **Hook:** **Swarm N**: +1 attack for every N other Swarm allies on the board.
- **Hive Mind:** when a Swarm unit dies, the newest Swarm ally gets +1/+1.
- **Promotion fits here:** a Worker Ant raised to Lv 3 becomes an Ant Warrior, Forager Ant or Soldier Ant (built 2026-10-09).
- **Fun:** flooding the board; each small body matters.
- **Weakness:** Sweep and Swipe. That gives those existing skills a real job (see the skills audit).
- **Built (2026-10-09):**
  - Swarm 3 on the ants (Worker, Tunnel, Scout, Forager, Soldier, Ant Warrior) and the bees (Honey Bee, Bee Forager, Bee Knight, Bee Drone). Bee Sentry stays plain because it's in the balance tool's reference deck.
  - Hive Mind on Worker Ant, Honey Bee and Forager Ant.
  - Balance impact is small: every Swarm card moved under 10 points; Swarm 2 was too strong in testing.
  - Covered by `tests/swarm.js`.

### 8. Tide (✅ built 2026-10-09: reefs, the beach, the Grotto)
- **As built** (simpler than the proposal below, so it reads at a glance):
  - From round 2 the water alternates **🌊 Flow** (even rounds) and **🐚 Ebb** (odd rounds). A pill next to Day/Night shows it, only in fights where a Tide card is in either deck.
  - **Tide** (18 cards: reef fish, eels, crabs, the Tide Spirit, Dolphin Knight…): hits +1 on Flow; takes 1 less per hit on Ebb (never below 1).
  - **Wash** (Tide Spirit, Riptide Eel, Coral Current Eel, Octopus Tactician, Dolphin Knight): on Flow, the enemy card facing it gets +1 Wait, once per enemy card. Uncapped, Wash took Dolphin Knight to 100% and Tide Spirit to 97%.
  - Not built: Shell untargetable on Ebb, +2 health on Ebb. They're still possible later.
  - Code: `getTide` in `bramblewood-engine.js`; covered by `tests/tide.js`.
- **The original proposal:**
- **Hook:** a shared **Ebb / Flow** phase that flips each round. Both players see it on the board edge as a little wave.
- **On Flow:** Tide units get +1 attack and **Wash** (push the enemy unit opposite back 1 Wait).
- **On Ebb:** Tide units get +2 health, and **Shell** units can't be targeted.
- **Fun:** timing. A Tide deck plays on Flow and holds on Ebb; the opponent can bait it.
- **Fits:** the water maps (Sunken Hollow, Coral Current, the new Pebble Beach).

### 9. Pack Bond (proposal: wolves, otters, hounds)
- **Hook:** **Bond** links two of your units when the second is played. Bonded units share half of any damage taken.
- **Howl:** when one bonded unit attacks, the other gets +1 attack this round.
- **Grief:** when one dies, the other gets **Rage** for 2 rounds.
- **Fun:** choosing pairs; the opponent decides whom to hit first.

### 10. Trickster (proposal: foxes, raccoons, crows)
- **Hook:** the opponent's resources.
- **Pilfer:** steal 1 gold or Lumber.
- **Swap:** trade a hand card with a random one of theirs.
- **Delay:** add +1 Wait to their next card.
- **Mimic:** copy the skill of the unit opposite for a round.
- **Fun:** disruption and surprise.
- **Weakness:** small bodies that lose a straight fight.
- **Fits:** the existing Trickster Fox and Trash Panda cards.

### Splash (yours, still undefined)
You flagged "Splash" without an archetype. One reading that fits Tide: **Splash N**: damage also hits the units beside the target for N. Left open until you say what you meant.

---

## The trio: Elder Ones · Outer Ones · Forgotten Ones

Three old powers, each a full archetype, that **feed each other in a ring**:
- Elder wakes the Outer;
- Outer drives cards into oblivion, where the Forgotten live;
- the Forgotten remember the Elder.

A deck can run one, two or all three. Running all three unlocks the **Convergence**.

| | Elder Ones 🗿 | Outer Ones 🌌 | Forgotten Ones 🕯️ |
|---|---|---|---|
| **Theme** | ancient sleepers under the world (stone, roots, deep sea) | things from beyond the map's edge | names nobody remembers: ghosts of cards that were lost |
| **Lives in** | the board, asleep | the **Void**: a separate 5-card pile you don't draw from | the **Exile** zone (the Removal Zone) |
| **Resource** | **Eons ⏳**: each Elder gains 1 per round it stays asleep | **Rifts 🌀**: opened by exiling cards | **Echoes 🕯️**: +1 for every card that goes to Exile, either side |
| **Signature** | **Slumber**: enters asleep (0 attack, Shell). **Awaken** at N Eons: becomes huge | **Breach**: when a Rift opens, the top Void card enters the board free | **Remember**: at N Echoes, return from Exile to the board with +1/+1 per Echo spent |
| **Feeds** | an Elder that wakes **opens a Rift** (feeds the Outer) | Breach exiles a card from the board or graveyard (feeds the Forgotten) | a Forgotten One returning **adds 1 Eon** to every sleeping Elder (feeds the Elder) |
| **Answer** | kill it while it sleeps: it has Shell but low HP | close Rifts: any heal on your castle closes one | anything that "destroys" instead of exiling starves them |

**The Convergence.** If one Elder, one Outer and one Forgotten One are all on your board at once, you may play a **Convergence** card. It's one per deck, Legendary or above, and wins big: e.g. "every enemy unit is exiled; you gain all of it as Echoes".

**Why a trio:**
- each third is playable alone;
- pairs make a strong engine (Elder + Outer is tempo; Outer + Forgotten is a loop);
- all three is a slow, spectacular combo that the opponent can see coming and race.

**Engine needs:**
- a sleeping state, close to the existing Stun and Shell;
- a Void pile per player;
- an active Exile zone that cards come back from. Ecclesia needs this too (your "fuse and come back from the Removal Zone").
- The Exile zone is the shared first step for Ecclesia, the Forgotten Ones and Scrapper. Build it once.

**Open questions:**
- Do the trio belong to a people in the lore (the Deep for the Elder Ones?), or stand apart as a fourth force?
- Should Convergence be one card or one per pairing?
- Is the Void built from your deck (set aside at the start) or a separate mini-deck?

---

## Suggested build order
1. **Active Exile zone.** Unblocks Ecclesia fuse-back, the Forgotten Ones and Scrap spending.
2. **Swarm.** ✅ Built. Small: one passive and one death trigger. Ants and bees already exist, and Promotion feeds it.
3. **Tide.** ✅ Built (taken ahead of the Exile zone as the default on "continue"; revertible).
4. **Devilry circles.** A board/hand check before summoning.
5. **Elder Ones.** Sleeping state plus a counter.
6. **Evolution ride.** The big board-model change; last.
