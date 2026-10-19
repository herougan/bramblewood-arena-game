# RB checkpoint (package RB, raid balance, 2026-10-19)

Done (committed as WIP RB):
- A: ally units hold their row (engine advanceReserves skips holdRow; raidAllyPlays + ally leaders set holdRow). tests/raid-ally-rows-2026-10-19.js passes (206 plays), fails on the old code.
- B: bossHpBonusMax 50 in canonical/raids.json; comments.
- C1: raidLocale()/raidNum() in arena_app.js; every toLocaleString in the raid region takes the game's language; claim screen gets opts.locale.
- C2: NV breakdown line admin-only.
- C3/C8: RaidM.contributionFor: bramble x perInFightHp(1) capped 1000, x rank; a win 1000 x rank. SCORING_DEFAULTS.
- C4: parts 4 x 50,000 (x3) and core 5 x 100,000; core scoring override (140) removed.
- C5: instanceCap 250 (raids.json, INSTANCE_CAP_DEFAULT); supabase/proposed/20261019_raid_cap_250.sql.
- C7: RaidM.bossWeakening / weakenShare / weakenCard (floor 0.6, after the stage bonus, share = min(part, raid)).
- Editor defaults; per-attempt pay x15 (RAID_ATTEMPT_PAY); paged live rows (RAID_LIVE_PAGE).
- Texts: ui.rb-rule-weaken, ui.rb-fight-note, ui.rb-ally-row-mid, ui.raid-rule-win changed; 12 packs.
- tools/raid_completion_model.js (measure / cycle); tools/raid_full_sim.js s<share> states.

Pending:
- Measurements: scratchpad m_old.json (pre-RB world) and m_v2.json (post-stage weakening).
- Tier thresholds (RB_TIER_DAMAGE placeholder still 1000/10000/50000), weekly quest 20,000 and raidDamage medals.
- Existing raid tests to update; new tests/raid-rb-2026-10-19.js; docs/balance/raid-balance-2026-10-19.md; CHANGELOG; keyify/export texts; build; merge main.
