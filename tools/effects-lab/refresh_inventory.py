#!/usr/bin/env python3
"""Refresh the effects inventory's status from the Effects Lab (2026-10-18, audit P5).

docs/effects-inventory-2026-10-15.json had a `status` on only 100 of its rows, and 140 rows still said "missing" although
the lab manifests (and the batch docs) had built them since. This script gives every row one status:

  retired   kept as it is (status: retired, set by hand with the reason)
  live      the game plays it: a lab registration whose inGameHook names a real hook, or (no registration) an existing
            look the inventory rates good / basic
  lab-only  built and playable in the Effects Lab, not wired in the game (inGameHook 'future', "no caller", "lab only"...)
  future    planned (future: true) and not built anywhere yet
  missing   nothing on screen and nothing in the lab

It also writes `lab` (the manifest file that registers it, or null) and `inGameHook` (the lab's hook text) on each row,
then regenerates the generated parts of docs/effects-inventory-2026-10-15.md: the status summary at the top, the
"Counts by area and quality" table and the "Entries by area" tables. The hand-written sections stay as they are.

Run: python3 tools/effects-lab/refresh_inventory.py        (needs node; reads tools/effects-lab/manifest/*.js)
     python3 tools/effects-lab/refresh_inventory.py --check (prints the counts, writes nothing)
"""
import json, os, re, subprocess, sys
from collections import Counter, OrderedDict

LAB = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(LAB, '..', '..'))
INV_JSON = os.path.join(ROOT, 'docs', 'effects-inventory-2026-10-15.json')
INV_MD = os.path.join(ROOT, 'docs', 'effects-inventory-2026-10-15.md')
MDIR = os.path.join(LAB, 'manifest')
TODAY = '2026-10-18'

# Runs every manifest in a sandbox whose window/document answer anything (a callable, endlessly chainable stub), with a
# FXLAB that only records register / registerGroup. Manifests touch the game only inside play(ctx), which never runs here.
COLLECT_JS = r'''
const fs = require('fs'), path = require('path'), vm = require('vm');
const [mdir, invPath] = process.argv.slice(1);
const inv = JSON.parse(fs.readFileSync(invPath, 'utf8'));
const stub = ()=>{ const f = function(){}; return new Proxy(f, {
  get(t, k){ if(k === Symbol.toPrimitive) return ()=> ''; if(k === Symbol.iterator) return function*(){}; if(k === 'length') return 0;
    if(k === 'then') return undefined; if(k in t && k !== 'name' && k !== 'prototype') return t[k]; return t[k] = stub(); },
  set(t, k, v){ t[k] = v; return true; }, apply(){ return stub(); }, construct(){ return stub(); }, has(){ return true; } }); };
const REG = new Map(), PROB = [];
const register = spec=>{ if(!spec || !spec.id) return null; const r = REG.get(spec.id) || {id:spec.id, inGameHook:'', files:[], variants:0};
  if(spec.inGameHook) r.inGameHook = String(spec.inGameHook); if(!r.files.includes(CUR)) r.files.push(CUR);
  r.variants += Array.isArray(spec.variants) ? spec.variants.length : (typeof spec.play === 'function' ? 1 : 0); REG.set(spec.id, r); return r; };
let CUR = '';
const FXLAB = {register, registerGroup:(d, list)=> (list || []).forEach(s=> register(Object.assign({}, d || {}, s))), get:id=> REG.get(id) || null, on(){}, play(){}};
const win = stub(); win.FXLAB = FXLAB; win.FXLAB_INVENTORY = inv; win.FXLAB_FIXTURES = {};
const ctx = vm.createContext({window:win, FXLAB, FXLAB_INVENTORY:inv, FXLAB_FIXTURES:{}, document:stub(), navigator:stub(), location:stub(), localStorage:stub(),
  gsap:stub(), SoundKit:stub(), SkillFX:stub(), ProcFX:stub(), FX:stub(), console:{log(){}, warn(){}, info(){}, error(){}},
  setTimeout:()=>0, clearTimeout(){}, setInterval:()=>0, clearInterval(){}, requestAnimationFrame:()=>0, performance:{now:()=>0}, innerWidth:1200, innerHeight:800,
  getComputedStyle:()=> stub(), matchMedia:()=> ({matches:false}), Math, JSON, Date, Promise, Map, Set, Array, Object, String, Number, Boolean, RegExp, Error, Symbol});
ctx.globalThis = ctx; ctx.self = ctx;
// Window properties the manifests set (W.foo = ...) are read back as globals by later manifests: mirror them.
const files = fs.readdirSync(mdir).filter(f=> f.endsWith('.js')).sort();
for(const f of files){ CUR = f; try{ vm.runInContext(fs.readFileSync(path.join(mdir, f), 'utf8'), ctx, {filename:f}); }catch(e){ PROB.push(f + ': ' + e.message); } }
process.stdout.write(JSON.stringify({reg:[...REG.values()], problems:PROB}));
'''

LAB_ONLY_RE = re.compile(r"^future$|no caller|lab only|lab-only|not wired|nothing calls|not in the game|planned", re.I)


def collect():
    out = subprocess.run(['node', '-e', COLLECT_JS, MDIR, INV_JSON], capture_output=True, text=True, check=True).stdout
    data = json.loads(out)
    return {r['id']: r for r in data['reg']}, data['problems']


def batch_doc_hooks():
    """id -> hook column from docs/fx-batch-*-status.md (a second source for rows a manifest doesn't carry a hook for)."""
    hooks = {}
    for f in sorted(os.listdir(os.path.join(ROOT, 'docs'))):
        if not re.match(r'fx-batch-[a-z]-status\.md$', f):
            continue
        for line in open(os.path.join(ROOT, 'docs', f), encoding='utf-8'):
            m = re.match(r"\|\s*`([a-z0-9-]+)`\s*\|[^|]*\|\s*([^|]*)\|[^|]*\|\s*([^|]*)\|", line)
            if m:
                hooks.setdefault(m.group(1), (m.group(2).strip(), m.group(3).strip()))
    return hooks


def status_of(e, reg, doc):
    if e.get('status') == 'retired':
        return 'retired'
    q = str(e.get('quality') or '').split(' ')[0].lower()
    r = reg.get(e['id'])
    if r and r['variants'] > 0:
        hook = (r.get('inGameHook') or '').strip()
        if not hook and doc.get(e['id']):
            hook = doc[e['id']][1]
        if re.match(r'live\b', hook, re.I):  # "live for faction packs …; a deck-wide one is planned"
            return 'live'
        if LAB_ONLY_RE.search(hook) or (not hook and e.get('future')):
            return 'lab-only'
        return 'live'
    if e.get('future'):
        return 'future'
    if q in ('good', 'basic', 'broken'):
        return 'live'
    return 'missing'


AREA_TITLE = OrderedDict([
    ('combat-attack', 'Combat: attacks and hits'), ('combat-skill', 'Combat: skills'), ('status', 'Statuses'),
    ('field', 'Fields and environment rules'), ('weather-time', 'Weather and time of day'), ('darkness-light', 'Darkness and light'),
    ('death', 'Deaths'), ('castle', 'Castle (HQ)'), ('summon-spawn', 'Summons, spawns, hatching'), ('card-treatment', 'Card treatments'),
    ('foil', 'Foils'), ('pack-card-open', 'Pack and card opening'), ('rewards-results', 'Rewards and results'),
    ('meta-progression', 'Meta progression (level, forge, nest, inventory, shop, achievements, quests, energy)'),
    ('conquest-map', 'Conquest map'), ('world-ambience', 'World ambience'), ('ui-feedback', 'UI feedback'),
    ('tutorial-dialogue', 'Tutorial and dialogue'), ('raid-dungeon-pvp', 'Raid, dungeon, PvP, co-op')])
STATUSES = ['live', 'lab-only', 'future', 'missing', 'retired']


def cell(s):
    return str(s if s is not None else '').replace('|', '\\|').replace('\n', ' ')


def qual(e):
    return str(e.get('quality') or '').split(' ')[0].lower().rstrip('—').strip() or '?'


def render_counts(inv):
    areas = list(AREA_TITLE) + sorted({e['area'] for e in inv} - set(AREA_TITLE))
    batch = {}
    for e in inv:
        batch.setdefault(e['area'], e.get('batch') or '')
    rows = ['| Area | Batch | good | basic | missing | broken | live | lab-only | future | missing now | retired | total | P1 |',
            '|---|---|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|']
    tot = Counter()
    for a in areas:
        es = [e for e in inv if e['area'] == a]
        if not es:
            continue
        q, s = Counter(qual(e) for e in es), Counter(e['status'] for e in es)
        p1 = sum(1 for e in es if e.get('priority') == 1)
        vals = [q['good'], q['basic'], q['missing'], q['broken'], s['live'], s['lab-only'], s['future'], s['missing'], s['retired'], len(es), p1]
        for k, v in zip(['good', 'basic', 'qmissing', 'broken', 'live', 'lab-only', 'future', 'missing', 'retired', 'total', 'p1'], vals):
            tot[k] += v
        rows.append(f"| {a} | {batch[a]} | " + ' | '.join(str(v) for v in vals) + ' |')
    rows.append('| **all** | | ' + ' | '.join(f"**{tot[k]}**" for k in ['good', 'basic', 'qmissing', 'broken', 'live', 'lab-only', 'future', 'missing', 'retired', 'total', 'p1']) + ' |')
    return ('## Counts by area and quality\n\n'
            f'Quality is the inventory\'s rating of the look (the 10-15 sweep, kept); status is where it stands now ({TODAY}, '
            '`tools/effects-lab/refresh_inventory.py`). "missing now" counts rows with nothing on screen and nothing in the lab.\n\n'
            + '\n'.join(rows) + '\n\n'
            'Areas `future` items live in their natural area with `future: true` (so a planned dragon death sits under **death**); '
            '"Future effects by theme" below gathers them.\n\n')


def render_entries(inv):
    out = ['## Entries by area\n']
    areas = list(AREA_TITLE) + sorted({e['area'] for e in inv} - set(AREA_TITLE))
    for a in areas:
        es = [e for e in inv if e['area'] == a]
        if not es:
            continue
        out.append(f"### {AREA_TITLE.get(a, a)} (`{a}`, {len(es)})\n")
        out.append('| id | name | trigger | current | quality | status | P |')
        out.append('|---|---|---|---|---|---|--:|')
        for e in es:
            mark = (' 🔮' if e.get('future') else '') + (' 🎨' if e.get('variantsSuggested') else '')
            st = e['status'] + (f" ({e['lab']})" if e.get('lab') and e['status'] in ('live', 'lab-only') else '')
            out.append(f"| `{e['id']}` | {cell(e.get('name'))}{mark} | {cell(e.get('trigger'))} | {cell(e.get('current'))} | {cell(e.get('quality'))} | {cell(st)} | {cell(e.get('priority'))} |")
        out.append('')
    out.append('🔮 = future (planned). 🎨 = build variants for the designer to choose. Status (manifest file): where it is built in the Effects Lab.\n\n')
    return '\n'.join(out)


def render_summary(inv, before):
    s = Counter(e['status'] for e in inv)
    was_missing = before.get('missing_quality', 0)
    return (f'## {TODAY}: status from the Effects Lab (refresh_inventory.py)\n\n'
            'Every row now has a `status`, filled by `tools/effects-lab/refresh_inventory.py` from the lab manifests '
            '(`tools/effects-lab/manifest/*.js`; the batch docs `docs/fx-batch-*-status.md` as a second source): '
            '**live** the game plays it · **lab-only** built in the Effects Lab, not wired in the game · **future** planned, not built · '
            '**missing** nothing on screen and nothing in the lab · **retired** kept from before. Each row also carries `lab` (the manifest '
            'that registers it) and `inGameHook`. Rerun the script after a lab change; it rewrites this section, the counts and the entry tables.\n\n'
            f"**Now:** {len(inv)} entries · " + ' · '.join(f"{k} {s[k]}" for k in STATUSES) +
            f". Of the {was_missing} rows the 10-15 sweep rated \"missing\", {before.get('missing_now_built', 0)} are built now "
            f"({before.get('missing_now_live', 0)} live, {before.get('missing_now_lab', 0)} lab-only).\n\n")


def replace_section(md, start_heading, end_heading, new):
    i = md.find(start_heading)
    j = md.find(end_heading, i + 1) if i >= 0 else -1
    if i < 0 or j < 0:
        raise SystemExit(f'refresh_inventory: cannot find "{start_heading}" … "{end_heading}" in the .md')
    return md[:i] + new + md[j:]


def main():
    check = '--check' in sys.argv
    inv = json.load(open(INV_JSON, encoding='utf-8'))
    reg, problems = collect()
    doc = batch_doc_hooks()
    for p in problems:
        print('manifest problem:', p, file=sys.stderr)
    before = Counter()
    for e in inv:
        st = status_of(e, reg, doc)
        r = reg.get(e['id'])
        if qual(e) == 'missing' and not e.get('future'):
            before['missing_quality'] += 1
            if st in ('live', 'lab-only'):
                before['missing_now_built'] += 1
                before['missing_now_live' if st == 'live' else 'missing_now_lab'] += 1
        e['status'] = st
        e['lab'] = ', '.join(r['files']) if r else None
        e['inGameHook'] = (r.get('inGameHook') or None) if r else None
    known = {e['id'] for e in inv}
    extra = sorted(k for k in reg if k not in known)
    s = Counter(e['status'] for e in inv)
    print(f"{len(inv)} rows · " + ' · '.join(f"{k} {s[k]}" for k in STATUSES) + f" · {len(reg)} lab registrations ({len(extra)} of them the lab's own map-title- / map-grand- / fun- ids, not inventory rows)")
    print(f"rated missing on 10-15: {before['missing_quality']} · built since: {before['missing_now_built']} (live {before['missing_now_live']}, lab-only {before['missing_now_lab']})")
    if check:
        return
    with open(INV_JSON, 'w', encoding='utf-8') as fh:
        json.dump(inv, fh, ensure_ascii=False, indent=1)
        fh.write('\n')
    if os.path.exists(INV_MD):
        md = open(INV_MD, encoding='utf-8').read()
        summary = render_summary(inv, before)
        head = f'## {TODAY}: status from the Effects Lab (refresh_inventory.py)'
        if head in md:
            md = replace_section(md, head, '\n## ', summary.rstrip('\n') + '\n')
        else:
            k = md.find('\n## ')
            md = md[:k + 1] + summary + md[k + 1:]
        md = replace_section(md, '## Counts by area and quality', '## Top 25 most visible gaps', render_counts(inv))
        md = replace_section(md, '## Entries by area', '## Future effects by theme', render_entries(inv))
        with open(INV_MD, 'w', encoding='utf-8') as fh:
            fh.write(md)
        print('wrote', os.path.relpath(INV_JSON, ROOT), 'and', os.path.relpath(INV_MD, ROOT))


if __name__ == '__main__':
    main()
