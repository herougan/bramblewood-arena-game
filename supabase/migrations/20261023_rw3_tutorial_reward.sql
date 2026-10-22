-- 2026-10-23 (package RW3, owner RP3: the Quarry Mole moves to Caves & Alcoves' 8-1). PROPOSED ONLY: run it only after the owner says
-- "apply it" for this change.
-- The live tutorial config (card_overrides row '__cfg:tutorial', published 2026-10-22 15:23) still lists the Quarry Mole as T-1's reward
-- (cfg.rewards = ["quarry-mole"]). The game already skips it (TUTORIAL_REWARD_RETIRED in arena_app.js); this clears the list so the
-- Tutorial editor shows what T-1 really pays (nothing, until a new card is picked there). Everything else in the row stays.
update card_overrides
   set data = jsonb_set(data, '{cfg,rewards}', '[]'::jsonb, false),
       updated_at = now()
 where id = '__cfg:tutorial'
   and deleted = false
   and data #> '{cfg,rewards}' = '["quarry-mole"]'::jsonb;
