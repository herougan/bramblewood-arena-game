# FOLD8: sync card_overrides to cards.json (proposed, not run)

Runs only after the owner says "apply it". File: `20261119_fold8_sync_overrides.sql`.

- What it changes: `data` of 173 card rows (every non-deleted, non-`__cfg` row) becomes the folded `canonical/cards.json` card (art omitted; a row's own `art` is kept). `updated_at` = now(). The 94 `__cfg` rows (5 of them deleted) and the deleted flags are untouched. No row is deleted, none cleared.
- Checks inside the transaction: row count stays 267, and every row equals its card (minus art), else it aborts.
- `updated_by` is a uuid column, so 'fold8' cannot be stored; it is left as it is.
- Rollback: the transaction first makes `card_overrides_bak_20261119` (a full copy). To undo: `update card_overrides o set data = b.data, updated_at = b.updated_at, updated_by = b.updated_by from card_overrides_bak_20261119 b where o.id = b.id;`, then drop the backup. The 26 rows saved after 2026-11-18 14:00 UTC are also in `docs/balance/server-overrides/card-overrides-dump-2026-11-19.json` (trimmed).
- Note: any card edit the owner saves live before this runs would be overwritten; re-dump and re-fold first if rows are newer than 2026-11-18 15:54:59 UTC.

**Superseded (2026-11-19):** not run. The owner said "Do apply it to FOLD8-1"; the same live result was applied as `supabase/oneoff/20261119_fold8_clear_folded_overrides.sql` (the 92 whole-card rows cleared to empty patches; the game then reads cards.json).
