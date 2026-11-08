#!/usr/bin/env python3
"""FIX10 (2026-11-08): the package's open call FIX10-1 in docs/decisions.json (one item per line, at the top; an item already there is replaced).
    python3 tools/fix10_decisions_2026_11_08.py   (idempotent)"""
import json, os, re
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
P = os.path.join(ROOT, 'docs', 'decisions.json')
s = open(P, encoding='utf-8').read()
items = [
 {"id": "FIX10-1", "status": "YET", "kind": "Decide", "area": "Cards", "group": "game", "asked": "2026-11-08", "source": "FIX10", "title": "Cormorant: over budget at Map 0",
  "body": "The Cormorant (3/7, Reach) is a Pack 1 card on the Gannet Cliffs list. Pack 1 drops from Map 0, so its budget is Map 0's: 17 against N 16.72 (ENG37 had written Map 3 by hand, where it fits). It is held off the budget check until you choose.",
  "options": ["a) Trim it to 3/6 (16, fits Map 0).", "b) Make it a Gannet Cliffs fight reward (Map 3; fits as it is).", "c) Keep 3/7 over budget."], "default": "a"},
]
s = '\n'.join(ln for ln in s.split('\n') if not (re.match(r'\s*\{"id": "FIX10-', ln)))
# 2026-11-08 (FIX10): every writer sets group (HUBDEC1); default game
i = s.index('"items": [') + len('"items": [')
s = s[:i] + '\n' + '\n'.join('    ' + json.dumps({**x, 'group': x.get('group', 'game')}, ensure_ascii=False) + ',' for x in items) + s[i:]
s = re.sub(r'"updated": "[^"]+"', '"updated": "2026-11-08"', s, count=1)
json.loads(s)
for x in items:
    w = len((x['body'] + ' ' + ' '.join(x['options'])).split()); assert w < 100, (x['id'], w)
open(P, 'w', encoding='utf-8').write(s)
print('ok: FIX10-1')
