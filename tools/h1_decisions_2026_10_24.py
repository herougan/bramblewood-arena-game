#!/usr/bin/env python3
"""H1 (2026-10-24): the owner calls in docs/decisions.json (one item per line, at the top), idempotent.
  python3 tools/h1_decisions_2026_10_24.py"""
import json, os
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
P = os.path.join(ROOT, 'docs', 'decisions.json')
def item(i, area, title, body, options=None, default=None):
    d = {"id": i, "status": "YET", "kind": "Decide", "area": area, "title": title, "asked": "2026-10-24", "body": body}
    if options: d["options"] = options
    if default: d["default"] = default
    return d
NEW = [
 item("H1-a", "Forge", "Taking a gem out of a socket: does the gem come back?",
  "Your H1 (\"Maybe all uniques and above are also liable for materia (gem) socketing - but only 1. Costs to apply, costs to remove.\"), built as the Forge's 💎 Socket tab (it replaces Enchant): every copy of a Unique or rarer creature has one gem socket. Setting a Materia gem costs Dust + Maple Leaves and one crystal; taking it out costs Dust + Maple Leaves. Built: the gem comes back to your Materia when you take it out (the friendlier default; one switch, SOCKET_REMOVE_RETURNS, to make it break instead). Keep it, or should taking it out destroy the gem?",
  ["The gem comes back (built)", "The gem breaks when taken out"], "The gem comes back (built)"),
 item("H1-b", "Forge", "Gem socket prices (placeholders)",
  "Placeholder prices per rank, in canonical/upgrade-costs.json materiaSocket and the hub's 💰 Upgrade costs tab (group Gem sockets): set a gem / take it out, Dust · Maple Leaves: Unique 150 · 300 / 100 · 200; Legendary 250 · 500 / 150 · 300; Mythic 400 · 800 / 250 · 500; Ancient 600 · 1,200 / 350 · 700; Divine 900 · 1,800 / 500 · 1,000; Void 1,200 · 2,400 / 700 · 1,400; Daemonic 1,600 · 3,200 / 900 · 1,800 (a crystal itself is 125 Dust at the bench). Edit them in the hub tab, or say the rule you want (for example a share of the card's level road).",
  ["Keep the placeholders", "Edit in the hub tab", "Another rule (say which)"], "Keep the placeholders"),
 item("H1-c", "Forge", "Which cards have a socket, and Heroes",
  "Built: creatures only (Materia, equipment and spell cards have none), of rank Unique and above; a flagged rarity counts as its rank (Quest-Unique as Unique, Dev-Legendary and Event-Legendary as Legendary, Dev-Ancient as Ancient). Your Hero card has no socket yet (the 10-06 Hero socketing plan is separate). The gem effects are the old Enchant ones, unchanged: Ember +1 Attack (its hits scorch), Tide +2 Health, Grove +1/+1, Stone +3 Health; a gem is a progression bonus outside the card's printed budget. OK, or should Heroes (or equipment) get a socket too?",
  ["OK", "Heroes get a socket too", "Change (say what)"], "OK"),
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
print('decisions: H1-a .. H1-%s' % 'abc'[len(NEW) - 1])
