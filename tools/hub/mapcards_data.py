#!/usr/bin/env python3
"""Data for the hub's 🗺️ Map cards tab, computed at hub-build time (2026-10-28, package HUB9; owner 10-28 16:43: "Can the map cards also be
included in the master-hub? We can note oddities in card selection, rarity oddities, or size of map cards oddities. It might also be outside my
expectation as, balancing this way may make our pack size and unique card total not match.").
build_hub.py imports this and inlines the result as MC_DATA; nothing here writes a file. Read only.

Sources: canonical/map-pools.json (the lists), canonical/cards.json (rarity, source, pack tier), canonical/card-obtain-maps.json (the map a card
is first obtainable on), the game's own rarity caps (tools/hub/mapcards_caps.js -> arena_app.js roadRarityCap), canonical/unit-themes.json (each map's
biome and each card's biomes), docs/balance/decks.json (the skirmish decks: how many fights of a map play a card) and the CONTENT4 L7 plan
docs/balance/content4-map-pools-plan-2026-10-28.json (the proposed size caps and the showcase / first-clear-pack labels; the plan is a proposal,
not applied). The two optional files may be missing: their columns then stay empty."""
import json, os, re, subprocess, datetime
import hub5_data as H5

THRESH_MANY = 4          # a card listed on this many lists or more is "on many maps"
PLAN = os.path.join('docs', 'balance', 'content4-map-pools-plan-2026-10-28.json')
PROPOSAL = ('docs', 'balance', 'theme1-proposal-2026-10-28.json')   # 2026-10-28 (THEME1): the per-map proposal the tab's Proposal toggle shows
SKIP_SUB = {'muc', 'mm', 'mlb', 'mtut'}   # the endless dungeons and the tutorial keep their lists (the plan's SKIP_SUB)
OBTAINABLE_KINDS = {'pack', 'map', 'raid', 'nest', 'smith', 'materia', 'secret', 'quest', 'base'}
STEPS = ['common', 'uncommon', 'rare', 'veryrare', 'superrare', 'epic', 'heroic', 'unique', 'legendary', 'mythic', 'ancient', 'divine', 'void', 'daemonic']
ALIAS = {'starter': 'common', 'quest': 'uncommon', 'questunique': 'unique', 'special': 'rare', 'eventrare': 'rare', 'devlegendary': 'legendary',
         'eventlegendary': 'legendary', 'devancient': 'ancient'}   # ROAD_RARITY_ALIAS in arena_app.js


def step(r):
    if not r:
        return None
    r = ALIAS.get(r, r)
    return STEPS.index(r) if r in STEPS else None


def is_base(c):
    """A starter / Base card (the plan's isBase, plus the starters that carry no source)."""
    s = (c.get('source') or {}).get('kind')
    return s == 'base' or (not s and (c.get('rarity') == 'starter' or c.get('faction') == 'base' or c.get('basic') or c.get('basicSet')))


def mapcards(root, canon):
    L = lambda *p: json.load(open(os.path.join(root, *p), encoding='utf-8'))
    by = {c['id']: c for c in canon}
    pools = L('canonical', 'map-pools.json')['maps']
    om = L('canonical', 'card-obtain-maps.json').get('maps', {})
    ut = L('canonical', 'unit-themes.json')
    umap = {m['id']: m for m in ut['maps']}
    units = {u['id']: u for u in ut['units']}
    biomes = {b['id']: b for b in ut['vocab']['biomes']}
    more = ut['vocab'].get('mapBiomesMore', {})
    plan, decks = None, None
    try:
        plan = L(PLAN)
    except Exception:
        pass
    try:
        decks = {m['id']: m['nodes'] for m in L('docs', 'balance', 'decks.json')['maps']}
        decks_date = datetime.date.fromtimestamp(os.path.getmtime(os.path.join(root, 'docs', 'balance', 'decks.json'))).isoformat()
    except Exception:
        decks_date = None
    # ---- the lists, in road order (a side map at the number it opens on) ----
    ids = []
    for mid, P in pools.items():
        ids.append((mid, mid, None, P['cards']))
        for sid, a in (P.get('submaps') or {}).items():
            ids.append((sid, mid, sid, a))
    r = subprocess.run(['node', os.path.join(root, 'tools', 'hub', 'mapcards_caps.js')] + [k for k, *_ in ids], capture_output=True, text=True, check=True)
    caps = json.loads(r.stdout)
    order = {k: i for i, (k, *_) in enumerate(ids)}
    lists = sorted(({'key': k, 'map': m, 'sub': s, 'no': caps[k]['no'], 'ids': a} for k, m, s, a in ids), key=lambda x: (x['no'], 1 if x['sub'] else 0, order[x['key']]))
    parent_ids = {m: set(P['cards']) for m, P in pools.items()}
    # ---- how many lists hold each card ----
    nlists = {}
    for x in lists:
        for i in x['ids']:
            nlists[i] = nlists.get(i, 0) + 1
    # ---- the plan's labels (showcase, first-clear pack, PRO deck ...) ----
    why = {}
    if plan:
        for k, e in plan['lists'].items():
            for key in ('keptNew', 'keptOld', 'addedOld'):
                for s in e.get(key) or []:
                    m = re.match(r'^(\S+) \((.*)\)$', s)
                    if m:
                        why.setdefault(k, {})[m.group(1)] = [w.strip() for w in m.group(2).split(',')]
    # ---- per list ----
    seen, pending, last_no = set(), set(), None
    out_lists, rows_cache = [], {}
    for x in lists:
        if x['no'] != last_no:
            seen |= pending
            pending, last_no = set(), x['no']
        k, mp_ = x['key'], umap.get(x['key'], {})
        skipped = bool(x['sub'] and x['sub'] in SKIP_SUB)
        cp = caps[k]
        cap_step = step(cp['boss'])
        reach_step = max(step(cp['reveal']), cap_step)
        mb = [mp_.get('biome')] + list(more.get(k, []))
        mb = [b for b in mb if b]
        allowed = set(mb)
        for b in mb:
            allowed |= set((biomes.get(b) or {}).get('kin') or [])
        fights = decks.get(k) if decks is not None else None
        cards = []
        for i in x['ids']:
            c = by[i]
            s = c.get('source') or {}
            base = is_base(c)
            is_new = (not base) and i not in seen and not (x['sub'] and i in parent_ids.get(x['map'], ()))
            roles = []
            if s.get('kind') == 'map' and s.get('id') == k:
                roles.append('reward')
            roles += [w for w in why.get(k, {}).get(i, []) if w != 'reward']
            st = step(c.get('rarity'))
            flags = []
            if st is not None and st > reach_step:
                flags.append('rx')
            elif st is not None and st > cap_step:
                flags.append('ra')
            o = om.get(i)
            if o is not None and o > x['no']:
                flags.append('late')
            if (not s.get('kind')) and not base and not c.get('token') and not c.get('test'):
                flags.append('nosrc')
            if nlists.get(i, 0) >= THRESH_MANY:
                flags.append('many')
            u = units.get(i)
            if u and u.get('biomes') and not base and allowed and not (set(u['biomes']) & allowed):
                flags.append('mis')
            nf = None
            if fights:
                nf = sum(1 for n in fights if any(d['id'] == i for d in n['deck']))
                if nf == 0:
                    flags.append('unused')
            cards.append({'id': i, 'new': 1 if is_new else 0, 'base': 1 if base else 0, 'roles': roles, 'fl': flags, 'f': nf, 'nl': nlists.get(i, 0)})
        if not skipped:
            pending |= set(x['ids'])
        n_new = sum(c['new'] for c in cards)
        n_old = len(cards) - n_new
        no = x['no']
        cap_new, cap_old = 7, (3 if no < 10 else 5)
        pl = (plan or {}).get('lists', {}).get(k) or {}
        out_lists.append({'key': k, 'map': x['map'], 'sub': x['sub'], 'no': no, 'name': mp_.get('name') or k, 'parent': mp_.get('parent'),
                          'biome': mp_.get('biome'), 'biomes': mb, 'skipped': skipped,
                          'cap': {'reveal': cp['reveal'], 'skirmish': cp['skirmish'], 'elite': cp['elite'], 'boss': cp['boss']},
                          'n': {'new': n_new, 'old': n_old, 'total': len(cards), 'capNew': cap_new, 'capOld': cap_old, 'capTotal': cap_new + cap_old,
                                'planAfter': pl.get('after'), 'planNew': pl.get('afterNew'), 'planOld': pl.get('afterOld'), 'fights': len(fights) if fights else None},
                          'top': max([step(by[i].get('rarity')) for i in x['ids'] if step(by[i].get('rarity')) is not None] or [0]),
                          'cards': cards})
    # ---- map-level chips ----
    mains = [m for m in out_lists if not m['sub']]
    by_key = {m['key']: m for m in out_lists}
    for i, m in enumerate(out_lists):
        chips = []
        cs = m['cards']
        def add(kind, sev, text, ids_=None):
            chips.append({'k': kind, 't': text, 'sev': sev, 'ids': ids_ or []})
        rx = [c['id'] for c in cs if 'rx' in c['fl']]
        ra = [c['id'] for c in cs if 'ra' in c['fl']]
        if rx:
            add('rar', 'hi', '%d not revealed yet' % len(rx), rx)
        if ra:
            add('rar', 'warn', '%d above the cap (%s)' % (len(ra), H5.RARITY_LABEL.get(m['cap']['boss'], m['cap']['boss'])), ra)
        # the map before: the last main-line list at or before this one's number (a side map opens at its own number, not beside its parent)
        prev = None
        for x in mains:
            if x is m:
                break
            if x['no'] <= m['no'] and x['key'] != m['key']:
                prev = x
        if prev and not m['skipped'] and m['top'] - prev['top'] >= 2:
            lab = lambda t: H5.RARITY_LABEL.get(STEPS[t], STEPS[t])
            add('rar', 'info' if m['top'] <= step(m['cap']['boss']) else 'warn',
                'rarity jump: top %s after %s (%s)' % (lab(m['top']), lab(prev['top']), prev['name']) + (' - within the map\'s cap' if m['top'] <= step(m['cap']['boss']) else ''))
        n = m['n']
        if not m['skipped']:
            if n['new'] > n['capNew']:
                add('size', 'warn', 'new %d over the cap %d' % (n['new'], n['capNew']))
            if n['old'] > n['capOld']:
                add('size', 'warn', 'carried %d over the cap %d' % (n['old'], n['capOld']))
            near = [x['n']['total'] for x in out_lists if x is not m and not x['skipped'] and bool(x['sub']) == bool(m['sub']) and abs(x['no'] - m['no']) <= 3]
            if len(near) >= 2:
                near.sort()
                med = near[len(near) // 2] if len(near) % 2 else (near[len(near) // 2 - 1] + near[len(near) // 2]) / 2
                if n['total'] >= 1.5 * med:
                    add('size', 'warn', '%d cards, %.1fx its neighbours (median %g)' % (n['total'], n['total'] / med, med))
                elif n['total'] <= 0.6 * med:
                    add('size', 'warn', '%d cards, well under its neighbours (median %g)' % (n['total'], med))
            if n['new'] < 4:
                add('size', 'warn', 'only %d new cards (wanted about 4-7)' % n['new'])
        late = [c['id'] for c in cs if 'late' in c['fl']]
        nos = [c['id'] for c in cs if 'nosrc' in c['fl']]
        many = [c['id'] for c in cs if 'many' in c['fl']]
        mis = [c['id'] for c in cs if 'mis' in c['fl']]
        unused = [c['id'] for c in cs if 'unused' in c['fl']]
        if late:
            add('sel', 'warn', '%d first obtainable after this map' % len(late), late)
        if nos:
            add('sel', 'hi', '%d with no pack or other source' % len(nos), nos)
        if many:
            add('sel', 'info', '%d on %d+ lists' % (len(many), THRESH_MANY), many)
        if mis:
            add('sel', 'info', '%d possible theme misfit' % len(mis), mis)
        if unused:
            add('sel', 'info', '%d not played in any fight here' % len(unused), unused)
        if m['skipped']:   # the tutorial and the endless dungeons keep their lists on purpose: show, do not alarm
            for ch in chips:
                ch['sev'] = 'info'
        m['chips'] = chips
    # ---- packs summary ----
    shop = {p['packNo']: p for p in H5.shop_packs(root) if p.get('packNo')}
    rng = {1: (0, 6), 2: (7, 13), 3: (14, 20), 4: (21, 27), 5: (28, 34), 6: (35, 41)}
    hidden = lambda c: c.get('test') or c.get('token') or c.get('hidden')
    listed_all = set(i for m in out_lists for i in (c['id'] for c in m['cards']))
    plan_keep = None
    if plan:
        plan_keep = {}
        for k, e in plan['lists'].items():
            plan_keep[k] = set(e.get('keep') or (pools.get(k, {}).get('cards') if k in pools else None) or [])
        for k, m in by_key.items():       # a skipped list keeps all of its cards
            if k not in plan_keep or plan['lists'].get(k, {}).get('skipped'):
                plan_keep[k] = set(c['id'] for c in m['cards'])
    packs = []
    tiers = sorted(set((c.get('source') or {}).get('tier') for c in canon if (c.get('source') or {}).get('kind') == 'pack' and not hidden(c)))
    for t in tiers:
        cs = [c for c in canon if (c.get('source') or {}).get('kind') == 'pack' and (c.get('source') or {}).get('tier') == t and not hidden(c)]
        cid = set(c['id'] for c in cs)
        a, b = rng.get(t, (None, None))
        in_range = set()
        if a is not None:
            in_range = set(i for m in out_lists if a <= m['no'] <= b for i in (c['id'] for c in m['cards']))
        name = shop.get(t, {}).get('name') or {11: 'Faction pool', 99: 'Mystery Booster'}.get(t) or 'Pack %s' % t
        p_in = cid & in_range
        p_else = (cid & listed_all) - in_range
        p_none = cid - listed_all
        row = {'tier': t, 'name': name, 'maps': ('Maps %d-%d' % (a, b)) if a is not None else '', 'cards': len(cid), 'draw': shop.get(t, {}).get('cards'),
               'inRange': len(p_in), 'elsewhere': len(p_else), 'none': len(p_none), 'none_ids': sorted(p_none, key=lambda i: (step(by[i].get('rarity')) or 0, by[i].get('name', i))),
               'else_ids': sorted(p_else), 'rangeUnique': len(in_range),
               'rangeOther': len(in_range - cid), 'lists': sum(1 for m in out_lists if a is not None and a <= m['no'] <= b)}
        if plan_keep is not None and a is not None:
            after = set(i for m in out_lists if a <= m['no'] <= b for i in plan_keep.get(m['key'], ()))
            row['afterRange'] = len(cid & after)
            row['afterAny'] = len(cid & set().union(*plan_keep.values()))
        packs.append(row)
    # ---- totals ----
    def obtainable(c):
        if hidden(c) or c.get('easterEgg') or (c.get('source') or {}).get('kind') == 'easteregg':
            return False
        k = (c.get('source') or {}).get('kind')
        if k == 'map':
            return bool((c.get('source') or {}).get('node'))
        if k in OBTAINABLE_KINDS:
            return True
        return is_base(c)
    obt = [c for c in canon if obtainable(c)]
    obt_ids = set(c['id'] for c in obt)
    kinds = {}
    for c in obt:
        k = (c.get('source') or {}).get('kind') or 'base'
        kinds[k] = kinds.get(k, 0) + 1
    totals = {'cards': len(canon), 'obtainable': len(obt), 'bySource': kinds, 'listed': len(listed_all), 'listedObtainable': len(listed_all & obt_ids),
              'listedNotObtainable': sorted(listed_all - obt_ids, key=lambda i: by[i].get('name', i)), 'obtainableNotListed': len(obt_ids - listed_all),
              'entries': sum(m['n']['total'] for m in out_lists), 'lists': len(out_lists)}
    if plan_keep is not None:
        pk_all = set().union(*plan_keep.values())
        totals['planEntries'] = sum(len(v) for v in plan_keep.values())
        totals['planUnique'] = len(pk_all)
        totals['planAwaiting'] = len(plan.get('awaiting') or [])
        totals['planMoves'] = len(plan.get('moves') or [])
        totals['planObtainableNotListed'] = len(obt_ids - pk_all)
    # ---- the THEME1 proposal (2026-10-28, owner's plan steps 1-2): per list its unique / carried / cut cards; optional, read only ----
    prop = None
    try:
        P = L(*PROPOSAL)
        prop = {'built': P.get('built'), 'totals': {k: v for k, v in P['totals'].items() if k not in ('noHomeIds',)}, 'noHome': P['totals'].get('noHomeIds', []),
                'packs': [{k: v for k, v in p.items()} for p in P['packs']], 'sideClasses': P.get('sideClasses', []), 'rules': P.get('rules', {}), 'lists': {}}
        for e in P['maps']:
            if e.get('skipped'):
                prop['lists'][e['key']] = {'kept': 1, 'theme': e['theme']['line']}
                continue
            prop['lists'][e['key']] = {
                'theme': e['theme']['line'], 'side': e.get('sideClass'),
                'u': [{'id': r['id'], 'w': 1 if r['wasHere'] else 0, 'mf': r.get('movedFrom'), 'why': r['why'], 'g': r['gen'], 'h': 1 if r['high'] else 0, 'c': r['cost'], 'af': r['alsoFits']} for r in e['unique']],
                'c': [{'id': r['id'], 'w': 1 if r['wasHere'] else 0, 'fr': r['from'], 'g': r['gen'], 'h': 1 if r['high'] else 0, 'c': r['cost']} for r in e['carried']],
                'x': [{'id': x['id'], 'to': x['to']} for x in e['cut']], 'mix': e['mix'], 'n': e['counts']}
    except FileNotFoundError:
        pass
    # ---- card dictionary (once) ----
    used = set(i for m in out_lists for i in (c['id'] for c in m['cards'])) | set(i for p in packs for i in p['none_ids'])
    if prop:
        for e in prop['lists'].values():
            used |= set(r['id'] for r in e.get('u', []) + e.get('c', []))
        used |= set(prop['noHome']) | set(i for p in prop['packs'] for i in p.get('packOnlyIds', []))
    for m in out_lists:
        for ch in m['chips']:
            used |= set(ch['ids'])
    cd = {}
    for i in used:
        c = by[i]
        s = c.get('source') or {}
        k = s.get('kind')
        pk = ''
        if k == 'pack':
            pk = {11: 'Faction', 99: 'Mystery'}.get(s.get('tier')) or 'P%s' % s.get('tier')
        elif k == 'map':
            pk = 'Skirmish'
        elif is_base(c):
            pk = 'Base'
        elif k:
            pk = k.capitalize()
        cd[i] = {'n': c.get('name', i), 'ic': c.get('icon', ''), 'r': c.get('rarity') or '', 'pk': pk, 'o': om.get(i), 'sp': ', '.join((c.get('species') or [])) if isinstance(c.get('species'), list) else (c.get('species') or ''),
                 'an': c.get('animal') or '', 'bi': (units.get(i) or {}).get('biomes') or []}
    labels = {b['id']: b['label'] for b in ut['vocab']['biomes']}
    return {'built': datetime.date.today().isoformat(), 'lists': out_lists, 'cards': cd, 'packs': packs, 'totals': totals,
            'rarities': [{'k': k, 'l': H5.RARITY_LABEL[k]} for k in H5.RARITY_ORDER], 'steps': STEPS, 'biomeLabels': labels,
            'planned': bool(plan), 'decksDate': decks_date, 'thresholdMany': THRESH_MANY, 'proposal': prop}


if __name__ == '__main__':
    import sys
    root = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
    canon = json.load(open(os.path.join(root, 'canonical', 'cards.json'), encoding='utf-8'))
    d = mapcards(root, canon)
    json.dump(d, sys.stdout, ensure_ascii=False)
