#!/usr/bin/env python3
"""Game texts added on 2026-10-18 that the packs didn't cover yet, part H (2026-10-18, the Goliath raid's row and column Tentacle
Smacks, owner 15:56: "there are row-based smacks and column-based smacks. Column-based smacks weight columns by number of units in
that column."): the battle-log lines for a column smack, a row smack on each of your three rows and a smack that finds nobody, and
the raid screen's attack tooltip. The rules for a template row are those of i18n_2026_10_18d.py (every {placeholder} kept, the
English plural ending {s} may be dropped, side-by-side placeholders kept side by side and in order). Keys are the English with the
leading emoji peeled, as the page translator sees them. The bramble's word follows the packs (roncier, Dornenhecke, zarzal...).
Same caveats as i18n_core.py (Tagalog, Tamil, Japanese and Korean deserve a native read).

    python3 tools/i18n_2026_10_18h.py && python3 tools/i18n_refresh.py
"""
import json, os, re
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
CODES = ['fr', 'de', 'es', 'it', 'pt', 'tl', 'ta', 'id', 'zh-Hans', 'zh-Hant', 'ja', 'ko']
T = {
"{name} slams down a column: {dmg} damage to each of your {hits} unit{s} in it.": [
  "{name} s’abat sur une colonne : {dmg} dégâts à chacune de vos {hits} unités qui s’y trouvent.",
  "{name} kracht eine Spalte hinab: {dmg} Schaden an jeder deiner {hits} Einheiten darin.",
  "{name} golpea una columna: {dmg} de daño a cada una de tus {hits} unidades en ella.",
  "{name} si abbatte su una colonna: {dmg} danni a ciascuna delle tue {hits} unità al suo interno.",
  "{name} abate-se sobre uma coluna: {dmg} de dano a cada uma das tuas {hits} unidades nela.",
  "Hinampas ng {name} ang isang hanay: {dmg} pinsala sa bawat isa sa {hits} mong unit doon.",
  "{name} ஒரு நெடுவரிசையில் ஓங்கி அறைகிறது: அதிலுள்ள உங்கள் {hits} அலகுகள் ஒவ்வொன்றுக்கும் {dmg} சேதம்.",
  "{name} menghantam satu kolom: {dmg} kerusakan ke tiap {hits} unitmu di sana.",
  "{name}砸向一整列：该列你的{hits}个单位各受到{dmg}点伤害。",
  "{name}砸向一整列：該列你的{hits}個單位各受到{dmg}點傷害。",
  "{name}が列を叩きつける：その列のあなたのユニット{hits}体それぞれに{dmg}ダメージ。",
  "{name}이(가) 한 열을 내리친다: 그 열의 내 유닛 {hits}개에 각각 {dmg} 피해."],
"{name} sweeps across your front row: {dmg} damage to each of your {hits} unit{s} there.": [
  "{name} balaie votre première ligne : {dmg} dégâts à chacune de vos {hits} unités qui s’y trouvent.",
  "{name} fegt über deine vordere Reihe: {dmg} Schaden an jeder deiner {hits} Einheiten dort.",
  "{name} barre tu fila delantera: {dmg} de daño a cada una de tus {hits} unidades allí.",
  "{name} spazza la tua prima fila: {dmg} danni a ciascuna delle tue {hits} unità lì.",
  "{name} varre a tua fila da frente: {dmg} de dano a cada uma das tuas {hits} unidades ali.",
  "Hinagupit ng {name} ang iyong harapang hilera: {dmg} pinsala sa bawat isa sa {hits} mong unit doon.",
  "{name} உங்கள் முன் வரிசை முழுதும் சுழற்றி அடிக்கிறது: அங்குள்ள உங்கள் {hits} அலகுகள் ஒவ்வொன்றுக்கும் {dmg} சேதம்.",
  "{name} menyapu barisan depanmu: {dmg} kerusakan ke tiap {hits} unitmu di sana.",
  "{name}横扫你的前排：那里你的{hits}个单位各受到{dmg}点伤害。",
  "{name}橫掃你的前排：那裡你的{hits}個單位各受到{dmg}點傷害。",
  "{name}があなたの前列をなぎ払う：そこにいるユニット{hits}体それぞれに{dmg}ダメージ。",
  "{name}이(가) 내 앞줄을 휩쓴다: 그곳의 내 유닛 {hits}개에 각각 {dmg} 피해."],
"{name} reaches past your front row and sweeps your middle row: {dmg} damage to each of your {hits} unit{s} there.": [
  "{name} passe par-dessus votre première ligne et balaie votre ligne du milieu : {dmg} dégâts à chacune de vos {hits} unités qui s’y trouvent.",
  "{name} greift über deine vordere Reihe hinweg und fegt über deine mittlere Reihe: {dmg} Schaden an jeder deiner {hits} Einheiten dort.",
  "{name} pasa por encima de tu fila delantera y barre tu fila central: {dmg} de daño a cada una de tus {hits} unidades allí.",
  "{name} supera la tua prima fila e spazza la fila centrale: {dmg} danni a ciascuna delle tue {hits} unità lì.",
  "{name} passa por cima da tua fila da frente e varre a fila do meio: {dmg} de dano a cada uma das tuas {hits} unidades ali.",
  "Lumampas ang {name} sa iyong harapang hilera at hinagupit ang gitnang hilera: {dmg} pinsala sa bawat isa sa {hits} mong unit doon.",
  "{name} உங்கள் முன் வரிசையைத் தாண்டி நடு வரிசையைச் சுழற்றி அடிக்கிறது: அங்குள்ள உங்கள் {hits} அலகுகள் ஒவ்வொன்றுக்கும் {dmg} சேதம்.",
  "{name} melewati barisan depanmu dan menyapu barisan tengah: {dmg} kerusakan ke tiap {hits} unitmu di sana.",
  "{name}越过你的前排，横扫中排：那里你的{hits}个单位各受到{dmg}点伤害。",
  "{name}越過你的前排，橫掃中排：那裡你的{hits}個單位各受到{dmg}點傷害。",
  "{name}が前列を越えて中列をなぎ払う：そこにいるユニット{hits}体それぞれに{dmg}ダメージ。",
  "{name}이(가) 앞줄을 넘어 가운데 줄을 휩쓴다: 그곳의 내 유닛 {hits}개에 각각 {dmg} 피해."],
"{name} reaches past your front rows and sweeps your back row: {dmg} damage to each of your {hits} unit{s} there.": [
  "{name} passe par-dessus vos lignes avant et balaie votre dernière ligne : {dmg} dégâts à chacune de vos {hits} unités qui s’y trouvent.",
  "{name} greift über deine vorderen Reihen hinweg und fegt über deine hintere Reihe: {dmg} Schaden an jeder deiner {hits} Einheiten dort.",
  "{name} pasa por encima de tus filas delanteras y barre tu fila trasera: {dmg} de daño a cada una de tus {hits} unidades allí.",
  "{name} supera le tue file davanti e spazza l’ultima fila: {dmg} danni a ciascuna delle tue {hits} unità lì.",
  "{name} passa por cima das tuas filas da frente e varre a fila de trás: {dmg} de dano a cada uma das tuas {hits} unidades ali.",
  "Lumampas ang {name} sa iyong mga unahang hilera at hinagupit ang likurang hilera: {dmg} pinsala sa bawat isa sa {hits} mong unit doon.",
  "{name} உங்கள் முன் வரிசைகளைத் தாண்டி பின் வரிசையைச் சுழற்றி அடிக்கிறது: அங்குள்ள உங்கள் {hits} அலகுகள் ஒவ்வொன்றுக்கும் {dmg} சேதம்.",
  "{name} melewati barisan depanmu dan menyapu barisan belakang: {dmg} kerusakan ke tiap {hits} unitmu di sana.",
  "{name}越过你的前面几排，横扫后排：那里你的{hits}个单位各受到{dmg}点伤害。",
  "{name}越過你的前面幾排，橫掃後排：那裡你的{hits}個單位各受到{dmg}點傷害。",
  "{name}が前の列を越えて後列をなぎ払う：そこにいるユニット{hits}体それぞれに{dmg}ダメージ。",
  "{name}이(가) 앞쪽 줄들을 넘어 뒷줄을 휩쓴다: 그곳의 내 유닛 {hits}개에 각각 {dmg} 피해."],
"{name} lands where none of your units stand: {dmg} damage to your bramble.": [
  "{name} frappe là où aucune de vos unités ne se tient : {dmg} dégâts à votre roncier.",
  "{name} trifft dort, wo keine deiner Einheiten steht: {dmg} Schaden an deiner Dornenhecke.",
  "{name} cae donde no hay ninguna de tus unidades: {dmg} de daño a tu zarzal.",
  "{name} colpisce dove non c’è nessuna delle tue unità: {dmg} danni al tuo rovo.",
  "{name} cai onde não está nenhuma das tuas unidades: {dmg} de dano ao teu silvado.",
  "Tumama ang {name} kung saan walang unit mo: {dmg} pinsala sa iyong dawag.",
  "உங்கள் அலகுகள் எதுவும் இல்லாத இடத்தில் {name} விழுகிறது: உங்கள் முட்புதருக்கு {dmg} சேதம்.",
  "{name} mendarat di tempat tanpa unitmu: {dmg} kerusakan ke semakmu.",
  "{name}落在你没有单位的地方：你的荆棘丛受到{dmg}点伤害。",
  "{name}落在你沒有單位的地方：你的荊棘叢受到{dmg}點傷害。",
  "{name}はあなたのユニットがいない所に落ちた：あなたのいばらに{dmg}ダメージ。",
  "{name}이(가) 내 유닛이 없는 곳에 떨어졌다: 내 덤불에 {dmg} 피해."],
"Its telegraphed attacks: the row or column about to be smacked glows red the round before": [
  "Ses attaques annoncées : la ligne ou la colonne sur le point d’être frappée rougeoie le tour d’avant",
  "Seine angekündigten Angriffe: Die Reihe oder Spalte, die gleich getroffen wird, glüht eine Runde vorher rot",
  "Sus ataques anunciados: la fila o columna que va a recibir el golpe brilla en rojo la ronda anterior",
  "I suoi attacchi annunciati: la fila o la colonna che sta per essere colpita si illumina di rosso il turno prima",
  "Os seus ataques anunciados: a fila ou coluna prestes a ser atingida brilha a vermelho na ronda anterior",
  "Ang mga ibinababalang atake nito: kumikinang na pula ang hilera o hanay na hahampasin, isang round bago nito",
  "அதன் முன்னறிவிக்கப்பட்ட தாக்குதல்கள்: அடிபடவிருக்கும் வரிசை அல்லது நெடுவரிசை முந்தைய சுற்றில் சிவப்பாக ஒளிரும்",
  "Serangan yang diperingatkannya: barisan atau kolom yang akan dihantam menyala merah satu ronde sebelumnya",
  "它预告的攻击：即将被砸中的那一排或那一列会在前一回合亮起红光",
  "它預告的攻擊：即將被砸中的那一排或那一列會在前一回合亮起紅光",
  "予告される攻撃：叩かれる行または列が、その前のラウンドに赤く光る",
  "예고되는 공격: 곧 맞을 줄이나 열이 한 라운드 전에 붉게 빛난다"],
}
assert all(len(v) == len(CODES) for v in T.values()), [k for k, v in T.items() if len(v) != len(CODES)]
PLURAL = re.compile(r'^\{(s\d?|plural_\w+)\}$')
ph = lambda s: sorted(set(p for p in re.findall(r'\{\w+\}', s) if not PLURAL.match(p)))
assert all(ph(k) == ph(t) for k, v in T.items() for t in v), [(k, t) for k, v in T.items() for t in v if ph(k) != ph(t)]
# placeholders side by side in the key stay side by side, in order ("{n}{where}")
assert all(run in t for k, v in T.items() for run in re.findall(r'(?:\{\w+\}){2,}', k) for t in v)
if __name__ == '__main__':
    for i, code in enumerate(CODES):
        path = os.path.join(ROOT, 'lang', code + '.json')
        pack = json.load(open(path, encoding='utf-8')) if os.path.exists(path) else {}
        for en, row in T.items(): pack[en] = row[i]
        with open(path, 'w', encoding='utf-8') as fh:
            json.dump(dict(sorted(pack.items(), key=lambda kv: kv[0].lower())), fh, ensure_ascii=False, indent=1); fh.write('\n')
    print('wrote', len(CODES), 'packs,', len(T), 'strings each')
