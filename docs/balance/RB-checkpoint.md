# RB checkpoint (package RB, raid balance, 2026-10-19)

Status: done, committed as "Package RB: ...". See docs/balance/raid-balance-2026-10-19.md and the CHANGELOG entry.

Tests run one by one, all passing:
- tests/raid.js
- tests/raid-ally-rows-2026-10-19.js (new)
- tests/raid-rb-2026-10-19.js (new)
- tests/raid-fixes-2026-10-18.js
- tests/raid-stages-2026-10-18.js
- tests/raid-arena-2026-10-17.js
- tests/raid-rows-2026-10-19.js
- tests/raid-rv2-2026-10-19.js
- tests/raid-br-2026-10-19.js
- tests/raid-rx-2026-10-19.js
- tests/raid-ops-2026-10-19.js
- tests/rc-2026-10-19.js
- tests/nv-2026-10-19.js
- tests/async-raid.js
- tests/trench.js
- tests/guild-skills-2026-10-19.js
- tests/reward-screens-2026-10-19.js
- tests/x2-2026-10-18.js
- tests/game-texts.js

Left for the owner:
- Apply supabase/proposed/20261019_raid_cap_250.sql, or republish the Goliath from the raid editor.
- The tiers, the floor and the HP-scaling choice (see the doc).
