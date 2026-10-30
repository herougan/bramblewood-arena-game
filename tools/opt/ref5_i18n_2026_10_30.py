#!/usr/bin/env python3
"""Game texts added on 2026-10-30 by package REF5 (the progression reference, "Reference (Random)"). 3 new TX keys (ui.ref5-*), one row per
English text in lang/<code>.json (rows that already exist are kept). Tagalog, Tamil, Japanese and Korean deserve a native read.
    python3 tools/opt/ref5_i18n_2026_10_30.py"""
import json, os, re
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..')
CODES = ['fr', 'de', 'es', 'it', 'pt', 'tl', 'ta', 'id', 'zh-Hans', 'zh-Hant', 'ja', 'ko']
T = [
 ('Reference (Random)', ['Référence (au hasard)', 'Referenz (zufällig)', 'Referencia (al azar)', 'Riferimento (casuale)', 'Referência (aleatória)', 'Sanggunian (random)',
   'குறிப்பு (சீரற்ற)', 'Referensi (acak)', '参考（随机）', '參考（隨機）', 'リファレンス（ランダム）', '레퍼런스 (무작위)']),
 ('Reference {i} of {n}', ['Référence {i} sur {n}', 'Referenz {i} von {n}', 'Referencia {i} de {n}', 'Riferimento {i} di {n}', 'Referência {i} de {n}', 'Sanggunian {i} sa {n}',
   'குறிப்பு {n} இல் {i}', 'Referensi {i} dari {n}', '参考 {i}/{n}', '參考 {i}/{n}', 'リファレンス {i}/{n}', '레퍼런스 {i}/{n}']),
 ("You play {name}, dealt at random from this map's reference decks.", [
  'Vous jouez {name}, tiré au hasard parmi les decks de référence de cette carte.',
  'Du spielst {name}, zufällig aus den Referenzdecks dieser Karte gezogen.',
  'Juegas con {name}, elegido al azar entre los mazos de referencia de este mapa.',
  'Giochi con {name}, estratto a caso dai mazzi di riferimento di questa mappa.',
  'Joga com {name}, escolhido ao acaso entre os baralhos de referência deste mapa.',
  'Lalaruin mo ang {name}, random na pinili mula sa mga sangguniang deck ng mapang ito.',
  'இந்த வரைபடத்தின் குறிப்பு அடுக்குகளில் இருந்து சீரற்ற முறையில் தேர்ந்த {name} உடன் விளையாடுகிறீர்கள்.',
  'Kamu memainkan {name}, dipilih acak dari dek referensi peta ini.',
  '你使用 {name}，从本地图的参考卡组中随机抽取。',
  '你使用 {name}，從本地圖的參考牌組中隨機抽取。',
  'このマップのリファレンスデッキからランダムに選ばれた {name} で戦います。',
  '이 맵의 레퍼런스 덱 중 무작위로 뽑힌 {name}(으)로 싸워요.']),
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
