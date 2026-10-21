# Rewards and sources pass (package RP, 2026-10-21)

The owner's directions (Oct 21), in short: be strict about what is a skirmish reward (never a pack card) and what is a faction reward;
most Otter and Hummingbird cards are faction rewards, handed out with skirmish progress and some achievements, lowest rarity first
until a critical mass (25, then 15 more, then 10 more), the Rare from Map 14 and the Very Rare much later; only plain cards as rewards
at the start, with Lumber introduced on Map 1; Devilry found on Map 66, Ecclesia on 77, Evomax from 30; side maps late, one unique card
each. This pass changes card **sources** and placement only (never attack, health or effects: package BF5 re-derives every card's stats).

Made with `node tools/rewards_pass_2026_10_21.js plan` (the record `docs/balance/rewards-pass-2026-10-21.json`, every move with its
from / to and obtain map) and `python3 tools/rewards_pass_apply_2026_10_21.py` (applies it; `canonical/cards.json` keeps its format
byte for byte). The faction track is simulated by `node tools/faction_track_sim_2026_10_21.js` (`--tune`, `--side hummingbirds`).
Checked by `tests/rewards-pass-2026-10-21.js`.

## What changed, in counts

**158 cards changed source.**

| Group | Cards | Where they went |
|---|---|---|
| Faction rewards | 6 | 4 Otter cards and 1 Hummingbird that were pack cards or skirmish rewards; the Sunspire Envoy (a Hummingbird) moved from the Otter side to the Hummingbird side |
| Plain rewards on Maps 0-1 | 8 | plain cards onto Maps 0-1's nine fights, and Map 1's Lumber card (Badger Lumberjack, on 1-4 Sapper Hedge) |
| Off Maps 0-1 and off the side maps, to a main map | 71 | the closest main map that fits the card's habitat, usually the side map's own parent |
| To the basic packs | 20 | meadow and woodland cards that have a skill (off Maps 0-1, Clovermead and Lilypad Reach) |
| Base | 1 | Meadow Frog: a starter-deck (basic) card that was also 1-1's reward |
| Devilry, held to Map 66 | 16 | the Basalt Foundry's devils and imps, the Ashen Spurn's Cinder Imp, the Eye of the Volcano's Ashmantle Fiend |
| Ecclesia, held to Map 77 | 15 | Eyrie Heights' chapel birds, the Sundered Peak's and the Quiet Summit's shrine cards, Clovermead's Chapel Sparrow, the Glowworm Cluster (a pack card) |
| Held for a map the road doesn't have | 21 | the Canopy's 15 rainforest animals (Map 25), Mycelium Deep's Ant Hill and Swarm Matriarch (Map 26), Oilbird (Map 29), Glowing Gecko (Map 33), Thistle Baron (Map 21+), MissingNo. (an Easter egg candidate) |

Categories, before → after (all 831 cards):

| Category | Before | After |
|---|---|---|
| Skirmish reward (`{kind:'map', id, node}`) | 454 | 382 |
| Pack card (basic pool 1, Mystery Booster 99) | 130 | 145 |
| Faction reward (`{kind:'pack', tier:11, side}`) | 37 | 42 |
| Base (basic, starter, unlocked, tutorial rewards) | 50 | 51 |
| awaitingSource | 11 | 63 (65 with package SK2b's two new cards, merged after) |
| Raid / Smith / Nest / Quest / Secret / Materia / Easter egg | 7 / 6 / 7 / 1 / 1 / 7 / 9 | unchanged |
| Sourceless on the card pass's documented list (the Dragons, enemy-only bosses, parked Elementals and the like) | 37 | 37 |
| Two at once (overlaps) | 2: Meadow Frog (Base and 1-1's reward), MissingNo. (a map with no fight) | 0 |

**The strict rules now true** (`tests/rewards-pass-2026-10-21.js`):
- A skirmish reward is in no pack pool. The packs only draw from `{kind:'pack'}` cards, and the peoples' bundles (Road-folk, Wild Beasts and the
  rest, used by the hidden Journeys) no longer top themselves up with that people's map rewards (`factionPackPool`).
- A faction reward is in no pack anyone can buy (`BASIC_PACK_POOLS` is `[1]` since 2026-10-13). The Codex said "Any basic pack (Factions
  pool)" for them; it now says "A faction reward: earned through skirmish progress (elites, bosses, every few wins) and some achievements,
  never from packs" (TX `ui.rp-where-faction`, and the Factions section's tip).
- Every Otter and Hummingbird card is a faction reward, except the starter-deck ones (Base), the both-sides tutorial reward (Riverwing
  Envoy), the Nest's otter egg and the Blacksmith's Sunfeather Plume.

## The faction reward track (`FACTION_REWARD_TRACK`)

`arena_app.js`, region `FACTION_REWARD_TRACK:BEGIN` … `:END`, next to the Faction Reward / Faction Growth code. Every number is a
constant there.

**What a faction reward is.** A card of the Factions pool: source `{kind:'pack', tier:11}` (Otter side), `{…, side:'tribes'}`
(Hummingbird side) or `{…, side:'shared'}`. Your faction's cards are your side's plus the shared ones. The pool now holds 42 cards:

- **Otter side** (22): rare Otter Scout, Pike Lancer, River Warden, Optio of the Ford; uncommon Otter Shieldback, Rivergate Drummer, Riverstone Slinger, Net Thrower, Otter Flag Bearer, Otter Lantern Bearer, Riverbed Diver; common Otter Riverguard, Otter Ferryman, Otter Netmender, Shell-Cracker, Rivergate Recruit, Shellwright Apprentice, Helmeted Otter, Otter Angler; epic Marshal of Rivergate; veryrare Royal Guard; heroic Rivergate Tribune
- **Hummingbird side** (14): rare Sunspire Envoy, Ruby-Throat Duelist; common Nectar Vintner, Daily Post, Petal Fletcher, Nectar Sipper, Sunfeather Scout; uncommon Dawn Bellringer, Lantern Bearer, Hush-Wing Spy, Hummingbird Needler, Honeyjoe Brewer; veryrare Sunspire Choirmother; heroic Sunspire Sky-Sovereign
- **Shared** (6): common Ferry Toll-Frog, Riverside Peddler; uncommon Ford Kingfisher, Hedge Changeling; rare Truce Heron; legendary Old Willow of the Ford

**The rarity gates** (`FACTION_RARITY_GATES`). A rarity opens once you have **received** that many faction cards (every copy counts,
duplicates included) **and** reached that map:

| Rarity | Received | Map | Owner's words |
|---|---|---|---|
| Common | 0 | 0 | "lowest rarity first, almost always" |
| Uncommon | 25 | 0 | "25 commons (duplicates included), then uncommons can be gotten" |
| Rare | 40 | 14 | "15 later, rares can be gotten ... the rare should only come in Map 14+" |
| Very Rare | 50 | 25 | "10 later, very rares can be gotten ... And the very rare much later" (Map 25: proposal) |
| Super Rare | 60 | 30 | "etc. Pace this out" (proposal) |
| Epic | 70 | 35 | proposal |
| Heroic | 80 | 40 | proposal |
| Unique and up (the Old Willow of the Ford) | 90 | 50 | proposal; it was held back only until Map 21 (`legendaryHeldBack`, still in place) |

"Received" is a counter on the faction pool's save (`bramblewood_faction_pool_v2`, field `received`); a save from before it starts
from the faction copies it already holds. The map is the furthest main map with a cleared fight (`trackMapReached`).

**The pick** (`factionTrackPick`): only open rarities; among them the lowest is almost always the one (`FACTION_RARITY_WEIGHT`:
Common 100, Uncommon 30, Rare 10, Very Rare 4 …, times the copies still left in your pool, which caps each card at 5 / 4 / 3 / 2 copies);
a card you don't own yet counts 3 times (`FACTION_NEW_CARD_WEIGHT`). On Maps 0-1 (`PLAIN_REWARDS_UPTO_MAP = 1`) a plain card (no
skills) comes first where your side has one: for Otters that is Shell-Cracker and Rivergate Recruit. Every Hummingbird card flies, so a
Hummingbird player's first faction cards have Flying (owner call below).

It is used by every faction giver: a Faction Reward (`factionReward`), a Faction Growth (`factionGrowth`: the lowest open rarity left on
your growth list), and a faction pack's own two cards (`rollFactionPackCards`; a people's bundle keeps the pack weights).

**The hand-outs** (`FACTION_REWARD_TRACK`), all on first clears:

| Hook | Cards | Where in the code |
|---|---|---|
| Map 0's 0-2 faction pack | 2 of your side (+ 1 basic-pack card) | `node.firstFactionPack`, as before |
| A main map's last fight (its ender, the map milestone) | 1 | `rollConquestPackDrops` → `factionMilestone(node)`. Was every elite and boss first clear (since 2026-10-13): far too fast for the gates (40 received by Map 6). The base-track card still comes with every elite and boss |
| Every 8th first clear of any fight (side maps too; not 0-1, 0-2 or the ambush) | 1 | `factionTrackOnWin` (`everyWins: 8`) |
| The 3-2 ambush | 1 (Faction Growth) | its `rewardTokens`, as before |
| Achievements | First Victory 1, Into the Wilds 1, Campaign Cleared 1, Five Horizons 2, Battle-Hardened 2, Bramble Archivist 1, To the Caldera 3, Wyrmslayer 3 | `claimAchievement` → `grantFactionRewardCards`; the achievement card shows "🦦🌺 Faction cards +n" (TX `ui.rp-achv-faction-chip`) and a toast names them |

**Tuning.** The rate was tuned with the sim so the count passes 40 in Map 13, and the Rare gate (Map 14) is the one that opens Rares:

| everyWins | 40 received at | Rare opens | 50 received at | Very Rare opens | Received by Map 24 (Otters) |
|---|---|---|---|---|---|
| 2 | Map 6 | 14 | Map 7 | 25 | 104 (the pool runs dry) |
| 3 | Map 8 | 14 | Map 10 | 25 | 104 |
| 4 | Map 9 | 14 | Map 12 | 25 | 104 |
| 5 | Map 10 | 14 | Map 13 | 25 | 94 |
| 6 | Map 11 | 14 | Map 15 | 25 | 85 |
| 7 | Map 12 | 14 | Map 16 | 25 | 79 |
| **8 (chosen)** | **Map 13** | **14** | **Map 18** | **25** | **74** |
| 9 | Map 14 | 14 | Map 18 | 25 | 71 |

**The road, simulated** (Otters; a player who plays every fight once, side maps when they open; the Hummingbird side gives the same
counts, its own cards):

| Map | Name | Received (end of map) | Got on this map | Open rarities |
|---|---|---|---|---|
| 0 | Bramblewood Outskirts | 5 | 5 common | common |
| 1 | Thistlewood | 8 | 3 common | common |
| 2 | Pebble Beach | 9 | 1 common | common |
| 3 | Gannet Cliffs | 12 | 3 common | common |
| 4 | Sunken Hollow | 16 | 4 common | common |
| 5 | Gatorback Swamp | 18 | 2 common | common |
| 6 | Sable Swampmire | 24 | 6 common | common |
| 7 | The Morel Hollow | 26 | 1 common, 1 uncommon | common, uncommon |
| 8 | Caves & Alcoves | 28 | 1 common, 1 uncommon | common, uncommon |
| 9 | The Kelp Mangroves | 31 | 2 common, 1 uncommon | common, uncommon |
| 10 | Coral Current | 33 | 2 common | common, uncommon |
| 11 | Eyrie Heights | 36 | 3 uncommon | common, uncommon |
| 12 | The Briar Maze | 38 | 2 common | common, uncommon |
| 13 | The Redwood Deep | 40 | 1 uncommon, 1 common | common, uncommon |
| 14 | Savanna Reaches | 43 | 2 uncommon, 1 common | common, uncommon, rare |
| 15 | The Long Grass | 45 | 2 common | common, uncommon, rare |
| 16 | The Pinewood Taiga | 47 | 1 uncommon, 1 common | common, uncommon, rare |
| 17 | Wolfsbane Tundra | 49 | 1 common, 1 rare | common, uncommon, rare |
| 18 | The Glass Dunes | 53 | 1 rare, 1 common, 2 uncommon | common, uncommon, rare |
| 19 | Ashen Spurn | 55 | 2 uncommon | common, uncommon, rare |
| 20 | The Sundered Peak | 64 | 2 rare, 4 common, 3 uncommon | common, uncommon, rare |
| 21 | The Quiet Summit | 67 | 2 uncommon, 1 common | common, uncommon, rare |
| 22 | The Rimefire Caldera | 69 | 1 uncommon, 1 common | common, uncommon, rare |
| 23 | The Goldfeather Siege | 72 | 2 uncommon, 1 common | common, uncommon, rare |
| 24 | Goldfeather Keep | 74 | 1 common, 1 uncommon | common, uncommon, rare |

Past Map 24, at the same pace (about 2.3 a map): 76 received by Map 25 (Very Rare opens), 88 by Map 30 (Super Rare), 100 by 35 (Epic),
111 by 40 (Heroic). Over the whole road the hand-outs split: 25 map milestones, 32 from every 8th first clear, 14 from achievements,
2 from the 0-2 pack, 1 from the ambush.

## Plain rewards at the start (Maps 0-1)

Owner: "Let's only give plain cards as rewards at the start." and "I want lumber to be naturally introduced in Map 1". Every reward on
Maps 0-1 is now a card with no skills, but one: Map 1's Lumber card. Every fight still gives a card.

| Fight | Rewards now | Was |
|---|---|---|
| 0-1 Pond Patrol (its one card, swapped into your deck) | Chipmunk Skirmisher | Feral Tomcat (Quick), Water Vole (Tide, Evasive) |
| 0-2 Thicket Swarm (first clear: the faction pack) | House Cat | River Mink (Tide, Pounce), Grass Snake (Tide, Revive) |
| 0-3 Raccoon Heist | Farm Dog | Chipmunk Cavalry (Quick), Owl Nightwatch (Flying, Stealth, Nocturnal), Pine Marten (Quick, Pounce) |
| 0-4 Frost Vanguard | Sergeant Bramblefox, Terrier Pup | Otter Riverguard (Armor), Shepherd's Bark (Guardian), Sergeant Bramblefox |
| 1-1 Hedgerow Scouts | Cricket Drummer | Cricket Drummer, Meadow Frog, Robin Redbreast (Flying, Diurnal) |
| 1-2 Cricket Chorus | Dormouse | Hedgehog Scout (Thorns), Amber Cicada, Ladybird Guard (Guardian) |
| 1-3 Burrow Line | Compost Grub | Rivergate Drummer (Kin Rally), Dormouse |
| 1-4 Sapper Hedge | **Badger Lumberjack** (Lumberjack: +1 on every Lumber gain; costs 1 Lumber) | Beetle Grunt (Armor), Gatling Hog |
| 1-5 The Thistle Baron (boss) | Bramble Sprout | Thistle Baron (Thorns), Stag Beetle |

Lumber is gentle this way: pitching opens after Map 0's last fight, so the Badger Lumberjack is the first Lumber card a new player is
handed, on Map 1's fourth fight (Sapper Hedge: badgers are the sappers), and its one skill only adds to the Lumber you pitch for.

The keyword-teaching extra cards (`teachingCardPick`: a Flying, Swimmer or Diurnal common swapped into your deck on Map 0-1 wins) are off
while `PLAIN_REWARDS_UPTO_MAP` is 1, and the faction track picks plain cards first there (above).

**Quarry Mole (owner: "thinking of taking away mole")**: the mole is a Base card (everyone owns it, unlimited copies) with Darksight and
Keen Sense, costing 1 Lumber, and it is the first Lumber card a player holds today. Proposal, not applied: take it out of Base and make it
a **Caves & Alcoves (Map 8) reward** (Keen Sense and Darksight are Map 8's skills in the curriculum, and Map 8 is the moles' map, with the
Ore-Smelter Mole and the Subterraneaner), and let the Badger Lumberjack on 1-4 be the Lumber introduction in its place. In Base its
spot could go to the **Harvest Mouse** (a plain 4/7 starter mouse, already Base, fielded on 1-3 Burrow Line). The change is two
lines: Quarry Mole `source {kind:'map', id:'m4', node:'8-1'}` (and off `TUTORIAL_REWARD_IDS`), nothing else.

## The archetype gates: Devilry (66), Ecclesia (77), Evomax (30+)

Owner: "Devilry found in 66 and Ecclesia in 77. Evomax will be found in 30+." A card of the Devilry line (mechanic line `devilry`, a
Devil, or the Ashen Choir in `canonical/unit-themes.json`), the Ecclesia line (`grace`, Ecclesia, the shrines) or Evomax (`evolution`)
can't be obtained before that map. The roads only run to Map 24, so all 31 that could be had are now **awaitingSource**, each with its
gate in the record (`held.map`): 16 Devilry and 15 Ecclesia (lists below). Evomax has no unit yet; Terraumbra, its one card, is an
Easter egg (not obtainable). The enemies still field these cards (the Basalt Foundry is a Devilry fight list, Eyrie Heights an Ecclesia
one): meeting them is not getting them. They are also no longer dropped by a win (a card with no source can't be unlocked).

## Side maps: late, one unique card each

Owner: "1 unique card only per submap. Then using everything we already have. Submaps should also only be unlocked quite late in the
game. Maybe like smuggler's groto after Map 7". Each side map keeps **one** reward, its boss's (or last fight's) card; the rest moved to the
main map that fits (mostly the side map's own parent, so their obtain map, and their stat budget, stays the same), to the basic packs, or
were held for a main map the road doesn't have yet (the rainforest). Each side map opening off Maps 0-19 now waits until a main map **four
or more maps later** is cleared (`entry.afterMapCleared`), and its fights count as that map (`shieldMap`: enemy level, Shield and your
reference deck), the way Lilypad Reach already did. The Smugglers' Grotto waits on Map 7, as asked.

| Side map | Off | Opened after (before) | Opens after (now) | Fights count as | Its one unique card | Cards moved off |
|---|---|---|---|---|---|---|
| Clovermead | Map 1 | its fight 1-1 | Map 5 cleared (Gatorback Swamp) | Map 5 | Lucky Hopper (the Old Hare) | 12 |
| Lilypad Reach | Map 2 | Map 6 cleared (owner, 10-18) | Map 6 cleared (kept) | Map 6 | Riverworks Bastion | 13 |
| Smugglers' Grotto | Map 2 | its fight 2-2 | **Map 7 cleared (The Morel Hollow)** | Map 7 | Octopus Tactician | 5 |
| The Sunken Grove | Map 5 | 5-7 | Map 9 cleared (The Kelp Mangroves) | Map 9 | Hedgehog Herbalist | 6 |
| The Mycelium Deep | Map 7 | 7-6 + 2 days | Map 11 cleared (Eyrie Heights) + 2 days after 7-6 | Map 11 | Rootworm Colony | 9 |
| The Glimmer Depths | Map 8 | 8-8 | Map 12 cleared (The Briar Maze) | Map 12 | Lantern Spark Fly | 3 |
| The Sunken Depths | Map 10 | 10-9 | Map 14 cleared (Savanna Reaches) | Map 14 | Blue-ringed Octopus | 5 |
| The Aerie Vault | Map 11 | 11-10 | Map 15 cleared (The Long Grass) | Map 15 | Wound Reaver | 2 |
| The Canopy | Map 14 | 14-2 | Map 18 cleared (The Glass Dunes) | Map 18 | Jaguar Stalker | 15 |
| The Ice Hollow | Map 17 | 17-8 | Map 21 cleared (The Quiet Summit) | Map 21 | Greenland Shark | 3 |
| The Old Bramble | Map 0 | the Ice Hollow cleared | the Ice Hollow cleared (so Map 21+ now) | Map 17 (kept: owner call) | Ent | 1 |
| The Pale Desert | Map 18 | Map 18 cleared | Map 18 cleared (kept: built 10-19; owner call) | Map 19 | Quicksand Queen | 8 |
| The Basalt Foundry | Map 19 | 19-1 | Map 23 cleared (The Goldfeather Siege) | Map 23 | Ember Revenant | 18 (14 of them Devilry) |
| Eye of the Volcano | Map 20 | 20-10 (World 1's last fight) | kept | Map 21 | The Contradiction | 9 |
| Volcano Lair | Map 20 | 20-10 | kept | Map 21 | Fire Drake Hatchling | 6 |
| Tutorial | Map 0 | always (T-2 / T-3 / T-4 at Maps 1 / 8 / 18) | kept | as before | none | 0 |

Proposed for the owner (not applied): the Pale Desert after Map 22, the Eye of the Volcano and the Volcano Lair after Map 24 (they are
World 1's finale and hold the Caldera Wyrm and the Scale Trail's end, so pushing them past the last built map would lock them), the Old
Bramble's fights counting as Map 21 now that it opens after the Ice Hollow's new gate.

## Every move

### Faction rewards (Otter and Hummingbird cards that were elsewhere) (6)

| Card | Rarity | From | To | Obtain map |
|---|---|---|---|---|
| Otter Angler | common | basic packs | faction reward (Otter side) | 5 → 5 |
| Otter Riverguard | common | 0-4 Bramblewood Outskirts (Map 0) | faction reward (Otter side) | 0 → 5 |
| Rivergate Drummer | uncommon | 1-3 Thistlewood (Map 1) | faction reward (Otter side) | 1 → 5 |
| Pike Lancer | rare | 2-A-4 Lilypad Reach (Map 2) | faction reward (Otter side) | 2 → 5 |
| Honeyjoe Brewer | uncommon | basic packs | faction reward (Hummingbird side) | 5 → 5 |
| Sunspire Envoy | rare | faction reward (Otter side) | faction reward (Hummingbird side) | 5 → 5 |

### Plain rewards on Maps 0-1 (and the Lumber card) (8)

| Card | Rarity | From | To | Obtain map |
|---|---|---|---|---|
| Chipmunk Skirmisher | common | 1-A-3 Clovermead (Map 1) | 0-1 Bramblewood Outskirts (Map 0) | 1 → 0 |
| House Cat | common | 1-A-4 Clovermead (Map 1) | 0-2 Bramblewood Outskirts (Map 0) | 1 → 0 |
| Farm Dog | common | 1-A-4 Clovermead (Map 1) | 0-3 Bramblewood Outskirts (Map 0) | 1 → 0 |
| Terrier Pup | uncommon | basic packs | 0-4 Bramblewood Outskirts (Map 0) | 5 → 0 |
| Dormouse | common | 1-3 Thistlewood (Map 1) | 1-2 Thistlewood (Map 1) | 1 → 1 |
| Compost Grub | common | 7-1 The Morel Hollow (Map 7) | 1-3 Thistlewood (Map 1) | 7 → 1 |
| Badger Lumberjack | uncommon | basic packs | 1-4 Thistlewood (Map 1) | 5 → 1 |
| Bramble Sprout | common | 7-4 The Morel Hollow (Map 7) | 1-5 Thistlewood (Map 1) | 7 → 1 |

### Base (1)

| Card | Rarity | From | To | Obtain map |
|---|---|---|---|---|
| Meadow Frog | common | 1-1 Thistlewood (Map 1) | Base | 1 → 0 |

### Off Maps 0-1 and off the side maps, to a main map (71)

| Card | Rarity | From | To | Obtain map |
|---|---|---|---|---|
| Water Vole | common | 0-1 Bramblewood Outskirts (Map 0) | 4-1 Sunken Hollow (Map 4) | 0 → 4 |
| River Mink | uncommon | 0-2 Bramblewood Outskirts (Map 0) | 4-4 Sunken Hollow (Map 4) | 0 → 4 |
| Grass Snake | uncommon | 0-2 Bramblewood Outskirts (Map 0) | 5-1 Gatorback Swamp (Map 5) | 0 → 5 |
| Owl Nightwatch | common | 0-3 Bramblewood Outskirts (Map 0) | 7-4 The Morel Hollow (Map 7) | 0 → 7 |
| Pine Marten | rare | 0-3 Bramblewood Outskirts (Map 0) | 7-1 The Morel Hollow (Map 7) | 0 → 7 |
| Shepherd | common | 0-4 Bramblewood Outskirts (Map 0) | 15-6 The Long Grass (Map 15) | 0 → 15 |
| Hedgehog Scout | common | 1-2 Thistlewood (Map 1) | 12-5 The Briar Maze (Map 12) | 1 → 12 |
| Spring Rain | uncommon | 1-A-4 Clovermead (Map 1) | 5-2 Gatorback Swamp (Map 5) | 1 → 5 |
| Lotus Frog | uncommon | 2-A-1 Lilypad Reach (Map 2) | 6-1 Sable Swampmire (Map 6) | 2 → 6 |
| Poison Dart Croaker | common | 2-A-5 Lilypad Reach (Map 2) | 6-2 Sable Swampmire (Map 6) | 2 → 6 |
| Camouflage Frog | common | 2-A-5 Lilypad Reach (Map 2) | 6-3 Sable Swampmire (Map 6) | 2 → 6 |
| Newt Doctor | uncommon | 2-A-5 Lilypad Reach (Map 2) | 6-5 Sable Swampmire (Map 6) | 2 → 6 |
| Mayfly Dancer | common | 2-A-4 Lilypad Reach (Map 2) | 6-7 Sable Swampmire (Map 6) | 2 → 6 |
| Elder Tortoise | common | 2-A-7 Lilypad Reach (Map 2) | 6-8 Sable Swampmire (Map 6) | 2 → 6 |
| Minnow Skitter | common | 2-A-1 Lilypad Reach (Map 2) | 9-1 The Kelp Mangroves (Map 9) | 2 → 9 |
| Shallows Fry | common | 2-A-1 Lilypad Reach (Map 2) | 9-3 The Kelp Mangroves (Map 9) | 2 → 9 |
| Sulfur Vent Crab | uncommon | 2-B-1 Smugglers' Grotto (Map 2) | 10-1 Coral Current (Map 10) | 2 → 10 |
| Riptide Eel | uncommon | 2-B-2 Smugglers' Grotto (Map 2) | 10-4 Coral Current (Map 10) | 2 → 10 |
| Voltaic Eel | rare | 2-B-3 Smugglers' Grotto (Map 2) | 8-7 Caves & Alcoves (Map 8) | 2 → 8 |
| Grotto Lobster | rare | 2-B-3 Smugglers' Grotto (Map 2) | 8-1 Caves & Alcoves (Map 8) | 2 → 8 |
| Full Moon | rare | 2-B-2 Smugglers' Grotto (Map 2) | 7-3 The Morel Hollow (Map 7) | 2 → 7 |
| Grass Viper | uncommon | 5-A-1 The Sunken Grove (Map 5) | 5-3 Gatorback Swamp (Map 5) | 5 → 5 |
| Constrictor Coil | common | 5-A-2 The Sunken Grove (Map 5) | 5-4 Gatorback Swamp (Map 5) | 5 → 5 |
| Venomlord Serpent | common | 5-A-3 The Sunken Grove (Map 5) | 5-5 Gatorback Swamp (Map 5) | 5 → 5 |
| Mudpuppy | common | 5-A-3 The Sunken Grove (Map 5) | 9-4 The Kelp Mangroves (Map 9) | 5 → 9 |
| Baby Horned Capybara | common | 5-A-2 The Sunken Grove (Map 5) | 9-5 The Kelp Mangroves (Map 9) | 5 → 9 |
| Star-nosed Mole | common | 5-A-1 The Sunken Grove (Map 5) | 8-2 Caves & Alcoves (Map 8) | 5 → 8 |
| Vampire Bat | uncommon | 7-A-1 The Mycelium Deep (Map 7) | 8-3 Caves & Alcoves (Map 8) | 7 → 8 |
| Gallery Orb-Weaver | rare | 7-A-3 The Mycelium Deep (Map 7) | 8-4 Caves & Alcoves (Map 8) | 7 → 8 |
| Nightshade Moth | common | 7-A-2 The Mycelium Deep (Map 7) | 8-5 Caves & Alcoves (Map 8) | 7 → 8 |
| Carrion Fly Swarm | rare | 7-A-3 The Mycelium Deep (Map 7) | 8-6 Caves & Alcoves (Map 8) | 7 → 8 |
| Webspire Sentinel | common | 7-A-3 The Mycelium Deep (Map 7) | 8-7 Caves & Alcoves (Map 8) | 7 → 8 |
| Planarian Splitter | uncommon | 7-A-1 The Mycelium Deep (Map 7) | 7-4 The Morel Hollow (Map 7) | 7 → 7 |
| Gangrenous Leech | uncommon | 7-A-4 The Mycelium Deep (Map 7) | 9-6 The Kelp Mangroves (Map 9) | 7 → 9 |
| Cave Olm | common | 8-A-1 The Glimmer Depths (Map 8) | 8-8 Caves & Alcoves (Map 8) | 8 → 8 |
| Colossal Squid | rare | 10-A-1 The Sunken Depths (Map 10) | 10-6 Coral Current (Map 10) | 10 → 10 |
| Kraken Spawnling | common | 10-A-2 The Sunken Depths (Map 10) | 10-7 Coral Current (Map 10) | 10 → 10 |
| Lion's Mane Jelly | uncommon | 10-A-3 The Sunken Depths (Map 10) | 10-9 Coral Current (Map 10) | 10 → 10 |
| Coral Reef Shark | uncommon | 10-A-4 The Sunken Depths (Map 10) | 10-1 Coral Current (Map 10) | 10 → 10 |
| Swordfish Spearman | rare | 10-A-4 The Sunken Depths (Map 10) | 10-2 Coral Current (Map 10) | 10 → 10 |
| Chipmunk Hoarder | common | 11-A-1 The Aerie Vault (Map 11) | 11-2 Eyrie Heights (Map 11) | 11 → 11 |
| Eyrie Warden | common | 11-A-2 The Aerie Vault (Map 11) | 11-5 Eyrie Heights (Map 11) | 11 → 11 |
| Glacial Ape-King | common | 17-A-1 The Ice Hollow (Map 17) | 17-1 Wolfsbane Tundra (Map 17) | 17 → 17 |
| Snow Ermine | common | 17-A-2 The Ice Hollow (Map 17) | 17-2 Wolfsbane Tundra (Map 17) | 17 → 17 |
| Spitting Spider | uncommon | 17-A-3 The Ice Hollow (Map 17) | 17-3 Wolfsbane Tundra (Map 17) | 17 → 17 |
| Phoenix Fledgling | common | 19-A-1 Basalt Foundry (Map 19) | 19-2 Ashen Spurn (Map 19) | 19 → 19 |
| Cinder Stoker | common | 19-A-3 Basalt Foundry (Map 19) | 19-2 Ashen Spurn (Map 19) | 19 → 19 |
| Fire Salamander | uncommon | 19-A-3 Basalt Foundry (Map 19) | 19-3 Ashen Spurn (Map 19) | 19 → 19 |
| Magma Titan | common | 19-A-8 Basalt Foundry (Map 19) | 19-4 Ashen Spurn (Map 19) | 19 → 19 |
| Ashbone Ghoul | common | 20-A-1 Eye of the Volcano (Map 20) | 20-2 The Sundered Peak (Map 20) | 20 → 20 |
| Ossuary Lammergeier | veryrare | 20-A-1 Eye of the Volcano (Map 20) | 20-3 The Sundered Peak (Map 20) | 20 → 20 |
| Cinder Skeleton | common | 20-A-2 Eye of the Volcano (Map 20) | 20-4 The Sundered Peak (Map 20) | 20 → 20 |
| Pall Wraith | rare | 20-A-2 Eye of the Volcano (Map 20) | 20-5 The Sundered Peak (Map 20) | 20 → 20 |
| Magma Wraith | uncommon | 20-A-3 Eye of the Volcano (Map 20) | 20-7 The Sundered Peak (Map 20) | 20 → 20 |
| Basalt Boar | common | 20-A-5 Eye of the Volcano (Map 20) | 20-9 The Sundered Peak (Map 20) | 20 → 20 |
| Magma Salamander | rare | 20-A-6 Eye of the Volcano (Map 20) | 20-10 The Sundered Peak (Map 20) | 20 → 20 |
| Ash Cloud Condor | rare | 20-A-7 Eye of the Volcano (Map 20) | 20-1 The Sundered Peak (Map 20) | 20 → 20 |
| Cinder Hornet | common | 20-B-1 Volcano Lair (Map 20) | 22-1 The Rimefire Caldera (Map 22) | 20 → 22 |
| Cinder Gecko | common | 20-B-1 Volcano Lair (Map 20) | 22-2 The Rimefire Caldera (Map 22) | 20 → 22 |
| Ember Centipede | common | 20-B-2 Volcano Lair (Map 20) | 22-3 The Rimefire Caldera (Map 22) | 20 → 22 |
| Gorge Wyrm | common | 20-B-3 Volcano Lair (Map 20) | 22-5 The Rimefire Caldera (Map 22) | 20 → 22 |
| Pyroclast Wyrm | common | 20-B-3 Volcano Lair (Map 20) | 22-6 The Rimefire Caldera (Map 22) | 20 → 22 |
| Ember Jackal | rare | 20-B-4 Volcano Lair (Map 20) | 22-8 The Rimefire Caldera (Map 22) | 20 → 22 |
| Elder Willow | common | 0-B-4 The Old Bramble (Map 0) | 13-6 The Redwood Deep (Map 13) | 0 → 13 |
| Rabid Jackal | uncommon | 18-A-2 The Pale Desert (Map 18) | 14-5 Savanna Reaches (Map 14) | 18 → 14 |
| Meerkat Burrower | common | 18-A-4 The Pale Desert (Map 18) | 14-6 Savanna Reaches (Map 14) | 18 → 14 |
| Dust Hyena | uncommon | 18-A-8 The Pale Desert (Map 18) | 14-7 Savanna Reaches (Map 14) | 18 → 14 |
| Sandfish | common | 18-A-1 The Pale Desert (Map 18) | 18-7 The Glass Dunes (Map 18) | 18 → 18 |
| Pale Oryx | uncommon | 18-A-7 The Pale Desert (Map 18) | 18-7 The Glass Dunes (Map 18) | 18 → 18 |
| Dust-devil Kestrel | rare | 18-A-3 The Pale Desert (Map 18) | 18-7 The Glass Dunes (Map 18) | 18 → 18 |
| Stonedrop Vulture | uncommon | 18-A-5 The Pale Desert (Map 18) | 18-2 The Glass Dunes (Map 18) | 18 → 18 |

### To the basic packs (Hedgerow Pouch, Tidemire Chest, Highcrest Case) (20)

| Card | Rarity | From | To | Obtain map |
|---|---|---|---|---|
| Tomcat | common | 0-1 Bramblewood Outskirts (Map 0) | basic packs | 0 → 5 |
| Chipmunk Cavalry | common | 0-3 Bramblewood Outskirts (Map 0) | basic packs | 0 → 5 |
| Robin Redbreast | uncommon | 1-1 Thistlewood (Map 1) | basic packs | 1 → 5 |
| Amber Cicada | uncommon | 1-2 Thistlewood (Map 1) | basic packs | 1 → 5 |
| Ladybird Guard | common | 1-2 Thistlewood (Map 1) | basic packs | 1 → 5 |
| Beetle Grunt | common | 1-4 Thistlewood (Map 1) | basic packs | 1 → 5 |
| Gatling Hog | rare | 1-4 Thistlewood (Map 1) | basic packs | 1 → 5 |
| Stag Beetle | rare | 1-5 Thistlewood (Map 1) | basic packs | 1 → 5 |
| Pigeon Peon | common | 1-A-1 Clovermead (Map 1) | basic packs | 1 → 5 |
| Clover Butterfly | common | 1-A-1 Clovermead (Map 1) | basic packs | 1 → 5 |
| Field Crow | common | 1-A-1 Clovermead (Map 1) | basic packs | 1 → 5 |
| Pill Bug | uncommon | 1-A-2 Clovermead (Map 1) | basic packs | 1 → 5 |
| Paper Wasp | common | 1-A-2 Clovermead (Map 1) | basic packs | 1 → 5 |
| Puddle Hopper | common | 1-A-3 Clovermead (Map 1) | basic packs | 1 → 5 |
| Jay Pilferer | common | 1-A-5 Clovermead (Map 1) | basic packs | 1 → 5 |
| Dam Wall | common | 2-A-2 Lilypad Reach (Map 2) | basic packs | 2 → 5 |
| Beaver Builder | common | 2-A-3 Lilypad Reach (Map 2) | basic packs | 2 → 5 |
| Lodge Engineer | uncommon | 2-A-6 Lilypad Reach (Map 2) | basic packs | 2 → 5 |
| Pond Paddler | rare | 2-A-2 Lilypad Reach (Map 2) | basic packs | 2 → 5 |
| Glimmer Spider | uncommon | 8-A-3 The Glimmer Depths (Map 8) | basic packs | 8 → 5 |

### Devilry: held until Map 66 (16)

| Card | Rarity | From | To | Obtain map |
|---|---|---|---|---|
| Cinder Imp | common | 19-2 Ashen Spurn (Map 19) | held (awaitingSource): Devilry is found on Map 66 (owner Oct 21) | 19 → held (66) |
| Ash Imp | common | 19-A-1 Basalt Foundry (Map 19) | held (awaitingSource): Devilry is found on Map 66 (owner Oct 21) | 19 → held (66) |
| Pit Glutton | rare | 19-A-2 Basalt Foundry (Map 19) | held (awaitingSource): Devilry is found on Map 66 (owner Oct 21) | 19 → held (66) |
| Brimstone Hound | uncommon | 19-A-4 Basalt Foundry (Map 19) | held (awaitingSource): Devilry is found on Map 66 (owner Oct 21) | 19 → held (66) |
| Blackmass Acolyte | uncommon | 19-A-5 Basalt Foundry (Map 19) | held (awaitingSource): Devilry is found on Map 66 (owner Oct 21) | 19 → held (66) |
| Dread Bell | uncommon | 19-A-5 Basalt Foundry (Map 19) | held (awaitingSource): Devilry is found on Map 66 (owner Oct 21) | 19 → held (66) |
| Tithe Collector | uncommon | 19-A-7 Basalt Foundry (Map 19) | held (awaitingSource): Devilry is found on Map 66 (owner Oct 21) | 19 → held (66) |
| Lurking Dread | rare | 19-A-8 Basalt Foundry (Map 19) | held (awaitingSource): Devilry is found on Map 66 (owner Oct 21) | 19 → held (66) |
| Puppeteer Imp | rare | 19-A-9 Basalt Foundry (Map 19) | held (awaitingSource): Devilry is found on Map 66 (owner Oct 21) | 19 → held (66) |
| The Sixfold | epic | 19-A-10 Basalt Foundry (Map 19) | held (awaitingSource): Devilry is found on Map 66 (owner Oct 21) | 19 → held (66) |
| Fruit-bat Familiar | uncommon | 19-A-6 Basalt Foundry (Map 19) | held (awaitingSource): Devilry is found on Map 66 (owner Oct 21) | 19 → held (66) |
| Hellbender | common | 19-A-2 Basalt Foundry (Map 19) | held (awaitingSource): Devilry is found on Map 66 (owner Oct 21) | 19 → held (66) |
| Flagellant Vulture | uncommon | 19-A-5 Basalt Foundry (Map 19) | held (awaitingSource): Devilry is found on Map 66 (owner Oct 21) | 19 → held (66) |
| Vampire Finch | uncommon | 19-A-7 Basalt Foundry (Map 19) | held (awaitingSource): Devilry is found on Map 66 (owner Oct 21) | 19 → held (66) |
| Chained Binturong | uncommon | 19-A-4 Basalt Foundry (Map 19) | held (awaitingSource): Devilry is found on Map 66 (owner Oct 21) | 19 → held (66) |
| Ashmantle Fiend | unique | 20-A-4 Eye of the Volcano (Map 20) | held (awaitingSource): Devilry is found on Map 66 (owner Oct 21) | 20 → held (66) |

### Ecclesia: held until Map 77 (15)

| Card | Rarity | From | To | Obtain map |
|---|---|---|---|---|
| Shrine Acolyte | common | 20-4 The Sundered Peak (Map 20) | held (awaitingSource): Ecclesia is found on Map 77 (owner Oct 21) | 20 → held (77) |
| Shrine High Priest | common | 21-6 The Quiet Summit (Map 21) | held (awaitingSource): Ecclesia is found on Map 77 (owner Oct 21) | 21 → held (77) |
| Blessed Avatar | common | 20-5 The Sundered Peak (Map 20) | held (awaitingSource): Ecclesia is found on Map 77 (owner Oct 21) | 20 → held (77) |
| Glowworm Cluster | common | basic packs | held (awaitingSource): Ecclesia is found on Map 77 (owner Oct 21) | 5 → held (77) |
| Shrine Bell-Ringer | common | 20-4 The Sundered Peak (Map 20) | held (awaitingSource): Ecclesia is found on Map 77 (owner Oct 21) | 20 → held (77) |
| Chapel Tortoise | uncommon | 21-3 The Quiet Summit (Map 21) | held (awaitingSource): Ecclesia is found on Map 77 (owner Oct 21) | 21 → held (77) |
| Chapel Sparrow | common | 1-A-2 Clovermead (Map 1) | held (awaitingSource): Ecclesia is found on Map 77 (owner Oct 21) | 1 → held (77) |
| Candle Moth | common | 11-1 Eyrie Heights (Map 11) | held (awaitingSource): Ecclesia is found on Map 77 (owner Oct 21) | 11 → held (77) |
| Hymn Wren | common | 11-2 Eyrie Heights (Map 11) | held (awaitingSource): Ecclesia is found on Map 77 (owner Oct 21) | 11 → held (77) |
| Abbey Goose | uncommon | 11-3 Eyrie Heights (Map 11) | held (awaitingSource): Ecclesia is found on Map 77 (owner Oct 21) | 11 → held (77) |
| Golden Magpie | uncommon | 11-4 Eyrie Heights (Map 11) | held (awaitingSource): Ecclesia is found on Map 77 (owner Oct 21) | 11 → held (77) |
| Friar Badger | uncommon | 11-5 Eyrie Heights (Map 11) | held (awaitingSource): Ecclesia is found on Map 77 (owner Oct 21) | 11 → held (77) |
| Storm Heron | rare | 11-6 Eyrie Heights (Map 11) | held (awaitingSource): Ecclesia is found on Map 77 (owner Oct 21) | 11 → held (77) |
| Vigil Owl | rare | 11-7 Eyrie Heights (Map 11) | held (awaitingSource): Ecclesia is found on Map 77 (owner Oct 21) | 11 → held (77) |
| Cathedral Eagle | legendary | 21-6 The Quiet Summit (Map 21) | held (awaitingSource): Ecclesia is found on Map 77 (owner Oct 21) | 21 → held (77) |

### Held for a map the road does not have yet (21)

| Card | Rarity | From | To | Obtain map |
|---|---|---|---|---|
| The Thistle Baron | heroic | 1-5 Thistlewood (Map 1) | held (awaitingSource): Map 1's boss leader (Thorns 2): no skills on Maps 0-1; proposed back as a Map 21+ "advanced" Thistle Baron reward | 1 → held (21) |
| MissingNo. | unique | undefined The Quiet Summit (Map 21) | held (awaitingSource): a hidden glitch card with a map but no fight (it could never be had); proposed as an Easter egg (EASTER_EGG_IDS) | 21 → held (0) |
| Ant Hill | common | 7-A-2 The Mycelium Deep (Map 7) | held (awaitingSource): the Mycelium Deep keeps one card; Map 26, the Ant Empire | 7 → held (26) |
| Swarm Matriarch | rare | 7-A-4 The Mycelium Deep (Map 7) | held (awaitingSource): the Mycelium Deep keeps one card; Map 26, the Ant Empire | 7 → held (26) |
| Oilbird | uncommon | 8-A-2 The Glimmer Depths (Map 8) | held (awaitingSource): the Glimmer Depths keep one card; Sonar is Map 29's (the Abyssal Plains) | 8 → held (29) |
| Glowing Gecko | uncommon | 18-A-6 The Pale Desert (Map 18) | held (awaitingSource): the Pale Desert keeps one card; Irradiated is World 3's (Map 33, the Glowing Waste) | 18 → held (33) |
| Toucan Courier | common | 14-A-1 The Canopy (Map 14) | held (awaitingSource): Map 25, the Rainforest Floor (the Canopy keeps one card; the road has no rainforest main map yet) | 14 → held (25) |
| Poison Dart Frog | common | 14-A-1 The Canopy (Map 14) | held (awaitingSource): Map 25, the Rainforest Floor (the Canopy keeps one card; the road has no rainforest main map yet) | 14 → held (25) |
| Velvet Worm | uncommon | 14-A-1 The Canopy (Map 14) | held (awaitingSource): Map 25, the Rainforest Floor (the Canopy keeps one card; the road has no rainforest main map yet) | 14 → held (25) |
| Leaf Chameleon | uncommon | 14-A-1 The Canopy (Map 14) | held (awaitingSource): Map 25, the Rainforest Floor (the Canopy keeps one card; the road has no rainforest main map yet) | 14 → held (25) |
| Strangler Vine | rare | 14-A-2 The Canopy (Map 14) | held (awaitingSource): Map 25, the Rainforest Floor (the Canopy keeps one card; the road has no rainforest main map yet) | 14 → held (25) |
| Slowpoke Sentinel | common | 14-A-2 The Canopy (Map 14) | held (awaitingSource): Map 25, the Rainforest Floor (the Canopy keeps one card; the road has no rainforest main map yet) | 14 → held (25) |
| Aye-aye Prowler | common | 14-A-2 The Canopy (Map 14) | held (awaitingSource): Map 25, the Rainforest Floor (the Canopy keeps one card; the road has no rainforest main map yet) | 14 → held (25) |
| Hanging Loafer | common | 14-A-3 The Canopy (Map 14) | held (awaitingSource): Map 25, the Rainforest Floor (the Canopy keeps one card; the road has no rainforest main map yet) | 14 → held (25) |
| Canopy Sloth Guardian | common | 14-A-3 The Canopy (Map 14) | held (awaitingSource): Map 25, the Rainforest Floor (the Canopy keeps one card; the road has no rainforest main map yet) | 14 → held (25) |
| Kinkajou Lurker | uncommon | 14-A-3 The Canopy (Map 14) | held (awaitingSource): Map 25, the Rainforest Floor (the Canopy keeps one card; the road has no rainforest main map yet) | 14 → held (25) |
| War-Drum Mandrill | common | 14-A-4 The Canopy (Map 14) | held (awaitingSource): Map 25, the Rainforest Floor (the Canopy keeps one card; the road has no rainforest main map yet) | 14 → held (25) |
| Hercules Beetle | rare | 14-A-4 The Canopy (Map 14) | held (awaitingSource): Map 25, the Rainforest Floor (the Canopy keeps one card; the road has no rainforest main map yet) | 14 → held (25) |
| Chilli Parrot | uncommon | 14-A-4 The Canopy (Map 14) | held (awaitingSource): Map 25, the Rainforest Floor (the Canopy keeps one card; the road has no rainforest main map yet) | 14 → held (25) |
| Old-Growth Tortoise | common | 14-A-5 The Canopy (Map 14) | held (awaitingSource): Map 25, the Rainforest Floor (the Canopy keeps one card; the road has no rainforest main map yet) | 14 → held (25) |
| Slow Loris | common | 14-A-5 The Canopy (Map 14) | held (awaitingSource): Map 25, the Rainforest Floor (the Canopy keeps one card; the road has no rainforest main map yet) | 14 → held (25) |

## For package BF5 (the stat budget's map term)

The budget's Base gets + 0.2 × the map where a card becomes obtainable (`cardObtainMap`, `canonical/card-obtain-maps.json`, regenerated
here: `node tools/forge_curve_2026_10_19.js maps`). Of the 158 moves: **59 cards' obtain map went up** (they come later now: their N rises,
e.g. the Clovermead and Map 0-1 cards going to the packs, 1 → 5; Shepherd's Bark 0 → 15; Elder Willow 0 → 13), **12 went down** (the Meadow Frog to Base 1 → 0, Badger
Lumberjack 5 → 1, Terrier Pup 5 → 0, Bramble Sprout 7 → 1, Compost Grub 7 → 1, the three Pale Desert savanna animals 18 → 14, Glimmer Spider
8 → 5, the Clovermead plain cards 1 → 0), **35 stayed** and the **52 held** cards are 0 in the file (no source) but keep their old map in
the record (`obtainBefore`), which tests/pale-desert-2026-10-19.js uses for their budget until they are placed. The record lists each one's before and after;
BF5's derived stats for the 71 cards whose map changed (and the 52 held ones, once placed) should be re-run on the new map. The faction rewards keep the pack's obtain map (5) for now:
see the owner calls.

## Owner calls

1. **Faction rewards' obtain map for the budget.** A faction Rare can't be had before Map 14, a Very Rare before 25, but
   `cardObtainMap` still counts every faction reward as a pack card (Map 5). Should their map term follow the gate (Common 0, Uncommon ~7,
   Rare 14, Very Rare 25 ...)? It changes N for 42 cards (BF5's territory), so it is left as it was.
2. **The later gates** (Super Rare 60 / Map 30, Epic 70 / 35, Heroic 80 / 40, Unique+ 90 / 50) are proposals; so is the Very Rare's Map 25.
3. **Hummingbird players' first faction cards fly**: no Hummingbird faction card is plain. Otter players get Shell-Cracker and Rivergate
   Recruit first. A plain Hummingbird common (a "Mosswing Gleaner" type) would even it out.
4. **The 0-2 faction pack's third card** is a random basic-pack card, which can have skills; the tutorial's reward cards (Rabbit Kit:
   Evasive; part 2: River Warden / Sunspire Envoy / Riverwing Envoy) and the Base Quarry Mole have skills too. "Plain at the start"
   is applied to skirmish rewards and faction picks only.
5. **The Thistle Baron** (Map 1's boss leader, Thorns 2, Heroic) is held: plain-only Map 1. Proposed back as a Map 21+ reward (the
   "stronger, more advanced versions" stretch).
6. **The Canopy's 15 rainforest animals** are held for Map 25 (the Rainforest Floor), since the main road has no rainforest; the
   Savanna Reaches (its parent, Map 14) has room for 10 of them if you'd rather keep them obtainable now.
7. **Eyrie Heights (Map 11) lost its 7 Ecclesia rewards**; it kept 6 and took the Aerie Vault's 2. Its fight lists are still chapel
   birds: re-theme it (mountain birds and goats; see the map recommendations) or accept enemies you can't collect until Map 77.
8. **The Basalt Foundry** is a Devilry side map in its decks. With Devilry at Map 66 it may be better as a later main map's content.
9. **MissingNo.** (a hidden glitch card whose source was a map with no fight) is held; it reads like an Easter egg (`EASTER_EGG_IDS`).
10. **Quarry Mole**: the replacement proposal above.
11. **Glowing Gecko** (Irradiated) is held for World 3 (Map 33, the Glowing Waste); the Irradiated Couatl (Epic, uranium cost) is still in
    the basic packs.
12. Fight 18-5 gives 4 reward cards (one over the usual 3); left as it was.
13. **Anvilwhisker Otter** (package SK2b, merged after this pass, awaitingSource for you to place): by the Oct 21 rule it belongs with the
    faction rewards (Otter side, Uncommon). Glintsnatch Magpie (SK2b) is a magpie, not a Hummingbird.

The open calls are also in `docs/decisions.json` (RP1-RP6).
