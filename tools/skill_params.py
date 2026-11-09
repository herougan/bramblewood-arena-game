# Skill parameters for the Python side (2026-11-07, package ENG35): the same expand / fuse as bramblewood-skillparams.js, reading
# canonical/skill-params.json. assemble_arena.py expands canonical/cards.json with it before the page gets the cards (the page's card data,
# and so its card-data hash, stay as they were); tools/fold_skill_params_2026_11_07.py fuses with it. tests/eng35-2026-11-07.js checks that
# this file and the JS one give the same result on every card. ENG39 (2026-11-09): + kinds (a family's named versions).
import json, os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
_P = None


def params():
    global _P
    if _P is None:
        _P = json.load(open(os.path.join(ROOT, 'canonical', 'skill-params.json'), encoding='utf-8'))
    return _P


def _fam():
    return params().get('families', {})


def _alias():
    out = {}
    for k, f in _fam().items():
        for p, old in (f.get('params') or {}).items():
            out.setdefault(old, [k, p])
    return out


def _plain(v):
    return isinstance(v, dict)


# ENG39 (2026-11-09, decision DES2-3 a): kinds, a family's named versions (the same rules as bramblewood-skillparams.js)
def _fk():
    """family -> [(match {selector: value string}, old key)], from "kinds" and "kindSets" (the same order as the JS file)."""
    out = {}
    for k, f in _fam().items():
        lst = []
        for p, m in (f.get('kinds') or {}).items():
            for val, t in m.items():
                lst.append(({p: val}, t))
        for e in f.get('kindSets') or []:
            lst.append(({p: _str(x) for p, x in (e.get('match') or {}).items()}, e['key']))
        if lst:
            out[k] = lst
    return out


def _kind():
    out = {}
    for k, lst in _fk().items():
        for m, t in lst:
            out.setdefault(t, [k, m])
    return out


def _typed(m):
    return {p: _sel_val(x) for p, x in m.items()}


def _sel_val(s):
    if s == 'true':
        return True
    if s == 'false':
        return False
    try:
        if s.lstrip('-').replace('.', '', 1).isdigit():
            return int(s) if '.' not in s else float(s)
    except Exception:
        pass
    return s


def _str(v):
    # String(v) as JavaScript writes it, for selector lookups
    if v is True:
        return 'true'
    if v is False:
        return 'false'
    if isinstance(v, float) and v.is_integer():
        return str(int(v))
    return str(v)


def _sel_of(k, v):
    lst = _fk().get(k)
    if not lst:
        return None
    sels = set(p for m, _ in lst for p in m)
    used = [p for p in v if p in sels]
    if not used:
        return None
    for m, t in lst:
        if len(m) == len(used) and all(p in v and _str(v[p]) == x for p, x in m.items()):
            return [used, t]
    return False


def is_fused(k, v):
    f = _fam().get(k)
    if not f or not _plain(v) or not v:
        return False
    s = _sel_of(k, v)
    if s is False:
        return False
    if s:
        tf = _fam().get(s[1])
        return all(x == 'v' or x in s[0] or (tf is not None and x in tf['params']) for x in v)
    return all(x == 'v' or x in f['params'] for x in v)


def _expand_one(out, k, v):
    s = _sel_of(k, v)
    if s:
        rest = {x: y for x, y in v.items() if x not in s[0]}
        if s[1] in _fam() and any(x != 'v' for x in rest):
            _expand_one(out, s[1], rest)
            return
        if 'v' not in rest:
            out[s[1]] = True
        elif rest['v'] is not None:
            out[s[1]] = rest['v']
        return
    if 'v' not in v:
        out[k] = True
    elif v['v'] is not None:
        out[k] = v['v']
    for p, old in _fam()[k]['params'].items():
        if p in v:
            out[old] = v[p]


def needs_expand(e):
    return _plain(e) and any(is_fused(k, v) for k, v in e.items())


def expand(e):
    if not needs_expand(e):
        return e
    out = {}
    for k, v in e.items():
        if not is_fused(k, v):
            out[k] = v  # the later key counts (a flat override merged after the object)
            continue
        _expand_one(out, k, v)
    return out


def fuse(e0):
    if not _plain(e0):
        return e0
    e, fam, alias = expand(e0), _fam(), _alias()
    out, used = {}, set()
    MISSING = object()

    def fam_obj(k, base):
        o, anyp = {}, False
        if base is MISSING:
            o['v'] = None
        elif base is not True:
            o['v'] = base
        for p, old in fam[k]['params'].items():
            if old in e and old not in used:
                o[p] = e[old]
                used.add(old)
                anyp = True
        return o if anyp else None

    for k in list(e.keys()):
        if k in used:
            continue
        if k in fam:
            used.add(k)
            o = fam_obj(k, e[k])
            out[k] = o if o is not None else e[k]
            continue
        a = alias.get(k)
        if a:
            if any(b in e and b not in used and k in fam[b]['params'].values() for b in fam):
                continue
            o = fam_obj(a[0], MISSING)
            if o is not None:
                used.add(a[0])
                out[a[0]] = o
            continue
        out[k] = e[k]
    # ENG39: a kind (weaken, requiem ...) folds into its family when the card holds no other version of that family
    kind, present, claimed, res = _kind(), set(out.keys()), set(), {}
    for k, v in out.items():
        kd = kind.get(k)
        if not kd or kd[0] in present or kd[0] in claimed:
            res[k] = v
            continue
        claimed.add(kd[0])
        o = {}
        if _plain(v) and k in fam and is_fused(k, v):
            if 'v' in v:
                o['v'] = v['v']
            o.update(_typed(kd[1]))
            for x, y in v.items():
                if x != 'v':
                    o[x] = y
        else:
            if v is not True:
                o['v'] = v
            o.update(_typed(kd[1]))
        res[kd[0]] = o
    return res


def expand_def(d):
    if not isinstance(d, dict):
        return d
    fx, ls = d.get('effects'), d.get('levelSkills')
    e_need = needs_expand(fx)
    l_need = _plain(ls) and any(needs_expand(x) for x in ls.values())
    if not e_need and not l_need:
        return d
    out = dict(d)
    if e_need:
        out['effects'] = expand(fx)
    if l_need:
        out['levelSkills'] = {L: expand(x) for L, x in ls.items()}
    return out


def fuse_def(d):
    if not isinstance(d, dict):
        return d
    out = dict(d)
    if _plain(d.get('effects')):
        out['effects'] = fuse(d['effects'])
    if _plain(d.get('levelSkills')):
        out['levelSkills'] = {L: fuse(x) for L, x in d['levelSkills'].items()}
    return out


def kind_keys():
    """Every kind (an old skill written as its family plus its selectors), for checks: key -> [family, {selector: value}]."""
    return {k: [v[0], _typed(v[1])] for k, v in _kind().items()}


def twin_keys():
    """Every old twin key (a part of a family), for checks."""
    return set(_alias().keys())
