#!/usr/bin/env python3
# One-off (2026-10-12, user: "reorder the maps to the 0-20 tiering"): rearranges CONQUEST_MAPS into the road from
# docs/card-list-2026-10-11.md section 5, with Clovermead kept as Map 1 (D44), and rewrites each main map's unlockAfter.
import re, sys
ORDER = ['m1','mq','mf','mu','mp','mb','mc','m2','mw','mk','m8','m4','m10','mh','mr','ml','mt','m6','m5','md','m9','m11','m3','m7']
p = 'arena_app.js'; s = open(p).read()
i = s.find('const CONQUEST_MAPS = ['); j = s.find('\n];', i)
head_end = s.find('\n', i) + 1
body = s[head_end:j]
starts = [m.start() for m in re.finditer(r'(?m)^  \{\s*id:\s*"', body)]
# pull leading comment/blank lines into the entry they precede
def lead(k):
    a = starts[k]
    while True:
        prev = body.rfind('\n', 0, a - 1)
        line = body[prev+1:a-1] if prev >= 0 else body[:a-1]
        if line.strip().startswith('//') or line.strip() == '':
            if prev < 0: return 0
            if k > 0 and prev + 1 <= starts[k-1]: return a
            a = prev + 1
        else: return a
cuts = [lead(k) for k in range(len(starts))]
pre = body[:cuts[0]]
ents = [body[cuts[k]:(cuts[k+1] if k+1 < len(cuts) else len(body))] for k in range(len(cuts))]
ids = [re.search(r'id:\s*"([a-z0-9]+)"', e).group(1) for e in ents]
byid = dict(zip(ids, ents))
rest = [x for x in ids if x not in ORDER]
assert all(x in byid for x in ORDER), [x for x in ORDER if x not in byid]
mains_rest = [x for x in rest if x.startswith('r')]; subs = [x for x in rest if not x.startswith('r')]
new_ids = ORDER + mains_rest + subs
out = []
prev = None
for x in new_ids:
    e = byid[x]
    if not e.endswith('\n'): e += '\n'
    is_sub = re.search(r'\bsub:\s*true', e.split('nodes')[0]) is not None
    if not is_sub:
        e = re.sub(r'\s*unlockAfter:\s*"[a-z0-9]+",', '', e, count=1)
        if prev is not None:
            e = re.sub(r'(\{\s*id:\s*"%s",)' % x, r'\1 unlockAfter:"%s",' % prev, e, count=1)
        prev = x
    out.append(e)
s = s[:head_end] + pre + ''.join(out).rstrip('\n') + s[j:]
open(p, 'w').write(s)
print('order:', ' '.join(new_ids))
