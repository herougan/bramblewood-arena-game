# Progression plan

The owner's definitions for where cards come from, how many of each kind the game should have, and the balancing suggestions made from them. This file is the canonical text; the hub's 📚 Progression plan tab renders it, with the live counts from `node tools/progression_plan_2026_10_23.js` (`docs/balance/progression-plan-2026-10-23.json`).

Quotes are the owner's words (notes of 2026-10-23, 19:27 and 19:36). Nothing here changes the game; package RW5 fixed the data (see Leftover mistakes).

## Definitions

Each one is an owner definition, 2026-10-23.

- **Tutorial base cards.** The cards of the tutorial and about half of Map 0. They come from random rewards from quests and along the journey; the random card rewards of Maps 0-4 have a small chance to drop one. "Only for collection I guess, not really essential."
- **Base.** "The starting cards shall be called 'base'." Base cards other than the faction cards: about 10 or fewer. The Wandering Traveller is a Base card, not a faction pool card.
- **Skirmish base.** The new name for the skirmish exclusives: cards a skirmish gives on its first clear, never sold in a pack.
- **Pack 1, Pack 2, Pack 3.** By the map where a card is found: Maps 0-6 go into Pack 1, Maps 7-13 into Pack 2, Maps 13-20 into Pack 3. "There's lava creatures in Pack 1 currently." Side-map (submap) cards go into the pack tier that follows the maps that unlock them.
- **Faction pool.** Holds both sides' cards ("that's how you would get the other faction's cards") and the shared ones. A limited pool that you empty slowly; it grows as more faction cards unlock and are added. As a rule, 1 copy of each Base card is in it too. The number of copies of a card in the pool is the most duplicates of it you can hold in a deck. Higher faction tiers unlock by progress; faction cards come only in one-time quests or certain skirmishes. "Depending on your faction, you will slowly get 1-2x of each copy along the way, climbing the rarity tree."
- **Standard faction rewards.** A predictable rarity pattern: Common, Common, Common, Uncommon, Common, Common, Uncommon, Common, Uncommon, Rare, ...
- **Set and random faction rewards.** "There are set faction rewards and random faction rewards." The Otter / Hummingbird road rewards should be just the faction card rewards ×3, then ×3 again; no fast Uncommons and Rares (item 10).
- **Pacing check for the standard pattern** (19:36). "If by Map 15 you already reached the very rare cards, then there's too little. If you are still hitting uncommons at Map 17, then there's too many." Too many: move cards around. Too few: add new cards.
- **Faction cards outside the faction packs** (19:36). None, except neutral otters (1-2) and traitor or neutral hummingbirds (1-2).
- **Collector packs.** The new name for the advanced packs. "Foil treatment 'upgrade fragments' needed / bars need 10% more."
- **Pack Secrets I.** Packs 1 to 6 have a small chance (under 1%) for a card slot to be a secret card from this pool. It holds esoteric cards, like the Mystery Booster's.
- **Tavern cards.** Any card from the packs, plus about 15 Tavern-unique cards, thematic to Map 21 and before. "We can only pick the most thematic to be in each place."
- **Quest-only specials.** The special cards in 10 / 15 and especially Map 20 come only from quests. Most can be had by Map 21; some need more exploration.
- **Level 0.** Only the tutorial base units and the baby cards start at Level 0. The other Base cards are raised in the hatchery (the Nest) to Level 1, then forged to Level 10 like normal.
- **Babies.** Dropped like eggs, and rare. Eggs and babies can be played. They hatch and change into something else. There is no way to bring them to Level 1 or above.
- **Craftable.** Most pack cards and most Base cards.
- **The end of each map** (19:36). A pack of 3 + 1 faction pack, matching that map series.
- **Duplicates early** (19:36). Besides the starting deck, give 1 copy of each card, not several.
- **Pace** (19:36). The player clears Gannet Cliffs completely in 1-2 sessions; around sessions 3-4 they start buying packs at the gator map (Gatorback Swamp, Map 5).
- **Killer Veggies** (future). In a special cabbage patch: "Funny thing where people think it's just a farm."

## Targets

| Bucket | Target |
|---|---|
| Faction pool, Otter side | about 16 |
| Faction pool, Hummingbird side | about 16 |
| Faction pool, shared | 10-20 |
| Base (not tutorial base) | about 10 or fewer |
| Pack 1 + skirmish base, Maps 0-7 | 30 + 15 ("some of Map 0 are base cards") |
| Pack 2 + skirmish base, 7 maps | 30 + 15 |
| Pack 3 + skirmish base, 7 maps | 30 + 15 |
| Tavern-unique | 15 |

The hub's tab shows today's count for each, the gap, and every card in it, sortable by advancement (the map where the card first becomes obtainable).

## Open questions

RW5 (2026-10-23) built the default of each (decisions PP-1, PP-2, PP-3): packs 0-6 / 7-13 / 14-20; the pattern's R skipped before Map 14; Level 0 only for the tutorial base and the babies.

- **Pack ranges.** Item 15 gives Maps 0-6 / 7-13 / 13-20 (Map 13 is in two packs); the 19:27 note gives Pack 1 over Maps 0-7 (8 maps) and Packs 2 and 3 over 7 maps each, which reads as 0-7 / 8-14 / 15-21. The counts here use item 15, with Map 13 in Pack 2.
- **Level 0 for Base cards.** "Only the tutorial base units and the baby cards" start at 0, but also "the other base cards that aren't babies can be raised in the hatchery to Level 1". Read here as: every Base card starts at 0 and the Nest raises it, babies cannot be raised.
- **Standard pattern past the 10th reward.** The pattern is written for 10 rewards. The pacing check reads it two ways (see Suggestions).

## Leftover mistakes (HUB3) and what RW5 fixed

The hub's list (`mistakes` in `docs/balance/progression-plan-2026-10-23.json`) re-checks itself on every run of the tool; a fixed one carries `fixed: "RW5 (2026-10-23)"`.

- [x] 1. The three packs shared one pool, with lava creatures in Pack 1: each pack has its own pool by map now (`tools/rw5_pack_tiers_2026_10_23.js`, PP-1 default).
- [x] 2. Pack cards whose source map and first map pool disagreed: re-pointed to the pool's map; 10 are held (6 where that puts them over budget, 4 that are a map's first-clear pack card; decision RW5-3); some of them so sit one pack tier later than the side map where you meet them.
- [x] 3. Pack cards with no map: each got a map by theme (the tool's NOMAP table).
- [x] 4. Pack cards naming a map but in no pool: added to that map's pool.
- [x] 5. The Hummingbird faction cards that came as Base: in the faction pool (side tribes); the Cobalt-talon Fledgling stays Base (the Hummingbird starting deck).
- [x] 6. Base above ~10: 6 now (with the Ember Tetra, decision RW5-4).
- [x] 7. Faction cards outside the faction pool: 2 neutral otters (Otter Guard, the River Bundle egg), no Hummingbirds.
- [x] 8-11. The faction pool holds both sides and 1 of each Base card, copies = the deck cap, set rewards follow the standard pattern (PP-2 default), random rewards keep the gates.
- [ ] 12. The Mystery Booster / Pack Secrets I pool is still empty (not in RW5).
- [x] 13. Level 0: only the tutorial base and the babies (PP-3 default).
- [x] 14. Collector packs.
- [ ] 15. "Skirmish base" naming in the Codex (not in RW5).
- [x] The junk id `ember-tetra-3caj` is `ember-tetra`.

Note (RW5): the hub counts 30 faction cards and others as "unplaced" because they carry the old `unattainable` flag, but the game no longer reads that flag (obtainability comes from the source, `isUnattainable`), so those cards are in the game's pools today. `tools/rw5_faction_pacing_2026_10_23.js` reads the pool as the game builds it (and, for comparison, with the flagged cards left out).

## Balancing suggestions

Suggestions only; no game numbers were changed. Every number comes from a run named here: `tools/hub3_balance_probe_2026_10_23.js` (`docs/balance/hub3-probe-2026-10-23.json`, 100 games a fight and side), `tools/eb_early_road_2026_10_23.js`, `tools/progression_plan_2026_10_23.js`, `tools/resources_week_2026_10_23.js`, and EN2's `docs/balance/en2-gannet-*.json`.

<!-- SUGGESTIONS:BEGIN (written from the probe's numbers, 2026-10-23) -->
### 1. Map 0 with the tutorial deck, and your bramble

Measured with the starting deck the game builds after T-2 (each side, every copy at Level 0), the CPU playing your side. Mean win rate of the three sides, target from the road curve:

| Fight | Target | Today | Your bramble +5 | +10 | Tutorial base at 80%, both sides | 80% in enemy decks only |
|---|---|---|---|---|---|---|
| 0-1 | 90 | 92 | 96 | 98 | 97 | 100 |
| 0-2 | 75 | 84 | 88 | 90 | 78 | 92 |
| 0-3 | 60 | 71 | 81 | 88 | 47 | 74 |
| 0-4 | 45 | 41 | 47 | 53 | 34 | 53 |
| 1-1 | 90 | 87 | 92 | 94 | 68 | 87 |
| 1-3 | 70 | 76 | 82 | 87 | 48 | 79 |
| 1-5 | 40 | 41 | 49 | 55 | 16 | 43 |

- On paper Map 0 sits on its targets; your bramble already has 15 against the enemy's 5-12. The sim's player never misplays, so what you felt is the gap between a new human and the CPU. The cheapest fix is **your bramble +5 on Maps 0-1 only** (via EARLY_BRAMBLE_LEAD or the tutorial / Map 0 bramble). It lifts every fight 4-10 points and keeps the map enders (0-4, 1-5) under 50%. +10 makes 0-3 and 1-3 too easy (88, 87).
- **Weakening the tutorial cards on both sides makes the road harder, not easier.** Your starting deck is mostly tutorial base, but Map 1's enemies are not: at 80%, 1-5 drops from 41% to 16% and 1-1 from 87% to 68%. Weaken them only in the enemy decks (the last column: 0-4 goes 41 → 53, Map 1 barely moves), or weaken the cards and give the player's copies Level 1 stats.

### 2. Skills shown in Maps 0-1

What a player meets today (tutorial decks, the starting deck, Map 0 and Map 1's enemies and rewards): Flying, Quick, Swarm, Armor, Poison, a triggered ability (Map 0 enemies), Boomerang, Esprit, Tide (starting deck; Tide shows "?" until Map 2), Lumberjack (Map 1). The tutorial decks teach only Flying. Map 1's 12 enemy cards carry just Swarm and Lumberjack, so the second map adds almost nothing. Suggestion: give each Map 1 fight one showcase card with a new easy skill (Taunt or Guardian, Evasive, Thorns, Reach, Armor), and make 1-2's or 1-3's reward one of them, so there are about 6 skills by the end of Map 1.

### 3. Gannet Cliffs as a damage race

EN2 already took the reference decks from about 57% to 76-82% here (`docs/balance/en2-gannet-*.json`). The probe measures the race with the game's reference deck (100 games a fight):

| Map | Win % | Rounds | Your damage into the bramble | Enemy units you kill | Your units they kill |
|---|---|---|---|---|---|
| 1 Thistlewood | 84 | 6.8 | 19% | 2.8 | 1.7 |
| 2 Pebble Beach | 45 | 9.8 | 30% | 3.4 | 4.6 |
| 3 Gannet Cliffs | 96 | 6.6 | **45%** | 2.5 | **1.3** |
| 4 Sunken Hollow | 42 | 8.0 | 20% | 2.0 | 3.7 |

At Gannet, almost half of your damage goes into the bramble and the enemy kills about one of your units a game. The two sides barely meet; it is a race. The flyers fly over your lanes and your ground units walk past them. Suggestions:
- 1-2 Wait-1 ground blockers (Guardian or Taunt) in each Gannet deck, so you have to trade before you can hit the bramble. These are the 1-Wait creatures you were hoping for.
- A Reach (anti-flyer) card among Map 2's rewards, so you have an answer the turn the birds arrive.
- Pebble Beach (45%) and Sunken Hollow (42%) sit well under the road curve for the reference deck and are steeper than Gannet now. Re-check them after EN2 before you move Gannet again.

### 4. Pace: Gannet in 1-2 sessions, packs in sessions 3-4

`tools/resources_week_2026_10_23.js` assumes a 45-minute session, about 3 minutes a fight, 75% of first tries won, and a full Energy cap of 20 at the start (29 Energy a session with regen). Clearing Gannet Cliffs takes 28 fights and 77 Energy: **2.7 sessions**, and Energy is the limit (time alone would be 1.9). Reaching the Gatorback Swamp's packs takes 3.8 sessions, inside the target. To bring Gannet to 1-2 sessions, either lower Maps 2-3's fight cost from 4 Energy to 2-3 (mapEnergyBase) or start the Energy cap at 30.

### 5. A pack of 3 + 1 faction pack at the end of each map

Cards received (copies) from the first clear of every main-map fight, today and with the proposal (+3 pack cards and +3 faction-pack cards a map):

| By the end of | Today | With the proposal |
|---|---|---|
| Map 3 (Gannet Cliffs) | 60 (20 of them the starting deck) | 84 |
| Map 7 | 109 | 157 |
| Map 13 | 184 | 268 |
| Map 20 | 278 | 404 |

That is +40% by Map 3. To keep "only 1 copy per card early", draw those packs new-cards-first (the faction pool already weights unowned cards ×3; make it strict until the map's pool is collected). Today the faction track gives 12 faction cards by Map 3 out of a 9-card Otter side, so duplicates are guaranteed there.

### 6. An Ant deck

Six Ant-type cards can be had today: Worker Ant and Ant Scout (tutorial base), Forager Ant and Tunnel Ant (Base), Fire Ant Raft (Pack 1, Map 5) and Leafcutter Gardener (Pack 2, Map 7). Soldier Ant, Ant Warrior and Ant Hill exist but cannot be obtained. Base cards come one copy each, so by Map 3 an Ant deck has at most 4 cards. Suggestions: Soldier Ant as a Map 1 skirmish base reward, Ant Warrior moved from Map 7 into Pack 1 (Maps 2-4), Ant Hill as a Map 4 skirmish reward, and the Hive Bundle (FACTION_PACKS "hive") as one of the end-of-map faction packs for Maps 1-4. That gives about 8 Ant cards (12-15 copies) by Map 4. EN2's Swarm-by-Type then pays for staying mono-Ant.

### 7. The standard faction reward pattern on the road

Today the road hands out 12 faction cards by Map 3, 26 by Map 7, 45 by Map 15 and 64 by Map 20 (`tools/faction_track_sim_2026_10_21.js`). The pattern C, C, C, U, C, C, U, C, U, R ... placed on those hand-outs:

| Pool | First Rare | First Very Rare or higher | Last Uncommon | Verdict |
|---|---|---|---|---|
| Today's live faction cards (13, both sides), copies = deck cap | 10th, Map 3 | Super Rare 30th, Map 9 | Map 12 (runs dry at Map 13) | too few cards |
| Target 16 + 16 + 15 shared, 5 copies of each Common (deck cap) | 10th, Map 3 | never by Map 60 | Map 60+ | too many copies |
| Target pool, "1-2× of each" (2 of your side and shared, 1 of the other side) | 10th, Map 3 | Very Rare 70th, Map 23 | Map 21 | slightly too many |
| The literal block of 10, its 10th step one rarity higher each time | 10th, Map 3 | Very Rare 20th, Map 6 | — | far too few |

- The target pool works with the "1-2× of each" copies. To pass Uncommon by Map 17, the last Uncommon (65th reward today) has to come by about the 47th (the count at Map 16): take about 18 Common and Uncommon copies out (for example the other side's Commons and Uncommons), or add about 18 hand-outs by Map 16. Very Rare then lands near Map 18, still after 15.
- Under any reading, the pattern's first Rare is the 10th reward, which lands on Map 3. The Oct 21 rule says "the rare should only come in Map 14+". Decide which one wins: either the pattern's first block runs to about 40 rewards before the R, or the Rare gate goes.
<!-- SUGGESTIONS:END -->

## The grind to each gate (BAL2, DF-2)

Owner, 2026-10-23 17:34 on DF-2: "DF-2 OKAY. But of course, don't look down on the grind they have to do to level up their cards to that tier's gate." Built by BAL2 (2026-10-24): Base cards (the ones you own from the start) stop at Lv 4 and pay the full Forge cost (x1, was x0.5); a skirmish's own first-clear card drops 10% a repeat win (was 3% x its rarity share). Levels gate by map (the Forge tiers and the Lv 5 / 9 / 10 / 11 gates at Maps 16 / 26 / 31 / 50), and the gate is only where the grind starts.

What a deck pays to reach each tier's cap (from `canonical/upgrade-costs.json`; `node tools/bal2_grind_2026_10_24.js`). Copies level one at a time, so a 20-copy deck pays twenty times; Leaves cost two thirds of the Dust; map-reward cards pay x0.5, pack cards x1, Base cards x1 and stop at Lv 4. Income is the daily notices, about 3,450 Dust a week at six a day (first clears add more on the maps you are on).

| Forge tier (opens) | Cap | One Common copy: map card / Base card / pack card (Dust) | A 20-copy road deck (12 C, 6 U, 2 R): map cards / pack cards (Dust) | The same Base deck (20 Commons, Lv 4 at most) | Tier upgrade | Weeks of notices (map deck, from the last cap) |
|---|---|---|---|---|---|---|
| Village Forge (Map 11) | Lv 3 | 40 / 79 / 79 | 1270 / 2528 | 1580 | - | 0.4 |
| Iron Forge (Map 13) | Lv 4 | 27 / 53 / 53 | 854 / 1696 | 1060 | 300 Dust, 600 Leaves | 0.3 |
| Ember Forge (Map 16) | Lv 8 | 167 / - (stops at 4) / 333 | 5334 / 10656 | - (stops at 4) | 800 Dust, 1500 Leaves | 1.8 |
| Dragonfire Forge (Map 26) | Lv 9 | 67 / - (stops at 4) / 133 | 2134 / 4256 | - (stops at 4) | 1500 Dust, 3000 Leaves | 1.1 |
| Heartfire Forge (Map 31) | Lv 10 | 73 / - (stops at 4) / 146 | 2336 / 4672 | - (stops at 4) | 2500 Dust, 5000 Leaves | 1.4 |

In all, Lv 1 -> 10: one Common map card 372 Dust, a pack card 744; the 20-copy map deck 11904 Dust (3.5 weeks of notices), the pack deck 23808. A Base deck to Lv 4: 2640 Dust (was 1320 at x0.5).

The copies come first. A 4-copy set of a map card takes its first clear plus three drops: at 10% a repeat that is about 30 repeat wins (30 Energy for a skirmish), so a map's two or three exclusive cards at 4 copies each cost about 60-90 repeats, which is why the 4-copy decks form by about Maps 10-15 and not at once (the DF-2 model). A pack card's copies come from packs instead. The Base deck stays the cheap deck it was until Lv 4 (2,640 Dust for 20 copies, about 0.8 weeks of notices) and then stops, while the road's own cards keep growing to Lv 8 at the Ember Forge for about 5,300 Dust more (1.8 weeks).
