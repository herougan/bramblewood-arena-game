#!/usr/bin/env python3
"""ART7 (2026-11-03): import PixelLab 2x2 sheets downloaded from the owner's gallery (art6 jobs).

Each sheet <src>/<card id>.png is one 256 px image holding four 128 px variants (A TL, B TR, C BL, D BR),
separated by a flat gutter and often a flat outer frame (dark, grey or white; varies per job).
For every card in PICKS ({id: variant letter}):
  1. cut the four variants (flat-line gutter and frame detection, any brightness);
  2. crop the chosen one to a centred square, resize nearest to 128 px (already pixel art: no palette snap,
     unlike art2_import which snapped painterly output), then x2 nearest to 256 px, palette PNG in art/cards/<id>.png;
  3. write art/cards/<id>.prompt.txt (the PixelLab job description and the pick);
  4. set the card's "art" field (targeted text edit, same as art2) and delete its "artReview" block.

    python3 tools/art/art7_import_2026_11_03.py --src /mnt/user-data/uploads/Downloads/art7 [--contact out.png] [--variants out.png]
"""
import argparse, base64, json, os, re, sys
from PIL import Image, ImageDraw

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
sys.path.insert(0, os.path.join(ROOT, 'tools', 'art'))
import art2_import_2026_10_29 as a2  # noqa: E402  (set_art, contact, _line_stats)

CARDS = os.path.join(ROOT, 'canonical', 'cards.json')
OUT = os.path.join(ROOT, 'art', 'cards')
# picks made by eye on all four variants (2026-11-03); Blackmass Rat and Revenant Bog Turtle: the brightest
PICKS = {
    'sphinx': 'A', 'griffin': 'B', 'man-o-war': 'B', 'unicorn': 'B', 'pistol-shrimp': 'A', 'nautiloid': 'B',
    'night-algae': 'A', 'bobbit-worm': 'B', 'bloodworm': 'B', 'blackmass-acolyte': 'A', 'stalactite-golem': 'A',
    'iron-warden': 'B', 'stoneheart-golem': 'A', 'the-unremembered': 'B', 'bog-revenant': 'B',
    'rimeheart-colossus': 'A', 'marsh-wisp': 'A', 'stormcaller': 'C', 'magma-titan': 'A', 'tide-spirit': 'A',
    'ember-wisp': 'C',
}
PREFIX = 'Pokemon-style pixel art card illustration, clean dark outlines, rich readable palette, one bright accent, '


def flat(m, sd, near=0):
    """A line counts as frame or gutter only when every pixel on it is identical (sd == 0 on the sampled
    pixels, the line is its own colour). A loose threshold also ate the dark night skies of some art."""
    return sd < 0.5


def runs(stats, lo, hi):
    best, cur = None, None
    for i in range(lo, hi):
        if flat(*stats[i]):
            cur = (cur[0], i + 1) if cur else (i, i + 1)
            if not best or cur[1] - cur[0] > best[1] - best[0]: best = cur
        else:
            cur = None
    return best or ((lo + hi) // 2,) * 2


def trim(stats, n, frac=8):
    a, b = 0, n
    while a < n // frac and flat(*stats[a]): a += 1
    while b > n - n // frac and flat(*stats[b - 1]): b -= 1
    return a, b


def edge_trim(p, frac=16):
    """Trim panel edge lines where >= 85% of the pixels are one exact colour (a rounded frame leaves corner pixels)."""
    from collections import Counter
    px = p.load(); W, H = p.size

    def framed(vals):
        return Counter(vals).most_common(1)[0][1] >= 0.85 * len(vals)
    a, b, c, d = 0, W, 0, H
    while a < W // frac and framed([px[a, y] for y in range(c, d)]): a += 1
    while b > W - W // frac and framed([px[b - 1, y] for y in range(c, d)]): b -= 1
    while c < H // frac and framed([px[x, c] for x in range(a, b)]): c += 1
    while d > H - H // frac and framed([px[x, d - 1] for x in range(a, b)]): d -= 1
    return p.crop((a, c, b, d))


def split(im):
    im = im.convert('RGB'); W, H = im.size
    cs, rs = a2._line_stats(im, 0), a2._line_stats(im, 1)
    x0, x1 = trim(cs, W); y0, y1 = trim(rs, H)
    gx = runs(cs, int(W * .4), int(W * .6)); gy = runs(rs, int(H * .4), int(H * .6))
    out = []
    for bx in [(x0, y0, gx[0], gy[0]), (gx[1], y0, x1, gy[0]), (x0, gy[1], gx[0], y1), (gx[1], gy[1], x1, y1)]:
        p = im.crop(bx)
        pc, pr = a2._line_stats(p, 0), a2._line_stats(p, 1)
        a, b = trim(pc, p.width, 16); c, d = trim(pr, p.height, 16)
        p = edge_trim(p.crop((a, c, b, d)))
        s = min(p.size); l = (p.width - s) // 2; t = (p.height - s) // 2
        out.append(p.crop((l, t, l + s, t + s)))
    return out


def finish(p):
    small = p.resize((128, 128), Image.Resampling.NEAREST)
    big = small.resize((256, 256), Image.Resampling.NEAREST)
    return big.quantize(colors=256, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.NONE)


def drop_review(text, cid):
    m = re.search(r'\n    "id": "%s",?\n' % re.escape(cid), text)
    start = text.rfind('\n  {\n', 0, m.start() + 1); end = text.find('\n  }', m.end() - 1)
    block = text[start:end]
    block2 = re.sub(r'\n    "artReview": \{.*?\n    \},?(?=\n)', '', block, count=1, flags=re.S)
    return text[:start] + block2 + text[end:]


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--src', default='/mnt/user-data/uploads/Downloads/art7')
    ap.add_argument('--contact'); ap.add_argument('--variants')
    a = ap.parse_args()
    ids = list(PICKS)
    if a.variants:  # check sheet: every card's four variants, the pick outlined
        cell = 128; M = Image.new('RGB', (4 * cell * 1 + 40, len(ids) * (cell + 4)), (40, 40, 40))
        d = ImageDraw.Draw(M)
        for r, cid in enumerate(ids):
            for k, p in enumerate(split(Image.open(os.path.join(a.src, cid + '.png')))):
                M.paste(p.resize((cell, cell), Image.Resampling.NEAREST), (k * cell, r * (cell + 4)))
                if 'ABCD'[k] == PICKS[cid]: d.rectangle((k * cell, r * (cell + 4), k * cell + cell - 1, r * (cell + 4) + cell - 1), outline=(255, 0, 0), width=3)
        M.save(a.variants); print('variants:', a.variants); return
    if a.contact: return a2.contact(ids, a.contact, cols=7)
    text = open(CARDS, encoding='utf-8').read()
    for cid, v in PICKS.items():
        src = os.path.join(a.src, cid + '.png')
        panels = split(Image.open(src))
        img = finish(panels['ABCD'.index(v)])
        path = os.path.join(OUT, cid + '.png'); img.save(path, optimize=True)
        open(os.path.join(OUT, cid + '.prompt.txt'), 'w').write(
            '# ART7 2026-11-03, PixelLab Create image (Pro, 128x128, 2x2), variant %s picked; job description = prefix + brief (docs/art/art6-pixellab-gallery-2026-11-02.md)\n%s\n' % (v, PREFIX + 'brief for card id "' + cid + '" in docs/art/content6-2026-11-02-briefs.md or content7 briefs' + ', full background, no text'))
        uri = 'data:image/png;base64,' + base64.b64encode(open(path, 'rb').read()).decode('ascii')
        text = a2.set_art(text, cid, uri)
        text = drop_review(text, cid)
        print(cid, 'variant', v, 'panel', panels['ABCD'.index(v)].size)
    open(CARDS, 'w', encoding='utf-8').write(text)
    json.loads(text)


if __name__ == '__main__':
    main()
