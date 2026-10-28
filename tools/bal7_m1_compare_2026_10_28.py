#!/usr/bin/env python3
# Package BAL7 (2026-10-28, M1): the re-balanced cards' contribution before -> after (tools/balance/contribution.js runs
# 2026-10-28-bal7-before and -after, 70,000 fights each, seed bal6), written to docs/balance/bal7-m1-compare-2026-10-28.json and printed.
import json, os, statistics
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
J = lambda f: json.load(open(os.path.join(ROOT, f)))
B = J('docs/balance/contribution-2026-10-28-bal7-before.json')['analysis']
A = J('docs/balance/contribution-2026-10-28-bal7-after.json')['analysis']
b = {r['id']: r for r in B['cards']}; a = {r['id']: r for r in A['cards']}
plan = J('docs/balance/bal7-m1-rebalance-2026-10-28.json')['plan']
rows = []
for x in plan:
    rb, ra = b.get(x['id']), a.get(x['id'])
    if not rb or not ra: continue
    sk = x.get('skill') or {}
    rows.append({'id': x['id'], 'name': x['name'], 'rarity': x['rarity'], 'moved': bool(x.get('move')), 'from': x.get('from'), 'to': x.get('to') if x.get('move') else None,
                 'skill': ('%s %s -> %s' % (sk['key'], sk['from'], sk['to'])) if sk else None, 'why': x.get('why'),
                 'contribution': [round(rb['contribution'] * 100, 1), round(ra['contribution'] * 100, 1)], 'vsBand': [round(rb['vsBand'] * 100, 1), round(ra['vsBand'] * 100, 1)],
                 'ci95': [round(1.96 * rb['contributionSE'] * 100, 1), round(1.96 * ra['contributionSE'] * 100, 1)]})
mv = [r for r in rows if r['moved']]
out = {'_about': 'BAL7 M1: contribution before -> after (points; vsBand = minus the band median). python3 tools/bal7_m1_compare_2026_10_28.py',
       'confidence': {'before': {'reliability': B['reliability'], 'medianCI95': round(1.96 * B['medianSE'] * 100, 1)}, 'after': {'reliability': A['reliability'], 'medianCI95': round(1.96 * A['medianSE'] * 100, 1)}},
       'bandMedians': {'before': {k: round(v['median'] * 100, 1) for k, v in B['bands'].items()}, 'after': {k: round(v['median'] * 100, 1) for k, v in A['bands'].items()}},
       'movedMeanVsBand': [round(statistics.mean(r['vsBand'][0] for r in mv), 1), round(statistics.mean(r['vsBand'][1] for r in mv), 1)],
       'stillOver8': [r['id'] for r in mv if abs(r['vsBand'][1]) >= 8], 'overshot': [r['id'] for r in mv if r['vsBand'][1] <= -8],
       'outliersAfter': {'strong': sum(1 for r in A['cards'] if r['vsBand'] >= 0.08), 'weak': sum(1 for r in A['cards'] if r['vsBand'] <= -0.08)},
       'outliersBefore': {'strong': sum(1 for r in B['cards'] if r['vsBand'] >= 0.08), 'weak': sum(1 for r in B['cards'] if r['vsBand'] <= -0.08)},
       'newOutliers': sorted([(r['id'], round(r['vsBand'] * 100, 1)) for r in A['cards'] if abs(r['vsBand']) >= 0.08 and abs(b[r['id']]['vsBand']) < 0.08], key=lambda t: -abs(t[1])),
       'rows': rows}
json.dump(out, open(os.path.join(ROOT, 'docs/balance/bal7-m1-compare-2026-10-28.json'), 'w'), indent=1)
for r in rows:
    print('%-24s %-9s %6s -> %-6s %-20s contribution %5.1f -> %5.1f   vs band %5.1f -> %5.1f' % (r['id'], r['rarity'], r['from'] or '', r['to'] or '(kept)', r['skill'] or '', *r['contribution'], *r['vsBand']))
for k in ['confidence', 'bandMedians', 'movedMeanVsBand', 'stillOver8', 'overshot', 'outliersBefore', 'outliersAfter', 'newOutliers']:
    print(k, out[k])
