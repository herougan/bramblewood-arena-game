#!/usr/bin/env python3
"""2026-11-08 (package UI35, owner 10:52 #22): bake section 2 of docs/design/skill-distribution-codex-draft-2026-11-08.md
into canonical/codex-skill-suggestions.json. Names are matched to the skill keys in arena_app.js (by label, with the ALIAS table
for spellings the draft uses); names with no skill yet (new skills, creature abilities) stay text-only under "unmatched".
Run: python3 tools/codex_skill_suggestions.py   (idempotent)"""
import re, json, os
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
app = open(os.path.join(ROOT, 'arena_app.js'), encoding='utf-8').read()
draft = open(os.path.join(ROOT, 'docs/design/skill-distribution-codex-draft-2026-11-08.md'), encoding='utf-8').read()
label2key = {}
for m in re.finditer(r"\{key:'([A-Za-z0-9_]+)'[^\n]*?label:'([^']+)'", app):
    k, lab = m.group(1), m.group(2)
    if 'retired:true' in m.group(0) or 'hidden:true' in m.group(0): continue
    label2key.setdefault(lab.lower(), k)
ALIAS = {'echolocate': 'sonar', 'dark sight': 'darksight', 'paralysis': 'paralyze', 'armour': 'armor', 'forage': 'foraging', 'smoke screen': 'smokeBomb',
         'force of nature': None, 'frost bolt': None, 'fire bolt': None, 'wet': None, 'vaccinate': None, 'swimmer': None, 'snare': None,
         'toxic gas': 'poisonGas', 'high thorns': None, 'rend': None, 'burrow': None, 'cold': None, 'fire resistance': None,
         'adrenaline': None, 'tide': 'tide', 'poison': 'poison', 'gorge': 'fester', 'leech': 'sap', 'harbinger': 'harbinger', 'pickpocket': 'pickpocket', 'dive': 'dive', 'parasite': 'parasite', 'slow': 'slow', 'carnage': 'carnage', 'blitz': 'blitz', 'bola': 'bola', 'lasso': 'lasso', 'constrict': 'constrict', 'sleep': 'sleep', 'immunity': 'immunity', 'poison barbs': 'poisonBarbs', 'acid': 'acidBolt', 'brittle': 'brittle', 'stench': 'stench', 'breach': 'breach', 'heat': 'heat', 'hibernate': 'hibernate', 'confusion': 'confuse', 'heal': 'healing', 'cleave': 'sweep', 'stampede': 'overwhelm', 'tangleweed': 'tangle', 'molting': 'molting', 'twin strike': 'twinStrike', 'natures force': None}
def key_for(name):
    n = name.strip().lower()
    if n in ALIAS: return ALIAS[n]
    return label2key.get(n)
known = set(re.findall(r"\{key:'([A-Za-z0-9_]+)'", app))
maps = {}
for mid, num in re.findall(r"\{id:'([a-z0-9]+)'[^\n]{0,400}?\bn:(\d+)\b", ''): pass
# map number -> id, from the road order in the previous run's probe (mainConquestMaps)
ORDER = ['m1', 'mf', 'mb', 'mc', 'm2', 'mw', 'm8', 'mu', 'm4', 'mk', 'm7', 'm10', 'mh', 'mr', 'm5', 'ml', 'mt', 'm6', 'md', 'm3', 'm11']
block = draft.split('```tsv')[1].split('```')[0].strip().split('\n')[1:]
out = {}
for line in block:
    cols = line.split('\t')
    num = int(cols[0].split()[0]); mid = ORDER[num]
    ent = {'name': cols[0].split(' ', 1)[1], 'sig': [], 'side': [], 'oneoff': [s.strip() for s in cols[3].split(';') if s.strip()] if len(cols) > 3 else [], 'unmatched': []}
    for col, field in ((1, 'sig'), (2, 'side')):
        for nm in [s.strip() for s in cols[col].split(';') if s.strip()]:
            parts = [nm] if '/' not in nm else nm.split('/')
            for pnm in parts:
                k = key_for(pnm)
                if k:
                    if k not in ent[field]: ent[field].append(k)
                else:
                    ent['unmatched'].append({'name': pnm.strip(), 'as': field})
    out[mid] = ent
data = {'_about': 'UI35 (2026-11-08, owner 10:52 #22): the Codex draft (docs/design/skill-distribution-codex-draft-2026-11-08.md section 2) as data. Keys are map ids; sig = signature skills, side = side skills (skill keys that exist), oneoff = one-off / special abilities (text only), unmatched = names with no skill yet (text only, no tile). Shown only in the admin Map cards window (Codex sig. / Codex side pills); it changes no list, card or pack. Regenerate: python3 tools/codex_skill_suggestions.py.',
        'maps': out}
json.dump(data, open(os.path.join(ROOT, 'canonical/codex-skill-suggestions.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print('maps', len(out), 'tiles', sum(len(e['sig']) + len(e['side']) for e in out.values()), 'unmatched', sum(len(e['unmatched']) for e in out.values()))
for mid, e in out.items(): print(mid, e['sig'], e['side'], [u['name'] for u in e['unmatched']])
