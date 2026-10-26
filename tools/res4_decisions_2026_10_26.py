#!/usr/bin/env python3
"""RES4 (2026-10-26): the new owner calls in docs/decisions.json (one item per line, at the top), idempotent.
  python3 tools/res4_decisions_2026_10_26.py"""
import json, os
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
P = os.path.join(ROOT, 'docs', 'decisions.json')
def item(i, area, title, body, options=None, default=None, kind="Decide"):
    d = {"id": i, "status": "YET", "kind": kind, "area": area, "title": title, "asked": "2026-10-26", "body": body}
    if options: d["options"] = options
    if default: d["default"] = default
    return d
NEW = [
 item("RES4-1", "Economy", "The monthly pass's name and its points: Trail Mix Trek, with Stickers",
  "PROP1-2 (your 11:19: \"Moon Trail (?) hmm i want something more trail mix-y and camper vanny\"). Three names, each with points you collect on a road trip: "
  "(1) Trail Mix Trek, points Stickers 🏷️ (one slapped on the van's side at every stop); (2) The Camper Road, points Miles 🛣️; (3) Snack Stop Trail, points Postcards 📮. "
  "Built with (1): a camper van drives a road of 30 stops on its own page (from Home's note and the map's 🚐), the month's title reads \"Trail Trekker of <month>\". "
  "Everything else is the proposal as approved: Stickers from notices (D-B 10, A 20, S 40-100), the day's tiers, the first win a day (10), weekly tiers (100/60/40) and three Trail challenges a week (50 each); 30 tiers at 150; reset on the 1st with reached tiers paid; the premium lane locked with no price. The names are one TX key each (ui.res4-trail-name, ui.res4-stickers).",
  ["Trail Mix Trek / Stickers (as built)", "The Camper Road / Miles", "Snack Stop Trail / Postcards", "Another (say it)"], "Trail Mix Trek / Stickers (as built)"),
 item("RES4-2", "UI", "Forge tabs spread over Maps 11-34",
  "RES3-3 (your 11:19: \"your decision for forge tabs, spread from Map 0 to 40\"). Nothing can open before Map 11, because the Forge itself opens there (B7: no Forge before Map 11). Chosen by when each tab becomes useful (RES3_FORGE_TAB_MAP): "
  "Upgrade 11 (with the Forge); Upgrades 13 (the Iron Forge, the first tier, is for sale from Map 13); Fuse 14 (Pack 3 and the map-end packs start piling up spare copies); Raid 15 (two maps after the Raid Banner, with trophy shards in hand); Blacksmith 18 (bosses since Map 11 have paid its Materia); Finish 24 (foils are 1-2% of cards); Reinforce 28 (Maps 21-40's harder decks; still a locked \"?\" from Map 11); Socket 34 (Unique cards reach the road on Map 30). "
  "Was 11 / 11 / 12 / 13 / 13 / 15 / 17 / 20. Note: the Blacksmith's equipment still counts Map 11 as its obtain map in the budget (canonical/card-obtain-maps.json); moving it to 18 would give those cards 1.4 more budget, not changed here.",
  ["As built", "Other maps (say them)", "Also move the equipment's obtain map to 18"], "As built"),
 item("RES4-3", "UI", "The first group dungeon's aqua name: The Tidelock Vault",
  "RES3-4 (your 11:19: \"a cool first multi-player dungeon? maybe aqua themed\"). Three names: (1) The Tidelock Vault, a flooded vault that only opens at low tide, so the crew works against the water; (2) The Drowned Warren, keeping the warren; (3) Brinedeep Grotto. Built with (1) (GD_THEMED_NAME, ui.res4-gd-hollow), on its Map 16 spot and the Arena's Co-op pane. The floors and the boss keep their names (the Bat Roost ... the Hollow Matriarch): say if they should go aqua too.",
  ["The Tidelock Vault (as built)", "The Drowned Warren", "Brinedeep Grotto", "Also rename the floors and boss to match"], "The Tidelock Vault (as built)"),
 item("RES4-4", "Economy", "The pass's \"daily tiers\" count notices claimed",
  "The proposal pays 20 / 10 / 10 Stickers for daily tiers 1-3 (QUEST_TIERS.daily). Those tiers are no longer posted: the daily notices replaced them, and the Notices page shows only the notices and the weekly tiers. Built: the day's three tiers are 3, 5 and 6 notices claimed that day (20 / 10 / 10), which keeps the proposal's light day (3 notices, tier 1, a win: about 70) and full day (about 130). Also: a field-kit item before the traveller's kit opens (Map 12) comes as 40 Maple Leaves.",
  ["As built (3 / 5 / 6 notices)", "Bring the daily quest tiers back", "Drop the daily tiers from the pass"], "As built (3 / 5 / 6 notices)"),
]
src = open(P, encoding='utf-8').read()
d = json.loads(src)
if any(x.get('id') in {n['id'] for n in NEW} for x in d['items']):
    print('already applied'); raise SystemExit(0)
a = '"items": [\n'
assert src.count(a) == 1
src = src.replace(a, a + ''.join('    ' + json.dumps(x, ensure_ascii=False) + ',\n' for x in NEW))
json.loads(src)
open(P, 'w', encoding='utf-8').write(src)
print('added', len(NEW))
