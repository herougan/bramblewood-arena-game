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

## Checks (cheapest first)
1. `python3 -c "import json;json.load(open('canonical/cards.json'))"` and the build.
2. `node tests/run.js --only 'card-pass|card-pool|i18n-cards|easter|integrity'`.
3. `node tests/card-matrix.js`: new cards show up as "new" diffs. Accept them with `--update` once per release batch, not per package.

## Done when
The cards validate, the budget check passes or the exception is named, the texts are translated, there is a CHANGELOG entry, and any owner calls are added to `docs/decisions.json`.
