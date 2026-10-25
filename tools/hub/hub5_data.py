#!/usr/bin/env python3
"""Data for the hub's package-HUB5 pages, built from the repo's canonical files at hub-build time (2026-10-25, owner 10-25 17:53 H1 / H2 / H3
and 22:36 G11). build_hub.py imports this and inlines the results; nothing here writes a file.

  card_table(root, canon, tix)   the 🗃️ Card table: every card of canonical/cards.json as one compact row
  packs(root, canon, tix)        the Packs section: each pack, its tier and price, and the cards that could wear its packaging art
  curves(root)                   the 📊 Curves tab: the game's own XP, energy and Forge code read out of arena_app.js, the cost tables
  road(root)                     the 📈 Difficulty tab's road check: PRO3's before / after rows with each fight's target and band
Read-only: arena_app.js and the JSON files are never changed."""
import json, os, re

RARITY_ORDER = ['starter', 'common', 'uncommon', 'rare', 'veryrare', 'superrare', 'epic', 'heroic', 'unique', 'legendary', 'mythic',
                'ancient', 'divine', 'void', 'daemonic']
RARITY_LABEL = {'starter': 'Starter', 'common': 'Common', 'uncommon': 'Uncommon', 'rare': 'Rare', 'veryrare': 'Very Rare', 'superrare': 'Super Rare',
                'epic': 'Epic', 'heroic': 'Heroic', 'unique': 'Unique', 'legendary': 'Legendary', 'mythic': 'Mythic', 'ancient': 'Ancient',
                'divine': 'Divine', 'void': 'Void', 'daemonic': 'Daemonic'}
# Pack tiers (decisions PP-1 and N221-1): the maps each pack's cards belong to.
PACK_MAPS = {1: 'Maps 0-6', 2: 'Maps 7-13', 3: 'Maps 14-20', 4: 'Maps 21-27', 5: 'Maps 28-34', 6: 'Maps 35-41'}
COST_FIELDS = [('cost', '🪵'), ('stoneCost', '🪨'), ('metalCost', '🔩'), ('uraniumCost', '☢'), ('graceCost', 'Grace '), ('devilryCost', 'Devilry '), ('exileCost', 'Exile ')]


def _load(root, *p):
    with open(os.path.join(root, *p), encoding='utf-8') as f:
        return json.load(f)


def _read(root, *p):
    with open(os.path.join(root, *p), encoding='utf-8') as f:
        return f.read()


def _words(k):
    """camelCase key -> 'Title Case words' (the fallback label of a skill the hub has no label for)."""
    s = re.sub(r'([a-z0-9])([A-Z])', r'\1 \2', k)
    return s[:1].upper() + s[1:]


def _labels(root):
    lab = {}
    try:
        for s in _load(root, 'docs', 'balance', 'hub-cards.json').get('skills', []):
            lab[s['key']] = s['label']
    except Exception:
        pass
    sc = _load(root, 'canonical', 'skill-costs.json')
    trig = {t['id']: t.get('label', _words(t['id'])) for t in sc.get('triggers', [])}
    act = {a['id']: a.get('label', _words(a['id'])) for a in sc.get('actions', [])}
    return lab, trig, act


def shop_packs(root):
    """The basic packs, read out of SHOP_PACKS_DEFAULT in arena_app.js. 2026-10-26: RES3 added collectorCost before cards."""
    src = _read(root, 'arena_app.js')
    a = src.index('const SHOP_PACKS_DEFAULT = [')
    block = src[a:src.index('\n];', a)]
    out = []
    for m in re.finditer(r"\{id:'(\w+)',(?: packNo:(\d+),)? name:'([^']+)', icon:'([^']+)', cost:\{gold:(\d+), gems:(\d+)\},(?: collectorCost:\{[^}]*\},)? cards:(\d+)[^\n]*?pool:(\d+)", block):
        out.append({'id': m.group(1), 'packNo': int(m.group(2)) if m.group(2) else None, 'name': m.group(3), 'icon': m.group(4),
                    'gold': int(m.group(5)), 'gems': int(m.group(6)), 'cards': int(m.group(7)), 'pool': int(m.group(8))})
    if len(out) < 4:
        raise SystemExit('hub5_data: could not read SHOP_PACKS_DEFAULT (found %d packs)' % len(out))
    return out


def faction_packs(root):
    src = _read(root, 'arena_app.js')
    a = src.index('const FACTION_PACKS = {')
    block = src[a:src.index('\n};', a)]
    out = []
    for line in block.split('\n'):
        g = lambda k: (re.search(k + r":'([^']*)'", line) or [None, None])[1]
        if not g('id') or not g('kind'):
            continue
        own = re.search(r'own:(\d+)', line)
        out.append({'id': g('id'), 'kind': g('kind'), 'name': g('name'), 'icon': g('icon'), 'own': int(own.group(1)) if own else None,
                    'faction': g('faction'), 'cover': g('cover'), 'blurb': g('blurb')})
    return out


def card_table(root, canon, tix):
    lab, trig, act = _labels(root)
    om = _load(root, 'canonical', 'card-obtain-maps.json').get('maps', {})
    packs_by_pool = {p['pool']: p['name'] for p in shop_packs(root)}
    try:
        hc = _load(root, 'docs', 'balance', 'hub-cards.json')
        mapname = {m['id']: m['name'] for m in hc.get('maps', [])}
    except Exception:
        mapname = {}
    rows = []
    skill_count = {}
    for c in canon:
        src = c.get('source') or {}
        kind = src.get('kind') or ''
        eff = c.get('effects') or {}
        sks = []
        for k, v in eff.items():
            if k == 'triggers' and isinstance(v, list):
                for t in v:
                    sks.append('%s: %s' % (trig.get(t.get('on'), _words(str(t.get('on', '?')))), act.get(t.get('do'), _words(str(t.get('do', '?'))))))
                continue
            if v is False or v is None or v == 0 or v == '':
                continue
            name = lab.get(k) or _words(k)
            if isinstance(v, (int, float)) and not isinstance(v, bool):
                name = '%s %s' % (name, ('%g' % v))
            sks.append(name)
        for s in sks:
            base = re.sub(r' [0-9.]+$', '', s)
            skill_count[base] = skill_count.get(base, 0) + 1
        ct = c.get('cardType')
        typ = ct if ct in ('equipment', 'spell', 'materia') else 'token' if c.get('token') else 'test' if c.get('test') else \
            'egg' if c.get('eggKind') else (c.get('subtype') or 'creature') if c.get('subtype') in ('structure',) else 'creature'
        tier = src.get('tier') if kind == 'pack' else None
        if tier == 11:
            side = src.get('side')
            fac = 'Hummingbirds' if side == 'tribes' else 'Shared' if side == 'shared' else 'Otters'
        else:
            fac = {'base': 'Base', 'hummingbirds': 'Hummingbirds'}.get(c.get('faction'), '')
        if kind == 'pack':
            pk = 'Faction pool' if tier == 11 else 'Mystery Booster' if tier == 99 else packs_by_pool.get(tier) or 'Pack %s' % tier
            sdet = 'Pack tier %s' % tier
        elif kind == 'map':
            pk = ''
            sdet = 'Skirmish %s, %s' % (src.get('node', '?'), mapname.get(src.get('id'), src.get('id', '')))
        else:
            pk = ''
            sdet = {'easteregg': 'Easter egg', 'materia': 'Materia', 'smith': 'Blacksmith', 'nest': 'Nest', 'raid': 'Raid', 'base': 'Base', 'secret': 'Secret', 'quest': 'Quest'}.get(kind, kind)
        # 2026-10-25: exileCost can be {zone, count} (e.g. tithe-collector): show the count and the zone.
        costs = ' '.join('%s%s' % (ic, ('%g %s' % (c[f].get('count', 1), c[f].get('zone', ''))).strip() if isinstance(c[f], dict) else '%g' % c[f]) for f, ic in COST_FIELDS if c.get(f))
        r = c.get('rarity') or ''
        rows.append({
            'id': c['id'], 'n': c.get('name', c['id']), 'ic': c.get('icon', ''), 'r': r,
            'a': c.get('attack'), 'h': c.get('health'), 'w': c.get('wait', 0), 'c': c.get('cost', 0), 'cs': costs,
            'sk': sks, 'ty': typ, 'sp': ', '.join(c.get('species') or []) if isinstance(c.get('species'), list) else (c.get('species') or ''),
            'an': c.get('animal') or '', 'f': fac, 'mp': om.get(c['id']), 'src': kind, 'sd': sdet, 'pt': tier, 'pk': pk,
            't': tix.get(c['id'], -1), 'x': 1 if (c.get('test') or c.get('token') or c.get('hidden')) else 0,
        })
    skills = sorted(skill_count.items(), key=lambda kv: kv[0].lower())
    return {'cards': rows, 'rarities': [{'k': k, 'l': RARITY_LABEL[k]} for k in RARITY_ORDER], 'skills': [{'l': k, 'n': n} for k, n in skills],
            'packMaps': {str(k): v for k, v in PACK_MAPS.items()}, 'mapOf': {}}


def packs(root, canon, tix):
    """Each pack and the rare-and-higher cards with art that could wear its packaging (mirrors packCoverCandidates in arena_app.js:
    the pack's own pool, best rarity first). The game uses the first 8 today; the rest are further candidates."""
    ridx = {k: i for i, k in enumerate(RARITY_ORDER)}
    byid = {c['id']: c for c in canon}
    def cand(pool_filter, cover=None):
        ids = [c['id'] for c in canon if pool_filter(c) and c['id'] in tix and ridx.get(c.get('rarity') or 'common', 1) >= ridx['rare']]
        ids.sort(key=lambda i: (-ridx.get(byid[i].get('rarity') or 'common', 1), i))
        if cover and cover in byid and cover in tix:
            ids = [cover] + [i for i in ids if i != cover]
        return [{'id': i, 'n': byid[i].get('name', i), 'r': byid[i].get('rarity') or '', 't': tix[i]} for i in ids]
    def pool(n):
        return lambda c: (c.get('source') or {}).get('kind') == 'pack' and (c.get('source') or {}).get('tier') == n
    out = []
    for p in shop_packs(root):
        out.append({'name': p['name'], 'icon': p['icon'], 'tier': p['pool'], 'price': '%d Maple Leaves%s' % (p['gold'], ' + %d Gold Leaves' % p['gems'] if p['gems'] else ''),
                    'cards': p['cards'], 'maps': PACK_MAPS.get(p['pool'], 'strange cards' if p['pool'] == 99 else ''), 'cands': cand(pool(p['pool'])), 'note': ''})
    out.sort(key=lambda p: (p['tier'] == 99, p['tier']))
    for t in (4, 5, 6):
        out.append({'name': 'Pack %d' % t, 'icon': '📦', 'tier': t, 'price': 'not on sale yet', 'cards': None, 'maps': PACK_MAPS[t], 'cands': cand(pool(t)),
                    'note': 'No pack item exists yet; its cards are tagged tier %d in canonical/cards.json (N221-1).' % t})
    for fp in faction_packs(root):
        if fp['kind'] == 'faction':
            want = 'tribes' if fp['faction'] == 'hummingbirds' else ''
            f = lambda c, want=want: (c.get('source') or {}).get('kind') == 'pack' and (c.get('source') or {}).get('tier') == 11 and ((c.get('source') or {}).get('side') or '') == want
            out.append({'name': fp['name'], 'icon': fp['icon'], 'tier': 11, 'price': 'earned, never sold', 'cards': 3, 'maps': 'faction rewards',
                        'cands': cand(f, fp.get('cover')), 'cover': fp.get('cover'), 'note': 'Its cover card in the game today is first in the list.'})
        else:
            out.append({'name': fp['name'], 'icon': fp['icon'], 'tier': 11, 'price': 'earned, never sold', 'cards': 3, 'maps': 'a people\'s bundle',
                        'cands': [], 'note': 'Drawn from the basic packs by people, so it has no pool of its own to take art from.'})
    return {'packs': out, 'rarityLabel': RARITY_LABEL}


def _grab(src, start_pat, end_pat):
    a = src.index(start_pat)
    b = src.index(end_pat, a)
    return src[a:b]


def curves(root):
    """The game's own code for the XP, energy and map-gate curves, copied as text out of arena_app.js (never executed here), and the cost
    tables. The page runs the copied functions, so the curves it draws are the game's."""
    app = _read(root, 'arena_app.js')
    code = {
        'xpToNext': re.search(r'function xpToNext\(level\)\{[^\n]*\}', app).group(0),
        'staminaPlaces': _grab(app, 'const STAMINA_PLACES = {', '\n};') + '\n};',
        'mapEnergyBase': _grab(app, 'function mapEnergyBase(mapIdx){', '\n}\n') + '\n}',
        'energyBase': re.search(r'const ENERGY_MAX_BASE = (\d+);', app).group(1),
        'regenMs': re.search(r'const ENERGY_REGEN_MS = ([^;]+);', app).group(1),
        'levelGate': re.search(r'function levelGateMap\(toLevel\)\{[^\n]*\}', app).group(0),
        'energyCost': re.search(r'const ENERGY_COST = \{[^\n]*\};', app).group(0),
    }
    res = None
    p = os.path.join(root, 'docs', 'balance', 'resources-2026-10-23.json')
    if os.path.exists(p):
        r = _load(root, 'docs', 'balance', 'resources-2026-10-23.json')
        res = {'generated': r.get('generated'), 'assumptions': r.get('assumptions'), 'road': r.get('road'),
               'weeks': [{k: w.get(k) for k in ('map', 'mapName', 'farm', 'energyPerFight', 'energyPerDay', 'fightsPerDay', 'week')} for w in r.get('weeks', [])]}
    return {'code': code, 'upgrade': _load(root, 'canonical', 'upgrade-costs.json'), 'resources': res}


def road(root):
    """PRO3's road check: one row per measured fight with its target, game band, win rate before and after."""
    d = os.path.join(root, 'docs', 'balance')
    def rows(name):
        with open(os.path.join(d, name), encoding='utf-8') as f:
            return [json.loads(l) for l in f if l.strip()]
    after, before = rows('skirmish-pass-pro3-after.jsonl'), {(r['map'], r['key']): r for r in rows('skirmish-pass-pro3-before.jsonl')}
    out = []
    for r in after:
        b = before.get((r['map'], r['key']))
        out.append({'code': r['code'], 'key': r['key'], 'map': r['map'], 'mapNo': r['mapNo'], 'mapName': r['mapName'], 'side': r['side'], 'endless': r['endless'],
                    'kind': r['kind'], 'name': r['name'], 'win': r['win'], 'before': b['win'] if b else None, 'target': r['target'], 'lo': r['lo'], 'hi': r['hi'],
                    'curve': r['curve'], 'games': r['games'], 'green': r['green']})
    return {'fights': out, 'games': after[0]['games'] if after else None, 'source': 'docs/balance/skirmish-pass-pro3-after.jsonl (before: ...-before.jsonl)'}
