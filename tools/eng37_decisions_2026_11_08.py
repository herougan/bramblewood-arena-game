#!/usr/bin/env python3
"""ENG37 (2026-11-08, owner 09:27 #1 Reach and the Gannet Cliffs Reach card; 11:03 Armoured Shield, Shell after attacking): the package's open
calls ENG37-1..5 in docs/decisions.json (one item per line, at the top; an item already there is replaced).
    python3 tools/eng37_decisions_2026_11_08.py   (idempotent)"""
import json, os, re
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
P = os.path.join(ROOT, 'docs', 'decisions.json')
s = open(P, encoding='utf-8').read()
items = [
 {"id": "ENG37-1", "status": "YET", "kind": "Confirm", "area": "Engine", "asked": "2026-11-08", "title": "Reach: which neighbour it strikes",
  "body": "With nothing opposite, a Reach unit now strikes an enemy in the lane beside it instead of the bramble. When both neighbours hold a unit it strikes the one with less Health; a tie is a coin flip. Taunt still draws it.",
  "options": ["a) Less Health first.", "b) A coin flip always.", "c) A Flyer first, then less Health."], "default": "a"},
 {"id": "ENG37-2", "status": "YET", "kind": "Decide", "area": "Balance", "asked": "2026-11-08", "title": "Reach price after the rework",
  "body": "Measured after the rework: about 0 (-0.18, range -0.94 to 0.53); before it measured 0.52. Hitting a unit beside it instead of the bramble trades chip damage for board damage. The price is still 0.52; the Cormorant is fitted with it.",
  "options": ["a) Keep 0.52 and re-measure on the flyer maps.", "b) Price Reach at 0 (Reach cards get about half a point more budget)."], "default": "a"},
 {"id": "ENG37-3", "status": "YET", "kind": "Confirm", "area": "Cards", "asked": "2026-11-08", "title": "The Gannet Cliffs Reach card: Cormorant",
  "body": "A Common 3/7 Cormorant (cost 0, Wait 1, Reach only) holding a sharpened stick from its nest. A ground bird, so it answers the cliffs' Flyers. On the Gannet Cliffs list as a pack card. Art prompt ready; art not drawn yet.",
  "options": ["a) Keep it.", "b) Make it Uncommon (3/8).", "c) A different animal (name it)."], "default": "a"},
 {"id": "ENG37-4", "status": "YET", "kind": "Confirm", "area": "Engine", "asked": "2026-11-08", "title": "Shell after attacking: name and price",
  "body": "The card reads \"Shell 2: After it attacks, +2 Armor until the round ends.\" It is a Shell setting, not a new skill. A quick measure put it at about twice a plain Shell (it comes up every round it swings), so it costs 2.15 x Shell.",
  "options": ["a) Keep the name Shell.", "b) Call it Retreat N."], "default": "a"},
 {"id": "ENG37-5", "status": "YET", "kind": "Confirm", "area": "Engine", "asked": "2026-11-08", "title": "Armoured Shield: whose Shield counts",
  "body": "Shield 4 with Armor 1 gives +1 Armor while any Shield is left on the unit, its own or one an ally gave it. It goes when the Shield breaks. Price: Armor's price x how long the Shield lasts (Shield 4 + Armor 1: +1.17).",
  "options": ["a) Any Shield on it.", "b) Only its own arrival Shield."], "default": "a"},
]
for x in items:
    x.setdefault('group', 'game'); x['source'] = 'ENG37'
s = '\n'.join(ln for ln in s.split('\n') if not (re.match(r'\s*\{"id": "ENG37-', ln)))
i = s.index('"items": [') + len('"items": [')
s = s[:i] + '\n' + '\n'.join('    ' + json.dumps(x, ensure_ascii=False) + ',' for x in items) + s[i:]
s = re.sub(r'"updated": "[^"]+"', '"updated": "2026-11-08"', s, count=1)
json.loads(s)
for x in items:
    w = len((x['body'] + ' ' + ' '.join(x['options'])).split()); assert w < 100, (x['id'], w)
open(P, 'w', encoding='utf-8').write(s)
print('ok: ENG37-1..5')
