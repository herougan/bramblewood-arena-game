#!/usr/bin/env python3
"""CONTENT17 (2026-11-07, owner 23:55 on more Claude picks per map, ranged cards early and the yeti hunters): the package's open calls
CONTENT17-1..4 in docs/decisions.json (one item per line, at the top; an item already there is replaced). The picks themselves:
canonical/claude-new-cards.json content17 (tools/content17_2026_11_07.js); the Maps 21+ note: docs/design/armed-creatures-2026-11-07.md.
    python3 tools/content17_decisions_2026_11_07.py   (idempotent)"""
import json, os, re
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
P = os.path.join(ROOT, 'docs', 'decisions.json')
s = open(P, encoding='utf-8').read()
items = [
 {"id": "CONTENT17-1", "status": "YET", "kind": "Decide", "area": "Cards", "asked": "2026-11-07", "title": "Place the 20 new Claude-pick cards?",
  "body": "20 new cards are on no list yet. They include the yeti hunters (Yeti Tracker, Icefletch Fox, Yeti Snarer), the bog healers (Peat-smoke Shaman, Mossmother Newt), the Trident Caiman and 14 more. Each is within budget for its proposed map. Each map's Claude New section shows them under theme headings, so you can swap a theme in.",
  "options": ["a) I place them from the Map cards window.", "b) Claude puts each on its proposed map's list.", "c) Keep them as suggestions only."], "default": "a"},
 {"id": "CONTENT17-2", "status": "YET", "kind": "Decide", "area": "Balance", "asked": "2026-11-07", "title": "Existing picks over budget for their new map",
  "body": "28 of the 250 existing cards Claude suggests would be over budget on the map they are suggested for. Most are 100-110% of N; the worst are the Pika Hoarder (126% on Gannet Cliffs) and the Subterraneaner (125%). The new cards are all within budget. No existing card was changed.",
  "options": ["a) Re-fit a card by formula when you place it (the usual re-fit step).", "b) Drop the over-budget cards from the picks.", "c) Re-fit all 28 now."], "default": "a"},
 {"id": "CONTENT17-3", "status": "YET", "kind": "Decide", "area": "Art", "asked": "2026-11-07", "title": "Art for armed creatures",
  "body": "The new prompts carry gear in the jaws or strapped on, and name it plainly: a three-pronged fishing fork, a rope, weighted cord, icicles in a strapped bundle. They avoid weapon words. Card names may still say Trident, Harpooner or Slingrat. The art is not drawn yet; it needs your computer.",
  "options": ["a) Keep this wording.", "b) Avoid weapon words in card names too (rename).", "c) Allow some weapon words in prompts from Map 21 on."], "default": "a"},
 {"id": "CONTENT17-4", "status": "YET", "kind": "Decide", "area": "Design", "asked": "2026-11-07", "title": "Maps 21+: animals with gear and culture",
  "body": "From Map 21: peoples with gear, like temple crocodiles, the yeti hunters and their yeti, and ice-arrow archers. About 1 card in 4 on a 21+ list would be ranged; on Maps 0-20 today it is 16 of 276. Concepts only: docs/design/armed-creatures-2026-11-07.md (18 cards).",
  "options": ["a) Yes: about 1 in 4 ranged from Map 21.", "b) Yes, but fewer ranged (about 1 in 6).", "c) Not yet."], "default": "a"},
]
for x in items:
    x.setdefault('group', 'game'); x['source'] = 'CONTENT17'
s = '\n'.join(ln for ln in s.split('\n') if not (re.match(r'\s*\{"id": "CONTENT17-', ln)))
i = s.index('"items": [') + len('"items": [')
s = s[:i] + '\n' + '\n'.join('    ' + json.dumps(x, ensure_ascii=False) + ',' for x in items) + s[i:]
s = re.sub(r'"updated": "[^"]+"', '"updated": "2026-11-07"', s, count=1)
json.loads(s)
for x in items:
    w = len((x['body'] + ' ' + ' '.join(x['options'])).split()); assert w < 100, (x['id'], w)
open(P, 'w', encoding='utf-8').write(s)
print('ok: CONTENT17-1..4')
