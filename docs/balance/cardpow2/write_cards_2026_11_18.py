#!/usr/bin/env python3
# 2026-11-18 (package CARDPOW2, owner 11-17 23:41 overnight plan): write the CARDPOW2 changes (docs/balance/cardpow2/changes-2026-11-18.json,
# rows with action "change": attack, health, effects after) into canonical/cards.json in the file's own format, with a dated creatorNote;
# plus FOLD5-1 a (Lion's Mane Jelly resists Poison).
#   python3 docs/balance/cardpow2/write_cards_2026_11_18.py docs/balance/cardpow2/changes-2026-11-18.json
import json, os, sys
ROOT = os.path.abspath(os.path.dirname(os.path.abspath(__file__)) + '/../../..')
P = ROOT + '/canonical/cards.json'
cards = json.load(open(P))
rows = {r['id']: r for r in json.load(open(sys.argv[1])) if r.get('action') == 'change'}
n = 0
for c in cards:
    if c['id'] == 'lions-mane-jelly' and 'poison' not in (c.get('resist') or []):
        c['resist'] = (c.get('resist') or []) + ['poison']
        note = c.get('creatorNote') or ''
        c['creatorNote'] = (note + ' ' if note else '') + '2026-11-18 (FOLD5-1 a, default): resists Poison (the 11-06..11-13 live edit had put it where the game ignores it).'
        n += 1
    r = rows.get(c['id'])
    if not r: continue
    a = r['after']
    c['attack'], c['health'], c['effects'] = a['attack'], a['health'], a['effects']
    note = c.get('creatorNote') or ''
    if 'CARDPOW2' not in note:
        c['creatorNote'] = (note + ' ' if note else '') + '2026-11-18 (CARDPOW2, owner 11-17 23:41 overnight plan): %s; budget fill %s%% -> %s%% at its level, power %s (docs/balance/cardpow2-2026-11-18.md).' % (r['how'], r['fill'], a['fill'], r['power'])
    n += 1
open(P, 'w').write(json.dumps(cards, indent=2, ensure_ascii=True) + '\n')
print(n, 'cards written')
