# REF6: how strong are the 100 reference players' decks? (pre-skir1, 2026-11-11)

Each map's 100 simulated players (seeds ref6-1 .. ref6-100, `docs/balance/ref6/ladder-100.json`), each deck against every road fight of its map (seeds 5300 + 37g): at least 16 games a deck, and players who share a deck share its games, so a deck plays 160 x the share of players holding it when that is more (every fight gets at least 160 games). A deck's **strength** = its mean win rate over the map's road fights. "True SD" takes the game noise out (16 games leave about ±13 points of noise per deck per fight). Made by `node tools/ref6/measure.js --tag pre-skir1`.

## Variance in strength of the different decks

| Map | Name | mean | SD (true) | p10 – p90 | min – max | weakest fight (mean) | distinct decks |
|---|---|---|---|---|---|---|---|
| m1 (0) | Bramblewood Outskirts | 88 | 0 (0) | 88 – 88 | 88 – 88 | 0-4 (66.9) | 1 |
| mo (0 side) | The Old Bramble | 10.3 | 0 (0) | 10.3 – 10.3 | 10.3 – 10.3 | 0-B-2 (5) | 1 |
| mf (1) | Thistlewood | 73.5 | 0 (0) | 73.5 – 73.5 | 73.5 – 73.5 | 1-5 (16.2) | 1 |
| mq (1 side) | Clovermead | 84.8 | 2.1 (0.5) | 82.5 – 87 | 76.3 – 87 | 1-A-3 (75.4) | 12 |
| mb (2) | Pebble Beach | 53.2 | 0 (0) | 53.3 – 53.3 | 53.3 – 53.3 | 2-5 (41.9) | 1 |
| mg (2 side) | Smugglers' Grotto | 91.6 | 0 (0) | 91.6 – 91.6 | 91.6 – 91.6 | 2-B-4 (76.3) | 1 |
| mp (2 side) | Lilypad Reach | 92.9 | 0 (0) | 92.9 – 92.9 | 92.9 – 92.9 | 2-A-7 (89.4) | 1 |
| mc (3) | Gannet Cliffs | 86.8 | 1.9 (0.7) | 86.1 – 88.4 | 81.3 – 92.9 | 3-6 (79.1) | 9 |
| m2 (4) | Sunken Hollow | 79.5 | 0 (0) | 79.5 – 79.5 | 79.5 – 79.5 | 4-5 (59.4) | 1 |
| mw (5) | Gatorback Swamp | 89.5 | 1.3 (0) | 88.2 – 92.3 | 88.2 – 92.3 | 5-7 (72.2) | 6 |
| ms (5 side) | The Sunken Grove | 93.1 | 0 (0) | 93.1 – 93.1 | 93.1 – 93.1 | 5-A-3 (88.8) | 1 |
| m8 (6) | Sable Swampmire | 95.5 | 0 (0) | 95.5 – 95.5 | 95.5 – 95.5 | 6-5 (82.5) | 1 |
| mu (7) | The Morel Hollow | 94.2 | 0 (0) | 94.2 – 94.2 | 94.2 – 94.2 | 7-6 (87.5) | 1 |
| mz (7 side) | The Mycelium Deep | 93.6 | 1 (0) | 93.2 – 93.8 | 93.2 – 97.5 | 7-A-4 (85.3) | 4 |
| m4 (8) | Caves & Alcoves | 93.3 | 1.2 (0.5) | 91 – 93.9 | 89.8 – 93.9 | 8-8 (68.1) | 4 |
| mn (8 side) | The Glimmer Depths | 74.4 | 6.4 (5.2) | 60.9 – 78.4 | 60.9 – 79.7 | 8-A-4 (57.7) | 14 |
| mk (9) | The Kelp Mangroves | 95.2 | 0.8 (0.4) | 92.9 – 95.4 | 92.9 – 96.4 | 9-7 (80.1) | 4 |
| m7 (10) | Coral Current | 89.7 | 1 (0) | 88.2 – 89.9 | 84.7 – 92.4 | 10-9 (69.4) | 6 |
| mj (10 side) | The Sunken Depths | 96.3 | 2.3 (1.4) | 92.5 – 97.5 | 85 – 100 | 10-A-5 (93.2) | 16 |
| m10 (11) | Eyrie Heights | 96.8 | 0.5 (0) | 96.8 – 97.5 | 95 – 98.8 | 11-7 (92) | 9 |
| mv (11 side) | The Aerie Vault | 67.7 | 4.8 (0) | 63.6 – 75 | 57.8 – 75 | 11-A-4 (44) | 21 |
| mh (12) | The Briar Maze | 96.7 | 1.2 (0.8) | 96.4 – 97.2 | 91.1 – 99.1 | 12-6 (93.7) | 12 |
| mr (13) | The Redwood Deep | 89.7 | 1.1 (0) | 88.9 – 90.2 | 84.4 – 90.2 | 13-8 (70.7) | 7 |
| m5 (14) | Savanna Reaches | 82.9 | 1.9 (0.7) | 79.8 – 83.9 | 77.3 – 84.4 | 14-8 (65) | 7 |
| my (14 side) | The Canopy | 91.1 | 2.2 (0) | 87.8 – 93.8 | 87.8 – 97.5 | 14-A-5 (74.7) | 28 |
| ml (15) | The Long Grass | 79.2 | 3.9 (3.1) | 76 – 82.4 | 67.9 – 83 | 15-7 (62.6) | 11 |
| mt (16) | The Pinewood Taiga | 52.1 | 3.4 (0) | 47.3 – 55.4 | 44.6 – 59.8 | 16-7 (17.7) | 26 |
| m6 (17) | Wolfsbane Tundra | 71.8 | 1.9 (0) | 70.9 – 74.1 | 65.6 – 76.6 | 17-8 (52) | 11 |
| mi (17 side) | The Ice Hollow | 59.7 | 5.3 (0) | 53 – 67.2 | 46.9 – 68.8 | 17-A-4 (27.6) | 53 |
| md (18) | The Glass Dunes | 73 | 5.4 (4.7) | 68.5 – 82.1 | 63.4 – 87.5 | 18-7 (35.7) | 19 |
| mpd (18 side) | The Pale Desert | 74.3 | 3.3 (1.6) | 70.6 – 77.2 | 66.7 – 87.5 | 18-A-9 (40.9) | 31 |
| m3 (19) | Ashen Spurn | 65.1 | 3.9 (0) | 59.4 – 69.8 | 57.3 – 76 | 19-6 (47.3) | 52 |
| m9 (19 side) | Basalt Foundry | 50.8 | 5.1 (4.1) | 45.2 – 59.4 | 45.2 – 65 | 19-A-8 (12) | 26 |
| m11 (20) | The Sundered Peak | 48.9 | 3 (0.4) | 44.3 – 51.4 | 41.3 – 57.5 | 20-9 (33.3) | 22 |
| me (20 side) | Eye of the Volcano | 64.4 | 3.2 (2) | 61.6 – 68.8 | 58 – 72.3 | 20-A-4 (29.5) | 15 |
| mx (20 side) | Volcano Lair | 28.6 | 1.7 (0) | 26.6 – 29.4 | 20.3 – 29.4 | 20-B-4 (0.6) | 6 |

Median true SD 0 points; widest mn 5.2, md 4.7, m9 4.1.

## Main maps, per road fight

Mean over the 100 decks, p10 – p90 (game noise taken out), the road-curve target, the Map reference and Reference-2.

| Fight | kind | Ref 100 mean | p10 – p90 (est.) | target | Map ref | Ref-2 |
|---|---|---|---|---|---|---|
| 0-1 | skirmish | 98.7 | 98.8 – 98.8 | 90 (82–98) | 93.8 | 96.9 |
| 0-2 | skirmish | 88.1 | 88.1 – 88.1 | 75 (67–83) | 75 | 100 |
| 0-3 | skirmish | 98.1 | 98.1 – 98.1 | 60 (52–68) | 59.4 | 100 |
| 0-4 | skirmish | 66.9 | 66.9 – 66.9 | 45 (30–49) | 40.6 | 100 |
| 1-1 | skirmish | 90.6 | 90.6 – 90.6 | 90 (82–98) | 93.8 | 96.9 |
| 1-2 | skirmish | 74.4 | 74.4 – 74.4 | 80 (72–88) | 81.3 | 93.8 |
| 1-3 | skirmish | 95 | 95 – 95 | 85 (77–93) | 96.9 | 100 |
| 1-4 | skirmish | 91.2 | 91.3 – 91.3 | 80 (72–88) | 96.9 | 100 |
| 1-5 | elite | 16.2 | 16.3 – 16.3 | 40 (30–49) | 53.1 | 100 |
| 2-1 | skirmish | 66.9 | 66.9 – 66.9 | 90 (82–98) | 56.3 | 84.4 |
| 2-2 | skirmish | 65.6 | 65.6 – 65.6 | 80 (72–88) | 56.3 | 87.5 |
| 2-3 | skirmish | 45 | 45 – 45 | 70 (62–78) | 62.5 | 96.9 |
| 2-4 | skirmish | 46.9 | 46.9 – 46.9 | 60 (52–68) | 56.3 | 84.4 |
| 2-5 | elite | 41.9 | 41.9 – 41.9 | 40 (30–49) | 53.1 | 50 |
| 3-1 | skirmish | 89.4 | 89.4 – 89.4 | 90 (82–98) | 84.4 | 96.9 |
| 3-2 | skirmish | 98.5 | 98.5 – 98.5 | 84 (76–92) | 93.8 | 100 |
| 3-3 | skirmish | 89 | 89 – 89 | 78 (70–86) | 93.8 | 93.8 |
| 3-4 | skirmish | 86.6 | 85.6 – 96.4 | 72 (64–80) | 50 | 93.8 |
| 3-5 | elite | 80.7 | 80.7 – 80.7 | 66 (58–74) | 62.5 | 84.4 |
| 3-6 | elite | 79.1 | 79.1 – 79.1 | 60 (52–68) | 62.5 | 93.8 |
| 3-7 | elite | 84.5 | 84.5 – 84.5 | 40 (30–49) | 34.4 | 90.6 |
| 4-1 | skirmish | 85.6 | 85.6 – 85.6 | 90 (82–98) | 90.6 | 96.9 |
| 4-2 | skirmish | 98.7 | 98.8 – 98.8 | 80 (72–88) | 78.1 | 93.8 |
| 4-3 | elite | 76.3 | 76.2 – 76.2 | 70 (62–78) | 68.8 | 84.4 |
| 4-4 | elite | 77.5 | 77.5 – 77.5 | 60 (52–68) | 59.4 | 96.9 |
| 4-5 | elite | 59.4 | 59.4 – 59.4 | 40 (30–49) | 40.6 | 71.9 |
| 5-1 | skirmish | 99.4 | 99.4 – 99.4 | 90 (82–98) | 93.8 | 100 |
| 5-2 | skirmish | 99.4 | 99.4 – 99.4 | 84 (76–92) | 84.4 | 100 |
| 5-3 | skirmish | 86.3 | 85.2 – 88.1 | 78 (70–86) | 59.4 | 96.9 |
| 5-4 | skirmish | 93.2 | 93.2 – 93.2 | 72 (64–80) | 75 | 100 |
| 5-5 | elite | 85.7 | 80.1 – 88.1 | 66 (58–74) | 65.6 | 100 |
| 5-6 | elite | 90.1 | 88.5 – 90.9 | 60 (52–68) | 59.4 | 100 |
| 5-7 | boss | 72.2 | 72.2 – 72.2 | 40 (30–49) | 59.4 | 96.9 |
| 6-1 | skirmish | 99.4 | 99.4 – 99.4 | 90 (82–98) | 84.4 | 100 |
| 6-2 | skirmish | 99.4 | 99.4 – 99.4 | 85 (77–93) | 84.4 | 100 |
| 6-3 | skirmish | 99.4 | 99.4 – 99.4 | 80 (72–88) | 84.4 | 100 |
| 6-4 | skirmish | 95.6 | 95.6 – 95.6 | 75 (67–83) | 87.5 | 100 |
| 6-5 | elite | 82.5 | 82.5 – 82.5 | 70 (62–78) | 53.1 | 100 |
| 6-6 | elite | 93.1 | 93.1 – 93.1 | 65 (57–73) | 50 | 100 |
| 6-7 | elite | 100 | 100 – 100 | 60 (52–68) | 65.6 | 100 |
| 6-8 | miniboss | 94.4 | 94.4 – 94.4 | 40 (30–49) | 37.5 | 100 |
| 7-1 | skirmish | 99.4 | 99.4 – 99.4 | 90 (82–98) | 93.8 | 100 |
| 7-2 | skirmish | 96.9 | 96.9 – 96.9 | 82.5 (74.5–90.5) | 71.9 | 93.8 |
| 7-3 | skirmish | 93.8 | 93.8 – 93.8 | 75 (67–83) | 65.6 | 90.6 |
| 7-4 | skirmish | 94.4 | 94.4 – 94.4 | 67.5 (59.5–75.5) | 78.1 | 96.9 |
| 7-5 | elite | 93.1 | 93.1 – 93.1 | 60 (52–68) | 78.1 | 93.8 |
| 7-6 | miniboss | 87.5 | 87.5 – 87.5 | 40 (30–49) | 40.6 | 59.4 |
| 8-1 | skirmish | 100 | 100 – 100 | 90 (82–98) | 90.6 | 100 |
| 8-2 | skirmish | 99.4 | 99.4 – 99.4 | 85 (77–93) | 84.4 | 100 |
| 8-3 | skirmish | 98.8 | 98.2 – 99.6 | 80 (72–88) | 81.3 | 100 |
| 8-4 | skirmish | 96.3 | 96.3 – 96.3 | 75 (67–83) | 78.1 | 100 |
| 8-5 | skirmish | 92.2 | 92.2 – 92.2 | 70 (62–78) | 53.1 | 93.8 |
| 8-6 | skirmish | 92.9 | 92.9 – 92.9 | 65 (57–73) | 65.6 | 100 |
| 8-7 | elite | 98.7 | 98.9 – 99.6 | 60 (52–68) | 59.4 | 96.9 |
| 8-8 | miniboss | 68.1 | 68.1 – 68.1 | 40 (30–49) | 15.6 | 81.3 |
| 9-1 | skirmish | 100 | 100 – 100 | 90 (82–98) | 90.6 | 100 |
| 9-2 | skirmish | 100 | 100 – 100 | 84 (76–92) | 81.3 | 100 |
| 9-3 | skirmish | 99.4 | 99.4 – 99.4 | 78 (70–86) | 87.5 | 100 |
| 9-4 | skirmish | 94.4 | 94.4 – 94.4 | 72 (64–80) | 62.5 | 100 |
| 9-5 | elite | 96.9 | 96.9 – 96.9 | 66 (58–74) | 71.9 | 100 |
| 9-6 | elite | 95.6 | 95.6 – 95.6 | 60 (52–68) | 53.1 | 100 |
| 9-7 | miniboss | 80.1 | 73.5 – 81 | 40 (30–49) | 31.3 | 93.8 |
| 10-1 | skirmish | 98.1 | 98.1 – 98.1 | 90 (82–98) | 90.6 | 96.9 |
| 10-2 | skirmish | 98.8 | 98.5 – 99.6 | 85.7 (77.7–93.7) | 84.4 | 100 |
| 10-3 | skirmish | 95 | 94.9 – 95.5 | 81.4 (73.4–89.4) | 87.5 | 100 |
| 10-4 | skirmish | 84.7 | 84.7 – 84.7 | 77.1 (69.1–85.1) | 75 | 93.8 |
| 10-5 | skirmish | 97.4 | 96.8 – 99.4 | 72.9 (64.9–80.9) | 84.4 | 100 |
| 10-6 | elite | 91.1 | 88.4 – 91.7 | 68.6 (60.6–76.6) | 53.1 | 87.5 |
| 10-7 | elite | 85.8 | 85.8 – 85.8 | 64.3 (56.3–72.3) | 62.5 | 100 |
| 10-8 | elite | 86.9 | 83.6 – 99.1 | 60 (52–68) | 68.8 | 100 |
| 10-9 | boss | 69.4 | 65.4 – 70.3 | 40 (30–49) | 34.4 | 96.9 |
| 11-1 | skirmish | 100 | 100 – 100 | 90 (82–98) | 100 | 100 |
| 11-2 | skirmish | 98.7 | 98.6 – 99.1 | 86.3 (78.3–94.3) | 90.6 | 100 |
| 11-3 | skirmish | 99.8 | 99.8 – 99.8 | 82.5 (74.5–90.5) | 78.1 | 100 |
| 11-4 | skirmish | 97.9 | 97.7 – 99.2 | 78.8 (70.8–86.8) | 68.8 | 96.9 |
| 11-5 | elite | 95.9 | 95.6 – 97.6 | 75 (67–83) | 84.4 | 93.8 |
| 11-6 | elite | 97.8 | 97.8 – 97.8 | 71.3 (63.3–79.3) | 65.6 | 100 |
| 11-7 | elite | 92 | 92 – 92 | 67.5 (59.5–75.5) | 68.8 | 100 |
| 11-8 | elite | 93.6 | 93.6 – 93.6 | 63.8 (55.8–71.8) | 71.9 | 96.9 |
| 11-9 | elite | 100 | 100 – 100 | 60 (52–68) | 62.5 | 100 |
| 11-10 | miniboss | 92.7 | 92.7 – 92.7 | 40 (30–49) | 37.5 | 84.4 |
| 12-1 | skirmish | 97 | 96.1 – 99.2 | 90 (82–98) | 87.5 | 100 |
| 12-2 | skirmish | 97.4 | 97.4 – 97.4 | 84 (76–92) | 75 | 100 |
| 12-3 | skirmish | 99.1 | 99.1 – 99.1 | 78 (70–86) | 62.5 | 100 |
| 12-4 | skirmish | 95.5 | 94.8 – 96.1 | 72 (64–80) | 81.3 | 100 |
| 12-5 | elite | 98.3 | 98.3 – 98.3 | 66 (58–74) | 62.5 | 100 |
| 12-6 | elite | 93.7 | 92.1 – 95.9 | 60 (52–68) | 53.1 | 90.6 |
| 12-7 | miniboss | 96.1 | 95.1 – 97.2 | 40 (30–49) | 37.5 | 96.9 |
| 13-1 | skirmish | 99.3 | 99.3 – 99.3 | 90 (82–98) | 90.6 | 100 |
| 13-2 | skirmish | 96.2 | 96.2 – 96.2 | 85 (77–93) | 81.3 | 100 |
| 13-3 | skirmish | 98.4 | 98.4 – 99.4 | 80 (72–88) | 90.6 | 100 |
| 13-4 | skirmish | 95.1 | 94.5 – 98.4 | 75 (67–83) | 56.3 | 96.9 |
| 13-5 | elite | 89.7 | 89.7 – 89.7 | 70 (62–78) | 62.5 | 93.8 |
| 13-6 | elite | 82.4 | 82.4 – 82.4 | 65 (57–73) | 68.8 | 90.6 |
| 13-7 | elite | 85.9 | 85.9 – 85.9 | 60 (52–68) | 56.3 | 90.6 |
| 13-8 | miniboss | 70.7 | 55.5 – 75.3 | 40 (30–49) | 43.8 | 96.9 |
| 14-1 | skirmish | 86.5 | 82.3 – 90 | 90 (82–98) | 56.3 | 87.5 |
| 14-2 | skirmish | 98.1 | 97.5 – 99.7 | 85 (77–93) | 90.6 | 100 |
| 14-3 | skirmish | 92.4 | 92.4 – 92.4 | 80 (72–88) | 68.8 | 96.9 |
| 14-4 | skirmish | 93.9 | 93.9 – 93.9 | 75 (67–83) | 78.1 | 96.9 |
| 14-5 | elite | 81.5 | 81.5 – 81.5 | 70 (62–78) | 59.4 | 93.8 |
| 14-6 | elite | 74.8 | 74.8 – 74.8 | 65 (57–73) | 53.1 | 90.6 |
| 14-7 | elite | 70.8 | 58.5 – 74.2 | 60 (52–68) | 34.4 | 87.5 |
| 14-8 | miniboss | 65 | 65 – 65 | 40 (30–49) | 40.6 | 75 |
| 15-1 | skirmish | 95.6 | 91.9 – 98.7 | 90 (82–98) | 100 | 100 |
| 15-2 | skirmish | 88.4 | 88.4 – 88.4 | 84 (76–92) | 71.9 | 93.8 |
| 15-3 | skirmish | 83.6 | 83.6 – 83.6 | 78 (70–86) | 75 | 93.8 |
| 15-4 | skirmish | 84.2 | 79.6 – 88.1 | 72 (64–80) | 62.5 | 75 |
| 15-5 | elite | 73.7 | 61.3 – 78.2 | 66 (58–74) | 78.1 | 100 |
| 15-6 | elite | 66.1 | 60 – 70.6 | 60 (52–68) | 68.8 | 96.9 |
| 15-7 | boss | 62.6 | 62.6 – 62.6 | 40 (30–49) | 43.8 | 71.9 |
| 16-1 | skirmish | 77.3 | 77.3 – 77.3 | 90 (82–98) | 87.5 | 100 |
| 16-2 | skirmish | 60.5 | 53.4 – 65.3 | 84 (76–92) | 84.4 | 100 |
| 16-3 | skirmish | 52 | 52 – 52 | 78 (70–86) | 62.5 | 96.9 |
| 16-4 | skirmish | 64.1 | 64.1 – 64.1 | 72 (64–80) | 78.1 | 100 |
| 16-5 | elite | 61.3 | 46.1 – 71.8 | 66 (58–74) | 68.8 | 100 |
| 16-6 | elite | 31.7 | 31.7 – 31.7 | 60 (52–68) | 56.3 | 93.8 |
| 16-7 | miniboss | 17.7 | 17.7 – 17.7 | 40 (30–49) | 34.4 | 93.8 |
| 17-1 | skirmish | 88.6 | 88.6 – 88.6 | 90 (82–98) | 90.6 | 96.9 |
| 17-2 | skirmish | 88.3 | 87.1 – 91.6 | 85 (77–93) | 87.5 | 100 |
| 17-3 | skirmish | 74.1 | 74.1 – 74.1 | 80 (72–88) | 84.4 | 100 |
| 17-4 | skirmish | 84.4 | 80.4 – 85.9 | 75 (67–83) | 71.9 | 100 |
| 17-5 | elite | 59.7 | 56.3 – 66.3 | 70 (62–78) | 75 | 93.8 |
| 17-6 | elite | 68.6 | 68.6 – 68.6 | 65 (57–73) | 65.6 | 93.8 |
| 17-7 | elite | 58.8 | 58.8 – 58.8 | 60 (52–68) | 62.5 | 96.9 |
| 17-8 | miniboss | 52 | 52 – 52 | 40 (30–49) | 25 | 65.6 |
| 18-1 | skirmish | 80.6 | 78.9 – 85.7 | 90 (82–98) | 84.4 | 96.9 |
| 18-2 | skirmish | 91.9 | 88.7 – 95.8 | 84 (76–92) | 96.9 | 90.6 |
| 18-3 | skirmish | 80.3 | 80.3 – 80.3 | 78 (70–86) | 87.5 | 81.3 |
| 18-4 | skirmish | 78.6 | 78.6 – 78.6 | 72 (64–80) | 93.8 | 81.3 |
| 18-5 | elite | 78.5 | 78.5 – 78.5 | 66 (58–74) | 71.9 | 87.5 |
| 18-6 | elite | 65.4 | 61.6 – 71.5 | 60 (52–68) | 75 | 75 |
| 18-7 | miniboss | 35.7 | 28.7 – 49.7 | 40 (30–49) | 43.8 | 56.3 |
| 19-1 | skirmish | 86.2 | 86.2 – 86.2 | 90 (82–98) | 87.5 | 93.8 |
| 19-2 | skirmish | 77.6 | 77.6 – 77.6 | 82.5 (74.5–90.5) | 90.6 | 93.8 |
| 19-3 | elite | 66.2 | 66.2 – 66.2 | 75 (67–83) | 75 | 100 |
| 19-4 | elite | 64 | 64 – 64 | 67.5 (59.5–75.5) | 75 | 78.1 |
| 19-5 | elite | 49.4 | 49.4 – 49.4 | 60 (52–68) | 75 | 87.5 |
| 19-6 | miniboss | 47.3 | 47.3 – 47.3 | 40 (30–49) | 43.8 | 90.6 |
| 20-1 | skirmish | 55.7 | 55.7 – 55.7 | 90 (82–98) | 90.6 | 96.9 |
| 20-2 | skirmish | 79.7 | 79.7 – 79.7 | 85.7 (77.7–93.7) | 93.8 | 96.9 |
| 20-3 | skirmish | 58.3 | 58.3 – 58.3 | 81.4 (73.4–89.4) | 93.8 | 90.6 |
| 20-4 | skirmish | 36 | 36 – 36 | 77.1 (69.1–85.1) | 75 | 81.3 |
| 20-5 | elite | 46.5 | 46.5 – 46.5 | 72.9 (64.9–80.9) | 81.3 | 96.9 |
| 20-6 | elite | 39.8 | 39.8 – 39.8 | 68.6 (60.6–76.6) | 68.8 | 93.8 |
| 20-7 | elite | 50.2 | 50.2 – 50.2 | 64.3 (56.3–72.3) | 71.9 | 71.9 |
| 20-8 | elite | 54.1 | 41 – 59.5 | 60 (52–68) | 59.4 | 84.4 |
| 20-9 | boss | 33.3 | 30.2 – 37.8 | 50 (42–58) | 81.3 | 90.6 |
| 20-10 | worldboss | 35.6 | 35.6 – 35.6 | 40 (30–49) | 53.1 | 75 |

## What the strongest and weakest fifth have in common

- **m1** strong only: –; weak only: –; leaders strong Wandering Traveller 20, weak Wandering Traveller 20
- **mo** strong only: –; weak only: –; leaders strong The Caldera Wyrm 20, weak The Caldera Wyrm 20
- **mf** strong only: –; weak only: –; leaders strong Wandering Traveller 20, weak Wandering Traveller 20
- **mq** strong only: –; weak only: –; leaders strong The Old Shell 20, weak The Old Shell 20
- **mb** strong only: –; weak only: –; leaders strong Wandering Traveller 20, weak Wandering Traveller 20
- **mg** strong only: –; weak only: –; leaders strong The Old Shell 20, weak The Old Shell 20
- **mp** strong only: –; weak only: –; leaders strong The Old Shell 20, weak The Old Shell 20
- **mc** strong only: Bramble Sprout (85% / 35%), Kittiwake Flock (30% / 0%); weak only: Crimson Recruit (0% / 60%); leaders strong The Old Shell 20, weak The Old Shell 20
- **m2** strong only: –; weak only: –; leaders strong The Old Shell 20, weak The Old Shell 20
- **mw** strong only: Box Turtle (100% / 0%); weak only: –; leaders strong The Old Shell 20, weak The Old Shell 20
- **ms** strong only: –; weak only: –; leaders strong The Old Shell 20, weak The Old Shell 20
- **m8** strong only: –; weak only: –; leaders strong The Old Shell 20, weak The Old Shell 20
- **mu** strong only: –; weak only: –; leaders strong The Old Shell 20, weak The Old Shell 20
- **mz** strong only: Ant Warrior (40% / 0%), Bombardier Beetle (30% / 0%); weak only: –; leaders strong The Old Shell 20, weak The Old Shell 20
- **m4** strong only: –; weak only: Worker Ant (0% / 100%); leaders strong The Old Shell 20, weak The Old Shell 20
- **mn** strong only: Ibex Rockcaller (100% / 60%); weak only: Star-nosed Mole (0% / 50%); leaders strong Pride Queen 20, weak Pride Queen 20
- **mk** strong only: –; weak only: Fleetfoot'd (15% / 55%); leaders strong The Old Shell 20, weak The Old Shell 20
- **m7** strong only: –; weak only: Pincushion Urchin (0% / 85%); leaders strong The Old Shell 20, weak The Old Shell 20
- **mj** strong only: Tunnel Ant (65% / 0%), Planarian Splitter (70% / 40%); weak only: –; leaders strong The Old Shell 20, weak The Old Shell 20
- **m10** strong only: Planarian Splitter (45% / 10%); weak only: –; leaders strong The Old Shell 20, weak The Old Shell 20
- **mv** strong only: Mountain Hare (100% / 10%); weak only: –; leaders strong Pride Queen 20, weak Pride Queen 20
- **mh** strong only: –; weak only: Adder Ambusher (20% / 70%), Badger Lumberjack (0% / 35%); leaders strong The Old Shell 20, weak The Old Shell 20
- **mr** strong only: Owl Nightwatch (100% / 0%); weak only: Bramblewood Lynx (0% / 35%); leaders strong The Old Shell 20, weak The Old Shell 20
- **m5** strong only: Alpine Swift (85% / 0%); weak only: –; leaders strong The Old Shell 20, weak The Old Shell 20
- **my** strong only: Fleetfoot'd (85% / 20%); weak only: –; leaders strong Pride Queen 20, weak Pride Queen 20
- **ml** strong only: –; weak only: Grave-Grin Hyena (5% / 55%); leaders strong Pride Queen 20, weak Pride Queen 20
- **mt** strong only: –; weak only: –; leaders strong Pride Queen 20, weak Pride Queen 20
- **m6** strong only: –; weak only: Snow Bunting Archer (0% / 30%); leaders strong Pride Queen 20, weak Pride Queen 20
- **mi** strong only: –; weak only: –; leaders strong The Caldera Wyrm 20, weak The Caldera Wyrm 20
- **md** strong only: –; weak only: Savanna Cheetah (25% / 95%), Alligator Gar (65% / 95%); leaders strong Pride Queen 20, weak Pride Queen 20
- **mpd** strong only: Trapdoor Spider (40% / 0%); weak only: Sand Widow (0% / 90%), Sandfish (15% / 90%); leaders strong Pride Queen 20, weak Pride Queen 20
- **m3** strong only: Obsidian Scorpion (35% / 0%); weak only: Snow Ermine (20% / 70%); leaders strong Pride Queen 20, weak Pride Queen 20
- **m9** strong only: –; weak only: –; leaders strong The Caldera Wyrm 20, weak The Caldera Wyrm 20
- **m11** strong only: –; weak only: –; leaders strong Pride Queen 20, weak Pride Queen 20
- **me** strong only: –; weak only: Gale Swift (0% / 70%); leaders strong Pride Queen 20, weak Pride Queen 20
- **mx** strong only: Bramble Hoglet (100% / 5%); weak only: Ember Jackal (0% / 35%); leaders strong Pride Queen 20, weak Pride Queen 20
