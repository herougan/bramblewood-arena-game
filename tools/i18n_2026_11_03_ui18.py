#!/usr/bin/env python3
"""Game texts added on 2026-11-03 by package UI18 (the Codex skill filter: "? Mystery skills", and the "[Lvl N]" flag on a Codex tile).
4 new TX keys (ui.codex-skill-mystery, -mystery-tip, ui.codex-skill-lvl, -lvl-tip), one row per English text in lang/<code>.json (rows that
already exist are kept; new rows are appended, nothing is sorted). Tagalog and Tamil deserve a native read.
    python3 tools/i18n_2026_11_03_ui18.py   (idempotent)"""
import json, os, re
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
CODES = ['fr', 'de', 'es', 'it', 'pt', 'tl', 'ta', 'id', 'zh-Hans', 'zh-Hant', 'ja', 'ko']
T = [  # English, then the 12 translations in CODES order
 ('Mystery skills', ['Compétences mystères', 'Mysteriöse Fähigkeiten', 'Habilidades misteriosas', 'Abilità misteriose', 'Habilidades misteriosas', 'Mga misteryosong kasanayan', 'மர்ம திறன்கள்', 'Skill misterius', '神秘技能', '神祕技能', 'ミステリースキル', '미스터리 스킬']),
 ('Cards with a skill you have not seen yet.', ['Cartes avec une compétence que tu n’as pas encore vue.', 'Karten mit einer Fähigkeit, die du noch nicht gesehen hast.', 'Cartas con una habilidad que aún no has visto.', 'Carte con un’abilità che non hai ancora visto.', 'Cartas com uma habilidade que ainda não viste.', 'Mga card na may kasanayang hindi mo pa nakikita.', 'நீ இன்னும் பார்க்காத திறன் உள்ள அட்டைகள்.', 'Kartu dengan skill yang belum pernah kamu lihat.', '带有你还没见过的技能的卡牌。', '帶有你還沒見過的技能的卡牌。', 'まだ見たことのないスキルを持つカード。', '아직 보지 못한 스킬이 있는 카드.']),
 ('[Lvl {n}]', ['[Niv. {n}]', '[St. {n}]', '[Nv. {n}]', '[Liv. {n}]', '[Nv. {n}]', '[Lvl {n}]', '[நிலை {n}]', '[Lv. {n}]', '[Lv.{n}]', '[Lv.{n}]', '[Lv.{n}]', '[Lv.{n}]']),
 ('Gets this skill at Level {n}.', ['Obtient cette compétence au niveau {n}.', 'Bekommt diese Fähigkeit auf Stufe {n}.', 'Obtiene esta habilidad en el nivel {n}.', 'Ottiene questa abilità al livello {n}.', 'Ganha esta habilidade no nível {n}.', 'Nakukuha ang kasanayang ito sa Level {n}.', 'நிலை {n} இல் இந்தத் திறனைப் பெறுகிறது.', 'Mendapat skill ini di Level {n}.', '在 {n} 级获得此技能。', '在 {n} 級獲得此技能。', 'レベル{n}でこのスキルを覚える。', '레벨 {n}에서 이 스킬을 얻는다.']),
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
