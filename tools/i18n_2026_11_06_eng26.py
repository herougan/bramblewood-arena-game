#!/usr/bin/env python3
"""Game texts added on 2026-11-06 by package ENG26 (owner notes 09:29): the escalating Bloom, an Undead unit's heals and cures, Banner Knoll's
passive (your Leader +2/+3; bramble names and flavour are not translated, as for every bramble). Adds the TX keys to bramblewood-texts.js (before the table's end, once), changes the two Bloom descriptions, and adds one
row per English text in lang/<code>.json (rows that already exist are kept; new rows are appended, nothing is sorted).
Tagalog, Tamil, Japanese and Korean deserve a native read.
    python3 tools/i18n_2026_11_06_eng26.py   (idempotent)"""
import json, os, re
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
CODES = ['fr', 'de', 'es', 'it', 'pt', 'tl', 'ta', 'id', 'zh-Hans', 'zh-Hant', 'ja', 'ko']
T = [
 ('ui.eng26-bloom-log', '🌸 {name} blooms: a copy of it grows beside it, with +{a}/+{a}.', [
   '🌸 {name} fleurit : une copie pousse à côté, avec +{a}/+{a}.',
   '🌸 {name} blüht: Eine Kopie wächst neben ihr, mit +{a}/+{a}.',
   '🌸 {name} florece: crece una copia a su lado, con +{a}/+{a}.',
   '🌸 {name} fiorisce: accanto cresce una copia, con +{a}/+{a}.',
   '🌸 {name} floresce: cresce uma cópia ao lado, com +{a}/+{a}.',
   '🌸 Namumulaklak ang {name}: may kopyang tumubo sa tabi nito, may +{a}/+{a}.',
   '🌸 {name} மலர்கிறது: அதன் நகல் அருகில் வளர்கிறது, +{a}/+{a} உடன்.',
   '🌸 {name} mekar: salinannya tumbuh di sampingnya, dengan +{a}/+{a}.',
   '🌸 {name} 花开：旁边长出一个复制体，+{a}/+{a}。',
   '🌸 {name} 開花：旁邊長出一個複製體，+{a}/+{a}。',
   '🌸 {name}が開花：隣にコピーが育つ（+{a}/+{a}）。',
   '🌸 {name} 개화: 옆에 복제본이 자랍니다 (+{a}/+{a}).']),
 ('ui.eng26-bloom-log-lumber', '🌸 {name} blooms for {n} Lumber: a copy of it grows beside it, with +{a}/+{a}.', [
   '🌸 {name} fleurit pour {n} Bois : une copie pousse à côté, avec +{a}/+{a}.',
   '🌸 {name} blüht für {n} Holz: Eine Kopie wächst neben ihr, mit +{a}/+{a}.',
   '🌸 {name} florece por {n} de Madera: crece una copia a su lado, con +{a}/+{a}.',
   '🌸 {name} fiorisce per {n} Legname: accanto cresce una copia, con +{a}/+{a}.',
   '🌸 {name} floresce por {n} de Madeira: cresce uma cópia ao lado, com +{a}/+{a}.',
   '🌸 Namumulaklak ang {name} sa halagang {n} Kahoy: may kopyang tumubo sa tabi nito, may +{a}/+{a}.',
   '🌸 {name} {n} மரத்துக்கு மலர்கிறது: அதன் நகல் அருகில் வளர்கிறது, +{a}/+{a} உடன்.',
   '🌸 {name} mekar seharga {n} Kayu: salinannya tumbuh di sampingnya, dengan +{a}/+{a}.',
   '🌸 {name} 花费 {n} 木材花开：旁边长出一个复制体，+{a}/+{a}。',
   '🌸 {name} 花費 {n} 木材開花：旁邊長出一個複製體，+{a}/+{a}。',
   '🌸 {name}が木材{n}で開花：隣にコピーが育つ（+{a}/+{a}）。',
   '🌸 {name} 목재 {n}로 개화: 옆에 복제본이 자랍니다 (+{a}/+{a}).']),
 ('ui.eng26-log-undead-heal', '🧟 {name} is Undead: the heal hurts it for {n}.', [
   '🧟 {name} est Mort-vivant : le soin lui inflige {n}.',
   '🧟 {name} ist Untot: Die Heilung fügt ihr {n} Schaden zu.',
   '🧟 {name} es No muerto: la curación le hace {n} de daño.',
   '🧟 {name} è Non morto: la cura le infligge {n}.',
   '🧟 {name} é Morto-vivo: a cura causa-lhe {n} de dano.',
   '🧟 Undead ang {name}: sinasaktan ito ng lunas nang {n}.',
   '🧟 {name} இறவாதது: குணமாக்கல் அதற்கு {n} சேதம் தருகிறது.',
   '🧟 {name} adalah Mayat Hidup: penyembuhan melukainya {n}.',
   '🧟 {name} 是亡灵：治疗反而对它造成 {n} 点伤害。',
   '🧟 {name} 是亡靈：治療反而對它造成 {n} 點傷害。',
   '🧟 {name}はアンデッド：回復で{n}ダメージを受ける。',
   '🧟 {name}은(는) 언데드: 회복이 오히려 {n} 피해를 줍니다.']),
 ('ui.eng26-log-undead-cure', '🧟 {name} is Undead: the cure makes it Bleed {n}.', [
   '🧟 {name} est Mort-vivant : la guérison le fait saigner {n}.',
   '🧟 {name} ist Untot: Die Reinigung lässt sie {n} bluten.',
   '🧟 {name} es No muerto: la cura le causa Sangrado {n}.',
   '🧟 {name} è Non morto: la guarigione le dà Sanguinamento {n}.',
   '🧟 {name} é Morto-vivo: a purificação dá-lhe Sangramento {n}.',
   '🧟 Undead ang {name}: pinadudugo ito ng gamot nang {n}.',
   '🧟 {name} இறவாதது: சுத்திகரிப்பு அதற்கு இரத்தக்கசிவு {n} தருகிறது.',
   '🧟 {name} adalah Mayat Hidup: penawar membuatnya Berdarah {n}.',
   '🧟 {name} 是亡灵：治愈反而让它流血 {n}。',
   '🧟 {name} 是亡靈：治癒反而讓它流血 {n}。',
   '🧟 {name}はアンデッド：浄化で出血{n}を受ける。',
   '🧟 {name}은(는) 언데드: 정화가 오히려 출혈 {n}을 줍니다.']),
 ('ui.eng26-float-undead-heal', '🧟 Heal hurts', [
   '🧟 Le soin blesse', '🧟 Heilung schadet', '🧟 La cura hiere', '🧟 La cura ferisce', '🧟 A cura fere', '🧟 Masakit ang lunas',
   '🧟 குணம் காயம்', '🧟 Sembuh melukai', '🧟 治疗即伤害', '🧟 治療即傷害', '🧟 回復でダメージ', '🧟 회복이 피해']),
 ('ui.eng26-float-undead-cure', '🧟 🩸{n}', [
   '🧟 🩸{n}', '🧟 🩸{n}', '🧟 🩸{n}', '🧟 🩸{n}', '🧟 🩸{n}', '🧟 🩸{n}', '🧟 🩸{n}', '🧟 🩸{n}', '🧟 🩸{n}', '🧟 🩸{n}', '🧟 🩸{n}', '🧟 🩸{n}']),
 ('ui.eng26-undead-rule', 'Undead: a heal hurts it for as much instead; a cure or cleanse makes it Bleed instead.', [
   'Mort-vivant : un soin lui inflige autant de dégâts ; une guérison ou une purification le fait saigner.',
   'Untot: Eine Heilung fügt ihr stattdessen so viel Schaden zu; eine Heilung von Gift oder eine Reinigung lässt sie bluten.',
   'No muerto: una curación le hace ese daño en su lugar; una cura o purificación le causa Sangrado.',
   'Non morto: una cura le infligge altrettanti danni; una guarigione o purificazione le dà Sanguinamento.',
   'Morto-vivo: uma cura causa-lhe o mesmo em dano; uma purificação ou limpeza dá-lhe Sangramento.',
   'Undead: sa halip na gumaling, napipinsala ito nang ganoon din; pinadudugo ito ng gamot o paglilinis.',
   'இறவாதது: குணமாக்கல் அதே அளவு சேதம் தரும்; சிகிச்சை அல்லது சுத்திகரிப்பு இரத்தக்கசிவு தரும்.',
   'Mayat Hidup: penyembuhan malah melukainya sebanyak itu; penawar atau pembersihan membuatnya Berdarah.',
   '亡灵：治疗改为造成等量伤害；治愈或净化改为使其流血。',
   '亡靈：治療改為造成等量傷害；治癒或淨化改為使其流血。',
   'アンデッド：回復は同じだけのダメージになり、治療や浄化は出血になる。',
   '언데드: 회복은 같은 만큼의 피해가 되고, 치료나 정화는 출혈이 됩니다.']),
 ('ui.eng26-log-leader-boon', '🚩 {name} takes the field as your Leader: +{a}/+{h} from the bramble.', [
   '🚩 {name} entre en jeu comme Chef : +{a}/+{h} grâce au roncier.',
   '🚩 {name} betritt das Feld als Anführer: +{a}/+{h} durch die Dornenhecke.',
   '🚩 {name} entra al campo como Líder: +{a}/+{h} del zarzal.',
   '🚩 {name} scende in campo come Capo: +{a}/+{h} dal rovo.',
   '🚩 {name} entra em campo como Líder: +{a}/+{h} do silvado.',
   '🚩 Pumasok sa laban ang {name} bilang Pinuno: +{a}/+{h} mula sa dawag.',
   '🚩 {name} தலைவராகக் களமிறங்குகிறது: முட்புதரிலிருந்து +{a}/+{h}.',
   '🚩 {name} turun ke medan sebagai Pemimpin: +{a}/+{h} dari semak.',
   '🚩 {name} 作为领袖登场：荆棘丛给予 +{a}/+{h}。',
   '🚩 {name} 作為領袖登場：荊棘叢給予 +{a}/+{h}。',
   '🚩 {name}がリーダーとして登場：いばらから+{a}/+{h}。',
   '🚩 {name}이(가) 리더로 등장: 덤불에서 +{a}/+{h}.']),
 ('ui.eng26-leader-boon-desc', 'Your Leader: +{a} ⚔ / +{h} ❤ when it takes the field', [
   'Votre Chef : +{a} ⚔ / +{h} ❤ à son entrée en jeu',
   'Dein Anführer: +{a} ⚔ / +{h} ❤, wenn er das Feld betritt',
   'Tu Líder: +{a} ⚔ / +{h} ❤ al entrar al campo',
   'Il tuo Capo: +{a} ⚔ / +{h} ❤ quando scende in campo',
   'O teu Líder: +{a} ⚔ / +{h} ❤ ao entrar em campo',
   'Ang Pinuno mo: +{a} ⚔ / +{h} ❤ pagpasok sa laban',
   'உங்கள் தலைவர்: களமிறங்கும்போது +{a} ⚔ / +{h} ❤',
   'Pemimpinmu: +{a} ⚔ / +{h} ❤ saat turun ke medan',
   '你的领袖：登场时 +{a} ⚔ / +{h} ❤',
   '你的領袖：登場時 +{a} ⚔ / +{h} ❤',
   'あなたのリーダー：登場時に+{a} ⚔ / +{h} ❤',
   '내 리더: 등장할 때 +{a} ⚔ / +{h} ❤']),
 ('ui.eng26-fx-leader', "Leader's Attack and Health", [
   'Attaque et Santé du Chef', 'Angriff und Leben des Anführers', 'Ataque y Salud del Líder', 'Attacco e Salute del Capo', 'Ataque e Vida do Líder',
   'Atake at Buhay ng Pinuno', 'தலைவரின் தாக்குதல் மற்றும் உயிர்', 'Serangan dan Nyawa Pemimpin', '领袖的攻击和生命', '領袖的攻擊和生命', 'リーダーの攻撃と体力', '리더의 공격력과 체력']),
]
ESC_FR = '+1/+1 (+2/+2 pour votre floraison suivante de ce combat, et ainsi de suite)'
NEXT = {  # the escalation, spliced into each pack's existing Bloom description in place of its "+1/+1"
 'fr': ESC_FR, 'de': '+1/+1 (+2/+2 bei deiner nächsten Blüte in diesem Kampf, und so weiter)',
 'es': '+1/+1 (+2/+2 en tu siguiente floración de este combate, y así sucesivamente)', 'it': '+1/+1 (+2/+2 alla tua fioritura successiva in questo scontro, e così via)',
 'pt': '+1/+1 (+2/+2 na tua floração seguinte deste combate, e assim por diante)', 'tl': '+1/+1 (+2/+2 sa susunod mong pamumulaklak sa labang ito, at iba pa)',
 'ta': '+1/+1 (இந்தப் போரில் உங்கள் அடுத்த மலர்ச்சிக்கு +2/+2, இப்படியே தொடரும்)', 'id': '+1/+1 (+2/+2 untuk mekarmu berikutnya di pertarungan ini, dan seterusnya)',
 'zh-Hans': '+1/+1（本场你的下一次花开 +2/+2，依此类推）', 'zh-Hant': '+1/+1（本場你的下一次開花 +2/+2，依此類推）',
 'ja': '+1/+1（この戦いで次の開花は+2/+2、以降も同様）', 'ko': '+1/+1(이번 전투의 다음 개화는 +2/+2, 이후 계속)'}
EN_NEXT = '+1/+1 (+2/+2 for your next bloom this fight, and so on)'
CHANGED_KEYS = ['ui.bl-desc', 'ui.bl-desc-lumber']
def ph(t): return sorted(re.findall(r'\{(\w+)\}', t))
LEAD = re.compile(r'^[^\w{(+\-]+')
def core(t): t = t.strip(); return LEAD.sub('', t)
TXP = os.path.join(ROOT, 'bramblewood-texts.js')
src = open(TXP, encoding='utf-8').read()
END = '\n}/*TEXT-TABLE-END*/;'
assert END in src
def en_of(key):
    m = re.search(r'("%s": )("(?:[^"\\]|\\.)*")' % re.escape(key), src); assert m, key
    return m, json.loads(m.group(2))
CHANGED = []
packs = {c: json.load(open(os.path.join(ROOT, 'lang', c + '.json'), encoding='utf-8')) for c in CODES}
for key in CHANGED_KEYS:
    m, old = en_of(key)
    if EN_NEXT in old: new = old; base = old.replace(EN_NEXT, '+1/+1')
    else: new = old.replace('+1/+1', EN_NEXT, 1); base = old
    assert new != base
    row = []
    for c in CODES:
        t = packs[c].get(base) or packs[c].get(new); assert t, (c, key)
        row.append(t if NEXT[c] in t else t.replace('+1/+1', NEXT[c], 1))
    CHANGED.append((key, new, row))
    src = src[:m.start(2)] + json.dumps(new, ensure_ascii=False) + src[m.end(2):]
add = ''
for key, en, _ in T:
    if ('"%s":' % key) not in src: add += ',\n  %s: %s' % (json.dumps(key), json.dumps(en, ensure_ascii=False))
if add:
    i = src.index(END); src = src[:i] + add + src[i:]
open(TXP, 'w', encoding='utf-8').write(src)
added = 0
for i, code in enumerate(CODES):
    path = os.path.join(ROOT, 'lang', code + '.json'); pack = packs[code]
    for key, en, row in T + CHANGED:
        assert len(row) == 12 and ph(en) == ph(row[i]), (code, en)
        # the packs hold a log line or float without its leading emoji (the translator keeps the emoji: tests/i18n-templates core());
        # an emoji-and-number float has nothing to translate and gets no row
        k, v = core(en), core(row[i])
        if not re.search(r'[^\W\d_]', re.sub(r'\{\w+\}', '', k)): continue
        if k not in pack: added += 1
        pack.setdefault(k, v)
    with open(path, 'w', encoding='utf-8') as fh:
        json.dump(pack, fh, ensure_ascii=False, indent=1); fh.write('\n')
print('ok: %d rows added across %d packs' % (added, len(CODES)))
