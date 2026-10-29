#!/usr/bin/env python3
"""THEME2 (2026-10-28): points owner call THEME1-1 in docs/decisions.json at the THEME2 proposal (owner 10-28 22:47 sizes). Rewrites that item's
body only (its line in place; status stays YET). The numbers come from docs/balance/theme2-proposal-2026-10-28.json (tools/theme2_proposal_2026_10_28.py).
Re-runnable."""
import json, os
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
P = os.path.join(ROOT, 'docs', 'decisions.json')
T = json.load(open(os.path.join(ROOT, 'docs', 'balance', 'theme2-proposal-2026-10-28.json'), encoding='utf-8'))
t = T['totals']
ask = [x['name'] for x in T['sideClasses'] if x['class'] == 'ask']
packs = '; '.join('%s %d of %d on a list' % (p['name'], p['unique'] + p['carriedOnly'], p['cards']) for p in T['packs'] if p['tier'] in (1, 2, 3, 4))
mains = [e for e in T['maps'] if not e['skipped'] and not e['sub']]
subs = [e for e in T['maps'] if not e['skipped'] and e['sub']]
rng = lambda es: '-'.join(dict.fromkeys(str(f(e['counts']['proposed'] for e in es)) for f in (min, max)))
flags = '; '.join('%s: %s' % (e['name'], ', '.join(e['mix']['flags'])) for e in T['maps'] if e.get('mix') and e['mix']['flags']) or 'none'
body = ('Now the THEME2 proposal (owner 10-28 22:47: "For main maps, there can be 8-11 cards + 4-5 carried over, 12-16 in total. Submaps would be 1-3 cards '
        '+ 10+ carried over, so 11-14. Don\'t worry about the other cards."). Steps 1 and 2 of the balancing plan: each card gets one map home by theme; '
        'each main map 8-11 unique (past 8 only strongly themed cards) plus 4-5 carried picked for the mix (a high-cost card, a generator, a creature), '
        '%s in all; each submap 1-3 unique plus 10 or more carried from the parent and earlier maps that fit it, %s in all; every list has a cost '
        'generator and a high-cost card. Lists %d -> %d entries; %d different cards on a list (%d of them skirmish rewards). The packs: %s. '
        '%d cards are on no list (simply listed, per old pack). Flags: %s. Submaps to call (delve = 3 unique, challenges = 1): %s are "ask owner" '
        '(2 for now). Hand calls: the Beaver Lumberjack to Map 0, the Ore-Smelter Mole and the Anvilwhisker Otter to the Basalt Foundry. '
        'Nothing applied: docs/balance/theme2-proposal-2026-10-28.md and the hub\'s Map cards tab (Proposal); THEME1\'s version stays as history.') % (
    rng(mains), rng(subs), t['entriesNow'], t['entriesProposed'], t['onAnyList'], t['rewards'], packs, t['offList'], flags, ', '.join(ask))
lines = open(P, encoding='utf-8').read().split('\n')
n = next(i for i, l in enumerate(lines) if '"id": "THEME1-1"' in l)
item = json.loads(lines[n].strip().rstrip(','))
item['body'] = body
item['status'] = 'YET'
item['options'] = ['Approve the whole proposal', 'Approve with changes (name them: moves, submap calls, sizes)', 'Not yet']
lines[n] = '    ' + json.dumps({**item, 'group': item.get('group', 'game')}, ensure_ascii=False) + (',' if lines[n].rstrip().endswith(',') else '')
open(P, 'w', encoding='utf-8').write('\n'.join(lines))
json.load(open(P, encoding='utf-8'))
print('THEME1-1 body now points at THEME2')
