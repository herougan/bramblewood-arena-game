#!/usr/bin/env python3
"""The raid bramble's placeholder portrait (2026-10-19, package U3, owner 13:43: "The tentacle smack should be a property of the Raid's
bramble. Which should be appropriately named and art'd."): Kraken's Reef, the Goliath's bramble, as crisp pixel art on a 48x48 grid,
written as an SVG of run-length rects (shape-rendering crispEdges), so it stays sharp at any size and needs no art credits. A coral
reef fortress (a keep and two towers, coral crowns, a gate like a maw with pale fangs and a teal glow) with two tentacles curling up
around it, on the deep's dark blue-violet water with light shafts and drifting specks. Seeded, so it is the same every run.

    python3 tools/make_raid_bramble_art.py            # -> art/raids/krakens-reef.svg (+ a 384 px preview with --preview PATH)

A painted version can replace it later (docs/art/raid-bramble-art-brief.md has the NightCafe prompt); keep the file name or update
RAID_BRAMBLES in arena_app.js.
"""
import math, os, random, sys
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
N = 48
rng = random.Random(1019)
img = [[None] * N for _ in range(N)]
def put(x, y, c):
    x, y = int(round(x)), int(round(y))
    if 0 <= x < N and 0 <= y < N: img[y][x] = c
def rect(x0, y0, x1, y1, c):
    for y in range(y0, y1 + 1):
        for x in range(x0, x1 + 1): put(x, y, c)
def disc(cx, cy, r, c):
    for y in range(int(cy - r) - 1, int(cy + r) + 2):
        for x in range(int(cx - r) - 1, int(cx + r) + 2):
            if (x - cx) ** 2 + (y - cy) ** 2 <= r * r: put(x, y, c)
def mix(a, b, t):
    a = [int(a[i:i + 2], 16) for i in (1, 3, 5)]; b = [int(b[i:i + 2], 16) for i in (1, 3, 5)]
    return '#%02x%02x%02x' % tuple(round(a[i] + (b[i] - a[i]) * t) for i in range(3))

# --- the water: a dithered gradient, light shafts, specks
TOP, BOT = '#10244a', '#1c0c30'
for y in range(N):
    t = y / (N - 1)
    for x in range(N):
        k = t + (0.04 if (x + y) % 2 else -0.04) * (1 - abs(2 * t - 1))  # a checker dither between bands
        band = round(max(0, min(1, k)) * 6) / 6
        img[y][x] = mix(TOP, BOT, band)
for sx in (10, 22, 35):  # light shafts from the surface, leaning right
    for y in range(0, 30):
        for w in range(3):
            x = sx + y // 4 + w
            if 0 <= x < N and (x + y) % 2 == 0: img[y][x] = mix(img[y][x], '#5c86c4', 0.35 * (1 - y / 30))
for _ in range(16):
    x, y = rng.randrange(N), rng.randrange(0, 34)
    put(x, y, rng.choice(['#6fe3d8', '#9fd8ff', '#c9b6ff']))

# --- the seabed
for x in range(N):
    h = 41 + round(1.5 * math.sin(x * 0.45) + (1 if x % 7 == 0 else 0))
    for y in range(h, N): img[y][x] = '#2b2140' if y > h else '#4a3b63'
for x in range(0, N, 3): put(x, 46, '#3a2d52')

# --- tentacles (behind the fortress): thick Bezier limbs tapering to a curled tip, pink suckers on the inner side
def bez(p, t):
    (x0, y0), (x1, y1), (x2, y2), (x3, y3) = p; u = 1 - t
    return (u**3*x0 + 3*u*u*t*x1 + 3*u*t*t*x2 + t**3*x3, u**3*y0 + 3*u*u*t*y1 + 3*u*t*t*y2 + t**3*y3)
def tentacle(pts, r0, curl_dir, side):
    path = [bez(pts, i / 60) for i in range(61)]
    # the curl: keep turning past the end
    (xa, ya), (xb, yb) = path[-2], path[-1]; ang = math.atan2(yb - ya, xb - xa); x, y = xb, yb
    for i in range(14):
        ang += curl_dir * 0.32; x += math.cos(ang) * 0.9; y += math.sin(ang) * 0.9; path.append((x, y))
    n = len(path)
    for i, (x, y) in enumerate(path):  # outline first, then the body
        r = max(0.6, r0 * (1 - 0.88 * i / n)); disc(x, y, r + 1, '#1c0a2b')
    for i, (x, y) in enumerate(path):
        r = max(0.4, r0 * (1 - 0.88 * i / n)); disc(x, y, r, '#6a2f8e' if i % 9 < 6 else '#7d3aa8')
        if r > 1.2: disc(x - side * r * 0.35, y - r * 0.2, max(0.4, r * 0.35), '#a865cf')  # the lit rim
    for i in range(4, n - 10, 5):  # suckers
        x, y = path[i]; (xa, ya), (xb, yb) = path[i - 1], path[i + 1]
        nx, ny = -(yb - ya), (xb - xa); l = math.hypot(nx, ny) or 1; r = max(0.6, r0 * (1 - 0.88 * i / n))
        put(x + side * nx / l * r * 0.7, y + side * ny / l * r * 0.7, '#f7c0e4')
tentacle([(3, 46), (-2, 30), (12, 22), (7, 8)], 3.4, 1, 1)
tentacle([(45, 46), (51, 32), (35, 20), (41, 6)], 3.4, -1, -1)

# --- the fortress: a keep and two towers of purple reef rock
ROCK, ROCK_L, ROCK_D, OUT = '#53426f', '#6c5a8c', '#3a2c52', '#1a1028'
def block(x0, y0, x1, y1):
    rect(x0 - 1, y0 - 1, x1 + 1, y1, OUT); rect(x0, y0, x1, y1, ROCK)
    for y in range(y0, y1 + 1):  # the stone courses: a lit left edge, a dark right edge, a mortar line every 4 rows
        put(x0, y, ROCK_L); put(x1, y, ROCK_D)
        if (y - y0) % 4 == 3:
            for x in range(x0 + 1, x1): put(x, y, ROCK_D if (x + y) % 5 else ROCK)
block(9, 22, 15, 42)    # the left tower
block(33, 20, 39, 42)   # the right tower
block(16, 15, 32, 42)   # the keep
for x0 in (16, 20, 24, 28, 32):  # the keep's battlements
    rect(x0 - 1, 12, x0 + 1, 14, OUT); rect(x0, 12, x0, 14, ROCK_L) if x0 == 16 else rect(x0 - 0, 12, x0, 14, ROCK)
rect(15, 12, 33, 12, OUT)
for x in range(15, 34, 2): put(x, 12, ROCK)
# coral crowns: pink and orange branches on the battlements and the towers
def coral(x, y, h, c, hi):
    for k in range(h):
        put(x, y - k, c)
        if k and k % 2 == 0: put(x - 1, y - k, c); put(x - 2, y - k - 1, hi)
        if k and k % 3 == 0: put(x + 1, y - k, c); put(x + 2, y - k - 1, hi)
    put(x, y - h, hi)
coral(18, 11, 5, '#e2588e', '#ffb3cf'); coral(25, 11, 6, '#f0864a', '#ffd0a0'); coral(31, 11, 4, '#e2588e', '#ffb3cf')
coral(12, 21, 4, '#f0864a', '#ffd0a0'); coral(36, 19, 5, '#e2588e', '#ffb3cf')
for (x, y) in ((10, 30), (38, 27), (17, 24), (31, 22)):  # little sea anemones on the walls
    put(x, y, '#ff8fb6'); put(x - 1, y - 1, '#ffb3cf'); put(x + 1, y - 1, '#ffb3cf')
# the gate, a maw: a dark arch with a teal glow inside and pale fangs along its top
for y in range(28, 43):
    for x in range(20, 29):
        dx = (x - 24) / 4.6; top = 28 + 4 * dx * dx
        if y >= top: put(x, y, '#120818' if y < 36 else mix('#120818', '#1f6b70', (y - 36) / 7))
for x in (21, 23, 25, 27):
    dx = (x - 24) / 4.6; t = int(28 + 4 * dx * dx); put(x, t, '#efe6d0'); put(x, t + 1, '#efe6d0'); put(x, t + 2, '#cfc3a8')
for x in (22, 24, 26):
    dx = (x - 24) / 4.6; t = int(28 + 4 * dx * dx); put(x, t, '#efe6d0')
disc(24, 39.5, 1.6, '#6fe3d8'); put(24, 39, '#e6fffb')
# glowing windows (teal) and an eye-like round window high on the keep
for (x, y) in ((11, 27), (11, 34), (36, 25), (36, 32), (18, 20), (30, 20)):
    put(x, y, '#6fe3d8'); put(x, y + 1, '#2c9c96')
disc(24, 20, 2.2, OUT); disc(24, 20, 1.5, '#6fe3d8'); put(24, 20, '#10303a'); put(23, 19, '#e6fffb')
# kelp at the foot
for (x, h) in ((5, 6), (7, 4), (43, 5), (41, 7), (30, 3)):
    for k in range(h): put(x + (1 if k % 4 == 1 else -1 if k % 4 == 3 else 0), 42 - k, '#3f8f5a' if k % 2 else '#56b070')

# --- write: one <rect> per run of a colour in a row
runs = []
for y in range(N):
    x = 0
    while x < N:
        c = img[y][x]; x1 = x
        while x1 + 1 < N and img[y][x1 + 1] == c: x1 += 1
        runs.append('<rect x="%d" y="%d" width="%d" height="1" fill="%s"/>' % (x, y, x1 - x + 1, c)); x = x1 + 1
svg = ('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 %d %d" width="384" height="384" shape-rendering="crispEdges">'
       '<title>Kraken\'s Reef</title>%s</svg>\n') % (N, N, ''.join(runs))
out = os.path.join(ROOT, 'art', 'raids', 'krakens-reef.svg')
open(out, 'w').write(svg)
print('wrote', out, len(svg), 'bytes,', len(runs), 'rects')
if '--preview' in sys.argv:
    from PIL import Image
    im = Image.new('RGB', (N, N))
    for y in range(N):
        for x in range(N): im.putpixel((x, y), tuple(int(img[y][x][i:i + 2], 16) for i in (1, 3, 5)))
    im.resize((384, 384), Image.NEAREST).save(sys.argv[sys.argv.index('--preview') + 1])
