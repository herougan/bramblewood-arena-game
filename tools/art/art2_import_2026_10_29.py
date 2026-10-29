#!/usr/bin/env python3
"""ART2 (2026-10-29): import 2x2 art sheets generated in the owner's Chrome (Gemini, ChatGPT, NightCafe).

Each sheet is one square image holding four card illustrations (TL, TR, BL, BR) with thin plain gaps.
For every sheet listed in docs/art/art2-sheets-2026-10-29.json ({file name: [id TL, id TR, id BL, id BR]}):
  1. find the gap lines (near-uniform light or dark bands around the middle) and any outer border, cut 4 panels;
  2. trim leftover uniform edge lines, crop each panel to a centred square;
  3. pixel pass (tools/art/pixelize.py: box-downscale to 128 px, snap to tools/art/palette.json),
     then upscale x2 nearest to 256 px, saved as a palette PNG (<= 256 colours) in art/cards/<id>.png;
  4. write art/cards/<id>.prompt.txt (base prompt + that panel's subject, from docs/art/art2-plan-2026-10-29.json);
  5. set the card's "art" field in canonical/cards.json to the PNG data URI with a targeted text edit
     (replace the card's existing "art" line, or insert one before its "source" block / closing brace).

    python3 tools/art/art2_import_2026_10_29.py --src /mnt/user-data/uploads/Downloads [--only FILE] [--contact out.png ids...]
"""
import argparse, base64, io, json, os, re, sys
from PIL import Image, ImageDraw, ImageStat

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
sys.path.insert(0, os.path.join(ROOT, 'tools', 'art'))
import pixelize  # noqa: E402

SHEETS = os.path.join(ROOT, 'docs', 'art', 'art2-sheets-2026-10-29.json')
PLAN = os.path.join(ROOT, 'docs', 'art', 'art2-plan-2026-10-29.json')
QUEUE = os.path.join(ROOT, 'docs', 'art', 'art2-queue-2026-10-29.json')
CARDS = os.path.join(ROOT, 'canonical', 'cards.json')
OUT = os.path.join(ROOT, 'art', 'cards')
POS = ['Top-left', 'Top-right', 'Bottom-left', 'Bottom-right']


def _line_stats(im, axis):
    """Per-column (axis=0) or per-row (axis=1) mean brightness and spread of a greyscale image."""
    g = im.convert('L'); W, H = g.size; px = g.load()
    out = []
    n = W if axis == 0 else H
    for i in range(n):
        vals = [px[i, j] for j in range(0, H, 2)] if axis == 0 else [px[j, i] for j in range(0, W, 2)]
        m = sum(vals) / len(vals)
        sd = (sum((v - m) ** 2 for v in vals) / len(vals)) ** 0.5
        med = sorted(vals)[len(vals) // 2]
        near = sum(1 for v in vals if abs(v - med) < 24) / len(vals)  # share of the line in its main colour
        out.append((m, sd, near))
    return out


def _is_gap(m, sd, near=0):
    return sd < 18 and (m > 215 or m < 30)


def find_split(stats, lo, hi):
    """Widest run of gap lines in [lo, hi); returns (start, end) or the midpoint if none."""
    best, cur = None, None
    for i in range(lo, hi):
        if _is_gap(*stats[i]):
            cur = (cur[0], i + 1) if cur else (i, i + 1)
            if not best or cur[1] - cur[0] > best[1] - best[0]: best = cur
        else:
            cur = None
    if not best:
        mid = (lo + hi) // 2; return (mid, mid)
    return best


def trim_border(stats, n, pred=_is_gap, frac=8):
    a, b = 0, n
    while a < n // frac and pred(*stats[a]): a += 1
    while b > n - n // frac and pred(*stats[b - 1]): b -= 1
    return a, b


def _is_frame(m, sd, near):
    """A panel edge line mostly of one flat colour (Gemini sometimes draws a coloured frame with rounded corners)."""
    return near > 0.8 or _is_gap(m, sd)


def split_sheet(im, inset=0.0):
    im = im.convert('RGB'); W, H = im.size
    cs, rs = _line_stats(im, 0), _line_stats(im, 1)
    x0, x1 = trim_border(cs, W); y0, y1 = trim_border(rs, H)
    gx = find_split(cs, int(W * .35), int(W * .65)); gy = find_split(rs, int(H * .35), int(H * .65))
    boxes = [(x0, y0, gx[0], gy[0]), (gx[1], y0, x1, gy[0]), (x0, gy[1], gx[0], y1), (gx[1], gy[1], x1, y1)]
    panels = []
    for bx in boxes:
        p = im.crop(bx)
        # trim leftover uniform edge lines (thin frame or gap remains), at most 4% per side
        pc, pr = _line_stats(p, 0), _line_stats(p, 1)
        a, b = trim_border(pc, p.width, _is_frame, 16); c, d = trim_border(pr, p.height, _is_frame, 16)
        p = p.crop((a, c, b, d))
        s = min(p.size); l = (p.width - s) // 2; t = (p.height - s) // 2
        k = int(s * inset)  # NightCafe draws a rounded frame per panel: cut inside it
        panels.append(p.crop((l + k, t + k, l + s - k, t + s - k)))
    return panels


def pixel_pass(panel, colours, size=128):
    tmp = io.BytesIO(); panel.convert('RGBA').save(tmp, 'PNG'); tmp.seek(0)
    small = pixelize.pixelize(tmp, size, colours)  # box downscale + palette snap
    big = small.convert('RGB').resize((size * 2, size * 2), Image.Resampling.NEAREST)
    return big.quantize(colors=256, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.NONE)


def set_art(text, cid, uri):
    """Targeted edit of one card's "art" line in cards.json text (file format: 2-space list, 4-space keys)."""
    m = re.search(r'\n    "id": "%s",?\n' % re.escape(cid), text)
    if not m: raise SystemExit('card not found: ' + cid)
    start = text.rfind('\n  {\n', 0, m.start() + 1); end = text.find('\n  }', m.end() - 1)
    block = text[start:end]
    line = '    "art": "%s"' % uri
    am = re.search(r'\n    "art": "[^"]*"', block)
    if am:
        block = block[:am.start()] + '\n' + line + block[am.end():]
    else:
        sm = re.search(r'\n    "source": \{', block)
        if sm:
            block = block[:sm.start()] + '\n' + line + ',' + block[sm.start():]
        else:
            block = block + ',\n' + line
    return text[:start] + block + text[end:]


def contact(ids, out, cols=8):
    cell = 140; rows = (len(ids) + cols - 1) // cols
    sheet = Image.new('RGB', (cols * cell, rows * (cell + 16)), (30, 30, 30)); d = ImageDraw.Draw(sheet)
    for i, cid in enumerate(ids):
        x, y = (i % cols) * cell, (i // cols) * (cell + 16)
        im = Image.open(os.path.join(OUT, cid + '.png')).convert('RGB').resize((cell - 6, cell - 6), Image.Resampling.NEAREST)
        sheet.paste(im, (x + 3, y + 3)); d.text((x + 3, y + cell - 2), cid[:22], fill=(240, 240, 240))
    sheet.save(out); print('contact sheet:', out)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--src', default='/mnt/user-data/uploads/Downloads')
    ap.add_argument('--only', nargs='*')
    ap.add_argument('--contact', nargs='*', help='out.png then ids (or none = all imported)')
    a = ap.parse_args()
    if a.contact:
        out, *ids = a.contact
        if not ids: ids = [i for v in json.load(open(SHEETS)).values() for i in v]
        return contact(ids, out)
    sheets = json.load(open(SHEETS)); plan = json.load(open(PLAN))
    subj, sent, base_of = {}, {}, {}
    for s in plan['sheets'].values():
        for cid, t in zip(s['ids'], s['subjects']):
            subj[cid] = t
            if s.get('sent'): sent[cid] = s['sent']  # NightCafe needs a shorter prompt; this is the text actually sent
            if s.get('base'): base_of[cid] = s['base']  # later Gemini sheets asked for white gaps and no borders
    colours = pixelize.load_palette()
    text = open(CARDS, encoding='utf-8').read()
    for fn, ids in sheets.items():
        if a.only and fn not in a.only: continue
        src = os.path.join(a.src, fn)
        if not os.path.exists(src): print('missing', src); continue
        panels = split_sheet(Image.open(src), inset=0.045 if 'nightcafe' in fn else 0.0)
        for cid, pos, p in zip(ids, POS, panels):
            if cid is None: continue
            img = pixel_pass(p, colours)
            path = os.path.join(OUT, cid + '.png'); img.save(path, optimize=True)
            prompt = sent.get(cid) or (base_of.get(cid, plan['base']) + ' ' + pos + ': ' + subj.get(cid, cid) + '.')
            open(os.path.join(OUT, cid + '.prompt.txt'), 'w').write(
                '# ART2 2026-10-29, sheet %s (%s panel), pixel pass 128 px -> x2 nearest\n%s\n' % (fn, pos, prompt))
            uri = 'data:image/png;base64,' + base64.b64encode(open(path, 'rb').read()).decode('ascii')
            text = set_art(text, cid, uri)
            print(cid, '<-', fn, pos)
    open(CARDS, 'w', encoding='utf-8').write(text)
    json.loads(text)  # still valid JSON


if __name__ == '__main__':
    main()
