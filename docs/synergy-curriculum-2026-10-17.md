# Synergy curriculum, Maps 0–40 (2026-10-17)

The ask (note 24): *"Last SS, im thinking about synergies with Codex. Where to introduce skills, synergies, field effects (maybe new ones like Ash Rain and Ashy (volcano explosion)) then creating interesting decks for players to fight."* The screenshot listed the pairs and ideas in section 2 and the buildings and NPCs in section 5.

This document is a plan. Section 1 lists what this pass built. Everything else is a proposal for you to accept or change. The same tables are in `docs/synergy-curriculum-2026-10-17.xlsx`.

**Status words used below:**
- **Built** means it is in the game now.
- **Other agent** means the parallel skills pass (Vanguard, Web 🕸️, Reflect rework, Sentry, Bloodlust/Ambush rework, Carrion/heal-on-death, Hoard) is building it. The tables say where it should go.
- **Proposed** means it doesn't exist yet.

## 0. The rule of three

Every skill, synergy pair and field effect goes through the same three steps:

1. **Meet it.** It first shows up on an enemy card, in a fight you can win without understanding it. The Codex entry opens with a "?" and lifts the first time it happens, the same way field rows already work.
2. **Feel it.** A later fight on the same map, or on the next one, is built so that the skill or field decides the fight. Its reward card is usually the answer to it, or a card that uses it.
3. **Combine it.** Once both halves of a pair have been met, one fight's enemy deck shows the pair working together. The reward hands you one half, so you can build it yourself.

The first two steps happen on the map that introduces the skill. A pair waits until both halves are known, normally one to three maps later.

## 1. Built in this pass

| What | Where | Notes |
|---|---|---|
| **Map 22: The Rimefire Caldera** 🌨️ (`m22`) | 8 fights: 5 skirmishes, 2 elites, 1 boss | An ice volcano. Each fight mixes cold and heat; details in section 6. The Long Burrow (22-LB) is still attached. |
| **Map 23: The Goldfeather Siege** ⚔️ (`m23`) | 8 fights | The warfield outside the Magnate's walls: war elephants with archers, siege engines and trenches. |
| **Map 24: Goldfeather Keep** 🏰 (`m24`) | 8 fights | Breach the gate and climb the keep to **the Magnate Duck**. |
| **Sulphur Fumes** 💨 (`sulphurFumes`) | 22-2 Steam Vents, **20-A-2 The Wraith Vents**, **20-A-6 The Vent Crabs** | The vent hazard. It uses Choking, not Poison. |
| **Ash Rain** 🌋 (`ashRain`) | 22-6 Ashfall Cornice | Castles take 1 damage a round, and the ash dims the sun. |
| **Ashy** 🌫️ (`ashy`, `ashyAfterEruption`) | After any volcano Eruption on the volcano maps; 22-6 and 22-8 can erupt | Flyers are grounded, and attacks miss 1 in 5 in the ash. |
| **Arrow Slits** 🏹 (`arrowSlits`) | 23-5, 23-6, 23-7 (3 damage), 23-8, 24-1, 24-5 (2), 24-8 (2) | The defenders' walls shoot one of your units each round. |
| **Volcano Glow** (Day 4 / Night 2) | Every volcano map that has day and night: 20, 20-A, 22 | `rules.phaseDay` / `phaseNight`; you can also set it per fight in Edit skirmish. |
| **Arrow 2, twice** | War Elephant | `arrowCount: 2`. The card reads "Arrow 2" on two lines. |
| **17 new cards** | Maps 22–24 | Section 7. They have no art yet and show their emoji. |

The texts of the new field effects, exactly as the game shows them:

- **💨 Sulphur Fumes:** "Each round from round 2, the vents breathe out: every unit that doesn't resist fire, isn't Dry and isn't Flying is Choking that round: −1 Attack on everything it deals. No damage, no poison."
- **🌋 Ash Rain:** "Each round from round 2, ash falls: both castles take 1 damage (never below 1), and the ash dims the sun: day bonuses are halved, as under Cloudy."
- **🌫️ Ashy:** "Thick ash on the ground and in the air: Flying units are grounded (Flying gives no dodge, and no Tailwind or Headwind), and every attack at a unit misses 1 in 5. Darksight, Keen Sense and Sonar see through it."
  - After an Eruption it reads: "After an Eruption the ground is Ashy for 4 rounds: …"
- **🏹 Arrow Slits:** "Each round from round 2, the defenders' walls loose an arrow at a random unit on the attackers' side: 2 damage. A Helmet can turn it."
- **🌋 Volcano Glow:** "No true night here: the volcano's glow keeps it Day for 4 rounds, then Night for 2, and round again."

## 2. The synergy pairs from your list

Each pair has four things: where you first meet each half, the map where the pair first appears together, the fight whose enemy deck shows it off, and the line the Codex would show under "Works well with".

| # | Pair / idea | How it works | Halves met | Pair shown | Showcase deck (fight) | Codex "Works well with" line | Status |
|---|---|---|---|---|---|---|---|
| 1 | **Swarm & Swarm** | Every Swarm unit counts the others that share its type. Two Swarm units make each other stronger. | Swarm (ants) on Map 0, bees on Map 1 | Map 1-A | 1-A-2 Bee Lines; later 26-x (Ant Empire) | "Each Swarm ally of its type is +1 Attack for it, and it counts for them." | Built (skill) |
| 2 | **Pack & Pack Leader** | A Leader links every Pack unit of its type into one chain, even when they aren't adjacent. | Pack on Map 14, Leader on Map 14 elite | Map 16 | 16-x Taiga wolves at night; 38-x | "A Pack Leader joins every Pack unit of its type into one chain." | Built |
| 3 | **Darkness & Illuminate / Darksight** | Illuminate lights your whole side. Darksight sees for itself. Since 10-17 Darksight also sees through Ashy ash. | Darkness on 2-B (Pitch Black), Darksight on Map 1 | Map 8 | 8-x Caves; 22-6 Ashfall Cornice (Ashwing Ptarmigan, Darksight); 29 Abyssal Plains | "Illuminate lights your side in the dark; Darksight units need no light." | Built |
| 4 | **Make Arrow / Healing stronger** | A support skill gives allies with Arrow +1 to their arrows (like the Wildpath "Fletcher's Eye", but on a card), or makes allies' heals +1. | Arrow on Map 3, Healing on 2-A | Map 23 (Fletcher), Map 27 (Herbalist) | 23-6 The Elephant Line once a "Quartermaster" card exists; 27-x | "Its Fletcher makes every Arrow on your side +1: put it behind War Elephants." | Proposed (skill: **Fletcher N**, **Herbalist N**) |
| 5 | **Damage by Poison count** | A hit deals +1 for every Poison counter on the target (**Envenom**). Swamp Fever and Poison Bolt feed it. | Poison on Map 0, Swamp Fever on Map 5 | Map 25 | 25-x Rainforest Floor dart frogs + Envenom vipers | "Envenom cashes in Poison: stack Poison first." | Proposed (skill) |
| 6 | **Damage by Lumber count** | **Timber** (+1/+1 per Lumber you hold) is built. **Lumberjack** gives +1 whenever you gain Lumber, and Leylines II adds 1 a round. | Lumberjack and Timber are on no map yet | Map 34 | 34-x Timber Kingdom (Heartwood Treant + Badger Lumberjack under Leylines II) | "Timber grows with your Lumber; Lumberjack and Leylines II feed it." | Built (skills), needs a map |
| 7 | **Increase allies' status power** | **Amplify N**: your Poison, Bleed, Freeze and Stun land +N stronger. | The statuses by Map 6 | Map 36 | 36-x Menagerie | "Amplify makes every status your side lands stronger." | Proposed (skill) |
| 8 | **Ice on ice, electric on water, fire on fire** | **Shatter**: cold damage to a Frozen unit +2. **Conduct**: Electricity's wet bonus is built (Wet units take +1), and Conduct would chain it along Tide units. **Kindle**: fire damage to a unit already hit by fire this round +2. | Freeze on Map 17, Electricity on 2-B, Fire Arrow on 19-A | Shatter and Kindle meet on **Map 22**; Conduct on Map 28 | 22-5 The Geyser Field (Frigid + Lava Spout + the Rimefire Salamander's Ice and Fire Arrows); 28 Stormcoast; 31 and 32 | "Ice on a frozen target shatters; fire on a burning one flares." | Partly built (Electricity's wet bonus); Shatter, Kindle and Conduct proposed |
| 9 | **Heal when anything dies (Carrion / Corpse Eater)** | When any unit dies, it heals. | onDeath triggers on Map 6 | Map 27 | 27-x Carrion Moors; 20-A undead decks | "Carrion feeds on every death, yours and theirs." | Other agent (Carrion) |
| 10 | **Heal on hit = Leech** | Its hits heal it for part of the damage. Sap (Barrow Leech) is close. | Sap on Map 8 | Map 27 | 27-x | "Leech heals as it hits; Bleed keeps it hitting." | Proposed (or Sap renamed) |
| 11 | **Claws 🦀 (left and right only)** | Hits the two units on the slant and not the one in front. **Bishop's Path** (+2 on the slant) is its field. | Crab Claws (retired 10-14; crabs Fork) | Map 30 | 30-x Glass Labyrinth, under Bishop's Path | "Claws strike the slant; Bishop's Path makes slanted hits +2." | Proposed (bring Claws back as its own skill) |
| 12 | **Web 🕸️** | It slows or holds enemies in its lane. | Spiders on 7-A and 18-3 | Map 25 | 7-A-3 Silk Gallery, 18-3 Widow's Web, 25-x | "Web holds them still for Pounce, Backstab and Arrows." | Other agent |
| 13 | **Balloon Sniper** | A Flying Snipe unit that shoots past the front line. The Balloon Archer (Map 11) is the start of it. | Snipe on 11-A, Balloon Archer on Map 11 | Map 37 | 37-x Sky Docks | "Balloon Snipers pick off the back row; Reach and Arrow Slits shoot them down." | Proposed (card) |
| 14 | **Corpse Eater** | The same as #9. A body-eating Devour variant: eat a dead unit for +stats. | — | Map 27 | 27-x | (as #9) | Other agent |
| 15 | **Sentry** | It attacks when an enemy unit enters or moves into its left, centre or right lane. | — | **Map 24** | 24-5 The Battlements (Battlement Heron), 24-2 The Bailey (Goose Sentry) | "Sentries punish every unit that steps into their lanes; Taunt pulls them in." | Other agent: give it to **Goose Sentry** and **Battlement Heron** |
| 16 | **Grub Farmer (Advanced Ant)** | An ant that raises Grub tokens, which feed or become ants (it counts for Swarm). | Ants on Map 0, Brood on 7-A | Map 26 | 26-x Ant Empire | "Grub Farmers raise Brood that counts for Swarm." | Proposed (card) |

## 3. Skills and fields, map by map (0–40)

Maps 0–21 follow the 10-15 skills-by-map sheet and the 10-16 field-effect notes. The other agent is placing them, so this table only marks the synergy step each map plays. Maps 22–40 are new.

| Map | Name | Meet (new skills) | Feel (a fight where it decides) | Combine (pair shown) | Field effects (new · tested) |
|---|---|---|---|---|---|
| 0 | Bramblewood Outskirts | Flying, Swarm (ants), Regeneration | 0-4 boss: Thorns | — | Mist |
| 1 | Thistlewood | Diurnal, Nocturnal, Swarm (bees), Darksight | Day/night swings | — | Day and night begin |
| 1-A | Clovermead | Evasive | 1-A-2 Bee Lines | **Swarm & Swarm** | Spring Rain (proposed) |
| 2 | Pebble Beach | Tide, Swimmer | 2-4 Pelican Point | — | Tide-spout (one-off) · Tide |
| 2-B | Smugglers' Grotto | Darksight, Illuminate | 2-B-2 | — | **Pitch Black** |
| 3 | Gannet Cliffs | Arrow, Skyfall | Windy flyers | — | Windy |
| 5 | Gatorback Swamp | Poison, Ambush | — | — | **Swamp Fever** |
| 6 | Sable Swampmire | Bleed, Bloom, onDeath | — | (Carrion later) | Night |
| 7-A | The Mycelium Deep | Brood | 7-A-3 Silk Gallery (**Web** goes here) | — | Darkness |
| 8 | Caves & Alcoves | Keen Sense, Electricity | — | **Darkness & Illuminate/Darksight** | Darkness → Pitch Black |
| 11 | Eyrie Heights | Volley, Twin Shot, Midas | Gale | Arrow family | Gale |
| 12 | The Briar Maze | Cleave, Expose | — | — | Rook's Row / Bishop's Path |
| 13 | The Redwood Deep | Guardian, Rage, King Slayer | — | — | High Canopy |
| 14 | Savanna Reaches | Pack, Pack Leader, Stampede | — | — | First Blood, Undergrowth |
| 16 | The Pinewood Taiga | Frostbite, Ice Arrow | — | **Pack & Pack Leader** | Night, Frigid |
| 17 | Wolfsbane Tundra | Freeze, Ice Bolt | — | — | Freezing |
| 18 | The Glass Dunes | Dry, Fire Bolt | 18-4 Sandstorm | — | Sandstorm, Glass-storm |
| 19 / 19-A | Ashen Spurn / Basalt Foundry | Fire Arrow, Immolation, Siege, Helmet | — | — | Scorched Ground, Lava Spout |
| 20 / 20-A | The Sundered Peak / Eye of the Volcano | Landslide | **20-A-2, 20-A-6** | — | Volcano Glow, **Sulphur Fumes** (20-A-2, 20-A-6) |
| 21 | The Quiet Summit | Fencing, Counterattack | — | — | none (the calm) |
| **22** | **The Rimefire Caldera** | Mountain Climber (as a reward), Resist both (Rimefire Salamander) | 22-2 Dry vs **Sulphur Fumes**; 22-6 Darksight vs **Ashy** | **Fire on fire / ice on ice** (22-5) | **Sulphur Fumes, Ash Rain, Ashy**, Hail + Lava Spout, Frigid + Lava Spout, Scorching + Hail, Slippery 25, Volcano Glow |
| **23** | **The Goldfeather Siege** | **Arrow ×2** (War Elephant), Volley on a Structure, Helmet + Guardian (Testudo) | 23-5 **Arrow Slits** vs Helmet and Armor | **Make Arrow stronger** (Fletcher, proposed); **Vanguard** goes on War Elephant and Marshal Tuskwell | **Arrow Slits** |
| **24** | **Goldfeather Keep** | **Sentry**, Taunt, Swipe, Midas, Bounty | 24-1 Breach the Gate (Demolisher vs the Great Gate); 24-5 Battlements | **Sentry & Taunt**; **King Slayer vs King** (Magnate Duck); **Hoard** on the Magnate | Arrow Slits 2 |
| 25 | The Rainforest Floor (your 10-15 note: the rainforest needs a main map) | Web, Envenom | Spring Rain + Rainrunner | **Poison count** (#5), **Web + Pounce** | Undergrowth, Spring Rain |
| 26 | The Ant Empire | Grub Farmer | Darkness tunnels | **Swarm & Swarm II**, **Grub Farmer + Brood** | Darkness, Consternation (one-off) |
| 27 | The Carrion Moors | Carrion, Leech, Herbalist | Haunted | **Heal-on-death + Bleed**, **Healing stronger** | Haunted, Mist |
| 28 | Stormcoast | Conduct | Gale | **Electric on water** (#8) | Tide + Gale |
| 29 | The Abyssal Plains | Sonar | Crushing Depths | **Darkness II** (Absolute) | Absolute darkness, Crushing Depths |
| 30 | The Glass Labyrinth | Claws (back), Twin, Changeling | Mirage | **Claws + Bishop's Path** | Mirage, Rook's Row / Bishop's Path |
| 31 | Frostfang Glacier | Shatter | Slippery 50 | **Ice on ice** | Freezing + Hail |
| 32 | The Ember Steppe | Kindle, Spitfire | Scorching III | **Fire on fire** | Scorching III, Glass-storm |
| 33 | The Glowing Waste | Irradiated (the Glowing Gecko's suggested map) | — | — | (Irradiation; no magic before 50) |
| 34 | The Timber Kingdom | Timber, Lumberjack | Leylines II preview | **Lumber count** (#6) | Leylines II |
| 35 | The Moon Marsh | Moonborn, Full Moon, Moonpull, Crepuscular | Twilight | **Moon & Night** | Twilight, Full Moon |
| 36 | The Menagerie (the Trader's caravan) | Amplify | — | **Status power** (#7) | Swamp Fever + Haunted |
| 37 | The Sky Docks | Balloon Sniper | Gale | **Balloon Sniper vs Reach** | Gale, Ash Rain (a far volcano) |
| 38 | The Pack Lands | Lone Wolf vs Pack | Full moon | **Pack II** | Night |
| 39 | Ironhold (a second siege) | Vanguard II, Demolisher II | Arrow Slits 3 | **The full siege kit** | Arrow Slits, Landslide |
| 40 | The Leyline Nexus | — | — | **Every zeitgeber pair** | **Leylines I** (your "Map 40+" rule) |

## 4. How the Codex shows synergies

**On a skill page**, add a **Works well with** block under "Answered by":
- Chips of the paired skills. Each chip opens that skill's page, and the line from section 2 sits under it.
- **Shown on:** the map where the pair was combined (for example "Map 22, The Geyser Field").
- **Try it:** one or two cards you own that carry each half. A half you haven't met yet shows "?".
- A pair stays hidden until you have met **both** halves, so it is a small reward for exploring. It shows **New!** on the visit after it lifts, the way field rows do.

**On a card page**, add a **Works well with** row: up to 4 cards (owned first, then seen) that complete one of its pairs. Example: War Elephant → "Fletcher cards, Testudo Tortoise (holds the line in front)".

**On a field-effect page** (the Effects library and the Environment card), add **Helps** and **Hurts**, for example:
- Ashy: Helps Darksight, Keen Sense, Sonar. Hurts Flying.
- Sulphur Fumes: Helps Dry, fire-resistant units and Flying. Hurts everyone else's Attack.
- Arrow Slits: Helps Helmet, Armor and Guardian. Hurts low-Health units.

**Data:** one table, `SYNERGY_PAIRS = [{a, b, why, map, fight}]`, next to `SKILL_COUNTERS`. Both the Codex pages and the "Try it" lookup read it, so new pairs need no new code.

## 5. Buildings and NPCs (Tech, Upgrade, Evolve, Trader, Tavern power)

| Idea from the list | Proposed building / NPC | Unlocks | What it does | Why there |
|---|---|---|---|---|
| **Tech:** upgrade certain specific cards with new effects | 🛠️ **The Tinker's Workshop** (the beavers behind the Trebuchet Crew) | **Map 23**, after 23-4 Siege Camp | Picked cards get one extra effect each, for a cost in materials. Examples: Balloon Archer +Snipe 1; Testudo Tortoise +Reflect 25; Howdah Archers +Arrow 1; Trebuchet Crew Volley → every round. Each card has one fixed upgrade, chosen by us. | The siege engineers are the first tinkerers you meet. |
| **X:** upgrade your ? | 🏰 **The Armourer** (the Magnate's armoury, taken) | **Map 24**, after 24-8 the Magnate Duck | Upgrades your **castle**. Your own Arrow Slits 1, then Arrow Slits 2, then +Armor. | You have just spent two maps being shot by walls. Now you own some. |
| **X:** evolve some cards into others | 🦋 **The Chrysalis Grove** | **Map 25**, the Rainforest Floor | Evolves chosen cards into their grown form for a fee and some duplicates. Examples: Duckling → Pond Duck → Mallard Marauder; Compost Grub → a beetle; Rabbit Kit → Buck Brawler. | Metamorphosis belongs in the rainforest, among the butterflies and frogs. |
| **Trader:** trade X for Y | 🐪 **The Caravan Trader** | **Map 23**, in the siege camp's sutler tents (then travelling) | A weekly offer such as "3 Iron Shards for 1 Tempering Stone" or "5 spare Commons for 1 Uncommon of the same type". Offers change each week. | Every army has its sutlers. |
| **??:** upgrade Tavern power | 🍺 **The Brewmaster** | **Map 27**, the Carrion Moors (an inn on the moor road) | Tavern levels past Tavern 3: a 4th recruit offer, a Beer cap of 4, then Rare+ recruits. | It sits late enough that the Tavern is already familiar. |

## 6. The three new maps, fight by fight

### Map 22: The Rimefire Caldera 🌨️ (`m22`, volcano)

| Key | Fight | Kind | Field (besides the Volcano Glow) | Deck idea | Reward |
|---|---|---|---|---|---|
| 22-1 | Snowmelt Switchbacks | skirmish | — | Goats, yak, hares, marmots | — |
| 22-2 | Steam Vents | skirmish | **Sulphur Fumes** | Dry geckos and centipedes breathe easy; the salamanders resist fire | Rimefire Salamander (Rare) |
| 22-3 | Frozen Lava Flow | skirmish | Slippery 25 | Basalt boars, musk-ox, ermines | — |
| 22-4 | Hailstone Ridge | skirmish | Hail 2 | Ice archers and owls | Fumarole Ibex (Rare) |
| 22-5 | The Geyser Field | skirmish | Frigid + Lava Spout 2 | Mammoth, drakes, Rimefire Salamanders (**fire on fire / ice on ice**) | — |
| 22-6 | Ashfall Cornice | elite | **Ash Rain**, volcano odds Low (→ **Ashy**), Scorched 2 | Condors, phoenixes, hornets, Ashwing Ptarmigan (Darksight) | Ashwing Ptarmigan (Rare) |
| 22-7 | The Steam Wall | elite | Scorching + Hail 2, Scorched 2 | Ur-elk, mammoths, magma titans, ibex | — |
| 22-8 | **The Rimeheart Colossus** | boss | Volcano Low (→ Ashy), Hail 2, Lava Spout 2, boss surge | Colossus, titans, ape king, yetis, the Snow Leopard | **Caldera Snow Leopard (Super Rare)** |

### Map 23: The Goldfeather Siege ⚔️ (`m23`)

| Key | Fight | Kind | Field | Deck idea | Reward |
|---|---|---|---|---|---|
| 23-1 | The Picket Line | skirmish | — | Sellsword cavalry, sappers | — |
| 23-2 | Trench Works | skirmish | — | Badgers, sappers, Testudo Tortoises | Testudo Tortoise (Rare) |
| 23-3 | Elephant Road | skirmish | — | **First War Elephant**, Howdah Archers | — |
| 23-4 | Siege Camp | skirmish | — | Trebuchets, rams, a siege rhino | Trebuchet Crew (Rare) |
| 23-5 | Under the Walls | skirmish | **Arrow Slits** | Archers vs your shields | — |
| 23-6 | The Elephant Line | elite | Arrow Slits | Two War Elephants, Howdah Archers, cataphracts | Howdah Archers (Rare) |
| 23-7 | The Barbican | elite | Arrow Slits 3 | The **Great Gate**, Goose Sentries, Herons (a taste of Map 24) | — |
| 23-8 | **Marshal Tuskwell** | boss | Arrow Slits | The Marshal, War Elephants, Howdahs, trebuchets | **War Elephant (Super Rare)** |

### Map 24: Goldfeather Keep 🏰 (`m24`)

| Key | Fight | Kind | Field | Deck idea | Reward |
|---|---|---|---|---|---|
| 24-1 | **Breach the Gate** | skirmish | Arrow Slits | The **Great Gate** (0/45, Armor 3, Guardian) and its geese | — |
| 24-2 | The Bailey | skirmish | — | Halberdiers, geese, the duck garrison | Goose Sentry (Rare) |
| 24-3 | The Counting House | skirmish | — | Tax-Collector Teals, magpies, the Rodent King | Tax-Collector Teal (Uncommon) |
| 24-4 | The Courtyard Fountain | skirmish | — | A Swan Knight with paddlers and herons | — |
| 24-5 | The Battlements | skirmish | Arrow Slits 2 | Battlement Herons, archers | Battlement Heron (Rare) |
| 24-6 | The Gilded Guard | elite | — | Swan Knights, geese, halberdiers, the Iron Warden | Mallard Halberdier (Rare) |
| 24-7 | The Treasury | elite | — | Teals, magpies, kings and their gold | — |
| 24-8 | **The Magnate Duck** | boss | Arrow Slits 2 | The Magnate and his guards | **Gilded Swan Knight (Super Rare)** |

**Layout.** Every fight has a hand-placed `fixedPos`:
- **Map 22** climbs around the crater rim and leaves the middle free for the Long Burrow's entrance.
- **Map 23** runs left to right towards the wall.
- **Map 24** starts at the gate on the left, crosses the courtyard and ends at the keep, top right.

**Card-reward rank.** It is A from Map 21, as before.

## 7. The new cards (no art yet)

Stats are at Level 1 on the stat budget v2 (Max(A×H + Skills, 2A + H + Skills), ×1.5 per half-miss skill, ≤ N).

| Card | Rarity | A/H | Cost/Wait | Skills | Budget | Where |
|---|---|---|---|---|---|---|
| 🦎 Rimefire Salamander | Rare | 3/8 | 1/1 | Fire Arrow 1, Ice Arrow 1; resists cold and heat | 26 ≤ 29.4 | 22-2 reward |
| 🐐 Fumarole Ibex | Rare | 3/8 | 1/1 | Mountain Climber, Dry, Pounce 2 | 28 ≤ 29.4 | 22-4 reward |
| 🐦 Ashwing Ptarmigan | Rare | 3/5 | 1/0 | Flying, Darksight | 24 ≤ 24.4 | 22-6 reward |
| 🐆 Caldera Snow Leopard | Super Rare | 4/8 | 2/1 | Mountain Climber, Pounce 3, Bleed 1; resists cold | 36 ≤ 37.4 | 22-8 reward |
| 🗿 Rimeheart Colossus | Epic | 8/40 | 3/3 | Immolation 1, Freeze 30%, Armor 2, Frostbite 1 | boss | 22-8 boss (enemy only) |
| 🐘 **War Elephant** | Super Rare | 2/22 | 3/3 | Armor 2, **Arrow 2, Arrow 2**; Structure | 50 ≤ 51.6 | 23-8 reward |
| 🐒 Howdah Archers | Rare | 3/7 | 1/1 | Arrow 2, Quick | 25 ≤ 29.6 | 23-6 reward |
| 🐢 Testudo Tortoise | Rare | 2/14 | 2/2 | Armor 3, Guardian, Helmet | 34 ≤ 38.6 | 23-2 reward |
| 🦫 Trebuchet Crew | Rare | 0/24 | 2/3 | Volley 2, Demolisher 2; Structure | 28 ≤ 43.6 | 23-4 reward |
| 🐘 Marshal Tuskwell | Epic | 9/48 | 4/4 | Armor 3, Stampede, Inspiring 2, Arrow 3 | boss | 23-8 boss (enemy only) |
| 🚪 Great Gate | Common | 0/45 | 2/0 | Armor 3, Guardian; Structure | gate | 23-7, 24-1 (enemy only) |
| 🪿 Goose Sentry | Rare | 2/12 | 1/1 | Guardian, Taunt (+ Sentry later) | 26 ≤ 29.8 | 24-2 reward |
| 🦆 Mallard Halberdier | Rare | 3/8 | 1/1 | Reach, Pierce 2 | 27 ≤ 29.8 | 24-6 reward |
| 🦆 Tax-Collector Teal | Uncommon | 2/5 | 0/0 | Flying, Swipe 1 | 16.5 ≤ 18.8 | 24-3 reward |
| 🐦 Battlement Heron | Rare | 3/7 | 1/1 | Arrow 2, Reach (+ Sentry later) | 24 ≤ 29.8 | 24-5 reward |
| 🦢 Gilded Swan Knight | Super Rare | 3/12 | 2/2 | Armor 2, Bounty 2, Inspiring 1 | 39 ≤ 42.8 | 24-8 reward |
| 🦆 **The Magnate Duck** | Legendary | 6/60 | 4/4 | Armor 3, Midas 3, Bounty 3, Swipe 2, Shield Call, Inspiring 2; King (+ Hoard later) | boss | 24-8 boss (enemy only) |

**Rewards and the rarity economy.** Each map pays 3–4 Rares (one Uncommon on Map 24) and exactly one Super Rare, which comes from the boss. The boss cards, the Great Gate and the gate fight are enemy-only for now. That means they have no source and the game shows them as "not obtainable yet", like the other boss cards.

**Where the other agent's new skills should go on these maps:**

| Skill | Card(s) |
|---|---|
| **Vanguard** | War Elephant, Marshal Tuskwell, Testudo Tortoise |
| **Sentry** | Goose Sentry, Battlement Heron |
| **Hoard** | The Magnate Duck, Tax-Collector Teal |
| **Reflect** (rework) | Gilded Swan Knight's polished plate |
| **Bloodlust / Ambush** (rework) | Caldera Snow Leopard, which hunts from the steam |
| **Carrion** | Map 27; on these maps, the Eye of the Volcano's undead |
| **Web** | Map 25; 7-A-3 and 18-3 today |
