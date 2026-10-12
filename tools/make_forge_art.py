#!/usr/bin/env python3
"""Pixel-art Forge backdrop and anvil (2026-10-12, user: "Proper forge art for the background and the anvil").

    python3 tools/make_forge_art.py   -> art/forge/bg.png (256x144) and art/forge/anvil.png (64x40, transparent)

Drawn in code in the same style as tools/make_map_backgrounds.py (small logical canvas, shown upscaled with crisp
pixels), so it ships now; the PixelLab versions are queued in art_staging/jobs_forge_2026_10_12.json and replace
these files when they come back. Deterministic.
"""
import os
import numpy as np
from PIL import Image

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
OUT = os.path.join(ROOT, 'art', 'forge')
BAYER = np.array([[0, 8, 2, 10], [12, 4, 14, 6], [3, 11, 1, 9], [15, 7, 13, 5]]) / 16.0 - 0.5


def rgb(h):
    h = h.lstrip('#'); return np.array([int(h[i:i + 2], 16) for i in (0, 2, 4)], dtype=float)


def rect(img, x0, y0, x1, y1, col):
    img[max(0, y0):max(0, y1), max(0, x0):max(0, x1)] = col


def background(rng):
    W, H = 256, 144
    img = np.zeros((H, W, 3))
    # soot-dark brick wall: staggered bricks with mortar, each brick a slightly different tone
    mortar, bricks = rgb('#1c1512'), [rgb('#3b2721'), rgb('#432b23'), rgb('#4a2f25'), rgb('#36241f'), rgb('#3f2a26')]
    img[:] = mortar
    bh, bw = 8, 18
    for row in range(H // bh + 1):
        off = (bw // 2) if row % 2 else 0
        for col in range(-1, W // bw + 2):
            x0, y0 = col * bw + off, row * bh
            c = bricks[rng.integers(len(bricks))] * rng.uniform(.9, 1.08)
            rect(img, x0 + 1, y0 + 1, x0 + bw - 1, y0 + bh - 1, c)
            rect(img, x0 + 1, y0 + 1, x0 + bw - 1, y0 + 2, c * 1.12)          # top lip catches the light
    # the hearth: a stone arch at the bottom centre, a black firebox, coals and flames
    cx, top, bot, half = 128, 70, 134, 46
    stone = [rgb('#6a625c'), rgb('#5a534e'), rgb('#77706a')]
    for y in range(top - 12, bot):
        for x in range(cx - half - 12, cx + half + 12):
            dx = (x - cx) / (half + 12); dy = (y - (top + 6)) / 18.0
            if y < top + 6 and dx * dx + dy * dy > 1: continue
            img[y, x] = stone[(x // 6 + y // 5) % 3] * (0.92 + 0.1 * ((x * 7 + y * 13) % 5) / 5)
    for y in range(top, bot):
        for x in range(cx - half, cx + half):
            dx = (x - cx) / half; dy = (y - (top + 12)) / 12.0
            if y < top + 12 and dx * dx + dy * dy > 1: continue
            img[y, x] = rgb('#120c0a')
    # coals and flames inside the firebox
    for y in range(bot - 26, bot):
        for x in range(cx - half + 4, cx + half - 4):
            t = (y - (bot - 26)) / 26.0
            n = rng.random()
            flame_h = 0.55 + 0.45 * np.sin((x - cx) / 6.0) ** 2
            if t > 0.75:
                img[y, x] = rgb('#ff8a1e') if n > .55 else rgb('#c43d12') if n > .2 else rgb('#3a1410')
            elif t > 1 - flame_h:
                k = (t - (1 - flame_h)) / flame_h
                col = rgb('#ffe28a') * (1 - k) + rgb('#ff6a14') * k if k < .6 else rgb('#ff6a14') * (1.6 - k) + rgb('#b52a0c') * (k - .6)
                if n + BAYER[y % 4, x % 4] * .4 > .25: img[y, x] = col
    # hood and chimney above the hearth
    for y in range(18, top - 12):
        w = int(28 + (y - 18) * 0.9)
        for x in range(cx - w, cx + w):
            img[y, x] = rgb('#2a2b30') * (0.85 + 0.25 * (1 - abs(x - cx) / w))
        img[y, cx - w] = rgb('#4a4c54'); img[y, cx + w - 1] = rgb('#17181b')
    rect(img, cx - 20, 0, cx + 20, 18, rgb('#25262b')); rect(img, cx - 20, 0, cx - 18, 18, rgb('#3e4047'))
    rect(img, cx - 70, top - 13, cx + 70, top - 9, rgb('#4f5158')); rect(img, cx - 70, top - 13, cx + 70, top - 12, rgb('#7a7c84'))
    # tools on the wall: hammer, tongs, horseshoes on a rack, a bellows and a water barrel
    def hammer(x, y):
        rect(img, x, y, x + 2, y + 22, rgb('#7a5230')); rect(img, x - 4, y - 4, x + 6, y + 1, rgb('#8b8f99')); rect(img, x - 4, y - 4, x + 6, y - 3, rgb('#b8bcc5'))
    def tongs(x, y):
        for i in range(22):
            img[y + i, x + i // 6] = rgb('#5e626b'); img[y + i, x + 5 - i // 6] = rgb('#4a4d55')
    def shoe(x, y):
        for a in np.linspace(0.2, np.pi - 0.2, 14):
            px, py = int(x + 4 * np.cos(a)), int(y + 5 * np.sin(a)); img[py, px] = rgb('#9aa0aa'); img[py, px + 1] = rgb('#6e737c')
    rect(img, 18, 28, 64, 30, rgb('#5a3a22'))
    for x in (24, 40, 56): rect(img, x, 30, x + 1, 32, rgb('#9aa0aa'))
    hammer(24, 33); tongs(38, 32); hammer(55, 33)
    rect(img, 192, 26, 240, 28, rgb('#5a3a22'))
    for x in (198, 212, 226): shoe(x, 30)
    # bellows on the left of the hearth
    for y in range(104, 126):
        w = int(6 + (y - 104) * 0.7)
        for x in range(46 - w, 46 + w): img[y, x] = rgb('#6b4426') if (y // 3) % 2 else rgb('#5a3820')
    rect(img, 44, 96, 48, 104, rgb('#3e2a1a')); rect(img, 44, 126, 48, 134, rgb('#3e2a1a'))
    # water barrel on the right
    for y in range(102, 136):
        for x in range(200, 226):
            dx = abs(x - 213) / 13
            img[y, x] = rgb('#6a4424') * (0.75 + 0.35 * (1 - dx))
    for y in (106, 120, 132): rect(img, 200, y, 226, y + 2, rgb('#4a4d55'))
    rect(img, 202, 102, 224, 104, rgb('#2c4a6a'))
    # stone floor
    for y in range(134, H):
        for x in range(W):
            img[y, x] = rgb('#2a2220') * (0.9 + 0.2 * (((x // 10) + (y // 4)) % 2))
    # warm light from the fire falling off across the wall, with dithering
    ys, xs = np.mgrid[0:H, 0:W]
    d = np.sqrt(((xs - cx) / 120.0) ** 2 + ((ys - 120) / 90.0) ** 2)
    glow = np.clip(1.2 - d, 0, 1) ** 1.6 + BAYER[ys % 4, xs % 4] * 0.08
    warm = rgb('#ff8a3a')
    img = img * (0.55 + 0.6 * glow[..., None]) + warm * (0.28 * glow[..., None])
    # embers floating up from the hearth
    for _ in range(40):
        x, y = int(cx + rng.normal(0, 30)), int(rng.uniform(20, top))
        if 0 <= x < W: img[y, x] = rgb('#ffcf6a') if rng.random() > .4 else rgb('#ff7a2a')
    return Image.fromarray(np.clip(img, 0, 255).astype(np.uint8))


def anvil():
    W, H = 64, 40
    img = np.zeros((H, W, 4))
    def px(x, y, c, a=255): img[y, x, :3] = rgb(c); img[y, x, 3] = a
    # face (top) with the horn tapering off to the left and the heel squared on the right
    for y in range(4, 12):
        for x in range(4, 60):
            horn = x < 20
            if horn:
                top = 4 + (20 - x) * 0.22 + (y - 4) * 0
                if y < 4 + (20 - x) * 0.14 or y > 11 - (20 - x) * 0.3: continue
            c = '#d4d8e0' if y == 4 or (horn and y < 6) else '#9aa0ab' if y < 7 else '#6f7581' if y < 10 else '#4b505a'
            px(x, y, c)
    # hardy and pritchel holes
    for x, y in ((50, 5), (51, 5), (44, 5)): px(x, y, '#2a2d33')
    # waist: narrows under the face and flares out to the feet
    for y in range(12, 22):
        hw = 15 - 6 * np.sin(np.pi * (y - 12) / 10)
        for x in range(int(39 - hw), int(39 + hw) + 1):
            px(x, y, '#858b96' if x < 33 else '#5f646e' if x < 45 else '#3d4149')
    # feet
    for y in range(22, 27):
        for x in range(16, 60):
            c = '#8a909b' if y == 22 else '#5a5f69' if y < 25 else '#3a3e45'
            px(x, y, c)
    # oak stump it sits on
    for y in range(27, 40):
        for x in range(20, 56):
            c = '#7a5230' if (x - 20) % 7 else '#5c3c22'
            if y == 27: c = '#a77a4a'
            px(x, y, c)
    for x in range(20, 56): px(x, 39, '#3e2814')
    return Image.fromarray(img.astype(np.uint8), 'RGBA')


if __name__ == '__main__':
    os.makedirs(OUT, exist_ok=True)
    rng = np.random.default_rng(1012)
    background(rng).save(os.path.join(OUT, 'bg.png'))
    anvil().save(os.path.join(OUT, 'anvil.png'))
    print('wrote', OUT)
