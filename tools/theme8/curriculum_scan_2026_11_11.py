#!/usr/bin/env python3
"""2026-11-11 (package THEME8): which skills each main map's Yes cards show, first-on-road vs seen before, beside DES2's recommended signatures
(docs/design/skill-plan-maps-0-20-2026-11-08.json). Maps 0-11 read the owner's Yes picks; Maps 12-20 read THEME8's suggestions when
docs/design/map-suggestions-2026-11-11.json exists (else nothing). Also: who carries a skill (--who <skillKey>). Prints; writes nothing.
Run: python3 tools/theme8/curriculum_scan_2026_11_11.py [--who key ...]
"""
import collections, json, os, sys
sys.path.insert(0, os.path.dirname(__file__))
from lib_theme8_2026_11_11 import data, load, MAIN_ORDER, ROOT  # noqa: E402


def lists():
    d = data()
    out = {mid: list(d['picks'][mid]['yes']) for mid in MAIN_ORDER if mid in d['picks']}
    p = os.path.join(ROOT, 'docs', 'design', 'map-suggestions-2026-11-11.json')
    if os.path.exists(p):
        s = json.load(open(p, encoding='utf-8'))['maps']
        for mid, m in s.items():
            out[mid] = list(dict.fromkeys(m.get('suggest', []) + m.get('carried', [])))
    return d, out


def main(argv):
    d, L = lists()
    if argv and argv[0] == '--who':
        for key in argv[1:]:
            who = [c for c in d['cards'] if key in d['skills'](c, minor=True)]
            print(key, len(who))
            for c in who:
                x = d['cards'][c]
                print(f"   {c:28s} {x['name'][:24]:24s} {(x.get('rarity') or '?')[:4]} {d['family'](c)[:12]:12s} {'U' if x.get('unattainable') else ' '} {'F' if d['is_faction'](c) else ' '}")
        return
    plan = {m['id']: m for m in load('docs/design/skill-plan-maps-0-20-2026-11-08.json')['maps']}
    shown = set()
    for mid in MAIN_ORDER:
        if mid not in L:
            continue
        cnt = collections.Counter(s for c in L[mid] for s in d['skills'](c))
        first = {s: n for s, n in cnt.items() if s not in shown}
        sig = [x['key'] for x in plan.get(mid, {}).get('sig', [])]
        print(f"== {mid} Map {d['maps'][mid]['name']}: first-on-road {dict(sorted(first.items(), key=lambda kv: -kv[1]))}")
        print(f"   seen before (count here): {dict((s, n) for s, n in cnt.items() if s in shown)}")
        print(f"   DES2 sig {sig}: carriers here {[(k, cnt.get(k, 0)) for k in sig]}")
        shown |= set(cnt)


if __name__ == '__main__':
    main(sys.argv[1:])
