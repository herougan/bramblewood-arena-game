# Field-level 3-way merge of canonical/cards.json (2026-10-21, workflow audit). Run during an open merge.
# Per card (by id) and per top-level field: a field changed on one side only takes that side (including removals); both sides
# making the same change is fine; both changing it differently is a real conflict, listed, and the file is left untouched.
# Card order follows ours; cards only theirs added are appended in their order. Writes the file in its usual format
# (indent 2, ASCII escapes), so an unchanged card stays byte-identical.
import json, subprocess, sys
P = 'canonical/cards.json'
def show(ref):
    return json.loads(subprocess.check_output(['git', 'show', f'{ref}:{P}']))
mb = subprocess.check_output(['git', 'merge-base', 'HEAD', 'MERGE_HEAD']).decode().strip()
base, ours, theirs = show(mb), show('HEAD'), show('MERGE_HEAD')
B = {c['id']: c for c in base}; T = {c['id']: c for c in theirs}; O = {c['id']: c for c in ours}
MISSING = object()
conflicts, out = [], []
def merge_card(cid, b, o, t):
    if t is None:  # removed on their side
        return None if b is not None and o == b else o
    if b is None and o is not None and o != t:
        conflicts.append(f'{cid}: added on both sides with different data'); return o
    r = {}
    for k in list(o.keys()) + [k for k in t.keys() if k not in o]:
        bv, ov, tv = b.get(k, MISSING), o.get(k, MISSING), t.get(k, MISSING)
        if ov == tv: v = ov
        elif ov == bv: v = tv
        elif tv == bv: v = ov
        else: conflicts.append(f'{cid}.{k}'); v = ov
        if v is not MISSING: r[k] = v
    return r
for c in ours:
    m = merge_card(c['id'], B.get(c['id']), c, T.get(c['id']))
    if m is not None: out.append(m)
for c in theirs:
    if c['id'] not in O and c['id'] not in B: out.append(c)
if conflicts:
    print('merge_cards: real conflicts, resolve by hand:\n  ' + '\n  '.join(conflicts[:30])); sys.exit(1)
open(P, 'w', encoding='utf-8').write(json.dumps(out, indent=2, ensure_ascii=True) + '\n')
print(f'merge_cards: {len(out)} cards merged field by field')
