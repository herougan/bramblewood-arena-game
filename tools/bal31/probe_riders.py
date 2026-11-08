#!/usr/bin/env python3
# 2026-11-08 (package BAL31): the on-hit riders (canonical/skill-delivery.json rides), their cost-table entries and the values cards print.
import json, os
from collections import defaultdict
R = os.path.join(os.path.dirname(__file__), '..', '..')
J = lambda f: json.load(open(os.path.join(R, f)))
d = J('canonical/skill-delivery.json'); rides = d['rides']
t = J('canonical/skill-costs.json'); sk = {e['id']: e for e in t['skills']}
p = J('canonical/skill-params.json')
cards = J('canonical/cards.json')
vals = defaultdict(list)
for c in cards:
    for k, v in (c.get('effects') or {}).items(): vals[k].append(v)
print('params keys', list(p.keys())[:10])
P = p.get('skills', p)
for k, r in rides.items():
    e = sk.get(k)
    print(k, r, '| cost:', e and {x: e[x] for x in e if x in ('scale', 'value', 'perN', 'curve', 'values', 'pow')}, '| cards:', len(vals[k]),
          sorted(set(json.dumps(v) for v in vals[k]))[:6], '| params:', json.dumps(P.get(k))[:140] if isinstance(P, dict) else '')
