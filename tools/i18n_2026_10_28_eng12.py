#!/usr/bin/env python3
"""Game texts added on 2026-10-28 by package ENG12 (the owner's 10-28 09:48 notes L1, L10): Ambush strikes the moment a unit comes into its
watch, even at the round's start, and not while the ambusher is Asleep (or Stunned, Frozen, Chained, stone); an Asleep Banana unit neither
eats nor throws. Adds the English rows to bramblewood-texts.js (before the table's end) and the translations to the 12 packs in lang/. An
older, reviewed pack row wins. Tagalog, Tamil, Japanese and Korean deserve a native read.
    python3 tools/i18n_2026_10_28_eng12.py"""
import json, os, re
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
CODES = ['fr', 'de', 'es', 'it', 'pt', 'tl', 'ta', 'id', 'zh-Hans', 'zh-Hant', 'ja', 'ko']
# key, English, [12 translations in CODES order]
ROWS = [
 ('ui.e12-ambush-codex', "It strikes at once, even when a unit walks in at the round's start (Restless, the wind, a spell). Not while it is Asleep, Stunned, Frozen, Chained or turned to stone.", [
   "Elle frappe aussitôt, même quand une unité arrive au début du tour (Agitée, le vent, un sort). Pas tant qu’elle est endormie, Étourdie, Gelée, Enchaînée ou changée en pierre.",
   "Sie schlägt sofort zu, auch wenn eine Einheit zu Rundenbeginn hereinkommt (Rastlos, der Wind, ein Zauber). Nicht, solange sie schlafend, betäubt, gefroren, angekettet oder zu Stein ist.",
   "Golpea al instante, aunque una unidad llegue al inicio de la ronda (Inquieta, el viento, un hechizo). No mientras esté dormida, Aturdida, Congelada, Encadenada o convertida en piedra.",
   "Colpisce subito, anche quando un’unità entra all’inizio del round (Irrequieta, il vento, un incantesimo). Non mentre è addormentata, Stordita, Congelata, Incatenata o tramutata in pietra.",
   "Golpeia de imediato, mesmo quando uma unidade entra no início da ronda (Inquieta, o vento, um feitiço). Não enquanto estiver a dormir, Atordoada, Congelada, Acorrentada ou feita pedra.",
   "Agad itong umaatake, kahit pumasok ang yunit sa simula ng round (Balisa, ang hangin, isang spell). Hindi habang ito ay tulog, Tuliro, Nagyelo, Nakakadena o naging bato.",
   "ஒரு அலகு உள்ளே வந்தவுடனே தாக்கும், சுற்றின் தொடக்கத்தில் வந்தாலும் கூட (அமைதியற்ற, காற்று, ஒரு மந்திரம்). தூங்கும்போது, மயக்கத்தில், உறைந்திருக்கும்போது, சங்கிலியில் அல்லது கல்லாக மாறியிருக்கும்போது இல்லை.",
   "Ia langsung menyerang, bahkan saat unit masuk di awal ronde (Gelisah, angin, sebuah mantra). Tidak saat ia tertidur, Pingsan, Beku, Terantai, atau menjadi batu.",
   "单位一进入就立刻出手，即使是在回合开始时进来（躁动、风、法术）。睡眠、眩晕、冰冻、被锁链束缚或石化时不会出手。",
   "單位一進入就立刻出手，即使是在回合開始時進來（躁動、風、法術）。睡眠、眩暈、冰凍、被鎖鏈束縛或石化時不會出手。",
   "ユニットが入ってきた瞬間に攻撃する。ラウンド開始時に入ってきた場合も同じ（落ち着きなし、風、呪文）。睡眠・スタン・凍結・鎖・石化の間は攻撃しない。",
   "유닛이 들어오는 즉시 공격합니다. 라운드 시작에 들어와도 마찬가지입니다(불안, 바람, 주문). 수면, 기절, 빙결, 사슬, 석화 상태에서는 공격하지 않습니다."]),
 ('ui.e12-banana-codex', 'Not while it is Asleep, Stunned, Frozen or turned to stone.', [
   "Pas tant qu’elle est endormie, Étourdie, Gelée ou changée en pierre.",
   "Nicht, solange sie schlafend, betäubt, gefroren oder zu Stein ist.",
   "No mientras esté dormida, Aturdida, Congelada o convertida en piedra.",
   "Non mentre è addormentata, Stordita, Congelata o tramutata in pietra.",
   "Não enquanto estiver a dormir, Atordoada, Congelada ou feita pedra.",
   "Hindi habang ito ay tulog, Tuliro, Nagyelo o naging bato.",
   "தூங்கும்போது, மயக்கத்தில், உறைந்திருக்கும்போது அல்லது கல்லாக மாறியிருக்கும்போது இல்லை.",
   "Tidak saat ia tertidur, Pingsan, Beku, atau menjadi batu.",
   "睡眠、眩晕、冰冻或石化时不会。",
   "睡眠、眩暈、冰凍或石化時不會。",
   "睡眠・スタン・凍結・石化の間はしない。",
   "수면, 기절, 빙결, 석화 상태에서는 하지 않습니다."]),
]
def dump(path, d):
    with open(path, 'w', encoding='utf-8') as fh:
        json.dump(d, fh, ensure_ascii=False, indent=1); fh.write('\n')
ph = lambda s: sorted(set(re.findall(r'\{\w+\}', s)))
TP = os.path.join(ROOT, 'bramblewood-texts.js'); src = open(TP, encoding='utf-8').read()
end = src.index('\n}/*TEXT-TABLE-END*/')
add = [(k, en) for k, en, _ in ROWS if ('"%s":' % k) not in src]
if add:
    src = src[:end] + ',\n' + ',\n'.join('  %s: %s' % (json.dumps(k), json.dumps(en, ensure_ascii=False)) for k, en in add) + src[end:]
    open(TP, 'w', encoding='utf-8').write(src)
for k, en, row in ROWS: assert json.dumps(en, ensure_ascii=False) in src, en
for i, code in enumerate(CODES):
    path = os.path.join(ROOT, 'lang', code + '.json'); pack = json.load(open(path, encoding='utf-8'))
    for k, en, row in ROWS:
        assert len(row) == len(CODES) and ph(en) == ph(row[i]), (code, en)
        if en in pack: continue  # an older, reviewed row wins
        pack[en] = row[i]
    dump(path, pack)
print('texts: %d new keys; wrote %d packs, %d texts each' % (len(add), len(CODES), len(ROWS)))
