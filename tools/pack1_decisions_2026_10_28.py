#!/usr/bin/env python3
"""PACK1 (2026-10-28): adds the owner calls PACK1-1..3 to docs/decisions.json (at the top of items; run once, skips what is there).
Numbers from docs/balance/pack1-pools-2026-10-28.json (node tools/pack1_pools_2026_10_28.js --json docs/balance/pack1-pools-2026-10-28.json)."""
import json, os
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
P = os.path.join(ROOT, 'docs', 'decisions.json')
R = json.load(open(os.path.join(ROOT, 'docs', 'balance', 'pack1-pools-2026-10-28.json'), encoding='utf-8'))
pk = R['packs']
sizes = '; '.join('Pack %s %d -> %d' % (t, pk[t]['before'], pk[t]['after']) for t in ['1', '2', '3', '4'])
gone = R['notObtainable']
moved = [x for x in R['budget']['newlyOver'] if x['inPack']]
over_gone = [x for x in R['budget']['newlyOver'] if not x['inPack']]
items = [
 {'id': 'PACK1-1', 'status': 'YET', 'kind': 'Confirm', 'area': 'Packs',
  'title': 'Packs = the map lists + your extras: is this the reading you meant?',
  'asked': '2026-10-28',
  'body': ('Your 22:47 "remove all cards from the packs" is built as: a basic pack holds the basic-pack cards whose first map list is on its maps (Pack 1 '
           'Maps 0-6, 2 7-13, 3 14-20, 4 21-27; a side map from the map that unlocks it), plus a list you curate (canonical/pack-extras.json, empty; the Pack '
           'editor edits it live). Derived at load, so trimming a map list takes its cards out of the packs. Pools: %s. %d cards (%d from Pack 1) are in no '
           'list and so in no pack now: "Not obtainable yet", data kept. Skirmish rewards, Base and unsorted cards on a list are NOT put in packs (a skirmish '
           'reward is never a pack card). The Mystery Booster and the Factions pool are unchanged; a faction bundle\'s general card follows the new pools. '
           'Note for THEME1-1: the cards it makes "pack only" (cut from every list) would leave the packs too, unless they go in the extras.') % (sizes, len(gone), sum(1 for x in gone if x['wasPack'] == 1)),
  'options': ['Yes, as built', 'Also put the THEME1 "pack only" cards in the extras when THEME1 is applied', 'Something else (say what)'],
  'default': 'Yes, as built'},
 {'id': 'PACK1-2', 'status': 'YET', 'kind': 'Decide', 'area': 'Balance',
  'title': 'Cards whose first map list is earlier than their pack: over budget',
  'asked': '2026-10-28',
  'body': ('A card now sits in the pack of its first map list. %d cards that RW5 had held in a later pack for their budget (they are on an early side '
           'map\'s list) now count from that earlier map and go over budget: %s. Not re-fitted (as asked). Cinder Hornet, Siege Rhino and Cinder Gecko move '
           'from Pack 4 to Pack 3 and stay inside.') % (len(moved), ', '.join('%s (Map %d -> %d)' % (x['id'], x['mapBefore'], x['mapAfter']) for x in moved)),
  'options': ['Re-fit them to their new map', 'Take them off the early side map\'s list', 'Keep them over budget for now'],
  'default': 'Re-fit them to their new map'},
 {'id': 'PACK1-3', 'status': 'YET', 'kind': 'FYI', 'area': 'Balance',
  'title': 'Cards in no pack count as Map 0 in the budget',
  'asked': '2026-10-28',
  'body': ('An unobtainable card is priced at Map 0 (the budget\'s rule for unobtainable cards). %d of the cards that left the packs are over budget at '
           'Map 0 (e.g. %s). Nobody can get them, so nothing changes in play; each is priced again when you place it (a map list or the extras).') % (
           len(over_gone), ', '.join(x['id'] for x in over_gone[:6])),
  'options': ['OK', 'Price them at their old map until placed'],
  'default': 'OK'},
]
lines = open(P, encoding='utf-8').read().split('\n')
i = next(n for n, l in enumerate(lines) if l.strip() == '"items": [')
added = 0
for it in reversed(items):
    if any('"id": "%s"' % it['id'] in l for l in lines): continue
    lines.insert(i + 1, '    ' + json.dumps(it, ensure_ascii=False) + ','); added += 1
open(P, 'w', encoding='utf-8').write('\n'.join(lines))
json.load(open(P, encoding='utf-8'))
print('added %d PACK1 calls' % added)
