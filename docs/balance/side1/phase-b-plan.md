# SIDE1 phase B: the plan (written in phase A, 2026-11-12; nothing here has run)

Owner, 2026-11-12 23:50: "then return the SK, WK, and re-card the skirmishes. If the SK is too difficult - good, then make the most difficult mission of the map (usually the last) = SK but easier, till it hits our ease-level. If its the opposite, SK is too weak... we might have to rebalance the cards or redesign."

Inputs: the side lists from phase A (`canonical/map-pools.json`, `docs/design/side-picks-proposal-2026-11-12.json`, record `docs/balance/side1/lists-2026-11-12.json`). Scope: the 15 side maps of Maps 0-21 (The Old Bramble, Clovermead, Lilypad Reach, Smugglers' Grotto, The Sunken Grove, The Mycelium Deep, The Glimmer Depths, The Sunken Depths, The Aerie Vault, The Canopy, The Ice Hollow, The Pale Desert, Basalt Foundry, Eye of the Volcano, Volcano Lair). 81 road fights. Main maps and the engine are not touched. Sims run alone on the box; heavy steps take the pipeline lock.

Wait for: the owner's flips in the Map cards window (or his "apply it" on `supabase/proposed/20261112_side1_map_picks.sql`); re-run `node tools/side1/lists_2026_11_12.js` after any flip (it checks the rules and rewrites the lists), then `node tools/side1/power_2026_11_12.js`.

## 1. N-SK / N-WK on the new side lists (the focused search)

```
node tools/skir3/refdecks_2026_11_12.js plan --maps mo,mq,mp,mg,ms,mz,mn,mj,mv,my,mi,mpd,m9,me,mx
node tools/skir3/refdecks_2026_11_12.js run --kind bpro --maps mo,mq,mp,mg,ms,mz,mn,mj,mv,my,mi,mpd,m9,me,mx
node tools/skir3/refdecks_2026_11_12.js run --kind pro  --maps <same>
node tools/skir3/refdecks_2026_11_12.js run --kind wpro --maps <same>
node tools/skir3/refdecks_2026_11_12.js apply --dry, then apply, then check
python3 assemble_arena.py && mv bramblewood-arena.html index.html; node tests/run.js --only 'pro|deck1|skill2|bal11'
node tools/opt/pro_ease.js --maps <same> --kind all --ref map,ladder     # the N-SK / N-WK marks (85% / 50%) and the 15-30% band
```

BPRO = the side list only (6 different cards, 4 copies, 20 cards, Level 1); PRO = the map-true pool; WPRO = two weak plans. The kept-deck rule (PRO-1 replacement, BPRO before PRO) is SKIR3's. Note: a side list of 2-3 NEW! cards plus 6-8 Carried still gives 9-11 cards, enough for a 6-card BPRO; The Volcano Lair (1 counted NEW! card plus a Baby) is the thinnest.

## 2. The SK anchor, per side map

For each side map, after step 1:

1. **SK** = its BPRO-1 (strongest list-only deck), played as the game builds that PRO fight. **Target** = the target of the map's hardest road fight (the ender, usually the last: `roadCurveTarget`, the side map's step lower, ROAD_CURVE_SIDE_DR); Volcano Lair is off the curve (ROAD_CURVE_SKIP): its hardest fight keeps its own target.
2. Measure the Map reference against the SK deck placed in the hardest fight (its leader, bramble, Shield, rules and size kept; deck = BPRO-1 scaled to the fight's size), 200 games on the road seeds (`tools/skirmish_pass.js measure` on that fight with the deck swapped in, or SKIR1's fit harness).
3. **SK too hard (reference win rate under the target's band):** good. That fight's deck becomes the SK deck, eased step by step until in band: each step moves one copy from the deck's heaviest card (stat score) to its lightest list card (SKIR1's down-tune), 200 games a step, a step kept only if it closes the gap by 2+ points on fresh seeds; stop inside the band (target +/- 8). K14 holds (non-unique cards 1 copy each, 6 in all; the parent's own cards count as the side map's own).
4. **SK too weak (reference at or over the band's top even against BPRO-1 unchanged):** the list cannot make the map's hardest fight. Flag the map "cards too weak: rebalance or redesign" in the report and a decision; no deck is forced (no Shield or Health change). Candidate fixes for the owner: a stronger NEW! card of the theme (the proposal's No list names them), a card re-fit (Claude's rough pass, never an owner-set card), or a redesign of the map's skills.
5. Also flag N-SK "too weak" (reference over 85% against any PRO / BPRO) and N-WK "too strong" (under 50% against any WPRO), as the protocol reads them.

## 3. Re-carding the other side-map fights

```
node tools/skir1/build_2026_11_11.js plan --maps mo,mq,mp,mg,ms,mz,mn,mj,mv,my,mi,mpd,m9,me,mx   # every fight but the anchored ender
node tools/skir1/build_2026_11_11.js apply; rebuild
node tools/skir1/fit_2026_11_11.js ...  (SKIR1's fit: toward the road curve, swaps inside the list, 200 games a step)
node tools/skirmish_pass.js measure 40 0 2 --tag=side1-after --maxmap=20   (and shard "1 2")
```

SKIR1's builder rules: the 3 peak slots get the map's BPRO / PRO strategies (down-tuned), the rest a seeded blend of 5-6 cards; kept per fight: leaders, showcase, first-clear cards, bramble, Shield, rules, size; K14; a card in at most half the map's fights; the deck mix minimums.

State after phase A (the decks were not touched): 79 of the 81 side fights hold 1-5 cards that are off the new lists (only 0-B-4 and 7-A-1 are clean); the game refuses nothing, so they still play as before until this step. Leaders off the new lists (15): 1-A-5 Field Vole, 2-A-5 Marsh Harrier, 2-A-7 Old Sturgeon, 2-B-4 Gallery Orb-Weaver, 5-A-2 Bog Leech, 5-A-3 Mangrove Mudskipper, 7-A-3 Garden Snail, 10-A-4 Coral Reef Shark, 14-A-4 Vampire Bat, 17-A-3 Ravenous Wolverine, 18-A-2 Dromedary, 19-A-5 / 19-A-9 Ashbone Ghoul, 19-A-6 Phoenix Fledgling, 20-A-2 Cinder Stoker. They stay as leaders (a leader may sit outside the fight's 5-6 cards); the report lists them for the owner. 27 showcases point at cards off the lists (2-A-1 Victoria Regia, 10-A-3 / 10-A-5 Hagfish Silencer, 17-A-2 / 17-A-4 Lone Grey Wolf, 19-A-7 / 19-A-8 Tide Seahorse ...); the builder re-points them by its Auto showcase rule (the deck's strongest list card).

## 4. Expected run time (2 cores, the box otherwise idle)

| Step | Work | Time |
|---|---|---|
| 1 BPRO search | 15 maps, about 6,800 games a map (SKIR3's run: 101,000 games in 34 min, shared box) | 30-35 min |
| 1 PRO search | 15 maps, about 9,000 games a map (SKIR3: 134,000 games in 41 min) | 35-45 min |
| 1 WPRO search | 15 maps x 2 plans x 1,600 games | 15-20 min |
| 1 apply, rebuild, pro tests, pro_ease | 15 maps x (PRO + BPRO + WPRO) x 40 games + ladder | 20-30 min |
| 2 SK anchor | 15 enders x 1 + about 5 easing steps x 200 games | 30-50 min |
| 3 build + fit | 66 other fights, about 3 fit steps x 200 games | 60-90 min |
| 3 road measure | 81 fights x 40 games (side maps only), then the balance summary | 10 + 15 min |

Total: about 3.5-5 hours, one step at a time (no tests or builds beside the sims). Report after step 3: per side map, SK / WK, the ender's before / after, the fights in band, and any map flagged "cards too weak".
