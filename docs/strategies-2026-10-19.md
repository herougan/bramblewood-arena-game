# Strategies we can play (2026-10-19)

The owner's question 18: *"What other strategies we can play?"*

This page lists the deck archetypes the skill set supports after package SK3 (skills batch 3). For each one it names the key skills and some live cards, then what is still missing. After that it proposes new strategy directions, each built from triggers × actions (the `canonical/skill-costs.json` model, S = trigger weight × action value).

Card names are live cards with a source. The SK3 skills are on no card yet: the owner asked not to put new skills on existing cards. The three SK3 spells (Grave Call, Smoke Screen, Magnet) are at the end of `canonical/cards.json` with no source yet.

## The archetypes we have now

### 1. Go-wide (tokens and anthems)
- **Plan:** fill the row with small bodies, then make them all bigger.
- **Makers:** Brood N (Carrion Fly Swarm, Swarm Matriarch, Lemming Swarm), Progeny (On Death: Spawn), Twin, Sprout, the Spawn action, and SK3's **Spawner &lt;unit&gt;** (a token every turn while Ready) and **Duplicate** (an Illusion copy).
- **Payoffs:** Swarm (Ant Warrior), Esprit (Swarm Matriarch, Sunspire Envoy), Kin Rally, Pack / Pack Leader (Dhole Runner, Dhole Matriarch), Sociable (Meerkat Sentry), Kinship (Rivergate Tribune), Rally (Parish Sergeant).
- **New with SK3:** the anthems the audit found missing. **War Banner N** gives your other units +N/+N while it lives. **Warcry N** gives them +N/+N for good when it is played. **Broodkeeper N** makes every token arrive with +N/+N.
- **Missing:** a sacrifice outlet that pays for small bodies (Sacrifice exists only as Dark Summon fodder). No board-size cap reward, such as "if you have 5+ units".

### 2. Tall (one carry)
- **Plan:** protect and grow one unit.
- **Key skills:** Mighty (Hercules Beetle), Sturdy (Pangolin Roller), Shell, Regen (Elder Tortoise), Satiety, Shedding / Molting, Guardian and Taunt around it, equipment.
- **New with SK3:** **Shieldwall N** (Armor N to both neighbours) frames a carry. **Harbinger N** grows on every death. **Corpsefeeder N** grows by eating the graveyard.
- **Missing:** a "the carry can't be targeted by skills" ward (Invisible is only for the first N rounds). No "transfer buffs on death" effect.

### 3. Poison and damage over time
- **Key skills:** Poison (29 cards: Caustic Scorpion, Trapdoor Spider), Venomous (Platypus Spur), Toxin (Cone Snail), Bleed (18 cards: Alley Cat, Bog Leech), Proliferate (Plague Gnat Cloud), Detonate (Bogfire Newt), Venom Master (Cottonmouth Matriarch), Hunter/Cull set to Poisoned (Fen Mink), Wither, Decay.
- **New with SK3:** **Amplifier N** turns Poison 2 into 3 on its neighbours. **Vulnerable** (Shock on every enemy) makes the cash-in hits count.
- **Missing:** a "Poison can't be cleansed" lock (only Toxin has it). There is no reward for the number of Poisoned enemies.

### 4. Movement and hazards
- **Key skills:** Wave (Dolphin Knight, Moray Ambusher), Tornado (Dust-devil Kestrel), Restless, Swap, Bloodlust's leap, Trap (Antlion Pit, Quicksand Queen), Slash & Burn (Fire Hawk), Web and Tangle, the field hazards.
- **New with SK3:** **Stench N** marks an area: −1 Attack a token, until a Wave or the Tide washes it off. Wave decks clean it from themselves. **Magnet** pulls flyers down so ground units and hazards reach them.
- **Missing:** a reward for "an enemy moved" (On Move fires only on the unit itself). No "push into a hazard" bonus.

### 5. Economy and ramp
- **Key skills:** Lumberjack (Badger Lumberjack), On Ready: Gold (Ant Hill, Elder Willow), Timber (Heartwood Treant), Hoard (Tax-Collector Teal), Midas (Golden Magpie), Bounty, Refine, the pitch (Scavenge / On Pitch), the Nest. Package SK2 (in parallel) adds the economy skills and structures.
- **Missing:** big Lumber sinks that win the game (a "spend 6: …" finisher). Most payoffs are stat bumps.

### 6. Graveyard and exile
- **Key skills:** Revive (Sea Turtle Elder, Cinder Skeleton), Carrion (Ossuary Lammergeier), Relic (Shrine High Priest), Meiosis (Planarian Splitter), Devour (Pit Glutton), Exile from graveyard (the Echo), On Exile, casting from exile.
- **New with SK3:** **Corpsefeeder N** (exiles your oldest grave card each turn and grows; it feeds On Exile and the Echo). **Grave Call** (a spell: revive a random creature, +X/+X for the size of your graveyard). **Harbinger N** (On Any Death).
- **Missing:** a way to choose what goes to the graveyard (a self-mill). Grave Call's pick is random. No "while your graveyard has 10+ cards" threshold.

### 7. Control and lockdown
- **Key skills:** Freeze (Glacier Yak, Walrus Icebreaker), Sleep (Nightshade Moth), Stun, Confuse (Lyrebird Mimic), Paralyze, Web (Gallery Orb-Weaver), Tangle / Bound, Daunt, Scare, Increase Wait, Player Stun, Nullify, Field Breaker.
- **New with SK3:** each lock now does a different job:
  - **Silence N:** its skills and triggers are off, but it still swings.
  - **Stymie N:** its Wait clock stops, and a Ready unit goes back to Wait 1.
  - **Exhaust N:** its next N triggers or skills fizzle.
  - **Petrify N:** stone for N rounds: no attack, half damage taken.
  - Freeze still skips a swing. Sleep skips swings until the unit is hit. Confuse is a coin flip.
- **Answers:** Shatter now breaks Frozen, Brittle, Petrified and heavily armored (Armor 3+) targets. On stone, the whole hit is doubled.
- **Missing:** a counter-control "immune to statuses" keyword (Cleanse removes them; nothing prevents them).

### 8. Structures and siege
- **Key skills:** Demolisher (Beetle Battering-Ram, Badger Sapper), Siege (Cave Bear, Siege Rhino), Bulwark, the bramble skill (Ancient Sloth Titan, Muskrat Lodgekeeper), Rebuild, the cages, structures (package SK2 in parallel).
- **New with SK3:** Shieldwall protects the units beside a wall-holder.
- **Missing:** "deal damage to the castle equal to X" finishers. No reward for a structure surviving N rounds.

### 9. Equipment (Voltron)
- **Key skills:** equipment cards (`canEquip` / `equip`), Natural slots. Package EQ (in parallel) adds equipment and slot hazards.
- **New with SK3:** Amplifier makes an equipped skill number one bigger on a neighbour.
- **Missing:** a payoff for "equipped units" (such as +1/+1 per equipment).

### 10. Leader-centric
- **Key skills:** the deck leader (`leaderId`, Heroic+ cards, summoned from the 👑), Loyal (Sworn Shieldbearer), Usurper (Crown Pretender), King Slayer (King Maker), Gladiator leaders, Natural Leader.
- **New with SK3:** **Herald N**: your Leader has +N/+N while it lives.
- **Missing:** leader abilities that grow during a fight (the leader is only a card). No "when your Leader attacks" trigger.

### 11. Accuracy against dodge
- **Plan:** a side that can't miss, against Evasive, Flying and Smoke decks.
- **Key skills:** True Strike (Legendary), Fencing, Keen Sense, Sonar, Darksight, Reach, Boomerang, Expose.
- **New with SK3:** **Spotter**: while it lives, your units can't miss or be dodged, Invisible included. A Legendary dodge still rolls, as for True Strike. **Smoke Screen** (a spell) is its counterpart: your units are hidden in Smoke for 2 rounds, and Spotter sees through it.

## The go-wide audit (owner: "Do we have skills to power up all units?")

| Skill | What it does | All your units? |
|---|---|---|
| Rally N | +N Attack to all your units, itself too (an aura) | yes, Attack only |
| Kinship &lt;Type&gt; X/Y | +X/+Y to your units of one Type | one Type only |
| Nature's Force N | +N/+N to your Elementals | Elementals only |
| Inspiring N | the allies on either side get +N Attack for their next swing | neighbours, once |
| Kin Rally N | the Kin you play gets +N/+N | one unit a play |
| Pack Howl N | a Wolf you play: the enemy facing it Bleeds N | not a buff |
| Swarm | +N Attack to itself for each ally of its type | itself |
| Pack / Pack Leader | chained Pack units get +S/+S | Pack units only |
| Esprit X/Y | itself grows when an ally arrives | itself |
| **War Banner N (SK3)** | your other units have +N/+N while it lives | **yes** |
| **Warcry N (SK3)** | On Play: your other units +N/+N for good | **yes** |
| **Broodkeeper N (SK3)** | your tokens arrive with +N/+N | tokens |

Before SK3, no skill gave all your units +N/+N. Rally came closest, but it gives Attack only.

## New strategy directions (proposals)

Each idea is a trigger × action, using the existing table where it can.

1. **Sacrifice engine:** go wide, then cash the bodies in.
   - *Offering N:* On Ally Die (1.23) × Gain Lumber N (a new filter: only your tokens).
   - *Bone Altar:* On Sacrifice (0.5) × Buff all allies +1/+1 (`buffAll`).
   - *Martyr:* On Death × Shield N to the adjacent allies.
2. **Discard and pitch value:** play from the pitch pile.
   - *Kindling N:* On Pitch (4.31) × Damage N to a random enemy.
   - *Recall:* On Pitch × Draw 1, once a turn (the onceCap modifier).
   - *Ash Feast:* On Pitch × Corpsefeeder's `devourGrave` (exile the oldest, +1/+1).
3. **Mark and execute:** set up low targets, then finish them.
   - *Hunter's Mark:* On Spawn × Expose N on the strongest enemy (a new sub: `strongest`).
   - *Bloodhound:* On Kill (1.37) × Buff self +1/+0 and Ready again (a new action: `refresh`, Wait 0).
   - Pairs with Executioner (below 25%) and Cull (weak targets).
4. **Status stacking:** reward the number of statuses on a target.
   - *Scholar of Pain:* On Attack × Damage = the target's status count (a new amount: `statuses`).
   - *Contagion:* On Enemy Died × that unit's statuses jump to the one beside it (a new action: `spreadStatuses`).
   - Pairs with Amplifier and Vulnerable.
5. **Tide and Stench (water versus land):** the field as a weapon.
   - *Mudslinger:* On Attack × Stench 1 on the target.
   - *Rain Dancer:* On Round Start (4) × wash 1 Stench from your side (a new action: `wash`).
   - Wave decks already wash themselves clean.
6. **Leader army:** the Leader as a commander.
   - *Banner of the Crown:* While your Leader lives × War Banner 1 (a new condition: `whileLeader`, as Loyal reads it).
   - *Call to Arms:* On Ally Played (2.5) × Herald's +N/+N to the Leader.
   - *Coronation:* On Kill × your Leader +1/+1.
7. **Echo and exile:** the Removal Zone as a resource.
   - *Echo Chamber:* On Exile (0.25) × Buff all allies +1/+0.
   - *Ghost March:* On Turn Start × cast the top card of your exile pile free (the existing `castFromExile`).
   - Corpsefeeder fills the Removal Zone.
8. **Clockwork (Wait manipulation):** control time instead of bodies.
   - *Hourglass:* On Ally Ready (1.08) × Reduce Wait 1 on the next ally (a new sub: `adjacent` for Reduce Wait).
   - *Time Thief:* On Attack × Stymie 1, and Reduce Wait 1 on itself.
   - Pairs with Stymie and Increase Wait.

Each proposal costs from `canonical/skill-costs.json` as it stands. The new subs, amounts and actions would need an entry (an estimate first, then a measure with `tools/skill_worth.js`).
