#!/usr/bin/env python3
"""Numbered texts become TX templates (2026-10-23, package SX, owner I2: "Template change").

    python3 tools/text/templatize_numbers.py            # report what would change (code, TEXT table, the 12 packs)
    python3 tools/text/templatize_numbers.py --write    # do it
    python3 tools/text/templatize_numbers.py --check    # exit 1 if a numbered literal below is back, or a pack lacks a template

I2: "Lines like '3 cards', 'Pack 2 of 10', 'N new cards!' stay English because the translator matches whole strings. Fix:
number-aware templates for each language." Texts built in code (`${n} cards`) were made templates by I1 / I3 (TX() and lang/ui
keys with {v1}); what was left are data tables that spell their number into the text, so each number was its own pack row and a
new number (a new quest goal, a new achievement step) came out English. SPEC lists them. For each template this tool:

  1. rewrites every listed literal in arena_app.js ('Own 100 cards.') as TX('<key>', {n: 100});
  2. adds the template to the TEXT table in bramblewood-texts.js;
  3. per language, finds the pack rows that are this template with numbers in (lang/<code>.json and lang/ui/<code>.json), turns
     their translation into the template (the number becomes {n}), checks that the template gives back every old row (a number
     the language writes another way, "4.000" for "4,000", is reported), writes it to lang/<code>.json and drops the numbered rows.
     A language with no numbered row gets SPEC's own translation (FALLBACK).

Safe to run again: a literal already turned into TX() isn't found, a pack that has the template keeps its wording.
"""
import json, os, re, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import textlib as T  # noqa: E402

ROOT = T.ROOT
APP = os.path.join(ROOT, 'arena_app.js')
CODES = ['fr', 'de', 'es', 'it', 'pt', 'tl', 'ta', 'id', 'zh-Hans', 'zh-Hant', 'ja', 'ko']

# key, English template, the literals in arena_app.js it replaces
SPEC = [
    # achievements (ACHIEVEMENT_DEFS desc)
    ('ui.i2-ach-win-n', 'Win {n} matches.', ['Win 10 matches.', 'Win 50 matches.']),
    ('ui.i2-ach-streak-n', 'Reach a {n}-win streak.', ['Reach a 5-win streak.', 'Reach a 10-win streak.']),
    ('ui.i2-ach-own-n', 'Own {n} cards.', ['Own 50 cards.', 'Own 100 cards.', 'Own 200 cards.']),
    ('ui.i2-ach-level-n', 'Have {n} different cards at level 1 or higher.', ['Have 10 different cards at level 1 or higher.']),
    ('ui.i2-ach-clear-n', 'Clear {n} Conquest fights.', ['Clear 5 Conquest fights.']),
    ('ui.i2-ach-maps-n', 'Fully clear {n} Conquest maps.', ['Fully clear 5 Conquest maps.']),
    # daily / weekly quests (QUEST_TIERS label)
    ('ui.i2-q-energy-n', 'Use {n} ⚡ Energy on Conquest fights', ['Use 40 ⚡ Energy on Conquest fights', 'Use 200 ⚡ Energy on Conquest fights']),
    ('ui.i2-q-tickets-n', 'Use {n} 🎟️ PvP tickets', ['Use 3 🎟️ PvP tickets', 'Use 30 🎟️ PvP tickets']),
    ('ui.i2-q-units-n', 'Defeat {n} enemy units', ['Defeat 12 enemy units', 'Defeat 30 enemy units', 'Defeat 100 enemy units']),
    ('ui.i2-q-wins-n', 'Win {n} matches', ['Win 2 matches', 'Win 15 matches']),
    ('ui.i2-q-conquest-n', 'Clear {n} Conquest fights', ['Clear 2 Conquest fights', 'Clear 10 Conquest fights']),
    ('ui.i2-q-pvp-n', 'Win {n} PvP matches', ['Win 2 PvP matches', 'Win 10 PvP matches']),
    ('ui.i2-q-raids-n', 'Join {n} Raids', ['Join 3 Raids']),
    ('ui.i2-q-raiddmg-n', 'Deal {n} Raid damage', ['Deal 4,000 Raid damage']),
    # chaos / skirmish rules
    ('ui.i2-lumber-every-n', 'Both sides gain 1 Lumber every {n} rounds.', ['Both sides gain 1 Lumber every 2 rounds.', 'Both sides gain 1 Lumber every 3 rounds.']),
    ('ui.i2-lumber-every-n-fair', 'Both sides gain 1 Lumber every {n} rounds, on top of what cards give.', ['Both sides gain 1 Lumber every 3 rounds, on top of what cards give.']),
    # the battle-rating colours
    # (not the loss grades FF / FFF, "took 1 / 2 damage or less": French and Italian say 1 dégât / 2 dégâts, and a template has one form)
    ('ui.i2-br-times-n', 'Your battle rating is {n}× theirs', ['Your battle rating is 2.5× theirs', 'Your battle rating is 3× theirs']),
    # raid tiers
    ('ui.i2-top-n', 'Top {n}%', ['Top 1%', 'Top 10%', 'Top 50%']),
]

# Translations for a template no pack row can give (no numbered row in that language), in CODES order.
FALLBACK = {
    'Join {n} Raids': ['Rejoindre {n} raids', 'Nimm an {n} Raids teil', 'Únete a {n} incursiones', 'Partecipa a {n} raid', 'Junta-te a {n} raides',
                       'Sumali sa {n} Raid', '{n} ரெய்டுகளில் சேருங்கள்', 'Ikuti {n} Raid', '参加 {n} 次突袭', '參加 {n} 次突襲', 'レイドに{n}回参加', '레이드 {n}회 참가'],
    'Deal {n} Raid damage': ['Infliger {n} dégâts de raid', 'Verursache {n} Raid-Schaden', 'Inflige {n} de daño de incursión', 'Infliggi {n} danni da raid',
                             'Causa {n} de dano de raide', 'Magdulot ng {n} Raid damage', '{n} ரெய்டு சேதம் ஏற்படுத்துங்கள்', 'Berikan {n} kerusakan Raid',
                             '造成 {n} 点突袭伤害', '造成 {n} 點突襲傷害', 'レイドダメージを{n}与える', '레이드 피해 {n} 주기'],
}


def tx_literal(key, vals):
    parts = []
    for k, v in vals.items():
        parts.append('%s: %s' % (k, v if re.fullmatch(r'\d+(?:\.\d+)?', v) else "'%s'" % v))
    return "TX('%s', {%s})" % (key, ', '.join(parts))


def code_edits(src):
    """[(literal, replacement, count)] for every SPEC literal still in arena_app.js, quoted '...'."""
    out = []
    for key, tpl, lits in SPEC:
        rx = T.template_regex(tpl)
        for lit in lits:
            m = rx.match(lit)
            assert m, (tpl, lit)
            q = "'%s'" % lit.replace("'", "\\'")
            n = src.count(q)
            if n: out.append((q, tx_literal(key, m.groupdict()), n))
    return out


def num_forms(v):
    """The ways a language may write an English number: as is, without its commas, with . or a space as the thousands mark."""
    plain = v.replace(',', '')
    forms = [v, plain]
    if ',' in v: forms += [v.replace(',', sep) for sep in ('.', ' ', ' ', ' ', "'")]
    if '.' in plain and ',' not in v: forms.append(plain.replace('.', ','))
    return list(dict.fromkeys(forms))


def derive(tr, vals):
    """The translation with each number turned back into its {placeholder}, or None when a number isn't there exactly once."""
    out = tr
    for k, v in vals.items():
        hits = [f for f in num_forms(v) if len(re.findall(r'(?<![\d.,])' + re.escape(f) + r'(?![\d])', out)) == 1]
        if not hits: return None
        out = re.sub(r'(?<![\d.,])' + re.escape(hits[0]) + r'(?![\d])', '{%s}' % k, out, count=1)
    return out


def num_value(vals):
    return max((float(v.replace(',', '').replace('\u2212', '-')) for v in vals.values()), default=0)


def digits_free(t):
    return re.sub(r'(?<=\d)[ .,\u00a0\u202f\'](?=\d)', '', t)


def fill(t, vals):
    return re.sub(r'\{(\w+)\}', lambda m: vals.get(m.group(1), m.group(0)), t)


def pack_plan(code):
    """For one language: [(template, translation, [numbered rows dropped], notes)]."""
    main = T_load('lang/%s.json' % code); ui = T_load('lang/ui/%s.json' % code)
    plan = []
    for key, tpl, lits in SPEC:
        rx = T.template_regex(tpl)
        rows = [(k, v, src) for src, pk in (('main', main), ('ui', ui)) for k, v in pk.items() if k != tpl and rx.match(k)]
        notes, cands = [], {}
        for k, v, _ in rows:
            d = derive(v, rx.match(k).groupdict())
            if d is None: notes.append('no number in %r' % v); continue
            cands.setdefault(d, []).append(k)
        have = main.get(tpl) or ui.get(tpl)
        if have: tr = have
        # the reading most rows agree on; on a tie the one from the biggest number (the plural: "2 dégâts", not "1 dégât")
        elif cands: tr = max(cands.items(), key=lambda kv: (len(kv[1]), max(num_value(rx.match(k).groupdict()) for k in kv[1])))[0]
        elif tpl in FALLBACK: tr = FALLBACK[tpl][CODES.index(code)]
        else: tr = None
        if tr:
            for k, v, _ in rows:
                got = fill(tr, rx.match(k).groupdict())
                # the translator writes a number the language's own way (bramblewood-i18n.js localNum), so "4.000" vs "4,000" is no change
                if digits_free(got) != digits_free(v): notes.append('%r was %r, now %r' % (k, v, got))
        plan.append((tpl, tr, [(k, s) for k, _, s in rows], notes))
    return plan


def T_load(rel):
    p = os.path.join(ROOT, rel)
    return json.load(open(p, encoding='utf-8')) if os.path.exists(p) else {}


def T_save(rel, d, sort=False):
    if sort: d = dict(sorted(d.items(), key=lambda kv: kv[0].lower()))
    with open(os.path.join(ROOT, rel), 'w', encoding='utf-8') as fh:
        json.dump(d, fh, ensure_ascii=False, indent=1); fh.write('\n')


def main(argv):
    write, check = '--write' in argv, '--check' in argv
    src = open(APP, encoding='utf-8').read()
    edits = code_edits(src)
    table = T.load_table()
    new_keys = [(k, t) for k, t, _ in SPEC if table.get(k) != t]
    print('code: %d literals in %d places to turn into TX templates' % (len(edits), sum(n for _, _, n in edits)))
    for q, r, n in edits: print('   %s -> %s%s' % (q, r, ' (x%d)' % n if n > 1 else ''))
    print('TEXT table: %d templates to add' % len(new_keys))
    problems, dropped_total, added_total = [], 0, 0
    for code in CODES:
        plan = pack_plan(code)
        main_p, ui_p = T_load('lang/%s.json' % code), T_load('lang/ui/%s.json' % code)
        dropped = added = 0
        for tpl, tr, rows, notes in plan:
            if not tr: problems.append('%s: no translation for %r' % (code, tpl)); continue
            for n_ in notes: print('   %s: %s: %s' % (code, tpl, n_))
            if tpl not in main_p and tpl not in ui_p: main_p[tpl] = tr; added += 1
            for k, s in rows:
                (main_p if s == 'main' else ui_p).pop(k, None); dropped += 1
        dropped_total += dropped; added_total += added
        if write and (dropped or added):
            T_save('lang/%s.json' % code, main_p); T_save('lang/ui/%s.json' % code, ui_p)
    print('packs: %d template rows added, %d numbered rows folded into them (12 languages)' % (added_total, dropped_total))
    for p in problems: print('  !', p)
    if check:
        bad = bool(edits) or bool(new_keys) or bool(problems) or added_total or dropped_total
        print('check:', 'FAIL' if bad else 'ok'); return 1 if bad else 0
    if write:
        for q, r, _ in edits: src = src.replace(q, r)
        open(APP, 'w', encoding='utf-8').write(src)
        for k, t in new_keys: table[k] = t
        if new_keys: T.save_table(table)
        print('written')
    return 1 if problems else 0


if __name__ == '__main__':
    sys.exit(main(sys.argv[1:]))
