#!/usr/bin/env python3
"""Game texts added on 2026-10-19 by package BF (the Forge level curve; owner 09:52: "majors to 4, 7, 10, minor to 2. Then divvy out
strength updates at all levels"): the anvil's "What each level gives" strip (title, help, the big / small step tags, "no change",
its screen-reader label). Keys are the English with the leading emoji peeled, as the page translator sees them; every {placeholder}
is kept. Same caveats as i18n_core.py (Tagalog, Tamil, Japanese and Korean deserve a native read).

    python3 tools/i18n_2026_10_19_bf.py && python3 tools/i18n_refresh.py
"""
import json, os, re
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
CODES = ['fr', 'de', 'es', 'it', 'pt', 'tl', 'ta', 'id', 'zh-Hans', 'zh-Hant', 'ja', 'ko']
T = {
"What each level gives": [
  "Ce que donne chaque niveau", "Was jede Stufe bringt", "Lo que da cada nivel", "Cosa dà ogni livello", "O que cada nível dá", "Ang ibinibigay ng bawat level",
  "ஒவ்வொரு நிலையும் தருவது", "Yang diberikan tiap level", "每级提升", "每級提升", "各レベルで上がる分", "레벨마다 오르는 능력치"],
"Each level adds what this card's stat budget grows by. Levels 4, 7 and 10 are the big steps, Level 2 a smaller one; some levels add nothing.": [
  "Chaque niveau ajoute ce dont grandit le budget de stats de cette carte. Les niveaux 4, 7 et 10 sont les grands paliers, le niveau 2 un plus petit ; certains niveaux n'ajoutent rien.",
  "Jede Stufe fügt hinzu, um wie viel das Wertebudget dieser Karte wächst. Stufen 4, 7 und 10 sind die großen Schritte, Stufe 2 ein kleinerer; manche Stufen bringen nichts.",
  "Cada nivel suma lo que crece el presupuesto de estadísticas de esta carta. Los niveles 4, 7 y 10 son los saltos grandes, el nivel 2 uno menor; algunos niveles no suman nada.",
  "Ogni livello aggiunge quanto cresce il budget di statistiche di questa carta. I livelli 4, 7 e 10 sono i salti grandi, il livello 2 uno più piccolo; alcuni livelli non aggiungono nulla.",
  "Cada nível soma o que o orçamento de atributos desta carta cresce. Os níveis 4, 7 e 10 são os saltos grandes, o nível 2 um menor; alguns níveis não somam nada.",
  "Idinadagdag ng bawat level ang paglaki ng stat budget ng card na ito. Ang Level 4, 7 at 10 ang malalaking hakbang, ang Level 2 ay mas maliit; may mga level na walang dagdag.",
  "ஒவ்வொரு நிலையும் இந்த அட்டையின் புள்ளி வரவு எவ்வளவு வளர்கிறதோ அதைச் சேர்க்கும். நிலைகள் 4, 7, 10 பெரிய படிகள், நிலை 2 சிறியது; சில நிலைகள் எதையும் சேர்க்காது.",
  "Tiap level menambah sebesar pertumbuhan anggaran stat kartu ini. Level 4, 7, dan 10 adalah langkah besar, Level 2 yang lebih kecil; beberapa level tidak menambah apa-apa.",
  "每升一级，增加的是这张卡属性预算的增长量。4、7、10级是大幅提升，2级是小幅提升；有些等级没有变化。",
  "每升一級，增加的是這張卡屬性預算的增長量。4、7、10級是大幅提升，2級是小幅提升；有些等級沒有變化。",
  "各レベルで、このカードのステータス予算が増えた分だけ上がる。レベル4・7・10が大きな上昇、レベル2が小さな上昇。何も上がらないレベルもある。",
  "레벨마다 이 카드의 능력치 예산이 늘어난 만큼 오릅니다. 레벨 4, 7, 10이 큰 상승, 레벨 2가 작은 상승이며, 오르지 않는 레벨도 있습니다."],
"big step": [
  "grand palier", "großer Schritt", "salto grande", "salto grande", "salto grande", "malaking hakbang", "பெரிய படி", "langkah besar", "大幅提升", "大幅提升", "大きな上昇", "큰 상승"],
"small step": [
  "petit palier", "kleiner Schritt", "salto pequeño", "salto piccolo", "salto pequeno", "maliit na hakbang", "சிறிய படி", "langkah kecil", "小幅提升", "小幅提升", "小さな上昇", "작은 상승"],
"no change": [
  "aucun changement", "keine Änderung", "sin cambio", "nessun cambiamento", "sem mudança", "walang pagbabago", "மாற்றம் இல்லை", "tidak berubah", "无变化", "無變化", "変化なし", "변화 없음"],
"Stat gains from level {from} to level {to}": [
  "Gains de stats du niveau {from} au niveau {to}", "Wertezuwächse von Stufe {from} bis Stufe {to}", "Mejoras de estadísticas del nivel {from} al {to}",
  "Aumenti di statistiche dal livello {from} al {to}", "Ganhos de atributos do nível {from} ao {to}", "Dagdag na stat mula level {from} hanggang level {to}",
  "நிலை {from} முதல் நிலை {to} வரை புள்ளி உயர்வுகள்", "Kenaikan stat dari level {from} sampai level {to}", "从 {from} 级到 {to} 级的属性提升",
  "從 {from} 級到 {to} 級的屬性提升", "レベル {from} から {to} までのステータス上昇", "레벨 {from}부터 {to}까지의 능력치 상승"],
}
assert all(len(v) == len(CODES) for v in T.values()), [k for k, v in T.items() if len(v) != len(CODES)]
ph = lambda s: sorted(set(re.findall(r'\{\w+\}', s)))
assert all(ph(k) == ph(t) for k, v in T.items() for t in v), [(k, t) for k, v in T.items() for t in v if ph(k) != ph(t)]
if __name__ == '__main__':
    for i, code in enumerate(CODES):
        path = os.path.join(ROOT, 'lang', code + '.json')
        items = list((json.load(open(path, encoding='utf-8')) if os.path.exists(path) else {}).items())
        for en, row in T.items():  # in place, without re-sorting the pack (other packages' lines stay where they are)
            j = next((j for j, (k, _) in enumerate(items) if k == en), None)
            if j is not None: items[j] = (en, row[i]); continue
            items.insert(next((j for j, (k, _) in enumerate(items) if k.lower() > en.lower()), len(items)), (en, row[i]))
        with open(path, 'w', encoding='utf-8') as fh:
            json.dump(dict(items), fh, ensure_ascii=False, indent=1); fh.write('\n')
    print('wrote', len(CODES), 'packs,', len(T), 'strings each')
