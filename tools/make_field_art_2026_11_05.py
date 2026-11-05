#!/usr/bin/env python3
"""Seven Environment / field cards get scenes of their own (2026-11-05, package ART9b).

Spore Cloud, Thunderstorm, Tangled Roots and Grasping Briars had no picture (the card showed its icon); Fog of War, Wildfire
and Quicksand borrowed Mist, Scorching and Sandstorm. This paints each its own scene in code (Pillow + numpy, no art credits, no
downloads), in the pixel style of tools/make_field_art_2026_10_18.py: 128x128 painted, shown at 256x256 with crisp 2x pixels,
banded dithered skies, outlined shapes, a small palette. Deterministic; re-run any time.

    python3 tools/make_field_art_2026_11_05.py              -> all seven scenes in art/fields/ + the contact sheet
    python3 tools/make_field_art_2026_11_05.py quicksand    -> just that one

Scenes: sporecloud, thunderstorm, tangledroots, graspingbriars, quicksand, wildfire, fogofwar.
"""
import os, sys, math
import numpy as np
from PIL import Image, ImageDraw
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import make_map_backgrounds as M
from make_field_art_2026_10_18 import (N, YS, XS, BAY, ROOT, OUT, C, canvas, fill, ell, poly, rect, line, dilate, shift, outlined,
                                       vgrad, field_grad, glow, mask_glow, ridge, below, hill, stars, tufts, dots, finish, streak_cloud)


def bezier(p0, p1, p2, n=24):
    return [((1 - t) ** 2 * p0[0] + 2 * (1 - t) * t * p1[0] + t * t * p2[0],
             (1 - t) ** 2 * p0[1] + 2 * (1 - t) * t * p1[1] + t * t * p2[1]) for t in (i / n for i in range(n + 1))]


def thick(pts, w0, w1):
    """A tapering stroke: a union of discs along the path."""
    m = np.zeros((N, N), bool)
    k = len(pts)
    for i, (x, y) in enumerate(pts):
        r = (w0 + (w1 - w0) * i / max(1, k - 1)) / 2
        m |= ell(x, y, r, r)
    return m


def fog_band(img, rng, y, h, color, amt, cell=22):
    """A bank of fog: a soft noisy band, dithered into steps."""
    n = M.value_noise(rng, N, N, cell) * 0.6 + M.value_noise(rng, N, N, cell // 2) * 0.4
    prof = np.clip(1 - np.abs(YS - y) / h, 0, 1)
    f = np.clip(prof * (0.45 + n), 0, 1)
    q = np.clip(np.floor(f * 4 + BAY * 0.9 + 0.5) / 4, 0, 1) * amt
    img[:] = img * (1 - q[..., None]) + C(color) * q[..., None]


# ---------------------------------------------------------------- scenes
def s_sporecloud(rng):  # drifting glowing spore puffs over a mossy floor
    img = canvas()
    vgrad(img, ['#0a1620', '#10222a', '#17323a', '#1f433f'], 0, 52)
    for x in (8, 30, 58, 84, 110, 124):  # distant dark trunks
        t = rect(x, 0, x + 3 + int(rng.integers(0, 3)), 56)
        fill(img, t, '#0a1418'); fill(img, t & (XS == x), '#17303a')
    h = ridge(rng, 54, 6, 30)
    moss = hill(img, h, ['#3f7a3c', '#33683a', '#2a5634', '#1f4430', '#183626'], 70, rim='#7ab45a')
    n = M.value_noise(rng, N, N, 6)
    fill(img, moss & (n > 0.62) & (BAY > -0.2), '#58984a')
    fill(img, moss & (n < 0.28), '#1a3a2a')
    tufts(img, rng, 380, moss, '#1c4228', '#8cd060', ymin=56, tall=4)
    for (x, y, r, cap) in ((20, 100, 7, '#d8dca8'), (98, 108, 8, '#c8d890'), (60, 116, 6, '#e0e4b8'), (116, 84, 4, '#c8d890'), (36, 76, 4, '#d8dca8')):
        stem = rect(x - 1, y - r // 2, x + 1, y + 1)
        outlined(img, stem, '#1a2a1c', '#b8c0a0')
        cm = ell(x, y - r * 0.55, r, r * 0.6) & (YS <= y - r * 0.4)
        outlined(img, cm, '#1a2a1c', cap)
        fill(img, cm & (XS < x - r * 0.2) & (YS < y - r * 0.8), '#f6fadc')
        fill(img, ell(x + r * 0.35, y - r * 0.8, 1) & cm, '#a8e048')
    puffs = [(36, 40, 18), (88, 30, 16), (64, 74, 22), (108, 70, 14), (18, 86, 12), (80, 100, 13)]
    for cx, cy, r in puffs:
        mask_glow(img, ell(cx, cy, r * 1.1, r * 0.85), r * 0.55, '#b8f060', amt=0.55, steps=4)
    for cx, cy, r in puffs:
        m = np.zeros((N, N), bool)
        for i in range(7):
            a = rng.random() * math.tau
            d = rng.random() * r * 0.7
            m |= ell(cx + math.cos(a) * d, cy + math.sin(a) * d * 0.7, r * (0.35 + rng.random() * 0.25))
        edge = m & ~shift(m, 2, 2) | m & ~shift(m, -2, -2)
        fill(img, m, '#7ac848')
        fill(img, m & (BAY > -0.15) & (YS < cy + r * 0.3), '#a8e860')
        fill(img, m & (np.hypot(XS - cx, YS - cy) < r * 0.45), '#d8f890')
        fill(img, m & (np.hypot(XS - cx + 2, YS - cy + 2) < r * 0.2), '#f6ffd0')
        fill(img, edge & (BAY > 0.1), '#58a038')
    for _ in range(120):  # drifting spores
        x, y = int(rng.integers(1, N - 2)), int(rng.integers(6, 118))
        c = C(['#e4ffa8', '#b8f060', '#ffe89a'][int(rng.integers(0, 3))])
        img[y, x] = c
        if rng.random() < 0.25:
            img[y, x + 1] = c * 0.6 + img[y, x + 1] * 0.4; img[y + 1, x] = c * 0.6 + img[y + 1, x] * 0.4
    return finish(img, 0.4)


def s_thunderstorm(rng):  # a forked bolt over a black, heaving sea
    img = canvas()
    vgrad(img, ['#0c0c1c', '#161a30', '#242a46', '#34406a', '#4a5a88'], 0, 66)
    for cx, cy, w, h in ((20, 14, 34, 9), (64, 8, 46, 10), (108, 16, 32, 9), (44, 30, 38, 8), (96, 36, 36, 8), (14, 44, 28, 7), (70, 50, 40, 7)):
        m = ell(cx, cy, w, h) | ell(cx - w * 0.3, cy - h * 0.5, w * 0.5, h * 0.8) | ell(cx + w * 0.35, cy - h * 0.3, w * 0.45, h * 0.7)
        fill(img, m, '#1a1e36'); fill(img, m & (YS < cy - 1), '#2a3052'); fill(img, m & ~shift(m, 0, 1) & (BAY > -0.3), '#4a5890')
        fill(img, m & (YS > cy + h * 0.45) & (BAY > 0), '#10142a')
    glow(img, 66, 40, 58, '#d8e4ff', amt=0.5, steps=5)
    horizon = 72
    sea = YS >= horizon
    f = (YS - horizon) / (N - horizon)
    wave = np.sin(XS * 0.35 + YS * 0.9) * 0.5 + np.sin(XS * 0.17 - YS * 0.5) * 0.5
    field_grad(img, f * 0.8 + wave * 0.12 + 0.1, ['#3a4a78', '#26325a', '#18203e', '#0e1428', '#080c1a'], sea)
    for _ in range(190):  # whitecaps
        x, y = int(rng.integers(0, N - 6)), int(rng.integers(horizon + 2, N - 1))
        ln = 2 + int((y - horizon) / 12)
        fill(img, rect(x, y, x + ln, y), '#a8bce0' if rng.random() < 0.6 else '#e4ecff')

    def bolt(x, y, ang, length, w, depth):
        pts = [(x, y)]
        for _ in range(int(length)):
            ang += (rng.random() - 0.5) * 1.1
            if depth == 0:
                ang = 1.57 + (ang - 1.57) * 0.8
            x += math.cos(ang) * 4; y += math.sin(ang) * 4
            pts.append((x, y))
            if depth < 2 and rng.random() < 0.18:
                bolt(x, y, ang + (0.8 if rng.random() < 0.5 else -0.8), length * 0.4, 1, depth + 1)
        core = line(pts, int(w))
        mask_glow(img, core, 3, '#a8c0ff', amt=0.8, steps=4)
        fill(img, dilate(core) & ~core, '#8aa8ff'); fill(img, core, '#f4f8ff')
    bolt(66, 20, 1.65, 17, 2, 0)
    glow(img, 66, 92, 36, '#b8d0ff', amt=0.55, steps=4, power=1.2, mask=(YS >= horizon).astype(np.float32))
    for _ in range(130):  # slanting rain
        x, y = int(rng.integers(0, N)), int(rng.integers(0, N - 8))
        for j in range(5):
            xx, yy = x - j, y + j * 2
            if 0 <= xx < N and 0 <= yy < N:
                img[yy, xx] = img[yy, xx] * 0.45 + C('#a8b8dc') * 0.55
    return finish(img, 0.35)


def s_tangledroots(rng):  # knotted roots snaring the ground
    img = canvas()
    n = M.fbm(rng, N, N, (32, 16, 8), (0.5, 0.3, 0.2))
    field_grad(img, n, ['#1a120c', '#271a10', '#33231a', '#3f2c1e'], np.ones((N, N), bool))
    for _ in range(260):
        x, y = int(rng.integers(0, N)), int(rng.integers(0, N))
        img[y, x] = C(['#150e08', '#52382a', '#6a4a36'][int(rng.integers(0, 3))])
    for _ in range(40):  # pale rootlets
        x0, y0 = rng.random() * N, rng.random() * N
        a = rng.random() * math.tau
        pts = [(x0 + math.cos(a + k * 0.3) * k * 2, y0 + math.sin(a + k * 0.3) * k * 2) for k in range(6)]
        fill(img, line(pts, 1), '#8a6a46')
    specs = [((-6, 100), (30, 40), (70, 90), 12, 5), ((20, 134), (50, 70), (140, 40), 13, 5), ((134, 110), (90, 60), (30, 20), 11, 4),
             ((-8, 30), (50, 60), (100, 10), 10, 4), ((64, -8), (30, 60), (70, 140), 11, 5), ((100, 140), (100, 60), (60, 30), 9, 4)]
    roots = [thick(bezier(a, b, c, 40), w0, w1) for (a, b, c, w0, w1) in specs]
    for m in roots:
        fill(img, shift(dilate(m, 2), 2, 3) & ~m, '#0a0604')
        fill(img, dilate(m) & ~m, '#140c06')
        fill(img, m, '#5a3a22')
        fill(img, m & ~shift(m, 2, 2), '#8a5e38')
        fill(img, m & ~shift(m, 1, 1) & ~shift(m, 3, 3), '#b8884e')
        fill(img, m & ~shift(m, -2, -2), '#3a2414')
        fill(img, m & ((XS * 3 + YS * 2) % 9 == 0) & (BAY > -0.2), '#3e2815')
    allr = np.any(roots, axis=0)
    tops = allr & ~shift(allr, 0, 2)
    fill(img, tops & (BAY > 0.0), '#4a7a34')
    fill(img, tops & (BAY > 0.3), '#7cb048')
    for _ in range(14):
        x, y = int(rng.integers(2, N - 3)), int(rng.integers(2, N - 3))
        if not allr[y, x]:
            fill(img, ell(x, y, 2, 1.2), '#4a6a28'); img[y, x] = C('#8cb048')
    return finish(img, 0.4)


def s_graspingbriars(rng):  # thorny canes and red roses over a dusky hedge
    img = canvas()
    vgrad(img, ['#1b2a24', '#223a2c', '#2c4a32', '#385c38'], 0, 128)
    for _ in range(900):
        x, y = int(rng.integers(0, N - 2)), int(rng.integers(0, N - 2))
        fill(img, ell(x, y, 2, 1.3), ['#1c3a26', '#2c5434', '#3a6a3c', '#244630'][int(rng.integers(0, 4))])
    mask_glow(img, ell(30, 30, 30), 14, '#e8f0a0', amt=0.25, steps=3)
    canes = [((-6, 118), (40, 60), (134, 96)), ((-6, 40), (60, 20), (80, 140)), ((134, 20), (70, 70), (-6, 70)), ((20, -6), (30, 80), (134, 134))]
    allc = np.zeros((N, N), bool)
    for (a, b, c) in canes:
        pts = bezier(a, b, c, 48)
        m = thick(pts, 6, 4)
        fill(img, shift(dilate(m, 1), 2, 3) & ~m, '#0a1a10')
        fill(img, dilate(m) & ~m, '#160a10')
        fill(img, m, '#5a2a3a'); fill(img, m & ~shift(m, 1, 1), '#8a4a58'); fill(img, m & ~shift(m, -1, -1), '#3a1624')
        allc |= m
        for i in range(2, len(pts) - 1, 3):  # thorns, alternating sides
            (x0, y0), (x1, y1) = pts[i], pts[i + 1]
            dx, dy = x1 - x0, y1 - y0
            ln = math.hypot(dx, dy) or 1
            nx, ny = -dy / ln, dx / ln
            s = 1 if (i // 3) % 2 else -1
            t = poly([(x0 - dx * 0.4 + nx * s * 2, y0 - dy * 0.4 + ny * s * 2), (x0 + dx * 0.9 + nx * s * 2, y0 + dy * 0.9 + ny * s * 2),
                      (x0 + nx * s * 6.5 + dx * 0.2, y0 + ny * s * 6.5 + dy * 0.2)])
            fill(img, dilate(t) & ~t & ~allc, '#160a10'); fill(img, t, '#c8c0b0'); fill(img, t & (BAY > 0.2), '#f4eedc')
    for (x, y) in ((22, 80), (52, 38), (92, 78), (104, 36), (46, 106), (78, 22), (118, 108), (12, 20)):
        for k in range(3):
            a = rng.random() * math.tau
            lf = ell(x + math.cos(a) * 6, y + math.sin(a) * 6, 4, 2)
            fill(img, dilate(lf) & ~lf & ~allc, '#0e2616'); fill(img, lf, '#3c7a40')
        fill(img, ell(x, y, 5.5), '#1a0610'); fill(img, ell(x, y, 4.5), '#a8142c')
        fill(img, ell(x, y, 3.2), '#d02840'); fill(img, ell(x + 0.5, y, 2), '#a8142c'); fill(img, ell(x - 0.5, y - 0.5, 1), '#ff7080')
        img[y, x + 1] = C('#781020')
    return finish(img, 0.4)


def s_quicksand(rng):  # a sand pit sucking everything down
    img = canvas()
    vgrad(img, ['#9cc4d8', '#c8d8d0', '#ecdcb0'], 0, 30)
    h = ridge(rng, 28, 5, 30)
    hill(img, h, ['#e0b86a', '#d4a85c'], 12, rim='#f6dc9a')
    ground = YS >= 34
    n = M.value_noise(rng, N, N, 10)
    field_grad(img, n * 0.8 + (YS - 34) / 140, ['#f0cc84', '#e6bc72', '#d8a85e', '#c8964e'], ground)
    for y in range(40, N, 5):  # sand ripples
        for x in range(0, N):
            if int(math.sin(x * 0.25 + y * 0.7) * 2) == 0 and (x + y) % 3 == 0:
                img[y, x] = C('#b88444')
    cx, cy, rx, ry = 64, 82, 52, 30
    d = np.sqrt(((XS - cx) / rx) ** 2 + ((YS - cy) / ry) ** 2)
    pit = d < 1
    fill(img, shift(dilate(pit & (YS < cy + 3), 2), 0, 2) & ~pit, '#8a5e30')
    fill(img, dilate(pit) & ~pit, '#7a5226')
    twist = d + 0.06 * np.sin(np.arctan2((YS - cy) / ry, (XS - cx) / rx) * 3 + d * 8)
    field_grad(img, 1 - np.clip(twist, 0, 1), ['#b88444', '#a47238', '#8a5a2c', '#6c4220', '#4a2c14', '#2c180a'], pit, strength=1.1)
    for k in (0.85, 0.68, 0.5, 0.33):  # ring ridges
        ring = pit & (np.abs(twist - k) < 0.025)
        fill(img, ring & (YS < cy + 4) & (BAY > -0.3), '#e4b868')
        fill(img, ring & (YS >= cy + 4) & (BAY > 0.1), '#5a381a')
    br = thick(bezier((92, 66), (82, 74), (70, 84), 20), 3, 2)  # a dead branch going under
    outlined(img, br, '#241408', '#6a4a2a'); fill(img, br & ~shift(br, 1, 1), '#9a7646')
    for pts in (bezier((90, 68), (96, 60), (100, 58), 6), bezier((88, 70), (96, 66), (104, 66), 6)):
        fill(img, line(pts, 1), '#5a3c20')
    st = ell(52, 84, 7, 4) & (YS < 86)  # a stone half sunk
    outlined(img, st, '#2a1808', '#8a8070'); fill(img, st & ~shift(st, 2, 2), '#bdb4a0')
    fill(img, ell(52, 88, 8, 2), '#2c180a')
    for (x, y, r) in ((70, 90, 2), (60, 96, 1.5), (78, 80, 1.5), (46, 74, 1)):  # bubbles
        fill(img, ell(x, y, r + 1), '#3a2010'); fill(img, ell(x, y, r), '#8a6234'); img[int(y - r), int(x - r)] = C('#e4c488')
    near = dilate(pit, 3)
    for _ in range(80):
        x, y = int(rng.integers(0, N)), int(rng.integers(36, N))
        if not near[y, x]:
            img[y, x] = C(['#a87a3e', '#f6dca0', '#8a6a3a'][int(rng.integers(0, 3))])
    return finish(img, 0.3)


def s_wildfire(rng):  # a grass fire racing across a dark field
    img = canvas()
    vgrad(img, ['#1a0a0a', '#3a1210', '#6a2012', '#a43a14', '#d86a1c', '#f49a2c'], 0, 74)
    for cx, cy, w, h in ((20, 10, 34, 12), (70, 6, 46, 10), (112, 16, 30, 12), (50, 24, 30, 8), (100, 34, 24, 7), (14, 36, 22, 6)):
        m = ell(cx, cy, w, h) | ell(cx + w * 0.3, cy - h * 0.4, w * 0.5, h * 0.8)
        fill(img, m, '#161010'); fill(img, m & (YS > cy + 1) & (BAY > -0.2), '#6a2a14'); fill(img, m & ~shift(m, 0, -1), '#30201c')
    glow(img, 64, 80, 70, '#ff9a30', amt=0.5, steps=5, power=1.2)
    horizon = 74
    h = ridge(rng, horizon, 4, 28)
    hill(img, h, ['#2a0e08', '#1a0804'], 12, rim='#d86a1c')
    ground = YS >= horizon + 2
    n = M.value_noise(rng, N, N, 8)
    field_grad(img, (YS - horizon) / 54 * 0.7 + n * 0.3, ['#4a2a10', '#32200c', '#201408', '#140c06'], ground)
    for _ in range(30):
        x, y = int(rng.integers(0, N)), int(rng.integers(horizon + 6, N))
        fill(img, ell(x, y, 6, 2.5), '#0c0804')
    tufts(img, rng, 300, ground & (YS > 104), '#2e5a1e', '#6a9a34', lean=0, ymin=104, tall=4)
    tufts(img, rng, 260, ground & (YS <= 104), '#503a14', '#a07830', lean=1, ymin=horizon + 3, tall=3)

    def flame(x, yb, w, hgt):
        tip = (x + (rng.random() - 0.5) * 4, yb - hgt)
        outer = poly([(x - w, yb), (x - w * 0.6, yb - hgt * 0.45), (x - w * 0.15, yb - hgt * 0.55), tip, (x + w * 0.3, yb - hgt * 0.5), (x + w * 0.7, yb - hgt * 0.35), (x + w, yb)])
        fill(img, dilate(outer) & ~outer, '#7a1c08'); fill(img, outer, '#e8501c')
        mid = poly([(x - w * 0.6, yb), (x - w * 0.2, yb - hgt * 0.5), (tip[0], tip[1] + hgt * 0.25), (x + w * 0.5, yb - hgt * 0.3), (x + w * 0.6, yb)])
        fill(img, mid, '#fc9a28')
        core = poly([(x - w * 0.3, yb), (x, yb - hgt * 0.5), (x + w * 0.3, yb)])
        fill(img, core, '#ffe27a'); fill(img, core & (YS > yb - 3), '#fffbe0')
    ys = lambda x: 96 + 4 * math.sin(x * 0.07) + 3 * math.sin(x * 0.19)
    tr = rect(96, 66, 99, 94)  # a charred tree, behind the flames
    outlined(img, tr, '#0a0604', '#2a1608')
    for pts in (bezier((97, 74), (88, 68), (84, 62), 6), bezier((98, 70), (106, 64), (110, 58), 6)):
        fill(img, thick(pts, 3, 1), '#1a0c06')
    for x in range(-4, N + 6, 8):
        flame(x + int(rng.integers(-2, 3)), int(ys(x) - 8), 5, 11 + rng.random() * 8)
    for x in range(0, N + 6, 7):
        flame(x + int(rng.integers(-2, 3)), int(ys(x + 3)), 6.5, 16 + rng.random() * 14)
    for x in range(2, N, 12):
        flame(x + int(rng.integers(-2, 3)), int(ys(x) + 3), 7, 26 + rng.random() * 12)
    for _ in range(120):  # sparks
        x, y = int(rng.integers(0, N - 1)), int(rng.integers(8, 100))
        img[y, x] = C(['#ffd060', '#ff9a30', '#ffe8a0'][int(rng.integers(0, 3))])
    return finish(img, 0.4)


def s_fogofwar(rng):  # banks of fog hiding a field and its banners
    img = canvas()
    vgrad(img, ['#8aa0aa', '#a4b6bc', '#bcc9cc', '#cdd6d4'], 0, 70)
    h0 = ridge(rng, 64, 6, 36)
    hill(img, h0, ['#7e948e', '#6c847c'], 18, rim='#94a8a2')
    h1 = ridge(rng, 78, 3, 40)
    gm = hill(img, h1, ['#6a8a62', '#587a54', '#486a46', '#385a3a', '#2c4a30'], 50, rim='#8aa87a')
    tufts(img, rng, 260, gm, '#2a4a2e', '#7a9c68', ymin=82, tall=3)

    def banner(x, yb, hgt, col, flag):
        fill(img, rect(x, yb - hgt, x, yb), col)
        fill(img, poly([(x + 1, yb - hgt), (x + 1 + hgt * 0.55, yb - hgt + hgt * 0.15), (x + 1, yb - hgt + hgt * 0.35)]), flag)

    def tent(x, yb, w, col):
        t = poly([(x - w, yb), (x, yb - w * 0.9), (x + w, yb)])
        fill(img, t, col); fill(img, t & (XS > x), '#3a4a44')
    banner(30, 72, 12, '#6a7c78', '#8a7a82'); tent(54, 74, 7, '#7e8e88'); banner(96, 71, 11, '#6a7c78', '#8a7a82')
    fog_band(img, rng, 76, 14, '#d4dcda', 0.8, cell=20)
    banner(18, 90, 22, '#33443f', '#7a3030'); tent(76, 92, 13, '#3e4e48'); banner(112, 88, 20, '#33443f', '#7a3030')
    fill(img, thick(bezier((100, 100), (98, 92), (94, 84), 6), 3, 1), '#2a3a34')
    fog_band(img, rng, 92, 16, '#cdd8d6', 0.75, cell=18)
    banner(52, 110, 34, '#1e2c28', '#5a2222'); fill(img, ell(88, 112, 6, 3), '#1e2c28')
    fog_band(img, rng, 112, 16, '#c4d0ce', 0.7, cell=16)
    fog_band(img, rng, 48, 12, '#e4eae8', 0.5, cell=24)
    for _ in range(26):  # drifting fog streaks
        x, y = int(rng.integers(-10, N)), int(rng.integers(60, 124))
        fill(img, rect(max(0, x), y, min(N - 1, x + int(10 + rng.random() * 22)), y), '#e4ecea')
    return finish(img, 0.3)


SCENES = {'sporecloud': s_sporecloud, 'thunderstorm': s_thunderstorm, 'tangledroots': s_tangledroots, 'graspingbriars': s_graspingbriars,
          'quicksand': s_quicksand, 'wildfire': s_wildfire, 'fogofwar': s_fogofwar}


def build(name):
    seed = 20261105 + sum(ord(c) for c in name)
    img = SCENES[name](np.random.default_rng(seed))
    return img.quantize(colors=64, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.NONE)


def save(name):
    out = os.path.join(OUT, name + '.png')
    build(name).save(out, optimize=True)
    print('wrote', os.path.relpath(out, ROOT), os.path.getsize(out) // 1024, 'KB')


def contact(path):
    names = list(SCENES)
    sheet = Image.new('RGB', (4 * 264 + 8, 2 * 272 + 8), (24, 24, 28))
    d = ImageDraw.Draw(sheet)
    for i, n in enumerate(names):
        x, y = 8 + (i % 4) * 264, 8 + (i // 4) * 272
        sheet.paste(Image.open(os.path.join(OUT, n + '.png')).convert('RGB'), (x, y + 12))
        d.text((x, y), n, fill=(230, 230, 230))
    os.makedirs(os.path.dirname(path), exist_ok=True)
    sheet.save(path)
    print('wrote', os.path.relpath(path, ROOT))


if __name__ == '__main__':
    args = sys.argv[1:]
    for name in (args or SCENES):
        save(name)
    contact(os.path.join(ROOT, 'docs', 'art', 'art9b-contact-2026-11-05.png'))
