#!/usr/bin/env python3
"""2026-11-06 (package ENG27) card data, no stat changes:
  - owner ENG25-6 ("Yes"): Pearl N -> Delivery {Pearl xN} (delivery N, deliveryRes 'pearl'), Pearl Bed N -> its every-turn form (deliveryEvery N);
    the old keys still play (engine en8Trigs; the app reads them as Delivery, eng23MigrateDelivery). Giant Clam and Oyster Bank.
  - owner item 22 ("Don't create new creatures for any of these skills. Except Hype - create 1."): the Crimson Wing Drumcaller, a Sunfeather
    hummingbird (docs/lore-bible.md: songs and blessings as buffs, Flying), Uncommon, 1 Lumber, Wait 1, 3/6, Flying + Hype 1: 96% of its
    budget N (tools/skill_costs.js, Hype 2.25). In no pack and on no map (awaitingSource); art drawn later (prompt in docs/art-style-prompts.md).
    python3 tools/eng27_cards_2026_11_06.py   (idempotent)"""
import json, os
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
P = os.path.join(ROOT, 'canonical', 'cards.json')
cards = json.load(open(P, encoding='utf-8')); log = []
for c in cards:
    e = c.get('effects') or {}
    if e.get('pearl') and not e.get('delivery'):
        e['delivery'] = 1 if e['pearl'] is True else e['pearl']; e['deliveryRes'] = 'pearl'; del e['pearl']; log.append(c['id'] + ': Pearl -> Delivery {Pearl}')
    elif e.get('pearlBed') and not e.get('deliveryEvery'):
        e['deliveryEvery'] = 1 if e['pearlBed'] is True else e['pearlBed']; e['deliveryRes'] = 'pearl'; del e['pearlBed']; log.append(c['id'] + ': Pearl Bed -> Delivery {Pearl}, every turn')
if not any(c['id'] == 'crimson-wing-drumcaller' for c in cards):
    cards.append({
        "id": "crimson-wing-drumcaller", "cost": 1, "icon": "\U0001f426", "name": "Crimson Wing Drumcaller", "tags": [], "test": False,
        "uuid": "6f0e2b7a-27e1-4c3d-9a51-2027e1100601", "wait": 1, "attack": 3,
        "flavor": "One beat on the gourd drum and the whole war-band remembers what it came for.", "health": 6, "locked": True,
        "rarity": "uncommon", "resist": [], "dmgType": "physical", "effects": {"flying": True, "hype": 1},
        "species": ["Bird"], "animal": "hummingbird",
        "speeches": {"idle": ["", "", ""], "onHit": ["", "", ""], "onDeath": ["", "", ""], "onSkill": ["", "", ""], "onSpawn": ["", "", ""], "onAttack": ["", "", ""]},
        "exileCost": None, "graceCost": 0, "metalCost": 0, "numericId": max(int(c.get('numericId') or 0) for c in cards) + 1, "stoneCost": 0,
        "archetypes": ["Hummingbird"], "devilryCost": 0, "mechanicLine": "none", "splashEffect": "none", "art": "", "awaitingSource": True, "unattainable": True,
        "creatorNote": "2026-11-06 (package ENG27, owner item 22: \"Don't create new creatures for any of these skills. Except Hype - create 1.\"): the one Hype card. A Crimson Wing drummer (lore bible: songs and blessings as buffs). Uncommon, 1 Lumber, Wait 1, 3/6, Flying + Hype 1: 96% of N (Hype priced 2.25, theoretical). In no pack, on no map; art to draw (docs/art-style-prompts.md)."})
    log.append('added crimson-wing-drumcaller #%d' % cards[-1]['numericId'])
dc = next(c for c in cards if c['id'] == 'crimson-wing-drumcaller')
if not dc.get('unattainable'): dc['unattainable'] = True; log.append('crimson-wing-drumcaller: unattainable (on no list, LISTFIX1)')
if 'decision ENG27-9' not in dc.get('creatorNote', ''): dc['creatorNote'] = dc.get('creatorNote', '') + ' Placement: decision ENG27-9.'; log.append('crimson-wing-drumcaller: placement call named')
if dc.get('faction'): del dc['faction']; log.append('crimson-wing-drumcaller: no faction (a faction card is a faction-pack reward; it is in no pack)')
if log:
    open(P, 'w', encoding='utf-8').write(json.dumps(cards, indent=2) + '\n')
print('\n'.join(log) or 'nothing to do')
