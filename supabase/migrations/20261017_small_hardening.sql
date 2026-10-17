-- READY TO APPLY (prepared 2026-10-17, NOT applied yet). From draft supabase/proposed/20261017_d_small_hardening.sql.
-- Two small fixes found reading the live policies and functions (read-only, 2026-10-17). Each block stands alone and
-- needs no other 10-17 migration. Idempotent: safe to run twice.

-- 1. decrement_raid_boss_hp ran with search_path 'public' (the other definer functions use ''). Pinned to '', so an object
--    someone manages to create in a schema earlier on the path can never be picked up by name. The body is the live one
--    (read 2026-10-17) with every name already schema-qualified, so behaviour is unchanged.
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

-- 2. coop_rooms: the 10-16 migration granted UPDATE on (state, status, updated_at) only, but Supabase's default grants had
--    already given UPDATE on the whole table, so either member could still rewrite host_id (take the room) or guest_id.
--    Revoking the table-wide UPDATE also drops the column grants, so they are granted again right after.
--    Joining still works: join_coop_room is SECURITY DEFINER. The game doesn't use coop_rooms yet (2026-10-17), so no
--    client change is needed; when co-op is built, members write only state / status / updated_at.
revoke update on public.coop_rooms from anon, authenticated;
grant update (state, status, updated_at) on public.coop_rooms to authenticated;

-- Notes, not changes (owner's call):
--  * guild_members: any signed-in player can join ANY guild by inserting their own row. If guilds are invite-only, replace
--    the insert policy with a join_guild(p_guild) function that checks an invite.
--  * Policies written "to public" (guild_members, guilds, live_matches, live_queue, match_history, player_card_unlocks,
--    player_currencies, player_decks, profiles, raid_attempts, world_events) also apply to anon. They all check auth.uid(),
--    which is null for anon, so nothing leaks; "to authenticated" would just be tidier.
--  * abandon_live_match, cancel_ranked_queue, find_ranked_match and report_live_match_result also run with
--    search_path 'public'. abandon_live_match and cancel_ranked_queue already qualify every name; check the other two the
--    same way, then a follow-up can pin all four with "alter function ... set search_path = ''".
