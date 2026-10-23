#!/usr/bin/env python3
"""EN4 (2026-10-23, owner 22:23 #7 and 19:27 #4 option B): the three new skills' prices in canonical/skill-costs.json, one entry per line as
the file keeps them, after Bramble Armor. Priced by the owner's 4-round logic (docs/workflows/balance.md: "+1 Attack or +1 Health held over a
typical 4-round life"), checked with tools/skill_test_robust.js --mono --multi (docs/balance/en4-skill-test-2026-10-23.md).
Re-running replaces the three entries' values (no other entry is touched).
  python3 tools/en4_skill_costs_2026_10_23.py [hemorrhage=2] [greaterPoison=2.5] [shoreUp=2.2] [pulse=1.3]
Owner 23:45: "Venom maybe can just be called pulse ... pulse affects both bleeding and poison units alike! No need for Poison Tick" and
"Greater Poison tokens are not removed on every poison tick": the action Pulse (Poison and Bleed tick N times) joins the actions after
Poison Tick (kept, retired), Venom Pulse's shorthand (now called Pulse) is On Hit x Pulse, and Greater Poison is re-priced (1 a stack,
never wears off)."""
import json, os, sys
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
PATH = os.path.join(ROOT, 'canonical', 'skill-costs.json')
NEW = [
 {"id": "hemorrhage", "scale": "fixed", "note": "2026-10-23 (package EN4, owner 22:23 #7: \"or even 2x their bleed\"; name: call EN4-1): its landed swing doubles the Bleed the target already has, before its own Bleed. 4-round logic: on a target already Bleeding about half its hits, each doubling adds about the stack (1-3), so about +1 Bleed a hit over 4 rounds (Bleed 2.6 a stack): about 1.3-2.6, nothing with no Bleed around. tools/skill_test_robust.js (enabler Bleed 2) is censored at the floor (the enabler deck loses nearly every game), so the logic price stands: docs/balance/en4-skill-test-2026-10-23.md."},
 {"id": "greaterPoison", "scale": "half", "note": "2026-10-23 (package EN4, owner 22:23 #7; how it ticks: call EN4-2): its landed swing turns the target's Poison into Greater Poison (1 a stack each round, never wears off; owner 23:45) and adds N. 4-round logic beside Poison 2: Poison 2 alone ticks 2+3+4 = 9 in 4 rounds, with Greater Poison 1 the same unit's ticks are 3+5+7 = 15, about 6 more damage = 3 stat points if the target lives all 4 rounds, about 2 at a usual 2/3; alone (no Poison) 1+2+3 = 6, about 2. Priced 2.5. tools/skill_test_robust.js (enabler Poison 2) is censored at the floor (the enabler deck loses nearly every game), so the logic price stands: docs/balance/en4-skill-test-2026-10-23.md."},
 {"id": "shoreUp", "scale": "fixed", "note": "2026-10-23 (package EN4, owner 19:27 #4 option B, approved 22:23): when it is hit and lives, the allies beside it get Shield 1 each. 4-round logic: a front unit is hit about 2-3 times it survives, about 1.5 neighbours: 3-4.5 Shield in all, about half of it soaks before the fight ends: about 1.5-2 Health (EN3-7's estimate 1.3: On Attacked 1.9 x Shield 0.35 x 2). Measured with tools/skill_test_robust.js (docs/balance/en4-skill-test-2026-10-23.md): 2.68 alone, 2.26 with companions; priced 2.2."},
]
def main(prices):
    lines = open(PATH, encoding='utf-8').read().split('\n')
    ids = {n['id'] for n in NEW}
    lines = [l for l in lines if not any(l.strip().startswith('{"id":"%s"' % i) and 'package EN4' in l for i in ids)]
    out, sec, done = [], None, False
    for ln in lines:
        st = ln.strip()
        if st.startswith('"skills": ['): sec = 'skills'
        elif st.startswith('"modifiers": [') or st.startswith('"measured"') or st.startswith('"actions": ['): sec = None if not st.startswith('"skills"') else sec
        out.append(ln)
        if sec == 'skills' and st.startswith('{"id":"brambleArmor"'):
            if not st.endswith(','): out[-1] = ln + ','
            for i, n in enumerate(NEW):
                n = dict(n); n['value'] = prices[n['id']]
                out.append('  ' + json.dumps(n, ensure_ascii=False, separators=(',', ':')) + (',' if (i < len(NEW) - 1 or st.endswith(',')) else ''))
            done = True
    if not done: sys.exit('brambleArmor entry not found')
    # Pulse (owner 23:45): the action, and Venom Pulse's shorthand on it
    PULSE = {"id": "pulse", "label": "Pulse", "value": prices['pulse'], "per": "amount", "note": "2026-10-23 (package EN4, owner 23:45: \"pulse affects both bleeding and poison units alike! No need for Poison Tick\"): per tick of the target's whole Poison (and Greater Poison) and whole Bleed. 4-round logic: on a target Poisoned about half its hits (about 2.5 a tick) and Bleeding about a third (about 2), about 1.9 damage a pulse; On Hit 2.1 x 1.3 = 2.7 for Pulse 1 (Venom Pulse was 2.1, Poison only)."}
    out = [l for l in out if not (l.strip().startswith('{"id":"pulse"') and 'package EN4' in l)]
    j = next(k for k, l in enumerate(out) if l.strip().startswith('{"id":"poisonTick"'))
    out.insert(j + 1, '  ' + json.dumps(PULSE, ensure_ascii=False, separators=(',', ':')) + ',')
    old = '"venomPulse":{"trigger":"onHit","action":"poisonTick","note":"2026-10-19 (package SK1): Venom Pulse N = On Hit x Poison Tick x N"'
    new = '"venomPulse":{"trigger":"onHit","action":"pulse","note":"2026-10-19 (package SK1): Venom Pulse N = On Hit x Poison Tick x N; 2026-10-23 (package EN4, owner 23:45): called Pulse, On Hit x Pulse x N (Poison and Bleed)"'
    out = [l.replace(old, new) for l in out]
    open(PATH, 'w', encoding='utf-8').write('\n'.join(out))
    d = json.load(open(PATH, encoding='utf-8'))
    for n in NEW: print(n['id'], [x['value'] for x in d['skills'] if x['id'] == n['id']])
    print('pulse', [x['value'] for x in d['actions'] if x['id'] == 'pulse'], 'venomPulse ->', d['shorthands']['venomPulse']['action'])
if __name__ == '__main__':
    a = dict(x.split('=') for x in sys.argv[1:])
    main({"hemorrhage": float(a.get("hemorrhage", 2)), "greaterPoison": float(a.get("greaterPoison", 2.5)), "shoreUp": float(a.get("shoreUp", 2.2)), "pulse": float(a.get("pulse", 1.3))})
