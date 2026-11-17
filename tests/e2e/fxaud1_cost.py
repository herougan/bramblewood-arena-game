#!/usr/bin/env python3
"""FXAUD1: medians over docs/perf/fxaud1/top-{1x,4x}-N.json of main-thread CPU ms per event (script + layout + style, minus nothing; idle median shown),
the sync ms of the renderVfxForEvent call, and the longest long task. Writes docs/perf/fxaud1/cost-table.md."""
import json, glob, os, statistics
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
def load(cpu):
    fs = sorted(glob.glob(os.path.join(ROOT, f'docs/perf/fxaud1/top-{cpu}x-*.json'))); runs = [json.load(open(f))['events'] for f in fs]; return runs
R = {1: load(1), 4: load(4)}
keys = [k for k in R[1][0] if not k.startswith('__')]
def med(runs, k, f): return statistics.median(f(r[k]) for r in runs if k in r and 'script' in r[k])
cpu = lambda v: v['script'] + v['layout'] + v['style']
idle = {c: statistics.median(cpu(v) for r in R[c] for k, v in r.items() if k.startswith('__')) for c in (1, 4)}
rows = []
for k in keys:
    rows.append((k, med(R[1], k, cpu), med(R[4], k, cpu), med(R[1], k, lambda v: v['sync']), med(R[4], k, lambda v: v['sync']), max(max(r[k]['lt'] or [0]) for r in R[4] if k in r), [round(cpu(r[k])) for r in R[4] if k in r]))
rows.sort(key=lambda r: -r[2])
lines = [f'idle window (1.1 s, nothing playing): {idle[1]:.0f} ms at 1x, {idle[4]:.0f} ms at 4x (median CPU script+layout+style)', '',
         '| event | CPU 1x | CPU 4x | call 1x | call 4x | longest long task 4x | 4x runs |', '|---|---|---|---|---|---|---|']
for r in rows: lines.append(f'| {r[0]} | {r[1]:.0f} | {r[2]:.0f} | {r[3]:.1f} | {r[4]:.1f} | {r[5]} | {r[6]} |')
open(os.path.join(ROOT, 'docs/perf/fxaud1/cost-table.md'), 'w').write('\n'.join(lines) + '\n'); print('\n'.join(lines[:34]))
