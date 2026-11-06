#!/usr/bin/env python3
"""UI23 (2026-11-06, owner notes 20:28 / 20:29 / 20:40): the package's open call UI23-1 in docs/decisions.json (one item per line, at the
top; an item already there is replaced).
    python3 tools/ui23_decisions_2026_11_06.py   (idempotent)"""
import json, os, re
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
P = os.path.join(ROOT, 'docs', 'decisions.json')
s = open(P, encoding='utf-8').read()
items = [
 {"id": "UI23-1", "status": "YET", "kind": "Decide", "area": "Map", "group": "game", "asked": "2026-11-06", "title": "The map list on a fresh account (item 40)",
  "body": "The map list and the World button stay hidden until the world opens: Map 0's reward fight won, or any fight past Map 0 and the Tutorial. That is your 10-12 call (\"otherwise its hidden till then\"), kept on 10-22. So a fresh Thistlewood shows no list. Show it from the start?",
  "options": ["a) Keep it hidden until the world opens.", "b) Show the list from the start.", "c) Show the list after Tutorial II; keep the World button gated."], "default": "c", "source": "UI23"},
]
for x in items: x.setdefault('group', 'game')  # hubdec1: every item has a group
s = '\n'.join(ln for ln in s.split('\n') if not (re.match(r'\s*\{"id": "UI23-', ln)))
i = s.index('"items": [') + len('"items": [')
s = s[:i] + '\n' + '\n'.join('    ' + json.dumps(x, ensure_ascii=False) + ',' for x in items) + s[i:]
s = re.sub(r'"updated": "[^"]+"', '"updated": "2026-11-06"', s, count=1)
json.loads(s)
for x in items:
    w = len((x['body'] + ' ' + ' '.join(x['options'])).split()); assert w < 100, (x['id'], w)
open(P, 'w', encoding='utf-8').write(s)
print('ok: UI23-1')
