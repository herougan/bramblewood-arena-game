#!/usr/bin/env python3
# 2026-10-19 (package BF4): when did canonical/cards.json last change each field of the cards the live server overrides?
# The fold (tools/fold_server_overrides_2026_10_19.js) compares that commit time with the server row's updated_at: a file change
# newer than the owner's server save is a conflict (listed, not overwritten blindly). Reads every first-parent commit of cards.json
# since 2026-10-09 (a field unchanged since then counts as older than every server save, the oldest being 2026-10-11).
#   python3 tools/server_overrides_history_2026_10_19.py  -> docs/balance/server-overrides/file-field-history-2026-10-19.json
import json, os, subprocess
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
os.chdir(ROOT)
DIR = 'docs/balance/server-overrides/'
ids = [r['id'] for r in json.load(open(DIR + 'card-overrides-dump-2026-10-19.json')) if not r['id'].startswith('__cfg:')]
FIELDS = ['rarity', 'name', 'cost', 'wait', 'effects', 'faction', 'flavor', 'resist', 'source', 'icon', 'species', 'archetypes', 'dmgType', 'attack', 'health', 'art', 'locked', 'hidden', 'types']
log = subprocess.check_output(['git', 'log', '--first-parent', '--reverse', '--since=2026-10-09', '--format=%h %cI', '--', 'canonical/cards.json'], text=True).split('\n')
log = [l.split(' ') for l in log if l.strip()]
prev, last = {}, {}
for h, t in log:
    try: data = json.loads(subprocess.check_output(['git', 'show', h + ':canonical/cards.json']))
    except Exception as e: print('skip', h, e); continue
    by = {c.get('id'): c for c in data if isinstance(c, dict)}
    for i in ids:
        c = by.get(i)
        if c is None: continue
        for f in FIELDS:
            v = json.dumps(c.get(f), sort_keys=True) if f != 'art' else str(c.get(f))[:200]
            k = i + '|' + f
            if k in prev and prev[k] != v: last[k] = {'commit': h, 'at': t}
            prev[k] = v
json.dump(last, open(DIR + 'file-field-history-2026-10-19.json', 'w'), indent=1)
print('wrote', DIR + 'file-field-history-2026-10-19.json', len(last), 'field changes')
