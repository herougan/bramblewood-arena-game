#!/usr/bin/env python3
"""BAL30 (2026-11-08): apply BAL29 groups A + B at the mean worth (owner 17:22, BAL29-1 / BAL29-2 a), Reach = 1 (ENG37-2) and the Bulwark estimate
to canonical/skill-costs.json. Line-wise edit (one skill a line) so the diff shows only the changed skills. Prints old -> new.
Usage: python3 tools/bal30/apply_prices_2026_11_08.py [repo root]"""
import json, sys
ROOT = sys.argv[1] if len(sys.argv) > 1 else '.'
PATH = ROOT + '/canonical/skill-costs.json'
prop = {e['id']: e for e in json.load(open(ROOT + '/docs/balance/bal29/proposed-skill-costs-2026-11-08.json'))['skills']}
live = {e['id']: e for e in json.load(open(PATH))['skills']}
changed = [k for k in prop if prop[k] != live.get(k) and k != 'bulwark']
KEYS = ('scale', 'value', 'pow')
TAG = '2026-11-08 (package BAL30, decisions BAL29-1 a / BAL29-2 a): the ladder mean (BAL29 ladder, 400 paired fights a variant at L1 and L5)'


def desc(e):
    return {k: e[k] for k in KEYS if k in e}


new = {}
for k in changed:
    e = dict(live[k])
    old = desc(e)
    for kk in KEYS:
        e.pop(kk, None)
    p = prop[k]
    ne = {'id': e.pop('id'), **{kk: p[kk] for kk in KEYS if kk in p}, **e}
    ne.pop('bal29', None)
    ne['bal29'] = TAG
    ne['bal29Was'] = old
    new[k] = ne

# Bulwark: estimate (owner "Bulwark - estimate yourself").
b = dict(live['bulwark'])
old = desc(b)
for kk in KEYS:
    b.pop(kk, None)
bid = b.pop('id')
b = {'id': bid, 'scale': 'n', 'value': 6.65, 'pow': 0.47, **b}
b['bal29'] = ('2026-11-08 (package BAL30, owner "Bulwark - estimate yourself"): 6.65 x N^0.47 = the BAL29 ladder 6.16 x N^0.47 (one 0/4 Log Wall, mean, L1 and L5; '
              '6.16 / 8.53 at N 1 / 2) x 1.08, because ENG36 walls grow with the summoner (0/4 at L1, 0/5 L4-6, 0/7 L7-9, 0/8 L10; Health elasticity 0.22 from SKILL2 '
              '5.96 -> 6.94 for doubled Health; the mean wall is about 0/5.7). ENG33 priced 3.5 a wall (Bulwark 2 measure / 2 walls); the ladder shows the first wall '
              'carries most of the worth (6.2 for one, 8.5 for two).')
b['bal29Was'] = old
new['bulwark'] = b

# Reach: owner ENG37-2 "Price it at 1 for now."
r = dict(live['reach'])
old = desc(r)
r['value'] = 1
r['bal30'] = '2026-11-08 (package BAL30, decision ENG37-2: "Price it at 1 for now."): was 0.52 (SKILL2); the ENG37 rework measured -0.18 [-0.94, 0.53]'
r['bal30Was'] = old
new['reach'] = r

out = []
for line in open(PATH, encoding='utf-8').read().split('\n'):
    s = line.rstrip(',')
    if s.startswith('  {"id":"'):
        try:
            e = json.loads(s)
        except Exception:
            e = None
        if e and e['id'] in new:
            out.append('  ' + json.dumps(new[e['id']], ensure_ascii=False, separators=(',', ':')) + (',' if line.endswith(',') else ''))
            continue
    out.append(line)
open(PATH, 'w', encoding='utf-8').write('\n'.join(out))


def fmt(e):
    if not e:
        return '-'
    v, p, sc = e.get('value'), e.get('pow'), e.get('scale')
    return f"{sc} {v}" + (f" ^{p}" if p is not None else '')


for k in new:
    print(k, '|', fmt(desc(live[k])), '->', fmt(desc(new[k])))
print(len(new), 'skills')
