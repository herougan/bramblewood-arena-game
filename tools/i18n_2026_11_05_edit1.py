#!/usr/bin/env python3
"""Game texts added on 2026-11-05 by package EDIT1 (owner 11-05 23:35, the card editor): the level parameter inside a skill row ("+" and
its remove button) and the Species dropdown's second (hybrid) pick. One row per English text in lang/<code>.json (rows that already exist
are kept; new rows are appended). Tagalog, Tamil, Japanese and Korean deserve a native read.
    python3 tools/i18n_2026_11_05_edit1.py   (idempotent)"""
import json, os
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
CODES = ['fr', 'de', 'es', 'it', 'pt', 'tl', 'ta', 'id', 'zh-Hans', 'zh-Hant', 'ja', 'ko']
T = [  # English, then the 12 translations in CODES order
 ('Give this skill a level (it arrives at that level)', ['Donner un niveau à cette compétence (elle arrive à ce niveau)', 'Dieser Fähigkeit eine Stufe geben (sie kommt auf dieser Stufe)', 'Dar un nivel a esta habilidad (llega en ese nivel)', 'Dai un livello a questa abilità (arriva a quel livello)', 'Dar um nível a esta habilidade (chega nesse nível)', 'Bigyan ng level ang skill na ito (darating ito sa level na iyon)', 'இந்தத் திறனுக்கு நிலை கொடு (அந்த நிலையில் வரும்)', 'Beri keahlian ini level (muncul di level itu)', '给此技能设置等级（到该等级才获得）', '給此技能設定等級（到該等級才獲得）', 'このスキルにレベルを付ける（そのレベルで得る）', '이 스킬에 레벨 지정 (그 레벨에 얻음)']),
 ('Remove the level (the skill is there from the start)', ['Retirer le niveau (la compétence est là dès le début)', 'Stufe entfernen (die Fähigkeit ist von Anfang an da)', 'Quitar el nivel (la habilidad está desde el principio)', 'Rimuovi il livello (l’abilità c’è fin dall’inizio)', 'Remover o nível (a habilidade existe desde o início)', 'Alisin ang level (nandiyan ang skill mula sa simula)', 'நிலையை நீக்கு (திறன் தொடக்கத்திலிருந்தே இருக்கும்)', 'Hapus level (keahlian ada sejak awal)', '移除等级（技能从一开始就有）', '移除等級（技能從一開始就有）', 'レベルを外す（最初からスキルを持つ）', '레벨 제거 (처음부터 스킬 보유)']),
 ('Second species (optional, makes a hybrid)', ['Deuxième espèce (facultatif, fait un hybride)', 'Zweite Art (optional, ergibt eine Mischung)', 'Segunda especie (opcional, crea un híbrido)', 'Seconda specie (facoltativa, crea un ibrido)', 'Segunda espécie (opcional, cria um híbrido)', 'Ikalawang species (opsyonal, gumagawa ng hybrid)', 'இரண்டாவது இனம் (விருப்பம், கலப்பினம் ஆகும்)', 'Spesies kedua (opsional, jadi hibrida)', '第二物种（可选，成为混种）', '第二物種（可選，成為混種）', '第2の種族（任意・ハイブリッドになる）', '두 번째 종 (선택, 혼종이 됨)']),
 ('— none —', ['— aucune —', '— keine —', '— ninguna —', '— nessuna —', '— nenhuma —', '— wala —', '— இல்லை —', '— tidak ada —', '— 无 —', '— 無 —', '— なし —', '— 없음 —']),
]
def dump(path, d):
    with open(path, 'w', encoding='utf-8') as fh:
        json.dump(d, fh, ensure_ascii=False, indent=1); fh.write('\n')
added = 0
for i, code in enumerate(CODES):
    path = os.path.join(ROOT, 'lang', code + '.json'); pack = json.load(open(path, encoding='utf-8'))
    for en, row in T:
        assert len(row) == 12, en
        if en not in pack: added += 1
        pack.setdefault(en, row[i])
    dump(path, pack)
print('ok: %d rows added across %d packs' % (added, len(CODES)))
