#!/usr/bin/env python3
"""COOP2 (2026-10-28): the owner calls in docs/decisions.json (one item per line, at the top), idempotent.
  python3 tools/coop2_decisions_2026_10_28.py"""
import json, os
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
P = os.path.join(ROOT, 'docs', 'decisions.json')
def item(i, area, title, body, options=None, default=None, kind="Decide"):
    d = {"id": i, "status": "YET", "kind": kind, "area": area, "title": title, "asked": "2026-10-28", "body": body}
    if options: d["options"] = options
    if default: d["default"] = default
    return d
NEW = [
 item("COOP2-1", "Group dungeon", "The Tidelock Vault is a 2-player dungeon",
  "K12 built: the player count belongs to the dungeon type (bramblewood-coop.js DUNGEONS.hollow.players), not the lobby. The vault is 2: a raid board has three rows a side at most (the engine's reserveRows is 0-2), so a row per player fits 2 or 3 players; two friends is the room the live coop_rooms row and join_coop_room already seat (no new SQL); and a 2-player floor is the simplest to tune first. A 3-player type is one more row; a 4-player type needs two players a row (split rows), not built.",
  ["2 players (built)", "3 players (a back row for player 3)", "4 players (build split rows first)"], "2 players (built)", kind="Confirm"),
 item("COOP2-2", "Group dungeon", "A row each, one shared bramble, allied slots both ways",
  "Built as the raid's model: player 1 (the host) holds the front row, player 2 the middle row; each plays from their own hand, deck and Lumber, one play a turn as in a normal fight; each leader opens in the centre of its row. The party has ONE bramble: every player's bramble Health added up and their passives merged (the raid's mergeRaidCastles). Either player may also play into the other's empty slots (K12); the unit stays its player's and holds that row. A unit in the middle row strikes from there (as a raid ally's), it never steps up into the front.",
  ["As built", "A bramble each (the party loses when either falls)", "Allied slots only in the front row"], "As built", kind="Confirm"),
 item("COOP2-3", "Group dungeon", "Cards the co-op table doesn't take yet",
  "Units, field cards and spells play as normal. Equipment (onto a unit), hazards (a row), evolutes (onto a base), Parasites (onto an enemy) and prayer offerings need a target the co-op claim doesn't carry yet, so they are refused with a note (\"This card can't be played in the group dungeon yet\") instead of half working; they can still be pitched. Building them is one more claim kind each.",
  ["Build them next", "Keep them out of the group dungeon"], "Build them next"),
 item("COOP2-4", "Group dungeon", "The race window: 120 ms",
  "K12's rule (\"If there's ever a race condition, smaller index player takes priority\"): every placement is a claim to the room's host; the host gathers the claims that arrive within 120 ms of the first one as one moment and lands them lower player index first, each checked against the board as it stands, so of two claims on one slot player 1's lands and player 2's card goes back to its hand with a note naming who took it. A claim on a slot that already landed is refused whoever made it (no stealing a slot after it shows). A longer window favours player 1 more often; a shorter one follows arrival order more closely.",
  ["120 ms (built)", "250 ms", "Arrival order only (index only on an exact tie)"], "120 ms (built)", kind="Confirm"),
 item("COOP2-5", "Group dungeon", "No turn timer",
  "The old 30 / 60 s plan timer went with the planning phase. Now, as in a normal fight, the round starts once every player who is here has played or passed; a player silent for 8 s is marked away and the CPU plays their seat until they come back (they catch up from the act log). A slow friend can hold the round up.",
  ["No timer (built)", "A 60 s turn, then an automatic Pass", "A 60 s turn, then the CPU plays it"], "No timer (built)"),
 item("COOP2-6", "Rewards", "The vault pays as raid fights",
  "Built (\"Rewards: as the raid does\"): each floor fight pays every player's own game, as a raid fight: its rank on the shared bramble (S 90%+, SS unhurt, SSS unhurt with no unit lost), the vault bramble's damage x 50 capped (2,000 / 2,200 / 2,400 / 3,000 by floor) or the overwhelm figure when it falls (2,500 / 3,000 / 3,500 / 5,000), times the rank (B 1.01 ... SSS 2); paid at the raid's rates (a Maple Leaf per 48, 3 Magic Dust per 190); a card from the vault's own cards at the raid's odds (12% a win, 25% at S or better, 1% survived) and the raid's egg roll on a win. The Energy (5) is still paid at the start and given back if no floor falls. Gone: the floor chests and the once-a-day pick of three after the boss. A floor isn't a win on the Profile's win/loss ledger.",
  ["As built", "Bring back the pick of three after the Tidewarden", "Different figures (say which)"], "As built", kind="Confirm"),
 item("COOP2-7", "Balance", "The vault's floors are not tuned yet",
  "The floors keep AR3's decks and bramble Health (x1.7 for two players, at the bramble scale). Headless, two CPU seats with starter-strength decks: floors 1-3 fall 10 / 10, the Tidewarden's floor about 7 / 10, most floors in 8-12 turns of the 20. Likely too easy before the boss; a balance package can measure real decks (tools/raid_full_sim.js style) and set the floors' Health and decks.",
  ["Tune in a balance package", "Leave as is for playtests first"], "Leave as is for playtests first"),
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
