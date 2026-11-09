#!/usr/bin/env python3
"""BAL34 (2026-11-10): two decided skill prices applied to canonical/skill-costs.json (old fields kept in bal34Was, as BAL32 did).

1. Dive, from the 1,000-fight measure (docs/balance/pipeline/measure-2026-11-09-2259.json; the carriers and the paired design are
   docs/balance/bal33/dive-measure-2026-11-09.json's: each canon carrier given Flying or Tide, with and without Dive, on the same fights).
   Dive worth on a base = worth(base + Dive) - worth(base); the price is the mean over the Flying and Tide bases. The engine adds + N to the
   strike for Dive N and + 0 for plain Dive (bramblewood-engine.js eng32DiveBonus), so plain Dive is Dive 0 and the line through the two
   readings is  Dive N = plain + perN x N,  perN = (Dive 2 - plain) / 2.  dive (fixed) = plain, diveBonus (scale n) = perN, each to 0.05.
2. Bulwark 6.65 x N^0.47 -> 6.3 x N^0.47 (decision ENG40-2 a: ENG40's Log Walls average 0/4.5 over Levels 1-10, so BAL30's x1.08 becomes x1.03).

Usage: python3 tools/bal34/reprice_2026_11_10.py [--apply]  -> docs/balance/bal34/reprice-2026-11-10.json; --apply writes the table."""
import json, os, re, sys
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..')
P = lambda *a: os.path.join(ROOT, *a)
J = lambda f: json.load(open(P(f), encoding='utf-8'))
r2 = lambda v: round(v + 0.0, 2)
r05 = lambda v: round(round(v * 20) / 20, 2)

M = J('docs/balance/pipeline/measure-2026-11-09-2259.json')
worth = {}
for c in M['changed']:
    m = re.match(r'(-?[\d.]+) \[(-?[\d.]+), (-?[\d.]+)\] at (\d+) fights', c['new'])
    worth[c['id'].split(':', 1)[1]] = {'m': float(m.group(1)), 'lo': float(m.group(2)), 'hi': float(m.group(3)), 'fights': int(m.group(4))}
diff = {b: {'plain': r2(worth[b + '+dive']['m'] - worth[b]['m']), 'dive2': r2(worth[b + '+dive=2']['m'] - worth[b]['m'])} for b in ('flying', 'tide')}
plain = sum(d['plain'] for d in diff.values()) / 2
dive2 = sum(d['dive2'] for d in diff.values()) / 2
perN = (dive2 - plain) / 2
NEW = {
    'dive': {'value': r05(plain), 'why': f"the 1,000-fight Dive measure (Flying / Tide bases, paired): plain Dive {r2(plain)} (Flying {diff['flying']['plain']}, Tide {diff['tide']['plain']}), Dive 2 {r2(dive2)} (Flying {diff['flying']['dive2']}, Tide {diff['tide']['dive2']}); plain Dive is Dive 0 (+ 0 on the strike), so Dive N = {r05(plain)} + {r05(perN)} N: Dive 1 {r2(r05(plain) + r05(perN))}, Dive 2 {r2(r05(plain) + 2 * r05(perN))}, Dive 3 {r2(r05(plain) + 3 * r05(perN))}. Was -1 + 0.5 N (ENG32's 4-round rule). docs/balance/pipeline/measure-2026-11-09-2259.json"},
    'diveBonus': {'value': r05(perN), 'why': f"Dive N's + N on the strike, measured: (Dive 2 {r2(dive2)} - plain {r2(plain)}) / 2 = {r2(perN)} a point (was 0.5 by the 4-round rule)"},
    'bulwark': {'value': 6.3, 'why': "decision ENG40-2 a: ENG40's Log Walls are 0/4 at Levels 1-6, 0/5 at 7-9, 0/6 at 10 (average 0/4.5, was 0/5.7), so BAL30's x1.08 over the measured 0/4 wall (6.16 x N^0.47) becomes x1.03: 6.3 x N^0.47"},
}
TAG = '2026-11-10 (package BAL34): {}'
out = {'when': '2026-11-10', 'package': 'BAL34', 'measure': 'docs/balance/pipeline/measure-2026-11-09-2259.json', 'worth': worth, 'diveWorth': diff,
       'dive': {'plain': r2(plain), 'dive2': r2(dive2), 'perN': r2(perN), 'price': {'dive': NEW['dive']['value'], 'diveBonus': NEW['diveBonus']['value']}},
       'bulwark': {'value': 6.3, 'pow': 0.47}, 'changes': {}}

lines = open(P('canonical/skill-costs.json'), encoding='utf-8').read().split('\n')
outl, section, done = [], None, []
for line in lines:
    s = line.rstrip(',')
    if line.startswith(' "') and not line.startswith('  '):
        section = line.split('"')[1]
    if section == 'skills' and s.startswith('  {"id":"'):
        e = json.loads(s)
        if e['id'] in NEW:
            old = {k: e[k] for k in ('scale', 'value', 'pow', 'plus') if k in e}
            ne = {}
            for k, v in e.items():
                if k in ('bal34', 'bal34Was'):
                    continue
                ne[k] = NEW[e['id']]['value'] if k == 'value' else v
            ne['bal34'] = TAG.format(NEW[e['id']]['why'])
            ne['bal34Was'] = old
            out['changes'][e['id']] = {'old': old, 'new': {k: ne[k] for k in ('scale', 'value', 'pow', 'plus') if k in ne}}
            done.append(e['id'])
            line = '  ' + json.dumps(ne, ensure_ascii=False, separators=(',', ':')) + (',' if line.endswith(',') else '')
    outl.append(line)
assert sorted(done) == sorted(NEW), done
os.makedirs(P('docs/balance/bal34'), exist_ok=True)
json.dump(out, open(P('docs/balance/bal34/reprice-2026-11-10.json'), 'w', encoding='utf-8'), indent=1, ensure_ascii=False)
print(json.dumps(out['dive']), json.dumps(out['changes']))
if '--apply' in sys.argv:
    open(P('canonical/skill-costs.json'), 'w', encoding='utf-8').write('\n'.join(outl))
    print('applied', done)
