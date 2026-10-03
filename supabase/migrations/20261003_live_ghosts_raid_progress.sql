-- Live multiplayer data (2026-10-03, explicit: "Cloud tables: it should be live, not in local").
--
-- ghost_decks        decks other players meet: PvP strangers and Autobattler runs (one row per
--                    player per mode per stage, newest wins). Public read; you write only your own.
-- raid_week_attempts every attempt at the weekly raid, so loading the raid shows everyone's decks
--                    and the shared pool. Public read; insert only as yourself; damage is bounded.
-- player_progress    your own progress blob (Conquest, quests, stats, level, tickets, autobattler
--                    run) so it follows you across devices. Private to you.

create table if not exists public.ghost_decks (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  mode text not null check (mode in ('pvp','autobattle','async')),
  stage int not null check (stage between 0 and 200),
  display_name text check (char_length(display_name) <= 40),
  avatar jsonb,
  payload jsonb not null check (pg_column_size(payload) < 20000),
  recorded_at timestamptz not null default now(),
  unique (owner_id, mode, stage)
);
create index if not exists ghost_decks_mode_stage_time on public.ghost_decks (mode, stage, recorded_at desc);
alter table public.ghost_decks enable row level security;
drop policy if exists "ghosts readable by everyone" on public.ghost_decks;
create policy "ghosts readable by everyone" on public.ghost_decks for select to anon, authenticated using (true);
drop policy if exists "insert own ghost" on public.ghost_decks;
create policy "insert own ghost" on public.ghost_decks for insert to authenticated with check (owner_id = (select auth.uid()));
drop policy if exists "update own ghost" on public.ghost_decks;
create policy "update own ghost" on public.ghost_decks for update to authenticated using (owner_id = (select auth.uid())) with check (owner_id = (select auth.uid()));
drop policy if exists "delete own ghost" on public.ghost_decks;
create policy "delete own ghost" on public.ghost_decks for delete to authenticated using (owner_id = (select auth.uid()));

create table if not exists public.raid_week_attempts (
  id uuid primary key default gen_random_uuid(),
  boss_id text not null check (char_length(boss_id) <= 120),
  cycle int not null,
  owner_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  display_name text check (char_length(display_name) <= 40),
  avatar jsonb,
  deck jsonb not null check (pg_column_size(deck) < 8000),
  damage int not null check (damage between 0 and 10000),
  won boolean not null default false,
  fought_at timestamptz not null default now()
);
create index if not exists raid_week_attempts_boss_cycle on public.raid_week_attempts (boss_id, cycle, fought_at);
alter table public.raid_week_attempts enable row level security;
drop policy if exists "raid attempts readable by everyone" on public.raid_week_attempts;
create policy "raid attempts readable by everyone" on public.raid_week_attempts for select to anon, authenticated using (true);
drop policy if exists "insert own raid attempt" on public.raid_week_attempts;
create policy "insert own raid attempt" on public.raid_week_attempts for insert to authenticated
  with check (owner_id = (select auth.uid()) and cycle between floor(extract(epoch from now()) / 604800)::int - 1 and floor(extract(epoch from now()) / 604800)::int);

create table if not exists public.player_progress (
  profile_id uuid primary key default auth.uid() references auth.users(id) on delete cascade,
  data jsonb not null default '{}'::jsonb check (pg_column_size(data) < 200000),
  updated_at timestamptz not null default now()
);
alter table public.player_progress enable row level security;
drop policy if exists "read own progress" on public.player_progress;
create policy "read own progress" on public.player_progress for select to authenticated using (profile_id = (select auth.uid()));
drop policy if exists "insert own progress" on public.player_progress;
create policy "insert own progress" on public.player_progress for insert to authenticated with check (profile_id = (select auth.uid()));
drop policy if exists "update own progress" on public.player_progress;
create policy "update own progress" on public.player_progress for update to authenticated using (profile_id = (select auth.uid())) with check (profile_id = (select auth.uid()));
