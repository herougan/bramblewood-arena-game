#!/usr/bin/env python3
"""ECON2 (2026-11-03): read docs/balance/econ2-maps-2026-11-03.json (written by map_probe_2026_11_03.py) and measure how each map's
objects sit: counts by kind, crowding (interactive objects closer than CROWD % of the canvas), objects under the map's own title panel
or toolbar, objects at the edge, and the empty share of the canvas (cells of a 5 x 5 grid with no interactive object). Also the dialogue
per map (feature spots, curiosities, boss banter, errand offers). Prints Markdown tables; writes docs/balance/econ2-maps-report-2026-11-03.json.
    python3 tools/econ2/map_report_2026_11_03.py
"""
import json, math, os
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
D = json.load(open(os.path.join(ROOT, 'docs', 'balance', 'econ2-maps-2026-11-03.json')))
INTERACTIVE = {'fight', 'elite', 'boss', 'tutorial', 'feature', 'curiosity', 'well', 'cave', 'submap', 'exit', 'courier', 'npc'}
CROWD = 7.0        # % of the canvas: two tap targets closer than this (centre to centre, y scaled to the canvas aspect) read as one cluster
EDGE = 4.0
def panel_boxes(w, h):
    # the map title panel (top left, ~520 x 105 px at 1110 wide) and the top-right toolbar (~370 x 45 px), in canvas %
    return [(0, 0, 520 / w * 100, 105 / h * 100, 'title panel'), (100 - 370 / w * 100, 0, 100, 45 / h * 100, 'toolbar')]

def dist(a, b, asp):
    return math.hypot(a['x'] - b['x'], (a['y'] - b['y']) / asp)

rows = []
for m in D['maps']:
    objs = [o for o in m['objects'] if o['kind'] in INTERACTIVE]
    deco = [o for o in m['objects'] if o['kind'] in ('tree', 'prop') or o['cls'].startswith('mfx-hit')]  # MAPFX1's touchable trees / bushes / water
    asp = m['w'] / max(1, m['h'])  # x% per y% so distances are in the same unit
    crowd = []
    for i, a in enumerate(objs):
        for b in objs[i + 1:]:
            d = dist(a, b, asp)
            if d < CROWD: crowd.append((round(d, 1), a['kind'] + ':' + (a['key'] or a['label'][:14]), b['kind'] + ':' + (b['key'] or b['label'][:14])))
    under = []
    for (x0, y0, x1, y1, what) in panel_boxes(m['w'], m['h']):
        for o in objs:
            if x0 <= o['x'] <= x1 and y0 <= o['y'] <= y1: under.append(what + ' over ' + o['kind'] + ':' + (o['key'] or o['label'][:14]))
    edge = [o['kind'] + ':' + (o['key'] or '') for o in objs if min(o['x'], o['y'], 100 - o['x'], 100 - o['y']) < EDGE]
    cells = set((min(4, int(o['x'] // 20)), min(4, int(o['y'] // 20))) for o in objs)
    empty = 25 - len(cells)
    kinds = {}
    for o in m['objects']: kinds[o['kind']] = kinds.get(o['kind'], 0) + 1
    # path: the mean trail-link length between linked nodes
    L = [math.hypot(l[2] - l[0], (l[3] - l[1]) / asp) for l in m['links']]
    rows.append({'id': m['id'], 'n': m['n'], 'name': m['name'], 'sub': m['sub'], 'kinds': kinds, 'interactive': len(objs), 'decor': len(deco),
                 'crowded': sorted(crowd)[:6], 'crowdedPairs': len(crowd), 'underPanels': under, 'atEdge': edge, 'emptyCells': empty,
                 'meanLink': round(sum(L) / len(L), 1) if L else None, 'maxLink': round(max(L), 1) if L else None, 'links': len(L)})

# dialogue per map: feature spots (mapNumber), curiosities (map id), boss banter (2 lines per boss-kind fight, the first time), errand offers
dl = D.get('dialogue') or {}
num_of = {m['id']: m['n'] for m in D['maps']}
per = {}
def add(n, what, lines, words):
    if n is None: return
    p = per.setdefault(n, {'convs': 0, 'lines': 0, 'words': 0, 'what': []}); p['convs'] += 1; p['lines'] += lines; p['words'] += words; p['what'].append(what)
for s in dl.get('spots', []):
    if s.get('dialogue') and s.get('lines') and s['key'] != 'autobattle': add(s.get('mapNumber'), 'spot ' + s['key'], s['lines'], s['words'])  # autobattle: admin only, off the map (UI6 X22)
for c in dl.get('curios', []): add(c.get('n'), 'curio ' + c['key'], c['lines'], c['words'])
banter = dl.get('banter') or 2
for b in dl.get('bossNodes', []):
    n = num_of.get(b['map'])
    if n is not None and not [m for m in D['maps'] if m['id'] == b['map'] and m['sub']]: add(n, 'boss ' + b['key'], banter, 16)
report = {'maps': rows, 'dialoguePerMap': per, 'crowdThreshold': CROWD}
json.dump(report, open(os.path.join(ROOT, 'docs', 'balance', 'econ2-maps-report-2026-11-03.json'), 'w'), indent=1, ensure_ascii=False)
print('| Map | Fights | Feature / curio / other | Decor | Crowded pairs (<%g%%) | Under panels | Empty cells /25 | Mean link |' % CROWD)
print('|---|---|---|---|---|---|---|---|')
for r in sorted(rows, key=lambda r: ((r['n'] if r['n'] is not None else 99), r['sub'])):
    k = r['kinds']; f = k.get('fight', 0) + k.get('elite', 0) + k.get('boss', 0) + k.get('tutorial', 0)
    other = k.get('well', 0) + k.get('cave', 0) + k.get('submap', 0) + k.get('exit', 0) + k.get('courier', 0) + k.get('npc', 0)
    print(f"| {r['n']}{'s' if r['sub'] else ''} {r['name']} | {f} | {k.get('feature', 0)} / {k.get('curiosity', 0)} / {other} | {r['decor']} | {r['crowdedPairs']} {'; '.join(a + '~' + b + ' ' + str(d) for d, a, b in r['crowded'][:2])} | {'; '.join(r['underPanels'][:2])} | {r['emptyCells']} | {r['meanLink']} |")
print()
print('| Map | NPC conversations | Lines | Words | What |'); print('|---|---|---|---|---|')
for n in sorted(per):
    p = per[n]; print(f"| {n} | {p['convs']} | {p['lines']} | {p['words']} | {', '.join(p['what'])} |")
