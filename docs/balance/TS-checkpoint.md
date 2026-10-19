# Package TS checkpoint (2026-10-19)

Owner 13:35: Thorns not affecting raid back rows; 13:37: small-mode status icon sizing / top-edge chips.

## Status
- [x] Root cause found: engine `reserveStrike` (middle/back row strikes) only calls `damageCard`; none of the swing's
      on-hit / on-damaged hooks run. Also: reserve units get no status upkeep (Freeze/Sleep never melt, Poison never ticks),
      killer lookups (`noteKiller`, `killerCreditOf`, On Kill) only see the front row, Guardian / Counterattack / Cleave sides
      only look at the front row.
- [ ] Engine fix: reserve units' actions go through the main swing body
- [ ] tests/raid-thorns-rows-2026-10-19.js
- [ ] Status chips (part 2)
- [ ] Screens docs/screens/ts/
- [ ] CHANGELOG, commit
