#!/usr/bin/env python3
"""PREF (2026-10-25): the owner calls in docs/decisions.json (one item per line, at the top), idempotent.
  python3 tools/pref_decisions_2026_10_25.py"""
import json, os
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
P = os.path.join(ROOT, 'docs', 'decisions.json')
def item(i, area, title, body, options=None, default=None):
    d = {"id": i, "status": "YET", "kind": "Decide", "area": area, "title": title, "asked": "2026-10-25", "body": body}
    if options: d["options"] = options
    if default: d["default"] = default
    return d
NEW = [
 item("PREF-1", "Balance", "Reference-2's levels: 100 at Map 20 (as built) or your 105? And is Level 0 unlevelled or a Level 0 hatchling?",
  "REF-2 (your 22:36): \"all Level 0 at Map 0, +1 level to 5 random cards per map (105 at Map 20)\". Built as written: Map 0 unlevelled, then +5 levels a map, so Map 20 has 100 (5 x 20). 105 would need Map 0 to get its 5 too (or a sixth level somewhere). A level here is a Forge level gained over each copy's own starting level, so at Map 0 every card has its printed stats. In the game, Level 0 below a card's starting Level 1 means a hatchling at about 85% of its stats; read literally, Map 0 would play all 20 copies at 85% (every card in the deck starts at Level 1). Your Base cards stop at Lv 4, so the deck caps at 102 levels from Map 21. The levels are seeded per map (docs/balance/ref/ref2-owner-main-deck-2026-10-25.json, schedule).",
  ["100 at Map 20, unlevelled at Map 0 (as built)", "105: Map 0 gets its 5 levels too", "Level 0 = hatchling at Map 0"], "100 at Map 20, unlevelled at Map 0 (as built)"),
 item("PREF-2", "Balance", "A road fight played with the reference deck: free and unpaid, or the normal fight?",
  "P1's switch (Admin Mode: \"Play with the map's reference deck\") replaces your deck in any Conquest fight. Built: such a fight costs no Energy and pays nothing (no rank, cards, XP or progress, like a PRO fight), so testing the road with a deck you don't own never moves your save. The fight's top bar shows REF and the results say \"no rewards\". The alternative is to pay Energy and count the win like any other fight.",
  ["Free and unpaid (as built)", "Normal fight: Energy, rewards and progress"], "Free and unpaid (as built)"),
 item("PREF-3", "Balance", "Side maps that open late: should their PRO / BPRO fights level with the map they open on?",
  "P3 (docs/balance/pro-ease-2026-10-25.md): the easiest PRO fights are side maps' BPROs. A side map counts as the map it opens on (the Old Bramble = Map 17, Clovermead 12, the Sunken Grove 13, Smugglers' Grotto 7, the Pale Desert 19), so both references arrive levelled for that map, but its PRO decks are Level 1 under its own early rarity cap. 0-B-BPRO-1/2, 1-A-BPRO-1, 2-B-BPRO-1..4 and 5-A-BPRO-1..4 are won 84-100% by both references. Nothing was changed (\"PRO is not to change any existing skirmishes\"). Options: leave them, or give a side map's PRO fights the enemy level the road uses for the map it opens on (a PRO rule change, not a deck change), or re-run the optimizer for them at that map's level.",
  ["Leave them (as now)", "PRO level = the road's enemy level of the map it opens on", "Re-run the optimizer at that map's level"], "Leave them (as now)"),
]
src = open(P, encoding='utf-8').read()
d = json.loads(src)
if any(x.get('id') in {n['id'] for n in NEW} for x in d['items']):
    print('already applied'); raise SystemExit(0)
a = '"items": [\n'
assert src.count(a) == 1
src = src.replace(a, a + ''.join('    ' + json.dumps({**x, 'group': x.get('group', 'game')}, ensure_ascii=False) + ',\n' for x in NEW))
json.loads(src)
open(P, 'w', encoding='utf-8').write(src)
print('added', len(NEW))
