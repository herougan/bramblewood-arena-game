#!/usr/bin/env python3
# 2026-10-31 (package BUDGET2): writes docs/balance/budget2-refit-2026-10-31.json (node tools/budget2_refit_2026_10_31.js) into
# canonical/cards.json: each change's Attack / Health, and the two effect edits (War Elephant's Arrow Count, Owl Nightwatch's Nocturnal).
# The file keeps its format (json.dumps indent 2, ASCII escapes, a trailing newline). Running it twice changes nothing more.
#   python3 tools/budget2_apply_2026_10_31.py [--dry]
import json, os, sys
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
CARDS = os.path.join(ROOT, 'canonical', 'cards.json')
PLAN = os.path.join(ROOT, 'docs', 'balance', 'budget2-refit-2026-10-31.json')
EFFECTS = {  # the same edits as EFFECT_EDITS in tools/budget2_refit_2026_10_31.js
    'war-elephant': {'remove': ['arrowCount']},
    'owl-nightwatch': {'set': {'nocturnal': 3}},
}
plan = json.load(open(PLAN))
cards = json.load(open(CARDS))
by = {c['id']: c for c in cards}
n = 0
for r in plan['changes']:
    c = by.get(r['id'])
    if c is None:
        print('not in cards.json:', r['id']); continue
    was = '%s/%s' % (c.get('attack'), c.get('health'))
    if r['kind'] in ('trim', 'lift'):
        if r.get('attack') is not None: c['attack'] = r['attack']
        c['health'] = r['health']
    e = EFFECTS.get(r['id'])
    if e:
        eff = c.setdefault('effects', {})
        for k in e.get('remove', []): eff.pop(k, None)
        eff.update(e.get('set', {}))
    now = '%s/%s' % (c.get('attack'), c.get('health'))
    if was != now or e: n += 1
    print('%-28s %-8s %s -> %s%s' % (r['id'], r['kind'], was, now, (' + ' + json.dumps(e)) if e else ''))
if '--dry' not in sys.argv:
    open(CARDS, 'w').write(json.dumps(cards, indent=2) + '\n')
    print('wrote canonical/cards.json (%d cards changed)' % n)
