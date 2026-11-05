#!/usr/bin/env python3
"""ENG25 (2026-11-05, owner notes 23:35) skill-id migrations in canonical/cards.json. No stat changes.
  #2 duplicates: Midas Touch N -> Felling N; Puncture N -> Breach N (the same rules under one name).
  #3 Hatchling arrives at Level 1: a Baby card's levelSkills "0" Hatchling moves to levelSkills "1" (ENG22-4's way).
  #8 Bee Drone: Bee Delivery { Lumber } (tribeDelivery 'Bee'); its other skills stay.
    python3 tools/eng25_cards_2026_11_05.py   (idempotent; prints what it moved)"""
import json, os
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
P = os.path.join(ROOT, 'canonical', 'cards.json')
cards = json.load(open(P))
moved = []
def mig(fx, cid, where):
    if not isinstance(fx, dict): return
    for old, new in (('midas', 'felling'), ('puncture', 'breach')):
        if old in fx:
            v = fx.pop(old)
            if new in fx: moved.append('%s %s: %s %s dropped (it already has %s %s)' % (cid, where, old, v, new, fx[new]))
            else: fx[new] = v; moved.append('%s %s: %s %s -> %s %s' % (cid, where, old, v, new, v))
for c in cards:
    mig(c.get('effects'), c['id'], 'effects')
    ls = c.get('levelSkills')
    if isinstance(ls, dict):
        for L in list(ls): mig(ls[L], c['id'], 'levelSkills ' + L)
        l0 = ls.get('0')
        if isinstance(l0, dict) and l0.get('hatchling'):
            del l0['hatchling']; l1 = ls.setdefault('1', {}); l1['hatchling'] = True
            if not l0: del ls['0']
            c['levelSkills'] = {k: ls[k] for k in sorted(ls, key=int)}
            moved.append('%s: Hatchling levelSkills 0 -> 1' % c['id'])
    if c['id'] == 'bee-drone':
        fx = c.setdefault('effects', {})
        if fx.get('tribeDelivery') != 'Bee':
            fx['tribeDelivery'] = 'Bee'; moved.append('bee-drone: + Bee Delivery { Lumber } (tribeDelivery Bee)')
with open(P, 'w') as fh: fh.write(json.dumps(cards, indent=2) + '\n')
print('\n'.join(moved) or 'nothing to move'); print(len(moved), 'changes')
