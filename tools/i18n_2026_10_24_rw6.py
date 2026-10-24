#!/usr/bin/env python3
"""Game texts added on 2026-10-24 by package RW6: the tip of a PRO fight's node on the map in Admin Mode.
Tagalog, Tamil, Japanese and Korean deserve a native read.   python3 tools/i18n_2026_10_24_rw6.py"""
import json, os, re
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
CODES = ['fr', 'de', 'es', 'it', 'pt', 'tl', 'ta', 'id', 'zh-Hans', 'zh-Hant', 'ja', 'ko']
T = {
"{key}: Admin test fight, no rewards. Tap to start.": [
 "{key} : combat de test Admin, sans récompenses. Touche pour lancer.",
 "{key}: Admin-Testkampf, keine Belohnungen. Tippen zum Starten.",
 "{key}: combate de prueba de Admin, sin recompensas. Toca para empezar.",
 "{key}: scontro di prova Admin, senza ricompense. Tocca per iniziare.",
 "{key}: combate de teste de Admin, sem recompensas. Toque para começar.",
 "{key}: pansubok na laban ng Admin, walang gantimpala. I-tap para magsimula.",
 "{key}: நிர்வாகி சோதனைப் போர், பரிசுகள் இல்லை. தொட்டுத் தொடங்கு.",
 "{key}: pertarungan uji Admin, tanpa hadiah. Ketuk untuk mulai.",
 "{key}：管理员测试战斗，没有奖励。点按开始。",
 "{key}：管理員測試戰鬥，沒有獎勵。點按開始。",
 "{key}：管理者のテスト戦、報酬なし。タップで開始。",
 "{key}: 관리자 테스트 전투, 보상 없음. 눌러서 시작해요."],
}
def dump(path, d):
    with open(path, 'w', encoding='utf-8') as fh:
        json.dump(d, fh, ensure_ascii=False, indent=1); fh.write('\n')
ph = lambda s: sorted(set(re.findall(r'\{\w+\}', s)))
for i, code in enumerate(CODES):
    path = os.path.join(ROOT, 'lang', code + '.json'); pack = json.load(open(path, encoding='utf-8'))
    for en, row in T.items():
        assert ph(en) == ph(row[i]), (code, en)
        if en not in pack: pack[en] = row[i]
    dump(path, pack)
print('wrote', len(CODES), 'packs')
