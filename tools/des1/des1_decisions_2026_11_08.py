#!/usr/bin/env python3
"""DES1 (2026-11-08, owner 09:27: each map gets 2-3 signature skills plus basics; docs/design/map-signatures-2026-11-08.md): the package's
open calls DES1-1..3 in docs/decisions.json (one item per line, at the top; an item already there is replaced).
    python3 tools/des1/des1_decisions_2026_11_08.py   (idempotent)"""
import json, os, re
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
P = os.path.join(ROOT, 'docs', 'decisions.json')
s = open(P, encoding='utf-8').read()
items = [
 {"id": "DES1-1", "status": "YET", "kind": "Decide", "area": "Design", "asked": "2026-11-08", "title": "Skills a side map teaches first",
  "body": "Six skills show up on a side map before the main map that owns them (Rage, Web, Bulldoze, Herbalist, Ambush, Mighty). The new-skill count follows the main road only, so the main map still counts them as new.",
  "options": ["a) Allow it: the side map is a preview; the main map keeps it as a signature.",
              "b) One home per skill: move the side map's copy off (the side map gets its own 0-1 skill)."], "default": "a"},
 {"id": "DES1-2", "status": "YET", "kind": "Decide", "area": "Design", "asked": "2026-11-08", "title": "What makes a skill a map's signature",
  "body": "Today 17 of 21 main maps have no new skill on 2+ of their cards, so no strategy stands out. Proposed rule: a signature sits on at least 2 of the map's cards, one of them a card the player can win there. Fixed by adding carriers (skill edits or out-of-play cards), not new skills.",
  "options": ["a) 2+ carriers, one winnable.", "b) 3+ carriers.", "c) One carrier is enough if it is a reward."], "default": "a"},
 {"id": "DES1-3", "status": "YET", "kind": "Decide", "area": "Cards", "asked": "2026-11-08", "title": "Shooters for Maps 0-10",
  "body": "No main map before Eyrie Heights (Map 11) has a ranged unit on its list. Nine out-of-play shooters fit those maps by animal (Acorn-pelter Squirrel Map 0, Quill-flinger Porcupine Map 1, Shell-drop Gull Map 2, Electric Catfish Map 4, Reed-dart Bittern Map 5, ...), plus your Reach spear card for Gannet Cliffs.",
  "options": ["a) Place one per map as proposed (re-fit by the budget, then a road measure).",
              "b) Only the Reach card for now.", "c) Leave ranged for later maps."], "default": "a"},
]
for x in items:
    x.setdefault('group', 'game'); x['source'] = 'DES1'
s = '\n'.join(ln for ln in s.split('\n') if not (re.match(r'\s*\{"id": "DES1-', ln)))
i = s.index('"items": [') + len('"items": [')
s = s[:i] + '\n' + '\n'.join('    ' + json.dumps(x, ensure_ascii=False) + ',' for x in items) + s[i:]
s = re.sub(r'"updated": "[^"]+"', '"updated": "2026-11-08"', s, count=1)
json.loads(s)
for x in items:
    w = len((x['body'] + ' ' + ' '.join(x['options'])).split()); assert w < 100, (x['id'], w)
open(P, 'w', encoding='utf-8').write(s)
print('ok: DES1-1..3')
