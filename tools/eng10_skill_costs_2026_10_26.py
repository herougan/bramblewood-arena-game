#!/usr/bin/env python3
"""Skill prices of package ENG10 (2026-10-26) in canonical/skill-costs.json, by the owner's 4-round rule (docs/workflows/balance.md): the yardstick
is +1 Attack (2 points) or +1 Health (1 point) held over a typical 4-round life. Armor's curve is fitted to a measurement
(tools/eng10_armor_hits_2026_10_26.js, docs/balance/eng10-armor-hits-2026-10-26.json); the threshold skills use PROP1's measured uptimes
(bramblewood-budget.js THR_UPTIME prices them at their N; the values here are the default N's). Edits one line per skill in place.
    python3 tools/eng10_skill_costs_2026_10_26.py"""
import json, os, re
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
P = os.path.join(ROOT, 'canonical', 'skill-costs.json')
TAG = '2026-10-26 (package ENG10; 4-round rule)'
THR = 'priced at its N by bramblewood-budget.js thrS: the braces\' points (2A + H + their skills) x the share of unit-rounds the count is N or more (THR_UPTIME, docs/balance/prop1-threshold-uptime-2026-10-26.json)'
NEW_SKILLS = [
 {"id":"sunder","scale":"fixed","value":1.0,"note":TAG + ", PROP1-1: Sunder, On Hit: 50% to break one Hardy life of the target's equipment (a swing or a shot). The ten pieces are worth about 4 points after equipLifeMult; two landed hits break a 1-life piece 75% of the time, early: about 2.7 points against a carrier, x about 0.4 (most decks carry no equipment): 1.0 (docs/proposals-2026-10-26.md section 1)."},
 {"id":"dismantle","scale":"fixed","value":0.5,"note":TAG + ", PROP1-1: Dismantle, On Play: 50% to break one Hardy life of the facing enemy's piece, or of the nearest loose enemy piece. One roll a fight, only against equipment: about a third of Sunder, 0.5 (the proposal's price)."},
 {"id":"requiem","scale":"fixed","value":3.2,"note":TAG + ", PROP1-4: Requiem N - {...} while N or more units died this fight (both sides); plain N 5 {+2/+2}: 6 points x (0.43 measured + 0.1) = 3.2. " + THR + "."},
 {"id":"dirge","scale":"fixed","value":2.8,"note":TAG + ", PROP1-4: Dirge N - {...} while N or more of your units died this fight; plain N 3 {+2/+2}: 6 x (0.36 + 0.1) = 2.8. " + THR + "."},
 {"id":"carnage","scale":"fixed","value":2.4,"note":TAG + ", PROP1-4: Carnage N - {...} while N or more enemy units died this fight; plain N 3 {+2/+2}: 6 x 0.41 = 2.4 (only the enemy decides: no push). " + THR + "."},
 {"id":"muster","scale":"fixed","value":2.9,"note":TAG + ", PROP1-4: Muster N - {...} while your side has N or more units (this one included); plain N 6 {+2/+2}: 6 x (0.39 + 0.1) = 2.9. " + THR + "."},
 {"id":"beset","scale":"fixed","value":1.8,"note":TAG + ", PROP1-4: Beset N - {...} while the enemy has N or more units; plain N 6 {+2/+2}: 6 x 0.30 = 1.8. " + THR + "."},
 {"id":"throng","scale":"fixed","value":3.8,"note":TAG + ", PROP1-4: Throng N - {...} while the field holds N or more units (both sides); plain N 10 {+2/+2}: 6 x (0.54 + 0.1) = 3.8. " + THR + "."},
]
UPD = {
 'armor': {"value":1.68,"pow":1.43,"note":TAG + ", owner on ENG9-9 (10-26 11:19): \"Armor should be slightly exponential as 5 armor nullifies most damage - ~>10\", and on ENG9-6 (\"Armor stops arrows and spits too.\"). S(N) = 1.68 x N^1.43: Armor 1 1.68 (ENG9's 1.56 x 1.08, the arrows and spits it now stops: 8% of the landed hits), 2 4.52, 3 8.09, 4 12.2, 5 16.8 (10x Armor 1). Measured (tools/eng10_armor_hits_2026_10_26.js, 1,000 CPU fights, 51,450 landed non-magic hits on units, mean 2.4): Armor 1 / 2 / 3 / 4 / 5 cancels 27 / 63 / 82 / 94 / 97% of hits outright and takes 42 / 72 / 88 / 95 / 98% of the damage; the effective Health 1 / (1 - share) grows x1.7 / 3.6 / 8.0 / 20 / 42. The price sits between the damage share (x2.3 from Armor 1 to 5) and the effective Health (x24), on the owner's x10 (5^1.43 = 10). Arrows and spits now meet it too (8% of the landed hits). Was 1.56 a point.","prevValue":1.56},
 'charge': {"scale":"fixed","value":3,"note":TAG + ", owner on ENG9-4 (10-26 11:19): \"Charge is recharging, like reload.\" The clock winds back after the effect, so it repeats every N upkeeps: back to the price it had for the repeating clock, 3 (a Charge 2 of 3 damage goes off about twice in a 4-round life: 6 damage at 0.67 a point, x0.75 for the clock's start). ENG9 had made it a one-shot (1.2).","prevValue":1.2},
 'reload': {"value":-6,"note":TAG + ", owner on ENG9-4: \"Make reloads skill cost better, meaning more negative!\" Reload 1 sits out a round after each swing: it swings 2 of a 4-round life's 4 rounds, so it loses half its Attack's worth, A points (2 a point x half). The Reload cards average Attack 6 (Peak Condor 4, Riptide Eel 8): -6 (half scale), was -4 (the measured worth).","prevValue":-4},
 'fester': {"scale":"fixed","value":2.8,"label":"Gorge","note":TAG + ", PROP1-3 (owner 10-26 11:19: \"Fester okay\"): the skill (key fester) reads Gorge now: a hooked Parasite feeds a second time at round end, at half strength (ceil(A/2)), healing as much; no more swing bonus from its own Poison. 0.8 x Attack (the proposal: about A/2 sure damage + A/2 healing a round over a Parasite's 3 feeds, x0.8 for a host that dies first); fixed at a Parasite's typical Attack 3.5: 2.8. Was 0 (measured -0.04 as the old Poison bonus).","prevValue":0},
 'pulverise': {"value":2.1,"note":TAG + ", PROP1-1 (owner: \"Pulverise takes 1 Hardy for sure\"): + 0.5 for the sure break of a Hardy life (the proposal), 1.6 -> 2.1. CONTENT3's parts: Armor ignored 0.6, broken Armor 0.4, equipment 0.3, Structures 0.3.","prevValue":1.6},
}
def line_of(o): return '  ' + json.dumps(o, ensure_ascii=False, separators=(',', ':'))
src = open(P, encoding='utf-8').read()
d = json.loads(src); have = {s['id'] for s in d['skills']}
def patch_line(k, patch):
    global src
    m = re.search(r'^  \{"id":"%s",.*?\}(,?)$' % re.escape(k), src, re.M); assert m, k
    o = json.loads(m.group(0).strip().rstrip(',')); o.update(patch)
    src = src[:m.start()] + line_of(o) + m.group(1) + src[m.end():]
for k, patch in UPD.items(): patch_line(k, patch)
add = [o for o in NEW_SKILLS if o['id'] not in have]
if add:
    i = src.index('"skills": ['); j = src.index('\n', i) + 1
    src = src[:j] + ',\n'.join(line_of(o) for o in add) + ',\n' + src[j:]
json.loads(src)
open(P, 'w', encoding='utf-8').write(src)
print('ENG10 skill costs: %d new skills, %d updated' % (len(add), len(UPD)))
