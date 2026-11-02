# BAL11: why the hard maps' best decks are too strong (budget blind spots), 2026-11-02

Roles (BAL-ROLES): no card is re-tuned for playing strong. Each card that sits far above its map's fair line is listed with the reason the
budget misses it. Two reasons were clear pricing errors and are fixed in the formula (with the budget fits they caused); the rest are proposals.

## How it was measured
- Card contribution on each hard map: `node tools/bench/bench.js contrib --map <id> --all --games 300` (my, mz, mj) / `--games 250` (mpd, m6,
  m4, m9, m5, me): paired swaps against Blanks in the map's own pool and fields (`docs/balance/bench-contrib-mapNN-<id>-bpro-2026-11-02-bal11.json/.md`).
  "vs fair" = per-copy contribution minus the map's fitted line at the card's N, in win-rate points a copy; z = that over its standard error.
- The bramble Health test: `node tools/bal9/bramble_hp_2026_11_02.js --skill <id>` (new): 400 paired fights a variant, both brambles at 15
  and at 30 Health, the carrier as printed / without the skill / +1 Health / +1 Attack (`docs/balance/bal11/bramble-hp-*-2026-11-02.json`).
- The time of day per map and per card at home: `node tools/bal9/zeit_home_2026_11_02.js --per 6` (new; `docs/balance/bal11/zeit-home-2026-11-02.json`).

## Cards far above the fair line (vs fair >= +1.5 points a copy, z >= 2.5)

| Map | Card | A/H, Lumber | vs fair (z) | In the road decks | Blind spot |
|---|---|---|---|---|---|
| 7 Mycelium Deep (mz) | Beetle Battering-Ram | 4/11, 1 | +7.0 (15.2) | 2 copies | A (Breach), C (priced as a Map 23 card, fights on Map 7), B (Nocturnal on an always-night map) |
| mz | Trapdoor Spider | 4/7, 0 | +3.5 (6.8) | 6 | E (a 0-Lumber Rare: Rarity buys stats it plays on turn 1) |
| mz | Owl Nightwatch | 1/5, 1 | +2.2 (4.1) | 0 | A (Stealth), B (home night share 0.67) |
| mz | Dung Beetle, Ant Warrior, Bee Forager | 0 Lumber | +2.0 to +3.0 | 20 / 10 / 2 | E (0-Lumber tempo); Decay priced on vanilla carriers |
| 8 Caves (m4) | Vampire Bat | 2/3, 0 | +3.6 (6.6) | 5 | B (Nocturnal: the caves are always night, its list average is 0.49), E |
| m4 | Echo Screecher, Giant Cave Huntsman, Grotto Lobster | | +2.6 to +3.0 | 2 / 3 / 0 | B (Echo Screecher), Pounce / Brood on vanilla carriers |
| 10 Sunken Depths (mj) | Nautilus Drifter, Coral Polyp Colony | Lumber makers | +4.5 / +4.1 (10.3 / 9.2) | 2 / 0 | D (economy priced in the global context; this list is costly: Orca, Kraken 3 Lumber, Colossal Squid 4) |
| mj | Mangrove Manatee | 7/7, 1 | +4.2 (9.6) | 1 | F (Guardian priced 0; Tide always on at the Depths) |
| 14 Canopy (my) / Savanna (m5) | Siege Rhino | 5/17, 1 | +5.5 (10.5) | 7 | C (priced as a Map 23 card) |
| my / m5 | Pangolin Roller, Savanna Cheetah | 5/5 / 4/4, 1 | +4.8 / +2.5 (my), +1.9 / +3.6 (m5) | 6 / 1 (my), 15 / 5 (m5) | Sturdy / Quick on vanilla carriers (not field-related; measure at home) |
| 17 Wolfsbane (m6) | Walrus Icebreaker | 4/17, 1 | +5.5 (10.1) | 9 | F (Freeze / Shatter priced off-home: Wolfsbane is cold every fight) |
| 18 Pale Desert (mpd) | Trapdoor Spider | 4/7, 0 | +3.9 (7.0) | 15 | E |
| mpd | Dune Packrat, Thorny Devil, Quicksand Queen | | +3.1 to +3.5 | 8 / 0 / 4 | D (Packrat: +3 Lumber on Ready), F (Guardian 0; Trap on the desert's own field) |
| 19 Basalt Foundry (m9) | Echidna Quillshot, Tide Spirit | 3/11 / 5/5 (0 Lumber) | +4.8 / +4.2 | 4 / 6 | E (Tide Spirit), Volley on vanilla carriers |
| 20 Volcano (me) | The Contradiction, Ossuary Lammergeier, Magma Salamander, Ashbone Ghoul | | +2.2 to +3.9 | 0 / 1 / 12 / 31 | Fire Arrow / Remember on vanilla carriers (heat field off-home) |

## The blind spots

**A. Bramble-damage skills were priced against a 30-Health bramble; the road's are 15 (FIXED).** Every skill price was measured with both
brambles at 30 Health (`tools/skill_canon_2026_10_31.js`, `tools/bench/lib.js`), but the game halves every bramble (`arena_app.js`
BRAMBLE_SCALE 0.5: your bramble is 15). A skill whose damage goes to the bramble itself is worth more there:
Stealth 3.44 points at 15 Health vs 1.10 at 30 (6 carriers, x3.1; each carrier x1.5 to x11), Breach 3.87 vs 1.80 (2 carriers, x2.2). Siege
(the bonus when a swing reaches the bramble) showed no clear change (1.32 vs 1.79, noisy) and stays. Fix: Stealth 3.64 -> 7.28 and Breach
2.25 -> 4.50 a point in `canonical/skill-costs.json` (x2, the low end of the reading; decision BAL11-2), until the canon is re-measured at
the game's bramble Health.

**B. Time-of-day skills were priced at the all-fights share; their home maps differ (FIXED in the formula).** Nocturnal / Diurnal were priced at
0.53 / 0.38 of a unit's rounds over every fight. Most maps cycle (about 0.5), but the Swampmire, the Caves, the Pinewood Taiga, the Sunken
Depths, Smugglers' Grotto and the Mycelium Deep are night every round, and several side maps never are. `bramblewood-budget.js` zeitS now
takes the card's share on its home maps (its lists; `canonical/skill-costs.json` zeitHome) at ZEIT_HOME_WEIGHT 0.5 (as EN6 priced
Hibernate), and the drawbacks Nightblind / Sunshy are scaled the same way (zeitDrawbackMult); `tools/skill_costs.js` hands the card's home
to it. Effect today: small (Owl Nightwatch 0.53 -> 0.60, Echo Matriarch 0.53 -> 0.77, Toucan Courier 0.38 -> 0.19); it grows as cards get
single-map homes. Gap left: the home is the card's lists, not where the road fields it (Vampire Bat's lists average 0.49 night, but it fights
in the always-night Caves); see C.

**C. The Map term prices a card at its first obtainable map, not where the road fields it (proposal).** Beetle Battering-Ram and Siege Rhino
are Map 23 pack cards (+4.6 Base, about +5 N) but fight in the Mycelium Deep (Map 7: 7-A-3, 7-A-4) and the Canopy / Savanna (Map 14:
14-A-1/2/4/5); Hercules Beetle is priced at Map 18 and listed at Map 14. Proposal (BAL11-3): the Map term (and the home share of B) from the
earliest map whose list or road deck holds the card; or take these cards out of the earlier fights (an owner pick).

**D. Lumber makers are priced in the global context; on a costly list every Lumber is spent (proposal).** Nautilus Drifter and Coral Polyp
Colony (On Ready: +1 Lumber) are the strongest cards of the Sunken Depths, whose list holds 3-4 Lumber cards; Dune Packrat (+3 Lumber) on the
Pale Desert. Proposal: measure the makers on their home maps (`tools/pipeline/run.sh measure --skills onReadyGold --map mj`) and price them
by the list's mean cost (a pair multiplier per cost band).

**E. A 0-Lumber card's Rarity budget is all tempo (proposal).** Trapdoor Spider (Rare, 4/7, 0 Lumber: +3.5 on the Mycelium Deep, +3.9 on the
Pale Desert), Tide Spirit (Rare 5/5, 0 Lumber), Star-nosed Mole (5/5), Vampire Bat: the Rarity term buys stats that arrive on turn 1. Proposal:
a cap-2 (A·H) tighter by 10-15% for a 0-Lumber, 0-Wait card at Rare and up, measured with the canon tool before it is set.

**F. Field and keyword skills priced off-home (proposal).** Walrus Icebreaker's Freeze / Shatter on the always-cold Wolfsbane Tundra;
Guardian priced 0 (Mangrove Manatee, Thorny Devil, Grey Seal Bull before); Trap / Quicksand on the desert's own field. Proposal: measure each on
its home map (`run.sh measure --skills freeze,shatter --map m6`, `guardian --map mj`) and raise to the reading (the CONDITIONAL rule).

## Cards re-fitted to the fixed budget (BAL11-2; each stat within 2)
Owl Nightwatch 1/5 -> 1/3, Beetle Battering-Ram 4/11 -> 3/9, Moray Ambusher 4/5 -> 3/3, Raccoon Nightcrew 3/6 -> 2/4 (the last two were
already over their budget before the fix). Flagged, not changed (no fit within 2 a stat that keeps the body shape): Subterraneaner 4/8
(fits at 2/6 or 3/3), Glass Octopus 4/9 (3/9, a raid card), Badger Sapper 3/15 (2/14). No owner-named card moved.
