-- 2026-10-26 (package CONTENT3, action item OVR). PROPOSED, NOT APPLIED: run only on the owner's "apply it".
-- The live card rows folded into canonical/cards.json (tools/fold_server_overrides_2026_10_26.js; plan in
-- docs/balance/server-overrides/fold-plan-2026-10-26.json): 9 changed cards, the new Phoenix Mushrooms, 4 rows that matched the file
-- already (Meadow Rabbit, Conch Herald; Green Dragon and Soldier Ant kept the file's newer stats) and the 5 rows BF7 folded on 10-22.
-- Same shape as supabase/migrations/20261021_clear_folded_overrides_2.sql:
--   card rows: an empty patch ({"__patch": true}: the file's card), NOT deleted = true (the editor's tombstone removes the card);
--   the two editor ids with a junk suffix (the cards are ember-tetra and phoenix-mushrooms in the file, arena_app.js CARD_ID_RENAMED
--   skips their rows) are deleted outright (this replaces supabase/proposed/20261023_rw5_clear_ember_tetra.sql);
--   every old row kept in deleted_snapshot and in a backup table (RLS on, anon / authenticated revoked).
-- NOT in this file: __cfg:map-nodes:m2 and __cfg:tutorial (owner calls OVR-1, OVR-2 in docs/decisions.json), the 50 map-layout and
-- older map-node rows (positions and links; never folded), the 71 rows that are already empty patches.
-- Read first:
--   select id, deleted, updated_at, length(data::text) from card_overrides where updated_at > '2026-10-21 08:00' order by updated_at;
begin;

create table if not exists public.card_overrides_backup_20261026 as select * from public.card_overrides where false;
alter table public.card_overrides_backup_20261026 enable row level security;
revoke all on public.card_overrides_backup_20261026 from anon, authenticated;
insert into public.card_overrides_backup_20261026
  select * from public.card_overrides where id in (
    'glacial-ape-king', 'conch-crawler', 'tide-pool-crab', 'ford-kingfisher',
    'green-dragon', 'soldier-ant', 'earthworm', 'silver-minnow', 'duckling', 'harvest-mouse', 'otter-kit', 'meadow-rabbit',
    'conch-herald', 'sea-turtle-elder',
    'ember-tetra-3caj', 'phoenix-mushrooms-u248'
  );

update public.card_overrides
   set deleted_snapshot = data,
       data = '{"__patch": true}'::jsonb,
       deleted = false,
       updated_at = now()
 where id in (
    'glacial-ape-king', 'conch-crawler', 'tide-pool-crab', 'ford-kingfisher',
    'green-dragon', 'soldier-ant', 'earthworm', 'silver-minnow', 'duckling', 'harvest-mouse', 'otter-kit', 'meadow-rabbit',
    'conch-herald', 'sea-turtle-elder'
  )
   and deleted = false;

delete from public.card_overrides where id in ('ember-tetra-3caj', 'phoenix-mushrooms-u248');

-- expect 14 cleared, 0 renamed rows left, 16 backed up; roll back if not
select (select count(*) from public.card_overrides where data = '{"__patch": true}'::jsonb and id in (
          'glacial-ape-king', 'conch-crawler', 'tide-pool-crab', 'ford-kingfisher', 'green-dragon', 'soldier-ant', 'earthworm', 'silver-minnow',
          'duckling', 'harvest-mouse', 'otter-kit', 'meadow-rabbit', 'conch-herald', 'sea-turtle-elder')) as cards_cleared,
       (select count(*) from public.card_overrides where id in ('ember-tetra-3caj', 'phoenix-mushrooms-u248')) as renamed_left,
       (select count(*) from public.card_overrides_backup_20261026) as backed_up;

commit;

-- After OVR-1 / OVR-2 are answered "drop the row" (the file wins), the same pattern for the config rows:
-- update public.card_overrides set deleted_snapshot = data, data = null, deleted = true, updated_at = now()
--  where id in ('__cfg:map-nodes:m2', '__cfg:tutorial') and deleted = false;
