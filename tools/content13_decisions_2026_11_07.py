#!/usr/bin/env python3
"""CONTENT13 (2026-11-07, owner 11-06 23:35 #8): the package's open call CONTENT13-1 in docs/decisions.json (one item per line, at the
top; an item already there is replaced).
    python3 tools/content13_decisions_2026_11_07.py   (idempotent)"""
import json, os, re
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
P = os.path.join(ROOT, 'docs', 'decisions.json')
s = open(P, encoding='utf-8').read()
items = [
 {"id": "CONTENT13-1", "status": "YET", "kind": "Confirm", "area": "Map", "group": "game", "asked": "2026-11-07", "title": "The Drill Grounds: deck rules and level",
  "body": "The admin-only Drill Grounds hold two faction-pure decks (Otter, Hummingbird), 20 cards, at most 6 different and 4 copies. K14's one-copy rule for non-map cards can't hold for a faction-only deck, and the road's rarity ladder isn't applied (a Royal Guard, two Choirmothers). Both fight at a fixed Level 1, the optimiser's level. Keep?",
  "options": ["a) Keep: rules waived there, Level 1.", "b) Keep the decks, another level (say which).", "c) Cap them at Uncommon and rebuild."], "default": "a", "source": "CONTENT13"},
]
for x in items: x.setdefault('group', 'game')  # hubdec1: every item has a group
s = '\n'.join(ln for ln in s.split('\n') if not (re.match(r'\s*\{"id": "CONTENT13-', ln)))
i = s.index('"items": [') + len('"items": [')
s = s[:i] + '\n' + '\n'.join('    ' + json.dumps(x, ensure_ascii=False) + ',' for x in items) + s[i:]
s = re.sub(r'"updated": "[^"]+"', '"updated": "2026-11-07"', s, count=1)
json.loads(s)
for x in items:
    w = len((x['body'] + ' ' + ' '.join(x['options'])).split()); assert w < 100, (x['id'], w)
open(P, 'w', encoding='utf-8').write(s)
print('ok: CONTENT13-1')
