#!/usr/bin/env python3
"""ENG11 (2026-10-27): the owner calls in docs/decisions.json (one item per line, at the top), idempotent.
  python3 tools/eng11_decisions_2026_10_27.py"""
import json, os
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
P = os.path.join(ROOT, 'docs', 'decisions.json')
def item(i, area, title, body, options=None, default=None, kind="Decide"):
    d = {"id": i, "status": "YET", "kind": kind, "area": area, "title": title, "asked": "2026-10-27", "body": body}
    if options: d["options"] = options
    if default: d["default"] = default
    return d
NEW = [
 item("ENG11-1", "Skills", "Coffee N replaced the old Coffee",
  "K2 built under the existing name and key: Coffee N now acts twice every Nth round the unit acts, then it is Stunned a round. The old Coffee (Wait -N on play, a nap N rounds later) is gone. Its two cards keep their Coffee and their stats (re-fit by the formula: both lines hold): the Buzzed Chipmunk (Map 5, Coffee 2, 3/14) and the Honeyjoe Brewer (Hummingbird faction, Coffee 1, 1/4). Priced 1.5 / N by the 4-round rule: a cycle of N + 1 rounds holds as many actions as without it, so it is tempo (an action a round early, and the extra one when the unit dies in its stunned round).",
  ["Replace the old Coffee (as built)", "Keep the old one under another name"], "Replace the old Coffee (as built)", kind="Confirm"),
 item("ENG11-2", "Map effects", "Nocturnal units see in every darkness, Absolute darkness too?",
  "K6 built: a fight with its own darkness is night for Nocturnal / Diurnal, and a Nocturnal unit no longer misses in the dark (as Darksight). That holds in Darkness (Maps 8, 2-B, 7-A), Pitch Black (10-A) and Absolute darkness (editor only). A Cast Darkness unit does not make it night (a day map stays day); Nocturnal units do see through the cast dark.",
  ["As built", "Nocturnal sees in Darkness only (Pitch Black / Absolute still blind it)", "Cast Darkness makes it night too"], "As built"),
 item("ENG11-3", "Map effects", "How should Diurnal units \"suffer\" in the dark places?",
  "K6 built: in a dark fight a Diurnal unit gets no day bonus and stays dark-blind (misses 1 in 4 in Darkness, 1 in 2 in Pitch Black) like any unit without Darksight. Nothing harsher. A harsher option: Diurnal units also lose 1 Attack there, or miss 1 in 2 in plain Darkness (as Sun-shy does by day).",
  ["As built (no bonus, the dark's normal miss)", "Also -1 Attack in the dark", "Miss 1 in 2 in any darkness"], "As built (no bonus, the dark's normal miss)"),
 item("ENG11-4", "Balance", "The road after K6 and K10 (not measured: no full runs this batch)",
  "Scorching now burns only by day: all 18 Scorching fights are on day / night maps (14-5, 14-7, 18-7, the nine 18-A fights, six 11-UC dungeon floors; Maps 20 and 22 have Scorched Ground instead) and now burn about half the rounds; both sides burn alike, so the effect on the road is small and mixed. The cave fights (Map 8, 2-B, 7-A, 10-A) now give Nocturnal units their bonus and sight: the bat-heavy cave decks and any player Nocturnal cards get stronger there. Proposed: measure these maps in the batch's road check and retune decks only if a fight leaves its band.",
  ["Road check in the batch's balance package (swaps only)", "Leave it"], "Road check in the batch's balance package (swaps only)", kind="Confirm"),
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
