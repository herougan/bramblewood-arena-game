#!/usr/bin/env python3
"""Pixel art for the Inventory page (2026-10-17, user: "Any background we can use here? The field kit card itself can also
have a pack.").

    python3 tools/art/make_inventory_art.py            # prints the three CSS data URIs
    python3 tools/art/make_inventory_art.py --preview out.png   # a 6x preview sheet

Three tiny sprites in the shipped-art palette (tools/art/palette.json), drawn in code so they can be re-tuned:
  satchel  24x24  the traveller's leather satchel (map, draught and a sprig peeking out) on the Field kit card
  planks   32x32  a seamless tile of dark camp-shelf planks, the page's backdrop
  garland  32x12  a seamless vine of leaves and berries along the top of the page
They're pasted into arena_template.html as data URIs (--inv-satchel / --inv-planks / --inv-garland) and drawn with
image-rendering: pixelated, so they stay crisp at any size.
"""
import base64, io, sys
from PIL import Image

C = {
    'o': (29, 26, 27), 'L': (168, 106, 72), 'l': (219, 137, 85), 'd': (154, 77, 57), 'D': (109, 49, 45),
    's': (83, 67, 54), 'g': (218, 167, 108), 'G': (239, 228, 155), 'p': (227, 201, 161), 'P': (168, 136, 105),
    'b': (74, 201, 191), 'B': (145, 201, 195), 'c': (168, 136, 105), 'v': (54, 72, 61), 'f': (93, 129, 99),
    'F': (108, 165, 158), 'r': (160, 47, 53), 'w1': (61, 45, 34), 'w2': (72, 53, 40), 'w3': (53, 39, 34), 'w4': (82, 62, 46),
    'n': (35, 27, 22), 'k': (133, 126, 100), 'M': (122, 58, 44),
}


def img(w, h):
    return Image.new('RGBA', (w, h), (0, 0, 0, 0))


def put(im, x, y, key):
    if 0 <= x < im.width and 0 <= y < im.height:
        im.putpixel((x, y), C[key] + (255,))


def rect(im, x0, y0, x1, y1, key):
    for y in range(y0, y1 + 1):
        for x in range(x0, x1 + 1):
            put(im, x, y, key)


def outline(im, key='o'):
    src = im.copy()
    for y in range(im.height):
        for x in range(im.width):
            if src.getpixel((x, y))[3]:
                continue
            if any(0 <= x + dx < im.width and 0 <= y + dy < im.height and src.getpixel((x + dx, y + dy))[3]
                   for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1))):
                put(im, x, y, key)


def satchel():
    im = img(24, 24)
    # strap: an arc over the top, behind everything
    for x in range(4, 20):
        t = (x - 11.5) / 8.0
        y = int(round(1.5 + 7.0 * t * t))
        put(im, x, y, 's'); put(im, x, y + 1, 's')
    # what peeks out: a rolled map, a draught bottle, a green sprig
    rect(im, 5, 6, 9, 10, 'p'); put(im, 6, 7, 'P'); put(im, 8, 8, 'P'); rect(im, 5, 6, 5, 10, 'P')
    rect(im, 14, 4, 16, 10, 'b'); put(im, 14, 5, 'B'); put(im, 14, 6, 'B'); rect(im, 14, 3, 16, 3, 'c'); put(im, 15, 2, 'c')
    rect(im, 11, 4, 11, 10, 'v'); put(im, 10, 4, 'f'); put(im, 12, 5, 'F'); put(im, 10, 6, 'f'); put(im, 12, 7, 'f'); put(im, 11, 3, 'F')
    # body
    rect(im, 3, 10, 20, 21, 'L')
    rect(im, 3, 20, 20, 21, 'd'); rect(im, 3, 10, 3, 20, 'l')
    put(im, 3, 21, 'o'); put(im, 20, 21, 'o')  # rounded bottom corners (outline pass trims them)
    for x in range(5, 19, 2):
        put(im, x, 19, 'g')  # stitching
    # flap
    for y in range(10, 16):
        inset = max(0, y - 13) * 2
        rect(im, 3 + inset, y, 20 - inset, y, 'M')
    rect(im, 3, 10, 20, 10, 'd'); rect(im, 3, 11, 3, 13, 'd')
    rect(im, 7, 16, 16, 16, 's'); rect(im, 3, 13, 4, 13, 's'); rect(im, 19, 13, 20, 13, 's')
    for y, (a, b) in {14: (5, 18), 15: (7, 16)}.items():
        put(im, a, y, 's'); put(im, a + 1, y, 's'); put(im, b, y, 's'); put(im, b - 1, y, 's')
    # buckle
    rect(im, 10, 13, 13, 16, 'g'); rect(im, 11, 14, 12, 15, 's'); put(im, 10, 13, 'G'); put(im, 11, 13, 'G')
    # clear the corner pixels so the outline rounds them
    for (x, y) in ((3, 21), (20, 21)):
        im.putpixel((x, y), (0, 0, 0, 0))
    outline(im)
    return im


def planks():
    im = img(32, 32)
    rows = ['w1', 'w2', 'w4', 'w2']
    for i, key in enumerate(rows):
        y0 = i * 8
        rect(im, 0, y0, 31, y0 + 6, key)
        rect(im, 0, y0 + 7, 31, y0 + 7, 'n')  # seam
        rect(im, 0, y0, 31, y0, 'w4' if key != 'w4' else 'w2')  # top lip catches the light
        # grain flecks and an end joint, offset per board so the tile reads as staggered planks
        j = (i * 13 + 5) % 32
        rect(im, j, y0 + 1, j, y0 + 6, 'n')
        for k in range(4):
            gx = (j + 4 + k * 7 + i * 3) % 32
            put(im, gx, y0 + 2 + (k % 3), 'w3'); put(im, (gx + 1) % 32, y0 + 2 + (k % 3), 'w3')
        put(im, (j + 2) % 32, y0 + 3, 'k')  # a nail head
    return im


def garland():
    im = img(32, 12)
    for x in range(32):
        y = int(round(3 + 2.5 * (1 - abs(((x % 32) - 16) / 16.0))))  # a gentle sag, seamless at the edges
        put(im, x, y, 'v')
        if x % 6 == 2:
            put(im, x, y + 1, 'f'); put(im, x + 1, y + 1, 'f'); put(im, x, y + 2, 'f'); put(im, x + 1, y + 2, 'F')
        if x % 6 == 5:
            put(im, x, y - 1, 'f'); put(im, x - 1, y - 1, 'F'); put(im, x, y - 2, 'f')
        if x in (9, 25):
            put(im, x, y + 2, 'r'); put(im, x + 1, y + 2, 'r'); put(im, x, y + 3, 'r')
    return im


def uri(im):
    buf = io.BytesIO(); im.save(buf, 'PNG', optimize=True)
    return 'data:image/png;base64,' + base64.b64encode(buf.getvalue()).decode('ascii')


if __name__ == '__main__':
    sprites = {'satchel': satchel(), 'planks': planks(), 'garland': garland()}
    if len(sys.argv) > 2 and sys.argv[1] == '--preview':
        sheet = Image.new('RGBA', (6 * (24 + 32 + 64 + 12), 6 * 32), (40, 34, 30, 255))
        x = 0
        for nm in ('satchel', 'planks'):
            s = sprites[nm].resize((sprites[nm].width * 6, sprites[nm].height * 6), Image.NEAREST); sheet.alpha_composite(s, (x, 0)); x += s.width + 36
        g = sprites['garland']; row = Image.new('RGBA', (64, 12)); row.alpha_composite(g, (0, 0)); row.alpha_composite(g, (32, 0))
        s = row.resize((64 * 6, 12 * 6), Image.NEAREST); sheet.alpha_composite(s, (x, 0))
        sheet.save(sys.argv[2])
    else:
        for nm, im in sprites.items():
            print('--inv-%s: url(%s);' % (nm, uri(im)))
