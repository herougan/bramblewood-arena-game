#!/usr/bin/env python3
# 2026-10-21 (package RP): applies docs/balance/rewards-pass-2026-10-21.json (node tools/rewards_pass_2026_10_21.js plan) to
# canonical/cards.json. Only the source fields change (source, awaitingSource); stats and effects are package BF5's. The file keeps its
# format exactly (json.dumps indent 2, ASCII escapes, a final newline: a no-op round trip is byte-identical, checked first).
#   python3 tools/rewards_pass_apply_2026_10_21.py          apply (a move already applied is left as it is)
#   python3 tools/rewards_pass_apply_2026_10_21.py --check  exit 1 if any move is not applied
import json, os, sys
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
CARDS = os.path.join(ROOT, 'canonical', 'cards.json')
PLAN = os.path.join(ROOT, 'docs', 'balance', 'rewards-pass-2026-10-21.json')
raw = open(CARDS, encoding='utf-8').read()
cards = json.loads(raw)
dump = lambda d: json.dumps(d, indent=2, ensure_ascii=True) + '\n'
assert dump(cards) == raw, 'canonical/cards.json does not round-trip byte for byte; not touching it'
plan = json.load(open(PLAN, encoding='utf-8'))
by = {c['id']: c for c in cards}
def swap_key(c, old, new, value):
    # put `new` where `old` sits (so the diff touches only those lines, not a neighbour's trailing comma; package BF5 edits the stats
    # and notes of the same cards in parallel)
    items = [(k, v) for k, v in c.items() if k != new]; c.clear()
    keys = [k for k, _ in items]
    if old in keys:
        out = [(new, value) if k == old else (k, v) for k, v in items]
    elif items:
        out = items[:-1] + [(new, value), items[-1]]  # before the last key, so that line keeps its comma
    else:
        out = [(new, value)]
    for k, v in out:
        c[k] = v
todo = 0
for m in plan['moves']:
    c = by.get(m['id'])
    if c is None:
        print('missing card', m['id']); sys.exit(1)
    to = m['to']
    if to == 'awaitingSource':
        done = 'source' not in c and c.get('awaitingSource') is True
        if not done:
            swap_key(c, 'source', 'awaitingSource', True)
    elif to == 'base':
        done = 'source' not in c and not c.get('awaitingSource')
        if not done:
            c.pop('source', None); c.pop('awaitingSource', None)
    else:
        want = dict(to)
        if want.get('kind') == 'map':
            want = {'kind': 'map', 'id': to['id'], 'node': to['node']}
        done = c.get('source') == want and not c.get('awaitingSource')
        if not done:
            if 'source' in c: c['source'] = want
            else: swap_key(c, 'awaitingSource', 'source', want)
            c.pop('awaitingSource', None)
    if not done:
        todo += 1
if '--check' in sys.argv:
    print('%d of %d moves not applied' % (todo, len(plan['moves'])))
    sys.exit(1 if todo else 0)
if todo:
    open(CARDS, 'w', encoding='utf-8').write(dump(cards))
print('applied %d moves (%d already in place)' % (todo, len(plan['moves']) - todo))
