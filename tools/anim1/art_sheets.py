#!/usr/bin/env python3
"""ANIM1 (2026-11-03): contact sheets of all card art grouped by map -> docs/art/anim1-contact-<map>-<n>.png, plus art metrics (size, softness, near-duplicates)
-> tests/out/anim1/art-metrics.json. Review only. Cards come from canonical/cards.json (embedded art); the map is the first main map whose canonical/map-pools.json lists it."""
import json, os, io, base64, math
from PIL import Image, ImageDraw, ImageFont, ImageFilter, ImageStat
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
cards = json.load(open(os.path.join(ROOT, 'canonical', 'cards.json'), encoding='utf-8'))
pools = json.load(open(os.path.join(ROOT, 'canonical', 'map-pools.json'), encoding='utf-8'))['maps']
OUT = os.path.join(ROOT, 'docs', 'art'); OUTD = os.path.join(ROOT, 'tests', 'out', 'anim1'); os.makedirs(OUTD, exist_ok=True)
byid = {c['id']: c for c in cards}
order = {}
for mid, mp in pools.items():
    ids = list(mp.get('cards', []))
    for sm in (mp.get('submaps') or {}).values():
        ids += sm if isinstance(sm, list) else (sm.get('cards') or [])
    for i in ids:
        if i in byid and i not in order: order[i] = mid
groups = {}
for c in cards:
    groups.setdefault(order.get(c['id'], 'none'), []).append(c['id'])
def mapkey(m): return (m == 'none', int(''.join(ch for ch in m if ch.isdigit()) or 0), m)
def load(c):
    a = c.get('art') or ''
    if a.startswith('data:'):
        return Image.open(io.BytesIO(base64.b64decode(a.split(',', 1)[1]))).convert('RGB')
    p = os.path.join(ROOT, 'art', 'cards', c['id'] + '.png')
    return Image.open(p).convert('RGB') if os.path.exists(p) else None
font = ImageFont.load_default()
TILE, COLS, ROWS = 124, 10, 5
metrics = {}; hashes = {}
def ahash(im):
    s = im.convert('L').resize((16, 16)); px = list(s.getdata()); m = sum(px) / len(px); return ''.join('1' if p > m else '0' for p in px)
index = []
for mid in sorted(groups, key=mapkey):
    ids = groups[mid]
    for n in range(0, len(ids), COLS * ROWS):
        chunk = ids[n:n + COLS * ROWS]; sheet = Image.new('RGB', (COLS * TILE, ROWS * (TILE + 14)), (24, 24, 24)); d = ImageDraw.Draw(sheet)
        for k, cid in enumerate(chunk):
            c = byid[cid]; im = load(c); x, y = (k % COLS) * TILE, (k // COLS) * (TILE + 14)
            if im is None: d.text((x + 4, y + 50), 'NO ART', fill=(255, 80, 80), font=font); metrics[cid] = {'noart': True}; continue
            lap = ImageStat.Stat(im.convert('L').filter(ImageFilter.FIND_EDGES)).var[0]
            metrics[cid] = {'w': im.size[0], 'h': im.size[1], 'edgevar': round(lap, 1), 'map': mid}; hashes[cid] = ahash(im)
            sheet.paste(im.resize((TILE - 4, TILE - 4), Image.NEAREST if im.size[0] < TILE else Image.LANCZOS), (x + 2, y + 2))
            d.text((x + 2, y + TILE - 2), (cid[:22]), fill=(230, 230, 230), font=font)
        name = f'anim1-contact-{mid}-{n // (COLS * ROWS) + 1}.png'
        sheet.save(os.path.join(OUT, name)); index.append((name, [(i) for i in chunk]))
# near duplicates by hash
dups = []
ids = list(hashes)
for i in range(len(ids)):
    for j in range(i + 1, len(ids)):
        h = sum(a != b for a, b in zip(hashes[ids[i]], hashes[ids[j]]))
        if h <= 6: dups.append((ids[i], ids[j], h))
json.dump({'metrics': metrics, 'dups': dups, 'index': index}, open(os.path.join(OUTD, 'art-metrics.json'), 'w'), indent=1)
print(len(index), 'sheets;', len(dups), 'near-duplicate pairs;', 'sizes', sorted(set((m.get('w'), m.get('h')) for m in metrics.values())))
