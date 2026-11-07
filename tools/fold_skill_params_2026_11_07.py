#!/usr/bin/env python3
# Fold old twin skill keys into one fused key per family (2026-11-07, package ENG35; owner 20:58: "Fuse skills together. For example,
# Almanac number and grant are the same"). A representation change only: canonical/cards.json's {"nocturnal": 2, "nocturnalHp": 1} becomes
# {"nocturnal": {"v": 2, "hp": 1}}, {"tide": true, "tideGrant": {...}} becomes {"tide": {"gives": {...}}} (canonical/skill-params.json
# says the shapes). tools/skill_params.py expand() gives back exactly the old keys and values, which tests/eng35-2026-11-07.js checks card by
# card and by fixed-seed fights. Safe to run again (it changes nothing the second time); run it after a fold of cloud overrides too.
# Usage: python3 tools/fold_skill_params_2026_11_07.py [--check]   (--check: report only, exit 1 when a card still has a twin key)
import json, os, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import skill_params as SP

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
P = os.path.join(ROOT, 'canonical', 'cards.json')


def main():
    cards = json.load(open(P, encoding='utf-8'))
    twins = SP.twin_keys()
    changed, bad = [], []
    out = []
    for c in cards:
        f = SP.fuse_def(c)
        # the round trip must give back the old effects exactly (values and keys)
        for part in ('effects',):
            if json.dumps(SP.expand(f.get(part) or {}), sort_keys=True) != json.dumps(SP.expand(c.get(part) or {}), sort_keys=True):
                bad.append(c.get('id'))
        for L, x in (c.get('levelSkills') or {}).items():
            if json.dumps(SP.expand(f['levelSkills'][L]), sort_keys=True) != json.dumps(SP.expand(x), sort_keys=True):
                bad.append('%s@%s' % (c.get('id'), L))
        if f != c:
            changed.append(c.get('id'))
        out.append(f)
    left = [c['id'] for c in out if any(k in twins for k in (c.get('effects') or {}))]
    if bad:
        print('round trip differs:', bad)
        sys.exit(2)
    print('fused %d cards: %s' % (len(changed), ', '.join(changed)))
    if '--check' in sys.argv:
        sys.exit(1 if changed or left else 0)
    if changed:
        open(P, 'w', encoding='utf-8').write(json.dumps(out, indent=2) + '\n')
    if left:
        print('twin keys left on:', left)


if __name__ == '__main__':
    main()
