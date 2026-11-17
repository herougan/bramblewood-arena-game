#!/usr/bin/env python3
# SKAUD1 phase 2 (2026-11-18): apply tools/skaud1/apply.js's changes to canonical/cards.json in the file's own format.
# python3 tools/skaud1/write_cards.py <changes.json>
import json, os, sys
ROOT = os.path.abspath(os.path.dirname(os.path.abspath(__file__)) + '/../..')
P = ROOT + '/canonical/cards.json'
cards = json.load(open(P))
ch = json.load(open(sys.argv[1]))
n = 0
for c in cards:
    r = ch.get(c['id'])
    if not r: continue
    c['effects'] = r['to']
    if 'levelSkills' in r:
        if r['levelSkills']: c['levelSkills'] = r['levelSkills']
        else: c.pop('levelSkills', None)
    if 'newA' in r:
        c['attack'], c['health'] = r['newA'], r['newH']
        note = c.get('creatorNote') or ''
        if 'SKAUD1' not in note:
            c['creatorNote'] = (note + ' ' if note else '') + '2026-11-18 (SKAUD1, OWN-1117-3: merged skills, docs/design/skaud1-2026-11-17.json): %d/%d -> %d/%d, inside its budget with the survivor skill.' % (r['A'], r['H'], r['newA'], r['newH'])
    n += 1
open(P, 'w').write(json.dumps(cards, indent=2, ensure_ascii=True) + '\n')
print(n, 'cards written')
