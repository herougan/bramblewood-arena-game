#!/usr/bin/env python3
"""ENG10 (2026-10-26): the new owner calls in docs/decisions.json (one item per line, at the top), idempotent.
  python3 tools/eng10_decisions_2026_10_26.py"""
import json, os
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
P = os.path.join(ROOT, 'docs', 'decisions.json')
def item(i, area, title, body, options=None, default=None, kind="Decide"):
    d = {"id": i, "status": "YET", "kind": kind, "area": area, "title": title, "asked": "2026-10-26", "body": body}
    if options: d["options"] = options
    if default: d["default"] = default
    return d
NEW = [
 item("ENG10-1", "Rules", "The spits without \"Spit\": Cinder and Ice in place of Ember and Frost?",
  "ENG9-3 (your 11:19: no \"Spit\" suffix): Acid, Venom and Spark are clean words. Ember is the Materia gem (+1 Attack) and Frost is a state skill (Frost – {…}), so the fire spit reads Cinder and the frost spit Ice (Firefly Swarm and Habanero Drakon: Cinder 2; Ice Petrel: Ice N). The engine keys are unchanged.",
  ["Cinder and Ice (as built)", "Other words (say them)"], "Cinder and Ice (as built)"),
 item("ENG10-2", "Balance", "Armor 5 and 4 on Commons: trimmed to Armor 3",
  "ENG9-9's exponential Armor (1.68 x N^1.43: Armor 3 8.1, 4 12.2, 5 16.8) leaves no legal stats for two Commons: the Barnacle Fortress (0/6, Armor 5: its Armor alone is over its budget) is Armor 3 at 0/10, the Stone Turtle Warden (5/5, Armor 4 + Tide) is Armor 3 at 4/4. The Marshal of Rivergate and the War Elephant were over budget before and stay held. Data: docs/balance/eng10-refit-2026-10-26.json.",
  ["As built (Armor 3)", "Keep their Armor and hold them over budget", "Another trim (say it)"], "As built (Armor 3)"),
 item("ENG10-3", "Cards", "Flora cards whose species is Elemental: move them to Plant?",
  "ENG9-5: Flora is the phylum now (species Plant and Fungi both show it), and the Flora cards carry a type (Tree, Flower, Vine; the Fungi cards Mushroom). Eight walking plants still have species Elemental (Ent, Bramble Sprout, Thornvine Lasher, Elder Willow, Hollow Oath-Keeper, Strangler Vine, Cypress Root Lurker, Pinecone Sapper), so the Codex files them under Elemental and Elemental rules count them. Not changed.",
  ["Keep species Elemental (as now)", "Make them Plant (Flora phylum)", "Plant + Elemental (both)"], "Keep species Elemental (as now)"),
 item("ENG10-4", "Cards", "Threshold skills: homes changed for two",
  "PROP1-4's homes, one card each on Maps 0-20, at most two new skills a map: Throng on the Carrion Fly Swarm (Map 8, 2/6 -> 1/4), Carnage on the Dust Hyena (Map 14, 2/9 -> 2/7), Muster on the Wolf Pack Runner (Map 16, 4/15 -> 3/13), Dirge on the Wolfsbane Alpha (17-8, 1/22 -> 1/19) and Beset on the Ravenous Wolverine (Map 17, in place of its Scarcity, 3/3), Requiem on the Cinder Skeleton (Map 20, 1/10 -> 1/5). Two differ from the proposal's examples: the Lone Grey Wolf has no legal stats with Lone Wolf and Beset, and the Carrion Crow is not a band card. The Cinder Skeleton's cut is large (Requiem 3.2 on a 1-Lumber Common).",
  ["As built", "Other homes (say them)"], "As built"),
 item("ENG10-5", "Cards", "The Gangrenous Leech: three abilities",
  "PROP1-3: it is a Parasite with Gorge now and keeps Poison 2 on its swings (the proposal), so it carries three abilities (Parasite, Gorge, Poison). Re-fit 4/4 -> 3/3 (Gorge priced 2.8, 0.8 x a Parasite's typical Attack).",
  ["Keep Poison 2 (thematic, as built)", "Drop Poison 2 (two abilities, larger stats)"], "Keep Poison 2 (thematic, as built)"),
 item("ENG10-6", "PvP", "How a PvP stranger is levelled",
  "FIX3-4 (your \"Yes level pvp strangers deck\"): in Collection PvP the stranger's deck fights at Level = 1 + (your battle rating / its battle rating at Level 1 - 1) / 0.31, clamped to 1-10, two decimals (a fractional level mixes two stat steps, as road enemies do). A stranger stronger than you is never levelled below Level 1. Standard PvP stays at Level 1. Its Elo rating and the win's rating change are as before.",
  ["As built", "Also level a stronger stranger down (below its cards' Level 1)", "Whole levels only"], "As built"),
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
