#!/usr/bin/env python3
"""Game texts changed on 2026-10-24 by package BAL3: Rising Tide (a selfish boon) gives +1 Attack as well as Quick (owner DF3-3).
The old English line's translations are kept beside the new one (an older pack still reads them).
Tagalog, Tamil, Japanese and Korean deserve a native read.   python3 tools/i18n_2026_10_24_bal3.py"""
import json, os, re
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
CODES = ['fr', 'de', 'es', 'it', 'pt', 'tl', 'ta', 'id', 'zh-Hans', 'zh-Hant', 'ja', 'ko']
T = {
"Their Tide units are Quick and have +1 Attack while the tide is in. Theirs only: on while at least half their deck has Tide.": [
 "Leurs unités de Marée sont Vives et ont +1 d’Attaque tant que la marée est haute. Pour eux seuls : actif tant qu’au moins la moitié de leur deck a Marée.",
 "Ihre Flut-Einheiten sind Schnell und haben +1 Angriff, solange die Flut steht. Nur für sie: aktiv, solange mindestens die Hälfte ihres Decks Flut hat.",
 "Sus unidades de Marea son Rápidas y tienen +1 de Ataque mientras la marea está alta. Solo para ellos: activo mientras al menos la mitad de su mazo tenga Marea.",
 "Le loro unità di Marea sono Rapide e hanno +1 Attacco finché la marea è alta. Solo per loro: attivo finché almeno metà del loro mazzo ha Marea.",
 "As unidades de Maré deles são Rápidas e têm +1 de Ataque enquanto a maré está cheia. Só para eles: ativo enquanto pelo menos metade do baralho deles tiver Maré.",
 "Mabilis at may +1 Attack ang mga yunit nilang Alon habang mataas ang alon. Para sa kanila lang: bukas habang kalahati man lang ng deck nila ay may Alon.",
 "அலை ஏறியிருக்கும்போது அவர்களின் அலை அலகுகள் விரைவானவை, +1 தாக்குதலும் பெறும். அவர்களுக்கு மட்டும்: அவர்கள் அடுக்கில் குறைந்தது பாதிக்கு அலை இருந்தால் இயங்கும்.",
 "Unit Pasang mereka Cepat dan mendapat +1 Serangan selama air pasang. Hanya untuk mereka: aktif selama setidaknya setengah dek mereka punya Pasang.",
 "涨潮时，他们的潮汐单位获得敏捷和+1攻击。仅限对方：只要他们的牌组至少一半有潮汐就生效。",
 "漲潮時，他們的潮汐單位獲得敏捷和+1攻擊。僅限對方：只要他們的牌組至少一半有潮汐就生效。",
 "潮が満ちている間、敵の潮ユニットは素早く、攻撃+1。相手専用：デッキの半分以上が潮を持つ間だけ有効。",
 "물이 들어와 있는 동안 적의 물결 유닛은 신속해지고 공격 +1을 얻어요. 상대 전용: 덱의 절반 이상이 물결을 가진 동안 켜져요."],
}
def dump(path, d):
    with open(path, 'w', encoding='utf-8') as fh:
        json.dump(d, fh, ensure_ascii=False, indent=1); fh.write('\n')
ph = lambda s: sorted(set(re.findall(r'\{\w+\}', s)))
for i, code in enumerate(CODES):
    path = os.path.join(ROOT, 'lang', code + '.json'); pack = json.load(open(path, encoding='utf-8'))
    for en, row in T.items():
        assert ph(en) == ph(row[i]), (code, en)
        pack[en] = row[i]
    dump(path, pack)
print('wrote', len(CODES), 'packs')
