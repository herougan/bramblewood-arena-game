#!/usr/bin/env python3
"""BAL28 (2026-11-08): the package's owner calls BAL28-1..2 in docs/decisions.json (one item per line, at the top; an item already there is
replaced), as tools/bal27/decisions_2026_11_08.py. Each body and its options stay under 100 words (owner 11-04 22:34).
Numbers: docs/balance/bal28/canopy-bower-2026-11-08.json (200 games, road seeds) and docs/balance/bal28/space/14-A-1.json.
    python3 tools/bal28/decisions_2026_11_08.py   (idempotent)"""
import json, os, re
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
P = os.path.join(ROOT, 'docs', 'decisions.json')
s = open(P, encoding='utf-8').read()
base = {"status": "YET", "kind": "Decide", "group": "game", "asked": "2026-11-08", "source": "BAL28"}
items = [
 dict({"id": "BAL28-1"}, **base, area="Brambles", title="The Canopy Bower makes The Canopy harder",
  body="Its +1/+2 goes to the CPU's own units: every Canopy deck is Rainforest / Savanna. After BAL28's retune (200 games; targets 90/80/70/60/40): "
       "as shipped 5.5/52/37/13/8.5%; Rainforest only +1/+3 13/73.5/54.5/17/22%; no ability 14.5/73.5/64/49/26%. "
       "No deck, leader or Shield move closes it.",
  options=["a) The CPU's Bower has no ability on The Canopy; players keep the buff. Claude retunes.",
           "b) Rainforest only, +1/+3 (CONTENT18-3 b).", "c) Keep it; The Canopy stays hard."], default="a"),
 dict({"id": "BAL28-2"}, **base, area="Road", title="14-A-1 Dart Frogs cannot reach 90%",
  body="Its list allows only 10 legal decks (BAL28 tried all): Hoopoe Herald, Weaver Bird and Pangolin Roller fill 11+ of 16 slots "
       "(K14 caps the rest at 1 each). Best: 5.5% with the Bower, 15.5% on a plain bramble.",
  options=["a) You widen its list or its copy rules; Claude retunes.", "b) Swap it with a later Canopy fight's slot.",
           "c) Leave it."], default="a"),
]
lines = s.split('\n'); out = []
for ln in lines:
    m = re.match(r'\s*\{"id": "([^"]+)"', ln)
    if (m and m.group(1).startswith('BAL28-')) or re.search(r'"source": "BAL28"', ln): continue
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
