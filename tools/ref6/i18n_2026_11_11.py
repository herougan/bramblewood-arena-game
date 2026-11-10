# 2026-11-11 (package REF6, owner 00:16: "Make sure the win rates for reference decks are labelled in the skirmish for admins"): the admin label's texts.
#   python3 tools/ref6/i18n_2026_11_11.py   adds the keys to bramblewood-texts.js and their rows to lang/<code>.json (keyed by English text, new rows
#                                           at the end). Safe to run again. Does not run keyify.
import json, re
CODES = ['fr', 'de', 'es', 'it', 'pt', 'tl', 'ta', 'id', 'zh-Hans', 'zh-Hant', 'ja', 'ko']
def T(en, *tr):
    assert len(tr) == 12, en
    return (en, dict(zip(CODES, tr)))
NEW = {
 'ui.ref6-label': T('Ref {k}: {pct}% (p10 {lo} – p90 {hi})', 'Réf {k} : {pct} % (p10 {lo} – p90 {hi})', 'Ref {k}: {pct} % (p10 {lo} – p90 {hi})', 'Ref {k}: {pct} % (p10 {lo} – p90 {hi})', 'Rif {k}: {pct}% (p10 {lo} – p90 {hi})', 'Ref {k}: {pct}% (p10 {lo} – p90 {hi})', 'Ref {k}: {pct}% (p10 {lo} – p90 {hi})', 'Ref {k}: {pct}% (p10 {lo} – p90 {hi})', 'Ref {k}: {pct}% (p10 {lo} – p90 {hi})', '参考{k}：{pct}%（p10 {lo} – p90 {hi}）', '參考{k}：{pct}%（p10 {lo} – p90 {hi}）', '参考{k}：{pct}%（p10 {lo} – p90 {hi}）', '참고 {k}: {pct}% (p10 {lo} – p90 {hi})'),
 'ui.ref6-mapref': T('Map ref {pct}%', 'Réf. carte {pct} %', 'Kartenref. {pct} %', 'Ref. mapa {pct} %', 'Rif. mappa {pct}%', 'Ref. mapa {pct}%', 'Map ref {pct}%', 'வரைபட மேற். {pct}%', 'Ref. peta {pct}%', '地图参考 {pct}%', '地圖參考 {pct}%', 'マップ基準 {pct}%', '지도 기준 {pct}%'),
 'ui.ref6-ref2': T('Ref-2 {pct}%', 'Réf-2 {pct} %', 'Ref-2 {pct} %', 'Ref-2 {pct} %', 'Rif-2 {pct}%', 'Ref-2 {pct}%', 'Ref-2 {pct}%', 'Ref-2 {pct}%', 'Ref-2 {pct}%', '参考-2 {pct}%', '參考-2 {pct}%', '参考2 {pct}%', '참고-2 {pct}%'),
 'ui.ref6-tip': T("Measure {tag}, {date}: the {k} reference players' decks against this fight, {g} games in all (at least {n} a deck); p10 / p90 without the game noise. Map reference and Reference-2: {m} games each.",
   "Mesure {tag}, {date} : les decks des {k} joueurs de référence contre ce combat, {g} parties en tout (au moins {n} par deck) ; p10 / p90 sans le bruit des parties. Référence de la carte et Référence-2 : {m} parties chacune.",
   "Messung {tag}, {date}: die Decks der {k} Referenzspieler gegen diesen Kampf, {g} Partien insgesamt (mindestens {n} je Deck); p10 / p90 ohne das Rauschen der Partien. Kartenreferenz und Referenz-2: je {m} Partien.",
   "Medición {tag}, {date}: los mazos de los {k} jugadores de referencia contra este combate, {g} partidas en total (al menos {n} por mazo); p10 / p90 sin el ruido de las partidas. Referencia del mapa y Referencia-2: {m} partidas cada una.",
   "Misura {tag}, {date}: i mazzi dei {k} giocatori di riferimento contro questo scontro, {g} partite in tutto (almeno {n} per mazzo); p10 / p90 senza il rumore delle partite. Riferimento della mappa e Riferimento-2: {m} partite ciascuno.",
   "Medição {tag}, {date}: os baralhos dos {k} jogadores de referência contra esta luta, {g} partidas no total (pelo menos {n} por baralho); p10 / p90 sem o ruído das partidas. Referência do mapa e Referência-2: {m} partidas cada.",
   "Sukat {tag}, {date}: ang mga deck ng {k} reference player laban sa labang ito, {g} laro lahat (hindi bababa sa {n} bawat deck); p10 / p90 nang walang ingay ng laro. Map reference at Reference-2: {m} laro bawat isa.",
   "அளவீடு {tag}, {date}: இந்தச் சண்டைக்கு எதிராக {k} மேற்கோள் வீரர்களின் டெக்குகள், மொத்தம் {g} ஆட்டங்கள் (ஒவ்வொரு டெக்கிற்கும் குறைந்தது {n}); p10 / p90 ஆட்ட இரைச்சல் இல்லாமல். வரைபட மேற்கோள் மற்றும் Reference-2: தலா {m} ஆட்டங்கள்.",
   "Pengukuran {tag}, {date}: deck {k} pemain referensi melawan pertarungan ini, total {g} permainan (minimal {n} per deck); p10 / p90 tanpa derau permainan. Referensi peta dan Referensi-2: masing-masing {m} permainan.",
   "测量 {tag}，{date}：{k} 名参考玩家的卡组对此战斗，共 {g} 局（每副至少 {n} 局）；p10 / p90 已去除对局噪声。地图参考与参考-2：各 {m} 局。",
   "測量 {tag}，{date}：{k} 名參考玩家的牌組對此戰鬥，共 {g} 局（每副至少 {n} 局）；p10 / p90 已去除對局雜訊。地圖參考與參考-2：各 {m} 局。",
   "測定 {tag}、{date}：参考プレイヤー{k}人のデッキでこの戦闘を計{g}戦（各デッキ最低{n}戦）。p10 / p90 は対戦のばらつきを除いた値。マップ基準デッキと参考2：各{m}戦。",
   "측정 {tag}, {date}: 참고 플레이어 {k}명의 덱으로 이 전투를 총 {g}판 (덱마다 최소 {n}판). p10 / p90은 대전 잡음을 뺀 값. 지도 기준 덱과 참고-2: 각 {m}판."),
}
LEAD = re.compile(r'^[\s \U0001F000-\U0001FAFF☀-➿️‍]+')
def core(t): return LEAD.sub('', t.strip())
TX_LINE = re.compile(r'^(\s*)"([^"]+)":\s*"((?:[^"\\]|\\.)*)"(,?)\s*$')
def jdump(s): return json.dumps(s, ensure_ascii=False)[1:-1]
path = 'bramblewood-texts.js'; L = open(path, encoding='utf-8').read().split('\n')
end = next(i for i, l in enumerate(L) if l.startswith('}/*TEXT-TABLE-END*/'))
have = set(TX_LINE.match(l).group(2) for l in L if TX_LINE.match(l))
dropped = []  # a key whose English changed: its line is rewritten, its old row leaves the packs
for i, l in enumerate(L):
    m = TX_LINE.match(l)
    if m and m.group(2) in NEW and json.loads('"' + m.group(3) + '"') != NEW[m.group(2)][0]:
        dropped.append(core(json.loads('"' + m.group(3) + '"'))); L[i] = '%s"%s": "%s"%s' % (m.group(1), m.group(2), jdump(NEW[m.group(2)][0]), m.group(4))
add = [k for k in NEW if k not in have]
if add:
    if not L[end - 1].rstrip().endswith(','): L[end - 1] = L[end - 1].rstrip() + ','
    L[end:end] = ['  "%s": "%s"%s' % (k, jdump(NEW[k][0]), ',' if j < len(add) - 1 else '') for j, k in enumerate(add)]
open(path, 'w', encoding='utf-8').write('\n'.join(L))
for code in CODES:
    p = 'lang/%s.json' % code; d = json.load(open(p, encoding='utf-8'))
    for e in dropped: d.pop(e, None)
    for k in NEW:
        en, tr = core(NEW[k][0]), core(NEW[k][1][code])
        if en not in d: d[en] = tr
    open(p, 'w', encoding='utf-8').write(json.dumps(d, ensure_ascii=False, indent=1) + '\n')
print('texts: %d keys added, %d changed' % (len(add), len(dropped)))
