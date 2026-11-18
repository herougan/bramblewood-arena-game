"""POISON2 (2026-11-18): the packs also hold some rows under the English text with its leading emoji (older tests read them that way).
Copies each new peeled row to the emoji key when the old English had an emoji row. Safe to run twice."""
import json, re, sys
sys.path.insert(0, 'tools'); sys.path.insert(0, 'tools/text')
import i18n_add as A
import i18n_2026_11_18_poison2 as P

for c in A.CODES:
    path = 'lang/%s.json' % c
    pack = json.load(open(path))
    n = 0
    for k, s in re.findall(r'^  "([^"]+)": "((?:[^"\\]|\\.)*)",?$', open('bramblewood-texts.js').read(), re.M):
        if not re.search('poison', s, re.I) or s == A.core(json.loads('"' + s + '"')): continue
        en = json.loads('"' + s + '"')
        old = P.new_en(k, en)  # not used: the new English is s itself
        core = A.core(en)
        if core in pack and en not in pack and en.replace('Poison', 'Venom') in pack:
            pack[en] = pack[core]; n += 1
    if n:
        json.dump(pack, open(path, 'w'), ensure_ascii=False, indent=1)
        open(path, 'a').write('\n')
    print(c, n)
