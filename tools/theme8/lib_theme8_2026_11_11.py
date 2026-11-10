#!/usr/bin/env python3
"""2026-11-11 (package THEME8): shared loaders for the THEME8 map-suggestion tools (design / data analysis only; writes nothing in canonical/).

Main maps 0-20 in road order, the owner's Yes picks (docs/design/map-picks-owner-2026-11-11.json), cards.json, the animal family
(unit-themes animalGroup, as UI38's family cap), the skills a card carries (effects keys, minus the minor skills that never count, owner DES1-2)
and whether a card is a faction card (source tier 11, a faction field, or a faction unit theme).
"""
import json, os

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))

MAIN_ORDER = ['m1', 'mf', 'mb', 'mc', 'm2', 'mw', 'm8', 'mu', 'm4', 'mk', 'm7', 'm10',
              'mh', 'mr', 'm5', 'ml', 'mt', 'm6', 'md', 'm3', 'm11']
# Minor skills never count as a map's signature (owner DES1-2, 2026-11-08: Flying, Diurnal, Nocturnal, Crepuscular, Tide, Salt, Heat, Frost).
MINOR = {'flying', 'diurnal', 'nocturnal', 'crepuscular', 'crepuscularDay', 'crepuscularNight', 'tide', 'salt', 'heat', 'frost',
         'resist', 'swimmer'}
FACTION_THEMES = {'otters', 'hummingbirds', 'ecclesia'}


def load(p):
    with open(os.path.join(ROOT, p), encoding='utf-8') as f:
        return json.load(f)


def data():
    cards = {c['id']: c for c in load('canonical/cards.json')}
    ut = load('canonical/unit-themes.json')
    units = {u['id']: u for u in ut['units']}
    tags = {t['id']: t for t in load('canonical/animal-tags.json')['cards']}
    picks = load('docs/design/map-picks-owner-2026-11-11.json')['maps']
    pools = load('canonical/map-pools.json')['maps']
    maps = {m['id']: m for m in ut['maps']}

    def family(cid):
        u = units.get(cid) or {}
        t = tags.get(cid) or {}
        return u.get('animalGroup') or t.get('group') or (cards.get(cid) or {}).get('animal') or ''

    def is_faction(cid):
        c = cards.get(cid) or {}
        if c.get('faction') and c.get('faction') != 'base':
            return True
        if (c.get('source') or {}).get('tier') == 11:
            return True
        return (units.get(cid) or {}).get('faction') in FACTION_THEMES

    def skills(cid, minor=False):
        eff = (cards.get(cid) or {}).get('effects') or {}
        out = []
        for k, v in eff.items():
            if v in (None, False, 0):
                continue
            if not minor and k in MINOR:
                continue
            out.append(k)
        for lv, sk in ((cards.get(cid) or {}).get('levelSkills') or {}).items():
            for k in (sk or {}):
                if (minor or k not in MINOR) and k not in out:
                    out.append(k)
        return out

    return dict(cards=cards, units=units, picks=picks, pools=pools, maps=maps, family=family, is_faction=is_faction, skills=skills)
