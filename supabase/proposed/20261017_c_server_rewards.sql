-- SUPERSEDED 2026-10-17: the final version is supabase/migrations/20261017_server_fight_rewards.sql (adjusted per the owner's 22:48 decision). Kept for the record; do not apply this file.
-- PROPOSED, NOT APPLIED (2026-10-17, docs/platform-roadmap-2026-10-17.md §3, tier 2). Apply only on "apply it".
-- Needs 20261017_a_rate_limits_and_currency_insert.sql first (public.is_server_grant).
--
-- Today: start_fight / submit_fight (live since 10-16) record a seed and the hand-in once, but the reward is still added
-- by the browser. This draft lets the SERVER pay the reward for a handed-in fight, once.
--
--   1. public.reward_rules: what a win pays, per mode and (optionally) per node. Written by admins only. The game's own
--      reward numbers have to be copied in (a small export script, roadmap step S4).
--   2. fight_sessions gets rewarded_at / reward.
--   3. public.claim_fight_reward(session): pays a 'verified' session, or, for modes marked trust_submitted, a
--      'submitted' one, once. Returns what was paid so the client can show it and stop adding the reward itself.
--   4. Verification ('submitted' → 'verified' / 'rejected') is done by the verify-fight Edge Function
--      (supabase/proposed/functions/verify-fight/index.ts) with the service role, replaying the transcript with
--      bramblewood-engine.js. Until it exists, keep trust_submitted = true for single-player modes and false for
--      anything that touches other players (pvp, raidOnline).
--
-- Later (tier 3, separate "apply it"): revoke the client's UPDATE on gold/gems/dust/metal, so currencies only change
-- through server functions (rewards, market, shop, forge). That needs every client-side spend moved to an RPC first.

create table if not exists public.reward_rules (
  mode text not null check (char_length(mode) <= 32),
  node_key text not null default '*' check (char_length(node_key) <= 80), -- '*' = any node in this mode
  gold int not null default 0 check (gold between 0 and 5000),
  gems int not null default 0 check (gems between 0 and 500),
  dust int not null default 0 check (dust between 0 and 5000),
  metal int not null default 0 check (metal between 0 and 100),
  first_clear_only boolean not null default false,
  trust_submitted boolean not null default true,
  updated_at timestamptz not null default now(),
  primary key (mode, node_key)
);
alter table public.reward_rules enable row level security;
drop policy if exists "reward rules readable" on public.reward_rules;
create policy "reward rules readable" on public.reward_rules for select to anon, authenticated using (true);
drop policy if exists "admins write reward rules" on public.reward_rules;
create policy "admins write reward rules" on public.reward_rules for all to authenticated
  using ((select public.is_app_admin())) with check ((select public.is_app_admin()));

alter table public.fight_sessions add column if not exists rewarded_at timestamptz;
alter table public.fight_sessions add column if not exists reward jsonb;

create or replace function public.claim_fight_reward(p_session uuid)
returns jsonb
language plpgsql security definer set search_path = ''
as $$
declare
  uid uuid := auth.uid();
  f public.fight_sessions%rowtype;
  r public.reward_rules%rowtype;
  won boolean;
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
    update public.fight_sessions set rewarded_at = now(), reward = '{"paid":false,"why":"lost"}' where id = p_session;
    return '{"paid":false,"why":"lost"}'::jsonb;
  end if;
  if r.first_clear_only and exists (select 1 from public.fight_sessions o where o.user_id = uid and o.mode = f.mode
        and o.node_key is not distinct from f.node_key and o.id <> f.id and o.rewarded_at is not null
        and coalesce((o.reward->>'paid')::boolean, false)) then
    update public.fight_sessions set rewarded_at = now(), reward = '{"paid":false,"why":"already cleared"}' where id = p_session;
    return '{"paid":false,"why":"already cleared"}'::jsonb;
  end if;
  perform set_config('bramblewood.server_grant', 'on', true);
  insert into public.player_currencies as c (profile_id, gold, gems, dust, metal) values (uid, r.gold, r.gems, r.dust, r.metal)
    on conflict (profile_id) do update set gold = c.gold + excluded.gold, gems = c.gems + excluded.gems,
      dust = c.dust + excluded.dust, metal = c.metal + excluded.metal, updated_at = now();
  perform set_config('bramblewood.server_grant', '', true);
  paid := jsonb_build_object('paid', true, 'gold', r.gold, 'gems', r.gems, 'dust', r.dust, 'metal', r.metal);
  update public.fight_sessions set rewarded_at = now(), reward = paid where id = p_session;
  return paid;
end $$;
revoke all on function public.claim_fight_reward(uuid) from public, anon;
grant execute on function public.claim_fight_reward(uuid) to authenticated;
