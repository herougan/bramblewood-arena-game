#!/usr/bin/env python3
"""Skill prices of package EN8 (2026-10-24) in canonical/skill-costs.json, by the owner's 4-round rule (docs/workflows/balance.md): the yardstick is
+1 Attack (2 points) or +1 Health (1 point) held over a typical 4-round life. A Lumber is priced at Milling's rate (Milling 1 = 1 Lumber a Ready turn
= 3 points: about 0.75 a Lumber), Stone at about 1 (few cards spend it yet), Metal at about 1.2, a Pearl at 0.9 (it pays Lumber or Stone).
Edits one line per skill in place (the file keeps one skill a line).   python3 tools/en8_skill_costs_2026_10_24.py"""
import json, os, re
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
P = os.path.join(ROOT, 'canonical', 'skill-costs.json')
TAG = '2026-10-24 (package EN8, owner 22:28 #2, LUM-1; 4-round rule, not measured)'
NEW = [
 {"id":"stonecutter","scale":"n","value":1.8,"note":TAG + ": Stonecutter N, every 2nd Ready turn +N Stone. Over 4 rounds about 2 payouts, less its Wait (x0.9), at about 1 a Stone: 1.8 a point. Heavy Metal adds 1 a payout."},
 {"id":"prospector","scale":"n","value":1.2,"note":TAG + ": Prospector N, On Kill +N Metal. A fighting unit makes about 1 kill in its 4 rounds; Metal about 1.2 a point (few cards spend it): 1.2 a point."},
 {"id":"felling","scale":"n","value":0.8,"note":TAG + ": Felling N, On Kill +N Lumber. About 1 kill in 4 rounds x 0.75 a Lumber, a little more for the early Lumber: 0.8 a point."},
 {"id":"pearlBed","scale":"n","value":0.9,"note":TAG + ": Pearl Bed N, On Ready +N Pearl, once. A Pearl pays 1 Lumber or 1 Stone (the better of 0.75 / 1, used when short): 0.9 a point."},
 {"id":"coppice","scale":"n","value":1.1,"note":TAG + ": Coppice N, +N Lumber at a round's start after a round it took no damage (from its 2nd round). A wall in the line is hit about half its rounds: about 1.5 payouts in 4 rounds x 0.75: 1.1 a point."},
 {"id":"driftwood","scale":"n","value":0.75,"note":TAG + ": Driftwood N, +N Lumber at each Ebb round's start on a beach map. Home (beach) about 2 Ebb rounds in 4 = 1.5 points; elsewhere 0; a beach card plays about half its fights there (the EN6 midpoint): 0.75 a point."},
 {"id":"magicArmor","scale":"n","value":0.4,"note":TAG + ", P24-16: Magic Armor N, N off each magic or elemental hit (swings, shots, skills; not status ticks). Armor is 1.5 a point for every swing; magic and elemental hits are about a quarter of the hits a unit takes: 0.4 a point."},
]
UPD = {
 'scavenge': {"scale":"n","value":1.5,"note":TAG + ": Scavenge N is now LUM-1's plain rule: when another of your units dies, +N Lumber (was SK2's Scavenge N, M points). About 2 of your units die in a unit's 4 rounds x 0.75: 1.5 a point. Was 0.75 (SK2 estimate).","measuredS":1.5,"measuredConf":"low","measuredHow":"estimate EN8 (4-round rule)"},
 'salvage': {"scale":"n","value":0.75,"note":TAG + ": Salvage N is now LUM-1's plain rule: when another of your Structures dies, +2N Lumber (was SK2's Salvage N, M points -> Stone). About 0.5 of your Structures die in its 4 rounds x 2 Lumber x 0.75: 0.75 a point.","measuredS":0.75,"measuredConf":"low","measuredHow":"estimate EN8 (4-round rule)"},
 'render': {"scale":"n","value":0.8,"note":"2026-10-25 (package EN8, owner 00:02 #2; 4-round rule, not measured): Render N now puts N Daunt counters on the enemy facing it (-1 Attack and -1 skill damage each), one falling off each round and one each time it acts: about N + (N-2) + ... attack-rounds taken (N 2: 2, N 3: 4), about 0.67 a point of damage prevented, so 0.8 a point. Was half-scale 2 (measured 3.56) for N Attack lost for good.","measuredS":0.8,"measuredConf":"low","measuredHow":"estimate EN8 (4-round rule)","prevValue":2},
 'rampart': {"value":0.25,"note":"2026-10-23 (package EN3, owner 19:27 #3; name: call EN3-4): takes ceil(half) of each unit-dealt hit on its own bramble, the bramble the rest; measured 0.44 (tools/skill_test_robust.js, docs/balance/en3-skill-test-2026-10-23.md). " + TAG.replace('owner 22:28 #2, LUM-1', 'owner 21:41 #5') + ": it covers only hits from its own column and the one on either side, about half of the hits that reach a bramble (the column it stands in is mostly blocked by it): 0.5 -> 0.25."},
}
def line_of(o): return '  ' + json.dumps(o, ensure_ascii=False, separators=(',', ':'))
src = open(P, encoding='utf-8').read()
d = json.loads(src); have = {s['id'] for s in d['skills']}
for k, patch in UPD.items():
    m = re.search(r'^  \{"id":"%s",.*?\}(,?)$' % re.escape(k), src, re.M); assert m, k
    o = json.loads(m.group(0).strip().rstrip(',')); o.update(patch)
    src = src[:m.start()] + line_of(o) + m.group(1) + src[m.end():]
add = [o for o in NEW if o['id'] not in have]
if add:
    i = src.index('"skills": ['); j = src.index('\n', i) + 1
    src = src[:j] + ',\n'.join(line_of(o) for o in add) + ',\n' + src[j:]
json.loads(src)
open(P, 'w', encoding='utf-8').write(src)
print('EN8 skill costs: %d new, %d updated' % (len(add), len(UPD)))
