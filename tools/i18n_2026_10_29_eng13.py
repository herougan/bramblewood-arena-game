#!/usr/bin/env python3
"""Game texts added on 2026-10-29 by package ENG13 (owner 21:36): the Slow keyword (ui.eng13-slow-name / ui.eng13-slow), Canopy Cover's new
wording (ui.sk-canopy-cover / -codex: only ranged and Flying attacks) and the admin currency tap's toast (ui.eng13-admin-cur-tap).
One row per English text in lang/<code>.json (rows that already exist are kept). Tagalog, Tamil, Japanese and Korean deserve a native read.
    python3 tools/i18n_2026_10_29_eng13.py"""
import json, os, re
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
CODES = ['fr', 'de', 'es', 'it', 'pt', 'tl', 'ta', 'id', 'zh-Hans', 'zh-Hant', 'ja', 'ko']
T = [  # English, then the 12 translations in CODES order
 ('Slow', ['Lent', 'Langsam', 'Lento', 'Lento', 'Lento', 'Mabagal', 'மெதுவு', 'Lambat', '迟缓', '遲緩', '鈍足', '느림']),
 ('Acts last among units of the same Speed. Two Slow units take turns as usual.', [
  "Agit en dernier parmi les unités de même Vitesse. Deux unités Lentes alternent comme d'habitude.",
  'Handelt als Letztes unter Einheiten gleicher Geschwindigkeit. Zwei langsame Einheiten wechseln sich wie üblich ab.',
  'Actúa la última entre las unidades de la misma Velocidad. Dos unidades Lentas se turnan como siempre.',
  'Agisce per ultima tra le unità con la stessa Velocità. Due unità Lente si alternano come al solito.',
  'Age por último entre as unidades da mesma Velocidade. Duas unidades Lentas alternam como de costume.',
  'Huling kumikilos sa mga yunit na pareho ang Bilis. Dalawang Mabagal na yunit ay nagsasalitan gaya ng dati.',
  'ஒரே வேகமுள்ள அலகுகளில் கடைசியாகச் செயல்படும். இரண்டு மெதுவான அலகுகள் வழக்கம்போல் மாறி மாறிச் செயல்படும்.',
  'Bertindak paling akhir di antara unit dengan Kecepatan yang sama. Dua unit Lambat bergiliran seperti biasa.',
  '在速度相同的单位中最后行动。两个迟缓单位照常轮流行动。',
  '在速度相同的單位中最後行動。兩個遲緩單位照常輪流行動。',
  '同じスピードのユニットの中で最後に行動する。鈍足のユニット同士はいつも通り交互に行動する。',
  '속도가 같은 유닛 중 마지막에 행동해요. 느림 유닛끼리는 평소처럼 번갈아 행동해요.']),
 ('Under the trees, this ground unit dodges half the shots, skills and Flying attacks aimed at it.', ["Sous les arbres, cette unité au sol esquive la moitié des tirs, compétences et attaques volantes qui la visent.", "Unter den Bäumen weicht diese Bodeneinheit der Hälfte der Schüsse, Fähigkeiten und Flugangriffe auf sie aus.", "Bajo los árboles, esta unidad terrestre esquiva la mitad de los disparos, habilidades y ataques voladores que la apuntan.", "Sotto gli alberi, questa unità di terra schiva metà dei tiri, delle abilità e degli attacchi volanti rivolti a lei.", "Sob as árvores, esta unidade terrestre esquiva metade dos disparos, habilidades e ataques voadores dirigidos a ela.", "Sa ilalim ng mga puno, naiiwasan ng yunit na ito sa lupa ang kalahati ng mga tira, kasanayan at atake ng lumilipad na nakatutok dito.", "மரங்களின் கீழ், இந்தத் தரை அலகு தன்னை நோக்கிய எய்வுகள், திறன்கள், பறக்கும் தாக்குதல்களில் பாதியைத் தவிர்க்கும்.", "Di bawah pepohonan, unit darat ini menghindari separuh tembakan, skill, dan serangan terbang yang mengarah padanya.", "在树下，这个地面单位能躲开一半瞄准它的射击、技能和飞行攻击。", "在樹下，這個地面單位能躲開一半瞄準它的射擊、技能和飛行攻擊。", "木々の下では、この地上ユニットは自分を狙う射撃、スキル、飛行攻撃の半分をかわす。", "나무 아래에서 이 지상 유닛은 자신을 노리는 사격, 스킬, 비행 공격의 절반을 피해요."]),
 ("Under the trees: any fight on a forest map (the Old Woods), High Canopy or the Undergrowth. Ground: not Flying (a grounded flyer counts). It covers ranged attacks (shots, skills, a thrown Boomerang) and Flying attackers; a ground unit's melee attack still hits. One roll, like Evasive, and not on top of Evasive. True Strike and Exposed see through it.", [
  "Sous les arbres : tout combat sur une carte de forêt (les Vieux Bois), la Haute Canopée ou le Sous-bois. Au sol : pas Volant (un volant cloué au sol compte). Elle couvre les attaques à distance (tirs, compétences, un Boomerang lancé) et les attaquants volants ; l'attaque au corps à corps d'une unité au sol touche toujours. Un seul jet, comme Évasif, et pas en plus d'Évasif. Frappe sûre et Exposé la percent.",
  'Unter den Bäumen: jeder Kampf auf einer Waldkarte (die Alten Wälder), Hohes Blätterdach oder das Unterholz. Am Boden: nicht fliegend (ein am Boden festgehaltener Flieger zählt). Sie deckt Fernangriffe (Schüsse, Fähigkeiten, ein geworfener Bumerang) und fliegende Angreifer; der Nahkampfangriff einer Bodeneinheit trifft weiterhin. Ein Wurf, wie Ausweichend, und nicht zusätzlich zu Ausweichend. Sicherer Schlag und Entblößt sehen hindurch.',
  'Bajo los árboles: cualquier combate en un mapa de bosque (el Bosque Viejo), Dosel Alto o el Sotobosque. En tierra: no Voladora (una voladora derribada cuenta). Cubre los ataques a distancia (disparos, habilidades, un Bumerán lanzado) y a los atacantes voladores; el ataque cuerpo a cuerpo de una unidad terrestre sigue acertando. Una tirada, como Evasiva, y no además de Evasiva. Golpe Certero y Expuesto la atraviesan.',
  "Sotto gli alberi: qualsiasi scontro su una mappa di foresta (i Boschi Antichi), Alta Volta o il Sottobosco. A terra: non Volante (un volante a terra conta). Copre gli attacchi a distanza (tiri, abilità, un Boomerang lanciato) e gli attaccanti volanti; l'attacco in mischia di un'unità di terra colpisce comunque. Un solo tiro, come Evasivo, e non in aggiunta a Evasivo. Colpo Sicuro ed Esposto la superano.",
  'Sob as árvores: qualquer combate num mapa de floresta (os Bosques Antigos), Copa Alta ou o Sub-bosque. Em terra: não Voadora (uma voadora no chão conta). Cobre ataques à distância (disparos, habilidades, um Bumerangue lançado) e atacantes voadores; o ataque corpo a corpo de uma unidade terrestre continua a acertar. Um só lance, como Evasivo, e não além de Evasivo. Golpe Certeiro e Exposto atravessam-na.',
  'Sa ilalim ng mga puno: anumang laban sa mapang kagubatan (ang Lumang Gubat), Mataas na Kanopi o ang Kasukalan. Sa lupa: hindi Lumilipad (bilang ang lumilipad na napababa). Tinatakpan nito ang mga atake mula sa malayo (tira, kasanayan, ibinatong Boomerang) at mga lumilipad na umaatake; tumatama pa rin ang malapitang atake ng yunit sa lupa. Isang tira ng tsansa, gaya ng Evasive, at hindi dagdag sa Evasive. Nakikita ito ng True Strike at Exposed.',
  'மரங்களின் கீழ்: காட்டு வரைபடத்தில் (பழைய காடுகள்), உயர் மரவிதானம் அல்லது அடிமரப்புதர் உள்ள எந்தச் சண்டையும். தரையில்: பறக்காதது (தரையிறக்கப்பட்ட பறவையும் கணக்கு). இது தொலைவுத் தாக்குதல்களையும் (எய்வுகள், திறன்கள், எறியப்பட்ட பூமராங்) பறக்கும் தாக்குநர்களையும் மறைக்கும்; தரை அலகின் நெருக்கத் தாக்குதல் இன்னும் படும். ஒரே வீச்சு, ஏய்ப்பு போல, ஏய்ப்புக்கு மேல் அல்ல. உறுதித் தாக்கும் வெளிப்பட்டதும் இதைக் கடந்து பார்க்கும்.',
  'Di bawah pepohonan: pertarungan apa pun di peta hutan (Hutan Tua), Kanopi Tinggi, atau Semak Bawah. Darat: bukan Terbang (penerbang yang dijatuhkan dihitung). Melindungi dari serangan jarak jauh (tembakan, skill, Bumerang yang dilempar) dan penyerang Terbang; serangan jarak dekat unit darat tetap kena. Satu lemparan, seperti Mengelak, dan tidak ditambah Mengelak. Serangan Pasti dan Terekspos menembusnya.',
  '树下：森林地图（古林）、高林冠或下层林中的任何战斗。地面：非飞行（被击落的飞行单位也算）。它挡住远程攻击（射击、技能、掷出的回旋镖）和飞行攻击者；地面单位的近战攻击照样命中。一次判定，与闪避相同，不与闪避叠加。必中和暴露可以看穿它。',
  '樹下：森林地圖（古林）、高林冠或下層林中的任何戰鬥。地面：非飛行（被擊落的飛行單位也算）。它擋住遠程攻擊（射擊、技能、擲出的迴旋鏢）和飛行攻擊者；地面單位的近戰攻擊照樣命中。一次判定，與閃避相同，不與閃避疊加。必中和暴露可以看穿它。',
  '木々の下：森林マップ（古き森）、高い樹冠、下草のある戦闘すべて。地上：飛行でないこと（地に落ちた飛行ユニットも含む）。遠距離攻撃（射撃、スキル、投げたブーメラン）と飛行ユニットの攻撃を防ぐ。地上ユニットの近接攻撃は当たる。回避と同じく1回の判定で、回避とは重ならない。必中と露呈は見破る。',
  '나무 아래: 숲 지도(오래된 숲), 높은 수관, 덤불이 있는 모든 전투. 지상: 비행이 아님(떨어진 비행 유닛도 포함). 원거리 공격(사격, 스킬, 던진 부메랑)과 비행 공격자를 막아요. 지상 유닛의 근접 공격은 그대로 맞아요. 회피처럼 한 번 굴리며 회피와 겹치지 않아요. 필중과 노출은 꿰뚫어 봐요.']),
 ('🛠️ Admin: {name} {from} → {to}', ['🛠️ Admin : {name} {from} → {to}', '🛠️ Admin: {name} {from} → {to}', '🛠️ Admin: {name} {from} → {to}', '🛠️ Admin: {name} {from} → {to}', '🛠️ Admin: {name} {from} → {to}', '🛠️ Admin: {name} {from} → {to}', '🛠️ நிர்வாகி: {name} {from} → {to}', '🛠️ Admin: {name} {from} → {to}', '🛠️ 管理员：{name} {from} → {to}', '🛠️ 管理員：{name} {from} → {to}', '🛠️ 管理者：{name} {from} → {to}', '🛠️ 관리자: {name} {from} → {to}']),
]
ph = lambda s: sorted(set(re.findall(r'\{\w+\}', s)))
def dump(path, d):
    with open(path, 'w', encoding='utf-8') as fh:
        json.dump(d, fh, ensure_ascii=False, indent=1); fh.write('\n')
added = 0
for i, code in enumerate(CODES):
    path = os.path.join(ROOT, 'lang', code + '.json'); pack = json.load(open(path, encoding='utf-8'))
    for en, row in T:
        if row is None:
            assert en in pack, (code, en)
            continue
        assert len(row) == 12 and ph(en) == ph(row[i]), (code, en)
        if en not in pack: added += 1
        pack.setdefault(en, row[i])
    dump(path, pack)
print('ok: %d rows added across %d packs' % (added, len(CODES)))
