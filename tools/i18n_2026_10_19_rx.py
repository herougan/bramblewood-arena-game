#!/usr/bin/env python3
"""Game texts added on 2026-10-19 by package RX (the raid's closest-row targeting, its leader cost cap and the tag-team dungeons'
play-rows setting): the raid tab's leader-cap line, the over-cap reason, "Change leader", the closest-row note, the Commons note for a
raid that calls them in every few turns, and the play-rows picker and its pre-fight lines. Keys are the English with the leading emoji
peeled, as the page translator sees them; every {placeholder} is kept ({s} is an English plural ending a translation may drop). The
words follow the packs: Lumber (Bois, Holz ...), Stone, Metal, bramble (roncier, Dornenhecke ...), Common (Commune, Gewöhnlich ...).
Same caveats as i18n_core.py (Tagalog, Tamil, Japanese and Korean deserve a native read).

    python3 tools/i18n_2026_10_19_rx.py && python3 tools/i18n_refresh.py
"""
import json, os, re
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
CODES = ['fr', 'de', 'es', 'it', 'pt', 'tl', 'ta', 'id', 'zh-Hans', 'zh-Hant', 'ja', 'ko']
T = {
"Leader cost {cost}/{cap} — too costly for this raid": [
  "Coût du chef {cost}/{cap} — trop cher pour ce raid",
  "Anführerkosten {cost}/{cap} — zu teuer für diesen Raid",
  "Coste del líder {cost}/{cap}: demasiado caro para esta incursión",
  "Costo del capo {cost}/{cap}: troppo caro per questo raid",
  "Custo do líder {cost}/{cap}: demasiado caro para este raide",
  "Halaga ng pinuno {cost}/{cap} — masyadong mahal para sa raid na ito",
  "தலைவர் செலவு {cost}/{cap} — இந்த ரெய்டுக்கு மிக அதிகம்",
  "Biaya pemimpin {cost}/{cap} — terlalu mahal untuk raid ini",
  "领袖费用 {cost}/{cap}——对这次突袭来说太贵了",
  "領袖費用 {cost}/{cap}——對這次突襲來說太貴了",
  "リーダーのコスト {cost}/{cap}：このレイドには高すぎる",
  "리더 비용 {cost}/{cap} — 이 레이드에는 너무 비쌉니다"],
"Leader cost cap: {cap} points (each Lumber 1, Stone 2, Metal 3).": [
  "Plafond du coût du chef : {cap} points (Bois 1, Pierre 2, Métal 3 chacun).",
  "Kostengrenze für den Anführer: {cap} Punkte (je Holz 1, Stein 2, Metall 3).",
  "Límite de coste del líder: {cap} puntos (cada Madera 1, Piedra 2, Metal 3).",
  "Tetto di costo del capo: {cap} punti (ogni Legname 1, Pietra 2, Metallo 3).",
  "Limite de custo do líder: {cap} pontos (cada Madeira 1, Pedra 2, Metal 3).",
  "Hangganan ng halaga ng pinuno: {cap} puntos (bawat Kahoy 1, Bato 2, Metal 3).",
  "தலைவர் செலவு வரம்பு: {cap} புள்ளிகள் (ஒவ்வொரு மரக்கட்டை 1, கல் 2, உலோகம் 3).",
  "Batas biaya pemimpin: {cap} poin (tiap Kayu 1, Batu 2, Logam 3).",
  "领袖费用上限：{cap} 点（每点木材 1，岩石 2，金属 3）。",
  "領袖費用上限：{cap} 點（每點木材 1，岩石 2，金屬 3）。",
  "リーダーのコスト上限：{cap}ポイント（木材1つにつき1、石2、金属3）。",
  "리더 비용 상한: {cap}점 (목재 하나당 1, 돌 2, 금속 3)."],
"Your leader {name}: {cost}/{cap}.": [
  "Votre chef {name} : {cost}/{cap}.",
  "Dein Anführer {name}: {cost}/{cap}.",
  "Tu líder {name}: {cost}/{cap}.",
  "Il tuo capo {name}: {cost}/{cap}.",
  "O teu líder {name}: {cost}/{cap}.",
  "Ang pinuno mo, {name}: {cost}/{cap}.",
  "உங்கள் தலைவர் {name}: {cost}/{cap}.",
  "Pemimpinmu {name}: {cost}/{cap}.",
  "你的领袖 {name}：{cost}/{cap}。",
  "你的領袖 {name}：{cost}/{cap}。",
  "あなたのリーダー {name}：{cost}/{cap}。",
  "내 리더 {name}: {cost}/{cap}."],
"Change leader": [
  "Changer de chef", "Anführer wechseln", "Cambiar de líder", "Cambia capo", "Mudar de líder", "Palitan ang pinuno", "தலைவரை மாற்று",
  "Ganti pemimpin", "更换领袖", "更換領袖", "リーダーを変更", "리더 바꾸기"],
"Every unit, in every row, strikes the nearest enemy in its own column: the front row first, then the middle, then the back. Only a column with no enemy in it lets a strike through to the bramble.": [
  "Chaque unité, dans chaque rangée, frappe l'ennemi le plus proche dans sa propre colonne : la rangée avant d'abord, puis celle du milieu, puis celle du fond. Seule une colonne sans ennemi laisse passer un coup jusqu'au roncier.",
  "Jede Einheit in jeder Reihe trifft den nächsten Gegner in ihrer eigenen Spalte: zuerst die vordere Reihe, dann die mittlere, dann die hintere. Nur eine Spalte ohne Gegner lässt einen Schlag bis zur Dornenhecke durch.",
  "Cada unidad, en cada fila, golpea al enemigo más cercano de su propia columna: primero la fila delantera, luego la del medio y luego la trasera. Solo una columna sin enemigos deja pasar un golpe hasta el zarzal.",
  "Ogni unità, in ogni fila, colpisce il nemico più vicino nella propria colonna: prima la fila davanti, poi quella di mezzo, poi quella dietro. Solo una colonna senza nemici lascia passare un colpo fino al rovo.",
  "Cada unidade, em cada fila, ataca o inimigo mais próximo na sua coluna: primeiro a fila da frente, depois a do meio, depois a de trás. Só uma coluna sem inimigos deixa um golpe passar até ao silvado.",
  "Bawat unit, sa bawat hanay, ay tumatama sa pinakamalapit na kalaban sa sarili nitong column: una ang harapang hanay, saka ang gitna, saka ang likod. Ang column lang na walang kalaban ang nagpapalusot ng tama hanggang sa dawag.",
  "ஒவ்வொரு வரிசையிலும் உள்ள ஒவ்வொரு அலகும் தன் நெடுவரிசையில் உள்ள அருகிலுள்ள எதிரியைத் தாக்கும்: முதலில் முன் வரிசை, பின் நடு, பின் பின்வரிசை. எதிரி இல்லாத நெடுவரிசை மட்டுமே தாக்குதலை முட்புதர் வரை செல்ல விடும்.",
  "Setiap unit, di setiap baris, menyerang musuh terdekat di kolomnya sendiri: baris depan dulu, lalu tengah, lalu belakang. Hanya kolom tanpa musuh yang meloloskan serangan sampai ke semak.",
  "每一排的每个单位都会攻击自己这一列里最近的敌人：先是前排，然后中排，然后后排。只有一列里没有敌人时，攻击才会打到荆棘丛。",
  "每一排的每個單位都會攻擊自己這一列裡最近的敵人：先是前排，然後中排，然後後排。只有一列裡沒有敵人時，攻擊才會打到荊棘叢。",
  "どの列のユニットも、自分の縦列でいちばん近い敵を攻撃する：まず前列、次に中列、そして後列。敵のいない縦列だけが、攻撃をいばらまで通す。",
  "모든 줄의 모든 유닛은 자기 세로줄에서 가장 가까운 적을 칩니다: 앞줄 먼저, 다음은 가운데, 다음은 뒷줄. 적이 하나도 없는 세로줄만 공격이 덤불까지 닿습니다."],
"The boss holds three rows too: its guards in front, and every {every} turns it calls up to {max} Common{s} into its back two rows (only into a free slot with a card in front).": [
  "Le boss tient aussi trois rangées : ses gardes devant, et tous les {every} tours il appelle jusqu'à {max} Commune(s) dans ses deux rangées arrière (seulement dans une case libre avec une carte devant).",
  "Auch der Boss hat drei Reihen: vorne seine Wachen, und alle {every} Züge ruft er bis zu {max} Gewöhnliche in seine beiden hinteren Reihen (nur in einen freien Platz mit einer Karte davor).",
  "El jefe también tiene tres filas: sus guardias delante, y cada {every} turnos llama hasta {max} Común(es) a sus dos filas traseras (solo a una casilla libre con una carta delante).",
  "Anche il boss ha tre file: le sue guardie davanti, e ogni {every} turni chiama fino a {max} Comune/i nelle sue due file dietro (solo in uno spazio libero con una carta davanti).",
  "O chefe também tem três filas: os guardas à frente, e a cada {every} turnos chama até {max} Comum(ns) para as suas duas filas de trás (só para um espaço livre com uma carta à frente).",
  "May tatlong hanay din ang boss: mga bantay nito sa harap, at tuwing {every} turn ay tumatawag ito ng hanggang {max} Common sa dalawang likurang hanay nito (sa bakanteng puwesto lang na may card sa harap).",
  "பாஸுக்கும் மூன்று வரிசைகள் உண்டு: முன்னால் அதன் காவலர்கள்; ஒவ்வொரு {every} முறையும் அது தன் இரண்டு பின்வரிசைகளுக்கு {max} சாதாரண அட்டைகள் வரை அழைக்கும் (முன்னால் அட்டை உள்ள காலியான இடத்துக்கு மட்டும்).",
  "Bos juga punya tiga baris: para penjaganya di depan, dan setiap {every} giliran ia memanggil hingga {max} kartu Umum ke dua baris belakangnya (hanya ke slot kosong yang ada kartu di depannya).",
  "首领也有三排：前排是它的守卫，每 {every} 回合它会向后两排召来最多 {max} 张普通卡（只放进前面有卡的空位）。",
  "首領也有三排：前排是它的守衛，每 {every} 回合它會向後兩排召來最多 {max} 張普通卡（只放進前面有卡的空位）。",
  "ボスにも3列ある：前列にはその護衛、そして{every}ターンごとに後ろの2列へ最大{max}枚のコモンを呼ぶ（前にカードがある空きマスだけ）。",
  "보스도 세 줄을 둡니다: 앞에는 호위병, 그리고 {every}턴마다 뒤쪽 두 줄에 일반 카드를 최대 {max}장 부릅니다 (앞에 카드가 있는 빈칸에만)."],
"{name} returns in {span}": [
  "{name} revient dans {span}", "{name} kehrt in {span} zurück", "{name} vuelve en {span}", "{name} ritorna tra {span}", "{name} regressa dentro de {span}",
  "Babalik si {name} sa loob ng {span}", "{name} {span} இல் திரும்பும்", "{name} kembali dalam {span}", "{name} 将在 {span} 后归来", "{name} 將在 {span} 後歸來",
  "{name}は{span}後に戻ってくる", "{name}이(가) {span} 후에 돌아옵니다"],
"It returns on {when} (your local time)": [
  "Retour le {when} (heure locale)", "Rückkehr am {when} (deine Ortszeit)", "Vuelve el {when} (tu hora local)", "Ritorna il {when} (ora locale)", "Regressa a {when} (hora local)",
  "Babalik ito sa {when} (lokal mong oras)", "{when} அன்று திரும்பும் (உங்கள் உள்ளூர் நேரம்)", "Kembali pada {when} (waktu setempatmu)", "将于 {when} 归来（你的当地时间）", "將於 {when} 歸來（你的當地時間）",
  "{when}に戻ってくる（現地時間）", "{when}에 돌아옵니다 (현지 시간)"],
"Your row only": [
  "Votre rangée seulement", "Nur deine Reihe", "Solo tu fila", "Solo la tua fila", "Só a tua fila", "Sariling hanay lang", "உங்கள் வரிசை மட்டும்",
  "Hanya barismu", "仅限你的一排", "僅限你的一排", "自分の列だけ", "내 줄만"],
"Anywhere": [
  "N'importe où", "Überall", "En cualquier sitio", "Ovunque", "Em qualquer lado", "Kahit saan", "எங்கும்", "Di mana saja", "任意位置", "任意位置", "どこでも", "어디든"],
"Play rows: your row only. You can't play into your partner's row.": [
  "Rangées de jeu : votre rangée seulement. Vous ne pouvez pas jouer dans la rangée de votre partenaire.",
  "Spielreihen: nur deine Reihe. Du kannst nicht in die Reihe deines Partners spielen.",
  "Filas de juego: solo tu fila. No puedes jugar en la fila de tu compañero.",
  "File di gioco: solo la tua fila. Non puoi giocare nella fila del tuo compagno.",
  "Filas de jogo: só a tua fila. Não podes jogar na fila do teu parceiro.",
  "Hanay na malalaruan: sariling hanay lang. Hindi ka puwedeng maglaro sa hanay ng kapartner mo.",
  "விளையாடும் வரிசைகள்: உங்கள் வரிசை மட்டும். உங்கள் துணையின் வரிசையில் விளையாட முடியாது.",
  "Baris main: hanya barismu. Kamu tidak bisa bermain di baris rekanmu.",
  "出牌排：仅限你的一排。你不能把牌打到搭档的那一排。",
  "出牌排：僅限你的一排。你不能把牌打到搭檔的那一排。",
  "出せる列：自分の列だけ。パートナーの列には出せない。",
  "낼 수 있는 줄: 내 줄만. 파트너의 줄에는 낼 수 없습니다."],
"Play rows: anywhere. You may play into your partner's row too.": [
  "Rangées de jeu : n'importe où. Vous pouvez aussi jouer dans la rangée de votre partenaire.",
  "Spielreihen: überall. Du darfst auch in die Reihe deines Partners spielen.",
  "Filas de juego: en cualquier sitio. También puedes jugar en la fila de tu compañero.",
  "File di gioco: ovunque. Puoi giocare anche nella fila del tuo compagno.",
  "Filas de jogo: em qualquer lado. Também podes jogar na fila do teu parceiro.",
  "Hanay na malalaruan: kahit saan. Puwede ka ring maglaro sa hanay ng kapartner mo.",
  "விளையாடும் வரிசைகள்: எங்கும். உங்கள் துணையின் வரிசையிலும் விளையாடலாம்.",
  "Baris main: di mana saja. Kamu juga boleh bermain di baris rekanmu.",
  "出牌排：任意位置。你也可以把牌打到搭档的那一排。",
  "出牌排：任意位置。你也可以把牌打到搭檔的那一排。",
  "出せる列：どこでも。パートナーの列にも出せる。",
  "낼 수 있는 줄: 어디든. 파트너의 줄에도 낼 수 있습니다."],
}
assert all(len(v) == len(CODES) for v in T.values()), [k for k, v in T.items() if len(v) != len(CODES)]
PLURAL = re.compile(r'^\{(s\d?|plural_\w+)\}$')
ph = lambda s: sorted(set(p for p in re.findall(r'\{\w+\}', s) if not PLURAL.match(p)))
assert all(ph(k) == ph(t) for k, v in T.items() for t in v), [(k, t) for k, v in T.items() for t in v if ph(k) != ph(t)]
assert all(run in t for k, v in T.items() for run in re.findall(r'(?:\{\w+\}){2,}', k) for t in v)
if __name__ == '__main__':
    for i, code in enumerate(CODES):
        path = os.path.join(ROOT, 'lang', code + '.json')
        pack = json.load(open(path, encoding='utf-8')) if os.path.exists(path) else {}
        for en, row in T.items(): pack[en] = row[i]
        with open(path, 'w', encoding='utf-8') as fh:
            json.dump(dict(sorted(pack.items(), key=lambda kv: kv[0].lower())), fh, ensure_ascii=False, indent=1); fh.write('\n')
    print('wrote', len(CODES), 'packs,', len(T), 'strings each')
