-- PROPOSED, NOT APPLIED (2026-10-08). Apply only when the owner says so.
-- Anti-cheat tier 1: stop a signed-in player editing the numbers other players can see.

-- 1. Rating: players may update their own profile, but not their rating (only report_live_match_result,
--    a SECURITY DEFINER function, changes it).
revoke update on public.profiles from authenticated;
grant update (display_name, last_seen_at, updated_at) on public.profiles to authenticated;

-- 2. Currencies: cap how much a single client write can ADD (spending is always allowed).
--    Real fix is server-granted rewards (fight sessions, T3); this blunts a console edit to 999999.
create or replace function public.guard_currency_write() returns trigger
language plpgsql set search_path to '' as $$
begin
  if public.is_app_admin() then return new; end if;
  if new.gold - coalesce(old.gold,0) > 2000 or new.gems - coalesce(old.gems,0) > 200
     or new.dust - coalesce(old.dust,0) > 2000 or new.metal - coalesce(old.metal,0) > 50 then
    raise exception 'currency change too large' using errcode = '22023';
  end if;
  return new;
end $$;
drop trigger if exists guard_currency_write on public.player_currencies;
create trigger guard_currency_write before update on public.player_currencies
  for each row execute function public.guard_currency_write();
