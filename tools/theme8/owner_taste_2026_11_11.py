#!/usr/bin/env python3
"""2026-11-11 (package THEME8): study the owner's Yes picks for main Maps 0-11 (docs/design/map-picks-owner-2026-11-11.json).

Per map: Yes count, new to the road vs carried (Yes on an earlier map), how far back the carried come from, how many were on the
map's list today (canonical/map-pools.json MAP tier), rarity mix, faction cards, families over 2, and the non-minor skills on the Yes cards.
Prints a report; writes nothing.  Run: python3 tools/theme8/owner_taste_2026_11_11.py
"""
import collections, os, sys
sys.path.insert(0, os.path.dirname(__file__))
from lib_theme8_2026_11_11 import data, MAIN_ORDER  # noqa: E402


def main():
    d = data()
    cards, picks, pools = d['cards'], d['picks'], d['pools']
    seen = {}  # id -> first map no with Yes
    tot = collections.Counter()
    for mid in MAIN_ORDER:
        if mid not in picks:
            continue
        p = picks[mid]
        yes = p['yes']
        no = p['mapNo']
        listed = set(pools.get(mid, {}).get('cards', []))
        new = [c for c in yes if c not in seen]
        car = [c for c in yes if c in seen]
        back = collections.Counter(no - seen[c] for c in car)
        rar = collections.Counter((cards[c].get('rarity') or '?') for c in yes)
        fam = collections.Counter(d['family'](c) for c in yes)
        over = {f: n for f, n in fam.items() if n > 2}
        fac = [c for c in yes if d['is_faction'](c)]
        on_list = [c for c in yes if c in listed]
        off_list = [c for c in yes if c not in listed]
        sk = collections.Counter(s for c in new for s in d['skills'](c))
        print(f"== Map {no} {d['maps'][mid]['name']} ({mid}){' WIP' if p.get('wip') else ''}: {len(yes)} Yes, new {len(new)}, carried {len(car)} (back {dict(sorted(back.items()))})")
        print(f"   on today's list {len(on_list)}/{len(listed)}; off-list picks: {', '.join(off_list)}")
        print(f"   dropped from list: {', '.join(sorted(listed - set(yes)))}")
        print(f"   rarity {dict(rar)}; families>2 {over}; faction {fac}")
        print(f"   new-card skills: {dict(sk.most_common())}")
        print(f"   carried: {', '.join(car)}")
        for c in new:
            seen[c] = no
        tot['yes'] += len(yes); tot['new'] += len(new); tot['car'] += len(car)
    rep = collections.Counter()
    for mid in MAIN_ORDER:
        for c in picks.get(mid, {}).get('yes', []):
            rep[c] += 1
    print('\nTotals', dict(tot))
    print('Repeated (3+ maps):', {c: n for c, n in rep.items() if n >= 3})


if __name__ == '__main__':
    main()
