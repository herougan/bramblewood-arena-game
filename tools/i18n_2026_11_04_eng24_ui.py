#!/usr/bin/env python3
"""ENG24 (2026-11-04, IDEA-BRAMBLES): two bramble lines in characterDescHTML (arena_app.js) now carry the bramble's own numbers, so their
lang/ui rows are re-keyed: "+1 🪵 every {v1} rounds" -> "+{v1} 🪵 every {v2} rounds", and the Herb Refinery's line with {v1} heal, {v2} damage,
+{v3} Lumber. Each pack's own translation is kept, only the numbers become slots. Idempotent.
    python3 tools/i18n_2026_11_04_eng24_ui.py"""
import json, os, sys
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
CODES = ['fr', 'de', 'es', 'it', 'pt', 'tl', 'ta', 'id', 'zh-Hans', 'zh-Hant', 'ja', 'ko']
L_OLD, L_NEW = '+1 🪵 every {v1} rounds', '+{v1} 🪵 every {v2} rounds'
H_OLD = 'Each round, one of: heal your most wounded unit 3, 2 damage to a random enemy unit, or +1 🪵'
H_NEW = 'Each round, one of: heal your most wounded unit {v1}, {v2} damage to a random enemy unit, or +{v3} 🪵'
for code in CODES:
    path = os.path.join(ROOT, 'lang', 'ui', code + '.json'); pack = json.load(open(path, encoding='utf-8'))
    if L_OLD in pack:
        t = pack.pop(L_OLD); assert t.count('+1') == 1 and t.count('{v1}') == 1, (code, t)
        pack.setdefault(L_NEW, t.replace('{v1}', '{v2}').replace('+1', '+{v1}'))
    if H_OLD in pack:
        t = pack.pop(H_OLD); assert t.count('3') == 1 and t.count('2') == 1 and t.count('+1') == 1, (code, t)
        pack.setdefault(H_NEW, t.replace('3', '{v1}').replace('2', '{v2}').replace('+1', '+{v3}'))
        assert '{v1}' in pack[H_NEW] and '{v2}' in pack[H_NEW] and '{v3}' in pack[H_NEW], (code, pack[H_NEW])
    with open(path, 'w', encoding='utf-8') as fh: json.dump(pack, fh, ensure_ascii=False, indent=1); fh.write('\n')
print('ok')
