# 2026-11-16 (package CARDPOW1): the owner workbook from docs/balance/cardpow1/cardpow1-2026-11-16.json (tools/cardpow1/cardpow1_2026_11_16.js
# --xlsx). Sheet "Cards": one row per card (map, rarity, ATK/HP/wait, skills, fill L1 / L5 / L10, power, flag, proposed fix, a blank "OK?"),
# in-play Maps 0-20 cards first, the worst fill first; "Curve L1-10": every level's fill; "About": how it was read.
#   python3 tools/cardpow1/workbook_2026_11_16.py <json> <xlsx>
import json, sys
from openpyxl import Workbook
from openpyxl.styles import Font, PatternFill, Alignment
from openpyxl.utils import get_column_letter

src, dst = sys.argv[1], sys.argv[2]
J = json.load(open(src, encoding='utf-8'))
lo, hi = J['band']
NOBAND = ('egg', 'spell', 'equipment')
def in_play(r): return r['obtainable'] and r['kind'] != 'field' and r['verdict'] not in NOBAND
def dist(r):
    f = r['fillL1'] or 0
    return f - hi if f > hi else lo - f if f < lo else 0
def group(r):
    if in_play(r) and r['map'] <= 20: return 0
    if in_play(r): return 1
    return 2
rows = sorted(J['cards'], key=lambda r: (group(r), r['verdict'] == 'in band', -dist(r), r['map'], r['name']))
wb = Workbook()
ws = wb.active; ws.title = 'Cards'
head = ['Card', 'Map', 'Where', 'Kind', 'Rarity', 'ATK', 'HP', 'Wait', 'Lumber', 'Skills', 'Start Lv', 'Fill L1 %', 'Fill L5 %', 'Fill L10 %', 'Verdict L1',
        'Power', 'Advanced', 'For budget', 'Flag', 'Proposed fix (owner decides)', 'Owner-set', 'OK?', 'id']
ws.append(head)
bold = Font(bold=True)
for c in ws[1]: c.font = bold; c.alignment = Alignment(wrap_text=True, vertical='top')
RED, PINK, GREEN, GREY = PatternFill('solid', fgColor='F4C7C3'), PatternFill('solid', fgColor='FCE8B2'), PatternFill('solid', fgColor='D9EAD3'), PatternFill('solid', fgColor='EEEEEE')
where = {0: 'In play, Maps 0-20', 1: 'In play, Map 21+', 2: 'Not in play'}
for r in rows:
    p = r.get('power') or {}
    g = group(r)
    w = where[g] if r['obtainable'] or r['kind'] in ('token', 'field') else 'Not in play'
    if r['kind'] in ('token', 'field', 'pool candidate'): w = r['kind'].capitalize()
    ws.append([r['name'], r['map'], w + ('; ' + ', '.join(r['lists'][:4]) if r['lists'] else ''), r['kind'], r['rarity'], r['attack'], r['health'], r['wait'], r['lumber'], r['skills'],
               r['baseLevel'], r['fillL1'], r['fillL5'], r['fillL10'], r['verdict'], p.get('n'), p.get('adv'), p.get('forBudget'), '; '.join(r['flags']), r['proposal'],
               'yes' if r['owner'] else '', '', r['id']])
    row = ws.max_row
    v = r['verdict']
    fill = RED if v.startswith('over') else PINK if v == 'under' else GREEN if v == 'in band' else GREY
    ws.cell(row=row, column=15).fill = fill
    ws.cell(row=row, column=12).fill = fill
widths = [24, 6, 34, 11, 10, 5, 5, 5, 7, 40, 7, 8, 8, 8, 12, 7, 9, 9, 50, 34, 8, 8, 22]
for i, wd in enumerate(widths, 1): ws.column_dimensions[get_column_letter(i)].width = wd
ws.freeze_panes = 'B2'; ws.auto_filter.ref = ws.dimensions
# the curve
wc = wb.create_sheet('Curve L1-10')
wc.append(['Card', 'Map', 'Where'] + ['L%d fill %%' % L for L in range(1, 11)] + ['L%d stats' % L for L in range(1, 11)] + ['B2 flags', 'id'])
for c in wc[1]: c.font = bold
for r in rows:
    g = group(r)
    wc.append([r['name'], r['map'], where[g]] + [x['fill'] for x in r['curve']] + ['%s/%s' % (x['A'], x['H']) for x in r['curve']] + ['; '.join([f for f in r['flags'] if f.startswith('B2')]), r['id']])
    row = wc.max_row
    for i, x in enumerate(r['curve']):
        if r['verdict'] in NOBAND or r['kind'] == 'field': continue
        cell = wc.cell(row=row, column=4 + i)
        cell.fill = RED if not x['ok'] else PINK if x['fill'] < lo else GREEN
wc.column_dimensions['A'].width = 24; wc.column_dimensions['C'].width = 18; wc.freeze_panes = 'D2'; wc.auto_filter.ref = wc.dimensions
# about
wa = wb.create_sheet('About')
S = J['summary']; P = J['power']
for line in [
    'CARDPOW1, 2026-11-16: every playable card of canonical/cards.json (%d), budget fill and card power.' % S['cards'],
    'Fill = B / N as the card editor reads it: B = f x ((3A + H) x m + S) (cap 1), N at that level for the first map a player gets the card on; cap 2 checked too.',
    'Stats and skills at each level from the game (statsAtLevel: the Forge curve or the card\'s levelStats; effectsAtLevel: levelSkills).',
    'Band (checklist B1): %s-%s%% at Level 1. B2: a one-level rise over %s points, a level %s+ points over its L1 fill or over budget, a level %s+ points under its L1 fill and under the band.' % (lo, hi, J['jumpPoints'], J['driftPoints'], J['driftPoints']),
    'Power = card power test (%s, %s, %s games a card): win %% minus the median Maps 0-20 card (%s%%), as the editor shows it; Advanced = win %% vs strong decks minus 50; For budget = power minus what its N predicts.' % (P['file'], P['generated'], P['games'], P['medianWinRate']),
    'Eggs, spells and equipment have no band (eggs hatch; spells and equipment are not units: equipment read with its grant x durability).',
    'Proposed fix: the smallest Attack / Health step into the band at Level 1, shape kept. Proposals only: the stats are the owner\'s. Owner-set cards are flagged, never retuned.',
    'Counts: in band %d, under %d, over %d (all cards); in play, Maps 0-20: %d cards, %d outside the band.' % (S['inBand'], S['under'], S['over'], S['maps0to20InPlay'], S['maps0to20Outside']),
    'Source: docs/balance/cardpow1/cardpow1-2026-11-16.json (tools/cardpow1/cardpow1_2026_11_16.js --xlsx), commit %s.' % J.get('commit', '')]:
    wa.append([line])
wa.column_dimensions['A'].width = 160
wb.save(dst)
print('wrote', dst, len(rows), 'cards')
