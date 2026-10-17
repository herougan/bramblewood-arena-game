-- READY TO APPLY (prepared 2026-10-17, NOT applied yet). From draft supabase/proposed/20261017_a_rate_limits_and_currency_insert.sql,
-- cut down per the owner's decision (2026-10-17 22:48): "I think don't apply rate limits for now - im scared if people do it
-- legitimately. otherwise, 10x those number(s)".
--
-- Reading of that decision (correct it if wrong):
--   * NO request-rate limits: the draft's "120 currency writes per 10 minutes", the feedback limits (10 per 10 min per
--     player, 30 per 10 min for all guests) and the market's "10 listings / 20 buys a minute" are all dropped.
--   * KEPT, at 10x the drafted numbers: an hourly GAIN budget per currency (only gains count; spending never does):
--       200,000 Maple Leaves (gold) / 10,000 Gold Leaves (gems) / 200,000 Dust / 3,000 Metal per player per clock hour.
--   * KEPT: a cap on a brand-new player_currencies row. The draft clamped it to the per-write cap (2,000 / 200 / 2,000 / 50);
--     that would silently cut a guest's savings when they make an account, so it is 10x too:
--       20,000 Maple Leaves / 2,000 Gold Leaves / 20,000 Dust / 500 Metal.
--   * UNCHANGED (live since 2026-10-16, tier 1): one client write may add at most +2,000 Maple / +200 Gold Leaves /
--     +2,000 Dust / +50 Metal.
--   * NEW: a server-grant switch. Functions that pay on the server (market proceeds, fight rewards) set
--     bramblewood.server_grant = 'on' for their own transaction; the currency guards let those writes through and they
--     don't use up the hourly budget. A client cannot set this setting through the REST API.
--
-- Normal play stays far below the budgets: the biggest single legit grants are an SSS notice (1,100 Maple, 1,200 Dust,
-- 30 Gold Leaves, 3 Metal), the weekly tier (340 / 520 / 3 Metal) and the Wyrmslayer achievement (600 / 500 / 3 Metal),
-- and every write is already capped at +2,000 by tier 1; reaching 200,000 Maple in an hour would take 100 max-size gains.
-- Idempotent: safe to run twice.

-- 1. Budget counter (one row per player, currency and clock hour). No policies: only the definer functions below touch it.
create table if not exists public.gain_budgets (
  user_key text not null,
  bucket text not null,
  window_start timestamptz not null,
  amount bigint not null default 0,
  primary key (user_key, bucket, window_start)
);
alter table public.gain_budgets enable row level security;
revoke all on public.gain_budgets from anon, authenticated;

create or replace function public.bump_gain_budget(p_key text, p_bucket text, p_max bigint, p_window interval, p_amount bigint)
returns void
language plpgsql security definer set search_path = ''
as $$
declare
  secs double precision := extract(epoch from p_window);
  w timestamptz := to_timestamp(floor(extract(epoch from now()) / secs) * secs);
  n bigint;
begin
  if coalesce(p_amount, 0) <= 0 or p_key is null then return; end if;
  insert into public.gain_budgets as b (user_key, bucket, window_start, amount) values (p_key, p_bucket, w, p_amount)
    on conflict (user_key, bucket, window_start) do update set amount = b.amount + excluded.amount
    returning amount into n;
  if n > p_max then
    raise exception 'hourly % limit reached', p_bucket using errcode = 'P0001';
  end if;
  if random() < 0.01 then delete from public.gain_budgets where window_start < now() - interval '2 days'; end if;
end $$;
revoke all on function public.bump_gain_budget(text, text, bigint, interval, bigint) from public, anon, authenticated;

-- 2. Server-grant switch.
create or replace function public.is_server_grant() returns boolean
language sql stable set search_path = '' as $$
  select coalesce(current_setting('bramblewood.server_grant', true), '') = 'on';
$$;
revoke all on function public.is_server_grant() from public, anon, authenticated;

-- 3. UPDATE guard: tier 1's per-write cap (unchanged) + the hourly gain budget + the server-grant bypass.
--    SECURITY DEFINER so it can call the two helpers above, which signed-in users may not call directly.
create or replace function public.guard_currency_write() returns trigger
language plpgsql security definer set search_path = '' as $$
declare k text := new.profile_id::text;
begin
  if public.is_app_admin() or public.is_server_grant() then return new; end if;
  if new.gold - coalesce(old.gold, 0) > 2000 or new.gems - coalesce(old.gems, 0) > 200
     or new.dust - coalesce(old.dust, 0) > 2000 or new.metal - coalesce(old.metal, 0) > 50 then
    raise exception 'currency change too large' using errcode = '22023';
  end if;
  perform public.bump_gain_budget(k, 'gain_gold',  200000, interval '1 hour', greatest(0, coalesce(new.gold, 0)  - coalesce(old.gold, 0)));
  perform public.bump_gain_budget(k, 'gain_gems',   10000, interval '1 hour', greatest(0, coalesce(new.gems, 0)  - coalesce(old.gems, 0)));
  perform public.bump_gain_budget(k, 'gain_dust',  200000, interval '1 hour', greatest(0, coalesce(new.dust, 0)  - coalesce(old.dust, 0)));
  perform public.bump_gain_budget(k, 'gain_metal',   3000, interval '1 hour', greatest(0, coalesce(new.metal, 0) - coalesce(old.metal, 0)));
  return new;
end $$;
drop trigger if exists guard_currency_write on public.player_currencies;
create trigger guard_currency_write before update on public.player_currencies
  for each row execute function public.guard_currency_write();

-- 4. INSERT guard: a brand-new row starts at most at 20,000 / 2,000 / 20,000 / 500.
--    An upsert onto an EXISTING row also fires BEFORE INSERT first (and changing NEW here would change the values the
--    upsert writes), so an existing row is left alone here and checked by the UPDATE guard instead.
create or replace function public.guard_currency_insert() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if public.is_app_admin() or public.is_server_grant() then return new; end if;
  if exists (select 1 from public.player_currencies c where c.profile_id = new.profile_id) then return new; end if;
  new.gold  := least(coalesce(new.gold, 0), 20000);
  new.gems  := least(coalesce(new.gems, 0), 2000);
  new.dust  := least(coalesce(new.dust, 0), 20000);
  new.metal := least(coalesce(new.metal, 0), 500);
  return new;
end $$;
drop trigger if exists guard_currency_insert on public.player_currencies;
create trigger guard_currency_insert before insert on public.player_currencies
  for each row execute function public.guard_currency_insert();

revoke all on function public.guard_currency_write() from public, anon, authenticated;
revoke all on function public.guard_currency_insert() from public, anon, authenticated;

-- Not here on purpose (owner, 2026-10-17): no limit on how OFTEN currencies, feedback or market calls may be written.
-- If spam shows up later, the draft's hit_rate_limit() + guard_feedback_insert() can be added back in a new migration.
