#!/usr/bin/env python3
"""VIS4 (2026-10-27): the owner calls in docs/decisions.json (one item per line, at the top), idempotent.
  python3 tools/vis4_decisions_2026_10_27.py"""
import json, os
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
P = os.path.join(ROOT, 'docs', 'decisions.json')
def item(i, area, title, body, options=None, default=None, kind="Decide"):
    d = {"id": i, "status": "YET", "kind": kind, "area": area, "title": title, "asked": "2026-10-27", "body": body}
    if options: d["options"] = options
    if default: d["default"] = default
    return d
NEW = [
 item("VIS4-1", "Fight visuals", "Which way does the Rampart unit step?",
  "K4 built as described: it steps toward its own bramble tile. The bramble sits at the bottom-left corner of the screen, so on a desktop the step is mostly sideways (to the left) and a little down; on a phone it is more downward. Another reading: it steps straight back toward your own edge of the field (always down), which reads more like 'bracing in front of the bramble'.",
  ["Toward the bramble tile (as built)", "Straight back toward your edge"], "Toward the bramble tile (as built)"),
 item("VIS4-2", "UI", "The map's cards on the fight panel: what shows for locked rarities and SPECIAL cards?",
  "K8 built: the panel lists the cards a fight on this map draws from (MAP, this submap's own, and SPECIAL). A card of a rarity you have not reached is not shown; they are counted in one 🔒 +N chip (a hint that more exists, no names). A card you have never seen is the ❓ card back, as in the reward strip. Options: hide the locked ones entirely (no count), or leave SPECIAL out (only the map's own cards).",
  ["As built", "No 🔒 +N count", "Leave SPECIAL out"], "As built", kind="Confirm"),
]
src = open(P, encoding='utf-8').read()
d = json.loads(src)
if any(x.get('id') in {n['id'] for n in NEW} for x in d['items']):
    print('already applied'); raise SystemExit(0)
a = '"items": [\n'
assert src.count(a) == 1
src = src.replace(a, a + ''.join('    ' + json.dumps({**x, 'group': x.get('group', 'game')}, ensure_ascii=False) + ',\n' for x in NEW))
json.loads(src)
open(P, 'w', encoding='utf-8').write(src)
print('added', len(NEW))
