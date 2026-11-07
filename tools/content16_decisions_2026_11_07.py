#!/usr/bin/env python3
"""CONTENT16 (2026-11-07, owner 09:10 on where cards are earned): the package's open calls CONTENT16-1..4 in docs/decisions.json (one item per
line, at the top; an item already there is replaced). The plan itself: canonical/pack-plan.json, docs/pack-plan-2026-11-07.md.
    python3 tools/content16_decisions_2026_11_07.py   (idempotent)"""
import json, os, re
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
P = os.path.join(ROOT, 'docs', 'decisions.json')
s = open(P, encoding='utf-8').read()
items = [
 {"id": "CONTENT16-1", "status": "YET", "kind": "Decide", "area": "Packs", "asked": "2026-11-07", "title": "Pack zones: which maps each pack covers",
  "body": "Proposed Maps 0-7 (Hedgerow Pouch), 8-13 (Tidemire Chest), 14-20 (Highcrest Case); a submap counts from the map that unlocks it. Map 7 moves to the Pouch (the Chest is first sold on Map 8). The Case starts at 14, not 16: it is sold from Map 13 and the map-end pack turns gold at 14. Today: 0-6 / 7-13 / 14-20.",
  "options": ["a) 0-7 / 8-13 / 14-20 (proposed).", "b) 0-7 / 8-15 / 16-20.", "c) Keep 0-6 / 7-13 / 14-20."], "default": "a"},
 {"id": "CONTENT16-2", "status": "YET", "kind": "Decide", "area": "Packs", "asked": "2026-11-07", "title": "Add 20 basic cards to each pack",
  "body": "20 simple, zone-themed cards per pack (60 in all), from the 370 cards nothing gives out today. All fit the budget at the pack's first map; 57 are met in no skirmish, so they become pack-only. Three await a source (Bog Shrew, Kelpborn Otter, Conger Eel). List and reasons: docs/pack-plan-2026-11-07.md.",
  "options": ["a) Add all 60.", "b) Add them; I'll prune in the Pack editor.", "c) Not yet."], "default": "b"},
 {"id": "CONTENT16-3", "status": "YET", "kind": "Decide", "area": "Achievements", "asked": "2026-11-07", "title": "One card per achievement (5% upgrade discount later)",
  "body": "Each of the 17 achievements gives one copy of its own card (Courier Pigeon for First Victory ... Thunder Lizard for Wyrmslayer), found nowhere else. These are the cards the 5% discount would tag. Today achievements give only random faction cards (8 of them).",
  "options": ["a) All 17 as listed.", "b) Only the 8 that already give faction cards.", "c) Pick other cards."], "default": "a"},
 {"id": "CONTENT16-4", "status": "YET", "kind": "Decide", "area": "Packs", "asked": "2026-11-07", "title": "Move off-theme pack cards",
  "body": "Tide Spirit (a water spirit, in the Case via the Volcano Lair) to the Chest; Gangrenous Leech, Snapper Hatchling, Caiman Hatchling (swamp cards in the Chest) to the Pouch; the Tasmanian Devil out of the Chest (map review: not a redwood animal; it stays an enemy card). Needs a per-pack exclusion list in the Pack editor.",
  "options": ["a) All five.", "b) The four moves; keep the Devil.", "c) None."], "default": "b"},
]
for x in items:
    x.setdefault('group', 'game'); x['source'] = 'CONTENT16'
s = '\n'.join(ln for ln in s.split('\n') if not (re.match(r'\s*\{"id": "CONTENT16-', ln)))
i = s.index('"items": [') + len('"items": [')
s = s[:i] + '\n' + '\n'.join('    ' + json.dumps(x, ensure_ascii=False) + ',' for x in items) + s[i:]
s = re.sub(r'"updated": "[^"]+"', '"updated": "2026-11-07"', s, count=1)
json.loads(s)
for x in items:
    w = len((x['body'] + ' ' + ' '.join(x['options'])).split()); assert w < 100, (x['id'], w)
open(P, 'w', encoding='utf-8').write(s)
print('ok: CONTENT16-1..4')
