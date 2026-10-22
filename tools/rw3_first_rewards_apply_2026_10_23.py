#!/usr/bin/env python3
"""2026-10-23 (package RW3): applies the card moves that tools/rw3_first_rewards_2026_10_23.js planned (docs/balance/rw3-first-rewards-2026-10-23.json):
each moved card's source becomes {kind:'map', id, node} (a skirmish-exclusive first-clear card; it leaves the pack pool), and a card that
moves to another map (the Quarry Mole, RP3: Thistlewood's pool -> Caves & Alcoves') moves in canonical/map-pools.json too.
cards.json keeps its format byte for byte (json.dumps indent 2, ASCII escapes, a final newline), as tools/map_divvy_apply_2026_10_22.py does.
Running it twice changes nothing.

    node tools/rw3_first_rewards_2026_10_23.js apply && python3 tools/rw3_first_rewards_apply_2026_10_23.py
"""
import json, os, re
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
CARDS = os.path.join(ROOT, 'canonical', 'cards.json')
POOLS = os.path.join(ROOT, 'canonical', 'map-pools.json')
PLAN = os.path.join(ROOT, 'docs', 'balance', 'rw3-first-rewards-2026-10-23.json')
dump = lambda d: json.dumps(d, indent=2, ensure_ascii=True) + '\n'
raw = open(CARDS, encoding='utf-8').read(); cards = json.loads(raw)
assert dump(cards) == raw, 'canonical/cards.json does not round-trip byte for byte; not touching it'
plan = json.load(open(PLAN, encoding='utf-8'))
by = {c['id']: c for c in cards}
changed = 0
for m in plan['moves']:
    c = by.get(m['id'])
    if not c: print('missing card', m['id']); continue
    if c.get('source') != m['to']:
        c['source'] = m['to']; c.pop('awaitingSource', None); changed += 1
        note = '2026-10-23 (package RW3): ' + ('a skirmish-exclusive first-clear card of ' + m['node'] + ' (owner GD2-3: "Skirmish exclusives have priority. So move the pack cards."); was a pack card' if 'GD2-3' in m['why'] else 'out of Base, the first-clear card of ' + m['node'] + ' (owner RP3)') + '.'
        c['creatorNote'] = ((c.get('creatorNote') or '') + ' ' + note).strip()
open(CARDS, 'w', encoding='utf-8').write(dump(cards))
# map-pools: a card in another main map's MAP tier moves to the planned map's (only the Quarry Mole today)
text = open(POOLS, encoding='utf-8').read(); pools = json.loads(text)['maps']
moved = 0
for m in plan['moves']:
    cid, dest = m['id'], m['map']
    if 'RP3' not in m['why']: continue  # a pack card made exclusive stays in later maps' pools (carried over for their decks)
    here = 0
    for mid, entry in pools.items():
        if mid != dest and cid in entry.get('cards', []):
            here += 1
            # remove from that map's "cards" line, add to the destination's (the file's own one-line arrays are kept)
            pat = re.compile(r'("' + re.escape(mid) + r'":\s*\{\s*"cards":\s*\[)([^\]]*)(\])')
            text = pat.sub(lambda mm: mm.group(1) + ', '.join(x for x in [s.strip() for s in mm.group(2).split(',')] if x and x != '"' + cid + '"') + mm.group(3), text, count=1)
            moved += 1
    if here and cid not in pools.get(dest, {}).get('cards', []):
        pat = re.compile(r'("' + re.escape(dest) + r'":\s*\{\s*"cards":\s*\[)([^\]]*)(\])')
        text = pat.sub(lambda mm: mm.group(1) + mm.group(2) + ', "' + cid + '"' + mm.group(3), text, count=1)
json.loads(text)
open(POOLS, 'w', encoding='utf-8').write(text)
print('cards.json:', changed, 'sources changed; map-pools.json:', moved, 'card(s) moved between maps')
