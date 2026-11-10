#!/usr/bin/env python3
# SKILL9 (2026-11-11, owner: "Run through all skills again, make sure they meet our standard. Highlight any duplicates. In the end, the target
# is for <80 skills (total) at Map 20."). Analysis only: reads the dump from tools/skill9/skill9_dump_2026_11_11.py and canonical data,
# changes no card, map or engine file. Writes docs/design/skills-audit-2026-11-11.json: the inventory (every skill the registry knows, where
# a player first meets it, its carriers, text, icon, price and a VFX hint), the checks, and the plan's projected count (the hand-written plan
# is tools/skill9/plan_2026_11_11.json).
# How a skill counts: the Map cards window's own rule (ui19McSkillRows + ui28SkillMeet: a card on the map's main list that has the skill at
# Level 0, not shown as "?" there; ENG35 parts count as their skill; an ENG39 kind keeps its own name, so it counts on its own today).
# Usage: python3 tools/skill9/skill9_audit_2026_11_11.py DUMP.json [--print]
import json, os, re, sys
from collections import defaultdict, Counter

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
OUT = os.path.join(ROOT, 'docs', 'design', 'skills-audit-2026-11-11.json')
PLAN = os.path.join(ROOT, 'tools', 'skill9', 'plan_2026_11_11.json')
PICKS = os.path.join(ROOT, 'docs', 'design', 'map-picks-owner-2026-11-11.json')
LAST = 20
FX_FILES = ['bramblewood-fx-a.js', 'bramblewood-fx-b.js', 'bramblewood-fx-c.js', 'bramblewood-fx-d.js', 'bramblewood-fx-e.js', 'bramblewood-fx-f.js',
            'bramblewood-fx-g.js', 'bramblewood-fx-war.js', 'bramblewood-skillfx.js', 'bramblewood-procfx.js', 'bramblewood-unitfx.js']


def load(p):
    return json.load(open(os.path.join(ROOT, p), encoding='utf-8'))


def kinds_of():
    """ENG39 kinds: old key -> (family key, selector text)."""
    out = {}
    for fam, f in load('canonical/skill-params.json')['families'].items():
        for sel, m in (f.get('kinds') or {}).items():
            for val, old in m.items():
                out[old] = (fam, '%s: %s' % (sel, val))
        for e in f.get('kindSets') or []:
            out[e['key']] = (fam, ', '.join('%s: %s' % kv for kv in e['match'].items()))
    return out


def vfx_corpus():
    """Event types the page handles, event types the engine emits, and the text of the FX modules (a grep hint, not proof)."""
    app = open(os.path.join(ROOT, 'arena_app.js'), encoding='utf-8').read()
    handled = set(re.findall(r"\b(?:ev|e|evt|x)\.(?:type|kind) *=== *'([A-Za-z0-9_]+)'", app))
    eng = open(os.path.join(ROOT, 'bramblewood-engine.js'), encoding='utf-8').read()
    emitted = set(re.findall(r"type: *'([A-Za-z0-9_]+)'", eng)) | set(re.findall(r"kind: *'([A-Za-z0-9_]+)'", eng))
    fx = ''.join(open(os.path.join(ROOT, f), encoding='utf-8').read() for f in FX_FILES if os.path.exists(os.path.join(ROOT, f)))
    return handled, emitted, fx


def vfx_hint(key, label, handled, emitted, fx):
    cands = {key, key.lower(), re.sub(r'[^a-z]', '', label.lower())}
    cands |= {key + 'Fx', key + 'Hit'}
    lo_h = {h.lower() for h in handled}
    if any(c.lower() in lo_h and c.lower() in {e.lower() for e in emitted} for c in cands):
        return 'own event'
    if re.search(r"\b%s\b" % re.escape(key), fx):
        return 'fx module'
    return ''


def main():
    if len(sys.argv) < 2:
        sys.exit('usage: skill9_audit_2026_11_11.py DUMP.json [--print]')
    D = json.load(open(sys.argv[1], encoding='utf-8'))
    reg = {r['key']: r for r in D['registry']}
    cards = {c['id']: c for c in D['cards']}
    maps = {m['id']: m for m in D['maps']}
    kinds = kinds_of()
    sc = load('canonical/skill-costs.json')
    costs = {s['id']: s for s in sc['skills']}
    for k, v in (sc.get('shorthands') or {}).items():  # a keyword priced as trigger x action (Milling, Pack Howl ...)
        costs.setdefault(k, {'scale': 'shorthand', 'value': '%s x %s' % (v.get('trigger'), v.get('action'))})
    params = load('canonical/skill-params.json')['families']
    handled, emitted, fx = vfx_corpus()
    minor = set(D['minor'])
    live = lambda c: c and not (c['token'] or c['test'] or c['egg'] or c['field'] or c['pool'])

    # ---- where each skill is first met (main lists by the game's rule; the other sources beside it)
    first = {}            # key -> main map no (main list, Level 0, revealed)
    perMapNew = {}
    lists = {}
    for m in sorted(D['perMap'], key=lambda m: m['no']):
        lists[m['no']] = (next((s for s in (maps.get(m['id']) or {'sections': []})['sections'] if s['key'] == 'cards'), {'ids': []}))['ids']
        new = []
        for r in m['rows']:
            if r['met'] and r['key'] not in first:
                first[r['key']] = m['no']
                new.append(r['key'])
        perMapNew[m['no']] = new
    src = defaultdict(dict)

    def add(k, what, no):
        if no is None:
            return
        if what not in src[k] or no < src[k][what]:
            src[k][what] = no
    for m in D['maps']:
        no = m['unlockNo'] if m['sub'] else m['no']
        side = 'side' if m['sub'] else 'main'
        for n in m['nodes']:
            for cid in n['deck']:
                for s in (cards.get(cid) or {}).get('skills', []):
                    add(s['key'], side + ' fight' + ('' if s['lvl'] == 0 else ' (level %d)' % s['lvl']), no)
            for cid in n['rewards']:
                for s in (cards.get(cid) or {}).get('skills', []):
                    add(s['key'], side + ' reward', no)
        for sec in m['sections']:
            for cid in sec['ids']:
                for s in (cards.get(cid) or {}).get('skills', []):
                    if sec['key'] == 'cards':
                        add(s['key'], 'main list' + ('' if s['lvl'] == 0 else ' (level %d)' % s['lvl']), no)
                    elif sec['key'] == 'special':
                        add(s['key'], 'main special', no)
                    else:
                        sub = maps.get(sec['key'][4:])
                        add(s['key'], 'side list', sub['unlockNo'] if sub else no)
    for cid in D['starter']:
        for s in (cards.get(cid) or {}).get('skills', []):
            add(s['key'], 'starter deck', 0)

    # ---- the owner's picks (Maps 0-11, 12 in progress) in place of the main lists: the same rule
    picks = load('docs/design/map-picks-owner-2026-11-11.json')['maps']
    pick_by_no = {v['mapNo']: v['yes'] for v in picks.values() if not v.get('wip')}
    first_p = {}
    for no in sorted(lists):
        if no > LAST:
            continue
        for cid in pick_by_no.get(no, lists[no]):
            c = cards.get(cid)
            for s in (c or {}).get('skills', []):
                rv = reg.get(s['key'], {}).get('reveal')
                if s['lvl'] == 0 and (rv is None or rv <= no):
                    first_p.setdefault(s['key'], no)

    # ---- carriers
    carriers = defaultdict(list)
    road = defaultdict(list)
    road_first = {}
    for no in sorted(lists):
        for cid in lists[no]:
            road_first.setdefault(cid, no)
    for c in D['cards']:
        if not live(c):
            continue
        for s in c['skills']:
            carriers[s['key']].append(c['id'])
            if c['id'] in road_first and road_first[c['id']] <= LAST:
                road[s['key']].append('%s (M%d%s)' % (c['name'], road_first[c['id']], '' if s['lvl'] == 0 else ', L%d' % s['lvl']))

    # ---- inventory rows: every registry key that is a skill of its own (not an ENG35 part), not retired / reserved, plus any key a card holds
    keys = {k for k, r in reg.items() if r['fused'] == k and not r['reserved']} | set(carriers)
    inv = []
    for k in sorted(keys, key=lambda k: (first.get(k, 999), (reg.get(k) or {}).get('label', k).lower())):
        r = reg.get(k) or {'label': k, 'category': '?', 'kind': '', 'short': '', 'desc': '', 'codex': '', 'icon': '', 'retired': False, 'reveal': None}
        parts = sorted(x for x, y in reg.items() if y['fused'] == k and x != k)
        c = costs.get(k)
        price = None if not c else {'scale': c.get('scale'), 'value': c.get('value'), 'theoretical': bool(c.get('theoretical'))}
        if price is None and k in params and params[k].get('cost'):
            price = {'family': True}
        others = {w: v for w, v in src.get(k, {}).items()}
        any_main = min([v for w, v in others.items() if w.startswith('main') or w == 'starter deck'] or [None], key=lambda v: 999 if v is None else v)
        side = min([v for w, v in others.items() if w.startswith('side')] or [None], key=lambda v: 999 if v is None else v)
        inv.append({
            'key': k, 'name': r['label'], 'category': r['category'], 'kind': r['kind'], 'retired': r['retired'],
            'kindOf': ('%s {%s}' % kinds[k]) if k in kinds else '', 'parts': parts,
            'short': r['short'], 'text': r['desc'], 'codex': r['codex'], 'icon': r['icon'], 'revealFrom': r['reveal'],
            'cards': len(carriers.get(k, [])), 'roadCards': sorted(road.get(k, []), key=lambda s: int(re.search(r'\(M(\d+)', s).group(1))),
            'firstMainList': first.get(k), 'firstMainListOwnerPicks': first_p.get(k), 'firstMainAny': any_main, 'firstSide': side,
            'sources': others, 'minor': k in minor, 'price': price,
            'vfx': vfx_hint(k, r['label'], handled, emitted, fx)})
    by20 = [x for x in inv if x['firstMainList'] is not None and x['firstMainList'] <= LAST]
    by20_any = [x for x in inv if x['firstMainAny'] is not None and x['firstMainAny'] <= LAST]
    by20_side = [x for x in inv if (x['firstMainAny'] is not None and x['firstMainAny'] <= LAST) or (x['firstSide'] is not None and x['firstSide'] <= LAST)]
    by20_p = [x for x in inv if x['firstMainListOwnerPicks'] is not None and x['firstMainListOwnerPicks'] <= LAST]

    # ---- triggers on main lists 0-20 (On X: Y lines; the game's count does not see them)
    trig = Counter()
    for no, ids in lists.items():
        if no > LAST:
            continue
        for cid in ids:
            for t in (cards.get(cid) or {}).get('triggers', []):
                trig['%s: %s' % (t['on'], t['do'])] += 1

    # ---- the plan: a fold counts as its family's head, a swap or a delay leaves the road; first map of a head = its earliest member
    plan = json.load(open(PLAN, encoding='utf-8')) if os.path.exists(PLAN) else {}
    fold_to = {k: f['head'] for f in plan.get('families', []) for k in f['folds']}
    off = {c['key'] for c in plan.get('swaps', []) + plan.get('delays', [])}
    unknown = sorted({k for f in plan.get('families', []) for k in f['folds'] + f.get('offRoad', []) + [f['head']]
                      if k not in reg and not f.get('newHead')} | {k for k in off if k not in reg})
    if unknown:
        print('plan names no registry key:', unknown)
    head_name = {f['head']: f['name'] for f in plan.get('families', [])}

    def after_plan(firsts):
        out = {}
        for k, no in firsts.items():
            if no is None or no > LAST or k in off:
                continue
            h = fold_to.get(k, k)
            out[h] = min(out.get(h, 99), no)
        return out
    name_of = lambda k: head_name.get(k) or (reg.get(k) or {}).get('label', k)
    post = after_plan({x['key']: x['firstMainAny'] for x in inv})
    post_p = after_plan({x['key']: x['firstMainListOwnerPicks'] for x in inv})
    per_post = {n: sorted(name_of(k) for k, v in post.items() if v == n) for n in range(LAST + 1)}
    per_now = {n: sorted(x['name'] for x in by20_any if x['firstMainAny'] == n) for n in range(LAST + 1)}
    per_post_p = {n: sorted(name_of(k) for k, v in post_p.items() if v == n) for n in range(LAST + 1)}
    after = sorted(name_of(k) for k in post)
    proj = len(post)
    post_side = after_plan({x['key']: min([v for v in (x['firstMainAny'], x['firstSide']) if v is not None] or [None], key=lambda v: 999 if v is None else v) for x in inv})
    # skills a Map 0-20 player does not meet on the main road: side maps by Map 20, main Map 21+, on cards elsewhere (packs, factions, raids, unplaced), on no card
    elsewhere = {
        'sideMapsBy20': sorted(x['name'] for x in inv if not (x['firstMainAny'] is not None and x['firstMainAny'] <= LAST) and x['firstSide'] is not None and x['firstSide'] <= LAST),
        'mainMap21Plus': sorted(x['name'] for x in inv if x['firstMainAny'] is not None and x['firstMainAny'] > LAST and not (x['firstSide'] is not None and x['firstSide'] <= LAST)),
        'onCardsNotOnAnyMap': sorted(x['name'] for x in inv if x['cards'] and x['firstMainAny'] is None and x['firstSide'] is None),
        'onNoCard': sorted(x['name'] for x in inv if not x['cards'] and not x['retired']),
        'retired': sorted(x['name'] for x in inv if x['retired'])}
    single = sorted(x['name'] for x in by20 if len(x['roadCards']) == 1)

    counts = {
        'registry': len(D['registry']), 'skillsOfTheirOwn': len(keys), 'onAnyLiveCard': len(carriers),
        'retired': sum(1 for x in inv if x['retired']), 'onNoCard': sum(1 for x in inv if not x['cards'] and not x['retired']),
        'by20MainLists': len(by20), 'by20MainListsMinorExcluded': sum(1 for x in by20 if not x['minor']),
        'by20MainAnySource': len(by20_any), 'by20WithSideMaps': len(by20_side), 'by20OwnerPicks': len(by20_p),
        'triggerLinesOnMainLists': len(trig), 'singleCarrierOnRoad': len(single),
        'projectedAfterPlan': proj, 'projectedAfterPlanMinorExcluded': sum(1 for k in post if k not in minor),
        'projectedAfterPlanWithOwnerPicks': len(post_p), 'projectedAfterPlanWithSideMaps': len(post_side),
    }
    out = {'_about': 'SKILL9 skills audit (2026-11-11). Generated by tools/skill9/skill9_audit_2026_11_11.py from the game (headless dump of the '
                     'built index.html) and canonical data; the plan part is tools/skill9/plan_2026_11_11.json. Analysis only: nothing applied. '
                     'firstMainList = the first main map whose main list holds a card with the skill at Level 0 (the Map cards window rule); '
                     'firstMainAny adds fights, rewards, SPECIAL lists, level skills and the starting deck; firstSide = the first side map '
                     '(by unlock number) that shows it. vfx is a grep hint (own event = the engine emits an event of that name and the page '
                     'handles it; fx module = an FX file names the key); blank = none found, see the doc.',
           'counts': counts, 'perMapNewMainList': {str(k): [reg[x]['label'] for x in v] for k, v in perMapNew.items() if k <= LAST},
           'perMapNewAnySource': {str(k): v for k, v in per_now.items()}, 'perMapNewAfterPlan': {str(k): v for k, v in per_post.items()},
           'perMapNewAfterPlanOwnerPicks': {str(k): v for k, v in per_post_p.items()},
           'singleCarrierOnRoad': single, 'notOnTheMainRoad': elsewhere, 'triggersOnMainLists': dict(trig.most_common()), 'plan': plan, 'remainingAfterPlan': after,
           'inventory': inv}
    with open(OUT, 'w', encoding='utf-8') as f:
        json.dump(out, f, indent=1, ensure_ascii=False)
    print(json.dumps(counts))
    if '--print' in sys.argv:
        for x in by20_side:
            print('%-4s %-4s %-4s %-22s %-18s c%-3d icon=%-3s price=%-5s vfx=%-9s | %s | %s' % (
                x['firstMainList'], x['firstMainAny'], x['firstSide'], x['name'][:22], x['kindOf'][:18], x['cards'], 'y' if x['icon'] else '-',
                (x['price'] or {}).get('value', 'fam' if x['price'] else '-'), x['vfx'] or '-', x['short'][:90], x['text'][:160]))


if __name__ == '__main__':
    main()
