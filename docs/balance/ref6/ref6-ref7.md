# REF6: how strong are the 100 reference players' decks? (ref7, 2026-11-14)

Each map's 100 simulated players (seeds ref6-1 .. ref6-100, `docs/balance/ref6/ladder-100.json`), each deck against every road fight of its map (seeds 5300 + 37g): at least 16 games a deck, and players who share a deck share its games, so a deck plays 160 x the share of players holding it when that is more (every fight gets at least 160 games). A deck's **strength** = its mean win rate over the map's road fights. "True SD" takes the game noise out (16 games leave about ±13 points of noise per deck per fight). Made by `node tools/ref6/measure.js --tag ref7`.

## Variance in strength of the different decks

| Map | Name | mean | SD (true) | p10 – p90 | min – max | weakest fight (mean) | distinct decks |
|---|---|---|---|---|---|---|---|
| m1 (0) | Bramblewood Outskirts | 84.8 | 0 (0) | 84.8 – 84.8 | 84.8 – 84.8 | 0-4 (53.1) | 1 |
| mo (0 side) | The Old Bramble | 32.3 | 4.3 (2.2) | 29.1 – 39.1 | 26.6 – 43.8 | 0-B-4 (8.8) | 8 |
| mf (1) | Thistlewood | 82 | 0 (0) | 82 – 82 | 82 – 82 | 1-5 (45.6) | 1 |
| mq (1 side) | Clovermead | 95.5 | 0.6 (0) | 95.2 – 95.6 | 95.2 – 97.5 | 1-A-2 (93.3) | 5 |
| mb (2) | Pebble Beach | 53.2 | 0 (0) | 53.3 – 53.3 | 53.3 – 53.3 | 2-5 (40) | 1 |
| mg (2 side) | Smugglers' Grotto | 72.5 | 0 (0) | 72.5 – 72.5 | 72.5 – 72.5 | 2-B-4 (35.6) | 1 |
| mp (2 side) | Lilypad Reach | 98.3 | 0.2 (0) | 97.9 – 98.3 | 97.9 – 99.1 | 2-A-4 (91) | 4 |
| mc (3) | Gannet Cliffs | 98.2 | 0.3 (0.3) | 98.2 – 98.2 | 98.2 – 100 | 3-7 (93.8) | 2 |
| m2 (4) | Sunken Hollow | 86.4 | 0 (0) | 86.4 – 86.4 | 86.4 – 86.4 | 4-5 (55) | 1 |
| mw (5) | Gatorback Swamp | 98.4 | 1 (0) | 97.2 – 99.1 | 96.4 – 100 | 5-7 (91.9) | 50 |
| ms (5 side) | The Sunken Grove | 89.2 | 1.5 (0) | 89 – 90.6 | 82.8 – 96.9 | 5-A-4 (70.9) | 14 |
| m8 (6) | Sable Swampmire | 98.5 | 0 (0) | 98.5 – 98.5 | 98.5 – 98.5 | 6-5 (92.5) | 1 |
| mu (7) | The Morel Hollow | 85.9 | 0 (0) | 85.9 – 85.9 | 85.9 – 85.9 | 7-6 (65) | 1 |
| mz (7 side) | The Mycelium Deep | 92.6 | 1.5 (0) | 88.9 – 93.4 | 88.9 – 93.4 | 7-A-5 (82.9) | 4 |
| m4 (8) | Caves & Alcoves | 93.4 | 0 (0) | 93.4 – 93.4 | 93.4 – 93.4 | 8-8 (71.2) | 1 |
| mn (8 side) | The Glimmer Depths | 43.9 | 0.6 (0) | 43.8 – 43.8 | 43.8 – 50 | 8-A-4 (7.5) | 3 |
| mk (9) | The Kelp Mangroves | 93.4 | 0.8 (0.7) | 93.6 – 93.6 | 89.3 – 93.6 | 9-7 (68.3) | 2 |
| m7 (10) | Coral Current | 93.9 | 0 (0) | 93.9 – 93.9 | 93.9 – 93.9 | 10-6 (78.7) | 1 |
| mj (10 side) | The Sunken Depths | 93.8 | 2.5 (1.9) | 93.1 – 97 | 77.5 – 98.8 | 10-A-5 (85) | 13 |
| m10 (11) | Eyrie Heights | 65.5 | 2.5 (1.2) | 63.9 – 66.9 | 62.5 – 76.3 | 11-7 (39.1) | 13 |
| mv (11 side) | The Aerie Vault | 77 | 2.5 (1.8) | 75.6 – 81.5 | 75.6 – 82.8 | 11-A-4 (56.2) | 6 |
| mh (12) | The Briar Maze | 80.7 | 2.3 (1.5) | 79.5 – 81.3 | 77.7 – 92 | 12-7 (49.3) | 12 |
| mr (13) | The Redwood Deep | 89.3 | 1.3 (0.8) | 89.2 – 89.2 | 85.9 – 96.1 | 13-4 (68.9) | 5 |
| m5 (14) | Savanna Reaches | 85.9 | 1.4 (0.7) | 83.6 – 86.3 | 80.5 – 88.3 | 14-8 (48.8) | 5 |
| my (14 side) | The Canopy | 87.5 | 1.5 (0.6) | 86 – 88.2 | 86 – 92.5 | 14-A-5 (72.6) | 4 |
| ml (15) | The Long Grass | 83.8 | 2.5 (0.9) | 81.3 – 86.4 | 75.9 – 86.4 | 15-6 (60.1) | 11 |
| mt (16) | The Pinewood Taiga | 52.9 | 2.3 (0) | 50.6 – 55 | 48.2 – 57.1 | 16-7 (28.7) | 9 |
| m6 (17) | Wolfsbane Tundra | 73.6 | 2 (1.4) | 72.7 – 76.6 | 72.7 – 79.7 | 17-8 (40) | 4 |
| mi (17 side) | The Ice Hollow | 35.8 | 3.2 (2.2) | 33.8 – 40.6 | 32.8 – 45.3 | 17-A-4 (24.6) | 4 |
| md (18) | The Glass Dunes | 51.8 | 3.9 (1.6) | 47.8 – 57.1 | 43.8 – 62.5 | 18-7 (29.1) | 25 |
| mpd (18 side) | The Pale Desert | 68.6 | 5.6 (5.1) | 65.3 – 73.5 | 45.1 – 73.5 | 18-A-9 (22.6) | 13 |
| m3 (19) | Ashen Spurn | 72.5 | 3.5 (0) | 68.8 – 78.1 | 66.7 – 81.3 | 19-5 (45.6) | 29 |
| m9 (19 side) | Basalt Foundry | 66.1 | 1.3 (0) | 64.1 – 67.2 | 64.1 – 71.3 | 19-A-9 (19.7) | 6 |
| m11 (20) | The Sundered Peak | 55.3 | 5.7 (4.6) | 48.3 – 61.9 | 47.5 – 65.6 | 20-10 (19.3) | 33 |
| me (20 side) | Eye of the Volcano | 82.3 | 3.6 (1.5) | 78.4 – 86.5 | 70.5 – 88.4 | 20-A-3 (69) | 32 |
| mx (20 side) | Volcano Lair | 66.9 | 1.5 (0.7) | 66.6 – 66.6 | 65.6 – 73.4 | 20-B-4 (25.5) | 3 |

Median true SD 0 points; widest mpd 5.1, m11 4.6, mo 2.2.

## Main maps, per road fight

Mean over the 100 decks, p10 – p90 (game noise taken out), the road-curve target, the Map reference and Reference-2.

| Fight | kind | Ref 100 mean | p10 – p90 (est.) | target | Map ref | Ref-2 |
|---|---|---|---|---|---|---|
| 0-1 | skirmish | 96.9 | 96.9 – 96.9 | 90 (82–98) | 87.5 | 96.9 |
| 0-2 | skirmish | 92.5 | 92.5 – 92.5 | 75 (67–83) | 71.9 | 100 |
| 0-3 | skirmish | 96.9 | 96.9 – 96.9 | 60 (52–68) | 75 | 100 |
| 0-4 | skirmish | 53.1 | 53.1 – 53.1 | 45 (30–49) | 53.1 | 100 |
| 1-1 | skirmish | 96.3 | 96.2 – 96.2 | 90 (82–98) | 81.3 | 96.9 |
| 1-2 | skirmish | 89.4 | 89.4 – 89.4 | 80 (72–88) | 84.4 | 93.8 |
| 1-3 | skirmish | 90 | 90 – 90 | 85 (77–93) | 93.8 | 100 |
| 1-4 | skirmish | 88.8 | 88.7 – 88.7 | 80 (72–88) | 84.4 | 100 |
| 1-5 | elite | 45.6 | 45.6 – 45.6 | 40 (30–49) | 40.6 | 96.9 |
| 2-1 | skirmish | 70.6 | 70.6 – 70.6 | 90 (82–98) | 53.1 | 81.3 |
| 2-2 | skirmish | 66.3 | 66.2 – 66.2 | 80 (72–88) | 56.3 | 90.6 |
| 2-3 | skirmish | 42.5 | 42.5 – 42.5 | 70 (62–78) | 78.1 | 100 |
| 2-4 | skirmish | 46.9 | 46.9 – 46.9 | 60 (52–68) | 65.6 | 62.5 |
| 2-5 | elite | 40 | 40 – 40 | 40 (30–49) | 46.9 | 62.5 |
| 3-1 | skirmish | 99.4 | 99.4 – 99.4 | 90 (82–98) | 90.6 | 96.9 |
| 3-2 | skirmish | 98.1 | 98.1 – 98.1 | 84 (76–92) | 71.9 | 96.9 |
| 3-3 | skirmish | 98.8 | 98.7 – 98.7 | 78 (70–86) | 71.9 | 100 |
| 3-4 | skirmish | 100 | 100 – 100 | 72 (64–80) | 68.8 | 100 |
| 3-5 | elite | 98.1 | 98.1 – 98.1 | 66 (58–74) | 65.6 | 100 |
| 3-6 | elite | 99.4 | 99.4 – 99.4 | 60 (52–68) | 53.1 | 100 |
| 3-7 | elite | 93.8 | 93.6 – 93.6 | 40 (30–49) | 28.1 | 93.8 |
| 4-1 | skirmish | 93.1 | 93.1 – 93.1 | 90 (82–98) | 71.9 | 100 |
| 4-2 | skirmish | 99.4 | 99.4 – 99.4 | 80 (72–88) | 84.4 | 100 |
| 4-3 | elite | 94.4 | 94.4 – 94.4 | 70 (62–78) | 56.3 | 81.3 |
| 4-4 | elite | 90 | 90 – 90 | 60 (52–68) | 62.5 | 93.8 |
| 4-5 | elite | 55 | 55 – 55 | 40 (30–49) | 15.6 | 56.3 |
| 5-1 | skirmish | 100 | 100 – 100 | 90 (82–98) | 90.6 | 100 |
| 5-2 | skirmish | 100 | 100 – 100 | 84 (76–92) | 84.4 | 100 |
| 5-3 | skirmish | 100 | 100 – 100 | 78 (70–86) | 65.6 | 96.9 |
| 5-4 | skirmish | 99.9 | 99.9 – 99.9 | 72 (64–80) | 68.8 | 96.9 |
| 5-5 | elite | 97 | 97 – 97 | 66 (58–74) | 65.6 | 93.8 |
| 5-6 | elite | 100 | 100 – 100 | 60 (52–68) | 59.4 | 100 |
| 5-7 | boss | 91.9 | 91.9 – 91.9 | 40 (30–49) | 53.1 | 100 |
| 6-1 | skirmish | 100 | 100 – 100 | 90 (82–98) | 90.6 | 100 |
| 6-2 | skirmish | 100 | 100 – 100 | 85 (77–93) | 65.6 | 100 |
| 6-3 | skirmish | 100 | 100 – 100 | 80 (72–88) | 87.5 | 100 |
| 6-4 | skirmish | 99.4 | 99.4 – 99.4 | 75 (67–83) | 71.9 | 96.9 |
| 6-5 | elite | 92.5 | 92.5 – 92.5 | 70 (62–78) | 68.8 | 96.9 |
| 6-6 | elite | 99.4 | 99.4 – 99.4 | 65 (57–73) | 43.8 | 100 |
| 6-7 | elite | 100 | 100 – 100 | 60 (52–68) | 62.5 | 100 |
| 6-8 | miniboss | 96.9 | 96.9 – 96.9 | 40 (30–49) | 31.3 | 87.5 |
| 7-1 | skirmish | 98.1 | 98.1 – 98.1 | 90 (82–98) | 96.9 | 100 |
| 7-2 | skirmish | 92.5 | 92.5 – 92.5 | 82.5 (74.5–90.5) | 78.1 | 100 |
| 7-3 | skirmish | 87.5 | 87.5 – 87.5 | 75 (67–83) | 81.3 | 100 |
| 7-4 | skirmish | 78.1 | 78.1 – 78.1 | 67.5 (59.5–75.5) | 62.5 | 93.8 |
| 7-5 | elite | 94.4 | 94.4 – 94.4 | 60 (52–68) | 59.4 | 93.8 |
| 7-6 | miniboss | 65 | 65 – 65 | 40 (30–49) | 40.6 | 62.5 |
| 8-1 | skirmish | 100 | 100 – 100 | 90 (82–98) | 90.6 | 100 |
| 8-2 | skirmish | 99.4 | 99.4 – 99.4 | 85 (77–93) | 78.1 | 100 |
| 8-3 | skirmish | 98.1 | 98.1 – 98.1 | 80 (72–88) | 78.1 | 96.9 |
| 8-4 | skirmish | 98.7 | 98.8 – 98.8 | 75 (67–83) | 71.9 | 100 |
| 8-5 | skirmish | 87.5 | 87.5 – 87.5 | 70 (62–78) | 40.6 | 96.9 |
| 8-6 | skirmish | 93.8 | 93.8 – 93.8 | 65 (57–73) | 71.9 | 100 |
| 8-7 | elite | 98.1 | 98.1 – 98.1 | 60 (52–68) | 53.1 | 100 |
| 8-8 | miniboss | 71.2 | 71.3 – 71.3 | 40 (30–49) | 34.4 | 84.4 |
| 9-1 | skirmish | 100 | 100 – 100 | 90 (82–98) | 81.3 | 100 |
| 9-2 | skirmish | 99.4 | 99.4 – 99.4 | 84 (76–92) | 75 | 100 |
| 9-3 | skirmish | 100 | 100 – 100 | 78 (70–86) | 65.6 | 100 |
| 9-4 | skirmish | 96.9 | 96.8 – 96.8 | 72 (64–80) | 59.4 | 100 |
| 9-5 | elite | 96.9 | 96.8 – 96.8 | 66 (58–74) | 65.6 | 96.9 |
| 9-6 | elite | 92.5 | 93.4 – 93.4 | 60 (52–68) | 59.4 | 87.5 |
| 9-7 | miniboss | 68.3 | 68.3 – 68.3 | 40 (30–49) | 46.9 | 100 |
| 10-1 | skirmish | 95.6 | 95.6 – 95.6 | 90 (82–98) | 81.3 | 96.9 |
| 10-2 | skirmish | 98.7 | 98.8 – 98.8 | 85.7 (77.7–93.7) | 87.5 | 100 |
| 10-3 | skirmish | 98.7 | 98.8 – 98.8 | 81.4 (73.4–89.4) | 78.1 | 100 |
| 10-4 | skirmish | 97.5 | 97.5 – 97.5 | 77.1 (69.1–85.1) | 71.9 | 96.9 |
| 10-5 | skirmish | 96.9 | 96.9 – 96.9 | 72.9 (64.9–80.9) | 81.3 | 100 |
| 10-6 | elite | 78.7 | 78.8 – 78.8 | 68.6 (60.6–76.6) | 56.3 | 90.6 |
| 10-7 | elite | 97.5 | 97.5 – 97.5 | 64.3 (56.3–72.3) | 65.6 | 100 |
| 10-8 | elite | 95 | 95 – 95 | 60 (52–68) | 71.9 | 90.6 |
| 10-9 | boss | 86.2 | 86.3 – 86.3 | 40 (30–49) | 34.4 | 84.4 |
| 11-1 | skirmish | 94.1 | 94.1 – 94.1 | 90 (82–98) | 96.9 | 100 |
| 11-2 | skirmish | 70.7 | 70.7 – 70.7 | 86.3 (78.3–94.3) | 75 | 96.9 |
| 11-3 | skirmish | 66.2 | 59.9 – 78.4 | 82.5 (74.5–90.5) | 78.1 | 100 |
| 11-4 | skirmish | 68 | 68 – 68 | 78.8 (70.8–86.8) | 68.8 | 96.9 |
| 11-5 | elite | 57.5 | 57 – 58.3 | 75 (67–83) | 78.1 | 90.6 |
| 11-6 | elite | 56.8 | 50.4 – 59.6 | 71.3 (63.3–79.3) | 71.9 | 96.9 |
| 11-7 | elite | 39.1 | 39.1 – 39.1 | 67.5 (59.5–75.5) | 78.1 | 100 |
| 11-8 | elite | 64.4 | 62.9 – 66.9 | 63.8 (55.8–71.8) | 53.1 | 93.8 |
| 11-9 | elite | 74.2 | 74.2 – 74.2 | 60 (52–68) | 81.3 | 100 |
| 11-10 | miniboss | 63.9 | 61.9 – 67.9 | 40 (30–49) | 37.5 | 71.9 |
| 12-1 | skirmish | 90.5 | 90.5 – 90.5 | 90 (82–98) | 78.1 | 96.9 |
| 12-2 | skirmish | 93 | 91.3 – 99.4 | 84 (76–92) | 75 | 100 |
| 12-3 | skirmish | 84 | 84 – 84 | 78 (70–86) | 68.8 | 96.9 |
| 12-4 | skirmish | 94 | 94 – 94 | 72 (64–80) | 84.4 | 100 |
| 12-5 | elite | 64.4 | 54.6 – 65 | 66 (58–74) | 68.8 | 100 |
| 12-6 | elite | 89.4 | 89.4 – 89.4 | 60 (52–68) | 65.6 | 100 |
| 12-7 | miniboss | 49.3 | 49.3 – 49.3 | 40 (30–49) | 62.5 | 100 |
| 13-1 | skirmish | 99.4 | 99.4 – 99.4 | 90 (82–98) | 90.6 | 100 |
| 13-2 | skirmish | 84.6 | 84.6 – 84.6 | 85 (77–93) | 90.6 | 96.9 |
| 13-3 | skirmish | 91.4 | 91.4 – 91.4 | 80 (72–88) | 93.8 | 100 |
| 13-4 | skirmish | 68.9 | 68.9 – 68.9 | 75 (67–83) | 84.4 | 93.8 |
| 13-5 | elite | 95.6 | 94.9 – 99.7 | 70 (62–78) | 78.1 | 100 |
| 13-6 | elite | 94.9 | 94.9 – 94.9 | 65 (57–73) | 93.8 | 100 |
| 13-7 | elite | 92.9 | 92.9 – 92.9 | 60 (52–68) | 56.3 | 100 |
| 13-8 | miniboss | 86.7 | 86.7 – 86.7 | 40 (30–49) | 71.9 | 100 |
| 14-1 | skirmish | 99.4 | 99.4 – 99.4 | 90 (82–98) | 81.3 | 100 |
| 14-2 | skirmish | 95.3 | 95.3 – 95.3 | 85 (77–93) | 78.1 | 100 |
| 14-3 | skirmish | 95.3 | 95.3 – 95.3 | 80 (72–88) | 84.4 | 100 |
| 14-4 | skirmish | 95.2 | 95.2 – 95.2 | 75 (67–83) | 75 | 93.8 |
| 14-5 | elite | 79.7 | 79.7 – 79.7 | 70 (62–78) | 65.6 | 87.5 |
| 14-6 | elite | 83.3 | 83.3 – 83.3 | 65 (57–73) | 59.4 | 87.5 |
| 14-7 | elite | 90.5 | 90.5 – 90.5 | 60 (52–68) | 59.4 | 96.9 |
| 14-8 | miniboss | 48.8 | 48.8 – 48.8 | 40 (30–49) | 31.3 | 56.3 |
| 15-1 | skirmish | 94.5 | 94.5 – 94.5 | 90 (82–98) | 96.9 | 100 |
| 15-2 | skirmish | 95.8 | 95.8 – 95.8 | 84 (76–92) | 93.8 | 90.6 |
| 15-3 | skirmish | 96.1 | 94.5 – 97.5 | 78 (70–86) | 93.8 | 84.4 |
| 15-4 | skirmish | 91.5 | 91.5 – 91.5 | 72 (64–80) | 71.9 | 56.3 |
| 15-5 | elite | 83.8 | 83.8 – 83.8 | 66 (58–74) | 71.9 | 96.9 |
| 15-6 | elite | 60.1 | 47.5 – 69.7 | 60 (52–68) | 50 | 90.6 |
| 15-7 | boss | 64.8 | 61.9 – 69.3 | 40 (30–49) | 37.5 | 96.9 |
| 16-1 | skirmish | 82.6 | 79.1 – 86.7 | 90 (82–98) | 93.8 | 96.9 |
| 16-2 | skirmish | 69.6 | 69.6 – 69.6 | 84 (76–92) | 62.5 | 93.8 |
| 16-3 | skirmish | 40.1 | 40.1 – 40.1 | 78 (70–86) | 31.3 | 96.9 |
| 16-4 | skirmish | 44.5 | 44.5 – 44.5 | 72 (64–80) | 46.9 | 78.1 |
| 16-5 | elite | 73.7 | 73.7 – 73.7 | 66 (58–74) | 81.3 | 96.9 |
| 16-6 | elite | 31.4 | 31.4 – 31.4 | 60 (52–68) | 40.6 | 100 |
| 16-7 | miniboss | 28.7 | 28.7 – 28.7 | 40 (30–49) | 34.4 | 96.9 |
| 17-1 | skirmish | 98.1 | 97.9 – 99.1 | 90 (82–98) | 90.6 | 100 |
| 17-2 | skirmish | 87.9 | 87.9 – 87.9 | 85 (77–93) | 90.6 | 100 |
| 17-3 | skirmish | 63.2 | 63.2 – 63.2 | 80 (72–88) | 84.4 | 100 |
| 17-4 | skirmish | 90.8 | 90.6 – 90.6 | 75 (67–83) | 50 | 100 |
| 17-5 | elite | 72.2 | 72 – 72.7 | 70 (62–78) | 65.6 | 90.6 |
| 17-6 | elite | 71.6 | 71.6 – 71.6 | 65 (57–73) | 65.6 | 96.9 |
| 17-7 | elite | 65 | 65 – 65 | 60 (52–68) | 56.3 | 100 |
| 17-8 | miniboss | 40 | 37.9 – 50.8 | 40 (30–49) | 3.1 | 53.1 |
| 18-1 | skirmish | 82.7 | 82.2 – 83.1 | 90 (82–98) | 84.4 | 96.9 |
| 18-2 | skirmish | 80.3 | 67.8 – 89.7 | 84 (76–92) | 78.1 | 96.9 |
| 18-3 | skirmish | 41 | 36.1 – 47.7 | 78 (70–86) | 75 | 71.9 |
| 18-4 | skirmish | 46.5 | 46.5 – 46.5 | 72 (64–80) | 59.4 | 71.9 |
| 18-5 | elite | 48.1 | 48.1 – 48.1 | 66 (58–74) | 59.4 | 78.1 |
| 18-6 | elite | 34.9 | 34.9 – 34.9 | 60 (52–68) | 59.4 | 56.3 |
| 18-7 | miniboss | 29.1 | 29.1 – 29.1 | 40 (30–49) | 34.4 | 40.6 |
| 19-1 | skirmish | 77.5 | 77.5 – 77.5 | 90 (82–98) | 90.6 | 84.4 |
| 19-2 | skirmish | 90.5 | 89 – 92.7 | 82.5 (74.5–90.5) | 84.4 | 100 |
| 19-3 | elite | 76.4 | 76.4 – 76.4 | 75 (67–83) | 68.8 | 87.5 |
| 19-4 | elite | 80.4 | 80.4 – 80.4 | 67.5 (59.5–75.5) | 71.9 | 78.1 |
| 19-5 | elite | 45.6 | 45.6 – 45.6 | 60 (52–68) | 34.4 | 43.8 |
| 19-6 | miniboss | 64.7 | 64.7 – 64.7 | 40 (30–49) | 43.8 | 93.8 |
| 20-1 | skirmish | 73.8 | 67 – 79.1 | 90 (82–98) | 90.6 | 78.1 |
| 20-2 | skirmish | 79.8 | 71.8 – 85.4 | 85.7 (77.7–93.7) | 96.9 | 100 |
| 20-3 | skirmish | 60.6 | 60.6 – 60.6 | 81.4 (73.4–89.4) | 90.6 | 90.6 |
| 20-4 | skirmish | 43.9 | 40.6 – 48.8 | 77.1 (69.1–85.1) | 75 | 75 |
| 20-5 | elite | 44.6 | 44.6 – 44.6 | 72.9 (64.9–80.9) | 78.1 | 96.9 |
| 20-6 | elite | 52.7 | 52.7 – 52.7 | 68.6 (60.6–76.6) | 90.6 | 84.4 |
| 20-7 | elite | 43.9 | 35.1 – 52.5 | 64.3 (56.3–72.3) | 71.9 | 81.3 |
| 20-8 | elite | 45.5 | 45.5 – 45.5 | 60 (52–68) | 65.6 | 75 |
| 20-9 | boss | 88.8 | 88.8 – 88.8 | 50 (42–58) | 100 | 100 |
| 20-10 | worldboss | 19.3 | 19.3 – 19.3 | 40 (30–49) | 46.9 | 81.3 |

## What the strongest and weakest fifth have in common

- **m1** strong only: –; weak only: –; leaders strong Wandering Traveller 20, weak Wandering Traveller 20
- **mo** strong only: –; weak only: –; leaders strong The Caldera Wyrm 20, weak The Caldera Wyrm 20
- **mf** strong only: –; weak only: –; leaders strong Wandering Traveller 20, weak Wandering Traveller 20
- **mq** strong only: –; weak only: –; leaders strong The Old Shell 20, weak The Old Shell 20
- **mb** strong only: –; weak only: –; leaders strong Wandering Traveller 20, weak Wandering Traveller 20
- **mg** strong only: –; weak only: –; leaders strong The Old Shell 20, weak The Old Shell 20
- **mp** strong only: –; weak only: Duck Paddler (10% / 95%); leaders strong The Old Shell 20, weak The Old Shell 20
- **mc** strong only: –; weak only: –; leaders strong The Old Shell 20, weak The Old Shell 20
- **m2** strong only: –; weak only: –; leaders strong The Old Shell 20, weak The Old Shell 20
- **mw** strong only: Planarian Splitter (100% / 0%); weak only: Muskrat Reedgatherer (50% / 100%); leaders strong The Old Shell 20, weak The Old Shell 20
- **ms** strong only: –; weak only: –; leaders strong The Old Shell 20, weak The Old Shell 20
- **m8** strong only: –; weak only: –; leaders strong The Old Shell 20, weak The Old Shell 20
- **mu** strong only: –; weak only: –; leaders strong The Old Shell 20, weak The Old Shell 20
- **mz** strong only: –; weak only: –; leaders strong The Old Shell 20, weak The Old Shell 20
- **m4** strong only: –; weak only: –; leaders strong The Old Shell 20, weak The Old Shell 20
- **mn** strong only: –; weak only: –; leaders strong Pride Queen 20, weak Pride Queen 20
- **mk** strong only: –; weak only: –; leaders strong The Old Shell 20, weak The Old Shell 20
- **m7** strong only: –; weak only: –; leaders strong The Old Shell 20, weak The Old Shell 20
- **mj** strong only: –; weak only: –; leaders strong The Old Shell 20, weak The Old Shell 20
- **m10** strong only: Eagle Sharpshooter (70% / 5%); weak only: –; leaders strong The Old Shell 20, weak The Old Shell 20
- **mv** strong only: –; weak only: –; leaders strong Pride Queen 20, weak Pride Queen 20
- **mh** strong only: –; weak only: –; leaders strong The Old Shell 20, weak The Old Shell 20
- **mr** strong only: Beaver Feller (35% / 0%); weak only: Lyrebird Mimic (65% / 100%); leaders strong The Old Shell 20, weak The Old Shell 20
- **m5** strong only: –; weak only: Dust Hyena (0% / 40%); leaders strong The Old Shell 20, weak The Old Shell 20
- **my** strong only: –; weak only: –; leaders strong Pride Queen 20, weak Pride Queen 20
- **ml** strong only: –; weak only: Dust Hyena (35% / 75%), Mallard Marauder (0% / 35%); leaders strong Pride Queen 20, weak Pride Queen 20
- **mt** strong only: Robin Redbreast (75% / 0%); weak only: Upside-Down Bat (15% / 90%); leaders strong Pride Queen 20, weak Pride Queen 20
- **m6** strong only: –; weak only: Soldier Ant (15% / 100%); leaders strong Pride Queen 20, weak Pride Queen 20
- **mi** strong only: –; weak only: Bee Drone (5% / 80%); leaders strong The Caldera Wyrm 20, weak The Caldera Wyrm 20
- **md** strong only: Horned Lizard (50% / 0%); weak only: –; leaders strong Pride Queen 20, weak Pride Queen 20
- **mpd** strong only: Tide Seahorse (100% / 55%); weak only: –; leaders strong Pride Queen 20, weak Pride Queen 20
- **m3** strong only: Smokescreen Raccoon (60% / 10%); weak only: Polar Bear (0% / 65%); leaders strong Pride Queen 20, weak Pride Queen 20
- **m9** strong only: Cinder Hornet (90% / 0%); weak only: –; leaders strong The Caldera Wyrm 20, weak The Caldera Wyrm 20
- **m11** strong only: Upside-Down Bat (95% / 0%); weak only: –; leaders strong Pride Queen 20, weak Pride Queen 20
- **me** strong only: Tide Seahorse (100% / 15%), Fire Salamander (100% / 50%); weak only: Carrion Beetle (0% / 55%); leaders strong Pride Queen 20, weak Pride Queen 20
- **mx** strong only: –; weak only: –; leaders strong Pride Queen 20, weak Pride Queen 20
