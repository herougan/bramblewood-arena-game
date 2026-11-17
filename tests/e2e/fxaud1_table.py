#!/usr/bin/env python3
"""FXAUD1: per event key, whether the probe saw a visual and a sound, which cues, and how many times the key's word appears in the client scripts
(0 = nothing in the client names it). Reads docs/perf/fxaud1/probe-1x.json; writes docs/perf/fxaud1/coverage-table.tsv and prints the silent rows."""
import json, os, glob, re, collections
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
d = json.load(open(os.path.join(ROOT, 'docs/perf/fxaud1/probe-1x.json'))); E = d['events']
idle = [v for k, v in E.items() if k.startswith('__idle')]
io = max(v['osc'] + v['src'] for v in idle); idle_cls = {c for v in idle for c in v.get('cls', [])}
words = collections.Counter()
for f in ['arena_app.js'] + sorted(glob.glob(os.path.join(ROOT, 'bramblewood-*.js'))):
    f = f if os.path.isabs(f) else os.path.join(ROOT, f)
    if f.endswith('bramblewood-engine.js') or f.endswith('bramblewood-texts.js'): continue
    for m in re.finditer(r"['\"`]([A-Za-z][A-Za-z0-9_]*)['\"`]|\b([A-Za-z][A-Za-z0-9_]*)\s*[:=]", open(f, errors='ignore').read()):
        words[m.group(1) or m.group(2)] += 1
rows = []
for k, v in sorted(E.items()):
    if k.startswith('__idle'): continue
    parts = k.split('|'); word = parts[1] if parts[0] in ('statusFx', 'fieldTick') and len(parts) > 1 else parts[0]
    vis = bool(set(v.get('cls', [])) - idle_cls) or v.get('peakGs', 0) > 0
    snd = bool(v.get('snd')) or v.get('osc', 0) + v.get('src', 0) > io
    rows.append((k, v.get('from'), 'V' if vis else '-', 'S' if snd else '-', ','.join(v.get('snd', [])), words[word], v.get('err') or ''))
with open(os.path.join(ROOT, 'docs/perf/fxaud1/coverage-table.tsv'), 'w') as f:
    f.write('key\tfrom\tvisual\tsound\tcues\tclient_refs\terr\n')
    for r in rows: f.write('\t'.join(map(str, r)) + '\n')
print('rows', len(rows), 'zero refs:', [r[0] for r in rows if r[5] == 0])
print('no visual:', [(r[0], r[1]) for r in rows if r[2] == '-'])
print('\nsilent (real samples):', [r[0] for r in rows if r[1] == 'sample' and r[3] == '-'])
print('\nsilent (synth shapes):', [r[0] for r in rows if r[1] == 'synth' and r[3] == '-'])
print('\nerrors:', [(r[0], r[6]) for r in rows if r[6]])
