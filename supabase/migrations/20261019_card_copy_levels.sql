-- APPLIED 2026-10-19 08:12 (owner "apply it"), via the Supabase SQL editor.
-- PROPOSED, NOT APPLIED (2026-10-19, package NF: every card copy has its own level). Apply only on the owner's "apply it".
-- Owner (2026-10-18 23:37): "Each card is unique. Forging one card doesn't mean all copies become stronger!"
--
-- How saves are stored today (supabase/migrations, 20261003_live_ghosts_raid_progress.sql and the older player tables):
--   player_card_unlocks(profile_id, card_id, level)   one row per card you own: `level` is ONE level for every copy of the card.
--                                                     Read and upserted by the client (cloudPullState / cloudPushCardLevels in
--                                                     arena_app.js), read by create_listing_v2 (the market) and admin_list_players.
--   The copies themselves (myCardCopies: foil, finish, Shiny, skin, and now uid / level / credit) live in this browser's
--   localStorage only; they were never synced, and this file doesn't change that.
--
-- What it adds (nothing existing is changed, dropped or loosened):
--   player_card_unlocks.copies jsonb   each copy's level, best first: [{"u": "<copy uid>", "l": <level 0..11>}, ...]; null for a card
--                                      the client has no copy of on record. `level` stays the BEST copy's level, so older builds, the
--                                      market and Admin read the same number as before.
--   card_copies_ok(jsonb)              the shape check the column's constraint uses (an array of at most 200 {u, l} objects, u at
--                                      most 40 characters, l a whole number 0..25).
--
-- The client is ready for it already: it sends `copies` on every push and reads it on every pull; while this column is missing the
-- server answers "column not found" (PGRST204 / 42703), the client stops sending it for the session and goes on exactly as before.
-- On a pull a copy is never lowered: the same copy (uid) takes the higher level; on another device (other uids) the levels go to that
-- device's copies in strength order, as many as it has (cloudApplyCopyLevels).
--
-- RLS: the table's own-row policies already cover the new column (it is just another column of the caller's own rows). Like `level`,
-- the client writes it, so it is as trustworthy as `level` is today (no server-side Forge yet).

alter table public.player_card_unlocks add column if not exists copies jsonb;

create or replace function public.card_copies_ok(c jsonb) returns boolean
language sql immutable as $$
  select c is null or (
    jsonb_typeof(c) = 'array' and jsonb_array_length(c) <= 200 and coalesce((
      select bool_and(jsonb_typeof(e) = 'object'
                      and length(coalesce(e->>'u', '')) <= 40
                      and case when coalesce(e->>'l', '') ~ '^[0-9]{1,2}$' then (e->>'l')::int <= 25 else false end)
      from jsonb_array_elements(c) e), true))
$$;

alter table public.player_card_unlocks drop constraint if exists player_card_unlocks_copies_ok;
alter table public.player_card_unlocks add constraint player_card_unlocks_copies_ok check (public.card_copies_ok(copies));

-- Roll back:
--   alter table public.player_card_unlocks drop constraint if exists player_card_unlocks_copies_ok;
--   drop function if exists public.card_copies_ok(jsonb);
--   alter table public.player_card_unlocks drop column if exists copies;
