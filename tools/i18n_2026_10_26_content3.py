#!/usr/bin/env python3
"""Game texts added on 2026-10-26 by package CONTENT3: Wakeful (G5), Detonate N (E18), Pulverise (OWN-Q5), Socket N and gem fusion (E14),
Equip Time and Tamper-proof (E15), the blinding Sandstorm (C4) in the main packs; the new card names (lang/cards) and their flavour lines
(lang/ui, where card flavours live). Order of each row: fr, de, es, it, pt, tl, ta, id, zh-Hans, zh-Hant, ja, ko.
Tagalog, Tamil, Japanese and Korean deserve a native read.   python3 tools/i18n_2026_10_26_content3.py"""
import json, os, re
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
CODES = ['fr', 'de', 'es', 'it', 'pt', 'tl', 'ta', 'id', 'zh-Hans', 'zh-Hant', 'ja', 'ko']
T = {
 "Its hits make the target's Poison tick {n} times at once, each tick taking a counter off.": [
  "Ses coups font agir le Poison de la cible {n} fois d'un coup, chaque fois en retirant un marqueur.",
  "Seine Treffer lassen das Gift des Ziels {n}-mal auf einmal wirken; jedes Mal fällt ein Marker weg.",
  "Sus golpes hacen que el Veneno del objetivo actúe {n} veces de golpe; cada vez quita un contador.",
  "I suoi colpi fanno agire il Veleno del bersaglio {n} volte in un colpo, togliendo un segnalino ogni volta.",
  "Seus golpes fazem o Veneno do alvo agir {n} vezes de uma vez; cada vez tira um marcador.",
  "Pinapagana ng mga tama nito ang Lason ng target nang {n} beses nang sabay, at bawat isa ay nag-aalis ng isang counter.",
  "இதன் தாக்குதல்கள் இலக்கின் விஷத்தை ஒரேயடியாக {n} முறை செயல்படச் செய்யும்; ஒவ்வொரு முறையும் ஒரு குறி நீங்கும்.",
  "Serangannya membuat Racun target berdetak {n} kali sekaligus, tiap detak mengurangi satu penanda.",
  "它的攻击让目标的中毒一次发作 {n} 次，每次移除一层。",
  "它的攻擊讓目標的中毒一次發作 {n} 次，每次移除一層。",
  "その攻撃で対象の毒が一度に {n} 回発動し、そのたびにカウンターが1つ減る。",
  "공격이 대상의 독을 한 번에 {n}번 발동시키고, 매번 카운터를 하나 없앱니다."],
 "Its shots too. Each tick deals what a round's Poison tick would, one after another, before the hit.": [
  "Ses tirs aussi. Chaque coup de poison inflige ce qu'infligerait celui d'une manche, l'un après l'autre, avant le coup.",
  "Auch seine Schüsse. Jede Giftwirkung richtet so viel an wie die einer Runde, eine nach der anderen, vor dem Treffer.",
  "También sus disparos. Cada efecto hace lo que haría el Veneno de una ronda, uno tras otro, antes del golpe.",
  "Anche i suoi tiri. Ogni effetto fa quanto quello di un turno, uno dopo l'altro, prima del colpo.",
  "Seus tiros também. Cada efeito causa o que o Veneno de uma rodada causaria, um após o outro, antes do golpe.",
  "Pati ang mga tira nito. Bawat pagtama ng lason ay kasinlakas ng sa isang round, sunod-sunod, bago ang tama.",
  "இதன் எய்தல்களும் கூட. ஒவ்வொரு முறையும் ஒரு சுற்றின் விஷம் அளிப்பதையே, ஒன்றன்பின் ஒன்றாக, தாக்குதலுக்கு முன் அளிக்கும்.",
  "Tembakannya juga. Tiap detak memberi kerusakan seperti detak Racun satu ronde, satu per satu, sebelum serangan.",
  "射击也一样。每次发作的伤害与回合中毒相同，依次结算，先于攻击。",
  "射擊也一樣。每次發作的傷害與回合中毒相同，依次結算，先於攻擊。",
  "射撃も同じ。各発動はラウンドの毒と同じダメージを、攻撃の前に1回ずつ与える。",
  "사격도 마찬가지입니다. 각 발동은 라운드의 독과 같은 피해를 공격 전에 하나씩 줍니다."],
 "🎆 {att} detonates the Poison on {name}: {n} damage.": [
  "🎆 {att} fait détoner le Poison de {name} : {n} dégâts.", "🎆 {att} zündet das Gift in {name}: {n} Schaden.", "🎆 {att} detona el Veneno de {name}: {n} de daño.",
  "🎆 {att} fa detonare il Veleno su {name}: {n} danni.", "🎆 {att} detona o Veneno de {name}: {n} de dano.", "🎆 Pinasabog ni {att} ang Lason kay {name}: {n} pinsala.",
  "🎆 {att} {name} மீதுள்ள விஷத்தை வெடிக்கச் செய்கிறது: {n} சேதம்.", "🎆 {att} meledakkan Racun pada {name}: {n} kerusakan.", "🎆 {att} 引爆了 {name} 身上的中毒：{n} 点伤害。",
  "🎆 {att} 引爆了 {name} 身上的中毒：{n} 點傷害。", "🎆 {att}が{name}の毒を起爆：{n}ダメージ。", "🎆 {att}이(가) {name}의 독을 폭발시킵니다: 피해 {n}."],
 "Wakeful": ["Éveillé", "Wachsam", "Insomne", "Insonne", "Desperto", "Gising", "விழிப்புள்ள", "Terjaga", "警醒", "警醒", "不眠", "불면"],
 "It never falls Asleep: no Sleep hit and no Spore Cloud puts it to sleep.": [
  "Il ne s'endort jamais : ni un coup de Sommeil ni un Nuage de spores ne l'endorment.", "Es schläft nie ein: weder ein Schlaf-Treffer noch eine Sporenwolke.",
  "Nunca se duerme: ni un golpe de Sueño ni una Nube de esporas lo duermen.", "Non si addormenta mai: né un colpo di Sonno né una Nube di spore.",
  "Nunca adormece: nem um golpe de Sono nem uma Nuvem de esporos o fazem dormir.", "Hindi ito kailanman nakakatulog: walang tamang Tulog o Ulap ng Spore ang makapagpapatulog dito.",
  "இது ஒருபோதும் உறங்காது: உறக்கத் தாக்குதலும் வித்து மேகமும் இதை உறங்க வைக்காது.", "Ia tak pernah Tertidur: serangan Tidur maupun Awan Spora tak membuatnya tidur.",
  "它从不陷入沉睡：沉睡攻击和孢子云都无法让它入睡。", "它從不陷入沉睡：沉睡攻擊和孢子雲都無法讓它入睡。", "決して眠らない：睡眠の攻撃も胞子の雲も効かない。", "절대 잠들지 않습니다: 수면 공격도 포자 구름도 통하지 않습니다."],
 "👁️ {name} is Wakeful: it stays awake.": [
  "👁️ {name} est Éveillé : il reste éveillé.", "👁️ {name} ist Wachsam: es bleibt wach.", "👁️ {name} es Insomne: sigue despierto.", "👁️ {name} è Insonne: resta sveglio.",
  "👁️ {name} é Desperto: continua acordado.", "👁️ Gising si {name}: nananatili itong gising.", "👁️ {name} விழிப்புள்ளது: அது விழித்தே இருக்கிறது.", "👁️ {name} Terjaga: ia tetap bangun.",
  "👁️ {name} 警醒：保持清醒。", "👁️ {name} 警醒：保持清醒。", "👁️ {name}は不眠：眠らない。", "👁️ {name}은(는) 불면: 깨어 있습니다."],
 "Pulverise": ["Pulvériser", "Zermalmen", "Pulverizar", "Polverizzare", "Pulverizar", "Dumurog", "தூளாக்கு", "Hancurkan", "粉碎", "粉碎", "粉砕", "분쇄"],
 "Ignores Armor, double damage to Structures. A landed swing breaks the target's Armor, Magic Armor and equipment.": [
  "Ses frappes ignorent l'Armure et infligent le double aux Structures. Une frappe qui touche brise l'Armure, l'Armure magique et l'équipement de la cible.",
  "Seine Schläge ignorieren Rüstung und richten an Bauwerken doppelten Schaden an. Ein Treffer zerbricht Rüstung, Magierüstung und Ausrüstung des Ziels.",
  "Sus golpes ignoran la Armadura y hacen el doble a las Estructuras. Un golpe que acierta rompe la Armadura, la Armadura mágica y el equipo del objetivo.",
  "I suoi colpi ignorano l'Armatura e fanno il doppio alle Strutture. Un colpo a segno spezza l'Armatura, l'Armatura magica e l'equipaggiamento del bersaglio.",
  "Seus golpes ignoram a Armadura e causam o dobro às Estruturas. Um golpe que acerta quebra a Armadura, a Armadura mágica e o equipamento do alvo.",
  "Hindi pinapansin ng mga hampas nito ang Armor at doble ang pinsala sa mga Structure. Ang tumamang hampas ay sumisira sa Armor, Magic Armor at kagamitan ng target.",
  "இதன் தாக்குதல்கள் கவசத்தைப் பொருட்படுத்தாது, கட்டமைப்புகளுக்கு இரட்டிப்புச் சேதம். படும் தாக்குதல் இலக்கின் கவசம், மாயக் கவசம், உபகரணத்தை உடைக்கும்.",
  "Pukulannya mengabaikan Zirah dan memberi dua kali kerusakan pada Bangunan. Pukulan yang kena menghancurkan Zirah, Zirah Sihir, dan perlengkapan target.",
  "它的挥击无视护甲，对建筑造成双倍伤害。命中的挥击会击碎目标的护甲、魔法护甲和装备。",
  "它的揮擊無視護甲，對建築造成雙倍傷害。命中的揮擊會擊碎目標的護甲、魔法護甲和裝備。",
  "その攻撃は装甲を無視し、建造物に2倍のダメージ。命中すると対象の装甲・魔法装甲・装備を砕く。",
  "공격이 방어구를 무시하고 구조물에 두 배 피해를 줍니다. 명중하면 대상의 방어구, 마법 방어구, 장비를 부숩니다."],
 "Broken Armor stays broken for the fight. A broken piece of equipment goes to the graveyard.": [
  "L'Armure brisée le reste pour le combat. Un équipement brisé va au cimetière.", "Zerbrochene Rüstung bleibt für den Kampf zerbrochen. Zerbrochene Ausrüstung kommt auf den Friedhof.",
  "La Armadura rota sigue rota durante el combate. El equipo roto va al cementerio.", "L'Armatura spezzata resta tale per lo scontro. L'equipaggiamento spezzato va al cimitero.",
  "A Armadura quebrada fica quebrada pelo combate. O equipamento quebrado vai para o cemitério.", "Nananatiling sira ang sirang Armor sa buong laban. Napupunta sa libingan ang sirang kagamitan.",
  "உடைந்த கவசம் போர் முழுவதும் உடைந்தே இருக்கும். உடைந்த உபகரணம் கல்லறைக்குச் செல்லும்.", "Zirah yang hancur tetap hancur selama pertarungan. Perlengkapan yang hancur masuk kuburan.",
  "被击碎的护甲在本场战斗中不会恢复。被击碎的装备进入墓地。", "被擊碎的護甲在本場戰鬥中不會恢復。被擊碎的裝備進入墓地。", "砕けた装甲はその戦いの間戻らない。砕けた装備は墓地へ行く。", "부서진 방어구는 전투 내내 부서진 채입니다. 부서진 장비는 묘지로 갑니다."],
 "🔨 {att} pulverises {name}.": ["🔨 {att} pulvérise {name}.", "🔨 {att} zermalmt {name}.", "🔨 {att} pulveriza a {name}.", "🔨 {att} polverizza {name}.", "🔨 {att} pulveriza {name}.", "🔨 Dinurog ni {att} si {name}.",
  "🔨 {att} {name}-ஐத் தூளாக்குகிறது.", "🔨 {att} menghancurkan {name}.", "🔨 {att} 粉碎了 {name}。", "🔨 {att} 粉碎了 {name}。", "🔨 {att}が{name}を粉砕。", "🔨 {att}이(가) {name}을(를) 분쇄합니다."],
 "Socket": ["Châsse", "Fassung", "Engaste", "Incastonatura", "Engaste", "Socket", "பதிவிடம்", "Soket", "镶孔", "鑲孔", "ソケット", "소켓"],
 "Each copy has {n} more gem socket(s).": ["Chaque exemplaire a {n} châsse(s) de gemme en plus.", "Jedes Exemplar hat {n} Edelsteinfassung(en) mehr.", "Cada copia tiene {n} engaste(s) de gema más.",
  "Ogni copia ha {n} incastonatura(e) per gemme in più.", "Cada cópia tem mais {n} engaste(s) de gema.", "May {n} dagdag na gem socket ang bawat kopya.", "ஒவ்வொரு நகலுக்கும் {n} கூடுதல் மணிப் பதிவிடம்.",
  "Setiap salinan punya {n} soket permata tambahan.", "每张副本多 {n} 个宝石镶孔。", "每張副本多 {n} 個寶石鑲孔。", "各コピーの宝石ソケットが {n} 個増える。", "각 사본에 보석 소켓이 {n}개 더 있습니다."],
 "{n} of {cap} sockets filled: take the last gem out to change it.": ["{n} châsses sur {cap} remplies : retirez la dernière gemme pour la changer.", "{n} von {cap} Fassungen belegt: nimm den letzten Edelstein heraus, um ihn zu tauschen.",
  "{n} de {cap} engastes llenos: saca la última gema para cambiarla.", "{n} incastonature su {cap} piene: togli l'ultima gemma per cambiarla.", "{n} de {cap} engastes cheios: tire a última gema para trocá-la.",
  "{n} sa {cap} socket ang puno: alisin ang huling gem para palitan ito.", "{cap} பதிவிடங்களில் {n} நிரம்பியுள்ளன: மாற்ற கடைசி மணியை எடுக்கவும்.", "{n} dari {cap} soket terisi: lepas permata terakhir untuk menggantinya.",
  "{cap} 个镶孔已镶 {n} 个：取出最后一颗宝石才能更换。", "{cap} 個鑲孔已鑲 {n} 個：取出最後一顆寶石才能更換。", "{cap} 個中 {n} 個のソケットが埋まっている：最後の宝石を外すと交換できる。", "소켓 {cap}개 중 {n}개 채움: 바꾸려면 마지막 보석을 빼세요."],
 "Gem fusion.": ["Fusion de gemmes.", "Edelsteinfusion.", "Fusión de gemas.", "Fusione di gemme.", "Fusão de gemas.", "Pagsasanib ng gem.", "மணி இணைப்பு.", "Fusi permata.", "宝石融合。", "寶石融合。", "宝石融合。", "보석 융합."],
 "Two gems of one kind fuse into one Greater gem: twice the bonus.": ["Deux gemmes d'un même type fusionnent en une gemme Supérieure : le double du bonus.", "Zwei Edelsteine einer Art verschmelzen zu einem Großen: doppelter Bonus.",
  "Dos gemas del mismo tipo se funden en una Mayor: el doble de bonificación.", "Due gemme dello stesso tipo si fondono in una Superiore: il doppio del bonus.", "Duas gemas do mesmo tipo se fundem numa Maior: o dobro do bônus.",
  "Nagsasanib ang dalawang gem na magkauri para maging isang Greater gem: doble ang bonus.", "ஒரே வகை இரண்டு மணிகள் ஒரு பெரும் மணியாக இணையும்: இருமடங்கு பலன்.", "Dua permata sejenis menyatu menjadi satu permata Agung: bonus dua kali lipat.",
  "两颗同类宝石融合成一颗高级宝石：加成翻倍。", "兩顆同類寶石融合成一顆高級寶石：加成翻倍。", "同じ種類の宝石2つが上位の宝石1つになる：ボーナス2倍。", "같은 종류의 보석 두 개가 상급 보석 하나로 융합됩니다: 보너스 두 배."],
 "Fuse into {gem}": ["Fusionner en {gem}", "Zu {gem} verschmelzen", "Fundir en {gem}", "Fondi in {gem}", "Fundir em {gem}", "Isanib bilang {gem}", "{gem} ஆக இணை", "Satukan jadi {gem}", "融合为{gem}", "融合為{gem}", "{gem}に融合", "{gem}(으)로 융합"],
 "you have {n} · {g} Greater": ["vous en avez {n} · {g} Supérieure(s)", "du hast {n} · {g} große", "tienes {n} · {g} Mayor(es)", "ne hai {n} · {g} Superiore(i)", "você tem {n} · {g} Maior(es)", "mayroon kang {n} · {g} Greater",
  "உங்களிடம் {n} · பெரும் {g}", "kamu punya {n} · {g} Agung", "你有 {n} · 高级 {g}", "你有 {n} · 高級 {g}", "所持 {n} · 上位 {g}", "보유 {n} · 상급 {g}"],
 "Fusing costs": ["La fusion coûte", "Verschmelzen kostet", "Fundir cuesta", "Fondere costa", "Fundir custa", "Halaga ng pagsasanib", "இணைப்புக் கட்டணம்", "Biaya fusi", "融合花费", "融合花費", "融合コスト", "융합 비용"],
 "💎 Two gems fused into {gem}.": ["💎 Deux gemmes fusionnées en {gem}.", "💎 Zwei Edelsteine zu {gem} verschmolzen.", "💎 Dos gemas fundidas en {gem}.", "💎 Due gemme fuse in {gem}.", "💎 Duas gemas fundidas em {gem}.",
  "💎 Nagsanib ang dalawang gem bilang {gem}.", "💎 இரண்டு மணிகள் {gem} ஆக இணைந்தன.", "💎 Dua permata menyatu menjadi {gem}.", "💎 两颗宝石融合成了{gem}。", "💎 兩顆寶石融合成了{gem}。", "💎 宝石2つが{gem}に融合。", "💎 보석 두 개가 {gem}(으)로 융합되었습니다."],
 "Greater Ember": ["Braise supérieure", "Große Glut", "Brasa mayor", "Brace superiore", "Brasa maior", "Greater Ember", "பெரும் தணல்", "Bara Agung", "高级余烬", "高級餘燼", "上位の残り火", "상급 불씨"],
 "Greater Tide": ["Marée supérieure", "Große Flut", "Marea mayor", "Marea superiore", "Maré maior", "Greater Tide", "பெரும் அலை", "Pasang Agung", "高级潮汐", "高級潮汐", "上位の潮", "상급 조수"],
 "Greater Grove": ["Bosquet supérieur", "Großer Hain", "Arboleda mayor", "Boschetto superiore", "Bosque maior", "Greater Grove", "பெரும் தோப்பு", "Rimba Agung", "高级林地", "高級林地", "上位の森", "상급 숲"],
 "Greater Stone": ["Pierre supérieure", "Großer Stein", "Piedra mayor", "Pietra superiore", "Pedra maior", "Greater Stone", "பெரும் கல்", "Batu Agung", "高级岩石", "高級岩石", "上位の石", "상급 돌"],
 "+2 ⚔ · its hits scorch": ["+2 ⚔ · ses coups brûlent", "+2 ⚔ · seine Treffer sengen", "+2 ⚔ · sus golpes queman", "+2 ⚔ · i suoi colpi bruciano", "+2 ⚔ · seus golpes queimam", "+2 ⚔ · napapaso ang mga tama nito",
  "+2 ⚔ · இதன் தாக்குதல்கள் சுடும்", "+2 ⚔ · serangannya membakar", "+2 ⚔ · 攻击会灼烧", "+2 ⚔ · 攻擊會灼燒", "+2 ⚔ · 攻撃が焦がす", "+2 ⚔ · 공격이 그을립니다"],
 "+4 ❤": ["+4 ❤", "+4 ❤", "+4 ❤", "+4 ❤", "+4 ❤", "+4 ❤", "+4 ❤", "+4 ❤", "+4 ❤", "+4 ❤", "+4 ❤", "+4 ❤"],
 "+2 ⚔ +2 ❤": ["+2 ⚔ +2 ❤", "+2 ⚔ +2 ❤", "+2 ⚔ +2 ❤", "+2 ⚔ +2 ❤", "+2 ⚔ +2 ❤", "+2 ⚔ +2 ❤", "+2 ⚔ +2 ❤", "+2 ⚔ +2 ❤", "+2 ⚔ +2 ❤", "+2 ⚔ +2 ❤", "+2 ⚔ +2 ❤", "+2 ⚔ +2 ❤"],
 "+6 ❤": ["+6 ❤", "+6 ❤", "+6 ❤", "+6 ❤", "+6 ❤", "+6 ❤", "+6 ❤", "+6 ❤", "+6 ❤", "+6 ❤", "+6 ❤", "+6 ❤"],
 "Equip Time": ["Temps d'équipement", "Ausrüstzeit", "Tiempo de equipo", "Tempo di equipaggiamento", "Tempo de equipar", "Oras ng Pagsuot", "அணியும் நேரம்", "Waktu Pasang", "装备时间", "裝備時間", "装備時間", "장착 시간"],
 "The rounds a unit takes to equip this piece (default 1). Tamper-proof: it can't be stolen.": [
  "Les manches qu'il faut à une unité pour s'équiper de cette pièce (1 par défaut). Inviolable : on ne peut pas la voler.",
  "Die Runden, die eine Einheit zum Anlegen braucht (Standard 1). Diebstahlsicher: kann nicht gestohlen werden.",
  "Las rondas que tarda una unidad en equiparse esta pieza (1 por defecto). A prueba de robo: no se puede robar.",
  "I turni che servono a un'unità per equipaggiarla (1 di base). Antifurto: non può essere rubata.",
  "As rodadas que uma unidade leva para equipar esta peça (1 por padrão). À prova de roubo: não pode ser roubada.",
  "Ilang round bago maisuot ng isang unit ang piyesang ito (default 1). Tamper-proof: hindi ito mananakaw.",
  "இந்தப் பொருளை ஒரு அலகு அணிய எடுக்கும் சுற்றுகள் (இயல்பு 1). திருட்டுக்காப்பு: இதைத் திருட முடியாது.",
  "Ronde yang dibutuhkan unit untuk memasang benda ini (bawaan 1). Anti-curi: tak bisa dicuri.",
  "单位装备此物所需的回合数（默认 1）。防窃：无法被偷走。", "單位裝備此物所需的回合數（預設 1）。防竊：無法被偷走。", "ユニットがこの装備を身につけるのにかかるラウンド数（既定1）。盗難防止：盗まれない。",
  "유닛이 이 장비를 장착하는 데 걸리는 라운드 수(기본 1). 도난 방지: 훔칠 수 없습니다."],
 "Equip Time {n}: a unit takes {n} round(s) to equip it.": ["Temps d'équipement {n} : une unité met {n} manche(s) à s'en équiper.", "Ausrüstzeit {n}: eine Einheit braucht {n} Runde(n) zum Anlegen.",
  "Tiempo de equipo {n}: una unidad tarda {n} ronda(s) en equiparlo.", "Tempo di equipaggiamento {n}: un'unità impiega {n} turno(i) a equipaggiarlo.", "Tempo de equipar {n}: uma unidade leva {n} rodada(s) para equipá-lo.",
  "Oras ng Pagsuot {n}: {n} round bago ito maisuot ng isang unit.", "அணியும் நேரம் {n}: ஒரு அலகு இதை அணிய {n} சுற்று(கள்) எடுக்கும்.", "Waktu Pasang {n}: unit butuh {n} ronde untuk memasangnya.",
  "装备时间 {n}：单位需要 {n} 回合才能装备它。", "裝備時間 {n}：單位需要 {n} 回合才能裝備它。", "装備時間 {n}：ユニットが身につけるのに {n} ラウンドかかる。", "장착 시간 {n}: 유닛이 장착하는 데 {n}라운드가 걸립니다."],
 "Tamper-proof": ["Inviolable", "Diebstahlsicher", "A prueba de robo", "Antifurto", "À prova de roubo", "Tamper-proof", "திருட்டுக்காப்பு", "Anti-curi", "防窃", "防竊", "盗難防止", "도난 방지"],
 "Tamper-proof: it can't be stolen.": ["Inviolable : on ne peut pas le voler.", "Diebstahlsicher: kann nicht gestohlen werden.", "A prueba de robo: no se puede robar.", "Antifurto: non può essere rubato.", "À prova de roubo: não pode ser roubado.",
  "Tamper-proof: hindi ito mananakaw.", "திருட்டுக்காப்பு: இதைத் திருட முடியாது.", "Anti-curi: tak bisa dicuri.", "防窃：无法被偷走。", "防竊：無法被偷走。", "盗難防止：盗まれない。", "도난 방지: 훔칠 수 없습니다."],
 "Blinding Sandstorm": ["Tempête de sable aveuglante", "Blendender Sandsturm", "Tormenta de arena cegadora", "Tempesta di sabbia accecante", "Tempestade de areia cegante", "Nakabubulag na Bagyo ng Buhangin",
  "கண்மறைக்கும் மணற்புயல்", "Badai Pasir Membutakan", "致盲沙暴", "致盲沙暴", "目くらましの砂嵐", "눈을 멀게 하는 모래폭풍"],
 "Every unit fights Blind (its swings miss 1 in 2), except Dry, Keen Sense and Sonar units. Storm cards are empowered.": [
  "Chaque unité combat Aveuglée (ses frappes ratent 1 fois sur 2), sauf les unités Sèches, à Flair ou à Sonar. Les cartes de Tempête sont renforcées.",
  "Jede Einheit kämpft Geblendet (ihre Schläge gehen 1 von 2 daneben), außer trockenen Einheiten und solchen mit Spürsinn oder Sonar. Sturmkarten werden gestärkt.",
  "Cada unidad lucha Cegada (sus golpes fallan 1 de cada 2), salvo las Secas y las de Olfato agudo o Sonar. Las cartas de Tormenta se potencian.",
  "Ogni unità combatte Accecata (i suoi colpi mancano 1 su 2), tranne le unità Secche, con Fiuto o Sonar. Le carte Tempesta si potenziano.",
  "Cada unidade luta Cega (seus golpes erram 1 em 2), exceto as Secas e as de Faro ou Sonar. As cartas de Tempestade ficam mais fortes.",
  "Bulag na lumalaban ang bawat unit (sumasablay ang 1 sa 2 hampas), maliban sa Dry, Keen Sense at Sonar. Lumalakas ang mga Storm card.",
  "ஒவ்வொரு அலகும் குருடாகப் போரிடும் (2-இல் 1 தாக்குதல் தவறும்), வறண்ட, கூர் உணர்வு, சோனார் அலகுகள் தவிர. புயல் அட்டைகள் வலுப்பெறும்.",
  "Setiap unit bertarung Buta (1 dari 2 pukulannya meleset), kecuali unit Kering, Penciuman Tajam, dan Sonar. Kartu Badai diperkuat.",
  "所有单位都在致盲中作战（挥击每 2 次落空 1 次），干燥、敏锐嗅觉和声呐单位除外。风暴卡得到强化。",
  "所有單位都在致盲中作戰（揮擊每 2 次落空 1 次），乾燥、敏銳嗅覺和聲納單位除外。風暴卡得到強化。",
  "全ユニットが盲目で戦う（攻撃が2回に1回外れる）。乾燥・鋭い嗅覚・ソナーのユニットは除く。嵐のカードは強化される。",
  "모든 유닛이 실명 상태로 싸웁니다(공격이 2번에 1번 빗나감). 건조, 예리한 감각, 음파 유닛은 제외. 폭풍 카드가 강해집니다."],
 "Everyone Blind": ["Tous aveuglés", "Alle geblendet", "Todos cegados", "Tutti accecati", "Todos cegos", "Bulag ang lahat", "அனைவரும் குருடு", "Semua buta", "全员致盲", "全員致盲", "全員盲目", "모두 실명"],
}
NAMES = {
 "Sleepless Shrew": ["Musaraigne insomniaque", "Schlaflose Spitzmaus", "Musaraña insomne", "Toporagno insonne", "Musaranho Insone", "Shrew na Di Natutulog", "உறங்காத மூஞ்சூறு", "Cecurut Tanpa Tidur", "不眠鼩鼱", "不眠鼩鼱", "眠らずのトガリネズミ", "잠 없는 뒤쥐"],
 "Marsh-mallow Hare": ["Lièvre de la guimauve", "Eibischhase", "Liebre del malvavisco", "Lepre dell'altea", "Lebre da Malva", "Liyebre ng Marsh-mallow", "சதுப்பு மல்லோ முயல்", "Kelinci Alteja", "药蜀葵野兔", "藥蜀葵野兔", "ウスベニタチアオイの野ウサギ", "마시멜로 들토끼"],
 "Sphagnum Vole": ["Campagnol des sphaignes", "Torfmoos-Wühlmaus", "Topillo del musgo", "Arvicola dello sfagno", "Rato-do-musgo", "Vole ng Sphagnum", "பாசி வயல்எலி", "Tikus Lumut", "泥炭藓田鼠", "泥炭蘚田鼠", "ミズゴケハタネズミ", "물이끼 들쥐"],
 "Mist-net Otter": ["Loutre au filet japonais", "Japannetz-Otter", "Nutria de la red de niebla", "Lontra della rete", "Lontra da Rede-de-Neblina", "Otter ng Mist-net", "மூடுபனி வலை நீர்நாய்", "Berang-berang Jaring Kabut", "雾网水獭", "霧網水獺", "かすみ網のカワウソ", "안개그물 수달"],
 "Clap-net Trapper": ["Trappeur au filet à rabattre", "Schlagnetzfänger", "Trampero de red de golpe", "Cacciatore con la rete a scatto", "Caçador da Rede-de-Bater", "Bitag-mangangaso ng Clap-net", "அடிவலை வேட்டையன்", "Penjerat Jaring Tepuk", "拍网猎手", "拍網獵手", "張り網の罠師", "덮치기그물 사냥꾼"],
 "Birdlime Dauber": ["Barbouilleur de glu", "Vogelleim-Streicher", "Embadurnador de liga", "Spalmatore di vischio", "Besuntador de Visco", "Tagapahid ng Birdlime", "பறவைப் பசை பூசுபவன்", "Pengoles Getah Burung", "粘鸟胶涂抹者", "黏鳥膠塗抹者", "鳥もち塗り", "끈끈이 바르는 수달"],
 "Gale Swift": ["Martinet des bourrasques", "Sturmsegler", "Vencejo del vendaval", "Rondone della burrasca", "Andorinhão da Ventania", "Swift ng Unos", "சூறைக் காற்று உழவாரன்", "Walet Badai", "疾风雨燕", "疾風雨燕", "疾風のアマツバメ", "돌풍 칼새"],
 "Static Fennec": ["Fennec électrique", "Statik-Fennek", "Fénec estático", "Fennec statico", "Feneco Estático", "Fennec na Static", "நிலைமின் பாலைநரி", "Fenek Statis", "静电耳廓狐", "靜電耳廓狐", "静電のフェネック", "정전기 사막여우"],
 "Muskrat Reedgatherer": ["Rat musqué cueilleur de roseaux", "Bisamratten-Schilfsammler", "Rata almizclera recolectora de juncos", "Topo muschiato raccoglicanne", "Rato-almiscarado Juntador de Juncos", "Muskrat na Tagatipon ng Tambo", "நாணல் சேகரிக்கும் கஸ்தூரி எலி", "Tikus Kesturi Pengumpul Buluh", "采苇麝鼠", "採葦麝鼠", "葦集めのマスクラット", "갈대 모으는 사향쥐"],
 "Peat-cutter Vole": ["Campagnol tourbier", "Torfstecher-Wühlmaus", "Topillo cortaturba", "Arvicola tagliatorba", "Rato Cortador de Turfa", "Vole na Tagaputol ng Peat", "கரிமண் வெட்டும் வயல்எலி", "Tikus Pemotong Gambut", "割泥炭田鼠", "割泥炭田鼠", "泥炭掘りのハタネズミ", "이탄 캐는 들쥐"],
 "Magpie Collector": ["Pie collectionneuse", "Sammelnde Elster", "Urraca coleccionista", "Gazza collezionista", "Pega Colecionadora", "Magpie na Kolektor", "சேகரிக்கும் மாக்பை", "Murai Kolektor", "收藏家喜鹊", "收藏家喜鵲", "収集家のカササギ", "수집가 까치"],
 "Mother Carrier": ["Mère porteuse", "Mutterträger", "Nave nodriza", "Nave madre", "Nave-mãe", "Inang Carrier", "தாய்க் கப்பல்", "Induk Pengangkut", "母舰巢", "母艦巢", "マザーキャリア", "모함"],
 "Laden Hummingbird": ["Colibri chargé", "Beladener Kolibri", "Colibrí cargado", "Colibrì carico", "Beija-flor Carregado", "Kargadong Hummingbird", "சுமை ஏற்றிய ரீங்காரப் பறவை", "Kolibri Bermuatan", "满载蜂鸟", "滿載蜂鳥", "満載のハチドリ", "짐 실은 벌새"],
 "Granite Ox Golem": ["Golem bœuf de granit", "Granit-Ochsengolem", "Gólem buey de granito", "Golem bue di granito", "Golem Boi de Granito", "Golem na Bakang Granito", "கருங்கல் எருது கோலம்", "Golem Lembu Granit", "花岗岩公牛魔像", "花崗岩公牛魔像", "花崗岩の牛ゴーレム", "화강암 황소 골렘"],
 "Phoenix Mushrooms": ["Champignons phénix", "Phönixpilze", "Setas fénix", "Funghi fenice", "Cogumelos Fénix", "Kabuteng Phoenix", "பீனிக்ஸ் காளான்கள்", "Jamur Phoenix", "凤凰菇", "鳳凰菇", "不死鳥キノコ", "불사조 버섯"],
}
FLAVOR = {
 "A shrew that sleeps starves by morning. This one stopped trying years ago, and the spores just make it sneeze.": [
  "Une musaraigne qui dort meurt de faim au matin. Celle-ci a cessé d'essayer il y a des années, et les spores la font juste éternuer.",
  "Eine Spitzmaus, die schläft, ist am Morgen verhungert. Diese hat es vor Jahren aufgegeben, und die Sporen bringen sie nur zum Niesen.",
  "Una musaraña que duerme amanece muerta de hambre. Esta dejó de intentarlo hace años, y las esporas solo la hacen estornudar.",
  "Un toporagno che dorme al mattino è morto di fame. Questo ha smesso di provarci anni fa, e le spore lo fanno solo starnutire.",
  "Um musaranho que dorme morre de fome até de manhã. Este desistiu há anos, e os esporos só o fazem espirrar.",
  "Ang shrew na natutulog ay gutom na pagsapit ng umaga. Matagal nang tumigil sa pagsubok ang isang ito, at pinababahing lang ito ng mga spore.",
  "உறங்கும் மூஞ்சூறு காலைக்குள் பட்டினியால் சாகும். இது பல ஆண்டுகளுக்கு முன்பே முயல்வதை நிறுத்தியது; வித்துகள் இதைத் தும்ம மட்டுமே வைக்கின்றன.",
  "Cecurut yang tidur akan kelaparan sebelum pagi. Yang satu ini berhenti mencoba bertahun-tahun lalu, dan spora hanya membuatnya bersin.",
  "睡觉的鼩鼱到早上就饿死了。这只多年前就不再尝试入睡，孢子只会让它打喷嚏。",
  "睡覺的鼩鼱到早上就餓死了。這隻多年前就不再嘗試入睡，孢子只會讓牠打噴嚏。",
  "眠るトガリネズミは朝までに飢える。こいつは何年も前に眠るのをやめた。胞子はくしゃみを誘うだけだ。",
  "잠드는 뒤쥐는 아침이면 굶어 죽어요. 이 녀석은 몇 년 전에 자는 걸 그만뒀고, 포자는 재채기만 나게 할 뿐이죠."],
 "It chews the pink-flowered mallow at the water's edge, then breathes on whoever looks green.": [
  "Il mâche la guimauve aux fleurs roses au bord de l'eau, puis souffle sur quiconque a le teint vert.", "Er kaut den rosa blühenden Eibisch am Ufer und haucht dann jeden an, der grün aussieht.",
  "Mastica el malvavisco de flores rosas a la orilla y luego sopla sobre quien se vea verde.", "Mastica l'altea dai fiori rosa sulla riva, poi soffia su chiunque abbia l'aria verdognola.",
  "Mastiga a malva de flores rosa à beira d'água e depois sopra em quem parecer verde.", "Ngumunguya ito ng kulay-rosas na mallow sa gilid ng tubig, saka hinihingahan ang sinumang mukhang berde.",
  "நீர்க்கரையில் இளஞ்சிவப்பு மல்லோவை மெல்லும், பிறகு பச்சையாகத் தெரிபவர் மீது மூச்சு விடும்.", "Ia mengunyah alteja berbunga merah muda di tepi air, lalu meniupi siapa pun yang tampak hijau.",
  "它在水边嚼着粉花药蜀葵，然后朝脸色发青的家伙呵气。", "牠在水邊嚼著粉花藥蜀葵，然後朝臉色發青的傢伙呵氣。", "水辺の桃色の花のタチアオイを噛み、顔色の悪い者に息を吹きかける。", "물가의 분홍 꽃 아욱을 씹고는, 안색이 푸르스름한 자에게 숨을 불어 줘요."],
 "It packs bog moss into every bite and scratch. The moss draws the poison out. Mostly.": [
  "Elle tasse de la mousse des tourbières dans chaque morsure et griffure. La mousse aspire le poison. En général.", "Sie stopft Moos in jeden Biss und Kratzer. Das Moos zieht das Gift heraus. Meistens.",
  "Mete musgo del pantano en cada mordisco y arañazo. El musgo saca el veneno. Casi siempre.", "Infila muschio di torbiera in ogni morso e graffio. Il muschio tira fuori il veleno. Quasi sempre.",
  "Enche cada mordida e arranhão com musgo do brejo. O musgo puxa o veneno. Quase sempre.", "Pinapasakan nito ng lumot ng latian ang bawat kagat at kalmot. Hinihigop ng lumot ang lason. Kadalasan.",
  "ஒவ்வொரு கடியிலும் கீறலிலும் சதுப்புப் பாசியை அடைக்கும். பாசி விஷத்தை உறிஞ்சும். பெரும்பாலும்.", "Ia menjejalkan lumut rawa ke setiap gigitan dan cakaran. Lumut itu menyedot racunnya. Biasanya.",
  "它把沼泽苔藓塞进每道咬痕和抓伤。苔藓能把毒吸出来。大多数时候。", "牠把沼澤苔蘚塞進每道咬痕和抓傷。苔蘚能把毒吸出來。大多數時候。", "噛み傷にも引っかき傷にも湿原の苔を詰める。苔が毒を吸い出す。たいていは。", "물린 데마다 긁힌 데마다 늪 이끼를 채워 넣어요. 이끼가 독을 빨아내요. 대개는요."],
 "A net so fine you only see it when it is full. The Legion strings them between the reeds before every Gannet season.": [
  "Un filet si fin qu'on ne le voit que plein. La Légion le tend entre les roseaux avant chaque saison des fous.", "Ein Netz so fein, dass man es erst sieht, wenn es voll ist. Die Legion spannt es vor jeder Tölpelzeit zwischen das Schilf.",
  "Una red tan fina que solo se ve cuando está llena. La Legión la tiende entre los juncos antes de cada temporada de alcatraces.", "Una rete così fine che la vedi solo quando è piena. La Legione la tende fra le canne prima di ogni stagione delle sule.",
  "Uma rede tão fina que só se vê quando está cheia. A Legião a estende entre os juncos antes de cada temporada dos atobás.", "Lambat na napakanipis, makikita mo lang kapag puno na. Isinasabit ito ng Lehiyon sa pagitan ng mga tambo bago ang bawat panahon ng Gannet.",
  "நிரம்பிய பின்னே தெரியும் அளவுக்கு மெல்லிய வலை. ஒவ்வொரு கடற்பறவைப் பருவத்துக்கும் முன் படை அதை நாணல்களிடையே கட்டும்.", "Jaring begitu halus sampai hanya terlihat saat penuh. Legiun membentangkannya di antara buluh sebelum tiap musim Angsa Batu.",
  "网细得只有装满时才看得见。每到鲣鸟季前，军团就把它挂在芦苇之间。", "網細得只有裝滿時才看得見。每到鰹鳥季前，軍團就把它掛在蘆葦之間。", "満ちて初めて見えるほど細い網。軍団はカツオドリの季節の前に葦の間へ張る。", "가득 차야 보일 만큼 가는 그물. 군단은 가넷 철마다 갈대 사이에 그걸 쳐 둬요."],
 "Two poles, one net, one pull on the rope. Every bird on the patch comes down at once, and is very surprised about it.": [
  "Deux perches, un filet, un coup sur la corde. Tous les oiseaux du coin tombent d'un coup, très surpris.", "Zwei Stangen, ein Netz, ein Zug am Seil. Jeder Vogel auf dem Fleck kommt auf einmal herunter und ist sehr überrascht.",
  "Dos palos, una red, un tirón de la cuerda. Todos los pájaros del lugar caen a la vez, muy sorprendidos.", "Due pali, una rete, uno strattone alla corda. Ogni uccello del prato viene giù insieme, molto sorpreso.",
  "Duas varas, uma rede, um puxão na corda. Todo pássaro do lugar cai de uma vez, muito surpreso.", "Dalawang poste, isang lambat, isang hila sa lubid. Sabay-sabay na bumabagsak ang bawat ibon sa lugar, at gulat na gulat.",
  "இரண்டு கம்புகள், ஒரு வலை, கயிற்றில் ஒரு இழுப்பு. அந்த இடத்தின் எல்லாப் பறவைகளும் ஒரேயடியாக விழும், மிகவும் வியப்புடன்.", "Dua tiang, satu jaring, satu tarikan tali. Semua burung di petak itu jatuh sekaligus, dan sangat terkejut.",
  "两根竿，一张网，一拉绳。那片地上的鸟一下子全落下来，惊讶极了。", "兩根竿，一張網，一拉繩。那片地上的鳥一下子全落下來，驚訝極了。", "竿が2本、網が1枚、綱をひと引き。その場の鳥が一斉に落ち、たいそう驚く。", "장대 둘, 그물 하나, 밧줄 한 번 당기기. 그 자리의 새가 한꺼번에 떨어지고, 아주 놀라죠."],
 "It boils holly bark into a glue and paints the branches. Whatever lands there stays.": [
  "Elle fait bouillir l'écorce de houx en glu et en badigeonne les branches. Tout ce qui s'y pose y reste.", "Er kocht Stechpalmenrinde zu Leim und bestreicht die Äste. Was dort landet, bleibt.",
  "Hierve corteza de acebo hasta hacer liga y pinta las ramas. Lo que se posa allí, se queda.", "Fa bollire la corteccia d'agrifoglio in vischio e ne spalma i rami. Ciò che si posa lì, resta.",
  "Ferve casca de azevinho até virar visco e pinta os galhos. O que pousa ali fica.", "Pinapakuluan nito ang balat ng holly para maging pandikit at ipinapahid sa mga sanga. Ang dumapo roon, nananatili.",
  "ஹோலி மரப் பட்டையைக் காய்ச்சிப் பசையாக்கி கிளைகளில் பூசும். அங்கே அமர்வது அங்கேயே தங்கும்.", "Ia merebus kulit holly menjadi getah lalu mengolesi dahan. Apa pun yang hinggap di sana akan tertahan.",
  "它把冬青树皮熬成胶，涂在树枝上。落在那里的都走不了。", "牠把冬青樹皮熬成膠，塗在樹枝上。落在那裡的都走不了。", "ヒイラギの樹皮を煮て鳥もちにし、枝に塗る。そこに止まったものは離れられない。", "호랑가시나무 껍질을 고아 끈끈이를 만들어 가지에 발라요. 거기 앉은 건 그대로 머물죠."],
 "It sleeps on the wing and eats on the wing, and when the storm comes in over the ridge it goes faster.": [
  "Il dort en vol et mange en vol, et quand l'orage passe la crête, il va plus vite.", "Er schläft im Flug und frisst im Flug, und wenn der Sturm über den Grat kommt, wird er schneller.",
  "Duerme volando y come volando, y cuando la tormenta cruza la cresta, va más rápido.", "Dorme in volo e mangia in volo, e quando la tempesta scavalca la cresta va più veloce.",
  "Dorme voando e come voando, e quando a tempestade cruza o cume, fica mais rápido.", "Natutulog ito habang lumilipad at kumakain habang lumilipad, at kapag dumating ang bagyo sa tagaytay, lalo itong bumibilis.",
  "பறந்தபடியே உறங்கும், பறந்தபடியே உண்ணும்; முகடு தாண்டிப் புயல் வரும்போது இன்னும் வேகமாகும்.", "Ia tidur sambil terbang dan makan sambil terbang, dan saat badai datang melewati punggung bukit, ia makin cepat.",
  "它在飞行中睡觉，在飞行中进食；风暴越过山脊时，它飞得更快。", "牠在飛行中睡覺，在飛行中進食；風暴越過山脊時，牠飛得更快。", "飛びながら眠り、飛びながら食べる。嵐が尾根を越えてくると、さらに速くなる。", "날면서 자고 날면서 먹어요. 폭풍이 능선을 넘어오면 더 빨라지죠."],
 "The sand in the wind charges its great ears. In a dust storm it crackles, and everything it touches jumps.": [
  "Le sable dans le vent charge ses grandes oreilles. Dans une tempête de poussière, il crépite, et tout ce qu'il touche sursaute.", "Der Sand im Wind lädt seine großen Ohren auf. Im Staubsturm knistert er, und alles, was er berührt, zuckt.",
  "La arena del viento carga sus grandes orejas. En una tormenta de polvo chisporrotea, y todo lo que toca salta.", "La sabbia nel vento carica le sue grandi orecchie. In una tempesta di polvere crepita, e tutto ciò che tocca sobbalza.",
  "A areia no vento carrega suas grandes orelhas. Numa tempestade de poeira ele estala, e tudo o que toca dá um pulo.", "Kinakargahan ng buhangin sa hangin ang malalaki nitong tainga. Sa bagyo ng alikabok, kumakaluskos ito, at napapalundag ang lahat ng hinahawakan nito.",
  "காற்றின் மணல் அதன் பெரிய காதுகளில் மின்னூட்டம் ஏற்றும். புழுதிப் புயலில் அது சடசடக்கும்; அது தொடுவதெல்லாம் துள்ளும்.", "Pasir dalam angin mengisi telinga besarnya dengan listrik. Di badai debu ia berderak, dan apa pun yang disentuhnya terlonjak.",
  "风中的沙子给它的大耳朵充了电。沙尘暴里它噼啪作响，碰到什么都会一跳。", "風中的沙子給牠的大耳朵充了電。沙塵暴裡牠劈啪作響，碰到什麼都會一跳。", "風の砂が大きな耳を帯電させる。砂嵐の中でパチパチと鳴り、触れたものは皆跳び上がる。", "바람 속 모래가 큰 귀에 전기를 채워요. 먼지 폭풍 속에선 타닥거리고, 닿는 건 모두 펄쩍 뛰죠."],
 "It cuts reeds all night and stacks them into a house nobody asked for. Then it moves out and starts again.": [
  "Il coupe des roseaux toute la nuit et les empile en une maison que personne n'a demandée. Puis il déménage et recommence.", "Sie schneidet die ganze Nacht Schilf und stapelt es zu einem Haus, das niemand wollte. Dann zieht sie aus und fängt neu an.",
  "Corta juncos toda la noche y los apila en una casa que nadie pidió. Luego se muda y empieza otra vez.", "Taglia canne tutta la notte e le impila in una casa che nessuno ha chiesto. Poi trasloca e ricomincia.",
  "Corta juncos a noite toda e os empilha numa casa que ninguém pediu. Depois se muda e começa de novo.", "Pumuputol ito ng tambo buong gabi at isinasalansan sa bahay na walang humiling. Saka ito lilipat at magsisimula ulit.",
  "இரவு முழுவதும் நாணல் வெட்டி, யாரும் கேட்காத வீடாக அடுக்கும். பிறகு வெளியேறி மீண்டும் தொடங்கும்.", "Ia memotong buluh semalaman dan menumpuknya jadi rumah yang tak diminta siapa pun. Lalu ia pindah dan mulai lagi.",
  "它整夜割芦苇，堆成一座没人要的房子。然后搬出去，从头再来。", "牠整夜割蘆葦，堆成一座沒人要的房子。然後搬出去，從頭再來。", "夜通し葦を刈り、誰も頼んでいない家を積み上げる。そして引っ越して、また始める。", "밤새 갈대를 베어 아무도 원하지 않은 집을 쌓아요. 그러고는 이사해서 다시 시작하죠."],
 "Black peat, cut in neat bricks and dried on the hummocks. It burns slow, and the vole sells it dear.": [
  "De la tourbe noire, taillée en briques nettes et séchée sur les buttes. Elle brûle lentement, et le campagnol la vend cher.", "Schwarzer Torf, in saubere Ziegel gestochen und auf den Bulten getrocknet. Er brennt langsam, und die Wühlmaus verkauft ihn teuer.",
  "Turba negra, cortada en ladrillos limpios y secada en los montículos. Arde despacio, y el topillo la vende cara.", "Torba nera, tagliata in mattoni ordinati e seccata sui cumuli. Brucia lenta, e l'arvicola la vende cara.",
  "Turfa negra, cortada em tijolos certinhos e seca nos montículos. Queima devagar, e o rato a vende caro.", "Itim na peat, pinutol na maayos na ladrilyo at pinatuyo sa mga bunton. Mabagal itong masunog, at mahal itong ibenta ng vole.",
  "கறுப்புக் கரிமண், நேர்த்தியான கட்டிகளாக வெட்டி மேடுகளில் உலர்த்தப்பட்டது. மெதுவாக எரியும்; வயல்எலி அதை விலைக்கு விற்கும்.", "Gambut hitam, dipotong jadi bata rapi dan dikeringkan di gundukan. Terbakar pelan, dan si tikus menjualnya mahal.",
  "黑色的泥炭，切成整齐的砖块，在草丘上晾干。烧得慢，田鼠卖得贵。", "黑色的泥炭，切成整齊的磚塊，在草丘上晾乾。燒得慢，田鼠賣得貴。", "黒い泥炭をきれいなレンガに切り、谷地坊主の上で乾かす。ゆっくり燃え、ハタネズミは高く売る。", "검은 이탄을 반듯한 벽돌로 잘라 둔덕에서 말려요. 천천히 타고, 들쥐는 비싸게 팔죠."],
 "Its nest in the hedge is full of buttons, rings and keys. When it falls, somebody finds the nest.": [
  "Son nid dans la haie est plein de boutons, de bagues et de clés. Quand elle tombe, quelqu'un trouve le nid.", "Ihr Nest in der Hecke ist voller Knöpfe, Ringe und Schlüssel. Wenn sie fällt, findet jemand das Nest.",
  "Su nido en el seto está lleno de botones, anillos y llaves. Cuando cae, alguien encuentra el nido.", "Il suo nido nella siepe è pieno di bottoni, anelli e chiavi. Quando cade, qualcuno trova il nido.",
  "Seu ninho na sebe está cheio de botões, anéis e chaves. Quando ela cai, alguém encontra o ninho.", "Puno ng butones, singsing at susi ang pugad nito sa bakod-halaman. Kapag bumagsak ito, may makakahanap ng pugad.",
  "வேலியில் உள்ள அதன் கூடு பொத்தான்கள், மோதிரங்கள், சாவிகளால் நிறைந்தது. அது விழும்போது யாரோ கூட்டைக் கண்டெடுப்பார்.", "Sarangnya di pagar tanaman penuh kancing, cincin, dan kunci. Saat ia jatuh, seseorang menemukan sarangnya.",
  "它在树篱里的巢装满了纽扣、戒指和钥匙。它倒下时，总有人找到那个巢。", "牠在樹籬裡的巢裝滿了鈕扣、戒指和鑰匙。牠倒下時，總有人找到那個巢。", "生け垣の巣はボタンや指輪や鍵でいっぱい。倒れたとき、誰かがその巣を見つける。", "생울타리 속 둥지는 단추와 반지와 열쇠로 가득해요. 쓰러지면 누군가 그 둥지를 찾아내죠."],
 "A floating hive of woven reed and sunfeather. Every morning its hatches open and the sky fills with little archers, quivers full.": [
  "Une ruche flottante de roseau tressé et de plume de soleil. Chaque matin, ses trappes s'ouvrent et le ciel se remplit de petits archers aux carquois pleins.",
  "Ein schwebender Stock aus geflochtenem Schilf und Sonnenfedern. Jeden Morgen öffnen sich seine Luken, und der Himmel füllt sich mit kleinen Schützen, die Köcher voll.",
  "Una colmena flotante de junco trenzado y pluma de sol. Cada mañana se abren sus escotillas y el cielo se llena de pequeños arqueros con las aljabas llenas.",
  "Un alveare galleggiante di canna intrecciata e piuma solare. Ogni mattina i portelli si aprono e il cielo si riempie di piccoli arcieri, faretre piene.",
  "Uma colmeia flutuante de junco trançado e pena-de-sol. Toda manhã suas escotilhas se abrem e o céu se enche de pequenos arqueiros, aljavas cheias.",
  "Lumulutang na pugad ng hinabing tambo at balahibong-araw. Tuwing umaga bumubukas ang mga pinto nito at napupuno ang langit ng maliliit na mamamana, puno ang mga sisidlan.",
  "பின்னிய நாணலும் சூரிய இறகும் கொண்ட மிதக்கும் கூடு. ஒவ்வொரு காலையும் அதன் கதவுகள் திறக்க, வானம் நிறைந்த அம்புக்கூடுகளுடன் சிறு வில்லாளர்களால் நிறையும்.",
  "Sarang terapung dari buluh anyaman dan bulu mentari. Tiap pagi palkanya terbuka dan langit dipenuhi pemanah kecil, tabung panah penuh.",
  "由编织芦苇和太阳羽毛做成的浮空巢。每天清晨舱门打开，天空便满是箭袋装满的小弓手。",
  "由編織蘆葦和太陽羽毛做成的浮空巢。每天清晨艙門打開，天空便滿是箭袋裝滿的小弓手。",
  "編んだ葦と陽の羽でできた浮かぶ巣。毎朝ハッチが開き、矢筒を満たした小さな射手が空を埋める。",
  "엮은 갈대와 햇살 깃털로 만든 떠다니는 둥지. 아침마다 해치가 열리면, 화살통을 가득 채운 작은 궁수들이 하늘을 메워요."],
 "Two darts on its back, fresh off the carrier.": ["Deux fléchettes sur le dos, tout juste sorti du porteur.", "Zwei Pfeile auf dem Rücken, frisch vom Träger.", "Dos dardos a la espalda, recién salido de la nodriza.", "Due dardi sulla schiena, appena uscito dalla nave madre.",
  "Dois dardos nas costas, recém-saído da nave-mãe.", "Dalawang palaso sa likod, kalalabas lang sa carrier.", "முதுகில் இரண்டு அம்புகள், கப்பலிலிருந்து இப்போதுதான் வந்தது.", "Dua anak panah di punggung, baru keluar dari induknya.",
  "背着两支飞镖，刚从母舰巢里飞出。", "背著兩支飛鏢，剛從母艦巢裡飛出。", "背に2本の矢、キャリアから飛び立ったばかり。", "등에 화살 두 개, 모함에서 막 나왔어요."],
 "Four legs of cooled lava and a yoke nobody can lift. When it sets its hooves down, the whole field forgets what it was doing.": [
  "Quatre pattes de lave refroidie et un joug que personne ne peut soulever. Quand il pose ses sabots, tout le champ oublie ce qu'il faisait.",
  "Vier Beine aus erkalteter Lava und ein Joch, das niemand heben kann. Wenn er die Hufe aufsetzt, vergisst das ganze Feld, was es gerade tat.",
  "Cuatro patas de lava enfriada y un yugo que nadie puede levantar. Cuando apoya las pezuñas, todo el campo olvida lo que hacía.",
  "Quattro zampe di lava raffreddata e un giogo che nessuno può sollevare. Quando posa gli zoccoli, tutto il campo dimentica cosa stava facendo.",
  "Quatro patas de lava resfriada e um jugo que ninguém consegue erguer. Quando assenta os cascos, o campo inteiro esquece o que fazia.",
  "Apat na paang gawa sa lumamig na lava at pamatok na walang makabuhat. Kapag itinapak nito ang mga kuko, nakakalimutan ng buong larangan ang ginagawa nito.",
  "குளிர்ந்த எரிமலைக் குழம்பாலான நான்கு கால்கள், யாரும் தூக்க முடியாத நுகம். அது குளம்புகளை ஊன்றும்போது களம் முழுவதும் செய்ததை மறக்கும்.",
  "Empat kaki dari lava yang membeku dan kuk yang tak bisa diangkat siapa pun. Saat kukunya menapak, seluruh medan lupa apa yang sedang dikerjakannya.",
  "四条冷却熔岩的腿，一副无人能抬起的轭。它蹄子一落地，整个战场都忘了自己在做什么。",
  "四條冷卻熔岩的腿，一副無人能抬起的軛。牠蹄子一落地，整個戰場都忘了自己在做什麼。",
  "冷えた溶岩の四本脚と、誰にも持ち上げられないくびき。蹄を下ろすと、戦場の皆が何をしていたか忘れる。",
  "식은 용암으로 된 네 다리와 아무도 못 드는 멍에. 발굽을 내려놓으면, 전장 전체가 하던 일을 잊어요."],
}
assert all(len(v) == len(CODES) for t in (T, NAMES, FLAVOR) for v in t.values()), [k for t in (T, NAMES, FLAVOR) for k, v in t.items() if len(v) != len(CODES)]
ph = lambda s: sorted(set(re.findall(r'\{\w+\}', s)))
def dump(path, d):
    with open(path, 'w', encoding='utf-8') as fh:
        json.dump(d, fh, ensure_ascii=False, indent=1); fh.write('\n')
src = open(os.path.join(ROOT, 'bramblewood-texts.js'), encoding='utf-8').read()
for en in T: assert json.dumps(en, ensure_ascii=False) in src, en
cards = json.load(open(os.path.join(ROOT, 'canonical', 'cards.json'), encoding='utf-8')); names = {c['name'] for c in cards if c}; flav = {c.get('flavor') for c in cards if c}
for en in NAMES: assert en in names, en
for en in FLAVOR: assert en in flav, en
for i, code in enumerate(CODES):
    path = os.path.join(ROOT, 'lang', code + '.json'); ui = os.path.join(ROOT, 'lang', 'ui', code + '.json'); cpath = os.path.join(ROOT, 'lang', 'cards', code + '.json')
    pack = json.load(open(path, encoding='utf-8')); uipack = json.load(open(ui, encoding='utf-8')); cpack = json.load(open(cpath, encoding='utf-8'))
    ui_sorted, c_sorted = list(uipack) == sorted(uipack), list(cpack) == sorted(cpack)
    for en, row in T.items():
        assert ph(en) == ph(row[i]), (code, en)
        if en not in pack: pack[en] = row[i]
        m = re.match(r'^(\S+) (.*)$', en)  # a log line that opens with an emoji is also looked up without it
        if m and not re.search(r'\w', m.group(1)):
            t = row[i]; t2 = t[len(m.group(1)) + 1:] if t.startswith(m.group(1) + ' ') else t
            if m.group(2) not in pack: pack[m.group(2)] = t2
    for en, row in NAMES.items(): pack.pop(en, None); cpack[en] = row[i]
    for en, row in FLAVOR.items(): pack.pop(en, None); uipack[en] = row[i]
    dump(path, pack); dump(ui, dict(sorted(uipack.items())) if ui_sorted else uipack); dump(cpath, dict(sorted(cpack.items())) if c_sorted else cpack)
print('wrote', len(CODES), 'packs:', len(T), 'texts,', len(NAMES), 'names,', len(FLAVOR), 'flavour lines')
