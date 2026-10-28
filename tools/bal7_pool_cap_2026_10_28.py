#!/usr/bin/env python3
# Package BAL7 (2026-10-28, CONTENT4-1, the default: "cap the pools only: a trimmed pack card stays in its pack and keeps its map (a pool no
# longer has to list every pack card of its map); nothing leaves the packs"): applies the map lists of a CONTENT4 plan
# (docs/balance/content4-map-pools-trim-2026-10-28.js) to canonical/map-pools.json and nothing else: the plan's moves and its awaiting list
# are NOT applied, so every card keeps its source (pack, tier and map) and no card loses its source.
#   node docs/balance/content4-map-pools-trim-2026-10-28.js      (the strict plan, on today's decks)
#   node docs/balance/content4-map-pools-trim-2026-10-28.js --keep-pro
#   python3 tools/bal7_pool_cap_2026_10_28.py docs/balance/content4-map-pools-plan-2026-10-28.json docs/balance/content4-map-pools-plan-2026-10-28-keeppro.json
#   node tools/forge_curve_2026_10_19.js maps                     (canonical/card-obtain-maps.json)
import json, os, sys
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
plan = json.load(open(sys.argv[1]))
pf = os.path.join(ROOT, 'canonical', 'map-pools.json')
P = json.load(open(pf))
# With the keep-PRO plan as a second argument: a card the strict cap takes off a list comes back when a PRO / BPRO deck of that map holds it
# and it is not the map's own pack card (an own pack card stays the map's own without the list: tools/opt/deckopt.js ownPackCards), so the
# PRO / BPRO decks keep their map rule with no re-run.
keeppro = json.load(open(sys.argv[2]))['lists'] if len(sys.argv) > 2 else {}
C = {c['id']: c for c in json.load(open(os.path.join(ROOT, 'canonical', 'cards.json')))}
def own_pack(cid, mids):
    s = (C.get(cid) or {}).get('source') or {}
    return s.get('kind') == 'pack' and s.get('map') in mids and str(s.get('tier', 1)) not in ('11', '99')
n = 0; back = {}
for key, r in plan['lists'].items():
    if r.get('skipped'): continue
    ent = P['maps'][r['map']]
    keep = list(r['keep'])
    kp = keeppro.get(key)
    if kp:
        mids = {r['map']} | ({r['sub']} if r['sub'] else set())
        extra = [c for c in kp['keep'] if c not in keep and not own_pack(c, mids)]
        if extra:
            back[key] = extra
            order = (ent['submaps'][r['sub']] if r['sub'] else ent['cards'])
            keep = [c for c in order if c in keep or c in extra] + [c for c in keep + extra if c not in order]
    if r['sub']: ent['submaps'][r['sub']] = keep
    else: ent['cards'] = keep
    n += 1
if back: print('kept for the PRO / BPRO decks:', json.dumps(back))
P['_about'] = P['_about'].rstrip() + (' BAL7 (2026-10-28, CONTENT4-1): each list capped at about 7 new and 3-5 carried cards (plan ' + os.path.basename(sys.argv[1]) + '); a trimmed pack card keeps its pack and its map (source unchanged), so the lists no longer hold every pack card of their map.' if 'BAL7' not in P['_about'] else '')
def arr(a): return '[' + ', '.join(json.dumps(x, ensure_ascii=False) for x in a) + ']'
out = ['{', ' "_about": ' + json.dumps(P['_about'], ensure_ascii=False) + ',', ' "maps": {']
ms = list(P['maps'].items())
for i, (mid, e) in enumerate(ms):
    out.append('  ' + json.dumps(mid) + ': {')
    out.append('   "cards": ' + arr(e['cards']) + ',')
    subs = list(e.get('submaps', {}).items())
    if subs:
        out.append('   "submaps": {')
        for j, (sid, a) in enumerate(subs):
            out.append('    ' + json.dumps(sid) + ': ' + arr(a) + (',' if j < len(subs) - 1 else ''))
        out.append('   },')
    else:
        out.append('   "submaps": {},')
    out.append('   "special": ' + arr(e.get('special', [])))
    out.append('  }' + (',' if i < len(ms) - 1 else ''))
out += [' }', '}']
open(pf, 'w').write('\n'.join(out) + '\n')
print('capped', n, 'lists; sources untouched (moves and awaiting of the plan not applied)')
