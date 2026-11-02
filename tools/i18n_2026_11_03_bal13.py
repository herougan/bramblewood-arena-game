#!/usr/bin/env python3
"""2026-11-03 (release 11-03a): rows for BAL13's reference-ladder texts (ui.bal13-*), added in English only: the deck label
"Reference {i} of {n}: {name}", the 17 tactic words (the name pattern "{lead} {tactic}" has no literal text, so it cannot compile as a pack template: the English pattern joins the translated parts). lang/<code>.json, keyed by English text.
Tagalog, Tamil and Indonesian deserve a native read.
    python3 tools/i18n_2026_11_03_bal13.py"""
import json, os
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
CODES = ['fr', 'de', 'es', 'it', 'pt', 'tl', 'ta', 'id', 'zh-Hans', 'zh-Hant', 'ja', 'ko']
TX = [
 ('Reference {i} of {n}: {name}', ['Référence {i} sur {n} : {name}', 'Referenz {i} von {n}: {name}', 'Referencia {i} de {n}: {name}', 'Riferimento {i} di {n}: {name}', 'Referência {i} de {n}: {name}', 'Sanggunian {i} sa {n}: {name}', 'குறிப்பு {i}/{n}: {name}', 'Referensi {i} dari {n}: {name}', '参考 {i}/{n}：{name}', '參考 {i}/{n}：{name}', '参考デッキ {i}/{n}：{name}', '참고 {i}/{n}: {name}']),
 ('Flock', ['Volée', 'Schar', 'Bandada', 'Stormo', 'Revoada', 'Kawan', 'பறவைக்கூட்டம்', 'Kawanan', '鸟群', '鳥群', '群れ', '새떼']),
 ('Hive', ['Ruche', 'Stock', 'Colmena', 'Alveare', 'Colmeia', 'Pukyutan', 'தேன்கூடு', 'Sarang Lebah', '蜂巢', '蜂巢', '巣箱', '벌집']),
 ('Nest', ['Nid', 'Nest', 'Nido', 'Nido', 'Ninho', 'Pugad', 'கூடு', 'Sarang', '巢穴', '巢穴', '巣', '둥지']),
 ('School', ['Banc', 'Fischschwarm', 'Banco', 'Banco', 'Cardume', 'Kumpol', 'மீன்கூட்டம்', 'Kawanan Ikan', '鱼群', '魚群', '魚群', '물고기 떼']),
 ('Pack', ['Meute', 'Rudel', 'Manada', 'Branco', 'Matilha', 'Pangkat', 'கும்பல்', 'Gerombolan', '狼群', '狼群', '群狼', '무리']),
 ('Pride', ['Troupe', 'Löwenrudel', 'Clan de leones', 'Famiglia', 'Bando', 'Angkan', 'சிங்கக்கூட்டம்', 'Kawanan Singa', '狮群', '獅群', '獅子の群れ', '사자 무리']),
 ('Warren', ['Garenne', 'Bau', 'Madriguera', 'Tana', 'Toca', 'Lungga', 'வளை', 'Liang', '兔窝', '兔窩', '巣穴', '굴']),
 ('Clan', ['Clan', 'Clan', 'Clan', 'Clan', 'Clã', 'Angkan', 'குலம்', 'Klan', '氏族', '氏族', '一族', '씨족']),
 ('Brood', ['Couvée', 'Brut', 'Camada', 'Covata', 'Ninhada', 'Inakay', 'குஞ்சுகள்', 'Anakan', '一窝', '一窩', '一腹', '한배']),
 ('Colony', ['Colonie', 'Kolonie', 'Colonia', 'Colonia', 'Colônia', 'Kolonya', 'காலனி', 'Koloni', '群落', '群落', 'コロニー', '군체']),
 ('Troop', ['Troupe', 'Trupp', 'Tropa', 'Truppa', 'Tropa', 'Tropa', 'படை', 'Pasukan', '部队', '部隊', '部隊', '부대']),
 ('Host', ['Légion', 'Heer', 'Hueste', 'Schiera', 'Hoste', 'Hukbo', 'சேனை', 'Bala Tentara', '大军', '大軍', '大軍', '대군']),
 ('Camp', ['Camp', 'Lager', 'Campamento', 'Accampamento', 'Acampamento', 'Kampo', 'முகாம்', 'Perkemahan', '营地', '營地', '野営地', '야영지']),
 ('Swarm', ['Essaim', 'Schwarm', 'Enjambre', 'Sciame', 'Enxame', 'Kuyog', 'திரள்', 'Kerumunan', '虫群', '蟲群', '大群', '떼']),
 ('Wall', ['Rempart', 'Wall', 'Muralla', 'Muraglia', 'Muralha', 'Pader', 'அரண்', 'Tembok', '壁垒', '壁壘', '城壁', '성벽']),
 ('Raiders', ['Pillards', 'Plünderer', 'Saqueadores', 'Predoni', 'Saqueadores', 'Mandarambong', 'கொள்ளையர்', 'Perampok', '掠袭者', '掠襲者', '略奪者', '약탈자']),
 ('Band', ['Bande', 'Bande', 'Banda', 'Banda', 'Grupo', 'Pangkat', 'குழு', 'Kelompok', '帮', '幫', '一団', '패거리']),
]
for i, c in enumerate(CODES):
    path = os.path.join(ROOT, 'lang', c + '.json'); raw = open(path, encoding='utf-8').read(); d = json.loads(raw)
    for en, tr in TX: d.setdefault(en, tr[i]) if en in ('Clan', 'Nest', 'Pack', 'Swarm', 'Brood', 'Camp', 'Wall', 'Host', 'Band', 'Colony', 'Troop', 'School', 'Pride', 'Flock', 'Hive', 'Warren', 'Raiders') else d.__setitem__(en, tr[i])
    ind = 1 if raw.startswith('{\n "') else 2
    open(path, 'w', encoding='utf-8').write(json.dumps(d, ensure_ascii=False, indent=ind) + '\n')
print('rows:', len(TX), 'x', len(CODES), '(single words keep an existing row)')
