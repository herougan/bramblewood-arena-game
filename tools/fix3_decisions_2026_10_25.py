#!/usr/bin/env python3
"""FIX3 (2026-10-25): the owner calls in docs/decisions.json (one item per line, at the top), idempotent.
  python3 tools/fix3_decisions_2026_10_25.py"""
import json, os
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
P = os.path.join(ROOT, 'docs', 'decisions.json')
def item(i, area, title, body, options=None, default=None):
    d = {"id": i, "status": "YET", "kind": "Decide", "area": area, "title": title, "asked": "2026-10-25", "body": body}
    if options: d["options"] = options
    if default: d["default"] = default
    return d
NEW = [
 item("FIX3-1", "Maps", "Links open on any won fight: are some of the 34 two-branch joins meant to wait for both branches?",
  "F1 (your #9: \"winning that skirmish should unlock 2, not 1\"): a fight now opens as soon as ANY fight linked to it is won. Before, a fight with two links waited for both: on your live map edits 6-6 is linked from 6-5 and 6-3 (card_overrides __cfg:map-nodes:m8), so winning 6-3 drew a line to 6-6 that stayed shut. The road has 34 such joins (for example 1-4 after 1-2 and 1-3, 3-7 after 3-5 and 3-6, 11-8 after 11-5/6/7, 20-10, 24-8): each now opens from either branch, so a player may skip one branch. The skirmish editor keeps the old rule as an opt-in (\"Unlocked after: all of these are cleared\"), and those links draw dotted. Every map is checked by tests/fix3-2026-10-25.js (each link opens its fight; every fight can be reached).",
  ["Any link opens it (as built)", "Mark some joins \"all of these\" (name them)", "Back to all links for joins, only fan-outs open on one"], "Any link opens it (as built)"),
 item("FIX3-2", "Maps", "G20: which Map 0 click should give a tooltip after Map 10?",
  "Built from your note \"After Map 10, the submap on Map 0 should give a tooltip on click, not dialogue\": on Map 0 the two things that still start a conversation, the signpost (its talk points you to Map 1) and the old well, now show a short tip with their name once Map 10 is cleared, seen or not. Map 0's side-map entrances (the Tutorial, the Old Bramble) never talked; they open their map or show their lock tip. If you meant something else (a side map's own NPC, or the Tutorial map), say which.",
  ["The signpost and the well (as built)", "Something else (name it)"], "The signpost and the well (as built)"),
 item("FIX3-3", "Accounts", "Email sign-up: allow the game's address as a redirect in Supabase Auth?",
  "G7: your second account signed up with email but is unconfirmed and never signed in (no profile, no rows), so nothing could be saved. Email sign-up needs the confirmation link first. The game now says so, keeps the sign-up's progress on the device, and asks Supabase to send the link back to the game (emailRedirectTo = the page's address); the first sign-in of that account sends this device's progress and decks up. Supabase only honours that address if it is the Site URL or in Authentication > URL Configuration > Redirect URLs (https://bramblewood-arena.vercel.app). This is a dashboard setting, not SQL; nothing was changed on the server. The other option is turning off \"Confirm email\" (accounts would work at once, with no check that the address is real).",
  ["Add the game's URL to Redirect URLs (keep Confirm email)", "Turn off Confirm email", "Leave as is"], "Add the game's URL to Redirect URLs (keep Confirm email)"),
 item("FIX3-4", "PvP", "Should a PvP stranger's deck be levelled to your battle rating?",
  "Your G22 question, from the code: PvP is not scaled to your BR. The opponent is a recorded deck (a player's or a seeded stranger) from your Elo tier (6 tiers on the rating curve, widening one tier at a time until at least 6 candidates), drawn at random with a 60% pull toward decks whose battle rating is near yours (weight 0.4 + 0.6 x e^(-|BR difference| / max(8, your BR / 4))). Its cards fight as recorded; nothing is levelled up or down, and the win moves your rating by Elo (K 24). Options: keep it, or level the stranger's cards so its BR matches yours (a fairer fight, but a strong deck no longer reads as strong), or match on BR first and Elo second.",
  ["As now (Elo tier, BR pull)", "Level the stranger to your BR", "Match on BR first, Elo second"], "As now (Elo tier, BR pull)"),
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
