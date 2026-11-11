# REF6: how strong are the 100 reference players' decks? (post-skir2, 2026-11-11)

Each map's 100 simulated players (seeds ref6-1 .. ref6-100, `docs/balance/ref6/ladder-100.json`), each deck against every road fight of its map (seeds 5300 + 37g): at least 16 games a deck, and players who share a deck share its games, so a deck plays 160 x the share of players holding it when that is more (every fight gets at least 160 games). A deck's **strength** = its mean win rate over the map's road fights. "True SD" takes the game noise out (16 games leave about ±13 points of noise per deck per fight). Made by `node tools/ref6/measure.js --tag post-skir2`.

## Variance in strength of the different decks

| Map | Name | mean | SD (true) | p10 – p90 | min – max | weakest fight (mean) | distinct decks |
|---|---|---|---|---|---|---|---|
| m1 (0) | Bramblewood Outskirts | 86.9 | 0 (0) | 86.9 – 86.9 | 86.9 – 86.9 | 0-4 (61.2) | 1 |
| mo (0 side) | The Old Bramble | 35.4 | 4 (3) | 28.1 – 39.5 | 26.6 – 43.8 | 0-B-4 (4.5) | 10 |
| mf (1) | Thistlewood | 63.3 | 0 (0) | 63.2 – 63.2 | 63.2 – 63.2 | 1-5 (18.8) | 1 |
| mq (1 side) | Clovermead | 93.6 | 0.8 (0.4) | 93.8 – 93.8 | 88.8 – 93.8 | 1-A-5 (88.2) | 4 |
| mb (2) | Pebble Beach | 55.5 | 1.2 (0) | 54.2 – 56.5 | 54.2 – 56.5 | 2-4 (36.7) | 2 |
| mg (2 side) | Smugglers' Grotto | 76.1 | 0 (0) | 76.1 – 76.1 | 76.1 – 76.1 | 2-B-3 (60.6) | 1 |
| mp (2 side) | Lilypad Reach | 94.4 | 0 (0) | 94.4 – 94.4 | 94.4 – 94.4 | 2-A-5 (85.6) | 1 |
| mc (3) | Gannet Cliffs | 92.8 | 2.1 (1.4) | 89.3 – 94.6 | 86.6 – 96.4 | 3-7 (79.9) | 15 |
| m2 (4) | Sunken Hollow | 79.6 | 3.6 (3.3) | 79.6 – 80.8 | 68.8 – 80.8 | 4-5 (52.4) | 3 |
| mw (5) | Gatorback Swamp | 92.4 | 2.2 (0.8) | 89.3 – 94.6 | 86.6 – 96.4 | 5-7 (73) | 13 |
| ms (5 side) | The Sunken Grove | 96.4 | 0.8 (0) | 96.1 – 97.2 | 90.6 – 97.2 | 5-A-2 (91.6) | 4 |
| m8 (6) | Sable Swampmire | 95.5 | 0 (0) | 95.5 – 95.5 | 95.5 – 95.5 | 6-5 (75) | 1 |
| mu (7) | The Morel Hollow | 88.2 | 0 (0) | 88.2 – 88.2 | 88.2 – 88.2 | 7-6 (78.1) | 1 |
| mz (7 side) | The Mycelium Deep | 97.5 | 0.2 (0) | 97.3 – 97.7 | 97.3 – 97.7 | 7-A-4 (91.6) | 3 |
| m4 (8) | Caves & Alcoves | 92.1 | 0 (0) | 92.1 – 92.1 | 92.1 – 92.1 | 8-8 (70.6) | 1 |
| mn (8 side) | The Glimmer Depths | 60 | 0.5 (0) | 59.5 – 60.7 | 59.5 – 60.7 | 8-A-4 (31.5) | 3 |
| mk (9) | The Kelp Mangroves | 91.9 | 1.7 (1.1) | 90.3 – 94.6 | 90.3 – 95.5 | 9-7 (60) | 5 |
| m7 (10) | Coral Current | 71.3 | 3.3 (2.4) | 66.7 – 74.1 | 66 – 85.4 | 10-9 (52) | 13 |
| mj (10 side) | The Sunken Depths | 70.3 | 3.4 (2.9) | 68.6 – 75 | 57.5 – 78.8 | 10-A-4 (0.5) | 19 |
| m10 (11) | Eyrie Heights | 89.7 | 2.4 (1.3) | 86.7 – 93.2 | 86.7 – 93.8 | 11-7 (74.2) | 24 |
| mv (11 side) | The Aerie Vault | 73.5 | 3.8 (1.3) | 67.2 – 75 | 64.1 – 84.4 | 11-A-3 (61.5) | 26 |
| mh (12) | The Briar Maze | 93.2 | 2 (1.5) | 92.2 – 97.3 | 90.2 – 97.3 | 12-7 (81.6) | 15 |
| mr (13) | The Redwood Deep | 94.2 | 0.9 (0) | 93.7 – 95.3 | 90.6 – 96.9 | 13-8 (87.8) | 10 |
| m5 (14) | Savanna Reaches | 84.7 | 1.4 (0) | 84.6 – 85.9 | 80.5 – 91.4 | 14-8 (58.2) | 8 |
| my (14 side) | The Canopy | 96 | 1.3 (1) | 96.4 – 96.4 | 90 – 96.4 | 14-A-4 (85.6) | 4 |
| ml (15) | The Long Grass | 87.1 | 2.2 (1.5) | 83 – 89.5 | 80.4 – 89.5 | 15-7 (69.8) | 9 |
| mt (16) | The Pinewood Taiga | 58.5 | 1.8 (0) | 56.6 – 59.8 | 53.6 – 62.5 | 16-6 (7) | 10 |
| m6 (17) | Wolfsbane Tundra | 66.5 | 3 (2.4) | 65.9 – 70.3 | 57.8 – 75.8 | 17-8 (39.5) | 10 |
| mi (17 side) | The Ice Hollow | 46.3 | 3.7 (0) | 42 – 51.7 | 37.5 – 56.3 | 17-A-4 (17.5) | 35 |
| md (18) | The Glass Dunes | 61.5 | 5.8 (4.2) | 54.5 – 69.6 | 46.4 – 77.7 | 18-7 (27.3) | 38 |
| mpd (18 side) | The Pale Desert | 86.6 | 1.6 (0.3) | 85.7 – 89.6 | 85.7 – 91 | 18-A-9 (71.7) | 10 |
| m3 (19) | Ashen Spurn | 57.7 | 4.1 (1.6) | 54.2 – 61.5 | 44.8 – 64.6 | 19-6 (29.4) | 41 |
| m9 (19 side) | Basalt Foundry | 38.4 | 10.3 (9.9) | 27.2 – 50 | 22.5 – 62.5 | 19-A-10 (6.4) | 23 |
| m11 (20) | The Sundered Peak | 59.9 | 3.8 (2.2) | 54.9 – 64.2 | 52.5 – 66.3 | 20-10 (32.3) | 44 |
| me (20 side) | Eye of the Volcano | 81.9 | 3.7 (1.9) | 75.8 – 86.3 | 73.2 – 87.5 | 20-A-7 (59.6) | 49 |
| mx (20 side) | Volcano Lair | 65.7 | 3.2 (0) | 64.4 – 70.5 | 57.8 – 73.4 | 20-B-4 (36.3) | 11 |

Median true SD 0.4 points; widest m9 9.9, md 4.2, m2 3.3.

## Main maps, per road fight

Mean over the 100 decks, p10 – p90 (game noise taken out), the road-curve target, the Map reference and Reference-2.

| Fight | kind | Ref 100 mean | p10 – p90 (est.) | target | Map ref | Ref-2 |
|---|---|---|---|---|---|---|
| 0-1 | skirmish | 96.3 | 96.2 – 96.2 | 90 (82–98) | 87.5 | 96.9 |
| 0-2 | skirmish | 94.4 | 94.4 – 94.4 | 75 (67–83) | 71.9 | 100 |
| 0-3 | skirmish | 95.6 | 95.6 – 95.6 | 60 (52–68) | 75 | 100 |
| 0-4 | skirmish | 61.2 | 61.3 – 61.3 | 45 (30–49) | 62.5 | 100 |
| 1-1 | skirmish | 83.1 | 83.1 – 83.1 | 90 (82–98) | 90.6 | 100 |
| 1-2 | skirmish | 76.9 | 76.9 – 76.9 | 80 (72–88) | 81.3 | 100 |
| 1-3 | skirmish | 70 | 70 – 70 | 85 (77–93) | 87.5 | 100 |
| 1-4 | skirmish | 67.5 | 67.5 – 67.5 | 80 (72–88) | 78.1 | 96.9 |
| 1-5 | elite | 18.8 | 18.8 – 18.8 | 40 (30–49) | 40.6 | 96.9 |
| 2-1 | skirmish | 74.5 | 74.5 – 74.5 | 90 (82–98) | 71.9 | 90.6 |
| 2-2 | skirmish | 71.4 | 71.4 – 71.4 | 80 (72–88) | 56.3 | 90.6 |
| 2-3 | skirmish | 49.1 | 49.1 – 49.1 | 70 (62–78) | 68.8 | 100 |
| 2-4 | skirmish | 36.7 | 36.7 – 36.7 | 60 (52–68) | 65.6 | 93.8 |
| 2-5 | elite | 46 | 46 – 46 | 40 (30–49) | 46.9 | 71.9 |
| 3-1 | skirmish | 99.6 | 99.6 – 99.6 | 90 (82–98) | 87.5 | 100 |
| 3-2 | skirmish | 97.2 | 97.2 – 97.2 | 84 (76–92) | 71.9 | 96.9 |
| 3-3 | skirmish | 98.4 | 98.4 – 98.4 | 78 (70–86) | 71.9 | 100 |
| 3-4 | skirmish | 96.8 | 96.8 – 96.8 | 72 (64–80) | 78.1 | 93.8 |
| 3-5 | elite | 88.1 | 87.1 – 94.5 | 66 (58–74) | 59.4 | 87.5 |
| 3-6 | elite | 89.2 | 84.7 – 91.8 | 60 (52–68) | 65.6 | 100 |
| 3-7 | elite | 79.9 | 79.9 – 79.9 | 40 (30–49) | 28.1 | 93.8 |
| 4-1 | skirmish | 99.4 | 99.4 – 99.4 | 90 (82–98) | 90.6 | 100 |
| 4-2 | skirmish | 96.3 | 96.3 – 96.7 | 80 (72–88) | 81.3 | 100 |
| 4-3 | elite | 82 | 82.2 – 82.5 | 70 (62–78) | 59.4 | 90.6 |
| 4-4 | elite | 68.1 | 68.1 – 70.5 | 60 (52–68) | 62.5 | 93.8 |
| 4-5 | elite | 52.4 | 52.4 – 52.4 | 40 (30–49) | 34.4 | 68.8 |
| 5-1 | skirmish | 97.2 | 97.2 – 97.2 | 90 (82–98) | 90.6 | 100 |
| 5-2 | skirmish | 100 | 100 – 100 | 84 (76–92) | 90.6 | 100 |
| 5-3 | skirmish | 95.8 | 95.8 – 95.8 | 78 (70–86) | 71.9 | 100 |
| 5-4 | skirmish | 98.2 | 97.1 – 98.6 | 72 (64–80) | 68.8 | 96.9 |
| 5-5 | elite | 89.2 | 89.2 – 89.2 | 66 (58–74) | 68.8 | 100 |
| 5-6 | elite | 93.6 | 93.6 – 93.6 | 60 (52–68) | 59.4 | 100 |
| 5-7 | boss | 73 | 73 – 73 | 40 (30–49) | 37.5 | 96.9 |
| 6-1 | skirmish | 96.3 | 96.2 – 96.2 | 90 (82–98) | 93.8 | 100 |
| 6-2 | skirmish | 100 | 100 – 100 | 85 (77–93) | 84.4 | 100 |
| 6-3 | skirmish | 99.4 | 99.4 – 99.4 | 80 (72–88) | 84.4 | 100 |
| 6-4 | skirmish | 98.1 | 98.1 – 98.1 | 75 (67–83) | 78.1 | 100 |
| 6-5 | elite | 75 | 75 – 75 | 70 (62–78) | 62.5 | 90.6 |
| 6-6 | elite | 96.9 | 96.9 – 96.9 | 65 (57–73) | 59.4 | 100 |
| 6-7 | elite | 100 | 100 – 100 | 60 (52–68) | 53.1 | 96.9 |
| 6-8 | miniboss | 98.1 | 98.1 – 98.1 | 40 (30–49) | 40.6 | 100 |
| 7-1 | skirmish | 95 | 95 – 95 | 90 (82–98) | 93.8 | 93.8 |
| 7-2 | skirmish | 93.1 | 93.1 – 93.1 | 82.5 (74.5–90.5) | 84.4 | 96.9 |
| 7-3 | skirmish | 93.8 | 93.8 – 93.8 | 75 (67–83) | 90.6 | 96.9 |
| 7-4 | skirmish | 81.9 | 81.9 – 81.9 | 67.5 (59.5–75.5) | 50 | 96.9 |
| 7-5 | elite | 87.5 | 87.5 – 87.5 | 60 (52–68) | 68.8 | 96.9 |
| 7-6 | miniboss | 78.1 | 78.1 – 78.1 | 40 (30–49) | 28.1 | 62.5 |
| 8-1 | skirmish | 100 | 100 – 100 | 90 (82–98) | 87.5 | 100 |
| 8-2 | skirmish | 98.1 | 98.1 – 98.1 | 85 (77–93) | 46.9 | 100 |
| 8-3 | skirmish | 98.7 | 98.8 – 98.8 | 80 (72–88) | 68.8 | 96.9 |
| 8-4 | skirmish | 97.5 | 97.5 – 97.5 | 75 (67–83) | 71.9 | 93.8 |
| 8-5 | skirmish | 86.9 | 86.9 – 86.9 | 70 (62–78) | 59.4 | 93.8 |
| 8-6 | skirmish | 87.5 | 87.5 – 87.5 | 65 (57–73) | 62.5 | 100 |
| 8-7 | elite | 97.5 | 97.5 – 97.5 | 60 (52–68) | 34.4 | 100 |
| 8-8 | miniboss | 70.6 | 70.6 – 70.6 | 40 (30–49) | 34.4 | 84.4 |
| 9-1 | skirmish | 100 | 100 – 100 | 90 (82–98) | 84.4 | 100 |
| 9-2 | skirmish | 100 | 100 – 100 | 84 (76–92) | 78.1 | 100 |
| 9-3 | skirmish | 99.4 | 99.4 – 99.4 | 78 (70–86) | 78.1 | 100 |
| 9-4 | skirmish | 100 | 100 – 100 | 72 (64–80) | 59.4 | 100 |
| 9-5 | elite | 93.7 | 93.7 – 93.7 | 66 (58–74) | 62.5 | 90.6 |
| 9-6 | elite | 90 | 90 – 90 | 60 (52–68) | 56.3 | 93.8 |
| 9-7 | miniboss | 60 | 51.7 – 71.6 | 40 (30–49) | 43.8 | 96.9 |
| 10-1 | skirmish | 85 | 85 – 85 | 90 (82–98) | 81.3 | 93.8 |
| 10-2 | skirmish | 86.8 | 83.7 – 94.3 | 85.7 (77.7–93.7) | 87.5 | 100 |
| 10-3 | skirmish | 67.6 | 67.6 – 67.6 | 81.4 (73.4–89.4) | 78.1 | 100 |
| 10-4 | skirmish | 78 | 75.7 – 80.7 | 77.1 (69.1–85.1) | 81.3 | 93.8 |
| 10-5 | skirmish | 87.4 | 87.4 – 87.4 | 72.9 (64.9–80.9) | 65.6 | 100 |
| 10-6 | elite | 66.6 | 59.2 – 68.6 | 68.6 (60.6–76.6) | 56.3 | 96.9 |
| 10-7 | elite | 58.6 | 58.6 – 58.6 | 64.3 (56.3–72.3) | 71.9 | 93.8 |
| 10-8 | elite | 59.2 | 58.7 – 60.4 | 60 (52–68) | 53.1 | 100 |
| 10-9 | boss | 52 | 52 – 52 | 40 (30–49) | 40.6 | 84.4 |
| 11-1 | skirmish | 100 | 100 – 100 | 90 (82–98) | 96.9 | 100 |
| 11-2 | skirmish | 91.8 | 91.8 – 91.8 | 86.3 (78.3–94.3) | 75 | 96.9 |
| 11-3 | skirmish | 85.7 | 85.7 – 85.7 | 82.5 (74.5–90.5) | 78.1 | 100 |
| 11-4 | skirmish | 86.1 | 86.1 – 86.1 | 78.8 (70.8–86.8) | 68.8 | 96.9 |
| 11-5 | elite | 81 | 81 – 81 | 75 (67–83) | 87.5 | 93.8 |
| 11-6 | elite | 92.1 | 92.1 – 92.1 | 71.3 (63.3–79.3) | 68.8 | 96.9 |
| 11-7 | elite | 74.2 | 74.2 – 74.2 | 67.5 (59.5–75.5) | 78.1 | 100 |
| 11-8 | elite | 91.9 | 91.9 – 91.9 | 63.8 (55.8–71.8) | 53.1 | 93.8 |
| 11-9 | elite | 96.7 | 96.7 – 96.7 | 60 (52–68) | 71.9 | 96.9 |
| 11-10 | miniboss | 97.5 | 94.7 – 99 | 40 (30–49) | 34.4 | 87.5 |
| 12-1 | skirmish | 96.6 | 96.6 – 96.6 | 90 (82–98) | 81.3 | 100 |
| 12-2 | skirmish | 98 | 97.5 – 99.2 | 84 (76–92) | 84.4 | 100 |
| 12-3 | skirmish | 96.3 | 95.9 – 97.6 | 78 (70–86) | 62.5 | 100 |
| 12-4 | skirmish | 97.4 | 96.5 – 99.5 | 72 (64–80) | 78.1 | 100 |
| 12-5 | elite | 96 | 96 – 96 | 66 (58–74) | 62.5 | 96.9 |
| 12-6 | elite | 86.6 | 85 – 88.8 | 60 (52–68) | 65.6 | 100 |
| 12-7 | miniboss | 81.6 | 79.2 – 95 | 40 (30–49) | 50 | 96.9 |
| 13-1 | skirmish | 99.4 | 99.4 – 99.4 | 90 (82–98) | 93.8 | 100 |
| 13-2 | skirmish | 99.4 | 99.4 – 99.4 | 85 (77–93) | 84.4 | 100 |
| 13-3 | skirmish | 91.3 | 91.1 – 91.4 | 80 (72–88) | 90.6 | 100 |
| 13-4 | skirmish | 97.3 | 97.3 – 97.3 | 75 (67–83) | 59.4 | 96.9 |
| 13-5 | elite | 97.8 | 96.9 – 99.1 | 70 (62–78) | 53.1 | 96.9 |
| 13-6 | elite | 91.1 | 91.1 – 91.1 | 65 (57–73) | 62.5 | 96.9 |
| 13-7 | elite | 89.9 | 87.8 – 92.1 | 60 (52–68) | 62.5 | 93.8 |
| 13-8 | miniboss | 87.8 | 87.8 – 87.8 | 40 (30–49) | 50 | 100 |
| 14-1 | skirmish | 93.8 | 93.8 – 93.8 | 90 (82–98) | 78.1 | 100 |
| 14-2 | skirmish | 94.4 | 94.4 – 94.4 | 85 (77–93) | 84.4 | 100 |
| 14-3 | skirmish | 90.8 | 90.8 – 90.8 | 80 (72–88) | 68.8 | 96.9 |
| 14-4 | skirmish | 96.7 | 96.7 – 96.7 | 75 (67–83) | 75 | 96.9 |
| 14-5 | elite | 84.6 | 84.2 – 85.7 | 70 (62–78) | 75 | 96.9 |
| 14-6 | elite | 82.6 | 82.3 – 85 | 65 (57–73) | 68.8 | 96.9 |
| 14-7 | elite | 76.3 | 76.1 – 76.6 | 60 (52–68) | 68.8 | 93.8 |
| 14-8 | miniboss | 58.2 | 56.6 – 67.9 | 40 (30–49) | 46.9 | 81.3 |
| 15-1 | skirmish | 98.8 | 98.8 – 98.8 | 90 (82–98) | 90.6 | 100 |
| 15-2 | skirmish | 100 | 100 – 100 | 84 (76–92) | 87.5 | 87.5 |
| 15-3 | skirmish | 98.1 | 96.7 – 99.7 | 78 (70–86) | 90.6 | 71.9 |
| 15-4 | skirmish | 86.8 | 82.5 – 94.1 | 72 (64–80) | 87.5 | 100 |
| 15-5 | elite | 81 | 72.9 – 83.6 | 66 (58–74) | 71.9 | 100 |
| 15-6 | elite | 74.9 | 74.9 – 74.9 | 60 (52–68) | 56.3 | 93.8 |
| 15-7 | boss | 69.8 | 69.8 – 69.8 | 40 (30–49) | 50 | 100 |
| 16-1 | skirmish | 89.4 | 89.4 – 89.4 | 90 (82–98) | 87.5 | 96.9 |
| 16-2 | skirmish | 65.9 | 65.9 – 65.9 | 84 (76–92) | 81.3 | 96.9 |
| 16-3 | skirmish | 69.7 | 68.2 – 71.8 | 78 (70–86) | 56.3 | 96.9 |
| 16-4 | skirmish | 59.3 | 59.3 – 59.3 | 72 (64–80) | 62.5 | 96.9 |
| 16-5 | elite | 71.7 | 71.7 – 71.7 | 66 (58–74) | 46.9 | 78.1 |
| 16-6 | elite | 7 | 7 – 7 | 60 (52–68) | 56.3 | 100 |
| 16-7 | miniboss | 46.7 | 46.7 – 46.7 | 40 (30–49) | 56.3 | 93.8 |
| 17-1 | skirmish | 76.5 | 76.5 – 76.5 | 90 (82–98) | 90.6 | 96.9 |
| 17-2 | skirmish | 82.1 | 82.1 – 82.1 | 85 (77–93) | 90.6 | 100 |
| 17-3 | skirmish | 75.4 | 75.4 – 75.4 | 80 (72–88) | 71.9 | 96.9 |
| 17-4 | skirmish | 86.4 | 86.8 – 86.8 | 75 (67–83) | 53.1 | 93.8 |
| 17-5 | elite | 60.9 | 60.9 – 60.9 | 70 (62–78) | 53.1 | 71.9 |
| 17-6 | elite | 58.5 | 57.6 – 65.3 | 65 (57–73) | 59.4 | 93.8 |
| 17-7 | elite | 52.6 | 50.5 – 52.4 | 60 (52–68) | 50 | 93.8 |
| 17-8 | miniboss | 39.5 | 39.5 – 39.5 | 40 (30–49) | 12.5 | 53.1 |
| 18-1 | skirmish | 80.7 | 80.7 – 80.7 | 90 (82–98) | 75 | 90.6 |
| 18-2 | skirmish | 73.5 | 66.7 – 77 | 84 (76–92) | 84.4 | 90.6 |
| 18-3 | skirmish | 57.3 | 57.3 – 57.3 | 78 (70–86) | 78.1 | 78.1 |
| 18-4 | skirmish | 60.3 | 48.2 – 68.1 | 72 (64–80) | 75 | 59.4 |
| 18-5 | elite | 69.8 | 68.1 – 73.9 | 66 (58–74) | 78.1 | 87.5 |
| 18-6 | elite | 61.3 | 48.8 – 74.9 | 60 (52–68) | 71.9 | 78.1 |
| 18-7 | miniboss | 27.3 | 22.7 – 38.4 | 40 (30–49) | 43.8 | 37.5 |
| 19-1 | skirmish | 96.9 | 96.9 – 96.9 | 90 (82–98) | 93.8 | 100 |
| 19-2 | skirmish | 75.2 | 75.2 – 75.2 | 82.5 (74.5–90.5) | 78.1 | 78.1 |
| 19-3 | elite | 69.6 | 58.5 – 76.2 | 75 (67–83) | 81.3 | 90.6 |
| 19-4 | elite | 33 | 33 – 33 | 67.5 (59.5–75.5) | 62.5 | 43.8 |
| 19-5 | elite | 41.8 | 41.8 – 41.8 | 60 (52–68) | 53.1 | 78.1 |
| 19-6 | miniboss | 29.4 | 22 – 38.2 | 40 (30–49) | 53.1 | 34.4 |
| 20-1 | skirmish | 88.8 | 88.8 – 88.8 | 90 (82–98) | 93.8 | 96.9 |
| 20-2 | skirmish | 85.9 | 85.9 – 85.9 | 85.7 (77.7–93.7) | 90.6 | 100 |
| 20-3 | skirmish | 70.4 | 70.4 – 70.4 | 81.4 (73.4–89.4) | 84.4 | 90.6 |
| 20-4 | skirmish | 52.9 | 47.5 – 56.2 | 77.1 (69.1–85.1) | 78.1 | 81.3 |
| 20-5 | elite | 45.5 | 45.5 – 45.5 | 72.9 (64.9–80.9) | 75 | 90.6 |
| 20-6 | elite | 56.2 | 56.2 – 56.2 | 68.6 (60.6–76.6) | 81.3 | 96.9 |
| 20-7 | elite | 66.5 | 56.1 – 74.5 | 64.3 (56.3–72.3) | 71.9 | 93.8 |
| 20-8 | elite | 49.2 | 40.2 – 55.6 | 60 (52–68) | 53.1 | 100 |
| 20-9 | boss | 51.4 | 51.4 – 51.4 | 50 (42–58) | 71.9 | 90.6 |
| 20-10 | worldboss | 32.3 | 32.3 – 32.3 | 40 (30–49) | 43.8 | 87.5 |

## What the strongest and weakest fifth have in common

- **m1** strong only: –; weak only: –; leaders strong Wandering Traveller 20, weak Wandering Traveller 20
- **mo** strong only: Quill-Thorn Boar (100% / 10%); weak only: –; leaders strong The Caldera Wyrm 20, weak The Caldera Wyrm 20
- **mf** strong only: –; weak only: –; leaders strong Wandering Traveller 20, weak Wandering Traveller 20
- **mq** strong only: –; weak only: –; leaders strong The Old Shell 20, weak The Old Shell 20
- **mb** strong only: Duck Paddler (100% / 0%); weak only: Robin Redbreast (0% / 100%); leaders strong Wandering Traveller 20, weak Wandering Traveller 20
- **mg** strong only: –; weak only: –; leaders strong The Old Shell 20, weak The Old Shell 20
- **mp** strong only: –; weak only: –; leaders strong The Old Shell 20, weak The Old Shell 20
- **mc** strong only: Crimson Recruit (40% / 0%), Cormorant (30% / 0%); weak only: Chipmunk Cavalry (55% / 100%); leaders strong The Old Shell 20, weak The Old Shell 20
- **m2** strong only: –; weak only: –; leaders strong The Old Shell 20, weak The Old Shell 20
- **mw** strong only: –; weak only: Rabbit Kit (0% / 100%); leaders strong The Old Shell 20, weak The Old Shell 20
- **ms** strong only: Upside-Down Bat (100% / 5%); weak only: –; leaders strong The Old Shell 20, weak The Old Shell 20
- **m8** strong only: –; weak only: –; leaders strong The Old Shell 20, weak The Old Shell 20
- **mu** strong only: –; weak only: –; leaders strong The Old Shell 20, weak The Old Shell 20
- **mz** strong only: –; weak only: Fungus Gnat Cloud (0% / 100%); leaders strong The Old Shell 20, weak The Old Shell 20
- **m4** strong only: –; weak only: –; leaders strong The Old Shell 20, weak The Old Shell 20
- **mn** strong only: Upside-Down Bat (100% / 0%); weak only: Cave Olm (0% / 100%); leaders strong Pride Queen 20, weak Pride Queen 20
- **mk** strong only: Fleetfoot'd (100% / 0%); weak only: –; leaders strong The Old Shell 20, weak The Old Shell 20
- **m7** strong only: Giant Cave Huntsman (30% / 0%); weak only: –; leaders strong The Old Shell 20, weak The Old Shell 20
- **mj** strong only: Nautilus Drifter (70% / 0%); weak only: –; leaders strong The Old Shell 20, weak The Old Shell 20
- **m10** strong only: –; weak only: –; leaders strong The Old Shell 20, weak The Old Shell 20
- **mv** strong only: Stonedrop Vulture (100% / 70%); weak only: –; leaders strong Pride Queen 20, weak Pride Queen 20
- **mh** strong only: Dormouse (100% / 20%); weak only: –; leaders strong The Old Shell 20, weak The Old Shell 20
- **mr** strong only: Upside-Down Bat (70% / 0%); weak only: Seed-cache Squirrel (55% / 100%), Robin Redbreast (45% / 80%), Pyrenean Desman (70% / 100%); leaders strong The Old Shell 20, weak The Old Shell 20
- **m5** strong only: Banded Sea Krait (45% / 0%); weak only: Stonedrop Vulture (55% / 90%); leaders strong The Old Shell 20, weak The Old Shell 20
- **my** strong only: Ibex Rockcaller (100% / 60%); weak only: –; leaders strong Pride Queen 20, weak Pride Queen 20
- **ml** strong only: Upside-Down Bat (100% / 35%), Ladybird Guard (100% / 60%); weak only: Dormouse (0% / 30%); leaders strong Pride Queen 20, weak Pride Queen 20
- **mt** strong only: Bramblewood Lynx (40% / 0%); weak only: Redwood Woodpecker (15% / 100%); leaders strong Pride Queen 20, weak Pride Queen 20
- **m6** strong only: –; weak only: –; leaders strong Pride Queen 20, weak Pride Queen 20
- **mi** strong only: Obsidian Scorpion (60% / 20%); weak only: Squire's Mount (35% / 70%); leaders strong The Caldera Wyrm 20, weak The Caldera Wyrm 20
- **md** strong only: Squire's Mount (90% / 35%), Stonedrop Vulture (100% / 60%); weak only: Alligator Gar (5% / 55%), Wolf Spider Mother (0% / 30%); leaders strong Pride Queen 20, weak Pride Queen 20
- **mpd** strong only: Dromedary (30% / 0%); weak only: Roadrunner Courier (40% / 100%), Sand Widow (60% / 100%); leaders strong Pride Queen 20, weak Pride Queen 20
- **m3** strong only: Upside-Down Bat (75% / 25%); weak only: –; leaders strong Pride Queen 20, weak Pride Queen 20
- **m9** strong only: –; weak only: Pumice Beetle (5% / 100%), Tide Seahorse (10% / 75%); leaders strong The Caldera Wyrm 20, weak The Caldera Wyrm 20
- **m11** strong only: Constrictor Coil (90% / 40%); weak only: Grotto Lobster (5% / 55%); leaders strong Pride Queen 20, weak Pride Queen 20
- **me** strong only: Apollo Butterfly (100% / 50%), Bombardier Beetle (85% / 35%), Wolf Spider Mother (80% / 45%); weak only: Cave Warlord (0% / 30%); leaders strong Pride Queen 20, weak Pride Queen 20
- **mx** strong only: Swift Fox (30% / 0%), Obsidian Scorpion (45% / 15%); weak only: Stalactite Pill Bug (30% / 80%); leaders strong Pride Queen 20, weak Pride Queen 20
