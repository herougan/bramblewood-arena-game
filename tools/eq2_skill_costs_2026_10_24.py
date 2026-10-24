#!/usr/bin/env python3
"""EQ2 (2026-10-24): prices of the package's new skills in canonical/skill-costs.json, one entry per line as the file keeps them,
priced by the owner's 4-round rule (docs/workflows/balance.md: +1 Attack or +1 Health held over a typical 4-round life is the
yardstick; 1 Health = 1 point, 1 Attack = 2 points of 2A+H). No measurement was run for these (the robust skill test does not model
them yet); each note says how the number was reached.
  - Dive N: once a fight its swing goes to the weakest unit of the row it faces for N more. N damage once is N/4 of +N Attack held
    for 4 rounds = 0.5 N points; picking the weakest unit (often a kill a swing early) adds about 0.5; a Flyer is exposed (no 1-in-2
    dodge) for the rest of that round, about a quarter of one round's dodge, -0.25. About 0.75 a point: 'n' 0.75 (Dive 1 = 0.75,
    Dive 2 = 1.5).
  - Bolster N: N temporary Health every round, set afresh as each round's fight begins. A front-row unit is hit in about 3 of its 4
    rounds, so it soaks up to about 3N over a 4-round life, but only when the hits come; 2.5 a point ('n' 2.5, payDefault 2: plain
    Bolster = Bolster 2 = 5). Crepuscular - {+1/+0}{Bolster 2} (the owner's N21-7 example) costs 0.4 x (2 + 5) = 2.8 as a context skill.
  - Parasite: the unit's Attack becomes a sure flat hit each round on a host of its choice (no dodge, no Armor, no Guardian, no blocker
    in the way) and it can't be hit while it rides; but it blocks no lane, never hits the bramble, and drops off only when its host
    dies. The two sides about cancel; the choice of target and the safety are worth about 1: 'fixed' 1.
Re-running sets the same values (no other entry is touched).
  python3 tools/eq2_skill_costs_2026_10_24.py"""
import json, os
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
PATH = os.path.join(ROOT, 'canonical', 'skill-costs.json')
NEW = [
 {"id": "dive", "scale": "n", "value": 0.75, "note": "2026-10-24 (package EQ2, owner N21-5): Dive N, once a fight its swing dives on the weakest unit of the row it faces for Attack + N; a diving Flyer is exposed (no 1-in-2 dodge) for the rest of that round. 4-round logic (not measured): N once = 0.5 N points, the pick of the weakest unit about +0.5, the exposure about -0.25: 0.75 a point. Only a Flyer, a Tide unit or a Sprinter can take it (diveEligible)."},
 {"id": "bolster", "scale": "n", "value": 2.5, "payDefault": 2, "note": "2026-10-24 (package EQ2, owner N21-7): Bolster N, N temporary Health as each round's fight begins (spent first, gone at the next round's start). 4-round logic (not measured): a front-row unit is hit in about 3 rounds of 4, so it soaks up to about 3N, only when hit: 2.5 a point; plain Bolster = Bolster 2 = 5."},
 {"id": "parasite", "scale": "fixed", "value": 1, "note": "2026-10-24 (package EQ2, the owner's 10-21 Parasite note; call EQ2-4): may be played onto an enemy unit in reach; it feeds its Attack from its host each round (a flat hit, no dodge, Armor or Guardian), heals that much, can't be hit while it rides, drops onto your side when the host dies. 4-round logic (not measured): the sure hit on a chosen target and the safety against no lane blocked and no bramble damage: about 1."},
]
def main():
    lines = open(PATH, encoding='utf-8').read().split('\n')
    ids = {n['id'] for n in NEW}
    out, sec, anchor = [], None, None
    for ln in lines:
        st = ln.strip()
        if st.startswith('"skills": ['): sec = 'skills'
        elif st.startswith('"') and st.endswith('['): sec = st.split('"')[1]
        if sec == 'skills' and st.startswith('{"id":'):
            e = json.loads(st.rstrip(','))
            if e['id'] in ids: continue  # a re-run: put back below
            if e['id'] == 'lastStand': anchor = len(out)
        out.append(ln)
    assert anchor is not None, 'lastStand entry not found'
    for n in NEW: n.setdefault('measuredWhy', 'not measured: priced by the 4-round rule (owner 2026-10-23 20:44), see the note')
    ins = ['  ' + json.dumps(n, ensure_ascii=False, separators=(',', ':')) + ',' for n in NEW]
    out[anchor + 1:anchor + 1] = ins
    open(PATH, 'w', encoding='utf-8').write('\n'.join(out))
    json.load(open(PATH, encoding='utf-8'))
    print('skill-costs.json: ' + ', '.join(n['id'] for n in NEW))
main()
