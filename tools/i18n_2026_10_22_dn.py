#!/usr/bin/env python3
"""Game texts added on 2026-10-22 by package DN (the owner's damage-number rule: <type symbol><number><target's mark>).

  * the Codex's Statuses chapter: a short "Reading damage numbers" line under its heading.

Same rules as i18n_2026_10_22_rw2.py (every {placeholder} and every symbol kept). Same caveats as i18n_core.py (Tagalog, Tamil, Japanese
and Korean deserve a native read). The keys are the English game texts exactly.

    python3 tools/i18n_2026_10_22_dn.py && python3 tools/i18n_refresh.py --write && python3 tools/i18n_ui.py --write
"""
import json, os, re
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
CODES = ['fr', 'de', 'es', 'it', 'pt', 'tl', 'ta', 'id', 'zh-Hans', 'zh-Hant', 'ja', 'ko']
T = {
"Reading damage numbers": [
 "Lire les dégâts", "Schadenszahlen lesen", "Cómo leer el daño", "Leggere i danni", "Como ler o dano", "Pagbasa ng damage",
 "சேத எண்களைப் படிப்பது", "Membaca angka damage", "如何看伤害数字", "如何看傷害數字", "ダメージ表示の読み方", "피해 숫자 읽는 법"],
"❄️14🦴: the damage type's symbol (none for a plain hit, 👊 first on a crit), the damage, then how the target took it: 🦴 Fragile (double), 💢 a weakness (more), ⛨ Armor, a resist or a shield took some, 🚫 immune.": [
 "❄️14🦴 : le symbole du type de dégâts (aucun pour un coup simple, 👊 devant pour un critique), les dégâts, puis comment la cible les a pris : 🦴 Fragile (double), 💢 une faiblesse (plus), ⛨ l'Armure, une résistance ou un bouclier en a absorbé, 🚫 immunisé.",
 "❄️14🦴: das Symbol der Schadensart (keins bei einem normalen Treffer, 👊 vorn bei einem Krit), der Schaden, dann wie das Ziel ihn nahm: 🦴 Zerbrechlich (doppelt), 💢 eine Schwäche (mehr), ⛨ Rüstung, eine Resistenz oder ein Schild fing etwas ab, 🚫 immun.",
 "❄️14🦴: el símbolo del tipo de daño (ninguno en un golpe normal, 👊 delante en un crítico), el daño y cómo lo recibió el objetivo: 🦴 Frágil (doble), 💢 una debilidad (más), ⛨ la Armadura, una resistencia o un escudo absorbió parte, 🚫 inmune.",
 "❄️14🦴: il simbolo del tipo di danno (nessuno per un colpo semplice, 👊 davanti per un critico), il danno, poi come l'ha preso il bersaglio: 🦴 Fragile (doppio), 💢 una debolezza (di più), ⛨ Armatura, una resistenza o uno scudo ne ha assorbito una parte, 🚫 immune.",
 "❄️14🦴: o símbolo do tipo de dano (nenhum num golpe normal, 👊 à frente num crítico), o dano e como o alvo o recebeu: 🦴 Frágil (dobro), 💢 uma fraqueza (mais), ⛨ Armadura, uma resistência ou um escudo absorveu parte, 🚫 imune.",
 "❄️14🦴: ang simbolo ng uri ng damage (wala kung karaniwang tama, 👊 sa unahan kapag crit), ang damage, at kung paano ito tinanggap ng target: 🦴 Fragile (doble), 💢 kahinaan (mas marami), ⛨ may sinalo ang Armor, resist o shield, 🚫 immune.",
 "❄️14🦴: சேத வகையின் குறி (சாதாரண அடிக்கு இல்லை, கிரிட்டில் முன்னால் 👊), சேதம், பிறகு இலக்கு அதை எப்படி ஏற்றது: 🦴 Fragile (இரட்டிப்பு), 💢 பலவீனம் (அதிகம்), ⛨ கவசம், எதிர்ப்பு அல்லது கேடயம் சிறிது தாங்கியது, 🚫 தாக்கமில்லை.",
 "❄️14🦴: simbol jenis damage (tidak ada untuk serangan biasa, 👊 di depan saat kritikal), jumlah damage, lalu cara target menerimanya: 🦴 Rapuh (dua kali lipat), 💢 kelemahan (lebih besar), ⛨ Armor, resistansi, atau perisai menahan sebagian, 🚫 kebal.",
 "❄️14🦴：伤害类型的符号（普通攻击没有，暴击时前面加 👊），伤害值，然后是目标的承受方式：🦴 脆弱（双倍），💢 弱点（更多），⛨ 护甲、抗性或护盾挡下了一部分，🚫 免疫。",
 "❄️14🦴：傷害類型的符號（普通攻擊沒有，暴擊時前面加 👊），傷害值，然後是目標的承受方式：🦴 脆弱（雙倍），💢 弱點（更多），⛨ 護甲、抗性或護盾擋下了一部分，🚫 免疫。",
 "❄️14🦴：ダメージの種類の記号（通常攻撃はなし、クリティカルは先頭に 👊）、ダメージ、そして対象の受け方：🦴 脆弱（2倍）、💢 弱点（増加）、⛨ アーマー・耐性・シールドが一部を防いだ、🚫 無効。",
 "❄️14🦴: 피해 유형 기호(일반 공격은 없음, 치명타는 앞에 👊), 피해량, 그리고 대상이 받은 방식: 🦴 연약(2배), 💢 약점(더 많이), ⛨ 방어구·저항·보호막이 일부를 막음, 🚫 면역."],
}
assert all(len(v) == len(CODES) for v in T.values()), [k for k, v in T.items() if len(v) != len(CODES)]
ph = lambda s: sorted(set(re.findall(r'\{\w+\}', s)))
assert all(ph(k) == ph(t) for k, v in T.items() for t in v)
SYM = ['❄️14🦴', '👊', '🦴', '💢', '⛨', '🚫']
assert all(all(g in t for g in SYM) for k, v in T.items() if '🦴' in k for t in v)
if __name__ == '__main__':
    added = 0
    for i, code in enumerate(CODES):
        path = os.path.join(ROOT, 'lang', code + '.json')
        pack = json.load(open(path, encoding='utf-8'))
        for en, row in T.items():
            if en in pack: continue  # a row a pack already has is left as the pack has it
            pack[en] = row[i]; added += 1
        with open(path, 'w', encoding='utf-8') as fh:
            json.dump(pack, fh, ensure_ascii=False, indent=1); fh.write('\n')
    print('wrote', len(CODES), 'packs;', len(T), 'strings each;', added, 'rows written')
