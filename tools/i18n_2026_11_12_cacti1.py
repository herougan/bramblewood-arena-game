#!/usr/bin/env python3
"""Package CACTI1 (2026-11-12): the Barrel Cactus's name (lang/cards/<code>.json) and flavour line (lang/ui/<code>.json), same writer as CONTENT19.
Language order is CODES'. Tagalog, Tamil and Indonesian deserve a native read.   python3 tools/i18n_2026_11_12_cacti1.py   (idempotent)"""
import os
from i18n_2026_11_08_content18 import CODES, ROOT, load, dump

NAMES = [('Barrel Cactus', ['Cactus tonneau', 'Fasskaktus', 'Cactus barril', 'Echinocactus', 'Cacto-barril', 'Barrel Cactus', 'பீப்பாய் கள்ளி', 'Kaktus Tong', '金琥仙人掌', '金琥仙人掌', 'ビーカクタス', '통선인장'])]
FLAVOR = [('It keeps its water to itself, and it keeps its distance.', [
  'Il garde son eau pour lui, et ses distances aussi.',
  'Es behält sein Wasser für sich und die Leute auf Abstand.',
  'Guarda su agua para sí y guarda las distancias.',
  'Tiene l’acqua per sé e tiene gli altri a distanza.',
  'Guarda a água para si e mantém a distância.',
  'Itinatago nito ang tubig nito para sa sarili, at lumalayo ito sa lahat.',
  'தன் தண்ணீரைத் தனக்கே வைத்துக்கொள்ளும்; தள்ளியே இருக்கும்.',
  'Ia menyimpan airnya untuk dirinya sendiri, dan menjaga jaraknya.',
  '它把水留给自己，也和旁人保持距离。',
  '牠把水留給自己，也和旁人保持距離。',
  '水は自分だけのもの。近づく者とは距離を保つ。',
  '물은 저 혼자 간직하고, 남과는 거리를 둔다.'])]


def main():
    stats = {}
    for i, code in enumerate(CODES):
        added = 0
        for rel, rows in ((os.path.join('lang', 'cards', code + '.json'), NAMES), (os.path.join('lang', 'ui', code + '.json'), FLAVOR)):
            p = os.path.join(ROOT, rel); pack = load(p)
            for en, tr in rows:
                assert len(tr) == 12, en
                if en not in pack: pack[en] = tr[i]; added += 1
            dump(p, pack)
        stats[code] = added
    print('ok: rows added per language:', stats)


if __name__ == '__main__':
    main()
