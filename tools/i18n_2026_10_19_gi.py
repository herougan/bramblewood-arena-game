#!/usr/bin/env python3
"""Package GI texts (2026-10-19, owner 00:19: "continue with action items, and considering our gameplay-ideas ... After running through
the ideas, create what you want to create"; docs/gameplay-ideas-built-2026-10-19.md).

    python3 tools/i18n_2026_10_19_gi.py

1. Puts the English of every new TX key (KEYS) into bramblewood-texts.js, just before the table's end marker (once; a key already there
   keeps its English).
2. Writes the 12 language packs (lang/<code>.json, keyed by that English; a leading emoji is not part of the key). A row a pack already
   has keeps the pack's own translation, so a shared word (Wet, Exposed ...) never changes under another package.
3. The example POOL cards' names (lang/cards/<code>.json) and flavour lines (lang/ui/<code>.json).
Every {placeholder} is kept. Same layout as i18n_2026_10_19_rv.py.
"""
import json, os, re
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
CODES = ['fr', 'de', 'es', 'it', 'pt', 'tl', 'ta', 'id', 'zh-Hans', 'zh-Hant', 'ja', 'ko']
LEAD = re.compile(r'^[\s\U0001F000-\U0001FFFF☀-➿️‍]+')
def core(s): return LEAD.sub('', s.strip()).strip()

KEYS = {
 "ui.skn-hunter": "Hunter",
 "ui.skn-executioner": "Executioner",
 "ui.skn-detonate": "Detonate",
 "ui.skn-proliferate": "Proliferate",
 "ui.skn-brittle": "Brittle",
 "ui.skn-kin-rally": "Kin Rally",
 "ui.skn-pack-howl": "Pack Howl",
 "ui.skn-prayer-ward": "Prayer Ward",
 "ui.skn-field-breaker": "Field Breaker",
 "ui.sk-hunter-poison": "Its hits and shots deal {n} more to Poisoned units.",
 "ui.sk-hunter-bleed": "Its hits and shots deal {n} more to Bleeding units.",
 "ui.sk-hunter-wet": "Its hits and shots deal {n} more to Wet units.",
 "ui.sk-hunter-exposed": "Its hits and shots deal {n} more to Exposed units.",
 "ui.hunter-vs-poison": "Poisoned",
 "ui.hunter-vs-bleed": "Bleeding",
 "ui.hunter-vs-wet": "Wet",
 "ui.hunter-vs-exposed": "Exposed",
 "ui.sk-hunter-codex": "One status is picked on the card: Poisoned, Bleeding, Wet or Exposed (Shatter is the Frozen one). Exposed is checked before the hit uses up a counter. Poison and Bleed ticks, and brambles, get no bonus.",
 "ui.sk-executioner": "Its hits and shots deal {n} more to units below half Health.",
 "ui.sk-executioner-codex": "Exactly half is not below half. Poison and Bleed ticks, and brambles, get no bonus.",
 "ui.sk-detonate": "Its hits cash in the target's Poison as extra damage, then the Poison is gone.",
 "ui.sk-detonate-codex": "Its shots too. Poison ticks at the start of the round, so it cashes in what the tick left.",
 "ui.sk-proliferate-1": "Each round, a Poisoned enemy passes 1 Poison to a unit beside it.",
 "ui.sk-proliferate": "Each round, up to {n} Poisoned enemies each pass 1 Poison to a unit beside them.",
 "ui.sk-proliferate-codex": "From round 2; the carriers are picked at random. A carrier keeps its own Poison, and poison-proof units never catch it.",
 "ui.sk-brittle-1": "Its hits make the target Brittle for a round.",
 "ui.sk-brittle": "Its hits make the target Brittle for {n} rounds.",
 "ui.st-brittle": "counts as Frozen for Shatter, but it still acts.",
 "ui.stx-brittle": "It wears off one round each upkeep, like Web.",
 "ui.sk-kin-rally": "When you play one of its Kin, that unit gets +{n}/+{n}.",
 "ui.sk-kin-rally-codex": "Kin: your units that share a Type with it. It is an On Ally Played trigger, so it is off while it is Waiting, Stunned, Frozen or Asleep.",
 "ui.sk-pack-howl": "When you play a Wolf, the enemy facing it Bleeds {n}.",
 "ui.sk-pack-howl-codex": "An On Ally Played trigger, off while it is Waiting, Stunned, Frozen or Asleep. With nobody facing the Wolf, nobody bleeds. A Changeling counts as a Wolf.",
 "ui.sk-prayer-ward": "Armor {n} while it holds Prayer tokens.",
 "ui.sk-prayer-ward-codex": "A 🧿 on the unit shows while the ward is up; it falls with the last token.",
 "ui.sk-field-breaker": "When played, the field's round effects stop for {n} rounds.",
 "ui.sk-field-breaker-1": "When played, the field's round effects stop for a round.",
 "ui.sk-field-breaker-codex": "For both sides. Hazards, Swamp Fever, the Tide-spout and the volcano stop; day and night, the Tide, Darkness, wind and field cards carry on.",
 "ui.fx-name-spore-cloud": "Spore Cloud",
 "ui.fx-spore-cloud": "From round 2, one random unit a side falls Asleep for the round.",
 "ui.fx-spore-cloud-short": "A unit a side falls Asleep",
 "ui.fxx-spore-cloud": "It is Sleep 1, so the Sleep cap holds (2 at most), and a hit wakes it. Poison-proof units breathe nothing in.",
 "ui.fx-name-thunderstorm": "Thunderstorm",
 "ui.fx-thunderstorm": "From round 2, lightning strikes one random unit a side for {n}.",
 "ui.fx-thunderstorm-short": "Lightning: {n} to a unit a side",
 "ui.fxx-thunderstorm": "It is lightning: each Wet counter adds 1, and Resist halves it.",
 "ui.fx-name-tangled-roots": "Tangled Roots",
 "ui.fx-tangled-roots": "From round 2, roots grab one random unit a side: Webbed for the round.",
 "ui.fx-tangled-roots-short": "A unit a side is Webbed",
 "ui.fxx-tangled-roots": "Webbed: it can't dodge, and it can't move or be moved. Flyers and Structures are above the roots.",
 "ui.log-spore-cloud": "🍄 Spores drift over the field.",
 "ui.log-spore-sleep": "🍄 {name} breathes the spores and falls Asleep.",
 "ui.log-thunderstorm": "🌩️ Thunder rolls: lightning strikes for {n}.",
 "ui.log-thunder-hit": "🌩️ Lightning strikes {name} for {dmg}.",
 "ui.log-thunder-hit-wet": "🌩️ Lightning strikes {name} for {dmg} (it is Wet).",
 "ui.log-tangled-roots": "🪢 Roots writhe up through the ground.",
 "ui.log-roots-grab": "🪢 Roots grab {name}: Webbed this round.",
 "ui.log-detonate": "🎆 {att} detonates the Poison on {name}: +{n} damage.",
 "ui.log-proliferate": "🧫 The Poison spreads from {from} to {name}.",
 "ui.log-brittle": "🫙 {att} makes {name} Brittle ({n}).",
 "ui.log-field-break": "🧹 {name} breaks the field: its round effects stop for {n} rounds.",
 "ui.log-field-break-1": "🧹 {name} breaks the field: its round effects stop for a round.",
 "ui.log-field-paused": "🧹 The field is quiet this round.",
 "ui.float-brittle": "🫙 Brittle",
 "ui.float-field-break": "🧹 Field broken",
 "ui.brittle-tip": "Brittle for {n}: Shatter treats it as Frozen",
 "ui.prayer-ward-tip": "Prayer Ward: Armor {n} while it holds Prayer tokens",
}

# [fr, de, es, it, pt, tl, ta, id, zh-Hans, zh-Hant, ja, ko], keyed by the English core
T = {
"Hunter": ["Chasseur", "Jäger", "Cazador", "Cacciatore", "Caçador", "Mangangaso", "வேட்டைக்காரன்", "Pemburu", "猎手", "獵手", "ハンター", "사냥꾼"],
"Executioner": ["Bourreau", "Henker", "Verdugo", "Boia", "Carrasco", "Berdugo", "தூக்கிலிடுபவன்", "Algojo", "处刑者", "處刑者", "処刑人", "처형자"],
"Detonate": ["Détonation", "Zünden", "Detonar", "Detonare", "Detonar", "Pasabugin", "வெடிப்பு", "Ledakkan", "引爆", "引爆", "起爆", "기폭"],
"Proliferate": ["Prolifération", "Ausbreiten", "Proliferar", "Proliferare", "Proliferar", "Pagkalat", "பரவல்", "Menyebar", "扩散", "擴散", "拡散", "확산"],
"Brittle": ["Cassant", "Spröde", "Quebradizo", "Fragile come vetro", "Quebradiço", "Marupok", "நொறுங்கும்", "Rapuh", "易碎", "易碎", "もろい", "취약"],
"Kin Rally": ["Ralliement des parents", "Sippenruf", "Llamada de parientes", "Raduno dei parenti", "Chamado dos parentes", "Tipon ng Kaanak", "உறவினர் அணிதிரட்டல்", "Seruan Kerabat", "同族集结", "同族集結", "同族の結集", "동족 결집"],
"Pack Howl": ["Hurlement de meute", "Rudelheulen", "Aullido de manada", "Ululato del branco", "Uivo da alcateia", "Alulong ng Kawan", "கூட்ட ஊளை", "Lolongan Kawanan", "狼群嚎叫", "狼群嚎叫", "群れの遠吠え", "무리의 울부짖음"],
"Prayer Ward": ["Garde de prière", "Gebetsschutz", "Guarda de oración", "Protezione della preghiera", "Proteção de oração", "Bantay ng Dasal", "பிரார்த்தனைக் காப்பு", "Perisai Doa", "祈祷护符", "祈禱護符", "祈りの護り", "기도의 수호"],
"Field Breaker": ["Brise-terrain", "Feldbrecher", "Rompecampos", "Spezzacampo", "Quebra-campo", "Pambasag ng Larangan", "களம் உடைப்பான்", "Pemecah Medan", "破场者", "破場者", "フィールドブレイカー", "필드 브레이커"],
"Its hits and shots deal {n} more to Poisoned units.": [
  "Ses coups et ses tirs infligent {n} de plus aux unités empoisonnées.", "Seine Treffer und Schüsse machen {n} mehr bei vergifteten Einheiten.",
  "Sus golpes y disparos hacen {n} más a las unidades envenenadas.", "I suoi colpi e tiri infliggono {n} in più alle unità avvelenate.",
  "Seus golpes e disparos causam {n} a mais em unidades envenenadas.", "Ang mga tama at tira nito ay {n} na dagdag sa mga unit na nalason.",
  "இதன் தாக்குதல்களும் எய்தல்களும் நஞ்சூட்டப்பட்ட அலகுகளுக்கு {n} அதிகம் தரும்.", "Serangan dan tembakannya memberi {n} lebih ke unit yang Teracuni.",
  "它的攻击和射击对中毒单位多造成{n}点伤害。", "它的攻擊和射擊對中毒單位多造成{n}點傷害。", "その攻撃と射撃は毒状態のユニットに{n}多く与える。", "공격과 사격이 중독된 유닛에게 {n} 더 피해를 줘요."],
"Its hits and shots deal {n} more to Bleeding units.": [
  "Ses coups et ses tirs infligent {n} de plus aux unités qui saignent.", "Seine Treffer und Schüsse machen {n} mehr bei blutenden Einheiten.",
  "Sus golpes y disparos hacen {n} más a las unidades que sangran.", "I suoi colpi e tiri infliggono {n} in più alle unità sanguinanti.",
  "Seus golpes e disparos causam {n} a mais em unidades sangrando.", "Ang mga tama at tira nito ay {n} na dagdag sa mga unit na dumudugo.",
  "இதன் தாக்குதல்களும் எய்தல்களும் இரத்தம் கசியும் அலகுகளுக்கு {n} அதிகம் தரும்.", "Serangan dan tembakannya memberi {n} lebih ke unit yang Berdarah.",
  "它的攻击和射击对流血单位多造成{n}点伤害。", "它的攻擊和射擊對流血單位多造成{n}點傷害。", "その攻撃と射撃は出血中のユニットに{n}多く与える。", "공격과 사격이 출혈 중인 유닛에게 {n} 더 피해를 줘요."],
"Its hits and shots deal {n} more to Wet units.": [
  "Ses coups et ses tirs infligent {n} de plus aux unités mouillées.", "Seine Treffer und Schüsse machen {n} mehr bei nassen Einheiten.",
  "Sus golpes y disparos hacen {n} más a las unidades mojadas.", "I suoi colpi e tiri infliggono {n} in più alle unità bagnate.",
  "Seus golpes e disparos causam {n} a mais em unidades molhadas.", "Ang mga tama at tira nito ay {n} na dagdag sa mga unit na basa.",
  "இதன் தாக்குதல்களும் எய்தல்களும் நனைந்த அலகுகளுக்கு {n} அதிகம் தரும்.", "Serangan dan tembakannya memberi {n} lebih ke unit yang Basah.",
  "它的攻击和射击对潮湿单位多造成{n}点伤害。", "它的攻擊和射擊對潮溼單位多造成{n}點傷害。", "その攻撃と射撃は濡れたユニットに{n}多く与える。", "공격과 사격이 젖은 유닛에게 {n} 더 피해를 줘요."],
"Its hits and shots deal {n} more to Exposed units.": [
  "Ses coups et ses tirs infligent {n} de plus aux unités exposées.", "Seine Treffer und Schüsse machen {n} mehr bei entblößten Einheiten.",
  "Sus golpes y disparos hacen {n} más a las unidades expuestas.", "I suoi colpi e tiri infliggono {n} in più alle unità esposte.",
  "Seus golpes e disparos causam {n} a mais em unidades expostas.", "Ang mga tama at tira nito ay {n} na dagdag sa mga unit na nakalantad.",
  "இதன் தாக்குதல்களும் எய்தல்களும் வெளிப்பட்ட அலகுகளுக்கு {n} அதிகம் தரும்.", "Serangan dan tembakannya memberi {n} lebih ke unit yang Terekspos.",
  "它的攻击和射击对暴露单位多造成{n}点伤害。", "它的攻擊和射擊對暴露單位多造成{n}點傷害。", "その攻撃と射撃は無防備なユニットに{n}多く与える。", "공격과 사격이 노출된 유닛에게 {n} 더 피해를 줘요."],
"Poisoned": ["Empoisonnée", "Vergiftet", "Envenenada", "Avvelenata", "Envenenada", "Nalason", "நஞ்சூட்டப்பட்டது", "Teracuni", "中毒", "中毒", "毒", "중독"],
"Bleeding": ["Qui saigne", "Blutend", "Sangrando", "Sanguinante", "Sangrando", "Dumudugo", "இரத்தம் கசிகிறது", "Berdarah", "流血", "流血", "出血", "출혈"],
"Wet": ["Mouillée", "Nass", "Mojada", "Bagnata", "Molhada", "Basa", "நனைந்தது", "Basah", "潮湿", "潮溼", "濡れ", "젖음"],
"Exposed": ["Exposée", "Entblößt", "Expuesta", "Esposta", "Exposta", "Nakalantad", "வெளிப்பட்டது", "Terekspos", "暴露", "暴露", "無防備", "노출"],
"One status is picked on the card: Poisoned, Bleeding, Wet or Exposed (Shatter is the Frozen one). Exposed is checked before the hit uses up a counter. Poison and Bleed ticks, and brambles, get no bonus.": [
  "Un seul statut est choisi sur la carte : empoisonnée, qui saigne, mouillée ou exposée (Éclatement est celui du gel). Exposée est vérifié avant que le coup n’use un compteur. Les tics de Poison et de Saignement, et les ronciers, n’ont pas de bonus.",
  "Auf der Karte wird ein Status gewählt: vergiftet, blutend, nass oder entblößt (Zersplittern ist der für Gefroren). Entblößt wird geprüft, bevor der Treffer einen Zähler verbraucht. Gift- und Blutungsticks und Dornenhecken bekommen keinen Bonus.",
  "En la carta se elige un estado: envenenada, sangrando, mojada o expuesta (Hacer añicos es el de congelado). Expuesta se comprueba antes de que el golpe gaste un contador. Los tics de Veneno y Sangrado, y los zarzales, no tienen bonificación.",
  "Sulla carta si sceglie uno stato: avvelenata, sanguinante, bagnata o esposta (Frantumare è quello del congelamento). Esposta si controlla prima che il colpo consumi un segnalino. I tick di Veleno e Sanguinamento, e i rovi, non hanno bonus.",
  "Na carta escolhe-se um estado: envenenada, sangrando, molhada ou exposta (Estilhaçar é o do congelado). Exposta é verificada antes de o golpe gastar um marcador. Os tiques de Veneno e Sangramento, e os silvados, não têm bónus.",
  "Isang status ang pinipili sa card: Nalason, Dumudugo, Basa o Nakalantad (ang Shatter ang para sa Nagyelo). Tinitingnan ang Nakalantad bago gamitin ng tama ang isang counter. Walang dagdag ang tik ng Poison at Bleed, at ang mga dawag.",
  "அட்டையில் ஒரு நிலை தேர்ந்தெடுக்கப்படும்: நஞ்சு, இரத்தக் கசிவு, நனைவு அல்லது வெளிப்பாடு (உறைவுக்கு நொறுக்கு உள்ளது). தாக்குதல் ஒரு குறியைச் செலவிடும் முன் வெளிப்பாடு சரிபார்க்கப்படும். நஞ்சு, இரத்தக் கசிவு டிக்குகளுக்கும் முட்புதர்களுக்கும் கூடுதல் இல்லை.",
  "Satu status dipilih di kartu: Teracuni, Berdarah, Basah, atau Terekspos (Hancurkan untuk yang Beku). Terekspos dicek sebelum serangan memakai satu penanda. Detak Racun dan Pendarahan, serta semak, tidak mendapat bonus.",
  "卡上选定一种状态：中毒、流血、潮湿或暴露（冰冻的那种是粉碎）。暴露会在这次攻击消耗计数之前判定。中毒与流血的跳伤，以及荆棘丛，都没有加成。",
  "卡上選定一種狀態：中毒、流血、潮溼或暴露（冰凍的那種是粉碎）。暴露會在這次攻擊消耗計數之前判定。中毒與流血的跳傷，以及荊棘叢，都沒有加成。",
  "カードで状態を1つ選ぶ：毒、出血、濡れ、無防備（凍結用は粉砕）。無防備は攻撃がカウンターを使う前に判定。毒と出血の継続ダメージ、いばらにはボーナスなし。",
  "카드에서 상태 하나를 골라요: 중독, 출혈, 젖음, 노출(빙결용은 분쇄). 노출은 공격이 카운터를 쓰기 전에 확인해요. 중독·출혈 틱과 덤불에는 보너스가 없어요."],
"Its hits and shots deal {n} more to units below half Health.": [
  "Ses coups et ses tirs infligent {n} de plus aux unités sous la moitié de leur Santé.", "Seine Treffer und Schüsse machen {n} mehr bei Einheiten unter halbem Leben.",
  "Sus golpes y disparos hacen {n} más a las unidades por debajo de la mitad de su Salud.", "I suoi colpi e tiri infliggono {n} in più alle unità sotto metà Salute.",
  "Seus golpes e disparos causam {n} a mais em unidades abaixo de metade da Vida.", "Ang mga tama at tira nito ay {n} na dagdag sa mga unit na kulang sa kalahati ang Health.",
  "இதன் தாக்குதல்களும் எய்தல்களும் பாதி உயிருக்குக் கீழுள்ள அலகுகளுக்கு {n} அதிகம் தரும்.", "Serangan dan tembakannya memberi {n} lebih ke unit dengan Nyawa di bawah separuh.",
  "它的攻击和射击对生命低于一半的单位多造成{n}点伤害。", "它的攻擊和射擊對生命低於一半的單位多造成{n}點傷害。", "その攻撃と射撃はHPが半分未満のユニットに{n}多く与える。", "공격과 사격이 체력이 절반 미만인 유닛에게 {n} 더 피해를 줘요."],
"Exactly half is not below half. Poison and Bleed ticks, and brambles, get no bonus.": [
  "Pile la moitié n’est pas sous la moitié. Les tics de Poison et de Saignement, et les ronciers, n’ont pas de bonus.", "Genau die Hälfte ist nicht unter der Hälfte. Gift- und Blutungsticks und Dornenhecken bekommen keinen Bonus.",
  "Justo la mitad no está por debajo. Los tics de Veneno y Sangrado, y los zarzales, no tienen bonificación.", "Esattamente metà non è sotto metà. I tick di Veleno e Sanguinamento, e i rovi, non hanno bonus.",
  "Exatamente metade não está abaixo. Os tiques de Veneno e Sangramento, e os silvados, não têm bónus.", "Ang eksaktong kalahati ay hindi kulang sa kalahati. Walang dagdag ang tik ng Poison at Bleed, at ang mga dawag.",
  "சரியாகப் பாதி என்பது பாதிக்குக் கீழ் அல்ல. நஞ்சு, இரத்தக் கசிவு டிக்குகளுக்கும் முட்புதர்களுக்கும் கூடுதல் இல்லை.", "Tepat separuh bukan di bawah separuh. Detak Racun dan Pendarahan, serta semak, tidak mendapat bonus.",
  "正好一半不算低于一半。中毒与流血的跳伤，以及荆棘丛，都没有加成。", "正好一半不算低於一半。中毒與流血的跳傷，以及荊棘叢，都沒有加成。", "ちょうど半分は半分未満ではない。毒と出血の継続ダメージ、いばらにはボーナスなし。", "정확히 절반은 절반 미만이 아니에요. 중독·출혈 틱과 덤불에는 보너스가 없어요."],
"Its hits cash in the target's Poison as extra damage, then the Poison is gone.": [
  "Ses coups encaissent le Poison de la cible en dégâts en plus, puis le Poison disparaît.", "Seine Treffer lösen das Gift des Ziels als Zusatzschaden ein, dann ist das Gift weg.",
  "Sus golpes cobran el Veneno del objetivo como daño extra y luego el Veneno desaparece.", "I suoi colpi incassano il Veleno del bersaglio come danno extra, poi il Veleno sparisce.",
  "Seus golpes cobram o Veneno do alvo como dano extra, e depois o Veneno some.", "Ginagawang dagdag na pinsala ng mga tama nito ang Poison ng target, saka nawawala ang Poison.",
  "இதன் தாக்குதல்கள் இலக்கின் நஞ்சைக் கூடுதல் சேதமாக மாற்றும்; பிறகு நஞ்சு போய்விடும்.", "Serangannya mencairkan Racun target jadi kerusakan tambahan, lalu Racunnya hilang.",
  "它的攻击把目标的中毒层数兑现为额外伤害，随后清除中毒。", "它的攻擊把目標的中毒層數兌現為額外傷害，隨後清除中毒。", "その攻撃は対象の毒を追加ダメージに変え、毒は消える。", "공격이 대상의 중독을 추가 피해로 터뜨리고, 중독은 사라져요."],
"Its shots too. Poison ticks at the start of the round, so it cashes in what the tick left.": [
  "Ses tirs aussi. Le Poison agit au début de la manche : elle encaisse ce qu’il en reste.", "Auch seine Schüsse. Gift tickt zu Rundenbeginn, also löst es ein, was danach übrig ist.",
  "También sus disparos. El Veneno actúa al inicio de la ronda, así que cobra lo que quede.", "Anche i suoi tiri. Il Veleno agisce a inizio round, quindi incassa ciò che resta.",
  "Os disparos também. O Veneno age no início da ronda, então cobra o que sobrar.", "Pati ang mga tira nito. Tumitik ang Poison sa simula ng round, kaya ang natira ang nagagamit.",
  "இதன் எய்தல்களும். சுற்றின் தொடக்கத்தில் நஞ்சு டிக் ஆகும்; மீதமுள்ளதையே இது மாற்றும்.", "Tembakannya juga. Racun berdetak di awal ronde, jadi yang dicairkan adalah sisanya.",
  "射击也算。中毒在回合开始时跳伤，所以兑现的是跳伤后剩下的层数。", "射擊也算。中毒在回合開始時跳傷，所以兌現的是跳傷後剩下的層數。", "射撃も含む。毒はラウンド開始時に発動するので、残った分を起爆する。", "사격도 해당돼요. 중독은 라운드 시작에 틱하므로, 남은 만큼 터뜨려요."],
"Each round, a Poisoned enemy passes 1 Poison to a unit beside it.": [
  "À chaque manche, un ennemi empoisonné transmet 1 Poison à une unité voisine.", "Jede Runde gibt ein vergifteter Feind 1 Gift an eine Einheit neben sich weiter.",
  "Cada ronda, un enemigo envenenado pasa 1 de Veneno a una unidad a su lado.", "Ogni round, un nemico avvelenato passa 1 Veleno a un’unità accanto.",
  "A cada ronda, um inimigo envenenado passa 1 de Veneno a uma unidade ao lado.", "Bawat round, nagpapasa ang isang kalabang nalason ng 1 Poison sa unit sa tabi nito.",
  "ஒவ்வொரு சுற்றிலும், நஞ்சூட்டப்பட்ட ஒரு எதிரி அருகிலுள்ள அலகுக்கு 1 நஞ்சைக் கடத்தும்.", "Tiap ronde, satu musuh Teracuni menularkan 1 Racun ke unit di sebelahnya.",
  "每回合，一个中毒的敌人把1层中毒传给身旁的单位。", "每回合，一個中毒的敵人把1層中毒傳給身旁的單位。", "毎ラウンド、毒状態の敵1体が隣のユニットに毒1を移す。", "매 라운드, 중독된 적 하나가 옆 유닛에게 중독 1을 옮겨요."],
"Each round, up to {n} Poisoned enemies each pass 1 Poison to a unit beside them.": [
  "À chaque manche, jusqu’à {n} ennemis empoisonnés transmettent chacun 1 Poison à une unité voisine.", "Jede Runde geben bis zu {n} vergiftete Feinde je 1 Gift an eine Einheit neben sich weiter.",
  "Cada ronda, hasta {n} enemigos envenenados pasan cada uno 1 de Veneno a una unidad a su lado.", "Ogni round, fino a {n} nemici avvelenati passano ciascuno 1 Veleno a un’unità accanto.",
  "A cada ronda, até {n} inimigos envenenados passam cada um 1 de Veneno a uma unidade ao lado.", "Bawat round, hanggang {n} kalabang nalason ang bawat isa'y nagpapasa ng 1 Poison sa unit sa tabi.",
  "ஒவ்வொரு சுற்றிலும், நஞ்சூட்டப்பட்ட {n} எதிரிகள் வரை ஒவ்வொன்றும் அருகிலுள்ள அலகுக்கு 1 நஞ்சைக் கடத்தும்.", "Tiap ronde, hingga {n} musuh Teracuni masing-masing menularkan 1 Racun ke unit di sebelahnya.",
  "每回合，最多{n}个中毒的敌人各把1层中毒传给身旁的单位。", "每回合，最多{n}個中毒的敵人各把1層中毒傳給身旁的單位。", "毎ラウンド、毒状態の敵最大{n}体がそれぞれ隣のユニットに毒1を移す。", "매 라운드, 중독된 적 최대 {n}명이 각각 옆 유닛에게 중독 1을 옮겨요."],
"From round 2; the carriers are picked at random. A carrier keeps its own Poison, and poison-proof units never catch it.": [
  "Dès la manche 2 ; les porteurs sont tirés au hasard. Un porteur garde son Poison, et les unités immunisées ne l’attrapent jamais.",
  "Ab Runde 2; die Träger werden zufällig gewählt. Ein Träger behält sein Gift, und gift-immune Einheiten fangen es nie.",
  "Desde la ronda 2; los portadores se eligen al azar. Un portador conserva su Veneno, y las unidades inmunes nunca lo pillan.",
  "Dal round 2; i portatori sono scelti a caso. Un portatore tiene il suo Veleno, e le unità immuni non lo prendono mai.",
  "A partir da ronda 2; os portadores são sorteados. Um portador mantém o seu Veneno, e unidades imunes nunca o apanham.",
  "Mula round 2; random ang pagpili sa mga tagadala. Nananatili sa tagadala ang Poison nito, at hindi kailanman nahahawa ang mga immune.",
  "சுற்று 2 முதல்; கடத்திகள் சீரற்ற முறையில் தேர்வாகும். கடத்தி தன் நஞ்சை வைத்திருக்கும்; நஞ்சு தாக்காத அலகுகளுக்கு அது பரவாது.",
  "Mulai ronde 2; pembawanya dipilih acak. Pembawa tetap menyimpan Racunnya, dan unit kebal racun tak pernah tertular.",
  "从第2回合起；携带者随机选出。携带者保留自己的中毒，免疫中毒的单位永远不会被传染。", "從第2回合起；攜帶者隨機選出。攜帶者保留自己的中毒，免疫中毒的單位永遠不會被傳染。",
  "第2ラウンドから。運び手はランダムに選ばれる。運び手の毒は減らず、毒無効のユニットには移らない。", "2라운드부터; 옮기는 유닛은 무작위로 골라요. 옮긴 유닛의 중독은 그대로이고, 중독 면역 유닛은 절대 옮지 않아요."],
"Its hits make the target Brittle for a round.": [
  "Ses coups rendent la cible cassante pendant une manche.", "Seine Treffer machen das Ziel eine Runde lang spröde.", "Sus golpes vuelven quebradizo al objetivo durante una ronda.",
  "I suoi colpi rendono il bersaglio fragile come vetro per un round.", "Seus golpes deixam o alvo quebradiço por uma ronda.", "Ginagawang Marupok ng mga tama nito ang target nang isang round.",
  "இதன் தாக்குதல்கள் இலக்கை ஒரு சுற்றுக்கு நொறுங்கும் நிலையாக்கும்.", "Serangannya membuat target Rapuh selama satu ronde.", "它的攻击使目标易碎1回合。", "它的攻擊使目標易碎1回合。",
  "その攻撃は対象を1ラウンドもろくする。", "공격이 대상을 1라운드 동안 취약하게 만들어요."],
"Its hits make the target Brittle for {n} rounds.": [
  "Ses coups rendent la cible cassante pendant {n} manches.", "Seine Treffer machen das Ziel {n} Runden lang spröde.", "Sus golpes vuelven quebradizo al objetivo durante {n} rondas.",
  "I suoi colpi rendono il bersaglio fragile come vetro per {n} round.", "Seus golpes deixam o alvo quebradiço por {n} rondas.", "Ginagawang Marupok ng mga tama nito ang target nang {n} round.",
  "இதன் தாக்குதல்கள் இலக்கை {n} சுற்றுகளுக்கு நொறுங்கும் நிலையாக்கும்.", "Serangannya membuat target Rapuh selama {n} ronde.", "它的攻击使目标易碎{n}回合。", "它的攻擊使目標易碎{n}回合。",
  "その攻撃は対象を{n}ラウンドもろくする。", "공격이 대상을 {n}라운드 동안 취약하게 만들어요."],
"counts as Frozen for Shatter, but it still acts.": [
  "compte comme gelée pour Éclatement, mais elle agit encore.", "zählt für Zersplittern als gefroren, handelt aber weiter.", "cuenta como congelada para Hacer añicos, pero sigue actuando.",
  "conta come congelata per Frantumare, ma agisce ancora.", "conta como congelada para Estilhaçar, mas continua a agir.", "itinuturing na Nagyelo para sa Shatter, pero kumikilos pa rin.",
  "நொறுக்குக்கு உறைந்ததாகக் கணக்கிடப்படும், ஆனாலும் செயல்படும்.", "dianggap Beku untuk Hancurkan, tetapi tetap bertindak.", "对粉碎而言算作冰冻，但仍能行动。", "對粉碎而言算作冰凍，但仍能行動。",
  "粉砕に対しては凍結扱い。ただし行動はできる。", "분쇄에는 빙결로 취급되지만, 행동은 해요."],
"It wears off one round each upkeep, like Web.": [
  "Elle s’estompe d’une manche à chaque entretien, comme la Toile.", "Es lässt jede Unterhaltsphase um eine Runde nach, wie Netz.", "Se desgasta una ronda en cada mantenimiento, como Telaraña.",
  "Cala di un round a ogni mantenimento, come la Ragnatela.", "Desgasta uma ronda a cada manutenção, como a Teia.", "Nababawasan ng isang round tuwing upkeep, gaya ng Web.",
  "வலை போல, ஒவ்வொரு பராமரிப்பிலும் ஒரு சுற்று குறையும்.", "Berkurang satu ronde tiap upkeep, seperti Jaring.", "每次维护阶段减少1回合，与蛛网相同。", "每次維護階段減少1回合，與蛛網相同。",
  "クモの巣と同じく、毎アップキープに1ラウンド減る。", "거미줄처럼, 매 유지 단계마다 1라운드씩 줄어요."],
"When you play one of its Kin, that unit gets +{n}/+{n}.": [
  "Quand vous jouez l’un de ses parents, cette unité gagne +{n}/+{n}.", "Spielst du einen aus seiner Sippe, erhält diese Einheit +{n}/+{n}.", "Cuando juegas a uno de sus parientes, esa unidad gana +{n}/+{n}.",
  "Quando giochi uno dei suoi parenti, quell’unità ottiene +{n}/+{n}.", "Quando você joga um dos seus parentes, essa unidade ganha +{n}/+{n}.", "Kapag naglaro ka ng isa sa Kaanak nito, +{n}/+{n} ang unit na iyon.",
  "இதன் உறவினர்களில் ஒன்றை நீங்கள் விளையாடும்போது, அந்த அலகு +{n}/+{n} பெறும்.", "Saat kamu memainkan salah satu Kerabatnya, unit itu mendapat +{n}/+{n}.", "你打出它的同族时，该单位获得+{n}/+{n}。", "你打出它的同族時，該單位獲得+{n}/+{n}。",
  "その同族をプレイすると、そのユニットは+{n}/+{n}を得る。", "동족 유닛을 내면, 그 유닛이 +{n}/+{n}을 얻어요."],
"Kin: your units that share a Type with it. It is an On Ally Played trigger, so it is off while it is Waiting, Stunned, Frozen or Asleep.": [
  "Parents : vos unités qui partagent un Type avec elle. C’est un déclencheur Quand un allié est joué : inactif tant qu’elle attend, est étourdie, gelée ou endormie.",
  "Sippe: deine Einheiten, die einen Typ mit ihr teilen. Ein Auslöser bei gespieltem Verbündeten: aus, solange sie wartet, betäubt, gefroren oder schlafend ist.",
  "Parientes: tus unidades que comparten un Tipo con ella. Es un activador Al jugar un aliado, así que no funciona mientras espera o está aturdida, congelada o dormida.",
  "Parenti: le tue unità che condividono un Tipo con lei. È un innesco Quando giochi un alleato: inattivo mentre attende, è stordita, congelata o addormentata.",
  "Parentes: as suas unidades que partilham um Tipo com ela. É um gatilho Ao jogar um aliado: inativo enquanto espera ou está atordoada, congelada ou a dormir.",
  "Kaanak: ang mga unit mong may kaparehong Type nito. On Ally Played trigger ito, kaya patay habang Naghihintay, Stunned, Nagyelo o Tulog.",
  "உறவினர்: இதனுடன் ஒரு வகையைப் பகிரும் உங்கள் அலகுகள். இது கூட்டாளி விளையாடப்படும்போது இயங்கும் தூண்டி; காத்திருக்கும்போதும் திகைப்பு, உறைவு, தூக்கத்திலும் இயங்காது.",
  "Kerabat: unitmu yang berbagi Tipe dengannya. Ini pemicu Saat Sekutu Dimainkan, jadi mati saat ia Menunggu, Pingsan, Beku, atau Tertidur.",
  "同族：与它共享一个类型的己方单位。这是友方打出时的触发，所以它等待、眩晕、冰冻或睡眠时不会触发。", "同族：與它共享一個類型的己方單位。這是友方打出時的觸發，所以它等待、眩暈、冰凍或睡眠時不會觸發。",
  "同族：タイプを1つ共有する自分のユニット。味方プレイ時のトリガーなので、待機・スタン・凍結・睡眠中は働かない。", "동족: 타입을 하나 공유하는 내 유닛. 아군 출전 시 발동이라, 대기·기절·빙결·수면 중에는 꺼져요."],
"When you play a Wolf, the enemy facing it Bleeds {n}.": [
  "Quand vous jouez un Loup, l’ennemi en face saigne de {n}.", "Spielst du einen Wolf, blutet der Feind gegenüber {n}.", "Cuando juegas un Lobo, el enemigo de enfrente sangra {n}.",
  "Quando giochi un Lupo, il nemico di fronte sanguina di {n}.", "Quando você joga um Lobo, o inimigo à frente sangra {n}.", "Kapag naglaro ka ng Lobo, Bleed {n} ang kalabang kaharap nito.",
  "நீங்கள் ஓநாயை விளையாடும்போது, அதன் எதிரே உள்ள எதிரிக்கு இரத்தக் கசிவு {n}.", "Saat kamu memainkan Serigala, musuh di depannya Berdarah {n}.", "你打出狼时，它对面的敌人流血{n}。", "你打出狼時，它對面的敵人流血{n}。",
  "オオカミをプレイすると、その正面の敵が出血{n}。", "늑대를 내면, 그 맞은편 적이 출혈 {n}을 입어요."],
"An On Ally Played trigger, off while it is Waiting, Stunned, Frozen or Asleep. With nobody facing the Wolf, nobody bleeds. A Changeling counts as a Wolf.": [
  "Un déclencheur Quand un allié est joué, inactif tant qu’elle attend, est étourdie, gelée ou endormie. Personne en face du Loup : personne ne saigne. Un Changelin compte comme un Loup.",
  "Ein Auslöser bei gespieltem Verbündeten, aus, solange sie wartet, betäubt, gefroren oder schlafend ist. Steht niemand dem Wolf gegenüber, blutet niemand. Ein Wechselbalg zählt als Wolf.",
  "Un activador Al jugar un aliado, que no funciona mientras espera o está aturdida, congelada o dormida. Sin nadie frente al Lobo, nadie sangra. Un Cambiaformas cuenta como Lobo.",
  "Un innesco Quando giochi un alleato, inattivo mentre attende, è stordita, congelata o addormentata. Se nessuno è di fronte al Lupo, nessuno sanguina. Un Mutaforma conta come Lupo.",
  "Um gatilho Ao jogar um aliado, inativo enquanto espera ou está atordoada, congelada ou a dormir. Sem ninguém à frente do Lobo, ninguém sangra. Um Metamorfo conta como Lobo.",
  "On Ally Played trigger, patay habang Naghihintay, Stunned, Nagyelo o Tulog. Kapag walang kaharap ang Lobo, walang dudugo. Lobo rin ang Changeling.",
  "கூட்டாளி விளையாடப்படும்போது இயங்கும் தூண்டி; காத்திருக்கும்போதும் திகைப்பு, உறைவு, தூக்கத்திலும் இயங்காது. ஓநாயின் எதிரே யாருமில்லையெனில் யாருக்கும் இரத்தக் கசிவு இல்லை. உருமாறி ஓநாயாகக் கணக்கிடப்படும்.",
  "Pemicu Saat Sekutu Dimainkan, mati saat ia Menunggu, Pingsan, Beku, atau Tertidur. Bila tak ada yang menghadap Serigala, tak ada yang berdarah. Pengubah Wujud dihitung sebagai Serigala.",
  "友方打出时的触发，它等待、眩晕、冰冻或睡眠时不会触发。狼的对面没人，就没人流血。变形者算作狼。", "友方打出時的觸發，它等待、眩暈、冰凍或睡眠時不會觸發。狼的對面沒人，就沒人流血。變形者算作狼。",
  "味方プレイ時のトリガー。待機・スタン・凍結・睡眠中は働かない。オオカミの正面に誰もいなければ出血もない。チェンジリングはオオカミとして数える。",
  "아군 출전 시 발동이라, 대기·기절·빙결·수면 중에는 꺼져요. 늑대 맞은편에 아무도 없으면 출혈도 없어요. 체인질링은 늑대로 쳐요."],
"Armor {n} while it holds Prayer tokens.": [
  "Armure {n} tant qu’elle détient des jetons de Prière.", "Rüstung {n}, solange sie Gebetsmarken hält.", "Armadura {n} mientras tenga fichas de Oración.",
  "Armatura {n} finché ha segnalini Preghiera.", "Armadura {n} enquanto tiver fichas de Oração.", "Armor {n} habang may hawak itong Prayer token.",
  "பிரார்த்தனை டோக்கன்கள் இருக்கும்வரை கவசம் {n}.", "Zirah {n} selama ia memegang token Doa.", "持有祈祷标记时，护甲{n}。", "持有祈禱標記時，護甲{n}。",
  "祈りトークンを持つ間、アーマー{n}。", "기도 토큰을 가진 동안 방어구 {n}."],
"A 🧿 on the unit shows while the ward is up; it falls with the last token.": [
  "Un 🧿 sur l’unité montre que la garde est active ; elle tombe avec le dernier jeton.", "Ein 🧿 auf der Einheit zeigt, dass der Schutz steht; er fällt mit der letzten Marke.",
  "Un 🧿 en la unidad indica que la guarda está activa; cae con la última ficha.", "Un 🧿 sull’unità mostra che la protezione è attiva; cade con l’ultimo segnalino.",
  "Um 🧿 na unidade mostra que a proteção está ativa; cai com a última ficha.", "May 🧿 sa unit habang nakataas ang bantay; bumabagsak ito kasabay ng huling token.",
  "காப்பு இருக்கும்வரை அலகின் மேல் 🧿 தெரியும்; கடைசி டோக்கனுடன் அது விழும்.", "Ada 🧿 di unit selama perisai aktif; ia runtuh bersama token terakhir.",
  "护符生效时，单位上显示🧿；最后一个标记消失时它也随之失效。", "護符生效時，單位上顯示🧿；最後一個標記消失時它也隨之失效。", "護りがある間はユニットに🧿が出る。最後のトークンと共に消える。", "수호가 있는 동안 유닛에 🧿가 보여요. 마지막 토큰과 함께 사라져요."],
"When played, the field's round effects stop for {n} rounds.": [
  "Quand elle est jouée, les effets de manche du terrain s’arrêtent pendant {n} manches.", "Beim Ausspielen stoppen die Rundeneffekte des Felds für {n} Runden.",
  "Al jugarse, los efectos de ronda del campo se detienen durante {n} rondas.", "Quando viene giocata, gli effetti di round del campo si fermano per {n} round.",
  "Ao ser jogada, os efeitos de ronda do campo param por {n} rondas.", "Kapag nilaro, tumitigil ang mga epekto ng larangan bawat round nang {n} round.",
  "விளையாடப்படும்போது, களத்தின் சுற்று விளைவுகள் {n} சுற்றுகளுக்கு நிற்கும்.", "Saat dimainkan, efek ronde medan berhenti selama {n} ronde.",
  "打出时，场地的每回合效果停止{n}回合。", "打出時，場地的每回合效果停止{n}回合。", "プレイ時、フィールドのラウンド効果が{n}ラウンド止まる。", "낼 때, 필드의 라운드 효과가 {n}라운드 동안 멈춰요."],
"When played, the field's round effects stop for a round.": [
  "Quand elle est jouée, les effets de manche du terrain s’arrêtent pendant une manche.", "Beim Ausspielen stoppen die Rundeneffekte des Felds für eine Runde.",
  "Al jugarse, los efectos de ronda del campo se detienen durante una ronda.", "Quando viene giocata, gli effetti di round del campo si fermano per un round.",
  "Ao ser jogada, os efeitos de ronda do campo param por uma ronda.", "Kapag nilaro, tumitigil ang mga epekto ng larangan bawat round nang isang round.",
  "விளையாடப்படும்போது, களத்தின் சுற்று விளைவுகள் ஒரு சுற்றுக்கு நிற்கும்.", "Saat dimainkan, efek ronde medan berhenti selama satu ronde.",
  "打出时，场地的每回合效果停止1回合。", "打出時，場地的每回合效果停止1回合。", "プレイ時、フィールドのラウンド効果が1ラウンド止まる。", "낼 때, 필드의 라운드 효과가 1라운드 동안 멈춰요."],
"{name} breaks the field: its round effects stop for a round.": ["{name} brise le terrain : ses effets de manche s’arrêtent pendant une manche.", "{name} bricht das Feld: Seine Rundeneffekte stoppen für eine Runde.",
  "{name} rompe el campo: sus efectos de ronda se detienen durante una ronda.", "{name} spezza il campo: i suoi effetti di round si fermano per un round.", "{name} quebra o campo: os seus efeitos de ronda param por uma ronda.",
  "Binasag ni {name} ang larangan: tigil ang mga epekto nito bawat round nang isang round.", "{name} களத்தை உடைக்கிறது: அதன் சுற்று விளைவுகள் ஒரு சுற்றுக்கு நிற்கும்.", "{name} memecah medan: efek rondenya berhenti selama satu ronde.",
  "{name}打破了场地：其每回合效果停止1回合。", "{name}打破了場地：其每回合效果停止1回合。", "{name}がフィールドを打ち破る：ラウンド効果が1ラウンド止まる。", "{name}이(가) 필드를 깨뜨려요: 라운드 효과가 1라운드 동안 멈춰요."],
"For both sides. Hazards, Swamp Fever, the Tide-spout and the volcano stop; day and night, the Tide, Darkness, wind and field cards carry on.": [
  "Pour les deux camps. Les dangers, la Fièvre des marais, le Geyser de marée et le volcan s’arrêtent ; le jour et la nuit, la Marée, les Ténèbres, le vent et les cartes de terrain continuent.",
  "Für beide Seiten. Gefahren, Sumpffieber, die Gezeitenfontäne und der Vulkan stoppen; Tag und Nacht, die Flut, Dunkelheit, Wind und Feldkarten laufen weiter.",
  "Para ambos bandos. Los peligros, la Fiebre del pantano, el Surtidor de marea y el volcán se detienen; el día y la noche, la Marea, la Oscuridad, el viento y las cartas de campo siguen.",
  "Per entrambi i lati. Pericoli, Febbre di palude, Getto di marea e vulcano si fermano; giorno e notte, la Marea, l’Oscurità, il vento e le carte campo continuano.",
  "Para os dois lados. Perigos, Febre do pântano, Jato de maré e vulcão param; dia e noite, a Maré, a Escuridão, o vento e as cartas de campo continuam.",
  "Para sa parehong panig. Tumitigil ang mga panganib, Lagnat ng Latian, Buga ng Alon at bulkan; tuloy ang araw at gabi, ang Tide, Dilim, hangin at mga field card.",
  "இரு பக்கத்துக்கும். அபாயங்கள், சதுப்புக் காய்ச்சல், அலை ஊற்று, எரிமலை நிற்கும்; பகல் இரவு, அலை, இருள், காற்று, கள அட்டைகள் தொடரும்.",
  "Untuk kedua pihak. Bahaya, Demam Rawa, Semburan Pasang, dan gunung api berhenti; siang dan malam, Pasang, Kegelapan, angin, dan kartu medan tetap berjalan.",
  "双方皆然。各种险情、沼泽热病、潮汐喷泉和火山会停止；昼夜、潮汐、黑暗、风和场地卡照常。", "雙方皆然。各種險情、沼澤熱病、潮汐噴泉和火山會停止；晝夜、潮汐、黑暗、風和場地卡照常。",
  "両陣営とも。危険、沼熱、潮の噴出、火山は止まる。昼夜、潮、闇、風、フィールドカードは続く。", "양쪽 모두. 위험, 늪 열병, 물기둥, 화산이 멈추고; 낮과 밤, 조수, 어둠, 바람, 필드 카드는 계속돼요."],
"Spore Cloud": ["Nuage de spores", "Sporenwolke", "Nube de esporas", "Nube di spore", "Nuvem de esporos", "Ulap ng Spora", "வித்து மேகம்", "Awan Spora", "孢子云", "孢子雲", "胞子の雲", "포자 구름"],
"From round 2, one random unit a side falls Asleep for the round.": [
  "Dès la manche 2, une unité au hasard de chaque camp s’endort pour la manche.", "Ab Runde 2 schläft je Seite eine zufällige Einheit für die Runde ein.",
  "Desde la ronda 2, una unidad al azar de cada bando se duerme durante la ronda.", "Dal round 2, un’unità a caso per lato si addormenta per il round.",
  "A partir da ronda 2, uma unidade ao acaso de cada lado adormece durante a ronda.", "Mula round 2, isang random na unit bawat panig ang Matutulog sa round na iyon.",
  "சுற்று 2 முதல், ஒவ்வொரு பக்கத்திலும் ஒரு சீரற்ற அலகு அந்தச் சுற்றுக்குத் தூங்கும்.", "Mulai ronde 2, satu unit acak tiap pihak Tertidur selama ronde itu.",
  "从第2回合起，每方随机一个单位在该回合陷入睡眠。", "從第2回合起，每方隨機一個單位在該回合陷入睡眠。", "第2ラウンドから、各陣営のランダムなユニット1体がそのラウンド睡眠になる。", "2라운드부터, 각 진영의 무작위 유닛 하나가 그 라운드 동안 잠들어요."],
"A unit a side falls Asleep": ["Une unité par camp s’endort", "Je Seite schläft eine Einheit", "Una unidad por bando se duerme", "Un’unità per lato si addormenta", "Uma unidade por lado adormece",
  "Isang unit bawat panig ang natutulog", "ஒரு பக்கத்துக்கு ஒரு அலகு தூங்கும்", "Satu unit tiap pihak tertidur", "每方一个单位睡着", "每方一個單位睡著", "各陣営1体が睡眠", "진영마다 유닛 하나가 잠들어요"],
"It is Sleep 1, so the Sleep cap holds (2 at most), and a hit wakes it. Poison-proof units breathe nothing in.": [
  "C’est Sommeil 1 : le plafond de Sommeil tient (2 au plus), et un coup la réveille. Les unités immunisées au poison ne respirent rien.",
  "Es ist Schlaf 1: Die Schlafgrenze gilt (höchstens 2), und ein Treffer weckt sie. Gift-immune Einheiten atmen nichts ein.",
  "Es Sueño 1, así que el tope de Sueño se mantiene (2 como máximo) y un golpe la despierta. Las unidades inmunes al veneno no respiran nada.",
  "È Sonno 1: il limite del Sonno vale (al massimo 2), e un colpo la sveglia. Le unità immuni al veleno non respirano nulla.",
  "É Sono 1, então o limite de Sono vale (no máximo 2), e um golpe a acorda. Unidades imunes a veneno não respiram nada.",
  "Sleep 1 ito, kaya nananatili ang hangganan ng Sleep (2 pinakamarami), at ginigising ito ng tama. Walang nalalanghap ang mga immune sa lason.",
  "இது தூக்கம் 1; தூக்க வரம்பு பொருந்தும் (அதிகபட்சம் 2), ஒரு தாக்குதல் எழுப்பும். நஞ்சு தாக்காத அலகுகள் எதையும் சுவாசிக்காது.",
  "Ini Tidur 1, jadi batas Tidur berlaku (paling banyak 2), dan satu serangan membangunkannya. Unit kebal racun tak menghirup apa pun.",
  "这是睡眠1，所以睡眠上限有效（最多2），受到攻击就会醒。免疫中毒的单位不会吸入。", "這是睡眠1，所以睡眠上限有效（最多2），受到攻擊就會醒。免疫中毒的單位不會吸入。",
  "睡眠1なので睡眠の上限（最大2）が効き、攻撃で目覚める。毒無効のユニットは吸い込まない。", "수면 1이라 수면 상한(최대 2)이 적용되고, 공격을 받으면 깨요. 중독 면역 유닛은 아무것도 들이마시지 않아요."],
"Thunderstorm": ["Orage", "Gewitter", "Tormenta eléctrica", "Temporale", "Trovoada", "Bagyong Kidlat", "இடிமழை", "Badai Petir", "雷暴", "雷暴", "雷雨", "뇌우"],
"From round 2, lightning strikes one random unit a side for {n}.": [
  "Dès la manche 2, la foudre frappe une unité au hasard de chaque camp pour {n}.", "Ab Runde 2 trifft ein Blitz je Seite eine zufällige Einheit für {n}.",
  "Desde la ronda 2, un rayo golpea una unidad al azar de cada bando por {n}.", "Dal round 2, un fulmine colpisce un’unità a caso per lato per {n}.",
  "A partir da ronda 2, um raio atinge uma unidade ao acaso de cada lado por {n}.", "Mula round 2, tinatamaan ng kidlat ang isang random na unit bawat panig nang {n}.",
  "சுற்று 2 முதல், ஒவ்வொரு பக்கத்திலும் ஒரு சீரற்ற அலகை மின்னல் {n} தாக்கும்.", "Mulai ronde 2, petir menyambar satu unit acak tiap pihak sebesar {n}.",
  "从第2回合起，闪电每回合击中每方随机一个单位，造成{n}点伤害。", "從第2回合起，閃電每回合擊中每方隨機一個單位，造成{n}點傷害。", "第2ラウンドから、雷が各陣営のランダムなユニット1体に{n}を与える。", "2라운드부터, 번개가 각 진영의 무작위 유닛 하나에 {n} 피해를 줘요."],
"Lightning: {n} to a unit a side": ["Foudre : {n} à une unité par camp", "Blitz: {n} auf eine Einheit je Seite", "Rayo: {n} a una unidad por bando", "Fulmine: {n} a un’unità per lato", "Raio: {n} numa unidade por lado",
  "Kidlat: {n} sa isang unit bawat panig", "மின்னல்: பக்கத்துக்கு ஒரு அலகுக்கு {n}", "Petir: {n} ke satu unit tiap pihak", "闪电：每方一个单位{n}点", "閃電：每方一個單位{n}點", "雷：各陣営1体に{n}", "번개: 진영마다 유닛 하나에 {n}"],
"It is lightning: each Wet counter adds 1, and Resist halves it.": [
  "C’est la foudre : chaque compteur Mouillée ajoute 1, et la Résistance la divise par deux.", "Es ist Blitz: Jeder Nass-Zähler fügt 1 hinzu, und Resistenz halbiert ihn.",
  "Es rayo: cada contador de Mojada suma 1, y la Resistencia lo reduce a la mitad.", "È fulmine: ogni segnalino Bagnata aggiunge 1, e la Resistenza lo dimezza.",
  "É raio: cada marcador de Molhada soma 1, e a Resistência reduz à metade.", "Kidlat ito: bawat Wet counter ay dagdag 1, at hinahati ito ng Resist.",
  "இது மின்னல்: ஒவ்வொரு நனைவுக் குறியும் 1 சேர்க்கும், எதிர்ப்பு பாதியாக்கும்.", "Ini petir: tiap penanda Basah menambah 1, dan Ketahanan membaginya dua.",
  "这是闪电：每个潮湿计数加1，抗性减半。", "這是閃電：每個潮溼計數加1，抗性減半。", "雷なので、濡れカウンター1つごとに+1、耐性で半減。", "번개라서, 젖음 카운터마다 1 더하고, 저항이 있으면 절반이 돼요."],
"Tangled Roots": ["Racines enchevêtrées", "Wurzelgewirr", "Raíces enredadas", "Radici intrecciate", "Raízes emaranhadas", "Buhol na Ugat", "சிக்கிய வேர்கள்", "Akar Kusut", "缠根", "纏根", "絡みつく根", "얽힌 뿌리"],
"From round 2, roots grab one random unit a side: Webbed for the round.": [
  "Dès la manche 2, des racines saisissent une unité au hasard de chaque camp : engluée pour la manche.", "Ab Runde 2 packen Wurzeln je Seite eine zufällige Einheit: umsponnen für die Runde.",
  "Desde la ronda 2, las raíces atrapan una unidad al azar de cada bando: enredada durante la ronda.", "Dal round 2, le radici afferrano un’unità a caso per lato: invischiata per il round.",
  "A partir da ronda 2, raízes agarram uma unidade ao acaso de cada lado: presa na teia durante a ronda.", "Mula round 2, sinusunggaban ng ugat ang isang random na unit bawat panig: Webbed sa round na iyon.",
  "சுற்று 2 முதல், வேர்கள் ஒவ்வொரு பக்கத்திலும் ஒரு சீரற்ற அலகைப் பிடிக்கும்: அந்தச் சுற்றுக்கு வலையில் சிக்கும்.", "Mulai ronde 2, akar mencengkeram satu unit acak tiap pihak: Terjerat selama ronde itu.",
  "从第2回合起，树根抓住每方随机一个单位：该回合蛛网缠身。", "從第2回合起，樹根抓住每方隨機一個單位：該回合蛛網纏身。", "第2ラウンドから、根が各陣営のランダムなユニット1体をつかむ：そのラウンドはクモの巣状態。", "2라운드부터, 뿌리가 각 진영의 무작위 유닛 하나를 붙잡아요: 그 라운드 동안 거미줄에 걸려요."],
"A unit a side is Webbed": ["Une unité par camp est engluée", "Je Seite ist eine Einheit umsponnen", "Una unidad por bando queda enredada", "Un’unità per lato è invischiata", "Uma unidade por lado fica presa",
  "Isang unit bawat panig ang Webbed", "ஒரு பக்கத்துக்கு ஒரு அலகு வலையில்", "Satu unit tiap pihak Terjerat", "每方一个单位被缠住", "每方一個單位被纏住", "各陣営1体がクモの巣", "진영마다 유닛 하나가 거미줄에"],
"Webbed: it can't dodge, and it can't move or be moved. Flyers and Structures are above the roots.": [
  "Engluée : elle ne peut pas esquiver, ni bouger ni être déplacée. Les volants et les structures sont au-dessus des racines.",
  "Umsponnen: Sie kann nicht ausweichen und sich weder bewegen noch bewegt werden. Flieger und Bauwerke sind über den Wurzeln.",
  "Enredada: no puede esquivar, ni moverse ni ser movida. Los voladores y las estructuras están por encima de las raíces.",
  "Invischiata: non può schivare, né muoversi né essere spostata. Volanti e strutture sono sopra le radici.",
  "Presa: não pode esquivar, nem mover-se nem ser movida. Voadores e estruturas ficam acima das raízes.",
  "Webbed: hindi ito makaiwas, at hindi makagalaw o maigalaw. Nasa itaas ng mga ugat ang mga lumilipad at Structure.",
  "வலையில்: இது தவிர்க்க முடியாது, நகரவோ நகர்த்தப்படவோ முடியாது. பறப்பவையும் கட்டமைப்புகளும் வேர்களுக்கு மேல் உள்ளன.",
  "Terjerat: tak bisa menghindar, tak bisa bergerak atau dipindahkan. Unit terbang dan Bangunan berada di atas akar.",
  "蛛网缠身：无法闪避，也无法移动或被移动。飞行单位和建筑不受树根影响。", "蛛網纏身：無法閃避，也無法移動或被移動。飛行單位和建築不受樹根影響。",
  "クモの巣：回避できず、移動もされない。飛行ユニットと建造物は根の届かない上にいる。", "거미줄: 회피할 수 없고, 움직이거나 밀려나지도 않아요. 비행 유닛과 구조물은 뿌리 위에 있어요."],
"Spores drift over the field.": ["Des spores dérivent sur le terrain.", "Sporen treiben über das Feld.", "Las esporas flotan sobre el campo.", "Le spore fluttuano sul campo.", "Esporos pairam sobre o campo.",
  "Lumulutang ang mga spora sa larangan.", "களத்தின் மேல் வித்துகள் மிதக்கின்றன.", "Spora melayang di atas medan.", "孢子飘过战场。", "孢子飄過戰場。", "胞子がフィールドを漂う。", "포자가 필드 위를 떠다녀요."],
"{name} breathes the spores and falls Asleep.": ["{name} respire les spores et s’endort.", "{name} atmet die Sporen ein und schläft ein.", "{name} respira las esporas y se duerme.", "{name} respira le spore e si addormenta.", "{name} respira os esporos e adormece.",
  "Nalanghap ni {name} ang spora at nakatulog.", "{name} வித்துகளைச் சுவாசித்துத் தூங்குகிறது.", "{name} menghirup spora dan Tertidur.", "{name}吸入孢子，陷入睡眠。", "{name}吸入孢子，陷入睡眠。", "{name}は胞子を吸い込み、眠りに落ちる。", "{name}이(가) 포자를 들이마시고 잠들어요."],
"Thunder rolls: lightning strikes for {n}.": ["Le tonnerre gronde : la foudre frappe pour {n}.", "Donner grollt: Der Blitz schlägt für {n} ein.", "Retumba el trueno: el rayo golpea por {n}.", "Il tuono rimbomba: il fulmine colpisce per {n}.", "O trovão ressoa: o raio atinge por {n}.",
  "Kumukulog: tumatama ang kidlat nang {n}.", "இடி முழங்குகிறது: மின்னல் {n} தாக்குகிறது.", "Guntur bergemuruh: petir menyambar sebesar {n}.", "雷声滚滚：闪电造成{n}点伤害。", "雷聲滾滾：閃電造成{n}點傷害。", "雷鳴：雷が{n}で落ちる。", "천둥이 울려요: 번개가 {n} 피해로 내리쳐요."],
"Lightning strikes {name} for {dmg}.": ["La foudre frappe {name} pour {dmg}.", "Der Blitz trifft {name} für {dmg}.", "El rayo golpea a {name} por {dmg}.", "Il fulmine colpisce {name} per {dmg}.", "O raio atinge {name} por {dmg}.",
  "Tinamaan ng kidlat si {name} nang {dmg}.", "மின்னல் {name}-ஐ {dmg} தாக்குகிறது.", "Petir menyambar {name} sebesar {dmg}.", "闪电击中{name}，造成{dmg}点伤害。", "閃電擊中{name}，造成{dmg}點傷害。", "雷が{name}に{dmg}。", "번개가 {name}에게 {dmg} 피해를 줘요."],
"Lightning strikes {name} for {dmg} (it is Wet).": ["La foudre frappe {name} pour {dmg} (elle est mouillée).", "Der Blitz trifft {name} für {dmg} (nass).", "El rayo golpea a {name} por {dmg} (está mojada).", "Il fulmine colpisce {name} per {dmg} (è bagnata).", "O raio atinge {name} por {dmg} (está molhada).",
  "Tinamaan ng kidlat si {name} nang {dmg} (basa ito).", "மின்னல் {name}-ஐ {dmg} தாக்குகிறது (அது நனைந்துள்ளது).", "Petir menyambar {name} sebesar {dmg} (ia Basah).", "闪电击中{name}，造成{dmg}点伤害（它是潮湿的）。", "閃電擊中{name}，造成{dmg}點傷害（它是潮溼的）。", "雷が{name}に{dmg}（濡れている）。", "번개가 {name}에게 {dmg} 피해를 줘요 (젖어 있어요)."],
"Roots writhe up through the ground.": ["Des racines jaillissent du sol en se tordant.", "Wurzeln winden sich aus dem Boden.", "Las raíces se retuercen saliendo del suelo.", "Le radici si contorcono emergendo dal terreno.", "Raízes contorcem-se e saem do chão.",
  "Pumipilipit pataas sa lupa ang mga ugat.", "வேர்கள் நெளிந்து தரையிலிருந்து எழுகின்றன.", "Akar menggeliat keluar dari tanah.", "树根从地下扭动着钻出。", "樹根從地下扭動著鑽出。", "根が地面からうねり出る。", "뿌리가 땅에서 꿈틀대며 솟아나요."],
"Roots grab {name}: Webbed this round.": ["Des racines saisissent {name} : engluée pour la manche.", "Wurzeln packen {name}: diese Runde umsponnen.", "Las raíces atrapan a {name}: enredada esta ronda.", "Le radici afferrano {name}: invischiata per questo round.", "Raízes agarram {name}: presa nesta ronda.",
  "Sinunggaban ng ugat si {name}: Webbed ngayong round.", "வேர்கள் {name}-ஐப் பிடிக்கின்றன: இந்தச் சுற்று வலையில்.", "Akar mencengkeram {name}: Terjerat ronde ini.", "树根抓住{name}：本回合蛛网缠身。", "樹根抓住{name}：本回合蛛網纏身。", "根が{name}をつかむ：このラウンドはクモの巣状態。", "뿌리가 {name}을(를) 붙잡아요: 이번 라운드 거미줄에 걸렸어요."],
"{att} detonates the Poison on {name}: +{n} damage.": ["{att} fait détoner le Poison de {name} : +{n} dégâts.", "{att} zündet das Gift auf {name}: +{n} Schaden.", "{att} detona el Veneno de {name}: +{n} de daño.", "{att} fa detonare il Veleno su {name}: +{n} danni.", "{att} detona o Veneno de {name}: +{n} de dano.",
  "Pinasabog ni {att} ang Poison kay {name}: +{n} pinsala.", "{att} {name} மீதுள்ள நஞ்சை வெடிக்கச் செய்கிறது: +{n} சேதம்.", "{att} meledakkan Racun pada {name}: +{n} kerusakan.", "{att}引爆了{name}身上的中毒：+{n}点伤害。", "{att}引爆了{name}身上的中毒：+{n}點傷害。", "{att}が{name}の毒を起爆：+{n}ダメージ。", "{att}이(가) {name}의 중독을 터뜨려요: +{n} 피해."],
"The Poison spreads from {from} to {name}.": ["Le Poison passe de {from} à {name}.", "Das Gift springt von {from} auf {name} über.", "El Veneno pasa de {from} a {name}.", "Il Veleno passa da {from} a {name}.", "O Veneno passa de {from} para {name}.",
  "Kumalat ang Poison mula kay {from} papunta kay {name}.", "நஞ்சு {from}-இலிருந்து {name}-க்குப் பரவுகிறது.", "Racun menyebar dari {from} ke {name}.", "中毒从{from}扩散到{name}。", "中毒從{from}擴散到{name}。", "毒が{from}から{name}へ広がる。", "중독이 {from}에서 {name}(으)로 번져요."],
"{att} makes {name} Brittle ({n}).": ["{att} rend {name} cassante ({n}).", "{att} macht {name} spröde ({n}).", "{att} vuelve quebradiza a {name} ({n}).", "{att} rende {name} fragile come vetro ({n}).", "{att} deixa {name} quebradiça ({n}).",
  "Ginawang Marupok ni {att} si {name} ({n}).", "{att} {name}-ஐ நொறுங்கும் நிலையாக்குகிறது ({n}).", "{att} membuat {name} Rapuh ({n}).", "{att}使{name}易碎（{n}）。", "{att}使{name}易碎（{n}）。", "{att}が{name}をもろくする（{n}）。", "{att}이(가) {name}을(를) 취약하게 만들어요 ({n})."],
"{name} breaks the field: its round effects stop for {n} rounds.": ["{name} brise le terrain : ses effets de manche s’arrêtent pendant {n} manches.", "{name} bricht das Feld: Seine Rundeneffekte stoppen für {n} Runden.",
  "{name} rompe el campo: sus efectos de ronda se detienen durante {n} rondas.", "{name} spezza il campo: i suoi effetti di round si fermano per {n} round.", "{name} quebra o campo: os seus efeitos de ronda param por {n} rondas.",
  "Binasag ni {name} ang larangan: tigil ang mga epekto nito bawat round nang {n} round.", "{name} களத்தை உடைக்கிறது: அதன் சுற்று விளைவுகள் {n} சுற்றுகளுக்கு நிற்கும்.", "{name} memecah medan: efek rondenya berhenti selama {n} ronde.",
  "{name}打破了场地：其每回合效果停止{n}回合。", "{name}打破了場地：其每回合效果停止{n}回合。", "{name}がフィールドを打ち破る：ラウンド効果が{n}ラウンド止まる。", "{name}이(가) 필드를 깨뜨려요: 라운드 효과가 {n}라운드 동안 멈춰요."],
"The field is quiet this round.": ["Le terrain est calme cette manche.", "Das Feld ist diese Runde ruhig.", "El campo está en calma esta ronda.", "Il campo è quieto in questo round.", "O campo está calmo nesta ronda.",
  "Tahimik ang larangan ngayong round.", "இந்தச் சுற்றில் களம் அமைதியாக உள்ளது.", "Medan tenang ronde ini.", "本回合场地平静。", "本回合場地平靜。", "このラウンド、フィールドは静かだ。", "이번 라운드 필드는 조용해요."],
"Field broken": ["Terrain brisé", "Feld gebrochen", "Campo roto", "Campo spezzato", "Campo quebrado", "Basag ang larangan", "களம் உடைந்தது", "Medan pecah", "场地已破", "場地已破", "フィールド破壊", "필드 파괴"],
"Brittle for {n}: Shatter treats it as Frozen": ["Cassante pour {n} : Éclatement la traite comme gelée", "Spröde für {n}: Zersplittern behandelt sie als gefroren", "Quebradiza por {n}: Hacer añicos la trata como congelada",
  "Fragile come vetro per {n}: Frantumare la tratta come congelata", "Quebradiça por {n}: Estilhaçar trata-a como congelada", "Marupok nang {n}: Nagyelo ito para sa Shatter", "{n}க்கு நொறுங்கும்: நொறுக்கு இதை உறைந்ததாகக் கருதும்",
  "Rapuh selama {n}: Hancurkan menganggapnya Beku", "易碎{n}：粉碎视其为冰冻", "易碎{n}：粉碎視其為冰凍", "もろい（{n}）：粉砕は凍結扱い", "취약 {n}: 분쇄는 빙결로 취급해요"],
"Prayer Ward: Armor {n} while it holds Prayer tokens": ["Garde de prière : Armure {n} tant qu’elle détient des jetons de Prière", "Gebetsschutz: Rüstung {n}, solange sie Gebetsmarken hält", "Guarda de oración: Armadura {n} mientras tenga fichas de Oración",
  "Protezione della preghiera: Armatura {n} finché ha segnalini Preghiera", "Proteção de oração: Armadura {n} enquanto tiver fichas de Oração", "Bantay ng Dasal: Armor {n} habang may hawak na Prayer token",
  "பிரார்த்தனைக் காப்பு: பிரார்த்தனை டோக்கன்கள் இருக்கும்வரை கவசம் {n}", "Perisai Doa: Zirah {n} selama memegang token Doa", "祈祷护符：持有祈祷标记时护甲{n}", "祈禱護符：持有祈禱標記時護甲{n}", "祈りの護り：祈りトークンを持つ間アーマー{n}", "기도의 수호: 기도 토큰을 가진 동안 방어구 {n}"],
}

# The example POOL cards: names (lang/cards) and flavour lines (lang/ui)
CARD_NAMES = {
"Fen Mink": ["Vison des marais", "Moornerz", "Visón del pantano", "Visone di palude", "Vison do brejo", "Mink ng Latian", "சதுப்பு மிங்க்", "Cerpelai Rawa", "沼泽水貂", "沼澤水貂", "沼のミンク", "늪 밍크"],
"Tidepool Trapper Crab": ["Crabe piégeur des flaques", "Gezeitentümpel-Fallenkrabbe", "Cangrejo trampero de pozas", "Granchio trappola delle pozze", "Caranguejo armadilheiro das poças", "Alimangong Bitag ng Laot", "அலைக்குளப் பொறி நண்டு", "Kepiting Penjebak Kolam Pasang", "潮池陷阱蟹", "潮池陷阱蟹", "潮だまりの罠ガニ", "조수웅덩이 덫게"],
"Grave-Grin Hyena": ["Hyène au rictus funèbre", "Grabgrinsende Hyäne", "Hiena de la sonrisa fúnebre", "Iena dal ghigno funebre", "Hiena do sorriso fúnebre", "Hayenang Ngiting-Libingan", "கல்லறைச் சிரிப்புக் கழுதைப்புலி", "Hyena Seringai Kubur", "墓笑鬣狗", "墓笑鬣狗", "墓笑いのハイエナ", "무덤웃음 하이에나"],
"Bogfire Newt": ["Triton feu-follet", "Sumpffeuer-Molch", "Tritón fuego fatuo", "Tritone fuoco fatuo", "Tritão fogo-fátuo", "Newt ng Apoy-Latian", "சதுப்புத் தீ நியூட்", "Kadal Api Rawa", "沼火蝾螈", "沼火蠑螈", "沼火のイモリ", "늪불 영원"],
"Plague Gnat Cloud": ["Nuée de moucherons pestiférés", "Seuchenmückenwolke", "Nube de jejenes de la plaga", "Nube di moscerini della peste", "Nuvem de mosquitos da praga", "Ulap ng Salot na Niknik", "கொள்ளைநோய்க் கொசு மேகம்", "Awan Agas Wabah", "瘟疫蚋群", "瘟疫蚋群", "疫病ブヨの群れ", "역병 각다귀 떼"],
"Glasswing Moth": ["Papillon aile-de-verre", "Glasflügelmotte", "Polilla alas de cristal", "Falena ali di vetro", "Mariposa asa-de-vidro", "Gamugamong Pakpak-Salamin", "கண்ணாடிச் சிறகு அந்துப்பூச்சி", "Ngengat Sayap Kaca", "玻璃翅蛾", "玻璃翅蛾", "ガラス羽の蛾", "유리날개 나방"],
"Rivergate Drummer": ["Tambour de Portrivière", "Flusstor-Trommler", "Tamborilero de Puertarrío", "Tamburino di Portafiume", "Tambor da Porta do Rio", "Tambulero ng Rivergate", "ஆற்றுவாயில் முரசுக்காரன்", "Penabuh Gerbang Sungai", "河门鼓手", "河門鼓手", "リバーゲートの太鼓打ち", "강문의 북잡이"],
"Frostmoon Howler": ["Hurleur de lune givrée", "Frostmond-Heuler", "Aullador de luna helada", "Ululatore di luna gelida", "Uivador da lua gelada", "Umaalulong sa Buwan ng Yelo", "பனிநிலவு ஊளையன்", "Pelolong Bulan Beku", "霜月嚎狼", "霜月嚎狼", "霜月の遠吠え", "서리달 울부짖음이"],
"Chapel Tortoise": ["Tortue chapelle", "Kapellenschildkröte", "Tortuga capilla", "Tartaruga cappella", "Tartaruga capela", "Pagong-Kapilya", "சிற்றாலய ஆமை", "Kura-kura Kapel", "礼拜堂陆龟", "禮拜堂陸龜", "礼拝堂のリクガメ", "예배당 거북"],
"Weathervane Swift": ["Martinet girouette", "Wetterfahnen-Segler", "Vencejo veleta", "Rondone banderuola", "Andorinhão catavento", "Layang-Layang na Panturo ng Hangin", "காற்றுத்திசைக் காட்டி உழவாரன்", "Walet Penunjuk Angin", "风向标雨燕", "風向標雨燕", "風見のアマツバメ", "바람개비 칼새"],
}
FLAVOR = {
"It follows the sick ones. The swamp does half the work; the mink does the rest.": [
  "Il suit les malades. Le marais fait la moitié du travail ; le vison, le reste.", "Er folgt den Kranken. Der Sumpf macht die halbe Arbeit, der Nerz den Rest.",
  "Sigue a los enfermos. El pantano hace la mitad del trabajo; el visón, el resto.", "Segue i malati. La palude fa metà del lavoro; il visone, il resto.",
  "Segue os doentes. O brejo faz metade do trabalho; o vison faz o resto.", "Sinusundan nito ang mga may sakit. Kalahati ng trabaho ay sa latian; ang natitira, sa mink.",
  "அது நோயுற்றவற்றைப் பின்தொடரும். பாதி வேலையைச் சதுப்பு செய்யும்; மீதியை மிங்க்.", "Ia membuntuti yang sakit. Rawa mengerjakan separuhnya; cerpelai sisanya.",
  "它专挑病弱的跟。沼泽做了一半的活，剩下的归水貂。", "牠專挑病弱的跟。沼澤做了一半的活，剩下的歸水貂。", "弱ったものの後をつける。沼が半分を、ミンクが残りを片づける。", "병든 것만 따라가요. 늪이 절반을 하고, 나머지는 밍크가 해요."],
"It waits where the waves break. Anything soaked and slow gets pinched twice.": [
  "Il attend là où les vagues se brisent. Tout ce qui est trempé et lent se fait pincer deux fois.", "Sie wartet, wo die Wellen brechen. Was nass und langsam ist, wird zweimal gezwickt.",
  "Espera donde rompen las olas. Lo que esté empapado y lento recibe dos pellizcos.", "Aspetta dove si infrangono le onde. Ciò che è fradicio e lento viene pizzicato due volte.",
  "Espera onde as ondas rebentam. Tudo o que está encharcado e lento leva dois beliscões.", "Naghihintay ito kung saan bumabagsak ang alon. Ang basa at mabagal, dalawang beses kinukurot.",
  "அலைகள் உடையும் இடத்தில் காத்திருக்கும். நனைந்து மெதுவானது எதுவும் இருமுறை கிள்ளப்படும்.", "Ia menunggu di tempat ombak pecah. Yang basah dan lamban dijepit dua kali.",
  "它守在浪花碎开的地方。浑身湿透又慢吞吞的，都会被夹两下。", "牠守在浪花碎開的地方。渾身溼透又慢吞吞的，都會被夾兩下。", "波の砕ける所で待つ。濡れて鈍いものは二度はさまれる。", "파도가 부서지는 곳에서 기다려요. 젖고 느린 건 두 번 집혀요."],
"It never starts a fight. It just arrives, grinning, for the end of one.": [
  "Elle ne commence jamais un combat. Elle arrive juste, en ricanant, pour la fin.", "Sie fängt nie einen Kampf an. Sie kommt nur grinsend zu seinem Ende.",
  "Nunca empieza una pelea. Solo llega, sonriendo, para el final.", "Non comincia mai una lotta. Arriva solo, ghignando, per la fine.",
  "Nunca começa uma luta. Só chega, sorrindo, para o fim.", "Hindi ito kailanman nagsisimula ng away. Dumarating lang ito, nakangisi, sa dulo nito.",
  "அது ஒருபோதும் சண்டையைத் தொடங்காது. முடிவுக்கு மட்டும் சிரித்தபடி வரும்.", "Ia tak pernah memulai perkelahian. Ia hanya datang, menyeringai, untuk mengakhirinya.",
  "它从不挑起战斗，只会咧着嘴，在战斗收尾时出现。", "牠從不挑起戰鬥，只會咧著嘴，在戰鬥收尾時出現。", "決して戦いを始めない。終わり際に、にやにやしながら現れるだけ。", "싸움을 먼저 걸지 않아요. 끝날 무렵에 히죽거리며 나타날 뿐이에요."],
"Its skin glows where the venom pools. Touch it twice and the glow goes off.": [
  "Sa peau luit là où le venin s’amasse. Touchez-le deux fois et la lueur explose.", "Seine Haut glüht, wo sich das Gift sammelt. Berühr ihn zweimal, und das Glühen geht los.",
  "Su piel brilla donde se acumula el veneno. Tócalo dos veces y el brillo estalla.", "La sua pelle brilla dove si raccoglie il veleno. Toccalo due volte e il bagliore esplode.",
  "A pele brilha onde o veneno se junta. Toque-o duas vezes e o brilho rebenta.", "Kumikinang ang balat nito kung saan naiipon ang lason. Hawakan nang dalawang beses at sasabog ang kinang.",
  "நஞ்சு தேங்கும் இடத்தில் அதன் தோல் ஒளிரும். இருமுறை தொட்டால் அந்த ஒளி வெடிக்கும்.", "Kulitnya berpendar di tempat racun berkumpul. Sentuh dua kali dan pendarnya meledak.",
  "毒液积聚处，它的皮肤会发光。碰它两下，那光就炸开了。", "毒液積聚處，牠的皮膚會發光。碰牠兩下，那光就炸開了。", "毒がたまる所で肌が光る。二度触れれば、その光がはじける。", "독이 고인 곳에서 피부가 빛나요. 두 번 건드리면 그 빛이 터져요."],
"One bite is nothing. The cloud makes sure there is never just one.": [
  "Une piqûre, ce n’est rien. La nuée s’assure qu’il n’y en ait jamais qu’une.", "Ein Stich ist nichts. Die Wolke sorgt dafür, dass es nie bei einem bleibt.",
  "Una picadura no es nada. La nube se asegura de que nunca sea solo una.", "Un morso è niente. La nube fa in modo che non sia mai uno solo.",
  "Uma picada não é nada. A nuvem garante que nunca é só uma.", "Walang anuman ang isang kagat. Tinitiyak ng ulap na hindi lang iisa.",
  "ஒரு கடி ஒன்றுமில்லை. ஒருபோதும் ஒன்றோடு நிற்காது என்பதை மேகம் உறுதி செய்யும்.", "Satu gigitan bukan apa-apa. Awan itu memastikan tak pernah hanya satu.",
  "被叮一下不算什么。蚋群保证绝不会只有一下。", "被叮一下不算什麼。蚋群保證絕不會只有一下。", "一刺しなら何でもない。群れは、決して一刺しで終わらせない。", "한 번 물리는 건 별거 아니에요. 떼는 절대 한 번으로 끝내지 않아요."],
"Its wing dust settles like powdered glass. Whatever it touches starts to ring when struck.": [
  "La poussière de ses ailes retombe comme du verre pilé. Ce qu’elle touche se met à tinter sous les coups.", "Ihr Flügelstaub legt sich wie Glaspulver. Was er berührt, klingt beim Schlag wie Glas.",
  "El polvo de sus alas cae como vidrio molido. Lo que toca empieza a tintinear al ser golpeado.", "La polvere delle sue ali si posa come vetro tritato. Ciò che tocca tintinna quando viene colpito.",
  "O pó das suas asas assenta como vidro moído. O que toca começa a tilintar quando é atingido.", "Bumabagsak ang alikabok ng pakpak nito na parang dinurog na salamin. Ang nadaanan nito ay kumakalansing kapag tinamaan.",
  "அதன் சிறகுத் தூள் பொடித்த கண்ணாடி போல் படியும். அது தொட்டது அடிபடும்போது ஒலிக்கத் தொடங்கும்.", "Debu sayapnya turun seperti kaca halus. Apa pun yang tersentuh mulai berdenting saat dipukul.",
  "它翅上的鳞粉像玻璃碎末一样落下。被沾上的东西，一挨打就叮当作响。", "牠翅上的鱗粉像玻璃碎末一樣落下。被沾上的東西，一挨打就叮噹作響。", "羽の粉はガラスの粉のように降る。触れたものは、打たれると鳴り出す。", "날개 가루가 유리 가루처럼 내려앉아요. 닿은 것은 맞으면 쨍 하고 울려요."],
"One beat for every otter that wades in. The river has never been this loud.": [
  "Un battement pour chaque loutre qui entre dans l’eau. La rivière n’a jamais été aussi bruyante.", "Ein Schlag für jeden Otter, der hineinwatet. Nie war der Fluss so laut.",
  "Un golpe por cada nutria que entra al agua. El río nunca había sonado tan fuerte.", "Un colpo per ogni lontra che entra in acqua. Il fiume non è mai stato così rumoroso.",
  "Uma batida por cada lontra que entra na água. O rio nunca foi tão barulhento.", "Isang palo sa bawat otter na lumulusong. Hindi pa naging ganito kaingay ang ilog.",
  "ஆற்றில் இறங்கும் ஒவ்வொரு நீர்நாய்க்கும் ஒரு அடி. ஆறு இவ்வளவு சத்தமாக இருந்ததில்லை.", "Satu pukulan untuk tiap berang-berang yang mengarung masuk. Sungai tak pernah seberisik ini.",
  "每有一只水獭蹚进来，就敲一下鼓。河从没这么热闹过。", "每有一隻水獺蹚進來，就敲一下鼓。河從沒這麼熱鬧過。", "川に入るカワウソ1匹ごとに一打。川がこんなに騒がしかったことはない。", "물에 들어오는 수달마다 한 번씩 북을 쳐요. 강이 이렇게 시끄러운 적은 없었어요."],
"When it calls, the pack answers, and whatever stands in their way starts bleeding.": [
  "Quand il appelle, la meute répond, et tout ce qui lui barre la route se met à saigner.", "Wenn er ruft, antwortet das Rudel, und was ihm im Weg steht, beginnt zu bluten.",
  "Cuando llama, la manada responde, y lo que se cruce en su camino empieza a sangrar.", "Quando chiama, il branco risponde, e ciò che gli sbarra la strada inizia a sanguinare.",
  "Quando chama, a alcateia responde, e o que estiver no caminho começa a sangrar.", "Kapag tumawag ito, sumasagot ang kawan, at dumudugo ang anumang nakaharang.",
  "அது அழைக்கும்போது கூட்டம் பதிலளிக்கும்; வழியில் நிற்பது எதுவும் இரத்தம் கசியத் தொடங்கும்.", "Saat ia memanggil, kawanan menjawab, dan apa pun yang menghalangi mulai berdarah.",
  "它一嚎，狼群便应和，挡路的东西都开始流血。", "牠一嚎，狼群便應和，擋路的東西都開始流血。", "それが呼べば群れが応え、行く手を阻むものは血を流し始める。", "그것이 부르면 무리가 답하고, 길을 막는 건 무엇이든 피를 흘리기 시작해요."],
"It carries its little shrine on its back and its prayers in its shell.": [
  "Elle porte son petit sanctuaire sur le dos et ses prières dans sa carapace.", "Sie trägt ihren kleinen Schrein auf dem Rücken und ihre Gebete im Panzer.",
  "Lleva su pequeño santuario a la espalda y sus oraciones en el caparazón.", "Porta il suo piccolo santuario sul dorso e le sue preghiere nel guscio.",
  "Leva o seu pequeno santuário às costas e as suas orações na carapaça.", "Dala nito ang maliit na dambana sa likod at ang mga dasal sa bahay nito.",
  "அது தன் சிறிய ஆலயத்தை முதுகிலும், பிரார்த்தனைகளை ஓட்டிலும் சுமக்கும்.", "Ia membawa kuil kecilnya di punggung dan doanya di dalam cangkang.",
  "它背着小小的神龛，把祈祷收在壳里。", "牠背著小小的神龕，把祈禱收在殼裡。", "小さな祠を背に、祈りを甲羅に抱えて歩く。", "작은 사당은 등에, 기도는 등딱지 속에 지고 다녀요."],
"It turns into the storm and the storm, for a while, turns away.": [
  "Il fait face à l’orage, et l’orage, un temps, se détourne.", "Er dreht sich in den Sturm, und der Sturm dreht sich eine Weile ab.",
  "Se vuelve hacia la tormenta y la tormenta, por un rato, se aparta.", "Si volta verso la tempesta e la tempesta, per un po’, si volta altrove.",
  "Vira-se para a tempestade e a tempestade, por um tempo, desvia-se.", "Humaharap ito sa unos, at ang unos, saglit, ay lumilihis.",
  "அது புயலை நோக்கித் திரும்பும்; புயலோ சிறிது நேரம் விலகிச் செல்லும்.", "Ia berbalik menghadap badai, dan badai, untuk sementara, berpaling.",
  "它迎着风暴转身，而风暴，暂时转了开去。", "牠迎著風暴轉身，而風暴，暫時轉了開去。", "嵐へ向き直ると、嵐はしばし向きを変える。", "폭풍을 향해 돌아서면, 폭풍은 잠시 비켜 가요."],
}

def write_pack(path, rows, i, keep_existing=True):
    pack = json.load(open(path, encoding='utf-8')) if os.path.exists(path) else {}
    items = list(pack.items())
    have = set(pack)
    for en, row in rows.items():
        if en in have and keep_existing: continue
        at = next((j for j, (k, _) in enumerate(items) if k.lower() > en.lower()), len(items))
        items.insert(at, (en, row[i]))
    with open(path, 'w', encoding='utf-8') as fh:
        json.dump(dict(items), fh, ensure_ascii=False, indent=1); fh.write('\n')

if __name__ == '__main__':
    # sanity: every key's English core has a row, placeholders kept
    for k, en in KEYS.items():
        c = core(en); assert c in T, (k, c)
        want = sorted(re.findall(r'\{\w+\}', c))
        for code, tr in zip(CODES, T[c]): assert sorted(re.findall(r'\{\w+\}', tr)) == want, (k, code, tr)
    for d in (T, CARD_NAMES, FLAVOR):
        for en, row in d.items(): assert len(row) == 12, en
    # 1. the English, once, in the TX table
    tp = os.path.join(ROOT, 'bramblewood-texts.js'); src = open(tp, encoding='utf-8').read()
    end = '\n}/*TEXT-TABLE-END*/'; assert src.count(end) == 1
    add = [k for k in KEYS if ('"%s":' % k) not in src]
    if add:
        body = ''.join(',\n  %s: %s' % (json.dumps(k), json.dumps(KEYS[k], ensure_ascii=False)) for k in add)
        src = src.replace(end, body + end); open(tp, 'w', encoding='utf-8').write(src)
    # 2-3. the packs
    for i, code in enumerate(CODES):
        write_pack(os.path.join(ROOT, 'lang', code + '.json'), T, i)
        write_pack(os.path.join(ROOT, 'lang', 'cards', code + '.json'), CARD_NAMES, i)
        write_pack(os.path.join(ROOT, 'lang', 'ui', code + '.json'), FLAVOR, i)
    print('TX keys added:', len(add), '| packs:', len(CODES), 'x', len(T), 'texts,', len(CARD_NAMES), 'names,', len(FLAVOR), 'flavour lines')
