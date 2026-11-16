import openpyxl, json, sys
wb = openpyxl.load_workbook(sys.argv[1], data_only=True)
ws = wb['Skills']
out = []
for r in ws.iter_rows(min_row=2, values_only=True):
    if not r[0]: continue
    ii = r[9]
    note = None
    if isinstance(ii, str):
        note = ii[1:].strip(' ()') if len(ii) > 1 else None
        ii = int(ii[0])
    elif isinstance(ii, float):
        ii = int(ii)
    out.append({'name': r[0], 'key': r[1], 'ii': ii, 'iiNote': note, 'k': None if r[10] is None else str(r[10]), 'cards': r[7], 'tip': r[8] or (r[11] or '')[:200]})
json.dump(out, open(sys.argv[2], 'w'), indent=0, ensure_ascii=False)
print(len(out), sum(1 for x in out if x['ii']))
