-- 2026-10-16 (user: "I noticed it also has this on ready deal 6 damage that i cant removed. remove that for me. i have added pounce
-- instead."). One-off, run once in the Supabase SQL editor (it is not a migration).
-- Takes Cataphract Destrier's old "On Ready: deal 6 damage" out of its published card edit, and nothing else: Pounce, Bounty,
-- Stampede (overwhelm), stats, art and text stay as they are. Both shapes the old effect can have are handled:
--   1. the legacy field  data.effects.onReadyDamage = {"amount": 6, "dmgType": "physical"}
--   2. a trigger         data.effects.triggers[] = {"on": "onReady", "do": "damage" | "missile", "amount": 6, ...}
-- updated_at is bumped so open games pick the change up on their next poll (pollCloudOverrides reads rows newer than its last look).
-- Safe to run twice: the second run matches no row.

begin;

update public.card_overrides
set data = jsonb_set(data, '{effects}', (data->'effects') - 'onReadyDamage'),
    updated_at = now()
where id = 'cataphract-destrier'
  and data ? 'effects'
  and data->'effects' ? 'onReadyDamage';

update public.card_overrides
set data = jsonb_set(data, '{effects,triggers}', coalesce((
      select jsonb_agg(t order by i)
      from jsonb_array_elements(data->'effects'->'triggers') with ordinality as x(t, i)
      where (t->>'on' = 'onReady' and t->>'do' in ('damage', 'missile') and t->>'amount' in ('6', '6.0')) is not true
    ), '[]'::jsonb)),
    updated_at = now()
where id = 'cataphract-destrier'
  and jsonb_typeof(data->'effects'->'triggers') = 'array'
  and exists (
    select 1 from jsonb_array_elements(data->'effects'->'triggers') t
    where t->>'on' = 'onReady' and t->>'do' in ('damage', 'missile') and t->>'amount' in ('6', '6.0')
  );

-- Check: effects should show Pounce (and Bounty / overwhelm), no onReadyDamage, no On Ready 6 trigger.
select id, data->'effects' as effects, updated_at from public.card_overrides where id = 'cataphract-destrier';

commit;
