#!/usr/bin/env python3
"""Thematic pass workbook and tables (2026-10-19, package TH): docs/thematic-pass-2026-10-19.xlsx and the fight tables of
docs/thematic-pass-2026-10-19.md (between <!-- fights --> and <!-- /fights -->, and <!-- cards --> ... <!-- /cards -->).

    python3 tools/thematic_pass_xlsx.py    reads docs/balance/: skirmish-pass-r3-after.jsonl (main's numbers, R2's final measure),
                                           skirmish-pass-th-side-before.jsonl (the side fights on main), skirmish-pass-th-after.jsonl
                                           (the final measure), road-curve-nodes-after.json and thematic-nodes-after.json (every fight's
                                           deck / Shield / Health before and after), thematic-pass-2026-10-19.json (the plan) and
                                           thematic-placed-2026-10-19.json (the placed cards)

Sheets: Fights (every changed fight: off-theme cards out, cards in for the theme, new rewards, new field, the curve's retune after the
reference decks were rebuilt, before / after win rate), All fights (every main fight's before / after), Placed (the 96 cards and their
sources), Pool (the cards left), Decks (the reference decks before and after).
"""
import json, os, re
from openpyxl import Workbook
from openpyxl.styles import Font, PatternFill, Alignment
from openpyxl.utils import get_column_letter

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
B = os.path.join(ROOT, 'docs', 'balance')
def jsonl(name):
    p = os.path.join(B, name)
    return [json.loads(l) for l in open(p, encoding='utf-8') if l.strip()] if os.path.exists(p) else []
def load(name, d=None):
    p = os.path.join(B, name)
    return json.load(open(p, encoding='utf-8')) if os.path.exists(p) else d
before = {(r['map'], r['key']): r for r in jsonl('skirmish-pass-r3-after.jsonl') + jsonl('skirmish-pass-th-side-before.jsonl')}
after = {(r['map'], r['key']): r for r in jsonl('skirmish-pass-th-after.jsonl')}
nb, na = load('road-curve-nodes-after.json', {}), load('thematic-nodes-after.json', {})
plan = load('thematic-pass-2026-10-19.json', {'place': [], 'fights': []})
placed = load('thematic-placed-2026-10-19.json', {'placed': []})['placed']
decks_after = load('skirmish-pass-decks.json', {'road': {}})
decks_before = load('thematic-decks-before.json', {'road': {}})
cards = json.load(open(os.path.join(ROOT, 'canonical', 'cards.json'), encoding='utf-8'))
NAMES = {c['id']: c.get('name', c['id']) for c in cards}
POOL_LEFT = [c for c in cards if c.get('pool')]
nm = lambda cid: NAMES.get(cid, cid)
HEAD = Font(bold=True, color='FFFFFF'); HFILL = PatternFill('solid', fgColor='3A5A40')
FILL = {'easy': PatternFill('solid', fgColor='CFE2FF'), 'hard': PatternFill('solid', fgColor='F8D7DA'), 'green': PatternFill('solid', fgColor='D1E7DD')}
FIELD_NAMES = {'sporeCloud': 'Spore Cloud', 'tangledRoots': 'Tangled Roots', 'thunderstorm': 'Thunderstorm 2', 'ashRain': 'Ash Rain', 'ashy': 'Ashy'}
planF = {(f['map'], f['key']): f for f in plan['fights']}
rewards = {}
for p in placed:
    s = p['source']
    if s.get('kind') == 'map': rewards.setdefault((s['id'], s['node']), []).append(p['name'])

def kvtext(d, sign):
    return ', '.join(f"{sign}{k} {nm(c)}" for c, k in (d or {}).items())
def deck_diff(a, b):  # b - a, as "+2 X; −1 Y"
    out = []
    for cid in sorted(set(a) | set(b), key=nm):
        d = b.get(cid, 0) - a.get(cid, 0)
        if d: out.append(f"{'+' if d > 0 else '−'}{abs(d)} {nm(cid)}")
    return '; '.join(out)
def tuned_text(k):  # what the curve's retune moved after the thematic swaps: final deck vs (main's deck + the plan's swaps)
    key = k[0] + ':' + k[1]; b, a = nb.get(key), na.get(key)
    if not b or not a: return ''
    mid = dict(b.get('deck') or {}); f = planF.get(k)
    if f:
        for c, n in (f.get('out') or {}).items():
            mid[c] = mid.get(c, 0) - n
            if mid[c] <= 0: del mid[c]
        for c, n in (f.get('in') or {}).items(): mid[c] = mid.get(c, 0) + n
    out = [deck_diff(mid, a.get('deck') or {})]
    if b.get('shield') != a.get('shield'): out.append(f"Shield {b.get('shield')} → {a.get('shield')}")
    if b.get('hp') != a.get('hp'): out.append(f"Health {b.get('hp')} → {a.get('hp')}")
    return '; '.join(x for x in out if x)
def green(r, w):
    if w is None or r is None: return ''
    return 'easy' if w > r['hi'] + 1e-9 else 'hard' if w < r['lo'] - 1e-9 else 'green'
def code_order(k):
    r = after.get(k) or before.get(k) or {'mapNo': 99, 'code': k[1], 'side': True}
    parts = re.split(r'-', r['code'])
    return (r['mapNo'], 1 if r.get('side') else 0, [int(x) if x.isdigit() else ord(x[0]) for x in parts[1:]])

rows = []
for k in sorted(set(after) | set(planF), key=code_order):
    a, b, f = after.get(k), before.get(k), planF.get(k)
    r = a or b
    if not r: continue
    tuned = tuned_text(k)
    rw = rewards.get(k, [])
    changed = bool(f or tuned or rw)
    rows.append(dict(code=r['code'], mapNo=r['mapNo'], map=r['mapName'], side=r.get('side', False), name=r['name'], kind=r['kind'], role=r.get('role', ''),
                     target=a['target'] if a else r.get('target'), lo=a['lo'] if a else r.get('lo'), hi=a['hi'] if a else r.get('hi'),
                     out=kvtext(f.get('out'), '−') if f else '', inn=kvtext(f.get('in'), '+') if f else '',
                     field=', '.join(FIELD_NAMES.get(x, x) for x in (f.get('rules') or {})) if f else '', rewards=', '.join(rw), tuned=tuned, why=f.get('why', '') if f else '',
                     before=b['win'] if b else None, bstat=green(a or b, b['win']) if b else '', after=a['win'] if a else None, astat=green(a, a['win']) if a else '',
                     shield_b=b['shield'] if b else None, shield_a=a['shield'] if a else None, changed=changed, curve=bool(r.get('curve'))))

def sheet(wb, title, cols, data, widths):
    ws = wb.create_sheet(title); ws.append(cols)
    for c in ws[1]: c.font = HEAD; c.fill = HFILL; c.alignment = Alignment(vertical='center', wrap_text=True)
    for r in data: ws.append(r)
    for i, w in enumerate(widths, 1): ws.column_dimensions[get_column_letter(i)].width = w
    ws.freeze_panes = 'A2'; return ws
def color(ws, idxs):
    for r in ws.iter_rows(min_row=2):
        for i in idxs:
            v = r[i].value
            if v in FILL: r[i].fill = FILL[v]

wb = Workbook(); wb.remove(wb.active)
cols = ['Code', 'Map', 'Map name', 'Fight', 'Kind', 'Target %', 'Green from', 'Green to', 'Off-theme out', 'In for the theme', 'Why', 'New reward(s)', 'New field',
        'Curve retune after the rebuild', 'Win % before', 'Before', 'Win % after', 'After', 'Shield before', 'Shield after']
ch = [[r['code'], r['mapNo'], r['map'], r['name'], r['kind'], r['target'], r['lo'], r['hi'], r['out'], r['inn'], r['why'], r['rewards'], r['field'], r['tuned'],
       r['before'], r['bstat'], r['after'], r['astat'], r['shield_b'], r['shield_a']] for r in rows if r['changed']]
ws = sheet(wb, 'Fights', cols, ch, [8, 5, 22, 26, 9, 8, 8, 8, 40, 40, 40, 26, 14, 50, 8, 7, 8, 7, 8, 8]); color(ws, [15, 17])
al = [[r['code'], r['mapNo'], r['map'], r['name'], r['kind'], r['target'], r['lo'], r['hi'], r['before'], r['bstat'], r['after'], r['astat'], 'yes' if r['changed'] else ''] for r in rows]
ws = sheet(wb, 'All fights', ['Code', 'Map', 'Map name', 'Fight', 'Kind', 'Target %', 'Green from', 'Green to', 'Win % before', 'Before', 'Win % after', 'After', 'Changed'], al, [8, 5, 22, 26, 9, 8, 8, 8, 8, 7, 8, 7, 8]); color(ws, [9, 11])
MAPN = {}
for r in jsonl('skirmish-pass-th-after.jsonl'): MAPN[r['map']] = (r['mapNo'], r['mapName'])
pl = []
for p in placed:
    s = p['source']; src = 'pack (basic pool 1)' if s.get('kind') == 'pack' else f"reward of {s['node']}"
    no, mname = MAPN.get(p['poolMap'], (None, p['poolMap']))
    pl.append([p['name'], p['id'], p['rarity'], no, mname, p['poolSlot'], src, p['poolNo'], p['numericId'], p['why']])
sheet(wb, 'Placed', ['Card', 'Id', 'Rarity', 'Map', 'Map name', 'Made for', 'Source now', 'Pool #', 'Card #', 'Why there'], pl, [24, 22, 10, 5, 22, 9, 18, 7, 7, 60])
sheet(wb, 'Pool', ['Card', 'Id', 'Rarity', 'Pool map', 'Slot', 'Why left'], [[c['name'], c['id'], c['rarity'], c.get('poolMap'), c.get('poolSlot'), ''] for c in POOL_LEFT], [24, 22, 10, 9, 9, 60])
dk = []
for m in sorted(set(decks_after.get('road', {})) | set(decks_before.get('road', {})), key=lambda x: int(x)):
    b = decks_before.get('road', {}).get(m, {}); a = decks_after.get('road', {}).get(m, {})
    t = lambda d: ', '.join(f"{c['n']}x {c['name']}" for c in d.get('cards', []))
    dk.append([int(m), t(b), b.get('score'), t(a), a.get('score'), a.get('pool')])
sheet(wb, 'Decks', ['Map', 'Reference deck before', 'Its score %', 'Reference deck after (rebuilt)', 'Its score %', 'Card pool'], dk, [5, 70, 9, 70, 9, 8])
wb.save(os.path.join(ROOT, 'docs', 'thematic-pass-2026-10-19.xlsx'))

# ---- the doc's tables
def pct(v): return '–' if v is None else (f"{v:g}%")
def st(s): return '' if s in ('green', '') else f' ({"blue" if s == "easy" else "red"})'
md_rows = []
cur = None
for r in [x for x in rows if x['changed']]:
    head = (r['mapNo'], r['side'], r['map'])
    if head != cur:
        cur = head
        md_rows.append(f"\n### {'Side map: ' if r['side'] else 'Map ' + str(r['mapNo']) + ': '}{r['map']}\n")
        md_rows.append('| Fight | Kind | Target (green) | Off theme, out | In | New reward | Field | Curve retune | Before | After |')
        md_rows.append('|---|---|---|---|---|---|---|---|---|---|')
    tgt = f"{r['target']:g}% ({r['lo']:g}–{r['hi']:g})" if r['target'] is not None else '–'
    md_rows.append(f"| {r['code']} {r['name']} | {r['kind']} | {tgt} | {r['out'] or '–'} | {r['inn'] or '–'} | {r['rewards'] or '–'} | {r['field'] or '–'} | {r['tuned'] or '–'} | {pct(r['before'])}{st(r['bstat'])} | {pct(r['after'])}{st(r['astat'])} |")
cards_md = ['\n| Map | Card | Rarity | Made for | Source now | Card # |', '|---|---|---|---|---|---|']
for p in placed:
    s = p['source']; no, mname = MAPN.get(p['poolMap'], (None, p['poolMap']))
    cards_md.append(f"| {no} {mname} | {p['name']} | {p['rarity']} | {p['poolSlot']} | {'the basic packs' if s.get('kind') == 'pack' else 'reward of ' + s['node']} | #{p['numericId']} |")
md_path = os.path.join(ROOT, 'docs', 'thematic-pass-2026-10-19.md')
if os.path.exists(md_path):
    md = open(md_path, encoding='utf-8').read()
    md = re.sub(r'<!-- fights -->.*<!-- /fights -->', lambda _: '<!-- fights -->\n' + '\n'.join(md_rows) + '\n<!-- /fights -->', md, flags=re.S)
    md = re.sub(r'<!-- cards -->.*<!-- /cards -->', lambda _: '<!-- cards -->\n' + '\n'.join(cards_md) + '\n<!-- /cards -->', md, flags=re.S)
    open(md_path, 'w', encoding='utf-8').write(md)
n_main = [r for r in rows if not r['side']]
print('changed fights', sum(1 for r in rows if r['changed']), '| main green after', sum(1 for r in n_main if r['astat'] == 'green'), 'of', len(n_main),
      '| main green before', sum(1 for r in n_main if r['bstat'] == 'green'))
