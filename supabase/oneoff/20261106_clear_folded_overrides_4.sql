-- 2026-11-06 (package CONTENT12, decision CONTENT11-2 a). APPLIED 2026-11-06 on the owner's "Apply it" (CONTENT12-4): 66 cleared, 2 deleted, 68 backed up.
-- Replaces supabase/proposed/20261026_clear_folded_overrides_3.sql (never applied; its 16 rows are in this file too).
-- Every live card row is now in canonical/cards.json: 58 folded by tools/fold_server_overrides_2026_11_06.js (plan:
-- docs/balance/server-overrides/fold-plan-2026-11-06.json; dump: card-overrides-dump-2026-11-06.json), ant-hill already equal,
-- 9 folded by CONTENT3 on 10-26. Same shape as the 10-26 file: card rows become an empty patch ({"__patch": true}: the file's card),
-- NOT deleted = true (the editor's tombstone removes the card); the two junk-suffixed editor ids are deleted outright.
-- A row the owner saved again after the dump (updated_at differs) is left alone: the match is on id AND updated_at.
-- NOT in this file: the __cfg rows (map layouts, map nodes, the tutorial).
-- Read first:
--   select id, updated_at from card_overrides where not id like '__cfg:%' and not deleted and data <> '{"__patch": true}'::jsonb order by updated_at;
begin;

create table if not exists public.card_overrides_backup_20261106 as select * from public.card_overrides where false;
alter table public.card_overrides_backup_20261106 enable row level security;
revoke all on public.card_overrides_backup_20261106 from anon, authenticated;
insert into public.card_overrides_backup_20261106
  select * from public.card_overrides where id in ('ember-tetra-3caj', 'glacial-ape-king', 'conch-crawler', 'tide-pool-crab', 'green-dragon', 'harvest-mouse', 'meadow-rabbit', 'sea-turtle-elder', 'phoenix-mushrooms-u248', 'worker-ant', 'ford-kingfisher', 'bee-drone', 'beachcomber-sanderling', 'conch-herald', 'old-shell', 'rootworm-colony', 'echo-matriarch', 'terrier-pup', 'tunnel-ant', 'soldier-ant', 'ant-scout', 'hedge-changeling', 'ant-warrior', 'termite-forager', 'krill-swarm', 'bee-sentry', 'beaver-lumberjack', 'robin-redbreast', 'kittiwake-flock', 'driftwood-crab', 'gull-thief', 'bee-forager', 'silver-minnow', 'pond-trout', 'duckling', 'crossed-eyes', 'earthworm', 'bee-knight', 'guppy', 'otter-kit', 'ant-hill', 'forager-ant', 'blister-beetle', 'bog-shrew', 'owl-sentinel', 'cottontail', 'cypress-root-lurker', 'marsh-mallow-hare', 'chipmunk-cavalry', 'feral-tomcat', 'badger-lumberjack', 'field-mouse', 'field-vole', 'bramble-sprout', 'hedgerow-shrew', 'woodcock-lookout', 'chipmunk-skirmisher', 'hollow-belly-rat', 'moonlit-hare', 'puddle-skimmer', 'fire-ant-raft', 'pincushion-urchin', 'rock-pool-starfish', 'moon-jelly', 'fulmar-spitter', 'old-sturgeon', 'riverworks-bastion', 'alley-cat');

with folded(id, at) as (values
    ('glacial-ape-king', '2026-10-21 10:35:34.262+00'::timestamptz),
    ('conch-crawler', '2026-10-21 10:40:28.301+00'::timestamptz),
    ('tide-pool-crab', '2026-10-21 10:40:47.515+00'::timestamptz),
    ('green-dragon', '2026-10-22 04:00:14.79+00'::timestamptz),
    ('harvest-mouse', '2026-10-22 15:23:56.115+00'::timestamptz),
    ('meadow-rabbit', '2026-10-22 15:24:29.082+00'::timestamptz),
    ('sea-turtle-elder', '2026-10-24 13:16:05.24+00'::timestamptz),
    ('worker-ant', '2026-10-29 14:03:30.4+00'::timestamptz),
    ('ford-kingfisher', '2026-11-01 15:56:28.83+00'::timestamptz),
    ('bee-drone', '2026-11-02 13:45:20.798+00'::timestamptz),
    ('beachcomber-sanderling', '2026-11-02 13:53:41.041+00'::timestamptz),
    ('conch-herald', '2026-11-02 14:21:41.923+00'::timestamptz),
    ('old-shell', '2026-11-02 14:22:36.838+00'::timestamptz),
    ('rootworm-colony', '2026-11-02 14:26:47.086+00'::timestamptz),
    ('echo-matriarch', '2026-11-03 13:40:52.701+00'::timestamptz),
    ('terrier-pup', '2026-11-03 14:03:34.728+00'::timestamptz),
    ('tunnel-ant', '2026-11-03 14:06:00.129+00'::timestamptz),
    ('soldier-ant', '2026-11-03 14:06:08.229+00'::timestamptz),
    ('ant-scout', '2026-11-03 14:08:36.693+00'::timestamptz),
    ('hedge-changeling', '2026-11-03 14:12:35.64+00'::timestamptz),
    ('ant-warrior', '2026-11-03 14:37:47.386+00'::timestamptz),
    ('termite-forager', '2026-11-03 14:38:33.152+00'::timestamptz),
    ('krill-swarm', '2026-11-03 14:39:04.137+00'::timestamptz),
    ('bee-sentry', '2026-11-03 14:47:01.671+00'::timestamptz),
    ('beaver-lumberjack', '2026-11-03 14:49:22.206+00'::timestamptz),
    ('robin-redbreast', '2026-11-03 14:52:23.123+00'::timestamptz),
    ('kittiwake-flock', '2026-11-03 15:02:54.945+00'::timestamptz),
    ('driftwood-crab', '2026-11-03 15:09:54.297+00'::timestamptz),
    ('gull-thief', '2026-11-04 15:08:15.318+00'::timestamptz),
    ('bee-forager', '2026-11-05 15:01:20.106+00'::timestamptz),
    ('silver-minnow', '2026-11-05 15:02:38.589+00'::timestamptz),
    ('pond-trout', '2026-11-05 15:04:45.555+00'::timestamptz),
    ('duckling', '2026-11-05 15:05:00.023+00'::timestamptz),
    ('crossed-eyes', '2026-11-05 15:05:11.509+00'::timestamptz),
    ('earthworm', '2026-11-05 15:06:49.873+00'::timestamptz),
    ('bee-knight', '2026-11-05 15:07:12.173+00'::timestamptz),
    ('guppy', '2026-11-05 15:07:28.341+00'::timestamptz),
    ('otter-kit', '2026-11-05 15:07:41.497+00'::timestamptz),
    ('ant-hill', '2026-11-05 15:08:26.89+00'::timestamptz),
    ('forager-ant', '2026-11-05 15:09:03.931+00'::timestamptz),
    ('blister-beetle', '2026-11-05 15:09:18.558+00'::timestamptz),
    ('bog-shrew', '2026-11-05 15:09:29.356+00'::timestamptz),
    ('owl-sentinel', '2026-11-05 15:10:27.636+00'::timestamptz),
    ('cottontail', '2026-11-05 15:11:12.606+00'::timestamptz),
    ('cypress-root-lurker', '2026-11-05 15:13:26.774+00'::timestamptz),
    ('marsh-mallow-hare', '2026-11-05 15:13:44.824+00'::timestamptz),
    ('chipmunk-cavalry', '2026-11-05 15:14:07.706+00'::timestamptz),
    ('feral-tomcat', '2026-11-05 15:14:44.252+00'::timestamptz),
    ('badger-lumberjack', '2026-11-05 15:15:19.424+00'::timestamptz),
    ('field-mouse', '2026-11-05 15:17:17.14+00'::timestamptz),
    ('field-vole', '2026-11-05 15:18:22.857+00'::timestamptz),
    ('bramble-sprout', '2026-11-05 15:18:48.515+00'::timestamptz),
    ('hedgerow-shrew', '2026-11-05 15:23:41.825+00'::timestamptz),
    ('woodcock-lookout', '2026-11-05 15:24:34.404+00'::timestamptz),
    ('chipmunk-skirmisher', '2026-11-05 15:25:46.442+00'::timestamptz),
    ('hollow-belly-rat', '2026-11-05 15:27:16.259+00'::timestamptz),
    ('moonlit-hare', '2026-11-05 15:29:28.226+00'::timestamptz),
    ('puddle-skimmer', '2026-11-05 15:29:43.142+00'::timestamptz),
    ('fire-ant-raft', '2026-11-05 15:30:34.809+00'::timestamptz),
    ('pincushion-urchin', '2026-11-05 15:31:56.352+00'::timestamptz),
    ('rock-pool-starfish', '2026-11-05 15:32:47.511+00'::timestamptz),
    ('moon-jelly', '2026-11-05 15:34:12.293+00'::timestamptz),
    ('fulmar-spitter', '2026-11-05 15:34:39.126+00'::timestamptz),
    ('old-sturgeon', '2026-11-05 15:45:23.082+00'::timestamptz),
    ('riverworks-bastion', '2026-11-05 15:46:09.196+00'::timestamptz),
    ('alley-cat', '2026-11-05 15:47:52.328+00'::timestamptz)
)
update public.card_overrides o
   set deleted_snapshot = o.data,
       data = '{"__patch": true}'::jsonb,
       deleted = false,
       updated_at = now()
  from folded f
 where o.id = f.id and o.updated_at = f.at and o.deleted = false;

delete from public.card_overrides where id in ('ember-tetra-3caj', 'phoenix-mushrooms-u248');

-- expect 66 cleared, 0 renamed rows left, 68 backed up; roll back if not
select (select count(*) from public.card_overrides where data = '{"__patch": true}'::jsonb and deleted_snapshot is not null and updated_at > now() - interval '1 minute') as cards_cleared,
       (select count(*) from public.card_overrides where id in ('ember-tetra-3caj', 'phoenix-mushrooms-u248')) as renamed_left,
       (select count(*) from public.card_overrides_backup_20261106) as backed_up;

commit;
