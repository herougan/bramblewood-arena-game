# Archetypes and keyword families (updated 2026-10-10)

**Status:** Devilry, Ecclesia, the Exile zone and the Forgotten Ones are built. The rest are designed only.

**Two kinds of thing, kept apart (your 2026-10-10 note: "Tide, Swarm are not archetypes. Their passive effects are not locked to that archetype"):**
- **Archetypes** are play styles built around a resource or zone (Darkness, Prayer, Stone and Scrap, Echoes). They're still never a lock: decks can mix freely or run none.
- **Keyword families** are plain skills any card can carry: Swarm, Tide, Nocturnal and Diurnal. They're themed by the animals that have them, not owned by an archetype.

---

## Archetypes

### Devilry ✅ built 2026-10-10
**Devilry, ✅ built 2026-10-10** (my readings of your list are marked *reading*; each is revertible):

| Keyword | As built |
|---|---|
| **Dark Summon ⛧** | Cards marked ⛧ (top right, like Wait) use a separate allowance: 1 a turn, on top of your normal play. *Reading:* it's an extra play, not a replacement. Measured, a free extra play every turn was far too strong (100%), so every Dark Summon card also costs Darkness ★. |
| **Darkness ★** | *Reading of "dark actions":* every one of your units that perishes gives you 1 Darkness. Some Imps give more (Ash Imp +1 on arrival). |
| **Devour** | Drag a card from your hand onto the devourer. It eats it (to the graveyard) and gains its Devour bonus, e.g. Pit Glutton +3/+3 and Arrow 2. Once per devourer, and it uses your play for the turn. A granted skill makes the unit a "derived" copy of its card. |
| **Ritual** | No Wait, but it can't act until its conditions are met, counted from when it arrived. Units perished counts both sides; cards drawn and castle damage are yours. The Sixfold: 6 / 6 / 6, 8/20. The board shows its progress. |
| **Pitchfork** | Hits a random unit among the three facing it, then the units beside that one. Never the castle. |
| **Imp / Devil** | New card types 😈 / 👹. Every Imp, Devil and Dark Summon card has a dark red aura creeping in from its frame. |
| **Sacrifice N** | On the fodder unit. Drop a Dark Summon card onto it: the fodder perishes (and gives Darkness), and the new card costs N less, Darkness first, then Lumber. |
| **Offering N** | *Name for your "____"*: exile N random cards from your hand as a cost. The engine already supported it. |
| **Beware N** | With N+ Darkness, you can cast it from your Removal Zone (tap your 🌫 badge; it glows red when a card is castable). Lurking Dread exiles itself when it dies, so it keeps coming back. |
| **Scare N** | Attacks aimed at it hit for N less. The attacker trembles, and the hover attack line wobbles. |
| **Desecrate N** | Each landed hit curses the cell its target stands on: N more damage a round to whoever stands there. Stacks, persists, and shows a 🜏 sigil. |

- **New cards:**
  - Cinder Imp (Base);
  - nine Basalt Foundry rewards: Ash Imp, Pit Glutton, Brimstone Hound, Blackmass Acolyte, Dread Bell, Tithe Collector, Lurking Dread, Puppeteer Imp, The Sixfold.
  - All are measured in their rarity band.
- **Ashfall Line** (9-4) now fields a Blackmass Acolyte.

### Ecclesia ✅ built 2026-10-10 (your model, D23)
| Rule | As built |
|---|---|
| **Prayer 🙏** | Your Prayer value = every **Prayer N** on your board + the cards in your Removal Zone. Shown as a pill in matches when your deck has an Ecclesia card |
| **Prayer needed** | Ecclesia cards show 🙏N in the cost corner: you need that much Prayer to play them. Never spent |
| **The offering** | Once a turn, when summoning an Ecclesia card, you may exile a card from your hand. You're only asked when you're 1 short. It goes to the Removal Zone, so it counts +1 now and stays counted. The AI does it too |
| **Worship** | +1 Attack for every 3 Prayer |
| **Healing N** | Each round start, heals your most wounded unit for N |
| **Lightning N** | On arrival, strikes a random enemy unit for N, +1 per 4 Prayer |
| **Midas Touch N** | A kill by this card pays N Lumber |
| **Divine Retribution N** | When one of your units perishes, strikes a random enemy unit for N |
| **Satiety N** | *My reading of the name:* well fed. At round start at full health, gains +N max HP |

- **Cards:**
  - **Chapel Sparrow** (Base: 2/3 Flying, Prayer 1);
  - Eyrie Heights first-clear rewards: Candle Moth (10-1), Hymn Wren (10-2), Abbey Goose (10-3), Golden Magpie (10-4), Friar Badger (10-5), Storm Heron (10-6), Vigil Owl (10-7), **Cathedral Eagle** (Legendary, 10-10: 5/14 Flying, Worship, needs 5).
- **Grace moved to Prayer:**
  - Shrine Acolyte, Glowworm Cluster and Shrine Bell-Ringer now have Prayer 1, and Shrine High Priest Prayer 2 (they used to make Grace);
  - Blessed Avatar needs 4 Prayer instead of spending 4 Grace;
  - Grace stays in the engine only for old custom triggers.
- **Measured** (themed decks vs the filler deck):
  - the cheap core alone 39%, a mid deck 56%, a full Ecclesia deck **74%**, Chapel Sparrow ×4 49%;
  - "weaker alone, strong together", like the Forgotten Ones;
  - measured singly in the reference deck they look weak (it has no Prayer sources), as the Forgotten Ones did.
- **Fights:** The Blessed Avatar (11-5) and the Sloth Titan (11-7) are still within 3 points of target.

### Scrapper (your model)
- Constructions with very long Wait and high resource costs, plus mining tools and ways to cut Wait.
- Mining cards are attractive ramp, but they sometimes need **Stone**, and only Scrapper cards can be pitched for Stone.
- Scrappers use resources from perished allies and enemies, and the graveyard, extensively.
- They build small bots ("tinkermabobs and digeridoos").

### Evolution (yours)
- **Your 2026-10-10 note:** all about adaptation and getting big bodies.
- **Earlier idea, ride:**
  - a Stage 2 card is played on top of a normal unit;
  - a Stage 3 card goes on top of a Stage 2;
  - the stack has both cards' abilities;
  - damage and statuses carry over.
- **Evo-Timer:** a second countdown. It starts once Wait reaches 0. At 0 the unit transforms (a new face, not just stats).
- **The everyday version** (your 2026-09-14 note): "placing a card on top of another evolves/replaces it, keeping only status effects". This is the base rule for all cards; the Evolution archetype is the deep end.
- **Fun:** investing in one unit and watching it grow; the opponent must decide when to kill it.
- **Engine need:** a board slot that holds a stack. This is the biggest build of all ten.
- **Open:** does riding cost anything? When the stack dies, does it die whole or peel off a layer at a time?

### Spawn / Hatchery (yours)
- **Eggs in battle:**
  - eggs are 0-attack cards;
  - when one hatches, the card you play next from your hand comes in with less Wait and bonus stats taken from the egg.
- **Hatchery:** speeds up Evo-Timers, and sometimes normal Wait.
- **Link to the Nest:** the new Nest eggs (outside battle; 🥚 hatch into a random card after a timer) are the collection-side cousin. Same art language, different rule.
- **Fun:** a clutch of eggs is a threat the opponent must answer before it hatches.

### Mechanica (yours as a name; mechanics proposed)
- **Parts:** Mechanica cards are **Parts** (Chassis, Arm, Core).
- **Assemble:** when your board holds a Chassis plus N Parts, you may **Assemble**. They merge into one robot with summed stats and every Part's skill.
- **Overclock:** spend Elemental Energy ✨ for +attack this round; the unit takes 1 self-damage.
- **Fun:** a jigsaw. The opponent picks off Parts before assembly.
- **Fits:** Elemental Energy (already in the engine, nothing spends it yet), and Scrapper (scrap a broken robot back into Parts).

### Forgotten Ones ✅ built 2026-10-09 (part of the trio below)
- **Echoes 🕯️:** every card sent to your Removal Zone gives 1 Echo.
- **Remember N:** a card waiting there returns at N Echoes, +1/+1 per Echo spent.
- **Cards:** Echo Keeper (Base), Marsh Wisp, Bog Revenant, The Unremembered.
- **Measured:** weaker alone (40–44%), strong together (63–77%).
- **Not built yet:**
  - Echoes from the enemy's exiles (the design says "either side");
  - feeding the Elder Ones.

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

## Keyword families (any card can have them)

| Family | Keywords | Where it shows up today | Counter |
|---|---|---|---|
| Swarm | **Swarm N**: +1 damage per N other Swarm allies. **Hive Mind**: on death, the newest Swarm ally gets +1/+1 | ants and bees | Sweep, Swipe, Pitchfork |
| Tide | **Tide**: +1 on Flow, −1 damage taken on Ebb. **Wash**: on Flow, the enemy facing it gets +1 Wait (once per card) | reef and beach cards | kill them on Ebb-free rounds; Reach |
| Day and night | **Nocturnal** / **Diurnal**: +1 at night / by day | owls, bats, raccoons / hummingbirds, bees, eagles | Arena rule sets that fix the phase |

**General skills, built:**
- Heal removes Bleed first, then heals with what's left.
- Cleanse N removes curses first, with a cleansing animation.
- Stun is counters: each round the unit loses one and skips its whole turn, including its Wait countdown and Bloom.
- A unit still under Wait no longer bleeds from its own actions.
- **Mind Control:** takes an enemy unit to your side (Puppeteer Imp).
- **Player Stun:** the enemy skips their turn (Dread Bell).
- **Reach** (from B6) ignores Flying's dodge.

**Not built yet:**
- **Fast Forward:** N counters let a unit run its upkeep and attack N extra times before the main combat order. It needs a pre-combat pass in the engine; it's next if you want it.
- **Backstab:** you weren't sure. Suggestion: "+N damage when hitting a unit that is facing a different target" (rewards Pitchfork and Sweep angles).

---

## Proposals not yet taken up

### Pack Bond (proposal: wolves, otters, hounds)
- **Hook:** **Bond** links two of your units when the second is played. Bonded units share half of any damage taken.
- **Howl:** when one bonded unit attacks, the other gets +1 attack this round.
- **Grief:** when one dies, the other gets **Rage** for 2 rounds.
- **Fun:** choosing pairs; the opponent decides whom to hit first.

### Trickster (proposal: foxes, raccoons, crows)
- **Hook:** the opponent's resources.
- **Pilfer:** steal 1 gold or Lumber.
- **Swap:** trade a hand card with a random one of theirs.
- **Delay:** add +1 Wait to their next card.
- **Mimic:** copy the skill of the unit opposite for a round.
- **Fun:** disruption and surprise.
- **Weakness:** small bodies that lose a straight fight.
- **Fits:** the existing Trickster Fox and Trash Panda cards.

### Splash (yours, still undefined)
One reading: **Splash N**: damage also hits the units beside the target for N. It's close to Pitchfork now, so it may not be needed.
