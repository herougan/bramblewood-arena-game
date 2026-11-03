#!/usr/bin/env python3
"""ANIM1 (2026-11-03): writes the art half of docs/anim1-2026-11-03.md to tests/out/anim1/art-section.md from art-lists.json, cards.json and the hand-made lists below."""
import json, os
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
cards = {c['id']: c for c in json.load(open(os.path.join(ROOT, 'canonical', 'cards.json'), encoding='utf-8'))}
L = json.load(open(os.path.join(ROOT, 'tests', 'out', 'anim1', 'art-lists.json')))
BASE = ('Pixel art, 32-bit era card illustration, crisp hard edges, limited palette, dark 1-pixel outline, soft light from the upper left, warm muted colours with one bright accent, '
        'full-body character centred, slight low angle, ')
TAIL = ', a full painterly scene filling the whole frame behind it, no text, no watermark'
def prompt(cid, scene=None, pose=''):
    c = cards[cid]; an = c.get('animal') or c['name']
    return BASE + f'a {an}{(", " + pose) if pose else ""}, in ' + (scene or f"a simple habitat scene that fits a {an}") + TAIL
grey = {x[0]: x for x in L['grey']}
fix1 = sorted(set(grey) | set(L['small']))
out = []
w = out.append
# group A rows
w('### A. Flat grey background and/or under 112 px (fix first): %d cards\n' % len(fix1))
w('Reason for all: the art sits on a flat grey (about #B0B0B0) field instead of a scene, which breaks "card art is a scene, always a background" (`docs/art-style-prompts.md`), '
  'and most are the old 85-110 px batch that is soft at card size on a 2x screen. Redo at 256 px with the one prompt pattern below, changing only the animal. '
  'Keep each card\'s pose and subject (open the current art next to it); the animal is the card\'s `animal` field.\n')
w('Prompt pattern: `' + BASE + 'a <animal>, <keep the current pose>, in <a habitat scene that fits it: reeds and water, snow slope, cave mouth, dry grass, dune, lava rock, forest floor>' + TAIL + '`\n')
w('| card | animal | px | why |\n|---|---|---|---|')
for cid in fix1:
    c = cards[cid]; g = grey.get(cid); px = next((x[1] for x in L['grey'] if x[0] == cid), None)
    if px is None:
        import io, base64
        from PIL import Image
        px = Image.open(io.BytesIO(base64.b64decode(c['art'].split(',', 1)[1]))).size[0]
    why = ('grey field %d%% of the edge' % round(g[3] * 100) if g else 'no grey field, but') + (' · %d px, soft' % px if px < 128 else '')
    if not g: why = '%d px, soft at card size' % px
    w(f"| `{cid}` | {c.get('animal')} | {px} | {why} |")
# framed
FR = [('kraken-spawnling', 'grey inset frame and grey edge field around the picture', 'a squid-like sea monster with orange eyes rising from stormy water holding a broken mast, lightning, full-bleed'),
      ('colossal-squid', 'same grey inset frame, and near-twin of kraken-spawnling (duplicate-looking)', 'a giant squid with a pale blue-green body wrapped around a ship mast in calm teal water, full-bleed, clearly different colours from the kraken'),
      ('battlement-heron', 'light grey/rounded frame baked in, low contrast', 'a grey heron on a castle wall at dusk, river valley behind, full-bleed'),
      ('trebuchet-crew', 'dark rounded frame baked into the art', 'beavers hauling a heavy wooden frame with a hanging boulder beside a river, full-bleed'),
      ('mallard-halberdier', 'rounded corners and a thin pale frame baked in', 'a mallard duck standing guard on a wooden bridge by a river town, full-bleed'),
      ('wrong-way-salmon', 'thin blue-white frame baked in', 'a salmon leaping up a waterfall the wrong way, full-bleed'),
      ('mangrove-kingfisher', 'thin grey border band', 'a kingfisher diving into a mangrove creek, full-bleed'),
      ('fungus-gnat-cloud', 'thin grey frame; the subject is a few specks', 'a swarm of small gnats around glowing mushrooms in a dark cave, full-bleed')]
w('\n### B. Frame or border baked into the picture: %d cards\n' % len(FR))
w('| card | what is wrong | suggested prompt (after the base prompt) |\n|---|---|---|')
for cid, why, p in FR: w(f"| `{cid}` | {why} | {p}{TAIL} |")
DARK = [('wolf-spider-mother', 'brown spider on brown ground; the young on her back do not separate at card size', 'a big wolf spider with a dozen tiny spiderlings on her back, on pale sandy ground with a few green blades so the dark body reads against it'),
        ('bog-shrew', 'brown animal on a brown bog, almost no silhouette', 'a shrew with a long snout on a mossy log, bright green moss and a pale mist behind'),
        ('fire-ant-raft', 'the ants are red specks on a raft; unreadable at card size', 'a raft of fire ants, the ants large and red, clinging to a leaf in a flooded meadow, blue water and rain'),
        ('mother-carrier', 'a boat of insects; the card animal is a hummingbird and none is visible (wrong animal)', 'a mother hummingbird carrying her chicks on her back over blossoms, bright sky'),
        ('scraper-of-skies', 'card animal is bee but the art is a hive on a tree, no bee (wrong animal)', 'a large honeybee in flight over a tall oak with a hive, bright sky'),
        ('nest', 'card animal is wasp but the art is a yellow chick under a hive (wrong animal)', 'a paper wasp guarding its round grey paper nest on a branch, summer green behind'),
        ('hazel-coppice', 'card animal is dormouse but the art is a forest of stumps, no creature (wrong animal)', 'a dormouse in a hazel coppice, sitting on a branch with nuts, autumn light'),
        ('crossed-eyes', 'card animal is pigeon but the art is a round blue songbird (wrong animal)', 'a plump grey pigeon with comically crossed eyes on a village roof ridge')]
DARK = [d for d in DARK if d[2]]
w('\n### C. Unreadable at card size or the wrong animal: %d cards\n' % len(DARK))
w('| card | what is wrong | suggested prompt (after the base prompt) |\n|---|---|---|')
for cid, why, p in DARK: w(f"| `{cid}` | {why} | {p}{TAIL} |")
OFF = [('wandering-mage', 'flat black field and chibi sprite look; not a scene', 'a white cat in a purple pointed hat and robe holding a glowing blue orb, on a mossy forest path at dusk'),
       ('baby-bat', 'flat pastel shapes, no outline or scene; a different style from the set', 'a baby bat hanging from a cave ceiling, big eyes, mint-green crystals behind'),
       ('shallows-fry', 'flat cartoon fish on a flat pattern; off-style', 'a small silver fish in clear shallow water over sand, light ripples'),
       ('creeper', 'dark flat disc with a flat glow; off-style', 'a green beetle with a pale glowing grin on a forest floor at night, mushrooms around'),
       ('pink-maus', 'plain pink animal; reads as a pig, not a mouse', 'a pink pet mouse sitting in a clover patch in a garden, big round ears and a long tail')]
w('\n### D. Off-style (flat or sprite-like next to the scene art): %d cards\n' % len(OFF))
w('| card | what is wrong | suggested prompt (after the base prompt) |\n|---|---|---|')
for cid, why, p in OFF: w(f"| `{cid}` | {why} | {p}{TAIL} |")
mid = [x for x in L['mid'] if x not in set(fix1) and x not in {k for k, *_ in FR}]
w('\n### E. Later: 111-127 px, otherwise fine: %d cards\n' % len(mid))
w('Soft only on a 2x phone screen (shown at about 160 px). Upscale or regenerate at 256 px in the same batch as A if credits allow; no look change needed.\n')
w(', '.join('`%s`' % x for x in mid))
open(os.path.join(ROOT, 'tests', 'out', 'anim1', 'art-section.md'), 'w').write('\n'.join(out) + '\n')
tot = set(fix1) | {k for k, *_ in FR} | {d[0] for d in DARK} | {o[0] for o in OFF}
print('A', len(fix1), 'B', len(FR), 'C', len(DARK), 'D', len(OFF), 'E', len(mid), 'distinct redo (A-D)', len(tot))
