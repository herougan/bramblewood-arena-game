# Card flags for the fights more than 20 points off, 2026-11-02

Package BAL13 (owner 2026-11-02 20:19: "The only thing that should change is the card. But we shouldn't choose new cards."). **Flags only**: no card or deck was changed. The owner changes cards.

Tool: `node tools/bal13/card_flags_2026_11_02.js --road summary-2026-11-03-led --games 40`. The fights: the road measure `docs/balance/skirmish-pass-summary-2026-11-03-led.jsonl` (the Map reference, 40 games a fight). Each card of the fight, on both sides, one 3A + H step (1 Attack, or 3 Health on a 1-Attack card) in the direction that closes the gap, 40 games on the tune seeds (7300 + 37g); the driver (the card whose step moves the fight most) then at 2 and 3 steps; the suggestion is the smallest that lands in the green band (target +/- 8). Stat lines are the card as printed (the fight plays the levelled copy with the same step). A player-deck card is in the Map reference's deck: changing it moves every fight that deck plays. **With leaders** (owner 21:37): the enemy keeps its own; your seat plays the leader a player holds at the map (tools/bal13/lib_leader_2026_11_02.js; column "Your leader").

| Fight | Your leader | Win / target | Enemy driver | Suggested line (enemy) | Reaches | Player-deck driver | Suggested line (player) | Reaches |
|---|---|---|---|---|---|---|---|---|
| 0-B-1 Thorn Path (0 mo The Old Bramble, too hard) | Old Snapjaw | 67.5 / 90 | Forager Ant (one step: 75 -> 95) | 1/6 -> 1/3 (1 step) | 95 | Otter Centurion (one step: 75 -> 87.5) | 3/5 -> 4/5 (1 step) | 87.5 |
| 0-B-2 The Briar Ring (0 mo The Old Bramble, too hard) | Old Snapjaw | 20 / 75 | Ant Scout (one step: 25 -> 45) | 1/5 -> 1/1 (3 steps) | 47.5 (not enough alone) | Otter Centurion (one step: 25 -> 42.5) | 3/5 -> 6/5 (3 steps) | 60 (not enough alone) |
| 0-B-4 The Old Bramble (0 mo The Old Bramble, too hard) | Old Snapjaw | 15 / 40 | Ent (one step: 12.5 -> 32.5) | 2/22 -> 1/22 (1 step) | 32.5 | Otter Centurion (one step: 12.5 -> 37.5) | 3/5 -> 4/5 (1 step) | 37.5 |
| 1-3 Burrow Line (1 Thistlewood, too easy) | Wandering Traveller | 95 / 70 | Field Mouse (one step: 97.5 -> 90) | 2/7 -> 5/7 (3 steps) | 45 (overshoots: a smaller change, e.g. Health only) | Bee Forager (one step: 97.5 -> 85) | 0/5 -> 0/1 (3 steps) | 92.5 (not enough alone) |
| 1-4 Sapper Hedge (1 Thistlewood, too easy) | Wandering Traveller | 95 / 60 | Dormouse (one step: 97.5 -> 82.5) | 2/7 -> 5/7 (3 steps) | 35 (overshoots: a smaller change, e.g. Health only) | Bee Forager (one step: 97.5 -> 80) | 0/5 -> 0/1 (3 steps) | 95 (not enough alone) |
| 1-5 The Thistle Baron (1 Thistlewood, too easy) | Wandering Traveller | 100 / 40 | Hedgerow Shrew (one step: 97.5 -> 72.5) | 2/4 -> 4/4 (2 steps) | 42.5 | Bee Forager (one step: 97.5 -> 90) | 0/5 -> 0/1 (3 steps) | 87.5 (not enough alone) |
| 1-A-1 Clover Patch (1 mq Clovermead, too hard) | The Gannet Queen | 55 / 90 | Field Vole (one step: 57.5 -> 80) | 1/6 -> 1/1 (2 steps) | 92.5 | Eagle-Owl Quartermaster (one step: 57.5 -> 77.5) | 1/6 -> 4/6 (3 steps) | 80 (not enough alone) |
| 1-A-4 Harvest Mice (1 mq Clovermead, too hard) | The Gannet Queen | 37.5 / 60 | Field Mouse (one step: 40 -> 60) | 2/7 -> 1/7 (1 step) | 60 | Eagle-Owl Quartermaster (one step: 40 -> 65) | 1/6 -> 2/6 (1 step) | 65 |
| 2-4 Pelican Point (2 Pebble Beach, too easy) | The Old Shell | 95 / 60 | Tide Pool Crab (one step: 80 -> 72.5) | 1/2 -> 3/2 (2 steps) | 62.5 | Bee Forager (one step: 80 -> 70) | 0/5 -> 0/1 (2 steps) | 67.5 |
| 2-5 The Old Shell (2 Pebble Beach, too easy) | The Old Shell | 62.5 / 40 | Tidepool Trapper Crab (one step: 50 -> 37.5) | 1/7 -> 2/7 (1 step) | 37.5 | Tunnel Ant (one step: 50 -> 42.5) | 2/9 -> 1/9 (1 step) | 42.5 |
| 2-A-1 Lily Hop (2 mp Lilypad Reach, too hard) | The Old Shell | 67.5 / 90 | Tidepool Trapper Crab (one step: 62.5 -> 85) | 1/7 -> 1/4 (1 step) | 85 | Cricket Drummer (one step: 62.5 -> 75) | 2/7 -> 4/7 (2 steps) | 85 |
| 2-A-3 Beaver Dam (2 mp Lilypad Reach, too easy) | The Old Shell | 100 / 78 | Tidepool Trapper Crab (one step: 95 -> 35) | 1/7 -> 4/7 (3 steps) | 2.5 (overshoots: a smaller change, e.g. Health only) | Otter Guard (one step: 95 -> 90) | 3/5 -> 1/2 (3 steps) | 97.5 (not enough alone) |
| 2-A-5 Croaker Chorus (2 mp Lilypad Reach, too hard) | The Old Shell | 15 / 66 | Poison Dart Croaker (one step: 15 -> 22.5) | 3/3 -> 1/1 (3 steps) | 35 (not enough alone) | Cricket Drummer (one step: 15 -> 32.5) | 2/7 -> 4/7 (2 steps) | 72.5 |
| 2-A-6 The Lodge (2 mp Lilypad Reach, too hard) | The Old Shell | 15 / 60 | Lodge Engineer (one step: 22.5 -> 42.5) | 3/12 -> 1/12 (2 steps) | 65 | Cricket Drummer (one step: 22.5 -> 37.5) | 2/7 -> 4/7 (2 steps) | 55 |
| 2-B-4 The Grotto Keeper (2 mg Smugglers' Grotto, too easy) | The Old Shell | 75 / 40 | Pelican Diver (one step: 82.5 -> 57.5) | 2/8 -> 4/8 (2 steps) | 40 | Greyplume Fledgling (one step: 82.5 -> 70) | 1/4 -> 1/1 (3 steps) | 70 (not enough alone) |
| 3-5 Eagle Stoop (3 Gannet Cliffs, too easy) | The Gannet Queen | 90 / 66 | Kittiwake Flock (one step: 85 -> 60) | 1/3 -> 2/3 (1 step) | 60 | Cricket Drummer (one step: 85 -> 77.5) | 2/7 -> 1/1 (3 steps) | 75 (not enough alone) |
| 4-5 The Drowned Colossus (4 Sunken Hollow, too easy) | The Drowned Matriarch | 72.5 / 40 | Pyrenean Desman (one step: 60 -> 42.5) | 2/10 -> 3/10 (1 step) | 42.5 | Tunnel Ant (one step: 60 -> 47.5) | 2/9 -> 1/9 (1 step) | 47.5 |
| 5-4 Snapping Reeds (5 Gatorback Swamp, too easy) | Old Snapjaw | 97.5 / 72 | Grass Viper (one step: 97.5 -> 80) | 1/8 -> 2/8 (1 step) | 80 | Rabbit Kit (one step: 97.5 -> 92.5) | 2/2 -> 1/1 (3 steps) | 90 (not enough alone) |
| 5-5 Gator Slide (5 Gatorback Swamp, too easy) | Old Snapjaw | 95 / 66 | Snapper Hatchling (one step: 95 -> 55) | 1/7 -> 4/7 (3 steps) | 2.5 (overshoots: a smaller change, e.g. Health only) | Otter Centurion (one step: 95 -> 90) | 3/5 -> 1/2 (3 steps) | 90 (not enough alone) |
| 5-7 Old Snapjaw (5 Gatorback Swamp, too easy) | Old Snapjaw | 65 / 40 | Grass Viper (one step: 65 -> 37.5) | 1/8 -> 2/8 (1 step) | 37.5 | Otter Guard (one step: 65 -> 42.5) | 3/5 -> 2/5 (1 step) | 42.5 |
| 5-A-1 Rotting Roots (5 ms The Sunken Grove, too hard) | Old Snapjaw | 52.5 / 90 | Caiman Hatchling (one step: 50 -> 90) | 2/4 -> 1/4 (1 step) | 90 | Adder Ambusher (one step: 50 -> 72.5) | 2/11 -> 5/11 (3 steps) | 77.5 (not enough alone) |
| 6-4 Root Snare (6 Sable Swampmire, too easy) | The Heron Hag | 100 / 75 | Constrictor Coil (one step: 100 -> 97.5) | 4/16 -> 7/16 (3 steps) | 90 (not enough alone) | Cricket Drummer (one step: 100 -> 100) | 2/7 -> 1/1 (3 steps) | 100 (not enough alone) |
| 6-5 Venomlord's Coil (6 Sable Swampmire, too easy) | The Heron Hag | 97.5 / 70 | Newt Doctor (one step: 90 -> 77.5) | 4/3 -> 5/3 (1 step) | 77.5 | Cricket Drummer (one step: 90 -> 82.5) | 2/7 -> 1/1 (3 steps) | 77.5 |
| 6-6 Crocodile Run (6 Sable Swampmire, too easy) | The Heron Hag | 97.5 / 65 | Bogfire Newt (one step: 97.5 -> 72.5) | 1/10 -> 2/10 (1 step) | 72.5 | Cricket Drummer (one step: 97.5 -> 80) | 2/7 -> 1/1 (3 steps) | 77.5 (not enough alone) |
| 6-7 Adder Gauntlet (6 Sable Swampmire, too easy) | The Heron Hag | 82.5 / 60 | Adder Ambusher (one step: 87.5 -> 70) | 2/11 -> 5/11 (3 steps) | 75 (not enough alone) | Meadow Frog (one step: 87.5 -> 80) | 2/5 -> 1/1 (3 steps) | 80 (not enough alone) |
| 6-8 The Alligator King (6 Sable Swampmire, too easy) | The Heron Hag | 75 / 40 | Adder Ambusher (one step: 65 -> 32.5) | 2/11 -> 3/11 (1 step) | 32.5 | Cricket Drummer (one step: 65 -> 35) | 2/7 -> 1/7 (1 step) | 35 |
| 7-A-1 Root Cellar (7 mz The Mycelium Deep, too hard) | Old Snapjaw | 67.5 / 90 | Bombardier Beetle (one step: 67.5 -> 90) | 3/10 -> 2/10 (1 step) | 90 | Tunnel Ant (one step: 67.5 -> 77.5) | 2/9 -> 5/9 (3 steps) | 80 (not enough alone) |
| 7-A-4 The Rot Heart (7 mz The Mycelium Deep, too easy) | Old Snapjaw | 85 / 60 | Sleepless Shrew (one step: 87.5 -> 37.5) | 2/7 -> 5/7 (3 steps) | 5 (overshoots: a smaller change, e.g. Health only) | Tunnel Ant (one step: 87.5 -> 85) | 2/9 -> 1/3 (3 steps) | 70 (not enough alone) |
| 7-A-5 The Mycelium Mind (7 mz The Mycelium Deep, too easy) | Old Snapjaw | 90 / 40 | Planarian Splitter (one step: 87.5 -> 65) | 3/8 -> 6/8 (3 steps) | 47.5 | Otter Centurion (one step: 87.5 -> 82.5) | 3/5 -> 1/2 (3 steps) | 67.5 (not enough alone) |
| 8-4 Echo Chamber (8 Caves & Alcoves, too easy) | Echo Matriarch | 100 / 75 | Whip Spider (one step: 100 -> 90) | 3/7 -> 6/7 (3 steps) | 75 | Otter Centurion (one step: 100 -> 100) | 3/5 -> 1/2 (3 steps) | 97.5 (not enough alone) |
| 8-6 Glowworm Deep (8 Caves & Alcoves, too easy) | Echo Matriarch | 92.5 / 65 | Gallery Orb-Weaver (one step: 90 -> 77.5) | 4/7 -> 6/7 (2 steps) | 70 | Otter Centurion (one step: 90 -> 85) | 3/5 -> 1/2 (3 steps) | 72.5 |
| 8-7 The Roost Above (8 Caves & Alcoves, too easy) | Echo Matriarch | 82.5 / 60 | Blind Cave Fish (one step: 80 -> 50) | 1/1 -> 4/1 (3 steps) | 25 (overshoots: a smaller change, e.g. Health only) | Soldier Ant (one step: 80 -> 72.5) | 2/5 -> 1/2 (2 steps) | 67.5 |
| 8-A-2 The Echo Pool (8 mn The Glimmer Depths, too easy) | Echo Matriarch | 100 / 75 | Echo Screecher (one step: 100 -> 92.5) | 2/5 -> 5/5 (3 steps) | 80 | Otter Centurion (one step: 100 -> 97.5) | 3/5 -> 1/2 (3 steps) | 100 (not enough alone) |
| 8-A-3 Shard Gallery (8 mn The Glimmer Depths, too easy) | Echo Matriarch | 97.5 / 50 | Sulfur Cinder Moth (one step: 87.5 -> 55) | 1/7 -> 2/7 (1 step) | 55 | Otter Centurion (one step: 87.5 -> 80) | 3/5 -> 1/2 (3 steps) | 80 (not enough alone) |
| 9-5 Moray Den (9 The Kelp Mangroves, too hard) | Old Snapjaw | 32.5 / 66 | Mangrove Monitor (one step: 27.5 -> 35) | 3/12 -> 1/9 (3 steps) | 32.5 (not enough alone) | Tunnel Ant (one step: 27.5 -> 45) | 2/9 -> 5/9 (3 steps) | 50 (not enough alone) |
| 9-6 Drifting Shell (9 The Kelp Mangroves, too hard) | Old Snapjaw | 17.5 / 60 | Mangrove Manatee (one step: 35 -> 42.5) | 7/7 -> 4/7 (3 steps) | 45 (not enough alone) | Otter Guard (one step: 35 -> 47.5) | 3/5 -> 6/5 (3 steps) | 45 (not enough alone) |
| 9-7 The Kelp Witch (9 The Kelp Mangroves, too hard) | Old Snapjaw | 5 / 40 | Proboscis Monkey (one step: 17.5 -> 35) | 2/11 -> 1/11 (1 step) | 35 | Otter Centurion (one step: 17.5 -> 30) | 3/5 -> 6/5 (3 steps) | 57.5 (overshoots: a smaller change, e.g. Health only) |
| 10-7 Eel Nest (10 Coral Current, too easy) | Reef Admiral | 97.5 / 64.3 | Swordfish Spearman (one step: 85 -> 75) | 3/14 -> 6/14 (3 steps) | 47.5 (overshoots: a smaller change, e.g. Health only) | Adder Ambusher (one step: 85 -> 82.5) | 2/11 -> 1/5 (3 steps) | 77.5 (not enough alone) |
| 10-9 The Orca Vanguard King (10 Coral Current, too easy) | Reef Admiral | 75 / 40 | Clownfish Scout (one step: 72.5 -> 55) | 1/9 -> 3/9 (2 steps) | 40 | Adder Ambusher (one step: 72.5 -> 60) | 2/11 -> 1/5 (3 steps) | 50 (not enough alone) |
| 10-A-4 The Undertow (10 mj The Sunken Depths, too hard) | Reef Admiral | 27.5 / 60 | Riptide Eel (one step: 15 -> 22.5) | 6/7 -> 3/7 (3 steps) | 30 (not enough alone) | Burrow Rabbit (one step: 15 -> 32.5) | 2/10 -> 5/10 (3 steps) | 45 (not enough alone) |
| 11-5 West Ledge (11 Eyrie Heights, too hard) | Old Snapjaw | 50 / 75 | Ibex Rockcaller (one step: 40 -> 47.5) | 3/12 -> 1/9 (3 steps) | 60 (not enough alone) | Crimson Recruit (one step: 40 -> 57.5) | 2/1 -> 5/1 (3 steps) | 87.5 (overshoots: a smaller change, e.g. Health only) |
| 11-8 Summit Approach (11 Eyrie Heights, too hard) | Old Snapjaw | 37.5 / 63.8 | Ibex Rockcaller (one step: 50 -> 62.5) | 3/12 -> 2/12 (1 step) | 62.5 | Muskrat Lodgekeeper (one step: 50 -> 67.5) | 1/7 -> 2/7 (1 step) | 67.5 |
| 12-2 Quill Path (12 The Briar Maze, too hard) | Old Snapjaw | 60 / 84 | Lyrebird Mimic (one step: 52.5 -> 67.5) | 4/7 -> 1/7 (3 steps) | 67.5 (not enough alone) | Eagle-Owl Quartermaster (one step: 52.5 -> 70) | 1/6 -> 4/6 (3 steps) | 77.5 |
| 13-5 Badger Setts (13 The Redwood Deep, too hard) | Old Snapjaw | 42.5 / 70 | Fox Kit (one step: 37.5 -> 60) | 2/9 -> 1/3 (3 steps) | 60 (not enough alone) | Alpine Marmot (one step: 37.5 -> 47.5) | 3/9 -> 6/9 (3 steps) | 52.5 (not enough alone) |
| 13-7 The King's Den (13 The Redwood Deep, too hard) | Old Snapjaw | 37.5 / 60 | Fox Kit (one step: 47.5 -> 72.5) | 2/9 -> 1/3 (3 steps) | 65 | Adder Ambusher (one step: 47.5 -> 60) | 2/11 -> 3/11 (1 step) | 60 |
| 14-A-1 Dart Frogs (14 my The Canopy, too hard) | Pride Queen | 2.5 / 90 | Pangolin Roller (one step: 0 -> 5) | 5/5 -> 2/5 (3 steps) | 10 (not enough alone) | Electric Ray (one step: 0 -> 5) | 3/8 -> 6/8 (3 steps) | 10 (not enough alone) |
| 14-A-3 Sloth Boughs (14 my The Canopy, too hard) | Pride Queen | 20 / 70 | Kinkajou Lurker (one step: 15 -> 25) | 4/6 -> 1/6 (3 steps) | 17.5 (not enough alone) | Otter Centurion (one step: 15 -> 52.5) | 3/5 -> 5/5 (2 steps) | 77.5 |
| 14-A-5 The Jaguar's Path (14 my The Canopy, too hard) | Pride Queen | 2.5 / 40 | Hoopoe Herald (one step: 7.5 -> 12.5) | 2/12 -> 1/6 (3 steps) | 17.5 (not enough alone) | Adder Ambusher (one step: 7.5 -> 27.5) | 2/11 -> 5/11 (3 steps) | 37.5 |
| 15-2 Squire Road (15 The Long Grass, too hard) | Old Snapjaw | 60 / 84 | Stoat Cutthroat (one step: 72.5 -> 82.5) | 3/10 -> 2/10 (1 step) | 82.5 | Otter Centurion (one step: 72.5 -> 77.5) | 3/5 -> 4/5 (1 step) | 77.5 |
| 15-3 Stoat Ambush (15 The Long Grass, too hard) | Old Snapjaw | 50 / 78 | Stoat Cutthroat (one step: 37.5 -> 55) | 3/10 -> 1/7 (3 steps) | 65 (not enough alone) | Fawn Scout (one step: 37.5 -> 60) | 2/8 -> 5/8 (3 steps) | 75 |
| 16-2 Pinecone Drop (16 The Pinewood Taiga, too hard) | Old Snapjaw | 60 / 84 | Snowshoe Hare (one step: 82.5 -> 90) | 1/7 -> 1/4 (1 step) | 90 | Otter Centurion (one step: 82.5 -> 95) | 3/5 -> 6/5 (3 steps) | 100 (overshoots: a smaller change, e.g. Health only) |
| 17-7 Alpha Howler's Den (17 Wolfsbane Tundra, too hard) | Wolfsbane Alpha | 10 / 60 | Walrus Icebreaker (one step: 15 -> 20) | 4/17 -> 1/17 (3 steps) | 42.5 (not enough alone) | Otter Centurion (one step: 15 -> 27.5) | 3/5 -> 6/5 (3 steps) | 45 (not enough alone) |
| 18-6 Komodo Wallow (18 The Glass Dunes, too easy) | Old Snapjaw | 92.5 / 60 | Sand Widow (one step: 80 -> 62.5) | 2/17 -> 3/17 (1 step) | 62.5 | Echo Screecher (one step: 80 -> 72.5) | 2/5 -> 1/2 (2 steps) | 57.5 |
| 18-7 The Sand Widow Queen (18 The Glass Dunes, too easy) | Old Snapjaw | 80 / 40 | Dromedary (one step: 72.5 -> 47.5) | 2/15 -> 3/15 (1 step) | 47.5 | Adder Ambusher (one step: 72.5 -> 55) | 2/11 -> 1/5 (3 steps) | 45 |
| 18-A-1 Bleached Flats (18 mpd The Pale Desert, too hard) | Old Snapjaw | 67.5 / 90 | Skull Vulture (one step: 65 -> 80) | 3/3 -> 1/1 (3 steps) | 70 (not enough alone) | Otter Centurion (one step: 65 -> 77.5) | 3/5 -> 6/5 (3 steps) | 85 |
| 18-A-2 Mirage Jackals (18 mpd The Pale Desert, too hard) | Old Snapjaw | 60 / 85.7 | Sand Widow (one step: 55 -> 62.5) | 2/17 -> 1/11 (3 steps) | 60 (not enough alone) | Talon Archer (one step: 55 -> 62.5) | 2/6 -> 5/6 (3 steps) | 67.5 (not enough alone) |
| 18-A-5 Vulture Road (18 mpd The Pale Desert, too hard) | Old Snapjaw | 47.5 / 72.9 | Dromedary (one step: 40 -> 52.5) | 2/15 -> 1/9 (3 steps) | 65 | Otter Centurion (one step: 40 -> 50) | 3/5 -> 6/5 (3 steps) | 67.5 |
| 19-4 Sky Marks (19 Ashen Spurn, too easy) | Yeti Chieftain | 92.5 / 67.5 | Magma Rhino (one step: 87.5 -> 85) | 2/17 -> 5/17 (3 steps) | 85 (not enough alone) | Ibex Rockcaller (one step: 87.5 -> 85) | 3/12 -> 1/9 (3 steps) | 75 |
| 19-5 Sky Scraper Sentinel (19 Ashen Spurn, too easy) | Yeti Chieftain | 87.5 / 60 | Cinder Stoker (one step: 82.5 -> 57.5) | 1/11 -> 2/11 (1 step) | 57.5 | Ibex Rockcaller (one step: 82.5 -> 72.5) | 3/12 -> 1/9 (3 steps) | 60 |
| 19-A-3 Slag Runners (19 m9 Basalt Foundry, too hard) | Yeti Chieftain | 50 / 72.5 | Cinder Stoker (one step: 75 -> 82.5) | 1/11 -> 1/2 (3 steps) | 92.5 (overshoots: a smaller change, e.g. Health only) | Alpine Marmot (one step: 75 -> 87.5) | 3/9 -> 6/9 (3 steps) | 90 (overshoots: a smaller change, e.g. Health only) |
| 19-A-9 The Pyroclast Wyrm (19 m9 Basalt Foundry, too hard) | Yeti Chieftain | 32.5 / 60 | Magma Salamander (one step: 35 -> 47.5) | 3/11 -> 1/11 (2 steps) | 57.5 | Obsidian Scorpion (one step: 35 -> 50) | 4/4 -> 7/4 (3 steps) | 55 |
| 20-10 The Cave Warlord (20 The Sundered Peak, too easy) | Old Snapjaw | 97.5 / 40 | Magma Salamander (one step: 95 -> 80) | 3/11 -> 6/11 (3 steps) | 55 (not enough alone) | Walrus Icebreaker (one step: 95 -> 90) | 4/17 -> 1/17 (3 steps) | 97.5 (not enough alone) |
| 20-4 Shrine Steps (20 The Sundered Peak, too easy) | Old Snapjaw | 90 / 67.1 | Magma Wraith (one step: 97.5 -> 92.5) | 1/8 -> 4/8 (3 steps) | 55 (overshoots: a smaller change, e.g. Health only) | Ibex Rockcaller (one step: 97.5 -> 95) | 3/12 -> 1/9 (3 steps) | 92.5 (not enough alone) |
| 20-9 The Ancient Sloth Titan (20 The Sundered Peak, too easy) | Old Snapjaw | 87.5 / 50 | Ashbone Ghoul (one step: 92.5 -> 85) | 1/5 -> 4/5 (3 steps) | 65 (not enough alone) | Obsidian Scorpion (one step: 92.5 -> 87.5) | 4/4 -> 1/4 (3 steps) | 82.5 (not enough alone) |
| 20-A-4 Heart of the Mountain (20 me Eye of the Volcano, too easy) | Old Snapjaw | 77.5 / 35.5 | Magma Wraith (one step: 75 -> 30) | 1/8 -> 2/8 (1 step) | 30 | Otter Centurion (one step: 75 -> 65) | 3/5 -> 1/2 (3 steps) | 27.5 |

## Cards that drive more than one of these fights

| Card | Side | Fights |
|---|---|---|
| Otter Centurion (otter-centurion) | player | 0-B-1 (hard), 0-B-2 (hard), 0-B-4 (hard), 5-5 (easy), 7-A-5 (easy), 8-4 (easy), 8-6 (easy), 8-A-2 (easy), 8-A-3 (easy), 9-7 (hard), 14-A-3 (hard), 15-2 (hard), 16-2 (hard), 17-7 (hard), 18-A-1 (hard), 18-A-5 (hard), 20-A-4 (easy) |
| Cricket Drummer (cricket-drummer) | player | 2-A-1 (hard), 2-A-5 (hard), 2-A-6 (hard), 3-5 (easy), 6-4 (easy), 6-5 (easy), 6-6 (easy), 6-8 (easy) |
| Adder Ambusher (adder-ambusher) | player | 5-A-1 (hard), 10-7 (easy), 10-9 (easy), 13-7 (hard), 14-A-5 (hard), 18-7 (easy) |
| Tunnel Ant (tunnel-ant) | player | 2-5 (easy), 4-5 (easy), 7-A-1 (hard), 7-A-4 (easy), 9-5 (hard) |
| Bee Forager (bee-forager) | player | 1-3 (easy), 1-4 (easy), 1-5 (easy), 2-4 (easy) |
| Eagle-Owl Quartermaster (eagle-owl-quartermaster) | player | 1-A-1 (hard), 1-A-4 (hard), 12-2 (hard) |
| Tidepool Trapper Crab (tidepool-trapper-crab) | enemy | 2-5 (easy), 2-A-1 (hard), 2-A-3 (easy) |
| Otter Guard (otter-guard) | player | 2-A-3 (easy), 5-7 (easy), 9-6 (hard) |
| Ibex Rockcaller (ibex-rockcaller) | player | 19-4 (easy), 19-5 (easy), 20-4 (easy) |
| Field Mouse (field-mouse) | enemy | 1-3 (easy), 1-A-4 (hard) |
| Grass Viper (grass-viper) | enemy | 5-4 (easy), 5-7 (easy) |
| Adder Ambusher (adder-ambusher) | enemy | 6-7 (easy), 6-8 (easy) |
| Ibex Rockcaller (ibex-rockcaller) | enemy | 11-5 (hard), 11-8 (hard) |
| Fox Kit (fox-kit) | enemy | 13-5 (hard), 13-7 (hard) |
| Alpine Marmot (alpine-marmot) | player | 13-5 (hard), 19-A-3 (hard) |
| Stoat Cutthroat (stoat-cutthroat) | enemy | 15-2 (hard), 15-3 (hard) |
| Sand Widow (sand-widow) | enemy | 18-6 (easy), 18-A-2 (hard) |
| Dromedary (dromedary) | enemy | 18-7 (easy), 18-A-5 (hard) |
| Cinder Stoker (cinder-stoker) | enemy | 19-5 (easy), 19-A-3 (hard) |
| Magma Salamander (magma-salamander) | enemy | 19-A-9 (hard), 20-10 (easy) |
| Obsidian Scorpion (obsidian-scorpion) | player | 19-A-9 (hard), 20-9 (easy) |
| Magma Wraith (magma-wraith) | enemy | 20-4 (easy), 20-A-4 (easy) |
