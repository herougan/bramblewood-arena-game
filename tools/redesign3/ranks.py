# REDESIGN3 (2026-11-17): the owner's II rank and comment per skill key from the Skills sheet. python3 -I ranks.py <owner xlsx> <out.json>
import json, re, sys
from openpyxl import load_workbook

ws = load_workbook(sys.argv[1], read_only=True)['Skills']
KEY = {'demolisher': 'siege', 'acidBolt': 'acid', 'deliveryRes': 'delivery', 'fireArrow': 'arrowFlaming', 'brambleArmor': 'brambleArmor'}
out = {}
for r in list(ws.iter_rows(values_only=True))[1:]:
    if not r[0] or not r[1]:
        continue
    k = KEY.get(r[1], r[1])
    m = re.match(r'\s*(\d+)', str(r[9])) if r[9] is not None else None
    ii = int(m.group(1)) if m else None
    if k in out and out[k]['ii'] is not None:
        continue
    out[k] = {'name': r[0], 'ii': ii, 'comment': None if r[10] is None else str(r[10]), 'tip': r[8] or ''}
json.dump(out, open(sys.argv[2], 'w'), indent=1)
print(len(out), sum(1 for v in out.values() if v['ii']))
