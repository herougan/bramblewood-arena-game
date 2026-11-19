# DEC19-TEXT (2026-11-19): SKN1-1 Warcry "for the fight"; SKN1-18 Gain -> Deliver, On Turn Start -> Every Turn (labels and descriptions).
import json, re
C = ['fr','de','es','it','pt','tl','ta','id','zh-Hans','zh-Hant','ja','ko']
def old(c, en): return json.load(open(f'lang/{c}.json'))[en]
WAR_OLD = 'When played, your other units get +{n}/+{n}.'
WAR_ADD = dict(zip(C, [' pour le combat', ' pendant le combat', ' durante el combate', ' per tutto lo scontro', ' durante o combate', ' sa buong laban', '', ' selama pertarungan', '', '', '', '']))
WAR_FULL = {'zh-Hans': '打出时，你的其他单位在本场战斗中获得+{n}/+{n}。', 'zh-Hant': '打出時，你的其他單位在本場戰鬥中獲得+{n}/+{n}。',
            'ja': 'プレイ時、この戦闘の間、味方の他のユニットは+{n}/+{n}を得る。', 'ko': '낼 때 이번 전투 동안 아군의 다른 유닛이 +{n}/+{n}을 얻어요.',
            'ta': 'விளையாடும்போது, உன் மற்ற அலகுகள் போருக்கு +{n}/+{n} பெறும்.'}
war = {'en': 'When played, your other units get +{n}/+{n} for the fight.'}
for c in C:
    if c in WAR_FULL: war[c] = WAR_FULL[c]
    else:
        o = old(c, WAR_OLD); assert o.endswith('.'), c
        war[c] = o[:-1] + WAR_ADD[c] + '.'
# codex texts: swap the leading trigger phrase (up to the first colon)
PRE = {
 'mill': ('An On Turn Start trigger: ', 'An Every Turn trigger: ', ['Un déclencheur Chaque tour :','Ein Auslöser „Jeder Zug“:','Un disparador Cada turno:','Un innesco Ogni turno:','Um gatilho A cada turno:','Isang trigger na Bawat Turn:','ஒவ்வொரு திருப்பத் தூண்டி:','Pemicu Tiap Giliran:','每回合触发：','每回合觸發：','毎ターンのトリガー：','매 턴 트리거:']),
 'quarry': ('An On Turn Start trigger with a price: ', 'An Every Turn trigger with a price: ', ['Un déclencheur Chaque tour avec un prix :','Ein Auslöser „Jeder Zug“ mit Preis:','Un disparador Cada turno con precio:','Un innesco Ogni turno con un prezzo:','Um gatilho A cada turno com preço:','Isang trigger na Bawat Turn na may presyo:','விலையுடன் கூடிய ஒவ்வொரு திருப்பத் தூண்டி:','Pemicu Tiap Giliran dengan harga:','带代价的每回合触发：','帶代價的每回合觸發：','代償つきの毎ターンのトリガー：','대가가 있는 매 턴 트리거:']),
 'spawn': ('An On Turn Start trigger: ', 'An Every Turn trigger: ', ['Un déclencheur Chaque tour :','Ein Auslöser „Jeder Zug“:','Un disparador Cada turno:','Un innesco Ogni turno:','Um gatilho A cada turno:','Isang trigger na Bawat Turn:','ஒவ்வொரு திருப்பத் தூண்டி:','Pemicu Tiap Giliran:','每回合触发：','每回合觸發：','毎ターンのトリガー：','매 턴 트리거:']),
}
tx = {'ui.sk3-warcry': war}
for k, key in (('mill','ui.sk2-milling-codex'), ('quarry','ui.sk2-quarry-codex'), ('spawn','ui.sk3-spawner-codex')):
    en_old_pre, en_new_pre, news = PRE[k]
    src = [l for l in open('bramblewood-texts.js') if f'"{key}"' in l][0]
    en_old = json.loads(src.split('": ', 1)[1].rstrip().rstrip(','))
    assert en_old.startswith(en_old_pre)
    d = {'en': en_new_pre + en_old[len(en_old_pre):]}
    for c, n in zip(C, news):
        o = old(c, en_old); m = re.search(r'[:：]\s*', o)
        sep = '' if n[-1] == '：' else ' '
        d[c] = n + sep + o[m.end():]
    tx[key] = d
LAB = {'Deliver': ['Livrer','Liefern','Entregar','Consegna','Entregar','Ihatid','வழங்கு','Antar','送达','送達','届ける','전달'],
       'Every Turn': ['Chaque tour','Jeder Zug','Cada turno','Ogni turno','A cada turno','Bawat Turn','ஒவ்வொரு திருப்பம்','Tiap Giliran','每回合','每回合','毎ターン','매 턴']}
TABLE = {'tx': tx, 'flavor': {k: dict(zip(C, v)) for k, v in LAB.items()}, 'pack': {k: dict(zip(C, v)) for k, v in LAB.items()}}
