#!/usr/bin/env python3
"""Game texts added on 2026-10-22 by package GD (owner on RW2-1, 18:20).

  * a cleared skirmish's reward card on its fight panel drop line: its screen-reader words ("{name} drop chance: {p}").

Same rules as i18n_2026_10_22_rw2.py (every {placeholder} kept; Tagalog, Tamil, Japanese and Korean deserve a native read).
The Guardian and crit texts of GD were edited in place in lang/ui and lang (their English changed).

    python3 tools/i18n_2026_10_22_gd.py
"""
import json, os, re
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
CODES = ['fr', 'de', 'es', 'it', 'pt', 'tl', 'ta', 'id', 'zh-Hans', 'zh-Hant', 'ja', 'ko']
T = {
"{name} drop chance: {p}": [
 "Chance d'obtenir {name} : {p}", "Chance auf {name}: {p}", "Probabilidad de {name}: {p}", "Probabilità di {name}: {p}", "Chance de {name}: {p}",
 "Tsansa ng {name}: {p}", "{name} கிடைக்கும் வாய்ப்பு: {p}", "Peluang {name}: {p}", "{name} 掉落几率：{p}", "{name} 掉落機率：{p}",
 "{name}が出る確率：{p}", "{name} 획득 확률: {p}"],
}
assert all(len(v) == len(CODES) for v in T.values()), [k for k, v in T.items() if len(v) != len(CODES)]
ph = lambda s: sorted(set(re.findall(r'\{\w+\}', s)))
assert all(ph(k) == ph(t) for k, v in T.items() for t in v)
if __name__ == '__main__':
    added = 0
    for i, code in enumerate(CODES):
        path = os.path.join(ROOT, 'lang', code + '.json')
        pack = json.load(open(path, encoding='utf-8'))
        for en, row in T.items():
            if en in pack: continue  # a row a pack already has is left as the pack has it
            pack[en] = row[i]; added += 1
        with open(path, 'w', encoding='utf-8') as fh:
            json.dump(pack, fh, ensure_ascii=False, indent=1); fh.write('\n')
    print('wrote', len(CODES), 'packs;', len(T), 'strings each;', added, 'rows written')
