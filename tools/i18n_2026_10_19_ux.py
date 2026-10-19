#!/usr/bin/env python3
"""Game texts added on 2026-10-19 by package UX (owner 21:36, UI notes): the Forge's copies sheet and its summary on the anvil (On the
anvil, All copies, Alt art), the copy-count badge's tooltip, the Codex's card-type chips (Creatures, Structures, Spells, Equipment,
Brambles) and its Base level / My best toggle. The rules for a template row are those of i18n_2026_10_18d.py (every {placeholder}
kept). Keys are the English, as the page translator sees them. A row a pack already has ("Close", "All", "Brambles" in some packs)
is left as the pack has it. The words follow the packs (exemplaire / Exemplar / copia / cópia / kopya / பிரதி / salinan / 张 / 張 /
枚 / 사본; Ronces / Dornen ... for Brambles where a pack had none). Same caveats as i18n_core.py (Tagalog, Tamil, Japanese and Korean
deserve a native read).

    python3 tools/i18n_2026_10_19_ux.py && python3 tools/i18n_refresh.py
"""
import json, os, re
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
CODES = ['fr', 'de', 'es', 'it', 'pt', 'tl', 'ta', 'id', 'zh-Hans', 'zh-Hant', 'ja', 'ko']
T = {
"On the anvil": [
  "Sur l’enclume", "Auf dem Amboss", "En el yunque", "Sull’incudine", "Na bigorna", "Nasa palihan", "பட்டறைக்கல்லில்", "Di landasan",
  "在铁砧上", "在鐵砧上", "金床の上", "모루 위"],
"All copies": [
  "Tous les exemplaires", "Alle Exemplare", "Todas las copias", "Tutte le copie", "Todas as cópias", "Lahat ng kopya", "எல்லாப் பிரதிகளும்", "Semua salinan",
  "全部卡", "全部卡", "すべての1枚", "모든 사본"],
"Alt art": [
  "Illustration alternative", "Alternatives Bild", "Arte alternativo", "Arte alternativa", "Arte alternativa", "Ibang larawan", "மாற்று ஓவியம்", "Seni alternatif",
  "异画", "異畫", "別イラスト", "다른 일러스트"],
"You own {n}: {list}": [
  "Vous en avez {n} : {list}", "Du hast {n}: {list}", "Tienes {n}: {list}", "Ne hai {n}: {list}", "Tens {n}: {list}", "May {n} ka: {list}",
  "உங்களிடம் {n}: {list}", "Kamu punya {n}: {list}", "你有 {n} 张：{list}", "你有 {n} 張：{list}", "{n}枚所持：{list}", "{n}장 보유: {list}"],
"Close": [
  "Fermer", "Schließen", "Cerrar", "Chiudi", "Fechar", "Isara", "மூடு", "Tutup", "关闭", "關閉", "閉じる", "닫기"],
"Card type": [
  "Type de carte", "Kartentyp", "Tipo de carta", "Tipo di carta", "Tipo de carta", "Uri ng card", "அட்டை வகை", "Jenis kartu",
  "卡牌类型", "卡牌類型", "カードの種類", "카드 종류"],
"All": [
  "Toutes", "Alle", "Todas", "Tutte", "Todas", "Lahat", "அனைத்தும்", "Semua", "全部", "全部", "すべて", "전체"],
"Creatures": [
  "Créatures", "Kreaturen", "Criaturas", "Creature", "Criaturas", "Mga nilalang", "உயிரினங்கள்", "Makhluk", "生物", "生物", "クリーチャー", "생물"],
"Structures": [
  "Structures", "Bauwerke", "Estructuras", "Strutture", "Estruturas", "Mga istruktura", "கட்டமைப்புகள்", "Bangunan", "建筑", "建築", "建造物", "건축물"],
"Spells": [
  "Sorts", "Zauber", "Hechizos", "Incantesimi", "Feitiços", "Mga spell", "மந்திரங்கள்", "Mantra", "法术", "法術", "呪文", "주문"],
"Equipment": [
  "Équipement", "Ausrüstung", "Equipo", "Equipaggiamento", "Equipamento", "Kagamitan", "உபகரணங்கள்", "Perlengkapan", "装备", "裝備", "装備", "장비"],
"Brambles": [
  "Ronces", "Dornen", "Zarzas", "Rovi", "Silvas", "Mga bramble", "முட்புதர்கள்", "Semak duri", "荆棘", "荊棘", "茨の砦", "가시덤불"],
"No cards of this type yet": [
  "Aucune carte de ce type pour l’instant", "Noch keine Karten dieses Typs", "Aún no hay cartas de este tipo", "Ancora nessuna carta di questo tipo",
  "Ainda não há cartas deste tipo", "Wala pang card na ganitong uri", "இந்த வகை அட்டைகள் இன்னும் இல்லை", "Belum ada kartu jenis ini",
  "暂时没有这类卡牌", "暫時沒有這類卡牌", "この種類のカードはまだありません", "아직 이 종류의 카드가 없어요"],
"Brambles have their own page: this opens it": [
  "Les Ronces ont leur propre page : ceci l’ouvre", "Dornen haben eine eigene Seite: Das hier öffnet sie", "Las Zarzas tienen su propia página: esto la abre",
  "I Rovi hanno una pagina tutta loro: questo la apre", "As Silvas têm a sua própria página: isto abre-a", "May sariling pahina ang mga bramble: bubuksan ito nito",
  "முட்புதர்களுக்குத் தனிப் பக்கம் உண்டு: இது அதைத் திறக்கும்", "Semak duri punya halaman sendiri: ini membukanya",
  "荆棘有自己的页面：点这里打开", "荊棘有自己的頁面：點這裡打開", "茨の砦には専用のページがあります。ここから開けます", "가시덤불은 전용 페이지가 있어요. 여기서 열려요"],
"Card level": [
  "Niveau des cartes", "Kartenstufe", "Nivel de las cartas", "Livello delle carte", "Nível das cartas", "Antas ng card", "அட்டை நிலை", "Level kartu",
  "卡牌等级", "卡牌等級", "カードのレベル", "카드 레벨"],
"Base level": [
  "Niveau de base", "Grundstufe", "Nivel base", "Livello base", "Nível base", "Panimulang antas", "அடிப்படை நிலை", "Level dasar",
  "初始等级", "初始等級", "基本レベル", "기본 레벨"],
"My best": [
  "Mon meilleur", "Mein bestes", "Mi mejor", "Il mio migliore", "O meu melhor", "Pinakamagaling ko", "என் சிறந்தது", "Terbaikku",
  "我的最高", "我的最高", "自分の最高", "내 최고"],
"Show each card at its starting level, or at the highest level you own": [
  "Afficher chaque carte à son niveau de départ, ou au plus haut niveau que vous possédez",
  "Jede Karte auf ihrer Anfangsstufe zeigen oder auf der höchsten Stufe, die du besitzt",
  "Muestra cada carta en su nivel inicial o en el nivel más alto que tienes",
  "Mostra ogni carta al suo livello iniziale o al livello più alto che possiedi",
  "Mostra cada carta no seu nível inicial ou no nível mais alto que tens",
  "Ipakita ang bawat card sa panimulang antas nito, o sa pinakamataas na antas na hawak mo",
  "ஒவ்வொரு அட்டையையும் அதன் தொடக்க நிலையில், அல்லது உங்களிடம் உள்ள உயர்ந்த நிலையில் காட்டு",
  "Tampilkan setiap kartu di level awalnya, atau di level tertinggi yang kamu punya",
  "按初始等级显示每张卡，或按你拥有的最高等级显示", "按初始等級顯示每張卡，或按你擁有的最高等級顯示",
  "各カードを初期レベル、または手持ちの最高レベルで表示します", "각 카드를 시작 레벨이나 가지고 있는 가장 높은 레벨로 보여 줘요"],
}
assert all(len(v) == len(CODES) for v in T.values()), [k for k, v in T.items() if len(v) != len(CODES)]
PLURAL = re.compile(r'^\{(s\d?|plural_\w+)\}$')
ph = lambda s: sorted(set(p for p in re.findall(r'\{\w+\}', s) if not PLURAL.match(p)))
assert all(ph(k) == ph(t) for k, v in T.items() for t in v), [(k, t) for k, v in T.items() for t in v if ph(k) != ph(t)]
if __name__ == '__main__':
    kept = 0
    for i, code in enumerate(CODES):
        path = os.path.join(ROOT, 'lang', code + '.json')
        pack = json.load(open(path, encoding='utf-8')) if os.path.exists(path) else {}
        for en, row in T.items():
            if en in pack: kept += 1; continue  # the pack's own wording stays
            pack[en] = row[i]
        with open(path, 'w', encoding='utf-8') as fh:
            json.dump(pack, fh, ensure_ascii=False, indent=1); fh.write('\n')  # the pack's own order, new rows at the end
    print('wrote', len(CODES), 'packs,', len(T), 'strings each;', kept, 'rows a pack already had were kept')
