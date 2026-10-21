# Workflow: card data and content

For new cards, stat or skill edits, rewards, skirmish decks, card texts and names. Rules and safety are in `/CLAUDE.md`.

## Files you need
- `canonical/cards.json`: the only source for cards. Append new cards at the end with `awaitingSource: true` until the owner places them.
  - `numericId` must be unique. Parallel packages have collided before, so check before committing.
- `canonical/card-obtain-maps.json`: the map where each card becomes obtainable. It feeds the budget's Map term.
- `canonical/skill-costs.json`, `canonical/animal-tags.json`, `canonical/unit-themes.json`, `canonical/special-monsters.json`.
- Skirmish decks, rewards and map nodes: `CONQUEST_MAPS` and the map-node blocks in `arena_app.js` (see `docs/code-map.md` → Map, road, skirmish).
- Names and texts: card names go in `lang/cards`, UI text in `bramblewood-texts.js`. Translate with a dated script in the style of `tools/i18n_2026_10_19_<pkg>.py`.

## Rules the owner set
- Every card goes through the budget: `bramblewood-budget.js` (`2A+H+S ≤ N`, `A·H+S ≤ (N/3)²`). Special monsters, Mythics and Divines too.
- Two skills at most, except special or thematic creatures. Early rewards are vanilla (no skills). Skirmish rewards are never pack rewards.
- Live edits come in through Supabase `card_overrides` and the hub's db tabs. They are inputs, not the source:
  - fold them into cards.json (`tools/fold_server_overrides_2026_10_19.js`, `tools/hub/apply_balance_edits.js`);
  - then propose a clearing SQL in `supabase/proposed/`, which is applied only on "apply it".
- Map card pools (2026-10-22, package MP): `canonical/map-pools.json` is the source for which cards belong to which map and submap (`cards`, and `special` for cards added from one skirmish's "+ Load any card"). The admin's Map cards editor saves live as `card_overrides` rows `__cfg:map-pools:<mapId>` (one per main map, the submaps inside it; they win over the file at load). To fold them back:
  1. read the rows (read-only SQL): `select id, data, deleted, updated_at from card_overrides where id like '__cfg:map-pools:%';` and save the result as JSON (e.g. `docs/balance/server-overrides/map-pools-dump-<date>.json`);
  2. `node tools/fold_map_pools.js <dump.json> --dry`, then without `--dry`: each row replaces that map's entry in the file (ids not in cards.json are dropped and listed; deleted rows change nothing);
  3. rebuild, commit, and only then ask the owner for "apply it" on `supabase/proposed/20261022_clear_map_pools.sql` (it deletes the `__cfg:map-pools:%` rows). Never edit the file by hand while rows are live: the rows win.

## Checks (cheapest first)
1. `python3 -c "import json;json.load(open('canonical/cards.json'))"` and the build.
2. `node tests/run.js --only 'card-pass|card-pool|i18n-cards|easter|integrity'`.
3. `node tests/card-matrix.js`: new cards show up as "new" diffs. Accept them with `--update` once per release batch, not per package.

## Done when
The cards validate, the budget check passes or the exception is named, the texts are translated, there is a CHANGELOG entry, and any owner calls are added to `docs/decisions.json`.
