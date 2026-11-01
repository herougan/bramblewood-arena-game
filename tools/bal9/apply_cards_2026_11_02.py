#!/usr/bin/env python3
# 2026-11-02 (package BAL9): writes a BAL9 plan's card edits into canonical/cards.json, keeping its format (json.dumps indent 2, ASCII
# escapes, a trailing newline). A plan is {"edits": [{"id", "set": {field: value}, "unset": [fields], "note"}]}; each note is appended to the
# card's creatorNote as "2026-11-02 BAL9: <note>" (a re-run replaces BAL9's earlier note for that step instead of adding a second).
#   python3 tools/bal9/apply_cards_2026_11_02.py docs/balance/bal9/<step>-2026-11-02.json [--dry]
import json, os, sys
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..')
CARDS = os.path.join(ROOT, 'canonical', 'cards.json')
plan_path = sys.argv[1]
plan = json.load(open(plan_path if os.path.isabs(plan_path) else os.path.join(ROOT, plan_path)))
step = os.path.basename(plan_path).split('-')[0]
cards = json.load(open(CARDS))
by = {c['id']: c for c in cards}
n = 0
for e in plan.get('edits', []):
    c = by.get(e['id'])
    if c is None:
        print('not in cards.json:', e['id']); continue
    for k, v in (e.get('set') or {}).items():
        c[k] = v
    for k in e.get('unset') or []:
        c.pop(k, None)
    if ((e.get('set') or {}).get('source') or {}).get('kind') == 'map':
        c.pop('unattainable', None)  # a reward card is obtainable
    if e.get('clearTag'):  # undo an earlier BAL9 step's note on this card
        c['creatorNote'] = (c.get('creatorNote') or '').split(' 2026-11-02 BAL9 %s:' % e['clearTag'])[0].rstrip()
    if e.get('note'):
        tag = ' 2026-11-02 BAL9 %s:' % step
        note = (c.get('creatorNote') or '').split(tag)[0].rstrip()
        c['creatorNote'] = (note + tag + ' ' + e['note']).strip()
    n += 1
if '--dry' not in sys.argv:
    open(CARDS, 'w').write(json.dumps(cards, indent=2) + '\n')
print('%d card edits %s from %s' % (n, 'checked' if '--dry' in sys.argv else 'written', os.path.relpath(plan_path, ROOT) if os.path.isabs(plan_path) else plan_path))
