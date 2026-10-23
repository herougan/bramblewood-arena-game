#!/usr/bin/env python3
"""Game texts added on 2026-10-23 by package RW4 (owner 13:16 list: the swap window's "Good Choice!", first-clear item and resource tips,
the Energy panel's capsule row, the egg lines). Adds each TX key to bramblewood-texts.js (when missing) and its row to the 12 language
packs (keyed by the English; a row a pack already has is left as the pack has it). Same rules as tools/i18n_2026_10_23_ar3.py.

    python3 tools/i18n_2026_10_23_rw4.py && python3 tools/i18n_refresh.py
"""
import json, os
ROOT = '/home/claude/bramblewood-arena-game/.claude/worktrees/agent-a9d57f7754034655e'
CODES = ['fr', 'de', 'es', 'it', 'pt', 'tl', 'ta', 'id', 'zh-Hans', 'zh-Hant', 'ja', 'ko']
# key: (English, [fr, de, es, it, pt, tl, ta, id, zh-Hans, zh-Hant, ja, ko])
T = {
'ui.rw4-swap-good': ("Good Choice!", ["Bon choix !", "Gute Wahl!", "¡Buena elección!", "Bella scelta!", "Boa escolha!", "Magandang pili!", "நல்ல தேர்வு!", "Pilihan bagus!", "好选择！", "好選擇！", "いい選択！", "좋은 선택!"]),
'ui.rw4-tip-card-token': ("A card you'll get with this win.", ["Une carte que vous gagnerez avec cette victoire.", "Eine Karte, die du mit diesem Sieg bekommst.", "Una carta que ganarás con esta victoria.", "Una carta che otterrai con questa vittoria.", "Uma carta que você ganha com esta vitória.", "Isang card na makukuha mo sa panalong ito.", "இந்த வெற்றியில் உனக்குக் கிடைக்கும் ஒரு அட்டை.", "Kartu yang kamu dapat dari kemenangan ini.", "赢下这场可获得的一张卡牌。", "贏下這場可獲得的一張卡牌。", "この勝利でもらえるカード。", "이 승리로 얻는 카드."]),
'ui.rw4-tip-leaves-t': ("Maple Leaves", ["Feuilles d'érable", "Ahornblätter", "Hojas de arce", "Foglie d'acero", "Folhas de bordo", "Mga Dahon ng Maple", "மேப்பிள் இலைகள்", "Daun Maple", "枫叶", "楓葉", "メープルの葉", "단풍잎"]),
'ui.rw4-tip-leaves': ("You get {n} Maple Leaves.", ["Vous gagnez {n} feuilles d'érable.", "Du bekommst {n} Ahornblätter.", "Ganas {n} hojas de arce.", "Ottieni {n} foglie d'acero.", "Você ganha {n} folhas de bordo.", "Makakakuha ka ng {n} Dahon ng Maple.", "{n} மேப்பிள் இலைகள் கிடைக்கும்.", "Kamu mendapat {n} Daun Maple.", "获得 {n} 枫叶。", "獲得 {n} 楓葉。", "メープルの葉を{n}枚もらえます。", "단풍잎 {n}개를 얻습니다."]),
'ui.rw4-tip-dust-t': ("Magic Dust", ["Poussière magique", "Zauberstaub", "Polvo mágico", "Polvere magica", "Pó mágico", "Mahiwagang Alikabok", "மந்திரத் தூள்", "Debu Sihir", "魔法尘", "魔法塵", "魔法の粉", "마법 가루"]),
'ui.rw4-tip-dust': ("You get {n} Magic Dust.", ["Vous gagnez {n} poussière magique.", "Du bekommst {n} Zauberstaub.", "Ganas {n} de polvo mágico.", "Ottieni {n} polvere magica.", "Você ganha {n} de pó mágico.", "Makakakuha ka ng {n} Mahiwagang Alikabok.", "{n} மந்திரத் தூள் கிடைக்கும்.", "Kamu mendapat {n} Debu Sihir.", "获得 {n} 魔法尘。", "獲得 {n} 魔法塵。", "魔法の粉を{n}個もらえます。", "마법 가루 {n}개를 얻습니다."]),
'ui.rw4-capsules': ("Energy capsules: {n}", ["Capsules d'Énergie : {n}", "Energiekapseln: {n}", "Cápsulas de Energía: {n}", "Capsule di Energia: {n}", "Cápsulas de Energia: {n}", "Mga Energy capsule: {n}", "ஆற்றல் காப்ஸ்யூல்கள்: {n}", "Kapsul Energi: {n}", "能量胶囊：{n}", "能量膠囊：{n}", "エネルギーカプセル：{n}", "에너지 캡슐: {n}"]),
'ui.rw4-capsule-each': ("+{n} Energy each", ["+{n} Énergie chacune", "je +{n} Energie", "+{n} de Energía cada una", "+{n} Energia ciascuna", "+{n} de Energia cada", "+{n} Energy bawat isa", "ஒவ்வொன்றும் +{n} ஆற்றல்", "+{n} Energi per kapsul", "每个 +{n} 能量", "每個 +{n} 能量", "1個につき+{n}エネルギー", "개당 에너지 +{n}"]),
'ui.rw4-use': ("Use", ["Utiliser", "Benutzen", "Usar", "Usa", "Usar", "Gamitin", "பயன்படுத்து", "Pakai", "使用", "使用", "使う", "사용"]),
'ui.rw4-egg-nest': ("An egg! You'll need a nest to hatch it!", ["Un œuf ! Il vous faut un nid pour le faire éclore !", "Ein Ei! Du brauchst ein Nest, um es auszubrüten!", "¡Un huevo! ¡Necesitarás un nido para incubarlo!", "Un uovo! Ti serve un nido per farlo schiudere!", "Um ovo! Você vai precisar de um ninho para chocá-lo!", "Isang itlog! Kakailanganin mo ng pugad para mapisa ito!", "ஒரு முட்டை! அதைப் பொரிக்க உனக்கு ஒரு கூடு தேவை!", "Sebuah telur! Kamu butuh sarang untuk menetaskannya!", "一颗蛋！你需要一个巢才能孵化它！", "一顆蛋！你需要一個巢才能孵化它！", "たまご！ふ化させるには巣が必要です！", "알이다! 부화시키려면 둥지가 필요해요!"]),
'ui.rw4-got-egg': ("You got an egg!", ["Vous avez un œuf !", "Du hast ein Ei bekommen!", "¡Conseguiste un huevo!", "Hai ottenuto un uovo!", "Você ganhou um ovo!", "Nakakuha ka ng itlog!", "உனக்கு ஒரு முட்டை கிடைத்தது!", "Kamu dapat sebuah telur!", "你得到了一颗蛋！", "你得到了一顆蛋！", "たまごを手に入れた！", "알을 얻었어요!"]),
}


def add_keys():
    path = os.path.join(ROOT, 'bramblewood-texts.js'); src = open(path, encoding='utf-8').read()
    end = src.index('}/*TEXT-TABLE-END*/'); body = src[:end].rstrip()
    added = []
    for k, (en, _) in T.items():
        if ('"%s":' % k) in src: continue
        added.append('  %s: %s' % (json.dumps(k), json.dumps(en, ensure_ascii=False)))
    if added:
        src = body + ',\n' + ',\n'.join(added) + '\n' + src[end:]
        open(path, 'w', encoding='utf-8').write(src)
    return len(added)


if __name__ == '__main__':
    n = add_keys(); kept = 0
    for i, code in enumerate(CODES):
        path = os.path.join(ROOT, 'lang', code + '.json')
        ui = os.path.join(ROOT, 'lang', 'ui', code + '.json')
        pack = json.load(open(path, encoding='utf-8')) if os.path.exists(path) else {}
        uipack = json.load(open(ui, encoding='utf-8')) if os.path.exists(ui) else {}
        for k, (en, row) in T.items():
            if en in pack or en in uipack: kept += 1; continue
            pack[en] = row[i]
        with open(path, 'w', encoding='utf-8') as fh:
            json.dump(pack, fh, ensure_ascii=False, indent=1); fh.write('\n')
    print('RW4 texts: %d keys added to bramblewood-texts.js, %d rows x 12 packs (%d kept as the packs had them)' % (n, len(T), kept))
