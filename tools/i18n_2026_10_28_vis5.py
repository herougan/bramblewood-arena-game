#!/usr/bin/env python3
"""Game texts added on 2026-10-28 by package VIS5 (the owner's 10-28 09:48 notes): the Danger plate's headline (L3) and the name of the fight
controls' ⋯ menu button (L6). Adds the English rows to bramblewood-texts.js (before the table's end) and the translations to the
12 packs in lang/. An older, reviewed pack row wins. Tagalog, Tamil, Japanese and Korean deserve a native read.
    python3 tools/i18n_2026_10_28_vis5.py"""
import json, os, re
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
CODES = ['fr', 'de', 'es', 'it', 'pt', 'tl', 'ta', 'id', 'zh-Hans', 'zh-Hant', 'ja', 'ko']
# key, English, [12 translations in CODES order]
ROWS = [
 ('ui.vis5-danger', "Danger!", [
   'Danger !', 'Gefahr!', '¡Peligro!', 'Pericolo!', 'Perigo!', 'Panganib!', 'ஆபத்து!', 'Bahaya!', '危险！', '危險！', '危険！', '위험!']),
 ('ui.vis5-more-controls', "More controls", [
   'Plus de commandes', 'Weitere Steuerung', 'Más controles', 'Altri comandi', 'Mais controlos', 'Higit pang kontrol', 'மேலும் கட்டுப்பாடுகள்', 'Kontrol lainnya', '更多操作', '更多操作', 'その他の操作', '더 많은 조작']),
]
def dump(path, d):
    with open(path, 'w', encoding='utf-8') as fh:
        json.dump(d, fh, ensure_ascii=False, indent=1); fh.write('\n')
ph = lambda s: sorted(set(re.findall(r'\{\w+\}', s)))
TP = os.path.join(ROOT, 'bramblewood-texts.js'); src = open(TP, encoding='utf-8').read()
end = src.index('\n}/*TEXT-TABLE-END*/')
add = [(k, en) for k, en, _ in ROWS if ('"%s":' % k) not in src]
if add:
    src = src[:end] + ',\n' + ',\n'.join('  %s: %s' % (json.dumps(k), json.dumps(en, ensure_ascii=False)) for k, en in add) + src[end:]
    open(TP, 'w', encoding='utf-8').write(src)
for k, en, row in ROWS: assert json.dumps(en, ensure_ascii=False) in src, en
for i, code in enumerate(CODES):
    path = os.path.join(ROOT, 'lang', code + '.json'); pack = json.load(open(path, encoding='utf-8'))
    for k, en, row in ROWS:
        assert len(row) == len(CODES) and ph(en) == ph(row[i]), (code, en)
        if en in pack: continue  # an older, reviewed row wins
        pack[en] = row[i]
    dump(path, pack)
print('texts: %d new keys; wrote %d packs, %d texts each' % (len(add), len(CODES), len(ROWS)))
