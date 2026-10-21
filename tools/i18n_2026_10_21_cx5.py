#!/usr/bin/env python3
"""Game texts added on 2026-10-21 by package CX5 (the card editor's budget panel prices skills from canonical/skill-costs.json; a skill
the table has no entry for is named). TX key ui.budget-price-missing. Same form as tools/i18n_2026_10_21_cx2.py.

    python3 tools/i18n_2026_10_21_cx5.py && python3 tools/i18n_refresh.py
"""
import json, os, re
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
CODES = ['fr', 'de', 'es', 'it', 'pt', 'tl', 'ta', 'id', 'zh-Hans', 'zh-Hant', 'ja', 'ko']
T = {
"No price in the skill-cost table for {skills}: a stand-in cost is used.": [
  "Aucun prix dans la table des coûts de compétences pour {skills} : un coût provisoire est utilisé.",
  "Kein Preis in der Fähigkeitskosten-Tabelle für {skills}: Ein Ersatzwert wird verwendet.",
  "Sin precio en la tabla de costes de habilidades para {skills}: se usa un coste provisional.",
  "Nessun prezzo nella tabella dei costi delle abilità per {skills}: si usa un costo provvisorio.",
  "Sem preço na tabela de custos de habilidades para {skills}: é usado um custo provisório.",
  "Walang presyo sa talaan ng halaga ng kakayahan para sa {skills}: pansamantalang halaga ang ginamit.",
  "{skills} க்கு திறன் விலை அட்டவணையில் விலை இல்லை: ஒரு தற்காலிக விலை பயன்படுத்தப்படுகிறது.",
  "Tidak ada harga di tabel biaya kemampuan untuk {skills}: biaya pengganti dipakai.",
  "技能费用表中没有 {skills} 的价格：使用临时费用。",
  "技能費用表中沒有 {skills} 的價格：使用暫定費用。",
  "スキルコスト表に {skills} の価格がありません：仮のコストを使います。",
  "스킬 비용 표에 {skills}의 가격이 없습니다: 임시 비용을 씁니다."],
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
