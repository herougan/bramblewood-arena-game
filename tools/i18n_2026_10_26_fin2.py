#!/usr/bin/env python3
"""2026-10-26 (package FIN2-a, owner 23:46 #1: "Bramble Armor: Fortify instead."): the bramble skill's name is Fortify (engine key
brambleArmor and the TX keys kept). Rewrites the English of the TX keys that show the name in bramblewood-texts.js and re-keys the
12 lang/<code>.json rows (the old English row is dropped once nothing else uses it). The log line is peeled of its leading emoji in the
packs (i18n-templates), as EN3 stored it.
Fortify sits beside Fortification (SK2, builds a Palisade); each language's Fortify is a different word from its Fortification.
Tagalog, Tamil, Japanese and Korean deserve a native read.
    python3 tools/i18n_2026_10_26_fin2.py"""
import json, os, re
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
CODES = ['fr', 'de', 'es', 'it', 'pt', 'tl', 'ta', 'id', 'zh-Hans', 'zh-Hant', 'ja', 'ko']
NAME = ['Fortifier', 'Festigen', 'Fortalecer', 'Rinforzo', 'Reforçar', 'Patibayin', 'வலுப்படுத்து', 'Perkuat', '加固', '加固', '補強', '보강']
# key, old English, new English, translations (None: the old translation with the old name swapped for NAME)
K = [
 ('ui.skn-bramble-armor', 'Bramble Armor', 'Fortify', NAME),
 ('ui.en3-log-bramble-armor', "🌿🛡️ {name}'s Bramble Armor takes 1 off the hit on its bramble.", '🌿🛡️ {name} fortifies its bramble: the hit is 1 less.',
  ['{name} fortifie sa ronce : le coup fait 1 de moins.', '{name} festigt seinen Dorn: der Treffer ist 1 schwächer.', '{name} fortalece su zarza: el golpe hace 1 menos.',
   '{name} rinforza il suo rovo: il colpo fa 1 in meno.', '{name} reforça a sua silva: o golpe tira 1 a menos.', 'Pinatibay ni {name} ang bramble nito: kulang nang 1 ang tama.',
   '{name} தன் முட்புதரை வலுப்படுத்துகிறது: தாக்குதல் 1 குறைவு.', '{name} memperkuat semak durinya: serangan berkurang 1.', '{name} 加固了荆棘：这次攻击少 1 点。',
   '{name} 加固了荊棘：這次攻擊少 1 點。', '{name} が砦を補強：この攻撃は1少ない。', '{name}이(가) 가시덤불을 보강했어요: 이번 공격은 1 적어요.']),
 ('ui.sk-breach-codex', 'Only a melee swing that lands on a unit, whatever the hit did to it. Rampart and Bramble Armor still cut it.',
  'Only a melee swing that lands on a unit, whatever the hit did to it. Rampart and Fortify still cut it.', None),
 ('ui.sk-shot-bramble-codex', 'Add it beside the shot. The shot never misses the bramble; Rampart and Bramble Armor still cut it.',
  'Add it beside the shot. The shot never misses the bramble; Rampart and Fortify still cut it.', None),
]
# the old name as each existing sentence spells it (longest first)
OLD = {'fr': ['Armure de ronce'], 'de': ['Dornenrüstung'], 'es': ['Armadura de zarza'], 'it': ['Armatura di rovo'], 'pt': ['Armadura de silvado', 'Armadura de silva'],
       'tl': ['ng Baluti ng Bramble', 'Baluting Bramble', 'Baluti ng Bramble'], 'ta': ['முட்புதர்க் கவசமும்', 'முட்புதர் கவசமும்'], 'id': ['Zirah Semak Duri', 'Zirah Semak'],
       'zh-Hans': ['荆棘护甲'], 'zh-Hant': ['荊棘護甲'], 'ja': ['イバラの鎧', '砦の鎧'], 'ko': ['가시덤불 갑옷']}
NEW_IN_SENTENCE = {'tl': {'ng Baluti ng Bramble': 'ng Patibayin', 'Baluting Bramble': 'Patibayin', 'Baluti ng Bramble': 'Patibayin'},
                   'ta': {'முட்புதர்க் கவசமும்': 'வலுப்படுத்து திறனும்', 'முட்புதர் கவசமும்': 'வலுப்படுத்து திறனும்'}}
EMOJI_LEAD = re.compile(r'^[^\w{(\[]+\s')
peel = lambda s: EMOJI_LEAD.sub('', s)
ph = lambda s: sorted(set(re.findall(r'\{\w+\}', s)))
def dump(path, d):
    with open(path, 'w', encoding='utf-8') as fh:
        json.dump(d, fh, ensure_ascii=False, indent=1); fh.write('\n')
tp = os.path.join(ROOT, 'bramblewood-texts.js'); src = open(tp, encoding='utf-8').read()
for k, old, new, _ in K:
    a, b = '"' + k + '": ' + json.dumps(old, ensure_ascii=False), '"' + k + '": ' + json.dumps(new, ensure_ascii=False)
    if b in src: continue
    assert src.count(a) == 1, k
    src = src.replace(a, b)
open(tp, 'w', encoding='utf-8').write(src)
assert 'Bramble Armor' not in ''.join(re.findall(r'"ui\.[^"]+": ("(?:[^"\\]|\\.)*")', src)), 'a TX text still says Bramble Armor'
used = lambda en: json.dumps(en, ensure_ascii=False) in src
for i, code in enumerate(CODES):
    path = os.path.join(ROOT, 'lang', code + '.json'); pack = json.load(open(path, encoding='utf-8'))
    for k, old, new, row in K:
        o, n = (peel(old), peel(new)) if k.startswith('ui.en3-log') else (old, new)
        if row is not None: tr = row[i]
        else:
            prev = pack.get(o)
            if prev is None: assert n in pack, (code, k); continue  # already done
            hit = next((x for x in OLD[code] if x in prev), None); assert hit, (code, k, prev)
            tr = prev.replace(hit, NEW_IN_SENTENCE.get(code, {}).get(hit, NAME[i]))
        assert ph(tr) == ph(n), (code, k)
        if not used(old): pack.pop(o, None)
        pack[n] = tr
    dump(path, pack)
print('ok: 12 packs,', len(K), 'texts')
