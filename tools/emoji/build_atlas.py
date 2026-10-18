#!/usr/bin/env python3
"""Emoji sprite sheets (2026-10-18, Codex profiling: every emoji was its own little SVG document the browser laid out, painted
and re-rasterised on each frame, about 8 per card; the biggest render cost left in the Codex, the board and the hand).

For each bundled set (tools/emoji/sets/<set>.json, only the ~540 emoji the game uses) this draws every emoji once, in headless
Chromium (the same renderer the game's <img> used, so the pictures look the same), into one sheet at CELL px a cell
(2x of a 32 px emoji), and writes:

    tools/emoji/atlas/<set>.webp   the sheet (lossless WebP)
    tools/emoji/atlas/<set>.json   {set, hash, cell, pad, pitch, cols, rows, w, h, keys: [in sheet order], vs, miss: [...]}

"hash" is a hash of the set's emoji, so assemble_arena.py (emoji_atlases()) can tell a sheet is current and only reruns this
when a set changed. An emoji that fails to draw is listed under "miss" and the game draws it the old way (its SVG).

    python3 tools/emoji/build_atlas.py            # every set
    python3 tools/emoji/build_atlas.py fluent     # one set
Needs playwright + Chromium (BW_CHROMIUM overrides the browser path) and Pillow.
"""
import asyncio, base64, hashlib, io, json, math, os, sys

HERE = os.path.dirname(os.path.abspath(__file__))
SETS = os.path.join(HERE, "sets")
OUT = os.path.join(HERE, "atlas")
CELL, PAD = 64, 2          # a cell is CELL px with PAD px of clear space all round, so a scaled cell never bleeds into the next
PITCH = CELL + 2 * PAD
COLS = 24
EXE = os.environ.get("BW_CHROMIUM", "/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell")


def set_hash(ed):
    """What the sheet depends on: the pictures, the layout constants and this tool's version."""
    h = hashlib.sha256()
    h.update(json.dumps({"cell": CELL, "pad": PAD, "cols": COLS, "v": 1}, sort_keys=True).encode())
    h.update(json.dumps(ed["emoji"], sort_keys=True, ensure_ascii=False).encode("utf-8"))
    return h.hexdigest()[:16]


DRAW_JS = """async ({items, cell, pad, pitch, cols}) => {
  const rows = Math.ceil(items.length / cols);
  const cv = document.createElement('canvas'); cv.width = cols * pitch; cv.height = rows * pitch;
  const g = cv.getContext('2d'); const miss = [];
  for(let i = 0; i < items.length; i++){
    const [key, svg0] = items[i];
    // the emoji drawn in a cell x cell viewport, as the game's <img width=height> drew it (viewBox kept, aspect "meet")
    let svg = svg0.replace(/<svg\\b([^>]*)>/, (m, a)=> '<svg' + a.replace(/\\s(width|height)="[^"]*"/g, '') + ` width="${cell}" height="${cell}">`);
    try{
      const url = URL.createObjectURL(new Blob([svg], {type: 'image/svg+xml'}));
      const img = new Image(); img.src = url; await img.decode();
      g.drawImage(img, (i % cols) * pitch + pad, Math.floor(i / cols) * pitch + pad, cell, cell);
      URL.revokeObjectURL(url);
    }catch(e){ miss.push(key); }
  }
  return {png: cv.toDataURL('image/png'), miss, w: cv.width, h: cv.height, rows};
}"""


async def build(names):
    from playwright.async_api import async_playwright
    from PIL import Image
    os.makedirs(OUT, exist_ok=True)
    async with async_playwright() as p:
        kw = {"executable_path": EXE} if os.path.exists(EXE) else {}
        b = await p.chromium.launch(**kw)
        pg = await b.new_page()
        await pg.set_content("<!doctype html><title>atlas</title>")
        for name in names:
            ed = json.load(open(os.path.join(SETS, name + ".json"), encoding="utf-8"))
            keys = sorted(ed["emoji"])
            r = await pg.evaluate(DRAW_JS, {"items": [[k, ed["emoji"][k]] for k in keys], "cell": CELL, "pad": PAD, "pitch": PITCH, "cols": COLS})
            im = Image.open(io.BytesIO(base64.b64decode(r["png"].split(",", 1)[1]))).convert("RGBA")
            buf = io.BytesIO(); im.save(buf, "WEBP", lossless=True, method=6, quality=100)
            open(os.path.join(OUT, name + ".webp"), "wb").write(buf.getvalue())
            meta = {"set": ed["set"], "hash": set_hash(ed), "cell": CELL, "pad": PAD, "pitch": PITCH, "cols": COLS, "rows": r["rows"],
                    "w": r["w"], "h": r["h"], "vs": ed.get("vs", []), "miss": r["miss"], "keys": keys}
            json.dump(meta, open(os.path.join(OUT, name + ".json"), "w", encoding="utf-8"), separators=(",", ":"))
            print("atlas %s: %d emoji, %dx%d, %d KB webp, %d missed" % (name, len(keys), r["w"], r["h"], len(buf.getvalue()) // 1024, len(r["miss"])))
        await b.close()


if __name__ == "__main__":
    names = sys.argv[1:] or sorted(f[:-5] for f in os.listdir(SETS) if f.endswith(".json"))
    asyncio.run(build(names))
