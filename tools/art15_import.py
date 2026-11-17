#!/usr/bin/env python3
"""ART15 (2026-11-16): put a chosen Chipmunk Skirmisher candidate into the game, in one command.

Owner 11-16 23:37: "Redo chipmunk skirmisher's art." (a rejection). Candidates: art/candidates/art15/chipmunk-skirmisher-<1-4>.png (128 px).
Writes art/cards/chipmunk-skirmisher.png (ART7 finish: 128 px nearest -> 256 px, palette PNG), the prompt file beside it, and the data URI in
that card's art field in canonical/cards.json (ART2's targeted edit). The built assets/cards/*.webp and its ?v=<content hash> come from the build.

    python3 tools/art15_import.py 1
    python3 assemble_arena.py && mv bramblewood-arena.html index.html
    python3 tools/shot.py --js "openCardDetail('chipmunk-skirmisher')" --name chipmunk-skirmisher --widths 390
"""
import base64, os, sys
from PIL import Image
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
sys.path.insert(0, os.path.join(ROOT, 'tools', 'art'))
import art2_import_2026_10_29 as a2  # noqa: E402
import art7_import_2026_11_03 as a7  # noqa: E402
CID = 'chipmunk-skirmisher'

def main():
    if len(sys.argv) != 2 or sys.argv[1] not in '1234':
        sys.exit(__doc__)
    n = sys.argv[1]
    cards = os.path.join(ROOT, 'canonical', 'cards.json'); text = open(cards, encoding='utf-8').read()
    if not a2.may_replace(text, CID, True):  # the owner rejected it in chat, so force
        sys.exit('refused')
    img = a7.finish(Image.open(os.path.join(ROOT, 'art', 'candidates', 'art15', '%s-%s.png' % (CID, n))).convert('RGB'))
    path = os.path.join(ROOT, 'art', 'cards', CID + '.png'); img.save(path, optimize=True)
    prompt = open(os.path.join(ROOT, 'art', 'candidates', 'art15', CID + '.prompt.txt')).read().replace('all four kept', 'variant %s picked' % n)
    open(os.path.join(ROOT, 'art', 'cards', CID + '.prompt.txt'), 'w').write(prompt)
    uri = 'data:image/png;base64,' + base64.b64encode(open(path, 'rb').read()).decode('ascii')
    open(cards, 'w', encoding='utf-8').write(a2.set_art(text, CID, uri))
    print('art:', CID, 'candidate', n, img.size)

if __name__ == '__main__':
    main()
