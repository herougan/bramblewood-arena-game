-- PROPOSED 2026-10-23 (package AR3, the Group Dungeon). NOT APPLIED. Apply only on the owner's "apply it". Idempotent: safe to run twice.
-- Owner (AR-3, 10-23): "This is a big pass. I like this. Can you launch a big pass for this." D49 / D76: 2-4 players, friends-only rooms.
--
-- What is live today (supabase/migrations/20261016_coop_rooms.sql, applied 10-16): coop_rooms seats a host and ONE guest (guest_id), and
-- join_coop_room(code) lets an accepted friend of the host take that seat. The game uses exactly that for 2-player online rooms.
-- The fight itself needs no table: the host runs the engine and the players talk over a Supabase Realtime broadcast channel
-- (topic coop-room-<code>), the Ranked Live host's own transport.
--
-- What this file adds, and what each part unlocks in the game:
--   1. coop_room_members (one row per seat A / B / C / D, the host's included), RLS on, members read their own room's rows; rows are
--      written only by the definer functions below. -> rooms of 3 and 4 players online.
--   2. join_coop_room_v2(code): an accepted friend of the host takes the next free seat (C, then D, then B), at most 4 players; a member
--      who rejoins (a reload, a dropped connection) gets the same seat back. Keeps guest_id filled for seat C, so join_coop_room and
--      everything reading guest_id still work. -> the page calls v2 first (it falls back to join_coop_room while v2 is missing), and
--      it finds v2 by itself: no client change is needed when this is applied.
--   3. leave_coop_room(room): a member leaves (frees the seat while the room is open). promote_coop_host(room): a member makes themself
--      the host after the host dropped (the page's host migration: seat order A, C, D, B). -> the room row follows the live host.
--   4. coop_rooms read / update for every member, not only host and guest. -> players 3 and 4 can see the room's status.
--   5. Realtime authorization on realtime.messages: only a room's members may listen to or send on its topic coop-room-<code>, when the
--      channel is private. -> nobody else who learns a code can listen in or send plays. The page opens private channels once v2 is
--      found (supabaseTransport(..., {private: true})).
-- Not here (owner calls in docs/decisions.json, AR3-*): server-paid floor chests (they are paid by each player's game today, as every
-- daily dungeon floor is), a public matchmaking queue (D76: friends-only first).

create table if not exists public.coop_room_members (
  room_id uuid not null references public.coop_rooms(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  seat text not null check (seat in ('A', 'B', 'C', 'D')),
  joined_at timestamptz not null default now(),
  left_at timestamptz,
  primary key (room_id, user_id),
  unique (room_id, seat)
);
create index if not exists coop_room_members_user_idx on public.coop_room_members (user_id, joined_at desc);
alter table public.coop_room_members enable row level security;
revoke all on public.coop_room_members from anon, authenticated;
grant select on public.coop_room_members to authenticated;
-- Am I (still) in this room? A definer helper, so the policies below never read coop_room_members through its own policy (no recursion).
create or replace function public.is_coop_member(p_room uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.coop_room_members m where m.room_id = p_room and m.user_id = auth.uid() and m.left_at is null)
$$;
revoke all on function public.is_coop_member(uuid) from public, anon;
grant execute on function public.is_coop_member(uuid) to authenticated;
drop policy if exists coop_room_members_read on public.coop_room_members;
create policy coop_room_members_read on public.coop_room_members for select to authenticated
  using (user_id = (select auth.uid()) or public.is_coop_member(room_id));

-- The host's own seat (A), as the room is opened.
create or replace function public.coop_rooms_add_host()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.coop_room_members (room_id, user_id, seat) values (new.id, new.host_id, 'A') on conflict do nothing;
  return new;
end $$;
revoke all on function public.coop_rooms_add_host() from public, anon, authenticated;
drop trigger if exists coop_rooms_add_host on public.coop_rooms;
create trigger coop_rooms_add_host after insert on public.coop_rooms for each row execute function public.coop_rooms_add_host();
-- Rooms opened before this file: their host and guest get their seats.
insert into public.coop_room_members (room_id, user_id, seat) select id, host_id, 'A' from public.coop_rooms on conflict do nothing;
insert into public.coop_room_members (room_id, user_id, seat) select id, guest_id, 'C' from public.coop_rooms where guest_id is not null on conflict do nothing;

-- Every member reads and updates the room's play state (who is in it changes only through the functions).
drop policy if exists coop_rooms_members_read on public.coop_rooms;
create policy coop_rooms_members_read on public.coop_rooms for select to authenticated
  using ((select auth.uid()) in (host_id, guest_id) or public.is_coop_member(coop_rooms.id));
drop policy if exists coop_rooms_members_update on public.coop_rooms;
create policy coop_rooms_members_update on public.coop_rooms for update to authenticated
  using ((select auth.uid()) in (host_id, guest_id) or public.is_coop_member(coop_rooms.id))
  with check ((select auth.uid()) in (host_id, guest_id) or public.is_coop_member(coop_rooms.id));

-- Joining: only an accepted friend of the host, only an open room, at most 4 players. Returns the room id (the seat is the page's).
create or replace function public.join_coop_room_v2(p_code text)
returns uuid
language plpgsql security definer set search_path = ''
as $$
declare
  uid uuid := auth.uid();
  r public.coop_rooms%rowtype;
  s text;
begin
  if uid is null then raise exception 'sign in required'; end if;
  select * into r from public.coop_rooms where code = upper(p_code) for update;
  if not found or r.status not in ('open', 'playing') then raise exception 'room not found'; end if;
  if exists (select 1 from public.coop_room_members m where m.room_id = r.id and m.user_id = uid) then
    update public.coop_room_members set left_at = null where room_id = r.id and user_id = uid; -- back in the same seat
    return r.id;
  end if;
  if r.status <> 'open' then raise exception 'room not found'; end if; -- a run in progress takes back only its own players
  if not exists (select 1 from public.friendships f where f.status = 'accepted'
      and ((f.requester_id = uid and f.addressee_id = r.host_id) or (f.addressee_id = uid and f.requester_id = r.host_id))) then
    raise exception 'friends only';
  end if;
  select x.seat into s from (values ('C', 1), ('D', 2), ('B', 3)) as x(seat, o)
    where not exists (select 1 from public.coop_room_members m where m.room_id = r.id and m.seat = x.seat and m.left_at is null)
    order by x.o limit 1;
  if s is null then raise exception 'room is full'; end if;
  delete from public.coop_room_members where room_id = r.id and seat = s; -- a seat someone left in the lobby
  insert into public.coop_room_members (room_id, user_id, seat) values (r.id, uid, s);
  if s = 'C' then update public.coop_rooms set guest_id = uid, updated_at = now() where id = r.id; end if;
  return r.id;
end $$;
revoke all on function public.join_coop_room_v2(text) from public, anon;
grant execute on function public.join_coop_room_v2(text) to authenticated;

create or replace function public.leave_coop_room(p_room uuid)
returns void
language plpgsql security definer set search_path = ''
as $$
declare uid uuid := auth.uid(); st text;
begin
  if uid is null then raise exception 'sign in required'; end if;
  select status into st from public.coop_rooms where id = p_room;
  if st = 'open' then
    delete from public.coop_room_members where room_id = p_room and user_id = uid and seat <> 'A';
    update public.coop_rooms set guest_id = null, updated_at = now() where id = p_room and guest_id = uid;
  else
    update public.coop_room_members set left_at = now() where room_id = p_room and user_id = uid;
  end if;
end $$;
revoke all on function public.leave_coop_room(uuid) from public, anon;
grant execute on function public.leave_coop_room(uuid) to authenticated;

-- Host migration: a member still in the room becomes the host (the old host keeps their seat, marked away by the page).
create or replace function public.promote_coop_host(p_room uuid)
returns void
language plpgsql security definer set search_path = ''
as $$
declare uid uuid := auth.uid();
begin
  if uid is null then raise exception 'sign in required'; end if;
  if not exists (select 1 from public.coop_room_members m where m.room_id = p_room and m.user_id = uid and m.left_at is null) then raise exception 'not a member'; end if;
  update public.coop_rooms set host_id = uid, guest_id = case when guest_id = uid then null else guest_id end, updated_at = now() where id = p_room and status in ('open', 'playing');
end $$;
revoke all on function public.promote_coop_host(uuid) from public, anon;
grant execute on function public.promote_coop_host(uuid) to authenticated;

-- Realtime authorization: a private channel on topic coop-room-<code> is open to that room's members only ('coop-room-' is 10 letters).
drop policy if exists coop_room_topic_read on realtime.messages;
create policy coop_room_topic_read on realtime.messages for select to authenticated
  using (realtime.topic() like 'coop-room-%' and exists (select 1 from public.coop_room_members m join public.coop_rooms r on r.id = m.room_id
    where r.code = substring(realtime.topic() from 11) and m.user_id = (select auth.uid()) and m.left_at is null));
drop policy if exists coop_room_topic_write on realtime.messages;
create policy coop_room_topic_write on realtime.messages for insert to authenticated
  with check (realtime.topic() like 'coop-room-%' and exists (select 1 from public.coop_room_members m join public.coop_rooms r on r.id = m.room_id
    where r.code = substring(realtime.topic() from 11) and m.user_id = (select auth.uid()) and m.left_at is null));
