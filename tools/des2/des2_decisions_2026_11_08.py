#!/usr/bin/env python3
"""DES2 (2026-11-08, owner 10:52 "let's limit and focus in", 11:07 "My job is to winnow the unique skills to 3 per map";
docs/design/skill-plan-maps-0-20-2026-11-08.md): the package's open calls DES2-1..3 in docs/decisions.json (one item per line, at the top;
an item already there is replaced). The signature picks themselves go in docs/design/skill-picks-maps-0-20-2026-11-08.csv, not here.
    python3 tools/des2/des2_decisions_2026_11_08.py   (idempotent)"""
import json, os, re
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
P = os.path.join(ROOT, 'docs', 'decisions.json')
s = open(P, encoding='utf-8').read()
items = [
 {"id": "DES2-1", "status": "YET", "kind": "Decide", "area": "Design", "asked": "2026-11-08", "title": "Pressure (Kelp Mangroves)",
  "body": "Your version (2 Armor-ignoring damage to every unit a rise, +1 Armor to everyone) kills swarms and tokens and, after two rises, leaves 1-2 Attack units dealing 0: fights stall and no deck owns it. Tuned: 1 damage a rise, at most 3 rises a fight, Armor only for Tide / Pressure units, deep water doubles it.",
  "options": ["a) Tuned version.", "b) Your version as written.", "c) Park Pressure; Map 9 picks from the other candidates."], "default": "a"},
 {"id": "DES2-2", "status": "YET", "kind": "Decide", "area": "Cards", "asked": "2026-11-08", "title": "Simpler card names, Maps 0-20",
  "body": "76 cards on Maps 0-20 renamed to plain animals (Pyrenean Desman to Water Mole, Peregrine Stooper to Falcon, Mangrove Monitor to Mangrove Lizard ...); Tasmanian Devil moves to a later map. Ids stay; each rename re-keys the 12 language packs and art prompts. List in the skill plan, section 4.",
  "options": ["a) Rename all as listed.", "b) You strike the ones to keep, then rename the rest.", "c) Keep the names."], "default": "b"},
 {"id": "DES2-3", "status": "YET", "kind": "Decide", "area": "Design", "asked": "2026-11-08", "title": "Duplicate skills",
  "body": "15 groups do nearly the same thing (many deaths: Requiem, Dirge, Carnage, Tally; many units: Muster, Beset, Throng ...), 158 cards. Exploit already is your Vulnerable (+1 a hit, a token used per hit): its tokens would read Vulnerable and the old Vulnerable action reads Shock.",
  "options": ["a) Merge all 15 groups as parameters (ENG35) and rename Exploit to Vulnerable.",
              "b) Only the word-for-word ones (Stockpile, Timber, Ice Arrow, Darksight, Tangleweed) and the Vulnerable name.",
              "c) Leave them."], "default": "a"},
]
for x in items:
    x.setdefault('group', 'game'); x['source'] = 'DES2'
s = '\n'.join(ln for ln in s.split('\n') if not (re.match(r'\s*\{"id": "DES2-', ln)))
i = s.index('"items": [') + len('"items": [')
s = s[:i] + '\n' + '\n'.join('    ' + json.dumps(x, ensure_ascii=False) + ',' for x in items) + s[i:]
s = re.sub(r'"updated": "[^"]+"', '"updated": "2026-11-08"', s, count=1)
json.loads(s)
for x in items:
    w = len((x['body'] + ' ' + ' '.join(x['options'])).split()); assert w < 100, (x['id'], w)
open(P, 'w', encoding='utf-8').write(s)
print('ok: DES2-1..3')
