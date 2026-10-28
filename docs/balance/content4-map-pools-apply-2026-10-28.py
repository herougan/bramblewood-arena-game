#!/usr/bin/env python3
# CONTENT4 L7 (2026-10-28): applies a plan from docs/balance/content4-map-pools-trim-2026-10-28.js to canonical/map-pools.json (the kept
# lists, in their order, plus the carried cards added) and canonical/cards.json (source fields only: moves, and awaitingSource for the cards
# no list holds any more). Only on the owner's go (CONTENT4-1). Then: node tools/forge_curve_2026_10_19.js maps, rebuild, the PRO re-run.
#   python3 docs/balance/content4-map-pools-apply-2026-10-28.py docs/balance/content4-map-pools-plan-2026-10-28.json
import json, os, sys
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..')
plan = json.load(open(sys.argv[1]))
pf = os.path.join(ROOT, 'canonical', 'map-pools.json')
P = json.load(open(pf))
for key, r in plan['lists'].items():
    if r.get('skipped'): continue
    ent = P['maps'][r['map']]
    if r['sub']: ent['submaps'][r['sub']] = r['keep']
    else: ent['cards'] = r['keep']
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
cf = os.path.join(ROOT, 'canonical', 'cards.json')
C = json.load(open(cf)); by = {c['id']: c for c in C}
for m in plan['moves']: by[m['id']]['source'] = m['to']
for a in plan['awaiting']:
    c = by[a['id']]; c.pop('source', None); c['awaitingSource'] = True
open(cf, 'w').write(json.dumps(C, indent=2, ensure_ascii=True) + '\n')
print('applied: pools,', len(plan['moves']), 'moves,', len(plan['awaiting']), 'awaiting a source')
