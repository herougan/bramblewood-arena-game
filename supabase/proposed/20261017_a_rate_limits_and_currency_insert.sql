-- PROPOSED, NOT APPLIED (2026-10-17, docs/platform-roadmap-2026-10-17.md §3). Apply only when the owner says "apply it".
-- Security tier 1.5: close the gaps left by anti-cheat tier 1 (20261008_anticheat_tier1.sql).
--
-- Gaps found in the live policies on 2026-10-17 (read-only check):
--   1. guard_currency_write fires on UPDATE only. A new account's first INSERT into player_currencies can carry any
--      amount (999999 Maple Leaves), because there is no INSERT check.
--   2. The 2,000 / 200 cap is per write, with no limit on how many writes. A script can add 2,000 every request.
--   3. Anyone (including signed-out visitors) can insert feedback rows with no rate limit (each row up to 4,000 chars
--      plus 8 KB of context), so the table can be flooded.
--
-- What this adds:
--   * public.rate_limits + public.hit_rate_limit(bucket, max, window, amount): a fixed-window counter per user.
--   * A per-hour GAIN budget per currency on top of the per-write cap (numbers below are a first guess; the owner sets
--     them from the economy doc: they must sit above what an honest heavy player earns in an hour).
--   * An INSERT check on player_currencies that clamps a brand-new row to the per-write cap (an upsert onto an
--     existing row is left to the UPDATE trigger, so it never clamps an honest balance).
--   * Rate limits on feedback inserts (signed-in: 10 per 10 min each; signed-out: 30 per 10 min for all guests together).
--   * A server-grant switch: functions that pay rewards set bramblewood.server_grant = 'on' for their own transaction,
--     and the currency guards let those writes through. Clients cannot set this setting through the REST API.
--
-- Client impact: none for honest play, except a guest who links a NEW account with more than 2,000 Leaves saved in the
-- browser: the new row is clamped to 2,000 (say if you'd rather refuse, or raise the starting cap).

create table if not exists public.rate_limits (
  user_key text not null,
  bucket text not null,
  window_start timestamptz not null,
  hits bigint not null default 0,
  primary key (user_key, bucket, window_start)
);
alter table public.rate_limits enable row level security; -- no policies on purpose: only definer functions touch it
revoke all on public.rate_limits from anon, authenticated;

create or replace function public.hit_rate_limit(p_bucket text, p_max bigint, p_window interval, p_amount bigint default 1)
returns void
language plpgsql security definer set search_path = ''
as $$
declare
  k text := coalesce((select auth.uid())::text, 'guest');
  secs double precision := extract(epoch from p_window);
  w timestamptz := to_timestamp(floor(extract(epoch from now()) / secs) * secs);
  n bigint;
begin
  if coalesce(p_amount, 0) <= 0 then return; end if;
  insert into public.rate_limits as r (user_key, bucket, window_start, hits) values (k, p_bucket, w, p_amount)
    on conflict (user_key, bucket, window_start) do update set hits = r.hits + excluded.hits
    returning hits into n;
  if n > p_max then
    raise exception 'slow down: % limit reached', p_bucket using errcode = 'P0001';
  end if;
  if random() < 0.01 then delete from public.rate_limits where window_start < now() - interval '2 days'; end if;
end $$;
revoke all on function public.hit_rate_limit(text, bigint, interval, bigint) from public, anon, authenticated;

-- Server grants (reward functions) skip the client caps.
create or replace function public.is_server_grant() returns boolean
language sql stable set search_path = '' as $$
  select coalesce(current_setting('bramblewood.server_grant', true), '') = 'on';
$$;

-- UPDATE guard: tier 1's per-write cap, plus an hourly gain budget, plus the server-grant bypass.
create or replace function public.guard_currency_write() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if public.is_app_admin() or public.is_server_grant() then return new; end if;
  if new.gold - coalesce(old.gold, 0) > 2000 or new.gems - coalesce(old.gems, 0) > 200
     or new.dust - coalesce(old.dust, 0) > 2000 or new.metal - coalesce(old.metal, 0) > 50 then
    raise exception 'currency change too large' using errcode = '22023';
  end if;
  perform public.hit_rate_limit('currency_writes', 120, interval '10 minutes');
  perform public.hit_rate_limit('gain_gold',  20000, interval '1 hour', greatest(0, new.gold  - coalesce(old.gold, 0)));
  perform public.hit_rate_limit('gain_gems',   1000, interval '1 hour', greatest(0, new.gems  - coalesce(old.gems, 0)));
  perform public.hit_rate_limit('gain_dust',  20000, interval '1 hour', greatest(0, new.dust  - coalesce(old.dust, 0)));
  perform public.hit_rate_limit('gain_metal',   300, interval '1 hour', greatest(0, new.metal - coalesce(old.metal, 0)));
  return new;
end $$;
-- (the trigger guard_currency_write from tier 1 already points at this function name)

-- INSERT guard: a brand-new row starts at most at the per-write cap.
create or replace function public.guard_currency_insert() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if public.is_app_admin() or public.is_server_grant() then return new; end if;
  -- An upsert onto an existing row also fires BEFORE INSERT first; leave that to the UPDATE trigger.
  if exists (select 1 from public.player_currencies c where c.profile_id = new.profile_id) then return new; end if;
  new.gold  := least(coalesce(new.gold, 0), 2000);
  new.gems  := least(coalesce(new.gems, 0), 200);
  new.dust  := least(coalesce(new.dust, 0), 2000);
  new.metal := least(coalesce(new.metal, 0), 50);
  return new;
end $$;
drop trigger if exists guard_currency_insert on public.player_currencies;
create trigger guard_currency_insert before insert on public.player_currencies
  for each row execute function public.guard_currency_insert();

-- Feedback flood guard.
create or replace function public.guard_feedback_insert() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if (select auth.uid()) is null then perform public.hit_rate_limit('feedback_guest', 30, interval '10 minutes');
  else perform public.hit_rate_limit('feedback', 10, interval '10 minutes'); end if;
  return new;
end $$;
drop trigger if exists guard_feedback_insert on public.feedback;
create trigger guard_feedback_insert before insert on public.feedback
  for each row execute function public.guard_feedback_insert();

revoke all on function public.guard_currency_write() from public, anon, authenticated;
revoke all on function public.guard_currency_insert() from public, anon, authenticated;
revoke all on function public.guard_feedback_insert() from public, anon, authenticated;
revoke all on function public.is_server_grant() from public, anon, authenticated;
-- Before applying: check how often cloud sync writes player_currencies (arena_app.js, cloud push). 120 writes per
-- 10 minutes must stay well above an honest session, or sync errors will show up as "☁️ Offline".
