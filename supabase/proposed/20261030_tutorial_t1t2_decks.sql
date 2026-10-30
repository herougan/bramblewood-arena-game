-- 2026-10-30 (package TUT2, owner SKL0-1 "yes definitely": every T-1 / T-2 card fights at Level 0 on both sides, with no skills).
-- PROPOSED ONLY: run it only after the owner says "apply it" for this change.
--
-- The live tutorial config is the card_overrides row '__cfg:tutorial' (it wins over the game's built-in TUTORIAL_CFG_DEFAULT).
-- Claude had no database access: the "before" value below is the row as dumped on 2026-10-26
-- (docs/balance/server-overrides/card-overrides-dump-2026-10-26.json, row updated_at 2026-10-22 23:00). The update only runs while the
-- row still holds that T-2 deck, so a later edit of yours is left alone (0 rows updated: read the row and tell Claude).
--
-- Measured with every card at Level 0 (CPU plays your side, 200 seeds; "fight" = the real fight's brambles, node tutHp + earlyBrambleHp;
-- "smoke" = tests/e2e/ui_smoke.py 7b's brambles from cfg.rivalHp):
--   T-1, your live deck 3 Duckling, 3 Earthworm, 3 Harvest Mouse, 3 Silver Minnow: 92% smoke / 100% fight, fixed seed won -> NOT changed.
--   T-2, live deck: 63% smoke / 83% fight, fixed seed won (was 50% / 75% before all-Level-0) -> the proposed deck: 73% / 95%, fixed seed won
--   (one Pond Trout and one Silver Minnow fewer; 11 cards, was 13).
-- The game's built-in default (arena_app.js TUTORIAL_CFG_DEFAULT) now has the same T-1 and T-2 rival decks, so a fresh install matches.
--
-- Before (cfg.rivalDeck2), for rollback:
--   {"duckling":3,"earthworm":3,"otter-kit":1,"pond-duck":1,"pond-trout":1,"meadow-rabbit":1,"silver-minnow":3}
-- Rollback:
--   update card_overrides set data = jsonb_set(data, '{cfg,rivalDeck2}',
--     '{"duckling":3,"earthworm":3,"otter-kit":1,"pond-duck":1,"pond-trout":1,"meadow-rabbit":1,"silver-minnow":3}'::jsonb, false),
--     updated_at = now() where id = '__cfg:tutorial';

-- Check first (read-only):
--   select id, updated_at, data #> '{cfg,rivalDeck}' as t1, data #> '{cfg,rivalDeck2}' as t2 from card_overrides where id = '__cfg:tutorial';

update card_overrides
   set data = jsonb_set(data, '{cfg,rivalDeck2}',
              '{"duckling":3,"earthworm":3,"otter-kit":1,"pond-duck":1,"meadow-rabbit":1,"silver-minnow":2}'::jsonb, false),
       updated_at = now()
 where id = '__cfg:tutorial'
   and deleted = false
   and data #> '{cfg,rivalDeck2}' = '{"duckling":3,"earthworm":3,"otter-kit":1,"pond-duck":1,"pond-trout":1,"meadow-rabbit":1,"silver-minnow":3}'::jsonb;
