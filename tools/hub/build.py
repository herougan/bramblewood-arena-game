#!/usr/bin/env python3
"""One command that builds and checks the Master Hub (2026-11-07, package HUB3; owner: the hub should be maintainable by any agent).

    python3 tools/hub/build.py                 build .hub/, splice the guide docs, check it
    python3 tools/hub/build.py --check-only    only check the existing .hub/index.html
    python3 tools/hub/build.py --refresh-guide <published index.html>
                                               after a build: save the guide docs this build lacks (project-only docs, see below)
                                               from a published copy into tools/hub/guide-snapshot.html
    python3 tools/hub/build.py --no-shots      skip the Playwright check (size and file count are still checked)

Steps: (1) tools/hub/build_hub.py writes .hub/ (HUB_URL defaults to the published hub so links to the hub become tab links);
(2) the guide splice: Claude's guide tab shows docs that live only in the claude.ai Project ("claude/<doc>.md"). When this checkout has no
    .guide-src/ for them, their rendered pages come from tools/hub/guide-snapshot.html (committed, refreshed with --refresh-guide);
(3) the check: index.html under 16 MB, file count under the artifact cap, every tab renders text and throws no page error.
Publishing is not done here: the coordinator publishes .hub/ with the Artifact tool (docs/workflows/release.md, hub section)."""
import os, re, subprocess, sys, tempfile

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
OUT = os.path.join(ROOT, '.hub'); INDEX = os.path.join(OUT, 'index.html')
SNAP = os.path.join(ROOT, 'tools', 'hub', 'guide-snapshot.html')
HUB_URL = 'https://claude.ai/artifact/45sGJuWwy9T6ocC1D4K99J'
LIMIT = 16 * 1024 * 1024; MAX_FILES = 495
TABS = ['master', 'actions', 'cards', 'balance', 'ctable', 'mapcards', 'decisions', 'guide', 'changelog', 'doclib']
GUIDE_HEAD = '<h2>The docs</h2><p class="note">Snapshots of the project docs at build time. The project copy is the source of truth. Pick one in the table above.</p>'
SUB = '<div class="subpane" data-group="guide" id="doc-'

def split_chunks(s, start):
    """The guide's subpanes in s from `start`: {id: (begin, end)}; the last one ends where its div closes."""
    body = s[start:]; st = [m.start() for m in re.finditer(re.escape(SUB), body)]; out = {}
    for i, k in enumerate(st):
        cid = re.match(re.escape(SUB) + r'([^"]+)"', body[k:]).group(1)
        if i + 1 < len(st): e = start + st[i + 1]
        else:
            depth = 0; e = None
            for m in re.finditer(r'<div\b|</div>', body[k:]):
                depth += 1 if m.group(0) != '</div>' else -1
                if depth == 0: e = start + k + m.end(); break
        out['doc-' + cid] = (start + k, e)
    return out

def guide_region(s):
    return s.index(GUIDE_HEAD) + len(GUIDE_HEAD)

def splice_guide():
    if not os.path.exists(SNAP): print('guide splice: no snapshot, skipped'); return
    new = open(INDEX, encoding='utf-8').read(); snap = open(SNAP, encoding='utf-8').read()
    have = split_chunks(new, guide_region(new)); snc = split_chunks(snap, 0)
    missing = [k for k in snc if k not in have]
    add = ''.join(snap[snc[k][0]:snc[k][1]] for k in missing)
    first = min(v[0] for v in have.values())
    open(INDEX, 'w', encoding='utf-8').write(new[:first] + add + new[first:])
    print('guide splice: added', [k[4:] for k in missing])

def refresh_guide(published):
    run_build_hub()  # a fresh build without the splice, so only the docs this checkout cannot render are saved
    new = open(INDEX, encoding='utf-8').read(); old = open(published, encoding='utf-8').read()
    have = split_chunks(new, guide_region(new)); oc = split_chunks(old, guide_region(old))
    miss = [k for k in oc if k not in have]
    open(SNAP, 'w', encoding='utf-8').write(''.join(old[oc[k][0]:oc[k][1]] for k in miss))
    print('guide snapshot saved:', [k[4:] for k in miss], os.path.getsize(SNAP), 'bytes')

CHECK_JS = '''(tab)=>{ const p = document.querySelector('#p-' + tab); return p ? p.innerText.length : -1; }'''
def check(shots=True):
    ok = True; size = os.path.getsize(INDEX)
    nfiles = sum(len(fs) for _, _, fs in os.walk(OUT))
    big = sorted(((os.path.getsize(os.path.join(dp, f)), os.path.relpath(os.path.join(dp, f), OUT)) for dp, _, fs in os.walk(OUT) for f in fs), reverse=True)[:3]
    print(f'check: index.html {size / 1048576:.2f} MB (limit 16 MB), {nfiles} files (cap {MAX_FILES}); largest files: ' + ', '.join(f'{n} {b / 1048576:.1f} MB' for b, n in big))
    if size >= LIMIT: print('FAIL: index.html is over 16 MB'); ok = False
    if nfiles > MAX_FILES: print('FAIL: too many files'); ok = False
    if shots:
        from playwright.sync_api import sync_playwright
        with sync_playwright() as p:
            b = p.chromium.launch(); errs = []
            for tab in TABS:
                pg = b.new_page(viewport={'width': 1366, 'height': 900}); pg.on('pageerror', lambda e, t=tab: errs.append(f'{t}: {e}'))
                pg.goto('file://' + INDEX + '#' + tab); pg.wait_for_timeout(1500)
                n = pg.evaluate(CHECK_JS, tab); print(f'  tab {tab}: {n} chars')
                if n <= 0: ok = False
                pg.close()
            b.close()
        if errs: print('FAIL: page errors', errs[:4]); ok = False
    print('hub check:', 'ok' if ok else 'FAILED'); return ok

def run_build_hub():
    env = dict(os.environ); env.setdefault('HUB_URL', HUB_URL); env['PYTHONHASHSEED'] = '0'  # fixed hash seed: set order, and so the page, is the same every build (diffable)
    return subprocess.run([sys.executable, os.path.join(ROOT, 'tools', 'hub', 'build_hub.py')], env=env, cwd=ROOT).returncode

def main(a):
    if '--check-only' in a: return 0 if check('--no-shots' not in a) else 1
    if '--refresh-guide' in a: refresh_guide(a[a.index('--refresh-guide') + 1]); return 0
    dm = os.path.join(ROOT, 'docs', 'decisions.md'); before = open(dm, 'rb').read() if os.path.exists(dm) else b''
    r = run_build_hub()
    if r: return r
    if (open(dm, 'rb').read() if os.path.exists(dm) else b'') != before:
        # build_hub.py regenerates docs/decisions.md from decisions.json after it has already read the old one for Claude's guide tab: build again
        print('docs/decisions.md was regenerated; building again so the guide tab shows it'); r = run_build_hub()
        if r: return r
    splice_guide()
    return 0 if check('--no-shots' not in a) else 1

if __name__ == '__main__': sys.exit(main(sys.argv[1:]))
