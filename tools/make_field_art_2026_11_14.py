#!/usr/bin/env python3
"""Fifteen Environment cards that still showed their icon get scenes (2026-11-14, package ART13).

Owner 11-14 11:11: "cards like windfall do not have art yet." A sweep of every FIELD_ART lookup found no key (so the tile fell back to
its emoji) for Windfall, Seasons, Quiet Contemplation and the twelve selfish boons (Blind Fury, Hive Chorus, Rising Tide, Second Burrow,
Wild Rage, Snow Veil, Sand Veil, Restless Dead, Ember-born, Siege Train, Venom Glands, Sky Ambush). Painted in code in the house style of
tools/make_field_art_2026_11_05.py (Pillow + numpy, no art credits, no downloads): 128 px painted, shown at 256 px, banded dithered
skies, outlined shapes, 64 colours. Deterministic; re-run any time.

    python3 tools/make_field_art_2026_11_14.py              -> all fifteen scenes in art/fields/ + docs/art/art13-fields-contact.png
    python3 tools/make_field_art_2026_11_14.py windfall     -> just that one

Never replaces an existing scene: a name whose art/fields file already exists is skipped unless --force.
"""
import os, sys, math
import numpy as np
from PIL import Image, ImageDraw
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import make_map_backgrounds as M
from make_field_art_2026_10_18 import (N, YS, XS, BAY, ROOT, OUT, C, canvas, fill, ell, poly, rect, line, dilate, shift, outlined,
                                       vgrad, field_grad, glow, mask_glow, ridge, below, hill, stars, tufts, dots, finish, cloud,
                                       round_tree, pine, streak_cloud)


def noisy(rng, cell, cell2=None):
    n = M.value_noise(rng, N, N, cell)
    return n if cell2 is None else n * 0.65 + M.value_noise(rng, N, N, cell2) * 0.35


def speckle(img, rng, n, mask, colors, ymin=0):
    for _ in range(n):
        x, y = int(rng.integers(0, N)), int(rng.integers(ymin, N))
        if mask[y, x]:
            img[y, x] = C(colors[int(rng.integers(0, len(colors)))])


def leaf(img, x, y, col, hi=None):
    for dx, dy in ((0, 0), (1, 0), (1, 1)):
        if 0 <= x + dx < N and 0 <= y + dy < N:
            img[y + dy, x + dx] = C(col)
    if hi and 0 <= x < N and 0 <= y < N:
        img[y, x] = C(hi)


def bird(img, x, y, s, col):
    """A gliding raptor seen from below: body, two swept wings, a short tail (outline reads at 128 px)."""
    wing = poly([(x - s * 3, y - s * 0.4), (x - s * 0.5, y - s * 0.9), (x, y + s * 0.3), (x - s * 1.4, y + s * 0.3)]) | \
        poly([(x + s * 3, y - s * 0.4), (x + s * 0.5, y - s * 0.9), (x, y + s * 0.3), (x + s * 1.4, y + s * 0.3)])
    body = ell(x, y, s * 0.55, s * 1.2) | poly([(x - s * 0.5, y + s), (x + s * 0.5, y + s), (x, y + s * 2)])
    m = wing | body
    fill(img, dilate(m) & ~m, '#12151f'); fill(img, m, col)
    fill(img, ell(x, y - s * 0.9, s * 0.45), '#f2e6c0')
    return m


# ---------------------------------------------------------------- scenes
def s_windfall(rng):  # a storm has passed: broken boughs and logs across a forest floor
    img = canvas()
    vgrad(img, ['#46586e', '#5e7288', '#7c92a4', '#a4b8bc', '#cfd8c4'], 0, 62)
    for cx, cy, w in ((24, 12, 34), (72, 8, 40), (112, 18, 30), (48, 30, 30), (98, 40, 34)):
        cloud(img, cx, cy, w, '#c8d4dc', '#8a9cb0', '#5a6c84', rng)
    glow(img, 96, 58, 34, '#ffe6a0', amt=0.4, steps=4)
    h = ridge(rng, 58, 8, 26)
    hill(img, h, ['#324a3a', '#2a4032', '#22342a'], 18, rim='#4a6a50')
    for x in (6, 20, 38, 70, 90, 108, 120):  # standing trunks, bent by the wind
        yb = int(h[x]) + 4
        lean = int(rng.integers(-3, 4))
        t = poly([(x - 2, 0), (x + 1, 0), (x + 1 + lean, yb), (x - 2 + lean, yb)])
        outlined(img, t, '#0e1812', '#4a3a2a'); fill(img, t & (XS <= x - 1), '#6a5238')
    ground = below(ridge(rng, 80, 4, 20))
    field_grad(img, (YS - 78) / 50.0 + noisy(rng, 10) * 0.3, ['#4a6a3a', '#3a5a32', '#2e4a2a', '#24402a'], ground)
    tufts(img, rng, 300, ground, '#1c3420', '#8cb85a', ymin=80, tall=3)
    # the fallen boughs: a big trunk, a snapped limb with leaves, a stack of cut logs
    trunk = poly([(4, 108), (92, 94), (96, 104), (6, 120)])
    outlined(img, trunk, '#150e08', '#6a4a30'); fill(img, trunk & (YS < 100 + (XS * -0.12)), '#8a6642')
    for i in range(7):
        x = 12 + i * 12
        fill(img, line([(x, 112 - i * 2), (x + 5, 108 - i * 2)], 1), '#4a3220')
    end = ell(94, 99, 4, 6)
    outlined(img, end, '#150e08', '#d8b878'); fill(img, ell(94, 99, 2, 3), '#a8844c'); fill(img, ell(94, 99, 1), '#7a5a34')
    limb = line([(60, 92), (80, 78), (104, 70), (122, 66)], 3)
    outlined(img, limb, '#150e08', '#5a4028')
    for x, y in ((84, 76), (96, 72), (108, 68), (118, 64), (100, 78), (112, 74), (90, 70)):
        m = ell(x, y, 4, 2.6)
        outlined(img, m, '#14260f', '#5a9a3a'); fill(img, m & (YS < y), '#86c250')
    for i in range(3):  # stacked cut logs
        for j in range(3 - i):
            x, y = 104 + i * 8 + j * 0, 120 - i * 7
            lg = ell(x + j * 9 - i * 4, y, 4.5, 4.5)
            outlined(img, lg, '#150e08', '#c89a5a'); fill(img, ell(x + j * 9 - i * 4, y, 2.5), '#e0b878'); fill(img, ell(x + j * 9 - i * 4, y, 1), '#9a6a38')
    for _ in range(46):  # leaves still on the wind
        x, y = int(rng.integers(2, N - 3)), int(rng.integers(8, 90))
        leaf(img, x, y, ['#8ac04a', '#e0b030', '#c8782a'][int(rng.integers(0, 3))], '#e8f0a8')
    return finish(img, 0.35)


def s_seasons(rng):  # one old oak, four strips: spring, summer, autumn, winter
    img = canvas()
    w = N // 4
    quarters = [
        (0, ['#8ac8f0', '#b4dcf4', '#e0f0f4'], ['#6aae48', '#58983c', '#46802f'], ('#3f8a3a', '#68b44a', '#f4b8d0'), 'spring'),
        (w, ['#2f7fd6', '#5aa4e8', '#a8d4f2'], ['#c8b848', '#a8a038', '#88883a'], ('#2a6a2c', '#3f9a38', '#7ac848'), 'summer'),
        (2 * w, ['#e8c890', '#e4a868', '#d88a58'], ['#a86a30', '#8a5428', '#6a4224'], ('#b8481c', '#e08a1c', '#f0c038'), 'autumn'),
        (3 * w, ['#a8b8cc', '#c8d4e0', '#eef2f6'], ['#e8eef4', '#cdd8e4', '#b0c0d4'], ('#6a5a4a', '#8a7a6a', '#f4f8ff'), 'winter'),
    ]
    gy = 88
    for x0, sky, gr, crown, kind in quarters:
        qm = (XS >= x0) & (XS < x0 + w)
        vgrad(img, sky, 0, gy, mask=qm & (YS < gy))
        gm = qm & (YS >= gy + 3 * np.sin(XS * 0.25))
        field_grad(img, (YS - gy) / 40.0, gr, gm)
        if kind == 'summer':
            glow(img, x0 + 20, 16, 26, '#fff4b8', amt=0.85, steps=5, mask=qm.astype(np.float32))
            fill(img, ell(x0 + 20, 16, 6, 6) & qm, '#fff8d0')
        if kind == 'winter':
            fill(img, qm & (YS < 22) & (BAY > 0.3), '#d8e0ec')
            fill(img, gm & (noisy(rng, 5) > 0.7), '#ffffff')
        if kind == 'autumn':
            fill(img, ell(x0 + 14, 22, 7, 7) & qm, '#f8d098'); fill(img, ell(x0 + 14, 22, 4, 4) & qm, '#fff0c8')
        if kind == 'spring':
            cloud(img, x0 + 14, 22, 20, '#ffffff', '#f0f6fa', '#d4e2ec', rng)
            speckle(img, rng, 40, gm, ['#f8b4d0', '#ffffff', '#f4e060'], gy)
    trunk = poly([(57, 124), (60, 70), (56, 52), (72, 52), (68, 70), (71, 124)]) | line([(60, 70), (42, 50)], 4) | line([(68, 70), (88, 50)], 4) | \
        line([(58, 60), (60, 34)], 3) | line([(70, 60), (70, 30)], 3)
    outlined(img, trunk, '#120c08', '#5a4030'); fill(img, trunk & ~shift(trunk, 2, 0), '#7a5a3e')
    crown_shape = ell(64, 36, 48, 26) | ell(28, 50, 22, 14) | ell(100, 50, 22, 14)
    for x0, sky, gr, crown, kind in quarters:
        qm = (XS >= x0) & (XS < x0 + w)
        cm = crown_shape & qm
        if kind == 'winter':  # bare twigs with a skin of snow
            fill(img, cm & (noisy(rng, 3) > 0.7), '#4a3a2c')
            fill(img, cm & (noisy(rng, 4) > 0.8), '#f4f8ff')
            for k in range(14):
                x = x0 + 2 + k * 2
                fill(img, line([(x, 62), (x + int(rng.integers(-4, 5)), 40)], 1) & crown_shape & qm, '#3a2c20')
            continue
        dk, md, lt = crown
        fill(img, dilate(cm) & ~cm & ~crown_shape & qm, '#12180e') if False else None
        fill(img, cm, dk)
        fill(img, cm & (noisy(rng, 5) > 0.42) & (BAY > -0.4), md)
        fill(img, cm & (YS < 38) & (noisy(rng, 4) > 0.58), lt if kind != 'spring' else md)
        top = cm & ~shift(cm, 0, 1)
        fill(img, top, '#12180e')
        if kind == 'spring':
            for _ in range(70):
                x, y = int(rng.integers(0, w)), int(rng.integers(14, 64))
                if cm[y, x]: img[y, x] = C(crown[2]); img[y, min(N - 1, x + 1)] = C('#ffffff')
        if kind == 'autumn':
            for _ in range(24):
                x, y = int(rng.integers(x0, x0 + w - 2)), int(rng.integers(60, 120))
                leaf(img, x, y, ['#c8481c', '#e0881c', '#f0c038'][int(rng.integers(0, 3))])
    for x in (w, 2 * w, 3 * w):
        fill(img, (XS == x) & (YS < 126) & ~trunk, '#1a1410')
    return finish(img, 0.3)


def s_quietcontemplation(rng):  # a still tarn on a high summit at dawn, a stacked cairn, one lotus
    img = canvas()
    vgrad(img, ['#b8c8e0', '#d8d4e4', '#f0d8d8', '#f8e6c8', '#fff2d0'], 0, 70)
    glow(img, 64, 66, 54, '#fff6d8', amt=0.8, steps=5, power=1.2)
    fill(img, ell(64, 70, 10, 10) & (YS < 70), '#fffae8')
    far = ridge(rng, 62, 22, 30)
    hill(img, far, ['#a8b0cc', '#98a2c0', '#8892b4'], 22, rim='#d8dcec')
    mid = ridge(rng, 70, 14, 22)
    hill(img, mid, ['#7a84a8', '#6a7498', '#5a6488'], 18, rim='#b8c0d8')
    water = YS >= 76
    f = (YS - 76) / 52.0
    field_grad(img, f + np.sin(YS * 1.6) * 0.03, ['#e8dcd4', '#c0c4d8', '#8c9cc0', '#5c6c98', '#3a4878'], water)
    refl = water & (np.abs(XS - 64) < 12 - (YS - 76) * 0.14)
    fill(img, refl & (YS % 3 == 0), '#fff2cc')
    for y, r in ((90, 22), (104, 34), (118, 46)):  # ripple rings from the lotus
        ring = ell(64, y, r, r * 0.22) & ~ell(64, y, r - 1, r * 0.22 - 1) & water
        fill(img, ring & (BAY > -0.3), '#e8eaf8')
    # cairn on a flat rock at the right
    rock = poly([(86, 128), (92, 108), (118, 106), (124, 128)])
    outlined(img, rock, '#141620', '#6a6e84'); fill(img, rock & (YS < 112), '#8e92a8')
    for i, (w, hh) in enumerate(((11, 6), (8, 5), (6, 4), (4, 3))):
        yb = 106 - sum(s[1] * 2 - 1 for s in ((11, 6), (8, 5), (6, 4), (4, 3))[:i])
        st = ell(105, yb - hh + 1, w, hh)
        outlined(img, st, '#141620', ['#a8aac0', '#9498b0', '#b4b6ca', '#8a8ea8'][i]); fill(img, st & (YS < yb - hh), '#d4d6e4')
    # lotus
    for dx, ang in ((-9, 0.7), (9, 0.7), (-5, 0.3), (5, 0.3), (0, 0)):
        p = poly([(30 + dx * 0, 100), (30 + dx - 3, 96 - abs(dx) * 0.2), (30 + dx, 88 - (5 - abs(dx)) * 0.7), (30 + dx + 3, 96 - abs(dx) * 0.2)]) if False else None
    cx, cy = 40, 100
    pad = ell(cx, cy + 2, 14, 4); outlined(img, pad, '#143028', '#4a8a5a'); fill(img, pad & (YS < cy + 1), '#78b878')
    for dx in (-8, -4, 4, 8, 0):
        pet = poly([(cx + dx * 0.5, cy), (cx + dx - 2, cy - 8 + abs(dx) * 0.5), (cx + dx * 1.2, cy - 13 + abs(dx) * 0.9), (cx + dx + 2, cy - 8 + abs(dx) * 0.5)])
        outlined(img, pet, '#8a3a5a', '#f6c4d8'); fill(img, pet & (XS <= cx + dx), '#fde4ee')
    fill(img, ell(cx, cy - 4, 2, 2), '#f8d860')
    for _ in range(14):  # a few drifting motes, nothing else moves
        x, y = int(rng.integers(0, N)), int(rng.integers(10, 70))
        img[y, x] = C('#fff8e0')
    return finish(img, 0.3)


def s_blindfury(rng):  # a black cave full of eyes and wings
    img = canvas()
    n = noisy(rng, 20, 8)
    field_grad(img, n, ['#08060c', '#120a14', '#1c1020', '#281830'], np.ones((N, N), bool))
    top = ridge(rng, 22, 20, 14)
    fill(img, ~below(top) & (YS < top[XS]), '#08060c')
    for x in range(4, N, 11):  # stalactites
        ln = int(10 + 22 * noisy(rng, 8)[0, x])
        s = poly([(x - 4, 0), (x + 4, 0), (x, ln)])
        outlined(img, s, '#04030a', '#2a1c34'); fill(img, s & (XS < x), '#3c2848')
    floor = below(ridge(rng, 108, 6, 18))
    field_grad(img, (YS - 104) / 24.0, ['#2c1c34', '#20142a', '#160e1e'], floor)
    fill(img, floor & ~shift(floor, 0, 1), '#4a3258')
    pts = []
    for _ in range(60):
        pts.append((int(rng.integers(6, N - 6)), int(rng.integers(30, 100))))
    for x, y in pts:  # pairs of red eyes
        r = int(rng.integers(1, 3))
        for dx in (-3 * r, 3 * r):
            e = ell(x + dx, y, r + 0.4, r)
            mask_glow(img, e, 4, '#ff2830', amt=0.55, steps=3)
            fill(img, e, '#ff4048'); img[y, x + dx] = C('#fff0a0')
    for bx, by, s in ((30, 60, 4), (96, 50, 5), (64, 84, 6), (110, 86, 3), (16, 90, 3)):  # bats, wings spread
        wl = poly([(bx, by), (bx - s * 3, by - s * 0.8), (bx - s * 2, by + s * 0.2), (bx - s, by + s * 0.7), (bx, by + s * 0.5)])
        wr = poly([(bx, by), (bx + s * 3, by - s * 0.8), (bx + s * 2, by + s * 0.2), (bx + s, by + s * 0.7), (bx, by + s * 0.5)])
        m = wl | wr | ell(bx, by + 1, s * 0.5, s * 0.9)
        fill(img, dilate(m) & ~m, '#3a2048'); fill(img, m, '#0c0810')
        fill(img, ell(bx - 1, by - s * 0.2, 1), '#ff4048'); fill(img, ell(bx + 1, by - s * 0.2, 1), '#ff4048')
    glow(img, 64, 70, 70, '#ff2030', amt=0.14, steps=3)
    return finish(img, 0.5)


def s_hivechorus(rng):  # honeycomb walls, bees and ants humming in rows
    img = canvas()
    field_grad(img, noisy(rng, 24), ['#5a2a08', '#7a3c0c', '#9a500e'], np.ones((N, N), bool))
    R = 11
    dx, dy = R * 1.732, R * 1.5
    for row in range(-1, 12):
        for col in range(-1, 12):
            cx = col * dx + (row % 2) * dx / 2
            cy = row * dy
            hexm = poly([(cx + R * math.sin(math.pi / 3 * k + math.pi / 6) * 0.95 + 0.0, cy + R * math.cos(math.pi / 3 * k + math.pi / 6) * 0.95) for k in range(6)])
            full = (row * 3 + col * 7) % 5
            outlined(img, hexm, '#3a1c04', '#d88a14' if full else '#f2b82c')
            inner = poly([(cx + R * 0.7 * math.sin(math.pi / 3 * k + math.pi / 6), cy + R * 0.7 * math.cos(math.pi / 3 * k + math.pi / 6)) for k in range(6)])
            if full == 0:
                fill(img, inner, '#ffd860'); fill(img, inner & (YS < cy), '#fff0a0')
            elif full == 1:
                fill(img, inner, '#e8a020'); fill(img, inner & (XS < cx), '#f6c850')
            elif full == 2:
                fill(img, inner, '#8a4a10'); fill(img, inner & (YS < cy - 2), '#6a3408')
            else:
                fill(img, inner, '#c47a12'); fill(img, inner & (YS > cy + 2), '#a8620c')
    for x, y in ((24, 30), (86, 22), (60, 62), (104, 80), (28, 96), (74, 110), (112, 44)):  # bees
        body = ell(x, y, 5, 3.4)
        outlined(img, body, '#140a02', '#f4c830')
        for sx in (-1, 0, 2):
            fill(img, rect(x + sx - 1, y - 3, x + sx, y + 3) & body, '#1a0e04')
        wing = ell(x - 1, y - 4, 3, 2) | ell(x + 2, y - 4, 3, 2)
        fill(img, wing, '#e8f4fa'); fill(img, wing & (YS < y - 4), '#ffffff')
        fill(img, ell(x + 5, y, 1.5), '#140a02')
    for x, y in ((46, 44), (96, 100), (12, 70)):  # an ant crossing the comb
        for k in range(3):
            fill(img, ell(x + k * 4, y, 1.8 + (k == 1) * 0.6), '#2a1006')
        fill(img, line([(x - 1, y + 1), (x - 3, y + 3)], 1) | line([(x + 5, y + 1), (x + 4, y + 3)], 1) | line([(x + 9, y + 1), (x + 10, y + 3)], 1), '#2a1006')
    glow(img, 64, 64, 60, '#ffd860', amt=0.2, steps=3)
    return finish(img, 0.4)


def s_risingtide(rng):  # the sea heaving up the shore under a high moon
    img = canvas()
    vgrad(img, ['#0a1a3a', '#12306a', '#1e4c88', '#3a74a8'], 0, 52)
    stars(img, rng, 60, ['#ffffff', '#cfe4ff', '#ffe8a8'], 40)
    glow(img, 96, 20, 30, '#e8f4ff', amt=0.55, steps=5)
    moon = ell(96, 20, 8, 8); fill(img, moon, '#f4f8ff')
    fill(img, ell(99, 22, 2) & moon, '#d8e4f4'); fill(img, ell(92, 17, 1.4) & moon, '#d8e4f4')
    hz = 50
    sea = YS >= hz
    f = (YS - hz) / (N - hz)
    wave = np.sin(XS * 0.22 + YS * 0.7) * 0.5 + np.sin(XS * 0.11 - YS * 0.4) * 0.5
    field_grad(img, f * 0.9 + wave * 0.07, ['#3a78b0', '#2a5c98', '#1c4680', '#12306a', '#0c2050'], sea)
    sh = YS - (118 + 5 * np.sin(XS * 0.12) - (XS * 0.04))
    sand = sh >= 0
    field_grad(img, sh / 16.0, ['#a8946a', '#c4aa78', '#d8c088'], sand)
    wet = sand & (sh < 4)
    fill(img, wet, '#8a7650')
    for k in range(4):  # surf lines, each one higher up the sand
        y0 = 96 + k * 7
        crest = np.abs(YS - (y0 + 3 * np.sin(XS * 0.15 + k))) < 1.1
        fill(img, crest & ~sand | (crest & (sh < 6)), ['#ffffff', '#e4f2fc', '#cfe4f4', '#a8cce4'][k])
        fill(img, (np.abs(YS - (y0 + 2 + 3 * np.sin(XS * 0.15 + k))) < 0.6) & (BAY > 0.2) & ~sand, '#8cc0e0')
    cm = ell(40, 82, 22, 12) & (YS >= 70)  # one great swell, curling
    swell = poly([(0, 118), (12, 90), (30, 72), (50, 70), (66, 78), (74, 92), (80, 118)])
    fill(img, swell & ~sand, '#1c5a98'); fill(img, swell & ~sand & (YS > 96), '#164a84')
    lip = line([(12, 90), (30, 72), (50, 70), (62, 74)], 3)
    fill(img, lip, '#ffffff'); fill(img, dilate(lip) & ~lip & swell, '#cfe8fa')
    for x, y in ((34, 74), (42, 72), (52, 72), (26, 80), (58, 78), (18, 88)):
        img[y, x] = C('#ffffff'); img[y + 1, x + 1] = C('#e4f2fc')
    fill(img, ell(104, 112, 6, 3) & sand, '#7a6840'); fill(img, ell(16, 124, 5, 2) & sand, '#7a6840')
    for _ in range(40):
        x, y = int(rng.integers(0, N)), int(rng.integers(hz + 1, 100))
        if (np.sin(x * 0.4) > 0.3): img[y, x] = C('#fff6c8') if (96 - 12 < x < 96 + 12) else C('#5a8cc0')
    fill(img, (np.abs(XS - 96) < 3 + (YS - hz) * 0.12) & sea & (YS % 3 == 0) & (YS < 100), '#e8f4ff')  # the moon's road
    return finish(img, 0.35)


def s_secondburrow(rng):  # earth in section: a tunnel, and a second one dug beside it
    img = canvas()
    vgrad(img, ['#6ab4e4', '#a8d4ee', '#d4ecf0'], 0, 26)
    top = ridge(rng, 28, 4, 16)
    g = below(top)
    n = noisy(rng, 14, 6)
    field_grad(img, (YS - 28) / 100.0 * 0.7 + n * 0.35, ['#8a5c34', '#74492a', '#5e3a22', '#472a18', '#321c10'], g)
    fill(img, g & ~shift(g, 0, 1), '#5ca040'); fill(img, g & shift(~g, 0, 3) & False, '#3c7a2c')
    fill(img, g & (YS < top[XS] + 3), '#3c7a2c'); tufts(img, rng, 90, ~g & (YS > 20), '#3c7a2c', '#8cd060', ymin=20, tall=3)
    speckle(img, rng, 380, g, ['#3a2214', '#a07844', '#5a3a22', '#8a6038'], 34)
    for _ in range(26):  # pebbles
        x, y = int(rng.integers(4, N - 6)), int(rng.integers(40, N - 4))
        m = ell(x, y, 2.6, 1.8); outlined(img, m, '#2a1a0e', '#9a8a78'); fill(img, m & (YS < y), '#c4b4a0')

    def tunnel(pts, w):
        t = line(pts, w)
        fill(img, dilate(t) & ~t, '#1c1008')
        fill(img, t, '#120a06'); fill(img, t & (BAY > 0.1) & (YS > 0), '#1c120a')
        return t
    t1 = tunnel([(20, 28), (22, 52), (30, 66), (52, 70), (70, 66)], 8)
    t2 = tunnel([(100, 28), (96, 50), (90, 70), (82, 90), (62, 98), (40, 100)], 8)
    ch = ell(36, 100, 20, 10) | ell(84, 66, 10, 7)
    fill(img, dilate(ch) & ~ch, '#1c1008'); fill(img, ch, '#1e130a')
    mask_glow(img, ch, 8, '#ffb040', amt=0.45, steps=3)
    fill(img, ch & (YS > 100), '#4a3018')  # a floor of packed dirt
    fill(img, ell(36, 96, 6, 3) & ch, '#6a4a2a')
    # a lantern-lit pair of eyes in each chamber, a fresh spoil heap at the second entrance
    for ex, ey in ((30, 98), (42, 98), (80, 64), (88, 64)):
        fill(img, ell(ex, ey, 1.6, 1.4), '#fff0b0'); img[ey, ex] = C('#1a1008')
    heap = poly([(88, 28), (100, 18), (114, 28)])
    outlined(img, heap, '#2a1a0e', '#8a5c34'); fill(img, heap & (XS < 100), '#a8743e')
    heap2 = poly([(8, 28), (20, 20), (32, 28)])
    outlined(img, heap2, '#2a1a0e', '#8a5c34'); fill(img, heap2 & (XS < 20), '#a8743e')
    for x, y in ((92, 22), (108, 24), (14, 24), (26, 24)):
        img[y, x] = C('#c8924e')
    return finish(img, 0.4)


def s_wildrage(rng):  # a charge tearing up the ground under a red sky
    img = canvas()
    vgrad(img, ['#2a0608', '#5a0c0c', '#9a1c10', '#d8481c', '#f4902c'], 0, 70)
    glow(img, 64, 70, 60, '#ffd070', amt=0.6, steps=5, power=1.3)
    fill(img, ell(64, 72, 14, 14) & (YS < 72), '#ffe8a0')
    for cx, cy, w in ((20, 16, 36), (86, 12, 44), (60, 36, 32), (110, 40, 28)):
        cloud(img, cx, cy, w, '#c8402a', '#7a1812', '#3a0808', rng)
    far = ridge(rng, 76, 8, 24)
    hill(img, far, ['#3a1010', '#2a0a0a'], 12, rim='#a02818')
    ground = below(ridge(rng, 84, 3, 18))
    field_grad(img, (YS - 82) / 48.0 + noisy(rng, 8) * 0.25, ['#5a2a14', '#46200e', '#321608', '#220e04'], ground)
    speckle(img, rng, 400, ground, ['#1a0a04', '#7a4020', '#3a1a0a'], 84)
    for i in range(3):  # the great claw-gouges across the sky and earth
        x0 = 18 + i * 10
        cl = line([(x0, 6), (x0 + 36, 60), (x0 + 60, 118)], 3)
        fill(img, cl, '#2a0606'); fill(img, dilate(cl) & ~cl, '#ff8a30')
    for i in range(3):
        x0 = 58 + i * 8
        cl = line([(x0, 70), (x0 + 22, 100), (x0 + 36, 126)], 2)
        fill(img, cl, '#120604'); fill(img, dilate(cl) & ~cl, '#4a1c0c')
    for cx, cy, r in ((22, 108, 14), (60, 116, 18), (100, 106, 14), (82, 120, 10)):  # dust thrown up
        for k in range(6):
            a = rng.random() * math.tau
            m = ell(cx + math.cos(a) * r * 0.6, cy + math.sin(a) * r * 0.3, r * (0.35 + rng.random() * 0.2))
            fill(img, m, '#7a4426'); fill(img, m & (YS < cy), '#a86a3c'); fill(img, m & (YS < cy - 5), '#d08c52')
    for _ in range(90):
        x, y = int(rng.integers(0, N)), int(rng.integers(78, N))
        img[y, x] = C('#e8a060')
    # broken turf and a toppled fence-post, hoofprints
    for x in (12, 44, 70, 104):
        for k in range(3):
            fill(img, ell(x + k * 5, 98 + k, 2.2, 1.6), '#14080a')
            fill(img, rect(x + k * 5 - 1, 96 + k, x + k * 5, 97 + k), '#14080a')
    return finish(img, 0.45)


def s_snowveil(rng):  # a hush of falling snow veiling dim pines
    img = canvas()
    vgrad(img, ['#9ab0c8', '#b4c6d8', '#d0dce8', '#e8f0f6'], 0, 76)
    far = ridge(rng, 66, 10, 24)
    hill(img, far, ['#a8bcd0', '#b8c8d8'], 10, rim='#d8e4ee')
    for x, hh in ((10, 24), (30, 30), (52, 22), (74, 28), (98, 24), (118, 30)):
        pine(img, x, 76, hh, ('#5a7488', '#6a8498', '#8aa0b4', '#d8e4ee', '#4a4a4a'), snow=True)
    haze = noisy(rng, 24, 10)
    q = np.clip(np.floor(haze * 4 + BAY * 0.9) / 4, 0, 1) * 0.55
    img[:] = img * (1 - q[..., None] * (YS < 84)[..., None]) + C('#e4ecf4') * (q[..., None] * (YS < 84)[..., None])
    ground = below(ridge(rng, 86, 4, 20))
    field_grad(img, (YS - 84) / 44.0, ['#f4f8fc', '#dce6f0', '#c4d4e4', '#a8bcd2'], ground)
    for x, hh in ((16, 38), (50, 46), (88, 40), (116, 36)):  # foreground pines, bigger and darker
        pine(img, x, 112, hh, ('#12202c', '#2a4a50', '#3c6a68', '#e8f0f4', '#2a1c14'), snow=True)
    fill(img, ground & ~shift(ground, 0, 1), '#ffffff')
    for _ in range(170):  # the veil itself: flakes of three sizes
        x, y = int(rng.integers(0, N - 2)), int(rng.integers(0, N - 2))
        s = int(rng.integers(0, 6))
        img[y, x] = C('#ffffff')
        if s == 0:
            img[y, x + 1] = C('#ffffff'); img[y + 1, x] = C('#ffffff'); img[y + 1, x + 1] = C('#e4eef8')
        elif s < 3:
            img[y, x + 1] = C('#e4eef8')
    return finish(img, 0.3)


def s_sandveil(rng):  # a curtain of wind-blown sand hanging over dunes
    img = canvas()
    vgrad(img, ['#d8a860', '#e4be78', '#f0d498', '#f8e6b8'], 0, 70)
    fill(img, ell(96, 26, 10, 10), '#fff4d0'); glow(img, 96, 26, 30, '#fff4d0', amt=0.5, steps=4)
    for k, (base, stops) in enumerate(((66, ['#c8944c', '#b88040']), (80, ['#d8a458', '#c08c44', '#a87438']), (98, ['#e8b866', '#d29c52', '#b88040', '#9a6a34']))):
        h = ridge(rng, base, 14, 34)
        hill(img, h, stops, 26, rim='#fbe8b0')
    curtain = noisy(rng, 20, 7)
    for y0 in (30, 60, 90):
        band = np.clip(1 - np.abs(YS - y0 - np.sin(XS * 0.08 + y0) * 8) / 18.0, 0, 1)
        f = np.clip(band * (0.35 + curtain), 0, 1)
        q = np.clip(np.floor(f * 4 + BAY * 0.9 + 0.5) / 4, 0, 1) * 0.7
        img[:] = img * (1 - q[..., None]) + C('#f0d090') * q[..., None]
    for _ in range(300):  # streaming grains
        x, y = int(rng.integers(0, N)), int(rng.integers(0, N))
        c = C(['#fff0c0', '#d8a050', '#f6dca0'][int(rng.integers(0, 3))])
        for j in range(1 + int(rng.integers(0, 4))):
            if x + j < N: img[y, x + j] = c
    for x, yb, hh in ((18, 112, 12), (70, 104, 10)):  # half-buried cactus
        cm = rect(x - 2, yb - hh, x + 2, yb) | rect(x - 6, yb - hh * 0.7, x - 3, yb - hh * 0.55) | rect(x - 6, yb - hh * 0.7, x - 5, yb - hh * 0.3) | \
            rect(x + 3, yb - hh * 0.8, x + 6, yb - hh * 0.65) | rect(x + 5, yb - hh * 0.8, x + 6, yb - hh * 0.4)
        outlined(img, cm, '#1a2a12', '#5a8a3a'); fill(img, cm & (XS < x), '#7aaa4c')
    return finish(img, 0.3)


def s_restlessdead(rng):  # a moonlit graveyard under a green mist
    img = canvas()
    vgrad(img, ['#0a0a1c', '#141a30', '#22304a', '#3a4c60'], 0, 60)
    stars(img, rng, 36, ['#cfe4ff', '#ffffff'], 40)
    glow(img, 32, 26, 28, '#c8f0d0', amt=0.5, steps=4)
    mn = ell(32, 26, 9, 9); fill(img, mn, '#e4f4e0'); fill(img, ell(35, 24, 2) & mn, '#c4d8c0')
    for cx, cy, w in ((88, 18, 40), (70, 40, 30)):
        cloud(img, cx, cy, w, '#4a5a74', '#2a364e', '#161c30', rng)
    h = ridge(rng, 66, 8, 24)
    hill(img, h, ['#10181e', '#0c1218'], 12, rim='#26404a')
    for x in (96, 112):  # dead trees
        yb = 70
        fill(img, line([(x, yb), (x, yb - 26)], 2), '#06080c')
        for dy, dx in ((-14, -9), (-10, 8), (-20, 7), (-22, -6)):
            fill(img, line([(x, yb + dy + 4), (x + dx, yb + dy - 2)], 1), '#06080c')
    ground = below(ridge(rng, 78, 3, 18))
    field_grad(img, (YS - 78) / 50.0 + noisy(rng, 8) * 0.2, ['#1c2c28', '#16241f', '#101a16', '#0a110e'], ground)
    tufts(img, rng, 200, ground, '#0a140e', '#3c6a4a', ymin=80, tall=2)
    for x, yb, w, hh, kind in ((14, 98, 14, 22, 'round'), (40, 108, 12, 18, 'cross'), (68, 100, 14, 24, 'round'), (96, 112, 16, 26, 'round'), (118, 100, 10, 16, 'cross')):
        if kind == 'round':
            st = rect(x - w // 2, yb - hh + w // 2, x + w // 2, yb) | ell(x, yb - hh + w // 2, w / 2, w / 2)
        else:
            st = rect(x - 2, yb - hh, x + 2, yb) | rect(x - 7, yb - hh + 5, x + 7, yb - hh + 8)
        outlined(img, st, '#06080c', '#6a7a82'); fill(img, st & (XS < x - 1) & (BAY > -0.5), '#8a9aa0'); fill(img, st & (YS > yb - 4), '#3c4a50')
        if kind == 'round': fill(img, line([(x - 2, yb - hh + w // 2), (x + 2, yb - hh + w // 2)], 1) | line([(x, yb - hh + w // 2 - 2), (x, yb - hh + w // 2 + 3)], 1), '#3c4a50')
        mound = ell(x, yb + 2, w * 0.9, 3) & (YS >= yb); fill(img, mound, '#16241f')
    # the dead stirring: pale green wisps rising from three graves, cracked turf
    for x, y in ((22, 104), (50, 112), (86, 108), (108, 120)):
        fill(img, ell(x, y, 5, 2.4), '#0a110e')
    for x0 in (27, 58, 82, 104):
        pts = [(x0 + math.sin(t / 3.0) * (3 + t * 0.12), 100 - t) for t in range(0, 40, 2)]
        for i, (x, y) in enumerate(pts):
            r = 1 + i * 0.22
            m = ell(x, y, r * 1.1, r)
            mask_glow(img, m, 3, '#8af0a8', amt=0.45, steps=3)
            fill(img, m, '#a8f4bc' if i % 2 else '#d4fce0')
    for i in range(3):
        bandm = np.clip(1 - np.abs(YS - (96 + i * 10)) / 7.0, 0, 1) * (0.3 + noisy(rng, 18, 6))
        q = np.clip(np.floor(bandm * 4 + BAY * 0.9 + 0.5) / 4, 0, 1) * 0.5
        img[:] = img * (1 - q[..., None]) + C('#6ac890') * q[..., None]
    return finish(img, 0.5)


def s_emberborn(rng):  # a cooling lava flow, embers rising, a glowing seam of life
    img = canvas()
    vgrad(img, ['#1a0606', '#3a0c08', '#701a0c', '#b43410'], 0, 68)
    glow(img, 64, 70, 60, '#ff8a28', amt=0.55, steps=5, power=1.4)
    for cx, cy, w in ((22, 14, 34), (86, 10, 42), (60, 32, 30)):
        cloud(img, cx, cy, w, '#7a2a14', '#3c1008', '#1a0604', rng)
    cone = poly([(0, 78), (36, 60), (50, 50), (64, 46), (78, 50), (94, 62), (128, 78), (128, 90), (0, 90)])
    outlined(img, cone, '#0a0404', '#2a1210'); fill(img, cone & (XS < 64), '#3e1c18')
    fill(img, line([(60, 48), (56, 62), (60, 76), (54, 90)], 2), '#ff7a20')
    ground = below(ridge(rng, 88, 4, 20))
    n = noisy(rng, 10, 5)
    field_grad(img, n * 0.8, ['#14090a', '#1e0e0e', '#2c1614', '#3c201c'], ground)
    speckle(img, rng, 260, ground, ['#0a0404', '#4a2620'], 90)
    lava = np.zeros((N, N), bool)
    for pts in ([(10, 128), (24, 112), (44, 108), (58, 100), (62, 90)], [(118, 128), (104, 114), (84, 110), (70, 98), (64, 90)],
                [(0, 104), (14, 100), (30, 96)], [(128, 106), (112, 98), (96, 96)], [(40, 128), (50, 120), (52, 112)]):
        lv = line(pts, 3 + (pts[0][0] in (10, 118)) * 2)
        lava |= lv
    mask_glow(img, lava, 5, '#ff6a18', amt=0.7, steps=4)
    fill(img, dilate(lava) & ~lava, '#d8401a'); fill(img, lava, '#ff8a28'); fill(img, lava & (BAY > 0.1), '#ffc450')
    # an egg-sized, glowing ember-stone with a crack of white heat at the centre
    egg = ell(64, 108, 10, 13)
    mask_glow(img, egg, 7, '#ff9a30', amt=0.8, steps=4)
    outlined(img, egg, '#140606', '#5a2a1c'); fill(img, egg & (XS < 62), '#7a3c24'); fill(img, egg & (YS > 112), '#3a1810')
    crack = line([(64, 96), (61, 104), (65, 110), (62, 118)], 1)
    fill(img, crack, '#ffe890'); fill(img, dilate(crack) & ~crack & egg, '#ff9a30')
    for _ in range(110):  # rising embers
        x, y = int(rng.integers(0, N)), int(rng.integers(4, 110))
        img[y, x] = C(['#ffd070', '#ff8a28', '#ffe8a0', '#e84a1a'][int(rng.integers(0, 4))])
    return finish(img, 0.45)


def s_siegetrain(rng):  # a line of banners and covered carts under a fortress wall
    img = canvas()
    vgrad(img, ['#54486a', '#8a5a6c', '#c8806a', '#eaa87a', '#f6d09a'], 0, 66)
    glow(img, 40, 62, 40, '#fff0c0', amt=0.6, steps=5)
    fill(img, ell(40, 64, 7, 7) & (YS < 64), '#fffae0')
    for cx, cy, w in ((20, 14, 30), (96, 20, 40)):
        cloud(img, cx, cy, w, '#e4a89a', '#a86878', '#6a4a68', rng)
    far = ridge(rng, 70, 8, 26)
    hill(img, far, ['#6a4a60', '#583e56'], 12, rim='#b87a74')
    wallm = rect(54, 40, 128, 86)
    outlined(img, wallm, '#1a1018', '#7a6070'); fill(img, wallm & (XS < 70), '#8e7482')
    for x in range(54, 128, 10):  # crenels
        fill(img, rect(x, 34, x + 5, 40), '#7a6070'); fill(img, dilate(rect(x, 34, x + 5, 40)) & ~rect(x, 34, x + 5, 40) & (YS < 40), '#1a1018')
    for y in range(46, 86, 7):
        for x in range((y // 7 % 2) * 5 + 54, 128, 10):
            fill(img, line([(x, y), (x + 8, y)], 1), '#4a3848')
            fill(img, line([(x, y), (x, y + 6)], 1), '#4a3848')
    tower = rect(96, 20, 116, 86)
    outlined(img, tower, '#1a1018', '#8a6e7e'); fill(img, tower & (XS < 104), '#a08494')
    for x in (96, 102, 108, 114):
        fill(img, rect(x, 14, x + 3, 20), '#8a6e7e')
    fill(img, rect(104, 36, 108, 46), '#1a1018'); fill(img, rect(66, 52, 70, 62), '#1a1018')
    fill(img, line([(106, 20), (106, 6)], 1), '#1a1018'); fl = poly([(106, 6), (118, 9), (106, 13)]); outlined(img, fl, '#1a1018', '#d8381c')
    gate = rect(60, 66, 72, 86) | ell(66, 66, 6, 6)
    fill(img, gate, '#140a10')
    ground = below(ridge(rng, 94, 3, 22))
    field_grad(img, (YS - 92) / 40.0 + noisy(rng, 8) * 0.2, ['#7a6240', '#645034', '#4e3e28', '#3a2e1e'], ground)
    speckle(img, rng, 300, ground, ['#2a2014', '#9a8250'], 94)
    # foreground: two banners on tall poles with a covered cart between them (an armoured roof of overlapping boards)
    for x, col in ((14, '#d8381c'), (112, '#e0a818')):
        fill(img, line([(x, 120), (x, 66)], 2), '#2a1a10'); fill(img, line([(x - 1, 120), (x - 1, 66)], 1), '#4a3220')
        b = poly([(x + 1, 68), (x + 22, 72 + (x > 64) * 0), (x + 18, 82), (x + 22, 92), (x + 1, 90)]) if x < 64 else poly([(x - 1, 68), (x - 22, 72), (x - 18, 82), (x - 22, 92), (x - 1, 90)])
        outlined(img, b, '#1a1018', col); fill(img, b & (YS < 76), '#f4d06a' if x < 64 else '#fff0a0')
    cart = poly([(36, 112), (40, 98), (84, 98), (90, 112)])
    outlined(img, cart, '#14100a', '#6a4a2a'); fill(img, cart & (YS < 104), '#8a6238')
    for k in range(5):
        fill(img, line([(40 + k * 10, 98), (36 + k * 10, 112)], 1), '#3a2814')
    roof = poly([(34, 100), (44, 88), (82, 88), (92, 100)])
    outlined(img, roof, '#14100a', '#4a5a6a'); fill(img, roof & (YS < 93), '#7a8a9a')
    for k in range(6):
        fill(img, line([(40 + k * 8, 90), (38 + k * 8, 99)], 1), '#2e3a48')
    for wx in (46, 80):
        w = ell(wx, 114, 7, 7); outlined(img, w, '#14100a', '#3a2814'); fill(img, ell(wx, 114, 2.4), '#9a7a48')
        for a in range(0, 360, 45):
            fill(img, line([(wx, 114), (wx + math.cos(math.radians(a)) * 6, 114 + math.sin(math.radians(a)) * 6)], 1), '#9a7a48')
    return finish(img, 0.4)


def s_venomglands(rng):  # green scales and a bead of venom
    img = canvas()
    field_grad(img, noisy(rng, 20, 8) * 0.6, ['#0c2214', '#123420', '#1a4a2a'], np.ones((N, N), bool))
    S = 11
    for row in range(-1, 14):
        for col in range(-1, 14):
            cx = col * S + (row % 2) * S / 2
            cy = row * S * 0.62
            sc = ell(cx, cy, S * 0.56, S * 0.62) & (YS >= cy - S * 0.1) | ell(cx, cy - S * 0.08, S * 0.56, S * 0.46)
            t = (row * 5 + col * 3) % 4
            body = ['#2c7a3c', '#3a9448', '#1e6a34', '#4aa850'][t]
            outlined(img, sc, '#0a1c10', body)
            fill(img, sc & (YS < cy - 1) & (XS < cx), ['#5ac060', '#6ad070', '#48a858', '#7ae080'][t])
            fill(img, sc & (YS > cy + S * 0.3), '#1a4a28')
    # a single diamond-pattern stripe across the scales
    for k in range(5):
        cx = 18 + k * 24
        d = poly([(cx, 60), (cx + 10, 70), (cx, 80), (cx - 10, 70)])
        outlined(img, d, '#0a1c10', '#14301c'); fill(img, d & (BAY > 0), '#a8e848' if k % 2 else '#e8e848')
    # the fang and a falling bead of poison, big and bright in the middle
    fang = poly([(52, 8), (76, 8), (66, 40), (62, 40)])
    outlined(img, fang, '#1a1410', '#f4f0d8'); fill(img, fang & (XS < 62), '#ffffff'); fill(img, line([(64, 14), (64, 36)], 1), '#a8e848')
    gum = ell(64, 6, 24, 6)
    outlined(img, gum, '#3a0c1c', '#c8506a'); fill(img, gum & (YS < 6), '#e8788e')
    drop = poly([(64, 50), (58, 62), (70, 62)]) | ell(64, 64, 6.4, 6.4)
    mask_glow(img, drop, 8, '#b8ff40', amt=0.8, steps=4)
    outlined(img, drop, '#2a6a10', '#9aee28'); fill(img, drop & (XS < 62) & (YS > 58), '#d8ff78'); fill(img, ell(61, 63, 1.4), '#ffffff')
    for x, y, r in ((30, 94, 3), (98, 100, 4), (78, 116, 3), (44, 112, 2)):
        d2 = ell(x, y, r, r)
        mask_glow(img, d2, 4, '#b8ff40', amt=0.5, steps=3); outlined(img, d2, '#2a6a10', '#9aee28'); fill(img, ell(x - 1, y - 1, 1), '#e8ffa0')
    glow(img, 64, 66, 54, '#b8ff40', amt=0.18, steps=3)
    return finish(img, 0.45)


def s_skyambush(rng):  # raptors folding into a dive out of the sun above a cloud sea
    img = canvas()
    vgrad(img, ['#1c4a9a', '#2f6cc0', '#5a98dc', '#98c4ee', '#d8ecf8'], 0, 96)
    fill(img, YS > 96, '#9ab4d4')
    glow(img, 64, 14, 44, '#fff8d0', amt=0.8, steps=5, power=1.3)
    fill(img, ell(64, 14, 8, 8), '#fffbe8')
    for k, (base, light, mid, dark) in enumerate(((84, '#ffffff', '#dce8f4', '#a8bcd8'), (100, '#f4f8fc', '#c4d4e8', '#8aa4c8'), (116, '#dce8f4', '#a8bcd8', '#6a84b0'))):
        for cx in range(-10 + k * 9, N + 20, 28):
            cloud(img, cx, base + int(rng.integers(-3, 4)), 38, light, mid, dark, rng)
    fill(img, (YS > 118), '#6a84b0')
    for x in (14, 110, 30, 98):  # thin high cirrus
        fill(img, line([(x - 12, 40 + (x % 7)), (x + 12, 36 + (x % 7))], 1), '#e8f2fc')
    for bx, by, s in ((34, 52, 3.4), (96, 46, 3.4), (64, 78, 5.2), (20, 82, 2.4), (110, 76, 2.4)):
        bird(img, bx, by, s, '#4a3828')
    for bx, by in ((64, 56), (50, 70), (78, 70)):  # streaks of speed behind the leader
        fill(img, line([(bx, by - 18), (bx, by - 4)], 1), '#ffffff')
    for i in range(10):
        x = 6 + i * 13
        fill(img, line([(x, 20 + (i * 17) % 30), (x, 28 + (i * 17) % 30)], 1), '#cfe4f8')
    return finish(img, 0.3)


SCENES = {'windfall': s_windfall, 'seasons': s_seasons, 'quietcontemplation': s_quietcontemplation, 'blindfury': s_blindfury,
          'hivechorus': s_hivechorus, 'risingtide': s_risingtide, 'secondburrow': s_secondburrow, 'wildrage': s_wildrage,
          'snowveil': s_snowveil, 'sandveil': s_sandveil, 'restlessdead': s_restlessdead, 'emberborn': s_emberborn,
          'siegetrain': s_siegetrain, 'venomglands': s_venomglands, 'skyambush': s_skyambush}


def build(name):
    seed = 20261114 + sum(ord(c) for c in name)
    img = SCENES[name](np.random.default_rng(seed))
    return img.quantize(colors=64, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.NONE)


def save(name, force=False):
    out = os.path.join(OUT, name + '.png')
    if os.path.exists(out) and not force:
        print('skip (exists, never replace)', name); return
    build(name).save(out, optimize=True)
    print('wrote', os.path.relpath(out, ROOT), os.path.getsize(out) // 1024, 'KB')


def contact(path):
    names = list(SCENES)
    cols = 5
    rows = (len(names) + cols - 1) // cols
    sheet = Image.new('RGB', (cols * 264 + 8, rows * 272 + 8), (24, 24, 28))
    d = ImageDraw.Draw(sheet)
    for i, n in enumerate(names):
        x, y = 8 + (i % cols) * 264, 8 + (i // cols) * 272
        sheet.paste(Image.open(os.path.join(OUT, n + '.png')).convert('RGB'), (x, y + 12))
        d.text((x, y), n, fill=(230, 230, 230))
    os.makedirs(os.path.dirname(path), exist_ok=True)
    sheet.save(path)
    print('wrote', os.path.relpath(path, ROOT))


if __name__ == '__main__':
    args = [a for a in sys.argv[1:] if not a.startswith('--')]
    force = '--force' in sys.argv
    for name in (args or SCENES):
        save(name, force)
    if not args:
        contact(os.path.join(ROOT, 'docs', 'art', 'art13-fields-contact.png'))
