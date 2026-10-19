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
# Package UX2 (owner 22:16: "There's no filter in brambles search."): the Brambles page's filter bar.
T.update({
"Search brambles…": [
  "Chercher une ronce…", "Dornen suchen …", "Buscar zarzas…", "Cerca rovi…", "Procurar silvas…", "Maghanap ng bramble…", "முட்புதர்களைத் தேடு…", "Cari semak duri…",
  "搜索荆棘…", "搜尋荊棘…", "茨の砦を検索…", "가시덤불 검색…"],
"Where it's from": [
  "D’où elle vient", "Herkunft", "De dónde viene", "Da dove viene", "De onde vem", "Saan galing", "எங்கிருந்து", "Asalnya", "来源", "來源", "入手先", "출처"],
"Yours to own": [
  "À posséder", "Zum Besitzen", "Para ti", "Da possedere", "Para teres", "Para sa iyo", "உங்களுக்கானவை", "Bisa kamu miliki", "可拥有", "可擁有", "自分のもの", "가질 수 있음"],
"Skirmishes": [
  "Escarmouches", "Gefechte", "Escaramuzas", "Schermaglie", "Escaramuças", "Mga labanan", "சிறு போர்கள்", "Pertempuran", "遭遇战", "遭遇戰", "小競り合い", "교전"],
"Bosses": [
  "Boss", "Bosse", "Jefes", "Boss", "Chefes", "Mga boss", "தலைவர்கள்", "Bos", "首领", "首領", "ボス", "보스"],
"Raids": [
  "Raids", "Raids", "Incursiones", "Raid", "Raides", "Mga raid", "தாக்குதல்கள்", "Raid", "团战", "團戰", "レイド", "레이드"],
"Tower & dungeons": [
  "Tour et donjons", "Turm & Verliese", "Torre y mazmorras", "Torre e dungeon", "Torre e masmorras", "Tore at mga dungeon", "கோபுரம் & நிலவறைகள்", "Menara & penjara bawah tanah",
  "高塔与地牢", "高塔與地牢", "塔とダンジョン", "탑과 던전"],
"Effect": [
  "Effet", "Effekt", "Efecto", "Effetto", "Efeito", "Epekto", "விளைவு", "Efek", "效果", "效果", "効果", "효과"],
"All effects": [
  "Tous les effets", "Alle Effekte", "Todos los efectos", "Tutti gli effetti", "Todos os efeitos", "Lahat ng epekto", "எல்லா விளைவுகளும்", "Semua efek", "全部效果", "全部效果", "すべての効果", "모든 효과"],
"Starting Lumber": [
  "Bois de départ", "Start-Holz", "Madera inicial", "Legname iniziale", "Madeira inicial", "Panimulang Kahoy", "தொடக்க மரம்", "Kayu awal", "初始木材", "初始木材", "初期木材", "시작 목재"],
"Lumber over time": [
  "Bois au fil du temps", "Holz mit der Zeit", "Madera con el tiempo", "Legname nel tempo", "Madeira ao longo do tempo", "Kahoy paglipas ng panahon", "காலப்போக்கில் மரம்", "Kayu seiring waktu",
  "持续木材", "持續木材", "時間で木材", "시간당 목재"],
"First unit's Attack": [
  "Attaque de la 1re unité", "Angriff der 1. Einheit", "Ataque de la 1.ª unidad", "Attacco della 1ª unità", "Ataque da 1.ª unidade", "Atake ng unang unit", "முதல் அலகின் தாக்குதல்", "Serangan unit pertama",
  "首个单位攻击", "首個單位攻擊", "最初のユニットの攻撃", "첫 유닛 공격력"],
"Unit Health": [
  "PV des unités", "Einheiten-Leben", "Salud de las unidades", "Salute delle unità", "Vida das unidades", "Buhay ng unit", "அலகு உயிர்", "Nyawa unit", "单位生命", "單位生命", "ユニットの体力", "유닛 체력"],
"Flyers' Attack": [
  "Attaque des volants", "Angriff der Flieger", "Ataque de voladores", "Attacco dei volanti", "Ataque dos voadores", "Atake ng lumilipad", "பறப்பவைகளின் தாக்குதல்", "Serangan penerbang",
  "飞行单位攻击", "飛行單位攻擊", "飛行ユニットの攻撃", "비행 유닛 공격력"],
"Healing": [
  "Soin", "Heilung", "Curación", "Cura", "Cura", "Paggaling", "குணமாக்கல்", "Penyembuhan", "治疗", "治療", "回復", "회복"],
"Enemy Wait": [
  "Attente ennemie", "Feindliches Warten", "Espera enemiga", "Attesa nemica", "Espera inimiga", "Paghihintay ng kalaban", "எதிரியின் காத்திருப்பு", "Tunggu musuh",
  "敌方等待", "敵方等待", "敵の待機", "적 대기"],
"Ballista bolts": [
  "Carreaux de baliste", "Ballistenbolzen", "Virotes de balista", "Dardi di balista", "Virotes de balista", "Mga palaso ng ballista", "பலிஸ்டா அம்புகள்", "Baut balista",
  "弩炮箭", "弩砲箭", "バリスタの矢", "발리스타 화살"],
"Thorns": [
  "Épines", "Dornen", "Espinas", "Spine", "Espinhos", "Mga tinik", "முட்கள்", "Duri", "荆刺", "荊刺", "棘", "가시"],
"Herb brew": [
  "Infusion d’herbes", "Kräutersud", "Brebaje de hierbas", "Infuso di erbe", "Infusão de ervas", "Halamang-gamot na timpla", "மூலிகைக் கஷாயம்", "Ramuan herbal",
  "草药汤", "草藥湯", "薬草の煎じ薬", "약초 달임"],
"Summons": [
  "Invocations", "Beschwörungen", "Invocaciones", "Evocazioni", "Invocações", "Mga tinatawag", "அழைப்புகள்", "Panggilan", "召唤", "召喚", "召喚", "소환"],
"Tentacle Smack": [
  "Coup de tentacule", "Tentakelschlag", "Golpe de tentáculo", "Colpo di tentacolo", "Golpe de tentáculo", "Hampas ng galamay", "கொடுக்குக் கை அடி", "Tamparan tentakel",
  "触手猛击", "觸手猛擊", "触手の一撃", "촉수 강타"],
"Tail Sweep": [
  "Balayage de queue", "Schwanzfeger", "Barrido de cola", "Spazzata di coda", "Varrida de cauda", "Hampas ng buntot", "வால் வீச்சு", "Sapuan ekor", "尾扫", "尾掃", "尾の薙ぎ払い", "꼬리 휩쓸기"],
"No passive": [
  "Aucun passif", "Kein Passiv", "Sin pasiva", "Nessun passivo", "Sem passiva", "Walang passive", "செயலற்ற திறன் இல்லை", "Tanpa pasif", "无被动", "無被動", "パッシブなし", "패시브 없음"],
"Ownership": [
  "Possession", "Besitz", "Posesión", "Possesso", "Posse", "Pag-aari", "உரிமை", "Kepemilikan", "拥有情况", "擁有情況", "所持", "보유 여부"],
"Owned or not": [
  "Possédées ou non", "Besessen oder nicht", "Tuyas o no", "Possedute o no", "Tuas ou não", "Hawak o hindi", "உள்ளவை அல்லது இல்லாதவை", "Dimiliki atau tidak",
  "拥有或未拥有", "擁有或未擁有", "所持・未所持", "보유 여부 전체"],
"Owned": [
  "Possédées", "Besessen", "Tuyas", "Possedute", "Tuas", "Hawak", "உள்ளவை", "Dimiliki", "已拥有", "已擁有", "所持", "보유"],
"Not owned yet": [
  "Pas encore possédées", "Noch nicht besessen", "Aún no tuyas", "Non ancora possedute", "Ainda não tuas", "Hindi pa hawak", "இன்னும் இல்லாதவை", "Belum dimiliki",
  "尚未拥有", "尚未擁有", "未所持", "아직 없음"],
"Sort brambles": [
  "Trier les ronces", "Dornen sortieren", "Ordenar zarzas", "Ordina rovi", "Ordenar silvas", "Ayusin ang mga bramble", "முட்புதர்களை வரிசைப்படுத்து", "Urutkan semak duri",
  "排序荆棘", "排序荊棘", "茨の砦の並べ替え", "가시덤불 정렬"],
"Sort: Game order": [
  "Tri : ordre du jeu", "Sortierung: Spielreihenfolge", "Orden: del juego", "Ordine: del gioco", "Ordem: do jogo", "Ayos: ayon sa laro", "வரிசை: விளையாட்டு வரிசை", "Urutan: urutan game",
  "排序：游戏顺序", "排序：遊戲順序", "並び：ゲーム順", "정렬: 게임 순서"],
"Sort: Health, high to low": [
  "Tri : PV, du plus haut au plus bas", "Sortierung: Leben, absteigend", "Orden: Salud, de mayor a menor", "Ordine: Salute, dalla più alta", "Ordem: Vida, da maior para a menor",
  "Ayos: Buhay, mataas pababa", "வரிசை: உயிர், அதிகத்திலிருந்து குறைவு", "Urutan: Nyawa, tinggi ke rendah", "排序：生命，从高到低", "排序：生命，從高到低", "並び：体力の高い順", "정렬: 체력 높은 순"],
"Sort: Health, low to high": [
  "Tri : PV, du plus bas au plus haut", "Sortierung: Leben, aufsteigend", "Orden: Salud, de menor a mayor", "Ordine: Salute, dalla più bassa", "Ordem: Vida, da menor para a maior",
  "Ayos: Buhay, mababa pataas", "வரிசை: உயிர், குறைவிலிருந்து அதிகம்", "Urutan: Nyawa, rendah ke tinggi", "排序：生命，从低到高", "排序：生命，從低到高", "並び：体力の低い順", "정렬: 체력 낮은 순"],
"Sort: Name": [
  "Tri : nom", "Sortierung: Name", "Orden: Nombre", "Ordine: Nome", "Ordem: Nome", "Ayos: Pangalan", "வரிசை: பெயர்", "Urutan: Nama", "排序：名称", "排序：名稱", "並び：名前", "정렬: 이름"],
"{n} of {total} brambles": [
  "{n} ronces sur {total}", "{n} von {total} Dornen", "{n} de {total} zarzas", "{n} di {total} rovi", "{n} de {total} silvas", "{n} sa {total} na bramble", "{total} இல் {n} முட்புதர்கள்",
  "{n} dari {total} semak duri", "{total} 个荆棘中的 {n} 个", "{total} 個荊棘中的 {n} 個", "{total}件中{n}件の茨の砦", "가시덤불 {total}개 중 {n}개"],
"No brambles match these filters.": [
  "Aucune ronce ne correspond à ces filtres.", "Keine Dornen passen zu diesen Filtern.", "Ninguna zarza coincide con estos filtros.", "Nessun rovo corrisponde a questi filtri.",
  "Nenhuma silva corresponde a estes filtros.", "Walang bramble na tugma sa mga filter na ito.", "இந்த வடிகட்டிகளுக்குப் பொருந்தும் முட்புதர் இல்லை.", "Tidak ada semak duri yang cocok dengan filter ini.",
  "没有符合这些筛选条件的荆棘。", "沒有符合這些篩選條件的荊棘。", "この条件に合う茨の砦はありません。", "이 필터에 맞는 가시덤불이 없어요."],
"Clear filters": [
  "Effacer les filtres", "Filter zurücksetzen", "Quitar filtros", "Azzera i filtri", "Limpar filtros", "I-clear ang mga filter", "வடிகட்டிகளை அழி", "Hapus filter",
  "清除筛选", "清除篩選", "フィルターを解除", "필터 지우기"],
"{hp} Health a fight ({parts})": [
  "{hp} PV par combat ({parts})", "{hp} Leben pro Kampf ({parts})", "{hp} de Salud por combate ({parts})", "{hp} Salute a combattimento ({parts})", "{hp} de Vida por combate ({parts})",
  "{hp} Buhay bawat laban ({parts})", "ஒரு போருக்கு {hp} உயிர் ({parts})", "{hp} Nyawa per pertarungan ({parts})", "每场战斗 {hp} 生命（{parts}）", "每場戰鬥 {hp} 生命（{parts}）",
  "1戦ごとに体力{hp}（{parts}）", "전투마다 체력 {hp} ({parts})"],
})
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
