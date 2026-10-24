# The road after BAL3 (Maps 0-24 and the Pale Desert)

Package BAL3 (2026-10-24, owner 12:02 on BAL2-1..5: "use our agreed philosophy and schedule, not my balancing"). Win rate of the reference deck over 100 games a fight (`tools/skirmish_pass.js measure 100`, seeds 9100 + 37g) against each fight's road-curve target (green = target +/- 8; a boss 30-49%; a challenge skirmish its target minus 10, DF3-1). Before = the batch's main before BAL3 (`skirmish-pass-bal3-before-2026-10-24.jsonl`); after = with LEAD's Enemy levels dropped (BAL2-1), the side-map Rare rule (BAL2-2), the ten re-fit cards (BAL2-5), Rising Tide +1 Attack (DF3-3) and the deck retune (BAL2-3: `curve --all --decks-only --keep-leaders --pool --distinct`, two rounds, fixes in `bal3-curve-fixes-2026-10-24.jsonl` / `-fixes2-`). This file and `bal3-road-2026-10-24.json`: `node tools/bal3_2026_10_24.js report`. What is left: owner call BAL3-2.

| Map | Name | Fights | Green before | Green after | Too easy after | Too hard after | Mean win before | Mean win after | Mean target |
|---|---|---|---|---|---|---|---|---|---|
| 0 | Bramblewood Outskirts | 4 | 1 | 1 | 2 | 1 | 81% | 69% | 68% |
| 1 | Thistlewood | 5 | 1 | 4 | 1 | 0 | 86% | 72% | 68% |
| 2 | Pebble Beach | 5 | 0 | 3 | 1 | 1 | 47% | 65% | 68% |
| 3 | Gannet Cliffs | 7 | 0 | 1 | 6 | 0 | 96% | 95% | 70% |
| 4 | Sunken Hollow | 5 | 1 | 3 | 0 | 2 | 41% | 46% | 68% |
| 5 | Gatorback Swamp | 7 | 1 | 1 | 6 | 0 | 95% | 95% | 69% |
| 6 | Sable Swampmire | 8 | 2 | 2 | 6 | 0 | 87% | 83% | 71% |
| 7 | The Morel Hollow | 6 | 6 | 5 | 0 | 1 | 68% | 69% | 69% |
| 8 | Caves & Alcoves | 8 | 4 | 6 | 2 | 0 | 87% | 81% | 69% |
| 9 | The Kelp Mangroves | 7 | 2 | 3 | 4 | 0 | 90% | 83% | 69% |
| 10 | Coral Current | 9 | 2 | 4 | 4 | 1 | 74% | 80% | 71% |
| 11 | Eyrie Heights | 10 | 6 | 5 | 2 | 3 | 67% | 70% | 72% |
| 12 | The Briar Maze | 7 | 1 | 3 | 4 | 0 | 88% | 86% | 69% |
| 13 | The Redwood Deep | 8 | 1 | 2 | 6 | 0 | 94% | 92% | 69% |
| 14 | Savanna Reaches | 8 | 6 | 6 | 0 | 2 | 67% | 67% | 71% |
| 15 | The Long Grass | 7 | 0 | 1 | 6 | 0 | 93% | 85% | 70% |
| 16 | The Pinewood Taiga | 7 | 2 | 1 | 6 | 0 | 92% | 90% | 69% |
| 17 | Wolfsbane Tundra | 8 | 0 | 1 | 6 | 1 | 89% | 83% | 71% |
| 18 | The Glass Dunes | 7 | 0 | 0 | 7 | 0 | 100% | 100% | 69% |
| 19 | Ashen Spurn | 6 | 1 | 2 | 4 | 0 | 92% | 87% | 69% |
| 20 | The Sundered Peak | 10 | 3 | 6 | 4 | 0 | 85% | 82% | 68% |
| 21 | The Quiet Summit | 6 | 3 | 4 | 2 | 0 | 73% | 74% | 69% |
| 22 | The Rimefire Caldera | 8 | 2 | 6 | 2 | 0 | 76% | 74% | 69% |
| 23 | The Goldfeather Siege | 8 | 3 | 3 | 5 | 0 | 95% | 94% | 69% |
| 24 | Goldfeather Keep | 8 | 0 | 7 | 1 | 0 | 87% | 75% | 71% |
| PD | The Pale Desert | 9 | 0 | 4 | 5 | 0 | 97% | 87% | 70% |
| | **Maps 0-24** | 179 | **48** | **80** | 87 | 12 | | | |

| Fight | Kind | Target (band) | Before | After |
|---|---|---|---|---|
| 0-1 Pond Patrol | skirmish | 90 (82-98) | 88% | 88% |
| 0-2 Thicket Swarm | skirmish | 75 (67-83) | 97% (easy) | 86% (easy) |
| 0-3 Raccoon Heist | skirmish | 60 (52-68) | 88% (easy) | 50% (hard) |
| 0-4 Frost Vanguard | skirmish | 45 (30-49) | 52% (easy) | 52% (easy) |
| 1-1 Hedgerow Scouts | skirmish | 90 (82-98) | 94% | 94% |
| 1-2 Cricket Chorus | skirmish | 80 (72-88) | 92% (easy) | 85% |
| 1-3 Burrow Line | skirmish | 70 (62-78) | 92% (easy) | 66% |
| 1-4 Sapper Hedge | skirmish | 60 (52-68) | 86% (easy) | 63% |
| 1-5 The Thistle Baron | elite | 40 (30-49) | 64% (easy) | 51% (easy) |
| 2-1 Rock Pool Raiders | skirmish | 90 (82-98) | 66% (hard) | 81% (hard) |
| 2-2 Gull Gang | skirmish | 80 (72-88) | 58% (hard) | 79% |
| 2-3 Hermit Row | skirmish | 70 (62-78) | 41% (hard) | 81% (easy) |
| 2-4 Pelican Point | skirmish | 60 (52-68) | 47% (hard) | 54% |
| 2-5 The Old Shell | elite | 40 (30-49) | 25% (hard) | 30% |
| 3-1 Goat Ledge | skirmish | 90 (82-98) | 99% (easy) | 97% |
| 3-2 Hawk Watch | skirmish | 84 (76-92) | 99% (easy) | 96% (easy) |
| 3-3 Rockfall | skirmish | 78 (70-86) | 99% (easy) | 98% (easy) |
| 3-4 Condor Thermals | skirmish | 72 (64-80) | 87% (easy) | 85% (easy) |
| 3-5 Eagle Stoop | elite | 66 (58-74) | 98% (easy) | 95% (easy) |
| 3-6 Avalanche Pass | elite | 60 (52-68) | 96% (easy) | 95% (easy) |
| 3-7 The Gannet Queen | elite | 40 (30-49) | 97% (easy) | 97% (easy) |
| 4-1 Reef Skirmishers | skirmish | 90 (82-98) | 24% (hard) | 24% (hard) |
| 4-2 Tidal Ring | skirmish | 80 (72-88) | 20% (hard) | 27% (hard) |
| 4-3 Cetacean Pod | elite | 70 (62-78) | 64% | 66% |
| 4-4 The Kraken's Maw | elite | 60 (52-68) | 47% (hard) | 64% |
| 4-5 The Drowned Colossus | elite | 40 (30-49) | 50% (easy) | 47% |
| 5-1 Leech Pools | skirmish | 90 (82-98) | 100% (easy) | 100% (easy) |
| 5-2 Toad Hollow | skirmish | 84 (76-92) | 100% (easy) | 100% (easy) |
| 5-3 Cypress Roots | challenge | 68 (60-76) | 75% | 75% |
| 5-4 Snapping Reeds | skirmish | 72 (64-80) | 98% (easy) | 97% (easy) |
| 5-5 Gator Slide | elite | 66 (58-74) | 100% (easy) | 100% (easy) |
| 5-6 Behemoth Bog | elite | 60 (52-68) | 97% (easy) | 97% (easy) |
| 5-7 Old Snapjaw | boss | 40 (30-49) | 98% (easy) | 95% (easy) |
| 6-1 Leech Bog | skirmish | 90 (82-98) | 100% (easy) | 99% (easy) |
| 6-2 Mire Ambush | skirmish | 85 (77-93) | 100% (easy) | 97% (easy) |
| 6-3 Toad Chorus | skirmish | 80 (72-88) | 98% (easy) | 99% (easy) |
| 6-4 Root Snare | skirmish | 75 (67-83) | 98% (easy) | 98% (easy) |
| 6-5 Venomlord's Coil | elite | 70 (62-78) | 71% | 62% |
| 6-6 Crocodile Run | elite | 65 (57-73) | 94% (easy) | 94% (easy) |
| 6-7 Adder Gauntlet | elite | 60 (52-68) | 56% | 56% |
| 6-8 The Alligator King | miniboss | 40 (30-49) | 75% (easy) | 56% (easy) |
| 7-1 Spore Drift | skirmish | 90 (82-98) | 83% | 78% (hard) |
| 7-2 Grub Tunnels | skirmish | 82.5 (74.5-90.5) | 77% | 79% |
| 7-3 Web Hollow | skirmish | 75 (67-83) | 69% | 76% |
| 7-4 Moonlit Gills | skirmish | 67.5 (59.5-75.5) | 70% | 72% |
| 7-5 The Oath Ring | elite | 60 (52-68) | 60% | 60% |
| 7-6 The Morel Monarch | miniboss | 40 (30-49) | 48% | 48% |
| 8-1 Roost Flurry | skirmish | 90 (82-98) | 100% (easy) | 97% |
| 8-2 Glowworm Grotto | skirmish | 85 (77-93) | 93% | 89% |
| 8-3 Cinder Vents | skirmish | 80 (72-88) | 99% (easy) | 81% |
| 8-4 Echo Chamber | skirmish | 75 (67-83) | 81% | 81% |
| 8-5 Sulfur Vent Path | challenge | 60 (52-68) | 62% | 62% |
| 8-6 Glowworm Deep | skirmish | 65 (57-73) | 98% (easy) | 86% (easy) |
| 8-7 The Roost Above | elite | 60 (52-68) | 59% | 54% |
| 8-8 The Stalactite Warden | miniboss | 40 (30-49) | 100% (easy) | 94% (easy) |
| 9-1 Mudflat Skippers | skirmish | 90 (82-98) | 86% | 86% |
| 9-2 Monitor Roots | skirmish | 84 (76-92) | 77% | 77% |
| 9-3 Kingfisher Dive | skirmish | 78 (70-86) | 95% (easy) | 78% |
| 9-4 Kelp Curtains | challenge | 62 (54-70) | 84% (easy) | 80% (easy) |
| 9-5 Moray Den | elite | 66 (58-74) | 100% (easy) | 96% (easy) |
| 9-6 Drifting Shell | elite | 60 (52-68) | 91% (easy) | 85% (easy) |
| 9-7 The Kelp Witch | miniboss | 40 (30-49) | 96% (easy) | 80% (easy) |
| 10-1 Clownfish Shoal | skirmish | 90 (82-98) | 65% (hard) | 91% |
| 10-2 Moray Ambush | skirmish | 85.7 (77.7-93.7) | 42% (hard) | 76% (hard) |
| 10-3 Tide Pool Line | skirmish | 81.4 (73.4-89.4) | 62% (hard) | 91% (easy) |
| 10-4 Riptide Channel | skirmish | 77.1 (69.1-85.1) | 77% | 77% |
| 10-5 Current Split | skirmish | 72.9 (64.9-80.9) | 94% (easy) | 78% |
| 10-6 Reef Shark Pack | elite | 68.6 (60.6-76.6) | 69% | 82% (easy) |
| 10-7 Eel Nest | elite | 64.3 (56.3-72.3) | 91% (easy) | 74% (easy) |
| 10-8 Sea Turtle Elder's Court | elite | 60 (52-68) | 77% (easy) | 66% |
| 10-9 The Orca Vanguard King | boss | 40 (30-49) | 93% (easy) | 84% (easy) |
| 11-1 Goat Trail Runners | skirmish | 90 (82-98) | 94% | 96% |
| 11-10 The Avalanche Colossus | miniboss | 40 (30-49) | 42% | 46% |
| 11-2 Avalanche Ridge | skirmish | 86.3 (78.3-94.3) | 75% (hard) | 75% (hard) |
| 11-3 Cliffside Herd | skirmish | 82.5 (74.5-90.5) | 79% | 79% |
| 11-4 Ridge Fork | skirmish | 78.8 (70.8-86.8) | 67% (hard) | 76% |
| 11-5 West Ledge | elite | 75 (67-83) | 69% | 69% |
| 11-6 East Ledge | elite | 71.3 (63.3-79.3) | 60% (hard) | 63% (hard) |
| 11-7 Eyrie Wardens | elite | 67.5 (59.5-75.5) | 59% (hard) | 57% (hard) |
| 11-8 Summit Approach | elite | 63.8 (55.8-71.8) | 57% | 72% (easy) |
| 11-9 The Condor Sovereign | elite | 60 (52-68) | 68% | 71% (easy) |
| 12-1 Hedge Mice | skirmish | 90 (82-98) | 98% | 89% |
| 12-2 Quill Path | skirmish | 84 (76-92) | 56% (hard) | 87% |
| 12-3 Warren Run | challenge | 68 (60-76) | 80% (easy) | 80% (easy) |
| 12-4 Thornvine Arch | skirmish | 72 (64-80) | 91% (easy) | 75% |
| 12-5 Quillback Hold | elite | 66 (58-74) | 92% (easy) | 82% (easy) |
| 12-6 Rodent Court | elite | 60 (52-68) | 100% (easy) | 93% (easy) |
| 12-7 The Briar Queen | miniboss | 40 (30-49) | 99% (easy) | 96% (easy) |
| 13-1 Cub Clearing | skirmish | 90 (82-98) | 95% | 95% |
| 13-2 Fox Run | skirmish | 85 (77-93) | 100% (easy) | 95% (easy) |
| 13-3 Antler Grove | skirmish | 80 (72-88) | 97% (easy) | 87% |
| 13-4 Boar Wallow | challenge | 65 (57-73) | 82% (easy) | 82% (easy) |
| 13-5 Badger Setts | elite | 70 (62-78) | 94% (easy) | 92% (easy) |
| 13-6 Grizzly Ridge | elite | 65 (57-73) | 95% (easy) | 95% (easy) |
| 13-7 The King's Den | elite | 60 (52-68) | 88% (easy) | 94% (easy) |
| 13-8 The Stag-Lord | miniboss | 40 (30-49) | 97% (easy) | 96% (easy) |
| 14-1 Zebra Stampede | skirmish | 90 (82-98) | 96% | 96% |
| 14-2 Hyena Chorus | skirmish | 85 (77-93) | 80% | 80% |
| 14-3 Howler Canopy | skirmish | 80 (72-88) | 73% | 73% |
| 14-4 Toucan Watch | skirmish | 75 (67-83) | 80% | 81% |
| 14-5 Giraffe Vanguard | elite | 70 (62-78) | 60% (hard) | 60% (hard) |
| 14-6 Jaguar Run | elite | 65 (57-73) | 52% (hard) | 52% (hard) |
| 14-7 The Cheetah Matriarch | elite | 60 (52-68) | 54% | 54% |
| 14-8 The Savanna Warlord | miniboss | 40 (30-49) | 40% | 40% |
| 15-1 Colt Meadow | skirmish | 90 (82-98) | 100% (easy) | 100% (easy) |
| 15-2 Squire Road | skirmish | 84 (76-92) | 98% (easy) | 89% |
| 15-3 Stoat Ambush | skirmish | 78 (70-86) | 100% (easy) | 90% (easy) |
| 15-4 Archer Hill | skirmish | 72 (64-80) | 91% (easy) | 91% (easy) |
| 15-5 Charge of the Warhorses | elite | 66 (58-74) | 85% (easy) | 80% (easy) |
| 15-6 The Kennels | elite | 60 (52-68) | 92% (easy) | 69% (easy) |
| 15-7 The Horse-Lord | boss | 40 (30-49) | 87% (easy) | 73% (easy) |
| 16-1 Snowshoe Tracks | skirmish | 90 (82-98) | 95% | 95% |
| 16-2 Pinecone Drop | skirmish | 84 (76-92) | 92% | 93% (easy) |
| 16-3 Elk Crossing | challenge | 68 (60-76) | 98% (easy) | 98% (easy) |
| 16-4 Lynx Shadow | skirmish | 72 (64-80) | 93% (easy) | 89% (easy) |
| 16-5 The Running Pack | elite | 66 (58-74) | 89% (easy) | 82% (easy) |
| 16-6 Reaver's Hollow | elite | 60 (52-68) | 82% (easy) | 76% (easy) |
| 16-7 The Howling Alpha | miniboss | 40 (30-49) | 98% (easy) | 98% (easy) |
| 17-1 Ice Fang Patrol | skirmish | 90 (82-98) | 99% (easy) | 100% (easy) |
| 17-2 Frostbitten Pack | skirmish | 85 (77-93) | 99% (easy) | 92% |
| 17-3 Snowshoe Line | skirmish | 80 (72-88) | 99% (easy) | 93% (easy) |
| 17-4 Lynx Ambush | skirmish | 75 (67-83) | 97% (easy) | 88% (easy) |
| 17-5 Musk Ox Bulwark | elite | 70 (62-78) | 53% (hard) | 60% (hard) |
| 17-6 Glacier Herd | elite | 65 (57-73) | 90% (easy) | 81% (easy) |
| 17-7 Alpha Howler's Den | elite | 60 (52-68) | 96% (easy) | 84% (easy) |
| 17-8 The Glacial Ape-King | miniboss | 40 (30-49) | 79% (easy) | 63% (easy) |
| 18-1 Dune Jackals | skirmish | 90 (82-98) | 100% (easy) | 100% (easy) |
| 18-2 Scorpion Flats | skirmish | 84 (76-92) | 100% (easy) | 100% (easy) |
| 18-3 Widow's Web | skirmish | 78 (70-86) | 100% (easy) | 100% (easy) |
| 18-4 Sandstorm | challenge | 62 (54-70) | 99% (easy) | 99% (easy) |
| 18-5 Obsidian Nest | elite | 66 (58-74) | 100% (easy) | 100% (easy) |
| 18-6 Komodo Wallow | elite | 60 (52-68) | 100% (easy) | 100% (easy) |
| 18-7 The Sand Widow Queen | miniboss | 40 (30-49) | 100% (easy) | 100% (easy) |
| 19-1 Badger Warband | skirmish | 90 (82-98) | 91% | 91% |
| 19-2 Quill Line | skirmish | 82.5 (74.5-90.5) | 98% (easy) | 98% (easy) |
| 19-3 Porcupine Bastion | elite | 75 (67-83) | 96% (easy) | 79% |
| 19-4 Sky Marks | elite | 67.5 (59.5-75.5) | 86% (easy) | 80% (easy) |
| 19-5 Sky Scraper Sentinel | elite | 60 (52-68) | 84% (easy) | 79% (easy) |
| 19-6 The Frost Yeti King | miniboss | 40 (30-49) | 94% (easy) | 94% (easy) |
| 20-1 Silverback Watch | skirmish | 90 (82-98) | 99% (easy) | 97% |
| 20-10 The Cave Warlord | worldboss | 40 (30-49) | 78% (easy) | 73% (easy) |
| 20-2 Grizzly Frontier | skirmish | 85.7 (77.7-93.7) | 81% | 86% |
| 20-3 Panther Ledge | skirmish | 81.4 (73.4-89.4) | 79% | 80% |
| 20-4 Shrine Steps | challenge | 67.1 (59.1-75.1) | 99% (easy) | 99% (easy) |
| 20-5 Cave Warlord's Guard | elite | 72.9 (64.9-80.9) | 90% (easy) | 77% |
| 20-6 The Constrictor Sovereign | elite | 68.6 (60.6-76.6) | 73% | 69% |
| 20-7 The Blessed Avatar | elite | 64.3 (56.3-72.3) | 100% (easy) | 100% (easy) |
| 20-8 The Iron Cataphract | elite | 60 (52-68) | 72% (easy) | 64% |
| 20-9 The Ancient Sloth Titan | boss | 50 (42-58) | 76% (easy) | 77% (easy) |
| 21-1 Thaw Path | skirmish | 90 (82-98) | 68% (hard) | 85% |
| 21-2 Tarn Shore | skirmish | 82.5 (74.5-90.5) | 88% | 83% |
| 21-3 Cloud Ledge | skirmish | 75 (67-83) | 77% | 77% |
| 21-4 The Avalanche's Wake | elite | 67.5 (59.5-75.5) | 77% (easy) | 78% (easy) |
| 21-5 Snow Owl Parliament | elite | 60 (52-68) | 61% | 60% |
| 21-6 The Cathedral Eagle | miniboss | 40 (30-49) | 69% (easy) | 61% (easy) |
| 22-1 Snowmelt Switchbacks | skirmish | 90 (82-98) | 79% (hard) | 95% |
| 22-2 Steam Vents | skirmish | 85 (77-93) | 84% | 92% |
| 22-3 Frozen Lava Flow | skirmish | 80 (72-88) | 96% (easy) | 79% |
| 22-4 Hailstone Ridge | skirmish | 75 (67-83) | 68% | 78% |
| 22-5 The Geyser Field | challenge | 60 (52-68) | 69% (easy) | 69% (easy) |
| 22-6 Ashfall Cornice | elite | 65 (57-73) | 47% (hard) | 67% |
| 22-7 The Steam Wall | elite | 60 (52-68) | 97% (easy) | 57% |
| 22-8 The Rimeheart Colossus | miniboss | 40 (30-49) | 71% (easy) | 52% (easy) |
| 23-1 The Picket Line | skirmish | 90 (82-98) | 96% | 96% |
| 23-2 Trench Works | skirmish | 85 (77-93) | 86% | 84% |
| 23-3 Elephant Road | skirmish | 80 (72-88) | 100% (easy) | 100% (easy) |
| 23-4 Siege Camp | skirmish | 75 (67-83) | 82% | 74% |
| 23-5 Under the Walls | challenge | 60 (52-68) | 100% (easy) | 100% (easy) |
| 23-6 The Elephant Line | elite | 65 (57-73) | 100% (easy) | 98% (easy) |
| 23-7 The Barbican | elite | 60 (52-68) | 99% (easy) | 98% (easy) |
| 23-8 Marshal Tuskwell | miniboss | 40 (30-49) | 98% (easy) | 99% (easy) |
| 24-1 Breach the Gate | skirmish | 90 (82-98) | 71% (hard) | 85% |
| 24-2 The Bailey | skirmish | 85 (77-93) | 63% (hard) | 90% |
| 24-3 The Counting House | skirmish | 80 (72-88) | 93% (easy) | 80% |
| 24-4 The Courtyard Fountain | skirmish | 75 (67-83) | 88% (easy) | 80% |
| 24-5 The Battlements | skirmish | 70 (62-78) | 100% (easy) | 70% |
| 24-6 The Gilded Guard | elite | 65 (57-73) | 77% (easy) | 83% (easy) |
| 24-7 The Treasury | elite | 60 (52-68) | 100% (easy) | 63% |
| 24-8 The Magnate Duck | miniboss | 40 (30-49) | 100% (easy) | 45% |
| 18-A-1 Bleached Flats | skirmish | 90 (82-98) | 100% (easy) | 97% |
| 18-A-2 Mirage Jackals | skirmish | 85.7 (77.7-93.7) | 100% (easy) | 88% |
| 18-A-3 Dust Devils | challenge | 71.4 (63.4-79.4) | 100% (easy) | 94% (easy) |
| 18-A-4 Meerkat Warrens | skirmish | 77.1 (69.1-85.1) | 100% (easy) | 100% (easy) |
| 18-A-5 Vulture Road | skirmish | 72.9 (64.9-80.9) | 83% (easy) | 73% |
| 18-A-6 The Salt Pan | skirmish | 68.6 (60.6-76.6) | 100% (easy) | 91% (easy) |
| 18-A-7 Oryx Crossing | skirmish | 64.3 (56.3-72.3) | 96% (easy) | 87% (easy) |
| 18-A-8 The Dry Well | elite | 60 (52-68) | 100% (easy) | 67% |
| 18-A-9 The Quicksand Queen | boss | 40 (30-49) | 94% (easy) | 83% (easy) |
