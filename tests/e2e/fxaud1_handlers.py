#!/usr/bin/env python3
"""FXAUD1: for the keys the probe found silent, does any client line that names the kind / type also call a sound (SoundKit / snd( / Tone / chime)?
Prints keys where no such line exists (strong candidates for a missing cue) and keys with one (probably a cue on a paired event or a later beat)."""
import csv, os, re, glob
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
rows = list(csv.DictReader(open(os.path.join(ROOT, 'docs/perf/fxaud1/coverage-table.tsv')), delimiter='\t'))
lines = []
for f in ['arena_app.js'] + sorted(glob.glob(os.path.join(ROOT, 'bramblewood-*.js'))):
    f = f if os.path.isabs(f) else os.path.join(ROOT, f)
    if f.endswith('bramblewood-engine.js') or f.endswith('bramblewood-texts.js'): continue
    lines += [(os.path.basename(f), i + 1, l) for i, l in enumerate(open(f, errors='ignore').read().split('\n'))]
SND = re.compile(r"SoundKit|\bsnd\(|\bsfx\(|Tone\(|Chime\(|playCue|\bcue\(")
no, yes = [], []
for r in rows:
    if r['sound'] == 'S' or r['from'] != 'sample': continue
    k = r['key'].split('|'); w = k[1] if k[0] == 'statusFx' and len(k) > 1 else k[0]
    pat = re.compile(r"['\"]" + re.escape(w) + r"['\"]")
    hits = [(f, n, l) for f, n, l in lines if pat.search(l)]
    withsnd = [h for h in hits if SND.search(h[2])]
    (yes if withsnd else no).append((r['key'], len(hits), [f'{h[0]}:{h[1]}' for h in withsnd[:2]]))
print('NO sound call on any line naming it:'); [print(' ', x[0], 'lines:', x[1]) for x in no]
print('\nsome line naming it also calls a sound (check the beat):'); [print(' ', x) for x in yes]
