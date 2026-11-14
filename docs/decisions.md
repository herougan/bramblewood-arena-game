# Bramblewood Arena — Decisions

_Generated from `decisions.json` (2026-11-08). The hub has a searchable, filterable version: YET (waiting on you) and DONE._

## Waiting on you

**SKW2-1. Attack's worth depends on Health** · Decide · Budget · asked 2026-11-14
- SKW2: +1 Attack is worth about Health ÷ Attack (fragile units 0.8, sturdy 20+), not cap 1's flat 3. Cap 1 binds on all 472 cards; cap 2 (A·H) on none. SKW3 (no games): cap 2 alone ranks cards closer to their measured worth (0.32 vs 0.14; 0.37 vs 0.27), but puts 43 Maps 0-20 cards over budget. A softer cap 1 (square root of A·H) puts 22 over (mostly small Commons on Maps 0-5). Either needs a road check first.
  - a) Cap 2 alone (cap 1 dropped), after a road check
  - b) Square-root cap 1, after a road check
  - c) Keep both caps as they are
- **Default:** a

**EDGE1-1. Five main fights just outside band** · Decide · Balance · asked 2026-11-14
- At 1,000 games 2-4 (51%), 14-5 (60%) and 14-8 (28%) are too hard; 11-9 (71%) and 16-5 (75%) too easy, each 1-3 points out. The road tuner found one enemy deck change each (400 games, tune seeds): 2-4 2 Beaver Lumberjack to Riverworks Bastion, 58%; 14-5 2 Bramblewood Macaque to Jaguar Stalker, 67%; 14-8 1 Bramble Sprout to Jaguar Stalker, Shield 0, 39%; 11-9 2 Chipmunk Hoarder to Stonedrop Vulture, 59%; 16-5 +1 Mountain Hare, 69%. Fresh seeds, 1,000 games: 2-4 60.5, 11-9 57.4, 14-8 38.1, 16-5 70.8 in band; 14-5 61.2, still 1 under. Fixes in docs/balance/b1114-edge-fixes.jsonl.
  - a) Apply all five (14-5 may need one more step)
  - b) Apply some (say which)
  - c) Leave them; they are close
- **Default:** a

**REF7-1. Map 16 walls** · Decide · Balance · asked 2026-11-14
- Even decks built well from a player's collection fall short on 16-2, 16-3, 16-4 and 16-6. The cause is the enemy Cone-cutter Squirrel's economy and the enemy at level 4 against the player's 3. Measured, 200 games: 16-3 enemy level 4 to 3 goes from 46% to 68% (target 68). Cutting Squirrel copies fixes each fight too (table in docs/balance/ref7/ref7-2026-11-14.md).
  - a) Cut Squirrel copies per the table
  - b) Enemy level 3 on 16-3 and 16-4
  - c) Keep it as a deliberate step
- **Default:** b

**REF7-2. Windfall on Map 18** · Decide · Balance · asked 2026-11-14
- Windfall drives every Map 18 wall: switching it off adds 14-42 points in every fight. 18-4 (33% vs target 72) can only be fixed through it (79% with Windfall off); the best level, Health, Shield or card change reaches 54%. Note: the Map reference deck finds 18-4 too easy (BAL42-1), so the two decks disagree.
  - a) Windfall off on 18-4
  - b) Windfall off on all of Map 18
  - c) Keep it; accept 18-4 at about 33%
- **Default:** a

**REF7-3. 19-5 has no single fix** · Decide · Balance · asked 2026-11-14
- 19-5 reads 18.5% against a target of 60 for well-built player decks. Taking out all 3 Obsidian Scorpions reaches 44.5%; no level, Health or Shield change does better. One Scorpion is also behind 19-1 (68 to 92.5% without it).
  - a) Take out the Scorpions and lower the level (two changes)
  - b) Redesign the fight in your card pass
- **Default:** b

**SKW1-1. Trigger weights** · Decide · Budget · asked 2026-11-14
- SKW1 measured each trigger's worth against On Spawn. It is about 0.5-0.75 x how often the trigger fires per copy played. Today's weights run high: On Kill 1.33 (measured 0.42), On Death 0.76 (0.26), On Enemy Spawn 2.86 (0.08). The pair prices still looked right only because the action values (SKW1-2) are low and the two errors cancel. Details: docs/balance/skw1/skw1-2026-11-14.md.
  - a) Adopt the measured table
  - b) Rule: weight = 0.6 x fires per copy played
  - c) Keep
- **Default:** a

**SKW1-2. Action values** · Decide · Budget · asked 2026-11-14
- Measured worth of one On Play firing: Deal 2 is 3.1 (the budget implies 0.7), so about 1.5 a point against 0.4; +2 Health, Shield 2 and Heal 2 are 2-3x their prices; Draw 1 is lower (2.0 against 3.4). Changing this means changing SKW1-1 with it, then a re-fit of every card's price.
  - a) Re-base actions with SKW1-1, then re-fit
  - b) Keep
- **Default:** a

**SKW1-3. Pairs that do nothing, and repeating Draw** · Decide · Budget · asked 2026-11-14
- Some pairs can never do anything: a self action On Death, or Heal On Spawn at full Health. Repeating Draw saturates: On Turn Start Draw 1 measured 4.3 against a price of 12.3. Proposal: those pairs cost 0, and repeating Draw is capped at about 1.6x its On Play worth.
  - a) Yes
  - b) No
- **Default:** a

**SKW1-4. Four skills priced off their worth** · Decide · Budget · asked 2026-11-14
- Over seven contexts: Dry costs 4 but measured 0.2 (it only matters on heat or sandstorm fields); Fork 4.95, measured 3.1; Reach 1, measured -0.4; Diurnal 1 costs 1.14 but measured 2.3 (a fight with no day/night rule is day all match). Guardian is below zero everywhere; Keen Eye never changed a game.
  - a) Re-price by measure and home share
  - b) Keep
- **Default:** a

**SKW1-5. Attack weight** · Decide · Budget · asked 2026-11-14
- SKW2 measured it properly (bramble 15, Maps 3/8/13/18, 17 commons, 400k games): +1 Attack = 2.91 Health [2.74-3.09], so the budget's 3 holds. SKW1's 4.3-9.9 came from sturdy carriers. Cost doesn't change it. +1 Shield = about 1.0 Health (budget 0.8). The real miss is the shape: see SKW2-1.
  - a) Measure it properly first (done: SKW2)
  - b) Keep 3
- **Default:** b

**SKW1-6. Named-skill cap** · Decide · Budget · asked 2026-11-14
- A player meets 151 named skills by Map 20; your 25-30 is passed at Map 1. 101 of them sit on a single card, and Map 11 alone adds 49. The SKW1 doc lists near-duplicate groups (e.g. Poison 2 / Bleed 2 measured 5.3 / 5.6; Flying / Evasive 3.45 / 3.34) and marks the skills that carry theme. No cuts are proposed.
  - a) Set a cap and merge from the list
  - b) No cap
- **Default:** a

**UI54-1. Codex World 1 roll: show the map total?** · Decide · UI · asked 2026-11-14
- World 1 is Maps 0-40, but only Maps 0-24 exist yet, so its roll reads "x of 25 reached".
  - a) Keep "x of 25" (grows as maps are added)
  - b) Show only maps reached
- **Default:** a

**UI54-2. Names for the worlds in the Codex?** · Decide · UI · asked 2026-11-14
- The world rolls say only "World 1 · Maps 0-40", maps reached and fights cleared. No lore was invented.
  - a) You name World 1 and World 2 (lore bible)
  - b) Keep "World 1", "World 2"
- **Default:** b

**UI54-3. Codex map scrolls: what New! means** · Decide · UI · asked 2026-11-14
- In a map's scroll, New! marks cards whose first map list is this map; the rest show as "+N from earlier maps". (The admin Map cards window uses your review's New!/Carried flags instead.)
  - a) First map list that holds the card (as built)
  - b) Use your review's New! flags
- **Default:** a

**FIX11-1. Cards above their map's rarity cap** · Decide · Balance · asked 2026-11-13
- These listed cards are rarer than their map's fights may hold: Dolphin Knight (Rare) on Maps 2 and 4 (cap Uncommon, from before your 11-13 picks); from your 11-13 picks Phoenix Mushrooms (Epic) on Map 7 (cap Rare), Tide Spirit (Very Rare) on Map 9 (cap Rare), Caldera Snow Leopard (Super Rare) on Map 19 (cap Very Rare).
  - a) Allow them as exceptions
  - b) Move each to a map whose cap fits
  - c) Lower their rarity
- **Default:** a

**FIX11-2. Three card pairs with identical stats** · Decide · Balance · asked 2026-11-13
- Same cost, wait, Attack/Health and skills, both cards now on the lists: Plains Zebra / Snowshoe Hare (0-cost 1/7 Evasive), Village Miller / Farm Dog (0-cost 2/7, no skills), Pine Marten / Fishing Cat (1-cost wait 1, 1/14 Pounce 2).
  - a) You retune one of each pair in your redesign
  - b) Leave them identical
- **Default:** a

**FIX11-3. Fight 8-A-3 holds both bats** · Decide · Balance · asked 2026-11-13
- Echo Screecher and Fruit Bat are the two-card bat family; the family rule says one per fight. 8-A-3 holds both.
  - a) Swap one out in the LIST1-2 re-card
  - b) Allow it
- **Default:** a

**UI52-1. Should a tutorial reset replay the Map T fights?** · Decide · UI · asked 2026-11-13
- Profile → Tutorials resets the coach tips and lessons. It leaves the tutorial-fight done flags alone, because clearing them locks tabs again until the fights are replayed.
  - a) Tips and lessons only (as built).
  - b) Also replay the T fights (tabs lock until done).
- **Default:** a

**UI52-2. Shop and Premium on the places strip: always or only in the shop?** · Decide · UI · asked 2026-11-13
- Shop and Premium are now places on the shared strip (like Forge, Nest, Codex), shown on every page.
  - a) Always on the strip (as built).
  - b) Only while you're in the shop.
- **Default:** a

**UI51-1. Season crossfade on the map: keep it?** · Decide · UI · asked 2026-11-13
- The conquest paw prints are off. Moving between seasons on the map still crossfades the colours.
  - a) Keep the crossfade.
  - b) Turn it off too.
- **Default:** a

**LIST1-1. Granite Ox Golem is NEW! on two side maps** · Decide · Balance · asked 2026-11-13
- You picked Granite Ox Golem as an own card for both Volcano Lair (opens after Map 20) and Basalt Foundry (opens after Map 23 today). A card belongs to one map only. Volcano Lair opens first, so it would own the Golem. Basalt Foundry then has 2 own cards, and Claude's pick for its third is Malachite Golem (Shell, a skill its Carried cards already have).
  - a) Volcano Lair keeps it; Basalt Foundry takes Malachite Golem
  - b) Basalt Foundry keeps it; Volcano Lair needs a third card
  - c) Keep it on both
- **Default:** a

**LIST1-2. Fights to re-card after your 11-13 picks** · Decide · Balance · asked 2026-11-13
- Your 11-13 picks are now the lists. Some fights no longer match them: 24 dropped cards are still in fights (they sit on SPECIAL so the fights stay legal), 26 road fights field more than one copy of a card that is now Carried (K14), a few PRO decks use dropped cards, and 2 bosses' auto leaders changed.
  - a) Re-card those fights next (SIDE2 for the side maps, a SKIR pass for the main maps)
  - b) Leave them as they are
- **Default:** a

**LIST1-3. Stone cards before Map 21** · Decide · Balance · asked 2026-11-13
- Two of your picks break the rule of no Stone before Map 21: Phoenix Mushrooms on Map 7 (an Epic that costs Stone; the road ladder has Epics from Map 22) and Pumice Beetle on Map 20 (it makes Stone). The lists keep them for now.
  - a) Keep them (an exception)
  - b) Move them to Map 21+ lists
  - c) Change the cards (you design)
- **Default:** b

**AUDIT1-1. Start locked while a cloud save loads** · Decide · Cloud · asked 2026-11-13
- Signed in, the front screen's Start waits until your cloud save has loaded, so fresh play can't be overwritten by it. On a stalled connection that wait has no end until the browser gives up (minutes). Unlock Start after 30 s and load the save later?
  - a) Keep waiting (as built).
  - b) Unlock after 30 s; a save that arrives later asks before replacing.
- **Default:** a

**SIDE2-1. Side bosses the list can't make hard enough** · Decide · Balance · asked 2026-11-13
- BPRO-1 in the hardest fight, 400 games: Eye of the Volcano 69% (target 36), Basalt Foundry 51% (target 40). WHATIF1 measured (b): Basalt Foundry falls to 31-33%, in band at its low edge. Eye of the Volcano doesn't change (its 10-card size, not K14, is the limit), so only (a) can fix it. Under SIDE2-2 (c) Basalt Foundry reads 39-41%.
  - a) Add one stronger NEW! card each (theme pick)
  - b) Let a side boss hold Carried cards at 2 copies
  - c) Leave them easy for now
- **Default:** a

**SIDE2-2. Thin side lists lock many side decks** · Decide · Balance · asked 2026-11-13
- With few own cards and K14 (Carried 1 copy each), many side decks have no room: 0-B-3, 2-A-6 and 14-A-5 can't be built; Clovermead, Lilypad Reach and The Canopy are stuck. Of 77 side fights in band: today 39 (mean gap 11.8); (a) 48 (9.4); (c) 47 (10.3); (a)+(c) 53 (7.9), 8 beyond 20, about 51 on fresh seeds. (a)+(c) builds 0-B-3 and 14-A-5 in band; 2-A-6 stays too hard. Bosses 10-A-5 and 18-A-9 still need SIDE2-4.
  - a) Carried cards up to 2 copies on side maps
  - b) More own cards on the thinnest lists
  - c) Smaller side-map decks
  - d) Keep the rules
  - e) Both a and c
- **Default:** e

**SIDE2-3. Re-price Chained now that chains soak damage?** · Decide · Balance · asked 2026-11-13
- ENG-RC1 made each chain 1 Armor that breaks as it soaks, worth about a Shield N that chainedMult doesn't count. Chained Binturong, the only Chained card, has been on no list since 11-02, so no road fight holds it: the 400-game road read of Basalt Foundry and Maps 0-20 is unchanged.
  - a) Re-price when a Chained card is back on a list
  - b) Re-price now (the chains as Shield N)
- **Default:** a

**SIDE2-4. Three side bosses stay too hard** · Decide · Balance · asked 2026-11-13
- Too hard today (boss band 30-49): The Old Bramble 0-B-4 22%, The Sunken Depths 10-A-5 17%, The Pale Desert 18-A-9 26%. With SIDE2-2 e (WHATIF3, two seed sets): Old Bramble in band as is (41%); Sunken Depths Health 16 to 13 gives 38% (no level works); Pale Desert level 4 to 3 gives 37% (or Shield 41 to 29). Level 3 makes the Old Bramble too easy, so no single rule fits all three. Also 2-A-6 (band 52-68): Health 17 to 8 gives 59-62%; no deck move works.
  - a) Lower their bramble Health (the Pale Desert: its Shield)
  - b) A lower enemy level for these three
  - c) Leave them hard
  - d) Mix: Old Bramble by SIDE2-2 a, Sunken Depths Health 11, Pale Desert level 3
  - e) With SIDE2-2 e: Old Bramble as is, Sunken Depths Health 13, Pale Desert level 3, 2-A-6 Health 8
- **Default:** e

**FX9-1. More cards fly to the Graveyard?** · Decide · UI · asked 2026-11-13
- A card you pitch now arcs into the Graveyard (note 7). Cards that get there another way (a field card used up, Feed, overdraw) still jump straight to the pile. Make those fly too?
  - a) Yes, every card flies there.
  - b) Pitches only (as built).
- **Default:** a

**UIFX1-1. Place entrances: full once a session** · Decide · UI · asked 2026-11-13
- The shop tent, Premium pavilion, Nest, Codex, Camp, Stomping Grounds and Inventory entrances play in full (0.8-0.9 s) on the first visit each session, then a 0.4 s short take (your 10-08 note: "instantly transit you"). A tap skips. Or play the full take every visit?
  - a) Full once a session (as built).
  - b) Full every visit.
- **Default:** a

**ENG-RC1-1. Ritual hides from the enemy only** · Confirm · Rules · asked 2026-11-13
- A Ritual unit (The Sixfold) can't be attacked or targeted by the enemy; swings into its slot go on to the bramble. Your own buffs and heals can still reach it. Confirm, or should it be out of reach for both sides?
  - a) Enemy only (as built).
  - b) Both sides.
- **Default:** a

**ENG-RC1-2. Chained N = N chains** · Confirm · Rules · asked 2026-11-13
- Chained Binturong (Chained 4) starts with 4 chains = 4 Armor; each point of a blow breaks one chain before Armor counts, so small hits still free it. The other reading: 1 chain = 1 Armor that breaks at N damage. Its budget (chainedMult) doesn't yet count the soak.
  - a) N chains (as built).
  - b) One chain, breaks at N.
- **Default:** a

**SIDE1-1. The Old Bramble: your 6 own cards, the limit is 3** · Decide · Balance · asked 2026-11-12
- You picked 6 own cards there (Ent, Elder Willow, Shimmerwing Stag, Strangler Vine, Thorn Shrike, Hedgehog Herbalist); a side map takes 3 and 1-3 skills. The list takes Ent (its reward), Elder Willow and Thorn Shrike: Fog, Delivery, Bleed. Strangler Vine has no source, so no player can own it; Hedgehog Herbalist is The Sunken Grove's reward; Shimmerwing Stag adds a 4th skill. Your flags are unchanged.
  - a) Keep Claude's three
  - b) You pick three in Map cards
  - c) Raise The Old Bramble's limit
- **Default:** a

**SIDE1-2. Three side-map rewards miss their map's theme** · Decide · Balance · asked 2026-11-12
- A fight's reward must stay on its list, so each takes an own-card slot and brings its skills: Hedgehog Herbalist (The Sunken Grove 5-A-4; a forest hedgehog you picked for The Old Bramble), Wound Reaver (The Aerie Vault 11-A-4; a volcanic lizard in the nests), Greenland Shark (The Ice Hollow 17-A-4; a deep-sea shark).
  - a) Phase B gives each fight a reward of its theme (Herbalist moves to The Old Bramble)
  - b) Keep them
- **Default:** a

**SIDE1-3. Do Flying, Tide and Nocturnal count toward 1-3 skills?** · Decide · Balance · asked 2026-11-12
- Phase A counts a side map's skills on its own cards, but not plain Flying, Tide, Diurnal, Nocturnal (the two-skill rule counts them half) or Baby cards. Counting them puts 7 side maps at 4-5 skills (The Old Bramble, Smugglers' Grotto, The Sunken Grove, The Glimmer Depths, The Aerie Vault, The Ice Hollow, Eye of the Volcano).
  - a) As built: not counted
  - b) Count them
  - c) Count them half
- **Default:** a

**SIDE1-4. Main maps: 1-3 skills too?** · Decide · Balance · asked 2026-11-12
- Every main map of 0-21 shows 4-14 skills on its own cards (8-10 cards each; Map 7 the most). docs/balance/card-power-2026-11-12.md names the odd card out on each. Strict 1-3 there means a card pass or new cards.
  - a) Side maps only for now
  - b) Main maps at most 5, Claude proposes swaps
  - c) Main maps 1-3 too
- **Default:** a

**DUNGEON1-1. Partial dungeon rewards: my reading of note 21** · Confirm · Group dungeon · asked 2026-11-12
- Your note: "%completed * 0.5 ... If only 1-3rd map completed, 0.25". Built: f = parts won / parts. All parts: full rewards. 1-3 parts won: f x 0.25. More, short of all (4 of 5): f x 0.5. So 4/5 pays 40%, 3/5 15%, 2/5 10%, 1/5 5%. The other reading of "1-3rd" is "a third or less" (f <= 1/3: x 0.25, else x 0.5: 3/5 would pay 30%). One table in bramblewood-coop.js (RUN_PAY_BANDS).
  - As built (1-3 parts: x 0.25)
  - A third or less: x 0.25, otherwise x 0.5
  - Other figures (say which)
- **Default:** As built (1-3 parts: x 0.25)

**DUNGEON1-2. A second multiplayer dungeon: the Mire Warren (Admin preview)** · Decide · Group dungeon · asked 2026-11-12
- To show the switcher and a room built from data, I added the Mire Warren: 3 parts in the Gnawed's swamp tunnels (frogs and shrews, rats and leeches, then the Mire Matriarch, a Gnawed Matriarch scaled as the Tidewarden is). Admin Mode only, no map spot, not tuned. Giving it a map number (data: mapNumber) adds its spot and opens it to players.
  - Keep as a preview
  - Place it on a map (say which)
  - Rename or retheme it
  - Remove it
- **Default:** Keep as a preview

**DUNGEON1-3. How the next part's enemies arrive** · Confirm · Group dungeon · asked 2026-11-12
- Built: 3-5 units (seeded) from the next part's deck, each with at least Wait 1 (a Wait-0 card too), every second one in the enemy's middle row, the boss first on the boss part; no On Spawn for them (they came during the free turns, as a daily dungeon's next bramble). The enemy's survivors stay. The CPU still plays only into its front row; its middle row fills from these arrivals.
  - As built
  - Wait-0 cards arrive ready
  - The CPU also plays into its middle row each turn
  - Clear the enemy's survivors between parts
- **Default:** As built

**UIFX2-1. Map vignette: the place's season or the calendar month** · Decide · Map · asked 2026-11-13
- Built (UIFX2, your 00:03 note): every map has a season or biome (Maps 0-1 spring, 2-3 coast, 4-5 summer, 6-7 autumn, 11 winter, 18 desert, 19-20 ash ...), with a change when you move between seasons, a travel beat and a light ambient. The map's edge tint used to follow the real calendar month (2026-10-07); it now follows the place, so a desert never wears November's autumn rim.
  - a) As built: the place's season.
  - b) The calendar month on spring / summer / autumn / winter maps, the place elsewhere.
  - c) The calendar month everywhere (the ambient stays by place).
- **Default:** a

**BAL43-1. Thistlewood 1-3 / 1-4 still too easy at 85 / 80** · Decide · Road · asked 2026-11-10
- Burrow Line 96% (target 85) and Sapper Hedge 94% (80), 200 games. Every legal deck from their lists reads 87-100%; the Shield is at the rule and their leader is hidden.
  - a) You add one slightly stronger Thistlewood common to 1-3 / 1-4; Claude retunes.
  - b) Raise their targets to about 93 / 88 (a warm-up map).
  - c) Leave them.
- **Default:** a

**PUFF1-1. A spore-puff card skill?** · Decide · Cards · asked 2026-11-12
- You asked for "maybe a puff cloud skill for cards". The dark lime puff now plays on Spore Cloud sleepers and Puffball Bombardier hits. A new skill would need pricing in the budget before any card gets it.
  - a) No: keep the puff a visual only.
  - b) Spore puff (attack): 50% to put the target to sleep for a round.
  - c) Spore puff (defence): when hit, the attacker gets Poison 1.
- **Default:** a

**SKIR3-1. Six main maps have no Guardian on their list** · Decide · Balance · asked 2026-11-12
- With your 11-12 picks, Maps 3, 10, 11, 15, 16 and 17 list no defender (Guardian / Bulwark / Taunt), which BAL9's JJ28 asks of Maps 1-19. Claude's Guardian adds (Grey Seal Bull on Map 10, Alpine Marmot on Map 11) had no room under NEW!.
  - a) You pick a Guardian on each (it may replace one of your picks)
  - b) Claude adds a carried Guardian where Carried has room
  - c) Drop JJ28
- **Default:** a

**SKIR3-2. Side maps cut to 3 own cards: 75 cards left play** · Decide · Balance · asked 2026-11-12
- Side maps now list 3 own cards (your 1-3). Their other own cards were on no other list, so 75 cards left play, among them side-map set pieces (Kraken Spawnling, Komodo Warlord, Permafrost Mammoth, Obsidian Lich). The full list is in docs/balance/skir3/drop-list-2026-11-12.md.
  - a) Keep
  - b) Move some to a main map's list (under its limits)
  - c) Raise the side-map NEW! default to 5
- **Default:** a

**SKIR3-3. Two challenge fights lost their boon's cards** · Decide · Balance · asked 2026-11-12
- 13-4 (Wild Rage) and 20-4 (Restless Dead) need half their deck to hold the boon's theme. Map 13's list has one Wild Rage card; no list up to Map 20 has an undead card. Both fights now play with the boon off; nothing else changed.
  - a) Keep the boon off
  - b) Add a theme card to the map
  - c) Give the fight another boon
- **Default:** a

**SKIR3-4. Over-limit picks pile up on Maps 18-21** · Decide · Balance · asked 2026-11-12
- A pick cut where it is NEW! but listed again later becomes NEW! on that later map. Maps 12-18 pushed cards forward, so Maps 19-21 dropped 3-5 of your picks each. One pick left play: Nightshade Moth (Map 17).
  - a) Keep
  - b) Raise NEW! on Maps 18-21 by 1-2
  - c) You choose the cuts on those maps
- **Default:** a

**SKIR3-5. Carried top-ups on four side maps** · Decide · Balance · asked 2026-11-12
- The Old Bramble, The Ice Hollow, The Pale Desert and Basalt Foundry could not build their fights from 3 own cards (K14 holds carried cards to 1 copy). Claude topped Carried up to 8; The Old Bramble got 5 of its old cards plus 3 Map 0 cards (House Cat, Earthworm, Farm Dog).
  - a) Keep
  - b) You pick the carried cards
- **Default:** a

**SKIR3-6. 15 first-clear cards changed** · Decide · Balance · asked 2026-11-12
- Fifteen fights paid a pack card that is no longer on its map's list. Each now pays the nearest card on that list (GD-5), as LISTFIX3 did. Examples: 10-3 Giant Clam (was Parrotfish), 13-4 Pine Marten (was Berserker Boar), 20-4 Vampire Roost (was Cinder Skeleton).
  - a) Keep
  - b) You choose per fight
- **Default:** a

**SKIR3-7. Maps 13, 16 and 19 miss the road curve on the 11-12 lists** · Decide · Balance · asked 2026-11-12
- After a night of deck and Shield moves, Map 13 has 2 of 8 fights in band (its fights are too easy: the list has few strong cards), Map 16 3 of 7 and Map 19 3 of 6 (too hard). Their Carried counts have room (13: 6 of 8, 16: 8 of 10, 19: 9 of 12).
  - a) Claude adds 1-2 carried cards there (admin adds, within Carried) and re-tunes
  - b) You re-pick those maps
  - c) Accept for now
- **Default:** a

**NET1-2. When to upgrade hosting plans** · Decide · Network · asked 2026-11-12
- After NET1 the first limits are Supabase Free's realtime (200 connections: about 200 players signed in at once) and Vercel Hobby's 100 GB a month (about 650 daily players at one release a day). Nothing is bought; this only sets the trigger. Limits quoted from memory; re-check before buying.
  - a) Supabase Pro near 150 players online; Vercel Pro near 80 GB a month.
  - b) Other thresholds.
- **Default:** a

**NET1-3. Next network steps** · Decide · Network · asked 2026-11-12
- Three changes would cut load further: open realtime only on the Friends, Arena and co-op screens; split index.html into cached files so a release doesn't re-download all 5 MB; let the server pick ghost opponents (a sign-in reads up to 3,000 rows).
  - a) Do all three next.
  - b) Pick some.
  - c) Later.
- **Default:** a

**LISTFIX3-1. New first-clear rewards for four fights** · Decide · Balance · asked 2026-11-11
- 5-2 paid Sphagnum Vole, a card you cut; it now pays Raft Spider, your Map 5 Yes card nearest it (Common, 1 Lumber, Wait 1, 3/8), already in 5-2's deck. No other Cure card is on your Map 5 picks (CONTENT3 C1 wanted one). Three rewards were off their map's new list (a first-clear card must be on it, GD-5): 1-4 Field Mouse -> Bramble Sprout, 7-2 Dung Beetle -> Fungus Gnat Cloud, 10-5 Kraken Spawnling -> Sea Bass.
  - a) Keep.
  - b) Name other cards.
- **Default:** a

**LISTFIX3-2. Cards that left play with your Map cards picks** · Decide · Balance · asked 2026-11-11
- These 17 were on a list before SKIR1 and are on none now, so no pack, fight or reward gives them: Raven Scout, Alpha Howler, Pelican Diver, Frost Hare Sprinter, Tidepool Trapper Crab, Lunar Howler, Lion's Mane Jelly, Supernova Jelly, Spitting Spider, Weaver Bird, Water Vole, Woodcock Lookout, Marsh Harrier, Cane Toad, Badger Stonemason, Prospector Mole, Nudibranch. The two jellyfish were your CONTENT7-1 wish.
  - a) Fine, they stay out.
  - b) Name the ones to place, and where.
- **Default:** a

**LISTFIX3-3. Map 16 lost its weak card** · Decide · Balance · asked 2026-11-11
- 16-5 and 16-6 got much harder once Dhole Runner left Map 16 (49% vs target 66; 31% vs target 60). That cut was mine (11-05, a second dhole on the list), not yours, and Map 16's list is still my suggestion. Putting it back returns both fights to their earlier decks (about 60% each).
  - a) Put Dhole Runner back on Map 16.
  - b) Allow 16-6's Shield 47 -> 0 instead (reads 49%).
  - c) Leave both fights hard.
- **Default:** a

**LISTFIX3-4. Two of your cuts still on lists you have not picked** · Decide · Balance · asked 2026-11-11
- You cut Caiman Hatchling (Maps 5 and 9) and Phoenix Fledgling (Maps 19 and 20-B) on 11-01. My suggestions still list Caiman on side map 5-A and Phoenix on Map 20. Removing them means re-fitting the fights that use them.
  - a) Take them off those lists too.
  - b) Keep them there.
- **Default:** a

**SKIR2-1. Keep SKIR2's list adds** · Decide · Balance · asked 2026-11-11
- No card stats changed. Rewards made obtainable: Sphagnum Vole (Map 5), Parrotfish, Coral Reef Shark (10), Gilded Roadwarden (15), Snow Ermine, Harbor Seal, Snow Bunting Archer (17). Guardians (JJ28): Grey Seal Bull (10), Shepherd (17), Marula Elephant (18), Stalactite Pill Bug (19). Fights: Planarian Splitter (7), Swift Fox, Tasmanian Devil, Bramblewood Lynx (13).
  - a) Keep.
  - b) Drop the ones you name.
- **Default:** a

**SKIR2-2. Caves & Alcoves needs a second weak card** · Decide · Balance · asked 2026-11-11
- 8-2 reads 66% (target 85) and 8-7 46% (target 60). Map 8's only weak card, Stalactite Pill Bug, is already in 5 of 8 fights, the most the rule allows. With it, 8-2 reads about 80%.
  - a) Allow the Pill Bug in 6 of Map 8's fights.
  - b) You add a weak Map 8 card.
  - c) Leave both.
- **Default:** a

**SKIR2-3. Fights no legal deck can fix** · Decide · Balance · asked 2026-11-11
- 2-1 (63%, target 90) and 2-2 (62%, target 80): every legal Pebble Beach deck reads about 60%. 17-8 (23%, target 40): its Walrus Icebreaker leader and the frost decide it; every deck reads 0-23%. Side 10-A-4 reads 0%.
  - a) Allow a Health or Shield change on these.
  - b) Leave them.
- **Default:** a

**SKIR2-4. First-clear cards missing from their fight** · Decide · Balance · asked 2026-11-11
- 27 of 50 fights that pay a first-clear pack card no longer field that card (SKIR1's rebuild could not see the table). Players win a card they never met in that fight.
  - a) Put each back in its fight in the next road pass.
  - b) Leave it.
- **Default:** a

**CONTENT19-1. Sea Bass: 3/6, not 3/7** · Decide · Cards · asked 2026-11-11
- You asked for a Sea Bass on Map 10. A Pack 2 card is priced at the pack's first map (Map 7), where 3/7 is over budget; 3/6 fits (20.8 of 21.5).
  - a) Keep 3/6.
  - b) 3/7, priced at Map 10 as an exception.
- **Default:** a

**PERF2-1. More effect savings (small look changes)** · Decide · Performance · asked 2026-11-11
- PERF2 cut a fight's main-thread time by 61% and effects by 76% with no visible change. Three further cuts change the look slightly: Auto-lower steps down twice (High to Low) instead of stopping at Medium; the card-name scroll becomes a PNG strip instead of SVG (an art change); card filter flashes and the dragon's blend layer become plain overlays.
  - a) None for now.
  - b) Auto-lower twice only.
  - c) All three.
- **Default:** b

**THEME8-1. When the Ice Hollow opens** · Decide · Maps · asked 2026-11-11
- The Ice Hollow (side map of Map 17, Wolfsbane Tundra) opens after Map 21 today. Opening it after Map 17 brings its monsters (Yeti Chieftain, Permafrost Mammoth, Beluga ...) into the Maps 0-20 road, so they would be tuned with it.
  - a) Keep: after Map 21.
  - b) After Map 17.
- **Default:** a

**THEME8-2. Monster leaders stay on their main fights** · Decide · Maps · asked 2026-11-11
- Some monsters THEME8 placed in side maps lead main fights today: Komodo Warlord (18-6), Yeti (19-6), Cave Warlord (20-5), Ancient Sloth Titan (20-9). The Caldera Wyrm costs Stone, so it can only lead the Volcano Lair boss as a SPECIAL leader.
  - a) Keep them as SPECIAL leaders there (not obtainable from those fights).
  - b) Side maps only; those fights get new leaders.
- **Default:** a

**GUIDE1-1. Claude Code hooks (needs your yes)** · Decide · Tools · asked 2026-11-11
- Three hooks in .claude/settings.json: check a .js file's syntax after each edit; block reading the huge generated files (cards.json, index.html, language packs) and print the jq / grep way instead; warn on edits to generated files. They save tokens and catch broken edits. It is a settings change, so I wait for you.
  - a) Add all three.
  - b) Only the syntax check.
  - c) None.
- **Default:** a

**SKIR1-1. K14 reads the new lists** · Decide · Balance · asked 2026-11-11
- K14 (carried cards 1 copy, 6 in all) took 'own card' from each card's old source map. Under the new lists Ashen Spurn had 2 own cards and Map 1 had 5. Now a card first listed on a map counts as that map's own.
  - a) Keep.
  - b) Revert, and re-place source maps card by card.
- **Default:** a

**SKIR1-2. Skirmish rewards on later lists** · Decide · Balance · asked 2026-11-11
- You picked some fight rewards for later maps (Terrier Pup, Cricket Drummer, Driftwood Crab, Golden Eagle Diver ...). Decks keep the rule that a reward appears only in its own fight (or a fight that already fielded it). This also leaves Map 13 with 10 usable cards.
  - a) Keep.
  - b) A later map's fights may use an earlier reward you listed there.
- **Default:** a

**SKIR1-3. Six cards over budget on their new map** · Decide · Balance · asked 2026-11-11
- Moray Ambusher, Raccoon Nightcrew (Smugglers' Grotto), Mudpuppy, Peat-cutter Vole (Map 5) and Planarian Splitter (Maps 4-5) are over budget where your lists put them; Termite Forager (Map 14) is borderline (100%). They wait on a pending list for your re-fit.
  - a) You re-fit them.
  - b) Claude fits them by the formula.
- **Default:** a

**SKIR1-4. Stone cards left Maps 0-20** · Decide · Balance · asked 2026-11-11
- 'No stone until Map 21+': the Malachite Golem (led 8-7 and 8-A-4) and the Pumice Beetle (19-3, 19-6) left their decks; those fights now lead with their new top card.
  - a) Keep.
  - b) Bring the golem back as an exception.
- **Default:** a

**SKIR1-5. Mix gaps the lists cannot fill** · Decide · Balance · asked 2026-11-11
- Map 0 has 2 Lumber-cost and 3 Wait cards; Maps 3, 7 and 11 one plain animal; Map 11 two no-Wait cards; Map 1 no usable status card; Map 18 no plain animal. Each map's decks show what its list holds.
  - a) Leave them.
  - b) Claude suggests 1-2 cards per gap.
- **Default:** a

**SKIR1-6. SKIR1's Lumber admin adds** · Decide · Balance · asked 2026-11-11
- Carried cards added for a second Lumber maker (no card's first map moved): Map 1 Hazel Coppice, Map 8 Pack Rat Looter and Bone Diviner, Map 9 Salvager Hermit Crab.
  - a) Keep.
  - b) Drop them.
- **Default:** a

**SKIR1-8. A card in more than half a map's fights** · Decide · Balance · asked 2026-11-11
- Rule used: no card in more than half a map's fights. Where a fight could not reach its band inside it (Coral Current's fillers, Map 20's boss ...), one more fight was allowed. Thin lists make the line tight.
  - a) Half, plus one where a fight needs it.
  - b) Strictly half; those fights stay off band.
- **Default:** a

**REF6-1. How the 100 reference decks are built** · Decide · Balance · asked 2026-11-11
- Each of the 100 simulated players' decks takes their cards in the order the map's optimised decks use them (fast). A true optimiser run per player is about 60 core-hours. Result today: the 100 decks are very close in strength (spread 0-5 points), so pack luck barely matters.
  - a) Keep the fast method.
  - b) Run true per-player optimisation overnight on GitHub's free runners.
- **Default:** a

**REF6-2. Rarity cap for reference decks** · Decide · Balance · asked 2026-11-11
- The cap would remove cards every player holds early (2 rare Otter Centurions from the starter, at Map 3 where the cap is Uncommon). Faction cards are already excluded.
  - a) No cap for reference decks (players really hold these).
  - b) Apply the cap.
- **Default:** a

**REF6-3. Which reference ladder the game deals** · Decide · Balance · asked 2026-11-11
- Admin "Reference (Random)" still deals the older 10-deck ladder. Since the 100 decks barely differ, 10 are enough.
  - a) Keep dealing the 10.
  - b) Deal from the 100.
- **Default:** a

**DESK2-1. Steam demo scope** · Decide · Desktop · asked 2026-11-11
- The desktop app now runs the game fully offline (single-player). A Steam demo needs a cut-off point.
  - a) Maps 0-5 and their side maps.
  - b) Maps 0-10.
  - c) Another cut (tell me).
- **Default:** a

**DESK2-2. Packs for guests on desktop** · Decide · Desktop · asked 2026-11-11
- Offline, a guest can't open Shop packs today ("Sign in to open packs"), because packs are server-checked.
  - a) Require Steam sign-in for packs (no change offline).
  - b) Allow offline pack opening for guests (local only, no cloud sync).
- **Default:** a

**DESK2-3. Mac build on Steam** · Decide · Desktop · asked 2026-11-11
- CI builds an ad-hoc signed Mac app (free). Apple notarisation needs a paid developer account (99 USD a year); without it, Mac players see a warning on first launch.
  - a) Ship Windows and Linux first; Mac later.
  - b) Ship the ad-hoc Mac build now.
  - c) Get the Apple account (you buy it; Claude never buys).
- **Default:** a

**DESK2-4. How builds reach Steam** · Decide · Desktop · asked 2026-11-11
- The GitHub workflow builds Windows, Mac and Linux on a desktop-v* tag.
  - a) You upload builds to Steam by hand for now.
  - b) Later, CI uploads to Steam (needs a Steam build account secret you add).
- **Default:** a

**SKILL9-1. Skill versions read under one family name** · Decide · Skills · asked 2026-11-11
- Today 133 skills reach Map 20; target under 80. Group look-alikes under one name, each keeping its own rule and price (no fight changes): Arrow (Ice/Fire Arrow, Venom Spit, Twin Shot, Spitfire, Archer), Keen Sense, Evasive, Daunt, Delivery (Milling, Scavenge, Driftwood), Venomous, Decay, Pounce, Progeny, Fletcher, Nocturnal, Shell, Immunity, Ambush (Trap). Saves 23.
  - a) Do it.
  - b) Keep today's names.
- **Default:** a

**SKILL9-2. Cull family** · Decide · Skills · asked 2026-11-11
- Predator, Executioner, Shatter and Siege each add damage against one kind of target, as Cull does. They become "Cull N – weaker / wounded / frozen / structures", rules and prices kept. Saves 4.
  - a) Merge.
  - b) Keep the four names.
- **Default:** a

**SKILL9-3. Tally family** · Decide · Skills · asked 2026-11-11
- Carnage, Tally, Requiem, Dirge, Onslaught, Riled, Almanac and Foe's Scarcity all read "while a count reaches N: +2/+2". They become "Tally N – what it counts"; rules kept, prices re-measured as one family later. Saves 7 (without it: 80 skills).
  - a) One family.
  - b) Merge only Carnage's versions.
- **Default:** a

**SKILL9-4. Heal family's name** · Decide · Skills · asked 2026-11-11
- Regenerate, Heal, Repair, Carrion and Herbalist all restore Health. One family, rules and prices kept. Saves 4.
  - a) Call it Heal (Earthworm reads "Heal 1 – self").
  - b) Call it Regenerate.
- **Default:** a

**SKILL9-5. Speed family's name** · Decide · Skills · asked 2026-11-11
- Quick is Speed 2; Speed, Haste, Slow and Fast Forward are all about when a unit acts. One family. Saves 4.
  - a) Call it Speed (Cottontail reads "Speed 2").
  - b) Keep the name Quick.
- **Default:** a

**SKILL9-6. Thrive family** · Decide · Skills · asked 2026-11-11
- Frost, Heat, Salt, Timbered, Bedrock, Crepuscular and Rainrunner all read "while a condition holds: +A/+H". They become "Thrive – condition". Diurnal and Nocturnal stay. Saves 5.
  - a) Merge.
  - b) Keep the seven names.
- **Default:** a

**SKILL9-7. Inflict family** · Decide · Skills · asked 2026-11-11
- Freeze, Confuse and Shock share one text: "Chance% to <status> the target". They become "Inflict – Freeze 25%"; statuses keep their names, rules and prices. Saves 1-2.
  - a) Merge.
  - b) Keep the names.
- **Default:** a

**SKILL9-8. Afflicted family** · Decide · Skills · asked 2026-11-11
- Purblind, Night-blind, Scatterbrained and Drunk are all a status the unit always has. They become "Afflicted – Blind / Blind at night / Confused / Tipsy", rules and prices kept. Saves 2-3.
  - a) Merge.
  - b) Keep the names.
- **Default:** a

**SKILL9-9. Four skill swaps, six skills off the road** · Decide · Skills · asked 2026-11-11
- Swaps: Tasmanian Devil Berserk→Rage, Yeti Scare→Armor, Ashbone Ghoul Remember→Undead, Dhole Matriarch drops Pack Leader (no Pack units before Map 21). Off the road: Sequestration, Meld, Pickpocket (cards you didn't pick); Gorge, Parasite, Rupture (one enemy-only deck). Saves 10; a few fights get re-measured.
  - a) Do all.
  - b) Keep them.
- **Default:** a

**SKILL9-10. Quarry Mole needs Stone on Map 8** · Decide · Skills · asked 2026-11-11
- Your Map 8 pick Quarry Mole gets Armor while holding 2+ Stone, which breaks "no Stone before Map 21".
  - a) It reads "Thrive – 3+ Lumber: Armor 1" and is re-fitted to the budget.
  - b) Move Quarry Mole past Map 20.
- **Default:** a

**BAL46-1. Morel Hollow 7-6 Morel Monarch a little easy** · Decide · Road · asked 2026-11-10
- The Morel Monarch boss reads 46.3% at 400 games (target 40, band 30-49). All 514 legal decks were screened; the current one is near the strongest, and Shield is already above the rule. In band, so not urgent.
  - a) Leave it (in band).
  - b) You add a stronger Morel card to 7-6's list; Claude retunes.
- **Default:** a

**BAL43-2. Redwood Deep 13-3 Antler Grove a little easy** · Decide · Road · asked 2026-11-10
- Antler Grove 88.5% (target 80, band top 88), 200 games. Its list allows only 15 legal decks; all read 90-98%, and no leader or Shield move helps.
  - a) You add a stronger Redwood card (a stag fits the name) to 13-3's list; Claude retunes.
  - b) Leave it (just over the band).
- **Default:** a

**BAL42-1. Glass Dunes 18-4 Sandstorm stays too easy** · Decide · Road · asked 2026-11-10
- Sandstorm 18-4 83% (target 62), 200 games, after BAL42's best move (was 85.5%). Every legal deck from its list with Sand Veil on (all 679) reads 80-100%; its Shield is at the rule.
  - a) You add stronger Desert cards to 18-4's list; Claude retunes.
  - b) Raise its target.
  - c) Leave it.
- **Default:** a

## Decided

**NET1-1. Apply the database speed-ups** · Decide · Network · asked 2026-11-12
- supabase/proposed/20261112_net1_scale.sql: 5 indexes, 19 security rules rewritten to check the player once per query (not once per row), 3 duplicate rules dropped, and card_overrides' updated_at set by the server clock (an admin with a slow clock is then never missed). No rows change. Say "apply it" to run it.
  - a) Apply it.
  - b) Not yet.
- **Default:** a

**PICKS1-1. Maps 0-11 over your card limits because of Claude's adds** · Decide · Balance · asked 2026-11-11 · decided 2026-11-12
- Claude's admin adds (32 cards on Maps 0-11, put on lists to keep road fights in band: UI47, SKIR2, LISTFIX3) count as Yes, so all 12 maps are over their NEW! limit and 7 over Carried. Without them, only Maps 0-3 and 8 are over, by 1 each. Pressing No on an admin add now sticks (it did not before).
  - a) Don't count Claude's adds in the limits; road unchanged.
  - b) Claude removes its adds where a map is over and re-fits those fights with deck swaps.
  - c) You press No on the adds you don't want; Claude re-fits after.
- **Default:** c

**BAL40-1. Glimmer Depths 8-A-3 stays too easy** · Decide · Road · asked 2026-11-10 · decided 2026-11-10
- Shard Gallery 8-A-3 58% (target 50), 200 games. Its deck has its Sky Ambush boon off (7 of the 10 cards it needs), so no deck move is legal, and its Shield is at the rule.
  - a) You add Sky Ambush cards to 8-A-3's list; Claude retunes.
  - b) Change its target.
  - c) Leave it.
- **Default:** a

**BAL39-1. Gator Hollow 5-A-2 and Hermit Row 2-3 stay off target** · Decide · Road · asked 2026-11-10 · decided 2026-11-10
- Every legal deck and leader read (200 games). Gator Hollow 5-A-2 74.5% (target 65): its deck has its Rising Tide boon off (4 Tide cards, needs 7), so no deck move is legal, and its Shield is at the rule. Hermit Row 2-3 60% (70): best of 66 legal decks 61.7 at 60 games.
  - a) You add Tide cards to 5-A-2's list and weaker cards to 2-3's; Claude retunes.
  - b) Change these targets.
  - c) Leave them.
- **Default:** a

**BAL37-1. Savanna 14-3 / 14-5 and the Sloth Titan boss 20-9 stay off target** · Decide · Road · asked 2026-11-10 · decided 2026-11-10
- Every legal deck and leader read (200 games): Savanna 14-3 70.5% (target 80; 178 decks, best 71.5), 14-5 61% (70; at Shield 0, was 57). The Ancient Sloth Titan 20-9 69.5% (50): with its Titans no deck reads under 66.7%; cutting both reaches 49.5% but a Magma Salamander would lead the boss. 20-9 decided by Claude (10:20): keep both Titans (a boss keeps its leaders) and leave it easy; 14-3 / 14-5 go with BAL35-2.
  - a) You add weaker cards to these lists; Claude retunes.
  - b) Lower these targets, or let 20-9 drop its Titans.
  - c) Leave them.
- **Default:** a

**BAL36-1. The Canopy 14-A-1 / 14-A-3 stay too hard** · Decide · Road · asked 2026-11-10 · decided 2026-11-10
- Every legal deck and leader read at Shield 0 (200 games): Sloth Boughs 14-A-1 69% (target 90; 90 legal decks, best pick 67.5), Dart Frogs 14-A-3 53.5% (70; 438 decks). Hoopoe Herald and Weaver Bird fill most slots; K14 caps the rest at 1.
  - a) You add weaker Canopy cards to these lists; Claude retunes.
  - b) Lower these targets.
  - c) Leave them.
- **Default:** a

**BAL35-1. Thistlewood 1-3 / 1-4 stay too easy** · Decide · Road · asked 2026-11-10
- Burrow Line 96% (target 70) and Sapper Hedge 94% (60), 200 games. Every legal deck of their lists reads 89-97%. Double bramble Health, Shield 6 or the Baron's rule change nothing; even Thistlewood's uncommons x4 read 79.5%. Map 1's commons cannot hold the Map 1 reference deck.
  - a) Lower their targets to about 85 / 80 (a warm-up map).
  - b) You add a stronger Thistlewood card for these two fights; Claude retunes.
  - c) Leave them easy.
- **Default:** a

**BAL35-2. Fights their own list cannot reach** · Decide · Road · asked 2026-11-10 · decided 2026-11-10
- Every legal deck, leader and Shield 0 read: Pebble Beach 2-1 59.5% (target 90), 2-2 62% (80); Savanna 14-1 56% (90), 14-6 56.5% (65); Basalt Foundry 19-A-3 55% (72.5), 19-A-7 18.5% (67.5), 19-A-8 23.5% (64); Old Bramble 0-B-1 72% (90), 0-B-2 62.5% (75). Their lists have no weak cards; 19-A-7 and the Old Bramble have one legal deck (K14).
  - a) You add weaker cards to these lists; Claude retunes.
  - b) Lower these targets.
  - c) Leave them (BAL21-1 / 26-2 / 27-2).
- **Default:** a

**BAL34-1. Dive cards are under budget now** · Decide · Cards · asked 2026-11-10
- Dive is repriced from the 1,000-fight measure: plain Dive -3.3, Dive 2 -1.7 (was 0). Puffin Diver (2/5, Map 3) drops from 66% to 58% of its budget and Harbor Seal (1/9, Map 14) from 63% to 56%. Both are well under. No stats were changed.
  - a) Raise both: Puffin 3/5 (75%), Seal 2/9 (71%).
  - b) Keep them as they are (they play weak, as the measure says).
  - c) Remove Dive from both.
- **Default:** b

**BAL34-2. 33 Maps 0-20 cards over two skills** · Decide · Skills · asked 2026-11-10
- With the editor's count everywhere (a light skill counts 0.5), 33 Maps 0-20 cards are over 2. 23 of them are new: two skills plus Flying or Tide (2.5). 10 were over before (3 or 3.5). List: docs/balance/bal34/budget-recheck-2026-11-10.json.
  - a) Allow 2.5 (a light skill on top of two); trim only cards at 3 or more.
  - b) Trim every card over 2.
  - c) Warning only, no card changes.
- **Default:** a

**ENG40-1. Hoard cards: whole-number values?** · Decide · Cards · asked 2026-11-09
- Hoard N is now +N/+N for every 3 Lumber. Both Hoard cards still hold the fractions from the old per-Lumber rule: Tax-Collector Teal Hoard 0.75 (65% of its budget) and The Magnate Duck Hoard 0.25 (89%). Both are in budget and their stats are unchanged. As fractions they read oddly and do almost nothing. Hoard 1 (+1/+1 every 3 Lumber) keeps both in budget with no stat change: Teal 66%, Duck 91%.
  - a) Both to Hoard 1 (no stat change).
  - b) Keep 0.75 and 0.25.
  - c) Teal Hoard 3 (+1/+1 a Lumber's worth, 76%), Duck Hoard 1.
- **Default:** a

**ENG40-2. Bulwark price after the gentler walls** · Decide · Balance · asked 2026-11-09
- Log Walls now grow half as fast: 0/4 at Levels 1-6, 0/5 at 7-9, 0/6 at 10 (was 0/8). BAL30 priced Bulwark 6.65 x N^0.47 from the measured 0/4 wall (6.16) times 1.08 for walls averaging 0/5.7 over Levels 1-10. They now average 0/4.5, so the same reasoning gives x1.03: 6.3. Cards on Maps 0-20 sit at Levels 0-5, where walls are 0/4 anyway.
  - a) Re-price to 6.3 x N^0.47.
  - b) Keep 6.65 x N^0.47.
- **Default:** a

**ENG39-3. Sunthroat Courier as plain Esprit +0/+1?** · Decide · Cards · asked 2026-11-09
- You chose b: write Sunthroat Courier as "esprit": {"v": 0, "hp": 1}. It plays the same, but the budget prices Esprit 0 as a whole Esprit, so its skill price rises from 1.1 to 3.37 (still within budget). The rule for this package is no price change, so it still reads {"v": null, "hp": 1}.
  - a) Keep it as it is.
  - b) Switch, and teach the budget that Esprit 0 costs only its Health part (no price change).
  - c) Switch and accept the new price.
- **Default:** b

**ENG39-2. A card with two shots** · Decide · Engine · asked 2026-11-09
- Arrow, Fire Arrow and the Bolts are one shot family now (type, form). A card key holds one version, so Rimefire Salamander (Fire Arrow 1 and Ice Arrow 1) keeps its Ice Arrow under the old key. It plays and prices the same; only the data shape differs.
  - a) Leave it (the second shot keeps its old key).
  - b) Let the family hold a list of shots (a format change).
- **Default:** a

**ENG39-1. Retire Tangleweed and Darksight for real?** · Decide · Engine · asked 2026-11-09
- DES2-3 merged every duplicate as a parameter with no fight or price change. Two proposals in the plan would change cards, so they are kinds for now: Tangleweed is Strangle {hold: bind} (plan: retire it; Weaver Bird to Confuse, Quicksand Queen to Web), Darksight is Keen Sense {sees: dark} (plan: retire it into Keen Sense, so 6 cards would also ignore Blind, Fog and Shadow).
  - a) Keep both as kinds (no change).
  - b) Retire both as planned (8 cards change; needs a balance check).
  - c) Retire Tangleweed only.
- **Default:** a

**BAL33-1. Dive costs more than its price** · Decide · Balance · asked 2026-11-09
- Measured on Flying and Tide carriers (400 paired fights): plain Dive -3.3 (price -1), Dive 2 -1.9 (price 0). Each point of N adds about 0.7, not 0.5. Puffin Diver and Harbor Seal are weaker than their budget says. Intervals about 1 point either way. docs/balance/bal33/dive-measure-2026-11-09.json.
  - a) Reprice: plain Dive -3, +0.75 a point of N.
  - b) Keep -1 + 0.5 N.
  - c) Measure again at 1,000 fights first.
- **Default:** c

**ENG38-1. Skills that name their target** · Decide · Engine · asked 2026-11-09
- All other target picks are random now (Reach a coin flip; ties random everywhere). Some skills' own text names who they hit: Healing and Herb Refinery (most wounded), Cure (most envenomed), Repair, Berries, Nursing, Rocket and Hype (most Attack), Grant (nearest), the bosses' Thistle Prick, Undertow, Root Grip, Lodge Repairs. Their ties are random; the rule stays.
  - a) Keep the named rules.
  - b) Make them random too (texts change).
- **Default:** a

**UI41-1. How many NEW! cards a map** · Decide · Map lists · asked 2026-11-09
- Today's target (THEME6-1, yours): 10 NEW! at Map 2, down to 8 at Map 20. Claude suggests fewer: 3 signature skills a map on 2 cards each, plus 2 plain bodies = 8. Maps 0-2: 10 (they teach the basics); Maps 3-20: 8. Your per-map number box overrides either.
  - a) 10 at Maps 0-2, 8 at Maps 3-20 (Claude).
  - b) Keep 10 falling to 8 (THEME6-1).
- **Default:** a

**UI39-1. Retire Cut / Keep?** · Decide · UI · asked 2026-11-09
- List cards in Map cards now carry two picking systems: the old ✂ Cut / Keep (with its '10/10 new, 5/5 carried' count) and the new Yes / No.
  - a) Retire Cut / Keep; Yes / No only.
  - b) Keep both.
- **Default:** a

**UI39-2. Old Carried / Unique pill** · Decide · UI · asked 2026-11-09
- A list card's old Carried / Unique pill can contradict the group it sits in (e.g. Box Turtle on Map 5 says 'Carried' inside NEW!).
  - a) Hide the old pill in this view.
  - b) Keep it.
- **Default:** a

**BAL32-1. Canon Poison price** · Decide · Balance · asked 2026-11-09
- The 800-fight run moves the anchor Poison from 2.38·N^0.98 to 2.72·N^0.805 (2.72 / 4.75 / 6.59 at N 1-3); Venomous follows. Three Maps 0-20 cards now read just over budget (Bee Sentry 1.02, Gallery Orb-weaver 1.00, Walrus Icebreaker 1.01), held for your card pass.
  - a) Accept the new Poison price.
  - b) Keep Poison fixed at its old price; Venomous the same.
- **Default:** a

**BAL32-2. Damage over time cheaper at N 2-3** · Decide · Balance · asked 2026-11-09
- On the mean over bodies, Decay, Desecrate, Toxin, Wither, Greater Poison, Strangle and Constrict were over-priced at N 2-3 (e.g. Toxin 10 → 6.1 at N2). Only Breach and Perforate are clearly under-priced (raised). BAL31's 'under-priced' reading used the best body.
  - a) Keep the mean-based prices (applied).
  - b) Only raise; never lower.
- **Default:** a

**BAL32-3. Hemorrhage price** · Decide · Balance · asked 2026-11-09
- Hemorrhage gains about 0 from bleeding allies in the deck (0.02), so its enabler price is 0. With Bleed on the same card it gains 2.11; times the 23% Bleed deck share that would be 0.49.
  - a) 0 (applied).
  - b) 0.49.
- **Default:** a

**UI38-1. Map 0-1 Carried pool is short** · Decide · UI · asked 2026-11-09
- Map 0 has no earlier main map, and Map 1 can only carry Map 0's 17 cards, so neither reaches 20 Carried prospects.
  - a) Leave them short.
  - b) Count Base / Tutorial cards as Carried there.
- **Default:** a

**UI38-2. Side-map cards in Prospects** · Decide · UI · asked 2026-11-09
- Cards on a map's own side-map lists are hidden from its Prospects, even when they fit or Claude picked them (e.g. archerfish on Map 5).
  - a) Keep hidden until side maps are designed.
  - b) Show them as NEW! candidates.
- **Default:** a

**UI38-3. Family cap on Claude's picks** · Decide · UI · asked 2026-11-09
- Proposed cards stop at 2 per animal family in a group. Claude's picks, Maybe cards and list cards ignore the cap (e.g. Map 5 has 3+ crocodiles).
  - a) Apply the cap to Claude's picks too.
  - b) Cap proposals only.
- **Default:** a

**BAL31-1. Budget rule: one price per skill** · Decide · Balance · asked 2026-11-08
- Two skills on one card are worth about the sum of their prices plus a flat +0.5 (73% of 357 pairs within 1 point). Per-skill pair terms predicted worse. Real combos (Guardian + defence, Swarm + Twin Strike, Poison + Pounce) and clashes (Reload + Sweep) are few.
  - a) One price per skill, mean over bodies, no pair table; flag combos by hand.
  - b) Also add +0.5 for a card's second skill.
  - c) Keep looking (phase 4, about 2 h).
- **Default:** a

**BAL31-2. On-hit rider prices** · Decide · Balance · asked 2026-11-08
- Damage-over-time riders are under-priced 1.5-3x (Bleed, Breach, Perforate, Decay, Toxin, Poison…). Arson, Sabotage, Pickpocket, Sleep, Stagger, Stun on Hit and Tangle barely change with N. Weaken, Stun on Hit, Tangle and Constrict are over-priced at N 2-3.
  - a) Re-price: raise damage over time, price the flat ones flat (feeds a BAL29-style update).
  - b) Re-measure at 800 fights with all bodies first (about 2.5 h).
  - c) Leave prices.
- **Default:** b

**BAL31-3. Price of enablers** · Decide · Balance · asked 2026-11-08
- Brittle, Hemorrhage, Disarm, Detonate, Pulverise, Expose, Web and Pry are worth under 1 point alone; they pay off only with a partner.
  - a) Price near zero.
  - b) Price at the gain they give their usual partner.
  - c) Price near zero, and flag the pair on the card budget.
- **Default:** c

**FIX10-1. Cormorant: over budget at Map 0** · Decide · Cards · asked 2026-11-08
- The Cormorant (3/7, Reach) is a Pack 1 card on the Gannet Cliffs list. Pack 1 drops from Map 0, so its budget is Map 0's: 17 against N 16.72 (ENG37 had written Map 3 by hand, where it fits). It is held off the budget check until you choose.
  - a) Trim it to 3/6 (16, fits Map 0).
  - b) Make it a Gannet Cliffs fight reward (Map 3; fits as it is).
  - c) Keep 3/7 over budget.
- **Default:** a

**UI37-1. Prospects: what counts as Carried** · Confirm · Map lists · asked 2026-11-08
- A card is Carried on a map when an earlier main map gives it: you flagged it Yes there, or you have not flagged it there and it is on that map's list today. A No there takes it away. Side-map lists and SPECIAL never count. Keep this rule?
  - a) Keep it.
  - b) Count only your Yes flags (unflagged list cards stop counting).
- **Default:** a

**BAL28-1. The Canopy Bower makes The Canopy harder** · Decide · Brambles · asked 2026-11-08
- Its +1/+2 goes to the CPU's own units: every Canopy deck is Rainforest / Savanna. After BAL28's retune (200 games; targets 90/80/70/60/40): as shipped 5.5/52/37/13/8.5%; Rainforest only +1/+3 13/73.5/54.5/17/22%; no ability 14.5/73.5/64/49/26%. No deck, leader or Shield move closes it.
  - a) The CPU's Bower has no ability on The Canopy; players keep the buff. Claude retunes.
  - b) Rainforest only, +1/+3 (CONTENT18-3 b).
  - c) Keep it; The Canopy stays hard.
- **Default:** a

**BAL28-2. 14-A-1 Dart Frogs cannot reach 90%** · Decide · Road · asked 2026-11-08
- Its list allows only 10 legal decks (BAL28 tried all): Hoopoe Herald, Weaver Bird and Pangolin Roller fill 11+ of 16 slots (K14 caps the rest at 1 each). Best: 5.5% with the Bower, 15.5% on a plain bramble.
  - a) You widen its list or its copy rules; Claude retunes.
  - b) Swap it with a later Canopy fight's slot.
  - c) Leave it.
- **Default:** a

**BAL29-1. Apply the skill re-price (groups A and B)?** · Decide · Skill prices · asked 2026-11-08
- From the skill ladder, at the mean worth (the unit the table already uses). Raise 23 skills (Delivery, Inspiring, Pickpocket, Almanac, Fork, Twin Strike...) and cut 11 (Recoil becomes a drawback, Weaken 2, Trap, Ambush, Nova...). On Maps 0-20, 10 cards would leave their budget and need a 1-2 point trim (4 of them Delivery cards). Context skills and skills changed since the measure are not touched.
  - a) Apply A and B, then refit the 10 cards.
  - b) Apply A only (9 cards to refit).
  - c) Wait for the re-measure of the changed skills.
- **Default:** a

**BAL29-2. Price skills at the mean or the best body?** · Decide · Skill prices · asked 2026-11-08
- The ladder reads two numbers. The mean (over all Attack/Health splits) matches today's table and canon. The best (the split that suits the skill most) is about 1.7x higher. Pricing at the best would push 42 Maps 0-20 cards over budget (21 today) and would mean re-pricing every skill. Shooters and poison read under on the mean but over on the best.
  - a) Keep the mean; show the best as a warning.
  - b) Move to the best.
  - c) Halfway between the two.
- **Default:** a

**CONTENT18-1. Shooters: one per element, on no map** · Confirm · Cards · asked 2026-11-08
- Nine ranged cards, one per element: five existing unused cards (Acorn-pelter Squirrel, Firefly Swarm, Icefletch Fox, Snapgun Shrimp, Archerfish) and four new Commons (Adder, Elephant, Fruit Bat, Glow-worm). Water, decay and magic have no Bolt skill, so those three shoot 1 damage of their element before they swing. Stone and metal get none: the engine treats them as physical.
  - a) Keep the nine as they are.
  - b) Add Water / Decay / Magic Bolt skills later (ENG) and move the three onto them.
  - c) Swap some cards.
- **Default:** a

**CONTENT18-2. Star paths are the Wildpaths** · Confirm · Progression · asked 2026-11-08
- No system was called star paths, so the card marks went on the Wildpaths (the three Skyrim-style trails from Map 21). Each trail has one card mark at its third step (15 points): The Root gives The Thistle Baron (Heroic), The Thorn the Ironmaw Warwolf (Epic), The Bloom the new Bumblebee Queen (Epic). The Codex pill says Star path.
  - a) Yes, the Wildpaths are the star paths.
  - b) Rename the Wildpaths to Star paths.
  - c) Star paths are something else: say what.
- **Default:** a

**CONTENT18-3. The Canopy Bower** · Confirm · Brambles · asked 2026-11-08
- The Canopy's new bramble: 26 Health, Epic; every Rainforest or Savanna unit its owner plays gets +1 Attack +2 Health. The Canopy's five fights defend it now (was the Acacia Kraal). Players get it after The Canopy's boss. Fields stay High Canopy, Spring Rain and Old Woods.
  - a) Rainforest and Savanna, +1/+2.
  - b) Rainforest only, +1/+3.
  - c) Other numbers.
- **Default:** a

**ENG37-1. Reach: which neighbour it strikes** · Confirm · Engine · asked 2026-11-08
- With nothing opposite, a Reach unit now strikes an enemy in the lane beside it instead of the bramble. When both neighbours hold a unit it strikes the one with less Health; a tie is a coin flip. Taunt still draws it.
  - a) Less Health first.
  - b) A coin flip always.
  - c) A Flyer first, then less Health.
- **Default:** a

**ENG37-2. Reach price after the rework** · Decide · Balance · asked 2026-11-08
- Measured after the rework: about 0 (-0.18, range -0.94 to 0.53); before it measured 0.52. Hitting a unit beside it instead of the bramble trades chip damage for board damage. The price is still 0.52; the Cormorant is fitted with it.
  - a) Keep 0.52 and re-measure on the flyer maps.
  - b) Price Reach at 0 (Reach cards get about half a point more budget).
- **Default:** a

**ENG37-3. The Gannet Cliffs Reach card: Cormorant** · Confirm · Cards · asked 2026-11-08
- A Common 3/7 Cormorant (cost 0, Wait 1, Reach only) holding a sharpened stick from its nest. A ground bird, so it answers the cliffs' Flyers. On the Gannet Cliffs list as a pack card. Art prompt ready; art not drawn yet.
  - a) Keep it.
  - b) Make it Uncommon (3/8).
  - c) A different animal (name it).
- **Default:** a

**ENG37-4. Shell after attacking: name and price** · Confirm · Engine · asked 2026-11-08
- The card reads "Shell 2: After it attacks, +2 Armor until the round ends." It is a Shell setting, not a new skill. A quick measure put it at about twice a plain Shell (it comes up every round it swings), so it costs 2.15 x Shell.
  - a) Keep the name Shell.
  - b) Call it Retreat N.
- **Default:** a

**ENG37-5. Armoured Shield: whose Shield counts** · Confirm · Engine · asked 2026-11-08
- Shield 4 with Armor 1 gives +1 Armor while any Shield is left on the unit, its own or one an ally gave it. It goes when the Shield breaks. Price: Armor's price x how long the Shield lasts (Shield 4 + Armor 1: +1.17).
  - a) Any Shield on it.
  - b) Only its own arrival Shield.
- **Default:** a

**DES2-1. Pressure (Kelp Mangroves)** · Decide · Design · asked 2026-11-08
- Your version (2 Armor-ignoring damage to every unit a rise, +1 Armor to everyone) kills swarms and tokens and, after two rises, leaves 1-2 Attack units dealing 0: fights stall and no deck owns it. Tuned: 1 damage a rise, at most 3 rises a fight, Armor only for Tide / Pressure units, deep water doubles it.
  - a) Tuned version.
  - b) Your version as written.
  - c) Park Pressure; Map 9 picks from the other candidates.
- **Default:** a

**DES2-2. Simpler card names, Maps 0-20** · Decide · Cards · asked 2026-11-08
- 76 cards on Maps 0-20 renamed to plain animals (Pyrenean Desman to Water Mole, Peregrine Stooper to Falcon, Mangrove Monitor to Mangrove Lizard ...); Tasmanian Devil moves to a later map. Ids stay; each rename re-keys the 12 language packs and art prompts. List in the skill plan, section 4.
  - a) Rename all as listed.
  - b) You strike the ones to keep, then rename the rest.
  - c) Keep the names.
- **Default:** b

**DES2-3. Duplicate skills** · Decide · Design · asked 2026-11-08
- 15 groups do nearly the same thing (many deaths: Requiem, Dirge, Carnage, Tally; many units: Muster, Beset, Throng ...), 158 cards. Exploit already is your Vulnerable (+1 a hit, a token used per hit): its tokens would read Vulnerable and the old Vulnerable action reads Shock.
  - a) Merge all 15 groups as parameters (ENG35) and rename Exploit to Vulnerable.
  - b) Only the word-for-word ones (Stockpile, Timber, Ice Arrow, Darksight, Tangleweed) and the Vulnerable name.
  - c) Leave them.
- **Default:** a

**DES1-1. Skills a side map teaches first** · Decide · Design · asked 2026-11-08
- Six skills show up on a side map before the main map that owns them (Rage, Web, Bulldoze, Herbalist, Ambush, Mighty). The new-skill count follows the main road only, so the main map still counts them as new.
  - a) Allow it: the side map is a preview; the main map keeps it as a signature.
  - b) One home per skill: move the side map's copy off (the side map gets its own 0-1 skill).
- **Default:** a

**DES1-2. What makes a skill a map's signature** · Decide · Design · asked 2026-11-08
- Today 17 of 21 main maps have no new skill on 2+ of their cards, so no strategy stands out. Proposed rule: a signature sits on at least 2 of the map's cards, one of them a card the player can win there. Fixed by adding carriers (skill edits or out-of-play cards), not new skills.
  - a) 2+ carriers, one winnable.
  - b) 3+ carriers.
  - c) One carrier is enough if it is a reward.
- **Default:** a

**DES1-3. Shooters for Maps 0-10** · Decide · Cards · asked 2026-11-08
- No main map before Eyrie Heights (Map 11) has a ranged unit on its list. Nine out-of-play shooters fit those maps by animal (Acorn-pelter Squirrel Map 0, Quill-flinger Porcupine Map 1, Shell-drop Gull Map 2, Electric Catfish Map 4, Reed-dart Bittern Map 5, ...), plus your Reach spear card for Gannet Cliffs.
  - a) Place one per map as proposed (re-fit by the budget, then a road measure).
  - b) Only the Reach card for now.
  - c) Leave ranged for later maps.
- **Default:** a

**BAL27-1. The Canopy: its bramble and its rain** · Decide · Road · asked 2026-11-08
- Not the level. The Canopy borrows Savanna Reaches' Acacia Kraal (first unit +3 Attack); a plain bramble lifts 14-A-2 30 -> 80%. Spring Rain (heal 2 a round) keeps its cheap walls (Hoopoe Herald 2/12) up: plain bramble, no fields: 14-A-1 0 -> 27.5%. No deck or Shield move helped. A fight can already pick its own bramble (as 0-4 does).
  - a) Its fights defend a plain bramble, then Claude re-tunes them.
  - b) a) and drop Spring Rain (High Canopy stays).
  - c) You re-tune its list (Hoopoe Herald); keep it a hard optional map.
- **Default:** a

**BAL27-2. Fights still more than 20 off** · Decide · Road · asked 2026-11-08
- Two tune rounds found no deck, leader or Shield move 2+ points nearer (200 games) for 14-6 56.5% (target 65), 5-4 64.5% (72) and 3-5 56% (66); the Old Bramble's 0-B-1 72% (90) and 0-B-2 62.5% (75) have none either. Already yours: 1-3, 1-4, 2-1, 14-1, 14-5, 19-A-7, 19-A-8, The Canopy.
  - a) Add them to BAL21-1's list: you re-tune cards or lists, Claude re-measures.
  - b) Leave them.
- **Default:** a

**BAL27-3. Gatorback Swamp retuned** · Confirm · Road · asked 2026-11-08
- BAL21 and BAL26 left Map 5 alone while you edited it. BAL27 retuned its decks (no card or list touched), 40 games: 5-1 82.5 -> 92.5%, 5-2 50 -> 75%, 5-3 45 -> 60%, 5-5 22.5 -> 62.5%, 5-7 20 -> 37.5% (Shield 15 -> 0). Map 5: 2 -> 5 of 7 in band.
  - a) Keep.
  - b) Undo the Map 5 changes (your edit is still coming).
- **Default:** a

**ENG36-1. Hoard: converted values or literal ones?** · Decide · Cards · asked 2026-11-08
- Hoard N now gives +N/+N for each Lumber you hold. To keep the two cards as strong as before (in stat points) they became Tax-Collector Teal Hoard 0.75 (was 1: +1 Attack a Lumber) and The Magnate Duck Hoard 0.25 (was 3: +1 Attack per 3 Lumber). The literal values (Teal 1, Duck 3) would make both much stronger (Duck +3/+3 a Lumber).
  - a) Keep the converted values (0.75, 0.25).
  - b) Use the literal values (1, 3) and re-check their budget.
- **Default:** a

**ENG36-2. Status Resist: minus 50 points** · Confirm · Engine · asked 2026-11-08
- Your rule "50% (if already 50% then 0%)" is built as: Resist takes 50 points off a status's chance to land. A sure status lands half the time; a 50% or rarer one (Stun on hit's 1 in 3, Paralyze) never lands. Weakness adds 50 points. Damage over time (Venom, Bleed, Burn ...): Resist halves each tick, rounded down.
  - a) Keep minus 50 points.
  - b) Halve the chance instead (1 in 3 becomes 1 in 6).
- **Default:** a

**ENG36-3. Summons at their summoner's level: the curve** · Confirm · Engine · asked 2026-11-08
- Summons now use the normal level curve. A Log Wall (0/4 at Level 1) is 0/5 at Levels 4-6, 0/7 at 7-9, 0/8 at Level 10. Your example said a Level 10 Bulwark wall is 0/5. Bulwark's price is now 6.65 x N^0.47 (BAL30, ENG33-4).
  - a) Keep the normal curve (0/8 at Level 10).
  - b) A gentler summon curve (about +1 Health per 4 levels: 0/5 at Level 10).
- **Default:** a

**CONTENT17-1. Place the 20 new Claude-pick cards?** · Decide · Cards · asked 2026-11-07
- 20 new cards are on no list yet. They include the yeti hunters (Yeti Tracker, Icefletch Fox, Yeti Snarer), the bog healers (Peat-smoke Shaman, Mossmother Newt), the Trident Caiman and 14 more. Each is within budget for its proposed map. Each map's Claude New section shows them under theme headings, so you can swap a theme in.
  - a) I place them from the Map cards window.
  - b) Claude puts each on its proposed map's list.
  - c) Keep them as suggestions only.
- **Default:** a

**CONTENT17-2. Existing picks over budget for their new map** · Decide · Balance · asked 2026-11-07
- 28 of the 250 existing cards Claude suggests would be over budget on the map they are suggested for. Most are 100-110% of N; the worst are the Pika Hoarder (126% on Gannet Cliffs) and the Subterraneaner (125%). The new cards are all within budget. No existing card was changed.
  - a) Re-fit a card by formula when you place it (the usual re-fit step).
  - b) Drop the over-budget cards from the picks.
  - c) Re-fit all 28 now.
- **Default:** a

**CONTENT17-3. Art for armed creatures** · Decide · Art · asked 2026-11-07
- The new prompts carry gear in the jaws or strapped on, and name it plainly: a three-pronged fishing fork, a rope, weighted cord, icicles in a strapped bundle. They avoid weapon words. Card names may still say Trident, Harpooner or Slingrat. The art is not drawn yet; it needs your computer.
  - a) Keep this wording.
  - b) Avoid weapon words in card names too (rename).
  - c) Allow some weapon words in prompts from Map 21 on.
- **Default:** a

**CONTENT17-4. Maps 21+: animals with gear and culture** · Decide · Design · asked 2026-11-07
- From Map 21: peoples with gear, like temple crocodiles, the yeti hunters and their yeti, and ice-arrow archers. About 1 card in 4 on a 21+ list would be ranged; on Maps 0-20 today it is 16 of 276. Concepts only: docs/design/armed-creatures-2026-11-07.md (18 cards).
  - a) Yes: about 1 in 4 ranged from Map 21.
  - b) Yes, but fewer ranged (about 1 in 6).
  - c) Not yet.
- **Default:** a

**ENG35-1. Fused skills: the parameter shape** · Confirm · Engine · asked 2026-11-07
- Each skill family is one key: true (default), a plain value ("almanac": 4), or named parts: "almanac": {"v": 4, "gives": {"evasive": true}}, "nocturnal": {"v": 2, "hp": 1}, "tide": {"gives": {"flood": ..., "ebb": ...}}. 53 families, 28 cards folded, fights and prices unchanged. Old keys still read.
  - a) Keep this shape.
  - b) Shorter arrays instead ("nocturnal": [2, 1]), harder to read.
- **Default:** a

**ENG35-2. Fuse more pairs that differ only by a setting?** · Decide · Engine · asked 2026-11-07
- Still separate skills: Delivery and Delivery every round; Arrow and Fire Arrow (damage type); Evolute, Evolute Alpha and Omega; Supreme and Supreme Tide. Fusing them changes keys the editor and pricing use, so it needs its own check.
  - a) Leave them separate.
  - b) Fuse Delivery / Delivery every round next.
  - c) Fuse all four pairs.
- **Default:** a

**ENG35-4. Shot riders: drop them from cards?** · Decide · Cards · asked 2026-11-07
- The editor now offers only Arrow, Fire Arrow and Fire Bolt; the nine riders (– bramble, – venom, – bleed on each) are hidden parameters. One card uses one: Balloon Archer, Arrow 2 – bramble (shoots the enemy bramble). It plays as before.
  - a) Keep Balloon Archer's rider.
  - b) Drop it: plain Arrow 2 (needs a budget re-check).
- **Default:** a

**ENG35-3. Sunthroat Courier: Esprit's Health part alone** · Confirm · Cards · asked 2026-11-07
- Sunthroat Courier has only Esprit's Health part (+0/+1 when a Kin ally arrives), no Attack part. The fold keeps it exactly: "esprit": {"v": null, "hp": 1}. It plays as before.
  - a) Keep as it is.
  - b) Make it plain Esprit +0/+1 ("esprit": {"v": 0, "hp": 1}), same play.
- **Default:** a

**ENG34-1. Reach and Boomerang swings: melee riders?** · Decide · Engine · asked 2026-11-07
- A Reach or Boomerang swing now counts as ranged for dodges: Canopy Cover dodges a Reach swing 1 in 2, as it does a Boomerang's. Claude kept a unit's own swing carrying its Bleed, Venom and other riders, ranged or not.
  - a) Keep: the swing always carries them.
  - b) A ranged swing carries only ranged effects (Fletcher), not Bleed / Venom.
- **Default:** a

**ENG34-2. Effects left on the swing only** · Decide · Engine · asked 2026-11-07
- Every melee hit (Cleave, prongs, Pounce, Ambush, Counterattack, a Parasite's feed) now carries Bleed, Venom, Daunt, Breach, Leech, Decay, Corrode, Toxin, Weaken, the status rolls and On Hit, and Thorns answers them. Kept on the swing alone: Wave, Dragon Lightning, Electricity, Chain Lightning, Swipe, Overwhelm, Momentum, Slash & Burn.
  - a) Keep those on the swing.
  - b) Every melee hit for those too.
- **Default:** a

**ENG34-3. Fletcher: which ranged hits** · Decide · Balance · asked 2026-11-07
- Fletcher and Weapon Master now add to every single-target ranged shot: arrows, bolts and spits, Spitfire, Snipe, a thrown banana, Rocket's main hit, Missile, Deal damage. Not area skills (Fireball, Earthquake, Tsunami, Skyfall). The Fletcher's Eye perk stays on Arrow.
  - a) Keep.
  - b) Area skills too.
  - c) Back to arrows only.
- **Default:** a

**ENG34-4. Edge-case classifications** · Confirm · Engine · asked 2026-11-07
- Charge: none (its action decides; Deal damage is ranged). Sentry: ranged (a skill hit). Gash and Render: melee, but no damage, so they carry nothing. Earthquake, Nova, Landslide, Tsunami: ranged areas. Immolation, Dynamite, Trap: none. Pounce still rolls the skill dodges (Canopy Cover, Mach 1 in 2).
  - a) Keep these.
  - b) Change some (say which).
- **Default:** a

**BAL25-1. Advanced opponents for card power** · Decide · Balance · asked 2026-11-07
- Decks of only top-40% cards held the median card at 19%, not 50. Claude picked a mix: 5 top-40% cards (one or two strong cards) + 15 from every Maps 0-20 card. Median now 47 (docs/balance/bal25/adv-calibration-2026-11-07.json).
  - a) Keep the mix.
  - b) 20 top-40% cards (median 19).
  - c) 20 cards from the top 75% (median 46.5).
- **Default:** a

**BAL25-2. Which cards are Faction-Starter** · Decide · Balance · asked 2026-11-07
- Faction-Starter (balancing only: Level 0, one rank below Starter) now covers the 22 Starter-rarity faction cards with no obtain map. Three starting faction cards keep their rarity: Otter Guard and Fleetfoot (Uncommon), Tunnel Ant (Rare). Faction-Starters still read -14 for their budget on average.
  - a) Keep the 22.
  - b) Add the three.
  - c) Make Faction-Starter weaker still in the fit.
- **Default:** a

**BAL25-3. Show "for its budget" on cards** · Decide · Balance · asked 2026-11-07
- Each card's power minus what its N predicts is now in the build (CARD_POWER.fb), not shown yet. N explains little of power (r2 0.10): Lumber 2 cards read -12, Lumber 3+ -18, Lumber 1 +7. Flagged, no card changed.
  - a) A UI package shows "For its budget +N" beside Power (editor, Map cards window).
  - b) It replaces Power.
  - c) Look at the budget's Lumber term first.
- **Default:** a

**BAL26-1. Brood moved Eyrie Heights** · Decide · Road · asked 2026-11-07
- ENG32's Brood (1/1 copies, no Swarm) weakened the Map reference of Maps 10-11 (Wolf Spider Mother x4): with the old Brood the Map 11 fights read 10-20 points higher (200 games). Guardian and Dive changed nothing there. BAL26 retuned the fights to the weaker reference.
  - a) Keep: the fights now fit the reference as it plays.
  - b) Swap Wolf Spider Mother out of the Map 10-11 reference deck, then re-tune those fights.
  - c) Re-price or re-tune Brood.
- **Default:** a

**BAL26-2. More fights their own list cannot fix** · Decide · Road · asked 2026-11-07
- No deck, leader or Shield move brought these 2+ points nearer (200 games): 7-6 66% (target 40), 19-A-3 55% (83), 18-A-9 21% (40), 19-A-10 25% (40), 20-A-1 72% (88), 2-2 64% (80), 14-2 70% (85), 2-A-5 51% (66).
  - a) Add them to BAL21-1's list: you re-tune cards or lists, Claude re-measures.
  - b) Leave them.
- **Default:** a

**ENG33-1. Smelly: what should it do?** · Decide · Skills · asked 2026-11-07
- Smelly is for animals that ward off predators by smell (skunk, stink bug, hoopoe). Stench already exists (-1 Attack tokens on enemies facing it), so Smelly should differ. a) Enemy units with more Attack than it won't swing at it; they hit a neighbour or the bramble. b) The enemy unit facing it has -N Attack while it faces it (an aura, nothing to wash off). c) A unit that kills or devours it is Nauseous and skips its next turn (pairs with Poisonous). Claude suggests a.
  - a) Predators won't attack it
  - b) -N Attack to the unit facing it
  - c) Its killer skips a turn

**ENG33-2. Undead on real undead: keep the comeback?** · Confirm · Skills · asked 2026-11-07
- Ordinary animals now have Thanatosis. Real undead (Cinder Skeleton, Ember Revenant; none on Maps 0-20) keep Undead. Claude kept its comeback (once, as a token) and added the undead status to the skill (heals hurt it, a cure makes it Bleed, greyed Health), so their budgets and the Restless Dead boon are unchanged. Or Undead could be the status only.
  - Keep: comeback + status
  - Status only (no comeback)

**ENG33-3. Thanatosis: Claude's calls** · Confirm · Skills · asked 2026-11-07
- While it plays dead it can't act and single-target swings, shots and skills can't find it (True Sight neither); skills that hit every unit still reach it, and at 0 again it dies for good. Its statuses are cleared so a tick can't finish it. Phoenix Mushrooms (a fungus) had Undead and got Thanatosis too. Priced 2.0. Also: Poison Bolt's label was "Venom", the counters' name now, so it reads "Venom Spit" (ENG9-3 had no "Spit").
  - Keep these
  - Untouchable while playing dead
  - Give Phoenix Mushrooms something else

**ENG33-4. Rename budget moves (Venomous, Bulwark)** · Confirm · Balance · asked 2026-11-07 · decided 2026-11-08
- The four old-Venomous cards now carry Venomous at the same N, which is priced a little lower: Platypus Spur 97.7% -> 94.2%, Water Shrew 91 -> 88.1, Banded Sea Krait 96.5 -> 93.1, Giant Water Bug 85.4 -> 81.7. Log Walls were priced 3.5 a wall: Bulwark 2 is unchanged (Ancient Sloth Titan 73%), Bulwark 1 is one wall (Muskrat Lodgekeeper 62.5% -> 53.1%). No card re-fitted.
  - Keep, no re-fit
  - Re-fit these cards
  - Walls 0/6 and Bulwark 1 gives two

**BAL24-1. When is a map's weak deck TOO STRONG?** · Decide · PRO fights · asked 2026-11-07
- N-SK gets TOO WEAK when the Map reference beats one of its PRO / BPRO decks over 85% (your rule). For N-WK I chose the mirror: TOO STRONG when it wins under 50% against a weak deck (a practice fight you lose more than you win). Today: 14-A-WK (28%) and 2-WK's WPRO-2 (45%).
  - a) Keep 50%.
  - b) 15% (the literal mirror of 85%; almost never fires).
  - c) 70%.
- **Default:** a

**UI29-1. Pack editor: marks only, or apply them live?** · Decide · Packs · asked 2026-11-07
- The 📦 Pack editor shows every pack, Starter, Base and the faction pools with CONTENT16's proposal. Your Cut, ✓ and ✂ marks stay in your browser; Copy my picks / Export all hand them to Claude, who folds them into the data. Should the editor later get an Apply button that writes a pack's adds and cuts to the live pack table (needs the per-pack exclusion list)?
  - a) Marks only; Claude folds them in.
  - b) Add Apply (live, admin only).
  - c) Decide after the first pass.
- **Default:** a

**ENG32-1. Dive: when it dives** · Confirm · Skills · asked 2026-11-07
- A diver now dives only when an enemy unit stands opposite it. With nothing opposite it swings at the bramble as usual, because diving would just lose a swing. If the unit opposite dies before the strike, the strike hits the bramble (+ N kept).
  - a) Keep as built.
  - b) Dive even with nothing opposite (a turn out of reach, then Attack + N at the bramble).
- **Default:** a

**ENG32-2. Dive's new price** · Decide · Balance · asked 2026-11-07
- Priced by the 4-round rule: diving loses a swing (-1.5), and the turn out of reach is now nearly even, because the enemy opposite hits your bramble instead (+0.5). Plain Dive -1, Dive N -1 + 0.5 N. Dive 2 (Puffin Diver, Harbor Seal) goes from 1.77 to 0, so both cards are now under budget.
  - a) Keep: Dive is a small drawback unless N is 2 or more.
  - b) Price plain Dive at 0 (+0.5 a point of N).
  - c) Measure it in the next balance run first.
- **Default:** c

**ENG32-3. Brood's copies: price and skills** · Confirm · Skills · asked 2026-11-07
- Brood tokens are now 1/1 copies with every skill of the parent except Brood, and they don't get Swarm. Price 3.2 a token (was 4.28; the old price included the token's Swarm). The copied skills are not priced again, the same as Offspring's and Bloom's copies.
  - a) Keep as built.
  - b) Also price the copied skills (the copy's skills x a share).
  - c) Copy keywords only, not triggers.
- **Default:** a

**CONTENT15-1. The two Loyal faction cards: keep?** · Confirm · Cards · asked 2026-11-07
- Built on Loyal, the Sworn Shieldbearer's (the stoat's) skill: on while any leader of your side is on the field. Oathsworn Legionary (Otter): Uncommon, 1 Lumber, Wait 1, 2/13, Loyal - {+1/+2, Armor 1}. Cobalt Talon Honour-guard (Hummingbird): Uncommon, 0 Lumber, Wait 1, 3/4, Flying, Loyal - {+2/+1, Quick}. 90% / 86% of budget at Map 5. The budget prices only the braces' skills, not Loyal's +A/+H (measured near 0). Faction pool; art not drawn.
  - a) Keep both.
  - b) Change names, stats or skills (say which).
- **Default:** a

**ENG30-1. Consecration and Desecration: how the grounds work** · Decide · Skills · asked 2026-11-07
- There was no Exalted ground yet, so I built both as side-wide grounds at each round start: Consecration N heals every unit on its side N (Undead are hurt); Desecration N deals N curse damage to every enemy unit, on top of Desecrate's cell curses. Several carriers: the largest N. Any of each on the field: both off, field-wide. Prices 3.5 / 5.9 a point.
  - a) Keep as built.
  - b) Ground under the carrier's own lane only (and cancel per lane).
  - c) Several carriers add up.
- **Default:** a

**CONTENT16-1. Pack zones: which maps each pack covers** · Decide · Packs · asked 2026-11-07
- Proposed Maps 0-7 (Hedgerow Pouch), 8-13 (Tidemire Chest), 14-20 (Highcrest Case); a submap counts from the map that unlocks it. Map 7 moves to the Pouch (the Chest is first sold on Map 8). The Case starts at 14, not 16: it is sold from Map 13 and the map-end pack turns gold at 14. Today: 0-6 / 7-13 / 14-20.
  - a) 0-7 / 8-13 / 14-20 (proposed).
  - b) 0-7 / 8-15 / 16-20.
  - c) Keep 0-6 / 7-13 / 14-20.
- **Default:** a

**CONTENT16-2. Add 20 basic cards to each pack** · Decide · Packs · asked 2026-11-07
- 20 simple, zone-themed cards per pack (60 in all), from the 370 cards nothing gives out today. All fit the budget at the pack's first map; 57 are met in no skirmish, so they become pack-only. Three await a source (Bog Shrew, Kelpborn Otter, Conger Eel). List and reasons: docs/pack-plan-2026-11-07.md.
  - a) Add all 60.
  - b) Add them; I'll prune in the Pack editor.
  - c) Not yet.
- **Default:** b

**CONTENT16-3. One card per achievement (5% upgrade discount later)** · Decide · Achievements · asked 2026-11-07
- Each of the 17 achievements gives one copy of its own card (Courier Pigeon for First Victory ... Thunder Lizard for Wyrmslayer), found nowhere else. These are the cards the 5% discount would tag. Today achievements give only random faction cards (8 of them).
  - a) All 17 as listed.
  - b) Only the 8 that already give faction cards.
  - c) Pick other cards.
- **Default:** a

**CONTENT16-4. Move off-theme pack cards** · Decide · Packs · asked 2026-11-07
- Tide Spirit (a water spirit, in the Case via the Volcano Lair) to the Chest; Gangrenous Leech, Snapper Hatchling, Caiman Hatchling (swamp cards in the Chest) to the Pouch; the Tasmanian Devil out of the Chest (map review: not a redwood animal; it stays an enemy card). Needs a per-pack exclusion list in the Pack editor.
  - a) All five.
  - b) The four moves; keep the Devil.
  - c) None.
- **Default:** b

**UI27-4. The new two-skill count everywhere?** · Decide · Skills · asked 2026-11-07
- Built in the card editor: each skill counts 1, a light one (Flying, Tide, Diurnal, Nocturnal, Crepuscular, Sun-shy, Night-blind, Purblind, plain form) 0.5; over 2 warns. The budget file's count (used by the balance tools and tests) still has the old rule: those four count 0, several of them 1. Move the new count there too?
  - a) Yes, one rule in bramblewood-budget.js (a balance package re-checks the cards).
  - b) Editor warning only.
- **Default:** a

**UI27-1. Check the build stamp pair before a push** · Decide · Tools · asked 2026-11-07
- The Update loop came from deploys whose version.json was from another build than index.html (8 of the last 30 main commits). The game now copes (Update loads a fresh URL and won't ask twice), and tests/ui27 fails on a mismatched pair. Should merge_pkg.sh and the release steps also stop a push when the pair differs?
  - a) Yes, add the check to merge_pkg.sh and release.md.
  - b) The test is enough.
- **Default:** a

**UI27-2. Budget heading compares B, not Base** · Confirm · UI · asked 2026-11-07
- Your example read "B = 13.8 < 16.2 = N"; 13.8 was Base, which is always under N at Level 1. Built: the heading compares the card's B (its stats with S, the rule's left side) with N: "Within budget, B = 12.9 < 16.2 = N". Base is in the heading's hover.
  - a) As built.
  - b) Show Base in the heading, as in the example.
- **Default:** a

**UI27-3. Four gated skills stay ?** · Confirm · Skills · asked 2026-11-07
- Un-gated (UI25-1 b): Nocturnal, Tide, Evasive, Delivery, Diurnal, Taunt, Inspiring, Esprit, Crepuscular, True Sight, Reach, Chrysalis. Frostbite, Fire Arrow, Molting and Stem stay ?: their early cards can't be owned (UI25's count included unobtainable cards). Sonar and Keen Sense keep ENG28's gate unless you own a card with them.
  - a) As built.
  - b) Un-gate those four too.
- **Default:** a

**UI25-1. Skills shown as ? on cards you already own** · Pick · UI · asked 2026-11-07
- Boomerang no longer shows ? (Otter Centurion, a Map 0 card). Other gated skills sit on cards you can own before their unlock map: Nocturnal (21 cards), Tide (57), Evasive (14), Delivery (8), Diurnal (4), Frostbite (4), Taunt (3), Inspiring (3), Esprit (3), Crepuscular (2), Sonar (3), True Sight (2), Fire Arrow (2), Reach, Molting, Stem, Chrysalis. Un-gate which?
  - a) Keep all gates.
  - b) Un-gate every skill on a card the player can own earlier.
  - c) Un-gate only the common ones (Tide, Nocturnal, Evasive, Delivery).
- **Default:** a

**CONTENT14-1. The two natural leaders: keep?** · Confirm · Cards · asked 2026-11-07
- Legate of Rivergate (Otter): Rare, 1 Lumber, Wait 1, 2/9, Natural Leader + Armor 1 + Inspiring 1, 96% of budget. Gold-throat Elder (Hummingbird): Rare, 1 Lumber, Wait 1, 3/7, Natural Leader + Flying + Esprit 1, 96%. Both in the faction pool; art not drawn yet.
  - a) Keep both.
  - b) Change names, stats or skills (say which).
- **Default:** a

**CONTENT14-2. The first Rare slot: which leader, and the hold before it** · Confirm · Cards · asked 2026-11-07
- The first Rare step of the faction pattern (Map 14+) gives your side's leader. Side "both": the side you hold more faction cards of, ties to Otters. Until that step neither leader comes from a faction pack, a random faction reward or Faction Growth, so the slot really is the first. After it, both are ordinary pool cards.
  - a) Keep as built.
  - b) "Both" gets both leaders (two Rare slots).
  - c) No hold: packs may give a leader earlier.
- **Default:** a

**ENG29-1. Guardian and dodges: the edge cases** · Decide · Battle rules · asked 2026-11-07
- Your rule is built: the Guardian takes the attempt; the ally's dodges don't roll, the Guardian's own do. Edge cases: the attacker's own Blind or dark miss still rolls first (no step-in then). Field misses (fog, sand, ash, ice) and Smoke roll against the Guardian. Guardian's price is unchanged: it now loses value beside dodgy allies and gains it with its own dodge.
  - a) As built.
  - b) Blind / dark misses also roll after the step-in.
- **Default:** a

**CONTENT13-1. The Drill Grounds: deck rules and level** · Confirm · Map · asked 2026-11-07
- The admin-only Drill Grounds hold two faction-pure decks (Otter, Hummingbird), 20 cards, at most 6 different and 4 copies. K14's one-copy rule for non-map cards can't hold for a faction-only deck, and the road's rarity ladder isn't applied (a Royal Guard, two Choirmothers). Both fight at a fixed Level 1, the optimiser's level. Keep?
  - a) Keep: rules waived there, Level 1.
  - b) Keep the decks, another level (say which).
  - c) Cap them at Uncommon and rebuild.
- **Default:** a

**BAL21-1. Fights their own list cannot fix** · Decide · Road · asked 2026-11-07
- No deck, leader or Shield move from the fight's list brought these 2+ points nearer (200 games): 1-3 / 1-4 Thistlewood 95% (targets 70 / 60), 2-1 57% (90), 14-1 60% (90), 14-5 41% (70), Basalt Foundry 19-A-7 19% / 19-A-8 24% (68 / 64), The Canopy 0-35% (BAL20-1).
  - a) You re-tune those cards or lists; Claude re-measures.
  - b) Leave them.
- **Default:** a

**BAL21-2. Two PRO decks stay easy** · Decide · PRO fights · asked 2026-11-07
- 7-PRO-4 (Map reference 90%) and 20-A-PRO-2 (97.5%): no 1-2 copy swap in their pool keeps them 10 copies apart from the map's other strong decks. The other four easy PROs are now 75-81% (2-B-PRO-4 85% at 200 games).
  - a) Drop the two to replaced.
  - b) Keep them.
  - c) A fresh BAL16 search for Maps 7 and 20-A.
- **Default:** a

**BAL21-3. 7-A-SK's Silver Minnow deck** · Decide · Reference decks · asked 2026-11-07
- Not a wrong-map pick: it is the Mycelium Deep's own ladder deck 3 of 10. Garden Snail is on that map's list; Silver Minnow is a Base card every player holds. The ladder samples the map-true pool, which holds every Base card, so weak ladder decks look unlike the road deck.
  - a) Keep the rule.
  - b) Ladder decks only from the map's list plus the road deck's cards (rebuild the ladders).
- **Default:** a

**BAL21-4. Frost freezing on every hit** · Decide · Engine · asked 2026-11-07
- 17-PRO-2 was a wall for Reference-2 before ENG27/28 too (7.5%). Of ENG28's rules only frost moves it: with no Freeze per frost hit it reads 17% instead of 8% (200 games); fire, poison and darkness change nothing. Its deck is retuned (21%).
  - a) Keep ENG28's frost rule.
  - b) Frost freezes 1 hit in 2.
- **Default:** a

**BAL21-5. Map reference or progression decks** · Decide · Road · asked 2026-11-07
- The road is tuned on the Map reference. The five progression decks disagree on some fights: 6-5, 11-6, 14-5, 18-6, 20-8 read 32-44% for them (Map reference 42-75%); 1-3, 1-4, 0-3 read 94-100%.
  - a) Keep tuning on the Map reference.
  - b) Tune on the mean of both.
- **Default:** a

**UI24-1. Editor Phylum: read only or a dropdown** · Decide · UI · asked 2026-11-07
- Built as asked: Phylum and Type are separate fields, named as the card preview names them (Rodentia, Beast). The Phylum is worked out from the Type and is read only. Alternative: a Phylum dropdown that narrows the Type list (fewer choices, one more click).
  - a) Read only (as built).
  - b) A Phylum dropdown that narrows the Type list.
- **Default:** a

**UI24-2. Card power numbers are from 2026-10-19** · Decide · UI · asked 2026-11-07
- The editor reads docs/balance/card-balance.json, whose last run is 2026-10-19, before the card pass and the ENG27-28 rule changes. The date shows next to every number. Run the new card power test (BAL21) before you trust it.
  - a) Wait for BAL21's new run.
  - b) Re-run the old tool now.
- **Default:** a

**ENG28-1. Burn: +1 a fire hit, stacking** · Decide · Battle rules · asked 2026-11-07
- Your rule: fire damage plus 1 Burn. Built: each fire hit from a unit adds 1 Burn; Burn stacks; each counter is 1 fire at a round's start, then falls off. Before (ENG20-1): Burning was set to 2 rounds, refreshed, never stacked. One hit now burns 1 round (was 2); three hits burn 3 (was 2).
  - a) As built (+1 a hit, stacking).
  - b) Back to 2 rounds, refreshed.
- **Default:** a

**ENG28-2. Frost: a Freeze counter on every frost hit** · Decide · Battle rules · asked 2026-11-07
- Your rule: frost the same pattern. Built: a unit's frost hit (swing, Ice Arrow, Ice spit, a skill) lays 1 Freeze counter (the unit skips that round; it melts at the round's end). Not stacked, not on cold-resistant units; field cold and Hail lay none. Ice Arrow and Ice were 1 in 2, now always, so a unit shot every round is held every round.
  - a) As built.
  - b) Shots keep 1 in 2; swings and skills always.
  - c) Not on a unit that was frozen last round.
- **Default:** a

**ENG28-3. Darkness and shots: the swing's rule** · Decide · Battle rules · asked 2026-11-07
- Built: a shot (Arrow and every arrow-like, the spits, Spitfire, Snipe) misses in the dark as the shooter's swing would: Darkness 1 in 4, Pitch Black 1 in 2, Absolute all; Darksight, Nocturnal, True Strike and an Illuminate light see. Keen Sense and Sonar never miss a shot. Seeded; a lit fight rolls nothing. The 50% fallback was not needed.
  - a) As built.
  - b) A flat 1 in 2 for every dark level.
- **Default:** a

**ENG28-4. Mulligan and Offspring: names and Offspring's price** · Decide · Skills · asked 2026-11-07
- Both built, on no card. Mulligan (-0.1, your price). Offspring N: N copies at half Attack and Health (rounded down), Wait 1, no Offspring. Priced as a share of a second body on the stat terms, like Bloom: 0.5 x 0.85 (a free cell) x 0.75 (Waits a round) = +32% a copy. Not measured.
  - a) Keep the names and the price.
  - b) Rename (say the names).
  - c) Measure Offspring on a carrier first.
- **Default:** a

**ENG28-5. Default pips: the opt-outs** · Decide · Display · asked 2026-11-07
- Built: every skill without a pip of its own gets one (icon, number, its text on hover); Poison Barbs is the first. Opted out: Mulligan (acts before the board exists), Leader (its ring), Archer Style (a look), Hatchling and Fodder (the Hatchling chip). Skills with their own pip keep their rules (spent Pounce, Tide off its map).
  - a) As built.
  - b) Name more opt-outs.
- **Default:** a

**ENG28-6. Hover: the printed card** · Decide · Display · asked 2026-11-07
- Built: a unit's hover shows its printed card (stats at its level, every skill); the live Attack and Health sit in a row under it when they differ. A spent one-shot (Rocket, Fireball, Meteor, Chilli, Delivery, On Ready triggers) stays, struck, tagged used. A skill lost another way (Sequester, a broken skill) is struck without the tag; Irradiation keeps its own list.
  - a) As built.
- **Default:** a

**ENG28-7. Sonar and Keen Sense: when they open** · Decide · Display · asked 2026-11-07
- Built: both read "?" until Map 8 (the first main map with its own Darkness) or until the player enters any dark map or sub-map sooner (Smugglers' Grotto). In a fight their pips show only while it is dark (its own Darkness, or a Cast Darkness unit standing).
  - a) As built.
- **Default:** a

**ENG27-1. Arrows at Speed 0: after the swings** · Decide · Skills · asked 2026-11-06
- Owner: arrows are Speed 0, "slower than default", and a plain swing is already 0. Built: inside Speed 0 an arrow goes after every swing (Slow's tie rule). Bolts are 1, Blitz 10, Quick 2 on the swing. A unit with an arrow and a bolt fires all its shots at 1.
  - a) As built.
  - b) Plain swings move to Speed 1 (arrows 0, bolts 2).
- **Default:** a

**ENG27-2. Unfortify: Vulnerable on the bramble** · Decide · Skills · asked 2026-11-06
- The unit status called Vulnerable is Shocked (x1.5). For the bramble, Vulnerable N is flat: each hit that reaches it deals N more. Unfortify's parts: Vulnerable N, -N Health; bare Unfortify is Vulnerable 1. Fortify gained Armor N. Priced: Armor 2.83 a point, Unfortify -2.83.
  - a) As built.
  - b) Bramble Vulnerable as x1.5 too.
- **Default:** a

**ENG27-3. Mach and Anti-air: the edge cases** · Decide · Skills · asked 2026-11-06
- Built: Reach and a thrown Boomerang count as ranged (miss Mach 1 in 2). An Anti-air unit, when attacked, is a Flyer (1), not Mach. Its swing at a ground unit does nothing; through an empty column it hits the bramble. Webbed, Pinned, Bound, diving, High Canopy or Ashy: Mach dodges nothing.
  - a) As built.
  - b) Anti-air also dodges like Mach (level 2 when attacked).
- **Default:** a

**ENG27-4. Hype, Grant, Encore: how they pick** · Decide · Skills · asked 2026-11-06
- Hype N: on play, the N Ready allies with the most Attack act at once (arriving mid-combat: a Fast Forward turn). Grant {skill} N: the N nearest allies, for the fight; a granted On Play does not fire. Encore: once a round; braces are Kill or Bloom's field conditions (Night, Tide, Wind...).
  - a) As built.
  - b) Hype picks the adjacent allies instead.
- **Default:** a

**ENG27-5. Item 24: +3 first unit reads +1?** · Decide · Brambles · asked 2026-11-06
- Not reproduced. Every bramble ability is flat (castleLeveled adds only Health; ENG24-1). Plains Terrace gives +3 in the engine, on 0-4 at Lv 0, in its texts and on the live main build. +1 was the value before ENG24 (11-04). Where did you see +1 (which screen, map, bramble)? A cached old page would show it.
  - a) Tell me where; I fix it.
  - b) It was an old cached page; nothing to do.
- **Default:** a

**ENG27-6. Blitz, Mach, Anti-air priced by the canon tool** · Decide · Budget · asked 2026-11-06
- Canon tool, bramble 15, 200 fights, stat yardstick: Blitz 1.44 [0.87, 2.10], Mach 5.74 [4.21, 8.27], Anti-air -5.02 [-7.32, -3.45]. Set in skill-costs.json (Mach as S, Flying-like). Inspiring 1 re-measured at +1 a token: 3.8 (was 5.43 at +2). On no card but Inspiring's.
  - a) Use the measures.
  - b) Logic prices.
- **Default:** a

**ENG27-7. Inspiring cards after +1 a token** · Decide · Budget · asked 2026-11-06
- Inspiration is +1 Attack a token now. Inspiring 1's price 5.43 -> 3.8 (measured). Cricket Drummer, Meerkat Wayfarer, Otter Flag-Bearer and the other Inspiring cards get budget back; no stats changed.
  - a) Re-fit them in the next balance package.
  - b) Leave them under budget.
- **Default:** a

**ENG27-8. Bare Crepuscular's price** · Decide · Budget · asked 2026-11-06
- Built: a bare Crepuscular is +1/+0 by day, +0/+1 at night (your ENG23-1). The budget still prices the bare flag at +0/+1 at night: its line is in bramblewood-budget.js (crepPartsOf), outside this package. No card carries a bare Crepuscular, so nothing moves today.
  - a) Change that budget line next package.
  - b) Leave it.
- **Default:** a

**ENG27-9. Where the Crimson Wing Drumcaller is earned** · Decide · Cards · asked 2026-11-06
- The Hype card: Crimson Wing Drumcaller, Sunfeather hummingbird, Uncommon, 1 Lumber, Wait 1, 3/6, Flying + Hype 1, 96% of budget. In no pack, on no map; art prompt written (docs/art-style-prompts.md).
  - a) A Sunfeather (hummingbird) faction pack.
  - b) A skirmish reward on a hummingbird map.
  - c) Keep it out until the art lands.
- **Default:** c

**ENG27-10. Where the two new brambles are earned** · Decide · Brambles · asked 2026-11-06
- Whetstone Rise (every unit you play +1 Attack) and Mossbed Hollow (+3 Health), 22 Health, Rare, open to everyone, on no road fight, as Banner Knoll.
  - a) Boss unlocks on two maps you name.
  - b) Keep them open to everyone.
- **Default:** b

**PVP1-1. The Old Shell as a PvP leader** · Decide · Balance · asked 2026-11-06
- Building the 30 PvP test decks, The Old Shell won the leader search on 14 of 30, including all three decks over 70% against the field. Its decks average 58.5%. Also: the seeded stranger Ashfall Legion breaks the copy cap (Magma Salamander x3, limit 2).
  - a) You re-tune The Old Shell in the editor.
  - b) Claude caps it for PvP only (e.g. not a PvP leader).
  - c) Leave it; watch real PvP results.
- **Default:** c

**UI23-1. The map list on a fresh account (item 40)** · Decide · Map · asked 2026-11-06
- The map list and the World button stay hidden until the world opens: Map 0's reward fight won, or any fight past Map 0 and the Tutorial. That is your 10-12 call ("otherwise its hidden till then"), kept on 10-22. So a fresh Thistlewood shows no list. Show it from the start?
  - a) Keep it hidden until the world opens.
  - b) Show the list from the start.
  - c) Show the list after Tutorial II; keep the World button gated.
- **Default:** c

**BAL20-1. The Canopy is still a wall** · Decide · Map lists · asked 2026-11-06
- Not the level: the enemy's Lv 4 is the Map 18 schedule (reference 3.54); at the reference's level it gains 0-6 points. Not the leaders. The cause: its list (cheap Hoopoe Herald 2/12, Weaver Bird 3/6 Tangle, Pangolin Roller) under K14, plus Acacia Kraal. A plain bramble lifts 14-A-2/3 to 66-81%; 14-A-1 and 14-A-5 stay under 10% even then. Fights now 0-28.5% (targets 40-90).
  - a) You re-tune those cards or the list; Claude re-measures.
  - b) The Canopy defends a plainer bramble.
  - c) Leave it a hard optional side map.
- **Default:** a

**BAL20-2. Savanna boss now easier than its elites** · Decide · Road · asked 2026-11-06
- 14-8 The Savanna Warlord went 23% -> 54.5% (target 40) with Acacia Giraffe as its leader: nearer its target, but easier than 14-5 to 14-7 (25-45%). No deck or Shield move on the list brings it back down; the elites are walled by Acacia Kraal.
  - a) Keep it (nearer the target).
  - b) Put the Dust Hyena leader back (23%).
- **Default:** a

**ENG26-1. Bloom grows stronger: how copies are counted** · Decide · Skills · asked 2026-11-06
- Built: each bloom that lands for a side in a fight adds 1 to that side's count; the Nth copy gets +N/+N. Pond Algae 1/7: first copy 2/8, next 3/9 (your example). The side's Bloom units share the count. A bloom waiting for room does not count. Each fight starts at 0.
  - a) Per side, per fight (built).
  - b) Per Bloom unit: each unit's own 1st, 2nd copy.
- **Default:** a

**ENG26-2. Undead: heals hurt, cures bleed** · Decide · Skills · asked 2026-11-06
- Built: Undead = species or subtype Undead, or back as a token by its Undead skill (not Changelings). A heal deals its amount as damage, even at full Health; its own Regeneration still heals (Obsidian Lich). A cure or cleanse that would take something off gives Bleed instead: the cure's N (Cure 2: Bleed 2), 1 for Renewal or a Cleanse with no number. Nothing to take off: nothing happens.
  - a) As built.
  - b) Always Bleed 1.
  - c) Its own Regeneration hurts too.
- **Default:** a

**ENG26-3. Bloom's price after it escalates** · Decide · Budget · asked 2026-11-06
- Measured (canon tool, bramble 15, 1,000 fights, stat yardstick): Bloom {Kill} 1.88 [1.54, 2.23] against a formula price 15.3; Bloom {Day} 7.24 [6.56, 8.04] against 25.7. The price is a bramblewood-budget.js formula, unchanged. Its own escalation (x1.5 on the copy's part) would move Night Algae 102 -> 115%, Pond Algae 97 -> 102%, the other four 2-4 points.
  - a) Apply the x1.5 (one budget line), no stats changed.
  - b) Price Bloom from the measure (much lower).
  - c) Leave it.
- **Default:** a

**ENG26-4. Leader bramble: defence is Health** · Decide · Brambles · asked 2026-11-06
- Your +2/+3 reads as the game's Attack/Health, so Banner Knoll gives your Leader +2 Attack and +3 Health as it takes the field (summoned, or a Leader card from the hand). +3 Armor would be far stronger.
  - a) +2 Attack / +3 Health (built).
  - b) +2 Attack / +3 Armor.
- **Default:** a

**ENG26-5. Where Banner Knoll is earned** · Decide · Brambles · asked 2026-11-06
- Banner Knoll (🚩, 22 Health, Rare) is open to every player now and on no road fight. Two homes with led fights: Savanna Reaches (14-5 and 14-6 have leaders) or Wolfsbane Tundra (17-5 Musk Ox Bulwark is led).
  - a) Unlocked by beating Savanna Reaches' boss.
  - b) A Wolfsbane Tundra drop.
  - c) Keep it open to everyone.
- **Default:** a

**BAL19-1. Road retune after the fold: which levers** · Decide · Maps · asked 2026-11-06
- BAL19 retuned 55 road fights toward the curve with decks (own list, K14 no worse per card), leaders (another list card, never added, namesakes kept) and a lower Shield (never above the rule). Not bramble Health (your 11-04 rule) and not bramble abilities (BAL17-1 b). Each change confirmed at 200 games. Road: 86 -> 115 in band, 61 -> 26 beyond 20.
  - a) Decks, leaders and Shield, as above.
  - b) Decks only.
- **Default:** a

**BAL19-2. The Canopy and Savanna Reaches are still walls** · Decide · Brambles · asked 2026-11-06
- With their weakest legal decks and no Shield, the Map reference still wins 0-30% (targets 40-90). Their bramble, Acacia Kraal (start Lumber 3, first unit +3 Attack), is the wall; yours to re-tune (BAL17-1 b).
  - a) You re-tune Acacia Kraal, then Claude re-measures.
  - b) Their fights defend a plainer bramble (Claude picks).
  - c) Leave them.
- **Default:** a

**BAL19-3. Too-easy fights with no stronger card on their list** · Decide · Map lists · asked 2026-11-06
- No legal deck makes these harder: 7-6 The Morel Monarch 57.5% (target 40), 8-8 The Stalactite Warden 52% (40), 1-3 97% (70), 1-4 94.5% (60), 200 games.
  - a) Claude adds one or two attackers from kin lists, then retunes (as Lilypad Reach).
  - b) Leave them.
- **Default:** a

**CONTENT12-1. Your live cards that the proposals or the budget would change** · Decide · Cards · asked 2026-11-06
- Your 59 live edits (10-29 to 11-05) are now in cards.json. CONTENT12 left them as you set them. Three got no new skill: Old Sturgeon (Relict), Ant Warrior and Fire Ant Raft (Meld {Quick}); Nautilus Drifter and Leafcutter Gardener carry them instead. Over budget as set: Worker Ant 124%, Bee Drone 113% (fit 0/4), Field Vole 111%, Alley Cat 111%, Conch Herald 105%, Soldier Ant 102%, Cypress Root Lurker 101%, Moon Jelly 100% (fit 1/2).
  - a) Keep yours as set.
  - b) Claude fits the over ones by the budget.
  - c) Also add the three skills.
- **Default:** a

**CONTENT12-2. The Lodge Matriarch (2-A-7): 97% -> 68%, target 40** · Decide · Maps · asked 2026-11-06
- Lilypad Reach now lists Shoal Shark, Beaver Lumberjack and Marsh Harrier. Her deck took two (95% -> 68% at 200 games). K14 (1 copy of a shared card, 6 in all) stops the search there; her list's own cards are walls.
  - a) Let 2-A-7 take 2 copies of the three attackers (a K14 exception for this boss).
  - b) A stronger Lodge Repairs.
  - c) Leave her at 68%.
- **Default:** a

**CONTENT12-3. Cold Snap is not softened** · Decide · Early game · asked 2026-11-06
- After your Map 0 card edits, Frost Vanguard (0-4) plays at 45.8% for the Map reference (600 games, two seed sets; target 45). Cold Snap every 4th round instead of every 3rd read 44.3%: no gain. CONTENT11-4's softening is not needed.
  - a) Keep Cold Snap as it is.
  - b) Soften it anyway.
- **Default:** a

**CONTENT12-4. Clear the folded card_overrides rows ("apply it")** · Approve · Supabase · asked 2026-11-06
- Every live card row (68: 59 folded now, 9 on 10-26) is in cards.json. supabase/proposed/20261106_clear_folded_overrides_4.sql backs them up and empties them (only rows unchanged since the 11-06 read). It replaces the 10-26 clear, never applied. Rows win over the file until then.
  - a) Apply it.
  - b) Not yet.
- **Default:** a

**ENG25-1. Which skills stay Evergreen** · Decide · Skills · asked 2026-11-05
- Owner 23:35: unit-own evergreens become passives. Claude's line: Evergreen keeps only skills that reach the field or a whole board: Converge, Moonpull, Earthquake, Tornado, Avalanche, Tsunami, Absolute Zero, Poison Gas, Rainmaker, Nova, Volley, Field Breaker, Warcry. The other 63 (shots, bolts, Pounce, Skyfall, Gash, Regeneration, Reload, Berserk, Twin, Brood, Charge…) are passives. Labels only; no rule changed.

**ENG25-2. Duplicate skills merged** · Decide · Skills · asked 2026-11-05
- Same rule, two names: Midas Touch -> Felling (Golden Magpie 2, Magnate Duck 3), Puncture -> Breach (Sawfish 2), Stockpile -> Delivery {Lumber} (on no card). Same numbers; old keys still play. A skill and its braced form (Timbered / Timbered {…}, Tally / Tally {…}…) are one '+ Add Skill' entry. Kept apart (they differ): Healing vs Nursing, Meiosis vs Hydra.

**ENG25-3. Immortal's limits** · Decide · Rules · asked 2026-11-05
- Immortal: on death a token copy (same stats and skills, Immortal too) takes its slot at Wait 2, so it misses a round. A copy that dies in the round it came back stays dead; Nullify, a cage, a sacrifice or an Undead return makes none; the round cap ends the rest. Hydra: Health halving ends every line.

**ENG25-4. Forage as an action; Berries heal 3 every 3** · Decide · Rules · asked 2026-11-05
- Reading: Berries are one basket rule. A unit holds up to 3; a full basket heals your most damaged other ally 3. Forage N is a trigger action (the unit gathers N Berries). Foraging N gathers N a turn (was 1 a turn, N the heal). Foraging and Forage are on no card.

**ENG25-5. Moonpull's new rule** · Decide · Skills · asked 2026-11-05
- Owner: 'Moonpull is not very impressive.' New: on arrival the Tide comes in (as before), and while it lives your Tide units' Tide counts double (Tide 1 acts as Tide 2; Tide 2 as 4). Two Moonpulls double once. Moon Jelly is the one card with it.

**ENG25-6. Merge Pearl / Pearl Bed into Delivery {Pearl}?** · Decide · Skills · asked 2026-11-05
- Pearl N (once, when Ready) and Pearl Bed N (every turn) are Delivery {Pearl xN} and its every-turn form under other names. One difference: a Wait 0 Pearl card pays on play, Delivery at its first upkeep. Giant Clam and Oyster Bank carry Pearl. Merging also moves their price (Delivery's resource discount).
  - a) Merge: Pearl cards carry Delivery {Pearl}.
  - b) Keep Pearl and Pearl Bed as their own names.
- **Default:** a

**ENG25-7. Lit context pips for conditional skills** · Decide · UI · asked 2026-11-05
- Timbered, Bedrock, Forged, Last Stand, the hand / weather / season states, the threshold skills (Requiem, Tally…), Loyal, Usurper and Liege now have a chip on the card face that lights gold while the condition holds, as Tide's lights blue. The separate gold state badge is gone for them (one pip, not two).

**ENG25-8. Tide's price** · Decide · Balance · asked 2026-11-05
- Measured in the global mix (few fights have a Tide), Tide 1 is worth 0.31 and Tide 2 0.58; Tide is priced 1.5. ENG25 kept Tide 1 at 1.5 and priced Tide N as 1.5 x N^0.9 (the measured ratio). 98 cards carry Tide; a cut would free budget on all of them.
  - a) Price Tide by its home maps' Tide share (as Diurnal / Nocturnal are), then re-fit.
  - b) Keep 1.5.
  - c) Take the global 0.31.
- **Default:** a

**BAL18-1. The Lodge Matriarch (2-A-7) cannot be made hard by her deck** · Decide · Maps · asked 2026-11-05
- BAL18 tried all 365 legal decks from her list (K14, size 14, leader and first-clear kept). The best still loses 97.5% of the time to the Map reference (target 40). Breaking K14 or using other fights' reward cards gets 95.5%. Shield 40 gets 98.5%. Her list is walls with 0-3 Attack, and Lilypad Reach plays Map 6's reference deck. So BAL16-4 a alone will not fix her.
  - a) A stronger Lodge Repairs, or a level up for her, then re-measure.
  - b) You add attackers to Lilypad Reach's list.
  - c) Leave her easy.
- **Default:** a

**CONTENT11-1. Identical cards: one job each (CONTENT9-1 a, the rest)** · Decide · Cards · asked 2026-11-05
- 13 in-play cards share an exact line (stats and skills) with another card. Proposed: Chipmunk Skirmisher Quick, Dormouse Nocturnal 1, Field Mouse On Death +1 Lumber (CONTENT9-1), Torch Lantern, Meadow Frog Tide, Feral Tomcat Pounce 1, Caiman Hatchling Ambush 1, Pike Lancer +Pierce 1, Dolphin Knight +Sonar, Glow Wyrm Irradiated, Mudskipper +Skitter. Terrier Pup and Bramble Sprout are already yours, live. Starters and House Cat stay vanilla. Table: docs/content11-2026-11-05.md section 3.
  - a) All, re-fitted by the budget.
  - b) Some (name them).
  - c) None for now.
- **Default:** a

**CONTENT11-2. SKILLREC1 on the 9 cards you edited live** · Decide · Skills · asked 2026-11-05
- SKILLREC1-1 a: your edits stay. Nine SKILLREC1 cards carry your live card_overrides edits (10-22 to 11-03, not yet folded into cards.json). Same as proposed: Terrier Pup, Bramble Sprout. Differ: Owl Sentinel (drop True Sight), Woodcock Lookout (day / night split), Kittiwake Flock (Swarm -> Throng), Beaver Lumberjack and Driftwood Crab (Delivery rename), Meadow Rabbit (Evasive), Silver Minnow (Swarm). Side by side: docs/content11-2026-11-05.md section 4.
  - a) Keep yours; fold them into cards.json.
  - b) Take Claude's on the ones that differ.
  - c) Per card (name them).
- **Default:** a

**CONTENT11-3. Carriers for Relict, Meld, Immunity, Sequestration** · Decide · Skills · asked 2026-11-05
- ENG24's skills are on no existing card (the new Nudibranch carries Sequestration + Immunity). Proposed: Relict on Horseshoe Crab and Old Sturgeon (living fossils); Meld {Quick} on Ant Warrior and Fire Ant Raft; Meld {Armor 1} on Coral Polyp Colony; Immunity on Hedgehog Herbalist and Venomlord Serpent; Sequestration on Poison Dart Croaker. Stats re-fitted by the budget. Detail: docs/content11-2026-11-05.md section 5.
  - a) All as proposed.
  - b) Some (name them).
  - c) You pick the cards.
- **Default:** a

**CONTENT11-4. Boss gimmicks: three to check** · Decide · Early game · asked 2026-11-05
- 11 early bosses got a gimmick; in band 6 -> 9 of 11. Three to check: Cracking Bark halves the Old Bramble's Shield every 3rd round (Shield, not Health; still 11.7%). The Lodge Matriarch is 98% either way, so her deck needs a retune. Cold Snap leaves Frost Vanguard at 32%, target 45. Also: Victoria Regia's literal push needs a new skill (Unfurl). Detail: docs/content11-2026-11-05.md sections 2, 5, 6.
  - a) Keep all; retune the Matriarch's deck next.
  - b) Drop Cracking Bark.
  - c) Also build Unfurl for Victoria Regia.
- **Default:** a

**BAL17-1. The walled maps are walled by their brambles** · Decide · Brambles · asked 2026-11-05
- BAL17 swapped every enemy card on BAL16-1's 38 fights for a neutral card: no map got easier (most got harder). The enemy brambles carry them: their ability numbers 2 lower (ENG24's +2 undone) lift Savanna Reaches 22% -> 54%, the Old Bramble 27% -> 50%; ability off lifts them 15-51 points. The Canopy and 17-8 stay walls (enemy a level up).
  - a) ENG24-1 c: enemy brambles back to before +2, then re-measure.
  - b) Keep +2; you re-tune these brambles' abilities.
  - c) Leave.
- **Default:** a

**FIX9-1. The Shell cards after the Shell rework** · Decide · Cards · asked 2026-11-05
- New Shell (Armor N for the round after the first hit) measures far weaker: Shell 2 is worth 0.57 points (was priced 2.26). All seven Shell cards now use 5-13 points less budget; none leaves its band. Giant Clam was over before and still is (102%). Stats unchanged.
  - a) Re-fit the six Shell cards up to their old use, and trim Giant Clam into band.
  - b) Keep the stats; only trim Giant Clam.
  - c) Keep everything as is.
- **Default:** a

**FIX9-2. Raid allies with a full row** · Decide · Raids · asked 2026-11-05
- The ally decks are full (20 cards). Allies stopped because their row (7 slots) fills by rounds 7-12 and back-row units rarely die. Built: with a full row an ally swaps its weakest unit (by Health left, never its leader) for the best of its next 3 cards when that card is worth more; a spent deck is shuffled again. In rounds 16-20 allies now play on 63% of turns (was about 43%). The rest are full rows of healthier, stronger units.
  - a) Keep this.
  - b) Always play: swap even when the new card is weaker.
  - c) Hold the card when the row is full (as before), keep only the reshuffle.
- **Default:** a

**BAL17-2. Maps 21-24: K14 blocks the last fixes** · Decide · Maps · asked 2026-11-05
- BAL17 retuned Maps 21-24 from their own lists: 18 of 30 fights in band (was 11), 2 beyond 20 (was 12). Still off: 22-2, 23-2, 23-3, 23-4 too hard (no K14-legal deck is weak enough), and Map 21 too easy (21-2, 21-3, 21-4, 21-6, no stronger list deck). Maps 21-23 are OVER (the Map reference beats BPRO-1 20-55%).
  - a) Exempt Maps 21-24 from K14 for the retune.
  - b) You add cards to their lists.
  - c) Leave.
- **Default:** a

**BAL16-1. Fights no deck from their own list can fix** · Decide · Balance · asked 2026-11-05
- BAL16 retuned decks only. 38 fights stay 20+ points too hard even with the weakest legal deck from their list: Savanna Reaches (14) and The Canopy (14-A) all fights, Basalt Foundry (19-A) all 10, Wolfsbane Tundra 17-4 to 17-8, the Old Bramble (0-B), Caves 8-2 / 8-5 / 8-7, Sunken Depths 10-A-4 / 10-A-5. The cards or the enemy brambles carry it.
  - a) Claude runs the card flags on these maps; you re-tune the flagged cards.
  - b) Let these decks break K14 (more copies of weak shared cards).
  - c) Leave them.
- **Default:** a

**BAL16-2. 17-8 is still called The Glacial Ape-King** · Decide · Maps · asked 2026-11-05
- CUT3-1 a: the four Glacial Ape-King leaders got new ones from their lists: 17-1 Beluga, 17-3 Polar Bear, 17-8 Walrus Icebreaker (its own reward), 17-A-1 Greenland Shark. The fight 17-8 keeps its name and crown icon.
  - a) Rename 17-8 (e.g. The Walrus Icebreaker).
  - b) Keep the name.
  - c) Name other leaders.
- **Default:** a

**BAL16-3. Pelican Point (2-4): no deck fix lifts the starter deck** · Decide · Maps · asked 2026-11-05
- 200 games, bramble kept. Starter deck: 2% now (6% before BAL16 took the off-list Conch Crawler out). Six decks from Pebble Beach's list: 1% to 7.5%; the Map reference 58-92%. The bramble is the wall, not the deck. Cheapest fix that keeps it: none in the deck; leave 2-4 as is (the Camp opens after 0-2, CONTENT10-2 a).
  - a) Leave it (CONTENT10-2 a).
  - b) Swap Hermit Crab x2 for Bramble Sprout x3 (starter 5%, Map reference 75%; deck 19 -> 20).
  - c) Something else.
- **Default:** a

**BAL16-4. Lilypad Reach (2-A) is too easy and breaks K14** · Decide · Map lists · asked 2026-11-05
- After CONTENT10 its list holds 3 cards of its own (Lodge Engineer, Old Sturgeon, Riverworks Bastion); the rest are Sunken Hollow's. K14 (1 copy of a shared card, 6 in all) cannot fill its decks: 2-A-1 and 2-A-6 break it, and the retune cannot make the map harder (mean +26 points, the boss 2-A-7 wins 100%).
  - a) Exempt 2-A from K14 so the retune can use more copies.
  - b) Add Lilypad cards to its list (your pick).
  - c) Leave it.
- **Default:** a

**DISTINCT-1. Every card should feel distinct: animal caps** · Decide · Cards · asked 2026-11-05
- Owner 2026-11-05 08:08: cut near-duplicates (name, art, animal). Caps for the whole game: mythic creatures (Yeti, Unicorn) 1; Otters, Hummingbirds about 15; Beavers 5-6; middle animals (Sharks, Deer) 2-3; animals with look-alike relatives (Hyena) 2. Society animals (lumberjacks, soldiers) will blend: each one's art adds one unique item.
  - Adopt

**REFDECK-1. New reference decks after the bigger pools** · Decide · Balance · asked 2026-11-05
- Owner 2026-11-05 08:08: "a. please create new map reference decks with unique optimised deck ideas - there's a bigger card pool now. b. create weak deck ideas." Package BAL16, after CONTENT10's lists.
  - Build (BAL16)

**THEME6-1. Own and carried card counts per map (replaces THEME5-1's answer)** · Decide · Map lists · asked 2026-11-04
- Owner 2026-11-04 23:36-23:40. Own: Map 2 has 10, falling slowly to 8 at Map 20 (Maps 0-1 may have more); Map 21 has 7, falling to 6 at Map 40; Map 41+ has 5. Carried: 5 up to Map 8, rising from Map 9 to 13 at Map 20; Map 21 has 14, rising to 16 at Map 40. Map 41+: carried 16, +1 every 20 maps (owner 11-05 08:08). Side maps keep their rules.
  - Apply (package CONTENT10)

**CONTENT10-1. Maps short of their carried count** · Decide · Map lists · asked 2026-11-05
- CONTENT10 filled carried cards only from earlier lists that fit the map's biomes, with no animal the list already holds. Short: Map 2 4/5, Map 4 4/5, Savanna 14 5/9, Taiga 16 7/10, Tundra 17 8/11, Glass Dunes 18 6/12. Earlier maps hold few savanna, taiga or desert cards. Map 21 has 6/7 own (archetype cards out).
  - a) Leave them short until new cards exist.
  - b) Allow looser fits (any shared biome, repeated animals).
  - c) You name the cards.
- **Default:** a

**CONTENT10-2. Pelican Point (2-4) still walls the starter deck** · Decide · Maps · asked 2026-11-05
- FIX8-1 eased 2-4 slightly (Tide Pool Crab x5 out for Gull Thief, Rock Pool Starfish for Sea Turtle Elder). 200 games: the starter deck wins 5.5% -> 6%; the Map reference wins 83.5% -> 77% (its target is 60). The deck is not the wall; the starter deck against a 15 + 1 bramble is.
  - a) Leave it (the Camp opens after 0-2).
  - b) Lower 2-4's bramble Health a little (15 -> 12).
  - c) Something else.
- **Default:** a

**EFFECTS-1. Design rule: stronger effects over stronger stats** · Decide · Design · asked 2026-11-04
- Owner 2026-11-04 23:17: "I plan to make sure there's enough actives and cool strategies. My thoughts: Stronger effects > stronger stats. So we can play with synergies more." Card and skill proposals favour actives and synergies over raw stats.
  - Adopt

**LIST-1104. Owner's thematic list edits (11-04 23:17 / 23:18)** · Decide · Map lists · asked 2026-11-04
- Pebble Beach: cut Sea Turtle Elder for Rock Pool Starfish. Sunken Hollow: Shoal Shark back; cut Muskrat Reedgatherer for Alley Cat. Sundered Peak: replace Glacier Wolf Pack (Claude picks). Old Snapjaw: new art. Maps 20+: no archetype cards in the existing skirmishes (all archetypes wait; Evomax comes with its planning). "Other than this, should be okay for thematic picks."
  - Apply (package CONTENT10, art ART9)

**RELICT-2. Three new skills: Meld, Immunity, Sequestration** · Decide · Skills · asked 2026-11-04
- Owner 2026-11-04 22:34: "invent a new skill that gains skills with others that have the skill (like slivers). Maybe something like, Meld - {Quick} -> All other units with Meld gain Quick. Immunity: Can't get poisoned or sick (disease related like decay can't as well). Sequestration: Steal status effects from opposing unit it hits (for one turn). E.g. poison, sleep powder. Not things like arrow. Specifically status related." Texts under 15 words.
  - Build all three

**ENG24-1. Brambles +2: how it was read** · Decide · Brambles · asked 2026-11-04
- Built (IDEA-BRAMBLES): every amount +2 (Heal 1 -> 3, Aimed Bolt 4 -> 6, Feed Repair 3 -> 5 and +1 -> +3 Attack, spawns 1 -> 3, Lumber, Wait, Thorns, bolts). Intervals, first rounds and 3 feeds a fight stay. No bramble ability scales by level, so level 20 reads the same. Enemy brambles changed too. Feed's +3 Attack a feed and three spawned units look strong.
  - a) Keep as built
  - b) Feed +1 Attack and spawns 1 (only Repair / heals / damage +2)
  - c) Yours only, not the enemy's brambles
- **Default:** a

**ENG24-2. Relict: do "every enemy" triggers count as field-wide?** · Decide · Skills · asked 2026-11-04
- Built: Relict ignores the field (weather, dark, hazards, wind, tide, lanes) and the board-wide skills Earthquake, Landslide, Avalanche, Tsunami, Tornado, Poison Gas, Absolute Zero, Nova. A unit's trigger that deals damage to every enemy (Deal damage, all enemies) and Volley still hit it, as normal skills. Its own Diurnal / Nocturnal still read the time.
  - a) As built
  - b) "Every enemy" triggers and Volley pass it by too
- **Default:** a

**NUDI-1. New creature: Nudibranch** · Decide · Cards · asked 2026-11-04
- Owner 2026-11-04 22:34: "Nudibranch - no need from my decision. Just design it, add it, art it."
  - Claude designs, adds and arts it

**ARMOR-1. Armor's price curve (eng10: Armor 5 costs 2.9x Armor 1; ENG9-9 expected about 10x)** · Decide · Budget · asked 2026-11-04
- Owner 22:34: "Armor Price Curve - you decide". Claude's call: keep the measured price (the engine's real effect), and re-measure Armor 1-5 against the road's own attack spread in the balance groundwork; the eng10 pin follows the measure.
  - Keep the measure, re-measure on the road
  - Force about 10x

**DELIV-1. Delivery and the Lumber 'home' price** · Decide · Budget · asked 2026-11-04
- A Lumber is worth less on maps of cheap cards. BAL12 priced the old Lumber-when-Ready skill by its home map (0.39x to 1.14x). Delivery replaced it but lost that adjustment, so it is priced as if every map were average.
  - a) Give Delivery the home price again
  - b) Leave it

**ENG23-1. Crepuscular: move the two old cards to the new default?** · Decide · Skills · asked 2026-11-04
- Owner 11-03 23:01: "+0/1 at night instead. Let me change for both separately. Also offer one option of crepescular {}, {} -> {} in day, {} in night". Built (ENG23): a plain Crepuscular is +0/+0 by day and +0/+1 at night; the editor sets the day part and the night part (Attack, Health each); "Crepuscular {day} → {night}" takes a stat change or skills in each brace. Old cards kept working, so Nightjar Drifter still has +1/+1 by day and at night and Woodcock Lookout +1/+0 in both (their prices are unchanged). Each part is priced at its own share: day 0.4, night 0.59 of the 3A + H points.
  - a) Keep both cards as they are
  - b) Move both to the new default (+0/+1 at night)
  - c) Set their parts yourself in the editor

**ENG23-2. Skitter: count a hit on the bramble too?** · Decide · Skills · asked 2026-11-04
- Owner 11-03 23:12: "After hit, it gains haste & evade for the next turn." Built: when its melee hit lands on a unit (a killing hit too), it has Haste (Speed +2, +1 to the allies beside it) and Evasive the next round; another hit renews it. A swing at the bramble does not count. Priced theoretically: Haste's 2.57 x 0.56 uptime = 1.44 S, and Evasive's x1.18 at 0.56 = x1.1 on the stat terms. On no card: you put it on Field Vole (and take Swarm off) yourself.
  - a) Unit hits only (as built)
  - b) A hit on the bramble counts too

**ENG23-3. Fast-forward tokens: keep the engine's order, and who grants them?** · Decide · Skills · asked 2026-11-04
- Owner 11-03 23:12: "A new type of token that can be on a card, that lets it fast forward N = number of tokens. (Recall that, if it has ff-N, the N-th move happens at N-i speed. (so speed N, N-1, N-2...)". The engine's rule (Fast Forward, 2026-10-12, D22) is different from that recollection: the N extra turns all come at the start of the next combat, before the whole main order (Speed included), one after another for that unit. ENG23 kept that rule: N tokens on a unit are its Fast Forward counters, shown as ⏩N with a tooltip, and the action Grant Fast-forward N (itself, an ally, every ally) adds them; priced 3.02 a token (Fast Forward 1). On no card.
  - a) Keep the engine's rule (all N before the main order)
  - b) Make the i-th extra turn go at Speed N - i inside the main order (an engine change, re-measured)
  - c) Name the first carriers of Grant Fast-forward

**ENG23-4. Map 0: Delivery shown, True Sight "?" until Map 6** · Decide · Tutorial · asked 2026-11-04
- Owner 11-03 23:12: "Stockpile is '?' in Map 0" and "True sight is '?' until the first Map with invisible units or changelings are seen." Built as the brief read the first note: Stockpile is Delivery since ENG22, and the Beaver Lumberjack (Map 0's Lumber maker) shows and explains Delivery { Lumber x1 } on Map 0 (a live edit that still says Stockpile reads as Delivery). True Sight reads "?" until the player enters Map 6, the Sable Swampmire (the first fights with an Invisible unit, the Booming Bittern; the first Changeling fights are Map 18), or sees an Invisible or Changeling card anywhere. Its four carriers (Owl Sentinel, Fawn Scout, Warren Scout, Woodcock Lookout) read "?" before then.
  - a) Keep Delivery shown on Map 0 (as built)
  - b) Delivery reads "?" on Map 0 too (one line: delivery: {from:1} in SKILL_REVEAL_MAP)

**ENG23-5. Beaver Lumberjack: fold the live 3/5 into cards.json?** · Decide · Cards · asked 2026-11-04
- Owner 11-03 23:12: "why does the lumberjack say 3/10 instead of 3/5 here?" Cause: the Map cards view drew your own copy, and your account has the Beaver Lumberjack at Level 10 (player_card_unlocks): Level 10 of the budget curve for a 3/5 is 3/10. Fixed (ENG23): the Map cards tiles and their zoom show a card at its base level (its stats and skills there), whatever copy the viewer owns. Also found: the live card_overrides row beaver-lumberjack (11-03 14:49) is 3/5 with Stockpile 1, while canonical/cards.json says 3/3 with Delivery 1 (BAL10's refit); the live row wins in the game.
  - a) Fold the live 3/5 into cards.json (fold tool), then clear the row (SQL waits for "apply it")
  - b) Keep cards.json's 3/3 and clear the live row
  - c) Leave both for now

**ENG23-6. The Gnawed Larder: Health, numbers and where it appears** · Decide · Brambles · asked 2026-11-04
- CONTENT9-2 A built (owner "Ok for C9-2"): Feed, once a turn instead of the pitch: a hand card goes into the bramble (to the Graveyard, as a Devour's food: Sacrifice - {} cards see it), Repair 3, your units on the field +1 Attack for the fight; 3 feeds a fight. The HUD has 🍖 Feed (drop a card on it or on your bramble, or pick a card and tap); the CPU feeds after its plays when its pitch is unused and 2+ of its units stand. Placeholders from the draft: Epic, 18 Health, unlocked by beating Map 6's boss (6-8 The Alligator King, unlockMap m8), no art yet, and not yet any enemy's bramble.
  - a) Health / rarity: keep Epic 18, or set yours
  - b) Feeds: 3 a fight, or 1 (a Rare at about 22)
  - c) +1 Attack to the units on the field now, or to every unit for the rest of the fight
  - d) Repair 3 flat, or the eaten card's Lumber cost + 2
  - e) Make it the enemy bramble of one Gnawed fight on Map 6

**ENG23-7. Ballista Keep with Aimed Bolt: Health 22 or 19?** · Decide · Brambles · asked 2026-11-04
- CONTENT9-2 B built: Aimed Bolt, once a fight, on your turn: pick an enemy column, 4 damage to the unit there (their bramble if the column is empty); it does not use your play, and the random 2-damage bolt each round carries on. The HUD has 🎯 Aimed Bolt with a column picker; the CPU fires it at the highest-Attack unit it can kill (or at the bramble when 4 finishes it; from round 6, at their highest-Attack unit). Health is unchanged at 22; the draft priced the shot at 4 to 5 stat points.
  - a) 22 Health, shot 4 (as built)
  - b) 19 Health, shot 4
  - c) 22 Health, shot 3

**FEEL1-1. Adopt the feelings list and the forecast principle as canonical; which gaps to build first** · Decide · Design · asked 2026-11-04
- Owner 2026-11-04 09:23: "We should define \"feelings\" in master hub. a new tab ... for bigger effects, the players have to actually plan it out ... forecasted." docs/feelings.md (hub 💭 Feelings tab): 9 feelings (the juke, the reveal, the clutch save, the instant surprise, the forecast and planned payoff, the comeback, the race, the swarm snowball, the turn of the clock); the forecast principle F1-F4 (what a forecast shows, strength against Wait, fair and unfair surprise, instant effects stay small); the skirmish recipe with 8 example set-ups (Maps 1, 3, 6, 11, 12, 17, 20, 23); 10 gaps G1-G10. Recommended first: G1 the CPU reads forecasts (a Waiting unit counts as no threat today), G2 forecast indicators on the board, G3 a bait check by CPU level. Choose: adopt all / adopt with changes; which gaps to build first. G5 (lock a random On Ready target at Wait 1, or show the set) and G6 (move big arrival effects such as Earthquake to On Ready) are rule calls.

**ENG21-1. Inspiring as Inspiration tokens: the reading built** · Confirm · Skills · asked 2026-11-03
- Owner 20:28: "Inspiring - +2 attack to adjacent creatures. It stacks! Once unit attacks and hits something, the inspiring tokens are expended for N damage. There should be a inspiration vfx effect on the card numbers." Built (ENG21) in the simplest reading: tokens are still given when the Inspiring unit attacks (the old text said so; not On Ready); Inspiring N gives each adjacent ally (left / right, plus front / behind where the rows fight) N Inspiration tokens, +2 Attack each, and they stack with no cap; the ally spends them all when its attack lands a hit on a unit or the bramble (the extra Attack counts on every hit of that swing); a miss, a dodge or a swing with no target keeps them. Before: +N Attack, spent by the next swing even if it missed. A 📯N pip shows them; the Attack number glows as they come and flares as they go. Price (400 paired fights, bramble 15): Inspiring 1 3.3 -> 5.43, Inspiring 2 5.96 -> 6.99 (pow 0.364). No card was re-fitted: Otter Flag-Bearer (96% -> 107% of its budget) and Meerkat Wayfarer (99% -> 113%) are now over; Conch Herald was over already (111% -> 121%), and so was ENG22's Cricket Drummer (2/7, 124% -> 140%, held by ENG22-4). The Whetstone kit item shares the bonus field: its +1 now also lasts until a landing hit.
  - As built
  - Tokens on Ready, not on attack
  - +N Attack a token (N = Attack, one token)
  - Cap the tokens (e.g. 3)
  - Spent by any swing, a miss too
- **Default:** As built

**CUT3-1. Skirmish / road decks holding cut cards: rebuild them after your pass** · Decide · Maps · asked 2026-11-03
- Owner 11-03 23:12: "The skirmish decks btw, still contained cut cards" and "you are awaiting for me to finish my pass before you can do balancing then start doing the skirmish decks again". CUT3 cut Glacial Ape-King from Map 17 (and its 17-A side map) and Map 19, and audited every deck against the cuts (your 10-28 / 10-29 notes, the 11-01 export, CONTENT6, this cut). Nothing in any deck was changed (BAL-OWNER-1). Full list by map, with deck, card, copies and cut source: docs/cut3-audit-2026-11-03.md. Glacial Ape-King is the showcase leader of 17-1, 17-3, 17-8 and 17-A-1; those leaders were not swapped.
  - a) Rebuild the decks after your pass is done (Claude rebuilds from each fight's own list, keeping leaders, first-clear cards and size).
  - b) Rebuild now, the Ape-King decks first.
  - c) For the four Ape-King leaders, name the new leader or put the card back on SPECIAL for that fight (the LISTFIX2 way).
- **Default:** a

**ENG22-1. Four counter skills built on no card: pick their carriers and names (Tally, Almanac, Onslaught, Riled)** · Decide · Skills · asked 2026-11-03
- Owner 21:13: "What about abilities for Cards drawn this game, creatures destroyed this game, and damage done to bramble last turn? Or even damage taken last turn." Built in Carnage's form, Name N - {...} (plain +2/+2), on no card, priced theoretically in canonical/skill-costs.json: Tally N (3), enemy units that died this fight (Carnage's old rule), 3.28; Almanac N (4), cards you drew this fight after your opening hand, 4.0; Onslaught N (3), damage your side dealt to the enemy bramble last round, 2.8 ("Siege" is taken by the bramble-breaker skill); Riled N (3), damage this unit took last round (this unit, not your side: it reads like Rage), 2.4. They turn on and off at the stat syncs (a play, a death sweep, a round's start). Carnage itself now counts only the enemy deaths while it is on the board, Ready or Waiting (ENG22).
  - a) Keep the four names; Claude proposes carriers (one Map 0-20 card each, budget-fitted by the owner)
  - b) Rename (owner's names)
  - c) Leave them on no card
- **Default:** a

**ENG22-2. Bramble Armor's name: the new Fortify {X} took the word "Fortify"** · Decide · Skills · asked 2026-11-03
- FIN2-a had renamed Bramble Armor (key brambleArmor: the bramble takes 1 less a hit while the unit lives) to "Fortify". SKILL-BUILD-1 makes Fortify {X} a new skill (on play, the bramble gets X for the fight). Two skills named Fortify would read the same, so ENG22 shows brambleArmor as "Bramble Armor" again (texts and 12 packs; its two cards keep their rule).
  - a) Bramble Armor (as built)
  - b) Make it a Fortify form: "Fortify {Armor 1}, while it lives"
  - c) Another name
- **Default:** a

**ENG22-3. Delivery kept two timings: once (13 cards) and every turn (11 cards)** · Decide · Skills · asked 2026-11-03
- DESIGN1-6 merged Stockpile (once), onReadyGold (every Ready turn) and the On Ready gain trigger (once) into Delivery {X}. Each card kept its own amount and timing: Delivery {Lumber xN} (once: Beaver Lumberjack, Muskrat Reedgatherer, Otter Angler, Leafcutter Gardener, Driftwood Crab, Nutria Reedcutter 2, Termite Forager, Talus Pika, Dune Packrat 3, Peat-cutter Vole; Gravel Mole Stone, Ore-Smelter Mole Metal, Irradiated Axolotl Uranium) and Delivery {Lumber x1}, every turn (Elder Willow, Nautilus Drifter, Elderhorn Monarch, Lodge Engineer, Rodent King, Coral Polyp Colony, Chipmunk Hoarder, Land Tiller, Sunfeather Scout, Old Willow of the Ford, Truffle Piglet). Budget: the eleven every-turn cards lose BAL12's home-list multiplier (the table cannot reach that code): Elderhorn Monarch -0.8, Land Tiller -0.93, Coral Polyp Colony -0.53, Nautilus Drifter -0.13, Lodge Engineer -0.07; Driftwood Crab +1.32 (its 0.49 home multiplier); no card flips its budget check.
  - a) Keep both timings (as built)
  - b) One timing for all (a re-tune for the owner)
- **Default:** a

**ENG22-4. Base Level 0 cards bring their abilities at Level 1; Map 0's untaught abilities read "?"** · Decide · Design · asked 2026-11-03
- DESIGN1-2 rules part, as built: every base Level 0 card (the starters, the Babies and the base / tutorial-reward cards: 15 cards) has its abilities in levelSkills "1", so its Level 0 copy is vanilla: Sheep Taunt, Garden Snail Armor 1, Guppy Tide, Sparrow Chick Flying, Rabbit Kit Evasive, Otter Centurion Boomerang, Meerkat Wayfarer Inspiring + Reach, Riverwing Envoy Esprit, Snapper Hatchling / Shallows Fry Tide, Caiman Hatchling Quick, Fire Drake Hatchling Fire Arrow 2, Harp Seal Pup Molting, Musk Ox Calf Armor + Frostbite. Kept at Level 0: Hatchling and Chrysalis (the Baby's own, BASELVL-1) and Garden Snail's Slow (a drawback). On the tutorial map and Map 0 these abilities read "?" (the reveal map, from Map 1): Taunt, Reach, Inspiring, Esprit, Boomerang, Evasive, Molting, Frostbite, Fire Arrow; Map 0's own fights show Armor, Flying, Swarm, Poison and Quick. The stat budget reads all of a card's skills at its base level, so no check moves. Cricket Drummer (Map 1, base Level 1) has Inspiring 1: S 0 -> 3.3, its budget check now reads over (3A + H + S 16.3 against N 13.16).
  - a) As built
  - b) Only the six starters
  - c) Change the "?" list
- **Default:** a

**ENG22-5. Taunt and Guardian on shots: what is pulled; Carnage's price** · Decide · Skills · asked 2026-11-03
- DESIGN1-4 as built: an Arrow, Archer, Arrow action, Fire / Ice Arrow, Twin Shot, Bola, Lasso, Snipe, the Bolts and Spitfire aimed at a unit go to an enemy Taunt unit around the shooter (the front-row shooter faces it or stands one column beside it), else to a Ready Guardian beside the unit aimed at (never for a Thorns unit). Not pulled: Volley (an arrow at every enemy), a shot aimed at the bramble, a middle / back-row shooter, a Stealth shooter (Taunt only), and the non-shot single-target skills (Missile, Deal damage, the status actions, Pounce: package ENG21 was editing it). Carnage's budget price still reads the old rule's uptime (bramblewood-budget.js THR_UPTIME.carnage, 3.28 at N 3); the new rule's count starts at 0 when it lands (a guess of 2.2), a re-measure is needed. Measured effect: the Map 3 reference deck now wins 71% (24 games) against the hummingbirds' Ambush (Smart, Level 10; its Needler and Petal Fletcher shots get pulled), which tests/eng13 wants under 50%; its bar is 0.75 until the owner re-tunes it.
  - a) As built; re-measure Carnage's uptime next
  - b) Taunt also pulls the non-shot single-target damage skills
  - c) Leave Carnage's price
- **Default:** a

**SKILLREC1-1. Adopt the skill recommendations (all / some / none)** · Decide · Skills · asked 2026-11-04
- Owner 2026-11-04 07:42: "get a list of skill recommendations (sort by advancement) in the master hub. (like how you did with cards. Not the same thing as when to introduce too." docs/skill-recommendations-2026-11-04.md (+ .json; hub Design tab): 84 rows, Map 0 -> 24 with side maps, 75 cards: 45 add, 20 swap, 2 remove, 2 change, 6 Delivery renames, 9 keep. Maps 0-1 first (CONTENT9-1 kept: Cricket Drummer Inspiring 1, Chipmunk Skirmisher Quick (not re-fitted to a fourth 2/4 Quick; else Pounce 1), Terrier Pup Guardian, Dormouse Nocturnal 1, Field Mouse On Death +1 Lumber, Bramble Sprout Thorns 1; Field Vole Skitter, Swarm out; Woodcock Lookout the Crepuscular day / night split; Owl Sentinel loses True Sight; starter twins get a Level 1 ability). 17 near-identical groups each get distinct jobs (34 -> 11 in-play cards with no skill). The new skills placed: Build (Lodge Engineer, Badger Trench Digger), Fortify (Quillguard Thorns 1, Great Gate +3 Health), Taunt (Alpine Marmot, Thorny Devil), Tally / Almanac / Onslaught / Riled one card each (ENG22-1), Skitter x3, the Fast Forward token (Roadrunner Courier), Delivery {Stone} (Talus Pika). 14 built skills on no in-play card get a carrier. No stats changed: 30 rows read over budget at printed stats (the owner's re-fit, BAL-OWNER-1), 27 fit, 7 free room, 5 wait on a price for a new skill.
  - a) All, as proposed.
  - b) Some: name the rows (or the maps).
  - c) None for now.
- **Default:** b

**LISTFIX2-1. Cut cards a fight still gives: keep them as that fight's card, or pick another card for the fight** · Decide · Maps · asked 2026-11-03
- Owner 11-03 22:02: "cut cards still stay, but are just flagged as cut." Checked (LISTFIX2): every cut in your 11-01 export was applied by THEME4, and the older THEME3 cuts too. Ten cut cards still show on their map because a fight gives them, so taking them out means changing a reward, and Claude does not change rewards without you. (1) Off the MAP list, kept on SPECIAL as that fight's card: Fiddler Crab Swarm (Pebble Beach 2-1 reward), Grey Seal Bull (2-5 reward), Tidepool Trapper Crab (2-3 first clear), Old Sturgeon (Sunken Hollow 4-5 reward), Stone Turtle Warden (4-2 first clear), Venomlord Serpent (Gatorback 5-3 first clear), Marsh Wisp (Sable Swampmire 6-4 first clear), Woodland Brawler (Sundered Peak 20-9 reward). SPECIAL keeps them in that map's fights, and the first-clear ones in Pack 1. (2) Your 11-01 cut was applied, then CARD5 (11-02, a coordinator follow-up, not your call) put two back on the MAP list because they are first-clear cards: Snapper Hatchling (Gatorback 5-1) and Weaver Bird (Savanna Reaches 14-3). Grey Seal Bull's JJ5 trim (3/12) did not put it back. Each card's other lists stay as they are (e.g. Grey Seal Bull and Tidepool Trapper Crab on Smugglers' Grotto, where you chose them). The Map cards view now marks each cut Still listed / Kept for its fight / Removed.
  - a) Keep them as their fights' cards (as now).
  - b) For each fight, pick another reward / first-clear card from the map's own list (as BAL9 did for 9-2 and 9-4), then take the cut card off that map fully (SPECIAL too; deck copies to the nearest list card, BAL9's rule).
  - c) b) for Snapper Hatchling and Weaver Bird only, a) for the rest.
  - d) Name the cards to drop.
- **Default:** a

**LISTFIX2-2. Three boss cards you cut on 11-01: keep them as their boss, or give the boss another card** · Decide · Maps · asked 2026-11-03
- Your 11-01 export cut The Gannet Queen (Gannet Cliffs), Wolfsbane Alpha (Wolfsbane Tundra) and Yeti Chieftain (Ashen Spurn) from their maps. THEME4 took them off the MAP list. They were already on SPECIAL (RELFIX3, 10-29) as the boss fight's leader and reward: 3-7, 17-8, and 19-6 (Yeti Chieftain is also 19-6's challenge card, RW2-2). So they are in no pack and in no fight except their boss fight. The other eight boss cards were not cut.
  - a) Keep each as its boss fight's leader and reward (as now).
  - b) Give the boss fight another leader and reward (say which), then take the card off the map fully.
- **Default:** a

**FIX8-1. Pelican Point (2-4) is a wall for the starter deck (QA2 M3)** · Decide · Maps · asked 2026-11-03
- QA2 lost 2-4 three times out of three on CPU Auto (2, 0 and 0 bramble damage dealt) and then 2-5 0-17; the PRO reference decks (2-SK, 2-WK) won easily, so the gap is the starter deck against the road. 2-4 is required for 2-5 and Map 3 (the Nest) is behind both. FIX8 did not touch it: it is balance (map difficulty, decks).
  - Ease 2-4 for a starter deck
  - Give Map 2 a second path
  - Leave it: the Camp now opens after 0-2, so a real deck is expected by here (re-measure first)

**FIX8-2. Early reward packs when no new card is left (QA2 M2)** · Decide · Rewards · asked 2026-11-03
- FIX8 made reward packs (level packs, map-end packs, faction packs) hand out new cards first and, when none is left, the cards you hold the fewest copies of, never one twice in a pack while another is left. The early gate still leaves very few cards, so duplicates remain possible on Maps 0-2. Reward amounts and pools were not changed.
  - Keep (least-owned first)
  - Pay Magic Dust instead of a duplicate
  - Draw from the next map's pool when the gate is empty

**FIX8-3. How the Nest says how to unlock the next nest (QA2 minor 13)** · Decide · UI · asked 2026-11-03
- The Nest says "The next one is locked for now." without a way to unlock it. NE #10 (2026-10-24) removed the map number on purpose, so FIX8 left the text alone. The 390-wide clipped tip line was fixed (CSS).
  - Keep the vague line
  - Name the map again ("opens on Map N")
  - Name the thing to do (a Kibble or Dust cost)

**FIX8-4. Defeat advice before the Camp (QA2 M1)** · Decide · Balance · asked 2026-11-03
- The Camp now opens by itself after 0-2, so the defeat advice ("build a new deck around one plan") reaches players who have a deck editor. A defeat on 0-1 or 0-2 itself can still show it first. FIX8 left the wording alone.
  - Keep the advice everywhere
  - Hide it until the Camp is open
  - Give a different line before the Camp

**CONTENT9-1. Map 0-1 cards: one job for five of the six identical 2/7s, the rest stay vanilla** · Decide · Cards · asked 2026-11-03
- DESIGN1-2 a (owner 21:10: "not everything needs effects. Vanilla cards have their value. I like the drummer having Inspire 1."). Proposal, nothing applied: Cricket Drummer Inspiring 1 (your pick), Chipmunk Skirmisher Quick, Terrier Pup Guardian (reads "?" on Map 0, learnt on Map 1; or Pounce 1), Dormouse Nocturnal 1 (Thistlewood has day and night), Field Mouse On Death gain 1 Lumber, Bramble Sprout Thorns 1. Every starter (Crossed-Eyes, Cottontail, Duck Paddler, Chipmunk Forager, Earthworm, Silver Minnow) and House Cat stay vanilla as the baselines. Map 0's list goes from 10 vanilla cards of 17 to 8, Map 1's from 6 to 1. Stats re-fit by the budget in your pass; the road decks are not touched. Table with the reasons: docs/content9-2026-11-03.md section 3.
  - a) All six as proposed.
  - b) Only some (name them), or other jobs.
  - c) Keep them vanilla for now.
- **Default:** a

**CONTENT9-2. Two bramble abilities: the Gnawed Larder (Feed) and Ballista Keep's Aimed Bolt** · Decide · Brambles · asked 2026-11-03
- DESIGN1-10 (owner 21:10: "maybe we can invent it for 1 or 2 brambles. Also a bramble with devour/sacrifice (pitch a card to it to heal it and increase attack of all allies by +1)."). Drafts, not built. A) The Gnawed Larder, Epic, about 18 Health: "Feed: once a turn, instead of pitching a card for Lumber, drag it onto your bramble: Repair Bramble 3, and your units on the field get +1 Attack for the rest of the fight. Three feeds a fight." About +3 to +6 stat points a feed after the lost Lumber; from the Sable Swampmire (a 6-8 drop, and one Gnawed fight's enemy bramble). B) Ballista Keep: "Aimed Bolt: once a fight, tap the bramble and pick an enemy column: its bolt hits the unit there for 4 (the bramble if empty). It doesn't use your play." Ballista Keep 22 -> about 19 Health, or the shot at 3. Details and the open sub-calls (feeds per fight, who gets the +1, Repair amount): docs/content9-2026-11-03.md section 5.
  - a) Build both as drafted.
  - b) Build the Larder only.
  - c) Build with changes (name them).
  - d) Not now.
- **Default:** b

**SKILL-BUILD-1. Fortification renamed Build {...}; new Fortify {...} for the bramble** · Decide · Skills · asked 2026-11-03 · decided 2026-11-03
- Owner 21:10: "Fortification renamed to Build - {}. So it would be written as Build - { 0/6 Palisade }. Fortify (new skill) - {} would then be, to give {} to the bramble. E.g. Fortify - {Thorns 1, +1 Health}". ENG22.

**ROADMAP-CRAFT-1. Forge sub-tabs: transmuting and crafting systems as the game opens up** · Idea · Forge · asked 2026-11-03
- Owner 21:10: "Transmuting of cards. As we progress, we gain access to more and more systems. Forge will gain alot of sub-tabs of other crafting systems. Like turning relic cards into actual prehistoric animals, socketry, 'manufacturing' animals with tech, with magic, subfactions through bribery & cunning, a rat transforming into another creature (only path, min L10)... etc." Long-range roadmap item; not started.
  - Design pass later
  - Later
- **Default:** Later

**BAL-OWNER-1. The owner takes over balancing from Release 11-03a** · Confirm · Balance · asked 2026-11-03 · decided 2026-11-03
- Owner 21:10: "You seemed to have push the balance update. Ill takeover on that side from here." Claude stops balance passes (card stats, decks, budget) unless asked; it keeps measuring and reporting the balancing status.

**ECON2-1. The Forge cliff at Map 11: Maps 0-10 take 3 days, Maps 11-20 up to 46 (Dust)** · Decide · Economy · asked 2026-11-03 · decided 2026-11-03
- A dedicated player clears Maps 0-10 in 3 days (casual 7) with nothing to buy, then waits on Dust: keeping the deck at the level the road curve is tuned for (referencePlayerLevel) with each map's reference cards, Maps 11-20 take 46 days (casual 66), 45 of them waiting for Dust. A player who keeps one deck from Map 11 needs 5.8k Dust in all and finishes Map 20 on day 10 (casual 20). Dust income after the road is notices 243 a day + weekly quests ~210 a day (from Map 13). Murgle Mayhem (759 Dust a week, built by ECON1) is still hidden (DAILY_DUNGEONS_HIDDEN). Measured, nothing changed. docs/econ2-2026-11-03.md (sim: tools/econ2/econ_sim_2026_11_03.js).
  - a) Open Murgle Mayhem from Map 11 (DAILY_DUNGEONS_HIDDEN off for it): +108 Dust a day, the source ECON1 built for this.
  - b) Lower Forge steps 1-3 (35 / 44 / 53 Dust) by a third: the levels the road asks for on Maps 11-20.
  - c) Pay elite and boss repeat wins their full Dust (conquestRepeat 1.0 for Dust only).
  - d) Leave it: Maps 11-20 are meant to be the grind.
- **Default:** a

**ECON2-2. Weekly quests pay their tier's reward for each quest, not once a tier** · Decide · Economy · asked 2026-11-03 · decided 2026-11-03
- claimQuest grants tier.reward on every quest claimed, so weekly tier 1 pays 3 x (170 Leaves, 260 Dust, 2 Metal). A full week (from Map 13) is 1,469 Dust and 959 Leaves, about 40% of a dedicated player's Dust after the road; ECON1's arithmetic counted each tier once. Paid once a tier, the dedicated run ends Map 20 on day 58 instead of 49. Measured, nothing changed. docs/econ2-2026-11-03.md (sim: tools/econ2/econ_sim_2026_11_03.js).
  - a) Keep per quest (the Dust is needed: see ECON2-1) and say "each" on the board.
  - b) Pay once a tier (as ECON1 assumed) and make up the Dust elsewhere.
- **Default:** a

**ECON2-3. Weekly tier 1 holds a PvP quest, so tiers 2-3 stay hidden on Maps 4-10** · Decide · Economy · asked 2026-11-03 · decided 2026-11-03
- Weekly tier 1 is w1-energy, w1-pvp (30 PvP tickets) and w1-units; the Arena opens on Map 11 and a tier shows only once the one before is all claimed. So from Map 4 to Map 10 a player can claim 2 weekly quests, and from Map 11 to 12 tier 2 stops on its raid quests (Raid, Map 13), hiding tier 3. Measured, nothing changed. docs/econ2-2026-11-03.md (sim: tools/econ2/econ_sim_2026_11_03.js).
  - a) Move w1-pvp to tier 3 and w3-conquest to tier 1; move the two raid quests to tier 3 (each tier claimable once its feature is open).
  - b) Skip a locked quest when deciding whether the next tier shows.
  - c) Leave it.
- **Default:** b

**ECON2-4. Maple Leaves pile up: 12k unspent at Map 20 while Dust runs dry** · Decide · Economy · asked 2026-11-03
- Leaves come in about as fast as Dust (dedicated, to the end of Map 20: 38.9k Leaves, 35.9k Dust), but the Forge takes Leaves at 2/3 of its Dust, so a dedicated player holds 12.1k Leaves and 0.6k Dust at Map 20 (casual 9.4k / 0.4k). Packs (50-94 Leaves) are the only large sink. Measured, nothing changed. docs/econ2-2026-11-03.md (sim: tools/econ2/econ_sim_2026_11_03.js).
  - a) Leave it: players spend Leaves on packs (12k = 240 Hedgerow Pouches).
  - b) Shift the notices toward Dust (e.g. D 20 / 25 -> 15 / 30, and up the line) so the two run out together.
  - c) Add a Leaves sink that helps the grind (e.g. the Forge buys Dust at 3 Leaves : 1).
- **Default:** b

**ECON2-5. A repeat skirmish pays 4 Leaves whatever its Energy: farming stops paying after Map 3** · Decide · Economy · asked 2026-11-03 · decided 2026-11-03
- CONQUEST_NODE_REWARDS.skirmish.repeat is 8 Leaves (4 after ECON1) and 0 Dust on every map, while a fight costs 1 Energy on Map 0 and 9 on Map 20: 4 Leaves an Energy on Map 0, 0.44 on Map 20. Elites repeat for 7 Leaves + 3 Dust. Measured, nothing changed. docs/econ2-2026-11-03.md (sim: tools/econ2/econ_sim_2026_11_03.js).
  - a) Scale the repeat pay with the fight's Energy (4 Leaves and 1 Dust a point of Energy, halved).
  - b) Scale it with the map number (+10% a map, as the Blossoms do).
  - c) Leave it: Energy is for the road, not for farming.
- **Default:** a

**ECON2-6. Errands pay 14-27 Dust: less than half a D notice, for 2-3 wins and an interruption** · Decide · Economy · asked 2026-11-03 · decided 2026-11-03
- An errand pays 4-8% of a Materia Unit, halved: 14-27 Dust and 9-18 Leaves (+ an Iron Shard on two). A D notice pays 25 Dust, the average notice 40. Offers come after 30% of Conquest wins (up to 2 a day), each a 2-line conversation with a yes / no. Measured, nothing changed. docs/econ2-2026-11-03.md (sim: tools/econ2/econ_sim_2026_11_03.js).
  - a) Raise errands to about one notice (mu x 2.5: 35-68 Dust) and offer them after 15% of wins.
  - b) Raise the pay only.
  - c) Leave it.
- **Default:** a

**ECON2-7. A two-session player is Energy-bound from Map 5: 57-107 Energy a day of 288** · Decide · Economy · asked 2026-11-03
- Energy refills 1 every 5 minutes (288 a day) up to the cap (20, 30 after the Nest steps, 50 with the Forge steps). A player who plays twice a day gets twice the cap plus 6 a session: 57 a day at cap 20, 77 at 30, 107 at 50, so from Map 5 (5-6 Energy a fight) a casual player runs out before the time does. A dedicated player is never Energy-bound before Map 21 (time and Dust bind). Measured, nothing changed. docs/econ2-2026-11-03.md (sim: tools/econ2/econ_sim_2026_11_03.js).
  - a) Leave it (cap 20 is the owner's 10-14 choice; Energy is meant to pace casual play).
  - b) Raise the base cap to 30 (casual +20 a day).
  - c) Bank up to one extra cap overnight (a "rested" refill once a day).
- **Default:** a

**ECON2-8. Kibble, Iron Shards and Metal flood: hundreds held with nothing to spend them on** · Decide · Economy · asked 2026-11-03 · decided 2026-11-03
- At Map 20 a dedicated player holds 362 Kibble (Nest training costs 2-8 a card), 188 Iron Shards (repeat wins drop one 15% of the time; the Max Energy steps use 7) and 45 Metal (nothing spends Metal). Measured, nothing changed. docs/econ2-2026-11-03.md (sim: tools/econ2/econ_sim_2026_11_03.js).
  - a) Iron Shard on a repeat win 15% -> 5%; give Metal a use (e.g. Forge tier upgrades take 5 / 10 Metal); leave Kibble.
  - b) Hide each currency's counter until something spends it.
  - c) Leave it for now.
- **Default:** a

**ECON2-9. Dialogue: busy first hour, then most maps say nothing** · Decide · Dialogue · asked 2026-11-03 · decided 2026-11-03
- The whole game has 62 NPC scripts (171 lines, 1,884 words, about 10 minutes). The first hour (tutorial and Maps 0-2) plays about 13 of them (41 lines) on top of the tutorial; Maps 8 and 11 are busy (4-5 each); Map 18 and Maps 22-24 say nothing and Maps 6, 9, 12, 15, 16, 17 one 2-3 line conversation, the same stretch where the player waits on Dust. Boss banter is one shared two-line exchange and fires on 7 main-road fights only (enders are mostly elites). Proposal: one curiosity (2-4 lines) on each silent map 12-24, written in the lore bible's voice, and errands offered less often (ECON2-6). Measured, nothing changed. docs/econ2-2026-11-03.md (sim: tools/econ2/econ_sim_2026_11_03.js).
  - a) Write one curiosity for each silent main map (Claude drafts, you edit).
  - b) Only for Maps 12-20.
  - c) Leave it.
- **Default:** a

**ECON2-10. Map objects: fights under the title panel, crowded tiles, empty halves** · Decide · Maps · asked 2026-11-03 · decided 2026-11-03
- The probe (1,366 px desktop, every object shown; docs/screens/econ2/) found a fight under the map's title panel on 20 maps (15 main, 5 side; most often X-2, e.g. 3-1, 5-2, 20-2 and 20-3), 13 pairs of tap targets closer than 7% of the canvas (8-5 / 8-H 2.8% on the dark Caves map, 20-2 / 20-3 3.3%; side-map entrances on 1-3 and 19-3), and the same perimeter trail (top, right edge, bottom) on Maps 3-19 that leaves the centre empty; Maps 21-24 fill the canvas and read better. Measured, nothing changed. docs/econ2-2026-11-03.md (sim: tools/econ2/econ_sim_2026_11_03.js).
  - a) Fold the title panel to a chip after the first look at a map, and move the listed nodes with the layout editor (Claude lists the moves).
  - b) Only fold the title panel.
  - c) Leave it.
- **Default:** a

**ECON2-11. The hub's Resources tab still shows income from before ECON1 (twice the real numbers)** · Decide · Tools · asked 2026-11-03
- tools/resources_week_2026_10_23.js reads QUEST_RANK_REWARD, QUEST_TIERS and the repeat rewards from their declarations, without the econScaleTable / econScale halving the game applies after them, and it counts the daily quest tiers, which the board no longer posts. Its week (e.g. 4,614 Dust at Map 10) is about twice what a player gets. tools/econ2/econ_sim_2026_11_03.js reads them halved. Measured, nothing changed. docs/econ2-2026-11-03.md (sim: tools/econ2/econ_sim_2026_11_03.js).
  - a) Fix the tool to apply the halving (and drop the daily tiers), then rebuild the hub tab.
  - b) Retire the tab and point it at the ECON2 sim.
- **Default:** a

**ECON2-12. Gold Leaves (the scarce currency) come at about 1 a day: is that the premium anchor you want?** · Decide · Finance · asked 2026-11-03
- Gold Leaves come only from S / SS / SSS notices (3 / 8 / 15 each, halved) while the daily dungeons are hidden: a dedicated player gets about 1 a day (51 by the end of Map 20), a casual one about 0.5. A Tidemire Chest costs 6 and a Highcrest Case 11 with their Leaves. If Gold Leaves are to be the currency a future premium lane or shop sells, their free rate is the number that sets the price of everything later. Measured, nothing changed. docs/econ2-2026-11-03.md (sim: tools/econ2/econ_sim_2026_11_03.js).
  - a) Keep ~1 a day free and treat Gold Leaves as the premium anchor (no change now).
  - b) Add a small steady source (e.g. 1 a week from the weekly tier 1, or the Trail's free lane) so casual players see them.
  - c) Decide with the monetisation plan later.
- **Default:** c

**DESIGN1-1. Big entrance: playing a 2+ Lumber card also lets you play a 0-Lumber card that turn** · Decide · Design · asked 2026-11-03 · decided 2026-11-03
- The Lumber curve has collapsed: the strongest ladder decks are 61% 0-Lumber and 98% 0-1 Lumber cards (PRO / BPRO 55 / 42%); on Maps 0-20, 45% of the 3-Lumber cards and 15% of the 2-Lumber cards on a list are on no optimizer deck (0-Lumber: 4%). One play a turn means a 2-Lumber card costs a play plus one or two pitched cards for one body. A rule, not a re-tune; measured by deckopt BPRO on Maps 5 / 10 / 15 / 20 (the 2+ Lumber share of the best decks, today 2-3%, toward the lists' 16%). docs/design1-2026-11-03.md problem 1.
  - a) Big entrance: after a 2+ Lumber card you may also play one 0-Lumber card that turn.
  - b) A 2+ Lumber card arrives with Wait -1 (never below 0).
  - c) Unspent Lumber carries a +1 Attack 'momentum' to the next 2+ Lumber card played.
  - d) Leave the cost rules as they are.
- **Default:** d) Leave the cost rules as they are.

**DESIGN1-2. Drop 'early rewards are vanilla'; give the Map 0-1 cards one job each, starting with the six identical 2/7s** · Decide · Design · asked 2026-11-03 · decided 2026-11-03
- 61 in-play cards (15%) have no skill, 70% have one or none; Map 0's list is 65% vanilla, Map 1's 47%, and Map 0's road decks are 82% vanilla copies. Chipmunk Skirmisher, Terrier Pup, Cricket Drummer, Field Mouse, Dormouse and Bramble Sprout are all 0 Lumber, Wait 0, 2/7, no skill. docs/workflows/card-data.md line 15 says 'Early rewards are vanilla (no skills)'. Proposal: drop that line; give each a keyword the road teaches by Map 3 (Cricket Drummer Inspiring 1, Bramble Sprout Thorns 1, Chipmunk Skirmisher Quick, Terrier Pup Pounce 1, Dormouse Guardian, Field Mouse On Death gain 1 Lumber), stats re-fitted by the budget tool. docs/design1-2026-11-03.md problem 2.
  - a) Yes, as proposed.
  - b) Yes, with my own six jobs (name them).
  - c) Only drop the rule; new cards follow it, old ones stay.
  - d) Keep early cards vanilla.
- **Default:** d) Keep early cards vanilla.

**DESIGN1-3. Every Map 0-2 elite / boss gets one visible gimmick; Map 0's four fights each spotlight one keyword** · Decide · Design · asked 2026-11-03 · decided 2026-11-03
- Map 1 Thistlewood is won 97.5% (+29, 0 of 5 green, the Thistle Baron 100% against 40); its five fights are 2/7 walls under five names. The tutorial come-back fights show richer cards (Rockslide Ram, Dynamite Packrat, Scree Goat, Eagle Sharpshooter) than Maps 0-1, then they vanish. Proposal: each Map 0-2 elite or boss leans on one rule the player has to answer (the Thistle Baron: a Guardian row behind Thorns; the Old Shell: Armor 3 so Pierce matters; 0-4 the first Quick enemies), and Map 0's four fights each put one keyword in the spotlight (the onramp's 'see it'). docs/design1-2026-11-03.md problem 3.
  - a) Yes, for Maps 0-2.
  - b) Yes, and on every map's elite / boss.
  - c) Not yet.
- **Default:** c) Not yet.

**DESIGN1-4. Guardian also takes Arrows and shots aimed at adjacent allies; Taunt also pulls Arrows** · Decide · Design · asked 2026-11-03 · decided 2026-11-03
- The pipeline measures (docs/balance/pipeline/measures.json) read the positional skills at about zero: Guardian -0.36 [-0.76, -0.01] (18 in-play cards, the Otter Legion's identity), Taunt -0.74, Crab Claws -0.17, Hibernate -0.72; the top twelve are all off-board damage or bodies (Fireball 15 9.9, Volley 2 9.0, On Turn spawn 8.7, Brood 2 8.3, Ice Arrow 2 8.1). Guardian redirects plain swings and counters only (GD-3, EN8-1); the damage that matters is shots and skills. This reverses part of GD-3. Measured by the pipeline (tools/pipeline/run.sh) before / after. docs/design1-2026-11-03.md problem 4.
  - a) Guardian takes Arrows and shots too (not damage skills or area damage); Taunt pulls Arrows.
  - b) Guardian only (Taunt as it is).
  - c) Keep GD-3: swings and counters only.
- **Default:** c) Keep GD-3: swings and counters only.

**DESIGN1-5. An answer rule: a map's list holds an answer to each threat class its elite / boss leans on** · Decide · Design · asked 2026-11-03 · decided 2026-11-03
- The hardest fights are stat walls: 9-7 The Kelp Witch 5% (Mangrove Manatee 7/7 Regen 2 Guardian, Reef Shark 6/13, Horseshoe Crab Armor 2, Proboscis Monkey Taunt), 17-7 Alpha Howler's Den 10% (four Glacial Ape-Kings 6/40 Earthquake 4 Guardian), 14-A-1 Dart Frogs 2.5%. In 20 of BAL13's 65 flagged fights three stat steps on the biggest enemy card are not enough. Executioner first appears on Map 14, Freeze on Map 17. Rule: Armor 2+ -> Pierce / Venomous; Regen -> Wither; 25+ Health -> Executioner / Hunter; a Flying swarm -> Reach / Arrow; a Taunt wall -> Backstab / Arrow, on that map's list or the one before. A read-only checker lists the gaps for the owner's picks (THEME5-1 can carry them). docs/design1-2026-11-03.md problem 5.
  - a) Adopt the rule and build the checker.
  - b) Build the checker only, as information.
  - c) No.
- **Default:** b) Build the checker only, as information.

**DESIGN1-6. A keyword-intro test, and merge the 'Lumber when Ready' family into one keyword** · Decide · Design · asked 2026-11-03 · decided 2026-11-03
- After the tutorial's 14 skills, main maps add a mean 6.4 new skills each (Map 2 11, Map 8 12, Map 17 10, Map 19 10); only Map 5 keeps the settled 'two new skills a map at most' (rules 10-21 RP); 173 distinct effects by Map 24. Synonyms: Stockpile (once, 2 cards), onReadyGold (every Ready round, 7) and an On Ready gain trigger (6) all read 'Lumber when Ready'; also Poison / Venomous / Greater Poison / Poison Bolt, Hunter + Hunter-vs, Shell / Shield / Armor / Bulwark, Crab Claws / Fork / Trident. docs/design1-2026-11-03.md problem 6.
  - a) Both: the test (fails above the rule) and Stockpile N / Stockpile N, every turn as the one name.
  - b) The test only, as a report.
  - c) Neither.
- **Default:** b) The test only, as a report.

**DESIGN1-7. Each main map gets one payoff card and one field card (card text on cards already listed)** · Decide · Design · asked 2026-11-03 · decided 2026-11-03
- Of 232 PRO / BPRO decks the focus is open 71, swarm 51, economy 45, big 37, family 28 (12%, and those were told to try a family). In play: Kinship 0 cards, Swarm by Type 0, Fletcher 1, Inspiring 5. Field effects: on the water and wind maps 30-36% of the ladder's copies react to the field; on Maps 5-7 and 12-16 1-17%; day / night runs on nearly every map with 0-3 day / night cards a list. Proposal: one payoff naming a type or keyword on the list (Pebble Beach: Kinship - Crab +1/+0) and one card whose skill keys off the map's field (the Taiga: a Nocturnal hunter), from THEME5-1's candidates where possible. Test: a family-focus deckopt deck within 5 points of the best open deck. docs/design1-2026-11-03.md problem 7.
  - a) Yes, on every main map 0-20.
  - b) Yes, on Maps 11-20 first (with THEME5-1).
  - c) Not yet.
- **Default:** c) Not yet.

**DESIGN1-8. Signature rule: every Rare+ card carries an effect no Common on its map has (the 12 vanilla Rare+ first)** · Decide · Design · asked 2026-11-03 · decided 2026-11-03
- Mean skills a card: Common 1.09, Uncommon 1.27, Rare 1.25, Very Rare 1.44; the budget gives a rarity step +1 on a base of 10. 12 in-play Rare+ cards have no skill: Squire's Mount 4/14, Bramblewood Lynx 5/7, Glass Golem 6/5, Sergeant Bramblefox 3/12, Quillguard 2/22, Badger Berserker 4/16, Dolphin Knight 3/9, Pike Lancer 3/9, Raven Scout 2/5, Ashwing Ptarmigan 3/6, Woodland Brawler 3/14 (Very Rare), Tide Spirit 5/5 (Very Rare). A Rare reveal with no text is the moment the game should feel generous. docs/design1-2026-11-03.md problem 8.
  - a) Adopt the rule; Claude proposes a signature for the 12, you pick.
  - b) Only for new cards.
  - c) No: rarity is stats.
- **Default:** c) No: rarity is stats.

**DESIGN1-9. Leaders get a Command: a passive that works only while the leader waits unsummoned** · Decide · Design · asked 2026-11-03 · decided 2026-11-03
- 13 leader cards, most a body with one or two common skills (Old Shell Armor 3, Pride Queen Quick, Yeti Chieftain Rage, Old Snapjaw Bleed 1 Armor 1; the Wandering Traveller has no skill beyond `leader` in cards.json). Old Snapjaw is the leader your seat holds on 16 of 36 ladder lists. Proposal: each leader's Command works while it is in the crown slot and ends when summoned (Old Shell: your first Guardian each fight has Armor +1; The Gannet Queen: your Flyers' Pounce +1), so when to summon becomes a real choice. Test: leader diversity on the ladder and the summon turn. docs/design1-2026-11-03.md problem 9.
  - a) Yes, one Command per leader (Claude drafts, you pick).
  - b) Only for the leaders a player holds by Map 10.
  - c) No.
- **Default:** c) No.

**DESIGN1-10. Brambles get one once-a-fight active (tap it, choose a column)** · Decide · Design · asked 2026-11-03 · decided 2026-11-03
- 43 brambles with 12 passive kinds, every number 1-2 (start Lumber, first unit +1 Attack, units +1 Health, Regen 1, enemy Wait +1, bolt 1-2, Thorns 1 ...); picking one is mostly picking the biggest Health. Proposal: each passive kind gets an aimed version once a fight (Ballista Keep fires its bolt at the column you choose; Thorn Cage puts its Thorns on one column for a round), so the bramble adds a decision. A bigger build than the others. docs/design1-2026-11-03.md problem 9.
  - a) Yes, for every bramble kind.
  - b) Only for the Rare+ brambles.
  - c) No.
- **Default:** c) No.

**DESIGN1-11. Babies get Grow N (survive N of its rounds: +1/+1 once), or Hatchling stays hidden until Map 20** · Decide · Design · asked 2026-11-03 · decided 2026-11-03
- Baby cards are vanilla small bodies (Otter Kit 2/5, Duckling 1/5, Fox Kit 2/9, Sparrow Chick 1/3 Flying, Compost Grub 1/10, Snapper Hatchling 1/7, Rabbit Kit 2/2). Their Hatchling shows '?' until Map 15 and the name only until Map 20, and pays only under an Evolute; Evomax cards are obtainable from Map 30. The one Evolute card on a list (Gale Sprite, Map 21) is on no deck; Canopy Sloth Guardian is on no list; Evolute measures -6.41 [-7.73, -5.41]. Grow gives a reason to protect a Baby from Map 0 and keeps it a Stem later. docs/design1-2026-11-03.md problem 10.
  - a) Grow N on every Baby (priced by the pipeline).
  - b) Hide Hatchling entirely until Map 20 (no '?').
  - c) Both.
  - d) Keep as it is.
- **Default:** d) Keep as it is.

**TEXT1-1. The hummingbird faction's name: Sunfeather Dominion (in the game) or Sunfeather Tribes (the lore bible)** · Decide · Texts · asked 2026-11-03 · decided 2026-11-03
- The game calls the hummingbirds the 'Sunfeather Dominion' (faction screen: 'the Dominion rules a court where every courtier is a duelist'; the Ambush pop-up 'A Dominion patrol'; Aurelia's raid line 'Even the Dominion cannot fell that thing alone'; the card Dominion Nestguard; one flavour line). docs/lore-bible.md says 'Dominion' reads as an empire and proposes 'the Sunfeather Tribes' and 'Sunfeather Nestguard', but marks it 'proposals, nothing renamed yet'. TEXT1 left every Dominion text as it is. The same table proposes the knight renames (Stag Knight -> Stag Champion, Bee Knight -> Bee Warden, Dolphin Knight -> Dolphin Outrider, Cataphract Destrier -> War Destrier), also not applied. docs/text1-2026-11-03.md
  - a) Keep 'Sunfeather Dominion' and drop the proposal from the lore bible.
  - b) Rename to 'the Sunfeather Tribes' (faction screen, Ambush, Aurelia's line, flavour) and Dominion Nestguard -> Sunfeather Nestguard, in all 12 languages.
  - c) b), plus the four knight renames.
- **Default:** a) Keep 'Sunfeather Dominion' and drop the proposal from the lore bible.

**UI17-1. Apply the admin overview function (supabase/proposed/20261103_admin_overview.sql)** · Apply · Admin · asked 2026-11-03 · decided 2026-11-03
- Owner 11-03 18:37: the players screen should show online now, server load etc. Admin -> Players now has an overview. Accounts, online now (seen in the last 5 min), active last hour / day / week, new today and raid attempts in the last hour come from tables the client already reads. Fights and matches in the last hour, database connections and size need admin_overview(), a read-only security-definer function that only an is_app_admin() account can call (counts only, no names or emails). Until it is applied those tiles say "needs SQL".
  - a) Apply it
  - b) Not now (the tiles keep saying needs SQL)
- **Default:** a

**UI17-2. The "5x pack": there is no set of 5; the ×10 now opens at Map 8** · Decide · Shop · asked 2026-11-03 · decided 2026-11-03
- Owner 11-03 18:40: "for 5x pack, unlock it slightly earlier". The shop sells 1 and then sets of 10 / 25 / 50 / 100 / 250 (PACK_QTY_TIERS), first at Map 9 / 14 / 19 / 29 / 44. There is no ×5. UI17 moved the first set, the ×10, one map earlier: Map 8 (was Map 9), with the shelves' bundles. Buy again on the opener's last summary makes repeat singles one tap.
  - a) Keep: ×10 at Map 8, no ×5
  - b) Also add a ×5 set (no discount) from Map 4 or 5
  - c) Move the ×10 further, to Map 6 or 7
- **Default:** a

**UI17-3. Retire Admin -> "Reset my progress" (it does less than it says when signed in)** · Decide · Admin · asked 2026-11-03 · decided 2026-11-03
- Checked 11-03: on a signed-in account its cloud deletes of profiles and player_currencies do nothing (those tables have no delete policy), it never touches player_progress, and it leaves the tutorial, faction and Codex keys on the device. So after the reload the currencies, the conquest progress, the tutorials and the faction come back from the cloud; only cards, decks and local stats stay gone. The new Full reset (new account) does all of it (currencies set to a new player's, the progress blob replaced with the admin-reset marker, the name back to the placeholder). Profile -> Reset all / Reset to Map are unchanged (they also keep currencies, cards and decks in the cloud).
  - a) Remove "Reset my progress"; keep Full reset, Reset all, Reset to Map
  - b) Keep it as is
- **Default:** a

**UI17-4. Full reset keeps your editor content** · Decide · Admin · asked 2026-11-03 · decided 2026-11-03
- The Full reset (new account) wipes every progress key but keeps, besides Admin Mode, device settings and infinite Energy: your browser-only card edits, map layout and skirmish edits, NPC speech edits, tutorial setup, pack overrides, test rules and UI switches (they are admin content, not a player's save, and unpublished card edits would be lost for good). The server-only rating, friends and guild membership also stay (the client cannot reset them).
  - a) Keep the editor content
  - b) Wipe it too
- **Default:** a

**THEME5-1. Pick the extra carried cards (one new archetype each)** · Decide · Maps · asked 2026-11-03
- Your 11-03 09:39 rule, written out: Maps 0-10 as today (8-11 own + 4-5 carried); Maps 11-20 carried 5-6 (+1); Maps 21+ own 7-10 and carried 6-7 (-1 / +2); each side map +1 carried over its list today. That is 34 cards: 11 on Maps 11-20 (Savanna +2, it has 3), 8 on Maps 21-24, 15 on side maps. Claude proposes one candidate per slot, each opening a deck plan the map's PRO / BPRO decks don't have (no plan shares more than 3 of its 6 cards with any of them), e.g. Eyrie Heights: The Gannet Queen (Stoop and Pounce); Redwood Deep: Badger Lumberjack (Old-Growth Giants ramp); Savanna: Ant Hill (Mound and Herd) + Golden Eagle Diver (Sun Strike); Taiga: Owl Nightwatch (Moonlit Pack, a night map); Goldfeather Keep: Ore-Smelter Mole (Iron Vault for Iron Badger) + Golden Magpie (Counting House). Maps 21-24 also each drop one own card (suggestions in the doc). Also proposed for the deck step later: per map, 3 fights get one slightly down-tuned peak strategy each (stepped down deckopt's ladder until the Map reference is in that fight's green band, still 35-50% against BPRO-1), the rest a random weaker blend. Nothing applied; not optimizer-checked (machine busy). docs/balance/theme5/carried-proposal-2026-11-03.md
  - a) Take Claude's 34 picks as proposed.
  - b) Take them with changes (name the swaps, and the own card each Map 21-24 drops).
  - c) Side maps follow their unlock map's main tier instead (+2 for the Ice Hollow, the Old Bramble and the Basalt Foundry).
  - d) Not yet.
- **Default:** d) Not yet.

**BAL15-1. The tempo term of a 0-Lumber, Wait 0-1 Rare at bramble 15: not measurable; cap 1 would put 3 cards over** · Decide · Balance · asked 2026-11-03 · decided 2026-11-03
- DEC1 / BAL12-3's re-measure at the road's 15-Health bramble (tools/bench/bench.js contrib --bramble 15, 400 paired fights a card; all 15 in-play T cards = Rare+, Lumber 0, Wait 0-1, and a seeded 60 R / 25 C / 25 O sample; docs/balance/bal15/tempo-cap-2026-11-03.md). T sits 0.59 stat points a copy over R, a share 0.04 [-0.12, 0.20] of T's 14.6 (z 0.48; BAL12 read 0.082 [-0.08, 0.24] at 30 Health). As a cap-2 term it is 0.08 tighter [0, 0.37] (the budget has x0.85, 0.15) and limits no card either way: cap 2 never binds these cards (use 0.13-0.52). Only cap 1 could carry it: N x 0.96 puts Dolphin Knight 3/9, Pike Lancer 3/9 and Vigil Owl 4/3 over (cap-1 use 0.96; The Caldera Wyrm, your card, is over already at 1.08); at the interval's upper bound (N x 0.80) 12 of the 17. By the brief it is not applied (it puts in-play cards over). Nothing changed.
  - a) Keep the term on cap 2 at x0.85 (no effect on any card today).
  - b) Cap 2 at the measured x0.92 (looser; no effect either).
  - c) Move it to cap 1 at N x 0.96 and re-fit the three within BAL12's rule (a card re-fit; the owner put rebalancing off on 11-03 09:39).
  - d) Drop the term: the measure does not separate it from zero.
- **Default:** a

**BAL14-1. Four cards the budget reads over that no re-fit within the rule reaches** · Decide · Balance · asked 2026-11-03 · decided 2026-11-03
- After the full bramble-15 re-measure (BAL14), BAL12's re-fit rule (each stat within 2, body shape kept) changed Hoopoe Herald 2/13 -> 2/12 and Pika Hoarder 3/14 -> 3/13. Four cards read over the band and no line within the rule fits: Forager Ant 1/6 (cap-1 use 1.03; the fit 1/5 turns the wall into a balanced body), Otter Angler 1/11 (1.24, fit 1/6), Leafcutter Gardener 2/5 (1.21, fit 1/4), Gannet Nestweaver 1/7 (1.07, fit 1/5). The last three were held by BAL12 (BAL12-1). Your named cards over the band (proposals only, never changed): Caldera Wyrm 4/7 1.08 (new over; tests/bal2-2026-10-24.js check 7 fails on it), Peak Condor 4/10 1.08 (was 1.01), Conch Herald 2/13 1.11, Red-billed Chough 3/2 1.01. docs/balance/bal14/refit-2026-11-03.json.
  - a) Leave them as they are (the budget flag stays).
  - b) Take the plain fits (Forager Ant 1/5, Otter Angler 1/6, Leafcutter Gardener 1/4, Gannet Nestweaver 1/5).
  - c) Name your own lines.
- **Outcome:** Claude's call (owner 11-03 09:39: 'Balance items you can choose. Like ENG and FIX and UI.'): a) leave them as they are, the budget flag stays (no default; owner 11-03 09:39: no rebalancing now). Forager Ant, Otter Angler, Leafcutter Gardener, Gannet Nestweaver and the owner's named cards are held for the owner's card pass.

**BAL14-2. Flying and Evasive multipliers: the bramble-15 measures read x1.19 / x1.18** · Decide · Balance · asked 2026-11-03 · decided 2026-11-03
- The price step reads the half-miss skills from their measures: Flying x1.19 [1.18, 1.20], Evasive x1.18 [1.17, 1.20] on stat terms of 20.8; the budget has x1.17 / x1.16. A constant changes only on your word (tools/pipeline/run.sh price --set-const flying=1.19,evasive=1.18).
  - a) Set them to the measures.
  - b) Keep x1.17 / x1.16.
- **Outcome:** Claude's call (owner 11-03 09:39: 'Balance items you can choose. Like ENG and FIX and UI.'): a) set them to the measures: Flying x1.17 -> x1.19, Evasive x1.16 -> x1.18 in bramblewood-budget.js MISS_MULT_BY (no default; the bramble-15 measures). No card re-fit for it (owner: no rebalancing now); the Flying / Evasive cards read slightly dearer. DEC1.

**BAL14-3. An On Ready Lumber gain trigger measures well under On Ready +1 Lumber** · Decide · Balance · asked 2026-11-03 · decided 2026-11-03
- At bramble 15 the trigger 'On Ready: gain 1 Lumber' on its in-play carriers reads 2.65 stat points, while the canon point On Ready +1 Lumber reads 6.65 and BAL12's lumberGainS prices the trigger from it (6.65 x N^0.175); gain 2 / 3 read 4.40 / 5.53 against 7.51 / 8.06, On Spawn gain 1 2.54 against 6.65. So the Lumber makers priced by lumberGainS are 2.5-4 points dearer than they measure. BAL14 left lumberGainS as it is (a formula call) and kept these readings out of the trigger pairs' multipliers.
  - a) Price On Ready / On Spawn Lumber gains from their own measures (lumberGainS about x0.5), then re-fit the makers.
  - b) Keep lumberGainS and re-measure the trigger on the canon's carriers first.
- **Outcome:** Claude's call (owner 11-03 09:39: 'Balance items you can choose. Like ENG and FIX and UI.'): a) as the owner put it ('Just change the budget ... we don't need do anything'): an On Ready / On Spawn Lumber gain is priced from its own bramble-15 measures, lumberGainS = onReadyGold x 0.39 x N^0.71 (2.62 / 4.28 / 5.71 for gain 1 / 2 / 3; was x N^0.175: 6.65 / 7.51 / 8.06; a log fit of the five readings 2.65 / 2.54 / 4.40 / 4.40 / 5.53). The Lumber makers were not re-fitted: the budget now reads them under, not over. DEC1.

**BAL14-4. The biggest price moves of the bramble-15 re-measure, for a look** · Decide · Balance · asked 2026-11-03 · decided 2026-11-03
- Set by the price step (canonical/skill-costs.json; measures in docs/balance/pipeline/measures.json), price at the measured N before -> after: Arrow 2 5.21 -> 7.01 (7 cards), Fire Arrow 1 / 2 4.43 / 5.20 -> 6.56 / 8.04, Brood 2 5.28 -> 8.26, Spitfire 1 4.95 -> 7.72, Rocket 4 4.95 -> 7.68, Perforate 2 5.24 -> 7.88, Sweep 5 5.59 -> 8.04, On Ready 3 damage 3.85 -> 5.56, Pounce 6 5.06 -> 7.38, Lone Wolf 5.10 -> 7.36, Pearl Bed 0.9 -> 3.85 (ENG19-3), Pearl 0.9 -> 2.76, Majesty 3.4 -> 3.88 a point. Only two cards left the budget band (the re-fit). Still wide at 400 fights (not converged): Immolation 1, Backstab 2 / 3, Drunk, Earthquake 3, Evolute, Hunter 1, Nightblind, Parasite, Quarry 1, Scatterbrained, the On Spawn stun on everyone, Guardian, Crab Claws, Taunt. Glean, Lumber Feast and Stop Drop and Roll read nothing on the vanilla carriers (no forager, no spare Lumber, no fire) and keep their logic prices.
  - a) Keep the measured prices.
  - b) Re-measure the wide ones at 1,000 fights first.
  - c) Name the ones to put back.
- **Outcome:** Claude's call (owner 11-03 09:39: 'Balance items you can choose. Like ENG and FIX and UI.'): noted, no action (no default): the measured prices stand (a); the wide ones can be re-measured at 1,000 fights in a later balance package.

**ENG19-1. Majesty: which rule, and on which cards** · Decide · Skills · asked 2026-11-02 · decided 2026-11-03
- Owner 22:15 #13: "New skill Majesty (also for dragons). Not sure who to place it on for now." Built (a), on no card. a) Awe (built, key majesty): while it is Ready, the enemy units facing it (its column and the columns beside it) swing at -N Attack (never below 0); several Majesty units don't stack on one foe (the biggest N). Price 3.4 a point (about 2 foes in reach x 0.8 uptime x Debuff's 2.1 a point of Attack). b) Court: its adjacent allies get +N Attack while it is Ready (an aura; about 1.4 neighbours x Buff 2.1 x 0.8 = 2.4 a point). c) Untouchable: enemy units with less Attack than its own can't aim their swings at it (they hit beside it or the bramble); fixed, about 4. Fits: the five dragons (Red, Blue, Green, White, Black: Legendary+, Supreme already, so Majesty 1 is the natural add; Black Dragon's 10 Attack suits c), Glacial Ape-King and Rodent King (King type), Pride Queen and The Gannet Queen (leaders), Elderhorn Monarch.
  - a) Awe, -N Attack to the foes facing it (built)
  - b) Court, +N Attack to its adjacent allies
  - c) Untouchable, weaker foes can't target it
- **Default:** a) Awe, -N Attack to the foes facing it (built)
- **Outcome:** Claude's call (owner 11-03 09:39: 'Balance items you can choose. Like ENG and FIX and UI.'): a) Awe (built): Majesty N gives the enemy units facing it -N Attack; it stays on no card until the owner places it (the dragons are owner cards).

**ENG19-2. Grant Shield: which cards get it** · Decide · Skills · asked 2026-11-02 · decided 2026-11-03
- Owner 22:15 #15: "Invent a new (skill) action that increases the shield of <Target(s)> by N. It would be epic to have a card give +3 Shields all On Play." Built: action grantShield with one number per group, any together: itself (amount), each adjacent ally (front, behind, left, right), each ally around it (corners too), every ally (itself included). Works on any trigger (On Play, On Ready, On Attack ...). Prices (canonical/skill-costs.json): 0.4 / 0.56 / 0.64 / 1.2 a point x the trigger. "On Play: +3 Shield to every ally" = 1.05 x 3.6 = 3.78 S. On no card. Candidates: Oyster Bank (Map 2, Shore Up already: On Play +1 adjacent, a small wall-builder), Giant Clam (Map 10, On Ready +2 itself), Shepherd (Guardian: On Play +2 adjacent), Royal Guard (Super Rare: On Play +3 every ally, the owner's epic case), Grovebearer Dragon-Turtle (Legendary: On Ready +3 every ally), a Majesty dragon (ENG19-1).
  - Royal Guard: On Play +3 every ally
  - Grovebearer Dragon-Turtle: On Ready +3 every ally
  - Shepherd: On Play +2 adjacent
  - Pick others
- **Default:** Royal Guard: On Play +3 every ally
- **Outcome:** Claude's call (owner 11-03 09:39: 'Balance items you can choose. Like ENG and FIX and UI.'): Royal Guard: On Play +3 Shield to every ally (the owner's epic case). It replaces Armor 1 + Boomerang (a third skill would break the two-skill rule), re-fit 4/8 -> 3/6 (S 10.21, cap-1 use 0.98): the only line within BAL12's rule (each stat within 2, hitter kept); with Armor or Boomerang kept beside it the fit is 2/7, a balanced body. On no road deck. DEC1.

**ENG19-3. Pearl Bed now pays every turn: re-price it, and Giant Clam / Oyster Bank** · Decide · Skills · asked 2026-11-02 · decided 2026-11-03
- Owner 22:15 #5: "Pearl - On Ready, Pearl Bed - Every turn (readied)." Built: Pearl N (new) is the old rule (On Ready +N Pearl, once; 0.9 a point). Pearl Bed N now pays +N Pearl at the start of every turn the unit is Ready. Before: Pearl Bed was On Ready, once, and there was no Pearl. The two cards with Pearl Bed 1 (Oyster Bank, Map 2; Giant Clam, Map 10) now pay every turn: a power rise. Pearl Bed's price is still 0.9 (this package adds new keys only); by the 4-round rule it is about 3.2 a point (about 4 Ready turns x 0.9 x Wait 0.9), which would put both cards over budget unless they move to Pearl.
  - Keep Pearl Bed on both, re-price to 3.2 and re-fit the cards
  - Move both cards to Pearl 1 (as they played before)
  - One of each: Oyster Bank Pearl, Giant Clam Pearl Bed
- **Default:** Move both cards to Pearl 1 (as they played before)
- **Outcome:** Claude's call (owner 11-03 09:39: 'Balance items you can choose. Like ENG and FIX and UI.'): Move both cards to Pearl 1 (as they played before): Oyster Bank and Giant Clam Pearl Bed 1 -> Pearl 1, stats kept (both on no list today; Oyster Bank in band 0.90, Giant Clam reads over 1.09 at Pearl's measured 2.76, fit 4/5: a flag for when it is listed). DEC1.

**ENG19-4. Swarm counts Structures now (a power change)** · Decide · Battle rules · asked 2026-11-02 · decided 2026-11-03
- Owner 22:15 #6: "Swarm: Structures do count, so remove that phrase." The engine did not count them (package EN, 2026-10-23, owner 01:57 note 10: "Swarm doesn't count structures"). Built: an allied Structure that shares a Type with the Swarm unit now counts (a Changeling or Growth token as before), and the texts, codex and catalogue no longer say they don't. Swarm units beside a Structure of their Type hit harder; the Swarm price is unchanged.
  - Keep (as built)
  - Back to not counting Structures
- **Default:** Keep (as built)
- **Outcome:** Claude's call (owner 11-03 09:39: 'Balance items you can choose. Like ENG and FIX and UI.'): Keep (as built): Swarm counts an allied Structure of its Type.

**ENG19-5. On Attack goes off after the swing** · Decide · Battle rules · asked 2026-11-02 · decided 2026-11-03
- Owner 22:15 #12: "On attack triggers happen after attack. For example draw. You should immediately draw a card." Built: a unit's On Attack triggers go off right after its swing (and the swing's answers: Thorns, a counter, Sweep / Fork prongs), both sides. Before, they went off as it committed to the swing, before the blow; and the page only redrew your hand after the round, so a drawn card looked like next turn's draw. Now it lands in your hand as the draw plays in the replay. Fire on hit still goes off before the blow (it loads that swing). A swing that finds nothing still fires them. Silence / Stymie / Exhaust / Petrify (On Attack, adjacent enemies) now land after the hit, so the struck unit's Thorns and on-hit answers still go off that swing. A unit that dies in its own swing still draws, gains or hits, but gives itself nothing (heal, buff, Shield, cleanse).
  - Keep (as built)
  - Silence / Stymie / Exhaust / Petrify before the blow again
  - A unit killed in its swing fires nothing
- **Default:** Keep (as built)
- **Outcome:** Claude's call (owner 11-03 09:39: 'Balance items you can choose. Like ENG and FIX and UI.'): Keep (as built): On Attack goes off after the swing.

**BAL13-1. Hercules Beetle stays in 14-A-4: it is that fight's own first-clear card** · Decide · Balance · asked 2026-11-02 · decided 2026-11-03
- BAL11-3 b took the late-priced cards out of the earlier fights' decks (BAL13). Hercules Beetle (priced as a Map 18 card) is the first-clear reward of the Canopy's 14-A-4 (Drum Circle), so BAL13 kept its copies there (the swap rule keeps first-clear cards); every other early copy is gone (14-A-PRO-2, 14-A-BPRO-1, 14-A-BPRO-3). A player still gets it on Map 14.
  - a) Leave it: the reward and its showcase stay on the Canopy.
  - b) Move the 14-A-4 reward to another card of the Canopy's list and take the beetle out of 14-A-4 (an owner pick of the new reward).
  - c) Keep the reward, drop the beetle to 1 copy in 14-A-4.
- **Default:** a
- **Outcome:** Claude's call (owner 11-03 09:39: 'Balance items you can choose. Like ENG and FIX and UI.'): a) leave it: Hercules Beetle stays 14-A-4's first-clear reward and in that fight's deck.

**BAL13-2. RAR-1 cards now above their fights' rarity cap (14 fights)** · Decide · Balance · asked 2026-11-02 · decided 2026-11-03
- After RAR-1 (13 cards one rarity up, BAL12) these fights field a card above the fight's own rarity cap (roadRarityCap): Echidna Quillshot (Super Rare) in 19-3, 19-4, 19-5, 19-6, 19-A-5, 19-A-9 and 11-UC-10 (cap Very Rare), 11-UC-11, 11-UC-12 (cap Rare); Trapdoor Spider (Very Rare) in 7-A-3, 7-A-5 (cap Rare); Vampire Bat (Rare) in 8-A-1, 8-A-2, 8-A-3 (cap Uncommon). BAL13 trimmed copies to the new copy caps only (coordinator 20:19). tests/road-rarity will flag them once BAL12's cards.json lands.
  - a) Swap those copies for the list's nearest card within the cap (BAL13's swap, a follow-up).
  - b) Raise those fights' caps.
  - c) Leave them.
- **Default:** a
- **Outcome:** Claude's call (owner 11-03 09:39: 'Balance items you can choose. Like ENG and FIX and UI.'): a) swap: done by BAL13's overcap step (2026-11-03: 10 road decks, 3 PRO decks, docs/balance/bal13/overcap-2026-11-03.json) and DEC1's 19-6 swap (BAL12-6). The 11-UC fights are the endless Undercroft's floors, dealt from themes (not road decks). tools/bal13/decks_2026_11_02.js overcap now reads 0 to swap, 0 flagged.

**BAL13-3. "Reference (Random)" now deals the reference ladder (10 named decks a map)** · Decide · PRO · asked 2026-11-02 · decided 2026-11-03
- Owner 22:15: "When I click fight in an SK or WK match, the reference deck is random right? 1-10 decks? ... Can you name the 10 decks, per map?" Before BAL13 it dealt the 5 progression decks (prog, REF5), uniformly at random (refSetFor: 1 + floor(Math.random() x n), drawn again after every fight). BAL13 baked the reference ladder (docs/balance/ref/ref-ladder.json: 10 decks a map and side map, weak to strong, each named from its lead card and shape, each with the leader a player holds there) as the default, also uniform; the label reads "Reference i of 10: <name>". The progression decks stay selectable in Admin (prog-1..5).
  - a) Keep the ladder as the default.
  - b) Default back to the 5 progression decks; the ladder selectable.
- **Default:** a
- **Outcome:** Claude's call (owner 11-03 09:39: 'Balance items you can choose. Like ENG and FIX and UI.'): a) keep the reference ladder as the default of Reference (Random); the progression decks stay selectable in Admin.

**BAL13-4. Why every reference deck showed "Bog-stilt House"** · Decide · PRO · asked 2026-11-02 · decided 2026-11-03
- Owner 22:15: "Is it always 'Bog-stilt House' deck?" Bog-stilt House is not a card in any reference deck: it is the bramble (your castle) the progression reference decks bring (REF_DECK_SETS.prog, BAL9 JJ7). tools/opt/ref5_prog.js chooseBramble gives every deck of a map the same bramble, the best-scoring one open before that map: Bog-stilt House from Map 7 to Map 17 (55 of the 105 decks), so the panel showed it whichever deck was drawn. Not a dealing bug. The new default (BAL13-3, the ladder) names no bramble: you keep your own.
  - a) Leave it (the ladder is the default now; the prog decks keep their best bramble).
  - b) Give each progression player (seed) a bramble of its own (a REF5 follow-up).
- **Default:** a
- **Outcome:** Claude's call (owner 11-03 09:39: 'Balance items you can choose. Like ENG and FIX and UI.'): a) leave it: not a dealing bug, and the ladder (the default) names no bramble.

**BAL13-5. Too-easy road fights: no stronger rebuild** · Decide · Maps · asked 2026-11-02 · decided 2026-11-02
- BAL13 item 4 (rebuild too-easy enemy decks stronger from the fight's own list) was dropped before anything was applied.
- **Outcome:** Owner 2026-11-02 20:19: "There's nothing to do but change the cards! we chose the cards, we balanced them, we optimised the decks etc. The only thing that should change is the card. But we shouldn't choose new cards." The fights more than 20 off get card flags instead (docs/balance/bal13/card-flags-2026-11-02.md, BAL13-6).

**ENG18-1. Pack chains: side by side only, or adjacent (front / behind too)?** · Decide · Battle rules · asked 2026-11-02 · decided 2026-11-03
- Owner 19:56: "Adjacent in front, behind, left, right." Pack ("Pack units of its type side by side") chains left / right in the front row only today (packChainsOf reads the front row); a raid's or group dungeon's middle / back-row Pack units never chain. With the owner's word a chain could run through any adjacent Pack units. Audit: docs/eng18-adjacency-2026-11-02.md #26. Balance: raids and group dungeons only (one-row fights have no front / behind of your own), so no road fight changes; Pack cards (Dhole Runner, Mire Rat, Gnawed Matriarch; leaders Dhole Matriarch, Gnawed Matriarch) get stronger there with b) or c), up to about +2/+2 per extra link; the budget prices Pack on one row, so raid Pack decks would sit above their line.
  - a) Keep: side by side in the front row only
  - b) Adjacent: a chain runs left, right, in front and behind on raid / group-dungeon boards
  - c) Each row chains on its own (left / right in the middle and back rows too), no front / behind links
- **Default:** a) Keep: side by side in the front row only
- **Outcome:** Claude's call (owner 11-03 09:39: 'Balance items you can choose. Like ENG and FIX and UI.'): a) keep: Pack chains side by side in the front row only (as built; no road fight changes).

**ENG18-2. Shore Up: the allies left / right, or every adjacent ally?** · Decide · Battle rules · asked 2026-11-02 · decided 2026-11-03
- Shore Up gives Shield 1 to the allies left and right of it in its row, not in front or behind (owner EN4 option B, 10-23 22:23); its text says "beside it" and the Codex says left and right. Under the 19:56 word "adjacent" it would also brace the allies in front of and behind it. Audit #25. Balance: raids and group dungeons only; Oyster Bank and Musk Ox Matriarch give up to 4 Shields a hit instead of 2 there (about +1 Shield a hit on a full board); no road change.
  - a) Keep left / right (EN4 B)
  - b) Adjacent: + in front / behind on raid / group-dungeon boards
- **Default:** a) Keep left / right (EN4 B)
- **Outcome:** Claude's call (owner 11-03 09:39: 'Balance items you can choose. Like ENG and FIX and UI.'): a) keep Shore Up on the allies left / right (EN4 B, as built).

**ENG18-3. Stench and SK3 area targets: the facing enemy and its adjacent units, or the 3-column shape?** · Decide · Battle rules · asked 2026-11-02 · decided 2026-11-03
- GD2-5 kept Stench as a shape (the enemy facing it and those beside it). Built since GD2: an SK3 area target (Stench, and any trigger with the area target) reaches the facing enemy and its adjacent units (sk3Beside), so on a raid / group-dungeon board also the enemy behind the facing one. ENG18 worded it as built ("the units adjacent to that one"). Audit #21. Balance: no card has Stench or an area SK3 target today, so nothing changes now; a future Stench card is about one target stronger in raids with a).
  - a) Keep as built: adjacent to the facing enemy (worded so)
  - b) Back to the GD2-5 shape: the facing enemy and left / right only
- **Default:** a) Keep as built: adjacent to the facing enemy (worded so)
- **Outcome:** Claude's call (owner 11-03 09:39: 'Balance items you can choose. Like ENG and FIX and UI.'): a) keep as built: an area target reaches the facing enemy and its adjacent units (worded so by ENG18).

**ENG18-4. Tokens "beside it": the nearest free slot in its row, or an adjacent slot first?** · Decide · Battle rules · asked 2026-11-02 · decided 2026-11-03
- Twin, Sprout, Brood, Revive N, Duplicate, death tokens, a Relic and a Meiosis split go into the nearest free slot in the unit's own row, however far (owner BF6: "Spawn closest slot to the spawner"); their texts say "beside it". On one row that is already left / right first. On a raid / group-dungeon board an adjacent slot in front / behind could come first. Audit #40. Balance: raids and group dungeons only, and small: tokens land a row away instead of a few columns away (they guard / block a different column); no road change.
  - a) Keep: the nearest free slot in its row (BF6)
  - b) An adjacent free slot first (left, right, in front, behind), then the nearest in its row
- **Default:** a) Keep: the nearest free slot in its row (BF6)
- **Outcome:** Claude's call (owner 11-03 09:39: 'Balance items you can choose. Like ENG and FIX and UI.'): a) keep: tokens go into the nearest free slot in the unit's own row (BF6, as built).

**ENG18-5. A Spawner in a raid's middle / back row spawns into the front row** · Decide · Battle rules · asked 2026-11-02 · decided 2026-11-03
- Read from the code (sk3SpawnAdjacent -> nearestFreeSlot, not run): a Spawner always puts its token into the front row, the free slot nearest its column, even when it stands in a raid's or group dungeon's middle / back row. Brood, Twin and Sprout use the unit's own row there (spawnBeside, package RR). Text now: "into the free slot nearest it". Audit #41. Balance: no card has Spawner today; with b) a back-row Spawner's tokens would stay behind the front line (safer, but they block less).
  - a) Keep: into the front row
  - b) Its own row, like Brood and Twin
- **Default:** b) Its own row, like Brood and Twin
- **Outcome:** Claude's call (owner 11-03 09:39: 'Balance items you can choose. Like ENG and FIX and UI.'): b) its own row, like Brood and Twin: bramblewood-engine.js sk3SpawnAdjacent now puts a middle- / back-row Spawner's unit (and a Duplicate of a unit there) into the free slot nearest it in its own row (rowFreeSlotNear, as spawnBeside). One-row fights unchanged; no card has Spawner today. DEC1.

**ENG20-1. Fire and water: the numbers (built as proposed)** · Decide · Battle rules · asked 2026-11-02 · decided 2026-11-03
- Owner 22:44: "Fire damage should light the target on fire, or remove wet counters first. (Tide and Ebb add a water counter if the card doesn't have counters - flood up to max 2 counters, ebb up to max 1) (Water damage adds water counters = damage)". Built (ENG20): a unit holds up to 3 water counters (💧N pip); water damage adds counters equal to the damage and puts Burn out. At a round's start a unit in the water with no counter gets 2 in a Flood or High Tide, 1 in an Ebb (only Swimmer / Tide units are in the water in an Ebb); a unit that has counters gets none, and counters stay until fire dries them (they no longer vanish when the tide goes out). Wet = its counters (a Swimmer / Tide unit is always at least 1) + 1 under Rain; each lightning hit still gets +1 a Wet counter. A fire hit that lands dries 1 counter a point; if points are left once the unit is dry and the fire came from a unit (a swing, shot or skill), it is Burning (🔥 pip): 1 fire at the start of each of the next 2 rounds; a new fire hit refreshes it to 2, it never stacks. Field fire (Scorching, the volcano, Wildfire) dries but lights nothing; a unit that resists fire (Resist, Immune, Dry) never burns; Cleanse removes Burn. Cards affected: the 19 fire attackers and 17 fire-skill cards hit harder (about +2 a lit target), the 29 fire-resistant cards are spared; on tidal maps land units now stay Wet (2) after a Flood, so the 9 lightning cards hit them harder; Tide Spirit and the 5 Wave / Tsunami cards now soak their targets (shielding them from Burn).
  - As built
  - Fire dries one counter a hit (not a point)
  - Burn 1 round (half the damage)
  - Counters dry by 1 at each Ebb
  - Cap 2 counters
- **Default:** As built
- **Outcome:** Claude's call (owner 11-03 09:39: 'Balance items you can choose. Like ENG and FIX and UI.'): As built (fire dries a counter a point, Burn 2 rounds, cap 3).

**ENG20-2. Carriers for the three new skills: Stop, Drop and Roll; Glean; Lumber Feast** · Decide · Skills · asked 2026-11-02
- Built, priced, texts in 12 languages, on no card. Stop, Drop and Roll 🤸 (owner 22:44: "take the fire damage, but put it out by 'rolling on the floor'"): when it would start Burning it rolls instead: the hit's damage lands, no Burn, Wait +1 (it loses its next swing); 0.2 fixed (not measured). Glean 🫐 (owner 22:47: "takes any berry counter it can on the map to +1 shield"): every turn while Ready it takes every Berry on the board, both sides, any row (Berries have no range rule; only Foraging makes them, Pickpocket steals them on a hit) and gains +1 Shield each; 0.3 fixed. Lumber Feast N 🪵 (owner 22:47: "Like sacrifice, there's one that'll just take your lumber and eat it"): as it arrives, after its cost, it eats up to N of your Lumber (default 3), +1/+1 for each; 0.7 a point of N. Suggested homes: Stop, Drop and Roll on a volcano-map ground unit facing fire decks (a Basalt Boar-like 'rolling' animal or a fire-map Badger); Glean beside the Foraging cards' maps (a magpie, a bird or a bear on the berry maps); Lumber Feast on a beaver or termite card on a Lumber-rich map.
  - Claude places them on 1-2 thematic cards each, re-fitted to budget
  - Owner picks the cards
  - Keep them in the pool for now
- **Default:** Owner picks the cards

**ENG20-3. A +0/N buff ending never kills, and damage eats the buff first: which buffs** · Confirm · Battle rules · asked 2026-11-02 · decided 2026-11-03
- Owner 22:44: "if a defensive (+0/N) buff is removed and the unit would die, they remain with 1 health instead. Damage dealt to it always prioritises the buff-health, not the true health. Otherwise, debuffs can sometimes kill units." Built as a cap: when a live +0/N buff shrinks or ends the unit keeps its Health up to the new maximum, never below 1, so a hit that landed during the buff came off the buff first. Now on Nature's Force, Kinship, Pack / Pack Leader, Formation, Herald and the Crosswind; the Zeitgeber / state Health and an equipped piece already worked this way. Before, those five auras took their whole N off the unit's Health (never below 1). Debuffs, Wither and Isolation deepening still take Health. Cards affected (their allies keep more Health when the aura source dies): Rivergate Tribune, Honeyjoe Brewer (Kinship), Dhole Runner, Dhole Matriarch, Mire Rat, Gnawed Matriarch (Pack), Lichen Tortoise (Nature's Force).
  - As built
  - Also on temporary +0/N from triggers (buff action)
- **Default:** As built
- **Outcome:** Claude's call (owner 11-03 09:39: 'Balance items you can choose. Like ENG and FIX and UI.'): As built (the five auras and the Crosswind; temporary trigger buffs unchanged).

**ENG20-4. Heavy and cross winds: which maps, and the Crosswind for Flyers only** · Decide · Field · asked 2026-11-02 · decided 2026-11-03
- Owner 22:44: "Heavy tailwind/headwind and sidewind (much rarer) - only more advanced later on field effects can have sidewind ... Heavy headwind = -2 attack but skills happen twice. Heavy tailwind = haste + fast forward 1 (attack at speed +1). Side wind = ... +0/2 or +0/5 for heavy side wind." Built: Heavy Headwind (its Flyers -2 Attack, their active skills twice), Heavy Tailwind (Quick and one Fast Forward), Crosswind (no back or face; every Flyer on both sides +0/2 for the round), Heavy Crosswind (+0/5). From Map 30 a windy fight's strong gust is heavy 1 in 4 and blows across 15% of the time (both: a Heavy Crosswind). Today the windy maps are Maps 3, 11, 18, 19 and 20, so nothing rolls a heavy or cross wind yet and no card's power changed; no fixed field names them. The Crosswind is scoped to Flyers (as the note's 'birds can strafe'); the wind pill shows ⇈ / ⇊ for heavy and ↔ / ⇔ across, and a calm round now shows still air ('Calm: no wind', owner 22:49).
  - As built (Map 30+ only, dormant until a later windy map)
  - Heavy from Map 18 (18, 19, 20 at 1 in 4), Crosswind from Map 30
  - Crosswind for every unit, not just Flyers
  - Give one later map a fixed Crosswind field
- **Default:** As built (Map 30+ only, dormant until a later windy map)
- **Outcome:** Claude's call (owner 11-03 09:39: 'Balance items you can choose. Like ENG and FIX and UI.'): As built (heavy / cross winds from Map 30 only; dormant today).

**ENG20-5. Road check for fire, water, Remember and the CPU's Devour (not measured in ENG20)** · Confirm · Balance · asked 2026-11-02 · decided 2026-11-03
- Not measured in this package. Expected moves: fire decks stronger (Burn), most on the volcano maps (Maps 11, 20, 22) where both sides carry fire; lightning decks stronger on tidal maps (land units keep 2 counters); Remember cards weaker (Marsh Wisp, Bog Revenant, The Unremembered, Ashbone Ghoul come back once only; their measured worth 4.92 a point was taken with repeat returns possible); the CPU's Pit Glutton and Hollow-belly Rat get fed when it helps instead of a 40% coin flip; King Maker (King Slayer 4) now hits every leader. Proposed: the batch's balance package measures the volcano, sea and Remember fights and re-prices Remember.
  - Road check in the batch's balance package (swaps only)
  - Leave it
- **Default:** Road check in the batch's balance package (swaps only)
- **Outcome:** Claude's call (owner 11-03 09:39: 'Balance items you can choose. Like ENG and FIX and UI.'): Road check in the batch's balance package: done by BAL13 / BAL14's fresh road measure on the current engine (docs/balance/bal13/summary-2026-11-03.md, 12 / 40 / 20 / 40) and BAL14's Remember re-price (4.63 x N^-1.03).

**FIX6-1. Your leader now comes out on Auto and in the sims; should the CPU save for its leader too? (LEAD-4)** · Decide · Battle · asked 2026-11-02 · decided 2026-11-03
- Owner 11-02 21:37: the Drowned Matriarch 'is never played'. Cause: your leader waits beside the board, but Auto-play never summoned it and the sims dealt your seat no leader. Built (FIX6): a seat the engine plays for you (Auto-play, the sims' reference player) brings its leader out as soon as it can pay (once), pitches for it and keeps its Lumber up to 2 turns. The CPU's own leaders are unchanged (LEAD-4: no saving, a 35% roll a turn): in 4-5 Old Sturgeon still comes out in about 60% of games and the Drowned Matriarch copies in its deck are played from hand. With the CPU's rule alone, a cost-1 leader in a deck of free cards came out in 8-19 of 60 games.
  - Leave the CPU as it is (LEAD-4 stands)
  - The CPU saves for its leader too (harder fights everywhere; needs a road retune)
  - Enemy leaders cost no Lumber
- **Default:** Leave the CPU as it is (LEAD-4 stands)
- **Outcome:** Claude's call (owner 11-03 09:39: 'Balance items you can choose. Like ENG and FIX and UI.'): Leave the CPU as it is (LEAD-4 stands).

**FIX6-2. The sims now play a reference set's leader; the road's Map reference still has none** · Decide · Balance · asked 2026-11-02 · decided 2026-11-03
- Built (FIX6): playReferenceGame deals your seat the set's leader (dealPlayerLeader), so Reference (Random), Reference-2 and any set naming a leader now play it. Spot checks, Reference (Random) deck 1, 60 games: 5-7 57% -> 80%, 10-3 65% -> 88%, 10-9 50% -> 85%, 16-4 55% -> 73%. Win rates measured with those sets before FIX6 (BAL9 / BAL10 / PRO ease) were low by that much. The road measure's Map reference names no leader, so the road numbers do not move, but every real player has one (at least the Wandering Traveller, 3/5, cost 0).
  - Re-measure the reference sets with their leaders only (BAL13)
  - Also give the Map reference a leader (the Wandering Traveller, or the best one owned by then) and re-measure the road
  - Keep the old leaderless numbers
- **Default:** Re-measure the reference sets with their leaders only (BAL13)
- **Outcome:** Claude's call (owner 11-03 09:39: 'Balance items you can choose. Like ENG and FIX and UI.'): Re-measure the reference sets with their leaders only: done by BAL13 / BAL14 (summary and card flags with leaders through FIX6's referenceFightSetup({leader})); the road's Map reference keeps no leader.

**FIX6-3. The Tower's boss pool: dragons are now Mythic, Divine and Ancient** · Decide · Maps · asked 2026-11-02 · decided 2026-11-03
- KK20: TOWER_POOLS listed 20 of 35 cards under a rarity they no longer have. Fixed (FIX6): each tier holds its own rarity, a new Very Rare tier, the three Uncommons (Octopus Tactician, Drowned Matriarch, Old Shell) out, the Caldera Wyrm (Heroic) moved from the boss pool to the Heroics and the Fire Drake Hatchling added there, since the top floors could not reach their rating with 3 Heroics. tests/keywords-2026-10-15w3.js had 15 Tower failures (a floor 836 off its rating) and now passes. Left as is: the boss pool's head is a Legendary only for the Blue Dragon and the Old Willow; Red and Green Dragons are Mythic, White Divine, Black Ancient (the floor's levels still land it on its rating).
  - Keep the dragons heading boss floors
  - Only Legendaries head boss floors (Blue Dragon, Old Willow of the Ford)
- **Default:** Keep the dragons heading boss floors
- **Outcome:** Claude's call (owner 11-03 09:39: 'Balance items you can choose. Like ENG and FIX and UI.'): Keep the dragons heading boss floors (as built).

**UI16-1. Player card looks: earned by play, or sold too?** · Decide · Profile · asked 2026-11-02 · decided 2026-11-03
- Owner 11-02 22:15 note 1: the profile editor now has Background (6), Border (5), Font (4), a word before your name (5 + none) and after it (5 + none), beside the character, colour and title. There was no cosmetics rule in project-state.md or decisions.json, so UI16 gates them like the titles: one or two of each free, the rest by a cleared map (Outskirts, Ashen Spurn, Caves & Alcoves, Wolfsbane, Coral Current, Sundered Peak), a player level (10, 15, 25), a first Conquest win or 50 cards. Nothing is sold.
  - a) Keep them earned by play only
  - b) Also sell some in the shop (gems / Krooni), keeping the earned ones
  - c) Change the unlock list (say which)
- **Default:** a
- **Outcome:** Claude's call (owner 11-03 09:39: 'Balance items you can choose. Like ENG and FIX and UI.'): a) keep the card looks earned by play only.

**UI16-2. Prefix and suffix: around your name, or around your title?** · Decide · Profile · asked 2026-11-02 · decided 2026-11-03
- Note 1 asked for a title, a prefix title and a suffix title. UI16 puts the prefix and suffix around your NAME ("Brave Jay of the Glade") and keeps the title as its own chip ("Trailblazer"), shown wherever your card shows (profile, What rivals see, the versus card, PvP, your co-op seat).
  - a) Keep: around the name
  - b) Around the title instead ("Brave Trailblazer of the Glade", the name alone)
- **Default:** a
- **Outcome:** Claude's call (owner 11-03 09:39: 'Balance items you can choose. Like ENG and FIX and UI.'): a) keep the prefix / suffix around the name.

**UI16-3. The versus card with art: the boss skull / elite star frame** · Decide · UI · asked 2026-11-02 · decided 2026-11-03
- Note 9: a rival with a leader (or a bramble with a picture) now shows the leader's and the bramble's art, feathered, in place of the round portrait, so the VIS3 skull frame (boss) and star frame (elite) that sat on that portrait are not drawn there; the kicker still says BOSS / ELITE in red / violet and the card's border keeps its boss / elite colour. A fight with no art keeps the framed portrait.
  - a) Keep as is
  - b) Put a small skull / star badge on the leader's picture
- **Default:** a
- **Outcome:** Claude's call (owner 11-03 09:39: 'Balance items you can choose. Like ENG and FIX and UI.'): a) keep as is (the kicker and border carry BOSS / ELITE).

**UI16-4. Show other players' card looks in the co-op lobby** · Decide · Co-op · asked 2026-11-02 · decided 2026-11-03
- Note 1: your own seat in the co-op lobby wears your card (background, border, font, prefix / suffix, avatar). Other players' seats can too once the room carries their avatar: one line in bramblewood-coop.js (seatOf keeps p.avatar) and gdJoin's me: {..., avatar: loadAvatar()} (the co-op package's files, so not done in UI16). The lobby code already reads x.avatar when it is there. PvP ghosts already carry their looks (the avatar record they upload).
  - a) Do it in the next co-op package
  - b) Not needed
- **Default:** a
- **Outcome:** Claude's call (owner 11-03 09:39: 'Balance items you can choose. Like ENG and FIX and UI.'): a) done by ENG18 (2026-11-02): co-op seats keep avatar (seatOf / addHuman / hello) and the page sends loadAvatar() with a join.

**CONTENT6-1. Savanna Reaches: 3 carried cards after the cut (rule 4-5)** · Decide · Maps · asked 2026-11-02 · decided 2026-11-02
- Owner 11-02 14:10: take a carried card out of Savanna Reaches (m5), toward balancing animals per type. Cut: Leafcutter Gardener (ant; the ant group is the most-listed of the four carried cards' groups: ant 9, cat 7, mouse 5, crow 4); it stays on The Savanna side map (my) and Map 7; its copies in 14-2 and 14-7 became House Cat (nearest by Lumber / Wait / 2A+H / rarity). The file's list was 11 own + 4 carried (counted by first map list, and by the Map cards view's Carried pill), not 9 + 6, so it is now 11 own + 3 carried, one under the 4-5 rule. Options: a) keep 11 + 3; b) carry one more card (e.g. a non-ant one from the maybes or an earlier map) to get back to 4; c) also cut an own card (Weaver Bird is the 14-3 first-clear card, so not that one) to get to 10 + 3.

**CONTENT6-2. Renamed elementals: the boss name and two optional renames** · Decide · Cards · asked 2026-11-02 · decided 2026-11-02
- CONTENT6 gave twelve form-less cards an animal and a name that shows it (Ember Firefly, Tide Seahorse, Stormcaller Owl, Magma Rhino, Rimeheart Mammoth, Wisp Newt, Revenant Bog Turtle, Unremembered Heron, Stoneheart Tortoise, Stalactite Pill Bug, Iron Badger, Blackmass Rat); ids unchanged, art queued (docs/art/content6-2026-11-02-briefs.md). a) The Rimefire Caldera's boss node 22-8 is still called "The Rimeheart Colossus": rename it "The Rimeheart Mammoth"? b) Gale Sprite and Alpine Avalanche already show their animal in the art (a swift, a snow bear) and were left as they are; rename them too (Gale Swift is taken; e.g. Whirlwind Swift, Avalanche Bear)?

**CONTENT7-1. Where do the six new sea cards go? (proposed, on no list yet)** · Decide · Maps · asked 2026-11-02 · decided 2026-11-02
- IDEA-11-02 (owner 11-02 19:56) built as cards, unlisted (awaitingSource + unattainable, so out of play until placed). Priced at their proposed map's budget term and their rarity (Level 1, 3A + H + S <= N): Bloodworm Common 2/6 (Lumber 0, Wait 1; Poison 1, Bleed 1; the worm with four jaws, Glycera; the lore bible has no other candidate) -> Pebble Beach (Map 2, mb); Bright Night Algae Common 1/3 (0/1; Bloom: night, a copy beside it at night, the night twin of Pond Algae) -> Kelp Mangroves (Map 9, mk); Bobbit Worm Uncommon 4/10 (1/2; Ambush 2, Gash 2) -> Kelp Mangroves (Map 9); Man o' War Rare 3/13 (1/2; Poison 2, Tide) -> Kelp Mangroves (Map 9); Nautiloid Rare 3/14 (1/2; Armor 2, Pierce 2) -> Coral Current (Map 10, m7), beside the Nautilus Drifter; Pistol Shrimp Uncommon 4/4 (1/1; Stun on Hit 2) -> Coral Current (Map 10), beside the Mantis Shrimp. Placing a card is the owner's call (map-pools.json lists, then the skirmish-reward rule and deck checks); a card placed on a different map is re-fitted to that map's term (tools/content7_cards_2026_11_02.js).
  - Place as proposed (Pebble Beach 1, Kelp Mangroves 3, Coral Current 2)
  - Place on other maps (say which)
  - Keep unlisted for now
- **Default:** Keep unlisted for now

**CONTENT7-2. Unicorn, Sphinx and Griffin: Mythic, unlisted, marked for Map 56+** · Discuss · Cards · asked 2026-11-02 · decided 2026-11-02
- IDEA-11-02 built the three mythic creatures as Mythic cards on no list (awaitingSource + unattainable; creatorNote says MARKED FOR MAP 56+; the road's Mythic ladder starts at Map 60, so Map 56+ is a side or late-map slot to be chosen). Priced with the Map 56 term (3A + H + S inside N 64.3): Unicorn 7/33 (Lumber 3, Wait 4; Healing 3, Cure 2; animal: horse), Sphinx 9/33 (3/4; Confuse 50% for 2 rounds, Daunt 1; animal: lion), Griffin 10/22 (3/4; Flying, Pounce 2; animal: griffin, eagle and lion). Two skills each, existing keywords only. Placement and how a Mythic is obtained are open until Map 56+ exists.

**CONTENT7-3. New cards: animal affinity and two renames (CONTENT6-2 b)** · Discuss · Cards · asked 2026-11-02 · decided 2026-11-02
- Every new card has an animal (owner rule: no pure elementals): bloodworm, bobbit worm, man o' war, nautiloid, pistol shrimp, horse, lion, griffin. Bright Night Algae is the one soft case: the owner asked for blown-up glowing bacteria, so its animal is 'glowing bacterium' with the plant subtype, as Pond Algae ('algae'). Say if it should be a real animal instead (e.g. a sea sparkle or comb jelly) and it is re-painted. Renamed per CONTENT6-2 b (owner 19:56): Gale Sprite -> Whirlwind Swift, Alpine Avalanche -> Avalanche Bear (ids unchanged; names and flavour in all 12 language packs). tools/animal_tags.py got two lines (Bright Night Algae, Unicorn) so the animal tags regenerate.
  - Keep the glowing bacterium
  - Make it an animal (say which)
- **Default:** Keep the glowing bacterium

**BAL-ROLES. Who balances what** · Decide · Balance · asked 2026-11-02 · decided 2026-11-02
- Owner 11-02 14:13: "your job is doing a rough 1st pass before my pass in fitting a card's power budget AND in optimising a deck given set cards. My job is to choose those cards, and rebalance them ... you don't rebalance when you think something is weird, you just flag it out, and your priority is figuring why the skill budget doesn't encapture this." Claude: budget fits (stats to N(L)) and deck optimisation from the given lists, plus a short list of card picks / cuts per map as suggestions. Owner: which cards are on the lists and any re-tune by feel. A card that plays stronger or weaker than its budget is flagged with the budget's blind spot, not changed.

**BAL11-1. Road fights the weak-deck search cannot bring to the band** · Decide · Maps · asked 2026-11-02 · decided 2026-11-02
- Owner on BAL10-6 (14:10): build the weaker deck from each too-hard fight's own list (no Baby cards). Done (tools/skirmish_pass.js weak; 67 fights rebuilt in three rounds, each checked for the list, K14, the boon and a 2-point gain): green 77 -> 107 of 226, beyond 20 points 87 -> 47 (docs/balance/bal11/road-2026-11-02.md). Still more than 20 under target: the Canopy (all 5; 14-A-1 / 14-A-5 have no K14-legal deck of their size, 14-A-3 / 14-A-4 none weak enough), Basalt Foundry (19-A-1/2/3/9), Wolfsbane 17-6 / 17-7 / 17-8, the Sunken Depths 10-A-4 / 10-A-5, Lilypad Reach 2-A-5 / 2-A-6, 4-1, 4-2. K14 alone blocks 11-10, 14-6, 17-5 and 9-1 (the weakest deck without K14 reaches the band, with K14 it does not).
  - a) Let a side map's own list count as map-unique for K14 (BAL10-6 b), then re-run the weak search.
  - b) A lower enemy bramble Health on the fights no deck reaches (BAL10-6 a).
  - c) The owner adds weak map-unique cards to those lists (docs/balance/bal11/suggestions-2026-11-02.md).
  - d) Leave them.
- **Default:** c, then a for the side maps

**BAL11-2. Stealth and Breach priced at the road's bramble Health (x2), and the time of day at home** · Decide · Balance · asked 2026-11-02 · decided 2026-11-02
- Every skill price was measured with both brambles at 30 Health; a road fight halves them (BRAMBLE_SCALE 0.5: your bramble is 15). tools/bal9/bramble_hp_2026_11_02.js (400 paired fights a variant): Stealth 3.44 points at 15 vs 1.10 at 30 (x3.1, 6 carriers), Breach 3.87 vs 1.80 (x2.2); Siege no clear change. Applied as a pricing correction (BAL-ROLES): Stealth 3.64 -> 7.28, Breach 2.25 -> 4.50 a point (the low end, x2). Nocturnal / Diurnal / Nightblind / Sunshy now take half their price from the card's home maps (skill-costs.json zeitHome; Owl Nightwatch 0.60, Echo Matriarch 0.77). Budget fits (each stat within 2): Owl Nightwatch 1/5 -> 1/3, Beetle Battering-Ram 4/11 -> 3/9 (Moray Ambusher and Raccoon Nightcrew, over their budget before and now further, are out of play: on no list, left). Held (no fit within 2 that keeps the body shape): Glass Octopus 4/9 (3/9 or 4/6), Subterraneaner 4/8 (2/6 or 3/3), Badger Sapper 3/15 (2/14).
  - a) Keep x2 and re-measure the canon at the game's bramble Health (15) in a later package; the owner picks the held cards' lines.
  - b) Use the measured x3 for Stealth.
  - c) Revert to the 30-Health prices.
- **Default:** a

**BAL11-3. Map term from where the road fields a card** · Decide · Balance · asked 2026-11-02 · decided 2026-11-02
- Beetle Battering-Ram and Siege Rhino are priced as Map 23 cards (+4.6 Base) but fight on Map 7 (7-A-3, 7-A-4) and Map 14 (the Canopy, the Savanna); they are the two strongest cards over the fair line of the maps measured (+7.0 / +5.5 a copy). Hercules Beetle: priced Map 18, listed Map 14.
  - a) The Map term (and the home share) from the earliest map whose list or road deck holds the card (budget formula; re-fits follow).
  - b) Take those cards out of the earlier fights (an owner pick).
  - c) Leave it.
- **Default:** b

**BAL11-4. Lumber makers and 0-Lumber Rares: proposed budget terms** · Decide · Balance · asked 2026-11-02 · decided 2026-11-02
- Measured over the fair line on their maps: Nautilus Drifter +4.5 and Coral Polyp Colony +4.1 (On Ready Lumber, on the Sunken Depths' costly list), Dune Packrat +3.5 (Pale Desert); Trapdoor Spider +3.5 / +3.9 (Rare 4/7 at 0 Lumber), Tide Spirit +4.2 (Rare 5/5, 0 Lumber), Vampire Bat +3.6. The budget prices a maker in the global context and gives a 0-Lumber Rare its whole Rarity term as turn-1 stats.
  - a) Measure the makers on their home maps (run.sh measure --map) and price them by the list's mean cost; a 10-15% tighter cap 2 for a 0-Lumber, 0-Wait Rare, measured first.
  - b) Leave the formula; the owner re-tunes these cards by feel.
- **Default:** a

**BAL11-5. Strong and weak decks per map; the N-WK practice skirmish** · Decide · PRO · asked 2026-11-02 · decided 2026-11-02
- Owner 14:26: "generate a super strong deck but also a super weak deck given the map cards, and the field effects ... for every N-SK, there is a N-WK (weak)". The weak decks: tools/opt/wpro_2026_11_02.js (BPRO's pool without Baby cards, BPRO's rule and gauntlet, the search minimising), 1-2 per map, canonical/pro-skirmishes.json wpro. The strong: the BPRO decks (rebuilt without Baby cards for the Redwood Deep, the Sunken Grove, the Morel Hollow and the Mycelium Deep). The game: an N-WK node beside N-SK (admin map nodes, the same panel and free flow, no SPECIAL swap). Win rates per map: docs/balance/bal11/strong-weak-2026-11-02.md.
  - a) As built; UI polish (a player-facing practice entry, a label in the 12 language packs) in a UI package.
- **Default:** a
- **Outcome:** a) Claude: as built. The Old Bramble has none (its list is over its fights' Common cap, as for BPRO).

**BASELVL-1. Starter and Baby cards: base Level 0 or 1?** · Decide · Cards · asked 2026-11-02 · decided 2026-11-02
- Owner 11-02 19:29: "Only Duckling is [a Baby card] (base level 0 like the rest of the starter and baby cards)." The game today: Base / starter cards (faction base, e.g. Worker Ant, Duckling) start at Level 1, per the owner's 2026-10-19 UT rule ("The tutorial base cards come as Level 0 is the special thing": only the copies the tutorial hands out are Level 0). Baby cards that are not starters (Fox Kit, Bear Cub, the eggs...) start at Level 1 too. Only Sparrow Chick and the Red Dragon egg read Level 0. 19 of 21 Baby cards and 25 starters are base Level 1. Hatchling is on from Level 1 (ENG17), so at Level 0 it would be off.
  - All starter and Baby cards start at Level 0 (Hatchling moves to Level 0)
  - Keep today's rule (Level 1; tutorial copies Level 0)
- **Default:** Keep today's rule (Level 1; tutorial copies Level 0)

**RAR-1. Rarity up one step for cards far over their map's fair line (fewer copies a deck)** · Decide · Balance · asked 2026-11-02 · decided 2026-11-02
- Owner 19:52: "Have we adjusted rarities? Help me do that." Caps: every listed card is at or below its first map's cap (BAL9-1 re-check today: 0 to lower; Dolphin Knight held, HH6). Proposal (BAL11's measures, +points over the fair line a copy): raise one step where the map's cap allows, so a deck holds one copy fewer and the budget line rises. Fits the cap: Beetle Battering-Ram (+7.0) and Siege Rhino (+5.5) Rare -> Very Rare; Pangolin Roller (+4.8) Uncommon -> Rare; Echidna Quillshot (+4.8) Very Rare -> Super Rare; Nautilus Drifter (+4.5), Tide Seahorse (+4.2), Trapdoor Spider (+3.9), Magma Salamander (+3.0) Rare -> Very Rare; Coral Polyp Colony (+4.1), Thorny Devil (+3.3), Dung Beetle (+3.0) Common -> Uncommon; Vampire Bat (+3.6), Dune Packrat (+3.5) Uncommon -> Rare. Over the cap (would need a cap exception, or stats): Walrus Icebreaker, Savanna Cheetah, Quicksand Queen (Very Rare), Mangrove Manatee, Echo Screecher, Giant Cave Huntsman (Rare). Stats unchanged; all stay inside the budget. Table: docs/balance/rarity-2026-11-02.md.
  - Apply all that fit the cap
  - Apply some (name them)
  - Keep rarities
- **Default:** Apply all that fit the cap
- **Outcome:** Applied all that fit the cap.

**BAL12-1. Three Lumber makers the re-fit cannot fit within 2 a stat** · Decide · Balance · asked 2026-11-02 · decided 2026-11-03
- BAL12 priced an On Ready / On Spawn trigger that gains Lumber from On Ready +1 Lumber (onReadyGold, 6.65 at bramble 15) x N^0.175, as measured (On Ready gain 1 / 2 / 3: 4.33 / 4.99 / 5.25 at 30 Health; gain 3 6.24 beside +1 Lumber 6.12 at 15); before, the shared trigger pair priced a Lumber at about 1.0 (the Dune Packrat's +3 at 3.14). Re-fit within 2 a stat: Nutria Reedcutter 2/9 -> 2/7, Talus Pika 2/7 -> 1/5. Held (no line within 2 a stat keeps the body): Otter Angler 1/11 (cap-1 use 1.24; fit 1/6), Leafcutter Gardener 2/5 (1.21; fit 1/4, hitter -> balanced), Gannet Nestweaver 1/7 (1.07; fit 1/5, wall -> balanced). docs/balance/bal12/refit-2026-11-02.json.
  - a) The fits: Otter Angler 1/6, Leafcutter Gardener 1/4, Gannet Nestweaver 1/5.
  - b) The owner's lines for the three.
  - c) Keep their stats and price their Lumber gain lower (an owner price).
- **Default:** b
- **Outcome:** Claude's call (owner 11-03 09:39: 'Balance items you can choose. Like ENG and FIX and UI.'): b) the owner's lines: none named yet, so Otter Angler 1/11, Leafcutter Gardener 2/5 and Gannet Nestweaver 1/7 stay as they are and carry on as BAL14-1 a (held, the budget flag stays, for the owner's card pass). No card changed.

**BAL12-2. The three cards BAL11 held, read at the bramble-15 prices** · Decide · Balance · asked 2026-11-02 · decided 2026-11-03
- Stealth measured at bramble 15: 6.88 (BAL11's x2 had 7.28); Breach 3.03 a point (x2 had 4.50); Siege 0.85 x N^0.851 (was 0.62 x N^1.036). Glass Octopus 4/9 (Corrode 2 + Stealth): cap-1 use 1.06, the fit 4/7 (Health -2, still a hitter). Subterraneaner 4/8 (Stealth + Ambush): 1.32, fit 2/7; Badger Sapper 3/15 (Siege 2 + Breach 1): 1.02, fit 3/14. Subterraneaner and Badger Sapper are on no list now (out of play).
  - a) Glass Octopus 4/7; the two out-of-play cards left until they are listed.
  - b) The owner's lines.
  - c) Leave all three.
- **Default:** a
- **Outcome:** Claude's call (owner 11-03 09:39: 'Balance items you can choose. Like ENG and FIX and UI.'): a) Glass Octopus 4/9 -> 4/7 (Health -2, still a hitter; cap-1 use 1.06 -> 0.99 at the bramble-15 prices: within BAL12's re-fit rule). Subterraneaner and Badger Sapper stay as they are until they are listed (out of play). DEC1.

**BAL12-3. The tempo cap 2 of a 0-Lumber Rare does not bite: move it to cap 1?** · Decide · Balance · asked 2026-11-02 · decided 2026-11-03
- BAL11-4 a: a 0-Lumber, Wait 0-1 card at Rare or rarer has cap 2 x 0.85 (bramblewood-budget.js TEMPO_CAP2_MULT; measured share 0.082 of their stats over the other Rare+ cards, cap 2 tighter by 0.16 [0, 0.43]; docs/balance/bal12/tempo-cap2-2026-11-02.md; read on the global in-play contribution run at 30 Health, the fresh bramble-15 run did not finish on the shared machine). None of the 17 such cards in play is limited by cap 2 (their cap-2 use 0.14-0.45), so no stat moved. The same share on cap 1 (N x 0.92 for these cards) would put 8 over: Otter Centurion, Dolphin Knight, Otter Scout, Tide Seahorse, Pike Lancer, Wandering Traveller, Vigil Owl, Caldera Wyrm (an owner card). Wait 1 is in (the owner's examples, Trapdoor Spider and Tide Seahorse, are Wait 1).
  - a) Keep it on cap 2 (no effect today).
  - b) Put the tempo term on cap 1 (N x 0.92), re-fit the 8 within 2 a stat.
  - c) Re-measure at bramble 15 first (a free machine, about 1 hour).
- **Default:** c, then b
- **Outcome:** Claude's call (owner 11-03 09:39: 'Balance items you can choose. Like ENG and FIX and UI.'): a) for now: keep the tempo term on cap 2 (no effect today). The default (c, then b) needs an hour's re-measure and a re-fit of 8 cards, a rebalance the owner put off on 11-03 09:39 ('don't have to rebalance for now'), so the smallest change wins; the bramble-15 tempo measure goes on the next balance package's list. Nothing changed.

**BAL12-4. Which existing cards take a Lumber gain ("design cards to give more lumber")** · Decide · Cards · asked 2026-11-02 · decided 2026-11-03
- Owner 22:26 (no new cards, 20:19). By theme (gatherers, hoarders, builders) and budget room for On Ready +1 Lumber (6.65 x its lists' multiplier): fits as is: Ant Hill 0/22 (room 6.77); nearly: Golden Magpie 1/6 (gives up 0.3), Iron Badger 0/35 (1.0), Bee Drone (owner card, 1.3); next: Ore-smelter Mole, Raven Scout, Hollow-belly Rat, Badger Stonemason, Friar Badger, Woodpecker Sapper (2.3-3.2 stat points each). Full list: docs/balance/bal12/lumber-candidates-2026-11-02.md. A cheap list (mean cost under 0.6, e.g. Pebble Beach) gets little from Lumber (0.39 of its worth); a costly list about the same as the global pool (1.0-1.14).
  - a) The owner picks cards from the list; BAL-ROLES fits their stats.
  - b) Ant Hill and Golden Magpie now (they fit or nearly).
- **Default:** a
- **Outcome:** Claude's call (owner 11-03 09:39: 'Balance items you can choose. Like ENG and FIX and UI.'): a) the owner picks cards from docs/balance/bal12/lumber-candidates-2026-11-02.md and BAL-ROLES fits their stats. No card changed now.

**BAL12-5. Finish the skill re-measure at bramble 15** · Decide · Balance · asked 2026-11-02 · decided 2026-11-03
- BAL12 re-measured the 15 canon points at bramble 15 (1,000 fights: Armor 1 2.65 -> 2.33, Fork 4.92 -> 3.89, On Ready +1 Lumber 5.21 -> 6.65, Rage 3.5 -> 3.01, Regen 2 3.45 -> 2.91, Shell 2 2.72 -> 2.26, Sweep 2 4.82 -> 5.08 ...; one stat point = 3.00 win-rate points at 15 vs 3.59 at 30) and 7 of the 240 in-play skill items (Stealth, Breach, Siege 1 / 4, Arrow 1, Arrow + Fletcher, Brood 1). The other 233 keep their 30-Health readings: the shared machine ran at 6-20 games a second (about 5 hours more). Run: tools/pipeline/run.sh measure --fights 200,400 (bramble 15 by default), then run.sh price and tools/bal12/refit_2026_11_02.js.
  - a) Run it overnight on a free machine (a follow-up package).
  - b) Only the skills on 2+ cards (59 items, about 1.5 hours free).
- **Default:** a
- **Outcome:** Claude's call (owner 11-03 09:39: 'Balance items you can choose. Like ENG and FIX and UI.'): a) done by BAL14 (2026-11-03): all 243 skill items measured at bramble 15 (228 converged, 15 wide at 400 fights; BAL14-4), priced and re-fit.

**BAL12-6. RAR-1 puts three cards over their fights' rarity cap** · Decide · Maps · asked 2026-11-02 · decided 2026-11-03
- After RAR-1 (applied by BAL12) tests/card-pass-2026-10-19.js check 4 finds 8 fights over the road's rarity cap: Echidna Quillshot (now Super Rare) is the exclusive reward of 19-6 and in the decks of 19-3, 19-4, 19-5, 19-6; Trapdoor Spider (now Very Rare) in 7-A-3 and 7-A-5; Beetle Battering-Ram (now Very Rare) in 7-A-4 (BAL13 takes it out of the earlier fights, BAL11-3 b). Echidna Quillshot is also over its first list's cap (Basalt Foundry, Very Rare: tests/bal9-2026-11-02.js JJ12, the rarity tool would lower it back). Road decks are BAL13's; the reward slot and the list cap are card-data calls.
  - a) BAL13 swaps them out of those decks; 19-6's reward slot gets another new Basalt Foundry card (BAL9's reward rule).
  - b) Echidna Quillshot back to Very Rare (keep it as 19-6's reward); Trapdoor Spider out of 7-A-3 / 7-A-5.
  - c) A cap exception for these fights.
- **Default:** a
- **Outcome:** Claude's call (owner 11-03 09:39: 'Balance items you can choose. Like ENG and FIX and UI.'): a) Echidna Quillshot leaves 19-6's skirmish-exclusive reward slot (now a basic-pack card, tier 3, rarity kept at Super Rare by RAR-1); the slot goes to Anvilwhisker Otter (Uncommon, a new Basalt Foundry card, seeded pick from the map's new pack cards inside the Very Rare cap, BAL9's reward rule); its copy in the 19-6 deck -> Pit Glutton (the list's nearest within the cap, as BAL13 did in 19-3..19-5). BAL13 had already swapped it out of 19-3, 19-4, 19-5 and Trapdoor Spider out of 7-A-3 / 7-A-5. DEC1.

**LEAD-NAT-1. A natural leader per faction past Map 10** · Idea · Cards · asked 2026-11-02
- Owner 21:39 on Drowned Matriarch always being his leader: "There are no natural leaders! I'll consider that when thinking about new base cards to add. I think past Map 10, we should think about 1 natural leader per faction." Noted for the owner's next base-card pass; FIX6 checks how the default leader is picked meanwhile.
  - Owner adds them
  - Later
- **Default:** Owner adds them

**IDEA-VREGIA. Victoria Regia: the spiky giant water lily** · Idea · Cards · asked 2026-11-02
- Owner 22:15: "Victoria Regia - spiky water lily! So amazing, it pushes leaves aside with its ungrown leaf - then the leaf itself is spiky." Card idea (flora, water): on play it pushes adjacent units aside (left / right) to open its space, then the pad is spiky (Thorns). Not built: new cards wait for the owner's pick of map and list (owner 20:19: no new cards on lists for now).
  - Build it (owner names the map)
  - Later
- **Default:** Later

**IDEA-BRAMBLES. Brambles with their own identity (design pass, then balance pass)** · Idea · Brambles · asked 2026-11-02
- Owner 22:44: "Brambles are right now very not-unique and distinctive. In the future, there will be one that literally does heal 4 on every end turn or something. And one that gives all your cards +1 attack. Or one that allows sacrifice (your hand) to give it 1 thorns and +1 hp. etc." A future design pass gives each bramble one signature effect, then a balance pass prices them. Not started.
  - Start after the card balance pass
  - Later
- **Default:** Start after the card balance pass

**IDEA-EARLY-1. Early game: Guardians on the early walls** · Idea · Early game · asked 2026-11-02
- Owner 19:56 idea: more Guardians in Maps 0-5 so the first fights teach lanes and walls. Each early map list gets 1-2 Guardian cards and each early boss deck one.
  - Build it
  - Later
  - No
- **Default:** Later

**IDEA-EARLY-2. Early game: a boss with one gimmick per map** · Idea · Early game · asked 2026-11-02
- Maps 0-5 bosses each do one memorable thing the player can see coming (the Gannet Queen dives on a row end every 3rd turn; Old Shell hides in its shell when hit twice), shown by a small intent icon over the boss before it acts.
  - Build it
  - Later
  - No
- **Default:** Later

**IDEA-EARLY-3. Early game: a keyword of the map** · Idea · Early game · asked 2026-11-02
- Each early map introduces one keyword (Swift, Flying, Guardian, Stealth...): its list leans on it, its first pack guarantees one card with it, and the map card names it. The player learns one idea per map.
  - Build it
  - Later
  - No
- **Default:** Later

**IDEA-EARLY-4. Early game: stars per fight** · Idea · Early game · asked 2026-11-02
- Each fight gets 1-3 stars (win; win with your bramble above half; win in N rounds), with a small Gold / Kibble bonus per star the first time. Gives replay reasons and a sense of mastery without harder fights.
  - Build it
  - Later
  - No
- **Default:** Later

**IDEA-EARLY-5. Early game: a combo shown on each map** · Idea · Early game · asked 2026-11-02
- Each early map's list holds one two-card combo (e.g. a Stem and an evolute, a Brood maker and a buffer), shown on the map card as a hint; playing it once gives a small reward.
  - Build it
  - Later
  - No
- **Default:** Later

**IDEA-EARLY-6. Early game: shorter first fights** · Idea · Early game · asked 2026-11-02
- Lower bramble Health on Maps 0-2 (or one fewer round to win) so the first 10 fights last 3-4 minutes; measured against the road curve before applying.
  - Build it
  - Later
  - No
- **Default:** Later

**IDEA-EARLY-7. Early game: an event node between fights** · Idea · Early game · asked 2026-11-02
- One non-fight node per early map: a wandering trader (swap a card), a shrine (a one-fight boon), a lost egg (a Baby card). Breaks up fight after fight.
  - Build it
  - Later
  - No
- **Default:** Later

**BAL10-1. The Old Bramble's PRO / BPRO decks under its Map 21 cap** · Decide · PRO · asked 2026-11-02 · decided 2026-11-02
- DECK1's Old Bramble decks (0-B-PRO-1/2) were built under the old Common cap and failed DECK1's 10-copies-from-the-list rule. CARD5 capped its fights by Map 21 (BAL9-5).
  - a) Re-run DECK1 for the Old Bramble only; no BPRO when 6 cards cannot hold 20 copies.
  - b) Leave the old decks.
- **Default:** a
- **Outcome:** a) Claude (owner delegated): DECK1 re-run for mo only (tools/opt/deck1 --map mo): 0-B-PRO-1 big 76%, 0-B-PRO-2 open 73%; the evasion deck (64%) dropped because it held Swamp Rabbit, a card on no list. No Old Bramble BPRO: its list is Rare / Very Rare (copy caps 3 / 2), so 6 different cards hold at most 19 copies (bpro2 plan now says so instead of crashing). BAL9's tools no longer skip the Old Bramble (SKIP_LOCS); its 0-B-3 lost Thornwood Palisade (tutorial-only) to the list's nearest cards.

**BAL10-2. Flying and Evasive multipliers against the BAL10 measure** · Decide · Balance · asked 2026-11-02 · decided 2026-11-02
- The pipeline price step reads Flying x1.19 [1.18, 1.20] and Evasive x1.18 [1.17, 1.20] from the measures; the budget has x1.17 / x1.16.
  - a) Keep x1.17 / x1.16 (a 0.02 gap; changing it re-fits every flyer).
  - b) Set x1.19 / x1.18 (--set-const).
- **Default:** a
- **Outcome:** a) Claude (owner delegated): kept. The gap is 2 points of a multiplier on about 21 stat points (under half a stat point a card); re-measure after the next card wave.

**BAL10-3. Skill prices from the BAL10 measure, and the Bola double count** · Decide · Balance · asked 2026-11-02 · decided 2026-11-02
- The pipeline measured 240 in-play skill items on the post-BAL9 game (115 new, 125 reused) and re-wrote 125 table entries of canonical/skill-costs.json. Bola (plus: arrow) got its whole measured worth, Arrow shot included (5.58), as the Pin's value, so the shot was counted twice and the Net Thrower read 1.16 of its budget.
  - a) Keep the new prices; Bola stays at its logic price 2 (the measured Pin is 5.58 - Arrow 1 4.43 = 1.15).
  - b) Revert all prices.
- **Default:** a
- **Outcome:** a) Claude: new prices kept; Bola kept at 2 with a dated note in skill-costs.json. Tool gap to fix later: tools/skill2_apply_2026_10_31.js prices should subtract the plus-skill's price for a plus entry (not in BAL10's files). Moves of 1.5+ points: Moonborn 4 -> 1.23, Weapon Master 3 -> 0.37, Devour 4 -> 1.21, Weaken 1 -> 3.12, Avalanche 6.81 -> 5.23, Twin Strike 6.99 -> 5.11.

**BAL10-4. Cards re-fit after the BAL10 prices** · Decide · Cards · asked 2026-11-02 · decided 2026-11-02
- The refit step pushed 8 in-play cards out of their band: 5 rule-clean (1 point each), 3 flagged (Lunar Howler +3, Net Thrower -4 with a shape change, Corpse Flower Beetle at the hitter line), and Wrong-Way Salmon held for ENG15.
  - a) Apply the 5; Lunar Howler 4/2 and Corpse Flower Beetle 4/10 by hand (each stat within 2); Net Thrower unchanged once Bola is fixed.
  - b) Apply only the 5.
- **Default:** a
- **Outcome:** a) Claude: Lamprey 3/5 -> 2/5, Banded Sea Krait 4/4 -> 4/3, Beaver Lumberjack 3/4 -> 3/3, Otter Centurion 3/6 -> 3/5, Trash Panda Trickster 2/4 -> 2/3, Lunar Howler 2/1 -> 4/2 (Moonborn re-priced; use 0.37 -> 0.60), Corpse Flower Beetle 4/11 -> 4/10 (use 1.00 -> 0.96), Wrong-Way Salmon 1/11 -> 1/10 (use 1.01 -> 0.95; the pipeline held it for ENG15, which has shipped, so tools/pipeline/config.json skipSkills is now empty). No owner-named card changed (Dolphin Knight, Peak Condor, Red-billed Chough, Caldera Wyrm, Conch Herald 1/13 untouched); no stat moved more than 2.

**BAL10-5. Road retune after BAL9 / CARD5: swaps only, inside the list and K14** · Decide · Maps · asked 2026-11-02 · decided 2026-11-02
- Road measured before (Map reference, 40 games a fight, Maps 0-20 and side maps): 39 of 226 fights in the green band, 115 more than 20 points off. Retuned by tools/skirmish_pass.js curve (swaps only; leaders, first-clear cards and sizes kept; 5-7 distinct), each fix checked against the fight's own list (BAL9 cut-card rule) and K14 (tools/bal9/road_fix_2026_11_02.js; round 3 with the new curve --strict).
  - a) Keep the accepted swaps and list the rest as gaps (BF3: honest levers only).
- **Default:** a
- **Outcome:** a) Claude: 111 fights retuned in three rounds; green 39 -> 77, within 10 points 52 -> 90, beyond 20 115 -> 87 (docs/balance/bal10/road-2026-11-02.md). The rest are listed gaps; see BAL10-6.

**BAL10-6. Road fights that deck swaps cannot reach** · Decide · Maps · asked 2026-11-02 · decided 2026-11-02
- Owner 11-02 14:13 (balance roles): BAL11 FLAGS the over-tuned cards and finds why the skill budget misses them; it does not re-tune them. | Owner 11-02 14:10: build the weakest deck from each too-hard fight's map list (no Baby cards); the optimised decks are too hard because 1-2 cards are over-tuned (e.g. Stealth against the low bramble Health, a Nocturnal +4/+0 card). Done in BAL11. | After BAL10's retune 87 of 226 fights (Maps 0-20) are still more than 20 points off, nearly all too hard: The Canopy 3% (target 68), The Sunken Depths 18%, The Mycelium Deep 26%, The Pale Desert 30%, Wolfsbane Tundra 31%, Basalt Foundry 36%, Caves & Alcoves 38%, and many first fights (4-1, 8-1, 10-1 at 37-55% against 90). Under the fight's own list, K14 (non-unique cards 1 copy, 6 in all) and 5-7 distinct cards, the curve search had no legal move left on 129 of 155 off fights. A side map's list cards mostly count as non-unique for K14, so its decks cannot swap down.
  - a) Allow a lower enemy bramble Health (at most 40% off) on too-hard fights only.
  - b) Let a side map's own list count as map-unique for K14.
  - c) Rebuild the Map reference decks (the yardstick may be too weak after BAL9's cut swaps; Reference Random agrees on Maps 4, 14, 17).
  - d) Leave the gaps (BF3).
- **Default:** b + c

**BAL9-1. Rarities against the new map lists (JJ12)** · Decide · Cards · asked 2026-11-02 · decided 2026-11-02
- Owner 11-02 JJ12: "re-set rarities now the lists are chosen (e.g. Old Shell on Map 2 at most Uncommon)".
  - a) A listed card is at most the rarest fight of its first list (roadRarityCap, boss), and a skirmish-exclusive reward at most its own fight; only lowered; re-fit by the budget.
  - b) Leave the boss leaders at Heroic.
- **Default:** a
- **Outcome:** a) Claude (owner: you decide): 17 cards lowered (Old Shell, Drowned Matriarch, the Gannet Queen, Heron Hag, Echo Matriarch, Old Snapjaw Uncommon / Rare; Yeti Chieftain, Pride Queen, Wolfsbane Alpha, Reef Admiral Very Rare; Triumvirate Epic; Alley Cat, Octopus Tactician, Lucky Hopper, Pelican Diver, Gallery Orb-Weaver Uncommon; Ember Revenant Very Rare). A boss leader below Heroic keeps leading through the Leader skill (0.1). Held: Dolphin Knight (HH6). Not touched: the tutorial side map and the Old Bramble (BAL9-5). Reward slots: 5 slots re-filled with a new card of their map (Hedgehog Scout cut -> Lyrebird Mimic at 12-5; Obsidian Scorpion -> Fennec Fox at 18-5; the GD5 first-clear cards of 9-2, 9-4, 16-2). docs/balance/bal9/.

**BAL9-2. Reference (Random) rebuilt per map (JJ7)** · Decide · Balance · asked 2026-11-02 · decided 2026-11-02
- Owner 11-02 JJ7: reference decks hold weak / out-of-place cards; rebuild them optimised per map from what a player could own by then, the map's average field, a bramble and a leader, levelled to the map's average.
  - a) The five "Reference (Random)" decks a map (REF5's economy: packs, rewards, first clears, faction and level tracks), each searched against the map's fights under their fields, every card at the map's reference level (referencePlayerLevel, rounded: Lv 0 to Map 10 = each card's own level, Lv 3 from Map 11, Lv 4 from Map 18); leader = the strongest owned card that can lead, else the Wandering Traveller; bramble = the best one unlocked by then by the 4-round rule (Health + its ability).
  - b) Keep the Forge-share levels of REF5.
- **Default:** a
- **Outcome:** a) Claude (owner: you decide). The Map reference (WINRATE_REF_DECKS, Base + rewards, no packs) stays the road's yardstick; only its cut Hedgehog Scout was swapped for Lyrebird Mimic. Table of packs and levels: docs/balance/bal9/econ-2026-11-02.md.

**BAL9-3. Why Grey Seal Bull feels overtuned (JJ5)** · Decide · Balance · asked 2026-11-02 · decided 2026-11-02
- Owner 11-02 14:13 (balance roles): the Pincushion Urchin trim (judgment, not a budget fit) reverted to 2/4; Grey Seal Bull 3/12 kept as it answered the owner's own JJ5 note (his to revert). | Owner 11-02 JJ5: the feel differs from the formula (e.g. Grey Seal Bull).
  - a) Trim the clear cases on their home map's measure; keep the formula.
  - b) Change the formula's rarity step.
- **Default:** a
- **Outcome:** a) Claude: on Pebble Beach the bull is the third-strongest card (+6.1 a copy vs ~3.4 for a common) but fair per budget point: an Uncommon gets N 25.3 against the commons' ~16.7 at the same Lumber, Tide is always on in its home fights and Guardian is priced 0. Grey Seal Bull 4/11 -> 3/12, Pincushion Urchin 2/4 -> 2/3. The map's real outlier is Conch Herald (+10.3 a copy, z 12.6): an owner-named card (DECK1-5 lift), listed in BAL9-6.

**BAL9-4. More defenders (JJ28)** · Decide · Balance · asked 2026-11-02 · decided 2026-11-02
- Owner 11-02 00:18 JJ28: more defenders as part of strategy; measure, propose, Bulwark's worth included.
  - a) Each main map 1-19 with no defender on its list: its sturdiest wall gains Guardian (priced 0, measured -0.41: no stat change).
  - b) Add Bulwark (priced 5.62 x N^0.325) to walls and trim their stats.
- **Default:** a
- **Outcome:** a) Claude: 16 of 36 lists to Map 20 had a defender, now 35 of 36. Guardian added to Badger Lumberjack, Fiddler Crab Swarm, Venomlord Serpent, Hawthorn Shieldbug, Stalactite Golem, Ant Hill, Grizzly Vanguard, Marula Elephant, Dhole Matriarch, Glacial Ape King. Bulwark: SKILL2 already prices it on its measured curve (5.62 at N 1, 7.04 at N 2; the old 7.2 a point over-priced N 2 by half), so it is no longer a reason to avoid it.

**BAL9-5. The Old Bramble's list against its fights' Common cap** · Decide · Maps · asked 2026-11-02 · decided 2026-11-02
- BAL9 found: the Old Bramble (mo) opens at Map 21 but its fights are capped as Map 0 fights (Common), while its list holds Rare and Very Rare cards (the Ent, Echidna Quillshot, Dhole Matriarch ...). BAL9 did not lower them.
  - a) Cap the Old Bramble's fights by the map it opens on (21).
  - b) Lower its list's cards to Common.
  - c) Leave it (a come-back map with its own rules).
- **Default:** a
- **Outcome:** a) Coordinator (owner delegated): package CARD5 caps the Old Bramble's fights by Map 21, the map it opens at (map flag capByUnlock, arena_app.js roadRarityCap reads mapUnlockNumberOf): Super Rare skirmish cap, so its Rare / Very Rare list fits. Its Shield and levels stay as they were (shieldMap 17).

**BAL9-6. Owner-named cards outside the budget band** · Decide · Balance · asked 2026-11-02 · decided 2026-11-02
- Owner 11-02 14:13 (balance roles): reverted, Conch Herald back to the owner's 2/13; the coordinator flags owner cards, never re-tunes them. | BAL9 JJ21 left these as the owner set them: Peak Condor 4/10 (use 1.07), Conch Herald 2/13 (1.13; the strongest card on Pebble Beach by +6.0 a copy over the fair line, z 12.6), Red-billed Chough 3/2 (1.01), Caldera Wyrm 4/7 (1.02, a Dragon).
  - a) Conch Herald back to 1/13 (DECK1-5 lifted it from 1/11), the rest as they are.
  - b) All four to the band.
  - c) Keep all four.
- **Default:** a
- **Outcome:** a) Coordinator (owner delegated): package CARD5 sets Conch Herald back to 1/13 (it measured +10.3 win-rate points a copy, the Pebble Beach outlier); Peak Condor, Red-billed Chough and Caldera Wyrm stay as the owner set them.

**BAL9-7. Map 40+ deck fill (JJ22) and cut-card swaps (JJ24)** · Decide · Decks · asked 2026-11-02 · decided 2026-11-02
- Owner 11-02 JJ22 / JJ24.
  - a) Map 40+: own cards to their caps, then one carried card at a time (earlier maps' list cards in the cap, lower rarity first, nearest map first). Cut cards: each copy to the nearest card of the fight's own list (Lumber, Wait, 2A + H, rarity), K14 kept, sizes kept.
- **Default:** a
- **Outcome:** a) Built: tools/bal9/lib_bal9.js fillDeckToSize, used by the BPRO build (tools/opt/bpro2) from Map 40. 100 cut cards out of 160 road decks and 58 PRO decks (under DECK1's 6/4 rule; 0-B-PRO-3 dropped to replaced); the BPRO decks were rebuilt from the lists. The road was not re-measured: run the road check (skirmish_pass measure) with the batch.

**ENG16-1. Quicksand: N, timing, exemptions and homes** · Decide · Field · asked 2026-11-02 · decided 2026-11-02
- Owner 11-02 (JJ19): "new field effect Quicksand: a creature ending its turn under N Health dies" (owner asleep: "Decisions - you decide").
  - a) N = 2 (a unit left on 1 Health sinks), checked at the end of every round from round 2 (after the fighting and ticks, before the round's death sweep), Flyers and Structures spared, paused by Field Breaker; on The Glass Dunes (every fight) and the Pale Desert's boss, the Quicksand Queen (18-A-9)
  - b) N = 3
  - c) checked at the start of each round, like the other field ticks
- **Default:** a
- **Outcome:** a) Coordinator call (ENG16): N = 2, end of round from round 2 ("from round 2" like the other field effects), the same exemptions as Tangled Roots / Grasping Briars (Flyers above it; Structures). Fights can set a number (quicksand: 3). Homes: The Glass Dunes (mapField) and 18-A-9 the Quicksand Queen. Art borrows the Sandstorm scene until it has its own.

**ENG16-2. A field effect or combination of its own on every map (JJ18)** · Decide · Field · asked 2026-11-02 · decided 2026-11-02
- Owner 11-02 (JJ18): "which maps lack a field effect or combo of their own; give each one (e.g. Aerie Vault: thunderstorm)". 12 maps shared their map-level set with another map. docs/balance/field-uniqueness-2026-11-02.md.
  - a) Existing effects in new combos (only Quicksand is new): Old Bramble + Tangled Roots, Long Grass + Tall Grass, Kelp Mangroves + Tangled Roots, Coral Current + Perma-tide, Glass Dunes + Quicksand, Ashen Spurn + Scorching I, Aerie Vault + Thunderstorm, Sunken Grove + Tide, The Canopy + Spring Rain, Goldfeather Keep + Bishop's Path, Caves & Alcoves + Landslide, Mycelium Deep + Spore Cloud
- **Default:** a
- **Outcome:** a) Coordinator call (ENG16). The Quiet Summit stays the one vanilla map (CONTENT4). The Tutorial keeps Map 0's Mist; the endless dungeons wait on CONTENT4-2. Win rates before / after in the write-up; no deck retuned (BAL9's job).

**ENG16-3. Baby cards and the egg's Hatch or Stay: the details** · Decide · Cards · asked 2026-11-02 · decided 2026-11-02
- Owner 11-02 (JJ25, replaces BABY-1): "Baby cards can be levelled 0 -> 1 -> 10. Getting an egg (and at each level-up) offers Hatch or Stay (the egg shakes); staying lets it level as an egg, for Evomax decks."
  - a) Every new copy of a Baby card comes at Level 0 (the Nest trains 0 -> 1, the Forge 1 -> 10; the starter babies too, no Base cap of 4). An egg card (egg-*) asks when a copy arrives and at each level-up of that copy (Forge or Nest); the question waits until no fight or dialog is up. Hatch: that copy becomes its creature (the fixed hatch, or a random Common / Uncommon map or pack card of its kind, as the engine's egg rule) at the egg's level; Stay: it stays an egg.
- **Default:** a
- **Outcome:** a) Coordinator call (ENG16). Open: what an egg is worth at Lv 10 in battle (it still cracks into a random creature when Ready, at its own stats); Evomax decks may want a hatch that keeps a level bonus. Hatching removes the egg copy, so a deck that held it shows one copy short until rebuilt.

**ENG16-4. Milling and the wind: the details** · Decide · Skills · asked 2026-11-02 · decided 2026-11-02
- Owner 11-02 (JJ17): "Milling: turns 1 of your Lumber into 2 Lumber; its skill worth x0.85"; WIND-2 (a).
  - a) Milling N: each turn while Ready, N of the Lumber you hold become 2N (net +N); with no Lumber nothing happens; Lumberjack still adds. Price: mult 1.54 -> 1.31 (x0.85), not re-measured. Wind: the Headwind's -1 Attack is on its swing (effAtk), not on fixed shots (Arrow N stays N); Quiet Contemplation no longer touches the wind (nothing doubles).
- **Default:** a
- **Outcome:** a) Coordinator call (ENG16). Re-measure Milling and the wind with the next skill measure.

**WIND-2. Wind is too strong: rebalance** · Decide · Field · asked 2026-11-02 · decided 2026-11-02
- Owner 11-02: "Wind have been too strong ... Maybe headwind = quick, tailwind = -1 attack". Today headwind Flyers' skills trigger twice.
  - a) Tailwind (wind at your back): Flyers get Quick. Headwind: Flyers -1 Attack. No double triggers.
  - b) As the owner wrote: headwind = Quick, tailwind = -1 Attack.
- **Default:** a
- **Outcome:** a) Coordinator call (owner: you decide): the wind at your back speeds you (Quick), the wind in your face slows your blows (-1 Attack); the double trigger goes. Odds stay 1/3 each way or calm. Built in ENG16; re-measure after. Built 2026-11-02 (ENG16): see ENG16-4.

**IDEA-11-02. New creature ideas (11-02)** · Discuss · Cards · asked 2026-11-02 · decided 2026-11-02
- Owner 11-02: Man o' war; bright algae as blown-up bacteria (Bloom but at night); Nautiloid; Bobbit worm; Pistol shrimp; the worm with 4 teeth; Unicorn, Sphinx, Griffin (mythic creatures at Map 56+).

**BABY-1. Can Baby cards be levelled?** · Decide · Cards · asked 2026-11-01 · decided 2026-11-01
- Owner 11-01 07:41: "these cards anyway, cannot be lvled. if enemies used them, they can be. (or can they be levelled...)?" (owner: "Decisions - you decide").
  - a) Players cannot level Baby cards; they grow by hatching / evolving instead. Enemy copies may carry levels (difficulty scaling).
  - b) Baby cards level like any card.
- **Default:** a
- **Outcome:** Superseded 11-02 by the owner (JJ25): Baby cards can be levelled 0 -> 1 -> 10; each step offers Hatch or Stay. Enemy decks may field them at a level.

**BABY-2. Hatchling skill for Baby cards (ties in with Evomax)** · Discuss · Skills · asked 2026-11-01 · decided 2026-11-02
- Owner 11-02 14:10: "Hatchling doesn't do that. It just does what we wanted Fodder to do." Hatchling replaces Fodder: the Baby card is feed for an Evomax evolute (Stem from Level 1), no growing into an adult card. Built in ENG17. | Owner 11-01 07:41: "baby cards might want a skill called 'hatchling' or something that indicates it can be hatched but as a skill. Can coincide with evomax creatures somehow." Coordinator draft: Hatchling (Grows into X): after N rounds on the board (or N wins in the collection), it grows into its adult card; an Evomax creature's first stage is a Hatchling. Owner to shape the rule; until then the card group label (Baby) is the only marker.

**SKILL2-1. Seven in-play cards: their re-priced skills alone break cap 2** · Decide · Balance · asked 2026-10-31 · decided 2026-10-31
- SKILL2 re-priced the skills in 3A + H stat points (BUDGET2-1 / BUDGET2-2). Cap 2 is A*H x m + S*|S| <= 1.57 x (N/3)^2: S is squared, so a skill price that rises x1.5-2 raises its cap-2 term x2-4. For seven in-play cards no stat line fits any more (or only one that takes over 40% of the card): Alley Cat 2/2 (Twin Strike 3.17 -> 6.99), Tide-pool Crab 1/3, Owl Nightwatch 1/5, Bee Forager 0/5 (On Attack -> Heal x8.2), Conch Crawler 2/2, Gatling Hog 2/9 (Twin Strike), Ant Warrior 2/4 (only 1/1 fits). They are left as they are and listed in docs/balance/skill2-refit-2026-10-31.json `held` (with the Caldera Wyrm, your over-on-purpose card). BUDGET2 kept cap 2 where it was when the stats changed scale (cap2Mult 2 -> 1.57); the same here would read S in the old currency: (S/2)*|S/2|.
  - Cap 2 reads S / 2 (keeps cap 2 where it was before the currency change; bramblewood-budget.js, one constant)
  - Trim a skill on each of the seven (a card-data package)
  - Leave them over cap 2
- **Default:** Cap 2 reads S / 2 (keeps cap 2 where it was before the currency change; bramblewood-budget.js, one constant)
- **Outcome:** Coordinator (owner's standing 'fill in the decisions'): cap 2 reads S / 2, the same scale fix BUDGET2 made for stats. One constant in bramblewood-budget.js; the seven cards then re-fit in BAL8.

**SKILL2-2. Flying and Evasive measure at a third of their price** · Decide · Balance · asked 2026-10-31 · decided 2026-10-31
- Flying (83 in-play cards) and Evasive (22) are priced as a multiplier on the stats (MISS_MULT_BY in bramblewood-budget.js: Flying x1.39, your estimate; Evasive x1.37), 10.4 points on the canon's carriers. The SKILL2 measure (1,000 paired fights, the placebo taken out) reads Flying 3.56 [3.32, 3.81] and Evasive 3.42 [3.11, 3.66]: about x1.13. This is why Gannet Cliffs' flyers sat under the fair line (DECK1-5): the DECK1-5 lifts (Peak Condor 4/7, Hawk Arrowkeeper 2/8, Red-billed Chough 3/2, Peregrine Stooper 2/8) put them at 112-123% of N on paper. SKILL2 measured these for the record only (a budget constant); nothing changed.
  - Keep x1.39 / x1.37
  - Set Flying and Evasive to the measured x1.13 (every flyer gains room; a card pass then lifts the flyers that fall well under)
  - Set them half-way (x1.25)
- **Default:** Set Flying and Evasive to the measured x1.13 (every flyer gains room; a card pass then lifts the flyers that fall well under)
- **Outcome:** Coordinator: set Flying and Evasive to the measured x1.13; a flyer card pass follows (in BAL8). The DECK1-5 lifts then sit near 100% of N.

**SKILL2-3. Armor measures concave, not 'slightly exponential'** · Decide · Balance · asked 2026-10-31 · decided 2026-10-31
- ENG9-9 (your rule): Armor is 1.68 x N^1.43, 'slightly exponential as 5 armor nullifies most damage'. The shared canon measure (BUDGET2-2) reads Armor 1 / 2 / 3 at 2.65 / 4.23 / 4.84 stat points: each point is worth less than the one before. The canon (Armor 1 and 2) now fixes the curve at 2.65 x N^0.675 (Armor 3 5.56, 4 6.75, 5 7.84; your rule gave 8.1 / 12.2 / 16.8 in the old currency). Armor 4-5 were not measured (no in-play card).
  - Keep the measured curve
  - Keep the canon at 1-2 and your x N^1.43 shape above 2
  - Measure Armor 4-5 first
- **Default:** Measure Armor 4-5 first
- **Outcome:** Coordinator: measure Armor 4-5 first (one canon-tool run, part of SPEED1's first pipeline run); keep the measured curve at 1-3 meanwhile.

**SKILL2-4. Field and partner skills read low on vanilla carriers: measure them on their home maps?** · Decide · Balance · asked 2026-10-31 · decided 2026-10-31
- The canon measure plays every road fight's field at its share, on vanilla carriers. Skills that need a field, a map or partners read low there: Tide 0.42 (price 1.5, 49 cards), Mountain Climber 0.37 (4), Dry 0.34 (4), Darksight 0.25 (3), Fog 0.08 (2.7), Kinship 0.86 (3), Guardian -0.82 (0), plus 18 more listed in docs/balance/skill2-prices-2026-10-31.json `kept`. SKILL2 raised such a skill when it read higher and kept its price otherwise. A home-map measure (the canon tool's --map N: the anchors played again in that map's context, about 15 minutes a map) would price them on the maps where they are played.
  - Measure them on their home maps (a follow-up package)
  - Keep their prices
- **Default:** Measure them on their home maps (a follow-up package)
- **Outcome:** Coordinator: yes, home-map measures, run as a SPEED1 pipeline step (canon tool --map N) rather than an agent package.

**BUDGET2-1. Skill prices are in the old currency (Attack = 2)** · Decide · Balance · asked 2026-10-31 · decided 2026-10-31
- BUDGET2 moved the stats to 3A + H and fitted N (x 1.13) with skill prices unchanged. The prices were measured in 2A + H points: RECOST1's yardstick valued a point at 4.17 win-rate points (+1 Attack 9.5, +1 Health 3.0); a 3A + H point is (9.5 + 3.0) / 4 = 3.1, so in the new currency a measured price would be about x1.33. The canon check (tools/skill_canon_2026_10_31.js, 200 paired fights on 6 vanilla carriers) reads more: a point of skill price buys about 2.2 points of stats (kappa 0.46 [0.38, 0.58]). Cheap skills next to stats make cards with skills stronger than vanilla cards of the same budget. docs/balance/budget2-2026-10-31.md sections 5 and 6.
  - Keep the prices
  - Scale every measured price x1.33 and re-fit (a second full re-fit, N re-fitted)
  - Re-measure the skills against the re-canonised anchors (BUDGET2-2) and re-fit then
- **Default:** Re-measure the skills against the re-canonised anchors (BUDGET2-2) and re-fit then
- **Outcome:** Coordinator (owner's standing 'fill in the decisions'): re-measure every skill price against the anchors (after BUDGET2-2), in package SKILL2. No blanket x1.33.

**BUDGET2-2. Re-canonise the anchor skills from one shared measure?** · Decide · Balance · asked 2026-10-31 · decided 2026-10-31
- X14: 12 canon anchors (15 points) are marked in canonical/skill-costs.json (canon: true): Armor 1/2, Poison 1/2, Bleed 1/2, Regen 2, Pounce 2, Quick, Sweep 2, Fork, Rage, Inspiring 1, Gold on Ready 1, Shell 2. On one shared set of carriers their RECOST1 prices disagree: 13 of 15 fall outside the interval the other anchors give them (Sweep 2 reads 2.9 vs price 1.1, Fork 3.0 vs 1.27, Gold on Ready 3.1 vs 2.31, Rage 2.0 vs 0.99; Armor 2 2.1 vs 4.53, Poison 1 1.2 vs 3.0). RECOST1 measured each on its own carriers. A canon is only a yardstick if its prices come from one measure.
  - Re-canonise: each anchor's canon price = its worth in this shared measure at 400 fights, scaled so the anchors' total stays
  - Keep the RECOST1 prices as canon; read the tool's results as relative only
  - Shrink the canon to the anchors that agree (Pounce 2, Quick) and add others
- **Default:** Re-canonise: each anchor's canon price = its worth in this shared measure at 400 fights, scaled so the anchors' total stays
- **Outcome:** Coordinator (owner's standing 'fill in the decisions'): yes, re-set the anchors' prices from one shared measurement first (SKILL2).

**BUDGET2-3. War Elephant: one arrow now; price Arrow Count as one more shot?** · Decide · Cards · asked 2026-10-30 · decided 2026-10-31
- X15 / RECOST1-5 ("if you can cut the arrow count, do it"): War Elephant now fires one Arrow 2 a round (Arrow Count 2 -> 1), 0/28, 85% of N. Arrow Count is priced 'half', 6 a point: Arrow Count 2 costs 12 for one extra shot that Arrow 2 alone prices at 6. Priced as (N - 1) x the arrow's own price, Arrow Count 2 would cost 6 and the Elephant fits with both arrows (cap 1 44.5 <= 45.2, cap 2 273 <= 356). Only card with Arrow Count.
  - Keep one arrow
  - Price Arrow Count as (N - 1) x the arrow's price and give the second arrow back
- **Default:** Price Arrow Count as (N - 1) x the arrow's price and give the second arrow back
- **Outcome:** Coordinator (owner's standing 'fill in the decisions'): no. The owner asked to cut the arrow count (X15); War Elephant keeps 1 arrow.

**BUDGET2-4. Cottontail: 2/5 or 3/1?** · Decide · Cards · asked 2026-10-31 · decided 2026-10-31
- Cottontail (T-1 / T-2 card, 4/2) must fit at Level 0 too (SKL0-1): 3A + H <= 10.68. The re-fit's rule (smallest relative change, then Health back for the Attack cut) gave 2/5 (89% of N at Level 1). 3/1 also fits (81%) and keeps the fast, fragile rabbit. Pond Trout (3/4 -> 2/5) has the same choice (3/1).
  - Keep 2/5 (sturdier)
  - 3/1 (keeps the glass-cannon rabbit)
- **Default:** 3/1 (keeps the glass-cannon rabbit)
- **Outcome:** Coordinator (owner's standing 'fill in the decisions'): keep 2/5. Tutorial cards that survive a hit teach better than 3/1 glass.

**BUDGET2-5. Marshal of Rivergate is still far under (45% of N)** · Decide · Cards · asked 2026-10-31 · decided 2026-10-31
- RECOST1-6's second half: the Marshal (Epic, Armor 2, Sweep 4, 2/3) was under its band before BUDGET2 and stays there (45% of N 33.71 at 3A + H). BUDGET2 re-fit only what its formula pushed out. A lift to about 80% of N is 4/9 or 3/12.
  - Lift to about 80% (4/9)
  - Leave it for the next card pass
- **Default:** Lift to about 80% (4/9)
- **Outcome:** Coordinator (owner's standing 'fill in the decisions'): yes, lift Marshal of Rivergate to 4/9 (SKILL2).

**BUDGET2-6. A small arena_app.js edit for 3A + H** · Decide · Balance · asked 2026-10-31 · decided 2026-10-31
- BUDGET2 was not allowed to touch arena_app.js. Two leftovers live there: the card editor's budget table headers and notes still print 'f x ((2A+H) x m + S)' (the numbers come from the shared budget, so they are right), and FORGE_MEAN_GAIN (the enemy's level for a Forge gain) no longer matches the cards (tests/forge-curve check 3; it was already off before BUDGET2).
  - Allow it (a short follow-up)
  - Leave it
- **Default:** Allow it (a short follow-up)
- **Outcome:** Coordinator (owner's standing 'fill in the decisions'): yes, the small arena_app.js edit (FORGE_MEAN_GAIN, '3A+H' headers) goes in SKILL2.

**BUDGET2-7. PRO decks: leaders and fields to re-bake after BUDGET2** · Decide · Balance · asked 2026-10-31 · decided 2026-10-31
- Two BUDGET2 changes reach canonical/pro-skirmishes.json, which this package was not allowed to edit. (1) The re-fit moved the stats that pick a PRO deck's showcase leader (rarity, then Attack + Health / 2): 4 maps' DECK1 decks (mu, mn, mk, mt) and 6 PRO decks (7-PRO-2, 7-PRO-4, 8-A-PRO-1, 9-PRO-2, 16-PRO-1, 16-PRO-4) now name a different leader than the game would pick (tests/deck1 4 checks, tests/pro 6). (2) The sims now see the map's biome flags (hotMap, coldMap, saltMap, weatherMap), so 15 maps' stored 'average field' lacks flags the game's own fights carry (tests/pro check 1): a PRO fight on a hot, cold, salt or dry map plays without its Heat / Frost / Salt / Drought skills. The decks themselves were searched under the old stats.
  - Re-bake leaders and fields only (DECK1's tool, no new search)
  - Re-run DECK1's searches on the new cards (Maps 0-20, about the DECK1 cost)
  - Leave until the next balance pass
- **Default:** Re-bake leaders and fields only (DECK1's tool, no new search)
- **Outcome:** Coordinator (owner's standing 'fill in the decisions'): yes, re-bake the PRO leaders and stored fields, after SKILL2's re-pricing (with DECK1-2).

**RELICT-1. New skill Relict: what does it do?** · Discuss · Skills · asked 2026-10-31
- Owner 10-31 10:17: "New skill Relict - (ill think about what it does. For now out in idea decisions, not gameplay decisions tab)". A relict is a species surviving from an older age (ties in with the Map 40+ Relic discovery: fossils and remnants back into cards). Not built; waiting for the owner's idea. Suggestions (2026-11-02, owner asked 19:56): a) Unbothered by the age: a Relict ignores the map's field effects (weather, time of day, terrain, wind), good and bad. Simple, reads at a glance, and every map now has its own field (ENG16). b) Fossil: when a Relict dies it leaves a Fossil in its slot (a 0/3 wall); at Map 40+ a Relic discovery can wake a Fossil back into the card at Level 1. c) Old blood: a Relict cannot be lowered below its printed Attack and Health (no debuffs, shrink or Decay below its base). d) Living record: +1/+1 for each other Relict you have played this fight (a small tribe). Recommended: a) now, b) when Map 40+ Relics are built.
  - a) Ignores field effects
  - b) Leaves a Fossil
  - c) Cannot be lowered below its printed stats
  - d) Grows with other Relicts
- **Default:** a) Ignores field effects

**REF5-1. Should the progression reference's unused Dust go to the Forge?** · Decide · Balance · asked 2026-10-31 · decided 2026-10-31
- REF5 (docs/balance/ref5-2026-10-30.md): the brief splits income x1.5 into 1.0x for packs and 0.5x for levelling. No pack costs Dust, so the 1.0x Dust share (8,775 by Map 20 for seed 1) sits unused, and Dust is what limits the Forge: the Ember Forge is never bought and the decks reach a mean level of 1.8-2.6 from Map 11, against the Map reference's 3-3.9.
  - Keep: 0.5x of every currency for the Forge
  - All Dust (1.5x) to the Forge
- **Default:** All Dust (1.5x) to the Forge
- **Outcome:** Coordinator (owner's standing 'fill in the decisions'): yes, the unused Dust goes to the Forge. Applied in the re-run after BUDGET2.

**REF5-2. Gold Leaves in the progression reference's economy** · Decide · Balance · asked 2026-10-31 · decided 2026-10-31
- REF5: no confirmed reward (first clears, faction / level track, the Trail's free lane) pays Gold Leaves, so the Tidemire Chest (6) and the Highcrest Case (11) are never affordable and every bought pack is a Hedgerow Pouch (Maps 0-6 cards); the Pack 1 pool is full by Map 6, so the 5 seeds' collections hardly differ.
  - Keep (Pouches only; the finding stands)
  - Count the S notices and the daily dungeons' Gold Leaves at a stated pace
  - Let the sim buy the map's own series with Leaves only
- **Default:** Count the S notices and the daily dungeons' Gold Leaves at a stated pace
- **Outcome:** Coordinator: count notices and daily dungeons at a stated pace (one daily a day, notices as the road offers them), so the sim can buy each map's own pack series. Flag for the owner: if no reward pays Gold Leaves in the real game either, the Tidemire Chest and Highcrest Case are out of reach for players too.

**REF5-3. The progression reference's Forge schedule** · Decide · Balance · asked 2026-10-31 · decided 2026-10-31
- REF5 chose: Forge from Map 11; each map buys the next Forge tier first (Iron from 13, Ember from 16) when the bank pays, then levels the map's deck one card level at a time, most copies in the deck per Dust first, inside the tier's cap and rarity band and the level gates; the deck is chosen first at the levels the cards already have.
  - Keep
  - Level the deck evenly (lowest level first)
  - Skip the Forge tiers until the deck is at the tier's cap
- **Default:** Keep
- **Outcome:** Coordinator: keep the schedule (Forge from Map 11, next tier first, then most-copies-per-Dust).

**REF5-4. Re-run the progression reference's searches at full budget** · Decide · Balance · asked 2026-10-31 · decided 2026-10-31
- REF5: the machine was shared (load 8-14 on 2 cores) and restarted once, so the 105 searches used 3,000 games each (Maps 7-20 only 1-3 generations), against 16,000-32,000 for the Pool reference. The decks are good but not converged; from Map 9 the 5 decks share only 3-8 copies, mostly search noise. Reference (Random) wins 51% of the main road fights (Map reference 67%) and 22% of the DECK1 PRO fights (39%).
  - Use the set as it is
  - Re-run at 16,000 a map (about 10 hours alone on the machine) before it judges difficulty
- **Default:** Re-run at 16,000 a map (about 10 hours alone on the machine) before it judges difficulty
- **Outcome:** Coordinator: yes, re-run at 16,000 games per map, but after BUDGET2 (the 3A+H card re-fit), since that changes every card. Until then the REF5 set is not used to judge difficulty.

**RAIDBAL1-1. Raid win-rate targets: warm-ups 60%, the Core 40%** · Decide · Raids · asked 2026-10-30
- RAIDBAL1 (docs/balance/raidbal1-2026-10-30.md) needed a target for the Goliath's fights and the evaluation protocol has none for raids. Proposed and tuned to: each warm-up (Left Tentacle, Right Tentacle, Tail) about 60% (green 52-68%), the Core about 40% (green 32-48%, the protocol's boss band). A win is the part's bramble destroyed within the 20 turns. Measured on a fresh part against three Map 13 decks (the Raid Banner's map) at +2 levels (owner W8): the Map reference, Reference-2 and the deck optimizer's Map 13 optimum, 40 fights a deck. Result: warm-ups 58-62%, the Core 40% (47% on fresh seeds). At the unlock level itself (+0): warm-ups about 53%, the Core 34%. project-state.md still says 'raid bosses sit near 20%' (RW2-4); that line predates this per-fight measure.
  - As proposed (60 / 40)
  - The Core near 20% (project-state's line)
  - Warm-ups easier (70%)
- **Default:** As proposed (60 / 40)
- **Outcome:** Owner 2026-10-30 23:25: "The rest of the decisions seem okay." Default: warm-ups 60%, the Core 40%.

**RAIDBAL1-2. The raid's weekly pace after RAIDBAL1** · Decide · Raids · asked 2026-10-30
- Fewer warm-up wins means less raid damage a fight there: about 1,000 a fight on the arms and the tail (was about 1,150; -14 to -24%), while the Core pays about 430 (was 160, x2.6). The week's model (tools/raid_completion_model.js, RB's 'falls more than 90% of the time') was not re-run: its decks are the old road set. A follow-up can re-run it and move the parts' Health bars (barHp) if the raid now falls too seldom or too often.
  - Re-run the completion model in a follow-up package
  - Leave it for playtests
- **Default:** Re-run the completion model in a follow-up package
- **Outcome:** Owner 2026-10-30 23:25: default. Re-run the completion model in a follow-up package.

**RAIDBAL1-3. Your deck matters little in a raid fight** · Decide · Raids · asked 2026-10-30
- The boss's cards fight at 20% Attack / 15% Health (tuning), so on the warm-ups the two CPU allies and you clear its board by about turn 6-10 and then race its bramble; the three reference decks land within about 35 points of each other, and +2 levels moves a fight only 2-11 points. RAIDBAL1 therefore tuned with the brambles (and +60 raider bramble, which only the Core feels: the raiders never lose bramble on the warm-ups). Raising the boss's card strength makes the warm-ups real fights but crushes the Core (its stumps and Beak Strike), and the stumps are shared with the classic trench. A per-part boss strength (a part-level tuning field read by buildRaidFullFight) would let both be tuned; that is a code change for another package.
  - Keep the bramble-led tuning
  - A package for per-part boss strength
- **Default:** Keep the bramble-led tuning
- **Outcome:** Owner 2026-10-30 23:25: default. Keep the bramble-led tuning.

**DECK1-1. Cards the deck optimizer picks almost everywhere** · Decide · Cards · asked 2026-10-30 · decided 2026-10-31
- DECK1 (docs/balance/deck1-2026-10-30.md): the Wolf Spider Mother (Rare, 1 Lumber, Brood) is in 48 of the 90 focused PRO decks that could hold it, on 22 of the 25 maps that offered it, and tops the contribution measure (index 1.88). The Grave-Grin Hyena (Uncommon, 0 Lumber) goes in at 4 copies in 22 of its 24 decks; the Ashbone Ghoul is in 14 of 20, the Leafcutter Gardener 15 of 26, the Eagle-Owl Quartermaster 23 of 69. Nothing was changed (cards.json is step 3's). BUDGET2 (2026-10-31, after the 3A + H re-fit; docs/balance/budget2-2026-10-31.md section 6): contribution per copy over the fair line (bench.js contrib, 200 fights, global context, a seeded sample of 40 in-play cards): Eagle-Owl Quartermaster +5.2 (z 8.4), Ashbone Ghoul +4.7 (7.8), Wolf Spider Mother +3.7 (6.1; was +5.5 before its 3/10 -> 3/9 trim), Grave-Grin Hyena +3.2 (5.2), Leafcutter Gardener +0.1 (0.2). The first four are inside their budget: the strength is in under-priced skills (Brood, Fletcher, Remember's trigger, Executioner). Claude recommends: re-price those four skills with the canon tool (tools/skill_canon_2026_10_31.js), then re-fit the four cards; leave the Gardener.
  - Leave them
  - Re-fit the Wolf Spider Mother and the Grave-Grin Hyena (a card-data package)
  - Re-fit all five
- **Default:** Re-fit the Wolf Spider Mother and the Grave-Grin Hyena
- **Outcome:** Coordinator (owner's standing 'fill in the decisions'): after BUDGET2: re-price Brood, Fletcher, Remember's trigger and Executioner with the canon tool, then re-fit the Quartermaster, Ashbone Ghoul, Wolf Spider Mother and Hyena (SKILL2).

**DECK1-2. BPRO decks: rebuild them under the 6/4 rule and the current lists?** · Decide · Balance · asked 2026-10-30
- DECK1 rebuilt only the PRO decks. The BPRO decks (only the map's own pool) were left as they were: none keeps 6 different cards / 4 copies, and 46 of them hold a card that is on the map only through a road fight's deck (cut from the list by THEME3). Their own rule still counts the road decks as the map's cards.
  - Leave the BPRO decks
  - Rebuild BPRO with the DECK1 tool from the map's list only (no held cards)
  - Retire BPRO (the DECK1 decks already anchor 10+ copies on the list)
- **Default:** Rebuild BPRO with the DECK1 tool from the map's list only
- **Outcome:** Owner 2026-10-30 23:25: OK. Rebuild BPRO with the DECK1 tool from the map's list only.

**DECK1-3. PRO decks stay at Level 1 while the references level up from Map 11** · Decide · Balance · asked 2026-10-30
- From Map 11 the map reference plays at Level 3-4 and Reference-2 at 3-5, the PRO decks at Level 1 (PREF-3 lifts only late side maps). Most late PRO decks still win, but on Map 20 (the high-cost Sundered Peak) the map reference wins 61-74%. A PRO fight could take the road's enemy level of its own map, as PREF-3 does for side maps.
  - Keep Level 1
  - PRO level = the road's enemy level of the map (all maps)
  - Only from Map 11 (the Forge)
- **Default:** Keep Level 1
- **Outcome:** Owner 2026-10-30 23:25: OK. PRO decks stay at Level 1.

**DECK1-4. The Old Bramble: its list is over its fights' rarity cap** · Decide · Cards · asked 2026-10-30
- THEME3 (Q7) gave the Old Bramble "advanced cards, as if it was Map 21" (Rares and up), but its four fights are still Common, so the PRO rule's cap (the rarest fight) makes every card of its own list illegal. Its DECK1 decks are built from held Commons only. The map reference wins 7%, Reference-2 45-55%.
  - Raise the Old Bramble's fights' rarity with the road retune (BAL7-3)
  - Let its PRO decks use its list above the cap
  - Leave it
- **Default:** Raise the Old Bramble's fights' rarity with the road retune (BAL7-3)
- **Outcome:** Owner 2026-10-30 23:25: OK. Raise the Old Bramble's fights' rarity with the road retune (BAL7-3).

**DECK1-5. Gannet Cliffs (Map 3) has no hard deck: add a high end?** · Decide · Cards · asked 2026-10-30 · decided 2026-10-31
- Gannet Cliffs' list is thirteen cards at 0-1 Lumber with two generators. Its best focused deck scores 75% on the gauntlet at double search budget (a pool ceiling), and the map reference beats its PRO decks 68-90% (Reference-2 68-85%). Map 0 (Commons only) is similar for Reference-2 (97-100%). Map 2, the owner's example, is no longer easy (34-52%). BUDGET2 (2026-10-31; docs/balance/budget2-2026-10-31.md section 6): no hard deck because the cards are weak. Of Gannet Cliffs' 13 list cards (bench.js contrib, 200 fights, global context), 4 sit above the fair line (none significantly) and 8 below, 5 clearly: Peak Condor -2.3 per copy (z -4.2), Hawk Arrowkeeper -2.2 (-4.6), Red-billed Chough -2.2 (-4.7), Peregrine Stooper -1.9 (-3.4), Conch Herald -1.5 (-2.7). Claude recommends: lift those five within their budget (+1-2 Health or +1 Attack each) in a card-data package, then re-run DECK1's Map 3 search; add the 2-Lumber card only if the ceiling stays low.
  - Leave it (an easy map early on)
  - Add one 2-Lumber card and a third generator to Gannet Cliffs' list
  - Swap two of its 1-cost flyers for stronger ones
- **Default:** Add one 2-Lumber card to Gannet Cliffs' list
- **Outcome:** Coordinator (owner's standing 'fill in the decisions'): Map 3's cards are weak (8 of 13 under the fair line). Lift Peak Condor, Hawk Arrowkeeper, Red-billed Chough, Peregrine Stooper and Conch Herald (SKILL2).

**RECOST1-1. Skill prices set to their measured worth (64 skills)** · Decide · Balance · asked 2026-10-30
- Step 3 of your plan (10-28 21:40). The workbench re-measured every skill on an in-play card (80 fights, 3 carriers), then the 74 flagged ones at 200 fights on 4 carriers. A price moved when the measure differed from it by more than 2 standard errors and at least 0.5 budget points: 64 skills (Tsunami 15 -> 3.48, Sturdy 8 -> 0.69, Lone Wolf 6 -> 2.62, Sweep 3.9 -> 0.55, Rage 5 -> 0.99, Quick 5 -> 1.12, Undead 4.3 -> 0.54; dearer: Acid Bolt 1 -> 7.23, Spitfire 1 -> 6.12, Avalanche 4 -> 8.29, Charge 3 -> 5.58, Strangle 0.8 -> 3.1, Swipe 3 -> 5.25). Then 17 in-play cards were trimmed and 19 weak, under-budget ones lifted. docs/balance/recost1-2026-10-30.md.
- **Default:** Keep the measured prices.
- **Outcome:** Filled by Claude per your 10-26 "Fill in the decisions to your best extent" and the 10-28 plan: applied (each entry keeps prevValue to revert).

**RECOST1-2. Your own skill prices against the measure** · Decide · Balance · asked 2026-10-30
- Not changed (you set them); worth in budget points at 80 fights vs the price on their carriers: Supreme +0.1 vs 5 (z -49); Bulwark +1.1 vs 9.7; Evolute -1.3 vs 3; Breach +1.2 vs 2.9; Fester +1.2 vs 2.8; Decay +5.7 vs 1.1 (under-priced); Thorns +3.2 vs 1.7; Stealth +0.4 vs 2 and Slow -0.3 vs -0.9 (both within noise); Bounty +2.9 vs 2.5. Table in docs/balance/recost1-2026-10-30.md.
  - Keep your prices
  - Apply the measured worth to the ones off by more than 2 SE (Supreme, Bulwark, Evolute, Breach, Fester, Decay)
  - Re-measure them at 200 fights first
- **Default:** Re-measure them at 200 fights first
- **Outcome:** Owner 2026-10-30 23:25: default. Re-measure your prices at 200 fights first (with TOOLS2's canon-set measure, X14).

**RECOST1-3. Trigger pairs the measure calls mispriced** · Decide · Balance · asked 2026-10-30
- A trigger skill costs trigger weight x action value, shared by every card using either, so RECOST1 left them. Off at high confidence (80 fights): On Spawn: Stun worth 0 vs 9.45; On Spawn: Add Wait 0.4 vs 5.9; Per Turn: Forge Weapon 0 vs 4.2; Per Turn: Spawn 4 vs 9; On Attacked: Spawn 3.4 vs 7.6 (Bee Drone); On Spawn: Draw 2.8 vs 5.7; On Death: Exile Self +4.5 vs -0.1 (its carriers also Remember).
  - A trigger-weight package (re-measure the pairs, then set action values)
  - Leave them
- **Default:** A trigger-weight package (re-measure the pairs, then set action values)
- **Outcome:** Owner 2026-10-30 23:25: default. A trigger-weight package.

**RECOST1-4. Field, synergy and resource skills need their home maps** · Decide · Balance · asked 2026-10-30
- The global bench reads these far from their prices, but it plays the whole road's field mix and a slot of 6 copies, so it is not their real setting: field skills read low (Mountain Climber -0.5 vs 4, Dry 0.1 vs 4, Darksight -0.3 vs 3, Fog 0.2 vs 2.7, Tide 0.2 vs 1.5, Heat 0 vs 1.2), same-card synergy reads high (Pack 6 vs 0, Brood 7.4 vs 2.9, Fletcher 4.5 vs 0, Swarm 5 vs 2.5), Quarry (Stone) -3.2 vs 2.5 and Prospector (Metal) 0.2 vs 1.2 need Stone / Metal spenders. Not changed.
  - Measure each on its home maps (bench.js skill <id> --map N) in a follow-up
  - Apply the global measure anyway
  - Keep the logic prices
- **Default:** Measure each on its home maps (bench.js skill <id> --map N) in a follow-up
- **Outcome:** Owner 2026-10-30 23:25: default. Measure each on its home maps in a follow-up.

**RECOST1-5. Three in-play cards no stat change can fit** · Decide · Cards · asked 2026-10-30 · decided 2026-11-02
- Owner 11-02 14:10: closed; the owner recosts these cards himself as he sees them. | Over budget because their skill price alone breaks cap 2 (S x |S| above (N/3)^2 x 2): bee-drone 0/1 (flying 0, onAttacked → spawnCard 7.6); worker-ant 1/1 (onAttack → drawCard 5.54); war-elephant 0/28 (armor 4.53, arrow 6, arrowCount 12). Bee Drone and Worker Ant follow RECOST1-3 (their trigger prices); War Elephant's Arrow Count 12 costs 12.
  - Hold them (as now)
  - Cut War Elephant's Arrow Count to fit
  - Re-price the triggers first (RECOST1-3)
- **Default:** Re-price the triggers first (RECOST1-3)

**RECOST1-6. Attack is worth about 3 Health in play; Marshal of Rivergate still weak** · Decide · Balance · asked 2026-10-30
- The bench's yardstick (283 carriers): +1 Attack on a card adds 9.5 win-rate points, +1 Health 3.0, so 1 Attack is about 3.2 Health; the budget (2A + H) counts 2. High-Attack cards are under-priced by the formula and walls over-priced. Separately, Marshal of Rivergate (Epic, Armor 2, Sweep 4) was lifted only to 2/3 (44% of N; RECOST1 lifts at most +4 points) and still reads below the fair line.
  - Keep 2A + H
  - Try 3A + H in a budget package (a full re-fit)
  - Lift Marshal of Rivergate to its budget now
- **Default:** Keep 2A + H; lift Marshal of Rivergate to about 80% of N
- **Outcome:** Owner 2026-10-30 23:25: "If Attack = 3 Health, we have to edit the first N formula to 3*attack instead." The budget moves to 3A + H (package BUDGET2, with the card re-fit).

**ENG13-1. Admin currency tap: is this what you meant?** · Decide · Admin · asked 2026-10-29
- Your note "Admin - clicking the currencies +100 then doubles it": the game had no +100 control on currencies (Admin had only the Set balances boxes, 99,999 / zero, and +1 / +5 for Energy and Raid Tickets, which add once). ENG13 built it: in Admin Mode a tap on a currency in the Profile / Shop / Forge / Nest wallet or the Inventory's Wallet adds 100 while it is under 100, then doubles it (100, 200, 400 ...; at most 99,999). If you meant a bug (a +100 button that gave +200), tell me where you saw it.
- **Default:** Keep the tap as built.
- **Outcome:** Owner 23:01: "Clicking the currency both adds +100 then doubles. This is incase the currency has 0." Built as ENG13 did.

**ENG13-2. Which cards get Slow?** · Decide · Cards · asked 2026-10-29
- Slow (loses Speed ties; priced -0.8) is on no live card. Suggested carriers: Garden Snail, Slow Loris, Ancient Sloth Titan, Old-growth Tortoise, Leopard Slug (also fitting: Slowpoke Sentinel, Slow-worm, Box Turtle). Each would gain 0.8 budget for stats when the card is re-fitted.
- **Default:** Garden Snail, Slow Loris, Ancient Sloth Titan.
- **Outcome:** Owner 2026-10-30 10:34: "maybe just sloth titan, old-growth tortoise and garden snail (if garden snail is T1-T2 card, then it only gets it at lvl 1). The price should be *0.85 instead. So it has more budget!"

**ENG13-3. Canopy Cover's price after it was narrowed** · Decide · Skills · asked 2026-10-29
- Canopy Cover already dodged 1 in 2 (seeded), but against every single-target attack; now it dodges only shots, skills and Flying or thrown attacks (your 21:36 note). Its price (Evasive's half-miss x the woods uptime 0.4) was left as it was. Re-measure and lower it (bench.js skill canopyCover), or keep?
- **Default:** Re-measure in the next balance package and lower it to the measured worth.
- **Outcome:** Owner 2026-10-30 10:34: "just use logic and reduce it, no need to remeasure."

**ENG13-4. Should the Ambush still interrupt 3-2's first Fight?** · Decide · Maps · asked 2026-10-29
- The Ambush is optional now (no lock; Map 4 does not wait on it) and hard (the Map 3 reference deck wins about 25-30%). The first tap on 3-2 still springs it: the scout shoves your pawn and the Ambush fight starts at once (losing it the first time costs 10-30 Maple Leaves). Keep that surprise, or let it only appear on the map, fought when you choose?
- **Default:** Keep the surprise; it can be retried or ignored afterwards.
- **Outcome:** Owner 2026-10-30 23:25: default. Keep the surprise.

**ENG14-1. The CPU now saves for its big cards: keep it at this strength?** · Decide · CPU · asked 2026-10-30 · decided 2026-10-31
- Your X24 note: the CPU now holds its Lumber for a card worth 1.5x its best paying play (within 3 pitches, at most 2 turns held back, never while losing badly). Measured on Maps 0-20 (335 fights, 12 games each, the new-player reference decks): the CPU played 19.5% of the cost 3+ cards it drew before, 27.5% after (cost 2+: 22.4% -> 33.1%); the player's win rate went 52.6% -> 54.3%. Fights whose CPU deck has no cost 3+ card did not move (50.3% -> 50.4%); the 86 that have one went 59.2% -> 65.6% (the big card comes down later than the small cards it replaced). A stricter version (1.25x bar, pitching the best play whatever the gap) played the same number of big cards and cost the CPU about 3 more points. Options: (a) keep it, retune those decks in the next balance pass; (b) keep it and drop the weakest cost 3+ cards from skirmish decks (your 'then we shouldn't have included it in the deck'); (c) undo it.
  - (a) Keep; retune in the balance pass
  - (b) Keep; trim cost 3+ cards that don't earn it
  - (c) Undo
- **Default:** (a) Keep; retune in the balance pass
- **Outcome:** Owner 10-31 09:22: "Yes keep CPU saving." Also #5: if the CPU still can't afford big cards, either it gathers Lumber badly, gathering is too weak, or high-cost cards are tuned down (ENG15 investigates).

**ENG14-2. Elite +1 card: mini-bosses too?** · Decide · Maps · asked 2026-10-30 · decided 2026-10-31
- Your X25 note: "Elite skirmishes start with +1 card in their hand." Built for every elite-kind fight: elite, champion and mini-boss (each main map's last fight below Map 50 is a mini-boss, so 8-8 gets it too), not the bosses or the dungeon. Should mini-bosses (the maps' final fights) keep it, or only fights named Elite?
  - (a) Elite, champion and mini-boss
  - (b) Elite only
- **Default:** (a) Elite, champion and mini-boss
- **Outcome:** Owner 10-31 09:22: "Mini-bosses get +2 (so 5 cards in hand)". Elite and champion stay +1 (ENG15).

**ENG14-3. Bola: which cards get it? (and the every-other-swing limit)** · Decide · Skills · asked 2026-10-30 · decided 2026-10-31
- Bola N is built (X26): Arrow N's shot, and the unit it hits is Pinned for its next turn (loses that swing, can't move; skills still work). Claude's call: a unit that just broke free can't be Pinned the round after, so one Bola costs a unit at most every other swing (otherwise a Bola locks the unit facing it every round). Priced Arrow N + 2 (Bola 1 = 5). Proposed cards: (1) Net Thrower (uncommon 3/11, Boomerang) -> Bola 1 in place of Boomerang: it already throws a net; (2) Clap-net Trapper (common 2/11, a trap trigger) -> Bola 1: a trapper; (3) a new Bolas Spider (Mastophora, a real spider that hunts with a sticky bola on a silk line) for a cave or forest map. Pick any.
  - (1) Net Thrower
  - (2) Clap-net Trapper
  - (3) a new Bolas Spider
  - Keep the every-other-swing limit
  - Let it pin every round
- **Default:** (1) Net Thrower and (3) a new Bolas Spider; keep the limit
- **Outcome:** Owner 10-31 09:22: Bola Spider and Net Thrower OK. Bola also removes the benefits of Flying and Evade. New skill Lasso: same as Bola but once (On Ready); the two units are tied; if the lassoer dies the target is released, if the target dies the lasso is released (ENG15).

**ENG14-4. Anadromous: which cards get it?** · Decide · Skills · asked 2026-10-30 · decided 2026-10-31
- Anadromous is built (X20): +1 Attack on a sea map (rules.saltMap: the beach and reef biomes), +2 Health anywhere else; priced 2. Real anadromous fish in the game: Wrong-Way Salmon (uncommon 1/11, Backstab; the name fits a salmon swimming upriver), Old Sturgeon (uncommon 1/19, Armor + Tide), Lamprey (common 3/6, Weaken). Proposed: Wrong-Way Salmon and Lamprey (both are anadromous; the Sturgeon already has Tide).
  - Wrong-Way Salmon
  - Lamprey
  - Old Sturgeon
- **Default:** Wrong-Way Salmon and Lamprey
- **Outcome:** Owner 10-31 09:22: Salmon OK. Rework: "Anadromous - Tide and +1/+1 in seawater, spawns a 1/1 Fry with Tide in freshwater." Any salty map counts as seawater; the swimming pool is freshwater. On maps without Tide: no bonus, refunded as +0/+1 (ENG15).

**ADMINU1-1. Apply the admin player-list function** · Apply · Admin · asked 2026-10-29
- Say "apply it" to run supabase/proposed/20261029_admin_user_list.sql on the live database. It adds the read-only function admin_user_list() (and a small helper, _admin_safe_jsonb) that the game's new Admin > Players overlay calls: for every profile it returns id, display name, created / last seen, rating, is-admin, cards unlocked, fights, last fight, matches, XP, tutorial done, the map ids cleared, nodes cleared and gold. It never returns emails or any auth data, raises 'not allowed' unless the caller is in app_admins, and is revoked from anon and public. Until then the overlay says the function is missing. Roll back with: drop function public.admin_user_list(); drop function public._admin_safe_jsonb(text). Note: an older Admin > Players panel (Load players, admin_list_players, applied 10-16) already existed; the overlay sits beside it.
- **Outcome:** Owner 2026-10-30 23:25: "Apply the supabase/proposed/20261029_admin_user_list.sql (owner: 'apply it')". Applied 2026-10-30 (migration admin_user_list_20261029).

**THEME1-1. Approve the per-map proposal (whole / with changes)** · Decide · Maps · asked 2026-10-28
- Now the THEME2 proposal (owner 10-28 22:47: "For main maps, there can be 8-11 cards + 4-5 carried over, 12-16 in total. Submaps would be 1-3 cards + 10+ carried over, so 11-14. Don't worry about the other cards."). Steps 1 and 2 of the balancing plan: each card gets one map home by theme; each main map 8-11 unique (past 8 only strongly themed cards) plus 4-5 carried picked for the mix (a high-cost card, a generator, a creature), 15 in all; each submap 1-3 unique plus 10 or more carried from the parent and earlier maps that fit it, 12-13 in all; every list has a cost generator and a high-cost card. Lists 613 -> 559 entries; 307 different cards on a list (108 of them skirmish rewards). The packs: Hedgerow Pouch 52 of 145 on a list; Tidemire Chest 56 of 154 on a list; Highcrest Case 53 of 126 on a list; Pack 4 19 of 33 on a list. 426 cards are on no list (simply listed, per old pack). Flags: Volcano Lair: 2 unique over its 1 (skirmish rewards). Submaps to call (delve = 3 unique, challenges = 1): Smugglers' Grotto, The Sunken Depths, Clovermead, The Glimmer Depths, Eye of the Volcano are "ask owner" (2 for now). Hand calls: the Beaver Lumberjack to Map 0, the Ore-Smelter Mole and the Anvilwhisker Otter to the Basalt Foundry. Nothing applied: docs/balance/theme2-proposal-2026-10-28.md and the hub's Map cards tab (Proposal); THEME1's version stays as history.
  - Approve the whole proposal
  - Approve with changes (name them: moves, submap calls, sizes)
  - Not yet
- **Default:** Not yet
- **Outcome:** Owner, 2026-10-28 23:05: "Okay to THEME1-1." The THEME2 proposal (main maps 10-11 unique + 4-5 carried, submaps 1-3 + 10+) is approved; apply it to canonical/map-pools.json after PACK1 (packs then follow the lists). The five "ask owner" submaps stay at 2 unique until classified.

**THEME1-2. Which of the five unclear submaps are new locations** · Decide · Maps · asked 
- **Outcome:** Owner, 2026-10-28 23:06: "If the theme is unique, then it's a new location (like grotto) otherwise, like those in Map 20, they are just extra challenges. Though note, Dragon Lair is our overall 0-20 big boss, so it deserves more unique cards and also a flair that's not the normal boss flair." New locations (3 unique): Smugglers' Grotto, The Sunken Depths, The Glimmer Depths. Extra challenges (1): Clovermead, Eye of the Volcano. Volcano Lair: 5 unique + 10 carried (15); its own flair is action item S3 (FLAIR1).

**TUT2-1. Apply the easier live T-2 rival deck** · Apply · Tutorial · asked 2026-10-30 · decided 2026-11-02
- supabase/proposed/20261030_tutorial_t1t2_decks.sql updates only cfg.rivalDeck2 of the __cfg:tutorial row (live T-2 deck minus one Pond Trout and one Silver Minnow) so T-2 passes 70%+ with every card at Level 0 and no skills (73% / 95%). It only runs if the row still holds the 10-22 value; rollback is in the file. Say 'apply it'.
  - apply it
  - not yet
- **Default:** apply it

**TUT2-2. Early-road Level 0 enemy copies drop their Level 1 skills** · Decide · Tutorial · asked 2026-10-30
- **Outcome:** Filled by Claude from the owner's 10:34 rule ("All start at lvl 0 and have no skills till lvl 1"): yes, a Level 0 copy never has Level 1 skills, on any side. Queued (TUT3).

**TUT2-3. Your own T-1/T-2 decks lose skill cards too (the Honey Bee's Flying)** · Decide · Tutorial · asked 2026-10-30
- **Outcome:** Filled by Claude from the owner's 10:34 "T-1/T-2 won't have swarm or flying": the player's T-2 Honey Bees are swapped for a skill-less card in the built-in decks and in the proposed live-row SQL. Queued (TUT3).

**BRUP-1. Bramble upgrades: their own resource?** · Decide · Economy · asked 2026-10-29
- Owner 23:01: "Im considering for bramble upgrades to use a different resource. I don't want people too tied up between choosing to level brambles (looong way) versus cards." Today a bramble level costs Dust + Gold (+ materials from Level 10), the same as card levels (castleLevelUpCost in arena_app.js). Options: (a) Thorns, a new bramble-only resource earned from bramble damage you deal (every fight and dungeon already counts it, e.g. the Tidelock Vault's 'Bramble damage dealt: 20'), plus a few in raid/dungeon chests; brambles cost only Thorns (+ materials late). Cards keep Dust + Gold. Recommended: no trade-off, and it rewards attacking play. (b) Bring back Krooni (retired, nothing spends them) as the bramble currency, earned as today's Krooni sources were. (c) Keep Dust + Gold, but halve bramble costs. Existing bramble levels and the castle credit stay; a conversion of already-spent Dust/Gold is not needed.
  - (a) Thorns from bramble damage
  - (b) Krooni for brambles
  - (c) Keep Dust+Gold, halve costs
- **Default:** (a) Thorns from bramble damage
- **Outcome:** Owner 2026-10-30 10:34: "Their own resource & a bit of normal resource. The bramble resource comes from winning fights. Dealing damage to bramble does net you a tiny bit even on loss. Overall - help me half all the resources you get, (except first-time rewards). Because, i want to make the first two daily dungeons: one gives bramble resources, the other gives normal resources. - grinding that = lvl 0 common unit levelled to lvl 10 per week."

**BRUP-2. Briar Blossoms from fights before Map 28?** · Decide · Economy · asked 2026-10-30
- ECON1 built your BRUP-1: brambles reinforce with their own resource, Briar Blossoms, plus a quarter of the old Dust / Leaves. A won fight pays Blossoms (skirmish 4 ... final boss 30, +10% a map number); a loss pays a quarter of that times the share of the enemy bramble you took. But the Forge's Reinforce tab opens at Map 28 (RES3), so fights pay Blossoms only from Map 28; before that nobody holds a currency they can't spend. The Undercroft (bramble daily dungeon, Map 11) pays them from the start. Options: (a) keep it so; (b) open Reinforce earlier (which map?); (c) fights pay Blossoms from Map 0 and they bank until Reinforce opens. docs/balance/econ1-2026-10-30.md.
- **Default:** (a) Blossoms from fights from Map 28, when Reinforce opens.
- **Outcome:** Owner 2026-10-30 23:25: "No problem on BRUP-2. Just leave is at Map 28. Prepare to reshuffle them at will in the future."

**BRUP-3. The two daily dungeons: shared keys or their own?** · Decide · Economy · asked 2026-10-30
- The first two daily dungeons now pay a fixed amount for every won floor: Murgle Mayhem 69 Dust + 46 Leaves, the Undercroft 63 Briar Blossoms. Both use the same key ring: 3 keys a day + 1 on Monday = 22 a week, so grinding both means 11 won floors each: a week of Murgle = 759 Dust + 506 Leaves (a Common card Level 0 -> 10: 759 / 504), a week of the Undercroft = 693 Blossoms (a Common bramble Level 0 -> 10: 690). A player who spends every key on one dungeon gets twice that. Options: (a) keep the shared ring; (b) each dungeon gets its own 3 keys a day (the pay per floor halves, so the week stays the same). The dungeons are still hidden (DAILY_DUNGEONS_HIDDEN).
- **Default:** (a) shared keys, 11 floors each.
- **Outcome:** Owner 2026-10-30 23:25: "Daily dungeons share keys. Multiplayer dungeons use energy. Multiplayer daily dungeons use keys and energy - none right now." Names: Dailies, Dungeons (multi-step), Multiplayer, then the Tower.

**BRUP-4. Name the bramble resource** · Decide · Economy · asked 2026-10-30
- Working name "Briar Blossoms" with 💮 (brambles flower; "Thorns" is a keyword and "Berry" is Foraging's token). Change it in one place: CURRENCY_META.blossoms (glyph) and the TX key ui.econ1-blossoms (+ the 12 packs via tools/i18n_2026_10_30_econ1.py). The internal key stays blossoms.
- **Default:** Briar Blossoms 💮.
- **Outcome:** Owner 2026-10-30 23:25: default. Briar Blossoms 💮.

**BRUP-5. Apply the Briar Blossoms column** · Apply · Economy · asked 2026-10-30
- Say "apply it" to run supabase/proposed/20261030_bramble_resource.sql on the live database. It adds player_currencies.blossoms (integer, >= 0, default 0) and a guard trigger (at most +2,000 a write, 50,000 an hour, admins and server grants exempt). Until then Briar Blossoms are kept in each browser only (like Kibble and Beer) and the game works the same; once applied they sync across devices with no client change.
- **Default:** Apply once ECON1 is released.

**CS-1. Hover popover: the Full card plus text, or text only?** · Decide · UI · asked 2026-10-29
- Card sizes (owner 19:14: "reduce to just 3 or 4"): proposal in docs/design/card-sizes-2026-10-29.md (Detail / Full / Compact / Chip). Hover popover: the Full card plus text, or text only?
  - Full card + text
  - Text only
- **Default:** Full card + text
- **Outcome:** Owner 2026-10-30 10:34: "CS use your recommendations" → Full card + text.

**CS-2. Detail size: the card's back face holds lore, levels and where to get it, or stays the decorative card back?** · Decide · UI · asked 2026-10-29
- Card sizes (owner 19:14: "reduce to just 3 or 4"): proposal in docs/design/card-sizes-2026-10-29.md (Detail / Full / Compact / Chip). Detail size: the card's back face holds lore, levels and where to get it, or stays the decorative card back?
  - Lore + levels on the back
  - Decorative back
- **Default:** Lore + levels on the back
- **Outcome:** Owner 2026-10-30 10:34: "except CS-2: Decorative back."

**CS-3. Full size on a phone: 86px (4 per row) or 96px (3 per row)?** · Decide · UI · asked 2026-10-29
- Card sizes (owner 19:14: "reduce to just 3 or 4"): proposal in docs/design/card-sizes-2026-10-29.md (Detail / Full / Compact / Chip). Full size on a phone: 86px (4 per row) or 96px (3 per row)?
  - 86px, 4 per row
  - 96px, 3 per row
- **Default:** 86px, 4 per row
- **Outcome:** Owner 2026-10-30 10:34: recommendation → 86px, 4 per row.

**CS-4. Map card lists become Chips (art disc + name), losing the tiny stats?** · Decide · UI · asked 2026-10-29
- Card sizes (owner 19:14: "reduce to just 3 or 4"): proposal in docs/design/card-sizes-2026-10-29.md (Detail / Full / Compact / Chip). Map card lists become Chips (art disc + name), losing the tiny stats?
  - Chips
  - Keep small cards
- **Default:** Chips
- **Outcome:** Owner 2026-10-30 10:34: "CS-4 is for our map cards viewing anyway so okay." → Chips.

**CS-5. Hide the card name on the board when a card is under 70px wide?** · Decide · UI · asked 2026-10-29
- Card sizes (owner 19:14: "reduce to just 3 or 4"): proposal in docs/design/card-sizes-2026-10-29.md (Detail / Full / Compact / Chip). Hide the card name on the board when a card is under 70px wide?
  - Hide under 70px
  - Always show
- **Default:** Hide under 70px
- **Outcome:** Owner 2026-10-30 10:34: recommendation → hide the name under 70px.

**KOFI-1. Add a Ko-fi / donation link now?** · Decide · Finance · asked 2026-10-29
- Owner 19:14: "Is it legal to put a kofi or donation link at this juncture? Do i need a blog landing page?" Claude is not a lawyer or tax adviser. What we checked: every bundled asset allows commercial use (Twemoji CC-BY 4.0 with its attribution line, Noto Emoji Apache 2.0, Fluent UI emoji MIT, fonts OFL), and PixelLab's terms say you own your outputs and may use them commercially (no free/paid difference). A tip link is ordinary; no landing page or blog is required. Keep it a tip (no in-game rewards for donating, which would make it a sale with consumer-law and tax duties); say plainly what money supports. Ko-fi pays out through PayPal or Stripe, both available in Singapore. Donations you receive may count as income for tax: check with IRAS or an accountant once amounts matter. Recommended placement: a small 'Support the game' link in Settings/About and on the sign-in screen footer, no pop-ups. NightCafe's or other generators' terms should be checked before their art ships.
  - Add a Ko-fi link in Settings/About now
  - Wait until the domain / landing page
- **Default:** Add a Ko-fi link in Settings/About now
- **Outcome:** Owner 2026-10-30 23:25: default. Add a Ko-fi link in Settings/About; needs your Ko-fi page address.

**SKL0-1. Should every T-1/T-2 card fight at Level 0?** · Decide · Tutorial · asked 2026-10-29
- Today only a card with a skill that arrives at a later level (Bee Knight's Swarm) gets a Level 0 copy in T-1/T-2; the Base cards (Duckling, Pond Trout, Silver Minnow, Cottontail ...) fight at their Level 1 on both sides. Measured all at Level 0 (200 seeds, CPU on your side): T-1 wins fall 66% -> 44% and the fixed seed loses; T-2 78% -> 80%. Doing it needs a T-1 retune.
  - Keep (only skill cards at Level 0)
  - All Level 0 + retune T-1
- **Default:** Keep (only skill cards at Level 0)
- **Outcome:** Owner 2026-10-30 10:34: "SKL0-1 yes definitely" → every T-1/T-2 card at Level 0, T-1 retuned. And: "T-1/T-2 won't have swarm or flying. Same for all the Map 0 to T1-T2 base cards. All start at lvl 0 and have no skills till lvl 1. Map 0 slowly introduces them at lvl 1."

**SKL0-2. Bee Knight's Level 0 copies outside the tutorial: keep Swarm?** · Decide · Tutorial · asked 2026-10-29
- Bee Knight now gets Swarm at Level 1. Its Level 0 copies outside T-1/T-2 (the Nest's, and Map 0's early-road enemy copies) still keep Swarm, matching "from Map 0 it has both".
  - Keep Swarm outside the tutorial
  - Level 0 never has Swarm
- **Default:** Keep Swarm outside the tutorial
- **Outcome:** Owner 2026-10-30 23:25: "SKL0-2 ok." Keep Swarm outside the tutorial.

**SKL0-3. Bee Knight is not in the T-1/T-2 decks yet** · FYI · Tutorial · asked 2026-10-29 · decided 2026-10-31
- The live tutorial decks (the __cfg:tutorial row) hold no Bee Knight or Crossed-Eyes, so the Flying-only Level 0 trick shows only once Bee Knight is added to a T-1/T-2 deck (your tutorial editor; TUT-1 is yours). The T-1/T-2 card list (mtut12) already has the 7 cards. BUDGET2 (2026-10-31): the re-fit moved the tutorial cards: your T-1 / T-2 decks lose Attack (Pond Trout 3/4 -> 2/5, Cottontail 4/2 -> 2/5, Pond Duck 3/4 -> 3/3, Acorn Chipmunk 3/4 -> 3/3), the rival's Earthworm gains (0/6 -> 0/7). Bee Knight is unchanged (a plain 1/1 at Level 0). T-1 / T-2 win rates were not re-measured (TUT2's tutorial measure is not in the repo). Claude recommends: one tutorial package re-measures T-1 / T-2, retunes their decks, and adds one Bee Knight to your T-2 deck in the same proposed SQL (your "apply it" for the live row).
  - I'll add it
  - Claude adds it (needs your 'apply it' for the live row)
- **Default:** I'll add it
- **Outcome:** Coordinator (owner's standing 'fill in the decisions'): one tutorial package re-measures T-1/T-2 after the re-fit, retunes the decks and adds a Bee Knight to the player's T-2 deck (TUT4, after SKILL2).

**ANAD-1. Anadromous: what should the skill do?** · Decide · Skills · asked 2026-10-29
- Owner 00:10: "Anadromous - ? Suggest something for this skill". Anadromous fish (salmon, sturgeon, shad, lamprey) grow at sea and swim upriver to spawn. Options: (a) Upstream run (recommended): after this creature has survived 2 rounds on the field it swims upstream: it moves to your rearmost free lane, heals to full and leaves a Fry (1/1 token) in the lane it left. A delayed, defensive value skill; priced like Regenerate plus a small token. (b) Two waters: +1 Attack on a sea or coast map field, +1 Health on a river, lake or swamp field (reads the map's field, like Nocturnal reads the time); cheap and very thematic, but small. (c) Spawning run: when it dies, summon 2 Fry (1/1) in its lane, but only if it has survived 2 or more rounds; rewards protecting it. Recommendation (a), with (b) kept for a common fish if one is wanted. Cost is set by the TOOLS1 skill-impact tool, not guessed.
  - (a) Upstream run
  - (b) Two waters
  - (c) Spawning run
- **Default:** (a) Upstream run
- **Outcome:** Owner 2026-10-30 23:25: "Get tide benefits +2 Health in non-sea, +1 attack in sea." (package ENG14)

**APPLY1-1. Submap fights: draw only the submap's own list (11-14) instead of the parent's list too** · Decide · Maps · asked 2026-10-28
- After APPLY1 a submap fight drew MAP + SUBMAP + SPECIAL (16-27 cards), not the 11-14 of the owner's 22:47 rule ("Submaps would be 1-3 cards + 10+ carried over, so 11-14").
  - A submap fight reads only its own list + SPECIAL
  - Keep the parent's list in submap fights
- **Default:** A submap fight reads only its own list + SPECIAL
- **Outcome:** Filled by Claude per the owner's 10-26 'fill in the decisions'. LISTFIX1 (2026-10-29): a submap fight draws its SUBMAP list + SPECIAL only; each submap stores THEME2's whole proposed list (12-15 cards; with the parent's SPECIAL a submap fight's pool is 12-19). The game (mapPoolTiers, the Map cards editor, VIS4, packs), tools/lib_map_pools.js and tools/apply1_theme2_2026_10_28.py follow; a card may now be on MAP and a SUBMAP at once.

**APPLY1-2. Cards on no list: out of play, budget checks skip them** · Decide · Balance · asked 2026-10-28
- 109 cards went over budget only because they are on no list now (read at Map 0).
  - Out of play: skip them in the budget checks (report as unplaced)
  - Re-fit them at Map 0
- **Default:** Out of play: skip them in the budget checks (report as unplaced)
- **Outcome:** Filled by Claude per the owner's 10-26 'fill in the decisions'. LISTFIX1: a card on no map list, not in pack-extras and given by nothing else is out of play (tools/lib_map_pools.js isOutOfPlay); the budget checks (card-pool, en2, en4, en5, en6, eng10, eng12, content2, content3) report it as unplaced. 7 listed cards over budget for their first map wait for the re-fit (step 3) in docs/balance/listfix1-pending-budget-2026-10-29.json.

**APPLY1-3. First-clear pack cards no longer on their map's list** · Decide · Cards · asked 2026-10-28
- 5 first-clear pack cards (SKIRMISH_FIRST_PACK_CARDS) are off their map's list after THEME2; 3 are on no list, so their first clear gave nothing.
  - Add each to its map's SPECIAL list
  - Pick other first-clear cards
- **Default:** Add each to its map's SPECIAL list
- **Outcome:** Filled by Claude per the owner's 10-26 'fill in the decisions'. LISTFIX1: added to SPECIAL: mf compost-grub, mc hawk-arrowkeeper, mu sleepless-shrew, m4 blind-cave-fish, mr fox-kit. APPLY1's SPECIAL drops that the new rule keeps were put back (m8 venomlord-serpent, m7 orca-vanguard, m10 wound-reaver, md sand-widow, m22 rimeheart-colossus).

**APPLY1-4. Sources for the 12 listed cards with none; the unattainable flags** · Decide · Cards · asked 2026-10-28
- 12 cards THEME2 put on a list had no way to be obtained; the unattainable flags no longer matched the lists.
  - Pack of their first map
  - Leave them waiting
- **Default:** Pack of their first map
- **Outcome:** Filled by Claude per the owner's 10-26 'fill in the decisions'. LISTFIX1: source {kind:'pack', tier} by the first map list: ant-hill Pack 1; stoneheart-golem, gale-sprite, colony, nest, chapel-tortoise, ash-imp, candle-moth, golden-magpie, friar-badger, great-gate, anvilwhisker-otter Pack 4 (none was a skirmish reward or first-clear card). Flags: 7 listed cards lost unattainable, 219 out-of-play cards got it (data only; docs/balance/listfix1-cards-2026-10-29.py).

**PACK1-1. Packs = the map lists + your extras: is this the reading you meant?** · Confirm · Packs · asked 2026-10-28
- Your 22:47 "remove all cards from the packs" is built as: a basic pack holds the basic-pack cards whose first map list is on its maps (Pack 1 Maps 0-6, 2 7-13, 3 14-20, 4 21-27; a side map from the map that unlocks it), plus a list you curate (canonical/pack-extras.json, empty; the Pack editor edits it live). Derived at load, so trimming a map list takes its cards out of the packs. Pools: Pack 1 143 -> 92; Pack 2 154 -> 128; Pack 3 126 -> 116; Pack 4 33 -> 29. 91 cards (56 from Pack 1) are in no list and so in no pack now: "Not obtainable yet", data kept. Skirmish rewards, Base and unsorted cards on a list are NOT put in packs (a skirmish reward is never a pack card). The Mystery Booster and the Factions pool are unchanged; a faction bundle's general card follows the new pools. Note for THEME1-1: the cards it makes "pack only" (cut from every list) would leave the packs too, unless they go in the extras.
  - Yes, as built
  - Also put the THEME1 "pack only" cards in the extras when THEME1 is applied
  - Something else (say what)
- **Default:** Yes, as built
- **Outcome:** Filled by Claude per the owner's 10-26 23:33 "Fill in the decisions to your best extent": yes, this is the reading flagged to the owner at 22:47 (packs = the map lists + canonical/pack-extras.json). The owner's pack-only cards go in pack-extras.json when chosen.

**PACK1-2. Cards whose first map list is earlier than their pack: over budget** · Decide · Balance · asked 2026-10-28
- A card now sits in the pack of its first map list. 6 cards that RW5 had held in a later pack for their budget (they are on an early side map's list) now count from that earlier map and go over budget: minnow-skitter (Map 7 -> 0), beetle-battering-ram (Map 23 -> 7), fox-kit (Map 7 -> 0), bog-leech (Map 7 -> 1), mangrove-mudskipper (Map 7 -> 0), mudpuppy (Map 7 -> 0). Not re-fitted (as asked). Cinder Hornet, Siege Rhino and Cinder Gecko move from Pack 4 to Pack 3 and stay inside.
  - Re-fit them to their new map
  - Take them off the early side map's list
  - Keep them over budget for now
- **Default:** Re-fit them to their new map
- **Outcome:** Filled by Claude: no re-fit now. APPLY1 writes the approved THEME2 lists next, which moves most cards' first map; budgets are re-checked after it and fixed in plan step 3 (per-card balance).

**PACK1-3. Cards in no pack count as Map 0 in the budget** · FYI · Balance · asked 2026-10-28
- An unobtainable card is priced at Map 0 (the budget's rule for unobtainable cards). 37 of the cards that left the packs are over budget at Map 0 (e.g. dolphin-knight, scraper-of-skies, great-horned-owl, war-hound, armored-mastiff, webspire-sentinel). Nobody can get them, so nothing changes in play; each is priced again when you place it (a map list or the extras).
  - OK
  - Price them at their old map until placed
- **Default:** OK
- **Outcome:** Noted. Cards on no list are outside play; they are priced at Map 0 only until placed (owner 22:47: "Don't worry about the other cards"). The budget check reports them separately.

**RELFIX2-1. The benched trench raid's Core pays less after BAL7's card re-balance (27 -> 17 a fight): retune it?** · Decide · Raids · asked 2026-10-28
- tests/trench.js measures the Goliath trench (admins only) with a ghost population drawn from the cards. With BAL7 M1's re-balanced cards the Core averages 17 raid damage a fight (was 27; outer parts unchanged, 870-980; the Exposed Core 1000). The same engine with the old cards gives 27, so the cards alone moved it. The test's floor was 20; package RELFIX2 set it to 10 for now. Nothing in the trench was changed.
  - Leave it while the trench is benched (floor 10)
  - Retune the Core (the stumps' Illusory or the castle) back to 20-400 when the trench returns
- **Default:** Leave it while the trench is benched (floor 10)
- **Outcome:** Claude, 2026-10-28 (owner 10-26 23:33: "Fill in the decisions to your best extent"): leave the trench Core as it is (floor 10) until the trench returns; it is admin-only.

**BAL7-1. Bulwark at 7.2 a point (your 9 x Shield's 0.8)?** · Confirm · Balance · asked 2026-10-28
- FIN2-2 priced Give Shield N and Bulwark N from Shield = 0.8 Health. Give Shield: 0.8 x the +1 Health an action gives (0.5) = 0.40 a point (was 0.35). Bulwark raises two 0/4N shields; you set it to 9 a point (EN3) when their Health counted at 1.0, so at 0.8 it is 9 x 0.8 = 7.2. Re-fit (tools/bal7_shield_refit_2026_10_28.js): Ancient Sloth Titan 2/28 -> 2/31, Muskrat Lodgekeeper 1/5 -> 1/7 (a move up is capped at +30%; its full line was 2/10).
  - Keep 7.2 (9 x 0.8)
  - Back to 9 (Bulwark's shields are not plain Shield)
- **Default:** Keep 7.2 (9 x 0.8)
- **Outcome:** Claude, 2026-10-28 (owner 10-26 23:33: "Fill in the decisions to your best extent"): Keep Bulwark at 7.2 (Shield = 0.8 Health, FIN2).

**BAL7-2. K14 on Map 0 and the tutorial's come-back fights?** · Decide · Skirmish decks · asked 2026-10-28
- K14 (non-map-unique cards at most 1 copy each and 6 in all) is applied to 126 fights of Maps 1-24 and their side maps (491 copies moved to the map's own pack, reward and showcase cards; a side map counts its parent's too). Left out: Map 0 (its fights are built from the starter cards a new player knows, aiming at 90%; Map 0 has 8 own cards) and the come-back fights T-2, T-3, T-4 (mixed decks that test the tutorial).
  - Leave them out (as built)
  - Apply K14 there too
- **Default:** Leave them out (as built)
- **Outcome:** Claude, 2026-10-28 (owner 10-26 23:33: "Fill in the decisions to your best extent"): Leave Map 0 and the come-back fights T-2..T-4 out of the deck rule (the starter road).

**BAL7-3. The road after the M1 re-balance: retune the decks next?** · Decide · Balance · asked 2026-10-28
- M1 cut 69 cards (Dung Beetle, Archerfish, Fire Salamander ...). The Map reference decks (the new-player yardstick) leaned on Dung Beetles and Archerfish from Map 10, so with the old reference the road fell from 61.5% to 43.3% on average (Maps 10-23 down 12-53 points). BAL7 rebuilt the reference decks (tools/skirmish_pass.js decks --keep): the road is back to 61.7% on average, but its shape moved: 57 of 256 curve fights green (79 before M1), 83 too easy, 116 too hard (docs/balance/bal7-road-2026-10-28.json). You said no retune yet, so no skirmish deck was tuned toward the curve.
  - Retune the road decks toward the curve in the next balance package (swaps only)
  - Keep the old reference decks and retune against them
  - Leave the road as it is
- **Default:** Retune the road decks toward the curve in the next balance package (swaps only)
- **Outcome:** Owner 2026-10-30 23:25: "BAL7-3 yes." Retune the road decks toward the curve (package BAL8).

**BAL7-4. Contribution outliers the stat pass could not fix: re-price their skills?** · Decide · Balance · asked 2026-10-28
- M1 moved 69 cards (stats, and a skill level on 7 cards 12+ points over); their mean distance from the band median fell from +10.6 to +5.0 points (70,000 fights before and after, reliability 0.96, a card's 95% interval about +-1.8). Still 8+ over: Hedge Changeling, Dung Beetle, Ur-Elk, Ashbone Ghoul, Tax Collector Teal, Talus Pika, Nutria Reedcutter, Land Tiller, Coral Polyp Colony, Lemming Swarm, Salamander Pyromancer, Termite Forager, Driftwood Crab, Chipmunk Hoarder: their strength is their skill or trigger (Changeling, Decay, Remember, Hoard, On Ready Gold, Swarm ...) and Lumber 0, not their stats. Too weak and already on their budget line (the formula gives no room): Grindstone Boar (Friction), Badger Stonemason (Quarry), Irradiated Glow Wyrm (Poison 2), Granite Ox Golem (Recoil), Bee Drone. docs/balance/bal7-m1-compare-2026-10-28.json.
  - Re-price those skills by the 4-round rule and re-fit, next balance package
  - A second stat pass on the same cards
  - Leave them
- **Default:** Re-price those skills by the 4-round rule and re-fit, next balance package
- **Outcome:** Claude, 2026-10-28 (owner 10-26 23:33: "Fill in the decisions to your best extent"): Yes: re-price the skills behind the remaining outliers in the next balance package.

**BAL7-5. 91 basic-pack cards are not placed: place them?** · Decide · Cards · asked 2026-10-28
- M3 cleared the stale unattainable flag from 225 cards with a placed source. 91 basic-pack cards (Pack 1-4) keep it: 45 have no map in their source (Dolphin Knight, Owl Fletcher, Owl Sentinel, War Hound, Dam Wall, Weredog, Night Watchman, Lunar Howler ...) and 46 name a map but sit in no map list (Scraper of Skies, Great Horned Owl, Armored Mastiff, Carrion Fly Swarm, Warren Scout, Raccoon Nightcrew, the weather cards Blizzard / Heatwave / Spring Rain / Thick Fog / Full Moon ...). The game deals pack cards by their source either way; the flag only tells the tools they are not placed (rw5: every live pack card is in a map list). Full lists: tools/bal7_clear_unattainable_2026_10_28.js.
  - Place them on maps in a content package
  - Leave them flagged
- **Default:** Place them on maps in a content package
- **Outcome:** Claude, 2026-10-28 (owner 10-26 23:33: "Fill in the decisions to your best extent"): Yes: place the 91 unplaced basic-pack cards in a content package (with CONTENT4-1's answer).

**COOP2-1. The Tidelock Vault is a 2-player dungeon** · Confirm · Group dungeon · asked 2026-10-28
- K12 built: the player count belongs to the dungeon type (bramblewood-coop.js DUNGEONS.hollow.players), not the lobby. The vault is 2: a raid board has three rows a side at most (the engine's reserveRows is 0-2), so a row per player fits 2 or 3 players; two friends is the room the live coop_rooms row and join_coop_room already seat (no new SQL); and a 2-player floor is the simplest to tune first. A 3-player type is one more row; a 4-player type needs two players a row (split rows), not built.
  - 2 players (built)
  - 3 players (a back row for player 3)
  - 4 players (build split rows first)
- **Default:** 2 players (built)
- **Outcome:** Claude, 2026-10-28 (owner 10-26 23:33: "Fill in the decisions to your best extent"): 2 players for the Tidelock Vault, as built.

**COOP2-2. A row each, one shared bramble, allied slots both ways** · Confirm · Group dungeon · asked 2026-10-28
- Built as the raid's model: player 1 (the host) holds the front row, player 2 the middle row; each plays from their own hand, deck and Lumber, one play a turn as in a normal fight; each leader opens in the centre of its row. The party has ONE bramble: every player's bramble Health added up and their passives merged (the raid's mergeRaidCastles). Either player may also play into the other's empty slots (K12); the unit stays its player's and holds that row. A unit in the middle row strikes from there (as a raid ally's), it never steps up into the front.
  - As built
  - A bramble each (the party loses when either falls)
  - Allied slots only in the front row
- **Default:** As built
- **Outcome:** Claude, 2026-10-28 (owner 10-26 23:33: "Fill in the decisions to your best extent"): As built: a row each, one shared bramble, allied slots both ways (the owner's "allies can place in allied spots").

**COOP2-3. Cards the co-op table doesn't take yet** · Decide · Group dungeon · asked 2026-10-28
- Units, field cards and spells play as normal. Equipment (onto a unit), hazards (a row), evolutes (onto a base), Parasites (onto an enemy) and prayer offerings need a target the co-op claim doesn't carry yet, so they are refused with a note ("This card can't be played in the group dungeon yet") instead of half working; they can still be pitched. Building them is one more claim kind each.
  - Build them next
  - Keep them out of the group dungeon
- **Default:** Build them next
- **Outcome:** Claude, 2026-10-28 (owner 10-26 23:33: "Fill in the decisions to your best extent"): Keep those card kinds out of the group dungeon for now; support them later.

**COOP2-4. The race window: 120 ms** · Confirm · Group dungeon · asked 2026-10-28
- K12's rule ("If there's ever a race condition, smaller index player takes priority"): every placement is a claim to the room's host; the host gathers the claims that arrive within 120 ms of the first one as one moment and lands them lower player index first, each checked against the board as it stands, so of two claims on one slot player 1's lands and player 2's card goes back to its hand with a note naming who took it. A claim on a slot that already landed is refused whoever made it (no stealing a slot after it shows). A longer window favours player 1 more often; a shorter one follows arrival order more closely.
  - 120 ms (built)
  - 250 ms
  - Arrival order only (index only on an exact tie)
- **Default:** 120 ms (built)
- **Outcome:** Claude, 2026-10-28 (owner 10-26 23:33: "Fill in the decisions to your best extent"): 120 ms, as built.

**COOP2-5. No turn timer** · Decide · Group dungeon · asked 2026-10-28
- The old 30 / 60 s plan timer went with the planning phase. Now, as in a normal fight, the round starts once every player who is here has played or passed; a player silent for 8 s is marked away and the CPU plays their seat until they come back (they catch up from the act log). A slow friend can hold the round up.
  - No timer (built)
  - A 60 s turn, then an automatic Pass
  - A 60 s turn, then the CPU plays it
- **Default:** No timer (built)
- **Outcome:** Claude, 2026-10-28 (owner 10-26 23:33: "Fill in the decisions to your best extent"): Add a 60 s turn timer later if playtests show stalls; none now.

**COOP2-6. The vault pays as raid fights** · Confirm · Rewards · asked 2026-10-28
- Built ("Rewards: as the raid does"): each floor fight pays every player's own game, as a raid fight: its rank on the shared bramble (S 90%+, SS unhurt, SSS unhurt with no unit lost), the vault bramble's damage x 50 capped (2,000 / 2,200 / 2,400 / 3,000 by floor) or the overwhelm figure when it falls (2,500 / 3,000 / 3,500 / 5,000), times the rank (B 1.01 ... SSS 2); paid at the raid's rates (a Maple Leaf per 48, 3 Magic Dust per 190); a card from the vault's own cards at the raid's odds (12% a win, 25% at S or better, 1% survived) and the raid's egg roll on a win. The Energy (5) is still paid at the start and given back if no floor falls. Gone: the floor chests and the once-a-day pick of three after the boss. A floor isn't a win on the Profile's win/loss ledger.
  - As built
  - Bring back the pick of three after the Tidewarden
  - Different figures (say which)
- **Default:** As built
- **Outcome:** Claude, 2026-10-28 (owner 10-26 23:33: "Fill in the decisions to your best extent"): Raid-style rewards, as built (the owner: "like raid").

**COOP2-7. The vault's floors are not tuned yet** · Decide · Balance · asked 2026-10-28
- The floors keep AR3's decks and bramble Health (x1.7 for two players, at the bramble scale). Headless, two CPU seats with starter-strength decks: floors 1-3 fall 10 / 10, the Tidewarden's floor about 7 / 10, most floors in 8-12 turns of the 20. Likely too easy before the boss; a balance package can measure real decks (tools/raid_full_sim.js style) and set the floors' Health and decks.
  - Tune in a balance package
  - Leave as is for playtests first
- **Default:** Leave as is for playtests first
- **Outcome:** Claude, 2026-10-28 (owner 10-26 23:33: "Fill in the decisions to your best extent"): Tune after the owner's playtests.

**COOP3-1. CPU allies play first: alongside you, or before you may play?** · Decide · Group dungeon · asked 2026-10-30 · decided 2026-11-02
- W4 ("The allies should play their cards first if CPU btw, taking a random amount of time between 0.5 to 3.0s. (0.5 to 1.5s in the first turn only)"). Built: each CPU ally starts its own timer as the turn begins (0.5-1.5 s on a floor's first turn, 0.5-3.0 s after) and plays when it fires; you may play at the same time, and the round waits for every CPU ally. So if you wait a moment you see its play first; if you are quick you go first. The other reading would lock your hand until every CPU ally has played (up to 3 s each turn).
  - Alongside (built)
  - Lock my hand until the CPU allies have played
- **Default:** Alongside (built)

**COOP3-2. "Adjacent" includes the card in front of or behind yours** · Confirm · Group dungeon · asked 2026-10-30 · decided 2026-11-02
- W10 ("You can also place cards in your allies' rows and vice versa if you have a card adjacent. However you cannot use your allies' 'network' to place cards."). Built: a slot is open to you when one of YOUR cards is beside it in its row, or in the same column one row in front or behind (that is how a card of yours can be next to an ally's row at all), plus your own row's centre. An ally's cards open nothing for you. Units a skill makes count as the player's whose row they stand in.
  - Yes (built)
  - Beside in the row only (then you could never reach an ally's row)
- **Default:** Yes (built)

**COOP3-3. Nothing on the board and your centre taken: the slots beside it open** · Confirm · Group dungeon · asked 2026-10-30 · decided 2026-11-02
- Owner 11-02 14:26: "this only applies to coop/multiplayer dungeons. Not raids (Raids are always CPU for now)". Owner 11-02 14:10: "only a player can play into the starting card slot of their row. The rest is up for grabs." Each player's row centre (starting slot) is reserved for that player; every other slot is open to either player. Built in ENG17. | With W10's rule an ally (or a CPU ally) who plays into the centre of YOUR row while you have no card on the board would shut you out of the fight. Built: in that case the two slots beside your row's centre are open to you (the normal game's empty-board rule, legalSlots). Otherwise your row's centre is always open to you when it is free.
  - Keep (built)
  - Strict: no exception
- **Default:** Keep (built)

**COOP3-4. The duo dungeon fits the whole match to the window** · Confirm · Group dungeon · asked 2026-10-30 · decided 2026-11-02
- Owner 11-02 14:10: OK. ("Vault" is only the code's name for the duo dungeon's battle board.) | W4 ("Why does the duo dungeon start out at such a far away zoom?"). The vault has a full-size row more than a fight (the ally's, now the size of yours: W10), so on a laptop window the hand sat below the fold and the board read as zoomed out. Built: the vault's own middle row (it never plays there) hides while empty, and on a tablet or computer the card size is scaled so the whole match fits the window's height (between 55% and 100%, up to RES3's 145% on a big desktop window); the board starts at 1:1 and zooms out only when units would leave it. At 1366x860 the cards stay 114 px wide (a fight there grows them to 137 px).
  - Keep (built)
  - Keep the cards a fight's size and let the page scroll
- **Default:** Keep (built)

**CONTENT4-1. Map card pools: the cap would take 187 cards out of the packs. Which way?** · Decide · Content · asked 2026-10-28
- L7 ("Limit the number of cards in a map ... ~4-5 old cards, ~4-7 new cards"). Today each main map's pool is nearly all of that map's own pack cards (12-26 cards, 0-2 carried from earlier maps). Capped at 7 new and 3-5 old (rewards, first-clear pack cards and showcases always kept), the pools lose 269 entries, and 187 cards (82 Common, 70 Uncommon, 34 Rare, 1 Starter: about a third of the pack cards) are then in no pool, so by the stranding rule they wait for a source and leave the packs. It also invalidates PRO / BPRO decks that hold those cards (235 checks) and puts some trimmed cards over budget (a card with no source counts as Map 0). Nothing is applied; the plan, its before -> after per map and the 187 names are in docs/balance/content4-2026-10-28.md, with a script that applies it. Keeping every card of the maps' PRO decks lowers it to 81 cards waiting, but a dozen maps then stay well over the cap. 2026-10-28: re-opened. Owner 16:43: "balancing this way may make our pack size and unique card total not match." HUB9 (🗺️ Map cards tab) measured the plan: map-listed pack cards would fall to 35/145 (Hedgerow), 61/154 (Tidemire), 49/126 (Highcrest), 26/33 (Pack 4); lists 736 -> 467 entries. Not applied; decide with the tab.
  - Keep the lists as they are
  - Cap them as planned (cards stay in their packs)
  - A softer cap (say the numbers)
- **Default:** Keep the lists as they are
- **Outcome:** Owner 2026-10-30 23:25: default. Keep the lists as they are.

**CONTENT4-2. Endless dungeons without a field effect: Murgle Mayhem and the Long Burrow** · Decide · Maps · asked 2026-10-28
- L2 audit: every main and side map now has a map-level field effect except the Quiet Summit (Map 21, kept vanilla). Two endless dungeons have none: Murgle Mayhem (under Sable Swampmire) and the Long Burrow (under the Rimefire Caldera). The Undercroft rolls a different one per floor. Their escalation is their feature, so they were left alone.
  - Leave them (built)
  - Murgle Mayhem: Swamp Fever; the Long Burrow: Darkness
  - Murgle Mayhem: Swamp Fever; the Long Burrow: Landslide
- **Default:** Leave them (built)
- **Outcome:** Claude, 2026-10-28 (owner 10-26 23:33: "Fill in the decisions to your best extent ... we don't have to assign the cards to packs rn"): Leave the endless dungeons as they are.

**CONTENT4-3. The Ice Hollow's cold: Slippery ice, or real frost?** · Confirm · Maps · asked 2026-10-28
- Built: Slippery 30 (its 17-A-2's rule, now on all four fights): win rate 54% -> 47%. A cold field is much harsher here, since the Hollow's units resist the cold and the road deck does not: Frost (Frigid) 54% -> 32%, Freezing 54% -> 31%, Hail 54% -> 58% (40 games a fight, no deck retuned). Its boss is far under target either way (15% before, 5% after).
  - Slippery 30 (built)
  - Frost (Frigid), and retune the decks later
  - Freezing, and retune the decks later
  - Hail
- **Default:** Slippery 30 (built)
- **Outcome:** Claude, 2026-10-28 (owner 10-26 23:33: "Fill in the decisions to your best extent ... we don't have to assign the cards to packs rn"): Slippery ice, as built (real frost made the Ice Hollow far harder; no retunes yet).

**CONTENT4-4. Put the Tundra-family frost where the balance tools see it?** · Decide · Balance tools · asked 2026-10-28
- Wolfsbane Tundra, the Pinewood Taiga and the Rimefire Caldera get Frigid (one unit a side chilled each round) from the board code (fieldEffectOf, MAP_KIND 5), not from fightRules. The skirmish editor's win-rate panel, skirmish_pass and the PRO tools play those 23 fights without the frost, so their numbers are not the game's. Moving it to the maps' mapField (field: frozen) makes tools and game agree; it changes those maps' measured win rates, so a re-measure follows.
  - Move it to mapField and re-measure in the next balance package
  - Leave it
- **Default:** Move it to mapField and re-measure in the next balance package
- **Outcome:** Claude, 2026-10-28 (owner 10-26 23:33: "Fill in the decisions to your best extent ... we don't have to assign the cards to packs rn"): Yes: move the Tundra-family Frigid into mapField so the tools see it, then re-measure (BAL7).

**CONTENT4-5. Thistlewood's Undergrowth does nothing yet: keep it?** · Confirm · Maps · asked 2026-10-28
- Built: Undergrowth on Thistlewood (Map 1; Pounce +2, Swift and Quick units Evasive), the forest's thick cover. No unit in Map 1's fights or the road deck has Pounce, Swift or Quick, so the measure is unchanged (56.5% -> 56.5%). It is flavour there until such cards arrive.
  - Keep Undergrowth (built)
  - Tangled Roots (one unit a side Webbed each round)
  - Cloudy
- **Default:** Keep Undergrowth (built)
- **Outcome:** Claude, 2026-10-28 (owner 10-26 23:33: "Fill in the decisions to your best extent ... we don't have to assign the cards to packs rn"): Keep Thistlewood's Undergrowth (it will matter once Quick / Pounce units reach Map 1).

**VIS5-1. Crowded fights: Quit and Forfeit inside a ⋯ menu?** · Decide · UI · asked 2026-10-28
- L6 built: the fight's top-right buttons go words, then icons, then (when even the icons would squeeze, as in a fight with five or more Environment cards) four buttons stay (speed, the log, settings and a ⋯) and full screen, Forfeit, Auto-play, the admin tools and Quit move into the ⋯ menu; at a width where nothing fits beside the cards the four take their own line. Quit and Forfeit still ask before they act. If you want Quit always visible, the menu would hold the rest.
  - As built: Quit and Forfeit in the ⋯ menu when crowded
  - Keep Quit visible beside the four
- **Default:** As built: Quit and Forfeit in the ⋯ menu when crowded
- **Outcome:** Claude, 2026-10-28 (owner 10-26 23:33: "Fill in the decisions to your best extent"): As built: Quit and Forfeit in the ⋯ menu only in crowded fights (narrow screens).

**VIS5-2. The Danger warning and the leader's slam: right amount?** · Confirm · Fight visuals · asked 2026-10-28
- L3 built: the leader's entrance is a 1.4 s slam (a band, the leader's card slammed down, a ring, the name banner, a thud and a chord; crimson and a growl for the rival) and Danger is a 1.5 s red-edged warning (the field's edges pulse twice, a red light sweeps across, a hazard-striped DANGER plate slams in, two siren pulses). Both fade without motion under reduced motion and FX Low. If either is too much on every fight, the leader's slam could play in full only the first time per fight and Danger only for a new rarity step.
  - As built, every time
  - Full slam the first time per fight, then a quiet banner
- **Default:** As built, every time
- **Outcome:** Claude, 2026-10-28 (owner 10-26 23:33: "Fill in the decisions to your best extent"): Full every time: a leader joins once a fight, and Danger is a rare moment the owner wants to notice ("not iconic enough").

**ENG12-1. Shock: 1.5x from every source, or from lightning only?** · Decide · Skills · asked 2026-10-28
- L5 built as briefed: a Shocked unit still takes 1.5x from every hit, every source, and Shock is re-priced by the 4-round rule with the card's own chance, rounds and Attack (it was a flat 0.93). By that rule the low-chance cards were about right: the Voltaic Eel's Shock 40%/1 is 0.83 (was 0.93), the Abyss Lantern Squid's 30%/1 1.07, the Electric Catfish's Shock Bolt 2 7.98 (was 6; the Catfish is re-fitted 2/9 -> 2/8). Measured in fights (docs/balance/eng12-uptime-2026-10-28.json) a landed Shock adds about 0.6 (Eel) to 1.3 (Catfish) damage. If Shock still feels too strong, your other idea makes it a lightning combo: Shocked units take 1.5x from lightning only (Electricity, Chain Lightning, Shock Bolt, Thunderstorm, a lightning swing). That would make Shock much weaker and cheaper (about a quarter of its price).
  - Keep 1.5x from every source at the new price (as built)
  - 1.5x from lightning (shock) damage only
  - 1.25x from every source
- **Default:** Keep 1.5x from every source at the new price (as built)
- **Outcome:** Claude, 2026-10-28 (owner 10-26 23:33: "Fill in the decisions to your best extent"): Keep 1.5x from every source at the new price (the owner's "1.5x").

**ENG12-2. May a unit woken by a hit swing in that same round?** · Decide · Skills · asked 2026-10-28
- L10: the engine never lets an Asleep unit swing (checked over 400 Spore Cloud fights; Ambush and Banana were the two holes, now closed). What your screenshot most likely shows: a hit wakes a sleeper (Sleep's rule), the woken unit then swings in its turn that round, and the replay kept the zZ badge from the round's start. The badge now clears with a 'wakes up' at the hit. Should a woken unit lose the rest of that round instead (it wakes groggy, swings from the next round)?
  - It may swing once awake (as built)
  - Woken units lose the rest of the round
- **Default:** It may swing once awake (as built)
- **Outcome:** Claude, 2026-10-28 (owner 10-26 23:33: "Fill in the decisions to your best extent"): A unit woken by a hit loses the rest of that round (the owner read a woken unit striking as "Sleep is active, but it still attacked"). Queued for BAL7.

**ENG12-3. Owl Nightwatch and Weredog: smaller body or smaller night bonus?** · Decide · Cards · asked 2026-10-28
- L11: Nocturnal +A/+H is now priced at its uptime (0.53 of a unit's rounds are night or Twilight, the dark places included): Nocturnal 4 costs 4.54 (was 1). The re-fit cut the body and kept the bonus: Owl Nightwatch 1/8 -> 1/6 (5/6 by night, Flying, Stealth), Weredog 2/14 -> 2/7 (+5/+6 by night: 7/13). The other way keeps more body and a smaller spike: Owl Nightwatch Nocturnal 3 at 1/7 (4/7 by night); Weredog Nocturnal 3 / +3 Health at 2/11 (5/14 by night).
  - Keep the bonus, smaller body (as built)
  - Smaller night bonus, more body
- **Default:** Keep the bonus, smaller body (as built)
- **Outcome:** Claude, 2026-10-28 (owner 10-26 23:33: "Fill in the decisions to your best extent"): As built: the smaller body (Owl Nightwatch 1/6, 5/6 by night; Weredog 2/7).

**ENG12-4. Diurnal and Crepuscular got cheaper: give the room back?** · Confirm · Budget · asked 2026-10-28
- By uptime Diurnal +1 is 0.76 (was 1; days are 0.38 of a unit's rounds, nights 0.53, since the always-night and dark maps count as night) and Crepuscular +1 is 1.98 (was 3). No card gained a whole stat point (Woodcock Lookout freed the most, 1.02), so their stats are kept. Plain Nocturnal +1 went 1 -> 1.36 (with its dark-sight); 8 plain-Nocturnal cards already had the room.
  - Keep their stats (as built)
  - Re-fit them up where a point fits
- **Default:** Keep their stats (as built)
- **Outcome:** Claude, 2026-10-28 (owner 10-26 23:33: "Fill in the decisions to your best extent"): Keep the Diurnal / Crepuscular cards' stats.

**VIS4-1. Which way does the Rampart unit step?** · Decide · Fight visuals · asked 2026-10-27
- K4 built as described: it steps toward its own bramble tile. The bramble sits at the bottom-left corner of the screen, so on a desktop the step is mostly sideways (to the left) and a little down; on a phone it is more downward. Another reading: it steps straight back toward your own edge of the field (always down), which reads more like 'bracing in front of the bramble'.
  - Toward the bramble tile (as built)
  - Straight back toward your edge
- **Default:** Toward the bramble tile (as built)
- **Outcome:** Claude, 2026-10-28 (owner 10-26 23:33: "Fill in the decisions to your best extent"): As built: the Rampart steps toward its own bramble (the owner's "moves abit towards their own rampart").

**VIS4-2. The map's cards on the fight panel: what shows for locked rarities and SPECIAL cards?** · Confirm · UI · asked 2026-10-27
- K8 built: the panel lists the cards a fight on this map draws from (MAP, this submap's own, and SPECIAL). A card of a rarity you have not reached is not shown; they are counted in one 🔒 +N chip (a hint that more exists, no names). A card you have never seen is the ❓ card back, as in the reward strip. Options: hide the locked ones entirely (no count), or leave SPECIAL out (only the map's own cards).
  - As built
  - No 🔒 +N count
  - Leave SPECIAL out
- **Default:** As built
- **Outcome:** Claude, 2026-10-28 (owner 10-26 23:33: "Fill in the decisions to your best extent"): Keep the 🔒 +N count; leave SPECIAL cards out of the player's list (Admin still sees them).

**ENG11-1. Coffee N replaced the old Coffee** · Confirm · Skills · asked 2026-10-27
- K2 built under the existing name and key: Coffee N now acts twice every Nth round the unit acts, then it is Stunned a round. The old Coffee (Wait -N on play, a nap N rounds later) is gone. Its two cards keep their Coffee and their stats (re-fit by the formula: both lines hold): the Buzzed Chipmunk (Map 5, Coffee 2, 3/14) and the Honeyjoe Brewer (Hummingbird faction, Coffee 1, 1/4). Priced 1.5 / N by the 4-round rule: a cycle of N + 1 rounds holds as many actions as without it, so it is tempo (an action a round early, and the extra one when the unit dies in its stunned round).
  - Replace the old Coffee (as built)
  - Keep the old one under another name
- **Default:** Replace the old Coffee (as built)
- **Outcome:** Claude, 2026-10-27 (owner 10-26 23:33: "Fill in the decisions to your best extent"): Keep: the new Coffee replaces the old under the same name.

**ENG11-2. Nocturnal units see in every darkness, Absolute darkness too?** · Decide · Map effects · asked 2026-10-27
- K6 built: a fight with its own darkness is night for Nocturnal / Diurnal, and a Nocturnal unit no longer misses in the dark (as Darksight). That holds in Darkness (Maps 8, 2-B, 7-A), Pitch Black (10-A) and Absolute darkness (editor only). A Cast Darkness unit does not make it night (a day map stays day); Nocturnal units do see through the cast dark.
  - As built
  - Nocturnal sees in Darkness only (Pitch Black / Absolute still blind it)
  - Cast Darkness makes it night too
- **Default:** As built
- **Outcome:** Claude, 2026-10-27 (owner 10-26 23:33: "Fill in the decisions to your best extent"): As built: Nocturnal units see in every darkness; Cast Darkness does not make it night.

**ENG11-3. How should Diurnal units "suffer" in the dark places?** · Decide · Map effects · asked 2026-10-27
- K6 built: in a dark fight a Diurnal unit gets no day bonus and stays dark-blind (misses 1 in 4 in Darkness, 1 in 2 in Pitch Black) like any unit without Darksight. Nothing harsher. A harsher option: Diurnal units also lose 1 Attack there, or miss 1 in 2 in plain Darkness (as Sun-shy does by day).
  - As built (no bonus, the dark's normal miss)
  - Also -1 Attack in the dark
  - Miss 1 in 2 in any darkness
- **Default:** As built (no bonus, the dark's normal miss)
- **Outcome:** Claude, 2026-10-27 (owner 10-26 23:33: "Fill in the decisions to your best extent"): As built: Diurnal units lose their day bonus and miss in the dark like anyone; nothing harsher.

**ENG11-4. The road after K6 and K10 (not measured: no full runs this batch)** · Confirm · Balance · asked 2026-10-27
- Scorching now burns only by day: all 18 Scorching fights are on day / night maps (14-5, 14-7, 18-7, the nine 18-A fights, six 11-UC dungeon floors; Maps 20 and 22 have Scorched Ground instead) and now burn about half the rounds; both sides burn alike, so the effect on the road is small and mixed. The cave fights (Map 8, 2-B, 7-A, 10-A) now give Nocturnal units their bonus and sight: the bat-heavy cave decks and any player Nocturnal cards get stronger there. Proposed: measure these maps in the batch's road check and retune decks only if a fight leaves its band.
  - Road check in the batch's balance package (swaps only)
  - Leave it
- **Default:** Road check in the batch's balance package (swaps only)
- **Outcome:** Claude, 2026-10-27 (owner 10-26 23:33: "Fill in the decisions to your best extent"): Yes: a road check of the cave and Scorching fights in BAL7 (measure and flag; retune only where the owner allows, EN8-10).

**FIN2-1. Tide Pool Crab: 1/3 (the formula's line, still a little weak) or 1/3 with Shield 4 (in its band)?** · Decide · Balance · asked 2026-10-26
- Shield now counts as 0.8 Health (your 23:46 #3). The formula's re-fit takes the crab from 1/2 to 1/3 (Shield 3, Armor 1, Tide kept), its smallest step up: 92% of cap 1, 53% of cap 2. Win rate (tools/card_balance.js, 400 games, the Common band 35-60%): 1/2 28%, 1/3 30% (just under the band's lower edge), 1/3 with Shield 4 47% (99% of cap 1, still within the formula), 1/4 47% (over the formula by 0.1). Built: 1/3.
  - 1/3 (as built: a weak beginner card)
  - 1/3 with Shield 4 (in the band, 47%)
- **Default:** 1/3 (as built: a weak beginner card)
- **Outcome:** Claude, 2026-10-27 (owner 10-26 23:33: "Fill in the decisions to your best extent"; 23:46: "though its a beginner card, so it should be weaker"): Keep the Tide Pool Crab at 1/3 (Shield 3): a beginner card, a little under its band.

**FIN2-2. Price Shield given by actions and Bulwark at 0.8 Health too?** · Decide · Balance · asked 2026-10-26
- FIN2-c moved only a unit's own Shield N (effects.shield) to 0.8 x N Health in the caps. Give Shield N (an action, 0.35 a point x its trigger's weight) and Bulwark N (6 a point) keep their measured prices, since they shield other units and can fire again.
  - Keep their own prices (as built)
  - Re-price them from 0.8 Health
- **Default:** Keep their own prices (as built)
- **Outcome:** Claude, 2026-10-27 (owner 10-26 23:33: "Fill in the decisions to your best extent"; 23:46: "though its a beginner card, so it should be weaker"): Yes: price Give Shield N and Bulwark from Shield = 0.8 Health too, in the next balance package (logged as an action item).

**ENG10-1. The spits without "Spit": Cinder and Ice in place of Ember and Frost?** · Decide · Rules · asked 2026-10-26
- ENG9-3 (your 11:19: no "Spit" suffix): Acid, Venom and Spark are clean words. Ember is the Materia gem (+1 Attack) and Frost is a state skill (Frost – {…}), so the fire spit reads Cinder and the frost spit Ice (Firefly Swarm and Habanero Drakon: Cinder 2; Ice Petrel: Ice N). The engine keys are unchanged.
  - Cinder and Ice (as built)
  - Other words (say them)
- **Default:** Cinder and Ice (as built)
- **Outcome:** Owner, 2026-10-26 14:14: "ENG - Okay to your recommendations"

**ENG10-2. Armor 5 and 4 on Commons: trimmed to Armor 3** · Decide · Balance · asked 2026-10-26
- ENG9-9's exponential Armor (1.68 x N^1.43: Armor 3 8.1, 4 12.2, 5 16.8) leaves no legal stats for two Commons: the Barnacle Fortress (0/6, Armor 5: its Armor alone is over its budget) is Armor 3 at 0/10, the Stone Turtle Warden (5/5, Armor 4 + Tide) is Armor 3 at 4/4. The Marshal of Rivergate and the War Elephant were over budget before and stay held. Data: docs/balance/eng10-refit-2026-10-26.json.
  - As built (Armor 3)
  - Keep their Armor and hold them over budget
  - Another trim (say it)
- **Default:** As built (Armor 3)
- **Outcome:** Owner, 2026-10-26 14:14: "ENG - Okay to your recommendations"

**ENG10-3. Flora cards whose species is Elemental: move them to Plant?** · Decide · Cards · asked 2026-10-26
- ENG9-5: Flora is the phylum now (species Plant and Fungi both show it), and the Flora cards carry a type (Tree, Flower, Vine; the Fungi cards Mushroom). Eight walking plants still have species Elemental (Ent, Bramble Sprout, Thornvine Lasher, Elder Willow, Hollow Oath-Keeper, Strangler Vine, Cypress Root Lurker, Pinecone Sapper), so the Codex files them under Elemental and Elemental rules count them. Not changed.
  - Keep species Elemental (as now)
  - Make them Plant (Flora phylum)
  - Plant + Elemental (both)
- **Default:** Keep species Elemental (as now)
- **Outcome:** Owner, 2026-10-26 14:14: "ENG - Okay to your recommendations"

**ENG10-4. Threshold skills: homes changed for two** · Decide · Cards · asked 2026-10-26
- PROP1-4's homes, one card each on Maps 0-20, at most two new skills a map: Throng on the Carrion Fly Swarm (Map 8, 2/6 -> 1/4), Carnage on the Dust Hyena (Map 14, 2/9 -> 2/7), Muster on the Wolf Pack Runner (Map 16, 4/15 -> 3/13), Dirge on the Wolfsbane Alpha (17-8, 1/22 -> 1/19) and Beset on the Ravenous Wolverine (Map 17, in place of its Scarcity, 3/3), Requiem on the Cinder Skeleton (Map 20, 1/10 -> 1/5). Two differ from the proposal's examples: the Lone Grey Wolf has no legal stats with Lone Wolf and Beset, and the Carrion Crow is not a band card. The Cinder Skeleton's cut is large (Requiem 3.2 on a 1-Lumber Common).
  - As built
  - Other homes (say them)
- **Default:** As built
- **Outcome:** Owner, 2026-10-26 14:14: "ENG - Okay to your recommendations"

**ENG10-5. The Gangrenous Leech: three abilities** · Decide · Cards · asked 2026-10-26
- PROP1-3: it is a Parasite with Gorge now and keeps Poison 2 on its swings (the proposal), so it carries three abilities (Parasite, Gorge, Poison). Re-fit 4/4 -> 3/3 (Gorge priced 2.8, 0.8 x a Parasite's typical Attack).
  - Keep Poison 2 (thematic, as built)
  - Drop Poison 2 (two abilities, larger stats)
- **Default:** Keep Poison 2 (thematic, as built)
- **Outcome:** Owner, 2026-10-26 14:14: "ENG - Okay to your recommendations"

**ENG10-6. How a PvP stranger is levelled** · Decide · PvP · asked 2026-10-26
- FIX3-4 (your "Yes level pvp strangers deck"): in Collection PvP the stranger's deck fights at Level = 1 + (your battle rating / its battle rating at Level 1 - 1) / 0.31, clamped to 1-10, two decimals (a fractional level mixes two stat steps, as road enemies do). A stranger stronger than you is never levelled below Level 1. Standard PvP stays at Level 1. Its Elo rating and the win's rating change are as before.
  - As built
  - Also level a stronger stranger down (below its cards' Level 1)
  - Whole levels only
- **Default:** As built
- **Outcome:** Owner, 2026-10-26 14:14: "ENG - Okay to your recommendations"

**TUT-1. The tutorial is won 53% of the time after your card edits (was 77%; the rule is 70%+)** · Decide · Tutorial · asked 2026-10-26
- Folding your live card edits (OVR, package CONTENT3) changed the tutorial's cards: yours Duckling 3/4 -> 1/5 and Silver Minnow 3/4 -> 2/4; the rival's Earthworm 0/9 -> 0/6 and Harvest Mouse 1/7 -> 1/6. ui_smoke's tutorial check (60 CPU-vs-CPU games, both sides played by the CPU) went from 77% to 53% for every faction. Your live tutorial row (OVR-2: rival Health 12, was 7) would make it 40%. The live site already plays your edits, so release 10-26c changes nothing a player sees; the check is reported as failing.
  - Give the tutorial its own deck tweak until it is 70%+ (your card edits stay)
  - Lower the rival's Health / raise yours until 70%+
  - Restore Duckling and Silver Minnow
  - Accept a harder tutorial
- **Default:** Give the tutorial its own deck tweak until it is 70%+ (your card edits stay)
- **Outcome:** Owner, 2026-10-26 14:14: "TUT-1 ill handle." The owner tunes the tutorial himself.

**OVR-1. Your live Map 4 edit of 10-21: the Oxbow fight after 4-5, 4-5 as an elite** · Decide · Maps · asked 2026-10-26
- The live row __cfg:map-nodes:m2 (10-21 16:01) adds a fight "Oxbow" after 4-5 (Orca Vanguard, Humpback Elder, Kraken Spawnling, Beaver Builders, Open-ocean Hermit Crabs; bramble 30, Armour 8), makes 4-5 an elite that ends the map, and sets 10-21 decks on 4-2 and 4-5. Live, it is what players see. Since then BAL3 (10-24) and PRO3 (10-25) retuned 4-2 and 4-5 in the file, and N21-2 took the whales and the kraken out of Maps 1-4. Not folded (CONTENT3). Proposed: drop the row (the file wins) with the clear SQL's commented step.
  - Drop the row (the file wins)
  - Fold it in (Oxbow and 4-5 as elite)
  - Fold only Oxbow
- **Default:** Drop the row (the file wins)
- **Outcome:** Owner, 2026-10-26 14:14: "Live card edits - you may change as you wish ... if your change overwrites mine, go ahead. If you haven't re-balanced, keep mine." The Map 4 row is not re-balanced here: it stays.

**OVR-2. Your live tutorial row of 10-22: rival Health 12 and the part-1 Ducklings and Minnows** · Decide · Tutorial · asked 2026-10-26
- The live row __cfg:tutorial (10-22 23:00) sets the part-1 rival bramble to 12 Health (the file: 7) and its deck to 3 Ducklings, 3 Earthworms, 3 Harvest Mice, 3 Silver Minnows (TT2 on 10-21 eased it to Pond Ducks and Pond Trout: the halved stats left part 1 winnable 35% of the time). It may be your browser's older tutorial saved back with an edit. Live, it is what new players get. Not folded (CONTENT3). Proposed: drop the row (the file wins).
  - Drop the row (the file wins)
  - Fold it in as it is
- **Default:** Drop the row (the file wins)
- **Outcome:** Owner, 2026-10-26 14:14: "TUT-1 ill handle" and "If you haven't re-balanced, keep mine": the tutorial row stays.

**OVR-3. Folded: your live card edits, and what they move on the road** · Decide · Balance · asked 2026-10-26
- Folded into canonical/cards.json (the rule: your value unless the file changed that field after your save): Earthworm 0/9 -> 0/6, Silver Minnow 3/4 -> 2/4, Duckling 3/4 -> 1/5, Harvest Mouse 1/7 -> 1/6, Otter Kit 2/6 -> 2/5, Sea Turtle Elder 5/5 -> 5/10 with Armor 3 and no Undead, Soldier Ant loses Formation 1 (stats kept: the file re-fitted them later), Green Dragon loses its Poison 3 (its poison attack type stays), and the new Phoenix Mushrooms (Epic 1/11, Fungi, Undead, Meiosis 1, Bloom Wet & Sunny; awaiting a source; over the budget at Map 0, it fits once placed). The Soldier Ant is in the road's reference deck: without Formation the Morel Hollow measured 7-2 85% -> 50%, 7-4 55% -> 35%, 7-5 65% -> 22.5%, 7-6 22.5% -> 12.5% (40 games, with G3's deck swap; with Formation put back: 7-2 72.5%, 7-4 45%, 7-5 45%). It is already live (your row wins on the site). The clear SQL is supabase/proposed/20261026_clear_folded_overrides_3.sql.
  - Keep the fold; run the road check and retune decks in BAL4
  - Put Formation back on the Soldier Ant
  - Say it
- **Default:** Keep the fold; run the road check and retune decks in BAL4
- **Outcome:** Owner, 2026-10-26 14:14: "Live card edits - you may change as you wish ... If you haven't re-balanced, keep mine." The Soldier Ant keeps the owner's edit (no Formation); Map 7 is flagged in the hub, not retuned (EN8-10 "No action yet").

**RES4-1. The monthly pass's name and its points: Trail Mix Trek, with Stickers** · Decide · Economy · asked 2026-10-26
- PROP1-2 (your 11:19: "Moon Trail (?) hmm i want something more trail mix-y and camper vanny"). Three names, each with points you collect on a road trip: (1) Trail Mix Trek, points Stickers 🏷️ (one slapped on the van's side at every stop); (2) The Camper Road, points Miles 🛣️; (3) Snack Stop Trail, points Postcards 📮. Built with (1): a camper van drives a road of 30 stops on its own page (from Home's note and the map's 🚐), the month's title reads "Trail Trekker of <month>". Everything else is the proposal as approved: Stickers from notices (D-B 10, A 20, S 40-100), the day's tiers, the first win a day (10), weekly tiers (100/60/40) and three Trail challenges a week (50 each); 30 tiers at 150; reset on the 1st with reached tiers paid; the premium lane locked with no price. The names are one TX key each (ui.res4-trail-name, ui.res4-stickers).
  - Trail Mix Trek / Stickers (as built)
  - The Camper Road / Miles
  - Snack Stop Trail / Postcards
  - Another (say it)
- **Default:** Trail Mix Trek / Stickers (as built)
- **Outcome:** Claude, 2026-10-26 23:33 (owner: "Fill in the decisions to your best extent unless im absolutely needed to fill in ... For card rewards, we can change post-facto. We don't have to assign the cards to packs rn."): Trail Mix Trek / Stickers, as built.

**RES4-2. Forge tabs spread over Maps 11-34** · Decide · UI · asked 2026-10-26
- RES3-3 (your 11:19: "your decision for forge tabs, spread from Map 0 to 40"). Nothing can open before Map 11, because the Forge itself opens there (B7: no Forge before Map 11). Chosen by when each tab becomes useful (RES3_FORGE_TAB_MAP): Upgrade 11 (with the Forge); Upgrades 13 (the Iron Forge, the first tier, is for sale from Map 13); Fuse 14 (Pack 3 and the map-end packs start piling up spare copies); Raid 15 (two maps after the Raid Banner, with trophy shards in hand); Blacksmith 18 (bosses since Map 11 have paid its Materia); Finish 24 (foils are 1-2% of cards); Reinforce 28 (Maps 21-40's harder decks; still a locked "?" from Map 11); Socket 34 (Unique cards reach the road on Map 30). Was 11 / 11 / 12 / 13 / 13 / 15 / 17 / 20. Note: the Blacksmith's equipment still counts Map 11 as its obtain map in the budget (canonical/card-obtain-maps.json); moving it to 18 would give those cards 1.4 more budget, not changed here.
  - As built
  - Other maps (say them)
  - Also move the equipment's obtain map to 18
- **Default:** As built
- **Outcome:** Claude, 2026-10-26 23:33 (owner: "Fill in the decisions to your best extent unless im absolutely needed to fill in ... For card rewards, we can change post-facto. We don't have to assign the cards to packs rn."): The Forge maps as built (11-34); the Blacksmith's equipment keeps Map 11 as its obtain map for the budget.

**RES4-3. The first group dungeon's aqua name: The Tidelock Vault** · Decide · UI · asked 2026-10-26
- RES3-4 (your 11:19: "a cool first multi-player dungeon? maybe aqua themed"). Three names: (1) The Tidelock Vault, a flooded vault that only opens at low tide, so the crew works against the water; (2) The Drowned Warren, keeping the warren; (3) Brinedeep Grotto. Built with (1) (GD_THEMED_NAME, ui.res4-gd-hollow), on its Map 16 spot and the Arena's Co-op pane. The floors and the boss keep their names (the Bat Roost ... the Hollow Matriarch): say if they should go aqua too.
  - The Tidelock Vault (as built)
  - The Drowned Warren
  - Brinedeep Grotto
  - Also rename the floors and boss to match
- **Default:** The Tidelock Vault (as built)
- **Outcome:** Claude, 2026-10-26 23:33 (owner: "Fill in the decisions to your best extent unless im absolutely needed to fill in ... For card rewards, we can change post-facto. We don't have to assign the cards to packs rn."): Yes: the Tidelock Vault's floors and boss get aqua names (queued, package FIN1).

**RES4-4. The pass's "daily tiers" count notices claimed** · Decide · Economy · asked 2026-10-26
- The proposal pays 20 / 10 / 10 Stickers for daily tiers 1-3 (QUEST_TIERS.daily). Those tiers are no longer posted: the daily notices replaced them, and the Notices page shows only the notices and the weekly tiers. Built: the day's three tiers are 3, 5 and 6 notices claimed that day (20 / 10 / 10), which keeps the proposal's light day (3 notices, tier 1, a win: about 70) and full day (about 130). Also: a field-kit item before the traveller's kit opens (Map 12) comes as 40 Maple Leaves.
  - As built (3 / 5 / 6 notices)
  - Bring the daily quest tiers back
  - Drop the daily tiers from the pass
- **Default:** As built (3 / 5 / 6 notices)
- **Outcome:** Claude, 2026-10-26 23:33 (owner: "Fill in the decisions to your best extent unless im absolutely needed to fill in ... For card rewards, we can change post-facto. We don't have to assign the cards to packs rn."): Notices claimed that day count for the daily Stickers, as built; a kit item won before Map 12 pays 40 Maple Leaves.

**CONTENT3-1. The blinding Sandstorm: a variant (as built) or the only Sandstorm?** · Decide · Map effects · asked 2026-10-26
- C4 / EN8-7: built as a second form of the field, sandstorm 'blind' (every unit Blind, 1 in 2, except Dry / Keen Sense / Sonar units; Storm cards empowered), on 18-4 "Sandstorm" only (72.5% -> 75% at 40 games: the desert decks are Dry). The plain Sandstorm (1 in 4 at a unit, unless the attacker is Dry) stays on the other Glass Dunes fights; it is a Storm now too. Making every Sandstorm blinding moves the whole map: a retune.
  - Variant on 18-4 (as built)
  - Every Sandstorm blinds (retune the Glass Dunes)
- **Default:** Variant on 18-4 (as built)
- **Outcome:** Claude, 2026-10-26 23:33 (owner: "Fill in the decisions to your best extent unless im absolutely needed to fill in ... For card rewards, we can change post-facto. We don't have to assign the cards to packs rn."): The blinding Sandstorm stays on 18-4 only.

**CONTENT3-2. Lilypad Reach in constant Rain is much easier** · Decide · Map effects · asked 2026-10-26
- C5 built: the seven Lilypad Reach fights have Rain all fight (Rain heals every unit 2 a round). Measured against the map reference (40 games): 2-A-1 65 -> 75%, 2-A-2 60 -> 70%, 2-A-3 80 -> 97.5%, 2-A-4 72.5 -> 95%, 2-A-5 40 -> 92.5%, 2-A-6 75 -> 80%, 2-A-7 47.5 -> 57.5% (targets 90 / 84 / 78 / 72 / 66 / 60 / 40). The healing favours the player's deck. Proposed: keep the Rain and retune the decks with the curve tool in BAL4.
  - Keep Rain; retune the decks in BAL4
  - Rain without the heal (a wet-only Rain)
  - Rain on the boss only
- **Default:** Keep Rain; retune the decks in BAL4
- **Outcome:** Claude, 2026-10-26 23:33 (owner: "Fill in the decisions to your best extent unless im absolutely needed to fill in ... For card rewards, we can change post-facto. We don't have to assign the cards to packs rn."): Lilypad Reach keeps its rain; no retune now (EN8-10 "No action yet"); the hub flags its fights as too easy.

**CONTENT3-3. Where does the Mother Carrier come from?** · Decide · Cards · asked 2026-10-26
- E16: the Mother Carrier (Heroic Hummingbird Platform, 0/25, Lumber 3, Wait 3; each round while Ready it launches a Laden Hummingbird token: Flying, two arrows a round; Fletcher 1 is your "Arrow Master": its side's arrows +1). Heroic opens on the road at Map 25. Awaiting a source.
  - The Hummingbird faction pack from Map 25
  - A Map 25+ skirmish reward
  - Say it
- **Default:** The Hummingbird faction pack from Map 25
- **Outcome:** Claude, 2026-10-26 23:33 (owner: "Fill in the decisions to your best extent unless im absolutely needed to fill in ... For card rewards, we can change post-facto. We don't have to assign the cards to packs rn."): The Mother Carrier stays awaiting a source (rewards can be assigned later).

**CONTENT3-4. Socket N and Pulverise: on which cards?** · Decide · Cards · asked 2026-10-26
- E14 and OWN-Q5 are built as skills, on no card yet. Socket N (N more gem sockets; price 0, gems sit outside the budget) is meant to be very rare: proposed Socket 1 on one Legendary of Maps 40+. Pulverise (price 1.6): proposed on a heavy Map 20 brute or a Siege card.
  - Leave them on no card for now
  - Name the cards
- **Default:** Leave them on no card for now
- **Outcome:** Claude, 2026-10-26 23:33 (owner: "Fill in the decisions to your best extent unless im absolutely needed to fill in ... For card rewards, we can change post-facto. We don't have to assign the cards to packs rn."): No card gets Socket N or Pulverise yet (assigned later).

**CONTENT3-5. Three new Otter faction cards: add Hummingbird counterparts?** · Decide · Cards · asked 2026-10-26
- C2 / C3: the Mist-net Otter (Common 2/10, Reach, Web 1), the Clap-net Trapper (Common 2/11, On Play: every enemy Flyer grounded a round) and the Birdlime Dauber (Uncommon 2/12, Reach, Strangle 1) join the Otter side of the faction pool (Commons come in the faction draws from Map 0, so before Gannet Cliffs). The rule that Otters and Hummingbirds end up symmetric (RP4) now leans Otter by three.
  - Add three Hummingbird cards later (a ground-hunting theme)
  - Leave it
- **Default:** Add three Hummingbird cards later (a ground-hunting theme)
- **Outcome:** Claude, 2026-10-26 23:33 (owner: "Fill in the decisions to your best extent unless im absolutely needed to fill in ... For card rewards, we can change post-facto. We don't have to assign the cards to packs rn."): Yes: Hummingbird anti-air counterparts in a later content pass (logged as an action item).

**CONTENT3-6. The golem stuns your own side too** · Confirm · Cards · asked 2026-10-26
- E17 built as you wrote it: the Granite Ox Golem (Rare 3/17, Lumber 2, Wait 4, Recoil 2; Ashen Spurn, Map 19) stuns every unit when played, its own allies included, except the enemy's last-played unit. Priced as a stun of every enemy (so its own-side cost is a gift to the budget).
  - All units (as built)
  - Enemy units only
- **Default:** All units (as built)
- **Outcome:** Claude, 2026-10-26 23:33 (owner: "Fill in the decisions to your best extent unless im absolutely needed to fill in ... For card rewards, we can change post-facto. We don't have to assign the cards to packs rn."): Yes, as the owner wrote it: the golem stuns every unit (its own side too) except the enemy's last-played one.

**AI3-1. The CPU's reserve pitches less: keep the price in tempo?** · Decide · Balance · asked 2026-10-26
- A2 (your #33 / EN6-3) is built for every CPU level: it keeps a Lumber reserve of its deck's average cost - 1 and pitches only for that reserve, for a card worth 1.5x its best play within two pitches, or to choose the card a full hand would burn. Measured on Maps 0-20 (docs/balance/ai3-2026-10-26.md): the Basic CPU pitches less and loses a little tempo, about +0.6 points for the new player with the CPU's seat alone (+1.7 in the tool, whose reference player also plays by the new rule). A version that also held its other plays back while saving for the big card cost the CPU about 1 point more, so it was dropped: the gathering is the pitch alone.
  - Keep as built
  - Looser: also pitch for any card it can't afford when the hand has 4+ cards
  - Stricter: saving (hold plays back for the big card)
- **Default:** Keep as built
- **Outcome:** Claude, 2026-10-26 23:33 (owner: "Fill in the decisions to your best extent unless im absolutely needed to fill in ... For card rewards, we can change post-facto. We don't have to assign the cards to packs rn."): Keep the Lumber reserve as built.

**AI3-2. Retune the road now that the Smart CPU plans its turns?** · Decide · Balance · asked 2026-10-26
- A1's planner (each card in each slot scored on the smartest CPU's column score, Bloom room included) makes the Smart CPU (elites and bosses from Map 5) about 2 points harder; Maps 17-19 got harder by 1-6 points and fights inside their band fell from 120 to 111 of 241 (map reference) and 70 to 68 (Reference-2). Nothing was retuned (you: "Don't retune yet"; EN8-10 open). The road check (docs/workflows/balance.md, 'Road check') can run on the AI3 numbers when you say so.
  - Run the EN8-10 road check on the AI3 numbers now
  - Wait for more engine changes first
- **Default:** Wait for more engine changes first
- **Outcome:** Claude, 2026-10-26 23:33 (owner: "Fill in the decisions to your best extent unless im absolutely needed to fill in ... For card rewards, we can change post-facto. We don't have to assign the cards to packs rn."): Wait: no road check / retune now (EN8-10 "No action yet").

**VIS3-1. Tokens on the board: is the dashed, perforated edge enough?** · Decide · UI · asked 2026-10-26
- V2 (your #15): a Bloom copy and an Undead unit back as a token now wear the token look every token has on the board (the dashed edge and the perforated rim, docs/screens/VIS3/vis3-board-trap-token-shield-1366.png). In the hand and the Codex a token also has a tinted background, but on the board it does not (the art fills the card). If you want them easier to tell apart, the board's tokens could get a pale wash over the art or a small TOKEN ribbon.
  - Keep the board's token look as it is
  - A pale wash over a token's art
  - A small TOKEN ribbon
- **Default:** Keep the board's token look as it is
- **Outcome:** Claude, 2026-10-26 23:33 (owner: "Fill in the decisions to your best extent unless im absolutely needed to fill in ... For card rewards, we can change post-facto. We don't have to assign the cards to packs rn."): Add a pale wash to tokens on the board (queued, package FIN1); no ribbon.

**ENG9-1. Revive N (the graveyard action): which cards get it?** · Decide · Cards · asked 2026-10-26
- E1 (your #20): the old self-Revive is Undead now (it comes back once, as a token: its next death leaves no card behind), on the five cards that had it: Sea Turtle Elder, Cinder Skeleton, Ember Revenant, Grass Snake, Slow-worm (Undead 4.3, was 4.5; Grass Snake 2/9 -> 2/10). Revive N is the action: On Play, N random creature cards from your graveyard come back beside it as real cards (6.3 a card; the trigger editor has a Revive action at 6 a card). No real card carries Revive yet (only the test card).
  - Leave it on no card for now
  - Give it to a graveyard theme card (name it)
  - A Map 20+ Undead card with Revive 1
- **Default:** Leave it on no card for now
- **Outcome:** Owner, 2026-10-26 11:19: "Those that have revive now have undead." As built: the five cards carry Undead; no card gets Revive N yet.

**ENG9-2. The name of "On Ready: gain N Lumber": Stockpile?** · Decide · Rules · asked 2026-10-26
- E13 (EN6-6): "Forager" is too close to Foraging (the Berry gatherer that heals an ally), so the keyword is built as Stockpile N (On Ready, once: +N Lumber; 0.9 a point, the trigger's own price, so the Beaver Lumberjack stays 4/4 with Stockpile 1).
  - Stockpile (as built)
  - Forager anyway
  - Another name (say it)
- **Default:** Stockpile (as built)
- **Outcome:** Owner, 2026-10-26 11:19: "Stockpile is okay."

**ENG9-3. The physical "bolts" renamed: Ember / Acid / Venom / Frost / Spark Spit?** · Decide · Rules · asked 2026-10-26
- E3 (EN8-2): every "bolt" is magic, and the elements count as physical, so the five elemental spits that were called Bolts are renamed on the cards and in the Codex: Fire Bolt -> Ember Spit (Firefly Swarm, Habanero Drakon), Acid Bolt -> Acid Spit (Archerfish), Poison Bolt -> Venom Spit (Spitting Spider), Ice Bolt -> Frost Spit (Ice Petrel), Shock Bolt -> Spark Spit (Electric Catfish). The engine keys stay (fireBolt ...), so saves and decks are untouched. "Fire Spit" was avoided beside Spitfire. No magic bolt exists yet.
  - Keep these names
  - Other names (say them)
- **Default:** Keep these names
- **Outcome:** Owner, 2026-10-26 11:19: "Oh good idea on the physical bolts. No need for the suffix \"Spit\"." Queued (ENG10): Ember, Acid, Venom, Frost, Spark (no "Spit").

**ENG9-4. Charge: once a fight, or recharging?** · Decide · Rules · asked 2026-10-26
- G24 ("Charge is similar" to the one-shot On Ready skills): built as a one-shot: the clock starts when the unit is Ready, counts down each upkeep, and at 0 the effect goes off once and Charge leaves the card (was: the clock started again). Priced 1.2 (was 3). Electric Ray 4/9 -> 4/10; the Galactic Condor (Epic, not a band card) keeps its stats. If you meant only the timing (and the clock keeps cycling), say so and it goes back to 3.
  - Once (as built)
  - Recharging, as before
- **Default:** Once (as built)
- **Outcome:** Owner, 2026-10-26 11:19: "Charge is recharging, like reload. Make reloads skill cost better, meaning more negative!" Queued (ENG10): Charge recharges again; Reload's price more negative.

**ENG9-5. Fungi: a kingdom beside Flora, and which card is the Phoenix Mushroom?** · Decide · Cards · asked 2026-10-26
- G9: Fungi is a type of its own, beside Flora (not under it, so a Flora skill or the Old Woods' Flora list doesn't count a mushroom), with 🍄. In the Codex the two non-animal kingdoms are side by side: species Plant -> Flora 🌿, species Fungi -> Fungi 🍄 (Flora was an archetype only, never a phylum). The Fungal Colossus (Flora / Elemental) and the Puffball Bombardier (Flora + Cave / Elemental) are Fungi now. No card is named Phoenix Mushroom; which one did you see?
  - As built; the Phoenix Mushroom is (name it)
  - Fungi under Flora instead
  - Keep the Colossus / Puffball in Flora too
- **Default:** As built; the Phoenix Mushroom is (name it)
- **Outcome:** Owner, 2026-10-26 11:19: "Can existing Funghi have a type of mushroom? Then flora is the phyla, and trees, fruits, flowers etc are the type." Queued (ENG10): Fungi cards get the Mushroom type; Flora is the phylum, with Tree / Fruit / Flower ... as types.

**ENG9-6. Armor and shots: should Armor stop arrows and spits too?** · Decide · Battle rules · asked 2026-10-26
- E3 built: Armor stops every hit that is not magic (physical and the elements); magic passes it; Magic Armor stops magic only. As before, Armor works on swings (a swing, a prong, a counter); shots and damage skills (Arrow, the Spits, Missile, Fireball ...) have never been reduced by Armor. Magic Armor does reduce magic shots. Armor is priced 1.56 a point (+4% for the elemental swings it now stops), Magic Armor 0.1 (magic is rare).
  - Swings only (as now)
  - Armor also stops physical and elemental shots
- **Default:** Swings only (as now)
- **Outcome:** Owner, 2026-10-26 11:19: "Armor stops arrows and spits too." Queued (ENG10).

**ENG9-7. On Ready for a unit that comes in at Wait 0** · Decide · Battle rules · asked 2026-10-26
- G23: a unit that is Ready without its Wait running out at an upkeep (it came in at Wait 0, or a skill took its Wait to 0) now gets its On Ready at the next upkeep, once. Before, it never fired: the Leafcutter Gardener, Termite Forager and Talus Pika (Wait 0, On Ready: +1 Lumber) never paid. Their price always counted it. Pearl Bed at Wait 0 still pays as it lands.
  - Keep (as built)
  - Wait 0 units fire On Ready as they land instead
- **Default:** Keep (as built)
- **Outcome:** Owner, 2026-10-26 11:19: "On ready at wait 0 on the turn it comes out!" Queued (ENG10): a Wait-0 unit's On Ready fires on the turn it is played (not the next upkeep).

**ENG9-8. Chained as a budget multiplier: 1 + 0.25 a held round** · Decide · Balance · asked 2026-10-26
- G19: "Being chained should grant a larger budget - multiplicatively". Chained 'damage N' holds a unit about N/3 rounds (it takes about 3 a round in the line), each held round x0.25: Chained 1 x1.08, 4 x1.33, 9 x1.75, 12+ x2; 'opponent plays a card' x1.1. Its skill price is 0 (was -3). The chain breaks once the damage it has taken adds up to N (one hit of exactly N is enough; was more than N in one hit). Chained Binturong 4/9 -> 4/10.
  - As built
  - Larger (say the factor)
  - Smaller
- **Default:** As built
- **Outcome:** Owner, 2026-10-26 11:19: "Okay to chained."

**ENG9-9. Two cards the re-fit would lower: hold or cut?** · Decide · Balance · asked 2026-10-26
- Armor's new price (1.56, was 1.5) moves cards on the old formula line. Held at their stats (as BF11-1 / EN3-6): Tide Pool Crab 1/4 (formula 1/3), Hawthorn Shieldbug 2/13 (2/12). Raised: Electric Ray 4/9 -> 4/10, Weaver Bird 4/6 -> 4/7, Chained Binturong 4/9 -> 4/10, Grass Snake 2/9 -> 2/10. Data: docs/balance/eng9-refit-2026-10-26.json.
  - Hold (as built)
  - Cut them to the formula
- **Default:** Hold (as built)
- **Outcome:** Owner, 2026-10-26 11:19: "Cut to new armor formula. (Armor should be slightly exponential as 5 armor nullifies most damage - ~>10)." Queued (BAL4): Armor priced slightly exponentially, then cut the held cards to the new line.

**ENG9-10. Tangleweed lays Tangled, Strangle lays Bound** · Confirm · Battle rules · asked 2026-10-26
- G25 and OWN-Q1 together: Tangleweed N now lays Tangled for N rounds (each swing, shot, action and trigger fails 1 in 2: the same coin as Confused), priced 1.4 (was 2): Weaver Bird 4/6 -> 4/7, Quicksand Queen kept. Bound now comes only from Strangle: the unit still swings and shoots at half damage, can't move (no Guardian, Rampart, Dive or Charge) and loses Flying's dodge; Strangle 0.8 (was 1). Pounce happens as a unit lands, so a Bound unit never has one to lose.
  - As built
  - Tangleweed lays Bound too (both)
- **Default:** As built
- **Outcome:** Owner, 2026-10-26 11:19: "Okay to tangleweed etc + field effect that does tangled." Queued (ENG10): a field rule that lays Tangled.

**RES3-1. The level reward track as built (B1): who gets what at which level** · Confirm · Economy · asked 2026-10-26
- Your #3: "level 5 onwards reward packs, like faction, then pack 1, faction then pack 1, eventually pack 2 ... (singles for lvl 1-5)". Built as one table (RES3_LEVEL_TRACK in arena_app.js): Levels 1-5 one card each (Pack 1's pool, a card you don't have first); Level 5 also the first faction pack; then Pack 1 (a 3-card Hedgerow Pouch) and a faction pack alternate (6 Pack 1, 7 faction, 8 Pack 1 ...); from Level 15 Pack 2 (a Tidemire Chest) takes Pack 1's place. Rewards earned before the Armoury opens wait with the held packs. A save from before this starts the track at its current level (no back pay). Open: PROP1-2 (the Moon Trail) proposes a level pack only every 5th level; the rows change in one place. Also to settle: Pack 2 from Level 15, and no back pay.
  - As built
  - Pack 2 from another level (say it)
  - Back-pay levels already reached
  - Wait for PROP1-2 and thin the packs then
- **Default:** As built
- **Outcome:** Owner, 2026-10-26 11:19: Answered with RES3: "Pack okay" (the level track as built; PROP1-2 approved).

**RES3-2. Packs re-costed for 3 cards (Collector 5), same price per card (G15)** · Confirm · Economy · asked 2026-10-26
- Your 22:36 G15: "all packs should only give 3 cards, (collectors giving 5). Recost them". Same value per card as before, rounded. Hedgerow Pouch 3 cards 50 Maple Leaves -> unchanged. Tidemire Chest 5 cards 120 + 10 Gold Leaves -> 3 cards 72 + 6. Highcrest Case 8 cards 250 + 30 -> 3 cards 94 + 11. Mystery Booster 3 cards 80 -> unchanged. Collector packs (were 10 cards: 5 at 10x foil + 5 bonus, at 12x the pack's price): now 5 cards, all at 10x foil, at the old price per card: Hedgerow 600 -> 300; Tidemire 1440 + 120 -> 720 + 60; Highcrest 3000 + 360 -> 1500 + 180. No live pack table (__cfg:shop-packs) overrides these (checked read-only 2026-10-26). BAL4 may re-tune.
  - As built
  - Round to friendlier numbers (say them)
  - Keep Collector packs at 10 cards
- **Default:** As built
- **Outcome:** Owner, 2026-10-26 11:19: "Pack okay"

**RES3-3. Which map earns each Forge tab (G18)** · Confirm · UI · asked 2026-10-26
- Your 22:36 G18: "Forge tabs should all be invisible until that feature is earned at some map (your choice). Reinforce is visible but locked with '?'". Chosen (RES3_FORGE_TAB_MAP): Upgrade and Fuse with the Forge (Map 11), Upgrades Map 12, Blacksmith and Raid Map 13 (the Raid Banner's map), Finish (Refine) Map 15, Reinforce Map 17 (shown from Map 11 as a locked "?"), Socket Map 20 (Unique cards and up). Earned = that map reached. Admin and Dev Mode see all.
  - As built
  - Other maps (say them)
- **Default:** As built
- **Outcome:** Owner, 2026-10-26 11:19: "your decision for forge tabs, spread from Map 0 to 40." Queued (RES4): re-spread the Forge tabs over Maps 0-40.

**RES3-4. The Group Dungeon's themed name, and the emblem's landing** · Confirm · UI · asked 2026-10-26
- B3: the Hollow Warren's Group Dungeon is now "The Warren Heist" on its Map 16 spot and its cards (each group dungeon gets its own line in GD_THEMED_NAME). R6: the rank emblem now lands in the page's bottom-right corner, as you asked; it no longer lands on the open fight panel's corner emblem (PL1's version).
  - As built
  - Another name (say it)
- **Default:** As built
- **Outcome:** Owner, 2026-10-26 11:19: "Name - a cool first multi-player dungeon? maybe aqua themed." Queued (RES4): an aqua-themed name for the first group dungeon.

**PROP1-1. Equipment hardiness: Lives on top of durability (Hardy N), and the anti-equipment skills Sunder and Dismantle** · Decide · Engine · asked 2026-10-26
- Your 23:58 on OWN-Q2: "Equipment can be destroyed through specific anti-equipment skill. But only at 50% chance ... maybe with armor 'lives' default 1, some have 2-3." Proposal (docs/proposals-2026-10-26.md section 1): durability stays as the wear counter (hit 1, acid 2, Corrode 2; EQ2). New: Lives N (keyword Hardy N, default 1 = today's rule). A break takes one life: durability reaching 0 (then it refills) or a break skill succeeding; at 0 lives the piece is destroyed. Dragonscale Mail Hardy 2; Hardy 3 for a few named Legendary+ metal pieces. Sunder (On Hit: 50% to break the target's piece, 1.0), Dismantle (On Play: 50% to break the facing enemy's piece or a loose one, 0.5), Pulverise breaks a life for sure (+0.5 in its price). Tamper-proof blocks stealing only. A dropped piece keeps lives and wear; the next unit picks it up after Equip Time. Price: equipLifeMult = min(D x L, 4) / 4 + 0.35 for a 2nd life + 0.2 for a 3rd. Shown as gold rings above the durability pips and a gem badge on the card. Also to settle: does Pulverise break for sure or roll 50%?
  - A. Lives on top of durability (recommended)
  - B. Lives replace durability (only break skills, acid and Corrode take lives, 50% each)
  - C. Hardy as a quality: immune to break skills, half wear; no lives
  - Say it
- **Default:** A. Lives on top of durability (recommended)
- **Outcome:** Owner, 2026-10-26 11:19: "OKAY, Hardy decreases by 1 every break." Build Hardy N on top of durability, -1 Hardy per break.

**PROP1-2. The Moon Trail (monthly battle pass) and the packs given for levels** · Decide · Economy · asked 2026-10-26
- Your 23:58 on OWN-Q3: "Battlepass is not level locked but gameplay locked. Doing what actions daily or weekly builds up to it. Resets every month." With #51 (25 levels = 25 packs) and B1 / B2. Proposal (docs/proposals-2026-10-26.md section 2): Pawprints from daily notices (10 for D-B, 20 A, 40-100 S-SSS), daily tiers (20/10/10), the first win a day (10), weekly tiers (100/60/40) and three weekly Trail challenges (50 each, from a pool of existing counters plus 4 new ones). 30 tiers at 150 each, reset on the 1st (reached tiers are paid at the reset). Free lane: 6 packs a month (current pack tier x3, faction x2, a Tidemire Chest at 30), Maple Leaves, Dust, 2 Energy capsules, a Raid Ticket, kit items, a monthly title. Premium lane is a locked placeholder (money undecided). Levels: singles at 2-5 and the first pack at 5 as in B1, then a pack only every 5th level (10/15/20/25); the other levels give 100 Maple Leaves + 50 Dust. A full player reaches tier 30 by about day 25, a regular player tier 17. An input for B2's curve: 330 + 30(L-1) + 10(1.06^(L-1) - 1) (Levels 15-25: 9,048 XP instead of 12,765).
  - A. Moon Trail with packs; level packs every 5 levels (recommended)
  - B. Moon Trail without packs; B1's pack every level stays
  - C. No level packs after Level 5; packs from the trail and map ends only
  - Not yet
- **Default:** A. Moon Trail with packs; level packs every 5 levels (recommended)
- **Outcome:** Owner, 2026-10-26 11:19: "Moon Trail (?) hmm i want something more trail mix-y and camper vanny." Approved; rename to a trail-mix / camper-van theme.

**PROP1-3. Fester rework: Gorge (a Parasite feeds twice), Brood-mother, or Spreading** · Decide · Engine · asked 2026-10-26
- Your 23:58 on OWN-Q4: "just do extra damage = poison seems very lame and already kinda done with detonate. I like the name though. Maybe it makes parasites act twice or something." Today Fester adds the unit's own Poison to its swing (Gangrenous Leech; priced 0, measured -0.04). Proposal (docs/proposals-2026-10-26.md section 3), poison taken out, the Gangrenous Leech becomes a Parasite: F1 Gorge: as a Parasite it feeds twice a round (round start and round end); 1.6 x Attack, or 0.8 x Attack with a half-strength second feed (recommended). F2 Brood-mother: while it is on the field your Parasites feed twice; about 2.2 fixed until a Parasite deck exists. F3 Spreading: when its host dies it hooks onto an enemy beside the host instead of dropping; 0.5 x Attack. Lingering and Rupture unchanged.
  - F1 Gorge, half-strength second feed (recommended)
  - F1 Gorge, full second feed
  - F2 Brood-mother (aura)
  - F3 Spreading
  - Say it
- **Default:** F1 Gorge, half-strength second feed (recommended)
- **Outcome:** Owner, 2026-10-26 11:19: "Fester okay." The recommended rework (Gorge: a Parasite feeds again at round end, half strength).

**PROP1-4. Threshold skills: Requiem, Dirge, Carnage, Muster, Beset, Throng (+2/+2 by default)** · Decide · Engine · asked 2026-10-26
- Your 23:58: "Propose new skill(s) that depends on threshold of dead units or number of units on field. E.g. Default is +2/+2." Proposal (docs/proposals-2026-10-26.md section 4), state skills Name N - {...}, plain {+2/+2}, priced 6 points x uptime. Uptime measured (tools/prop1_threshold_uptime_2026_10_26.js, 1,500 CPU fights, docs/balance/prop1-threshold-uptime-2026-10-26.json; a unit lives 4.4 rounds on average), +0.1 where your deck can push the count: Requiem 5 (5+ units died this fight, either side; 0.43, 3.2), Dirge 3 (3+ of yours died; 0.36, 2.8), Carnage 3 (3+ enemies died; 0.41, 2.4), Muster 6 (your side has 6+ units; 0.39, 2.9), Beset 6 (the enemy has 6+; 0.30, 1.8), Throng 10 (10+ units on the field; 0.54, 3.8). Homes: the undead and the Ash maps (Requiem), mourners and token decks (Dirge), hyenas and vultures (Carnage), wolf packs and ants (Muster), lone hunters on 17-A-4 (Beset), swarms in the caves and reefs (Throng). Maps 21-40 add no new skills, so they arrive on Maps 0-20 cards or past Map 40.
  - A. All six at these thresholds (recommended)
  - B. Requiem, Muster and Throng only
  - C. A scaling form (+1 Attack per K deaths / units, capped) instead of thresholds
  - Say it
- **Default:** A. All six at these thresholds (recommended)
- **Outcome:** Owner, 2026-10-26 11:19: "Okay threshold." The six threshold skills as proposed.

**FIX3-1. Links open on any won fight: are some of the 34 two-branch joins meant to wait for both branches?** · Decide · Maps · asked 2026-10-25
- F1 (your #9: "winning that skirmish should unlock 2, not 1"): a fight now opens as soon as ANY fight linked to it is won. Before, a fight with two links waited for both: on your live map edits 6-6 is linked from 6-5 and 6-3 (card_overrides __cfg:map-nodes:m8), so winning 6-3 drew a line to 6-6 that stayed shut. The road has 34 such joins (for example 1-4 after 1-2 and 1-3, 3-7 after 3-5 and 3-6, 11-8 after 11-5/6/7, 20-10, 24-8): each now opens from either branch, so a player may skip one branch. The skirmish editor keeps the old rule as an opt-in ("Unlocked after: all of these are cleared"), and those links draw dotted. Every map is checked by tests/fix3-2026-10-25.js (each link opens its fight; every fight can be reached).
  - Any link opens it (as built)
  - Mark some joins "all of these" (name them)
  - Back to all links for joins, only fan-outs open on one
- **Default:** Any link opens it (as built)
- **Outcome:** Owner, 2026-10-26 11:19: "Multi-links mean unlocking the base skirmish unlocks multiple." A win opens every fight it links to (as built).

**FIX3-2. G20: which Map 0 click should give a tooltip after Map 10?** · Decide · Maps · asked 2026-10-25
- Built from your note "After Map 10, the submap on Map 0 should give a tooltip on click, not dialogue": on Map 0 the two things that still start a conversation, the signpost (its talk points you to Map 1) and the old well, now show a short tip with their name once Map 10 is cleared, seen or not. Map 0's side-map entrances (the Tutorial, the Old Bramble) never talked; they open their map or show their lock tip. If you meant something else (a side map's own NPC, or the Tutorial map), say which.
  - The signpost and the well (as built)
  - Something else (name it)
- **Default:** The signpost and the well (as built)
- **Outcome:** Owner, 2026-10-26 11:19: "OKAY to tooltip"

**FIX3-3. Email sign-up: allow the game's address as a redirect in Supabase Auth?** · Decide · Accounts · asked 2026-10-25
- G7: your second account signed up with email but is unconfirmed and never signed in (no profile, no rows), so nothing could be saved. Email sign-up needs the confirmation link first. The game now says so, keeps the sign-up's progress on the device, and asks Supabase to send the link back to the game (emailRedirectTo = the page's address); the first sign-in of that account sends this device's progress and decks up. Supabase only honours that address if it is the Site URL or in Authentication > URL Configuration > Redirect URLs (https://bramblewood-arena.vercel.app). This is a dashboard setting, not SQL; nothing was changed on the server. The other option is turning off "Confirm email" (accounts would work at once, with no check that the address is real).
  - Add the game's URL to Redirect URLs (keep Confirm email)
  - Turn off Confirm email
  - Leave as is
- **Default:** Add the game's URL to Redirect URLs (keep Confirm email)
- **Outcome:** Owner, 2026-10-26 11:19: "Email: it was actually okay. just that the screen did not move to the main screen" Fixed by G7 (the return after sign-in); no Supabase setting needed.

**FIX3-4. Should a PvP stranger's deck be levelled to your battle rating?** · Decide · PvP · asked 2026-10-25
- Your G22 question, from the code: PvP is not scaled to your BR. The opponent is a recorded deck (a player's or a seeded stranger) from your Elo tier (6 tiers on the rating curve, widening one tier at a time until at least 6 candidates), drawn at random with a 60% pull toward decks whose battle rating is near yours (weight 0.4 + 0.6 x e^(-|BR difference| / max(8, your BR / 4))). Its cards fight as recorded; nothing is levelled up or down, and the win moves your rating by Elo (K 24). Options: keep it, or level the stranger's cards so its BR matches yours (a fairer fight, but a strong deck no longer reads as strong), or match on BR first and Elo second.
  - As now (Elo tier, BR pull)
  - Level the stranger to your BR
  - Match on BR first, Elo second
- **Default:** As now (Elo tier, BR pull)
- **Outcome:** Owner, 2026-10-26 11:19: "Yes level pvp strangers deck" Queued: a PvP stranger's deck is levelled to the player's BR.

**PREF-1. Reference-2's levels: 100 at Map 20 (as built) or your 105? And is Level 0 unlevelled or a Level 0 hatchling?** · Decide · Balance · asked 2026-10-25
- REF-2 (your 22:36): "all Level 0 at Map 0, +1 level to 5 random cards per map (105 at Map 20)". Built as written: Map 0 unlevelled, then +5 levels a map, so Map 20 has 100 (5 x 20). 105 would need Map 0 to get its 5 too (or a sixth level somewhere). A level here is a Forge level gained over each copy's own starting level, so at Map 0 every card has its printed stats. In the game, Level 0 below a card's starting Level 1 means a hatchling at about 85% of its stats; read literally, Map 0 would play all 20 copies at 85% (every card in the deck starts at Level 1). Your Base cards stop at Lv 4, so the deck caps at 102 levels from Map 21. The levels are seeded per map (docs/balance/ref/ref2-owner-main-deck-2026-10-25.json, schedule).
  - 100 at Map 20, unlevelled at Map 0 (as built)
  - 105: Map 0 gets its 5 levels too
  - Level 0 = hatchling at Map 0
- **Default:** 100 at Map 20, unlevelled at Map 0 (as built)
- **Outcome:** Owner, 2026-10-26 11:19: "PREF: OKAy to your recos" 100 levels at Map 20, Level 0 = unlevelled.

**PREF-2. A road fight played with the reference deck: free and unpaid, or the normal fight?** · Decide · Balance · asked 2026-10-25
- P1's switch (Admin Mode: "Play with the map's reference deck") replaces your deck in any Conquest fight. Built: such a fight costs no Energy and pays nothing (no rank, cards, XP or progress, like a PRO fight), so testing the road with a deck you don't own never moves your save. The fight's top bar shows REF and the results say "no rewards". The alternative is to pay Energy and count the win like any other fight.
  - Free and unpaid (as built)
  - Normal fight: Energy, rewards and progress
- **Default:** Free and unpaid (as built)
- **Outcome:** Owner, 2026-10-26 11:19: "OKAy to your recos" Reference fights stay free with no rewards.

**PREF-3. Side maps that open late: should their PRO / BPRO fights level with the map they open on?** · Decide · Balance · asked 2026-10-25
- P3 (docs/balance/pro-ease-2026-10-25.md): the easiest PRO fights are side maps' BPROs. A side map counts as the map it opens on (the Old Bramble = Map 17, Clovermead 12, the Sunken Grove 13, Smugglers' Grotto 7, the Pale Desert 19), so both references arrive levelled for that map, but its PRO decks are Level 1 under its own early rarity cap. 0-B-BPRO-1/2, 1-A-BPRO-1, 2-B-BPRO-1..4 and 5-A-BPRO-1..4 are won 84-100% by both references. Nothing was changed ("PRO is not to change any existing skirmishes"). Options: leave them, or give a side map's PRO fights the enemy level the road uses for the map it opens on (a PRO rule change, not a deck change), or re-run the optimizer for them at that map's level.
  - Leave them (as now)
  - PRO level = the road's enemy level of the map it opens on
  - Re-run the optimizer at that map's level
- **Default:** Leave them (as now)
- **Outcome:** Owner, 2026-10-26 11:19: "OKAy to your recos" Late-opening side maps' PRO fights take the enemy level of the map they open on. Queued.

**OWN-Q1. Bound: what may a bound unit still do?** · Decide · Engine · asked 2026-10-25
- Owner #24: "Bound: Abit too unfair. Maybe it allows them to use non-moving actions and skills and even attack you back w/ half damage, but intercept, arrow, dive etc are not allowed. If they are flying, it removes their evasive effect. Idk this still sounds too strong" Proposal: a bound unit can't move or reposition (no Intercept, Guardian, Dive, Pounce, Charge), loses Flying's evasion, and still swings at half damage; Arrow and other ranged actions stay allowed (they don't move).
  - As proposed (ranged actions allowed)
  - Also no Arrow / shots
  - Your version (say it)
- **Default:** As proposed (ranged actions allowed)
- **Outcome:** Owner, 2026-10-25 23:58: "Arrow and ranged actions also do half damage i think." Bound: no moving (no Intercept, Guardian, Dive, Pounce, Charge), no Flying evasion; swings AND arrows / ranged actions at half damage. Queued with ENG9 (E19).

**OWN-Q2. Equipment: how is it destroyed?** · Decide · Engine · asked 2026-10-25
- Owner #21: "Im not sure how to destroy equipment though. maybe thematically it represents a factory or equipment ... so that's why when its lost in the field (unit dies), the next unit can pick up the next one." Proposal: equipment can't be destroyed, only stolen (unless Tamper-proof) or dropped when its unit dies, after which the next unit to reach it picks it up after its Equip Time. Acid / Corrode (EQ-1 durability) wears a copy out. Owner, 2026-10-25 23:58: "Equipment can be destroyed through specific anti-equipment skill. But only at 50% chance ... how do i make stronger equipment represent hardiness? Like mythril armor shouldn't break easily - maybe with armor 'lives' default 1, some have 2-3 ... Your write a deeper proposal first." A proposal doc first (docs/proposals-2026-10-26.md); note EQ2 durability already exists (5 by default, hits wear 1, acid 2).
  - As proposed
  - Also a Shatter skill that destroys one
  - Say it
- **Default:** As proposed
- **Outcome:** Owner, 2026-10-26 11:19: Answered by PROP1-1 (approved 10-26 11:19, Hardy -1 a break).

**OWN-Q3. A battle pass, and the packs given for levels** · Decide · Economy · asked 2026-10-25
- Owner #51: "What would a battlepass look like? Should we take back the abundant packs we give in levelling? 25 levels = 25 packs - but it seems very hard to reach level 25 actually." With #3 (packs from Level 5 alternate faction / Pack 1, later Pack 2; singles for Levels 1-5) and #52 (gentler exponential, stronger linear XP part). A proposal doc comes first (OWN-B4). Owner, 2026-10-25 23:58: "Battlepass is not level locked but gameplay locked. Doing what actions daily or weekly builds up to it. Resets every month." A proposal doc first.
  - Write the proposal first (recommended)
  - Not yet
- **Default:** Write the proposal first (recommended)
- **Outcome:** Owner, 2026-10-26 11:19: Answered by PROP1-2 (approved 10-26 11:19, renamed to a trail-mix / camper-van theme).

**OWN-Q4. Fester: what is wrong with it?** · Decide · Engine · asked 2026-10-25
- Owner 17:53: "Fester - not a good effect." Fester today: see docs/effects-catalogue.md. Rework it, rename it, or remove it from its cards? Owner, 2026-10-25 23:58: "Fester - just do extra damage = poison seems very lame and already kinda done with detonate. I like the name though. Maybe it makes parasites act twice or something." A rework proposal first.
  - Rework (say how)
  - Remove from cards
  - Claude proposes a rework
- **Default:** Rework (say how)
- **Outcome:** Owner, 2026-10-26 11:19: Answered by PROP1-3 ("Fester okay", 10-26 11:19).

**OWN-Q5. Pulverise: what does it do?** · Decide · Engine · asked 2026-10-25
- Owner #11: "New skill: Pulverise - for now not sure what ill do." Held until the owner has an idea; Claude can propose (e.g. deals damage that ignores Shield and breaks Armor for the fight).
  - Hold
  - Claude proposes
- **Default:** Hold
- **Outcome:** Owner, 2026-10-25 23:58: "Pulverise can break armor & magic armor and break equipment I think, and 2x damage to structures. Also, unit with Pulverise ignores armor." Build: Pulverise ignores Armor, breaks Armor / Magic Armor and equipment it hits, double damage to Structures. Queued with CONTENT3; priced by the 4-round rule.

**PRO3-1. Side-map PRO decks may hold cards a player gets later** · Decide · Balance · asked 2026-10-25
- PRO3 gave every side map of Maps 0-20 its own PRO / BPRO fights (N-L-PRO-k, e.g. 2-B-PRO-1). A side map's own pool is its parent's MAP tier + its SUBMAP list + SPECIAL + its fight decks, and some side-map fight decks hold cards first obtainable later (the Mudpuppy, Map 9, in Lilypad Reach 2-A and the Mycelium Deep 7-A; the Abyss Lantern Squid, Map 13, in the Sunken Depths 10-A; the Cinder Gecko, Map 22, in the Pale Desert and the volcano side maps; the Siege Rhino, Map 23, in the Canopy). By the PRO rule these decks stay and list the card under `later`. Keep them, or drop cards first obtainable after the side map opens from side-map pools too?
  - Keep: a side map's own fight cards are its pool (proposed)
  - Drop later cards from side-map PRO pools
- **Default:** Keep: a side map's own fight cards are its pool (proposed)
- **Outcome:** Owner, 2026-10-25 23:58: "PRO okay, BPRO no." PRO decks keep a side map's later cards; BPRO pools drop cards first obtainable after the side map opens (re-run BPRO for those side maps).

**PL2-1. The Dungeons tab: gone for players, kept in Admin Mode** · Decide · Dungeons · asked 2026-10-25
- Your PL1-3 answer ("Dungeons Tab is not needed for a while"), built: players never see the Dungeons tab (nor the 🗝️ key, which already needed a daily dungeon). Admin Mode (and Dev Mode) still show it, so the daily dungeons and the Spire stay testable. The Group Dungeon is the Arena's new Co-op tab and a 👥 spot on Map 3 after its last fight (the same gate as before: Map 3 won). Hide it in Admin Mode too?
  - Kept in Admin Mode (built)
  - Gone for everyone until the dungeons move
- **Default:** Kept in Admin Mode (built)
- **Outcome:** Owner, 2026-10-25 17:53: "Hide the dungeons as im thining where to place them unless admin." Kept: players never see them; Admin Mode does.

**PL2-2. Where the Group Dungeon sits on the map** · Decide · Map · asked 2026-10-25
- Your PL1-3 answer: "It'll be just a dungeon on the map". Built: a 👥 spot on Map 3 (Gannet Cliffs side of the road, beside its last fight), found once that fight is won; tapping it opens the Group Dungeon's card (Create, Solo with CPU allies, Join by code). An admin can drag it like any spot. The Arena only opens on Map 11, so the map spot is how a player reaches it before that. Another map, or a cave-looking node instead of a spot?
  - Map 3 spot (built)
  - Another map (say which)
  - A dungeon node with its own look
- **Default:** Map 3 spot (built)
- **Outcome:** Owner, 2026-10-25 17:53: "The multiplayer dungeon should definitely be much further ahead." and #10: "the group dungeon should be pushed later ahead, to Map 16 maybe", named after its own theme (a duo heist, castle crashers). Queued: OWN-B3.

**PL2-3. XP won outside the Conquest map waits for the map** · Decide · Results · asked 2026-10-25
- Your 00:02 "XP is for all skirmishes", built: no won fight's results show the XP bar any more (Arena, Spire, dungeon floors as well as Conquest). The XP counts at once (a level-up included); the bar fills at the top of the Conquest map the next time it is in view, after that map's own moments (each fight won since you last saw it plays its emblem, even over a chain of Next fight wins or a reload). A long Arena session therefore shows its XP only when you next open the map. Also fill it on the Arena screen when you go back there?
  - Only on the Conquest map (built)
  - Also on the Arena screen
- **Default:** Only on the Conquest map (built)
- **Outcome:** Owner, 2026-10-25 17:53: "Arena is different. I guess it shows immediately (its rewards only). The other rewards show the moment you exit a fight, regardless of which screen you go to, e.g. you refresh the page and go into the home page." Queued: OWN-R8.

**PL2-4. Which card rewards flash with the rank ribbon** · Decide · Results · asked 2026-10-25
- Your 00:02 #5, built: every card reward is a card (eggs as cards, card-form materia with ×N); two or more are one stack with a count, fanned on hover or tap. Two kinds count as won by the rank and flash with a ribbon (the rank emblem and "reward"): the top-rank rare find (once per map) and a card drop the rank unlocked. First-clear rewards and Base copies are plain. The ribbon shows the rank the fight was won at. Add first-clear cards to the flashing ones?
  - Rare find and rank-gated drops (built)
  - Also first-clear cards
- **Default:** Rare find and rank-gated drops (built)
- **Outcome:** Owner, 2026-10-25 17:53: "The ribbon should be on the top right." Kept which rewards flash; the ribbon moves to the card's top right. Queued: OWN-R7.

**PL2-5. Fire Ant Raft and Ember Tetra have no art** · Decide · Art · asked 2026-10-25
- The "ghost art" in your 00:02 SS#1 was the Fire Ant Raft's placeholder: a card with no art shows its emoji, and it was drawn at 55%. It is drawn whole now, but the Fluent set's ant is a pale violet shape, so the card still looks unfinished. Both it (Map 5, Pack 1) and the Ember Tetra (Pack 3) need art. Queue both for the next art batch?
  - Queue both (art workflow)
  - Leave the placeholders
- **Default:** Queue both (art workflow)
- **Outcome:** Owner, 2026-10-25 17:53: "No comment on the art for now, queue for art next time." Queued for the next art batch.

**PL2-6. How quiet the fight's music is under the results** · Decide · Audio · asked 2026-10-25
- Your 00:02 #10, built: while a fight's results (or the board looked at after them) are up, the fight's theme carries on at 30% under the Victory / Defeat sting, which plays at full level; the map's theme starts only once you are back on the map and fades in over 4 s (it used to start at once, 1.5 s, as the results came up). Quieter or louder under the results, faster or slower fade-in?
  - 30% and 4 s (built)
  - Say the numbers
- **Default:** 30% and 4 s (built)
- **Outcome:** Owner, 2026-10-25 17:53: "Yes to music. the numbers are okay." 30% and 4 s kept.

**EN8-11. Render's Daunt counters: what takes one off** · Decide · Battle rules · asked 2026-10-25
- Owner 00:02 #2, built: Render N puts N Daunt counters on the enemy facing it (-1 Attack and -1 skill damage each). One falls off at each round's end, one when it swings (its action), and one each time it uses a skill (any trigger that runs an action; a swing's own On Action / On Attack are part of the swing). Cleanse takes them, one a point. Priced 0.8 a point (4-round rule; was 2 for N Attack lost for good). The older Daunt N skill (on hit: -N Attack until the end of next round) is unchanged and adds to the same -Attack. Should a passive skill (an aura, a heal at upkeep) also take a counter off, or only actions and triggered skills?
  - Swings and triggered skills only (built)
  - Also every passive that fires
- **Default:** Swings and triggered skills only (built)
- **Outcome:** Owner, 2026-10-25 17:53: "No only falls off when it does a damage action like attacking or arrow." A Daunt counter falls off only when the unit does a damage action (a swing, an Arrow, a bolt...); not at round end, not on other skills. Queued: OWN-E5.

**EN8-10. The CPU is stronger on Maps 0-20: retune the road after EN8?** · Decide · Balance · asked 2026-10-24
- Measured (tools/en8_cpu_pitch_2026_10_24.js, every fight of Maps 0-20 and their side maps as the game builds it, 40 games each, the reference player at Smart): the new-player win rate fell from 76.0% to 64.4% (docs/balance/en8-cpu-pitch-before-all.json -> -after-all.json). Of the ~12 points: the CPU's new pitch about 5.5 (its first card down: round 1.19 -> 1.01 on average; the owner's 4-of-20 case 2.59 -> 1.54), brambles that heal an ally instead of themselves (castleRegen, P24-17) about 3.7 (probe files -nopitch / -nopitch-regen), the lethal guard about 0.6 (-after-noguard), the rest (Rampart's columns, Guardian vs Thorns, Windfall) about 2. Nothing was retuned here. Proposal: the next BAL / road-curve pass re-measures and re-tunes the outliers (tools/skirmish_pass.js curve). PRO3 (2026-10-25) did that pass by the agreed schedule (roadCurveTarget, green = target +/- 8): every fight of Maps 0-20 and their side maps measured (tools/skirmish_pass.js measure, 40 games, 241 fights), then CPU deck swaps only (a card of the map's pool for another, the leader, first-clear card and deck size kept, no Shield or Health change). On the curve: green 68 -> 117, too easy 77 -> 56, too hard 81 -> 53; main-map mean 64.0% -> 67.2% (131 decks changed). Most of the 53 still too hard are decks already made of their map's weakest cards (Map 2, Map 4, Map 11 and Map 20's elites, 2-5, 7-6, 11-7, 20-6, 20-8): a swap cannot reach the target there. Your call: accept as is, or allow the next lever for those (drop copies so a deck shrinks, a lower enemy level or bramble, or a stronger reference deck). Data: docs/balance/pro3-road-check-2026-10-25.md (before / after per fight). Owner, 2026-10-25 17:53 (#27, #32): "Master hub difficulty page will flag them out with high difficulty. PRO is not to change any existing skirmishes - they are for me to evaluate the cards in that map. ... (it might be because of the reference deck. let me fight the reference deck as X-REF where X is the map number." Open part: PRO3 retuned 131 road decks by the agreed curve (card swaps only). Keep those swaps, or revert them and only flag the hard fights in the hub? Owner, 2026-10-25 23:58: "Don't retune yet. We'll see the performance against ref decks". Open: revert PRO3's 131 swaps now, or leave the road as it is and re-measure?
  - Keep PRO3's 131 swaps; flag what is still hard
  - Revert the swaps; only flag in the hub
- **Default:** Accept PRO3's swaps; leave the rest (proposed)
- **Outcome:** Owner, 2026-10-26 11:19: "EN8-10: No action yet" The road stays as it is (PRO3's swaps kept); the hub flags the hard fights.

**EN8-9. The new resource cards and their homes** · Decide · Cards · asked 2026-10-24
- One card per new skill, pack cards in their biome's map (no faction cards), stats on the formula line: Beachcomber Sanderling (Driftwood 1, 1/7, Pebble Beach, Map 2), Beaver Feller (Felling 1, 2/10, the Morel Hollow, Map 7), Prospector Mole (Prospector 1, 3/9, Caves & Alcoves, Map 8), Salvager Hermit Crab (Salvage 1, 1/13, Coral Current, Map 10), Marmot Stonecutter (Stonecutter 1, 1/12, Eyrie Heights, Map 11), Carrion Crow (Flying, Scavenge 1, 2/5, the Briar Maze, Map 12), Hazel Coppice (Structure, Coppice 1, 0/14, the Redwood Deep, Map 13), Moonshell Snail (Magic Armor 1, 1/15, the Long Grass, Map 15). The Leafcutter Gardener's Growth (it did nothing) became On Ready: +1 Lumber (22:28 #10), 2/7. Art prompts: docs/art/en8-2026-10-24-briefs.md.
  - Keep
  - Move or rename some (say which)
- **Default:** Keep
- **Outcome:** Owner, 2026-10-25 17:53: "EN8-9 Great!" Kept.

**EN8-8. The CPU's lethal guard at every level** · Decide · AI · asked 2026-10-24
- P24-7, built: from Map 1 on (Map 0 keeps the old play), when your Ready units would swing into open columns for its bramble's Health and Shield and it can't win that round itself, the CPU plays the unit that blocks the most of it into the attacker's column (Basic, Smart and Smartest alike). And the pitch (22:28 #1 / #3): every level pitches before it plays: nothing useful -> its least valuable card; an unaffordable card in hand with 3+ cards -> a spare card. Measured on the 5-3-like deck (4 zero-cost of 20, docs/balance/en8-cpu-pitch-*.json): first play round 2.59 -> 1.54. Keep the guard at Basic too, or Smart and up only?
  - Every level (built)
  - Smart and Smartest only
- **Default:** Every level (built)
- **Outcome:** Owner, 2026-10-25 17:53: "Guardian and Rampart only works when the unit is ready." Plus intercept animations and the CPU's per-turn resource plan (OWN-E9, OWN-A2). The guard stays at every level.

**EN8-7. Where Windfall blows** · Decide · Maps · asked 2026-10-24
- LUM-1 Windfall, built as a field rule: after a Storm round (a Thunderstorm, or a strong-wind round on a windy map), both sides gain 1 Lumber at the next round's start. Placed on every fight of the windy maps up to Map 20 (Gannet Cliffs, Eyrie Heights, the Glass Dunes, Ashen Spurn, the Sundered Peak and their side maps); it is shown with the map's other field effects and can be set per fight in Edit skirmish. Keep it there, or only on chosen fights?
  - The windy maps up to 20 (built)
  - Only chosen fights (name them)
- **Default:** The windy maps up to 20 (built)
- **Outcome:** Owner, 2026-10-25 17:53: "I like your STORM field effect. and a creatures that could use it - either those empowered by wind or empowered by electricity. IN a sandstorm, they would also similarly be empowered, but blind. Your choice on where to put windfall" Windfall stays on the windy maps; storm creatures and a Sandstorm field queued (OWN-C4).

**EN8-6. Pearls: when Pearl Bed pays, and the Shellfish type** · Decide · Content · asked 2026-10-24
- 22:28 #2, built: Pearl Bed N gives N Pearls when the card becomes Ready (a Wait 0 card: as it lands). A Pearl pays 1 Lumber or 1 Stone, only when you are short (Lumber and Stone first). Price 0.9 a point. On the Oyster Bank (Map 2, Pearl Bed 1 + Shore Up) and the Giant Clam (Map 10, Pearl Bed 1 + Shell 2), both already placed and re-fitted (0/14 -> 0/13; 5/5 kept). "Shellfish" is not a type yet: they count as Molluscs (a Shellfish node needs the taxonomy file, outside this package). Alternatives: Pearl Bed on hit, or every few turns.
  - On Ready, once (built)
  - On hit
  - Every 3rd Ready turn
- **Default:** On Ready, once (built)
- **Outcome:** Owner, 2026-10-25 17:53: "EN8-6 OKAY" On Ready, once.

**EN8-5. Scavenge and Salvage: SK2's point counters replaced by LUM-1's plain rules** · Decide · Content · asked 2026-10-24
- SK2 (10-19) already had Scavenge N, M (points from deaths within 1 column, M points -> 1 Lumber) and Salvage N, M (the same for Structures -> Stone), on no card. LUM-1's Scavenger and Salvage are simpler, so the two names now carry them: Scavenge N: another of your units dies -> +N Lumber; Salvage N: another of your Structures dies -> +2N Lumber. Both always on (Waiting too). Prices 1.5 and 0.75 a point. One card each: Carrion Crow (Map 12), Salvager Hermit Crab (Map 10).
  - Keep the plain rules (built)
  - Bring back the point counters
- **Default:** Keep the plain rules (built)
- **Outcome:** Owner, 2026-10-25 17:53: "OKAY Plain rules are easier."

**EN8-4. Fodder before Map 20, and the one "?" skill** · Decide · Cards · asked 2026-10-24
- 21:20 #7, built: Stem, its braces and Chrysalis are Evomax skills (the editor offers them on Evomax cards only, like Evolute / Alpha / Omega). Fodder (EV-6's Stem from Level 1) came off the 20 baby-like cards first obtainable before Map 20 (Otter Kit, Duckling, Fox Kit, Caiman Hatchling, Bear Cub ...) and the Speckled Egg lost its Stem; the three babies first obtainable on Map 20+ (Fire Drake Hatchling, Harp Seal Pup, Duckling Squadron) keep it, as EV-6 said. "One of the fodder skills can be a ? for now": the Cocoon's Chrysalis reads "❓ ?" ("Something stirs inside. Its skill wakes on the Evomax maps") on its face and in its detail; the rule is still there (no evolute exists before Map 20). Which card(s) should carry the "?"?
  - The Cocoon's Chrysalis (built)
  - Every baby-like card shows a "?" Fodder slot
  - None: just remove
- **Default:** The Cocoon's Chrysalis (built)
- **Outcome:** Owner, 2026-10-25 17:53: "Fodder, stem, chrysalis should all say ?. Then at maybe 5 maps before 20, you can see the name, but not the effect. so Chrysalis - ?" Queued: OWN-E10.

**EN8-3. A bramble's healing heals an ally; the Wildpath perks that mend the bramble** · Decide · Battle rules · asked 2026-10-24
- P24-17, built: a bramble's healing passive (the maps' castleRegen N: 8 brambles) now heals ONE random wounded ally unit N each round, never a Structure and never the bramble ("Heal 1 random ally 1" as the default meaning). Heals never touch a Structure; Repair N and Rebuild are what restore Structures and brambles. Left as they were: the Wildpath perks Sap Mending and Heartwood, which put 1 Health back on your own bramble (they read as repairs). Keep the perks, or turn them into ally heals too?
  - Keep the perks as repairs (built)
  - Make them heal an ally too
- **Default:** Keep the perks as repairs (built)
- **Outcome:** Owner, 2026-10-25 17:53: "OKAY but to be specific, it MUST say \"Repair Bramble\"" Perks kept as repairs; their text reads "Repair Bramble". Queued: OWN-E11.

**EN8-2. Armor is physical only; Magic Armor N is the other half** · Decide · Battle rules · asked 2026-10-24
- P24-16, built: Armor (and Shell, the tide's Armor, Prayer Ward, Shieldwall) takes only from physical hits; magic and every element (fire / heat, frost, shock, poison, acid, water, decay) go past it. "Magic armor" did not exist as a skill (Supreme halves non-magic, Resist halves one element, Spellward redirects skills), so a new skill, Magic Armor N: N off each magic or elemental swing, shot or skill, never a physical one, never a status tick; Supreme crushes it. Priced 0.4 a point (Armor 1.5 x about a quarter of the hits being magic or elemental). One card: the Moonshell Snail (Map 15). Keep the name and price?
  - Keep (built)
  - Another name (say it)
  - Another price
- **Default:** Keep (built)
- **Outcome:** Owner, 2026-10-25 17:53: "All 'bolts' count as magic right now. Phyiscal elemental attacks need to be retroactively renamed. Elemental damage type counts as physical. ... So magic will be its own thing for now, in a way its own element, in an arcane way" Changes the built rule: elements are physical (Armor applies), only magic passes Armor; Magic Armor stops magic only. Queued: OWN-E3.

**EN8-1. Guardian vs Thorns: which way round** · Decide · Battle rules · asked 2026-10-24
- P24-15 ("Guardians must not intercept Thorns"), built: a Guardian never steps in for an ally that has Thorns (printed, or a Durian's): the swing lands on the Thorns unit and its Thorns answer the attacker. (Thorns damage itself was never redirected: it goes straight to the attacker, and no Guardian beside the attacker takes it.) The other reading: the Guardian still steps in, and the guarded unit's Thorns answer anyway.
  - No Guardian for a Thorns unit (built)
  - The Guardian steps in, the Thorns still answer
- **Default:** No Guardian for a Thorns unit (built)
- **Outcome:** Owner, 2026-10-25 17:53: "Yes thorns and similar can't be redirected - it doesnt make sense. Counter-attack CAN be redirected however." Kept; Counter-attack becomes redirectable (OWN-E4).

**LUM-1. Stone/Metal versions of the lumber gatherers, and other ways to make Lumber: which to build?** · Decide · Content · asked 2026-10-24 · decided 2026-10-24
- Owner 21:41: 'Lumberjack - what are the stone and metal variants - simple 2x might be too strong. But what other ways to generate lumber?' Proposal: Stone and Metal are scarcer, so their gatherers are slower, not stronger: Stonecutter 'On Ready: +1 Stone every 2nd round'; Prospector 'On Kill: +1 Metal'; Smelter converts 2 Stone -> 1 Metal at round end. Other Lumber sources: Felling (On Kill: +1 Lumber), Salvage (when one of your Structures dies: +2 Lumber), Windfall field (after a Storm round, both sides +1 Lumber), Scavenger (when an ally dies: +1 Lumber), Coppice (a tree Structure that gives +1 Lumber each round while undamaged), Driftwood tide (at Ebb, +1 Lumber on beach maps).
  - Build all
  - Pick some
  - Not yet
- **Default:** Pick some
- **Outcome:** Owner (22:28 #2): "We need to build up our stonecutter, prospector, felling, salvage, scavenger, coppice, windfall, driftwood skills! (default 1). Shellfish (new) can create 'Pearls' which can be used as stone OR wood." Build all (not the proposal's Smelter, which SK2b already has). Built in package EN8 (calls EN8-5 .. EN8-7, EN8-9).

**PRO2-1. PRO / BPRO rarity cap: the map's rarest fight, or a plain skirmish?** · Decide · Skirmishes · asked 2026-10-24
- Your 21:20 #11: "run the PRO ones but with respect to the rarity and cards of that map". Built: a PRO or BPRO deck may hold the rarest card any of the map's fights may hold. On the main road that is the elite's step: Map 0 Common, Maps 1-3 Uncommon. Map 1's skirmishes are Common, and only its elite (1-5) is Uncommon. A PRO fight is a skirmish, so the stricter reading is a plain skirmish's cap: Common on Maps 0-1, Uncommon from Map 2. That changes only Map 1 among Maps 0-3. Switch: --rarity-cap skirmish on both tools, then re-run.
  - The map's rarest fight (built)
  - A plain skirmish's cap
  - One step above the map's rarest fight (PRO is meant to be hard)
- **Default:** The map's rarest fight (built)
- **Outcome:** Owner, 2026-10-25 17:53: "PRO: OKAY. your decision. If it's over-rare'd then move it off." The map's rarest fight, as built.

**PRO2-2. Alley Cat's home: the Gatorback Swamp (Map 5), or Clovermead?** · Decide · Progression · asked 2026-10-24
- Your 21:20 #10: "Why is alley cat in map 0's list of cards too!?" RW5 (10-23) gave this map-less Rare a home by theme, the village edge of Map 0, and Map 0's fights are Common only. No other map 0-40 lists a card over its fights' cap. Built: it moved to the Gatorback Swamp (Map 5, the swamp's trading post, like the Buzzed Chipmunk). Map 5 reveals Rare and its boss may hold one. It stays a Pack 1 card (Maps 0-6) and first obtainable on Map 5, so its 1/1 budget line is unchanged. The better fit by theme is Clovermead, Thistlewood's village side map (house cat, farm dog, miller), but that opens at Map 12. It would make the Alley Cat a Pack 2 card and re-price it for Map 12.
  - Gatorback Swamp, Pack 1 (built)
  - Clovermead (village side map), Pack 2, re-priced
  - Another Maps 5-6 home
- **Default:** Gatorback Swamp, Pack 1 (built)
- **Outcome:** Owner, 2026-10-25 17:53: "you did, so k." Alley Cat stays on the Gatorback Swamp.

**PL1-1. Where the XP of a Conquest fight shows (P24-3)** · Decide · Results · asked 2026-10-24
- Your note: "Show the XP reward only when leaving the skirmish for the conquest map." Built: a Conquest fight's results no longer draw the XP bar; the XP still counts when the fight is won (no toast while the results are up), and the bar fills at the top of the map once you are back (after a new map's veil and title, before the packs). Other fights (Arena, raids, the Spire's own results) keep the bar on their results.
  - As built (Conquest: on the map; others: on the results)
  - On the map for every fight that returns to the map, no bar on any results
  - Keep the bar on the results too
- **Default:** As built (Conquest: on the map; others: on the results)
- **Outcome:** Owner, 2026-10-25 00:02: "XP is for all skirmishes." XP on the map for every skirmish type (queued, PL2).

**PL1-2. The band on booster packs (P24-4)** · Decide · Packs · asked 2026-10-24
- Your note: "make it a ribbon hugging the packs; show it only when there is more than 1 pack." Built: a single pack has no name band anywhere it is drawn (the shop shelf, the counter, the results, the map rewards; its name is on the tape or the line under it). A set (x2 and up on the shelf or the counter) is tied with one red satin ribbon round the fanned packs, with a bow and the count (x5). Was: a name band across every pack and a thin twine on sets.
  - As built
  - Keep the name band on single packs, ribbon on sets
- **Default:** As built
- **Outcome:** Owner, 2026-10-25 00:02: "OKAY"

**PL1-3. When the Dungeons tab opens (P24-13; changes AR3-2)** · Decide · Dungeons · asked 2026-10-24
- Your note: "The Daily Dungeon tab is not available until something unlocks it." AR3-2 opened the tab for every player past the tutorial (it held only the Group Dungeon). Built: AR3-2's second option, the tab opens once Map 3's last fight is won (GD_OPEN_AFTER_MAP = 3), or with the first daily dungeon; Admin Mode sees it as before.
  - After Map 3 (built)
  - After another map (say which)
  - Only with the first daily dungeon
- **Default:** After Map 3 (built)
- **Outcome:** Owner, 2026-10-25 00:02: "Dungeons Tab is not needed for a while - i plan to move all the dungeons much later on. ... [the co-op dungeon] It'll be just a dungeon on the map, and it'll appear in arena, under coop tab." Hide the Dungeons tab; the Group Dungeon as a map dungeon + Arena Co-op tab (queued, PL2).

**PL1-4. Reward packs before the Camp tile is tapped (P24-19, P24-6)** · Decide · Packs · asked 2026-10-24
- Why your 6 packs didn't open: since 2026-10-15 a reward pack won before the Armoury (the Camp) is open waits, and the Camp only counted as open once its map tile was tapped. Walking past the tile held every pack (the results still showed them) until a tap released them all at once. Built: the Camp counts as open as soon as it is there to tap (its Map 0 fights won); packs held in older saves open the next time a map is shown. The Camp tile still has its own first-visit moment.
  - As built
  - Open the Camp by itself once it is available (no tile tap)
- **Default:** As built
- **Outcome:** Owner, 2026-10-25 00:02: "OKAY"

**PL1-5. The pawn after X on the results (21:20 #4)** · Decide · Map · asked 2026-10-24
- Built: after a first clear, X (Back to the map) lets go of the fight: its panel closes and the pawn walks on to the next fight not yet won on that map. After a replay of a fight already won, the fight stays picked and the pawn stays on it (package MK's fix for the pawn jumping to the map's first fight). The Fight again / Next fight buttons are unchanged.
  - As built
  - Also after a replay
  - Open the next fight's panel too
- **Default:** As built
- **Outcome:** Owner, 2026-10-25 00:02: "OKAY"

**PL1-6. The faction pick's cards (P24-1)** · Decide · Tutorial · asked 2026-10-24
- Built: each side's three example cards (the panel that slides in when you hover Otters or Hummingbirds) start as three Commons of that faction (a card with the Otter / Hummingbird archetype) and, every few seconds, one card on one side turns over to another card of that faction at random, as the opening screen's fan does. Phones never show these panels (unchanged, they need hover). Both panels turn over all the time; only the hovered one is seen.
  - As built (on hover)
  - Show both sides' cards at all times on desktop
  - Show them on phones too (under the buttons)
- **Default:** As built (on hover)
- **Outcome:** Owner, 2026-10-25 00:02: "OKAY"

**N221-1. Pack tiers after Map 20: Pack 4 Maps 21-27, Pack 5 28-34, Pack 6 35-41** · Decide · Progression · asked 2026-10-24
- Derived from your Pack 1-3 pattern of about 7 maps each (PP-1: 0-6 / 7-13 / 14-20). Tier 4 already exists in the data (every pack card of Maps 21-24 and the Ice Hollow / Old Bramble side maps carries it; no shop pack sells it yet, so those cards come from the card drop and the base track). Tiers 5 and 6 are written into the proposal only; Pack 6 runs past Map 40, where you build one map at a time. docs/balance/n221-divvy-2026-10-24.md.
  - Pack 4 21-27, Pack 5 28-34, Pack 6 35-41 (proposed)
  - Other ranges (say which)
  - Packs 4-6 as 21-30 / 31-40 / 41-50
- **Default:** Pack 4 21-27, Pack 5 28-34, Pack 6 35-41 (proposed)
- **Outcome:** Owner, 2026-10-25 17:53: "N221-1: OKAY ALL Dont need to purposely place cards we cant place right now. we can leave them be." The proposed defaults; cards with no home yet stay held.

**N221-2. Eight held cards would bring a new skill onto Maps 21-40** · Decide · Cards · asked 2026-10-24
- Your 10-21 rule: Maps 21-40 teach no new skill. These cards carry a skill no card a player can get on Maps 0-20 has: the Rainforest Floor (Map 25) War-Drum Mandrill (Durian), Aye-aye Prowler (Sun-shy), Velvet Worm (Ichor), Slow Loris (Feeble), Chilli Parrot (Chilli); Clinging Leech (Parasite, proposed the Carrion Moors, Map 27); Glintsnatch Magpie (Disarm, the Thornwold, Map 32); Armory (Weapon Master, Goldfeather Keep, Map 24: not applied for this reason). The five rainforest cards were held for Map 25 by your RP5 (later and more specific), so the default keeps them there; the other three wait in the proposal. Alternatives: Maps 0-20 homes (the Leech to the Mire off Map 6, the Magpie to the Briar Maze, Map 12, the Armory with the Forge, Map 11), Pack Secrets I, or Map 40+ where new skills come again.
  - Place all eight as proposed (each one card, met on that map's enemies first)
  - Rainforest five on Map 25; the Leech, Magpie and Armory to Maps 0-20 homes
  - None on 21-40: they wait for Map 40+ or Pack Secrets I
- **Default:** Place all eight as proposed (each one card, met on that map's enemies first)
- **Outcome:** Owner, 2026-10-25 17:53: "N221-1: OKAY ALL Dont need to purposely place cards we cant place right now. we can leave them be." The proposed defaults; cards with no home yet stay held.

**N221-3. The Petrified Tree is a Pack 4 card of the Rimefire Caldera (built)** · Decide · Cards · asked 2026-10-24
- The only waiting card that fits a map that exists without a new skill or an era hold. Petrified forests form under volcanic ash, and the Caldera is the volcano of Maps 21-24; a Stone maker (Gain 1 Stone a turn) beside its fire and ice. Applied: source pack tier 4, map m22, in the Caldera's pool (12 -> 13); its obtain map is 22 (canonical/card-obtain-maps.json), which leaves it under its budget (0/37: 2A+H+S 40 is 98% of N at Map 0, 89% of N 45.17 at Map 22; not re-fitted). Not a skirmish reward: the Caldera already has 10+ new cards and its three exclusives. The other choice was the Quiet Summit (pool 9 -> 10), where it would be the 6th new card and DV3 would ask for a third skirmish exclusive (a deck change).
  - Keep it on the Rimefire Caldera (built)
  - Move it to the Quiet Summit (and add a third Summit exclusive)
  - Hold it again
- **Default:** Keep it on the Rimefire Caldera (built)
- **Outcome:** Owner, 2026-10-25 17:53: "N221-1: OKAY ALL Dont need to purposely place cards we cant place right now. we can leave them be." The proposed defaults; cards with no home yet stay held.

**N221-4. The Rimefire Caldera (13) and the Goldfeather Siege (12) are over the 6-10 pool guide** · Decide · Maps · asked 2026-10-24
- They grew in earlier packages (the Weathervane Swift and Ashwing Ptarmigan on 22, the Marching Elephant and Werebadger on 23) and now the Petrified Tree. Trimming them would move those cards to maps that don't exist yet (proposed: the Swift to Stormcoast 28, the Ptarmigan to the Mammoth Steppe 33, the Marching Elephant to the Last Savanna 39, the Werebadger to the Thornwold 32), so they could not be had until then. Most Maps 0-20 pools are over 10 too since RW5.
  - Keep them (nothing moved)
  - Trim as proposed (those cards wait for their maps)
  - Trim only the ones that fight nowhere (Swift, Ptarmigan)
- **Default:** Keep them (nothing moved)
- **Outcome:** Owner, 2026-10-25 17:53: "N221-1: OKAY ALL Dont need to purposely place cards we cant place right now. we can leave them be." The proposed defaults; cards with no home yet stay held.

**N221-5. Maps 25-40: the proposal table** · Decide · Maps · asked 2026-10-24
- Sixteen map ideas, each with a pool of 6-10 (held cards, a few carried from earlier maps, unsorted enemy-only cards, new ideas from the eras rule), two skirmish-base cards, its pack tier and the road's caps: 25 the Rainforest Floor, 26 the Ant Empire, 27 the Carrion Moors, 28 Stormcoast, 29 the Echo Caverns, 30 the Old Growth (Evomax opens), 31 the Hollow Farmsteads (side map: the Cabbage Patch, your Killer Veggies), 32 the Thornwold (the Greenhood Band; the Thistle Baron returns), 33 the Mammoth Steppe, 34 the Tar Pits, 35 the Drowned Reef, 36 the Black Bayou, 37 the Lost Isle, 38 the Fossil Badlands, 39 the Last Savanna, 40 the Grove of the Dragon-Turtle (a seed only: from 40 you build one map at a time). Nothing is built; each map is made concrete only after your yes. docs/balance/n221-divvy-2026-10-24.md.
  - Use it as the working plan; build in order after a yes per map
  - Change some maps (say which)
  - Start over from your own list
- **Default:** Use it as the working plan; build in order after a yes per map
- **Outcome:** Owner, 2026-10-25 17:53: "N221-1: OKAY ALL Dont need to purposely place cards we cant place right now. we can leave them be." The proposed defaults; cards with no home yet stay held.

**N221-6. If CONTENT2-3 goes "other sources": the Gnawed to the Carrion Moors, the Tidefolk to Stormcoast** · Decide · Cards · asked 2026-10-24
- CONTENT2-3 is open (default: the Sable Swampmire, Glass Dunes, Kelp Mangroves and Coral Current, Maps 6-18). This pass did not place the seven. If you prefer later homes: the Gnawed (Bog Shrew, Mire Rat, Hollow-belly Rat, Gnawed Matriarch as a skirmish-base card) in the Carrion Moors (27, a moor of bones; the Black Bayou 36 is the second choice) and the Tidefolk (Kelpborn Otter, Conger Eel, Selkie Wavebinder as a skirmish-base card) on Stormcoast (28, seals in a gale). Note: the Hollow-belly Rat's Devour is Devilry's keyword and not taught on Maps 0-20.
  - Follow CONTENT2-3's answer (no change here)
  - The Carrion Moors and Stormcoast, as above
- **Default:** Follow CONTENT2-3's answer (no change here)
- **Outcome:** Owner, 2026-10-25 17:53: "N221-1: OKAY ALL Dont need to purposely place cards we cant place right now. we can leave them be." The proposed defaults; cards with no home yet stay held.

**N221-7. Homes outside the maps: Pack Secrets I, the faction pool, the Blacksmith, a quest** · Decide · Cards · asked 2026-10-24
- Not applied (each needs game code or a pool that isn't built). Pack Secrets I (empty today, progression plan item 12): MissingNo. (a hidden glitch) and the Glowing Gecko (Irradiated, like the Mystery Booster's Irradiated Axolotl and Glow Wyrm; the map recommendations' Map 33 would bring Irradiated as a new skill). The faction pool: the Anvilwhisker Otter (Otter side; it needs a Stone engine) and the Greyplume Fledgling (Hummingbird side, or Base). The Blacksmith: the Crowbar (equipment). A quest-only special: the Thistle Baron's return on the Thornwold (Map 32; RP5 held it for Map 21+). The eight spells stay held while spells are shelved (thematic homes listed in the doc); the Devilry (16) and Ecclesia (15) cards stay held for Maps 66 / 77.
  - As proposed
  - Change some (say which)
- **Default:** As proposed
- **Outcome:** Owner, 2026-10-25 17:53: "N221-1: OKAY ALL Dont need to purposely place cards we cant place right now. we can leave them be." The proposed defaults; cards with no home yet stay held.

**CONTENT2-1. Lumber gatherers per biome: placements and strengths** · Decide · Cards · asked 2026-10-24
- Your 13:12 #8 ("every biome should have its own lumber gatherers"), built: one per main biome of Maps 0-20 that had none in its pools, each a pack card of that map, priced by the formula. Driftwood Crab (Pebble Beach, Map 2, Common 2/9, On Ready +1 Lumber), Gannet Nestweaver (Gannet Cliffs, Map 3, Common 1/7, Flying, On Play +1), Nutria Reedcutter (Gatorback Swamp, Map 5, Common 2/12, Wait 2, On Ready +2), Redwood Woodpecker (Redwood Deep, Map 13, Uncommon 2/12, Milling 1: +1 every turn while Ready), Termite Forager (Savanna Reaches, Map 14, Common 2/6, Swarm, On Ready +1), Cone-cutter Squirrel (Pinewood Taiga, Map 16, Common 3/9, On Play +2), Talus Pika (Wolfsbane Tundra, Map 17, Common 2/9, On Ready +1), Dune Packrat (Glass Dunes, Map 18, Uncommon 2/14, On Ready +3). Three existing gatherers that sat in no pool joined their map: Land Tiller (Long Grass, Map 15), Coral Polyp Colony (Coral Current, Map 10), Rodent King (Briar Maze, Map 12). Still without one: the Kelp Mangroves (Map 9) and the caves and volcano maps, which get the Stone cards instead (CONTENT2-2). Map pools grow by 1-2; the Pinewood Taiga and Ashen Spurn go from 10 to 11 (the divvy's 6-10 guide). The Driftwood Crab fights in 2-3 (Hermit Row), the Gannet Nestweaver in 3-1 and 3-3.
  - Keep them (built)
  - Move or cut some (say which)
  - Fewer: only the owner's four (crab, gannet, woodpecker, termite)
- **Default:** Keep them (built)
- **Outcome:** Owner, 2026-10-25 17:53: "CONTENT2: Yes, but we can reuse lumber gatherers. ... since lumber is such a key mechanic - more lumber mechanics, more draw card mechanics. Same for the rest. OKAY." The proposals and built defaults stand; more lumber and draw mechanics queued (OWN-C6).

**CONTENT2-2. The Stone loop: Quarry (1 Lumber -> 1 Stone a turn) or a 2 -> 1 converter?** · Decide · Economy · asked 2026-10-24
- Your 13:12 #8 ("the stone making loop (lumber -> stone or just stone+)"), built with the engine's existing Quarry skill (SK2b, 2026-10-19), so no engine change: the Badger Stonemason (Caves & Alcoves, Map 8, Uncommon 1/15, Quarry 1: each turn while Ready, pay 1 Lumber, gain 1 Stone; can't pay, nothing happens) beside two Stone gatherers, the Gravel Mole (Map 8, Common 1/12, On Ready +1 Stone) and the Pumice Beetle (Ashen Spurn, Map 19, Uncommon 3/12, On Play +2 Stone). Caves & Alcoves is the Stone map: its Quarry Mole (Bedrock: Armor while you hold 2+ Stone) and Dynamite Packrat (costs 1 Stone) are there to spend it. Stone counts 2 points to Lumber's 1 in the game's resource worth, so Quarry's 1 : 1 is a profit, which is why a card with it pays 2.5 budget points. The alternative you sketched, "at round end spend 2 Lumber -> 1 Stone", is a new skill (a small engine change) and a loss in points; worth it only if Stone should be scarce.
  - Quarry 1 : 1, as built
  - A 2 Lumber -> 1 Stone round-end converter (new skill)
  - Just Stone+ (gatherers only, no converter)
- **Default:** Quarry 1 : 1, as built
- **Outcome:** Owner, 2026-10-25 17:53: "CONTENT2: Yes, but we can reuse lumber gatherers. ... since lumber is such a key mechanic - more lumber mechanics, more draw card mechanics. Same for the rest. OKAY." The proposals and built defaults stand; more lumber and draw mechanics queued (OWN-C6).

**CONTENT2-3. The Gnawed and the Tidefolk: seven new cards, where they come from** · Decide · Cards · asked 2026-10-24
- The lore bible's thin sub-factions (the Gnawed had no cards, the Tidefolk 3), built from its lines (Gnawed: rats and shrews, the Sable Swampmire and the Glass Dunes, Devour / Sap / Pack; Tidefolk: otters who never came ashore, eels, seals, Coral Current and the Kelp Mangroves, Tide / Wave / Fork), priced by the formula, placeholder art (the emoji; prompts in docs/art/content2-2026-10-24-briefs.md), awaiting a source. Proposed: Bog Shrew (Common 3/4, Sap) and Mire Rat (Common 3/8, Pack 2) in the Sable Swampmire's Pack 1 pool (Map 6); Hollow-belly Rat (Uncommon 2/10, Devour +2/+2) in the Glass Dunes' Pack 3 pool (Map 18); Gnawed Matriarch (Rare 4/15, Pack 2 + Pack Leader) a Glass Dunes skirmish reward; Kelpborn Otter (Common 2/5, Tide) in the Kelp Mangroves' Pack 2 pool (Map 9); Conger Eel (Uncommon 3/6, Tide + Fork) in Coral Current's Pack 2 pool (Map 10); Selkie Wavebinder (Rare 3/13, Tide + Wave) a Coral Current skirmish reward or the faction pool's shared side. Note: Pack and Pack Leader are priced 0 by measurement (skill-costs.json), so the two Pack cards carry full stats.
  - Place them as proposed
  - Other sources (say which)
  - Hold them for the sub-faction packs
- **Default:** Place them as proposed
- **Outcome:** Owner, 2026-10-25 17:53: "CONTENT2: Yes, but we can reuse lumber gatherers. ... since lumber is such a key mechanic - more lumber mechanics, more draw card mechanics. Same for the rest. OKAY." The proposals and built defaults stand; more lumber and draw mechanics queued (OWN-C6).

**CONTENT2-4. Unlocks on uncharted maps: keep them there or pull them onto Maps 21-24?** · Decide · Progression · asked 2026-10-24
- The map pools stop at Map 24. These unlocks sit on maps that don't exist yet and show "Unlocks beyond the charted maps": Forge tier 4 (Dragonfire, Lv 9, Legendary tempering) at Map 26 and tier 5 (Heartfire, Lv 10, Ancient) at Map 31, with the Lv 9 / 10 gates; Strange Materia x2 from Map 25's boss and x3 from Map 30's; Nests 6 and 7 at Maps 25 and 30; dungeon slot 3 at Map 40 (and, same kind, deck slots 6 / 7 at Maps 27 / 33, the Flea Market at 31, the 4x / 5x speeds at 40 / 60). Not moved, because each sits on a rule of yours: a nest every 5 maps (10-16); each Forge tier on the map its old level gate used, its Strange Materia from the boss of the map before; and Lv 9 / 10 on Maps 22 / 24 would let a grinding player sit 4-5 levels over BAL2's enemy schedule (Lv 5 at Map 20, Lv 6 at Map 30), while the Legendary / Ancient tempering they open has no road card before Map 40. Dungeon slot 3 has no dungeon to open. N22-1 (queued) charts Maps 21-40, and they open where they are. If you want them reachable now, the proposal: Forge tier 4 and Lv 9 at Map 22 (the Rimefire Caldera: dragonfire), Strange Materia x2 from Map 21's ender; tier 5 and Lv 10 at Map 24 (Goldfeather Keep, the last charted map), x3 from Map 23's ender (Marshal Tuskwell); Nests 6 / 7 at Maps 22 / 24; dungeon slot 3 stays until a third dungeon exists.
  - Keep them where they are (nothing moved)
  - Move them as proposed (Maps 21-24)
  - Move only the nests and Strange Materia
- **Default:** Keep them where they are (nothing moved)
- **Outcome:** Owner, 2026-10-25 17:53: "CONTENT2: Yes, but we can reuse lumber gatherers. ... since lumber is such a key mechanic - more lumber mechanics, more draw card mechanics. Same for the rest. OKAY." The proposals and built defaults stand; more lumber and draw mechanics queued (OWN-C6).

**CONTENT2-5. Earthworm, the starter fish, Meadow Frog and the Traveller lost their skills in a fold, not on purpose** · Decide · Cards · asked 2026-10-24
- The 10-16 list ("Earthworm has lost its Regen; Silver Minnow, Pond Trout and River Carp need Tide; Meadow Frog should be Rainrunner; the Wandering Traveller lost its Lumber trigger"). Git: the skills were there until 2026-10-15 (Earthworm Regen 1; the three fish and Meadow Frog Swimmer, the old Tide; the Traveller On Play draw 1 and a once-only On Ready +1 Lumber). The 10-15 fold of your 60 published card edits (005f3ce8) brought them in empty, as that era's editor saved them; a branch that still had them was merged over by the fold (13fab486), and no later package restored them or recorded a reason (CHANGELOG has none). Meadow Frog never had Rainrunner (the skill came later). Nothing changed here. Today they are vanilla starters / Map 1 cards, which matches the plain-rewards rule for Maps 0-1 (PLAIN_REWARDS_UPTO_MAP) but not the 10-16 list.
  - Keep them vanilla
  - Restore the 10-16 list (re-fit by the formula)
  - Restore some (say which)
- **Default:** Keep them vanilla
- **Outcome:** Owner, 2026-10-25 17:53: "CONTENT2: Yes, but we can reuse lumber gatherers. ... since lumber is such a key mechanic - more lumber mechanics, more draw card mechanics. Same for the rest. OKAY." The proposals and built defaults stand; more lumber and draw mechanics queued (OWN-C6).

**CONTENT2-6. Sunken Hollow's fight names still promise whales and a kraken** · Decide · Maps · asked 2026-10-24
- N21-2 (cute Maps 0-5): the theme pass took the Kraken Spawnling, Humpback and every whale out of Maps 1-4, so Map 4's decks are turtles, voles, muskrats and an old sturgeon, but its fights are still called Reef Skirmishers, Cetacean Pod ("They surface in formation") and The Kraken's Maw. Proposal (not built; the names are translated texts): 4-3 Cetacean Pod -> Turtle Pod, 4-4 The Kraken's Maw -> The Snapping Deep. The boss, The Drowned Colossus ("Every spawnling in the Hollow answers to one, much older, shape"), already fits its Old Sturgeon.
  - Rename as proposed
  - Other names (say which)
  - Keep the names
- **Default:** Rename as proposed
- **Outcome:** Owner, 2026-10-25 17:53: "CONTENT2: Yes, but we can reuse lumber gatherers. ... since lumber is such a key mechanic - more lumber mechanics, more draw card mechanics. Same for the rest. OKAY." The proposals and built defaults stand; more lumber and draw mechanics queued (OWN-C6).

**H1-a. Taking a gem out of a socket: does the gem come back?** · Decide · Forge · asked 2026-10-24
- Your H1 ("Maybe all uniques and above are also liable for materia (gem) socketing - but only 1. Costs to apply, costs to remove."), built as the Forge's 💎 Socket tab (it replaces Enchant): every copy of a Unique or rarer creature has one gem socket. Setting a Materia gem costs Dust + Maple Leaves and one crystal; taking it out costs Dust + Maple Leaves. Built: the gem comes back to your Materia when you take it out (the friendlier default; one switch, SOCKET_REMOVE_RETURNS, to make it break instead). Keep it, or should taking it out destroy the gem?
  - The gem comes back (built)
  - The gem breaks when taken out
- **Default:** The gem comes back (built)
- **Outcome:** Owner, 2026-10-25 17:53: "H1 - just do assumptions for now. Yes gem comes back after taking it out." Plus GEM fusion and a Socket N skill (OWN-E14).

**H1-b. Gem socket prices (placeholders)** · Decide · Forge · asked 2026-10-24
- Placeholder prices per rank, in canonical/upgrade-costs.json materiaSocket and the hub's 💰 Upgrade costs tab (group Gem sockets): set a gem / take it out, Dust · Maple Leaves: Unique 150 · 300 / 100 · 200; Legendary 250 · 500 / 150 · 300; Mythic 400 · 800 / 250 · 500; Ancient 600 · 1,200 / 350 · 700; Divine 900 · 1,800 / 500 · 1,000; Void 1,200 · 2,400 / 700 · 1,400; Daemonic 1,600 · 3,200 / 900 · 1,800 (a crystal itself is 125 Dust at the bench). Edit them in the hub tab, or say the rule you want (for example a share of the card's level road).
  - Keep the placeholders
  - Edit in the hub tab
  - Another rule (say which)
- **Default:** Keep the placeholders
- **Outcome:** Owner, 2026-10-25 17:53: "just do assumptions for now." Placeholders kept.

**H1-c. Which cards have a socket, and Heroes** · Decide · Forge · asked 2026-10-24
- Built: creatures only (Materia, equipment and spell cards have none), of rank Unique and above; a flagged rarity counts as its rank (Quest-Unique as Unique, Dev-Legendary and Event-Legendary as Legendary, Dev-Ancient as Ancient). Your Hero card has no socket yet (the 10-06 Hero socketing plan is separate). The gem effects are the old Enchant ones, unchanged: Ember +1 Attack (its hits scorch), Tide +2 Health, Grove +1/+1, Stone +3 Health; a gem is a progression bonus outside the card's printed budget. OK, or should Heroes (or equipment) get a socket too?
  - OK
  - Heroes get a socket too
  - Change (say what)
- **Default:** OK
- **Outcome:** Owner, 2026-10-25 17:53: "just do assumptions for now." As built.

**BAL3-1. Rising Tide can't fire on 5-A-2 and 10-A-2: no tide there** · Decide · Map effects · asked 2026-10-24
- DF3-3 built (Quick and +1 Attack while the tide is in). Re-measured, 200 games with the boon on and off (docs/balance/bal3-rising-tide-2026-10-24.json): 9-4 Kelp Curtains 3 points (81% vs 84%); 5-A-2 Gator Hollow and 10-A-2 The Drowned Deck 0, because neither fight has a tide in its field (the Sunken Grove's Swamp Fever, the Sunken Depths' Crushing Depths), so the boon never turns on. A what-if with the Tide added: 5-A-2 79.5% (94% without the boon: 14.5 points), 10-A-2 77.5% (81.5%: 4 points). Their challenge targets are about 65% and 70%.
  - Add the Tide to both fights
  - Swap their boons (Venom Glands on 5-A-2, Blind Fury on 10-A-2)
  - Leave them
- **Default:** Add the Tide to both fights
- **Outcome:** Owner, 2026-10-25 23:58: "Fix." Add the Tide to 5-A-2 and 10-A-2 so Rising Tide can fire.

**BAL3-2. The fights deck moves can't reach (87 too easy, 12 too hard of 179)** · Decide · Balance · asked 2026-10-24
- BAL3 retuned Maps 0-24 and the Pale Desert by the agreed rules only (deck moves inside each map's pool and theme, the copy ladder, 5-7 different cards, leaders kept, enemy level by the schedule, no new Shield): green 48 -> 80 of 179 (docs/balance/bal3-road-2026-10-24.json, -table-....md), the Pale Desert 0 -> 4 of 9. What is left is outside the levers: Gannet Cliffs (Map 3), Gatorback Swamp (5), the Redwood Deep (13), the Glass Dunes (18, every fight 100%), the Goldfeather Siege (23) and five Pale Desert fights stay at 90-100% because no card of their pool makes the deck harder; Sunken Hollow's 4-1 / 4-2 stay at about 20% (target 80-90) because the reference deck there walls on its turtles. The schedule's whole levels can't fine-tune a fight either (DF3-4's five fights were done by decks: 11-4 67 -> 76% green; 11-2 75, 11-7 57, 14-5 60, 14-6 52 still under).
  - Wait for your play-through (DF-1b)
  - Let those fights take themed cards from one map ahead (outside the map's pool)
  - Allow a Shield over the rule on those fights only
- **Default:** Wait for your play-through (DF-1b)
- **Outcome:** Owner, 2026-10-25 17:53: "Noted ill try." Waits for the owner's play-through.

**BAL3-3. Alley Cat and Rock-pool Starfish are 1/1 on their formula line** · Decide · Cards · asked 2026-10-24
- BAL2-5 built: the ten held cards took their formula line (tools/refit_pass_2026_10_21.js). Two land on 1/1 with a third of their budget unused, because their skills cost more than any bigger line of their shape allows: Alley Cat (Rare, Bleed 1 + Twin Strike, 1/8 -> 1/1, 67% of N) and Rock-pool Starfish (Common, Regen 2 + Tide, 2/2 -> 1/1, 66%). The others: Honey Badger Fury 1/6, Chipmunk Hoarder 2/6, Chipmunk Cavalry 2/2, Pyroclast Wyrm 3/12, Plague Gnat Cloud 2/2, Sunfeather Scout 1/4, Lone Grey Wolf 2/9, Muskrat Lodgekeeper 1/5.
  - Keep the formula lines (built)
  - Trim a skill on those two so they fit a bigger line (Alley Cat without Twin Strike, the Starfish Regen 1)
- **Default:** Keep the formula lines (built)
- **Outcome:** Owner, 2026-10-25 17:53: "Noted." Formula lines kept.

**EN7-1. Dive in two turns: what it is safe from while aloft or under** · Decide · Battle rules · asked 2026-10-24
- Your 13:12 #3 ("like pokemon"), built: once a fight, at its swing, a diver with an enemy unit in its row rises (a Flyer; a Sprinter leaps the same way) or goes under (a Tide unit without wings) instead of swinging. Until its next swing nothing can find or hit it (swings, shots, bolts, skills aimed at a unit; a Spotter neither) and it can't step in as a Guardian. Its next swing strikes the weakest enemy of its row past Taunt (a Guardian beside the target still steps in) for Attack + N, and it is Exposed that round (no Flying dodge, no Tide evade). Area damage that names no target (a field's hail, a Nova, the tide-spout) and its own Poison / Bleed ticks still reach it, as in the games you described (Earthquake hits Dig in some, not Fly). A diver that can't strike in the next round (frozen, stunned) comes down at that round's end without striking. Keep area damage reaching it, or make it safe from everything?
  - Area damage still reaches it (built)
  - Safe from everything while aloft / under
- **Default:** Area damage still reaches it (built)
- **Outcome:** Owner, 2026-10-25 17:53: "don't build this first." Kept as built (area damage still reaches a diver); no further work now.

**EN7-2. Parasite x Bloom with no free enemy beside the host** · Decide · Battle rules · asked 2026-10-24
- Your 13:12 #2: a Parasite with Bloom puts its bloom copy (+1/+1, its printed Wait) onto an enemy unit beside its host (left, right, in front, behind) that has no parasite; not a Structure or a cage; several: one at random. A Parasite played as a plain unit hooks its copy onto an enemy facing it or one column beside that. With no such unit, built: it waits and tries again each round (as Bloom waits for a free slot, BL-2). Or: no copy at all that fight?
  - It waits (built)
  - No copy that fight
- **Default:** It waits (built)
- **Outcome:** Owner, 2026-10-25 17:53: "Then it fails - it gets the +1/+1 instead. it visible tries to do the meiosis animation of splitting but turns slightly reddish then fails, getting the bonus instead. Bloom can only start 'testing' when the unit is ready." Queued: OWN-E6.

**EN7-3. Poison / Bleed on extra hits, and "– poison" shots** · Decide · Battle rules · asked 2026-10-24
- Your 13:12 #5 ("common sense, not too overpowered"), built: a unit's Poison N / Bleed N (with Rabid, Greater Poison, Hemorrhage, Venom Master) ride on every landed hit of its own attack damage: the swing, Frenzy's and Twin Strike's swings, Fork / Trident / Pitchfork prongs and Octolash lashes (these already did), and now Pounce and Ambush (which did not). Cleave's side damage is a spread of the swing (an area, as for Guardian): it carries none. A shot or action (Arrow, Fire Arrow, a Bolt, Missile, Deal damage, Volley, Snipe ...) carries none, unless the card says "– poison" / "– bleed" on it (card text "Arrow 2 – poison"; a box on the Arrow, Missile and Deal damage actions in the card editor, as "– bramble"); it then gives the unit's own N, at least 1. Prices (4-round rule): Pounce / Ambush on a Poison or Bleed card pay 0.33 / 0.3 x the status's price on top (no card has both today); "– poison" on a shot 0.9 x Poison's price at that N (Arrow 2 – poison on a plain unit: +2.7). OK?
  - OK
  - Change (say what)
- **Default:** OK
- **Outcome:** Owner, 2026-10-25 17:53: "Cleave and related DOES spread the status. I think arrow is okay. price = your decision." Queued: OWN-E7.

**EN7-4. The two Dive cards** · Decide · Cards · asked 2026-10-24
- Dive is re-priced for the two-turn rule by the 4-round logic: 0.75 + 0.5 N (the lost swing -1.5, a round out of reach +2, the pick +0.5, the exposure -0.25), fitted 1.25 x N^0.5 (Dive 1 1.25, Dive 2 1.77; was 0.75 a point). Given to two cards already placed: Puffin Diver (common, Flying + Tide, Map 3's 3-2 reward): Dive 2, 2/6 -> 2/5 (it goes aloft); Harbor Seal (common, Tide + Evasive, a pack card on the frost coast): Dive 2, 1/10 -> 1/9 (it goes under). No gannet or osprey card exists (The Gannet Queen is a heroic with Pounce 2; Dive would fit her too). Keep these two, add the Gannet Queen, or pick others?
  - Keep the two
  - Add the Gannet Queen
  - Pick others (say which)
- **Default:** Keep the two
- **Outcome:** Owner, 2026-10-25 17:53: "Same as the other dive question. I think 'quick' creatures can dive as well - temporarily removing their quick." Queued: OWN-E8.

**EN6-1. Hoard is taken: the hand-count skills are Full Hand N and Lean N** · Decide · Skills · asked 2026-10-24
- Your 03:17 #1 (all approved at 12:02 #11): +N Attack per card in hand / per empty hand slot, and the foe-counting pair. "Hoard" already names the Lumber skill (+1 Attack per 2 Lumber, on the Magnate Duck), so the built names are Full Hand N, Lean N, Foe's Full Hand N and Foe's Lean N. Keep these names or rename?
  - Keep Full Hand / Lean
  - Rename (say the names)
- **Outcome:** Owner, 2026-10-25 17:53: "6-1 OKAY"

**EN6-2. The new state skills' prices: default x uptime (the 4-round rule)** · Decide · Balance · asked 2026-10-24
- Priced by logic, no robust skill test (docs/balance/en6-state-uptime-2026-10-24.json, 1500 CPU fights for the hand; every conquest fight's rules x 6 fights for the field). Plain prices: Plenty +1/+1 x 0.15 = 0.45, Scarcity +1/+0 x 0.79 = 1.58, Foe's Plenty +0/+2 x 0.05 = 0.1, Foe's Scarcity +1/+0 x 0.77 = 1.54, Heat +1/+0 x 0.6 = 1.2, Frost +0/+2 x 0.56 = 1.12, Rain +1/+1 x 0.05 = 0.15, Storm +2/+0 x 0.45 = 1.8, Fog {Evasive} 2.7, Salt Armor 1 x 0.25 = 0.38, Drought +1/+0 x 0.5 = 1.0, Season +1/+1 x 0.25 = 0.75; their braces cost the same uptime x what is in them. The field states take the midpoint of their uptime over all fights and over their home maps (a card made for the volcano plays about half its fights there): Heat 0.21 / 1.0, Frost 0.11 / 1.0, Storm 0.14 / 0.76, Drought 0.26 / 0.75, Salt 0.04 / 0.45, Fog 0.04 / 1.0, Rain 0.017 / 0.08. Full Hand 3.0 a point, Lean 7.5, Foe's Full Hand 2.4, Foe's Lean 7.5 (the hand averages 1.2 cards and 3.8 empty slots as combat starts). Hibernate N 0.95 a point, and its Attack counts only for the rounds it is awake (x 0.53). – bramble x0.9 of the shot or action. OK, or measure some with the robust skill test?
  - OK
  - Measure (say which)
- **Outcome:** Owner, 2026-10-25 17:53: "6-2: OKAY"

**EN6-3. Plenty and Foe's Plenty are almost never on against the CPU** · Decide · Skills · asked 2026-10-24
- As combat starts the CPU holds 0 cards 6% of the time, 1 card 73%, 2 cards 20%, 3+ 1.5% (it plays a card a turn and draws one), and so does a player who plays every turn. So Scarcity (1 or fewer) is on 79% of the time and Plenty (4+) only for a player who holds cards back; Foe's Plenty almost never against the CPU. Built as proposed (4+ / 1 or fewer). Lower Plenty to 3+ (or 2+), or keep?
  - Keep 4+ / 1 or fewer
  - Plenty at 3+
  - Plenty at 2+, Scarcity at 0
- **Outcome:** Owner, 2026-10-25 17:53: "if the deck has low lumber cost cards, they shouldn't be rapidly pitching. Maybe in the CPU's mind they should care about having a certain lumber amount they aspire to as they start the game (e.g. 2.1 or 1.1 etc)" Plenty kept at 4+; the CPU reserve goes into OWN-A2.

**EN6-4. Seasons: which maps run the cycle?** · Decide · Map effects · asked 2026-10-24
- Built as a field option (rules.seasons, in Edit skirmish; off by default and on no map): Spring, Summer, Autumn, Winter, 3 rounds each (a typical 12-round fight sees one year; 4 rounds left Winter at 14%), a log line and a float as the season turns. Summer counts as hot (Heat, not Hibernate), Winter as cold (Frost, Hibernate). Season (X) – {…} is in the editor and the Codex but on no card: with no map running the cycle it would never turn on. Which maps (or fights) get Seasons? Then a card gets Season (Winter) – {…}.
  - Name the maps
  - Leave off for now
- **Outcome:** Owner, 2026-10-25 17:53: "Seasons should be 6 turns each. (since there are day/night)" Queued: OWN-E12.

**EN6-5. Full Hand / Lean: no card yet** · Decide · Balance · asked 2026-10-24
- At 3.0 (Full Hand) and 7.5 (Lean) a point, the commons that fit lose a quarter to a third of their stats (Dormouse 2/8 -> 1/6, Chipmunk Stockpiler 1/9 -> 1/6), so none was given one. Lean 1 is about +3.8 Attack on average. Give them to a rare or higher (say which), make them halve (+N per 2 cards), or leave them in the editor only?
  - Leave in the editor
  - Per 2 cards
  - Give to a card (say which)
- **Outcome:** Owner, 2026-10-25 17:53: "6-5 OKAY" Left in the editor.

**EN6-6. Beaver Lumberjack: On Ready, 1 Lumber (once) or every round?** · Decide · Cards · asked 2026-10-24
- Your 12:02 #5: "That lumberjack should have something like On Ready, 1 lumber instead." Built literally: Bounty 2 off, the On Ready trigger (once, when its Wait first runs out) with Gain 1 Lumber, priced 0.9; it stays 4/4 (Bounty 2 was 5.0). The every-round Lumber income (On Ready gold, the Lodge Engineer's "1 Lumber each Ready round", 6.24) would cut it to 2/2. Keep once, or every round?
  - Once (as built)
  - Every round (2/2)
- **Outcome:** Owner, 2026-10-25 17:53: "On ready. I feel like on ready is a classic. We need a named skill for this" Once, as built; a named skill for "On Ready: gain 1 Lumber" queued (OWN-E13).

**EN6-7. Bounty keep list: the Chipmunk Stockpiler** · Decide · Cards · asked 2026-10-24
- Your 12:02 #5: Bounty only where it makes sense. Removed from the Beaver Lumberjack. Kept: Raccoon Bandit, Raccoon Warlord, Trash Panda Trickster (raccoons with their loot), Riverside Peddler (a merchant), Pack Mule (carries goods), The Magnate Duck (treasure), and the Chipmunk Stockpiler (cheeks packed with a stockpile: loot to take). No magpie or mimic has Bounty. Keep the Chipmunk's Bounty?
  - Keep
  - Remove (it re-fits up)
- **Outcome:** Owner, 2026-10-25 17:53: "6-7 OKAY" Kept.

**EN6-8. Hibernate as built** · Decide · Battle rules · asked 2026-10-24
- Your 03:17 #4 ("hibernate?"): Hibernate N (plain 2) sleeps while the field is cold (Frigid, Hail, Freezing, the map's frost, Winter) or at night on a cold map (tundra, frostfire): it can't attack, shoot or fire triggers, its Taunt and Guardian are off (it can't step in or draw swings), it still blocks its column and can be hit; a hit does not wake it, its Wait does not tick, and it heals N at each round's start. It wakes when the cold ends. On the Polar Bear (Map 6, the tundra). OK?
  - OK
  - Change (say what)
- **Outcome:** Owner, 2026-10-25 17:53: "6-8 OKY" Kept.

**EN6-9. Salt and Rain are rare on the maps** · Decide · Map effects · asked 2026-10-24
- Salt (a beach or reef map while the tide is out) holds 4% of all fights' unit-rounds: those maps run the tide only in their boss and elite fights (High Tide). Rain holds 1.7%: Spring Rain is on no map; only the two Thunderstorm fights and Rainmaker cards bring it. Their cards (Horseshoe Crab, Puddle Hopper) are priced for that (0.38, 0.15). Give some beach / reef skirmishes the Tide, and some maps Spring Rain?
  - Leave
  - Add the Tide / Rain (say where)
- **Outcome:** Owner, 2026-10-25 17:53: "6-9 OKAY. maybe the lotus petal map can have eternal rain." Queued: OWN-C5.

**DF3-1. How hard is a challenge skirmish?** · Decide · Map effects · asked 2026-10-24
- Your 22:23 #6 put the selfish boons on challenge skirmishes only (built in DF3: 19 of them, 1 every 2 maps from Map 5 and 1 a side map). A challenge skirmish keeps its place on the road but is aimed 10 points under that place's road-curve target (a 78% skirmish slot becomes 68%), with a band of +/- 8. It pays what it paid before (a ⚔️ Challenge pill in the fight panel, nothing more).
  - Target minus 10, same rewards (built)
  - Target minus 15 (nearer an elite)
  - Target minus 10 and a better first-clear reward (your T-3 note: challenges give more)
  - Their road-curve target as is (the boon replaces part of the deck's strength)
- **Default:** Target minus 10, same rewards (built)
- **Outcome:** Owner, 2026-10-24 12:02: "By default yes." Defaults applied (queued where a build is needed).

**DF3-2. A challenge skirmish may go one Enemy level up** · Decide · Levels · asked 2026-10-24
- Where a challenge deck could not reach its target inside the deck rules, the search could raise the fight's Enemy level by one (the skirmish editor's field, as LEAD set on elites). It used it once: 13-4 Boar Wallow (Lv 3 -> 4). Maps 16-24's challenges stay at 96-100% even so: the reference player is about Lv 8 there against enemies at Lv 3-5 (your DF-1b).
  - One level up where needed (built: 13-4 only)
  - No level change on challenges
  - Up to the pace curve's level on challenges from Map 16 (decide with DF-1b)
- **Default:** One level up where needed (built: 13-4 only)
- **Outcome:** Owner, 2026-10-24 12:02: "By default yes." Defaults applied (queued where a build is needed).

**DF3-3. Rising Tide barely matters; keep it, strengthen it or swap it?** · Decide · Map effects · asked 2026-10-24
- Measured with and without each boon (200 games, docs/balance/df3-boons-2026-10-24.json): Sky Ambush 28 points (8-A-3), Blind Fury 27 (8-5), Hive Chorus 23 (7-A-2), Venom Glands 16.5 (5-3), Snow Veil 8 (17-A-1), Second Burrow 3.5, Ember-born 1-3. Rising Tide is 0 on all three of its fights (9-4, 5-A-2, 10-A-2): the CPU's Tide units are on the board in few rounds. Its engine test shows it working (Quick at Flood).
  - Keep it (a light boon for the tidal maps)
  - Strengthen it: Quick and +1 Attack at Flood
  - Swap those three fights to Venom Glands / Blind Fury
- **Default:** Strengthen it: Quick and +1 Attack at Flood
- **Outcome:** Owner, 2026-10-24 12:02: "By default yes." Defaults applied (queued where a build is needed).

**DF3-4. DF-4 leftovers: five Map 11 / 14 fights still under their band** · Decide · Balance · asked 2026-10-24
- DF-4 retuned Maps 7, 11 and 14 with deck moves only (leaders kept): map means 51.2 -> 67.8 (target 69.2), 42.9 -> 68.4 (71.5), 58.0 -> 66.9 (70.6). Still under their band at 100 games: 11-2 75 (86), 11-4 66 (79), 11-7 59 (68), 14-5 60 (70), 14-6 52 (65). 14-5's next move would give an elite a 9th different card, so it was not taken.
  - Lower those five fights' Enemy level a quarter to a half step
  - Another deck pass, allowing an 8th card on elites
  - Leave them (the map means are within 4 points)
- **Default:** Lower those five fights' Enemy level a quarter to a half step
- **Outcome:** Owner, 2026-10-24 12:02: "By default yes." Defaults applied (queued where a build is needed).

**BAL2-1. LEAD's per-fight Enemy levels hold some elites under their map's declared level** · Decide · Levels · asked 2026-10-24
- The new schedule introduces each level in the hardest fights of its map (Lv 5 at Map 20 in its boss and two elites). 57 elites and bosses carry a skirmish-editor Enemy level that LEAD set on 10-23 to hold the battle rating when a leader was added. BAL2 re-based them on the new schedule keeping their STRENGTH (stats only move at Lv 4, 7 and 10), so 42 moved and some still show a level under the declared one: 20-6 3.25, 20-8 3.0, the Map 20 world boss 3.15, 21-4/21-5, 22-6/22-7 3.2-3.45, 23-8 3.35, 24-8 3.3. Dropping them puts those fights at the declared level (Lv 5 from Map 20), about 20% more stats on the ones under Lv 4, and harder.
  - Keep the re-based levels (built)
  - Drop LEAD's Enemy levels from Map 15 on (the declared levels everywhere)
  - Drop them all
- **Default:** Keep the re-based levels (built)
- **Outcome:** Owner, 2026-10-24 12:02: "use our agreed philosophy and schedule, not my balancing." The hand-set LEAD levels give way to the schedule (queued, BAL3).

**BAL2-2. Rares in side-map skirmishes before Map 10** · Decide · Rarity · asked 2026-10-24
- Your 22:23 #2 is built for the main road: Map 5's only Rare is its boss's leader; normal skirmishes hold Rares from Map 10 (gently: no Very Rare in one before Map 15). Side maps keep the older steps (Rare from Map 5, Very Rare from 10), so the Smugglers' Grotto (2-B-1, 3 Mallard Marauders), the Mycelium Deep (7-A-1, 7-A-2) and the Glimmer Depths (8-A-3) still field Rares in normal skirmishes. They are come-back-later fights counted a map ahead.
  - Side maps keep the older steps (built)
  - The same rule on side maps (re-deck about 6 skirmishes)
- **Default:** Side maps keep the older steps (built)
- **Outcome:** Owner, 2026-10-24 12:02: "use our agreed philosophy" — side maps follow the Rare-from-Map-10 rule too (queued, BAL3).

**BAL2-3. The road win rates after BAL2 (Maps 0-24): retune pass?** · Decide · Balance · asked 2026-10-24
- Measured after BAL2 (tools/skirmish_pass.js measure 100 --main, and the same tool on the commit before it; docs/balance/bal2-road-2026-10-24.md): 31 of 179 fights of Maps 0-24 are in their green band (29 before BAL2), 114 too easy, 34 too hard. Most of the gap is from before BAL2. Gannet Cliffs, Gatorback Swamp, the Long Grass, the Glass Dunes and the Goldfeather Siege sit at 94-100%; Pebble Beach, Sunken Hollow, the Morel Hollow and Eyrie Heights are well under target. The Pale Desert is 94-100% on every fight (its reference deck is Map 19's since it counts as Map 19), 18-A-5 retuned to 82.5% (band 65-81%).
  - A retune pass of Maps 0-24 to the road targets with the honest levers (decks, fields, Shield), as DF-4 / DF-1b
  - Wait for your play-through (DF-1b)
- **Default:** Wait for your play-through (DF-1b)
- **Outcome:** Owner, 2026-10-24 12:02: "BAL Basic logic return ... use our agreed philosophy and schedule, not my balancing." Retune Maps 0-24 and the Pale Desert now by the road curve (queued, BAL3).

**BAL2-4. Bounty 2 and up measure less than Bounty 1** · Decide · Skills · asked 2026-10-24
- N22-10's re-measure (docs/balance/skill-test-robust-bounty-2026-10-24.md, randomised Lumber / Wait units, 10,000 games a setup): Bounty 1 worth 3.35 stat points, Bounty 2 2.48, Bounty 3 1.91 (the foe gains N when it dies, which outweighs your bigger gain). Bounty is now 2.5 a point (was 3; Bounty 1 measures 2.56), and four Bounty 1 cards rose a point (Raccoon Bandit 4/8, Trash Panda Trickster 2/4, Pack Mule 1/11, Magnate Duck 2/37). A per-point price can't show the fall, so the one Bounty 2 card, the Beaver Lumberjack (4/4), is over-priced; it is held as it is.
  - Make the Beaver Lumberjack Bounty 1 and re-fit it
  - Price Bounty flat (2.5 whatever N)
  - Keep it as it is
- **Default:** Make the Beaver Lumberjack Bounty 1 and re-fit it
- **Outcome:** Owner, 2026-10-24 12:02: "Ill take away bounty from creatures that dont make sense such as Beaver. That lumberjack should have something like On Ready, 1 lumber instead." (queued, EN6: Bounty only where thematic).

**BAL2-5. Ten cards the DF-1 re-fit would cut by more than 25%** · Decide · Balance · asked 2026-10-24
- Held at their stats (owner brief: hold extreme down-moves): Alley Cat 1/8 (line 1/1), Honey Badger Fury 2/9 (1/6), Chipmunk Hoarder 3/8 (2/6), Chipmunk Cavalry 3/3 (2/2), Pyroclast Wyrm 5/17 (3/12), Plague Gnat Cloud 3/3 (2/2), Sunfeather Scout 1/7 (1/4), Lone Grey Wolf 4/15 (2/9), Rock-pool Starfish 2/2 (1/1), Muskrat Lodgekeeper 2/10 (1/5). Most were over before (their map did not move); the Map 5 / Map 2 Pack 1 cards lost their map term (Pack 1 counts as Map 0).
  - Re-price their skills or re-rank them (one by one)
  - Cut them to the line
  - Keep them held
- **Default:** Re-price their skills or re-rank them (one by one)
- **Outcome:** Owner, 2026-10-24 12:02: "Basic logic return": the 10 held cards take their formula stats (queued, BAL3).

**TT-1. Where replayable lessons live** · Decide · Tutorial · asked 2026-10-24
- There is no help page where lessons can be replayed (the Codex has Browse, Brambles, Skills, Maps and Hall of Fame; the older lessons are one-shot dialogues and coach tips). TT put one small "Triggers lesson" button in the Skill Codex's bar: it clears the lesson, so it plays again in the next fight that shows a trigger chip (a lesson needs a real card to point at). The Skill Codex opens on Map 9, so a player who skips the lesson early cannot replay it until then. A Lessons shelf (Triggers, Pitching, Leaders, Rarity) on a Codex tab or in Settings would reach everyone sooner.
  - Keep the button in the Skill Codex (built)
  - A Lessons shelf in Settings, every lesson replayable
  - A Lessons tab in the Codex, open from the start
- **Default:** Keep the button in the Skill Codex (built)
- **Outcome:** Owner, 2026-10-24 12:02: "NE OKAY"/"EN OKAY" batch: as built (Skill Codex button).

**NE-1. Nurse swap: only what you set afterwards, or the time left too?** · Decide · Economy · asked 2026-10-24
- Owner 13:16 #26: changing the Nurse must not retroactively change an egg's remaining time. In the code an egg's, baby's or training card's hatch time is fixed when it is set in a nest (the Nurse's speed at that moment); a swap only speeds what you set afterwards. A test confirms a swap leaves an egg already warming at its time (tests/ne-2026-10-24.js, tests/e2e/ne_2026_10_24.py), and the Nest now says so under the Nurse. I could not reproduce a retroactive change. The other rule would be: the new Nurse's speed applies to the time still left of everything already growing.
  - Only what you set afterwards (as built)
  - The new speed applies to the time left too
- **Default:** Only what you set afterwards (as built)
- **Outcome:** Owner, 2026-10-24 12:02: "NE OKAY" (as built / default).

**NE-2. Filters reset on every visit: the sort and the view too?** · Decide · UI · asked 2026-10-24
- Owner 19:27: "reset all filters when i visit the codex ... (Same for the other pages)". Built: entering any page (or a Codex / Play sub-tab) clears every filter (types, animal, phylum, rarity, archetype, skills, the Codex kind row, the Camp pool's kind and level, the Forge's chip and deck scope, the Brambles' filters, the Flea Market's rarity) and the search box. The sort, its direction and the view (album / compressed / full art, group by) are kept, since they are not filters. Say if those should reset too.
  - Keep the sort and view (as built)
  - Reset the sort and view too
- **Default:** Keep the sort and view (as built)
- **Outcome:** Owner, 2026-10-24 12:02: "NE OKAY" (as built / default).

**NE-3. The Camp's copy fan (coordinator's proposal, built)** · Decide · UI · asked 2026-10-24
- Owner 11:15 asked how to handle copies of different levels and treatments. Built as proposed: one stacked tile per card; a click adds your best copy not in the deck (highest level first); hovering (desktop) or a long press (phone) fans out every copy you own (level, foil / Shiny / alt art), the fan stays open while the pointer is over it, and clicking a fanned copy puts exactly that copy in (the deck remembers it and fights it at its own level); copies already in the deck show greyed with a tick. The separate Shiny / alt-art / finish stacks and the 'Finishes stacked / apart' toggle went. Object if you want something else.
  - Keep the fan
  - Change it
- **Default:** Keep the fan
- **Outcome:** Owner, 2026-10-24 12:02: "NE OKAY" (as built / default).

**EN5-2. Breach and Puncture are the same rule: merge them?** · Decide · Skills · asked 2026-10-24
- Breach N (built, 1.9 a point) deals N to the enemy bramble on every landed melee hit. Puncture N (on 3 cards, priced 0.7 at scale half: 0.7 / 1.4 / 1.4) already does exactly that. The robust skill test read both the same: Breach 1 / 2 worth 1.82 / 3.76, Puncture 1 / 2 1.86 / 3.73 (docs/balance/en5-breach-states-2026-10-24.md), so Puncture is under-priced today. Options: rename Puncture to Breach (one skill, its 3 cards re-fitted at 1.9 a point), keep both but price Puncture like Breach, or leave Puncture as it is.
  - Merge: Puncture becomes Breach
  - Keep both, Puncture priced like Breach
  - Leave Puncture as it is
- **Default:** Merge: Puncture becomes Breach
- **Outcome:** Owner, 2026-10-24 12:02: "EN OKAY" (as built / default).

**EN5-3. Canopy Cover: where the trees are, and its price** · Decide · Skills · asked 2026-10-24
- Built: a ground unit (no Flying; a grounded flyer counts) dodges 1 in 2 single-target attacks, shots and skills, like Evasive (one roll, not on top of Evasive), while the field has trees: any fight on a forest-biome map (Maps 1, 7, 13 and the forest side maps, the first skirmish too), the Old Woods terrain, High Canopy, or the Undergrowth. That is 40 of the 267 conquest fights (15%). Priced as a half-miss skill on the field: Evasive's x1.37 on the stats, times an uptime of 0.4 (a forest card is mostly played on the maps it is won on): x1.15. On the Fawn Scout (Map 13): 2/9 -> 2/7.
  - As built (uptime 0.4)
  - Uptime 0.15 (the share of all fights)
  - Also on jungle / rainforest maps when they come
- **Default:** As built (uptime 0.4)
- **Outcome:** Owner, 2026-10-24 12:02: "EN OKAY" (as built / default).

**EN5-4. The state skills' prices and cards (Timbered, Bedrock, Forged, Last Stand)** · Decide · Skills · asked 2026-10-24
- Stone and Metal are real counts in a fight (pitching a Stone card, Quarry, the Petrified Tree's Stone, the Ore-Smelter Mole's Metal; Stone / Metal costs spend them), so the skills read them directly. Measured how often each state holds (docs/balance/en5-state-uptime-2026-10-24.json, 2000 CPU fights of random live decks): 3+ Lumber 0.9% of unit-rounds (the CPU spends Lumber as it comes), 2+ Stone 0.5% even with 4 Stone makers (one card makes Stone), 1+ Metal 83% with 4 Metal makers, 0.9% without, the bramble at a third or less 10%. Priced by your 4-round rule x the uptime a deck built for it would have: Timbered {+0/+2} 2 x 0.25 = 0.5, Bedrock {Armor 1} 1.5 x 0.2 = 0.3, Forged {+1/+0} 2 x 0.5 = 1.0, Last Stand {+1/+1} 3 x 0.2 = 0.6 (the robust test read plain Last Stand 0.62, Timbered 0.38). Their braces cost the same uptime x the braces. Cards: Lodge Engineer (Timbered), Quarry Mole (Bedrock), Badger Trench Digger (Last Stand); no Forged card (the only Metal maker, the Ore-Smelter Mole, already has two skills and would hold Forged nearly always).
  - As built
  - Higher uptimes (cheaper to fit: fewer stats lost)
  - Give Forged to the Ore-Smelter Mole as a third (thematic) skill
- **Default:** As built
- **Outcome:** Owner, 2026-10-24 12:02: "EN OKAY" (as built / default).

**EN5-5. Bleed and Poison: the measured curve flattens** · Decide · Balance · asked 2026-10-24
- Your BP-1: "price it according to your simulation. Note that bigger numbers make them stronger". tools/skill_test_robust.js --mono --multi, 3000 games a setup, with the units priced at a trial 1 a point so the decks stay off the floor (EN4's 'about 2' for Bleed 2 / Poison 2 came from decks priced at 5.2 that lost 97% of their games). Worth with companions at N 1 / 2 / 3 / 4: Bleed 3.5 / 6.2 / 6.6 / 6.3, Poison 2.9 / 5.7 / 5.9 / 5.4 (docs/balance/en5-bleed-poison-2026-10-24.md). Bigger numbers are stronger in all up to 3, but each point is worth less: the stack outlives the small units it lands on. Priced S(N) = 3.6 x N^0.6 (Bleed) and 3.0 x N^0.7 (Poison), a power curve through N 1-3: Bleed 3.6 / 5.5 / 7.0, Poison 3.0 / 4.9 / 6.5 (was 2.6 / 5.2 / 7.8 for both). So a Bleed 1 or Poison 1 card costs more than before and a Bleed 3+ card less. The actions (Bleed / Poison in triggers) and the family (Gash, Venomous, Rabid ...) are unchanged.
  - As built (the measured power curve)
  - Linear at the measured N 2 (Bleed 3.1, Poison 2.8 a point)
  - Convex as you expected (re-measure on bigger units first)
- **Default:** As built (the measured power curve)
- **Outcome:** Owner, 2026-10-24 12:02: "EN OKAY" (as built / default).

**EN5-6. EN5's re-fit: 28 cards moved, none held** · Decide · Balance · asked 2026-10-24
- tools/en5_cards_2026_10_24.js refit (docs/balance/en5-refit-2026-10-24.json): 5 up (Komodo Warlord 1/26, Venomlord Serpent 1/23, Ice Crevasse Wolf 1/13, Green Dragon 3/22, Yellow-bellied Sea Snake 4/4), 23 down, none cut by more than a quarter (the hold line), so none held. The Bloom cards are balanced as you asked, at most 1% over N: Fungal Colossus 2/21 -> 2/14, Puffball Bombardier 1/10 -> 1/5, Lotus Frog 3/12 -> 3/6, Pond Algae 1/9 -> 1/7 (the copy's chain makes each body count for more). The six new-skill cards: Beetle Battering-Ram 5/12 -> 4/10 (Breach 2), Badger Sapper 3/16 -> 3/15 (Breach 1), Fawn Scout 2/9 -> 2/7 (Canopy Cover), Lodge Engineer 3/13 -> 3/12 (Timbered), Quarry Mole and Badger Trench Digger kept their lines. Alley Cat and Poison Dart Frog have no legal line (already on the flagged list).
  - Keep the re-fit
  - Hold the Bloom cuts (Puffball, Lotus Frog lose half)
  - Revert the down-moves
- **Default:** Keep the re-fit
- **Outcome:** Owner, 2026-10-24 12:02: "EN OKAY" (as built / default).

**EN5-7. The snap check found a Guardian's step-in jumping 23 px** · Decide · UI · asked 2026-10-24
- tests/e2e/snaps.py crashed ("Cannot set properties of null (setting 'speedMult')", on HEAD too): a fresh profile's deck holds 3 Dolphin Knights it does not own, so the fight never started (PG's copy check). Fixed in the script (it owns its deck, as the other e2e scripts). Now it runs (random plays, so counts vary): the two phone runs are clean, the two 1366 runs (4-3, 4-5) report snaps, and every one looked at is a Guardian token stepping in (has-guard, en2-guarding) that moves 13-48 px between two frames with nothing animating it. EN2 / EN3's Guardian step-in pose, not EN5. Fix it in the next UI package?
  - Fix the Guardian step-in's snap next
  - Leave it
- **Default:** Fix the Guardian step-in's snap next
- **Outcome:** Owner, 2026-10-24 12:02: "EN OKAY".

**EQ2-1. Equipment durability: defaults by rarity, and what it does to the pieces' prices** · Decide · Battle rules · asked 2026-10-24
- Built (package EQ2, from your EQ-1 'Durability with acid / Corrode wear'): every piece has durability, its card's own number or by rarity: Common and Uncommon 3, Rare to Super Rare 4, Epic and up 5. A hit on the wearer takes 1 (a swing, a shot, a bolt, a raid smack, a floor's burn; a Poison or Bleed tick is not a hit), an acid hit 2, each Corrode applied 2. At 0 it breaks: it leaves play and its stats and skills come off the unit (Health never below 1). A dropped or stolen piece keeps its wear. The 50% / acid-death rule you disliked is not used. Price (4-round rule, bramblewood-budget.js equipLifeMult): a piece lasts about its durability in rounds, so it counts min(durability, 4) / 4 of its stats and grant: x0.75 for the Common and Uncommon pieces, x1 from Rare. All ten pieces were already well under N; durability frees 0.6-2 points on the five Common / Uncommon ones (docs/balance/eq2-equipment-2026-10-24.json). No card was changed.
  - Keep the defaults and the stats (built)
  - Keep the defaults, raise the Common / Uncommon pieces into the freed room
  - Durability 3 for every rarity
- **Default:** Keep the defaults and the stats (built)
- **Outcome:** Owner, 2026-10-24 13:12: "EQ: OKAY to all."

**EQ2-2. Dive: the simplest form (once a fight, the weakest unit of the row, no landing move)** · Decide · Battle rules · asked 2026-10-24
- Built (package EQ2, N21-5; your note: a diving flier is 'exposed', no 50% miss advantage while diving). From docs/ramming-proposal-2026-10-21.md option C, cut to its simplest: Dive N (N 1 by default): once a fight, the unit's swing goes to the weakest enemy unit (least Health, the nearest on a tie) in the row it faces, past any Taunt, for N more damage. A Guardian beside that unit still steps in. It does not move: no landing in the target's column. A diving Flyer is exposed for the rest of that round: attacks at it get no Flying dodge. Only a Flyer, a Tide unit or a Sprinter can have it (diveEligible). Priced 0.75 a point by the 4-round rule (N once = 0.5 N, the pick of the weakest +0.5, the exposure -0.25). No card has it yet.
  - Keep: no move (built)
  - Option C in full: it lands beside its target, in that column on your side
  - Let the player aim the dive (any enemy unit)
- **Default:** Keep: no move (built)
- **Outcome:** Owner, 2026-10-24 13:12: "EQ: OKAY to all." Dive to be reworked as a two-turn move (queued, EN7).

**EQ2-3. Temporary Health (Bolster N) and your Crepuscular example: plain Crepuscular is kept** · Decide · Battle rules · asked 2026-10-24
- Built (package EQ2, N21-7): bonus Health (above the unit's printed Health: a piece, a buff, the night) and temporary Health each have their own colour on a Health bar along the card (green printed, gold bonus, pale blue temporary; the bar shows only while a unit has either). New skill Bolster N (N 2 by default): N temporary Health as each round's fight begins, spent before anything else; what is left is gone when the next round's fight begins (set afresh, never stacked). Priced 2.5 a point. Your example 'Crepuscular gives +1 attack by day and +2 temp HP at night' conflicts with two later calls: CX2 (10-21 17:42, 'Crepuscular: +1 attack in day, +1 attack at night') and your 10-23 17:34 #4 (the plain default is +1/+0). So plain Crepuscular is unchanged; the example is a card-level choice, Crepuscular – {+1/+0}{Bolster 2} (priced 0.4 x (2 + 5) = 2.8), tested but on no card.
  - Keep plain Crepuscular; the example per card (built)
  - Make plain Crepuscular = {+1/+0}{Bolster 2}
- **Default:** Keep plain Crepuscular; the example per card (built)
- **Outcome:** Owner, 2026-10-24 13:12: "EQ: OKAY to all."

**EQ2-4. Parasite as built, and the Clinging Leech** · Decide · Battle rules · asked 2026-10-24
- Your 10-21 note (docs/titles-transforms-2026-10-21.md): 'Hooks onto enemy units? Not just leech-attacking from our side. So you place onto an enemy such that their column would be in reach.' The rest was undefined, so package EQ2 proposed and built: a Parasite card may be played onto an enemy unit in your reach (the centre, or a column with or beside one of your units) instead of into your slot (it may still be played as a plain unit). It rides its host: no slot, blocks nothing, can't be hit. It waits its own Wait, then feeds as each round's fight begins: its Attack as a flat hit on the host (no dodge, no Armor, no Guardian), healing itself as much. One Parasite a host, never on a Structure. When the host dies it drops onto your side in that column if the slot is free, else into your graveyard. Priced 1 (the sure hit and the safety against no lane blocked and no bramble damage). The CPU hooks it onto the enemy in reach worth the most. New card: Clinging Leech (Uncommon, 1 Lumber, Wait 1, 4/9 by the budget, placeholder art), awaiting a source.
  - Keep as built
  - The Parasite shares its host's hits (it can be killed)
  - It weakens its host (-Attack) instead of damaging it
- **Default:** Keep as built
- **Outcome:** Owner, 2026-10-24 13:12: "EQ: OKAY to all."

**EQ2-5. The Goliath Core's Beak Strike and the two guardian raiders** · Decide · Raids · asked 2026-10-24
- Built (package EQ2, N22-12 leftovers): a new single-target raid attack (pattern 'single'; the raid editor offers it): the Core's Beak Strike, 3 damage every 2 turns to your unit with the most Attack (any row); a Guardian adjacent to it (left, right, in front, behind) takes it instead; no unit: your bramble. Not telegraphed. Two tanky Guardian raider cards, crafted in the Forge's Raid tab from Goliath shards: Barnacle Bulwark (Rare, 2 Lumber, Wait 2, Guardian + Armor 1, 2/21 by the budget) and Reefback Turtle (Very Rare, 2 Lumber, Wait 2, Guardian + Shell 2, 2/20). Placeholder art.
  - Keep: 3 every 2 turns, not telegraphed (built)
  - Telegraph its target a turn ahead, like the smacks
  - Put it on the arms and tail too
- **Default:** Keep: 3 every 2 turns, not telegraphed (built)
- **Outcome:** Owner, 2026-10-24 13:12: "EQ: OKAY to all."

**BP-1. Bleed and Poison measure at about 1 a point, priced 2.6: re-price, or keep?** · Decide · Balance · asked 2026-10-24
- EN4's robust skill test (3000 games a setup) measured Bleed 2 and Poison 2 at about 2 stat points each, i.e. ~1 per point, against a price of 2.6 a point (5.2). By the 4-round rule: Poison 2 deals 2 then 1 (it wears down 1 a tick) = 3 damage per application; Bleed similar. Options: re-price to ~1.2-1.5 a point (cards with them gain stats), or keep 2.6 (their stacking on repeated hits is what the test under-measures).
  - Re-price to ~1.3 a point
  - Keep 2.6
- **Default:** Keep 2.6
- **Outcome:** Owner, 2026-10-24 03:12: "price it according to your simulation. Note that bigger numbers make them stronger" Queued in EN5.

**EN5-1. Name for the new skill: on hit, N damage to the opposing bramble (priced ~1.9)** · Decide · Rules · asked 2026-10-24
- Owner 02:59: 'A new skill: _____ N - does N damage to opposing bramble when it hits the enemy (onHit). Worth maybe 1.9.' Proposals: Siege N, Breach N, Rampage N, Overrun N. Built as Breach N unless you pick another.
  - Breach
  - Siege
  - Overrun
  - Rampage
- **Default:** Breach
- **Outcome:** Owner, 2026-10-24 03:12: "EN5-1 Okay - ur choice" Breach N.

**MAP-1. The Ambush: what stays locked, and until when** · Decide · Map · asked 2026-10-24
- Built from 'Those ambush skirmishes should lock the previous path I was going for. But then they also shouldn't be connected by a link but instead float there. The moment they are observed (ambushed), they are permanently accessible': the Ambush has no trail to or from it and floats where the scout shoved you; it is open the moment it is seen and stays on the map for good, won or not. The fight it interrupted (3-2) is drawn as a locked fight ('Blocked by the ambush') and, since everything after it waits on 3-2, so is the rest of that path. It opens when the Ambush is WON. Losing it, leaving it or walking away does not open the path. Alternatives: open the path after you have merely fought the Ambush (a loss counts), or after the Ambush is left once.
  - Open the path when the Ambush is won (built)
  - Open it after the Ambush has been fought, win or lose
  - Open it once you have walked away from the Ambush
- **Default:** Open the path when the Ambush is won (built)
- **Outcome:** Owner, 2026-10-24 02:59: "Map-1 okay."

**MAP-2. The raiders: once, or only their message once?** · Decide · Map · asked 2026-10-24
- Your note on the 'The raiders ran off with N Maple Leaves' line: 'This should only happen the first time.' Built: the raiders take Leaves on the first lost Ambush only, and the line shows then only; a later lost Ambush costs nothing and says nothing (a quiet, hidden loss each time seemed worse than none). If you only meant the message, the loss can stay every time and just the line be hidden after the first. The pop-up's warning ('Lose, and they run off with some of your Maple Leaves') shows only when the Ambush first appears.
  - Raiders strike once; no line after the first (built)
  - They keep taking Leaves every loss; only the line shows once
  - They keep taking Leaves and the line shows every time (as before)
- **Default:** Raiders strike once; no line after the first (built)
- **Outcome:** Owner, 2026-10-24 02:59: "Map-2. okay."

**MAP-3. Map tiles while an NPC talks: how long is 'active'?** · Decide · Map · asked 2026-10-24
- Built: while any NPC conversation is in the dialogue dock (a line on screen, or a question waiting for your reply, which can take up to 45 s at the slowest speed), the map's tiles (Armoury, Nest, Notices and the other spots, the well, the cave, the curiosities, the courier, the wanderer) make a dull knock and shake instead of opening. Side-map doors and exits are not tiles and keep working. If waiting on a reply feels too long to lock the map, the lock can end when the last line has been shown, with a question left open.
  - Locked for the whole conversation, a waiting question included (built)
  - Locked only while lines are playing, not while a question waits
- **Default:** Locked for the whole conversation, a waiting question included (built)
- **Outcome:** Owner, 2026-10-24 02:59: "tutorials have priority. And they dont even use the dialogue anyway, they use a different parallel form." Tutorial lessons take priority and never count as NPC dialogue for blocking tiles (queued).

**MAP-4. Back where you left off: this device only** · Decide · Map · asked 2026-10-24
- Built: the map you last stood on and the fight your pawn stood at are kept in this browser (bramblewood_last_map_v1) and the Conquest pane opens there after a reload or a new session on the same device; the pawn stands at its fight with no walk. A map that is not open (or a hidden daily dungeon) is never restored; Map 0 / the Tutorial rules and MK's heal run as before. It does not ride the cloud save, so a second device still starts on Map 0 until you have played the map there. If you want it in the cloud save, say so.
  - This device only (built)
  - Also in the cloud save, so every device resumes
- **Default:** This device only (built)
- **Outcome:** Owner, 2026-10-24 02:59: "Map-4 okay."

**MAP-5. The admin bramble editor: Health is the number the fight shows** · Decide · Admin · asked 2026-10-24
- Built from 'Admin can edit brambles on click (first plains bramble +1 HP)': in the fight panel an admin's bramble line is a button that opens a small inline editor with Health (what the panel and the fight use, after the halving; 5 shows as 5) and which bramble the enemy defends with (its effect shown). Save writes node.brambleHealth and characterId through the same skirmish-edit save as the other admin edits (local at once, published to everyone for a cloud admin); 'Back to the rule' clears both. An edited Health replaces the Map 0 base bramble, the hqHp cap and the halving; your own bramble's early-road lead still follows it (EB). It is on the fight panel only, not on the in-fight board. No database change is needed (it uses the existing map-nodes row).
  - Health is the final number (built)
  - Health is entered at full size and halved like the rest
- **Default:** Health is the final number (built)
- **Outcome:** Owner, 2026-10-24 02:59: "For now, ill assume what u say is okay." (It edits the bramble's Health, not a card's.)

**PRO-1. Reveal PRO fights to players after a map's boss?** · Decide · Skirmishes · asked 2026-10-24
- Your 00:28: "a special hidden skirmish in each map, with the best deck you could make". Built: each map's PRO fights (0-PRO-1 ... 3-PRO-1, from the deck optimizer's OPT2 runs) are hidden: not on the map, not counted for its progress, no rewards. They open from Admin (PRO fights), from the skirmish editor and from a link (#pro=3-PRO-1; anyone with the link can play it, after the tutorial). Revealing would add a small PRO marker beside a map's boss once the boss is beaten, still with no rewards.
  - No: they stay hidden (built)
  - Yes: show them after the map's boss
  - Yes, but only after a Rank S clear of the boss
- **Default:** No: they stay hidden (built)
- **Outcome:** Owner, 2026-10-24 02:59: "It's a fun thought of letting the player fight the PRO. Maybe after Map 40. - bank this for now. Default no." Banked idea: reveal after Map 40.

**BV-1. The camera no longer leans or turns toward the cards** · Confirm · Battle UI · asked 2026-10-24
- Your 17:01 #6 ('the battlefield should only move to zoom out or capture cards outside the field of vision'). Built: the jump-and-rubber-band was the snap guard mistaking a camera zoom for a card snap (fixed). On a computer the camera also leaned 40% of the way toward the cards' centre and turned up to 3 degrees toward them whenever cards sat outside the middle five columns (setBoardLean, 2026-10-12); that is gone too: the camera now shifts only as far as it takes to bring a card that would be off screen into view.
  - Keep it: no lean, no turn (built)
  - Bring back the 3 degree turn only
  - Bring back the lean and the turn
- **Default:** Keep it: no lean, no turn (built)
- **Outcome:** Owner, 2026-10-24 12:02: "BV OKAY" (as built / default).

**BV-2. 13:16 #24: which 'code above the deck'?** · Clarify · Battle UI · asked 2026-10-24
- No skirmish code (like 4-3) is drawn above a deck during a fight; the code only shows on the VS screen. The one thing above a deck is the enemy's hand count ('3 🃏') over their Deck, which on a phone was cut in half by the top of the screen. Built: on phones it now sits just inside their Deck's top edge, smaller (8.5 px). If you meant something else, a screenshot would pin it.
  - That was it (built)
  - Hide the hand count on phones
  - It was something else (screenshot)
- **Default:** That was it (built)
- **Outcome:** Owner, 2026-10-24 12:02: "BV OKAY" (as built / default).

**BV-3. 13:16 #23: the Shield symbol that vanished: which card?** · Clarify · Effects · asked 2026-10-24
- Playing Tide Pool Crab, Conch Crawler and Armadillo Guard (yours and the CPU's, on a Flood map too) keeps the 💠 Shield chip through the play and the round in every test. One real gap was found and fixed: a unit that joins the board mid-round (a token, a summon, a Shield Call shield) got a replay snapshot without its Shield, so the round's next redraw dropped its 💠 chip and blue Health (replayGuardSnap). If you still see it, the card's name (or a screenshot) would let it be reproduced.
  - Fixed (built)
  - Still happens with a card I'll name
- **Default:** Fixed (built)
- **Outcome:** Owner, 2026-10-24 12:02: "BV OKAY" (as built / default).

**BV-4. Day/night change: keep the faint creep from the left?** · Confirm · Effects · asked 2026-10-24
- Your 19:27 #20 ('the whole transition should be gentle'). Built: the copy of the new light that crept in from the left (your 10-16 request) now crosses in 8.5 s at an even pace and peaks at 10% (it shot across in about a second at 20%); the old tint holds while the new one comes in over it, and everything follows one sine curve over 10 s. It could also go entirely, leaving one even fade.
  - Keep the faint creep (built)
  - Remove the creep: one even fade
- **Default:** Keep the faint creep (built)
- **Outcome:** Owner, 2026-10-24 12:02: "BV OKAY" (as built / default).

**BV-5. 19:27 #20: the 'parallel bars' on some maps** · Clarify · Effects · asked 2026-10-24
- Two bar effects were made 50% more transparent / replaced: dusk's static shadow bars (FX.B.dusk, .35 -> .175) and the River Rapids current (Sunken Hollow), which was evenly spaced stripes and is now soft random streaks at about a third of the strength. Note: the short paired marks all over the Sunken Hollow board in your screenshot are reeds painted into the map's floor art (assets/maps/m2.png), not an effect; they can be toned down too if you mean those.
  - Those two were it (built)
  - Also tone down the reeds in the map art
- **Default:** Those two were it (built)
- **Outcome:** Owner, 2026-10-24 12:02: "BV OKAY" (as built / default).

**PRO-2. What does beating a PRO fight give?** · Decide · Rewards · asked 2026-10-24
- Built: nothing. The fight runs like the map's skirmishes (its castle and Shield, the PRO's field, the enemy at Level 1, the Smart CPU the deck was measured with, from Map 2 its showcase card as leader) but costs no Energy and pays no rank, cards, Maple Leaves, XP or quest counts; the results say "3-PRO-1 is a PRO fight: no rewards". A cosmetic option: a small PRO flag on your profile per map beaten (no gameplay value).
  - Nothing (built)
  - A cosmetic PRO flag per map
  - A one-time small reward per PRO fight
- **Default:** Nothing (built)
- **Outcome:** Owner, 2026-10-24 12:02: Default (no reward).

**PRO-3. Re-run the optimizer for Maps 0-3 on today's cards before the PRO fights ship?** · Decide · Balance tools · asked 2026-10-24
- The PRO decks come from OPT2's runs of 10-23, before RW5 and EN4 changed cards (the Ember Tetra 3/7 -> 2/6 and renamed from ember-tetra-3caj; the Voidfeather Scout became a Map 5 faction card). They are legal decks on today's cards and were measured head to head on today's engine, but a fresh run (about 20 minutes for the 4 maps on 2 cores) could find stronger ones; tools/opt/pro_skirmishes.js --apply then replaces a PRO-1 only if the new deck beats it (55% over 400 games). Several PRO decks also use cards first obtainable after their map (phase 2's related cards, e.g. Stonedrop Vulture in 3-PRO-1, Map 18): listed per deck as `later` in canonical/pro-skirmishes.json.
  - Re-run before release
  - Ship as is, re-run later
- **Default:** Ship as is, re-run later
- **Outcome:** Owner, 2026-10-24 12:02: Default (ship as is, re-run later).

**OPT-4. Deck optimizer's default search: the genetic search (recommended) or one-card-at-a-time descent?** · Decide · Tools · asked 2026-10-24
- OPT2 compared both on Maps 0-3 at equal budgets: final quality ties within noise; the genetic search wins head-to-head on 6 of 8 runs and finds about 3x more distinct optima; descent climbs faster on small budgets (under ~6,000 games) but stalls. Built: genetic by default, --method descent for quick runs.
  - Genetic (built)
  - Descent
- **Default:** Genetic (built)
- **Outcome:** Owner, 2026-10-24 12:02: Default (genetic search).

**EN4-1. The Bleed doubler's name, and when it doubles** · Decide · Skills · asked 2026-10-23
- Your 22:23 #7: "Do we have the skills that do extra damage to bleeding units, or even 2x their bleed." Hunter (Bleeding) already does the extra damage; the new skill doubles. Built as HEMORRHAGE 🩸²: its swing that lands on a Bleeding unit doubles the Bleed the unit already has, THEN its own Bleed (if any) adds. So it is a payoff for Bleed you already put there (an ally's, or its own from an earlier round); a fresh target gets nothing from it. Doubling after its own Bleed instead would make a lone Bleed 2 card double its own cut every hit (2, 6, 14 ...), which runs away. Names in the existing style (Gash, Perforate, Rupture, Rabid): Hemorrhage, Open Wound, Deepen, Bloodletting.
  - Hemorrhage, doubles before its own Bleed
  - Hemorrhage, doubles after its own Bleed
  - Open Wound
  - Deepen
  - Bloodletting
- **Default:** Hemorrhage, doubles before its own Bleed
- **Outcome:** Owner, 2026-10-24 03:12: "OKAY, yes. It adds 0 bleed by default (N=0)" Queued in EN5.

**EN4-2. How Greater Poison ticks** · Decide · Skills · asked 2026-10-23
- Your 22:23 #7: "when units are hit with Greater Poison - all existing poison is converted to greater poison. Greater poison only hits for 1 poison by default. Usually they have both GP and Poison." Built: Greater Poison N (N 1 by default) on the attacker; its swing that gets through turns ALL the Poison the target had before the hit into Greater Poison and adds N; the swing's own Poison then lands as plain Poison, for its next hit to turn. The status: (A, built) each stack deals 2 a round, then the stack loses 1, as Poison does: Poison twice over. Poison 3 deals 3+2+1 = 6; turned, 6+4+2 = 12. (B) its whole stack every round, never wearing off: that is Toxin, which the game already has, so B would make Greater Poison 'Poison that turns into Toxin'. (C) its stack every round, wearing off 1 every 2 rounds. A reads plainest and keeps Toxin its own thing. Cure takes Poison first, then Greater Poison; Poison Tick (Venom Pulse) ticks both; Hunter (Poisoned) counts it. Status pip: a violet 💀 beside the green ☠.
  - (A) 2 a stack, -1 a round
  - (B) its stack every round, never wears off (as Toxin)
  - (C) its stack every round, -1 every 2 rounds
- **Default:** (A) 2 a stack, -1 a round
- **Outcome:** Owner, 2026-10-23 23:45: "When something is hit by Greater Poison, Greater Poison tokens are not removed on every poison tick." Built (EN4): 1 damage a stack each round ("Greater poison only hits for 1 poison by default"), the stack never wears down (plain Poison still does); only Cure removes it. Repriced 2.5. The first build (2 a stack, -1 a round) is gone.

**EN4-3. Prices for Hemorrhage, Greater Poison and Shore Up** · Decide · Balance · asked 2026-10-23
- Priced by your 4-round rule (docs/workflows/balance.md), checked with tools/skill_test_robust.js --mono --multi (3000 games a setup, docs/balance/en4-skill-test-2026-10-23.md). SHORE UP 2.2: a front unit survives 2-3 hits over 4 rounds with about 1.5 allies beside it, so 3-4.5 Shield, about half of it soaking: 1.5-2 Health; measured 2.68 alone, 2.26 with companions; set at 2.2. HEMORRHAGE 2: on a target already Bleeding about half its hits, each doubling adds about the stack (1-3), about +1 Bleed a hit (Bleed 2.6 a stack) = 1.3-2.6, and nothing without Bleed around. GREATER POISON 2.5 (N 1; scale half; 1 a stack, never wears off, owner 23:45): beside Poison 2, the target's ticks over 4 rounds go from 2+3+4 = 9 to 3+5+7 = 15, about 6 more damage = 3 stat points if it lives all 4 rounds, about 2 at a usual 2/3; alone 1+2+3 = 6. PULSE (owner 23:45: Venom Pulse renamed, Poison AND Bleed tick): the Pulse action 1.3 a tick (on a target Poisoned about half its hits, about 2.5 a tick, and Bleeding about a third, about 2: about 1.9 damage a pulse), so Pulse 1 = On Hit 2.1 x 1.3 = 2.7 (Venom Pulse was 2.1); no card carries it, so nothing re-fits. The test can't price these two: they need their enabler (Bleed 2 / Poison 2), and a unit carrying that at the table's 5.2 loses nearly every game in the harness, so their rows sit at the floor. Side finding: in the same harness Bleed 2 and Poison 2 read about 2 stat points against their 5.2 price; listed, not acted on. The six new cards are fitted at these prices.
  - Keep the prices as set
  - Price by the measured worth instead
  - Other
- **Default:** Keep the prices as set
- **Outcome:** Owner, 2026-10-24 12:02: "EN OKAY".

**EN4-4. Six new cards for the three skills, and where they go** · Decide · Cards · asked 2026-10-23
- Two cards a skill (Greater Poison on cards with Poison too), priced by the formula with their map's term, placeholder art (the emoji), NightCafe prompts in docs/art/new-cards-2026-10-23-en4.md. Placed lightly where they add a decision (22:23 #10: Maps 0-9 lacked depth): Oyster Bank (common, 0 Attack, Shore Up) Pebble Beach, Map 2, Pack 1: a wall that props up the units beside it. Great Skua (common, Flying, Hemorrhage) Gannet Cliffs, Map 3, Pack 1: pays off the Razorbill's Bleed. Cane Toad (uncommon, Poison 1 + Greater Poison 1) Sable Swampmire, Map 6, Pack 1: the poison swamp's payoff. Bloodscent Shark (uncommon, Hemorrhage) Coral Current, Map 10, Pack 2: beside the Gash squids. Musk Ox Matriarch (uncommon, Shore Up + Armor 1) Wolfsbane Tundra, Map 17, Pack 3. Inland Taipan (rare, Poison 2 + Greater Poison 1) the Pale Desert, Map 18, Pack 3: beside the scorpions. All are pack cards (not skirmish rewards) and appear in their map's enemy pool.
  - Keep these placements
  - Move some (say which)
  - Hold them out of the maps for now
- **Default:** Keep these placements
- **Outcome:** Owner, 2026-10-24 12:02: "EN OKAY".

**EN4-5. Guardian: is a Guardian aimed at directly still covered by the Guardian beside it?** · Decide · Skills · asked 2026-10-23
- Your 22:23 #9: "Guardian shouldn't intercept an intercepting guardian." EN3's one hop is reverted: when a Guardian steps in for an ally, no other Guardian steps in for it. Kept as before EN3: a swing aimed straight at a Guardian (not one that stepped in) can still be taken by a Guardian beside it, since that Guardian wasn't intercepting. Say if a Guardian should never be covered at all.
  - Yes, as before EN3
  - No, a Guardian is never covered
- **Default:** Yes, as before EN3
- **Outcome:** Owner, 2026-10-24 03:12: "Yes, but not if its intercepting someone!" (As built in EN4.)

**OPT-1. Deck optimizer: how much of the search goes to the whole-spectrum phase?** · Decide · Balance tools · asked 2026-10-23
- Your 20:44 line "i dont want to put only 10% computing power to this 2nd" can mean more than 10% or at most 10%. tools/opt/deckopt.js gives the out-of-map phase 30% of the search time (--cross-share 0.3); any share is one option away. In the first runs (Maps 0-3, 2.5-4 min each) the out-of-map cards added 1-23 points to the optimum's score.
  - 30% (built)
  - 50%
  - 10% or less
- **Default:** 30% (built)
- **Outcome:** Owner, 2026-10-23 22:23: "use logic first - must be related, cannot be selected leaders or boss cards for future skirmishes, cannot be strange Map 40+ cards etc. maybe have similar attacks like arrows in an arrow map - that really limits the number of cards to prob 5-25." Phase 2 becomes a logic-filtered candidate list (queued, OPT2).

**OPT-2. Deck optimizer: phase 1 = the map's cards only, or the map's cards + what you own by then?** · Decide · Balance tools · asked 2026-10-23
- Built: the map's cards (map-pools MAP + submap tiers, not SPECIAL) plus every Base card and every card obtainable before the map (HUB3 plan). With those, the Maps 1-3 optimum is mostly Base cards (Voidfeather Scout, Ember Tetra, Otter Guard, Otter Centurion); on Map 3 it holds no Gannet Cliffs card at all. With the map's cards only (--owned none) the Map 3 optimum scores 66% and its fight decks sit only 17-436 Elo below it, while the Map 0-2 fight decks sit 296-755 below theirs. docs/balance/opt/deckopt-summary-2026-10-23.md and deckopt-summary-2026-10-23-mapcards.md.
  - Map cards + owned (built)
  - Map cards only
  - Run both every time
- **Default:** Run both every time
- **Outcome:** Owner, 2026-10-23 22:23: "see (11)". Same filter.

**OPT-3. Use the optimizer's Elo gap as the difficulty dial for skirmish decks?** · Decide · Skirmishes · asked 2026-10-23
- The optimizer measures how far each fight deck sits below the best deck its map's cards can make (Elo = 400 log10(p / (1 - p)) of the optimum's fair head-to-head score; +200 = the optimum wins 76%, +400 = 91%). Today the Map 0-2 fight decks sit about 300-750 Elo below the optimum, and the gap does not fall steadily along a map. Proposal: give each fight a gap target that falls from about 600 (first skirmish) to about 150 (the map's boss), and toward 0 by Map 20; tune decks to it with the tool, and keep the level, bramble and field levers for the rest.
  - Yes, falling gap targets
  - Measure only (no targets)
  - Later
- **Default:** Measure only (no targets)
- **Outcome:** Owner, 2026-10-23 22:23: "we try to create the optimum (at lvl 1) deck first. then we see how to make a range of weaker decks after that. Idk if its possible to find multiple local maxima. Idk if we should do grid search based discrete descent or just random." Queued, OPT2.

**PP-1. Pack map ranges: 0-6 / 7-13 / 14-20, or 0-7 / 8-14 / 15-21?** · Decide · Packs · asked 2026-10-23
- Item 15 (19:27) says Maps 0-6 → Pack 1, 7-13 → Pack 2, 13-20 → Pack 3 (Map 13 twice); the later note says Pack 1 spans 8 maps and Packs 2-3 span 7 each (0-7 / 8-14 / 15-21). HUB3's plan uses item 15 with Map 13 in Pack 2.
  - 0-6 / 7-13 / 14-20
  - 0-7 / 8-14 / 15-21
- **Default:** 0-6 / 7-13 / 14-20
- **Outcome:** Owner, 2026-10-24 03:12: "PP-1: OKAY"

**PP-2. First faction Rare: the pattern's 10th reward (lands on Map 3), or the 10-21 rule 'Rare only from Map 14'?** · Decide · Faction · asked 2026-10-23
- The standard faction pattern C,C,C,U,C,C,U,C,U,R puts the first Rare at the 10th reward; today 12 faction rewards are handed out by Map 3.
  - Pattern wins (Rare on Map 3)
  - Rare only from Map 14 (pattern skips R until then)
- **Default:** Rare only from Map 14 (pattern skips R until then)
- **Outcome:** Owner, 2026-10-23 22:23: "It's okay faction rares start slower. For Map 5, the rare is the boss's leader. Normal skirmish rares only start coming in Map 10 onwards. (gently)" Faction track: no Rare before Map 14 (default kept).

**PP-3. Level 0: only tutorial base and baby cards, or every Base card (raised in the Nest)?** · Decide · Levels · asked 2026-10-23
- Today Bee Knight, Forager Ant and Sparrow Chick start at 0 without being tutorial base, and since TU2 every new faction copy comes at Level 0. Both contradict the 19:27 rule as written.
  - Only tutorial base + babies
  - Every Base card
- **Default:** Only tutorial base + babies
- **Outcome:** Owner, 2026-10-24 03:12: "PP-3 OKAY, base cards are lvl 1 i agree."

**EN3-8. Where the four new bramble-guard cards come from** · Decide · Cards · asked 2026-10-23
- Owner 20:44: "The new skills we mentioned - implement them in new cards." Built (awaitingSource, placeholder emoji art, NightCafe prompts in docs/art/new-cards-2026-10-21-briefs.md, names and flavour in 12 packs), each fitted to the budget at Level 1 with no map term (tools/en3_new_cards_2026_10_23.js): DAM-KEEPER BEAVER (common, Lumber 1, Wait 1, Rampart) 2/11; BRIARBACK HEDGEHOG (common, Lumber 1, Wait 1, Bramble Armor) 2/11; MOAT SNAPPER (uncommon, Lumber 2, Wait 2, Rampart, Armor 1) 4/14; BARKPLATE BEETLE (uncommon, Lumber 2, Wait 2, Bramble Armor, Thorns 1) 4/14. Proposed: the two commons in Pack 1 (Maps 0-6; your note that the bramble is too weak at Map 0 and before makes early bramble guards useful), the two uncommons in Pack 2 (Maps 7-13: the Snapper beside the turtles, the Beetle in the Redwood Deep). Placing them needs canonical/map-pools.json and canonical/card-obtain-maps.json rows (a later package); the Map term then lifts their lines a little. Pricing (owner 20:44: "just logic is sufficient ... the effect of 1 attack or health across 4 rounds"): both skills were also measured (docs/balance/en3-skill-test-2026-10-23.md) and the logic agrees: Bramble Armor's 1 a bramble hit is about 1 Health a round (1.1), Rampart mostly moves damage from the bramble to a unit 1:1 (0.5).
  - Commons in Pack 1, uncommons in Pack 2 (as proposed)
  - All four in Pack 1
  - Skirmish rewards instead (say which maps)
- **Default:** Commons in Pack 1, uncommons in Pack 2 (as proposed)
- **Outcome:** Owner, 2026-10-23 22:23: "EN stuff - okay"; also #10: place new cards in Maps 0-20 lightly where they add strategic depth.

**EN3-1. Should Guardian also protect the bramble?** · Decide · Battle rules · asked 2026-10-23
- Your 19:27 #2: "Guardians do not block enemies from attacking the bramble." That is the current design: Guardian steps in for adjacent allies only, never the bramble. Built (EN3): kept, and its text now says so ("... and it never guards the bramble"; the short text "(not the bramble)"). The bramble has two new skills of its own for this (EN3-4): Rampart takes half of each hit on the bramble, Bramble Armor takes 1 off each.
  - No: Guardian guards allies only; Rampart / Bramble Armor guard the bramble (as built)
  - Yes: a Guardian next to the lane a bramble hit comes down also takes it
  - Yes, but only a Guardian standing in the attacker's column
- **Default:** No: Guardian guards allies only; Rampart / Bramble Armor guard the bramble (as built)
- **Outcome:** Owner, 2026-10-23 22:23: "EN stuff - okay". Guardian does not protect the bramble.

**EN3-2. Bleed now fades at the round's end, after it bleeds** · Decide · Battle rules · asked 2026-10-23
- Your 19:27 #5: "before they TAKE the bleed or poison damage, they -1. They should take the damage first." Bleed lost its stack at each round's START (since 10-18), before the unit acted, so a Bleed 3 dealt 2 then 1 (3 in all) instead of 3, 2, 1 (6). Built: a Bleeding unit loses 1 stack at the END of a round in which it started Bleeding or bled; a stack that lands after its last action that round waits for the next round's end, so it is bled in full first. A Waiting unit (which can't bleed on its own actions) still loses 1 a round from its second round. Festering still holds it. The grey drop plays at the round's end. Poison was already right in the engine (the tick is the whole stack, then -1); the board showed the badge drop at the same instant as the damage, so it now drops about half a second after the damage. Card-matrix results change wherever Bleed is in play (see the CHANGELOG).
  - As built (round's end, after it bled; a late stack waits a round)
  - Only after it bleeds (no wear-down at all while it can't act)
  - Round's end for every stack, late ones too (simpler, a late stack loses 1 unbled)
- **Default:** As built (round's end, after it bled; a late stack waits a round)
- **Outcome:** Owner, 2026-10-23 22:23: "EN stuff - okay". Bleed fade as built.

**EN3-3. A Guardian guarding a Guardian: one hop or a full chain** · Decide · Battle rules · asked 2026-10-23
- Your 19:27 #8: "Guardian doesn't intercept a guardian's intercept." Built: when a Guardian steps in, a Guardian adjacent to THAT Guardian (not the unit first aimed at) steps in for it and takes the swing; at most one extra hop. On the board the first Guardian steps in front of the ally, the second in front of the first ("🦺 Covered!"), and the second takes the blow. A full chain would run every blow to the end of a line of Guardians, which reads oddly and makes the last one in a line a sponge. #19 is built too: no dashed line is drawn when a Guardian intercepts (its shield pops in, and the step-in shows who it covered).
  - One hop (as built)
  - A full chain (to the end of a line of Guardians, never back)
  - None (a Guardian never steps in for a Guardian)
- **Default:** One hop (as built)
- **Outcome:** Owner, 2026-10-23 22:23: "Guardian shouldn't intercept an intercepting guardian." No chain: to be reverted (queued, EN4).

**EN3-4. Names and homes for the two bramble skills: Rampart 🚧 and Bramble Armor 🌿🛡️** · Decide · Skills · asked 2026-10-23
- Your 19:27 #3: "takes half of bramble damage ... 5/2=3, it takes 3, the bramble takes 2" and "lowers damage taken by Bramble by 1. (Bramble armour basically)". Built: RAMPART (engine key rampart): every hit on its bramble that a unit deals (swings, shots, skills, Pierce, an Overwhelm spill, a boomerang) is split, the unit ceil(half), the bramble the rest; the field's own bramble damage (Ley Lines, Ash Rain) is not split. With two or more, the one nearest the attacker's column takes it (a tie or no attacker: the first listed). Its share is plain damage (its Shield soaks first; no Armor, no Thorns). Looks: a light streak from the bramble to the unit as the blow lands, the unit flinches and its share floats on it. BRAMBLE ARMOR (key brambleArmor): the bramble's part of each such hit is 1 less, after Rampart (5 with both: 3 on the unit, 1 on the bramble). Looks: a small shield ting (🛡️ −1) on the bramble. Supreme crushes both. Prices (tools/skill_test_robust.js, docs/balance/en3-skill-test-2026-10-23.md): Rampart measured worth 0.44 (-0.13 with companions), priced 0.5; Bramble Armor 1.15 (1.06), priced 1.1. Homes (owner 20:44: "implement them in new cards"): four NEW cards, Dam-Keeper Beaver and Moat Snapper (Rampart), Briarback Hedgehog and Barkplate Beetle (Bramble Armor), their source call EN3-8. Also Rampart is on Riverworks Bastion ("A fortress of logs and mud that has outlasted ... at least one siege"; re-fit 0/32 -> 0/30). Existing cards that could also take Bramble Armor: Dam Wall (0/22, no skill), Barnacle Fortress (0/6, Armor), Turtle Bastion (2/23, Tide), Hawthorn Shieldbug (2/12, Armor), Thornwood Palisade (would be a third skill). Other names: Rampart -> Bramblewarden, Hedgewall, Bulwark Keeper; Bramble Armor -> Thornplate, Barkplate, Hedge Armor.
  - Rampart and Bramble Armor, on the four new cards and Riverworks Bastion (as built)
  - As built, and Bramble Armor on Dam Wall too
  - Other names (say which)
- **Default:** Rampart and Bramble Armor, on the four new cards and Riverworks Bastion (as built)
- **Outcome:** Owner, 2026-10-23 22:23: "EN stuff - okay". Rampart and Bramble Armor as named.

**EN3-5. Bramble Armor with two or more units: still 1, or 1 each?** · Decide · Skills · asked 2026-10-23
- Built: several Bramble Armor units still take 1 off a hit (it doesn't stack), so a wall of them can't make the bramble immune to 1- and 2-damage hits, and one price (1.1) holds. Per unit would make it 1 a unit; the price would then have to rise with the count.
  - Max 1 (as built)
  - 1 per unit
  - 1 per unit, up to 2
- **Default:** Max 1 (as built)
- **Outcome:** Owner, 2026-10-23 22:23: "EN stuff - okay". Max 1 as built.

**EN3-6. 13 cards the Bleed / Poison and Bulwark re-prices would cut: held at their stats (as BF11-1)** · Decide · Balance · asked 2026-10-23
- Your 19:27 #6 (round each Bleed / Poison price up a tenth: Poison 2.5 -> 2.6, Bleed 2.5 -> 2.6, Gash 1.5 -> 1.6, Venomous, Poison Bolt, Poison Gas 3 -> 3.1, Rabid and Venom Master 5 -> 5.1, Proliferate 6 -> 6.1, Perforate 3.5 -> 3.6, the Poison and Bleed actions 1.3 -> 1.4 and 0.9 -> 1.0; Toxin, Detonate, Hunter and Poison Tick have no wearing stack and are left) and #9 (Bulwark 6 -> 9). 66 cards' skill worth moved; tools/en3_refit_2026_10_23.js re-fitted the band cards: 3 had room and went up (ironmaw-warwolf 6/6 -> 7/7, fire-ant-raft 2/7 -> 2/8, whip-spider 3/7 -> 3/8). These would go down and are held at their stats: alley-cat 1/8 -> 1/6; trapdoor-spider 4/7 -> 4/6; komodo-warlord 1/25 -> 1/24; venomlord-serpent 1/22 -> 1/21; ancient-sloth-titan 2/33 -> 2/27; vampire-squid 4/14 -> 4/13; lions-mane-jelly 1/16 -> 1/15; puffball-bombardier 1/10 -> 1/6; cottonmouth-matriarch 2/12 -> 2/11; muskrat-lodgekeeper 2/10 -> 1/1; alligator-gar 6/6 -> 5/5; banded-sea-krait 4/4 -> 3/3; yellow-bellied-sea-snake 3/3 -> 1/1. poison-dart-frog has no legal line (merged into the flagged list). The biggest: Ancient Sloth Titan 2/33 -> 2/27 and Muskrat Lodgekeeper 2/10 -> 1/1 (both Bulwark). File: docs/balance/en3-refit-2026-10-23.json.
  - Hold them, trim skills per card later (as built, like BF11-1)
  - Apply the formula's lines
  - Apply all but the Bulwark two (Ancient Sloth Titan, Muskrat Lodgekeeper)
- **Default:** Hold them, trim skills per card later (as built, like BF11-1)
- **Outcome:** Owner, 2026-10-23 22:23: "EN stuff - okay". Held cards stay held.

**EN3-7. Shore Up, the opposite of hunkering down: three ideas (not built)** · Decide · Skills · asked 2026-10-23
- Your 19:27 #4: "New Skill: Shore Up, opposite of Hunker Down? What could they do?" There is no Hunker Down skill; the nearest is Cower (hit last turn: it hides in its shell or backs off, no attack) and Shell. Three ways to turn that round: (A) SHORE UP N, the mason: each hit it survives, its bramble gets N Health back (On Attacked 1.9 x Rebuild 0.2 a point = about 0.4 per N); it fights on, and the beating it takes props up the bramble. (B) SHORE UP, brace the line: when it is hit (and survives) it doesn't hide; the allies beside it get Shield 1 for the next round (On Attacked 1.9 x Shield 0.35 x 2 allies = about 1.3); Cower saves itself, this saves its neighbours. (C) SHORE UP N, dig in when left alone: at the start of a round after one in which nothing hit it, it gains Shield N, up to 2N (On Round Start 3.5 x Shield 0.35 x about half the rounds = about 0.6 per N); Cower fires after a hit, this after a quiet round. Prices are estimates from canonical/skill-costs.json; each would be measured with tools/skill_test_robust.js once built.
  - (B) Brace the line
  - (A) The mason (rebuilds the bramble)
  - (C) Dig in when left alone
  - None for now
- **Default:** (B) Brace the line
- **Outcome:** Owner, 2026-10-23 22:23: "EN stuff - okay". Shore Up default (B): when hit, Shield 1 to the allies beside it; to build later.

**RW5-1. The end of each map: a pack of 3 + 1 faction pack (built ON)** · Decide · Rewards · asked 2026-10-23
- Your 19:36 note ("i think at the end of each map, give a pack of 3 + 1 faction pack, corresponding to that map series") is built behind MAP_END_PACKS (on): a main map's last fight, first clear, gives a 3-card pack of that map's series (Maps 0-6 the Hedgerow Pouch's pool, 7-13 the Tidemire Chest's, 14+ the Highcrest Case's; new cards first) and one faction pack of your side (2 faction cards out of the faction pool + 1 pack card). It comes on top of the map's free pack where it has one. It is what puts the standard pattern inside your window (tools/rw5_faction_pacing_2026_10_23.js, median of 20 seeds): otters first Rare Map 14, last standard Uncommon Map 15, no Very Rare by Map 24; hummingbirds first Rare Map 14, last standard Uncommon Map 16, no Very Rare by Map 24. Without it: otters first Rare Map 15, last standard Uncommon Map 21, no Very Rare by Map 24; hummingbirds first Rare Map 15, last standard Uncommon Map 22, no Very Rare by Map 24 (too many).
  - Keep it on
  - Only the pack of 3
  - Off
- **Default:** Keep it on
- **Outcome:** Owner, 2026-10-23 23:45: "RW5- okay."

**RW5-2. Climbing the rarity tree: the pattern moves up once you hold 2 of each of your side's cards (1 of the other side's)** · Decide · Faction · asked 2026-10-23
- Your rule "pool copies = the most a deck may hold" makes a big pool: as the game builds it, 60 cards / 204 copies (110 common, 59 uncommon, 26 rare, 4 veryrare, 1 epic, 1 high, 1 superrare, 2 heroic). If the pattern only climbed when a rarity's copies ran out, Uncommons would still come at Map 24 (too many). Built (FACTION_CLIMB_HOLD, from "you will slowly get 1-2x of each copy along the way, climbing the rarity tree"): a rarity is done for the pattern once you hold 2 copies of each of its cards of your side and the shared ones and 1 of the other side's and of each Base card; the rest of the copies stay in the pool for the random faction rewards. Note: the hub counts 30 faction cards as unplaced because they carry the old `unattainable` flag, but the game no longer reads it (obtainability comes from the source), so they are in the pool and in faction rewards today. With only the released 26 cards the pool runs dry around Map 17-19.
  - Keep 2 / 1
  - 1 of each (climbs faster)
  - Climb only when copies run out
- **Default:** Keep 2 / 1
- **Outcome:** Owner, 2026-10-23 23:45: "RW5- okay."

**RW5-3. Ten cards met on an earlier side map than the map they are sourced to: re-fit or move?** · Decide · Cards · asked 2026-10-23
- Beetle Battering Ram (Mycelium Deep / Goldfeather Siege), Fox Kit (Map 0 / Redwood Deep), Lodge Engineer (Lilypad Reach / Goldfeather Keep), Mallard Marauder (Smugglers' Grotto / Goldfeather Keep), Mudpuppy (Lilypad Reach / Kelp Mangroves) and Cinder Gecko (Pale Desert / Rimefire Caldera) are in an early side map's pool, but re-pointing them there puts their stats 0.1-1.2 points over budget (the Map term). RW5 kept their source map (tools/rw5_pack_tiers_2026_10_23.js BUDGET_HOLD); Mudpuppy and Cinder Gecko so sit one pack tier later than where you meet them. Four more keep their map for another reason: Mangrove Mudskipper and Minnow Skitter (Lilypad Reach / Kelp Mangroves), Cinder Hornet (Volcano Lair / Rimefire Caldera) and Siege Rhino (the Canopy / Goldfeather Siege) are those maps' first-clear pack cards (GD5: a card of that map's own pool), so they too sit one pack tier later than the side map where you first meet them.
  - Re-fit them by formula for the early map
  - Take them out of the early side map's pool
  - Leave them
- **Default:** Re-fit them by formula for the early map
- **Outcome:** Owner, 2026-10-23 23:45: "RW5-3 if there's a reason you want to move them, you can use the new map's budget." EN4 (tools/en4_rw5_followups_2026_10_23.js) moved two where the early side map is the theme-correct home, re-fitted to that map's budget: Lodge Engineer (beaver lodge) to Lilypad Reach (opens at Map 6, Pack 1) 3/14 -> 3/13; Mallard Marauder (duck pirate) to Smugglers' Grotto (opens at Map 7, Pack 2) 2/6 -> 2/5. Kept: Mudpuppy (9-4's first-clear pack card must stay a Kelp Mangroves card, GD5), and, theme already right, Beetle Battering Ram and Siege Rhino (the Goldfeather Siege), Fox Kit (the Redwood Deep), Cinder Gecko and Cinder Hornet (the Rimefire Caldera), Mangrove Mudskipper and Minnow Skitter (the Kelp Mangroves' first-clear pack cards).

**RW5-4. Ember Tetra (was ember-tetra-3caj): where does it come from?** · Decide · Cards · asked 2026-10-23
- Its id is fixed (ember-tetra; the live row is skipped and supabase/proposed/20261023_rw5_clear_ember_tetra.sql deletes it on "apply it"). It still has no source, so it is a Base card everyone has. As a Pack 3 card of the Ashen Spurn (hot springs) its 3/7 with Tide braces is 0.6 over budget.
  - Pack 3 (Ashen Spurn), re-fit to 2/7
  - A skirmish reward
  - Keep it Base
- **Default:** Pack 3 (Ashen Spurn), re-fit to 2/7
- **Outcome:** Owner, 2026-10-23 23:45: "Ember Tetra can be a pack 1." EN4: a Pack 1 card of the Sunken Hollow (Map 4, flooded), in its pool, re-fitted to Map 4's budget 3/7 -> 2/6.

**RW5-5. Raid Ticket price: 400 Maple Leaves + 5 Gold Leaves?** · Decide · Shop · asked 2026-10-23
- Item 16: "Raid ticket should be alittle more expensive, and cost at least abit of advanced resources." Built: 400 Maple Leaves and 5 Gold Leaves (was 300 Maple Leaves). Gold Leaves are the advanced currency packs also take.
  - Keep 400 + 5
  - Other numbers
- **Default:** Keep 400 + 5
- **Outcome:** Owner, 2026-10-23 23:45: "RW5- okay."

**RW5-6. "Upgrade fragments +10%" read as the Refine ladder's costs** · Decide · Forge · asked 2026-10-23
- Item 14: "Foil treatment 'upgrade fragments' needed/bars need 10% more." The game has no fragments for foils; the foil treatments are upgraded in the Forge's Refine (Plain -> Foil -> Hex -> ... -> Gold leaf), so every Refine step now costs 10% more Dust, Maple Leaves and Gold Leaves (REFINE_COST_MULT 1.1, rounded up). If you meant something else, say what.
  - That's it
  - Something else
- **Default:** That's it
- **Outcome:** Owner, 2026-10-23 23:45: "RW5- okay."

**RW5-7. One normal-skirmish Rare before Map 10: the Mangrove Kingfisher (9-3)** · Decide · Rewards · asked 2026-10-23
- Your 22:23 #2: "For Map 5, the rare is the boss's leader. Normal skirmish rares only start coming in Map 10 onwards (gently)." Checked the first-clear rewards of Maps 0-9: every Rare is a boss, mini-boss, elite or side-map boss reward except the Mangrove Kingfisher, the reward of 9-3 (a skirmish, the Kelp Mangroves). Nothing was moved (rewards are set through tools/map_divvy_2026_10_22.js). The faction track's Rare stays at Map 14 (PP-2). Drop rates are unchanged (#3).
  - Move it to a Map 10 skirmish
  - Make it the reward of a Map 9 mini-boss
  - Leave it
- **Default:** Make it the reward of a Map 9 mini-boss
- **Outcome:** Owner, 2026-10-23 23:45: "RW5-7 if it doesn't fit with our new philosophy, move it." EN4: the Mangrove Kingfisher is the reward of 9-6 (the Drifting Shell, an elite that fields it), no longer of 9-3 (a normal skirmish); the Banded Sea Krait (Uncommon) moves from 9-5 to 9-3 so Map 9 keeps a skirmish-exclusive card (one Reef Shark in 9-3's deck for it); tools/map_divvy_2026_10_22.js POOLS agrees.

**RW5-8. Six new cards placed lightly in Maps 1-9 (22:23 #10)** · Decide · Cards · asked 2026-10-23
- For the strategic depth you missed in Maps 0-9, the new cards that add a decision are placed in those maps' pack pools (tools/rw5_place_new_cards_2026_10_23.js): Briarback Hedgehog (Bramble Armor) Thistlewood, Map 1, Pack 1; Dam-Keeper Beaver (Rampart) and Pond Algae (the first Bloom card) Sunken Hollow, Map 4, Pack 1; Moat Snapper (Rampart + Armor) Gatorback Swamp, Map 5, Pack 1; Barkplate Beetle (Bramble Armor + Thorns) Morel Hollow, Map 7, Pack 2; Ironclaw Fiddler (Tide + Bludgeon + Armor, Rare) Kelp Mangroves, Map 9, Pack 2. All fit the budget at their map. They are in the packs and the base track, not yet in any enemy deck or first-clear reward.
  - Keep them
  - Move some
  - Also put one in each map's enemy decks
- **Default:** Keep them
- **Outcome:** Owner, 2026-10-23 23:45: "RW5- okay."

**FLY-1. Flying maps and the Windy buff (Gannet Cliffs): how should they be toned down? (you're thinking it over)** · Decide · Balance · asked 2026-10-23
- Owner, 17:01: "Yeah the flying maps are really strong. let me think about them." and "Im abit stuck in Gannet cliffs because its so difficult. I realise the windy buff is reallly strong. let me think". Waiting on the owner. EN2 fixes Headwind (skills twice, not acts twice) and reports Gannet Cliffs win rates before and after.
  - Owner to decide
- **Default:** Owner to decide
- **Outcome:** Owner, 2026-10-24 03:12: "FLY-1: OKAY." (EN2's wind fix stands; new canopy-evasion skill queued in EN5.)

**PR-1. Map 0: a sure card on the first clear only** · Decide · Rewards · asked 2026-10-23 · decided 2026-10-23
- Your report: 0-1 paid a card on 5 of 5 wins. Cause: the 2026-10-13 rule "every win on Map 0 brings a card" paid a card on every Map 0 win, skipping the drop chance the fight panel shows. Built (PR): the sure card comes with the first clear only; replays roll the panel's drop (3% for 0-1). The other choice keeps a card on every Map 0 win and changes the panel to say so.
  - First clear only (built)
  - Every Map 0 win
- **Default:** First clear only (built)
- **Outcome:** Owner (10-23 17:34): "PR-1 OKAY". First clear only, as built: each Map 0 fight's sure card comes with its first clear; replays roll the drop the fight panel shows (3% for 0-1).

**RW4-1. How much better is "much better" from fight 2-1** · Decide · Swap · asked 2026-10-23 · decided 2026-10-23
- Built (RW4): from your first fight on Map 2 a swap window opens only when the incoming card scores at least 35% (and at least 2 points) above the deck card, by the stat budget (2A + H + skills). "As good or better in every stat" no longer counts on its own. Maps 0 and 1 and the forced teaching swaps keep today's 10% rule. The numbers are three named constants (SWAP_MUCH_BETTER_MARGIN, _MIN_GAIN, _FROM_MAP) so they can scale by rarity and collection score later.
  - 35% and +2 points (built)
  - 25%
  - 50%
- **Default:** 35% and +2 points (built)
- **Outcome:** Owner (10-23 17:34): "RW4-1 OKAY". 35% and +2 points, as built: from 2-1 a swap window opens only for a card at least 35% and 2 points above the deck card by the stat budget; Maps 0-1 and the teaching swaps keep the 10% rule.

**RW4-2. Where the NEW! tag for a revealed skill shows** · Decide · Skills · asked 2026-10-23 · decided 2026-10-23
- Built (RW4): the "Skill revealed" popup is off. When a map opens a hidden skill (Diurnal on Map 1, Tide on Map 2) its line in the card details wears a small NEW! tag, one skill at a time, until the next fight starts after you saw it. Crepuscular and Nocturnal never get a tag. Say if you would rather have the tag on the skill chip on the card face too, or on the Skills codex entry.
  - Card details only (built)
  - Also the card-face chip
  - Also the Skills codex
- **Default:** Card details only (built)
- **Outcome:** Default taken (DC3, 2026-10-23): Card details only, as built: a skill a map opens wears the NEW! tag on its line in the card details only, not on the card-face chip or the Skills codex.

**RW4-3. The B label on items (#14)** · Decide · Rewards · asked 2026-10-23 · decided 2026-10-23
- Built (RW4): items (Energy capsule, Raid Ticket, field-kit items) are bare icons in the first-clear box and on the results, explained on hover, and never carry a rank emblem. I read "don't show the B rank/unlock label on them" as the rank hex on item chips. The rank hex on a reward CARD (and after the card back in the "Possible drops" line) is unchanged. Tell me if the B you saw was on something else.
  - Items only, cards keep it (built)
  - Drop it from the drops line too
- **Default:** Items only, cards keep it (built)
- **Outcome:** Default taken (DC3, 2026-10-23): Items only, as built: items (Energy capsule, Raid Ticket, field-kit items) never carry the rank emblem; reward cards and the "Possible drops" line keep theirs.

**RW4-4. The egg: no toast, "You got an egg!" on the results** · Decide · Rewards · asked 2026-10-23 · decided 2026-10-23
- Built (RW4): finding an egg shows no toast. The results screen's egg chip reads "You got an egg!" and its hover says "An egg! You'll need a nest to hatch it!" until the Nest opens. The old long line that named the Map and the Nest is gone. If you meant the toast itself to say "You got an egg!", that is a one-line change.
  - No toast (built)
  - Short toast "You got an egg!"
- **Default:** No toast (built)
- **Outcome:** Default taken (DC3, 2026-10-23): No toast, as built: finding an egg shows no toast; the results screen's egg chip says "You got an egg!". A short toast is a one-line change if he wants one.

**EN2-1. Boomerang's new price: 3 -> 1.9** · Decide · Balance · asked 2026-10-23
- Your 13:16 #9: the throw is Speed 0 now (it had a hidden base of 1), so it costs less. Measured with the robust skill test (tools/skill_test_robust.js --mono --skills boomerang, 3,000 games a setup, seed 1): worth 1.71 before, 1.06 after (the return through the bramble is in the after). Built: the price drops by the same share, 3 x 1.06 / 1.71 = 1.9; Bananarang flies the same way and gets the same 1.9. Re-fit (tools/refit_pass_2026_10_21.js): Otter Centurion 3/6 -> 3/7, Howler Monkey 2/4 -> 2/5, Net Thrower 3/9 -> 3/10, Otter Royal Guard 4/9 -> 4/10. No card would go down, so none is held. The measured worth says the skill was already over-priced at 3 (1.71); pricing it at its worth would make it about 0.8.
  - 1.9 (built: the measured drop)
  - Price at the measured worth (about 0.8)
  - Keep 3
- **Default:** 1.9 (built: the measured drop)
- **Outcome:** Owner, 2026-10-23 19:30: "I agree with your EN series" / "Okay to the gameplay ones." As built / as recommended (default: 1.9 (built: the measured drop)).

**EN2-2. Fighting in the middle: a CPU lane preference (built), or a rule** · Decide · CPU · asked 2026-10-23
- Your 13:16 #2 / #11. Measured (tests/en2-cpu-side-sim-2026-10-23.js, Maps 0-5 skirmishes, 840 games a level; docs/balance/en2-cpu-side-*.json): the basic and smart CPUs had no left lean (37.7% left, 38.1% right of their units); the smartest leaned left (40.8% / 33.3%) because its ties always went left. Against a player who builds on one edge, the basic CPU already puts 54% of its units on that side. Built (modest): when the CPU has no kill or trade to make, its random slot is weighted to the middle three slots and to slots facing or beside your units; the smartest CPU gets a small middle bonus and breaks ties toward your units, else a coin. Result: the smartest's lean is gone (mean slot -0.18 -> +0.01), contested placements +1.5 to +3 points, the CPU's win rate down about 2 points. A stronger push would have to be a rule both sides feel, e.g. +1 Attack for units in the middle three slots, or the bramble taking half from the outer lanes.
  - The CPU preference only (built)
  - Add a middle-lane rule for both sides (+1 Attack in the middle three)
  - Stronger CPU weights
- **Default:** The CPU preference only (built)
- **Outcome:** Owner, 2026-10-23 19:30: "I agree with your EN series" / "Okay to the gameplay ones." As built / as recommended (default: The CPU preference only (built)).

**EN2-3. Headwind: which skills go off twice** · Decide · Battle rules · asked 2026-10-23
- Your 17:01 #15: "skills twice! Like arrow. (not passives though)". Built: a Headwind Flyer's active skills go off twice: the Speed-1 shots (Arrow, Fire / Ice Arrow, Twin Shot, Volley, the Bolts, Spitfire), Snipe, and its On Action skills (Archer). Every other trigger goes once now (On Hit, On Death, On Play, On Round Start, On Attack ...); before, every trigger doubled. Headwind has no cost entry, so nothing was re-priced.
  - Shots, Snipe and On Action (built)
  - Also its On Attack triggers
  - Every trigger too (as before)
- **Default:** Shots, Snipe and On Action (built)
- **Outcome:** Owner, 2026-10-23 19:30: "I agree with your EN series" / "Okay to the gameplay ones." As built / as recommended (default: Shots, Snipe and On Action (built)).

**EN2-4. Tailwind is Quick: and Quiet Contemplation** · Decide · Battle rules · asked 2026-10-23
- Your 17:34 #15: "Wind doesnt give flyers fast-forwards! Just quick." Built: a Tailwind Flyer swings at Speed 2 that round (as Quick), no extra turn; a Waiting Flyer still waits. Quiet Contemplation (Map 21's boss field) blocked the old Tailwind as an extra turn; Quick is no extra turn, so it no longer blocks it. The Tailwind spell (a card) still gives its extra turn. Gannet Cliffs before / after: see the EN2 CHANGELOG entry (docs/balance/en2-gannet-*.json).
  - Quiet Contemplation lets the wind's Quick through (built)
  - Quiet Contemplation stills it too
- **Default:** Quiet Contemplation lets the wind's Quick through (built)
- **Outcome:** Owner, 2026-10-23 19:30: "I agree with your EN series" / "Okay to the gameplay ones." As built / as recommended (default: Quiet Contemplation lets the wind's Quick through (built)).

**EN2-5. Where the Ironclaw Fiddler (the big-claw crab) is found** · Decide · Cards · asked 2026-10-23
- Your 13:16 #17. New card: Ironclaw Fiddler, Rare fiddler crab, Lumber 2, Wait 3, Tide, Bludgeon (its claw: each hit takes 1 Attack and breaks a skill), Armor 1; 7/12 by the budget. On play it sways side to side for 1 s while its one big claw clacks; its attack closes the claw on the target. Proposed: The Kelp Mangroves (Map 9) basic pack, with the Mangrove crabs (Rare opens at Map 5). It waits (awaitingSource) until the map's pool and obtain-map rows are added (canonical/map-pools.json, canonical/card-obtain-maps.json); the Map term then lifts it to 7/13. Pebble Beach (Map 2) is the crab beach, but Rare isn't on the road until Map 5: there it would be an Uncommon (7/11 by the budget). Art: placeholder, NightCafe prompt in docs/art/new-cards-2026-10-21-briefs.md.
  - The Kelp Mangroves basic pack, Rare
  - Pebble Beach as an Uncommon (re-priced)
  - A Kelp Mangroves skirmish reward
- **Default:** The Kelp Mangroves basic pack, Rare
- **Outcome:** Owner, 2026-10-23 19:30: "I agree with your EN series" / "Okay to the gameplay ones." As built / as recommended (default: The Kelp Mangroves basic pack, Rare).

**EN2-6. Swarm by Type: does the Type tree count?** · Decide · Battle rules · asked 2026-10-23
- Your 17:34 #18: "The swarm doesnt look at phyla, only type." Built: Swarm compares the Types a card lists (its archetypes), never its species or animal, so an Insect-species card without the Insect Type no longer counts for an Insect Swarm. The Type tree still counts: a Coral Reef unit counts for an Ocean Swarm (Coral Reef is Ocean). The hand's would-be numbers and the board follow the same rule.
  - Types and the Types above them (built)
  - Exactly the same Type only
- **Default:** Types and the Types above them (built)
- **Outcome:** Owner, 2026-10-23 19:30: "I agree with your EN series" / "Okay to the gameplay ones." As built / as recommended (default: Types and the Types above them (built)).

**MAP2-AP. Armor Piercing first appears on Map 2** · Decide · Content · asked 2026-10-23
- Owner, 2026-10-23 13:16: "Armor piercing: Which map? Map 2".
- **Outcome:** Map 2

**AR3-6. Apply the Group Dungeon SQL for 3-4 player online rooms? (say "apply it")** · Apply · Server · asked 2026-10-23
- supabase/proposed/20261023_coop_rooms_4p.sql (not applied). Live today, coop_rooms seats a host and ONE guest, so an online Group Dungeon room takes 2 players. The file adds seats for 4 (coop_room_members, RLS on), join_coop_room_v2 (friends of the host only, seats C, D, B; a rejoin keeps its seat), leave_coop_room, promote_coop_host (host migration recorded) and private room channels (only a room's members hear its topic). The game finds it by itself once applied. Checked on a throwaway local Postgres with stand-ins for Supabase's auth and realtime: applied twice, 4 joins, a 5th refused, a non-friend refused, an outsider can't send on the room's topic.
  - Apply it
  - Not yet
- **Default:** Not yet
- **Outcome:** Owner, 2026-10-24 03:12: "AR3-6: Apply it. 2-4 players." APPLIED live 2026-10-24 (migration 20261023_coop_rooms_4p). Player-count people symbols queued.

**AR3-1. Group Dungeon rows: 7 columns (3 + shared centre + 3)** · Decide · Dungeons · asked 2026-10-23 · decided 2026-10-23
- D49 drew 10 cells a row (4 left, 2 shared, 4 right). Built on the raid's board, which is 7 columns: each seat has 3 cells and the centre column is shared by the row's two seats. A 2-seat party (1-2 players) plays columns -3..0 only; the right half is blocked ground on both sides.
  - As built (7 columns, 1 shared)
  - 10 columns (4 + 2 shared + 4)
- **Default:** As built (7 columns, 1 shared)
- **Outcome:** Default taken (DC3, 2026-10-23): 7 columns, as built: the Group Dungeon uses the raid's board, 3 cells per seat and a shared centre column; D49's 10-column row is not built.

**AR3-2. Who sees the Group Dungeon** · Decide · Dungeons · asked 2026-10-23 · decided 2026-10-23
- The Dungeons tab now opens for every player past the tutorial, holding only the Group Dungeon (and the Spire once open). The daily dungeons stay hidden (TU2): no daily slots, no keys row and no key button for players. Admin Mode sees everything as before.
  - As built (after the tutorial)
  - Only after a map is cleared (say Map 3)
  - Admins only until it is tested live
- **Default:** As built (after the tutorial)
- **Outcome:** Default taken (DC3, 2026-10-23): After the tutorial, as built: the Dungeons tab opens for every player past the tutorial and holds the Group Dungeon (and the Spire once open); the daily dungeons stay hidden.

**AR3-3. Group Dungeon cost: 5 Energy a climb** · Decide · Dungeons · asked 2026-10-23 · decided 2026-10-23
- The design sets no cost. Built: each player pays 5 Energy when the climb starts, given back if the party clears no floor (as a lost Spire floor). No daily dungeon key (the keys are hidden with the daily dungeons).
  - As built (5 Energy, back if nothing cleared)
  - A dungeon key
  - Free
- **Default:** As built (5 Energy, back if nothing cleared)
- **Outcome:** Default taken (DC3, 2026-10-23): 5 Energy a climb, as built: each player pays 5 Energy when the climb starts, given back if the party clears no floor; no dungeon key.

**AR3-4. Group Dungeon rewards** · Decide · Rewards · asked 2026-10-23 · decided 2026-10-23
- Each player's own game pays each floor's chest: 40 / 55 / 70 / 120 Maple Leaves and 10 / 14 / 18 / 40 Magic Dust. Clearing the Matriarch offers a pick of 3 of the dungeon's own cards (the Salamander Pools' and the Matriarch's decks), once a day per player. D49's co-op-only card pool doesn't exist: those would be new cards.
  - As built
  - Design a co-op-only card pool
  - The pick once a week
- **Default:** As built
- **Outcome:** Default taken (DC3, 2026-10-23): As built: floor chests of 40 / 55 / 70 / 120 Maple Leaves and 10 / 14 / 18 / 40 Magic Dust, and a pick of 3 of the dungeon's own cards for clearing the Matriarch, once a day per player. No co-op-only card pool for now (those would be new cards, a later design).

**AR3-5. Group Dungeon cards fight at Level 1** · Decide · Dungeons · asked 2026-10-23 · decided 2026-10-23
- Every card fights at Level 1 (Standard, as Ranked Live, D74), so every player's game runs the very same fight from the plans alone. Your own levels would need each player's card stats sent and checked.
  - As built (Level 1)
  - Each player's own levels
- **Default:** As built (Level 1)
- **Outcome:** Default taken (DC3, 2026-10-23): Level 1, as built: every card in the Group Dungeon fights at Level 1, so every player's game runs the same fight.

**AR3-7. Party size counts CPU allies** · Decide · Dungeons · asked 2026-10-23 · decided 2026-10-23
- D49 scales the dungeon's Health x1 / x1.7 / x2.3 / x2.8 for 1-4 players. Built by seats on the board, CPU allies included: a solo player with a CPU ally fights two decks, as a duo does, so both get x1.7; a 4-seat board x2.8. CPU parties (tools/coop_sim_2026_10_23.js, 40 runs, each floor's rate among parties that reached it): 2 seats 95% / 82% / 52% / 38%; 4 seats 100% / 98% / 92% / 47%.
  - As built (seats)
  - Human players only
- **Default:** As built (seats)
- **Outcome:** Default taken (DC3, 2026-10-23): Seats, as built: the dungeon's Health scales by seats on the board, CPU allies included (solo + CPU ally x1.7, 4 seats x2.8).

**AR3-8. Group Dungeon placement: any free cell of your half** · Decide · Battle rules · asked 2026-10-23 · decided 2026-10-23
- A seat plays into any free cell of its own half (and the shared centre), not only beside a unit as in other open fights; the back-row seats play their row directly. A back-row unit steps up when the cell ahead empties (D49), into the front seat's half. What combat gives the party (draws, Bounty Lumber) goes to the round's lead seat, which rotates.
  - As built
  - The usual beside-a-unit rule
- **Default:** As built
- **Outcome:** Default taken (DC3, 2026-10-23): As built: a seat plays into any free cell of its half and the shared centre; back-row units step up when the cell ahead empties; combat gains go to the round's lead seat, which rotates.

**AR3-9. Group Dungeon board: its own screen for now** · Decide · UI · asked 2026-10-23 · decided 2026-10-23
- The fight is drawn on a co-op board of its own (the cave screen in docs/screens/ar3/), not on the animated battle board: each round's result appears when it lands, without hit animations. Porting it to the main battle board (animations, hover details) would be a follow-up package.
  - As built for now, port next
  - Keep its own board
- **Default:** As built for now, port next
- **Outcome:** Default taken (DC3, 2026-10-23): Its own board for now, as built: the Group Dungeon keeps its own co-op board without hit animations; porting it to the main battle board is a later package (docs/action-items.md, 10-23 17:34).

**FX4-1. The line of fire's name: Wildfire Front** · Decide · Battle rules · asked 2026-10-23 · decided 2026-10-23
- Your 11:11 answer on FX3-1: "Still do the line of fire thing ... all take 1 fire damage ... (Find a name for this field effect)". Built (FX4): the line of fire is its own field effect, Wildfire Front (rules.wildfire): from round 2, every round, a flame band crosses both front lines from left to right and each unit takes 1 fire as the band reaches it (fire-resistant units, Lava Waders wearers and Mountain Climbers are passed by). On 14-6 Jaguar Run (Savanna Reaches, was Scorching I) and 20-8 The Iron Cataphract (Sundered Peak, was Scorching III, which FX3 had already turned into Scorched Ground); one ground fire a fight, so neither has Scorched Ground or Scorching beside it. In Edit skirmish as "Wildfire Front". Its card borrows Scorching's picture until it has its own.
  - Wildfire Front
  - Grass Fire
  - Fire Line
- **Default:** Wildfire Front
- **Outcome:** Default taken (DC3, 2026-10-23): Wildfire Front, as built (he asked Claude to find the name): the line of fire is the field effect Wildfire Front, on 14-6 and 20-8.

**FX4-2. How often Wildfire Front burns** · Decide · Balance · asked 2026-10-23 · decided 2026-10-23
- Built: every round from round 2, 1 fire to every unit on both front lines (FX3's line as it was). On a full board that is 5 a side a round, more than Scorched Ground's 1 a side. Both sides take it, so it mostly shortens the fight and punishes low-Health swarms.
  - Every round (as built)
  - Every other round
  - Every 3rd round
- **Default:** Every round (as built)
- **Outcome:** Default taken (DC3, 2026-10-23): Every round, as built: from round 2 Wildfire Front burns every unit on both front lines for 1, every round.

**FX4-3. Scorched Ground's hit on its one unit: 1 or 2** · Decide · Balance · asked 2026-10-23 · decided 2026-10-23
- Your 11:11 answer on FX3-1: "it only hits one unit. It looks like the ground boils beneath the units chosen." Built: one random unit a side, 1 fire, every round from round 2 (your FX3 rule "1 for every turn ones"), shown as a lava pool boiling under the chosen card. Your other rule ("2 for single target") would make it 2, as the Eruption and Lava Tide are. Map 20's elite and boss fights and 22-7 carry it.
  - 1 (an every-round hazard, as built)
  - 2 (a single target)
  - The fight's own number again (elites 2, bosses 3)
- **Default:** 1 (an every-round hazard, as built)
- **Outcome:** Default taken (DC3, 2026-10-23): 1, as built: Scorched Ground hits one random unit a side for 1 fire every round from round 2.

**FX4-4. Lava Waders: stats, price and where it comes from** · Decide · Cards · asked 2026-10-23 · decided 2026-10-23
- Your 11:11 answer on FX3-3: "let's create a fire resistant boots equipment like lava waders that gives units Fire Resistance". Built: Lava Waders, Uncommon equipment, Lumber 1, +0/+3 and Fire Resistance (fire hits halved; the volcano's ground fires, Scorched Ground and Wildfire Front pass the wearer by). By formula (its grant counted as its skills, like the other Blacksmith pieces): N 15.88 at Level 1; 2A+H+S = 4, well under. Resist has no price of its own in canonical/skill-costs.json, so it counts the default 1. Source: the Blacksmith (2 Iron Shards, 1 Ember Core and a Basalt Boar, a Sundered Peak card; 300 Dust and 400 Leaves), because packs and skirmish rewards never give equipment today. Placeholder icon; NightCafe prompt in docs/art/new-cards-2026-10-21-briefs.md.
  - As built (+0/+3, Blacksmith)
  - +1/+2 instead
  - Rare, +0/+5
  - A volcano skirmish reward (equipment rewards to be allowed)
- **Default:** As built (+0/+3, Blacksmith)
- **Outcome:** Default taken (DC3, 2026-10-23): As built: Lava Waders, Uncommon equipment, Lumber 1, +0/+3 and Fire Resistance, made at the Blacksmith.

**BF11-1. 23 cards the new cap would cut down: held at their stats** · Decide · Balance · asked 2026-10-23 · decided 2026-10-23
- With cap 2 at 2×(N/3)², these cards (over budget before, kept as they were) now have a legal line, but it is lower than their stats, so the re-fit would cut them: alley-cat 1/8 → 1/6; colony 0/11 → 0/9; honey-badger-fury 2/9 → 1/7; chipmunk-hoarder 3/8 → 2/5; pyroclast-wyrm 5/17 → 3/12; otter-guard 4/8 → 3/6; tunnel-ant 2/9 → 2/8; beaver-lumberjack 4/4 → 2/2; sunfeather-scout 1/7 → 1/4; sunspire-choirmother 3/6 → 2/5; old-willow-of-the-ford 2/24 → 2/20; thornwood-palisade 0/16 → 0/12; the-contradiction 2/19 → 1/14; magma-wraith 1/9 → 1/6; lone-grey-wolf 4/15 → 1/3; puffball-bombardier 1/10 → 1/8; sheep 1/7 → 1/4; starfall-owl 5/26 → 2/11; fumarole-ibex 1/13 → 1/11; battlement-heron 1/14 → 1/10; ashmantle-fiend 5/22 → 4/17; truffle-piglet 3/11 → 2/8; krill-swarm 1/7 → 1/5. The biggest: Lone Grey Wolf 4/15 → 1/3 and Starfall Owl 5/26 → 2/11. They were held at their stats; the cure would usually be trimming a skill instead.
  - Hold them, trim skills per card later
  - Apply the formula's lines
  - Trim the biggest (Lone Grey Wolf, Starfall Owl, Pyroclast Wyrm) now
- **Default:** Hold them, trim skills per card later
- **Outcome:** Default taken (DC3, 2026-10-23): Hold them, as built: the 23 cards keep their stats; a later balance pass trims a skill per card instead of applying the formula's lower lines.

**EQ-1. How should equipment be damaged or removed: durability worn by hits and acid (recommended), or another design?** · Decide · Battle rules · asked 2026-10-23
- Owner (10-23 11:11): "New: How to deal damage to equipment. (They do not have 'health stats'.) If the opponent has many equipment on the field, they act as perma buffs (albeit activating only 1 turn later). I don't think this rule is fun: 'When an equipped creature dies, the equipment has 50% chance to be destroyed. If defeated by acid damage, the equipment is 100% destroyed'" The rule today (bramblewood-engine.js, eqDrop, package EQ 10-19): the quoted 50% / acid rule is not in the engine or the texts. When the wearer dies, the piece stays in its slot and the next unit played there picks it up (Codex: "it stays when its unit dies"). It goes to the graveyard only if its card has equip.breaks, or if the slot already holds a loose piece. A reviving unit keeps its piece. A loose piece cannot be hit (swings pass it to the bramble). The only answer is Disarm (Glintsnatch Magpie), which steals a piece. So equipment is close to a permanent buff, as you say. Alternatives. (A) Durability: each piece has 2-4 durability pips. It loses 1 each time its wearer takes a hit (or, for weapons, each swing) and breaks at 0. A dropped piece keeps its pips. Pros: no randomness, hitting the wearer is the counterplay, readable. Cons: a new number on every equipment card and in the budget. (B) Corrosion: acid hits and Corrode strip durability (or destroy a loose piece outright), and fire burns wooden pieces. Pros: gives acid its own job and uses existing statuses. Cons: alone it answers equipment only for acid decks. (C) A Sunder family next to Disarm: Sunder N (On Hit: the target's piece loses N durability, or breaks if it has none), Shatter (On Play: break the nearest loose enemy piece), and Demolisher also hits loose pieces. Pros: a deck-building answer. Cons: if few cards carry it, pieces stay permanent buffs. (D) Pieces drop and rust: when the wearer dies, the piece lies loose for 2 rounds, then rusts away unless a unit of its side picks it up; the killer's Disarm or Scavenge can claim it. Pros: keeps the drop-and-pick-up idea, ends permanent buffs. Cons: a timer to show on the board. Recommended: A with B folded in. Durability 3 by default (set per card), -1 each time the wearer is hit, -2 for an acid hit or each Corrode applied; dropped pieces keep their durability. Add C's Sunder to a few cards later.
  - Durability with acid / Corrode wear (A+B)
  - Durability only (A)
  - A Sunder / Shatter skill family (C)
  - Pieces drop and rust after 2 rounds (D)
  - Break on the wearer's death (equip.breaks for all)
- **Default:** Durability with acid / Corrode wear (A+B)
- **Outcome:** Owner, 2026-10-23 19:30: "I agree with your EN series" / "Okay to the gameplay ones." As built / as recommended (default: Durability with acid / Corrode wear (A+B)).

**SX-1. The armour konk is folded into the new armour ting** · Decide · Sound · asked 2026-10-23 · decided 2026-10-23
- Your #95: a target-modifier sound after the source's. Built (SX): every damage mark plays its own short cue 75 ms after the hit (armour ting, full-block ring, Shield thud, Shell tok, Sturdy thunk, stone clack, Resist / Rage / Scare muffle, Fragile crack, Weakness sting, Shock zap, Immune whiff). Armor already had the 10-16 konk ("the attacker hit metal"); two metal sounds on one hit blurred, so the ting carries a soft konk body and the separate konk now plays only in replays recorded before the marks existed.
  - As built (ting with a konk body)
  - Keep the separate konk as well
  - Ting only, no konk body
- **Default:** As built (ting with a konk body)
- **Outcome:** Claude's call (10-23, owner asked to settle the easy ones): As built (ting with a konk body), kept as built (the ting with a soft konk body).

**SX-2. Hero levels now need Materia: how much** · Decide · Hero · asked 2026-10-23 · decided 2026-10-23
- Each Hero level needs a third of its XP from Materia crafts (your H2 rule, built in SX). A Hero that only fights stalls at about two thirds of a level. Cost: Lv 20 needs 7 crafts (875 Dust), Lv 50 needs 44 (5,500), Lv 100 about 240 (30,000). Recommended: as built for now; add Materia XP from quests / raids if the pace feels slow.
  - As built (equal thirds)
  - A smaller Materia part (e.g. Battle 45%, Materia 20%, Either 35%)
  - More Materia XP sources (quests, raids)
- **Default:** As built (equal thirds)
- **Outcome:** Default taken (DC3, 2026-10-23): Equal thirds, as built: each Hero level needs a third of its XP from Materia crafts; more Materia XP sources (quests, raids) get added if the pace feels slow.

**SX-3. Existing Heroes: level kept, XP into it counted as Battle XP** · Decide · Hero · asked 2026-10-23 · decided 2026-10-23
- Saves had one XP pool. Built (SX): the level a Hero has is kept as its base (no lost levels or stat points), and the XP already into that level goes to the Battle pool (almost all Hero XP so far came from battles). Its Materia part starts empty.
  - As built
  - Also credit past Materia crafts (30 XP each) to the Materia part
- **Default:** As built
- **Outcome:** Claude's call (10-23, owner asked to settle the easy ones): As built, kept as built (existing Heroes keep their level and the XP into it counts as Battle XP).

**LEAD-1. Paired bosses with 2 leaders: which fights** · Decide · Maps · asked 2026-10-23 · decided 2026-10-23
- Your 01:03 #12: special bosses (e.g. twin-headed) can have 2 leaders. No fight in the data is a twin- or two-headed boss, and the Two-Headed Calf (Rare) is in no enemy deck. Built (LEAD): two named pairs lead with 2 cards, 24-8 The Magnate Duck (Magnate Duck + Iron Warden) and 23-8 Marshal Tuskwell (Marshal Tuskwell + War Elephant). The VS opener names both and the map panel shows both cards. Every other elite and boss has 1 leader.
  - As built (24-8 and 23-8)
  - Name other paired bosses
  - Make a real two-headed boss (e.g. a boss version of the Two-Headed Calf) for a later map
- **Default:** As built (24-8 and 23-8)
- **Outcome:** Claude's call (10-23, owner asked to settle the easy ones): As built (24-8 and 23-8), kept as built (the two named pairs (24-8 and 23-8) lead with 2 cards).

**LEAD-2. The battle rating counts an enemy leader at the enemy's level; it fights at its printed level** · Decide · Balance · asked 2026-10-23 · decided 2026-10-23
- The BR counts a leader twice, at the fight's enemy level, but the CPU's reserve leader plays at the card's printed level (as SK's skirmish leaders already did). A boss unit of high rarity therefore raises the BR by up to 50% while the fight gets only about 6 points harder for the DF ant deck. Built (LEAD): BR within 5% on 110 of 112 fights. To get there, decks lost a copy or two, 57 fights got a lower enemyLevel and 23 a smaller or bigger enemy bramble, which brought the win rates back (400 games a fight, 95 of 112 within 3 points). Two named exceptions: 20-R (an all-Common deck, BR 20 -> 22) and 20-A-3 (36 against 38).
  - As built
  - Count an enemy leader at the level it fights at (every Map 2+ skirmish's BR drops a little)
  - Make enemy leaders fight at the enemy's level (harder fights everywhere; needs a retune)
- **Default:** As built
- **Outcome:** Claude's call (10-23, owner asked to settle the easy ones): As built, kept as built (the BR counts a leader at the enemy level, held within 5% by the retune).

**LEAD-3. 11 fights where another card leads instead of the boss unit** · Decide · Maps · asked 2026-10-23 · decided 2026-10-23
- Your note: 'they can use any card as leader btw'. On 11 fights the boss unit as leader moved the DF ant deck's win rate by more than 8 points once the BR was held within 5% (e.g. 22-8 Rimeheart Colossus +28, 2-A-7 -28). There another deck card leads and the boss unit stays the highlighted card: 1-5 Compost Grub, 3-6 Mountain Goat Climber, 3-7 Peak Condor, 6-6 Marsh Wisp, 10-6 Great Barracuda, 11-9 Chamois Leaper, 14-8 Dust Hyena, 22-8 Gorge Wyrm, 2-A-7 Mayfly Dancer, 20-A-2 Cinder Stoker, 20-A-6 Ashbone Ghoul. If you want the boss unit to lead on these too, one of BR or the win rate moves.
  - As built
  - The boss unit leads everywhere; let the BR rise on these 11
  - The boss unit leads everywhere; let the win rate move on these 11
- **Default:** As built
- **Outcome:** Claude's call (10-23, owner asked to settle the easy ones): As built, kept as built (another deck card leads on the 11 fights (he said any card can lead)).

**LEAD-4. The CPU never saves Lumber for its leader, so costly leaders rarely come out** · Decide · Battle · asked 2026-10-23 · decided 2026-10-23
- The CPU saves Lumber only for cards in its hand, never for its reserve leader, so costly leaders (Marshal Tuskwell 4, the Magnate Duck 4, Gorge Wyrm 3) never came out in 60 test fights, while cheap ones came out in most. Making the CPU save for its leader makes many fights harder and needs a road retune. Recommended: leave it now; revisit with DF-1's retune.
  - Leave it (as built)
  - The CPU saves Lumber for its leader (then retune)
  - Enemy leaders cost no Lumber
- **Default:** Leave it (as built)
- **Outcome:** Default taken (DC3, 2026-10-23): Leave it, as built: the CPU doesn't save Lumber for its reserve leader, so costly enemy leaders rarely come out; revisited with the difficulty retune (DF-1b, DF-3).

**LEAD-5. Skirmish leaders: from Map 2 (SK) or from Map 11 (your 01:03 note)** · Decide · Maps · asked 2026-10-23 · decided 2026-10-23
- Your 01:03 #12 says normal skirmishes past Map 10 should have leaders. Since SK (your 09:52 call) every skirmish from Map 2 already leads with its highlighted card, unshown, so all 81 skirmishes on Maps 11+ have one. Built: SK's Map 2 rule is unchanged. Elites and above now show their leader on the VS opener; skirmishes don't.
  - As built (Map 2 on, unshown)
  - Only from Map 11
  - Show skirmish leaders too
- **Default:** As built (Map 2 on, unshown)
- **Outcome:** Claude's call (10-23, owner asked to settle the easy ones): As built (Map 2 on, unshown), kept as built (skirmish leaders from Map 2, unshown (his 09:52 SK call)).

**UI4-1. Deck slot prices** · Decide · Camp · asked 2026-10-23 · decided 2026-10-23
- Built (UI4, your 01:03 note 5): a new player has 1 deck slot; more are bought in order in the Camp (under My Decks) or the Tavern's Upgrades tab. Slot 2: 150 Magic Dust + 150 Maple Leaves. Slot 3: 300 Dust + 250 Leaves. Slot 4 (Map 15 cleared): 600 Dust + 350 Leaves + 1 River Pearl + 1 Tempering Stone (Map 15's boss pays both on its first clear). Slot 5 (Map 21 cleared): 900 Dust + 450 Leaves + 1 Ember Core (from the Map 20 raid / world bosses). Slot 6 (Map 27): 1200 + 600 + 2 Ember Cores. Slot 7 (Map 33): 1500 + 750 + 1 Strange Materia + 1 Ember Core. Maps 27 and 33 are still Reserved, so slots 6-7 wait for them. Map 21's own fights pay only Iron Shards, so slot 5 asks for the Ember Core the road pays just before it. Existing saves keep every deck they have (their slots start at their deck count); a deck pulled from the cloud raises the slots the same way.
  - As built
  - Cheaper (halve slots 2-3)
  - Map 21's slot pays Iron Shards instead of an Ember Core
  - No cap past slot 7 (keep adding at the slot 7 price)
- **Default:** As built
- **Outcome:** Owner (10-23 11:11): "Use some placeholder" and "For all these upgrade costs and forge costs, put them in the master hub and let them be editable." The deck slot prices stay as built as placeholders, and every upgrade and Forge cost (deck slots included) becomes editable in the master hub. To build in package HUB2.

**UI4-2. Swarm in the hand's blue numbers: 4 or 5 for an Ant Scout with 3 ants out** · Decide · Battle · asked 2026-10-23 · decided 2026-10-23
- Built (UI4, your 01:57 note 11): a hand card shows in blue the Attack / Health it would have if played now, worked out by the engine's own rules (engine previewPlayStats). The engine's Swarm counts the OTHER allies that share a type, so an Ant Scout (1 Attack) with 3 ants out shows 1 + 3 = 4; your example said 1 + (3+1) x 1 = 5, which would count the scout itself. Also: a card whose skill depends on where it stands (Formation, Sociable, Lone Wolf) is previewed in the slot a plain play takes (the centre first, then the right end).
  - As built (4: other allies only, as fights work today)
  - Count the card itself too (a rule change for every Swarm card in fights)
- **Default:** As built (4: other allies only, as fights work today)
- **Outcome:** Owner (10-23 11:11): "Okay good catch. you're right." As built: Swarm counts the other allies only, so the Ant Scout with 3 ants out shows 4; no rule change.

**UI4-3. Which faction packs open the several-swap window** · Decide · Deck · asked 2026-10-23 · decided 2026-10-23
- Built (UI4, your 01:03 note 3): a faction pack's cards come as one swap window, a row per card (your deck card on the left, the pack card on the right, a tick each, Swap N). A row only appears where a weak deck card (starter, baby, tutorial card) may go and the pack card scores higher. The first faction pack (the one after 0-2) always shows it; every later faction pack counts as one of the 10 swap offers a player ever gets.
  - As built (every faction pack, first one free)
  - Only the 0-2 pack
  - Every faction pack, never counted
- **Default:** As built (every faction pack, first one free)
- **Outcome:** Owner (10-23 11:11): "No, I think just 1 row, but there's up to 3 cards on the right (like last time). After pressing Swap and 0.8s, you can press "Swap Again". The right card shifts to "selecting" another card. (The left card that was swapped out is also out of the equation)" Not the rows design: the swap window has one row, your deck card on the left and up to 3 pack cards on the right; 0.8 s after Swap a "Swap Again" button appears, the right side moves on to select another card, and the deck card already swapped out leaves the choice. To build in package FX4.

**FX3-1. What Scorched Ground's line of fire touches** · Decide · Balance · asked 2026-10-23 · decided 2026-10-23
- Built (FX3, your 01:57 note 3): from round 2, every round, a line of fire crosses the board from left to right and every unit on both front lines takes 1 fire as it passes (fire-resistant units and Mountain Climbers are spared; a raid's back rows are not crossed). It used to burn one random unit a side for the fight's number (2 / 3 / 5). On a full board that is more damage in total than before (5 a side against 2-5 on one unit), spread thin.
  - As built (every front unit, 1)
  - One random unit a side, 1 (the line is only the look)
  - Every front unit, 1, every other round
- **Default:** As built (every front unit, 1)
- **Outcome:** Owner (10-23 11:11): "Okay, it only hits one unit. It looks like the ground boils beneath the units chosen. Still do the line of fire thing - fx in master hub - in that case, all take 1 fire damage. It doing damage one by one as the line passes them feels very interactive too. (Find a name for this field effect)" Scorched Ground goes back to hitting one unit, drawn as the ground boiling beneath it; the line of fire becomes its own field effect (its fx in the master hub, a new name to find) where every unit takes 1 fire damage one by one as the line passes. To build in package FX4.

**FX3-2. One ground fire a fight: Scorched Ground replaces Scorching where both were on** · Decide · Balance · asked 2026-10-23 · decided 2026-10-23
- The "hitting twice" was two effects, not one counted twice: Map 20's six elite and boss fights (and 22-7) set Scorching III themselves, and every big fight on a volcano map also gets Scorched Ground automatically, so two round-start burns hit the same units in the same upkeep with the same 🔥 number. Built: where both would be on, only Scorched Ground's line of fire stays (fightRules). This also settles DF-4's "cut Scorching III to I" for those fights. Map 20, ant deck at Lv 8, 40 games: 20-5 7.5 -> 62.5%, 20-6 0 -> 12.5%, 20-7 2.5 -> 92.5%, 20-8 0 -> 32.5%, 20-9 2.5 -> 42.5%, 20-10 2.5 -> 35%.
  - As built (Scorched Ground only)
  - Scorching only (no automatic Scorched Ground there)
  - Keep both (two burns a round)
- **Default:** As built (Scorched Ground only)
- **Outcome:** Owner (10-23 11:11): "Okay, if you are sure. But leave a small gap between the field effect damage animations so I can see the two numbers. When the field effect is active, it aligns straight, then shines abit, before moving back when the effect is about to complete." As built (Scorched Ground only where both were on), plus two visual changes: a small gap between consecutive field-effect damage animations so both numbers read, and the active field-effect card straightens, shines a little, and tilts back as the effect completes. To build in package FX4.

**FX3-3. Which volcano hazards count as single-target (2) and rare (3)** · Decide · Balance · asked 2026-10-23 · decided 2026-10-23
- Built by your rule (every round 1, single target 2, rare single target up to 3): Lava Tide (a column, so one unit a side) 1 -> 2; the Eruption (one unit a side) 1 -> 2, and a fight's own number up to 3 (boss and miniboss fights on the volcano maps: 3; the world bosses had 5, now 3). Together, 3 units a side over rounds 2-20: very low 0.11, low 0.45, medium 0.68, rising 0.97, high 1.01 a unit a round; the most one unit took in one round is 5 (a comet, an Eruption and a Lava Tide at once; 6 with a boss's 3).
  - As built
  - Lava Tide 1 (a column counts as an area)
  - Eruption 2 everywhere (no 3)
  - Cap one unit's volcano damage at 3 a round
- **Default:** As built
- **Outcome:** Owner (10-23 11:11): "Still too much damage. Let Lava Tide be 50%. (You're supposed to build a fire resistant deck - but i don't want to force it. Also, let's create a fire resistant boots equipment like lava waders that gives units Fire Resistance)" Volcano damage is still too high: Lava Tide drops to 50% of its as-built strength, and a new equipment, Lava Waders (boots that grant Fire Resistance), gives non-fire decks an answer without forcing one. To build in package FX4.

**EN-1. Cards with no legal line after EN, kept as they are** · Decide · Balance · asked 2026-10-23 · decided 2026-10-23
- The re-fit (tools/refit_pass_2026_10_21.js) found no stats that fit both caps for two cards, so they keep their stats (listed in docs/balance/human-pass-1-flagged-2026-10-21.json): the Magnate Duck 1/22 (the only King: Armor 3, Midas 3, Bounty 3, Swipe 2, Hoard 3, King; S 23.9 against cap 2's (N/3)^2 = 247: S x S alone is 571) and the Muskrat Lodgekeeper 3/13 (Bulwark 1 at 8 + Tide). Your note said not to make the Duck 1/1.
  - Keep them as they are (named exceptions)
  - Floor them (--floor: 1/1)
  - Trim a skill on each (e.g. the Duck's Bounty 3)
- **Default:** Keep them as they are (named exceptions)
- **Outcome:** Owner (10-23 11:11): "Those 2 cards have too many skills or at too high number. Trim. For the muskrat, just bulwark 1 and Tide is sufficient." Not named exceptions: trim both cards until they fit; the Muskrat Lodgekeeper keeps only Bulwark 1 and Tide, the Magnate Duck loses skills or skill numbers. To build in package BF11. Built (BF11): Magnate Duck loses Swipe, Armor 3 → 1, Bounty 3 → 1 (2/34); Muskrat Lodgekeeper (Tide, Bulwark 1) fits at 2/10.

**EN-2. Bulwark N's price (8 a point) and the Ancient Sloth Titan** · Decide · Balance · asked 2026-10-23 · decided 2026-10-23
- Bulwark N now raises two 0/4N shields, priced by what it raises: 2 x 4N Health = 8 a point (it was 1, half-scale, for the old bramble armour). The Ancient Sloth Titan (Bulwark 2, S 16) re-fits 4/39 -> 1/14, because cap 2 (S x S) bites; with Bulwark 1 it would be about 2/30. The Muskrat Lodgekeeper (Bulwark 1) has no legal line (EN-1).
  - As built (8 a point; Titan 1/14 + two 0/8 shields)
  - Titan to Bulwark 1 and re-fit
  - Price the shields' Health at half (4 a point)
- **Default:** As built (8 a point; Titan 1/14 + two 0/8 shields)
- **Outcome:** Owner (10-23 11:11): "Bulwark should be scored only for 6, since its easily exploitable by the opponent." Bulwark N is priced 6 a point (not 8), since the opponent can exploit the shields; the Bulwark cards (the Ancient Sloth Titan) re-fit on that price. To build in package BF11. Built (BF11): Bulwark 6 a point.

**EN-3. Bulwark's shields: "vanguard" read as the front line** · Decide · Battle rules · asked 2026-10-23 · decided 2026-10-23
- Your 01:57 note: "summons 2 bulwark shields somewhere - vanguard and 4*N HP". The Vanguard skill acts only on the opening hand and the first card played, so a token would gain nothing from it. Built: the shields stand in the vanguard, the free front-row slots nearest the Bulwark unit, as 0/4N Structures with no skill.
  - As built (front row, no skill)
  - Give the shields Guardian
  - Give the shields Taunt
- **Default:** As built (front row, no skill)
- **Outcome:** Owner (10-23 11:11): "oh sorry, i meant guardian!" His "vanguard" meant Guardian: the Bulwark shields get Guardian (the second option). To build in package FX4.

**EN-4. The Coffer Mimic: Thorns 4 at 1 Lumber breaks cap 2** · Decide · Cards · asked 2026-10-23 · decided 2026-10-23
- New card (01:57 note 5): Coffer Mimic, a treasure chest in the Map 8 caves (m4 pool, basic pack), Structure, Shapeshifter (a Changeling for Structures only), Thorns 4, Lumber 1, Wait 1. By formula at Level 1: Uncommon N 18.9, S 10.9 (Thorns 4 x 2.7 + 0.1), so Health 8 (Common would be 6). Cap 2 (S x S 118.8 against (N/3)^2 39.8) cannot hold at any rarity with Thorns 4 at this cost (even Legendary is 76). Art: placeholder 🧰, NightCafe prompt in docs/art/new-cards-2026-10-21-briefs.md.
  - Keep: Uncommon 0/8, a named exception
  - Thorns 2 (fits cap 2 better)
  - Lumber 2
- **Default:** Keep: Uncommon 0/8, a named exception
- **Outcome:** Owner (10-23 11:11): "Thorns 2 Wait, why is thorns so expensive, at 1 per 2.7...Thorn 1 is roughly worse than Attack +1. So it must be less than 2. Balance it based on this assumption. Im also starting to think N/3 ^2 is too restrictive. Maybe 2*(N/3)^2 since we have A*H + S*|S|." The Coffer Mimic gets Thorns 2; Thorns is repriced under 2 a point (Thorns 1 is worth less than +1 Attack); cap 2 loosens from (N/3)^2 to 2*(N/3)^2. To build in package BF11. Built (BF11): Thorns 1.25 a point (measured), Coffer Mimic Thorns 2, cap 2 = 2×(N/3)²; 160 cards re-fitted, 23 held (BF11-1).

**EN-5. Backstab's conditions and its price (0.6 a point, an estimate)** · Decide · Balance · asked 2026-10-23 · decided 2026-10-23
- Built (D21): +N when the target is Blind, Stunned, Frozen, Asleep, Confused, Tipsy, Staggered, Paralyzed, Bound, Webbed or stone, or would swing blind in the dark while the attacker sees. Not included: a target still Waiting, a Shocked or Exposed target (they take more damage but fight as well). Price 0.6 a point (was 1.5 half-scale for the side rule), not measured: tools/skill_test_robust.js --skills backstab would measure it.
  - As built
  - Also when the target is still Waiting
  - Measure it before cards change
- **Default:** As built
- **Outcome:** Owner (10-23 11:11): "Target waiting, shocked and exposed would count I think." Backstab also triggers on a target that is still Waiting, Shocked or Exposed. To build in package FX4.

**EN-6. Which cards are baby-like (Fodder at Level 1)** · Decide · Cards · asked 2026-10-23 · decided 2026-10-23
- Built (EV-6): Stem from Level 1 on 23 cards picked by name: Terrier Pup, Snapper Hatchling, Bear Cub, Fox Kit, Fire Drake Hatchling, Kraken Spawnling, Duckling Squadron, Phoenix Fledgling, Otter Kit, Duckling, Cobalt Fledgling, Sparrow Chick, Rabbit Kit, Two-Headed Calf, Caiman Hatchling, Shallows Fry, Baby Bat, Baby Horned Capybara, Truffle Piglet, Harp Seal Pup, Musk Ox Calf, Greyplume Fledgling, Fawn Scout. Left out: Bramble Sprout (a plant), the eggs (they keep Stem / Chrysalis as before). Stats not re-fitted (Stem only matters under an Evomax evolute).
  - Keep this list
  - Name others to add or drop
- **Default:** Keep this list
- **Outcome:** Owner (10-23 11:11): "OKAY." The baby-like list (23 cards with Fodder at Level 1) stays as built.

**EN-7. How fast the volcano climbs back after an eruption** · Decide · Balance · asked 2026-10-23 · decided 2026-10-23
- Built (FX2-1): Very Low the round after an Eruption, then one level a round back to its own (a High volcano: Very Low, Low, Medium, Even, High). The comets still fall for the 3 rounds after the Eruption.
  - As built (one level a round)
  - One level every 2 rounds
  - Very Low until the comets end, then one level a round
- **Default:** As built (one level a round)
- **Outcome:** Owner (10-23 11:11): "OKAY" As built: the volcano climbs back one level a round after an Eruption.

**EN-8. Fog of War: does a fogged unit stop the CPU's targeted skills too?** · Decide · Battle rules · asked 2026-10-23 · decided 2026-10-23
- Built (FOG1): the CPU's choices (where and what to play, its hazards, fields and kill checks) read only what its fog shows. Swings, arrows and other auto-targeted skills still reach fogged units on both sides, so your units hit fogged enemies as before. The other reading: a CPU unit's random-target skills skip your fogged units (and the same for yours).
  - As built (fog limits choices, not rules)
  - Fogged units cannot be targeted by skills of the side that cannot see them
- **Default:** As built (fog limits choices, not rules)
- **Outcome:** Owner (10-23 11:11): "No, Fog doesn't change mechanics. Just information" As built: fog limits what a side knows and chooses, never what skills can reach.

**EB-1. Your real deck after T-2: the sturdier top-up (as built), or a new set of sturdy starter cards** · Decide · Tutorial · asked 2026-10-23 · decided 2026-10-23
- Your 01:57 note 1: the Base trainees stay weak, so the deck after T-2 must be stronger. Built: the baby filler (Honey Bee, Silver Minnow, Sparrow Chick) no longer joins the real deck, and the deck is topped up, one copy each, with the sturdier cards first: River Carp 2/10, Burrow Rabbit 2/10, Duck Paddler 2/10, Farm Dog 2/8, Chipmunk Forager 1/8, Otter Kit, Meadow Frog, then the old trainees (STARTER_CFG_DEFAULT.starterTopUp). Your side's list and the shared list (the 8 cards T-1 shows) stay. The limit: only about 7 vanilla cards of that size exist that no skirmish pays on its first clear, so about half the deck is still trainees (3/3s at Level 0). The live tutorial config also holds T-2's rewards (rewards2): Hummingbirds get the Crimson-Wing Recruit (3/1), Both the Riverwing Envoy (1/6); they would be sturdier cards too, but the live row wins until you republish it. Measured with the live lists (docs/balance/eb-2026-10-23.json): Map 0 78/58/37/20% before, 94/81/64/42% after (with the bramble and level changes in EB-2 and EB-3).
  - As built (sturdier top-up, filler out)
  - Add a set of new sturdy vanilla starter cards (about 2/8, one per role) and build the real deck from them
  - As built, and make T-2's rewards sturdier in the tutorial editor
- **Default:** As built (sturdier top-up, filler out)
- **Outcome:** Owner (10-23 11:11): "OKAY, but 1x each weak one should stay in the deck for variety. Remove Sparrow Chick. That's for Gannet Cliffs onwards." The sturdier top-up stays, but one copy of each weak trainee card stays in the real deck for variety; the Sparrow Chick leaves the starting cards (it belongs to Gannet Cliffs, Map 3, onwards). To build in package FX4.

**EB-2. Map 1 retuned: plain brambles and smaller ones on 1-1 to 1-4, mixed decks** · Decide · Balance · asked 2026-10-23 · decided 2026-10-23
- A fresh player's real deck won 6-9% of Map 1 (ant deck 45-62%, reference deck 0-12%, DF). The deciding factor is 2-Attack trades: the Hedgerow Burrow gave every enemy unit +1 Health, so a 2/8 survived one more hit than yours. Built: 1-1 to 1-4 defend a plain bramble (Health 5 / 6 / 7 / 6, Shield 1), the Baron keeps the Plains Terrace (+1 Attack to the first unit) at 6 Health + 2 Shield; the decks mix Map 1's 2/8 commons with Harvest Mouse, Meadow Rabbit, Cottontail and Ant Scout (Map 1's pool 'special'), 20 cards each, reward cards kept. Real deck, mean of the three sides, before -> after (target): 1-1 5.7 -> 83.7 (90), 1-2 7.3 -> 74.7 (80), 1-3 9.3 -> 74 (70), 1-4 6 -> 55.3 (60), 1-5 6 -> 39.3 (40). The reference deck now wins 88 / 78 / 78 / 57 / 53%, the ant deck 98 / 90 / 75 / 75 / 65% (40 games). The Hedgerow Burrow is on no Map 1 fight now.
  - As built (no Burrow on Map 1)
  - Put the Burrow back on the Baron (1-5) with an easier deck
  - Retune Map 1 against the reference deck instead
- **Default:** As built (no Burrow on Map 1)
- **Outcome:** Owner (10-23 11:11): "OKAY" As built: Map 1 has plain brambles and mixed decks, no Hedgerow Burrow.

**EB-3. The enemy at Level 0 on Map 0, rising to half Level 1 on Map 1; the fight panel still shows printed stats** · Decide · Balance · asked 2026-10-23 · decided 2026-10-23
- Your note: 'at Map 0 the units that are lvl 0 remain 0. Map 1, some of them can be lvl 1'. Your starting copies are Level 0, so the enemy's are now too: every Map 0 enemy card fights at Level 0 even when its own level is 1 (a Chipmunk Skirmisher 2/7, not 2/8), and on Map 1 a share of the copies is Level 1: 0, 25, 25, 50, 50% by the fight's place (EARLY_ENEMY_LEVEL; Map 2 on is Level 1 as before; the skirmish editor's Enemy level still wins). The fight panel's deck tiles still show the printed stats (2/8) while the fight plays the Level 0 ones; your own Camp tiles show your copies' level.
  - As built, and show the level's stats on the panel's tiles (a small UI package)
  - As built, leave the panel
  - Back to printed on Map 0 and Level 1 on Map 1
- **Default:** As built, and show the level's stats on the panel's tiles (a small UI package)
- **Outcome:** Owner (10-23 11:11): "OKAY ill rebalance Map 0-2" As built (Level 0 enemies on Map 0, half Level 1 on Map 1), and the owner rebalances Maps 0-2 himself. The default's small UI part (the fight panel's tiles show the level's stats) is to build in a later package.

**EB-4. Items: 2% per Energy of the fight, 3 a day: which Energy, and which items count** · Decide · Items · asked 2026-10-23 · decided 2026-10-23
- Your 01:57 note 8. Built: a Conquest win you played rolls 2% per Energy the fight cost you (nodeEnergyCost: Map 1's fights 1-2 Energy = 2-4%, Map 4 4 Energy = 8%, Map 10 about 7 = 14%, a boss double), and at most 3 items a day come this way; a free fight (Sweep, admin jump, cleared Spire floor) rolls nothing. Was: the day's first 3 Conquest wins each brought an item, sure. Items from A+ notices, finished weekly tiers and item-granting bosses still come on top and don't count against the 3. RW3's card drops use the fight kind's tier instead (a skirmish is 1 Energy there, whatever the map). The results tooltip still says 'your first 3 Conquest wins'; its wording is package UI4's.
  - As built (the Energy the fight cost; fight drops only)
  - Use the kind's tier like card drops (a skirmish 2%, an elite 4%, a boss 6%)
  - Count every item source against the 3 a day
- **Default:** As built (the Energy the fight cost; fight drops only)
- **Outcome:** Owner (10-23 11:11): "OKAY" As built: items roll 2% per Energy the fight cost, fight drops only, 3 a day.

**EB-5. Energy capsules: 8 Energy, a first-clear reward every three maps** · Decide · Rewards · asked 2026-10-23 · decided 2026-10-23
- Your 01:57 note 9. Built: a capsule gives 8 Energy (was 20) and is a first-clear reward token (the 🔋 placeholder, editable in Edit rewards) on 1-3, 2-1, 4-2, 6-3, 9-3, 12-3, 15-3, 18-3, 21-3 and 24-3: 10 capsules, 80 Energy over the road. 2-1's replaces the old 'first win on Map 2' capsule (a save that had it is not paid twice). The item tokens (capsule, Raid Ticket) now come on top of a fight's card reward and card drop; before, a token stood in for an elite's track card and shut off the skirmish's drop. A capsule already in a save gives 8 when used.
  - As built
  - More often (every other map)
  - Bigger capsules late (8 early, 15 from Map 12)
- **Default:** As built
- **Outcome:** Owner (10-23 11:11): "OKAY" As built: capsules give 8 Energy, a first-clear reward every three maps.

**EB-6. Map 0's brambles: plain on 0-1 to 0-3, 0-3 bigger, 0-4 smaller** · Decide · Balance · asked 2026-10-23 · decided 2026-10-23
- Built (your note: no-effect brambles in T-1, T-2 and Map 0, 'except maybe the last skirmish of Map 0, where it gives +1 attack to the first guy'): 0-2 and 0-3 lost the Outskirts Watchtower and T-2 its rival's, 0-4 keeps the Plains Terrace (+1 Attack to the first unit). Your bramble starts above the enemy's Health + Shield + 3 in T-1, T-2 and on Maps 0-1 (T-1 8 against 5, T-2 9 against 6; on Maps 0-1 your 15 is already higher). With the Level 0 enemy (EB-3), 0-3 was 76% against a 60% target, so its base bramble went from 7 to 12 Health, and 0-4 (20%, target 45%) from 8 to 5. Real deck, before -> after: 0-1 78 -> 94, 0-2 58 -> 81, 0-3 37 -> 64, 0-4 20 -> 42; T-1 89 -> 95, T-2 28 -> 78.
  - As built
  - Keep 0-3 and 0-4 at their old Health (0-3 then about 76%, 0-4 about 25%)
  - Make 0-4 plain too (about 42% at its old 8 Health)
- **Default:** As built
- **Outcome:** Claude's call (10-23, owner asked to settle the easy ones): As built, kept as built (Map 0's plain brambles; he rebalances Maps 0-2 himself (EB-3)).

**DF-1. Difficulty doesn't climb: from Map 16 the road gets easier, not harder** · Decide · Balance · asked 2026-10-23 · decided 2026-10-23
- Measured on all 179 fights of Maps 0-24 (docs/balance/df-2026-10-23.json): the road gets easier from Map 16, not harder. The ant deck wins 64-74% of skirmishes on Maps 0-15 but 88-96% on Maps 16-24; a collected deck 81%. Causes: your level climbs 1 -> 8 between Maps 10 and 16 while the enemy's climbs 2 -> 3.2; the level curve is stepped; and every map's targets restart at 90% -> 40%. A trial 'pace' curve (the enemy 0.5-2.5 levels under your Forge cap) lowers Maps 16-24 skirmishes to 88% (ant) / 73% (collected). Recommended: the pace curve, plus DF-3's boons, plus targets that drift down across maps (first skirmish 90% on Map 1 to about 80% on Map 24), retuned against the ant and collected decks.
  - The pace enemy curve, plus DF-3's selfish effects, plus road targets that drift down across maps (each map's first skirmish 90% on Map 1 to about 80% on Map 24), retuned against the ant and collected decks
  - The pace enemy curve only
  - No level change: get the climb from DF-3 and from retuning each fight against the ant and collected decks
  - Leave it
- **Default:** The pace enemy curve, plus DF-3's selfish effects, plus road targets that drift down across maps (each map's first skirmish 90% on Map 1 to about 80% on Map 24), retuned against the ant and collected decks
- **Outcome:** Owner (10-23 17:34): "Ill evaluate this when my new account progresses to that point. Map MUST absolutely contribute at 0.2* per Map. In the backend, I think you define Map as the reward source. But for Pack rewards - what source do you select? If its a Pack reward, select the first Map it appears (along the main line, not submaps). 20*0.2=4, a reasonable bonus. This may be enough to balance stronger maps and also make them appealing." Two rules for the stat budget: (1) the Map term is 0.2 per map (bramblewood-budget.js has perMap 0.1 since BF6 halved the coefficients, so it goes back to 0.2: a Map 20 card gets +4 N); (2) a pack card's map is the first main-line map it appears on, never a submap (today cardObtainMap uses the map where its pack goes on sale). New work: a balance package sets perMap 0.2, changes the pack rule in cardObtainMap, regenerates canonical/card-obtain-maps.json and re-fits the cards (docs/action-items.md, 10-23 17:34). Which climb fix goes in (the pace curve or another option) waits for his own play-through: DF-1b.

**DF-1b. When your new account reaches Maps 16-24: does the road still get easier, and which climb fix goes in?** · Decide · Balance · asked 2026-10-23
- Split from DF-1 (DC3). Owner (10-23 17:34): "Ill evaluate this when my new account progresses to that point." Measured (docs/balance/df-2026-10-23.json): the ant deck wins 64-74% of skirmishes on Maps 0-15 but 88-96% on Maps 16-24, because the player's level climbs 1 -> 8 between Maps 10 and 16 while the enemy's climbs 2 -> 3.2. DF-2 (Base cards stop at Lv 4) and DF-3 (selfish boons from Map 5) are approved and change the curve; DF-1's Map rule (0.2 per map, pack cards from their first main-line map) is recorded on DF-1. Left for his play-through: whether the enemy's levels also follow a 'pace' curve (0.5-2.5 levels under your Forge cap), with road targets that drift down across maps (first skirmish 90% on Map 1 to about 80% on Map 24).
  - The pace enemy curve plus drifting road targets (recommended)
  - The pace enemy curve only
  - No level change: DF-2, DF-3 and per-fight retunes are enough
  - Leave it
- **Default:** The pace enemy curve plus drifting road targets (recommended)
- **Outcome:** Owner, 2026-10-25 17:53: "road should ROUGHLY always get harder. we can't always achieve this. at the most, we hope to be roughly AS difficult as the previous map while teaching something. I would say, as long the error bars are about +-5% for 1 sigma, that's actually ideal. +10% is acceptable. +15% is less liked, but okay. +-20% is starting to be unacceptable" Recorded as the road tolerance in docs/evaluation-protocol.md.

**DF-2. Levels gate by map, not by resources; Base decks never need replacing** · Decide · Balance · asked 2026-10-23 · decided 2026-10-23
- Model in docs/balance/df-2026-10-23.json: every deck reaches the Forge cap on the map that opens it (Lv 3 at Map 11, Lv 8 at Map 16), light or binge player alike, so levels gate by map, not by resources. What holds decks back is duplicates outside Base (about 56 repeat fights for one more copy of a common), so the strongest deck is a cheap Base synergy deck that never needs replacing. Recommended: Base cards stop at Lv 4 and pay full Forge cost; a fight's own first-clear card drops 10% a repeat, so 4-copy decks form by about Maps 10-15.
  - Base cards stop at Lv 4 and pay full Forge cost (x1); a fight's own first-clear card drops 10% a repeat (was 3% x its rarity share), so 4-copy decks form by about Map 10-15
  - Base cards stop at Lv 4 only
  - Slow the Forge instead: the Ember Forge (Map 16) caps at Lv 6, Lv 8 from Map 21
  - Leave levelling as is
- **Default:** Base cards stop at Lv 4 and pay full Forge cost (x1); a fight's own first-clear card drops 10% a repeat (was 3% x its rarity share), so 4-copy decks form by about Map 10-15
- **Outcome:** Owner (10-23 17:34): "DF-2 OKAY. But of course, don't look down on the grind they have to do to level up their cards to that tier's gate." The recommended option: Base cards stop at Lv 4 and pay the full Forge cost (x1), and a fight's own first-clear card drops 10% a repeat (was 3% x its rarity share), so 4-copy decks form by about Maps 10-15. His note: the model and the tuning must count the grind it takes to level cards up to each tier's gate, not treat reaching it as free. New work: a balance package (docs/action-items.md, 10-23 17:34).

**DF-3. Selfish map effects from Map 5: a boon only the enemy's deck can use** · Decide · Map effects · asked 2026-10-23 · decided 2026-10-23
- A design: from Map 5 each map names a theme, and its boon turns on in a fight when at least half the enemy deck shares it. It counts only the CPU's deck, so copying the deck gains nothing. The Environment card shows the count ('11/16 Cave', red outline, a 'theirs' mark). 15 boons are proposed (e.g. Map 8 Blind Fury: Cave units deal 2x in Darkness; Map 17 Frostborn; Map 24 Royal Treasury); Maps 6, 11, 14, 15 and 21 get none. The full list is in this item's earlier text (git history of docs/decisions.json, 10-23). Recommended: build it on every fight of those maps, then retune the road.
  - Build it: one boon per map from Map 5, on every fight of that map, the 15 above, theme at half the deck
  - Only on elites, mini-bosses and bosses
  - On skirmishes too, but only from Map 10
  - Not now
- **Default:** Build it: one boon per map from Map 5, on every fight of that map, the 15 above, theme at half the deck
- **Outcome:** Owner (10-23 17:34): "DF-3 Okay." Build it: one selfish boon per map from Map 5 (the 15 proposed; Maps 6, 11, 14, 15 and 21 none), on every fight of that map, on when at least half the enemy deck shares the theme; the Environment card shows the count. Then retune the road. New work: a map-effects package (docs/action-items.md, 10-23 17:34).

**DF-4. Five spots break the curve: Maps 1, 7, 11, 14 and Map 20's elites** · Decide · Balance · asked 2026-10-23 · decided 2026-10-23
- Spots that break the road's targets (docs/balance/df-2026-10-23.json). Already handled: Map 1 (retuned, EB-2) and Map 20's double fire (Scorched Ground only, FX3-2; volcano damage lowered, FX3-3). Left: Map 7 Morel Hollow (ant deck 48%; 7-3 holds it to 8%), Map 11 Eyrie Heights (38%: flyers and Guardians in a Gale), Map 14 Savanna Reaches (46%). Recommended: retune Maps 7, 11 and 14 to the road targets against the ant and collected decks (tools/skirmish_pass.js).
  - Retune Maps 7, 11 and 14 (deck and Shield moves)
  - Leave them: DF-1 and DF-3 reshape the curve first
- **Default:** Retune Maps 7, 11 and 14 (deck and Shield moves)
- **Outcome:** Default taken (DC3, 2026-10-23): Retune Maps 7, 11 and 14 to the road targets against the ant and collected decks (deck and Shield moves), done in the same pass as DF-3's road retune so they are tuned once with the boons on (docs/action-items.md, 10-23 17:34).

**BF10-1. Evasive and Shadow cost more than they are worth too** · Decide · Balance · asked 2026-10-23 · decided 2026-10-23
- The robust skill test measured the other half-miss skills against their ×1.5 price: Evasive worth 5.77 vs 7.14 paid (deck wins 23.8%), Shadow 1.94 vs 7.14 (1.8%), Swift 7.03 vs 7.14 (fair). That points to Evasive ×1.37 and Shadow ×1.1. Only Flying (×1.39) was changed.
  - Evasive ×1.37, Shadow ×1.1
  - Evasive only
  - Leave them at ×1.5
- **Default:** Evasive ×1.37, Shadow ×1.1
- **Outcome:** Claude's call (10-23, owner asked to settle the easy ones): Evasive x1.37 and Shadow x1.1, because the robust test measured both as overpriced, the same way Flying was fixed. To build in a later package (balance: canonical/skill-costs.json, then a card re-fit).

**BF10-2. Bulwark 1 is priced 1 but measured at 3.27** · Decide · Balance · asked 2026-10-23 · decided 2026-10-23
- Same test: a Bulwark 1 deck wins 59.2% against the vanilla deck's 41.1% (net +1.34 stat points). You are redesigning Bulwark N (two vanguard shields of 4×N Health); price the new one after it is built.
  - Reprice after the redesign
  - Price the current one at 3.3 now
- **Default:** Reprice after the redesign
- **Outcome:** Claude's call (10-23, owner asked to settle the easy ones): Superseded by EN-2: Bulwark was redesigned and the owner set its price at 6 a point; nothing left to decide.

**PG-1. Copy ladder 5/4/3/2/1 per card, and the per-deck Legendary 3 / Mythic 2 caps on top** · Decide · Decks · asked 2026-10-23 · decided 2026-10-23
- Built (package PG, item 9): at most 5 copies of a Common (Starter too), 4 Uncommon, 3 Rare, 2 Very Rare, 1 of everything above, per card, in the Camp, the Standard deck, swaps, import, the fight gate and ghost / PvP decks. Package DR's per-deck caps (3 Legendary, 2 Mythic, 1 of each rank above, different cards counted together) are a different rule and were kept, so a deck still holds at most 3 different Legendaries. Disenchant / Fuse 'extras' follow the ladder (copies beyond 5 Commons, 4 Uncommons ... are extras now).
  - Keep both (as built)
  - Ladder only: drop the per-deck rank caps
- **Default:** Keep both (as built)
- **Outcome:** Claude's call (10-23, owner asked to settle the easy ones): Keep both (as built), kept as built (the copy ladder and the per-deck Legendary / Mythic caps both apply).

**PG-2. Saves from before the copy rules** · Decide · Decks · asked 2026-10-23 · decided 2026-10-23
- Base cards were free and unlimited until today. Once, for a player past the tutorial, every Base card in any of their decks got real copies up to what that deck holds, so no saved deck shrinks (a Quarry Mole x7 already in a deck stays). A deck over the new ladder (e.g. 7 Pond Trout) shows a pill in the Camp and can't start a fight until it is trimmed; nothing is cut automatically.
  - As built (keep copies, the player trims)
  - Trim saved decks to the ladder automatically
  - Take back the unlimited copies (each Base card to 1)
- **Default:** As built (keep copies, the player trims)
- **Outcome:** Claude's call (10-23, owner asked to settle the easy ones): As built (keep copies, the player trims), kept as built (old decks keep their copies and the player trims).

**PG-3. The starting deck: 20 different cards, one copy each** · Decide · Tutorial · asked 2026-10-23 · decided 2026-10-23
- Built (items 8, 10): the starting deck is one copy of each card of your side's list, the shared list and the filler (their numbers now only say which cards), topped up in order from starterTopUp (Pond Duck, Acorn Chipmunk, Cottontail, Chipmunk Forager, River Carp, Burrow Rabbit, Meadow Rabbit, Duckling, Harvest Mouse, Sheep ...) to 20 with T-1's and T-2's rewards. A fresh Otters account after 0-3 holds 25 copies of 24 cards (Otter Centurion x2 with T-2's reward; everything else x1) and the Camp lists only those, instead of 44 'owned' cards, 38 of them unlimited. The deck builder lists only cards you hold. The top-up list is in STARTER_CFG_DEFAULT (the tutorial editor does not show it yet).
  - As built
  - Pick the top-up cards yourself (tutorial editor)
  - Let the first deck be short of 20
- **Default:** As built
- **Outcome:** Claude's call (10-23, owner asked to settle the easy ones): As built, kept as built (the starting deck of one copy each, with EB-1's change on top (one of each weak card stays, no Sparrow Chick)).

**PG-4. Clearing a map takes you to the next one** · Decide · Map · asked 2026-10-23 · decided 2026-10-23
- Item 13. The gate already opened Map 1 the moment 0-4 was won (checked on a fresh account, and Map 1 -> 2). What landed you on a locked map was Map 0's signpost: its 'Show me the road' pointed at Clovermead, a side map of Map 1 that waits on Map 12. It now points at Thistlewood, a signpost to a locked map says what opens it instead of moving you, and the locked notice offers the way back. Also built: after the fight that clears a map, back on the map you are taken to the next map once.
  - As built (move on to the next map)
  - Stay on the cleared map
- **Default:** As built (move on to the next map)
- **Outcome:** Claude's call (10-23, owner asked to settle the easy ones): As built (move on to the next map), kept as built (clearing a map moves you on to the next one).

**PG-5. A unit at 0 Health before its action ends** · Decide · Battle rules · asked 2026-10-23 · decided 2026-10-23
- Item 4. A 3/7 Armor 1 Beetle Grunt hit 4, 4, 2 shows 3, 3, 1 and dies at exactly 0; in 13 auto-played 0-4 fights the shown Health matched the engine after every hit and round and every death played at 0 (screens in docs/screens/PG; the final hit shows its number and Health 0 together). The engine removes the dead after each attacker's action and each skill action, as you said. One gap with your rule: inside the same action a unit at 0 can't be healed (applyHeal refuses 0 Health), and its On Attacked / Bleed-on-defend don't fire. Should a heal or shield that lands later in the same action save it?
  - As is (0 Health = dead, removed when the action ends)
  - A heal later in the same action saves it
- **Default:** As is
- **Outcome:** Claude's call (10-23, owner asked to settle the easy ones): As is, kept as built (0 Health is dead, removed when the action ends (his rule)).

**PG-6. Enemy decks and the new copy ladder** · Decide · Decks · asked 2026-10-23 · decided 2026-10-23
- The ladder was built for the player's decks (Camp, Standard, swaps, import, fights) and ghost / PvP decks. 122 of 467 skirmish / elite / boss decks hold more than it allows (e.g. 22-5 Cinder Hornet x7 Common, 22-7 Caldera Snow Leopard x2 Super Rare, 1-A-5 Tunnel Ant x4 Rare); they are unchanged. tests/thematic-2026-10-19.js flags the four it watches.
  - Leave enemy decks as they are
  - Fit them to the ladder (tools/map_divvy check + a pass)
- **Default:** Leave enemy decks as they are
- **Outcome:** Claude's call (10-23, owner asked to settle the easy ones): Leave enemy decks as they are, kept as built (enemy decks are left off the copy ladder).

**GD2-1. The skill that shields allies from skills: Spellshield 🪬** · Decide · Battle rules · asked 2026-10-22 · decided 2026-10-23
- Built as Spellshield 🪬 (engine key spellshield): a single-target enemy skill (an arrow or other shot, a Bolt, a damage or status skill) aimed at a unit adjacent to it hits it instead; never itself; several at random. Price 0.8 in canonical/skill-costs.json, an estimate (about 3/4 of Guardian's 1.06: fewer hits come as skills than as swings, but they are the heavier ones). No card has it yet; measure it with tools/skill_test_robust.js before one gets it.
  - Spellshield
  - Spell Ward
  - Mirrorguard
- **Default:** Spellshield
- **Outcome:** Owner (10-23 00:10): "Spellward." Not the default name: the skill is called Spellward (his spelling, one word; the second option), not Spellshield. Rename it everywhere (engine key, texts, language packs); the rule itself is unchanged. To build in package EN: the name is "Spellward" (one word, his spelling). Built (EN): the skill is Spellward everywhere: engine key effects.spellward (an old card's spellshield still reads as it, and saved cards are migrated as they load, enMigrateCard), texts (TX ui.skn-spellward ...), the 12 packs (the Spellshield rows replaced), Codex, editor, skill-costs.json (id spellward, 0.8).

**GD2-2. Cleave's side damage isn't a swing a Guardian takes** · Decide · Battle rules · asked 2026-10-22 · decided 2026-10-23
- Guardian takes plain swings: the main attack and each prong of a Fork, Trident, Pitchfork or Octolash (each prong is a full single-target swing). Cleave's bonus damage to the units beside the target is a spread of one swing, so it reaches those units, as before.
  - As built
  - A Guardian takes Cleave's side hits too
- **Default:** As built
- **Outcome:** Owner (10-23 00:10): "As built." Guardian keeps taking plain swings only; Cleave's side hits still reach the units beside the target (the default).

**GD2-3. Seven maps have no skirmish-exclusive card** · Decide · Rewards · asked 2026-10-22 · decided 2026-10-23
- Maps 4, 6, 11, 12, 18, 20 and 21 have no skirmish whose first clear pays an exclusive card: their own cards sit on their elites and bosses, or are their pack cards. Left as they are ("if it turns out there is not much left, then okay"); their skirmishes pay pack cards. Giving each one would move one of its pack cards (or an elite's card) to a skirmish.
  - As built
  - Move one card to a skirmish on each of those maps
- **Default:** As built
- **Outcome:** Owner (10-23 00:10): "Skirmish exclusives have priority. So move the pack cards." Not the default: on Maps 4, 6, 11, 12, 18, 20 and 21 one pack card moves to a skirmish as its first-clear exclusive card. To build in package RW3. Built (RW3): every main map has a skirmish-exclusive card now. Maps 4, 6, 11, 12, 18, 20, 21 had none: 1 card moved out of the packs on the maps with fewer than 4 skirmishes (Maps 4, 21), 2 on the others (12 cards: snapstick-turtle 4-1; poison-dart-croaker 6-1, booming-bittern 6-2; alpine-marmot 11-1, eagle-owl-quartermaster 11-2; bramble-hoglet 12-1, cunning-vixen 12-2; thorny-devil 18-1, caustic-scorpion 18-2; pack-mule 20-1, ash-cloud-condor 20-2; pika-hoarder 21-1), each from that skirmish's own deck (tools/rw3_first_rewards_2026_10_23.js). Exclusive skirmishes 23 -> 36 (with the Quarry Mole on 8-1, RP3).

**GD2-4. No new free packs or tokens on skirmishes** · Decide · Rewards · asked 2026-10-22 · decided 2026-10-23
- Pack rewards on skirmishes stay as they were (Map 0's 0-2 faction pack; the map free packs are on bosses). Adding packs or Faction Reward tokens to skirmishes would speed up the economy and the faction track, both tuned. 33 of the 101 skirmishes pay no card.
  - As built
  - Add a free pack or a token to some of the 33
- **Default:** As built
- **Outcome:** Owner (10-23 00:10): "A Skirmish must always give either a pack of that 'season', a faction pack or a skirmish exclusive or a card of that season's pack" Not the default: the 33 skirmishes that pay nothing now pay one of those four; no skirmish pays nothing. To build in package RW3. Built (RW3): no skirmish pays nothing on its first clear: 101 main-map skirmishes = 36 exclusive cards, 64 cards of that map's pack, 1 pack (0-2's faction pack); was 23 / 44 / 1 / 33 nothing. Every map still had pack cards to give, so no new season or faction pack was needed; the fallback (that season's pack, then your faction pack, taking turns) is built (SKIRMISH_FIRST_PACKS) and empty.

**GD2-5. What reads "adjacent" and what keeps its shape** · Decide · Battle rules · asked 2026-10-22 · decided 2026-10-23
- On adjacent (in front / behind too, in a raid): Guardian, Spellshield, Formation, Haste, Shieldwall, Amplifier, Immolation, Irradiated, Inspiring, Friction, Proliferate, Electricity, Chain Lightning, Dragon Lightning, Spitfire's splash, the Adjacent Ally target. Kept as they are: shapes across the board (Fireball's 3 columns, Meteor, Rocket, Dynamite's 3x3, Cleave, the prongs, Taunt, Stench, Landslide, Ambush / Sentry facing), where a token appears (Twin, Sprout, Brood, Palisade, Spawner: a free slot nearby), and Pack chains (front row only today).
  - As built
  - Pack chains across rows too
  - The splash shapes too
- **Default:** As built
- **Outcome:** Owner (10-23 00:10): "Okay. Dynamite is adjacent but including diagonals - is there a way to name this?" Keep the shapes as built (the default). Open naming question: Dynamite reaches the 8 cells around its target, diagonals included; EN proposes one word for it (suggested "Surrounding": left, right, in front, behind and the four diagonals) and uses it in the texts, leaving "adjacent" at the four directions. To build in package EN. Built (EN): the word is "Surrounding": the 8 places around a unit (left, right, in front, behind and the 4 diagonals; in a raid its own rows in front and behind too). A Codex term beside Adjacent. Skills of that shape, now worded with it: Dynamite ("to every surrounding unit"; on the raid board it now also reaches its own rows in front and behind, diagonals included), Scavenge and Salvage. Adjacent stays the four directions. Owner (10-23 11:11): "Adjacent - Up/Down/Left/Right; Surrounding - include diagonals -> Okay!" Confirmed as built.

**GD2-6. An Easter egg a player owns shows as a plain card** · Decide · Codex · asked 2026-10-22 · decided 2026-10-23
- Outside Admin Mode nobody sees an Easter egg: no "???" slot, no section, no count, no filter or search hit, no Easter-egg words. A player who owns one anyway (only an admin grant gives one) sees it in their Codex as an ordinary card, its where-to-get line "Not obtainable yet".
  - As built
  - Hide it from its owner too
- **Default:** As built
- **Outcome:** Owner (10-23 00:10): "Yes. The method to own one is in giveaways or supremely low chance in mystery packs" An owner keeps seeing the Easter egg as an ordinary card (the default); what is new is how a player can own one: giveaways, or a supremely low chance in mystery packs. To build in package RW3. Built (RW3): a Mystery Booster card is an Easter egg 0.05% of the time (1 in 2,000 cards; MYSTERY_EGG_CHANCE), one of the nine at random, granted through its own source 'mysteryEgg'. Giveaways are the admin grants that already existed.

**GD-1. Guardian's front / behind is raid-board only** · Decide · Battle rules · asked 2026-10-22 · decided 2026-10-22
- In front / behind needs rows that fight, so it applies on the raid board (3 rows, every row acts). Elsewhere a reserve row is only waiting to step up (not on the battlefield), so a Guardian waiting there doesn't guard the unit in front of it, and nothing guards a waiting unit. Normal fights have one row, so they only have left / right (the card matrix shows 0 changed fights); in 600 random raid-board fights with Guardians, 508 ended differently.
  - As built (raid board only)
  - Waiting reserves guard too
- **Default:** As built (raid board only)
- **Outcome:** Owner 19:27: "GD-1: From now on, things that deal with L/R can just say 'adjacent' e.g. Formation cares about adjacent units. Adjacent is defined as behind, in front, left, right. Only relevant in raids or multi-player dungeons. (I see that Guardian's short desc is already correct)" Built (package GD2): one engine helper, adjacentOf (bramblewood-engine.js): left and right in a unit's own row, plus directly in front / behind only where every row fights (the raid board, RESERVE_ACTS); elsewhere just left / right, so ordinary fights play exactly as before. On it: Guardian, the new Spellshield, Formation (a waiting reserve no longer counts), Haste, Shieldwall, Amplifier, Immolation, Irradiated, Inspiring, Friction, Proliferate, Electricity, Chain Lightning, Dragon Lightning, Spitfire's splash and a trigger's Adjacent Ally target. Their texts and the Codex term say "adjacent" (12 packs). Column shapes keep their columns (call GD2-5). Owner (10-23 11:11): "Adjacent - Up/Down/Left/Right; Surrounding - include diagonals -> Okay!" Confirmed as built.

**GD-2. Which Guardian steps in: left, right, in front, behind** · Decide · Battle rules · asked 2026-10-22 · decided 2026-10-22
- When two or more Guardians are next to the target, the first in this order takes the hit: left, right, the one in front, the one behind (the old rule was left before right). A Guardian never guards itself, but a Guardian next to another Guardian is guarded by it.
  - As built (left, right, in front, behind)
  - In front first (it stands between the enemy and the target)
- **Default:** As built (left, right, in front, behind)
- **Outcome:** Owner 19:27: "GD-2: Random," Built (package GD2): when two or more Guardians are adjacent to the target, one of them takes the hit at random (the fight's seeded RNG, so replays repeat; it only rolls with two or more, so a fight with one Guardian draws the same numbers as before).

**GD-3. Status-only skills still go to the unit they aim at** · Decide · Battle rules · asked 2026-10-22 · decided 2026-10-22
- Guardian takes single-target hits: a swing, an arrow or another shot, and a skill that deals damage to one target. A skill that only puts a status on one enemy (Poison, Expose, Stun, Bleed or Add Wait aimed at one unit) is not redirected, as before. Area hits are never redirected.
  - As built
  - A Guardian also takes single-target statuses
- **Default:** As built
- **Outcome:** Owner 19:27: "GD-3: AOE can't get redirected. Status only skills hmm. I think if it's skills (including arrow), guardianship doesn't help. So no redirection for skills. We have ward for dodging skills right? There can be a similar skill - but for shielding allies from skills." Built (package GD2): Guardian redirects plain swings only: a unit's basic attack and the prongs of that swing (Fork, Trident, Pitchfork, Octolash: each prong is a full single-target swing). Cleave's side damage is a spread of the swing, so not redirected, as before (call GD2-2). Arrows (Arrow, Archer, Snipe), Bolts, shots, damage and status skills reach their target; areas never redirect. New skill Spellshield 🪬 (call GD2-1 for the name): a single-target enemy skill aimed at an adjacent ally hits the Spellshield unit instead. There is no Ward that dodges skills in the game: the closest are Helmet (deflects half the shots aimed at it) and Evasive.

**GD-4. 💥 is the crit mark; the hit burst keeps 💥** · Decide · Battle UI · asked 2026-10-22 · decided 2026-10-22
- On numbers and log lines 💥 now means a crit only: Explode's fuse line and its "Boom!" float use 💣, Stampede's log line and its carry-over preview (+N) use 🐘. The quick burst that flashes on a card when it's hit by a physical attack is still a 💥, with no number on it (elemental hits show their own glyph). The raid smack's log line ("💥 X sweeps your front row"), "💥 Crash!" and "👑💥 King Slayer!" keep theirs (words, not a number).
  - As built
  - Change the hit burst too (e.g. a white spark)
  - Change every other 💥 in the battle
- **Default:** As built
- **Outcome:** Owner 19:27: "GD-4: King Slayer: 🗡️, Fencer: 🤺" Built (package GD2): King Slayer's float is "🗡️ King Slayer! +N" (was 👑💥); a Fencing unit's plain hit bursts as 🤺 instead of 💥 (Fencing had no float or log mark of its own; the hit burst was its 💥).

**GD-5. Skirmishes whose first clear is a pack or a token: 7%** · Decide · Rewards · asked 2026-10-22 · decided 2026-10-22
- Every first-clear reward card a skirmish pays today is skirmish-only (since RP, a map's reward cards are never pack cards), so the tripled drop covers those skirmishes. A skirmish whose first clear gives a pack or a Faction Reward / Growth token has no single card to drop, so it has the plain 7% pack-card drop on every win (it had none). If a skirmish is ever given a pack card as its reward, the same 21% rule picks it up.
  - As built (7%)
  - Triple those too (21% pack cards)
- **Default:** As built (7%)
- **Outcome:** Owner 19:27: "GD-5: No. There should be a mix of 'no first clear card', 'first clear skirmish-exclusive card', 'first clear pack card reward' and of course pack rewards.. Skirmish exclusive makes up 1-2 (max 3). The rest are a mix of the rest. If it turns out there is not much left, then okay." Built (package GD2): a skirmish's first clear can pay a pack card of its own map (SKIRMISH_FIRST_PACK_CARDS, written by tools/gd5_first_cards_2026_10_22.js; the card stays a pack card). The exclusive cards stay where they were (every map had 0-2). The other skirmishes alternate pack card / none: of 101 main-map skirmishes, 23 pay an exclusive card, 44 a pack card (each one from that fight's own deck), 1 a pack (0-2), 33 nothing. A pack-card skirmish drops like an exclusive one: 7% on its first clear, 21% on repeats with that card at its rarity share. Calls GD2-3, GD2-4. docs/balance/gd5-first-cards-2026-10-22.json.

**GD-6. The drop line shows the reward card's chance per win** · Decide · Rewards · asked 2026-10-22 · decided 2026-10-22
- A cleared skirmish's drop line reads, for a Common reward card: (card) 13% · 🃏 8.4%, its chance a win (21% x 60% = 12.6%, rounded as the line rounds above 10%) and the pack card's share. Before the first clear it reads 🃏 7% (the card itself is in the First Clear box).
  - As built (chance per win)
  - Show 🃏 21% and the card's share of it (60%)
- **Default:** As built (chance per win)
- **Outcome:** Owner 19:27: "GD-6: Sounds correct I think? For skirmish first-clear reward card drops - they don't roll twice. They just roll for the skirmish-exclusive, then if they get it, they roll within it to see if they get another card instead." Checked (package GD2): rollCardDrop already does exactly this: one roll at 21% on a repeat win, then within it the reward card's rarity share (Common 60% ...), else a pack card; no second roll (a Common reward: 12.6% the card, 8.4% a pack card; 20,000 seeded rolls in tests/gd2-2026-10-22.js). Nothing changed. The panel line shows the per-win chance, as built.

**DN2-1. An elemental crit shows only its big glyph, no 👊** · Decide · Battle UI · asked 2026-10-22 · decided 2026-10-23
- Read from "can you just make the damage type emoji bigger if it's non physical": an ice crit on a Fragile unit now reads (big ❄️)14🦴 (DN had 👊❄️14🦴). A physical crit keeps 👊7. One switch brings the fist back on elemental crits (DMG_CRIT_FIST_ON_ELEMENT).
  - As built (big glyph only)
  - 👊 and the big glyph
- **Default:** As built (big glyph only)
- **Outcome:** Owner (10-23 00:10): "Yes." As built: an elemental crit shows only its big glyph.

**DN2-2. Damage numbers lead with the damage type, not the source** · Decide · Battle UI · asked 2026-10-22 · decided 2026-10-23
- Following the rule (type glyph, none for physical), numbers that used to show their source now show their type: an Arrow Slits arrow, a trap, Pierce, Stampede, Friction, a Penance / Blood Tithe payment and the tentacle's stamp are plain numbers (was 🏹 🪤 🗡 💥 ⚙️ ⛧ 🦑); a comet or scorched ground is 🔥 (was ☄️ 🌋); Decay is 🍂 (was 🦠). Ticks with no element keep their own glyph: Curse 🜏, Chilli 🌶️, Strangle 🪢. The skill's own effect (the tentacle, the arrow, the spark) still plays.
  - As built
  - Keep a source glyph on physical-only sources (🏹 🦑 🪤)
- **Default:** As built
- **Outcome:** Owner (10-23 00:10): "Yes." As built: damage numbers lead with the damage type.

**DN2-3. The log's "💥 Crit!" becomes the 👊 on the number** · Decide · Battle UI · asked 2026-10-22 · decided 2026-10-22
- A crit's log line now reads "hit X for 👊14🦴 ❄️ cold damage" instead of "... for 14 ❄️ cold damage 💥 Crit!". An Ambush hit (no 👊 on its floating number either) keeps the words.
  - As built
  - Keep "💥 Crit!" too
- **Default:** As built
- **Outcome:** Owner 18:20: "DN2-3: 💥 is a better symbol for Crit to me." Built (package GD): 💥 replaces 👊 as the crit mark on floating numbers, bramble hits, the battle log ("hit X for 💥14🦴 ❄️ cold damage"), the Codex's "reading damage numbers" line and DN2's constants (DN_CRIT_MARK). Other 💥 that sat on a number or a log line moved off it: Explode's fuse line and its "Boom!" float are 💣, Stampede's log line and its carry-over preview (+N) are 🐘.

**DN2-4. "Higher hue" is +12 degrees for every element** · Decide · Battle UI · asked 2026-10-22 · decided 2026-10-23
- Built as asked (lighter by 10%, hue +12 degrees). Fire turns a brighter yellow-orange and magic a pinker violet, but ice turns slightly bluer (its hue is already past cyan), not the lighter cyan I described at 15:39. Poison greens turn a little bluer too.
  - As built (+12 for all)
  - Warmer for every element (fire and magic +12, ice and poison -12)
- **Default:** As built (+12 for all)
- **Outcome:** Owner (10-23 00:10): "Okay. Maybe poison turns a little less bluer than it would do, and abit brighter instead." Keep +12 degrees for every element, but poison's shift is eased so it goes less blue and a little brighter. To build in package SX. Built (SX): DMG_CRIT_BY_CLASS = {poison: {hue: 5, lighten: 0.16}} next to DN2's knobs; poison (and acid and decay, which share its colours) turns +5 degrees and 16% lighter (its crit number is a light yellow-green, hsl 100 65% 70%, not teal); every other element keeps +12 degrees and 10%.

**DN-1. Hit numbers drop the minus sign; the other damage numbers keep theirs** · Decide · Battle UI · asked 2026-10-22 · decided 2026-10-22
- Package DN follows the note's format exactly ("🔥20⛨"), so a unit hit now reads 🔥3⛨, 👊7, 👊❄️14🦴, 5 (was 🔥 -3, -7, 👊❄️ -14). The other damage numbers are separate code and keep their old look with a minus: Bleed and Poison ticks, field damage (comets, lava, hail, the tentacle's 🦑 −2), bramble hits on the HP bar, Reflect and Thorns. Colours are unchanged everywhere.
  - As built (hits only)
  - Bring every damage number to the new format
  - Put the minus back on hits
- **Default:** As built (hits only)
- **Outcome:** Owner 15:39: "DN-1 Yes. DN-3 OKAY. DN-4 Yes. DN-2 Im now thinking, can you just make the damage type emoji bigger if it's non physical. e.g. wand for magic becomes big if its crit! or even colour burn it abit? What would the color of the text be btw? a 10% lighter and higher hue version of the original color?" Built (package DN2): every damage number reads <type glyph><number><mark> with no minus: Poison / Bleed / Decay / Toxin / Strangle / Curse / Chilli ticks, field damage (scorched ground, eruption, comets, lava, hail, ley lines, the depths, arrow slits, landslide), bramble hits on the HP bar (Bulwark is the ⛨), Pierce and Stampede, Reflect / Thorns, Friction, Recoil, Ichor, traps, the meteor's crater, Fire on hit, the firepot, splash, and the raid's Tentacle Smack / Tail Sweep stamps. The engine adds the marks (mods) to those events; no number changed (card matrix: 0 diffs). Heals keep their look.

**DN-2. The marks after a hit number, and which one wins** · Decide · Battle UI · asked 2026-10-22 · decided 2026-10-22
- One mark per hit, the strongest: 🚫 immune (the hit did 0 because of Immune, Invincible or a Cower shell), then ⛨ blocked to 0 by Armor, then 🦴 Fragile, then 💢 Weakness (also Shocked, which takes ×1.5), then ⛨ any reduction (Armor, Resist, Sturdy, Shell / temporary Health, stone, Rage's half, Scare, Ghost / Atheist halving). The engine now tags each hit with why its number moved (`mods` on the hit event, display only). ⛨ is a text symbol (no emoji exists), drawn in steel with a dark edge.
  - As built
  - Separate marks for Armor and Resist
  - Show two marks when an up and a down both apply
- **Default:** As built
- **Outcome:** Owner 15:39: "DN-1 Yes. DN-3 OKAY. DN-4 Yes. DN-2 Im now thinking, can you just make the damage type emoji bigger if it's non physical. e.g. wand for magic becomes big if its crit! or even colour burn it abit? What would the color of the text be btw? a 10% lighter and higher hue version of the original color?" Built (package DN2): the mark rule stays as built. A crit that isn't physical draws its type glyph 1.4x on a soft burn in the element's colour (no 👊), and its number takes the type's colours 10% lighter and 12 degrees up the hue wheel (DMG_CRIT_LIGHTEN 0.10, DMG_CRIT_HUE 12, DMG_CRIT_GLYPH_SCALE 1.4 in arena_app.js). Marks keep their size; a physical crit keeps 👊; normal hits keep their colours.

**DN-3. Crits use the game's 👊, not ❇** · Decide · Battle UI · asked 2026-10-22 · decided 2026-10-22
- The note suggested ❇ for elemental crits unless the game already had a crit mark. It does: 👊 (since 2026-10-08). So a physical crit reads 👊7 and an ice crit on a Fragile unit reads 👊❄️14🦴.
  - Keep 👊
  - Use ❇ for elemental crits only
  - Use ❇ for every crit
- **Default:** Keep 👊
- **Outcome:** Owner 15:39: "DN-1 Yes. DN-3 OKAY. DN-4 Yes. DN-2 Im now thinking, can you just make the damage type emoji bigger if it's non physical. e.g. wand for magic becomes big if its crit! or even colour burn it abit? What would the color of the text be btw? a 10% lighter and higher hue version of the original color?" Kept: 👊 is the crit mark (physical crits).

**DN-4. The battle log keeps its own wording** · Decide · Battle UI · asked 2026-10-22 · decided 2026-10-22
- The log doesn't share the floating number's formatter (it says "hit X for 3 🔥 fire damage — blocked to 0 by Armor! 🛡 … 💥 Crit!"), so DN left it unchanged; no golden or log text moved. The same marks could be added to its lines.
  - As built
  - Add the 🦴 / 💢 / ⛨ / 🚫 mark to log lines
- **Default:** As built
- **Outcome:** Owner 15:39: "DN-1 Yes. DN-3 OKAY. DN-4 Yes. DN-2 Im now thinking, can you just make the damage type emoji bigger if it's non physical. e.g. wand for magic becomes big if its crit! or even colour burn it abit? What would the color of the text be btw? a 10% lighter and higher hue version of the original color?" Built (package DN2): battle-log damage lines carry the same marks after the number (🦴 💢 ⛨ 🚫) and 👊 before a crit's number, and the element glyph where the line names the type ("took 3 ☠️ poison damage", "2 🧪 acid", "1 💭 psychic damage"). Wording otherwise unchanged; the marks sit inside the translated templates' values, so the 12 packs still match.

**FX1. Which field effects count as "similar" to Crushing Depths (now 1 damage)** · Decide · Balance · asked 2026-10-22 · decided 2026-10-22
- Set to 1 damage a round by default, and every map number brought down to 1: Crushing Depths (5; the raid's 2), Hail (3; maps 22-4, 22-7, 22-8 had 2), Glass-storm (random 1–3), Lava Spout (3; 22-5, 22-8 had 2), Leylines III (3 to units and brambles), Thunderstorm (2; 10-7, 10-9), Arrow Slits (2; 23-7 had 3, 24-5 and 24-8 had 2). Left alone: Landslide (1 in 4 rounds, 5 to three columns: a chance event, not every round), the volcano's hazards and Scorched Ground (boss mechanics), Tide-spout (already 1), Ash Rain (1 to brambles only).
  - Keep this split
  - Landslide to 1 too
  - Landslide to 2–3
- **Default:** Keep this split
- **Outcome:** Owner 14:12: "FX-1: Landslide 1/4 chance to deal 3. Volcano hazards - idk how much I wrote, but 5 may be the max dmg. The normal average damage over a turn cannot exceed 1 in this case." Built (package FX2): Landslide 1 in 4 for 3 (was 5; 0.75 a round on a unit in its columns). The volcano: Lava Tide 1 (was 3), Eruption 1 (was 2), comets 1 to every unit (was a random 2–5), Scorched Ground's editor preset 1 (was 2). Each hazard's number times its chance stays at or under 1 at every volcano level, and a map's own number is capped at 5. Measured on the only level the maps use (low, 22-6 and 22-8): 0.41 a unit a round from all three together (about 1.35 before). Call FX2-1 asks about the higher levels combined.

**FX2. How a 1-damage Crushing Depths halves for Swimmers** · Decide · Balance · asked 2026-10-22 · decided 2026-10-22
- Chosen: a halving keeps at least 1, so at 1 damage a Tide unit or Swimmer takes 1 like everyone. Only when both halvings stack (a Swimmer or Tide unit that also resists water) does it round down: 0 at 1 damage. Hail and Lava Spout keep the game's usual Resist rule (half, at least 1), so Resist does nothing against a 1.
  - Keep (at least 1; Swimmer + Water Resist takes 0)
  - Swimmers take 0 at 1 damage
  - Always at least 1
- **Default:** Keep (at least 1; Swimmer + Water Resist takes 0)
- **Outcome:** Owner 14:12: "FX-2: we shall do normal rounding. if x < 0.5, 0; else 1. Is this fair? Only round once, when it comes into fruition on the battlefield. Internal calculations should never round. Even when passing numbers between functions. Idk how you code it internally - the first ApplyDamage(X) before damage calculation and etc. then the final real ApplyDamage(Y) which results in a literal ReduceHealth(Y) 1-1 + firing related triggers." Built (package FX2): damage is worked out exactly (Resist, Weakness, Fragile, Sturdy, Ghost / Supreme / Shade / Atheist halves, Shock x1.5, Rage's half, stone, Armor, a row's half share, Bloodlust, half lines, Stagger, the Psychic Dampener, a Swimmer's half in the Crushing Depths) and rounded once, half up, in applyDamage, the one place a unit's Health goes down for a hit (damageHQ for a bramble). So a Swimmer at 1 takes 0.5 -> 1, a water-resistant Swimmer 0.25 -> 0, as this call's default had it; a 3 into Resist now lands 2 (was 1), a 5 lands 3 (was 2). The "at least 1" after a factor or a half is gone (it was a patch for rounding down).

**FX3. The Tail Sweep: purple tentacle now, but still always your front row for 3** · Decide · Raids · asked 2026-10-22 · decided 2026-10-22
- The green "worm" on PC was the Tail part's Tail Sweep, which always hits your front row (its rule, at every width). It is now drawn as the purple tentacle along the front row. Its damage (3 every 2 turns) is its own data and was not changed. The Tentacle Smack (arms and Core) is 1–2 now in the raid fight; the classic trench mode keeps its 6.
  - Keep the Tail Sweep as is
  - Tail Sweep picks a random row like the Smack
  - Tail Sweep 1–2 damage too
- **Default:** Keep the Tail Sweep as is
- **Outcome:** Owner 14:12: "FX-3: Raids hit too hard. Tail sweep for 2 instead? If its supposed to be the stronger attack among the first 3 fights before the core, okay. Otherwise, 1-2. The weaker attacks should just be 1 (AOE). Non AOE attacks can go up to 3, but in this case, there isn't." Built (package FX2): the Tail Sweep is the strongest AOE attack of the first three fights (your whole front row, every 2 turns), so it deals 2 (was 3). The Tentacles' Tentacle Smack (a column or a row, every 3 turns) is a weaker AOE attack: 1 (FX had 1–2). There are no single-target boss attacks. The Core's smack keeps FX's 1–2 (call FX2-2). The classic trench now uses the same numbers (no trenchDmg 6); its balance test holds with the Core's trench bramble at 300 (was 200). The Tail Sweep stays on your front row.

**FX2-1. The volcano's hazards together, at its higher levels** · Decide · Balance · asked 2026-10-22 · decided 2026-10-23
- Each hazard alone stays at or under 1 a unit a round (Lava Tide, Eruption, comets and Scorched Ground are 1 each). Together, measured with 3 units a side over rounds 2–20: very low 0.10, low 0.41 (the only level the maps use), medium 0.64, rising ("even") 1.19, high 1.34, because after an eruption comets hit every unit for 3 rounds and at the higher levels eruptions come almost every round. The most one unit took in one round was 3 (a comet, an eruption and lava together).
  - As built (each hazard at most 1)
  - Comets 1 in 2 rounds at the higher levels
  - Cap the volcano at 1 a unit a round in total
- **Default:** As built (each hazard at most 1)
- **Outcome:** Owner (10-23 00:10): "After eruptions, it restarts to very low again." Not one of the three options: the volcano's level falls back to very low after each eruption and climbs again, instead of rising to the higher levels and staying there. To build in package EN. Built (EN): after each Eruption the volcano is Very Low the next round and climbs one level a round back to its own (Very Low, Low, Medium, Even, High); an Even volcano rises again from there. The forecast carries the level (volcanoLevel). How fast it climbs is call EN-7.

**FX2-2. The Core's Tentacle Smack keeps 1–2** · Decide · Raids · asked 2026-10-22 · decided 2026-10-22
- Your rule covers the first three fights (the Tentacles and the Tail): the Tail Sweep 2, the Tentacles' smack 1. The Core is the fourth fight, so its smack keeps FX's 1–2 (a seeded 50/50, shown on the tentacle). In the classic trench (admins only) a smack doesn't roll, so the Core's is 2 there.
  - Keep the Core at 1–2
  - The Core's smack 1 too
  - The Core's smack 2
- **Default:** Keep the Core at 1–2
- **Outcome:** Owner 18:20: "FX2-2: OKAY". Kept as built: the Core's Tentacle Smack stays 1–2.

**FX2-3. A half of 1 is 1: Resist, Ghost, Atheist and the Psychic Dampener no longer stop a 1** · Decide · Balance · asked 2026-10-22 · decided 2026-10-22
- Under one rounding half up, a single halving of 1 is 0.5 and lands as 1, so Resist, a Ghost's, Supreme's or Shade's half, Atheist and the Psychic Dampener do nothing against a 1-point hit or tick (a Ghost took 0 from a 1-point poison tick before; a dampened Psychic 1 did nothing; now both are 1). Two halvings (0.25) still come to 0. Across the card matrix's 30,680 fights, 488 changed, 48 of them changed winner, all from this kind of rounding.
  - As built (your rule as written)
  - Round halves down only for a 1 (a resisted 1 is 0)
  - Bring back "at least 1" with rounding down
- **Default:** As built (your rule as written)
- **Outcome:** Owner 18:20: "FX2-3: OKAY as is". Kept as built: one rounding half up, so a halved 1 lands as 1.

**BF8-1. Blinding priced 2.5 (my guess); two more ways to blind are for later** · Decide · Balance · asked 2026-10-22 · decided 2026-10-23
- You said Blinding is a flat skill and asked me to guess. It is 2.5 for 50% a hit, 2 rounds (Horned Lizard): between Paralyze 2 and Stun on Hit 3. Horned Lizard re-fitted 4/5 → 5/7. You named three ways to blind (dazzling lights, a powder or acid spray, poking the eyes); only the one skill exists, shown as Blinding. The other two are not built.
  - Keep 2.5
  - Cheaper (2)
  - Dearer (3)
  - Build the other two ways to blind
- **Default:** Keep 2.5
- **Outcome:** Owner (10-23 00:10): "OKAY" Keep Blinding at 2.5 (the default).

**BF8-2. Stats inside braces: +1 Health counts 1, not 0.5** · Decide · Balance · asked 2026-10-22 · decided 2026-10-23
- Your Tide example priced Ebb {+1 Health} at 0.4 × 0.5. Today a stat inside braces counts 2A + H, so +1 Health counts 1 (0.4 after the context multiplier) and +1 Attack counts 2. Nothing changed.
  - Keep 2A + H
  - Health in braces counts 0.5
  - Both halve in braces
- **Default:** Keep 2A + H
- **Outcome:** Owner (10-23 00:10): "OKAY" Keep 2A + H: +1 Health counts 1 inside braces (the default).

**BF8-3. The Red and Blue Dragons still have no legal line without Bounty** · Decide · Cards · asked 2026-10-22 · decided 2026-10-22
- Bounty is off all five dragons and Overwhelm is off the Green Dragon (1/7 → 3/20, White 1/11 → 2/23, Black 8/8 → 9/9). Red Dragon 4/20 (Flying, Stun on Hit, Fire Arrow 4, Supreme) and Blue Dragon 4/19 (Flying, Paralyze, Lightning 4, Supreme, Supreme Tide) still have no line and keep their stats. docs/balance/hand-pass-2026-10-22.md gives Red: Fire Arrow 4 → 1 (2/12); Blue: Lightning 4 → 1 and drop Supreme (2/9).
  - Red: drop Stun on Hit; Blue: drop Paralyze
  - Shrink the arrows / lightning (hand-pass lines)
  - Leave them off the formula
- **Default:** Red: drop Stun on Hit; Blue: drop Paralyze
- **Outcome:** Owner (18:20): "Trim + lower the skill score of the legendary skills. I don't think theyre worth that much. Maybe 3-5." Built (package BF9): Supreme 7 → 5, Supreme Tide 8 → 4 (True Strike already 1.5). Red Dragon loses Stun on Hit (Flying, Fire Arrow 4, Supreme): 4/20 → 3/17. Blue Dragon loses Paralyze (Flying, Lightning 4, Supreme, Supreme Tide): 4/19 → 3/17. Re-fitted with them: White Dragon 2/23 → 2/24, Green 3/20 → 3/21, Black 9/9 → 10/10. Fathom Leviathan still has no legal line.

**TU-1. When the later tutorial fights open, and what they are called** · Decide · Tutorial · asked 2026-10-22 · decided 2026-10-23
- Note of 10-22 11:58: "In the tutorials, you now see five (5). (The first of which T-3 is locked till you progress further)". After Tutorial II the Tutorial submap shows all five fights; the three after the tutorials stay locked markers that say which fight opens them, as set on 10-16 ("T3 and T5 gradually unlock over Map 1/8/18"): the third opens when Map 0's boss (0-4) is beaten, the fourth with 7-6, the fifth with 17-8 (TUT_SIDE_GATE). On the map the five are labelled T-0, T-1, T-2, T-3, T-4, so the one your note calls T-3 (the third) reads T-2 on screen. Package TU kept both the gates and the labels.
  - As built (T-0 to T-4; Maps 1 / 8 / 18)
  - Label them T-1 to T-5 so the labels match how you count
  - Open the third fight later (say once Map 1 is cleared)
- **Default:** As built (T-0 to T-4; Maps 1 / 8 / 18)
- **Outcome:** Owner (10-23 00:10): "Standardise to how we have been doing things - if indices start at 1, then T-1 to T-5" Second option: the tutorial fights are labelled T-1 to T-5, not T-0 to T-4. To build in package TU2.

**TU-2. Phones: keep the 👤 chip in the top bar as well as the new Profile button** · Decide · UI · asked 2026-10-22 · decided 2026-10-23
- Note of 10-22 11:58: "In mobile mode, the Profile icon should be a button in the main menu." Phones now have a Profile note in the Home menu, with Quests, Achievements and the rest; desktop is unchanged. The top bar's 👤 chip stays on phones too, because for a guest it is the Sign in button (and it shows the sync state).
  - Keep both (now)
  - On phones, hide the chip once signed in
  - On phones, hide the chip always (sign in from the Profile page)
- **Default:** Keep both (now)
- **Outcome:** Owner (10-23 00:10): "OKAY" Keep the chip and the Profile button on phones (the default).

**TU-3. What Profile → Reset all should leave behind** · Decide · Admin · asked 2026-10-22 · decided 2026-10-23
- The T-0 stall came from Reset all keeping Admin Mode: with Admin Mode on the game skipped the start map, so the T-0 win landed on an empty Outskirts. Package TU fixed that (the start map now holds for everyone). Reset all still keeps Admin Mode, your name and the editor content, and it does not touch the cloud: from reading the code, a signed-in device also loses its local sync time, so the next load may take the older cloud progress back (player_progress is not wiped). Nothing was changed here.
  - As is
  - Reset all also turns Admin Mode off
  - Reset all also resets the cloud progress of a signed-in account (tap twice)
- **Default:** As is
- **Outcome:** Owner (10-23 00:10): "OKAY Turn admin mode off is not needed. (unless we can turn it on again)" Reset all stays as is (the default): it keeps Admin Mode, so no change.

**RW2-1. Skirmishes with a first-clear reward: no card drop, repeats included** · Decide · Rewards · asked 2026-10-22 · decided 2026-10-22
- N22-5 gave the pack-card drop to "skirmishes with no pack or card reward", and RW2 keeps that: a skirmish whose first clear pays a card, a reward token or a free pack never drops a card, not even on a repeat win. Before RW2 those skirmishes still had the old 10% enemy-card drop (RW-3 moved every fight to the one pack drop, so they now have none). Elites and bosses drop on every win.
  - As built (no drop)
  - They drop on repeat wins only (7%)
  - They drop on every win (7%)
- **Default:** As built (no drop)
- **Outcome:** Owner 18:20: "RW2-1: Yes. There are two kinds of first-clear drop card reward skirmishes: skirmish-exclusive, or from that map range's pack. ALL skirmishes have a low chance to get a card from the pack. For skirmishes, the chance of getting a card is tripled. But you mostly (50+%) get THAT card. (If it's higher in rarity, then the chance actually decreases - your call. Maybe 60/50/40/25/20/10/5/4/3/2/1..." Built (package GD): every skirmish win, first clear and repeats, rolls the pack-card drop at 7% (a skirmish paying a card, a token or a pack no longer drops nothing). A skirmish with a first-clear reward card rolls 21% on repeat wins; a card that drops there is its reward card with the share for that card's rarity (Common 60%, Uncommon 50%, Rare 40%, Very Rare 25%, Super Rare 20%, Epic 10%, Heroic 5%, Unique 4%, Legendary 3%, Mythic 2%, Ancient and above 1%; special rarities as their tier), else a pack card as usual. So a Common reward card drops 12.6% a repeat win and a Rare one 8.4%. The rank gate stays. A cleared skirmish's drop line shows its reward card (small tile), its chance and its rank emblem, then 🃏 for the pack card's share. The first clear rolls the plain 7% (it pays the card itself). Calls GD-5 and GD-6.

**RW2-2. Challenge cards: one per four maps from Map 4, the highest-rarity elite reward** · Decide · Rewards · asked 2026-10-22 · decided 2026-10-23
- Six challenge cards ask SS: The Heron Hag (Heroic, 6-8 The Alligator King), Echo Matriarch (Heroic, 8-8 The Stalactite Warden), Pride Queen (Heroic, 14-8 The Savanna Warlord), Yeti Chieftain (Heroic, 19-6 The Frost Yeti King), Triumphvirate (Unique, 23-8 Marshal Tuskwell), Iron Warden (Epic, 24-6 The Gilded Guard). The rule: main maps in bands of four from Map 4 (4-7, 8-11 …), over the first-clear cards of elite-kind fights (elite, champion, miniboss, dungeon), the one of the highest rarity (Rare or above), ties to the later fight. Maps 0-3 and side maps have none. Five of the six sit on the map's miniboss. Edit by setting or clearing source.challenge in canonical/cards.json (tools/challenge_cards_2026_10_22.js --list shows them).
  - As built
  - Elite fights only (not minibosses)
  - One per two maps
  - Also on Maps 0-3
- **Default:** As built
- **Outcome:** Owner (10-23 00:10): "OKAY" Challenge cards stay as built.

**RW2-3. Card drops 7% per Energy tier, capped at 25%** · Decide · Rewards · asked 2026-10-22 · decided 2026-10-23
- The drop chance is 7% x the fight kind's Energy tier (ENERGY_COST, not the map-scaled cost a fight charges, which climbs to 10+ on later maps): 1 skirmish 7%, 2 elite 14%, 3 boss 21%, 4 world / raid boss 28% and 5 final boss / megaraid 35% are capped at 25% (DROP_CHANCE_CAP), the raids' own S+ maximum. The rank gate still applies (an elite or boss drop needs an S win).
  - As built (cap 25%)
  - No cap (28% / 35%)
  - Cap at 21% (boss level)
- **Default:** As built (cap 25%)
- **Outcome:** Owner (10-23 00:10): "No, the drop rate is based on energy use. I think about 1% per energy. But of course, difficult-er skirmishes like elites have 1/2/3/4% higher chance of dropping (only) since elites and above have shields. Ticketed dungeons keep their higher drop rates. Skirmishes might have shields, but they are rather low" Not the default: replaces 7% per Energy tier capped at 25%. A drop is about 1% per Energy spent; elites and above get 1/2/3/4% more (they have shields); ticketed dungeons keep their higher rates. To build in package RW3. Built (RW3): 1% per Energy tier (ENERGY_COST) + a shield bonus by kind: elite / champion / miniboss / dungeon +1%, sub-boss +2%, boss +3%, world / raid boss, megaraid and final boss +4%; no cap. Skirmish 1%, elite 3%, sub-boss 5%, boss 6%, world / raid boss 8%, megaraid / final boss 9%. A skirmish with a first-clear card rolls 3x on repeat wins (3%), then that card's rarity share (Common 60% ...). The ticketed dungeons (the daily dungeons' floors) keep 7% per tier capped at 25% (7%, mini-boss floors 14%). 10,000-roll checks in tests/rw3-2026-10-23.js.

**RW2-4. A raid's fall still pays its reward cards** · Decide · Raids · asked 2026-10-22 · decided 2026-10-23
- RW2 lowered the card a raid FIGHT drops (survived 1%, enemy bramble killed 12%, killed at S or better 25%; was a pack card on every won fight). The claim when a raid falls (raidReward) is unchanged: every participant's claim pays the raid's rewards.cards (1, +1 for the top 10%, +1 for a Leading participant) as pack / faction cards at the participation level's rarity floor, plus a 1.5% raid-card roll. A held raid pays a chance at one card (up to 10%).
  - Keep the claim's cards
  - Lower the claim's cards too (e.g. a chance instead of a sure card)
- **Default:** Keep the claim's cards
- **Outcome:** Owner (10-23 00:10): "OKAY anyway the raid will be rebalanced later - seeing where people typically unlock the raid." Keep the claim's cards (the default); the raid is rebalanced later from where players unlock it.

**RW-1. Bosses count as elites for the card-reward rank** · Decide · Rewards · asked 2026-10-22 · decided 2026-10-22
- N22-4 says elite fights need at least SS for any card. Package RW treats every boss kind (boss, sub-boss, final boss, raid boss, world boss) like an elite, so a boss's reward cards need SS on Maps 0–19, SSS from Map 20 (the rank is per card: B, or S for a Rare or above, one step up every 20 maps, capped at SSS; an elite or boss asks SS first). A fight's own cardRank can only raise it. Tutorial fights need nothing. The same gate holds for random card drops.
  - Bosses count as elites (now)
  - Bosses ask the same as a skirmish
  - Bosses ask one step more than elites
- **Default:** Bosses count as elites (now)
- **Outcome:** Owner (Oct 22): "I go back on what I said. The max cap is always S. SS and SSS is only for challenge missions. It's too difficult to achieve. Sporadically, some of the skirmish rewards (non pack) can only be gotten through SS (Elites). These will be called challenge cards, so we should pick the higher rarity cards." Built (package RW2): the card-reward rank is capped at S everywhere (CARD_RANK_CAP): B for a Common / Uncommon and S for Rare+ on Maps 0-19, A / S on Maps 20-39, S from Map 40; elites and bosses ask S (was SS, SSS from Map 20); a fight's own cardRank is capped too; the same gate holds for card drops. Challenge cards ask SS: a first-clear reward whose source carries challenge:true in canonical/cards.json (the owner edits the flag there). Six picked by tools/challenge_cards_2026_10_22.js (one per four-map band from Map 4: the highest-rarity Rare+ reward of an elite-kind fight, ties to the later fight): The Heron Hag (6-8), Echo Matriarch (8-8), Pride Queen (14-8), Yeti Chieftain (19-6), Triumphvirate (23-8), Iron Warden (24-6). The fight panel shows them with a gold frame, a Challenge ribbon and the SS emblem (call RW2-2).

**RW-2. Skirmish card drops: 7% a win, and the rarity shares by map** · Decide · Rewards · asked 2026-10-22 · decided 2026-10-22
- A skirmish with no card reward, no reward token and no free pack drops a pack card 7% of the time (30% below the old 10%). The base rarity: Maps 0–9 Common only; Maps 10–29 Common 75%, Uncommon 25%; Maps 30+ Common 70%, Uncommon 25%, Rare 5%. Then a shift: 5% one rarity down, 5% one up, and an up has a second 5% roll for one more up. The shares are my reading of "Commons from Map 0, Uncommons from Map 10, Rares rarely from Map 30"; they are the table SKIRMISH_DROP_RARITY in arena_app.js. The drop only lands when the win's rank meets the gate for that card's rarity (RW-1), so on Maps 0–19 a win below B gives no drop. 10,000 rolls: Map 5 gives Common 94.8% / Uncommon 4.9% / Rare 0.3% after the shift (only up-shifts exist from Common), Map 15 gives 72.6 / 26.1 / 1.3, Map 35 gives 68.3 / 25.6 / 5.9 / 0.2 Very Rare.
  - As built
  - Raise the Rare share on Maps 30+
  - No drop below a certain rank is fine; show it
  - Drop the rank gate for skirmish drops
- **Default:** As built
- **Outcome:** Owner (Oct 22): "80/20 and 70/25/5 is fine." Built (package RW2): Maps 10-29 Common 80% / Uncommon 20% (was 75 / 25); Maps 30+ 70 / 25 / 5 unchanged; Maps 0-9 Common only; then the 5% down / 5% up shift. 10,000 rolls (tests/rw2-2026-10-22.js): Map 15 80.0 / 20.0, Map 35 69.7 / 25.1 / 5.2.

**RW-3. Other fights keep the old card drop (now rank-gated); skirmish drops use the basic pack pool only** · Decide · Rewards · asked 2026-10-22 · decided 2026-10-22
- Elite, boss and the rest keep rollCardDrop as it was (a chance by fight kind, then one of the enemy deck's cards by the rarity table), only now behind the rank gate. The new skirmish drop draws from the basic pack pool (pool 1) cards the player has reached by map (packCardReached); half the time one of the fight's own pack cards of that rarity, else another card of that rarity from the pool, and from the pool directly when the fight has none. The faction pool (11, the otters and hummingbirds) stays on its own reward track and never drops from a skirmish. A rarity with no card in reach steps down until one has.
  - As built
  - Let faction cards drop too
  - Move elites and bosses to the pack-card drop as well
- **Default:** As built
- **Outcome:** Owner (Oct 22): "No use the same card drop. (The drop rate should be roughly scaled to the energy use.)" Built (package RW2): rollCardDrop's old roll (a chance by kind: elite 20%, miniboss 30%, boss 40%, world / raid boss 70%, megaraid 100%, one of the enemy deck's cards) is gone; every fight but a raid fight and a tutorial rolls the skirmish's pack-card drop (map rarity shares, the shift, half the time the fight's own pack card, the rank gate), at 7% per ⚡ of the kind's Energy tier (ENERGY_COST), capped at 25%: skirmish 7%, elite / champion / miniboss / dungeon 14%, sub-boss / boss 21%, world boss / raid boss / megaraid / final boss 25% (call RW2-3). 10,000 seeded wins each: 6.6 / 14.0 / 20.5 / 24.6%. A skirmish with a first-clear reward still drops nothing (call RW2-1).

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

**BF7-4. Your five live edits of 10-21 evening: two were merged with later file changes** · Decide · Cards · asked 2026-10-22 · decided 2026-10-23
- Folded into canonical/cards.json with your stats as printed. Tide Pool Crab: you added Shield 3 while package TR (after your save) gave it Armor 1 back, so it now has Tide + Armor 1 + Shield 3 at 1/3, and no legal line. Glacial Ape-King: your row still had Bounty 1 (TR swapped Bounty for King after your save): it keeps King + Earthquake 4 at your 6/37, 103% of N (its formula line is 6/35). Conch Crawler 1/1 with Shield 4 has no legal line. Ford Kingfisher 0/1 fits (33% of N). Ember Tetra 3/7 is new: no source and no art, and its Tide braces (S 5.4) leave no legal line at any stats.
  - Keep them as folded
  - Crab: drop Armor 1 (your Shield 3 only)
  - Ape-King: Bounty back instead of King
  - Give Ember Tetra a source (map or pack)
- **Default:** Keep them as folded
- **Outcome:** Owner (10-23 00:10): "OKAY" Keep the five live edits as folded (the default).

**BF7-5. 106 band cards still have no legal line: the hand-pass list** · Decide · Balance · asked 2026-10-22 · decided 2026-10-23
- After BF7's re-fit, 106 band cards (plus Conch Crawler and Tide Pool Crab) have no legal line and keep their stats (docs/balance/human-pass-1-flagged-2026-10-21.json). docs/balance/hand-pass-2026-10-22.md gives each the cheapest single change (shrink or drop one skill, never Flying) and the line it would get; the Blue Dragon needs two. None is applied.
  - Apply the cheapest change on each
  - Pick per card
  - Leave them off the formula
- **Default:** Pick per card
- **Outcome:** Owner (10-23 00:10): "OKAY" Pick per card (the default), no bulk change.

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

**AR-1. Standard PvP shares the PvP tickets and the rating** · Decide · Arena · asked 2026-10-21 · decided 2026-10-23
- Package AR split the Arena's PvP into two buttons. Standard PvP is the existing Standard format (every card at Level 1, no foils, a Standard deck built from any card) against the same strangers as Collection PvP, their decks also at Level 1. It uses the same 10 PvP tickets, moves the same rating and pays the same rewards. Your Standard deck is not recorded as a stranger, since it can hold cards you don't own.
  - Keep it shared
  - A separate rating for Standard
  - Separate tickets for Standard
- **Default:** Keep it shared
- **Outcome:** Owner (10-23 00:10): "OKAY. But PVP and Collection share different pools. PVP still keeps the foil treatments." Keep the tickets and the rating shared (the default), but Standard PvP and Collection PvP draw opponents from different pools, and PvP keeps its foil treatments. To build in package RW3. Built (RW3): tickets and rating stay shared; Standard PvP meets Standard decks only and Collection PvP Collection decks only (a Standard deck is recorded into the Standard pool: ghost_decks mode 'pvp', stage 100 + tier, so no SQL change; its own key in the browser; different seeded strangers). A Standard match keeps your foils and Shinies (prestige, Materia and levels still go).

**AR-2. The Undercroft: the Arena's Dungeon as a daily dungeon on Map 11** · Decide · Dungeons · asked 2026-10-21 · decided 2026-10-23
- The Arena's Dungeon (3 fights against random decks, losses carried over) is gone from the Arena; an unfinished run in an old save is no longer offered. In its place the Undercroft opens on Map 11 (the Arena's map) as a daily dungeon: each floor takes a Dungeon key, 50 floors, each harder (half a map further on per floor, +3 bramble Health), a mini-boss every 10th floor, a loss sends you back to floor 1. Every 3 floors the land changes: 15 maps' first elite deck and field rules, in order of their battle rating (Savanna 47 up to Wolfsbane Tundra 106); only floors 46-50 go round to the first. Like Murgle Mayhem, each floor's first clear gives 10 Gold Leaves (500 in all).
  - Keep these defaults
  - Different lands or order
  - Fewer floors
  - No Gold Leaves from the Undercroft
- **Default:** Keep these defaults
- **Outcome:** Owner (10-23 00:10): "Hide for now, note in notes. In fact hide both daily dungeons require future balancing anyway. We havent even decided what special thing htey give." Not the defaults: both daily dungeons (the Undercroft and Murgle Mayhem) are hidden until they are balanced and their special reward is decided; the defaults stay in the notes. To build in package TU2.

**AR-3. The group dungeon is a Coming soon slot** · Decide · Dungeons · asked 2026-10-21 · decided 2026-10-23
- You asked for group dungeons with live players, recorded in the Daily Dungeon section. There is no co-op dungeon in the game yet (only the D49 design, docs/coop-dungeon-design-2026-10-13.md), so the Daily Dungeons tab now ends with a Group Dungeon slot marked Coming soon. Building it means the netcode in that doc (the Ranked Live host, extended to 2-4 players).
  - Build the co-op dungeon next
  - Keep the slot for now
  - Remove the slot
- **Default:** Keep the slot for now
- **Outcome:** Owner (10-23 00:10): "AR-3 This is a big pass. I like this. Can you launch a big pass for this." Build the co-op dungeon next (the first option), as one large pass. To build in package AR3. Built (AR3): the Group Dungeon, the Hollow Warren (4 floors: the Bat Roost; the Mole Galleries, cave-ins; the Salamander Pools, a cursed centre; the Matriarch's Hall, the Hollow Matriarch and her marked column). The Dungeons tab's Group Dungeon slot is the entrance now (Open a room / Play with CPU allies / Join by code; invites from the friends list), shown to every player past the tutorial while the daily dungeons stay hidden. A room seats 2-4 players (the host A, then C, D, B; 3 players add a CPU ally in B), ready-up, leave, host migration (the next player in seat order takes over; a player who can't run the fight ends the run cleanly), drops played by a CPU ally and reconnects. The fight: the raid's multi-row engine board (a front and a back row a side, 7 columns: each row's left seat, the shared centre, the right seat), simultaneous plans with a 30 s timer (60 s casual), landing A, B, C, D then the dungeon; a shared-cell contest goes to who locked first; one host runs the engine and sends each round's plans; every other player replays them on the same seeded engine (a hash per round checks it; a player out of step mirrors the host's state until the next floor). Rewards per player: each floor's chest (Maple Leaves and Magic Dust), the Matriarch's pick of three of the dungeon's own cards (once a day); 5 Energy per climb, back if no floor is cleared. Online today: 2 players (the live coop_rooms seats a host and one guest); 3-4 online wait for supabase/proposed/20261023_coop_rooms_4p.sql (AR3-6). Local: 2-4 players in tabs of one browser. Solo: you and CPU allies.

**AR-4. The match log is this device's last 40 fights** · Decide · Profile · asked 2026-10-21 · decided 2026-10-23
- Recent opponents moved from the Arena to the Profile as a match log with PvP and PvE tabs (opponent, mode, result, date, the deck you faced, and from now on your deck's name). It is what this device records: the last 40 fights (was 20), not Ranked Live, which stays in the signed-in Match History below it. Syncing the log to the account would need a new column or table (SQL for your apply).
  - Keep it on the device
  - Sync it to the account
- **Default:** Keep it on the device
- **Outcome:** Owner (10-23 00:10): "OKAY - it's not sync'd? I think this is okay." Keep the match log on the device (the default).

**TR-1. 24 cards fall to their 1/1 floor with their cut skill back** · Decide · Balance · asked 2026-10-21 · decided 2026-10-23
- HB2-1 gave 69 cards back the skill BF5 cut only because Flying, Tide, Diurnal or Nocturnal counted, and the formula re-fitted them (--only). 45 still fit. 24 have no room under cap 2 and drop to 1/1 (skills kept, flagged like B14): Eagle Diver 1/4, Alpha Howler 1/15, Orca Vanguard 1/21, Snow Owl Sentinel 2/7, Permafrost Mammoth 2/20, Moray Ambusher 2/12, Cave Bat Swarm 2/5, Blind Cave Fish 1/3, Sulfur Vent Crab 2/9, Tide Pool Crab 1/3, Open-Ocean Hermit Crab 1/6, Reef Manta Glider 1/7, Nightshade Moth 1/5, Elder Tortoise 1/15, Vigil Owl 2/9, Willow-o'-Wisp 1/12, Skull Vulture 3/3, Moon Jelly 2/8, Voltwing Bat 1/4, Static Bat 1/6, Sea Cucumber 2/11, Alligator Gar 2/14, Mangrove Manatee 2/17, Giant Clam 1/14 (all now 1/1). 7 more were 1/1 already. The free skills still cost S (Tide 2.79, a time of day about 2.5).
  - Keep: every skill back, 1/1 where the formula says so
  - Take the restored skill off again on these 24 (back to their stats before TR)
  - Price plain Flying / Tide / Diurnal / Nocturnal lower in the budget too
- **Default:** Keep: every skill back, 1/1 where the formula says so
- **Outcome:** Owner (10-23 00:10): "OKAY" Keep: every skill back, 1/1 where the formula says so (the default).

**TR-2. Bounty came back on 7 cards** · Decide · Balance · asked 2026-10-21 · decided 2026-10-23
- BF5 cut Bounty first (your 21:36: "Bounty is way too strong") wherever a card had three skills. On 7 of them the third skill was a free one under HB2-1, so the cut is undone: Monarch Wingblade, Reef Shark, Octopus Tactician, Alpha Howler, Vampire Roost, Bog Behemoth, Tiny Cave Dweller. Bounty is priced at 1 a point (your BF5 value), so the formula took it out of their stats.
  - Keep Bounty on them
  - Keep it cut (Bounty is never restored)
- **Default:** Keep Bounty on them
- **Outcome:** Owner (10-23 00:10): "OKAY" Keep Bounty on the 7 cards (the default).

**TR-3. The Crown's open cases (built as defaults)** · Decide · Rules · asked 2026-10-21 · decided 2026-10-23
- Package TR built your Crown rules. Calls taken: (a) once the Crown fades it is gone for the fight: a later King stays uncrowned; (b) the crowned King killed by an enemy unit while no King is left anywhere: +1 Gold for the killer's side (your kill rule), not the dead King's; (c) friendly fire counts as no source unit (the Crown drops); (d) the King that picks up a dropped Crown, or the liege's pick, is random among that side's Kings (the fight's seeded random); (e) a holder that leaves play without dying (bounced, exiled) drops it as with no source; (f) a crowned unit that an evolute goes over keeps the Crown (it is the same unit).
  - Keep these
  - Let a later King take a fresh Crown after it fades
  - Change (b): +1 Gold for the dead King's side
- **Default:** Keep these
- **Outcome:** Owner (10-23 00:10): "OKAY" Keep the Crown cases as built (the default).

**TR-4. Which cards are Kings** · Decide · Cards · asked 2026-10-21 · decided 2026-10-23
- King given to: Rodent King (Bounty off for the two-skill rule; 4/15 -> 4/14), Glacial Ape-King (Bounty off; 7/36 -> 7/34), Yeti Chieftain (5/22 -> 5/20), The Gannet Queen (3/9 -> 1/10). Not given: the Pride Queen (with King's 2.39 her Quick leaves no room: 2/14 -> 1/1) and the Magnate Duck (King type already; 1/22 -> 1/1); the Quicksand Queen is a trap, not a ruler. Usurper was extended to steal the Crown (the Crown Pretender is the card for it); no new skill was needed.
  - Keep these four
  - Also the Pride Queen and the Magnate Duck at 1/1
  - Name others
- **Default:** Keep these four
- **Outcome:** Owner (10-23 00:10): "No none of our current card are kings. Remove. Only the Magnate Duck. (don't make it 1/1! Maybe King costs too much! - balance on your own.) Also new skill: Liege: {...}. Activates only if the king is on your side. Liege is worth 0.3x {...}. Default Assault N: (Extra N attack only when attacking) where for Liege, N=2." Not the default: King comes off the Rodent King, Glacial Ape-King, Yeti Chieftain and The Gannet Queen; only the Magnate Duck is a King (balance it so it is not 1/1). New skill Liege {...}: the braces apply only while the King is on your side, priced 0.3x the braces; the default braces are Assault N (extra N attack only when attacking), N=2. To build in package EN. Built (EN): King is off the Rodent King, the Glacial Ape-King, the Yeti Chieftain and the Gannet Queen (the Bounty TR took off the first two stays off: BF8 keeps Bounty to the loot carriers); re-fit Rodent King 4/14 -> 3/11, Yeti Chieftain 3/14 -> 4/20, Gannet Queen 1/13 -> 1/15, the Ape-King keeps your 6/37 (it fits); the Magnate Duck is the one King. King re-priced 4 -> 1.4 (0.4 x Kingly at today's prices: Tribute 1 0.5 + Armor 2 x 1.5 = 3.5). The Duck still has no legal line by formula (its other five skills already break cap 2), so it keeps 1/22, not floored (call EN-1). New skills Liege {...} (0.3 x the braces; a plain Liege is Liege {Assault 2} = 1.08) and Assault N (+N on its own swing, never a counter; 1.8 a point), with editor rows, Codex lines and texts in the 12 packs.

**TR-5. Prices for King, Kingly, Tribute and the five transforms (theoretical)** · Decide · Balance · asked 2026-10-21 · decided 2026-10-23
- canonical/skill-costs.json, ownerSet false, B15-style. Tribute 0.5 a point (half of a Lumber income: Gold buys nothing in a fight yet). Kingly 5.98 = Tribute 1 + Armor 2 (2 x 2.74), never printed. King 2.39 = 0.4 x Kingly, as a context skill (the Crown is not certain); with its own braces 0.4 x them. Transforms at CONTEXT_MULT 0.4 x the gain: Gilded {+5/+10} 8, Championed {+3/+3} 3.6, Veteran {+2/+4} 3.2, Matured {+2/+4 Stem stats} 3.2, Enraged 0.4 x its braces. Plain Crepuscular 1.6 (CX2).
  - Keep these prices
  - Raise or lower some (name them)
  - Measure them with tools/skill_worth.js
- **Default:** Keep these prices
- **Outcome:** Owner (10-23 00:10): "See TR-4, otherwise OK." Keep the prices (the default), plus Liege at 0.3x its braces as set in TR-4. To build in package EN. Built (EN): the prices kept, except King 1.4 and Kingly 3.5 (see TR-4), Liege 0.3 x its braces (bramblewood-budget.js CONTEXT_MULT_BY), Assault 1.8 a point, Enraged removed.

**TR-6. Transform conditions, as read by package TR** · Decide · Rules · asked 2026-10-21 · decided 2026-10-23
- Enraged: "It has Rage" is read as its Rage being on (Rage, below half Health); having the skill would trigger it at once. Matured: N rounds, 2 by default (tf.rounds; the editor doesn't set N yet). Veteran and Matured count rounds survived on the field, at each round's start. Championed: a kill by its own swing or its Counterattack against the unit it fights (a Guardian that takes the hit is the one it fights); kills by Arrow, Pounce or other skills don't count. Gilded: Lumber 1, Stone 2, Metal 3, Gold 5 each, more than 25, checked as the board updates. No card has a transform preset yet.
  - Keep these readings
  - Enraged = it has the Rage skill
  - Championed also by skill kills
- **Default:** Keep these readings
- **Outcome:** Owner (10-23 00:10): "OH right. Then instead - remove Enraged. Rage keeps its definition and default. Otherwise, Rage - {...} means the typical effects of Rage, PLUS {...}. Cost it using logic." Not the defaults: the Enraged transform condition is removed; Rage keeps its definition; "Rage {...}" means Rage's usual effects plus the braces, costed by the engine's own logic. To build in package EN. Built (EN): the Enraged preset is gone (engine, editor, skill-costs.json; a saved Enraged card becomes Rage {...} as it loads). Rage {...} (effects.rageGrant beside Rage): Rage as before plus the braces while it rages. Cost: Rage's own price + 0.4 x the braces' S (CONTEXT_MULT_BY.rageGrant: Rage is on for the lower half of its Health, 0.5, and a unit can fall from above half in one blow, x 0.8).

**EV-1. Which cards are the Evomax lines (there was no Evomax unit)** · Decide · Cards · asked 2026-10-21 · decided 2026-10-23
- No Evomax unit existed (Terraumbra, an equipment Easter egg, was the line's only card). Package EV made lines from cards no player can get yet, so the Map 30 gate holds and no reward moved: Slowpoke Sentinel (Stem) -> Canopy Sloth Guardian (Evolute) -> Hanging Loafer (Alpha); Raven Harbinger (Evolute) -> Raven Hexcaller (Alpha) -> Bone Diviner (Omega); Gale Sprite (Evolute) -> Stormcaller (Alpha). They are mechanicLine evolution now. Missing stages are listed as cards to make in docs/evolute-design-2026-10-21.md (a sloth Omega, a storm Omega, an insect Evolute and Alpha for the Cocoon, beetle, frog and dragon lines).
  - Keep these three lines
  - Pick other cards (name them)
  - Make new Evomax cards instead and revert these
- **Default:** Keep these three lines
- **Outcome:** Owner (10-23 00:10): "It's okay. The Terraumbra is an Evomax equipment" Keep the three Evomax lines (the default); the Terraumbra is the Evomax equipment. To build in package EN. Built (EN): nothing to change: the Terraumbra is already an Evomax (mechanicLine evolution) equipment; pinned in tests/en-2026-10-23.js.

**EV-2. When an evolute dies, do the cards under it fire their On Death?** · Decide · Rules · asked 2026-10-21 · decided 2026-10-23
- Built: no. The whole stack goes to the graveyard (or the Removal Zone, wherever the evolute goes) and only the top card's own death effects happen (its On Death, Bounty, Relic ...). The cards under it fire nothing, matching "a unit leaving play this way triggers no On Death, Bounty or grave effects".
  - No: only the top card's death effects
  - Yes: each card in the stack fires its own On Death (top first)
- **Default:** No: only the top card's death effects
- **Outcome:** Owner (10-23 00:10): "No." Only the top card's death effects fire (the default). Built (EN): kept as built (only the top card's death effects fire).

**EV-3. Evolute bases: shared type at every stage, creatures only** · Decide · Rules · asked 2026-10-21 · decided 2026-10-23
- Built: Alpha and Omega also need a shared type with their base (the rule named it for Evolute only). A plain Evolute cannot go over a unit that is already an evolute (no sideways or downward evolving). Structures, cages and a Gladiator leader are never bases, and only front-row units are (a raid's middle and back rows are not). The editor offers Evolute / Alpha / Omega on Evomax cards only.
  - Keep all of these
  - Alpha and Omega need no shared type
  - Allow an Evolute over an evolute
- **Default:** Keep all of these
- **Outcome:** Owner (10-23 00:10): "Yes. But just shared with what it is. Once evolved over, do not reference the card below. OKAY to the rest" Keep all of these (the default), with the type rule narrowed: the type is shared only with the card it sits on at that moment; once evolved over, the card below is no longer referenced. To build in package EN. Built (EN): kept; checked that a stage reads only the type of the card it goes over at that moment (its own derived card) and nothing reads the cards under it (they are only zone entries); the rule is now written in the engine's EV block.

**EV-4. An evolute waits its own Wait again** · Decide · Rules · asked 2026-10-21 · decided 2026-10-23
- Built ("Wait and Lumber costs work as usual"): the stack waits the evolute's printed Wait, even over a Ready base. The CPU counts that against Ready bases. Alternatives: keep the base's remaining Wait, or the higher of the two.
  - Its own Wait (as usual)
  - The base's remaining Wait
  - The higher of the two
- **Default:** Its own Wait (as usual)
- **Outcome:** Owner (10-23 00:10): "Yes. (If it has Wait) It gains remaining Wait as well." Not quite the default: the evolute waits its own Wait and, if it has Wait, also takes on the base's remaining Wait. To build in package EN. Built (EN): an evolute waits its own Wait plus the base's remaining Wait (a Ready base adds nothing); the CPU counts a waiting base's Wait against it.

**EV-5. Evolute prices (theoretical)** · Decide · Balance · asked 2026-10-21 · decided 2026-10-23
- canonical/skill-costs.json, ownerSet false: Evolute 3, Alpha 4, Omega 5 (your suggestion). Stem and Chrysalis 1.6 (0.4 x (2*1 + 2), the +1/+2 they hand over), or 0.4 x their braces' S. The evolutes' printed stats are fitted to their own N; on the board a stack is the sum, so a Stormcaller fitted to 1/23 lands on a base and becomes far bigger. No run can measure this (it rides on the player).
  - Keep these prices
  - Raise them (name the numbers)
  - Price an evolute against its line's summed N instead
- **Default:** Keep these prices
- **Outcome:** Owner (10-23 00:10): "OKAY. (Alpha and Omega should also be 3, since they are difficult to achieve.)" Keep the prices, except Alpha and Omega are 3 as well (Evolute 3, Alpha 3, Omega 3). To build in package EN. Built (EN): Evolute Alpha 4 -> 3 and Omega 5 -> 3 in skill-costs.json; re-fit: Hanging Loafer 2/22 -> 2/23, Stormcaller 1/28 -> 1/29, Raven Hexcaller 1/1 -> 2/2, Bone Diviner 2/2 -> 4/4.

**EV-6. The Nest eggs as fodder, with a species** · Decide · Cards · asked 2026-10-21 · decided 2026-10-23
- The Speckled Egg is a Stem and the Cocoon a Chrysalis. Each got a species (Bird, Insect) so an evolute can share a type with it: eggs had none, so Kin and type skills now count them too. Re-fit by formula: 0/2 -> 0/1. An egg ridden by an evolute never hatches.
  - Keep
  - Keep the skills, no species (then no evolute can use them)
  - Revert the eggs
- **Default:** Keep
- **Outcome:** Owner (10-23 00:10): "OKAY. They will be the only NOT-evomax cards with Fodder. Treat all baby-like cards like this. Oh, and they only gain this at lvl1. (baby-like cards start at 0.)" Keep (the default), widened: every baby-like card gets Fodder, the only non-Evomax cards that do, and only from level 1 (baby-like cards start at level 0). To build in package EN. Built (EN): 23 baby-like cards (by name: kits, cubs, pups, chicks, hatchlings, fledglings, calves, a fawn, a piglet, a spawnling, a fry, the ducklings, the Baby Bat and the Baby Horned Capybara) gain Stem (Fodder) at Level 1 (levelSkills 1), never at Level 0; the eggs keep theirs as before. The list is call EN-6.

**EV-7. The raven evolutes sit at their 1/1 floor** · Decide · Balance · asked 2026-10-21 · decided 2026-10-23
- Following your HB2-1 answer (Flying does not count toward two skills), the ravens keep every skill: Raven Harbinger Flying + Poison 2 + Evolute, Raven Hexcaller Flying + Render + Evolute Alpha, Bone Diviner Flying + On Kill +2 Lumber + Evolute Omega. With Flying's x1.5 the formula puts all three at 1/1 (flagged, skills kept). In a stack they add to the base's stats, so the stack is still big. Without Flying, the Hexcaller and the Bone Diviner were 1/7.
  - Keep: every skill, 1/1
  - Cut Flying on the Hexcaller and the Bone Diviner (back to 1/7)
  - Lower the stage costs for these three
- **Default:** Keep: every skill, 1/1
- **Outcome:** Owner (10-23 00:10): "Okay" Keep: every skill, 1/1 (the default). Built (EN): kept; the Hexcaller and the Bone Diviner moved off 1/1 with Alpha and Omega at 3 (2/2, 4/4).

**RK1. Raid Ticket price in the Shop** · Decide · Raid · asked 2026-10-21 · decided 2026-10-23
- Package RK sells the Raid Ticket (one extra raid fight, past the cap of 10) for 300 Maple Leaves, beside the Rename Ticket (250 Maple Leaves); a fight also pays about 16 Maple Leaves and 12 Dust back. Gold Leaves would make it scarcer.
  - 300 Maple Leaves
  - 250 Maple Leaves (as the Rename Ticket)
  - 500 Maple Leaves
  - 30 Gold Leaves
- **Default:** 300 Maple Leaves
- **Outcome:** Owner (10-23 00:10): "OKAY. But call it like Bonus Raid Ticket and it has a different outline." 300 Maple Leaves (the default), renamed Bonus Raid Ticket, with a different outline from the other tickets. To build in package TU2.

**RK2. A limit on buying Raid Tickets** · Decide · Raid · asked 2026-10-21 · decided 2026-10-23
- Buying stops only while you hold 9; you can buy, use and buy again. Free tickets give at most about 16 fights a raid (10 + 1 a day), so an average player (751 raid damage a fight) tops out near rank A; S needs about 4 bought tickets, U about 24 (7,200 Maple Leaves). Rank is buyable with Maple Leaves unless a weekly limit is added.
  - No limit (hold at most 9)
  - At most 3 bought a week
  - At most 5 bought a week
- **Default:** No limit (hold at most 9)
- **Outcome:** Owner (10-23 00:10): "You can only buy if they have it. It sells out in one (1). It appearing is random." Not an option: the Bonus Raid Ticket is for sale only when the shop randomly has it, and it sells out after one purchase. To build in package RW3. Built (RW3): the Shop has a Raid Ticket only on some days: each local day rolls once (25%, about 1.75 days a week, 7.6 a month; the roll is the day's, so a reload doesn't re-roll). Stock 1: buying it sells it out ("Sold out") until another day rolls one; a day without one shows no ticket. Admin Mode always sees it. Price 300 Maple Leaves as before.

**RK3. The A-rank Raid Ticket only when the raid falls** · Decide · Raid · asked 2026-10-21 · decided 2026-10-23
- Owner: 'completing a raid (with at least A rank) should give you 1x ticket'. Built as: a fall's claim at total raid rank A or better pays 1 Raid Ticket; a raid that ends standing (held) pays none, whatever the rank.
  - Falls only
  - Falls and held raids
- **Default:** Falls only
- **Outcome:** Owner (10-23 00:10): "OKAY" The A-rank Raid Ticket only when the raid falls (the default).

**RK4. Where Raid Tickets drop** · Decide · Raid · asked 2026-10-21 · decided 2026-10-23
- Built: an S notice 30%, SS 60%, SSS 100% (about 0.7 a week at six notices a day), and a raidTicket reward token (a fight's first clear) that is on no fight yet. Chests have no drop table to add it to.
  - Keep (notices only; token unused)
  - Also put the token on a few boss fights
  - Also one per finished weekly tier
- **Default:** Keep (notices only; token unused)
- **Outcome:** Owner (10-23 00:10): "SS, SSS notices should be so rare, maybe once per 1mo/2mo if all notices are always refreshed and completed. S is more common, 0.5-0.7 per week." Not the default: SS and SSS notices become much rarer (about once a month or two if every notice is refreshed and completed); S drops 0.5-0.7 a week. To build in package RW3. Built (RW3): a notice brings a Raid Ticket at S 40%, SS 40%, SSS 40% (was 30 / 60 / 100%). With 6 notices completed a day (42 a week, 182.6 a month) and the rank weights S 3.5%, SS 0.8%, SSS 0.2%: S tickets 42 x 3.5% x 40% = 0.59 a week; SS + SSS tickets 182.6 x 1.0% x 40% = 0.73 a month (one every 1.4 months). Checked over 10,000 simulated weeks.

**RK5. The total rank ladder against the ticket budget** · Decide · Raid · asked 2026-10-21 · decided 2026-10-23
- Kept as given (F 800 .. A 9,000, S 15,000 .. U 30,000). At 751 raid damage a fight (BF5's model) the ranks take 2 / 2 / 4 / 7 / 10 / 12 / 20 / 27 / 34 / 40 fights; free tickets allow about 16 a raid (12 when it falls on day 3), so S and up need bought tickets or wins at high fight ranks (a win at SSS counts 2,000, so U in 15). Fine as an aspiration, or scale the top?
  - Keep the ladder
  - Scale S..U down (e.g. 12k / 14k / 16k / 18k)
- **Default:** Keep the ladder
- **Outcome:** Owner (10-23 00:10): "30,000 is only possible if they hit SSS 15 times. Anyway, in the future, there might be other ways to get more raid tickets." Keep the ladder (the default).

**HB2-1. Swordbill Challenger keeps three skills as a thematic exception** · Decide · Cards · asked 2026-10-21 · decided 2026-10-21
- Package HB2's new Very Rare Hummingbird (3/5, Wait 1, Flying + Taunt + Counterattack, 98% of N) has three skills. The two-skill rule's tests only exempt Epic and up, Supreme, hidden, Easter-egg and token cards, so the card is named in a THEMATIC set in tests/bf5-2026-10-21.js and tools/two_skills_2026_10_21.js. Alternatives: drop Flying (a Hummingbird that walks) or fold Counterattack into Taunt.
  - Keep three skills as a named exception
  - Cut to two (Taunt + Counterattack, no Flying)
  - Cut to two (Flying + Taunt)
- **Default:** Keep three skills as a named exception
- **Outcome:** Owner 18:23: plain Flying, Tide, Diurnal and Nocturnal don't count toward the two-skill limit; several of them count as 1. Built by package TR (bramblewood-budget.js skillCountOf, the two-skill tool, the editor's budget panel). The Swordbill Challenger is within the rule; 69 cards got back the skill BF5 cut only because one of these counted.

**RP1. Faction rewards' map term in the stat budget** · Decide · Rewards · asked 2026-10-21 · decided 2026-10-23
- A faction Rare can't be had before Map 14 and a Very Rare before Map 25 (the faction reward track), but cardObtainMap still counts every faction reward as a pack card (Map 5) for N's Map x 0.2. Changing it moves N for the 42 faction cards (package BF5's stats).
  - Follow the gate (Common 0, Uncommon ~7, Rare 14, Very Rare 25 ...)
  - Keep Map 5 for all faction cards
- **Default:** Keep Map 5 until BF5 lands
- **Outcome:** Owner (10-23 00:10): "Actually OKAY!" Keep Map 5 for faction cards until BF5 lands (the default).

**RP2. The later faction gates** · Decide · Rewards · asked 2026-10-21 · decided 2026-10-23
- Proposed: Very Rare at 50 received and Map 25; Super Rare 60 / Map 30; Epic 70 / 35; Heroic 80 / 40; Unique and up 90 / 50 (FACTION_RARITY_GATES). The sim puts about 76 received by Map 25 and 111 by Map 40.
  - Keep the proposal
  - Other numbers
- **Default:** Keep the proposal
- **Outcome:** Owner (10-23 00:10): "OKAY" Keep the proposal (the default).

**RP3. Quarry Mole out of Base** · Decide · Rewards · asked 2026-10-21 · decided 2026-10-23
- The Quarry Mole (Darksight, Keen Sense, 1 Lumber) is a Base card everyone owns. Proposal: make it a Caves & Alcoves (Map 8, 8-1) reward; the Badger Lumberjack on 1-4 is the Lumber introduction now, and the plain Harvest Mouse is already Base.
  - Move the mole to 8-1
  - Keep it in Base
- **Default:** Move the mole to 8-1
- **Outcome:** Owner (10-23 00:10): "YES! See earlier non-registered complaint" Move the Quarry Mole to 8-1 (the default). Package not named in the 10-23 split; card data, assign when queued. Built (RW3): the Quarry Mole is Caves & Alcoves' 8-1 first-clear card (source map m4 / 8-1; Thistlewood's pool -> Caves & Alcoves'). The "earlier complaint" was N22-8 (its effects too advanced for the start): T-1 no longer pays it, even though the live tutorial config still lists it (the game skips it; supabase/proposed/20261023_rw3_tutorial_reward.sql clears the list, on "apply it"). 8-1 fights with two Quarry Moles; Thistlewood's 1-2 / 1-3 / 1-4 decks lost theirs (Field Vole, Harvest Mouse, Compost Grub; 1-4's showcase is the Field Vole). Call RW3-9.

**RP4. Plain start for Hummingbirds, the 0-2 pack and the tutorial rewards** · Decide · Rewards · asked 2026-10-21 · decided 2026-10-23
- Every Hummingbird faction card flies (no plain one), the 0-2 faction pack's third card is any basic-pack card, and the tutorial's reward cards (Rabbit Kit, River Warden, Sunspire Envoy, Riverwing Envoy) have skills. The pass made skirmish rewards and the faction picks plain on Maps 0-1 only.
  - Add a plain Hummingbird common and plain tutorial rewards
  - Leave as is
- **Default:** Leave as is
- **Outcome:** Owner (10-23 00:10): "I can balance the hummingbirds myself later. The hummingbird and otter factions should be symmetric." Leave as is (the default) for now; the owner balances the Hummingbirds later, and the two factions are to end up symmetric.

**RP5. Held cards: the Canopy's rainforest animals, the Thistle Baron, Eyrie Heights' theme** · Decide · Rewards · asked 2026-10-21 · decided 2026-10-23
- 15 Canopy animals are held for a Map 25 rainforest (the Savanna Reaches has room for 10 now); the Thistle Baron (Map 1's leader, Thorns) is held for Map 21+; Eyrie Heights' chapel birds are Ecclesia (Map 77), so Map 11 still fields cards nobody can collect; the Basalt Foundry's fights are Devilry (Map 66).
  - Keep them held and re-theme Map 11 and the Foundry
  - Put the Canopy animals on Map 14 now
- **Default:** Keep them held
- **Outcome:** Owner (10-23 00:10): "OKAY" Keep them held (the default).

**RP6. The last side-map gates** · Decide · Maps · asked 2026-10-21 · decided 2026-10-23
- Gated now (after Map N cleared, fights count as Map N): Clovermead 5, Lilypad Reach 6, Smugglers' Grotto 7, Sunken Grove 9, Mycelium Deep 11, Glimmer Depths 12, Sunken Depths 14, Aerie Vault 15, Canopy 18, Ice Hollow 21, Basalt Foundry 23. Kept: the Pale Desert (after Map 18), the Eye of the Volcano and the Volcano Lair (after 20-10), the Old Bramble (after the Ice Hollow, still counting as Map 17).
  - Pale Desert after Map 22, the Eye and the Lair after Map 24, the Old Bramble as Map 21
  - Keep these four as they are
- **Default:** Keep these four as they are
- **Outcome:** Owner (10-23 00:10): "OKAY" Keep these four as they are (the default); DV7 replaces the list.

**DV1. The rarity ladder past Map 20** · Decide · Rarity · asked 2026-10-22 · decided 2026-10-22
- Package DV set the ladder (arena_app.js RARITY_INTRO): Common 0, Uncommon 1, Rare 5, Very Rare 10, Super Rare 20, Epic / Heroic by the Eye of the Volcano / the Volcano Lair (the main road fields them from Map 22). Proposed past that: Unique 30, Legendary 40, Mythic 55, Ancient 70, Divine 90. A skirmish caps at Super Rare on 20-29, Epic 30-39, Heroic 40-49 ...; an elite one step more, a boss two.
  - Keep the proposal
  - Other maps
- **Default:** Keep the proposal
- **Outcome:** Owner 07:41: OK, with changes. Heroic moves to Map 25 and Mythic to Map 60 (Epic 22, Unique 30, Legendary 40 as proposed). Ancient, Divine, Void and Daemonic never appear on the road (road skirmishes or road rewards): only special quests and dungeons give them, and Mythic is the highest rarity the road reaches. The Volcano Lair and the Eye of the Volcano still introduce the first Heroic and Epic (side maps may exceed the road). Built by package DV2 (arena_app.js RARITY_INTRO, ROAD_MAIN_FROM, ROAD_NEVER).

**DV2. Map leaders outside the ladder** · Decide · Rarity · asked 2026-10-22 · decided 2026-10-23
- The 11 Heroic map leaders a boss pays on Maps 0-19 (Sergeant Bramblefox to the Yeti Chieftain) and the Triumvirate (Unique, 23-8) come before Heroic and Unique are revealed. DV kept them outside the ladder, as the old road cap did.
  - Keep leaders outside the ladder
  - Re-rank the leaders to their map
- **Default:** Keep leaders outside the ladder
- **Outcome:** Owner (10-23 00:10): "OKAY" Keep the map leaders outside the ladder (the default).

**DV3. 1-2 skirmish rewards per map, not per fight** · Decide · Rewards · asked 2026-10-22 · decided 2026-10-22
- Read as per map: each main map pays 1-2 cards from fights (its last fight carries its top card); its other pool cards are basic-pack cards of that map. Most fights now give no card of their own (the base track still gives one on every elite and boss, the faction track every 8th win and each map end).
  - Per map (as applied)
  - Per fight: 1-2 cards on every fight
- **Default:** Per map (as applied)
- **Outcome:** Owner 07:41: per map, by new cards. 10 new cards from that map = 3 skirmish rewards, 6-9 = 2, under 6 = 1; about 2 is the normal. 'New' = a pool card that first appears on that map (not carried over from an earlier map), and one the map gives out (Base and starter cards are not counted). Built by package DV2: 16 maps pay 3, 8 pay 2, Map 21 pays 1; Map 1 keeps the Badger Lumberjack at 1-5.

**DV4. Packs gated by map and rarity** · Decide · Rewards · asked 2026-10-22 · decided 2026-10-23
- A basic-pack card now comes out of a pack or the base track only once its map is reached (source.map) and its rarity revealed (packCardReached); before, any pack card of any rarity came out from Map 5.
  - Keep the gate
  - Gate by rarity only
  - No gate
- **Default:** Keep the gate
- **Outcome:** Owner (10-23 00:10): "No keep packs completely random. Packs outputs can never be changed by anything" Not the default: no gate by map or rarity; a pack's output is completely random and nothing changes it. To build in package RW3. Built (RW3): packs draw from their whole pool: no map gate, no rarity gate, no Lumber-before-pitching gate (a Lumber card that comes early waits for pitching, as other grants do). Nothing remembers earlier packs: the 10-12 recent-pull weight and the new-card guarantee (Tidemire Chest, Highcrest Case) are off. Prices and where packs are sold are unchanged. The card drop, the base reward track and a raid claim's pack cards keep the gate (they are not packs). Calls RW3-3.

**DV5. Boss cards re-ranked for the ladder** · Decide · Rarity · asked 2026-10-22 · decided 2026-10-22
- The Caldera Wyrm and the Magnate Duck Legendary to Heroic, The Contradiction Unique to Epic, the Fire Drake Hatchling Common to Heroic (the Lair's reward). The Cathedral Eagle (Legendary, Ecclesia, held for Map 77) left 21-6 (the fight keeps its name); the Grovebearer Dragon-Turtle (Legendary) left 23-8 and is held for Map 40. The Caldera Wyrm is priced its own way and was not re-fitted (6/36).
  - Keep
  - Restore the Legendaries as boss exceptions
- **Default:** Keep
- **Outcome:** Owner 07:41: OK, keep. (Package DV2: with Heroic from Map 25 the Magnate Duck left Map 24's boss deck, see DV8.)

**DV6. Faction track gates after Map 20** · Decide · Rewards · asked 2026-10-22 · decided 2026-10-23
- Replaces RP2: Very Rare at 50 received, Map 20 and the Volcano Lair cleared (owner: after Map 20's strongest submap); Super Rare 60 / Map 22 / the Lair; Epic 70 / Map 26 / the Eye; Heroic 80 / Map 30 / the Lair; Unique and up 90 / Map 40.
  - Keep
  - Other numbers
- **Default:** Keep
- **Outcome:** Owner (10-23 00:10): "OKAY" Keep the faction track gates (the default).

**DV7. Side-map gates, out of order** · Decide · Maps · asked 2026-10-22 · decided 2026-10-23
- Replaces RP6's list: Clovermead after Map 12, Lilypad Reach 6, Smugglers' Grotto 7, the Mycelium Deep 8, the Sunken Depths 11, the Sunken Grove 13, the Aerie Vault 15, the Glimmer Depths 16, the Canopy 18, the Pale Desert 19, the Ice Hollow 21, the Basalt Foundry 23; the Old Bramble after the Ice Hollow; the Eye and the Lair after 20-10. Fights count as the gate map.
  - Keep
  - Other gates
- **Default:** Keep
- **Outcome:** Owner (10-23 00:10): "OKAY to be out of order." Keep the side-map gates, out of order (the default).

**DV8. The Magnate Duck cannot be Map 24's boss under the new ladder** · Decide · Rarity · asked 2026-10-22
- Heroic is introduced on the road at Map 25 (DV1), but the Magnate Duck (Heroic, was Legendary) was the named boss card of 24-8, The Magnate Duck. Package DV2 swapped it out for the next card of its theme (a third Gilded Swan Knight; the boss keeps its name, hqHp and rules) and removed it from Map 24's pool; the card stays Heroic with no source. Options: leave it held for Map 25+, re-rank it to Epic (then refit its stats, 1/22 has no legal line) and put it back in 24-8, or move the fight's name to Map 25.
  - Held for Map 25+ (now)
  - Re-rank to Epic and put it back in 24-8
  - Other
- **Default:** Held for Map 25+ (now)

**SK-1. Sergeant Bramblefox: Rare, Map 13, the leader of Fox Run** · Decide · Rarity · asked 2026-10-22 · decided 2026-10-23
- Owner 09:52: lower its rarity and move it to another map, as that map's reward and in its skirmish. Done (package SK): Heroic -> Rare, from Map 0 (0-4) to The Redwood Deep (Map 13), the leader (showcase) of 13-2 Fox Run and paid when 13-2 is cleared (grantClearedBossLeaders reads its source, so clearing 0-4 no longer pays it; a player who already holds it keeps it). Why there: the lore bible's Greenhood Band (foxes, magpies and outcast mice) lives in the Redwood Deep and the Briar Maze, and Fox Run's deck is the foxes (Fox Kit, Swift Fox). Rare is allowed from Map 5 and is below Map 13's Very Rare cap, so it is the deck's top card. Re-fitted by the formula at Rare and Map 13: 4/12 -> 3/10 (89% of N), cost 1, no skills. Map 13's pool holds it under SPECIAL (the MAP list is full at 10). Fox Run now: Berserker Boar 4, Fox Kit 3, Swift Fox 3, Grizzly Vanguard 3, Tasmanian Devil 2, Bramblefox 1 (Lynx and Fawn Scout out, so it leads the deck); battle rating 61 -> 56. Heads-up: a live `__cfg:map-pools:mr` row would win over the file; the admin's Map cards editor shows it.
  - Keep: Rare, 13-2 Fox Run
  - Another map (the Briar Maze's Quill Path 12-2, the Greenhood Band's other home)
  - Another rarity (Uncommon, or Very Rare at Map 13)
- **Default:** Keep: Rare, 13-2 Fox Run
- **Outcome:** Owner (10-23 00:10): "OKAY" Keep Sergeant Bramblefox: Rare, 13-2 Fox Run (the default).

**SK-2. Skirmish leaders picked by hand (the highlighted card changes)** · Decide · Maps · asked 2026-10-22 · decided 2026-10-23
- Owner 09:52: from Map 2 every skirmish's leader is its highlighted (showcase) card. The leader is the chosen showcase, else the Auto pick (top rarity, then Attack + Health/2). Where that Auto pick is a small card beside a much bigger unit (for example a 1/1 Rare beside a 1/25 Common that costs 3) I set `showcase` by hand to the biggest unit by cost and strength, so the highlighted card, and the leader, changes on these 14 fights: 5-3 and 5-4 Venomlord Serpent; 15-1 and 15-4 Cataphract Destrier; 17-1, 17-3 and 17-A-1 Glacial Ape King; 18-2 Komodo Warlord; 20-1 and 20-4 Cave Warlord; 21-3 Glacier Yak; 22-2 Gorge Wyrm; 19-A-4 Pyroclast Wyrm; 14-A-2 Ancient Sloth Titan. Every other fight keeps its Auto pick as the leader (the 2-1 crab is yours). Change a leader in the Showcase picker (Admin): the leader follows.
  - Keep these picks
  - Back to Auto everywhere (the strongest by rarity)
  - Tell me which to change
- **Default:** Keep these picks
- **Outcome:** Owner (10-23 00:10): "OKAY" Keep the hand-picked leaders (the default).

**SK-3. Skirmish sizes: 8 sevens, and three fights that rate higher with their leader** · Decide · Balance · asked 2026-10-22 · decided 2026-10-23
- 149 skirmishes (main maps and side maps) now hold 5-7 different cards: 47 have 5, 94 have 6, 8 have 7 (7 only with a clear leader: 7-2, 22-4, 2-A-3, 19-A-5, 14-A-3, 20-B-1, 18-A-3, 18-A-7; was 28 sevens, and 14 decks of 8 to 12 cards, all on the side maps). 17 fights had 4 cards and got a fifth from the map's pool. The leader counts double in the battle rating, so I traded copies (and, in 15 fights, a heavy card for a lighter one the map already uses) to keep each rating within about 10% of before; the smallest decks (rating 20) rise by 2, which is a leader's minimum. Three fights stay above: 16-4 (39 -> 52), 21-2 (63 -> 74) and 20-B-3 (46 -> 61), where the rest of the deck is already Common so copies cannot offset a Rare or Very Rare leader. Not touched: the Tutorial map's lesson fights (T-2 has 7 cards and T-3 has 8, they teach with a hand-picked lineup), the endless dungeons' generated floors, elites and bosses, and Maps 0-1 (no leaders, sizes only).
  - Keep
  - Give those three a lighter leader (a Common showcase)
  - Allow more sevens
- **Default:** Keep
- **Outcome:** Owner (10-23 00:10): "OKAY (7 cards should be rare - 8 7s is okay i think)" Keep (the default): 8 skirmishes with 7 cards stays; 7 is meant to be rare.

**T3. Apply the server-checked fights migration** · Decide · Server · asked 2026-10-03 · decided 2026-10-23
- The fight_sessions migration (single-use seed, transcript, server replay) is written and the client is ready. Nothing changes until it is applied. Owner answered OKAY on 10-23; this is a live database write, so it waits for him to say 'apply it'.
  - Say "apply it" and I run supabase/migrations/20261003_fight_sessions.sql
  - Wait
- **Default:** Wait (local seeds keep working)
- **Outcome:** Owner (10-23 06:59): "Apply it". Checked live (read-only): the fight_sessions migration was already applied on 2026-10-16 (Supabase migration 20261016012658); nothing to run. This item was out of date.

**D17. Sound direction and sourcing** · Decide · Sound · asked 2026-10-03 · decided 2026-10-23
- Overall feel for the cue sheet (sfx-cue-sheet.md), and whether to use CC0 packs or your own recordings. Real samples will beat more synthesis; I can't download them from here. Owner (10-23 00:10): "The musics right now have to be improved. only 2-3 tracks are usable." Not a pick between the options: the music needs better tracks, and only 2-3 are usable now, so it needs CC0 files from him (see the 10-23 backlog).
  - A. Cosy and organic
  - B. Chiptune
  - C. Mixed (organic world, chiptune UI)
  - Drop CC0 files (Kenney Impact/Casino) into audio/
  - Send your own files
- **Default:** C, CC0 when files arrive
- **Outcome:** Default taken (DC3, 2026-10-23): C, mixed (an organic world, chiptune UI), with CC0 sounds when files arrive. The music still needs better tracks, which waits on CC0 files from him (an owner to-do in docs/action-items.md, not a decision).

**D18. Play Maps 1–4 and say how difficulty and rewards feel** · Feedback · Balance · asked 2026-10-03 · decided 2026-10-23
- Map 1 is an on-ramp; Maps 1–2 have reward cards; Map 2 retuned. Note: since 2026-10-08 Conquest fights default to Open mode (no collapsing), which changes how the AI and positions play, so the old difficulty numbers need a re-check.
- **Default:** I re-simulate win rates under Open mode next
- **Outcome:** Owner (10-23 00:10): "played - seems OKAY" Maps 1-4 feel right; no change to difficulty or rewards.

**L1. Which beasts the Hummingbirds befriend; proposed card renames** · Decide · Lore · asked 2026-10-06 · decided 2026-10-23
- Open questions from lore-bible.md. Dogs and cats are settled (see L2).
- **Default:** Keep current names
- **Outcome:** Default taken (DC3, 2026-10-23): Keep current names: no card is renamed, and the Hummingbirds befriend the big beasts only (stags, bears, boars, big cats), as the lore bible already says. The rename table in docs/lore-bible.md stays a list of proposals he can pick from any time.

**I1. Native-speaker review for Tagalog, Tamil, Japanese and Korean** · Decide · Languages · asked 2026-10-06 · decided 2026-10-23
- Machine-quality translations ship now (including card names). A native pass would catch tone and idiom.
  - Find reviewers
  - Ship as is
- **Default:** Ship as is
- **Outcome:** Owner (10-23 00:10): "OKAY" Ship as is (the default); no native-speaker review for now.

**I2. Translate text that contains numbers** · Decide · Languages · asked 2026-10-08 · decided 2026-10-23
- Lines like "3 cards", "Pack 2 of 10", "N new cards!" stay English because the translator matches whole strings. Fix: number-aware templates for each language.
  - Approve the template change
  - Leave English
- **Default:** Approve
- **Outcome:** Owner (10-23 00:10): "Template change" Approve the template change (number-aware templates for each language). Package not named in the 10-23 split (translations); queue it as an i18n package. Built (SX): 18 TX templates replace 33 numbered literals in arena_app.js (achievements, daily and weekly quests, the Lumber rules, the battle-rating colours, the raid's Top N%), plus the 3 results.raid-tier-top keys. In the 12 packs 396 numbered rows (33 a language) became 216 template rows (18 a language); every old row still translates to what it said. The page translator now writes a template's number the language's way (4,000 is 4.000 in German, 2.5 is 2,5 in French). tools/text/templatize_numbers.py does and checks it; keyify reuses a number template; tools/i18n_ui.py counts numbered texts a template covers.

**H1. Hero levelling pace, stat prices, and Materia socketing (v2)** · Feedback · Hero · asked 2026-10-06 · decided 2026-10-23
- Play a few fights with a Hero and say how it feels; do you want Materia socketing next?
- **Default:** Play a few fights with a Hero, then answer
- **Outcome:** Owner (10-23 17:34): "Maybe all uniques and above are also liable for materia (gem) socketing - but only 1. Costs to apply, costs to remove." Materia socketing comes next: besides Heroes, every card of Unique rarity or above can take one materia (gem) socket, never more; applying a gem costs and removing it costs (placeholder prices, editable in the master hub like the other upgrade costs, UI4-1). No comment on the Hero levelling pace, so it stays as built (SX-2). New work: a design and build package (docs/action-items.md, 10-23 17:34).

**H2. The 3-part Hero XP bar (feedback item 17)** · Decide · Hero · asked 2026-10-08 · decided 2026-10-23
- How the three XP bars should split (battle XP, Materia XP, ...?) — needs your picture of it.
- **Outcome:** Owner (10-23 00:10): "Battle XP, Materia XP, Battle XP OR Materia XP. But if you use Battle XP for the 3rd section, there is a 25% inefficiency." The Hero XP bar has three sections: Battle XP, Materia XP, and a third that takes either; filling the third with Battle XP is 25% less efficient. To build in package SX. Built (SX): each level's need (heroXpToNext) is split in thirds: Battle, Materia, Either. Battle XP fills only the first, Materia XP only the second; the third takes Materia 1:1 and Battle at 75% (HERO_XP_EITHER_BATTLE). A level is gained when all three are full; XP past a full part waits for the next level. The save keeps two pools (xpB, xpM since a base level, lvBase); h.xp stays the plain total. Old saves keep their level and their XP into it becomes Battle XP. The Hero Hall shows the three parts (Either split: Materia violet, Battle striped ember), the rule as the bar's tooltip and as a line under it, each part's numbers on hover. Calls SX-2, SX-3.

**E1. A free pack for guests before sign-in** · Decide · Economy · asked 2026-10-08 · decided 2026-10-23
- Let a guest open one Sprout Pouch before asking them to sign in.
  - Yes
  - No
- **Default:** Yes
- **Outcome:** Owner (10-23 00:10): "No." No free pack for guests before sign-in.

**E2. Disenchant values (Magic Dust per extra copy)** · Confirm · Economy · asked 2026-10-08 · decided 2026-10-23
- Built with: Common 5, Uncommon 8, Rare 15, Very Rare 20, Super Rare 30, Epic 40, Heroic 50, Unique 60, Legendary 100, Mythic 150, Ancient 200. Never Base/Quest/levelled/foil/Shiny; keeps one copy.
  - Keep
  - Change the numbers
- **Default:** Keep
- **Outcome:** Owner (10-23 00:10): "5/10/25/45/65/100/150/250/400/700/1200/2000+ etc." Change the numbers (not the default). Taken in rarity order: Common 5, Uncommon 10, Rare 25, Very Rare 45, Super Rare 65, Epic 100, Heroic 150, Unique 250, Legendary 400, Mythic 700, Ancient 1200, and the next rarity above Ancient 2000+; RW3 checks the rarity list and the "etc.". To build in package RW3. Built (RW3): Magic Dust per plain spare copy, RARITY_DEFS order: Common 5, Uncommon 10, Rare 25, Very Rare 45, Super Rare 65, Epic 100, Heroic 150, Unique 250, Legendary 400, Mythic 700, Ancient 1,200, Divine 2,000, then x1.5 a step for the "etc.": Void 3,000, Daemonic 4,500. Starter as Common (Starter cards can't be melted anyway); special rarities as their tier (Quest = Uncommon, Special and Event-Rare = Rare, Dev- / Event-Legendary = Legendary, Dev-Ancient = Ancient). Foil, Shiny, skin and extended art still multiply it. Was a % of a Materia Unit (Common 2, Rare 8, Legendary 42).

**E3. Shiny look** · Decide · Cards · asked 2026-10-08 · decided 2026-10-08
- **Outcome:** Hue shift, not a foil: the art is recoloured by a fixed per-card hue (90–270°), soft white glow, twinkling ✦. Prism stays a foil treatment.

**C1. Which cards get the six new finishes (Hex, Etched, Ice, Gold leaf, Reverse, Prism)? (you said later)** · Decide · Cards · asked 2026-10-08
- Hex, Etched, Ice, Gold leaf, Reverse and Prism are built (Effects Lab → Card treatment centre). Who gets them: rarities, events, pack tiers, prestige? Owner (10-23 00:10): "- later. Pack foil chances - evaluate also. Should be rare." Stays open for later; the pack foil chances are to be evaluated in package RW3 and kept rare. Built (RW3, the pack-foil part): a card comes out foil 1% (Hedgerow Pouch), 1.5% (Tidemire Chest), 2% (Highcrest Case, Mystery Booster), faction packs 1%; was 4 / 8 / 12 / 10 / 4%, and every Highcrest Case had one foil guaranteed (about 1.3 foils a Case; now 0.16). An Advanced pack's first five cards keep 10x (10 / 15 / 20%). Call RW3-4.
- **Default:** Later (pack foils are already rare, RW3-4)
- **Outcome:** Owner, 2026-10-25 17:53: "C1 seems ok already..."

**G1. Combo counter** · Decide · Battle · asked 2026-10-07 · decided 2026-10-23
- A counter for chains of triggered abilities in one round, with escalating sound/visuals.
  - Build it
  - Skip
- **Outcome:** Owner (10-23 00:10): "No." Skip the combo counter.

**G2. Siding with Otters or Hummingbirds: approve the proposal as written, or answer its questions (a)-(f) first?** · Decide · Lore · asked 2026-10-08
- (Rewritten 10-23 at the owner's request, all inside this item; the older siding-proposal-2026-10-08.md is source material, to move into the hub later.) What it is: the player is a traveller both peoples want on their side: the Otters (Rivergate Legion) and the Hummingbirds (Sunfeather Tribes). A hidden Standing number from -100 (Otters) to +100 (Hummingbirds) moves with the player's choices, and the band it sits in decides which rewards, titles, shops and story branches open. Where it lives today: the side picked in the tutorial is stored as `bramblewood_arena_faction` (saveFactionChoice / loadFactionChoice, arena_app.js) and today only sets the starter deck, the voice in warnings and the faction pack; cards carry `faction` (14 Hummingbird cards, 27 base) and `source.side` ('tribes', 'shared'); the faction reward track (noteFactionReceived) counts faction-pack pulls. Dialogue choices already exist (playDialogue with onDone replies, for example the Old Well in visitOldWell). Nothing reads a Standing yet. What siding changes for the player: (1) Reward cards: some skirmishes offer two reward cards, one per side; the player gets the one matching their band, Neutral gets a third (road-folk, dog or cat card). (2) Side shops: a Legion Quartermaster and a Tribe Trader on later maps, different stock. (3) Titles and character looks (Legion Outrider, Friend of the Tribes, Wanderer of Both Banks). (4) Materia leaning: Otter crafting nudges Shield/Formation, Hummingbird crafting Flight/Bond. (5) Story: dialogue warms or cools by band; from Map 6 a key skirmish plays differently by band; a Neutral track keeps the peace through a series of tests, hardest, with unique rewards. (6) It never locks a people's cards away: off-side cards stay in packs and the Market, only the story rewards differ; and nobody is punished for the tutorial pick. What moves Standing: dialogue choices +/-2 to 8 (no number shown on the button), first clears of one people's skirmishes +/-1 (fighting Otters drifts you to the Hummingbirds and the reverse), side quests +/-5 to 15 (a few per map, often exclusive), neutral acts (helping dogs, cats, road-folk, the Traveller) pull toward 0. Drift is slow: 2-3 maps of consistent choices to a friend band, most of the campaign to be Sworn. Five bands: Sworn Otter (<= -60), Otter friend (-59 to -20), Neutral (-19 to 19), Sunfeather friend (20 to 59), Sworn Sunfeather (>= 60); a two-coloured banner on Profile and the Conquest map shows the band. Build in four steps: (1) the Standing store (saved with the account), the banner and hidden weights on dialogue choices, Old Well first; (2) two-sided reward cards on 3-4 skirmishes of Maps 1-3, picked in the skirmish editor; (3) two side quests per map for Maps 1-3; (4) side shops from Map 4, titles, the Map 6 fork. Open questions for you: (a) start at +/-10 from the tutorial pick, or everyone at 0? (b) is the meter shown as a number or only as the band name? (c) is Neutral a full third path with its own ending, or only a resting place? (d) should the two-sided rewards and the side quests wait until the factions are symmetric (RP4), so neither side is the stronger pick? (e) how does siding interact with the Hummingbird gate (the faction pack) and the 0-2 faction pack? (f) can the player reset Standing, or does drift back by effort only? Options stay: Approve as written, Change parts, Not yet. Waiting for your pass over (a)-(f).
  - Approve as written
  - Change parts
  - Not yet
- **Outcome:** Owner, 2026-10-25 17:53: "G2: OKAY" Approved as written.

**T1. Catch-up mechanics** · Discuss · Design · asked 2026-10-03 · decided 2026-10-23
- Rested XP, a weekly comeback quest tier, cheaper early Conquest once you've cleared further, a gentler curve.
- **Outcome:** Owner (10-23 00:10): "OKAY" Catch-up mechanics: the four ideas listed are approved as a direction.

**T2. Replays** · Discuss · Design · asked 2026-10-03 · decided 2026-10-23
- Watch-only or re-fight this deck? Share links? How many to keep?
- **Outcome:** Owner (10-23 00:10): "OKAY to all, max past 20" Replays: all the options listed are approved, and the keep-count goes past 20.

**N1. The Nest repeats the Codex** · Discuss · Design · asked 2026-10-08 · decided 2026-10-23
- You noted the Nest overlaps the Codex. Kept for now. Ideas when you're ready: the Nest as your trophy shelf (Shinies, foils, prestige), or merge it into Codex as an Owned filter.
- **Default:** Keep for now
- **Outcome:** Owner (10-23 00:10): "Nest only lists baby/eggs or level 0 base cards (in two tabs) - these are like 'recruits'. Faction cards also start at level 0." Not the default (keep for now): the Nest lists only baby/egg cards and level-0 base cards, in two tabs, like recruits; faction cards also start at level 0. To build in package TU2.

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

**S1. Apply the admin player list function** · Decide · Server · asked 2026-10-08 · decided 2026-10-23
- The Admin → Players portal reads one admin-only, read-only database function (admin_list_players: profiles, levels, currencies, cards, matches; no emails). Written in supabase/proposed/20261008_admin_list_players.sql. Applying it (and the panel that reads it, already drafted) was held for your OK. Owner answered OKAY on 10-23; this is a live database write, so it waits for him to say 'apply it'.
  - Say "apply it" (admin list)
  - Wait
- **Default:** Apply
- **Outcome:** Owner (10-23 06:59): "Apply it". Checked live: admin_list_players was already applied on 2026-10-16 (migration 20261016012550); nothing to run.

**S2. Anti-cheat tier 1** · Decide · Security · asked 2026-10-08 · decided 2026-10-23
- Players can currently edit their own rating and currencies from the browser console. Tier 1 makes rating read-only and refuses any single write that adds more than 2,000 Maple / 200 Gold Leaves. supabase/proposed/20261008_anticheat_tier1.sql. Owner answered OKAY on 10-23; this is a live database write, so it waits for him to say 'apply it'.
  - Apply tier 1
  - Change the caps
  - Wait
- **Default:** Apply tier 1
- **Outcome:** Owner (10-23 06:59): "Apply it". Checked live: anticheat_tier1 was already applied on 2026-10-16 (migration 20261016012841); nothing to run.

**S3. Leaked-password protection needs Supabase Pro: upgrade to turn it on, or skip it?** · Do · Security · asked 2026-10-08
- Supabase dashboard → Auth → Passwords → leaked password protection. Free, one click, needs your login. Owner (10-23 00:10): "Needs you to use my chrome." Needs a Chrome session with the owner. 10-23 06:59 (Chrome session): the dashboard toggle "Prevent use of leaked passwords" is "Only available on Pro plan and above"; the org is on the Free plan, so it was not turned on (nothing is bought). Free alternative on the same panel: password requirements (e.g. letters + digits) and a longer minimum length; not changed without the owner's word.
  - Upgrade to Pro and turn it on (your purchase)
  - Skip it
- **Default:** Skip it
- **Outcome:** Owner 2026-10-30 23:25: default. Skip it.

**S4. SonarCloud as well as CodeQL?** · Decide · Security · asked 2026-10-08 · decided 2026-10-23
- CodeQL now scans every push (free, GitHub → Security). SonarCloud adds code-quality and duplication reports; it needs you to sign in at sonarcloud.io and add a token. Owner (10-23 00:10): "Chrome". Needs a Chrome session with the owner. 10-23 06:59: the repo is public, so SonarCloud is free for it. It needs the owner to log in at sonarcloud.io with GitHub (Claude cannot sign in or create accounts); then the repo can be imported and its token stored as a GitHub secret (asked before doing it).
  - Add SonarCloud
  - CodeQL is enough
- **Default:** CodeQL is enough
- **Outcome:** Default taken (DC3, 2026-10-23): CodeQL is enough: CodeQL keeps scanning every push; SonarCloud can be added any time he signs in at sonarcloud.io.

**E7. Pack contents and foil odds** · Decide · Economy · asked 2026-10-08 · decided 2026-10-08
- **Outcome:** Pack editor (Admin): per pack price, size, pool, rarity weights, foil chance per card, guaranteed foil, and finish weights (By rarity 60, Prism 9, Hex 8, Etched 7, Ice 7, Reverse 6, Gold 3). Sprout Pouch 4% foil per card, Acorn Chest 8%, Golden Bramble Case 12% with one guaranteed. A card's From picks its pack pool. Publishes live as __cfg:shop-packs.

**E8. Over-size decks and the main deck** · Decide · Decks · asked 2026-10-08 · decided 2026-10-08
- **Outcome:** Decks can hold any number of cards while building (calm 'N over' note, no red shake). ★ Main deck is chosen explicitly and is what you play with; only a 20-card main deck can be played.

**A1. Which AI services should we set up, free tiers first, and will you create the accounts? (your browser; nothing bought)** · Do · Art · asked 2026-10-08
- Owner (10-23 17:38): "A1 description - list all the AIs that could help us, esp through omnirouting to gain utility without spending tokens." Researched 2026-10-23 (free limits change often; each is re-checked on its own page before use). The idea: send cheap or bulk work (translations, drafts, sim summaries, second-opinion reviews) to free tiers through one router, and keep Claude for design, engine and final review. Every account below is yours to create; Claude never creates accounts, enters passwords or buys anything, and no key goes into the repo or a chat (keys live as local environment variables). ROUTERS (one key, many models). (1) OpenRouter: 20+ ":free" models from several providers behind one OpenAI-style API; 20 requests/min and 50/day free, 1,000/day after a one-time $10 top-up (your call). Account: openrouter.ai. (2) LiteLLM (open source, runs on your machine): one local endpoint that routes to the free tiers below and falls back when one is rate-limited; no account. (3) Vercel AI Gateway: multi-provider with your own keys (BYOK), on the Vercel account you already have. FREE TEXT / CODE MODELS (behind a router). Google AI Studio (Gemini Flash / Flash-Lite and 2.5 Pro free; free-tier prompts may be used by Google to improve its products, fine for this public repo, not for secrets); Groq (about 30/min, 1,000/day; Llama 3.3 70B); Cerebras (about 1M tokens/day); Mistral (about 1B tokens/month, Codestral for code); GitHub Models (150-1,000/day, on your GitHub login); Cloudflare Workers AI; NVIDIA NIM. Use for us: first-draft translations of the 12 language packs, text and lore drafts, summarising sim logs, a second reviewer on diffs. Local and free with no account: Ollama with open models (Qwen, Llama, Gemma) on your own machine. TRANSLATION. DeepL API Free: 500,000 characters a month at no cost (account at deepl.com; it may ask for a card to verify, nothing is charged on Free). Good for checking the language packs against the English. CODE REVIEW. CodeRabbit: free reviews on public repositories with the paid-tier features for open source (sign in with GitHub); CodeQL already scans every push (S4). ART (beside PixelLab and NightCafe, already in use). ChatGPT image generation free daily cap (commercial use allowed by OpenAI's terms); Gemini "Nano Banana" free in the app (visible and invisible SynthID watermark, so drafts only); Ideogram about 10 slow credits/day (free images are public); Leonardo 150 tokens/day (free-tier images not for commercial use); Microsoft Copilot 15 fast boosts, then slower. Best use: concept drafts and splash/marketing comps, then PixelLab or the pixel pass for anything that ships. SOUND, MUSIC, VOICE. Stable Audio Open 1.0 (open weights, runs locally, up to 47 s, better at sound effects than music; Stability Community License, check stability.ai/license for commercial use); ElevenLabs free 10,000 credits a month (about 50 sound effects or 10 minutes of voice) but no commercial licence on free (Starter $6/month has it: your call); Suno free 50 credits/day (about 10 songs) but non-commercial and few downloads, so reference tracks only. For the shipped music (D17) CC0 packs remain the safe route. VIDEO (trailer, A3). Kling via fal stays the plan; it needs a paid key and a cap (below). PAID KEYS (only if you choose): OpenAI (platform.openai.com, set a monthly budget and alerts at 50% / 80% first) and fal.ai (prepaid credits, load the smallest top-up or none until A2); name each key bramblewood-local, store as OPENAI_API_KEY / FAL_KEY in your environment, tell me 'keys are set' and I check only that they exist, then run one test through tools/art/pixelize.py. Recommended order: free tiers first (OpenRouter free + Google AI Studio + DeepL API Free + CodeRabbit), routed through LiteLLM or OpenRouter; paid OpenAI / fal keys only when A2 or A3 go ahead. Sources: openrouter.ai/blog/tutorials/free-llm-apis-compared/ ; layer3labs.io/guides/is-gemini-free ; support.deepl.com/hc/en-us/articles/360021200939-DeepL-API-Free ; aicodereview.cc/blog/is-coderabbit-free ; krea.ai/blog/best-free-ai-image-generators-in-2026 ; dupple.com/learn/is-elevenlabs-free ; dupple.com/learn/is-suno-free ; huggingface.co/stabilityai/stable-audio-open-1.0
  - Free tiers first (OpenRouter free, Google AI Studio, DeepL API Free, CodeRabbit)
  - Free tiers plus paid OpenAI and fal keys with monthly caps
  - Not yet
- **Default:** Free tiers first (OpenRouter free, Google AI Studio, DeepL API Free, CodeRabbit)

**A2. Spend about $7-15 to train a Bramblewood pixel LoRA and test it on 10 cards?** · Decide · Art · asked 2026-10-08
- What a Bramblewood pixel LoRA is: a small add-on trained on our own card art so a general image model (FLUX.2 [dev], trained on fal) draws new cards in the same house style; PixelLab stays the main source and heroes stay PixelLab. Data: 20-40 of the best existing PixelLab cards from art/cards (633 PNGs, 256x256 today), picked for one coherent look: same outline weight, same palette (tools/art/palette.json), a spread of subjects (mammal, bird, insect, structure), no text in the image, no watermarked stock. Each image gets a short caption in the style of docs/art-style-prompts.md with a trigger word (for example 'bwpixel') so the style can be called on and off. About half a day of curation, which I can do from the repo; you pick or veto the 30. Tool options: (a) fal's FLUX.2 trainer (hosted, no GPU, upload a zip of images and captions, about 1,000-2,000 steps, roughly $6.40 per 1,000 steps on fal's list, so about $6-13 per training run plus about a few cents per generated image; check the current price on fal's page before any run); (b) Replicate's FLUX trainer (similar, per-run pricing); (c) a local or rented GPU with ai-toolkit/kohya (cheaper per run, but needs a rented GPU and setup time; not worth it for a 10-card test). Recommendation: (a), because A1 already puts a fal key and cap in place. Cost range: a first test is about $7-15 in total (one 1,000-step training plus 10-40 generations), and a retrain with fixes is the same again; a full set of Maps 9-10 cards afterwards is cents per card. All of it stays under the cap you set in A1; nothing runs without your OK on the amount. Test plan on 10 cards: (1) train once on the 30; (2) generate the 10 test cards, chosen from existing cards whose PixelLab art we already like, so each result can be set beside the original (a mix: 3 small animals, 2 birds, 2 insects, 1 structure, 1 large beast, 1 fantasy creature); (3) run each through `tools/art/pixelize.py` (nearest-neighbour downscale to the 160 px grid, palette snap, outline clean-up); (4) review in the hub's Visual Library as 'proposed', scoring each on outline, palette, readable silhouette at card size and fit beside the PixelLab neighbours; (5) pass if at least 7 of 10 are usable with at most a pixel pass and one retry, fail otherwise; (6) if it passes, spend the same amount on the Maps 9-10 cards and the Home sprites that wait on PixelLab; if it fails, delete the LoRA and keep PixelLab only. Needs from you: A1 done, a yes on the training spend, and a veto pass over the 30 picks. | 2026-10-29 (owner 00:10: "Write the chance of this passing, let's say we have 100 artwork we like"): with 100 liked cards as training data (more than the 20-40 planned, so a stronger style signal; about 2,000-3,000 steps, so roughly $13-19 per run at fal's list price, check before any run): my estimate is about 65% that the 10-card test passes (7 or more of the 10 accepted after our usual palette quantise and nearest-neighbour downscale). Style match (palette, outline weight, framing) is the easy part: about 85%. The risk is a true pixel grid: FLUX draws "pixel-look" art with soft, uneven pixels, so each image needs the quantise/downscale clean-up, and roughly 1 in 2 single generations will be usable, so expect 2-3 tries per card. Subjects far from the training set (dinosaurs, golems) fail more often. A 10-card test tells us this for about one run's cost; Claude does not buy the credits.
  - Yes, test on 10 cards
  - Not yet
- **Default:** Yes, test on 10 cards

**A3. 30 s trailer from Kling clips** · Decide · Marketing · asked 2026-10-08 · decided 2026-10-23
- 5–6 Kling 3.0 image-to-video clips (splash crowd, pack tear, Shiny reveal, Ember Chipmunk fire, castle fall) cut with gameplay capture.
  - Go
  - Later
- **Default:** Later
- **Outcome:** Owner (10-23 17:34): "A3: Prepare the text prompts." Prepared (DC3): six shots, each with a start-frame image prompt, a Kling image-to-video motion prompt and its place in a 30 s cut, in docs/art-style-prompts.md ("Trailer (A3)"). Nothing generated: making the clips needs A1 (his keys and caps) and his OK on the spend.

**F1. Upgrade / Refine / Enchant** · Decide · Cards · asked 2026-10-08 · decided 2026-10-08
- **Outcome:** Forge has three tabs. Upgrade = level 1–10 then Prestige. Refine = your best copy up the finish ladder Plain → Foil → Hex → Etched → Cracked ice → Reverse → Prism → Gold leaf (costs rise; Prism/Gold need Gold Leaves); never makes Shiny. Enchant = socket one Materia (Ember +1⚔ and scorching hits, Stone +3❤, Tide +2❤, Grove +1⚔+1❤); crystals are the player's now, crafted from Dust without a Hero.

**F2. Shiny in battle** · Decide · Cards · asked 2026-10-08 · decided 2026-10-08
- **Outcome:** Shiny is rolled in the one grant function, so any card received can be Shiny. A card you own a Shiny copy of is Shiny in your hand and on the board, and units it spawns are Shiny too.

**F3. Enchant and Refine numbers** · Confirm · Cards · asked 2026-10-08 · decided 2026-10-23
- Enchant: Ember +1⚔ (scorch), Stone +3❤, Tide +2❤, Grove +1⚔+1❤. Refine costs from 40✨+100🍁 (Foil) up to 200✨+450🍁+10🍂 (Gold leaf). Tide is currently a weaker Stone; give it something of its own?
  - Keep
  - Retune
- **Default:** Keep
- **Outcome:** Owner (10-23 00:10): "OKAY" Keep the Enchant and Refine numbers (the default).

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

**C3. Victory shift and the castle's white gradient** · Clarify · Battle · asked 2026-10-09 · decided 2026-10-23
- Couldn't reproduce either. Which cards move at the end of a fight, and when? Where does the white gradient on the castle show (fight, map, results)? A screenshot would settle both.
- **Outcome:** Owner (10-23 00:10): "Now this is rarer - so mabye OKAY for now." Leave the victory shift and the castle gradient alone for now; it happens rarely.

**E9. What do Krooni 👑 buy?** · Decide · Economy · asked 2026-10-09 · decided 2026-10-23
- The Golden case gives 3 Krooni. Nothing spends them yet, and they're kept on this device only (no database column). Ideas: cosmetic finishes, a Krooni-only pack, or Hero rarity boosts.
  - Cosmetics
  - A Krooni pack
  - Hero boosts
  - Decide later
- **Default:** Decide later
- **Outcome:** Owner (10-23 00:10): "Retire Krooni for now" Nothing will spend Krooni; retire them from the game for now. To build in package TU2.

**E10. Promotion cost and level** · Decide · Economy · asked 2026-10-09 · decided 2026-10-23
- Worker Ant promotes at Lv 3 for 60 Maple Leaves + 20 Dust. The ant goes back to Lv 0, so it can be promoted again into the other choices. Ant Warrior uses the Soldier Ant's art for now.
  - Keep
  - Higher level (5)
  - Free promotion, keep the level
- **Default:** Keep
- **Outcome:** Owner (10-23 00:10): "No. Combining or converting cards to different cards is a concept we havent explored. HOWEVER, please prepare this tab. This is not a subtap - it will be its own feature page!" Keep promotion as is (the default); card combining and converting is not designed yet, but prepare its page: its own feature page, not a subtab. To build in package TU2.

**E11. Nurse master bonus** · Decide · Economy · asked 2026-10-09 · decided 2026-10-23
- The Nest Nurse (a Unique+ card or the Wandering Traveller) is in, but what it does is still open. Ideas: eggs hatch 25% faster; a small chance a hatch comes out Shiny.
  - Faster hatching
  - Shiny chance
  - Both
- **Default:** Faster hatching
- **Outcome:** Owner (10-23 00:10): "YES eggs hatch faster. No, shiny chance cant be increased." Faster hatching only (the first option); the Nurse does not touch the Shiny chance. To build in package RW3. Built (RW3): already in the game since 10-15: the Nurse master speeds every egg, baby and Level-0 training by 2.5% per Nursing mastery point, at most half the time (a Unique Lv 1 nurse: about 22%; the Wandering Traveller with Nursing: more). It never touches the Shiny chance (0.5%, rolled when a copy is granted). No change made; call RW3-11 if a flat 25% is wanted instead.

**D20. Devilry: my readings of your list (all built, all revertible)** · Decide · Design · asked 2026-10-10 · decided 2026-10-23
- Built as I read them: (1) Dark Summon is a second play each turn, just for ⛧ cards, and every Dark Summon card also costs Darkness (a free extra play measured at 100%). (2) Darkness comes from your own units perishing (+1 each); 'dark actions' were left open. (3) Devour uses your play for the turn and works once per devourer. (4) Ritual's 'units perished' counts both sides. (5) Sacrifice N sits on the fodder; the discount comes off Darkness first, then Lumber. (6) Your blank keyword is named Offering N. 2026-10-10 (you: 'darkness is not clear. Is it gained? idk'): yes, it is gained: +1 each time one of YOUR units perishes (Ash Imp adds +1 on arrival). It's shown only if your deck has at least one Devilry card: the pill reads '★ 3 · ⛧ 1' (Darkness held, dark summons left this turn), and each gain floats a ★ +1. You gain 1 dark summon per turn; it doesn't stack.
  - Keep all six
  - Change some (tell me which)
- **Default:** Keep all six
- **Outcome:** Owner (10-23 00:10): "OKAY for now" Keep all six Devilry readings (the default).

**D21. Backstab: what should it do?** · Decide · Design · asked 2026-10-10 · decided 2026-10-23
- You listed Backstab as a neutral skill without a rule. Suggestion: Backstab N, +N damage when it hits a unit that is facing a different target (rewards Pitchfork, Sweep and off-centre angles).
  - Use the suggestion
  - Something else (tell me)
  - Drop it
- **Default:** Use the suggestion
- **Outcome:** Owner (10-23 00:10): "No idea. But if the enemy has a status that makes them less effective at combat or YOU have a skill that makes you MORE effective at combat (blind vs evade e.g.)" Not the suggestion: Backstab gains its bonus when the target has a status that makes it less effective at combat, or the attacker has a skill that makes it more effective (blind against evade, for example). To build in package EN. Built (EN): Backstab N still strikes the nearest enemy unit and never the bramble; its +N now lands when that unit is worse at combat: Blind, Stunned, Frozen, Asleep, Confused, Tipsy, Staggered, Paralyzed, Bound, Webbed or turned to stone, or it would swing blind in the dark while the attacker sees (was: a unit not directly in front). Bonus +N (the card's number), Tall Grass still doubles it. Price 0.6 a point (Assault's 1.8 x about 1 swing in 3; an estimate, call EN-5). Re-fit: Stoat Cutthroat 3/11 -> 3/12, Wrong-Way Salmon 1/8 -> 1/10, Cunning Vixen 1/8 -> 1/10.

**D22. Fast Forward counters: build next?** · Decide · Design · asked 2026-10-10 · decided 2026-10-23
- Your rule: with N counters, a unit runs its turn, upkeep included, N extra times before joining the main action order. It needs a pre-combat pass in the engine, about half a day of work with tests.
  - Build it next
  - After Ecclesia
  - Later
- **Default:** After Ecclesia
- **Outcome:** Owner (10-23 00:10): "Okay. Unused for now" After Ecclesia (the default); not built, no card uses it yet.

**D23. Ecclesia next, with your Prayer value?** · Decide · Design · asked 2026-10-10
- Prayer value = the sum of Prayer N on your board + the cards in your Removal Zone, +1 once a turn by exiling a hand card when summoning an Ecclesia card. Ecclesia cards need a Prayer value (a threshold, not spent). Effect ideas: Worship, Divine Retribution, Lightning, Midas Touch, Healing, Satiety. 2026-10-10 (taken on 'continue'): built. See the archetypes note for every rule, the nine cards and the measurements.
  - Build Ecclesia next
  - Scrapper next
  - Evolution next
- **Default:** Build Ecclesia next

**D24. Arena rules: daily rotation and the second-player card** · Decide · Balance · asked 2026-10-10 · decided 2026-10-23
- Built: the Arena's rule set changes daily (Standard, Long Night, Midsummer, Dusk Start, Timber Fair with +1 Lumber every 3 rounds, Frost Week, Fog on the Moor). In every Arena set, whoever plays second opens with an extra card. Conquest keeps day-first, no extra card and no free Lumber unless a fight sets its own rules; Live Ranked plays Standard. Should Conquest also give the second player the extra card (it would need a retune)?
  - Keep Conquest as is
  - Add the second-player card to Conquest too
  - Change the rotation
- **Default:** Keep Conquest as is
- **Outcome:** Owner (10-23 00:10): "OKAY. 2nd player has no benefit except +1 Shield to Bramble." Keep Conquest as is (the default); in the Arena the second player's extra card is replaced by +1 Shield on its Bramble, and nothing else. To build in package EN. Built (EN): the second player gets +1 Shield on its bramble and nothing else, in every mode that gave a second-player bonus (the Arena rule sets and Double Time fights); no extra card, Health or Lumber. Texts in the 12 packs.

**B6. The hummingbird starter deck beats the otter starter deck ~99% of the time** · Decide · Balance · asked 2026-10-09
- Starter vs starter in simulation (300 matches): otters win 0.9%. All 10 hummingbird Basics fly (dodge half of ground attacks), most are Diurnal (+1 by day), and they run 2 copies each of 10 solid cards against the otters' 20 singles with several 1-Attack fillers. Removing Diurnal alone: 3.7%; a gentler 1-in-3 dodge: 3.3%. Packages that land near even: (C) the 7 hummingbird Basics with 2+ Attack lose 1 Attack, and 5 otter ground Basics (Otter Guard, River Carp, Otter Paddler, Burrow Rabbit, Ant Scout) gain Reach (their attacks ignore the Flying dodge): 47.7%. (F) the same hummingbird nerf, +1 Attack on 6 otter 1-Attack fillers (Honey Bee, Silver Minnow, Duckling, Otter Kit, Worker Ant, Chipmunk Forager), and Reach on Otter Guard and River Carp only: 46.8%. Reach is already in the engine (no card uses it yet). Not applied because it changes the faction players picked, their saved decks and the tutorial. 2026-10-10: superseded by your new basic set (shared six + three per side): the starter mirror now measures 52.9%.
  - F: nerf hummingbirds, lift otter fillers, Reach on 2
  - C: nerf hummingbirds, Reach on 5 otters
  - Something else (tell me)
  - Leave as is
- **Default:** F: nerf hummingbirds, lift otter fillers, Reach on 2

**D19. Archetypes: which to build first** · Decide · Design · asked 2026-10-09 · decided 2026-10-23
- archetypes-design-2026-10-09.md has 10 archetypes plus the Elder / Outer / Forgotten trio. Suggested order: an active Exile zone, Swarm, Tide, Devilry circles, Elder Ones, then Evolution ride. Each archetype lists its open questions. 2026-10-09 (default taken on 'continue'): Swarm built first (Swarm N + Hive Mind on ants and bees). Then Tide (taken on 'continue', revertible): Flow/Ebb each round from round 2; Tide +1 on Flow, -1 damage taken on Ebb; Wash pushes the facing enemy +1 Wait once; 18 water cards tagged, 7 trimmed back into band, 28 water fights retuned. Then the active Exile zone (also on 'continue', revertible): Echoes 🕯️ (+1 per card sent to your Removal Zone) and Remember N (returns from the zone at N Echoes), with Echo Keeper, Marsh Wisp and Bog Revenant. Then the Forgotten Ones (also on 'continue', revertible): Remember returns +1/+1 per Echo spent, the Forgotten tag, and The Unremembered (Swampmire boss reward). 2026-10-10: Devilry built from your new list (see D20). Next suggested: Ecclesia with your Prayer value (D23).
  - Ecclesia next (D23)
  - Scrapper next
  - Evolution next
  - Pause archetypes
- **Default:** Ecclesia next (D23)
- **Outcome:** Owner (10-23 00:10): "OKAY to your suggestion" The suggested archetype order stands (the default).

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

**FOG1. Fog of War is information only: the CPU still sees your whole board** · Decide · Battle UI · asked 2026-10-21 · decided 2026-10-23
- Package FOG hides the far enemy columns from the player's view only. Combat, targeting and the CPU play exactly as before, and the enemy's view of your units is not fogged. Raids, Pass & Play and the Collapse rows are left out.
  - Keep it as a view-only rule
  - Also make the CPU unable to target units it cannot reach (an engine change)
- **Default:** Keep it as a view-only rule
- **Outcome:** Owner (10-23 00:10): "Both sides" Not the view-only default: fog applies to both sides, so the CPU also cannot target what it cannot reach (the engine change). To build in package EN. Built (EN): with Fog of War on, the CPU plays through the fog from its side (its reach, its revealers): where it plays, what it plays and what its hazards and fields are worth read only your units it can see. The rules themselves (swings, arrows, skills) still reach fogged units on both sides, the player's too (call EN-8).

**FOG2. Fog reach is the unit's column and the ones beside it; revealers add only permanence** · Decide · Battle UI · asked 2026-10-21 · decided 2026-10-23
- Reach follows your Parasite note (a live unit in the column or beside it; the centre is always open, as for placement). Illuminate has no radius, so Darksight, Keen Eye and Illuminate cover the same three columns, but what they cover stays revealed for the rest of the fight.
  - Keep: same reach, revealers make it permanent
  - Give revealers a wider reach (2 columns each side)
- **Default:** Keep: same reach, revealers make it permanent
- **Outcome:** Owner (10-23 00:10): "OKAY" Keep the reach; revealers make it permanent (the default).

**FOG3. Fog of War uses the Mist scene as its card art for now** · Decide · Battle UI · asked 2026-10-21 · decided 2026-10-23
- The Environment card borrows art/fields/misty.png. A new scene needs generating under the art workflow.
  - Generate a Fog of War scene
  - Keep the Mist scene
- **Default:** Keep the Mist scene
- **Outcome:** Owner (10-23 00:10): "OKAY" Keep the Mist scene (the default).

**TU2-1. Which daily dungeons are hidden for now** · Decide · Dungeons · asked 2026-10-23 · decided 2026-10-23
- Your answer to AR-2: "hide both daily dungeons require future balancing anyway. We havent even decided what special thing they give." There are three ticketed daily dungeons: Murgle Mayhem (Map 6), the Undercroft (Map 11) and the Long Burrow (Map 22, released 10-18). Package TU2 hid all three from players (one switch, DAILY_DUNGEONS_HIDDEN: no entrance on their map, no World map stop, no Dungeons tab, no 🗝️ key button); Admin Mode still opens them, and saves keep their climbs and keys. The backlog row (decide what they give, rebalance) is in docs/action-items.md.
  - Hide all three (as built)
  - Hide the Undercroft and Murgle Mayhem; keep the Long Burrow open
  - Hide only the Undercroft
- **Default:** Hide all three (as built)
- **Outcome:** Claude's call (10-23, owner asked to settle the easy ones): Hide all three daily dungeons (as built), because his reason (they need balancing and a decided reward) applies to the Long Burrow too.

**TU2-2. How faction cards start at Level 0** · Decide · Economy · asked 2026-10-23 · decided 2026-10-23
- N1: "Faction cards also start at level 0." They started at Level 1 (cardBaseLevel; their printed stats are their Level 1 stats, as the budget prices them). Package TU2 made a new copy of a faction card a Level 0 copy, as the tutorial's copies already are: about 85% of its printed stats until a nest trains it to Level 1 with Kibble, and it shows in the Nest's 🌱 Level 0 tab. A card you already raised keeps its level; copies owned before today are unchanged. The other way would make Level 0 the printed stats for every faction card (and every Level above one step stronger than today), which moves all 41 faction cards' balance.
  - New copies come at Level 0, trained in the Nest (as built)
  - Faction cards' printed stats become Level 0 (rebalance all 41)
  - Back to Level 1
- **Default:** New copies come at Level 0, trained in the Nest (as built)
- **Outcome:** Claude's call (10-23, owner asked to settle the easy ones): New copies come at Level 0, trained in the Nest (as built), kept as built (new faction copies come at Level 0 and train in the Nest).

**TU2-3. The tutorial brambles' Health: 9 and 11, or the 12 you set** · Decide · Tutorial · asked 2026-10-23 · decided 2026-10-23
- The tutorial fights carry their own Health (9 and 11; shown halved as 5 and 6), so the editor's 12 never applied. EB-6 has since tuned around 9 / 11 (T-1 95%, T-2 78% wins). Changing them is a live fight edit, so it waits for you. Recommended: keep 9 and 11.
  - Keep 9 and 11 (as now)
  - 12 and 14 (your 12; Part 2 two sturdier)
  - Other numbers (set them in the editor)
- **Default:** Keep 9 and 11 (as now)
- **Outcome:** Owner (10-23 17:34): "TU2-3 great if i can edit it." The tutorial brambles keep 9 and 11 Health for now, and the value in the editor becomes the one the tutorial fights use, so he sets it himself. New work: a small editor package (docs/action-items.md, 10-23 17:34).

**TU2-4. The Worker Ant's Promotion in the Forge is hidden** · Decide · Economy · asked 2026-10-23 · decided 2026-10-23
- E10: "Combining or converting cards to different cards is a concept we havent explored. HOWEVER, please prepare this tab ... it will be its own feature page!" The Forge did have a working Promotion: the Worker Ant (promotesTo, at Level 3, for 300 Maple Leaves + 100 Magic Dust) could become an Ant Warrior or one of two other ants. Package TU2 replaced that panel with a pointer to the new Promotion page, which says "Coming soon" and has no controls; the code and the card data stay (PROMOTION_PAGE_LIVE).
  - Keep it hidden until the Promotion page is designed (as built)
  - Bring the Worker Ant's Promotion back on the new page as it was
- **Default:** Keep it hidden until the Promotion page is designed (as built)
- **Outcome:** Claude's call (10-23, owner asked to settle the easy ones): Keep it hidden until the Promotion page is designed (as built), kept as built (the Worker Ant's Promotion stays hidden until the Promotion page is designed).

**TU2-5. The Highcrest Case without its 3 Krooni** · Decide · Economy · asked 2026-10-23 · decided 2026-10-23
- E9: "Retire Krooni for now." Players no longer see or earn Krooni: the Highcrest Case (250 Maple Leaves + 30 Gold Leaves) no longer pays its 3 Krooni and its shop line no longer mentions them; the wallet hides them. Saved balances are untouched and Admin Mode still shows them. Nothing replaces the 3 Krooni in the case.
  - Nothing in their place (as built)
  - Lower the case's price a little
  - Something else in the case
- **Default:** Nothing in their place (as built)
- **Outcome:** Claude's call (10-23, owner asked to settle the easy ones): Nothing in their place (as built), kept as built (nothing replaces the Highcrest Case's 3 Krooni).

**RW3-1. Which fights get which shield bonus on the card drop** · Decide · Rewards · asked 2026-10-23 · decided 2026-10-23
- Built: elite, champion, miniboss and dungeon +1%; sub-boss +2%; boss +3%; world boss, raid boss, megaraid and final boss +4% (the owner's 1/2/3/4% read as the four steps above a skirmish). So skirmish 1%, elite 3%, sub-boss 5%, boss 6%, world / raid boss 8%, megaraid / final boss 9%.
  - As built
  - Bosses +4% too (boss 7%)
  - Only elite +1 / boss +2 / world +3 / final +4, nothing for sub-bosses
- **Default:** As built
- **Outcome:** Claude's call (10-23, owner asked to settle the easy ones): As built, kept as built (the shield bonuses: elite +1, sub-boss +2, boss +3, world / final +4).

**RW3-2. Rare notices: rarer tickets, or rarer notices?** · Decide · Raid · asked 2026-10-23 · decided 2026-10-23
- Your RK4: "SS / SSS raid notices about once a month or two". Built: the notices appear as often as before (S 3.5%, SS 0.8%, SSS 0.2%) and only their Raid Ticket got rarer (40% each: S tickets 0.59 a week, SS + SSS one every 1.4 months). Read literally, your words make the SS / SSS notices themselves rarer (1.0% -> about 0.5% of notices, their big rewards too). Recommended: rarer SS / SSS notices, since that is what your note names.
  - As built (rarer tickets)
  - Rarer SS / SSS notices (about 0.5%)
  - Both
- **Default:** Rarer SS / SSS notices (about 0.5%)
- **Outcome:** Owner (10-23 17:34): "RW3-2 SS/SSS was talking about notices. SS per 1mo, SSS per 2-3mo. (for a person that always full clears, full resets to reset low tier quests). So a passive player is unlikely to see it till 6-8 months actually." Rarer notices, not only rarer tickets: an SS notice about once a month and an SSS notice about once every 2-3 months for a player who always full-clears and fully resets the low-tier quests; a passive player first sees one after about 6-8 months. New work: retune the notice rates (today S 3.5%, SS 0.8%, SSS 0.2% of notices) to those targets, and check the tickets' 40% cut so the two don't stack (docs/action-items.md, 10-23 17:34).

**RW3-3. Packs: no new-card guarantee, faction packs keep their track** · Decide · Rewards · asked 2026-10-23 · decided 2026-10-23
- "Packs outputs can never be changed by anything" also turned off the new-card guarantee (the Tidemire Chest and the Highcrest Case promised one card you don't own) and the 10-12 weight that made a recently pulled card less likely. A faction pack's two faction cards still follow the faction reward track (RP: Commons first, then Uncommons...), which reads your collection; its general card is fully random.
  - As built
  - Keep the new-card guarantee
  - Faction packs fully random too
- **Default:** As built
- **Outcome:** Claude's call (10-23, owner asked to settle the easy ones): As built (no new-card guarantee; faction packs keep their track), because he said pack output can never be changed and the track only orders the faction cards.

**RW3-4. Pack foil chances** · Decide · Cards · asked 2026-10-23 · decided 2026-10-23
- Built: 1% a card (Hedgerow Pouch), 1.5% (Tidemire Chest), 2% (Highcrest Case, Mystery Booster), faction packs 1%; the Highcrest Case's guaranteed foil is off; Advanced packs keep 10x on their first five cards (10 / 15 / 20%). Was 4 / 8 / 12 / 10 / 4% plus the guarantee.
  - As built
  - Lower still (0.5 / 1 / 1.5%)
  - Keep the Highcrest guarantee
- **Default:** As built
- **Outcome:** Claude's call (10-23, owner asked to settle the easy ones): As built, kept as built (pack foils at 1 / 1.5 / 2%, as he asked ("should be rare")).

**RW3-5. The Shop's Raid Ticket restock** · Decide · Raid · asked 2026-10-23 · decided 2026-10-23
- Built: each local day the cart has a Raid Ticket at 25% (about 1.75 days a week), one in stock; buying it sells it out until another day rolls one. The day's roll is the same for every player that day.
  - As built (25% a day)
  - 15% a day (about 1 a week)
  - A roll per player
- **Default:** As built (25% a day)
- **Outcome:** Claude's call (10-23, owner asked to settle the easy ones): As built (25% a day), kept as built (the Raid Ticket restock at 25% a day).

**RW3-6. Disenchant past Divine** · Decide · Economy · asked 2026-10-23 · decided 2026-10-23
- The owner's list ends at Divine 2,000 "+ etc.". Built: x1.5 a step, Void 3,000 and Daemonic 4,500.
  - As built
  - x2 a step (4,000 / 8,000)
- **Default:** As built
- **Outcome:** Claude's call (10-23, owner asked to settle the easy ones): As built, kept as built (x1.5 a step past Divine: Void 3,000, Daemonic 4,500).

**RW3-7. Per-copy Forge levels: where the duplicate credit sits** · Decide · Forge · asked 2026-10-23 · decided 2026-10-23
- Levels are per copy again (item 25). The duplicate credit (fed spares) stays on the card, as FG had it, and pays for whichever copy you temper; NF (10-18) had it on one copy. A save keeps every level (each copy keeps the shared level it had; only the best copy counts as paid for, so melting refunds the levels once).
  - As built (credit on the card)
  - Credit on the copy it was fed to
- **Default:** As built (credit on the card)
- **Outcome:** Claude's call (10-23, owner asked to settle the easy ones): As built (credit on the card), kept as built (the duplicate credit sits on the card).

**RW3-8. Skirmish exclusives: the 12 cards that left the packs** · Decide · Rewards · asked 2026-10-23 · decided 2026-10-23
- Built (GD2-3): 2 exclusives on each map that had none and has 4+ skirmishes, 1 on Maps 4 and 21; the cards are the ones those skirmishes already paid as first-clear pack cards or that fight in them, the higher rarity first: caustic-scorpion (Uncommon, also in the Tutorial's T-2 deck), eagle-owl-quartermaster and ash-cloud-condor (Rares) are among them. DV2's count rule (3 / 2 / 1 rewards per map by its new cards) is now exceeded on those maps (tools/map_divvy_2026_10_22.js check allows it, RW3_EXTRA_REWARDS).
  - As built
  - Only 1 per map
  - Swap a card (name it)
- **Default:** As built
- **Outcome:** Claude's call (10-23, owner asked to settle the easy ones): As built, kept as built (the skirmish exclusives as built).

**RW3-9. T-1's first-clear card** · Decide · Tutorial · asked 2026-10-23 · decided 2026-10-23
- The Quarry Mole left T-1 (it is 8-1's now). T-1 pays no card until one is picked in the Tutorial editor (or keep it so). The live tutorial config still lists the mole; the game skips it, and supabase/proposed/20261023_rw3_tutorial_reward.sql clears it (waits for "apply it").
  - No card on T-1
  - A plain Common (name it)
  - The Rabbit Kit (D46)
- **Default:** No card on T-1
- **Outcome:** Owner (10-23 06:59): "Apply it". Applied supabase/proposed/20261023_rw3_tutorial_reward.sql on the live database: __cfg:tutorial cfg.rewards ["quarry-mole"] → [] (row updated 2026-10-22 23:00 UTC). T-1 pays no card until one is picked in the Tutorial editor.

**RW3-10. Easter eggs in Mystery Boosters: how rare** · Decide · Codex · asked 2026-10-23 · decided 2026-10-23
- Built: 0.05% a card (1 in 2,000 cards, about 1 in 670 Mystery Boosters of 3), any of the nine Easter eggs.
  - As built (0.05%)
  - 0.01%
  - 0.1%
- **Default:** As built (0.05%)
- **Outcome:** Claude's call (10-23, owner asked to settle the easy ones): As built (0.05%), kept as built (Easter eggs at 0.05% a card, as he asked ("supremely low")).

**RW3-11. The Nurse: mastery-based speed or a flat 25%** · Decide · Economy · asked 2026-10-23 · decided 2026-10-23
- Already built (10-15): 2.5% faster per Nursing mastery point, at most 50%. A typical Unique nurse is about 20-25%. The owner said "eggs hatch faster" with no number.
  - Keep the mastery scale
  - A flat 25%
- **Default:** Keep the mastery scale
- **Outcome:** Claude's call (10-23, owner asked to settle the easy ones): Keep the mastery scale, kept as built (the Nurse keeps the mastery scale).

**BL-1. Bloom's copy: it can't bloom, and it arrives like a played card** · Decide · Battle rules · asked 2026-10-23
- Your 11:23 and 17:34 #3. Built: Bloom - {conditions} is once per unit: the first round its conditions hold a copy of it grows beside it, and the copy gains +1/+1 (your 19:30: "bloom only gives the new one +1/+1, not itself"; the unit is unchanged). The copy has the unit's Attack and Health with every change made without counters, plus 1/+1, minus its damage; no counters or statuses. The copy is marked as a copy and never blooms itself (else one bloom would chain into a field of copies), arrives with its printed Wait, and leaves no card in the graveyard when it dies (so it can't feed Remember / Grave Call). Say if the copy should bloom too, arrive Ready, or go to the graveyard.
  - The copy can't bloom; printed Wait; no graveyard card (built)
  - The copy can bloom once too
  - The copy arrives Ready (Wait 0)
- **Default:** The copy can't bloom; printed Wait; no graveyard card (built)
- **Outcome:** Owner, 2026-10-24 03:12: "the copy can bloom." Queued in EN5.

**BL-2. Bloom with no free slot beside it** · Decide · Battle rules · asked 2026-10-23
- Built: the copy grows only in a free slot right beside the unit (a coin flip when both sides are free; in a raid's middle / back row, beside it in that row). With both neighbours taken it doesn't bloom yet and tries again at the next round's start, so the bloom is never wasted. Alternatives: bloom anyway with no copy (nothing happens then), or put the copy in the nearest free slot of the row (the Spawn rule).
  - Wait and try again next round (built)
  - Use up the bloom (no copy)
  - The nearest free slot in the row
- **Default:** Wait and try again next round (built)
- **Outcome:** Owner, 2026-10-24 03:12: "yes it will try to create adjacent to it." Also up/down on multi-row boards (03:12). Queued in EN5.

**BL-3. Where the new Pond Algae is found** · Decide · Cards · asked 2026-10-23
- No algae card existed, so BL added one for your "For Algae, just 'Wet' & 'Sunny'": Pond Algae, Common Plant (Flora, Pond), Wait 1, Lumber 0, Bloom (Wet & Sunny), 1/9 by the budget (100% of N at Level 1). It waits (awaitingSource) for a place. Proposed: the Lotus Frog's map (m8) basic pack, beside the pond cards; that needs canonical/map-pools.json and canonical/card-obtain-maps.json rows (the Map term then lifts it a little). Art: the emoji for now.
  - m8's basic pack (with the Lotus Frog)
  - A wet map's skirmish reward
  - Hold it (no source yet)
- **Default:** m8's basic pack (with the Lotus Frog)
- **Outcome:** Owner, 2026-10-24 03:12: BL-1 to BL-5 answered together; placement as built (RW5 placed Pond Algae on Map 4).

**BL-4. Which fungus has which Bloom, and the Puffball's third skill** · Decide · Cards · asked 2026-10-23
- The game has two fungi. Built: Fungal Colossus gets your first example, Bloom (Wet & Sunny + 1 Lumber) (a big, slow card that pays for its copy); Puffball Bombardier gets "another Fungi", Bloom (Wet & Killed an enemy) (its Arrow gets it kills). The Puffball already has Arrow 1 and Poison 1, so Bloom is a third skill: kept as a thematic exception to the two-skill rule (tests/bf5 lists it). Lotus Frog's old Bloom When (Tide & Night, +2/+2 while they hold) became Bloom (Tide & Night). Sunny is day or Twilight with no Rain, Fog or darkness.
  - As built (Puffball keeps 3 skills)
  - Puffball drops Poison (Arrow + Bloom)
  - Swap: Colossus Wet & Kill, Puffball Wet & Sunny + 1 Lumber
- **Default:** As built (Puffball keeps 3 skills)
- **Outcome:** Owner, 2026-10-24 03:12: BL-1 to BL-5 answered together; as built.

**BL-5. Bloom's price: three cards held over budget** · Decide · Balance · asked 2026-10-23
- Bloom is priced by the budget (bramblewood-budget.js bloomOdds): p = the odds its conditions ever hold (formula estimates, not measured: Wet 0.4, Sunny 0.8, Kill 0.5, Tide 0.35, Night 0.8; 'and' multiplies) x 0.85 (still alive, a free slot) x 0.85 per Lumber. S = 3p (the copy's +1/+1; your 19:30), and cap 1's stat terms count x (1 + p) (a second body arrives with odds p); cap 2 is unchanged. Wet & Sunny p 0.27 (S 0.81, stats x1.27), Wet & Kill 0.17, Wet & Sunny + 1 Lumber 0.23, Tide & Night 0.24. The re-fit (tools/refit_pass_2026_10_21.js) would cut Fungal Colossus 2/21 -> 2/16, Puffball Bombardier 1/10 -> 1/6 (it was already over before Bloom) and Lotus Frog 3/12 -> 2/10; as with BF11-1 they are held at their stats (docs/balance/bl-held-2026-10-23.json). Nectar Vintner's Healing 1 costs what its Bloom 1 did (4): no change. The odds can be measured later with the robust skill test once it models the copy.
  - Hold them at their stats (built)
  - Apply the re-fit
  - Lower Bloom's odds first, then re-fit
- **Default:** Hold them at their stats (built)
- **Outcome:** Owner, 2026-10-24 03:12: "Balance if overbudget, err on slightly overbudget (14.6>14.5)" Queued in EN5.

**SPEED1-1. Armor flattens after 3: re-price Armor 4 and 5?** · Decide · Balance · asked 2026-10-31 · decided 2026-10-31
- SKILL2-3 asked to measure Armor 4-5 first. The pipeline measured them (node tools/pipeline/run.sh measure --skills armor=4,armor=5; 200 fights each, the interval already narrow; docs/balance/pipeline/measures.json): Armor 4 is worth 4.95 [4.64, 5.52] stat points and Armor 5 5.01 [4.75, 5.58], against 6.75 and 7.84 on the canon curve 2.65 x N^0.675. So the worth runs 2.65 / 4.23 / 4.84 / 4.95 / 5.01 for Armor 1-5: it saturates, the opposite of your 'slightly exponential, 5 armor nullifies most damage' (ENG9-9). No in-play card carries Armor 4 or 5, so no card is affected today; the table is unchanged (record only).
  - Keep the canon curve (Armor 4 and 5 stay at 6.75 and 7.84, dear next to what they measure)
  - Cap the curve: Armor 4 and 5 priced at their measure, about 5.0 (a table edit through the pipeline price step; no card changes)
  - Keep your rule's shape above 3 as a design price, ignoring the measure
- **Default:** Cap the curve: Armor 4 and 5 priced at their measure, about 5.0 (a table edit through the pipeline price step; no card changes)
- **Outcome:** Coordinator: keep the canon curve for now; no in-play card has Armor 4+. The Armor 4-5 measures (4.95 / 5.01) are on record; re-price when a card first uses Armor 4+.

**SPEED1-2. Flying and Evasive: the measure reads x1.17 / x1.16, not x1.13** · Decide · Balance · asked 2026-10-31 · decided 2026-10-31
- SKILL2-2 set Flying and Evasive to 'the measured x1.13', and SPEED1 wrote x1.13 into MISS_MULT_BY as decided. The pipeline's price step now derives the multiplier from the measure itself and disagrees: the multiplier m acts on the carriers' stat terms (mean 3A + H = 20.83 on the canon's six carriers), so m = 1 + worth / 20.83 = 1 + 3.56 / 20.83 = x1.17 [1.16, 1.18] for Flying and 1 + 3.42 / 20.83 = x1.16 [1.15, 1.18] for Evasive. The SKILL2 write-up got x1.13 by reading the 10.4-point price on the carriers as 0.39 x 26.7; tools/skill_costs.js had priced it at a flat x1.5 (0.5 x 20.83 = 10.4), so the 26.7 never existed. At x1.13 a flyer's stat terms are priced 0.04 x 20.8 = about 0.8 points (4%) under what the measure says. The 4 flyer lifts made by the refit (Mountain Goat Climber, Swordbill Challenger, Ash Cloud Condor, Plains Zebra) were made at x1.13.
  - Keep x1.13 as set
  - Set Flying x1.17 and Evasive x1.16 (the measure; run tools/pipeline/run.sh price --set-const flying=1.17,evasive=1.16, then refit)
  - Set both to x1.15
- **Default:** Set Flying x1.17 and Evasive x1.16 (the measure; run tools/pipeline/run.sh price --set-const flying=1.17,evasive=1.16, then refit)
- **Outcome:** Coordinator: set the measured x1.17 (Flying) / x1.16 (Evasive) via the pipeline (price --set-const); tools/skill_costs.js now reads MISS_MULT_BY too. Refit then pushed out only the Red-billed Chough (owner-named DECK1-5 lift), kept.

**UI21-1. Nest maps and map keywords: Claude's picks** · Confirm · UI · asked 2026-11-05
- Nests unlock on completing Map 4, 8, 12, 16, 20 and 24 (prices unchanged). Map keywords: Map 0 Swarm, Tutorial Diurnal, Old Bramble Evasive, Map 1 Quick, its side map True Sight, Map 2 Tide, side maps Venomous and Armor, Map 3 Flying, Map 4 Delivery, Map 5 Poison, its side map Bleed (canonical/map-keywords.json). Change any?
  - Keep these
  - Change the nest maps
  - Change some keywords

**UI34-1. One counter list for the Codex too?** · Decide · UI · asked 2026-11-08
- The new canonical/skill-counters.json (about 60 skills, each counter with a reason) feeds the Map cards window. The Codex still shows an older 11-skill hand list inside the game's code. It disagrees in places: Armor lists Puncture, and Stealth lists Guardian, while the engine says otherwise.
  - a) Make the Codex read the new table (more counters, same rules).
  - b) Leave the Codex as it is.
- **Default:** a

**UI35-1. Skills list: do Other skills join the one list?** · Decide · UI · asked 2026-11-08
- Main, Counters and recommendations are one list now (pills tell them apart). I kept Other skills (side maps, specials) as a separate group under its heading: they are a different source, and they never count for NEW!.
  - a) Keep Other separate.
  - b) Merge them too, with an Other pill.
- **Default:** a

**UI35-2. NEW! counts are above your 2-3 per map** · Decide · UI · asked 2026-11-08
- With the main-progression rule the "N new" count reads: Map 0: 4, Thistlewood 13, Pebble Beach 5, Gannet Cliffs 8, Sunken Hollow 3, Gatorback 3, Sable Swamp 9, Morel Hollow 9. Most are skills no earlier main list shows. It is a guide for the map redesign (DES1).
  - a) Leave it as a guide; DES1 moves skills toward 2-3 per map.
  - b) Also count a skill a side map teaches as met (fewer NEW!).
- **Default:** a

**UI35-3. Compact deck view: what does the pool's x N say?** · Decide · UI · asked 2026-11-08
- In Compact, deck chips say x copies in the deck. Pool chips say x copies still free (what Full art's left/owned badge shows).
  - a) Copies still free.
  - b) Copies you own.
  - c) Copies in the deck.
- **Default:** a

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
