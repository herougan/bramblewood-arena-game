#!/usr/bin/env python3
"""Procedural pixel-art card FRONT frames (2026-10-16).

2026-10-16 (user: "When I talked about backing in the previous chat, I meant the front card frame. To have 4 types. the
structure and units should roughly look similar, but the structure looks rickety."): the frame around the art and the
stat plate of every card face, in the four kinds cardBackingKind() already sorts cards into:

  unit       the current walnut look, polished: a see-through overlay (bevel lines, a gold inlay round the art window,
             brass corner pins, a faint grain on the plate) so the rarity-tinted walnut underneath still shows
  structure  the same layout knocked together from weathered planks: uneven plank widths, crooked and bent nails, rope
             lashings at two corners, a split, plank ends that poke past the card's rounded corner
  castle     regal: dressed stone blocks, a gold inlay, gold corner caps set with rubies, a gold-trimmed stone lintel
  field      the Environment card's mossy stone with its gold inner line and moss tufts at the corners

Each frame is drawn on a 126x156 grid: the card itself is the 120x150 box inside a 3px transparent margin that the
plank ends (structure only) are allowed to reach into, so they overhang the rarity border. The art window is the
transparent middle (top band 8px, sides 7px, bottom plate 28px). Saved 3x nearest-neighbour (378x468).
arena_template.html lays them on with border-image (9-slice) on a .cframe child of .card-tile; see "Card front frames".

    python3 tools/make_card_frames.py        -> art/frames/{unit,structure,castle,field}.png

Deterministic: re-running gives the same images.
"""
import os, math, random
from PIL import Image

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
OUT = os.path.join(ROOT, 'art', 'frames')
M = 3                                  # transparent margin (overhang room)
CW, CH = 120, 150                      # the card box
W, H = CW + 2 * M, CH + 2 * M          # 126 x 156
X0, Y0, X1, Y1 = M, M, M + CW - 1, M + CH - 1          # card box (inclusive)
R_CARD, R_WIN = 9, 4


def set_geom(t, s, b=28):
    """Band sizes (top, sides, plate). Unit, castle and field use 8/7/28; the structure's boards are thicker (10/9/28), so
    its 9-slice uses its own slice numbers in the CSS (border-image-slice 39 36 93 36)."""
    global T, S, B, WX0, WY0, WX1, WY1
    T, S, B = t, s, b
    WX0, WY0, WX1, WY1 = X0 + S, Y0 + T, X1 - S, Y1 - B    # art window (inclusive)


set_geom(8, 7)
SCALE = 3
BAYER = [[0, 8, 2, 10], [12, 4, 14, 6], [3, 11, 1, 9], [15, 7, 13, 5]]


def hx(s, a=255):
    s = s.lstrip('#'); return (int(s[0:2], 16), int(s[2:4], 16), int(s[4:6], 16), a)


def pick(ramp, v, x, y):
    v = max(0.0, min(1.0, v)); f = v * (len(ramp) - 1); i = int(f); frac = f - i
    if frac > (BAYER[y % 4][x % 4] + 0.5) / 16: i += 1
    return ramp[min(i, len(ramp) - 1)]


def in_rrect(x, y, x0, y0, x1, y1, r):
    if x < x0 or x > x1 or y < y0 or y > y1: return False
    cx = min(max(x, x0 + r), x1 - r); cy = min(max(y, y0 + r), y1 - r)
    return (x - cx) ** 2 + (y - cy) ** 2 <= r * r + r * .6


def in_card(x, y): return in_rrect(x, y, X0, Y0, X1, Y1, R_CARD)
def in_window(x, y): return in_rrect(x, y, WX0, WY0, WX1, WY1, R_WIN)


class Canvas:
    def __init__(self):
        self.im = Image.new('RGBA', (W, H), (0, 0, 0, 0)); self.p = self.im.load()

    def set(self, x, y, c):
        if 0 <= x < W and 0 <= y < H: self.p[x, y] = hx(c) if isinstance(c, str) else c

    def get(self, x, y):
        return self.p[x, y] if 0 <= x < W and 0 <= y < H else (0, 0, 0, 0)

    def blend(self, x, y, c, a):
        """Lay colour c over the pixel at alpha a (0..1), keeping the result's alpha the union of both."""
        if not (0 <= x < W and 0 <= y < H): return
        c = hx(c) if isinstance(c, str) else c
        r, g, b, a0 = self.p[x, y]; a0 /= 255
        ao = a + a0 * (1 - a)
        if ao <= 0: return
        mix = lambda s, d: int(round((s * a + d * a0 * (1 - a)) / ao))
        self.p[x, y] = (mix(c[0], r), mix(c[1], g), mix(c[2], b), int(round(ao * 255)))

    def paint(self, mask, fn):
        for (x, y) in mask: self.set(x, y, fn(x, y))

    def outline(self, mask, col, diag=False, clip=None):
        nb = [(1, 0), (-1, 0), (0, 1), (0, -1)] + ([(1, 1), (-1, -1), (1, -1), (-1, 1)] if diag else [])
        edge = set()
        for (x, y) in mask:
            for dx, dy in nb:
                q = (x + dx, y + dy)
                if q not in mask and (clip is None or clip(*q)): edge.add(q)
        for (x, y) in edge: self.set(x, y, col)
        return edge

    def save(self, name):
        os.makedirs(OUT, exist_ok=True)
        self.im.resize((W * SCALE, H * SCALE), Image.NEAREST).save(os.path.join(OUT, name + '.png'), optimize=True)


def band_mask():
    return {(x, y) for x in range(W) for y in range(H) if in_card(x, y) and not in_window(x, y)}


def disc(cx, cy, r):
    return {(x, y) for x in range(W) for y in range(H) if (x + .5 - cx) ** 2 + (y + .5 - cy) ** 2 <= r * r}


def sphere(cx, cy, r, lx=-.55, ly=-.65):
    lz = math.sqrt(max(0, 1 - lx * lx - ly * ly))
    def f(x, y):
        nx = (x + .5 - cx) / r; ny = (y + .5 - cy) / r; nz = math.sqrt(max(0, 1 - nx * nx - ny * ny))
        return max(0, min(1, (nx * lx + ny * ly + nz * lz) * .85 + .1))
    return f


def leaf(cx, cy, ang, L=3.6, Wd=1.6):
    c, s = math.cos(ang), math.sin(ang); out = set()
    for x in range(int(cx - L - 2), int(cx + L + 3)):
        for y in range(int(cy - L - 2), int(cy + L + 3)):
            dx, dy = x + .5 - cx, y + .5 - cy
            u = dx * c + dy * s; w = -dx * s + dy * c
            if abs(u) <= L and abs(w) <= Wd * (1 - (u / L) ** 2): out.add((x, y))
    return out


def bevel_fn(mask, ramp, base=None):
    b = len(ramp) // 2 if base is None else base
    def f(x, y):
        i = b
        if (x - 1, y) not in mask or (x, y - 1) not in mask: i += 1
        if (x + 1, y) not in mask or (x, y + 1) not in mask: i -= 1
        return ramp[max(0, min(len(ramp) - 1, i))]
    return f


def rivet(cv, cx, cy, r, ramp, ol):
    m = disc(cx, cy, r); f = sphere(cx, cy, r)
    cv.paint(m, lambda x, y: pick(ramp, f(x, y), x, y)); cv.outline(m, ol)
    cv.set(int(cx - r * .45), int(cy - r * .45), ramp[-1])


def gem(cv, cx, cy, r, ramp, ol, set_ramp=None):
    if set_ramp:
        st = {(x, y) for x in range(W) for y in range(H) if abs(x + .5 - cx) + abs(y + .5 - cy) <= r + 1.6}
        cv.paint(st, bevel_fn(st, set_ramp)); cv.outline(st, ol)
    m = {(x, y) for x in range(W) for y in range(H) if abs(x + .5 - cx) + abs(y + .5 - cy) <= r + .5}
    f = sphere(cx, cy, r + .5)
    cv.paint(m, lambda x, y: pick(ramp, f(x, y), x, y))
    if not set_ramp: cv.outline(m, ol)
    cv.set(int(cx - r * .4), int(cy - r * .4), '#ffffff')


def side_of(x, y):
    """Which band a frame pixel belongs to: 't', 'b' (the plate), 'l' or 'r'."""
    if y > WY1: return 'b'
    if y < WY0: return 't'
    return 'l' if x < W / 2 else 'r'


OL = '#140c06'
GOLD = [hx('#4a2c0c'), hx('#7a5018'), hx('#a8752a'), hx('#d9a441'), hx('#f3d27a'), hx('#fff1b8')]
IRON = [hx('#1c1e22'), hx('#33373d'), hx('#4d535b'), hx('#6c747e'), hx('#949da8'), hx('#c8d0d8')]
STONE = [hx('#24221f'), hx('#3b3733'), hx('#55504a'), hx('#706960'), hx('#8d8578'), hx('#ada492'), hx('#cbc2ad')]
MOSSSTONE = [hx('#1d2618'), hx('#2f3a26'), hx('#465236'), hx('#5f6b48'), hx('#7c8660'), hx('#a3a982')]
MOSS = [hx('#1d3a17'), hx('#2c5520'), hx('#3e6e2a'), hx('#5f8f3e'), hx('#86b04f'), hx('#b5d474')]
# weathered, sun-greyed boards (greyer and paler than the unit's polished walnut, so the two read as kin, not twins)
PLANK = [hx('#22170f'), hx('#3a2a1c'), hx('#544030'), hx('#6e5842'), hx('#8a7258'), hx('#a68e70'), hx('#c2ac8a')]
ROPE = [hx('#3e2c12'), hx('#6a4f24'), hx('#9a7a40'), hx('#c4a464'), hx('#e2c98e')]
RUBY = [hx('#3a0610'), hx('#7a0f22'), hx('#b8203a'), hx('#e8506a'), hx('#ffb0c0')]
SAPPH = [hx('#081638'), hx('#123070'), hx('#2456b0'), hx('#4a8ae8'), hx('#b0d8ff')]
FLOWER = [hx('#f6e7a8'), hx('#ffffff'), hx('#e8b8d8')]


# ======================================================================================================================
# UNIT: the current walnut, polished (a see-through overlay)
# ======================================================================================================================
def unit():
    cv = Canvas(); rng = random.Random(5)
    band = band_mask()
    for (x, y) in band:
        s = side_of(x, y)
        # faint grain running along each band
        along = x if s in 'tb' else y; across = y if s in 'tb' else x
        g = math.sin(along * .21 + across * 1.7 + 2.2 * math.sin(along * .05 + across))
        if g > .72: cv.blend(x, y, '#1a0e06', .28)
        elif g < -.8: cv.blend(x, y, '#ffe2b0', .10)
    # outer bevel: a lit rim on the top/left, a shaded rim on the bottom/right, just inside the rarity border
    for (x, y) in band:
        if not in_rrect(x, y, X0 + 1, Y0 + 1, X1 - 1, Y1 - 1, R_CARD - 1):
            lit = (x < W / 2 and y < H * .7) or y < H / 2
            cv.blend(x, y, '#fff0c8' if lit else '#000000', .30 if lit else .40)
    # the moulding round the art window: dark recess, gold inlay, a lit lip outside it
    for (x, y) in band:
        if in_rrect(x, y, WX0 - 1, WY0 - 1, WX1 + 1, WY1 + 1, R_WIN + 1): cv.blend(x, y, OL, .85)
        elif in_rrect(x, y, WX0 - 2, WY0 - 2, WX1 + 2, WY1 + 2, R_WIN + 2):
            lit = (x < W / 2 and y < WY1) or y < WY0 + 2
            cv.set(x, y, pick(GOLD, .78 if lit else .5, x, y))
        elif in_rrect(x, y, WX0 - 3, WY0 - 3, WX1 + 3, WY1 + 3, R_WIN + 3): cv.blend(x, y, '#000000', .35)
    # the plate: a polished top edge and a gentle sheen
    for x in range(X0 + 2, X1 - 1):
        for y in range(WY1 + 4, Y1 - 1):
            if (x, y) in band and in_card(x, y):
                t = (y - WY1 - 4) / (Y1 - WY1 - 4)
                if t < .18: cv.blend(x, y, '#ffe9c0', .07)
    # brass corner pins
    for (cx, cy) in [(X0 + 4.5, Y0 + 4.5), (X1 - 3.5, Y0 + 4.5), (X0 + 4.5, Y1 - 3.5), (X1 - 3.5, Y1 - 3.5)]:
        rivet(cv, cx, cy, 2.2, GOLD, OL)
    return cv


# ======================================================================================================================
# STRUCTURE: the same frame, knocked together from planks
# ======================================================================================================================
class Plank:
    def __init__(self, cv, rng, x0, y0, x1, y1, vertical, wobble=(0, 0), seed=0, tone=0.0):
        self.cv, self.rng = cv, rng
        self.vertical = vertical
        r2 = random.Random(seed)
        # the far edge wanders a pixel in and out (hand-sawn boards); the board tilts by `wobble` px end to end
        self.mask = set()
        L = (y1 - y0) if vertical else (x1 - x0)
        prof = []; cur = 0
        for i in range(L + 1):
            if r2.random() < .12: cur = max(-1, min(1, cur + r2.choice((-1, 1))))
            prof.append(cur)
        for i in range(L + 1):
            tilt = round(wobble[0] + (wobble[1] - wobble[0]) * i / max(1, L))
            if vertical:
                y = y0 + i; a, b = x0 + tilt, x1 + tilt + prof[i]
                for x in range(a, b + 1): self.mask.add((x, y))
            else:
                x = x0 + i; a, b = y0 + tilt, y1 + tilt + prof[i]
                for y in range(a, b + 1): self.mask.add((x, y))
        self.tone = tone; self.seed = seed

    def draw(self):
        cv, m, r2 = self.cv, self.mask, random.Random(self.seed + 99)
        knots = []
        xs = [p[0] for p in m]; ys = [p[1] for p in m]
        for _ in range(2):
            knots.append((r2.uniform(min(xs) + 2, max(xs) - 2), r2.uniform(min(ys) + 1, max(ys) - 1)))
        ph = r2.uniform(0, 6)
        def f(x, y):
            # flat boards with a few long grain lines (no per-pixel noise: it turns to static on the big card views)
            along = y if self.vertical else x; across = x if self.vertical else y
            v = .5 + self.tone
            g = math.sin(across * 1.9 + ph + 1.1 * math.sin(along * .06 + ph) + .35 * math.sin(along * .21))
            if g > .8: v -= .17
            elif g < -.9: v += .08
            if (x - 1, y) not in m or (x, y - 1) not in m: v += .18
            if (x + 1, y) not in m or (x, y + 1) not in m: v -= .2
            for (kx, ky) in knots:
                d = math.hypot((x + .5 - kx) * (1.6 if self.vertical else .7), (y + .5 - ky) * (.7 if self.vertical else 1.6))
                if d < 1.4: v -= .32
                elif d < 2.6 and int(d * 2) % 2 == 0: v -= .12
            v = max(0, min(1, v)); return PLANK[int(round(v * (len(PLANK) - 1)))]
        cv.paint(m, f)
        cv.outline(m, OL)


def nail(cv, x, y, bent=None):
    """A nail head (3x3, iron, lit top-left, dark rim) with a little rust shadow; bent=(dx, dy) adds a bent-over shank."""
    head = {(0, 0): IRON[4], (1, 0): IRON[5], (2, 0): IRON[3], (0, 1): IRON[4], (1, 1): IRON[3], (2, 1): IRON[1],
            (0, 2): IRON[2], (1, 2): IRON[1], (2, 2): IRON[0]}
    for (dx, dy), c in head.items(): cv.set(x + dx, y + dy, c)
    cv.set(x + 3, y + 1, (30, 16, 8, 170)); cv.set(x + 3, y + 2, (30, 16, 8, 170)); cv.set(x + 1, y + 3, (30, 16, 8, 170)); cv.set(x + 2, y + 3, (30, 16, 8, 170))
    if bent:
        dx, dy = bent
        for i in range(2, 6):
            px, py = x + 1 + dx * i, y + 1 + dy * i
            cv.set(px, py, IRON[3] if i < 4 else IRON[2])
            cv.set(px + (1 if dy else 0), py + (1 if dx else 0), (30, 16, 8, 150))


def rope_wrap(cv, x0, y0, w, h, slant=1):
    """A lashing: rope turns wound diagonally over a joint (each turn a lit strand, a mid strand and a dark groove),
    a dark outline, and a frayed loose end."""
    m = {(x, y) for x in range(x0, x0 + w) for y in range(y0, y0 + h)}
    m -= {(x0, y0), (x0 + w - 1, y0 + h - 1)} if slant > 0 else {(x0 + w - 1, y0), (x0, y0 + h - 1)}
    for (x, y) in m:
        u = (y - y0) + (x - x0) * .6 * slant          # steep diagonal turns, 4px apart: groove, side, crown, side
        cv.set(x, y, (ROPE[0], ROPE[2], ROPE[4], ROPE[3])[int(math.floor(u)) % 4])
    cv.outline(m, OL)
    ex, ey = (x0 + w, y0 + h - 1) if slant > 0 else (x0 - 1, y0 + h - 1)
    for i in range(5):
        cv.set(ex + (i // 2) * (1 if slant > 0 else -1), ey + i, ROPE[3 if i % 2 else 2])


def structure():
    set_geom(10, 9)
    cv = Canvas(); rng = random.Random(31)
    # the two posts (the left one wider and straight, the right one thinner and leaning a pixel), behind everything else
    left = Plank(cv, rng, X0, Y0 + 2, X0 + S, Y1 - 4, True, wobble=(0, 0), seed=1, tone=-.03)
    right = Plank(cv, rng, X1 - S + 2, Y0 + 2, X1, Y1 - 3, True, wobble=(-1, 0), seed=2, tone=.04)
    # the plate: two boards of different widths; the upper one sits crooked and sticks out on the left
    plate_hi = Plank(cv, rng, X0 - 3, WY1 + 1, X1, WY1 + 13, False, wobble=(1, -1), seed=3, tone=.03)
    plate_lo = Plank(cv, rng, X0 + 1, WY1 + 15, X1 - 1, Y1, False, wobble=(0, 0), seed=4, tone=-.07)
    # the top board runs past both corners (over the rarity border) and sags a pixel to the right
    top = Plank(cv, rng, X0 - 3, Y0 - 1, X1 + 3, Y0 + T - 1, False, wobble=(0, 1), seed=5, tone=.06)
    for p in (left, right, plate_lo, plate_hi, top): p.draw()
    # keep what is inside the card, plus the board ends that are allowed to overhang
    keep = lambda x, y: in_card(x, y) or (y <= Y0 + T + 1 and (x < X0 + 7 or x > X1 - 7)) or (WY1 < y < WY1 + 16 and x < X0 + 5)
    for x in range(W):
        for y in range(H):
            if cv.get(x, y)[3] and not keep(x, y): cv.set(x, y, (0, 0, 0, 0))
    # nobody planed the inner edge: chips out of the boards along the window
    for (x, y) in [(WX0 + 14, WY0), (WX0 + 15, WY0), (WX0 + 15, WY0 - 1), (WX1 - 22, WY0), (WX0, WY0 + 40), (WX0, WY0 + 41),
                   (WX0 - 1, WY0 + 41), (WX1, WY0 + 70), (WX1, WY0 + 71), (WX1 - 40, WY1 + 1), (WX1 - 39, WY1 + 1)]:
        cv.set(x, y, (0, 0, 0, 0))
    # splits: down the left post, along the low board, a short one in the top board
    for y in range(WY0 + 28, WY0 + 48): cv.set(X0 + 4 + (1 if y > WY0 + 38 else 0), y, PLANK[0])
    for x in range(X0 + 66, X0 + 94): cv.set(x, Y1 - 6 + (1 if x > X0 + 80 else 0), PLANK[0])
    for x in range(X0 + 30, X0 + 44): cv.set(x, Y0 + 5 - (1 if x > X0 + 37 else 0), PLANK[1])
    # crooked nails where boards cross; three are bent over
    nail(cv, X0 + 1, Y0 + 1); nail(cv, X0 + 5, Y0 + 5)
    nail(cv, X1 - 6, Y0 + 2, bent=(1, 1))
    nail(cv, X0 + 2, WY1 + 4); nail(cv, X1 - 5, WY1 + 5)
    nail(cv, X0 + 3, WY1 + 18, bent=(0, 1)); nail(cv, X1 - 6, WY1 + 19)
    nail(cv, X0 + 3, WY0 + 55); nail(cv, X1 - 5, WY0 + 31, bent=(-1, 0))
    nail(cv, X0 + 61, Y0 + 3); nail(cv, X0 + 58, WY1 + 6)
    # rope lashings on two corners (top-left over the joint, bottom-right where the plate meets the post)
    rope_wrap(cv, X0 + 1, Y0 + T - 1, 8, 9, 1)
    rope_wrap(cv, X1 - 8, WY1 - 4, 8, 9, -1)
    set_geom(8, 7)
    return cv


# ======================================================================================================================
# CASTLE: dressed stone and gold
# ======================================================================================================================
def castle():
    cv = Canvas(); rng = random.Random(41)
    band = band_mask()
    def stone(x, y):
        s = side_of(x, y)
        if s in 'tb':
            course = (y - Y0) // 7; along = x + (5 if course % 2 else 0); row_y = (y - Y0) % 7
            if row_y == 0: return STONE[0]
            if along % 13 == 0: return STONE[0]
            v = .55 + (.14 if row_y == 1 or along % 13 == 1 else 0) - (.14 if row_y == 6 or along % 13 == 12 else 0)
        else:
            course = (y - Y0) // 9; row_y = (y - Y0) % 9
            if row_y == 0: return STONE[0]
            v = .52 + (.14 if row_y == 1 else 0) - (.14 if row_y == 8 else 0) + (.06 if course % 2 else -.04)
        v += rng.uniform(-.06, .06)
        return pick(STONE, v, x, y)
    cv.paint(band, stone)
    # outer gold rim, a dark gap, gold inlay round the window
    for (x, y) in band:
        if not in_rrect(x, y, X0 + 1, Y0 + 1, X1 - 1, Y1 - 1, R_CARD - 1):
            cv.set(x, y, pick(GOLD, .78 if (y < H / 2 and x < W * .8) else .42, x, y))
        elif not in_rrect(x, y, X0 + 2, Y0 + 2, X1 - 2, Y1 - 2, R_CARD - 2): cv.set(x, y, OL)
        elif in_rrect(x, y, WX0 - 1, WY0 - 1, WX1 + 1, WY1 + 1, R_WIN + 1): cv.set(x, y, OL)
        elif in_rrect(x, y, WX0 - 2, WY0 - 2, WX1 + 2, WY1 + 2, R_WIN + 2):
            cv.set(x, y, pick(GOLD, .8 if (x < W / 2 and y < WY1) or y < WY0 + 2 else .5, x, y))
    # the plate's lintel: a gold rule under the window, a gold rule above the bottom rim, a ruby in the middle
    for x in range(X0 + 3, X1 - 2):
        cv.set(x, WY1 + 4, pick(GOLD, .72, x, WY1 + 4)); cv.set(x, WY1 + 5, GOLD[1])
    gem(cv, W / 2, Y1 - 4.5, 2, RUBY, OL, GOLD)
    # gold corner caps (an L of gold) with a stud
    for (cx, cy, sx, sy) in [(X0, Y0, 1, 1), (X1, Y0, -1, 1), (X0, Y1, 1, -1), (X1, Y1, -1, -1)]:
        cap = set()
        for i in range(0, 13):
            for j in range(0, 4):
                cap.add((cx + sx * i, cy + sy * j)); cap.add((cx + sx * j, cy + sy * i))
        cap = {p for p in cap if in_card(*p)}
        cv.paint(cap, bevel_fn(cap, GOLD, 3)); cv.outline(cap, OL, clip=lambda x, y: in_card(x, y))
        gem(cv, cx + sx * 5.5 + (.5 if sx < 0 else 0), cy + sy * 5.5 + (.5 if sy < 0 else 0), 1.4, SAPPH if cy == Y0 else RUBY, OL)
    # crenels along the top band's outer edge, either side of the name
    for x0 in list(range(X0 + 16, X0 + 34, 6)) + list(range(X1 - 33, X1 - 15, 6)):
        for x in range(x0, x0 + 3):
            cv.set(x, Y0 + 2, STONE[5]); cv.set(x, Y0 + 3, STONE[4])
    return cv


# ======================================================================================================================
# FIELD: the Environment card's mossy stone, gold inner line and moss tufts
# ======================================================================================================================
def field():
    cv = Canvas(); rng = random.Random(53)
    band = band_mask()
    def mstone(x, y):
        v = .5 + .12 * math.sin(x * .7 + y * .3) * math.sin(y * .5 - x * .2) + rng.uniform(-.07, .07)
        if (x * 7 + y * 13) % 29 == 0: v -= .25
        return pick(MOSSSTONE, v, x, y)
    cv.paint(band, mstone)
    # moss creeping in from the outer edge (thicker at the top and the corners)
    for (x, y) in band:
        d_out = min(x - X0, X1 - x, y - Y0, Y1 - y)
        n = math.sin(x * .45 + 1.3) * math.sin(y * .37 + .4) + .6 * math.sin((x + y) * .23)
        if d_out <= 1 + (2 if n > .3 else 0) + (1 if y < WY0 else 0):
            cv.set(x, y, pick(MOSS, .45 + .25 * n + rng.uniform(-.1, .1), x, y))
    # the rims: dark outer, gold inner line round the window (the Environment card's #e7c766)
    for (x, y) in band:
        if not in_rrect(x, y, X0 + 1, Y0 + 1, X1 - 1, Y1 - 1, R_CARD - 1): cv.set(x, y, '#1a2a12')
        elif in_rrect(x, y, WX0 - 1, WY0 - 1, WX1 + 1, WY1 + 1, R_WIN + 1): cv.set(x, y, '#0f170b')
        elif in_rrect(x, y, WX0 - 2, WY0 - 2, WX1 + 2, WY1 + 2, R_WIN + 2): cv.set(x, y, '#e7c766' if (x < W / 2 and y < WY1) or y < WY0 + 2 else '#b8963c')
    for x in range(X0 + 6, X1 - 5):
        cv.set(x, WY1 + 4, '#c9a447' if x % 2 else '#e7c766')
    # moss tufts on the corners
    for (cx, cy) in [(X0 + 3.5, Y0 + 3.5), (X1 - 2.5, Y0 + 3.5), (X0 + 3.5, Y1 - 2.5), (X1 - 2.5, Y1 - 2.5)]:
        m = {p for p in disc(cx, cy, 6.2) if in_card(*p)}
        f = sphere(cx, cy, 6.2)
        cv.paint(m, lambda x, y: pick(MOSS, f(x, y) + rng.uniform(-.08, .08), x, y))
        cv.outline(m, '#c9a447', clip=lambda x, y: in_card(x, y) and not in_window(x, y))
    # leaves along the sides and a few flowers on the plate
    for (lx, ly, a) in [(X0 + 3.5, Y0 + 40, -1.2), (X0 + 3.5, Y0 + 47, 1.9), (X1 - 2.5, Y0 + 62, 1.3), (X1 - 2.5, Y0 + 70, -1.9),
                        (X0 + 3.5, Y0 + 92, -1.0), (X1 - 2.5, Y0 + 24, 2.0)]:
        lf = {p for p in leaf(lx, ly, a, 3.4, 1.5) if (p in band)}
        cv.paint(lf, bevel_fn(lf, MOSS, 3)); cv.outline(lf, '#14240e', clip=lambda x, y: (x, y) in band)
    for (fx, fy) in [(X0 + 14, Y1 - 4), (X0 + 22, Y1 - 3), (X1 - 18, Y1 - 4), (X0 + 40, Y1 - 3), (X1 - 36, Y1 - 3)]:
        c = rng.choice(FLOWER)
        for dx, dy in [(0, -1), (-1, 0), (1, 0), (0, 1)]: cv.set(fx + dx, fy + dy, c)
        cv.set(fx, fy, '#e0a020')
    return cv


if __name__ == '__main__':
    for name, fn in [('unit', unit), ('structure', structure), ('castle', castle), ('field', field)]:
        fn().save(name); print('wrote art/frames/%s.png' % name)
