#!/usr/bin/env python3
"""ENG26 (2026-11-06, owner notes 09:29): BAL19-2 set DONE with the owner's call, and the package's calls ENG26-1..5 in docs/decisions.json
(one item per line, at the top; an item already there is replaced). ENG26-3 reads the Bloom measure (docs/balance/skill-canon-eng26-*).
    python3 tools/eng26_decisions_2026_11_06.py   (idempotent)"""
import json, os, re, glob
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
P = os.path.join(ROOT, 'docs', 'decisions.json')
s = open(P, encoding='utf-8').read()
K = json.load(open(os.path.join(ROOT, 'docs', 'balance', 'eng26-kraal-2026-11-06.json'), encoding='utf-8'))
sm = {x['map']: x for x in K['summary']}
sv, cn = sm['Savanna Reaches'], sm['The Canopy']
def canon(tag):
    f = sorted(glob.glob(os.path.join(ROOT, 'docs', 'balance', 'skill-canon-eng26-bloom-%s-b15-*.json' % tag)))
    if not f: return None
    t = json.load(open(f[-1], encoding='utf-8'))['test']; w = t['worthStat']
    return '%.2f [%.2f, %.2f]' % (w['m'], w['lo'], w['hi']), t['price']
kill, day = canon('kill'), canon('day')
meas = ('Measured (canon tool, bramble 15, 1,000 fights, stat yardstick): Bloom {Kill} %s against a formula price %.1f; Bloom {Day} %s against %.1f. '
        % (kill[0], kill[1], day[0], day[1])) if kill and day else 'Measure pending. '
items = [
 {"id": "ENG26-1", "status": "DONE", "kind": "Decide", "area": "Skills", "group": "game", "asked": "2026-11-06", "title": "Bloom grows stronger: how copies are counted",
  "body": "Built: each bloom that lands for a side in a fight adds 1 to that side's count; the Nth copy gets +N/+N. Pond Algae 1/7: first copy 2/8, next 3/9 (your example). The side's Bloom units share the count. A bloom waiting for room does not count. Each fight starts at 0.",
  "options": ["a) Per side, per fight (built).", "b) Per Bloom unit: each unit's own 1st, 2nd copy."], "default": "a",
  "answer": "Claude's call: a), the brief's per side and per match; with one Bloom card it is exactly your example.", "source": "ENG26"},
 {"id": "ENG26-2", "status": "DONE", "kind": "Decide", "area": "Skills", "group": "game", "asked": "2026-11-06", "title": "Undead: heals hurt, cures bleed",
  "body": "Built: Undead = species or subtype Undead, or back as a token by its Undead skill (not Changelings). A heal deals its amount as damage, even at full Health; its own Regeneration still heals (Obsidian Lich). A cure or cleanse that would take something off gives Bleed instead: the cure's N (Cure 2: Bleed 2), 1 for Renewal or a Cleanse with no number. Nothing to take off: nothing happens.",
  "options": ["a) As built.", "b) Always Bleed 1.", "c) Its own Regeneration hurts too."], "default": "a", "answer": "Claude's call: a).", "source": "ENG26"},
 {"id": "ENG26-3", "status": "YET", "kind": "Decide", "area": "Budget", "group": "game", "asked": "2026-11-06", "title": "Bloom's price after it escalates",
  "body": meas + "The price is a bramblewood-budget.js formula, unchanged. Its own escalation (x1.5 on the copy's part) would move Night Algae 102 -> 115%, Pond Algae 97 -> 102%, the other four 2-4 points.",
  "options": ["a) Apply the x1.5 (one budget line), no stats changed.", "b) Price Bloom from the measure (much lower).", "c) Leave it."], "default": "a", "source": "ENG26"},
 {"id": "ENG26-4", "status": "DONE", "kind": "Decide", "area": "Brambles", "group": "game", "asked": "2026-11-06", "title": "Leader bramble: defence is Health",
  "body": "Your +2/+3 reads as the game's Attack/Health, so Banner Knoll gives your Leader +2 Attack and +3 Health as it takes the field (summoned, or a Leader card from the hand). +3 Armor would be far stronger.",
  "options": ["a) +2 Attack / +3 Health (built).", "b) +2 Attack / +3 Armor."], "default": "a", "answer": "Claude's call: a).", "source": "ENG26"},
 {"id": "ENG26-5", "status": "YET", "kind": "Decide", "area": "Brambles", "group": "game", "asked": "2026-11-06", "title": "Where Banner Knoll is earned",
  "body": "Banner Knoll (🚩, 22 Health, Rare) is open to every player now and on no road fight. Two homes with led fights: Savanna Reaches (14-5 and 14-6 have leaders) or Wolfsbane Tundra (17-5 Musk Ox Bulwark is led).",
  "options": ["a) Unlocked by beating Savanna Reaches' boss.", "b) A Wolfsbane Tundra drop.", "c) Keep it open to everyone."], "default": "a", "source": "ENG26"},
]
for x in items: x.setdefault('group', 'game')  # hubdec1: every item has a group
bal = ("Owner 11-06 09:29: \"Resources are scary. So maybe instead, Lumber 1, Attack +3 (first unit)\". Built (ENG26): start Lumber 3 -> 1, first unit +3 kept. "
       "200 games: Savanna Reaches mean gap %s -> %s (%d/8 in band), The Canopy %s -> %s (%d/5; its fights also play a level above the reference)."
       % (sv['meanGapBefore'], sv['meanGapAfter'], sv['inBandAfter'], cn['meanGapBefore'], cn['meanGapAfter'], cn['inBandAfter']))
lines = s.split('\n')
out = []
for ln in lines:
    m = re.match(r'\s*\{"id": "([^"]+)"', ln)
    if m and m.group(1).startswith('ENG26-'): continue
    if m and m.group(1) == 'BAL19-2':
        d = json.loads(ln.strip().rstrip(','))
        d['status'] = 'DONE'; d['answer'] = bal
        ln = '    ' + json.dumps(d, ensure_ascii=False) + (',' if ln.rstrip().endswith(',') else '')
    out.append(ln)
s = '\n'.join(out)
i = s.index('"items": [') + len('"items": [')
s = s[:i] + '\n' + '\n'.join('    ' + json.dumps(x, ensure_ascii=False) + ',' for x in items) + s[i:]
s = re.sub(r'"updated": "[^"]+"', '"updated": "2026-11-06"', s, count=1)
json.loads(s)
for x in items:
    w = len((x['body'] + ' ' + ' '.join(x['options'])).split()); assert w < 100, (x['id'], w)
open(P, 'w', encoding='utf-8').write(s)
print('ok: BAL19-2 DONE, ENG26-1..5')
