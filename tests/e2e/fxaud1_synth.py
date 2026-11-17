#!/usr/bin/env python3
"""FXAUD1: build one test event for every event literal in bramblewood-engine.js ({type:'x', ...}) so the browser probe can play each through
renderVfxForEvent. Literal string values stay; uids become the fixture board's (token 'UID:A0' ...); other values get plain numbers. Writes
docs/perf/fxaud1/event-synth.json  {key: event}  (key = type|kind|field|element|cause)."""
import re, json, os
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
src = open(os.path.join(ROOT, 'bramblewood-engine.js')).read()
out = {}
def balanced(s, i):
    d = 0; q = None
    for j in range(i, len(s)):
        c = s[j]
        if q:
            if c == '\\': continue
            if c == q: q = None
            continue
        if c in '\'"`': q = c
        elif c in '{[(': d += 1
        elif c in '}])':
            d -= 1
            if d == 0: return j
    return -1
def top_pairs(body):
    parts = []; d = 0; q = None; cur = ''
    for c in body:
        if q:
            cur += c
            if c == q: q = None
            continue
        if c in '\'"`': q = c; cur += c; continue
        if c in '{[(': d += 1
        if c in '}])': d -= 1
        if c == ',' and d == 0: parts.append(cur); cur = ''
        else: cur += c
    parts.append(cur); return parts
for m in re.finditer(r"\{\s*type:\s*'([A-Za-z0-9_]+)'", src):
    st = m.start(); en = balanced(src, st)
    if en < 0 or en - st > 900: continue
    ev = {}
    for p in top_pairs(src[st + 1:en]):
        p = p.strip()
        if not p: continue
        mm = re.match(r"([A-Za-z0-9_]+)\s*:\s*(.*)$", p, re.S)
        if mm: k, v = mm.group(1), mm.group(2).strip()
        else: k, v = p, '1'
        sm = re.fullmatch(r"'([^']*)'", v)
        if sm: ev[k] = sm.group(1)
        elif re.fullmatch(r"-?\d+(\.\d+)?", v): ev[k] = float(v) if '.' in v else int(v)
        elif v in ('true', 'false'): ev[k] = v == 'true'
        elif re.search(r"[uU]id$", k): ev[k] = 'UID'
        elif re.search(r"[uU]ids$", k): ev[k] = ['UID']
        elif k in ('side', 'targetSide', 'fromSide', 'by', 'who') and not sm: ev[k] = 'A'
        elif k.endswith('DefId') or k == 'defId': ev[k] = 'DEF'
        elif k in ('kind', 'field', 'element', 'cause', 'status', 'lane'): ev[k] = 'x'
        elif v.startswith('['): ev[k] = []
        elif v.startswith('{'): ev[k] = {}
        else: ev[k] = 2
    key = '|'.join(str(ev[k]) for k in ('type', 'kind', 'field', 'element', 'cause') if k in ev and ev[k] not in ('x',))
    if 'kind' in ev and ev['kind'] == 'x' and ev['type'] == 'statusFx': continue  # dynamic kinds come from the sampled battles
    out.setdefault(key, ev)
json.dump(out, open(os.path.join(ROOT, 'docs/perf/fxaud1/event-synth.json'), 'w'), indent=0)
print(len(out), 'synthetic events')
