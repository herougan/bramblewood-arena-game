# Package TS checkpoint (2026-10-19)

Owner 13:35: Thorns not affecting raid back rows; 13:37: small-mode status icon sizing / top-edge chips.

## Status
- [x] Root cause: engine `reserveStrike` (middle/back row strikes) only called `damageCard`; none of the swing's on-hit /
      on-hit-taken hooks ran. Also: reserve units got no status upkeep (Freeze/Sleep never melted, Poison never ticked), killer
      lookups (`noteKiller`, `killerCreditOf`, On Kill, Crown, who:'killer') only saw the front row, Guardian / Counterattack /
      Cleave sides only looked at the front row.
- [x] Engine fix: reserve units' actions go through the main swing body (`rowSwing`, `rowSwingReady`, `rowEv`, `rowHalf`);
      `reserveVolley` runs single-unit passes; reserve deaths are full deaths in raids (removeDeadCardsPass); upkeep covers reserves.
- [x] tests/raid-thorns-rows-2026-10-19.js (290 checks; 173 fail on the old engine). Existing raid tests pass individually.
- [x] Status chips (part 2): `statusChipsHTML` + `#tsStyles`; tests/ts-status-chips-2026-10-19.js (Playwright, 40 checks).
- [x] Screens docs/screens/ts/ (before-*, after-*).
- [x] CHANGELOG
- [ ] merge main, rebuild, final commit
