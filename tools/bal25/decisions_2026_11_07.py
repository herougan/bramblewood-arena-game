#!/usr/bin/env python3
"""BAL25 (2026-11-07): the package's owner calls BAL25-1..3 in docs/decisions.json (one item per line, at the top; an item already there is
replaced), as tools/bal26/decisions_2026_11_07.py. Each body and its options stay under 100 words (owner 11-04 22:34).
    python3 tools/bal25/decisions_2026_11_07.py   (idempotent)"""
import json, os, re
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
P = os.path.join(ROOT, 'docs', 'decisions.json')
s = open(P, encoding='utf-8').read()
base = {"status": "YET", "kind": "Decide", "group": "game", "asked": "2026-11-07", "source": "BAL25"}
items = [
 dict({"id": "BAL25-1"}, **base, area="Balance", title="Advanced opponents for card power",
  body="Decks of only top-40% cards held the median card at 19%, not 50. Claude picked a mix: 5 top-40% cards (one or two strong cards) + 15 from "
       "every Maps 0-20 card. Median now 47 (docs/balance/bal25/adv-calibration-2026-11-07.json).",
  options=["a) Keep the mix.", "b) 20 top-40% cards (median 19).", "c) 20 cards from the top 75% (median 46.5)."], default="a"),
 dict({"id": "BAL25-2"}, **base, area="Balance", title="Which cards are Faction-Starter",
  body="Faction-Starter (balancing only: Level 0, one rank below Starter) now covers the 22 Starter-rarity faction cards with no obtain map. "
       "Three starting faction cards keep their rarity: Otter Guard and Fleetfoot (Uncommon), Tunnel Ant (Rare). Faction-Starters still read "
       "-14 for their budget on average.",
  options=["a) Keep the 22.", "b) Add the three.", "c) Make Faction-Starter weaker still in the fit."], default="a"),
 dict({"id": "BAL25-3"}, **base, area="Balance", title="Show \"for its budget\" on cards",
  body="Each card's power minus what its N predicts is now in the build (CARD_POWER.fb), not shown yet. N explains little of power "
       "(r2 0.10): Lumber 2 cards read -12, Lumber 3+ -18, Lumber 1 +7. Flagged, no card changed.",
  options=["a) A UI package shows \"For its budget +N\" beside Power (editor, Map cards window).", "b) It replaces Power.",
           "c) Look at the budget's Lumber term first."], default="a"),
]
lines = s.split('\n'); out = []
for ln in lines:
    m = re.match(r'\s*\{"id": "([^"]+)"', ln)
    if (m and m.group(1).startswith('BAL25-')) or re.search(r'"source": "BAL25"', ln): continue
    out.append(ln)
s = '\n'.join(out)
i = s.index('"items": [') + len('"items": [')
s = s[:i] + '\n' + '\n'.join('    ' + json.dumps(x, ensure_ascii=False) + ',' for x in items) + s[i:]
s = re.sub(r'"updated": "[^"]+"', '"updated": "2026-11-07"', s, count=1)
json.loads(s)
open(P, 'w', encoding='utf-8').write(s)
print('BAL25 decisions:', ', '.join(x['id'] for x in items))
