#!/usr/bin/env python3
# Art reuse map (2026-10-19, package UT; owner 09:52: "After we re-divvy out units, we will try to reuse 99% of the art.").
# For every unit in canonical/unit-themes.json (live, pool, the proposed later versions) and its non-player units, the existing art file
# it keeps:
#   own        its own card art: art/cards/<id>.png, or the art embedded in cards.json (the build writes it to assets/cards/<id>.webp)
#   base       a proposed version keeps its base card's art (a re-tint or an edit of it later, as the art guide's "skin variant")
#   animal     no art of its own: the art of another card of the same animal (then the same kind) can stand in for now
#   loose      no usable match (flagged): only a different animal of the same species field could stand in, e.g. a mouse for a vole
#   none       no usable match: needs new art
# Writes docs/art/art-reuse-map.md.   python3 tools/art_reuse_map.py   (--check: exit 1 when the file is stale)
import json, os, sys
from collections import Counter, OrderedDict

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
OUT = os.path.join(ROOT, 'docs', 'art', 'art-reuse-map.md')
cards = {c['id']: c for c in json.load(open(os.path.join(ROOT, 'canonical', 'cards.json'), encoding='utf-8'))}
T = json.load(open(os.path.join(ROOT, 'canonical', 'unit-themes.json'), encoding='utf-8'))
files = set(f[:-4] for f in os.listdir(os.path.join(ROOT, 'art', 'cards')) if f.endswith('.png'))

def own_art(cid):
  if cid in files: return 'art/cards/%s.png' % cid
  c = cards.get(cid)
  if c and str(c.get('art') or '').startswith('data:'): return 'cards.json (embedded; built to assets/cards/%s.webp)' % cid
  return None

# cards with art, by animal and by kind (the stand-ins for a unit with none)
by_animal, by_group, by_sub = {}, {}, {}
for u in T['units']:
  if u['status'] == 'proposed' or not own_art(u['id']): continue
  if u.get('animal'): by_animal.setdefault(u['animal'], []).append(u['id'])
  if u.get('animalGroup'): by_group.setdefault(u['animalGroup'], []).append(u['id'])
  if u.get('sub') and not u.get('subtype'): by_sub.setdefault(u['sub'], []).append(u['id'])

def stand_in(u):
  for pool, how in ((by_animal.get(u.get('animal')) or [], 'same animal'), (by_group.get(u.get('animalGroup')) or [], 'same kind'),
                    (by_sub.get(u.get('sub')) or [] if not u.get('subtype') else [], 'loose: same species')):
    alt = [x for x in sorted(pool) if x != u['id']]
    if alt: return alt[0], how
  return None, None

rows = []
U = {u['id']: u for u in T['units']}
for u in T['units']:
  a = own_art(u['id'])
  if a: rows.append((u, 'own', a, '')); continue
  if u['status'] == 'proposed':
    b = own_art(u['variant']['of'])
    if b: rows.append((u, 'base', b, 'its base, ' + U[u['variant']['of']]['name'])); continue
  alt, how = stand_in(u)
  if alt and how.startswith('loose'): rows.append((u, 'loose', own_art(alt), 'NO USABLE MATCH (needs new art); the nearest, loosely: %s (%s)' % (U[alt]['name'], U[alt].get('animal')))); continue
  if alt: rows.append((u, 'animal', own_art(alt), '%s: %s (%s), until it has its own' % (how, U[alt]['name'], U[alt].get('animal')))); continue
  rows.append((u, 'none', '', 'NO USABLE MATCH: needs new art'))
np_rows = []
for n in T.get('nonPlayer', []):
  if n['kind'] == 'raid-boss-unit': np_rows.append((n, 'base', n['art']['uses'], 'its base card; wants its own epic art (docs/art/raid-elder-art-brief.md)'))
  else: np_rows.append((n, 'own' if n['art']['ownArt'] else 'none', n['art']['uses'] or '', 'raid boss portrait'))

cnt = Counter(r[1] for r in rows)
total = len(rows); reused = total - cnt['none'] - cnt['loose']
L = ['# Art reuse map (2026-10-19)', '',
  'The owner, 09:52: *"After we re-divvy out units, we will try to reuse 99% of the art."*', '',
  'This lists every unit in `canonical/unit-themes.json`: %d live, %d in the pool and %d proposed later versions. For each one it gives the existing art file it keeps. Built by `python3 tools/art_reuse_map.py`.' % (T['counts']['live'], T['counts']['pool'], T['counts']['proposed']), '',
  '## Summary', '',
  '- **%d of %d units (%.1f%%) keep existing art.**' % (reused, total, 100.0 * reused / max(1, total)),
  '  - %d have art of their own.' % cnt['own'],
  '  - %d proposed versions keep their base card\'s art.' % cnt['base'],
  '  - %d have no art of their own yet. Another card\'s art of the same animal (or the same kind) stands in for now.' % cnt['animal'],
  '- **%d have no usable match** and need new art. They are flagged below: %d of them have a loose stand-in of the same species field (a different animal), %d have nothing.' % (cnt['none'] + cnt['loose'], cnt['loose'], cnt['none']),
  '- The raid\'s boss units (the Leviathan Elder and the Kraken Brute) borrow their base card\'s art. Their own epic art is briefed in `docs/art/raid-elder-art-brief.md`.', '',
  '"Own" art is a file in `art/cards/`, or the art embedded in `cards.json`. The build writes the embedded art to `assets/cards/<id>.webp`. A stand-in is only a placeholder: the card shows another creature\'s picture until its own is made.', '']
flag = [r for r in rows if r[1] in ('none', 'loose')]
L += ['## No usable match (%d)' % len(flag), '']
if flag:
  L += ['| Unit | Status | Animal | Note |', '|---|---|---|---|'] + ['| %s (`%s`) | %s | %s | %s%s |' % (r[0]['name'], r[0]['id'], r[0]['status'], r[0].get('animal') or '', r[3], (': `' + r[2] + '`') if r[2] else '') for r in flag]
else: L += ['None.']
L += ['', '## Stand-ins: no own art yet (%d)' % cnt['animal'], '', '| Unit | Status | Animal | Uses for now |', '|---|---|---|---|']
L += ['| %s (`%s`) | %s | %s | `%s`: %s |' % (r[0]['name'], r[0]['id'], r[0]['status'], r[0].get('animal') or '', r[2], r[3]) for r in rows if r[1] == 'animal']
L += ['', '## Proposed later versions: their base\'s art (%d)' % cnt['base'], '', '| Proposed name | Internal | Keeps |', '|---|---|---|']
L += ['| %s | `%s` | `%s` (%s) |' % (r[0]['name'], r[0]['id'], r[2], r[3]) for r in rows if r[1] == 'base']
L += ['', '## Non-player units', '', '| Unit | Kind | Art |', '|---|---|---|']
L += ['| %s (`%s`) | %s | `%s` %s |' % (n['name'], n['id'], n['kind'], a, ('(' + note + ')') if note else '') for n, k, a, note in np_rows]
L += ['', '## Units with their own art (%d)' % cnt['own'], '', '| Unit | Status | Animal | File |', '|---|---|---|---|']
L += ['| %s (`%s`) | %s | %s | `%s` |' % (r[0]['name'], r[0]['id'], r[0]['status'], r[0].get('animal') or '', r[2]) for r in rows if r[1] == 'own']
text = '\n'.join(L) + '\n'
if '--check' in sys.argv:
  if not os.path.exists(OUT) or open(OUT, encoding='utf-8').read() != text: print('docs/art/art-reuse-map.md is out of date: run python3 tools/art_reuse_map.py'); sys.exit(1)
  print('art reuse map up to date'); sys.exit(0)
os.makedirs(os.path.dirname(OUT), exist_ok=True)
open(OUT, 'w', encoding='utf-8').write(text)
print('units %d: own %d, base %d, stand-in %d, loose %d, none %d (%.1f%% reuse)' % (total, cnt['own'], cnt['base'], cnt['animal'], cnt['loose'], cnt['none'], 100.0 * reused / max(1, total)))
