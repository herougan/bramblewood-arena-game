"""Shared code for the game-text pipeline (2026-10-15, user: "Regarding text in game, is there a way you can offload it into a
excel so I can edit the text from there? easier for both of us").

  export_texts.py  -> docs/game-texts.xlsx   (every player-facing English string, one row each)
  import_texts.py  <- the edited xlsx         (applies the "New text" column back to the game)
  keyify.py        (one-off) moves toasts, dialogs, coach/tutorial tips and results texts into bramblewood-texts.js

Two kinds of rows:
  * keyed  -- the text lives in the TEXT table in bramblewood-texts.js and the code calls TX('key'). An edit is one table value.
  * src:*  -- the text is still a literal in arena_app.js / arena_template.html. The importer finds it again by its key
              (function + text hash) and rewrites that literal in place, only when it is found exactly as exported.

This module has: a small JavaScript lexer (strings, templates with ${...}, comments, regex literals), the extractor that turns
literals into editable "runs" of text, and the helpers that write a run back.
"""
import hashlib, json, os, re

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
TEXTS_JS = 'bramblewood-texts.js'
SOURCES = ['arena_app.js', 'arena_template.html']
TABLE_START, TABLE_END = '/*TEXT-TABLE-START*/', '/*TEXT-TABLE-END*/'

# ------------------------------------------------------------------------------------------------------------------------
# Lexer
# ------------------------------------------------------------------------------------------------------------------------
REGEX_AFTER = set('( , = : [ ! & | ? { } ; + - * % < > ~ ^ =>'.split()) | {'return', 'typeof', 'case', 'do', 'else', 'in', 'of',
                                                                           'new', 'delete', 'void', 'throw', 'instanceof', 'yield', 'await', None}
KEYWORDS = {'if', 'for', 'while', 'switch', 'catch', 'function', 'return', 'typeof', 'case', 'do', 'else', 'in', 'of', 'new',
            'delete', 'void', 'throw', 'instanceof', 'yield', 'await', 'const', 'let', 'var'}
PUNCT3 = ['===', '!==', '...', '**=', '<<=', '>>=', '>>>', '&&=', '||=', '??=']
PUNCT2 = ['=>', '==', '!=', '<=', '>=', '&&', '||', '??', '?.', '++', '--', '+=', '-=', '*=', '/=', '%=', '&=', '|=', '^=', '<<', '>>', '**']
ID_RE = re.compile(r'[A-Za-z_$\u00c0-\uffff][\w$\u00c0-\uffff]*')
NUM_RE = re.compile(r'(?:0[xXbBoO][0-9a-fA-F_]+|(?:\d[\d_]*\.?\d*|\.\d+)(?:[eE][+-]?\d+)?)n?')


class Lit:
    """One string or template literal. parts: [('s', start, end) | ('e', start, end)] in source offsets; for an expression
    part, start/end cover what sits between '${' and '}'."""
    __slots__ = ('kind', 'start', 'end', 'parts', 'parent', 'parent_expr', 'prev', 'next', 'callee', 'calls', 'key', 'assign', 'tok_index')

    def __init__(self, kind, start):
        self.kind, self.start, self.end, self.parts = kind, start, None, []
        self.parent = self.parent_expr = None
        self.prev, self.next, self.callee, self.calls, self.key, self.assign, self.tok_index = [], None, None, [], None, None, None

    def raw(self, src):
        return src[self.start:self.end]


def lex(src):
    """Returns (literals, tokens). tokens: list of (type, text, start, end) for code tokens (strings appear as type 'str')."""
    lits, toks = [], []
    stack = []      # ('(' | '[' | '{', callee, name, start) or ('${', lit, part)
    i, n = 0, len(src)
    ranges = []     # (start, end, name) of named function bodies and top-level const initialisers
    fn_next = [None]

    def name_for_open(c):
        # function NAME(...){   |   const NAME = {  /  [   |   const NAME = (...)=>{   |   const NAME = x=>{
        if c == '{' and fn_next[0] and toks and toks[-1][1] == ')':
            nm = fn_next[0]; fn_next[0] = None; return nm
        fn_next[0] = None
        if c in '{[' and len(toks) >= 3 and toks[-1][1] == '=' and toks[-2][0] == 'id' and toks[-3][1] in ('const', 'let', 'var'):
            return toks[-2][1]
        if c == '{' and toks and toks[-1][1] == '=>':
            k = len(toks) - 2
            if k >= 0 and toks[k][1] == ')':
                depth = 0
                while k >= 0:
                    if toks[k][1] == ')': depth += 1
                    elif toks[k][1] == '(':
                        depth -= 1
                        if depth == 0: break
                    k -= 1
                k -= 1
            else:
                k -= 1
            if k >= 0 and toks[k][1] == 'async': k -= 1
            if k >= 2 and toks[k][1] == '=' and toks[k - 1][0] == 'id' and toks[k - 2][1] in ('const', 'let', 'var'):
                return toks[k - 1][1]
        return None

    def prev_sig():
        return toks[-1][1] if toks else None

    def callee_before():
        # identifier chain right before '(' : a.b.c
        k = len(toks) - 1
        if k < 0 or toks[k][0] != 'id':
            return toks[k][1] if k >= 0 and toks[k][1] in KEYWORDS else None
        parts = [toks[k][1]]
        k -= 1
        while k >= 1 and toks[k][1] in ('.', '?.') and toks[k - 1][0] == 'id':
            parts.insert(0, toks[k - 1][1]); k -= 2
        return '.'.join(parts)

    def start_literal(kind, at):
        L = Lit(kind, at)
        L.prev = [t[1] for t in toks[-4:]]
        for fr in reversed(stack):
            if fr[0] == '${':
                L.parent, L.parent_expr = fr[1], fr[2]
                break
        top = stack[-1] if stack else None
        L.calls = [fr[1] for fr in reversed(stack) if fr[0] == '(' ][:3]
        if top and top[0] == '(':
            L.callee = top[1]
        # object key:  key: 'x'
        if len(toks) >= 2 and toks[-1][1] == ':' and toks[-2][0] in ('id', 'str'):
            L.key = toks[-2][1].strip('\'"')
        # assignment target: a.b.title = 'x'
        if toks and toks[-1][1] in ('=', '+=') and len(toks) >= 2 and toks[-2][0] == 'id':
            L.assign = toks[-2][1]
        L.tok_index = len(toks)
        lits.append(L)
        return L

    def scan_template_body(L, j):
        """Scan a template body from j; returns (j, done). Stops at the closing ` (done) or at '${' (pushes)."""
        s0 = j
        while j < n:
            c = src[j]
            if c == '\\':
                j += 2; continue
            if c == '`':
                if j > s0: L.parts.append(('s', s0, j))
                L.end = j + 1
                return j + 1, True
            if c == '$' and j + 1 < n and src[j + 1] == '{':
                if j > s0: L.parts.append(('s', s0, j))
                part = ['e', j + 2, None]
                stack.append(('${', L, part))
                return j + 2, False
            j += 1
        raise ValueError('unterminated template at %d' % L.start)

    while i < n:
        c = src[i]
        if c in ' \t\r\n\ufeff\u00a0':
            i += 1; continue
        if c == '/' and i + 1 < n and src[i + 1] == '/':
            j = src.find('\n', i); i = n if j < 0 else j; continue
        if c == '/' and i + 1 < n and src[i + 1] == '*':
            j = src.find('*/', i + 2); i = n if j < 0 else j + 2; continue
        if c in '\'"':
            L = start_literal('q', i)
            j = i + 1
            while j < n and src[j] != c:
                if src[j] == '\\': j += 1
                elif src[j] == '\n': raise ValueError('newline in string at %d' % i)
                j += 1
            L.parts.append(('s', i + 1, j)); L.end = j + 1
            toks.append(('str', src[i:j + 1], i, j + 1))
            i = j + 1; continue
        if c == '`':
            L = start_literal('t', i)
            i, done = scan_template_body(L, i + 1)
            if done: toks.append(('str', src[L.start:L.end], L.start, L.end))
            else: toks.append(('punct', '${', i - 2, i))
            continue
        if c == '/':
            p = prev_sig()
            ptype = toks[-1][0] if toks else None
            if p in REGEX_AFTER or (ptype == 'id' and p in KEYWORDS) or (ptype == 'punct' and p not in (')', ']', '}')):
                j, cls = i + 1, False
                while j < n:
                    d = src[j]
                    if d == '\\': j += 2; continue
                    if d == '\n': raise ValueError('newline in regex at %d' % i)
                    if cls:
                        if d == ']': cls = False
                    elif d == '[': cls = True
                    elif d == '/': break
                    j += 1
                j += 1
                while j < n and (src[j].isalnum() or src[j] == '_'): j += 1
                toks.append(('regex', src[i:j], i, j)); i = j; continue
        m = ID_RE.match(src, i)
        if m:
            toks.append(('id', m.group(0), i, m.end())); i = m.end(); continue
        if c.isdigit() or (c == '.' and i + 1 < n and src[i + 1].isdigit()):
            m = NUM_RE.match(src, i)
            toks.append(('num', m.group(0), i, m.end())); i = m.end(); continue
        if c in '([{':
            callee = callee_before() if c == '(' else None
            name = name_for_open(c)
            if c == '(' and len(toks) >= 2 and toks[-1][0] == 'id' and toks[-2][1] == 'function':
                name = '(fn)' + toks[-1][1]
            toks.append(('punct', c, i, i + 1)); stack.append((c, callee, name, i)); i += 1; continue
        if c in ')]}':
            if c == '}' and stack and stack[-1][0] == '${':
                _, L, part = stack.pop()
                part[2] = i
                L.parts.append(('e', part[1], part[2]))
                i, done = scan_template_body(L, i + 1)
                if done:
                    toks.append(('str', src[L.start:L.end], L.start, L.end))
                continue
            if stack:
                fr = stack.pop()
                if fr[2]:
                    if fr[2].startswith('(fn)'): fn_next[0] = fr[2][4:]
                    else: ranges.append((fr[3], i + 1, fr[2]))
            toks.append(('punct', c, i, i + 1)); i += 1; continue
        for P in (PUNCT3, PUNCT2):
            hit = next((p for p in P if src.startswith(p, i)), None)
            if hit: break
        if not hit:
            if src.startswith('>>>=', i): hit = '>>>='
            else: hit = c
        toks.append(('punct', hit, i, i + len(hit))); i += len(hit)
    if stack:
        raise ValueError('unbalanced brackets at end: %r' % (stack[-3:],))
    # next significant token after each literal
    starts = {t[2]: k for k, t in enumerate(toks)}
    for L in lits:
        k = starts.get(L.start)
        if k is not None and k + 1 < len(toks):
            L.next = toks[k + 1][1]
    lex.ranges = sorted(ranges)
    return lits, toks


# ------------------------------------------------------------------------------------------------------------------------
# Escapes
# ------------------------------------------------------------------------------------------------------------------------
ESC = {'n': '\n', 't': '\t', 'r': '\r', 'b': '\b', 'f': '\f', 'v': '\v', '0': '\0'}


def js_unescape(raw):
    out, i = [], 0
    while i < len(raw):
        c = raw[i]
        if c != '\\':
            out.append(c); i += 1; continue
        d = raw[i + 1] if i + 1 < len(raw) else ''
        if d in ESC and not (d == '0' and i + 2 < len(raw) and raw[i + 2].isdigit()):
            out.append(ESC[d]); i += 2
        elif d == 'u' and i + 2 < len(raw) and raw[i + 2] == '{':
            j = raw.index('}', i); out.append(chr(int(raw[i + 3:j], 16))); i = j + 1
        elif d == 'u':
            out.append(chr(int(raw[i + 2:i + 6], 16))); i += 6
        elif d == 'x':
            out.append(chr(int(raw[i + 2:i + 4], 16))); i += 4
        elif d == '\n':
            i += 2
        else:
            out.append(d); i += 2
    return ''.join(out)


def js_escape(text, quote):
    """Escape display text for a literal of the given quote (' " or `)."""
    s = text.replace('\\', '\\\\')
    if quote == '`':
        s = s.replace('`', '\\`').replace('${', '\\${')
    else:
        s = s.replace(quote, '\\' + quote).replace('\n', '\\n').replace('\r', '')
    return s


# ------------------------------------------------------------------------------------------------------------------------
# Runs: the editable pieces of text inside a literal
# ------------------------------------------------------------------------------------------------------------------------
INLINE_TAGS = {'b', 'i', 'em', 'strong', 'small', 'br', 'u', 's', 'sub', 'sup', 'kbd', 'code', 'mark', 'wbr', 'q', 'abbr'}
SKIP_CONTENT_TAGS = {'style', 'script', 'svg', 'textarea', 'select', 'option'}
TEXT_ATTRS = {'title', 'aria-label', 'placeholder', 'alt', 'data-tip', 'data-tooltip', 'data-hint'}
SENT = '\x00'


class Run:
    __slots__ = ('lit', 'start', 'end', 'text', 'exprs', 'html', 'attr', 'whole')

    def __init__(self, lit, start, end, text, exprs, html, attr, whole):
        self.lit, self.start, self.end, self.text, self.exprs, self.html, self.attr, self.whole = lit, start, end, text, exprs, html, attr, whole


def literal_runs(src, L):
    """Split a literal into runs of text. Each run: source range [start,end) inside the literal, display text with {1}..{n}
    for the ${...} parts, and the raw expressions."""
    quote = src[L.start]
    M, mp = [], []           # masked chars and, for each, (src_start, src_end)
    for kind, a, b in L.parts:
        if kind == 's':
            for k in range(a, b):
                M.append(src[k]); mp.append((k, k + 1))
        else:
            M.append(SENT); mp.append((a - 2, b + 1))
    M = ''.join(M)
    runs, i, n = [], 0, len(M)
    has_html = bool(re.search(r'<(?:/?[A-Za-z][\w-]*)(?:[\s>/' + SENT + r']|$)', M))
    cur = None

    def close(end_i):
        nonlocal cur
        if cur is not None and end_i > cur:
            runs.append((cur, end_i, False))
        cur = None

    while i < n:
        ch = M[i]
        if ch == '<' and M.startswith('<!--', i):
            close(i)                                       # an HTML comment: developer notes, not player text
            j = M.find('-->', i + 4)
            i = n if j < 0 else j + 3
            continue
        if ch == '<' and has_html and i + 1 < n and (M[i + 1].isalpha() or M[i + 1] in '/!'):
            # a tag: find its end, skipping quoted attribute values
            j, q = i + 1, None
            while j < n:
                if q:
                    if M[j] == q: q = None
                elif M[j] in '"\'': q = M[j]
                elif M[j] == '>': break
                j += 1
            tag = M[i:j + 1]
            mname = re.match(r'</?\s*([A-Za-z][\w-]*)', tag)
            name = mname.group(1).lower() if mname else '!'
            if name in INLINE_TAGS and not tag.startswith('<!'):
                if cur is None: cur = i
                i = j + 1; continue
            close(i)
            # text attributes inside the tag
            for am in re.finditer(r'\s([a-zA-Z-]+)\s*=\s*"([^"]*)"', tag):
                if am.group(1).lower() in TEXT_ATTRS:
                    a0 = i + am.start(2)
                    runs.append((a0, a0 + len(am.group(2)), True))
            if name in SKIP_CONTENT_TAGS and not tag.startswith('</') and not tag.rstrip('>').endswith('/'):
                endm = re.compile(r'</\s*' + name + r'\s*>', re.I).search(M, j + 1)
                i = endm.end() if endm else n
                continue
            i = j + 1; continue
        if cur is None: cur = i
        i += 1
    close(n)

    out = []
    for a, b, attr in runs:
        seg = M[a:b]
        # trim whitespace (and stray tag-free punctuation spacing) at both ends
        lead = len(seg) - len(seg.lstrip())
        trail = len(seg) - len(seg.rstrip())
        a2, b2 = a + lead, b - trail
        if a2 >= b2: continue
        seg = M[a2:b2]
        # drop a dangling inline closing tag at the start / opening tag at the end
        mlead = re.match(r'^(?:</(?:' + '|'.join(INLINE_TAGS) + r')>\s*)+', seg)
        if mlead: a2 += mlead.end(); seg = M[a2:b2]
        mtrail = re.search(r'(?:\s*<(?:' + '|'.join(INLINE_TAGS) + r')(?:\s[^>]*)?>)+$', seg)
        if mtrail and mtrail.start() > 0: b2 -= len(seg) - mtrail.start(); seg = M[a2:b2]
        if not seg.strip(): continue
        plain = re.sub(r'<[^>]*>', '', seg).replace(SENT, ' ')
        plain = re.sub(r'&[a-z#0-9]+;', ' ', plain)
        if not re.search(r'[^\W\d_]{2,}', plain): continue
        src_a, src_b = mp[a2][0], mp[b2 - 1][1]
        # display text: unescape static parts, number the expressions
        unesc = (lambda x: x) if L.kind == 'h' else js_unescape
        disp, exprs, k = [], [], a2
        buf = []
        while k < b2:
            if M[k] == SENT:
                if buf: disp.append(unesc(''.join(buf))); buf = []
                ea, eb = mp[k]
                exprs.append(src[ea + 2:eb - 1])
                disp.append('{%d}' % len(exprs))
            else:
                buf.append(M[k])
            k += 1
        if buf: disp.append(unesc(''.join(buf)))
        text = ''.join(disp)
        whole = (src_a == L.start + 1 and src_b == L.end - 1)
        out.append(Run(L, src_a, src_b, text, exprs, has_html, attr, whole))
    return out


def rebuild_raw(run, new_text, quote):
    """New raw source for a run: escaped static text, {k} replaced by the run's original ${expr}."""
    pieces, last = [], 0
    for m in re.finditer(r'\{(\d+)\}', new_text):
        k = int(m.group(1))
        if 1 <= k <= len(run.exprs):
            pieces.append(js_escape(new_text[last:m.start()], quote))
            pieces.append('${' + run.exprs[k - 1] + '}')
            last = m.end()
    pieces.append(js_escape(new_text[last:], quote))
    return ''.join(pieces)


def placeholders_ok(old, new, numbered=True):
    """Placeholders in new must all exist in old. Returns (ok, message)."""
    pat = r'\{(\d+)\}' if numbered else r'\{(\w+)\}'
    o, n_ = set(re.findall(pat, old)), set(re.findall(pat, new))
    extra = n_ - o
    if extra:
        return False, 'unknown placeholder(s) ' + ', '.join('{%s}' % x for x in sorted(extra))
    missing = o - n_
    return True, ('dropped ' + ', '.join('{%s}' % x for x in sorted(missing))) if missing else ''


# ------------------------------------------------------------------------------------------------------------------------
# Context: which function a position is in, which area of the game
# ------------------------------------------------------------------------------------------------------------------------
DECL_RE = re.compile(r'^(?:async\s+)?function\s+([\w$]+)|^(?:const|let|var)\s+([\w$]+)\s*=|^\s{2}(?:async\s+)?function\s+([\w$]+)', re.M)


class Scopes:
    """Which named function (or top-level const) a source position sits in, from the lexer's bracket ranges."""
    def __init__(self, src, ranges=None):
        import bisect
        if ranges is None:
            lex(src); ranges = lex.ranges
        self.ranges = ranges                      # sorted by start; properly nested
        self.starts = [r[0] for r in ranges]
        self.parent = [-1] * len(ranges)
        st = []
        for k, (a0, b0, _) in enumerate(ranges):
            while st and ranges[st[-1]][1] <= a0: st.pop()
            self.parent[k] = st[-1] if st else -1
            st.append(k)
        self.lines = [0]
        for m in re.finditer('\n', src): self.lines.append(m.end())
        self._bisect = bisect

    def chain_at(self, pos):
        """Names from the innermost to the outermost scope around pos."""
        k = self._bisect.bisect_right(self.starts, pos) - 1
        out = []
        while k >= 0:
            a0, b0, nm = self.ranges[k]
            if a0 <= pos < b0: out.append(nm)
            k = self.parent[k]
        return out

    def name_at(self, pos):
        ch = self.chain_at(pos)
        return ch[-1] if ch else '(top)'

    def where_at(self, pos):
        ch = self.chain_at(pos)
        if not ch: return '(top)'
        return ch[-1] + ('() > ' + ch[0] if len(ch) > 1 else '')

    def line_at(self, pos):
        return self._bisect.bisect_right(self.lines, pos)


AREA_RULES = [
    (r'^(?:render)?(?:Admin|admin)|Admin|Editor|editor|^se[A-Z]|^sb[A-Z]|^cc[A-Z]|Sandbox|sandbox|TestKit|testKit|CardCheck|cardCheck|StatBudget|Decorator|[Dd]ebug|Txns|Deleted|Workshop|workshop|^SE_|^FXL_|devMode|Unattainable|Ledger|^fxl|^FXL|^tk[A-Z]|^testKit|ceBudget|positionTooltip', 'Admin / dev'),
    (r'[Ww]ildpath|WILDPATH|[Tt]avern|Stamina|stamina', 'Wildpaths'),
    (r'GUIDED|STATUS_TIPS|[Cc]oach|TIP|[Tt]utorial|TUTORIAL|[Ll]esson|guide', 'Tutorial / coach'),
    (r'^(?:PASSIVE_DEFS|abilityBadges|TRIGGER_DEFS|ACTION_DEFS|STATUS_KEYWORDS|triggerPreviewText|triggerRowHTML|describeEffects|'
     r'spellText|FIELD_TEXT|characterDescHTML|unplayableReason|phasePillHTML|windPillHTML|ITEM_DEFS|fullCardHTML|effectText|'
     r'skillText|SKILL_DEFS|TERRAIN_BIOMES|VOLCANO_HAZARDS|ATMOSPHERES)$|^KEYWORD_|^SKILL', 'Skills & effects'),
    (r'^(?:SONGBOOK|PEOPLE_TAUNTS|RIVAL_TAUNTS|DEFEAT_QUOTES|SPEECH_BANKS|VS_OPPONENT_NAMES|FACTION_LORE|CUSTOM_SPEECH_TRIGGERS|'
     r'PORTENT_HOLIDAYS|MOON_PHASES|WANDERERS|maybeSpeak|maybeEmote)$|[Ww]anderer|[Ss]peech|[Tt]aunt', 'Speech & flavour'),
    (r'^(?:PEOPLES|HERO_PEOPLES|SUBFACTION_JOURNEYS)$|FACTION|[Ff]action|[Jj]ourney', 'Factions'),
    (r'^(?:RARITY_DEFS|FOIL_FINISHES|WB_FOILS|PRESTIGE_TIERS|REFINE_LADDER|CURRENCY_META|STAT_MEDALS|DECO_PALETTES)$', 'Cards & collection'),
    (r'AVATAR|[Aa]boutYou|[Pp]layerPreview|PlayerStats|PlayerSubTab|NamePrompt|[Ll]oadout', 'Settings / account'),
    (r'^(?:RANK_LESSONS|diffUnlocks)$', 'Results'),
    (r'^(?:ARENA_RULESETS|BATTLE_MODES|KIND_LABEL)$', 'Arena / modes'),
    (r'^(?:renderSim|runSimulation|LOOP_PRESETS)$', 'Camp / deck'),
    (r'^(?:FORGE_[A-Z]+)$', 'Forge'),
    (r'^(?:EGG_KINDS)$', 'Nest'),
    (r'^(?:renderPlay|PAGE_SHORTCUTS)$', 'Menus & navigation'),
    (r'DIALOGUE|[Dd]ialogue|ERRAND|[Ee]rrand|SPEAKER', 'Dialogue'),
    (r'^(?:lossTitle|winTitle|lossTipHTML|defeatQuoteHTML|rankLessonHTML|gloryBadgesHTML|rewardsPanelHTML|nextBattleButtonHTML|matchStatsHTML|rewardsCheer)$|[Rr]esult|Victory|Defeat|WinLoss|winLoss|[Rr]eward', 'Results'),
    (r'[Cc]odex|[Rr]eference|[Hh]allOfFame|HOF|[Bb]rambles|[Pp]hyl', 'Codex'),
    (r'[Ff]orge|[Ss]mith|[Ee]nchant|[Rr]efine|[Tt]emper', 'Forge'),
    (r'[Nn]est|[Ee]gg|[Nn]urse|NEST', 'Nest'),
    (r'[Ss]hop|[Pp]ack|[Mm]erchant|[Mm]arket|[Ff]lea|PACK|SHOP', 'Shop / market'),
    (r'[Dd]eck|[Cc]amp|[Hh]ero|[Ll]eader|[Aa]rmoury', 'Camp / deck'),
    (r'[Rr]aid|[Tt]rench|BOSS', 'Raid'),
    (r'[Aa]rena|[Rr]anked|[Aa]sync|[Pp]vp|PVP|[Ii]nvite|[Aa]utobattle|AUTOBATTLE|[Ss]tomp', 'Arena / modes'),
    (r'[Cc]onquest|CONQUEST|[Mm]ap|MAP|[Nn]ode|[Ss]kirmish|[Ss]weep|cnp|[Ww]orld|[Cc]uriosit|FEATURE|[Ff]eature', 'Conquest map'),
    (r'[Qq]uest|[Aa]chievement|ACHIEVEMENT|QUEST|[Mm]ilestone|[Xx]p|XP|[Ll]evel', 'Quests / progress'),
    (r'[Hh]ome|[Ss]plash|[Ee]ntrance', 'Home'),
    (r'[Ss]etting|[Pp]rofile|[Aa]ccount|[Aa]uth|[Ss]ign|[Cc]loud|[Ll]ang|[Ss]ync|[Aa]vatar', 'Settings / account'),
    (r'[Gg]uild|[Ff]riend|[Rr]anking|[Cc]ommunity|[Cc]hat', 'Community'),
    (r'[Ii]nventory|[Mm]ateria|[Cc]urrenc|[Ee]nergy', 'Inventory / currency'),
    (r'[Mm]atch|[Bb]attle|[Bb]oard|[Hh]and|[Ff]ield|[Ss]kill|SKILL|[Ee]ffect|EFFECT|[Pp]itch|HUD|[Hh]ud|[Cc]ard|[Ss]tatus|[Kk]eyword|[Ll]og|[Ww]eather|[Nn]ight', 'Battle / cards'),
]


def area_for(func):
    chain = func if isinstance(func, list) else [func]
    for nm in chain:                     # innermost first: a helper named for its job wins over the page it sits on
        for pat, area in AREA_RULES:
            if re.search(pat, nm or ''):
                return area
    return 'Other UI'


# ------------------------------------------------------------------------------------------------------------------------
# Is a run player-facing?
# ------------------------------------------------------------------------------------------------------------------------
EXCLUDE_CALLEE = re.compile(r'(?:^|\.)(?:log|warn|error|info|debug|querySelector|querySelectorAll|getElementById|getElementsByClassName|'
                            r'add|remove|toggle|contains|replace|addEventListener|removeEventListener|getItem|setItem|removeItem|'
                            r'matchMedia|closest|matches|createElement|createElementNS|fetch|require|RegExp|getAttribute|hasAttribute|'
                            r'removeAttribute|setProperty|getPropertyValue|includes|indexOf|startsWith|endsWith|split|join|test|match|'
                            r'playDialogue|switchTab|play|stop|i18n|from|channel|rpc|select|eq|insert|update|upsert|order|'
                            r'dispatchEvent|Event|CustomEvent|postMessage|has|get|set|delete|animate|scrollIntoView|focus|'
                            r'track|sendBeacon|keyFor|hash|localeCompare|padStart|toFixed|feature|featureUnlocked|tabOpen|unlockFeature|'
                            r'noteSighted|markCoachSeen|flag|loadDialogueFlags|cardSourceOf|speakerFor|dialogueScript|playSfx|'
                            r'decodeURIComponent|encodeURIComponent|atob|btoa|parse|stringify|setTimeout|setInterval|'
                            r'toLowerCase|toUpperCase|trim|querySelectorAllDeep|invoke|storage|getPublicUrl|upload|download|'
                            r'Ambience|SoundKit|mountSceneShader|applyFxLevel|setFxLevel)$')
EXCLUDE_KEYS = {'id', 'key', 'kind', 'type', 'mode', 'cls', 'class', 'className', 'art', 'src', 'href', 'url', 'map', 'node',
                'dialogue', 'act', 'goto', 'who', 'sound', 'ambience', 'sel', 'selector', 'color', 'tint', 'bg', 'font', 'style',
                'css', 'event', 'ev', 'tab', 'tabs', 'sub', 'stat', 'rarity', 'source', 'lead', 'comp', 'counter', 'card', 'cards',
                'effect', 'do', 'resource', 'target', 'shape', 'look', 'anim', 'easing', 'stack', 'family', 'biome', 'theme',
                'archetype', 'archetypes', 'species', 'element', 'trigger', 'when', 'on', 'cat', 'category', 'flag', 'emote',
                'speaker', 'portrait', 'path', 'file', 'table', 'column', 'channel', 'role', 'pid', 'side', 'row', 'lane', 'slot',
                'unit', 'field', 'terrain', 'weather', 'tier', 'pool', 'skin', 'finish', 'currency', 'cost', 'icon', 'glyph', 'emoji',
                'allow', 'anchor', 'placement', 'position', 'align', 'dir', 'sort', 'groupBy', 'view', 'width', 'height', 'transform',
                'filter', 'mime', 'contentType', 'silent', 'goto', 'label_', 'gate', 'method', 'headers', 'redirectTo', 'provider', 'scope', 'codex', 'kindLabel', 'fn',
                'audio', 'sfx', 'music', 'seed', 'variant', 'mood', 'pose', 'state', 'status', 'result', 'outcome', 'winner'}
TEXT_KEYS = {'label', 'title', 'text', 'body', 'desc', 'description', 'name', 'blurb', 'hint', 'tip', 'okLabel', 'cancelLabel',
             'placeholder', 'msg', 'message', 'caption', 'heading', 'note', 'flavor', 'flavour', 'ask', 'sign', 'place', 'detail',
             'help', 'line', 'lines', 'reason', 'summary', 'question', 'answer', 'prompt', 'cta', 'button', 'empty', 'sub2', 'short',
             'long', 'quote', 'teaser', 'lore', 'rule', 'rules', 'how', 'why', 'what', 'info', 'subtitle', 'tagline', 'intro', 'outro',
             'success', 'fail', 'win', 'lose', 'loss', 'aria', 'ariaLabel', 'tooltip', 'teaches', 'lesson', 'thanks', 'tag'}
TEXT_ASSIGN = {'textContent', 'innerText', 'title', 'placeholder', 'ariaLabel', 'innerHTML', 'value', 'label', 'alt', 'sign'}
TEXT_CALLEE = re.compile(r'(?:^|\.)(?:showToast|bwConfirm|bwChoice|confirm|alert|prompt|_t|i18|escapeHtml|escapeAttr|showCoachTip|'
                         r'setAttribute|keywordizeHTML|toastHTML|openNotice|notice|flashBanner|banner|say|speak)$')
CODE_LIKE = re.compile(r'=>|\bfunction\b|\bvar\(--|\bcalc\(|rgba?\(|hsla?\(|\d(?:px|ms|deg|vh|vw|rem|em)\b|#[0-9a-fA-F]{3,8}\b|'
                       r'@media|https?://|data:[a-z]+/|\.(?:png|jpe?g|webp|svg|js|json|css|html|mp3|ogg)\b|^[.#\[][\w-]|'
                       r'\bdocument\.|\bwindow\.|\bnull\b|\bundefined\b|\btrue\b|\bfalse\b|&&|\|\||===|!==|::|\w\(\)|^\w+:\w+$|'
                       r'\bselect\b.*\bfrom\b|^[a-z]+(?:_[a-z0-9]+)+$|^[a-z]+[A-Z]\w*$')
WORDY = re.compile(r'[^\W\d_]{2,}[^\w{}]+(?:\d+[^\w{}]+)*[^\W\d_]{2,}', re.U)


def is_player_text(run, src):
    L = run.lit
    plain = re.sub(r'<[^>]*>', ' ', run.text)
    plain = re.sub(r'\{\d+\}', ' ', plain)
    plain = re.sub(r'&[a-z#0-9]+;', ' ', plain).strip()
    if not re.search(r'[^\W\d_]{2,}', plain): return False
    if CODE_LIKE.search(plain) or CODE_LIKE.search(re.sub(r'\{\d+\}', '0', run.text)): return False
    # comparisons, switch cases, map keys
    if any(p in ('===', '!==', '==', '!=', 'case', 'in', 'instanceof') for p in L.prev[-1:]): return False
    if L.next in ('===', '!==', '==', '!=', 'in') and not run.html: return False
    if L.next == ':' and L.prev[-1:] in (['{'], [',']): return False   # 'quoted key': value
    # inside a callee we know is code
    owner = L
    while owner is not None:
        if owner.callee and EXCLUDE_CALLEE.search(owner.callee) and not TEXT_CALLEE.search(owner.callee):
            return False
        owner = owner.parent
    key = L.key
    text_ctx = (key in TEXT_KEYS) or (L.assign in TEXT_ASSIGN) or bool(L.callee and TEXT_CALLEE.search(L.callee)) or run.attr
    if key in EXCLUDE_KEYS and not run.html: return False
    if run.html and not run.whole: return True                       # text between tags in an HTML template
    if run.html and run.whole: return bool(WORDY.search(plain)) or text_ctx
    words = plain.split()
    if len(words) == 1 or not WORDY.search(plain):
        # one word: only in a clear text position, and looking like a word a player reads
        return text_ctx and bool(re.match(r'^[^\w]*[A-Z0-9]', plain))
    if all(re.fullmatch(r'[a-z0-9_-]+', w) for w in words) and not text_ctx:
        return False                                                  # 'btn small primary', 'left center right'
    return True


# ------------------------------------------------------------------------------------------------------------------------
# Units (rows) from the sources
# ------------------------------------------------------------------------------------------------------------------------
def slug(text, words=5):
    t = re.sub(r'\{\d+\}', ' ', re.sub(r'<[^>]*>', ' ', text))
    ws = re.findall(r'[A-Za-z0-9]+', t.lower())
    return '-'.join(ws[:words]) or 'text'


def text_hash(text):
    return hashlib.sha1(text.encode('utf-8')).hexdigest()[:5]


class Unit:
    def __init__(self, key, area, text):
        self.key, self.area, self.text = key, area, text
        self.runs = []        # (file, Run)
        self.where = []       # 'file:line func()'
        self.notes = []
        self.admin = False


def read(rel):
    return open(os.path.join(ROOT, rel), encoding='utf-8').read()


def template_html_lits(src):
    """arena_template.html: the static HTML outside <style>/<script>, as one pseudo-literal per text chunk."""
    lits = []
    # the real <body> is the last one (CSS comments above mention "<body>" too)
    starts = [m for m in re.finditer(r'^<body\b[^>]*>', src, re.M)] or [m for m in re.finditer(r'<body\b[^>]*>', src)]
    for m0 in starts[-1:]:
        a = m0.end(); b = src.find('</body>', a); b = len(src) if b < 0 else b
        # cut out <script>/<style> blocks
        spans, k = [], a
        for sm in re.finditer(r'<(script|style)\b[\s\S]*?</\1>', src[a:b]):
            spans.append((k, a + sm.start())); k = a + sm.end()
        spans.append((k, b))
        for sa, sb in spans:
            L = Lit('h', sa - 1)
            L.end = sb + 1
            L.parts = [('s', sa, sb)]
            lits.append(L)
    return lits


def is_admin_context(src, L):
    """Inside `${adminModeEnabled ? ... : ''}` (or dev mode) somewhere up the chain."""
    owner = L
    while owner is not None:
        pe = owner.parent_expr
        if pe is not None:
            expr = src[pe[1]:(pe[2] or pe[1] + 200)]
            if re.match(r'\s*\(?\s*!?\s*(?:adminModeEnabled|devModeEnabled|cloudCardAdmin|isAdmin)\b', expr) and not expr.lstrip().startswith('!'):
                return True
        owner = owner.parent
    return False


def extract_units(root=ROOT, files=None):
    """All src:* units from the source files (keyed TX() texts are not literals any more, so they don't show up here)."""
    units = {}
    order = []
    for rel in (files or SOURCES):
        src = open(os.path.join(root, rel), encoding='utf-8').read()
        if rel.endswith('.html'):
            lits = template_html_lits(src)
            scopes = None
        else:
            lits, _ = lex(src)
            scopes = Scopes(src, lex.ranges)
        for L in lits:
            for run in literal_runs(src, L):
                if rel.endswith('.html'):
                    if not re.search(r'[^\W\d_]{2,}', re.sub(r'<[^>]*>|&[a-z#0-9]+;', ' ', run.text)): continue
                    func, line = 'page', src.count('\n', 0, run.start) + 1
                else:
                    if not is_player_text(run, src): continue
                    func, line = scopes.name_at(run.start), scopes.line_at(run.start)
                area = 'Page (static HTML)' if rel.endswith('.html') else area_for(scopes.chain_at(run.start) or ['(top)'])
                if L.callee and re.search(r'(?:^|\.)showToast$', L.callee) and area not in ('Admin / dev',): area = 'Toasts'
                elif L.callee and re.search(r'(?:^|\.)(?:bwConfirm|bwChoice|confirm|alert|prompt)$', L.callee): area = 'Dialogs' if area != 'Admin / dev' else area
                admin = area == 'Admin / dev' or (not rel.endswith('.html') and is_admin_context(src, L))
                if admin: area = 'Admin / dev'
                key = 'src:%s:%s:%s' % (func, slug(run.text, 4), text_hash(run.text))
                u = units.get(key)
                if u is None:
                    u = units[key] = Unit(key, area, run.text); order.append(key)
                    if run.exprs:
                        u.notes.append('Keep the {n} parts: ' + '; '.join('{%d} = %s' % (k + 1, re.sub(r'\s+', ' ', e)[:60]) for k, e in enumerate(run.exprs)))
                    if run.attr:
                        u.notes.append('Tooltip / label (an HTML attribute): no double quotes.')
                    u.admin = admin
                u.runs.append((rel, run))
                u.where.append('%s:%d %s' % (rel, line, (scopes.where_at(run.start) + '()') if scopes else ''))
    return [units[k] for k in order]


# ------------------------------------------------------------------------------------------------------------------------
# The TEXT table (bramblewood-texts.js)
# ------------------------------------------------------------------------------------------------------------------------
def load_table(root=ROOT):
    src = open(os.path.join(root, TEXTS_JS), encoding='utf-8').read()
    a, b = src.index(TABLE_START) + len(TABLE_START), src.index(TABLE_END)
    return json.loads(src[a:b])


def table_block(table):
    lines = ['{']
    keys = list(table.keys())
    for k_i, k in enumerate(keys):
        lines.append('  %s: %s%s' % (json.dumps(k), json.dumps(table[k], ensure_ascii=False), ',' if k_i < len(keys) - 1 else ''))
    lines.append('}')
    return '\n'.join(lines)


def save_table(table, root=ROOT):
    p = os.path.join(root, TEXTS_JS)
    src = open(p, encoding='utf-8').read()
    a, b = src.index(TABLE_START) + len(TABLE_START), src.index(TABLE_END)
    open(p, 'w', encoding='utf-8').write(src[:a] + table_block(table) + src[b:])


TX_CALL = re.compile(r"\bTX\(\s*'([^']+)'")


def tx_vars_at(src, i):
    """[(name, expr)] of the {...} object literal starting at src[i] == '{' (a TX call's second argument)."""
    depth, j, q, parts, tok = 0, i, None, [], ''
    while j < len(src):
        c = src[j]
        if q:
            tok += c
            if c == '\\': tok += src[j + 1]; j += 2; continue
            if c == q: q = None
            j += 1; continue
        if c in '\'"`': q = c; tok += c; j += 1; continue
        if c in '{[(':
            depth += 1
            if depth == 1: j += 1; continue
        if c in '}])':
            depth -= 1
            if depth == 0: parts.append(tok); break
        if depth == 1 and c == ',': parts.append(tok); tok = ''
        else: tok += c
        j += 1
    out = []
    for p_ in parts:
        p_ = p_.strip()
        if not p_: continue
        if re.match(r'^[\w$]+\s*:', p_):
            k, e = p_.split(':', 1); out.append((k.strip(), e.strip()))
        else:
            out.append((p_, p_))
    return out


def tx_uses(root=ROOT, with_vars=False):
    """key -> ['arena_app.js:123 func()', ...] for every TX('key') call (and key -> [(name, expr)] from its first call)."""
    out, vars_ = {}, {}
    for rel in SOURCES:
        if rel.endswith('.html'): continue
        src = open(os.path.join(root, rel), encoding='utf-8').read()
        sc = Scopes(src)
        for m in TX_CALL.finditer(src):
            out.setdefault(m.group(1), []).append('%s:%d %s()' % (rel, sc.line_at(m.start()), sc.name_at(m.start())))
            if with_vars and m.group(1) not in vars_:
                rest = re.match(r"\s*,\s*\{", src[m.end():])
                vars_[m.group(1)] = tx_vars_at(src, m.end() + rest.end() - 1) if rest else []
    return (out, vars_) if with_vars else out


KEY_AREA = {'toast': 'Toasts', 'dialog': 'Dialogs', 'coach': 'Tutorial / coach', 'tutorial': 'Tutorial / coach', 'results': 'Results',
            'map': 'Conquest map'}  # map.* (2026-10-18, package PD: the Pale Desert's names and flavour)
