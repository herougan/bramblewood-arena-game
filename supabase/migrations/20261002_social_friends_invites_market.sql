-- ===== Profiles: shareable friend code + last seen =====
create or replace function public.gen_friend_code() returns text
language sql volatile set search_path = '' as $$
  select string_agg(substr('ABCDEFGHJKLMNPQRSTUVWXYZ23456789', 1 + floor(random()*32)::int, 1), '')
  from generate_series(1, 6);
$$;
alter table public.profiles add column if not exists friend_code text;
alter table public.profiles add column if not exists last_seen_at timestamptz;
update public.profiles set friend_code = public.gen_friend_code() where friend_code is null;
alter table public.profiles alter column friend_code set default public.gen_friend_code();
create unique index if not exists profiles_friend_code_key on public.profiles(friend_code);

create or replace function public.search_players(p_query text, p_code text)
returns table(id uuid, display_name text, rating numeric, friend_code text, last_seen_at timestamptz)
language sql stable set search_path = '' as $$
  select p.id, p.display_name, p.rating, p.friend_code, p.last_seen_at
  from public.profiles p
  where p.id <> (select auth.uid())
    and (p.friend_code = upper(p_code)
         or (char_length(trim(p_query)) >= 3 and p.display_name ilike '%' || replace(replace(trim(p_query), '%', ''), '_', '') || '%'))
  order by (p.friend_code = upper(p_code)) desc, p.display_name
  limit 20;
$$;
revoke execute on function public.search_players(text, text) from public, anon;
grant execute on function public.search_players(text, text) to authenticated;

-- ===== Friendships =====
create table if not exists public.friendships (
  id uuid primary key default gen_random_uuid(),
  requester_id uuid not null references public.profiles(id) on delete cascade,
  addressee_id uuid not null references public.profiles(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending','accepted','blocked')),
  created_at timestamptz not null default now(),
  responded_at timestamptz,
  check (requester_id <> addressee_id)
);
create unique index if not exists friendships_pair_key on public.friendships (least(requester_id, addressee_id), greatest(requester_id, addressee_id));
create index if not exists friendships_addressee_idx on public.friendships(addressee_id);
alter table public.friendships enable row level security;
create policy "friendships visible to participants" on public.friendships for select to authenticated
  using (requester_id = (select auth.uid()) or (addressee_id = (select auth.uid()) and status <> 'blocked'));
create policy "participants can remove" on public.friendships for delete to authenticated
  using (requester_id = (select auth.uid()) or (addressee_id = (select auth.uid()) and status <> 'blocked'));

create or replace function public.send_friend_request(p_target uuid) returns text
language plpgsql security definer set search_path = '' as $$
declare me uuid := auth.uid(); f public.friendships; pending_count int;
begin
  if me is null then raise exception 'not authenticated'; end if;
  if p_target is null or p_target = me then raise exception 'invalid player'; end if;
  if not exists (select 1 from public.profiles where id = p_target) then raise exception 'player not found'; end if;
  select * into f from public.friendships
    where least(requester_id, addressee_id) = least(me, p_target) and greatest(requester_id, addressee_id) = greatest(me, p_target) for update;
  if found then
    if f.status = 'blocked' then raise exception 'unavailable'; end if;
    if f.status = 'accepted' then return 'already_friends'; end if;
    if f.requester_id = p_target then
      update public.friendships set status = 'accepted', responded_at = now() where id = f.id;
      return 'accepted';
    end if;
    return 'pending';
  end if;
  select count(*) into pending_count from public.friendships where requester_id = me and status = 'pending';
  if pending_count >= 50 then raise exception 'too many pending requests'; end if;
  insert into public.friendships(requester_id, addressee_id) values (me, p_target);
  return 'sent';
end; $$;

create or replace function public.respond_friend_request(p_id uuid, p_accept boolean) returns void
language plpgsql security definer set search_path = '' as $$
declare me uuid := auth.uid(); f public.friendships;
begin
  select * into f from public.friendships where id = p_id for update;
  if not found or f.addressee_id <> me or f.status <> 'pending' then raise exception 'request not found'; end if;
  if p_accept then update public.friendships set status = 'accepted', responded_at = now() where id = p_id;
  else delete from public.friendships where id = p_id; end if;
end; $$;

create or replace function public.block_player(p_target uuid) returns void
language plpgsql security definer set search_path = '' as $$
declare me uuid := auth.uid();
begin
  if me is null or p_target is null or p_target = me then raise exception 'invalid player'; end if;
  delete from public.friendships
    where least(requester_id, addressee_id) = least(me, p_target) and greatest(requester_id, addressee_id) = greatest(me, p_target)
      and not (status = 'blocked' and requester_id = p_target);
  insert into public.friendships(requester_id, addressee_id, status, responded_at) values (me, p_target, 'blocked', now())
    on conflict do nothing;
end; $$;

-- ===== Live matches: friendly (unranked) games with settings =====
alter table public.live_matches add column if not exists ranked boolean not null default true;
alter table public.live_matches add column if not exists settings jsonb not null default '{}'::jsonb;

create or replace function public.report_live_match_result(p_match_id uuid, p_winner_id uuid, p_player1_new_rating numeric, p_player2_new_rating numeric)
returns void language plpgsql security definer set search_path to 'public' as $function$
declare
  m public.live_matches;
  r1 numeric; r2 numeric;
  n1 numeric; n2 numeric;
  k constant numeric := 24;
begin
  select * into m from public.live_matches where id = p_match_id for update;
  if not found then raise exception 'match not found'; end if;
  if m.host_id <> auth.uid() then raise exception 'only the match host can report its result'; end if;
  if m.status <> 'active' then return; end if;
  if p_winner_id is not null and p_winner_id <> m.player1_id and p_winner_id <> m.player2_id then
    raise exception 'winner must be one of the two match players';
  end if;
  if not m.ranked then
    update public.live_matches set status = 'done', winner_id = p_winner_id, ended_at = now() where id = p_match_id;
    return;
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
end;
$function$;

-- ===== Private match invites =====
create table if not exists public.match_invites (
  id uuid primary key default gen_random_uuid(),
  from_id uuid not null references public.profiles(id) on delete cascade,
  to_id uuid not null references public.profiles(id) on delete cascade,
  settings jsonb not null default '{}'::jsonb,
  from_deck jsonb not null default '{}'::jsonb,
  from_character text,
  from_leader text,
  status text not null default 'pending' check (status in ('pending','accepted','declined','cancelled','expired')),
  match_id uuid references public.live_matches(id) on delete set null,
  created_at timestamptz not null default now(),
  responded_at timestamptz
);
create index if not exists match_invites_to_idx on public.match_invites(to_id, status);
create index if not exists match_invites_from_idx on public.match_invites(from_id, status);
alter table public.match_invites enable row level security;
create policy "invite participants can read" on public.match_invites for select to authenticated
  using (from_id = (select auth.uid()) or to_id = (select auth.uid()));

create or replace function public.send_match_invite(p_to uuid, p_settings jsonb, p_deck jsonb, p_character text, p_leader text)
returns public.match_invites language plpgsql security definer set search_path = '' as $$
declare me uuid := auth.uid(); inv public.match_invites;
begin
  if me is null then raise exception 'not authenticated'; end if;
  if not exists (select 1 from public.friendships where status = 'accepted'
      and least(requester_id, addressee_id) = least(me, p_to) and greatest(requester_id, addressee_id) = greatest(me, p_to)) then
    raise exception 'you can only invite friends';
  end if;
  if octet_length(coalesce(p_settings, '{}'::jsonb)::text) > 2000 or octet_length(coalesce(p_deck, '{}'::jsonb)::text) > 8000 then
    raise exception 'invite too large';
  end if;
  update public.match_invites set status = 'cancelled', responded_at = now()
    where from_id = me and to_id = p_to and status = 'pending';
  insert into public.match_invites(from_id, to_id, settings, from_deck, from_character, from_leader)
    values (me, p_to, coalesce(p_settings, '{}'::jsonb), coalesce(p_deck, '{}'::jsonb), p_character, p_leader)
    returning * into inv;
  return inv;
end; $$;

create or replace function public.respond_match_invite(p_id uuid, p_accept boolean, p_deck jsonb, p_character text, p_leader text)
returns public.live_matches language plpgsql security definer set search_path = '' as $$
declare me uuid := auth.uid(); inv public.match_invites; m public.live_matches; r1 numeric; r2 numeric;
begin
  select * into inv from public.match_invites where id = p_id for update;
  if not found or inv.to_id <> me then raise exception 'invite not found'; end if;
  if inv.status <> 'pending' then raise exception 'this invite is no longer open'; end if;
  if inv.created_at < now() - interval '15 minutes' then
    update public.match_invites set status = 'expired', responded_at = now() where id = p_id;
    raise exception 'this invite has expired';
  end if;
  if not p_accept then
    update public.match_invites set status = 'declined', responded_at = now() where id = p_id;
    return null;
  end if;
  if octet_length(coalesce(p_deck, '{}'::jsonb)::text) > 8000 then raise exception 'deck too large'; end if;
  select coalesce(rating, 1500) into r1 from public.profiles where id = inv.from_id;
  select coalesce(rating, 1500) into r2 from public.profiles where id = me;
  insert into public.live_matches(player1_id, player2_id, player1_rating, player2_rating, player1_deck, player2_deck,
      player1_character, player2_character, player1_leader, player2_leader, host_id, ranked, settings)
    values (inv.from_id, me, coalesce(r1,1500), coalesce(r2,1500), inv.from_deck, coalesce(p_deck, '{}'::jsonb),
      inv.from_character, p_character, inv.from_leader, p_leader, inv.from_id, false, inv.settings)
    returning * into m;
  update public.match_invites set status = 'accepted', responded_at = now(), match_id = m.id where id = p_id;
  return m;
end; $$;

create or replace function public.cancel_match_invite(p_id uuid) returns void
language plpgsql security definer set search_path = '' as $$
begin
  update public.match_invites set status = 'cancelled', responded_at = now()
    where id = p_id and from_id = auth.uid() and status = 'pending';
end; $$;

-- ===== Public market =====
create table if not exists public.market_listings (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid not null references public.profiles(id) on delete cascade,
  card_id text not null check (char_length(card_id) between 1 and 80),
  foil boolean not null default false,
  price integer not null check (price between 1 and 100000),
  currency text not null default 'gold' check (currency in ('gold','gems')),
  status text not null default 'active' check (status in ('active','sold','cancelled')),
  buyer_id uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  sold_at timestamptz,
  buyer_claimed boolean not null default false,
  seller_paid boolean not null default false
);
create index if not exists market_active_idx on public.market_listings(status, card_id, price);
create index if not exists market_seller_idx on public.market_listings(seller_id, status);
create index if not exists market_buyer_idx on public.market_listings(buyer_id) where buyer_id is not null;
alter table public.market_listings enable row level security;
create policy "active listings are public; own listings visible" on public.market_listings for select to anon, authenticated
  using (status = 'active' or seller_id = (select auth.uid()) or buyer_id = (select auth.uid()));

create or replace function public.create_listing(p_card text, p_foil boolean, p_price integer, p_currency text)
returns public.market_listings language plpgsql security definer set search_path = '' as $$
declare me uuid := auth.uid(); l public.market_listings; n int;
begin
  if me is null then raise exception 'not authenticated'; end if;
  select count(*) into n from public.market_listings where seller_id = me and status = 'active';
  if n >= 20 then raise exception 'you can have at most 20 active listings'; end if;
  insert into public.market_listings(seller_id, card_id, foil, price, currency)
    values (me, p_card, coalesce(p_foil, false), p_price, coalesce(p_currency, 'gold'))
    returning * into l;
  return l;
end; $$;

create or replace function public.cancel_listing(p_id uuid) returns public.market_listings
language plpgsql security definer set search_path = '' as $$
declare l public.market_listings;
begin
  update public.market_listings set status = 'cancelled'
    where id = p_id and seller_id = auth.uid() and status = 'active'
    returning * into l;
  if not found then raise exception 'listing not found or already sold'; end if;
  return l;
end; $$;

create or replace function public.buy_listing(p_id uuid) returns public.market_listings
language plpgsql security definer set search_path = '' as $$
declare me uuid := auth.uid(); l public.market_listings;
begin
  if me is null then raise exception 'not authenticated'; end if;
  select * into l from public.market_listings where id = p_id for update;
  if not found or l.status <> 'active' then raise exception 'this listing is no longer available'; end if;
  if l.seller_id = me then raise exception 'you cannot buy your own listing'; end if;
  update public.market_listings set status = 'sold', buyer_id = me, sold_at = now(), buyer_claimed = true
    where id = p_id returning * into l;
  return l;
end; $$;

create or replace function public.claim_market_proceeds() returns setof public.market_listings
language sql security definer set search_path = '' as $$
  update public.market_listings set seller_paid = true
    where seller_id = auth.uid() and status = 'sold' and not seller_paid
  returning *;
$$;

do $$ declare f text; begin
  foreach f in array array['send_friend_request(uuid)','respond_friend_request(uuid,boolean)','block_player(uuid)',
    'send_match_invite(uuid,jsonb,jsonb,text,text)','respond_match_invite(uuid,boolean,jsonb,text,text)','cancel_match_invite(uuid)',
    'create_listing(text,boolean,integer,text)','cancel_listing(uuid)','buy_listing(uuid)','claim_market_proceeds()'] loop
    execute format('revoke execute on function public.%s from public, anon', f);
    execute format('grant execute on function public.%s to authenticated', f);
  end loop;
end $$;
revoke execute on function public.gen_friend_code() from anon;

alter publication supabase_realtime add table public.friendships;
alter publication supabase_realtime add table public.match_invites;