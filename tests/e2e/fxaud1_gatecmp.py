#!/usr/bin/env python3
"""FXAUD1: compare the full event pass at Effects High (probe-1x.json) with Effects None (probe-fxnone.json) and with the tab hidden (probe-hidden.json):
events that still build many nodes / tweens where they should not, and events whose cue is lost (None) or still plays (hidden)."""
import json, os
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
L = lambda f: json.load(open(os.path.join(ROOT, 'docs/perf/fxaud1', f)))['events']
H, N, X = L('probe-1x.json'), L('probe-fxnone.json'), L('probe-hidden.json')
idle = lambda E: max(v['added'] for k, v in E.items() if k.startswith('__idle'))
iN, iX = idle(N), idle(X)
print('idle node adds: none', iN, 'hidden', iX)
def rows(E, base, thr, label):
    out = []
    for k, v in E.items():
        if k.startswith('__') or 'added' not in v or k not in H or 'added' not in H[k]: continue
        if v['added'] - base >= thr and H[k]['added'] > 0: out.append((v['added'], H[k]['added'], v['peakGs'], k))
    out.sort(reverse=True); print(f'\n{label}: events still adding >= {thr} nodes (nodes here, nodes at High, tweens here)'); [print('  ', r) for r in out]
    return out
rows(N, iN, 15, 'EFFECTS NONE')
rows(X, iX, 15, 'TAB HIDDEN')
lost = [k for k, v in N.items() if not k.startswith('__') and 'snd' in v and k in H and (H[k]['snd'] or H[k]['osc'] + H[k]['src'] > 15) and not v['snd'] and v['osc'] + v['src'] <= 15]
print('\ncue at High but none at Effects None:', lost)
snd_h = [k for k, v in X.items() if not k.startswith('__') and 'snd' in v and v['osc'] + v['src'] > 0]
print('\naudio nodes created while hidden:', [(k, X[k]['osc'] + X[k]['src']) for k in snd_h][:30])
