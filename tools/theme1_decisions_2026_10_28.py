#!/usr/bin/env python3
"""THEME1 (2026-10-28): adds the owner call THEME1-1 to docs/decisions.json (one line at the top of items; run once, it skips if present).
The numbers come from docs/balance/theme1-proposal-2026-10-28.json (tools/theme1_proposal_2026_10_28.py)."""
import json, os
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
P = os.path.join(ROOT, 'docs', 'decisions.json')
T = json.load(open(os.path.join(ROOT, 'docs', 'balance', 'theme1-proposal-2026-10-28.json'), encoding='utf-8'))
t = T['totals']
ask = [x['name'] for x in T['sideClasses'] if x['class'] == 'ask']
packs = '; '.join('%s %d of %d on a list' % (p['name'], p['unique'], p['cards']) for p in T['packs'] if p['tier'] in (1, 2, 3, 4))
item = {
    'id': 'THEME1-1', 'status': 'YET', 'kind': 'Decide', 'area': 'Maps',
    'title': 'Approve the per-map proposal (whole / with changes)',
    'asked': '2026-10-28',
    'body': ('Steps 1 and 2 of the balancing plan (10-28 21:40): each card gets one map home by theme, each main map keeps 8 unique cards plus 3 carried '
             '(11 in all), each side map 1-3 unique (owner 21:49) plus carried and parent-map cards, and each map has at least one cost generator and one '
             'high-cost card. Lists %d -> %d entries; %d different cards on a list (%d unique homes, %d of them skirmish rewards). The packs: %s. '
             '%d pack cards (Packs 1-4) become pack only, and %d creatures with no source stay with no home. Side maps to call (delve = 3 unique, '
             'challenges = 1): %s are "ask owner" (2 for now). Hand calls: the Beaver Lumberjack to Map 0 (Stockpile, its generator), the Ore-Smelter '
             'Mole and the Anvilwhisker Otter to the Basalt Foundry (Metal). Nothing applied: docs/balance/theme1-proposal-2026-10-28.md and the hub\'s '
             'Map cards tab (Proposal).') % (t['entriesNow'], t['entriesProposed'], t['onAnyList'], t['uniqueProposed'], t['rewards'], packs,
                                            t['packOnly'], t['noHome'], ', '.join(ask)),
    'options': ['Approve the whole proposal', 'Approve with changes (name them: moves, side-map calls, caps)', 'Not yet'],
    'default': 'Not yet'}
lines = open(P, encoding='utf-8').read().split('\n')
if any('"id": "THEME1-1"' in l for l in lines):
    print('THEME1-1 already there')
else:
    i = next(n for n, l in enumerate(lines) if l.strip() == '"items": [')
    lines.insert(i + 1, '    ' + json.dumps(item, ensure_ascii=False) + ',')
    open(P, 'w', encoding='utf-8').write('\n'.join(lines))
    json.load(open(P, encoding='utf-8'))
    print('added THEME1-1')
