#!/usr/bin/env python3
"""Game texts changed on 2026-10-22 by package DV2 (owner 07:41, MP's calls): the Map cards editor shows three tiers (Map, one Submap section
each, Special), a card moves to a submap through a "Move to..." select, and "+ Load any card" opens its own modal (title "Load any card").
Same rules as i18n_2026_10_22_mp.py (every {placeholder} kept; a row a pack already has is left as the pack has it). "Map" is already in the
UI packs. "Load any card" is the pack's own "+ Load any card" without the plus. The rows the old Cards / Special / Submap toggles used
(and nothing else uses) are pruned from the 12 packs. Same caveats as i18n_core.py (Tagalog, Tamil, Japanese and Korean deserve a native read).

    python3 tools/i18n_2026_10_22_dv2.py && python3 tools/i18n_refresh.py
"""
import json, os, re
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
CODES = ['fr', 'de', 'es', 'it', 'pt', 'tl', 'ta', 'id', 'zh-Hans', 'zh-Hant', 'ja', 'ko']
T = {
"Submap: {name}": ["Sous-carte : {name}", "Unterkarte: {name}", "Submapa: {name}", "Sottomappa: {name}", "Submapa: {name}", "Submapa: {name}", "துணை வரைபடம்: {name}", "Sub-peta: {name}",
                   "子地图：{name}", "子地圖：{name}", "サブマップ：{name}", "하위 맵: {name}"],
"Move to…": ["Déplacer vers…", "Verschieben nach …", "Mover a…", "Sposta in…", "Mover para…", "Ilipat sa…", "இதற்கு நகர்த்து…", "Pindahkan ke…", "移到…", "移到…", "移動先…", "이동할 곳…"],
}
# the plain "Load any card" is the existing "+ Load any card" row without its plus
LOAD_ANY = "Load any card"
STALE = ["Submap: Cards", "Submap: Special", "{name}: Cards", "Read only here. Edit it on the parent map.", "Move to Special", "Move to Cards", "Back to this map's cards"]
assert all(len(v) == len(CODES) for v in T.values())
ph = lambda s: sorted(set(re.findall(r'\{\w+\}', s)))
assert all(ph(k) == ph(t) for k, v in T.items() for t in v)
if __name__ == '__main__':
    kept = pruned = 0
    for i, code in enumerate(CODES):
        path = os.path.join(ROOT, 'lang', code + '.json')
        ui = os.path.join(ROOT, 'lang', 'ui', code + '.json')
        pack = json.load(open(path, encoding='utf-8'))
        uipack = json.load(open(ui, encoding='utf-8')) if os.path.exists(ui) else {}
        rows = dict(T_i for T_i in ((en, row[i]) for en, row in T.items()))
        plus = pack.get('+ Load any card')
        assert plus, (code, 'no "+ Load any card" row')
        rows[LOAD_ANY] = re.sub(r'^\+\s*', '', plus)
        for en, tr in rows.items():
            if en in pack or en in uipack: kept += 1; continue
            pack[en] = tr
        for en in STALE:
            if en in pack: del pack[en]; pruned += 1
        with open(path, 'w', encoding='utf-8') as fh:
            json.dump(pack, fh, ensure_ascii=False, indent=1); fh.write('\n')
    print('wrote', len(CODES), 'packs;', len(T) + 1, 'strings each;', kept, 'rows already there;', pruned, 'stale rows pruned')
