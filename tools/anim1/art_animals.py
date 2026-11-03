#!/usr/bin/env python3
"""ANIM1 (2026-11-03): prints animal / rarity for the cards named on the command line (review aid)."""
import json, os, sys
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
c = {x['id']: x for x in json.load(open(os.path.join(ROOT, 'canonical', 'cards.json'), encoding='utf-8'))}
for i in sys.argv[1:]:
    d = c.get(i); print(i, (d.get('animal'), d.get('name'), d.get('rarity'), d.get('species')) if d else None)
