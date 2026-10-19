#!/usr/bin/env python3
"""Game texts added on 2026-10-19 by package U3 (the owner's UI notes 13:41-13:45): the compact phone map chips' names, the world
toast's "along the top", the turn meter ("Turn {n}", the last turns), and the raid's bramble (Kraken's Reef, its Tentacle Smack and
Tail Sweep). Keys are the English with the leading emoji peeled, as the page translator sees them; every {placeholder} is kept.
Same caveats as i18n_core.py (Tagalog, Tamil, Japanese and Korean deserve a native read).

    python3 tools/i18n_2026_10_19_u3.py && python3 tools/i18n_refresh.py
"""
import json, os, re
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
CODES = ['fr', 'de', 'es', 'it', 'pt', 'tl', 'ta', 'id', 'zh-Hans', 'zh-Hant', 'ja', 'ko']
T = {
"Map {n}: {name} ({done}/{total} cleared)": [
  "Carte {n} : {name} ({done}/{total} terminés)", "Karte {n}: {name} ({done}/{total} geschafft)", "Mapa {n}: {name} ({done}/{total} superados)",
  "Mappa {n}: {name} ({done}/{total} completati)", "Mapa {n}: {name} ({done}/{total} concluídos)", "Mapa {n}: {name} ({done}/{total} natapos)",
  "வரைபடம் {n}: {name} ({done}/{total} முடிந்தது)", "Peta {n}: {name} ({done}/{total} selesai)", "地图 {n}：{name}（已通关 {done}/{total}）",
  "地圖 {n}：{name}（已通關 {done}/{total}）", "マップ {n}：{name}（{done}/{total} クリア）", "지도 {n}: {name} ({done}/{total} 클리어)"],
"Map {n}: {name} (cleared)": [
  "Carte {n} : {name} (terminée)", "Karte {n}: {name} (geschafft)", "Mapa {n}: {name} (superado)", "Mappa {n}: {name} (completata)",
  "Mapa {n}: {name} (concluído)", "Mapa {n}: {name} (natapos na)", "வரைபடம் {n}: {name} (முடிந்தது)", "Peta {n}: {name} (selesai)",
  "地图 {n}：{name}（已通关）", "地圖 {n}：{name}（已通關）", "マップ {n}：{name}（クリア済み）", "지도 {n}: {name} (클리어)"],
"Map {n}: {name} (locked until you clear the map before it)": [
  "Carte {n} : {name} (verrouillée jusqu'à ce que tu termines la carte précédente)", "Karte {n}: {name} (gesperrt, bis du die Karte davor schaffst)",
  "Mapa {n}: {name} (bloqueado hasta que superes el mapa anterior)", "Mappa {n}: {name} (bloccata finché non completi la mappa precedente)",
  "Mapa {n}: {name} (bloqueado até você concluir o mapa anterior)", "Mapa {n}: {name} (sarado hanggang matapos mo ang mapang nauna rito)",
  "வரைபடம் {n}: {name} (முந்தைய வரைபடத்தை முடிக்கும் வரை பூட்டப்பட்டுள்ளது)", "Peta {n}: {name} (terkunci sampai kamu menyelesaikan peta sebelumnya)",
  "地图 {n}：{name}（通关前一张地图后解锁）", "地圖 {n}：{name}（通關前一張地圖後解鎖）", "マップ {n}：{name}（前のマップをクリアすると解放）",
  "지도 {n}: {name} (이전 지도를 클리어하면 열림)"],
"World: every map at once": [
  "Monde : toutes les cartes d'un coup", "Welt: alle Karten auf einmal", "Mundo: todos los mapas a la vez", "Mondo: tutte le mappe insieme",
  "Mundo: todos os mapas de uma vez", "Mundo: lahat ng mapa nang sabay", "உலகம்: எல்லா வரைபடங்களும் ஒரே பார்வையில்", "Dunia: semua peta sekaligus",
  "世界：一次查看所有地图", "世界：一次查看所有地圖", "ワールド：すべてのマップを一度に", "월드: 모든 지도를 한눈에"],
"The world opens up: every map you can reach is along the top, and the 🧭 shows them all.": [
  "Le monde s'ouvre : chaque carte accessible est en haut, et la 🧭 les montre toutes.",
  "Die Welt öffnet sich: Jede Karte, die du erreichen kannst, steht oben, und der 🧭 zeigt sie alle.",
  "El mundo se abre: cada mapa al que puedes llegar está arriba, y la 🧭 los muestra todos.",
  "Il mondo si apre: ogni mappa che puoi raggiungere è in alto, e la 🧭 le mostra tutte.",
  "O mundo se abre: todo mapa que você alcança fica no topo, e a 🧭 mostra todos.",
  "Bumubukas ang mundo: nasa itaas ang bawat mapang maaabot mo, at ipinapakita ng 🧭 ang lahat.",
  "உலகம் திறக்கிறது: நீ அடையக்கூடிய ஒவ்வொரு வரைபடமும் மேலே உள்ளது, 🧭 அவை அனைத்தையும் காட்டும்.",
  "Dunia terbuka: setiap peta yang bisa kamu capai ada di atas, dan 🧭 menampilkan semuanya.",
  "世界展开了：你能去的每张地图都在顶部，🧭 能一次显示全部。", "世界展開了：你能去的每張地圖都在頂部，🧭 能一次顯示全部。",
  "世界が広がった：行けるマップはすべて上に並び、🧭 で全部見られる。", "세상이 열렸다: 갈 수 있는 지도는 모두 위쪽에 있고, 🧭 로 한눈에 볼 수 있다."],
"Turn {n}": [
  "Tour {n}", "Zug {n}", "Turno {n}", "Turno {n}", "Turno {n}", "Turno {n}", "முறை {n}", "Giliran {n}", "第 {n} 回合", "第 {n} 回合", "ターン {n}", "{n}턴"],
"{n} turns left": [
  "Encore {n} tours", "Noch {n} Züge", "Quedan {n} turnos", "Mancano {n} turni", "Faltam {n} turnos", "{n} turno na lang",
  "இன்னும் {n} முறைகள்", "Sisa {n} giliran", "还剩 {n} 回合", "還剩 {n} 回合", "残り {n} ターン", "{n}턴 남음"],
"Last turn!": [
  "Dernier tour !", "Letzter Zug!", "¡Último turno!", "Ultimo turno!", "Último turno!", "Huling turno!", "கடைசி முறை!", "Giliran terakhir!",
  "最后一回合！", "最後一回合！", "最後のターン！", "마지막 턴!"],
"Kraken's Reef": [
  "Le Récif du Kraken", "Krakenriff", "El Arrecife del Kraken", "La Barriera del Kraken", "O Recife do Kraken", "Bahura ng Kraken",
  "கிராக்கனின் பவளப்பாறை", "Karang Kraken", "海妖礁", "海妖礁", "クラーケンの岩礁", "크라켄의 암초"],
"The boss's bramble": [
  "La ronce du boss", "Das Dornengestrüpp des Bosses", "La zarza del jefe", "Il rovo del boss", "O espinheiro do chefe", "Ang bramble ng boss",
  "முதலாளியின் முட்புதர்", "Semak duri bos", "首领的荆棘堡", "首領的荊棘堡", "ボスのいばら", "보스의 가시덤불"],
"The boss's bramble: {name}": [
  "La ronce du boss : {name}", "Das Dornengestrüpp des Bosses: {name}", "La zarza del jefe: {name}", "Il rovo del boss: {name}",
  "O espinheiro do chefe: {name}", "Ang bramble ng boss: {name}", "முதலாளியின் முட்புதர்: {name}", "Semak duri bos: {name}",
  "首领的荆棘堡：{name}", "首領的荊棘堡：{name}", "ボスのいばら：{name}", "보스의 가시덤불: {name}"],
"The boss's bramble, {name}, strikes too:": [
  "La ronce du boss, {name}, frappe aussi :", "Auch das Dornengestrüpp des Bosses, {name}, schlägt zu:", "La zarza del jefe, {name}, también ataca:",
  "Anche il rovo del boss, {name}, colpisce:", "O espinheiro do chefe, {name}, também ataca:", "Umaatake rin ang bramble ng boss, ang {name}:",
  "முதலாளியின் முட்புதர், {name}, கூட தாக்கும்:", "Semak duri bos, {name}, juga menyerang:", "首领的荆棘堡 {name} 也会出手：",
  "首領的荊棘堡 {name} 也會出手：", "ボスのいばら「{name}」も攻撃してくる：", "보스의 가시덤불 {name}도 공격한다:"],
"{name}: every {every} turns a tentacle lashes out of the reef at one of your columns or rows (a column first, then a row), {dmg} damage to each unit there. Its target glows red the turn before; if no unit is there, your bramble takes the hit.": [
  "{name} : tous les {every} tours, un tentacule jaillit du récif sur une de tes colonnes ou rangées (d'abord une colonne, puis une rangée), {dmg} dégâts à chaque unité touchée. Sa cible rougeoie le tour d'avant ; s'il n'y a aucune unité, c'est ta ronce qui prend le coup.",
  "{name}: Alle {every} Züge schnellt ein Tentakel aus dem Riff auf eine deiner Spalten oder Reihen (zuerst eine Spalte, dann eine Reihe), {dmg} Schaden an jeder Einheit dort. Sein Ziel glüht einen Zug vorher rot; steht dort keine Einheit, trifft es dein Dornengestrüpp.",
  "{name}: cada {every} turnos un tentáculo sale del arrecife contra una de tus columnas o filas (primero una columna, luego una fila), {dmg} de daño a cada unidad allí. Su objetivo brilla en rojo el turno anterior; si no hay unidades, el golpe lo recibe tu zarza.",
  "{name}: ogni {every} turni un tentacolo scatta dalla barriera contro una delle tue colonne o file (prima una colonna, poi una fila), {dmg} danni a ogni unità lì. Il bersaglio si illumina di rosso il turno prima; se non c'è nessuna unità, il colpo lo prende il tuo rovo.",
  "{name}: a cada {every} turnos um tentáculo sai do recife contra uma das suas colunas ou fileiras (primeiro uma coluna, depois uma fileira), {dmg} de dano a cada unidade ali. O alvo brilha em vermelho no turno anterior; se não houver unidade, o golpe vai para o seu espinheiro.",
  "{name}: bawat {every} turno, may galamay na humahampas mula sa bahura sa isa sa iyong mga hanay o hilera (hanay muna, saka hilera), {dmg} pinsala sa bawat unit doon. Kumikinang na pula ang target nito isang turno bago; kung walang unit doon, ang bramble mo ang tatamaan.",
  "{name}: ஒவ்வொரு {every} முறைகளுக்கும் பவளப்பாறையிலிருந்து ஒரு கொடுக்கு உன் ஒரு நெடுவரிசை அல்லது வரிசையைத் தாக்கும் (முதலில் நெடுவரிசை, பிறகு வரிசை), அங்குள்ள ஒவ்வொரு அலகுக்கும் {dmg} சேதம். அதன் இலக்கு முந்தைய முறையில் சிவப்பாக ஒளிரும்; அங்கே அலகு இல்லையெனில் உன் முட்புதர் அடி வாங்கும்.",
  "{name}: setiap {every} giliran sebuah tentakel melesat dari karang ke salah satu kolom atau barismu (kolom dulu, lalu baris), {dmg} kerusakan ke tiap unit di sana. Sasarannya menyala merah satu giliran sebelumnya; jika tak ada unit di sana, semak durimu yang terkena.",
  "{name}：每 {every} 回合，一根触手从礁石中甩出，击打你的一列或一行（先列后行），对那里的每个单位造成 {dmg} 点伤害。目标会在前一回合亮起红光；那里没有单位时，由你的荆棘堡承受这一击。",
  "{name}：每 {every} 回合，一根觸手從礁石中甩出，擊打你的一列或一行（先列後行），對那裡的每個單位造成 {dmg} 點傷害。目標會在前一回合亮起紅光；那裡沒有單位時，由你的荊棘堡承受這一擊。",
  "{name}：{every} ターンごとに岩礁から触手が伸び、あなたの列か行のひとつを打つ（まず列、次に行）。そこにいる各ユニットに {dmg} ダメージ。狙いは前のターンに赤く光る。ユニットがいなければ、あなたのいばらが受ける。",
  "{name}: {every}턴마다 암초에서 촉수가 뻗어 나와 너의 열이나 행 하나를 내리친다(먼저 열, 그다음 행). 그곳의 유닛마다 {dmg} 피해. 목표는 한 턴 전에 붉게 빛나고, 그곳에 유닛이 없으면 너의 가시덤불이 맞는다."],
"{name}: every {every} turns the reef sweeps your front row, {dmg} damage to each unit there.": [
  "{name} : tous les {every} tours, le récif balaie ta rangée avant, {dmg} dégâts à chaque unité.", "{name}: Alle {every} Züge fegt das Riff über deine vordere Reihe, {dmg} Schaden an jeder Einheit dort.",
  "{name}: cada {every} turnos el arrecife barre tu fila delantera, {dmg} de daño a cada unidad allí.", "{name}: ogni {every} turni la barriera spazza la tua fila anteriore, {dmg} danni a ogni unità lì.",
  "{name}: a cada {every} turnos o recife varre sua fileira da frente, {dmg} de dano a cada unidade ali.", "{name}: bawat {every} turno, winawalis ng bahura ang iyong unang hilera, {dmg} pinsala sa bawat unit doon.",
  "{name}: ஒவ்வொரு {every} முறைகளுக்கும் பவளப்பாறை உன் முன் வரிசையை வாரும், அங்குள்ள ஒவ்வொரு அலகுக்கும் {dmg} சேதம்.", "{name}: setiap {every} giliran karang menyapu barisan depanmu, {dmg} kerusakan ke tiap unit di sana.",
  "{name}：每 {every} 回合，礁石横扫你的前排，对那里的每个单位造成 {dmg} 点伤害。", "{name}：每 {every} 回合，礁石橫掃你的前排，對那裡的每個單位造成 {dmg} 點傷害。",
  "{name}：{every} ターンごとに岩礁があなたの前列をなぎ払い、各ユニットに {dmg} ダメージ。", "{name}: {every}턴마다 암초가 너의 앞줄을 쓸어, 그곳의 유닛마다 {dmg} 피해."],
"Tentacle Smack": [
  "Coup de tentacule", "Tentakelschlag", "Latigazo de tentáculo", "Sferzata di tentacolo", "Golpe de tentáculo", "Hampas ng galamay",
  "கொடுக்கு அடி", "Hantaman Tentakel", "触手猛击", "觸手猛擊", "触手打ち", "촉수 강타"],
"Tail Sweep": [
  "Balayage de queue", "Schwanzfeger", "Barrido de cola", "Spazzata di coda", "Varrida de cauda", "Hampas ng buntot",
  "வால் வீச்சு", "Sapuan Ekor", "尾巴横扫", "尾巴橫掃", "尾払い", "꼬리 휩쓸기"],
}
assert all(len(v) == len(CODES) for v in T.values()), [k for k, v in T.items() if len(v) != len(CODES)]
ph = lambda s: sorted(set(re.findall(r'\{\w+\}', s)))
assert all(ph(k) == ph(t) for k, v in T.items() for t in v), [(k, t) for k, v in T.items() for t in v if ph(k) != ph(t)]
if __name__ == '__main__':
    for i, code in enumerate(CODES):
        path = os.path.join(ROOT, 'lang', code + '.json')
        items = list((json.load(open(path, encoding='utf-8')) if os.path.exists(path) else {}).items())
        for en, row in T.items():  # in place, without re-sorting the pack (other packages' lines stay where they are)
            if en in ('Tentacle Smack', 'Tail Sweep') and any(k == en for k, _ in items): continue  # keep an existing translation
            j = next((j for j, (k, _) in enumerate(items) if k == en), None)
            if j is not None: items[j] = (en, row[i]); continue
            items.insert(next((j for j, (k, _) in enumerate(items) if k.lower() > en.lower()), len(items)), (en, row[i]))
        with open(path, 'w', encoding='utf-8') as fh:
            json.dump(dict(items), fh, ensure_ascii=False, indent=1); fh.write('\n')
    print('wrote', len(CODES), 'packs,', len(T), 'strings each')
