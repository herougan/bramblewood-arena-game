#!/usr/bin/env python3
"""EN5 (2026-10-24, owner 02:59 / 03:12 notes): prices in canonical/skill-costs.json, one entry per line as the file keeps them.
  - Bleed and Poison (BP-1: "price it according to your simulation. Note that bigger numbers make them stronger"): measured at N 1-4 with
    tools/skill_test_robust.js --mono --multi, 3000 games a setup, the units priced at a trial 1 a point (--table) so the decks stay off the
    floor (EN4's Bleed 2 / Poison 2 readings of about 2 were pinned there: those decks lost 97% of their games). docs/balance/
    en5-bleed-poison-2026-10-24.md. The marginal (with companions) worth: Bleed 3.51 / 6.17 / 6.60 / 6.29, Poison 2.87 / 5.66 / 5.92 / 5.43
    at N 1 / 2 / 3 / 4. A power curve through N 1-3: S(N) = value x N^pow, Bleed 3.6 x N^0.6, Poison 3.0 x N^0.7 (was 2.6 x N for both).
    Bigger numbers cost more in all, but each point less (the measured curve flattens by N 3: a 4/11 enemy is dead before a big stack runs).
  - Hemorrhage N (owner EN4-1: N 0 by default): the doubling's 2 plus Bleed N's price ("plus": "bleed").
  - Breach N (owner 02:59 #6, "Worth maybe 1.9"): see BREACH below.
  - Canopy Cover: 0 as a skill; priced by bramblewood-budget.js canopyMultOf (Evasive's 1.37 x 0.4 uptime under the trees, on the stats).
  - Timbered / Bedrock / Forged / Last Stand (owner 03:12): the plain skill = its default braces x the state's uptime (bramblewood-budget.js
    EN5_UPTIME, the braces form uses the same through CONTEXT_MULT_BY): +0/+2 (2) x 0.25 = 0.5; Armor 1 (1.5) x 0.2 = 0.3; +1/+0 (2) x 0.5
    = 1.0; +1/+1 (3) x 0.2 = 0.6.
Re-running sets the same values (no other entry is touched).
  python3 tools/en5_skill_costs_2026_10_24.py"""
import json, os, sys
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
PATH = os.path.join(ROOT, 'canonical', 'skill-costs.json')
MEAS = 'docs/balance/en5-bleed-poison-2026-10-24.md'
BP = {
 'bleed': {'value': 3.6, 'pow': 0.6, 'meas': '3.51 / 6.17 / 6.60 / 6.29 (alone 3.74 / 6.67 / 7.38 / 7.06)'},
 'poison': {'value': 3.0, 'pow': 0.7, 'meas': '2.87 / 5.66 / 5.92 / 5.43 (alone 3.09 / 6.11 / 6.69 / 6.27)'},
}
# Breach: tools/skill_test_robust.js --mono (docs/balance/en5-breach-states-2026-10-24.md, 3000 games a setup) read Breach 1 1.82, Breach 2
# 3.76 (Puncture, the same rule: 1.86 / 3.73); the owner's estimate and the 4-round logic say 1.9; priced 'n' at 1.9 a point.
BREACH = 1.9
NEW = [
 {"id": "breach", "scale": "n", "value": BREACH, "note": "2026-10-24 (package EN5, owner 02:59 #6: \"does N damage to opposing bramble when it hits the enemy (onHit). Worth maybe 1.9.\"): every landed melee hit also deals N to the enemy bramble. 4-round logic: about 3 landed hits in a 4-round life, so about 3N bramble damage, against +1 Attack's about 3 damage a point on whatever it hits (2 stat points): 1.9-2 a point (the owner's 1.9). tools/skill_test_robust.js --mono (docs/balance/en5-breach-states-2026-10-24.md, 3000 games a setup, units at a trial price): Breach 1 worth 1.82, Breach 2 3.76; Puncture 1 / 2 1.86 / 3.73 (priced 0.7 / 1.4). Puncture (0.7, scale half) is the same rule under an older name: call EN5-1."},
 {"id": "canopyCover", "scale": "fixed", "value": 0, "note": "2026-10-24 (package EN5, owner FLY-1): a half-miss skill conditioned on the field: priced by bramblewood-budget.js canopyMultOf, 1 + (Evasive's 1.37 - 1) x CANOPY_UPTIME 0.4 on the stat terms (x1.148), not as a skill. 40 of 267 conquest fights (15%) are under the trees; a forest card is mostly played there (call EN5-3)."},
 {"id": "timbered", "scale": "fixed", "value": 0.5, "note": "2026-10-24 (package EN5, owner 03:12): Timbered - {...} while you hold 3+ Lumber; plain = {+0/+2}: 2 stat points x uptime 0.25 = 0.5 (bramblewood-budget.js EN5_UPTIME; docs/balance/en5-state-uptime-2026-10-24.json: the CPU holds 3+ Lumber 0.9% of unit-rounds, a player keeping 3 back from the 4th round most of them; tools/skill_test_robust.js --mono read 0.38 with the CPU's play). Its braces: 0.25 x their S (CONTEXT_MULT_BY.timberedGrant)."},
 {"id": "bedrock", "scale": "fixed", "value": 0.3, "note": "2026-10-24 (package EN5, owner 03:12): Bedrock - {...} while you hold 2+ Stone; plain = {Armor 1}: Armor 1 (1.5) x uptime 0.2 = 0.3 (Stone is scarce: 0.5% of unit-rounds even with 4 Stone makers in the deck). Its braces: 0.2 x their S."},
 {"id": "forged", "scale": "fixed", "value": 1.0, "note": "2026-10-24 (package EN5, owner 03:12): Forged - {...} while you hold 1+ Metal; plain = {+1/+0}: 2 stat points x uptime 0.5 = 1.0 (83% of unit-rounds with 4 Metal makers in the deck, nothing spends Metal; 0.9% without). Its braces: 0.5 x their S."},
 {"id": "lastStand", "scale": "fixed", "value": 0.6, "note": "2026-10-24 (package EN5, owner 03:12b: \"When your bramble health is low - {} is gained. By default, the unit gains +1/+1.\"): Last Stand - {...} while your bramble is at a third of its Health or less; plain = {+1/+1}: 3 stat points x uptime 0.2 = 0.6 (10% of unit-rounds measured, and the rounds it is on decide fights; tools/skill_test_robust.js --mono read plain Last Stand at 0.62: docs/balance/en5-breach-states-2026-10-24.md). Its braces: 0.2 x their S."},
]
def main():
    lines = open(PATH, encoding='utf-8').read().split('\n')
    sec, out, done = None, [], False
    ids = {n['id'] for n in NEW}
    for ln in lines:
        st = ln.strip()
        if st.startswith('"skills": ['): sec = 'skills'
        elif st.startswith('"') and st.endswith('['): sec = st.split('"')[1]
        if sec == 'skills' and st.startswith('{"id":'):
            comma = st.endswith(',')
            e = json.loads(st.rstrip(','))
            if e['id'] in ids and 'package EN5' in e.get('note', ''): continue  # a re-run: put back below
            if e['id'] in BP:
                b = BP[e['id']]
                if 'prevValueEN5' not in e: e['prevValueEN5'] = e['value']
                e['value'] = b['value']; e['pow'] = b['pow']
                e['note'] = ("2026-10-24 (package EN5, owner BP-1: \"price it according to your simulation. Note that bigger numbers make them stronger\"): "
                    "S(N) = %s x N^%s (a power curve through the measured worth at N 1-3; was %s x N). tools/skill_test_robust.js --mono --multi, 3000 games a setup, "
                    "units priced at a trial 1 a point: marginal worth at N 1 / 2 / 3 / 4 = %s (%s)." % (b['value'], b['pow'], e['prevValueEN5'], b['meas'], MEAS))
                e['measuredEN5'] = b['meas']
                ln = '  ' + json.dumps(e, ensure_ascii=False, separators=(',', ':')) + (',' if comma else '')
            if e['id'] == 'hemorrhage':
                e['plus'] = 'bleed'
                if 'EN5' not in e['note']: e['note'] += ' 2026-10-24 (package EN5, owner EN4-1: "It adds 0 bleed by default (N=0)"): Hemorrhage N adds N Bleed after the doubling; priced 2 + Bleed N ("plus": "bleed"); plain Hemorrhage stays 2.'
                ln = '  ' + json.dumps(e, ensure_ascii=False, separators=(',', ':')) + (',' if comma else '')
            out.append(ln)
            if e['id'] == 'shoreUp':
                if not ln.rstrip().endswith(','): out[-1] = ln + ','
                for i, n in enumerate(NEW):
                    out.append('  ' + json.dumps(n, ensure_ascii=False, separators=(',', ':')) + (',' if (i < len(NEW) - 1 or comma) else ''))
                done = True
            continue
        out.append(ln)
    if not done: sys.exit('shoreUp entry not found')
    txt = '\n'.join(out); json.loads(txt)
    open(PATH, 'w', encoding='utf-8').write(txt)
    print('wrote', PATH, '- bleed', BP['bleed'], 'poison', BP['poison'], 'breach', BREACH, 'and', len(NEW), 'new entries')
main()
