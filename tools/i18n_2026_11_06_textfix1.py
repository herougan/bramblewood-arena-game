#!/usr/bin/env python3
"""Package TEXTFIX1 (2026-11-06): the text failures TESTFIX2 found. Rows are keyed by the English text (lang/<code>.json, which the tests read,
and lang/ui/<code>.json). Idempotent; rows that exist are kept, nothing is sorted.
  1. ui.codex-base-chip "Starter" and ui.skn-rage "Rage": copied into the main pack from the UI pack's own translation (the tests read lang/<code>.json).
  2. ui.eng24-immunity-codex: "Greater Poison" -> "Deadly Poison" (the keyword's name since EN5); the row is re-keyed and the old name in each translation
     is swapped for the pack's own "Deadly Poison".
  3. TIP1: four tooltips over 20 words are shortened; the new English texts get new rows, the old rows go.
  4. The unused TX keys are removed from bramblewood-texts.js and their rows go (only when no other text or code uses the same English).
    python3 tools/i18n_2026_11_06_textfix1.py"""
import json, os, re
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
CODES = ['fr', 'de', 'es', 'it', 'pt', 'tl', 'ta', 'id', 'zh-Hans', 'zh-Hant', 'ja', 'ko']
OLD_GP = ['Poison supérieur', 'Starkes Gift', 'Veneno mayor', 'Veleno superiore', 'Veneno maior', 'Matinding Lason', 'பெருநஞ்சு', 'Racun Besar', '强毒', '強毒', '강독']
GP_OLD = "Stops Poison, Greater Poison, Toxin, Decay (and Decay damage's Attack loss), Swamp Fever and Spore Cloud. Poison or decay damage still hurts."
GP_NEW = GP_OLD.replace('Greater Poison', 'Deadly Poison')
TIPS = [  # (old English, new English, 12 translations in CODES order)
 ("Off this list, but on the map's SPECIAL list: a fight still leads with it or gives it as a reward, so it can still appear here.",
  "On the map's SPECIAL list, not this one: a fight can still lead with it or reward it.",
  ["Sur la liste SPECIAL de la carte, pas sur celle-ci : un combat peut encore la prendre comme chef ou la donner en récompense.",
   "Auf der SPECIAL-Liste der Karte, nicht auf dieser: Ein Kampf kann sie noch anführen oder als Belohnung geben.",
   "En la lista SPECIAL del mapa, no en esta: un combate aún puede usarla de líder o darla de recompensa.",
   "Nella lista SPECIAL della mappa, non in questa: uno scontro può ancora usarla come capo o darla in premio.",
   "Na lista SPECIAL do mapa, não nesta: um combate ainda pode usá-la como líder ou dá-la como recompensa.",
   "Nasa SPECIAL na listahan ng mapa, hindi dito: puwede pa rin itong gamitin ng laban bilang pinuno o ibigay na gantimpala.",
   "வரைபடத்தின் SPECIAL பட்டியலில் உள்ளது, இதில் இல்லை: ஒரு போர் இன்னும் அதைத் தலைவராகக் கொள்ளலாம் அல்லது பரிசாகத் தரலாம்.",
   "Ada di daftar SPECIAL peta, bukan di daftar ini: pertarungan masih bisa memakainya sebagai pemimpin atau hadiah.",
   "在地图的 SPECIAL 列表中，不在此列表：战斗仍可用它作首领或奖励。",
   "在地圖的 SPECIAL 列表中，不在此列表：戰鬥仍可用它作首領或獎勵。",
   "このリストではなくマップの SPECIAL リストにあります：戦闘でリーダーや報酬として出ることがあります。",
   "이 목록이 아닌 맵의 SPECIAL 목록에 있습니다: 전투에서 리더나 보상으로 나올 수 있습니다."]),
 ("Wet {n}: each lightning hit deals {n} more. It loses one counter each round; fire dries one a point before it can burn.",
  "Wet {n}: each lightning hit deals {n} more. Loses one each round; fire dries one before it burns.",
  ["Mouillé {n} : chaque coup de foudre inflige {n} de plus. Perd un marqueur par manche ; le feu en sèche un avant de brûler.",
   "Nass {n}: Jeder Blitztreffer verursacht {n} mehr. Verliert pro Runde einen Marker; Feuer trocknet einen, bevor es brennt.",
   "Mojado {n}: cada golpe de rayo hace {n} más. Pierde un contador por ronda; el fuego seca uno antes de quemar.",
   "Bagnato {n}: ogni colpo di fulmine infligge {n} in più. Perde un segnalino a round; il fuoco ne asciuga uno prima di bruciare.",
   "Molhado {n}: cada golpe de raio causa {n} a mais. Perde um marcador por ronda; o fogo seca um antes de queimar.",
   "Basa {n}: bawat tama ng kidlat ay {n} pang dagdag. Nawawalan ng isang counter bawat round; tinutuyo ng apoy ang isa bago sumunog.",
   "ஈரம் {n}: ஒவ்வொரு மின்னல் அடியும் {n} கூடுதல். ஒவ்வொரு சுற்றும் ஒரு குறி குறையும்; தீ எரிவதற்கு முன் ஒன்றை உலர்த்தும்.",
   "Basah {n}: tiap serangan petir memberi {n} lebih. Kehilangan satu penanda tiap ronde; api mengeringkan satu sebelum membakar.",
   "潮湿 {n}：每次闪电命中多造成 {n}。每回合失去一个标记；火焰点燃前先烘干一个。",
   "潮濕 {n}：每次閃電命中多造成 {n}。每回合失去一個標記；火焰點燃前先烘乾一個。",
   "濡れ {n}：雷撃1回ごとに{n}多く与える。毎ラウンド1つ失う。火は燃やす前に1つ乾かす。",
   "젖음 {n}: 번개 공격마다 {n} 더 받습니다. 매 라운드 표식 하나를 잃고, 불은 태우기 전에 하나를 말립니다."]),
 ("Fast-forward ⏩ ×{n}: at the start of the next combat it takes {n} extra turns of its own, before everyone else.",
  "Fast-forward ⏩ ×{n}: at the next combat's start it takes {n} extra turns before everyone else.",
  ["Avance rapide ⏩ ×{n} : au début du prochain combat, il joue {n} tours de plus avant tous les autres.",
   "Vorspulen ⏩ ×{n}: Zu Beginn des nächsten Kampfes macht es {n} Extrazüge vor allen anderen.",
   "Avance rápido ⏩ ×{n}: al empezar el siguiente combate hace {n} turnos extra antes que nadie.",
   "Avanti veloce ⏩ ×{n}: all’inizio dello scontro seguente fa {n} turni in più prima di tutti.",
   "Avanço rápido ⏩ ×{n}: no início do combate seguinte faz {n} turnos extra antes de todos.",
   "Fast-forward ⏩ ×{n}: sa simula ng susunod na labanan, gagawa ito ng {n} dagdag na turn bago ang lahat.",
   "வேக முன்னோட்டம் ⏩ ×{n}: அடுத்த சண்டையின் தொடக்கத்தில், மற்ற எல்லோருக்கும் முன் {n} கூடுதல் முறைகள் ஆடும்.",
   "Maju cepat ⏩ ×{n}: di awal pertarungan berikutnya ia mengambil {n} giliran tambahan sebelum yang lain.",
   "快进 ⏩ ×{n}：下一场战斗开始时，它先于所有人多行动 {n} 次。",
   "快進 ⏩ ×{n}：下一場戰鬥開始時，它先於所有人多行動 {n} 次。",
   "早送り ⏩ ×{n}：次の戦闘の開始時、誰よりも先に{n}回多く行動する。",
   "빨리 감기 ⏩ ×{n}: 다음 전투가 시작될 때, 누구보다 먼저 {n}번 더 행동합니다."]),
 ("Feed (instead of this turn's pitch): drop a hand card here or on your bramble, or pick a card and tap. Repair {n}, your units on the field +{a} Attack. {left} left this fight.",
  "Feed (instead of pitching): drop a card here or on your bramble. Repair {n}, units +{a} Attack. {left} left.",
  ["Nourrir (au lieu de défausser) : déposez une carte ici ou sur votre roncier. Réparation {n}, unités +{a} Attaque. Encore {left}.",
   "Füttern (statt Abwurf): Lege eine Karte hier oder auf deine Dornenhecke. Reparatur {n}, Einheiten +{a} Angriff. Noch {left}.",
   "Alimentar (en vez de descartar): suelta una carta aquí o en tu zarzal. Reparar {n}, unidades +{a} Ataque. Quedan {left}.",
   "Nutrire (invece dello scarto): lascia una carta qui o sul tuo rovo. Riparazione {n}, unità +{a} Attacco. Ne restano {left}.",
   "Alimentar (em vez de descartar): larga uma carta aqui ou no teu silvado. Reparar {n}, unidades +{a} Ataque. Restam {left}.",
   "Pakainin (sa halip na itapon): ihulog dito o sa iyong dawag ang isang kard. Ayusin {n}, mga yunit +{a} Atake. {left} na lang.",
   "ஊட்டு (வீசலுக்குப் பதில்): ஓர் அட்டையை இங்கே அல்லது உன் முட்புதர் மீது விடு. பழுதுபார் {n}, அலகுகள் +{a} தாக்குதல். இன்னும் {left}.",
   "Beri Makan (pengganti buangan): taruh kartu di sini atau di semakmu. Perbaiki {n}, unit +{a} Serangan. Sisa {left}.",
   "喂食（代替弃牌）：把一张牌拖到这里或你的荆棘丛上。修复 {n}，单位 +{a} 攻击。还剩 {left} 次。",
   "餵食（代替棄牌）：把一張牌拖到這裡或你的荊棘叢上。修復 {n}，單位 +{a} 攻擊。還剩 {left} 次。",
   "餌やり（捨て札の代わり）：カードをここかいばらに置く。修復{n}、ユニットに攻撃+{a}。残り{left}回。",
   "먹이기(버리기 대신): 카드를 여기나 내 덤불에 놓으세요. 수리 {n}, 유닛 공격 +{a}. {left}번 남음."]),
]
GONE_KEYS = ['ui.ui21-mapkw-sub', 'ui.ar-group-sub', 'ui.ar-group-soon', 'ui.ui12-skirm-reroll', 'ui.pref-level']  # ui.bal13-tactic-flock stays: ladder decks ask for it as TX('ui.bal13-tactic-' + tactic)
TXT = os.path.join(ROOT, 'bramblewood-texts.js')


def load(p):
    with open(p, encoding='utf-8') as fh:
        return json.load(fh)


def dump(p, d):
    with open(p, 'w', encoding='utf-8') as fh:
        json.dump(d, fh, ensure_ascii=False, indent=1); fh.write('\n')


def texts_table():
    src = open(TXT, encoding='utf-8').read()
    return src, dict(re.findall(r'^  "([^"]+)": "((?:[^"\\]|\\.)*)",?$', src, re.M))


def main():
    src, table = texts_table()
    gone_en = {}
    for k in GONE_KEYS:
        if k in table:
            gone_en[k] = json.loads('"' + table[k] + '"')
            src = re.sub(r'^  "%s": "(?:[^"\\]|\\.)*",?\n' % re.escape(k), '', src, flags=re.M)
    if gone_en:
        open(TXT, 'w', encoding='utf-8').write(src)
        src, table = texts_table()
    still = {json.loads('"' + v + '"') for v in table.values()}
    app = open(os.path.join(ROOT, 'arena_app.js'), encoding='utf-8').read()
    drop = [t for t in gone_en.values() if t not in still and ("'" + t + "'") not in app and ('"' + t + '"') not in app]
    for ci, code in enumerate(CODES):
        pp, up = os.path.join(ROOT, 'lang', code + '.json'), os.path.join(ROOT, 'lang', 'ui', code + '.json')
        pack, ui = load(pp), load(up)
        for en in ('Starter', 'Rage'):  # the tests read the main pack; copy the UI pack's own translation
            if en not in pack and en in ui:
                pack[en] = ui[en]
        dp = pack.get('Deadly Poison') or ui.get('Deadly Poison')
        if GP_OLD in pack:
            t = pack.pop(GP_OLD)
            for old in OLD_GP:
                t = t.replace(old, dp)
            pack.setdefault(GP_NEW, t)
        for old, new, tr in TIPS:
            for d in (pack, ui):
                d.pop(old, None)
            pack[new] = tr[ci]
        for t in drop:
            pack.pop(t, None); ui.pop(t, None)
        dump(pp, pack); dump(up, ui)
    print('ok; rows dropped for', drop)


main()
