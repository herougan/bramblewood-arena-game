#!/usr/bin/env python3
"""Move the high-value player texts out of arena_app.js into the TEXT table (2026-10-15).

    python3 tools/text/keyify.py [--dry-run]

Rewrites each chosen literal (or the text run inside an HTML template) as TX('key'[, {vars}]) and adds the English to
bramblewood-texts.js. A numbered literal that is a TEXT template with numbers in ("Own 300 cards." for "Own {n} cards.") reuses
that key with the numbers as values (2026-10-23, package SX, owner I2). Chosen: toasts (showToast), dialogs (bwConfirm / bwChoice / confirm / alert / prompt), coach and
tutorial tips, and the results screens. Safe to run again: what is already TX() isn't a literal any more. Texts with ${...}
parts become {name} placeholders; a run that has literal { } in it, an HTML attribute, admin-only text, and the data blocks
that tools and tests evaluate (CONQUEST_MAPS and friends) are left alone.
"""
import os, re, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import textlib as T

APP = 'arena_app.js'
DIALOG_CALLEE = re.compile(r'(?:^|\.)(?:bwConfirm|bwChoice|confirm|alert|prompt)$')
TOAST_CALLEE = re.compile(r'(?:^|\.)showToast$')
COACH_SCOPES = re.compile(r'^(?:GUIDED_STEPS|STATUS_TIPS|PITCH_WAIT_TIP|PITCH_LESSON|passiveTipCandidates|maybeShowCoachTip|showCoachTip|'
                          r'guideToTutorial2|tutorialLeaderJoin|phaseTipLines|pitchLessonTip)$')
TUTORIAL_SCOPES = re.compile(r'^(?:TUTORIAL_STAGE_META|tutorialWinLossTitle|GUIDED_STEPS|STATUS_TIPS|PITCH_WAIT_TIP|PITCH_LESSON|'
                             r'maybeLumberLesson|leaderLessonScript|rarityLessonScript|LEADER_RULE_TEXT|leaderRuleScript|GAME_TIPS|'
                             r'tutorialLeaderJoin|guideToTutorial2|continueTutorialFromHome)$')
RESULT_SCOPES = re.compile(r'^(?:lossTitle|winTitle|tutorialWinLossTitle|lossTipHTML|defeatQuoteHTML|DEFEAT_QUOTES|rankLessonHTML|'
                           r'RANK_LESSONS|gloryBadgesHTML|rewardsPanelHTML|nextBattleButtonHTML|matchStatsHTML|rewardsCheer|'
                           r'playRewardReveal|diffUnlocks|renderAbResult|tutorialWinLossSubtitleHTML)$')
# data blocks other tools/tests evaluate or pattern-match: never touched
FROZEN_SCOPES = re.compile(r'^(?:CONQUEST_MAPS|CONQUEST_MAPS_BASELINE|FXL_SKILL_SETUPS|MAP_BIOME_OF|MAP_DAYNIGHT|EGG_KINDS|meiosisWarning|'
                           r'isCrabDef|bloomLabel|battlefieldShake|endlessDungeon|migrateLegacyNodeIds|SKILL_ICON|DIALOGUES)$')


def category(run, scopes, src):
    L = run.lit
    chain = scopes.chain_at(run.start)
    if any(FROZEN_SCOPES.search(nm) for nm in chain): return None
    if T.is_admin_context(src, L): return None
    if run.attr and re.search(r'[<>&]', run.text): return None
    if T.area_for(chain or ['(top)']) == 'Admin / dev': return None
    if '{' in re.sub(r'\{\d+\}', '', run.text) or '}' in re.sub(r'\{\d+\}', '', run.text): return None
    calls = [c for c in (L.calls or []) if c]
    if calls and TOAST_CALLEE.search(calls[0]): return 'toast'
    if any(DIALOG_CALLEE.search(c) for c in calls[:2]) and (L.callee and DIALOG_CALLEE.search(L.callee) or L.key in ('title', 'body', 'okLabel', 'cancelLabel', 'label', 'list', 'hint', 'note')):
        return 'dialog'
    if L.key == 'text' and any(COACH_SCOPES.search(nm) for nm in chain): return 'coach'
    if any(TUTORIAL_SCOPES.search(nm) for nm in chain):
        # dialogue-style scripts: only the spoken text and the reply buttons (a line's own `label` is a jump target)
        if L.key in ('label', 'goto', 'silent', 'who', 'act'): return None
        return 'tutorial'
    if any(RESULT_SCOPES.search(nm) for nm in chain): return 'results'
    if any(COACH_SCOPES.search(nm) for nm in chain) and L.key in T.TEXT_KEYS: return 'coach'
    return None


def var_name(expr, used, idx):
    e = expr.strip()
    m = re.fullmatch(r'(?:escapeHtml|escapeAttr|String|Number|Math\.round|Math\.abs|Math\.max|fmtNum)?\(?\s*([\w$.]+?)(?:\(\))?\s*\)?', e)
    if re.fullmatch(r'[\w$.]+\s*===?\s*1\s*\?\s*[\'"][a-z]*[\'"]\s*:\s*[\'"]([a-z]+)[\'"]', e):
        base = re.search(r':\s*[\'"]([a-z]+)[\'"]\s*$', e).group(1)
        base = 's' if base == 's' else 'plural_' + base
    elif m:
        base = re.sub(r'[^\w]', '', m.group(1).split('.')[-1]) or 'v%d' % idx
    else:
        base = 'v%d' % idx
    if not re.match(r'^[A-Za-z_]', base): base = 'v' + base
    name, k = base, 2
    while name in used and used[name] != e:
        name = '%s%d' % (base, k); k += 1
    used[name] = e
    return name


def tx_call(key, run):
    if not run.exprs:
        return "TX('%s')" % key, run.text
    used, names = {}, []
    for k, e in enumerate(run.exprs, 1):
        names.append(var_name(e, used, k))
    text = re.sub(r'\{(\d+)\}', lambda m: '{%s}' % names[int(m.group(1)) - 1], run.text)
    pairs, seen = [], set()
    for nm, e in zip(names, run.exprs):
        if nm in seen: continue
        seen.add(nm)
        pairs.append(nm if nm == e.strip() else '%s: %s' % (nm, e.strip()))
    return "TX('%s', {%s})" % (key, ', '.join(pairs)), text


def number_call(key, vals):
    return "TX('%s', {%s})" % (key, ', '.join('%s: %s' % (k, v if re.fullmatch(r'\d+(?:\.\d+)?', v) else "'%s'" % v) for k, v in vals.items()))


def one_pass(src, table, dry):
    lits, _ = T.lex(src)
    scopes = T.Scopes(src, T.lex.ranges)
    by_lit = {}
    for L in lits:
        for run in T.literal_runs(src, L):
            if not T.is_player_text(run, src): continue
            cat = category(run, scopes, src)
            if not cat: continue
            by_lit.setdefault(id(L), (L, []))[1].append((run, cat))
    edits = []
    text_to_key = {v: k for k, v in table.items()}
    # 2026-10-23 (package SX, owner I2 "Template change"): a numbered literal that is a TEXT template with numbers in ("Own 300 cards."
    # against "Own {n} cards.") reuses that key with its numbers as values, so it never becomes one more row per number.
    num_tpl = T.NumberTemplates(table.values())
    for L, items in by_lit.values():
        quote = src[L.start]
        pieces = []
        for run, cat in sorted(items, key=lambda x: x[0].start):
            base = '%s.%s' % (cat, T.slug(run.text, 6))
            call, value = tx_call(base, run)
            hit = num_tpl.match(value) if not run.exprs else None
            if hit and text_to_key.get(hit[0]):
                pieces.append((run, number_call(text_to_key[hit[0]], hit[1]))); continue
            key = text_to_key.get(value) if text_to_key.get(value, '').startswith(cat + '.') else None
            if key is None:
                key, k = base, 2
                while key in table and table[key] != value:
                    key = '%s-%d' % (base, k); k += 1
                table[key] = value; text_to_key[value] = key
            call, _ = tx_call(key, run)
            pieces.append((run, call))
        if L.kind == 't':
            if len(pieces) == 1 and pieces[0][0].whole:
                edits.append((L.start, L.end, pieces[0][1]))
            else:
                for run, call in pieces:
                    # an HTML attribute (title=, aria-label=...): escapeAttr keeps a " typed into the sheet from breaking it
                    edits.append((run.start, run.end, '${' + ('escapeAttr(%s)' % call if run.attr else call) + '}'))
        else:
            if len(pieces) == 1 and pieces[0][0].whole:
                edits.append((L.start, L.end, pieces[0][1]))
            else:
                out, pos = [], L.start + 1
                for run, call in pieces:
                    if run.start > pos: out.append(quote + src[pos:run.start] + quote)
                    out.append('escapeAttr(%s)' % call if run.attr else call); pos = run.end
                if pos < L.end - 1: out.append(quote + src[pos:L.end - 1] + quote)
                edits.append((L.start, L.end, '(' + ' + '.join(out) + ')'))
    # keep only edits that don't overlap: outermost first, nested ones go next pass
    edits.sort(key=lambda e: (e[0], -(e[1] - e[0])))
    keep, last_end = [], -1
    for e in edits:
        if e[0] >= last_end:
            keep.append(e); last_end = e[1]
    for a, b, new in sorted(keep, reverse=True):
        src = src[:a] + new + src[b:]
    return src, len(keep)


def main():
    dry = '--dry-run' in sys.argv
    path = os.path.join(T.ROOT, APP)
    src = open(path, encoding='utf-8').read()
    table = T.load_table()
    n0, before = len(table), set(table)
    total = 0
    for _ in range(6):
        src, n = one_pass(src, table, dry)
        total += n
        if not n: break
    used = set(re.findall(r"\bTX\('([^']+)'", src))
    # keys made in this run for a run that a wider edit swallowed. Only this run's: keys the game looks up by a built name
    # ('ui.tf-' + name, 'ui.fog-row-' + k) have no literal TX('...') and must stay (2026-10-23, SX; the AR warning in ui.md)
    for k in [k for k in table if k not in used and k not in before]:
        del table[k]
    print('keyify: %d literal edits, %d new keys (%d in the table)' % (total, len(table) - n0, len(table)))
    if not dry:
        open(path, 'w', encoding='utf-8').write(src)
        T.save_table(table)


if __name__ == '__main__':
    main()
