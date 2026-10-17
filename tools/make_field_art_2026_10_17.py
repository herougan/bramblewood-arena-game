#!/usr/bin/env python3
"""Psychic Dampener's Environment-card scene (2026-10-17, the Goliath raid's new field effect).

The other field scenes are painted (NightCafe); until one is made for this card, this paints a stand-in in the same pixel
style as tools/make_map_backgrounds.py: the black water of the deep, a great violet eye far below, and the pale rings of the
dampening field pressing in on it, with a few drifting motes. 256x256, deterministic.

    python3 tools/make_field_art_2026_10_17.py      -> art/fields/psychicdampener.png
"""
import os, sys, math
import numpy as np
from PIL import Image
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import make_map_backgrounds as M

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
S = 256


def paint():
    M.W, M.H = S, S
    rng = np.random.default_rng(20261017)
    ys, xs = np.mgrid[0:S, 0:S]
    cx, cy = S / 2, S * 0.56
    d = np.sqrt((xs - cx) ** 2 + ((ys - cy) * 1.15) ** 2) / (S * 0.5)
    base = np.clip(M.fbm(rng, S, S, (64, 32, 16), (0.5, 0.3, 0.2)) * 0.5 + (1 - d) * 0.5, 0, 1)
    img = M.dither_palette(base, ['#03040c', '#070a1c', '#0d1030', '#161848', '#22205e'], 0.9)
    # the dampening field: pale teal rings, each broken in places, pressing in on the eye
    ang = np.arctan2(ys - cy, xs - cx)
    for k, r in enumerate((0.92, 0.74, 0.58)):
        ring = np.abs(d - r) < 0.018 + k * 0.002
        gaps = np.sin(ang * (7 + k * 2) + k) > -0.35
        img[ring & gaps] = M.hexrgb(['#3f8f9a', '#5fb8c0', '#9ae4e4'][k])
    # the eye: a violet almond with a slit pupil, its glow held down by the inner ring
    ex = (xs - cx) / (S * 0.30); ey = (ys - cy) / (S * 0.15)
    almond = (ex ** 2 + ey ** 2 * (1 + 0.6 * ex ** 2)) < 1
    img[almond] = M.hexrgb('#d8c8e8')
    iris = ((xs - cx) ** 2 + (ys - cy) ** 2) < (S * 0.12) ** 2
    img[almond & iris] = M.hexrgb('#7a3cb8')
    inner = ((xs - cx) ** 2 + (ys - cy) ** 2) < (S * 0.085) ** 2
    img[almond & inner] = M.hexrgb('#a45ce0')
    pupil = (np.abs(xs - cx) < S * 0.014 * (1 - np.abs(ys - cy) / (S * 0.11))) & (np.abs(ys - cy) < S * 0.11)
    img[pupil] = M.hexrgb('#0a0412')
    hi = ((xs - cx + S * 0.04) ** 2 + (ys - cy + S * 0.04) ** 2) < (S * 0.018) ** 2
    img[hi] = M.hexrgb('#f6eaff')
    rim = almond & ~((((xs - cx) / (S * 0.285)) ** 2 + (((ys - cy) / (S * 0.135)) ** 2) * (1 + 0.6 * ex ** 2)) < 1)
    img[rim] = M.hexrgb('#3a1f5a')
    # the field dims the eye: a dithered teal veil across it
    veil = almond & ((xs + ys) % 4 == 0)
    img[veil] = (img[veil] * 0.55 + np.array(M.hexrgb('#5fb8c0')) * 0.45).astype(np.uint8)
    # motes drifting up through the dark
    M.sparkle(img, rng, 120, '#3fd8e8'); M.sparkle(img, rng, 40, '#b48cff')
    return M.edge_vignette(img, 0.5)


if __name__ == '__main__':
    out = os.path.join(ROOT, 'art', 'fields', 'psychicdampener.png')
    Image.fromarray(paint(), 'RGB').quantize(colors=40, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.NONE).save(out, optimize=True)
    print('wrote', os.path.relpath(out, ROOT), os.path.getsize(out) // 1024, 'KB')
