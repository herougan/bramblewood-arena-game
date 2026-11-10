#!/usr/bin/env python3
"""2026-11-11 (package THEME8): build docs/design/map-suggestions-2026-11-11.json and .md from tools/theme8/picks_2026_11_11.py.

Design only: changes no list, card or pack. Per main map 0-20: the full Yes list (owner Yes for 0-11 and Map 12's 3, Claude's for 12-20)
split into suggest (NEW to the road: no earlier main map gives it, admin adds included) and carried; adminAdd (Maps 0-11); the skills it
showcases; gaps; the deck-building mix (tools/theme8/deckmix_2026_11_11.py: no Stone before Map 21, lumber-cost / no-lumber / wait / no-wait /
Lumber makers / plain / status); per-card usage across main Maps 0-20. Side maps: the same split against the main maps up to their unlock
(UI44: Carried = Yes on main maps numbered up to the unlock). Checks: ids exist, no faction card, family cap 2 (a card on that map's list today
is exempt, as UI41), rarity ladder (main maps), no monster on main Maps 12-20.
Run: python3 tools/theme8/build_suggestions_2026_11_11.py [--check]   (--check: report only, write nothing)
"""
import collections, json, os, sys
sys.path.insert(0, os.path.dirname(__file__))
from lib_theme8_2026_11_11 import data, MAIN_ORDER, ROOT  # noqa: E402
from deckmix_2026_11_11 import mix  # noqa: E402
import picks_2026_11_11 as P  # noqa: E402

OUT = os.path.join(ROOT, 'docs', 'design', 'map-suggestions-2026-11-11')
# the unlock the game uses today (arena_app.js ui44CurrentAfter: entry.afterMapCleared through mapUnlockNumberOf, else the side map's own number)
UNLOCK = {'mp': 'm8', 'mg': 'mu', 'mz': 'm4', 'mj': 'm10', 'mq': 'mh', 'ms': 'mr', 'mv': 'ml', 'mn': 'mt', 'my': 'md', 'mpd': 'm3',
          'me': 'm11', 'mx': 'm11', 'mi': 'm21', 'mo': 'm21', 'm9': 'm23'}
MAIN_NO = {mid: i for i, mid in enumerate(MAIN_ORDER)}
MAIN_NO.update({'m21': 21, 'm23': 23})
INTRO = {'common': 0, 'uncommon': 1, 'rare': 5, 'veryrare': 10, 'superrare': 20, 'epic': 22, 'heroic': 25, 'unique': 30, 'legendary': 40, 'mythic': 60}
SEA = P.SEA_BASS


def main(check):
    d = data()
    cards, picks, pools = d['cards'], d['picks'], d['pools']
    name = lambda c: SEA['name'] if c == SEA['id'] else cards[c]['name']
    errs, warn = [], []
    for c in {c for l in P.MAIN.values() for c in l} | {c for v in P.SUB.values() for c in v['list']} | {c for v in P.ADMIN.values() for c in v} \
            | {c for l in P.BABY.values() for c in l} | set(P.MONSTERS):
        if c not in cards:
            errs.append(f'unknown id {c}')
    if errs:
        print('\n'.join(errs)); sys.exit(1)

    lists, admin, given_at = {}, {}, {}
    for mid in MAIN_ORDER:
        own = list(picks.get(mid, {}).get('yes', []))
        lists[mid] = list(dict.fromkeys(own + P.MAIN.get(mid, [])))
        admin[mid] = list(P.ADMIN.get(mid, {}))
        for c in lists[mid] + admin[mid] + P.BABY.get(mid, []):
            given_at.setdefault(c, MAIN_NO[mid])
    usage = collections.Counter(c for mid in MAIN_ORDER for c in set(lists[mid] + admin[mid] + P.BABY.get(mid, [])))

    def family_over(ids, listed):
        fam = collections.Counter(d['family'](c) for c in ids if c not in listed)
        return {f: n for f, n in fam.items() if n > 2}

    out = {'about': 'THEME8 (2026-11-11): suggested Yes lists for main Maps 12-20, admin adds for Maps 0-11, side-map lists up to the Map 20 region, '
                    'skills per map, the Sea Bass and the monster set pieces. Design only: nothing applied. Built by tools/theme8/build_suggestions_2026_11_11.py '
                    'from tools/theme8/picks_2026_11_11.py. suggest = NEW to the road (no earlier main map gives it, admin adds counted), carried = given earlier. '
                    'Maps 0-11: suggest/carried split the owner\'s Yes; adminAdd is Claude\'s. usage = main Maps 0-20 (owner Yes + adminAdd + suggestions).',
           'built': '2026-11-11', 'rules': {'familyCap': 2, 'mixMinimum': 'tools/theme8/deckmix_2026_11_11.py MIN', 'noStoneBefore': 21},
           'maps': {}, 'seaBass': None, 'submapMonsters': [], 'submaps': {}, 'outOfScope': P.OUT_OF_SCOPE, 'usage': {}}
    for mid in MAIN_ORDER:
        no = MAIN_NO[mid]
        L, A = lists[mid], admin[mid]
        before = {c for c, n in given_at.items() if n < no}
        new = [c for c in L if c not in before]
        car = [c for c in L if c in before]
        listed = set(pools.get(mid, {}).get('cards', []))
        full = L + A
        if no >= 12:
            for c in L:
                if c in P.MONSTERS: errs.append(f'Map {no}: monster {c} on a main map')
            fo = family_over(L, listed)
            if fo: warn.append(f'Map {no}: families over 2 {fo}')
        if A:
            fo = family_over(L + A, listed)
            fo0 = family_over(L, listed)
            more = {f: n for f, n in fo.items() if n > fo0.get(f, 2)}
            if more: warn.append(f'Map {no}: admin adds push families over 2 {more}')
        for c in full:
            if d['is_faction'](c): errs.append(f'Map {no}: faction card {c}')
            r = cards[c].get('rarity') or 'common'
            if (no >= 12 or c in A) and INTRO.get(r, 0) > no and c not in picks.get(mid, {}).get('yes', []):
                warn.append(f'Map {no}: {c} is {r} (main road from Map {INTRO[r]})')
        mx_ids = full
        o, gaps = mix(d, mx_ids, no)
        if mid == SEA['map']:  # the Sea Bass counts on its map: cost 1, Wait 1, not plain, no status, no Lumber
            o['cost1'].append(SEA['id']); o['wait1'].append(SEA['id'])
            gaps = [g for g in gaps if not (g in ('cost1', 'wait1') and len(o[g]) >= 4)]
        if no <= 1:  # the first two maps teach the basics (owner: "Low level maps can break their limits once in a while")
            gaps = [g for g in gaps if not (g == 'cost1' and len(o['cost1']) >= 2) and not (g == 'status' and len(o['status']) >= 1)
                    and not (g == 'lumber' and len(o['lumber']) >= 1) and not (g == 'wait1' and len(o['wait1']) >= 3)]
        skills = []
        for key, label in P.CURRICULUM[mid][0]:
            who = [c for c in full if key in d['skills'](c, minor=True)]
            if mid == SEA['map'] and key in SEA['effects']:
                who.append(SEA['id'])
            skills.append({'key': key, 'name': label, 'carriers': who})
            if not who: warn.append(f'Map {no}: skill {key} has no carrier')
        out['maps'][mid] = {
            'mapNo': no, 'name': d['maps'][mid]['name'], 'suggest': new, 'carried': car,
            'ownerYes': picks.get(mid, {}).get('yes', []) if mid in picks else [],
            'baby': P.BABY.get(mid, []), 'adminAdd': A, 'adminWhy': P.ADMIN.get(mid, {}),
            'skills': skills, 'gaps': P.CURRICULUM[mid][1] + ([f'deck mix short: {", ".join(gaps)}'] if gaps else []),
            'mix': {k: len(v) for k, v in o.items()}, 'usage': {c: usage[c] for c in full + P.BABY.get(mid, [])}}
        if mid == SEA['map']:
            out['maps'][mid]['newCard'] = SEA['id']

    out['usage'] = dict(sorted(usage.items(), key=lambda kv: (-kv[1], kv[0])))
    for c, n in usage.items():
        if n >= 4 and not all(c in picks.get(m, {}).get('yes', []) for m in MAIN_ORDER if c in lists[m] + admin[m]):
            warn.append(f'busy: {c} on {n} main maps')

    # side maps
    sub_use = collections.Counter()
    for sid, s in P.SUB.items():
        after = s.get('suggestUnlock') or UNLOCK[sid]
        un = MAIN_NO[after]
        pool = {c for c, n in given_at.items() if n <= un}
        L = s['list']
        new = [c for c in L if c not in pool]
        car = [c for c in L if c in pool]
        parent = d['maps'][sid]['parent']
        listed = set((pools.get(parent, {}).get('submaps') or {}).get(sid, []))
        fo = family_over(L, listed)
        if fo: warn.append(f'{sid}: families over 2 {fo}')
        for c in L:
            if d['is_faction'](c): errs.append(f'{sid}: faction card {c}')
        o, gaps = mix(d, L, un)
        sub_use.update(set(L))
        out['submaps'][sid] = {'name': d['maps'][sid]['name'], 'parent': parent, 'parentNo': MAIN_NO.get(parent),
                               'unlockAfter': UNLOCK[sid], 'unlockAfterNo': MAIN_NO[UNLOCK[sid]],
                               'suggestUnlock': s.get('suggestUnlock'), 'suggestUnlockWhy': s.get('why'),
                               'suggest': new, 'carried': car, 'monsters': [c for c in L if c in P.MONSTERS],
                               'mix': {k: len(v) for k, v in o.items()}, 'gaps': ([f'deck mix short: {", ".join(gaps)}'] if gaps else []),
                               'note': s.get('note')}
    out['usageSubmaps'] = dict(sorted(sub_use.items(), key=lambda kv: (-kv[1], kv[0])))
    placed = {c: sid for sid, s in P.SUB.items() for c in s['list']}
    for c, (biome, why) in P.MONSTERS.items():
        x = cards[c]
        out['submapMonsters'].append({'id': c, 'name': x['name'], 'rarity': x.get('rarity'), 'stats': f"{x.get('attack')}/{x.get('health')}",
                                      'submap': biome, 'submapName': d['maps'][biome]['name'] if biome else None, 'biome': why,
                                      'onList': placed.get(c) == biome})
    out['seaBass'] = SEA

    # report
    for mid, m in out['maps'].items():
        print(f"Map {m['mapNo']:2d} {mid:4s} new {len(m['suggest']):2d} carried {len(m['carried']):2d} admin {len(m['adminAdd'])} "
              f"mix {m['mix']} gaps {m['gaps'][len(P.CURRICULUM[mid][1]):]}")
    for sid, s in out['submaps'].items():
        print(f"{sid:4s} {s['name'][:20]:20s} unlock {s['unlockAfterNo']}{'->' + str(MAIN_NO[s['suggestUnlock']]) if s['suggestUnlock'] else ''} "
              f"new {len(s['suggest'])} carried {len(s['carried'])} mix {s['mix']} {s['gaps']}")
    print('\nWARN:\n  ' + '\n  '.join(warn))
    print('ERR:', errs)
    print('busiest:', list(out['usage'].items())[:12])
    if check or errs:
        return
    with open(OUT + '.json', 'w', encoding='utf-8') as f:
        json.dump(out, f, indent=1, ensure_ascii=False)
        f.write('\n')
    with open(OUT + '.md', 'w', encoding='utf-8') as f:
        f.write(md(out, name, d))
    print('wrote', OUT + '.json', OUT + '.md')


def md(o, name, d):
    N = lambda ids: ', '.join(name(c) for c in ids) or '-'
    w = ['# Map suggestions, THEME8 (2026-11-11)', '',
         'Design only: nothing is applied. Data: `map-suggestions-2026-11-11.json` (built by `tools/theme8/build_suggestions_2026_11_11.py`). '
         'Judged by name, animal and art. NEW = no earlier main map gives it (admin adds counted); Carried = an earlier main map gives it.', '',
         '## Main Maps 12-20: suggested Yes', '', '| Map | NEW to the road | Carried |', '|---|---|---|']
    for mid in MAIN_ORDER[12:]:
        m = o['maps'][mid]
        own = m['ownerYes']
        new = [name(c) + (' (yours)' if c in own else '') for c in m['suggest']]
        baby = f" (+ baby: {N(m['baby'])})" if m['baby'] else ''
        w.append(f"| **{m['mapNo']}** {m['name']} | {', '.join(new)}{baby} | {N(m['carried'])} |")
    w += ['', '## Skills each map teaches', '', '| Map | Skills (carriers) | Gap |', '|---|---|---|']
    for mid in MAIN_ORDER:
        m = o['maps'][mid]
        sk = '; '.join(f"{s['name']} ({len(s['carriers'])})" for s in m['skills'])
        w.append(f"| {m['mapNo']} {m['name']} | {sk} | {' '.join(m['gaps'])} |")
    w += ['', '## Maps 0-11: admin adds to your Yes picks', '', '| Map | Add | Why |', '|---|---|---|']
    for mid in MAIN_ORDER[:12]:
        m = o['maps'][mid]
        for i, c in enumerate(m['adminAdd']):
            w.append(f"| {m['mapNo'] if i == 0 else ''} | {name(c)} | {m['adminWhy'][c]} |")
    w += ['', 'Deck mix per map (lumber-cost / no-lumber / wait / no-wait / Lumber makers / plain / status; Stone: none before Map 21):', '',
          '| Map | Cost 1+ | Cost 0 | Wait 1+ | Wait 0 | Lumber | Plain | Status | Short |', '|---|---|---|---|---|---|---|---|---|']
    for mid in MAIN_ORDER:
        m = o['maps'][mid]; x = m['mix']
        short = [g for g in m['gaps'] if g.startswith('deck mix')]
        w.append(f"| {m['mapNo']} | {x['cost1']} | {x['cost0']} | {x['wait1']} | {x['wait0']} | {x['lumber']} | {x['plain']} | {x['status']} | {short[0][16:] if short else ''} |")
    busy = [(c, n) for c, n in o['usage'].items() if n >= 3]
    w += ['', f"Busiest cards on main Maps 0-20: {', '.join(f'{name(c)} {n}' for c, n in busy)}.", '']
    s = o['seaBass']
    w += ['## Sea Bass (Map 10, proposed; not in cards.json)', '', '| | |', '|---|---|',
          f"| Name | {s['name']} (alt: {s['altName']}) |", f"| Family / element | {s['family']} / {s['element']} |",
          f"| Rarity, cost, wait | {s['rarity'].title()}, {s['cost']} Lumber, Wait {s['wait']} |",
          f"| Stats | {s['attack']}/{s['health']}: budget cap 1 21.78 / N 22.21 (98%), cap 2 29.35 / 86.05 (Level 1, Map 10; tools/theme8/sea_bass_budget_2026_11_11.js) |",
          f"| Skills | {'; '.join(s['skills'])} |", f"| Why | {s['why']} |", f"| Flavor | {s['flavor']} |", f"| Genre | {s['genre']} |", '',
          f"Art prompt: {s['art']}", '']
    w += ['## Side maps (up to the Map 20 region)', '', '| Side map | Unlocks after | NEW | Carried |', '|---|---|---|---|']
    for sid, x in o['submaps'].items():
        un = f"Map {x['unlockAfterNo']} (current)" + (f"; suggest Map {MAIN_NO[x['suggestUnlock']]}" if x['suggestUnlock'] else '')
        w.append(f"| **{x['name']}** (of Map {x['parentNo']}) | {un} | {N(x['suggest'])} | {N(x['carried'])} |")
    notes = [f"- **{x['name']}:** {x['note']}" for x in o['submaps'].values() if x['note']]
    notes += [f"- **{x['name']}:** {x['suggestUnlockWhy']}" for x in o['submaps'].values() if x['suggestUnlockWhy']]
    w += [''] + notes + ['', 'Out of scope: ' + '; '.join(o['outOfScope'].values()) + '.', '',
                         '## Monster set pieces (off main Maps 12-20)', '', '| Monster | Rarity | Side map (on its list?) | Why |', '|---|---|---|---|']
    for m in o['submapMonsters']:
        w.append(f"| {m['name']} | {m['rarity']} {m['stats']} | {m['submapName']} ({'yes' if m['onList'] else 'candidate'}) | {m['biome']} |")
    w.append('')
    return '\n'.join(w)


if __name__ == '__main__':
    main('--check' in sys.argv)
