#!/usr/bin/env python3
# 2026-11-08 (package BAL31): how much of the pair interactions a per-skill term explains. I(a,b) ~ c + u_a + u_b (ridge, lambda 1), fitted
# on the pairs; reports the variance left against the sampling noise, the share within ±1 after the fit (in-sample and leave-one-out), the
# share within ±1 for the common-skill block (phase 3) and by kind pair.
import json, os, sys
import numpy as np
R = os.path.join(os.path.dirname(__file__), '..', '..')
d = json.load(open(os.path.join(R, 'docs', 'balance', 'bal31', 'additivity-2026-11-08.json')))
P = d['pairs']; keys = sorted({p['a']['key'] for p in P} | {p['b']['key'] for p in P}); ix = {k: i for i, k in enumerate(keys)}
y = np.array([p['I']['m'] for p in P]); se = np.array([p['se'] for p in P]); n, m = len(P), len(keys)
X = np.zeros((n, m + 1)); X[:, 0] = 1
for r, p in enumerate(P): X[r, 1 + ix[p['a']['key']]] = 1; X[r, 1 + ix[p['b']['key']]] = 1
def fit(X, y, lam=1.0):
    A = X.T @ X + lam * np.diag([0] + [1] * (X.shape[1] - 1)); return np.linalg.solve(A, X.T @ y)
b = fit(X, y); res = y - X @ b
loo = np.zeros(n)
for r in range(n):
    msk = np.arange(n) != r; bb = fit(X[msk], y[msk]); loo[r] = y[r] - X[r] @ bb
print(f'pairs {n}, skills {m}; noise var {np.mean(se**2):.3f}')
print(f'raw: var {np.var(y):.3f}, within±1 {np.mean(abs(y) <= 1):.2f}')
print(f'flat c only: c {np.mean(y):.2f}, var {np.var(y - y.mean()):.3f}, within±1 {np.mean(abs(y - y.mean()) <= 1):.2f}')
print(f'c + per-skill u: in-sample var {np.var(res):.3f} within±1 {np.mean(abs(res) <= 1):.2f}; leave-one-out var {np.var(loo):.3f} within±1 {np.mean(abs(loo) <= 1):.2f}')
u = sorted(((b[1 + i], k) for k, i in ix.items()), reverse=True)
print('largest per-skill terms:', ', '.join(f'{k} {v:+.2f}' for v, k in u[:8]), '| lowest:', ', '.join(f'{k} {v:+.2f}' for v, k in u[-8:]))
ph3 = np.array([p['phase'] == 3 for p in P])
print(f'phase 3 (common skills): {ph3.sum()} pairs, within±1 {np.mean(abs(y[ph3]) <= 1):.2f}, mean {y[ph3].mean():.2f}, sd {y[ph3].std():.2f}')
kind = {s['key']: s['kind'] for s in d['skills']}; by = {}
for p, v in zip(P, y): kk = '+'.join(sorted([kind[p['a']['key']], kind[p['b']['key']]])); by.setdefault(kk, []).append(v)
for kk, v in sorted(by.items()): print(f'  {kk}: {len(v)} pairs, mean {np.mean(v):+.2f}, mean|I| {np.mean(np.abs(v)):.2f}, within±1 {np.mean(np.abs(np.array(v)) <= 1):.2f}')
