#!/usr/bin/env python3
"""Game texts added on 2026-10-28 by package PACK1 (owner 10-28 22:47: packs draw from the map lists; the admin's Map cards button on the
skirmish panel). Adds the English rows to bramblewood-texts.js (before the table's end) and the translations to the 12 packs in lang/. An
older, reviewed pack row wins. Tagalog, Tamil, Japanese and Korean deserve a native read.
    python3 tools/i18n_2026_10_28_pack1.py"""
import json, os, re
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
CODES = ['fr', 'de', 'es', 'it', 'pt', 'tl', 'ta', 'id', 'zh-Hans', 'zh-Hant', 'ja', 'ko']
# key, English, [12 translations in CODES order]
ROWS = [
 ('ui.pk1-map-cards-btn', '🃏 Map cards', [
   '🃏 Cartes de la carte',
   '🃏 Karten der Karte',
   '🃏 Cartas del mapa',
   '🃏 Carte della mappa',
   '🃏 Cartas do mapa',
   '🃏 Mga kard ng mapa',
   '🃏 வரைபட அட்டைகள்',
   '🃏 Kartu peta',
   '🃏 地图卡牌',
   '🃏 地圖卡牌',
   '🃏 マップのカード',
   '🃏 지도 카드']),
 ('ui.pk1-map-cards-title', "{name}: the map's cards", [
   '{name} : les cartes de la carte',
   '{name}: die Karten der Karte',
   '{name}: las cartas del mapa',
   '{name}: le carte della mappa',
   '{name}: as cartas do mapa',
   '{name}: ang mga kard ng mapa',
   '{name}: வரைபடத்தின் அட்டைகள்',
   '{name}: kartu peta ini',
   '{name}：地图的卡牌',
   '{name}：地圖的卡牌',
   '{name}：マップのカード',
   '{name}: 지도의 카드']),
 ('ui.pk1-map-cards-sub', "Every card on this map's lists: the map's own, each side map's and the special ones. A card marked with a pack also comes out of that pack.", [
   'Toutes les cartes des listes de cette carte : les siennes, celles de chaque carte annexe et les spéciales. Une carte marquée d’un paquet sort aussi de ce paquet.',
   'Alle Karten auf den Listen dieser Karte: ihre eigenen, die jeder Nebenkarte und die besonderen. Eine Karte mit Pack-Zeichen kommt auch aus diesem Pack.',
   'Todas las cartas de las listas de este mapa: las suyas, las de cada mapa secundario y las especiales. Una carta marcada con un sobre también sale de ese sobre.',
   'Tutte le carte delle liste di questa mappa: le sue, quelle di ogni mappa secondaria e quelle speciali. Una carta con il segno di un pacchetto esce anche da quel pacchetto.',
   'Todas as cartas das listas deste mapa: as dele, as de cada mapa secundário e as especiais. Uma carta marcada com um pacote também sai desse pacote.',
   'Lahat ng kard sa mga listahan ng mapang ito: sarili nito, sa bawat side map at ang mga espesyal. Ang kard na may marka ng pack ay lumalabas din sa pack na iyon.',
   'இந்த வரைபடத்தின் பட்டியல்களில் உள்ள எல்லா அட்டைகளும்: அதன் சொந்தம், ஒவ்வொரு துணை வரைபடத்தினுடையது, சிறப்பு அட்டைகள். ஒரு பொதியின் குறி உள்ள அட்டை அந்தப் பொதியிலிருந்தும் வரும்.',
   'Semua kartu di daftar peta ini: milik peta ini, tiap peta samping, dan yang khusus. Kartu bertanda paket juga keluar dari paket itu.',
   '本地图各列表中的所有卡牌：地图本身的、每张支线地图的和特殊的。标有卡包的卡牌也会从该卡包中开出。',
   '本地圖各列表中的所有卡牌：地圖本身的、每張支線地圖的和特殊的。標有卡包的卡牌也會從該卡包中開出。',
   'このマップのリストにあるすべてのカード：マップ自身のもの、各サイドマップのもの、特別なもの。パックの印があるカードはそのパックからも出ます。',
   '이 지도 목록의 모든 카드: 지도 자체, 각 보조 지도, 특별 카드. 팩 표시가 있는 카드는 그 팩에서도 나옵니다.']),
 ('ui.pk1-in-pack', 'Pack {n}', [
   'Paquet {n}',
   'Pack {n}',
   'Sobre {n}',
   'Pacchetto {n}',
   'Pacote {n}',
   'Pack {n}',
   'பொதி {n}',
   'Paket {n}',
   '卡包 {n}',
   '卡包 {n}',
   'パック{n}',
   '팩 {n}']),
 ('ui.pk1-not-in-pack', 'Not obtainable yet: in no map list and no pack', [
   'Pas encore obtenable : dans aucune liste de carte ni aucun paquet',
   'Noch nicht erhältlich: auf keiner Kartenliste und in keinem Pack',
   'Aún no se puede obtener: en ninguna lista de mapa ni sobre',
   'Non ancora ottenibile: in nessuna lista di mappa né pacchetto',
   'Ainda não obtível: em nenhuma lista de mapa nem pacote',
   'Hindi pa makukuha: wala sa anumang listahan ng mapa o pack',
   'இன்னும் பெற முடியாது: எந்த வரைபடப் பட்டியலிலும் பொதியிலும் இல்லை',
   'Belum bisa didapat: tidak ada di daftar peta atau paket mana pun',
   '尚无法获得：不在任何地图列表或卡包中',
   '尚無法獲得：不在任何地圖列表或卡包中',
   'まだ入手できません：どのマップのリストにもパックにもありません',
   '아직 얻을 수 없음: 어떤 지도 목록에도, 어떤 팩에도 없음']),
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
