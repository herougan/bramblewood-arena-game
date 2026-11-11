-- PROPOSED 2026-11-12 (package NET1, owner 00:43: "network optimisation ... support infra that supports 10,000 concurrent players").
-- NOT APPLIED. Apply only on the owner's "apply it". Idempotent: safe to run twice. README: 20261112_net1_README.md.
--
-- Touches no rows (indexes, policies, one trigger for future writes, function settings), so there is nothing to back up.
-- The client (arena_app.js, NET1) works the same before and after: every query it sends is valid on both.
--
-- 1. Indexes for the reads every tab repeats (checked 2026-11-12 with pg_indexes and the performance advisor):
--    card_overrides(updated_at)         the change poll `updated_at > <last>` (14,276 sequential scans so far)
--    raid_week_attempts(cycle, fought_at, id)  the raid bars' read: one cycle, in time order, and since NET1 "only rows newer than"
--    friendships(requester_id)          RLS "friendships visible to participants" + the realtime filter (advisor: unindexed FK)
--    live_matches(player1_id), (player2_id)    RLS "live matches read participant" (advisor: unindexed FKs)
--    Not added on purpose: profiles(last_seen_at). The heartbeat updates that column every 2 minutes per player; an index on it turns those
--    cheap in-place (HOT) updates into index writes. Only Admin's "online now" count reads it.
-- 2. RLS that scales: the 20 policies the advisor flags (auth_rls_initplan) call auth.uid() once per row; `(select auth.uid())` once per query.
--    Same rules, same roles. Three duplicate SELECT policies go (multiple_permissive_policies): each is already covered by a policy with the
--    same or a wider condition on the same table and role (own unlocks/decks: the ALL policy has the same condition; own profile read: the
--    public "leaderboard read" is `true`). reward_rules' admin ALL policy becomes insert / update / delete, so reads run one policy.
-- 3. card_overrides keeps updated_at honest: an UPDATE that leaves updated_at as it was (a hand-run SQL fix, a one-off) gets now(). The game's
--    change poll and NET1's per-device copy both trust updated_at; the game's own writes set it already and are left alone.
-- 4. Advisor tidy: progress_score gets a fixed search_path (it uses built-ins only); the trigger function guard_progress_shrink is not callable
--    through the API (triggers still fire: firing does not check EXECUTE).

begin;

-- 1. indexes ------------------------------------------------------------------------------------------------------------------------
create index if not exists card_overrides_updated_at_idx on public.card_overrides (updated_at);
create index if not exists raid_week_attempts_cycle_time on public.raid_week_attempts (cycle, fought_at, id);
create index if not exists friendships_requester_idx on public.friendships (requester_id);
create index if not exists live_matches_player1_idx on public.live_matches (player1_id);
create index if not exists live_matches_player2_idx on public.live_matches (player2_id);

-- 2. RLS: auth.uid() once per query ---------------------------------------------------------------------------------------------------
alter policy "own profile insert" on public.profiles with check ((select auth.uid()) = id);
alter policy "own profile write" on public.profiles using ((select auth.uid()) = id);
drop policy if exists "own profile read" on public.profiles;               -- covered by "leaderboard read" (using true)

alter policy "own currencies insert" on public.player_currencies with check ((select auth.uid()) = profile_id);
alter policy "own currencies read" on public.player_currencies using ((select auth.uid()) = profile_id);
alter policy "own currencies write" on public.player_currencies using ((select auth.uid()) = profile_id);

alter policy "own unlocks write" on public.player_card_unlocks using ((select auth.uid()) = profile_id) with check ((select auth.uid()) = profile_id);
drop policy if exists "own unlocks read" on public.player_card_unlocks;     -- the ALL policy above has the same condition

alter policy "own decks write" on public.player_decks using ((select auth.uid()) = profile_id) with check ((select auth.uid()) = profile_id);
drop policy if exists "own decks read" on public.player_decks;               -- the ALL policy above has the same condition

alter policy "match history read own" on public.match_history using ((select auth.uid()) = profile_id);
alter policy "match history insert own" on public.match_history with check ((select auth.uid()) = profile_id);
alter policy "match history delete own" on public.match_history using ((select auth.uid()) = profile_id);

alter policy "own raid attempts insert" on public.raid_attempts with check ((profile_id is not null) and ((select auth.uid()) = profile_id));

alter policy "live queue read own" on public.live_queue using ((select auth.uid()) = profile_id);
alter policy "live matches read participant" on public.live_matches using (((select auth.uid()) = player1_id) or ((select auth.uid()) = player2_id));

alter policy "guilds create" on public.guilds with check ((select auth.uid()) = created_by);
alter policy "guilds delete own empty" on public.guilds using (((select auth.uid()) = created_by) and not exists (select 1 from public.guild_members m where m.guild_id = guilds.id));
alter policy "guild members leave" on public.guild_members using ((select auth.uid()) = profile_id);
alter policy "guild members join" on public.guild_members with check (((select auth.uid()) = profile_id) and ((role = 'member') or ((role = 'owner') and exists (select 1 from public.guilds g where g.id = guild_members.guild_id and g.created_by = (select auth.uid())))));

alter policy "world_events_admin_insert" on public.world_events with check ((select public.is_app_admin()));
alter policy "world_events_admin_delete" on public.world_events using ((select public.is_app_admin()));

drop policy if exists "admins write reward rules" on public.reward_rules;
drop policy if exists "admins insert reward rules" on public.reward_rules;
drop policy if exists "admins update reward rules" on public.reward_rules;
drop policy if exists "admins delete reward rules" on public.reward_rules;
create policy "admins insert reward rules" on public.reward_rules for insert to authenticated with check ((select public.is_app_admin()));
create policy "admins update reward rules" on public.reward_rules for update to authenticated using ((select public.is_app_admin())) with check ((select public.is_app_admin()));
create policy "admins delete reward rules" on public.reward_rules for delete to authenticated using ((select public.is_app_admin()));

-- 3. card_overrides.updated_at moves on every change -------------------------------------------------------------------------------------
create or replace function public.card_overrides_touch()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.updated_at is not distinct from old.updated_at then
    new.updated_at := now();
  end if;
  return new;
end $$;
revoke execute on function public.card_overrides_touch() from public, anon, authenticated;
drop trigger if exists card_overrides_touch on public.card_overrides;
create trigger card_overrides_touch before update on public.card_overrides for each row execute function public.card_overrides_touch();

-- 4. advisor tidy -------------------------------------------------------------------------------------------------------------------------
alter function public.progress_score(jsonb) set search_path = '';
revoke execute on function public.guard_progress_shrink() from public, anon, authenticated;

commit;

-- Read back after applying (read-only):
--   select indexname from pg_indexes where schemaname = 'public' and indexname in ('card_overrides_updated_at_idx', 'raid_week_attempts_cycle_time',
--     'friendships_requester_idx', 'live_matches_player1_idx', 'live_matches_player2_idx');                                    -- 5 rows
--   select tablename, policyname, qual, with_check from pg_policies where schemaname = 'public'
--     and (qual ~ 'auth\.uid\(\)' or with_check ~ 'auth\.uid\(\)') and not (coalesce(qual, '') || coalesce(with_check, '')) ~ 'SELECT auth\.uid';  -- 0 rows
--   then the performance advisor: auth_rls_initplan and multiple_permissive_policies gone (the backup tables' notices stay).
