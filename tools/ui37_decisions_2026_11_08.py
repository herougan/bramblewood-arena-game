#!/usr/bin/env python3
"""UI37 (2026-11-08, owner 17:22 #1-#4): the package's open call UI37-1 in docs/decisions.json (one item per line, at the top; an item already there is replaced).
    python3 tools/ui37_decisions_2026_11_08.py   (idempotent)"""
import json, os, re
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
P = os.path.join(ROOT, 'docs', 'decisions.json')
s = open(P, encoding='utf-8').read()
items = [
 {"id": "UI37-1", "status": "YET", "kind": "Confirm", "area": "Map lists", "group": "game", "asked": "2026-11-08", "source": "UI37", "title": "Prospects: what counts as Carried",
  "body": "A card is Carried on a map when an earlier main map gives it: you flagged it Yes there, or you have not flagged it there and it is on that map's list today. A No there takes it away. Side-map lists and SPECIAL never count. Keep this rule?",
  "options": ["a) Keep it.", "b) Count only your Yes flags (unflagged list cards stop counting)."], "default": "a"},
]
s = '\n'.join(ln for ln in s.split('\n') if not (re.match(r'\s*\{"id": "UI37-', ln)))
i = s.index('"items": [') + len('"items": [')
s = s[:i] + '\n' + '\n'.join('    ' + json.dumps(x, ensure_ascii=False) + ',' for x in items) + s[i:]
s = re.sub(r'"updated": "[^"]+"', '"updated": "2026-11-08"', s, count=1)
json.loads(s)
for x in items:
    w = len((x['body'] + ' ' + ' '.join(x['options'])).split()); assert w < 100, (x['id'], w)
open(P, 'w', encoding='utf-8').write(s)
print('ok: UI37-1')
