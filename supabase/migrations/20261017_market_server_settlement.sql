-- READY TO APPLY (prepared 2026-10-17, NOT applied yet). From draft supabase/proposed/20261017_b_market_server_settlement.sql.
-- Needs 20261017_currency_insert_cap_and_gain_budgets.sql first (public.is_server_grant).
-- Owner (2026-10-17 22:48): no request-rate limits, so the draft's "10 listings / 20 buys a minute" are dropped.
--
-- Before: create_listing didn't check the seller owns the card; buy_listing marked the listing sold without taking the price
-- (the browser did); claim_market_proceeds only flipped seller_paid (the browser added the Leaves).
--
-- After:
--   * create_listing_v2: signed-in (not guest) seller, card in player_card_unlocks, price 1..100,000, gold or gems, at most
--     20 active listings (as before).
--   * buy_listing_v2: in one transaction, refuses if the buyer's server balance is short, takes the price from the buyer and
--     marks the listing sold.
--   * claim_market_proceeds (same name and result, replaced in place): now also CREDITS the seller on the server, net of the
--     5% market fee (floor(price * 95 / 100), at least 1, the same number the browser adds), and marks the rows paid.
--
-- Changed from the draft (on purpose): the seller is credited when THEY claim, not when the buyer buys. The browser saves
-- whole balances (it upserts the numbers it holds), so a credit the seller's browser never heard about would be wiped by
-- that browser's next save. Crediting inside the seller's own claim call, which returns the rows so the browser adds the
-- same amount locally, keeps both sides equal. It also means proceeds above +2,000 no longer bounce off the per-write cap.
-- The buyer's browser likewise subtracts the same price locally after buy_listing_v2 succeeds.
--
-- Compatibility: the old create_listing / buy_listing stay callable so a browser tab still running yesterday's build keeps
-- working; the new build calls the v2 functions and falls back to the old ones only while v2 doesn't exist yet.
-- Listing still takes a copy out of the browser's collection (and cancelling gives it back), as before; the server only
-- checks ownership (copies live in player_progress.data, not in a table). Owner's open question: should it stay that way?
-- Idempotent: safe to run twice.

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
  select * into l from public.market_listings where id = p_id for update;
  if not found or l.status <> 'active' then raise exception 'this listing is no longer available'; end if;
  if l.seller_id = me then raise exception 'you cannot buy your own listing'; end if;
  select case when l.currency = 'gems' then c.gems else c.gold end into bal
    from public.player_currencies c where c.profile_id = me for update;
  if bal is null or bal < l.price then raise exception 'not enough Leaves'; end if;
  -- A decrease: the currency guard allows it without the server-grant switch.
  if l.currency = 'gems' then
    update public.player_currencies set gems = gems - l.price, updated_at = now() where profile_id = me;
  else
    update public.player_currencies set gold = gold - l.price, updated_at = now() where profile_id = me;
  end if;
  update public.market_listings
    set status = 'sold', buyer_id = me, sold_at = now(), buyer_claimed = true
    where id = p_id returning * into l;
  return l;
end $$;

-- Same signature and result as before (setof market_listings), so old and new browsers both keep working with it.
create or replace function public.claim_market_proceeds()
returns setof public.market_listings
language plpgsql security definer set search_path = ''
as $$
declare me uuid := auth.uid(); rows public.market_listings[]; g bigint; gm bigint;
begin
  if me is null then return; end if;
  with paid as (
    update public.market_listings set seller_paid = true
      where seller_id = me and status = 'sold' and not seller_paid
      returning *
  ) select coalesce(array_agg(paid), '{}') into rows from paid;
  if coalesce(array_length(rows, 1), 0) = 0 then return; end if;
  select coalesce(sum(case when x.currency = 'gold' then greatest(1, (x.price * 95) / 100) else 0 end), 0),
         coalesce(sum(case when x.currency = 'gems' then greatest(1, (x.price * 95) / 100) else 0 end), 0)
    into g, gm from unnest(rows) as x;
  perform set_config('bramblewood.server_grant', 'on', true); -- this transaction only
  insert into public.player_currencies as c (profile_id, gold, gems) values (me, g, gm)
    on conflict (profile_id) do update set gold = c.gold + excluded.gold, gems = c.gems + excluded.gems, updated_at = now();
  perform set_config('bramblewood.server_grant', '', true);
  return query select * from unnest(rows);
end $$;

revoke all on function public.create_listing_v2(text, boolean, integer, text) from public, anon;
revoke all on function public.buy_listing_v2(uuid) from public, anon;
revoke all on function public.claim_market_proceeds() from public, anon;
grant execute on function public.create_listing_v2(text, boolean, integer, text) to authenticated;
grant execute on function public.buy_listing_v2(uuid) to authenticated;
grant execute on function public.claim_market_proceeds() to authenticated;

-- LATER, a separate step once no browser tab runs a build older than 2026-10-17 (a day after the client deploy is plenty):
-- revoke execute on function public.create_listing(text, boolean, integer, text) from authenticated;
-- revoke execute on function public.buy_listing(uuid) from authenticated;
