#!/usr/bin/env python3
"""BAL32 (2026-11-09): the owner's BAL31 answers applied to the skill prices (docs/decisions.json BAL31-1/2/3, owner 2026-11-09 03:55).

BAL31-1: one price per skill, the mean over bodies (BAL29's unit), no pair table.
BAL31-2: the on-hit riders re-priced from docs/balance/bal31/onhit-2026-11-08.json, the BAL29 way:
  y(N) = the mean over L1 and L5 of the mean-over-bodies worth; a rider is re-priced when the table misses both levels' 95% interval of the
  mean at some N (BAL29's under / over test); flat (y(3) < 1.2 y(1)) -> scale fixed at the mean of y; otherwise value x N^pow fitted through
  y (log least squares, tools/bal29/reprice_2026_11_08.js fitCurve); on/off riders -> fixed at y (to 0.05). Status riders cards print as
  {chance, duration} are priced by the table at its value whatever the object, so they get one flat value: y at duration 2 (the commonest
  printed duration), at the measure's chance 50.
  Not re-priced by this rule: the enablers (BAL31-3, below), Shock (priced by its 4-round logic in bramblewood-budget.js), Leech N (sap:
  perN; no card prints a number).
BAL31-3: an enabler costs its gain with its partner x the share of Maps 0-20 decks holding the partner (summed over partners):
  docs/balance/bal32/enabler-gains-2026-11-09.json (tools/bal32/enablers_2026_11_09.js) x docs/balance/bal32/deck-share-2026-11-09.json
  (tools/bal32/deck_share_2026_11_09.js, all decks pooled).
Merge: one rule under two keys gets one price: Venomous = Poison, Puncture = Breach, Sabotage = Arson.

Usage: python3 tools/bal32/reprice_2026_11_09.py [--apply]
  -> docs/balance/bal32/reprice-2026-11-09.{json,md}; --apply writes canonical/skill-costs.json (old entry fields kept in bal32Was)."""
import json, math, sys, os
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..')
P = lambda *a: os.path.join(ROOT, *a)
J = lambda f: json.load(open(P(f), encoding='utf-8'))
ONHIT = J('docs/balance/bal31/onhit-2026-11-08.json')
TABLE = J('canonical/skill-costs.json')
LIVE = {e['id']: e for e in TABLE['skills']}
GAINS = J('docs/balance/bal32/enabler-gains-2026-11-09.json') if os.path.exists(P('docs/balance/bal32/enabler-gains-2026-11-09.json')) else {'rows': []}
SHARE = J('docs/balance/bal32/deck-share-2026-11-09.json')['partners']
r2 = lambda v: round(v + 0.0, 2)
r05 = lambda v: round(round(v * 20) / 20, 2)
STATUS = {'freeze', 'sleep', 'stagger', 'blind', 'confuse', 'paralyze', 'shock', 'tipsy'}
ENABLERS = {'brittle', 'hemorrhage', 'disarm', 'detonate', 'pulverise', 'expose', 'web', 'pry'}
SKIP = {'shock': 'priced by its 4-round logic (bramblewood-budget.js shockS), not the table value',
        'sap': 'Leech N is priced perN (ENG35); no card prints a number; plain Leech within its interval'}
MERGE = {'venomous': 'poison', 'puncture': 'breach', 'sabotage': 'arson'}
KEYS = ('scale', 'value', 'pow', 'perN', 'plus')


def fit_curve(pts):  # value x N^pow through (n, y): log least squares, as tools/bal29/reprice_2026_11_08.js
    sg = 1 if sum(y for _, y in pts) >= 0 else -1
    q = [(n, y) for n, y in pts if y * sg > 0.01]
    if len(q) < 2:
        return {'value': r2(q[0][1]) if q else 0, 'pow': 0}
    xs = [math.log(n) for n, _ in q]; ys = [math.log(y * sg) for _, y in q]
    mx = sum(xs) / len(xs); my = sum(ys) / len(ys)
    sxy = sum((x - mx) * (y - my) for x, y in zip(xs, ys)); sxx = sum((x - mx) ** 2 for x in xs)
    pw = sxy / sxx if sxx else 0
    return {'value': r2(sg * math.exp(my - pw * mx)), 'pow': round(pw, 3)}


def price_of(e, n):  # the table's price for a number n (tools/skill_costs.js skillCost, numbered / on cases)
    v = float(e.get('value') or 0)
    if e.get('perN') is not None and isinstance(n, (int, float)) and not isinstance(n, bool) and n > 0:
        return r2(e['perN'] * n)
    N = 1 if n is True else n
    if e.get('scale') == 'n':
        return r2(v * N ** e['pow']) if e.get('pow') is not None else r2(v * N)
    if e.get('scale') == 'half':
        return r2(v * (1 + (N // 2 if N > 1 else 0)))
    if e.get('plus') and n is not True:
        return None
    return r2(v)


def reading(r):
    out = []
    for p in r['points']:
        L1, L5 = p.get('L1'), p.get('L5')
        if not L1 or not L5:
            continue
        a, b = L1['mean'], L5['mean']
        y = r2((a['m'] + b['m']) / 2)
        price = p['price']
        under = a['lo'] > price and b['lo'] > price
        over = a['hi'] < price and b['hi'] < price
        out.append({'n': p['n'], 'price': price, 'y': y, 'lo': r2((a['lo'] + b['lo']) / 2), 'hi': r2((a['hi'] + b['hi']) / 2),
                    'best': r2((L1['best']['m'] + L5['best']['m']) / 2), 'under': under, 'over': over})
    return out


rows, new = [], {}
for r in ONHIT['riders']:
    k = r['key']; e = LIVE.get(k)
    if not e or k in ENABLERS:
        continue
    rd = reading(r)
    off = [p for p in rd if p['under'] or p['over']]
    row = {'id': k, 'points': rd, 'old': {kk: e[kk] for kk in KEYS if kk in e}, 'status': k in STATUS}
    if k in SKIP:
        row['kept'] = SKIP[k]; rows.append(row); continue
    if k in MERGE:
        row['mergeWith'] = MERGE[k]
    if not off and k not in MERGE:
        row['kept'] = 'the table is inside both levels\' 95% interval of the mean at every N'; rows.append(row); continue
    if len(rd) == 1 and rd[0]['n'] is True:
        ent = {'scale': 'fixed', 'value': r05(rd[0]['y'])}; row['shape'] = 'on'
    elif k in STATUS:
        y2 = next(p['y'] for p in rd if p['n'] == 2)
        ent = {'scale': 'fixed', 'value': r2(y2)}; row['shape'] = 'status: flat at duration 2, chance 50'
    else:
        ys = {p['n']: p['y'] for p in rd}
        if ys[1] > 0 and ys[3] < 1.2 * ys[1]:
            ent = {'scale': 'fixed', 'value': r2(sum(ys.values()) / len(ys))}; row['shape'] = 'flat in N'
        else:
            f = fit_curve([(p['n'], p['y']) for p in rd]); ent = {'scale': 'n', 'value': f['value'], 'pow': f['pow']}; row['shape'] = 'value x N^pow'
    row['why'] = ', '.join(f"N {p['n']}: {p['price']} {'under' if p['under'] else 'over'} {p['y']} [{p['lo']}, {p['hi']}]" for p in off) or 'merge'
    row['new'] = ent; new[k] = ent; rows.append(row)

# merges: one price for one rule. Poison is the canon and inside its interval, so Venomous takes Poison's price; Breach / Arson are
# re-priced above and Puncture / Sabotage take theirs (Arson and Sabotage measure the same: the fixed value is the mean of the two).
for k, m in MERGE.items():
    if m not in new:
        new[k] = {kk: LIVE[m][kk] for kk in ('scale', 'value', 'pow') if kk in LIVE[m]}
    else:
        if k == 'sabotage':
            ra = next(x for x in rows if x['id'] == 'arson'); rs = next(x for x in rows if x['id'] == 'sabotage')
            v = r2((ra['new']['value'] + sum(p['y'] for p in rs['points']) / len(rs['points'])) / 2) if ra['new']['scale'] == 'fixed' else None
            if v is not None:
                new['arson'] = dict(ra['new'], value=v); ra['new'] = new['arson']
        new[k] = dict(new[m])
    rk = next((x for x in rows if x['id'] == k), None)
    if rk is not None:
        rk['new'] = new[k]; rk.pop('kept', None); rk['why'] = (rk.get('why') or '') + f' (merged: the same rule as {m})'

# BAL31-3: enablers
G = {}
for g in GAINS.get('rows', []):
    G.setdefault(g['id'], []).append(g)
PARTNER = {  # enabler -> [(partner key in deck-share, the gain row ctx to use)]
    'brittle': [('shatter', 'global')], 'hemorrhage': [('bleed', 'bleed')], 'detonate': [('poison', 'global')],
    'pry': [('armor', 'armor')], 'pulverise': [('armor', 'armor')], 'web': [('dodge', 'dodge')], 'disarm': [('equipment', None)], 'expose': [],
}
EST = {'disarm': (2.0, 'not measurable on the bench (it fields no equipment): SK2b\'s estimate of its worth against an equipment deck, 2')}
enablers = []
for k, parts in PARTNER.items():
    e = LIVE[k]; terms = []
    for pk, ctx in parts:
        sh = SHARE[pk]['all']['share']
        if ctx is None:
            gain, src = EST[k]
            terms.append({'partner': pk, 'gain': gain, 'gainFrom': src, 'share': sh, 'term': r2(gain * sh)})
            continue
        g = next((x for x in G.get(k, []) if x['ctx'] == ctx), None)
        if not g:
            terms.append({'partner': pk, 'gain': None, 'share': sh, 'term': None, 'gainFrom': 'not measured yet'}); continue
        terms.append({'partner': pk, 'gain': g['gain'], 'gainCI': [g['gainLo'], g['gainHi']], 'gainFrom': g['label'], 'share': sh, 'term': r2(max(0, g['gain']) * sh),
                      'other': [{'label': x['label'], 'gain': x['gain']} for x in G.get(k, []) if x is not g]})
    row = {'id': k, 'old': {kk: e[kk] for kk in KEYS if kk in e}, 'terms': terms}
    if k == 'expose':
        row['kept'] = ('its partner is any hit on the Exposed target (every deck: share 1), so its gain with the partner is its single worth, '
                       'about 0 (onhit mean -0.03 / 0.01 / 0.03 at N 1-3); the table\'s 0.09 is inside that interval; kept')
    elif all(t['term'] is not None for t in terms):
        v = r2(sum(t['term'] for t in terms))
        ent = {kk: e[kk] for kk in ('scale', 'plus') if kk in e}
        ent['value'] = v
        if e.get('scale') == 'n' and e.get('pow') is not None:
            ent['pow'] = e['pow']
        if k == 'brittle':  # measured at Brittle 2 (the one card prints 2): one flat price, not half-scale per N
            ent['scale'] = 'fixed'
        row['new'] = ent; new[k] = ent
    else:
        row['kept'] = 'gain not measured yet'
    enablers.append(row)

changes = []
for k, ent in new.items():
    e = LIVE[k]; old = {kk: e[kk] for kk in KEYS if kk in e}
    if all(old.get(kk) == ent.get(kk) for kk in ('scale', 'value', 'pow')) and not ({'pow'} & (set(old) - set(ent)) and old.get('scale') == 'n' and ent.get('scale') == 'n'):
        continue
    at = {}
    for n in (True, 1, 2, 3):
        a = price_of(old, n); b = price_of(dict(ent, **({'plus': old['plus']} if 'plus' in old else {})), n)
        at[str(n)] = [a, b]
    changes.append({'id': k, 'old': old, 'new': ent, 'at': at})

out = {'_about': 'BAL32 (2026-11-09): the owner\'s BAL31-1/2/3 answers applied. Prices in 3A + H points, the mean over bodies (BAL29).',
       'onhitInput': {'file': 'docs/balance/bal31/onhit-2026-11-08.json', 'games': ONHIT['games'], 'fingerprint': ONHIT['fingerprint'], 'bodies': {k: v['bodies'] for k, v in ONHIT['levels'].items()}},
       'riders': rows, 'enablers': enablers, 'changes': changes}
json.dump(out, open(P('docs/balance/bal32/reprice-2026-11-09.json'), 'w', encoding='utf-8'), indent=1, ensure_ascii=False)


def fmt(e):
    if not e:
        return '-'
    s = e.get('scale'); v = e.get('value')
    t = f"{s} {v}" + (f" ^{e['pow']}" if e.get('pow') is not None and s == 'n' else '') + (f" perN {e['perN']}" if e.get('perN') is not None else '') + (f" + {e['plus']} N" if e.get('plus') else '')
    return t


for c in changes:
    print(f"{c['id']:14} {fmt(c['old']):28} -> {fmt(c['new']):24} N1 {c['at']['1'][0]} -> {c['at']['1'][1]}  N2 {c['at']['2'][0]} -> {c['at']['2'][1]}  N3 {c['at']['3'][0]} -> {c['at']['3'][1]}")
print(len(changes), 'changed')
for row in enablers:
    print('ENABLER', row['id'], [(t['partner'], t['gain'], t['share'], t['term']) for t in row['terms']], row.get('new') or row.get('kept'))

def disp(e, n, status):  # the price a card pays: a status rider printed as {chance, duration} pays the table value whatever N
    return price_of(dict(e, scale='fixed') if status and e.get('scale') != 'n' else e, n)


L = ['# Skill re-price, 2026-11-09 (package BAL32)', '',
     'The owner\'s BAL31 answers (docs/decisions.json BAL31-1/2/3, 2026-11-09 03:55) applied to `canonical/skill-costs.json` (old values in `bal32Was`). '
     'Built by `python3 tools/bal32/reprice_2026_11_09.py`; data in `reprice-2026-11-09.json`. Prices are in 3A + H points, the mean over bodies averaged over Levels 1 and 5 (BAL29\'s unit). No card stat changed.', '',
     f"**Input (BAL31-2):** `docs/balance/bal31/onhit-2026-11-08.json`: {ONHIT['games']} paired fights a variant, three bodies a level "
     f"(L1 {ONHIT['levels']['L1']['bodies']}, L5 {ONHIT['levels']['L5']['bodies']}), fingerprint `{ONHIT['fingerprint']}`. "
     'Note: the file on the batch says 400 fights and three bodies (its 11-09 04:18 commit re-rendered the table prices; it is not the 800-fight all-bodies run).', '',
     '**Rule.** y(N) = the mean over L1 and L5 of the mean-over-bodies worth. A rider is re-priced when its table price is outside both levels\' 95% interval at some N (BAL29\'s test). '
     'Flat (y(3) < 1.2 y(1)): one fixed price, the mean of y. Otherwise value x N^pow fitted through y. On/off riders: fixed at y. '
     'Status riders printed as {chance, duration}: the table charges them its value whatever the object, so one flat value, y at duration 2 (chance 50).', '',
     '**What the mean says about damage over time.** On the mean-over-bodies unit, Poison and Bleed are fairly priced (inside their intervals), Breach and Perforate are under-priced (raised), '
     'and Decay, Desecrate, Toxin, Wither, Greater Poison and Strangle are over-priced at N 2-3 (the half-scale table doubles them; the worth grows about N^0.3-0.7). '
     'The "1.5-3x under" in the BAL31 report compared the table with the best body, a unit about 1.7x the table\'s (BAL29).', '',
     '## Price changes', '', '| Skill | Cards (all) | Old | New | Old -> new at N 1 / 2 / 3 (on) | Why |', '|---|---|---|---|---|---|']
CARDS = J('canonical/cards.json')
def ncards(k):
    return sum(1 for c in CARDS if k in (c.get('effects') or {}) and not c.get('test'))
for c in sorted(changes, key=lambda c: c['id']):
    rk = next((x for x in rows if x['id'] == c['id']), None); en = next((x for x in enablers if x['id'] == c['id']), None); st = c['id'] in STATUS
    if (rk and rk['points'] and rk['points'][0]['n'] is True) or c['old'].get('scale') == 'fixed' and c['new'].get('scale') == 'fixed':
        at = f"{disp(c['old'], True, st)} -> {disp(c['new'], True, st)}"
    else:
        at = ' / '.join(f"{disp(c['old'], n, st)} -> {disp(c['new'], n, st)}" for n in (1, 2, 3))
    why = ('enabler: ' + ' + '.join(f"{t['partner']} gain {t['gain']} x share {t['share']}" for t in en['terms'])) if en else ((rk.get('shape') or '') + '; ' + (rk.get('why') or ''))
    L.append(f"| {c['id']} | {ncards(c['id'])} | {fmt(c['old'])} | {fmt(c['new'])} | {at} | {why} |")
L += ['', '## Enablers (BAL31-3): gain with the partner x the partner\'s deck share', '',
      'Gain: `docs/balance/bal32/enabler-gains-2026-11-09.json` (`tools/bal32/enablers_2026_11_09.js`, the BAL31 on-hit bench, 400 fights, mean over bodies, L1/L5). '
      'Share: `docs/balance/bal32/deck-share-2026-11-09.json` (`tools/bal32/deck_share_2026_11_09.js`): the share of Maps 0-20 decks holding the partner, pooled over the road fight decks, '
      'the reference decks (Map reference + the per-map reference sets) and the PRO / BPRO skirmish decks.', '',
      '| Enabler | Partner | Gain with partner (95%) | How measured | Deck share (road / ref / skirmish / all) | Price | Old |', '|---|---|---|---|---|---|---|']
for row in enablers:
    for t in row['terms'] or [{'partner': '(every deck)', 'gain': None, 'share': 1, 'term': None, 'gainFrom': row.get('kept', '')}]:
        sh = SHARE.get(t['partner'])
        shs = f"{sh['road']['share']} / {sh['reference']['share']} / {sh['skirmish']['share']} / **{sh['all']['share']}**" if sh else '1'
        ci = f" [{t['gainCI'][0]}, {t['gainCI'][1]}]" if t.get('gainCI') else ''
        L.append(f"| {row['id']} | {t['partner']} | {t['gain']}{ci} | {t.get('gainFrom', '')} | {shs} | {fmt(row['new']) if row.get('new') else 'kept'} | {fmt(row['old'])} |")
L += ['', 'One partner each, so each price is a single term (no sum needed). Pulverise and Pry share the Armor partner; Pulverise also breaks Structures and equipment (not counted: both are rare on Maps 0-20).', '',
      '## Kept (inside the interval at every N, or not priced by the table value)', '']
for row in rows:
    if 'new' not in row:
        L.append(f"- {row['id']}: {row.get('kept')}")
L.append('')
open(P('docs/balance/bal32/reprice-2026-11-09.md'), 'w', encoding='utf-8').write('\n'.join(L) + '\n')

if '--apply' in sys.argv:
    TAG = ('2026-11-09 (package BAL32, owner BAL31-1/2/3 03:55): {}')
    lines = open(P('canonical/skill-costs.json'), encoding='utf-8').read().split('\n'); outl = []
    by = {c['id']: c for c in changes}
    section = None
    for line in lines:
        s = line.rstrip(',')
        if line.startswith(' "') and not line.startswith('  '):  # a top-level key: only the "skills" list is re-priced (actions share ids: Strangle, Disarm ...)
            section = line.split('"')[1]
        if section == 'skills' and (s.startswith('  {"id":"') or s.startswith('  {"id": "')):
            try:
                e = json.loads(s)
            except Exception:
                e = None
            if e and e['id'] in by:
                c = by[e['id']]; old = {kk: e[kk] for kk in ('scale', 'value', 'pow') if kk in e}
                ne = {'id': e['id'], **{kk: c['new'][kk] for kk in ('scale', 'value', 'pow') if kk in c['new']}}
                for kk, vv in e.items():
                    if kk in ('id', 'scale', 'value', 'pow', 'bal32', 'bal32Was'):
                        continue
                    ne[kk] = vv
                rk = next((x for x in rows if x['id'] == e['id']), None); en = next((x for x in enablers if x['id'] == e['id']), None)
                if en:
                    why = 'enabler: ' + ' + '.join(f"{t['partner']} gain {t['gain']} x deck share {t['share']}" for t in en['terms']) + ' (docs/balance/bal32/reprice-2026-11-09.md)'
                else:
                    why = 'on-hit rider at the mean over bodies (BAL31 on-hit measure, ' + (rk.get('shape') or '') + '): ' + (rk.get('why') or '')
                ne['bal32'] = TAG.format(why)
                ne['bal32Was'] = old
                outl.append('  ' + json.dumps(ne, ensure_ascii=False, separators=(',', ':')) + (',' if line.endswith(',') else ''))
                continue
        outl.append(line)
    open(P('canonical/skill-costs.json'), 'w', encoding='utf-8').write('\n'.join(outl))
    print('applied', len(by))
