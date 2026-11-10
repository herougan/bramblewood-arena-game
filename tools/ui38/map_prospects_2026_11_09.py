#!/usr/bin/env python3
"""2026-11-09 (package UI38, owner 03:55: "show me a bigger pool each map, e.g. 30+ cards for unique, 20+ cards for carried. Then I'll toggle on/off"; UI45 2026-11-10: NEW! 45+, Carried only the Yes cards):
build docs/design/map-prospects-2026-11-09.json, the admin Map cards window's bigger Prospects pool for main Maps 0-20.

Per main map:
  fit       existing cards ranked by theme fit: [id, score, codes] (codes: b = the map's biome, k = a kin biome, c = a CONTENT17 pick for the map,
            t = a THEME5 pick, s = a SKILLREC1 pick, g = has one of the map's signature skills (map-signatures-2026-11-08.json), e = its damage
            element is the map's element). The game splits them at run time with UI37's NEW! / Carried rule (ui37CarriedIndex): a card no earlier
            main map gives is a NEW! candidate when its score is at least NEW_MIN_SCORE; a card an earlier main map gives is a Carried candidate.
  concepts  proposed new cards (tools/ui38/concepts_2026_11_09.py): name, animal, family, element, suggested rarity, a one-line role. No stats or skills
            (skills are designed after the owner picks). Enough per map that the map's NEW! group reaches NEW_TARGET with no flags set.
  static    the pool sizes with no flags set (what the report quotes).
family: every listed card's animal family (unit-themes animalGroup), used for the cap: a proposed card or concept is not added once its family
already appears FAMILY_CAP times in that group (a card on the map's list today always shows).

Left out everywhere: tokens, tests, Easter eggs, raid / boss / egg / spell / equipment / field / hazard cards, Base cards, faction cards (the Otters, the
Hummingbirds, cards with a faction), cards that are only on a side map's list, and cards on the map's own side maps' lists (side maps come later; owner 03:55
"not displaying the submap section").

Run: python3 tools/ui38/map_prospects_2026_11_09.py [--check]   (--check: validate and print the report, write nothing)
"""
import json, os, re, sys, collections

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
sys.path.insert(0, os.path.dirname(__file__))
from concepts_2026_11_09 import CONCEPTS, EXOTIC_WORDS, EXOTIC_ANIMALS  # noqa: E402

OUT = os.path.join(ROOT, 'docs', 'design', 'map-prospects-2026-11-09.json')
NEW_TARGET, CAR_TARGET, FAMILY_CAP, NEW_MIN_SCORE, CAR_MIN_SCORE = 45, 0, 2, 4, 1  # 2026-11-10 (UI45, owner 21:11): NEW! 45+ (was 30), Carried has no minimum or fill (only cards flagged Yes on an earlier map)
NEW_MAX = 60  # the NEW! group stops taking existing fit cards here (the best-fitting first); concepts only fill up to NEW_TARGET + NEW_MARGIN
NEW_MARGIN = 2  # concepts sized so the no-flag NEW! group reaches NEW_TARGET + NEW_MARGIN (a few Yes flags on earlier maps keep it at 45+)
ELEMENT = {'volcanic-ash': 'heat', 'desert-glass': 'heat', 'pale-desert': 'heat', 'tundra-ice': 'cold', 'taiga': 'cold', 'caves': 'stone', 'reef-ocean': 'water', 'mangrove': 'water', 'swamp': 'poison', 'fungal': 'decay'}
FACTION_THEMES = {'otters', 'hummingbirds', 'ecclesia'}
SKIP_FLAGS = ('token', 'test', 'easterEgg', 'raid', 'hidden', 'worldBoss', 'eggKind', 'spell', 'equip', 'field', 'hazard', 'darkSummon', 'basic', 'hallOfFame', 'token')


def load(p):
    with open(os.path.join(ROOT, p), encoding='utf-8') as f:
        return json.load(f)


def main(check=False):
    cards = {c['id']: c for c in load('canonical/cards.json')}
    units = {u['id']: u for u in load('canonical/unit-themes.json')['units']}
    tags = {t['id']: t for t in load('canonical/animal-tags.json')['cards']}
    ut = load('canonical/unit-themes.json')
    kin = {b['id']: b['kin'] for b in ut['vocab']['biomes']}
    more = ut['vocab'].get('mapBiomesMore', {})
    pools = load('canonical/map-pools.json')['maps']
    sigs = {m['id']: m for m in load('docs/design/map-signatures-2026-11-08.json')['maps']}
    cn = load('canonical/claude-new-cards.json')
    mains = [m for m in ut['maps'] if not m['sub'] and m['no'] is not None and 0 <= m['no'] <= 20]
    mains.sort(key=lambda m: m['no'])

    def family(cid):
        u = units.get(cid) or {}
        t = tags.get(cid) or {}
        return u.get('animalGroup') or t.get('group') or (cards.get(cid) or {}).get('animal') or ''

    main_listed, sub_listed = set(), set()
    for mid, p in pools.items():
        main_listed |= set(p.get('cards', []))
        for l in (p.get('submaps') or {}).values():
            sub_listed |= set(l if isinstance(l, list) else l.get('cards', []))
    side_only = sub_listed - main_listed

    def eligible(cid):
        c = cards.get(cid)
        if not c or not c.get('animal') or any(c.get(k) for k in SKIP_FLAGS) or c.get('faction'):
            return False
        u = units.get(cid) or {}
        if u.get('faction') in FACTION_THEMES:
            return False
        if cid in side_only:
            return False
        return True

    # earlier main maps' lists, as UI37 sees them with no flags set
    given_before = {}
    acc = set()
    for m in mains:
        given_before[m['id']] = set(acc)
        acc |= set(pools.get(m['id'], {}).get('cards', []))

    out_maps, report, fam_all = {}, [], {}
    concept_ids, concept_names = set(), set()
    card_names = {c['name'].lower() for c in cards.values()}
    problems = []
    for m in mains:
        mid, b = m['id'], m['biome']
        kins = set(kin.get(b, [])) | set(more.get(mid, [])) | {k for k, v in kin.items() if b in v}
        el = ELEMENT.get(b)
        sig = sigs.get(mid) or {}
        sig_keys = {(sig.get('newSkills') or {}).get(s, {}).get('key') for s in sig.get('signatureCandidates', [])} - {None}
        picks = collections.defaultdict(set)
        for g in ((cn.get('content17') or {}).get(mid) or {}).get('groups', []):
            for p in g.get('picks', []):
                picks[p['id']].add('c')
        for p in (cn.get('theme5') or {}).get(mid, []):
            picks[p['id']].add('t')
        for p in (cn.get('skillrec') or {}).get(str(m['no']), []):
            picks[p['id']].add('s')
        fit = []
        own_sub = set()  # this map's own side maps' cards (not on its MAP list) stay with the side maps
        for l in (pools.get(mid, {}).get('submaps') or {}).values():
            own_sub |= set(l if isinstance(l, list) else l.get('cards', []))
        own_sub -= set(pools.get(mid, {}).get('cards', []))
        for cid in cards:
            if not eligible(cid) or cid in own_sub:
                continue
            if (cards[cid].get('animal') or '').lower() in EXOTIC_ANIMALS:
                continue
            u = units.get(cid) or {}
            bs = set(u.get('biomes') or [])
            codes, s = '', 0
            if b in bs:
                s += 4; codes += 'b'
            elif bs & kins:
                s += 2; codes += 'k'
            for k in sorted(picks.get(cid, ())):
                s += {'c': 4, 't': 3, 's': 3}[k]; codes += k
            eff = set((cards[cid].get('effects') or {}).keys())
            if sig_keys & eff:
                s += 1; codes += 'g'
            if el and cards[cid].get('dmgType') == el:
                s += 2; codes += 'e'
            if s >= CAR_MIN_SCORE and codes not in ('g',) and (s >= NEW_MIN_SCORE or cid in main_listed):  # a weaker fit only matters as a Carried candidate
                fit.append([cid, s, codes])
        fit.sort(key=lambda x: (-x[1], cards[x[0]]['name']))
        for cid, _, _ in fit:
            fam_all[cid] = family(cid)
        # the no-flag split, as the game draws it
        cur = [i for i in pools.get(mid, {}).get('cards', []) if i in cards]
        gb = given_before[mid]
        cur_new = [i for i in cur if not cards[i].get('token') and not cards[i].get('test')]  # 2026-11-10 (UI45): earlier maps' list cards are NEW! until flagged Yes
        cur_car = [i for i in cur if i in gb]
        for i in cur:
            fam_all[i] = family(i)
        fam_new = collections.Counter(family(i) for i in cur_new)
        over_cur = sorted(f for f, n in fam_new.items() if f and n > FAMILY_CAP)
        new_pool = list(cur_new)
        for cid, s, codes in fit:
            if cid in new_pool or s < NEW_MIN_SCORE or len(new_pool) >= NEW_MAX:
                continue
            f = family(cid)
            if f and fam_new[f] >= FAMILY_CAP:
                continue
            new_pool.append(cid); fam_new[f] += 1
        cons = [dict(c) for c in CONCEPTS.get(mid, [])]
        need = max(0, NEW_TARGET + NEW_MARGIN - len(new_pool))
        kept = []
        for c in cons:
            if len(kept) >= need:
                break
            f = c['family']
            if c['name'].lower() in card_names:
                problems.append(f'{mid}: concept {c["name"]} skipped, its name is a card')  # 2026-11-10 (UI45): a bigger NEW! reaches further down the concept lists
                continue
            if fam_new[f] >= FAMILY_CAP:
                problems.append(f'{mid}: concept {c["name"]} skipped, family {f} already {fam_new[f]}')
                continue
            fam_new[f] += 1; kept.append(c)
        if len(kept) < need:
            problems.append(f'{mid} (Map {m["no"]}): short of concepts: need {need}, have {len(kept)}, NEW! reaches {len(new_pool) + len(kept)} of {NEW_TARGET}')  # 2026-11-10 (UI45): reported, not fatal; the owner asked to be told which maps stay short
        for c in kept:
            c['id'] = 'concept-' + re.sub(r'[^a-z0-9]+', '-', c['name'].lower()).strip('-')
            if c['id'] in concept_ids:
                problems.append(f'duplicate concept id {c["id"]}')
            concept_ids.add(c['id'])
            if c['name'].lower() in card_names:
                problems.append(f'concept name clashes with a card: {c["name"]}')
            if c['name'].lower() in concept_names:
                problems.append(f'concept name used twice: {c["name"]}')
            concept_names.add(c['name'].lower())
            for w in EXOTIC_WORDS:
                if w in (c['name'] + ' ' + c['animal']).lower():
                    problems.append(f'{c["name"]}: not a simple common animal ({w})')
        car_pool = []  # 2026-11-10 (UI45): with no flags nothing is carried; Carried is only the cards flagged Yes on an earlier map (the game's ui37CarriedIndex)
        cur_car = []
        out_maps[mid] = {'no': m['no'], 'name': m['name'], 'biome': b, 'element': el, 'fit': fit,
                         'concepts': [{k: c[k] for k in ('id', 'name', 'animal', 'family', 'element', 'rarity', 'role')} for c in kept],
                         'static': {'new': len(new_pool) + len(kept), 'newListed': len(cur_new), 'newExisting': len(new_pool) - len(cur_new), 'newConcepts': len(kept),
                                    'carried': len(car_pool), 'carriedListed': len(cur_car), 'familiesOverCapOnList': over_cur,
                                    'carriedFamiliesOverCapOnList': sorted(f for f, n in collections.Counter(family(i) for i in cur_car).items() if f and n > FAMILY_CAP)}}
        report.append(out_maps[mid])
    # families spread across maps (concepts)
    spread = collections.Counter(c['family'] for mm in out_maps.values() for c in mm['concepts'])
    doc = {'_about': 'UI38 (2026-11-09, owner 03:55): the admin Map cards window\'s bigger Prospects pool for main Maps 0-20 (NEW! 45+, Carried = Yes cards only). '
                     'fit = existing cards ranked by theme fit (codes: b biome, k kin biome, c CONTENT17, t THEME5, s SKILLREC1, g signature skill, e element); '
                     'concepts = proposed new cards with no stats or skills yet (designed after the owner picks); family = animal family for the cap of '
                     f'{FAMILY_CAP} per group. Generated by tools/ui38/map_prospects_2026_11_09.py; concepts are written in tools/ui38/concepts_2026_11_09.py.',
           'built': '2026-11-09', 'rules': {'newTarget': NEW_TARGET, 'carriedTarget': CAR_TARGET, 'familyCap': FAMILY_CAP, 'newMinScore': NEW_MIN_SCORE, 'newMax': NEW_MAX, 'carriedFill': 0},
           'maps': out_maps, 'family': dict(sorted(fam_all.items())), 'exotic': sorted(i for i, c in cards.items() if (c.get('animal') or '').lower() in EXOTIC_ANIMALS), 'conceptFamilySpread': dict(spread.most_common())}
    for mm in report:
        st = mm['static']
        print(f"Map {mm['no']:>2} {mm['name'][:22]:<22} NEW {st['new']:>3} (list {st['newListed']}, existing {st['newExisting']}, concepts {st['newConcepts']})  Carried {st['carried']:>3} (list {st['carriedListed']})  over-cap on list: {','.join(st['familiesOverCapOnList']) or '-'} / {','.join(st['carriedFamiliesOverCapOnList']) or '-'}")
    print('concepts', sum(len(mm['concepts']) for mm in report), 'families used most:', spread.most_common(8))
    for p in problems:
        print('  !', p)
    if not check:
        with open(OUT, 'w', encoding='utf-8') as f:
            json.dump(doc, f, ensure_ascii=False, indent=1)
            f.write('\n')
        print('wrote', os.path.relpath(OUT, ROOT))
    return 1 if any('clash' in p or 'duplicate' in p or 'twice' in p or 'not a simple' in p for p in problems) else 0


if __name__ == '__main__':
    sys.exit(main('--check' in sys.argv))
