#!/usr/bin/env python3
"""Game texts added on 2026-10-19 by package BR (owner 08:18: the raid's battle rating): the VS screen's "Boss BR" / "Your side's BR"
chips and their tips, and the raid page's per-part line. Same rules as tools/i18n_2026_10_19_nf.py (every {placeholder} kept, keys are
the English with the leading emoji peeled). BR follows the packs (CC / KW / IC / VB / CB / BR / 评分 ...).
Same caveats as i18n_core.py (Tagalog, Tamil, Japanese and Korean deserve a native read).

    python3 tools/i18n_2026_10_19_br.py && python3 tools/i18n_refresh.py
"""
import json, os, re
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
CODES = ['fr', 'de', 'es', 'it', 'pt', 'tl', 'ta', 'id', 'zh-Hans', 'zh-Hant', 'ja', 'ko']
T = {
"Boss BR": ["CC du boss", "Boss-KW", "IC del jefe", "VB del boss", "CB do chefe", "BR ng boss", "தலைவனின் BR", "BR bos", "首领评分", "首領評分", "ボスのBR", "보스 BR"],
"Your side's BR": ["CC de votre camp", "KW deiner Seite", "IC de tu bando", "VB della tua squadra", "CB do teu lado", "BR ng panig mo", "உன் அணியின் BR", "BR pihakmu", "你方评分", "你方評分", "味方のBR", "우리 편 BR"],
"Boss BR {boss} · your side about {side}": [
  "CC du boss {boss} · votre camp environ {side}", "Boss-KW {boss} · deine Seite etwa {side}", "IC del jefe {boss} · tu bando unos {side}",
  "VB del boss {boss} · la tua squadra circa {side}", "CB do chefe {boss} · o teu lado cerca de {side}", "BR ng boss {boss} · panig mo mga {side}",
  "தலைவனின் BR {boss} · உன் அணி சுமார் {side}", "BR bos {boss} · pihakmu sekitar {side}", "首领评分 {boss} · 你方约 {side}", "首領評分 {boss} · 你方約 {side}",
  "ボスのBR {boss} · 味方は約{side}", "보스 BR {boss} · 우리 편 약 {side}"],
"The boss's battle rating: its three rows, each a 20-card deck of its cards, the cards it starts with on the board counted twice, plus its boss units and the Commons it calls in.": [
  "La cote de combat du boss : ses trois rangées, chacune un deck de 20 cartes des siennes, les cartes déjà sur le plateau au départ comptées deux fois, plus ses unités de boss et les Communes qu’il appelle.",
  "Die Kampfwertung des Bosses: seine drei Reihen, jede ein Deck aus 20 seiner Karten, die Karten, mit denen er auf dem Feld beginnt, doppelt gezählt, dazu seine Boss-Einheiten und die gewöhnlichen Karten, die er herbeiruft.",
  "El índice de combate del jefe: sus tres filas, cada una un mazo de 20 de sus cartas, las cartas con las que empieza en el tablero cuentan doble, más sus unidades de jefe y las Comunes que convoca.",
  "La valutazione di battaglia del boss: le sue tre file, ognuna un mazzo di 20 delle sue carte, le carte con cui parte sul campo contate due volte, più le sue unità boss e le Comuni che chiama.",
  "O índice de batalha do chefe: as suas três filas, cada uma um baralho de 20 das suas cartas, as cartas com que começa no tabuleiro contam a dobrar, mais as suas unidades de chefe e as Comuns que chama.",
  "Ang rating sa laban ng boss: ang tatlo niyang hanay, bawat isa ay deck na may 20 sa kanyang card, dobleng bilang ang mga card na nasa board na sa simula, dagdag ang mga boss unit niya at ang mga Karaniwang card na tinatawag niya.",
  "தலைவனின் போர் மதிப்பீடு: அதன் மூன்று வரிசைகள், ஒவ்வொன்றும் அதன் அட்டைகளால் ஆன 20 அட்டை அடுக்கு, தொடக்கத்தில் களத்தில் உள்ள அட்டைகள் இருமுறை எண்ணப்படும், கூடவே அதன் தலைவன் அலகுகளும் அது அழைக்கும் சாதாரண அட்டைகளும்.",
  "Peringkat tempur bos: tiga barisnya, masing-masing dek 20 kartunya, kartu yang sudah di papan sejak awal dihitung dua kali, ditambah unit bosnya dan kartu Biasa yang ia panggil.",
  "首领的战斗评分：它的三排，每排算作一副由它的卡组成的20张卡组，开局就在场上的卡算两次，再加上它的首领单位和它召来的普通卡。",
  "首領的戰鬥評分：它的三排，每排算作一副由它的卡組成的20張牌組，開局就在場上的卡算兩次，再加上它的首領單位和它召來的普通卡。",
  "ボスのバトルレーティング：3つの列それぞれをボスのカード20枚のデッキとして数え、開始時に盤面にいるカードは2倍、さらにボスユニットと呼び出すコモンを加えたもの。",
  "보스의 전투 등급: 세 줄 각각을 보스 카드 20장 덱으로 치고, 시작할 때 판에 있는 카드는 두 번 세며, 보스 유닛과 불러오는 일반 카드를 더한 값이에요."],
"Your side's battle rating: your deck plus your two allies' decks, each leader counted twice. Your allies change from fight to fight.": [
  "La cote de combat de votre camp : votre deck plus ceux de vos deux alliés, chaque chef compté deux fois. Vos alliés changent d’un combat à l’autre.",
  "Die Kampfwertung deiner Seite: dein Deck plus die Decks deiner zwei Verbündeten, jeder Anführer doppelt gezählt. Deine Verbündeten wechseln von Kampf zu Kampf.",
  "El índice de combate de tu bando: tu mazo más los de tus dos aliados, cada líder cuenta doble. Tus aliados cambian de un combate a otro.",
  "La valutazione di battaglia della tua squadra: il tuo mazzo più quelli dei tuoi due alleati, ogni capo contato due volte. I tuoi alleati cambiano da uno scontro all’altro.",
  "O índice de batalha do teu lado: o teu baralho mais os dos teus dois aliados, cada líder conta a dobrar. Os teus aliados mudam de combate para combate.",
  "Ang rating sa laban ng panig mo: ang deck mo at ang mga deck ng dalawa mong kakampi, dobleng bilang ang bawat pinuno. Nagbabago ang mga kakampi mo bawat laban.",
  "உன் அணியின் போர் மதிப்பீடு: உன் அடுக்கும் உன் இரண்டு கூட்டாளிகளின் அடுக்குகளும், ஒவ்வொரு தலைவரும் இருமுறை எண்ணப்படுவர். உன் கூட்டாளிகள் ஒவ்வொரு சண்டைக்கும் மாறுவர்.",
  "Peringkat tempur pihakmu: dekmu ditambah dek kedua sekutumu, setiap pemimpin dihitung dua kali. Sekutumu berganti di setiap pertarungan.",
  "你方的战斗评分：你的卡组加上两位盟友的卡组，每位领袖算两次。你的盟友每场战斗都会换。",
  "你方的戰鬥評分：你的牌組加上兩位盟友的牌組，每位領袖算兩次。你的盟友每場戰鬥都會換。",
  "味方のバトルレーティング：あなたのデッキと2人の仲間のデッキの合計で、リーダーはそれぞれ2倍。仲間は戦いごとに変わります。",
  "우리 편 전투 등급: 내 덱과 두 아군의 덱을 더한 값이고, 리더는 각각 두 번 세요. 아군은 전투마다 바뀌어요."],
}
assert all(len(v) == len(CODES) for v in T.values()), [k for k, v in T.items() if len(v) != len(CODES)]
PLURAL = re.compile(r'^\{(s\d?|plural_\w+)\}$')
ph = lambda s: sorted(set(p for p in re.findall(r'\{\w+\}', s) if not PLURAL.match(p)))
assert all(ph(k) == ph(t) for k, v in T.items() for t in v), [(k, t) for k, v in T.items() for t in v if ph(k) != ph(t)]
if __name__ == '__main__':
    for i, code in enumerate(CODES):
        path = os.path.join(ROOT, 'lang', code + '.json')
        pack = json.load(open(path, encoding='utf-8')) if os.path.exists(path) else {}
        for en, row in T.items(): pack[en] = row[i]
        with open(path, 'w', encoding='utf-8') as fh:
            json.dump(pack, fh, ensure_ascii=False, indent=1); fh.write('\n')  # the pack's own order, new rows at the end (fewer merge clashes)
    print('wrote', len(CODES), 'packs,', len(T), 'strings each')
