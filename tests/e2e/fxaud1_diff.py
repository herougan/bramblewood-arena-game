#!/usr/bin/env python3
"""FXAUD1: which event types / statusFx kinds the engine source names but the sampled battles never produced (and the reverse)."""
import json, re, os
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
d = json.load(open(os.path.join(ROOT, 'docs/perf/fxaud1/event-samples.json')))
keys = set(d['samples'])
src = open(os.path.join(ROOT, 'bramblewood-engine.js')).read()
st = set(re.findall(r"type: ?'([A-Za-z0-9_]+)'", src)); sk = set(re.findall(r"kind: ?'([A-Za-z0-9_]+)'", src))
types = {k.split('|')[0] for k in keys}; kinds = {k.split('|')[1] for k in keys if k.startswith('statusFx|')}
print('types named in engine, not sampled:', sorted(st - types))
print('kinds named in engine, not sampled:', sorted(sk - kinds))
print('kinds sampled, not named literally:', sorted(kinds - sk))
print('field keys:', sorted(k for k in keys if k.startswith('fieldTick') or k.startswith('fieldSet')))
print('ENG50:', sorted(k for k in keys if re.search(r'owder|weaken|rend|grant|nfeeble|uln|eeble|rmour|stunOnHit', k)))
