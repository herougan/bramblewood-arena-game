#!/usr/bin/env python3
# 2026-11-20 (package SKM1): the 2026-11-07 workbook's per-card power figures (docs/owner-input/skills-2026-11-20.xlsx, sheet
# "Cards Maps 0-20") as JSON for the registry's workbook cross-sections: docs/balance/skm/workbook-cards-2026-11-07.json.
import json, os, openpyxl
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..')
cards = json.load(open(os.path.join(ROOT, 'canonical', 'cards.json')))
lst = cards if isinstance(cards, list) else (cards.get('cards') or list(cards.values()))
by = {}
for c in lst:
    if isinstance(c, dict) and c.get('name') and c.get('id'): by.setdefault(c['name'], c['id'])
wb = openpyxl.load_workbook(os.path.join(ROOT, 'docs', 'owner-input', 'skills-2026-11-20.xlsx'), data_only=True)
ws = wb['Cards Maps 0-20']; rows = list(ws.iter_rows(values_only=True)); h = rows[0]
col = {k: h.index(k) for k in ('Card', 'Power', 'Power for budget', 'Basic win %', 'Advanced win %')}
num = lambda v: float(str(v).rstrip('%')) if v not in (None, '') and str(v).rstrip('%').replace('.', '', 1).lstrip('-').isdigit() else None
out = []
for r in rows[1:]:
    n = r[col['Card']]
    if not n or n not in by: continue
    out.append({'id': by[n], 'name': n, 'power': num(r[col['Power']]), 'powerForBudget': num(r[col['Power for budget']]), 'basic': num(r[col['Basic win %']]), 'advanced': num(r[col['Advanced win %']])})
p = os.path.join(ROOT, 'docs', 'balance', 'skm', 'workbook-cards-2026-11-07.json')
json.dump(out, open(p, 'w'), indent=0)
print(len(out), 'cards ->', p, '| with basic', sum(1 for x in out if x['basic'] is not None), 'power', sum(1 for x in out if x['power'] is not None))
