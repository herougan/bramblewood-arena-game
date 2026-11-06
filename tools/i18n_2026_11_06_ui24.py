#!/usr/bin/env python3
"""2026-11-06 (owner 23:51 #15): the Map cards window's skill recommendation and introduction tiles. Rows in lang/<code>.json keyed by the
English text; existing rows are kept. Tagalog, Tamil and Indonesian deserve a native read.
    python3 tools/i18n_2026_11_06_ui24.py   (idempotent)"""
import json, os
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
CODES = ['fr', 'de', 'es', 'it', 'pt', 'tl', 'ta', 'id', 'zh-Hans', 'zh-Hant', 'ja', 'ko']
UI = [
 ('Suggested for {card}', ['Suggéré pour {card}', 'Vorschlag für {card}', 'Sugerido para {card}', 'Suggerito per {card}', 'Sugerido para {card}',
   'Mungkahi para sa {card}', '{card}க்குப் பரிந்துரை', 'Disarankan untuk {card}', '建议给{card}', '建議給{card}', '{card}への提案', '{card}에게 추천']),
 ('Recommended for {card}:', ['Recommandé pour {card} :', 'Empfohlen für {card}:', 'Recomendado para {card}:', 'Consigliato per {card}:', 'Recomendado para {card}:',
   'Inirerekomenda para sa {card}:', '{card}க்குப் பரிந்துரைக்கப்பட்டது:', 'Direkomendasikan untuk {card}:', '推荐给{card}：', '推薦給{card}：', '{card}へのおすすめ：', '{card}에게 추천:']),
 ("This map's keyword: on no card yet", ['Mot-clé de cette carte : sur aucune carte pour l’instant', 'Schlüsselwort dieser Karte: noch auf keiner Karte',
   'Palabra clave de este mapa: aún en ninguna carta', 'Parola chiave di questa mappa: ancora su nessuna carta', 'Palavra-chave deste mapa: ainda em nenhuma carta',
   'Keyword ng mapang ito: wala pa sa anumang card', 'இந்த வரைபடத்தின் முக்கியச்சொல்: இன்னும் எந்த அட்டையிலும் இல்லை', 'Kata kunci peta ini: belum ada di kartu mana pun',
   '本地图的关键词：尚无卡牌拥有', '本地圖的關鍵詞：尚無卡牌擁有', 'このマップのキーワード：まだどのカードにもない', '이 맵의 키워드: 아직 어떤 카드에도 없음']),
]


def main():
    for i, code in enumerate(CODES):
        p = os.path.join(ROOT, 'lang', code + '.json')
        with open(p, encoding='utf-8') as fh: pack = json.load(fh)
        keys = list(pack); was_sorted = keys == sorted(keys)
        for en, tr in UI:
            assert len(tr) == 12, en
            pack.setdefault(en, tr[i])
        if was_sorted: pack = dict(sorted(pack.items()))
        with open(p, 'w', encoding='utf-8') as fh: json.dump(pack, fh, ensure_ascii=False, indent=1); fh.write('\n')
    print('ok')


if __name__ == '__main__':
    main()
