#!/usr/bin/env python3
"""Package FZ texts (2026-10-19, owner 23:32: "Confuse — 1/2 chance that its triggers, skills and actions fail to activate."):
the Confused gloss (Codex), its coach tip and the battle-log fumble line, in the 12 packs. The English is the TX table's
(bramblewood-texts.js: ui.status-confused, coach.confused-half-the-time-this-card, ui.log-confused-fumbles); the packs are keyed
by that English (a leading emoji is not part of the key). The coach tip's old English is dropped from the packs.
Same rules as i18n_2026_10_18_codexbook.py (every {placeholder} kept).

    python3 tools/i18n_2026_10_19_fz.py
"""
import json, os, re
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
CODES = ['fr', 'de', 'es', 'it', 'pt', 'tl', 'ta', 'id', 'zh-Hans', 'zh-Hant', 'ja', 'ko']
OLD = ["Confused: half the time, this card's triggers and on-hit skills fizzle."]
T = {
"half the time, its triggers, skills and actions fail.": [
  "une fois sur deux, ses déclencheurs, compétences et actions échouent.",
  "in der Hälfte der Fälle scheitern ihre Auslöser, Fähigkeiten und Aktionen.",
  "la mitad de las veces, sus activaciones, habilidades y acciones fallan.",
  "metà delle volte, i suoi innesci, abilità e azioni falliscono.",
  "metade das vezes, os seus gatilhos, habilidades e ações falham.",
  "kalahati ng oras, pumapalya ang mga trigger, skill at aksiyon nito.",
  "பாதி நேரம், அதன் தூண்டல்களும் திறன்களும் செயல்களும் தோல்வியடையும்.",
  "separuh waktu, pemicu, skill, dan aksinya gagal.",
  "有一半几率，它的触发、技能和行动会失败。",
  "有一半機率，它的觸發、技能和行動會失敗。",
  "半分の確率で、発動効果・スキル・行動が失敗する。",
  "절반 확률로 발동 효과, 스킬, 행동이 실패해요."],
"Confused: half the time, its triggers, skills and actions fail.": [
  "Confus : une fois sur deux, ses déclencheurs, compétences et actions échouent.",
  "Verwirrt: In der Hälfte der Fälle scheitern ihre Auslöser, Fähigkeiten und Aktionen.",
  "Confundido: la mitad de las veces, sus activaciones, habilidades y acciones fallan.",
  "Confuso: metà delle volte, i suoi innesci, abilità e azioni falliscono.",
  "Confuso: metade das vezes, os seus gatilhos, habilidades e ações falham.",
  "Nalilito: kalahati ng oras, pumapalya ang mga trigger, skill at aksiyon nito.",
  "குழப்பம்: பாதி நேரம், அதன் தூண்டல்களும் திறன்களும் செயல்களும் தோல்வியடையும்.",
  "Bingung: separuh waktu, pemicu, skill, dan aksinya gagal.",
  "混乱：它的触发、技能和行动有一半几率失败。",
  "混亂：它的觸發、技能和行動有一半機率失敗。",
  "混乱：半分の確率で、発動効果・スキル・行動が失敗します。",
  "혼란: 절반 확률로 발동 효과, 스킬, 행동이 실패해요."],
"{name} is confused and fumbles.": [
  "{name} est désorienté et rate son coup.",
  "{name} ist verwirrt und patzt.",
  "{name} está confundido y falla.",
  "{name} è confuso e sbaglia.",
  "{name} está confuso e falha.",
  "Nalilito si {name} at pumalya.",
  "{name} குழம்பித் தடுமாறுகிறது.",
  "{name} bingung dan gagal.",
  "{name} 陷入混乱，失手了。",
  "{name} 陷入混亂，失手了。",
  "{name}は混乱して失敗した。",
  "{name}이(가) 혼란에 빠져 실수했어요."],
}
assert all(len(v) == len(CODES) for v in T.values()), [k for k, v in T.items() if len(v) != len(CODES)]
ph = lambda s: sorted(set(re.findall(r'\{\w+\}', s)))
assert all(ph(k) == ph(t) for k, v in T.items() for t in v), [(k, t) for k, v in T.items() for t in v if ph(k) != ph(t)]
if __name__ == '__main__':
    for i, code in enumerate(CODES):
        path = os.path.join(ROOT, 'lang', code + '.json')
        pack = json.load(open(path, encoding='utf-8')) if os.path.exists(path) else {}
        # each new row goes in front of the first key that sorts after it; the rows already there keep their order (fewer merge clashes)
        items = [(k, v) for k, v in pack.items() if k not in T and k not in OLD]
        for en, row in T.items():
            at = next((j for j, (k, _) in enumerate(items) if k.lower() > en.lower()), len(items))
            items.insert(at, (en, row[i]))
        with open(path, 'w', encoding='utf-8') as fh:
            json.dump(dict(items), fh, ensure_ascii=False, indent=1); fh.write('\n')
    print('wrote', len(CODES), 'packs,', len(T), 'strings each')
