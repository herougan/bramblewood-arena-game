#!/usr/bin/env python3
"""THEME3 (2026-10-29): the owner's list notes applied to canonical/map-pools.json, then Claude's own cuts / adds by theme, and the review
data the owner asked for (10-29 00:13, Q14): canonical/map-review.json (chosen / cut / maybe per map list, one line of why each).

The owner's notes (docs/action-items.md):
  10-28 23:35  O7 / L1  "split T1-T2 and T3-T5 ... T1-2: Keep only Bee Knight, Earthworm, Pond Trout, Silver Minnow, Duckling, Cottontail,
                         Crossed-Eyes - the weakest."  T3-T5 "dont have to be thematic and can house any card": their list is left as it is.
               O9 / L2  "Map 0 ... can only carry cards from T1-T2." "Carry over Crossed-Eyes and Bee Knight and Cottontail"
               L3       "Map 0 - choose the remaining. I think there should be 2 bee and 2 ant cards inside ... cap 12"
               C2       Rafflesia: THEME3 places it.   L5 "make your own cuts/adds as well, as you wish."
  10-29 00:10  Q1-Q6    per-map removals ("at least"), Alley Cat to Lilypad Reach, Venomlord Serpent to Map 6, keep Pond Algae on Map 4;
               Q5       Fungal Colossus "needs retheme - and it's at least an uncommon" (rarity raised in cards.json; retheme noted, not done);
               Q7       "The Old Bramble: Needs advanced cards, as if it was Map 21."
  The owner's notes were written on the lists before APPLY1; a named card THEME2 had already taken off a list is recorded as an owner cut
  "already off since THEME2" and is never put back there.

Lists: the base is THEME2's proposal (docs/balance/theme2-proposal-2026-10-28.json `proposed`, which APPLY1 / LISTFIX1 wrote into the file;
checked equal), the tutorial's from the file. Each list = base - cuts + adds (or an explicit list for Map 0, the T-1 / T-2 list and The Old
Bramble). The tutorial's two lists sit under Bramblewood Outskirts' submaps: "mtut12" (T-1 / T-2, new) and "mtut" (T-3 to T-5, unchanged);
arena_app.js MP_EXTRA_LISTS shows mtut12 as its own section. SPECIAL only grows: a skirmish's first-clear card (SKIRMISH_FIRST_PACK_CARDS)
or a map's skirmish reward card taken off its map's lists goes to that map's SPECIAL, so it stays reachable.
Targeted rewrite of map-pools.json (only the list lines that change, the file's one-line-per-list style). Idempotent: a second run changes nothing.

Usage: python3 tools/theme3_2026_10_29.py [--dry]
  writes canonical/map-pools.json, canonical/map-review.json and docs/balance/theme3-2026-10-29.md (and .json, the per-list counts)."""
import json, os, re, sys, collections

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
BUILT = '2026-10-29'
POOLS = os.path.join(ROOT, 'canonical', 'map-pools.json')
REVIEW = os.path.join(ROOT, 'canonical', 'map-review.json')
PROP = os.path.join(ROOT, 'docs', 'balance', 'theme2-proposal-2026-10-28.json')
DOC = os.path.join(ROOT, 'docs', 'balance', 'theme3-2026-10-29.md')
DRY = '--dry' in sys.argv
STEPS = ['starter', 'common', 'uncommon', 'rare', 'veryrare', 'superrare', 'epic', 'heroic', 'unique', 'legendary', 'mythic', 'ancient', 'divine', 'void', 'daemonic']
TIER0 = {1: 0, 2: 7, 3: 14, 4: 21}   # a pack tier's first map (THEME2's first-obtainable limit)
SKIP = {'mm', 'muc', 'mlb'}          # the endless dungeons and the tower: their lists wait for the owner's dungeon plan (Q8)
T12 = 'mtut12'

# ---- the explicit lists ----
EXPLICIT = {
    # O7 / L1: the weakest seven, nothing else
    T12: ['bee-knight', 'earthworm', 'pond-trout', 'silver-minnow', 'duckling', 'cottontail', 'crossed-eyes'],
    # O9 / L2 / L3: 3 carried from T-1 / T-2, then 9 new (2 bee, 2 ant, the two skirmish rewards, the first-clear House Cat, the river's beaver, an owl)
    'm1': ['crossed-eyes', 'bee-knight', 'cottontail', 'chipmunk-skirmisher', 'terrier-pup', 'house-cat', 'bee-forager', 'bee-sentry',
           'ant-scout', 'ant-hill', 'beaver-lumberjack', 'owl-sentinel'],
    # Q7: its one unique card (the Ent) + 12 carried thorn, woodland and taiga cards of Map 13-20 strength
    'mo': ['ent', 'echidna-quillshot', 'dhole-matriarch', 'shimmerwing-stag', 'thorn-shrike', 'gatling-hog', 'quillguard', 'lucky-hopper',
           'sergeant-bramblefox', 'bramblewood-lynx', 'wolf-spider-mother', 'taiga-lynx', 'hedgehog-herbalist'],
}
# ---- the owner's cuts: on the list now (removed) or already off since THEME2 (recorded, never put back) ----
OWNER_CUT = {
    'mb': {'grey-seal-bull': 'Q1', 'fiddler-crab-swarm': 'Q1', 'tidepool-trapper-crab': 'Q1', 'oyster-bank': 'Q1'},
    'mc': {'fulmar-spitter': 'Q1', 'oyster-bank': 'Q1'},
    'm2': {'old-sturgeon': 'Q2 (for now)', 'signal-crayfish': 'Q2', 'stone-turtle-warden': 'Q2'},
    'mw': {'buzzed-chipmunk': 'Q3', 'alley-cat': 'Q3 (moved to Lilypad Reach)', 'sphagnum-vole': 'Q3', 'venomlord-serpent': 'Q3 (moved to Map 6)'},
    'm8': {'marsh-wisp': 'Q4', 'mire-witch-heron': 'Q4', 'peat-cutter-vole': 'Q4', 'lamprey': 'Q4', 'lotus-frog': 'Q4', 'cottonmouth-matriarch': 'Q4'},
    'mp': {'great-crested-grebe': 'Q4', 'shallows-fry': 'Q4'},
    'mg': {'sulfur-vent-crab': 'Q5', 'shallows-fry': 'Q5', 'beaver-builder': 'Q5', 'duckling': 'Q5'},
    'ms': {'echo-keeper': 'Q6 (Map 13; it was on The Sunken Grove)', 'swamp-rabbit': 'Q6 (Map 13; it was on The Sunken Grove)'},
    'm5': {'hoopoe-herald': 'Q6'},
    'ml': {'garden-tiger-moth': 'Q6', 'moonshell-snail': 'Q6', 'anvil-thrush': 'Q6', 'courier-pigeon': 'Q6'},
    'mt': {'trickster-fox': 'Q6: "not snow themed enough"'},
    'md': {'static-fennec': 'Q6'},
    'mpd': {'armadillo-guard': 'Q6', 'meerkat-sentry': 'Q6', 'dune-jackal-scout': 'Q6'},
    'm11': {'woodland-brawler': 'Q6', 'bear-cub': 'Q6'},
    'm1': {'duck-paddler': 'O9: Map 0 carries only T-1 / T-2 cards; a Base card THEME2 carried', 'chipmunk-forager': 'O9: Map 0 carries only T-1 / T-2 cards; a Base card THEME2 carried'},
}
# ---- the owner's adds / placements ----
OWNER_IN = {
    T12: {i: 'L1: one of the seven weakest, kept for T-1 / T-2' for i in EXPLICIT[T12]},
    'm1': {'crossed-eyes': 'L2: carried from T-1 / T-2', 'bee-knight': 'L2: carried from T-1 / T-2 (Flying)', 'cottontail': 'L2: carried from T-1 / T-2',
           'bee-forager': 'L3: one of Map 0\'s two bee cards', 'bee-sentry': 'L3: one of Map 0\'s two bee cards',
           'ant-scout': 'L3: one of Map 0\'s two ant cards', 'ant-hill': 'L3: one of Map 0\'s two ant cards (and its high-cost card)'},
    'm2': {'pond-algae': 'Q2: keep Pond Algae on the freshwater lake'},
    'mp': {'alley-cat': 'Q3: moved here from Gatorback Swamp'},
    'm8': {'venomlord-serpent': 'Q3: its home is Map 6 now (Map 5\'s first clear still pays it: Map 5 SPECIAL)'},
    'my': {'rafflesia': 'C2: placed by THEME3; a rainforest corpse flower (a 4th unique card here: owner call)'},
}
# ---- Claude's cuts and adds (L5), on theme: art, name, biome ----
CLAUDE_CUT = {
    'm1': {'feral-tomcat': 'House Cat already brings the cat; Map 0 capped at 12', 'chipmunk-cavalry': 'Chipmunk Skirmisher keeps the chipmunks; it moves on to Thistlewood',
           'cypress-root-lurker': 'a swamp cypress root; Gatorback Swamp is its home', 'marsh-mallow-hare': 'a marsh hare; the swamp maps carry it'},
    'mf': {'cypress-root-lurker': 'a swamp cypress root, not a thistle wood; moved to Gatorback Swamp', 'fire-ant-raft': 'an ant raft for floodwater; the river and swamp lists keep it'},
    'mc': {'fiddler-crab-swarm': 'the owner took it off the beach; a crab swarm fits sea cliffs no better', 'dormouse': 'a hedgerow dormouse on seabird cliffs'},
    'm2': {'cypress-root-lurker': 'a swamp cypress root; Gatorback Swamp is its home', 'marsh-mallow-hare': 'a marsh hare; Gatorback Swamp carries it'},
    'mw': {'stone-turtle-warden': 'the owner took it off Map 4; a river warden, not a swamp card',
           'marsh-mallow-hare': 'a soft meadow-edge hare; Gatorback has 11 swamp cards of its own'},
    'mp': {'fiddler-crab-swarm': 'a beach crab in a lily pond; it goes to the Kelp Mangroves'},
    'mu': {'peat-cutter-vole': 'the owner took it off the swamp; nothing ties it to mushrooms'},
    'mg': {'fiddler-crab-swarm': 'the owner took it off Pebble Beach; it goes to the Kelp Mangroves'},
    'mk': {'lodge-engineer': 'a river lodge builder; mangroves have no lodges'},
    'm7': {'gull-thief': 'a shore gull in a coral current'},
    'mh': {'mountain-hare': 'an alpine hare in a hedge maze'},
    'mq': {'house-cat': 'a farm cat; the meadow promises rabbits, bees and mice'},
    'md': {'border-collie': 'a sheepdog has no work in the glass dunes'},
    'my': {'hoopoe-herald': 'the owner took it off the savanna; not a canopy bird', 'grave-grin-hyena': 'a plains scavenger, not a tree-dweller',
           'dust-hyena': 'a plains scavenger, not a tree-dweller', 'meerkat-burrower': 'a ground burrower under a rainforest roof',
           'springbok-pronker': 'a plains antelope, not a canopy animal', 'savanna-cheetah': 'a plains sprinter, not a canopy hunter',
           'marula-elephant': 'too big and too grounded for the canopy'},
    'mn': {'cave-bat-swarm': 'a plain cave bat; the Glimmer Spider takes its slot for the crystal theme'},
    'me': {'bear-cub': 'the owner took it off Map 20; the same call inside its crater'},
    'mx': {'woodland-brawler': 'the owner took it off Map 20; a woodland brawler in a dragon\'s lair', 'bear-cub': 'the owner took it off Map 20; the same call for its lair'},
    'mo': {'owl-sentinel': 'Q7: a Map 0 common; the Old Bramble plays as Map 21 now', 'terrier-pup': 'Q7: a Map 0 reward; too weak for Map 21',
           'chipmunk-cavalry': 'Q7: a Map 0 common; too weak for Map 21', 'chipmunk-skirmisher': 'Q7: a Map 0 reward; too weak for Map 21',
           'feral-tomcat': 'Q7: a Map 0 common; too weak for Map 21', 'cypress-root-lurker': 'Q7: a Map 0 common; too weak for Map 21',
           'house-cat': 'Q7: a Map 0 common; too weak for Map 21', 'marsh-mallow-hare': 'Q7: a Map 0 common; too weak for Map 21',
           'glacier-wolf-pack': 'a tundra wolf pack in an old thorn wood', 'dune-packrat': 'a desert packrat in an old thorn wood'},
}
CLAUDE_IN = {
    'm1': {'beaver-lumberjack': 'the Outskirts\' river beaver, Map 0\'s Lumber maker', 'owl-sentinel': 'an owl for the misty tree-line'},
    'mf': {'owl-sentinel': 'carried from Map 0: a woodland owl', 'bee-forager': 'carried from Map 0: bees in the thistles'},
    'mb': {'driftwood-crab': 'a beach crab that turns driftwood into Lumber', 'oystercatcher': 'a shorebird of the pebble beach'},
    'mc': {'gull-thief': 'carried from Map 2: a gull on the seabird cliffs'},
    'm2': {'duckling': 'carried from T-1 / T-2: ducks on the hollow\'s water', 'pond-trout': 'carried from T-1 / T-2: a trout in the hollow\'s river'},
    'mw': {'cypress-root-lurker': 'a cypress root: Gatorback\'s own trees', 'snapstick-turtle': 'carried from Map 4: a snapping turtle in the swamp'},
    'm8': {'marsh-harrier': 'a marsh harrier over the dark swamp'},
    'mp': {'duckling': 'carried from T-1 / T-2: the pond\'s "very territorial ducks"', 'pond-algae': 'carried from Map 4: lily-pond algae'},
    'mu': {'garden-snail': 'a Base snail among the mushrooms'},
    'mk': {'fiddler-crab-swarm': 'fiddler crabs live in mangrove mud; carried from Map 2'},
    'm7': {'open-ocean-hermit-crab': 'carried from Map 2: an ocean crab, not a shore gull'},
    'mh': {'hedgerow-shrew': 'carried from Map 1: a hedgerow shrew in the hedge maze'},
    'mq': {'bee-forager': 'carried from Map 0: the meadow\'s bees', 'cottontail': 'carried from T-1 / T-2: the meadow\'s rabbits'},
    'm5': {'plains-zebra': 'a plains zebra for the savanna (was on no list)'},
    'mt': {'pinecone-sapper': 'pinecones for the Pinewood Taiga'},
    'mn': {'glimmer-spider': 'the Glimmer Depths\' own spider (the crystal theme)'},
    'md': {'spitting-cobra': 'carried from Map 14: a cobra of the dry country'},
    'my': {'leafcutter-gardener': 'carried from Map 7: jungle leafcutter ants', 'vampire-bat': 'carried from Map 8: bats of the forest roof',
           'redwood-woodpecker': 'carried from Map 13: a tree-trunk woodpecker', 'lyrebird-mimic': 'carried from Map 12: a forest mimic bird',
           'apollo-butterfly': 'carried from Map 11: a butterfly for the flowering roof', 'poison-dart-croaker': 'carried from Map 6: dart frogs are rainforest frogs',
           'camouflage-frog': 'carried from Map 6: a tree frog hiding in the leaves'},
    'm11': {'gorge-wyrm': 'a wyrm of the peak\'s gorges', 'fumarole-ibex': 'an ibex on the fuming mountain slopes'},
    'mx': {'phoenix-fledgling': 'carried from Map 19: a fire bird for the dragon\'s lair', 'magma-wraith': 'carried from Map 20: the lair\'s molten dead'},
    'mo': {'echidna-quillshot': 'Q7: a quilled woodland Very Rare from Map 19', 'dhole-matriarch': 'Q7: a forest pack leader, Very Rare (Map 16)',
           'shimmerwing-stag': 'Q7: the redwood\'s great stag, Very Rare (Map 13)', 'thorn-shrike': 'Q7: a thorn-impaling shrike, Rare (Map 12)',
           'gatling-hog': 'Q7: a quill-firing hog of the briars, Rare (Map 12)', 'quillguard': 'Q7: a thorn warden, Rare (Map 12)',
           'lucky-hopper': 'Q7: a meadow Rare (Map 12)', 'sergeant-bramblefox': 'Q7: a bramble fox officer, Rare (Map 13)',
           'bramblewood-lynx': 'Q7: the bramble wood\'s own lynx, Rare', 'wolf-spider-mother': 'Q7: a woodland-floor Rare (Map 7)',
           'taiga-lynx': 'Q7: a taiga Rare, the Old Bramble\'s other biome (Map 16)', 'hedgehog-herbalist': 'Q7: a hedge Rare (Map 13)'},
}
CHOSEN_NOTE = {   # extra notes on a chosen entry
    ('mu', 'fungal-colossus'): 'Q5: needs a retheme (art and name: its type is Mushroom but its animal is "bear"); rarity raised Common -> Uncommon',
    ('mo', 'ent'): 'The Old Bramble\'s one unique card',
}
MAYBE_HAND = {   # hand picks first; the scorer fills the rest
    T12: [('honey-bee', 'a starter bee, as weak as the seven'), ('river-carp', 'a starter river fish'), ('garden-snail', 'a starter snail with Armor 1: a skill to lock'),
          ('otter-kit', 'a starter otter'), ('guppy', 'a starter fish')],
    'm1': [('honey-bee', 'a third bee card'), ('forager-ant', 'a third ant card (Base)'), ('soldier-ant', 'a third ant card'), ('worker-ant', 'an ant from T-3 to T-5'),
           ('feral-tomcat', 'a second cat, cut for the cap'), ('chipmunk-cavalry', 'a chipmunk, cut for the cap')],
    'mo': [('thornwood-palisade', 'a Pack 4 thorn wall (now only on T-3 to T-5): a 2nd unique card'), ('elder-willow', 'a Pack 4 woodland tree: a 2nd unique card'),
           ('heartwood-treant', 'a Rare tree beside the Ent'), ('strangler-vine', 'a thorny vine Rare on no list'), ('corpse-flower-beetle', 'a woodland Rare on no list')],
    'my': [('toucan-courier', 'a toucan (now only on T-3 to T-5)'), ('howler-monkey', 'a canopy monkey (Pack 3)'), ('strangler-vine', 'a rainforest vine'),
           ('glasswing-butterfly', 'a rainforest butterfly (Pack 3)'), ('poison-dart-frog', 'a dart frog on no list')],
    'mu': [('puffball-bombardier', 'a puffball fungus'), ('fungus-gnat-cloud', 'fungus gnats'), ('corpse-flower-beetle', 'a rot beetle')],
    'mp': [('lotus-frog', 'a lotus frog for the lily ponds'), ('dam-keeper-beaver', 'the Reach\'s beaver dams'),
           ('beaver-builder', 'the Reach\'s beaver dams'), ('elder-tortoise', 'a pond tortoise')],
}

GEN_LUMBER = {'onReadyGold', 'onSpawnGold', 'bounty', 'midas', 'swipe', 'stockpile', 'milling', 'felling', 'salvage', 'scavenge', 'coppice', 'driftwood', 'pearlBed', 'lumberjack'}
GEN_OTHER = {'quarry', 'stonecutter', 'prospector', 'smelter'}


def L(*p):
    with open(os.path.join(ROOT, *p), encoding='utf-8') as f:
        return json.load(f)


def line_list(ids):
    return '[' + ', '.join(json.dumps(x) for x in ids) + ']'


def first_clear_table():
    src = open(os.path.join(ROOT, 'arena_app.js'), encoding='utf-8').read()
    a = src.index('const SKIRMISH_FIRST_PACK_CARDS = {')
    b = src.index('};', a)
    return dict(re.findall(r"'([\w-]+:[\w-]+)':\s*'([\w-]+)'", src[a:b]))


def main():
    canon = L('canonical', 'cards.json')
    by = {c['id']: c for c in canon}
    text = open(POOLS, encoding='utf-8').read()
    file_maps = json.loads(text)['maps']
    prop = L('docs', 'balance', 'theme2-proposal-2026-10-28.json')
    om = L('canonical', 'card-obtain-maps.json').get('maps', {})
    ut = L('canonical', 'unit-themes.json')
    units = {u['id']: u for u in ut['units']}
    blab = {b['id']: b['label'] for b in ut['vocab']['biomes']}
    bkin = {b['id']: set(b.get('kin') or []) for b in ut['vocab']['biomes']}
    more = ut['vocab'].get('mapBiomesMore', {})
    umap = {m['id']: m for m in ut['maps']}
    fc = first_clear_table()

    # ---- the lists in road order (THEME2's order; the T-1 / T-2 list first) ----
    P = collections.OrderedDict()
    P[T12] = {'key': T12, 'no': 0, 'name': 'Tutorial T-1 / T-2', 'sub': True, 'parent': 'm1', 'cap': {'reveal': 'common', 'boss': 'common'}, 'base': None}
    for m in prop['maps']:
        if m['key'] in SKIP:
            continue
        e = dict(m)
        if m['key'] == 'mtut':
            e['name'] = 'Tutorial T-3 to T-5'
            e['base'] = list(file_maps['m1']['submaps']['mtut'])
        else:
            e['base'] = list(m['proposed'])
        P[m['key']] = e
    top_of = {k: (m['parent'] if m.get('sub') else k) for k, m in P.items()}
    cur = {k: (file_maps[top_of[k]]['submaps'].get(k, []) if P[k].get('sub') else file_maps[k]['cards']) for k in P}
    for k, m in P.items():   # the file holds THEME2's lists (APPLY1 / LISTFIX1) or THEME3's own result (a re-run)
        if m['base'] is not None and k not in EXPLICIT:
            assert cur[k] in (m['base'],) or k in ('mtut',) or set(cur[k]) >= set(m['base']) - set(OWNER_CUT.get(k, {})) - set(CLAUDE_CUT.get(k, {})), ('the file is neither THEME2 nor THEME3', k)

    # ---- the new lists ----
    new = {}
    for k, m in P.items():
        if k in EXPLICIT:
            new[k] = list(EXPLICIT[k])
            continue
        cuts = set(OWNER_CUT.get(k, {})) | set(CLAUDE_CUT.get(k, {}))
        ids = [x for x in m['base'] if x not in cuts]
        for x in list(OWNER_IN.get(k, {})) + list(CLAUDE_IN.get(k, {})):
            if x not in ids:
                ids.append(x)
        new[k] = ids
    for k, ids in new.items():
        miss = [x for x in ids if x not in by]
        assert not miss, (k, miss)
        assert len(ids) == len(set(ids)), k
        bad = [x for x in OWNER_CUT.get(k, {}) if x in ids and x not in OWNER_IN.get(k, {})]
        assert not bad, ('owner cut back on the list', k, bad)
        for x in CLAUDE_CUT.get(k, {}):
            assert x in (P[k]['base'] or []), ('claude cut not on the base list', k, x)

    # ---- facts per card ----
    def src(i):
        return by[i].get('source') or {}

    def first(i):
        s, o = src(i), om.get(i) or 0
        if s.get('kind') == 'pack' and s.get('tier') in TIER0:
            o = max(o, TIER0[s['tier']])
        return o

    def step(r):
        return STEPS.index(r) if r in STEPS else None

    def reach(k):
        cp = P[k]['cap']
        return max(step(cp['reveal']) or 0, step(cp['boss']) or 0)

    def map_bi(k):
        mk = 'mtut' if k == T12 else k
        prim = {umap.get(mk, {}).get('biome')} - {None}
        oth = set(more.get(mk, []))
        kin = set()
        for b in prim | oth:
            kin |= bkin.get(b, set())
            kin |= {x for x, v in bkin.items() if b in v}
        return prim, oth, kin - prim - oth

    def fit(i, k):
        cb = set((units.get(i) or {}).get('biomes') or [])
        prim, oth, kin = map_bi(k)
        if cb & prim:
            return 4, blab.get(sorted(cb & prim)[0])
        if cb & oth:
            return 3, blab.get(sorted(cb & oth)[0])
        if cb & kin:
            return 1, blab.get(sorted(cb & kin)[0])
        return (0 if not cb else -3), ', '.join(blab.get(b, b) for b in sorted(cb)) or 'no biome tag'

    def gen(i):
        e = by[i].get('effects') or {}
        return bool((GEN_LUMBER | GEN_OTHER) & set(e)) or any(isinstance(t, dict) and t.get('do') == 'gain' and t.get('resource') in ('lumber', 'stone', 'metal') for t in e.get('triggers') or [])

    def high(i):
        c = by[i]
        return (c.get('cost') or 0) >= 2 or (c.get('stoneCost') or 0) > 0 or (c.get('metalCost') or 0) > 0

    def live(c):
        return not (c.get('test') or c.get('token') or c.get('hidden') or c.get('easterEgg') or c.get('cardType') in ('spell', 'equipment') or c.get('spell') or c.get('equip')
                    or (c.get('source') or {}).get('kind') == 'easteregg')

    rev_fc = collections.defaultdict(list)
    for key, i in fc.items():
        rev_fc[i].append(key)

    def roles(i, k):
        out = []
        s = src(i)
        if s.get('kind') == 'map' and s.get('node') and s.get('id') == k:
            out.append('skirmish reward of %s' % s['node'])
        for key in rev_fc.get(i, []):
            if key.split(':')[0] == k:
                out.append('first-clear card of %s' % key.split(':')[1])
        return out

    # ---- carried or unique: the first list (road order, SPECIAL counts) that holds the card ----
    order = list(P)
    no_of = {k: P[k]['no'] for k in P}

    def first_list_before(i, k):
        """the earliest list before list k (by map number; a main map before its submaps at the same number) holding card i, or None"""
        rk = lambda j: -1 if j == T12 else (1 if P[j].get('sub') else 0)   # T-1 / T-2 comes before Map 0
        kk = (no_of[k], rk(k), order.index(k))
        best = None
        for j in order:
            if j == k or j == 'mtut':   # T-3 to T-5 is a teaching list (gates on Maps 1/8/18): never a source of carried cards
                continue
            jj = (no_of[j], rk(j), order.index(j))
            if jj >= kk:
                continue
            if i in new[j] or (not P[j].get('sub') and i in new_special.get(j, [])):
                if best is None or jj < best[0]:
                    best = (jj, j)
        return best[1] if best else None

    # ---- SPECIAL: first-clear cards and skirmish rewards stay reachable ----
    new_special = {t: list(e.get('special', [])) for t, e in file_maps.items()}
    special_added = collections.defaultdict(list)

    need = []
    for key, i in fc.items():
        need.append((key.split(':')[0], i, 'first-clear card of ' + key.split(':')[1]))
    for c in canon:
        s = c.get('source') or {}
        if s.get('kind') == 'map' and live(c):
            need.append((s.get('id'), c['id'], 'skirmish reward of %s' % s.get('node', '?')))
    for lid, i, why in need:
        if lid not in new or lid in ('mtut', T12):
            continue
        top = top_of[lid]
        if i in new[lid]:
            continue
        removed = i in (P[lid]['base'] or [])   # THEME3 took it off this list
        if i in new_special[top]:
            if removed:
                special_added[top].append((i, lid, why))
            continue
        new_special[top].append(i)
        special_added[top].append((i, lid, why))

    # ---- write map-pools.json (targeted) ----
    out, top, in_subs, n_changed, seen_sub = [], None, False, 0, set()
    lines = text.split('\n')
    for ln in lines:
        mtop = re.match(r'^  "([^"]+)": \{$', ln)
        if mtop:
            top, in_subs = mtop.group(1), False
        elif re.match(r'^   "submaps": \{', ln):
            in_subs = not ln.rstrip().endswith('{},') and not ln.rstrip().endswith('{}')
        elif in_subs and re.match(r'^   \},?$', ln):
            in_subs = False
        mc = re.match(r'^(   "cards": )(\[.*\])(,?)$', ln)
        ms = re.match(r'^(    "([^"]+)": )(\[.*\])(,?)$', ln) if in_subs else None
        msp = re.match(r'^(   "special": )(\[.*\])(,?)$', ln)
        nl = ln
        if mc and top in new and not P[top].get('sub'):
            nl = mc.group(1) + line_list(new[top]) + mc.group(3)
        elif ms and ms.group(2) in new:
            seen_sub.add(ms.group(2))
            nl = ms.group(1) + line_list(new[ms.group(2)]) + ms.group(4)
            if ms.group(2) == 'mtut' and T12 not in json.loads(text)['maps']['m1']['submaps']:   # the T-1 / T-2 list goes in just before T-3 to T-5
                out.append('    "%s": %s,' % (T12, line_list(new[T12])))
                n_changed += 1
                seen_sub.add(T12)
        elif msp and top in new_special and new_special[top] != file_maps[top].get('special', []):
            nl = msp.group(1) + line_list(new_special[top]) + msp.group(3)
        if nl != ln:
            n_changed += 1
        out.append(nl)
    new_text = '\n'.join(out)
    got = json.loads(new_text)['maps']
    for k, ids in new.items():
        t = top_of[k]
        have = got[t]['submaps'][k] if P[k].get('sub') else got[t]['cards']
        assert have == ids, ('rewrite', k)
    for t in got:
        assert got[t]['special'] == new_special[t], ('special', t)
        for s in file_maps[t]['submaps']:
            if s not in new:
                assert got[t]['submaps'][s] == file_maps[t]['submaps'][s], s
    assert set(got) == set(file_maps)

    # ---- per-list facts, checks and the review ----
    review = {'_about': ('THEME3 (2026-10-29): per map list, the cards chosen (the list now in canonical/map-pools.json; for a submap its own SUBMAP list; '
                         'mtut12 = the Tutorial\'s T-1 / T-2 list, mtut = T-3 to T-5), the cards cut in THEME3 (by the owner\'s notes of 10-28 23:35 and '
                         '10-29 00:10, or by Claude on theme; an owner cut "already off since THEME2" was off the list before THEME3) and the maybes: '
                         'cards from anywhere that would fit but were not chosen, best first. by: owner | claude | kept (on the list before THEME3). '
                         'Not here: the endless dungeons and the tower (mm, muc, mlb), whose lists wait for the dungeon plan (Q8). '
                         'Built by tools/theme3_2026_10_29.py; read by the in-game Map cards gallery (REVIEW1).'),
              'built': BUILT, 'maps': {}}
    rows = []
    names = {k: P[k]['name'] for k in P}
    nm = lambda i: by[i].get('name', i)
    problems = []
    for k, m in P.items():
        ids, base = new[k], (m['base'] if m['base'] is not None else [])
        uniq, carr = [], []
        for i in ids:
            (carr if first_list_before(i, k) else uniq).append(i)
        chosen = []
        for i in ids:
            if i in OWNER_IN.get(k, {}):
                why, who = 'Owner ' + OWNER_IN[k][i], 'owner'
            elif i in CLAUDE_IN.get(k, {}):
                why, who = CLAUDE_IN[k][i][0].upper() + CLAUDE_IN[k][i][1:], 'claude'
            elif i in base:
                f, lab = fit(i, k)
                parts = []
                fl = first_list_before(i, k)
                if fl:
                    parts.append('carried from %s (Map %d)' % (names[fl], no_of[fl]))
                if k == 'mtut':
                    parts.append('a T-3 to T-5 teaching card (owner O7: any card)')
                elif f >= 3:
                    parts.append('%s card' % lab)
                elif f == 1:
                    parts.append('kin biome (%s)' % lab)
                else:
                    parts.append('biome %s; kept for the mix' % lab)
                parts += roles(i, k)
                if f < 3 and k != 'mtut':
                    if gen(i):
                        parts.append('the list\'s resource maker')
                    elif high(i):
                        parts.append('a high-cost card')
                why, who = '; '.join(parts), 'kept'
                why = why[0].upper() + why[1:]
            else:
                raise SystemExit('no reason for %s on %s' % (i, k))
            note = CHOSEN_NOTE.get((k, i))
            if note:
                why += '. ' + note
            chosen.append({'id': i, 'why': why, 'by': who})
        cut = []
        for i in base:
            if i in ids:
                continue
            if i in OWNER_CUT.get(k, {}):
                cut.append({'id': i, 'why': 'Owner ' + OWNER_CUT[k][i], 'by': 'owner'})
            elif i in CLAUDE_CUT.get(k, {}):
                w = CLAUDE_CUT[k][i]
                cut.append({'id': i, 'why': w[0].upper() + w[1:], 'by': 'claude'})
            elif k in EXPLICIT:
                cut.append({'id': i, 'why': 'Not one of the owner\'s picks for this list', 'by': 'owner'})
            else:
                raise SystemExit('cut without a reason: %s %s' % (k, i))
        for i, why in OWNER_CUT.get(k, {}).items():   # owner cuts already off since THEME2
            if i not in base and i not in ids:
                cut.append({'id': i, 'why': 'Owner %s (already off since THEME2)' % why, 'by': 'owner'})
        for c in cut:   # where a cut card stays reachable
            sp = [x for x in special_added.get(top_of[k], []) if x[0] == c['id'] and x[1] == k]
            if sp:
                c['why'] += '; kept on SPECIAL as the ' + sp[0][2]
        # maybes
        blocked = set(ids) | set(OWNER_CUT.get(k, {})) | {c['id'] for c in cut}
        maybe = []
        for i, why in MAYBE_HAND.get(k, []):
            if i in by and i not in blocked and why:
                maybe.append({'id': i, 'why': why[0].upper() + why[1:]})
        if k != 'mtut':
            cand = []
            nlists = collections.Counter()
            for kk in new:
                for i in new[kk]:
                    nlists[i] += 1
            for c in canon:
                i = c['id']
                if i in blocked or not live(c) or any(x['id'] == i for x in maybe):
                    continue
                if (c.get('rarity') in ('starter',) or (c.get('source') or {}).get('kind') == 'base') and m['no'] > 5:
                    continue
                f, lab = fit(i, k)
                if f < 1:
                    continue
                st = step(c.get('rarity'))
                if st is not None and st > reach(k):
                    continue
                if first(i) > m['no']:
                    continue
                cand.append((-f, 1 if nlists[i] else 0, -(st or 0), c.get('name', i), i, lab, nlists[i]))
            cand.sort()
            for f, onl, _, _, i, lab, n in cand:
                if len(maybe) >= 6:
                    break
                if -f < 3 and len(maybe) >= 3:
                    break
                maybe.append({'id': i, 'why': '%s%s card%s' % ('kin biome: ' if -f < 3 else '', lab, ', on no list now' if not n else ', on %d other list%s' % (n, '' if n == 1 else 's'))})
        if len(maybe) < 3 and k == 'mtut':
            for i, why in [('honey-bee', 'a starter bee: teaches Flying beside the Bee Knight'), ('garden-snail', 'a starter snail: teaches Armor'),
                           ('forager-ant', 'a Base ant: teaches a Swarm')]:
                if i not in blocked:
                    maybe.append({'id': i, 'why': why[0].upper() + why[1:]})
        maybe = maybe[:8]
        if len(maybe) < 3:
            problems.append('%s: only %d maybes' % (k, len(maybe)))
        review['maps'][k] = {'chosen': chosen, 'cut': cut, 'maybe': maybe}
        # checks: first-obtainable and rarity for every added card
        for i in ids:
            if i in base or k in (T12, 'mtut'):
                continue
            if first(i) > m['no']:
                problems.append('%s: %s first obtainable at Map %d' % (k, i, first(i)))
            st = step(by[i].get('rarity'))
            if st is not None and st > reach(k):
                problems.append('%s: %s above the map\'s rarity reach' % (k, i))
        rows.append({'map': k, 'name': m['name'], 'no': m['no'], 'sub': bool(m.get('sub')), 'parent': m.get('parent'), 'before': len(base) if m['base'] is not None else 0,
                     'after': len(ids), 'unique': len(uniq), 'carried': len(carr), 'uniqueIds': uniq,
                     'in': [x for x in ids if x not in base], 'out': [x for x in base if x not in ids],
                     'specialAdded': [x[0] for x in special_added.get(k, [])] if not m.get('sub') else [],
                     'high': sum(1 for x in ids if high(x)), 'gen': sum(1 for x in ids if gen(x))})

    # ---- sizes (owner 10-28 22:47; THEME2 classes): report, never block ----
    sizes = {}
    for r in rows:
        k = r['map']
        if k in (T12, 'mtut'):
            continue
        cls = (P[k].get('sideClass') or {}) if isinstance(P[k].get('sideClass'), dict) else {}
        if not r['sub']:
            lo, hi = (12, 16) if k != 'm1' else (10, 12)
        elif k == 'mx':
            lo, hi = 15, 15
        else:
            lo, hi = 11, 14
        if not (lo <= r['after'] <= hi):
            sizes[k] = '%d (want %d-%d)' % (r['after'], lo, hi)
    for p in problems:
        print('CHECK', p)
    print('lists rewritten: %d; lines changed: %d; SPECIAL added: %s' % (len(new), n_changed, json.dumps({t: [x[0] for x in v] for t, v in special_added.items()})))
    print('sizes outside the rule:', sizes or 'none')
    for r in rows:
        print('  %-6s %-28s %2d -> %2d  unique %2d carried %2d  in %s  out %s' % (r['map'], r['name'][:28], r['before'], r['after'], r['unique'], r['carried'],
                                                                               ','.join(r['in']) or '-', ','.join(r['out']) or '-'))
    if problems:
        sys.exit('THEME3: checks failed')
    if DRY:
        print('--dry: nothing written')
        return
    open(POOLS, 'w', encoding='utf-8').write(new_text)
    with open(REVIEW, 'w', encoding='utf-8') as f:
        json.dump(review, f, indent=1, ensure_ascii=False)
        f.write('\n')
    with open(DOC.replace('.md', '.json'), 'w', encoding='utf-8') as f:
        json.dump({'built': BUILT, 'lists': rows, 'specialAdded': {t: [{'id': x[0], 'list': x[1], 'why': x[2]} for x in v] for t, v in special_added.items()},
                   'sizesOutsideRule': sizes}, f, indent=1, ensure_ascii=False)
        f.write('\n')
    write_doc(rows, special_added, sizes, review, by)
    print('wrote canonical/map-pools.json, canonical/map-review.json, docs/balance/theme3-2026-10-29.md / .json')


def write_doc(rows, special_added, sizes, review, by):
    nm = lambda i: by[i].get('name', i)
    a = ['# THEME3: the owner\'s list notes applied, then Claude\'s own cuts and adds (2026-10-29)', '',
         'Steps 1-2 of the owner\'s balancing plan, round 2. Inputs: the owner\'s notes of 10-28 23:35 (O7, O9, C2, L1-L5) and 10-29 00:10 (Q1-Q7) in '
         '`docs/action-items.md`. Tool: `python3 tools/theme3_2026_10_29.py` (writes `canonical/map-pools.json`, `canonical/map-review.json`, this file and '
         '`theme3-2026-10-29.json`). The review data (chosen / cut / maybe, one line of why each) is `canonical/map-review.json`, shown by the in-game Map cards gallery.', '',
         '## What changed in the rules', '',
         '- **Tutorial split (O7):** the Tutorial keeps two lists under Bramblewood Outskirts: `mtut12` (T-1 / T-2: the seven weakest, L1) and `mtut` '
         '(T-3 to T-5, unchanged: "any card for teaching"). `arena_app.js` `MP_EXTRA_LISTS` (a list that is not a map) shows `mtut12` as its own section '
         'in the Map cards overlay and editor; no fight draws on it.',
         '- **Map 0 (O9, L2, L3):** carries only Crossed-Eyes, Bee Knight and Cottontail from T-1 / T-2; 9 new cards (2 bee, 2 ant), 12 in all (the cap).',
         '- **Fungal Colossus (Q5):** Common -> Uncommon in `canonical/cards.json`. Its retheme (name / art; its animal is "bear") is not done: noted on its Map 7 entry.',
         '- **SPECIAL keeps first-clear cards reachable:** a first-clear card or skirmish reward taken off its map\'s lists went to that map\'s SPECIAL: ' +
         ('; '.join('%s: %s' % (t, ', '.join('%s (%s)' % (nm(x[0]), x[2]) for x in v)) for t, v in special_added.items()) or 'none') + '.',
         '- Sizes outside the owner\'s rule (main 12-16, Map 0 up to 12, submaps 11-14, Volcano Lair 15): ' +
         (', '.join('%s %s' % (k, v) for k, v in sizes.items()) or 'none') + '.', '',
         '## Per list', '', '| List | Map | Before | After | Unique | Carried | In | Out |', '|---|---|---|---|---|---|---|---|']
    for r in rows:
        a.append('| %s%s (%s) | %d | %s | %d | %d | %d | %s | %s |' % ('↳ ' if r['sub'] else '', r['name'], r['map'], r['no'], r['before'] if r['before'] else 'new',
                                                                 r['after'], r['unique'], r['carried'], ', '.join(nm(x) for x in r['in']) or '-',
                                                                 ', '.join(nm(x) for x in r['out']) or '-'))
    a += ['', '## Who cut what', '']
    for k, e in review['maps'].items():
        if not e['cut']:
            continue
        a.append('- **%s**: ' % k + '; '.join('%s (%s: %s)' % (nm(c['id']), c['by'], c['why']) for c in e['cut']))
    a += ['', '## For the owner', '',
          '- The Canopy now has 4 unique cards (Rafflesia beside its three skirmish rewards; a delve has 3): keep Rafflesia here, or say which card to drop.',
          '- Cards the owner cut that are first-clear cards or skirmish rewards stay on their map\'s SPECIAL list (above), so they still drop; to take one fully off '
          'a map, its reward needs re-assigning (a later package).',
          '- Bee Knight\'s Swarm in T-1 / T-2 (L2 "all should be locked in T1/T2 except flying"): see the THEME3 report; not applied here.', '']
    open(DOC, 'w', encoding='utf-8').write('\n'.join(a))


if __name__ == '__main__':
    main()
