-- PROPOSED, NOT APPLIED (2026-10-30, package ECON1, owner BRUP-1 10:34: "Their own resource & a bit of normal resource. The bramble
-- resource comes from winning fights.").
--
-- Briar Blossoms (myCurrencies.blossoms) are what a bramble's Reinforce mostly costs. The client keeps them with the other currencies and,
-- once this column exists, sends them in the player_currencies row (cloudPushCurrencies) and reads them back (cloudPullState). Until it is
-- applied the server answers "column blossoms does not exist" once, and the client sends the row without it from then on that session;
-- Blossoms stay in this browser only (like Kibble and Beer). Nothing else changes, and the game works offline either way.
--
-- Checked read-only on 2026-10-30: player_currencies has one column per currency (gold, gems, dust, metal, raid_points,
-- raid_points_updated_at, updated_at; raid_shards is still only proposed), two triggers, and reward_rules is empty (the browser pays
-- fight rewards). If reward_rules are ever filled from the game's numbers, take the clear-again amounts AFTER ECON1's halving
-- (nodeRewardTier: half of CONQUEST_NODE_REWARDS.repeat) and leave first_* as they are.
--
-- Gain guard: like the other currencies, a write may not raise blossoms by more than 2,000 at once, and an hourly gain budget of 50,000
-- applies (normal play: a boss on Map 20 pays 45, a week of the Undercroft 693). Uses public.bump_gain_budget from
-- 20261017_currency_insert_cap_and_gain_budgets.sql (applied). Idempotent: safe to run twice.

alter table public.player_currencies
  add column if not exists blossoms integer not null default 0;

alter table public.player_currencies
  drop constraint if exists player_currencies_blossoms_nonneg;
alter table public.player_currencies
  add constraint player_currencies_blossoms_nonneg check (blossoms >= 0);

create or replace function public.guard_blossoms() returns trigger
language plpgsql security definer set search_path = '' as $$
declare gain bigint;
begin
  if public.is_app_admin() or public.is_server_grant() then return new; end if; -- as guard_currency_write
  gain := greatest(0, coalesce(new.blossoms, 0) - (case when tg_op = 'UPDATE' then coalesce(old.blossoms, 0) else 0 end));
  if gain > 2000 then raise exception 'blossoms grew by more than 2000 in one write'; end if;
  if gain > 0 then perform public.bump_gain_budget(new.profile_id::text, 'gain_blossoms', 50000, interval '1 hour', gain); end if;
  return new;
end $$;
revoke all on function public.guard_blossoms() from public, anon, authenticated;

drop trigger if exists guard_blossoms on public.player_currencies;
create trigger guard_blossoms before insert or update of blossoms on public.player_currencies
  for each row execute function public.guard_blossoms();
