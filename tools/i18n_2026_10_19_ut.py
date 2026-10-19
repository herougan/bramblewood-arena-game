#!/usr/bin/env python3
"""Game texts added on 2026-10-19 by package UT (animal tags, Base cards): the Codex's animal filter, the card detail's animal / subtype /
Base chips and their tooltips, and the fifteen subtype labels. Keys are the English, as the page translator sees them; every
{placeholder} is kept. Same caveats as i18n_core.py (Tagalog, Tamil, Japanese and Korean deserve a native read).

    python3 tools/i18n_2026_10_19_ut.py && python3 tools/i18n_refresh.py
"""
import json, os, re
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
CODES = ['fr', 'de', 'es', 'it', 'pt', 'tl', 'ta', 'id', 'zh-Hans', 'zh-Hant', 'ja', 'ko']
T = {
"All animals": ["Tous les animaux", "Alle Tiere", "Todos los animales", "Tutti gli animali", "Todos os animais", "Lahat ng hayop", "அனைத்து விலங்குகளும்",
  "Semua hewan", "所有动物", "所有動物", "すべての動物", "모든 동물"],
"Animal": ["Animal", "Tier", "Animal", "Animale", "Animal", "Hayop", "விலங்கு", "Hewan", "动物", "動物", "動物", "동물"],
"Animal: {animal}": ["Animal : {animal}", "Tier: {animal}", "Animal: {animal}", "Animale: {animal}", "Animal: {animal}", "Hayop: {animal}", "விலங்கு: {animal}",
  "Hewan: {animal}", "动物：{animal}", "動物：{animal}", "動物：{animal}", "동물: {animal}"],
"{subtype}: its body takes the shape of a {animal}": ["{subtype} : son corps prend la forme d'un(e) {animal}", "{subtype}: Sein Körper nimmt die Gestalt von {animal} an",
  "{subtype}: su cuerpo toma la forma de {animal}", "{subtype}: il suo corpo prende la forma di {animal}", "{subtype}: o seu corpo toma a forma de {animal}",
  "{subtype}: anyong {animal} ang katawan nito", "{subtype}: அதன் உடல் {animal} வடிவம் கொள்கிறது", "{subtype}: tubuhnya berwujud {animal}",
  "{subtype}：它的身体化作{animal}的模样", "{subtype}：它的身體化作{animal}的模樣", "{subtype}：その体は{animal}の姿をとる", "{subtype}: 몸이 {animal}의 모습을 하고 있습니다"],
"Base": ["Base", "Basis", "Base", "Base", "Base", "Base", "அடிப்படை", "Dasar", "基础", "基礎", "ベース", "기본"],
"A Base card: earned from skirmish rewards, not card packs": ["Une carte de Base : gagnée en récompense d'escarmouche, pas dans les paquets",
  "Eine Basiskarte: aus Gefechtsbelohnungen, nicht aus Kartenpacks", "Una carta Base: se gana como recompensa de escaramuza, no en sobres",
  "Una carta Base: si ottiene dalle ricompense delle schermaglie, non dalle bustine", "Uma carta Base: ganha em recompensas de escaramuça, não em pacotes",
  "Isang Base card: nakukuha sa gantimpala ng labanan, hindi sa card pack", "அடிப்படை அட்டை: சிறு சண்டை வெகுமதிகளில் கிடைக்கும், அட்டைப் பொதிகளில் அல்ல",
  "Kartu Dasar: didapat dari hadiah pertempuran, bukan dari paket kartu", "基础卡：来自小规模战斗奖励，而非卡包", "基礎卡：來自小規模戰鬥獎勵，而非卡包",
  "ベースカード：小競り合いの報酬で手に入り、カードパックからは出ない", "기본 카드: 전투 보상으로 얻으며, 카드 팩에서는 나오지 않습니다"],
"Ghost": ["Fantôme", "Geist", "Fantasma", "Fantasma", "Fantasma", "Multo", "பேய்", "Hantu", "幽灵", "幽靈", "ゴースト", "유령"],
"Spirit": ["Esprit", "Seele", "Espíritu", "Spirito", "Espírito", "Espiritu", "ஆவி", "Roh", "灵体", "靈體", "精霊", "정령"],
"Elemental": ["Élémentaire", "Elementar", "Elemental", "Elementale", "Elemental", "Elemental", "தனிமம்", "Elemental", "元素", "元素", "エレメンタル", "원소"],
"Undead": ["Mort-vivant", "Untot", "No muerto", "Non morto", "Morto-vivo", "Undead", "இறவாதது", "Mayat hidup", "亡灵", "亡靈", "アンデッド", "언데드"],
"Construct": ["Construct", "Konstrukt", "Constructo", "Costrutto", "Constructo", "Konstrukto", "கட்டமைப்பு உயிரி", "Konstruk", "构装体", "構裝體", "コンストラクト", "구조체"],
"Structure": ["Structure", "Bauwerk", "Estructura", "Struttura", "Estrutura", "Istruktura", "கட்டடம்", "Bangunan", "建筑", "建築", "建造物", "건축물"],
"Fiend": ["Démon", "Unhold", "Demonio", "Demone", "Demónio", "Demonyo", "அரக்கன்", "Iblis", "恶魔", "惡魔", "魔物", "악마"],
"Conjured": ["Invoqué", "Beschworen", "Conjurado", "Evocato", "Conjurado", "Ipinatawag", "அழைக்கப்பட்டது", "Panggilan", "召唤物", "召喚物", "召喚体", "소환체"],
"Plant": ["Plante", "Pflanze", "Planta", "Pianta", "Planta", "Halaman", "தாவரம்", "Tumbuhan", "植物", "植物", "植物", "식물"],
"Fungus": ["Champignon", "Pilz", "Hongo", "Fungo", "Fungo", "Kabute", "பூஞ்சை", "Jamur", "真菌", "真菌", "キノコ", "버섯"],
"Mythic": ["Mythique", "Mythisch", "Mítico", "Mitico", "Mítico", "Mitiko", "புராண உயிரி", "Mitos", "神话生物", "神話生物", "神話", "신화"],
"Changeling": ["Changelin", "Wechselbalg", "Cambiante", "Mutaforma", "Metamorfo", "Changeling", "உருமாறி", "Pengubah wujud", "变形者", "變形者", "取り替え子", "체인질링"],
"Were-beast": ["Garou", "Werwesen", "Licántropo", "Mannaro", "Lobisomem", "Aswang na hayop", "உருமாறும் விலங்கு", "Manusia jadi-jadian", "兽化者", "獸化者", "獣人", "수인"],
"Mutant": ["Mutant", "Mutant", "Mutante", "Mutante", "Mutante", "Mutante", "திடீர்மாற்ற உயிரி", "Mutan", "变异体", "變異體", "ミュータント", "돌연변이"],
"Glitch": ["Bug", "Glitch", "Fallo", "Glitch", "Falha", "Glitch", "கோளாறு", "Glitch", "故障", "故障", "バグ", "글리치"],
}
assert all(len(v) == len(CODES) for v in T.values()), [k for k, v in T.items() if len(v) != len(CODES)]
ph = lambda s: sorted(set(re.findall(r'\{\w+\}', s)))
assert all(ph(k) == ph(t) for k, v in T.items() for t in v), [(k, t) for k, v in T.items() for t in v if ph(k) != ph(t)]
if __name__ == '__main__':
    for i, code in enumerate(CODES):
        path = os.path.join(ROOT, 'lang', code + '.json')
        pack = json.load(open(path, encoding='utf-8')) if os.path.exists(path) else {}
        for en, row in T.items(): pack[en] = row[i]
        with open(path, 'w', encoding='utf-8') as fh:
            json.dump(pack, fh, ensure_ascii=False, indent=1); fh.write('\n')  # the pack's own order kept (new keys at the end)
    print('wrote', len(CODES), 'packs,', len(T), 'strings each')
