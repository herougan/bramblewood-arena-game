#!/usr/bin/env python3
"""2026-11-11 (package THEME8): list the candidate cards for main Maps 12-20, the working sheet behind the THEME8 suggestions.

Per map: today's MAP list, UI38's fit list (score 4+) and every eligible card whose unit-themes biome is the map's biome. Each row: id, name,
rarity, cost/wait/A/H, family, non-minor skills, flags (Y<n> = owner Yes on Map n, L = on this map's list, S = on a side map's list,
U = unattainable today, F = faction). Prints; writes nothing.  Run: python3 tools/theme8/candidates_2026_11_11.py [mapId ...]
"""
import os, sys
sys.path.insert(0, os.path.dirname(__file__))
from lib_theme8_2026_11_11 import data, load, MAIN_ORDER  # noqa: E402

SKIP = ('token', 'test', 'easterEgg', 'raid', 'hidden', 'worldBoss', 'eggKind', 'spell', 'equip', 'field', 'hazard', 'darkSummon', 'basic')


def main(only):
    d = data()
    cards, picks, pools, units = d['cards'], d['picks'], d['pools'], d['units']
    prospects = load('docs/design/map-prospects-2026-11-09.json')['maps']
    yes_at = {}
    for mid in MAIN_ORDER:
        for c in picks.get(mid, {}).get('yes', []):
            yes_at.setdefault(c, picks[mid]['mapNo'])
    side = {}
    for mid, p in pools.items():
        for sid, l in (p.get('submaps') or {}).items():
            for c in (l if isinstance(l, list) else l.get('cards', [])):
                side.setdefault(c, []).append(sid)

    def row(cid, mid):
        c = cards[cid]
        fl = []
        if cid in yes_at: fl.append(f'Y{yes_at[cid]}')
        if cid in pools.get(mid, {}).get('cards', []): fl.append('L')
        if cid in side: fl.append('S:' + '/'.join(side[cid]))
        if c.get('unattainable'): fl.append('U')
        if d['is_faction'](cid): fl.append('F')
        r = (c.get('rarity') or '?')[:4]
        return f"  {cid:28s} {c['name'][:26]:26s} {r:4s} {c.get('cost')}/{c.get('wait')} {c.get('attack')}/{c.get('health'):<3} {d['family'](cid)[:12]:12s} {','.join(d['skills'](cid))[:44]:44s} {' '.join(fl)}"

    for mid in MAIN_ORDER[12:]:
        if only and mid not in only:
            continue
        m = d['maps'][mid]
        biome = m['biome']
        seen = []
        for cid in pools.get(mid, {}).get('cards', []) + pools.get(mid, {}).get('special', []):
            if cid not in seen: seen.append(cid)
        for cid, sc, codes in prospects[mid]['fit']:
            if sc >= 4 and cid not in seen: seen.append(cid)
        for cid, u in units.items():
            c = cards.get(cid)
            if not c or any(c.get(k) for k in SKIP) or cid in seen:
                continue
            if biome in (u.get('biomes') or []):
                seen.append(cid)
        print(f"== Map {m['no']} {m['name']} ({mid}, {biome}): {len(seen)} candidates")
        for cid in seen:
            if cid in cards:
                print(row(cid, mid))


if __name__ == '__main__':
    main(sys.argv[1:])
