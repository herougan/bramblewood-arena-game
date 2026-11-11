#!/usr/bin/env python3
"""Package CACTI1 (2026-11-12, owner 00:38: "There is no cacti card. There should be. Dry & Thorny"): appends the Barrel Cactus to
canonical/cards.json (awaitingSource, on no map list; SKIR3 places it). Idempotent."""
import json, os, uuid
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
P = os.path.join(ROOT, 'canonical', 'cards.json')
cards = json.load(open(P, encoding='utf-8'))
if not any(c['id'] == 'barrel-cactus' for c in cards):
    nid = max(c['numericId'] for c in cards) + 1
    assert not any(c['numericId'] == nid for c in cards)
    cards.append({
        'id': 'barrel-cactus', 'name': 'Barrel Cactus', 'icon': '🌵', 'cost': 1, 'wait': 2, 'attack': 1, 'health': 18,
        'rarity': 'rare', 'species': ['Plant'], 'subtype': 'plant', 'animal': 'cactus', 'archetypes': ['Desert', 'Flora'],
        'effects': {'dry': True, 'thorns': 2}, 'dmgType': 'physical', 'resist': [], 'tags': [], 'locked': True, 'test': False,
        'flavor': 'It keeps its water to itself, and it keeps its distance.',
        'numericId': nid, 'uuid': str(uuid.uuid4()), 'awaitingSource': True, 'art': None,
        'creatorNote': '2026-11-12 (package CACTI1, owner 00:38: "There is no cacti card. There should be. Dry & Thorny"): a squat desert Plant with Dry and Thorns 2 (two skills). '
                       'Recommended home: The Glass Dunes (md, Map 18; its theme is Dry + Thorns, like Thorny Devil and Fennec Fox), Rare. Priced with the budget (tools/skill_costs.js budget, Level 1, Rare, '
                       'Map 18 term, Cost 1 / Wait 2): 1/18 uses 0.98 of N 30.79; 1/20 is over (1.04). On no map list yet (SKIR3 places it). Art: the emoji until drawn; prompt in docs/art-style-prompts.md.'})
    json.dump(cards, open(P, 'w', encoding='utf-8'), indent=2)
    open(P, 'a').write('\n')
print('ok')
