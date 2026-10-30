# Evaluation protocol

How the owner and the balance tools judge a map: which decks play, what counts as too hard or too easy, and how many games to run. One place, so a balance report does not have to re-argue it. The numbers in the game (`roadCurveTarget`, `skirmishTargetBand`, `ROAD_CURVE_TOL` in `arena_app.js`) and in the tools win over this page when they differ.

## 1. PRO and BPRO missions

A PRO fight is a hidden skirmish, `<map>-PRO-<k>`, that holds the best deck the deck optimizer found for a map. A BPRO fight (`<map>-BPRO-<k>`) is the same with only the map's own cards. Data: `canonical/pro-skirmishes.json`. Tools and routine: `docs/workflows/balance.md`, sections "Deck optimizer" and "PRO fights".

Rules (each with its source):
- **PRO never changes an existing skirmish.** PRO fights are for the owner to evaluate a map's cards: whether the map's pool can beat the road, which cards carry it, and which maps are too easy to optimize. They are never a way to retune the road. [owner 10-25 17:53 #27 / #32, recorded on EN8-10 in `docs/decisions.json`]
- **A PRO fight pays nothing:** no Energy, rank, cards, Maple Leaves, XP or quest counts. Players do not see PRO fights (a banked idea: reveal after Map 40). Admin (🏆 PRO fights), the skirmish editor and `#pro=3-PRO-1` open them. [PRO-2, PRO-1]
- **Faction cards are excluded.** A faction card is a faction-pack card (`source.kind: "pack"`, `tier: 11` in `canonical/cards.json`). `deckopt.js` leaves them out by default (`--no-faction`; `--faction` keeps them) and `pro_skirmishes.js` drops a PRO deck that holds one. The `faction: "base"` / `"hummingbirds"` field on starter and tutorial cards does not make a faction card. [owner 10-24 22:28 #3; package PRO3]
- **The rarity cap is the map's rarest fight.** A PRO or BPRO deck may hold the rarest card any fight of the map may hold (`roadRarityCap`): on the main road that is the elite's step, so Map 0 is Common and Maps 1-3 Uncommon. If a deck feels over-rare, move that card off. Switch to the stricter plain-skirmish cap with `--rarity-cap skirmish` on both tools. [PRO2-1; owner 10-25 17:53 "your decision. If it's over-rare'd then move it off."]
- **Two pool modes.**
  - `map-true` (PRO): the map's own cards (MAP tier, SPECIAL tier and fight decks) plus what a player holds by then, every card within the cap and first obtainable by this map.
  - `bpro` (BPRO): the map's own pool only, within the cap, no phase 2.
  - `classic` runs (the OPT2 pool, which let the Ent reach 0-PRO-3) are never candidates. A deck in the file that breaks the map rule goes to `replaced` with its reasons. `mapRuleProblems(gm, map, deck, mode)` checks a deck. [PRO2; `docs/workflows/balance.md`]
- **Side-map pools.** A side map has its own entry named after its fight codes (`2-B-PRO-1` for Smugglers' Grotto). Its pool is its parent's MAP tier + its SUBMAP list + SPECIAL + its fight decks; what a player holds is counted at the map it opens on (`mapUnlockNumberOf`); its cap comes from its own fights. The game shows a side map's own entry on that side map (`proEntryIdOf`), or its parent's when it has none. Not covered: the tutorial and the endless dungeons. Open: whether later cards may enter side-map PRO pools (PRO3-1, action item P6). [owner 10-24 22:28 #11; package PRO3]
- **Which deck becomes PRO-1.** The first fill takes the newest run's optimum. After that a candidate replaces PRO-1 only if it beats it head to head at 55% or more over at least 400 games with its 95% interval above 50%; other decks within 100 Elo and at least 6 copies apart become PRO-2.. (at most 4 a map). `docs/workflows/balance.md` has the full rule.
- **Reading a PRO result:** a PRO deck that wins most of the time against the road is a finding about the map's pool, not an error to fix by weakening the PRO deck. Map 2's PRO runs are known to be easy (a pool ceiling; action item P3). Which BPRO decks are too easy is an open report (REF-2).

## 2. Reference decks

A reference deck is the player the balance tools stand in for. A result is only meaningful against the reference deck it names.

- **Map reference (the one the balance tools use).** For each map the game has a comparison deck, the "road deck": built by `node tools/skirmish_pass.js decks` from Base cards plus every earlier main map's rewards, no packs, each map starting from the one before; a side map plays its parent's deck; Map 0 plays the Otter starter plus tutorial rewards. It plays at `referencePlayerLevel(map)` (the road CPU's own level, inside the Forge's gates; no Forge before Map 11) at Smart, against a plain 30-Health bramble. Source: `WINRATE_REF_DECKS` and `referenceDeckFor` in `arena_app.js`; the skirmish editor's "This map, new-player win rate" panel plays the same games (`simulateReferenceFight`, seeds 9100 + 37g). History: `docs/winrate-reference-decks-2026-10-19.md`.
- **Three curve decks** (an older measure): `tools/difficulty_curve.js` plays a Starter, a Mid-road (Base plus map rewards to Map 10) and a Strong deck (everything obtainable, packs included) against every fight; the hub's 📈 Difficulty tab shows them. They bracket the road; the map reference is the standard.
- **Reference-2: the owner's main deck (the Ant Deck).** Read from Supabase `player_decks` on 2026-10-25 and kept at `docs/balance/ref/ref2-owner-main-deck-2026-10-25.json`: the leader and the card counts. Level schedule (owner 10-25 22:36): Map 0, every card at Level 0; after each map, 5 random cards gain +1 level. The file's note says 105 levels in all at Map 20; 5 a map from Map 1 gives 100, so the first step's exact start is pinned when the schedule is coded (action item REF-2 / P1). Use: the owner-facing second yardstick for the evaluation and for X-REF fights (the map's reference deck against the map's PRO decks, action item P1). Source of record: the JSON file, not this page. [REF-2]
- **Pool reference (`ref-pool`, package BAL6, owner K17 10-27 11:22: "make the best deck we can given the deck unlocks and random 5 common cards unlocked every map (from packs)").** Per main map 0-24, the deck optimizer's best deck from the cards a player holds arriving there: the starter cards (the starter reference deck and every Base card), every earlier main map's first-clear cards (each fight's reward cards and its first-clear pack card), the faction rewards received by then (`tools/faction_track_sim_2026_10_21.js`, Otters, seed 7) and 5 random Common pack cards per map cleared (from the packs open by then, seeded). Any pool card may be played up to its rarity's copy cap. Pools: `docs/balance/ref/ref-pool-pools.json` (`node tools/opt/ref_pool.js pools`); search: `node tools/opt/deckopt.js --maps 0-24 --mode ref-pool --level ref --budget 16000 --ladder none --workers 2`; decks: `docs/balance/ref/ref-pool.json` (`node tools/opt/ref_pool.js collect --tag <tag>`). It plays at the Map reference's level (`referencePlayerLevel`). It is a per-map set, so the tools play it (`--ref ref-pool` on `pro_ease.js`, `ref_vs_optimum.js`, `skirmish_pass.js measure`); the game's reference picker does not deal it yet (`refSetFor` takes one deck a set). Use: the "best a player could build" yardstick, the upper bracket of the Map reference.
- **Progression reference ("Reference (Random)", set id `prog`, package REF5, owner 10-28 22:50 / 10-30: "a reference deck made from optimising standard draws + random booster pack openings appropriate for that map ... do this process a few times").** Per main map 0-20, 5 decks, one per seeded player (seeds 1-5, Otters). Each player's collection comes from the confirmed rewards before the map, x1.5. The rewards counted are first clears, fight cards, end-of-map and free packs, the faction track, the level track and the Trail's free lane at one map a day. 1.0x of the Leaves buys packs at each map's arrival (the map's series, else the next one down; with no Gold Leaves that is Hedgerow Pouches only). 0.5x goes to the Forge, which is open from Map 11: the Forge tier first, then the deck's cards, most copies per Dust first. Each deck is `deckopt.js --mode prog`'s best deck from that collection (owned copies, the cards' own levels). Each deck plays at its own per-card levels. A side map plays the decks of the map it opens on. Data: `docs/balance/ref/ref5-prog.json` (`decks`: map -> 5 x {seed, counts, parts}), pools `docs/balance/ref/ref5-prog-pools.json`. Tools: `tools/opt/ref5_prog.js` (econ / pools / auto / collect / measure). It is baked into the game by `tools/opt/ref_decks.js`: the "You play" picker's default deals one of the five at random per fight; `prog-1` .. `prog-5` pick one. In the tools, `--ref prog` on `pro_ease.js` and `ref_vs_optimum.js` measures the five (`prog-k` on `skirmish_pass.js measure`). The 2026-10-31 decks come from short searches (3,000 games). Report: `docs/balance/ref5-2026-10-30.md`. Decisions REF5-1..4.
- **Reference-3: pending.** The second account's main deck, with the rares and above swapped for House Cats and 1 rare returned a map from Map 4. That account has nothing on the server yet (G7: sign-up did not return to play), so the deck waits for the owner to sign in and save it or send the list. [REF-3] Until then no protocol result may quote a Reference-3 number.
- **A report names its reference deck, level schedule and seeds.** "New-player win rate" means the map reference; "owner win rate" means Reference-2; nothing else is called either.

## 3. Difficulty metrics

### The road curve targets
Source: `roadCurveTarget` / `skirmishTargetBand` in `arena_app.js`, `docs/skirmish-tuning-guide.md` section 10, `tools/skirmish_pass.js`. The measure is the map reference's win rate against each fight. [owner 10-19 20:39]
- A map's first skirmish about 90%, stepping evenly down to about 60% for the last skirmish before the boss. An elite sits on the line at its place.
- A mini-boss that is not the map's last fight: 50%.
- The map's last fight (its boss): 40%, green 30-49%. Map 0's boss: 45%.
- The game's green band is the target +/- 8 points (`ROAD_CURVE_TOL`).
- Side maps follow the same curve, a step lower for each map they sit ahead of the player's deck (`ROAD_CURVE_SIDE_DR`, 0.19 on the logit scale a map).
- Not on the curve (they keep older targets): the tutorial's come-back fights, the Volcano Lair, the endless dungeons and the Babel Spire.

### The owner's tolerance (DF-1b, 10-25 17:53), verbatim
> road should ROUGHLY always get harder. we can't always achieve this. at the most, we hope to be roughly AS difficult as the previous map while teaching something. I would say, as long the error bars are about +-5% for 1 sigma, that's actually ideal. +10% is acceptable. +15% is less liked, but okay. +-20% is starting to be unacceptable

Read as a ladder for the gap between a fight's measured win rate and its target (percentage points):

| Gap to target | Reading | Hub colour |
|---|---|---|
| within +/-5 | ideal (1 sigma) | green |
| 5 to 10 | acceptable | light green |
| 10 to 15 | less liked, but okay | amber |
| 15 to 20 | starting to be unacceptable | orange |
| beyond 20 | unacceptable | red |

The sign matters: a negative gap (win rate under target) is a fight that is too hard; a positive gap is too easy. Too hard is the urgent one for a player, too easy for the road's shape ("roughly always harder"). The hub's 📈 Difficulty tab colours each fight by this ladder and lists the too-hard fights first. [DF-1b, recorded here]

### Rules of thumb
- **The climb:** a map should be at least about as hard as the one before. A map whose average win rate is above the previous map's by more than the tolerance, or a boss easier than the map before, is "out of step" (the Difficulty tab lists them).
- **Noise first.** At 40 games a fight's result carries about +/-15 points (95%), so one reading a few points outside its band may be noise. Re-measure on fresh seeds before changing a deck.
- **Old targets lose.** The older 85 / 60 / 45 / 35 table in the tuning guide is superseded by the road curve.

## 4. Testing procedure

Run simulations alone on the machine (2 cores); other builds or browser tests slow them and tempt a timeout. Every number in a report comes from a run in that session or from a saved result file named in the report; a result reused from before is reported as "cached" (CLAUDE.md).

| What | Tool | Games |
|---|---|---|
| A fight against the map reference (the road check) | `node tools/skirmish_pass.js measure 40 <shard> 2 --tag=<t>-before --maxmap=20` (shards 0 and 1 side by side) | 40 a fight, seeds 9100 + 37g |
| Retune road decks (swaps only) | `node tools/skirmish_pass.js curve 40-50 --from=<t>-before --fixes=<t>-fixes --maxmap=20 --decks-only --keep-leaders --keep-first --keep-size --pool --distinct` | 40-50 a trial, seeds 7300 + 37g; a move stays only if it closes the gap by 2+ points on fresh seeds |
| After a retune | `measure ... --tag=<t>-after`, then `apply --fixes=<t>-fixes` and rebuild | 40 a fight |
| The skirmish editor's panel | "This map, new-player win rate" | 30 (the first 30 of the tool's 40) |
| The Starter / Mid-road / Strong curve | `node tools/difficulty_curve.js 60` | 40-60 a fight and deck |
| One card's win rate | `tools/card_balance.js` | 100 (400 for cards a pass confirmed or changed) |
| A skill's worth | `tools/skill_test_robust.js` (robust mode) | 10,000 fights a setup |
| Every card's contribution (random decks, 30-Health brambles, random map fields, Smart CPU both sides) | `node tools/balance/contribution.js --games 135000 --workers 2` (BAL6) | 135,000 fights over every playable card (about 90 minutes on 2 cores); report the split-half reliability and each card's 95% interval |
| A card's contribution and value per budget point (paired swaps against Blanks; any card subset, a map's context) | `node tools/bench/bench.js contrib --cards <ids>` / `--all` (TOOLS1) | 200 fights a card (80 in the 10-28 run of every card); report the 95% interval |
| A skill's worth in budget points against its price (with / without on its carriers, the +1 Attack / +1 Health yardstick) | `node tools/bench/bench.js skill <id>` / `--all` (TOOLS1) | 200 fights a variant (80 in the 10-28 --all run); re-measure a flagged skill at 400 before a price change |
| Focused decks from a card list (at most 6 different cards, 4 copies) | `node tools/bench/bench.js deck --map N` (TOOLS1) | 9,000 search games, 24 an entry for the reported decks |
| The Pool reference against each map's optimum (the heatmap) | `node tools/opt/ref_vs_optimum.js --ref map,ref2,ref-pool --games 200` | 200 a pairing |
| The best deck per map (PRO, BPRO) | `node tools/opt/deckopt.js --maps 0-20 --side --budget 16000 --ladder none --workers 2 --tag <date>-<pkg>-maptrue` and the same with `--bpro` | 16,000 search games a map, then `--final-games` for the reproduce line |
| A PRO against another deck | head to head, seats swapped, no leaders | 400 or more, 95% interval |
| Cards and engine | `node tests/run.js --smoke`, then `--only '<regex>'`, then the full run | per CLAUDE.md |

After any engine change that moves the CPU (EN8 is the example) run the road check: measure the whole road, retune only the road decks, measure again. Report: the fights in band before and after, the mean new-player win rate, the fights still outside, and the open owner call. The worked example is `docs/balance/pro3-road-check-2026-10-25.md`.

Where a result needs the owner's play (Maps 16-24 on his new account, DF-1b; the reference deck as X-REF), say so and ask for it. A simulation does not stand in for his play-through.
