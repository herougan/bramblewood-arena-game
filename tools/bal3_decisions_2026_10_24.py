#!/usr/bin/env python3
"""BAL3 (2026-10-24): the owner calls in docs/decisions.json (one item per line, at the top) and the build notes on the items BAL3 built
(BAL2-1, BAL2-2, BAL2-3, BAL2-5, DF3-3, DF3-4). Idempotent.   python3 tools/bal3_decisions_2026_10_24.py"""
import json, os
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
P = os.path.join(ROOT, 'docs', 'decisions.json')
def item(i, area, title, body, options=None, default=None):
    d = {"id": i, "status": "YET", "kind": "Decide", "area": area, "title": title, "asked": "2026-10-24", "body": body}
    if options: d["options"] = options
    if default: d["default"] = default
    return d
NEW = [
 item("BAL3-1", "Map effects", "Rising Tide can't fire on 5-A-2 and 10-A-2: no tide there",
  "DF3-3 built (Quick and +1 Attack while the tide is in). Re-measured, 200 games with the boon on and off (docs/balance/bal3-rising-tide-2026-10-24.json): 9-4 Kelp Curtains 3 points (81% vs 84%); 5-A-2 Gator Hollow and 10-A-2 The Drowned Deck 0, because neither fight has a tide in its field (the Sunken Grove's Swamp Fever, the Sunken Depths' Crushing Depths), so the boon never turns on. A what-if with the Tide added: 5-A-2 79.5% (94% without the boon: 14.5 points), 10-A-2 77.5% (81.5%: 4 points). Their challenge targets are about 65% and 70%.",
  ["Add the Tide to both fights", "Swap their boons (Venom Glands on 5-A-2, Blind Fury on 10-A-2)", "Leave them"], "Add the Tide to both fights"),
 item("BAL3-2", "Balance", "The fights deck moves can't reach (87 too easy, 12 too hard of 179)",
  "BAL3 retuned Maps 0-24 and the Pale Desert by the agreed rules only (deck moves inside each map's pool and theme, the copy ladder, 5-7 different cards, leaders kept, enemy level by the schedule, no new Shield): green 48 -> 80 of 179 (docs/balance/bal3-road-2026-10-24.json, -table-....md), the Pale Desert 0 -> 4 of 9. What is left is outside the levers: Gannet Cliffs (Map 3), Gatorback Swamp (5), the Redwood Deep (13), the Glass Dunes (18, every fight 100%), the Goldfeather Siege (23) and five Pale Desert fights stay at 90-100% because no card of their pool makes the deck harder; Sunken Hollow's 4-1 / 4-2 stay at about 20% (target 80-90) because the reference deck there walls on its turtles. The schedule's whole levels can't fine-tune a fight either (DF3-4's five fights were done by decks: 11-4 67 -> 76% green; 11-2 75, 11-7 57, 14-5 60, 14-6 52 still under).",
  ["Wait for your play-through (DF-1b)", "Let those fights take themed cards from one map ahead (outside the map's pool)", "Allow a Shield over the rule on those fights only"], "Wait for your play-through (DF-1b)"),
 item("BAL3-3", "Cards", "Alley Cat and Rock-pool Starfish are 1/1 on their formula line",
  "BAL2-5 built: the ten held cards took their formula line (tools/refit_pass_2026_10_21.js). Two land on 1/1 with a third of their budget unused, because their skills cost more than any bigger line of their shape allows: Alley Cat (Rare, Bleed 1 + Twin Strike, 1/8 -> 1/1, 67% of N) and Rock-pool Starfish (Common, Regen 2 + Tide, 2/2 -> 1/1, 66%). The others: Honey Badger Fury 1/6, Chipmunk Hoarder 2/6, Chipmunk Cavalry 2/2, Pyroclast Wyrm 3/12, Plague Gnat Cloud 2/2, Sunfeather Scout 1/4, Lone Grey Wolf 2/9, Muskrat Lodgekeeper 1/5.",
  ["Keep the formula lines (built)", "Trim a skill on those two so they fit a bigger line (Alley Cat without Twin Strike, the Starfish Regen 1)"], "Keep the formula lines (built)"),
]
BUILT = {
 "BAL2-1": "Built by BAL3 (2026-10-24): LEAD's 57 per-fight Enemy levels dropped; every road fight plays at the schedule (roadEnemyScheduleLevel); only the DF3 challenges keep their one level up (13-4, 16-3, 5-A-2). tests/bal3-2026-10-24.js.",
 "BAL2-2": "Built by BAL3 (2026-10-24): side maps follow the main road's rarity steps (roadRarityCap). Re-decked: 2-B-1 3 Mallard Marauders -> 3 Grey Seal Bulls (88.5%, target 90), 7-A-1 Swarm Matriarch -> Bombardier Beetle (98%), 7-A-2 Wolf Spider Mother -> Hawthorn Shieldbug (69.5%, challenge target 70). 8-A-3 counts as Map 16, so it keeps its Rares.",
 "BAL2-3": "Built by BAL3 (2026-10-24): tools/skirmish_pass.js curve --all --decks-only --keep-leaders --pool --distinct, two rounds, 130 decks moved; Maps 0-24 green 48 -> 80 of 179, the Pale Desert 0 -> 4 of 9 (100 games a fight, docs/balance/bal3-road-2026-10-24.json). Leftovers: BAL3-2.",
 "BAL2-5": "Built by BAL3 (2026-10-24): the ten held cards on their formula line (tools/refit_pass_2026_10_21.js), off the held and flagged lists. Two land on 1/1: BAL3-3.",
 "DF3-3": "Built by BAL3 (2026-10-24): Rising Tide is Quick and +1 Attack while the tide is in (engine, text, 12 packs). Re-measured: 9-4 3 points; 5-A-2 and 10-A-2 0 (no tide in their fields): BAL3-1.",
 "DF3-4": "Built by BAL3 (2026-10-24) by decks: the schedule is in whole levels (BAL2-1), so no fractional Enemy level. After the road retune: 11-4 67 -> 76% (green); 11-2 75%, 11-7 57%, 14-5 60%, 14-6 52% still under their bands (BAL3-2).",
}
src = open(P, encoding='utf-8').read()
d = json.loads(src)
lines = src.split('\n')
for k, note in BUILT.items():
    idx = [i for i, l in enumerate(lines) if l.startswith('    {"id": "%s",' % k)]
    assert len(idx) == 1, k
    l = lines[idx[0]]; comma = l.endswith(',')
    x = json.loads(l.strip().rstrip(','))
    x['built'] = True; x['buildNote'] = note
    lines[idx[0]] = '    ' + json.dumps({**x, 'group': x.get('group', 'game')}, ensure_ascii=False) + (',' if comma else '')
src = '\n'.join(lines)
if not any(x.get('id') == 'BAL3-1' for x in d['items']):
    a = '"items": [\n'
    assert src.count(a) == 1
    src = src.replace(a, a + ''.join('    ' + json.dumps({**x, 'group': x.get('group', 'game')}, ensure_ascii=False) + ',\n' for x in NEW))
json.loads(src)
open(P, 'w', encoding='utf-8').write(src)
print('decisions: BAL3-1 .. BAL3-%d, build notes on %d' % (len(NEW), len(BUILT)))
