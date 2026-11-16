# 2026-11-16 (package CARDPOW1): the owner calls the card power / budget pass raises, into docs/decisions.json (one line per item, at the top).
#   python3 tools/cardpow1/decisions_2026_11_16.py
import json, os, re
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..')
P = os.path.join(ROOT, 'docs', 'decisions.json')
R = json.load(open(os.path.join(ROOT, 'docs', 'balance', 'cardpow1', 'cardpow1-2026-11-16.json'), encoding='utf-8'))
cards = R['cards']
ip = [r for r in cards if r['obtainable'] and r['kind'] != 'field' and r['verdict'] not in ('egg', 'spell', 'equipment') and r['map'] <= 20]
under = [r for r in ip if r['verdict'] == 'under']; over = [r for r in ip if r['verdict'].startswith('over')]
b0 = [r for r in ip if r['baseLevel'] == 0]
items = [
 {"id": "CARDPOW1-1", "status": "YET", "kind": "Decide", "area": "Balance", "group": "game", "asked": "2026-11-16", "source": "CARDPOW1",
  "title": "Level 0 cards: Level 1 gives too little",
  "body": "The %d Level 0 cards (tutorial, Base, Baby) get a third of their 0-1 budget gain at Level 1, so Level 2 jumps: median +12 fill points (other cards dip 3). Card stats are unchanged either way." % len(b0),
  "options": ["a) Level 1 counts as a major level for Level 0 cards (one line in bramblewood-budget.js).", "b) Leave it."], "default": "a"},
 {"id": "CARDPOW1-2", "status": "YET", "kind": "Decide", "area": "Balance", "group": "game", "asked": "2026-11-16", "source": "CARDPOW1",
  "title": "Cards outside 85-100% at Level 1 (Maps 0-20)",
  "body": "Of %d in-play Maps 0-20 cards, %d sit under 85%% and %d over 100%% of N at Level 1. Fixes are proposed per card in the CardPower workbook (OK? column); nothing changed." % (len(ip), len(under), len(over)),
  "options": ["a) You mark OK? in the workbook; Claude applies the OK'd rows.", "b) Fold them into your REDESIGN2 workbook instead.", "c) Leave them."], "default": "a"},
]
s = open(P, encoding='utf-8').read()
s = '\n'.join(ln for ln in s.split('\n') if not re.match(r'\s*\{"id": "CARDPOW1-', ln))
i = s.index('"items": [') + len('"items": [')
s = s[:i] + '\n' + '\n'.join('    ' + json.dumps(x, ensure_ascii=False) + ',' for x in items) + s[i:]
s = re.sub(r'"updated": "[^"]+"', '"updated": "2026-11-16"', s, count=1)
json.loads(s)
for x in items:
    w = len((x['body'] + ' ' + ' '.join(x['options'])).split()); assert w < 100, (x['id'], w)
open(P, 'w', encoding='utf-8').write(s)
print('ok: CARDPOW1-1..2')
