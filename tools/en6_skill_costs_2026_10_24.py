#!/usr/bin/env python3
"""EN6 (2026-10-24, owner 03:17 + 12:02 #11 "03:17 - all"): prices in canonical/skill-costs.json, one entry per line as the file keeps them.
By the owner's 4-round rule (+1 Attack held 4 rounds = 2 stat points, +1 Health = 1) x the condition's uptime
(tools/en6_state_uptime_2026_10_24.js, docs/balance/en6-state-uptime-2026-10-24.json; bramblewood-budget.js EN6_UPTIME holds the same uptimes
for the braces form). No robust skill test was run for these (the owner: "just logic is sufficient").
Re-running sets the same values (no other entry is touched).
  python3 tools/en6_skill_costs_2026_10_24.py"""
import json, os, sys
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
PATH = os.path.join(ROOT, 'canonical', 'skill-costs.json')
U = 'docs/balance/en6-state-uptime-2026-10-24.json'
def st(id, dflt, pts, u, why):
    return {"id": id, "scale": "fixed", "value": round(pts * u, 2), "note": "2026-10-24 (package EN6, owner 03:17): %s; plain = {%s}: %s stat points x uptime %s = %s (bramblewood-budget.js EN6_UPTIME; %s). Its braces: %s x their S." % (why, dflt, pts, u, round(pts * u, 2), U, u)}
NEW = [
 st('plenty', '+1/+1', 3, 0.15, 'Plenty - {...} while you hold 4+ cards (the CPU holds 4+ at 0.2% of unit-rounds; a player holds cards back to keep it on: judged 0.15)'),
 st('scarcity', '+1/+0', 2, 0.79, 'Scarcity - {...} while you hold 1 card or none (measured 0.79: 0 cards 6%, 1 card 73%)'),
 st('foePlenty', '+0/+2', 2, 0.05, "Foe's Plenty - {...} while the opponent holds 4+ (the CPU 0.1%; a hoarding human opponent: judged 0.05, call EN6-3)"),
 st('foeScarcity', '+1/+0', 2, 0.77, "Foe's Scarcity - {...} while the opponent holds 1 or none (measured 0.77)"),
 st('heat', '+1/+0', 2, 0.6, 'Heat - {...} while the field is hot (all fights 0.21, its home maps 1.0: the midpoint 0.6)'),
 st('frost', '+0/+2', 2, 0.56, 'Frost - {...} while the field is cold (all fights 0.11, home 1.0: 0.56)'),
 st('rain', '+1/+1', 3, 0.05, 'Rain - {...} while it rains (Spring Rain or a Thunderstorm: all fights 0.017, home 0.08: 0.05; a Rainmaker card makes its own)'),
 st('storm', '+2/+0', 4, 0.45, 'Storm - {...} in a Thunderstorm or a strong-wind round (all 0.14, home 0.76: 0.45)'),
 {"id": "fog", "scale": "fixed", "value": 2.7, "note": "2026-10-24 (package EN6, owner 03:17): Fog - {...} in Thick Fog or the Mist; plain = {Evasive}: Evasive is a half-miss (x1.37 on the stat terms, 0 as a skill), about 0.37 x 14 stat points on a typical body = 5.2, x uptime 0.52 (all 0.04, home 1.0) = 2.7. Its braces: 0.52 x their S (an Evasive inside braces costs 0 there, as in every context skill)."},
 st('salt', 'Armor 1', 1.5, 0.25, 'Salt - {...} on a salt-water map (beach, reef) while the tide is out (all 0.04, home 0.45: 0.25)'),
 st('drought', '+1/+0', 2, 0.5, 'Drought - {...} after 3 rounds in a row without rain, on a dry map with weather (all 0.26, home 0.75: 0.5)'),
 st('season', '+1/+1', 3, 0.25, 'Season(X) - {...} in season X of the Seasons cycle (each season about 0.25 of a fight with the cycle on; no map runs it yet, call EN6-4)'),
 {"id": "fullHand", "scale": "n", "value": 3.0, "note": "2026-10-24 (package EN6, owner 03:17 #1): Full Hand N, +N Attack per card in your hand. The hand as combat starts averages 1.17 cards (measured); a player who builds for it holds about 1.5: 2 stat points x 1.5 = 3.0 a point. (\"Hoard\" names the Lumber skill already: call EN6-1.)"},
 {"id": "lean", "scale": "n", "value": 7.5, "note": "2026-10-24 (package EN6, owner 03:17 #1): Lean N, +N Attack per empty hand slot (the hand holds 5). The hand averages 3.83 empty slots as combat starts (measured): 2 x 3.8 = 7.6, a little less for a player who holds a card: 7.5 a point."},
 {"id": "foeFullHand", "scale": "n", "value": 2.4, "note": "2026-10-24 (package EN6, owner 03:17 #1): Foe's Full Hand N, +N Attack per card in the opponent's hand (the CPU averages 1.2: 2 x 1.2 = 2.4 a point)."},
 {"id": "foeLean", "scale": "n", "value": 7.5, "note": "2026-10-24 (package EN6, owner 03:17 #1): Foe's Lean N, +N Attack per empty slot in the opponent's hand (the CPU averages 3.8 empty: 2 x 3.8 = 7.6; 7.5 a point)."},
 {"id": "hibernate", "scale": "n", "value": 0.95, "payDefault": 2, "note": "2026-10-24 (package EN6, owner 03:17 #4): Hibernate N, asleep while the field is cold or at night on a cold map (uptime 0.47: all 0.08, home 0.86), healing N a round. The heal: N a sleeping round, about half of it needed (a sleeping unit is often whole), over 4 rounds x 0.47 = 0.95 N. The cost of sleeping is on the stats: its Attack counts x (1 - 0.47) (tools/skill_costs.js budget, bramblewood-budget.js EN6_HIBERNATE_UPTIME); Taunt and Guardian off while it sleeps are not priced."},
 {"id": "arrowBramble", "scale": "fixed", "value": 0, "note": "2026-10-24 (package EN6, owner 03:17 #2): Arrow - bramble aims the Arrow at the enemy bramble. Priced in tools/skill_costs.js as (bramble - 1) x the Arrow's own price (the modifier 'bramble', 0.9: a bramble point is worth about a unit point by the 4-round rule, never missed or blocked, but the blocker stays)."},
 {"id": "fireArrowBramble", "scale": "fixed", "value": 0, "note": "2026-10-24 (package EN6): Fire Arrow - bramble, priced like Arrow - bramble ((bramble - 1) x Fire Arrow's price)."},
 {"id": "fireBoltBramble", "scale": "fixed", "value": 0, "note": "2026-10-24 (package EN6): Fire Bolt - bramble, priced like Arrow - bramble ((bramble - 1) x Fire Bolt's price)."},
]
MOD = {"id": "bramble", "label": "Aimed at the bramble (– bramble)", "value": 0.9, "note": "2026-10-24 (package EN6, owner 03:17 #2): x the action value for Arrow, Missile and Deal damage (one opponent) with t.bramble; x the shot's price for Arrow / Fire Arrow / Fire Bolt - bramble. 4-round rule: a point of bramble damage is worth about a point at a unit (Breach 1.9 for about 3 landed hits = 0.63 a point; +1 Attack's 2 points buy about 3 damage at units = 0.67 a point); it is never dodged, blocked or wasted on overkill, but it leaves the blocker standing: 0.9."}
def main():
    lines = open(PATH, encoding='utf-8').read().split('\n')
    sec, out, done, mdone = None, [], False, False
    ids = {n['id'] for n in NEW}
    for ln in lines:
        st_ = ln.strip()
        if st_.startswith('"') and st_.endswith('['): sec = st_.split('"')[1]
        if sec == 'skills' and st_.startswith('{"id":'):
            comma = st_.endswith(','); e = json.loads(st_.rstrip(','))
            if e['id'] in ids and 'package EN6' in e.get('note', ''): continue
            out.append(ln)
            if e['id'] == 'lastStand':
                if not ln.rstrip().endswith(','): out[-1] = ln + ','
                for i, n in enumerate(NEW): out.append('  ' + json.dumps(n, ensure_ascii=False, separators=(',', ':')) + (',' if (i < len(NEW) - 1 or comma) else ''))
                done = True
            continue
        out.append(ln)
    if not done: sys.exit('lastStand entry not found')
    d = json.loads('\n'.join(out))
    d['modifiers'] = [m for m in d['modifiers'] if m['id'] != 'bramble'] + [MOD]; mdone = True
    # the file keeps one entry per line in the lists; rewrite the modifiers list in the same style
    txt = '\n'.join(out)
    a = txt.index('"modifiers"'); b = txt.index(']', a)
    body = ',\n'.join('  ' + json.dumps(m, ensure_ascii=False, separators=(',', ':')) for m in d['modifiers'])
    txt = txt[:a] + '"modifiers": [\n' + body + '\n ' + txt[b:]
    json.loads(txt)
    open(PATH, 'w', encoding='utf-8').write(txt)
    print('wrote', PATH, len(NEW), 'entries + the bramble modifier')
main()
