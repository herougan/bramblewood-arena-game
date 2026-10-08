# Skills and effects audit (2026-10-08)

**The ask:** "come up with skills and effects + audit what we have right now. Every skill that is prominently used must have a good reason and tactical fun from it (then of course, we can load up the sfx)."

**Scope:** every keyword in `PASSIVE_DEFS` / `SKILL_DEFS` / `ACTIVE_PRESETS` (`arena_app.js`), the older card-data fields the engine still reads, and the custom triggers on real cards. Every rule below was checked against `bramblewood-engine.js`. Card counts are from `canonical/cards.json`: **293 real cards** (the 50 "Test:" cards are left out).

---

## Do this first

| # | Change | Why | Size |
|---|---|---|---|
| 1 | **Rework Flying.** Drop the 50% dodge. Make it "non-Flying melee hits deal 1 less (min 1)". Also stop dodge chances stacking. | 66 cards and every Hummingbird have it. It's a coin flip with no decision. 14 of the 20 Otter faction cards can't fly, so in the starter matchup they miss Hummingbirds half the time. | M |
| 2 | **Give the two starter factions real skills.** All 30 Otter and Hummingbird cards are vanilla apart from Flying. | The game's main matchup has no skill decisions at all. Lore already names the toolkits (Otters: Guardian, Armor, shield wall. Hummingbirds: speed, song, beast-bond). See the new skills in section 4. | M |
| 3 | **Show the 4 invisible keywords**: Scar, Sap, Grit and Renewal. | They work in the engine, but there's no card text and no editor row. Magma Titan, Barrow Leech, Basalt Boar and Phoenix Fledgling look vanilla to players. | S |
| 4 | **Make Poison (and Bleed) decay.** Add an "applied" cue. | Stacks never drop, so damage grows every round and nothing counters it (Renewal is on 1 card). The passive application is silent. | S |
| 5 | **Armor can't take a hit below 1.** Float "🛡 -N" on every reduced hit. | Barnacle Fortress (0/20, Armor 5) and Termite Mound (0/22, Armor 3) take 0 from every starter unit, which stalls the lane. Partial blocks show nothing. | S |
| 6 | **Replace Bounty 1 with a global kill reward, or vary it.** Turn it into **Wanted N** for road-folk. | 69 cards all carry exactly Bounty 1, which is just a flat rule. | S |
| 7 | **Retarget the random pings.** On Spawn and On Ready damage should hit the enemy facing the card, not a random target. | 17 cards fire at a random enemy, and the castle is in the random pool. Where you place the card doesn't change anything. | S |
| 8 | **Rename the economy fields; give Stealth counterplay.** Use Stash, Forage and Vespers. A Guardian intercepts Stealth. | "On Ready" income actually pays every round, but "On Ready" damage fires once. Stealth has no answer on any real card. | S |
| 9 | **Freeze the keyword list.** 23 of 58 keywords are on zero real cards. Cut Swift, Feeble, Mighty, Fragile and Sturdy. | The library is bloated, and these overlap Quick, Evasive and Resist/Weakness. | S |
| 10 | **Load SFX in the order in section 5.** | The cues follow the verdicts, so nothing gets recorded for a keyword we're about to change. | M |

---

## Headline numbers

| | Count |
|---|---|
| Keywords in the "+ Add Skill" registry | 58 |
| Older card fields the engine still reads (Bounty, the income fields, On Ready Damage, Scar, Sap, Grit, Renewal) | 10 |
| Registry keywords on 3+ real cards | 13 |
| Registry keywords on 1 to 2 real cards | 22 |
| Registry keywords on 0 real cards (Test cards only, or none) | 23 |
| Real cards with a skill other than Bounty | 208 of 293 (236 counting Bounty) |
| Starter faction cards (Otters 20, Hummingbirds 10) with a skill other than Flying | 0 |

---

## 1. Inventory

FX column: **Yes** = its own sound plus a visual. **Partial** = some feedback, but the key moment is silent or generic. **No** = nothing.
Engine references are `bramblewood-engine.js` line numbers unless marked `app`.

### 1a. Keywords on 3+ real cards (the prominent ones)

| Keyword | What it does (true to engine) | Engine notes | Real cards | FX |
|---|---|---|---|---|
| Bounty N (field) | The killer's owner gains N Lumber | 2209-2226. Every one of the 69 is Bounty 1 | 69 | Yes (🪵 drop) |
| Flying | 1 in 2 dodge vs melee from non-Flying attackers. Immune to Earthquake | `combatHitLands` 815-821. Ranged and skill damage ignore it (`dodgeCheck` 806 only checks Evasive) | 66 | Yes (🪽 miss, feather burst) |
| Poison N | Each landed hit adds N stacks. Ticks for the full stack every round | `applyPoisonTicks` 1930. Stacks never decay. They clear only on Revive (1778), Renewal (1984) or death (2201) | 16 | Partial (tick Yes; on-hit application is silent, badge only, `app` 20574) |
| Sweep N | Also hits the next N live cards further down the same flank | 2785-2819. All 14 are Sweep 1 | 14 | Yes |
| Armor N | Each hit loses N flat. Applied last, can reach 0 | 534-549. Rend ignores it | 13 | Partial (clang only when a hit is fully blocked, `app` 20545) |
| Evasive | 1 in 2 dodge on any single-target hit or skill | 797-801, 818. Stacks with Flying and Swift (up to 87.5%) | 13 | Yes |
| On Ready Gold N (field) | Gains N **Lumber every round** while Wait is 0 | 2145-2152 (every round, despite the name) | 8 | Yes (resource float) |
| On Spawn Gold N (field) | Gains N Lumber when played | 1326 | 8 | Yes |
| Swipe | Also hits the columns either side of its target. An empty side hits the castle instead | 2840-2885 | 7 | Yes |
| Quick | Attacks before non-Quick units | speed rank 2455 | 7 | Yes (floats on every attack) |
| Thorns N | The attacker takes N flat damage | 2626-2637. Primary hit only, never Sweep/Swipe extras | 6 | Partial (clang and a number, no thorn visual) |
| On Ready Damage N (field) | When Wait first reaches 0, N damage to a random enemy **or the castle** | 2114-2128. Fires once. `pickRandomEnemyTarget` 648 puts the castle in the pool | 5 | Yes (missile) |
| Bleed N | Each landed hit adds N stacks. A bleeding card takes its stack every time it attacks, defends or casts | `bleedTick` 860. Never decays | 5 | Partial (tick Yes; application silent) |
| Guardian | Hits on an adjacent ally go to this card | 774-786. The dodge roll uses the original target | 5 | Yes (shield flash) |
| Progeny (onDeathSpawn) | On death, spawns tokens into the vacated slot | deferred spawn batch | 3 | Yes |
| Rage | Below 50% Health: deals double, takes half | 480-483, 512, 528 | 3 | Partial (growl only; no "enraged!" moment) |
| On Ready Grace N (field) | Gains N Grace every round while Wait is 0 | 2153 | 3 | Yes |
| Stealth | Always attacks the enemy castle | 2569 | 3 | Yes |

### 1b. Custom triggers on real cards

| Pattern | What it does | Cards | FX |
|---|---|---|---|
| On Spawn: damage, random enemy | Ping N on arrival (Raven Scout, Eagle Diver, Ember Wisp...) | 10 | Yes (rune ring and missile) |
| On Kill: gain Lumber | Loot | 4 | Yes |
| On Attacked: spawn token | Bee Drone, Scraper of Skies, Colony | 3 | Yes |
| On Attack / On Attacked / On Ready: buff self | Grows each swing or hit (Rockslide Ram, Wolverine, Tuskboar, Old-Growth Tortoise) | 4 | Yes (generic rune) |
| On Ready: damage, random enemy | Stormcaller, Pelican Diver | 2 | Yes |
| One-offs | Stun on spawn, swap on spawn, draw on spawn, poison on attack, burn on death, reduce Wait | 1 each | Yes (generic rune) |

### 1c. Keywords on 1 to 2 real cards

| Keyword | What it does | Real cards | FX |
|---|---|---|---|
| Expose N | The next hit taken gets +N | 2 | Partial (passive application is silent) |
| Reload N | Sits out N rounds after each attack | 2 | Yes |
| Shell N | When hit: +N Armor and skips its next attack | 1 | Yes |
| Crit | 1 in 2 per round to double all its hits | 1 | Yes |
| Fester / Rupture | + own Poison / Bleed stacks as damage | 1 / 1 | Yes |
| Esprit X/Y | +X/+Y whenever another ally is played | 2 | Yes |
| Regeneration N | Heals N at round start | 1 | Yes (generic heal) |
| Stun (on hit) % | Chance to stun for the round | 2 | Yes |
| Pierce N | Each landed melee hit also deals N to the castle | 1 | Yes |
| Frenzy | Attacks twice per round | 1 | Yes |
| Rend | Ignores Armor and Shell | 1 | Yes |
| Arrow / Fire Arrow N | Shoots the facing enemy each Ready round before melee | 1 / 1 | Yes |
| King Slayer N | +N vs King-tagged targets | 1 | Yes |
| Render N | On spawn: the facing enemy loses N Attack | 2 | Yes |
| Revivificated | First death revives at 1 HP | 1 | Yes |
| Explode T/D | A fuse. After T rounds, D damage to the enemy facing it | 2 | Yes |
| Freeze, Sleep, Paralyze, Stagger | Chance and duration lockouts or debuffs | 2, 1, 2, 1 | Yes |
| Scar N (field, **no card text**) | Target permanently takes +N from every hit (511) | 1 | Yes |
| Sap (field, **no card text**) | Heals by the damage dealt (2701) | 1 | Yes |
| Grit N (field, **no card text**) | +N Attack when swinging at a stronger target (2579) | 1 | Yes |
| Renewal (field, **no card text**) | Cleanses every status at round start (1982) | 1 | Yes |

### 1d. Keywords on zero real cards

Decay, Swift, Feeble, Mighty, Fragile, Sturdy, Gash, Overwhelm, Berserk, Bulwark, Reflect, Momentum, Bloom, Ambush, Siege, Corrode, Inherent Darkness, Core Evil, Earthquake, Skyfall, Blind, Shock, Chained.

- All have working engine code.
- All except Feeble, Mighty, Fragile and Sturdy have their own cue (Swift shares Quick's).
- None of them shapes a real match today.

---

## 2. Audit of the prominent keywords (3+ real cards)

| Keyword | Cards | Reason it exists | Decision it creates | Problem | Verdict |
|---|---|---|---|---|---|
| **Flying** | 66 | Airborne flavour; Earthquake immunity | Almost none. Ranged hits ignore it, but nothing tells the player | A 50% coin flip on 1 in 5 cards and every Hummingbird. It stacks with Evasive (Mangrove Kingfisher: 75% vs ground). It decides the starter matchup by luck | **Rework:** non-Flying melee hits deal 1 less (min 1). Keep Earthquake immunity. Say on the card that ranged and Flying attackers ignore it. Cap any hit at one dodge roll |
| **Bounty** | 69 | Kill economy | None. Every card is Bounty 1 | Pure bookkeeping. It is also absent from the 30 faction starters, so the rule is inconsistent | **Rework:** make "every kill gives 1 Lumber" a global rule, or remove it. Keep the keyword only as **Wanted N** (+N/+N; the killer gains N) for road-folk cards, which turns it into a risk-reward choice |
| **Poison** | 16 | Damage over time that beats Armor | Weak. "Hit the big thing" | Stacks never decay, so damage grows every round. It is applied silently. With dmgType Poison, all damage becomes stacks. Counterplay is Renewal, on 1 card | **Rework:** ticks, then halves (round down). It settles near 2x per-hit, so re-applying matters and spreading or focusing becomes a choice. Add a "+N ☠" float and a `poisonApply` cue on passive hits too |
| **Sweep** | 14 | A heavy hitter cleaves down a line | Good. Placement and flank depth matter; spread your board thin against it | Extra hits skip Corrode, Expose, Blind, Shock, Stagger and Thorns, which the primary hit applies (2805-2813 vs 2652-2696). The player can't see which card is "next down the flank" | **Keep.** Make the extra hits apply the same on-hit set. Show a faint arrow to the follow-up target on hover |
| **Armor** | 13 | Tanky walls, the Otter identity | Medium. Bring Rend, poison or big hitters | Flat armor vs starter Attack of 1 to 4 means total immunity (Barnacle Fortress Armor 5, Termite Mound Armor 3). Partial blocks have no feedback | **Keep, with a floor:** never reduce a hit below 1. Float "🛡 -N" whenever Armor reduced a hit |
| **Evasive** | 13 | Slippery, cheap units | None, it's luck | Redundant with Flying and Swift; they stack multiplicatively | **Keep** as the one coin-flip keyword. A hit gets at most one dodge roll. Show a "50%" pip on the card |
| **On Ready Gold** (Lumber income) | 8 | Economy bodies | Real: slow income vs board presence | The field is called Gold and the card says "On Ready", but it pays Lumber every round (On Ready Damage fires once) | **Keep, rename** as the keyword **Forage N**: "Each round it's Ready, gain N Lumber" |
| **On Spawn Gold** | 8 | Tempo vs value | Real: a cheap body that refunds | Naming only | **Keep, rename** as **Stash N** |
| **Swipe** | 7 | Punishes sparse boards | Strong: fill your flanks or eat two castle hits | None big | **Keep** |
| **Quick** | 7 | Kill before being hit | Strong: races and sequencing with the live reflow | The float plays on every attack, even when going first changed nothing | **Keep.** Float only when a Quick attack kills before its target acted |
| **Thorns** | 6 | Anti-swarm, punishes chip damage | Good: don't feed it 1-Attack units; use ranged or Stealth | Doesn't trigger on Sweep or Swipe extras (not stated). No thorn visual | **Keep.** State "primary hits only". Add a needle-burst VFX and its own `thornPrick` cue instead of the generic clang |
| **Random pings** (On Spawn damage, On Ready Damage, On Ready trigger damage) | 17 | Reach and removal | Almost none: the target is random and the castle is in the pool (648-653) | Where the card is placed doesn't matter | **Rework:** target the enemy facing the card (like Arrow), or the lowest-Health enemy. It then becomes a placement puzzle. Keep the castle only as the "no enemies" fallback |
| **Bleed** | 5 | Punishes cards that act a lot | Good and unique: keep a bleeding card stunned or idle; put it on targets that Sweep or Frenzy | Never decays. Application is silent | **Keep.** Lose 1 stack per tick. Add a "+N 🩸" float on passive hits |
| **Guardian** | 5 | Protect a carry; the Otter identity | Strong: build the formation around it | None big | **Keep.** Make it the core of the Otter kit (section 4) |
| **Progeny** | 3 | Death value, swarm theme | Good: when to trade it | None | **Keep** |
| **Rage** | 3 | Comeback bruiser | Real for the opponent: burst it from high Health in one go | The threshold is invisible | **Keep.** Draw a 50% tick on the Health bar and play a one-time "Enraged!" flash and growl when it crosses |
| **On Ready Grace** | 3 | Shrine economy | Same as Forage | Naming | **Keep, rename** as **Vespers N** |
| **Stealth** | 3 | A face-damage closer | None. It is unblockable, and Bulwark (the only answer) is on 0 real cards | No counterplay | **Rework:** a Guardian anywhere on the enemy row intercepts the first Stealth hit each round. Shield flash plus a "Spotted!" float |
| **On Kill: Loot** | 4 | Road-folk and scavenger economy | Good: aim it at weak targets | None | **Keep.** Name it **Loot N** |
| **On Attacked: Spawn** | 3 | Hive swarm | Good: don't hit it with weak attackers | Colony (0/20) can flood the board vs multi-hitters | **Keep.** Cap it at 1 spawn per round |
| **Self-buff on attack or hit** | 4 | Snowball bruisers | Medium: kill it early | No name; each reads as a raw trigger | **Merge** into one keyword: **Hackles N** (+N Attack each time it's hit) and **Bloodlust N** (+N each time it attacks) |

### Cross-cutting findings

- **The starter matchup has no skills.**
  - 30 faction cards: 16 have Flying; nothing else.
  - Otter non-flyers (Otters, Ants, Fish, Rabbits, Chipmunks) miss Hummingbirds 50% of the time. Hummingbirds never miss them.
- **Invisible keywords.** The card-text loop (`app` line 914) only walks `PASSIVE_DEFS`, so Scar, Sap, Grit and Renewal never print. They also have no "+ Add Skill" row.
- **Inconsistent extra hits.** Sweep and Swipe extra hits roll Freeze, Sleep, Paralyze and Stun, but skip Blind, Shock, Stagger, Corrode and Expose. Thorns never answers them either.
- **Too many dodges.** Flying, Evasive, Swift and Illusory are four separate 50% rolls. One readable dodge keyword is enough.
- **Too many multipliers.** Feeble, Mighty, Fragile and Sturdy duplicate Resist and Weakness, and are on 0 cards. **Cut.**
- **Swift** is Quick plus a dodge, on 0 cards. **Cut** (or keep it purely as "acts before Quick", without the dodge).
- **Earthquake has no targets to matter on.** It's on 0 real cards, and Flying is its only interaction. Burrow (below) gives it a real job.

---

## 3. Reworks in one place (rules text)

| Keyword | New rules text |
|---|---|
| Flying | **Flying**: Takes 1 less damage from non-Flying melee hits (min 1). Immune to Earthquake. |
| Evasive | **Evasive**: 1 in 2 chance to dodge a single-target hit. A hit can only be dodged once. |
| Poison | **Poison 2**: Each hit adds 2 Poison. At round start, Poison deals its stacks, then halves. |
| Bleed | **Bleed 2**: Each hit adds 2 Bleed. When a bleeding card acts or defends, it takes its stacks, then loses 1. |
| Armor | **Armor 2**: Takes 2 less from each hit, never below 1. |
| Bounty | **Wanted 2**: +2/+2. Whoever kills it gains 2 Lumber. |
| Stealth | **Stealth**: Attacks the enemy castle directly. The first Stealth hit each round is caught by an enemy Guardian, if there is one. |
| Income | **Stash N** (on play) / **Forage N** (Lumber each Ready round) / **Vespers N** (Grace each Ready round) / **Loot N** (Lumber on kill) |
| Random pings | **Volley N**: When it enters, deals N to the enemy facing it (the castle if none). |

---

## 4. New skills (11)

Each one makes a placement, timing or sequencing choice, has a clear answer, and fits a people from the lore bible. "Hook" names the existing engine code it would build on.

| Skill | Rules text | Decision it creates | Counterplay | Suits | Cost / power | SFX / VFX idea |
|---|---|---|---|---|---|---|
| **Shield Wall** | **Shield Wall 1**: Takes 1 less damage per ally standing directly beside it (max 2). | Keep the line tight; choose which cards sit on the edge | Swipe and Sweep break the line; Rend; kill an end card first | Otters (Rivergate Legion) | About Armor 1 to 2, but positional. Worth about 3 Health. Hook: `physicalRowOrder` | Two bronze knocks as shields lock; a thin bronze bar glows between the neighbours |
| **Standard** | **Standard 1**: Adjacent allies have +1 Attack. When it dies, they are Staggered for 1 round. | Put it between your hitters and protect it (Guardian next to it) | Focus it down; Pounce; Swap | Otters (standard-bearers). Brings back what Rally was meant to be | A support with low own stats, cost 1 to 2 | A horn note and a bronze fish standard popping up; on death, a banner flap and a falling horn |
| **Spearhead** | **Spearhead 2**: While in the centre slot, +2 Attack and Armor 1. | Play order matters: the first card played lands in the centre | Kill it so another card collapses in; Swap it out | Otters (the centurion "first through the gate") | Strong but conditional, cost 2. Hook: the centre-slot rule | A spear glint and a short trumpet when it takes the centre |
| **Dart** | **Dart**: After it attacks, it swaps places with the ally on its outer side. | Rotate a glass cannon out of the hot seat; choose who gets pulled into the front | Swipe hits both slots; Sweep; Thorns on the next swing | Hummingbirds (speed) | Near free on 2 to 3 Attack, low-Health birds. Hook: `swapPositions` and On Move | A colour blur streak and a fast wing hum (a 40 to 60 Hz trill) |
| **Beast-Bond** | **Beast-Bond**: While a Beast is beside it, both get +1/+1 and the Beast gains Quick. | Deckbuild across peoples; pair them on the board | Kill either half; Swap breaks the pair | Hummingbirds with big beasts (the lore's song-bond) | +2/+2 total when set up. Cost 1 on the bird | Music-note ribbons between the pair; a bird trill over a low beast hum, as a chord |
| **Pollinate** | **Pollinate 2**: After it attacks, heal the most damaged ally beside it by 2. | Choose its neighbours; the heal is tied to attacking, so keep it able to act | Stun, Freeze or Blind it; burst the neighbour; kill the bird | Hummingbirds (songs and blessings) | About Regeneration 2, aimed. Cost 1 | Pollen motes drift to the neighbour; a soft chime with a breath |
| **Pickpocket** | **Pickpocket 1**: When it hits the enemy castle, steal 1 Lumber from the opponent. | Aim for an open lane; keep your board uneven on purpose | Keep its lane blocked; Guardian; Bulwark | Mice and rats (road-folk) | An economy swing; cost 0 to 1 on a small body. Hook: `damageHQ` | A coin hops from the enemy pill to yours; a sly chuckle and a coin clink |
| **Pounce** | **Pounce**: Attacks the enemy with the lowest Health instead of the one in front (Guardian still redirects). | The opponent must protect its wounded units; you pick when to drop it | Guardian, heals, Thorns on low-Health bait | Beasts (wolves, wild cats, foxes) | Strong finisher; give it modest Attack. Hook: a branch in `resolveLiveTarget`, like Stealth | An arc leap across the lanes; a low growl and an air whoosh |
| **Hive Mind** | **Hive Mind**: Damage it takes is split evenly with Hive allies beside it. | Build clumps of hive cards; feed hits into the strongest | Swipe, Sweep and Earthquake hit them all; Poison isn't shared | Ants, bees, termites ("We") | A defensive spread; cost 0 to 1 on drones | Honeycomb hex lines flash between the cards; a chorded buzz |
| **Faithful** | **Faithful**: Once per fight, when the ally beside it would take a killing blow, it takes the hit instead. | Put the dog beside your carry; the opponent must decide whether to kill the dog first | Kill it first; multi-hits; Poison ticks aren't hits | Dogs (neutral, loyal escorts) | A one-time save, different from Guardian (which always redirects). Cost 1 | The dog leaps in front, a bark and a thump; a paw-print shield |
| **Burrow** | **Burrow**: While its Wait is above 0, attacks can't hit it (Earthquake can). Its first attack after surfacing deals +2. | Timing: plan the round it pops up; safe setup for slow cards | Earthquake (finally has a role); race the castle; Increase Wait | Rabbits, moles, badgers (supporting folk) | Makes Wait 2 to 3 bodies playable. Cost neutral | A dirt mound with a dig crunch; pops out in a dirt spray |

**Suggested starter kits** (3 to 4 cards per faction, not all):
- **Otters:** Shield Wall on the Guards and Paddlers, a Standard card, Guardian on a Trout shield-mate, Spearhead on the Centurion.
- **Hummingbirds:** reworked Flying for all, Dart on the Crimson Wing duelists, Pollinate on the Gold-throated Acolyte, Beast-Bond on the Cobalt Talon.

---

## 5. SFX loading order

Existing synth cue names are in `SoundKit` (`arena_app.js`). Record files for these first, because they are kept and appear in real matches most:

1. **Dodge** (`dodge`, `featherFlutter`): retune after the Flying rework. It will fire much less, so it can be richer.
2. **Hit light and heavy** (`hitAt`), **Armor reduce** (new "🛡 -N", a soft wood-on-bronze tap) and **full block** (`clang`).
3. **Poison apply** (`poisonApply`), **poison tick** (`bubble`), **bleed apply and tick** (`bleedApply`, `bleedTick`).
4. **Sweep and Swipe** (`sweepTone`, `swipeTone`), **Quick** (`quick`), **Guardian** (`shield`).
5. **Thorns** (new `thornPrick`, replacing the shared `clang`), **Rage enter** (new, one-shot; `growl` stays for its attacks).
6. **Resource gains** (`gold`, `grace`), **Loot and Bounty drop** (`itemDrop`), **missile ping** (`arrowLoose`, `arrowThunk`).
7. Then the new skills in the order they ship: Shield Wall and Dart first (starter factions), then Pounce, Pickpocket, Burrow.

Skip recording cues for the 23 zero-card keywords until a real card uses them.
