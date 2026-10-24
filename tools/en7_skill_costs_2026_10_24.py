#!/usr/bin/env python3
"""EN7 (2026-10-24, owner 13:12 #3 and #5): prices in canonical/skill-costs.json, one entry per line as the file keeps them, by the owner's
4-round rule (docs/workflows/balance.md: +1 Attack held 4 rounds = 2 stat points, so a point of damage dealt is 0.5; +1 Health = 1). Not
measured (the owner: "just logic is sufficient"). Re-running sets the same values (no other entry is touched).
  python3 tools/en7_skill_costs_2026_10_24.py"""
import json, os, sys
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
PATH = os.path.join(ROOT, 'canonical', 'skill-costs.json')
DIVE = {"id": "dive", "scale": "n", "value": 1.25, "pow": 0.5, "prevValueEN7": 0.75, "note": "2026-10-24 (package EN7, owner 13:12 #3: \"like pokemon, Flying x Dive it becomes unhittable for 1 turn, then strikes the 2nd, where it loses the 50% evade for that turn\"): Dive N in two turns: turn 1 aloft / under (can't be found or hit, no swing), turn 2 the strike on the weakest unit of its row for Attack + N, Exposed that round; once a fight. 4-round rule at a typical Attack 3, facing Attack 3: the lost swing (4 swings become 3) -1.5; a round out of reach (the swing at it whiffs; a Flyer dodged half of them already) +2; the pick of the weakest past Taunt +0.5; the exposure (no Flying dodge / Tide evade one round) -0.25; + N once = 0.5 N. So 0.75 + 0.5 N: 1.25, 1.75, 2.25 at N 1-3, fitted as 1.25 x N^0.5 (1.25, 1.77, 2.17). Was 0.75 a point (EQ2's one-swing dive). effects.diveUses N: (N - 1) x this more (tools/skill_costs.js).", "measuredWhy": "not measured: priced by the 4-round rule (owner)"}
def tip(id, base, st):
    return {"id": id, "scale": "fixed", "value": 0, "note": "2026-10-24 (package EN7, owner 13:12 #5): %s – %s, the shot also gives the unit's own %s N (at least 1) where it lands. Priced in tools/skill_costs.js as tip (0.9) x the price of %s at that N: the shot lands each round as a swing would, a little less often (Evasive, Reflect, the bramble when nothing faces it); nothing without the shot." % (base, st, st.capitalize(), st.capitalize())}
NEW = [tip('arrowPoison', 'Arrow', 'poison'), tip('arrowBleed', 'Arrow', 'bleed'), tip('fireArrowPoison', 'Fire Arrow', 'poison'), tip('fireArrowBleed', 'Fire Arrow', 'bleed'),
       tip('fireBoltPoison', 'Fire Bolt', 'poison'), tip('fireBoltBleed', 'Fire Bolt', 'bleed'),
       {"id": "diveUses", "scale": "fixed", "value": 0, "note": "2026-10-24 (package EN7): Dive's uses a fight (1 when absent; no card has it). Priced in tools/skill_costs.js as (N - 1) x Dive's own price."}]
EXTRA = "2026-10-24 (package EN7, owner 13:12 #5): a unit's Poison / Bleed (Rabid, Greater Poison) now ride on its %s too; a card with both pays %s x their price on top (bramblewood-budget.js EN7_EXTRA_HIT, tools/skill_costs.js cardS: one more landing early in a 4-round life of about 3 landed swings). This skill's own price is unchanged."
MOD = {"id": "tip", "label": "– poison / – bleed on a shot", "value": 0.9, "note": "2026-10-24 (package EN7, owner 13:12 #5): x the price of Poison / Bleed at the unit's own N (at least 1) for Arrow / Fire Arrow / Fire Bolt – poison / – bleed; x the Poison / Bleed action's value for Arrow, Missile and Deal damage (one opponent) with t.withPoison / t.withBleed, added to the action. A shot lands about as often as a swing, a little less (Evasive, Reflect, the bramble): 0.9."}
def main():
    lines = open(PATH, encoding='utf-8').read().split('\n')
    sec, out, done = None, [], False
    ids = {n['id'] for n in NEW}
    for ln in lines:
        s = ln.strip()
        if s.startswith('"') and s.endswith('['): sec = s.split('"')[1]
        if sec == 'skills' and s.startswith('{"id":'):
            comma = s.endswith(','); e = json.loads(s.rstrip(','))
            if e['id'] in ids: continue
            if e['id'] == 'dive': out.append('  ' + json.dumps(DIVE, ensure_ascii=False, separators=(',', ':')) + (',' if comma else '')); continue
            if e['id'] in ('pounce', 'ambush'):
                e['noteEN7'] = EXTRA % ('Pounce' if e['id'] == 'pounce' else 'Ambush strike', '0.33' if e['id'] == 'pounce' else '0.3')
                out.append('  ' + json.dumps(e, ensure_ascii=False, separators=(',', ':')) + (',' if comma else '')); continue
            out.append(ln)
            if e['id'] == 'fireBoltBramble':
                if not ln.rstrip().endswith(','): out[-1] = ln + ','
                for i, n in enumerate(NEW): out.append('  ' + json.dumps(n, ensure_ascii=False, separators=(',', ':')) + (',' if (i < len(NEW) - 1 or comma) else ''))
                done = True
            continue
        out.append(ln)
    if not done: sys.exit('fireBoltBramble entry not found')
    txt = '\n'.join(out); d = json.loads(txt)
    d['modifiers'] = [m for m in d['modifiers'] if m['id'] != 'tip'] + [MOD]
    a = txt.index('"modifiers"'); b = txt.index(']', a)
    body = ',\n'.join('  ' + json.dumps(m, ensure_ascii=False, separators=(',', ':')) for m in d['modifiers'])
    txt = txt[:a] + '"modifiers": [\n' + body + '\n ' + txt[b:]
    json.loads(txt)
    open(PATH, 'w', encoding='utf-8').write(txt)
    print('wrote', PATH, len(NEW), 'entries, Dive re-priced, Pounce / Ambush noted, the tip modifier')
main()
