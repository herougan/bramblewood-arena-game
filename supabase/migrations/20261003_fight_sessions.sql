-- T3 step 1 (2026-10-03): server-issued, single-use fight seeds.
-- "Start fight" asks the server for a seed; the server remembers it (with the deck and the card-data
-- fingerprint). "Hand in" sends the transcript of the player's moves and the result, once. A second
-- hand-in for the same seed is refused, so a winning fight can't be paid out twice. Step 2 adds an
-- Edge Function that replays the transcript with the same engine before marking it verified.
create table if not exists public.fight_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  mode text not null check (char_length(mode) <= 32),
  node_key text check (char_length(node_key) <= 80),
  seed bigint not null,
  deck jsonb not null check (pg_column_size(deck) < 8000),
  cards_hash text check (char_length(cards_hash) <= 64),
  status text not null default 'open' check (status in ('open','submitted','verified','rejected','expired')),
  transcript jsonb check (transcript is null or pg_column_size(transcript) < 200000),
  result jsonb check (result is null or pg_column_size(result) < 8000),
  reason text,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default now() + interval '3 hours',
  submitted_at timestamptz
);
create index if not exists fight_sessions_user_created on public.fight_sessions (user_id, created_at desc);
alter table public.fight_sessions enable row level security;
drop policy if exists "read own fight sessions" on public.fight_sessions;
create policy "read own fight sessions" on public.fight_sessions for select to authenticated using (user_id = (select auth.uid()));
-- No insert/update/delete policies: rows are only written through the two functions below.

create or replace function public.start_fight(p_mode text, p_node text, p_deck jsonb, p_cards_hash text)
returns table(session_id uuid, seed bigint)
language plpgsql security definer set search_path = ''
as $$
declare
  uid uuid := auth.uid();
  recent int;
  s bigint;
  sid uuid;
begin
  if uid is null then raise exception 'sign in required'; end if;
  if p_mode is null or p_mode not in ('conquest','ai','gauntlet','dungeon','pvp','raidOffline','raidOnline','trench','autobattle') then
    raise exception 'unknown mode';
  end if;
  select count(*) into recent from public.fight_sessions f
    where f.user_id = uid and f.created_at > now() - interval '10 minutes';
  if recent >= 40 then raise exception 'too many fights started; wait a moment'; end if;
  -- Close anything this player left open (a refresh mid-fight): it can no longer be handed in.
  update public.fight_sessions set status = 'expired', reason = 'superseded'
    where user_id = uid and status = 'open' and mode = p_mode and created_at < now() - interval '2 seconds';
  s := ('x' || encode(extensions.gen_random_bytes(4), 'hex'))::bit(32)::bigint;
  insert into public.fight_sessions (user_id, mode, node_key, seed, deck, cards_hash)
    values (uid, p_mode, p_node, s, coalesce(p_deck, '{}'::jsonb), p_cards_hash)
    returning id into sid;
  return query select sid, s;
end $$;

create or replace function public.submit_fight(p_session uuid, p_transcript jsonb, p_result jsonb)
returns text
language plpgsql security definer set search_path = ''
as $$
declare
  uid uuid := auth.uid();
  f public.fight_sessions%rowtype;
begin
  if uid is null then raise exception 'sign in required'; end if;
  select * into f from public.fight_sessions where id = p_session for update;
  if not found or f.user_id <> uid then return 'rejected: unknown fight'; end if;
  if f.status <> 'open' then return 'rejected: already handed in'; end if;
  if f.expires_at < now() then
    update public.fight_sessions set status = 'expired', reason = 'too late' where id = p_session;
    return 'rejected: expired';
  end if;
  update public.fight_sessions
    set status = 'submitted', transcript = p_transcript, result = p_result, submitted_at = now()
    where id = p_session;
  return 'accepted';
end $$;

revoke all on function public.start_fight(text, text, jsonb, text) from public, anon;
revoke all on function public.submit_fight(uuid, jsonb, jsonb) from public, anon;
grant execute on function public.start_fight(text, text, jsonb, text) to authenticated;
grant execute on function public.submit_fight(uuid, jsonb, jsonb) to authenticated;
