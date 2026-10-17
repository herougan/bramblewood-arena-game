-- SUPERSEDED 2026-10-17: the final version is supabase/migrations/20261017_market_server_settlement.sql (adjusted per the owner's 22:48 decision). Kept for the record; do not apply this file.
-- PROPOSED, NOT APPLIED (2026-10-17, docs/platform-roadmap-2026-10-17.md §3). Apply only when the owner says "apply it".
-- Needs 20261017_a_rate_limits_and_currency_insert.sql first (public.is_server_grant, public.hit_rate_limit).
--
-- What the live market functions do today (read 2026-10-17):
--   * create_listing: checks only "at most 20 active listings". It does NOT check that the seller owns the card.
--   * buy_listing: marks the listing sold. It does NOT take the price from the buyer; the browser does that.
--   * claim_market_proceeds: marks the seller paid. The browser adds the price to the seller's Leaves.
-- So a player with the console open can list cards they don't own and buy anything without paying.
--
-- This draft adds v2 functions that settle on the server, in one transaction:
--   * create_listing_v2: the seller must have the card unlocked; price 1..100000; currency gold or gems; 10 listings a
--     minute at most.
--   * buy_listing_v2: takes the price from the buyer's row (refuses if short), credits the seller, marks the listing
--     sold AND paid. Both currency rows are locked in a fixed order so two buys can't deadlock.
-- The old functions stay until the client switches (then revoke them; see the bottom). Client changes needed:
--   * call create_listing_v2 / buy_listing_v2;
--   * after a buy, re-read player_currencies instead of subtracting locally (or the next sync would push the old,
--     higher balance back; the UPDATE guard would allow it, since it only caps gains, so this matters);
--   * stop adding proceeds in claim_market_proceeds' result for listings sold through v2 (seller_paid is already true).
-- Open question for the owner: should listing a card REMOVE a copy from the seller? player_card_unlocks has no copy
-- count (copies live in player_progress.data), so this draft only checks ownership.

create or replace function public.create_listing_v2(p_card text, p_foil boolean, p_price integer, p_currency text)
returns public.market_listings
language plpgsql security definer set search_path = ''
as $$
declare me uuid := auth.uid(); l public.market_listings; n int; cur text := coalesce(p_currency, 'gold');
begin
  if me is null or coalesce(((select auth.jwt())->>'is_anonymous')::boolean, false) then raise exception 'sign in required'; end if;
  if cur not in ('gold', 'gems') then raise exception 'unknown currency'; end if;
  if p_price is null or p_price < 1 or p_price > 100000 then raise exception 'price out of range'; end if;
  if not exists (select 1 from public.player_card_unlocks u where u.profile_id = me and u.card_id = p_card) then
    raise exception 'you do not own this card';
  end if;
  perform public.hit_rate_limit('market_list', 10, interval '1 minute');
  select count(*) into n from public.market_listings where seller_id = me and status = 'active';
  if n >= 20 then raise exception 'you can have at most 20 active listings'; end if;
  insert into public.market_listings (seller_id, card_id, foil, price, currency)
    values (me, p_card, coalesce(p_foil, false), p_price, cur)
    returning * into l;
  return l;
end $$;

create or replace function public.buy_listing_v2(p_id uuid)
returns public.market_listings
language plpgsql security definer set search_path = ''
as $$
declare me uuid := auth.uid(); l public.market_listings; bal int;
begin
  if me is null or coalesce(((select auth.jwt())->>'is_anonymous')::boolean, false) then raise exception 'sign in required'; end if;
  perform public.hit_rate_limit('market_buy', 20, interval '1 minute');
  select * into l from public.market_listings where id = p_id for update;
  if not found or l.status <> 'active' then raise exception 'this listing is no longer available'; end if;
  if l.seller_id = me then raise exception 'you cannot buy your own listing'; end if;
  -- lock both wallets, lower id first
  perform 1 from public.player_currencies where profile_id in (me, l.seller_id) order by profile_id for update;
  select case when l.currency = 'gems' then gems else gold end into bal from public.player_currencies where profile_id = me;
  if bal is null or bal < l.price then raise exception 'not enough Leaves'; end if;
  perform set_config('bramblewood.server_grant', 'on', true); -- this transaction only
  if l.currency = 'gems' then
    update public.player_currencies set gems = gems - l.price, updated_at = now() where profile_id = me;
    insert into public.player_currencies as c (profile_id, gems) values (l.seller_id, l.price)
      on conflict (profile_id) do update set gems = c.gems + excluded.gems, updated_at = now();
  else
    update public.player_currencies set gold = gold - l.price, updated_at = now() where profile_id = me;
    insert into public.player_currencies as c (profile_id, gold) values (l.seller_id, l.price)
      on conflict (profile_id) do update set gold = c.gold + excluded.gold, updated_at = now();
  end if;
  perform set_config('bramblewood.server_grant', '', true);
  update public.market_listings
    set status = 'sold', buyer_id = me, sold_at = now(), buyer_claimed = true, seller_paid = true
    where id = p_id returning * into l;
  return l;
end $$;

revoke all on function public.create_listing_v2(text, boolean, integer, text) from public, anon;
revoke all on function public.buy_listing_v2(uuid) from public, anon;
grant execute on function public.create_listing_v2(text, boolean, integer, text) to authenticated;
grant execute on function public.buy_listing_v2(uuid) to authenticated;

-- AFTER the client ships v2 (a separate "apply it"):
-- revoke execute on function public.create_listing(text, boolean, integer, text) from authenticated;
-- revoke execute on function public.buy_listing(uuid) from authenticated;
