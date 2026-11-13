#!/usr/bin/env python3
"""ART12 (2026-11-12): import PixelLab variants (Pro, 128x128, 2x2 sheet) for the re-arted Dormouse and the cards that had no art.

<src>/<card id>.png is the picked 128 px cell (cut from the gallery sheet), <src>/<card id>.sheet.png the whole 256 px sheet
(variants A=top-left, B=top-right, C=bottom-left, D=bottom-right, used for the contact sheets).
Reuses ART7's finish (128 -> 256, palette PNG) and ART2's targeted cards.json art edit (never rewrite cards.json by hand).
    python3 tools/art/art12_import_2026_11_12.py --src <dir> --sheets docs/art     (all cards in PICKS)
The picks and the exact descriptions sent to PixelLab are in PICKS below.
"""
import argparse, base64, os, sys
from PIL import Image, ImageDraw
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
sys.path.insert(0, os.path.join(ROOT, 'tools', 'art'))
import art2_import_2026_10_29 as a2  # noqa: E402
import art7_import_2026_11_03 as a7  # noqa: E402

PREFIX = 'Pokemon-style pixel art card illustration, clean dark outlines, rich readable palette, one bright accent, '
SUFFIX = ', a full scenic background filling the whole frame, no text'

PICKS = {  # card id -> (variant picked, description body sent to PixelLab between PREFIX and SUFFIX)
    'dormouse': ('B',
        'a cute golden-brown hazel dormouse with a cream belly, big shiny black eyes and a thick bushy tail curled around its body, curled up asleep on a mossy branch in a hazel tree with a hazelnut beside it, four small paws tucked under its chin, natural animal anatomy, not anthropomorphic, no hands, anatomically correct dormouse: one small rodent body with four short legs, round ears and a long thick bushy tail, moonlit hazel-wood background with soft blue dusk light and drifting fireflies'),
    'sea-bass': ('A',
        'a cute silver sea bass with big bright eyes and a dark spot on its gill cover, sleek silver body with faint dark lines along its flanks, riding the white curl of a breaking wave over a reef wall, two smaller sea bass glinting in the water behind it, natural animal anatomy, not anthropomorphic, anatomically correct fish: one streamlined body with no limbs, two dorsal fins, a pair of pectoral fins, a pair of pelvic fins, one anal fin and a forked tail fin, sunlit teal shallows background with coral heads and a pale sandy bottom'),
    'barrel-cactus': ('C',
        'a cute round green barrel cactus with big bright eyes, a squat ribbed body with neat rows of pale sharp spines along each rib, a ring of small yellow flowers on top, standing on cracked sandy ground between pale dunes under a clear pale sky, hot pale-gold desert background with long soft shadows, one bright yellow flower accent, natural plant anatomy, not anthropomorphic, no hands, anatomically correct barrel cactus: one short round ribbed body, no arms, no branches, no legs, spines in rows on the ribs, flowers in a crown on top'),
    'cormorant': ('B',
        'a glossy black cormorant with a hooked beak, green eyes and a pale throat patch standing on a rocky sea-cliff ledge, wings half spread to dry in the wind, a long sharpened wooden pole taken from its nest held crosswise in its beak, white sea-cliff background with nesting gannets on the ledges, sea spray and a bright blue sky, one bright green eye accent, natural animal anatomy, not anthropomorphic, no hands, anatomically correct bird: two legs, two wings, one hooked beak'),
    'glow-worm': ('D',
        'a small pale glow-worm larva with a softly glowing blue-green tail end, flicking a tiny bead of light from its tail toward the viewer, hundreds of glowing dots and silky threads on the cave roof above like a starry sky, dark blue cave background with a still underground pool reflecting the lights, natural animal anatomy, not anthropomorphic, no hands, anatomically correct glow-worm larva: soft segmented worm-like body, tiny legs under the front segments'),
    'legate-of-rivergate': ('A',
        'a calm river otter commander on all four legs of the Rivergate Legion in a bronze crested helmet with a tall red plume, a bronze chest plate over an oxblood-red wool tunic and a cream cloak pinned at the shoulder, head held high as if giving an order, a tall standard topped with a bronze fish planted beside it, river fort background with a timber palisade, a stone bridge and neat ranks of small otters on the bank under a clear morning sky, one bright oxblood-red accent, natural animal anatomy, not anthropomorphic, no hands, anatomically correct otter: long body, four short legs, a thick tapering tail'),
    'gold-throat-elder': ('B',
        'a wise old hummingbird elder of the Gold-throat tribe hovering in front of a carved wooden totem, a shimmering gold throat and emerald back, a few silver-tipped feathers of age, a tall feather headdress with beads and a small flower garland, beak open in a song, tiny wings blurred with motion, warm cliff-stone background with woven nests, tribal banners and many small bright hummingbirds gathered to listen at golden hour, one bright gold accent, natural animal anatomy, not anthropomorphic, no hands, anatomically correct bird: two legs, two wings, one beak'),
    'oathsworn-legionary': ('C',
        'a sturdy river otter legionary of the Rivergate Legion standing firm on all four legs, chin up, looking past the viewer toward a tall standard topped with a bronze fish, a bronze crested helmet, an oxblood-red wool tunic under a bronze chest plate, a tall rectangular shield with a wave emblem strapped fitted to its flank, river fort background with a timber palisade, a stone bridge and a line of otters behind it under a clear morning sky, one bright oxblood-red accent, natural animal anatomy, not anthropomorphic, no hands, anatomically correct otter: long body, four short legs, a thick tapering tail'),
    'cobalt-talon-honour-guard': ('A',
        'a fierce young hummingbird of the Cobalt Talon tribe darting forward in mid-flight, shimmering cobalt-blue feathers with bold white war-paint stripes, a short crest of blue feathers, a bead necklace and a small flower garland, tiny wings blurred with motion, a carved totem and an old gold-throated hummingbird singing on a ledge behind it, warm cliff-stone background with woven nests and tribal banners at golden hour, one bright cobalt accent, natural animal anatomy, not anthropomorphic, no hands, anatomically correct bird: two legs, two wings, one beak'),
    'crimson-wing-drumcaller': ('D',
        'a small hummingbird of the Crimson Wing tribe hovering beside a little gourd drum on a woven strap, crimson and gold feathers with bold war-paint stripes on its cheeks, a short feather headdress, beak open in a chant, tiny wings blurred with motion, warm cliff-stone ledge background with woven tribal banners, flower garlands and a sunset sky, one bright crimson accent, natural animal anatomy, not anthropomorphic, no hands, anatomically correct bird: two legs, two wings, one beak'),
    'trident-caiman': ('B',
        'a lean young caiman with bumpy olive scales lying low on a muddy bank, holding a rusty three-pronged fishing fork crosswise in its jaws, a frayed rope loop around its neck to carry it, half a sunken rowing boat behind it, misty green swamp background with cypress roots and hanging moss, one bright yellow eye accent, natural animal anatomy, not anthropomorphic, no hands, anatomically correct caiman: four short legs, a long tail, one long snout'),
    'peat-smoke-shaman': ('D',
        'a round old toad with warty brown skin sitting beside a small clay pot of smouldering peat, eyes half closed as it hums, a necklace of dried reeds, seed pods and tiny shells, curls of pale smoke rising around it, dusky bog background with sundews, cotton grass and glowing marsh lights, natural animal anatomy, not anthropomorphic, no hands, anatomically correct toad: squat body, four legs, no tail'),
    'matamata': ('A',
        'a flat matamata turtle with a ridged shell like a heap of brown dead leaves and a wide frilled triangular head, mouth just opening in the shallow water, drifting leaves around it, murky river-green background with sunken branches and soft light from above, natural animal anatomy, not anthropomorphic, no hands, anatomically correct turtle: one domed shell, four legs, a long neck and a tail'),
    'bog-lungfish': ('B',
        'a long eel-like lungfish with thread-thin fins and speckled grey-brown skin curled half inside a cracked mud cocoon, one calm eye open, a dry cracked bog bed with a little puddle beside it, hazy golden evening background with reeds, natural animal anatomy, not anthropomorphic, no hands, anatomically correct lungfish: one eel-like body, no legs, thread-like fins'),
    'mossmother-newt': ('B',
        "a plump orange-bellied newt with a stern, motherly face carrying a bundle of green sphagnum moss on her back, nosing a tuft of moss onto a small cut on a mouse's leg beside her, damp mossy log background in a soft green bog with fern fronds, natural animal anatomy, not anthropomorphic, no hands, anatomically correct newt: long body, four short legs, a flat tail"),
    'reed-dart-bittern': ('A',
        'a streaky brown bittern standing perfectly upright among tall reeds, beak pointed at the sky to blend in, a small quiver of sharpened reed stems strapped to its side, one reed stem flicking out of the reed bed toward the viewer, golden reed-bed background at dusk, natural animal anatomy, not anthropomorphic, no hands, anatomically correct bird: two legs, two wings, one beak'),
    'shoebill': ('B',
        'a tall grey shoebill stork with a huge clog-shaped bill and pale unblinking eyes staring straight at the viewer, standing motionless on a floating mat of papyrus, still dark water and papyrus stems in the background, soft overcast light, natural animal anatomy, not anthropomorphic, no hands, anatomically correct bird: two long legs, two wings, one huge bill'),
    'hoatzin': ('A',
        'a scruffy hoatzin bird with a shaggy orange crest, blue bare face and red eyes perched on a low branch over brown water, a fluffy chick below climbing the branch with little claws on its wings, wavy green stink lines drifting from the adult, humid swamp-forest background with hanging vines, natural animal anatomy, not anthropomorphic, no hands, anatomically correct bird: two legs, two wings, one beak'),
    'shell-drop-gull': ('B',
        'a cheeky herring gull hovering above rocks with wings spread, a big ridged clam shell just released from its feet and falling, cracked shells scattered on the rocks below, bright windy seaside background with rock pools and a blue sky with small clouds, natural animal anatomy, not anthropomorphic, no hands, anatomically correct bird: two legs, two wings, one beak'),
    'smuggler-slingrat': ('B',
        'a sly brown rat of the road-folk in a patched dark cloak and a small sea-blue scarf, a leather strap with a stone pouch hanging from its jaws, a small lantern and a stack of barrels behind it, dim sea-cave background with dripping rock and a sliver of moonlit water, lantern-amber glow, natural animal anatomy, not anthropomorphic, no hands, anatomically correct rat: four legs on all fours, a long thin tail'),
    'tidefolk-harpooner': ('A',
        'a sleek grey seal of the Tidefolk surfacing through green water, eyes fierce, a long carved fishing pole with a bone hook carried in its jaws, a kelp cord with shells and beads around its neck, mangrove roots and kelp curtains in the background, sunlight in shafts through the water, natural animal anatomy, not anthropomorphic, no hands, anatomically correct seal: one torpedo body, two front flippers, two rear flippers, no hands'),
    'snapgun-shrimp': ('D',
        'a small bright pistol shrimp with one huge oversized claw raised, a glowing white bubble bursting in front of the claw with a tiny flash of light, coral reef background with soft pink and purple corals and drifting particles, natural animal anatomy, not anthropomorphic, no hands, anatomically correct pistol shrimp: segmented body, ten legs, one huge claw and one small claw'),
    'quill-flinger-porcupine': ('A',
        'a stocky porcupine with long black-and-white quills raised, mid-swing of its tail with a few loose quills flying off toward the viewer, bramble-hedge maze background with tall thorny walls and warm late-afternoon light, natural animal anatomy, not anthropomorphic, no hands, anatomically correct porcupine: four legs on all fours, quills on its back'),
    'acorn-pelter-squirrel': ('B',
        'a red squirrel with tufted ears and a bushy tail sitting on a branch, an acorn held in its mouth ready to drop, more acorns stuffed in a little bark pouch strapped to its side, sunny woodland edge background with oak leaves and a castle wall far away, natural animal anatomy, not anthropomorphic, no hands, anatomically correct squirrel: four legs, one bushy tail'),
    'pinecone-crossbill': ('A',
        'a red crossbill finch with its crossed beak gripping a pinecone, wings open as it lets the cone drop, snowy pine branches around it, dark taiga forest background with soft snowfall and pale winter light, natural animal anatomy, not anthropomorphic, no hands, anatomically correct bird: two legs, two wings, one crossed beak'),
    'yeti-tracker': ('A',
        'a stocky wolverine with thick brown fur nosing into a huge fresh footprint in the snow, a coil of weighted cord with two round stones slung across its back, more giant footprints leading away, wind-blown tundra background with distant mountains and grey sky, natural animal anatomy, not anthropomorphic, no hands, anatomically correct wolverine: four legs on all fours, a bushy tail'),
    'icefletch-fox': ('C',
        'a white arctic fox crouched on a snowdrift, a small bundle of clear icicles strapped to its back like a quiver, one icicle glinting as it flicks loose, pale blue tundra background with an icy ridge and a low winter sun, natural animal anatomy, not anthropomorphic, no hands, anatomically correct fox: four legs on all fours, a bushy tail'),
    'yeti-snarer': ('A',
        'a snow leopard with thick spotted fur crouched on a rocky ledge, a looped rope held in its jaws and more rope coiled across its back, eyes fixed on a huge shaggy shadow in the blowing snow below, steep snowy mountain background at dusk, natural animal anatomy, not anthropomorphic, no hands, anatomically correct snow leopard: four legs on all fours, a long thick tail'),
    'sand-flinger-antlion': ('A',
        'a round antlion larva with big curved jaws at the bottom of a sand funnel, a spray of sand flicked up from its head into the air, glassy dune background with heat shimmer and a pale sky, natural animal anatomy, not anthropomorphic, no hands, anatomically correct antlion larva: three body segments, six legs from the thorax, two big curved jaws'),
    'stonecracker-vulture': ('B',
        'a white vulture with a yellow face and a shaggy neck ruff flying low, a round stone held in its beak, an ostrich egg on the pale sand below, bright desert background with low dunes, scattered bones and a hazy sun, natural animal anatomy, not anthropomorphic, no hands, anatomically correct bird: two legs, two wings, one hooked beak'),
    'adder': ('C',
        'a small grey-brown adder with a dark zigzag down its back coiled on a sun-warmed flat stone, head raised, a fine mist of droplets sprayed from its open mouth, big bright eyes, heather and bracken around the stone, misty green swamp-edge background with reeds and soft morning light, natural animal anatomy, not anthropomorphic, no hands, anatomically correct snake: one long body, no legs, no limbs'),
    'elephant': ('C',
        'a young round grey elephant with big floppy ears standing knee-deep at a muddy waterhole, trunk raised and spraying a sparkling arc of water toward the viewer, playful eyes, a few birds on the bank, golden savanna background with acacia trees and a warm afternoon sky, natural animal anatomy, not anthropomorphic, no hands, anatomically correct elephant: four legs, one trunk, two big ears'),
    'fruit-bat': ('A',
        'a fluffy brown fruit bat with a fox-like face hanging upside down from a fig branch, wings wrapped around a half-eaten fig, a soft squashed fig dropping from its feet, big dark eyes, warm dim cave-mouth background with hanging roots, green leaves and a sliver of jungle light, natural animal anatomy, not anthropomorphic, no hands, anatomically correct bat: two legs, two wing arms with a thin wing membrane, no hands holding things'),
    'bumblebee-queen': ('B',
        'a big fuzzy bumblebee queen with black and golden-yellow bands and shimmering wings, determined bright eyes, perched on a large pollen ball on top of a clover flower, a tiny crown-shaped ring of petals on her head, a few small worker bees flying around her, spring meadow background with foxgloves, clover and a soft sunrise sky, natural animal anatomy, not anthropomorphic, no hands, anatomically correct bee: three body segments, six legs from the thorax, four wings'),
}

def cell(sheet, v):
    """Variant cell (A-D) cut from the 256 px sheet at a fixed quadrant (the gallery pads some sheets, so this is for the contact sheet only)."""
    x, y = {'A': (0, 0), 'B': (128, 0), 'C': (0, 128), 'D': (128, 128)}[v]
    return sheet.crop((x, y, x + 128, y + 128))


def contact(ids, src, out, per_row=2):
    """One sheet: each card is a row of its 4 variants labelled A-D, the picked one outlined and starred."""
    s, pad, lab = 128, 6, 14
    rows = (len(ids) + per_row - 1) // per_row
    cw = 4 * s + 5 * pad
    img = Image.new('RGB', (per_row * cw, rows * (s + lab + pad)), (24, 24, 30)); d = ImageDraw.Draw(img)
    for n, cid in enumerate(ids):
        sheet = Image.open(os.path.join(src, cid + '.sheet.png')).convert('RGB')
        ox = (n % per_row) * cw; oy = (n // per_row) * (s + lab + pad)
        d.text((ox + pad, oy + 1), cid, fill=(240, 220, 150))
        for i, v in enumerate('ABCD'):
            x = ox + pad + i * (s + pad); y = oy + lab
            img.paste(cell(sheet, v), (x, y))
            hit = PICKS[cid][0] == v
            d.text((x + 3, y + 2), v + (' *' if hit else ''), fill=(255, 255, 255))
            if hit: d.rectangle((x - 1, y - 1, x + s, y + s), outline=(250, 200, 60))
    img.save(out, optimize=True)


def main():
    ap = argparse.ArgumentParser(); ap.add_argument('--src', required=True)
    ap.add_argument('--sheets', help='directory for the contact sheets art12-variants-<n>.png')
    ap.add_argument('--per-sheet', type=int, default=8); ap.add_argument('--no-import', action='store_true')
    ap.add_argument('--force', action='store_true', help='replace art that is not rejected with a reason')
    ap.add_argument('ids', nargs='*', help='card ids (default: all in PICKS)')
    a = ap.parse_args(); ids = a.ids or list(PICKS)
    if not a.no_import:
        cards = os.path.join(ROOT, 'canonical', 'cards.json'); text = open(cards, encoding='utf-8').read()
        for cid in ids:
            if not a2.may_replace(text, cid, a.force): continue
            v, body = PICKS[cid]
            img = a7.finish(Image.open(os.path.join(a.src, cid + '.png')).convert('RGB'))
            path = os.path.join(ROOT, 'art', 'cards', cid + '.png'); img.save(path, optimize=True)
            open(os.path.join(ROOT, 'art', 'cards', cid + '.prompt.txt'), 'w').write(
                '# ART12 2026-11-12, PixelLab Create image (Pro, 128x128, 2x2), variant %s picked; description sent:\n%s%s%s\n' % (v, PREFIX, body, SUFFIX))
            uri = 'data:image/png;base64,' + base64.b64encode(open(path, 'rb').read()).decode('ascii')
            text = a2.set_art(text, cid, uri); print('art:', cid, img.size)
        open(cards, 'w', encoding='utf-8').write(text)
    if a.sheets:
        for n in range(0, len(ids), a.per_sheet):
            contact(ids[n:n + a.per_sheet], a.src, os.path.join(a.sheets, 'art12-variants-%d.png' % (n // a.per_sheet + 1)))
            print('sheet', n // a.per_sheet + 1)


if __name__ == '__main__':
    main()
