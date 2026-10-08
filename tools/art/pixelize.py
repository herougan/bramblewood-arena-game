#!/usr/bin/env python3
"""Pixel pass for generated art (2026-10-08, asset-pipeline action item 2).

GPT Image / LoRA / any painterly output -> a sprite that sits beside the PixelLab art:
  1. trim transparent edges, 2. downscale to the target grid (box filter, so colours average
  rather than alias), 3. snap every pixel to the Bramblewood palette, 4. hard alpha (no
  half-transparent fringe) and an optional 1-px dark outline, 5. optional frames -> sprite sheet.

    python3 tools/art/pixelize.py in.png out.png --size 32            # one sprite, 32 px tall
    python3 tools/art/pixelize.py f1.png f2.png f3.png sheet.png --size 24 --outline
    python3 tools/art/pixelize.py --palette                            # (re)build the palette from assets/cards

The palette (tools/art/palette.json) is extracted from the shipped card art, so generated assets
use the same colours. Preview at any scale with image-rendering: pixelated.
"""
import argparse, json, os, sys, glob
from PIL import Image

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
PAL_PATH = os.path.join(ROOT, 'tools', 'art', 'palette.json')

def build_palette(n=48):
    """Median-cut the opaque pixels of every shipped card art into n colours."""
    pix = []
    for f in sorted(glob.glob(os.path.join(ROOT, 'assets', 'cards', '*.png'))):
        im = Image.open(f).convert('RGBA')
        data = im.get_flattened_data() if hasattr(im, 'get_flattened_data') else im.getdata()
        pix += [p[:3] for p in data if p[3] > 200]
    strip = Image.new('RGB', (len(pix), 1)); strip.putdata(pix)
    q = strip.quantize(colors=n, method=Image.Quantize.MEDIANCUT)
    pal = q.getpalette()[:n*3]
    colours = sorted({tuple(pal[i:i+3]) for i in range(0, len(pal), 3)}, key=lambda c: (0.299*c[0] + 0.587*c[1] + 0.114*c[2]))
    json.dump({'source': 'assets/cards/*.png, median cut', 'colours': ['#%02x%02x%02x' % c for c in colours]}, open(PAL_PATH, 'w'), indent=1)
    return colours

def load_palette():
    if not os.path.exists(PAL_PATH): return build_palette()
    return [tuple(int(h[i:i+2], 16) for i in (1, 3, 5)) for h in json.load(open(PAL_PATH))['colours']]

def snap(img, colours):
    pal_img = Image.new('P', (1, 1))
    flat = [v for c in colours for v in c]; flat += flat[-3:] * (256 - len(colours))
    pal_img.putpalette(flat)
    rgb = img.convert('RGB').quantize(palette=pal_img, dither=Image.Dither.NONE).convert('RGB')
    out = rgb.convert('RGBA'); out.putalpha(img.getchannel('A'))
    return out

def pixelize(path, size, colours, outline=False, alpha_cut=110):
    im = Image.open(path).convert('RGBA')
    bbox = im.getchannel('A').point(lambda a: 255 if a > 8 else 0).getbbox()
    if bbox: im = im.crop(bbox)
    w = max(1, round(im.width * size / im.height))
    small = im.resize((w, size), Image.Resampling.BOX)
    a = small.getchannel('A').point(lambda v: 255 if v >= alpha_cut else 0)
    small.putalpha(a)
    small = snap(small, colours)
    if outline:
        dark = colours[0]; px = small.load(); W, H = small.size
        edge = [(x, y) for y in range(H) for x in range(W) if px[x, y][3] == 0 and any(
            0 <= x+dx < W and 0 <= y+dy < H and px[x+dx, y+dy][3] == 255 for dx, dy in ((1,0),(-1,0),(0,1),(0,-1)))]
        if edge:  # grow the canvas by 1 px only if needed is overkill; outline sits in the transparent border
            for x, y in edge: px[x, y] = dark + (255,)
    return small

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('files', nargs='*')
    ap.add_argument('--size', type=int, default=32, help='target height in pixels')
    ap.add_argument('--outline', action='store_true')
    ap.add_argument('--palette', action='store_true', help='rebuild tools/art/palette.json from assets/cards')
    a = ap.parse_args()
    if a.palette:
        c = build_palette(); print('palette:', len(c), 'colours ->', os.path.relpath(PAL_PATH, ROOT))
        if not a.files: return
    if len(a.files) < 2: ap.error('give at least one input and an output path')
    colours = load_palette()
    *ins, out = a.files
    frames = [pixelize(f, a.size, colours, a.outline) for f in ins]
    W = max(f.width for f in frames); sheet = Image.new('RGBA', (W * len(frames), a.size), (0, 0, 0, 0))
    for i, f in enumerate(frames): sheet.paste(f, (i * W + (W - f.width)//2, 0))
    sheet.save(out); print(f'{out}: {len(frames)} frame(s), {W}x{a.size} each')

if __name__ == '__main__':
    main()
