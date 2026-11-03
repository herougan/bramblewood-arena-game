#!/usr/bin/env python3
"""ANIM1 (2026-11-03): statusFx kinds the engine emits that no front-end script mentions in a non-log place (static; review only)."""
import re, os, glob
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
eng = open(os.path.join(ROOT, 'bramblewood-engine.js'), encoding='utf-8').read()
kinds = sorted(set(re.findall(r"kind:\s*'([A-Za-z0-9]+)'", eng)))
skip = {'bramblewood-engine.js', 'bramblewood-texts.js', 'gsap.min.js', 'supabase.umd.js', 'Flip.min.js'}
lines = []
for f in glob.glob(os.path.join(ROOT, '*.js')):
    if os.path.basename(f) in skip: continue
    lines += open(f, encoding='utf-8', errors='ignore').read().splitlines()
blob_nolog = '\n'.join(l for l in lines if not re.search(r"return\s*\{cls", l))
blob_all = '\n'.join(lines)
none = []
for k in kinds:
    pat = re.compile(r"['\"]%s['\"]" % re.escape(k))
    if not pat.search(blob_nolog): none.append((k, bool(pat.search(blob_all))))
print(len(kinds), 'kinds;', len(none), 'with no mention outside a log line:')
for k, lg in none: print(f'  {k:20} log-line: {lg}')
