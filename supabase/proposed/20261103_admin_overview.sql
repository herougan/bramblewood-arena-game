-- PROPOSED, NOT APPLIED (2026-11-03, package UI17). Apply only after the owner says "apply it".
-- Purpose: owner 2026-11-03 18:37: "The players screen has to be more filled with typical administrative 'viewing' controls also. How many
--   online now, server load etc." Admin -> Players shows overview tiles; the ones the client can already read (accounts, online now, active
--   in the last hour / day / week, new today, raid attempts in the last hour) need nothing. The rest come from admin_overview() below and
--   show "needs SQL" until it exists: fights and matches in the last hour, database connections and size.
-- Admin-gated (public.is_app_admin(), the same check as admin_list_players / admin_user_list); anyone else gets error 42501.
-- Executable by `authenticated` only (revoked from public and anon). security definer so it can count other players' fight_sessions and
--   match_history rows (their RLS lets each player read only their own) and read pg_stat_activity / pg_database_size.
-- Exposes counts only: no ids, names, emails or any auth.* column.
-- Writes nothing. Safe to re-run (create or replace).
-- Roll back:  drop function public.admin_overview();

create or replace function public.admin_overview()
returns table(
  fights_1h bigint, fights_24h bigint, matches_1h bigint, matches_24h bigint,
  raid_attempts_1h bigint, open_coop_rooms bigint, feedback_24h bigint,
  db_connections bigint, db_size_mb bigint, at timestamptz
)
language plpgsql stable security definer set search_path = ''
as $$
begin
  if not public.is_app_admin() then
    raise exception 'not allowed' using errcode = '42501';
  end if;
  return query
  select
    (select count(*) from public.fight_sessions f where f.created_at > now() - interval '1 hour'),
    (select count(*) from public.fight_sessions f where f.created_at > now() - interval '24 hours'),
    (select count(*) from public.match_history m where m.played_at > now() - interval '1 hour'),
    (select count(*) from public.match_history m where m.played_at > now() - interval '24 hours'),
    (select count(*) from public.raid_week_attempts r where r.fought_at > now() - interval '1 hour')
      + (select count(*) from public.raid_attempts r where r.fought_at > now() - interval '1 hour'),
    (select count(*) from public.coop_rooms c where c.status is distinct from 'closed' and c.updated_at > now() - interval '1 hour'),
    (select count(*) from public.feedback b where b.created_at > now() - interval '24 hours'),
    (select count(*) from pg_catalog.pg_stat_activity a where a.datname = pg_catalog.current_database()),
    (pg_catalog.pg_database_size(pg_catalog.current_database()) / 1048576)::bigint,
    now();
end $$;
revoke all on function public.admin_overview() from public, anon;
grant execute on function public.admin_overview() to authenticated;
