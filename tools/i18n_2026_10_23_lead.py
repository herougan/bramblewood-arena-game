#!/usr/bin/env python3
"""Game texts added on 2026-10-23 by package LEAD (owner 01:03 #12): a paired boss's two leaders on the VS opener and the map panel
("👑 Leaders: {a} and {b}"; the single leader reuses "👑 Leader: {name}"). Same rules as i18n_2026_10_23_eb.py: keys are the English as the
page translator sees it (the leading emoji stays outside), every {placeholder} is kept, a row a pack already has is left as the pack has it.

    python3 tools/i18n_2026_10_23_lead.py && python3 tools/i18n_refresh.py
"""
import json, os, re
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
CODES = ['fr', 'de', 'es', 'it', 'pt', 'tl', 'ta', 'id', 'zh-Hans', 'zh-Hant', 'ja', 'ko']
T = {
"Leaders: {a} and {b}": ["Chefs : {a} et {b}", "Anführer: {a} und {b}", "Líderes: {a} y {b}", "Capi: {a} e {b}", "Líderes: {a} e {b}",
  "Mga pinuno: {a} at {b}", "தலைவர்கள்: {a} மற்றும் {b}", "Pemimpin: {a} dan {b}", "首领：{a} 和 {b}", "首領：{a} 和 {b}",
  "リーダー：{a}と{b}", "리더: {a}, {b}"],
}
assert all(len(v) == len(CODES) for v in T.values()), [k for k, v in T.items() if len(v) != len(CODES)]
ph = lambda s: sorted(set(re.findall(r'\{\w+\}', s)))
assert all(ph(k) == ph(t) for k, v in T.items() for t in v), [(k, t) for k, v in T.items() for t in v if ph(k) != ph(t)]
if __name__ == '__main__':
    kept = 0
    for i, code in enumerate(CODES):
        path = os.path.join(ROOT, 'lang', code + '.json')
        ui = os.path.join(ROOT, 'lang', 'ui', code + '.json')
        pack = json.load(open(path, encoding='utf-8')) if os.path.exists(path) else {}
        uipack = json.load(open(ui, encoding='utf-8')) if os.path.exists(ui) else {}
        for en, row in T.items():
            if en in pack or en in uipack: kept += 1; continue  # the pack's own wording stays
            pack[en] = row[i]
        with open(path, 'w', encoding='utf-8') as fh:
            json.dump(pack, fh, ensure_ascii=False, indent=1); fh.write('\n')
    print('wrote', len(CODES), 'packs,', len(T), 'strings each;', kept, 'rows a pack already had were kept')
