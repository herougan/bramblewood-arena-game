#!/usr/bin/env python3
"""Package EQ texts (2026-10-19, owner 21:36: equipment on the slots, Weapon Master, Pry, slot hazards, the new cards).

    python3 tools/i18n_2026_10_19_eq.py

1. Puts the English of every new TX key (KEYS) into bramblewood-texts.js, just before the table's end marker (once), and rewrites the
   English of the keys in CHANGED (their old English rows leave the 12 packs).
2. Writes the 12 language packs (lang/<code>.json, keyed by that English; a leading emoji is not part of the key). A row a pack already
   has keeps the pack's own translation.
3. The new cards' names (lang/cards/<code>.json) and flavour lines (lang/ui/<code>.json).
Every {placeholder} is kept. Same layout as i18n_2026_10_19_gi.py.
"""
import json, os, re
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
CODES = ['fr', 'de', 'es', 'it', 'pt', 'tl', 'ta', 'id', 'zh-Hans', 'zh-Hant', 'ja', 'ko']
LEAD = re.compile(r'^[\s\U0001F000-\U0001FFFF☀-➿️‍]+')
def core(s): return LEAD.sub('', s.strip()).strip()

KEYS = {
 "ui.skn-weapon-master": "Weapon Master",
 "ui.sk-weapon-master": "Your side's arrows deal {n} more; your equipped units get +1/+1.",
 "ui.sk-weapon-master-codex": "While it is on the field, every arrow of your side (Arrow, Fire Arrow, Ice Arrow, Twin Shot, Volley) deals {n} more, and each of your units that carries equipment gets +1/+1 once it has finished equipping.",
 "ui.skn-pry": "Pry",
 "ui.sk-pry": "Its hits strip {n} Armor for good.",
 "ui.trg-enter-slot": "On Enter Slot",
 "ui.trg-enter-slot-desc": "the moment this unit comes into a slot: played, spawned or moved in (open boards)",
 "ui.eq-equipping": "⚒️ Equipping {name}: ready next round",
 "ui.eq-equipped": "⚒️ Equipped: {name} (+{a}/+{h}{grant})",
 "ui.eq-lone-tip": "{name} lies here: the next unit in this slot picks it up. It blocks nothing.",
 "ui.eq-kind-ice": "Ice Floor",
 "ui.eq-kind-lava": "Lava Floor",
 "ui.eq-kind-poison": "Poison Floor",
 "ui.eq-kind-gas": "Toxic Gas",
 "ui.eq-kind-rubble": "Rubble",
 "ui.eq-floor-ice": "Ice Floor, {r} rounds left: a unit that comes in slides one slot on",
 "ui.eq-floor-lava": "Lava Floor, {r} rounds left: {n} fire a round to the unit here (not flyers)",
 "ui.eq-floor-poison": "Poison Floor, {r} rounds left: Poison {n} on coming in and every round (not flyers)",
 "ui.eq-floor-gas": "Toxic Gas, {r} rounds left: Poison {n} every round, flyers too",
 "ui.eq-floor-rubble": "Rubble, {r} rounds left: this row's side can't play a card here",
 "ui.eq-hz-ice": "Ice Floor on one slot for {r} rounds: a unit that comes in slides one slot on.",
 "ui.eq-hz-lava": "Lava Floor on one slot for {r} rounds: {n} fire a round to the unit there (not flyers).",
 "ui.eq-hz-poison": "Poison Floor on one slot for {r} rounds: Poison {n} on coming in and every round (not flyers).",
 "ui.eq-hz-gas": "Toxic Gas on one slot for {r} rounds: Poison {n} every round, flyers too.",
 "ui.eq-hz-rubble": "Rubble on an empty enemy slot for {r} rounds: they can't play a card there.",
 "ui.eq-hz-how": "Drop it on a slot, yours or the enemy's. It uses your play.",
 "toast.eq-hz-no": "That hazard can't go there.",
 "ui.eq-log-equip-pending": "⚒️ {unit} takes up {item}: ready next round.",
 "ui.eq-log-equip-ready": "⚒️ {unit} is equipped with {item}: +{a}/+{h}.",
 "ui.eq-log-laid": "⚒️ {side} lays {item} in an empty slot.",
 "ui.eq-log-drop": "⚒️ {item} stays where {unit} fell.",
 "ui.eq-log-floor-set": "{icon} {side}: {kind} on a slot for {r} rounds.",
 "ui.eq-log-tick-dmg": "{icon} {unit} takes {n} from the {kind}.",
 "ui.eq-log-tick-poison": "{icon} {unit} takes Poison {n} from the {kind}.",
 "ui.eq-log-slide": "⛸️ {unit} slips on the ice and slides a slot.",
 "ui.eq-log-end": "{icon} The {kind} wears off.",
}
# keys whose English changes (package EQ: the piece stays in the slot; it no longer falls with its unit)
CHANGED = {"ui.de-equip-note": ("It never takes a place on the field or blocks, and it falls with its unit.",
                                "The unit takes a round to equip. Alone in a slot it does nothing and blocks nothing; when its unit dies it stays for the next one.")}

T = {
"Weapon Master": ["Maître d'armes", "Waffenmeister", "Maestro de armas", "Maestro d'armi", "Mestre de armas", "Dalubhasa sa Sandata", "ஆயுத வல்லுநர்", "Ahli Senjata", "武器大师", "武器大師", "武器の達人", "무기의 달인"],
"Your side's arrows deal {n} more; your equipped units get +1/+1.": [
  "Les flèches de votre camp infligent {n} de plus ; vos unités équipées gagnent +1/+1.",
  "Die Pfeile deiner Seite verursachen {n} mehr; deine ausgerüsteten Einheiten erhalten +1/+1.",
  "Las flechas de tu bando infligen {n} más; tus unidades equipadas obtienen +1/+1.",
  "Le frecce della tua parte infliggono {n} in più; le tue unità equipaggiate ottengono +1/+1.",
  "As flechas do seu lado causam {n} a mais; suas unidades equipadas ganham +1/+1.",
  "Ang mga palaso ng panig mo ay {n} na mas malakas; ang mga yunit mong may kagamitan ay +1/+1.",
  "உங்கள் பக்கத்தின் அம்புகள் {n} கூடுதல் சேதம் செய்யும்; உபகரணம் அணிந்த உங்கள் அலகுகள் +1/+1 பெறும்.",
  "Panah pihakmu memberi {n} lebih; unitmu yang berperlengkapan mendapat +1/+1.",
  "你方的箭多造成 {n} 点伤害；你方装备中的单位 +1/+1。",
  "你方的箭多造成 {n} 點傷害；你方裝備中的單位 +1/+1。",
  "味方の矢のダメージ +{n}。装備した味方ユニットは +1/+1。",
  "아군의 화살이 {n} 더 피해를 줍니다. 장비한 아군 유닛은 +1/+1."],
"While it is on the field, every arrow of your side (Arrow, Fire Arrow, Ice Arrow, Twin Shot, Volley) deals {n} more, and each of your units that carries equipment gets +1/+1 once it has finished equipping.": [
  "Tant qu'il est sur le terrain, chaque flèche de votre camp (Flèche, Flèche de feu, Flèche de glace, Tir double, Salve) inflige {n} de plus, et chacune de vos unités qui porte un équipement gagne +1/+1 une fois équipée.",
  "Solange es auf dem Feld ist, verursacht jeder Pfeil deiner Seite (Pfeil, Feuerpfeil, Eispfeil, Doppelschuss, Salve) {n} mehr, und jede deiner Einheiten mit Ausrüstung erhält +1/+1, sobald sie fertig ausgerüstet ist.",
  "Mientras está en el campo, cada flecha de tu bando (Flecha, Flecha de fuego, Flecha de hielo, Disparo doble, Andanada) inflige {n} más, y cada unidad tuya que lleva equipo obtiene +1/+1 cuando termina de equiparse.",
  "Finché è in campo, ogni freccia della tua parte (Freccia, Freccia di fuoco, Freccia di ghiaccio, Tiro doppio, Raffica) infligge {n} in più, e ogni tua unità che porta un equipaggiamento ottiene +1/+1 una volta equipata.",
  "Enquanto estiver em campo, cada flecha do seu lado (Flecha, Flecha de fogo, Flecha de gelo, Tiro duplo, Saraivada) causa {n} a mais, e cada unidade sua que carrega equipamento ganha +1/+1 assim que termina de equipar.",
  "Habang nasa larangan ito, bawat palaso ng panig mo (Palaso, Palasong Apoy, Palasong Yelo, Dobleng Tira, Ulan ng Palaso) ay {n} na mas malakas, at bawat yunit mong may kagamitan ay +1/+1 kapag tapos na itong magsuot.",
  "இது களத்தில் இருக்கும் வரை, உங்கள் பக்கத்தின் ஒவ்வொரு அம்பும் (அம்பு, தீ அம்பு, பனி அம்பு, இரட்டை எய்தல், அம்பு மழை) {n} கூடுதல் சேதம் செய்யும்; உபகரணம் அணிந்து முடித்த உங்கள் ஒவ்வொரு அலகும் +1/+1 பெறும்.",
  "Selama ada di medan, setiap panah pihakmu (Panah, Panah Api, Panah Es, Tembakan Ganda, Hujan Panah) memberi {n} lebih, dan setiap unitmu yang membawa perlengkapan mendapat +1/+1 setelah selesai memakainya.",
  "在场时，你方的每支箭（箭矢、火焰箭、寒冰箭、双发、箭雨）多造成 {n} 点伤害；你方每个带着装备的单位装备完成后 +1/+1。",
  "在場時，你方的每支箭（箭矢、火焰箭、寒冰箭、雙發、箭雨）多造成 {n} 點傷害；你方每個帶著裝備的單位裝備完成後 +1/+1。",
  "場にいる間、味方の矢（アロー、ファイアアロー、アイスアロー、ツインショット、一斉射撃）のダメージ +{n}。装備を身につけ終えた味方ユニットはそれぞれ +1/+1。",
  "필드에 있는 동안 아군의 모든 화살(화살, 화염 화살, 얼음 화살, 이중 사격, 일제 사격)이 {n} 더 피해를 주고, 장비를 다 갖춘 아군 유닛은 각각 +1/+1을 얻습니다."],
"Pry": ["Levier", "Hebeln", "Palanca", "Leva", "Alavanca", "Sungkit", "நெம்பு", "Congkel", "撬开", "撬開", "こじ開け", "지렛대"],
"Its hits strip {n} Armor for good.": [
  "Ses coups retirent {n} d'Armure pour de bon.", "Seine Treffer entfernen dauerhaft {n} Rüstung.", "Sus golpes quitan {n} de Armadura para siempre.",
  "I suoi colpi tolgono {n} di Armatura per sempre.", "Seus golpes removem {n} de Armadura para sempre.", "Ang mga tama nito ay nag-aalis ng {n} Baluti nang tuluyan.",
  "அதன் தாக்குதல்கள் {n} கவசத்தை நிரந்தரமாக நீக்கும்.", "Serangannya mencopot {n} Zirah untuk selamanya.", "其命中永久移除 {n} 点护甲。", "其命中永久移除 {n} 點護甲。",
  "攻撃が当たるたび、アーマーを {n} 永久に剥がす。", "적중할 때마다 방어구를 {n} 영구히 벗겨냅니다."],
"On Enter Slot": ["En entrant dans un emplacement", "Beim Betreten eines Platzes", "Al entrar en una casilla", "All'ingresso in uno spazio", "Ao entrar num espaço", "Sa Pagpasok sa Puwesto", "இடத்தில் நுழையும்போது", "Saat Masuk Petak", "进入格位时", "進入格位時", "マスに入った時", "칸에 들어갈 때"],
"the moment this unit comes into a slot: played, spawned or moved in (open boards)": [
  "au moment où cette unité arrive dans un emplacement : jouée, invoquée ou déplacée (plateaux ouverts)",
  "sobald diese Einheit einen Platz betritt: gespielt, erschaffen oder hineinbewegt (offene Felder)",
  "en cuanto esta unidad llega a una casilla: jugada, generada o movida (tableros abiertos)",
  "nel momento in cui questa unità entra in uno spazio: giocata, generata o spostata (campi aperti)",
  "no momento em que esta unidade entra num espaço: jogada, gerada ou movida (tabuleiros abertos)",
  "sa sandaling pumasok ang yunit na ito sa isang puwesto: nilaro, lumitaw o inilipat (bukas na larangan)",
  "இந்த அலகு ஒரு இடத்திற்குள் வரும் தருணம்: விளையாடப்பட்டது, தோன்றியது அல்லது நகர்த்தப்பட்டது (திறந்த களங்கள்)",
  "saat unit ini masuk ke sebuah petak: dimainkan, muncul, atau dipindahkan (papan terbuka)",
  "该单位进入格位的那一刻：打出、生成或移入（开放战场）", "該單位進入格位的那一刻：打出、生成或移入（開放戰場）",
  "このユニットがマスに入った瞬間：プレイ、出現、移動のいずれでも（オープン盤面）", "이 유닛이 칸에 들어오는 순간: 낼 때, 생성될 때, 이동해 올 때 (열린 보드)"],
"Equipping {name}: ready next round": [
  "Équipement de {name} : prêt au prochain round", "Rüstet {name} aus: bereit in der nächsten Runde", "Equipando {name}: listo la próxima ronda", "Si equipaggia con {name}: pronto il prossimo round",
  "Equipando {name}: pronto na próxima rodada", "Nagsusuot ng {name}: handa sa susunod na round", "{name} அணிகிறது: அடுத்த சுற்றில் தயார்", "Memakai {name}: siap ronde berikutnya",
  "正在装备 {name}：下一回合生效", "正在裝備 {name}：下一回合生效", "{name}を装備中：次のラウンドに完了", "{name} 장착 중: 다음 라운드에 준비"],
"Equipped: {name} (+{a}/+{h}{grant})": [
  "Équipé : {name} (+{a}/+{h}{grant})", "Ausgerüstet: {name} (+{a}/+{h}{grant})", "Equipado: {name} (+{a}/+{h}{grant})", "Equipaggiato: {name} (+{a}/+{h}{grant})",
  "Equipado: {name} (+{a}/+{h}{grant})", "Suot: {name} (+{a}/+{h}{grant})", "அணிந்துள்ளது: {name} (+{a}/+{h}{grant})", "Dipakai: {name} (+{a}/+{h}{grant})",
  "已装备：{name}（+{a}/+{h}{grant}）", "已裝備：{name}（+{a}/+{h}{grant}）", "装備中：{name}（+{a}/+{h}{grant}）", "장착: {name} (+{a}/+{h}{grant})"],
"{name} lies here: the next unit in this slot picks it up. It blocks nothing.": [
  "{name} est posé ici : la prochaine unité dans cet emplacement le ramasse. Il ne bloque rien.",
  "{name} liegt hier: Die nächste Einheit auf diesem Platz hebt es auf. Es blockt nichts.",
  "{name} está aquí: la próxima unidad en esta casilla lo recoge. No bloquea nada.",
  "{name} giace qui: la prossima unità in questo spazio lo raccoglie. Non blocca nulla.",
  "{name} está aqui: a próxima unidade neste espaço o pega. Não bloqueia nada.",
  "Narito ang {name}: kukunin ito ng susunod na yunit sa puwestong ito. Wala itong hinaharangan.",
  "{name} இங்கே கிடக்கிறது: இந்த இடத்திற்கு வரும் அடுத்த அலகு அதை எடுக்கும். அது எதையும் தடுக்காது.",
  "{name} tergeletak di sini: unit berikutnya di petak ini mengambilnya. Ia tidak menghalangi apa pun.",
  "{name} 放在这里：下一个进入此格的单位会拿起它。它不阻挡任何攻击。", "{name} 放在這裡：下一個進入此格的單位會拿起它。它不阻擋任何攻擊。",
  "{name}がここに置かれている：次にこのマスに入ったユニットが拾う。何も防がない。", "{name}이(가) 여기 놓여 있습니다: 이 칸에 오는 다음 유닛이 집어 듭니다. 아무것도 막지 않습니다."],
"Ice Floor": ["Sol gelé", "Eisboden", "Suelo helado", "Pavimento ghiacciato", "Chão congelado", "Sahig na Yelo", "பனித் தரை", "Lantai Es", "冰面", "冰面", "氷の床", "얼음 바닥"],
"Lava Floor": ["Sol de lave", "Lavaboden", "Suelo de lava", "Pavimento di lava", "Chão de lava", "Sahig na Lava", "எரிமலைக் குழம்புத் தரை", "Lantai Lava", "熔岩地面", "熔岩地面", "溶岩の床", "용암 바닥"],
"Poison Floor": ["Sol empoisonné", "Giftboden", "Suelo venenoso", "Pavimento velenoso", "Chão venenoso", "Sahig na Lason", "நச்சுத் தரை", "Lantai Racun", "毒地", "毒地", "毒の床", "독 바닥"],
"Toxic Gas": ["Gaz toxique", "Giftgas", "Gas tóxico", "Gas tossico", "Gás tóxico", "Nakalalasong Gas", "நச்சு வாயு", "Gas Beracun", "毒气", "毒氣", "毒ガス", "독가스"],
"Rubble": ["Éboulis", "Geröll", "Escombros", "Macerie", "Entulho", "Guho", "இடிபாடுகள்", "Reruntuhan", "碎石", "碎石", "瓦礫", "잔해"],
"Ice Floor, {r} rounds left: a unit that comes in slides one slot on": [
  "Sol gelé, encore {r} rounds : une unité qui arrive glisse d'un emplacement", "Eisboden, noch {r} Runden: Eine Einheit, die hereinkommt, rutscht einen Platz weiter",
  "Suelo helado, quedan {r} rondas: una unidad que entra se desliza una casilla más", "Pavimento ghiacciato, ancora {r} round: un'unità che entra scivola di uno spazio",
  "Chão congelado, faltam {r} rodadas: uma unidade que entra desliza um espaço", "Sahig na Yelo, {r} round pa: dumudulas ng isang puwesto ang yunit na papasok",
  "பனித் தரை, இன்னும் {r} சுற்றுகள்: உள்ளே வரும் அலகு ஒரு இடம் வழுக்கிச் செல்லும்", "Lantai Es, sisa {r} ronde: unit yang masuk tergelincir satu petak",
  "冰面，剩余 {r} 回合：进入的单位会再滑一格", "冰面，剩餘 {r} 回合：進入的單位會再滑一格", "氷の床・残り{r}ラウンド：入ったユニットは1マス滑る", "얼음 바닥, {r}라운드 남음: 들어온 유닛이 한 칸 미끄러집니다"],
"Lava Floor, {r} rounds left: {n} fire a round to the unit here (not flyers)": [
  "Sol de lave, encore {r} rounds : {n} de feu par round à l'unité ici (pas aux volants)", "Lavaboden, noch {r} Runden: {n} Feuer pro Runde für die Einheit hier (nicht für Flieger)",
  "Suelo de lava, quedan {r} rondas: {n} de fuego por ronda a la unidad aquí (no a voladores)", "Pavimento di lava, ancora {r} round: {n} di fuoco a round all'unità qui (non ai volanti)",
  "Chão de lava, faltam {r} rodadas: {n} de fogo por rodada à unidade aqui (não voadores)", "Sahig na Lava, {r} round pa: {n} apoy bawat round sa yunit dito (hindi sa lumilipad)",
  "எரிமலைக் குழம்புத் தரை, இன்னும் {r} சுற்றுகள்: இங்குள்ள அலகுக்கு ஒரு சுற்றுக்கு {n} தீ (பறப்பவைக்கு இல்லை)", "Lantai Lava, sisa {r} ronde: {n} api per ronde ke unit di sini (bukan penerbang)",
  "熔岩地面，剩余 {r} 回合：每回合对此处单位造成 {n} 点火焰伤害（飞行单位除外）", "熔岩地面，剩餘 {r} 回合：每回合對此處單位造成 {n} 點火焰傷害（飛行單位除外）",
  "溶岩の床・残り{r}ラウンド：ここのユニットに毎ラウンド炎{n}（飛行は除く）", "용암 바닥, {r}라운드 남음: 매 라운드 이곳 유닛에게 화염 {n} (비행 제외)"],
"Poison Floor, {r} rounds left: Poison {n} on coming in and every round (not flyers)": [
  "Sol empoisonné, encore {r} rounds : Poison {n} en arrivant et à chaque round (pas aux volants)", "Giftboden, noch {r} Runden: Gift {n} beim Betreten und jede Runde (nicht für Flieger)",
  "Suelo venenoso, quedan {r} rondas: Veneno {n} al entrar y cada ronda (no a voladores)", "Pavimento velenoso, ancora {r} round: Veleno {n} all'ingresso e a ogni round (non ai volanti)",
  "Chão venenoso, faltam {r} rodadas: Veneno {n} ao entrar e a cada rodada (não voadores)", "Sahig na Lason, {r} round pa: Lason {n} sa pagpasok at bawat round (hindi sa lumilipad)",
  "நச்சுத் தரை, இன்னும் {r} சுற்றுகள்: உள்ளே வரும்போதும் ஒவ்வொரு சுற்றிலும் நஞ்சு {n} (பறப்பவைக்கு இல்லை)", "Lantai Racun, sisa {r} ronde: Racun {n} saat masuk dan tiap ronde (bukan penerbang)",
  "毒地，剩余 {r} 回合：进入时及每回合中毒 {n}（飞行单位除外）", "毒地，剩餘 {r} 回合：進入時及每回合中毒 {n}（飛行單位除外）",
  "毒の床・残り{r}ラウンド：入った時と毎ラウンド毒{n}（飛行は除く）", "독 바닥, {r}라운드 남음: 들어올 때와 매 라운드 독 {n} (비행 제외)"],
"Toxic Gas, {r} rounds left: Poison {n} every round, flyers too": [
  "Gaz toxique, encore {r} rounds : Poison {n} à chaque round, volants compris", "Giftgas, noch {r} Runden: Gift {n} jede Runde, auch für Flieger",
  "Gas tóxico, quedan {r} rondas: Veneno {n} cada ronda, también a voladores", "Gas tossico, ancora {r} round: Veleno {n} a ogni round, anche ai volanti",
  "Gás tóxico, faltam {r} rodadas: Veneno {n} a cada rodada, voadores também", "Nakalalasong Gas, {r} round pa: Lason {n} bawat round, pati sa lumilipad",
  "நச்சு வாயு, இன்னும் {r} சுற்றுகள்: ஒவ்வொரு சுற்றிலும் நஞ்சு {n}, பறப்பவைக்கும்", "Gas Beracun, sisa {r} ronde: Racun {n} tiap ronde, penerbang juga",
  "毒气，剩余 {r} 回合：每回合中毒 {n}，飞行单位也会", "毒氣，剩餘 {r} 回合：每回合中毒 {n}，飛行單位也會", "毒ガス・残り{r}ラウンド：毎ラウンド毒{n}、飛行も", "독가스, {r}라운드 남음: 매 라운드 독 {n}, 비행 유닛도"],
"Rubble, {r} rounds left: this row's side can't play a card here": [
  "Éboulis, encore {r} rounds : le camp de cette rangée ne peut pas jouer de carte ici", "Geröll, noch {r} Runden: Die Seite dieser Reihe kann hier keine Karte spielen",
  "Escombros, quedan {r} rondas: el bando de esta fila no puede jugar una carta aquí", "Macerie, ancora {r} round: la parte di questa fila non può giocare carte qui",
  "Entulho, faltam {r} rodadas: o lado desta fileira não pode jogar uma carta aqui", "Guho, {r} round pa: hindi makapaglaro ng card dito ang panig ng hanay na ito",
  "இடிபாடுகள், இன்னும் {r} சுற்றுகள்: இந்த வரிசையின் பக்கம் இங்கே அட்டை விளையாட முடியாது", "Reruntuhan, sisa {r} ronde: pihak baris ini tidak bisa memainkan kartu di sini",
  "碎石，剩余 {r} 回合：这一排的一方不能在此打出卡牌", "碎石，剩餘 {r} 回合：這一排的一方不能在此打出卡牌", "瓦礫・残り{r}ラウンド：この列の側はここにカードを出せない", "잔해, {r}라운드 남음: 이 줄의 편은 여기에 카드를 낼 수 없습니다"],
"Ice Floor on one slot for {r} rounds: a unit that comes in slides one slot on.": [
  "Sol gelé sur un emplacement pendant {r} rounds : une unité qui arrive glisse d'un emplacement.", "Eisboden auf einem Platz für {r} Runden: Eine Einheit, die hereinkommt, rutscht einen Platz weiter.",
  "Suelo helado en una casilla durante {r} rondas: una unidad que entra se desliza una casilla más.", "Pavimento ghiacciato su uno spazio per {r} round: un'unità che entra scivola di uno spazio.",
  "Chão congelado num espaço por {r} rodadas: uma unidade que entra desliza um espaço.", "Sahig na Yelo sa isang puwesto sa loob ng {r} round: dumudulas ng isang puwesto ang yunit na papasok.",
  "{r} சுற்றுகளுக்கு ஓர் இடத்தில் பனித் தரை: உள்ளே வரும் அலகு ஒரு இடம் வழுக்கிச் செல்லும்.", "Lantai Es di satu petak selama {r} ronde: unit yang masuk tergelincir satu petak.",
  "在一个格位上铺冰面 {r} 回合：进入的单位会再滑一格。", "在一個格位上鋪冰面 {r} 回合：進入的單位會再滑一格。", "1マスを{r}ラウンド氷の床にする：入ったユニットは1マス滑る。", "한 칸을 {r}라운드 동안 얼음 바닥으로: 들어온 유닛이 한 칸 미끄러집니다."],
"Lava Floor on one slot for {r} rounds: {n} fire a round to the unit there (not flyers).": [
  "Sol de lave sur un emplacement pendant {r} rounds : {n} de feu par round à l'unité qui s'y trouve (pas aux volants).", "Lavaboden auf einem Platz für {r} Runden: {n} Feuer pro Runde für die Einheit dort (nicht für Flieger).",
  "Suelo de lava en una casilla durante {r} rondas: {n} de fuego por ronda a la unidad allí (no a voladores).", "Pavimento di lava su uno spazio per {r} round: {n} di fuoco a round all'unità lì (non ai volanti).",
  "Chão de lava num espaço por {r} rodadas: {n} de fogo por rodada à unidade ali (não voadores).", "Sahig na Lava sa isang puwesto sa loob ng {r} round: {n} apoy bawat round sa yunit doon (hindi sa lumilipad).",
  "{r} சுற்றுகளுக்கு ஓர் இடத்தில் எரிமலைக் குழம்புத் தரை: அங்குள்ள அலகுக்கு ஒரு சுற்றுக்கு {n} தீ (பறப்பவைக்கு இல்லை).", "Lantai Lava di satu petak selama {r} ronde: {n} api per ronde ke unit di sana (bukan penerbang).",
  "在一个格位上铺熔岩 {r} 回合：每回合对那里的单位造成 {n} 点火焰伤害（飞行单位除外）。", "在一個格位上鋪熔岩 {r} 回合：每回合對那裡的單位造成 {n} 點火焰傷害（飛行單位除外）。",
  "1マスを{r}ラウンド溶岩の床にする：そこのユニットに毎ラウンド炎{n}（飛行は除く）。", "한 칸을 {r}라운드 동안 용암 바닥으로: 그곳 유닛에게 매 라운드 화염 {n} (비행 제외)."],
"Poison Floor on one slot for {r} rounds: Poison {n} on coming in and every round (not flyers).": [
  "Sol empoisonné sur un emplacement pendant {r} rounds : Poison {n} en arrivant et à chaque round (pas aux volants).", "Giftboden auf einem Platz für {r} Runden: Gift {n} beim Betreten und jede Runde (nicht für Flieger).",
  "Suelo venenoso en una casilla durante {r} rondas: Veneno {n} al entrar y cada ronda (no a voladores).", "Pavimento velenoso su uno spazio per {r} round: Veleno {n} all'ingresso e a ogni round (non ai volanti).",
  "Chão venenoso num espaço por {r} rodadas: Veneno {n} ao entrar e a cada rodada (não voadores).", "Sahig na Lason sa isang puwesto sa loob ng {r} round: Lason {n} sa pagpasok at bawat round (hindi sa lumilipad).",
  "{r} சுற்றுகளுக்கு ஓர் இடத்தில் நச்சுத் தரை: உள்ளே வரும்போதும் ஒவ்வொரு சுற்றிலும் நஞ்சு {n} (பறப்பவைக்கு இல்லை).", "Lantai Racun di satu petak selama {r} ronde: Racun {n} saat masuk dan tiap ronde (bukan penerbang).",
  "在一个格位上铺毒地 {r} 回合：进入时及每回合中毒 {n}（飞行单位除外）。", "在一個格位上鋪毒地 {r} 回合：進入時及每回合中毒 {n}（飛行單位除外）。",
  "1マスを{r}ラウンド毒の床にする：入った時と毎ラウンド毒{n}（飛行は除く）。", "한 칸을 {r}라운드 동안 독 바닥으로: 들어올 때와 매 라운드 독 {n} (비행 제외)."],
"Toxic Gas on one slot for {r} rounds: Poison {n} every round, flyers too.": [
  "Gaz toxique sur un emplacement pendant {r} rounds : Poison {n} à chaque round, volants compris.", "Giftgas auf einem Platz für {r} Runden: Gift {n} jede Runde, auch für Flieger.",
  "Gas tóxico en una casilla durante {r} rondas: Veneno {n} cada ronda, también a voladores.", "Gas tossico su uno spazio per {r} round: Veleno {n} a ogni round, anche ai volanti.",
  "Gás tóxico num espaço por {r} rodadas: Veneno {n} a cada rodada, voadores também.", "Nakalalasong Gas sa isang puwesto sa loob ng {r} round: Lason {n} bawat round, pati sa lumilipad.",
  "{r} சுற்றுகளுக்கு ஓர் இடத்தில் நச்சு வாயு: ஒவ்வொரு சுற்றிலும் நஞ்சு {n}, பறப்பவைக்கும்.", "Gas Beracun di satu petak selama {r} ronde: Racun {n} tiap ronde, penerbang juga.",
  "在一个格位上放毒气 {r} 回合：每回合中毒 {n}，飞行单位也会。", "在一個格位上放毒氣 {r} 回合：每回合中毒 {n}，飛行單位也會。", "1マスに{r}ラウンド毒ガス：毎ラウンド毒{n}、飛行も。", "한 칸에 {r}라운드 동안 독가스: 매 라운드 독 {n}, 비행 유닛도."],
"Rubble on an empty enemy slot for {r} rounds: they can't play a card there.": [
  "Éboulis sur un emplacement ennemi vide pendant {r} rounds : l'ennemi ne peut pas y jouer de carte.", "Geröll auf einem leeren gegnerischen Platz für {r} Runden: Der Gegner kann dort keine Karte spielen.",
  "Escombros en una casilla enemiga vacía durante {r} rondas: el enemigo no puede jugar una carta allí.", "Macerie su uno spazio nemico vuoto per {r} round: il nemico non può giocarvi carte.",
  "Entulho num espaço inimigo vazio por {r} rodadas: o inimigo não pode jogar uma carta ali.", "Guho sa bakanteng puwesto ng kalaban sa loob ng {r} round: hindi sila makapaglaro ng card doon.",
  "{r} சுற்றுகளுக்கு எதிரியின் காலி இடத்தில் இடிபாடுகள்: அவர்கள் அங்கே அட்டை விளையாட முடியாது.", "Reruntuhan di petak musuh yang kosong selama {r} ronde: mereka tidak bisa memainkan kartu di sana.",
  "在敌方一个空格位上放碎石 {r} 回合：敌方不能在那里打出卡牌。", "在敵方一個空格位上放碎石 {r} 回合：敵方不能在那裡打出卡牌。", "敵の空きマスを{r}ラウンド瓦礫でふさぐ：そこにカードを出せない。", "적의 빈 칸에 {r}라운드 동안 잔해: 적은 그곳에 카드를 낼 수 없습니다."],
"Drop it on a slot, yours or the enemy's. It uses your play.": [
  "Posez-la sur un emplacement, le vôtre ou celui de l'ennemi. Elle utilise votre action.", "Lege sie auf einen Platz, deinen oder den des Gegners. Sie verbraucht deinen Zug.",
  "Suéltala en una casilla, tuya o del enemigo. Usa tu jugada.", "Lasciala su uno spazio, tuo o del nemico. Usa la tua giocata.",
  "Solte-a num espaço, seu ou do inimigo. Usa a sua jogada.", "Ilagay ito sa isang puwesto, sa iyo o sa kalaban. Ginagamit nito ang tira mo.",
  "அதை ஓர் இடத்தில் விடுங்கள், உங்களுடையதோ எதிரியினுடையதோ. இது உங்கள் ஆட்டத்தைப் பயன்படுத்தும்.", "Letakkan di sebuah petak, milikmu atau milik musuh. Ini memakai giliran mainmu.",
  "将它放到一个格位上，己方或敌方均可。会占用你的出牌。", "將它放到一個格位上，己方或敵方均可。會占用你的出牌。", "自分か敵のマスにドロップする。この手番のプレイを使う。", "내 칸이나 적의 칸에 놓으세요. 이번 플레이를 사용합니다."],
"That hazard can't go there.": ["Ce danger ne peut pas aller là.", "Diese Gefahr kann dort nicht hin.", "Ese peligro no puede ir ahí.", "Quel pericolo non può andare lì.", "Esse perigo não pode ir aí.",
  "Hindi puwede roon ang panganib na iyan.", "அந்த ஆபத்தை அங்கே வைக்க முடியாது.", "Bahaya itu tidak bisa ditaruh di sana.", "该地形危害不能放在那里。", "該地形危害不能放在那裡。", "その罠はそこに置けない。", "그 위험 지형은 거기에 둘 수 없습니다."],
"{unit} takes up {item}: ready next round.": [
  "{unit} prend {item} : prêt au prochain round.", "{unit} nimmt {item} auf: bereit in der nächsten Runde.", "{unit} toma {item}: listo la próxima ronda.", "{unit} prende {item}: pronto il prossimo round.",
  "{unit} pega {item}: pronto na próxima rodada.", "Kinuha ng {unit} ang {item}: handa sa susunod na round.", "{unit} {item}-ஐ எடுக்கிறது: அடுத்த சுற்றில் தயார்.", "{unit} mengambil {item}: siap ronde berikutnya.",
  "{unit} 拿起 {item}：下一回合生效。", "{unit} 拿起 {item}：下一回合生效。", "{unit}が{item}を手にした：次のラウンドに完了。", "{unit}이(가) {item}을(를) 집어 들었습니다: 다음 라운드에 준비."],
"{unit} is equipped with {item}: +{a}/+{h}.": [
  "{unit} est équipé de {item} : +{a}/+{h}.", "{unit} ist mit {item} ausgerüstet: +{a}/+{h}.", "{unit} está equipado con {item}: +{a}/+{h}.", "{unit} è equipaggiato con {item}: +{a}/+{h}.",
  "{unit} está equipado com {item}: +{a}/+{h}.", "Suot na ng {unit} ang {item}: +{a}/+{h}.", "{unit} {item}-ஐ அணிந்துள்ளது: +{a}/+{h}.", "{unit} memakai {item}: +{a}/+{h}.",
  "{unit} 装备了 {item}：+{a}/+{h}。", "{unit} 裝備了 {item}：+{a}/+{h}。", "{unit}は{item}を装備した：+{a}/+{h}。", "{unit}이(가) {item}을(를) 장착했습니다: +{a}/+{h}."],
"{side} lays {item} in an empty slot.": [
  "{side} pose {item} sur un emplacement vide.", "{side} legt {item} auf einen leeren Platz.", "{side} deja {item} en una casilla vacía.", "{side} posa {item} in uno spazio vuoto.",
  "{side} deixa {item} num espaço vazio.", "Inilagay ng {side} ang {item} sa bakanteng puwesto.", "{side} {item}-ஐ ஒரு காலி இடத்தில் வைக்கிறது.", "{side} menaruh {item} di petak kosong.",
  "{side}把 {item} 放在一个空格位上。", "{side}把 {item} 放在一個空格位上。", "{side}は{item}を空きマスに置いた。", "{side}이(가) {item}을(를) 빈 칸에 놓았습니다."],
"{item} stays where {unit} fell.": [
  "{item} reste là où {unit} est tombé.", "{item} bleibt, wo {unit} gefallen ist.", "{item} se queda donde cayó {unit}.", "{item} resta dove è caduto {unit}.",
  "{item} fica onde {unit} caiu.", "Naiwan ang {item} kung saan bumagsak ang {unit}.", "{unit} விழுந்த இடத்திலேயே {item} இருக்கிறது.", "{item} tetap di tempat {unit} gugur.",
  "{item} 留在 {unit} 倒下的地方。", "{item} 留在 {unit} 倒下的地方。", "{item}は{unit}が倒れた場所に残った。", "{item}은(는) {unit}이(가) 쓰러진 자리에 남았습니다."],
"{icon} {side}: {kind} on a slot for {r} rounds.": [
  "{icon} {side} : {kind} sur un emplacement pendant {r} rounds.", "{icon} {side}: {kind} auf einem Platz für {r} Runden.", "{icon} {side}: {kind} en una casilla durante {r} rondas.", "{icon} {side}: {kind} su uno spazio per {r} round.",
  "{icon} {side}: {kind} num espaço por {r} rodadas.", "{icon} {side}: {kind} sa isang puwesto sa loob ng {r} round.", "{icon} {side}: {r} சுற்றுகளுக்கு ஓர் இடத்தில் {kind}.", "{icon} {side}: {kind} di satu petak selama {r} ronde.",
  "{icon} {side}：在一个格位上放置{kind} {r} 回合。", "{icon} {side}：在一個格位上放置{kind} {r} 回合。", "{icon} {side}：1マスに{kind}（{r}ラウンド）。", "{icon} {side}: 한 칸에 {kind} ({r}라운드)."],
"{icon} {unit} takes {n} from the {kind}.": [
  "{icon} {unit} subit {n} de : {kind}.", "{icon} {unit} erleidet {n} durch: {kind}.", "{icon} {unit} recibe {n} de: {kind}.", "{icon} {unit} subisce {n} da: {kind}.",
  "{icon} {unit} sofre {n} de: {kind}.", "{icon} Tinamaan ang {unit} ng {n} mula sa {kind}.", "{icon} {kind} காரணமாக {unit} {n} சேதம் அடைகிறது.", "{icon} {unit} terkena {n} dari {kind}.",
  "{icon} {unit} 受到{kind}的 {n} 点伤害。", "{icon} {unit} 受到{kind}的 {n} 點傷害。", "{icon} {unit}は{kind}で{n}のダメージ。", "{icon} {unit}이(가) {kind}에서 {n} 피해를 받았습니다."],
"{icon} {unit} takes Poison {n} from the {kind}.": [
  "{icon} {unit} subit Poison {n} de : {kind}.", "{icon} {unit} erhält Gift {n} durch: {kind}.", "{icon} {unit} recibe Veneno {n} de: {kind}.", "{icon} {unit} subisce Veleno {n} da: {kind}.",
  "{icon} {unit} recebe Veneno {n} de: {kind}.", "{icon} Nalason ang {unit} ng {n} mula sa {kind}.", "{icon} {kind} காரணமாக {unit} நஞ்சு {n} பெறுகிறது.", "{icon} {unit} terkena Racun {n} dari {kind}.",
  "{icon} {unit} 因{kind}中毒 {n}。", "{icon} {unit} 因{kind}中毒 {n}。", "{icon} {unit}は{kind}で毒{n}。", "{icon} {unit}이(가) {kind}에서 독 {n}을(를) 받았습니다."],
"{unit} slips on the ice and slides a slot.": [
  "{unit} glisse sur la glace et avance d'un emplacement.", "{unit} rutscht auf dem Eis aus und gleitet einen Platz weiter.", "{unit} resbala en el hielo y se desliza una casilla.", "{unit} scivola sul ghiaccio di uno spazio.",
  "{unit} escorrega no gelo e desliza um espaço.", "Nadulas ang {unit} sa yelo at dumulas ng isang puwesto.", "{unit} பனியில் வழுக்கி ஓர் இடம் நகர்கிறது.", "{unit} tergelincir di es dan meluncur satu petak.",
  "{unit} 在冰上打滑，滑了一格。", "{unit} 在冰上打滑，滑了一格。", "{unit}は氷で滑って1マス進んだ。", "{unit}이(가) 얼음에 미끄러져 한 칸 밀려났습니다."],
"{icon} The {kind} wears off.": [
  "{icon} Fin de l'effet : {kind}.", "{icon} Vorbei: {kind}.", "{icon} Se acaba: {kind}.", "{icon} Svanisce: {kind}.",
  "{icon} Acabou: {kind}.", "{icon} Nawala na ang {kind}.", "{icon} {kind} முடிந்தது.", "{icon} {kind} hilang.",
  "{icon} {kind}消失了。", "{icon} {kind}消失了。", "{icon} {kind}が消えた。", "{icon} {kind}이(가) 사라졌습니다."],
"The unit takes a round to equip. Alone in a slot it does nothing and blocks nothing; when its unit dies it stays for the next one.": [
  "L'unité met un round à s'équiper. Seul dans un emplacement, il ne fait rien et ne bloque rien ; quand son unité meurt, il reste pour la suivante.",
  "Die Einheit braucht eine Runde zum Ausrüsten. Allein auf einem Platz tut es nichts und blockt nichts; stirbt seine Einheit, bleibt es für die nächste liegen.",
  "La unidad tarda una ronda en equiparse. Solo en una casilla no hace nada ni bloquea nada; cuando su unidad muere, se queda para la siguiente.",
  "L'unità impiega un round a equipaggiarsi. Da solo in uno spazio non fa nulla e non blocca nulla; quando la sua unità muore, resta per la prossima.",
  "A unidade leva uma rodada para se equipar. Sozinho num espaço não faz nada nem bloqueia nada; quando sua unidade morre, fica para a próxima.",
  "Isang round bago maisuot ng yunit. Kapag mag-isa sa puwesto, wala itong ginagawa at walang hinaharangan; kapag namatay ang yunit nito, naiiwan ito para sa susunod.",
  "அலகு அணிந்துகொள்ள ஒரு சுற்று ஆகும். ஓர் இடத்தில் தனியாக இருந்தால் எதுவும் செய்யாது, எதையும் தடுக்காது; அதன் அலகு இறந்தால் அடுத்ததற்காக அங்கேயே இருக்கும்.",
  "Unit butuh satu ronde untuk memakainya. Sendirian di petak, ia tidak berbuat apa-apa dan tidak menghalangi; saat unitnya gugur, ia tetap di sana untuk unit berikutnya.",
  "单位需要一回合才能装备。单独放在格位上时它没有效果，也不阻挡；它的单位阵亡后，它会留给下一个单位。",
  "單位需要一回合才能裝備。單獨放在格位上時它沒有效果，也不阻擋；它的單位陣亡後，它會留給下一個單位。",
  "装備には1ラウンドかかる。マスに単独で置かれている間は何もせず、何も防がない。持ち主が倒れても、次のユニットのためにそのマスに残る。",
  "유닛이 장착하는 데 한 라운드가 걸립니다. 칸에 홀로 있으면 아무 효과도 없고 아무것도 막지 않습니다. 유닛이 쓰러지면 다음 유닛을 위해 그 자리에 남습니다."],
}
CARD_NAMES = {
"Crowbar": ["Pied-de-biche", "Brecheisen", "Palanca", "Piede di porco", "Pé de cabra", "Bareta", "கடப்பாரை", "Linggis", "撬棍", "撬棍", "バール", "쇠지렛대"],
"Bucketknee Wolf": ["Loup Seau-Genou", "Eimerknie-Wolf", "Lobo Rodillacubo", "Lupo Ginocchiosecchio", "Lobo Joelho-de-Balde", "Lobong Balde-Tuhod", "வாளிமுழங்கால் ஓநாய்", "Serigala Ember-Lutut", "桶膝狼", "桶膝狼", "バケツひざオオカミ", "양동이무릎 늑대"],
"Armory": ["Armurerie", "Waffenkammer", "Armería", "Armeria", "Arsenal", "Taguan ng Sandata", "ஆயுதக் கிடங்கு", "Gudang Senjata", "军械库", "軍械庫", "武器庫", "무기고"],
"Frost Slick": ["Plaque de givre", "Frostglätte", "Placa de escarcha", "Lastra di brina", "Placa de geada", "Madulas na Hamog", "பனி வழுக்கல்", "Licin Beku", "霜滑面", "霜滑面", "霜の滑り床", "서리 빙판"],
"Magma Vent": ["Évent de magma", "Magmaschlot", "Respiradero de magma", "Sfiatatoio di magma", "Respiradouro de magma", "Singawan ng Magma", "மாக்மா துளை", "Lubang Magma", "岩浆喷口", "岩漿噴口", "マグマの噴気孔", "마그마 분출구"],
"Bog Seep": ["Suintement de tourbière", "Moorsickerung", "Filtración de ciénaga", "Trasudo di palude", "Infiltração do brejo", "Tagas ng Lusak", "சதுப்புக் கசிவு", "Rembesan Rawa", "沼泽渗水", "沼澤滲水", "沼のしみ出し", "늪 스며듦"],
"Miasma": ["Miasme", "Miasma", "Miasma", "Miasma", "Miasma", "Miasma", "நச்சுப் புகை", "Miasma", "瘴气", "瘴氣", "瘴気", "독기"],
"Rockfall": ["Chute de pierres", "Steinschlag", "Desprendimiento", "Frana", "Desmoronamento", "Pagguho ng Bato", "பாறைச் சரிவு", "Longsoran Batu", "落石", "落石", "落石", "낙석"],
}
FLAVOR = {
"Bent at one end, scuffed at the other. It has opened more stuck doors than any key, and it is a great comfort when something small and leggy drops from the rafters.": [
  "Tordu à un bout, éraflé à l'autre. Il a ouvert plus de portes coincées qu'aucune clé, et il rassure beaucoup quand une petite chose à pattes tombe des chevrons.",
  "An einem Ende gebogen, am anderen zerschrammt. Es hat mehr klemmende Türen geöffnet als jeder Schlüssel und ist ein großer Trost, wenn etwas Kleines mit vielen Beinen von den Dachbalken fällt.",
  "Doblada por un extremo, rayada por el otro. Ha abierto más puertas atascadas que cualquier llave, y es un gran consuelo cuando algo pequeño y patudo cae de las vigas.",
  "Piegato a un'estremità, graffiato all'altra. Ha aperto più porte bloccate di qualsiasi chiave, ed è di grande conforto quando qualcosa di piccolo e zampettante cade dalle travi.",
  "Torto numa ponta, arranhado na outra. Já abriu mais portas emperradas do que qualquer chave, e é um grande consolo quando algo pequeno e cheio de pernas cai das vigas.",
  "Baluktot sa isang dulo, gasgas sa kabila. Mas maraming naipit na pinto ang nabuksan nito kaysa sa anumang susi, at malaking ginhawa ito kapag may maliit at mabintíng nahulog mula sa kisame.",
  "ஒரு முனையில் வளைந்து, மறுமுனையில் தேய்ந்தது. எந்தச் சாவியையும் விட அதிகமான இறுகிய கதவுகளைத் திறந்துள்ளது; உத்தரத்திலிருந்து சிறிய, கால்கள் நிறைந்த ஏதாவது விழும்போது பெரும் ஆறுதல்.",
  "Bengkok di satu ujung, lecet di ujung lain. Ia sudah membuka lebih banyak pintu macet daripada kunci mana pun, dan sangat menenangkan saat sesuatu yang kecil berkaki banyak jatuh dari kasau.",
  "一头弯曲，一头磨花。它撬开的卡住的门比任何钥匙都多；当有什么长着腿的小东西从房梁上掉下来时，它让人格外安心。",
  "一頭彎曲，一頭磨花。它撬開的卡住的門比任何鑰匙都多；當有什麼長著腿的小東西從房樑上掉下來時，它讓人格外安心。",
  "片端は曲がり、もう片端は傷だらけ。どんな鍵よりも多くの開かずの扉を開けてきた。梁から脚の多い小さな何かが落ちてきた時には、とても心強い。",
  "한쪽 끝은 휘었고 다른 쪽은 긁혀 있다. 어떤 열쇠보다 많은 꽉 낀 문을 열었고, 서까래에서 다리 많은 작은 무언가가 떨어질 때 큰 위안이 된다."],
"It used to take the high roads and the hard jobs. Then it took one to the knee. Now it keeps the village gate with a bucket on its head and stories nobody asked for.": [
  "Il prenait jadis les grandes routes et les durs boulots. Puis il en a pris une dans le genou. Aujourd'hui il garde la porte du village, un seau sur la tête et des histoires que personne n'a demandées.",
  "Früher nahm er die hohen Straßen und die harten Aufträge. Dann bekam er eins ins Knie. Jetzt hütet er das Dorftor, mit einem Eimer auf dem Kopf und Geschichten, die keiner hören wollte.",
  "Antes tomaba los caminos altos y los trabajos duros. Luego se llevó una en la rodilla. Ahora guarda la puerta del pueblo con un cubo en la cabeza e historias que nadie pidió.",
  "Un tempo prendeva le strade alte e i lavori duri. Poi ne ha presa una nel ginocchio. Ora sorveglia la porta del villaggio con un secchio in testa e storie che nessuno ha chiesto.",
  "Antes pegava as estradas altas e os trabalhos duros. Depois levou uma no joelho. Agora guarda o portão da vila com um balde na cabeça e histórias que ninguém pediu.",
  "Dati'y tinatahak nito ang matataas na daan at ang mabibigat na trabaho. Saka ito tinamaan ng isa sa tuhod. Ngayon, binabantayan nito ang tarangkahan ng nayon, may balde sa ulo at mga kuwentong walang humiling.",
  "ஒருகாலத்தில் உயர்ந்த பாதைகளிலும் கடினமான வேலைகளிலும் சென்றது. பிறகு முழங்காலில் ஒன்று வாங்கியது. இப்போது தலையில் ஒரு வாளியுடன், யாரும் கேட்காத கதைகளுடன் கிராம வாயிலைக் காக்கிறது.",
  "Dulu ia menempuh jalan tinggi dan pekerjaan berat. Lalu lututnya kena satu. Kini ia menjaga gerbang desa dengan ember di kepala dan cerita yang tak pernah diminta siapa pun.",
  "它曾经走大道、接硬活。后来膝盖中了一下。如今它头顶水桶守着村门，满肚子没人想听的往事。",
  "它曾經走大道、接硬活。後來膝蓋中了一下。如今它頭頂水桶守著村門，滿肚子沒人想聽的往事。",
  "かつては高い道を行き、きつい仕事を引き受けていた。そしてひざに一発もらった。今は頭にバケツをかぶって村の門番をし、誰も頼んでいない昔話をしている。",
  "한때는 높은 길과 험한 일을 도맡았다. 그러다 무릎에 한 방 맞았다. 이제는 머리에 양동이를 쓰고 아무도 묻지 않은 이야기를 품은 채 마을 문을 지킨다."],
"A beaver-built lodge of racks and pegs. Every blade in it is oiled and labelled, and every archer who walks past leaves with straighter arrows.": [
  "Un abri de castor fait de râteliers et de chevilles. Chaque lame y est huilée et étiquetée, et chaque archer qui passe repart avec des flèches plus droites.",
  "Eine Biberhütte voller Gestelle und Haken. Jede Klinge darin ist geölt und beschriftet, und jeder Bogenschütze, der vorbeikommt, geht mit geraderen Pfeilen.",
  "Una madriguera de castor llena de soportes y clavijas. Cada hoja está aceitada y etiquetada, y cada arquero que pasa se va con flechas más rectas.",
  "Una tana di castoro piena di rastrelliere e pioli. Ogni lama è oliata ed etichettata, e ogni arciere che passa se ne va con frecce più dritte.",
  "Uma toca de castor cheia de suportes e cavilhas. Cada lâmina está oleada e etiquetada, e cada arqueiro que passa sai com flechas mais retas.",
  "Isang kubong gawa ng beaver na puno ng sabitan at tulos. Bawat talim dito ay nilangisan at may tatak, at bawat mamamanang dumaraan ay umaalis na may mas tuwid na palaso.",
  "அடுக்குகளும் முளைகளும் நிறைந்த, நீர்நாய் கட்டிய குடில். அதிலுள்ள ஒவ்வொரு கத்தியும் எண்ணெய் பூசப்பட்டு பெயரிடப்பட்டுள்ளது; கடந்து செல்லும் ஒவ்வொரு வில்லாளியும் நேரான அம்புகளுடன் செல்கிறான்.",
  "Pondok buatan berang-berang penuh rak dan pasak. Setiap bilah di dalamnya diminyaki dan diberi label, dan setiap pemanah yang lewat pergi dengan panah yang lebih lurus.",
  "一座河狸搭建的小屋，满是架子和木钉。里面每把刀刃都上了油、贴了标签，每个路过的弓手离开时箭都更直了。",
  "一座河狸搭建的小屋，滿是架子和木釘。裡面每把刀刃都上了油、貼了標籤，每個路過的弓手離開時箭都更直了。",
  "ビーバーが建てた、棚と木釘だらけの小屋。刃はどれも油を引かれ札がつき、前を通る射手はみな、まっすぐな矢を手に去っていく。",
  "비버가 지은, 선반과 나무못으로 가득한 오두막. 안의 모든 날은 기름칠과 이름표가 되어 있고, 지나가는 궁수는 모두 더 곧은 화살을 들고 떠난다."],
"A puddle that froze flat overnight. Whoever steps onto it keeps going, whether they meant to or not.": [
  "Une flaque gelée à plat pendant la nuit. Qui pose le pied dessus continue d'avancer, qu'il le veuille ou non.",
  "Eine Pfütze, die über Nacht glatt gefroren ist. Wer darauf tritt, rutscht weiter, ob er will oder nicht.",
  "Un charco que se heló liso durante la noche. Quien lo pisa sigue de largo, quiera o no.",
  "Una pozzanghera gelata liscia durante la notte. Chi ci mette piede continua ad andare, che lo voglia o no.",
  "Uma poça que congelou lisa durante a noite. Quem pisa nela continua indo, queira ou não.",
  "Isang lusak na nanigas nang patag magdamag. Sinumang tumapak dito ay tuloy-tuloy, sinadya man o hindi.",
  "இரவோடு இரவாக சமமாக உறைந்த ஒரு குட்டை. அதில் கால் வைப்பவர் விரும்பினாலும் இல்லாவிட்டாலும் தொடர்ந்து செல்வார்.",
  "Genangan yang membeku rata semalaman. Siapa pun yang menginjaknya terus meluncur, mau atau tidak.",
  "一夜之间冻得平平的水洼。谁踩上去都会一直滑下去，不管愿不愿意。", "一夜之間凍得平平的水窪。誰踩上去都會一直滑下去，不管願不願意。",
  "一晩で平らに凍った水たまり。踏んだ者は、望もうと望むまいと進み続ける。", "밤새 평평하게 얼어붙은 웅덩이. 밟는 이는 원하든 원치 않든 계속 미끄러져 간다."],
"A crack in the ground breathes orange. Standing on it is a choice, and a short one.": [
  "Une fissure dans le sol respire l'orange. Se tenir dessus est un choix, et un choix bref.",
  "Ein Riss im Boden atmet Orange. Darauf zu stehen ist eine Entscheidung, und eine kurze.",
  "Una grieta en el suelo respira naranja. Quedarse encima es una decisión, y una breve.",
  "Una crepa nel terreno respira arancione. Starci sopra è una scelta, e breve.",
  "Uma fenda no chão respira laranja. Ficar em cima dela é uma escolha, e curta.",
  "Isang bitak sa lupa ang humihinga ng kahel. Ang tumayo rito ay isang pasya, at maikling pasya.",
  "நிலத்தில் ஒரு விரிசல் ஆரஞ்சு நிறத்தில் மூச்சுவிடுகிறது. அதன் மேல் நிற்பது ஒரு தேர்வு, அதுவும் குறுகியது.",
  "Sebuah retakan di tanah menghembuskan jingga. Berdiri di atasnya adalah pilihan, dan pilihan yang singkat.",
  "地上的裂缝呼出橙色的热气。站在上面是一种选择，而且是很短的选择。", "地上的裂縫呼出橙色的熱氣。站在上面是一種選擇，而且是很短的選擇。",
  "地面の割れ目がオレンジ色の息を吐く。その上に立つのは選択だ。それも短い選択。", "땅의 갈라진 틈이 주황빛 숨을 내쉰다. 그 위에 서는 건 선택이고, 짧은 선택이다."],
"Green water rises between the stones. It smells of old eggs and worse decisions.": [
  "Une eau verte monte entre les pierres. Elle sent les vieux œufs et les pires décisions.",
  "Grünes Wasser steigt zwischen den Steinen auf. Es riecht nach alten Eiern und schlechteren Entscheidungen.",
  "Agua verde sube entre las piedras. Huele a huevos viejos y a peores decisiones.",
  "Acqua verde sale tra le pietre. Sa di uova vecchie e di decisioni peggiori.",
  "Água verde sobe entre as pedras. Cheira a ovos velhos e a decisões piores.",
  "Umaahon ang berdeng tubig sa pagitan ng mga bato. Amoy lumang itlog at mas masasamang pasya.",
  "கற்களுக்கிடையே பச்சை நீர் எழுகிறது. பழைய முட்டைகளின் மணமும் அதைவிட மோசமான முடிவுகளின் மணமும் வீசுகிறது.",
  "Air hijau naik di antara batu. Baunya seperti telur busuk dan keputusan yang lebih buruk.",
  "绿水从石缝间渗出，闻起来像臭鸡蛋，还有更糟的决定。", "綠水從石縫間滲出，聞起來像臭雞蛋，還有更糟的決定。",
  "石の間から緑の水がしみ出す。古い卵と、もっとひどい決断のにおいがする。", "돌 사이로 초록 물이 스며 오른다. 오래된 달걀과 더 나쁜 결정의 냄새가 난다."],
"A yellow fog that hangs at head height, and at wing height too.": [
  "Un brouillard jaune qui flotte à hauteur de tête, et à hauteur d'aile aussi.", "Ein gelber Nebel, der auf Kopfhöhe hängt, und auch auf Flügelhöhe.",
  "Una niebla amarilla que flota a la altura de la cabeza, y también a la de las alas.", "Una nebbia gialla sospesa all'altezza della testa, e anche delle ali.",
  "Uma névoa amarela que paira à altura da cabeça, e à das asas também.", "Isang dilaw na ulap na nakabitin sa taas ng ulo, at sa taas ng pakpak din.",
  "தலை உயரத்திலும், இறக்கை உயரத்திலும் தொங்கும் மஞ்சள் மூடுபனி.", "Kabut kuning yang menggantung setinggi kepala, dan setinggi sayap juga.",
  "一团悬在头顶高度的黄雾，翅膀的高度也有。", "一團懸在頭頂高度的黃霧，翅膀的高度也有。", "頭の高さに、そして翼の高さにも漂う黄色い霧。", "머리 높이에, 그리고 날개 높이에도 걸려 있는 노란 안개."],
"The ledge gave way. Nobody is building anything there for a while.": [
  "La corniche a cédé. Personne ne construira rien là avant un moment.", "Der Felsvorsprung ist abgebrochen. Dort baut so bald niemand etwas.",
  "La cornisa cedió. Nadie va a construir nada ahí en un buen tiempo.", "La sporgenza ha ceduto. Nessuno costruirà niente lì per un bel po'.",
  "A saliência cedeu. Ninguém vai construir nada ali por um tempo.", "Gumuho ang gilid ng bangin. Walang magtatayo ng kahit ano roon nang matagal.",
  "விளிம்பு சரிந்துவிட்டது. சில காலம் அங்கே யாரும் எதையும் கட்டப் போவதில்லை.", "Tebingnya runtuh. Tak ada yang akan membangun apa pun di sana untuk sementara.",
  "岩架塌了。短时间内谁也别想在那里建东西。", "岩架塌了。短時間內誰也別想在那裡建東西。", "岩棚が崩れた。しばらくは誰もそこに何も建てられない。", "바위 턱이 무너졌다. 한동안 아무도 거기에 아무것도 짓지 못한다."],
}

def write_pack(path, rows, i, keep_existing=True, drop=()):
    pack = json.load(open(path, encoding='utf-8')) if os.path.exists(path) else {}
    for k in drop: pack.pop(k, None)
    items = list(pack.items())
    have = set(pack)
    for en, row in rows.items():
        if en in have and keep_existing: continue
        at = next((j for j, (k, _) in enumerate(items) if k.lower() > en.lower()), len(items))
        items.insert(at, (en, row[i]))
    with open(path, 'w', encoding='utf-8') as fh:
        json.dump(dict(items), fh, ensure_ascii=False, indent=1); fh.write('\n')

if __name__ == '__main__':
    for k, en in list(KEYS.items()) + [(k, v[1]) for k, v in CHANGED.items()]:
        c = core(en); assert c in T, (k, c)
        want = sorted(re.findall(r'\{\w+\}', c))
        for code, tr in zip(CODES, T[c]): assert sorted(re.findall(r'\{\w+\}', tr)) == want, (k, code, tr)
    for d in (T, CARD_NAMES, FLAVOR):
        for en, row in d.items(): assert len(row) == 12, en
    tp = os.path.join(ROOT, 'bramblewood-texts.js'); src = open(tp, encoding='utf-8').read()
    for k, (old, new) in CHANGED.items():
        o = '%s: %s' % (json.dumps(k), json.dumps(old, ensure_ascii=False)); n = '%s: %s' % (json.dumps(k), json.dumps(new, ensure_ascii=False))
        if o in src: src = src.replace(o, n)
    end = '\n}/*TEXT-TABLE-END*/'; assert src.count(end) == 1
    add = [k for k in KEYS if ('"%s":' % k) not in src]
    if add:
        body = ''.join(',\n  %s: %s' % (json.dumps(k), json.dumps(KEYS[k], ensure_ascii=False)) for k in add)
        src = src.replace(end, body + end)
    open(tp, 'w', encoding='utf-8').write(src)
    drop = [core(v[0]) for v in CHANGED.values()]
    for i, code in enumerate(CODES):
        write_pack(os.path.join(ROOT, 'lang', code + '.json'), T, i, drop=drop)
        write_pack(os.path.join(ROOT, 'lang', 'cards', code + '.json'), CARD_NAMES, i)
        write_pack(os.path.join(ROOT, 'lang', 'ui', code + '.json'), FLAVOR, i)
    print('TX keys added:', len(add), '| packs:', len(CODES), 'x', len(T), 'texts,', len(CARD_NAMES), 'names,', len(FLAVOR), 'flavour lines')
