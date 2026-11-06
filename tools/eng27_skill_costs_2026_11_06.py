#!/usr/bin/env python3
"""2026-11-06 (package ENG27): skill prices in canonical/skill-costs.json, one line per entry kept as it is (only the touched lines change).
  - new skills (on no card unless named): unfortify (a drawback, negative), blitz / mach / antiAirOnly (the canon tool's measures, MEASURED
    below; theoretical until filled), doubleTime, encore, grantSkill, hype (the Hype card carries it), rageAt;
  - inspiring: Inspiration is +1 Attack a token (owner item 14), so its price halves (5.43 -> 2.72; theoretical, the canon anchor moves with it);
  - tide: owner ENG25-8 c ("c. (maybe use 0.5 for Tide 1)"): Tide 1 at 0.5 (was 1.5), Tide N = 0.5 x N^0.9 (the measured ratio, kept);
  - fortify: its note gains the Armor part (owner item 10).
    python3 tools/eng27_skill_costs_2026_11_06.py [--dry]   (idempotent)"""
import json, os, sys
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
P = os.path.join(ROOT, 'canonical', 'skill-costs.json')
# the canon tool's reads (tools/skill_canon_2026_10_31.js measure --skill X --games 200 --bramble 15 --save); None: not measured, priced by logic
_H = '2026-11-06 (ENG27): node tools/skill_canon_2026_10_31.js measure --skill %s --games 200 --bramble 15 --workers 2 --save (the canon\'s six vanilla carriers, stat yardstick 3A + H); docs/balance/skill-canon-eng27-%s-2026-11-06.json'
MEASURED = {'blitz': {'value': 1.44, 'ci': [0.87, 2.1], 'how': _H % ('blitz', 'blitz')},
            'mach': {'value': 5.74, 'ci': [4.21, 8.27], 'how': _H % ('mach', 'mach')},
            'antiAirOnly': {'value': -5.02, 'ci': [-7.32, -3.45], 'how': _H % ('antiAirOnly', 'antiAirOnly')}}
WHY = '2026-11-06 (package ENG27'
NEW = [
 {"id":"unfortify","scale":"fixed","value":-2.83,"theoretical":True,"ownerSet":False,"note":WHY + ", owner item 10: \"New Skill 'Unfortify - ()' -> Same but applies negative effects on your bramble instead. Like vulnerable N - takes more damage\"; a drawback, 4-round rule): bare Unfortify is Vulnerable 1 on your own bramble: every hit that reaches it deals 1 more, the mirror of Fortify's Armor / Thorns 1 on the bramble (2.83 a point, Fortify's own rule): -2.83. Per part: Vulnerable N -2.83 a point, -N Health -0.21 a point. The table prices the braces at this fixed value (tools/skill_costs.js reads no braces for it)."},
 {"id":"blitz","scale":"fixed","value":2.5,"theoretical":True,"ownerSet":False,"note":WHY + ", owner item 11: \"Blitz: Speed 10 - to all its actions\"): its swing and shots go first in the round. Priced by logic until measured: Quick (Speed 2 on the swing) is 2.23; Blitz is first for certain and moves the shots too: 2.5. The canon tool's measure replaces it (tools/eng27_skill_costs_2026_11_06.py MEASURED)."},
 {"id":"mach","scale":"fixed","value":0,"theoretical":True,"ownerSet":False,"note":WHY + ", owner item 11: \"Mach - (counts as Flying) 100% chance to miss for non-flying attacks and 50% chance to miss for flying attacks... Ranged attacks also become 50% chance to miss\"): a dodge, so priced as a stat-term multiplier like Flying (halfMiss); S 0 here, the measure sets it (MEASURED)."},
 {"id":"antiAirOnly","scale":"fixed","value":-2,"theoretical":True,"ownerSet":False,"note":WHY + ", owner item 11: \"Anti-air ...: Attacks only can hit flying/mach units, at 100% ... anti-air units can't deal nothing to ground units. Can they hit the bramble? ... they should!\"): a drawback: its swing does nothing to the ground units that fill most boards (Flyers are about 1 in 8), it still hits the bramble and never misses a flyer. Priced by logic until measured (MEASURED): -2."},
 {"id":"doubleTime","scale":"fixed","value":6.38,"theoretical":True,"ownerSet":False,"note":WHY + ", owner item 20: \"Double Time (passive: performs its actions twice)\"): its swing twice (Twin Strike's rule and price, 6.38) and its shots twice (a shooter's shots are priced on their own keys, so a shooter with Double Time is under-priced by its shots' S: flagged, on no card)."},
 {"id":"encore","scale":"fixed","value":3.19,"theoretical":True,"ownerSet":False,"note":WHY + ", owner item 20: \"Encore {conditions}: under the conditions, does the action again\"): one more swing a round while its braces hold after its swing: Twin Strike's 6.38 x the odds. Bare / Encore {Kill}: a swing kills about 1 in 2 (bramblewood-budget.js BLOOM_ODDS kill 0.5): 3.19. Other braces: 6.38 x BLOOM_ODDS (Night 0.8 = 5.1, Tide 0.35 = 2.23); the table holds the Kill price."},
 {"id":"grantSkill","scale":"fixed","value":3.35,"theoretical":True,"ownerSet":False,"note":WHY + ", owner item 22: \"a skill that gives another ally a skill - like Enhance/Grant {...} two (2) allies\"): on arrival N allies (2) gain the braces for the fight: N x the braces' S x 0.75 (an ally that is there and lives the 4 rounds). At Grant {Quick} 2: 2 x 2.23 x 0.75 = 3.35, the table's value whatever the braces hold."},
 {"id":"hype","scale":"n","value":2.25,"theoretical":True,"ownerSet":False,"note":WHY + ", owner item 22: \"Hype N: N allies take their action again, right after\"): on play the N strongest Ready allies act at once: one extra swing of a typical 3-Attack ally = 3 damage once, 3/4 of +1 Attack held 4 rounds, x attackWeight 3 = 2.25 a point. On the Crimson Wing Drumcaller (Hype 1)."},
 {"id":"rageAt","scale":"fixed","value":1.5,"theoretical":True,"ownerSet":False,"note":WHY + ", owner item 21: Rage {N%}, a braced Rage that rages below N% Health): on top of Rage's own price, the extra uptime: Rage (3.01) is priced at half; at the editor's default 75% about half again: 1.5 (the table's value for any N)."},
]
lines = open(P, encoding='utf-8').read().split('\n')
def ent(i): t = lines[i].rstrip(); c = t.endswith(','); return json.loads(t[:-1] if c else t), c
def put(i, e, c): lines[i] = '  ' + json.dumps(e, ensure_ascii=False, separators=(',', ':')) + (',' if c else '')
idx = {}
for i, l in enumerate(lines):
    if l.startswith('  {"id":"'):
        try: idx[ent(i)[0]['id']] = i
        except Exception: pass
log = []
# Inspiring 1 at +1 a token, as the canon tool read it from the other anchors (the ENG27 Blitz run, docs/balance/skill-canon-eng27-blitz-2026-11-06.json)
INSP = {'value': 3.8, 'ci': [2.89, 5.05], 'how': 'tools/skill_canon_2026_10_31.js measure --skill blitz --games 200 --bramble 15 (the anchor table: inspiring 1 from the others, by the stat yardstick, 3.80 [2.89, 5.05])'}
e, c = ent(idx['inspiring'])
if e['value'] != INSP['value']:
    e.setdefault('eng27Was', {'value': 5.43}); e['value'] = INSP['value']; e['measuredS'] = INSP['value']; e['eng27Measured'] = INSP
    e['eng27Note'] = WHY + ', owner item 14: "Inspiration only gives +1 attack, not 2"): a token is +1 Attack now; Inspiring 1 re-read at 3.8 (was 5.43 at +2), the canon anchor with it.'
    put(idx['inspiring'], e, c); log.append('inspiring -> %s' % e['value'])
e, c = ent(idx['tide'])
if not e.get('eng27Was'):
    e['eng27Was'] = {'value': e['value']}; e['value'] = 0.5
    e['eng27Note'] = WHY + ', owner ENG25-8 c: "c. (maybe use 0.5 for Tide 1)"): Tide 1 at 0.5 (the global measure 0.31 [0.22, 0.44], rounded up as the owner asked); Tide N = 0.5 x N^0.9 (Tide 2 0.93).'
    put(idx['tide'], e, c); log.append('tide 1.5 -> 0.5')
e, c = ent(idx['fortify'])
if 'Armor' not in e.get('eng27Note', ''):
    e['eng27Note'] = WHY + ', owner item 10: "Fortify - (Armor 1)"): + the Armor N part (the bramble takes N less a hit): 2.83 a point, as Thorns on the bramble (every unblocked swing reaches it).'
    put(idx['fortify'], e, c); log.append('fortify: Armor part noted')
for n in NEW:
    m = MEASURED.get(n['id'])
    if m: n = dict(n, value=m['value'], theoretical=False, measuredS=m['value'], measuredConf='medium', measuredCI=m['ci'], measuredHow=m['how'])  # 200 fights: medium
    if n['id'] in idx:
        old, c = ent(idx[n['id']])
        if old != n: put(idx[n['id']], n, c); log.append('updated ' + n['id'])
        continue
    i = idx['fortify']; lines.insert(i + 1, '  ' + json.dumps(n, ensure_ascii=False, separators=(',', ':')) + ','); idx = {k: (v + 1 if v > i else v) for k, v in idx.items()}; idx[n['id']] = i + 1
    log.append('added %s %s' % (n['id'], n['value']))
out = '\n'.join(lines); json.loads(out)
print('\n'.join(log) or 'nothing to do')
if '--dry' not in sys.argv: open(P, 'w', encoding='utf-8').write(out)
