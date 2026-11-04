#!/usr/bin/env python3
"""ART8 (2026-11-03): import PixelLab 2x2 sheets for the flagged-card art redo (ANIM1 groups A-D).

Reuses tools/art/art7_import_2026_11_03.py (sheet splitting, 128 px nearest -> 256 px palette PNG) and
art2_import (targeted cards.json edit). Picks live in docs/art/art8-picks-2026-11-03.json:
    {"<card id>": {"pick": "A".."D", "prompt": "<the PixelLab description used>"}}
Each sheet is <src>/<card id>.png (one 256 px image, four 128 px variants A TL, B TR, C BL, D BR).

    python3 tools/art/art8_import_2026_11_03.py --src <dir> --variants out.png id1 id2 ...   # check sheet, pick outlined
    python3 tools/art/art8_import_2026_11_03.py --src <dir> --only id1 id2 ...               # import those ids
    python3 tools/art/art8_import_2026_11_03.py --contact out.png id1 id2 ...                # contact sheet of imported art
"""
import argparse, base64, json, os, sys
from PIL import Image, ImageDraw

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
sys.path.insert(0, os.path.join(ROOT, 'tools', 'art'))
import art2_import_2026_10_29 as a2  # noqa: E402
import art7_import_2026_11_03 as a7  # noqa: E402

CARDS = os.path.join(ROOT, 'canonical', 'cards.json')
OUT = os.path.join(ROOT, 'art', 'cards')
PICKS = os.path.join(ROOT, 'docs', 'art', 'art8-picks-2026-11-03.json')


def variants(src, ids, out, picks):
    cell = 128; per_row = 2; rows = (len(ids) + per_row - 1) // per_row
    W = per_row * (4 * cell + 12); H = rows * (cell + 16)
    M = Image.new('RGB', (W, H), (40, 40, 40)); d = ImageDraw.Draw(M)
    for n, cid in enumerate(ids):
        ox = (n % per_row) * (4 * cell + 12); oy = (n // per_row) * (cell + 16)
        for k, p in enumerate(a7.split(Image.open(os.path.join(src, cid + '.png')))):
            M.paste(p.resize((cell, cell), Image.Resampling.NEAREST), (ox + k * cell, oy))
            d.text((ox + k * cell + 3, oy + 2), 'ABCD'[k], fill=(255, 255, 0))
            if picks.get(cid, {}).get('pick') == 'ABCD'[k]:
                d.rectangle((ox + k * cell, oy, ox + k * cell + cell - 1, oy + cell - 1), outline=(255, 0, 0), width=3)
        d.text((ox + 3, oy + cell + 2), cid, fill=(240, 240, 240))
    M.save(out); print('variants:', out, M.size)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--src', default='/mnt/user-data/uploads/Downloads/art8')
    ap.add_argument('--variants'); ap.add_argument('--contact'); ap.add_argument('--only', nargs='*')
    ap.add_argument('ids', nargs='*')
    a = ap.parse_args()
    picks = json.load(open(PICKS)) if os.path.exists(PICKS) else {}
    if a.variants: return variants(a.src, a.ids, a.variants, picks)
    if a.contact: return a2.contact(a.ids, a.contact, cols=5)
    ids = a.only if a.only else a.ids
    text = open(CARDS, encoding='utf-8').read()
    for cid in ids:
        v = picks[cid]['pick']
        panels = a7.split(Image.open(os.path.join(a.src, cid + '.png')))
        img = a7.finish(panels['ABCD'.index(v)])
        path = os.path.join(OUT, cid + '.png'); img.save(path, optimize=True)
        open(os.path.join(OUT, cid + '.prompt.txt'), 'w').write(
            '# ART8 2026-11-03, PixelLab Create image (Pro, 128x128, 2x2), variant %s picked; description sent:\n%s\n' % (v, picks[cid]['prompt']))
        uri = 'data:image/png;base64,' + base64.b64encode(open(path, 'rb').read()).decode('ascii')
        text = a2.set_art(text, cid, uri)
        text = a7.drop_review(text, cid)
        print(cid, 'variant', v, 'panel', panels['ABCD'.index(v)].size)
    open(CARDS, 'w', encoding='utf-8').write(text)
    json.loads(text)


if __name__ == '__main__':
    main()
