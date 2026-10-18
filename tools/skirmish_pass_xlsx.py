#!/usr/bin/env python3
"""Skirmish pass workbook (2026-10-18, package SKB): docs/skirmish-pass-2026-10-18.xlsx from the pass's data files.

    python3 tools/skirmish_pass_xlsx.py        reads docs/balance/skirmish-pass-{before,after,verify}.jsonl, skirmish-pass-changes.json and
                                               skirmish-pass-decks.json; writes docs/skirmish-pass-2026-10-18.xlsx

Sheets: Fights (every fight, before / after), Changes (what the pass changed), Outliers (what is still outside 12-92%), Decks.
"""
import json, os
from openpyxl import Workbook
from openpyxl.styles import Font, PatternFill, Alignment
from openpyxl.utils import get_column_letter

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
B = os.path.join(ROOT, 'docs', 'balance')
def jsonl(name):
    p = os.path.join(B, name)
    return [json.loads(l) for l in open(p, encoding='utf-8') if l.strip()] if os.path.exists(p) else []
before = {(r['map'], r['key']): r for r in jsonl('skirmish-pass-before.jsonl')}
after = {(r['map'], r['key']): r for r in jsonl('skirmish-pass-after.jsonl')}
verify = {(r['map'], r['key']): r for r in jsonl('skirmish-pass-verify.jsonl')}
changes = {(r['map'], r['key']): r for r in json.load(open(os.path.join(B, 'skirmish-pass-changes.json'), encoding='utf-8'))['changes']}
REASON = {
    '21-3': 'Strong deck only: its Owl Fletchers and Cave Bat Swarms shoot down a deck of 12 flyers (the Mid-road deck wins 73%). No themed card under the Map 21 cap changed it, and Shield does not matter to a fight the CPU cannot hurt you in.',
    '24-6': "11 defensive cards (Goose Sentry, Mallard Halberdier, Truce Heron) that run dry; 98% for the Mid-road deck too. No deck move within the cap or Shield up to 180 moved it: it needs a new attacker by hand.",
    '6-MM-10': 'Endless dungeon (floor 10, the Murgle King): floors grow 4% a floor and are meant to wall a deck sooner or later; floor 1 is 52%.',
    '6-MM-25': 'Endless dungeon floor 25 (+96% stats): a wall for a Map 6 deck by design; not tuned.',
    '6-MM-50': 'Endless dungeon floor 50: not tuned.',
    '22-LB-1': 'Endless dungeon floor 1 for the Strong deck: an easy first step of a 50-floor climb; not tuned.',
    '22-LB-50': 'Endless dungeon floor 50 (the Sett Lord): not tuned.',
}
decks = json.load(open(os.path.join(B, 'skirmish-pass-decks.json'), encoding='utf-8'))
curve = json.load(open(os.path.join(B, 'difficulty-curve.json'), encoding='utf-8'))
CPU = ['Basic', 'Smart', 'Smartest']
STAGE = {'starter': 'Starter', 'road': 'Road', 'mid': 'Mid-road', 'strong': 'Strong'}
HEAD = Font(bold=True, color='FFFFFF'); HFILL = PatternFill('solid', fgColor='3A5A40')
EASY = PatternFill('solid', fgColor='CFE2FF'); HARD = PatternFill('solid', fgColor='F8D7DA'); OK = PatternFill('solid', fgColor='D1E7DD')

def change_text(fx):
    if not fx or fx.get('apply') is False: return ''
    out = []
    for mv in fx.get('moves') or []:
        k = mv.get('k', 1)
        if mv['type'] in ('swap', 'more'): out.append(f"-{k} {mv['out']} +{k} {mv['inn']}")
        elif mv['type'] == 'add': out.append(f"+{k} {mv['inn']}")
        elif mv['type'] == 'remove': out.append(f"-{k} {mv['out']}")
    if fx.get('shieldOverride') is not None: out.append(f"shieldOverride {fx['shieldOverride']}")
    if fx.get('hqHp') is not None: out.append(f"Health {fx['hqHp']}")
    return '; '.join(out)

def sheet(wb, title, cols, rows, widths):
    ws = wb.create_sheet(title)
    ws.append(cols)
    for c in ws[1]: c.font = HEAD; c.fill = HFILL; c.alignment = Alignment(vertical='center')
    for r in rows: ws.append(r)
    for i, w in enumerate(widths, 1): ws.column_dimensions[get_column_letter(i)].width = w
    ws.freeze_panes = 'A2'
    return ws

wb = Workbook(); wb.remove(wb.active)
cols = ['Code', 'Map', 'Map name', 'Fight', 'Kind', 'Your deck', 'CPU', 'Health before', 'Health after', 'Shield before', 'Shield after', 'Win % before', 'Win % after', 'Win % fresh seeds', 'Before', 'After', 'What changed']
rows = []
for key, b in before.items():
    a = after.get(key, b); v = verify.get(key, a); c = changes.get(key)
    rows.append([b['code'], b['mapNo'], b['mapName'], b['name'], b['kind'], STAGE.get(b['stage'], b['stage']), CPU[b['cpu']], b['hp'], a['hp'], b['shield'], a['shield'],
                 b['win'], a['win'], v['win'], b['verdict'], a['verdict'], c['change'] if c else ''])
ws = sheet(wb, 'Fights', cols, rows, [10, 5, 22, 28, 10, 10, 9, 8, 8, 8, 8, 9, 9, 10, 8, 8, 70])
for r in ws.iter_rows(min_row=2):
    for idx in (14, 15):
        v = r[idx].value; r[idx].fill = EASY if v == 'easy' else HARD if v == 'hard' else OK
ch = [[r[0], r[2], r[3], r[4], r[5], r[11], r[12], r[13], r[16]] for r in rows if r[16]]
sheet(wb, 'Changes', ['Code', 'Map name', 'Fight', 'Kind', 'Your deck', 'Win % before', 'Win % after', 'Win % fresh seeds', 'What changed'], ch, [10, 22, 28, 10, 10, 10, 10, 10, 80])
out = [[r[0], r[2], r[3], r[4], r[5], r[12], r[13], r[15], REASON.get(r[0], 'Within a few points of the edge on one seed set (60 games); in the band over both sets.' if r[15] == 'ok' else '')] for r in rows if r[15] != 'ok' or (r[13] > 92 or r[13] < 12)]
sheet(wb, 'Outliers', ['Code', 'Map name', 'Fight', 'Kind', 'Your deck', 'Win % after', 'Win % fresh seeds', 'After', 'Why it stays'], out, [10, 22, 28, 10, 10, 10, 10, 8, 90])
drows = []
for k in ('starter', 'mid', 'strong'):
    drows.append([STAGE[k], 'Map 0' if k == 'starter' else 'Maps 10-17' if k == 'mid' else 'Maps 18-24', ', '.join(f"{c['n']}x {c['name']}" for c in curve['decks'][k]['cards'])])
for no, d in sorted(decks['road'].items(), key=lambda x: int(x[0])):
    drows.insert(int(no), ['Road', f'Map {no}', ', '.join(f"{c['n']}x {c['name']}" for c in d['cards'])])
sheet(wb, 'Decks', ['Deck', 'Used on', 'Cards'], drows, [10, 12, 110])
dst = os.path.join(ROOT, 'docs', 'skirmish-pass-2026-10-18.xlsx'); wb.save(dst); print('wrote', dst, len(rows), 'fights', len(ch), 'changes', len(out), 'outliers')
