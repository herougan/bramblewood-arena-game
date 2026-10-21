#!/usr/bin/env python3
"""Game texts added on 2026-10-21 by package TX (types, taxonomy and filters): the Codex's type filter groups (Habitats / Animal types /
Other types), its phylum and archetype labels, the sorts (Cost ... Battle rating, each high to low or low to high), the skill picker's
skill groups and their names. Keys are the English, as the page translator sees them. A row a pack already has ("Filters", "Lumber",
"Stone", "Healing" ...) is left as the pack has it. Same caveats as i18n_core.py (Tagalog, Tamil, Japanese and Korean deserve a native
read).

    python3 tools/i18n_2026_10_21_tx.py && python3 tools/i18n_refresh.py
"""
import json, os
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
CODES = ['fr', 'de', 'es', 'it', 'pt', 'tl', 'ta', 'id', 'zh-Hans', 'zh-Hant', 'ja', 'ko']
T = {
"All types": ["Tous les types", "Alle Typen", "Todos los tipos", "Tutti i tipi", "Todos os tipos", "Lahat ng uri", "அனைத்து வகைகளும்", "Semua tipe", "全部类型", "全部類型", "すべてのタイプ", "모든 유형"],
"Habitats": ["Habitats", "Lebensräume", "Hábitats", "Habitat", "Habitats", "Mga tirahan", "வாழிடங்கள்", "Habitat", "栖息地", "棲息地", "生息地", "서식지"],
"Animal types": ["Types d’animaux", "Tiertypen", "Tipos de animales", "Tipi di animali", "Tipos de animais", "Mga uri ng hayop", "விலங்கு வகைகள்", "Tipe hewan", "动物类型", "動物類型", "動物のタイプ", "동물 유형"],
"Other types": ["Autres types", "Andere Typen", "Otros tipos", "Altri tipi", "Outros tipos", "Iba pang uri", "பிற வகைகள்", "Tipe lain", "其他类型", "其他類型", "その他のタイプ", "기타 유형"],
"Type": ["Type", "Typ", "Tipo", "Tipo", "Tipo", "Uri", "வகை", "Tipe", "类型", "類型", "タイプ", "유형"],
"Phylum": ["Embranchement", "Stamm", "Filo", "Phylum", "Filo", "Phylum", "தொகுதி", "Filum", "门类", "門類", "門", "문"],
"All phyla": ["Tous les embranchements", "Alle Stämme", "Todos los filos", "Tutti i phyla", "Todos os filos", "Lahat ng phylum", "அனைத்துத் தொகுதிகளும்", "Semua filum", "全部门类", "全部門類", "すべての門", "모든 문"],
"Archetype": ["Archétype", "Archetyp", "Arquetipo", "Archetipo", "Arquétipo", "Archetype", "முன்மாதிரி", "Arketipe", "原型", "原型", "アーキタイプ", "아키타입"],
"All archetypes": ["Tous les archétypes", "Alle Archetypen", "Todos los arquetipos", "Tutti gli archetipi", "Todos os arquétipos", "Lahat ng archetype", "அனைத்து முன்மாதிரிகளும்", "Semua arketipe", "全部原型", "全部原型", "すべてのアーキタイプ", "모든 아키타입"],
"Sort: Cost": ["Trier : coût", "Sortieren: Kosten", "Ordenar: coste", "Ordina: costo", "Ordenar: custo", "Ayusin: Halaga", "வரிசை: செலவு", "Urutkan: Biaya", "排序：费用", "排序：費用", "並べ替え：コスト", "정렬: 비용"],
"Sort: Wait": ["Trier : attente", "Sortieren: Warten", "Ordenar: espera", "Ordina: attesa", "Ordenar: espera", "Ayusin: Hintay", "வரிசை: காத்திருப்பு", "Urutkan: Tunggu", "排序：等待", "排序：等待", "並べ替え：待機", "정렬: 대기"],
"Sort: Attack": ["Trier : attaque", "Sortieren: Angriff", "Ordenar: ataque", "Ordina: attacco", "Ordenar: ataque", "Ayusin: Atake", "வரிசை: தாக்குதல்", "Urutkan: Serangan", "排序：攻击", "排序：攻擊", "並べ替え：攻撃", "정렬: 공격"],
"Sort: Health": ["Trier : santé", "Sortieren: Leben", "Ordenar: salud", "Ordina: salute", "Ordenar: vida", "Ayusin: Buhay", "வரிசை: உயிர்", "Urutkan: Nyawa", "排序：生命", "排序：生命", "並べ替え：体力", "정렬: 체력"],
"Sort: Rarity": ["Trier : rareté", "Sortieren: Seltenheit", "Ordenar: rareza", "Ordina: rarità", "Ordenar: raridade", "Ayusin: Pambihira", "வரிசை: அரிதுத்தன்மை", "Urutkan: Kelangkaan", "排序：稀有度", "排序：稀有度", "並べ替え：レア度", "정렬: 희귀도"],
"Sort: Level": ["Trier : niveau", "Sortieren: Stufe", "Ordenar: nivel", "Ordina: livello", "Ordenar: nível", "Ayusin: Antas", "வரிசை: நிலை", "Urutkan: Level", "排序：等级", "排序：等級", "並べ替え：レベル", "정렬: 레벨"],
"Sort: Battle rating": ["Trier : cote de combat", "Sortieren: Kampfwert", "Ordenar: valor de combate", "Ordina: valore di battaglia", "Ordenar: valor de combate", "Ayusin: Battle rating", "வரிசை: போர் மதிப்பீடு", "Urutkan: Nilai tempur", "排序：战力", "排序：戰力", "並べ替え：戦力", "정렬: 전투력"],
"Sort: Phylum": ["Trier : embranchement", "Sortieren: Stamm", "Ordenar: filo", "Ordina: phylum", "Ordenar: filo", "Ayusin: Phylum", "வரிசை: தொகுதி", "Urutkan: Filum", "排序：门类", "排序：門類", "並べ替え：門", "정렬: 문"],
"Sort: Advancement": ["Trier : progression", "Sortieren: Fortschritt", "Ordenar: progreso", "Ordina: avanzamento", "Ordenar: progresso", "Ayusin: Pag-usad", "வரிசை: முன்னேற்றம்", "Urutkan: Kemajuan", "排序：进度", "排序：進度", "並べ替え：進行順", "정렬: 진행도"],
"High to low": ["Du plus haut au plus bas", "Absteigend", "De mayor a menor", "Dal più alto", "Do maior ao menor", "Mataas pababa", "அதிகத்திலிருந்து குறைவுக்கு", "Tinggi ke rendah", "从高到低", "從高到低", "高い順", "높은 순"],
"Low to high": ["Du plus bas au plus haut", "Aufsteigend", "De menor a mayor", "Dal più basso", "Do menor ao maior", "Mababa pataas", "குறைவிலிருந்து அதிகத்துக்கு", "Rendah ke tinggi", "从低到高", "從低到高", "低い順", "낮은 순"],
"Skill groups": ["Groupes de compétences", "Fähigkeitsgruppen", "Grupos de habilidades", "Gruppi di abilità", "Grupos de habilidades", "Mga pangkat ng kakayahan", "திறன் குழுக்கள்", "Kelompok kemampuan", "技能组", "技能組", "スキルグループ", "스킬 그룹"],
"A group shows every card with any skill in it.": ["Un groupe montre chaque carte qui a l’une de ses compétences.", "Eine Gruppe zeigt jede Karte mit einer ihrer Fähigkeiten.", "Un grupo muestra cada carta con alguna de sus habilidades.", "Un gruppo mostra ogni carta con una delle sue abilità.", "Um grupo mostra cada carta com alguma das suas habilidades.", "Ipinapakita ng pangkat ang bawat card na may alinman sa mga kakayahan nito.", "ஒரு குழு அதன் ஏதேனும் ஒரு திறன் உள்ள ஒவ்வொரு அட்டையையும் காட்டும்.", "Kelompok menampilkan setiap kartu yang punya salah satu kemampuannya.", "技能组会显示拥有其中任一技能的所有卡牌。", "技能組會顯示擁有其中任一技能的所有卡牌。", "グループは、そのスキルのどれかを持つカードをすべて表示します。", "그룹은 그 안의 스킬 중 하나라도 가진 카드를 모두 보여 줘요."],
"Resources": ["Ressources", "Ressourcen", "Recursos", "Risorse", "Recursos", "Mga yaman", "வளங்கள்", "Sumber daya", "资源", "資源", "資源", "자원"],
"Damage": ["Dégâts", "Schaden", "Daño", "Danni", "Dano", "Pinsala", "சேதம்", "Kerusakan", "伤害", "傷害", "ダメージ", "피해"],
"Movement": ["Mouvement", "Bewegung", "Movimiento", "Movimento", "Movimento", "Paggalaw", "இயக்கம்", "Gerakan", "移动", "移動", "移動", "이동"],
"Defense": ["Défense", "Verteidigung", "Defensa", "Difesa", "Defesa", "Depensa", "பாதுகாப்பு", "Pertahanan", "防御", "防禦", "防御", "방어"],
"Day and night": ["Jour et nuit", "Tag und Nacht", "Día y noche", "Giorno e notte", "Dia e noite", "Araw at gabi", "பகலும் இரவும்", "Siang dan malam", "昼夜", "晝夜", "昼と夜", "낮과 밤"],
"Tide and water": ["Marée et eau", "Gezeiten und Wasser", "Marea y agua", "Marea e acqua", "Maré e água", "Alon at tubig", "அலையும் நீரும்", "Pasang dan air", "潮汐与水", "潮汐與水", "潮と水", "조수와 물"],
"Cards and hand": ["Cartes et main", "Karten und Hand", "Cartas y mano", "Carte e mano", "Cartas e mão", "Mga card at kamay", "அட்டைகளும் கையும்", "Kartu dan tangan", "卡牌与手牌", "卡牌與手牌", "カードと手札", "카드와 손패"],
}
assert all(len(v) == len(CODES) for v in T.values())

if __name__ == '__main__':
    kept = 0
    for i, code in enumerate(CODES):
        path = os.path.join(ROOT, 'lang', code + '.json')
        pack = json.load(open(path, encoding='utf-8')) if os.path.exists(path) else {}
        for en, row in T.items():
            if en in pack: kept += 1; continue  # the pack's own wording stays
            pack[en] = row[i]
        with open(path, 'w', encoding='utf-8') as fh:
            json.dump(pack, fh, ensure_ascii=False, indent=1); fh.write('\n')
    print('wrote', len(CODES), 'packs,', len(T), 'strings each;', kept, 'rows a pack already had were kept')
