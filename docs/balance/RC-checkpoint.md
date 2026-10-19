# Package RC checkpoint (2026-10-19)

Owner 09:53: "Raids almost never give raid cards. only maybe pack cards or faction cards (maybe), raid cards must be crafted in the Forge. Under a special tab."

## Plan
1. bramblewood-raid.js: RAID_CARD_DROP_CHANCE (1.5%), RAID_REWARD_TABLE per participation level, raidReward returns
   packCards/cardChance (pack-or-faction), factionChance, shards, raidCardChance; rollRaidRewardCards (pure, seeded); RAID_RECIPE_COST
   by rarity; raidRecipeFor / craftRaidCardPure (pure wallet maths).
2. arena_app.js: claimRaidReward grants pack/faction cards + shards; raid-fight win drop = pack card (raid card only at the tiny chance);
   shards stored in myCurrencies.raidShards {raidId: n}, cloud push only when the proposed column exists.
3. Forge: new "raid" mode tab (Raid cards), recipe list per raid, hidden-until-seen.
4. Texts: TX keys + 12 lang packs.
5. Tests: tests/rc-2026-10-19.js; update raid-ops / raid-rv2 if affected.
6. supabase/proposed/20261019_raid_shards.sql (not applied).

## Status
- [x] 1 raid module
- [x] 2 app rewards
- [x] 3 Forge tab
- [x] 4 texts
- [x] 5 tests
- [x] 6 migration
- next: merge main, final commit, report
