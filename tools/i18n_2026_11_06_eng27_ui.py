#!/usr/bin/env python3
"""ENG27 (2026-11-06): the hard-coded English skill texts ENG27 changed in arena_app.js, re-keyed in lang/ui/<code>.json with their
translations moved along:
  - Arrow, Fire Arrow, Ice Arrow, Twin Shot, Volley: "at Speed 1 (after Quick units, before the rest swing)" -> "at Speed 0 (after the
    swings)" (owner item 11: arrows and arrow-likes act at Speed 0, after the swings); the bolts keep Speed 1;
  - Quick's long text (Bolts at 1, Arrows at 0); the Helmet's two texts (it is gone after one block, owner item 32).
    python3 tools/i18n_2026_11_06_eng27_ui.py   (idempotent)"""
import json, os, re
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
CODES = ['fr', 'de', 'es', 'it', 'pt', 'tl', 'ta', 'id', 'zh-Hans', 'zh-Hant', 'ja', 'ko']
OLD, NEW = 'at Speed 1 (after Quick units, before the rest swing)', 'at Speed 0 (after the swings)'
AFTER = {'fr': 'après les frappes', 'de': 'nach den Hieben', 'es': 'después de los golpes', 'it': 'dopo i colpi', 'pt': 'depois dos golpes',
  'tl': 'pagkatapos ng mga hampas', 'ta': 'அடிகளுக்குப் பின்', 'id': 'setelah ayunan', 'zh-Hans': '在攻击之后', 'zh-Hant': '在攻擊之後', 'ja': '攻撃の後', 'ko': '공격 후'}
ARROWS = ['looses a volley', 'shoots a flaming arrow', 'shoots an arrow', 'shoots an icy arrow', 'shoots two arrows']
H1_OLD = 'Half the time, an arrow, missile or single bolt aimed at it glances off the helmet.'
H1_NEW = H1_OLD + ' After one block the helmet is gone.'
H1_ADD = {'fr': 'Après un blocage, le casque est perdu.', 'de': 'Nach einem Block ist der Helm weg.', 'es': 'Tras un bloqueo, el casco se pierde.',
  'it': "Dopo un blocco l'elmo è perso.", 'pt': 'Depois de um bloqueio, o capacete perde-se.', 'tl': 'Pagkatapos ng isang salag, wala na ang helmet.',
  'ta': 'ஒருமுறை தடுத்த பின் கவசம் போய்விடும்.', 'id': 'Setelah sekali menahan, helmnya hilang.', 'zh-Hans': '挡下一次后，头盔就没了。', 'zh-Hant': '擋下一次後，頭盔就沒了。',
  'ja': '一度防ぐとヘルメットは失われる。', 'ko': '한 번 막으면 투구는 사라집니다.'}
H2_OLD, H2_NEW = 'Half the arrows, missiles and bolts aimed at it glance off.', 'Half the shots aimed at it glance off, once; then the helmet is gone.'
H2 = {'fr': 'La moitié des tirs qui la visent ricochent, une fois ; ensuite le casque est perdu.', 'de': 'Die Hälfte der Schüsse auf sie prallt ab, einmal; dann ist der Helm weg.',
  'es': 'La mitad de los disparos rebotan, una vez; luego el casco se pierde.', 'it': "Metà dei tiri rimbalza, una volta; poi l'elmo è perso.",
  'pt': 'Metade dos disparos ressalta, uma vez; depois o capacete perde-se.', 'tl': 'Kalahati ng mga tira ay tumatalbog, minsan; tapos wala na ang helmet.',
  'ta': 'அதை நோக்கிய எய்தல்களில் பாதி ஒருமுறை தெறிக்கும்; பின் கவசம் போய்விடும்.', 'id': 'Separuh tembakan ke arahnya memantul, sekali; lalu helmnya hilang.',
  'zh-Hans': '射向它的攻击有一半会被弹开，仅一次；之后头盔就没了。', 'zh-Hant': '射向它的攻擊有一半會被彈開，僅一次；之後頭盔就沒了。',
  'ja': '狙った射撃の半分を一度だけ弾く。その後ヘルメットは失われる。', 'ko': '노리는 사격의 절반을 한 번 튕겨 냅니다. 그 뒤 투구는 사라집니다.'}
Q_OLD = 'Swings at Speed 2: before Arrows and Bolts (Speed 1) and before units without Quick (Speed 0). Speed and Haste add to it.'
Q_NEW = 'Swings at Speed 2: before Bolts (Speed 1), then other swings and Arrows (Speed 0). Speed and Haste add to it.'
Q = {'fr': 'Frappe à Vitesse 2 : avant les carreaux (Vitesse 1), puis les autres frappes et les flèches (Vitesse 0). Vitesse et Hâte s’y ajoutent.',
  'de': 'Schlägt mit Tempo 2 zu: vor Bolzen (Tempo 1), dann andere Hiebe und Pfeile (Tempo 0). Tempo und Eile addieren sich dazu.',
  'es': 'Golpea a Velocidad 2: antes de los virotes (Velocidad 1), luego otros golpes y flechas (Velocidad 0). Velocidad y Prisa se suman.',
  'it': 'Colpisce a Velocità 2: prima dei dardi (Velocità 1), poi altri colpi e frecce (Velocità 0). Velocità e Fretta si sommano.',
  'pt': 'Golpeia a Velocidade 2: antes dos virotes (Velocidade 1), depois outros golpes e flechas (Velocidade 0). Velocidade e Pressa somam-se.',
  'tl': 'Humahampas sa Bilis 2: bago ang mga bolt (Bilis 1), saka ang ibang hampas at mga palaso (Bilis 0). Nadaragdag ang Bilis at Dali.',
  'ta': 'வேகம் 2-இல் அடிக்கும்: அம்புகளுக்கு (வேகம் 1) முன், பின் மற்ற அடிகளும் கணைகளும் (வேகம் 0). வேகமும் விரைவும் கூடும்.',
  'id': 'Mengayun pada Kecepatan 2: sebelum Baut (Kecepatan 1), lalu ayunan lain dan Panah (Kecepatan 0). Kecepatan dan Gegas menambahnya.',
  'zh-Hans': '以速度 2 攻击：先于弩箭（速度 1），然后是其他攻击和箭（速度 0）。速度和急速可叠加。', 'zh-Hant': '以速度 2 攻擊：先於弩箭（速度 1），然後是其他攻擊和箭（速度 0）。速度和急速可疊加。',
  'ja': '速度2で攻撃：ボルト（速度1）より先、その後に他の攻撃と矢（速度0）。速度と加速は加算。', 'ko': '속도 2로 공격: 볼트(속도 1)보다 먼저, 그다음 다른 공격과 화살(속도 0). 속도와 신속이 더해집니다.'}
moved = 0
for c in CODES:
    p = os.path.join(ROOT, 'lang', 'ui', c + '.json'); d = json.load(open(p, encoding='utf-8')); out = {}
    for k, v in d.items():
        if OLD in k and any(a in k for a in ARROWS):
            # the translation: Speed's number 1 -> 0 (the first standalone 1), its bracket -> "after the swings"
            n1 = re.search(r'(?<![\d{])1(?=\s*[（(])', v); assert n1, (c, k)  # Speed's 1: the 1 right before its bracket
            v2 = v[:n1.start()] + '0' + v[n1.end():]
            m = re.compile(r'[（(]').search(v2, n1.end())
            close = '）' if v2[m.start()] == '（' else ')'; j = v2.index(close, m.start()); v2 = v2[:m.start() + 1] + AFTER[c] + v2[j:]
            out[k.replace(OLD, NEW)] = v2; moved += 1; continue
        if k == H1_OLD: out[H1_NEW] = v.rstrip() + ' ' + H1_ADD[c]; moved += 1; continue
        if k == H2_OLD: out[H2_NEW] = H2[c]; moved += 1; continue
        if k == Q_OLD: out[Q_NEW] = Q[c]; moved += 1; continue
        out[k] = v
    with open(p, 'w', encoding='utf-8') as fh: json.dump(out, fh, ensure_ascii=False, indent=1); fh.write('\n')
print('ok: %d rows re-keyed' % moved)
