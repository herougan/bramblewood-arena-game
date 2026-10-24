#!/usr/bin/env python3
"""EN7 (2026-10-24, owner 13:12 #3: "like pokemon, Flying x Dive ... similar story for Tide x Dive"): Dive on two thematic cards that are
already placed (no new source), re-fitted to the budget by the new Dive price (tools/en7_skill_costs_2026_10_24.py, 1.25 x N^0.5):
  Puffin Diver (common, Flying + Tide, Map 3's 3-2 reward): Dive 2, 2/6 -> 2/5 (2A+H+S 16.77 of N 17.69); a Flyer, so it goes aloft.
  Harbor Seal (common, Tide + Evasive, pack tier 3 on m6): Dive 2, 1/10 -> 1/9 (19.77 of N 19.96); no wings, so it goes under.
Re-running sets the same values.
  python3 tools/en7_cards_2026_10_24.py"""
import json, os
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
PATH = os.path.join(ROOT, 'canonical', 'cards.json')
CH = {'puffin-diver': (2, 5, 2, 'aloft'), 'harbor-seal': (1, 9, 2, 'under')}
d = json.load(open(PATH, encoding='utf-8'))
for c in d:
    ch = CH.get(c.get('id'))
    if not ch: continue
    a, h, n, how = ch
    c['attack'], c['health'] = a, h
    c.setdefault('effects', {})['dive'] = n
    note = '2026-10-24 (package EN7, owner 13:12 #3): Dive %d (it dives in two turns: %s, then the strike); %d/%d by the new Dive price.' % (n, how, a, h)
    cn = c.get('creatorNote') or ''
    if 'package EN7' not in cn: c['creatorNote'] = (cn + ' ' + note).strip()
open(PATH, 'w', encoding='utf-8').write(json.dumps(d, indent=2) + '\n')
print('wrote', PATH, ', '.join(CH))
