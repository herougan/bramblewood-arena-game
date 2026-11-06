#!/usr/bin/env python3
"""2026-11-06 (package ENG27, owner item 36: "2 new bramble effects. +1 attack to all cards you play, and +3 health to all cards you play."):
two brambles appended to canonical/characters.json as text (the other entries and their art stay byte for byte), as ENG26's Banner Knoll:
  - Whetstone Rise: unitAtkBonus 1 (bramblewood-engine.js: +1 Attack on every unit you play);
  - Mossbed Hollow: unitHpBonus 3 (the existing passive: +3 Health on every unit you play).
No unlockMap and no drop, so they are open where brambles are chosen; on no road fight. No art yet (the icon stands in).
    python3 tools/eng27_brambles_2026_11_06.py   (idempotent)"""
import json, os
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
P = os.path.join(ROOT, 'canonical', 'characters.json')
NEW = [
 {"id": "whetstone-rise", "name": "Whetstone Rise", "icon": "🪨", "health": 22, "rarity": "rare", "archetypes": ["Castle"],
  "effects": {"unitAtkBonus": 1},
  "flavor": "A bald hill of grey grit where every blade, claw and beak is honed before the march.",
  "creatorNote": "2026-11-06 (package ENG27, owner item 36): every unit you play +1 Attack. Health 22 and Rare as the other one-passive Rare brambles (Banner Knoll). On no road fight. No art yet."},
 {"id": "mossbed-hollow", "name": "Mossbed Hollow", "icon": "🌿", "health": 22, "rarity": "rare", "archetypes": ["Castle"],
  "effects": {"unitHpBonus": 3},
  "flavor": "Deep moss under the roots; whatever rests here a night gets up thicker-skinned.",
  "creatorNote": "2026-11-06 (package ENG27, owner item 36): every unit you play +3 Health (the unitHpBonus passive). Health 22 and Rare as Banner Knoll. On no road fight. No art yet."},
]
s = open(P, encoding='utf-8').read(); added = []
for entry in NEW:
    if '"id": "%s"' % entry['id'] in s: continue
    body = '\n'.join('  ' + ln for ln in json.dumps(entry, ensure_ascii=False, indent=2).split('\n'))
    i = s.rstrip().rfind(']'); head = s[:i].rstrip(); assert head.endswith('}')
    s = head + ',\n' + body + '\n]\n'; added.append(entry['id'])
json.loads(s)
if added: open(P, 'w', encoding='utf-8').write(s)
print('added: ' + (', '.join(added) or 'nothing'))
