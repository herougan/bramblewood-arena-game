-- D76 co-op rooms (2026-10-16, user: "Still open -> Apply it"). Written and applied the same day.
-- Agreed design (D76): a 30-second plan timer (60 in casual rooms), one shared castle, friends-only rooms first.
-- A host opens a room (a short code); an accepted friend joins it through join_coop_room(); the two players then share
-- the room's `state` (the plan, the shared castle, the round). Only the two members can read or change a room.
create table if not exists public.coop_rooms (
  id uuid primary key default gen_random_uuid(),
  code text not null unique check (code ~ '^[A-Z0-9]{6}$'),
  host_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  guest_id uuid references auth.users(id) on delete set null,
  casual boolean not null default false,
  plan_seconds int not null default 30 check (plan_seconds in (30, 60)),
  status text not null default 'open' check (status in ('open', 'playing', 'done', 'closed')),
  state jsonb not null default '{}'::jsonb check (pg_column_size(state) < 200000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (guest_id is null or guest_id <> host_id)
);
create index if not exists coop_rooms_host_idx on public.coop_rooms (host_id, created_at desc);
create index if not exists coop_rooms_guest_idx on public.coop_rooms (guest_id, created_at desc);
alter table public.coop_rooms enable row level security;

create policy coop_rooms_members_read on public.coop_rooms for select to authenticated
  using ((select auth.uid()) in (host_id, guest_id));
create policy coop_rooms_host_insert on public.coop_rooms for insert to authenticated
  with check (host_id = (select auth.uid()) and guest_id is null);
create policy coop_rooms_members_update on public.coop_rooms for update to authenticated
  using ((select auth.uid()) in (host_id, guest_id))
  with check ((select auth.uid()) in (host_id, guest_id));
create policy coop_rooms_host_delete on public.coop_rooms for delete to authenticated
  using (host_id = (select auth.uid()));

-- Joining: only an accepted friend of the host, only an open room with a free seat.
create or replace function public.join_coop_room(p_code text)
returns uuid
language plpgsql security definer set search_path = ''
as $$
declare
  uid uuid := auth.uid();
  r public.coop_rooms%rowtype;
begin
  if uid is null then raise exception 'sign in required'; end if;
  select * into r from public.coop_rooms where code = upper(p_code) for update;
  if not found or r.status <> 'open' then raise exception 'room not found'; end if;
  if r.host_id = uid then return r.id; end if;
  if r.guest_id is not null and r.guest_id <> uid then raise exception 'room is full'; end if;
  if not exists (select 1 from public.friendships f where f.status = 'accepted'
      and ((f.requester_id = uid and f.addressee_id = r.host_id) or (f.addressee_id = uid and f.requester_id = r.host_id))) then
    raise exception 'friends only';
  end if;
  update public.coop_rooms set guest_id = uid, updated_at = now() where id = r.id;
  return r.id;
end $$;
revoke all on function public.join_coop_room(text) from public, anon;
grant execute on function public.join_coop_room(text) to authenticated;
grant select, insert, delete on public.coop_rooms to authenticated;
-- Members change only the shared play state; who is in the room changes only through join_coop_room().
grant update (state, status, updated_at) on public.coop_rooms to authenticated;
