#!/usr/bin/env python3
"""Procedural pixel-art backgrounds for the Conquest maps (2026-10-04).

Each map gets a small top-down terrain painting (256x144 logical pixels, shown upscaled with
crisp pixels): a dithered ground in the map's own palette, then water, terrain features and
little pixel sprites (pines, acacias, coral, crystals, lava cracks...). The middle band, where
the trail and the skirmish nodes usually sit, is kept calmer so nodes stay readable.

These are the stand-in until AI art is reachable (PixelLab credits, or an image model via
OpenRouter — see tools/gen_map_bg_ai.py). Re-run any time; output is deterministic per map.

    python3 tools/make_map_backgrounds.py            -> art/maps/m1.png ... m11.png
    python3 tools/make_map_backgrounds.py m3 m9      -> just those
"""
import os, sys, math
import numpy as np
from PIL import Image

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
OUT = os.path.join(ROOT, 'art', 'maps')
W, H = 256, 144
BAYER = np.array([[0, 8, 2, 10], [12, 4, 14, 6], [3, 11, 1, 9], [15, 7, 13, 5]]) / 16.0 - 0.5


def hexrgb(h):
    h = h.lstrip('#'); return tuple(int(h[i:i + 2], 16) for i in (0, 2, 4))


def value_noise(rng, w, h, cell):
    gw, gh = w // cell + 2, h // cell + 2
    g = rng.random((gh, gw))
    ys, xs = np.mgrid[0:h, 0:w]
    fx, fy = xs / cell, ys / cell
    x0, y0 = fx.astype(int), fy.astype(int)
    tx, ty = fx - x0, fy - y0
    sx, sy = tx * tx * (3 - 2 * tx), ty * ty * (3 - 2 * ty)
    a, b = g[y0, x0], g[y0, x0 + 1]
    c, d = g[y0 + 1, x0], g[y0 + 1, x0 + 1]
    return (a + (b - a) * sx) + ((c + (d - c) * sx) - (a + (b - a) * sx)) * sy


def fbm(rng, w, h, cells=(64, 32, 16, 8), weights=(0.5, 0.25, 0.15, 0.1)):
    n = sum(wt * value_noise(rng, w, h, c) for c, wt in zip(cells, weights))
    return (n - n.min()) / (n.max() - n.min() + 1e-9)


def dither_palette(field, palette, strength=0.9):
    """Quantize a 0..1 field onto palette bands with ordered dithering (the pixel-art look)."""
    k = len(palette)
    ys, xs = np.mgrid[0:field.shape[0], 0:field.shape[1]]
    v = field * (k - 1) + BAYER[ys % 4, xs % 4] * strength
    idx = np.clip(np.round(v), 0, k - 1).astype(int)
    pal = np.array([hexrgb(p) for p in palette], dtype=np.uint8)
    return pal[idx]


def blend_mask(img, mask, color, rng=None, dither=True):
    """Paint `color` where mask (0..1) wins a dithered threshold."""
    ys, xs = np.mgrid[0:img.shape[0], 0:img.shape[1]]
    thr = 0.5 + (BAYER[ys % 4, xs % 4] if dither else 0)
    sel = mask > thr
    img[sel] = hexrgb(color) if isinstance(color, str) else color
    return sel


def stamp(img, spr, x, y, pal):
    """Draw a sprite given as rows of chars ('.' = transparent) at (x, y) top-left."""
    for j, row in enumerate(spr):
        for i, ch in enumerate(row):
            if ch == '.' or ch == ' ':
                continue
            px, py = x + i, y + j
            if 0 <= px < W and 0 <= py < H:
                img[py, px] = hexrgb(pal[ch])


def shadow(img, x, y, w, h=2, amt=0.6):
    x0, x1 = max(0, x), min(W, x + w)
    y0, y1 = max(0, y), min(H, y + h)
    if x1 > x0 and y1 > y0:
        img[y0:y1, x0:x1] = (img[y0:y1, x0:x1] * amt).astype(np.uint8)


# ---- sprites (top-down-ish, lit from the top-left) ----
PINE = ["...a...", "..aba..", ".abbba.", "..aba..", ".abbba.", "abbbbba", "..ccc..", "...c..."]
ROUND = ["..aaa..", ".abbba.", "abbbbba", "abbbbba", ".abbba.", "..ccc..", "...c..."]
BUSH = [".aa.", "abba", ".bb."]
ACACIA = ["aaaaaaaaa", ".abbbbba.", "...c.c...", "....c....", "....c...."]
DEAD = ["c...c", ".c.c.", "..c..", "..c..", "..c.."]
ROCK = [".aa.", "abba", "bbbb"]
BOULDER = ["..aaa.", ".abbba", "abbbbb", ".bbbb."]
CRYSTAL = ["..a..", ".aba.", ".aba.", "abbba", ".bbb."]
CORAL = ["a.a.a", "abab.", ".bab.", "..b.."]
REED = ["a.a", "a.a", "aba", ".b."]
LILY = [".aa", "aab", ".a."]
SNOWPINE = ["...w...", "..wbw..", ".wbbbw.", "..wbw..", ".wbbbw.", "wbbbbbw", "..ccc.."]
CLOUD = ["...aaaa....", ".aaaaaaaa..", "aaaaaaaaaaa", ".bbbbbbbbb."]
TUFT = ["a.a", ".a."]


def scatter(img, rng, sprite, pal, n, avoid_band=True, density=None, shadow_w=None, tries=4):
    placed = 0
    sh, sw = len(sprite), max(len(r) for r in sprite)
    for _ in range(n * tries):
        if placed >= n:
            break
        x, y = int(rng.integers(-2, W - sw + 2)), int(rng.integers(-2, H - sh + 2))
        cy = (y + sh / 2) / H
        if avoid_band and 0.36 < cy < 0.64 and rng.random() < 0.8:
            continue
        if density is not None:
            dx, dy = min(W - 1, max(0, x + sw // 2)), min(H - 1, max(0, y + sh // 2))
            if rng.random() > density[dy, dx]:
                continue
        if shadow_w:
            shadow(img, x + 1, y + sh - 1, shadow_w(sw), 2, 0.7)
        stamp(img, sprite, x, y, pal)
        placed += 1


def river(img, rng, color_deep, color_shallow, foam, width=9, y0=0.25, amp=0.18, freq=1.6, vertical=False):
    ys, xs = np.mgrid[0:H, 0:W]
    ph = rng.random() * 6.28
    if vertical:
        cx = W * (0.5 + amp * np.sin(ys / H * math.pi * freq + ph))
        d = np.abs(xs - cx)
    else:
        cy = H * (y0 + amp * np.sin(xs / W * math.pi * freq + ph))
        d = np.abs(ys - cy)
    wob = value_noise(rng, W, H, 12) * 3
    d = d + wob
    blend_mask(img, np.clip((width + 2 - d) / 2.0, 0, 1), foam)
    blend_mask(img, np.clip((width - d) / 2.0, 0, 1), color_shallow)
    blend_mask(img, np.clip((width * 0.55 - d) / 2.0, 0, 1), color_deep)
    return d < width


def ponds(img, rng, n, deep, shallow, rim, rmin=7, rmax=16, avoid_band=True):
    ys, xs = np.mgrid[0:H, 0:W]
    wob = value_noise(rng, W, H, 6) * 3
    mask = np.zeros((H, W), bool)
    for _ in range(n):
        for _t in range(20):
            cx, cy, r = rng.integers(10, W - 10), rng.integers(10, H - 10), rng.integers(rmin, rmax)
            if not (avoid_band and 0.36 < cy / H < 0.64):
                break
        d = np.sqrt(((xs - cx) / 1.3) ** 2 + (ys - cy) ** 2) + wob
        blend_mask(img, np.clip((r + 2 - d) / 2, 0, 1), rim)
        blend_mask(img, np.clip((r - d) / 2, 0, 1), shallow)
        blend_mask(img, np.clip((r * 0.6 - d) / 2, 0, 1), deep)
        mask |= d < r
    return mask


def cracks(img, rng, n, hot, core, length=(20, 60)):
    for _ in range(n):
        x, y = rng.random() * W, rng.random() * H
        ang = rng.random() * 6.28
        for s in range(int(rng.integers(*length))):
            ang += (rng.random() - 0.5) * 0.45
            x += math.cos(ang); y += math.sin(ang)
            xi, yi = int(x), int(y)
            if 0 <= xi < W and 0 <= yi < H:
                img[yi, xi] = hexrgb(core if s % 3 else hot)
                if 0 <= yi + 1 < H and rng.random() < 0.5:
                    img[yi + 1, xi] = hexrgb(hot)


def sparkle(img, rng, n, color):
    for _ in range(n):
        x, y = int(rng.integers(0, W)), int(rng.integers(0, H))
        img[y, x] = hexrgb(color)


def edge_vignette(img, amt=0.35):
    ys, xs = np.mgrid[0:H, 0:W]
    d = np.sqrt(((xs - W / 2) / (W / 2)) ** 2 + ((ys - H / 2) / (H / 2)) ** 2)
    f = 1 - amt * np.clip(d - 0.55, 0, 1) / 0.45
    # quantize the darkening into 3 steps so it stays "pixel"
    f = np.round(f * 6) / 6
    return (img * f[..., None]).astype(np.uint8)


# ---- one painter per map ----
def m1(rng):  # Bramblewood Outskirts: meadow, pond, pines and round trees, a stream
    img = dither_palette(fbm(rng, W, H), ['#2f5a2a', '#3c6b33', '#4a7c3f', '#5b8f48', '#6ea153'])
    river(img, rng, '#2e6f86', '#4f97a8', '#9cc9b8', width=6, y0=0.82, amp=0.08, freq=2.2)
    ponds(img, rng, 1, '#2e6f86', '#4f97a8', '#3c6b33', 12, 15)
    dens = fbm(rng, W, H, (48, 24), (0.7, 0.3))
    scatter(img, rng, TUFT, {'a': '#7fb55e'}, 160, avoid_band=False)
    scatter(img, rng, BUSH, {'a': '#5f9a45', 'b': '#3f7432'}, 40, density=dens)
    scatter(img, rng, ROUND, {'a': '#6aa84f', 'b': '#3f7a34', 'c': '#5a3a22'}, 34, density=dens, shadow_w=lambda w: w)
    scatter(img, rng, PINE, {'a': '#3d7a3a', 'b': '#245a2a', 'c': '#5a3a22'}, 40, density=dens, shadow_w=lambda w: w)
    sparkle(img, rng, 60, '#f2d7e6'); sparkle(img, rng, 40, '#ffe57a')
    return img


def m2(rng):  # Sunken Hollow: wetland, lots of water, reeds, lily pads
    img = dither_palette(fbm(rng, W, H), ['#1d4a52', '#255a5c', '#2f6d63', '#3f7d66', '#4f8d6a'])
    ponds(img, rng, 6, '#123a54', '#1d5578', '#2f6d63', 10, 22, avoid_band=False)
    river(img, rng, '#123a54', '#1d5578', '#5aa7b5', width=8, y0=0.15, amp=0.08)
    scatter(img, rng, REED, {'a': '#9bc46a', 'b': '#5b7d3a'}, 90, avoid_band=False)
    scatter(img, rng, LILY, {'a': '#5fae5a', 'b': '#e88fb4'}, 50, avoid_band=False)
    scatter(img, rng, ROUND, {'a': '#4f8f5a', 'b': '#2f6a45', 'c': '#4a3322'}, 22, shadow_w=lambda w: w)
    sparkle(img, rng, 70, '#bfe7ef')
    return img


def m3(rng):  # The Ashen Peak: ash and rock, lava cracks, dead trees
    img = dither_palette(fbm(rng, W, H), ['#3a2420', '#4d2f26', '#63392a', '#7a4632', '#8f5a40'])
    cracks(img, rng, 14, '#ff8a3d', '#ffd36b')
    scatter(img, rng, BOULDER, {'a': '#8b6a5a', 'b': '#5a3f35'}, 40, shadow_w=lambda w: w)
    scatter(img, rng, DEAD, {'c': '#2a1a15'}, 30)
    scatter(img, rng, ROCK, {'a': '#9a7a68', 'b': '#6a4e42'}, 70, avoid_band=False)
    sparkle(img, rng, 80, '#ffb36b')
    return img


def m4(rng):  # Caves & Alcoves: dark stone floor, crystal clusters, dripping pools
    img = dither_palette(fbm(rng, W, H), ['#17122a', '#211a38', '#2c2348', '#392c54', '#4a3a68'])
    ponds(img, rng, 3, '#0f1f3a', '#1d3560', '#2c2348', 6, 12)
    scatter(img, rng, BOULDER, {'a': '#5a4a7c', 'b': '#2c2348'}, 50, shadow_w=lambda w: w)
    scatter(img, rng, CRYSTAL, {'a': '#b9f0ff', 'b': '#5fb7e6'}, 26, shadow_w=lambda w: w)
    scatter(img, rng, CRYSTAL, {'a': '#f3c1ff', 'b': '#b06ad9'}, 18, shadow_w=lambda w: w)
    sparkle(img, rng, 90, '#8fd8ff')
    return img


def m5(rng):  # Savanna Reaches: golden grass, dirt paths, acacias, watering hole
    img = dither_palette(fbm(rng, W, H), ['#8f6f1a', '#a8842a', '#c09a36', '#d4b04a', '#e2c463'])
    ponds(img, rng, 1, '#2e6f86', '#4f97a8', '#9a7a3a', 10, 14)
    scatter(img, rng, TUFT, {'a': '#efd27a'}, 220, avoid_band=False)
    scatter(img, rng, ACACIA, {'a': '#7a9a3a', 'b': '#56722a', 'c': '#4a3322'}, 26, shadow_w=lambda w: w + 2)
    scatter(img, rng, ROCK, {'a': '#c9a87a', 'b': '#8f6f4a'}, 40)
    return img


def m6(rng):  # Wolfsbane Tundra: snowfield, ice lake, snowy pines
    img = dither_palette(fbm(rng, W, H), ['#7f98a8', '#97b0bf', '#b3c8d4', '#cfdde6', '#e8f0f5'])
    ponds(img, rng, 2, '#5c8fb0', '#8fbcd6', '#cfdde6', 12, 20)
    scatter(img, rng, SNOWPINE, {'w': '#f4f8fb', 'b': '#2f5a4a', 'c': '#4a3a30'}, 40, shadow_w=lambda w: w)
    scatter(img, rng, ROCK, {'a': '#cfdde6', 'b': '#6f8796'}, 40)
    sparkle(img, rng, 140, '#ffffff')
    return img


def m7(rng):  # Coral Current: shallow sea, sand bars, coral reefs
    img = dither_palette(fbm(rng, W, H, (48, 24, 12, 6)), ['#0b3b52', '#0f5068', '#146b7c', '#1f8a8f', '#2fa39b'])
    sand = fbm(rng, W, H, (64, 32), (0.7, 0.3))
    blend_mask(img, np.clip((sand - 0.66) * 6, 0, 1), '#e3cf94')
    blend_mask(img, np.clip((sand - 0.72) * 6, 0, 1), '#f0dfab')
    scatter(img, rng, CORAL, {'a': '#ff8f8f', 'b': '#d9586a'}, 50, avoid_band=False)
    scatter(img, rng, CORAL, {'a': '#ffd36b', 'b': '#e09a3a'}, 30, avoid_band=False)
    scatter(img, rng, CORAL, {'a': '#c7a0ff', 'b': '#8a5fc9'}, 24, avoid_band=False)
    sparkle(img, rng, 120, '#bff3ef')
    return img


def m8(rng):  # Sable Swampmire: murky ground, black water, dead trees, reeds
    img = dither_palette(fbm(rng, W, H), ['#10160c', '#182212', '#212e1a', '#2c3c22', '#384a2e'])
    ponds(img, rng, 7, '#0a120e', '#16261e', '#212e1a', 8, 20, avoid_band=False)
    scatter(img, rng, DEAD, {'c': '#0a0c08'}, 36)
    scatter(img, rng, REED, {'a': '#5f7a3a', 'b': '#3a4a22'}, 90, avoid_band=False)
    scatter(img, rng, ROUND, {'a': '#3a5530', 'b': '#22351c', 'c': '#2a1f16'}, 18, shadow_w=lambda w: w)
    sparkle(img, rng, 40, '#c8f07a')
    return img


def m9(rng):  # Basalt Foundry: black basalt plates, lava river, glowing seams
    img = dither_palette(fbm(rng, W, H, (24, 12, 6), (0.5, 0.3, 0.2)), ['#1a1210', '#241914', '#2f211a', '#3a2a20', '#463328'])
    river(img, rng, '#ffd36b', '#ff8a3d', '#8f2a10', width=7, y0=0.2, amp=0.1, freq=1.2)
    cracks(img, rng, 22, '#d9481f', '#ff9a4a', (12, 40))
    scatter(img, rng, BOULDER, {'a': '#4a3a32', 'b': '#241914'}, 40, shadow_w=lambda w: w)
    sparkle(img, rng, 70, '#ffb36b')
    return img


def m10(rng):  # Eyrie Heights: cliff tops, clouds, sparse pines
    img = dither_palette(fbm(rng, W, H), ['#5f6b75', '#76838e', '#8a97a3', '#a9b4bd', '#cdd6de'])
    gap = fbm(rng, W, H, (64, 32), (0.7, 0.3))
    blend_mask(img, np.clip((0.28 - gap) * 8, 0, 1), '#9fc3dc')  # sky showing through gaps
    scatter(img, rng, CLOUD, {'a': '#f4f8fb', 'b': '#c9d6e0'}, 18, avoid_band=False)
    scatter(img, rng, PINE, {'a': '#4f7a5a', 'b': '#2f5a42', 'c': '#4a3a30'}, 22, shadow_w=lambda w: w)
    scatter(img, rng, BOULDER, {'a': '#cdd6de', 'b': '#76838e'}, 40, shadow_w=lambda w: w)
    return img


def m11(rng):  # The Sundered Peak: scorched crimson rock, rifts, embers
    img = dither_palette(fbm(rng, W, H), ['#22090c', '#33100f', '#4d1319', '#661a22', '#7c1f2a'])
    cracks(img, rng, 15, '#ff5a3d', '#ffb36b', (30, 70))
    scatter(img, rng, BOULDER, {'a': '#7c3a3a', 'b': '#3a1416'}, 46, shadow_w=lambda w: w)
    scatter(img, rng, CRYSTAL, {'a': '#ff9a9a', 'b': '#c0303a'}, 16, shadow_w=lambda w: w)
    sparkle(img, rng, 110, '#ffcf8a')
    return img


def mf(rng):  # Thistle Fields (2026-10-09): sunny meadow, hedgerows, flowers, a few round trees
    img = dither_palette(fbm(rng, W, H), ['#5f8a2e', '#6f9a36', '#82ad40', '#98bf4c', '#aecf5e'])
    dens = fbm(rng, W, H, (48, 24), (0.7, 0.3))
    scatter(img, rng, TUFT, {'a': '#c8df7a'}, 260, avoid_band=False)
    scatter(img, rng, BUSH, {'a': '#5f9a45', 'b': '#3f7432'}, 70, density=dens)
    scatter(img, rng, ROUND, {'a': '#6aa84f', 'b': '#3f7a34', 'c': '#5a3a22'}, 14, density=dens, shadow_w=lambda w: w)
    scatter(img, rng, ROCK, {'a': '#c9bfa0', 'b': '#8f8670'}, 14)
    sparkle(img, rng, 120, '#ffe57a'); sparkle(img, rng, 90, '#c79bf2'); sparkle(img, rng, 70, '#ffffff')
    return img


def mb(rng):  # Pebble Beach (2026-10-09): sea along the top, wet sand, dry sand, rock pools, shells
    img = dither_palette(fbm(rng, W, H, (48, 24, 12, 6)), ['#d8c08a', '#e2cb94', '#ead5a0', '#f0dfab', '#f6e8bf'])
    ys = np.mgrid[0:H, 0:W][0] / H
    wave = fbm(rng, W, H, (32, 16), (0.7, 0.3))
    blend_mask(img, np.clip((0.30 - ys + (wave - 0.5) * 0.12) * 14, 0, 1), '#c9b07a')   # wet sand
    blend_mask(img, np.clip((0.24 - ys + (wave - 0.5) * 0.12) * 14, 0, 1), '#e9f4f2')   # foam line
    blend_mask(img, np.clip((0.21 - ys + (wave - 0.5) * 0.12) * 14, 0, 1), '#3f9fb5')   # shallows
    blend_mask(img, np.clip((0.12 - ys + (wave - 0.5) * 0.10) * 14, 0, 1), '#22708f')   # deep
    ponds(img, rng, 3, '#2e7f96', '#5fb3c0', '#b8a070', 6, 11)
    scatter(img, rng, BOULDER, {'a': '#9a948a', 'b': '#625d55'}, 18, shadow_w=lambda w: w)
    scatter(img, rng, ROCK, {'a': '#b0a898', 'b': '#7a7366'}, 40, avoid_band=False)
    scatter(img, rng, TUFT, {'a': '#8fae5a'}, 40, avoid_band=False)
    sparkle(img, rng, 60, '#ffffff'); sparkle(img, rng, 40, '#f2a6b8')
    return img


def mg(rng):  # Smugglers' Grotto sub-map (2026-10-09): wet dark stone, tide pools, glowing jellies, crates
    img = dither_palette(fbm(rng, W, H), ['#0c1a22', '#12262e', '#1a333b', '#22404a', '#2f525c'])
    ponds(img, rng, 5, '#0a2a3a', '#17506a', '#1a333b', 8, 18, avoid_band=False)
    scatter(img, rng, BOULDER, {'a': '#3f5a62', 'b': '#1a2c33'}, 46, shadow_w=lambda w: w)
    scatter(img, rng, CRYSTAL, {'a': '#9ff3e6', 'b': '#3fbfb0'}, 16, shadow_w=lambda w: w)
    scatter(img, rng, ROCK, {'a': '#8a6a42', 'b': '#5a4228'}, 10)  # old smugglers' crates
    sparkle(img, rng, 110, '#8ff0ff'); sparkle(img, rng, 30, '#ffd36b')
    return img


PAINTERS = {k: v for k, v in globals().items() if k[0] == 'm' and (k[1:].isdigit() or k in ('mf', 'mb', 'mg'))}


def make(map_id):
    rng = np.random.default_rng(abs(hash(map_id)) % (2 ** 32) if False else sum(map(ord, map_id)) * 7919)
    img = PAINTERS[map_id](rng)
    os.makedirs(OUT, exist_ok=True)
    path = os.path.join(OUT, map_id + '.png')
    Image.fromarray(img, 'RGB').quantize(colors=48, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.NONE).save(path, optimize=True)
    return path


if __name__ == '__main__':
    ids = sys.argv[1:] or sorted(PAINTERS, key=lambda k: int(k[1:]) if k[1:].isdigit() else 0)
    for mid in ids:
        p = make(mid)
        print('wrote', os.path.relpath(p, ROOT), os.path.getsize(p) // 1024, 'KB')
