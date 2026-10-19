-- PROPOSED, NOT APPLIED (2026-10-19, package SY, owner 10:55: "im using the same account in mobile AND web. They don't see each
-- other's decks!").
--
-- NOT NEEDED FOR THE FIX. The decks failed to sync because the game's deck ids ('deck-xxxxxxx') aren't uuids and player_decks.id is
-- one: every upsert was refused (22P02) and the client ignored the error. The client now uses uuid ids (and moves the old ones once),
-- so decks sync with the table exactly as it is today. This file only adds optional improvements to that sync:
--
-- 1. Two columns:
--   looks       jsonb, null    which copies in the deck are Shiny or wear an alternate-art skin ({cardId: {"shiny": 1, "skin:x": 1}}).
--                              Without it, each device keeps its own looks for a deck (the cards and counts still sync).
--   deleted_at  timestamptz    a delete mark. With it, deleting a deck marks the row instead of removing it, so a device that was
--                              offline (or edited the deck before it heard) can tell "deleted elsewhere" from "never sent". Without
--                              it the client deletes the row and uses its own per-account "seen in the cloud" list to tell the two
--                              apart, which works for the normal case.
--
-- Nothing else changes: same RLS ("own decks read" / "own decks write", auth.uid() = profile_id), updated_at stays the client's
-- (the deck's last-edit time, which is what the merge compares; no trigger sets it to now()), no data rewritten. The client detects the
-- columns on its own (a select('*') row has them; an upsert naming a missing column gets PGRST204 once and is resent without it).
-- Older builds still in someone's browser read select('*') and would show a delete-marked deck again until they reload into this
-- build; harmless (no data is lost) and it stops once they update.
--
-- Also: 2. sanity checks on what a client may write (counts and looks must be JSON objects; a name of at most 60 characters);
-- player_decks holds no rows today (checked 2026-10-19), so they can't fail on existing data. 3. a stale-write guard (below).

alter table public.player_decks
  add column if not exists looks jsonb,
  add column if not exists deleted_at timestamptz;

alter table public.player_decks drop constraint if exists player_decks_counts_object;
alter table public.player_decks
  add constraint player_decks_counts_object check (jsonb_typeof(counts) = 'object');

alter table public.player_decks drop constraint if exists player_decks_looks_object;
alter table public.player_decks
  add constraint player_decks_looks_object check (looks is null or jsonb_typeof(looks) = 'object');

alter table public.player_decks drop constraint if exists player_decks_name_len;
alter table public.player_decks
  add constraint player_decks_name_len check (char_length(name) <= 60);

-- 3. A stale write keeps the newer row. The client already checks before it sends (it reads the cloud's updated_at first and holds
--    back a deck the cloud has a newer edit of), but two devices can still cross in that gap. With this trigger an update that would
--    put an OLDER updated_at over a newer one leaves the row as it is (returns OLD: no error, the client's next pull merges it). It
--    never blocks a newer write, an insert, or a delete.
create or replace function public.guard_deck_stale_write() returns trigger
language plpgsql as $$
begin
  if new.updated_at < old.updated_at then return old; end if;
  return new;
end $$;

drop trigger if exists guard_deck_stale_write on public.player_decks;
create trigger guard_deck_stale_write before update on public.player_decks
  for each row execute function public.guard_deck_stale_write();

-- To undo:
--   drop trigger if exists guard_deck_stale_write on public.player_decks; drop function if exists public.guard_deck_stale_write();
--   alter table public.player_decks drop constraint if exists player_decks_counts_object,
--     drop constraint if exists player_decks_looks_object, drop constraint if exists player_decks_name_len,
--     drop column if exists looks, drop column if exists deleted_at;
