#!/usr/bin/env python3
"""ENG36 (2026-11-08, owner 11-07 notes: status resistances, summons at their summoner's level, Thanatosis, Constrict, Hoard N): the package's
open calls ENG36-1..3 in docs/decisions.json (one item per line, at the top; an item already there is replaced).
    python3 tools/eng36_decisions_2026_11_08.py   (idempotent)"""
import json, os, re
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
P = os.path.join(ROOT, 'docs', 'decisions.json')
s = open(P, encoding='utf-8').read()
items = [
 {"id": "ENG36-1", "status": "YET", "kind": "Decide", "area": "Cards", "asked": "2026-11-08", "title": "Hoard: converted values or literal ones?",
  "body": "Hoard N now gives +N/+N for each Lumber you hold. To keep the two cards as strong as before (in stat points) they became Tax-Collector Teal Hoard 0.75 (was 1: +1 Attack a Lumber) and The Magnate Duck Hoard 0.25 (was 3: +1 Attack per 3 Lumber). The literal values (Teal 1, Duck 3) would make both much stronger (Duck +3/+3 a Lumber).",
  "options": ["a) Keep the converted values (0.75, 0.25).", "b) Use the literal values (1, 3) and re-check their budget."], "default": "a"},
 {"id": "ENG36-2", "status": "YET", "kind": "Confirm", "area": "Engine", "asked": "2026-11-08", "title": "Status Resist: minus 50 points",
  "body": "Your rule \"50% (if already 50% then 0%)\" is built as: Resist takes 50 points off a status's chance to land. A sure status lands half the time; a 50% or rarer one (Stun on hit's 1 in 3, Paralyze) never lands. Weakness adds 50 points. Damage over time (Venom, Bleed, Burn ...): Resist halves each tick, rounded down.",
  "options": ["a) Keep minus 50 points.", "b) Halve the chance instead (1 in 3 becomes 1 in 6)."], "default": "a"},
 {"id": "ENG36-3", "status": "YET", "kind": "Confirm", "area": "Engine", "asked": "2026-11-08", "title": "Summons at their summoner's level: the curve",
  "body": "Summons now use the normal level curve. A Log Wall (0/4 at Level 1) is 0/5 at Levels 4-6, 0/7 at 7-9, 0/8 at Level 10. Your example said a Level 10 Bulwark wall is 0/5. Bulwark's price (3.5 a wall) is unchanged.",
  "options": ["a) Keep the normal curve (0/8 at Level 10).", "b) A gentler summon curve (about +1 Health per 4 levels: 0/5 at Level 10)."], "default": "a"},
]
for x in items:
    x.setdefault('group', 'game'); x['source'] = 'ENG36'
s = '\n'.join(ln for ln in s.split('\n') if not (re.match(r'\s*\{"id": "ENG36-', ln)))
i = s.index('"items": [') + len('"items": [')
s = s[:i] + '\n' + '\n'.join('    ' + json.dumps(x, ensure_ascii=False) + ',' for x in items) + s[i:]
s = re.sub(r'"updated": "[^"]+"', '"updated": "2026-11-08"', s, count=1)
json.loads(s)
for x in items:
    w = len((x['body'] + ' ' + ' '.join(x['options'])).split()); assert w < 100, (x['id'], w)
open(P, 'w', encoding='utf-8').write(s)
print('ok: ENG36-1..3')
