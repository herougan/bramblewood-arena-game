# THEME5: more carried cards, one new archetype each (proposal, 2026-11-03)

**Status: proposal only.** No card, map list or deck was changed. You pick the carried cards (decision THEME5-1); the lists, then the skirmish decks, follow in later packages.

Your note (11-03 09:39): "For our optimised skirmish decks per map, it's good the more there are: That means there are archetypes available. My opinion, open Map 11+ to have +1 carried. Then as we talked about how Map 21+ has -1 unique, they will have +2 carried to compensate. And this will increase over time. Submaps will have +1 carried as well, compared to when they were unlocked ... If we have 3, we can scatter 3 of these slightly down-tuned peak deck strategies in 3 skirmishes then the rest we have a random and weaker blend."

Data and tools (read-only):
- `node tools/theme5/carried_data_2026_11_03.js` writes `carried-data-2026-11-03.json`. Per list it gives the own / carried counts, the rarity cap, the fights with their targets, the PRO / BPRO decks and every legal carried candidate with its theme tag.
- `node tools/theme5/check_picks_2026_11_03.js` checks the picks in `carried-picks-2026-11-03.json`. Run on the final picks: **34 picks, 0 problems**. Every candidate is legal for its map, every plan card is on the map's list (or is the candidate), the copy caps hold and each plan has 20 cards (the Old Bramble's has 19, see its entry).
- `node tools/theme5/skirmish_plan_2026_11_03.js` writes `skirmish-plan-2026-11-03.json` (section 3).

How "own" and "carried" are counted: a card is **own** on the first list in road order that holds it, and **carried** on every later list. Road order is the map you reach a list on (`mapUnlockNumberOf`), with a main map before its side maps. This is THEME3's rule: the T-3 to T-5 list never counts as a source, SPECIAL counts on a main map, and Baby cards are not counted.

## 1. The new list-size rule

| Tier | Own (unique) | Carried | Total | Change from today (THEME1-1) |
|---|---|---|---|---|
| Maps 0-10 | 8-11 | 4-5 | 12-16 | none |
| Maps 11-20 | 8-11 | **5-6** | 13-17 | carried +1 |
| Maps 21+ | **7-10** | **6-7** | 13-17 | own -1, carried +2 |
| Later eras (Map 31+ ...) | later | later | later | "this will increase over time": left open (THEME5-1 option) |
| Side maps | 1-3 | **today's count +1** (at least 11) | 12-16 | carried +1 |

Reading of the side-map line: "+1 carried compared to when they were unlocked" is read as +1 over each side map's list as it stands, so every side map gains one card. Some side maps already carry 11-12 (above today's 10+), and they gain one too. The other reading is a side map follows the main tier of its unlock map (+1 from Map 11, +2 from Map 21: the Ice Hollow, the Old Bramble and the Basalt Foundry would get +2). It is option (c) in THEME5-1.

### Each list today and its target

The table also shows the "own" overages that are already there (marked "-N to fit"). They are your THEME4 picks, and THEME5 does not touch them. Only the 21+ rows lose an own card because of the new rule.

| Map | Tier | Own / carried now | Counted now | Own target | Carried target | Total target | Carried to add |
|---|---|---|---|---|---|---|---|
| 0 Bramblewood Outskirts | 0-10 | 12 / 4 +1 Baby | 16 | 8-11 (-1 to fit) | 4-5 | 12-16 | 0 |
| 1 Thistlewood | 0-10 | 13 / 4 | 17 | 8-11 (-2 to fit) | 4-5 | 12-16 | 0 |
| 2 Pebble Beach | 0-10 | 11 / 4 | 15 | 8-11 | 4-5 | 12-16 | 0 |
| 3 Gannet Cliffs | 0-10 | 9 / 4 | 13 | 8-11 | 4-5 | 12-16 | 0 |
| 4 Sunken Hollow | 0-10 | 11 / 4 | 15 | 8-11 | 4-5 | 12-16 | 0 |
| 5 Gatorback Swamp | 0-10 | 9 / 4 +1 Baby | 13 | 8-11 | 4-5 | 12-16 | 0 |
| 6 Sable Swampmire | 0-10 | 8 / 4 | 12 | 8-11 | 4-5 | 12-16 | 0 |
| 7 The Morel Hollow | 0-10 | 13 / 4 +1 Baby | 17 | 8-11 (-2 to fit) | 4-5 | 12-16 | 0 |
| 8 Caves & Alcoves | 0-10 | 10 / 4 | 14 | 8-11 | 4-5 | 12-16 | 0 |
| 9 The Kelp Mangroves | 0-10 | 11 / 4 | 15 | 8-11 | 4-5 | 12-16 | 0 |
| 10 Coral Current | 0-10 | 11 / 4 | 15 | 8-11 | 4-5 | 12-16 | 0 |
| 11 Eyrie Heights | 11-20 | 11 / 4 | 15 | 8-11 | 5-6 | 13-17 | +1 |
| 12 The Briar Maze | 11-20 | 11 / 4 | 15 | 8-11 | 5-6 | 13-17 | +1 |
| 13 The Redwood Deep | 11-20 | 12 / 4 | 16 | 8-11 (-1 to fit) | 5-6 | 13-17 | +1 |
| 14 Savanna Reaches | 11-20 | 11 / 3 | 14 | 8-11 | 5-6 | 13-17 | +2 (3 today, after KK5's cut) |
| 15 The Long Grass | 11-20 | 11 / 4 | 15 | 8-11 | 5-6 | 13-17 | +1 |
| 16 The Pinewood Taiga | 11-20 | 11 / 4 | 15 | 8-11 | 5-6 | 13-17 | +1 |
| 17 Wolfsbane Tundra | 11-20 | 12 / 4 | 16 | 8-11 (-1 to fit) | 5-6 | 13-17 | +1 |
| 18 The Glass Dunes | 11-20 | 12 / 4 | 16 | 8-11 (-1 to fit) | 5-6 | 13-17 | +1 |
| 19 Ashen Spurn | 11-20 | 10 / 4 | 14 | 8-11 | 5-6 | 13-17 | +1 |
| 20 The Sundered Peak | 11-20 | 11 / 4 | 15 | 8-11 | 5-6 | 13-17 | +1 |
| 21 The Quiet Summit | 21+ | 11 / 4 | 15 | 7-10 (-1 to fit) | 6-7 | 13-17 | +2 |
| 22 The Rimefire Caldera | 21+ | 12 / 4 | 16 | 7-10 (-2 to fit) | 6-7 | 13-17 | +2 |
| 23 The Goldfeather Siege | 21+ | 10 / 4 | 14 | 7-10 | 6-7 | 13-17 | +2 |
| 24 Goldfeather Keep | 21+ | 11 / 4 | 15 | 7-10 (-1 to fit) | 6-7 | 13-17 | +2 |

| Side map | Unlocks at | Own / carried now | Counted now | Own target | Carried target | Total target | Carried to add |
|---|---|---|---|---|---|---|---|
| 2-A Lilypad Reach | 6 | 3 / 10 | 13 | 1-3 | 11 | 12-14 | +1 |
| 2-B Smugglers' Grotto | 7 | 5 / 10 | 15 | 1-3 (-2 to fit) | 11 | 12-14 | +1 |
| 7-A The Mycelium Deep | 8 | 2 / 10 +1 Baby | 12 | 1-3 | 11 | 12-14 | +1 |
| 10-A The Sunken Depths | 11 | 3 / 11 | 14 | 1-3 | 12 | 13-15 | +1 |
| 1-A Clovermead | 12 | 1 / 12 | 13 | 1-3 | 13 | 14-16 | +1 |
| 5-A The Sunken Grove | 13 | 1 / 10 +2 Baby | 11 | 1-3 | 11 | 12-14 | +1 |
| 11-A The Aerie Vault | 15 | 1 / 12 | 13 | 1-3 | 13 | 14-16 | +1 |
| 8-A The Glimmer Depths | 16 | 5 / 10 | 15 | 1-3 (-2 to fit) | 11 | 12-14 | +1 |
| 14-A The Canopy | 18 | 3 / 11 | 14 | 1-3 | 12 | 13-15 | +1 |
| 18-A The Pale Desert | 19 | 3 / 11 | 14 | 1-3 | 12 | 13-15 | +1 |
| 20-A Eye of the Volcano | 20 | 1 / 10 | 11 | 1-3 | 11 | 12-14 | +1 |
| 20-B Volcano Lair | 20 | 5 / 10 +1 Baby | 15 | 1-3 (-2 to fit; the Lair's own rule allows 5) | 11 | 12-16 | +1 |
| 17-A The Ice Hollow | 21 | 1 / 11 | 12 | 1-3 | 12 | 13-15 | +1 |
| 0-B The Old Bramble | 21 | 1 / 12 | 13 | 1-3 | 13 | 14-16 | +1 |
| 19-A Basalt Foundry | 23 | 4 / 10 | 14 | 1-3 (-1 to fit) | 11 | 12-14 | +1 |

In total: 11 cards on Maps 11-20, 8 on Maps 21-24 and 15 on side maps, **34 carried candidates**. The 21+ maps also each lose one own card (section 4).

## 2. The candidates, one archetype each

Every candidate must meet these conditions:
- it is on an earlier list and in play;
- it is within the map's rarity cap (the highest of its fights, as deckopt reads it) and obtainable by the map's unlock number;
- it is not a Baby card and not a faction card;
- you have not cut it from that list.

Every plan is a 20-card deck under the BPRO rule (at most 6 different cards, the rarity copy caps). It uses only the map's list plus the candidate, so it can become a skirmish deck as it stands.

The "Shares" column counts how many of the plan's different cards appear in the closest existing PRO / BPRO deck of that map. No plan shares more than 3 of its 6 cards with any existing deck. In every plan the candidate is the card that makes the deck work.

The "tag" is the card's biome tag score from `canonical/unit-themes.json` against the map (4 = the map's biome, 3 = a second biome of the map, 1 = a neighbouring biome, -3 = no match). Where the tag says -3, the theme note says why it still fits. The existing deck types come from `canonical/pro-skirmishes.json`. The ladder (`docs/balance/ref/ref-ladder.json`) is the player's side and was used only to check the plans are not just the ladder's strongest decks.

**Optimizer check: not run.** The machine was busy: load 3.0 on 2 cores at 10:00, with other packages running. Each archetype is a starting point for the deck step's focus search (section 3). None is a measured deck.

### Maps 11-20 (+1 each, Savanna +2)

**11 Eyrie Heights.** Existing decks: flying in four shapes (open, swarm, economy, big).
- **The Gannet Queen** (Uncommon, own on Map 3; tag 1). Archetype **Stoop and Pounce**: Gannet Queen 2, Golden Eagle Diver 4, Peregrine Stooper 4, Chamois Leaper 4, Alpine Marmot 3, Alpine Salamander 3.
- The plan: three Pounce cards plus the Queen, which strike as they land while the Marmot guards. No existing deck runs more than one Pounce card. Shares 1/6.
- Theme: the cliff colony's queen comes up to the eyrie. Gannet Cliffs is already this map's neighbour in the story.

**12 The Briar Maze.** Existing decks: open, big, economy and swarm, all bodies without a plan.
- **Hawthorn Shieldbug** (Common, own on Map 7; tag 1). Archetype **Hedge Fortress**: Shieldbug 4, Quill-Thorn Boar 3, Quillguard 3, Bramble Hoglet 4, Badger Lumberjack 4, Gatling Hog 2.
- The plan: Guardians and Thorns. Attackers are pulled into Thorn-backed walls while the Gatling Hog shoots from behind. Shares 3/6 (12-BPRO-1).
- Theme: a hawthorn bug in a maze of hedges.

**13 The Redwood Deep.** Existing decks: big, open, economy and swarm, built on 0-1 Lumber cards and fox swarms.
- **Badger Lumberjack** (Uncommon, own on Map 1; tag 1). Archetype **Old-Growth Giants**: Badger Lumberjack 4, Redwood Woodpecker 4, Grizzly Vanguard 4, Stag Knight 4, Quillback Elder 4.
- The plan: Lumberjack plus Milling ramp into the map's 2-Lumber giants, which no existing deck plays (apart from 4 Quillback Elders in one). Shares 2/6.
- Theme: a woodcutter in a forest of giant trees.

**14 Savanna Reaches (+2).** Existing decks: hyena swarms and economy (Dust Hyena, Grave-Grin Hyena, Hoopoe Herald, Zebra), plus the House Cat and Mouse Sapper bodies.
- **Ant Hill** (Common, own on Map 12; tag -3). Archetype **Mound and Herd**: Ant Hill 3, Marula Elephant 4, Acacia Giraffe 3, Pangolin Roller 3, Springbok Pronker 4, Weaver Bird 3.
  - The plan: a spawning mound behind a wall of big grazers. The Elephant and the Giraffe are in no existing deck. Shares 2/6.
  - Theme: read as a termite mound, the savanna's own landmark. KK5's cut was of an over-represented animal; this adds insects.
- **Golden Eagle Diver** (Uncommon, own on Map 3; tag -3). Archetype **Sun Strike**: Golden Eagle Diver 4, Savanna Cheetah 2, Spitting Cobra 3, Grave-Grin Hyena 4, Plains Zebra 4, Pangolin Roller 3.
  - The plan: burst damage first (Pounce 3, Quick, Twin Shot), then Executioner finishes what is left. A tempo-kill plan, not a swarm. Shares 2/6.
  - Theme: a Diurnal raptor over open grass. It needs no cover, and this map has none.

**15 The Long Grass.** Existing decks: economy (Collie, Crow, Raccoon), strike-first, swarm and flying. None plays Warhorse Charger or Armory; Gilded Roadwarden appears only as 2 copies in 15-BPRO-3.
- **Truffle Piglet** (Uncommon, own on Map 7; tag 1). Archetype **Farmstead Cavalry**: Truffle Piglet 4, Lodge Engineer 4, Warhorse Charger 4, Gilded Roadwarden 3, Armory 3, Shepherd 2.
- The plan: two On Ready gold makers ramp into 2- and 4-Lumber cavalry, with Armory (Weapon Master) behind them. Shares 1/6.
- Theme: a farm pig on the farm map.

**16 The Pinewood Taiga** (a night map). Existing decks: hare evasion swarms, squirrel economy and one Dhole economy deck.
- **Owl Nightwatch** (Common, own on Map 7; tag -3). Archetype **Moonlit Pack**: Owl Nightwatch 4, Lunar Howler 3, Dhole Runner 4, Dhole Matriarch 2, Wolf Pack Runner 3, Alpha Howler 4.
- The plan: the Taiga's fights are always at night, so Nocturnal 3 and Moonborn are always on. A Pack / Pack Leader / Muster wolf pack with a stealth owl. Lunar Howler and Alpha Howler are in no existing deck. Shares 2/6.
- Theme: owls hunt pinewoods at night. The tag says fungal hollow, its first map.

**17 Wolfsbane Tundra.** Existing decks: evasion and economy swarms (hares, Ermine, Pika, Squirrel), plus the Wolverine.
- **Ibex Rockcaller** (Very Rare, own on Map 11; tag -3). Archetype **Avalanche and Quake**: Ibex Rockcaller 2, Glacial Ape-King 4, Polar Bear 2, Snow Bunting Archer 4, Talus Pika 4, Spitting Spider 4.
- The plan: board-wide control. Avalanche (cold damage and +1 Wait) and the Ape-King's Earthquake hit every grounded unit, while the shooters stay back. Neither the Ape-King nor the Polar Bear is in any existing deck. Shares 2/6.
- Theme: a mountain ibex that starts avalanches on frozen ground.

**18 The Glass Dunes.** Existing decks: Packrat / Antlion economy, open and poison.
- **Savanna Cheetah** (Very Rare, own on Map 14, a 14-8 reward; tag -3). Archetype **Haste Blitz**: Savanna Cheetah 2, Roadrunner Courier 4, Glass Golem 3, Spitting Cobra 3, Sandfish 4, Fennec Fox 4.
- The plan: a Speed race. Haste raises its neighbours' Speed, so Quick and Speed units swing first. Glass Golem 6/5 and invisible Sandfish follow. Shares 1/6.
- Theme: cheetahs live on desert edges too, and the roadrunner already sets the tempo.

**19 Ashen Spurn.** Existing decks: economy (Pumice, Pika, Stoker), open and swarm.
- **Walrus Icebreaker** (Very Rare, own on Map 17; tag 3). Archetype **Fire and Ice Front**: Walrus 2, Fire Salamander 4, Granite Ox Golem 3, Obsidian Scorpion 3, Talus Pika 4, Glacier Wolf Pack 4.
- The plan: control the front line. The Ox stuns on arrival, the Walrus freezes and shatters, the Salamander spits fire and the Wolf Pack bleeds. Shares 3/6.
- Theme: the Spurn is volcanic and icy, and the deck is literally both.

**20 The Sundered Peak.** Existing decks: economy (Stoker, Pumice, Mule, Glutton), midrange, swarm and flying economy.
- **Fire Salamander** (Uncommon, own on Map 19; tag 4). Archetype **Firing Line**: Fire Salamander 4, Magma Wraith 4, Magma Salamander 2, Ash Cloud Condor 3, Pumice Beetle 4, Cave Warlord 3.
- The plan: a ranged fire battery. Fire Arrow 2 and 1, Spitfire and the Warlord's 8-damage On Ready shot, with the Condor stunning blockers. Magma Wraith, Cave Warlord and the Condor are in no existing deck. Shares 2/6.
- Theme: volcanic.

### Maps 21-24 (+2 each)

No PRO / BPRO decks exist past Map 20 yet, so "distinct" here means the two plans differ from each other and from the map's plain body plan.

**21 The Quiet Summit.**
- **Eagle-Owl Quartermaster** (Rare, own on Map 11; tag 4). Archetype **Expose Volley**: Quartermaster 3, Snow Owl Sentinel 1, Eagle Sharpshooter 4, Eyrie Warden 4, Golden Eagle Diver 4, Mountain Goat Climber 4.
  - The plan: the Snow Owl Exposes targets, and every later hit on an Exposed target is a crit. Fletcher adds +1 to every arrow, so arrows and On Ready shots cash it in.
- **Vigil Owl** (Rare, own on 11-A; tag 4). Archetype **Vigil and Relics**: Vigil Owl 3, Friar Badger 4, Chapel Tortoise 4, Candle Moth 4, Alpine Marmot 4, Snow Owl Sentinel 1.
  - The plan: a sticky defensive board. Relic leaves a 1/1 behind when the unit dies, and Prayer Ward gives Armor while Prayer is held. This is the summit chapel.
- Theme for both: an owl's vigil on a quiet, prayerful summit.

**22 The Rimefire Caldera.**
- **Glacier Yak** (Common, own on Map 21; tag 3). Archetype **Deep Cold**: Glacier Yak 4, Rimeheart Mammoth 1, Ice Petrel 4, Permafrost Mammoth 4, Rimefire Salamander 3, Cinder Gecko 4.
  - The plan: freeze and Wait-lock (the Yak adds Wait 2 on arrival and freezes 40% of the time) while the Mammoths sweep.
- **Ash Cloud Condor** (Rare, own on Map 20; tag 4). Archetype **Ash-Stun Tempo**: Condor 3, Cinder Hornet 4, Ashwing Ptarmigan 3, Ür-Elk 2, Ember Centipede 4, Cinder Gecko 4.
  - The plan: stun the front (the Condor on arrival, the Hornet on hit), then cheap Quick bodies and the Ür-Elk's Stampede.
- Theme: the caldera's two halves, ice and ash.

**23 The Goldfeather Siege.**
- **Eagle-Owl Quartermaster** (Rare, own on Map 11; tag -3). Archetype **Arrow Storm**: Quartermaster 3, Howdah Archers 3, Balloon Archer 3, Trebuchet Crew 3, Badger Trench Digger 4, Land Tiller 4.
  - The plan: Fletcher adds +1 to every Arrow and Volley of the hired army's archers, behind the Trench Digger.
  - Theme: an army's quartermaster for an army. It reads as the Siege's best fit, even though the tag says mountain.
- **Gilded Roadwarden** (Common, own on Map 15; tag 1). Archetype **Gilded Heavies**: Roadwarden 4, Land Tiller 4, Lodge Engineer 4, Testudo Tortoise 2, Trench Digger 4, Siege Rhino 2.
  - The plan: gold ramp into the 4-Lumber Roadwarden (Pounce 6, Stampede) and Siege Rhino (Siege 4 into the bramble).
  - Theme: gilded, the Magnate's road guard.

**24 Goldfeather Keep.**
- **Ore-Smelter Mole** (Uncommon, own on 19-A; tag -3). Archetype **Iron Vault**: Ore-Smelter Mole 4, Iron Badger 1, Great Gate 4, Goose Sentry 3, Stoneheart Tortoise 4, Land Tiller 4.
  - The plan: the Mole makes Metal each turn (Heavy Metal adds 1 more), and Iron Badger gets +3/+3 for each Metal held. Walls and Taunt keep it alive. Without a Metal maker on the list, Iron Badger is a 0/35 wall.
  - Theme: "everything is counted", the keep's vault.
- **Golden Magpie** (Uncommon, own on Map 21; tag -3). Archetype **Counting House**: Golden Magpie 4, Tax-Collector Teal 4, Elderhorn Monarch 3, Land Tiller 4, Lodge Engineer 3, Mallard Halberdier 2.
  - The plan: bank Lumber. Hoard turns held Lumber into Attack, and Midas pays Lumber on kills.
  - Theme: a gold-hoarding magpie in the Magnate's keep.

### Side maps (+1 each)

**2-A Lilypad Reach.** Existing decks: tide swarm, economy and Grey Seal guard.
- **Newt Doctor** (Uncommon, own on Map 6; tag 4). Archetype **Dam Fortress**: Newt Doctor 4, Riverworks Bastion 2, Old Sturgeon 3, Muskrat Lodgekeeper 4, Platypus Spur 4, Box Turtle 3.
- The plan: a healed wall of dam builders (Rampart, Bulwark, Armor) that wins on Venomous chip damage. The Bastion and the Sturgeon are in no existing deck. Shares 2/6.

**2-B Smugglers' Grotto.** Existing decks: Driftwood / Orb-Weaver / Trash Panda economy and Grey Seal tide decks.
- **The Old Shell** (Uncommon, Pebble Beach's leader card; tag 3). Archetype **Shell Bunker**: Old Shell 2, Tide Pool Crab 4, Conch Crawler 4, Sea Turtle Elder 3, Rock Pool Starfish 4, Octopus Tactician 3.
- The plan: Shield and Shell crabs and Regeneration until the Octopus sweeps. Shares 2/6.
- Theme: the grotto sits under Pebble Beach.

**7-A The Mycelium Deep.** Existing decks: big, economy, swarm and open.
- **Bogfire Newt** (Uncommon, own on Map 7; tag 1). Archetype **Rot and Burst**: Bogfire Newt 4, Rootworm Colony 4, Dung Beetle 4, Planarian Splitter 4, Hawthorn Shieldbug 4.
- The plan: Poison 2 and Decay stack on the target, then Detonate makes the Poison tick at once. Meiosis bodies hold the line. Shares 2/6.
- Theme: a damp-loving newt from the Morel Hollow above.

**10-A The Sunken Depths.** Existing decks: tide and economy bodies (Polyp, Nautilus, Manatee).
- **Supernova Jelly** (Rare, own on Map 10; tag 4). Archetype **Shock and Nova**: Supernova Jelly 3, Electric Ray 4, Blue-ringed Octopus 3, Hagfish Silencer 3, Clownfish Scout 4, Coral Reef Shark 3.
- The plan: area damage. Charge zaps, Octolash hits 8 units, and Nova bursts every enemy on death. Shares 3/6.
- Theme: reef jellies in the wreck's current.

**1-A Clovermead.** Existing decks: ground swarms only (ants, crickets, mice).
- **Bee Sentry** (Starter, own on Map 0; tag 4). Archetype **Clover Hive**: Bee Sentry 4, Bee Forager 4, Robin Redbreast 4, Woodcock Lookout 4, Lucky Hopper 4.
- The plan: a flying, poisoning hive over a single big hopper. Shares 1/6.
- Theme: the map's own line, "rabbits, bees and mice".

**5-A The Sunken Grove.** Existing decks: open, swarm, armor and poison.
- **Mangrove Manatee** (Rare, own on Map 9; tag 1). Archetype **Regrowth Wall**: Manatee 3, Hedgehog Herbalist 3, Swamp Alligator 4, Venomlord Serpent 3, Crocodile Ambusher 3, Nutria Reedcutter 4.
- The plan: Herbalist adds +1 to every heal, so the Manatee's Regen 2 becomes 3. A slow guardian wall with the 2-3 Lumber swamp bodies. Shares 3/6.

**11-A The Aerie Vault.** Existing decks: flying and economy.
- **Talon Archer** (Very Rare, own on Map 15; tag -3). Archetype **Fletcher's Roost**: Talon Archer 2, Eagle-Owl Quartermaster 3, Eyrie Warden 4, Gale Swift 4, Alpine Marmot 4, Alpine Swift 3.
- The plan: an arrow battery. Fletcher boosts Arrow 2 while the Warden shoots On Ready. Shares 3/6.
- Theme: a flying archer in the oldest nests.

**8-A The Glimmer Depths.** Existing decks: Stonemason / Prospector economy, flying night and Huntsman big.
- **Gallery Orb-Weaver** (Uncommon, own on 2-B; tag 4). Archetype **Spider Gallery**: Orb-Weaver 4, Glimmer Spider 4, Whip Spider 4, Giant Cave Huntsman 3, Stalactite Pill Bug 3, Cave Olm 2.
- The plan: Web, Poison, Sonar and Bleed spiders behind Shell guards. Shares 3/6.
- Theme: a cave spider among the shiny walls.

**14-A The Canopy.** Existing decks: Leafcutter / Woodpecker economy, Pangolin and Kinkajou big.
- **Cane Toad** (Uncommon, own on Map 7; tag -3). Archetype **Poison Frogs**: Cane Toad 4, Poison Dart Croaker 4, Camouflage Frog 4, Proboscis Monkey 4, Leafcutter Gardener 4.
- The plan: Greater Poison and Poison 2 frogs, with Taunt pulling attacks onto the toxic bodies. Shares 3/6.
- Theme: the cane toad is a rainforest toad. The map's line names its frogs.

**18-A The Pale Desert.** Existing decks: economy, open, big and poison.
- **Spitting Cobra** (Rare, own on Map 14; tag -3). Archetype **Spit from Cover**: Spitting Cobra 3, Sandfish 4, Thorny Devil 4, Fennec Fox 3, Quicksand Queen 2, Antlion Pit 4.
- The plan: traps and Thorns walls in front, with Twin Shot and invisible Sandfish behind. A ranged plan, where the existing decks play bodies. Shares 3/6.
- Theme: a desert cobra.

**20-A Eye of the Volcano.** Existing decks: Ghoul / Skeleton / Stoker open, and flying.
- **Magma Rhino** (Common, own on Map 19; tag 4). Archetype **Burning Wall**: Magma Rhino 4, The Contradiction 1, Cave Warlord 4, Obsidian Scorpion 3, Pack Mule 4, Cinder Stoker 4.
- The plan: Immolation burns the units around it each round, behind regenerating walls, with the Warlord's 8-damage shot. Shares 3/6.

**20-B Volcano Lair.** Existing decks: swarm, open and fire.
- **Gorge Wyrm** (Common, own on Map 20; tag 4). Archetype **Quake on a Hard Board**: Gorge Wyrm 4, Granite Ox Golem 3, Ash Cloud Condor 3, Ash Moth 4, Pack Mule 4, Magma Salamander 2.
- The plan: Earthquake 3 on arrival hits only grounded units, and this board is built to take it (fliers and 11+ Health bodies). Shares 3/6.
- Theme: a wyrm in the dragon's lair.
- Note: the Lair's own The Caldera Wyrm needs 2 Stone and 1 Metal, and nothing on the list makes either.

**17-A The Ice Hollow.** Existing decks: evasion, cold-chip and swarm.
- **Yeti** (Common, own on Map 19; tag 4). Archetype **Ice-Cave Titans**: Yeti 4, Glacial Ape-King 3, Polar Bear 2, Greenland Shark 3, Talus Pika 4, Snow Ermine 4.
- The plan: Pika ramp into 3-4 Lumber titans. The Ape-King's quake clears small units and the Shark's Carrion heals on every death. Shares 2/6.
- Overlaps Map 17's plan in two cards (Ape-King, Polar Bear), since both lists hold the tundra's few big cards.
- Theme: a yeti in an ice cave.

**0-B The Old Bramble.** Existing decks: two PRO decks (big, open), no BPRO.
- **Quill-Thorn Boar** (Rare, own on Map 12; tag 1). Archetype **Quill Hedge**: Quill-Thorn Boar 3, Quillguard 3, Thorn Shrike 3, Hedgehog Herbalist 3, Lucky Hopper 4, Gatling Hog 3.
- The plan: Thorns 3 punishes attackers behind 17-22 Health walls, with Bleed and arrows from behind. Shares 2/6.
- **19 cards.** The list is 12 Rares and one Uncommon, so under the copy caps (Rare 3, Uncommon 4) six different cards make at most 19. Carrying a Common or an Uncommon here would also help the deck step.

**19-A Basalt Foundry.** Existing decks: fire, swarm and big.
- **Armory** (Rare, own on Map 15; tag -3). Archetype **Smithy**: Armory 3, Anvilwhisker Otter 4, Ore-Smelter Mole 4, Ember Revenant 2, Quill Volley 3, Cinder Gecko 4.
- The plan: the Otter forges a Blade each turn, and Weapon Master gives every equipped unit +1/+1 and every arrow +1. Shares 3/6.
- Theme: an armory in a foundry. The Anvilwhisker Otter, the list's forge, is in one existing deck (2 copies, 19-A-PRO-3) and no deck plays its blades on purpose.

## 3. The skirmish plan (for the later deck-optimisation step; not applied)

These rules are for the later deck-optimisation step:
- **Three strategies per map.** The proposed archetype(s) come first. The rest are the map's existing BPRO decks by rank, then its PRO decks, each with a different focus. Maps 0-10 (no new carried card) use their three best different BPRO focuses. On Maps 21-24 the third is the strongest BPRO the deck step builds.
- **Which fights.** Only the map's non-boss fights in road order are used. The boss, mini-boss, world boss and dungeon are left out, and so is the map's last fight when its target sits in the boss band (Map 0's 0-4, Map 1's 1-5). When more than three remain, the first fight is left out too. Three spread slots are taken (the earliest, the middle, the last before the boss). The strongest existing strategy (BPRO-1's) takes the latest, hardest slot, and the new archetypes the earlier ones.
- **"Slightly down-tuned peak".**
  1. The peak is the archetype's best deck from the map's list (with the carried card), found by the deck step's focus search (`tools/bench/bench.js deck --focus ...` or deckopt's distinct optima) under the map's field.
  2. Down-tuned means stepping down deckopt's difficulty ladder from that peak. The ladder keeps at least 10 copies of the peak and the archetype's signature cards.
  3. It stops at the first rung where the Map reference (with its leader, at `referencePlayerLevel`, 40 games) wins **inside that fight's green band (road target +/- 8)**.
  4. A guard keeps it close to the peak: the down-tuned deck must still score 35-50% head to head against the map's BPRO-1. That keeps it about one tier under the BPRO, never above it. If the band can't be reached without breaking the core, the archetype moves to a later (harder) slot.
- **The rest: a random, weaker blend.** Every other skirmish and elite deals a seeded random deck from the map's list (no Baby cards, the KK1 / KK10 weak-deck rules, like the N-WK decks), tuned to its road target as today. The N-SK / N-WK fights are unchanged.

| Map | The 3 fights (kind, road target): strategy | The rest (random, weaker blend) |
|---|---|---|
| 0 Bramblewood Outskirts | 0-1 (skirmish, 90%): a third focus from the next bench / deckopt run (the map has 2 distinct BPRO / PRO focus)<br>0-2 (skirmish, 75%): 0-BPRO-2 open (Ant Scout)<br>0-3 (skirmish, 60%): 0-BPRO-1 family:flying (Ant Scout) | - |
| 1 Thistlewood | 1-2 (skirmish, 80%): a third focus from the next bench / deckopt run (the map has 2 distinct BPRO / PRO focus)<br>1-3 (skirmish, 70%): 1-BPRO-2 swarm (Ant Scout)<br>1-4 (skirmish, 60%): 1-BPRO-1 open (Chipmunk Cavalry) | 1-1 |
| 2 Pebble Beach | 2-2 (skirmish, 80%): 2-BPRO-3 swarm (Conch Herald)<br>2-3 (skirmish, 70%): 2-BPRO-2 open (Conch Herald)<br>2-4 (skirmish, 60%): 2-BPRO-1 economy (Conch Herald) | 2-1 |
| 3 Gannet Cliffs | 3-2 (skirmish, 84%): 3-BPRO-3 swarm (Peregrine Stooper)<br>3-4 (skirmish, 72%): 3-BPRO-2 open (Conch Herald)<br>3-6 (elite, 60%): 3-BPRO-1 big (Conch Herald) | 3-1, 3-3, 3-5 |
| 4 Sunken Hollow | 4-2 (skirmish, 80%): 4-BPRO-3 swarm (The Drowned Matriarch)<br>4-3 (elite, 70%): 4-BPRO-2 big (The Drowned Matriarch)<br>4-4 (elite, 60%): 4-BPRO-1 open (The Drowned Matriarch) | 4-1 |
| 5 Gatorback Swamp | 5-2 (skirmish, 84%): 5-BPRO-3 open (Alligator Gar)<br>5-4 (skirmish, 72%): 5-BPRO-2 economy (Fire Ant Raft)<br>5-6 (elite, 60%): 5-BPRO-1 swarm (Bog Leech) | 5-1, 5-3, 5-5 |
| 6 Sable Swampmire | 6-2 (skirmish, 85%): 6-BPRO-3 open (Alligator Gar)<br>6-4 (skirmish, 75%): 6-BPRO-2 family:poison (Adder Ambusher)<br>6-7 (elite, 60%): 6-BPRO-1 swarm (Adder Ambusher) | 6-1, 6-3, 6-5, 6-6 |
| 2-A Lilypad Reach | 2-A-2 (skirmish, 84%): Dam Fortress (+Newt Doctor)<br>2-A-4 (skirmish, 72%): 2-A-BPRO-2 open (Grey Seal Bull)<br>2-A-6 (elite, 60%): 2-A-BPRO-1 swarm (Grey Seal Bull) | 2-A-1, 2-A-3, 2-A-5 |
| 7 The Morel Hollow | 7-2 (skirmish, 82.5%): 7-BPRO-3 open (Wolf Spider Mother)<br>7-3 (skirmish, 75%): 7-BPRO-2 big (Wolf Spider Mother)<br>7-5 (elite, 60%): 7-BPRO-1 economy (Wolf Spider Mother) | 7-1, 7-4 |
| 2-B Smugglers' Grotto | 2-B-1 (skirmish, 90%): Shell Bunker (+The Old Shell)<br>2-B-2 (elite, 75%): 2-B-BPRO-2 big (Gallery Orb-Weaver)<br>2-B-3 (elite, 60%): 2-B-BPRO-1 economy (Gallery Orb-Weaver) | - |
| 8 Caves & Alcoves | 8-2 (skirmish, 85%): 8-BPRO-3 open (Grotto Lobster)<br>8-4 (skirmish, 75%): 8-BPRO-2 family:flying (Grotto Lobster)<br>8-7 (elite, 60%): 8-BPRO-1 big (Giant Cave Huntsman) | 8-1, 8-3, 8-5, 8-6 |
| 7-A The Mycelium Deep | 7-A-2 (skirmish, 80%): Rot and Burst (+Bogfire Newt)<br>7-A-3 (elite, 70%): 7-A-BPRO-2 economy (Wolf Spider Mother)<br>7-A-4 (elite, 60%): 7-A-BPRO-1 big (Bombardier Beetle) | 7-A-1 |
| 9 The Kelp Mangroves | 9-2 (skirmish, 84%): 9-BPRO-3 family:tide (Mangrove Manatee)<br>9-4 (skirmish, 72%): 9-BPRO-2 open (Mangrove Manatee)<br>9-6 (elite, 60%): 9-BPRO-1 big (Mangrove Manatee) | 9-1, 9-3, 9-5 |
| 10 Coral Current | 10-2 (skirmish, 85.7%): 10-BPRO-3 family:tide (Mangrove Manatee)<br>10-5 (skirmish, 72.9%): 10-BPRO-2 swarm (Great Barracuda)<br>10-8 (elite, 60%): 10-BPRO-1 open (Supernova Jelly) | 10-1, 10-3, 10-4, 10-6, 10-7 |
| 11 Eyrie Heights | 11-2 (skirmish, 86.3%): Stoop and Pounce (+The Gannet Queen)<br>11-5 (elite, 75%): 11-BPRO-2 swarm (Ibex Rockcaller)<br>11-9 (elite, 60%): 11-BPRO-1 open (Wound Reaver) | 11-1, 11-3, 11-4, 11-6, 11-7, 11-8 |
| 10-A The Sunken Depths | 10-A-2 (skirmish, 80%): Shock and Nova (+Supernova Jelly)<br>10-A-3 (skirmish, 70%): 10-A-BPRO-2 family:tide (Reef Admiral)<br>10-A-4 (elite, 60%): 10-A-BPRO-1 open (Nautilus Drifter) | 10-A-1 |
| 12 The Briar Maze | 12-2 (skirmish, 84%): Hedge Fortress (+Hawthorn Shieldbug)<br>12-4 (skirmish, 72%): 12-BPRO-2 big (Quillguard)<br>12-6 (elite, 60%): 12-BPRO-1 open (Quillguard) | 12-1, 12-3, 12-5 |
| 1-A Clovermead | 1-A-2 (skirmish, 80%): Clover Hive (+Bee Sentry)<br>1-A-3 (skirmish, 70%): 1-A-BPRO-2 open (Bee Forager)<br>1-A-4 (skirmish, 60%): 1-A-BPRO-1 swarm (Ant Scout) | 1-A-1 |
| 13 The Redwood Deep | 13-2 (skirmish, 85%): Old-Growth Giants (+Badger Lumberjack)<br>13-4 (skirmish, 75%): 13-BPRO-2 open (Sergeant Bramblefox)<br>13-7 (elite, 60%): 13-BPRO-1 big (Sergeant Bramblefox) | 13-1, 13-3, 13-5, 13-6 |
| 5-A The Sunken Grove | 5-A-1 (skirmish, 90%): Regrowth Wall (+Mangrove Manatee)<br>5-A-2 (skirmish, 75%): 5-A-BPRO-2 swarm (Old Snapjaw)<br>5-A-3 (skirmish, 60%): 5-A-BPRO-1 open (Hedgehog Herbalist) | - |
| 14 Savanna Reaches | 14-2 (skirmish, 85%): Mound and Herd (+Ant Hill)<br>14-4 (skirmish, 75%): Sun Strike (+Golden Eagle Diver)<br>14-7 (elite, 60%): 14-BPRO-1 swarm (Pride Queen) | 14-1, 14-3, 14-5, 14-6 |
| 15 The Long Grass | 15-2 (skirmish, 84%): Farmstead Cavalry (+Truffle Piglet)<br>15-4 (skirmish, 72%): 15-BPRO-2 economy (Hedgehog Herbalist)<br>15-6 (elite, 60%): 15-BPRO-1 open (Talon Archer) | 15-1, 15-3, 15-5 |
| 11-A The Aerie Vault | 11-A-1 (skirmish, 90%): Fletcher's Roost (+Talon Archer)<br>11-A-2 (skirmish, 75%): 11-A-BPRO-2 family:flying (Wound Reaver)<br>11-A-3 (skirmish, 60%): 11-A-BPRO-1 open (Ibex Rockcaller) | - |
| 16 The Pinewood Taiga | 16-2 (skirmish, 84%): Moonlit Pack (+Owl Nightwatch)<br>16-4 (skirmish, 72%): 16-BPRO-2 open (Wolf Pack Runner)<br>16-6 (elite, 60%): 16-BPRO-1 big (Taiga Lynx) | 16-1, 16-3, 16-5 |
| 8-A The Glimmer Depths | 8-A-1 (skirmish, 90%): Spider Gallery (+Gallery Orb-Weaver)<br>8-A-2 (skirmish, 75%): 8-A-BPRO-2 big (Giant Cave Huntsman)<br>8-A-3 (skirmish, 60%): 8-A-BPRO-1 open (Echo Matriarch) | - |
| 17 Wolfsbane Tundra | 17-2 (skirmish, 85%): Avalanche and Quake (+Ibex Rockcaller)<br>17-4 (skirmish, 75%): 17-BPRO-2 swarm (Ravenous Wolverine)<br>17-7 (elite, 60%): 17-BPRO-1 family:evasion (Walrus Icebreaker) | 17-1, 17-3, 17-5, 17-6 |
| 18 The Glass Dunes | 18-2 (skirmish, 84%): Haste Blitz (+Savanna Cheetah)<br>18-4 (skirmish, 72%): 18-BPRO-2 economy (Dune Packrat)<br>18-6 (elite, 60%): 18-BPRO-1 open (Dune Packrat) | 18-1, 18-3, 18-5 |
| 14-A The Canopy | 14-A-2 (skirmish, 80%): Poison Frogs (+Cane Toad)<br>14-A-3 (skirmish, 70%): 14-A-BPRO-2 open (Pangolin Roller)<br>14-A-4 (elite, 60%): 14-A-BPRO-1 economy (Pangolin Roller) | 14-A-1 |
| 19 Ashen Spurn | 19-2 (skirmish, 82.5%): Fire and Ice Front (+Walrus Icebreaker)<br>19-3 (elite, 75%): 19-BPRO-2 economy (Pit Glutton)<br>19-5 (elite, 60%): 19-BPRO-1 open (Hercules Beetle) | 19-1, 19-4 |
| 18-A The Pale Desert | 18-A-2 (skirmish, 85.7%): Spit from Cover (+Spitting Cobra)<br>18-A-5 (skirmish, 72.9%): 18-A-BPRO-2 open (Dust-devil Kestrel)<br>18-A-8 (elite, 60%): 18-A-BPRO-1 economy (Quicksand Queen) | 18-A-1, 18-A-3, 18-A-4, 18-A-6, 18-A-7 |
| 20 The Sundered Peak | 20-2 (skirmish, 85.7%): Firing Line (+Fire Salamander)<br>20-5 (elite, 72.9%): 20-BPRO-2 economy (Magma Salamander)<br>20-8 (elite, 60%): 20-BPRO-1 open (Ossuary Lammergeier) | 20-1, 20-3, 20-4, 20-6, 20-7 |
| 20-A Eye of the Volcano | 20-A-2 (elite, 81.3%): Burning Wall (+Magma Rhino)<br>20-A-5 (elite, 68%): 20-A-BPRO-2 family:flying (Ossuary Lammergeier)<br>20-A-7 (elite, 55.4%): 20-A-BPRO-1 open (Woodland Brawler) | 20-A-1, 20-A-3, 20-A-6 |
| 20-B Volcano Lair | 20-B-1 (skirmish, 85%): Quake on a Hard Board (+Gorge Wyrm)<br>20-B-2 (skirmish, 72.5%): 20-B-BPRO-2 open (Magma Salamander)<br>20-B-3 (skirmish, 60%): 20-B-BPRO-1 swarm (Tide Seahorse) | - |
| 21 The Quiet Summit | 21-2 (skirmish, 82.5%): Expose Volley (+Eagle-Owl Quartermaster)<br>21-3 (skirmish, 75%): Vigil and Relics (+Vigil Owl)<br>21-5 (elite, 60%): the strongest BPRO the deck step builds (no PRO / BPRO decks past Map 20 yet) | 21-1, 21-4 |
| 17-A The Ice Hollow | 17-A-1 (skirmish, 90%): Ice-Cave Titans (+Yeti)<br>17-A-2 (skirmish, 75%): 17-A-BPRO-2 open (Walrus Icebreaker)<br>17-A-3 (skirmish, 60%): 17-A-BPRO-1 family:evasion (Wolfsbane Alpha) | - |
| 0-B The Old Bramble | 0-B-1 (skirmish, 90%): Quill Hedge (+Quill-Thorn Boar)<br>0-B-2 (skirmish, 75%): 0-B-PRO-2 open (Grave-Grin Hyena)<br>0-B-3 (skirmish, 60%): 0-B-PRO-1 big (Ashbone Ghoul) | - |
| 22 The Rimefire Caldera | 22-2 (skirmish, 85%): Deep Cold (+Glacier Yak)<br>22-4 (skirmish, 75%): Ash-Stun Tempo (+Ash Cloud Condor)<br>22-7 (elite, 60%): the strongest BPRO the deck step builds (no PRO / BPRO decks past Map 20 yet) | 22-1, 22-3, 22-5, 22-6 |
| 23 The Goldfeather Siege | 23-2 (skirmish, 85%): Arrow Storm (+Eagle-Owl Quartermaster)<br>23-4 (skirmish, 75%): Gilded Heavies (+Gilded Roadwarden)<br>23-7 (elite, 60%): the strongest BPRO the deck step builds (no PRO / BPRO decks past Map 20 yet) | 23-1, 23-3, 23-5, 23-6 |
| 19-A Basalt Foundry | 19-A-2 (skirmish, 86.3%): Smithy (+Armory)<br>19-A-5 (skirmish, 75%): 19-A-BPRO-2 swarm (Tide Seahorse)<br>19-A-9 (elite, 60%): 19-A-BPRO-1 big (Magma Salamander) | 19-A-1, 19-A-3, 19-A-4, 19-A-6, 19-A-7, 19-A-8 |
| 24 Goldfeather Keep | 24-2 (skirmish, 85%): Iron Vault (+Ore-Smelter Mole)<br>24-4 (skirmish, 75%): Counting House (+Golden Magpie)<br>24-7 (elite, 60%): the strongest BPRO the deck step builds (no PRO / BPRO decks past Map 20 yet) | 24-1, 24-3, 24-5, 24-6 |

The same rows with each fight list: `skirmish-plan-2026-11-03.json`.

## 4. The 21+ maps' "own -1", and open points

- **Own -1 on Maps 21-24** (your pick; THEME5 changes no list). The cards no proposed plan uses are the natural ones to drop.
  - 21 Quiet Summit: Whirlwind Swift or Pika Hoarder (Pika Hoarder is in BAL14's re-fit list). Keep Glacier Yak (22's candidate) and Golden Magpie (24's).
  - 22 Rimefire Caldera (-2, since it already lists 12): Badger Berserker (your THEME4 "Unlikely" flag) and Ash Imp (nothing on the list is a Dark Summon card, so its Sacrifice has no use there).
  - 24 Goldfeather Keep: Duckling Squadron or Nest.
  - 23 Goldfeather Siege already fits (10 own).
- **Own overages already there** (THEME4 picks, untouched): Maps 0, 1, 7, 13, 17, 18 and the side maps 2-B, 8-A, 19-A and the Volcano Lair (its 5 by its own rule). Say if the new rule should trim these too.
- **Repeats across maps** (each plan is still distinct on its own map): Eagle-Owl Quartermaster is proposed on 21 and 23 (Expose crits there, siege arrows here). The tundra plans of 17 and 17-A share the Ape-King and the Polar Bear. Golden Eagle Diver is the Savanna's candidate and also sits in plans on 11 and 21.
- **Copy caps limit side maps made of Rares** (the Old Bramble: 19-card plans). Carrying Commons or Uncommons there helps.

## Balancing status (2026-11-03 summary, with leaders; nothing re-measured by THEME5)
- Road: 226 fights. **81 in the green band**, 100 within 10 points, **65 beyond 20**.
- Worst maps (Map reference vs its road target): 14-A The Canopy -35, 0-B The Old Bramble -30, 1 Thistlewood +29, 8-A The Glimmer Depths +26, 6 Sable Swampmire +22, 9 The Kelp Mangroves -20.
- 28 maps are OVER the 15% cap of the Map reference against BPRO-1.
- Open balance decisions: BAL14-1 to BAL14-4, BAL13-1 to BAL13-4.
- Next: your THEME5-1 pick, then the lists, then the deck-optimisation step (section 3).
