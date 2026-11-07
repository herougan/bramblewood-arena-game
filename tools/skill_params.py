# Skill parameters for the Python side (2026-11-07, package ENG35): the same expand / fuse as bramblewood-skillparams.js, reading
# canonical/skill-params.json. assemble_arena.py expands canonical/cards.json with it before the page gets the cards (the page's card data,
# and so its card-data hash, stay as they were); tools/fold_skill_params_2026_11_07.py fuses with it. tests/eng35-2026-11-07.js checks that
# this file and the JS one give the same result on every card.
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


def is_fused(k, v):
    f = _fam().get(k)
    if not f or not _plain(v) or not v:
        return False
    return all(x == 'v' or x in f['params'] for x in v)


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
        if 'v' not in v:
            out[k] = True
        elif v['v'] is not None:
            out[k] = v['v']
        for p, old in _fam()[k]['params'].items():
            if p in v:
                out[old] = v[p]
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
    return out


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


def twin_keys():
    """Every old twin key (a part of a family), for checks."""
    return set(_alias().keys())
