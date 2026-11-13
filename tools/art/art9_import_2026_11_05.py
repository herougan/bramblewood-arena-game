#!/usr/bin/env python3
"""ART9 (2026-11-05): import three PixelLab variants (Pro, 128x128, 2x2) for the new / re-arted cards.

The variant was cropped from the gallery sheet in the browser (128 px, one cell) and saved as <src>/<card id>.png.
Reuses ART7's finish (128 px nearest -> 256 px) and ART2's targeted cards.json art edit.
    (A first Old Snapjaw run drew a snapping turtle; the card is an alligator, so it was redrawn.)
    python3 tools/art/art9_import_2026_11_05.py --src <dir> nudibranch victoria-regia old-snapjaw
"""
import argparse, base64, os, sys
from PIL import Image
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
sys.path.insert(0, os.path.join(ROOT, 'tools', 'art'))
import art2_import_2026_10_29 as a2  # noqa: E402
import art7_import_2026_11_03 as a7  # noqa: E402

PROMPTS = {  # description sent to PixelLab (style prefix + brief), and the variant picked
    'nudibranch': ('A', 'a cute nudibranch sea slug with big friendly eyes on two little horn-like rhinophores, a frilly cape of bright orange and violet gills along its back, gliding over a mossy timber beam of an old sunken ferry, soft teal water with drifting light rays and pale sea anemones'),
    'victoria-regia': ('B', "a giant round water lily pad with a raised rim and a cheerful face in its big white-and-pink flower, a young folded leaf pushing up beside it, the pad's turned-up underside showing rows of small red thorns, calm pond with reeds, dragonflies and soft evening light"),
    'old-snapjaw': ('A', 'a huge ancient old alligator with a long scarred snout, mossy green scales and a crown of pink swamp flowers, lying half submerged in murky swamp water among cypress roots and lily pads, one glowing yellow eye watching patiently, misty green swamp with hanging moss and fireflies'),
}
PREFIX = 'Pokemon-style pixel art card illustration, clean dark outlines, rich readable palette, one bright accent, '
SUFFIX = ', a full scenic background filling the whole frame, no text'

def main():
    ap = argparse.ArgumentParser(); ap.add_argument('--src', required=True); ap.add_argument('ids', nargs='+')
    ap.add_argument('--force', action='store_true', help='replace art that is not rejected with a reason')
    a = ap.parse_args()
    cards = os.path.join(ROOT, 'canonical', 'cards.json'); text = open(cards, encoding='utf-8').read()
    for cid in a.ids:
        if not a2.may_replace(text, cid, a.force): continue
        v, p = PROMPTS[cid]
        img = a7.finish(Image.open(os.path.join(a.src, cid + '.png')).convert('RGB'))  # the browser crop is RGBA
        path = os.path.join(ROOT, 'art', 'cards', cid + '.png'); img.save(path, optimize=True)
        open(os.path.join(ROOT, 'art', 'cards', cid + '.prompt.txt'), 'w').write(
            '# ART9 2026-11-05, PixelLab Create image (Pro, 128x128, 2x2), variant %s picked; description sent:\n%s%s%s\n' % (v, PREFIX, p, SUFFIX))
        uri = 'data:image/png;base64,' + base64.b64encode(open(path, 'rb').read()).decode('ascii')
        text = a2.set_art(text, cid, uri); print('art:', cid, img.size)
    open(cards, 'w', encoding='utf-8').write(text)

if __name__ == '__main__':
    main()
