#!/usr/bin/env python3
"""2026-11-04 (coordinator, after ENG22): the Fortify log line's pack row was keyed with its 🏯 emoji, but the translator matches the
template's core text (emoji stripped; tests/i18n-templates-2026-10-18.js). Add the core-keyed row from each pack's existing translation.
    python3 tools/i18n_2026_11_04_fortify_core.py"""
import json, os
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
SRC, CORE = '🏯 {name} fortifies its bramble: {x}.', '{name} fortifies its bramble: {x}.'
for c in ['fr', 'de', 'es', 'it', 'pt', 'tl', 'ta', 'id', 'zh-Hans', 'zh-Hant', 'ja', 'ko']:
    p = os.path.join(ROOT, 'lang', c + '.json'); raw = open(p, encoding='utf-8').read(); d = json.loads(raw)
    v = d.get(SRC)
    if v and CORE not in d:
        d[CORE] = v[2:].lstrip() if v.startswith('🏯') else v
        open(p, 'w', encoding='utf-8').write(json.dumps(d, ensure_ascii=False, indent=1 if raw.startswith('{\n "') else 2) + '\n')
    print(c, d.get(CORE))
