#!/usr/bin/env python3
"""Game texts added on 2026-10-26 by package RES3 (rewards and results): Kibble's tip (R3), the egg and baby cards and their reveal (R3), the
new-map banner (R5), the level reward track on the Profile (B1, R9), the locked Forge tab (G18) and the Group Dungeon's themed name (B3).
"Map {n}", "Level {n}" and "Locked for now" were already translated (an older, reviewed row wins). {type} is the Nest type's name; {name} a
pack's name. Tagalog, Tamil, Japanese and Korean deserve a native read.
    python3 tools/i18n_2026_10_26_res3.py"""
import json, os, re
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
CODES = ['fr', 'de', 'es', 'it', 'pt', 'tl', 'ta', 'id', 'zh-Hans', 'zh-Hant', 'ja', 'ko']
T = {
 'For nurturing cards in the Nest': ['Pour élever des cartes au Nid', 'Zum Aufziehen von Karten im Nest', 'Para criar cartas en el Nido', 'Per allevare carte nel Nido', 'Para criar cartas no Ninho',
   'Para sa pag-aalaga ng mga card sa Pugad', 'கூட்டில் அட்டைகளை வளர்க்க', 'Untuk merawat kartu di Sarang', '用于在巢穴中培育卡牌', '用於在巢穴中培育卡牌', '巣でカードを育てるために', '둥지에서 카드를 키우는 데 쓰여요'],
 'Baby {type}': ['Bébé {type}', '{type}-Junges', 'Cría de {type}', 'Cucciolo {type}', 'Filhote {type}', 'Sanggol na {type}', '{type} குட்டி', 'Bayi {type}', '{type}幼崽', '{type}幼崽', '{type}の赤ちゃん', '{type} 아기'],
 'An egg!': ['Un œuf !', 'Ein Ei!', '¡Un huevo!', 'Un uovo!', 'Um ovo!', 'Isang itlog!', 'ஒரு முட்டை!', 'Sebutir telur!', '一枚蛋！', '一顆蛋！', 'たまごだ！', '알이다!'],
 'A baby!': ['Un bébé !', 'Ein Junges!', '¡Una cría!', 'Un cucciolo!', 'Um filhote!', 'Isang sanggol!', 'ஒரு குட்டி!', 'Seekor bayi!', '一只幼崽！', '一隻幼崽！', '赤ちゃんだ！', '아기다!'],
 'New map': ['Nouvelle carte', 'Neue Karte', 'Nuevo mapa', 'Nuova mappa', 'Novo mapa', 'Bagong mapa', 'புதிய வரைபடம்', 'Peta baru', '新地图', '新地圖', '新しいマップ', '새 지도'],
 '{n} fights': ['{n} combats', '{n} Kämpfe', '{n} combates', '{n} scontri', '{n} combates', '{n} laban', '{n} சண்டைகள்', '{n} pertarungan', '{n} 场战斗', '{n} 場戰鬥', '{n} 戦', '전투 {n}개'],
 'A card': ['Une carte', 'Eine Karte', 'Una carta', 'Una carta', 'Uma carta', 'Isang card', 'ஒரு அட்டை', 'Satu kartu', '一张卡牌', '一張卡牌', 'カード1枚', '카드 1장'],
 'Faction pack': ['Paquet de faction', 'Fraktionspack', 'Sobre de facción', 'Busta di fazione', 'Pacote de facção', 'Pack ng paksyon', 'பிரிவுப் பொதி', 'Paket faksi', '阵营卡包', '陣營卡包', '陣営パック', '진영 팩'],
 'Level {n}: {name}': ['Niveau {n} : {name}', 'Stufe {n}: {name}', 'Nivel {n}: {name}', 'Livello {n}: {name}', 'Nível {n}: {name}', 'Antas {n}: {name}', 'நிலை {n}: {name}', 'Level {n}: {name}', '{n} 级：{name}', '{n} 級：{name}', 'レベル{n}：{name}', '레벨 {n}: {name}'],
 'Level {n}, {into} of {need} XP': ['Niveau {n}, {into} sur {need} XP', 'Stufe {n}, {into} von {need} EP', 'Nivel {n}, {into} de {need} PX', 'Livello {n}, {into} su {need} PE', 'Nível {n}, {into} de {need} XP',
   'Antas {n}, {into} sa {need} XP', 'நிலை {n}, {need} இல் {into} XP', 'Level {n}, {into} dari {need} XP', '{n} 级，{into}/{need} 经验', '{n} 級，{into}/{need} 經驗', 'レベル{n}、{need}中{into} XP', '레벨 {n}, {need} 중 {into} XP'],
 '{into}/{need} XP': ['{into}/{need} XP', '{into}/{need} EP', '{into}/{need} PX', '{into}/{need} PE', '{into}/{need} XP', '{into}/{need} XP', '{into}/{need} XP', '{into}/{need} XP', '{into}/{need} 经验', '{into}/{need} 經驗', '{into}/{need} XP', '{into}/{need} XP'],
 'No reward': ['Pas de récompense', 'Keine Belohnung', 'Sin recompensa', 'Nessuna ricompensa', 'Sem recompensa', 'Walang gantimpala', 'வெகுமதி இல்லை', 'Tanpa hadiah', '无奖励', '無獎勵', '報酬なし', '보상 없음'],
 'The Warren Heist': ['Le Casse du Terrier', 'Der Bau-Coup', 'El Golpe de la Madriguera', 'Il Colpo della Tana', 'O Golpe da Toca', 'Ang Nakawan sa Lungga', 'வளை கொள்ளை', 'Perampokan Liang', '兔穴大劫案', '兔穴大劫案', 'ウォーレン強盗団', '굴 습격 작전'],
}
OLDER = ['Map {n}', 'Level {n}', 'Locked for now']  # already in every pack; checked, not overwritten
def dump(path, d):
    with open(path, 'w', encoding='utf-8') as fh:
        json.dump(d, fh, ensure_ascii=False, indent=1); fh.write('\n')
ph = lambda s: sorted(set(re.findall(r'\{\w+\}', s)))
src = open(os.path.join(ROOT, 'bramblewood-texts.js'), encoding='utf-8').read()
for en in list(T) + OLDER: assert json.dumps(en, ensure_ascii=False) in src, en  # every one is a TX text
for i, code in enumerate(CODES):
    path = os.path.join(ROOT, 'lang', code + '.json'); pack = json.load(open(path, encoding='utf-8'))
    for en, row in T.items():
        assert len(row) == len(CODES) and ph(en) == ph(row[i]), (code, en)
        if en in pack: continue  # an older, reviewed row wins
        pack[en] = row[i]
    for en in OLDER: assert en in pack, (code, en)
    dump(path, pack)
print('wrote', len(CODES), 'packs:', len(T), 'texts each')
