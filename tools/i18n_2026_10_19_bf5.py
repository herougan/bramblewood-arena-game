#!/usr/bin/env python3
"""Game texts added on 2026-10-19 by package BF5 (owner 21:36: "Can we HALF everything?" ... "Straight up, the total N value"): the budget
panel's line for the scale on the whole N (card editor, Test Lab). Same form as tools/i18n_2026_10_19_bf.py (keys are the English, every
{placeholder} kept, the packs not re-sorted).

    python3 tools/i18n_2026_10_19_bf5.py && python3 tools/i18n_refresh.py
"""
import json, os, re
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
CODES = ['fr', 'de', 'es', 'it', 'pt', 'tl', 'ta', 'id', 'zh-Hans', 'zh-Hant', 'ja', 'ko']
T = {
"No abilities: N × {k}.": [
  "Aucune capacité : N × {k}.", "Keine Fähigkeiten: N × {k}.", "Sin habilidades: N × {k}.", "Nessuna abilità: N × {k}.", "Sem habilidades: N × {k}.",
  "Walang kakayahan: N × {k}.", "திறன்கள் இல்லை: N × {k}.", "Tanpa kemampuan: N × {k}.", "没有能力：N × {k}。", "沒有能力：N × {k}。", "能力なし：N × {k}。", "능력 없음: N × {k}."],
"Only light abilities (Flying, Tide, day and night): N × {k}.": [
  "Seulement des capacités légères (Vol, Marée, jour et nuit) : N × {k}.", "Nur leichte Fähigkeiten (Fliegen, Gezeiten, Tag und Nacht): N × {k}.", "Solo habilidades ligeras (Vuelo, Marea, día y noche): N × {k}.",
  "Solo abilità leggere (Volo, Marea, giorno e notte): N × {k}.", "Só habilidades leves (Voo, Maré, dia e noite): N × {k}.", "Magagaan na kakayahan lang (Lipad, Tubig, araw at gabi): N × {k}.",
  "இலகுவான திறன்கள் மட்டும் (பறத்தல், அலை, பகல் இரவு): N × {k}.", "Hanya kemampuan ringan (Terbang, Pasang, siang dan malam): N × {k}.", "只有轻型能力（飞行、潮汐、昼夜）：N × {k}。",
  "只有輕型能力（飛行、潮汐、晝夜）：N × {k}。", "軽い能力のみ（飛行・潮・昼夜）：N × {k}。", "가벼운 능력만 (비행, 조수, 낮과 밤): N × {k}."],
"Fragile: N × {k}.": [
  "Fragile : N × {k}.", "Zerbrechlich: N × {k}.", "Frágil: N × {k}.", "Fragile: N × {k}.", "Frágil: N × {k}.", "Marupok: N × {k}.", "நொறுங்கக்கூடியது: N × {k}.", "Rapuh: N × {k}.",
  "易碎：N × {k}。", "易碎：N × {k}。", "もろい：N × {k}。", "연약함: N × {k}."],
"N multipliers: no abilities × {plain}, only light abilities × {light}, Fragile × {fragile}.": [
  "Multiplicateurs de N : aucune capacité × {plain}, seulement des capacités légères × {light}, Fragile × {fragile}.", "N-Faktoren: keine Fähigkeiten × {plain}, nur leichte Fähigkeiten × {light}, Zerbrechlich × {fragile}.",
  "Multiplicadores de N: sin habilidades × {plain}, solo habilidades ligeras × {light}, Frágil × {fragile}.", "Moltiplicatori di N: nessuna abilità × {plain}, solo abilità leggere × {light}, Fragile × {fragile}.",
  "Multiplicadores de N: sem habilidades × {plain}, só habilidades leves × {light}, Frágil × {fragile}.", "Mga multiplier ng N: walang kakayahan × {plain}, magagaan lang × {light}, Marupok × {fragile}.",
  "N பெருக்கிகள்: திறன்கள் இல்லை × {plain}, இலகுவானவை மட்டும் × {light}, நொறுங்கக்கூடியது × {fragile}.", "Pengali N: tanpa kemampuan × {plain}, hanya kemampuan ringan × {light}, Rapuh × {fragile}.",
  "N 的倍率：没有能力 × {plain}，只有轻型能力 × {light}，易碎 × {fragile}。", "N 的倍率：沒有能力 × {plain}，只有輕型能力 × {light}，易碎 × {fragile}。",
  "N の倍率：能力なし × {plain}、軽い能力のみ × {light}、もろい × {fragile}。", "N 배율: 능력 없음 × {plain}, 가벼운 능력만 × {light}, 연약함 × {fragile}."],
"Then all of N × {scale}.": [
  "Puis tout N × {scale}.", "Dann das ganze N × {scale}.", "Luego todo N × {scale}.", "Poi tutto N × {scale}.", "Depois todo o N × {scale}.",
  "Pagkatapos, ang buong N × {scale}.", "பிறகு முழு N × {scale}.", "Lalu seluruh N × {scale}.", "然后整个 N × {scale}。", "然後整個 N × {scale}。",
  "その後、N 全体を × {scale}。", "그다음 N 전체 × {scale}."],
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
