#!/usr/bin/env python3
"""UI-text translation coverage (2026-10-18, package I3: after I1/I2 the packs covered every TX() text and card name, but about
1,100 fixed text nodes, 400 titles/labels, every NPC line, errand, card flavour line and most skill labels stayed English).

The page translator (bramblewood-i18n.js) swaps any text node or title/aria-label/placeholder/data-tip whose English is a pack key,
and keys with {placeholders} match as templates. So most of the UI translates without code changes once its English is a key.
This tool harvests that English:

  * arena_app.js: the player-facing runs of every string and template literal (tools/text/textlib.py, the same extractor the
    game-texts spreadsheet uses), each ${...} turned into {v1}, {v2}... ({s} for an English plural ending such as
    ${n === 1 ? '' : 's'}, which a translation may drop). Text between tags is one text node on the page, so a run is cut at
    every tag; <br> splits it into lines. A run with an inline tag inside (<b>, <i>, <small>...) reaches the page in pieces that
    no whole-sentence key can match: those are listed (--split), not harvested. So is a run with a markup-valued ${...} (an icon,
    a chip) in the middle; one at either end is cut off. Admin / dev screens (admin editors, the test kit, the effects lab: the
    textlib "Admin / dev" area and anything inside ${adminModeEnabled ? ...}) and anything under translate="no" are skipped.
  * canonical/cards.json: the flavour line of every player-visible card (test cards excluded, as in tools/i18n_cards.py).

Keys are what the translator looks up: leading emoji/symbols and a trailing colon peeled (runtime_core). A key already in a pack
(exactly, or the same text with differently named placeholders) needs nothing. Translations live in lang/ui/<code>.json, merged
into the built pack by assemble_arena.py (the main pack and lang/cards win on a clash).

    python3 tools/i18n_ui.py              # coverage per language, by kind (text / attr / dialogue / errand / skill / flavour)
    python3 tools/i18n_ui.py --missing de # list what a language is missing
    python3 tools/i18n_ui.py --dump F     # write the harvest (key, kind, where) to F as JSON
    python3 tools/i18n_ui.py --split [N]  # the top N texts split by inline tags (need TX() to translate)
    python3 tools/i18n_ui.py --write      # drop keys from lang/ui/<code>.json that the source no longer has or a pack already has

Exits 1 when a lang/ui file has a key that isn't in the harvest or a translation that loses a placeholder.
"""
import glob, html, json, os, re, sys, unicodedata
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(ROOT, 'tools', 'text'))
import textlib as T  # noqa: E402

CODES = ['de', 'fr', 'es', 'ja', 'zh-Hans', 'it', 'pt', 'ko', 'zh-Hant', 'id', 'tl', 'ta']
CACHE = os.path.join(__import__('tempfile').gettempdir(), 'bramblewood_i18n_ui_cache.json')   # the harvest, keyed by the sources' size+mtime (the lexer takes ~10 s)
INLINE = {'b', 'i', 'em', 'strong', 'small', 'u', 's', 'sub', 'sup', 'kbd', 'code', 'mark', 'q', 'abbr', 'wbr'}
LEAD_EXTRA = set(' ️‍↻→←▸▾•·★☆✓✕✗⚡')
# A ${...} that puts markup on the page (an icon, a chip, a badge, a list of rows) rather than words
MARKUP = re.compile(r'HTML\b|HTML\(|Html\((?<!escapeHtml\()|\bicon(?:HTML|Img|Html)\b|[Bb]adge|[Cc]hip|[Pp]ill\b|Svg|SVG|\.join\(|\.map\(|avatar|portrait|Portrait|spark|bar\(|meter\(')
PLURAL_EXPR = re.compile(r'''^\s*\(?[^?]*\?\s*(['"`])(s|es|ies|y|ren|)\1\s*:\s*(['"`])(s|es|ies|y|ren|)\3\s*\)?\s*$''')
DIALOGUE_SCOPES = {'DIALOGUES', 'DIALOGUE_SPEAKERS', 'maybeOfferErrand', 'AFK_LINES', 'afkLineFor'}
ERRAND_SCOPES = {'ERRAND_TEMPLATES', 'errandsBoardHTML'}
# Admin / dev screens textlib's area rules don't name: the card reference (admin Codex tab), the simulator (admin Deck tab), the
# card workbench, the map layout editor, the skirmish editor, the trigger editor rows, the test kit and the test rules panel.
ADMIN_SCOPES = {'referenceHTML', 'renderSim', 'runSimulation', 'renderSimResults', 'renderPowerResults', 'simDeckColHTML', 'renderSimPools',
                'updateSimDeckSummary', 'openCardWorkbench', 'openMapEditsList', 'mapLayoutToolbarHTML', 'mapEditList',
                'skirmishFxAddOptionsHTML', 'actionFieldsHTML', 'triggerRowHTML', 'openTkMenu', 'TEST_RULE_DEFS', 'testRulesPanelHTML',
                'grantPickerHTML', 'packPoolOptionsHTML', 'codexPlacementHTML', 'wireCodexPlacement', 'openSkirmishGallery',
                'LOOP_PRESETS', 'TRIGGER_FAMILIES'}
SKILL_SCOPES = {'PASSIVE_DEFS', 'TRIGGER_DEFS', 'ACTION_DEFS', 'SKILL_DEFS', 'STATUS_KEYWORDS', 'KEYWORD_TERMS', 'KEYWORD_RESOURCES',
                'SKILL_TEXT', 'EVERGREEN_DEFS', 'HERO_SKILLS'}


# Hand-added keys: CPU_AI_LABEL's words inside the VS screen's "🧠 {v1} CPU" pill, and the raid's merged castle "<your bramble> & Co."
EXTRA = {'Basic': 'text', 'Smart': 'text', 'Smartest': 'text', '{v1} & Co.': 'text'}
# 2026-10-18 (I3): the owner words the battle log drops into "{v1} bramble" / "on {v2} board" ('your' / 'Your' / 'the enemy');
# the translator looks a captured value up as a key, so each language words them to fit its own "<owner> bramble" template
EXTRA.update({'your': 'text', 'Your': 'text', 'the enemy': 'text'})


def runtime_core(s):
    """What bramblewood-i18n.js looks up when the exact text isn't a key: no leading emoji/symbols, no trailing spaces or colon."""
    t = s.strip(); i = 0
    while i < len(t) and (t[i].isspace() or t[i] in LEAD_EXTRA or unicodedata.category(t[i]) in ('So', 'Sk') or 0x1F000 <= ord(t[i]) <= 0x1FAFF): i += 1
    return t[i:].rstrip(' \t\n:')


def shape(k):
    """A key with its placeholders unnamed, to see that 'Floor {n}' and 'Floor {v1}' are the same text."""
    return re.sub(r'\{\w+\}', '{}', k)


def is_markup(expr):
    if re.search(r'`[^`]*<[a-zA-Z/]', expr): return True          # a nested template with tags in it
    if re.search(r'''['"]<[a-zA-Z/]''', expr): return True
    e = re.sub(r'escape(?:Html|Attr)\(', '(', expr)
    return bool(MARKUP.search(e))


def in_no_translate(masked_before):
    """Is the end of this stretch of HTML inside an element with translate="no"? (open tags counted back to front)"""
    if 'translate="no"' not in masked_before and "translate='no'" not in masked_before: return False
    depth = 0
    for m in reversed(list(re.finditer(r'<(/?)([a-zA-Z][\w-]*)([^>]*)>', masked_before))):
        if m.group(3).rstrip().endswith('/') or m.group(2).lower() in ('br', 'img', 'input', 'hr', 'meta', 'link', 'wbr'): continue
        if m.group(1): depth += 1; continue
        if depth: depth -= 1; continue
        if re.search(r'''translate=["']no["']''', m.group(3)): return True
    return False


def run_pieces(run):
    """(pieces, split_reason): the keys one run reaches the page as, or why it can't be matched whole."""
    text, exprs = run.text, run.exprs
    if run.html or run.attr: text = html.unescape(text)
    # markup-valued placeholders: cut off at the ends, a split in the middle
    kinds = {}
    for k, e in enumerate(exprs, 1):
        kinds[k] = 'markup' if (not run.attr and is_markup(e)) else ('plural' if PLURAL_EXPR.match(e) or re.fullmatch(r'\s*s\d?\s*', e) else 'value')
    lines = re.split(r'\s*<br\s*/?>\s*', text) if not run.attr else [text]
    lettered = lambda p: re.search(r'[^\W\d_]{2,}', re.sub(r'\{\d+\}', '', p))
    def edges(line):   # markup placeholders at both ends are cut off
        while True:
            m = re.match(r'^\s*\{(\d+)\}', line)
            if m and kinds.get(int(m.group(1))) == 'markup': line = line[m.end():]; continue
            m = re.search(r'\{(\d+)\}\s*$', line)
            if m and kinds.get(int(m.group(1))) == 'markup': line = line[:m.start()]; continue
            return line.strip()
    segs = []
    for line in lines:
        line = edges(line)
        if not line: continue
        parts = [edges(p) for p in re.split(r'<[^>]*>', line)]
        parts = [p for p in parts if p and lettered(p)]
        if len(parts) > 1:
            # one exception: "Label<small>a line of help</small>", two separate phrases
            m = re.match(r'^([^<]*)<small\b[^>]*>([^<]*)</small>$', line)
            if not m: return [], 'inline tag' if re.search(r'<(?:/?)(?:%s)\b' % '|'.join(INLINE), line, re.I) else 'tag'
        segs.extend(parts)
    out = []
    for line in segs:
        mids = [int(x) for x in re.findall(r'\{(\d+)\}', line) if kinds.get(int(x)) == 'markup']
        if mids: return [], 'markup value'
        # renumber: {1} -> {v1}, plural endings -> {s}
        n, ps, names = 0, 0, {}
        def ren(m):
            nonlocal n, ps
            k = int(m.group(1))
            if k not in names:
                if kinds.get(k) == 'plural':
                    ps += 1; names[k] = 's' if ps == 1 else 's%d' % ps
                else:
                    n += 1; names[k] = 'v%d' % n
            return '{%s}' % names[k]
        key = runtime_core(re.sub(r'\{(\d+)\}', ren, line))
        if not re.search(r'[^\W\d_]{2,}', re.sub(r'\{\w+\}', '', key)): continue
        if re.search(r'\b[a-z-]+="|url\(|^--', key): continue      # a stray attribute ('disabled title="..."'): its title is a run of its own
        out.append(key)
    return out, None


def _src_stamp():
    files = ['arena_app.js', 'canonical/cards.json', 'tools/text/textlib.py', 'tools/i18n_ui.py']
    return '|'.join('%s:%d:%d' % (f, os.path.getsize(os.path.join(ROOT, f)), int(os.path.getmtime(os.path.join(ROOT, f)))) for f in files)


def harvest(use_cache=True):
    """{key: {kind, where}} and the split list [(text, reason, where)]."""
    stamp = _src_stamp()
    if use_cache and os.path.exists(CACHE):
        try:
            c = json.load(open(CACHE, encoding='utf-8'))
            if c.get('stamp') == stamp: return c['keys'], c['split']
        except Exception: pass
    keys, split = {}, []
    rel = 'arena_app.js'
    src = T.read(rel)
    lits, _ = T.lex(src)
    scopes = T.Scopes(src, T.lex.ranges)
    for L in lits:
        for run in T.literal_runs(src, L):
            if not T.is_player_text(run, src): continue
            chain = scopes.chain_at(run.start) or ['(top)']
            if T.area_for(chain) == 'Admin / dev' or T.is_admin_context(src, L) or ADMIN_SCOPES & set(chain): continue
            if run.html and in_no_translate(src[L.start:run.start]): continue
            outer = chain[-1]
            kind = ('dialogue' if outer in DIALOGUE_SCOPES else 'errand' if outer in ERRAND_SCOPES else
                    'skill' if outer in SKILL_SCOPES else 'attr' if run.attr else 'text')
            where = '%s:%d %s' % (rel, scopes.line_at(run.start), scopes.where_at(run.start))
            pieces, why = run_pieces(run)
            if why:
                split.append([run.text, why, where]); continue
            for k in pieces:
                if k not in keys: keys[k] = {'kind': kind, 'where': where}
    # values the extractor can't see as text: one-word labels from a lookup table and a name suffix (2026-10-18, coordinator list)
    for k, kd in EXTRA.items():
        if k not in keys: keys[k] = {'kind': kd, 'where': 'tools/i18n_ui.py EXTRA'}
    cards = json.load(open(os.path.join(ROOT, 'canonical', 'cards.json'), encoding='utf-8'))
    for c in cards:
        f = (c.get('flavor') or '').strip()
        if c.get('test') or not f or '<' in f: continue
        k = runtime_core(f)
        if k and k not in keys: keys[k] = {'kind': 'flavour', 'where': 'canonical/cards.json ' + c['id']}
    try:
        json.dump({'stamp': stamp, 'keys': keys, 'split': split}, open(CACHE, 'w', encoding='utf-8'), ensure_ascii=False)
    except Exception: pass
    return keys, split


def load(rel):
    p = os.path.join(ROOT, rel)
    return json.load(open(p, encoding='utf-8')) if os.path.exists(p) else {}


def base_pack(code):
    """What the language has without lang/ui: main pack + card names."""
    b = dict(load('lang/cards/%s.json' % code)); b.update(load('lang/%s.json' % code)); return b


def needed(keys, base):
    """The harvested keys a pack doesn't cover yet (exactly, or as the same template with other placeholder names)."""
    shapes = {shape(k) for k in base}
    return [k for k in keys if k not in base and shape(k) not in shapes]


def placeholder_problems(key, value):
    kp, vp = set(re.findall(r'\{\w+\}', key)), set(re.findall(r'\{\w+\}', value))
    optional = {p for p in kp if re.match(r'^\{s\d*\}$', p)}
    out = []
    if kp - vp - optional: out.append('missing ' + ' '.join(sorted(kp - vp - optional)))
    if vp - kp: out.append('unknown ' + ' '.join(sorted(vp - kp)))
    for run in re.findall(r'(?:\{\w+\}){2,}', key):
        kept = ''.join(p for p in re.findall(r'\{\w+\}', run) if p in vp)
        if kept.count('{') > 1 and kept not in value: out.append('split ' + run)
    return out


def coverage(keys=None):
    """{code: {kind: (covered, total)}} plus problems [(code, key, msg)]."""
    if keys is None: keys, _ = harvest()
    kinds = sorted({v['kind'] for v in keys.values()})
    res, problems = {}, []
    for code in CODES:
        base, ui = base_pack(code), load('lang/ui/%s.json' % code)
        merged = dict(ui); merged.update(base)
        shapes = {shape(k) for k in merged}
        row = {}
        for kd in kinds + ['all']:
            ks = [k for k, v in keys.items() if kd == 'all' or v['kind'] == kd]
            row[kd] = (sum(1 for k in ks if k in merged or shape(k) in shapes), len(ks))
        res[code] = row
        for k, v in ui.items():
            if k not in keys: problems.append((code, k, 'not in the source'))
            elif not isinstance(v, str) or not v.strip(): problems.append((code, k, 'empty'))
            else:
                for p in placeholder_problems(k, v): problems.append((code, k, p))
    return res, problems, kinds


def main(argv):
    keys, split = harvest('--fresh' not in argv)
    if '--dump' in argv:
        out = argv[argv.index('--dump') + 1]
        json.dump(keys, open(out, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
        print('wrote %d keys to %s' % (len(keys), out)); return 0
    if '--split' in argv:
        i = argv.index('--split'); n = int(argv[i + 1]) if len(argv) > i + 1 and argv[i + 1].isdigit() else 40
        seen, rows = set(), []
        for text, why, where in split:
            t = re.sub(r'\s+', ' ', text)
            if t in seen: continue
            seen.add(t); rows.append((len(re.sub(r'<[^>]*>|\{\d+\}', '', t)), t, why, where))
        rows.sort(key=lambda r: -r[0])
        print('%d texts reach the page in pieces (inline tags / markup values); the %d longest:' % (len(rows), min(n, len(rows))))
        for _, t, why, where in rows[:n]: print('  [%s] %s\n      %s' % (why, t[:160], where))
        return 0
    if '--missing' in argv:
        code = argv[argv.index('--missing') + 1]
        base = base_pack(code); base.update({k: v for k, v in load('lang/ui/%s.json' % code).items() if k not in base})
        for k in needed(keys, base): print('%-8s %s' % (keys[k]['kind'], k))
        return 0
    if '--write' in argv:
        for code in CODES:
            p = os.path.join(ROOT, 'lang', 'ui', code + '.json')
            if not os.path.exists(p): continue
            ui, base = load('lang/ui/%s.json' % code), base_pack(code)
            keep = {k: v for k, v in ui.items() if k in keys and k not in base}
            if len(keep) != len(ui):
                with open(p, 'w', encoding='utf-8') as fh:
                    json.dump(dict(sorted(keep.items(), key=lambda kv: kv[0].lower())), fh, ensure_ascii=False, indent=1); fh.write('\n')
                print('%s: dropped %d' % (code, len(ui) - len(keep)))
    res, problems, kinds = coverage(keys)
    print('UI texts harvested: %d (%s); %d more reach the page split by inline tags (--split)\n' % (
        len(keys), ', '.join('%s %d' % (kd, sum(1 for v in keys.values() if v['kind'] == kd)) for kd in kinds), len(split)))
    print('%-8s ' % 'lang' + ' '.join('%13s' % kd for kd in kinds + ['all']))
    for code in CODES:
        print('%-8s ' % code + ' '.join('%6d/%-6d' % res[code][kd] for kd in kinds + ['all']))
    for code, k, msg in problems[:50]: print('  ! lang/ui/%s.json: %s: %r' % (code, msg, k[:80]))
    return 1 if problems else 0


if __name__ == '__main__':
    sys.exit(main(sys.argv[1:]))
