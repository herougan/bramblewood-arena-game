-- PROPOSED, NOT APPLIED (2026-10-18, package X4: guild rename). Apply only on the owner's "apply it".
-- Owner (2026-10-18 15:05): "okay. + rename feature (but takes a rename ticket)."
--
-- Why: the guild panel (arena_app.js, renameGuild) lets a guild's owner rename it for one Rename Ticket. The live policies
-- (read 2026-10-18) allow SELECT, INSERT and (creator, empty guild) DELETE on public.guilds, but no UPDATE, so the client can't
-- change a name itself. This adds one SECURITY DEFINER function that does only that, after checking who is asking.
-- Until it exists the client's rpc('rename_guild') gets "function does not exist" (PGRST202 / 42883) and tells the player
-- "Guild renaming isn't switched on yet"; no ticket is spent.
--
-- Live schema this matches (read 2026-10-18):
--   guilds(id uuid pk, name text, tag text, icon text, created_by uuid -> profiles, created_at)
--     check guilds_name_len: char_length(name) between 3 and 24;  unique index guilds_name_unique on lower(name)
--   guild_members(profile_id uuid pk, guild_id uuid -> guilds on delete cascade, role text check in ('owner','member'), joined_at)
--
-- Who counts as the owner: the caller's guild_members row says role 'owner' AND the caller is the guild's created_by.
-- The second half matters: the live insert policy "guild members join" only checks auth.uid() = profile_id, so ANY signed-in
-- player can join ANY guild with role 'owner' today (see block B). created_by can't be forged (insert-only, checked against
-- auth.uid()), so requiring both keeps a self-made "owner" from renaming someone else's guild. If ownership can ever be handed
-- on, drop the created_by test once block B (or a proper transfer function) is in.
--
-- The trust trade-off (the ticket): the Rename Ticket count lives in the player's save (localStorage, synced in the
-- player_progress blob), which the player can edit. This function can't see it, so a player who edits their save can rename
-- as often as they like. The damage is small (a name change, still owner-only, still 3-24 characters and unique), so block A
-- alone is a fair first step. Block C (optional) moves the ticket count to the server; the client would then call
-- rename_guild_with_ticket and buy_rename_ticket instead (a small client change, not made yet).

-- ============================================================
-- A. rename_guild (the one the client calls today)
-- ============================================================
create or replace function public.rename_guild(p_guild uuid, p_name text)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid  uuid := auth.uid();
  -- the same rules as creating a guild: trimmed; inner runs of spaces fold to one (the client does the same)
  v_name text := btrim(regexp_replace(coalesce(p_name, ''), '\s+', ' ', 'g'));
begin
  if v_uid is null then
    raise exception 'not_signed_in' using errcode = '28000';
  end if;
  if not exists (
    select 1
      from public.guild_members m
      join public.guilds g on g.id = m.guild_id
     where m.guild_id = p_guild
       and m.profile_id = v_uid
       and m.role = 'owner'
       and g.created_by = v_uid
  ) then
    raise exception 'not_owner' using errcode = '42501';
  end if;
  if char_length(v_name) < 3 or char_length(v_name) > 24 then
    raise exception 'bad_length' using errcode = '22023';
  end if;
  if exists (select 1 from public.guilds where lower(name) = lower(v_name) and id <> p_guild) then
    raise exception 'name_taken' using errcode = '23505';
  end if;
  begin
    update public.guilds set name = v_name where id = p_guild;
  exception when unique_violation then
    -- two renames racing for the same name: guilds_name_unique catches the second
    raise exception 'name_taken' using errcode = '23505';
  end;
  return v_name;
end;
$$;

revoke all on function public.rename_guild(uuid, text) from public, anon;
grant execute on function public.rename_guild(uuid, text) to authenticated;

-- ============================================================
-- B. (recommended, optional) close the "join as owner" hole
-- ============================================================
-- Today any signed-in player can insert their own guild_members row with role 'owner' in any guild. The client only ever asks
-- for 'owner' when the player is the guild's created_by (createGuild, and joinGuild for a founder whose owner row failed), so
-- this policy allows exactly that and nothing more.
--
-- drop policy "guild members join" on public.guild_members;
-- create policy "guild members join" on public.guild_members
--   for insert to authenticated
--   with check (
--     auth.uid() = profile_id
--     and (role = 'member'
--          or (role = 'owner' and exists (select 1 from public.guilds g where g.id = guild_id and g.created_by = auth.uid())))
--   );

-- ============================================================
-- C. (optional) server-side Rename Tickets
-- ============================================================
-- Not a column on profiles: "own profile write" lets a player UPDATE their own profiles row, so they could set the count
-- themselves. A table with no insert/update/delete policies is changed only by the functions below.
--
-- create table if not exists public.player_rename_tickets (
--   profile_id uuid primary key references public.profiles(id) on delete cascade,
--   tickets    integer not null default 0 check (tickets between 0 and 9),
--   updated_at timestamptz not null default now()
-- );
-- alter table public.player_rename_tickets enable row level security;
-- create policy "own rename tickets read" on public.player_rename_tickets for select to authenticated using (auth.uid() = profile_id);
--
-- -- the founders' gift: one ticket for the owner of every guild that exists when this runs
-- insert into public.player_rename_tickets (profile_id, tickets)
--   select m.profile_id, 1 from public.guild_members m join public.guilds g on g.id = m.guild_id
--    where m.role = 'owner' and g.created_by = m.profile_id
--   on conflict (profile_id) do update set tickets = least(9, public.player_rename_tickets.tickets + 1), updated_at = now();
--
-- -- buy one for 250 Maple Leaves (player_currencies.gold), in one statement so it can't be double-spent
-- create or replace function public.buy_rename_ticket()
-- returns integer language plpgsql security definer set search_path = '' as $$
-- declare v_uid uuid := auth.uid(); v_n integer;
-- begin
--   if v_uid is null then raise exception 'not_signed_in' using errcode = '28000'; end if;
--   update public.player_currencies set gold = gold - 250, updated_at = now() where profile_id = v_uid and gold >= 250;
--   if not found then raise exception 'not_enough_gold' using errcode = '22023'; end if;
--   insert into public.player_rename_tickets (profile_id, tickets) values (v_uid, 1)
--     on conflict (profile_id) do update set tickets = public.player_rename_tickets.tickets + 1, updated_at = now()
--     returning tickets into v_n;   -- the check (<= 9) refuses a 10th, which rolls the gold back too
--   return v_n;
-- end; $$;
-- (check public.guard_currency_write() first: if it refuses decreases made outside the client's own path, buy_rename_ticket
--  needs to be allowed through it.)
--
-- -- rename and spend a ticket in one transaction
-- create or replace function public.rename_guild_with_ticket(p_guild uuid, p_name text)
-- returns text language plpgsql security definer set search_path = '' as $$
-- declare v_uid uuid := auth.uid(); v_name text;
-- begin
--   update public.player_rename_tickets set tickets = tickets - 1, updated_at = now() where profile_id = v_uid and tickets > 0;
--   if not found then raise exception 'no_ticket' using errcode = '22023'; end if;
--   v_name := public.rename_guild(p_guild, p_name);   -- any failure there rolls the ticket back
--   return v_name;
-- end; $$;
--
-- revoke all on function public.buy_rename_ticket() from public, anon;
-- revoke all on function public.rename_guild_with_ticket(uuid, text) from public, anon;
-- grant execute on function public.buy_rename_ticket() to authenticated;
-- grant execute on function public.rename_guild_with_ticket(uuid, text) to authenticated;
-- -- and then, so the ticket can't be skipped: revoke execute on function public.rename_guild(uuid, text) from authenticated;
