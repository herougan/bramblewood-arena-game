# REF6: how strong are the 100 reference players' decks? (ref6-post-listfix3, 2026-11-11)

Each map's 100 simulated players (seeds ref6-1 .. ref6-100, `docs/balance/ref6/ladder-100.json`), each deck against every road fight of its map (seeds 5300 + 37g): at least 16 games a deck, and players who share a deck share its games, so a deck plays 160 x the share of players holding it when that is more (every fight gets at least 160 games). A deck's **strength** = its mean win rate over the map's road fights. "True SD" takes the game noise out (16 games leave about ±13 points of noise per deck per fight). Made by `node tools/ref6/measure.js --tag ref6-post-listfix3`.

## Variance in strength of the different decks

| Map | Name | mean | SD (true) | p10 – p90 | min – max | weakest fight (mean) | distinct decks |
|---|---|---|---|---|---|---|---|
| m1 (0) | Bramblewood Outskirts | 86.9 | 0 (0) | 86.9 – 86.9 | 86.9 – 86.9 | 0-4 (61.2) | 1 |
| mo (0 side) | The Old Bramble | 31.3 | 2.6 (0) | 29.5 – 34.4 | 26.6 – 39.1 | 0-B-4 (0) | 10 |
| mf (1) | Thistlewood | 63.3 | 0 (0) | 63.2 – 63.2 | 63.2 – 63.2 | 1-5 (18.8) | 1 |
| mq (1 side) | Clovermead | 91.1 | 0.3 (0) | 91 – 91 | 91 – 93.8 | 1-A-5 (79.5) | 4 |
| mb (2) | Pebble Beach | 55.9 | 1.4 (0) | 55.3 – 56.7 | 43.8 – 56.7 | 2-4 (38.7) | 3 |
| mg (2 side) | Smugglers' Grotto | 76.1 | 0 (0) | 76.1 – 76.1 | 76.1 – 76.1 | 2-B-3 (60.6) | 1 |
| mp (2 side) | Lilypad Reach | 94.4 | 0 (0) | 94.4 – 94.4 | 94.4 – 94.4 | 2-A-5 (85.6) | 1 |
| mc (3) | Gannet Cliffs | 93.2 | 2 (1.4) | 93.1 – 94.6 | 86.6 – 96.4 | 3-7 (81.9) | 11 |
| m2 (4) | Sunken Hollow | 79.7 | 3 (2.6) | 72.2 – 80.9 | 70 – 80.9 | 4-5 (51) | 3 |
| mw (5) | Gatorback Swamp | 92.5 | 1.4 (0) | 90.2 – 93.9 | 89.3 – 94.6 | 5-7 (71) | 14 |
| ms (5 side) | The Sunken Grove | 96.2 | 0.2 (0) | 96.2 – 96.2 | 95.3 – 98.4 | 5-A-2 (91.8) | 3 |
| m8 (6) | Sable Swampmire | 95.5 | 0 (0) | 95.5 – 95.5 | 95.5 – 95.5 | 6-5 (75) | 1 |
| mu (7) | The Morel Hollow | 88.2 | 0 (0) | 88.2 – 88.2 | 88.2 – 88.2 | 7-6 (78.1) | 1 |
| mz (7 side) | The Mycelium Deep | 97.1 | 0.1 (0) | 97.1 – 97.1 | 97.1 – 97.5 | 7-A-4 (91) | 2 |
| m4 (8) | Caves & Alcoves | 92.1 | 0 (0) | 92.1 – 92.1 | 92.1 – 92.1 | 8-8 (70.6) | 1 |
| mn (8 side) | The Glimmer Depths | 60.2 | 0.4 (0) | 59.8 – 60.7 | 59.8 – 60.7 | 8-A-4 (32.3) | 3 |
| mk (9) | The Kelp Mangroves | 91.9 | 1.2 (0.5) | 91.2 – 94 | 91.2 – 94.6 | 9-7 (60.4) | 4 |
| m7 (10) | Coral Current | 71.7 | 2.2 (0.2) | 70.9 – 73.6 | 64.6 – 80.6 | 10-9 (57.4) | 16 |
| mj (10 side) | The Sunken Depths | 70.9 | 2.7 (1.9) | 70 – 72.5 | 55 – 78.8 | 10-A-4 (0.3) | 19 |
| m10 (11) | Eyrie Heights | 89.7 | 2 (0.8) | 87.6 – 93.1 | 86.3 – 95 | 11-7 (73.5) | 21 |
| mv (11 side) | The Aerie Vault | 72.2 | 3.8 (0) | 65.6 – 74 | 62.5 – 84.4 | 11-A-3 (59.3) | 24 |
| mh (12) | The Briar Maze | 93.2 | 2 (1.7) | 92.1 – 97.3 | 90.2 – 97.3 | 12-7 (81.2) | 13 |
| mr (13) | The Redwood Deep | 92.5 | 1.1 (0) | 91.3 – 93.1 | 89.1 – 95.3 | 13-8 (85.6) | 12 |
| m5 (14) | Savanna Reaches | 85.4 | 1.7 (1) | 83.6 – 86 | 79.7 – 86.7 | 14-8 (60.4) | 6 |
| my (14 side) | The Canopy | 96 | 1.3 (1) | 96.4 – 96.4 | 90 – 96.4 | 14-A-4 (85.6) | 4 |
| ml (15) | The Long Grass | 89.8 | 0.9 (0) | 89.3 – 90.2 | 83.9 – 92 | 15-7 (76.5) | 12 |
| mt (16) | The Pinewood Taiga | 54.8 | 3 (2.1) | 52 – 60.8 | 51.8 – 62.5 | 16-6 (1.9) | 11 |
| m6 (17) | Wolfsbane Tundra | 69.2 | 1.9 (0) | 66.4 – 70 | 60.2 – 70.3 | 17-8 (50.5) | 11 |
| mi (17 side) | The Ice Hollow | 48.6 | 4.3 (1.5) | 46.6 – 53.8 | 32.8 – 56.3 | 17-A-4 (23.1) | 20 |
| md (18) | The Glass Dunes | 62.8 | 6.7 (5.4) | 56.2 – 75.4 | 44.6 – 75.4 | 18-7 (27.8) | 32 |
| mpd (18 side) | The Pale Desert | 86.4 | 1.3 (0.2) | 85.8 – 88.3 | 85.8 – 89.6 | 18-A-9 (70.7) | 6 |
| m3 (19) | Ashen Spurn | 56.4 | 4.3 (1.8) | 51.3 – 60.5 | 44.8 – 72.9 | 19-4 (29.4) | 45 |
| m9 (19 side) | Basalt Foundry | 37.2 | 11 (10.6) | 23.3 – 55 | 23.3 – 62.5 | 19-A-10 (6.3) | 25 |
| m11 (20) | The Sundered Peak | 59.4 | 3.3 (1.1) | 54.9 – 62.8 | 51.2 – 70.6 | 20-10 (29.9) | 39 |
| me (20 side) | Eye of the Volcano | 82.1 | 3.2 (1.4) | 77.7 – 84.9 | 73.2 – 87.5 | 20-A-7 (58.2) | 37 |
| mx (20 side) | Volcano Lair | 70.4 | 4.9 (3.9) | 67.2 – 76.6 | 62.5 – 81.3 | 20-B-4 (38.1) | 12 |

Median true SD 0 points; widest m9 10.6, md 5.4, mx 3.9.

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
| 2-1 | skirmish | 73.5 | 73.5 – 73.5 | 90 (82–98) | 71.9 | 90.6 |
| 2-2 | skirmish | 72.3 | 72.3 – 72.3 | 80 (72–88) | 56.3 | 90.6 |
| 2-3 | skirmish | 49.3 | 49.3 – 49.3 | 70 (62–78) | 68.8 | 100 |
| 2-4 | skirmish | 38.7 | 38.7 – 38.7 | 60 (52–68) | 65.6 | 93.8 |
| 2-5 | elite | 45.6 | 45.6 – 45.6 | 40 (30–49) | 46.9 | 71.9 |
| 3-1 | skirmish | 99.8 | 99.8 – 99.8 | 90 (82–98) | 87.5 | 100 |
| 3-2 | skirmish | 97.6 | 97.6 – 97.6 | 84 (76–92) | 71.9 | 96.9 |
| 3-3 | skirmish | 97.9 | 97.8 – 98.2 | 78 (70–86) | 71.9 | 100 |
| 3-4 | skirmish | 96.9 | 96.9 – 96.9 | 72 (64–80) | 78.1 | 93.8 |
| 3-5 | elite | 87.4 | 87 – 90.6 | 66 (58–74) | 59.4 | 87.5 |
| 3-6 | elite | 91 | 88.9 – 92.4 | 60 (52–68) | 65.6 | 100 |
| 3-7 | elite | 81.9 | 81.9 – 81.9 | 40 (30–49) | 28.1 | 93.8 |
| 4-1 | skirmish | 99.4 | 99.4 – 99.4 | 90 (82–98) | 90.6 | 100 |
| 4-2 | skirmish | 94.8 | 87.1 – 95.9 | 80 (72–88) | 84.4 | 100 |
| 4-3 | elite | 86 | 86 – 86 | 70 (62–78) | 59.4 | 87.5 |
| 4-4 | elite | 67.3 | 53.7 – 69.4 | 60 (52–68) | 62.5 | 93.8 |
| 4-5 | elite | 51 | 51 – 51 | 40 (30–49) | 34.4 | 68.8 |
| 5-1 | skirmish | 97.2 | 97.2 – 97.2 | 90 (82–98) | 90.6 | 100 |
| 5-2 | skirmish | 100 | 100 – 100 | 84 (76–92) | 90.6 | 100 |
| 5-3 | skirmish | 97.3 | 97.3 – 97.3 | 78 (70–86) | 65.6 | 96.9 |
| 5-4 | skirmish | 98.1 | 96.7 – 98.7 | 72 (64–80) | 68.8 | 96.9 |
| 5-5 | elite | 90.3 | 90.3 – 90.3 | 66 (58–74) | 68.8 | 100 |
| 5-6 | elite | 93.4 | 91.6 – 94.4 | 60 (52–68) | 59.4 | 100 |
| 5-7 | boss | 71 | 71 – 71 | 40 (30–49) | 65.6 | 96.9 |
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
| 9-5 | elite | 93.4 | 93.4 – 93.4 | 66 (58–74) | 62.5 | 90.6 |
| 9-6 | elite | 90.3 | 90.3 – 90.3 | 60 (52–68) | 56.3 | 93.8 |
| 9-7 | miniboss | 60.4 | 56.8 – 68.1 | 40 (30–49) | 43.8 | 96.9 |
| 10-1 | skirmish | 85.1 | 85.1 – 85.1 | 90 (82–98) | 81.3 | 93.8 |
| 10-2 | skirmish | 85.6 | 82.9 – 90.6 | 85.7 (77.7–93.7) | 87.5 | 100 |
| 10-3 | skirmish | 67.6 | 67.6 – 67.6 | 81.4 (73.4–89.4) | 78.1 | 100 |
| 10-4 | skirmish | 76.7 | 76.7 – 76.7 | 77.1 (69.1–85.1) | 81.3 | 93.8 |
| 10-5 | skirmish | 88.1 | 88.1 – 88.1 | 72.9 (64.9–80.9) | 65.6 | 100 |
| 10-6 | elite | 67.7 | 67.7 – 67.7 | 68.6 (60.6–76.6) | 56.3 | 96.9 |
| 10-7 | elite | 58.5 | 58.5 – 58.5 | 64.3 (56.3–72.3) | 71.9 | 93.8 |
| 10-8 | elite | 58.2 | 58.2 – 58.2 | 60 (52–68) | 53.1 | 100 |
| 10-9 | boss | 57.4 | 57.4 – 57.4 | 40 (30–49) | 37.5 | 87.5 |
| 11-1 | skirmish | 100 | 100 – 100 | 90 (82–98) | 96.9 | 100 |
| 11-2 | skirmish | 92.8 | 92.8 – 92.8 | 86.3 (78.3–94.3) | 75 | 96.9 |
| 11-3 | skirmish | 87.1 | 87.1 – 87.1 | 82.5 (74.5–90.5) | 78.1 | 100 |
| 11-4 | skirmish | 86.7 | 86.7 – 86.7 | 78.8 (70.8–86.8) | 68.8 | 96.9 |
| 11-5 | elite | 79.6 | 79.6 – 79.6 | 75 (67–83) | 87.5 | 93.8 |
| 11-6 | elite | 90.9 | 90.9 – 90.9 | 71.3 (63.3–79.3) | 68.8 | 96.9 |
| 11-7 | elite | 73.5 | 73.5 – 73.5 | 67.5 (59.5–75.5) | 78.1 | 100 |
| 11-8 | elite | 92.2 | 92.2 – 92.2 | 63.8 (55.8–71.8) | 53.1 | 93.8 |
| 11-9 | elite | 97.3 | 97.3 – 97.3 | 60 (52–68) | 71.9 | 96.9 |
| 11-10 | miniboss | 96.7 | 94.4 – 98.8 | 40 (30–49) | 34.4 | 87.5 |
| 12-1 | skirmish | 96.9 | 96.9 – 96.9 | 90 (82–98) | 81.3 | 100 |
| 12-2 | skirmish | 98 | 97.6 – 98.9 | 84 (76–92) | 84.4 | 100 |
| 12-3 | skirmish | 96.2 | 95.9 – 97.7 | 78 (70–86) | 62.5 | 100 |
| 12-4 | skirmish | 97.3 | 96.6 – 99.3 | 72 (64–80) | 78.1 | 100 |
| 12-5 | elite | 96 | 96 – 96 | 66 (58–74) | 62.5 | 96.9 |
| 12-6 | elite | 86.8 | 86.2 – 89.1 | 60 (52–68) | 65.6 | 100 |
| 12-7 | miniboss | 81.2 | 78.7 – 94.9 | 40 (30–49) | 50 | 96.9 |
| 13-1 | skirmish | 99.4 | 99.4 – 99.4 | 90 (82–98) | 93.8 | 100 |
| 13-2 | skirmish | 99.4 | 99.4 – 99.4 | 85 (77–93) | 84.4 | 100 |
| 13-3 | skirmish | 90.3 | 90.3 – 90.3 | 80 (72–88) | 90.6 | 100 |
| 13-4 | skirmish | 91.6 | 91.6 – 91.6 | 75 (67–83) | 62.5 | 96.9 |
| 13-5 | elite | 94.4 | 94.4 – 94.4 | 70 (62–78) | 71.9 | 96.9 |
| 13-6 | elite | 92.3 | 90.6 – 95 | 65 (57–73) | 62.5 | 96.9 |
| 13-7 | elite | 87.3 | 87.3 – 87.3 | 60 (52–68) | 68.8 | 100 |
| 13-8 | miniboss | 85.6 | 85.6 – 85.6 | 40 (30–49) | 62.5 | 100 |
| 14-1 | skirmish | 93.4 | 93.4 – 93.4 | 90 (82–98) | 78.1 | 100 |
| 14-2 | skirmish | 97.2 | 97.2 – 97.2 | 85 (77–93) | 78.1 | 100 |
| 14-3 | skirmish | 94.7 | 94.7 – 94.7 | 80 (72–88) | 87.5 | 100 |
| 14-4 | skirmish | 95.4 | 95.4 – 95.4 | 75 (67–83) | 81.3 | 87.5 |
| 14-5 | elite | 84.9 | 84 – 84.3 | 70 (62–78) | 75 | 96.9 |
| 14-6 | elite | 81.3 | 81.4 – 81.4 | 65 (57–73) | 68.8 | 96.9 |
| 14-7 | elite | 76 | 75.2 – 77.9 | 60 (52–68) | 68.8 | 93.8 |
| 14-8 | miniboss | 60.4 | 60.4 – 60.4 | 40 (30–49) | 34.4 | 75 |
| 15-1 | skirmish | 99.3 | 99.3 – 99.3 | 90 (82–98) | 90.6 | 100 |
| 15-2 | skirmish | 100 | 100 – 100 | 84 (76–92) | 87.5 | 87.5 |
| 15-3 | skirmish | 98.8 | 98.8 – 98.8 | 78 (70–86) | 81.3 | 78.1 |
| 15-4 | skirmish | 86.1 | 77.8 – 93.6 | 72 (64–80) | 87.5 | 100 |
| 15-5 | elite | 88.3 | 88.3 – 88.3 | 66 (58–74) | 71.9 | 96.9 |
| 15-6 | elite | 79.9 | 69.5 – 85 | 60 (52–68) | 75 | 100 |
| 15-7 | boss | 76.5 | 76.5 – 76.5 | 40 (30–49) | 37.5 | 100 |
| 16-1 | skirmish | 89.3 | 89.3 – 89.3 | 90 (82–98) | 93.8 | 96.9 |
| 16-2 | skirmish | 72.6 | 72.6 – 72.6 | 84 (76–92) | 81.3 | 87.5 |
| 16-3 | skirmish | 72.4 | 72.4 – 72.4 | 78 (70–86) | 56.3 | 96.9 |
| 16-4 | skirmish | 61.7 | 61.7 – 61.7 | 72 (64–80) | 59.4 | 90.6 |
| 16-5 | elite | 45.6 | 45.6 – 45.6 | 66 (58–74) | 46.9 | 84.4 |
| 16-6 | elite | 1.9 | 0.7 – 5.2 | 60 (52–68) | 31.3 | 93.8 |
| 16-7 | miniboss | 40.1 | 38.3 – 45.2 | 40 (30–49) | 40.6 | 96.9 |
| 17-1 | skirmish | 76.5 | 76.5 – 76.5 | 90 (82–98) | 90.6 | 96.9 |
| 17-2 | skirmish | 86 | 73.5 – 87.6 | 85 (77–93) | 81.3 | 96.9 |
| 17-3 | skirmish | 75 | 75 – 75 | 80 (72–88) | 71.9 | 96.9 |
| 17-4 | skirmish | 86 | 86.3 – 86.6 | 75 (67–83) | 53.1 | 93.8 |
| 17-5 | elite | 59 | 59 – 59 | 70 (62–78) | 65.6 | 71.9 |
| 17-6 | elite | 58.2 | 58.2 – 58.2 | 65 (57–73) | 50 | 90.6 |
| 17-7 | elite | 62.3 | 62.3 – 62.3 | 60 (52–68) | 56.3 | 100 |
| 17-8 | miniboss | 50.5 | 35.9 – 53.4 | 40 (30–49) | 12.5 | 81.3 |
| 18-1 | skirmish | 75.1 | 75.1 – 75.1 | 90 (82–98) | 75 | 90.6 |
| 18-2 | skirmish | 72.1 | 58.9 – 85.4 | 84 (76–92) | 84.4 | 90.6 |
| 18-3 | skirmish | 64.5 | 58.1 – 67.7 | 78 (70–86) | 78.1 | 78.1 |
| 18-4 | skirmish | 60.2 | 60.2 – 60.2 | 72 (64–80) | 75 | 59.4 |
| 18-5 | elite | 72.9 | 66.5 – 82.8 | 66 (58–74) | 78.1 | 87.5 |
| 18-6 | elite | 67 | 67 – 67 | 60 (52–68) | 71.9 | 78.1 |
| 18-7 | miniboss | 27.8 | 27.8 – 27.8 | 40 (30–49) | 43.8 | 37.5 |
| 19-1 | skirmish | 96.5 | 96.5 – 96.5 | 90 (82–98) | 93.8 | 100 |
| 19-2 | skirmish | 74.3 | 74.3 – 74.3 | 82.5 (74.5–90.5) | 78.1 | 78.1 |
| 19-3 | elite | 65.7 | 65.7 – 65.7 | 75 (67–83) | 81.3 | 90.6 |
| 19-4 | elite | 29.4 | 27.2 – 31.6 | 67.5 (59.5–75.5) | 62.5 | 43.8 |
| 19-5 | elite | 42.6 | 42.6 – 42.6 | 60 (52–68) | 53.1 | 78.1 |
| 19-6 | miniboss | 29.5 | 29.5 – 29.5 | 40 (30–49) | 53.1 | 34.4 |
| 20-1 | skirmish | 89.1 | 89.1 – 89.1 | 90 (82–98) | 93.8 | 96.9 |
| 20-2 | skirmish | 85.2 | 85.2 – 85.2 | 85.7 (77.7–93.7) | 90.6 | 100 |
| 20-3 | skirmish | 67.6 | 67.6 – 67.6 | 81.4 (73.4–89.4) | 84.4 | 90.6 |
| 20-4 | skirmish | 54.9 | 54.9 – 54.9 | 77.1 (69.1–85.1) | 78.1 | 81.3 |
| 20-5 | elite | 44.7 | 44.7 – 44.7 | 72.9 (64.9–80.9) | 75 | 90.6 |
| 20-6 | elite | 57.7 | 57.7 – 57.7 | 68.6 (60.6–76.6) | 81.3 | 96.9 |
| 20-7 | elite | 66 | 57.3 – 72.3 | 64.3 (56.3–72.3) | 71.9 | 93.8 |
| 20-8 | elite | 48.3 | 44.5 – 51.5 | 60 (52–68) | 53.1 | 100 |
| 20-9 | boss | 50.6 | 50.6 – 50.6 | 50 (42–58) | 71.9 | 90.6 |
| 20-10 | worldboss | 29.9 | 29.9 – 29.9 | 40 (30–49) | 43.8 | 87.5 |

## What the strongest and weakest fifth have in common

- **m1** strong only: –; weak only: –; leaders strong Wandering Traveller 20, weak Wandering Traveller 20
- **mo** strong only: Barkplate Beetle (100% / 60%); weak only: –; leaders strong The Caldera Wyrm 20, weak The Caldera Wyrm 20
- **mf** strong only: –; weak only: –; leaders strong Wandering Traveller 20, weak Wandering Traveller 20
- **mq** strong only: –; weak only: –; leaders strong The Old Shell 20, weak The Old Shell 20
- **mb** strong only: Robin Redbreast (100% / 0%); weak only: Duck Paddler (0% / 95%); leaders strong Wandering Traveller 20, weak Wandering Traveller 20
- **mg** strong only: –; weak only: –; leaders strong The Old Shell 20, weak The Old Shell 20
- **mp** strong only: –; weak only: –; leaders strong The Old Shell 20, weak The Old Shell 20
- **mc** strong only: Cormorant (35% / 0%), Crimson Recruit (30% / 0%); weak only: Chipmunk Cavalry (70% / 100%); leaders strong The Old Shell 20, weak The Old Shell 20
- **m2** strong only: –; weak only: –; leaders strong The Old Shell 20, weak The Old Shell 20
- **mw** strong only: –; weak only: Rabbit Kit (0% / 100%); leaders strong The Old Shell 20, weak The Old Shell 20
- **ms** strong only: –; weak only: –; leaders strong The Old Shell 20, weak The Old Shell 20
- **m8** strong only: –; weak only: –; leaders strong The Old Shell 20, weak The Old Shell 20
- **mu** strong only: –; weak only: –; leaders strong The Old Shell 20, weak The Old Shell 20
- **mz** strong only: –; weak only: –; leaders strong The Old Shell 20, weak The Old Shell 20
- **m4** strong only: –; weak only: –; leaders strong The Old Shell 20, weak The Old Shell 20
- **mn** strong only: Upside-Down Bat (100% / 0%); weak only: Cave Olm (0% / 100%); leaders strong Pride Queen 20, weak Pride Queen 20
- **mk** strong only: Fleetfoot'd (100% / 0%); weak only: –; leaders strong The Old Shell 20, weak The Old Shell 20
- **m7** strong only: Giant Cave Huntsman (35% / 0%); weak only: –; leaders strong The Old Shell 20, weak The Old Shell 20
- **mj** strong only: Nautilus Drifter (60% / 0%); weak only: –; leaders strong The Old Shell 20, weak The Old Shell 20
- **m10** strong only: –; weak only: –; leaders strong The Old Shell 20, weak The Old Shell 20
- **mv** strong only: –; weak only: –; leaders strong Pride Queen 20, weak Pride Queen 20
- **mh** strong only: Dormouse (100% / 10%); weak only: –; leaders strong The Old Shell 20, weak The Old Shell 20
- **mr** strong only: Robin Redbreast (70% / 0%); weak only: Upside-Down Bat (20% / 80%); leaders strong The Old Shell 20, weak The Old Shell 20
- **m5** strong only: Golden Eagle Diver (95% / 60%), Stonedrop Vulture (100% / 65%); weak only: Banded Sea Krait (0% / 30%), Dust Hyena (0% / 30%); leaders strong The Old Shell 20, weak The Old Shell 20
- **my** strong only: Ibex Rockcaller (100% / 60%); weak only: –; leaders strong Pride Queen 20, weak Pride Queen 20
- **ml** strong only: –; weak only: Upside-Down Bat (35% / 90%); leaders strong Pride Queen 20, weak Pride Queen 20
- **mt** strong only: Bramblewood Lynx (45% / 0%); weak only: Redwood Woodpecker (10% / 100%); leaders strong Pride Queen 20, weak Pride Queen 20
- **m6** strong only: –; weak only: –; leaders strong Pride Queen 20, weak Pride Queen 20
- **mi** strong only: Obsidian Scorpion (85% / 0%); weak only: Acorn Chipmunk (0% / 75%); leaders strong The Caldera Wyrm 20, weak The Caldera Wyrm 20
- **md** strong only: Marula Elephant (90% / 25%); weak only: Upside-Down Bat (10% / 70%); leaders strong Pride Queen 20, weak Pride Queen 20
- **mpd** strong only: Dromedary (45% / 0%); weak only: Roadrunner Courier (0% / 100%); leaders strong Pride Queen 20, weak Pride Queen 20
- **m3** strong only: Obsidian Scorpion (45% / 0%), Upside-Down Bat (60% / 25%); weak only: –; leaders strong Pride Queen 20, weak Pride Queen 20
- **m9** strong only: –; weak only: Pumice Beetle (5% / 100%), Tide Seahorse (25% / 90%); leaders strong The Caldera Wyrm 20, weak The Caldera Wyrm 20
- **m11** strong only: Constrictor Coil (90% / 45%); weak only: Grotto Lobster (5% / 55%); leaders strong Pride Queen 20, weak Pride Queen 20
- **me** strong only: Apollo Butterfly (100% / 55%), Wolf Spider Mother (80% / 35%); weak only: –; leaders strong Pride Queen 20, weak Pride Queen 20
- **mx** strong only: Obsidian Scorpion (35% / 0%); weak only: Stalactite Pill Bug (30% / 85%); leaders strong Pride Queen 20, weak Pride Queen 20
