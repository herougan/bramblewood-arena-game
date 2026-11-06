#!/usr/bin/env python3
"""BAL21 (2026-11-07): the package's owner calls BAL21-1..5 in docs/decisions.json (one item per line, at the top; an item already there is
replaced). Each body and its options stay under 100 words (owner 11-04 22:34).
    python3 tools/bal21/decisions_2026_11_07.py   (idempotent)"""
import json, os, re
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
P = os.path.join(ROOT, 'docs', 'decisions.json')
s = open(P, encoding='utf-8').read()
base = {"status": "YET", "kind": "Decide", "group": "game", "asked": "2026-11-07", "source": "BAL21"}
items = [
 dict({"id": "BAL21-1"}, **base, area="Road", title="Fights their own list cannot fix",
  body="No deck, leader or Shield move from the fight's list brought these 2+ points nearer (200 games): 1-3 / 1-4 Thistlewood 95% (targets 70 / 60), "
       "2-1 57% (90), 14-1 60% (90), 14-5 41% (70), Basalt Foundry 19-A-7 19% / 19-A-8 24% (68 / 64), The Canopy 0-35% (BAL20-1).",
  options=["a) You re-tune those cards or lists; Claude re-measures.", "b) Leave them."], default="a"),
 dict({"id": "BAL21-2"}, **base, area="PRO fights", title="Two PRO decks stay easy",
  body="7-PRO-4 (Map reference 90%) and 20-A-PRO-2 (97.5%): no 1-2 copy swap in their pool keeps them 10 copies apart from the map's other strong decks. "
       "The other four easy PROs are now 75-81% (2-B-PRO-4 85% at 200 games).",
  options=["a) Drop the two to replaced.", "b) Keep them.", "c) A fresh BAL16 search for Maps 7 and 20-A."], default="a"),
 dict({"id": "BAL21-3"}, **base, area="Reference decks", title="7-A-SK's Silver Minnow deck",
  body="Not a wrong-map pick: it is the Mycelium Deep's own ladder deck 3 of 10. Garden Snail is on that map's list; Silver Minnow is a Base card every player holds. "
       "The ladder samples the map-true pool, which holds every Base card, so weak ladder decks look unlike the road deck.",
  options=["a) Keep the rule.", "b) Ladder decks only from the map's list plus the road deck's cards (rebuild the ladders)."], default="a"),
 dict({"id": "BAL21-4"}, **base, area="Engine", title="Frost freezing on every hit",
  body="17-PRO-2 was a wall for Reference-2 before ENG27/28 too (7.5%). Of ENG28's rules only frost moves it: with no Freeze per frost hit it reads 17% instead of 8% "
       "(200 games); fire, poison and darkness change nothing. Its deck is retuned (21%).",
  options=["a) Keep ENG28's frost rule.", "b) Frost freezes 1 hit in 2."], default="a"),
 dict({"id": "BAL21-5"}, **base, area="Road", title="Map reference or progression decks",
  body="The road is tuned on the Map reference. The five progression decks disagree on some fights: 6-5, 11-6, 14-5, 18-6, 20-8 read 32-44% for them (Map reference 42-75%); "
       "1-3, 1-4, 0-3 read 94-100%.",
  options=["a) Keep tuning on the Map reference.", "b) Tune on the mean of both."], default="a"),
]
lines = s.split('\n'); out = []
for ln in lines:
    m = re.match(r'\s*\{"id": "([^"]+)"', ln)
    if (m and m.group(1).startswith('BAL21-')) or re.search(r'"source": "BAL21"', ln): continue
    out.append(ln)
s = '\n'.join(out)
i = s.index('"items": [') + len('"items": [')
s = s[:i] + '\n' + '\n'.join('    ' + json.dumps(x, ensure_ascii=False) + ',' for x in items) + s[i:]
s = re.sub(r'"updated": "[^"]+"', '"updated": "2026-11-07"', s, count=1)
json.loads(s)
for x in items:
    w = len((x['body'] + ' ' + ' '.join(x['options'])).split()); assert w < 100, (x['id'], w)
open(P, 'w', encoding='utf-8').write(s)
print('BAL21 decisions written:', len(items))
