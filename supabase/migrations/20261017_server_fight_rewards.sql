-- READY TO APPLY (prepared 2026-10-17, NOT applied yet). From draft supabase/proposed/20261017_c_server_rewards.sql.
-- Needs 20261017_currency_insert_cap_and_gain_budgets.sql first (public.is_server_grant).
--
-- Today start_fight / submit_fight (live since 10-16) record a seed and one hand-in per Conquest fight, but the browser adds
-- the reward itself. This lets the SERVER pay the Leaves / Dust / Metal of a handed-in win, once per fight:
--   1. public.reward_rules: what a win pays, per mode and node ('*' = every node of the mode). Admin-written only.
--      It starts EMPTY, so nothing changes in play until rules are copied in from the game's own numbers (roadmap S4: a
--      small export of CONQUEST_NODE_REWARDS, node overrides, boss Metal and dungeon Gold Leaves).
--   2. fight_sessions gets rewarded_at / reward.
--   3. public.claim_fight_reward(session) pays a 'verified' fight, or a 'submitted' one when the rule trusts hand-ins.
--
-- Changed from the draft: a rule has every-win amounts (gold/gems/dust/metal) AND first-clear amounts (first_*), which
-- replace them on a first clear, plus an optional rank bonus on repeat clears (the game's RANK_MULT, from E 0.6 to
-- SSS 1.13), so one rule row can carry what the game pays today. A clear counts as first only if the browser says so
-- (result.firstClear) AND the server has never paid this player a first clear on this node, so a first-clear bonus can
-- be paid once at most. (The draft's first_clear_only becomes "every-win amounts all 0".)
--
-- How the browser uses it (arena_app.js, settleFightReward): after a Conquest win with a fight session it hands the fight
-- in, then calls claim_fight_reward. If the answer is "decided" it adds exactly what the server paid; if the function
-- doesn't exist yet, there is no rule, the fight isn't trusted yet, or the call fails or times out, it adds its own reward
-- as before. It never adds both.
-- Idempotent: safe to run twice.

create table if not exists public.reward_rules (
  mode text not null check (char_length(mode) <= 32),
  node_key text not null default '*' check (char_length(node_key) <= 80),
  gold int not null default 0 check (gold between 0 and 5000),
  gems int not null default 0 check (gems between 0 and 500),
  dust int not null default 0 check (dust between 0 and 5000),
  metal int not null default 0 check (metal between 0 and 100),
  first_gold int not null default 0 check (first_gold between 0 and 5000),
  first_gems int not null default 0 check (first_gems between 0 and 500),
  first_dust int not null default 0 check (first_dust between 0 and 5000),
  first_metal int not null default 0 check (first_metal between 0 and 100),
  rank_bonus boolean not null default true,       -- repeat clears: gold/dust x RANK_MULT[rank], as the browser does
  trust_submitted boolean not null default true,  -- false: pay only once verify-fight has marked the fight 'verified'
  updated_at timestamptz not null default now(),
  primary key (mode, node_key)
);
alter table public.reward_rules add column if not exists first_gold int not null default 0;
alter table public.reward_rules add column if not exists first_gems int not null default 0;
alter table public.reward_rules add column if not exists first_dust int not null default 0;
alter table public.reward_rules add column if not exists first_metal int not null default 0;
alter table public.reward_rules add column if not exists rank_bonus boolean not null default true;
alter table public.reward_rules enable row level security;
drop policy if exists "reward rules readable" on public.reward_rules;
create policy "reward rules readable" on public.reward_rules for select to anon, authenticated using (true);
drop policy if exists "admins write reward rules" on public.reward_rules;
create policy "admins write reward rules" on public.reward_rules for all to authenticated
  using ((select public.is_app_admin())) with check ((select public.is_app_admin()));

alter table public.fight_sessions add column if not exists rewarded_at timestamptz;
alter table public.fight_sessions add column if not exists reward jsonb;

-- Answers (jsonb):
--   {"decided":true,"paid":true,"first":bool,"gold":..,"gems":..,"dust":..,"metal":..}  the server paid this (may be 0s)
--   {"decided":true,"paid":false,"why":"lost"}                                          a loss pays nothing
--   {"paid":false,"why":"no rule"} / {"paid":false,"why":"fight is open|submitted|..."}  not decided: browser pays itself
--   a second call returns the first answer plus "already":true
create or replace function public.claim_fight_reward(p_session uuid)
returns jsonb
language plpgsql security definer set search_path = ''
as $$
declare
  uid uuid := auth.uid();
  f public.fight_sessions%rowtype;
  r public.reward_rules%rowtype;
  won boolean;
  is_first boolean;
  mult numeric := 1;
  g int; gm int; d int; mt int;
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
    -- base + Math.round(base * (mult - 1)), the browser's own formula (floor(x + 0.5) = JS Math.round)
    g := r.gold + floor(r.gold * (mult - 1) + 0.5)::int;
    d := r.dust + floor(r.dust * (mult - 1) + 0.5)::int;
    gm := r.gems; mt := r.metal;
  end if;
  g := greatest(0, g); gm := greatest(0, gm); d := greatest(0, d); mt := greatest(0, mt);
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

-- Suggested starting rules, NOT inserted here (they need the export script to match every node override):
-- insert into public.reward_rules (mode, node_key, gold, dust, first_gold, first_dust) values ('conquest', 'm1:1-A-1', 8, 0, 40, 20);
-- Keep trust_submitted = false for 'pvp' and 'raidOnline' rules until verify-fight replays fights.
