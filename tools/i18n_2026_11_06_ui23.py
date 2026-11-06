#!/usr/bin/env python3
"""Game texts added on 2026-11-06 by package UI23 (owner 11-06 20:28 / 20:29 / 20:40): the card editor's Costs heading, the fight's Effects
setting, the GET! badge (first copy owned), a level's reward card shown in the results, and the results' pack tip. One row
per English text in lang/<code>.json (rows that already exist are kept; new rows are appended). Tagalog, Tamil, Japanese and Korean deserve a
native read.
    python3 tools/i18n_2026_11_06_ui23.py   (idempotent)"""
import json, os
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
CODES = ['fr', 'de', 'es', 'it', 'pt', 'tl', 'ta', 'id', 'zh-Hans', 'zh-Hant', 'ja', 'ko']
T = [  # English, then the 12 translations in CODES order
 ('Costs', ['Coûts', 'Kosten', 'Costes', 'Costi', 'Custos', 'Mga gastos', 'செலவுகள்', 'Biaya', '费用', '費用', 'コスト', '비용']),
 ('Effects', ['Effets', 'Effekte', 'Efectos', 'Effetti', 'Efeitos', 'Mga epekto', 'விளைவுகள்', 'Efek', '特效', '特效', 'エフェクト', '효과']),
 ('GET!', ['OBTENU !', 'ERHALTEN!', '¡CONSEGUIDA!', 'OTTENUTA!', 'OBTIDA!', 'NAKUHA!', 'கிடைத்தது!', 'DAPAT!', '获得！', '獲得！', 'ゲット！', '획득!']),
 ('Level {n}: {name} is in your collection', ['Niveau {n} : {name} est dans ta collection', 'Stufe {n}: {name} ist in deiner Sammlung', 'Nivel {n}: {name} está en tu colección', 'Livello {n}: {name} è nella tua collezione', 'Nível {n}: {name} está na sua coleção', 'Level {n}: nasa koleksyon mo na ang {name}', 'நிலை {n}: {name} உங்கள் சேகரிப்பில் உள்ளது', 'Level {n}: {name} ada di koleksimu', '等级 {n}：{name} 已加入你的收藏', '等級 {n}：{name} 已加入你的收藏', 'レベル {n}：{name} がコレクションに入った', '레벨 {n}: {name}이(가) 컬렉션에 들어왔습니다']),
 ('{name} - opens as soon as you leave the screen.', ['{name} - s’ouvre dès que tu quittes l’écran.', '{name} - öffnet sich, sobald du den Bildschirm verlässt.', '{name} - se abre en cuanto sales de la pantalla.', '{name} - si apre appena lasci la schermata.', '{name} - abre assim que você sair da tela.', '{name} - bubukas pagkaalis mo sa screen.', '{name} - திரையை விட்டு வெளியேறியதும் திறக்கும்.', '{name} - terbuka begitu kamu meninggalkan layar.', '{name} - 离开此画面后立即开启。', '{name} - 離開此畫面後立即開啟。', '{name} - 画面を離れるとすぐに開く。', '{name} - 화면을 나가면 바로 열립니다.']),
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
