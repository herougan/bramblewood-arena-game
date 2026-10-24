#!/usr/bin/env python3
"""Package BAL2 (2026-10-24): the road win rates of Maps 0-24 against roadCurveTarget, before and after BAL2, as markdown.
Inputs: two `node tools/skirmish_pass.js measure 100 --main --tag=<tag>` files (docs/balance/skirmish-pass-<tag>.jsonl); the 'before' one was
measured on the commit before BAL2 (a copy of its files, same tool, same seeds).
  python3 tools/bal2_road_report_2026_10_24.py <before.jsonl> <after.jsonl>  > docs/balance/bal2-road-2026-10-24.md"""
import json, sys
from collections import defaultdict
def rd(p): return [json.loads(l) for l in open(p) if l.strip()]
before, after = rd(sys.argv[1]), rd(sys.argv[2])
B = {(r['map'], r['key']): r for r in before}
by = defaultdict(list)
for r in after: by[r['mapNo']].append(r)
out = ['# The road after BAL2 (Maps 0-24)', '',
       'Win rate of the reference deck (the game\'s own, `referenceDeckFor` at `referencePlayerLevel`) over 100 games a fight, against each fight\'s road-curve target (`roadCurveTarget`, green = target +/- 8 points; a boss 30-49%). Before = the commit before BAL2, the same tool and seeds. `node tools/skirmish_pass.js measure 100 --main --tag=bal2-2026-10-24`; this file: `python3 tools/bal2_road_report_2026_10_24.py`.', '',
       '| Map | Name | Fights | Green before | Green after | Too easy after | Too hard after | Mean win before | Mean win after | Mean target |', '|---|---|---|---|---|---|---|---|---|---|']
tot = defaultdict(int)
for m in sorted(by):
    rs = by[m]; bs = [B.get((r['map'], r['key'])) for r in rs]
    g = lambda xs, k: sum(1 for x in xs if x and x.get('green') == k)
    mw = lambda xs: sum(x['win'] for x in xs if x) / max(1, len([x for x in xs if x]))
    row = (len(rs), g(bs, 'green'), g(rs, 'green'), g(rs, 'easy'), g(rs, 'hard'))
    for k, v in zip(('n', 'gb', 'ga', 'e', 'h'), row): tot[k] += v
    out.append(f"| {m} | {rs[0]['mapName']} | {row[0]} | {row[1]} | {row[2]} | {row[3]} | {row[4]} | {mw(bs):.0f}% | {mw(rs):.0f}% | {sum(r['target'] for r in rs) / len(rs):.0f}% |")
out.append(f"| | **Maps 0-24** | {tot['n']} | **{tot['gb']}** | **{tot['ga']}** | {tot['e']} | {tot['h']} | | | |")
out += ['', '## Every fight', '', '| Fight | Kind | Target (band) | Before | After |', '|---|---|---|---|---|']
for m in sorted(by):
    for r in by[m]:
        b = B.get((r['map'], r['key']))
        out.append(f"| {r['code']} {r['name']} | {r['kind']} | {r['target']:.0f} ({r['lo']:.0f}-{r['hi']:.0f}) | {b['win'] if b else '-'}% | {r['win']}% {'' if r.get('green') == 'green' else '(' + r.get('green', '') + ')'} |")
print('\n'.join(out))
