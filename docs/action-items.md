# Action items

_Updated 2026-10-14, 10:45 am. Your calls and the planned ideas come first. One combined list. You said I can work through these myself, so items in my lane are done or decided; only the ones that need you (money, live database writes, play-testing) are left below._

## 1. Your calls

**Your answers, 2026-10-14 09:00.** Say an ID to reopen one.

| ID | Status |
|---|---|
| D27 | **Confirmed:** Sweep = cleave, Trample = Stampede, Bleed no longer hurts when hit |
| D39 | **Built:** 🍴 Pitchfork hits the 4 nearest enemy units within 2 columns (no Pierce any more). 🔱 Trident hits the 3 nearest enemy units within 1 column (never the castle) |
| D74 | **Confirmed and built:** Ranked Live plays Standard (every card at Level 1); friendly invites keep their own format |
| D75 | Answered in the economy doc: the bundle sizes and the 4.99 USD Bramble Pass stand as first prices; Krooni and Laurels buy cosmetics only |
| D76 | **Confirmed:** a 30-second plan timer (60 in casual rooms), one shared castle, friends-only rooms first. Building it waits on the `coop_rooms` table (parked below) |
| D77 | **Future.** Free-to-play on Steam with a cosmetic-leaning shop, revisit by December. *Can we ship it as an executable?* Yes. The game is one web page, so Electron (or the lighter Tauri) wraps it as a Windows/Mac/Linux app with no rewrite; plenty of Steam games ship this way. Steam overlay and achievements come through a small Steamworks binding (steamworks.js or greenworks). Two things to plan: saves and sign-in still go through Supabase, so it needs internet unless we add an offline mode; and the art and code should be bundled into the app rather than fetched |
| D78 | **Confirmed:** the Camp opens on Map 0, and Maps 0–1 swap in teaching cards |
| D55 | **Parked, explanation kept:** the 3-minute check already reads world events and GM messages, and Admin has a 📣 World call-out composer. The `world_events` table is written up in `supabase/migrations/20261013_world_events.sql` and is **not applied**: it waits for "apply it" |

**Parked, not open items:** D55 (`world_events`), T3 / S1 / S2 and the D76 `coop_rooms` table all write to the live Supabase, so they wait for you to say "apply it".

**Closed earlier:** D21/D22, D29, D30, D31, D33, D36, D37, D46, D52, D58, D59, D60, D61.

## Planned, not built yet (your 08:28 note: "Dont add now")

| Idea | Notes |
|---|---|
| **Electricity** (new skill) | For cave and water cards. Needs its rules: e.g. a shock that chains to the next unit, or stuns. New units to carry it |
| **Keen Sense** (new skill) | For moles: senses non-flying enemies even when blind; unaffected by Blind. A second effect still to come |
| **Hammerhead** (new card) | A shark for the Ocean fodder |
| **A big animal with a sledgehammer** | There isn't one yet. The only Bludgeon card is the Frillneck Duelist (a lizard), and Siege Hammer is equipment. Candidates: a bison, rhino or gorilla smith carrying a sledgehammer, with Bludgeon |
| **Stat budget v2** | N = 10 base; each Wait adds 5 to the budget; a skill that makes attacks miss half the time (or similar) multiplies the card's score by 1.5; max level gives N 20; rarity 10 gives N 30; each map adds 0.2 (Map 40: N 38). Worked example: a 2/5 scores 2×2+5 = 9 → ×1.5 = 13.5, and 2×5 = 10 → ×1.5 = 15 |

## Done at 14:30 (your 11:07 and 11:25 notes)

| Item | What's in the game now |
|---|---|
| Energy | Starts at 20; Camp to 50 (cheap), Forge to 60. About 14 days to Map 20 at two sessions a day if you buy the Camp steps early (26 days if you never do). Details in the late-game note |
| Tide | Swimmers = Tide, float; Moonpull (Moon Jelly); Tide-spout on Pebble Beach |
| Day and night | By map: outdoor maps cycle; caves, undersea and dark places have none; brighter sun, clear moon |
| Irradiation | Tokens that eat Health, Attack or skill values each round; shown in card details |
| Ghost, Shade, Shadow, Supreme | Built; Supreme is on the five hidden dragons only |
| Twin, Growth Sprout | Built; Twin on Puddle Changeling and the new Mirrorhide Mutant |
| Art | Your images placed; Shallows Fry, Vampire Bat and Wandering Mage added (not on maps yet) |
| Later | Wild Veggies, dragons from Map 50, Map 80 own effect, limit breaks every 100 maps, emoji/icon sets: in docs/design-2026-10-14-late-game.md |
| Still to do | Redo Owl Fletcher, Bee Drone and Owl Nightwatch art as real animals with the game-art engine |

## Done at 12:45 (your 10:18 list)

| Item | What's in the game now |
|---|---|
| Volcano | Lava Tide, Petrification and Eruption roll each round at the fight's volcano level (Very low → High); the conditions show the band word |
| Map 20+ skills | Speed, Haste, Rabid, Cower, Ghost + Magic damage, Ichor, Irradiated, with tests. Rabid Jackal (2/3) added, no art or map yet |
| Names | docs/name-picker-2026-10-14.xlsx: tick ✓ to choose 15 Base, 15 Otters, 15 Hummingbirds and 6 per biome. Bog Leech already exists (2/5, Bleed 1); Vampire Bat (3 Attack, Leech 3) is proposed |
| Boomerang | Checked against your rules: it throws on its swing, comes back at the start of the next combat for a second hit (fast, before the main order), its owner doesn't swing that round, it never misses flyers, and an empty lane on the way back is a whiff. Tests cover each |
| Resources | Noted: Lumber, Stone and Metal are World 1 (T1–T3); Uranium belongs to World 3 (T7–T9). Irradiated cards don't make Uranium |

## Done at 10:45 (your 09:00 list)

| Item | What's in the game now |
|---|---|
| Leader tutorial | The first time you open the 👑 leader picker, the traveller says only Heroic and above can lead. Your first Heroic card brings the lesson back: "this one can be your leader", and the card itself speaks. If you never saw the first note, its line comes first |
| D39 | Pitchfork and Trident reworked (above) |
| Dialogues | 💬 Dialogues tab in the hub and docs/dialogues-2026-10-14.xlsx: all 63 conversations, who says each line and where it plays. An "Add your own" sheet; any card's name works as a speaker and shows that card's art |
| VFX | Castles crack with random-walk "miners" as they lose Health and crumble cell by cell (a cellular automaton) when destroyed. "Cards of old" finish: aged paper, foxing, creases. New Effects Lab tab, Procedural FX: shatter, Flip riffle shuffle, lantern light, a scrubbable forge timeline, a ripple wave |
| Foils | The eight Lab foils and Cards of old are in the game and drop from packs as rare prints (each about 2–3% of foils); the Forge and the Nest play a level-up burst |
| Effects in play | Frozen units shatter into ice shards; pack hauls ripple when laid out |

## Done at 23:30 (your 20:55, 21:36 and 22:05 lists)

| Item | What's in the game now |
|---|---|
| Tutorial | The tutorials are skirmishes T-0 and T-1 (no "!"); part 1 unlocks "Tutorial Part 2", part 2 "Conquest Map" and has one Claim Rewards button; "This is the enemy Castle" holds the round; the leader's Wait is taught with a pause and a pointer; Initiative waits a turn; all tutorial words shortened |
| Maps | First visit to any map: zoom out, then the skirmishes drop in. Interactibles have no circles. Open-air side maps exit through the main map's icon; caves have a lamp. Critters and your pawn face the way they walk |
| Lessons | Lumber shown as a picture, a "Needs Lumber" tag on drawn cards, a ghost card dragged to the Graveyard; Maps 0–1 swap in Flying, Swimmer and Diurnal cards; later, better cards are offered as swaps. Armoury on Map 0 |
| Screens | Back buttons on every page off the map; iPad laid out like a computer; skirmish card fits, B beside the lock, New skills strip off; admin buttons beside the card and Clear/Unclear map on the toolbar (clearing pays the cards) |
| Codex | Only cards you've seen (admins: "Show unseen"); no Hidden/Discovered pills; 50 a page; 🎁 Get all per section; seasons 🍂🌸❄️☀️ |
| Admin | Profile: Reset all, Reset Codex, Reset to Map N |
| Fights | Deck thickness, castle crumble, Traveller conversation fixes (no repeats, no stuck see-through panel, fading arrow) |
| Art | Portraits for the 7 road folk and the 14 raid bosses (raid panels and VS screen); The Sunken Ferry map. About 17 NightCafe credits, roughly 218 left |
| Balance | ⚖️ Stat budget in the Test Lab: N = 8 + rarity step + level (Level 0: −2) + 0.1 per map number. Report only; no card has been changed |

## Done at 20:00 (your 17:37 list)

| Item | What's in the game now |
|---|---|
| 1 | No more "Both". The side screen has a third button, 🎲 Random (red Otters, blue Hummingbirds, green Random), and hovering any of them writes one line of lore and one of play at the bottom |
| 2 + 4 | **The ambush.** Your first Fight on 3-2 (Gannet Cliffs) is interrupted: a scout of the other side hops in and shoves your pawn aside, an Ambush skirmish bounces onto the map, and the fight starts. Winning it pays a **Faction Growth** card (the next card of your side you don't have, lowest rarity first). 3-2 waits until the ambush is beaten |
| 3 | Faction colours: Otters red, Hummingbirds blue, neutral green (side screen, entrance ribbon, faction packs, the ambush) |
| 6 | Battle ratings are live: worked out from the actual deck, each card's rarity weight and the level it fights at (road level or the editor's), plus leaders, scaled to 20 cards. They don't yet count map conditions or your Wildpath bonuses |
| D69 | Closed (okay) |

## Done at 18:00 (your 16:09 note)

| Item | What's in the game now |
|---|---|
| Wildpaths | Hidden until Map 21 is reached (Map 20's last fight won); only maps 21+ give points |
| UI audit | Phone fight layout, art on off-map boards, one card count, tab bar clearance, Tavern note spot, contrast fixes, Forge tabs, twin daily notices, "Test Lab" |

**UI audit, fixed at 19:00:** badges over stats on small cards, the phone fullscreen button, phone toasts, the Shop's duplicate back button and title, the Autobattler's Arena button. **Left as is:** Codex sort on phones lives under Filters (by design); the Shop's "?" marks are undiscovered subfactions (intended mystery).

## Done at 17:15 (your 15:58 list)

| Item | What's in the game now |
|---|---|
| Zeitgebers | In a fight that's day by default, the first Diurnal, Nocturnal or Crepuscular unit played starts the day/night cycle from that round (Day first). Maps with a phase set by the designer keep it. The first Tide unit already starts the tide |
| D80 | A "Next round" strip by the field: nightfall or dawn, the tide's turn, the wind (at your back or in your face) and eruptions |

## Done at 16:30 (your 14:50 list)

| Item | What's in the game now |
|---|---|
| 1 | The side pick flows into the fight: cards arc into your deck, the screen zooms, the battlefield fades in |
| 2 | Part 1's highlighted card glows only from the "drag a card" step |
| 3 | The tutorial's ghost card is the real card's size (it was copying the lifted, scaled-up card) |
| 4 | "Tutorial Complete!" and a single Claim Rewards button. Admin: the rewards are in Admin → 🎓 Tutorial editor ("Part 1 reward" and the part 2 lists) |
| 5 | Map 0 shows only the tutorials until part 2 is won (admins too, unless the layout editor is open), zoomed 25%, with a gold ring pointer; winning part 2 zooms out to the whole map |
| 7 | [Design pushback](design-pushback-2026-10-13.md) |

**Pushback calls:** D79 no, D80 built (the forecast), D81 not now, D82 vetoed.

## Done at 15:30 (your 14:21 list)

| Item | What's in the game now |
|---|---|
| First sign-in | The name field is the centre of the entrance ("What should we call you?"), and a first account sign-in without a chosen name opens a name prompt |
| D67 / D73 | Darkness 1 in 4 (night, Caves & Alcoves), Pitchblack 1 in 2 (Smugglers' Grotto), Absolute darkness 100% (for the Abyssal Plains). Darksight sees through all of it; Nocturnal sees at night; a Lantern lights its side |
| D66 | Frigid: level = units chilled a side, always +1 Wait, cold-weak units also take ice damage. Scorching: level L hits L+1 units a side for L fire damage, double on heat-weak units |
| D72 | New **Molting N** (+1/+2 every N rounds) on three crabs. My reading: Shedding stays for snakes and lizards (+1/+1 and the old skin's statuses fall away) |
| Extra | Dark fights get a vignette over the board, thicker with each level |

**Closed:** D65/D66, D67, D68, D72, D73. D71 is yours (mark the generic cards' Source in the editor).

## Done at 13:15 (continuing)

| Item | What's in the game now |
|---|---|
| Wildpaths | All 21 marks apply in Conquest fights, to your side only |
| Road | Map 20 (and every 20th) ends on a world boss. From Map 50: every 10th map a harder boss with a normal boss before it |
| D54 | Field-kit items come from quests: A notices and above, and finished weekly tiers |

## Done at 12:30 (your 11:40 list)

| Item | What's in the game now |
|---|---|
| D32 Wildpaths | Points cost 5 and 10 for the first rings, then 15, 20 and 25 (the capstone) for the advanced ones. Learn from the detail panel; ranks show on the tree. The bonuses are still a preview |
| Standard PvP | Arena → **Format: Collection / Standard**. Standard has its own deck (🃏 builder over every card), every card at Level 1, no foils, shinies or Materia. It covers Quick Battle, Pass & Play, Gauntlet and friend invites (the invite and banner say Standard). Collection is the normal format |
| Armoury | Moved to Map 1. Every Map 0 win now gives a card, and before the Armoury opens a window on the map offers to swap a deck card out for it |
| Road enders | Map 0 ends on a normal fight, Maps 1–4 on an Elite, every 5th map on a boss, the rest on a miniboss. Card rewards need rank B from Map 5, A from Map 15, S from Map 30 (a 🔒 pill shows the rank) |
| D40 Tavern | 🍺 The Tavern opens on Map 14 and now holds the max-Energy upgrades |
| D45 | Admin Mode → Forge → **✏️ Edit tier prices** (Gold, Dust, Strange Materia, map) publishes to everyone |
| D53 | Every fight's conditions are listed in the skirmish panel (terrain, eruptions, wind, gale, darkness, night, twilight, high tide, frost and its parts, boss surge). In a fight each row shows **?** until it first happens, then **New!** for that fight, then plain text |
| D54 | The daily field-kit refill is gone (the traveller packs one starter fill; more will come from dailies and weeklies). Your first win on Map 2 gives a 🔋 Energy capsule (+20 Energy, used from the Energy panel); it's also a reward token in ✏️ Edit rewards |
| D55 | The 3-minute check now also reads world events and GM messages, and Admin has a 📣 World call-out composer. The `world_events` table is written up in `supabase/migrations/20261013_world_events.sql` and is **not applied**: it waits for "apply it" |
| Archetypes | Swarm and Tide are keyword families, not archetypes: they lost the corner mark. Archetypes are Devilry, Ecclesia, Evolution, Scrappers, Exiled Ones, Forgotten Ones, Ancient Ones, Outer Ones and Void |
| Admin at launch | A `LAUNCH_BUILD` switch hides every admin surface on the live site. Server-side, admin writes are already refused by the `is_app_admin()` row policies, so a packet forwarder can't run them |
| Docs | [Economy and monetization](economy-monetization-2026-10-13.md), [co-op dungeon](coop-dungeon-design-2026-10-13.md), [Steam launch plan](steam-launch-plan-2026-10-13.md) |

**Closed:** D34, D41, D42, D43, D44, D47, D49 (replaced by the co-op dungeon doc), D50, D56, D57, D62, D63, D64.

## Done at 11:30 (your 10:57 list)

| # | What I did |
|---|---|
| 1 | Test Lab → 📊 **Card check**: measures only the cards a player meets up to a map you pick (that map's and earlier rewards, Base cards, your faction's cards), at Level 1, against their rarity band. |
| 1–3 | **Faction Reward** 🎁 and **Faction Growth** 🌱 placeholders in ✏️ Edit rewards. Reward: a random card from your faction pool (5 copies of each Common, 4 Uncommon, 3 Rare, 2 above, min 1), with odds by faction tier (10/20/30/40 collected: at 20 it's 50% Common / 30% Uncommon / 20% Rare). Growth: 1 of each faction card, lowest rarity first. Elites and bosses give 1 Faction Reward + 1 base card unless the fight has placeholders. |
| 4 | Hummingbirds as fencers: Crimson Wing Recruit and Duelist Cadet got Quick, Cobalt Talon Skirmisher Pierce 1, Ruby-throat Duelist Pierce 1 + Evasive. None use Poison. |
| 5 | Danger warnings v2: a card warns until you've **beaten** it (won a fight it was in). The ladder: 2 at Uncommon, 3 at Rare, 4 at Very Rare, 5 at Super Rare… A fight can name its own ⚠️ Danger cards (✏️ Edit rewards); those always warn until beaten. |
| 6 | **Shedding N**: every N rounds +1/+1 and its harmful counters come off (Grass Viper, Adder Ambusher). |
| 7 | **Twilight** in the cycle (D, N, D, N, T) on twilight maps or with a **Crepuscular** card in a deck; Diurnal and Nocturnal both active in Twilight. |
| 8 | Frost → **Frigid**, Heatwave → **Scorching**. Eclipse / Syzygy planned for Map 35+ (roadmap note). |
| 9, 11, 12 | Floodplains, Abyssal Plains (Map 29) and the Map 20–60 road: world-roadmap-2026-10-13. |
| 10 | Blindness only in complete darkness (caves today) unless Darksight or a Lantern; new **Sun-shy** and **Night-blind**. Night alone dims no one now. |
| 13 | The tide waits for the first Tide card. |
| 18 | Sweep is **Cleave** ("hits the unit in front, and the enemy units on its left and right each take N bonus damage"). |
| 19 | **Pitchfork** hits the 4 nearest enemy units, none more than 2 columns away (no longer pierces). |
| 14–17, 20, 21 | B6, D23, D24, D26, D32 closed; the Flea Market moved to Map 31. |

New calls for you:

| ID | What | (a) Pushback | (b) Recommendation |
|---|---|---|---|
| **D70** | **Endless dungeons: Murgle Mayhem (6-MM) is built** on my proposal (opens after Map 6, 50 floors, +4% a floor, a mini-boss every 10th, every floor a checkpoint) | You hadn't picked the placement, so this is my reading; it's easy to move | Play a few floors; then say where the next ones go (my plan: one every 5 maps) |

## Done overnight (your 00:17 list)

| # | What I did |
|---|---|
| 1 | Strength analysis measures every card at Level 1; Base, starter and quest cards (Level 0 at the start) are measured at Level 1 and flagged ("first level is a major +10% step"). Base cards now start at Level 0 in the game too. |
| 2 | Otters and Hummingbirds are out of every pack. Elite and boss first clears give 1 faction-track card + 1 base-track card (Commons → Uncommons → Rares → duplicates; Very/Super Rare from Map 10). Map 20's boss gives your faction's Epic + Heroic; two Heroics made (Rivergate Tribune, Sunspire Sky-Sovereign). |
| 3 | Journeys: five subfaction quests across Maps 15–20 (three end there, two go past). Each step is a real fight and pays 2 cards. On the Notices board; the next fight shows its step. |
| 4 | Phyla filter shows each phylum's emblem. |
| 5 | Arrow / Fire Arrow shoot the nearest enemy (random on ties); "Never misses Flying units" on Arrow, Fire Arrow and Boomerang. |
| 6 | Deep Cave Troll → Cave Bear (new art). |
| 7 | Esprit is a passive. |
| 8 | New evergreen: Landslide N (when it falls: N to the enemy facing it and both its neighbours; Flying is above it). |
| 9 | Codex: one list; unowned greyed, locked 🔒. |
| 10 | Saving a card keeps your scroll position. |
| 11 | Spells shelved everywhere (`SPELLS_SHELVED`). |
| 12–13 | Windy rounds (1 in 2) with Tailwind and Headwind; night dims non-Nocturnal units (1 in 4 misses) unless they have Darksight or a Lantern; Dry. Design note and who-gets-what list: weather-and-time-2026-10-13.md. |
| 15 | Max Energy 50, 1 per 5 minutes. |
| 16 | Auto (Map 20 + rank S), Sweep (Map 30 + an Auto win at S), Auto-Sweep (Map 50), Idle-Sweep (Map 70). |
| 17 | Glass Dunes themed: Dry, Swift and Thorns; new Thorny Devil, Fennec Fox, Meerkat Sentry. |
| 18 | Lone Wolf X/Y and Sociable X/Y (Lone Grey Wolf, Meerkat Sentry). |
| 19 | Coffee N (Buzzed Chipmunk). Your workbook was byte-for-byte the one I exported, so it had no Codex changes in it: send the Codex version and I'll pick up the new skills. |
| 20 | Every NightCafe picture re-pixelated on a 64-pixel grid (chunkier); Mirror Moth, Elder Willow, Conch Herald, Tidewall Fort redrawn; art for the 9 new cards. Daily credits: a check-in is set for 08:20 your time. |

New calls for you:

| ID | What | (a) Pushback | (b) Recommendation |
|---|---|---|---|

## Done at 23:55 (your 23:12 list, all ten)

| ID | What I did |
|---|---|
| 23-1…10 | Lv 0 row in stats by level · source editable in the card editor, maps in First–Fourth seasons · Nature's Force N · every card hidden by default · Heal + Self/Ally/Opponent/Any, distance and target count on every targeted action · 🐜/🐝 swarm mark · no "1" after icons · extended art crops far less, no hard bottom edge · editing no longer revokes your copy · Esprit/Rally on the strip |
| ART-T | Optional: Tidewall Fort's castle art has "HOME BASE" lettering in it; regenerate on request (0.75 credits). |

## Done tonight (21:35–22:50)

| ID | What I did |
|---|---|
| ART | **Every card has art.** PixelLab is at its monthly limit, so I used your NightCafe credits (0.75 each, about 145 images, ~110 credits; 284 left). Each image is shrunk to the game's 128×128 pixel style with its background kept. Owl Sentinel, Ant Hill and Ant Warrior were redone as real animals; four upright ones (Bramblefox, Shieldbearer, Thistle Baron, Parish Sergeant) were redone on all fours. |
| RAID | **Six Goliath cephalopods** (Inkcloud Squid, Abyss Lantern Squid, Glass Octopus, Vampire Squid, Goliath Tentacle, Goliath Broodmother) fill the Goliath's parts, and drop only from the raid: one card when it falls, a second for the top 10%. |
| D20 | Darkness from your own losses now stops at 10. |
| D38 | Closed: whether a card can be earned now comes from its source, not a flag. |
| D48 | Spare castles: a map boss beaten again at rank S gives a spare of that map's castle; drop castles (below) give spares too. |
| D51 | Skull Vulture drops on Map 8's Root Snare. |
| P1/P2 | Closed: one Factions pool; the pack-only cards stay pack-only. |
| BAL | Enemy levels flattened: Lv 2 at Map 5, +1 every 5 maps, Lv 5 at Map 20, boss decks one higher. |
| 22:04 | Your 16 items: map emblems, Sunken Ferry side map, Stamina in Wildpaths, centipede and millipede, node panel, 22 drop castles, editor card details, out-of-cards summons, cosmetic types removed, 🔌 Shock, pack names. |
| 22:25 | Bare shaking map emblems, the pack note on Gatorback Swamp, real battle ratings, X/Y ⚡ MM:SS clocks, castle art (generating). |

## 2. Where things stand

- **Balancing:** the [card list](card-list-2026-10-10.md) has every Maps 1–5 reward and Pack 1, with my proposal (theme Pack 1 as Bramblewood & Village; move 3 overpowered and 18 biome cards out; add 14).
- **VFX:** [where to take GSAP, textures and shaders](vfx-exploration-2026-10-10.md), with live sketches in the 🧪 VFX Playground tab.

- **New tonight:** Caged Fight (Arena → Challenges), red top edges on opponent cards, the victory-shift fix, and the Codex reveal-as-you-go. Hearthstone ideas are in [their own note](inspo-hearthstone-2026-10-10.md).
- **Starter decks:** you're reorganising them. Every Basic is in [the list](starter-decks-2026-10-10.md), with suggestions (shared leader, 2 shared cards, rival cards as map 1–2 rewards).

- **Card balance** (⚖️ Balance tab, [report](card-balance-2026-10-09.md)):
  - every card has a rarity and is measured in simulated matches;
  - two passes moved outliers half-way toward balance: 171 of 294 cards are now in band;
  - still out of band: Rares that are only Rare because the rarity pass was capped at Rare, walls and Lumber makers (a win-rate test can't value them), and the 3+ cost cards.
- **Big cards now come out:**
  - you chose Lumber from cards, not free income (B4);
  - 31 enemy decks with 3+ cost cards now carry their map's Lumber maker (Toucan Courier on the savanna, Coral Polyp Colony on the reef, Beaver Builders on the Tundra…);
  - enemy big cards now get played about half the time they're drawn (before: almost never);
  - players have Beaver Lumberjack (+2 Lumber) and Courier Pigeon (draw 1) from the start.
- **Day and night and fields** ([design note](fields-and-day-night-2026-10-09.md)):
  - Since 2026-10-11, day and night are off unless a fight turns them on (skirmish editor: cycle, night first, always day or night, switch every N rounds). With the cycle on, they alternate, and at dawn both sides draw. Nocturnal cards get their bonus at night, Diurnal cards by day.
  - Five field cards: Blizzard, Heatwave, Spring Rain, Thick Fog and Full Moon. They're free, take no play and draw a card.
  - Each field now has its own look on the board: rain, drifting fog, heat shimmer, moonlight.
- **Difficulty:**
  - every map was retuned for the new rules against a new player's likely deck;
  - bosses keep their namesake card (the Glacial Ape-King fights with its Ape-King);
  - the editor's tuning tools and the [tuning guide](skirmish-tuning-guide.md) are in place.
- **Archetypes:**
  - **Swarm** (ants and bees) is the first.
  - **Tide** (reef and beach) is new tonight. 🌊 Flow and 🐚 Ebb alternate each round: Tide units hit +1 on Flow and take 1 less on Ebb, and Wash pushes the enemy opposite back once. The water fights were retuned for it.
  - **The Exile zone and the Forgotten Ones** (new tonight): cards sent there give Echoes 🕯️; Remember cards come back once you have enough, +1/+1 per Echo. New cards: Echo Keeper, Marsh Wisp, Bog Revenant and The Unremembered.
- **Fixed tonight:** ten fights that were far too hard, including Map 1's boss (~5% → ~43%), the Thistle Baron (~12% → ~32%) and the Condor Sovereign (10-9).
  - **Devilry** (new): Dark Summons ⛧, Darkness ★ from perished units, Devour, Ritual, Pitchfork, Sacrifice, Offering, Beware, Scare and Desecrate, plus ten new cards (Cinder Imp, then the Basalt Foundry rewards).
- **Arena rules** (new): a different rule set every day (always night, always day, night first, Lumber every 3 rounds, Frost, Fog), shown on the Arena tab.
- **Draggable map tiles** are in the layout editor.

## 3. Things only you can do (outside chat)

- **The claude.ai project** is back under its limit (200 KB of 2 MB): I removed the old code copies and the archived handoff. If you want it leaner still, the game-design v30–v40 addenda can go (they're in the repo).
- **Supabase:** leaked-password protection needs the Pro plan (the project is on Free), so it is off. Upgrading is your call.
- **Art (PixelLab):** at its monthly limit; NightCafe covered every card instead. Buying PixelLab credits is your call; nothing is waiting on it.
- **NightCafe:** 284 credits left after tonight's card and castle art.

