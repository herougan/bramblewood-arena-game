#!/usr/bin/env python3
"""Procedural pixel-art card backings (2026-10-16).

2026-10-16 (user: "Card backings -> 4 types for now, structures & units (similar) and castles. Then field effects."):
four card backs, one per kind of card. Each is drawn on a 64x90 pixel grid and saved 4x nearest-neighbour (256x360):

  unit       the base design: forest-green weave, brass frame, the acorn (the game's logo mark) in a gold medallion
  structure  the same family as the unit back: timber planks with iron straps, a stone frame, crossed builder's mallets
  castle     regal: crimson velvet damask, a heavy gold frame set with rubies, a crowned medallion with a keep
  field      natural/elemental: mossy stone frame with vines (the field card's moss-and-gold), wind over moss, a day/night disc

    python3 tools/make_card_backings.py        -> art/backings/{unit,structure,castle,field}.png

Deterministic: re-running gives the same images.
"""
import os, math, random
from PIL import Image

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
OUT = os.path.join(ROOT, 'art', 'backings')
W, H, SCALE = 64, 90, 4
CX, CY = 32, 45           # medallion centre
BAYER = [[0, 8, 2, 10], [12, 4, 14, 6], [3, 11, 1, 9], [15, 7, 13, 5]]


def hx(s):
    s = s.lstrip('#'); return (int(s[0:2], 16), int(s[2:4], 16), int(s[4:6], 16), 255)


def pick(ramp, v, x, y):
    """A value 0..1 to a colour of the ramp (dark -> light), ordered-dithered between steps."""
    v = max(0.0, min(1.0, v)); f = v * (len(ramp) - 1); i = int(f); frac = f - i
    if frac > (BAYER[y % 4][x % 4] + 0.5) / 16: i += 1
    return ramp[min(i, len(ramp) - 1)]


class Canvas:
    def __init__(self):
        self.im = Image.new('RGBA', (W, H), (0, 0, 0, 0)); self.p = self.im.load()

    def set(self, x, y, c):
        if 0 <= x < W and 0 <= y < H: self.p[x, y] = hx(c) if isinstance(c, str) else c

    def get(self, x, y):
        return self.p[x, y] if 0 <= x < W and 0 <= y < H else (0, 0, 0, 0)

    def paint(self, mask, fn):
        for (x, y) in mask: self.set(x, y, fn(x, y))

    def outline(self, mask, col, diag=False):
        nb = [(1, 0), (-1, 0), (0, 1), (0, -1)] + ([(1, 1), (-1, -1), (1, -1), (-1, 1)] if diag else [])
        edge = set()
        for (x, y) in mask:
            for dx, dy in nb:
                q = (x + dx, y + dy)
                if q not in mask: edge.add(q)
        for (x, y) in edge: self.set(x, y, col)
        return edge


# ---- masks -------------------------------------------------------------------------------------------------------------
def inside_rrect(x, y, k, R):
    x0, y0, x1, y1 = k, k, W - 1 - k, H - 1 - k
    if x < x0 or x > x1 or y < y0 or y > y1: return False
    r = max(0, R - k)
    cx = min(max(x, x0 + r), x1 - r); cy = min(max(y, y0 + r), y1 - r)
    return (x - cx) ** 2 + (y - cy) ** 2 <= r * r + r * 0.6


def ring_mask(k0, k1, R=5):
    """Pixels inside inset k0 but not inside inset k1 (a frame band)."""
    return {(x, y) for x in range(W) for y in range(H) if inside_rrect(x, y, k0, R) and not inside_rrect(x, y, k1, R)}


def inset_of(x, y, R=5):
    k = 0
    while inside_rrect(x, y, k + 1, R): k += 1
    return k


def side_of(x, y):
    """'tl' for the top/left half of a frame band (lit), 'br' for bottom/right (shade)."""
    d = {'t': y, 'l': x, 'b': H - 1 - y, 'r': W - 1 - x}
    s = min(d, key=d.get)
    return 'tl' if s in 'tl' else 'br'


def ellipse(cx, cy, rx, ry):
    return {(x, y) for x in range(W) for y in range(H) if ((x + .5 - cx) / rx) ** 2 + ((y + .5 - cy) / ry) ** 2 <= 1}


def disc(cx, cy, r):
    return ellipse(cx, cy, r, r)


def sphere(cx, cy, rx, ry, lx=-.55, ly=-.65):
    """Lambert-ish light 0..1 on an ellipsoid, lit from the top left."""
    lz = math.sqrt(max(0, 1 - lx * lx - ly * ly))
    def f(x, y):
        nx = (x + .5 - cx) / rx; ny = (y + .5 - cy) / ry; nz = math.sqrt(max(0, 1 - nx * nx - ny * ny))
        return max(0, min(1, (nx * lx + ny * ly + nz * lz) * .85 + .1))
    return f


def rot_rect(cx, cy, ang, hl, hw):
    """A rectangle centred at (cx, cy), long axis at angle ang, half-length hl, half-width hw."""
    c, s = math.cos(ang), math.sin(ang); out = set()
    for x in range(W):
        for y in range(H):
            dx, dy = x + .5 - cx, y + .5 - cy
            u = dx * c + dy * s; w = -dx * s + dy * c
            if abs(u) <= hl and abs(w) <= hw: out.add((x, y))
    return out


def leaf(cx, cy, ang, L=4.2, Wd=1.9):
    """A pointed leaf (vesica) centred at (cx, cy) along angle ang."""
    c, s = math.cos(ang), math.sin(ang); out = set()
    for x in range(W):
        for y in range(H):
            dx, dy = x + .5 - cx, y + .5 - cy
            u = dx * c + dy * s; w = -dx * s + dy * c
            if abs(u) <= L and abs(w) <= Wd * (1 - (u / L) ** 2): out.add((x, y))
    return out


def bevel_fn(mask, ramp, base=None):
    """Flat shape shading: top/left edge one step lighter, bottom/right edge one step darker."""
    b = len(ramp) // 2 if base is None else base
    def f(x, y):
        i = b
        if (x - 1, y) not in mask or (x, y - 1) not in mask: i += 1
        if (x + 1, y) not in mask or (x, y + 1) not in mask: i -= 1
        return ramp[max(0, min(len(ramp) - 1, i))]
    return f


def vignette(x, y, amt=.42):
    dx = (x + .5 - W / 2) / (W / 2); dy = (y + .5 - H / 2) / (H / 2)
    return amt * (dx * dx * .8 + dy * dy * .9)


def glow(x, y, r=22, amt=.22):
    d = math.hypot(x + .5 - CX, y + .5 - CY)
    return amt * max(0, 1 - d / r)


# ---- shared parts ------------------------------------------------------------------------------------------------------
def rivet(cv, cx, cy, r, ramp, ol):
    m = disc(cx, cy, r); f = sphere(cx, cy, r, r)
    cv.paint(m, lambda x, y: pick(ramp, f(x, y), x, y)); cv.outline(m, ol)
    hxp, hyp = int(cx - r * .45), int(cy - r * .45)
    if (hxp, hyp) in m: cv.set(hxp, hyp, ramp[-1])


def gem(cv, cx, cy, r, ramp, ol, set_ramp=None):
    if set_ramp:
        st = {(x, y) for x in range(W) for y in range(H) if abs(x + .5 - cx) + abs(y + .5 - cy) <= r + 1.6}
        cv.paint(st, bevel_fn(st, set_ramp)); cv.outline(st, ol)
    m = {(x, y) for x in range(W) for y in range(H) if abs(x + .5 - cx) + abs(y + .5 - cy) <= r + .5}
    f = sphere(cx, cy, r + .5, r + .5)
    cv.paint(m, lambda x, y: pick(ramp, f(x, y), x, y))
    if not set_ramp: cv.outline(m, ol)
    cv.set(int(cx - r * .4), int(cy - r * .4), '#ffffff')


def medallion(cv, ring_ramp, ol, inner_fn, r_out=14.6, r_in=12.2):
    ring = disc(CX, CY, r_out) - disc(CX, CY, r_in)
    f = sphere(CX, CY, r_out, r_out)
    def rc(x, y):
        d = math.hypot(x + .5 - CX, y + .5 - CY)
        v = f(x, y) * .75 + .2
        if d > r_out - .9: v -= .18        # outer lip
        if d < r_in + .9: v -= .28         # inner bevel in shadow
        return pick(ring_ramp, v, x, y)
    cv.paint(ring, rc); cv.outline(ring, ol)
    inner = disc(CX, CY, r_in)
    cv.paint(inner, inner_fn)
    # the inner edge: a dark line then a lit line where the disc meets the ring (sunken)
    for (x, y) in inner:
        d = math.hypot(x + .5 - CX, y + .5 - CY)
        if d > r_in - .9: cv.set(x, y, ol)
    return inner


def stamp_shape(cv, mask, fill_fn, ol, diag=False, clip=None):
    if clip is not None: mask = mask & clip
    cv.paint(mask, fill_fn)
    edge = cv.outline(mask, ol, diag)
    return mask


# ---- palettes ----------------------------------------------------------------------------------------------------------
OL = '#140c06'
GOLD = [hx('#4a2c0c'), hx('#7a5018'), hx('#a8752a'), hx('#d9a441'), hx('#f3d27a'), hx('#fff1b8')]
IRON = [hx('#1c1e22'), hx('#33373d'), hx('#4d535b'), hx('#6c747e'), hx('#949da8'), hx('#c8d0d8')]
STONE = [hx('#2a2826'), hx('#45413c'), hx('#605a52'), hx('#7c7468'), hx('#9a9182'), hx('#bdb3a0')]
MOSSSTONE = [hx('#1d2618'), hx('#2f3a26'), hx('#465236'), hx('#5f6b48'), hx('#7c8660'), hx('#a3a982')]
MOSS = [hx('#1d3a17'), hx('#2c5520'), hx('#3e6e2a'), hx('#5f8f3e'), hx('#86b04f'), hx('#b5d474')]
WOOD = [hx('#24130a'), hx('#3a2111'), hx('#52311a'), hx('#6c4224'), hx('#87562f'), hx('#a3703f')]
NUT = [hx('#4a220c'), hx('#7a3f16'), hx('#a85a24'), hx('#d4813a'), hx('#f0ac5c'), hx('#ffd79a')]
CAP = [hx('#2e1a0a'), hx('#4e3016'), hx('#6e4a24'), hx('#8f6636'), hx('#b08650')]
LEAF = [hx('#1d3a17'), hx('#2f5a22'), hx('#4a7f2e'), hx('#6fa340'), hx('#9cc85c')]
RUBY = [hx('#3a0610'), hx('#7a0f22'), hx('#b8203a'), hx('#e8506a'), hx('#ffb0c0')]
SAPPH = [hx('#081638'), hx('#123070'), hx('#2456b0'), hx('#4a8ae8'), hx('#b0d8ff')]
EMER = [hx('#05301c'), hx('#0e5a34'), hx('#1c8a52'), hx('#40c078'), hx('#b0f0c8')]


# ======================================================================================================================
# UNITS: the base design
# ======================================================================================================================
def unit():
    cv = Canvas(); rng = random.Random(11)
    GREEN = [hx('#0e1d12'), hx('#152a1a'), hx('#1d3a23'), hx('#264b2d'), hx('#2f5b3a'), hx('#3c6f47'), hx('#4d8456')]
    # background: a woven lattice of green threads, over/under at each crossing
    bg = {(x, y) for x in range(W) for y in range(H) if inside_rrect(x, y, 4, 5)}
    def bgf(x, y):
        a = (x + y) % 8; b = (x - y) % 8
        over = ((x + y) // 8 + (x - y) // 8) % 2
        v = .42
        t1 = a in (0, 1, 2); t2 = b in (0, 1, 2)
        if t1 and t2: v = .66 if over else .58
        elif t1: v = .56 + (.06 if a == 0 else 0)
        elif t2: v = .5 + (.06 if b == 0 else 0)
        else: v = .30
        if t1 and t2 and not over and a == 2: v -= .14     # the under-thread's shadow
        v += glow(x, y) - vignette(x, y) + rng.uniform(-.03, .03)
        return pick(GREEN, v, x, y)
    cv.paint(bg, bgf)
    # inner fine gold line, and a dark gap inside the frame
    for (x, y) in ring_mask(4, 5): cv.set(x, y, '#0a140c')
    for (x, y) in ring_mask(6, 7): cv.set(x, y, pick(GOLD, .55 if side_of(x, y) == 'tl' else .38, x, y))
    # frame: brass band 3px, bevelled, engraved dots
    fr = ring_mask(1, 4)
    def frf(x, y):
        k = inset_of(x, y); s = side_of(x, y)
        v = {1: .78, 2: .62, 3: .42}[k] if s == 'tl' else {1: .5, 2: .4, 3: .26}[k]
        if k == 2 and (x + y) % 4 == 0: v -= .16
        return pick(GOLD, v, x, y)
    cv.paint(fr, frf)
    for (x, y) in ring_mask(0, 1): cv.set(x, y, OL)
    # corner rivets: acorn caps
    for (cx, cy) in [(5.5, 5.5), (W - 5.5, 5.5), (5.5, H - 5.5), (W - 5.5, H - 5.5)]:
        rivet(cv, cx, cy, 2.6, CAP, OL)
        cv.set(int(cx), int(cy - 3), OL)
    # top and bottom flourishes: a gold rule with a leaf on each side of a small gem
    for yy, flip in [(14, 1), (H - 15, -1)]:
        for x in range(15, W - 15):
            cv.set(x, yy, pick(GOLD, .7 if abs(x - 32) > 5 else .5, x, yy)); cv.set(x, yy + 1, GOLD[1])
        for sgn in (-1, 1):
            m = leaf(32 + sgn * 8.5, yy + .5 - flip * 1.6, -sgn * flip * .45 + (0 if sgn > 0 else math.pi), 4.6, 1.8)
            stamp_shape(cv, m, bevel_fn(m, LEAF), OL)
        gem(cv, 32, yy + .5, 2, EMER, OL, GOLD)
    # medallion with laurel
    for i in range(7):
        for sgn in (-1, 1):
            a = math.radians(115 + i * 16) if sgn < 0 else math.radians(65 - i * 16)
            lx, ly = CX + .0 + math.cos(a) * 17.2, CY + math.sin(a) * 17.2
            m = leaf(lx, ly, a + sgn * math.pi / 2 * -1 + (math.pi if sgn < 0 else 0), 3.4, 1.5)
            stamp_shape(cv, m, bevel_fn(m, LEAF), OL)
    def inner(x, y):
        d = math.hypot(x + .5 - CX, y + .5 - CY)
        return pick(GREEN, .62 - d / 26 + (.08 if (x + y) % 6 == 0 else 0), x, y)
    medallion(cv, GOLD, OL, inner)
    acorn(cv, CX, CY + 1)
    return cv


def acorn(cv, cx, cy, s=1.0):
    # nut
    nut = ellipse(cx, cy + 3.2 * s, 6.2 * s, 7.0 * s) | {(int(cx) - 1, int(cy + 10.5 * s)), (int(cx), int(cy + 10.5 * s))}
    fn = sphere(cx, cy + 3.2 * s, 6.2 * s, 7.0 * s)
    # cap (a dome with a rolled lip)
    cap = {(x, y) for (x, y) in ellipse(cx, cy - 1.6 * s, 8.2 * s, 5.2 * s) if y <= cy - 1.6 * s + 1.2} \
        | {(x, y) for (x, y) in ellipse(cx, cy - .4 * s, 8.4 * s, 2.1 * s)}
    fc = sphere(cx, cy - 2 * s, 8.4 * s, 5.4 * s)
    nut = nut - cap
    cv.paint(nut, lambda x, y: pick(NUT, fn(x, y), x, y))
    # a soft highlight streak on the nut
    for (x, y) in nut:
        if abs((x - (cx - 2.6 * s)) * 1.2 + (y - (cy + 1.5 * s)) * .35) < .7 and y < cy + 6 * s: cv.set(x, y, NUT[-1])
    def capf(x, y):
        v = fc(x, y)
        if (x + y) % 3 == 0 or (x - y) % 3 == 0: v -= .22         # cross-hatched scales
        if y >= int(cy - .4 * s) + 1: v -= .12                    # lip underside
        return pick(CAP, v, x, y)
    cv.paint(cap, capf)
    stem = {(int(cx), int(cy - 7 * s)), (int(cx), int(cy - 8 * s)), (int(cx) + 1, int(cy - 9 * s)), (int(cx) + 1, int(cy - 10 * s)),
            (int(cx) + 2, int(cy - 10 * s))}
    for p in stem: cv.set(*p, CAP[3])
    lf = leaf(cx + 5.4 * s, cy - 9.2 * s, -.5, 4.2 * s, 1.9 * s)
    lf = lf - cap
    cv.paint(lf, bevel_fn(lf, LEAF))
    for t in range(-3, 4):
        x, y = int(cx + 5.4 * s + t * math.cos(-.5)), int(cy - 9.2 * s + t * math.sin(-.5))
        if (x, y) in lf: cv.set(x, y, LEAF[1])
    cv.outline(nut | cap | stem | lf, OL)


# ======================================================================================================================
# STRUCTURES: the unit back's sibling (same layout), built of timber, iron and stone
# ======================================================================================================================
def structure():
    cv = Canvas(); rng = random.Random(23)
    bg = {(x, y) for x in range(W) for y in range(H) if inside_rrect(x, y, 4, 5)}
    PH = 7
    joints = {}
    for row in range(-1, H // PH + 2):
        joints[row] = [8 + (row * 19) % 24 + 0, 8 + (row * 19) % 24 + 26]
    knots = [(rng.randint(10, 54), rng.randint(8, 82)) for _ in range(7)]
    def bgf(x, y):
        row = (y - 3) // PH; yy = (y - 3) % PH
        if yy == 0: return WOOD[0]
        v = .5 + .14 * math.sin(x * .33 + row * 1.9 + 1.6 * math.sin(y * .8 + row * 2.3)) + (.12 if yy == 1 else 0) - (.12 if yy == PH - 1 else 0)
        for (kx, ky) in knots:
            d = math.hypot((x - kx) * .7, (y - ky) * 1.6)
            if d < 2.2: v -= .28 * (1 - d / 2.2) + .05
            elif d < 3.4 and int(d * 3) % 2 == 0: v -= .08
        for j in joints[row]:
            if x == j: return WOOD[0]
            if x == j + 1: v += .12
        v += glow(x, y, 24, .16) - vignette(x, y, .5) + rng.uniform(-.03, .03)
        return pick(WOOD, v, x, y)
    cv.paint(bg, bgf)
    # nails beside the joints
    for row in range(H // PH + 1):
        for j in joints[row][:1]:
            for nx in (j - 2, j + 3):
                ny = 3 + row * PH + 3
                if (nx, ny) in bg and math.hypot(nx - CX, ny - CY) > 17 and 18 < ny < H - 19: cv.set(nx, ny, IRON[4]); cv.set(nx + 1, ny + 1, IRON[0])
    for (x, y) in ring_mask(4, 5): cv.set(x, y, '#0d0805')
    for (x, y) in ring_mask(6, 7):
        if not (11 <= y <= 16 or H - 17 <= y <= H - 12): cv.set(x, y, pick(IRON, .5 if side_of(x, y) == 'tl' else .3, x, y))   # iron hairline, where the unit back has gold
    # frame: dressed stone blocks with mortar joints
    fr = ring_mask(1, 4)
    def frf(x, y):
        k = inset_of(x, y); s = side_of(x, y)
        along = x if min(y, H - 1 - y) <= min(x, W - 1 - x) else y
        off = 0 if min(y, H - 1 - y) <= min(x, W - 1 - x) else 3
        if (along + off) % 9 == 0: return STONE[0]
        v = {1: .74, 2: .6, 3: .44}[k] if s == 'tl' else {1: .46, 2: .38, 3: .26}[k]
        if (along + off) % 9 == 1: v += .12
        v += rng.uniform(-.06, .06)
        return pick(STONE, v, x, y)
    cv.paint(fr, frf)
    for (x, y) in ring_mask(0, 1): cv.set(x, y, OL)
    # iron strap hinges top and bottom (where the unit back has its gold rule)
    for yy in (12, H - 16):
        strap = {(x, y) for x in range(5, W - 5) for y in range(yy, yy + 4)}
        cv.paint(strap, bevel_fn(strap, IRON, 2)); cv.outline(strap, OL)
        for x in range(9, W - 8, 9):
            if abs(x - 32) > 4: rivet(cv, x + .5, yy + 2, 1.2, IRON, OL)
        # a strap end that splits into a fleur over the middle, like a door hinge
        gem(cv, 32, yy + 2, 2.2, IRON, OL)
    # corner plates: square iron with a bolt
    for (cx, cy) in [(5.5, 5.5), (W - 5.5, 5.5), (5.5, H - 5.5), (W - 5.5, H - 5.5)]:
        pl = {(x, y) for x in range(int(cx) - 3, int(cx) + 3) for y in range(int(cy) - 3, int(cy) + 3)}
        cv.paint(pl, bevel_fn(pl, IRON, 2)); cv.outline(pl, OL)
        rivet(cv, cx, cy, 1.5, IRON, OL)
    # medallion: an iron ring on a sky-lit plank disc, crossed mallets over a little stone wall
    def inner(x, y):
        d = math.hypot(x + .5 - CX, y + .5 - CY)
        v = .62 - d / 30 + .1 * math.sin(x * .5 + y * .1)
        return pick([hx('#2a3540'), hx('#36495a'), hx('#466178'), hx('#5a7c96'), hx('#7aa0b8')], v, x, y)
    disc_m = medallion(cv, IRON, OL, inner)
    clip = disc(CX, CY, 11.2)
    wall = {(x, y) for x in range(W) for y in range(CY + 5, CY + 12)} & clip
    def wallf(x, y):
        r = (y - (CY + 5)) // 3; yy = (y - (CY + 5)) % 3
        if yy == 2 or (x + r * 3) % 6 == 0: return STONE[0]
        return pick(STONE, .95 - (y - CY - 5) / 14 + (.12 if yy == 0 else 0), x, y)
    cv.paint(wall, wallf)
    for x in range(W):
        if (x, CY + 4) in clip: cv.set(x, CY + 4, OL)
    # two mallets crossed in an X
    for sgn in (-1, 1):
        ang = math.atan2(-1, sgn * 1)                     # handle pointing to the upper left / right
        hcx, hcy = CX - sgn * 1.0, CY + 1.0
        handle = rot_rect(hcx, hcy, ang, 9.2, 1.05)
        cv.paint(handle, bevel_fn(handle, WOOD, 4)); cv.outline(handle, OL)
    for sgn in (-1, 1):
        ang = math.atan2(-1, sgn * 1)
        hx_, hy_ = CX - sgn * 1.0 + math.cos(ang) * 7.5, CY + 1.0 + math.sin(ang) * 7.5
        head = rot_rect(hx_, hy_, ang + math.pi / 2, 4.2, 2.3)
        fh = sphere(hx_, hy_, 4.4, 4.4)
        cv.paint(head, lambda x, y: pick(IRON, fh(x, y) * .8 + .25, x, y)); cv.outline(head, OL)
    return cv


# ======================================================================================================================
# CASTLES: regal
# ======================================================================================================================
def castle():
    cv = Canvas(); rng = random.Random(37)
    VEL = [hx('#1e040b'), hx('#360816'), hx('#520e22'), hx('#6e142c'), hx('#8c1e38'), hx('#ab2c48')]
    bg = {(x, y) for x in range(W) for y in range(H) if inside_rrect(x, y, 5, 6)}
    def bgf(x, y):
        a = (x + y - 2) % 12; b = (x - y + 200) % 12
        v = .55 + .05 * math.sin(x * 1.3) * math.sin(y * 1.1) + glow(x, y, 26, .25) - vignette(x, y, .6)
        if a == 0 or b == 0: return pick([VEL[1], GOLD[1], GOLD[2]], .5 + glow(x, y, 30, .9) - vignette(x, y, .5), x, y)
        # a tiny gold fleur in each diamond
        ca = (x + y - 2) % 12; cb = (x - y + 200) % 12
        if (ca, cb) in ((6, 6), (5, 6), (7, 6), (6, 5), (6, 7)) or (ca, cb) in ((5, 5), (7, 7)):
            return pick([GOLD[0], GOLD[1], GOLD[2]], .45 + glow(x, y, 30, .8) - vignette(x, y, .5), x, y)
        return pick(VEL, v + rng.uniform(-.03, .03), x, y)
    cv.paint(bg, bgf)
    for (x, y) in ring_mask(5, 6, 6): cv.set(x, y, '#120206')
    for (x, y) in ring_mask(7, 8, 6): cv.set(x, y, pick(GOLD, .58 if side_of(x, y) == 'tl' else .4, x, y))
    # frame: heavy gold, 4px, a beaded inner row
    fr = ring_mask(1, 5, 6)
    def frf(x, y):
        k = inset_of(x, y, 6); s = side_of(x, y)
        v = {1: .86, 2: .7, 3: .55, 4: .36}[k] if s == 'tl' else {1: .55, 2: .45, 3: .34, 4: .22}[k]
        if k == 3: v = .9 if (x + y) % 3 == 0 else .3     # beads
        return pick(GOLD, v, x, y)
    cv.paint(fr, frf)
    for (x, y) in ring_mask(0, 1, 6): cv.set(x, y, OL)
    # corner rubies and side sapphires, set in gold
    for (cx, cy) in [(6, 6), (W - 6, 6), (6, H - 6), (W - 6, H - 6)]:
        gem(cv, cx, cy, 2.6, RUBY, OL, GOLD)
    for (cx, cy) in [(3, CY), (W - 3, CY), (CX, 3), (CX, H - 3)]:
        gem(cv, cx, cy, 1.7, SAPPH, OL, GOLD)
    # bottom fleur and banner bar
    for x in range(16, W - 16):
        cv.set(x, H - 16, pick(GOLD, .75, x, 0)); cv.set(x, H - 15, GOLD[1])
    gem(cv, 32, H - 15.5, 2.2, RUBY, OL, GOLD)
    # medallion: a midnight disc with stars and a keep
    NIGHT = [hx('#070a1e'), hx('#0e1638'), hx('#182456'), hx('#253677'), hx('#344a96')]
    def inner(x, y):
        d = math.hypot(x + .5 - CX, y + .5 - CY)
        return pick(NIGHT, .2 + (y - CY + 12) / 30 + (.15 - d / 60), x, y)
    medallion(cv, GOLD, OL, inner, 15.2, 12.6)
    for (sx, sy) in [(26, 37), (39, 36), (24, 43), (41, 42), (35, 35)]:
        cv.set(sx, sy, '#fff5c8')
    clip = disc(CX, CY, 11.8)
    KEEP = [hx('#2a2634'), hx('#423c50'), hx('#5c546e'), hx('#7a7090'), hx('#9e94b2'), hx('#c4bcd4')]
    def towers():
        m = set()
        m |= {(x, y) for x in range(29, 36) for y in range(39, 58)}          # central keep
        m |= {(x, y) for x in range(22, 28) for y in range(45, 58)}          # left tower
        m |= {(x, y) for x in range(37, 43) for y in range(45, 58)}          # right tower
        m |= {(x, y) for x in range(26, 39) for y in range(49, 58)}          # curtain wall
        for (x0, x1, top) in [(29, 36, 39), (22, 28, 45), (37, 43, 45), (26, 39, 49)]:
            for x in range(x0, x1):
                if (x - x0) % 2 == 0: m.add((x, top - 1))                     # crenellations
        return m
    km = towers() & clip
    def kf(x, y):
        v = .55
        if (x in (29, 22, 37)): v += .25
        if (x in (35, 27, 42)): v -= .22
        if (y - 39) % 3 == 0 and (x + (y // 3)) % 4 == 0: v -= .14   # stonework
        return pick(KEEP, v - (y - 40) / 60, x, y)
    cv.paint(km, kf); cv.outline(km, OL)
    # windows and the gate
    for (wx, wy) in [(32, 42), (24, 48), (39, 48)]:
        cv.set(wx, wy, '#ffd36b'); cv.set(wx, wy + 1, '#e09a2a')
    gate = {(x, y) for x in range(30, 35) for y in range(52, 58)} - {(30, 52), (34, 52)}
    for p in gate & clip: cv.set(*p, '#120c18')
    for y in range(53, 58):
        if (32, y) in clip: cv.set(32, y, '#3a2a10')
    # banner on the keep
    for y in range(33, 38): cv.set(32, y, GOLD[2])
    for (fx, fy) in [(33, 33), (34, 33), (35, 33), (33, 34), (34, 34), (35, 34), (36, 34), (33, 35), (34, 35)]:
        cv.set(fx, fy, RUBY[3] if fy == 33 else RUBY[2])
    # crown riding on top of the medallion
    crown = {(x, y) for x in range(23, 42) for y in range(26, 32)}
    def crown_shape(x, y):
        if y >= 29: return True
        pts = [24, 28, 32, 36, 40]
        return any(abs(x - p) <= (31 - y) * 0 + (1 if y >= 27 else 0) for p in pts) if y >= 26 else False
    crown = {(x, y) for (x, y) in crown if crown_shape(x, y)}
    cv.paint(crown, lambda x, y: pick(GOLD, (.95 if y == 29 else .7) - (x - 23) / 50, x, y)); cv.outline(crown, OL)
    for p in (24, 28, 32, 36, 40): cv.set(p, 25, GOLD[5]); cv.set(p, 24, OL)
    for (gx, c) in [(28, RUBY), (32, SAPPH), (36, RUBY)]:
        cv.set(gx, 30, c[3]); cv.set(gx, 31, c[1])
    for x in range(23, 42): cv.set(x, 32, GOLD[1])
    return cv


# ======================================================================================================================
# FIELD EFFECTS: natural / elemental (the field card's moss-and-gold frame)
# ======================================================================================================================
def field():
    cv = Canvas(); rng = random.Random(53)
    TEAL = [hx('#0c1e1a'), hx('#123029'), hx('#1a4236'), hx('#245640'), hx('#326b48'), hx('#468252'), hx('#5e9a5c')]
    bg = {(x, y) for x in range(W) for y in range(H) if inside_rrect(x, y, 4, 6)}
    def bgf(x, y):
        v = .45 + .12 * (y / H) + glow(x, y, 26, .2) - vignette(x, y, .55)
        # wind: long curling streaks
        w = math.sin(x * .19 + y * .07 + 2.2 * math.sin(y * .11)) + .6 * math.sin(x * .07 - y * .23)
        if abs(w - .9) < .07: v += .3
        elif abs(w + 1.1) < .06: v += .22
        # a mottle of moss
        v += .07 * math.sin(x * 1.7 + y * .3) * math.sin(y * 1.3 - x * .4) + rng.uniform(-.04, .04)
        return pick(TEAL, v, x, y)
    cv.paint(bg, bgf)
    for (x, y) in ring_mask(4, 5, 6): cv.set(x, y, '#0a140e')
    for (x, y) in ring_mask(6, 7, 6): cv.set(x, y, pick(GOLD, .6 if side_of(x, y) == 'tl' else .42, x, y))   # gold hairline, like the field card
    # frame: mossy stone, moss spilling over the top edges
    fr = ring_mask(1, 4, 6)
    def frf(x, y):
        k = inset_of(x, y, 6); s = side_of(x, y)
        v = {1: .7, 2: .55, 3: .4}[k] if s == 'tl' else {1: .44, 2: .36, 3: .24}[k]
        n = math.sin(x * .9 + y * .4) + math.sin(y * .7 - x * .3) + rng.uniform(-.6, .6)
        if n > .7 and s == 'tl': return pick(MOSS, .45 + (.3 if k == 1 else 0), x, y)
        if n > 1.3: return pick(MOSS, .35, x, y)
        return pick(MOSSSTONE, v + rng.uniform(-.05, .05), x, y)
    cv.paint(fr, frf)
    for (x, y) in ring_mask(0, 1, 6): cv.set(x, y, OL)
    # vines up both sides with small leaves
    for sgn in (-1, 1):
        prev = None
        for y in range(12, H - 12):
            x = int(round(32 + sgn * (24.5 + 1.6 * math.sin(y * .32 + (0 if sgn > 0 else 1.7)))))
            cv.set(x, y, MOSS[1]); cv.set(x + sgn, y, OL)
            if y % 7 == 3:
                lx = x - sgn * 2.6; ly = y + .5
                m = leaf(lx, ly, math.pi / 2 + sgn * .9 + (.6 if y % 14 == 3 else -.6), 2.6, 1.3)
                stamp_shape(cv, m, bevel_fn(m, LEAF), OL)
    # corner moss bosses with a white flower
    for (cx, cy) in [(6, 6), (W - 6, 6), (6, H - 6), (W - 6, H - 6)]:
        rivet(cv, cx, cy, 3.4, MOSS, OL)
        for dx, dy in [(0, -1), (-1, 0), (1, 0), (0, 1)]: cv.set(int(cx) + dx, int(cy) + dy, '#f4f0e0')
        cv.set(int(cx), int(cy), '#f0c040')
    # small drifting leaves and petals in the field
    AUT = [hx('#5a3410'), hx('#9a5a1a'), hx('#d08a2a'), hx('#f0b84a')]
    for (lx, ly, a) in [(18, 24, .6), (45, 66, 2.3), (19, 68, 2.0)]:
        m = leaf(lx, ly, a, 3.2, 1.5)
        stamp_shape(cv, m, bevel_fn(m, AUT), OL)
    for (px, py) in [(40, 25), (24, 59), (14, 44), (50, 46)]:
        cv.set(px, py, '#f6e8f0'); cv.set(px + 1, py, '#e8a8c8')
    # top and bottom: a gold rule with a leaf sprig each side and an elemental gem (amber sun above, sapphire water below)
    for yy, flip, g in [(14, 1, [hx('#5a2a04'), hx('#a8560a'), hx('#e8901a'), hx('#ffc850'), hx('#fff0b0')]), (H - 15, -1, SAPPH)]:
        for x in range(17, W - 17):
            cv.set(x, yy, pick(GOLD, .66 if abs(x - 32) > 4 else .5, x, yy)); cv.set(x, yy + 1, GOLD[1])
        for sgn in (-1, 1):
            m = leaf(32 + sgn * 7.5, yy + .5 - flip * 1.5, -sgn * flip * .5 + (0 if sgn > 0 else math.pi), 4.0, 1.7)
            stamp_shape(cv, m, bevel_fn(m, LEAF), OL)
        gem(cv, 32, yy + .5, 2, g, OL, GOLD)
    # medallion: half day, half night, in mossy bronze
    BRONZE = [hx('#2a2410'), hx('#4a4018'), hx('#6e6024'), hx('#98843a'), hx('#c4ac58'), hx('#ecd88a')]
    DAY = [hx('#3a7ab0'), hx('#5a9ad0'), hx('#82bce4'), hx('#b0daf2')]
    NIGHT = [hx('#0a0e28'), hx('#141c44'), hx('#1e2a60'), hx('#2c3a7a')]
    def inner(x, y):
        dy = y + .5 - CY
        if x + .5 + dy * .35 < CX: return pick(NIGHT, .3 + (y - CY + 12) / 36, x, y)
        return pick(DAY, .2 + (y - CY + 12) / 30, x, y)
    medallion(cv, BRONZE, OL, inner)
    clip = disc(CX, CY, 11.2)
    # the dividing line, a soft gold seam
    for y in range(CY - 12, CY + 13):
        x = int(CX - (y + .5 - CY) * .35)
        if (x, y) in clip: cv.set(x, y, GOLD[3])
    # sun (right) with short rays, kept clear of the seam
    sx0, sy0 = CX + 5.5, CY - 3.5
    sun = disc(sx0, sy0, 3.1) & clip
    fs = sphere(sx0, sy0, 3.1, 3.1)
    cv.paint(sun, lambda x, y: pick([hx('#e08a1a'), hx('#f4b42a'), hx('#ffd84a'), hx('#fff4a8')], fs(x, y) * .8 + .25, x, y)); cv.outline(sun, hx('#b0601a'))
    for a in range(0, 360, 45):
        x, y = int(sx0 + math.cos(math.radians(a)) * 5.6), int(sy0 + math.sin(math.radians(a)) * 5.6)
        if (x, y) in clip and x + .5 + (y + .5 - CY) * .35 >= CX + 1.5: cv.set(x, y, '#ffe46a')
    # crescent moon (left) and stars
    moon = (disc(CX - 5.5, CY - 3.5, 3.4) - disc(CX - 4.0, CY - 4.6, 2.9)) & clip
    cv.paint(moon, lambda x, y: '#f2f4ff' if x < CX - 6 else '#c8d2f4')
    for (sx, sy) in [(CX - 9, CY + 1), (CX - 3, CY - 9), (CX - 2, CY - 1), (CX - 8, CY - 8)]:
        cv.set(sx, sy, '#ffffff')
    # hills and a cloud low in the disc: moss over both halves, a rain cloud on the day side
    hills = {(x, y) for (x, y) in clip if y > CY + 4 + 2.2 * math.sin(x * .45)}
    cv.paint(hills, lambda x, y: pick(MOSS, .62 - (y - CY - 4) / 14 + (.1 if (x * 3 + y) % 7 == 0 else 0), x, y))
    for x in range(W):
        top = [y for y in range(H) if (x, y) in hills]
        if top: cv.set(x, top[0], MOSS[5])
    cloud = (disc(CX + 4, CY + 3.5, 2.6) | disc(CX + 7, CY + 2.8, 2.2) | disc(CX + 1.6, CY + 4.2, 1.8)) & clip
    fc = sphere(CX + 5, CY + 2, 5, 3)
    cv.paint(cloud, lambda x, y: pick([hx('#8a98ac'), hx('#b8c4d4'), hx('#e4ecf4'), hx('#ffffff')], fc(x, y) + .2, x, y))
    for (rx, ry) in [(CX + 3, CY + 7), (CX + 6, CY + 8), (CX + 8, CY + 6)]:
        if (rx, ry) in clip: cv.set(rx, ry, '#6ab0f0')
    return cv


def save(cv, name):
    os.makedirs(OUT, exist_ok=True)
    big = cv.im.resize((W * SCALE, H * SCALE), Image.NEAREST)
    big.save(os.path.join(OUT, name + '.png'), optimize=True)
    return big


if __name__ == '__main__':
    for n, f in [('unit', unit), ('structure', structure), ('castle', castle), ('field', field)]:
        save(f(), n); print('art/backings/%s.png' % n)
