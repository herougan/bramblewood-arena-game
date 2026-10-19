# Package SY checkpoint (cross-device deck sync, 2026-10-19)

## Findings (done)
- ROOT CAUSE: deck ids are `'deck-' + random` (genDeckId) but `public.player_decks.id` is `uuid`. Every
  `player_decks` upsert fails (22P02 invalid uuid) and cloudPushDecks swallows the error (`.then(()=>{}, ()=>{})`
  ignores `{error}`). Server: player_decks has 0 rows for ALL users (read-only SELECT).
- Pull: decks only pulled once at load/sign-in, and the cloud list replaced the local one wholesale (would drop `looks`).
- RLS on player_decks is fine (own rows, all commands). Columns: id uuid, profile_id, name, character_id, leader_id,
  counts jsonb, created_at, updated_at (no trigger).
- Decks hold counts (+ looks by kind), not copy uids, so per-copy uids don't leak into decks.
- Owner's email account: last session refresh 2026-10-13; the only account active since 10-14 is a different one.

## Plan / status
- [ ] UUID deck ids + one-time remap of old ids (active/main deck keys too)
- [ ] per-deck updatedAt, tombstones, cloud-seen map; pure merge in DECK_SYNC_SY block
- [ ] debounced push, pull on load/sign-in/focus/visibility/online
- [ ] indicator (TX keys sync.*)
- [ ] supabase/proposed/20261019_deck_sync.sql (looks, deleted_at) + client fallback
- [ ] tests/deck-sync-2026-10-19.js, run-all.sh, CHANGELOG, build, commit
