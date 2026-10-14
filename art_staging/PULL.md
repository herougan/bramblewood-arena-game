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


2026-10-12 17:00: pulled 51 (keys in pull_keys_2026_10_12.json). The seed tab's gallery ("Your gallery") is the account's, newest first, and loads lazily: scroll it in 150 px steps with a 1.5 s pause, scanning each step, and keep each javascript call under 45 s (start the loop without awaiting it, then poll). Results over ~260k characters get cut, so return about 235k characters of images per call.

2026-10-12 18:55: the runner finished all 153 jobs; the last 29 were pulled (keys in pull_keys_2026_10_12b.json; land-tiller,
talon-archer and forge-anvil use Chrome's actual prompt tails, which differ from the local job files). Forge bg is the
16:9 band (rows 26-98) of variant B; the anvil is variant C with its grey cleared and trimmed. Nothing is queued now.

2026-10-12 19:46 (11:46Z): batch C queued in Chrome as `window.__bwJobs4` (art_staging/jobs_2026_10_12c.json, 90 jobs: every
player-obtainable card still without a portrait). Keys for the gallery scan: pull_keys_2026_10_12c.json. ~5 min a job, so
done around 19:15Z. Weather fields, Tailwind, Bramble Gauntlet, Thornwood Palisade and MissingNo use the scene style.

## NightCafe pixel art, the way that works (2026-10-14)
- Model: **Flux 2 Klein 9B Fast** (0.75 credits, not PRO; HiDream I1 Fast is 1 credit). The pixel LoRAs (Retro VG Pixel Art, HD 2D Pixel Art) and NightCafe's Pixel Art templates need PRO; the "3D Game v2" preset is 3D, not pixel.
- Prompt Magic **off**. Prompt: subject + scene, then ", 16-bit video game style pixel art, Pokemon style creature card portrait, natural animal anatomy, real animal body, not anthropomorphic, no hands, clean dark outlines, crisp square pixels, limited palette, detailed full background scene, centred composition". Avoid "no clothes", weapon words, "spiked", "studded", "monitor".
- Generate in the user's Chrome (signed in). Download through the built-in browser tab on images.nightcafe.studio (`/jobs/<id>/<id>--0--<k>.jpg?tr=w-768`, returned as BWART_JSON so it spills to a file), then `python3 art_staging/nc_extract.py <file>`.
- **Don't run nc_pixel.py on these**: Flux already draws clean pixels and the extra pass muddies eyes and faces. Resize straight to 256 px (LANCZOS) into art/cards/<id>.png and wire it.
