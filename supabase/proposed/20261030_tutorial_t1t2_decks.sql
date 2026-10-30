-- 2026-10-30 (package TUT2, owner SKL0-1 "yes definitely": every T-1 / T-2 card fights at Level 0 on both sides, with no skills).
-- 2026-10-30 (package TUT3, owner TUT2-3 "T-1/T-2 won't have swarm or flying"): the same file now also changes cfg.myDeck2, your T-2 deck: the one
-- skill card in it, the Honey Bee (Flying), becomes a Pond Duck (3/4, no skill). Two statements, each on its own guard.
-- PROPOSED ONLY: run it only after the owner says "apply it" for this change.
--
-- The live tutorial config is the card_overrides row '__cfg:tutorial' (it wins over the game's built-in TUTORIAL_CFG_DEFAULT).
-- Claude had no database access: the "before" values below are the row as dumped on 2026-10-26
-- (docs/balance/server-overrides/card-overrides-dump-2026-10-26.json, row updated_at 2026-10-22 23:00). Each update only runs while its deck still
-- holds that 10-22 value, so a later edit of yours is left alone (0 rows updated for that statement: read the row and tell Claude).
--
-- Measured with every card at Level 0 (CPU plays your side, 200 seeds; "fight" = the real fight's brambles, node tutHp + earlyBrambleHp;
-- "smoke" = tests/e2e/ui_smoke.py 7b's brambles from cfg.rivalHp; here with the live row's rivalHp 12):
--   T-1, your live deck 3 Duckling, 3 Earthworm, 3 Harvest Mouse, 3 Silver Minnow: 92% smoke / 100% fight, fixed seed won -> NOT changed.
--   T-2, rival deck (TUT2): one Pond Trout and one Silver Minnow fewer (11 cards, was 13). Your deck (TUT3): Honey Bee -> Pond Duck.
--     live as it is now (Honey Bee with Flying kept, old rival deck):  63% smoke / 83% fight
--     both statements below applied:                                   72% smoke / 95% fight, fixed seed won
--     (built-in defaults, rivalHp 7: 74% / 95%)
-- The game's built-in default (arena_app.js TUTORIAL_CFG_DEFAULT) has the same T-1 and T-2 decks, so a fresh install matches.
--
-- Before, for rollback:
--   cfg.rivalDeck2 {"duckling":3,"earthworm":3,"otter-kit":1,"pond-duck":1,"pond-trout":1,"meadow-rabbit":1,"silver-minnow":3}
--   cfg.myDeck2    {"duckling":1,"honey-bee":1,"pond-duck":2,"cottontail":2,"pond-trout":3,"silver-minnow":1,"acorn-chipmunk":3,"chipmunk-forager":2}
-- Rollback (both decks):
--   update card_overrides set data = jsonb_set(jsonb_set(data, '{cfg,rivalDeck2}',
--     '{"duckling":3,"earthworm":3,"otter-kit":1,"pond-duck":1,"pond-trout":1,"meadow-rabbit":1,"silver-minnow":3}'::jsonb, false), '{cfg,myDeck2}',
--     '{"duckling":1,"honey-bee":1,"pond-duck":2,"cottontail":2,"pond-trout":3,"silver-minnow":1,"acorn-chipmunk":3,"chipmunk-forager":2}'::jsonb, false),
--     updated_at = now() where id = '__cfg:tutorial';

-- Check first (read-only):
--   select id, updated_at, data #> '{cfg,rivalDeck}' as t1, data #> '{cfg,rivalDeck2}' as t2_rival, data #> '{cfg,myDeck2}' as t2_mine from card_overrides where id = '__cfg:tutorial';

-- 1. TUT2: the rival's T-2 deck
update card_overrides
   set data = jsonb_set(data, '{cfg,rivalDeck2}',
              '{"duckling":3,"earthworm":3,"otter-kit":1,"pond-duck":1,"meadow-rabbit":1,"silver-minnow":2}'::jsonb, false),
       updated_at = now()
 where id = '__cfg:tutorial'
   and deleted = false
   and data #> '{cfg,rivalDeck2}' = '{"duckling":3,"earthworm":3,"otter-kit":1,"pond-duck":1,"pond-trout":1,"meadow-rabbit":1,"silver-minnow":3}'::jsonb;

-- 2. TUT3: your T-2 deck (the Honey Bee, Flying, becomes a Pond Duck)
update card_overrides
   set data = jsonb_set(data, '{cfg,myDeck2}',
              '{"duckling":1,"pond-duck":3,"cottontail":2,"pond-trout":3,"silver-minnow":1,"acorn-chipmunk":3,"chipmunk-forager":2}'::jsonb, false),
       updated_at = now()
 where id = '__cfg:tutorial'
   and deleted = false
   and data #> '{cfg,myDeck2}' = '{"duckling":1,"honey-bee":1,"pond-duck":2,"cottontail":2,"pond-trout":3,"silver-minnow":1,"acorn-chipmunk":3,"chipmunk-forager":2}'::jsonb;
