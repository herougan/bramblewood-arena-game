#!/usr/bin/env python3
"""EN3 (2026-10-23, owner 19:27 #6 / #9 / #3): the skill-cost edits in canonical/skill-costs.json, one entry per line as the file keeps them.
  #6 "This has made bleed and poison worse then they actually are ... round them up to the next tenths place, e.g. 2.76->2.8. Otherwise,
     up by 0.1": every Bleed / Poison-family price (the skills whose worth is a Poison or Bleed stack that wears down) goes UP to the next
     tenth; one already on a tenth goes up 0.1. Toxin (never wears off), Detonate, Hunter and Poison Tick (no stack of their own) are left.
  #9 "Okay bulwark is a 9!, not 6."
  #3 the two new bramble skills, Rampart and Bramble Armor (estimates; tools/skill_test_robust.js measurements in docs/balance/).
Run once: python3 tools/en3_skill_costs_2026_10_23.py (it refuses to run twice: it checks for its own note)."""
import json, math, os, sys
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
PATH = os.path.join(ROOT, 'canonical', 'skill-costs.json')
NOTE = '2026-10-23 (package EN3, owner 19:27 #6: Bleed and Poison wore down a stack before its damage; priced up to the next tenth)'
FAMILY_ACTIONS = ['poison', 'bleed']
FAMILY_SKILLS = ['poison', 'bleed', 'gash', 'venomous', 'poisonBolt', 'poisonGas', 'rabid', 'proliferate', 'venomMaster', 'perforate']
NEW = [
 {"id": "rampart", "scale": "fixed", "value": None, "note": "2026-10-23 (package EN3, owner 19:27 #3; name: call EN3-4): takes ceil(half) of each unit-dealt hit on its own bramble, the bramble the rest. Priced from tools/skill_test_robust.js (docs/balance/en3-skill-test-2026-10-23.md)"},
 {"id": "brambleArmor", "scale": "fixed", "value": None, "note": "2026-10-23 (package EN3, owner 19:27 #3; name: call EN3-4): its bramble takes 1 less from each unit-dealt hit (after Rampart); several don't add up (call EN3-5). Priced from tools/skill_test_robust.js (docs/balance/en3-skill-test-2026-10-23.md)"},
]
def up_tenth(v):
    t = math.ceil(round(v * 10, 6)) / 10
    return round(t + 0.1, 1) if abs(t - v) < 1e-9 else round(t, 1)
def main(prices):
    lines = open(PATH, encoding='utf-8').read().split('\n')
    if any('package EN3' in l for l in lines): sys.exit('already applied')
    sec, out, changed = None, [], []
    for ln in lines:
        st = ln.strip()
        if st.startswith('"actions": ['): sec = 'actions'
        elif st.startswith('"skills": ['): sec = 'skills'
        elif st.startswith('"modifiers": [') or st.startswith('"measured"'): sec = None
        if st.startswith('{"id":') and sec:
            comma = st.endswith(',')
            o = json.loads(st[:-1] if comma else st)
            want = (sec == 'actions' and o['id'] in FAMILY_ACTIONS) or (sec == 'skills' and o['id'] in FAMILY_SKILLS)
            if want:
                v0 = o['value']; o['prevValueEN3'] = v0; o['value'] = up_tenth(v0); o['note'] = (o.get('note') + '; ' if o.get('note') else '') + NOTE
                changed.append((sec, o['id'], v0, o['value']))
            if sec == 'skills' and o['id'] == 'bulwark':
                v0 = o['value']; o['prevValueEN3'] = v0; o['value'] = 9; o['note'] = o['note'] + '; 2026-10-23 (package EN3, owner 19:27 #9: "Okay bulwark is a 9!, not 6.")'
                changed.append((sec, 'bulwark', v0, 9))
            if sec == 'skills' and o['id'] == 'spellward':
                ln = '  ' + json.dumps(o, ensure_ascii=False, separators=(',', ':')) + (',' if comma else '')
                out.append(ln)
                for n in NEW:
                    n = dict(n); n['value'] = prices[n['id']]
                    out.append('  ' + json.dumps(n, ensure_ascii=False, separators=(',', ':')) + ',')
                    changed.append((sec, n['id'], None, n['value']))
                continue
            ln = '  ' + json.dumps(o, ensure_ascii=False, separators=(',', ':')) + (',' if comma else '')
        out.append(ln)
    open(PATH, 'w', encoding='utf-8').write('\n'.join(out))
    json.load(open(PATH, encoding='utf-8'))
    for c in changed: print('%-8s %-12s %s -> %s' % c)
if __name__ == '__main__':
    a = dict(x.split('=') for x in sys.argv[1:])
    main({'rampart': float(a.get('rampart', 2)), 'brambleArmor': float(a.get('brambleArmor', 1.5))})
