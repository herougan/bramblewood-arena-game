#!/usr/bin/env python3
"""Refresh .fxcat/fx-src.js from arena_app.js: every top-level `function name(` / `const name =`
block in fx-src is replaced by the current block of the same name in the game, found by brace
matching (strings, template literals and comments are skipped). Prints what changed.
    python3 tools/effects-lab/sync_fx_src.py"""
import re, os, sys
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
app = open(os.path.join(ROOT, 'arena_app.js'), encoding='utf-8').read()
fxp = os.path.join(ROOT, '.fxcat', 'fx-src.js'); fx = open(fxp, encoding='utf-8').read()

def block_end(src, i):
    """Index just past the declaration starting at i: its first '{' matched, plus a trailing
    `)();` or `;` for const IIFEs/objects. Skips strings, template literals (with nested ${}) and comments."""
    nl = src.find('\n', i)
    if '{' not in src[i:nl]: return nl  # one-line declaration (e.g. const f = ()=> expr;)
    k = src.index('{', i); stack = []  # 'b' = brace, 't' = inside template-literal text
    while k < len(src):
        c = src[k]
        if stack and stack[-1] == 't':
            if c == '\\': k += 2; continue
            if c == '`': stack.pop()
            elif src.startswith('${', k): stack.append('b'); k += 1
            k += 1; continue
        if c in '"\'':
            k += 1
            while src[k] != c: k += 2 if src[k] == '\\' else 1
        elif c == '`': stack.append('t')
        elif src.startswith('//', k): k = src.index('\n', k)
        elif src.startswith('/*', k): k = src.index('*/', k) + 1
        elif c == '{': stack.append('b')
        elif c == '}':
            stack.pop()
            if not stack:
                e = k + 1
                if src.startswith('const', i):
                    m = re.match(r'\)\(\)\s*;?|;', src[e:])
                    if m: e += m.end()
                return e
        k += 1
    raise ValueError('unbalanced')

decl = re.compile(r'^(?:function\s+(\w+)\s*\(|const\s+(\w+)\s*=\s*(?:\(\s*\(\s*\)\s*=>\s*\{|\{|\(\))|async function\s+(\w+)\s*\()', re.M)
changed = []
for m in list(decl.finditer(fx))[::-1]:
    name = m.group(1) or m.group(2) or m.group(3)
    try: fe = block_end(fx, m.start())
    except Exception: continue
    am = re.search(r'^(?:async\s+)?(?:function\s+' + name + r'\s*\(|const\s+' + name + r'\s*=)', app, re.M)
    if not am: continue
    try: ae = block_end(app, am.start())
    except Exception as e: print('skip', name, e); continue
    new = app[am.start():ae]
    if new != fx[m.start():fe]:
        fx = fx[:m.start()] + new + fx[fe:]; changed.append(name)
open(fxp, 'w', encoding='utf-8').write(fx)
print('updated:', ', '.join(changed[::-1]) or 'nothing')
