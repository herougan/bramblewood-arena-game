#!/usr/bin/env python3
"""Game texts added on 2026-10-24 by package BAL2 (DF-2, owner 10-23 17:34: Base cards stop at Lv 4): the Forge's note on a Base card at its top
(ui.bal2-base-cap). A row a pack already has is left as it is. Tagalog, Tamil, Japanese and Korean deserve a native read.
  python3 tools/i18n_2026_10_24_bal2.py"""
import json, os
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
CODES = ['fr', 'de', 'es', 'it', 'pt', 'tl', 'ta', 'id', 'zh-Hans', 'zh-Hant', 'ja', 'ko']
EN = "🌰 Base cards stop at Lv 4. Your road cards keep growing past it."
ROW = [
 "🌰 Les cartes de base s’arrêtent au niv. 4. Vos cartes de la route continuent de progresser au-delà.",
 "🌰 Basiskarten enden bei Stufe 4. Deine Karten von der Reise wachsen darüber hinaus weiter.",
 "🌰 Las cartas básicas se detienen en el nv. 4. Tus cartas del camino siguen creciendo más allá.",
 "🌰 Le carte base si fermano al liv. 4. Le carte del tuo cammino continuano a crescere oltre.",
 "🌰 As cartas base param no nv. 4. As cartas da tua jornada continuam a crescer para lá disso.",
 "🌰 Hanggang Lv 4 lang ang mga Base card. Patuloy na lalakas ang mga card mo mula sa daan.",
 "🌰 அடிப்படை அட்டைகள் நிலை 4-இல் நிற்கும். உங்கள் பயண அட்டைகள் அதற்கு மேலும் வளரும்.",
 "🌰 Kartu dasar berhenti di Lv 4. Kartu dari perjalananmu terus tumbuh melewatinya.",
 "🌰 基础卡最高 4 级。你在旅途中得到的卡会继续成长。",
 "🌰 基礎卡最高 4 級。你在旅途中得到的卡會繼續成長。",
 "🌰 ベースカードはLv 4まで。旅で手に入れたカードはその先も育ちます。",
 "🌰 기본 카드는 Lv 4까지예요. 여정에서 얻은 카드는 그 뒤로도 계속 성장해요.",
]
assert len(ROW) == len(CODES)
def dump(path, d):
    with open(path, 'w', encoding='utf-8') as fh:
        json.dump(d, fh, ensure_ascii=False, indent=1); fh.write('\n')
for i, code in enumerate(CODES):
    path = os.path.join(ROOT, 'lang', code + '.json'); ui = os.path.join(ROOT, 'lang', 'ui', code + '.json')
    pack = json.load(open(path, encoding='utf-8')); uipack = json.load(open(ui, encoding='utf-8'))
    if EN not in pack and EN not in uipack: pack[EN] = ROW[i]
    dump(path, pack)
print('wrote', len(CODES), 'packs: 1 text')
