-- PROPOSED, NOT APPLIED (2026-10-17, docs/platform-roadmap-2026-10-17.md §3). Apply only on "apply it".
-- Small fixes found reading the live policies and functions (read-only, 2026-10-17). Each block stands alone.

-- 1. decrement_raid_boss_hp runs with search_path 'public' (every other definer function uses ''). Pin it, so a table
--    or function someone manages to create in a schema earlier on the path can never be picked up by name.
--    Same body as live, with every table name qualified.
create or replace function public.decrement_raid_boss_hp(p_boss_id text, p_amount integer)
returns integer
language plpgsql security definer set search_path = ''
as $$
declare
  me uuid := auth.uid();
  v_cap integer;
  v_last timestamptz;
  v_new_hp integer;
begin
  if me is null or coalesce((auth.jwt()->>'is_anonymous')::boolean, false) then
    raise exception 'sign in required';
  end if;
  select coalesce((stats->>'hqHp')::int, 200) into v_cap from public.raid_bosses where id = p_boss_id and active;
  if not found then
    raise exception 'unknown raid boss';
  end if;
  select last_hit_at into v_last from public.raid_hit_log where profile_id = me and boss_id = p_boss_id for update;
  if found and v_last > now() - interval '60 seconds' then
    select current_hp into v_new_hp from public.raid_bosses where id = p_boss_id;
    return v_new_hp; -- too soon: no damage applied, report current HP
  end if;
  insert into public.raid_hit_log (profile_id, boss_id, last_hit_at) values (me, p_boss_id, now())
    on conflict (profile_id, boss_id) do update set last_hit_at = excluded.last_hit_at;
  update public.raid_bosses
    set current_hp = greatest(1, coalesce(current_hp, 200) - least(v_cap, greatest(0, p_amount)))
    where id = p_boss_id
    returning current_hp into v_new_hp;
  return v_new_hp;
end;
$$;

-- 2. coop_rooms: either member may UPDATE every column, so the guest can rewrite host_id (take the room) or the host
--    can swap guest_id. Lock the membership columns; state/status/updated_at stay writable.
revoke update on public.coop_rooms from authenticated;
grant update (state, status, updated_at) on public.coop_rooms to authenticated;
--    (join_coop_room is SECURITY DEFINER, so joining still sets guest_id.) The client doesn't use coop_rooms yet
--    (2026-10-17), so this is safe to apply before the co-op game is built on it.

-- 3. guild_members: any signed-in player can join ANY guild by inserting their own row (no invite or approval).
--    If guilds are meant to be invite-only, replace the insert policy with a join_guild(p_guild) function that checks an
--    invite. Left as a comment: it's a design question for the owner, not a bug.

-- 4. Policies written "to public" (guild_members, guilds, live_matches, live_queue, match_history, player_card_unlocks,
--    player_currencies, player_decks, profiles, raid_attempts, world_events) also apply to the anon role. They all check
--    auth.uid(), which is null for anon, so nothing leaks, but "to authenticated" is clearer and skips the check for
--    signed-out requests. Optional tidy-up, e.g.:
-- alter policy "own currencies insert" on public.player_currencies to authenticated;
-- alter policy "own currencies write"  on public.player_currencies to authenticated;
-- alter policy "own currencies read"   on public.player_currencies to authenticated;
