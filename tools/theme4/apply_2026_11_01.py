"""THEME4 (2026-11-01): fold the owner's Map cards export (docs/balance/owner-map-cards-export-2026-11-01.json) into
canonical/map-pools.json and canonical/map-review.json. Final list = chosen - the owner's cuts + the owner's keeps, worked in road
order (Map 0 up), then Claude's carried fills (plan_2026_11_01.ADD) and "Unlikely" flags (UNLIKELY; still on the list until the owner
decides). Rules: main map 8-11 own cards (Map 0 / 1: up to 12) and 4-5 carried (Map 0: up to 7); side map its class's own cards, 10+ carried."""
import json, re, os
R = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))) + '/'
exec(open(R + 'tools/theme4/plan_2026_11_01.py').read())
ex = json.load(open(R + 'docs/balance/owner-map-cards-export-2026-11-01.json'))
pools = json.load(open(R + 'canonical/map-pools.json'))
rev = json.load(open(R + 'canonical/map-review.json'))
cards = {c['id'] for c in json.load(open(R + 'canonical/cards.json'))}
RELFIX3_BOSS = {'mb':'old-shell', 'mc':'the-gannet-queen', 'm2':'drowned-matriarch', 'mw':'old-snapjaw', 'm8':'heron-hag', 'm4':'echo-matriarch', 'm7':'reef-admiral', 'm5':'pride-queen', 'm6':'wolfsbane-alpha', 'm3':'yeti-chieftain', 'm23':'triumvirate'}
top_of = {}
for t, e in pools['maps'].items():
    top_of[t] = t
    for s in (e.get('submaps') or {}):
        top_of[s] = t
for L in ex['lists']:
    k = L['mapId'] if L['listKey'] == 'cards' else L['listKey'][4:]
    cn, kp = set(L['cutNow']), [x for x in L['keep'] if x not in L['chosen']]
    final = [x for x in L['chosen'] if x not in cn] + kp
    adds = ADD.get(k, {}); unl = UNLIKELY.get(k, {})
    final += [x for x in adds if x not in final]
    assert all(x in cards for x in final), (k, [x for x in final if x not in cards])
    t = top_of[k]
    if k == t: pools['maps'][t]['cards'] = [x for x in final if not (RELFIX3_BOSS.get(k) == x and x in (pools['maps'][t].get('special') or []))]  # RELFIX3: the boss card stays in SPECIAL
    else: pools['maps'][t]['submaps'][k] = final
    r = rev['maps'].setdefault(k, {'chosen': [], 'cut': [], 'maybe': []})
    old = {e['id']: e for e in r.get('chosen', []) + r.get('cut', []) + r.get('maybe', [])}
    ch = []
    for x in final:
        e = dict(old.get(x) or {'id': x})
        if x in kp: e.update(why='Owner 11-01: kept (' + (e.get('why') or 'from the maybes / cuts') + ')', by='owner')
        if x in adds: e.update(why=adds[x], by='owner' if k == 'mb' and x == 'dolphin-knight' else 'claude')
        e.pop('flag', None); e.pop('flagWhy', None)
        if x in unl: e.update(flag='unlikely', flagWhy=unl[x])
        ch.append(e)
    cut = [e for e in r.get('cut', []) if e['id'] not in final and e['id'] not in cn]
    for x in L['chosen']:
        if x in cn: cut.append(dict(old.get(x) or {'id': x}, why='Owner 11-01: cut', by='owner'))
    r['chosen'] = ch; r['cut'] = cut; r['maybe'] = [e for e in r.get('maybe', []) if e['id'] not in final]
rev['theme4'] = 'THEME4 (2026-11-01): the owner\'s picks folded (tools/theme4/apply_2026_11_01.py); chosen entries may carry flag "unlikely" + flagWhy (Claude\'s flag, still on the list).'
# map-pools.json keeps its one-list-per-line layout
def dump_pools(p):
    out = ['{', ' "_about": ' + json.dumps(p['_about'], ensure_ascii=False) + ',', ' "maps": {']
    ms = list(p['maps'].items())
    for i, (t, e) in enumerate(ms):
        out.append('  ' + json.dumps(t) + ': {')
        keys = list(e.keys())
        for j, kk in enumerate(keys):
            end = ',' if j < len(keys) - 1 else ''
            if kk == 'submaps' and not e['submaps']:
                out.append('   "submaps": {}' + end)
            elif kk == 'submaps':
                out.append('   "submaps": {')
                ss = list(e['submaps'].items())
                for q, (s, l) in enumerate(ss):
                    out.append('    ' + json.dumps(s) + ': ' + json.dumps(l, ensure_ascii=False) + (',' if q < len(ss) - 1 else ''))
                out.append('   }' + end)
            else:
                out.append('   ' + json.dumps(kk) + ': ' + json.dumps(e[kk], ensure_ascii=False) + end)
        out.append('  }' + (',' if i < len(ms) - 1 else ''))
    out += [' }', '}']
    return '\n'.join(out) + '\n'
open(R + 'canonical/map-pools.json', 'w').write(dump_pools(pools))
open(R + 'canonical/map-review.json', 'w').write(json.dumps(rev, ensure_ascii=False, indent=1) + '\n')
print('ok')
