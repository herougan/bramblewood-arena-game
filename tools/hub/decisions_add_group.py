#!/usr/bin/env python3
"""HUBDEC1 (2026-10-29, owner: split the hub's Decisions into Game / Architecture / Finance): adds `group` to every item of
docs/decisions.json by its area, with per-id overrides. Rewrites only the item lines it changes (one json.dumps per line; the
layout of the file stays). Items that already have a group are left alone. Re-runnable.
Other decision writers: set `group` on new items with `group_of(item)` from here, or just "game"; build_hub.py treats a missing group as game."""
import json, os
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
P = os.path.join(ROOT, 'docs', 'decisions.json')
ARCH_AREAS = {'Server', 'Security', 'Platform', 'Tech', 'Tools', 'Accounts', 'Admin', 'Balance tools'}
BY_ID = {'CONTENT4-4': 'game',  # frost where the balance tools see it: a map rule
         'D15': 'finance', 'A2': 'finance', 'S3': 'finance',  # PixelLab credits, LoRA spend, Supabase Pro upgrade
         'A1': 'architecture'}  # which AI services (art pipeline providers)


def group_of(it):
    return BY_ID.get(it['id']) or ('architecture' if it.get('area') in ARCH_AREAS else 'game')


if __name__ == '__main__':
    lines = open(P, encoding='utf-8').read().split('\n')
    n = 0
    for k, l in enumerate(lines):
        s = l.strip()
        if not s.startswith('{"id"'):
            continue
        it = json.loads(s.rstrip(','))
        if 'group' in it:
            continue
        new = {}
        for key, v in it.items():
            new[key] = v
            if key == 'area':
                new['group'] = group_of(it)
        if 'group' not in new:
            new['group'] = group_of(it)
        lines[k] = l[:len(l) - len(l.lstrip())] + json.dumps(new, ensure_ascii=False) + (',' if s.endswith(',') else '')
        n += 1
    open(P, 'w', encoding='utf-8').write('\n'.join(lines))
    json.load(open(P, encoding='utf-8'))
    print('group added to', n, 'items')
