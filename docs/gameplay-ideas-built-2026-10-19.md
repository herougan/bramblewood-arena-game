# Gameplay ideas: what was built (2026-10-19, package GI)

You asked (00:19): "continue with action items, and considering our gameplay-ideas … After running through the ideas, create what you want to create". This is what came out of `gameplay-ideas-2026-10-19.md` and its sheet.

- **Built:** 9 skills (one of them gives a new status, Brittle) and 3 field effects. The rules live in `bramblewood-engine.js` (the Package GI block) and the CPU knows about them.
- **In the game:** each has a short card line and a Codex entry, all through TX keys in the 12 packs.
- **Where they are:** on nothing live yet. 10 example **POOL** cards show them (`pool: true`, `poolMap` set). Placing the skills on cards and the fields on maps is for the placement / balance phase.
- **Tests:** `tests/gi-2026-10-19.js` (435 checks).

## Skills

| Skill | Rule | Cost S (trigger × action) | Codex chapter |
|---|---|---|---|
| 🐆 **Hunter N** (picker) | Its hits and shots deal N more to units with the picked status: Poisoned (default), Bleeding, Wet or Exposed. Shatter stays the Frozen case. Exposed is read before the hit uses its counter. | keyword, half, 1 (N=1: 1, N=2–3: 2); `hunterVs` 0 | Skills |
| 🪦 **Executioner N** | Its hits and shots deal N more to units below half Health (exactly half doesn't count). | keyword, half, 1 | Skills |
| 🎆 **Detonate** | Its hit or shot deals the target's Poison as extra damage (1 for 1), then that Poison is gone. Poison ticks at the start of the round first. | fixed 1 (On Attack 3 × the Poison cashed in, less the ticks it removes) | Skills |
| 🧫 **Proliferate N** | From round 2, at the start of each round, up to N Poisoned enemies (random) each pass 1 Poison to a random unit beside them. The carrier keeps its own Poison, and poison-proof units never catch it. | n, 2 per N (On Round Start 4 × Poison 1, but only when a Poisoned enemy has a neighbour) | Skills |
| 🫙 **Brittle N** → status **Brittle** | Its hits make the target Brittle for N rounds. A Brittle unit counts as Frozen for **Shatter only**: it still acts. It wears off like Webbed. | half, 0.5 (little use without Shatter) | Skills + Statuses |
| 📯 **Kin Rally N** | On Ally Played (Kin): **that ally** (the played card itself) gets +N/+N. | shorthand: On Ally Played 2.5 × Buff (1 + 0.5) × N = **3.75** at N=1 | Skills |
| 📣 **Pack Howl N** | On Ally Played (Wolf): Bleed N on the enemy facing the new Wolf. | shorthand: On Ally Played 2.5 × Bleed 1 × N = **2.5** at N=1 | Skills |
| 🧿 **Prayer Ward N** | Armor N while the unit holds Prayer tokens. A 🧿 badge shows while the ward is up. Its icon is the Nazar (your 21:26 note), never 🪬. | n, 0.75 per N | Skills |
| 🧹 **Field Breaker N** | When it arrives, the field's round-start effects stop for the next N rounds, for both sides. | half, 1 (On Play 1 × the rounds stopped) | Skills |

Kin Rally and Pack Howl are ordinary **On Ally Played triggers**, built from the keyword (`trigsOf` in the engine). So the trigger rules apply to them:

- they are off while the unit is Waiting, Stunned, Frozen or Asleep;
- Confused fumbles them;
- the 5-layer cap holds;
- only a card played from hand counts (a token is On Ally Spawn);
- the trigger rune shows.

**Your question 7** ("can a trigger target the played card?") is answered **yes**. A trigger now has a subject: the ally played, or the unit that died, was healed, got Ready or moved.

- `sub:'subject'` targets the subject itself.
- `sub:'subjectFacing'` targets the unit facing the subject.
- `filterKin` keeps only a subject that is the acting unit's Kin.

Any trigger can use these in data. The card editor doesn't offer them yet; the keywords cover today's cards.

## Field effects

| Field | Rule | For |
|---|---|---|
| 🍄 **Spore Cloud** | From round 2, one random unit a side falls Asleep for the round. It is Sleep 1, so the Sleep cap (N+1) holds it at 2, and a hit wakes it. Poison-proof units breathe nothing in. | The Morel Hollow (7) elites / boss |
| 🌩️ **Thunderstorm N** (2) | From round 2, lightning (shock) strikes one random unit a side for N. Each Wet counter adds 1; shock Resist halves it. | Coral Current (10) elites / boss, 10-A |
| 🪢 **Tangled Roots** | From round 2, roots grab one random unit a side: Webbed for the round (no dodge, can't move or be moved). Flyers and Structures are above the roots. | Kelp Mangroves (9) elites; it counters Wave |

All three are in the Edit skirmish list, the Effects library and the Map Codex's Field effects chapter (once a map has them), with log lines and looks.

**Field Breaker's scope (Claude's call).** For N rounds these are skipped:

- every Field effects 2 and 3 tick: the hazards, the Leylines' gifts and burn, Haunted, Mirage, Wave, Consternation and the three new fields;
- Swamp Fever;
- the Tide-spout;
- the volcano's eruptions, comets and lava.

These carry on:

- day and night, the Tide, Darkness and wind;
- the always-on rules (Sandstorm misses, Ashy, Slippery …);
- a played field card.

Each skipped round logs "The field is quiet this round." Two breaks don't add up: the later end wins.

## The CPU

- **Slot choice, all three levels** (`aiBonusVs`): the CPU counts its own Hunter, Executioner and Detonate bonus, and Shatter on a Brittle unit. A slot facing a unit it can now finish counts as a kill.
- **Card choice, smart and smartest** (`aiGiWorth`). A card is worth more when:
  - it has Kin Rally or Pack Howl and its tribe is in hand, or a ready Rally / Howl unit is on the field;
  - it has Proliferate and Poisoned foes are on the board;
  - it is a Prayer unit with Prayer Ward;
  - it has Hunter, Executioner or Detonate and marked foes are there;
  - it has Field Breaker and a hazard is up (worth less on a quiet field);
  - it resists the new fields: poison-proof under Spore Cloud, shock Resist under Thunderstorm, Flying under Tangled Roots.
- **Existing fights:** no live card or map has any of this, so the CPU's play there is unchanged. Its Shatter-on-Frozen play is left as it was on purpose, because the skirmish retune is running at the same time.

## Example POOL cards

| Card | Stats | Skills | poolMap | Budget v3 (2A+H+S / N) |
|---|---|---|---|---|
| Fen Mink 🦦 (Uncommon, Swamp) | 5/12, Wait 1 | Hunter 2 (Poisoned) | Gatorback Swamp (`mw`) | 24 / 30.5 |
| Tidepool Trapper Crab 🦀 (Common, Coastal) | 3/9, Wait 0 | Hunter 1 (Wet), Crab Claws | Pebble Beach (`mb`) | 16 / 23 |
| Grave-Grin Hyena (Uncommon, Savanna) | 5/13, Wait 1 | Executioner 2 | Savanna Reaches (`m5`) | 25 / 30.5 |
| Bogfire Newt (Uncommon, Newt/Swamp) | 4/13, Wait 1 | Poison 1, Detonate | Sable Swampmire (`m8`) | 23 / 30.5 |
| Plague Gnat Cloud 🦟 (Common, Insect/Swamp) | 3/12, Wait 1 | Proliferate 1 | Gatorback Swamp (`mw`) | 20 / 29.5 |
| Glasswing Moth 🦋 (Common, Insect/Desert) | 3/9, Wait 0 | Brittle 2 | The Glass Dunes (`md`) | 16 / 23 |
| Rivergate Drummer 🦦 (Uncommon, Otter/River) | 3/13, Wait 1 | Kin Rally 1 | Thistlewood (`mf`) | 22.75 / 30.5 |
| Frostmoon Howler 🐺 (Rare, Wolf/Tundra) | 4/13, Wait 1 | Pack Howl 1 | Wolfsbane Tundra (`m6`) | 23.5 / 31.5 |
| Chapel Tortoise 🐢 (Uncommon, Ecclesia/Turtle) | 2/18, Wait 1 | Prayer 1, Prayer Ward 1 | The Quiet Summit (`m21`) | 23.75 / 30.5 |
| Weathervane Swift 🐦 (Rare, Bird) | 5/14, Wait 1, 1 Lumber | Field Breaker 2 | The Rimefire Caldera (`m22`) | 26 / 35.9 |

- **Inside budget:** every card passes both budget v3 scores at 70–82% of N.
- **Not measured yet:** none of them has been played in fights; the balance phase does that.
- **Numbers and translations:** numericIds are 9501–9510. Names and flavour are in the 12 packs.
- **Kept out of the game:** the build, the test harness and the deck tools leave pool cards out (the same filter as package AN's pool), so the card matrix and golden results don't change.

## Notes for the placement phase (data only, no engine work)

| Idea | How | Where |
|---|---|---|
| Crab Trap | Hunter 1 (Wet) on a Crab Claws card (not a change to Crab Claws). Tidepool Trapper Crab shows it | Pebble Beach (2), Kelp Mangroves (9) |
| Rain Conductor | Rainmaker Frog + Storm Heron / Voltaic Eel; and the new Thunderstorm on Wet maps | Coral Current (10), The Canopy (14-A) |
| Shatter the Arrivals | Walrus Icebreaker (Shatter) under Freezing | Wolfsbane Tundra (17) |
| Glass job for Shatter | Glasswing Moth (Brittle 2) with an Obsidian / Shatter card, near the Glass-storm | Glass Dunes (18) |
| Wave into the Web | Gallery Orb-Weaver with Tide Pool Crab / Moray Ambusher; Tangled Roots does the same on the field | Kelp Mangroves (9), 2-B |
| Swamp Poison kit | Fen Mink (Hunter), Plague Gnat Cloud (Proliferate), Bogfire Newt (Detonate) with Swamp Fever | Gatorback Swamp (5), Sable Swampmire (6) |
| Wolf identity | Pack Howl on Alpha Howler / Wolf Pack Runner / Pack Wolf Reaver, Executioner on Ice-Crevasse Wolf | Wolfsbane Tundra (17), Maps 14–17 |
| Tribe rewards | Kin Rally on Rivergate Tribune (Otters), Duckling Squadron / Mallard Marauder (Ducks), Cobalt Fledgling (Hummingbirds) | Otter maps, Goldfeather (23–24) |
| Prayer Bastion | Chapel Tortoise (Prayer + Prayer Ward) beside Hymn Wren / Cathedral Eagle (Worship) | Quiet Summit (21), Sundered Peak (20) shrines |
| Bramble Bait, Guardian Relic, Herding into the Ambush, Many Hits on the Marked, Feverish Leech, Timber Baron, Self-harm to Rage | As the Synergies sheet says: they combine skills that already exist | See the sheet |
| Field Breaker | A late-game reward on the heavy field maps | Rimefire Caldera (22), Sundered Peak (20) elites |
| Fields | Spore Cloud on the Morel Hollow's elites / boss; Thunderstorm on Coral Current's; Tangled Roots on the Kelp Mangroves' elites. Keep your two-fields-a-fight rule in mind | Maps 7, 10, 9 |

## Not built

| Idea | Why |
|---|---|
| Isolation, Rescue Chain, Death Spiral, feel-bad curses, metal fields | Rejected in the ideas doc (fights Lone Wolf, loop risk) |
| Contagion (any status) | Folded into Proliferate (Poison only) |
| Duck Squadron, Wetland Bloom, Biome Bloom | Already data: Swarm with a type and Bloom When cover them |
| Bolt Master, Brood Mother, Vigil Keeper, Night Pack, Lamplighter, Storm Herald | Good later (B/C). Each needs its own engine piece; kept out to keep this set small |
| Hallowed Ground, Blood in the Water, Pollen Drift | Small fields for one fight each; better built with their map |

## Open questions for you

1. **Detonate math.** It cashes in Poison 1 for 1. Because Poison fades by 1 a round, Poison 3 left alone deals 3 + 2 + 1 = 6, so Detonate trades damage for speed. Keep it 1 for 1? Or ×2, or "Detonate N: + N more"?
2. **Field Breaker's scope.** Is my list right (everything that ticks each round; day and night, the Tide and Darkness stay)? Or should it be weather only (Hail, Ash Rain, Thunderstorm, Spore Cloud …)?
3. **Kin Rally's cost.** It is 3.75 at N=1, because the Kin filter isn't discounted (the same as `filterArchetype` triggers). Should filtered On Ally Played triggers cost less?
