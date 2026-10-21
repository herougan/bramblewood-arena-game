#!/usr/bin/env python3
"""Game texts added on 2026-10-21 by package MT (owner 16:33, B15: "Becoming a copy of a random ally card probably 5+. I think for
mirrorhide mutant, they should copy the skills of the card, but their stats = the highest stat of both cards."): the Mimic skill's
name, its short card line, the card view's "Copying <name>" chip and its log line (TX ui.skn-mimic, ui.sk-mimic, ui.mimic-copying,
ui.log-mimic; the log line's leading emoji is peeled, as the page translator does). Same form as tools/i18n_2026_10_21_bf6.py.

    python3 tools/i18n_2026_10_21_mt.py && python3 tools/i18n_refresh.py
"""
import json, os, re
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
CODES = ['fr', 'de', 'es', 'it', 'pt', 'tl', 'ta', 'id', 'zh-Hans', 'zh-Hant', 'ja', 'ko']
T = {
"Mimic": ["Mimétisme", "Nachahmer", "Mímica", "Mimesi", "Mímica", "Gaya", "போலி", "Peniru", "拟态", "擬態", "擬態", "의태"],
"When it enters play, it copies a random ally: its skills, and the higher of each stat.": [
  "Quand il entre en jeu, il copie un allié au hasard : ses compétences, et la plus haute de chaque statistique.",
  "Wenn sie ins Spiel kommt, kopiert sie einen zufälligen Verbündeten: seine Fähigkeiten und jeweils den höheren Wert.",
  "Al entrar en juego, copia a un aliado al azar: sus habilidades y el valor más alto de cada estadística.",
  "Quando entra in gioco, copia un alleato a caso: le sue abilità e il valore più alto di ogni statistica.",
  "Ao entrar em jogo, copia um aliado ao acaso: as suas habilidades e o valor mais alto de cada atributo.",
  "Pagpasok nito sa laro, ginagaya nito ang isang random na kakampi: ang mga kakayahan nito, at ang mas mataas sa bawat stat.",
  "இது ஆட்டத்தில் நுழையும்போது, ஒரு சீரற்ற நட்பு அலகைப் போலியாக்கும்: அதன் திறன்களும், ஒவ்வொரு புள்ளியிலும் அதிகமானதும்.",
  "Saat masuk ke permainan, ia meniru satu sekutu acak: kemampuannya, dan nilai yang lebih tinggi dari tiap stat.",
  "登场时，复制一个随机友方单位：获得其技能，每项属性取两者中较高者。",
  "登場時，複製一個隨機友方單位：獲得其技能，每項屬性取兩者中較高者。",
  "登場時、ランダムな味方1体をコピーする：そのスキルを得て、各ステータスは高い方になる。",
  "등장할 때, 무작위 아군 하나를 복사한다: 그 스킬을 얻고, 각 능력치는 더 높은 쪽이 된다."],
"Copying {name}": ["Copie {name}", "Kopiert {name}", "Copiando a {name}", "Copia {name}", "A copiar {name}", "Ginagaya si {name}",
  "{name} ஐப் போலியாக்குகிறது", "Meniru {name}", "正在复制{name}", "正在複製{name}", "{name}をコピー中", "{name} 복사 중"],
"{name} mimics {ally}: now {atk}/{hp}, with its skills.": [
  "{name} imite {ally} : désormais {atk}/{hp}, avec ses compétences.",
  "{name} ahmt {ally} nach: jetzt {atk}/{hp}, mit dessen Fähigkeiten.",
  "{name} imita a {ally}: ahora {atk}/{hp}, con sus habilidades.",
  "{name} imita {ally}: ora {atk}/{hp}, con le sue abilità.",
  "{name} imita {ally}: agora {atk}/{hp}, com as suas habilidades.",
  "Ginaya ni {name} si {ally}: {atk}/{hp} na ngayon, kasama ang mga kakayahan nito.",
  "{name} {ally} ஐப் போலியாக்குகிறது: இப்போது {atk}/{hp}, அதன் திறன்களுடன்.",
  "{name} meniru {ally}: kini {atk}/{hp}, dengan kemampuannya.",
  "{name}模仿了{ally}：现在为{atk}/{hp}，并拥有其技能。",
  "{name}模仿了{ally}：現在為{atk}/{hp}，並擁有其技能。",
  "{name}が{ally}を擬態：{atk}/{hp}になり、そのスキルを得た。",
  "{name}이(가) {ally}을(를) 의태: 이제 {atk}/{hp}, 그 스킬을 얻었다."],
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
