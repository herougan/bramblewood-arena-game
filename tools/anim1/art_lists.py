#!/usr/bin/env python3
"""ANIM1 (2026-11-03): flags card art with a flat grey (~176) background and art under 128 px -> tests/out/anim1/art-lists.json (review only)."""
import json, io, base64, os
from PIL import Image
from collections import Counter
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
cards = {c['id']: c for c in json.load(open(os.path.join(ROOT, 'canonical', 'cards.json'), encoding='utf-8'))}
grey = []; small = []; mid = []
for cid, c in cards.items():
    a = c.get('art') or ''
    if not a.startswith('data:'): continue
    im = Image.open(io.BytesIO(base64.b64decode(a.split(',', 1)[1]))).convert('RGB'); w, h = im.size; px = im.load()
    cnt = Counter(im.getdata())
    flat = sum(n for col, n in cnt.items() if max(col) - min(col) <= 7 and 168 <= col[0] <= 186) / (w * h)
    border = [px[x, 0] for x in range(w)] + [px[x, h - 1] for x in range(w)] + [px[0, y] for y in range(h)] + [px[w - 1, y] for y in range(h)]
    bg = sum(1 for col in border if max(col) - min(col) <= 7 and 168 <= col[0] <= 186) / len(border)
    if flat > 0.07 and bg > 0.15: grey.append((cid, w, round(flat, 2), round(bg, 2)))
    if w <= 110: small.append(cid)
    elif w <= 127: mid.append(cid)
g = [x[0] for x in grey]
print(len(grey), 'grey-bg;', len(small), '<=110px;', len(set(g) | set(small)), 'union;', len(mid), '111-127px;', len(set(g) & set(small)), 'both')
print('small, not grey:', sorted(set(small) - set(g)))
print('grey, over 110px:', [(x[0], x[1]) for x in grey if x[1] > 110])
print('grey ids:', ' '.join(sorted(g)))
json.dump({'grey': grey, 'small': small, 'mid': mid}, open(os.path.join(ROOT, 'tests', 'out', 'anim1', 'art-lists.json'), 'w'))
