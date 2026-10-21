#!/usr/bin/env python3
"""Game texts added on 2026-10-21 by package BF6 (owner: "New ability: Injured N: comes in with damage already on it (can be healed). This
counts as -N x 0.99."): the skill's name and its short card line (TX ui.skn-injured, ui.sk-injured). Same form as
tools/i18n_2026_10_19_bf5.py (keys are the English, every {placeholder} kept, the packs not re-sorted).

    python3 tools/i18n_2026_10_21_bf6.py && python3 tools/i18n_refresh.py
"""
import json, os, re
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
CODES = ['fr', 'de', 'es', 'it', 'pt', 'tl', 'ta', 'id', 'zh-Hans', 'zh-Hant', 'ja', 'ko']
T = {
"Injured": ["Blessé", "Verletzt", "Herido", "Ferito", "Ferido", "Sugatan", "காயமுற்றது", "Terluka", "受伤", "受傷", "負傷", "부상"],
"Comes into play with {n} damage already on it (at least 1 Health left). It can be healed.": [
  "Entre en jeu avec déjà {n} dégâts (il garde au moins 1 Santé). Il peut être soigné.",
  "Kommt mit bereits {n} Schaden ins Spiel (mindestens 1 Leben bleibt). Es kann geheilt werden.",
  "Entra en juego con {n} de daño ya encima (le queda al menos 1 de Salud). Se puede curar.",
  "Entra in gioco con già {n} danni addosso (gli resta almeno 1 Salute). Può essere curato.",
  "Entra em jogo já com {n} de dano (fica com pelo menos 1 de Vida). Pode ser curado.",
  "Pumapasok sa laro na may {n} pinsala na (may natitirang hindi bababa sa 1 Buhay). Maaari itong pagalingin.",
  "ஏற்கனவே {n} சேதத்துடன் ஆட்டத்தில் நுழைகிறது (குறைந்தது 1 உயிர் மீதமிருக்கும்). அதைக் குணப்படுத்தலாம்.",
  "Masuk ke permainan dengan {n} kerusakan yang sudah ada (tersisa minimal 1 Nyawa). Bisa disembuhkan.",
  "登场时已带有 {n} 点伤害（至少保留 1 点生命）。可以被治疗。",
  "登場時已帶有 {n} 點傷害（至少保留 1 點生命）。可以被治療。",
  "すでに {n} ダメージを受けた状態で登場する（体力は最低 1 残る）。回復できる。",
  "이미 {n} 피해를 입은 채로 등장한다 (체력은 최소 1 남는다). 회복할 수 있다."],
# owner 15:15: "Rally: temporary increase in attack. War Banner: passive increase in attack while this unit is present."
"Rally": ["Ralliement", "Sammeln", "Arenga", "Adunata", "Ânimo", "Pagtitipon", "அணிதிரட்டல்", "Seruan", "集结", "集結", "鼓舞", "집결"],
"When it enters play, your units on the field gain +{n} Attack until the end of the next round.": [
  "Quand il entre en jeu, vos unités sur le terrain gagnent +{n} Attaque jusqu’à la fin du prochain tour.",
  "Wenn sie ins Spiel kommt, erhalten deine Einheiten auf dem Feld +{n} Angriff bis zum Ende der nächsten Runde.",
  "Al entrar en juego, tus unidades en el campo ganan +{n} de Ataque hasta el final de la siguiente ronda.",
  "Quando entra in gioco, le tue unità sul campo ottengono +{n} Attacco fino alla fine del prossimo round.",
  "Ao entrar em jogo, as tuas unidades no campo ganham +{n} de Ataque até ao fim da próxima ronda.",
  "Pagpasok nito sa laro, may +{n} Atake ang mga unit mo sa larangan hanggang matapos ang susunod na round.",
  "இது ஆட்டத்தில் நுழையும்போது, களத்திலுள்ள உன் அலகுகள் அடுத்த சுற்றின் முடிவு வரை +{n} தாக்குதல் பெறும்.",
  "Saat masuk ke permainan, unitmu di lapangan mendapat +{n} Serangan sampai akhir ronde berikutnya.",
  "登场时，你场上的单位攻击+{n}，持续到下一回合结束。",
  "登場時，你場上的單位攻擊+{n}，持續到下一回合結束。",
  "登場時、場にいる味方ユニットは次のラウンドの終わりまで攻撃+{n}。",
  "등장할 때, 필드의 아군 유닛은 다음 라운드가 끝날 때까지 공격 +{n}."],
}
assert all(len(v) == len(CODES) for v in T.values())
ph = lambda s: sorted(set(re.findall(r'\{\w+\}', s)))
assert all(ph(k) == ph(t) for k, v in T.items() for t in v)
# Strings whose English changed (owner 15:09 / 15:15): the old key's translation carried over, edited the same way in every pack.
ATK = {'fr': 'Attaque', 'de': 'Angriff', 'es': 'Ataque', 'it': 'Attacco', 'pt': 'Ataque', 'tl': 'Atake', 'ta': 'தாக்குதல்', 'id': 'Serangan', 'zh-Hans': '攻击', 'zh-Hant': '攻擊', 'ja': '攻撃', 'ko': '공격'}
def _banner(t, code):
    assert '+{n}/+{n}' in t; return t.replace('+{n}/+{n}', ('+{n} ' + ATK[code]) if code not in ('zh-Hans', 'zh-Hant', 'ja', 'ko') else (ATK[code] + '+{n}'))
def _product(t, code):
    assert '+ {s})' in t; return t.replace('+ {s})', '+ {s}×|{s}|)')
def _intro(t, code):
    u, n = re.subn(r'\(([^()]*?) × ([^()]*?) \+ ([^()]*?)\) ≤ \(N/3\)²', lambda m: '(%s × %s + %s × |%s|) ≤ (N/3)²' % (m.group(1), m.group(2), m.group(3), m.group(3)), t); assert n == 1, (code, t); return u
def _formula(t, code):
    u, n = re.subn(r'² \+ ([^{}+]+?) \+ \{mc\}', lambda m: '² + {rt}×' + m.group(1) + ' + {mc}', t); assert n == 1, (code, t); return u
RENAME = [
  ("Your other units have +{n}/+{n} while it lives.", "Your other units have +{n} Attack while it lives.", _banner),
  ("Product: ({a}×{h} + {s}){m} = {x} {op} (N/3)² = {n2} {mark}", "Product: ({a}×{h} + {s}×|{s}|){m} = {x} {op} (N/3)² = {n2} {mark}", _product),
  ("A card passes when both hold: Stats (2×Attack + Health + Skills) ≤ N and Product (Attack × Health + Skills) ≤ (N/3)². Level is the level the card starts at (Base and quest cards 0, rewards 1).",
   "A card passes when both hold: Stats (2×Attack + Health + Skills) ≤ N and Product (Attack × Health + Skills × |Skills|) ≤ (N/3)². Level is the level the card starts at (Base and quest cards 0, rewards 1).", _intro),
  ("N = (Base + Level/{lin}) × (1 + Level/{div}); Level 0: Base − {zero}. Base = {base} + Rarity + {w}×Wait + {w2}×Wait² + {l}×Lumber + {l2}×Lumber² + Ritual + {mc}×Map.",
   "N = (Base + Level/{lin}) × (1 + Level/{div}); Level 0: Base − {zero}. Base = {base} + Rarity + {w}×Wait + {w2}×Wait² + {l}×Lumber + {l2}×Lumber² + {rt}×Ritual + {mc}×Map.", _formula),
]
if __name__ == '__main__':
    for i, code in enumerate(CODES):
        path = os.path.join(ROOT, 'lang', code + '.json')
        items = list((json.load(open(path, encoding='utf-8')) if os.path.exists(path) else {}).items())
        for old, new, f in RENAME:
            j = next((j for j, (k, _) in enumerate(items) if k == old), None)
            if j is None: continue
            t = f(items[j][1], code); assert ph(t) == ph(new), (code, t); items[j] = (new, t)
        for en, row in T.items():
            j = next((j for j, (k, _) in enumerate(items) if k == en), None)
            if j is not None: items[j] = (en, row[i]); continue
            items.insert(next((j for j, (k, _) in enumerate(items) if k.lower() > en.lower()), len(items)), (en, row[i]))
        with open(path, 'w', encoding='utf-8') as fh:
            json.dump(dict(items), fh, ensure_ascii=False, indent=1); fh.write('\n')
    print('wrote', len(CODES), 'packs,', len(T), 'strings each')
