#!/usr/bin/env python3
"""The Arena's day-rule Environment cards get scenes of their own (2026-10-18).

Until now Lumber Rush, Timber Fair, Midsummer, Dusk, Restless, First Blood, Double Time and Collapse borrowed other cards'
pictures, and Leylines I, II and III shared one. This paints each its own scene in code (Pillow + numpy, no art credits),
in the pixel style of the painted field art: a 128x128 painting with flat, outlined shapes, banded dithered skies and
light from one side, shown at 256x256 with crisp 2x pixels and squeezed to a small palette. Deterministic; re-run any time.

    python3 tools/make_field_art_2026_10_18.py              -> all eleven scenes in art/fields/
    python3 tools/make_field_art_2026_10_18.py dusk collapse -> just those

Scenes: lumberrush, timberfair, midsummer, dusk, restless, firstblood, doubletime, collapse, leylines1, leylines2, leylines3.
"""
import os, sys, math
import numpy as np
from PIL import Image, ImageDraw, ImageFilter
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import make_map_backgrounds as M

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
OUT = os.path.join(ROOT, 'art', 'fields')
N = 128                       # painted at 128x128, shown at 256x256
YS, XS = np.mgrid[0:N, 0:N]
BAY = M.BAYER[YS % 4, XS % 4]


# ---------------------------------------------------------------- toolkit
def C(h):
    return np.array(M.hexrgb(h), np.float32)


def canvas():
    return np.zeros((N, N, 3), np.float32)


def fill(img, mask, color):
    img[mask] = C(color) if isinstance(color, str) else color


def _mask(draw_fn):
    im = Image.new('L', (N, N), 0)
    draw_fn(ImageDraw.Draw(im))
    return np.array(im) > 0


def ell(cx, cy, rx, ry=None):
    ry = rx if ry is None else ry
    return _mask(lambda d: d.ellipse([cx - rx, cy - ry, cx + rx, cy + ry], fill=255))


def poly(pts):
    return _mask(lambda d: d.polygon([tuple(p) for p in pts], fill=255))


def rect(x0, y0, x1, y1):
    return _mask(lambda d: d.rectangle([x0, y0, x1, y1], fill=255))


def line(pts, w=1):
    return _mask(lambda d: d.line([tuple(p) for p in pts], fill=255, width=w))


def dilate(m, k=1):
    out = m.copy()
    for _ in range(k):
        p = np.pad(out, 1)
        out = p[1:-1, 1:-1] | p[:-2, 1:-1] | p[2:, 1:-1] | p[1:-1, :-2] | p[1:-1, 2:]
    return out


def shift(m, dx, dy):
    out = np.zeros_like(m)
    ys0, ys1 = max(0, dy), N + min(0, dy)
    xs0, xs1 = max(0, dx), N + min(0, dx)
    out[ys0:ys1, xs0:xs1] = m[ys0 - dy:ys1 - dy, xs0 - dx:xs1 - dx]
    return out


def outlined(img, m, outline, body):
    fill(img, dilate(m) & ~m, outline); fill(img, m, body)


def vgrad(img, stops, y0, y1, mask=None, strength=0.9):
    """A banded, ordered-dithered vertical gradient from stops[0] at y0 to stops[-1] at y1."""
    f = np.clip((YS - y0) / max(1, (y1 - y0)), 0, 1)
    g = M.dither_palette(f, stops, strength).astype(np.float32)
    m = (YS >= y0) & (YS <= y1) if mask is None else mask
    img[m] = g[m]


def field_grad(img, f, stops, mask, strength=0.9):
    g = M.dither_palette(np.clip(f, 0, 1), stops, strength).astype(np.float32)
    img[mask] = g[mask]


def glow(img, cx, cy, r, color, amt=0.8, steps=4, power=1.6, mask=None):
    """A soft light in stepped, dithered bands (so it stays pixel art)."""
    d = np.sqrt((XS - cx) ** 2 + (YS - cy) ** 2) / r
    f = np.clip(1 - d, 0, 1) ** power
    q = np.clip(np.floor(f * steps + BAY * 0.9 + 0.5) / steps, 0, 1) * amt
    if mask is not None:
        q = q * mask
    img[:] = img * (1 - q[..., None]) + C(color) * q[..., None]


def mask_glow(img, m, radius, color, amt=0.8, steps=4):
    """Glow around a mask: blur it with Pillow, then step and dither the falloff."""
    im = Image.fromarray((m * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(radius))
    f = np.clip(np.array(im, np.float32) / 255 * 2.2, 0, 1)
    q = np.clip(np.floor(f * steps + BAY * 0.9 + 0.5) / steps, 0, 1) * amt
    img[:] = img * (1 - q[..., None]) + C(color) * q[..., None]


def ridge(rng, base, amp, cell, x0=0, x1=N):
    n = M.value_noise(rng, N, 2, cell)[0]
    h = base - amp * n
    return h


def below(h):
    return YS >= h[XS]


def hill(img, h, stops, depth=24, rim=None, strength=0.9):
    m = below(h)
    field_grad(img, (YS - h[XS]) / depth, stops, m, strength)
    if rim:
        fill(img, m & ~shift(m, 0, 1), rim)
    return m


def stars(img, rng, n, colors, ymax, mask=None):
    for _ in range(n):
        x, y = int(rng.integers(0, N)), int(rng.integers(0, ymax))
        if mask is not None and not mask[y, x]:
            continue
        c = colors[int(rng.integers(0, len(colors)))]
        img[y, x] = C(c)
        if rng.random() < 0.08 and 1 <= x < N - 1 and 1 <= y < N - 1:
            for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                img[y + dy, x + dx] = img[y + dy, x + dx] * 0.5 + C(c) * 0.5


def cloud(img, cx, cy, w, light, mid, dark, rng):
    """A puffy cloud with a flat underside, lit from above."""
    m = np.zeros((N, N), bool)
    k = max(3, int(w / 5))
    for i in range(k):
        t = i / (k - 1) - 0.5
        r = (w * 0.22) * (1 - abs(t) * 0.9) + rng.random() * 2
        m |= ell(cx + t * w * 0.8, cy - r * 0.4, r, r * 0.8)
    m &= YS <= cy + 1
    fill(img, m, dark)
    fill(img, m & (YS <= cy - 1), mid)
    top = m & ~shift(m, 0, 2)
    fill(img, top & (YS <= cy - 2), light)
    return m


def streak_cloud(img, cx, cy, w, h, light, dark):
    m = ell(cx, cy, w, h)
    fill(img, m, dark)
    fill(img, m & ~shift(m, 0, -1) , light)  # lit underside / rim
    return m


def round_tree(img, x, yb, r, pal, rng, lean=0):
    """pal: outline, dark, mid, light, trunk. Canopy of a few blobs, trunk below; lit from the upper left."""
    ol, dk, md, lt, tr = pal
    tw = max(1, int(r / 3))
    trunk = rect(x - tw // 2, yb - r, x + tw // 2 + (tw > 1) * 0, yb)
    outlined(img, trunk, ol, tr)
    cy = yb - r * 1.5
    m = np.zeros((N, N), bool)
    for dx, dy, rr in ((0, 0, 1.0), (-0.55, 0.25, 0.7), (0.55, 0.25, 0.7), (0, -0.45, 0.72)):
        m |= ell(x + dx * r + lean * (0.5 - dy), cy + dy * r, r * rr)
    fill(img, dilate(m) & ~m, ol)
    fill(img, m, dk)
    fill(img, m & shift(m, 1, 1) & shift(m, 2, 2) & ~shift(m, -1, -2) | (m & ~shift(m, 2, 2)), md)
    fill(img, m & ~shift(m, 1, 2) & (XS < x + lean + r * 0.3), lt)
    # leaf speckle
    for _ in range(int(r * r * 0.4)):
        px, py = int(x + lean + (rng.random() - 0.5) * 2 * r), int(cy + (rng.random() - 0.6) * 2 * r)
        if 0 <= px < N and 0 <= py < N and m[py, px]:
            img[py, px] = C(md) if rng.random() < 0.6 else C(lt)
    return m


def pine(img, x, yb, h, pal, snow=None):
    ol, dk, md, lt, tr = pal
    trunk = rect(x - 1, yb - max(2, h // 6), x, yb)
    fill(img, trunk, tr)
    m = np.zeros((N, N), bool)
    tiers = 3 if h > 14 else 2
    for i in range(tiers):
        top = yb - h + i * h * 0.25
        bot = yb - h * 0.15 - (tiers - 1 - i) * h * 0.18
        hw = h * (0.22 + 0.1 * i)
        m |= poly([(x, top), (x - hw, bot), (x + hw, bot)])
    fill(img, dilate(m) & ~m, ol)
    fill(img, m, dk)
    fill(img, m & (XS < x), md)
    fill(img, m & ~shift(m, 1, 1) & (XS <= x), lt)
    return m


def tufts(img, rng, n, mask, dark, light, lean=0, ymin=0, tall=2):
    for _ in range(n):
        x, y = int(rng.integers(1, N - 1)), int(rng.integers(ymin, N))
        if not mask[y, x]:
            continue
        s = 1 + int((y / N) * tall)
        for j in range(s + 1):
            xx = x + int(round(lean * j / max(1, s)))
            if 0 <= xx < N and 0 <= y - j < N:
                img[y - j, xx] = C(dark if j < s else light)


def dots(img, rng, n, mask, colors, ymin=0, big_from=None):
    for _ in range(n):
        x, y = int(rng.integers(0, N - 1)), int(rng.integers(ymin, N - 1))
        if not mask[y, x]:
            continue
        c = C(colors[int(rng.integers(0, len(colors)))])
        img[y, x] = c
        if big_from is not None and y > big_from:
            img[y, x + 1] = c
            if y > big_from + 18:
                img[y - 1, x] = c * 0.8 + 255 * 0.2


def vignette(img, amt):
    """Darken the corners in dithered steps (plain stepped bands read as rings on flat skies)."""
    d = np.sqrt(((XS - N / 2) / (N / 2)) ** 2 + ((YS - N / 2) / (N / 2)) ** 2)
    f = np.clip(d - 0.75, 0, 1) / 0.65
    q = np.clip(np.floor(f * 4 + BAY * 0.95 + 0.5) / 4, 0, 1) * amt
    img[:] = img * (1 - q[..., None])


def finish(img, amt=0.35):
    vignette(img, amt)
    out = np.clip(img, 0, 255).astype(np.uint8)
    return Image.fromarray(out, 'RGB').resize((N * 2, N * 2), Image.NEAREST)


# ---------------------------------------------------------------- scenes
def s_midsummer(rng):  # high sun over a flowering meadow
    img = canvas()
    vgrad(img, ['#2f7fd6', '#4a98e4', '#6cb4ee', '#9ad0f4', '#cfe9f2'], 0, 70)
    glow(img, 64, 20, 70, '#fff6c8', amt=0.75, steps=5, power=1.4)
    for a in range(12):  # rays
        ang = a * math.pi / 6 + 0.13
        p0 = (64 + math.cos(ang) * 13, 20 + math.sin(ang) * 13)
        p1 = (64 + math.cos(ang) * (22 + 6 * (a % 2)), 20 + math.sin(ang) * (22 + 6 * (a % 2)))
        r = line([p0, p1], 1) & ((XS + YS) % 2 == 0)
        fill(img, r & (YS < 66), '#fff4b0')
    fill(img, ell(64, 20, 11), '#ffd23a'); fill(img, ell(64, 20, 9), '#ffec7a'); fill(img, ell(63, 19, 6), '#fffbe0')
    cloud(img, 18, 30, 22, '#ffffff', '#eef6fa', '#c8dcec', rng)
    cloud(img, 108, 40, 18, '#ffffff', '#eef6fa', '#c8dcec', rng)
    h0 = ridge(rng, 70, 4, 24)
    m0 = hill(img, h0, ['#4f8a52', '#45804a'], 6)
    for x in range(-2, N + 4, 5):  # far treeline
        r = 3 + rng.random() * 2
        b = ell(x, h0[min(N - 1, max(0, x))] - 1, r, r * 0.8)
        fill(img, b, '#3c7444'); fill(img, b & ~shift(b, 1, 1), '#5a9658')
    h1 = ridge(rng, 80, 7, 40)
    m1 = hill(img, h1, ['#a8dc5a', '#8ccc4a', '#76bc40'], 14, rim='#c4ec74')
    h2 = ridge(rng, 96, 9, 48)
    m2 = hill(img, h2, ['#86c846', '#6cb43c', '#58a034', '#468a2c', '#3a7826'], 36, rim='#a4dc5c')
    round_tree(img, 104, 92, 9, ('#1e3a1c', '#2e5a28', '#447e34', '#62a444', '#5a3a22'), rng)
    fill(img, ell(104, 93, 8, 1.6) & m2, '#3e7a28')  # noon: a short shadow right under it
    dots(img, rng, 220, m1, ['#ffe04a', '#ffffff', '#f6a8c8'], 0)
    dots(img, rng, 700, m2, ['#ffe04a', '#ffe04a', '#ffffff', '#e8443a', '#b07ad8', '#ff9a3a'], 0, big_from=104)
    tufts(img, rng, 500, m2, '#3c7426', '#9ad458', ymin=96, tall=4)
    return finish(img, 0.25)


def s_dusk(rng):  # a violet sunset over a still lake
    img = canvas()
    sky = ['#160f32', '#22144a', '#33195e', '#4a2274', '#66298a', '#86339a', '#a8429e', '#cc5aa0', '#ea7a9a', '#f8a48c']
    vgrad(img, sky, 0, 80)
    stars(img, rng, 40, ['#d8c8ff', '#ffffff'], 30)
    glow(img, 78, 76, 60, '#ff9ab0', amt=0.55, steps=5)
    fill(img, ell(78, 76, 13) & (YS <= 76), '#ffc8a0'); fill(img, ell(78, 76, 10) & (YS <= 76), '#ffe0c0')
    for cx, cy, w in ((30, 46, 26), (96, 36, 22), (60, 58, 30), (112, 60, 16), (14, 64, 14)):
        streak_cloud(img, cx, cy, w, 2.2, '#f08aa8', '#4a2070')
    h = ridge(rng, 76, 8, 28)
    m = below(h) & (YS <= 77)
    fill(img, m, '#3a1d5c'); fill(img, m & (XS % 2 == YS % 2) & (YS > 74), '#2e1650')
    h2 = ridge(rng, 78, 5, 18)
    m2 = below(h2) & (YS <= 78) & (XS < 50)
    fill(img, m2, '#28123f')
    # the lake mirrors the sky, darker, broken by ripple lines
    lake = (YS > 78) & (YS < 112)
    src = np.clip(156 - YS, 0, 78)
    refl = img[src, XS] * 0.85 + C('#2a1446') * 0.15
    img[lake] = refl[lake]
    for y in range(80, 112, 2):
        for x in range(0, N, 1):
            if (x * 7 + y * 13) % 11 < 3:
                img[y, x] = img[y, x] * 0.8 + C('#ffb0c0') * 0.2
    for y in range(79, 108):  # the sun's broken path
        wv = int(7 - (y - 79) * 0.15)
        for x in range(78 - wv, 78 + wv):
            if (x + y * 3) % 4 < 2 and y % 2 == 0:
                img[y, x] = C('#ffd0b0') if abs(x - 78) < wv * 0.5 else C('#f08aa8')
    # near shore, reeds and a tree in silhouette
    hs = ridge(rng, 108, 4, 20)
    shore = below(hs)
    fill(img, shore, '#170b28'); fill(img, shore & ~shift(shore, 0, 1), '#3a1a50')
    for i in range(40):
        x = int(rng.integers(0, N)); hh = int(4 + rng.random() * 10)
        fill(img, line([(x, hs[x]), (x + rng.random() * 2 - 1, hs[x] - hh)], 1), '#120820')
    t = round_tree(img, 14, 108, 11, ('#0e0618', '#160a26', '#1a0c2c', '#2a1440', '#0e0618'), rng)
    round_tree(img, 116, 110, 8, ('#0e0618', '#160a26', '#1a0c2c', '#2a1440', '#0e0618'), rng)
    return finish(img, 0.35)


def s_restless(rng):  # wind-tossed trees at night
    img = canvas()
    vgrad(img, ['#05081a', '#0a1028', '#101a38', '#172548', '#1f3156'], 0, 104)
    stars(img, rng, 60, ['#c8d8ff', '#ffffff'], 70)
    glow(img, 92, 22, 46, '#8aa4d8', amt=0.5, steps=4)
    fill(img, ell(92, 22, 7), '#c8d4ee'); fill(img, ell(91, 21, 5), '#e4ecfa')
    # torn clouds racing across, one over the moon
    for cx, cy, w, h in ((98, 28, 22, 3.5), (40, 18, 30, 3), (70, 40, 34, 3), (16, 50, 20, 2.5), (112, 56, 18, 2.5), (54, 62, 26, 2)):
        m = ell(cx, cy, w, h) | ell(cx + w * 0.4, cy - h * 0.6, w * 0.5, h * 0.8)
        fill(img, m, '#1c2a4a'); fill(img, m & ~shift(m, 0, -1), '#4a6494'); fill(img, m & ~shift(m, 2, 0) & (XS < cx), '#2c3e66')
    for i in range(9):  # wind lines
        y0 = 10 + i * 9 + rng.random() * 4; x0 = rng.random() * 70
        pts = [(x0 + t * 5, y0 + math.sin(t * 0.7 + i) * 2) for t in range(int(6 + rng.random() * 6))]
        fill(img, line(pts, 1) & ((XS + i) % 3 != 0), '#5a76a8')
    h = ridge(rng, 92, 10, 40)
    gm = hill(img, h, ['#1a3236', '#142a2c', '#0f2224', '#0a1a1c'], 30, rim='#2e5a54')
    pal = ('#040c0c', '#0c2422', '#163a34', '#28604e', '#1a120e')
    for (x, r) in ((10, 12), (52, 10), (88, 13)):
        yb = int(h[x]) + 3
        tr = line([(x, yb), (x + 1, yb - r * 0.8), (x + 4, yb - r * 1.5), (x + 9, yb - r * 2.0)], max(2, r // 4))
        outlined(img, tr, pal[0], pal[4])
        m = np.zeros((N, N), bool)
        cy = yb - r * 2.3
        for dx, dy, rr in ((0.6, 0, 1.0), (1.4, 0.15, 0.75), (2.0, 0.3, 0.5), (0.0, 0.25, 0.55), (1.0, -0.45, 0.6)):
            m |= ell(x + dx * r, cy + dy * r, rr * r * 1.25, rr * r * 0.7)
        for k in range(14):  # a ragged downwind edge
            aa = rng.random() * math.pi - math.pi / 2
            m |= ell(x + r * 1.2 + math.cos(aa) * r * 1.2, cy + math.sin(aa) * r * 0.6, r * 0.25, r * 0.18)
        for k in range(5):  # leaves streaming off downwind
            m |= ell(x + r * (2.5 + 0.4 * k), cy + r * (0.15 * k) - 1, r * 0.25 * (1 - k * 0.15), r * 0.12)
        fill(img, dilate(m) & ~m, pal[0]); fill(img, m, pal[1])
        fill(img, m & ~shift(m, -2, 2), pal[2])
        fill(img, m & ~shift(m, -1, 2) & (XS > x), pal[3]); fill(img, m & ~shift(m, 0, 1) & (XS > x + r * 0.3), '#4a9a7c')
    tufts(img, rng, 420, gm, '#0c2422', '#2e6252', lean=3, ymin=84, tall=5)
    for _ in range(70):  # flying leaves, mostly up in the wind
        x, y = int(rng.integers(0, N - 2)), int(rng.integers(8, 100))
        c = C('#4a9a70') if rng.random() < 0.6 else C('#c8a048')
        img[y, x] = c; img[y, x + 1] = c * 0.6
    return finish(img, 0.4)


def s_firstblood(rng):  # one red banner on a dawn field
    img = canvas()
    vgrad(img, ['#3a4878', '#56609a', '#8478ac', '#b888a8', '#e0a49c', '#f4c48e', '#fde2b0'], 0, 80)
    glow(img, 34, 80, 58, '#ffe2a8', amt=0.6, steps=5)
    fill(img, ell(34, 80, 9) & (YS <= 80), '#ffe6b0'); fill(img, ell(34, 80, 7) & (YS <= 80), '#fff6dc')
    for cx, cy, w in ((80, 30, 30), (20, 44, 20), (110, 52, 18), (58, 60, 24)):
        streak_cloud(img, cx, cy, w, 2, '#ffd0a0', '#9a7aa8')
    h0 = ridge(rng, 80, 5, 30)
    fill(img, below(h0) & (YS < 84), '#7a76a0')
    h1 = ridge(rng, 84, 3, 40)
    field = hill(img, h1, ['#a0a87a', '#7e9058', '#647c44', '#506a38', '#40582e', '#344a26'], 44)
    mist = (YS > 82) & (YS < 92)
    img[mist & (BAY > -0.1)] = img[mist & (BAY > -0.1)] * 0.55 + C('#f4e2c8') * 0.45
    # the pole, its finial and the swallow-tailed banner streaming right
    px, top, base = 70, 30, 106
    pole = rect(px - 1, top, px, base)
    outlined(img, pole, '#2a1a10', '#7a5230'); fill(img, pole & (XS == px - 1), '#a8784a')
    fill(img, ell(px - 0.5, top - 2, 2.5), '#7a5a1a'); fill(img, ell(px - 0.5, top - 2, 1.6), '#f0c850')
    cross = rect(px - 4, top + 3, px + 34, top + 4)
    outlined(img, cross & (XS >= px), '#2a1a10', '#6a4628')
    pts_top, pts_bot = [], []
    L = 33
    for i in range(L + 1):
        x = px + 1 + i
        wv = math.sin(i / L * math.pi * 1.6) * 2.4 * (i / L)
        pts_top.append((x, top + 5 + wv))
        pts_bot.append((x, top + 46 + wv - (12 * (i / L) if i > L * 0.6 else 0) * 0))
    tail = [(px + 1 + L, top + 46), (px + 1 + L - 9, top + 37), (px + 1, top + 46)]
    ban = poly(pts_top + [(px + 1 + L, top + 46 + math.sin(1.6 * math.pi) * 2.4), (px + 1 + L - 9, top + 37 + 1.2), (px + 1, top + 46)])
    fill(img, dilate(ban) & ~ban & ~pole, '#3a0610')
    fill(img, ban, '#a8182a')
    folds = np.sin((XS - px) / L * math.pi * 3.2) > 0.35
    fill(img, ban & folds, '#c82838')
    fill(img, ban & ~shift(ban, 1, 0) | (ban & ~shift(ban, 0, 1)), '#e85058')
    fill(img, ban & (np.sin((XS - px) / L * math.pi * 3.2) < -0.6), '#821020')
    trim = ban & ~shift(ban, 0, -2) & shift(ban, 0, 3)
    fill(img, ban & (YS <= top + 7) & (YS >= top + 6), '#e0b040')
    # long dawn shadow of the pole, and stones at its foot
    fill(img, line([(px, base), (px + 40, base + 10)], 2) & field, '#2c4020')
    for dx, r in ((-4, 2.5), (3, 2), (-1, 1.6)):
        s = ell(px + dx, base + 1, r, r * 0.7)
        outlined(img, s, '#3a3530', '#8a8278'); fill(img, s & ~shift(s, 1, 1), '#b8b0a0')
    tufts(img, rng, 520, field, '#2e4422', '#a8b070', lean=1, ymin=90, tall=4)
    dots(img, rng, 120, field & (YS > 92), ['#fff0d0', '#e8d8f0'], 0)  # dew
    return finish(img, 0.3)


def hourglass(img, cx, yb, h, frac):
    """Wooden caps and posts, two glass bulbs, sand running from the top to the bottom pile (frac = share still on top)."""
    w = h * 0.36
    cap_h = 3
    top_y, bot_y = yb - h, yb
    for y0 in (top_y, bot_y - cap_h):
        cap = rect(cx - w - 2, y0, cx + w + 2, y0 + cap_h)
        outlined(img, cap, '#24120a', '#7a4a22'); fill(img, cap & (YS == y0), '#b47a3e')
    g0, g1, mid = top_y + cap_h + 1, bot_y - cap_h - 1, (top_y + bot_y) / 2
    gl = poly([(cx - w, g0), (cx + w, g0), (cx + 1, mid), (cx + w, g1), (cx - w, g1), (cx - 1, mid)])
    fill(img, dilate(gl) & ~gl, '#4a6a80')
    img[gl] = img[gl] * 0.55 + C('#a8d8ec') * 0.45
    # sand: what's left on top, the stream, the pile
    st = g0 + (mid - g0) * (1 - frac)
    top_sand = gl & (YS >= st) & (YS < mid)
    fill(img, top_sand, '#e0b450'); fill(img, top_sand & (YS == int(st) + 0), '#f4d27a')
    fill(img, rect(cx, mid, cx, g1 - 3), '#f0c860')
    pile = gl & (YS > g1 - (g1 - mid) * (1 - frac) * 0.7) & (np.abs(XS - cx) < (YS - (g1 - (g1 - mid) * 0.7)) * 1.6 + 4)
    fill(img, pile, '#d8a844'); fill(img, pile & ~shift(pile, 0, 1), '#f4d27a')
    # glass shine
    fill(img, gl & (XS == int(cx - w * 0.55)) & (np.abs(YS - (g0 + 5)) < 4), '#eaf8ff')
    fill(img, gl & (XS == int(cx - w * 0.55)) & (np.abs(YS - (g1 - 6)) < 3), '#eaf8ff')
    for sx in (cx - w - 1, cx + w + 1):  # posts
        p = rect(sx - 0.5, top_y + cap_h, sx + 0.5, bot_y - cap_h)
        outlined(img, p, '#24120a', '#8a5a2a')


def s_doubletime(rng):  # twin hourglasses under a great clock ring
    img = canvas()
    vgrad(img, ['#070c22', '#0c1630', '#12203e', '#18304e', '#1e3e5a'], 0, 98)
    stars(img, rng, 50, ['#a8c0e8', '#ffe8a8'], 90)
    cx, cy, R = 64, 50, 42
    glow(img, cx, cy, R * 1.2, '#2a5480', amt=0.5, steps=4)
    d = np.sqrt((XS - cx) ** 2 + (YS - cy) ** 2)
    fill(img, (d > R - 1.5) & (d < R + 1.5), '#c89838')
    fill(img, (d > R - 0.5) & (d < R + 0.5), '#f0cc60')
    fill(img, (d > R - 6) & (d < R - 5) & ((XS + YS) % 2 == 0), '#7a6a40')
    ang = np.arctan2(YS - cy, XS - cx)
    for k in range(12):  # tick marks, no numerals
        a = -math.pi / 2 + k * math.pi / 6
        ln = 7 if k % 3 == 0 else 4
        fill(img, line([(cx + math.cos(a) * (R - 2), cy + math.sin(a) * (R - 2)), (cx + math.cos(a) * (R - 2 - ln), cy + math.sin(a) * (R - 2 - ln))], 2 if k % 3 == 0 else 1), '#f0cc60')
    for a, ln, c in ((-math.pi / 2, 30, '#f0cc60'), (-math.pi / 2 + math.pi * 0.62, 22, '#c89838'), (-math.pi / 2 + math.pi * 1.04, 30, '#5a7ab0'), (-math.pi / 2 + math.pi * 1.66, 22, '#5a7ab0')):
        fill(img, line([(cx, cy), (cx + math.cos(a) * ln, cy + math.sin(a) * ln)], 2), c)
    fill(img, ell(cx, cy, 3), '#f0cc60'); fill(img, ell(cx, cy, 1.5), '#fff2c0')
    for gx, gy, gr in ((10, 12, 9), (120, 86, 11)):  # faint gears
        g = (np.sqrt((XS - gx) ** 2 + (YS - gy) ** 2) < gr) & ((np.sqrt((XS - gx) ** 2 + (YS - gy) ** 2) > gr * 0.45))
        teeth = (np.abs(np.sqrt((XS - gx) ** 2 + (YS - gy) ** 2) - gr - 1) < 1.5) & (np.sin(np.arctan2(YS - gy, XS - gx) * 8) > 0.2)
        img[g | teeth] = img[g | teeth] * 0.7 + C('#3a5070') * 0.3
    # the stone ledge they stand on
    ledge = YS >= 98
    field_grad(img, (YS - 98) / 30, ['#5a4c68', '#463a54', '#362c44', '#2a2236'], ledge)
    fill(img, (YS == 98), '#7a6a8a')
    for y in range(103, N, 7):
        fill(img, (YS == y), '#2a2236')
        off = 0 if (y // 7) % 2 else 8
        fill(img, (YS > y) & (YS < y + 7) & ((XS + off) % 16 == 0), '#2a2236')
    hourglass(img, 38, 98, 46, 0.6)
    hourglass(img, 90, 98, 46, 0.35)
    for x, y in ((38, 98), (90, 98)):
        glow(img, x, y - 20, 22, '#f0cc60', amt=0.25, steps=3)
    for _ in range(40):  # drifting gold motes
        x, y = int(rng.integers(0, N)), int(rng.integers(10, 96))
        img[y, x] = C('#ffe08a')
    return finish(img, 0.35)


def s_collapse(rng):  # a cliff edge breaking away into a gorge
    img = canvas()
    vgrad(img, ['#4a5e86', '#5e7aa0', '#7a96b8', '#9ab2c8', '#bccad4'], 0, 62)
    cloud(img, 26, 18, 26, '#e8eef4', '#c8d4e0', '#9aaabc', rng)
    cloud(img, 104, 12, 20, '#e8eef4', '#c8d4e0', '#9aaabc', rng)
    hm = ridge(rng, 56, 16, 22)
    fill(img, below(hm), '#7084a4'); fill(img, below(hm) & ~shift(below(hm), -1, 1), '#94a6be')
    hm2 = ridge(rng, 62, 6, 16)
    fill(img, below(hm2), '#5e6e8e')
    # the gorge: hazy far wall on the right, dark depths below a mist band
    gorge = YS > 62
    field_grad(img, (YS - 62) / 66, ['#56607a', '#40465e', '#2c2e44', '#1c1a2c', '#100e1a'], gorge)
    fx = 104 + M.value_noise(rng, 2, N, 10)[:, 0] * 8 - (np.arange(N) - 62) * 0.12
    far = (XS > fx[YS]) & (YS > 60)
    field_grad(img, (YS - 60) / 68, ['#6a7690', '#56607a', '#454c64', '#363a50'], far)
    fill(img, far & (YS < 63), '#6e8a6a')
    for y in range(68, N, 7):
        fill(img, far & (YS == y + (XS // 7) % 2), '#3e4458')
    mist = (YS > 92) & (YS < 104)
    img[mist & (BAY > 0.05)] = img[mist & (BAY > 0.05)] * 0.6 + C('#8a90a8') * 0.4
    # the near cliff in profile: a grass lip over a rock face that is undercut where it is giving way
    ex = 62 + M.value_noise(rng, 2, N, 5)[:, 0] * 6 - np.clip(np.arange(N) - 58, 0, 30) * 0.35 + np.clip(np.arange(N) - 88, 0, 99) * 0.25
    cliff = (XS < ex[YS]) & (YS >= 54)
    field_grad(img, (YS - 54) / 74 + XS / 160, ['#b09a80', '#9a846c', '#826e5a', '#6a5848', '#54463a'], cliff)
    for y in range(64, N, 7):  # strata
        fill(img, cliff & (YS == y + ((XS // 9) % 2)), '#4a3c32')
    grass = cliff & (YS < 59)
    fill(img, grass, '#5ea044'); fill(img, grass & (YS == 54), '#8ad064'); fill(img, cliff & (YS == 59), '#3e6a2c')
    fill(img, dilate(cliff) & ~cliff & (XS > 20), '#241a16')
    fill(img, line([(50, 55), (52, 64), (49, 76), (52, 90), (50, 104)], 1) & cliff, '#1a1210')  # the next crack, already open
    # the slab breaking away: a block of lip and rock tipping out into the gorge
    ang = math.radians(28); px0, py0 = 60, 82  # pivot at its foot

    def rot(pts):
        return [(px0 + (x - px0) * math.cos(ang) - (y - py0) * math.sin(ang), py0 + (x - px0) * math.sin(ang) + (y - py0) * math.cos(ang)) for x, y in pts]
    bw, top_y = 15, 52
    blk = poly(rot([(px0, top_y), (px0 + bw, top_y), (px0 + bw - 2, py0), (px0, py0)]))
    cap = poly(rot([(px0, top_y), (px0 + bw, top_y), (px0 + bw, top_y + 4), (px0, top_y + 4)]))
    wedge = poly([(px0 - 3, 54), (rot([(px0, top_y)])[0][0] + 1, rot([(px0, top_y)])[0][1]), (px0 + 1, py0 - 2)])
    fill(img, wedge & ~blk, '#120c0a')
    fill(img, dilate(blk) & ~blk, '#1e1614')
    field_grad(img, (XS - 60) / 34 + (YS - 50) / 80, ['#b8a288', '#9a846c', '#7e6a56', '#62503e'], blk)
    for k in range(3):
        st = line(rot([(px0, top_y + 12 + k * 8), (px0 + bw - 1, top_y + 12 + k * 8)]), 1)
        fill(img, st & blk, '#4a3c32')
    fill(img, cap & blk, '#5ea044'); fill(img, cap & blk & ~shift(cap, 1, 1), '#8ad064')
    for t in range(4):  # tufts still clinging to the falling lip
        x, y = rot([(px0 + 2 + t * 4, top_y)])[0]
        fill(img, line([(x, y), (x + 1, y - 2)], 1), '#8ad064')
    # rubble falling, smaller and hazier the farther down; a few dust plumes
    for i in range(22):
        t = rng.random()
        x, y, r = 66 + rng.random() * 26 + t * 6, 74 + t * 52, 3.2 - t * 2.0 + rng.random() * 0.8
        rk = ell(x, y, r, r * 0.8)
        outlined(img, rk, '#1e1614', '#7a6452'); fill(img, rk & ~shift(rk, 1, 1), '#a89078')
    for i in range(7):
        x, y, r = 64 + rng.random() * 26, 66 + rng.random() * 40, 4 + rng.random() * 4
        dm = ell(x, y, r, r * 0.6)
        sel = dm & (BAY > 0.05)
        img[sel] = img[sel] * 0.5 + C('#c4b6a2') * 0.5
    for _ in range(80):
        x, y = int(62 + rng.random() * 34), int(60 + rng.random() * 68)
        if y < N and x < N:
            img[y, x] = C('#c8b8a0')
    tufts(img, rng, 120, grass, '#3a7030', '#a4dc78', ymin=54)
    for x, y in ((14, 53), (30, 53), (38, 53)):  # a few flowers on the lip, still standing
        img[y, x] = C('#ffe04a')
    return finish(img, 0.3)


def log_end(img, x, y, r):
    m = ell(x, y, r)
    outlined(img, m, '#2e1a0c', '#6a4220')
    fill(img, ell(x - 0.3, y - 0.3, r - 1.2), '#d8aa68')
    d = np.sqrt((XS - x) ** 2 + (YS - y) ** 2)
    fill(img, (d < r - 1.2) & (np.abs((d % 2.6) - 1.3) < 0.4), '#b0804a')
    fill(img, ell(x, y, 0.8), '#8a5a30')


def s_lumberrush(rng):  # a sawmill in full swing
    img = canvas()
    vgrad(img, ['#5aa8e0', '#7ebeea', '#a6d4f0', '#cce6f2'], 0, 66)
    cloud(img, 92, 16, 24, '#ffffff', '#e4f0f8', '#b8d0e4', rng)
    pal_p = ('#0c2418', '#1a4028', '#28583a', '#3e7a4c', '#3a2414')
    for i, x in enumerate(range(-4, N + 6, 7)):  # pines behind, thinned out where they've been felled
        if 40 < x < 70 and i % 2:
            continue
        pine(img, x, 64 + int(rng.random() * 4), 22 + int(rng.random() * 10), pal_p)
    ground = YS >= 64
    field_grad(img, (YS - 64) / 64 + M.value_noise(rng, N, N, 8) * 0.25, ['#a08050', '#8a6a40', '#765a36', '#62482c'], ground)
    fill(img, ground & (YS == 64), '#b89868')
    for _ in range(14):  # sawdust drifts
        x, y, r = rng.random() * N, 70 + rng.random() * 56, 3 + rng.random() * 6
        sd = ell(x, y, r, r * 0.4)
        img[sd & (BAY > -0.15)] = C('#d8bc84')
    for x, y in ((56, 70), (64, 74)):  # stumps
        s = ell(x, y, 3, 1.4); st = rect(x - 3, y, x + 3, y + 3)
        outlined(img, st | s, '#2e1a0c', '#6a4220'); fill(img, s, '#d8aa68')
    # the mill: plank shed, roof, chimney smoke
    shed = rect(6, 44, 46, 86)
    outlined(img, shed, '#2a160a', '#8a5a30')
    fill(img, shed & ((XS // 3) % 2 == 0), '#7a4c26')
    fill(img, shed & (XS % 3 == 0), '#5a3418')
    roof = poly([(2, 46), (26, 28), (50, 46)])
    outlined(img, roof, '#1e0e06', '#6a3a22')
    fill(img, roof & (YS % 3 == 0), '#4e2a16'); fill(img, roof & ~shift(roof, 1, 1), '#94583a')
    door = rect(16, 60, 36, 86)
    fill(img, door, '#1e120a'); fill(img, door & (YS > 82), '#3a2614')
    chim = rect(36, 26, 40, 38); outlined(img, chim, '#1e1414', '#6a5a58')
    for i in range(6):
        sm = ell(40 + i * 4, 22 - i * 3, 2.5 + i * 0.7, 2 + i * 0.5)
        img[sm & (BAY > -0.3 + i * 0.05)] = img[sm & (BAY > -0.3 + i * 0.05)] * 0.4 + C('#e8eef2') * 0.6
    # the saw bench: a log feeding into a spinning blade, chips flying
    bench = rect(30, 82, 76, 86); outlined(img, bench, '#2a160a', '#8a5a30'); fill(img, bench & (YS == 82), '#b07a46')
    for lx in (32, 74):
        lg = rect(lx, 86, lx + 1, 96); fill(img, lg, '#5a3418')
    blade_c = (56, 78); br = 9
    d = np.sqrt((XS - blade_c[0]) ** 2 + (YS - blade_c[1]) ** 2)
    a = np.arctan2(YS - blade_c[1], XS - blade_c[0])
    teeth = (d < br + 1.5) & (np.sin(a * 14) > 0.1)
    blade = (d < br) | teeth
    blade &= YS < 83
    fill(img, blade, '#5a6470'); fill(img, (d < br - 1) & (YS < 83), '#b8c4ce'); fill(img, (d < br - 1) & (XS + YS < blade_c[0] + blade_c[1] - 3) & (YS < 83), '#dfe8ee')
    fill(img, (np.abs(d - 5) < 0.5) & (YS < 83), '#8a96a2'); fill(img, d < 1.5, '#4a5260')
    lgm = rect(62, 76, 92, 82)
    outlined(img, lgm, '#2e1a0c', '#7a4c26'); fill(img, lgm & (YS == 77), '#9a6a3a'); fill(img, lgm & (YS == 81), '#5a3418')
    for _ in range(46):  # chips and sawdust spray
        t = rng.random(); ang = -math.pi * (0.55 + rng.random() * 0.35)
        x, y = 50 + math.cos(ang) * (6 + t * 26), 74 + math.sin(ang) * (4 + t * 22)
        if 0 <= int(x) < N and 0 <= int(y) < N:
            img[int(y), int(x)] = C('#f0d8a0' if rng.random() < 0.6 else '#c89858')
    # the log pile, ends out
    for row, (n, y) in enumerate(((4, 120), (3, 111), (2, 102), (1, 93))):
        for i in range(n):
            log_end(img, 90 + (4 - n) * 5 + i * 10, y, 5)
    for x, y in ((14, 104), (26, 112)):  # a couple of logs lying in the yard
        lg = rect(x - 10, y - 3, x + 10, y + 3)
        outlined(img, lg, '#2e1a0c', '#7a4c26'); fill(img, lg & (YS == y - 2), '#9a6a3a')
        log_end(img, x + 10, y, 3.5)
    return finish(img, 0.3)


def stall(img, x, yb, w, stripe, rng):
    """A market stall: posts, a striped awning with a scalloped edge, a counter with goods."""
    h = 26
    for px in (x, x + w):
        p = rect(px, yb - h, px + 1, yb); outlined(img, p, '#2a160a', '#8a5a30')
    aw = poly([(x - 3, yb - h - 1), (x + w + 4, yb - h - 1), (x + w + 2, yb - h - 9), (x - 1, yb - h - 9)])
    sc = aw.copy()
    for k in range(int(w / 4) + 2):
        sc |= ell(x - 2 + k * 4 + 2, yb - h - 1, 2, 2) & (YS >= yb - h - 1)
    fill(img, dilate(sc) & ~sc, '#2a1a14')
    fill(img, sc, '#f4ead0')
    fill(img, sc & (((XS - x) // 4) % 2 == 0), stripe)
    fill(img, sc & (YS <= yb - h - 8), '#ffffff')
    ct = rect(x - 1, yb - 10, x + w + 2, yb)
    outlined(img, ct, '#2a160a', '#9a6a3a'); fill(img, ct & (YS == yb - 10), '#c08a50')
    fill(img, ct & (YS > yb - 9) & ((XS - x) % 5 == 0), '#6a4220')
    # goods on the counter: bundles of sticks, small crates, round loaves of wood
    for k in range(int(w / 5)):
        gx = x + 2 + k * 5
        kind = int(rng.integers(0, 3))
        if kind == 0:
            g = rect(gx, yb - 14, gx + 3, yb - 11); outlined(img, g, '#2a160a', '#b07a46')
        elif kind == 1:
            for j in range(3):
                fill(img, ell(gx + j * 1.3, yb - 12, 1.2), '#d8aa68')
            fill(img, rect(gx - 1, yb - 12, gx + 3, yb - 12), '#c43a3a')
        else:
            g = ell(gx + 1.5, yb - 12.5, 2, 1.8); outlined(img, g, '#2a160a', '#6aa04a')


def bunting(img, p0, p1, sag, colors, step=5):
    n = int(abs(p1[0] - p0[0]) / step)
    pts = []
    for i in range(n + 1):
        t = i / n
        pts.append((p0[0] + (p1[0] - p0[0]) * t, p0[1] + (p1[1] - p0[1]) * t + sag * 4 * t * (1 - t)))
    fill(img, line(pts, 1), '#3a2a20')
    for i in range(n):
        (xa, ya), (xb, yb) = pts[i], pts[i + 1]
        mx = (xa + xb) / 2
        f = poly([(xa + 0.5, ya), (xb - 0.5, yb), (mx, (ya + yb) / 2 + 5)])
        fill(img, f, colors[i % len(colors)])
        fill(img, f & ~shift(f, 1, 0), '#ffffff')


def s_timberfair(rng):  # stalls and bunting in a forest clearing
    img = canvas()
    vgrad(img, ['#6cb4ea', '#8ec6ee', '#b4daf0', '#e2ecdc', '#f4e8c4'], 0, 58)
    cloud(img, 64, 16, 26, '#ffffff', '#eef4f8', '#c4d6e4', rng)
    pal_back = ('#16301c', '#24482a', '#346038', '#4a7c46', '#4a3020')
    for x in range(-6, N + 8, 9):
        round_tree(img, x, 60 + int(rng.random() * 4), 8 + int(rng.random() * 3), pal_back, rng)
    gr = YS >= 60
    field_grad(img, (YS - 60) / 68, ['#9ad05a', '#86c24c', '#72b240', '#5e9e36', '#4c8a2c'], gr)
    fill(img, gr & (YS == 60), '#b4e070')
    path = poly([(56, 60), (72, 60), (96, 128), (32, 128)])
    field_grad(img, (YS - 60) / 68, ['#d8c08a', '#c8aa74', '#b8965e'], path & gr)
    pal_side = ('#10241a', '#1c3e24', '#2c5a32', '#467c40', '#4a3020')
    round_tree(img, 6, 112, 14, pal_side, rng)
    round_tree(img, 122, 108, 13, pal_side, rng)
    bunting(img, (6, 70), (122, 66), 10, ['#e84a4a', '#f4c43a', '#4a8ae8', '#f4f0e0', '#5ac06a'])
    bunting(img, (14, 84), (114, 82), 8, ['#f4c43a', '#e86aa0', '#4ac0c8', '#e84a4a'])
    stall(img, 14, 104, 22, '#d83a3a', rng)
    stall(img, 82, 104, 24, '#3a74d0', rng)
    stall(img, 48, 88, 18, '#e8b030', rng)
    for x, y in ((42, 112), (78, 116)):  # barrels
        b = rect(x - 3, y - 7, x + 3, y)
        outlined(img, b, '#2a160a', '#8a5a30'); fill(img, b & ((YS == y - 5) | (YS == y - 2)), '#4a4a50'); fill(img, b & (XS == x - 2), '#b07a46')
    for x, y in ((104, 118), (24, 120)):  # timber stacks for sale
        for k in range(3):
            log_end(img, x + k * 5, y, 2.5)
        for k in range(2):
            log_end(img, x + 2.5 + k * 5, y - 4.5, 2.5)
    tufts(img, rng, 260, gr & ~path, '#3e7a2a', '#b4e070', ymin=64, tall=3)
    dots(img, rng, 60, gr & ~path, ['#ffffff', '#ffe04a', '#f08ab0'], 0)
    return finish(img, 0.3)


def s_leylines(rng, n):
    """The ley lines at 1, 2 and 3 strands: same plain, same node, each level brighter, wider and hotter."""
    img = canvas()
    sky = [['#06081a', '#0a0e26', '#10143a', '#18184a'],
           ['#070818', '#0c0c2a', '#16123e', '#241852'],
           ['#0a0618', '#160c30', '#26124a', '#3c1a62']][n - 1]
    vgrad(img, sky, 0, 66)
    stars(img, rng, 70, ['#c8c8ff', '#ffffff', '#e8d0ff'], 62)
    hz = 66
    h = ridge(rng, hz, 6, 26)
    fill(img, below(h) & (YS <= hz + 1), '#1a1838' if n < 3 else '#24184a')
    ground = YS > hz
    field_grad(img, (YS - hz) / 62, ['#1e2a3a', '#1e3030', '#1c3228', '#1a3024', '#162a1e'], ground)
    tex = M.value_noise(rng, N, N, 4) > 0.62
    fill(img, ground & tex & (BAY > 0), '#26402e')
    for sx, sh in ((22, 6), (104, 7), (40, 4), (88, 4)):  # lesser stones on the plain
        ss = poly([(sx - 2, hz + 3), (sx - 1, hz + 3 - sh), (sx + 1, hz + 2 - sh), (sx + 2, hz + 3)])
        outlined(img, ss, '#0a0a14', '#30304a'); fill(img, ss & (XS < sx), '#44445e')
    node = (64, hz + 6)
    ends = [(64, 128)] + ([(4, 128)] if n >= 2 else []) + ([(124, 128)] if n >= 3 else [])  # each level adds a strand
    core = ['#8a7af0', '#c8b4ff', '#ffffff'][n - 1]
    mid = ['#5a4ac8', '#8a6ae8', '#d8a8ff'][n - 1]
    halo = ['#3a2a8a', '#5a3ab8', '#9a4ae0'][n - 1]
    lines_m = np.zeros((N, N), bool); wide_m = np.zeros((N, N), bool)
    for k, (ex, ey) in enumerate(ends):
        pts = []
        for i in range(41):
            t = i / 40
            x = node[0] + (ex - node[0]) * t + math.sin(t * 9 + k * 2.1) * 4 * t
            y = node[1] + (ey - node[1]) * t
            pts.append((x, y))
        for j in range(len(pts) - 1):
            w = 1 + int((j / 40) * (1 + n))
            seg = line([pts[j], pts[j + 1]], w)
            lines_m |= seg
            wide_m |= line([pts[j], pts[j + 1]], w + 2 + n)
    mask_glow(img, wide_m, 2 + n * 1.5, halo, amt=0.45 + 0.12 * n, steps=4)
    glow(img, node[0], node[1], 14 + n * 10, halo, amt=0.4 + 0.15 * n, steps=4)
    fill(img, wide_m & ~lines_m & (BAY > 0.1 - n * 0.15), mid)
    fill(img, lines_m, mid)
    fill(img, lines_m & shift(lines_m, 1, 0) & shift(lines_m, -1, 0) if n > 1 else lines_m & (BAY > -0.2), core)
    # the standing stone at the node, lit by the lines
    st = poly([(60, hz + 8), (61, hz - 10), (64, hz - 13), (67, hz - 9), (68, hz + 8)])
    outlined(img, st, '#0a0a14', '#3a3a50'); fill(img, st & (XS < 63), '#5a5a74')
    fill(img, st & ~shift(st, 0, -1) & (YS > hz + 4), mid)
    fill(img, ell(node[0], node[1] + 2, 6 + n * 2, 1.5 + n * 0.5) & ~st, mid)
    if n >= 2:
        for _ in range(30 * n):  # sparks rising off the lines
            ys_, xs_ = np.nonzero(lines_m)
            i = int(rng.integers(0, len(ys_)))
            x, y = xs_[i] + int(rng.integers(-3, 4)), ys_[i] - int(rng.integers(1, 6 + n * 3))
            if 0 <= x < N and 0 <= y < N:
                img[y, x] = C(core if rng.random() < 0.5 else mid)
    if n >= 3:  # the sky catches fire: an aurora sheet
        for i in range(3):
            a = (np.abs(YS - (22 + i * 9 + np.sin(XS / 14 + i) * 5)) < 2) & (YS < hz)
            img[a & (BAY > -0.1)] = img[a & (BAY > -0.1)] * 0.5 + C(['#9a4ae0', '#d070ff', '#6a5af0'][i]) * 0.5
    return finish(img, 0.4)


SCENES = {
    'lumberrush': s_lumberrush, 'timberfair': s_timberfair, 'midsummer': s_midsummer, 'dusk': s_dusk,
    'restless': s_restless, 'firstblood': s_firstblood, 'doubletime': s_doubletime, 'collapse': s_collapse,
    'leylines1': lambda rng: s_leylines(rng, 1), 'leylines2': lambda rng: s_leylines(rng, 2), 'leylines3': lambda rng: s_leylines(rng, 3),
}


def save(name):
    seed = 20261018 + sum(ord(c) for c in name) if not name.startswith('leylines') else 20261018  # Leylines I-III share a seed: same plain
    img = SCENES[name](np.random.default_rng(seed))
    out = os.path.join(OUT, name + '.png')
    img.quantize(colors=64, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.NONE).save(out, optimize=True)
    print('wrote', os.path.relpath(out, ROOT), os.path.getsize(out) // 1024, 'KB')


if __name__ == '__main__':
    for name in (sys.argv[1:] or SCENES):
        save(name)
