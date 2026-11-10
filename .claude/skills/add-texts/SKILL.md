---
name: add-texts
description: Use when a Bramblewood Arena change adds, rewords or removes player-visible text (a toast, tooltip, label, dialog, skill text, card name or card flavour) and the 12 language packs need the rows. Adds the TX key and all 12 translations with tools/i18n_add.py from one small table, then builds and runs the i18n tests. Not for editing a pack by hand and not for code changes beyond the text table.
---

# Add or change texts (TX keys + 12 packs)

Cheat sheet: `docs/guides/i18n.md`. Copy rules: `docs/workflows/code-quality.md` ("In-game copy"). Languages, always in this order: `fr de es it pt tl ta id zh-Hans zh-Hant ja ko`.

## Steps
1. **English first, short.** Every word is paid 13 times and must fit a 390 px chip. A label names; its tooltip explains. Change an existing key's English in place; never add a second key for the same thing.
2. **Use the key in code:** `TX('ui.<pkg>-<name>', {n})`, numbers and names as `{placeholders}`, never one key per number. Text cut by inline tags (`<b>`) must be one key.
3. **Write the table** (JSON, or a `.py` with `TABLE = {...}`), for example `tools/i18n_<date>_<pkg>.json`:
```json
{
 "tx": {"ui.pkg-name": {"en": "Added {name} to {group}.", "fr": "...", "de": "...", "es": "...", "it": "...", "pt": "...",
                        "tl": "...", "ta": "...", "id": "...", "zh-Hans": "...", "zh-Hant": "...", "ja": "...", "ko": "..."}},
 "cards": {"Card Name": ["fr", "de", "es", "it", "pt", "tl", "ta", "id", "zh-Hans", "zh-Hant", "ja", "ko"]},
 "flavor": {"The flavour line.": {"fr": "..."}},
 "pack": {"Text the code reads through _t": {"fr": "..."}}
}
```
   Sections: `tx` (TEXT table + `lang/<code>.json`), `cards` (`lang/cards/`), `flavor` (`lang/ui/`), `pack` (`lang/<code>.json` only). A set is an object with the 12 codes or a list of 12 in that order (a `tx` list has the English first, 13 items).
4. **Run it:**
```bash
python3 tools/i18n_add.py tools/i18n_<date>_<pkg>.json          # adds, validates, refreshes docs/game-texts.xlsx (about 45 s)
python3 tools/i18n_add.py TABLE.json --no-export                 # skip the spreadsheet while iterating
python3 tools/i18n_add.py TABLE.json --overwrite                 # replace rows that exist with different text
python3 tools/i18n_add.py TABLE.json --keyify                    # also move literals out of arena_app.js (rewrites it); lists new keys that still need translations
```
   A missing code, an unknown code or a changed `{placeholder}` (an English plural `{s}` may be dropped) writes nothing and says why. Rows that exist are kept unless `--overwrite`; running twice is a no-op.
5. **Build and check:** `python3 assemble_arena.py && mv bramblewood-arena.html index.html`, then `node tests/run.js --only 'i18n|game-texts'` (`i18n-ui-2026-10-18` is in the smoke set and fails on stale `lang/ui` rows or a lost placeholder). Browser check: `python3 tests/e2e/i18n.py`. If `game-texts` times out under load, `python3 tools/text/selftest.py`.

## Translation rules
- Keep every `{placeholder}` exactly and every emoji; add no new placeholders.
- As short as the English or shorter (German, French and Tamil run long).
- Reuse the pack's own word for game terms (Bramble, Lumber, Wait, Ready, Shield, Forge, skirmish): `jq -r '.["Lumber"]' lang/de.json`.
- Ranks are an emblem, never words.
- Tagalog, Tamil, Japanese and Korean are drafts until a native reads them; say so in the report.

## Pitfalls
- Never open a whole pack (400-520 KB each) or `bramblewood-texts.js` (270 KB): `grep -n` the key, or `jq` one key across the packs (`docs/guides/i18n.md`, "Cheap checks").
- Changing English changes the pack key; the old rows stay until `python3 tools/i18n_ui.py --write` prunes `lang/ui`. Delete keys nothing shows, with their 12 rows.
- Never edit `assets/lang/*.js` or `docs/game-texts.xlsx` by hand; both are generated.
- Two packages adding the same key with different English need a human at merge time.
- Do not copy an old dated `tools/i18n_*.py`; they stay as history.
