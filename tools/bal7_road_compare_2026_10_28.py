#!/usr/bin/env python3
# Package BAL7 (2026-10-28): the road before -> after K14 (tools/skirmish_pass.js measure 40 --ref=map, seeds 9100 + 37g, tags bal7-k14-before /
# bal7-k14-after), the fights that moved most, and the ENG11-4 check (the cave fights: Map 8, 2-B, 7-A, 10-A; every Scorching fight) on both.
#   python3 tools/bal7_road_compare_2026_10_28.py  -> docs/balance/bal7-road-2026-10-28.json
import json, os, statistics, re
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
rd = lambda t: [json.loads(l) for l in open(os.path.join(ROOT, 'docs/balance/skirmish-pass-%s.jsonl' % t)) if l.strip()]
B = {r['key']: r for r in rd('bal7-k14-before')}; A = {r['key']: r for r in rd('bal7-k14-after')}
plan = {r['key']: r for r in json.load(open(os.path.join(ROOT, 'docs/balance/bal7-k14-plan-2026-10-28.json')))['rows']}
def summ(D, keys):
    rows = [D[k] for k in keys if k in D]
    cur = [r for r in rows if r.get('curve')]
    return {'fights': len(rows), 'meanWin': round(statistics.mean(r['win'] for r in rows), 1), 'curveFights': len(cur),
            'green': sum(1 for r in cur if r.get('green') == 'green'), 'tooEasy': sum(1 for r in cur if r.get('green') == 'easy'), 'tooHard': sum(1 for r in cur if r.get('green') == 'hard')}
keys = [k for k in B if k in A]
changed = [k for k in keys if plan.get(k, {}).get('changed')]
moved = sorted([{'key': k, 'name': A[k]['name'], 'map': A[k]['mapName'], 'kind': A[k]['kind'], 'before': B[k]['win'], 'after': A[k]['win'], 'delta': round(A[k]['win'] - B[k]['win'], 1),
                 'target': A[k].get('target'), 'band': [A[k].get('lo'), A[k].get('hi')], 'greenBefore': B[k].get('green'), 'greenAfter': A[k].get('green'), 'copiesMoved': plan[k].get('copiesMoved', 0)}
                for k in changed], key=lambda r: -abs(r['delta']))
# ENG11-4: the cave fights and the Scorching fights (fightRules heatwave by day; rules carried in the measure row's deck only, so the map list)
CAVE_MAPS = {'m4', 'mg', 'mz', 'mj'}  # Map 8 Caves & Alcoves, 2-B Smugglers' Grotto, 7-A the Mycelium Deep, 10-A the Sunken Depths
SCORCH_RE = re.compile(r'^(14-5|14-7|18-7|18-A-\d+|11-UC.*)$')
def check(sel):
    out = []
    for k in keys:
        r = A[k]
        if not sel(r): continue
        out.append({'key': k, 'name': r['name'], 'map': r['mapName'], 'before': B[k]['win'], 'after': r['win'], 'target': r.get('target'), 'lo': r.get('lo'), 'hi': r.get('hi'), 'green': r.get('green'),
                    'gap': None if r.get('target') is None else round(r['win'] - r['target'], 1)})
    return out
caves = check(lambda r: r['map'] in CAVE_MAPS)
scorch = check(lambda r: bool(SCORCH_RE.match(r['key'])))
out = {'_about': 'BAL7 (2026-10-28): the road before -> after K14 (map reference, 40 games a fight, seeds 9100 + 37g); ENG11-4 cave and Scorching check on the after run',
       'before': summ(B, keys), 'after': summ(A, keys), 'changedFights': {'before': summ(B, changed), 'after': summ(A, changed)}, 'moved': moved, 'eng11_4': {'caves': caves, 'scorching': scorch}}
json.dump(out, open(os.path.join(ROOT, 'docs/balance/bal7-road-2026-10-28.json'), 'w'), indent=1)
print('all fights', out['before'], '->', out['after'])
print('K14 fights', out['changedFights']['before'], '->', out['changedFights']['after'])
print('most moved:')
for m in moved[:15]: print('  %-8s %-26s %5.1f -> %5.1f (%+5.1f) target %s %s -> %s, %d copies' % (m['key'], m['name'][:26], m['before'], m['after'], m['delta'], m['target'], m['greenBefore'], m['greenAfter'], m['copiesMoved']))
for nm, L in [('caves', caves), ('scorching', scorch)]:
    print(nm, len(L))
    for r in L: print('  %-9s %-26s %5.1f -> %5.1f target %s [%s-%s] %s gap %s' % (r['key'], r['name'][:26], r['before'], r['after'], r['target'], r['lo'], r['hi'], r['green'], r['gap']))
