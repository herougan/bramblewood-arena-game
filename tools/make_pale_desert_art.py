#!/usr/bin/env python3
"""Stand-in pixel art for the Pale Desert (2026-10-18, package PD; owner 20:55: "Add the submap that we and codex suggested, the
pale desert"), until NightCafe art replaces it (no art credits were spent):

    python3 tools/make_pale_desert_art.py             -> canonical/characters.json: The Last Oasis's bramble art (128 x 128)

The map's own background is painted by tools/make_map_backgrounds.py (mpd). Deterministic: re-running writes the same image.
"""
import base64, io, json, math, os
import numpy as np
from PIL import Image

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
S = 64  # painted at 64 x 64, shown at 128 x 128 (nearest neighbour), like the other bramble portraits
BAYER = np.array([[0, 8, 2, 10], [12, 4, 14, 6], [3, 11, 1, 9], [15, 7, 13, 5]]) / 16.0 - 0.5


def hexrgb(h):
    h = h.lstrip('#'); return np.array([int(h[i:i + 2], 16) for i in (0, 2, 4)], dtype=np.uint8)


def oasis():
    rng = np.random.default_rng(1829)
    ys, xs = np.mgrid[0:S, 0:S]
    img = np.zeros((S, S, 3), np.uint8)
    # a white-hot sky over bone-pale sand
    dune = 26 + 3 * np.sin(xs / 9.0) + 2 * np.sin(xs / 4.3 + 1)
    sky = ys < dune
    t = np.clip(ys / 30.0, 0, 1)
    img[sky] = (np.array([250, 248, 238]) * (1 - t[sky, None]) + np.array([232, 222, 196]) * t[sky, None]).astype(np.uint8)
    sun = (xs - 47) ** 2 + (ys - 9) ** 2
    img[sun < 30] = hexrgb('#ffffff'); img[(sun >= 30) & (sun < 48) & sky] = hexrgb('#fff6dc')
    sand = ['#eadfc6', '#e2d4b6', '#d8c8a6', '#cdbb96']
    v = np.clip((ys - dune) / 38.0, 0, 1) * 3 + BAYER[ys % 4, xs % 4] * 0.9
    idx = np.clip(np.round(v), 0, 3).astype(int)
    pal = np.array([hexrgb(p) for p in sand])
    ground = ys >= dune
    img[ground] = pal[idx[ground]]
    # the pool: a small, bright, very blue oval with a wet rim
    d = ((xs - 30) / 17.0) ** 2 + ((ys - 46) / 7.0) ** 2
    img[(d < 1.25) & (d >= 1.0)] = hexrgb('#b8a77e')
    img[d < 1.0] = hexrgb('#4fb3c9'); img[d < 0.55] = hexrgb('#2f8fb0')
    img[(d < 0.5) & ((xs + ys) % 7 == 0)] = hexrgb('#bfeaf2')
    # two palms
    def palm(x0, y0, h, lean):
        for k in range(h):
            x = int(round(x0 + lean * k * k / (h * 1.0))); y = y0 - k
            img[y, x] = hexrgb('#8a6a42'); img[y, x + 1] = hexrgb('#6e5232')
            if k % 3 == 0: img[y, x] = hexrgb('#a7845a')
        tx, ty = int(round(x0 + lean * h)), y0 - h
        for ang in (-2.8, -2.3, -1.8, -1.3, -0.8, -0.3, 0.2):
            for r in range(1, 13):
                x = int(round(tx + math.cos(ang) * r)); y = int(round(ty + math.sin(ang) * r * 0.55 + (r * r) / 22.0))
                if 0 <= x < S and 0 <= y < S:
                    img[y, x] = hexrgb('#3f8a3a' if r < 7 else '#5aa548')
                    if y + 1 < S and r < 10: img[y + 1, x] = hexrgb('#2f6a2c')
        img[ty:ty + 2, tx:tx + 2] = hexrgb('#6e5232')
    palm(17, 45, 26, 0.3); palm(42, 43, 20, -0.2)
    # a bleached skull at the water's edge, and pebbles
    for (x, y) in [(50, 52), (51, 52), (52, 52), (50, 53), (52, 53), (51, 54)]: img[y, x] = hexrgb('#fbf8ef')
    img[53, 51] = hexrgb('#6b5a42')
    for _ in range(14):
        x, y = int(rng.integers(2, S - 2)), int(rng.integers(40, S - 1))
        if d[y, x] > 1.3: img[y, x] = hexrgb('#bfae88')
    # soft dark frame so it reads as a card portrait
    f = 1 - 0.18 * np.clip((np.sqrt(((xs - S / 2) / (S / 2)) ** 2 + ((ys - S / 2) / (S / 2)) ** 2) - 0.85) / 0.55, 0, 1)
    img = (img * np.round(f * 6)[..., None] / 6).astype(np.uint8)
    out = Image.fromarray(img, 'RGB').resize((128, 128), Image.NEAREST)
    buf = io.BytesIO(); out.save(buf, format='PNG', optimize=True)
    return 'data:image/png;base64,' + base64.b64encode(buf.getvalue()).decode('ascii')


if __name__ == '__main__':
    p = os.path.join(ROOT, 'canonical', 'characters.json')
    chars = json.load(open(p, encoding='utf-8'))
    ch = next((c for c in chars if c.get('id') == 'last-oasis'), None)
    if ch is None: raise SystemExit('canonical/characters.json has no last-oasis')
    ch['art'] = oasis()
    with open(p, 'w', encoding='utf-8') as fh: fh.write(json.dumps(chars, indent=2, ensure_ascii=False) + '\n')
    print('wrote The Last Oasis art,', len(ch['art']) // 1024, 'KB')
