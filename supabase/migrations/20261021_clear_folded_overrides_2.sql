-- 2026-10-21 (package BF5) APPLIED 2026-10-21 ~15:40 SGT on the owner's approval (B13, 14:34). Result: 13 cards cleared, 5 cfg rows cleared, 18 rows backed up.
-- The backup table also got RLS on and anon/authenticated access revoked at apply time (as in 20261019).
-- The owner's later live edits (after BF4's clear), folded into the file (docs/balance/halve-2026-10-19.md, "The owner's 13 edits"):
-- 13 card rows, the map-node rows of Map 0, Hedgerow (Map 1) and the Shallows (Map 2), the tutorial config and the Goliath.
-- Same shape as supabase/migrations/20261019_clear_folded_overrides.sql (BF4):
--   card rows: an empty patch ({"__patch": true}: the file's card), NOT deleted = true (that is the editor's tombstone: it removes the card);
--   __cfg rows: data null, deleted true (the editor's "drop every edit"; the game falls back to the file's map / tutorial / raid);
--   every old row kept in deleted_snapshot and in a backup table; updated_at moves so open games pick it up on their next poll.
-- NOTE the halved values (BF5) live in the file only: nothing server-side carries a stat or a bramble Health once these rows are cleared.
begin;

create table if not exists public.card_overrides_backup_20261021 as select * from public.card_overrides where false;
alter table public.card_overrides_backup_20261021 enable row level security;
revoke all on public.card_overrides_backup_20261021 from anon, authenticated;
insert into public.card_overrides_backup_20261021
  select * from public.card_overrides where id in (
    'swarm-matriarch',
    'feral-tomcat',
    'mayfly-dancer',
    'gull-thief',
    'open-ocean-hermit-crab',
    'meadow-frog',
    'fiddler-crab-swarm',
    'tide-pool-crab',
    'ant-hill',
    'forager-ant',
    'ant-scout',
    'soldier-ant',
    'tunnel-ant',
    '__cfg:map-nodes:m1',
    '__cfg:map-nodes:mf',
    '__cfg:map-nodes:mb',
    '__cfg:tutorial',
    '__cfg:raid:goliath'
  );

update public.card_overrides
   set deleted_snapshot = data,
       data = '{"__patch": true}'::jsonb,
       deleted = false,
       updated_at = now()
 where id in (
    'swarm-matriarch',
    'feral-tomcat',
    'mayfly-dancer',
    'gull-thief',
    'open-ocean-hermit-crab',
    'meadow-frog',
    'fiddler-crab-swarm',
    'tide-pool-crab',
    'ant-hill',
    'forager-ant',
    'ant-scout',
    'soldier-ant',
    'tunnel-ant'
  )
   and deleted = false;

update public.card_overrides
   set deleted_snapshot = data,
       data = null,
       deleted = true,
       updated_at = now()
 where id in ('__cfg:map-nodes:m1', '__cfg:map-nodes:mf', '__cfg:map-nodes:mb', '__cfg:tutorial', '__cfg:raid:goliath')
   and deleted = false;

-- expect 13 and 5 rows; roll back if not
select count(*) filter (where data = '{"__patch": true}'::jsonb) as cards_cleared, count(*) filter (where id like '__cfg:%' and deleted) as cfg_cleared
  from public.card_overrides where id in (
    'swarm-matriarch',
    'feral-tomcat',
    'mayfly-dancer',
    'gull-thief',
    'open-ocean-hermit-crab',
    'meadow-frog',
    'fiddler-crab-swarm',
    'tide-pool-crab',
    'ant-hill',
    'forager-ant',
    'ant-scout',
    'soldier-ant',
    'tunnel-ant',
    '__cfg:map-nodes:m1',
    '__cfg:map-nodes:mf',
    '__cfg:map-nodes:mb',
    '__cfg:tutorial',
    '__cfg:raid:goliath'
  );

commit;
