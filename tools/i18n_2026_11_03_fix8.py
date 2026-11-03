#!/usr/bin/env python3
"""2026-11-03 (package FIX8, QA2 M5): rows for the Spanish (and all 12 languages) texts QA2 found untranslated:
the two Settings hints (arena_template.html, so they go to the main pack lang/<code>.json), "N cards collected" (the Nest tile),
"<map> N/M cleared" (the map lists), "Cleared", and "Clear <map> / <map>" (the side-map pointers; the verb is the language's own
"Clear {map}" row). UI rows go to lang/ui/<code>.json. Tagalog, Tamil and Indonesian deserve a native read.
    python3 tools/i18n_2026_11_03_fix8.py"""
import json, os
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
CODES = ['fr', 'de', 'es', 'it', 'pt', 'tl', 'ta', 'id', 'zh-Hans', 'zh-Hant', 'ja', 'ko']
# English, [fr, de, es, it, pt, tl, ta, id, zh-Hans, zh-Hant, ja, ko]
MAIN = [
 ("The sound of each place: birds, wind, water, drips.",
  ["Le son de chaque lieu : oiseaux, vent, eau, gouttes.", "Der Klang jedes Ortes: Vögel, Wind, Wasser, Tropfen.", "El sonido de cada lugar: pájaros, viento, agua, goteos.", "Il suono di ogni luogo: uccelli, vento, acqua, gocce.", "O som de cada lugar: pássaros, vento, água, pingos.", "Ang tunog ng bawat lugar: ibon, hangin, tubig, patak.", "ஒவ்வொரு இடத்தின் ஒலி: பறவைகள், காற்று, நீர், சொட்டுகள்.", "Suara setiap tempat: burung, angin, air, tetesan.", "每个地方的声音：鸟鸣、风声、水声、滴答声。", "每個地方的聲音：鳥鳴、風聲、水聲、滴答聲。", "場所ごとの音：鳥、風、水、しずく。", "장소마다 다른 소리: 새, 바람, 물, 물방울."]),
 ("A slow, quiet piano on the map and in menus.",
  ["Un piano lent et discret sur la carte et dans les menus.", "Ein langsames, leises Klavier auf der Karte und in den Menüs.", "Un piano lento y tranquilo en el mapa y en los menús.", "Un pianoforte lento e quieto sulla mappa e nei menu.", "Um piano lento e tranquilo no mapa e nos menus.", "Mabagal at tahimik na piano sa mapa at sa mga menu.", "வரைபடத்திலும் பட்டியல்களிலும் மெதுவான, அமைதியான பியானோ.", "Piano pelan dan tenang di peta dan menu.", "地图和菜单中舒缓安静的钢琴声。", "地圖和選單中舒緩安靜的鋼琴聲。", "マップとメニューで流れる、ゆっくり静かなピアノ。", "지도와 메뉴에서 느리고 조용한 피아노가 흐릅니다."]),
]
# the count word for "cleared", per language (the same ones the existing "{v1} · {v2}/{v3} cleared" row uses); zh/ja/ko put it in front or behind
def count(c, a, b):
    w = {'fr': 'réussis', 'de': 'geschafft', 'es': 'superados', 'it': 'superate', 'pt': 'vencidas', 'tl': 'natapos', 'ta': 'முடிந்தது', 'id': 'diselesaikan'}
    if c in w: return '%s/%s %s' % (a, b, w[c])
    if c == 'zh-Hans': return '已通关 %s/%s' % (a, b)
    if c == 'zh-Hant': return '已通關 %s/%s' % (a, b)
    if c == 'ja': return '%s/%s 制覇' % (a, b)
    return '%s/%s 클리어' % (a, b)
CLEARED = ['Réussi', 'Geschafft', 'Superado', 'Superata', 'Vencida', 'Natapos', 'முடிந்தது', 'Selesai', '已通关', '已通關', '制覇', '클리어']
# "{v1} card{s} collected" (the Nest tile: "48 cards collected", "1 card collected")
COLLECTED = ['{v1} carte{s} obtenue{s}', '{v1} Karte(n) gesammelt', '{v1} carta{s} reunida{s}', '{v1} carte raccolte', '{v1} carta(s) coletada(s)', '{v1} card na nakolekta', '{v1} அட்டைகள் சேகரிக்கப்பட்டன', '{v1} kartu terkumpul', '已收集 {v1} 张卡牌', '已收集 {v1} 張卡牌', '{v1}枚のカードを入手', '카드 {v1}장 수집']

def upd(path, rows):
    raw = open(path, encoding='utf-8').read(); d = json.loads(raw)
    d.update(rows)
    ind = 1 if raw.startswith('{\n "') else 2
    open(path, 'w', encoding='utf-8').write(json.dumps(d, ensure_ascii=False, indent=ind) + '\n')

for i, c in enumerate(CODES):
    main = json.load(open(os.path.join(ROOT, 'lang', c + '.json'), encoding='utf-8'))
    upd(os.path.join(ROOT, 'lang', c + '.json'), {en: tr[i] for en, tr in MAIN})
    ui = {
        '{v1}/{v2} cleared': count(c, '{v1}', '{v2}'),
        '{v1} {v2}/{v3} cleared': '{v1} ' + count(c, '{v2}', '{v3}'),
        '{v1} — {v2}/{v3} cleared': '{v1} — ' + count(c, '{v2}', '{v3}'),
        'Cleared': CLEARED[i],
        '{v1} card{s} collected': COLLECTED[i],
    }
    verb = main.get('Clear {map}')
    if verb and '{map}' in verb: ui['Clear {v1} / {v2}'] = verb.replace('{map}', '{v1} / {v2}')
    upd(os.path.join(ROOT, 'lang', 'ui', c + '.json'), ui)
print('main rows:', len(MAIN), 'ui rows: 6 x', len(CODES))
