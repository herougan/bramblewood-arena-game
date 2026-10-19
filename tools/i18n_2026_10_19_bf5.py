#!/usr/bin/env python3
"""Game texts added on 2026-10-19 by package BF5 (owner 21:36: "Can we HALF everything?" ... "Straight up, the total N value"): the budget
panel's line for the scale on the whole N (card editor, Test Lab). Same form as tools/i18n_2026_10_19_bf.py (keys are the English, every
{placeholder} kept, the packs not re-sorted).

    python3 tools/i18n_2026_10_19_bf5.py && python3 tools/i18n_refresh.py
"""
import json, os, re
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
CODES = ['fr', 'de', 'es', 'it', 'pt', 'tl', 'ta', 'id', 'zh-Hans', 'zh-Hant', 'ja', 'ko']
T = {
"Then all of N × {scale}.": [
  "Puis tout N × {scale}.", "Dann das ganze N × {scale}.", "Luego todo N × {scale}.", "Poi tutto N × {scale}.", "Depois todo o N × {scale}.",
  "Pagkatapos, ang buong N × {scale}.", "பிறகு முழு N × {scale}.", "Lalu seluruh N × {scale}.", "然后整个 N × {scale}。", "然後整個 N × {scale}。",
  "その後、N 全体を × {scale}。", "그다음 N 전체 × {scale}."],
}
assert all(len(v) == len(CODES) for v in T.values())
ph = lambda s: sorted(set(re.findall(r'\{\w+\}', s)))
assert all(ph(k) == ph(t) for k, v in T.items() for t in v)
if __name__ == '__main__':
    for i, code in enumerate(CODES):
        path = os.path.join(ROOT, 'lang', code + '.json')
        items = list((json.load(open(path, encoding='utf-8')) if os.path.exists(path) else {}).items())
        for en, row in T.items():
            j = next((j for j, (k, _) in enumerate(items) if k == en), None)
            if j is not None: items[j] = (en, row[i]); continue
            items.insert(next((j for j, (k, _) in enumerate(items) if k.lower() > en.lower()), len(items)), (en, row[i]))
        with open(path, 'w', encoding='utf-8') as fh:
            json.dump(dict(items), fh, ensure_ascii=False, indent=1); fh.write('\n')
    print('wrote', len(CODES), 'packs,', len(T), 'strings each')
