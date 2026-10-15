# Game texts: editing the wording in a spreadsheet

2026-10-15. The designer asked: *"Regarding text in game, is there a way you can offload it into a excel so I can edit the text from there? easier for both of us."*

`docs/game-texts.xlsx` lists the English text the game shows players, one line per row.

## The workflow

1. **Edit the sheet.** Open `docs/game-texts.xlsx`. Type the new wording in the yellow **New text** column (column E). Leave a row's New text empty to keep it as it is.
   - Use the **Area** filter to find a screen: Toasts, Dialogs, Tutorial / coach, Results, Codex, Wildpaths, and so on. Admin / dev rows are developer screens.
   - Keep anything in `{curly brackets}`, because the game fills those in. You can move them around within the line.
   - Keep `<b>…</b>`-style tags if you want the formatting.
2. **Send the file back.** Saving it under any name is fine.
3. **Run the importer.** Claude or a developer runs it:
   ```
   python3 tools/text/import_texts.py path/to/edited.xlsx --dry-run   # what would change
   python3 tools/text/import_texts.py path/to/edited.xlsx
   python3 assemble_arena.py && mv bramblewood-arena.html index.html
   python3 tools/text/export_texts.py                                  # fresh sheet: Current text = the new wording
   ```
   The importer prints one line per row: ✓ applied, ! applied with a warning, ✗ skipped with the reason.

## The two kinds of row

| Key looks like | Where the text lives | What an edit does |
|---|---|---|
| `toast.…`, `dialog.…`, `coach.…`, `tutorial.…`, `results.…` | The `TEXT` table in `bramblewood-texts.js`. The code calls `TX('key')`. | Replaces that one value. It changes everywhere that key is used. |
| `src:function:words:hash` | A literal in `arena_app.js` or `arena_template.html`. | Rewrites that literal where it stands. If the same text appears several times in one function, the row covers all of them. |

All toasts, dialogs and confirms, tutorial and coach tips, and results-screen texts (about 470) are keyed. The other ~6,000 rows are `src:` rows.

A row is skipped, and reported, in these cases:

- The key is unknown.
- The game's text changed after the sheet was exported, so the sheet's Current text no longer matches.
- The text can't be found, or it is found in more than one place.
- The new text adds a `{placeholder}` the code doesn't have.

To fix a skipped row, export a fresh sheet and copy the wording across.

Sometimes one edited row's text sits inside another edited row's `{…}` part. The importer then applies the outer row and asks you to run it again for the inner one.

## Notes

- **Not in this sheet:**
  - Card names, card text and flavour. These live in `canonical/cards.json` and have their own card editor and workbook.
  - NPC dialogue scripts. These are exported with `tools/dialogues/export_dialogues.py`.
  - The battle engine's log lines (`bramblewood-engine.js`).
- **Translations:**
  - Language packs (`lang/*.json`) are keyed by the English text.
  - When a line's English changes, that line shows in English in other languages until the pack gets the new line.
  - `BramblewoodI18n.misses()` lists those lines.
- **Tests:**
  - `node tests/game-texts.js` checks that every `TX` key exists and that every `{placeholder}` is passed.
  - It also runs `tools/text/selftest.py`. That script exports, edits every row, imports into a temp copy, and checks the result.
- **Tools:** `tools/text/textlib.py` has the shared code: a small JS lexer, the text extractor and the writer. `tools/text/keyify.py` moved the high-value texts into the table, and running it again picks up new toasts and dialogs.
