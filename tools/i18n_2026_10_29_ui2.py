#!/usr/bin/env python3
"""Game texts added on 2026-10-29 by package UI2 (owner notes R1-R8). One new TX key (ui.ui2-pitch-shift, the Graveyard's tooltip names the
Shift+click pitch shortcut), one row per English text in lang/<code>.json (an existing row is kept as it is). "Shift" stays as the key's name.
    python3 tools/i18n_2026_10_29_ui2.py"""
import json, os, re
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
CODES = ['fr', 'de', 'es', 'it', 'pt', 'tl', 'ta', 'id', 'zh-Hans', 'zh-Hant', 'ja', 'ko']
T = [  # English, then the 12 translations in CODES order
 ('Shift+click a card in your hand to pitch it.', [
  'Maj+clic sur une carte de votre main pour la défausser.',
  'Umschalt+Klick auf eine Handkarte, um sie abzuwerfen.',
  'Mayús+clic en una carta de tu mano para descartarla.',
  'Maiusc+clic su una carta in mano per scartarla.',
  'Shift+clique numa carta da tua mão para a descartar.',
  'Shift+click ang isang baraha sa kamay mo para itapon ito.',
  'உங்கள் கையிலுள்ள அட்டையை நிராகரிக்க Shift+கிளிக் செய்யவும்.',
  'Shift+klik kartu di tanganmu untuk membuangnya.',
  'Shift+点击手牌即可弃掉它。',
  'Shift+點擊手牌即可棄掉它。',
  '手札のカードを Shift+クリックで捨て札にします。',
  '손에 든 카드를 Shift+클릭하면 버릴 수 있어요.']),
]
ph = lambda s: sorted(set(re.findall(r'\{\w+\}', s)))
def dump(path, d):
    with open(path, 'w', encoding='utf-8') as fh:
        json.dump(d, fh, ensure_ascii=False, indent=1); fh.write('\n')
added = 0
for i, code in enumerate(CODES):
    path = os.path.join(ROOT, 'lang', code + '.json'); pack = json.load(open(path, encoding='utf-8'))
    for en, row in T:
        assert len(row) == 12 and ph(en) == ph(row[i]), (code, en)
        if en not in pack: added += 1
        pack.setdefault(en, row[i])
    dump(path, pack)
print('ok: %d rows added across %d packs' % (added, len(CODES)))
