#!/usr/bin/env python3
# 2026-10-31 (package BUDGET2, owner RECOST1-6 "If Attack = 3 Health ... 3*attack"): the skill prices in canonical/skill-costs.json that
# are a sum of Attack and Health points by logic (not measured), re-priced at 3A + H. Each keeps its old value as prevValue (the table's
# convention). Measured prices (Buff's +1 Attack 2.1 / +1 Health 0.5 ...) and the context / threshold / time-of-day skills priced inside
# bramblewood-budget.js (its attackWeight) are not touched here. Line-per-entry file: only the edited lines change.
#   python3 tools/budget2_skill_costs_2026_10_31.py [--dry]
import json, os, sys
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
P = os.path.join(ROOT, 'canonical', 'skill-costs.json')
AT = '2026-10-31 (package BUDGET2, 3A + H)'
# id -> (new value, why)
EDITS = {
    # item 4 (ANAD-1 "+2 Health in non-sea, +1 attack in sea"): one half is always on; the sea half is 3 points now (3A + H), the river half 2.
    # s = the share of salt-water fights (rules.saltMap) over the road and the dungeons, read with tools/lib_bramble.js now that it loads
    # the biome tables: 26 of 417 = 0.062 -> 3 x 0.062 + 2 x 0.938 = 2.06, up to the next tenth. Measured (tools/skill_canon_2026_10_31.js,
    # 200 paired fights on 6 vanilla carriers, global fields): 2.31 [1.88, 2.93] stat points, 1.03 [0.87, 1.32] canon points (the ruler)
    'anadromous': (2.1, 'priced at 3A + H: +1 Attack at sea (3 points) x the salt-water share 0.062 (26 of 417 fights, tools/lib_bramble.js with the biome tables) + +2 Health elsewhere (2 points) x 0.938 = 2.06, up to the next tenth. Measured: 2.31 [1.88, 2.93] stat points on 6 vanilla carriers (tools/skill_canon_2026_10_31.js, docs/balance/skill-canon-anadromous-2026-10-31.json). On a sea map\'s own list it would be worth up to 3'),
    'assault': (2.7, 'Assault N: a point of Attack on its own swing is 3 in the budget now (3A + H), 0.9 x 3 = 2.7 a point (was 0.9 x 2 = 1.8)'),
    'liege': (1.62, 'a plain Liege is Liege {Assault 2}: 0.3 x (2 x 2.7) = 1.62 (was 0.3 x 3.6 = 1.08)'),
    # the threshold skills' table values are the plain N's default price, documentation of what thrS computes: {+2/+2} is 8 points now
    'requiem': (4.24, 'plain N 5 {+2/+2}: 8 points (3A + H) x 0.53 = 4.24 (bramblewood-budget.js thrS)'),
    'dirge': (3.68, 'plain N 3 {+2/+2}: 8 x 0.46 = 3.68 (thrS)'),
    'carnage': (3.28, 'plain N 3 {+2/+2}: 8 x 0.41 = 3.28 (thrS)'),
    'muster': (3.92, 'plain N 6 {+2/+2}: 8 x 0.49 = 3.92 (thrS)'),
    'beset': (2.4, 'plain N 6 {+2/+2}: 8 x 0.30 = 2.4 (thrS)'),
    'throng': (5.12, 'plain N 10 {+2/+2}: 8 x 0.64 = 5.12 (thrS)'),
}
# X14 (owner 10-30: "comparing skills with a set of skills we have 'canonised' their values of"): the canon anchors. Each keeps its price
# (canon: true; canonAt: the numbers the tool measures it at; canonReason: why it is a good yardstick). tools/skill_canon_2026_10_31.js prices
# a new or changed skill against them by paired sims. Chosen: high-confidence measured prices (RECOST1's 200-fight re-measure or the 10-19
# measured worth) equal to the table value, on 8+ cards, plain mechanics with no field, partner or map condition, and spread over the
# families (defence, status, healing, timing, reach, area, aura, economy) and over price (0.9 to 4.9 points at canonAt).
CANON = {
    'armor': ([1, 2], 'defence per hit; 54 cards; 1.68 x N^1.43 set by the owner\'s rule (ENG10) on the measured 10-19 worth'),
    'poison': ([1, 2], 'damage over time; 32 cards; 3.0 x N^0.7 fitted to the robust skill test (EN5), measured 3.13 (high)'),
    'bleed': ([1, 2], 'damage over time that wears off; 17 cards; RECOST1 200-fight measure 2.05 a point (high)'),
    'regen': ([2], 'healing a round; 17 cards; RECOST1 measure 0.48 a point (high)'),
    'pounce': ([2], 'an early extra hit; 17 cards; RECOST1 measure 0.76 (high)'),
    'quick': ([True], 'timing (no Wait to act); 16 cards; RECOST1 measure 1.12 (high)'),
    'sweep': ([2], 'area damage (Cleave); 15 cards; RECOST1 measure 0.55 (high)'),
    'fork': ([True], 'reach (more than one target); 9 cards; RECOST1 measure 1.27 (high)'),
    'rage': ([True], 'a stat swing on low Health; 8 cards; RECOST1 measure 0.99 (high)'),
    'inspiring': ([1], 'an aura on allies; 9 cards; RECOST1 measure 2.3 (high)'),
    'onReadyGold': ([1], 'economy (a resource); 11 cards; RECOST1 measure 2.31 (high)'),
    'shell': ([2], 'damage reduction once; 8 cards; RECOST1 measure 0.47 a point (high)'),
}
lines = open(P).read().split('\n')
out, seen, in_skills = [], set(), False
for ln in lines:
    st = ln.strip()
    if st.startswith('"skills": ['): in_skills = True  # the keyword skills (the actions list has its own poison / bleed entries)
    elif in_skills and st.startswith('"'): in_skills = False
    if in_skills and st.startswith('{"id":'):
        body = st[:-1] if st.endswith(',') else st
        try:
            e = json.loads(body)
        except Exception:
            out.append(ln); continue
        if e.get('id') in CANON and not e.get('canon'):
            at, why = CANON[e['id']]
            e['canon'] = True; e['canonAt'] = at; e['canonReason'] = why; e['canonSince'] = '2026-10-31 (package BUDGET2, X14)'
            indent = ln[:len(ln) - len(ln.lstrip())]
            ln = indent + json.dumps(e, ensure_ascii=False, separators=(',', ':')) + (',' if st.endswith(',') else '')
            seen.add('canon:' + e['id']); print('canon %s at %s' % (e['id'], at))
        if e.get('id') in EDITS and e.get('appliedAt', '').find('BUDGET2') < 0:
            v, why = EDITS[e['id']]
            e['prevValue'] = e.get('value'); e['value'] = v; e['appliedAt'] = AT
            e['note'] = (e.get('note') or '') + ' ' + AT + ': ' + why + '.'
            indent = ln[:len(ln) - len(ln.lstrip())]
            ln = indent + json.dumps(e, ensure_ascii=False, separators=(',', ':')) + (',' if st.endswith(',') else '')
            seen.add(e['id']); print('%-10s %s -> %s' % (e['id'], e['prevValue'], v))
    out.append(ln)
missing = (set(EDITS) | set('canon:' + k for k in CANON)) - seen
if missing: print('not edited (missing or already applied):', ', '.join(sorted(missing)))
s = '\n'.join(out); json.loads(s)
if '--dry' not in sys.argv: open(P, 'w').write(s); print('wrote canonical/skill-costs.json')
