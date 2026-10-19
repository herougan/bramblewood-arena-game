# MB2 checkpoint (mobile battle layout, 2026-10-19)

Scope: battle board layout only (CSS + battle layout code in arena_app.js). NV owns the conquest top bar, home button, VS screen, raid-complete screen.

## Plan
1. Raid board fills its frame (all sizes): JS solver `mb2FitRaidCards` sets `--mb2-bh` (board card h), `--mb2-ch` (phone chrome card h), `--mb2-gap`, `--mb2-rgap` on #appWrap; class `mb2-raid` on #appWrap from renderMatchUI.
2. Phone (<=700px) match = full-height flex column (svh/dvh + safe-area); battlefield flex:1, board centred vertically.
3. Phone hand / deck / graveyard / castle = board card size (75x93; 62x78 short phones; raid = solver size). Hand overlaps when crowded.
4. Touch-and-hold (450 ms outside a fight, 250 ms in a fight as the owner set on 10-12; cancel >10 px) opens the card preview everywhere; tap on the held preview opens the full card detail; no click after a hold.
5. tests/e2e/mobile_layout_2026_10_19.py; screenshots in docs/screens/mb2/.

## Status
- [ ] 1  - [ ] 2  - [ ] 3  - [ ] 4  - [ ] 5
