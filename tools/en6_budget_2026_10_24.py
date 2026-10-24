#!/usr/bin/env python3
"""EN6 (2026-10-24): the budget's side of the new skills (bramblewood-budget.js, tools/skill_costs.js), applied once.
  - the state skills' braces are context skills at their uptime (EN6_UPTIME, docs/balance/en6-state-uptime-2026-10-24.json);
  - the braces and the "– bramble" toggles are parameters (they never count as skills);
  - "– bramble" costs BRAMBLE_MULT (0.9, the table's modifier 'bramble') x the shot or action it aims;
  - Hibernate: the card's Attack counts only for the rounds it is awake (x (1 - EN6_HIBERNATE_UPTIME)).
  python3 tools/en6_budget_2026_10_24.py"""
import os, sys
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')

def patch(path, pairs):
    s = open(path, encoding='utf-8').read()
    if 'EN6' in s and 'EN6_UPTIME' in s: sys.exit(path + ': already applied')
    for old, new in pairs:
        assert s.count(old) == 1, (path, s.count(old), old[:80])
        s = s.replace(old, new)
    open(path, 'w', encoding='utf-8').write(s)

GR = ['plentyGrant', 'scarcityGrant', 'foePlentyGrant', 'foeScarcityGrant', 'heatGrant', 'frostGrant', 'rainGrant', 'stormGrant', 'fogGrant', 'saltGrant', 'droughtGrant', 'seasonGrant']
BR = ['arrowBramble', 'fireArrowBramble', 'fireBoltBramble']
B = os.path.join(ROOT, 'bramblewood-budget.js')
patch(B, [
 ("'timberedGrant', 'bedrockGrant', 'forgedGrant', 'lastStandGrant' /* 2026-10-24 (EN5): the state skills' braces */];",
  "'timberedGrant', 'bedrockGrant', 'forgedGrant', 'lastStandGrant' /* 2026-10-24 (EN5): the state skills' braces */, " + ', '.join("'%s'" % k for k in GR + BR) + " /* 2026-10-24 (EN6): the state skills' braces and the – bramble toggles */];"),
 ("  timberedGrant: v=> [obj(v)], bedrockGrant: v=> [obj(v)], forgedGrant: v=> [obj(v)], lastStandGrant: v=> [obj(v)]\n};",
  "  timberedGrant: v=> [obj(v)], bedrockGrant: v=> [obj(v)], forgedGrant: v=> [obj(v)], lastStandGrant: v=> [obj(v)],\n"
  "  // EN6 (2026-10-24): the hand, heat / frost, weather and season state skills, the same way (their uptime: EN6_UPTIME)\n  "
  + ', '.join('%s: v=> [obj(v)]' % k for k in GR) + "\n};"),
 ("const CONTEXT_MULT_BY = Object.assign({liegeGrant: 0.3, rageGrant: 0.4, bloomCopy: 1 /* BL (2026-10-23): the odds are already in its braces */}, EN5_UPTIME);",
  "// EN6 (2026-10-24, owner 03:17 + 12:02 #11; priced by the 4-round rule x the state's uptime, call EN6-2): tools/en6_state_uptime_2026_10_24.js\n"
  "// (docs/balance/en6-state-uptime-2026-10-24.json; 1500 CPU fights of random live decks for the hand, every conquest fight's rules x 6 fights for\n"
  "// the field). The hand at the moment combat starts: 0 cards 6%, 1 card 73%, 2 cards 20%, 3+ 1.5% (the CPU plays a card a turn and draws one),\n"
  "// so Scarcity (1 or fewer) holds 0.79, Foe's Scarcity 0.77, Plenty (4+) 0.2% and Foe's Plenty 0.1%: Plenty is judged at 0.15 (a player who\n"
  "// holds cards back to keep it on), Foe's Plenty 0.05 (a human opponent who hoards). The field: over all 263 fights / over the fights where\n"
  "// the state ever holds ('home'): Heat 0.21 / 1.0, Frost 0.11 / 1.0, Rain 0.017 / 0.08, Storm 0.14 / 0.76, Fog 0.04 / 1.0, Salt 0.04 / 0.45,\n"
  "// Drought 0.26 / 0.75; a card made for those maps plays about half its fights there, so the price takes the midpoint of the two. Season:\n"
  "// each season about 0.25 of a fight with the Seasons cycle on (3 rounds a season); no map runs the cycle yet (call EN6-4).\n"
  "const EN6_UPTIME = {plentyGrant: 0.15, scarcityGrant: 0.79, foePlentyGrant: 0.05, foeScarcityGrant: 0.77, heatGrant: 0.6, frostGrant: 0.56, rainGrant: 0.05, stormGrant: 0.45, fogGrant: 0.52, saltGrant: 0.25, droughtGrant: 0.5, seasonGrant: 0.25};\n"
  "// Hibernate (EN6): asleep while the field is cold, or at night on a cold map: 0.08 of all fights' unit-rounds, 0.86 on its home maps; the\n"
  "// midpoint, 0.47, is the share of rounds its Attack does nothing (skill_costs.js budget: A x (1 - this)).\n"
  "const EN6_HIBERNATE_UPTIME = 0.47;\n"
  "// – bramble (EN6, owner 03:17 #2: \"Actions: Some actions like arrow - can have a subtoggle - bramble\"): the same shot at the enemy bramble. By the\n"
  "// 4-round rule a point of bramble damage is worth about what a point at a unit is (Breach: 1.9 for about 3 landed hits, 0.63 a point; +1\n"
  "// Attack's 2 points buy about 3 damage at units, 0.67 a point); it never misses or meets a shield, but it leaves the blocker standing: x 0.9.\n"
  "const EN6_BRAMBLE_SHOTS = {arrowBramble: 'arrow', fireArrowBramble: 'fireArrow', fireBoltBramble: 'fireBolt'}, EN6_BRAMBLE_ACTIONS = ['arrow', 'missile', 'damage'], EN6_BRAMBLE_MULT = 0.9;\n"
  "const CONTEXT_MULT_BY = Object.assign({liegeGrant: 0.3, rageGrant: 0.4, bloomCopy: 1 /* BL (2026-10-23): the odds are already in its braces */}, EN5_UPTIME, EN6_UPTIME);"),
 ("lastStand: 'lastStandGrant' /* EN5 (2026-10-24): the plain ones are priced in skill-costs.json */};",
  "lastStand: 'lastStandGrant' /* EN5 (2026-10-24): the plain ones are priced in skill-costs.json */, "
  + ', '.join("%s: '%s'" % (k[:-5], k) for k in GR) + " /* EN6 (2026-10-24) */};"),
 ("CONTEXT_MULT, CONTEXT_MULT_BY /* EN (2026-10-23) */,",
  "CONTEXT_MULT, CONTEXT_MULT_BY /* EN (2026-10-23) */, EN6_UPTIME, EN6_HIBERNATE_UPTIME, EN6_BRAMBLE_SHOTS, EN6_BRAMBLE_ACTIONS, EN6_BRAMBLE_MULT /* EN6 (2026-10-24) */,"),
])

S = os.path.join(ROOT, 'tools', 'skill_costs.js')
patch(S, [
 ("      if(t.sub === 'all') v *= mod('subAll', 2);\n      return {value:v, missing:null};",
  "      if(t.sub === 'all') v *= mod('subAll', 2);\n"
  "      // EN6 (2026-10-24): – bramble on Arrow, Missile and Deal damage (one opponent): x the table's 'bramble' modifier (bramblewood-budget.js EN6_BRAMBLE_MULT)\n"
  "      if(t.bramble && (BB.EN6_BRAMBLE_ACTIONS || []).includes(id) && t.sub !== 'all') v *= mod('bramble', BB.EN6_BRAMBLE_MULT || 0.9);\n"
  "      return {value:v, missing:null};"),
 ("        let c = skillCost(k, v); if(c == null){",
  "        // EN6 (2026-10-24): Arrow / Fire Arrow / Fire Bolt – bramble: (bramble - 1) x the shot's own price (nothing without the shot)\n"
  "        if(BB.EN6_BRAMBLE_SHOTS && BB.EN6_BRAMBLE_SHOTS[k]){ const base = BB.EN6_BRAMBLE_SHOTS[k], sc = v && effects[base] ? (skillCost(base, effects[base]) || 0) : 0, c = r2((mod('bramble', BB.EN6_BRAMBLE_MULT || 0.9) - 1) * sc); S += c; parts.push(['skill', k, c, 'x' + mod('bramble', 0.9) + ' of ' + base]); return; }\n"
  "        let c = skillCost(k, v); if(c == null){"),
 ("      const A = (e.archer && !(Number(e.archer) < 0)) ? 0 : (d.attack || 0),",
  "      // EN6 (2026-10-24): a Hibernate unit's Attack counts only for the rounds it is awake (bramblewood-budget.js EN6_HIBERNATE_UPTIME)\n"
  "      const A = (e.archer && !(Number(e.archer) < 0)) ? 0 : (d.attack || 0) * (e.hibernate && BB.EN6_HIBERNATE_UPTIME ? 1 - BB.EN6_HIBERNATE_UPTIME : 1),"),
])
print('budget + skill_costs: EN6 applied')
