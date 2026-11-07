#!/usr/bin/env python3
"""BAL26 (2026-11-07): the package's owner calls BAL26-1..2 in docs/decisions.json (one item per line, at the top; an item already there is
replaced), as tools/bal21/decisions_2026_11_07.py. Each body and its options stay under 100 words (owner 11-04 22:34).
    python3 tools/bal26/decisions_2026_11_07.py   (idempotent)"""
import json, os, re
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
P = os.path.join(ROOT, 'docs', 'decisions.json')
s = open(P, encoding='utf-8').read()
base = {"status": "YET", "kind": "Decide", "group": "game", "asked": "2026-11-07", "source": "BAL26"}
items = [
 dict({"id": "BAL26-1"}, **base, area="Road", title="Brood moved Eyrie Heights",
  body="ENG32's Brood (1/1 copies, no Swarm) weakened the Map reference of Maps 10-11 (Wolf Spider Mother x4): with the old Brood the Map 11 fights "
       "read 10-20 points higher (200 games). Guardian and Dive changed nothing there. BAL26 retuned the fights to the weaker reference.",
  options=["a) Keep: the fights now fit the reference as it plays.", "b) Swap Wolf Spider Mother out of the Map 10-11 reference deck, then re-tune those fights.",
           "c) Re-price or re-tune Brood."], default="a"),
 dict({"id": "BAL26-2"}, **base, area="Road", title="More fights their own list cannot fix",
  body="No deck, leader or Shield move brought these 2+ points nearer (200 games): 7-6 66% (target 40), 19-A-3 55% (83), 18-A-9 21% (40), "
       "19-A-10 25% (40), 20-A-1 72% (88), 2-2 64% (80), 14-2 70% (85), 2-A-5 51% (66).",
  options=["a) Add them to BAL21-1's list: you re-tune cards or lists, Claude re-measures.", "b) Leave them."], default="a"),
]
lines = s.split('\n'); out = []
for ln in lines:
    m = re.match(r'\s*\{"id": "([^"]+)"', ln)
    if (m and m.group(1).startswith('BAL26-')) or re.search(r'"source": "BAL26"', ln): continue
    out.append(ln)
s = '\n'.join(out)
i = s.index('"items": [') + len('"items": [')
s = s[:i] + '\n' + '\n'.join('    ' + json.dumps(x, ensure_ascii=False) + ',' for x in items) + s[i:]
s = re.sub(r'"updated": "[^"]+"', '"updated": "2026-11-07"', s, count=1)
json.loads(s)
open(P, 'w', encoding='utf-8').write(s)
print('BAL26 decisions:', ', '.join(x['id'] for x in items))
