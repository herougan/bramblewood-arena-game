#!/usr/bin/env python3
"""ENG27 (2026-11-06, owner items of 20:28): the package's calls ENG27-1..10 in docs/decisions.json (one item per line, at the top; an item
already there is replaced). Claude's own calls are DONE, the owner's are YET. ENG27-6 reads the canon measures (docs/balance/skill-canon-eng27-*).
    python3 tools/eng27_decisions_2026_11_06.py   (idempotent)"""
import json, os, re, glob
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
P = os.path.join(ROOT, 'docs', 'decisions.json')
s = open(P, encoding='utf-8').read()
def canon(tag):
    f = sorted(glob.glob(os.path.join(ROOT, 'docs', 'balance', 'skill-canon-eng27-%s-*.json' % tag)))
    if not f: return 'not measured'
    w = json.load(open(f[-1], encoding='utf-8'))['test']['worthStat']; return '%.2f [%.2f, %.2f]' % (w['m'], w['lo'], w['hi'])
D = {"kind": "Decide", 'group': "game", "asked": "2026-11-06", "source": "ENG27"}
items = [
 dict(D, id="ENG27-1", status="DONE", area="Skills", title="Arrows at Speed 0: after the swings",
  body="Owner: arrows are Speed 0, \"slower than default\", and a plain swing is already 0. Built: inside Speed 0 an arrow goes after every swing (Slow's tie rule). Bolts are 1, Blitz 10, Quick 2 on the swing. A unit with an arrow and a bolt fires all its shots at 1.",
  options=["a) As built.", "b) Plain swings move to Speed 1 (arrows 0, bolts 2)."], default="a", answer="Claude's call: a)."),
 dict(D, id="ENG27-2", status="DONE", area="Skills", title="Unfortify: Vulnerable on the bramble",
  body="The unit status called Vulnerable is Shocked (x1.5). For the bramble, Vulnerable N is flat: each hit that reaches it deals N more. Unfortify's parts: Vulnerable N, -N Health; bare Unfortify is Vulnerable 1. Fortify gained Armor N. Priced: Armor 2.83 a point, Unfortify -2.83.",
  options=["a) As built.", "b) Bramble Vulnerable as x1.5 too."], default="a", answer="Claude's call: a)."),
 dict(D, id="ENG27-3", status="DONE", area="Skills", title="Mach and Anti-air: the edge cases",
  body="Built: Reach and a thrown Boomerang count as ranged (miss Mach 1 in 2). An Anti-air unit, when attacked, is a Flyer (1), not Mach. Its swing at a ground unit does nothing; through an empty column it hits the bramble. Webbed, Pinned, Bound, diving, High Canopy or Ashy: Mach dodges nothing.",
  options=["a) As built.", "b) Anti-air also dodges like Mach (level 2 when attacked)."], default="a", answer="Claude's call: a)."),
 dict(D, id="ENG27-4", status="DONE", area="Skills", title="Hype, Grant, Encore: how they pick",
  body="Hype N: on play, the N Ready allies with the most Attack act at once (arriving mid-combat: a Fast Forward turn). Grant {skill} N: the N nearest allies, for the fight; a granted On Play does not fire. Encore: once a round; braces are Kill or Bloom's field conditions (Night, Tide, Wind...).",
  options=["a) As built.", "b) Hype picks the adjacent allies instead."], default="a", answer="Claude's call: a)."),
 dict(D, id="ENG27-5", status="YET", area="Brambles", title="Item 24: +3 first unit reads +1?",
  body="Not reproduced. Every bramble ability is flat (castleLeveled adds only Health; ENG24-1). Plains Terrace gives +3 in the engine, on 0-4 at Lv 0, in its texts and on the live main build. +1 was the value before ENG24 (11-04). Where did you see +1 (which screen, map, bramble)? A cached old page would show it.",
  options=["a) Tell me where; I fix it.", "b) It was an old cached page; nothing to do."], default="a"),
 dict(D, id="ENG27-6", status="DONE", area="Budget", title="Blitz, Mach, Anti-air priced by the canon tool",
  body="Canon tool, bramble 15, 200 fights, stat yardstick: Blitz %s, Mach %s, Anti-air %s. Set in skill-costs.json (Mach as S, Flying-like). Inspiring 1 re-measured at +1 a token: 3.8 (was 5.43 at +2). On no card but Inspiring's." % (canon('blitz'), canon('mach'), canon('antiAirOnly')),
  options=["a) Use the measures.", "b) Logic prices."], default="a", answer="Claude's call: a) (brief: price with the canon tool)."),
 dict(D, id="ENG27-7", status="YET", area="Budget", title="Inspiring cards after +1 a token",
  body="Inspiration is +1 Attack a token now. Inspiring 1's price 5.43 -> 3.8 (measured). Cricket Drummer, Meerkat Wayfarer, Otter Flag-Bearer and the other Inspiring cards get budget back; no stats changed.",
  options=["a) Re-fit them in the next balance package.", "b) Leave them under budget."], default="a"),
 dict(D, id="ENG27-8", status="YET", area="Budget", title="Bare Crepuscular's price",
  body="Built: a bare Crepuscular is +1/+0 by day, +0/+1 at night (your ENG23-1). The budget still prices the bare flag at +0/+1 at night: its line is in bramblewood-budget.js (crepPartsOf), outside this package. No card carries a bare Crepuscular, so nothing moves today.",
  options=["a) Change that budget line next package.", "b) Leave it."], default="a"),
 dict(D, id="ENG27-9", status="YET", area="Cards", title="Where the Crimson Wing Drumcaller is earned",
  body="The Hype card: Crimson Wing Drumcaller, Sunfeather hummingbird, Uncommon, 1 Lumber, Wait 1, 3/6, Flying + Hype 1, 96% of budget. In no pack, on no map; art prompt written (docs/art-style-prompts.md).",
  options=["a) A Sunfeather (hummingbird) faction pack.", "b) A skirmish reward on a hummingbird map.", "c) Keep it out until the art lands."], default="c"),
 dict(D, id="ENG27-10", status="YET", area="Brambles", title="Where the two new brambles are earned",
  body="Whetstone Rise (every unit you play +1 Attack) and Mossbed Hollow (+3 Health), 22 Health, Rare, open to everyone, on no road fight, as Banner Knoll.",
  options=["a) Boss unlocks on two maps you name.", "b) Keep them open to everyone."], default="b"),
]
items = [dict([('id', x['id']), ('status', x['status'])] + [(k, v) for k, v in x.items() if k not in ('id', 'status')]) for x in items]  # id first, as the file's other items
for x in items:
    w = len((x['body'] + ' ' + ' '.join(x['options'])).split()); assert w < 100, (x['id'], w)
lines = [ln for ln in s.split('\n') if '"id": "ENG27-' not in ln]
s = '\n'.join(lines)
i = s.index('"items": [') + len('"items": [')
s = s[:i] + '\n' + '\n'.join('    ' + json.dumps(x, ensure_ascii=False) + ',' for x in items) + s[i:]
s = re.sub(r'"updated": "[^"]+"', '"updated": "2026-11-06"', s, count=1)
json.loads(s)
open(P, 'w', encoding='utf-8').write(s)
print('ok: ENG27-1..10')
