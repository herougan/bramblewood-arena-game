#!/usr/bin/env python3
"""ANIM1 (2026-11-03): which engine event types does the front end never mention outside the log-line text? (static check; review only)
An event type counts as "handled" when a non-engine game script mentions it as a quoted name in a place other than the plain log text (case 'x': return {cls:..., text:...}).
Prints each unhandled type with its engine count and, for the handled ones, how many places mention it."""
import re, os, glob
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
eng = open(os.path.join(ROOT, 'bramblewood-engine.js'), encoding='utf-8').read()
types = {}
for m in re.finditer(r"type:\s*'([A-Za-z]+)'", eng): types[m.group(1)] = types.get(m.group(1), 0) + 1
files = [f for f in glob.glob(os.path.join(ROOT, '*.js')) if os.path.basename(f) not in ('bramblewood-engine.js', 'bramblewood-texts.js', 'gsap.min.js', 'supabase.umd.js', 'Flip.min.js')]
src = {os.path.basename(f): open(f, encoding='utf-8', errors='ignore').read() for f in files}
rows = []
for t, n in sorted(types.items()):
    pat = re.compile(r"""(?:type\s*===?\s*|case\s+|\.type\s*==\s*|\[\s*)['"]%s['"]|['"]%s['"]\s*[:,\]]""" % (t, t))
    hits = {}
    for fn, s in src.items():
        c = len(pat.findall(s))
        if c: hits[fn] = c
    # in arena_app.js, hits that are only the log-line case (line has 'return {cls') do not count
    log_only = 0
    if 'arena_app.js' in hits:
        for line in src['arena_app.js'].splitlines():
            if pat.search(line) and re.search(r"return\s*\{cls", line): log_only += 1
    fx = {k: v for k, v in hits.items()}
    if 'arena_app.js' in fx: fx['arena_app.js'] -= log_only
    fx = {k: v for k, v in fx.items() if v > 0}
    rows.append((t, n, fx, log_only))
print('engine event types:', len(rows))
print('\nNO front-end mention beyond the log line (candidates with no animation):')
for t, n, fx, lo in rows:
    if not fx: print(f'  {t:20} engine x{n}  log-line only: {bool(lo)}')
