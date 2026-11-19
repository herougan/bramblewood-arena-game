-- 2026-11-19 (package FOLD8, decision FOLD8-1 a). APPLIED 2026-11-19 on the owner's "Do apply it to FOLD8-1" (22:18 SGT).
-- Replaces supabase/proposed/20261119_fold8_sync_overrides.sql (not run). Same live result, smaller write, and the CLAUDE.md
-- rule "fold them into cards.json, then clear": every whole-card row (92) is already folded into canonical/cards.json
-- (FOLD7 + FOLD8; cards.json unchanged since f46005bc, which is live on main), so each becomes an empty patch
-- ({"__patch": true}: the live game then uses the built-in card, see cloudCardData00 in arena_app.js). A row's own art is kept,
-- unless it is just the card's own built asset path (a stale path the patch route would pin; dropStaleArtPath).
-- Not touched: the 81 rows already {"__patch": true}, the __cfg rows, deleted rows. Nothing is deleted.
-- Aborts if any card row was saved after the 11-18 dump (2026-11-18 15:54:59.513 UTC).
-- Rollback: update card_overrides o set data = b.data, updated_at = b.updated_at from card_overrides_backup_20261119 b where o.id = b.id;
begin;
do $$ begin
  if exists (select 1 from public.card_overrides where id not like '__cfg:%' and updated_at > '2026-11-18 15:54:59.514+00') then
    raise exception 'a card row is newer than the FOLD8 dump: re-dump and re-fold first'; end if;
end $$;
create table public.card_overrides_backup_20261119 as select * from public.card_overrides;
alter table public.card_overrides_backup_20261119 enable row level security;
revoke all on public.card_overrides_backup_20261119 from anon, authenticated;
update public.card_overrides
   set data = jsonb_build_object('__patch', true)
              || case when data ? 'art' and not (data->>'art' ~ ('^assets/cards/' || id || '\.(png|webp|jpe?g)(\?|$)'))
                      then jsonb_build_object('art', data->'art') else '{}'::jsonb end,
       updated_at = now()
 where id not like '__cfg:%' and not deleted and not (data ? '__patch');
do $$ begin
  if (select count(*) from public.card_overrides) <> 267 then raise exception 'row count changed'; end if;
  if (select count(*) from public.card_overrides where id not like '__cfg:%' and not deleted and not (data ? '__patch')) <> 0 then raise exception 'a whole-card row is left'; end if;
end $$;
commit;
