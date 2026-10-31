-- 2026-10-31 (package UI12, GG2): server-side guard for player_progress. PROPOSED: apply only after the owner says "apply it".
--
-- Why: a fresh or emptier device save could replace a richer cloud save (the owner lost his progress after signing out and back in with
-- Google in an incognito tab). The client now waits for the cloud load and refuses to send a blob with less progress than the cloud's
-- (arena_app.js, SAVE_GUARD_UI12). This trigger is the second lock, for an older build still in a browser tab or any other client.
--
-- What it does, on every UPDATE of player_progress:
--   1. scores OLD and NEW the same way the client does (progressScore): 10 per distinct cleared fight, 5 per tutorial flag, tutorial
--      stage - 1, player XP / 50;
--   2. if NEW scores lower than OLD and NEW does not carry the admin-reset marker ("bw_progress_shrink_ok": "1" at the top level of
--      data), it keeps OLD (the write is turned into a no-op) and copies the refused NEW into player_progress_refused, so nothing is lost
--      either way and a mistaken refusal can be undone by hand;
--   3. every allowed write that lowers the score (an admin reset) first copies OLD into player_progress_backup.
-- Both side tables have RLS on with no policies (anon / authenticated cannot read or write them).
--
-- Note: the client's admin resets do not yet put the marker into the blob (the client keeps it in localStorage, bw_progress_shrink_ok).
-- If this is applied, add 'bw_progress_shrink_ok' to PROGRESS_KEYS in arena_app.js in the same release, so an admin reset still goes up.

create table if not exists public.player_progress_backup (
  id bigserial primary key,
  profile_id uuid not null,
  data jsonb,
  updated_at timestamptz,
  backed_up_at timestamptz not null default now(),
  reason text
);
alter table public.player_progress_backup enable row level security;
revoke all on public.player_progress_backup from anon, authenticated;

create table if not exists public.player_progress_refused (
  id bigserial primary key,
  profile_id uuid not null,
  data jsonb,
  updated_at timestamptz,
  refused_at timestamptz not null default now(),
  old_score integer,
  new_score integer
);
alter table public.player_progress_refused enable row level security;
revoke all on public.player_progress_refused from anon, authenticated;

create or replace function public.progress_score(d jsonb) returns integer
language plpgsql immutable as $$
declare s integer := 0; cq jsonb; xp jsonb; st integer;
begin
  if d is null then return 0; end if;
  begin
    cq := (d->>'bramblewood_conquest_progress_v1')::jsonb;
    if jsonb_typeof(cq->'completed') = 'array' then
      s := s + 10 * (select count(distinct v) from jsonb_array_elements_text(cq->'completed') v);
    end if;
  exception when others then null; end;
  if d->>'bramblewood_arena_tutorial_done' = '1' then s := s + 5; end if;
  if d->>'bramblewood_tutorial2_done_v1' = '1' then s := s + 5; end if;
  begin
    st := coalesce((d->>'bramblewood_arena_tutorial_stage')::integer, 1);
    if st > 1 and st < 100 then s := s + st - 1; end if;
  exception when others then null; end;
  begin
    xp := (d->>'bramblewood_player_xp_v1')::jsonb;
    if jsonb_typeof(xp->'xp') = 'number' and (xp->>'xp')::numeric > 0 then s := s + floor((xp->>'xp')::numeric / 50)::integer; end if;
  exception when others then null; end;
  return s;
end $$;

create or replace function public.guard_progress_shrink() returns trigger
language plpgsql security definer set search_path = public as $$
declare o integer; n integer;
begin
  o := public.progress_score(old.data);
  n := public.progress_score(new.data);
  if n < o then
    if coalesce(new.data->>'bw_progress_shrink_ok', '') = '1' then
      insert into public.player_progress_backup(profile_id, data, updated_at, reason) values (old.profile_id, old.data, old.updated_at, 'admin reset');
      return new;
    end if;
    insert into public.player_progress_refused(profile_id, data, updated_at, old_score, new_score) values (new.profile_id, new.data, new.updated_at, o, n);
    return old; -- keep the richer save
  end if;
  return new;
end $$;

drop trigger if exists guard_progress_shrink on public.player_progress;
create trigger guard_progress_shrink before update on public.player_progress
  for each row execute function public.guard_progress_shrink();
