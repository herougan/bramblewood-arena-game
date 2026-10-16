-- APPLIED to the live project 2026-10-16 (user: "Still open -> Apply it").
-- D55 world call-outs (2026-10-13). NOT APPLIED: waits for the user's "apply it".
-- Admins write events and GM messages; everyone reads. The client polls every 3 minutes.
create table if not exists public.world_events (
  id bigint generated always as identity primary key,
  kind text not null check (kind in ('event', 'gm', 'raid_fall')),
  title text not null check (char_length(title) between 1 and 140),
  body text check (body is null or char_length(body) <= 600),
  payload jsonb not null default '{}'::jsonb,
  created_by uuid default auth.uid() references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  expires_at timestamptz
);
create index if not exists world_events_created_idx on public.world_events (created_at desc);
alter table public.world_events enable row level security;
create policy world_events_read on public.world_events for select using (true);
create policy world_events_admin_insert on public.world_events for insert with check (public.is_app_admin());
create policy world_events_admin_delete on public.world_events for delete using (public.is_app_admin());
