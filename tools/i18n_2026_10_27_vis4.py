#!/usr/bin/env python3
"""Game texts added on 2026-10-27 by package VIS4 (the owner's 10-27 11:22 notes): the map's cards on the fight panel (K8) and the two
copy-cap tips in the deck editor (K16). Adds the English rows to bramblewood-texts.js (before the table's end) and the translations to the
12 packs in lang/. An older, reviewed pack row wins. Tagalog, Tamil, Japanese and Korean deserve a native read.
    python3 tools/i18n_2026_10_27_vis4.py"""
import json, os, re
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
CODES = ['fr', 'de', 'es', 'it', 'pt', 'tl', 'ta', 'id', 'zh-Hans', 'zh-Hant', 'ja', 'ko']
# key, English, [12 translations in CODES order]
ROWS = [
 ('ui.vis4-map-cards', "This map's cards", [
   'Les cartes de cette carte',
   'Die Karten dieser Karte',
   'Las cartas de este mapa',
   'Le carte di questa mappa',
   'As cartas deste mapa',
   'Mga kard ng mapang ito',
   'இந்த வரைபடத்தின் அட்டைகள்',
   'Kartu peta ini',
   '本地图的卡牌',
   '本地圖的卡牌',
   'このマップのカード',
   '이 지도의 카드']),
 ('ui.vis4-map-cards-locked', "{n} more, of rarities you haven't reached yet", [
   '{n} de plus, de raretés que vous n’avez pas encore atteintes',
   '{n} weitere, in Seltenheiten, die du noch nicht erreicht hast',
   '{n} más, de rarezas que aún no has alcanzado',
   'Altre {n}, di rarità che non hai ancora raggiunto',
   'Mais {n}, de raridades que ainda não alcançaste',
   '{n} pa, sa mga rarity na hindi mo pa naaabot',
   'இன்னும் {n}, நீங்கள் இன்னும் அடையாத அரிதுநிலைகளில்',
   '{n} lagi, dari kelangkaan yang belum kamu capai',
   '还有 {n} 张，属于你尚未解锁的稀有度',
   '還有 {n} 張，屬於你尚未解鎖的稀有度',
   'まだ到達していないレアリティのカードがあと{n}枚',
   '아직 도달하지 않은 등급의 카드 {n}장 더']),
 ('ui.vis4-cap-tip', "That's the most a deck can hold of one card: {n} copies.", [
   'C’est le maximum qu’un deck peut contenir d’une même carte : {n} exemplaires.',
   'Mehr passt von einer Karte nicht in ein Deck: {n} Exemplare.',
   'Es lo máximo que un mazo puede llevar de una carta: {n} copias.',
   'È il massimo che un mazzo può contenere di una carta: {n} copie.',
   'É o máximo que um baralho pode ter de uma carta: {n} cópias.',
   'Ito na ang pinakamarami sa isang kard na kaya ng deck: {n} kopya.',
   'ஒரு அட்டையில் ஒரு தளம் வைத்திருக்கக்கூடிய அதிகபட்சம் இதுதான்: {n} நகல்கள்.',
   'Itu batas satu kartu dalam satu dek: {n} salinan.',
   '一副卡组中同一张卡最多只能放 {n} 张。',
   '一副卡組中同一張卡最多只能放 {n} 張。',
   '1枚のカードをデッキに入れられるのはここまで：{n}枚。',
   '한 카드는 덱에 이만큼까지만 넣을 수 있습니다: {n}장.']),
 ('ui.vis4-cap-tip-rare', 'Rarer cards have a lower cap: {n} copies of this one per deck.', [
   'Les cartes plus rares ont une limite plus basse : {n} exemplaires de celle-ci par deck.',
   'Seltenere Karten haben eine niedrigere Grenze: {n} Exemplare von dieser pro Deck.',
   'Las cartas más raras tienen un límite menor: {n} copias de esta por mazo.',
   'Le carte più rare hanno un limite più basso: {n} copie di questa per mazzo.',
   'As cartas mais raras têm um limite menor: {n} cópias desta por baralho.',
   'Mas mababa ang limit ng mas bihirang kard: {n} kopya nito bawat deck.',
   'அரிதான அட்டைகளுக்கு வரம்பு குறைவு: ஒரு தளத்தில் இதில் {n} நகல்கள்.',
   'Kartu yang lebih langka punya batas lebih rendah: {n} salinan kartu ini per dek.',
   '越稀有的卡上限越低：这张卡每副卡组最多 {n} 张。',
   '越稀有的卡上限越低：這張卡每副卡組最多 {n} 張。',
   'レアなカードほど上限が低い：このカードはデッキに{n}枚まで。',
   '희귀한 카드일수록 한도가 낮습니다: 이 카드는 덱당 {n}장까지.']),
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
