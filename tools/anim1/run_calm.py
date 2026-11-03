#!/usr/bin/env python3
"""ANIM1 (2026-11-03): runs the frame recorder one process at a time for Effects Low and reduced motion at 390 then 1366 (the shared machine times out when they run side by side)."""
import subprocess, os, sys
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
ONLY = 'leader|hit-physical|death|remember|bloom|brood|field-wind'
for w, mode in (('390', 'low'), ('390', 'rm'), ('1366', 'low'), ('1366', 'rm')):
    log = open(os.path.join(ROOT, 'tests', 'out', 'anim1', 'logs', f'{w}-{mode}.log'), 'w')
    subprocess.run([sys.executable, os.path.join(ROOT, 'tools', 'anim1', 'anim1_frames.py'), '--width', w, '--mode', mode, '--only', ONLY], stdout=log, stderr=subprocess.STDOUT, env=dict(os.environ, ANIM1_S='10'))
