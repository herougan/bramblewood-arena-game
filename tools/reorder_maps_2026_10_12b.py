#!/usr/bin/env python3
# One-off (2026-10-12, 16:23, the user's map list): new road order 0-20, Clovermead / Lilypad Reach / Basalt Foundry fused in
# as side maps of Thistlewood / Pebble Beach / Ashen Spurn, the Ashen Peak renamed Ashen Spurn, the Caldera Heart renamed
# Volcano Lair, and five new side maps (Outskirts, Gatorback Swamp, Caves & Alcoves, Eyrie Heights, Wolfsbane Tundra).
import re, json, random
ORDER = ['m1','mf','mb','mc','m2','mw','m8','mu','m4','mk','m7','m10','mh','mr','m5','ml','mt','m6','md','m3','m11']
FUSE = {'mq': ('mf', 'f-1', 'Clover meadows'), 'mp': ('mb', 'b-1', 'The lily ponds'), 'm9': ('m3', '3-1', 'The foundry gate')}
p = 'arena_app.js'; s = open(p).read()
i = s.find('const CONQUEST_MAPS = ['); j = s.find('\n];', i)
head_end = s.find('\n', i) + 1
body = s[head_end:j]
starts = [m.start() for m in re.finditer(r'(?m)^  \{\s*id:\s*"', body)]
def lead(k):
    a = starts[k]
    while True:
        prev = body.rfind('\n', 0, a - 1)
        line = body[prev+1:a-1] if prev >= 0 else body[:a-1]
        if line.strip().startswith('//') or line.strip() == '':
            if prev < 0: return 0
            if k > 0 and prev + 1 <= starts[k-1]: return a
            a = prev + 1
        else: return a
cuts = [lead(k) for k in range(len(starts))]
pre = body[:cuts[0]]
ents = [body[cuts[k]:(cuts[k+1] if k+1 < len(cuts) else len(body))] for k in range(len(cuts))]
ids = [re.search(r'id:\s*"([a-z0-9]+)"', e).group(1) for e in ents]
byid = dict(zip(ids, ents))
# fuse: main map -> side map
for mid, (parent, after, label) in FUSE.items():
    e = byid[mid]
    e = re.sub(r'\s*unlockAfter:\s*"[a-z0-9]+",', '', e, count=1)
    e = re.sub(r'(\{\s*id:\s*"%s",)' % mid, r'\1 sub:true, parent:"%s", entry:{x:%d, y:%d, after:"%s", label:"%s"},' % (parent, random.Random(mid).randint(12, 88), random.Random(mid+'y').randint(14, 30), after, label), e, count=1)
    e = '  // Fused in as a side map (2026-10-12, user\'s map list: "Fuse %s in").\n' % mid + e
    byid[mid] = e
# renames
byid['m3'] = byid['m3'].replace('name:"The Ashen Peak"', 'name:"Ashen Spurn"', 1)
byid['mx'] = byid['mx'].replace('name:"The Caldera Heart"', 'name:"Volcano Lair"', 1).replace('label:"The caldera\'s heart"', 'label:"The lair"', 1)
assert 'Ashen Spurn' in byid['m3'] and 'Volcano Lair' in byid['mx']
rest = [x for x in ids if x not in ORDER]
assert all(x in byid for x in ORDER), [x for x in ORDER if x not in byid]
mains_rest = [x for x in rest if x.startswith('r')]; subs = [x for x in rest if not x.startswith('r')]
new_ids = ORDER + mains_rest + subs
# parse decks to build new side maps
def nodes_of(e): return re.findall(r'\{ key:"([^"]+)"[^\n]*?kind:"([a-z]+)"[^\n]*?deck:\{([^}]*)\}[^\n]*?hqHp:(\d+)', e)
def pool(mid):
    cards = {}
    for key, kind, deck, hp in nodes_of(byid[mid]):
        for k, v in json.loads('{' + deck + '}').items(): cards[k] = cards.get(k, 0) + v
    return sorted(cards, key=lambda k: -cards[k])
def hp_of(mid, kinds):
    hs = [int(hp) for key, kind, deck, hp in nodes_of(byid[mid]) if kind in kinds]
    return (sum(hs) // len(hs)) if hs else 60
NEW = [
  ('ms', 'mw', 'w-7', 'The Sunken Grove', '🌳', 'Where the swamp swallowed an old forest. The trees still stand, up to their necks.', ['Rotting Roots','Gator Hollow','Moss Weir'], 'The Grove Warden'),
  ('mn', 'm4', '4-8', 'The Glimmer Depths', '💎', 'Below the alcoves the walls start to shine, and things that like shiny things start to gather.', ['Crystal Stair','The Echo Pool','Shard Gallery'], 'The Gem Hoarder'),
  ('mv', 'm10', '10-10', 'The Aerie Vault', '🪺', 'The oldest nests on the mountain, built on top of each other for a thousand springs.', ['Cliff Ledge','Feather Drifts','The High Roost'], 'The Roost Mother'),
  ('mi', 'm6', '6-8', 'The Ice Hollow', '🧊', 'A cave of blue ice under the tundra. The cold in here has teeth.', ['Frost Tunnel','Glacier Gut','The Rime Hall'], 'The Hollow King'),
  ('mo', 'm1', '1-4', 'The Old Bramble', '🌿', 'The thorns around the Outskirts are older than the village. Something waited in them for you to grow strong.', ['Thorn Path','The Briar Ring','Root Gate'], 'The Old Bramble'),
]
icons = {'skirmish':'⚔️'}
for nid, parent, after, name, icon, blurb, fights, boss in NEW:
    if nid in byid: continue
    P = pool(parent); rng = random.Random(nid)
    sk = max(40, int(hp_of(parent, ['skirmish']) * 1.15)); bh = max(80, int(hp_of(parent, ['boss']) * 1.25))
    letter = nid[1]
    lines = []
    for k, fname in enumerate(fights):
        picks = rng.sample(P[:8], min(4, len(P[:8]))); deck = {picks[0]:4, picks[1]:3, picks[2]:3}
        if len(picks) > 3: deck[picks[3]] = 2
        req = '[]' if k == 0 else '["%s-%d"]' % (letter, k)
        lines.append('      { key:"%s-%d", kind:"skirmish", name:"%s", icon:"%s", deck:%s, hqHp:%d, rewards:{first:{gold:%d, dust:%d}}, requires:%s },' % (letter, k+1, fname, icon, json.dumps(deck, separators=(',',':')), sk + k*10, 80 + k*20, 10 + k*3, req))
    picks = rng.sample(P[:10], min(5, len(P[:10]))); deck = {p_: 2 for p_ in picks}
    lines.append('      { key:"%s-5", kind:"boss", name:"%s", icon:"👑", deck:%s, hqHp:%d, rewards:{first:{gold:200, dust:30}}, requires:["%s-3"] },' % (letter, boss, json.dumps(deck, separators=(',',':')), bh, letter))
    extra = ', afterMapCleared:"mi"' if nid == 'mo' else ''
    note = ' Opens once the Ice Hollow (the Tundra\'s side map) is cleared.' if nid == 'mo' else ''
    e = ('  // New side map (2026-10-12, user\'s map list: "New Submap").%s Fights built from %s\'s own cards; tune in the editor.\n' % (note, parent) +
         '  { id:"%s", sub:true, parent:"%s", entry:{x:%d, y:%d, after:"%s"%s, label:"%s"}, name:"%s", icon:"%s", blurb:"%s", sequential:true,\n    nodes: [\n%s\n    ]},\n' %
         (nid, parent, rng.randint(14, 86), rng.randint(60, 84), after, extra, name, name, icon, blurb, '\n'.join(lines)))
    byid[nid] = e; new_ids.append(nid)
out = []; prev = None
for x in new_ids:
    e = byid[x]
    if not e.endswith('\n'): e += '\n'
    is_sub = re.search(r'\bsub:\s*true', e.split('nodes')[0]) is not None
    if not is_sub:
        e = re.sub(r'\s*unlockAfter:\s*"[a-z0-9]+",', '', e, count=1)
        if prev is not None:
            e = re.sub(r'(\{\s*id:\s*"%s",)' % x, r'\1 unlockAfter:"%s",' % prev, e, count=1)
        prev = x
    out.append(e)
s = s[:head_end] + pre + ''.join(out).rstrip('\n') + s[j:]
open(p, 'w').write(s)
print('order:', ' '.join(new_ids))
