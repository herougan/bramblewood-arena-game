#!/usr/bin/env python3
"""ANIM1 (2026-11-03): one verification sheet (larger tiles) of the hand-picked redo candidates -> docs/art/anim1-contact-candidates.png."""
import json, io, base64, os, sys
from PIL import Image, ImageDraw
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
c = {x['id']: x for x in json.load(open(os.path.join(ROOT, 'canonical', 'cards.json'), encoding='utf-8'))}
ids = sys.argv[1:]
T = 200; cols = 6; rows = (len(ids) + cols - 1) // cols
sh = Image.new('RGB', (cols * T, rows * (T + 14)), (24, 24, 24)); d = ImageDraw.Draw(sh)
for k, i in enumerate(ids):
    im = Image.open(io.BytesIO(base64.b64decode(c[i]['art'].split(',', 1)[1]))).convert('RGB').resize((T - 4, T - 4), Image.LANCZOS)
    x, y = (k % cols) * T, (k // cols) * (T + 14); sh.paste(im, (x + 2, y + 2)); d.text((x + 2, y + T - 1), '%s (%s)' % (i[:24], c[i].get('animal')), fill=(235, 235, 235))
sh.save(os.path.join(ROOT, 'docs', 'art', 'anim1-contact-candidates.png'))
