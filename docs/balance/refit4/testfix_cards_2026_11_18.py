#!/usr/bin/env python3
# 2026-11-18 (package REFIT4, coordinator's TESTFIX findings 2-4; finding 1 is `python3 tools/fold_skill_params_2026_11_07.py`):
# Bee Knight's Level 1 skill, Pearl Mussel Anchorer's retired `pearl`, and the CONTENT13 Map 21-23 cards' Pack 4 tier, in the file's own format.
#   python3 docs/balance/refit4/testfix_cards_2026_11_18.py
import json, os
ROOT = os.path.abspath(os.path.dirname(os.path.abspath(__file__)) + '/../../..')
P = ROOT + '/canonical/cards.json'
cards = json.load(open(P))
T4 = {'bar-headed-goose-leader', 'drongo-mocker', 'opossum-faker', 'osprey-plunger', 'pearl-mussel-anchorer', 'soft-shell-crab-newmoult', 'spitfire-sawfly-grubs', 'strangler-fig-sapling'}
def note(c, s):
    n = c.get('creatorNote') or ''
    if s[:40] not in n: c['creatorNote'] = (n + ' ' if n else '') + s
for c in cards:
    if c['id'] == 'bee-knight':
        c['effects'] = {}; c['levelSkills'] = {'1': {'diurnal': 1}}
        note(c, "2026-11-18 (REFIT4, TESTFIX finding 2): REDESIGN3 read it as vanilla and put Diurnal 1 in effects beside the Level 1 Swarm + Flying; now effects {} and Level 1 Diurnal 1, the redesign's intent (Map 1's second Diurnal carrier).")
    if c['id'] == 'pearl-mussel-anchorer':
        e = c['effects']; e.pop('pearl', None); e['delivery'] = {'v': 1, 'res': 'pearl'}
        note(c, '2026-11-18 (REFIT4, TESTFIX finding 3): the retired pearl 1 is Delivery {Pearl x1}.')
        if c['health'] == 24: c['health'] = 23; note(c, '2026-11-18 (REFIT4): 1/24 -> 1/23, back inside its budget (102.9% -> 99.6%) with Delivery {Pearl x1}.')
    if c['id'] in T4:
        c.setdefault('source', {})['tier'] = 4
open(P, 'w').write(json.dumps(cards, indent=2, ensure_ascii=True) + '\n')
print('written')
