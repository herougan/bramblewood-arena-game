#!/usr/bin/env python3
"""Game texts changed on 2026-10-23 by package FX3 (owner 01:57 notes 3 and 7): Scorched Ground is a line of fire (1 to every unit it
touches), Scorching I-III burn for 1 at every level, Lava Tide hits for 2. Same rules as i18n_2026_10_23_en.py: keys are the English, every
{placeholder} is kept. The three rows that only change a number (Scorching II / III, Lava Tide) are made from the pack's own old row, so
the pack's wording stays; the rest are new. Tagalog, Tamil, Japanese and Korean deserve a native read.

    python3 tools/i18n_2026_10_23_fx3.py && python3 tools/i18n_refresh.py
"""
import json, os, re
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
CODES = ['fr', 'de', 'es', 'it', 'pt', 'tl', 'ta', 'id', 'zh-Hans', 'zh-Hant', 'ja', 'ko']
# new English -> (old English, the old number, the new number): the pack's old row with its last old number swapped
FROM_OLD = {
 "Scorching, level 2: each round 3 random units on each side take 1 fire damage. Heat-resistant units are spared.":
   ("Scorching, level 2: each round 3 random units on each side take 2 fire damage. Heat-resistant units are spared.", '2', '1'),
 "Scorching, level 3: each round 4 random units on each side take 1 fire damage. Heat-resistant units are spared.":
   ("Scorching, level 3: each round 4 random units on each side take 3 fire damage. Heat-resistant units are spared.", '3', '1'),
 "Lava may flood a random column: 2 fire damage to non-flyers.": ("Lava may flood a random column: 1 fire damage to non-flyers.", '1', '2'),
}
# English the game no longer shows (FX3 replaced it)
DEAD = ['From round 2, a line of fire sweeps the field each round: 1 fire damage to every unit it touches.', 'At the start of every round, 2 random units on each side take 1 fire damage. Heat-resistant units are spared.',  # FX3's own first wording (over 20 words with its title)
  "At the start of every round, every unit takes 1 damage (heat-resistant units are spared).",
  "Scorching: every unit takes 1 damage at the start of each round.",
  "From round 2, the ground burns a random unit on each side for {n} fire damage a round.",
  "Units that resist fire are spared.",
  "From round 2, the ground burns one random unit on each side for 1 fire damage every round."]
T = {
"From round 2, a line of fire sweeps past each round: 1 fire damage to every unit it touches.": [
  "Dès le tour 2, une ligne de feu balaie le terrain à chaque tour : 1 dégât de feu à chaque unité qu'elle touche.",
  "Ab Runde 2 fegt jede Runde eine Feuerlinie über das Feld: 1 Feuerschaden an jeder Einheit, die sie berührt.",
  "Desde la ronda 2, una línea de fuego barre el campo cada ronda: 1 de daño de fuego a cada unidad que toca.",
  "Dal round 2, una linea di fuoco spazza il campo ogni round: 1 danno da fuoco a ogni unità che tocca.",
  "A partir da ronda 2, uma linha de fogo varre o campo em cada ronda: 1 de dano de fogo a cada unidade que toca.",
  "Mula round 2, may linya ng apoy na dumadaan sa larangan bawat round: 1 pinsalang apoy sa bawat yunit na madaanan nito.",
  "சுற்று 2 முதல், ஒவ்வொரு சுற்றும் ஒரு நெருப்புக் கோடு களத்தைக் கடக்கும்: அது தொடும் ஒவ்வொரு அலகுக்கும் 1 நெருப்புச் சேதம்.",
  "Mulai ronde 2, garis api menyapu medan setiap ronde: 1 kerusakan api ke setiap unit yang disentuhnya.",
  "从第 2 轮起，每轮有一道火线扫过战场：它碰到的每个单位受到 1 点火焰伤害。",
  "從第 2 輪起，每輪有一道火線掃過戰場：它碰到的每個單位受到 1 點火焰傷害。",
  "ラウンド2から、毎ラウンド炎の線が戦場を横切る：触れたユニットすべてに火炎ダメージ1。",
  "2라운드부터 매 라운드 불길의 선이 전장을 휩쓸어요: 닿는 모든 유닛에게 화염 피해 1."],
"A line of fire: 1 to every unit": [
  "Une ligne de feu : 1 à chaque unité", "Eine Feuerlinie: 1 an jede Einheit", "Una línea de fuego: 1 a cada unidad", "Una linea di fuoco: 1 a ogni unità",
  "Uma linha de fogo: 1 a cada unidade", "Linya ng apoy: 1 sa bawat yunit", "நெருப்புக் கோடு: ஒவ்வொரு அலகுக்கும் 1", "Garis api: 1 ke setiap unit",
  "一道火线：每个单位 1 点", "一道火線：每個單位 1 點", "炎の線：全ユニットに1", "불길의 선: 모든 유닛에게 1"],
"🔥 A line of fire sweeps across the scorched ground.": [
  "🔥 Une ligne de feu balaie le sol brûlé.", "🔥 Eine Feuerlinie fegt über den verbrannten Boden.", "🔥 Una línea de fuego barre el suelo abrasado.",
  "🔥 Una linea di fuoco spazza il terreno bruciato.", "🔥 Uma linha de fogo varre o chão queimado.", "🔥 Dumaan ang linya ng apoy sa nasusunog na lupa.",
  "🔥 எரிந்த நிலத்தின் குறுக்கே ஒரு நெருப்புக் கோடு கடக்கிறது.", "🔥 Garis api menyapu tanah yang hangus.", "🔥 一道火线扫过焦土。", "🔥 一道火線掃過焦土。",
  "🔥 炎の線が焦げた大地を横切る。", "🔥 불길의 선이 그을린 땅을 휩쓸어요."],
"It crosses both front lines from left to right. Units that resist fire, and Mountain Climbers, are spared.": [
  "Elle traverse les deux lignes de front de gauche à droite. Les unités qui résistent au feu et les Grimpeurs sont épargnés.",
  "Sie zieht von links nach rechts über beide Frontlinien. Feuerresistente Einheiten und Bergsteiger bleiben verschont.",
  "Cruza ambas líneas del frente de izquierda a derecha. Las unidades resistentes al fuego y los Escaladores se libran.",
  "Attraversa entrambe le prime linee da sinistra a destra. Le unità resistenti al fuoco e gli Scalatori sono risparmiati.",
  "Atravessa as duas linhas da frente da esquerda para a direita. As unidades resistentes ao fogo e os Escaladores são poupados.",
  "Tumatawid ito sa dalawang unahang hanay mula kaliwa pakanan. Ligtas ang mga yunit na matibay sa apoy at ang mga Mountain Climber.",
  "இது இரு முன்வரிசைகளையும் இடமிருந்து வலமாகக் கடக்கும். நெருப்பை எதிர்க்கும் அலகுகளும் மலையேறிகளும் தப்பும்.",
  "Ia melintasi kedua garis depan dari kiri ke kanan. Unit yang tahan api dan Pendaki Gunung tidak terkena.",
  "它从左到右穿过双方前线。抗火单位和登山者不受影响。", "它從左到右穿過雙方前線。抗火單位和登山者不受影響。",
  "両陣営の前列を左から右へ横切る。炎耐性のあるユニットと登山家は無事。", "양쪽 최전선을 왼쪽에서 오른쪽으로 지나가요. 화염 저항 유닛과 등반가는 무사해요."],
"Each round, 2 random units a side take 1 fire damage. Heat-resistant units are spared.": [
  "Au début de chaque tour, 2 unités au hasard de chaque camp subissent 1 dégât de feu. Les unités résistantes à la chaleur sont épargnées.",
  "Zu Beginn jeder Runde erleiden 2 zufällige Einheiten auf jeder Seite 1 Feuerschaden. Hitzeresistente Einheiten bleiben verschont.",
  "Al inicio de cada ronda, 2 unidades al azar de cada bando reciben 1 de daño de fuego. Las resistentes al calor se libran.",
  "All’inizio di ogni round, 2 unità a caso per lato subiscono 1 danno da fuoco. Le unità resistenti al calore sono risparmiate.",
  "No início de cada ronda, 2 unidades aleatórias de cada lado sofrem 1 de dano de fogo. As unidades resistentes ao calor são poupadas.",
  "Sa simula ng bawat round, 2 random na yunit sa bawat panig ang tatanggap ng 1 pinsalang apoy. Ligtas ang mga yunit na matibay sa init.",
  "ஒவ்வொரு சுற்றின் தொடக்கத்திலும், ஒவ்வொரு பக்கத்திலும் 2 சீரற்ற அலகுகள் 1 நெருப்புச் சேதம் பெறும். வெப்பம் தாங்கும் அலகுகள் தவிர்க்கப்படும்.",
  "Di awal setiap ronde, 2 unit acak di tiap sisi menerima 1 kerusakan api. Unit tahan panas tidak terkena.",
  "每轮开始时，双方各有 2 个随机单位受到 1 点火焰伤害。耐热单位不受影响。", "每輪開始時，雙方各有 2 個隨機單位受到 1 點火焰傷害。耐熱單位不受影響。",
  "毎ラウンド開始時、両陣営のランダムなユニット2体が火炎ダメージ1。熱耐性のあるユニットは無事。",
  "매 라운드 시작 시 양쪽의 무작위 유닛 2체가 화염 피해 1. 열 저항 유닛은 제외."],
}
assert all(len(v) == len(CODES) for v in T.values())
ph = lambda s: sorted(set(re.findall(r'\{\w+\}', s)))
assert all(ph(k) == ph(t) for k, v in T.items() for t in v)
def swap_last(s, a, b):
    i = s.rfind(a); assert i >= 0, (s, a); return s[:i] + b + s[i + len(a):]
def dump(path, d):
    with open(path, 'w', encoding='utf-8') as fh:
        json.dump(d, fh, ensure_ascii=False, indent=1); fh.write('\n')
if __name__ == '__main__':
    for i, code in enumerate(CODES):
        path = os.path.join(ROOT, 'lang', code + '.json'); ui = os.path.join(ROOT, 'lang', 'ui', code + '.json')
        pack = json.load(open(path, encoding='utf-8')); uipack = json.load(open(ui, encoding='utf-8'))
        for new, (old, a, b) in FROM_OLD.items():
            base = pack.pop(old, None) or uipack.pop(old, None)
            if base: uipack.pop(new, None); pack[new] = swap_last(base, a, b)
            elif new not in pack: raise SystemExit(f'{code}: no row to make "{new}" from')
        for old in DEAD: pack.pop(old, None); uipack.pop(old, None)
        for en, row in T.items(): uipack.pop(en, None); pack[en] = row[i]
        dump(path, pack); dump(ui, uipack)
    print('wrote', len(CODES), 'packs:', len(T) + len(FROM_OLD), 'rows each,', len(DEAD), 'dead rows dropped')
