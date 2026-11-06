#!/usr/bin/env python3
"""2026-11-06 (package ENG26, owner 09:29 #6: "NEW: A bramble that increases your Leader's attack and defence by +2/+3."): adds the
Banner Knoll bramble to canonical/characters.json (appended as text, so the other entries and their art stay byte for byte). Its
passive is leaderBoon {atk 2, hp 3} (bramblewood-engine.js eng26ApplyLeaderBoon). No unlockMap and no drop, so it is open to every
player where brambles are chosen (castleUnlocked); it is on no road fight yet (decision ENG26-5). No art yet (the icon stands in).
Run once; a second run does nothing.
"""
import json, os
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
P = os.path.join(ROOT, 'canonical', 'characters.json')
s = open(P, encoding='utf-8').read()
if '"id": "banner-knoll"' in s:
    print('already there'); raise SystemExit(0)
entry = {
    "id": "banner-knoll", "name": "Banner Knoll", "icon": "🚩", "health": 22, "rarity": "rare", "archetypes": ["Castle"],
    "effects": {"leaderBoon": {"atk": 2, "hp": 3}},
    "flavor": "A grassy rise under the woven war banner. Whoever leads from here stands a head taller.",
    "creatorNote": "2026-11-06 (package ENG26, owner 09:29 #6): your Leader +2 Attack / +3 Health as it takes the field. Health 22 and Rare as the other one-passive Rare brambles. On no road fight yet (ENG26-5). No art yet.",
}
body = json.dumps(entry, ensure_ascii=False, indent=2)
body = '\n'.join('  ' + ln for ln in body.split('\n'))
i = s.rstrip().rfind(']')
head = s[:i].rstrip()
assert head.endswith('}')
s = head + ',\n' + body + '\n]\n'
json.loads(s)
open(P, 'w', encoding='utf-8').write(s)
print('added banner-knoll')
