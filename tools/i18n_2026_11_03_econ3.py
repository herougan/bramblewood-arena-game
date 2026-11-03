#!/usr/bin/env python3
"""Game texts added on 2026-11-03 by package ECON3 (the weekly quests' "each" after their reward chips, ECON2-2; the map's folded title
chip's tooltip, ECON2-10; Metal in the Forge's tier price, ECON2-8). 5 new TX keys (ui.econ3-*), one row per English text in lang/<code>.json (rows that already exist are kept as
they are; new rows are appended, nothing is sorted).
    python3 tools/i18n_2026_11_03_econ3.py   (idempotent)"""
import json, os, re
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
CODES = ['fr', 'de', 'es', 'it', 'pt', 'tl', 'ta', 'id', 'zh-Hans', 'zh-Hant', 'ja', 'ko']
T = [  # English, then the 12 translations in CODES order
 ('each', ['chacune', 'je', 'cada una', 'ciascuna', 'cada', 'bawat isa', 'ஒவ்வொன்றுக்கும்', 'masing-masing', '每个', '每個', 'それぞれ', '각각']),
 ('Every quest in this tier pays this when you claim it.', ['Chaque quête de ce palier rapporte ceci quand vous la réclamez.', 'Jede Quest dieser Stufe zahlt das, wenn du sie abholst.', 'Cada misión de este nivel paga esto al reclamarla.', 'Ogni missione di questo livello paga questo quando la riscatti.', 'Cada missão deste nível paga isto quando a resgatas.', 'Bawat quest sa tier na ito ay nagbabayad nito kapag kinuha mo.', 'இந்த நிலையின் ஒவ்வொரு தேடலும் நீங்கள் பெறும்போது இதைத் தரும்.', 'Setiap misi di tingkat ini memberi ini saat kamu mengklaimnya.', '本层的每个任务领取时都给这些。', '本層的每個任務領取時都給這些。', 'この段のクエストは、受け取るたびにこれがもらえます。', '이 단계의 퀘스트는 받을 때마다 이만큼 줘요.']),
 ("Show the map's story", ["Afficher l'histoire de la carte", 'Geschichte der Karte zeigen', 'Mostrar la historia del mapa', 'Mostra la storia della mappa', 'Mostrar a história do mapa', 'Ipakita ang kuwento ng mapa', 'வரைபடத்தின் கதையைக் காட்டு', 'Tampilkan kisah peta', '显示地图故事', '顯示地圖故事', 'マップの物語を見る', '지도 이야기 보기']),
 ('Metal', ['Métal', 'Metall', 'Metal', 'Metallo', 'Metal', 'Metal', 'உலோகம்', 'Logam', '金属', '金屬', 'メタル', '금속']),
 ("Hide the map's story", ["Masquer l'histoire de la carte", 'Geschichte der Karte ausblenden', 'Ocultar la historia del mapa', 'Nascondi la storia della mappa', 'Ocultar a história do mapa', 'Itago ang kuwento ng mapa', 'வரைபடத்தின் கதையை மறை', 'Sembunyikan kisah peta', '隐藏地图故事', '隱藏地圖故事', 'マップの物語を隠す', '지도 이야기 숨기기']),
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
