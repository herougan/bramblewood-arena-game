#!/usr/bin/env python3
"""Package UI22 (2026-11-04): builds canonical/claude-new-cards.json, Claude's recommended cards per map for the Map cards window's
"Claude New" section (shown only; the game puts them on no list, pool, deck or count).
  theme5   {map id: [{id, why}]}    docs/balance/theme5/carried-picks-2026-11-03.json (THEME5-1's carried candidates)
  skillrec {map label: [{id, why}]} docs/skill-recommendations-2026-11-04.json (SKILLREC1 rows with one card id; label "5" or "5-A")
The window drops any card that is on one of the map's lists. Idempotent:  python3 tools/ui22_claude_new_2026_11_04.py"""
import json, os
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
out = {'_about': 'UI22 (2026-11-04): Claude\'s recommended cards per map, shown in the Map cards window as "Claude New" and put on no list. Built by tools/ui22_claude_new_2026_11_04.py.', 'theme5': {}, 'skillrec': {}}
t5 = json.load(open(os.path.join(ROOT, 'docs', 'balance', 'theme5', 'carried-picks-2026-11-03.json'), encoding='utf-8'))
for p in t5['picks']:
    out['theme5'].setdefault(p['map'], []).append({'id': p['card'], 'why': 'THEME5: ' + p.get('archetype', '')})
sr = json.load(open(os.path.join(ROOT, 'docs', 'skill-recommendations-2026-11-04.json'), encoding='utf-8'))
for r in sr['rows']:
    if r['change'] == 'remove' or ' ' in r['card'] or '/' in r['card']: continue
    out['skillrec'].setdefault(r['map'], []).append({'id': r['card'], 'why': 'SKILLREC1: ' + (r.get('recommended') or r['change'])})
with open(os.path.join(ROOT, 'canonical', 'claude-new-cards.json'), 'w', encoding='utf-8') as fh:
    json.dump(out, fh, ensure_ascii=False, indent=1); fh.write('\n')
print('theme5 maps', len(out['theme5']), 'skillrec labels', len(out['skillrec']))
