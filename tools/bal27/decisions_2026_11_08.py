#!/usr/bin/env python3
"""BAL27 (2026-11-08): the package's owner calls BAL27-1..3 in docs/decisions.json (one item per line, at the top; an item already there is
replaced), as tools/bal26/decisions_2026_11_07.py. Each body and its options stay under 100 words (owner 11-04 22:34).
    python3 tools/bal27/decisions_2026_11_08.py   (idempotent)"""
import json, os, re
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
P = os.path.join(ROOT, 'docs', 'decisions.json')
s = open(P, encoding='utf-8').read()
base = {"status": "YET", "kind": "Decide", "group": "game", "asked": "2026-11-08", "source": "BAL27"}
items = [
 dict({"id": "BAL27-1"}, **base, area="Road", title="The Canopy: its bramble and its rain",
  body="Not the level. The Canopy borrows Savanna Reaches' Acacia Kraal (first unit +3 Attack); a plain bramble lifts 14-A-2 30 -> 80%. "
       "Spring Rain (heal 2 a round) keeps its cheap walls (Hoopoe Herald 2/12) up: plain bramble, no fields: "
       "14-A-1 0 -> 27.5%. No deck or Shield move helped. A fight can already pick its own bramble (as 0-4 does).",
  options=["a) Its fights defend a plain bramble, then Claude re-tunes them.", "b) a) and drop Spring Rain (High Canopy stays).",
           "c) You re-tune its list (Hoopoe Herald); keep it a hard optional map."], default="a"),
 dict({"id": "BAL27-2"}, **base, area="Road", title="Fights still more than 20 off",
  body="Two tune rounds found no deck, leader or Shield move 2+ points nearer (200 games) for 14-6 56.5% (target 65), "
       "5-4 64.5% (72) and 3-5 56% (66); the Old Bramble's 0-B-1 72% (90) and 0-B-2 62.5% (75) have none either. "
       "Already yours: 1-3, 1-4, 2-1, 14-1, 14-5, 19-A-7, 19-A-8, The Canopy.",
  options=["a) Add them to BAL21-1's list: you re-tune cards or lists, Claude re-measures.", "b) Leave them."], default="a"),
 dict(dict({"id": "BAL27-3"}, **base), kind="Confirm", area="Road", title="Gatorback Swamp retuned",
  body="BAL21 and BAL26 left Map 5 alone while you edited it. BAL27 retuned its decks (no card or list touched), 40 games: "
       "5-1 82.5 -> 92.5%, 5-2 50 -> 75%, 5-3 45 -> 60%, 5-5 22.5 -> 62.5%, 5-7 20 -> 37.5% (Shield 15 -> 0). "
       "Map 5: 2 -> 5 of 7 in band.",
  options=["a) Keep.", "b) Undo the Map 5 changes (your edit is still coming)."], default="a"),
]
lines = s.split('\n'); out = []
for ln in lines:
    m = re.match(r'\s*\{"id": "([^"]+)"', ln)
    if (m and m.group(1).startswith('BAL27-')) or re.search(r'"source": "BAL27"', ln): continue
    out.append(ln)
s = '\n'.join(out)
i = s.index('"items": [') + len('"items": [')
s = s[:i] + '\n' + '\n'.join('    ' + json.dumps(x, ensure_ascii=False) + ',' for x in items) + s[i:]
s = re.sub(r'"updated": "[^"]+"', '"updated": "2026-11-08"', s, count=1)
json.loads(s)
for x in items:
    n = len((x['body'] + ' ' + ' '.join(x['options'])).split())
    assert n < 100, (x['id'], n)
    print(x['id'], len(x['body'].split()), 'body words,', n, 'with options')
open(P, 'w', encoding='utf-8').write(s)
