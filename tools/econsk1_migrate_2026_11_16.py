# ECONSK1 (2026-11-16, owner 23:28): Delivery every round -> Forestry / Quarrying / Mining / Prospecting by its resource, in canonical/cards.json.
# Idempotent. Run from the repo root.
import json, collections
p = 'canonical/cards.json'; raw = open(p).read()
cards = json.loads(raw, object_pairs_hook=collections.OrderedDict)
KEY = {'lumber': 'forestry', 'stone': 'quarrying', 'metal': 'mining', 'gold': 'prospecting'}
moved = []
def mig(e):
    if not isinstance(e, dict): return e, None
    d = e.get('delivery')
    if not (isinstance(d, dict) and d.get('every') == 'round'): return e, None
    key = KEY[(d.get('res') or 'lumber').lower()]
    out = collections.OrderedDict()
    for k, v in e.items(): out[key if k == 'delivery' else k] = d.get('v', 1) if k == 'delivery' else v
    return out, key
for c in cards:
    e, k = mig(c.get('effects'))
    if k: c['effects'] = e; moved.append((c['id'], k))
    for lv, ls in (c.get('levelSkills') or {}).items():
        e2, k2 = mig(ls)
        if k2: c['levelSkills'][lv] = e2; moved.append((c['id'] + '@' + lv, k2))
out = json.dumps(cards, indent=2)
if raw.endswith('\n'): out += '\n'
open(p, 'w').write(out)
print(moved)
