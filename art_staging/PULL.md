# Pulling PixelLab art (2026-10-12)

Generation runs in the user's Chrome (PixelLab tab, `window.__bwJobs3` + `window.__bwArt`, log in `window.__bwLog`).
Transfer goes through the built-in browser tab `seed` (also on pixellab.ai/create, signed in):
1. In `seed`, reload, then set `window.__bwKeys` = art_staging/pull_keys_2026_10_12.json (id -> last 70 chars of its prompt),
   `window.__bwArt2 = {}`, and `__bwScan()` (finds gallery <img> whose alt contains the key; scroll the gallery for older ones).
2. Return `'BWART_JSON::'+JSON.stringify(window.__bwArt2)+'x'.repeat(260000)` so the result spills to a file.
3. `python3 art_staging/extract2.py <file>` -> art_staging/raw/<id>.png (2x2 sheets of 4 variants).
4. `python3 art_staging/sheet.py out.png <ids...>`, look, then `python3 art_staging/pickwire.py '{"id":"A",...}'`.

Waiting as of 14:40: 29 done in Chrome but not pulled (see the keys file), 28 still generating, plus 4 added at
the end: meerkat-wayfarer, strange-materia, forge-bg, forge-anvil (forge ones replace art/forge/bg.png and anvil.png;
clear the anvil's grey background with clearbg.py).
