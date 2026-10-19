# Raid balance (package RB, 2026-10-19)

The owner's directions (12:23): allies stay out of the front row; the elders start at 50 Health at most; commas in raid numbers; no damage formula for players; no ×15 (raid damage = bramble damage × the rank multiplier); Health 200k ×3 + 500k; instances of 250; the raid should fall more than 90% of the time for any player base that has unlocked it and taken part; a normal deck should deal more than 100 damage a fight; the boss weakens as it falls; a win counts 1,000, rank multiplier included; and every text, default and threshold that follows from those.

Tools:
- `tools/raid_completion_model.js measure` plays the page's own raid fight CPU v CPU (through `tools/raid_full_sim.js`: `buildRaidFullFight`, the allies, the boss's 3 plays a turn, the elders, the stages and the weakening). It uses the road's reference decks (`WINRATE_REF_DECKS` and `referencePlayerDeck`) at their map's level, against every part, at several points of the raid, and caches the results in `docs/balance/raid-balance-2026-10-19-fights.json`. That file holds 72 cells of 40 fights each.
- `tools/raid_completion_model.js cycle` models one instance's week.
- `tools/raid_cells_table.js` prints the measured cells as a table.

## What changed

| | Before | Now |
|---|---|---|
| Raid damage for a fight | bramble damage × 15, capped at 5,000, × the rank (the Core: × 140) | bramble damage, capped at 1,000, × the rank (B 1.01, A 1.1, S 1.2, SS 1.5, SSS 2.0); the Core the same |
| A win (the part's bramble destroyed) | 10,000, whatever the rank | 1,000 × the rank (SSS: 2,000) |
| Health | 3 × 80,000 per arm and the tail, 8 × 80,000 for the Core (1,360,000) | 4 × 50,000 = 200,000 per arm and the tail, 5 × 100,000 = 500,000 for the Core (1,100,000) |
| The elders (boss units) | basic + (100 − basic) × the raid's share | basic + (50 − basic) × the raid's share; basic ≥ 50: basic |
| The boss's weakening | none | the curve below |
| Allies | played into their own row, then stepped up into your front row whenever it was clear | stay in their own row (`holdRow`) |
| Instance size | 100 | 250 (the server's default: a proposal, below) |
| Stand-ins | 12% of each open part a day | 14% (the floor's knob, below) |
| The Core's stumps | 20 Health | 14 Health (so a normal deck clears 100 on a fresh Core) |
| Tiers (Participant / Competent / Leading) | 1,000 / 10,000 / 50,000 | 500 / 2,000 / 12,500 |
| Weekly quest "Deal N Raid damage" | 20,000 | 4,000 |
| Raid damage medals | 10,000 / 100,000 / 500,000 / 2,500,000 | 2,000 / 20,000 / 100,000 / 500,000 |
| Pay for each fight (`RAID_ATTEMPT_PAY`) | 1 Maple Leaf per 250 raid damage, 3 Magic Dust per 1,000 | 1 per 48, 3 per 190 (a fight pays about what it did) |

A raid edit saved before RB, whether in this browser or published from the raid editor, still carried the old scale. It is brought onto the new one on load (`RaidM.migrateRaidScale`). The editor stamps `scaleV: 2` on save.

## The weakening curve (`RaidM.bossWeakening`, the one place it lives)

    weaken = floor + (1 − floor) × share        floor = tuning.weakenFloor = 0.6
    share  = min(the part's remaining Health / its total, the raid's remaining / its total)

Every boss card of the part fights at `weaken` × its stats: its deck, its rows' decks, its Commons, its guards (the Core's stumps) and its boss unit. That covers Attack and Health, and it is applied after the stage's +Attack (`RaidM.weakenCard`: Attack never drops below 1 if the card had any, Health never below 1). An outer part uses its own share. The Core opens with the raid at 45% left, so it uses the raid's share.

| Health left (share) | 100% | 75% | 50% | 25% | 10% | 0% |
|---|---|---|---|---|---|---|
| Boss card stats | 100% | 90% | 80% | 70% | 64% | 60% |
| A fresh Core (raid share 45%) | | | | | | 78% |

The stages still add their Attack (Enraged +2 below 75% of the raid, Thrashing +4 and 10% less raider bramble below 50%). The weakening now scales that bonus too, so late fights get easier instead of harder.

## Damage per fight by deck strength (40 fights a cell)

The decks are the road's reference decks at their map's level. Map 13 is where the Raid Banner opens: that is the normal deck. Map 10 is the weak deck, and Maps 16 and 20 are the good and strong ones. Damage is averaged over the measured points of each part's life.

| Deck (map) | Arms + tail: bramble damage before RB (avg / worst point) | Arms + tail: bramble damage now (avg) | Worst point | Raid damage now (avg) | Wins | Core: bramble before (avg / worst) | Core: bramble now (avg) | Worst point | Raid damage now | Wins |
|---|---|---|---|---|---|---|---|---|---|---|
| 10 | 57 / 46 | 162 | 138 | 219 | 0% | 15 / 11 | 104 | 63 | 281 | 17% |
| **13 (normal)** | 104 / 80 | **217** | **188** | 311 | 6% | 33 / 23 | **136** | **97** | 453 | 32% |
| 16 | 186 / 143 | 303 | 238 | 627 | 24% | 55 / 38 | 166 | 129 | 691 | 52% |
| 20 | 226 / 171 | 334 | 285 | 791 | 37% | 77 / 60 | 178 | 153 | 842 | 65% |

A normal deck now deals about 190 to 250 bramble damage a fight on the arms and the tail. On the Core it deals about 100 fresh, 141 at half and 170 near the end. The biggest gain comes from the allies holding their rows: they strike from behind instead of dying in your front row. Before RB the same deck dealt about 104 on the arms and the tail and 23 to 52 on the Core. In the model's mix of decks the average fight now counts 479 raid damage, against 2,518 on the ×15 scale.

<details><summary>Every cell (deck × part × the part's Health left)</summary>

| deck (map) | part | part HP left | bramble damage | raid damage | wins | bramble kept |
|---|---|---|---|---|---|---|
| 10 | left | 100% | 138 | 189 | 0% | 100% |
| 10 | left | 75% | 141 | 192 | 0% | 100% |
| 10 | left | 50% | 145 | 193 | 0% | 100% |
| 10 | left | 25% | 159 | 213 | 0% | 100% |
| 10 | left | 5% | 170 | 236 | 0% | 100% |
| 10 | right | 100% | 154 | 207 | 0% | 100% |
| 10 | right | 75% | 164 | 223 | 0% | 100% |
| 10 | right | 50% | 166 | 221 | 0% | 100% |
| 10 | right | 25% | 179 | 246 | 0% | 100% |
| 10 | right | 5% | 184 | 262 | 0% | 100% |
| 10 | tail | 100% | 143 | 186 | 0% | 100% |
| 10 | tail | 75% | 143 | 194 | 0% | 100% |
| 10 | tail | 50% | 156 | 203 | 0% | 100% |
| 10 | tail | 25% | 178 | 231 | 0% | 100% |
| 10 | tail | 5% | 207 | 285 | 0% | 100% |
| 10 | core | 100% | 63 | 88 | 3% | 95% |
| 10 | core | 50% | 108 | 244 | 13% | 100% |
| 10 | core | 10% | 142 | 511 | 35% | 100% |
| 13 | left | 100% | 188 | 254 | 3% | 100% |
| 13 | left | 75% | 204 | 275 | 3% | 100% |
| 13 | left | 50% | 196 | 271 | 5% | 100% |
| 13 | left | 25% | 211 | 280 | 3% | 100% |
| 13 | left | 5% | 232 | 330 | 5% | 100% |
| 13 | right | 100% | 203 | 306 | 8% | 100% |
| 13 | right | 75% | 208 | 320 | 8% | 100% |
| 13 | right | 50% | 227 | 341 | 8% | 100% |
| 13 | right | 25% | 251 | 419 | 15% | 100% |
| 13 | right | 5% | 245 | 342 | 5% | 100% |
| 13 | tail | 100% | 195 | 274 | 5% | 100% |
| 13 | tail | 75% | 207 | 273 | 3% | 100% |
| 13 | tail | 50% | 205 | 308 | 10% | 100% |
| 13 | tail | 25% | 232 | 343 | 10% | 100% |
| 13 | tail | 5% | 249 | 327 | 3% | 100% |
| 13 | core | 100% | 97 | 192 | 10% | 95% |
| 13 | core | 50% | 141 | 436 | 30% | 100% |
| 13 | core | 10% | 170 | 732 | 55% | 100% |
| 16 | left | 100% | 300 | 591 | 18% | 100% |
| 16 | left | 75% | 316 | 645 | 23% | 100% |
| 16 | left | 50% | 305 | 652 | 28% | 100% |
| 16 | left | 25% | 319 | 729 | 35% | 100% |
| 16 | left | 5% | 320 | 690 | 28% | 100% |
| 16 | right | 100% | 317 | 645 | 23% | 100% |
| 16 | right | 75% | 329 | 701 | 28% | 100% |
| 16 | right | 50% | 327 | 745 | 33% | 100% |
| 16 | right | 25% | 356 | 850 | 40% | 100% |
| 16 | right | 5% | 343 | 786 | 38% | 100% |
| 16 | tail | 100% | 238 | 406 | 10% | 100% |
| 16 | tail | 75% | 249 | 414 | 10% | 100% |
| 16 | tail | 50% | 250 | 443 | 13% | 100% |
| 16 | tail | 25% | 282 | 494 | 13% | 100% |
| 16 | tail | 5% | 294 | 611 | 23% | 100% |
| 16 | core | 100% | 129 | 344 | 23% | 100% |
| 16 | core | 50% | 172 | 663 | 50% | 100% |
| 16 | core | 10% | 196 | 1065 | 83% | 100% |
| 20 | left | 100% | 332 | 781 | 35% | 100% |
| 20 | left | 75% | 342 | 874 | 43% | 100% |
| 20 | left | 50% | 338 | 821 | 40% | 100% |
| 20 | left | 25% | 353 | 890 | 45% | 100% |
| 20 | left | 5% | 342 | 843 | 43% | 100% |
| 20 | right | 100% | 349 | 818 | 38% | 100% |
| 20 | right | 75% | 345 | 846 | 40% | 100% |
| 20 | right | 50% | 350 | 888 | 45% | 100% |
| 20 | right | 25% | 368 | 925 | 45% | 100% |
| 20 | right | 5% | 365 | 981 | 53% | 100% |
| 20 | tail | 100% | 285 | 489 | 13% | 100% |
| 20 | tail | 75% | 294 | 605 | 23% | 100% |
| 20 | tail | 50% | 293 | 624 | 25% | 100% |
| 20 | tail | 25% | 320 | 730 | 40% | 100% |
| 20 | tail | 5% | 338 | 756 | 35% | 100% |
| 20 | core | 100% | 153 | 484 | 35% | 100% |
| 20 | core | 50% | 183 | 838 | 65% | 100% |
| 20 | core | 10% | 199 | 1203 | 95% | 100% |
</details>

## Completion: participants × the share of weeks in which the raid falls

The model runs one instance for a week (200 weeks per row):
- **Tickets:** each player has a cap of 10, gains +1 a day and gets the weekly top-up, so at most 16 fights.
- **Play rate:** each player uses a share of their tickets drawn uniformly from 35% to 85% (60% on average). The second table uses 20% to 60% (40% on average).
- **Decks:** 20% weak (Map 10), 40% normal (Map 13), 25% good (Map 16) and 15% strong (Map 20).
- **Each fight:** draws a measured result for that deck, part and point of the part's life. Parts are picked at random among the open ones.
- **Stand-ins:** as in `raidState`.
- **A fallen raid** returns 24 hours later.

"Completed" means the first life falls inside the week.

| Participants | 10 | 20 | 30 | 40 | 50 | 75 | 100 | 150 | 200 | 250 |
|---|---|---|---|---|---|---|---|---|---|---|
| **Shipped (stand-ins 14%), 60% of tickets** | 0% | 83% | **100%** | 100% | 100% | 100% | 100% | 100% | 100% | 100% |
| Day it falls | | 6.95 | 6.77 | 6.56 | 6.35 | 5.87 | 5.45 | 4.73 | 4.17 | 3.72 |
| Shipped, 40% of tickets | 0% | 14% | 85% | **100%** | 100% | 100% | 100% | 100% | 100% | 100% |
| Stand-ins 12% (before RB), 60% of tickets | 0% | 0% | 0% | 0% | 6.5% | 100% | 100% | 100% | 100% | 100% |
| Health × min(1, max(30, participants) / 250), stand-ins 12% (not shipped) | 93% | 100% | 100% | 100% | 100% | 100% | 100% | 100% | 100% | 100% |
| Day it falls (scaled Health) | 6.46 | 5.0 | 4.03 | 3.99 | 3.98 | 4.0 | 4.0 | 3.98 | 3.97 | 3.97 |

Before RB, on the ×15 scale with the old fights, the raid fell 1 to 4 times a week: on day 5.65 with 30 players and on day 1.37 with 250.

**The floor (owner call): 30 participants.** At 60% ticket use, 30 or more participants complete 100% of weeks, and 20 complete 83%. At 40% ticket use, 40 or more complete, and 30 complete 85%. Raising the per-fight damage could not move the floor: 50 players would need about twice the damage of 250 players, or wins in most fights. A small instance's week is carried by the stand-ins:
- With 30 players, the players deal about 12% of the 1,100,000 and the stand-ins the rest. The stand-ins count the Core's days from the start of the life, so the Core falls quickly once the arms and the tail are down.
- Stand-ins at 15% would make every week fall by day 6.67 even with a single player.

**Scaling the Health by participants (considered, not shipped):** every instance falls on about day 4, whatever its size. Each player's fights count for the same share of the raid, so a small instance earns its fall instead of leaning on the stand-ins. The trade-offs:
1. The Health a raider sees moves with the head count.
2. A plain "Health × participants / 250" counted live is not monotonic. A new raider joining after a kill would bring the raid back, and the kill-time search (`killTimeOf`) assumes Health only falls. Monotonic forms exist, each with a cost:
   - Size each life by the participants of the life before it. The week's first life would need last week's attempts.
   - Weight each fight by 250 / max(30, the participants so far). Early fights of a big instance then count up to 8×.
3. The server would have to agree on the count. Today every client works the Health out from the attempts.

## The tiers, old → new (owner calls)

The bars were set for the ×15 scale. The new bars keep the same share of qualifying lives, measured among the lives that have the tier's fights (3+ for Participant, 4+ for the others). The old shares come from the pre-RB code and fights; the new bars come from the new world.

| Tier | Fights | Old bar | Reached (old world) | New bar | Reached (new world) |
|---|---|---|---|---|---|
| Participant | 3+ | 1,000 | 98.5% | **500** | 97.9% |
| Competent | 4+ | 10,000 | 60.4% | **2,000** | 63.8% |
| Leading | 4+ | 50,000 | 0.1% | **12,500** | 0.1% |

Leading was already practically out of reach: it took about five wins in one life. At the same share it stays that way. A bar of 7,500 would let about 5% of the lives with 4+ fights reach it. The RC shard amounts are by tier, so they do not change. NV's "Full reward from 40 bramble damage" chip (`minDamage` 40) counts bramble damage, so it does not change either. A normal deck deals four or more times that.

## The server (not applied)

`supabase/proposed/20261019_raid_cap_250.sql` changes `join_raid_instance`'s default instance size from 100 to 250. The published raid's `instanceCap` still wins when it is set. So **republishing the Goliath from the raid editor** (it now saves `instanceCap` 250 and the new scale) does the same without the SQL. The rows' damage check (0..10000) is left as it is: a fight now counts at most 2,000.

## Reproduce

    node tools/raid_completion_model.js measure --n 40            # ~6 min, writes the fights JSON
    node tools/raid_completion_model.js cycle --cycles 200 --players 10,20,30,40,50,75,100,150,200,250
    node tools/raid_completion_model.js cycle --rate 0.2,0.6      # 40% of tickets
    node tools/raid_completion_model.js cycle --standins 12 --scale 1 --floor 30   # Health scaled by participants
    node tools/raid_cells_table.js --md

## RB2: the part brambles 350, the elders 55 (package RB2, 2026-10-19)

The owner (16:22): "Raids can have special super-high health brambles. Maybe less than 420." (16:28): "let it remain at 350HP. Then now with the mega nerf, make the raid very slightly harder. its playing 3 cards at a time right?"

- **The arms' and the tail's bramble: 350 a fight** (was 420; 2.33× the raiders' merged 150). The Core keeps its 200 behind the stumps.
- **The elders start at up to 55 Health** (`bossHpBonusMax`, was 50). This is the "very slightly harder" lever: of the three tried, it lands closest to halfway between 420 and plain 350 on the arms and the tail, and it barely moves the Core, whose bramble did not change.
- A raid edit saved on RB's scale (scale 2) takes the shipped 350 where it still holds 420, and 55 where it still holds 50. Values an admin set otherwise stay (`RaidM.migrateRaidScale`, scale 3). The raid editor's new part starts on 350.
- **The boss plays 3 cards a turn**, as RV2 built it: its front row's through the CPU (`aiTakeTurn`), then one card into its middle row and one into its back row (`raidBossRowPlays`, `RAID_BOSS_PLAY_ROWS = [1, 2]`). A row play waits when that row already holds `rowCap` (2) live units, or when no free slot has a unit in front of it. Map 13 on the left arm (12 fights, 240 turns): 0.64 front-row plays and 0.78 row plays a turn. Of 480 row-play chances, 59% waited on a full row (rowCap), 7% found no covered slot and 34% landed. All 3 landed in 16% of turns. The boss tries 3 every turn, and its rows' caps hold it to about 1.4 on average.

The fights were re-measured with today's cards (40 fights a cell, the same seeds for every candidate): `docs/balance/raid-balance-2026-10-19-fights-420.json` (before) and `raid-balance-2026-10-19-fights.json` (shipped). The whole world is harder than when RB measured it, for example a fresh tail for Map 13 is 100 now against RB's 195, so the "before" column is today's 420, not RB's table above.

**Arms and tail, per deck: bramble damage a fight (average / worst point), raid damage a fight, wins (the bramble broken)**

| Deck (map) | 420 (before) | 350 | 350, floor 0.65 | 350, stages +3 / +5 | **350, elders 55 (shipped)** |
|---|---|---|---|---|---|
| 10 (weak) | 136 / 73 · 171 · 0% | 136 / 73 · 173 · 0.3% | 133 · 170 · 0.3% | 132 · 164 · 0.2% | **130 / 73 · 165 · 0.3%** |
| **13 (normal)** | 177 / 104 · 214 · 0.3% | 175 / 104 · 254 · 5.7% | 173 · 248 · 5.3% | 171 · 237 · 4.2% | **168 / 100 · 230 · 4.0%** |
| 16 (good) | 264 / 145 · 488 · 18.7% | 246 / 144 · 613 · 33.5% | 244 · 593 · 31.8% | 240 · 572 · 30.7% | **241 / 141 · 566 · 29.8%** |
| 20 (strong) | 304 / 192 · 636 · 30.5% | 279 / 188 · 740 · 42.8% | 276 · 724 · 41.7% | 273 · 703 · 40.2% | **274 / 185 · 700 · 40.2%** |

**The Core (bramble 200 throughout):** Map 13 deals 112 a fight with 24.2% wins at RB's numbers, and 110 with 23.3% at elders 55. Stages +3 / +5 would cut that to 108 and 20.8%, so they harden the Core, which the bramble change never eased. Maps 10 / 16 / 20 at elders 55: 90 / 145 / 166, with 13% / 38% / 55% wins.

A normal deck still meets a wall. It ends 96% of its fights on the arms and the tail with the bramble standing, at 168 damage a fight (worst point 100: the fresh tail). Only good and strong decks break it often (30% / 40%). A win counts 1,000 × the rank, so the lower bramble mostly adds wins, not damage: Map 13 earns 214 → 254 raid damage a fight at plain 350, and 230 shipped, about halfway. The floor lever hardly bites because `weakenCard` rounds a 2–5 Attack card back to the same number.

**Completion** (200 weeks a row, 60% of tickets):

| Participants | 20 | 30 | 40 | 50+ | Raid damage a fight (model's mix) |
|---|---|---|---|---|---|
| 420 (before, today's cards) | 11.5% | 90% | 100% | 100% | 357 |
| 350 | 28% | 96.5% | 100% | 100% | 410 |
| 350, stages +3 / +5 | 21.5% | 94% | 100% | 100% | 393 |
| **350, elders 55 (shipped)** | 20.5% | **95%** | 100% | 100% | 380 |

The raid falls on day 6.93 with 30 players and day 4.31 with 250. RB's goal holds: 30+ players complete at least 90% of weeks. At 40% ticket use the floor is about 50 players: 50 complete 97.5% shipped (95% at 420 today), while 40 complete 77.5% and 30 complete 20%.

Tiers, shipped (any participant-life): Participant 76.5%, Competent 37.9%, Leading 0.1% (93% / 53.8% / 0.1% of the lives with the tier's fights). These are close to RB's.

    node tools/raid_completion_model.js measure --n 40 --castle 420 --out FILE          # --castle / --core-castle / --elders / --stage-atk try values without editing raids.json
    node tools/raid_completion_model.js measure --n 40                                 # the shipped brambles and elders (~10 min)
    node tools/raid_completion_model.js cycle --cycles 200 --players 10,20,30,40,50,75,100,150,200,250

## Package MX: the raid Shield 50 (2026-10-19, owner 22:47)

The boss's bramble in each raid fight now opens with a Shield of 50 × the part's remaining share (`RaidM.raidShield`): 50 fresh, 25 at half, 0 at the end. The Shield soaks hits before Health, and only Health lost counts as raid damage. Measured on today's code (after the RR merge) with the same seeds at Shield 0 and Shield 50, n 20 a cell. Files: `raid-balance-2026-10-19-fights-mx-shield0.json` / `-shield50.json`.

| Deck (reference) | Damage a fight, avg (0 → 50) | Fresh arm/tail | Half-down arm/tail | Fresh Core | Wins |
|---|---|---|---|---|---|
| Map 10 | 216 → 197 | 203 → 159 | 226 → 206 | 121 → 103 | 26% → 23% |
| **Map 13** | **252 → 235 (−7%)** | **248 → 209 (−16%)** | 268 → 252 | 148 → 131 | 37% → 32% |
| Map 16 | 298 → 289 | 310 → 288 | 314 → 305 | 168 → 154 | 68% → 62% |
| Map 20 | 304 → 295 | 317 → 295 | 317 → 307 | 184 → 174 | 74% → 68% |

**Completion** (200 weeks a row, the model's deck mix, 60% of tickets, the raid's stand-ins at 12%/day):

| Participants | 30 | 40 | 50 |
|---|---|---|---|
| Shield 0 | 100% (day 6.53) | 100% (day 6.21) | 100% (day 5.94) |
| **Shield 50** | **100% (day 6.57)** | **100% (day 6.27)** | **100% (day 6.02)** |

Raid damage a fight across the mix falls from 788 to 736 (−7%). The fall comes about 0.05–0.08 days later. With no stand-ins, neither version falls with 30–50 players: their median raid damage a life is 6,000 → 4,840 (−19%), so at that size the stand-ins carry the kill either way. Nothing else was retuned (the owner chose 50).

    node tools/raid_completion_model.js measure --n 20 --decks 13 --shield 0 --out FILE    # --shield N tries another raid Shield (0 = off)
