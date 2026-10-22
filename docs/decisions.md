# Bramblewood Arena — Decisions

_Generated from `decisions.json` (2026-10-22). The hub has a searchable, filterable version: YET (waiting on you) and DONE._

## Waiting on you

**BF7-4. Your five live edits of 10-21 evening: two were merged with later file changes** · Decide · Cards · asked 2026-10-22
- Folded into canonical/cards.json with your stats as printed. Tide Pool Crab: you added Shield 3 while package TR (after your save) gave it Armor 1 back, so it now has Tide + Armor 1 + Shield 3 at 1/3, and no legal line. Glacial Ape-King: your row still had Bounty 1 (TR swapped Bounty for King after your save): it keeps King + Earthquake 4 at your 6/37, 103% of N (its formula line is 6/35). Conch Crawler 1/1 with Shield 4 has no legal line. Ford Kingfisher 0/1 fits (33% of N). Ember Tetra 3/7 is new: no source and no art, and its Tide braces (S 5.4) leave no legal line at any stats.
  - Keep them as folded
  - Crab: drop Armor 1 (your Shield 3 only)
  - Ape-King: Bounty back instead of King
  - Give Ember Tetra a source (map or pack)
- **Default:** Keep them as folded

**BF7-5. 106 band cards still have no legal line: the hand-pass list** · Decide · Balance · asked 2026-10-22
- After BF7's re-fit, 106 band cards (plus Conch Crawler and Tide Pool Crab) have no legal line and keep their stats (docs/balance/human-pass-1-flagged-2026-10-21.json). docs/balance/hand-pass-2026-10-22.md gives each the cheapest single change (shrink or drop one skill, never Flying) and the line it would get; the Blue Dragon needs two. None is applied.
  - Apply the cheapest change on each
  - Pick per card
  - Leave them off the formula
- **Default:** Pick per card

**AR-1. Standard PvP shares the PvP tickets and the rating** · Decide · Arena · asked 2026-10-21
- Package AR split the Arena's PvP into two buttons. Standard PvP is the existing Standard format (every card at Level 1, no foils, a Standard deck built from any card) against the same strangers as Collection PvP, their decks also at Level 1. It uses the same 10 PvP tickets, moves the same rating and pays the same rewards. Your Standard deck is not recorded as a stranger, since it can hold cards you don't own.
  - Keep it shared
  - A separate rating for Standard
  - Separate tickets for Standard
- **Default:** Keep it shared

**AR-2. The Undercroft: the Arena's Dungeon as a daily dungeon on Map 11** · Decide · Dungeons · asked 2026-10-21
- The Arena's Dungeon (3 fights against random decks, losses carried over) is gone from the Arena; an unfinished run in an old save is no longer offered. In its place the Undercroft opens on Map 11 (the Arena's map) as a daily dungeon: each floor takes a Dungeon key, 50 floors, each harder (half a map further on per floor, +3 bramble Health), a mini-boss every 10th floor, a loss sends you back to floor 1. Every 3 floors the land changes: 15 maps' first elite deck and field rules, in order of their battle rating (Savanna 47 up to Wolfsbane Tundra 106); only floors 46-50 go round to the first. Like Murgle Mayhem, each floor's first clear gives 10 Gold Leaves (500 in all).
  - Keep these defaults
  - Different lands or order
  - Fewer floors
  - No Gold Leaves from the Undercroft
- **Default:** Keep these defaults

**AR-3. The group dungeon is a Coming soon slot** · Decide · Dungeons · asked 2026-10-21
- You asked for group dungeons with live players, recorded in the Daily Dungeon section. There is no co-op dungeon in the game yet (only the D49 design, docs/coop-dungeon-design-2026-10-13.md), so the Daily Dungeons tab now ends with a Group Dungeon slot marked Coming soon. Building it means the netcode in that doc (the Ranked Live host, extended to 2-4 players).
  - Build the co-op dungeon next
  - Keep the slot for now
  - Remove the slot
- **Default:** Keep the slot for now

**AR-4. The match log is this device's last 40 fights** · Decide · Profile · asked 2026-10-21
- Recent opponents moved from the Arena to the Profile as a match log with PvP and PvE tabs (opponent, mode, result, date, the deck you faced, and from now on your deck's name). It is what this device records: the last 40 fights (was 20), not Ranked Live, which stays in the signed-in Match History below it. Syncing the log to the account would need a new column or table (SQL for your apply).
  - Keep it on the device
  - Sync it to the account
- **Default:** Keep it on the device

**TR-1. 24 cards fall to their 1/1 floor with their cut skill back** · Decide · Balance · asked 2026-10-21
- HB2-1 gave 69 cards back the skill BF5 cut only because Flying, Tide, Diurnal or Nocturnal counted, and the formula re-fitted them (--only). 45 still fit. 24 have no room under cap 2 and drop to 1/1 (skills kept, flagged like B14): Eagle Diver 1/4, Alpha Howler 1/15, Orca Vanguard 1/21, Snow Owl Sentinel 2/7, Permafrost Mammoth 2/20, Moray Ambusher 2/12, Cave Bat Swarm 2/5, Blind Cave Fish 1/3, Sulfur Vent Crab 2/9, Tide Pool Crab 1/3, Open-Ocean Hermit Crab 1/6, Reef Manta Glider 1/7, Nightshade Moth 1/5, Elder Tortoise 1/15, Vigil Owl 2/9, Willow-o'-Wisp 1/12, Skull Vulture 3/3, Moon Jelly 2/8, Voltwing Bat 1/4, Static Bat 1/6, Sea Cucumber 2/11, Alligator Gar 2/14, Mangrove Manatee 2/17, Giant Clam 1/14 (all now 1/1). 7 more were 1/1 already. The free skills still cost S (Tide 2.79, a time of day about 2.5).
  - Keep: every skill back, 1/1 where the formula says so
  - Take the restored skill off again on these 24 (back to their stats before TR)
  - Price plain Flying / Tide / Diurnal / Nocturnal lower in the budget too
- **Default:** Keep: every skill back, 1/1 where the formula says so

**TR-2. Bounty came back on 7 cards** · Decide · Balance · asked 2026-10-21
- BF5 cut Bounty first (your 21:36: "Bounty is way too strong") wherever a card had three skills. On 7 of them the third skill was a free one under HB2-1, so the cut is undone: Monarch Wingblade, Reef Shark, Octopus Tactician, Alpha Howler, Vampire Roost, Bog Behemoth, Tiny Cave Dweller. Bounty is priced at 1 a point (your BF5 value), so the formula took it out of their stats.
  - Keep Bounty on them
  - Keep it cut (Bounty is never restored)
- **Default:** Keep Bounty on them

**TR-3. The Crown's open cases (built as defaults)** · Decide · Rules · asked 2026-10-21
- Package TR built your Crown rules. Calls taken: (a) once the Crown fades it is gone for the fight: a later King stays uncrowned; (b) the crowned King killed by an enemy unit while no King is left anywhere: +1 Gold for the killer's side (your kill rule), not the dead King's; (c) friendly fire counts as no source unit (the Crown drops); (d) the King that picks up a dropped Crown, or the liege's pick, is random among that side's Kings (the fight's seeded random); (e) a holder that leaves play without dying (bounced, exiled) drops it as with no source; (f) a crowned unit that an evolute goes over keeps the Crown (it is the same unit).
  - Keep these
  - Let a later King take a fresh Crown after it fades
  - Change (b): +1 Gold for the dead King's side
- **Default:** Keep these

**TR-4. Which cards are Kings** · Decide · Cards · asked 2026-10-21
- King given to: Rodent King (Bounty off for the two-skill rule; 4/15 -> 4/14), Glacial Ape-King (Bounty off; 7/36 -> 7/34), Yeti Chieftain (5/22 -> 5/20), The Gannet Queen (3/9 -> 1/10). Not given: the Pride Queen (with King's 2.39 her Quick leaves no room: 2/14 -> 1/1) and the Magnate Duck (King type already; 1/22 -> 1/1); the Quicksand Queen is a trap, not a ruler. Usurper was extended to steal the Crown (the Crown Pretender is the card for it); no new skill was needed.
  - Keep these four
  - Also the Pride Queen and the Magnate Duck at 1/1
  - Name others
- **Default:** Keep these four

**TR-5. Prices for King, Kingly, Tribute and the five transforms (theoretical)** · Decide · Balance · asked 2026-10-21
- canonical/skill-costs.json, ownerSet false, B15-style. Tribute 0.5 a point (half of a Lumber income: Gold buys nothing in a fight yet). Kingly 5.98 = Tribute 1 + Armor 2 (2 x 2.74), never printed. King 2.39 = 0.4 x Kingly, as a context skill (the Crown is not certain); with its own braces 0.4 x them. Transforms at CONTEXT_MULT 0.4 x the gain: Gilded {+5/+10} 8, Championed {+3/+3} 3.6, Veteran {+2/+4} 3.2, Matured {+2/+4 Stem stats} 3.2, Enraged 0.4 x its braces. Plain Crepuscular 1.6 (CX2).
  - Keep these prices
  - Raise or lower some (name them)
  - Measure them with tools/skill_worth.js
- **Default:** Keep these prices

**TR-6. Transform conditions, as read by package TR** · Decide · Rules · asked 2026-10-21
- Enraged: "It has Rage" is read as its Rage being on (Rage, below half Health); having the skill would trigger it at once. Matured: N rounds, 2 by default (tf.rounds; the editor doesn't set N yet). Veteran and Matured count rounds survived on the field, at each round's start. Championed: a kill by its own swing or its Counterattack against the unit it fights (a Guardian that takes the hit is the one it fights); kills by Arrow, Pounce or other skills don't count. Gilded: Lumber 1, Stone 2, Metal 3, Gold 5 each, more than 25, checked as the board updates. No card has a transform preset yet.
  - Keep these readings
  - Enraged = it has the Rage skill
  - Championed also by skill kills
- **Default:** Keep these readings

**EV-1. Which cards are the Evomax lines (there was no Evomax unit)** · Decide · Cards · asked 2026-10-21
- No Evomax unit existed (Terraumbra, an equipment Easter egg, was the line's only card). Package EV made lines from cards no player can get yet, so the Map 30 gate holds and no reward moved: Slowpoke Sentinel (Stem) -> Canopy Sloth Guardian (Evolute) -> Hanging Loafer (Alpha); Raven Harbinger (Evolute) -> Raven Hexcaller (Alpha) -> Bone Diviner (Omega); Gale Sprite (Evolute) -> Stormcaller (Alpha). They are mechanicLine evolution now. Missing stages are listed as cards to make in docs/evolute-design-2026-10-21.md (a sloth Omega, a storm Omega, an insect Evolute and Alpha for the Cocoon, beetle, frog and dragon lines).
  - Keep these three lines
  - Pick other cards (name them)
  - Make new Evomax cards instead and revert these
- **Default:** Keep these three lines

**EV-2. When an evolute dies, do the cards under it fire their On Death?** · Decide · Rules · asked 2026-10-21
- Built: no. The whole stack goes to the graveyard (or the Removal Zone, wherever the evolute goes) and only the top card's own death effects happen (its On Death, Bounty, Relic ...). The cards under it fire nothing, matching "a unit leaving play this way triggers no On Death, Bounty or grave effects".
  - No: only the top card's death effects
  - Yes: each card in the stack fires its own On Death (top first)
- **Default:** No: only the top card's death effects

**EV-3. Evolute bases: shared type at every stage, creatures only** · Decide · Rules · asked 2026-10-21
- Built: Alpha and Omega also need a shared type with their base (the rule named it for Evolute only). A plain Evolute cannot go over a unit that is already an evolute (no sideways or downward evolving). Structures, cages and a Gladiator leader are never bases, and only front-row units are (a raid's middle and back rows are not). The editor offers Evolute / Alpha / Omega on Evomax cards only.
  - Keep all of these
  - Alpha and Omega need no shared type
  - Allow an Evolute over an evolute
- **Default:** Keep all of these

**EV-4. An evolute waits its own Wait again** · Decide · Rules · asked 2026-10-21
- Built ("Wait and Lumber costs work as usual"): the stack waits the evolute's printed Wait, even over a Ready base. The CPU counts that against Ready bases. Alternatives: keep the base's remaining Wait, or the higher of the two.
  - Its own Wait (as usual)
  - The base's remaining Wait
  - The higher of the two
- **Default:** Its own Wait (as usual)

**EV-5. Evolute prices (theoretical)** · Decide · Balance · asked 2026-10-21
- canonical/skill-costs.json, ownerSet false: Evolute 3, Alpha 4, Omega 5 (your suggestion). Stem and Chrysalis 1.6 (0.4 x (2*1 + 2), the +1/+2 they hand over), or 0.4 x their braces' S. The evolutes' printed stats are fitted to their own N; on the board a stack is the sum, so a Stormcaller fitted to 1/23 lands on a base and becomes far bigger. No run can measure this (it rides on the player).
  - Keep these prices
  - Raise them (name the numbers)
  - Price an evolute against its line's summed N instead
- **Default:** Keep these prices

**EV-6. The Nest eggs as fodder, with a species** · Decide · Cards · asked 2026-10-21
- The Speckled Egg is a Stem and the Cocoon a Chrysalis. Each got a species (Bird, Insect) so an evolute can share a type with it: eggs had none, so Kin and type skills now count them too. Re-fit by formula: 0/2 -> 0/1. An egg ridden by an evolute never hatches.
  - Keep
  - Keep the skills, no species (then no evolute can use them)
  - Revert the eggs
- **Default:** Keep

**EV-7. The raven evolutes sit at their 1/1 floor** · Decide · Balance · asked 2026-10-21
- Following your HB2-1 answer (Flying does not count toward two skills), the ravens keep every skill: Raven Harbinger Flying + Poison 2 + Evolute, Raven Hexcaller Flying + Render + Evolute Alpha, Bone Diviner Flying + On Kill +2 Lumber + Evolute Omega. With Flying's x1.5 the formula puts all three at 1/1 (flagged, skills kept). In a stack they add to the base's stats, so the stack is still big. Without Flying, the Hexcaller and the Bone Diviner were 1/7.
  - Keep: every skill, 1/1
  - Cut Flying on the Hexcaller and the Bone Diviner (back to 1/7)
  - Lower the stage costs for these three
- **Default:** Keep: every skill, 1/1

**RK1. Raid Ticket price in the Shop** · Decide · Raid · asked 2026-10-21
- Package RK sells the Raid Ticket (one extra raid fight, past the cap of 10) for 300 Maple Leaves, beside the Rename Ticket (250 Maple Leaves); a fight also pays about 16 Maple Leaves and 12 Dust back. Gold Leaves would make it scarcer.
  - 300 Maple Leaves
  - 250 Maple Leaves (as the Rename Ticket)
  - 500 Maple Leaves
  - 30 Gold Leaves
- **Default:** 300 Maple Leaves

**RK2. A limit on buying Raid Tickets** · Decide · Raid · asked 2026-10-21
- Buying stops only while you hold 9; you can buy, use and buy again. Free tickets give at most about 16 fights a raid (10 + 1 a day), so an average player (751 raid damage a fight) tops out near rank A; S needs about 4 bought tickets, U about 24 (7,200 Maple Leaves). Rank is buyable with Maple Leaves unless a weekly limit is added.
  - No limit (hold at most 9)
  - At most 3 bought a week
  - At most 5 bought a week
- **Default:** No limit (hold at most 9)

**RK3. The A-rank Raid Ticket only when the raid falls** · Decide · Raid · asked 2026-10-21
- Owner: 'completing a raid (with at least A rank) should give you 1x ticket'. Built as: a fall's claim at total raid rank A or better pays 1 Raid Ticket; a raid that ends standing (held) pays none, whatever the rank.
  - Falls only
  - Falls and held raids
- **Default:** Falls only

**RK4. Where Raid Tickets drop** · Decide · Raid · asked 2026-10-21
- Built: an S notice 30%, SS 60%, SSS 100% (about 0.7 a week at six notices a day), and a raidTicket reward token (a fight's first clear) that is on no fight yet. Chests have no drop table to add it to.
  - Keep (notices only; token unused)
  - Also put the token on a few boss fights
  - Also one per finished weekly tier
- **Default:** Keep (notices only; token unused)

**RK5. The total rank ladder against the ticket budget** · Decide · Raid · asked 2026-10-21
- Kept as given (F 800 .. A 9,000, S 15,000 .. U 30,000). At 751 raid damage a fight (BF5's model) the ranks take 2 / 2 / 4 / 7 / 10 / 12 / 20 / 27 / 34 / 40 fights; free tickets allow about 16 a raid (12 when it falls on day 3), so S and up need bought tickets or wins at high fight ranks (a win at SSS counts 2,000, so U in 15). Fine as an aspiration, or scale the top?
  - Keep the ladder
  - Scale S..U down (e.g. 12k / 14k / 16k / 18k)
- **Default:** Keep the ladder

**RP1. Faction rewards' map term in the stat budget** · Decide · Rewards · asked 2026-10-21
- A faction Rare can't be had before Map 14 and a Very Rare before Map 25 (the faction reward track), but cardObtainMap still counts every faction reward as a pack card (Map 5) for N's Map x 0.2. Changing it moves N for the 42 faction cards (package BF5's stats).
  - Follow the gate (Common 0, Uncommon ~7, Rare 14, Very Rare 25 ...)
  - Keep Map 5 for all faction cards
- **Default:** Keep Map 5 until BF5 lands

**RP2. The later faction gates** · Decide · Rewards · asked 2026-10-21
- Proposed: Very Rare at 50 received and Map 25; Super Rare 60 / Map 30; Epic 70 / 35; Heroic 80 / 40; Unique and up 90 / 50 (FACTION_RARITY_GATES). The sim puts about 76 received by Map 25 and 111 by Map 40.
  - Keep the proposal
  - Other numbers
- **Default:** Keep the proposal

**RP3. Quarry Mole out of Base** · Decide · Rewards · asked 2026-10-21
- The Quarry Mole (Darksight, Keen Sense, 1 Lumber) is a Base card everyone owns. Proposal: make it a Caves & Alcoves (Map 8, 8-1) reward; the Badger Lumberjack on 1-4 is the Lumber introduction now, and the plain Harvest Mouse is already Base.
  - Move the mole to 8-1
  - Keep it in Base
- **Default:** Move the mole to 8-1

**RP4. Plain start for Hummingbirds, the 0-2 pack and the tutorial rewards** · Decide · Rewards · asked 2026-10-21
- Every Hummingbird faction card flies (no plain one), the 0-2 faction pack's third card is any basic-pack card, and the tutorial's reward cards (Rabbit Kit, River Warden, Sunspire Envoy, Riverwing Envoy) have skills. The pass made skirmish rewards and the faction picks plain on Maps 0-1 only.
  - Add a plain Hummingbird common and plain tutorial rewards
  - Leave as is
- **Default:** Leave as is

**RP5. Held cards: the Canopy's rainforest animals, the Thistle Baron, Eyrie Heights' theme** · Decide · Rewards · asked 2026-10-21
- 15 Canopy animals are held for a Map 25 rainforest (the Savanna Reaches has room for 10 now); the Thistle Baron (Map 1's leader, Thorns) is held for Map 21+; Eyrie Heights' chapel birds are Ecclesia (Map 77), so Map 11 still fields cards nobody can collect; the Basalt Foundry's fights are Devilry (Map 66).
  - Keep them held and re-theme Map 11 and the Foundry
  - Put the Canopy animals on Map 14 now
- **Default:** Keep them held

**RP6. The last side-map gates** · Decide · Maps · asked 2026-10-21
- Gated now (after Map N cleared, fights count as Map N): Clovermead 5, Lilypad Reach 6, Smugglers' Grotto 7, Sunken Grove 9, Mycelium Deep 11, Glimmer Depths 12, Sunken Depths 14, Aerie Vault 15, Canopy 18, Ice Hollow 21, Basalt Foundry 23. Kept: the Pale Desert (after Map 18), the Eye of the Volcano and the Volcano Lair (after 20-10), the Old Bramble (after the Ice Hollow, still counting as Map 17).
  - Pale Desert after Map 22, the Eye and the Lair after Map 24, the Old Bramble as Map 21
  - Keep these four as they are
- **Default:** Keep these four as they are

**DV2. Map leaders outside the ladder** · Decide · Rarity · asked 2026-10-22
- The 11 Heroic map leaders a boss pays on Maps 0-19 (Sergeant Bramblefox to the Yeti Chieftain) and the Triumvirate (Unique, 23-8) come before Heroic and Unique are revealed. DV kept them outside the ladder, as the old road cap did.
  - Keep leaders outside the ladder
  - Re-rank the leaders to their map
- **Default:** Keep leaders outside the ladder

**DV4. Packs gated by map and rarity** · Decide · Rewards · asked 2026-10-22
- A basic-pack card now comes out of a pack or the base track only once its map is reached (source.map) and its rarity revealed (packCardReached); before, any pack card of any rarity came out from Map 5.
  - Keep the gate
  - Gate by rarity only
  - No gate
- **Default:** Keep the gate

**DV6. Faction track gates after Map 20** · Decide · Rewards · asked 2026-10-22
- Replaces RP2: Very Rare at 50 received, Map 20 and the Volcano Lair cleared (owner: after Map 20's strongest submap); Super Rare 60 / Map 22 / the Lair; Epic 70 / Map 26 / the Eye; Heroic 80 / Map 30 / the Lair; Unique and up 90 / Map 40.
  - Keep
  - Other numbers
- **Default:** Keep

**DV7. Side-map gates, out of order** · Decide · Maps · asked 2026-10-22
- Replaces RP6's list: Clovermead after Map 12, Lilypad Reach 6, Smugglers' Grotto 7, the Mycelium Deep 8, the Sunken Depths 11, the Sunken Grove 13, the Aerie Vault 15, the Glimmer Depths 16, the Canopy 18, the Pale Desert 19, the Ice Hollow 21, the Basalt Foundry 23; the Old Bramble after the Ice Hollow; the Eye and the Lair after 20-10. Fights count as the gate map.
  - Keep
  - Other gates
- **Default:** Keep

**SK-1. Sergeant Bramblefox: Rare, Map 13, the leader of Fox Run** · Decide · Rarity · asked 2026-10-22
- Owner 09:52: lower its rarity and move it to another map, as that map's reward and in its skirmish. Done (package SK): Heroic -> Rare, from Map 0 (0-4) to The Redwood Deep (Map 13), the leader (showcase) of 13-2 Fox Run and paid when 13-2 is cleared (grantClearedBossLeaders reads its source, so clearing 0-4 no longer pays it; a player who already holds it keeps it). Why there: the lore bible's Greenhood Band (foxes, magpies and outcast mice) lives in the Redwood Deep and the Briar Maze, and Fox Run's deck is the foxes (Fox Kit, Swift Fox). Rare is allowed from Map 5 and is below Map 13's Very Rare cap, so it is the deck's top card. Re-fitted by the formula at Rare and Map 13: 4/12 -> 3/10 (89% of N), cost 1, no skills. Map 13's pool holds it under SPECIAL (the MAP list is full at 10). Fox Run now: Berserker Boar 4, Fox Kit 3, Swift Fox 3, Grizzly Vanguard 3, Tasmanian Devil 2, Bramblefox 1 (Lynx and Fawn Scout out, so it leads the deck); battle rating 61 -> 56. Heads-up: a live `__cfg:map-pools:mr` row would win over the file; the admin's Map cards editor shows it.
  - Keep: Rare, 13-2 Fox Run
  - Another map (the Briar Maze's Quill Path 12-2, the Greenhood Band's other home)
  - Another rarity (Uncommon, or Very Rare at Map 13)
- **Default:** Keep: Rare, 13-2 Fox Run

**SK-2. Skirmish leaders picked by hand (the highlighted card changes)** · Decide · Maps · asked 2026-10-22
- Owner 09:52: from Map 2 every skirmish's leader is its highlighted (showcase) card. The leader is the chosen showcase, else the Auto pick (top rarity, then Attack + Health/2). Where that Auto pick is a small card beside a much bigger unit (for example a 1/1 Rare beside a 1/25 Common that costs 3) I set `showcase` by hand to the biggest unit by cost and strength, so the highlighted card, and the leader, changes on these 14 fights: 5-3 and 5-4 Venomlord Serpent; 15-1 and 15-4 Cataphract Destrier; 17-1, 17-3 and 17-A-1 Glacial Ape King; 18-2 Komodo Warlord; 20-1 and 20-4 Cave Warlord; 21-3 Glacier Yak; 22-2 Gorge Wyrm; 19-A-4 Pyroclast Wyrm; 14-A-2 Ancient Sloth Titan. Every other fight keeps its Auto pick as the leader (the 2-1 crab is yours). Change a leader in the Showcase picker (Admin): the leader follows.
  - Keep these picks
  - Back to Auto everywhere (the strongest by rarity)
  - Tell me which to change
- **Default:** Keep these picks

**SK-3. Skirmish sizes: 8 sevens, and three fights that rate higher with their leader** · Decide · Balance · asked 2026-10-22
- 149 skirmishes (main maps and side maps) now hold 5-7 different cards: 47 have 5, 94 have 6, 8 have 7 (7 only with a clear leader: 7-2, 22-4, 2-A-3, 19-A-5, 14-A-3, 20-B-1, 18-A-3, 18-A-7; was 28 sevens, and 14 decks of 8 to 12 cards, all on the side maps). 17 fights had 4 cards and got a fifth from the map's pool. The leader counts double in the battle rating, so I traded copies (and, in 15 fights, a heavy card for a lighter one the map already uses) to keep each rating within about 10% of before; the smallest decks (rating 20) rise by 2, which is a leader's minimum. Three fights stay above: 16-4 (39 -> 52), 21-2 (63 -> 74) and 20-B-3 (46 -> 61), where the rest of the deck is already Common so copies cannot offset a Rare or Very Rare leader. Not touched: the Tutorial map's lesson fights (T-2 has 7 cards and T-3 has 8, they teach with a hand-picked lineup), the endless dungeons' generated floors, elites and bosses, and Maps 0-1 (no leaders, sizes only).
  - Keep
  - Give those three a lighter leader (a Common showcase)
  - Allow more sevens
- **Default:** Keep

**T3. Apply the server-checked fights migration** · Decide · Server · asked 2026-10-03
- The fight_sessions migration (single-use seed, transcript, server replay) is written and the client is ready. Nothing changes until it is applied.
  - Say "apply it" and I run supabase/migrations/20261003_fight_sessions.sql
  - Wait
- **Default:** Wait (local seeds keep working)

**D17. Sound direction and sourcing** · Decide · Sound · asked 2026-10-03
- Overall feel for the cue sheet (sfx-cue-sheet.md), and whether to use CC0 packs or your own recordings. Real samples will beat more synthesis; I can't download them from here.
  - A. Cosy and organic
  - B. Chiptune
  - C. Mixed (organic world, chiptune UI)
  - Drop CC0 files (Kenney Impact/Casino) into audio/
  - Send your own files
- **Default:** C, CC0 when files arrive

**D18. Play Maps 1–4 and say how difficulty and rewards feel** · Feedback · Balance · asked 2026-10-03
- Map 1 is an on-ramp; Maps 1–2 have reward cards; Map 2 retuned. Note: since 2026-10-08 Conquest fights default to Open mode (no collapsing), which changes how the AI and positions play, so the old difficulty numbers need a re-check.
- **Default:** I re-simulate win rates under Open mode next

**L1. Which beasts the Hummingbirds befriend; proposed card renames** · Decide · Lore · asked 2026-10-06
- Open questions from lore-bible.md. Dogs and cats are settled (see L2).
- **Default:** Keep current names

**I1. Native-speaker review for Tagalog, Tamil, Japanese and Korean** · Decide · Languages · asked 2026-10-06
- Machine-quality translations ship now (including card names). A native pass would catch tone and idiom.
  - Find reviewers
  - Ship as is
- **Default:** Ship as is

**I2. Translate text that contains numbers** · Decide · Languages · asked 2026-10-08
- Lines like "3 cards", "Pack 2 of 10", "N new cards!" stay English because the translator matches whole strings. Fix: number-aware templates for each language.
  - Approve the template change
  - Leave English
- **Default:** Approve

**H1. Hero levelling pace, stat prices, and Materia socketing (v2)** · Feedback · Hero · asked 2026-10-06
- Play a few fights with a Hero and say how it feels; do you want Materia socketing next?

**H2. The 3-part Hero XP bar (feedback item 17)** · Decide · Hero · asked 2026-10-08
- How the three XP bars should split (battle XP, Materia XP, ...?) — needs your picture of it.

**E1. A free pack for guests before sign-in** · Decide · Economy · asked 2026-10-08
- Let a guest open one Sprout Pouch before asking them to sign in.
  - Yes
  - No
- **Default:** Yes

**E2. Disenchant values (Magic Dust per extra copy)** · Confirm · Economy · asked 2026-10-08
- Built with: Common 5, Uncommon 8, Rare 15, Very Rare 20, Super Rare 30, Epic 40, Heroic 50, Unique 60, Legendary 100, Mythic 150, Ancient 200. Never Base/Quest/levelled/foil/Shiny; keeps one copy.
  - Keep
  - Change the numbers
- **Default:** Keep

**C1. Which cards get the six new finishes** · Decide · Cards · asked 2026-10-08
- Hex, Etched, Ice, Gold leaf, Reverse and Prism are built (Effects Lab → Card treatment centre). Who gets them: rarities, events, pack tiers, prestige?

**G1. Combo counter** · Decide · Battle · asked 2026-10-07
- A counter for chains of triggered abilities in one round, with escalating sound/visuals.
  - Build it
  - Skip

**G2. Siding with Otters or Hummingbirds (proposal)** · Decide · Lore · asked 2026-10-08
- See siding-proposal-2026-10-08.md: a standing meter moved by dialogue choices and which side's fights you take, unlocking side-specific rewards, titles and a late-game fork.
  - Approve as written
  - Change parts
  - Not yet

**T1. Catch-up mechanics** · Discuss · Design · asked 2026-10-03
- Rested XP, a weekly comeback quest tier, cheaper early Conquest once you've cleared further, a gentler curve.

**T2. Replays** · Discuss · Design · asked 2026-10-03
- Watch-only or re-fight this deck? Share links? How many to keep?

**N1. The Nest repeats the Codex** · Discuss · Design · asked 2026-10-08
- You noted the Nest overlaps the Codex. Kept for now. Ideas when you're ready: the Nest as your trophy shelf (Shinies, foils, prestige), or merge it into Codex as an Owned filter.
- **Default:** Keep for now

**S1. Apply the admin player list function** · Decide · Server · asked 2026-10-08
- The Admin → Players portal reads one admin-only, read-only database function (admin_list_players: profiles, levels, currencies, cards, matches; no emails). Written in supabase/proposed/20261008_admin_list_players.sql. Applying it (and the panel that reads it, already drafted) was held for your OK.
  - Say "apply it" (admin list)
  - Wait
- **Default:** Apply

**S2. Anti-cheat tier 1** · Decide · Security · asked 2026-10-08
- Players can currently edit their own rating and currencies from the browser console. Tier 1 makes rating read-only and refuses any single write that adds more than 2,000 Maple / 200 Gold Leaves. supabase/proposed/20261008_anticheat_tier1.sql.
  - Apply tier 1
  - Change the caps
  - Wait
- **Default:** Apply tier 1

**S3. Turn on leaked-password protection** · Do · Security · asked 2026-10-08
- Supabase dashboard → Auth → Passwords → leaked password protection. Free, one click, needs your login.
  - Done
  - Skip
- **Default:** Done

**S4. SonarCloud as well as CodeQL?** · Decide · Security · asked 2026-10-08
- CodeQL now scans every push (free, GitHub → Security). SonarCloud adds code-quality and duplication reports; it needs you to sign in at sonarcloud.io and add a token.
  - Add SonarCloud
  - CodeQL is enough
- **Default:** CodeQL is enough

**A1. API keys + monthly caps for GPT Image and fal/Kling** · Do · Art · asked 2026-10-08
- Create the keys yourself, keep them as local environment variables (never in the repo), set a monthly cap in each dashboard. Nothing is bought without your OK. See asset-pipeline-action-items.md.
  - Done
  - Not yet
- **Default:** Not yet

**A2. Train a Bramblewood pixel LoRA?** · Decide · Art · asked 2026-10-08
- FLUX.2 [dev] trained on ~30 of our PixelLab cards (~$6.40 per 1,000 steps on fal), for Maps 9–10 cards and Home sprites while PixelLab is capped.
  - Yes, test on 10 cards
  - Not yet
- **Default:** Yes, test on 10 cards

**A3. 30 s trailer from Kling clips** · Decide · Marketing · asked 2026-10-08
- 5–6 Kling 3.0 image-to-video clips (splash crowd, pack tear, Shiny reveal, Ember Chipmunk fire, castle fall) cut with gameplay capture.
  - Go
  - Later
- **Default:** Later

**F3. Enchant and Refine numbers** · Confirm · Cards · asked 2026-10-08
- Enchant: Ember +1⚔ (scorch), Stone +3❤, Tide +2❤, Grove +1⚔+1❤. Refine costs from 40✨+100🍁 (Foil) up to 200✨+450🍁+10🍂 (Gold leaf). Tide is currently a weaker Stone; give it something of its own?
  - Keep
  - Retune
- **Default:** Keep

**C3. Victory shift and the castle's white gradient** · Clarify · Battle · asked 2026-10-09
- Couldn't reproduce either. Which cards move at the end of a fight, and when? Where does the white gradient on the castle show (fight, map, results)? A screenshot would settle both.

**E9. What do Krooni 👑 buy?** · Decide · Economy · asked 2026-10-09
- The Golden case gives 3 Krooni. Nothing spends them yet, and they're kept on this device only (no database column). Ideas: cosmetic finishes, a Krooni-only pack, or Hero rarity boosts.
  - Cosmetics
  - A Krooni pack
  - Hero boosts
  - Decide later
- **Default:** Decide later

**E10. Promotion cost and level** · Decide · Economy · asked 2026-10-09
- Worker Ant promotes at Lv 3 for 60 Maple Leaves + 20 Dust. The ant goes back to Lv 0, so it can be promoted again into the other choices. Ant Warrior uses the Soldier Ant's art for now.
  - Keep
  - Higher level (5)
  - Free promotion, keep the level
- **Default:** Keep

**E11. Nurse master bonus** · Decide · Economy · asked 2026-10-09
- The Nest Nurse (a Unique+ card or the Wandering Traveller) is in, but what it does is still open. Ideas: eggs hatch 25% faster; a small chance a hatch comes out Shiny.
  - Faster hatching
  - Shiny chance
  - Both
- **Default:** Faster hatching

**D20. Devilry: my readings of your list (all built, all revertible)** · Decide · Design · asked 2026-10-10
- Built as I read them: (1) Dark Summon is a second play each turn, just for ⛧ cards, and every Dark Summon card also costs Darkness (a free extra play measured at 100%). (2) Darkness comes from your own units perishing (+1 each); 'dark actions' were left open. (3) Devour uses your play for the turn and works once per devourer. (4) Ritual's 'units perished' counts both sides. (5) Sacrifice N sits on the fodder; the discount comes off Darkness first, then Lumber. (6) Your blank keyword is named Offering N. 2026-10-10 (you: 'darkness is not clear. Is it gained? idk'): yes, it is gained: +1 each time one of YOUR units perishes (Ash Imp adds +1 on arrival). It's shown only if your deck has at least one Devilry card: the pill reads '★ 3 · ⛧ 1' (Darkness held, dark summons left this turn), and each gain floats a ★ +1. You gain 1 dark summon per turn; it doesn't stack.
  - Keep all six
  - Change some (tell me which)
- **Default:** Keep all six

**D21. Backstab: what should it do?** · Decide · Design · asked 2026-10-10
- You listed Backstab as a neutral skill without a rule. Suggestion: Backstab N, +N damage when it hits a unit that is facing a different target (rewards Pitchfork, Sweep and off-centre angles).
  - Use the suggestion
  - Something else (tell me)
  - Drop it
- **Default:** Use the suggestion

**D22. Fast Forward counters: build next?** · Decide · Design · asked 2026-10-10
- Your rule: with N counters, a unit runs its turn, upkeep included, N extra times before joining the main action order. It needs a pre-combat pass in the engine, about half a day of work with tests.
  - Build it next
  - After Ecclesia
  - Later
- **Default:** After Ecclesia

**D24. Arena rules: daily rotation and the second-player card** · Decide · Balance · asked 2026-10-10
- Built: the Arena's rule set changes daily (Standard, Long Night, Midsummer, Dusk Start, Timber Fair with +1 Lumber every 3 rounds, Frost Week, Fog on the Moor). In every Arena set, whoever plays second opens with an extra card. Conquest keeps day-first, no extra card and no free Lumber unless a fight sets its own rules; Live Ranked plays Standard. Should Conquest also give the second player the extra card (it would need a retune)?
  - Keep Conquest as is
  - Add the second-player card to Conquest too
  - Change the rotation
- **Default:** Keep Conquest as is

**D19. Archetypes: which to build first** · Decide · Design · asked 2026-10-09
- archetypes-design-2026-10-09.md has 10 archetypes plus the Elder / Outer / Forgotten trio. Suggested order: an active Exile zone, Swarm, Tide, Devilry circles, Elder Ones, then Evolution ride. Each archetype lists its open questions. 2026-10-09 (default taken on 'continue'): Swarm built first (Swarm N + Hive Mind on ants and bees). Then Tide (taken on 'continue', revertible): Flow/Ebb each round from round 2; Tide +1 on Flow, -1 damage taken on Ebb; Wash pushes the facing enemy +1 Wait once; 18 water cards tagged, 7 trimmed back into band, 28 water fights retuned. Then the active Exile zone (also on 'continue', revertible): Echoes 🕯️ (+1 per card sent to your Removal Zone) and Remember N (returns from the zone at N Echoes), with Echo Keeper, Marsh Wisp and Bog Revenant. Then the Forgotten Ones (also on 'continue', revertible): Remember returns +1/+1 per Echo spent, the Forgotten tag, and The Unremembered (Swampmire boss reward). 2026-10-10: Devilry built from your new list (see D20). Next suggested: Ecclesia with your Prayer value (D23).
  - Ecclesia next (D23)
  - Scrapper next
  - Evolution next
  - Pause archetypes
- **Default:** Ecclesia next (D23)

**FOG1. Fog of War is information only: the CPU still sees your whole board** · Decide · Battle UI · asked 2026-10-21
- Package FOG hides the far enemy columns from the player's view only. Combat, targeting and the CPU play exactly as before, and the enemy's view of your units is not fogged. Raids, Pass & Play and the Collapse rows are left out.
  - Keep it as a view-only rule
  - Also make the CPU unable to target units it cannot reach (an engine change)
- **Default:** Keep it as a view-only rule

**FOG2. Fog reach is the unit's column and the ones beside it; revealers add only permanence** · Decide · Battle UI · asked 2026-10-21
- Reach follows your Parasite note (a live unit in the column or beside it; the centre is always open, as for placement). Illuminate has no radius, so Darksight, Keen Eye and Illuminate cover the same three columns, but what they cover stays revealed for the rest of the fight.
  - Keep: same reach, revealers make it permanent
  - Give revealers a wider reach (2 columns each side)
- **Default:** Keep: same reach, revealers make it permanent

**FOG3. Fog of War uses the Mist scene as its card art for now** · Decide · Battle UI · asked 2026-10-21
- The Environment card borrows art/fields/misty.png. A new scene needs generating under the art workflow.
  - Generate a Fog of War scene
  - Keep the Mist scene
- **Default:** Keep the Mist scene

## Decided

**BF7-1. The half-miss ×1.5 counts on the stats only; Fragile is ×0.7 on both caps** · Decide · Balance · asked 2026-10-22 · decided 2026-10-22
- Pass III's formula option: the half-miss ×1.5 was on S too, so a flyer's skills cost half again. Fragile was −8 as a skill and ×0.75 on N, which shrinks N (fewer stats), the opposite of the intent. Mayfly Dancer (Flying, Fragile) re-fits at 2/7; without Fragile it would get 2/4.
  - ×1.5 on the stats only; Fragile ×0.7 on both left sides
  - Keep ×1.5 on both scores and Fragile on N
- **Default:** ×1.5 on the stats only; Fragile ×0.7 on both left sides
- **Outcome:** Owner (pass III answers): "Do your cut. I misread alot of the x1.5 skills and I used a flat number instead actually." On Fragile: "Fragile should be smth like x0.7 (so that you can have more stats!) ... The idea is that things that must be less than N have a x0.7 multiplier!" Built (package BF7) in bramblewood-budget.js capScores: f × ((2A + H) × m + S) ≤ N and f × (A·H × m + S·|S|) ≤ (N/3)², m = 1.5 per half-miss skill on Attack and Health only, f = fragileUse 0.7 for a Fragile card. BF5's fragileMult (N × 0.75) is gone. The game's editor budget panel, the Test Lab, the hub's Budget & stats and Skill costs tabs and every balance tool read it.

**BF7-2. A quality priced by a multiplier costs 0 as a skill** · Decide · Balance · asked 2026-10-22 · decided 2026-10-22
- Two you may want to look at: (1) the light bonus (N × 1.02 for a card whose only abilities are Flying, Tide or day / night ones) sits on cards whose Tide (1.5) or Diurnal / Nocturnal (1) is also priced; it is a small bonus, not the same quality counted twice, so it stays. (2) Blind on a card is an on-hit chance (Horned Lizard 50%), yet it takes the full ×1.5 like Evasive.
  - Zero the multiplier-priced skills
  - Keep the flat prices too
- **Default:** Zero the multiplier-priced skills
- **Outcome:** Owner: "Make sure there's no duplicates." Built (package BF7): Fragile −8 → 0, Blind −3 → 0, Evasive 0.1 → 0, Swift 5 → 0 (Flying and Shadow were 0 already). Checked and left as they are (no double price): context skills (their plain flag already costs 0 beside braces), transforms, King / Stem braces, the plain and light N bonuses.

**BF7-3. Bounty stays 3; four pass III cuts applied** · Decide · Balance · asked 2026-10-22 · decided 2026-10-22
- Pass III proposed five cuts (docs/balance/pass-3-proposal-2026-10-22.md); Bounty's 1.84 came from a test deck with no Lumber-costed units.
  - Four cuts, Bounty kept
  - All five cuts
- **Default:** Four cuts, Bounty kept
- **Outcome:** Owner: "Bounty is unique, because it's actually very strong, but maybe in your testing, you don't use many lumber costed units." Bounty stays 3. Applied at their measured worth: On Attack 3 → 1.35, Add Wait 3.5 → 2.8, Twin Strike 6 → 3.17, Octolash 25 → 6.48. Then every band card was re-fitted (124 moved); no-fit cards 130 → 108. Randomising Lumber and Wait in the test setups is a future balance row in docs/action-items.md.

**MP-1. A map's card pool guides the editor; it does not restrict the game** · Decide · Maps · asked 2026-10-22 · decided 2026-10-22
- Package MP: the Map cards editor and the skirmish deck pickers read canonical/map-pools.json (and the admin's live edits). The pool decides what the pickers offer and which deck cards get a ⚠ chip; nothing in the game refuses a deck that strays from it (the deck-validation caps are package DR's).
  - Guide only (editor)
  - Also fail a check when a fight deck has a card outside its map's pool
  - Also keep the CPU's generated decks (dungeons, endless floors) inside the pool
- **Default:** Guide only (editor)
- **Outcome:** Owner 07:41: OK. The pool guides the editor and the deck pickers; nothing in the game refuses a deck that strays from it.

**MP-2. "+ Load any card" saves to Special at once** · Decide · Maps · asked 2026-10-22 · decided 2026-10-22
- A card picked through + Load any card joins the deck and the map's (or submap's) Special tier immediately, as a live edit. Closing the skirmish editor without saving does not take it back out of Special; remove it in Map cards. The alternative holds the Special entry until the skirmish is saved.
  - Write at once (now)
  - Only when the skirmish is saved
- **Default:** Write at once (now)
- **Outcome:** Owner 07:41: OK. A card picked through + Load any card joins the deck and the map's SPECIAL at once (now from its own modal).

**MP-3. A submap fight does not see the parent map's Special cards** · Decide · Maps · asked 2026-10-22 · decided 2026-10-22
- As briefed: a submap fight offers the parent's Cards, the submap's Cards and the submap's Special. The parent's Special (cards for the parent's odd fights) is left out, and the editor shows the parent's Cards read-only only.
  - Left out (now)
  - Show the parent's Special too, read-only
- **Default:** Left out (now)
- **Outcome:** Owner 07:41: OK, replaced by the three tiers (package DV2): one SPECIAL list per main map, shared with its submaps' fights; a main-map fight offers MAP + SPECIAL, a submap fight MAP + that SUBMAP + SPECIAL.

**MP-4. What the three usage counters count** · Decide · Maps · asked 2026-10-22 · decided 2026-10-22
- On each card in Map cards: copies in this map's fight decks, in its submaps' fight decks, and in every other map's. Normal, elite, boss and a dungeon's wave decks count; the tutorial's fixed decks do not. It counts copies (a 4-of in a boss deck is 4), from the live map data, so the owner's edits are in it.
  - Copies (now)
  - Fights that use the card (a 4-of counts once)
- **Default:** Copies (now)
- **Outcome:** Owner 07:41: OK. The three usage counters count copies, from the live map data.

**HB2-1. Swordbill Challenger keeps three skills as a thematic exception** · Decide · Cards · asked 2026-10-21 · decided 2026-10-21
- Package HB2's new Very Rare Hummingbird (3/5, Wait 1, Flying + Taunt + Counterattack, 98% of N) has three skills. The two-skill rule's tests only exempt Epic and up, Supreme, hidden, Easter-egg and token cards, so the card is named in a THEMATIC set in tests/bf5-2026-10-21.js and tools/two_skills_2026_10_21.js. Alternatives: drop Flying (a Hummingbird that walks) or fold Counterattack into Taunt.
  - Keep three skills as a named exception
  - Cut to two (Taunt + Counterattack, no Flying)
  - Cut to two (Flying + Taunt)
- **Default:** Keep three skills as a named exception
- **Outcome:** Owner 18:23: plain Flying, Tide, Diurnal and Nocturnal don't count toward the two-skill limit; several of them count as 1. Built by package TR (bramblewood-budget.js skillCountOf, the two-skill tool, the editor's budget panel). The Swordbill Challenger is within the rule; 69 cards got back the skill BF5 cut only because one of these counted.

**DV1. The rarity ladder past Map 20** · Decide · Rarity · asked 2026-10-22 · decided 2026-10-22
- Package DV set the ladder (arena_app.js RARITY_INTRO): Common 0, Uncommon 1, Rare 5, Very Rare 10, Super Rare 20, Epic / Heroic by the Eye of the Volcano / the Volcano Lair (the main road fields them from Map 22). Proposed past that: Unique 30, Legendary 40, Mythic 55, Ancient 70, Divine 90. A skirmish caps at Super Rare on 20-29, Epic 30-39, Heroic 40-49 ...; an elite one step more, a boss two.
  - Keep the proposal
  - Other maps
- **Default:** Keep the proposal
- **Outcome:** Owner 07:41: OK, with changes. Heroic moves to Map 25 and Mythic to Map 60 (Epic 22, Unique 30, Legendary 40 as proposed). Ancient, Divine, Void and Daemonic never appear on the road (road skirmishes or road rewards): only special quests and dungeons give them, and Mythic is the highest rarity the road reaches. The Volcano Lair and the Eye of the Volcano still introduce the first Heroic and Epic (side maps may exceed the road). Built by package DV2 (arena_app.js RARITY_INTRO, ROAD_MAIN_FROM, ROAD_NEVER).

**DV3. 1-2 skirmish rewards per map, not per fight** · Decide · Rewards · asked 2026-10-22 · decided 2026-10-22
- Read as per map: each main map pays 1-2 cards from fights (its last fight carries its top card); its other pool cards are basic-pack cards of that map. Most fights now give no card of their own (the base track still gives one on every elite and boss, the faction track every 8th win and each map end).
  - Per map (as applied)
  - Per fight: 1-2 cards on every fight
- **Default:** Per map (as applied)
- **Outcome:** Owner 07:41: per map, by new cards. 10 new cards from that map = 3 skirmish rewards, 6-9 = 2, under 6 = 1; about 2 is the normal. 'New' = a pool card that first appears on that map (not carried over from an earlier map), and one the map gives out (Base and starter cards are not counted). Built by package DV2: 16 maps pay 3, 8 pay 2, Map 21 pays 1; Map 1 keeps the Badger Lumberjack at 1-5.

**DV5. Boss cards re-ranked for the ladder** · Decide · Rarity · asked 2026-10-22 · decided 2026-10-22
- The Caldera Wyrm and the Magnate Duck Legendary to Heroic, The Contradiction Unique to Epic, the Fire Drake Hatchling Common to Heroic (the Lair's reward). The Cathedral Eagle (Legendary, Ecclesia, held for Map 77) left 21-6 (the fight keeps its name); the Grovebearer Dragon-Turtle (Legendary) left 23-8 and is held for Map 40. The Caldera Wyrm is priced its own way and was not re-fitted (6/36).
  - Keep
  - Restore the Legendaries as boss exceptions
- **Default:** Keep
- **Outcome:** Owner 07:41: OK, keep. (Package DV2: with Heroic from Map 25 the Magnate Duck left Map 24's boss deck, see DV8.)

**DV8. The Magnate Duck cannot be Map 24's boss under the new ladder** · Decide · Rarity · asked 2026-10-22
- Heroic is introduced on the road at Map 25 (DV1), but the Magnate Duck (Heroic, was Legendary) was the named boss card of 24-8, The Magnate Duck. Package DV2 swapped it out for the next card of its theme (a third Gilded Swan Knight; the boss keeps its name, hqHp and rules) and removed it from Map 24's pool; the card stays Heroic with no source. Options: leave it held for Map 25+, re-rank it to Epic (then refit its stats, 1/22 has no legal line) and put it back in 24-8, or move the fight's name to Map 25.
  - Held for Map 25+ (now)
  - Re-rank to Epic and put it back in 24-8
  - Other
- **Default:** Held for Map 25+ (now)

**E3. Shiny look** · Decide · Cards · asked 2026-10-08 · decided 2026-10-08
- **Outcome:** Hue shift, not a foil: the art is recoloured by a fixed per-card hue (90–270°), soft white glow, twinkling ✦. Prism stays a foil treatment.

**E4. Pack set discounts** · Decide · Economy · asked 2026-10-08 · decided 2026-10-08
- **Outcome:** Revised 2026-10-08: 1/10/25/50/100 packs = 0/5/6/7/7.5% off. Built.

**G3. Skirmish default mode** · Decide · Battle · asked 2026-10-08 · decided 2026-10-08
- **Outcome:** All Conquest skirmishes default to Open (no collapsing). Gravity (collapsing) is special, set per skirmish. Built.

**G4. Frozen field effect** · Decide · Battle · asked 2026-10-08 · decided 2026-10-08
- **Outcome:** Tundra fights: Field card by the enemy deck, snowfall, one card per side +1 Wait each turn with an ice pulse. Built.

**L2. Dogs and cats** · Decide · Lore · asked 2026-10-06 · decided 2026-10-08
- **Outcome:** Neutral creatures, not pets: friends of both peoples. War dogs carry weapons in their mouths and stay four-legged. Recorded in lore-bible.md.

**I3. Translate card names** · Decide · Languages · asked 2026-10-06 · decided 2026-10-08
- **Outcome:** Yes: card names are translated in all 12 languages.

**E5. Disenchanting rules** · Decide · Economy · asked 2026-10-08 · decided 2026-10-08
- **Outcome:** Base and Quest cards can't be disenchanted (Base cards level up through play, 1–10). Levelled cards and cards with a skin are never disenchanted. A quick Disenchant extras button keeps one of each.

**E6. Shiny chance** · Decide · Cards · asked 2026-10-08 · decided 2026-10-08
- **Outcome:** 0.5% for every card received, Base and Quest included.

**U1. Unfinished fights** · Decide · UI · asked 2026-10-08 · decided 2026-10-08
- **Outcome:** No Resume/Discard pop-up; Home's Play tile turns into a green Continue with the fight as its subtitle.

**U2. Tutorial hands over the starter deck** · Decide · UI · asked 2026-10-08 · decided 2026-10-08
- **Outcome:** After the last tutorial win the player presses Add to deck and watches the cards go in.

**D15. PixelLab credits** · Decide · Art · asked 2026-10-03 · decided 2026-10-03
- **Outcome:** Wait for the monthly reset, then finish Maps 8–10 and the Home sprites. No purchases.

**T4. Currencies and Materia** · Decide · Economy · asked 2026-10-03 · decided 2026-10-03
- **Outcome:** Many currencies are fine as long as each shows only where it matters.

**T8. Farms and potions** · Decide · Design · asked 2026-10-03 · decided 2026-10-03
- **Outcome:** Approved as sketched: real-time plots, PvE-only potions, sellable once trades are server-side.

**T9. Sound sourcing plan** · Decide · Sound · asked 2026-10-03 · decided 2026-10-03
- **Outcome:** CC0 first (Kenney, OpenGameArt, Freesound) plus our own jsfxr, with audio/ and CREDITS.md.

**T7. Effects picks** · Decide · Effects · asked 2026-10-03 · decided 2026-10-03
- **Outcome:** Holo foil, depth parallax, battlefield weather.

**T6. Alt-art** · Decide · Cards · asked 2026-10-03 · decided 2026-10-03
- **Outcome:** Opponents see your alt-art, with a fallback to default art.

**T5. Apple sign-in** · Decide · Accounts · asked 2026-10-02 · decided 2026-10-03
- **Outcome:** Cancelled.

**D12. Passwords** · Decide · Accounts · asked 2026-10-03 · decided 2026-10-03
- **Outcome:** Minimum length 8; leaked-password check waits for the Pro plan.

**D13. World map** · Decide · Maps · asked 2026-10-03 · decided 2026-10-03
- **Outcome:** Compass diamonds on one winding trail; click to zoom into a map.

**D14. Packs on sale** · Decide · Economy · asked 2026-10-03 · decided 2026-10-03
- **Outcome:** Only the Sprout Pouch; the others show Coming soon.

**D16. UI/UX review** · Decide · UI · asked 2026-10-03 · decided 2026-10-03
- **Outcome:** Ongoing Polish track.

**D10. Native builds** · Decide · Platform · asked 2026-10-02 · decided 2026-10-03
- **Outcome:** Not yet.

**D1. Header and Home** · Decide · UI · asked 2026-10-02 · decided 2026-10-03
- **Outcome:** Built: Play as hero, 2×2 grid, Quests and Community extras.

**D2. Shop and Pack 1** · Decide · Economy · asked 2026-10-02 · decided 2026-10-03
- **Outcome:** Built: 33-card Pack 1, real cards, pack opening.

**D4. Simulator** · Decide · Tools · asked 2026-10-02 · decided 2026-10-03
- **Outcome:** Admin-only; players see Recent opponents.

**D7. Raid damage** · Decide · Raids · asked 2026-10-02 · decided 2026-10-03
- **Outcome:** Core lock global; equal base + tiers; Maple Leaves; overflow damage counts.

**D8. Trench** · Decide · Raids · asked 2026-10-02 · decided 2026-10-03
- **Outcome:** Built: you play your row; allies CPU; telegraphed columns.

**E7. Pack contents and foil odds** · Decide · Economy · asked 2026-10-08 · decided 2026-10-08
- **Outcome:** Pack editor (Admin): per pack price, size, pool, rarity weights, foil chance per card, guaranteed foil, and finish weights (By rarity 60, Prism 9, Hex 8, Etched 7, Ice 7, Reverse 6, Gold 3). Sprout Pouch 4% foil per card, Acorn Chest 8%, Golden Bramble Case 12% with one guaranteed. A card's From picks its pack pool. Publishes live as __cfg:shop-packs.

**E8. Over-size decks and the main deck** · Decide · Decks · asked 2026-10-08 · decided 2026-10-08
- **Outcome:** Decks can hold any number of cards while building (calm 'N over' note, no red shake). ★ Main deck is chosen explicitly and is what you play with; only a 20-card main deck can be played.

**F1. Upgrade / Refine / Enchant** · Decide · Cards · asked 2026-10-08 · decided 2026-10-08
- **Outcome:** Forge has three tabs. Upgrade = level 1–10 then Prestige. Refine = your best copy up the finish ladder Plain → Foil → Hex → Etched → Cracked ice → Reverse → Prism → Gold leaf (costs rise; Prism/Gold need Gold Leaves); never makes Shiny. Enchant = socket one Materia (Ember +1⚔ and scorching hits, Stone +3❤, Tide +2❤, Grove +1⚔+1❤); crystals are the player's now, crafted from Dust without a Hero.

**F2. Shiny in battle** · Decide · Cards · asked 2026-10-08 · decided 2026-10-08
- **Outcome:** Shiny is rolled in the one grant function, so any card received can be Shiny. A card you own a Shiny copy of is Shiny in your hand and on the board, and units it spawns are Shiny too.

**B1. Open-mode difficulty tweaks** · Decide · Balance · asked 2026-10-08 · decided 2026-10-09
- Re-simulated under Open fights (difficulty-open-mode-2026-10-08.md): Maps 1–4 got easier; Map 3's first two skirmishes (16 HP) are now easier than Map 2's; the Frost Yeti King (130 HP) is a 0% wall. Proposed: Badger Warband and Quill Line to ~22 HP; Yeti King to ~90 HP or make its fight Gravity (collapsing) as a special. Superseded if B2 retunes all maps.
  - Apply both
  - Only Map 3
  - Only Yeti King
  - Leave as is
- **Default:** Apply both
- **Outcome:** Superseded by B2's full retune.

**B2. Skirmish balance audit proposals** · Decide · Balance · asked 2026-10-09 · decided 2026-10-09
- skirmish-balance-audit-2026-10-08.md proposed HP changes on 72 nodes and 33 deck swaps. It was measured before today's CPU fix (the enemy now plays its Lumber cards), so its numbers are stale. Better route: retune every map with the skirmish editor's new Auto-tune against a new player's likely deck at each fight, as was done for Thistle Fields, Pebble Beach and the Grotto on 2026-10-09.
  - Retune all maps with the new tools
  - Only the walls and trivial fights
  - Leave as is
- **Default:** Retune all maps with the new tools
- **Outcome:** Taken as default on 'continue' (revertible): tools/retune_all.js retuned 85 of 96 fights against a new player's likely deck; 11 kept as they were; HP floors 14/25/30 for skirmish/elite/boss; raid bosses untouched. Before → after table in docs/balance/retune-all.json. Still too easy after the retune: Sunken Hollow (needs stronger cards than its map has) and 3-2.

**B3. Enemy deck level reads 0 on most nodes** · Decide · Balance · asked 2026-10-09 · decided 2026-10-09
- The Enemy deck Lv is rarity × (1 + card level) − 1 per card. Enemy cards are all level 0 and mostly Common or unrated, so nearly every node reads 0, and it ignores castle HP. Tried weighing unrated cards by their power (2026-10-09): most nodes still read 0 and the numbers jumped about (Map 2's boss 0, a Map 4 skirmish 4), so it wasn't shipped. Options: give enemy cards levels that rise map by map (also makes later maps harder); fill in rarities on all cards; or base the badge on simulated win rate instead.
  - Enemy card levels rise by map
  - Rarity pass on all cards
  - Badge from simulated win rate
  - Leave as is
- **Default:** Badge from simulated win rate
- **Outcome:** Mostly resolved by B5: every card now has a rarity, so the enemy deck level is no longer 0 everywhere.

**C2. Lock the battle type in the skirmish editor?** · Clarify · Conquest · asked 2026-10-09
- You said 'You CANNOT change the battle type once it's been set in the skirmish editor'. In a local test the change saved fine. Is that a bug you hit (it reverted?), or a request to lock the field after the first save? 2026-10-10: fixed. The battle type is set only in Edit skirmish (the picker outside the editor is gone), and a local save no longer gets overwritten by an older cloud copy.
  - It's a bug: it reverts
  - Lock it after the first save

**D23. Ecclesia next, with your Prayer value?** · Decide · Design · asked 2026-10-10
- Prayer value = the sum of Prayer N on your board + the cards in your Removal Zone, +1 once a turn by exiling a hand card when summoning an Ecclesia card. Ecclesia cards need a Prayer value (a threshold, not spent). Effect ideas: Worship, Divine Retribution, Lightning, Midas Touch, Healing, Satiety. 2026-10-10 (taken on 'continue'): built. See the archetypes note for every rule, the nine cards and the measurements.
  - Build Ecclesia next
  - Scrapper next
  - Evolution next
- **Default:** Build Ecclesia next

**B6. The hummingbird starter deck beats the otter starter deck ~99% of the time** · Decide · Balance · asked 2026-10-09
- Starter vs starter in simulation (300 matches): otters win 0.9%. All 10 hummingbird Basics fly (dodge half of ground attacks), most are Diurnal (+1 by day), and they run 2 copies each of 10 solid cards against the otters' 20 singles with several 1-Attack fillers. Removing Diurnal alone: 3.7%; a gentler 1-in-3 dodge: 3.3%. Packages that land near even: (C) the 7 hummingbird Basics with 2+ Attack lose 1 Attack, and 5 otter ground Basics (Otter Guard, River Carp, Otter Paddler, Burrow Rabbit, Ant Scout) gain Reach (their attacks ignore the Flying dodge): 47.7%. (F) the same hummingbird nerf, +1 Attack on 6 otter 1-Attack fillers (Honey Bee, Silver Minnow, Duckling, Otter Kit, Worker Ant, Chipmunk Forager), and Reach on Otter Guard and River Carp only: 46.8%. Reach is already in the engine (no card uses it yet). Not applied because it changes the faction players picked, their saved decks and the tutorial. 2026-10-10: superseded by your new basic set (shared six + three per side): the starter mirror now measures 52.9%.
  - F: nerf hummingbirds, lift otter fillers, Reach on 2
  - C: nerf hummingbirds, Reach on 5 otters
  - Something else (tell me)
  - Leave as is
- **Default:** F: nerf hummingbirds, lift otter fillers, Reach on 2

**T10. New Unique cards can break the raid ghost generator** · Note · Tech · asked 2026-10-09
- Making the Wandering Traveller Unique left stage-5 ghost decks under 20 cards, so it was reverted. The generator needs a fallback before more Unique cards are added.
  - Fix the generator next
  - Later
- **Default:** Fix the generator next
- **Outcome:** Fixed 2026-10-09: ghost decks widen to nearby cards when the band runs out of copies; tests/ghost-unique.js marks every third card Unique and checks all stages.

**B4. Cards that cost 3+ Lumber don't pay off** · Decide · Balance · asked 2026-10-09 · decided 2026-10-09
- Cards costing 3+ Lumber (all five dragons included) score ~38% in simulation. 2026-10-09, taking the default on 'continue': all 30 got an arrival effect (dragons breathe 4 on every enemy; brutes hit the enemy opposite for 2× their cost; Elder Willow, Elderhorn Monarch and Riverworks Bastion refund 2 Lumber; the slow small ones delay the enemy opposite by 2 Wait). It didn't move them: the real cause is that Lumber only comes from discarding cards, so a 4-cost card costs five cards in all. Tested a passive income with the CPU saving properly: +1 Lumber every 2 rounds gives cost-2 cards 75%, cost-3+ 51%, dragons 60% (free cards fall to ~24%, as cheap cards should); every round is too much (dragons 96%); every 3 rounds is too little (45%).
  - +1 Lumber every 2 rounds (core rules change)
  - +1 every 3 rounds
  - Keep discard-only Lumber; make big cards cheaper
  - Leave as is
- **Default:** +1 Lumber every 2 rounds (core rules change)
- **Outcome:** You chose no free Lumber income (it inflates Lumber costs). Instead, cards that give Lumber or draws (Beaver Lumberjack: +2 Lumber; Courier Pigeon: draw 1), plus a day/night cycle and field cards to make rounds vary. The experimental trickle setting was removed. See fields-and-day-night-2026-10-09.md.

**B5. Rarity pass and stat fixes from the balance report** · Decide · Balance · asked 2026-10-09 · decided 2026-10-09
- card-balance-2026-10-09.md: 199 of 288 cards have no rarity; giving each one the rarity its measured strength suggests would also fix the enemy deck Lv badge (B3). 64 rated cards are outside their rarity's band, each with a one-stat fix (e.g. Chipmunk Cavalry 4→3 Attack, Raccoon Nightcrew 5→8 Attack). Many free cards measure as Legendary-strong: make them rarer, or weaker.
  - Rarity pass, then stat fixes
  - Rarity pass only
  - Stat fixes only
  - Leave as is
- **Default:** Rarity pass, then stat fixes
- **Outcome:** Taken as default on 'continue' (revertible): the 199 unrated cards got a rarity from measured strength, capped at Rare for now (114 Common, 11 Uncommon, 74 Rare), and 39 extreme outliers moved half-way toward their suggested stat (e.g. Feral Tomcat 3/5 → 3/3, Honey Badger Fury 5 → 3 Attack, Raccoon Nightcrew 5 → 7 Attack). Cards in band: 124 → 162 of 288. Walls, 3+ cost cards (B4) and the Wandering Traveller were left alone.

**B7. The Forge stays shut until Map 11: no levels before it** · Decide · Balance · asked 2026-10-19 · decided 2026-10-19
- Should the reference player have Forge levels before Map 11, now that the Forge curve follows the budget (package BF: N(L) = (Base - 1 + L) x (1 + L/20), majors 4, 7, 10, minor 2)? Before Map 11 every card plays at the level it starts at (Base cards Lv 0, rewards Lv 1).
  - Keep the Forge at Map 11: Lv 0 before it
  - Open it earlier and give the reference player levels on Maps 1-10
- **Default:** Keep it at Map 11
- **Outcome:** Owner 09:52: "No Forge is fine. The player has to deck build to win." The Forge stays at Map 11 (ROAD_LEVEL_CURVE.playerForgeMap 11); before it referencePlayerLevel is Lv 0, so Maps 0-10 are won by deck building alone. From Map 11 the reference player is Lv 3, then a little more a map from Map 16, as before; the road's enemy keeps pace with the new curve (ROAD_LEVEL_CURVE.enemyKeepsPace). docs/balance/level-curve-2026-10-19b.md; tests/level-curve-2026-10-19.js.

**B8. The stat budget is v5: (Base + L/5)(1 + L/30), Level 0 Base - 1** · Decide · Balance · asked 2026-10-19 · decided 2026-10-19
- Budget v4 ((Base - 1 + L)(1 + L/20), 09:52) made the Forge curve far too strong (the mean card +228% by Lv 10). Which formula replaces it, and does its linear Level term favour weak cards?
  - v5 with L/3, the owner's example (Base 14: 14.8 at Lv 1, 23.1 at Lv 10)
  - v5 with L/4
  - v5 with L/5
- **Default:** v5, L/3 unless it favours weak cards too much
- **Outcome:** Owner 13:52: "Oh shit to the balance. That's too much. ... maybe instead: (Base + L/3) * (1 + L/30) ... Level 0 gives an additional minus 1." 13:54: "if you think it favours weak cards too much (low rarity, wait, or resource count), then change it to L/4 or L/5." Measured (docs/balance/level-curve-2026-10-19c.md): weak cards' Lv 10 stat growth is 1.82x the strong cards' with L/3, 1.74x with L/4, 1.65x with L/5 (Rare+ with 3+ Wait and 3+ Lumber; 1.46 / 1.40 / 1.31 against Rare+ with 3+ Wait or Lumber). None meets the 1.3x rule, so the budget uses L/5, the closest (levelLinDiv in bramblewood-budget.js and canonical/skill-costs.json). Most of the gap comes from the absolute conversion, not the divisor. Budget v5: N = (Base + L/5) x (1 + L/30) for Level 1 and up, Base - 1 at Level 0; Base = 20 + Rarity + 6W + 0.5W^2 + 4 Lumber + 0.4 Lumber^2 + Ritual points. The Forge curve keeps majors 4/7/10, minor 2 and the limit break 11 on v5's gain: the mean card is +6% at Lv 2, +27% at Lv 4 and +96% at Lv 10.

**B9. Limit break comes in waves; older cards get a bigger step** · Decide · Balance · asked 2026-10-19 · decided 2026-10-19
- How should limit breaks (Lv 11 and later caps) treat old cards as the road grows?
  - One rule for every card
  - Waves of balance: older cards (earlier maps / older sets) get a bigger limit-break step than newer ones
- **Default:** Waves
- **Outcome:** Owner 15:25: "There will be waves of balance during limit break. (Older cards get a bigger step than newer cards.)" Limit break comes in waves of balance; older cards (earlier maps / older sets) get a bigger limit-break step than newer ones. Design only, nothing built: docs/balance/limit-break-waves.md proposes a step x (1 + (W - Map) / 20) with W the newest wave's last map and Map the card's obtain map (the budget's map term), and one more cap level per 10-map wave for cards 10+ maps older than the wave.

**B10. Printed card = obtained card; enemy strength comes from levels, decks / synergy and fields, not altered stats** · Decide · Balance · asked 2026-10-19 · decided 2026-10-19
- Can an enemy's copy of a card fight with stats other than the card as printed (plus its level), to make a fight harder? (The Caldera Wyrm is 6/36 at 0 Lumber, over its budget as printed.)
  - Printed = obtained: enemies only get levels, better decks and fields
  - Allow per-fight stat changes on enemy copies
- **Default:** Printed = obtained
- **Outcome:** Owner 16:22: "the cards as seen should be the cards when you get them. no change. The Wyrm is only stronger cause the field effect gives it fiery skills." Printed card = obtained card; enemy strength comes from levels, decks / synergy and fields, not altered stats. The Caldera Wyrm stays as printed. On the road the enemy's levels follow the owner's schedule (Maps 1-4 Lv 1, 5-9 Lv 1-2, 10+ Lv 2 and rising) and rarity above Rare is allowed from Map 10; no new Shield overrides and no field buffs for difficulty ("Let them be strong full stop for now. In the future we will make them challenging by cheating."). Still altering enemy stats outside level and fields, flagged and left as they are: the endless dungeons' floorPct perk (+x% stats a floor, set to 0 since LV, the mechanism remains), the raid's staged decks (cards scaled by the raid's attack / health factors) and its boss units (+1 Attack, Health x1.5-3, the Health bonus): raid boss mechanics, unchanged. Shield overrides above the rule are bramble, not card, changes: counted and measured in docs/balance/level-curve-2026-10-19c.md as an owner call.

**B11. Halve the skills' fixed numbers too (BF5 halved N and the cards, not the skills)** · Decide · Balance · asked 2026-10-21 · decided 2026-10-21
- Package BF5 halved N, every card's stats and the brambles; skill costs (S) and the skills' own numbers stayed (owner: halve the total N). A live card is now a median 2/5, against Meteor 20, Fireball 15, Trap 6, Pounce up to 6, Sweep up to 5 and Armor up to 5 on 47 cards. 16 cards' skills no longer fit the halved N at all (Worker Ant, Ravenous Wolverine, Grass Viper, Bramblewood Macaque, the half-miss flyers ...), and the Tomcat's Quick (S 7.55) leaves it 1/1. In the raid the decks now break the halved bramble about half the time. List: docs/balance/halve-2026-10-19.md (Owner calls; Skill numbers that now look big).
  - Halve the fixed amounts (damage, Poison, Thorns, Trap, Pounce, Sweep, On Ready damage, Meteor 20 -> 10, Fireball 15 -> 8; at least 1), cap or halve Armor, then re-measure the skill worth and re-derive
  - Keep the skills as they are; fix the 16 cards one by one (a skill, its cost, or the card's Wait / Lumber)
- **Default:** Halve the fixed amounts, then re-measure
- **Outcome:** Owner (BF6): "a blanket halve might not balance it appropriately. I assume the N value takes into account the Map value." No blanket halving. Then 15:09: N is the halved coefficients (Base = 10 + Rarity + 3W + 0.25W² + 2L + 0.2L² + 0.5 Ritual + 0.1 Map, N = (Base + L/15)(1 + L/30), Level 0 Base − 1); 15:22: simulate only the skills with no measured worth (165 halved-world runs, 19 values moved), then every card re-fitted by formula. docs/balance/bf6-2026-10-21.md.

**B12. The raid's brambles after the halving: keep 350 (175 in the fight) or raise to 410 (205)** · Decide · Balance · asked 2026-10-21 · decided 2026-10-21
- Completion is unchanged by BF5 (100% for 30-250 participants, day 6.53 with 30; MX 6.57), but every reference deck now breaks the arms' and tail's halved bramble in about half its fights (a normal deck broke it 4% of the time before), and the four decks deal nearly the same. A stored 410 (205 in the fight, under RB2's 'less than 420') brings the breaks to 30-39%; completion stays 100% for 30+. docs/balance/halve-2026-10-19.md (The raid, re-measured).
  - Keep 350 (175 in the fight)
  - Raise the arms' and tail's bramble to 410 (205 in the fight)
  - Decide after B11 (halving the skills' numbers changes it again)
- **Default:** Decide after B11
- **Outcome:** Owner (BF6): "Okay whichever." The arms' and tail's stored bramble is 410 in canonical/raids.json (205 in the fight); BF5's probe: breaks 30-39%, completion 100% for 30+. Not re-run (no raid simulations in BF6).

**B13. Clear the owner's folded live edits on the server (10-19 / 10-20)** · Apply · Balance · asked 2026-10-21
- The 13 card edits, the Map 0 / Hedgerow / Shallows node edits, the tutorial and the Goliath's shards are folded into the files (BF5) and halved there. Until the rows are cleared, the server's full-size values (the Tomcat 4/11, the Ant Hill 0/50 ...) override the halved file in the live game. Prepared, not applied: supabase/proposed/20261021_clear_folded_overrides_2.sql (keeps a backup table).
  - Apply it with the BF5 release
  - Hold
- **Default:** Apply it with the BF5 release

**B14. Cap 2 (A·H + S·|S|) leaves 84 cards at 1/1 with their skills** · Decide · Balance · asked 2026-10-21 · decided 2026-10-21
- Under the owner's cap 2 (15:15) a Common's (N/3)² is about 16, so a skill set worth S 4 or more leaves no A·H at all (Quick alone 7.55 -> 57). BF6's formula pass put 176 cards in the bucket and squeezed 11 more under the band; 100 took one skill off without thematic loss, 84 keep their skills at the floor of their shape (1/1) and are flagged (Jaguar Stalker, Savanna Cheetah, Tomcat, Poison Dart Frog, Barnacle Fortress, Worker Ant, Courier Pigeon ...). Most skills' worths are the 10-19 full-size measures (the owner's method skipped them). List: docs/balance/bf6-2026-10-21.md (Cards that still can't fit).
  - Accept: the flagged cards stay 1/1 until their skills are reworked
  - Soften cap 2 (e.g. S·|S|/2, or S² only above a share of N), then re-fit
  - Re-measure the big skills in the halved world first (Quick, Sweep, Armor, Pounce, Poison, Thorns ...; about 2.5 h of runs, a quarter done in docs/balance/skill-worth-bf6-partial.jsonl), then re-fit
- **Default:** Re-measure the big skills in the halved world first
- **Outcome:** Owner 16:42: "Dont need the skill term being weighted down. Listen, it's because Base and N are reduced. So S and A and H all now, unchanged, play a bigger part by default. Halving S or A or H would change nothing actually, cause now you can have more attack and health for the same N. We want numbers to be smaller." Cap 2 stays A·H + S·|S| ≤ (N/3)²; the flagged cards keep their floor stats on purpose. No other change.

**CX1. Nocturnal "at night ONLY": Twilight too?** · Decide · Rules · asked 2026-10-21 · decided 2026-10-21
- Package CX2 checked the engine: plain Nocturnal is +1 Attack at night and nothing else, as asked. Two things add to it today: Twilight counts as both day and night (your 2026-10-13 rule), so Nocturnal and Diurnal also apply in Twilight; and the Leylines I map rule turns the plain +1 into +3/+3. Both were left as they are.
  - Keep: Twilight counts as night, Leylines I still boosts
  - Nocturnal at night only, not in Twilight (Diurnal likewise by day only)
  - Also drop Leylines I's boost for the plain forms
- **Default:** Keep: Twilight counts as night, Leylines I still boosts
- **Outcome:** Owner 18:23 ("Seems okay"): the default. Twilight still counts as night (and day), and Leylines I still turns the plain +1 into +3/+3. No change.

**CX2. Plain Crepuscular is much stronger now; its S is still 1** · Decide · Balance · asked 2026-10-21 · decided 2026-10-21
- Crepuscular went from +1 Attack in Twilight only to +1 Attack by day and +1 at night (both in Twilight, and a deck with one still adds the Twilight phase). Its cost in canonical/skill-costs.json is still 1 (measured 3.72 when it was Twilight-only). Nightjar Drifter 3/6 and Woodcock Lookout 3/8 were not re-fitted (no braces).
  - Price plain Crepuscular like its braces: 0.4 × (2 + 2) = 1.6 for +1/+0, then re-fit the two cards
  - Re-measure it with tools/skill_worth.js
  - Keep 1
- **Default:** Price plain Crepuscular like its braces (1.6), re-fit the two cards
- **Outcome:** Owner 18:23: the default, built by package TR. Plain Crepuscular costs 1.6 (0.4 x (2 + 2)); Nightjar Drifter 3/6 -> 2/8 and Woodcock Lookout 3/8 -> 2/9 by formula (--only).

**CX3. Half-miss skills inside braces cost 0** · Decide · Balance · asked 2026-10-21 · decided 2026-10-21
- Evasive, Flying, Shadow, Swift and Blind cost 0 in the table because the ×1.5 rule on the whole card prices them. Inside braces (Tide {+2/+2, Evasive}) that rule does not reach them, so 0.4 × their table value is 0. Mudflat Godwit's Flood {+2/+2, Evasive} counts only its +2/+2.
  - Count a half-miss skill in braces as 0.5 × the card's 2A + H, then × 0.4
  - Keep 0
- **Default:** Count it as 0.5 × the card's 2A + H, × 0.4
- **Outcome:** Owner 18:23 (titles-transforms spec): keep as is. Half-miss skills inside braces cost 0. No change.

**CX4. Rarity flags: one at a time?** · Decide · Editor · asked 2026-10-21 · decided 2026-10-21
- The editor's four toggles (Quest, Event, Dev, Special) are exclusive: turning one on turns the others off, so every card is a rank plus at most one flag and keeps a single stored string (quest, devlegendary, or a derived one like questrare). Two flags at once (an Event card that is also Dev) would need a longer string or a separate field.
  - Keep one flag at a time
  - Allow several flags (a separate rarityFlags field on the card)
- **Default:** Keep one flag at a time
- **Outcome:** Owner 18:23: the default. The editor's rarity toggles stay one at a time. No change.

**CX5. The card editor's budget panel uses the old skill costs** · Decide · Editor · asked 2026-10-21 · decided 2026-10-21
- The editor's budget line (and the Test Lab's Stat budget) still sums S with the 2026-10-17 in-page table (SB_DEFAULT_SKILLS: Regen = its number, Evasive 0), not canonical/skill-costs.json, which tools/skill_costs.js, the re-fits and the hub use. Package CX2 gave both the same 0.4 context rule, but their inner costs differ: Kinkajou Lurker's Nocturnal {Evasive, Regen 2} is 0.8 in the editor and 2.48 in the canonical table.
  - Make the editor read canonical/skill-costs.json (built into the page)
  - Keep the in-page table
- **Default:** Make the editor read canonical/skill-costs.json
- **Outcome:** Built (package CX5): the editor's budget panel and the Test Lab price S from canonical/skill-costs.json (built into the page) with tools/skill_costs.js itself; the in-page table only prices a skill the table lacks, and the panel says so.

**B15. Twin: no constant prices a full copy of the card** · Decide · Balance · asked 2026-10-21 · decided 2026-10-21
- Twin puts a full copy of the card beside it. Measured in the halved world it is off the scale (S 20+ a copy on a 2/7, 36 on a 3/11), so its cost (1) means nothing. Its two cards are held at their stats: Puddle Changeling 2/2, Mirrorhide Mutant 3/5.
  - Price Twin as the card's own body (S = 2A + H, so its stats halve), then re-fit the two
  - Make the twin a smaller token (e.g. half stats)
  - Keep both as they are
- **Default:** Price Twin as the card's own body
- **Outcome:** Owner 16:33: "B15: Only a theoretical pricing is possible since this depends on the skill of the player. I would say creating a copy of a random ally card — probably 20+. Becoming a copy of a random ally card probably 5+. I think for mirrorhide mutant, they should copy the skills of the card, but their stats = the highest stat of both cards. E.g. 2/3 copying a 4/2 => 4/3." Built (package MT): Twin is priced 20 (owner-set); Mirrorhide Mutant has the new Mimic (5, owner-set) instead of Twin; both re-fitted by formula: Puddle Changeling 1/1 (Twin overflows a Common's N; floor, skills kept), Mirrorhide Mutant 2/11.

## Stated rules · 2026-10-21

The owner's directions (Oct 21) on rewards, sources, the road's eras and its bosses, recorded by package RP (docs/balance/rewards-pass-2026-10-21.md, docs/map-recommendations-2026-10-21.md). Pinned by `tests/rewards-pass-2026-10-21.js`.

- **Skirmish rewards are never pack cards; faction rewards are their own category** ("Be strict on what is a Skirmish reward (these CANNOT be pack rewards) and which are faction rewards"): every card is exactly one of a skirmish reward (source map), a pack card, a faction reward (the Factions pool, tier 11, in no pack), or a raid / smith / nest / base / quest / secret / Easter egg / materia card, or awaitingSource.
- **Most Otters and Hummingbirds are faction rewards, given with skirmish progress and some achievements**: a main map's last fight, every 8th first clear, Map 0's 0-2 faction pack, the 3-2 ambush and the listed achievements hand them out (FACTION_REWARD_TRACK).
- **Faction rewards give the lowest rarity first, until a critical mass of faction cards received (duplicates count)**: Uncommon after 25, Rare after 15 more and not before Map 14, Very Rare after 10 more and much later (Map 25 proposed); the later steps (Super Rare 60 / Map 30, Epic 70 / 35, Heroic 80 / 40, Unique+ 90 / 50) are proposals. The thresholds are constants (FACTION_RARITY_GATES).
- **Only plain cards (no skills) as rewards at the start** (Maps 0-1), with **Lumber introduced on Map 1** by one Lumber card (the Badger Lumberjack on 1-4).
- **Devilry is found on Map 66, Ecclesia on Map 77, Evomax from Map 30**: no card of those lines is obtainable before (they wait as awaitingSource).
- **The eras: 20-40 is stronger, more advanced versions of the 0-20 animals, and maybe some extinct animals that resemble today's; 40+ has legit dinosaurs; 50+ is magic.**
- **Submaps: one unique card each, the rest built from cards the player already has, and unlocked quite late** (Smugglers' Grotto after Map 7; every side map off Maps 0-19 opens at least four maps after its parent, its fights counting as that map).
- **Skill introduction is gentle and strict: two new skills a map at most; Maps 21-40 are about using the skills already learnt** (new skills again past Map 40).
- **5 world bosses and 1 super world boss for Maps 0-100.**
- **Bosses from Map 5 onwards, so at least 95 bosses and 100+ elites, not counting the submaps.**
- **Limit break always balances a card to the next series's standard.**
- **Map x 0.2 in N gives importance to new cards balanced in the late game** (the stat budget's map term; package BF5 builds it, with vanilla cards x1.05).

## Stated rules · 2026-10-18

The owner's notes (23:05) on a far-future map and the Legendary ability tier. Pinned by `tests/legendary-2026-10-19.js`.

- **Shadow of the Valley of Death is a very far future map.** It is not on the road yet and nothing is planned for it now. The Pall Wraith (`pall-wraith`, Cast Darkness + Darksight) lives in the Eye of the Volcano (20-A, the 20-A-2 Wraith Vents deck and card reward) until that map exists.
- **Legendary abilities are a tier of their own.** A skill or passive marked `legendary: true` (PASSIVE_DEFS / SKILL_DEFS in `arena_app.js`, and `canonical/skill-costs.json`) shows a gold Legendary tag on the card's line, in the Skills Codex and in the card's glossary: "A legendary power. Rarely found on cards you can own — dragons are the exception." They are typically not given to cards players can get, except dragons. Legendary now: True Strike ("White Dragon's True Strike is legendary in itself"), Supreme and Supreme Tide.
- **True Strike is affected by Legendary dodges.** It still ignores every plain miss or dodge: Darkness, Blind, Sun-shy, Night-blind, Evasive, Swift, Flying, Prey, Tide-evade, canopy, Smoke, Fog, Sandstorm, Ashy, Slippery, Shadow and Illusory. A Legendary dodge still rolls against it as against anyone. It still can't hit Invisible.
- **Illusory is not Legendary** ("the illusory dodge is a token thing anyway, so it's not particularly legendary"). No dodge is Legendary yet. The engine hook is ready: a dodge source is Legendary when its reason is in `LEGENDARY_DODGES` or the defender's effect value carries `legendary: true` (e.g. `evasive: {legendary: true}`, `illusory: {chance: 0.5, legendary: true}`) (`legendaryDodge` in `bramblewood-engine.js`).

## Stated rules · 2026-10-19

The owner's answers (20:31) to the design review's questions on triggers, now rules of the engine (`bramblewood-engine.js`). Pinned by `tests/trigger-layers-2026-10-19.js`.

- **Trigger chains stop at 5 layers (layers, not count).** The original event's triggers are layer 1. A trigger that goes off while another trigger is resolving is one layer deeper. Layers 1 to 5 resolve; a 6th-layer trigger does not fire (`TRIGGER_LAYER_CAP = 5`). Any number of triggers at the same layer (siblings) all resolve.
- **A death sweep counts in layers too.** The deaths settled in a sweep's first pass fire layer-1 triggers (counted from where the sweep starts: a sweep opened inside a layer-2 trigger starts at layer 3). The deaths those triggers cause settle in the next pass, one layer deeper. The sweep's 6-pass limit is the cap plus one: the 6th pass clears the bodies and fires no triggers.
- **A unit killed during a death sweep dies in the next pass** (Claude's fix, 2026-10-19). A unit killed by a death effect (Nova, Landslide, an On Death or On Ally Die trigger) dies properly, with its own death effects, graveyard and Darkness. It used to vanish with no death at all.
- **Tokens fire death triggers.** A token's own On Death fires, and its allies fire On Ally Die for it, like any unit.
- **Evasive covers both.** It dodges half of single-target attacks and skills.
- **Simultaneous triggers resolve in board order:** the first player's units, then the second player's, lane by lane (left, centre, right).
- **Units dying in the same sweep don't see each other's On Ally Die.** Units that die in the same pass of a sweep are all gone together: only units still alive in that pass fire it.
- **Summoned and token units fire On Ally Spawn, not On Ally Played.** A unit an effect puts on the board (a token, a summon, a split, a hatch) is spawned. On Ally Played is for a card played from hand (leaders included).
- **A unit's own death is not an ally death.** It fires its own On Death, never its own On Ally Die.
- **0 healing fires no heal trigger.** Healing a unit already at full Health fires no On Heal, On Healed or On Ally Healed.

## Stated rules · 2026-10-19

The owner's rules (23:32) on Freeze and Confuse, now rules of the engine (`bramblewood-engine.js`, package FZ). Pinned by `tests/fz-2026-10-19.js`.

- **A unit frozen before its turn arrives fails to take its action.** Frozen earlier in the round (an earlier unit's Freeze or Ice Arrow), it skips its place in that round's order: no swing, no shot, no On Attack, no on-hit skill. That freeze is then spent: it melts at this round's end, so Freeze N costs N actions (Claude's reading, 2026-10-19: it used to swing anyway and then lose the next round).
- **Frozen after it acted** (a later hit that round, from the opponent's units) **it skips its next round**, then thaws, as before. Frozen before the round starts, it skips that round.
- **Confused: 1 in 2 that each of its triggers, skills and actions fails to activate.** Every trigger, every on-hit chance skill, and every action (its swing, its shots, a reserve strike, a Counterattack, a Sentry or Ambush strike) rolls on its own; on a fail nothing happens and the log says "😵 X is confused and fumbles." The rolls use the match's seeded random, so sims and replays repeat.
- **Confuse's swing (Claude's choice, 2026-10-19):** Confuse had no other effect on the attack, so the attack counts as an action: a fumbled swing is no swing at all (no On Attack, no on-hit skills, no Bleed tick). A swing that goes off still rolls each of its on-hit chance skills, as before.

## Stated rules · 2026-10-18

The owner's notes (21:26) on emoji with cultural meaning.

- **Ward uses 🧿 Nazar.** When a Ward skill is made (e.g. Prayer Ward in docs/gameplay-ideas-2026-10-19.md, or a ward against Blind / curses), its icon is the nazar, or a white/yellow East Asian paper talisman (no emoji exists, so that would be a drawn icon).
- **🪬 Hamsa is never a generic effect icon.** It carries real cultural and religious meaning, so it appears only inside one animal society's own identity (its cards, banner or rites), never as an effect any unit can get. Which society is still open.

## Stated rules · 2026-10-19

The owner's note (00:07): "Healing & the like: if there's nothing to heal, it doesn't occur, and no animation plays." Now a rule of the engine (`bramblewood-engine.js`) and the board (`arena_app.js`). Pinned by `tests/hn-2026-10-19.js`.

- **A heal with nothing to heal doesn't happen.** Every heal-like effect (the Heal action, Regeneration, Bloom, Nursing, Healing N, Leech, Carrion, Banana, Cower (Flee), Spring Rain, the Herb Refinery, Herbalist's bonus, Rebuild and the Rebuild bramble action, the bramble's own regeneration, Cure) on a unit already at full Health (a bramble at full Health) heals nothing and shows nothing: no heal event, no battle-log line, no floating "+0", no heal look or sound, and no beat in the replay. (A Cower (Flee) unit still backs off, only without a heal number; a Mend spell is still cast, without the green heal look when no one is hurt.)
- **0 healing fires no heal trigger** (kept from the trigger rules above): no On Heal, On Healed or On Ally Healed.
- **A Heal or Rebuild trigger with nothing to heal doesn't go off.** Its trigger rune isn't shown, and a "once" Heal trigger isn't used up (it waits for a real wound). One that paid a cost first (Burn 1 Lumber) did go off.
- **Bleed counts as something to heal** (Claude's choice, the recommended one). A heal on a full-Health unit that Bleeds happens: it stanches the Bleed (the Bleed-removal look only, 🩹 -N 🩸), with no green heal look, no "+0" and no heal triggers. Regeneration is the exception and keeps the owner's 2026-10-14 rule ("Do not regenerate when the unit is at full health"): at full Health it doesn't stanch either.
- **Old fights and replays too.** The board skips any 0-amount heal event that still turns up (a saved fight or replay from before this rule): no look, no sound, no beat, no log line (`emptyHealEvent` in `arena_app.js`).

## Stated rules · 2026-10-19

The owner's rules (00:19): "Revive is true death, but Rescue no." and "Quiet Contemplation on Map 21's boss: no 2x and re-enablement effects." Now rules of the engine (`bramblewood-engine.js`, package RV), replacing the earlier rule that a Revive death was no death (no death triggers, only the killer's On Kill). Pinned by `tests/rv-2026-10-19.js`.

- **Revive is a true death.** The first death, the one Revive answers, happens in full: the unit's On Death, its allies' On Ally Die (and Berserk, Divine Retribution, Hive Mind), the killer's On Kill and kill stat (Crown of Thorns, Midas Touch), Bounty, Darkness from the loss, the Ritual count, the deaths stat, Amore, Carrion, On Death: Spawn, Landslide, Nova, and the trip to the graveyard (or the Removal Zone). Then the unit returns: out of that zone, into its own slot, at 1 Health with every status cleared. Its second death is final (the Removal Zone), as before.
- **What would replace the body doesn't happen on a Revive death** (Claude's call): no Relic 1/1 (the unit itself comes back; its final death leaves the Relic), no Crystallise crystal, no Meiosis split. An On Death: Spawn token goes beside it, not into its slot. Its equipment stays on; its Prayer tokens are gone with the death.
- **Revive loops stop at the layer cap.** Revive is once per unit. The triggers a Revive death sets off are ordinary trigger layers of the death sweep, so a revive whose death kills another reviving unit, and so on, stops at layer 5 (`TRIGGER_LAYER_CAP`) like any chain. A Nullify kill still gets no Revive.
- **Rescue is not a death.** A unit moved or saved before it would die fires none of the above: no death event, no On Death, On Ally Die, On Kill, Bounty, Darkness, Ritual count or deaths stat, and its Revive stays unspent. Today that is Shield Call (the ally steps aside and a shield takes the skill) and Guardian (an adjacent protector takes the hit); no effect called Rescue exists yet.
- **Quiet Contemplation (the Cathedral Eagle's fight, 21-6): nothing happens twice.** Doubling, off: Headwind (a Flyer's triggers and skills twice), Twin Strike and Frenzy's second swing, Twin Shot's second arrow, Twin (the copy on arrival), Echoing Wood's copy, Crit, an Expose counter's crit (the counter is still used up), Rage's ×2, Mighty's ×2, Tall Grass's double Backstab / Pounce, Supreme Tide (plain Tide bonuses instead) and Double Time (1 play a turn, no second-player bonus for it). Re-enablement, off: every extra turn (Fast Forward N, the Tailwind spell's turn, a strong wind's Tailwind, a Swimmer's Quick Attack on a Flood) and Wildpath's Second Pitch. Both sides.
- **Quiet Contemplation leaves these alone** (Claude's reading; say if any should go): plain Wait cuts (Hasten, Reduce Wait), multi-target skills (Volley, Sweep, Fork, a trigger's N targets), the target's own weakness or Fragile (double damage taken), Boomerang's return (it is that round's attack), Banana / Durian snacks, a Charge's cycle, Rage's half damage taken, and Revive (once, and a true death).

## Stated rules · 2026-10-19

Package GI (owner 00:19: "continue with action items, and considering our gameplay-ideas ... After running through the ideas, create what you want to create"): the skills and field effects built from docs/gameplay-ideas-2026-10-19.md, now rules of the engine (`bramblewood-engine.js`, the Package GI block). Only POOL example cards carry them; no live card or map does yet. Details: docs/gameplay-ideas-built-2026-10-19.md. Pinned by `tests/gi-2026-10-19.js`.

- **A trigger can target the card it is about** (the owner's question 7 in gameplay-ideas-2026-10-19: yes, it targets the played card). A trigger's subject is the ally played (or the unit that died, was healed, got Ready or moved): `sub:'subject'` is that unit, `sub:'subjectFacing'` the unit facing it, and `filterKin` keeps only a subject that is the acting unit's Kin.
- **Kin Rally N** (On Ally Played (Kin): that ally +N/+N) and **Pack Howl N** (On Ally Played (Wolf): Bleed N on the enemy facing it) are ordinary On Ally Played triggers: off while the unit is Waiting, Stunned, Frozen or Asleep; Confused fumbles them; the 5-layer cap holds; a card played from hand only (a token is On Ally Spawn). A Changeling passes both filters. Nobody facing the Wolf: no Bleed.
- **Hunter N is one keyword with a status picker**: Poisoned (the default), Bleeding, Wet or Exposed; Shatter stays the Frozen case. Exposed is read before the hit uses up its counter. Hunter and **Executioner N** (strictly below half Health) add to hits and shots, never to a status tick or a bramble.
- **Detonate** (Claude's reading): its hit or shot deals the target's whole Poison as extra damage, 1 for 1, then that Poison is gone. Poison ticks at the round's start first, so it cashes in what the tick left.
- **Proliferate N**: from round 2, at each round's start, up to N Poisoned enemies (picked at random) each give 1 Poison to a random unit beside them. It spreads (the carrier keeps its own); poison-proof units never catch it. A passive, so it works while its unit is Waiting.
- **Brittle** (a status from Brittle N hits) counts as Frozen for Shatter only: the unit still acts and its Wait still ticks. It wears off like Webbed; Revive clears it, Cure doesn't (as Webbed).
- **Prayer Ward N**: Armor N while the unit holds Prayer tokens (the player's own offering tokens are not on the unit, so they don't count). Its icon is 🧿 Nazar (owner, 2026-10-18 21:26).
- **Field Breaker N** (Claude's scope): when it arrives, the field's round-start effects are skipped for the next N rounds, for both sides: every Field effects 2 and 3 tick (the hazards, the Leylines' gifts and burn, Haunted, Mirage, Wave, Consternation, and the three new fields), Swamp Fever, the Tide-spout and the volcano's eruptions, comets and lava. Day and night, the Tide, Darkness, wind, the always-on field rules (Sandstorm misses, Ashy, Slippery ...) and a played field card go on. Two breaks don't add up: the later end wins.
- **Spore Cloud** (for The Morel Hollow): from round 2, one random unit a side that isn't poison-proof falls Asleep for the round, as Sleep 1, so the Sleep cap (N+1) holds it at 2 at most; a hit wakes it.
- **Thunderstorm N** (2; for Coral Current): from round 2, lightning (shock) strikes one random unit a side for N; each Wet counter adds 1, shock Resist halves it.
- **Tangled Roots** (for the Kelp Mangroves): from round 2, one random unit a side that isn't Flying or a Structure is Webbed for the round.
- **Crab Trap is data, not a rule** (Claude's call): a Crab Claws card with Hunter 1 (Wet) (the pool card Tidepool Trapper Crab). Crab Claws itself is unchanged, so no live crab changed.
- **Skipped, each against a standing rule or the owner's earlier no**: Isolation (fights Lone Wolf), Rescue Chain and Death Spiral (loops), a generic Contagion (folded into Proliferate), and Hallowed Ground and Blood in the Water (left for the placement phase: small-engine but each one fight).

## Stated rules · 2026-10-19

Package SK1 (owner 21:36, new combat skills; 21:56: "if you can and it makes sense, feel free to use triggers and actions. if they dont suffice, add the required trigger or action."): the design notes the owner gave with the skills, and the rules SK1 built. Rules in `bramblewood-engine.js` (the Package SK1 block); pinned by `tests/skills-sk1-2026-10-19.js`.

- **Maps 21–40 are mostly about using the skills already learnt** (owner 21:36): new skills arrive past Map 40 (Punish is the first one held for then); Maps 21–40 lean on the skills a player has met by Map 20.
- **After each map has an appropriate set of canonical animals, arrange skills and stats, relying on what's already there and changing only if required** (owner 21:36): skills and stats follow the map's animals, reusing the existing ones first.
- **Skills are triggers × actions where they fit** (owner 21:56): Sentry N = On Enemy Enters (Facing): Damage N; Expose N / Exploit N / Venom Pulse N = On Hit: Expose / Exploit / Poison Tick N; Spoils N = On Kill (Creature): Buff itself +0/+N. New triggers On Enemy Enters (Facing), On Hit, On Kill (Creature); new actions Exploit and Poison Tick.
- **Expose is about hiding, Exploit about damage** (owner 21:36): Expose N strips the target's hiding for N rounds (Invisible, Evasive, Smoke, Shadow, Stealth; Flying and Swift still dodge); Exploit N puts N tokens on, each later hit +1 and one token used (the old Expose crit counters' role).
- **Cure / Heal / Cleanse** (owner 21:36): Cure removes Poison only; Heal restores Health only (no Bleed stanch); Cleanse (and Renewal, its shorthand) removes the physical debuffs: Bleed, Scar, Corrosion, Brittle, Exposed, Exploit, Shocked (Vulnerable), Staggered and Daunt (Weakness), a Perforate's shredded Armor (Rend), and a future Burn. Not Freeze, Stun, Sleep, Paralyze, Blind, Tipsy, Confused, Decay or Poison (Claude's call on Burn and Freeze). A cell curse still comes off first. Phoenix Fledgling keeps its intent with Renewal + Cure 2.
- **Siege N = the old Demolisher and the old Siege** (owner 21:36): +N on Structures and on swings at the bramble; `demolisher` stays an alias for old saves and overrides (the higher of the two when both).
- **Isolation is a drawback** (owner 21:36: "(4, 3, 2, 1, or 0) - range = 2"): allies within 2 columns, 0/1/2/3/4+ give −4/−3/−2/−1/0 Attack and Health (flat, Claude's call over −50%), a table parameter; its S is negative, like the payments.
- **Punish N is held behind a flag** (owner: an advanced skill for Map 40+, design open): the recommended design (docs/skills-punish-proposal.md) is built behind `rules.punishSkill` / engine `flags.punish` and is on no card.
- **Every SK1 number is a parameter** (owner: the numbers may be halved): the engine's SK1_DEF defaults, a card's own N, and `makeSimEngine(..., {sk1:{...}})` to change the defaults in one place.

## Stated rules · 2026-10-19

Package SK2b (owner 23:43: "I want to make resources really a strategic move. Not a simple - just put."): the three-tier economy and the cost principle. Details: docs/economy-resources-2026-10-19.md. Pinned by `tests/skills-sk2b-2026-10-19.js`.

- **Strong creatures can be low costed - and their power is that they are low costed** (the owner, 23:43). A cheap strong card is a design tool, not a balance error: its strength is tempo. Costly cards are strong because they need an economy, and the economy is what the opponent can attack. The budget is not bent for such cards; they are a deliberate, marked class (recommendation, not applied).
- **Three tiers, each paid with the one below** (all On Turn Start × Gain, while Ready): Milling N gives N Lumber free; Quarry N pays 1 Lumber for N Stone; Smelter N pays 2 Lumber + 2 Stone for 1 Metal, up to N times. The ratios are parameters (SK2_DEFAULTS). The Petrified Tree stays the expensive no-input Stone source.
- **A trigger can have a price** (t.pay, Lumber / Stone / Metal / Uranium): it goes off only if its player holds all of it, and pays after every other gate, so a fizzle costs nothing. A conversion is paid whole or not at all; can't pay, nothing happens. Units pay in the upkeep's order, so a Quarry acting first can feed a Smelter the same turn.
- **Smelter, not Forge-works** (Claude's call): the Forge is already the card-upgrade screen.
