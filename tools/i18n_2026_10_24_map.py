#!/usr/bin/env python3
"""Game texts added on 2026-10-24 by package MAP (owner 13:16 #20, 17:01 #3): the small label on a map tile that is not open yet
("Locked for now": the Quest Board before the Notices are open, an NPC offer to open them too early) and the label on the fight the
Ambush stopped. Same rules as i18n_2026_10_23_pg.py: keys are the English as the page translator sees it, a row a pack already has is
left as the pack has it. Tagalog, Tamil, Japanese and Korean deserve a native read.

    python3 tools/i18n_2026_10_24_map.py && python3 tools/i18n_refresh.py
"""
import json, os, re
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
CODES = ['fr', 'de', 'es', 'it', 'pt', 'tl', 'ta', 'id', 'zh-Hans', 'zh-Hant', 'ja', 'ko']
T = {
"Locked for now": ["Verrouillé pour l’instant", "Vorerst gesperrt", "Bloqueado por ahora", "Bloccato per ora", "Bloqueado por agora", "Naka-lock pa sa ngayon", "இப்போதைக்குப் பூட்டப்பட்டுள்ளது", "Terkunci untuk saat ini", "暂时锁定", "暫時鎖定", "今はまだロック中", "지금은 잠겨 있어요"],
"Blocked by the ambush": ["Bloqué par l’embuscade", "Vom Hinterhalt versperrt", "Bloqueado por la emboscada", "Bloccato dall’imboscata", "Bloqueado pela emboscada", "Hinarangan ng ambush", "பதுங்கித் தாக்குதலால் தடுக்கப்பட்டது", "Terhalang penyergapan", "被伏击挡住了", "被伏擊擋住了", "待ち伏せに阻まれている", "매복에 막혀 있어요"],
}
assert all(len(v) == len(CODES) for v in T.values())
ph = lambda s: sorted(set(re.findall(r'\{\w+\}', s)))
assert all(ph(k) == ph(t) for k, v in T.items() for t in v)
if __name__ == '__main__':
    kept = 0
    for i, code in enumerate(CODES):
        path = os.path.join(ROOT, 'lang', code + '.json')
        ui = os.path.join(ROOT, 'lang', 'ui', code + '.json')
        pack = json.load(open(path, encoding='utf-8')) if os.path.exists(path) else {}
        uipack = json.load(open(ui, encoding='utf-8')) if os.path.exists(ui) else {}
        for en, row in T.items():
            if en in pack or en in uipack: kept += 1; continue
            pack[en] = row[i]
        with open(path, 'w', encoding='utf-8') as fh:
            json.dump(pack, fh, ensure_ascii=False, indent=1); fh.write('\n')
    print('wrote', len(CODES), 'packs,', len(T), 'strings each;', kept, 'rows a pack already had were kept')
