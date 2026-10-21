# Package RP checkpoint (rewards and sources pass, 2026-10-21)

Scope: card SOURCE / placement / reward fields only (never attack, health or effects; BF5 re-derives stats in parallel).

## Plan
1. Audit every card into one category (skirmish reward, pack, faction reward, raid / smith / nest / base / Easter egg / awaitingSource). Fix overlaps.
2. Faction rewards: Otter- and Hummingbird-side cards into the Factions pool (tier 11 + side); `factionRewardTrack` with rarity gates by
   faction cards received (25 / +15 / +10 ...) and map floors (Rare Map 14, Very Rare Map 25); hand-out hooks (every K first clears,
   elite / boss first clears, the 0-2 pack, achievements). Simulate the road, tune K.
3. Maps 0–1 rewards vanilla (one Lumber card on Map 1); propose a Quarry Mole replacement.
4. Devilry (66), Ecclesia (77), Evomax (30) gates: their cards off every source before those maps.
5. Submaps: gates (Smugglers' Grotto after Map 7, a gate for each), at most 1 unique reward each.
6. docs/map-recommendations-2026-10-21.md; decisions (rules entry); CHANGELOG; tests/rewards-pass-2026-10-21.js.

## State
- [ ] code: FACTION_REWARD_TRACK region in arena_app.js
- [ ] data plan docs/balance/rewards-pass-2026-10-21.json + tools/rewards_pass_2026_10_21.py (applies it, keeps cards.json's format)
- [ ] submap gates in CONQUEST_MAPS
- [ ] sim tools/faction_track_sim_2026_10_21.js
- [ ] tests, docs, decisions, CHANGELOG, build, commit
