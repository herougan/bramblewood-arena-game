#!/usr/bin/env python3
"""ENG35 (2026-11-07, owner 20:58 / 21:13: fused skills, Map cards skill tooltips): the package's open calls ENG35-1..3 in docs/decisions.json
(one item per line, at the top; an item already there is replaced). The families: canonical/skill-params.json.
    python3 tools/eng35_decisions_2026_11_07.py   (idempotent)"""
import json, os, re
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
P = os.path.join(ROOT, 'docs', 'decisions.json')
s = open(P, encoding='utf-8').read()
items = [
 {"id": "ENG35-1", "status": "YET", "kind": "Confirm", "area": "Engine", "asked": "2026-11-07", "title": "Fused skills: the parameter shape",
  "body": "Each skill family is one key: true (default), a plain value (\"almanac\": 4), or named parts: \"almanac\": {\"v\": 4, \"gives\": {\"evasive\": true}}, \"nocturnal\": {\"v\": 2, \"hp\": 1}, \"tide\": {\"gives\": {\"flood\": ..., \"ebb\": ...}}. 52 families, 28 cards folded, fights and prices unchanged. Old keys still read.",
  "options": ["a) Keep this shape.", "b) Shorter arrays instead (\"nocturnal\": [2, 1]), harder to read."], "default": "a"},
 {"id": "ENG35-2", "status": "YET", "kind": "Decide", "area": "Engine", "asked": "2026-11-07", "title": "Fuse more pairs that differ only by a setting?",
  "body": "Still separate skills: Delivery and Delivery every round; Arrow and Fire Arrow (damage type); Evolute, Evolute Alpha and Omega; Supreme and Supreme Tide. Fusing them changes keys the editor and pricing use, so it needs its own check.",
  "options": ["a) Leave them separate.", "b) Fuse Delivery / Delivery every round next.", "c) Fuse all four pairs."], "default": "a"},
 {"id": "ENG35-3", "status": "YET", "kind": "Confirm", "area": "Cards", "asked": "2026-11-07", "title": "Sunthroat Courier: Esprit's Health part alone",
  "body": "Sunthroat Courier has only Esprit's Health part (+0/+1 when a Kin ally arrives), no Attack part. The fold keeps it exactly: \"esprit\": {\"v\": null, \"hp\": 1}. It plays as before.",
  "options": ["a) Keep as it is.", "b) Make it plain Esprit +0/+1 (\"esprit\": {\"v\": 0, \"hp\": 1}), same play."], "default": "a"},
]
for x in items:
    x.setdefault('group', 'game'); x['source'] = 'ENG35'
s = '\n'.join(ln for ln in s.split('\n') if not (re.match(r'\s*\{"id": "ENG35-', ln)))
i = s.index('"items": [') + len('"items": [')
s = s[:i] + '\n' + '\n'.join('    ' + json.dumps(x, ensure_ascii=False) + ',' for x in items) + s[i:]
s = re.sub(r'"updated": "[^"]+"', '"updated": "2026-11-07"', s, count=1)
json.loads(s)
for x in items:
    w = len((x['body'] + ' ' + ' '.join(x['options'])).split()); assert w < 100, (x['id'], w)
open(P, 'w', encoding='utf-8').write(s)
print('ok: ENG35-1..3')
