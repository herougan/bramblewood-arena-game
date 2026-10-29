#!/usr/bin/env python3
"""Game texts changed on 2026-10-29 by package UI1 (owner O8: "Quests page should not show dailies/weeklies. Quests refer to the errands etc. - just
rename the errands as just quests. Dailies/weeklies/monthlies are their own thing").

- The player-facing word "errand" becomes "quest" (the 3 toasts in bramblewood-texts.js and their rows in lang/<code>.json; the literal UI strings in
  lang/ui/<code>.json). Each new translation is the old errand translation with the errand word swapped for the language's own Quest word (the one
  Quests / Quest done! already use); Spanish and Portuguese change gender (Reclámala / Reclama-a), so those rows are written out.
- New rows: the Dailies tab, "Your dailies", "Dailies & quests" (the home note) and the Quests tab's one-line intro.
- The old errand rows are removed from the packs (the page tests fail on stale rows).
Tagalog, Tamil, Japanese and Korean deserve a native read.
    python3 tools/i18n_2026_10_29_ui1.py"""
import json, os, re
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
CODES = ['fr', 'de', 'es', 'it', 'pt', 'tl', 'ta', 'id', 'zh-Hans', 'zh-Hant', 'ja', 'ko']

# (old English, new English) in lang/ui, then in the main packs (emoji-free keys, as the packs have them)
UI_RENAMES = [
 ("Errands. Small favours, small rewards. They add up.", "Quests. Small favours, small rewards. They add up."),
 ("Give up this errand", "Give up this quest"),
 ("No errands yet. Folk on the road ask for favours after a fight now and then: say yes, and their writ goes up here.", "No quests yet. Folk on the road ask for favours after a fight now and then: say yes, and their writ goes up here."),
 ("You have {v1} errands already", "You have {v1} quests already"),
]
UI_DROP = ["Errand", "Errands", "Your quests", "Errand done!",
 # the old Quests tab intro (cut in pieces around its placeholder) and the removed Match History panel
 ", and the favours folk asked of you on the road", "The quests you're on{v1}. Tap one to see its notice; claim the reward when it's done.",
 "No events recorded for this match.", "No matches recorded yet — play a match and it shows up here.", "Your last {v1} real matches — tap one to read back its full battle log."]
MAIN_RENAMES = [
 ("Errand complete: {title}. Claim it on the Notices.", "Quest complete: {title}. Claim it on the Notices."),
 ("Errand taken: {label}", "Quest taken: {label}"),
 ("Errand: {title} — {v}/{g}", "Quest: {title} — {v}/{g}"),
]
MAIN_DROP = ["Errand done!"]
# the errand word -> the quest word, per language (applied to the old translation); es / pt are written out below
SWAP = {
 'fr': [('courses', 'quêtes'), ('course', 'quête'), ('Courses', 'Quêtes'), ('Course', 'Quête')],
 'de': [],
 'it': [('commissioni', 'missioni'), ('commissione', 'missione'), ('Commissioni', 'Missioni'), ('Commissione', 'Missione')],
 'tl': [('Mga utos', 'Mga quest'), ('utos', 'quest'), ('Utos', 'Quest')],
 'ta': [],
 'id': [('Tugas', 'Misi'), ('tugas', 'misi')],
 'zh-Hans': [('差事', '任务')],
 'zh-Hant': [('差事', '任務')],
 'ja': [('おつかいだ。', 'クエストだ。'), ('おつかい', 'クエスト')],
 'ko': [('심부름이에요.', '퀘스트예요.'), ('심부름이', '퀘스트가'), ('심부름', '퀘스트')],
}
WRITTEN = {
 'es': {
  "Quests. Small favours, small rewards. They add up.": "Misiones. Pequeños favores, pequeñas recompensas. Se van sumando.",
  "Give up this quest": "Abandonar esta misión",
  "No quests yet. Folk on the road ask for favours after a fight now and then: say yes, and their writ goes up here.": "Aún no hay misiones. De vez en cuando, la gente del camino pide favores tras una pelea: di que sí y su petición aparecerá aquí.",
  "You have {v1} quests already": "Ya tienes {v1} misiones",
  "Quest complete: {title}. Claim it on the Notices.": "Misión completada: {title}. Reclámala en los Avisos.",
  "Quest taken: {label}": "Misión aceptada: {label}",
  "Quest: {title} — {v}/{g}": "Misión: {title} — {v}/{g}",
 },
 'pt': {
  "Quests. Small favours, small rewards. They add up.": "Missões. Pequenos favores, pequenas recompensas. Vão-se somando.",
  "Give up this quest": "Desistir desta missão",
  "No quests yet. Folk on the road ask for favours after a fight now and then: say yes, and their writ goes up here.": "Ainda não há missões. De vez em quando, depois de uma batalha, a gente da estrada pede favores: diz que sim, e o pedido aparece aqui.",
  "You have {v1} quests already": "Já tens {v1} missões",
  "Quest complete: {title}. Claim it on the Notices.": "Missão concluída: {title}. Reclama-a nos Avisos.",
  "Quest taken: {label}": "Missão aceite: {label}",
  "Quest: {title} — {v}/{g}": "Missão: {title} — {v}/{g}",
 },
}
# new rows (ui pack): Your dailies, Dailies, Dailies & quests, the Quests tab's intro
NEW_UI = [
 ('Your dailies', ['Vos quotidiennes', 'Deine Täglichen', 'Tus diarias', 'Le tue giornaliere', 'As tuas diárias', 'Ang mga araw-araw mo', 'உன் தினசரிகள்', 'Harianmu', '你的每日任务', '你的每日任務', 'あなたのデイリー', '내 일일 퀘스트']),
 ('Dailies', ['Quotidiennes', 'Tägliche', 'Diarias', 'Giornaliere', 'Diárias', 'Araw-araw', 'தினசரிகள்', 'Harian', '每日', '每日', 'デイリー', '일일']),
 ('Dailies & quests', ['Quotidiennes et quêtes', 'Tägliche & Aufträge', 'Diarias y misiones', 'Giornaliere e missioni', 'Diárias e missões', 'Araw-araw at quest', 'தினசரி & பணிகள்', 'Harian & misi', '每日与任务', '每日與任務', 'デイリー＆クエスト', '일일 및 퀘스트']),
 ('The favours folk asked of you on the road. Take one, finish it, and claim the reward.', [
  'Les services que les gens de la route vous ont demandés. Prenez-en un, terminez-le et réclamez la récompense.',
  'Die Gefallen, um die dich Leute auf der Straße gebeten haben. Nimm einen an, erledige ihn und hol dir die Belohnung.',
  'Los favores que te pidió la gente del camino. Acepta uno, termínalo y reclama la recompensa.',
  'I favori che la gente per strada ti ha chiesto. Accettane uno, portalo a termine e riscatta la ricompensa.',
  'Os favores que a gente da estrada te pediu. Aceita um, conclui-o e reclama a recompensa.',
  'Ang mga pabor na hiniling sa iyo ng mga tao sa daan. Kumuha ng isa, tapusin ito, at i-claim ang gantimpala.',
  'பாதையில் உள்ளவர்கள் உன்னிடம் கேட்ட உதவிகள். ஒன்றை ஏற்றுக்கொள், முடித்து, வெகுமதியைப் பெற்றுக்கொள்.',
  'Bantuan yang diminta orang di jalan darimu. Ambil satu, selesaikan, lalu klaim hadiahnya.',
  '路上的人请你帮的忙。接下一个，完成它，然后领取奖励。',
  '路上的人請你幫的忙。接下一個，完成它，然後領取獎勵。',
  '道で出会った人たちからの頼みごと。引き受けて、達成して、報酬を受け取りましょう。',
  '길 위의 사람들이 부탁한 일이에요. 하나 맡아서 끝내고 보상을 받으세요.']),
]
TEXTS = [  # bramblewood-texts.js values (the toasts)
 ('"📌 Errand taken: {label}"', '"📌 Quest taken: {label}"'),
 ('"📜 Errand complete: {title}. Claim it on the Notices."', '"📜 Quest complete: {title}. Claim it on the Notices."'),
 ('"📜 Errand: {title} — {v}/{g}"', '"📜 Quest: {title} — {v}/{g}"'),
]
def dump(path, d):
    with open(path, 'w', encoding='utf-8') as fh:
        json.dump(d, fh, ensure_ascii=False, indent=1); fh.write('\n')
ph = lambda s: sorted(set(re.findall(r'\{\w+\}', s)))
def swap(code, text):
    for a, b in SWAP[code]: text = text.replace(a, b)
    return text

TP = os.path.join(ROOT, 'bramblewood-texts.js'); src = open(TP, encoding='utf-8').read()
for old, new in TEXTS:
    if old in src: src = src.replace(old, new)
    assert new in src, new
open(TP, 'w', encoding='utf-8').write(src)

for i, code in enumerate(CODES):
    for kind, renames, drop in (('ui', UI_RENAMES, UI_DROP), ('', MAIN_RENAMES, MAIN_DROP)):
        path = os.path.join(ROOT, 'lang', *( [kind] if kind else []), code + '.json'); pack = json.load(open(path, encoding='utf-8'))
        for old, new in renames:
            if new in pack and old not in pack: continue  # already done (the script can run again)
            val = WRITTEN[code][new] if code in WRITTEN else swap(code, pack.get(old, ''))
            assert val and ph(new) == ph(val), (code, new, val)
            pack.pop(old, None); pack[new] = val
        for k in drop:
            if k == 'Errand done!' or kind == 'ui' or True: pack.pop(k, None)
        if kind == 'ui':
            for en, row in NEW_UI:
                assert ph(en) == ph(row[i]), (code, en)
                pack[en] = row[i]
        dump(path, pack)
print('ok: texts + %d packs x2' % len(CODES))
