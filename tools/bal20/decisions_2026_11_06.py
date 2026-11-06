#!/usr/bin/env python3
"""BAL20 (2026-11-06): the package's owner calls BAL20-1 / BAL20-2 in docs/decisions.json (one item per line, at the top; an item already
there is replaced). Each body and its options stay under 100 words (owner 11-04 22:34).
    python3 tools/bal20/decisions_2026_11_06.py   (idempotent)"""
import json, os, re
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
P = os.path.join(ROOT, 'docs', 'decisions.json')
s = open(P, encoding='utf-8').read()
items = [
 {"id": "BAL20-1", "status": "YET", "kind": "Decide", "area": "Map lists", "group": "game", "asked": "2026-11-06", "title": "The Canopy is still a wall",
  "body": "Not the level: the enemy's Lv 4 is the Map 18 schedule (reference 3.54); at the reference's level it gains 0-6 points. Not the leaders. "
          "The cause: its list (cheap Hoopoe Herald 2/12, Weaver Bird 3/6 Tangle, Pangolin Roller) under K14, plus Acacia Kraal. "
          "A plain bramble lifts 14-A-2/3 to 66-81%; 14-A-1 and 14-A-5 stay under 10% even then. Fights now 0-28.5% (targets 40-90).",
  "options": ["a) You re-tune those cards or the list; Claude re-measures.", "b) The Canopy defends a plainer bramble.",
              "c) Leave it a hard optional side map."], "default": "a", "source": "BAL20"},
 {"id": "BAL20-2", "status": "YET", "kind": "Decide", "area": "Road", "group": "game", "asked": "2026-11-06", "title": "Savanna boss now easier than its elites",
  "body": "14-8 The Savanna Warlord went 23% -> 54.5% (target 40) with Acacia Giraffe as its leader: nearer its target, but easier than 14-5 to 14-7 (25-45%). "
          "No deck or Shield move on the list brings it back down; the elites are walled by Acacia Kraal.",
  "options": ["a) Keep it (nearer the target).", "b) Put the Dust Hyena leader back (23%)."], "default": "a", "source": "BAL20"},
]
lines = s.split('\n'); out = []
for ln in lines:
    m = re.match(r'\s*\{"id": "([^"]+)"', ln)
    if m and m.group(1).startswith('BAL20-'): continue
    out.append(ln)
s = '\n'.join(out)
i = s.index('"items": [') + len('"items": [')
s = s[:i] + '\n' + '\n'.join('    ' + json.dumps(x, ensure_ascii=False) + ',' for x in items) + s[i:]
s = re.sub(r'"updated": "[^"]+"', '"updated": "2026-11-06"', s, count=1)
json.loads(s)
for x in items:
    w = len((x['body'] + ' ' + ' '.join(x['options'])).split()); assert w < 100, (x['id'], w)
open(P, 'w', encoding='utf-8').write(s)
print('ok: BAL20-1, BAL20-2')
