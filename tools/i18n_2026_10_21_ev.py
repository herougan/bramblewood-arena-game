#!/usr/bin/env python3
"""Game texts added on 2026-10-21 by package EV (the Evolute archetype for Evomax; owner 17:42 / 17:49, docs/evolute-design-2026-10-21.md):
the names and short card lines of Evolute, Evolute Alpha, Evolute Omega, Stem (plain and with braces) and Chrysalis, the stack's tooltip,
the evolve log line (its leading emoji peeled, as the page translator does), the "play it onto a lit unit" hint and the hand card's
"no base" reason (TX ui.skn-evolute ... ui.evo-no-base). Same form as tools/i18n_2026_10_21_mt.py.

    python3 tools/i18n_2026_10_21_ev.py && python3 tools/i18n_refresh.py
"""
import json, os, re
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
CODES = ['fr', 'de', 'es', 'it', 'pt', 'tl', 'ta', 'id', 'zh-Hans', 'zh-Hant', 'ja', 'ko']
T = {
"Evolute": ["Évolute", "Evolut", "Evoluto", "Evoluto", "Evoluto", "Evolute", "எவால்யூட்", "Evolut", "进化体", "進化體", "エボリュート", "에볼루트"],
"Evolute Alpha": ["Évolute Alpha", "Evolut Alpha", "Evoluto Alfa", "Evoluto Alfa", "Evoluto Alfa", "Evolute Alpha", "எவால்யூட் ஆல்ஃபா", "Evolut Alfa",
  "进化体·阿尔法", "進化體·阿爾法", "エボリュート・アルファ", "에볼루트 알파"],
"Evolute Omega": ["Évolute Oméga", "Evolut Omega", "Evoluto Omega", "Evoluto Omega", "Evoluto Ômega", "Evolute Omega", "எவால்யூட் ஒமேகா", "Evolut Omega",
  "进化体·欧米伽", "進化體·歐米伽", "エボリュート・オメガ", "에볼루트 오메가"],
"Stem": ["Souche", "Stamm", "Tallo", "Stelo", "Caule", "Tangkay", "தண்டு", "Batang", "幼苗", "幼苗", "幼体", "줄기"],
"Chrysalis": ["Chrysalide", "Puppe", "Crisálida", "Crisalide", "Crisálida", "Kukun", "கூட்டுப்புழு", "Kepompong", "蛹", "蛹", "さなぎ", "번데기"],
"Play it onto your unit of a shared type: it adds that unit's stats and keeps its statuses.": [
  "Jouez-la sur une de vos unités d'un type commun : elle ajoute les stats de cette unité et garde ses états.",
  "Spiele sie auf eine deiner Einheiten mit gemeinsamem Typ: Sie addiert deren Werte und behält ihre Zustände.",
  "Juégala sobre una unidad tuya de un tipo compartido: suma las estadísticas de esa unidad y conserva sus estados.",
  "Giocala su una tua unità di un tipo in comune: aggiunge le statistiche di quell'unità e ne mantiene gli stati.",
  "Joga-a sobre uma unidade tua de um tipo em comum: soma os atributos dessa unidade e mantém os seus estados.",
  "Ilaro ito sa isang yunit mo na may kaparehong uri: idinadagdag nito ang stats ng yunit na iyon at pinananatili ang mga status nito.",
  "பொதுவான வகை கொண்ட உங்கள் அலகின் மீது இதை ஆடுங்கள்: அந்த அலகின் புள்ளிகளைச் சேர்த்து, அதன் நிலைகளை வைத்துக்கொள்ளும்.",
  "Mainkan ke unitmu yang berbagi tipe: ia menambahkan stat unit itu dan mempertahankan statusnya.",
  "打在你的一个同类型单位上：加上该单位的属性，并保留其状态。",
  "打在你的一個同類型單位上：加上該單位的屬性，並保留其狀態。",
  "共通のタイプを持つ自分のユニットの上にプレイする：そのユニットのステータスを加え、状態も引き継ぐ。",
  "같은 유형을 공유하는 내 유닛 위에 낸다: 그 유닛의 능력치를 더하고 상태를 이어받는다."],
"Play it onto your Evolute unit, or a Chrysalis, of a shared type. It adds that unit's stats.": [
  "Jouez-la sur votre unité Évolute, ou une Chrysalide, d'un type commun. Elle ajoute les stats de cette unité.",
  "Spiele sie auf deine Evolut-Einheit oder eine Puppe mit gemeinsamem Typ. Sie addiert deren Werte.",
  "Juégala sobre tu unidad Evoluto, o una Crisálida, de un tipo compartido. Suma las estadísticas de esa unidad.",
  "Giocala sulla tua unità Evoluto, o una Crisalide, di un tipo in comune. Aggiunge le statistiche di quell'unità.",
  "Joga-a sobre a tua unidade Evoluto, ou uma Crisálida, de um tipo em comum. Soma os atributos dessa unidade.",
  "Ilaro ito sa iyong yunit na Evolute, o sa isang Kukun, na may kaparehong uri. Idinadagdag nito ang stats ng yunit na iyon.",
  "பொதுவான வகை கொண்ட உங்கள் எவால்யூட் அலகு அல்லது கூட்டுப்புழுவின் மீது இதை ஆடுங்கள். அந்த அலகின் புள்ளிகளைச் சேர்க்கும்.",
  "Mainkan ke unit Evolut-mu, atau Kepompong, yang berbagi tipe. Ia menambahkan stat unit itu.",
  "打在你的同类型进化体单位或蛹上。加上该单位的属性。",
  "打在你的同類型進化體單位或蛹上。加上該單位的屬性。",
  "共通のタイプを持つ自分のエボリュートのユニットか、さなぎの上にプレイする。そのユニットのステータスを加える。",
  "같은 유형을 공유하는 내 에볼루트 유닛이나 번데기 위에 낸다. 그 유닛의 능력치를 더한다."],
"Play it onto your Evolute Alpha unit of a shared type. It adds that unit's stats.": [
  "Jouez-la sur votre unité Évolute Alpha d'un type commun. Elle ajoute les stats de cette unité.",
  "Spiele sie auf deine Evolut-Alpha-Einheit mit gemeinsamem Typ. Sie addiert deren Werte.",
  "Juégala sobre tu unidad Evoluto Alfa de un tipo compartido. Suma las estadísticas de esa unidad.",
  "Giocala sulla tua unità Evoluto Alfa di un tipo in comune. Aggiunge le statistiche di quell'unità.",
  "Joga-a sobre a tua unidade Evoluto Alfa de um tipo em comum. Soma os atributos dessa unidade.",
  "Ilaro ito sa iyong yunit na Evolute Alpha na may kaparehong uri. Idinadagdag nito ang stats ng yunit na iyon.",
  "பொதுவான வகை கொண்ட உங்கள் எவால்யூட் ஆல்ஃபா அலகின் மீது இதை ஆடுங்கள். அந்த அலகின் புள்ளிகளைச் சேர்க்கும்.",
  "Mainkan ke unit Evolut Alfa-mu yang berbagi tipe. Ia menambahkan stat unit itu.",
  "打在你的同类型进化体·阿尔法单位上。加上该单位的属性。",
  "打在你的同類型進化體·阿爾法單位上。加上該單位的屬性。",
  "共通のタイプを持つ自分のエボリュート・アルファのユニットの上にプレイする。そのユニットのステータスを加える。",
  "같은 유형을 공유하는 내 에볼루트 알파 유닛 위에 낸다. 그 유닛의 능력치를 더한다."],
"An evolute played onto it gains +1/+2.": [
  "Une évolute jouée sur elle gagne +1/+2.", "Ein auf sie gespielter Evolut erhält +1/+2.", "Un evoluto jugado sobre ella gana +1/+2.",
  "Un evoluto giocato su di essa ottiene +1/+2.", "Um evoluto jogado sobre ela ganha +1/+2.", "Ang evolute na inilaro rito ay nagkakaroon ng +1/+2.",
  "இதன் மீது ஆடப்படும் எவால்யூட் +1/+2 பெறும்.", "Evolut yang dimainkan ke atasnya mendapat +1/+2.", "打在它上面的进化体获得+1/+2。",
  "打在它上面的進化體獲得+1/+2。", "この上にプレイされたエボリュートは+1/+2を得る。", "이 위에 낸 에볼루트는 +1/+2를 얻는다."],
"An evolute played onto it gains {skills}.": [
  "Une évolute jouée sur elle gagne {skills}.", "Ein auf sie gespielter Evolut erhält {skills}.", "Un evoluto jugado sobre ella gana {skills}.",
  "Un evoluto giocato su di essa ottiene {skills}.", "Um evoluto jogado sobre ela ganha {skills}.", "Ang evolute na inilaro rito ay nagkakaroon ng {skills}.",
  "இதன் மீது ஆடப்படும் எவால்யூட் {skills} பெறும்.", "Evolut yang dimainkan ke atasnya mendapat {skills}.", "打在它上面的进化体获得{skills}。",
  "打在它上面的進化體獲得{skills}。", "この上にプレイされたエボリュートは{skills}を得る。", "이 위에 낸 에볼루트는 {skills}을(를) 얻는다."],
"A Stem an Evolute Alpha can be played straight onto. The evolute gains +1/+2.": [
  "Une Souche sur laquelle une Évolute Alpha peut être jouée directement. L'évolute gagne +1/+2.",
  "Ein Stamm, auf den ein Evolut Alpha direkt gespielt werden kann. Der Evolut erhält +1/+2.",
  "Un Tallo sobre el que se puede jugar directamente un Evoluto Alfa. El evoluto gana +1/+2.",
  "Uno Stelo su cui si può giocare direttamente un Evoluto Alfa. L'evoluto ottiene +1/+2.",
  "Um Caule sobre o qual se pode jogar diretamente um Evoluto Alfa. O evoluto ganha +1/+2.",
  "Isang Tangkay na maaaring lapagan agad ng Evolute Alpha. Nagkakaroon ang evolute ng +1/+2.",
  "எவால்யூட் ஆல்ஃபாவை நேரடியாக மீது ஆடக்கூடிய ஒரு தண்டு. அந்த எவால்யூட் +1/+2 பெறும்.",
  "Batang yang bisa langsung ditimpa Evolut Alfa. Evolut itu mendapat +1/+2.",
  "可让进化体·阿尔法直接打在其上的幼苗。该进化体获得+1/+2。",
  "可讓進化體·阿爾法直接打在其上的幼苗。該進化體獲得+1/+2。",
  "エボリュート・アルファを直接上にプレイできる幼体。そのエボリュートは+1/+2を得る。",
  "에볼루트 알파를 바로 위에 낼 수 있는 줄기. 그 에볼루트는 +1/+2를 얻는다."],
"A Stem an Evolute Alpha can be played straight onto. The evolute gains {skills}.": [
  "Une Souche sur laquelle une Évolute Alpha peut être jouée directement. L'évolute gagne {skills}.",
  "Ein Stamm, auf den ein Evolut Alpha direkt gespielt werden kann. Der Evolut erhält {skills}.",
  "Un Tallo sobre el que se puede jugar directamente un Evoluto Alfa. El evoluto gana {skills}.",
  "Uno Stelo su cui si può giocare direttamente un Evoluto Alfa. L'evoluto ottiene {skills}.",
  "Um Caule sobre o qual se pode jogar diretamente um Evoluto Alfa. O evoluto ganha {skills}.",
  "Isang Tangkay na maaaring lapagan agad ng Evolute Alpha. Nagkakaroon ang evolute ng {skills}.",
  "எவால்யூட் ஆல்ஃபாவை நேரடியாக மீது ஆடக்கூடிய ஒரு தண்டு. அந்த எவால்யூட் {skills} பெறும்.",
  "Batang yang bisa langsung ditimpa Evolut Alfa. Evolut itu mendapat {skills}.",
  "可让进化体·阿尔法直接打在其上的幼苗。该进化体获得{skills}。",
  "可讓進化體·阿爾法直接打在其上的幼苗。該進化體獲得{skills}。",
  "エボリュート・アルファを直接上にプレイできる幼体。そのエボリュートは{skills}を得る。",
  "에볼루트 알파를 바로 위에 낼 수 있는 줄기. 그 에볼루트는 {skills}을(를) 얻는다."],
"Stack of {n}: {cards}": ["Pile de {n} : {cards}", "Stapel aus {n}: {cards}", "Pila de {n}: {cards}", "Pila di {n}: {cards}", "Pilha de {n}: {cards}",
  "Patong ng {n}: {cards}", "{n} அட்டைகளின் அடுக்கு: {cards}", "Tumpukan {n}: {cards}", "{n}张叠放：{cards}", "{n}張疊放：{cards}", "{n}枚のスタック：{cards}", "{n}장 스택: {cards}"],
"{name} evolves over {base}: now {atk}/{hp}.": [
  "{name} évolue sur {base} : désormais {atk}/{hp}.", "{name} entwickelt sich über {base}: jetzt {atk}/{hp}.", "{name} evoluciona sobre {base}: ahora {atk}/{hp}.",
  "{name} evolve su {base}: ora {atk}/{hp}.", "{name} evolui sobre {base}: agora {atk}/{hp}.", "Nag-evolve si {name} sa ibabaw ni {base}: {atk}/{hp} na ngayon.",
  "{name} {base} மீது பரிணமிக்கிறது: இப்போது {atk}/{hp}.", "{name} berevolusi di atas {base}: kini {atk}/{hp}.", "{name}在{base}之上进化：现在为{atk}/{hp}。",
  "{name}在{base}之上進化：現在為{atk}/{hp}。", "{name}が{base}の上で進化：{atk}/{hp}になった。", "{name}이(가) {base} 위에서 진화: 이제 {atk}/{hp}."],
"Play {name} onto one of your lit units.": [
  "Jouez {name} sur une de vos unités en surbrillance.", "Spiele {name} auf eine deiner hervorgehobenen Einheiten.", "Juega {name} sobre una de tus unidades iluminadas.",
  "Gioca {name} su una delle tue unità evidenziate.", "Joga {name} sobre uma das tuas unidades em destaque.", "Ilaro si {name} sa isa sa mga yunit mong may ilaw.",
  "{name} ஐ ஒளிரும் உங்கள் அலகுகளில் ஒன்றின் மீது ஆடுங்கள்.", "Mainkan {name} ke salah satu unitmu yang menyala.", "把{name}打在你一个发光的单位上。",
  "把{name}打在你一個發光的單位上。", "{name}は光っている自分のユニットの上にプレイしてください。", "{name}을(를) 빛나는 내 유닛 중 하나 위에 내세요."],
"Needs a unit of yours it can evolve over": [
  "Il faut une de vos unités sur laquelle évoluer", "Braucht eine deiner Einheiten, über die es sich entwickeln kann", "Necesita una unidad tuya sobre la que evolucionar",
  "Serve una tua unità su cui evolversi", "Precisa de uma unidade tua sobre a qual evoluir", "Kailangan ng yunit mong maaari nitong pag-evolve-an",
  "இது பரிணமிக்கக்கூடிய உங்கள் அலகு ஒன்று தேவை", "Butuh unitmu yang bisa ia timpa untuk berevolusi", "需要一个可供它进化的己方单位",
  "需要一個可供它進化的己方單位", "進化先にできる自分のユニットが必要", "진화할 수 있는 내 유닛이 필요하다"],
}
assert all(len(v) == len(CODES) for v in T.values())
ph = lambda s: sorted(set(re.findall(r'\{\w+\}', s)))
assert all(ph(k) == ph(t) for k, v in T.items() for t in v)
if __name__ == '__main__':
    for i, code in enumerate(CODES):
        path = os.path.join(ROOT, 'lang', code + '.json')
        items = list((json.load(open(path, encoding='utf-8')) if os.path.exists(path) else {}).items())
        for en, row in T.items():
            j = next((j for j, (k, _) in enumerate(items) if k == en), None)
            if j is not None: items[j] = (en, row[i]); continue
            items.insert(next((j for j, (k, _) in enumerate(items) if k.lower() > en.lower()), len(items)), (en, row[i]))
        with open(path, 'w', encoding='utf-8') as fh:
            json.dump(dict(items), fh, ensure_ascii=False, indent=1); fh.write('\n')
    print('wrote', len(CODES), 'packs,', len(T), 'strings each')
