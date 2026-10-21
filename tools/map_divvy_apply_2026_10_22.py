#!/usr/bin/env python3
# 2026-10-22 (package DV, the map divvy): applies docs/balance/map-divvy-2026-10-22.json (node tools/map_divvy_2026_10_22.js plan) to
# canonical/cards.json: the rarity changes and the source moves (source, awaitingSource). Stats are re-fitted afterwards by
# tools/refit_pass_2026_10_21.js. The file keeps its format exactly (json.dumps indent 2, ASCII escapes, a final newline; a no-op
# round trip is byte-identical, checked first), the way tools/rewards_pass_apply_2026_10_21.py does.
#   python3 tools/map_divvy_apply_2026_10_22.py          apply (what is already in place is left as it is)
#   python3 tools/map_divvy_apply_2026_10_22.py --check  exit 1 if anything is not applied
import json, os, sys
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
CARDS = os.path.join(ROOT, 'canonical', 'cards.json')
PLAN = os.path.join(ROOT, 'docs', 'balance', 'map-divvy-2026-10-22.json')
raw = open(CARDS, encoding='utf-8').read()
cards = json.loads(raw)
dump = lambda d: json.dumps(d, indent=2, ensure_ascii=True) + '\n'
assert dump(cards) == raw, 'canonical/cards.json does not round-trip byte for byte; not touching it'
plan = json.load(open(PLAN, encoding='utf-8'))
by = {c['id']: c for c in cards}
def swap_key(c, old, new, value):
    # put `new` where `old` sits, so the diff touches only those lines
    items = [(k, v) for k, v in c.items() if k != new]; c.clear()
    keys = [k for k, _ in items]
    if old in keys:
        out = [(new, value) if k == old else (k, v) for k, v in items]
    elif items:
        out = items[:-1] + [(new, value), items[-1]]
    else:
        out = [(new, value)]
    for k, v in out:
        c[k] = v
todo = 0
for r in plan['rarityChanges']:
    c = by.get(r['id'])
    if c is None:
        print('missing card', r['id']); sys.exit(1)
    if c.get('rarity') != r['to']:
        c['rarity'] = r['to']; todo += 1
for m in plan['moves']:
    c = by.get(m['id'])
    if c is None:
        print('missing card', m['id']); sys.exit(1)
    to = m['to']
    if to == 'awaitingSource':
        done = 'source' not in c and c.get('awaitingSource') is True
        if not done:
            swap_key(c, 'source', 'awaitingSource', True)
    else:
        want = dict(to)
        done = c.get('source') == want and not c.get('awaitingSource')
        if not done:
            if 'source' in c: c['source'] = want
            else: swap_key(c, 'awaitingSource', 'source', want)
            c.pop('awaitingSource', None)
    if not done:
        todo += 1
total = len(plan['moves']) + len(plan['rarityChanges'])
if '--check' in sys.argv:
    print('%d of %d changes not applied' % (todo, total))
    sys.exit(1 if todo else 0)
if todo:
    open(CARDS, 'w', encoding='utf-8').write(dump(cards))
print('applied %d changes (%d already in place)' % (todo, total - todo))
