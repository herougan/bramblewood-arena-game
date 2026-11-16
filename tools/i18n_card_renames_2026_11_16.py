#!/usr/bin/env python3
# 2026-11-16 (FOLD5): the owner's live renames folded into cards.json, so the lang/cards keys (English names) follow.
# Run once on the pre-FOLD5 lang/cards. Short forms drafted by Claude, to be reviewed in the i18n pass; "Golden Eagle" had no key.
import json, os
os.chdir(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..'))
R = {"Golden Eagle Diver": "Golden Eagle", "Planarian Splitter": "Planarian", "Platypus Spur": "Platypus", "Puffball Bombardier": "Puffball"}
NEW = ("Golden Eagle", "Planarian", "Platypus", "Puffball")
T = {
 'de': ("Steinadler", "Planarie", "Schnabeltier", "Bovist"), 'es': ("Águila real", "Planaria", "Ornitorrinco", "Bejín"),
 'fr': ("Aigle royal", "Planaire", "Ornithorynque", "Vesse-de-loup"), 'id': ("Elang Emas", "Planaria", "Platipus", "Jamur Puffball"),
 'it': ("Aquila reale", "Planaria", "Ornitorinco", "Vescia"), 'ja': ("イヌワシ", "プラナリア", "カモノハシ", "ホコリタケ"),
 'ko': ("검독수리", "플라나리아", "오리너구리", "먼지버섯"), 'pt': ("Águia-real", "Planária", "Ornitorrinco", "Bufa-de-lobo"),
 'ta': ("தங்கக் கழுகு", "பிளனேரியா", "பிளாடிபஸ்", "பஃப்பால்"), 'tl': ("Gintong Agila", "Planarya", "Platypus", "Puffball"),
 'zh-Hans': ("金雕", "涡虫", "鸭嘴兽", "马勃"), 'zh-Hant': ("金雕", "渦蟲", "鴨嘴獸", "馬勃")}
for code, vals in T.items():
    p = 'lang/cards/%s.json' % code; raw = open(p, encoding='utf8').read(); d = json.loads(raw)
    new = dict(zip(NEW, vals)); d = {k: v for k, v in d.items() if k not in R}  # file order is sectioned, not sorted: append
    d.update(new)
    open(p, 'w', encoding='utf8').write(json.dumps(d, ensure_ascii='\\u' in raw, indent=1) + ('\n' if raw.endswith('\n') else ''))
    print(p)
