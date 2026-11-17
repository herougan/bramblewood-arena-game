#!/usr/bin/env python3
# SKAUD1 (2026-11-17): the owner's Skills sheet (docs/design/owner-proposal-2026-11-17.xlsx) as out/skills.json, for keys.js and plan.py.
import openpyxl, json, os
H = os.path.dirname(os.path.abspath(__file__))
wb = openpyxl.load_workbook(H + '/../../docs/design/owner-proposal-2026-11-17.xlsx', data_only=True)
rows = [r for r in wb['Skills'].iter_rows(values_only=True) if any(c is not None for c in r)]
json.dump([dict(zip(rows[0], r)) for r in rows[1:]], open(H + '/out/skills.json', 'w'), default=str, indent=0)
