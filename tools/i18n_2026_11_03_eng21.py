#!/usr/bin/env python3
"""Game texts added on 2026-11-03 by package ENG21 (owner 20:28): Inspiring's new rule (Inspiration tokens, +2 Attack each, stacking,
spent by the next hit that lands), the Inspiration pip's tip, its two log lines, and the used line of a Pounce that has fired. The TX keys
(ui.eng21-*) are in bramblewood-texts.js; this writes one row per English text in lang/<code>.json, appended in this order (rows that
already exist are kept; the packs' key order is not touched). The three old Inspiring literals leave the UI packs (lang/ui/<code>.json),
order kept. Tagalog, Tamil, Japanese and Korean deserve a native read.
    python3 tools/i18n_2026_11_03_eng21.py"""
import json, os, re
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
CODES = ['fr', 'de', 'es', 'it', 'pt', 'tl', 'ta', 'id', 'zh-Hans', 'zh-Hant', 'ja', 'ko']
T = [  # English, then the 12 translations in CODES order
 ('When it attacks, adjacent allies gain {n} Inspiration (+2 Attack each, stacking), spent on their next hit.', [
  'Quand elle attaque, ses alliés adjacents gagnent {n} Inspiration (+2 Attaque chacune, cumulable), dépensée à leur prochain coup qui touche.',
  'Wenn sie angreift, erhalten angrenzende Verbündete {n} Inspiration (je +2 Angriff, stapelbar), verbraucht beim nächsten Treffer.',
  'Cuando ataca, los aliados adyacentes ganan {n} de Inspiración (+2 de Ataque cada una, acumulable), gastada en su próximo acierto.',
  'Quando attacca, gli alleati adiacenti ottengono {n} Ispirazione (+2 Attacco ciascuna, cumulabile), spesa al prossimo colpo a segno.',
  'Quando ataca, os aliados adjacentes ganham {n} de Inspiração (+2 de Ataque cada, acumulável), gasta no próximo acerto.',
  'Kapag umatake ito, ang mga katabing kakampi ay nagkakaroon ng {n} Inspirasyon (+2 Atake bawat isa, nagpapatong), ginagastos sa susunod na tama.',
  'அது தாக்கும்போது, அருகிலுள்ள கூட்டாளிகள் {n} ஊக்கம் பெறும் (ஒவ்வொன்றும் +2 தாக்குதல், அடுக்காகும்), அடுத்த படும் தாக்குதலில் செலவாகும்.',
  'Saat menyerang, sekutu di sebelahnya mendapat {n} Inspirasi (+2 Serangan masing-masing, bisa ditumpuk), habis pada serangan berikutnya yang kena.',
  '它攻击时，相邻友军获得 {n} 层鼓舞（每层攻击 +2，可叠加），在下一次命中时用掉。',
  '它攻擊時，相鄰友軍獲得 {n} 層鼓舞（每層攻擊 +2，可疊加），在下一次命中時用掉。',
  '攻撃する時、隣接する味方が鼓舞を{n}得る（1つにつき攻撃+2、重ねがけ可）。次の命中で使う。',
  '공격할 때 인접한 아군이 고무 {n}을 얻어요 (하나마다 공격 +2, 중첩). 다음 명중에서 써요.']),
 ('Inspiration {n}: +{atk} Attack, spent on its next attack that hits.', [
  'Inspiration {n} : +{atk} Attaque, dépensée lors de sa prochaine attaque qui touche.',
  'Inspiration {n}: +{atk} Angriff, verbraucht bei seinem nächsten Angriff, der trifft.',
  'Inspiración {n}: +{atk} de Ataque, se gasta en su próximo ataque que acierte.',
  'Ispirazione {n}: +{atk} Attacco, spesa al suo prossimo attacco che colpisce.',
  'Inspiração {n}: +{atk} de Ataque, gasta no seu próximo ataque que acertar.',
  'Inspirasyon {n}: +{atk} Atake, ginagastos sa susunod nitong atakeng tumama.',
  'ஊக்கம் {n}: +{atk} தாக்குதல், அடுத்துத் தாக்கிப் படும்போது செலவாகும்.',
  'Inspirasi {n}: +{atk} Serangan, habis pada serangan berikutnya yang kena.',
  '鼓舞 {n}：攻击 +{atk}，在下一次命中的攻击时用掉。',
  '鼓舞 {n}：攻擊 +{atk}，在下一次命中的攻擊時用掉。',
  '鼓舞{n}：攻撃+{atk}、次に命中した攻撃で使う。',
  '고무 {n}: 공격 +{atk}, 다음에 명중한 공격에서 써요.']),
 ('inspired {target}: +{n} Inspiration (+{atk}⚔ until it hits) 📯', [
  'a inspiré {target} : +{n} Inspiration (+{atk}⚔ jusqu’à ce qu’il touche) 📯',
  'inspirierte {target}: +{n} Inspiration (+{atk}⚔ bis zum Treffer) 📯',
  'inspiró a {target}: +{n} de Inspiración (+{atk}⚔ hasta que acierte) 📯',
  'ha ispirato {target}: +{n} Ispirazione (+{atk}⚔ finché non colpisce) 📯',
  'inspirou {target}: +{n} de Inspiração (+{atk}⚔ até acertar) 📯',
  'ininspira si {target}: +{n} Inspirasyon (+{atk}⚔ hanggang tumama) 📯',
  '{target}-ஐ ஊக்குவித்தது: +{n} ஊக்கம் (படும் வரை +{atk}⚔) 📯',
  'menginspirasi {target}: +{n} Inspirasi (+{atk}⚔ sampai kena) 📯',
  '鼓舞了 {target}：+{n} 层鼓舞（命中前 +{atk}⚔）📯',
  '鼓舞了 {target}：+{n} 層鼓舞（命中前 +{atk}⚔）📯',
  '{target}を鼓舞：鼓舞+{n}（命中するまで+{atk}⚔）📯',
  '{target}을(를) 고무: 고무 +{n} (명중할 때까지 +{atk}⚔) 📯']),
 ('spent its Inspiration: +{atk}⚔ on that hit 📯', [
  'a dépensé son Inspiration : +{atk}⚔ sur ce coup 📯',
  'verbrauchte seine Inspiration: +{atk}⚔ auf diesen Treffer 📯',
  'gastó su Inspiración: +{atk}⚔ en ese golpe 📯',
  'ha speso la sua Ispirazione: +{atk}⚔ su quel colpo 📯',
  'gastou sua Inspiração: +{atk}⚔ nesse golpe 📯',
  'ginastos ang Inspirasyon nito: +{atk}⚔ sa tamang iyon 📯',
  'தன் ஊக்கத்தைச் செலவழித்தது: அந்தத் தாக்குதலில் +{atk}⚔ 📯',
  'menghabiskan Inspirasinya: +{atk}⚔ pada serangan itu 📯',
  '用掉了鼓舞：这次命中 +{atk}⚔ 📯',
  '用掉了鼓舞：這次命中 +{atk}⚔ 📯',
  '鼓舞を使った：その命中で+{atk}⚔ 📯',
  '고무를 썼어요: 그 공격에 +{atk}⚔ 📯']),
 ('Already used: it pounced as it landed.', [
  'Déjà utilisé : elle a bondi en arrivant.',
  'Schon verbraucht: Sie ist beim Eintreffen angesprungen.',
  'Ya usado: se abalanzó al llegar.',
  'Già usato: è balzata appena arrivata.',
  'Já usado: deu o bote ao chegar.',
  'Nagamit na: sumunggab ito pagdating.',
  'ஏற்கனவே பயன்பட்டது: வந்தவுடன் அது பாய்ந்தது.',
  'Sudah dipakai: ia menerkam saat tiba.',
  '已用过：它登场时已经猛扑过。',
  '已用過：它登場時已經猛撲過。',
  '使用済み：登場時に飛びかかった。',
  '이미 사용함: 등장할 때 덮쳤어요.']),
]
ph = lambda s: sorted(set(re.findall(r'\{\w+\}', s)))
def dump(path, d):
    with open(path, 'w', encoding='utf-8') as fh:
        json.dump(d, fh, ensure_ascii=False, indent=1); fh.write('\n')
added = 0
for i, code in enumerate(CODES):
    path = os.path.join(ROOT, 'lang', code + '.json'); pack = json.load(open(path, encoding='utf-8'))
    for en, row in T:
        assert len(row) == 12 and ph(en) == ph(row[i]), (code, en)
        if en not in pack: added += 1
        pack.setdefault(en, row[i])
    dump(path, pack)
# The old Inspiring literals (arena_app.js PASSIVE_DEFS desc, SKILL_TEXT, the log line; TX keys above now) leave the UI packs; order kept.
GONE_MAIN = ['When it attacks, each adjacent ally gains {n} Inspiration: +2 Attack each, and it stacks. An ally spends all of it on its next attack that hits.']  # ENG21's own first wording (too long for a card line), dropped
for code in CODES:
    path = os.path.join(ROOT, 'lang', code + '.json'); pack = json.load(open(path, encoding='utf-8'))
    for en in GONE_MAIN: pack.pop(en, None)
    dump(path, pack)
GONE = ['As it attacks, its adjacent allies get +{v1} Attack for their next swing.', 'When it attacks, adjacent allies get +{v1} Attack on their next attack.', 'inspired {v1} (+{v2}⚔ next swing) 📯']
dropped = 0
for code in CODES:
    path = os.path.join(ROOT, 'lang', 'ui', code + '.json'); pack = json.load(open(path, encoding='utf-8'))
    for en in GONE:
        if en in pack: del pack[en]; dropped += 1
    dump(path, pack)
print('ok: %d rows added across %d packs, %d old UI rows dropped' % (added, len(CODES), dropped))
