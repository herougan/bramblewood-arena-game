#!/usr/bin/env python3
# 2026-10-31 (package SKILL2): writes docs/balance/skill2-refit-2026-10-31.json (node tools/skill2_refit_2026_10_31.js) into
# canonical/cards.json: each in-play change's Attack / Health (trims, lifts and the named owner edits: BUDGET2-5, DECK1-1, DECK1-5).
# Out-of-play changes stay in the plan only (coordinator 10-31: cards.json edits limited to this package's items while ENG15 adds cards;
# nobody can get those cards, they are ready for when they are placed). The file keeps its format (json.dumps indent 2, ASCII escapes,
# a trailing newline). Running it twice changes nothing more.
#   python3 tools/skill2_apply_cards_2026_10_31.py [--dry]
import json, os, sys
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
CARDS = os.path.join(ROOT, 'canonical', 'cards.json')
PLAN = os.path.join(ROOT, 'docs', 'balance', 'skill2-refit-2026-10-31.json')
plan = json.load(open(PLAN))
cards = json.load(open(CARDS))
by = {c['id']: c for c in cards}
n = 0
for r in plan['changes']:
    if not r['inPlay']:
        continue
    c = by.get(r['id'])
    if c is None:
        print('not in cards.json:', r['id']); continue
    was = '%s/%s' % (c.get('attack'), c.get('health'))
    if r.get('attack') is not None: c['attack'] = r['attack']
    c['health'] = r['health']
    now = '%s/%s' % (c.get('attack'), c.get('health'))
    note = c.get('creatorNote') or ''
    if 'SKILL2 re-fit' not in note:
        why = r.get('why') or 'the skill re-pricing (BUDGET2-1) pushed it %s' % ('over' if r['kind'] == 'trim' else 'well under')
        c['creatorNote'] = (note + ' 2026-10-31 SKILL2 re-fit: %s -> %s, %s (cap-1 use %s of N before SKILL2, %s with the new skill prices, now %s).' % (r['stats'], r['to'], why, r['old']['use'], r['new']['use'], r['after']['use'])).strip()
    if was != now: n += 1
    print('%-28s %-6s %s -> %s' % (r['id'], r['kind'], was, now))
if '--dry' not in sys.argv:
    open(CARDS, 'w').write(json.dumps(cards, indent=2) + '\n')
    print('wrote canonical/cards.json (%d cards changed)' % n)
