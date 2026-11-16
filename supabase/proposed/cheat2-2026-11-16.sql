-- PROPOSED, NOT APPLIED (package CHEAT2, 2026-11-16, owner 11-16 23:53: "upgrade cheat-detection"). Apply only after the owner's
-- "apply it" (decision CHEAT2-1 lists the blocks; the owner may pick some). Notes: supabase/proposed/cheat2-2026-11-16.md.
--
-- Live state read 2026-11-16 (read-only: pg_policies, pg_trigger, pg_proc bodies, constraints, fight_sessions stats, get_advisors security):
--   applied: anti-cheat tier 1 (rating server-only; one write adds at most 2,000 / 200 / 2,000 / 50), hourly gain budgets, server-settled
--   market v2, fight_sessions (start_fight / submit_fight), claim_fight_reward (reward_rules is EMPTY, so the browser still pays every win),
--   progress shrink guard, Blossoms guard. 92 fights handed in: 0 seed mismatches, 3 card-hash mismatches (live edits mid-fight), rounds 1-8.
--
-- Design rule (owner 10-17 22:48, "don't apply rate limits for now - im scared if people do it legitimately"; and "no false bans"):
-- every new check FLAGS (a row in cheat_flags) and changes nothing for the player. One switch, anticheat_settings.strict (off), turns the
-- flags of blocks C, D and F into refusals later, without new SQL. Block A is the exception: it closes a real hole.
--
-- Order: A and G stand alone; B is needed by C, D, E, F. Every block is idempotent (safe to run twice). No existing row is changed
-- (block B inserts the one settings row into its new table), so no backup table is needed. Function bodies replaced here are kept in
-- supabase/migrations/ (20261003_fight_sessions.sql, 20261017_server_fight_rewards.sql) and in the live bodies quoted in the notes, for rollback.

-- =====================================================================================================================================
-- A. Close the market's money hole (HIGH). The old create_listing / buy_listing (v1) are still callable by any session: v1 create checks no
--    ownership, v1 buy takes no payment, and claim_market_proceeds then pays the seller on the server (95% of up to 100,000, outside the
--    gain budgets). Two accounts can mint Maple Leaves at will. The game calls the _v2 functions (rpcV2) since 10-17; v1 now simply runs v2,
--    so a very old client keeps working under v2's rules (signed in, owns the card, pays). Risk: none for current clients; 0 listings live.
create or replace function public.create_listing(p_card text, p_foil boolean, p_price integer, p_currency text)
returns public.market_listings
language plpgsql security invoker set search_path = ''
as $$
begin
  return public.create_listing_v2(p_card, p_foil, p_price, p_currency);
end $$;
create or replace function public.buy_listing(p_id uuid)
returns public.market_listings
language plpgsql security invoker set search_path = ''
as $$
begin
  return public.buy_listing_v2(p_id);
end $$;
revoke all on function public.create_listing(text, boolean, integer, text) from public, anon;
revoke all on function public.buy_listing(uuid) from public, anon;
grant execute on function public.create_listing(text, boolean, integer, text) to authenticated;
grant execute on function public.buy_listing(uuid) to authenticated;

-- =====================================================================================================================================
-- B. Where flags go. cheat_flags: one row per note, from the game (source 'client', CHEAT2's signals) or from the server's own checks
--    (source 'server', blocks C-F). Players can't read or write it (RLS on, no player policy); admins read and clear it.
--    report_cheat_flags(p_flags): the game's report (signed-in players only; at most 20 a call and 100 a day per player, kinds a-z0-9-).
--    anticheat_settings: one row, strict = false (flags only) plus the daily caps of block D. Risk: storage only (bounded by the caps).
create table if not exists public.cheat_flags (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  source text not null default 'client' check (source in ('client', 'server')),
  kind text not null check (kind ~ '^[a-z0-9-]{1,32}$'),
  detail jsonb not null default '{}'::jsonb check (pg_column_size(detail) < 2000),
  build text check (char_length(build) <= 40),
  client_at text check (char_length(client_at) <= 40),
  created_at timestamptz not null default now()
);
create index if not exists cheat_flags_user_created on public.cheat_flags (user_id, created_at desc);
alter table public.cheat_flags enable row level security;
revoke all on public.cheat_flags from anon, authenticated;
grant select, delete on public.cheat_flags to authenticated;
drop policy if exists "admins read cheat flags" on public.cheat_flags;
create policy "admins read cheat flags" on public.cheat_flags for select to authenticated using ((select public.is_app_admin()));
drop policy if exists "admins delete cheat flags" on public.cheat_flags;
create policy "admins delete cheat flags" on public.cheat_flags for delete to authenticated using ((select public.is_app_admin()));

create table if not exists public.anticheat_settings (
  id int primary key default 1 check (id = 1),
  strict boolean not null default false,      -- false: every check only flags. true: blocks C, D and F refuse what they flag.
  day_gold int not null default 50000,        -- block D: server-paid fight rewards per player per UTC day
  day_gems int not null default 2000,
  day_dust int not null default 50000,
  day_metal int not null default 300,
  updated_at timestamptz not null default now()
);
insert into public.anticheat_settings (id) values (1) on conflict (id) do nothing;
alter table public.anticheat_settings enable row level security;
revoke all on public.anticheat_settings from anon, authenticated;
grant select, update on public.anticheat_settings to authenticated;
drop policy if exists "admins read anticheat settings" on public.anticheat_settings;
create policy "admins read anticheat settings" on public.anticheat_settings for select to authenticated using ((select public.is_app_admin()));
drop policy if exists "admins update anticheat settings" on public.anticheat_settings;
create policy "admins update anticheat settings" on public.anticheat_settings for update to authenticated
  using ((select public.is_app_admin())) with check ((select public.is_app_admin()));

create or replace function public.cheat2_strict() returns boolean
language sql stable set search_path = '' as $$
  select coalesce((select s.strict from public.anticheat_settings s where s.id = 1), false);
$$;
revoke all on function public.cheat2_strict() from public, anon, authenticated;

-- A server-side note: one per player, kind and hour at most. Only definer functions call it.
create or replace function public.cheat2_server_flag(p_user uuid, p_kind text, p_detail jsonb)
returns void
language plpgsql security definer set search_path = ''
as $$
begin
  if p_user is null then return; end if;
  if exists (select 1 from public.cheat_flags f where f.user_id = p_user and f.source = 'server' and f.kind = p_kind
             and f.created_at > now() - interval '1 hour') then return; end if;
  insert into public.cheat_flags (user_id, source, kind, detail) values (p_user, 'server', p_kind, coalesce(p_detail, '{}'::jsonb));
end $$;
revoke all on function public.cheat2_server_flag(uuid, text, jsonb) from public, anon, authenticated;

-- A counter that never raises (gain_budgets' table, its own buckets), for the flag-only bursts of block E.
create or replace function public.cheat2_count(p_key text, p_bucket text, p_window interval, p_amount bigint)
returns bigint
language plpgsql security definer set search_path = ''
as $$
declare
  secs double precision := extract(epoch from p_window);
  w timestamptz := to_timestamp(floor(extract(epoch from now()) / secs) * secs);
  n bigint;
begin
  insert into public.gain_budgets as b (user_key, bucket, window_start, amount) values (p_key, p_bucket, w, greatest(coalesce(p_amount, 0), 0))
    on conflict (user_key, bucket, window_start) do update set amount = b.amount + excluded.amount
    returning amount into n;
  return n;
end $$;
revoke all on function public.cheat2_count(text, text, interval, bigint) from public, anon, authenticated;

create or replace function public.report_cheat_flags(p_flags jsonb)
returns integer
language plpgsql security definer set search_path = ''
as $$
declare
  uid uuid := auth.uid();
  today int;
  e jsonb;
  n int := 0;
begin
  if uid is null or coalesce(((select auth.jwt())->>'is_anonymous')::boolean, false) then return 0; end if;
  if p_flags is null or jsonb_typeof(p_flags) <> 'array' then return 0; end if;
  select count(*) into today from public.cheat_flags f
    where f.user_id = uid and f.source = 'client' and f.created_at > now() - interval '1 day';
  for e in select x.value from jsonb_array_elements(p_flags) as x limit 20 loop
    exit when today + n >= 100;
    continue when jsonb_typeof(e) <> 'object' or coalesce(e->>'kind', '') !~ '^[a-z0-9-]{1,32}$';
    insert into public.cheat_flags (user_id, source, kind, detail, build, client_at)
      values (uid, 'client', e->>'kind',
              case when jsonb_typeof(e->'detail') = 'object' and pg_column_size(e->'detail') < 1500 then e->'detail' else '{}'::jsonb end,
              left(e->>'build', 40), left(e->>'at', 40));
    n := n + 1;
  end loop;
  return n;
end $$;
revoke all on function public.report_cheat_flags(jsonb) from public, anon;
grant execute on function public.report_cheat_flags(jsonb) to authenticated;

-- =====================================================================================================================================
-- C. Hand-in checks (submit_fight, same arguments and answers). The cheap checks verify-fight would make before a replay: the seed handed
--    back is the one the server issued, the card-data hash didn't change, rounds 1-200, at most 2,000 moves, a win not under 3 s after the
--    session opened (live: the fastest real win is 5.9 s, an Admin win). A failed check is noted in fight_sessions.reason ('check: ...') and
--    cheat_flags; the fight stays 'submitted' (strict: 'rejected'). Risk: the 3 live card-hash mismatches were admin edits during a fight,
--    so 'cards' is a soft note; nothing changes for the player while strict is off.
create or replace function public.submit_fight(p_session uuid, p_transcript jsonb, p_result jsonb)
returns text
language plpgsql security definer set search_path = ''
as $$
declare
  uid uuid := auth.uid();
  f public.fight_sessions%rowtype;
  why text[] := '{}';
  rnd int;
begin
  if uid is null then raise exception 'sign in required'; end if;
  select * into f from public.fight_sessions where id = p_session for update;
  if not found or f.user_id <> uid then return 'rejected: unknown fight'; end if;
  if f.status <> 'open' then return 'rejected: already handed in'; end if;
  if f.expires_at < now() then
    update public.fight_sessions set status = 'expired', reason = 'too late' where id = p_session;
    return 'rejected: expired';
  end if;
  -- CHEAT2 checks
  if coalesce(p_result->>'seed', '') ~ '^[0-9]{1,12}$' and (p_result->>'seed')::bigint <> f.seed then why := why || 'seed'::text; end if;
  if f.cards_hash is not null and coalesce(p_result->>'cardsHash', '') <> '' and p_result->>'cardsHash' <> f.cards_hash then why := why || 'cards'::text; end if;
  rnd := case when coalesce(p_result->>'round', '') ~ '^-?[0-9]{1,6}$' then (p_result->>'round')::int else 0 end;
  if rnd < 1 or rnd > 200 then why := why || 'rounds'::text; end if;
  if jsonb_typeof(p_transcript->'actions') = 'array' and jsonb_array_length(p_transcript->'actions') > 2000 then why := why || 'moves'::text; end if;
  if coalesce(p_result->>'winner', '') = '1' and now() - f.created_at < interval '3 seconds' then why := why || 'fast'::text; end if;
  if cardinality(why) > 0 then
    perform public.cheat2_server_flag(uid, 'hand-in-check', jsonb_build_object('session', p_session, 'why', to_jsonb(why), 'node', f.node_key));
  end if;
  update public.fight_sessions
    set status = case when cardinality(why) > 0 and public.cheat2_strict() then 'rejected' else 'submitted' end,
        transcript = p_transcript, result = p_result, submitted_at = now(),
        reason = case when cardinality(why) > 0 then 'check: ' || array_to_string(why, ',') else null end
    where id = p_session;
  return 'accepted';
end $$;
revoke all on function public.submit_fight(uuid, jsonb, jsonb) from public, anon;
grant execute on function public.submit_fight(uuid, jsonb, jsonb) to authenticated;

-- =====================================================================================================================================
-- D. Reward claim checks (claim_fight_reward, same answers). Two additions to the live body: (1) a per-day cap on what the SERVER pays one
--    player for fights (anticheat_settings day_*: 50,000 Maple / 2,000 Gold Leaves / 50,000 Dust / 300 Metal); (2) a fight whose hand-in
--    failed a check (block C). Either is flagged; with strict off the answer is "not decided", so the browser pays as it does today (and its
--    write meets tier 1's caps); strict on: "decided, paid nothing". Risk: none today: reward_rules is empty, so every claim answers
--    "no rule" before these checks run. They matter once Tier 2 (block H) fills the rules.
create or replace function public.claim_fight_reward(p_session uuid)
returns jsonb
language plpgsql security definer set search_path = ''
as $$
declare
  uid uuid := auth.uid();
  f public.fight_sessions%rowtype;
  r public.reward_rules%rowtype;
  s public.anticheat_settings%rowtype;
  won boolean;
  is_first boolean;
  mult numeric := 1;
  g int; gm int; d int; mt int;
  dg bigint; dgm bigint; dd bigint; dmt bigint;
  strict boolean := public.cheat2_strict();
  paid jsonb;
begin
  if uid is null then raise exception 'sign in required'; end if;
  select * into f from public.fight_sessions where id = p_session for update;
  if not found or f.user_id <> uid then raise exception 'unknown fight'; end if;
  if f.rewarded_at is not null then return coalesce(f.reward, '{}'::jsonb) || '{"already":true}'::jsonb; end if;
  select * into r from public.reward_rules
    where mode = f.mode and node_key in (coalesce(f.node_key, '*'), '*')
    order by (node_key = '*') limit 1;            -- a node rule beats the mode-wide rule
  if not found then return '{"paid":false,"why":"no rule"}'::jsonb; end if;
  if not (f.status = 'verified' or (f.status = 'submitted' and r.trust_submitted)) then
    return jsonb_build_object('paid', false, 'why', 'fight is ' || f.status);
  end if;
  won := coalesce((f.result->>'won')::boolean, (f.result->>'winner') = '1', false);
  if not won then
    paid := '{"decided":true,"paid":false,"why":"lost"}'::jsonb;
    update public.fight_sessions set rewarded_at = now(), reward = paid where id = p_session;
    return paid;
  end if;
  -- CHEAT2 (1/2): a hand-in that failed a check (block C)
  if coalesce(f.reason, '') like 'check:%' then
    if strict then
      paid := jsonb_build_object('decided', true, 'paid', false, 'why', f.reason);
      update public.fight_sessions set rewarded_at = now(), reward = paid where id = p_session;
      return paid;
    end if;
    return jsonb_build_object('paid', false, 'why', f.reason);
  end if;
  is_first := coalesce((f.result->>'firstClear')::boolean, false)
    and not exists (select 1 from public.fight_sessions o where o.user_id = uid and o.mode = f.mode
        and o.node_key is not distinct from f.node_key and o.id <> f.id and o.rewarded_at is not null
        and coalesce((o.reward->>'first')::boolean, false));
  if is_first then
    g := r.first_gold; gm := r.first_gems; d := r.first_dust; mt := r.first_metal;
  else
    if r.rank_bonus then
      mult := case f.result->>'rank' when 'E' then 0.6 when 'D' then 0.8 when 'C' then 1 when 'B' then 1.05 when 'A' then 1.1
        when 'S' then 1.11 when 'SS' then 1.12 when 'SSS' then 1.13 else 1 end;
    end if;
    g := r.gold + floor(r.gold * (mult - 1) + 0.5)::int;
    d := r.dust + floor(r.dust * (mult - 1) + 0.5)::int;
    gm := r.gems; mt := r.metal;
  end if;
  g := greatest(0, g); gm := greatest(0, gm); d := greatest(0, d); mt := greatest(0, mt);
  -- CHEAT2 (2/2): what the server already paid this player for fights today (UTC), plus this one, against the daily caps
  select * into s from public.anticheat_settings where id = 1;
  if found then
    select coalesce(sum((o.reward->>'gold')::bigint), 0), coalesce(sum((o.reward->>'gems')::bigint), 0),
           coalesce(sum((o.reward->>'dust')::bigint), 0), coalesce(sum((o.reward->>'metal')::bigint), 0)
      into dg, dgm, dd, dmt
      from public.fight_sessions o
      where o.user_id = uid and o.rewarded_at >= date_trunc('day', now()) and coalesce((o.reward->>'paid')::boolean, false);
    if dg + g > s.day_gold or dgm + gm > s.day_gems or dd + d > s.day_dust or dmt + mt > s.day_metal then
      perform public.cheat2_server_flag(uid, 'reward-day-cap', jsonb_build_object('session', p_session,
        'today', jsonb_build_object('gold', dg, 'gems', dgm, 'dust', dd, 'metal', dmt)));
      if strict then
        paid := '{"decided":true,"paid":false,"why":"daily cap"}'::jsonb;
        update public.fight_sessions set rewarded_at = now(), reward = paid where id = p_session;
        return paid;
      end if;
      return '{"paid":false,"why":"daily cap"}'::jsonb;
    end if;
  end if;
  if g > 0 or gm > 0 or d > 0 or mt > 0 then
    perform set_config('bramblewood.server_grant', 'on', true); -- this transaction only
    insert into public.player_currencies as c (profile_id, gold, gems, dust, metal) values (uid, g, gm, d, mt)
      on conflict (profile_id) do update set gold = c.gold + excluded.gold, gems = c.gems + excluded.gems,
        dust = c.dust + excluded.dust, metal = c.metal + excluded.metal, updated_at = now();
    perform set_config('bramblewood.server_grant', '', true);
  end if;
  paid := jsonb_build_object('decided', true, 'paid', true, 'first', is_first, 'gold', g, 'gems', gm, 'dust', d, 'metal', mt);
  update public.fight_sessions set rewarded_at = now(), reward = paid where id = p_session;
  return paid;
end $$;
revoke all on function public.claim_fight_reward(uuid) from public, anon;
grant execute on function public.claim_fight_reward(uuid) to authenticated;

-- =====================================================================================================================================
-- E. Burst notes on what players write themselves (flag only, never refused; admins exempt).
--    card-burst: more than 60 NEW card rows in one clock hour (player_card_unlocks is player-written, and create_listing_v2 trusts it).
--      An account's first sync (no rows before the statement: a guest who just signed up brings all their cards) is not counted.
--    raid-burst: more than 60 attempts on one boss in one raid week by one player (raid_week_attempts is player-written, damage <= 10,000).
--    Risk: one small count per insert statement (statement-level triggers, not per row).
create or replace function public.cheat2_card_burst() returns trigger
language plpgsql security definer set search_path = ''
as $$
declare r record; total bigint;
begin
  if public.is_app_admin() then return null; end if;
  for r in select i.profile_id, count(*) as n from ins i group by i.profile_id loop
    continue when not exists (select 1 from public.player_card_unlocks u where u.profile_id = r.profile_id
      and not exists (select 1 from ins i2 where i2.profile_id = u.profile_id and i2.card_id = u.card_id));
    total := public.cheat2_count(r.profile_id::text, 'cards_new', interval '1 hour', r.n);
    if total > 60 then perform public.cheat2_server_flag(r.profile_id, 'card-burst', jsonb_build_object('n', total)); end if;
  end loop;
  return null;
end $$;
revoke all on function public.cheat2_card_burst() from public, anon, authenticated;
drop trigger if exists cheat2_card_burst on public.player_card_unlocks;
create trigger cheat2_card_burst after insert on public.player_card_unlocks
  referencing new table as ins for each statement execute function public.cheat2_card_burst();

create or replace function public.cheat2_raid_burst() returns trigger
language plpgsql security definer set search_path = ''
as $$
declare r record; n bigint;
begin
  if public.is_app_admin() then return null; end if;
  for r in select distinct i.owner_id, i.boss_id, i.cycle from ins i where i.owner_id is not null loop
    select count(*) into n from public.raid_week_attempts a where a.owner_id = r.owner_id and a.boss_id = r.boss_id and a.cycle = r.cycle;
    if n > 60 then perform public.cheat2_server_flag(r.owner_id, 'raid-burst', jsonb_build_object('boss', r.boss_id, 'cycle', r.cycle, 'n', n)); end if;
  end loop;
  return null;
end $$;
revoke all on function public.cheat2_raid_burst() from public, anon, authenticated;
drop trigger if exists cheat2_raid_burst on public.raid_week_attempts;
create trigger cheat2_raid_burst after insert on public.raid_week_attempts
  referencing new table as ins for each statement execute function public.cheat2_raid_burst();

-- =====================================================================================================================================
-- F. Ranked results (report_live_match_result, same arguments). Live body kept, plus: (1) a draw (no winner) leaves both ratings as they are
--    (today it counts as player 2's win); (2) the same two players' 6th+ ranked result in 24 h is flagged for both (win trading, a second
--    account); strict: such a result changes no rating. (3) search_path pinned to ''. Every name was already schema-qualified.
--    Risk: a draw no longer moves ratings (a fix); the host still reports alone (Tier 3, verify-fight, is the real answer).
create or replace function public.report_live_match_result(p_match_id uuid, p_winner_id uuid, p_player1_new_rating numeric, p_player2_new_rating numeric)
returns void
language plpgsql security definer set search_path = ''
as $$
declare
  m public.live_matches;
  r1 numeric; r2 numeric;
  n1 numeric; n2 numeric;
  k constant numeric := 24;
  pair int;
begin
  select * into m from public.live_matches where id = p_match_id for update;
  if not found then raise exception 'match not found'; end if;
  if m.host_id <> auth.uid() then raise exception 'only the match host can report its result'; end if;
  if m.status <> 'active' then return; end if;
  if p_winner_id is not null and p_winner_id <> m.player1_id and p_winner_id <> m.player2_id then
    raise exception 'winner must be one of the two match players';
  end if;
  if not m.ranked or p_winner_id is null then  -- CHEAT2 (1): a draw changes no rating
    update public.live_matches set status = 'done', winner_id = p_winner_id, ended_at = now() where id = p_match_id;
    return;
  end if;
  -- CHEAT2 (2): the same pair, 24 h
  select count(*) into pair from public.live_matches o
    where o.ranked and o.status = 'done' and o.id <> m.id and o.ended_at > now() - interval '24 hours'
      and least(o.player1_id, o.player2_id) = least(m.player1_id, m.player2_id)
      and greatest(o.player1_id, o.player2_id) = greatest(m.player1_id, m.player2_id);
  if pair >= 5 then
    perform public.cheat2_server_flag(m.player1_id, 'ranked-pair', jsonb_build_object('match', m.id, 'n', pair + 1));
    perform public.cheat2_server_flag(m.player2_id, 'ranked-pair', jsonb_build_object('match', m.id, 'n', pair + 1));
    if public.cheat2_strict() then
      update public.live_matches set status = 'done', winner_id = p_winner_id, ended_at = now() where id = p_match_id;
      return;
    end if;
  end if;
  select coalesce(rating, 1500) into r1 from public.profiles where id = m.player1_id;
  select coalesce(rating, 1500) into r2 from public.profiles where id = m.player2_id;
  r1 := coalesce(r1, 1500); r2 := coalesce(r2, 1500);
  n1 := least(r1 + k, greatest(r1 - k, coalesce(p_player1_new_rating, r1)));
  n2 := least(r2 + k, greatest(r2 - k, coalesce(p_player2_new_rating, r2)));
  if p_winner_id = m.player1_id then n1 := greatest(n1, r1); n2 := least(n2, r2);
  else n2 := greatest(n2, r2); n1 := least(n1, r1); end if;
  update public.live_matches set status = 'done', winner_id = p_winner_id, ended_at = now() where id = p_match_id;
  update public.profiles set rating = n1, updated_at = now() where id = m.player1_id;
  update public.profiles set rating = n2, updated_at = now() where id = m.player2_id;
end $$;
revoke all on function public.report_live_match_result(uuid, uuid, numeric, numeric) from public, anon;
grant execute on function public.report_live_match_result(uuid, uuid, numeric, numeric) to authenticated;

-- =====================================================================================================================================
-- G. Hardening from the audit: the last functions still on search_path 'public' get '' like the rest (an object someone creates in a
--    schema earlier on the path can never be picked up by name). Bodies read 2026-11-16: every table is written public.<name>; the rest is
--    pg_catalog (always searched). Risk: none expected; read-back below calls nothing, the advisor re-check does.
alter function public.find_ranked_match(numeric, jsonb, text, text) set search_path = '';
alter function public.abandon_live_match(uuid) set search_path = '';
alter function public.cancel_ranked_queue() set search_path = '';
alter function public.admin_user_list() set search_path = '';
alter function public.guard_progress_shrink() set search_path = '';
alter function public._admin_safe_jsonb(text) set search_path = '';

-- =====================================================================================================================================
-- H. Tier 2 option: the server grants rewards. NOT part of the default "apply it": commented out, each step is its own owner call.
--   H1. Fill reward_rules from the game's own numbers (CONQUEST_NODE_REWARDS, node overrides, boss Metal, dungeon Gold Leaves, ECON1's
--       x0.5 repeat). Needs an export tool (not written yet) so every node matches what the browser pays; then claim_fight_reward pays
--       Conquest wins on the server and the browser adds exactly that (settleFightReward, live since 10-17). Example row:
--   -- insert into public.reward_rules (mode, node_key, gold, dust, first_gold, first_dust) values ('conquest', 'm1:0-1', 4, 0, 40, 20);
--   H2. Turn the flags of blocks C, D and F into refusals:
--   -- update public.anticheat_settings set strict = true, updated_at = now() where id = 1;
--   H3. Later, with H1 live: lower tier 1's per-write client cap (2,000 Maple / Dust) for the currencies the server now pays, and move pack
--       opening and card unlocks into server functions (the pack table is already __cfg:shop-packs), so player_card_unlocks stops being
--       player-written. Tier 3 (verify-fight replays the hand-in; the game now sends transcript.rec) stays blocked on a DOM-free match driver.

-- =====================================================================================================================================
-- Read-back after applying (read-only):
--   select proname, prosecdef, proconfig from pg_proc where pronamespace = 'public'::regnamespace and proname in
--     ('create_listing','buy_listing','report_cheat_flags','cheat2_server_flag','cheat2_count','cheat2_strict','submit_fight',
--      'claim_fight_reward','report_live_match_result','find_ranked_match','abandon_live_match','cancel_ranked_queue','admin_user_list',
--      'guard_progress_shrink','_admin_safe_jsonb','cheat2_card_burst','cheat2_raid_burst');
--   select tgname, tgrelid::regclass from pg_trigger where tgname like 'cheat2_%';
--   select * from public.anticheat_settings;            -- one row, strict = false
--   select relname, relrowsecurity from pg_class where relname in ('cheat_flags', 'anticheat_settings');
--   Then get_advisors (security and performance).
