#!/usr/bin/env python3
"""Round-trip check for the game-text pipeline (2026-10-15). Run by tests/game-texts.js.

Copies the sources to a temp folder, exports the sheet, writes a marked New text into EVERY row (keyed and src:), imports it
there, and checks that each new text is what the game now has, that nothing was skipped, and that the scripts still parse.
A second import of an untouched sheet must change nothing. The real files are never written.
"""
import os, re, shutil, subprocess, sys, tempfile
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import textlib as T
import export_texts as E
import import_texts as I

fails = []
def ok(cond, msg):
    if not cond: fails.append(msg); print('  ✗', msg)


def main():
    tmp = tempfile.mkdtemp(prefix='bw-texts-')
    try:
        for rel in T.SOURCES + [T.TEXTS_JS]:
            shutil.copy(os.path.join(T.ROOT, rel), os.path.join(tmp, rel))
        rows = E.collect(tmp)
        ok(len(rows) > 1000, 'the export has rows (%d)' % len(rows))
        keys = [r['key'] for r in rows]
        ok(len(keys) == len(set(keys)), 'keys are unique')
        # 1. an untouched sheet (New text = Current text) changes nothing
        same = [{'row': i, 'key': r['key'], 'current': r['text'], 'new': r['text']} for i, r in enumerate(rows)]
        before = {rel: open(os.path.join(tmp, rel), encoding='utf-8').read() for rel in T.SOURCES + [T.TEXTS_JS]}
        rep = I.apply(same, tmp)
        ok(not rep['applied'] and not rep['skipped'], 'New text = Current text: nothing applied or skipped (%d applied, %d skipped)' % (len(rep['applied']), len(rep['skipped'])))
        for rel, txt in before.items():
            ok(open(os.path.join(tmp, rel), encoding='utf-8').read() == txt, '%s untouched by a no-op import' % rel)
        # 2. every row edited at once ("~" plus a quote and an apostrophe, the characters that need escaping)
        mark = lambda t: t + ' ~"q\'s'
        edited = [{'row': i, 'key': r['key'], 'current': r['text'], 'new': mark(r['text'])} for i, r in enumerate(rows)]
        rep = I.apply(edited, tmp)
        # rows nested inside another row's {n} part need a second pass
        passes = 1
        while rep['skipped'] and passes < 4 and all('run the import again' in why for _, why in rep['skipped']):
            again = [r for r, _ in rep['skipped']]
            rep = I.apply(again, tmp); passes += 1
        for r, why in rep['skipped'][:15]:
            ok(False, 'row skipped: %s: %s' % (r['key'], why))
        after = E.collect(tmp)
        have = {x['text'] for x in after}
        missing = [r for r in edited if r['new'] not in have and r['new'].replace('"', '&quot;') not in have]
        for r in missing[:15]:
            ok(False, 'after import the game does not show: %r (%s)' % (r['new'][:80], r['key']))
        ok(not missing, '%d of %d edited texts found again after the import (%d pass%s)' % (len(edited) - len(missing), len(edited), passes, '' if passes == 1 else 'es'))
        # 3. the edited scripts still parse
        for rel in ['arena_app.js', T.TEXTS_JS]:
            res = subprocess.run(['node', '-e', 'new (require("vm").Script)(require("fs").readFileSync(process.argv[1], "utf8"))', os.path.join(tmp, rel)], capture_output=True, text=True)
            ok(res.returncode == 0, '%s still parses after the import %s' % (rel, res.stderr[:300]))
    finally:
        shutil.rmtree(tmp, ignore_errors=True)
    print('game-texts round trip: %s' % ('%d failure(s)' % len(fails) if fails else 'all passed'))
    sys.exit(1 if fails else 0)


if __name__ == '__main__':
    main()
