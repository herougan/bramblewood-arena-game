#!/usr/bin/env python3
"""VIS5 (2026-10-28): the owner calls in docs/decisions.json (one item per line, at the top), idempotent.
  python3 tools/vis5_decisions_2026_10_28.py"""
import json, os
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
P = os.path.join(ROOT, 'docs', 'decisions.json')
def item(i, area, title, body, options=None, default=None, kind="Decide"):
    d = {"id": i, "status": "YET", "kind": kind, "area": area, "title": title, "asked": "2026-10-28", "body": body}
    if options: d["options"] = options
    if default: d["default"] = default
    return d
NEW = [
 item("VIS5-1", "UI", "Crowded fights: Quit and Forfeit inside a \u22ef menu?",
  "L6 built: the fight's top-right buttons go words, then icons, then (when even the icons would squeeze, as in a fight with five or more Environment cards) four buttons stay (speed, the log, settings and a \u22ef) and full screen, Forfeit, Auto-play, the admin tools and Quit move into the \u22ef menu; at a width where nothing fits beside the cards the four take their own line. Quit and Forfeit still ask before they act. If you want Quit always visible, the menu would hold the rest.",
  ["As built: Quit and Forfeit in the \u22ef menu when crowded", "Keep Quit visible beside the four"], "As built: Quit and Forfeit in the \u22ef menu when crowded"),
 item("VIS5-2", "Fight visuals", "The Danger warning and the leader's slam: right amount?",
  "L3 built: the leader's entrance is a 1.4 s slam (a band, the leader's card slammed down, a ring, the name banner, a thud and a chord; crimson and a growl for the rival) and Danger is a 1.5 s red-edged warning (the field's edges pulse twice, a red light sweeps across, a hazard-striped DANGER plate slams in, two siren pulses). Both fade without motion under reduced motion and FX Low. If either is too much on every fight, the leader's slam could play in full only the first time per fight and Danger only for a new rarity step.",
  ["As built, every time", "Full slam the first time per fight, then a quiet banner"], "As built, every time", kind="Confirm"),
]
src = open(P, encoding='utf-8').read()
d = json.loads(src)
if any(x.get('id') in {n['id'] for n in NEW} for x in d['items']):
    print('already applied'); raise SystemExit(0)
a = '"items": [\n'
assert src.count(a) == 1
src = src.replace(a, a + ''.join('    ' + json.dumps(x, ensure_ascii=False) + ',\n' for x in NEW))
json.loads(src)
open(P, 'w', encoding='utf-8').write(src)
print('added', len(NEW))
