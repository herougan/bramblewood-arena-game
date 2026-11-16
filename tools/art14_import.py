#!/usr/bin/env python3
"""ART14 (2026-11-16): put a chosen field-art candidate into the game, in one command.

Owner 11-16 20:21: "The windfall card's art is supremely ugly." ART13's script-drawn Windfall is replaced by a PixelLab image (Pro, 128x128,
2x2 variations). The four candidates live in art/candidates/art14/<name>-<n>.png (128 px). This copies the chosen one to art/fields/<name>.png
the way ART13 stored field art: 128 px nearest -> 256 px, 256-colour palette PNG (same finish as tools/art/art7_import_2026_11_03.py).
The FIELD_ART key already points at that path (arena_app.js), so nothing else changes; rebuild afterwards.

    python3 tools/art14_import.py windfall 2        # candidate 2 becomes art/fields/windfall.png
    python3 assemble_arena.py && mv bramblewood-arena.html index.html

Nothing is imported until you run it. Prompts are in docs/art/art14-2026-11-16.md and art/candidates/art14/<name>.prompt.txt.
"""
import os, sys
from PIL import Image

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
CAND = os.path.join(ROOT, 'art', 'candidates', 'art14')
FIELDS = os.path.join(ROOT, 'art', 'fields')


def finish(img):  # ART7's finish: 128 px nearest -> 256 px, palette PNG
    small = img.convert('RGB').resize((128, 128), Image.Resampling.NEAREST)
    big = small.resize((256, 256), Image.Resampling.NEAREST)
    return big.quantize(colors=256, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.NONE)


def main():
    if len(sys.argv) != 3:
        sys.exit(__doc__)
    name, n = sys.argv[1], sys.argv[2]
    src = os.path.join(CAND, '%s-%s.png' % (name, n))
    if not os.path.exists(src):
        sys.exit('no candidate file ' + src)
    dst = os.path.join(FIELDS, name + '.png')
    finish(Image.open(src)).save(dst, optimize=True)
    print('art/fields/%s.png <- candidate %s (256x256, palette)' % (name, n))
    print('next: python3 assemble_arena.py && mv bramblewood-arena.html index.html; view: python3 tools/shot.py --js "<open the Windfall card>" --widths 390')


if __name__ == '__main__':
    main()
