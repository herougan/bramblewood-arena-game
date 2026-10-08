-- PROPOSED, NOT APPLIED (2026-10-08). Applying it was blocked pending the owner's OK; say "apply it".
-- 2026-10-08: admin player portal (user: "an admin portal so I can see which players have joined
-- and their respective levels — basically their player card + some details").
-- Read-only, admin-gated. Returns one row per profile; no emails or auth data.
create or replace function public.admin_list_players()
returns table(
  id uuid, display_name text, friend_code text, rating numeric,
  created_at timestamptz, last_seen_at timestamptz,
  gold integer, gems integer, dust integer, metal integer,
  cards_unlocked bigint, matches bigint, wins bigint,
  xp_raw text, avatar_raw text, faction_raw text, tutorial_done text, conquest_raw text,
  progress_updated_at timestamptz, is_admin boolean
)
language plpgsql stable security definer set search_path to ''
as $$
begin
  if not public.is_app_admin() then
    raise exception 'not allowed' using errcode = '42501';
  end if;
  return query
  select p.id, p.display_name, p.friend_code, p.rating, p.created_at, p.last_seen_at,
         c.gold, c.gems, c.dust, c.metal,
         (select count(*) from public.player_card_unlocks u where u.profile_id = p.id),
         (select count(*) from public.match_history m where m.profile_id = p.id),
         (select count(*) from public.match_history m where m.profile_id = p.id and m.result = 'win'),
         pp.data->>'bramblewood_player_xp_v1', pp.data->>'bramblewood_avatar', pp.data->>'bramblewood_arena_faction',
         pp.data->>'bramblewood_arena_tutorial_done', pp.data->>'bramblewood_conquest_progress_v1',
         pp.updated_at,
         exists(select 1 from public.app_admins a where a.user_id = p.id)
  from public.profiles p
  left join public.player_currencies c on c.profile_id = p.id
  left join public.player_progress pp on pp.profile_id = p.id
  order by coalesce(p.last_seen_at, p.created_at) desc nulls last;
end $$;
revoke all on function public.admin_list_players() from public, anon;
grant execute on function public.admin_list_players() to authenticated;
