# Skill costs pass III: proposal (2026-10-22)

**Proposal only. Nothing is applied:** `canonical/skill-costs.json` and `canonical/cards.json` are unchanged. The proposed prices are in
`docs/balance/pass-3-skill-costs-2026-10-22.json`. Every number below comes from `node tools/pass3_skill_costs_2026_10_22.js report docs/balance/pass-3-skill-costs-2026-10-22.json`,
saved as `docs/balance/pass-3-dryrun-2026-10-22.json`. It uses the re-fit rule of `tools/refit_pass_2026_10_21.js` on all 714 band cards. The tool loads the prices into a copy of the table in memory.

## The counts

| | Now (pass I + II prices) | With the 5 proposed cuts | With every option below as well |
|---|---|---|---|
| Cards with no legal line | **130** | **116** | 54 |
| … of those, printed at A+H ≤ 3 | 76 | 71 | 36 |
| Cards whose re-fit line is tiny (A+H ≤ 3) | 9 | 9 | 12 |
| Cards whose line would move on a re-fit | 62 | 115 | 243 |

No card loses its line under the proposal. Every one of the 116 cards left has a single skill change that fits it except one, the Blue Dragon, which needs two (table below).

**Why price cuts can't do it alone.** On a 1/1 card, cap 2 (A·H + S·|S| ≤ (N/3)²) allows S of only about N/3. A Flyer's ×1.5 lowers it by about another 1.2×.
Some examples at Level 1: a Common with Wait 0 and Lumber 0 has N 11.44, so it has room for S 3.68 (2.95 if it flies). A Common with Wait 1 has room for 4.83 (3.90 flying). A Rare with Wait 1 has room for 5.53 (4.48 flying).
Any price above that room keeps a card off the formula at any stats: Quick 5, On Ready Gold 6.24, Rage 5, Arrow 2 (6), Sweep 2 (7.8), Poison 2 (5).
The cuts that a measurement backs free 14 cards. To go further you can cut your own prices, change cards, or change the formula.
One formula option, for your call: put the half-miss ×1.5 on the stats only, not on S. That alone frees 16 of the 130 (28 of them fly), and 14 on top of the proposal.

## The proposal: 5 price cuts

**The rule (pass II's rule, extended):** a price comes down only if you raised it in pass I or never set it, and it sits above its measured worth. It comes down to that worth.
The measured worth is the higher of the two measurements, except where the older one (`measuredS`, mostly from the full-size world) is low-confidence. In that case it is the halved-world standard test (`skill-worth-bf6-*.jsonl`).
Your own pass I cuts are not touched. A cut that frees no card is left out.

| Kind | Id | Before | Proposed | Measurement | No-fit cards it frees |
|---|---|---|---|---|---|
| trigger | bounty | 3 | **1.84** | old 11.52 (low); halved 1.84 (1 run) | 6 |
| trigger | onAttack | 3 | **1.35** | old 4.77 (low); halved 1.35 (24 runs, 11 saturated) | 3 |
| action | addWait | 3.5 | **2.8** | old 2.8 (high); halved 0.86 (1 run) | 3 |
| skill | twinStrike | 6 | **3.17** | old 10.95 (low); halved 3.17 (1 run) | 1 |
| skill | octolash | 25 | **6.48** | old 28.61 (low); halved 6.48 (1 run) | 1 |

Together they free **14** cards. The freed cards' new lines, and the cut behind each:
- Monarch Wingblade 2/5 → 2/4 (bounty)
- Alpha Howler 1/1 → 2/2 (bounty)
- Lodge Engineer 3/17 → 1/8 (bounty)
- Rockslide Ram 1/1 → 5/5 (onAttack)
- Ravenous Wolverine 1/1 → 1/1 (onAttack)
- Trash Panda Trickster 1/2 → 2/3 (bounty)
- Glacier Yak 1/13 → 1/10 (addWait)
- Elder Tortoise 1/1 → 2/2 (addWait)
- Rot-Swollen Carcass 2/16 → 1/4 (addWait)
- Bee Forager 0/5 → 0/4 (onAttack)
- Tiny Cave Dweller 1/4 → 1/6 (bounty)
- Beaver Lumberjack 4/4 → 3/3 (bounty)
- Gatling Hog 3/11 → 1/4 (twinStrike)
- Blue-ringed Octopus 4/15 → 2/9 (octolash)

**Not cut, though they sit on many no-fit cards:**
- Arrow 3: measured 5.13 (halved) to 5.92. If anything, it is under-priced.
- Supreme 7: measured 7.69 to 17.53.
- Gain 1: measured 2.48 to 16.12.
- Tide 1.5, Armor 1.5, Regen 2.6, Thorns 2.7, Poison 2.5, Quick 5, Sweep 3.9: your own cuts.
- Flying costs 0 S. It weighs only through the ×1.5 (see above).

## Your options (not in the JSON)

In each table, "Frees alone" is how many no-fit cards the cut frees on top of the proposal. "Running total" counts the proposal plus this row and every row above it, through all three tables in order.

**A. The only measurement is a floor.** The halved-world run saturated (the skill side won about every game), so the true worth may be higher. On Ready Gold's older value of 6.24 is pass II's price.

| Kind | Id | Now | At its measure | Measurement | Frees alone | Running total |
|---|---|---|---|---|---|---|
| skill | onReadyGold | 6.24 | 2.6 | old 6.24 (low); halved 2.6 (1 run, 1 saturated) | 7 | 21 |
| skill | rage | 5 | 2.72 | old 16.04 (low); halved 2.72 (1 run, 1 saturated) | 2 | 23 |
| skill | swipe | 3 | 2.72 | old 3.19 (low); halved 2.72 (1 run, 1 saturated) | 1 | 24 |
| skill | meteor | 2 | 1.32 | old 5.37 (low); halved 1.32 (1 run, 1 saturated) | 1 | 25 |

**B. Your own pass I prices that still sit above the halved-world measure.** Quick and Sweep are the big ones.

| Kind | Id | Now | At its measure | Measurement | Frees alone | Running total |
|---|---|---|---|---|---|---|
| skill | quick | 5 | 2.35 | old 7.55 (high); halved 2.35 (1 run) | 8 | 33 |
| skill | sweep | 3.9 | 1.91 | old 4.54 (high); halved 1.91 (1 run) | 6 | 39 |
| action | drawCard | 4.1 | 2.28 | old 5.12 (high); halved 2.28 (1 run) | 4 | 43 |
| skill | pounce | 1.8 | 1.05 | old 2.4 (high); halved 1.05 (1 run, 1 saturated) | 3 | 46 |
| skill | bleed | 2.5 | 2.1 | old 2.7 (high); halved 2.1 (1 run) | 2 | 48 |
| skill | shell | 2 | 1 | old 2.69 (high); halved 1 (1 run) | 2 | 50 |
| skill | sturdy | 8 | 0.7 | old 16.9 (high); halved 0.7 (1 run) | 2 | 52 |
| skill | poison | 2.5 | 2.19 | old 3.13 (high); halved 2.19 (1 run) | 1 | 53 |
| skill | venomous | 3 | 2.41 | old 3.13 (high); halved 2.41 (1 run) | 1 | 54 |
| skill | proliferate | 6 | 3.71 | old 10.68 (high); halved 3.71 (2 runs, 1 saturated) | 1 | 55 |
| skill | nursing | 5 | 2.73 | old 5.03 (high); halved 2.73 (1 run) | 1 | 56 |
| skill | electricity | 3 | 1.92 | old 3.6 (high); halved 1.92 (1 run) | 1 | 57 |
| skill | perforate | 3.5 | 2.45 | old 3.72 (high); halved 2.45 (1 run, 1 saturated) | 1 | 58 |
| skill | desecrate | 6 | 2.99 | old 9.41 (high); halved 2.99 (1 run, 1 saturated) | 1 | 59 |
| skill | sleep | 4 | 1.74 | old 5.16 (high); halved 1.74 (1 run) | 1 | 60 |
| action | poison | 1.3 | 0.93 | old 1.61 (high); halved 0.93 (1 run, 1 saturated) | 1 | 61 |
| skill | ambush | 2 | 1.09 | old 2.17 (high); halved 1.09 (2 runs) | 1 | 62 |
| skill | fastForward | 5.59 | 1.74 | old 7.17 (high); halved 1.74 (1 run) | 1 | 63 |
| skill | freeze | 1.8 | 0.8 | old 1.89 (high); halved 0.8 (1 run) | 0 | 63 |
| skill | fork | 4 | 1.69 | old 5.14 (high); halved 1.69 (1 run) | 1 | 63 |

**C. Not measurable with the standard test.** The test units have no type (Swarm), no mountain field (Mountain Climber), no armor to pierce (Pierce), and so on, so a measurement near 0 here means the test didn't see the skill. These are placeholder values for you to choose. Swarm is the one that matters.

| Kind | Id | Now | Suggested | Measurement | Frees alone | Running total |
|---|---|---|---|---|---|---|
| skill | swarm | 2.5 | 1 | old -0.04 (high); halved -0.05 (1 run) | 5 | 68 |
| skill | mountainClimber | 4 | 2 | old 8.28 (low); halved -0.05 (1 run) | 3 | 69 |
| skill | pierce | 1 | 0 | old 0 (high); halved -0.05 (1 run) | 2 | 70 |
| skill | taunt | 3 | 1 | old -1.81 (high); halved -1.14 (1 run) | 2 | 72 |
| skill | counterattack | 2 | 1 | old -8.21 (low); halved -1.89 (1 run) | 2 | 73 |
| skill | sacrifice | 3 | 1 | old 0 (high); halved -0.05 (1 run) | 1 | 74 |
| skill | immolation | 4 | 2 | old -1.56 (low); halved -1.32 (1 run) | 1 | 75 |
| skill | esprit | 2.1 | 1 | old 0 (high); halved -0.05 (1 run) | 1 | 76 |
| skill | hoard | 0.5 | 0 | old 0 (high); halved -0.02 (1 run) | 1 | 76 |

## Re-fit dry run of every card under the proposal

- **The 62 cards that have drifted off their formula line:** 57 would move exactly as they would today. 5 would move further: Otter Scout 1/7 → 1/9 now, **1/10** with the proposal; Fungal Colossus 2/17 → 2/18 now, **2/19** with the proposal; Wolf Pack Runner 3/10 → 3/11 now, **3/12** with the proposal; Elderhorn Monarch 1/7 → 1/10 now, **3/22** with the proposal; Riverside Peddler 1/4 → 1/6 now, **2/6** with the proposal.
- **40 more cards** sit on their line today and would grow under the proposal, because cheaper Bounty, On Attack or Add Wait gives them room. Most gain +1 Health. The big ones are the Black Dragon 1/1 → 5/5, the Nautilus Drifter 1/3 → 2/7 and the Village Miller 2/3 → 3/4.
- No card loses its line.

<details><summary>All 62 drifted cards (current → line under the proposal)</summary>

Dolphin Knight 4/7 → 4/8; Otter Scout 1/7 → 1/10; Great Horned Owl 2/12 → 2/13; Bramblewood Lynx 5/6 → 5/7; Fungal Colossus 2/17 → 2/19; Pike Lancer 4/7 → 4/8; Wolf Pack Runner 3/10 → 3/12; Elderhorn Monarch 1/7 → 3/22; Termite Mound 0/6 → 0/14; Marsh Gas Toad 1/10 → 1/11; Magma Salamander 3/10 → 3/11; Fiddler Crab Swarm 1/7 → 1/8; Humpback Elder 2/15 → 2/19; Raccoon Nightcrew 4/7 → 4/8; Kraken Spawnling 2/12 → 2/15; Magma Titan 2/10 → 2/12; Coral Current Eel 3/8 → 3/9; Fen Mink 1/7 → 1/10; Ant Scout 1/4 → 1/5; Voidfeather Scout 2/4 → 2/5; Meadow Frog 2/5 → 2/6; Pit Glutton 2/10 → 2/11; Lurking Dread 1/7 → 1/10; Night Watchman 1/3 → 1/4; Otter Ferryman 3/7 → 3/8; Echo Matriarch 2/11 → 2/12; Net Thrower 3/8 → 3/9; Riverside Peddler 1/4 → 2/6; Badger Lumberjack 1/10 → 1/11; Grindstone Boar 3/10 → 3/12; Rainmaker Frog 3/10 → 3/11; Siege Rhino 5/15 → 5/16; Stonedrop Vulture 6/6 → 9/9; Otter Flag Bearer 2/7 → 2/8; Triumphvirate 4/16 → 4/17; Goliath Broodmother 4/17 → 4/19; Vampire Bat 2/4 → 2/5; Baby Bat 2/4 → 2/5; Nightjar Drifter 1/6 → 1/9; Hoopoe Herald 2/11 → 2/12; Marula Elephant 4/20 → 4/21; Swordfish Spearman 3/13 → 3/14; Mayfly Dancer 3/7 → 3/8; Echidna Quillshot 4/13 → 4/15; Skunk Gasser 1/3 → 1/4; Supernova Jelly 2/6 → 2/7; Snow Leopard 2/12 → 2/14; Rimeheart Colossus 3/17 → 3/19; Cottonmouth Matriarch 1/4 → 1/5; Water Vole 1/3 → 1/4; Oystercatcher 2/4 → 2/5; Great Crested Grebe 2/5 → 2/6; Swamp Rabbit 1/3 → 1/4; Wolf Spider Mother 3/7 → 3/8; Cave Swiftlet 1/4 → 1/6; Proboscis Monkey 2/7 → 2/9; Anvil Thrush 1/4 → 1/6; Garden Tiger Moth 1/4 → 1/5; Harp Seal Pup 1/4 → 1/6; Beluga 1/11 → 1/15; Arctic Tern 1/7 → 1/8; Ringed Seal 1/9 → 1/11.
</details>

<details><summary>The 40 other cards that would move</summary>

Yeti 5/25 → 5/26; Scraper of Skies 0/24 → 0/25; Otter Shieldback 3/13 → 3/14; War Hound 3/10 → 3/11; Armored Mastiff 4/18 → 4/19; War Panther 5/16 → 5/17; Tunnel Wyrm 3/13 → 3/14; Elder Willow 0/30 → 0/32; Stoneheart Golem 3/19 → 3/20; Pufferfish Bulwark 1/15 → 1/16; Reef Shark 5/14 → 5/15; Quillguard 2/17 → 2/18; Raccoon Bandit 4/5 → 4/6; Raccoon Warlord 4/17 → 4/18; Badger Berserker 3/12 → 3/13; Crocodile Ambusher 5/15 → 5/16; Turtle Bastion 2/20 → 2/21; Nautilus Drifter 1/3 → 2/7; Chipmunk Stockpiler 1/7 → 1/8; Badger Sapper 3/13 → 3/15; Woodland Brawler 3/13 → 3/14; Stag Knight 4/13 → 4/15; Beaver Builder 1/6 → 1/8; Dam Wall 0/18 → 0/19; Riverworks Bastion 0/25 → 0/27; Constrictor Coil 4/13 → 4/14; Vampire Roost 0/21 → 0/23; Field Mouse 1/5 → 1/7; Squire's Mount 3/11 → 3/12; Warhorse Charger 4/14 → 4/15; Bog Behemoth 1/23 → 1/24; Lucky Hopper 1/10 → 1/12; Buck Brawler 4/13 → 4/15; Hanging Loafer 2/19 → 2/20; Ancient Sloth Titan 4/36 → 4/37; Mangrove Monitor 3/9 → 3/10; Black Dragon 1/1 → 5/5; Village Miller 2/3 → 3/4; Cinder Stoker 1/8 → 1/9; Pack Mule 1/8 → 1/9.
</details>

## The 116 cards that still have no line: the cheapest fix for each

"S / room" is the card's skill worth against the most S its smallest line (1/1, or 0/1) allows. That room is about N/3 at its level, and lower for a flyer.
The cheapest fix is the single change that removes the least S and gives a line above A+H 3. It shrinks a skill's number or drops one skill or trigger. Flying and the other half-miss skills are never dropped; where dropping one alone would do, the last column says so.
The last column also names any option above (A, B or C) that frees the card with no card change. 61 of the 116 have one.
115 cards have a single-change fix; 1 needs two changes.

| Card | Stats | S / room | Biggest prices | Cheapest fix → line | Or: an option price that frees it |
|---|---|---|---|---|---|
| Abbey Goose | 1/1 | 8 / 5.18 | healing 8 | healing 2 → 1 → 3/3 | – |
| Alley Cat | 1/8 | 5.67 / 4.57 | twinStrike 3.17, bleed 2.5 | drop bleed → 1/8 | – |
| Alpine Swift | 1/1 | 5 / 4.05 | quick 5 | drop quick → 3/3 | quick 2.35; or drop flying → 1/1 |
| Ant Warrior | 3/6 | 7.5 / 4.28 | rage 5, swarm 2.5 | drop rage → 2/5 | – |
| Arc Bat | 1/1 | 7 / 6.33 | electricity 6, nocturnal 1 | drop nocturnal → 2/2 | electricity 1.92; or drop flying → 3/3 |
| Ash Cloud Condor | 1/1 | 6.3 / 5.68 | onSpawn 6.3 | drop trigger onSpawn → stun → 4/4 | –; or drop flying → 3/3 |
| Ash Imp | 2/7 | 6 / 3.68 | sacrifice 6 | sacrifice 2 → 1 → 1/5 | sacrifice 1 |
| Ashmantle Fiend | 5/22 | 13 / 12.74 | immolation 8, scare 5 | scare 2 → 1 → 3/15 | immolation 2 |
| Banded Sea Krait | 1/1 | 7 / 6.26 | venomous 6, nocturnal 1 | drop nocturnal → 2/2 | venomous 2.41 |
| Barnacle Fortress | 0/1 | 7.5 / 6 | armor 7.5 | armor 5 → 4 → 0/6 | – |
| Battlement Heron | 1/14 | 9 / 7.13 | arrow 6, sentry 3 | arrow 2 → 1 → 1/13 | – |
| Bee Drone | 0/1 | 7.6 / 3.39 | onAttacked 7.6 | drop trigger onAttacked → spawnCard → 0/6 | – |
| Blackmass Acolyte | 1/1 | 6 / 5.18 | desecrate 6 | drop desecrate → 5/5 | desecrate 2.99 |
| Blind Cave Fish | 1/1 | 4.6 / 3.18 | darksight 3, tide 1.5 | drop darksight → 2/2 | – |
| Blister Beetle | 1/1 | 5.2 / 5 | onDeath 5.2 | trigger onDeath → poison: amount 5 → 4 → 2/2 | poison 0.93 |
| Blue Dragon | 4/19 | 24.84 / 14.45 | supremeTide 8, supreme 7 | two changes: lightning 4 → 1; drop supreme → 2/9 | – |
| Boar Rampager | 1/1 | 9.64 / 8.05 | sweep 7.8, bounty 1.84 | drop bounty → 2/2 | sweep 1.91 |
| Bone Diviner | 1/1 | 7.8 / 6.64 | evoluteOmega 5, onKill 2.8 | trigger onKill → gain: amount 2 → 1 → 2/2 | –; or drop flying → 2/2 |
| Boreal Elk | 1/1 | 7.8 / 7.07 | sweep 7.8 | sweep 2 → 1 → 5/5 | sweep 1.91 |
| Caiman Hatchling | 1/1 | 5 / 3.86 | quick 5 | drop quick → 4/4 | quick 2.35 |
| Chamois Leaper | 1/7 | 7.6 / 6.33 | mountainClimber 4, pounce 3.6 | pounce 2 → 1 → 1/7 | pounce 1.05, mountainClimber 2 |
| Chipmunk Cavalry | 1/1 | 5 / 4.64 | quick 5 | drop quick → 4/4 | quick 2.35 |
| Chipmunk Hoarder | 3/8 | 6.24 / 5.21 | onReadyGold 6.24 | drop onReadyGold → 3/9 | onReadyGold 2.6 |
| Colony | 0/11 | 7.6 / 5.62 | onAttacked 7.6 | drop trigger onAttacked → spawnCard → 0/17 | – |
| Conch Crawler | 1/1 | 5.5 / 4.9 | shell 4, tide 1.5 | drop tide → 3/3 | shell 1 |
| Coral Polyp Colony | 0/11 | 7.74 / 5.1 | onReadyGold 6.24, tide 1.5 | drop onReadyGold → 0/14 | onReadyGold 2.6 |
| Courier Pigeon | 1/1 | 4.31 / 2.95 | onSpawn 4.31 | drop trigger onSpawn → drawCard → 2/2 | drawCard 2.28 |
| Crown-of-thorns Star | 1/1 | 9.4 / 6.3 | thorns 5.4, poison 2.5 | drop thorns → 4/4 | – |
| Daily Post | 1/1 | 4.31 / 3.09 | onSpawn 4.31 | drop trigger onSpawn → drawCard → 2/2 | drawCard 2.28 |
| Dune Jackal | 1/1 | 9 / 4.64 | quick 5, dry 4 | drop quick → 2/2 | – |
| Dune Jackal Scout | 1/1 | 5.5 / 5.09 | dry 4, armor 1.5 | drop armor → 3/3 | – |
| Eagle Sharpshooter | 1/6 | 7 / 5.88 | arrow 6, diurnal 1 | arrow 2 → 1 → 1/8 | –; or drop flying → 1/4 |
| Ember Centipede | 1/1 | 9 / 5.6 | quick 5, dry 4 | drop dry → 2/2 | – |
| Fathom Leviathan | 5/28 | 42.34 / 16.35 | tsunami 30, supreme 7 | drop tsunami → 4/25 | – |
| Fire Ant Raft | 1/3 | 6.5 / 6.13 | poison 2.5, tide 1.5 | drop tide → 2/6 | swarm 1 |
| Fleetfoot'd | 1/1 | 6.5 / 4.03 | quick 5, tide 1.5 | drop quick → 3/3 | quick 2.35 |
| Fox Warchief | 1/1 | 9.64 / 8.26 | sweep 7.8, bounty 1.84 | drop bounty → 2/2 | sweep 1.91 |
| Fulmar Spitter | 1/1 | 5.4 / 4.91 | thorns 5.4 | thorns 2 → 1 → 3/3 | –; or drop flying → 2/2 |
| Fumarole Ibex | 1/13 | 7.6 / 7.07 | mountainClimber 4, pounce 3.6 | pounce 2 → 1 → 1/13 | pounce 1.05, mountainClimber 2 |
| Giant Water Bug | 1/1 | 7.5 / 6.16 | venomous 6, tide 1.5 | venomous 2 → 1 → 4/4 | – |
| Golden Eagle Diver | 1/1 | 4.6 / 3.97 | pounce 3.6, diurnal 1 | pounce 3 → 1 → 2/2 | pounce 1.05; or drop flying → 2/2 |
| Goliath Tentacle | 1/1 | 13.2 / 11.47 | sweep 11.7, tide 1.5 | sweep 5 → 3 → 6/6 | sweep 1.91 |
| Greater Siren | 1/1 | 9.3 / 7.81 | regen 7.8, tide 1.5 | regen 3 → 2 → 4/4 | – |
| Green Dragon | 3/18 | 16.62 / 14.74 | poison 7.5, supreme 7 | poison 3 → 2 → 2/9 | –; or drop flying → 3/17 |
| Grovebearer Dragon-Turtle | 1/1 | 24.36 / 17.72 | sturdy 8, regen 7.8 | drop regen → 6/6 | sturdy 0.7 |
| Hedgerow Shrew | 1/1 | 5 / 3.86 | quick 5 | drop quick → 4/4 | quick 2.35 |
| Honey Badger Fury | 2/9 | 5 / 4.64 | rage 5 | drop rage → 2/10 | rage 2.72 |
| Hummingbird Needler | 1/3 | 3.5 / 3.39 | bleed 2.5, pierce 1 | drop pierce → 1/4 | bleed 2.1, pierce 0; or drop flying → 1/4 |
| Ironmaw Warwolf | 1/1 | 12 / 11.31 | bleed 5, fork 4 | armor 2 → 1 → 4/4 | bleed 2.1, fork 1.69 |
| Jackrabbit Sprinter | 1/1 | 5 / 4.99 | quick 5 | drop quick → 5/5 | quick 2.35 |
| Krill Swarm | 1/7 | 4 / 3.86 | swarm 2.5, tide 1.5 | drop tide → 1/7 | swarm 1 |
| Land Tiller | 1/8 | 6.24 / 3.86 | onReadyGold 6.24 | drop onReadyGold → 1/10 | onReadyGold 2.6 |
| Lemming Swarm | 1/5 | 4.7 / 3.86 | swarm 2.5, brood 2.2 | drop brood → 1/7 | swarm 1 |
| Limpet Clinger | 1/1 | 5.5 / 3.86 | shell 4, tide 1.5 | drop shell → 3/3 | shell 1 |
| Lionfish | 1/1 | 6.9 / 6.13 | thorns 5.4, tide 1.5 | drop tide → 3/3 | – |
| Lone Grey Wolf | 4/15 | 12 / 8.54 | loneWolf 12 | drop loneWolf → 4/17 | – |
| Lunar Howler | 1/1 | 12 / 7.78 | moonborn 12 | moonborn 4 → 1 → 6/6 | – |
| Magma Wraith | 1/9 | 7.1 / 5.4 | fireArrow 7, evasive 0.1 | fireArrow 2 → 1 → 1/7 | – |
| Marshal of Rivergate | 1/1 | 14.7 / 9.72 | sweep 11.7, armor 3 | sweep 4 → 1 → 6/6 | sweep 1.91 |
| Moon Jerboa | 1/1 | 8 / 6.58 | fullMoon 8 | fullMoon 3 → 1 → 5/5 | – |
| Moonlit Hare | 1/1 | 8 / 5.35 | moonborn 8 | moonborn 2 → 1 → 3/3 | – |
| Nectar Vintner | 1/1 | 4 / 3.09 | bloom 4 | drop bloom → 2/2 | – |
| Nightshade Moth | 1/1 | 5 / 4.58 | sleep 4, nocturnal 1 | drop nocturnal → 2/2 | sleep 1.74; or drop flying → 2/2 |
| Obsidian Scorpion | 1/1 | 8 / 6.92 | poison 5, armor 3 | armor 2 → 1 → 2/2 | – |
| Octopus Tactician | 1/1 | 11.14 / 8.58 | sweep 7.8, bounty 1.84 | sweep 3 → 1 → 4/4 | sweep 1.91 |
| Old Willow of the Ford | 2/24 | 14.04 / 12.97 | regen 7.8, onReadyGold 6.24 | regen 3 → 2 → 2/19 | onReadyGold 2.6 |
| Otter Guard | 4/8 | 6 / 5.95 | arrow 6 | arrow 2 → 1 → 3/7 | – |
| Pangolin Roller | 1/1 | 8 / 6.44 | sturdy 8 | drop sturdy → 6/6 | sturdy 0.7 |
| Pincushion Urchin | 1/1 | 6.9 / 4.9 | thorns 5.4, tide 1.5 | thorns 2 → 1 → 2/2 | – |
| Plague Gnat Cloud | 1/1 | 6 / 5 | proliferate 6 | drop proliferate → 5/5 | proliferate 3.71 |
| Poison Dart Croaker | 1/1 | 6.5 / 5.81 | poison 5, tide 1.5 | drop tide → 3/3 | – |
| Poison Dart Frog | 1/1 | 7.5 / 4.46 | poison 7.5 | poison 3 → 1 → 3/3 | – |
| Porcupine Roller | 1/1 | 5.4 / 4.35 | thorns 5.4 | thorns 2 → 1 → 3/3 | – |
| Puddle Changeling | 1/1 | 10.1 / 3.86 | twin 10, changeling 0.1 | drop twin → 3/3 | – |
| Puffball Bombardier | 1/10 | 5.5 / 5.35 | arrow 3, poison 2.5 | drop poison → 1/11 | poison 2.19 |
| Puppeteer Imp | 1/1 | 7.35 / 5.53 | onSpawn 7.35 | drop trigger onSpawn → mindControl → 5/5 | – |
| Pyroclast Wyrm | 5/17 | 10 / 9.61 | fireArrow 7, pierce 3 | pierce 5 → 3 → 2/6 | pierce 0 |
| Quill-Thorn Boar | 1/1 | 8.1 / 6.72 | thorns 8.1 | thorns 3 → 2 → 4/4 | – |
| Rabid Jackal | 1/1 | 6 / 4.53 | rabid 5, weakness 1 | drop rabid → 4/4 | – |
| Rafflesia | 1/1 | 7.35 / 5.34 | onRoundStart 7.35 | drop trigger onRoundStart → debuff → 5/5 | – |
| Raven Harbinger | 1/1 | 8 / 6.35 | poison 5, evolute 3 | poison 2 → 1 → 3/3 | – |
| Raven Hexcaller | 1/1 | 6 / 4.54 | evoluteAlpha 4, render 2 | drop render → 2/2 | – |
| Red Dragon | 4/20 | 22.34 / 14.74 | fireArrow 10.5, supreme 7 | drop fireArrow → 3/17 | – |
| Red-backed Salamander | 1/1 | 5.2 / 5 | regen 5.2 | regen 2 → 1 → 4/4 | – |
| Red-billed Chough | 1/1 | 4 / 3.99 | mountainClimber 4 | drop mountainClimber → 3/3 | mountainClimber 2; or drop flying → 3/3 |
| Rivergate Drummer | 1/1 | 6.5 / 5.35 | onAllyPlayed 6.5, buff 5.25 | drop kinRally → 5/5 | – |
| Rock Pool Starfish | 1/1 | 6.7 / 5 | regen 5.2, tide 1.5 | regen 2 → 1 → 3/3 | – |
| Rodent King | 4/14 | 10.24 / 8.58 | onReadyGold 6.24, king 4 | drop king → 3/11 | onReadyGold 2.6 |
| Ruby-Throat Duelist | 1/1 | 6 / 4.62 | quick 5, pierce 1 | drop quick → 3/3 | quick 2.35 |
| Salamander Pyromancer | 2/18 | 16 / 10.12 | fireball 16 | fireball 15 → 9 → 1/3 | – |
| Sea Turtle Elder | 1/1 | 12 / 9.36 | armor 6, revive 4.5 | armor 4 → 2 → 2/2 | – |
| Sheep | 1/7 | 3 / 2.83 | taunt 3 | drop taunt → 1/7 | taunt 1 |
| Snail Mail | 0/1 | 10.11 / 7.02 | onSpawn 8.61, armor 1.5 | trigger onSpawn → drawCard: count 2 → 1 → 0/6 | drawCard 2.28 |
| Soldier Ant | 1/2 | 5 / 4.83 | swarm 2.5 | drop swarm → 3/6 | swarm 1 |
| Sperm Whale Elder | 6/17 | 15 / 10.12 | tsunami 15 | drop tsunami → 6/18 | – |
| Spitting Cobra | 6/10 | 18 / 8.09 | twinShot 18 | drop twinShot → 6/11 | – |
| Starfall Owl | 5/26 | 22 / 15.91 | meteor 22 | meteor 20 → 13 → 3/18 | meteor 1.32 |
| Sunfeather Scout | 1/7 | 6.24 / 4.05 | onReadyGold 6.24 | drop onReadyGold → 1/8 | onReadyGold 2.6 |
| Sunspire Choirmother | 3/6 | 8.34 / 6.61 | esprit 4.2, espritHp 2.2 | drop diurnal + diurnalHp → 1/3 | esprit 1 |
| Swift Fox | 1/1 | 5.59 / 4.92 | fastForward 5.59 | drop fastForward → 5/5 | fastForward 1.74 |
| Swordbill Challenger | 3/5 | 5 / 4.62 | taunt 3, counterattack 2 | drop counterattack → 2/4 | taunt 1, counterattack 1; or drop flying → 2/4 |
| Talon Archer | 1/2 | 7 / 5.83 | arrow 6, diurnal 1 | arrow 2 → 1 → 2/5 | –; or drop flying → 1/3 |
| Tax-Collector Teal | 2/4 | 4 / 3.94 | swipe 3, hoard 1 | hoard 2 → 1 → 1/3 | swipe 2.72, hoard 0; or drop flying → 2/4 |
| The Contradiction | 2/19 | 10.2 / 9.34 | regen 5.2, rage 5 | regen 2 → 1 → 2/15 | rage 2.72 |
| The Magnate Duck | 1/22 | 19.02 / 14.87 | swipe 6, bounty 5.52 | drop armor → 1/11 | – |
| Thornwood Palisade | 0/16 | 7 / 6.55 | spiteful 5, counterattack 2 | drop counterattack → 0/14 | counterattack 1 |
| Tomcat | 1/1 | 5 / 3.86 | quick 5 | drop quick → 4/4 | quick 2.35 |
| Truffle Piglet | 3/11 | 6.24 / 6.19 | onReadyGold 6.24 | drop onReadyGold → 3/13 | onReadyGold 2.6 |
| Tunnel Ant | 2/9 | 6.5 / 6.3 | ambush 4, swarm 2.5 | ambush 2 → 1 → 2/10 | ambush 1.09, swarm 1 |
| Vampire Bat Nurse | 1/1 | 10 / 6.23 | nursing 10 | nursing 2 → 1 → 3/3 | nursing 2.73 |
| Voltaic Eel | 1/7 | 10.43 / 6.35 | chainLightning 8, tide 1.5 | drop chainLightning → 2/12 | – |
| War Elephant | 0/28 | 21 / 12.54 | arrowCount 12, arrow 6 | drop arrowCount → 0/28 | – |
| White Dragon | 4/19 | 17.14 / 15.3 | supreme 7, scare 5 | scare 3 → 1 → 2/10 | –; or drop flying → 3/17 |
| Woodpecker Sapper | 1/1 | 7 / 6.4 | perforate 7 | perforate 2 → 1 → 5/5 | perforate 2.45 |
| Worker Ant | 1/1 | 5.54 / 3.32 | onAttack 5.54 | drop trigger onAttack → drawCard → 3/3 | drawCard 2.28 |
| Yellow-bellied Sea Snake | 1/1 | 9 / 6.65 | poison 7.5, tide 1.5 | poison 3 → 1 → 5/5 | – |

## Fragile: counted twice

Fragile ("takes double damage") is −8 as a skill **and** ×0.75 on N. Only one band card has it: **Mayfly Dancer**, printed 3/7 (Common, Flying, Fragile).

| Reading | N (L1) | S | Line |
|---|---|---|---|
| As now: −8 and ×0.75 | 9.05 | -8 | 3/8 |
| Drop the −8 (Fragile 0), keep ×0.75 | 9.05 | 0 | 1/3 |
| Drop the ×0.75, keep −8 | 12.06 | -8 | 4/8 |
| Neither (a plain flyer, for comparison) | 12.06 | 0 | 2/4 |
| Fragile at its halved-world measure, ×0.75 kept | 9.05 | -1.76 | 1/3 |

- Double damage roughly halves Health, so these lines play like 3/4, 1/1.5 and 4/4 flyers against a plain 2/4.
- Dropping the ×0.75 gives the strongest line. With S = −8, cap 2's S·|S| is −64, which cancels cap 2 for this card on its own.
- Dropping the −8 makes Fragile a pure penalty, weaker than the plain card.
- The halved-world measure of Fragile on a 1/4 is −1.76 (about half its Health); the older measure is −7.62.
- Fragile at that measure with the ×0.75 kept lands at 1/3, the same as dropping the −8. Once the ×0.75 is on N, any small price gives the same line, so the real choice is among the first three rows: keep both (3/8), drop the −8 (1/3) or drop the ×0.75 (4/8).

## Files
- `docs/balance/pass-3-skill-costs-2026-10-22.json`: the 5 proposed prices. Each row has `value` = `proposed`, so `node tools/hub/apply_skill_costs.js docs/balance/pass-3-skill-costs-2026-10-22.json` applies them once you approve.
- `docs/balance/pass-3-dryrun-2026-10-22.json`: the raw dry run (no-fit list, contributions, options, re-fit, fixes, Fragile).
- `tools/pass3_skill_costs_2026_10_22.js`: the analysis (read-only; `analyse`, `refit`, `fragile`, `report`).
