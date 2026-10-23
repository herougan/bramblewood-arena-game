#!/usr/bin/env python3
"""Game texts added on 2026-10-23 by package SX (owner H2): the Hero's 3-part XP bar, its rule (the bar's tooltip and a line under
it) and each part's numbers. Same rules as i18n_2026_10_23_lead.py: keys are the English as the page translator sees it, every
{placeholder} is kept, a row a pack already has is left as the pack has it. The numbered-text templates of I2 are moved by
tools/text/templatize_numbers.py, not here.

    python3 tools/i18n_2026_10_23_sx.py && python3 tools/i18n_refresh.py
"""
import json, os, re
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
CODES = ['fr', 'de', 'es', 'it', 'pt', 'tl', 'ta', 'id', 'zh-Hans', 'zh-Hant', 'ja', 'ko']
T = {
"Each level's bar has three parts: Battle XP fills the first, Materia XP the second, and either fills the third. Battle XP put into the third part counts {n}% less.": [
  "La barre de chaque niveau a trois parties : l’XP de combat remplit la première, l’XP de Materia la deuxième, et l’une ou l’autre la troisième. L’XP de combat mise dans la troisième compte {n} % de moins.",
  "Der Balken jeder Stufe hat drei Teile: Kampf-EP füllen den ersten, Materia-EP den zweiten, und beide können den dritten füllen. Kampf-EP im dritten Teil zählen {n} % weniger.",
  "La barra de cada nivel tiene tres partes: la EXP de combate llena la primera, la EXP de Materia la segunda, y cualquiera de las dos la tercera. La EXP de combate en la tercera parte cuenta un {n} % menos.",
  "La barra di ogni livello ha tre parti: i PE di battaglia riempiono la prima, i PE di Materia la seconda, ed entrambi la terza. I PE di battaglia messi nella terza parte valgono il {n}% in meno.",
  "A barra de cada nível tem três partes: a XP de combate enche a primeira, a XP de Materia a segunda, e qualquer uma enche a terceira. A XP de combate posta na terceira parte conta {n}% menos.",
  "May tatlong bahagi ang bar ng bawat level: pinupuno ng Battle XP ang una, ng Materia XP ang ikalawa, at alinman sa dalawa ang ikatlo. Ang Battle XP na inilagay sa ikatlong bahagi ay {n}% na mas kaunti ang bilang.",
  "ஒவ்வொரு நிலையின் பட்டிக்கும் மூன்று பகுதிகள்: போர் XP முதலாவதை நிரப்புகிறது, மெட்டீரியா XP இரண்டாவதை, மூன்றாவதை இரண்டில் எதுவும் நிரப்பலாம். மூன்றாம் பகுதியில் இடப்படும் போர் XP {n}% குறைவாகக் கணக்கிடப்படும்.",
  "Bilah setiap level punya tiga bagian: XP Pertempuran mengisi yang pertama, XP Materia yang kedua, dan keduanya bisa mengisi yang ketiga. XP Pertempuran yang masuk ke bagian ketiga dihitung {n}% lebih sedikit.",
  "每一级的经验条分三段：战斗经验填第一段，魔晶经验填第二段，第三段两者皆可。战斗经验填入第三段时少算 {n}%。",
  "每一級的經驗條分三段：戰鬥經驗填第一段，魔晶經驗填第二段，第三段兩者皆可。戰鬥經驗填入第三段時少算 {n}%。",
  "各レベルのバーは3つに分かれています。1つ目はバトルXP、2つ目はマテリアXP、3つ目はどちらでも埋まります。3つ目に入れたバトルXPは{n}%少なく数えられます。",
  "레벨마다 막대는 세 부분입니다. 첫째는 전투 XP, 둘째는 마테리아 XP, 셋째는 둘 중 아무거나로 채웁니다. 셋째 부분에 넣은 전투 XP는 {n}% 적게 계산됩니다."],
"Battle XP: {n} / {max}": ["XP de combat : {n} / {max}", "Kampf-EP: {n} / {max}", "EXP de combate: {n} / {max}", "PE di battaglia: {n} / {max}", "XP de combate: {n} / {max}",
  "Battle XP: {n} / {max}", "போர் XP: {n} / {max}", "XP Pertempuran: {n} / {max}", "战斗经验：{n} / {max}", "戰鬥經驗：{n} / {max}", "バトルXP：{n} / {max}", "전투 XP: {n} / {max}"],
"Materia XP: {n} / {max}": ["XP de Materia : {n} / {max}", "Materia-EP: {n} / {max}", "EXP de Materia: {n} / {max}", "PE di Materia: {n} / {max}", "XP de Materia: {n} / {max}",
  "Materia XP: {n} / {max}", "மெட்டீரியா XP: {n} / {max}", "XP Materia: {n} / {max}", "魔晶经验：{n} / {max}", "魔晶經驗：{n} / {max}", "マテリアXP：{n} / {max}", "마테리아 XP: {n} / {max}"],
"Battle or Materia XP: {n} / {max} (Materia {m}, Battle {b})": [
  "XP de combat ou de Materia : {n} / {max} (Materia {m}, combat {b})", "Kampf- oder Materia-EP: {n} / {max} (Materia {m}, Kampf {b})",
  "EXP de combate o de Materia: {n} / {max} (Materia {m}, combate {b})", "PE di battaglia o di Materia: {n} / {max} (Materia {m}, battaglia {b})",
  "XP de combate ou de Materia: {n} / {max} (Materia {m}, combate {b})", "Battle o Materia XP: {n} / {max} (Materia {m}, Battle {b})",
  "போர் அல்லது மெட்டீரியா XP: {n} / {max} (மெட்டீரியா {m}, போர் {b})", "XP Pertempuran atau Materia: {n} / {max} (Materia {m}, Pertempuran {b})",
  "战斗或魔晶经验：{n} / {max}（魔晶 {m}，战斗 {b}）", "戰鬥或魔晶經驗：{n} / {max}（魔晶 {m}，戰鬥 {b}）", "バトルかマテリアのXP：{n} / {max}（マテリア {m}、バトル {b}）",
  "전투 또는 마테리아 XP: {n} / {max} (마테리아 {m}, 전투 {b})"],
"+{n} Battle XP waiting for the next level": ["+{n} XP de combat en attente du niveau suivant", "+{n} Kampf-EP warten auf die nächste Stufe", "+{n} EXP de combate esperando al siguiente nivel",
  "+{n} PE di battaglia in attesa del prossimo livello", "+{n} XP de combate à espera do próximo nível", "+{n} Battle XP na naghihintay sa susunod na level",
  "+{n} போர் XP அடுத்த நிலைக்காகக் காத்திருக்கிறது", "+{n} XP Pertempuran menunggu level berikutnya", "+{n} 战斗经验等待下一级", "+{n} 戰鬥經驗等待下一級",
  "+{n} バトルXPが次のレベルを待っています", "+{n} 전투 XP가 다음 레벨을 기다리는 중"],
"+{n} Materia XP waiting for the next level": ["+{n} XP de Materia en attente du niveau suivant", "+{n} Materia-EP warten auf die nächste Stufe", "+{n} EXP de Materia esperando al siguiente nivel",
  "+{n} PE di Materia in attesa del prossimo livello", "+{n} XP de Materia à espera do próximo nível", "+{n} Materia XP na naghihintay sa susunod na level",
  "+{n} மெட்டீரியா XP அடுத்த நிலைக்காகக் காத்திருக்கிறது", "+{n} XP Materia menunggu level berikutnya", "+{n} 魔晶经验等待下一级", "+{n} 魔晶經驗等待下一級",
  "+{n} マテリアXPが次のレベルを待っています", "+{n} 마테리아 XP가 다음 레벨을 기다리는 중"],
}
assert all(len(v) == len(CODES) for v in T.values()), [k for k, v in T.items() if len(v) != len(CODES)]
ph = lambda s: sorted(set(re.findall(r'\{\w+\}', s)))
assert all(ph(k) == ph(t) for k, v in T.items() for t in v), [(k, t) for k, v in T.items() for t in v if ph(k) != ph(t)]
if __name__ == '__main__':
    kept = 0
    for i, code in enumerate(CODES):
        path = os.path.join(ROOT, 'lang', code + '.json')
        ui = os.path.join(ROOT, 'lang', 'ui', code + '.json')
        pack = json.load(open(path, encoding='utf-8')) if os.path.exists(path) else {}
        uipack = json.load(open(ui, encoding='utf-8')) if os.path.exists(ui) else {}
        for en, row in T.items():
            if en in pack or en in uipack: kept += 1; continue  # the pack's own wording stays
            pack[en] = row[i]
        with open(path, 'w', encoding='utf-8') as fh:
            json.dump(pack, fh, ensure_ascii=False, indent=1); fh.write('\n')
    print('wrote', len(CODES), 'packs,', len(T), 'strings each;', kept, 'rows a pack already had were kept')
