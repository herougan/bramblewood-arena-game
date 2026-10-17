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


# ---- The 0–20 road (2026-10-11): new maps ----
MUSHROOM = ["..aaa..", ".aabaa.", "aaaaaaa", "...c...", "...c..."]
CACTUS = [".a...", ".a.a.", "aaa..", ".a...", ".a..."]
BIGPINE = ["....a....", "...aba...", "..abbba..", "...aba...", "..abbba..", ".abbbbba.", "..abbba..", ".abbbbba.", "abbbbbbba", "....c....", "....c...."]
MANGROVE = ["..aaaa..", ".abbbba.", "abbbbbba", ".c.cc.c.", "c..cc..c"]


def mu(rng):  # The Morel Hollow: dark loam, giant mushrooms, glowing spores
    img = dither_palette(fbm(rng, W, H), ['#2a1d22', '#35252a', '#423035', '#4f3b3d', '#5e4846'])
    dens = fbm(rng, W, H, (48, 24), (0.7, 0.3))
    scatter(img, rng, MUSHROOM, {'a': '#c9503f', 'b': '#f3e3c8', 'c': '#d8c8a8'}, 40, density=dens, shadow_w=lambda w: w)
    scatter(img, rng, MUSHROOM, {'a': '#9a6ad0', 'b': '#e8d6ff', 'c': '#cdbfa0'}, 22, density=dens, shadow_w=lambda w: w)
    scatter(img, rng, ROUND, {'a': '#3f5a33', 'b': '#26381f', 'c': '#3a2a20'}, 18, shadow_w=lambda w: w)
    scatter(img, rng, TUFT, {'a': '#6f7a4a'}, 90, avoid_band=False)
    sparkle(img, rng, 120, '#c9f0a0'); sparkle(img, rng, 40, '#e8c8ff')
    return img


def mp(rng):  # Lilypad Reach: a big still pond, lily pads, reeds, beaver dams
    img = dither_palette(fbm(rng, W, H), ['#3f6a2f', '#4b7a38', '#5a8a42', '#6a9a4c', '#7aab58'])
    ponds(img, rng, 5, '#2a6a80', '#4a95a8', '#4b7a38', 14, 26, avoid_band=False)
    scatter(img, rng, LILY, {'a': '#6fbf5a', 'b': '#f4a8c8'}, 80, avoid_band=False)
    scatter(img, rng, REED, {'a': '#a8c86a', 'b': '#6a8a3a'}, 70, avoid_band=False)
    scatter(img, rng, ROCK, {'a': '#8a6a42', 'b': '#5a4228'}, 16)  # dam logs
    scatter(img, rng, ROUND, {'a': '#5f9a45', 'b': '#3f7432', 'c': '#5a3a22'}, 14, shadow_w=lambda w: w)
    sparkle(img, rng, 90, '#d8f4ff')
    return img


def mc(rng):  # Gannet Cliffs: sea along the top, white cliff rock, grassy ledges, nesting birds
    img = dither_palette(fbm(rng, W, H), ['#7a8a6a', '#8f9f7a', '#a8b48c', '#c3c9a4', '#dcdcc0'])
    sea = np.tile(np.linspace(1, 0, H)[:, None], (1, W)) + (fbm(rng, W, H, (32, 16), (0.7, 0.3)) - 0.5) * 0.25
    blend_mask(img, np.clip((sea - 0.78) * 8, 0, 1), '#2f7fa0')
    blend_mask(img, np.clip((sea - 0.86) * 8, 0, 1), '#1f5f80')
    scatter(img, rng, BOULDER, {'a': '#eae6dc', 'b': '#a8a294'}, 60, shadow_w=lambda w: w)
    scatter(img, rng, TUFT, {'a': '#9ab86a'}, 120, avoid_band=False)
    scatter(img, rng, CLOUD, {'a': '#f4f8fb', 'b': '#c9d6e0'}, 6, avoid_band=False)
    sparkle(img, rng, 70, '#ffffff')
    return img


def mw(rng):  # Gatorback Swamp: warm green swamp, lots of water, logs, reeds, lily pads
    img = dither_palette(fbm(rng, W, H), ['#2a3f1f', '#344d26', '#3f5c2c', '#4c6c33', '#5a7c3a'])
    ponds(img, rng, 8, '#1f3a2a', '#2f5a3a', '#344d26', 9, 22, avoid_band=False)
    scatter(img, rng, REED, {'a': '#9ab85a', 'b': '#5a7a2a'}, 100, avoid_band=False)
    scatter(img, rng, LILY, {'a': '#6faa4a', 'b': '#f3e37a'}, 40, avoid_band=False)
    scatter(img, rng, ROCK, {'a': '#5a4a2a', 'b': '#3a2e1a'}, 22)  # floating logs
    scatter(img, rng, ROUND, {'a': '#4a6f33', 'b': '#2c4a20', 'c': '#3a2a1a'}, 20, shadow_w=lambda w: w)
    sparkle(img, rng, 50, '#e6f07a')
    return img


def mk(rng):  # The Kelp Mangroves: teal salt water, mangrove islands, kelp ribbons
    img = dither_palette(fbm(rng, W, H, (48, 24, 12, 6)), ['#0f3a40', '#144a4c', '#1a5a58', '#22706a', '#2c857a'])
    land = fbm(rng, W, H, (64, 32), (0.7, 0.3))
    blend_mask(img, np.clip((land - 0.62) * 6, 0, 1), '#5a5a3a')
    scatter(img, rng, MANGROVE, {'a': '#4f8a4a', 'b': '#2f5f32', 'c': '#5a4228'}, 30, shadow_w=lambda w: w)
    scatter(img, rng, REED, {'a': '#3f8a5a', 'b': '#1f5a3a'}, 110, avoid_band=False)  # kelp
    sparkle(img, rng, 90, '#a8f0e0')
    return img


def mh(rng):  # The Briar Maze: hedge walls in a maze grid, roses, gravel paths
    img = dither_palette(fbm(rng, W, H), ['#7a6a4a', '#8a7a58', '#9a8a66', '#aa9a74', '#baaa84'])
    grid = np.zeros((H, W))
    for x in range(0, W, 24): grid[:, x:x + 6] = 1
    for y in range(0, H, 24): grid[y:y + 6, :] = 1
    gaps = fbm(rng, W, H, (16, 8), (0.7, 0.3))
    blend_mask(img, grid * (gaps > 0.42), '#2f5a2a', dither=False)
    blend_mask(img, grid * (gaps > 0.62), '#245024', dither=False)
    scatter(img, rng, BUSH, {'a': '#d9485a', 'b': '#2f5a2a'}, 50, avoid_band=False)
    sparkle(img, rng, 40, '#ffd0d8')
    return img


def mr(rng):  # The Redwood Deep: red-brown needle floor, giant trees, ferns, light shafts
    img = dither_palette(fbm(rng, W, H), ['#3a1f16', '#4a281c', '#5a3222', '#6a3c28', '#7a4630'])
    dens = fbm(rng, W, H, (48, 24), (0.7, 0.3))
    scatter(img, rng, BIGPINE, {'a': '#3a6a3a', 'b': '#204a28', 'c': '#8a3a22'}, 34, density=dens, shadow_w=lambda w: w)
    scatter(img, rng, TUFT, {'a': '#5f8a3a'}, 140, avoid_band=False)
    scatter(img, rng, BUSH, {'a': '#4f7a32', 'b': '#2f5a22'}, 30, density=dens)
    sparkle(img, rng, 60, '#ffd8a0')
    return img


def ml(rng):  # The Long Grass: rolling golden-green plains, a dirt road, fences, a farmhouse tree or two
    img = dither_palette(fbm(rng, W, H), ['#7a8f3a', '#8a9f42', '#9aaf4c', '#aabf58', '#bacf66'])
    river(img, rng, '#9a7a4a', '#b08a58', '#c8a878', width=5, y0=0.7, amp=0.06, freq=1.4)  # the road
    scatter(img, rng, TUFT, {'a': '#d8df7a'}, 280, avoid_band=False)
    scatter(img, rng, ROUND, {'a': '#6a9a3f', 'b': '#3f7432', 'c': '#5a3a22'}, 10, shadow_w=lambda w: w)
    scatter(img, rng, ROCK, {'a': '#c8b08a', 'b': '#8a7050'}, 20)
    sparkle(img, rng, 60, '#fff3a0')
    return img


def mt(rng):  # The Pinewood Taiga: dark pines, snow patches, frozen streams
    img = dither_palette(fbm(rng, W, H), ['#2a3a2f', '#344637', '#3f523f', '#4c6048', '#5a6e52'])
    snow = fbm(rng, W, H, (48, 24), (0.7, 0.3))
    blend_mask(img, np.clip((snow - 0.6) * 6, 0, 1), '#dfe8ee')
    river(img, rng, '#8fbcd6', '#b8d8e8', '#e8f2f8', width=4, y0=0.2, amp=0.1, freq=1.8)
    scatter(img, rng, PINE, {'a': '#2f5a3a', 'b': '#1a3a24', 'c': '#4a3a30'}, 70, shadow_w=lambda w: w)
    scatter(img, rng, SNOWPINE, {'w': '#f4f8fb', 'b': '#2f5a4a', 'c': '#4a3a30'}, 20, shadow_w=lambda w: w)
    sparkle(img, rng, 70, '#ffffff')
    return img


def md(rng):  # The Glass Dunes: hot sand, dune ridges, glassy patches, cacti, bleached rocks
    img = dither_palette(fbm(rng, W, H, (48, 24, 12)), ['#c08a4a', '#cf9a56', '#dcaa62', '#e8ba72', '#f2ca84'])
    ridge = fbm(rng, W, H, (32, 16), (0.7, 0.3))
    blend_mask(img, np.clip((ridge - 0.66) * 7, 0, 1), '#a8723a')
    blend_mask(img, np.clip((0.3 - ridge) * 7, 0, 1), '#9ad8d0')  # sand turned to glass
    scatter(img, rng, CACTUS, {'a': '#5a8a3a'}, 30, shadow_w=lambda w: w)
    scatter(img, rng, ROCK, {'a': '#f0e2c8', 'b': '#b8a080'}, 40)
    sparkle(img, rng, 110, '#ffffff')
    return img


def my(rng):  # The Canopy: deep rainforest roof, vines, bright flowers
    img = dither_palette(fbm(rng, W, H), ['#163a1f', '#1d4a26', '#245a2c', '#2c6a33', '#357a3a'])
    dens = fbm(rng, W, H, (48, 24), (0.7, 0.3))
    scatter(img, rng, ROUND, {'a': '#3f8a3f', 'b': '#245a2a', 'c': '#3a2a1a'}, 70, density=dens, shadow_w=lambda w: w)
    scatter(img, rng, BUSH, {'a': '#f05a7a', 'b': '#2f6a2f'}, 30, avoid_band=False)
    scatter(img, rng, BUSH, {'a': '#ffb34a', 'b': '#2f6a2f'}, 20, avoid_band=False)
    scatter(img, rng, REED, {'a': '#5fae4a', 'b': '#2f6a2f'}, 60, avoid_band=False)  # vines
    sparkle(img, rng, 60, '#fff3a0')
    return img


def mq(rng):  # Clovermead (2026-10-12, Map 1): soft clover meadow, white clover heads, bees' flowers, a brook
    img = dither_palette(fbm(rng, W, H), ['#4f8a33', '#5c9a3a', '#6aa842', '#7cb84c', '#90c95a'])
    river(img, rng, '#3a86a8', '#6cc0d0', '#d9f2f0', width=6, y0=0.82, amp=0.06, freq=1.1)
    dens = fbm(rng, W, H, (48, 24), (0.7, 0.3))
    scatter(img, rng, TUFT, {'a': '#a6d672'}, 300, avoid_band=False)
    scatter(img, rng, BUSH, {'a': '#4f9440', 'b': '#33702e'}, 46, density=dens)
    scatter(img, rng, ROUND, {'a': '#5ea64a', 'b': '#3a7a33', 'c': '#5a3a22'}, 10, density=dens, shadow_w=lambda w: w)
    sparkle(img, rng, 220, '#ffffff'); sparkle(img, rng, 90, '#f6b6d0'); sparkle(img, rng, 60, '#ffe57a')
    return img


def mz(rng):  # The Mycelium Deep (2026-10-12, dungeon 14A): spore cave under the Morel Hollow, glowing mycelium threads
    img = dither_palette(fbm(rng, W, H), ['#120e16', '#19131f', '#211a29', '#2a2134', '#342a40'])
    cracks(img, rng, 26, '#4fd6b0', '#c8ffe8', (18, 50))   # glowing mycelium threads
    dens = fbm(rng, W, H, (48, 24), (0.7, 0.3))
    scatter(img, rng, MUSHROOM, {'a': '#3fbfa0', 'b': '#c8fff0', 'c': '#8fb8a8'}, 34, density=dens, shadow_w=lambda w: w)
    scatter(img, rng, MUSHROOM, {'a': '#8a5ad0', 'b': '#e8d6ff', 'c': '#a898b8'}, 26, density=dens, shadow_w=lambda w: w)
    scatter(img, rng, BOULDER, {'a': '#3a3048', 'b': '#1c1626'}, 30, shadow_w=lambda w: w)
    sparkle(img, rng, 180, '#9ff7d8'); sparkle(img, rng, 80, '#e0c8ff')
    return img



def me(rng):  # Eye of the Volcano (2026-10-12, sub-map of the Sundered Peak): a crater floor, a lava lake in the middle, bone piles
    img = dither_palette(fbm(rng, W, H), ['#140708', '#1f0b0b', '#2c1010', '#3b1512', '#4a1b14'])
    ponds(img, rng, 3, '#ff7a2a', '#ffc36b', '#7a1a10', rmin=10, rmax=20)   # lava pools
    cracks(img, rng, 30, '#ff4a1f', '#ffd08a', (16, 60))
    scatter(img, rng, BOULDER, {'a': '#3a1c1c', 'b': '#170808'}, 40, shadow_w=lambda w: w)
    scatter(img, rng, BOULDER, {'a': '#d8cfc0', 'b': '#8a8070'}, 14, shadow_w=lambda w: w)   # bleached bones
    sparkle(img, rng, 160, '#ffb36b')
    return img

def m21(rng):  # The Quiet Summit (2026-10-13, Map 21): above the clouds after the storm, snow peaks, still blue tarns, a soft dawn
    img = dither_palette(fbm(rng, W, H), ['#8d93a6', '#a7aec0', '#c3c9d8', '#dde2ec', '#f2f4f8'])
    ridge = fbm(rng, W, H, (64, 32), (0.7, 0.3))
    blend_mask(img, np.clip((ridge - 0.62) * 6, 0, 1), '#e9c9b8')  # dawn light on the high snow
    ponds(img, rng, 3, '#6f9fc4', '#a8cde4', '#e6edf4', 7, 13)
    scatter(img, rng, CLOUD, {'a': '#ffffff', 'b': '#d9dfeb'}, 22, avoid_band=False)
    scatter(img, rng, SNOWPINE, {'w': '#f7f9fc', 'b': '#3c5f58', 'c': '#4a3a30'}, 16, shadow_w=lambda w: w)
    scatter(img, rng, BOULDER, {'a': '#e3e8f0', 'b': '#8d93a6'}, 36, shadow_w=lambda w: w)
    sparkle(img, rng, 90, '#ffffff')
    return img


def m22(rng):  # The Rimefire Caldera (2026-10-17, Map 22, user: "Ice volcano stage ... you're still very high up"): snow over black
    # frozen lava, a glowing crater lake, steam vents and blue ice
    img = dither_palette(fbm(rng, W, H), ['#5a6170', '#7f8a9c', '#a3afc0', '#c9d3e0', '#eef3f8'])
    flow = fbm(rng, W, H, (48, 24, 12), (0.5, 0.3, 0.2))
    blend_mask(img, np.clip((0.34 - flow) * 7, 0, 1), '#2a2228')   # frozen black lava tongues
    blend_mask(img, np.clip((0.26 - flow) * 7, 0, 1), '#3a2a2a')
    ponds(img, rng, 2, '#ff7a2a', '#ffc36b', '#4a2a24', rmin=9, rmax=15)   # the crater's glow
    ponds(img, rng, 3, '#6fa8d0', '#b8e0f4', '#e6f2fa', 6, 11)              # blue ice pools
    cracks(img, rng, 12, '#ff6a3a', '#ffd08a', (14, 40))
    scatter(img, rng, CLOUD, {'a': '#ffffff', 'b': '#dfe6ee'}, 14, avoid_band=False)   # steam
    scatter(img, rng, BOULDER, {'a': '#4a3c3c', 'b': '#1e1618'}, 30, shadow_w=lambda w: w)
    scatter(img, rng, CRYSTAL, {'a': '#dff4ff', 'b': '#7fb6da'}, 18, shadow_w=lambda w: w)   # ice spires
    sparkle(img, rng, 90, '#ffffff'); sparkle(img, rng, 40, '#ffb36b')
    return edge_vignette(img, 0.3)


TENT = ["...a...", "..aba..", ".abbba.", "abbbbba", "abcccba"]
BANNER = ["ab", "aa", "a.", "a.", "a."]
WALL = ["aaaa", "abba", "abba"]


def m23(rng):  # The Goldfeather Siege (2026-10-17, Map 23): trampled fields outside the walls, siege camps, trenches, the wall along the top
    img = dither_palette(fbm(rng, W, H), ['#6b5a3a', '#7d6a44', '#8f7a50', '#a38c5e', '#b49c6c'])
    mud = fbm(rng, W, H, (32, 16), (0.7, 0.3))
    blend_mask(img, np.clip((mud - 0.64) * 6, 0, 1), '#5a4a32')   # churned mud
    for y in range(0, 12):   # the curtain wall along the top edge, with merlons
        img[y, :] = np.array(hexrgb('#7a746a' if y > 2 else '#8a8478'), dtype=img.dtype)
    for x in range(0, W, 8): img[0:3, x:x + 4] = np.array(hexrgb('#5e5950'), dtype=img.dtype)
    img[12:14, :] = np.array(hexrgb('#3a3630'), dtype=img.dtype)
    for x in (40, 128, 216):   # trench lines across the field
        for y in range(30, H - 10, 3): img[y, x:x + 2] = np.array(hexrgb('#3e3222'), dtype=img.dtype)
    scatter(img, rng, TENT, {'a': '#e8dcc0', 'b': '#c9b48a', 'c': '#5a4632'}, 14, shadow_w=lambda w: w)
    scatter(img, rng, BANNER, {'a': '#4a3a2a', 'b': '#d9a23a'}, 16)
    scatter(img, rng, TUFT, {'a': '#a8a060'}, 120, avoid_band=False)
    scatter(img, rng, ROCK, {'a': '#9a8a70', 'b': '#5a4a38'}, 30)
    return edge_vignette(img, 0.3)


def m24(rng):  # Goldfeather Keep (2026-10-17, Map 24): inside the walls, flagstone courtyard, a fountain, gold banners, the keep's shadow
    img = dither_palette(fbm(rng, W, H, (16, 8, 4), (0.5, 0.3, 0.2)), ['#6a655c', '#7a756a', '#8a8478', '#9a9486', '#aaa496'])
    for x in range(0, W, 16): img[:, x] = np.array(hexrgb('#5a564e'), dtype=img.dtype)   # flagstone joints
    for y in range(0, H, 12): img[y, :] = np.array(hexrgb('#5a564e'), dtype=img.dtype)
    ponds(img, rng, 1, '#4f8fb3', '#8fc4dc', '#c9c2b0', rmin=10, rmax=12)   # the courtyard fountain
    grass = fbm(rng, W, H, (32, 16), (0.7, 0.3))
    blend_mask(img, np.clip((grass - 0.68) * 6, 0, 1), '#5f7a3a')   # kept lawns
    scatter(img, rng, WALL, {'a': '#4a463e', 'b': '#6a655a'}, 26, shadow_w=lambda w: w)
    scatter(img, rng, BANNER, {'a': '#3a2a1a', 'b': '#e8c46a'}, 18)
    scatter(img, rng, BUSH, {'a': '#d9a23a', 'b': '#3f5a2a'}, 22)
    sparkle(img, rng, 50, '#ffe38a')   # coins everywhere: it is the Magnate's house
    return edge_vignette(img, 0.35)


# The Sunken Depths (2026-10-15, user: "The sunken depth background is too low-res. I think follow the same format you have done for
# the other backgrounds."): it was the AI "Sunken Ferry" picture squeezed into 256x144, which smeared into mush when upscaled. Now it
# is painted here like every other map: a dark sea floor with sand ridges, the wrecked ferry's hull and planks, kelp, coral, rocks,
# drifting bubbles and the odd bioluminescent glint.
HULL = ["....aaaaaaaaaaaaaaaaa.....", "..aabbbbbbbbbbbbbbbbbbaa..", ".abbcbbbbcbbbbcbbbbcbbbba.", "abbbcbbbbcbbbbcbbbbcbbbbba",
        "abbbcbbbbcbbbbcbbbbcbbbbba", ".abbcbbbbcbbbbcbbbbcbbbba.", "..aabbbbbbbbbbbbbbbbbbaa..", "....aaaaaaaaaaaaaaaaa....."]
PLANK = ["aaaaaab", "bbbbbbb"]
KELP = [".a.", "a..", ".a.", "..a", ".a.", "a..", ".b."]
BUBBLE = [".a.", "a.a", ".a."]


def mj(rng):
    img = dither_palette(fbm(rng, W, H), ['#04121c', '#071a27', '#0b2433', '#103041', '#173d4f'])
    sand = fbm(rng, W, H, (64, 32), (0.7, 0.3))
    blend_mask(img, np.clip((sand - 0.6) * 6, 0, 1), '#1f4a55')
    blend_mask(img, np.clip((sand - 0.7) * 6, 0, 1), '#2c5e66')
    for x, y in ((150, 14), (22, 104)):   # the wreck, off the middle band, in two pieces
        shadow(img, x + 2, y + 7, 26, 3, 0.55)
        stamp(img, HULL, x, y, {'a': '#2a1c14', 'b': '#4a3324', 'c': '#5e4430'})
    scatter(img, rng, PLANK, {'a': '#5a3e2a', 'b': '#3a281c'}, 22, shadow_w=lambda w: w)
    scatter(img, rng, KELP, {'a': '#2f8a5a', 'b': '#1c5a3a'}, 60, avoid_band=False)
    scatter(img, rng, CORAL, {'a': '#d0607a', 'b': '#8a3450'}, 18)
    scatter(img, rng, BOULDER, {'a': '#2a4450', 'b': '#0f222b'}, 34, shadow_w=lambda w: w)
    scatter(img, rng, BUBBLE, {'a': '#7fc6d6'}, 26, avoid_band=False)
    sparkle(img, rng, 70, '#7ff3e6'); sparkle(img, rng, 24, '#ffe38a')   # bioluminescence, an anglerfish's lure
    return edge_vignette(img, 0.4)


def mtut(rng):  # Tutorial (2026-10-13): a gentle training meadow, trampled practice rings, a brook
    img = mq(rng)
    ring = fbm(rng, W, H, (32, 16), (0.7, 0.3))
    blend_mask(img, np.clip((ring - 0.66) * 7, 0, 1), '#b59a62')  # worn patches where everyone practises
    return img


# The Arena (2026-10-17, user: "Improve the Arena UI UX and look and feel. Is there a thematic background and other elements we can
# also use."): a tourney ground seen from above. Raked sand in an oval, a timber barrier round it, stone tiers packed with a crowd
# (a pixel each), and pennant poles on the wall. The middle band, where the cards fight, is plain sand.
PENNANT = ["c....", "caaab", "caaa.", "caa..", "ca...", "c....", "c....", "c...."]


def marena(rng):
    ys, xs = np.mgrid[0:H, 0:W]
    e = np.sqrt(((xs - W / 2) / (W * 0.47)) ** 2 + ((ys - H / 2) / (H * 0.44)) ** 2)   # the oval: <1 sand, >1 stands
    sand = dither_palette(fbm(rng, W, H, (32, 16, 8), (0.5, 0.3, 0.2)), ['#a7814f', '#b58e58', '#c29a62', '#cfa86e', '#d8b47a'], 0.8)
    img = sand.copy()
    rake = (np.sin((ys + 0.6 * np.sin(xs / 23.0) * 4) / 2.2) > 0.86) & (e < 0.9) & (np.abs(ys - H / 2) > H * 0.17)
    img[rake] = (img[rake] * 0.9).astype(np.uint8)   # rake lines, off the middle band
    scuff = fbm(rng, W, H, (24, 12), (0.6, 0.4))
    blend_mask(img, np.clip((scuff - 0.7) * 5, 0, 1) * (e < 0.85), '#9a774a')   # scuffed where fighters stood
    # the stands: stone tiers in rings, each ring a little darker, packed with a crowd
    tiers = ['#7a7266', '#6c6458', '#5e574c', '#504a41', '#433e36']
    for k, c in enumerate(tiers):
        m = (e >= 1.06 + k * 0.09) & (e < 1.06 + (k + 1) * 0.09)
        img[m] = hexrgb(c)
        joint = m & ((xs + k * 3) % 9 == 0)
        img[joint] = (img[joint] * 0.8).astype(np.uint8)
    img[e >= 1.06 + len(tiers) * 0.09] = hexrgb('#38332c')
    crowd = (e >= 1.08) & (rng.random((H, W)) < 0.3) & ((ys + (xs // 3)) % 3 != 0)
    cols = np.array([hexrgb(c) for c in ['#c0392b', '#2e86c1', '#e8c46a', '#f0e6d2', '#6c3483', '#1e8449', '#d35400', '#a0522d']], dtype=np.uint8)
    img[crowd] = cols[rng.integers(0, len(cols), crowd.sum())]
    # the timber barrier round the sand, with its shadow on the sand
    img[(e >= 1.0) & (e < 1.06)] = hexrgb('#6b4423')
    img[(e >= 1.0) & (e < 1.02)] = hexrgb('#8a5a2e')
    img[(e >= 0.965) & (e < 1.0)] = (img[(e >= 0.965) & (e < 1.0)] * 0.72).astype(np.uint8)
    post = (e >= 1.0) & (e < 1.06) & ((np.degrees(np.arctan2(ys - H / 2, xs - W / 2)) + 360) % 15 < 2.2)
    img[post] = hexrgb('#4a2e16')
    # pennant poles on the wall, in the house colours
    for i in range(18):
        a = i / 18 * 2 * math.pi + 0.09
        x, y = int(W / 2 + math.cos(a) * W * 0.47 * 1.03) - 1, int(H / 2 + math.sin(a) * H * 0.44 * 1.03) - 8
        c = ['#c0392b', '#2e86c1', '#e8c46a', '#1e8449'][i % 4]
        stamp(img, PENNANT, x, y, {'a': c, 'b': '#f6f0e0', 'c': '#3a2a1a'})
    # gates at the two ends of the oval
    for gx in (int(W * 0.03), int(W * 0.97) - 6):
        img[H // 2 - 7:H // 2 + 7, gx:gx + 6] = hexrgb('#2a1c10')
        img[H // 2 - 7:H // 2 + 7:3, gx:gx + 6] = hexrgb('#5a3a1e')
    sparkle(img, rng, 30, '#e9d9b0')   # glints in the sand
    return edge_vignette(img, 0.35)


# The Abyss (2026-10-17, user: "The raid background is wrong too. it should be deep in the sea."): the floor of a deep trench, far below
# the light. Dark blue silt in long ridges, a rift down one side, black rocks, tube-worm clumps, the ribs of an old whale fall, and the
# odd bioluminescent glint. The light shafts and the drifting marine snow are CSS layers on top (.battlefield.map-mabyss).
RIB = ["a.......a", "a.......a", ".a.....a.", "..a...a..", "...aaa..."]
WORM = ["a.a.a", "b.b.b", "bbbbb"]
ANGLER = ["..c", ".a.", "aaa"]


def mabyss(rng):
    ys, xs = np.mgrid[0:H, 0:W]
    base = fbm(rng, W, H, (48, 24, 12), (0.55, 0.3, 0.15))
    base = np.clip(base * 0.85 + (1 - ys / H) * 0.15, 0, 1)   # a touch lighter toward the top, where the light falls from
    img = dither_palette(base, ['#020a14', '#04101e', '#061628', '#0a1e34', '#0f2742'], 0.9)
    ridges = np.sin((xs * 0.08 + ys * 0.35) + fbm(rng, W, H, (32, 16), (0.7, 0.3)) * 6)
    blend_mask(img, np.clip((ridges - 0.82) * 6, 0, 1) * (np.abs(ys - H / 2) > H * 0.16), '#123050')
    # the rift: a black crack along the bottom-left
    cx = W * (0.18 + 0.05 * np.sin(ys / 9.0))
    rift = np.abs(xs - cx - (ys - H) * 0.5) < (2 + value_noise(rng, W, H, 6) * 3)
    img[rift & (ys > H * 0.62)] = hexrgb('#00040a')
    scatter(img, rng, BOULDER, {'a': '#16304a', 'b': '#050e18'}, 26, shadow_w=lambda w: w)
    scatter(img, rng, ROCK, {'a': '#1a3654', 'b': '#07121e'}, 30)
    scatter(img, rng, WORM, {'a': '#e8505a', 'b': '#d8d0c0'}, 10)
    for x, y in ((186, 16), (40, 22), (206, 112)):   # an old whale fall, off the middle band
        stamp(img, RIB, x, y, {'a': '#9fb4c0'})
        stamp(img, RIB, x + 10, y + 1, {'a': '#8aa0ad'})
    scatter(img, rng, ANGLER, {'a': '#0a1a2a', 'c': '#ffe38a'}, 4)
    sparkle(img, rng, 90, '#3fd8e8'); sparkle(img, rng, 26, '#9a7cff'); sparkle(img, rng, 10, '#ffe38a')   # bioluminescence
    img = edge_vignette(img, 0.5)
    # light shafts from far above, painted in (a dithered lift in slanted bands that fades with depth), so the board pays nothing for them
    for x0, slope, w, a in ((0.10, 0.22, 0.05, 0.30), (0.36, 0.12, 0.03, 0.22), (0.60, -0.08, 0.06, 0.32), (0.83, -0.2, 0.03, 0.2)):
        cx = W * x0 + (ys - 0) * slope
        band = np.clip(1 - np.abs(xs - cx) / (W * w), 0, 1) * np.clip(1 - ys / (H * 1.1), 0, 1) * a
        lift = (band + BAYER[ys % 4, xs % 4] * 0.08) > 0.06
        img[lift] = np.clip(img[lift].astype(np.int32) + (band[lift][:, None] * np.array([120, 170, 210])).astype(np.int32), 0, 255).astype(np.uint8)
    return img


PAINTERS = {k: v for k, v in globals().items() if k[0] == 'm' and (k[1:].isdigit() or k in ('mf', 'mb', 'mg', 'mu', 'mp', 'mc', 'mw', 'mk', 'mh', 'mr', 'ml', 'mt', 'md', 'my', 'mq', 'mz', 'me', 'mtut', 'mj', 'marena', 'mabyss'))}


# 2026-10-15 (user: "could we swap out Map 0 and Map 1's backgrounds. I think the wetter one makes sense for the next map."):
# the Outskirts (m1, Map 0) now get the dry meadow painted for Thistlewood, and Thistlewood (mf, Map 1) the stream-and-pond
# forest painted for the Outskirts. Painter AND seed follow the art, so a re-run reproduces the swapped files exactly.
ART_SOURCE = {'m1': 'mf', 'mf': 'm1'}


def make(map_id):
    src = ART_SOURCE.get(map_id, map_id)
    rng = np.random.default_rng(abs(hash(src)) % (2 ** 32) if False else sum(map(ord, src)) * 7919)
    img = PAINTERS[src](rng)
    os.makedirs(OUT, exist_ok=True)
    path = os.path.join(OUT, map_id + '.png')
    Image.fromarray(img, 'RGB').quantize(colors=48, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.NONE).save(path, optimize=True)
    return path


if __name__ == '__main__':
    ids = sys.argv[1:] or sorted(PAINTERS, key=lambda k: int(k[1:]) if k[1:].isdigit() else 0)
    for mid in ids:
        p = make(mid)
        print('wrote', os.path.relpath(p, ROOT), os.path.getsize(p) // 1024, 'KB')
