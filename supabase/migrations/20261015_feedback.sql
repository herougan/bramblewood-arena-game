-- APPLIED to the live project 2026-10-16 (user: "Still open -> Apply it").
-- Player feedback (2026-10-15, user: "Hanging in the corner, on the right of your profile name, there is an opinion icon. Clicking
-- it lets them write a comment to us. (ease for play testers and general players)").
-- NOT APPLIED YET: the game queues feedback in the browser until this table exists. Say "apply it" to create it.
--
-- Anyone (guest or signed in) may add a row; a signed-in player's row carries their own id (it can't claim someone else's).
-- Only app admins (public.is_app_admin(), see 20261002_card_overrides.sql) can read or delete rows.

create table if not exists public.feedback (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  user_id uuid references auth.users(id) on delete set null default auth.uid(),
  name text check (name is null or char_length(name) <= 80),
  category text check (category is null or category in ('bug', 'idea', 'balance', 'art', 'other')),
  text text not null check (char_length(text) between 1 and 4000),
  context jsonb not null default '{}'::jsonb check (pg_column_size(context) <= 8192)
);

create index if not exists feedback_created_at_idx on public.feedback (created_at desc);

alter table public.feedback enable row level security;

drop policy if exists "anyone can send feedback" on public.feedback;
create policy "anyone can send feedback" on public.feedback
  for insert to anon, authenticated
  with check (user_id is null or user_id = (select auth.uid()));

drop policy if exists "admins read feedback" on public.feedback;
create policy "admins read feedback" on public.feedback
  for select to authenticated
  using ((select public.is_app_admin()));

drop policy if exists "admins delete feedback" on public.feedback;
create policy "admins delete feedback" on public.feedback
  for delete to authenticated
  using ((select public.is_app_admin()));

grant insert on public.feedback to anon, authenticated;
grant select, delete on public.feedback to authenticated;
