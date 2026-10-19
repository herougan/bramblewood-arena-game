#!/usr/bin/env python3
"""The level curve workbook (2026-10-19, package LV): docs/level-curve-2026-10-19.xlsx, its chart docs/level-curve-2026-10-19.png and
the generated tables of docs/level-curve-2026-10-19.md (between <!-- lv:NAME --> ... <!-- /lv:NAME --> markers).

    python3 tools/level_curve_xlsx.py    reads docs/balance/: lv-abs-{before,after}.jsonl and level-curve-fit-{before,after}.json (the
                                         yardstick measure and its fit, tools/level_curve_2026_10_19.js abs / fit), skirmish-pass-
                                         {cb-after,lv-rule,lv-after,lv-fresh}.jsonl (the reference player: before, on the rule, after,
                                         fresh seeds), level-curve-curves.json (the curves per map, `curves`), level-curve-economy.json,
                                         level-curve-decks-{a,b}.json, level-curve-overrides-{before,after}.json, level-curve-floors-*.json,
                                         level-curve-nodes-{before,after}.json

Sheets: Curves, Absolute (the map level before / after with its trend), Fights, Overrides, Changes, Floors, Economy, Decks.
"""
import json, os, re, math
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
key = lambda r: (r['map'], r['key'])
ref_before = {key(r): r for r in jsonl('skirmish-pass-cb-after.jsonl') + jsonl('skirmish-pass-th-after-side.jsonl')}
ref_rule = {key(r): r for r in jsonl('skirmish-pass-lv-rule.jsonl')}
ref_after = {key(r): r for r in jsonl('skirmish-pass-lv-after.jsonl')}
ref_fresh = {key(r): r for r in jsonl('skirmish-pass-lv-fresh.jsonl')}
fit_b, fit_a = load('level-curve-fit-before.json', {}), load('level-curve-fit-after.json', {})
Db = {(f['map'], f['key']): f for f in fit_b.get('fights', [])}; Da = {(f['map'], f['key']): f for f in fit_a.get('fights', [])}
curves = load('level-curve-curves.json', {'maps': []})
econ = load('level-curve-economy.json', {})
decks_r = (load('level-curve-decks-a.json', []) or []) + (load('level-curve-decks-b.json', []) or [])
ov_b, ov_a = load('level-curve-overrides-before.json', []), load('level-curve-overrides-after.json', [])
nb, na = load('level-curve-nodes-before.json', {}), load('level-curve-nodes-after.json', {})
NAMES = {c['id']: c.get('name', c['id']) for c in json.load(open(os.path.join(ROOT, 'canonical', 'cards.json'), encoding='utf-8'))}
HEAD = Font(bold=True, color='FFFFFF'); HFILL = PatternFill('solid', fgColor='3A5A40')
FILL = {'easy': PatternFill('solid', fgColor='CFE2FF'), 'hard': PatternFill('solid', fgColor='F8D7DA'), 'green': PatternFill('solid', fgColor='D1E7DD')}
r1 = lambda x: None if x is None else round(x, 1)
r2 = lambda x: None if x is None else round(x, 2)

def green(r):
    if not r: return None
    return 'easy' if r['win'] > r['hi'] + 1e-9 else 'hard' if r['win'] < r['lo'] - 1e-9 else 'green'
def change_text(k):
    b, a = nb.get(k), na.get(k)
    if not b or not a: return ''
    out = []
    bd, ad = b.get('deck') or {}, a.get('deck') or {}
    for cid in sorted(set(bd) | set(ad), key=lambda c: NAMES.get(c, c)):
        d = (ad.get(cid) or 0) - (bd.get(cid) or 0)
        if d: out.append(('+' if d > 0 else '−') + str(abs(d)) + ' ' + NAMES.get(cid, cid))
    if b.get('shield') != a.get('shield') or (b.get('shieldOverride') is not None) != (a.get('shieldOverride') is not None):
        out.append('Shield %s%s → %s%s' % (b.get('shield'), ' (override)' if b.get('shieldOverride') is not None else '', a.get('shield'), ' (override)' if a.get('shieldOverride') is not None else ' (rule)'))
    if b.get('hp') != a.get('hp'): out.append('Health %s → %s' % (b.get('hp'), a.get('hp')))
    return '; '.join(out)

def sheet(wb, title, header, rows, widths=None, fills=None):
    ws = wb.create_sheet(title); ws.append(header)
    for c in ws[1]: c.font = HEAD; c.fill = HFILL; c.alignment = Alignment(wrap_text=True, vertical='top')
    for i, r in enumerate(rows):
        ws.append(r)
        if fills:
            for col, f in fills(i, r): ws.cell(row=i + 2, column=col).fill = f
    for i, w in enumerate(widths or []): ws.column_dimensions[get_column_letter(i + 1)].width = w
    ws.freeze_panes = 'A2'
    return ws

def fight_rows():
    out = []
    for k, f in sorted(Da.items() or Db.items(), key=lambda kv: (kv[1]['side'], kv[1]['mapNo'], kv[1]['code'])):
        b, a = Db.get(k), Da.get(k)
        rb, rr, ra, rf = ref_before.get(k), ref_rule.get(k), ref_after.get(k), ref_fresh.get(k)
        out.append({'k': k, 'code': f['code'], 'name': f['name'], 'mapNo': f['mapNo'], 'side': f['side'], 'endless': f.get('endless'), 'kind': f['kind'],
                    'target': (ra or rr or {}).get('target'), 'lo': (ra or rr or {}).get('lo'), 'hi': (ra or rr or {}).get('hi'),
                    'Db': b and b['D'], 'Da': a and a['D'], 'ML_b': b and b.get('lvl'), 'ML_a': a and a.get('lvl'),
                    'wb': rb and rb['win'], 'wr': rr and rr['win'], 'wa': ra and ra['win'], 'wf': rf and rf['win'],
                    'ga': green(ra), 'gf': green(rf), 'gb': green(rb) if rb and 'hi' in rb else None,
                    'lvb': b and b.get('lv'), 'lva': a and a.get('lv'), 'shb': b and b.get('shield'), 'sha': a and a.get('shield'), 'rule': a and a.get('rule'),
                    'ovb': b and b.get('overridden'), 'ova': a and a.get('overridden'), 'hpb': b and b.get('hp'), 'hpa': a and a.get('hp'),
                    'change': change_text(k[0] + ':' + k[1])})
    return out

def chart(path):
    try:
        import matplotlib; matplotlib.use('Agg'); import matplotlib.pyplot as plt
    except Exception: return False
    mb, ma = fit_b.get('maps', []), fit_a.get('maps', [])
    fig, ax = plt.subplots(figsize=(8, 4.2), dpi=110)
    for maps, fit, col, lab in [(mb, fit_b, '#9a6b3f', 'before'), (ma, fit_a, '#2f6f4f', 'after')]:
        if not maps: continue
        xs = [m['mapNo'] for m in maps]; ys = [m['ML'] for m in maps]
        ax.plot(xs, ys, 'o-', color=col, label='map level, ' + lab, lw=1.8, ms=4)
        t = fit.get('road') or fit.get('trend', {}); x1 = [x for x in xs if x >= 1]  # the road's line from Map 1 (Map 0 is the starter's own world)
        ax.plot(x1, [t['a'] + t['b'] * x for x in x1], '--', color=col, lw=1, alpha=.7, label='line from Map 1, %s (%.2f DR a map, r² %.2f)' % (lab, t['b'], t.get('r2') or 0))
    ax.set_xlabel('Map'); ax.set_ylabel('Difficulty rating (DR)'); ax.set_title('How hard each map is, on one scale (fixed yardstick decks)')
    ax.grid(alpha=.25); ax.legend(fontsize=8, loc='upper left'); fig.tight_layout(); fig.savefig(path); plt.close(fig)
    return True

def md_tables(rows):
    T = {}
    # curves
    L = ['| Map | Enemy level (skirmish / boss) | Enemy stats | Your level | Your stats | Shield by rule (skirmish / elite / mini-boss / boss) |', '|---|---|---|---|---|---|']
    for m in curves.get('maps', []):
        L.append('| %d | %s / %s | +%s%% | %s | +%s%% | %s / %s / %s / %s |' % (m['map'], m['enemy'], m['enemyBoss'], m['enemyGain'], m['player'], m['playerGain'], m['shield']['skirmish'], m['shield']['elite'], m['shield']['miniboss'], m['shield']['boss']))
    T['curves'] = L
    # absolute difficulty
    mb = {m['mapNo']: m for m in fit_b.get('maps', [])}; ma = {m['mapNo']: m for m in fit_a.get('maps', [])}
    L = ['| Map | Map level before | off the line before | Map level after | off the line after | Your rating after (R_ref) |', '|---|---|---|---|---|---|']
    ob, oa = (fit_b.get('road') or {}).get('off', {}), (fit_a.get('road') or {}).get('off', {})
    for no in sorted(set(mb) | set(ma)):
        b, a = mb.get(no, {}), ma.get(no, {})
        L.append('| %d | %s | %s | %s | %s | %s |' % (no, b.get('ML', ''), ob.get(str(no), '–'), a.get('ML', ''), oa.get(str(no), '–'), a.get('Rref', '')))
    T['absolute'] = L
    # green per map
    L = ['| Map | Fights | Green before (with overrides) | Green on the rule, no overrides, new curves | Green after | Green on fresh seeds |', '|---|---|---|---|---|---|']
    for no in range(0, 25):
        rs = [r for r in rows if r['mapNo'] == no and not r['side'] and not r['endless']]
        if not rs: continue
        g = lambda key: sum(1 for r in rs if r[key] == 'green')
        gr = sum(1 for r in rs if r['wr'] is not None and r['lo'] is not None and r['lo'] <= r['wr'] <= r['hi'])
        L.append('| %d | %d | %d | %d | %d | %d |' % (no, len(rs), g('gb'), gr, g('ga'), g('gf')))
    T['maps'] = L
    # overrides
    L = ['| Fight | Kind | Rule Shield | Before | After |', '|---|---|---|---|---|']
    a_by = {(o['map'], o['key']): o for o in ov_a}
    for o in sorted(ov_b, key=lambda o: (o['side'], o['mapNo'], o['code'])):
        a = a_by.get((o['map'], o['key']))
        bt = ('Shield %d' % o['shield'] if o['overridden'] else 'rule') + (', Health %d of %d' % (o['hp'], o['ownHp']) if o['hp'] < o['ownHp'] else '')
        at = ('Shield %d' % a['shield'] if a['overridden'] else 'rule') + (', Health %d of %d' % (a['hp'], a['ownHp']) if a['hp'] < a['ownHp'] else '') if a else 'rule'
        L.append('| %s | %s | %d | %s | %s |' % (o['code'], o['kind'], o['rule'], bt, at))
    for a in sorted(ov_a, key=lambda o: (o['side'], o['mapNo'], o['code'])):
        if (a['map'], a['key']) in {(o['map'], o['key']) for o in ov_b}: continue
        at = ('Shield %d' % a['shield'] if a['overridden'] else 'rule') + (', Health %d of %d' % (a['hp'], a['ownHp']) if a['hp'] < a['ownHp'] else '')
        L.append('| %s | %s | %d | rule | %s |' % (a['code'], a['kind'], a['rule'], at))
    T['overrides'] = L
    # fights (main and side)
    L = ['| Fight | Kind | Target (green) | Before | On the rule | After | Fresh seeds | DR before → after | What changed |', '|---|---|---|---|---|---|---|---|---|']
    for r in rows:
        if r['endless']: continue
        if r['target'] is None: continue
        mark = lambda w, g: '' if w is None else ('%s%%' % r1(w)) + ('' if g in (None, 'green') else ' (%s)' % ('blue' if g == 'easy' else 'red'))
        L.append('| %s %s | %s | %s%% (%s–%s) | %s | %s | %s | %s | %s → %s | %s |' % (r['code'], r['name'], r['kind'], r1(r['target']), r1(r['lo']), r1(r['hi']), mark(r['wb'], r['gb']), '' if r['wr'] is None else '%s%%' % r1(r['wr']), mark(r['wa'], r['ga']), mark(r['wf'], r['gf']), r['Db'], r['Da'], r['change'] or '–'))
    T['fights'] = L
    # floors
    fl = load('level-curve-floors-after.json', {}) or {}
    L = ['| Dungeon | Floor | Counts as Map | Enemy level | Shield | Parent map\'s deck | The deck of the map it counts as |', '|---|---|---|---|---|---|---|']
    for r in fl.get('rows', []):
        L.append('| %s | %d | %s | %s | %s | %s%% | %s%% |' % ({'mm': 'Murgle Mayhem (Map 6)', 'mlb': 'The Long Burrow (Map 22)'}.get(r['map'], r['map']), r['floor'], r['countsAs'], r['enemy'], r['shield'], r['parentWin'], r['atWin']))
    T['floors'] = L
    # economy
    L = ['| Map | Dust earned (a map a day) | Deck stats (3/4 of the Dust, a map a day) | Copies by level | Light player (half the notices) |', '|---|---|---|---|---|']
    a, l = {r['map']: r for r in econ.get('dayPerMap', [])}, {r['map']: r for r in econ.get('dayPerMapLight', [])}
    for no in sorted(a):
        L.append('| %d | %s | +%s%% | %s | +%s%% |' % (no, a[no]['earned'], a[no]['meanGain'], a[no]['levels'], l.get(no, {}).get('meanGain', '')))
    T['economy'] = L
    # deck ratings
    L = ['| Deck | Rating at Lv 1 |', '|---|---|']
    for d in decks_r: L.append('| %s | %s |' % ('Map ' + str(d['deck']) if d['deck'] != 'starter' else 'Otter starter', d['R']))
    T['decks'] = L
    return T

def write_md(T):
    p = os.path.join(ROOT, 'docs', 'level-curve-2026-10-19.md')
    if not os.path.exists(p): return
    s = open(p, encoding='utf-8').read()
    for name, lines in T.items():
        s = re.sub(r'<!-- lv:%s -->.*?<!-- /lv:%s -->' % (name, name), lambda m: '<!-- lv:%s -->\n%s\n<!-- /lv:%s -->' % (name, '\n'.join(lines), name), s, flags=re.S)
    open(p, 'w', encoding='utf-8').write(s)

def main():
    rows = fight_rows()
    wb = Workbook(); wb.remove(wb.active)
    cm = curves.get('maps', [])
    sheet(wb, 'Curves', ['Map', 'Enemy level (skirmish)', 'Enemy level (boss)', 'Enemy stats +%', 'Your level', 'Your stats +%', 'Rule Shield skirmish', 'elite', 'mini-boss', 'boss', 'Bramble Health skirmish', 'elite', 'boss', 'CPU (skirmish / elite+)'],
          [[m['map'], m['enemy'], m['enemyBoss'], m['enemyGain'], m['player'], m['playerGain'], m['shield']['skirmish'], m['shield']['elite'], m['shield']['miniboss'], m['shield']['boss'], m['hp'].get('skirmish'), m['hp'].get('elite'), m['hp'].get('boss'), m.get('cpu', '')] for m in cm], [6, 10, 10, 9, 9, 9, 9, 7, 9, 7, 11, 7, 7, 14])
    mb = {m['mapNo']: m for m in fit_b.get('maps', [])}; ma = {m['mapNo']: m for m in fit_a.get('maps', [])}
    ws = sheet(wb, 'Absolute', ['Map', 'Map level before (DR)', 'Trend before', 'Off trend before', 'Your rating before', 'Map level after', 'Trend after', 'Off trend after', 'Your rating after', 'Mean fight DR before', 'Mean fight DR after'],
          [[no, mb.get(no, {}).get('ML'), mb.get(no, {}).get('trend'), mb.get(no, {}).get('off'), mb.get(no, {}).get('Rref'), ma.get(no, {}).get('ML'), ma.get(no, {}).get('trend'), ma.get(no, {}).get('off'), ma.get(no, {}).get('Rref'), mb.get(no, {}).get('meanD'), ma.get(no, {}).get('meanD')] for no in sorted(set(mb) | set(ma))],
          [6, 12, 10, 10, 10, 12, 10, 10, 10, 10, 10])
    png = os.path.join(ROOT, 'docs', 'level-curve-2026-10-19.png')
    if chart(png):
        try:
            from openpyxl.drawing.image import Image
            img = Image(png); img.anchor = 'M2'; ws.add_image(img)
        except Exception as e: print('no image in the workbook:', e)
    def ff(i, r):
        out = []
        for col, g in ((8, rows_main[i]['gb']), (10, rows_main[i]['ga']), (11, rows_main[i]['gf'])):
            if g in FILL: out.append((col, FILL[g]))
        return out
    rows_main = [r for r in rows]
    sheet(wb, 'Fights', ['Fight', 'Name', 'Map', 'Side map', 'Kind', 'Target %', 'Green', 'Before % (with overrides)', 'On the rule %', 'After %', 'Fresh seeds %', 'DR before', 'DR after', 'Enemy level before', 'after', 'Shield before', 'after', 'Rule', 'Health before', 'after', 'What changed'],
          [[r['code'], r['name'], r['mapNo'], 'yes' if r['side'] else '', r['kind'], r['target'], '' if r['lo'] is None else '%s–%s' % (r1(r['lo']), r1(r['hi'])), r['wb'], r['wr'], r['wa'], r['wf'], r['Db'], r['Da'], r['lvb'], r['lva'], r['shb'], r['sha'], r['rule'], r['hpb'], r['hpa'], r['change']] for r in rows_main],
          [9, 26, 5, 6, 9, 8, 10, 10, 9, 8, 9, 8, 8, 8, 7, 8, 7, 6, 8, 7, 70], ff)
    a_by = {(o['map'], o['key']): o for o in ov_a}; b_by = {(o['map'], o['key']): o for o in ov_b}
    allk = sorted(set(a_by) | set(b_by), key=lambda k: ((a_by.get(k) or b_by.get(k))['side'], (a_by.get(k) or b_by.get(k))['mapNo'], (a_by.get(k) or b_by.get(k))['code']))
    sheet(wb, 'Overrides', ['Fight', 'Kind', 'Rule Shield', 'Shield before', 'override before', 'Shield after', 'override after', 'x rule after', 'Health before', 'Health after', 'Bramble\'s own Health'],
          [[(a_by.get(k) or b_by.get(k))['code'], (a_by.get(k) or b_by.get(k))['kind'], (a_by.get(k) or b_by.get(k))['rule'],
            b_by[k]['shield'] if k in b_by else '', 'yes' if k in b_by and b_by[k]['overridden'] else '',
            a_by[k]['shield'] if k in a_by else '', 'yes' if k in a_by and a_by[k]['overridden'] else '',
            round(a_by[k]['shield'] / a_by[k]['rule'], 2) if k in a_by and a_by[k]['rule'] else '',
            b_by[k]['hp'] if k in b_by else '', a_by[k]['hp'] if k in a_by else '', (a_by.get(k) or b_by.get(k))['ownHp']] for k in allk], [9, 9, 8, 9, 9, 9, 9, 9, 9, 9, 10])
    sheet(wb, 'Changes', ['Fight', 'Name', 'Before %', 'After %', 'Fresh %', 'What changed'], [[r['code'], r['name'], r['wb'], r['wa'], r['wf'], r['change']] for r in rows if r['change']], [9, 26, 9, 9, 9, 90])
    fl = load('level-curve-floors-after.json', {}) or {}
    sheet(wb, 'Floors', ['Dungeon', 'Floor', 'Kind', 'Counts as Map', 'Enemy level', 'Shield', 'Health', "Parent map's deck %", 'Deck of the map it counts as %'],
          [[r['map'], r['floor'], r['kind'], r['countsAs'], r['enemy'], r['shield'], r['hp'], r['parentWin'], r['atWin']] for r in fl.get('rows', [])], [8, 6, 9, 10, 10, 8, 8, 12, 14])
    er = []
    for k in ('threeQuarters', 'dayPerMapLight', 'dayPerMap'):
        for r in econ.get(k, []): er.append([k, r['map'], r['earned'], r['bank'], r['meanGain'], r['levels']])
    sheet(wb, 'Economy', ['Player', 'Map', 'Dust earned before it', 'Dust left in the bank', 'Deck stats +%', 'Copies by level'], er, [16, 6, 12, 12, 10, 30])
    dk = load('skirmish-pass-decks.json', {'road': {}}).get('road', {})
    sheet(wb, 'Decks', ['Map', 'Level', 'Deck', 'Rating at Lv 1 (before the rebuild)'], [[int(no), d.get('level'), ', '.join('%dx %s' % (c['n'], c['name']) for c in d.get('cards', [])), next((x['R'] for x in decks_r if str(x['deck']) == str(no)), '')] for no, d in sorted(dk.items(), key=lambda kv: int(kv[0]))], [6, 7, 100, 12])
    wb.save(os.path.join(ROOT, 'docs', 'level-curve-2026-10-19.xlsx'))
    write_md(md_tables(rows))
    print('wrote docs/level-curve-2026-10-19.xlsx', len(rows), 'fights')

if __name__ == '__main__':
    main()
