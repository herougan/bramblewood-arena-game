# Field effects, map gaps, hidden skirmishes and voice lines (2026-10-15)

Three asks from the evening list:

- **#23** *"Propose field effects for each map, up till Map 22. It is not a MUST. But if not, the cards have to be interesting. Like how some cards illuminate in the darkness. Swamp can give swamp fever - all cards have a 50% to gain 1 poison."*
- **#56** *"What map theme do we not have enough of? If it's reallllly needed, feel free to add a submap. You can also add HIDDEN skirmishes (max 5 across Map 1-20). Idk how they will be revealed."*
- **#15** *"Character voice lines,"* (the message stopped there).

**What is built:**
- Four new field effects (Swamp Fever, Freezing, Sandstorm, River Rapids) and a Scorching II entry. They are in the engine, the Edit skirmish field-effect list and the Effects library, with tests. **No map carries them yet.** Assigning them is your call, and the table below is only a proposal.
- Five hidden skirmishes on Maps 4, 8, 10, 14 and 17, each with its own way of being revealed.

**What is only proposed:** the per-map assignments, a submap (my answer is no), and voice lines.

Map numbers follow the game (`mapNumberOf`): Map 0 is the Outskirts. Side maps are listed under their parent map.

## 1. The new field effects (built)

These are all `rules` flags, so they stack with a field (Frigid, Scorching, Rain, Fog, Full Moon) and with each other.

| Effect | Editor id | Rule (one line) | Engine | Notes |
|---|---|---|---|---|
| 🤢 **Swamp Fever** | `swampfever` (`rules.swampFever:50`) | From round 2, each unit on both sides has a 1 in 2 chance every round to gain 1 Poison. Structures and poison-immune units never catch it. | `swampFeverTick` | A number sets the chance in %. `true` = 50. It shows the poison cloud and a log line. |
| 🧊 **Freezing** | `freezing` (`rules.freezing`) | Every unit arrives frozen (one freeze counter: +1 on its clock). Units that resist cold are spared. | `applyOnSpawnEffects` | The harsher sibling of Frigid. Frigid chills random units each round; Freezing chills every arrival once. |
| 🏜️ **Sandstorm** | `sandstorm` (`rules.sandstorm`) | Attacks at units miss 1 in 4, except from Dry units. | `combatHitLands` | It gives Dry a real job on the Glass Dunes. Keen Sense smells through it. The miss shows 🏜️. |
| 🌊 **River Rapids** | `rapids` (`rules.permaTide + rapids`) | Always Flood: the Tide is in all match, and nothing can turn it. | `permaTide` | This is today's Perma-tide under the field-effect name you used. The Environment card says "River Rapids". |
| 🔥 **Scorching II** | `scorching2` (`field:'heatwave', heatLevel:2`) | Each round, 3 random units on each side take 2 fire damage. Heat-resistant units are spared. | existing heatwave levels | **Scorching already existed** (field `heatwave`, levels 1–3). This entry only exposes level 2 in the editor. |

Where to find them:
- **Edit skirmish → field effects:** all five entries.
- **The Environment card on the board:** a row for each one (`fieldConditionRows`).
- **🔬 Effects library → Fields:** River Rapids, Swamp Fever (with a Structure beside the Specimen), Freezing, Sandstorm (with a Dry ally) and Scorching II.
- **Tests:** `tests/keywords-2026-10-15r.js`.

## 2. Field effects per map (proposal)

**Today** lists what the map already does. The data for this comes from `fightRules`, `MISTY_MAPS`, `TIDESPOUT_MAPS`, `PERMATIDE_MAPS`, `WINDY_MAPS`, `DARK_MAPS`, `VOLCANO_MAPS`, `MAP_DAYNIGHT` and the node rules.

**Proposed** says what I would add. "None" means the map stays clear, and the column says which cards carry it instead.

| Map | Map name | Today | Proposed | Rule, or why none |
|---|---|---|---|---|
| 0 | Bramblewood Outskirts | Mist (no day/night) | keep Mist | It teaches nothing, so it is just weather. |
| 0-T | Tutorial | day only | none | The tutorial teaches the basics only. |
| 0-B | The Old Bramble | Mist | none | The exam map. Its interest is Counterattack on the Thornwood Palisade and the Ent boss. |
| 1 | Thistlewood | day/night | none, or Spring Rain on one variation fight | Swarm bees, burrowers and Regen worms carry it. Rain helps the Regen side, which is a good "variation fight" knob. |
| 1-A | Clovermead | day/night | Spring Rain (existing) | A meadow in the rain. Bloom and Regen cards shine here. |
| 2 | Pebble Beach | Tide-spout | keep | The spout already teaches the Tide. |
| 2-A | Lilypad Reach | Perma-tide | rename to River Rapids? **No.** Keep it calm: drop Perma-tide for the normal Tide. | A still pond is the wrong place for rapids. Tide cards plus a Moonpull carry it. |
| 2-B | Smugglers' Grotto | Pitch Black | keep | **The cards that make it interesting:** Illuminate. The smugglers' Lantern Bearers light their side, and Darksight crabs see anyway. |
| 3 | Gannet Cliffs | Windy | keep | Flyers and wind. |
| 4 | Sunken Hollow | Perma-tide | **River Rapids** (the same rule, under its new name) | The beavers flooded it, so the river runs fast. It is always Flood. |
| 5 | Gatorback Swamp | day/night | **Swamp Fever** | Your example. Poison is the map's skill (vipers, leeches), and the fever makes Cleanse and Renewal worth carrying. |
| 5-A | The Sunken Grove | day/night | Swamp Fever (`swampFever:25`) | A milder fever in the drowned wood. |
| 6 | Sable Swampmire | always night | keep the night, plus Swamp Fever on the elites only | The night is its identity. The fever on the elites makes Fester and Remember bite. |
| 6-MM | Murgle Mayhem | — | none | Endless floors. The escalation is the feature. |
| 7 | The Morel Hollow | day/night | none | Sleep spores and Decay beetles are the hazard. The cards are the weather here. |
| 7-A | The Mycelium Deep | Darkness | keep | |
| 8 | Caves & Alcoves | Darkness | Darkness in skirmishes, Pitch Black in the elite and boss | It escalates the way the frost does. Electric bats and Keen Sense moles shine. |
| 8-A | The Glimmer Depths | no day/night | none | "The walls start to shine": it is the one cave that is *not* dark, a breather. The Lantern Spark-flies live here. |
| 9 | The Kelp Mangroves | day/night (High Tide in elites) | High Tide (existing), plus Mist in one variation | Mudskippers (Quick) and eels (Reload) carry it. |
| 10 | Coral Current | day/night (High Tide in elites) | keep | The sharks' Crit and the jellies are enough. |
| 10-A | The Sunken Depths | Darkness, night, First Blood, High Tide | keep | It already stacks four effects. |
| 11 | Eyrie Heights | Gale | keep | |
| 11-A | The Aerie Vault | Gale | keep | |
| 12 | The Briar Maze | day/night | none | Keen Eye, Changeling and Twin Strike make "a maze that lies". A field would only muddy it. |
| 13 | The Redwood Deep | day/night | none | Rage boars and Cleave bears carry it. |
| 14 | Savanna Reaches | First Blood | First Blood, plus Scorching I on the elites | It is hot in the open grass. Dry units start to matter here before the dunes. |
| 14-A | The Canopy | day/night | Spring Rain (existing) | The rainforest roof. Rainrunner frogs are unblockable in the rain. |
| 15 | The Long Grass | day/night | none | Stealth stoats and Backstab in tall grass. |
| 16 | The Pinewood Taiga | always night | keep the night, plus Frigid I on the boss | The edge of the snow. Pack wolves at night. |
| 17 | Wolfsbane Tundra | frost tuning in the node rules | **Freezing** on the elites and boss, plus the existing Frigid tuning | Every unit arrives frozen, so Frostbite and Freeze units, and anything that resists cold, get their moment. |
| 17-A | The Ice Hollow | no day/night | Freezing | A cave of blue ice. |
| 18 | The Glass Dunes | Windy | **Sandstorm**, plus Scorching II on the boss | Dry and Swift (being retooled) are the map's skills. Sandstorm makes Dry matter. |
| 19 | Ashen Spurn | Windy | Scorched Ground 2 on the elites (existing) | Fire Arrow and Frenzy. |
| 19-A | Basalt Foundry | day/night | Scorching II | A furnace. |
| 20 | The Sundered Peak | Windy, Volcano | keep | |
| 20-A | Eye of the Volcano | Volcano | keep | |
| 20-B | Volcano Lair | Volcano, no day/night | keep | |
| 21 | The Quiet Summit | day/night | none | "The storm has passed". The calm is the point: no wind after a run of windy maps. Worship and Prayer carry it. |
| 22 | (reserved) | — | when charted: Absolute darkness if it becomes the Abyssal Plains | Darksight and Illuminate units are the only way to fight there. |

**Cards that make a field-less map interesting**, beyond the ones in the table:
- **Illuminate:** Lantern Bearer, Otter Lantern Bearer and Lantern Spark-fly now light their whole side in any darkness, Absolute included.
- **Leaders and Light Aura units:** they glow at night and in the dark. Light Aura means Illuminate, or Immolation's fire.
- **Darksight:** sees in the dark.
- **Rainrunner and Rainmaker:** rain.
- **Moonborn and Full Moon:** the moon.
- **Dry:** Sandstorm and Scorching.
- **Frostbite and cold Resist:** Frigid and Freezing.

## 3. Which themes are thin (#56)

From `docs/card-placement-proposal-2026-10-15.md` (biome supply vs need) and the map list:

| Theme | Maps today | Cards | Verdict |
|---|---|---|---|
| Shore and cliffs (sea birds) | Gannet Cliffs | −11 short. No Gannet, Puffin or Peregrine. | **Thinnest**, but it is a card gap, not a map gap. |
| Mountain | Eyrie Heights, Aerie Vault, Quiet Summit | −3. Nothing carries Volley or Twin Shot. No young. | Thin cards. |
| Savanna | Savanna Reaches | 10 cards for an 8-fight map. No lions or wild dogs below boss level. | Thin cards. |
| Rainforest | The Canopy (side map only) | +10 spare | **Under-mapped:** the cards exist but there is no main map. |
| Desert | The Glass Dunes | enough | Fine. |
| Volcanic | Ashen Spurn, Foundry, Peak, Eye, Lair | exactly enough (with the devils parked) | Fine. |
| Woodland, undergrowth, freshwater, farm, sea | many | surplus (+17 to +41) | Over-supplied. |

**Should we add a submap? Not now.** The thinnest themes are short of *cards*, not maps. A cliff submap would need the six new sea and mountain birds first. The rainforest has spare cards but already has The Canopy.

Instead, give the rainforest a **main map in the 22–40 range**. Map 22 (still "Reserved") could be the rainforest floor, below The Canopy's roof. I built nothing for this.

## 4. Hidden skirmishes (#56, built)

A hidden skirmish is not on the map at all until something reveals it.

- **The first time it appears,** it pops in with a gold burst and a toast ("✦ A hidden skirmish: …").
- **On the map** it wears a gold ring and a ✦ badge.
- **It is optional.** It never blocks the next map or "map cleared".
- **Admin mode shows all five.** They can be moved or retuned in Edit skirmish like any fight.

Code: `HIDDEN_SKIRMISHES` and `refreshHiddenSkirmishes()` in `arena_app.js`. Saved state lives in `bramblewood_hidden_skirmishes_v1`.

| Code | Map | Name | How it is revealed | The fight |
|---|---|---|---|---|
| 4-H | Sunken Hollow | 🏮 The Lamplighter's Return | **Curiosity:** look at the lit lantern on the map ("Somebody's coming home"). | Elite, at night. Otter Lantern Bearers (Illuminate), beavers, trout, hermit crabs and a humpback. |
| 8-H | Caves & Alcoves | ✨ The Spark-fly Hollow | **Curiosity:** look at the glowworm pool. | Elite, in Pitch Black. Lantern Spark-flies light their side. It is a showcase for Illuminate against your Darksight. |
| 10-H | Coral Current | ⚓ The Wreck's Hold | **Map cleared:** every regular fight on Coral Current. | Elite. Morays, reef sharks, riptide eels and a turtle elder. |
| 14-H | Savanna Reaches | 🥁 Drums at Midnight | **Night only:** at night on *your* clock (8 pm to 6 am), once 14-1 is cleared. It hides by day until you beat it. | Elite, at night, First Blood. Hyenas, jaguars, mandrills and howlers. |
| 17-H | Wolfsbane Tundra | 🧊 Under the Ice | **Rank S:** beat the Glacial Ape-King (17-8) with rank S. | Elite, Frigid (2 a side, Frostbite 1). A mammoth, wolverines, crevasse wolves and fox raiders. |

**Other reveal ideas** if you want more variety later. The code takes new `reveal` kinds easily.
- **A dialogue clue:** an NPC line that sets a flag.
- **A full moon:** shown only while the Full Moon is up.
- **A collection:** owning every card of a type.
- **A weather roll:** the 1-in-3 rainy Outskirts fights.

## 5. Voice lines (#15, proposal only)

The card data already has room for this. Every card carries `speeches: {idle, onSpawn, onAttack, onHit, onSkill, onDeath}` with three empty slots each. The game already has a speech bubble (`showSpeechBubble`).

The proposal:

1. **Short text barks first, audio later.**
   - Each bark is at most 6 words, shown as a bubble over the card for about 1.6 s.
   - A bubble never covers numbers: it sits above the card and fades.
   - At most one bubble on the board at a time, and at most one per card per round.
2. **When they fire.**
   - **On play:** about 1 in 3 plays.
   - **On a kill:** the killer speaks, about 1 in 2.
   - **On death:** about 1 in 3.
   - **On a skill trigger:** only for leaders and bosses.
   - **Idle:** only in the Codex or Collection, when you hover a card.
3. **Leaders and bosses always speak** on arrival, on their first kill and on death. That covers the boss intros the maps already have in dialogue form.
4. **Faction voice.**
   - Otters are dry and soldierly ("Shields up. Again.").
   - Hummingbirds are quick and boastful ("Blink and you missed it!").
   - Animals of the wild get sounds as text ("*hiss*", "*honk*"), not words, so they don't feel like people.
5. **Samples to set the tone** (empty slots stay silent, so you can fill cards one at a time in the card editor):
   - Otter Centurion. On play: "First through the gate." On death: "…slid back out."
   - Lantern Bearer. On play: "Mind the dark." On a kill: "Saw that coming."
   - Raccoon Bandit. On play: "Don't mind me." On a kill: "Finders keepers."
   - Glacial Ape-King. On play: "*the ice cracks*" On death: "*a long, cold breath*"
   - Wandering Traveller (leader). On play: "Let's see where this road goes."
6. **Settings:** a "Voice lines: On / Leaders only / Off" toggle next to the Effects level, with Leaders only as the default.
7. **Audio later:** one pitched "babble" sound per species (Animal Crossing style) played under the bubble. That needs no voice actors.
