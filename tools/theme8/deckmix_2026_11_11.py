#!/usr/bin/env python3
"""2026-11-11 (package THEME8, owner 00:16 via the coordinator): the deck-building mix a map's list must support for its skirmishes.

No Stone before Map 21 (a card that costs Stone / Metal / Uranium or makes Stone); lumber is the focus: each list needs lumber-cost cards (cost 1+),
no-lumber cards (cost 0), wait cards (Wait 1+), no-wait cards (Wait 0), lumber generators and plain animals (no non-minor skill); plus a status
option (Venomous / Bleed / Daunt / Wither / Freeze ... on a hit). mix(ids) returns the counts and the gaps; run alone it prints the owner's Maps 0-11.
Run: python3 tools/theme8/deckmix_2026_11_11.py
"""
import os, sys
sys.path.insert(0, os.path.dirname(__file__))
from lib_theme8_2026_11_11 import data, MAIN_ORDER  # noqa: E402

LUMBER_KEYS = {'milling', 'felling', 'driftwood', 'scavenge', 'salvage', 'coppice', 'windfall'}
STONE_KEYS = {'stonecutter', 'quarry'}
STATUS_KEYS = {'poison', 'greaterPoison', 'bleed', 'daunt', 'weaken', 'wither', 'decay', 'freeze', 'iceArrow', 'frostbite', 'stunOnHit', 'confuse',
               'web', 'strangle', 'tangle', 'corrode', 'shock', 'exploit', 'sleep', 'paralyze', 'brittle', 'blind', 'expose', 'rupture', 'hemorrhage'}
MIN = {'cost1': 4, 'cost0': 3, 'wait1': 4, 'wait0': 3, 'lumber': 2, 'plain': 2, 'status': 2}


def lumber_gen(c):
    e = c.get('effects') or {}
    if any(k in e for k in LUMBER_KEYS) and not (isinstance(e.get('felling'), dict) and e['felling'].get('res') in ('metal', 'stone')):
        return True
    if e.get('tribeDelivery'):  # <Tribe> Delivery {Lumber}: +1 Lumber when you play an ally of that tribe (ENG25)
        return True
    dv = e.get('delivery')
    if dv not in (None, False, 0):
        res = (dv.get('res') if isinstance(dv, dict) else None) or e.get('deliveryRes') or 'lumber'
        if str(res).lower().startswith('lumber'):
            return True
    for t in e.get('triggers') or []:
        if isinstance(t, dict) and t.get('do') == 'gain' and str(t.get('resource', 'lumber')).lower() == 'lumber':
            return True
    return False


def stone(c):
    if c.get('stoneCost') or c.get('metalCost') or c.get('uraniumCost'):
        return True
    e = c.get('effects') or {}
    if any(k in e for k in STONE_KEYS):
        return True
    dv = e.get('delivery')
    if isinstance(dv, dict) and str(dv.get('res', '')).lower() in ('stone', 'metal'):
        return True
    for t in e.get('triggers') or []:
        if isinstance(t, dict) and (str(t.get('resource', '')).lower() in ('stone', 'metal') or 'stone' in (t.get('pay') or {})):
            return True
    return False


def mix(d, ids, mapno=0):
    cards = d['cards']
    out = {'cost1': [], 'cost0': [], 'wait1': [], 'wait0': [], 'lumber': [], 'plain': [], 'status': [], 'stone': []}
    for cid in ids:
        c = cards[cid]
        (out['cost1'] if (c.get('cost') or 0) >= 1 else out['cost0']).append(cid)
        (out['wait1'] if (c.get('wait') or 0) >= 1 else out['wait0']).append(cid)
        if lumber_gen(c): out['lumber'].append(cid)
        sk = d['skills'](cid)
        if not [s for s in sk if s != 'hatchling']: out['plain'].append(cid)
        if any(s in STATUS_KEYS for s in sk): out['status'].append(cid)
        if stone(c): out['stone'].append(cid)
    gaps = [k for k, n in MIN.items() if len(out[k]) < n]
    if mapno < 21 and out['stone']:
        gaps.append('stone:' + ','.join(out['stone']))
    return out, gaps


def main():
    d = data()
    for mid in MAIN_ORDER:
        if mid not in d['picks']:
            continue
        p = d['picks'][mid]
        out, gaps = mix(d, p['yes'], p['mapNo'])
        print(f"Map {p['mapNo']:2d} {mid:4s} " + ' '.join(f"{k}={len(v)}" for k, v in out.items()) + f"  GAPS {gaps}")
        print('        lumber:', ','.join(out['lumber']), '| plain:', ','.join(out['plain']), '| status:', ','.join(out['status']))


if __name__ == '__main__':
    main()
