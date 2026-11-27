# ROADMEASURE 2026-11-27: a full Maps 0-20 road baseline after SKILLS3-B

Measure only: no deck, Shield or Health change. One full measure, `node tools/skirmish_pass.js measure 400 0 2 --tag=post1127f --maxmap=20` (and shard `1 2`): 223 fights played, 208 with a curve target (the totals' set), 400 games each, seeds 9100, engine and decks at `eb2374e51` (ROADFIX5) plus the UISWEEP3 UI edits in the working tree (no deck, engine or rule lines). It runs alongside the composite the road totals came from: `post1125b` full, then `post1126i`, `post1127s` and `post1127r` over subsets, with the later tag winning for each fight.

## Totals (Maps 0-20, 208 fights; `tools/bal16/road_totals_2026_11_05.js`)
| measure | in band | within 10 | beyond 20 | mean win |
|---|---|---|---|---|
| composite (post1125b < post1126i < post1127s < post1127r) | 180 | 181 | 7 | 68.5 |
| **full post1127f** | **179** | **181** | **7** | 68.4 |

The seeds are fixed (9100), so a fight whose inputs did not change reads the same to the decimal. **197 of 208 fights are identical.** All 61 fights from `post1127s` and all 3 from `post1127r` are identical, so SKILLS3-B's re-measure and ROADFIX5 still hold. The 11 that moved all have the same deck, level, Shield and Health as before:

| fight | from | composite | full | change |
|---|---|---|---|---|
| 1-A-3 Clovermead, Puddle Hop | post1126i | 67.0 | 60.3 | -6.7 |
| 1-A-2 Clovermead | post1126i | 84.8 | 80.8 | -4.0 |
| 11-A-3 | post1125b | 62.8 | 60.5 | -2.3 |
| 1-A-1, 11-A-2 | post1126i, post1125b | 83.8, 78.8 | 82.0, 77.0 | -1.8 |
| 1-A-4 | post1126i | 59.0 | 57.3 | -1.7 |
| 12-1, 12-3, 12-7, 1-A-5, 18-2 | post1126i / post1125b | | | -0.5 to +0.5 |

So the rules changed since `post1126i` / `post1125b` (SKILLS3-B or the 11-27 release's DAUNT2 card changes; not bisected) and that change also reaches Clovermead (all 5 fights), 11-A-2/3, Map 12's 1/3/7 and 18-2. SKILLS3-B's 70-fight selection ("the fights the rules can reach") missed these 11 fights. Mean change -0.09, mean |change| 0.1. The only band change: 1-A-3 drops out of the band (62-78) by 1.7.

## Fights that moved 6+ points: only 1-A-3 (noise, not a real shift)
| 1-A-3 (target 70, band 62-78) | games | win |
|---|---|---|
| composite (post1126i, seeds 9100, old rules) | 400 | 67.0 |
| full (post1127f, seeds 9100) | 400 | 60.3 |
| fresh seeds 5100 (`skirmish-pass-post1127f-s5100.jsonl`) | 400 | 63.0 |
| fresh seeds 21000 (`skirmish-pass-post1127f-1a3-s21000.jsonl`) | 1600 | 65.1 |
| **pooled, today's rules** | **2400** | **64.0** (in band, gap -6) |

The -6.7 is mostly seed set 9100's luck (z -2.0 on 400 vs 400). The real shift is about -3 (64 vs 67), which is within noise, so 1-A-3 is not a retune candidate. The fresh-seed check of all 11 moved fights (seeds 5100, 400 games) keeps all 10 others in their band (18-2 stays easy at 98.3). 12-7 reads 38.3 on seeds 9100 and 31.5 on seeds 5100: one seed set can be about 7 points off at 400 games.

## Worst maps (full, mean |gap|)
| map | mean \|gap\| | mean gap | green | beyond 20 |
|---|---|---|---|---|
| 17 Wolfsbane Tundra | 11.9 | -11.7 (too hard) | 3/8 | 2 |
| 18 mpd The Pale Desert | 11.7 | +11.3 (too easy) | 5/9 | 3 |
| 2 Pebble Beach | 10.8 | -10.8 (too hard) | 3/5 | 1 |
| 2 mg Smugglers' Grotto | 10.2 | -6.7 | 3/4 | 0 |
| 15 The Long Grass | 8.3 | +8.3 | 4/7 | 0 |
| 4 Sunken Hollow | 8.1 | -8.1 | 4/5 | 0 |
| 19 Ashen Spurn | 8.1 | -8.1 | 4/6 | 0 |
| 13 The Redwood Deep | 8.0 | +8.0 | 6/8 | 0 |

The top 9 are the same as the composite's, in the same order with the same values (Map 18 The Glass Dunes is 9th at 7.7). Only Clovermead (1 mq) moves: its mean |gap| goes from 4.4 to 5.6.

## Out of the band (full, 29 fights, the biggest gap first)
Too hard (the urgent side) is marked **H**.

| fight | map | kind | win | target [band] | gap |
|---|---|---|---|---|---|
| 8-7 The Roost Above | Caves & Alcoves | elite | 24.8 | 60 [52-68] | **H -35.2** |
| 2-2 Gull Gang | Pebble Beach | skirmish | 52.8 | 80 [72-88] | **H -27.2** |
| 18-A-7 Oryx Crossing | The Pale Desert | skirmish | 90.0 | 64.3 [56-72] | +25.7 |
| 18-A-6 The Salt Pan | The Pale Desert | skirmish | 93.5 | 68.6 [61-77] | +24.9 |
| 17-8 The Walrus Icebreaker | Wolfsbane Tundra | miniboss | 16.0 | 40 [30-49] | **H -24.0** |
| 18-A-4 Meerkat Warrens | The Pale Desert | skirmish | 99.5 | 77.1 [69-85] | +22.4 |
| 17-7 Alpha Howler's Den | Wolfsbane Tundra | elite | 39.8 | 60 [52-68] | **H -20.2** |
| 13-8 The Stag-Lord | The Redwood Deep | miniboss | 60.0 | 40 [30-49] | +20.0 (edge) |
| 2-B-1 Drip Tunnel | Smugglers' Grotto | skirmish | 70.3 | 90 [82-98] | **H -19.7** |
| 15-3 Stoat Ambush | The Long Grass | skirmish | 95.3 | 78 [70-86] | +17.3 |
| 4-3 Cetacean Pod | Sunken Hollow | elite | 53.3 | 70 [62-78] | **H -16.7** |
| 19-6 The Frost Yeti King | Ashen Spurn | miniboss | 23.3 | 40 [30-49] | **H -16.7** |
| 18-A-5 Vulture Road | The Pale Desert | skirmish | 89.0 | 72.9 [65-81] | +16.1 |
| 20-A-4 Heart of the Mountain | Eye of the Volcano | dungeon | 51.0 | 35.5 [26-44] | +15.5 |
| 15-4 Archer Hill | The Long Grass | skirmish | 87.0 | 72 [64-80] | +15.0 |
| 18-2 Scorpion Flats | The Glass Dunes | skirmish | 99.0 | 84 [76-92] | +15.0 |
| 17-4 Lynx Ambush | Wolfsbane Tundra | skirmish | 60.3 | 75 [67-83] | **H -14.7** |
| 17-6 Glacier Herd | Wolfsbane Tundra | elite | 50.5 | 65 [57-73] | **H -14.5** |
| 15-6 The Kennels | The Long Grass | elite | 73.3 | 60 [52-68] | +13.3 |
| 10-A-3 Cargo Hold | The Sunken Depths | skirmish | 82.8 | 70 [62-78] | +12.8 |
| 5-2 Toad Hollow | Gatorback Swamp | skirmish | 71.3 | 84 [76-92] | **H -12.7** |
| 17-3 Snowshoe Line | Wolfsbane Tundra | skirmish | 67.8 | 80 [72-88] | **H -12.2** |
| 19-5 Sky Scraper Sentinel | Ashen Spurn | elite | 47.8 | 60 [52-68] | **H -12.2** |
| 18-3 Widow's Web | The Glass Dunes | skirmish | 90.0 | 78 [70-86] | +12.0 |
| 13-6 Grizzly Ridge | The Redwood Deep | elite | 76.5 | 65 [57-73] | +11.5 |
| 2-1 Rock Pool Raiders | Pebble Beach | skirmish | 79.3 | 90 [82-98] | **H -10.7** |
| 1-A-3 Puddle Hop | Clovermead | skirmish | 60.3 | 70 [62-78] | H -9.7 (noise: 64.0 on 2400 games, in band) |
| 10-A-1 Bubble Trail | The Sunken Depths | skirmish | 99.5 | 90 [82-98] | +9.5 |
| 5-A-3 Moss Weir | The Sunken Grove | skirmish | 68.5 | 60 [52-68] | +8.5 |

Beyond 20 (7): 8-7, 2-2, 17-8 and 17-7 are too hard; 18-A-7, 18-A-6 and 18-A-4 are too easy. These are the same 7 as the composite's. 19-5, 19-6 (TESTFIX9-2), 18-3 and the Pale Desert are still the fights ROADFIX5 found it could not fix on their lists.

## Files
- `docs/balance/skirmish-pass-post1127f.jsonl` (the full measure, 223 rows)
- `docs/balance/roadmeasure-2026-11-27.json`: totals for full and composite, per-map aggregates, every moved fight with its source tag, the out-of-band list. Built by a one-off comparison over `road_totals_2026_11_05.js`'s `rowsOf` / `totals`.
- `docs/balance/skirmish-pass-post1127f-s5100.jsonl` and `skirmish-pass-post1127f-1a3-s21000.jsonl` (the fresh-seed checks)

## Balancing status (Maps 0-20, full post1127f)
- 179 of 208 fights in band, 181 within 10, 7 beyond 20. Reading 1-A-3 at its 2400-game value puts it back in band, which makes 180.
- Worst maps: 17 Wolfsbane Tundra (too hard), 18 The Pale Desert (too easy), 2 Pebble Beach (too hard), 2 Smugglers' Grotto.
- Open balance decisions: none (no BAL item is YET in `docs/decisions.json`).
- Next: a swap pass (`curve --from=post1127f`) on the four too-hard fights beyond 20 (8-7, 2-2, 17-8, 17-7), then on the Pale Desert's 18-A-4/6/7. From now on, measure the road in full (about 25 minutes on 2 cores) rather than as a subset after a rule change.
