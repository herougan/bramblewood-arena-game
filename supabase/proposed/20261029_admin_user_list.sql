-- PROPOSED, NOT APPLIED (2026-10-29, package ADMINU1). Waiting for the owner's "apply it".
-- Purpose: owner asked (10-28 23:35, 10-29 19:14) "view users and their levels / has anyone else played?" in the game's Admin area.
--   admin_user_list() is the read-only list behind Admin -> Players (overlay): one row per profile with counts of unlocked cards,
--   fights (fight_sessions) and matches (match_history), the last fight, and a few fields read from the player's saved progress.
-- Admin-gated (app_admins, same check as is_app_admin() / admin_list_players); anyone else gets error 42501.
-- Executable by `authenticated` only (revoked from public and anon).
-- Exposes: profile id, display_name, created_at, last_seen_at, rating, is_admin, cards, fights, last_fight_at, matches,
--   xp, tutorial_done, maps_cleared (distinct map ids), nodes_cleared (count), gold, progress_updated_at.
--   NEVER emails or any auth.* column.
-- Roll back:  drop function public.admin_user_list();  drop function public._admin_safe_jsonb(text);
-- Safe to re-run (create or replace). Writes nothing.

-- Reads a progress value that the game stored as a JSON string; null (never an error) when absent or not valid JSON.
create or replace function public._admin_safe_jsonb(t text)
returns jsonb language plpgsql immutable set search_path = public as $$
begin
  if t is null or t = '' then return null; end if;
  return t::jsonb;
exception when others then return null;
end $$;
revoke all on function public._admin_safe_jsonb(text) from public, anon, authenticated;

create or replace function public.admin_user_list()
returns table(
  id uuid, display_name text, created_at timestamptz, last_seen_at timestamptz, rating numeric, is_admin boolean,
  cards bigint, fights bigint, last_fight_at timestamptz, matches bigint,
  xp numeric, tutorial_done boolean, maps_cleared text[], nodes_cleared integer, gold numeric,
  progress_updated_at timestamptz
)
language plpgsql stable security definer set search_path = public
as $$
begin
  if not exists (select 1 from public.app_admins a where a.user_id = (select auth.uid())) then
    raise exception 'not allowed' using errcode = '42501';
  end if;
  return query
  select p.id, p.display_name, p.created_at, p.last_seen_at, p.rating::numeric,
         exists(select 1 from public.app_admins a where a.user_id = p.id),
         (select count(*) from public.player_card_unlocks u where u.profile_id = p.id),
         (select count(*) from public.fight_sessions f where f.user_id = p.id),
         (select max(f.created_at) from public.fight_sessions f where f.user_id = p.id),
         (select count(*) from public.match_history m where m.profile_id = p.id),
         case when jsonb_typeof(x.xp_j) = 'object' and jsonb_typeof(x.xp_j->'xp') = 'number' then (x.xp_j->>'xp')::numeric
              when jsonb_typeof(x.xp_j) = 'number' then (x.xp_j #>> '{}')::numeric end,
         case when pp.data->>'bramblewood_arena_tutorial_done' is null then null
              else (pp.data->>'bramblewood_arena_tutorial_done') in ('1', 'true') end,
         case when jsonb_typeof(x.cq_j->'completed') = 'array'
              then (select array_agg(distinct split_part(e, ':', 1)) from jsonb_array_elements_text(x.cq_j->'completed') e) end,
         case when jsonb_typeof(x.cq_j->'completed') = 'array' then jsonb_array_length(x.cq_j->'completed') end,
         (select c.gold::numeric from public.player_currencies c where c.profile_id = p.id),
         pp.updated_at
  from public.profiles p
  left join public.player_progress pp on pp.profile_id = p.id
  cross join lateral (select public._admin_safe_jsonb(pp.data->>'bramblewood_player_xp_v1') as xp_j,
                             public._admin_safe_jsonb(pp.data->>'bramblewood_conquest_progress_v1') as cq_j) x
  order by coalesce(p.last_seen_at, p.created_at) desc nulls last;
end $$;
revoke all on function public.admin_user_list() from public, anon;
grant execute on function public.admin_user_list() to authenticated;
