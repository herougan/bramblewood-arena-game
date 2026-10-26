#!/usr/bin/env python3
"""Skill prices of package CONTENT3 (2026-10-26) in canonical/skill-costs.json, by the owner's 4-round rule (docs/workflows/balance.md): the
yardstick is +1 Attack (2 points) or +1 Health (1 point) held over a typical 4-round life. Not measured. One skill a line, edited in place.
    python3 tools/content3_skill_costs_2026_10_26.py"""
import json, os, re
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
P = os.path.join(ROOT, 'canonical', 'skill-costs.json')
TAG = '2026-10-26 (package CONTENT3; 4-round rule, not measured)'
NEW_SKILLS = [
 {"id":"wakeful","scale":"fixed","value":0.5,"note":TAG + ", owner G5: Wakeful, it never falls Asleep (a Sleep hit, the Spore Cloud field). Sleep comes from a few Sleep cards and two Spore Cloud fights (7-5, 7-6): on those it saves about one lost swing in four over a 4-round life (+0.25 Attack, 0.5 points); elsewhere nothing. 0.5 fixed, priced at the fights it is for (the uptime elsewhere is near 0)."},
 {"id":"pulverise","scale":"fixed","value":1.6,"note":TAG + ", OWN-Q5 (owner 10-25 23:58): Pulverise: its swings ignore Armor, a landed swing breaks the target's Armor and Magic Armor and its equipment, double damage to a Structure. About 1 unit in 7 carries Armor (2 on average): +0.3 a swing, 4 swings = +0.3 Attack, 0.6; the broken Armor helps the next swings at it: 0.4; equipment on about 1 unit in 20, worth about 6 points: 0.3; Structures about 1 in 20, +100% of a typical 3 Attack: 0.3. 1.6 fixed. (PROP1-1's Hardy lives would add 0.5 for a sure break.)"},
 {"id":"socket","scale":"n","value":0,"note":TAG + ", owner H1 / E14: Socket N, N more gem sockets on each copy. A gem is a progression bonus outside the printed budget (docs/workflows/balance.md, H1), so the socket that holds it is too: 0. Very rare by placement, not by price (owner call CONTENT3-4)."},
 {"id":"tamperProof","scale":"fixed","value":0.1,"note":TAG + ", owner #21 / E15: Tamper-proof equipment can't be stolen. Only Disarm steals, on 2 cards: 0.1 fixed."},
]
UPD = {
 'detonate': {"scale":"n","value":0.3,"note":TAG + ", owner 17:53 / E18: Detonate N makes the target's Poison tick N times at once, each tick taking a counter off. The ticks would have come anyway (the same damage, the same counters), so it buys tempo: the damage lands now, before a Cure or the target's next swings, and only on a Poisoned target. About 0.3 a tick. (Was fixed -0.5, measured, for the old cash-in.)","prevValue":-0.5,"prevScale":"fixed"},
}
def line_of(o): return '  ' + json.dumps(o, ensure_ascii=False, separators=(',', ':'))
src = open(P, encoding='utf-8').read()
d = json.loads(src); have = {s['id'] for s in d['skills']}
def patch_line(k, patch):
    global src
    m = re.search(r'^  \{"id":"%s",.*?\}(,?)$' % re.escape(k), src, re.M); assert m, k
    o = json.loads(m.group(0).strip().rstrip(','))
    if o.get('note', '').startswith(TAG): return
    o.update(patch)
    src = src[:m.start()] + line_of(o) + m.group(1) + src[m.end():]
for k, patch in UPD.items(): patch_line(k, patch)
add = [o for o in NEW_SKILLS if o['id'] not in have]
if add:
    i = src.index('"skills": ['); j = src.index('\n', i) + 1
    src = src[:j] + ',\n'.join(line_of(o) for o in add) + ',\n' + src[j:]
json.loads(src)
open(P, 'w', encoding='utf-8').write(src)
print('CONTENT3 skill costs: %d new skills, %d updated' % (len(add), len(UPD)))
