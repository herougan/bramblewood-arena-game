#!/usr/bin/env python3
"""Draws the desktop app icon in code (2026-10-18, roadmap P6: the Electron build had no icon).

An acorn on a round wooden shield with a bramble ring, in the game's palette (banner green #2f4a2c/#3f5c3a, amber
accent #d99a4e/#985a1a, cream ink #ede4c8). No art credits spent; re-run to tweak.

Writes (next to this script; electron-builder's buildResources folder):
  icon.png             1024 px (macOS: electron-builder makes the .icns from it; Linux fallback)
  icon.ico             16, 24, 32, 48, 64, 128, 256 (Windows)
  icons/<n>x<n>.png    16 ... 1024 (Linux icon set; also the iconset sizes for iconutil if a hand-made .icns is wanted)
Run: python3 -I electron/build/make_icon.py   (needs Pillow)
"""
import math, os
from PIL import Image, ImageDraw, ImageFilter

HERE = os.path.dirname(os.path.abspath(__file__))
S = 2048  # drawn at 2x, then downsampled for clean edges
C = S / 2

GREEN_D, GREEN, GREEN_L = (0x1f, 0x33, 0x1d), (0x2f, 0x4a, 0x2c), (0x4c, 0x72, 0x45)
WOOD_D, WOOD, WOOD_L = (0x5a, 0x34, 0x12), (0x98, 0x5a, 0x1a), (0xd9, 0x9a, 0x4e)
CREAM, INK = (0xed, 0xe4, 0xc8), (0x2a, 0x1c, 0x08)
BERRY, BERRY_L = (0x5b, 0x1f, 0x4a), (0x9a, 0x45, 0x86)
LEAF, LEAF_L = (0x5f, 0x8f, 0x3e), (0x8d, 0xc0, 0x5a)


def circle(d, r, fill, cx=C, cy=C, outline=None, width=0):
    d.ellipse([cx - r, cy - r, cx + r, cy + r], fill=fill, outline=outline, width=width)


def radial(size, inner, outer, cx, cy, r):
    """Simple radial gradient disc (light from upper left)."""
    im = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    px = im.load()
    for y in range(0, size, 2):
        for x in range(0, size, 2):
            dd = math.hypot(x - cx, y - cy)
            if dd > r: continue
            t = min(1, math.hypot(x - (cx - r * .35), y - (cy - r * .4)) / (r * 1.5))
            c = tuple(int(inner[i] + (outer[i] - inner[i]) * t) for i in range(3)) + (255,)
            px[x, y] = c
            if x + 1 < size: px[x + 1, y] = c
            if y + 1 < size:
                px[x, y + 1] = c
                if x + 1 < size: px[x + 1, y + 1] = c
    return im


def leaf(d, x, y, ang, L, col, vein):
    """A pointed bramble leaf at (x, y) pointing along ang (radians)."""
    pts = []
    for i in range(21):
        t = i / 20
        w = math.sin(math.pi * t) * L * .32 * (1 - .25 * t)
        pts.append((t * L, w))
    pts += [(t, -w) for (t, w) in reversed(pts)]
    ca, sa = math.cos(ang), math.sin(ang)
    poly = [(x + px * ca - py * sa, y + px * sa + py * ca) for px, py in pts]
    d.polygon(poly, fill=col, outline=GREEN_D)
    d.line([(x, y), (x + L * .9 * ca, y + L * .9 * sa)], fill=vein, width=max(2, int(L * .05)))


def main():
    im = Image.new('RGBA', (S, S), (0, 0, 0, 0))
    # soft drop shadow
    sh = Image.new('RGBA', (S, S), (0, 0, 0, 0))
    circle(ImageDraw.Draw(sh), S * .46, (0, 0, 0, 120), cy=C + S * .02)
    im.alpha_composite(sh.filter(ImageFilter.GaussianBlur(S * .015)))
    d = ImageDraw.Draw(im)

    # wooden rim with planks and iron studs
    circle(d, S * .45, WOOD_D)
    im.alpha_composite(radial(S, WOOD_L, WOOD, C, C, S * .435))
    d = ImageDraw.Draw(im)
    for k in range(12):
        a = k / 12 * 2 * math.pi
        d.line([(C + S * .36 * math.cos(a), C + S * .36 * math.sin(a)), (C + S * .435 * math.cos(a), C + S * .435 * math.sin(a))], fill=WOOD_D, width=int(S * .006))
    for k in range(12):
        a = (k + .5) / 12 * 2 * math.pi
        x, y = C + S * .397 * math.cos(a), C + S * .397 * math.sin(a)
        circle(d, S * .016, (0x3a, 0x30, 0x28), x, y)
        circle(d, S * .008, (0xb8, 0xae, 0x9c), x - S * .004, y - S * .004)

    # green field
    circle(d, S * .36, GREEN_D)
    im.alpha_composite(radial(S, GREEN_L, GREEN, C, C, S * .345))
    d = ImageDraw.Draw(im)

    # bramble ring: a thorny vine with leaves and berries inside the field
    R = S * .29
    steps = 360
    pts = [(C + (R + S * .012 * math.sin(i / steps * 2 * math.pi * 9)) * math.cos(i / steps * 2 * math.pi),
            C + (R + S * .012 * math.sin(i / steps * 2 * math.pi * 9)) * math.sin(i / steps * 2 * math.pi)) for i in range(steps + 1)]
    d.line(pts, fill=(0x3d, 0x22, 0x10), width=int(S * .026), joint='curve')
    d.line(pts, fill=(0x6e, 0x3e, 0x1c), width=int(S * .014), joint='curve')
    for k in range(18):  # thorns
        a = k / 18 * 2 * math.pi + .1
        r0 = R + S * .012 * math.sin(a * 9)
        bx, by = C + r0 * math.cos(a), C + r0 * math.sin(a)
        out = 1 if k % 2 else -1
        tx, ty = C + (r0 + out * S * .045) * math.cos(a + .035), C + (r0 + out * S * .045) * math.sin(a + .035)
        d.polygon([(bx + S * .012 * math.cos(a + math.pi / 2), by + S * .012 * math.sin(a + math.pi / 2)),
                   (bx - S * .012 * math.cos(a + math.pi / 2), by - S * .012 * math.sin(a + math.pi / 2)), (tx, ty)], fill=CREAM)
    for k in range(6):  # leaves and berry clusters
        a = k / 6 * 2 * math.pi - math.pi / 2 + math.pi / 6
        bx, by = C + R * math.cos(a), C + R * math.sin(a)
        leaf(d, bx, by, a + .9, S * .085, LEAF, LEAF_L)
        leaf(d, bx, by, a - 2.4, S * .07, LEAF, LEAF_L)
        if k % 2 == 0:
            for j, (ox, oy) in enumerate([(0, 0), (.022, .012), (-.012, .022), (.01, -.02)]):
                x, y = bx + S * ox - S * .03 * math.cos(a), by + S * oy - S * .03 * math.sin(a)
                circle(d, S * .02, BERRY, x, y)
                circle(d, S * .007, BERRY_L, x - S * .006, y - S * .006)

    # acorn: cap above, nut below, stalk on top
    nx, ny = C, C + S * .04
    nut = Image.new('RGBA', (S, S), (0, 0, 0, 0))
    nd = ImageDraw.Draw(nut)
    nd.ellipse([nx - S * .13, ny - S * .13, nx + S * .13, ny + S * .17], fill=WOOD_D)
    nd.polygon([(nx - S * .1, ny + S * .12), (nx + S * .1, ny + S * .12), (nx, ny + S * .225)], fill=WOOD_D)
    nd.ellipse([nx - S * .118, ny - S * .118, nx + S * .118, ny + S * .155], fill=(0xc0, 0x7a, 0x30))
    nd.polygon([(nx - S * .09, ny + S * .115), (nx + S * .09, ny + S * .115), (nx, ny + S * .21)], fill=(0xc0, 0x7a, 0x30))
    nd.ellipse([nx - S * .075, ny - S * .06, nx - S * .02, ny + S * .09], fill=(0xe6, 0xa9, 0x5c))  # shine
    im.alpha_composite(nut)
    d = ImageDraw.Draw(im)
    cy = C - S * .085
    d.chord([C - S * .165, cy - S * .1, C + S * .165, cy + S * .13], 180, 360, fill=INK)
    d.chord([C - S * .155, cy - S * .09, C + S * .155, cy + S * .115], 180, 360, fill=(0x6b, 0x47, 0x22))
    d.rectangle([C - S * .165, cy + S * .0, C + S * .165, cy + S * .035], fill=INK)
    d.rectangle([C - S * .155, cy + S * .004, C + S * .155, cy + S * .028], fill=(0x6b, 0x47, 0x22))
    for row in range(3):  # cap scales
        yy = cy - S * .05 + row * S * .03
        half = math.sqrt(max(0, (S * .15) ** 2 - ((yy - cy - S * .015) * 1.3) ** 2))
        n = 7 - row % 2
        for i in range(n):
            xx = C - half + (i + .5) * (2 * half / n)
            d.arc([xx - S * .02, yy - S * .012, xx + S * .02, yy + S * .022], 0, 180, fill=(0x9a, 0x6b, 0x3a), width=int(S * .006))
    d.line([(C, cy - S * .09), (C + S * .02, cy - S * .15)], fill=INK, width=int(S * .03))
    d.line([(C, cy - S * .09), (C + S * .02, cy - S * .15)], fill=(0x6b, 0x47, 0x22), width=int(S * .016))
    leaf(d, C + S * .015, cy - S * .125, -0.5, S * .1, LEAF, LEAF_L)

    big = im.resize((1024, 1024), Image.LANCZOS)
    big.save(os.path.join(HERE, 'icon.png'))
    os.makedirs(os.path.join(HERE, 'icons'), exist_ok=True)
    for n in (16, 24, 32, 48, 64, 128, 256, 512, 1024):
        im_n = big if n == 1024 else big.resize((n, n), Image.LANCZOS)
        if n <= 32: im_n = im_n.filter(ImageFilter.UnsharpMask(radius=1, percent=60, threshold=2))
        im_n.save(os.path.join(HERE, 'icons', '%dx%d.png' % (n, n)))
    big.save(os.path.join(HERE, 'icon.ico'), sizes=[(n, n) for n in (16, 24, 32, 48, 64, 128, 256)])
    print('wrote icon.png, icon.ico, icons/*.png')


if __name__ == '__main__':
    main()
