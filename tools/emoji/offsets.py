#!/usr/bin/env python3
"""Emoji centring offsets (2026-11-18, UI60: owner "help me centre them manually and find the offset. Save it").

Measures each atlas emoji's ink bounding box (alpha > 24) inside its 64 px cell and saves how far the ink centre sits from the
cell centre, as a fraction of the cell: [dx, dy] is the nudge that centres it (add it to the position: translate by dx * size).
Written to tools/emoji/offsets.json as {set: {key: [dx, dy]}}; build_atlas.py runs this after each sheet, assemble_arena.py
ships it in EMOJI_ATLAS[set].off, and the context pills (.ab-trig, trigger chips) apply it, so a new emoji is centred by the build.

    python3 tools/emoji/offsets.py            # every sheet in tools/emoji/atlas
"""
import json, os, sys
HERE = os.path.dirname(os.path.abspath(__file__))
ATLAS = os.path.join(HERE, "atlas")
OUT = os.path.join(HERE, "offsets.json")  # source file (assets/emoji is rewritten by every build)


def measure(name):
    from PIL import Image
    meta = json.load(open(os.path.join(ATLAS, name + ".json"), encoding="utf-8"))
    im = Image.open(os.path.join(ATLAS, name + ".webp")).convert("RGBA")
    a = im.getchannel("A").point(lambda v: 255 if v > 24 else 0)
    cell, pad, pitch, cols = meta["cell"], meta["pad"], meta["pitch"], meta["cols"]
    out = {}
    for i, k in enumerate(meta["keys"]):
        x, y = (i % cols) * pitch + pad, (i // cols) * pitch + pad
        bb = a.crop((x, y, x + cell, y + cell)).getbbox()
        if not bb: continue
        dx, dy = 0.5 - (bb[0] + bb[2]) / 2 / cell, 0.5 - (bb[1] + bb[3]) / 2 / cell
        if abs(dx) > 0.004 or abs(dy) > 0.004: out[k] = [round(dx, 3), round(dy, 3)]
    return out


def run(names=None):
    names = names or sorted(f[:-5] for f in os.listdir(ATLAS) if f.endswith(".json"))
    try: allo = json.load(open(OUT, encoding="utf-8"))
    except Exception: allo = {}
    for n in names:
        allo[n] = measure(n); print("offsets %s: %d emoji nudged" % (n, len(allo[n])))
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    json.dump(allo, open(OUT, "w", encoding="utf-8"), separators=(",", ":"), sort_keys=True)


if __name__ == "__main__":
    run(sys.argv[1:] or None)
